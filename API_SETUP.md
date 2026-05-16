# Detailed Free API Setup

This guide connects the GitHub Pages frontend to a free market-data API through a backend proxy.

Why the proxy matters: your API key must not be placed in `app.js`, because GitHub Pages code is public in the browser.

## What You Will Build

```text
Browser / GitHub Pages app
        |
        v
Cloudflare Worker proxy
        |
        v
Market data API
```

## Recommended Free API

Use **Twelve Data** for the next version.

Why:

- It has a free tier that is more practical than Alpha Vantage's 25 calls/day limit.
- It has quote and time-series endpoints.
- It is easier to test repeated refreshes.

Official links:

- Twelve Data docs: https://twelvedata.com/docs
- Twelve Data pricing: https://twelvedata.com/pricing

Alpha Vantage is still useful for learning/news experiments, but your free key already hit the 25 requests/day limit, so it is not suitable for a 1-minute scanner.

## Why Not Yahoo Price + Finnhub News?

You can use that combination for a personal experiment, but it is not the cleanest foundation for this app.

Yahoo Finance price data:

- Yahoo Finance does not provide a stable official public API for this use case.
- Most "Yahoo API" setups use unofficial endpoints or libraries.
- Unofficial endpoints can break, throttle, require cookies, or fail in a Cloudflare Worker.
- It is better for research/personal scripts than a browser-accessible trading assistant.

Finnhub news:

- Finnhub is a reasonable choice for company news.
- Finnhub also has quote endpoints, so using Finnhub for both quote and news may be simpler than combining Yahoo + Finnhub.

Better free-start options:

```text
Option 1: Twelve Data for price + Finnhub for news
Option 2: Finnhub for both price + news
Option 3: Yahoo/yfinance only for local research scripts, not the live web app
```

Official links:

- Finnhub quote docs: https://finnhub.io/docs/api/quote
- Finnhub company news docs: https://finnhub.io/docs/api/company-news
- Finnhub pricing: https://finnhub.io/pricing

Official docs:

- Alpha Vantage docs: https://www.alphavantage.co/documentation/
- Free key page: https://www.alphavantage.co/support/#api-key
- Premium / realtime note: https://www.alphavantage.co/premium/

## Option A: Twelve Data Setup

### Step 1: Get A Free Twelve Data Key

1. Go to https://twelvedata.com/
2. Create a free account.
3. Go to your API key page.
4. Copy the key.

### Step 2: Add Your Key To Cloudflare

In Cloudflare Worker settings, add a secret named:

```text
TWELVE_DATA_API_KEY
```

### Step 3: Use This Worker Code

Replace your Worker code with this:

