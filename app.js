const universe = [
  { ticker: "AMD", company: "Advanced Micro Devices", price: 164.72, gap: 3.1, relVol: 4.8, pmVol: 7800000, float: "large", news: 76, spread: 0.05, atr: 4.6, trend: 0.72 },
  { ticker: "PLTR", company: "Palantir Technologies", price: 128.44, gap: 4.6, relVol: 5.2, pmVol: 9100000, float: "large", news: 81, spread: 0.04, atr: 3.9, trend: 0.74 },
  { ticker: "TSLA", company: "Tesla", price: 182.35, gap: 2.4, relVol: 3.7, pmVol: 6200000, float: "large", news: 68, spread: 0.06, atr: 6.8, trend: 0.64 },
  { ticker: "NVDA", company: "NVIDIA", price: 121.9, gap: 2.8, relVol: 4.2, pmVol: 11000000, float: "large", news: 73, spread: 0.03, atr: 4.2, trend: 0.7 },
  { ticker: "SOFI", company: "SoFi Technologies", price: 8.84, gap: 6.9, relVol: 7.3, pmVol: 14500000, float: "mid", news: 66, spread: 0.02, atr: 0.42, trend: 0.58 },
  { ticker: "RIVN", company: "Rivian Automotive", price: 13.36, gap: 5.5, relVol: 6.1, pmVol: 9800000, float: "mid", news: 62, spread: 0.03, atr: 0.74, trend: 0.6 },
  { ticker: "MARA", company: "MARA Holdings", price: 17.42, gap: 8.2, relVol: 8.6, pmVol: 8400000, float: "mid", news: 58, spread: 0.04, atr: 1.22, trend: 0.57 },
  { ticker: "SMCI", company: "Super Micro Computer", price: 44.26, gap: 7.4, relVol: 6.4, pmVol: 5100000, float: "mid", news: 72, spread: 0.08, atr: 2.8, trend: 0.63 },
  { ticker: "HOOD", company: "Robinhood Markets", price: 62.18, gap: 3.8, relVol: 3.9, pmVol: 2600000, float: "mid", news: 59, spread: 0.04, atr: 2.1, trend: 0.56 },
  { ticker: "COIN", company: "Coinbase", price: 246.3, gap: 4.1, relVol: 4.6, pmVol: 3100000, float: "large", news: 65, spread: 0.09, atr: 9.9, trend: 0.59 }
];

const state = {
  selected: null,
  scanId: 0,
  tradeStatus: "researching",
  picks: [],
  journal: [],
  autoRefresh: false,
  autoTimer: null
};

const defaultGoalTrades = 5;

const qs = (id) => document.getElementById(id);
const money = (value) => `$${Number(value).toFixed(2)}`;
const percent = (value) => `${Number(value).toFixed(1)}%`;

function singaporeNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" }));
}

function getSession(now = singaporeNow()) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes >= 20 * 60 + 45 && minutes < 21 * 60 + 30) {
    return { name: "Pre-open research", note: "Building the watchlist from premarket volume, gap, catalyst, spread, and trend.", factor: 0.92 };
  }
  if (minutes >= 21 * 60 + 30 && minutes <= 23 * 60) {
    return { name: "Opening-hour live", note: "Live mode: picks can change on refresh as momentum, spreads, and risk/reward change.", factor: 1.06 };
  }
  return { name: "After-hours simulation", note: "Market is outside your trading window. Use this view for paper planning and replay.", factor: 0.86 };
}

function jitter(seed, scale) {
  const x = Math.sin(seed * 999.7 + state.scanId * 1.91) * 10000;
  return (x - Math.floor(x) - 0.5) * scale;
}

