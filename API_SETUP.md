# Free API Setup For The Trading Assistant

This app is currently a static GitHub Pages-ready prototype with simulated prices. To use live/free data, add a small backend proxy first. Do not put API keys directly into browser JavaScript because anyone can view them.

## Recommended free-start stack

Use Alpha Vantage first because it has both intraday stock data and news sentiment endpoints on one platform.

- Price data: Alpha Vantage `TIME_SERIES_INTRADAY`
- News/catalyst data: Alpha Vantage `NEWS_SENTIMENT`
- Hosting: GitHub Pages for the frontend plus a free backend such as Cloudflare Workers, Vercel, Netlify Functions, or Render

Official docs:

- https://www.alphavantage.co/documentation/
- https://twelvedata.com/docs
- https://polygon.io/docs/stocks

## Why a backend proxy is needed

GitHub Pages only serves static files. If you paste an API key into `app.js`, the key becomes public. A backend proxy keeps the key in an environment variable and exposes only the data your app needs.

## Example backend endpoint design

Create an endpoint like:

```text
GET /api/scan?symbols=PLTR,SOFI,RIVN,AMD,NVDA
```

It should return normalized data like:

```json
[
  {
    "ticker": "PLTR",
    "company": "Palantir Technologies",
    "currentPrice": 128.44,
    "gap": 4.6,
    "relVol": 5.2,
    "pmVol": 9100000,
    "news": 81,
    "spread": 0.04,
    "atr": 3.9,
    "trend": 0.74
  }
]
```

Then replace the simulated `universe` array in `app.js` with a fetch call to your backend.

## Suggested implementation phases

1. Keep this current static app on GitHub Pages.
2. Create a free Alpha Vantage API key.
3. Add a backend proxy with the key stored as `ALPHA_VANTAGE_API_KEY`.
4. Fetch latest intraday quote data and news sentiment from the proxy.
5. Keep paper trading until the journal proves the setup has an edge.

## Important limitation

Free market-data plans may have request limits, delayed prices, restricted premarket coverage, or incomplete news. For actual opening-hour trading, compare the app's numbers against Webull before entering.
