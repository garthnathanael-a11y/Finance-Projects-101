# NASDAQ-100 M&A Deals Tracker

A comprehensive web application for tracking M&A (Mergers & Acquisitions) activity among NASDAQ-100 companies. Designed for traders implementing M&A trading strategies including Merger Arbitrage, Distressed M&A, Hostile Takeover Plays, Spin-Off Investing, and Consolidation Plays.

## Features

### 📊 Dashboard
- Real-time display of all detected M&A activities for NASDAQ-100 stocks
- Strategy classification for each deal with reasoning
- Visual cards showing ticker, strategy type, and news headline
- Click-to-expand modal with full details and source links

### 🔍 Strategy Detection
The system automatically classifies M&A activities into 5 trading strategies:

1. **Merger Arbitrage** - Deal announced with clear terms; capture spread between current price and deal price
2. **Distressed M&A** - Company facing financial difficulties; assets may be undervalued
3. **Hostile Takeover** - Unsolicited bid or activist pressure; potential for premium increase
4. **Spin-Off Investing** - Corporate separation announced; sum-of-parts value opportunity
5. **Consolidation Play** - Industry consolidation trend; scale and market power synergies

### 🔄 Automated Weekly Scans
- Automatically scans all NASDAQ-100 constituents every Monday at 9:00 AM
- Compares against previous scan to detect new activities
- Console alerts for newly detected M&A activities

### 📰 News Sources
Aggregates from multiple financial news sources:
- Google News
- Finviz
- Yahoo Finance
- MarketWatch
- Seeking Alpha

### 🔗 Source Citations
When you click on a stock card:
- All relevant news articles are displayed
- Direct links to original sources provided
- Source name and publication date shown

## Installation

```bash
cd /workspace
pip install -r requirements.txt
```

## Usage

### Start the Web Server
```bash
python app.py
```

The application will:
1. Run an initial scan of NASDAQ-100 stocks
2. Start the Flask web server on `http://localhost:5000`
3. Schedule weekly scans every Monday at 9:00 AM

### Access the Dashboard
Open your browser and navigate to: `http://localhost:5000`

### Manual Scan
Click the "🔄 Scan Now" button on the dashboard to trigger an immediate scan.

## Project Structure

```
/workspace/
├── app.py              # Flask web application
├── nasdaq100.py        # NASDAQ-100 constituents fetcher
├── ma_scraper.py       # M&A news scraper and classifier
├── requirements.txt    # Python dependencies
├── templates/
│   └── index.html      # Dashboard HTML template
├── static/
│   ├── style.css       # Dashboard styles
│   └── app.js          # Frontend JavaScript
└── README.md           # This file
```

## Data Files (Auto-generated)

- `ma_deals.json` - Stores detected M&A deals
- `last_scan.json` - Tracks last scan results for alert comparison

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main dashboard |
| `/api/deals` | GET | Get all M&A deals |
| `/api/deal/<ticker>` | GET | Get deals for specific ticker |
| `/api/scan` | POST | Trigger manual scan |
| `/api/alerts` | GET | Get recent alerts |

## How It Works

1. **Ticker Collection**: Fetches NASDAQ-100 constituents from Wikipedia (with static fallback)
2. **News Scraping**: For each ticker, searches multiple news sources for M&A keywords
3. **Strategy Classification**: Analyzes news headlines to determine appropriate trading strategy
4. **Alert Generation**: Compares new scan results with previous scan to identify new activities
5. **Web Display**: Presents results in an interactive dashboard with clickable cards

## Disclaimer

This tool is for informational purposes only. M&A trading involves significant risk. Always conduct your own due diligence and consult with a financial advisor before making investment decisions.