function scoreStock(stock, index) {
  const session = getSession();
  const gap = Math.max(0, Math.min(stock.gap + jitter(index + 2, 1.4), 12));
  const relVol = Math.max(0.5, stock.relVol + jitter(index + 7, 1.6));
  const news = Math.max(0, Math.min(stock.news + jitter(index + 10, 10), 100));
  const spreadPenalty = stock.spread > 0.07 ? 8 : stock.spread > 0.04 ? 3 : 0;
  const trend = Math.max(0, Math.min(stock.trend + jitter(index + 14, 0.18), 1));
  const momentum = Math.min(100, gap * 5.4 + relVol * 6.6 + news * 0.28 + trend * 25 - spreadPenalty);
  const probability = Math.max(42, Math.min(78, 42 + momentum * 0.36 * session.factor));
  const currentPrice = stock.price * (1 + gap / 100) + jitter(index + 18, stock.price * 0.004);
  const entry = currentPrice + Math.max(stock.spread, currentPrice * 0.0015);
  const stopDistance = Math.max(stock.atr * 0.18, entry * 0.006, stock.spread * 4);
  const targetDistance = stopDistance * (probability > 66 ? 1.45 : 1.25);
  const stop = entry - stopDistance;
  const exit = entry + targetDistance;
  const rewardRisk = targetDistance / stopDistance;
  const targetMove = (exit - entry) / entry;
  const confidence = probability > 68 ? "Goal watch" : probability > 60 ? "Setup watch" : "Wait";

  return {
    ...stock,
    gap,
    relVol,
    news,
    trend,
    score: momentum,
    probability,
    currentPrice,
    entry,
    stop,
    exit,
    rewardRisk,
    targetMove,
    confidence
  };
}

function getInputs() {
  return {
    capital: Number(qs("capital").value || 1000),
    maxLoss: Number(qs("maxLoss").value || 30),
    dailyTarget: Number(qs("dailyTarget").value || 20)
  };
}

function sizeTrade(pick) {
  const { capital, maxLoss } = getInputs();
  const availableCapital = Math.max(0, capital + getDailyPnl());
  const riskPerShare = Math.max(0.01, pick.entry - pick.stop);
  const cashCapShares = Math.floor(availableCapital / pick.entry);
  const riskCapShares = Math.floor(maxLoss / riskPerShare);
  const shares = Math.max(0, Math.min(cashCapShares, riskCapShares));
  const risk = shares * riskPerShare;
  const reward = shares * (pick.exit - pick.entry);
  return { shares, risk, reward, cash: shares * pick.entry };
}

function scan() {
  state.scanId += 1;
  const picks = universe
    .map(scoreStock)
    .filter((pick) => {
      const sizing = sizeTrade(pick);
      const targetPerTrade = getTargetPerGoalTrade();
      return (
        pick.pmVol > 2000000 &&
        pick.relVol >= 3 &&
        pick.gap >= 2 &&
        pick.spread <= 0.1 &&
        pick.news >= 58 &&
        sizing.reward >= targetPerTrade * 0.75
      );
    })
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5);
  state.picks = picks;
  state.selected = state.selected && picks.find((pick) => pick.ticker === state.selected.ticker) ? picks.find((pick) => pick.ticker === state.selected.ticker) : picks[0];
  render(picks);
}

