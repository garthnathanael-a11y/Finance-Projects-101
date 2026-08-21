# NASDAQ100 M&A Deals Tracker

A web application to monitor and analyze M&A (Mergers & Acquisitions) deals involving NASDAQ100 companies. Designed for traders implementing strategies like Merger Arbitrage, Distressed M&A, Hostile Takeover Plays, Spin-Off Investing, and Consolidation Plays.

## Features

- **Real-time M&A Deal Monitoring**: Tracks M&A activity for all NASDAQ100 companies
- **Strategy Recommendations**: Automatically suggests trading strategies based on deal characteristics
- **Weekly Refresh**: Automatically updates deal information every Monday at 9 AM
- **Email Alerts**: Notifies you when new M&A activity is detected
- **Source Citations**: Provides links to news articles and sources for each deal
- **Interactive Dashboard**: Beautiful UI with filtering by strategy type

## Installation

```bash
cd ma-deals-tracker
npm install
```

## Usage

### Start the Web Server

```bash
node server.js
```

Then open your browser to `http://localhost:3000`

### Run the Data Refresh Script

```bash
node refresh.js
```

This will:
1. Fetch latest M&A news
2. Identify deals involving NASDAQ100 companies
3. Determine appropriate trading strategies
4. Save deals to `deals.json`
5. Send email alerts for new deals (if configured)
6. Schedule weekly refreshes

### Weekly Automatic Refresh

The refresh script automatically schedules weekly updates every Monday at 9:00 AM using node-cron.

## Configuration

### Email Alerts (Optional)

To enable email alerts, set the following environment variables:

```bash
export EMAIL_USER="your-email@gmail.com"
export EMAIL_PASS="your-app-password"
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export ALERT_EMAIL="your-alert-email@example.com"
```

### Custom NASDAQ100 List

Edit the `NASDAQ100_SYMBOLS` array in `refresh.js` to customize the list of tracked companies.

## API Endpoints

- `GET /api/deals` - Get all M&A deals
- `GET /api/deals/:symbol` - Get deal details for a specific stock symbol
- `GET /api/strategy/:strategy` - Get deals filtered by strategy type

## Trading Strategies

The application identifies and recommends the following strategies:

### 1. Merger Arbitrage
- **When**: Standard announced M&A deals
- **Strategy**: Profit from the spread between current market price and acquisition price
- **Risk**: Regulatory approval, deal completion timeline

### 2. Hostile Takeover Plays
- **When**: Unsolicited bids or management resistance
- **Strategy**: Consider shorting the acquirer or going long on the target
- **Risk**: Deal may not close, premium may not be realized

### 3. Distressed M&A
- **When**: Target company in financial distress or bankruptcy
- **Strategy**: High-risk, high-reward plays on restructuring success
- **Risk**: Complex capital structures, potential losses

### 4. Spin-Off Investing
- **When**: Company separating a business unit
- **Strategy**: Invest in parent and/or spin-off to unlock hidden value
- **Risk**: Market may not value entities favorably initially

### 5. Consolidation Plays
- **When**: Industry consolidation trends
- **Strategy**: Identify remaining targets in consolidating sectors
- **Risk**: Regulatory scrutiny, overpayment

## File Structure

```
ma-deals-tracker/
├── server.js          # Express web server
├── refresh.js         # Data fetching and alert system
├── package.json       # Node.js dependencies
├── deals.json         # Current M&A deals data
├── alerts.json        # Alert history
└── public/
    └── index.html     # Frontend dashboard
```

## Sample Data

The application includes sample M&A deals for demonstration:
- AAPL: AI startup acquisition (Merger Arbitrage)
- NVDA: Semiconductor competitor acquisition (Consolidation Plays)
- TSLA: Hostile takeover attempt (Hostile Takeover Plays)
- META: VR division spin-off (Spin-Off Investing)
- AMZN: Distressed healthcare acquisition (Distressed M&A)

## Production Deployment

For production use, integrate with real news APIs such as:
- Bloomberg Terminal API
- Reuters News API
- RavenPack
- Dow Jones Newswires

Replace the `generateSampleDeals()` function in `refresh.js` with actual API calls.

## License

MIT