```js
const DEFAULT_SYMBOLS = [
  "AMD", "PLTR", "TSLA", "NVDA", "SOFI", "RIVN", "MARA", "SMCI", "HOOD", "COIN",
  "AAPL", "MSFT", "META", "AMZN", "GOOGL", "NFLX", "UBER", "AFRM", "DKNG", "RBLX",
  "SNAP", "SQ", "MU", "INTC", "NIO", "BABA", "F", "GM", "PINS", "SHOP",
  "CRWD", "DDOG", "NET", "PANW", "MRVL", "ARM", "IONQ", "SOUN", "LCID", "WBD"
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/scan") {
      return json({ error: "Use /api/scan" }, 404);
    }

    if (!env.TWELVE_DATA_API_KEY) {
      return json({
        error: "Missing Cloudflare secret",
        fix: "Add TWELVE_DATA_API_KEY under Worker Settings > Variables and Secrets."
      }, 500);
    }

    const requested = url.searchParams.get("symbols");
    const symbols = requested
      ? requested.split(",").map((symbol) => symbol.trim().toUpperCase()).filter(Boolean)
      : DEFAULT_SYMBOLS;

    const limitedSymbols = symbols.slice(0, 40);
    const results = [];
    const debug = [];

    for (const symbol of limitedSymbols) {
      const quoteResult = await getTwelveQuote(symbol, env.TWELVE_DATA_API_KEY);

      debug.push({
        symbol,
        quoteOk: Boolean(quoteResult.quote),
        error: quoteResult.error
      });

      if (quoteResult.quote) {
        const quote = quoteResult.quote;
        results.push({
          ticker: symbol,
          company: symbol,
          currentPrice: quote.price,
          gap: quote.gap,
          relVol: 3,
          pmVol: quote.volume,
          news: 60,
          spread: Math.max(0.01, quote.price * 0.0005),
          atr: Math.max(0.1, quote.price * 0.025),
          trend: quote.changePercent > 0 ? 0.65 : 0.45
        });
      }
    }

    return json({ results, debug }, 200);
  }
};

async function getTwelveQuote(symbol, apiKey) {
  try {
    const endpoint = new URL("https://api.twelvedata.com/quote");
    endpoint.searchParams.set("symbol", symbol);
    endpoint.searchParams.set("apikey", apiKey);

    const response = await fetch(endpoint);
    const data = await response.json();

    if (data.status === "error" || data.code || data.message) {
      return {
        quote: null,
        error: data.message || data.status || "Twelve Data quote error"
      };
    }

    const price = Number(data.close || data.price);
    const open = Number(data.open);
    const previousClose = Number(data.previous_close);
    const volume = Number(data.volume || 0);

    if (!price) {
      return { quote: null, error: "No price returned" };
    }

    const reference = previousClose || open || price;
    const gap = reference ? ((price - reference) / reference) * 100 : 0;
    const changePercent = reference ? gap : 0;

    return {
      quote: {
        price,
        open,
        previousClose,
        gap,
        changePercent,
        volume
      },
      error: null
    };
  } catch (error) {
    return { quote: null, error: error.message };
  }
}

function json(payload, status) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*"
    }
  });
}
```

### Step 4: Test Twelve Data Worker

Open:

```text
https://YOUR-WORKER.workers.dev/api/scan
```

You should see:

```json
{
  "results": [
    {
      "ticker": "PLTR",
      "currentPrice": 123.45
    }
  ],
  "debug": []
}
```

If `results` is empty, check the `debug` section.

This returns the broader watchlist. The frontend then scores everything and displays only the top 5.

Twelve Data's free plan can still hit a per-minute credit limit if you request too many symbols at once. If you see an error like:

```text
You have run out of API credits for the current minute
```

reduce `limitedSymbols` from `symbols.slice(0, 40)` to something like:

```js
const limitedSymbols = symbols.slice(0, 8);
```

The frontend has a fallback: if the Worker returns no usable rows or times out, it will use the built-in simulated 44-stock watchlist so the interface does not go blank.

## Option B: Alpha Vantage Setup

Use this only for experiments or news sentiment because the free quota is very small.

### Step 1: Get Your Free Alpha Vantage Key

1. Go to https://www.alphavantage.co/support/#api-key
2. Enter your name and email.
3. Copy the API key.
4. Keep it private.

### Step 2: Create A Free Cloudflare Worker

1. Create or log in to a Cloudflare account.
2. Go to **Workers & Pages**.
3. Click **Create application**.
4. Choose **Worker**.
5. Name it something like `trade-bot-api`.
6. Deploy the starter Worker.

You will get a URL like:

```text
https://trade-bot-api.yourname.workers.dev
```

### Step 3: Add Your API Key As A Secret

In Cloudflare:

1. Open your Worker.
2. Go to **Settings**.
3. Go to **Variables and Secrets**.
4. Add a secret named:

```text
ALPHA_VANTAGE_API_KEY
```

5. Paste your Alpha Vantage API key as the value.

### Step 4: Replace The Worker Code

Use this Worker code:

