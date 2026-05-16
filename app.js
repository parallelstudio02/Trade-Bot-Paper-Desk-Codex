const apiUrl = "https://twelvedataapi.angie219.workers.dev/api/scan";
let useLiveData = true;
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
  { ticker: "COIN", company: "Coinbase", price: 246.3, gap: 4.1, relVol: 4.6, pmVol: 3100000, float: "large", news: 65, spread: 0.09, atr: 9.9, trend: 0.59 },
  { ticker: "AAPL", company: "Apple", price: 198.34, gap: 1.3, relVol: 2.4, pmVol: 3900000, float: "large", news: 55, spread: 0.03, atr: 3.1, trend: 0.5 },
  { ticker: "MSFT", company: "Microsoft", price: 482.12, gap: 1.1, relVol: 2.2, pmVol: 2100000, float: "large", news: 61, spread: 0.05, atr: 6.2, trend: 0.52 },
  { ticker: "META", company: "Meta Platforms", price: 618.44, gap: 2.2, relVol: 3.3, pmVol: 1800000, float: "large", news: 69, spread: 0.08, atr: 10.8, trend: 0.66 },
  { ticker: "AMZN", company: "Amazon", price: 221.68, gap: 1.9, relVol: 3.1, pmVol: 3300000, float: "large", news: 64, spread: 0.04, atr: 4.9, trend: 0.61 },
  { ticker: "GOOGL", company: "Alphabet", price: 184.26, gap: 1.7, relVol: 2.9, pmVol: 2500000, float: "large", news: 63, spread: 0.04, atr: 3.8, trend: 0.58 },
  { ticker: "NFLX", company: "Netflix", price: 655.2, gap: 3.3, relVol: 3.6, pmVol: 1100000, float: "large", news: 70, spread: 0.11, atr: 14.6, trend: 0.62 },
  { ticker: "UBER", company: "Uber Technologies", price: 72.42, gap: 4.8, relVol: 5.1, pmVol: 4300000, float: "large", news: 74, spread: 0.04, atr: 2.3, trend: 0.68 },
  { ticker: "AFRM", company: "Affirm", price: 38.72, gap: 7.9, relVol: 7.7, pmVol: 3400000, float: "mid", news: 67, spread: 0.06, atr: 2.4, trend: 0.6 },
  { ticker: "DKNG", company: "DraftKings", price: 42.16, gap: 3.9, relVol: 4.4, pmVol: 2200000, float: "mid", news: 60, spread: 0.04, atr: 1.4, trend: 0.57 },
  { ticker: "RBLX", company: "Roblox", price: 59.28, gap: 5.2, relVol: 5.7, pmVol: 1900000, float: "mid", news: 64, spread: 0.05, atr: 2.2, trend: 0.59 },
  { ticker: "SNAP", company: "Snap", price: 10.88, gap: 8.6, relVol: 8.2, pmVol: 6600000, float: "mid", news: 58, spread: 0.02, atr: 0.62, trend: 0.54 },
  { ticker: "SQ", company: "Block", price: 72.54, gap: 4.2, relVol: 4.9, pmVol: 1700000, float: "mid", news: 66, spread: 0.05, atr: 2.8, trend: 0.61 },
  { ticker: "MU", company: "Micron Technology", price: 118.74, gap: 5.8, relVol: 5.4, pmVol: 5300000, float: "large", news: 75, spread: 0.04, atr: 4.4, trend: 0.7 },
  { ticker: "INTC", company: "Intel", price: 31.26, gap: 3.5, relVol: 4.1, pmVol: 4900000, float: "large", news: 62, spread: 0.03, atr: 1.1, trend: 0.55 },
  { ticker: "NIO", company: "NIO", price: 5.38, gap: 9.4, relVol: 9.1, pmVol: 11800000, float: "mid", news: 57, spread: 0.02, atr: 0.33, trend: 0.51 },
  { ticker: "BABA", company: "Alibaba", price: 83.92, gap: 2.7, relVol: 3.8, pmVol: 2700000, float: "large", news: 60, spread: 0.05, atr: 2.6, trend: 0.54 },
  { ticker: "F", company: "Ford", price: 12.62, gap: 4.4, relVol: 5.9, pmVol: 7200000, float: "large", news: 61, spread: 0.02, atr: 0.42, trend: 0.56 },
  { ticker: "GM", company: "General Motors", price: 48.12, gap: 3.1, relVol: 4.0, pmVol: 2600000, float: "large", news: 59, spread: 0.03, atr: 1.3, trend: 0.52 },
  { ticker: "PINS", company: "Pinterest", price: 36.84, gap: 6.2, relVol: 6.8, pmVol: 2100000, float: "mid", news: 68, spread: 0.04, atr: 1.5, trend: 0.63 },
  { ticker: "SHOP", company: "Shopify", price: 68.94, gap: 4.7, relVol: 5.2, pmVol: 1900000, float: "large", news: 66, spread: 0.05, atr: 2.9, trend: 0.6 },
  { ticker: "CRWD", company: "CrowdStrike", price: 314.52, gap: 3.6, relVol: 4.2, pmVol: 1200000, float: "large", news: 73, spread: 0.08, atr: 9.4, trend: 0.67 },
  { ticker: "DDOG", company: "Datadog", price: 128.18, gap: 4.1, relVol: 4.6, pmVol: 950000, float: "mid", news: 65, spread: 0.06, atr: 4.5, trend: 0.61 },
  { ticker: "NET", company: "Cloudflare", price: 88.36, gap: 5.9, relVol: 5.5, pmVol: 1300000, float: "mid", news: 63, spread: 0.06, atr: 3.6, trend: 0.58 },
  { ticker: "PANW", company: "Palo Alto Networks", price: 342.88, gap: 2.9, relVol: 3.7, pmVol: 1100000, float: "large", news: 71, spread: 0.09, atr: 8.6, trend: 0.63 },
  { ticker: "MRVL", company: "Marvell Technology", price: 76.34, gap: 6.6, relVol: 6.3, pmVol: 2400000, float: "large", news: 70, spread: 0.05, atr: 2.9, trend: 0.66 },
  { ticker: "ARM", company: "Arm Holdings", price: 118.26, gap: 8.1, relVol: 7.1, pmVol: 3100000, float: "mid", news: 76, spread: 0.07, atr: 6.8, trend: 0.69 },
  { ticker: "IONQ", company: "IonQ", price: 28.18, gap: 9.6, relVol: 9.5, pmVol: 4700000, float: "mid", news: 61, spread: 0.05, atr: 1.9, trend: 0.57 },
  { ticker: "SOUN", company: "SoundHound AI", price: 8.26, gap: 10.2, relVol: 10.8, pmVol: 9800000, float: "small", news: 58, spread: 0.03, atr: 0.74, trend: 0.53 },
  { ticker: "LCID", company: "Lucid", price: 3.04, gap: 7.1, relVol: 7.9, pmVol: 8900000, float: "mid", news: 56, spread: 0.01, atr: 0.2, trend: 0.48 },
  { ticker: "WBD", company: "Warner Bros Discovery", price: 9.14, gap: 4.9, relVol: 5.6, pmVol: 4100000, float: "large", news: 59, spread: 0.02, atr: 0.36, trend: 0.52 },
  { ticker: "PYPL", company: "PayPal", price: 69.22, gap: 2.8, relVol: 3.9, pmVol: 2400000, float: "large", news: 62, spread: 0.04, atr: 1.9, trend: 0.55 },
  { ticker: "DIS", company: "Disney", price: 103.54, gap: 2.1, relVol: 3.2, pmVol: 1700000, float: "large", news: 64, spread: 0.04, atr: 2.1, trend: 0.54 },
  { ticker: "BA", company: "Boeing", price: 178.62, gap: 3.7, relVol: 4.3, pmVol: 2100000, float: "large", news: 72, spread: 0.07, atr: 5.8, trend: 0.56 },
  { ticker: "WMT", company: "Walmart", price: 96.24, gap: 1.6, relVol: 2.8, pmVol: 1300000, float: "large", news: 58, spread: 0.03, atr: 1.2, trend: 0.5 }
];

