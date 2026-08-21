"""
Flask web application for M&A deals dashboard.
Displays M&A activity for NASDAQ-100 companies with strategy recommendations.
"""
import os
import json
from datetime import datetime
from flask import Flask, render_template, jsonify, request
from apscheduler.schedulers.background import BackgroundScheduler
from nasdaq100 import get_nasdaq100_tickers
from ma_scraper import MAScraper

app = Flask(__name__)

# Data storage
ma_data_file = 'ma_deals.json'
last_scan_file = 'last_scan.json'

def load_ma_data():
    """Load M&A data from JSON file."""
    if os.path.exists(ma_data_file):
        with open(ma_data_file, 'r') as f:
            return json.load(f)
    return {'deals': [], 'last_updated': None}

def save_ma_data(data):
    """Save M&A data to JSON file."""
    with open(ma_data_file, 'w') as f:
        json.dump(data, f, indent=2)

def scan_for_ma_deals():
    """Scan all NASDAQ-100 stocks for M&A activity."""
    print(f"Starting M&A scan at {datetime.now()}")
    
    scraper = MAScraper()
    tickers = get_nasdaq100_tickers()
    
    if not tickers:
        print("Failed to fetch NASDAQ-100 tickers")
        return
    
    all_deals = []
    
    # Scan each ticker (limit to avoid rate limiting in production)
    for ticker in tickers[:20]:  # Limit for demo; increase for full scan
        print(f"Scanning {ticker}...")
        news_items = scraper.search_news(ticker, days_back=7)
        
        if news_items:
            classified = scraper.classify_strategy(news_items)
            for item in classified:
                deal = {
                    'ticker': ticker,
                    'title': item['news_item']['title'],
                    'url': item['news_item']['url'],
                    'source': item['news_item']['source'],
                    'date': item['news_item']['date'],
                    'strategy': item['strategy'],
                    'reasoning': item['reasoning']
                }
                all_deals.append(deal)
    
    # Save results
    data = {
        'deals': all_deals,
        'last_updated': datetime.now().isoformat(),
        'tickers_scanned': len(tickers)
    }
    save_ma_data(data)
    print(f"Scan complete. Found {len(all_deals)} M&A deals.")
    
    # Check for new alerts
    check_and_send_alerts(all_deals)

def check_and_send_alerts(new_deals):
    """Check for new deals and prepare alerts."""
    last_scan = {}
    if os.path.exists(last_scan_file):
        with open(last_scan_file, 'r') as f:
            last_scan = json.load(f)
    
    previous_deals = last_scan.get('deal_titles', [])
    new_alerts = []
    
    for deal in new_deals:
        if deal['title'] not in previous_deals:
            new_alerts.append(deal)
    
    if new_alerts:
        print(f"\n🚨 ALERT: {len(new_alerts)} new M&A activities detected!")
        for alert in new_alerts:
            print(f"  - {alert['ticker']}: {alert['strategy']}")
            print(f"    {alert['title']}")
            print(f"    {alert['url']}")
    else:
        print("No new M&A activities since last scan.")
    
    # Update last scan
    with open(last_scan_file, 'w') as f:
        json.dump({
            'last_scan': datetime.now().isoformat(),
            'deal_titles': [d['title'] for d in new_deals]
        }, f)

@app.route('/')
def index():
    """Main dashboard page."""
    return render_template('index.html')

@app.route('/api/deals')
def get_deals():
    """API endpoint to get all M&A deals."""
    data = load_ma_data()
    return jsonify(data)

@app.route('/api/deal/<ticker>')
def get_deal_details(ticker):
    """API endpoint to get details for a specific ticker's deals."""
    data = load_ma_data()
    ticker_deals = [d for d in data['deals'] if d['ticker'].upper() == ticker.upper()]
    return jsonify({'ticker': ticker, 'deals': ticker_deals})

@app.route('/api/scan', methods=['POST'])
def trigger_scan():
    """Manually trigger a scan."""
    scan_for_ma_deals()
    return jsonify({'status': 'scan_complete'})

@app.route('/api/alerts')
def get_alerts():
    """Get recent alerts."""
    if os.path.exists(last_scan_file):
        with open(last_scan_file, 'r') as f:
            last_scan = json.load(f)
        return jsonify(last_scan)
    return jsonify({'alerts': []})

if __name__ == '__main__':
    # Create templates directory
    os.makedirs('templates', exist_ok=True)
    
    # Initialize scheduler for weekly scans
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=scan_for_ma_deals,
        trigger='cron',
        day_of_week='mon',
        hour=9,
        minute=0,
        id='weekly_scan',
        replace_existing=True
    )
    scheduler.start()
    
    # Initial scan if no data exists
    if not os.path.exists(ma_data_file):
        print("Running initial scan...")
        scan_for_ma_deals()
    
    # Start Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