```js
const SYMBOLS = ["PLTR", "SOFI", "RIVN", "AMD", "NVDA", "TSLA", "MARA", "SMCI", "HOOD", "COIN"];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/scan") {
      return json({ error: "Use /api/scan" }, 404);
    }

    const requested = url.searchParams.get("symbols");
    const symbols = requested
      ? requested.split(",").map((symbol) => symbol.trim().toUpperCase()).filter(Boolean)
      : SYMBOLS;

    const limitedSymbols = symbols.slice(0, 5);
    const results = [];

    for (const symbol of limitedSymbols) {
      const quote = await getGlobalQuote(symbol, env.ALPHA_VANTAGE_API_KEY);
      const news = await getNewsScore(symbol, env.ALPHA_VANTAGE_API_KEY);

      if (quote) {
        results.push({
          ticker: symbol,
          company: symbol,
          currentPrice: quote.price,
          gap: quote.gap,
          relVol: 3,
          pmVol: quote.volume,
          news,
          spread: Math.max(0.01, quote.price * 0.0005),
          atr: Math.max(0.1, quote.price * 0.025),
          trend: quote.changePercent > 0 ? 0.65 : 0.45
        });
      }
    }

    return json(results, 200);
  }
};

async function getGlobalQuote(symbol, apiKey) {
  const endpoint = new URL("https://www.alphavantage.co/query");
  endpoint.searchParams.set("function", "GLOBAL_QUOTE");
  endpoint.searchParams.set("symbol", symbol);
  endpoint.searchParams.set("apikey", apiKey);

  const response = await fetch(endpoint);
  const data = await response.json();
  const quote = data["Global Quote"];

  if (!quote || !quote["05. price"]) return null;

  const price = Number(quote["05. price"]);
  const previousClose = Number(quote["08. previous close"]);
  const changePercent = Number(String(quote["10. change percent"]).replace("%", ""));

  return {
    price,
    previousClose,
    gap: previousClose ? ((price - previousClose) / previousClose) * 100 : changePercent,
    changePercent,
    volume: Number(quote["06. volume"] || 0)
  };
}

async function getNewsScore(symbol, apiKey) {
  const endpoint = new URL("https://www.alphavantage.co/query");
  endpoint.searchParams.set("function", "NEWS_SENTIMENT");
  endpoint.searchParams.set("tickers", symbol);
  endpoint.searchParams.set("limit", "10");
  endpoint.searchParams.set("apikey", apiKey);

  const response = await fetch(endpoint);
  const data = await response.json();
  const feed = Array.isArray(data.feed) ? data.feed : [];

  if (!feed.length) return 0;

  const tickerItems = feed.flatMap((item) => item.ticker_sentiment || []);
  const relevant = tickerItems.filter((item) => item.ticker === symbol);

  if (!relevant.length) return Math.min(100, 45 + feed.length * 4);

  const averageSentiment =
    relevant.reduce((sum, item) => sum + Number(item.ticker_sentiment_score || 0), 0) / relevant.length;

  return Math.max(0, Math.min(100, 55 + averageSentiment * 80 + feed.length * 2));
}

function json(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*"
    }
  });
}
```

### Step 5: Test The Worker

Open this in your browser, replacing the domain:

```text
https://trade-bot-api.yourname.workers.dev/api/scan?symbols=PLTR,SOFI,RIVN,AMD,NVDA
```

You should see JSON like:

```json
[
  {
    "ticker": "PLTR",
    "currentPrice": 128.44,
    "gap": 2.1,
    "relVol": 3,
    "pmVol": 12345678,
    "news": 66,
    "spread": 0.06,
    "atr": 3.21,
    "trend": 0.65
  }
]
```

If you see an Alpha Vantage rate-limit message, wait and try fewer symbols.

### If You Only See `[]`

`[]` means the Worker is online, but every Alpha Vantage quote request failed or returned no `Global Quote`.

Most common causes:

- The Cloudflare secret is missing or named incorrectly.
- Your Alpha Vantage key is wrong.
- Alpha Vantage returned a rate-limit message.
- Alpha Vantage did not return quote data for the requested symbol.
- The free quota is already used.

First, test Alpha Vantage directly in your browser:

```text
https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=PLTR&apikey=YOUR_ALPHA_KEY
```

If the direct Alpha Vantage URL does not show `"Global Quote"`, the issue is Alpha Vantage/key/quota, not your Worker.

For debugging, temporarily replace the Worker code with this version. It returns per-symbol errors instead of hiding them:

