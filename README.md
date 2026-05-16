# Opening Hour Trade Bot

A browser-based paper-trading assistant for the first hour of the US stock market open, tuned for Singapore time.

## What this is

This is a decision-support tool, not an auto-trading system. It ranks NYSE/NASDAQ candidates using practical opening-hour signals:

- premarket gap
- relative volume
- premarket volume
- news/catalyst score
- spread penalty
- short-term trend
- risk/reward and cash-account position sizing

The app then gives:

- top 5 ranked ideas
- broad watchlist scan, with only the best 5 displayed
- setup score, shown as a probability-style percentage
- entry, exit, and stop prices
- simulated current price
- share count for a cash account
- risk and potential reward based on max loss per trade
- copyable Telegram-style alert text
- manual Webull entry/exit logging
- daily paper-trade P/L and goal tracking

## How to preview locally

Open `index.html` in any browser.

## Trading assumptions

- Market: US stocks, NYSE/NASDAQ
- Time zone: Singapore
- Watch window: 8:45pm-11:00pm SGT
- Trading window: 9:30pm-11:00pm SGT
- Capital: $1,000
- Max loss per trade: $30
- Daily goal: $20
- Account type: cash only, no margin
- Default scoring pace: $20 over about 5 trades
- Commission/platform fee: $0

The local prototype currently scans a simulated 44-stock liquid/momentum watchlist. The live API version should return a larger watchlist from the Worker, then let the frontend rank the top 5.

## Reality check

Making $20 daily from $1,000 means targeting roughly 2% per trading day. That is aggressive and will not be consistent. The goal of this tool is to help you paper trade the same repeatable process for many sessions before using real money.

The current app is not connected to live market data. It uses simulated market-feed behavior so the workflow can be tested first.

## Next build steps

1. Replace simulated quotes with a live market data provider.
2. Add a backend job that starts scanning before market open.
3. Send alerts through a Telegram bot.
4. Store paper-trade results in a journal.
5. Backtest the scoring model against historical intraday data.

## Data provider notes

Free data is usually delayed, limited, or missing full premarket quotes. For serious live alerts, expect to use a paid real-time feed eventually.

See `API_SETUP.md` for the GitHub/free API wiring plan.