const state = {
  selected: null,
  scanId: 0,
  tradeStatus: "researching",
  picks: [],
  journal: [],
  autoRefresh: false,
  autoTimer: null,
  scanSize: universe.length
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

async function fetchLiveUniverse() {
  if (!useLiveData || !apiUrl) return universe;
  try {
    const response = await fetch(apiUrl, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("API request failed");
    const data = await response.json();
    const rows = Array.isArray(data) ? data : data.results;
    const normalized = Array.isArray(rows) ? rows.map(normalizeLiveStock).filter(Boolean) : [];
    if (!normalized.length && data?.debug?.length) {
      console.warn("Live API returned no usable rows.", data.debug.slice(0, 5));
    }
    return normalized.length ? normalized : universe;
  } catch (error) {
    console.warn("Live API failed; falling back to simulated watchlist.", error);
    return universe;
  }
}

function normalizeLiveStock(row) {
  const price = Number(row.currentPrice ?? row.price ?? row.close);
  if (!row?.ticker || !price) return null;
  return {
    ticker: row.ticker,
    company: row.company || row.name || row.ticker,
    price,
    gap: Number(row.gap ?? row.changePercent ?? row.percent_change ?? 0),
    relVol: Number(row.relVol ?? row.relativeVolume ?? 3),
    pmVol: Number(row.pmVol ?? row.volume ?? 0),
    float: row.float || "unknown",
    news: Number(row.news ?? row.newsScore ?? 60),
    spread: Number(row.spread ?? Math.max(0.01, price * 0.0005)),
    atr: Number(row.atr ?? Math.max(0.1, price * 0.025)),
    trend: Number(row.trend ?? 0.55)
  };
}

async function scan() {
  state.scanId += 1;
  const sourceUniverse = await fetchLiveUniverse();
  state.scanSize = sourceUniverse.length;
  const picks = sourceUniverse
    .map(scoreStock)
    .filter((pick) => {
      const sizing = sizeTrade(pick);
      const targetPerTrade = getTargetPerGoalTrade();
      return (
        pick.pmVol > 500000 &&
        pick.relVol >= 3 &&
        Math.abs(pick.gap) >= 0.5 &&
        pick.spread <= 0.1 &&
        pick.news >= 50 &&
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
      <div class="pick-main">
        <div class="identity">
          <div class="ticker">${pick.ticker}</div>
          <div class="company">${pick.company}</div>
        </div>
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
      <div class="pick-details">
        <div class="metrics">
          <div class="metric"><span>Entry</span><strong>${money(pick.entry)}</strong></div>
          <div class="metric"><span>Target</span><strong>${money(pick.exit)}</strong></div>
          <div class="metric"><span>Stop</span><strong>${money(pick.stop)}</strong></div>
          <div class="metric"><span>Rel vol</span><strong>${pick.relVol.toFixed(1)}x</strong></div>
          <div class="metric"><span>R:R</span><strong>${pick.rewardRisk.toFixed(2)}</strong></div>
        </div>
        <div class="score">
          <strong>${Math.round(pick.probability)}%</strong>
          <small>Gap ${percent(pick.gap)}</small>
          <small>Catalyst ${Math.round(pick.news)}/100</small>
          <small>${money(sizing.reward)} max</small>
        </div>
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
  qs("scanCount").textContent = `${state.scanSize} stocks`;
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
  state.autoTimer = state.autoRefresh ? setInterval(() => scan(), 60000) : null;
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

["capital", "maxLoss", "dailyTarget"].forEach((id) => bind(id, "input", () => scan()));
bind("refreshBtn", "click", () => scan());
bind("autoRefreshBtn", "click", toggleAutoRefresh);
bind("paperFillBtn", "click", markFilled);
bind("paperExitBtn", "click", markExited);
bind("copyBtn", "click", copyAlert);
bind("resetDayBtn", "click", resetDay);

scan();