```js
const SYMBOLS = ["PLTR", "SOFI", "RIVN", "AMD", "NVDA"];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/scan") {
      return json({ error: "Use /api/scan" }, 404);
    }

    if (!env.ALPHA_VANTAGE_API_KEY) {
      return json({
        error: "Missing Cloudflare secret",
        fix: "Add ALPHA_VANTAGE_API_KEY under Worker Settings > Variables and Secrets."
      }, 500);
    }

    const requested = url.searchParams.get("symbols");
    const symbols = requested
      ? requested.split(",").map((symbol) => symbol.trim().toUpperCase()).filter(Boolean)
      : SYMBOLS;

    const limitedSymbols = symbols.slice(0, 5);
    const results = [];
    const debug = [];

    for (const symbol of limitedSymbols) {
      const quoteResult = await getGlobalQuote(symbol, env.ALPHA_VANTAGE_API_KEY);
      const newsResult = await getNewsScore(symbol, env.ALPHA_VANTAGE_API_KEY);

      debug.push({
        symbol,
        quoteOk: Boolean(quoteResult.quote),
        quoteError: quoteResult.error,
        alphaKeys: quoteResult.alphaKeys,
        newsOk: Boolean(newsResult.score),
        newsError: newsResult.error
      });

      if (quoteResult.quote) {
        const quote = quoteResult.quote;
        results.push({
          ticker: symbol,
          company: symbol,
          currentPrice: quote.price,
          gap: quote.gap,
          relVol: 3,
          pmVol: quote.volume,
          news: newsResult.score || 0,
          spread: Math.max(0.01, quote.price * 0.0005),
          atr: Math.max(0.1, quote.price * 0.025),
          trend: quote.changePercent > 0 ? 0.65 : 0.45
        });
      }
    }

    return json({ results, debug }, 200);
  }
};

async function getGlobalQuote(symbol, apiKey) {
  try {
    const endpoint = new URL("https://www.alphavantage.co/query");
    endpoint.searchParams.set("function", "GLOBAL_QUOTE");
    endpoint.searchParams.set("symbol", symbol);
    endpoint.searchParams.set("apikey", apiKey);

    const response = await fetch(endpoint);
    const data = await response.json();
    const quote = data["Global Quote"];

    if (!quote || !quote["05. price"]) {
      return {
        quote: null,
        error: data.Note || data.Information || data["Error Message"] || "No Global Quote returned",
        alphaKeys: Object.keys(data)
      };
    }

    const price = Number(quote["05. price"]);
    const previousClose = Number(quote["08. previous close"]);
    const changePercent = Number(String(quote["10. change percent"]).replace("%", ""));

    return {
      quote: {
        price,
        previousClose,
        gap: previousClose ? ((price - previousClose) / previousClose) * 100 : changePercent,
        changePercent,
        volume: Number(quote["06. volume"] || 0)
      },
      error: null,
      alphaKeys: Object.keys(data)
    };
  } catch (error) {
    return { quote: null, error: error.message, alphaKeys: [] };
  }
}

async function getNewsScore(symbol, apiKey) {
  try {
    const endpoint = new URL("https://www.alphavantage.co/query");
    endpoint.searchParams.set("function", "NEWS_SENTIMENT");
    endpoint.searchParams.set("tickers", symbol);
    endpoint.searchParams.set("limit", "10");
    endpoint.searchParams.set("apikey", apiKey);

    const response = await fetch(endpoint);
    const data = await response.json();
    const feed = Array.isArray(data.feed) ? data.feed : [];

    if (!feed.length) {
      return {
        score: 0,
        error: data.Note || data.Information || data["Error Message"] || "No news feed returned"
      };
    }

    const tickerItems = feed.flatMap((item) => item.ticker_sentiment || []);
    const relevant = tickerItems.filter((item) => item.ticker === symbol);

    if (!relevant.length) {
      return { score: Math.min(100, 45 + feed.length * 4), error: null };
    }

    const averageSentiment =
      relevant.reduce((sum, item) => sum + Number(item.ticker_sentiment_score || 0), 0) / relevant.length;

    return {
      score: Math.max(0, Math.min(100, 55 + averageSentiment * 80 + feed.length * 2)),
      error: null
    };
  } catch (error) {
    return { score: 0, error: error.message };
  }
}

function json(payload, status) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*"
    }
  });
}
```