function render(picks) {
  const now = singaporeNow();
  qs("sgTime").textContent = now.toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" });
  renderSummary();
  qs("lastUpdated").textContent = `Updated ${now.toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
  qs("pickList").innerHTML = picks.length ? picks.map(renderPick).join("") : `<article class="pick-card"><strong>No trade</strong><p>Signal is weak today. No stock currently has enough catalyst plus reward potential for your target. Wait for a cleaner setup or stop for the session.</p></article>`;
  document.querySelectorAll("[data-ticker]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selected = picks.find((pick) => pick.ticker === button.dataset.ticker);
      render(picks);
    });
  });
  renderBotPanel();
  renderJournal();
}

function renderPick(pick) {
  const sizing = sizeTrade(pick);
  const active = state.selected?.ticker === pick.ticker ? " active" : "";
  const triggerText = getEntryTrigger(pick);
  const actionText = getActionText(pick, sizing);
  return `
    <article class="pick-card${active}">
      <div>
        <div class="ticker">${pick.ticker}</div>
        <div class="company">${pick.company}</div>
      </div>
      <div class="decision-stack">
        <div class="now-price">
          <span>Now</span>
          <strong>${money(pick.currentPrice)}</strong>
        </div>
        <div class="decision-row">
          <span>Action</span>
          <strong>${actionText}</strong>
        </div>
        <div class="decision-row">
          <span>Entry trigger</span>
          <strong>${triggerText}</strong>
        </div>
      </div>
      <div class="metrics">
        <div class="metric"><span>Entry</span><strong>${money(pick.entry)}</strong></div>
        <div class="metric"><span>Target</span><strong>${money(pick.exit)}</strong></div>
        <div class="metric"><span>Stop</span><strong>${money(pick.stop)}</strong></div>
        <div class="metric"><span>Rel vol</span><strong>${pick.relVol.toFixed(1)}x</strong></div>
        <div class="metric"><span>R:R</span><strong>${pick.rewardRisk.toFixed(2)}</strong></div>
      </div>
      <div class="score">
        <strong>${Math.round(pick.probability)}%</strong>
        <small>Gap ${percent(pick.gap)} - Catalyst ${Math.round(pick.news)}/100 - ${money(sizing.reward)} max</small>
      </div>
      <div>
        <button class="select-btn" data-ticker="${pick.ticker}">${sizing.shares} shares</button>
      </div>
    </article>
  `;
}

function getEntryTrigger(pick) {
  const entryDistance = ((pick.entry - pick.currentPrice) / pick.currentPrice) * 100;
  if (entryDistance <= 0.35 && entryDistance >= -0.2) return "Near entry";
  if (entryDistance > 0.35) return "Wait below entry";
  return "Chasing entry";
}

function getActionText(pick, sizing) {
  if (pick.probability < 60 || sizing.shares < 1) return "Skip";
  if (getEntryTrigger(pick) === "Near entry") return "Watch to enter";
  return "Wait";
}

function renderBotPanel() {
  const pick = state.selected;
  if (!pick) {
    qs("activeTicker").textContent = "No trade";
    qs("tradePlan").innerHTML = `<p>No candidate currently fits your catalyst and target filters.</p>`;
    qs("telegramText").value = "No trade right now. Wait for a cleaner setup.";
    return;
  }
  const sizing = sizeTrade(pick);
  const goalLeft = getGoalLeft();
  const targetPerTrade = getTargetPerGoalTrade();
  const enoughForGoal = sizing.reward >= goalLeft ? "This trade can cover the remaining daily goal if target fills" : sizing.reward >= targetPerTrade ? "This trade fits the default pace of reaching your goal in about 5 trades" : "This trade is below your default 5-trade target pace";
  qs("activeTicker").textContent = pick.ticker;
  qs("tradePlan").innerHTML = `
    <div class="trade-row"><span>Current price</span><strong>${money(pick.currentPrice)}</strong></div>
    <div class="trade-row"><span>Setup score</span><strong>${Math.round(pick.probability)}%</strong></div>
    <div class="trade-row"><span>Catalyst</span><strong>${Math.round(pick.news)}/100</strong></div>
    <div class="trade-row"><span>Entry</span><strong>${money(pick.entry)}</strong></div>
    <div class="trade-row"><span>Exit target</span><strong>${money(pick.exit)}</strong></div>
    <div class="trade-row"><span>Stop loss</span><strong>${money(pick.stop)}</strong></div>
    <div class="trade-row"><span>Size</span><strong>${sizing.shares} shares</strong></div>
    <div class="trade-row"><span>Cash used</span><strong>${money(sizing.cash)}</strong></div>
    <div class="trade-row"><span>Risk / reward</span><strong>${money(sizing.risk)} / ${money(sizing.reward)}</strong></div>
    <p>${enoughForGoal}. The percentage is a setup score, not a promise. Risk/reward means how much you may lose at the stop versus how much you may gain at the target.</p>
  `;
  qs("actualEntry").value = pick.entry.toFixed(2);
  qs("actualExit").value = "";
  qs("actualShares").value = sizing.shares;
  qs("telegramText").value = [
    `Opening-hour paper alert: ${pick.ticker}`,
    `Setup score: ${Math.round(pick.probability)}%`,
    `Plan: buy ${sizing.shares} shares near ${money(pick.entry)}`,
    `Target: ${money(pick.exit)} | Stop: ${money(pick.stop)}`,
    `Risk: ${money(sizing.risk)} | Potential reward: ${money(sizing.reward)}`,
    `Reason: catalyst ${Math.round(pick.news)}/100, gap ${percent(pick.gap)}, current price ${money(pick.currentPrice)}, rel volume ${pick.relVol.toFixed(1)}x.`
  ].join("\n");
}

function getDailyPnl() {
  return state.journal.reduce((sum, trade) => sum + trade.pnl, 0);
}

function getGoalLeft() {
  return Math.max(0, getInputs().dailyTarget - getDailyPnl());
}

function getTargetPerGoalTrade() {
  return getInputs().dailyTarget / defaultGoalTrades;
}

function renderSummary() {
  const pnl = getDailyPnl();
  qs("dailyPnl").textContent = money(pnl);
  qs("dailyPnl").className = pnl >= 0 ? "profit" : "loss";
  qs("goalLeft").textContent = money(getGoalLeft());
  qs("tradesUsed").textContent = String(state.journal.length);
  qs("refreshState").textContent = state.autoRefresh ? "Auto 1 min" : "Manual";
}

function renderJournal() {
  if (!state.journal.length) {
    qs("journalBody").innerHTML = `<tr><td colspan="7" class="empty-row">No paper trades logged yet.</td></tr>`;
    return;
  }
  qs("journalBody").innerHTML = state.journal
    .map((trade, index) => {
      const pnlClass = trade.pnl >= 0 ? "profit" : "loss";
      return `
        <tr>
          <td>${trade.time}</td>
          <td>${trade.ticker}</td>
          <td>${trade.shares}</td>
          <td>${money(trade.entry)}</td>
          <td>${money(trade.exit)}</td>
          <td class="${pnlClass}">${money(trade.pnl)}</td>
          <td><button class="delete-trade" data-delete-trade="${index}">Delete</button></td>
        </tr>
      `;
    })
    .join("");
  document.querySelectorAll("[data-delete-trade]").forEach((button) => {
    button.addEventListener("click", () => deleteTrade(Number(button.dataset.deleteTrade)));
  });
}

function markFilled() {
  state.tradeStatus = "filled";
  if (state.selected) {
    const sizing = sizeTrade(state.selected);
    qs("actualEntry").value = state.selected.entry.toFixed(2);
    qs("actualShares").value = sizing.shares;
  }
  renderBotPanel();
}

function markExited() {
  if (!state.selected) return;
  const entry = Number(qs("actualEntry").value);
  const exit = Number(qs("actualExit").value);
  const shares = Number(qs("actualShares").value);
  if (!entry || !exit || !shares) {
    qs("actualExit").focus();
    return;
  }
  const pnl = (exit - entry) * shares;
  state.journal.push({
    time: singaporeNow().toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" }),
    ticker: state.selected.ticker,
    entry,
    exit,
    shares,
    pnl
  });
  state.tradeStatus = "researching";
  state.selected = null;
  scan();
}

function deleteTrade(index) {
  state.journal.splice(index, 1);
  renderSummary();
  renderJournal();
  scan();
}

function toggleAutoRefresh() {
  state.autoRefresh = !state.autoRefresh;
  qs("autoRefreshBtn").setAttribute("aria-pressed", String(state.autoRefresh));
  qs("autoRefreshBtn").textContent = state.autoRefresh ? "Auto 1 min: on" : "Auto 1 min: off";
  if (state.autoTimer) clearInterval(state.autoTimer);
  state.autoTimer = state.autoRefresh ? setInterval(scan, 60000) : null;
  renderSummary();
}

function resetDay() {
  state.journal = [];
  state.tradeStatus = "researching";
  scan();
}

function copyAlert() {
  qs("telegramText").select();
  document.execCommand("copy");
  qs("copyBtn").textContent = "Copied";
  setTimeout(() => (qs("copyBtn").textContent = "Copy alert"), 1200);
}

function bind(id, eventName, handler) {
  const element = qs(id);
  if (element) element.addEventListener(eventName, handler);
}

["capital", "maxLoss", "dailyTarget"].forEach((id) => bind(id, "input", scan));
bind("refreshBtn", "click", scan);
bind("autoRefreshBtn", "click", toggleAutoRefresh);
bind("paperFillBtn", "click", markFilled);
bind("paperExitBtn", "click", markExited);
bind("copyBtn", "click", copyAlert);
bind("resetDayBtn", "click", resetDay);

scan();