After you paste this debug version, test:

```text
https://YOUR-WORKER.workers.dev/api/scan?symbols=PLTR
```

Start with only one symbol because the free Alpha Vantage quota can be used quickly.

### If It Still Shows Only `[]`

If your browser still shows exactly:

```json
[]
```

then the debug Worker code is not deployed. The debug Worker returns an object like this, never a bare array:

```json
{
  "results": [],
  "debug": []
}
```

Do this quick deployment test:

1. Open your Cloudflare Worker editor.
2. Replace all Worker code temporarily with this:

```js
export default {
  async fetch(request, env) {
    return new Response(JSON.stringify({
      ok: true,
      message: "New Worker code is deployed",
      hasKey: Boolean(env.ALPHA_VANTAGE_API_KEY),
      url: request.url
    }, null, 2), {
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*"
      }
    });
  }
};
```

3. Click **Save and deploy**.
4. Open:

```text
https://YOUR-WORKER.workers.dev/api/scan?symbols=PLTR
```

You should see:

```json
{
  "ok": true,
  "message": "New Worker code is deployed",
  "hasKey": true,
  "url": "..."
}
```

If you do not see that, you are either editing the wrong Worker or Cloudflare has not deployed your latest code.

If `hasKey` is `false`, your secret is missing or incorrectly named. The secret must be named exactly:

```text
ALPHA_VANTAGE_API_KEY
```

## Connect The Frontend

In `app.js`, add this near the top:

```js
const apiUrl = "https://trade-bot-api.yourname.workers.dev/api/scan";
let useLiveData = true;
```

Then replace the start of `scan()` with:

```js
async function scan() {
  state.scanId += 1;

  const sourceUniverse = useLiveData ? await fetchLiveUniverse() : universe;

  const picks = sourceUniverse
    .map(scoreStock)
```

Add this helper:

```js
async function fetchLiveUniverse() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("API request failed");
    const data = await response.json();
    const rows = Array.isArray(data) ? data : data.results;
    return rows?.length ? rows : universe;
  } catch (error) {
    console.warn("Live API failed; falling back to simulated data.", error);
    return universe;
  }
}
```

Because `scan()` becomes async, update the event binding helper to handle async functions normally:

```js
bind("refreshBtn", "click", () => scan());
```

## Publish Frontend To GitHub Pages

1. Create a GitHub repo.
2. Upload:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`
   - `API_SETUP.md`
3. Go to **Settings → Pages**.
4. Set source to your main branch.
5. Open the GitHub Pages URL.

## Paper Test Rules

Before live trading, paper test at least 30 market sessions.

Track:

- win rate
- average win
- average loss
- max losing day
- how often the app says "No trade"
- whether Webull price matches the app price closely enough
- whether the first-hour strategy still works after slippage

## Free API Limits To Expect

Alpha Vantage free is useful for proof-of-concept, but it may not support the speed and freshness needed for real-money opening-hour trading. If the app works well in paper trading, the next upgrade should be a paid/live market data provider.

## What This Error Means

If Alpha Vantage returns:

```json
{
  "Information": "our standard API rate limit is 25 requests per day"
}
```

then your key is valid, but the free daily quota is used up.

This can happen quickly because a scan for 5 symbols can use many calls:

```text
5 symbols x quote endpoint = 5 calls
5 symbols x news endpoint = 5 calls
1 refresh = about 10 calls
```

At 25 calls per day, only a few refreshes can exhaust the free tier.

For free testing, use one of these options:

- Test only 1-2 symbols per day.
- Turn off automatic refresh.
- Cache Worker responses for 15-60 minutes.
- Use Alpha Vantage only for news, and another source for price later.
- Upgrade data provider before real-money live trading.

Also, if you pasted your real API key into a public place, replace it with a new key if Alpha Vantage allows it, or create a fresh Alpha Vantage account/key.
