"""
M&A News Scraper for NASDAQ-100 companies.
Scrapes financial news sources for M&A related activities.
"""
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import re


class MAScraper:
    """Scraper for M&A news and announcements."""
    
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        self.ma_keywords = [
            'merger', 'acquisition', 'acquire', 'acquired', 'takeover', 
            'buyout', 'spin-off', 'spinoff', 'divestiture', 'divest',
            'hostile takeover', 'tender offer', 'goes private', 'going private',
            'strategic alternative', 'exploring sale', 'sale process',
            'merge with', 'combine with', 'deal to buy', 'agree to acquire'
        ]
        
    def search_news(self, ticker, days_back=7):
        """
        Search for M&A news for a specific ticker.
        Returns list of news items with M&A activity.
        """
        news_items = []
        
        # Use multiple sources for better coverage
        sources = [
            self._search_finviz,
            self._search_yahoo_finance,
            self._search_google_news
        ]
        
        for source_func in sources:
            try:
                results = source_func(ticker, days_back)
                if results:
                    news_items.extend(results)
            except Exception as e:
                print(f"Error in {source_func.__name__} for {ticker}: {e}")
                
        return news_items
    
    def _search_finviz(self, ticker, days_back=7):
        """Search Finviz for M&A news."""
        news_items = []
        
        url = f"https://finviz.com/quote.ashx?t={ticker}"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'lxml')
                
                # Find news table
                news_table = soup.find('table', {'class': 'fullview-news-outer'})
                if news_table:
                    rows = news_table.find_all('tr')
                    
                    for row in rows[:10]:
                        link_elem = row.find('a', href=True)
                        if link_elem:
                            title = link_elem.text.strip()
                            href = link_elem.get('href', '')
                            
                            if any(keyword.lower() in title.lower() for keyword in self.ma_keywords):
                                news_items.append({
                                    'title': title,
                                    'url': href,
                                    'source': 'Finviz',
                                    'date': datetime.now().strftime('%Y-%m-%d'),
                                    'ticker': ticker
                                })
        except Exception as e:
            print(f"Finviz error for {ticker}: {e}")
            
        return news_items
    
    def _search_yahoo_finance(self, ticker, days_back=7):
        """Search Yahoo Finance for M&A news."""
        news_items = []
        
        url = f"https://finance.yahoo.com/quote/{ticker}/news/"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'lxml')
                
                articles = soup.find_all('a', {'data-testid': True})[:15]
                
                for article in articles:
                    title = article.text.strip()
                    href = article.get('href', '')
                    
                    if len(title) > 20 and any(keyword.lower() in title.lower() for keyword in self.ma_keywords):
                        if not href.startswith('http'):
                            href = 'https://finance.yahoo.com' + href
                        
                        news_items.append({
                            'title': title,
                            'url': href,
                            'source': 'Yahoo Finance',
                            'date': datetime.now().strftime('%Y-%m-%d'),
                            'ticker': ticker
                        })
        except Exception as e:
            print(f"Yahoo Finance error for {ticker}: {e}")
            
        return news_items[:5]
    
    def _search_google_news(self, ticker, days_back=7):
        """Search Google News for M&A activity."""
        news_items = []
        
        # Google News search URL
        date_from = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
        query = f"{ticker} merger OR acquisition OR acquire OR takeover OR spin-off OR buyout"
        
        url = "https://news.google.com/search"
        params = {
            'q': query,
            'hl': 'en-US',
            'gl': 'US',
            'ceid': 'US:en'
        }
        
        try:
            response = requests.get(url, params=params, headers=self.headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'lxml')
                
                # Try multiple selectors for article links
                articles = soup.find_all('a', href=True)[:20]
                
                for article in articles:
                    href = article.get('href', '')
                    text = article.text.strip()
                    
                    # Google News links are relative, need to reconstruct
                    if href.startswith('./articles/'):
                        link = 'https://news.google.com' + href[1:]
                        
                        # Check if title contains M&A keywords
                        if any(keyword.lower() in text.lower() for keyword in self.ma_keywords) and len(text) > 10:
                            news_items.append({
                                'title': text,
                                'url': link,
                                'source': 'Google News',
                                'date': datetime.now().strftime('%Y-%m-%d'),
                                'ticker': ticker
                            })
        except Exception as e:
            print(f"Google News error for {ticker}: {e}")
            
        return news_items
    
    def _search_marketwatch(self, ticker, days_back=7):
        """Search MarketWatch for M&A news."""
        news_items = []
        
        url = f"https://www.marketwatch.com/search?q={ticker}%20merger%20OR%20acquisition"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'lxml')
                
                # Find article links
                articles = soup.find_all('a', href=True)[:15]
                
                for article in articles:
                    href = article.get('href', '')
                    text = article.text.strip()
                    
                    if '/story/' in href or '/articles/' in href:
                        if any(keyword.lower() in text.lower() for keyword in self.ma_keywords):
                            if not href.startswith('http'):
                                href = 'https://www.marketwatch.com' + href
                            
                            news_items.append({
                                'title': text[:200],
                                'url': href,
                                'source': 'MarketWatch',
                                'date': datetime.now().strftime('%Y-%m-%d'),
                                'ticker': ticker
                            })
        except Exception as e:
            print(f"MarketWatch error for {ticker}: {e}")
            
        return news_items[:5]  # Limit results
    
    def _seeking_alpha_ma(self, ticker, days_back=7):
        """Search Seeking Alpha for M&A analysis."""
        news_items = []
        
        url = f"https://seekingalpha.com/symbol/{ticker}/news"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'lxml')
                
                articles = soup.find_all('a', {'data-test-id': 'article-link'})[:10]
                
                for article in articles:
                    title = article.text.strip()
                    href = article.get('href', '')
                    
                    if any(keyword.lower() in title.lower() for keyword in self.ma_keywords):
                        if not href.startswith('http'):
                            href = 'https://seekingalpha.com' + href
                        
                        news_items.append({
                            'title': title,
                            'url': href,
                            'source': 'Seeking Alpha',
                            'date': datetime.now().strftime('%Y-%m-%d'),
                            'ticker': ticker
                        })
        except Exception as e:
            print(f"Seeking Alpha error for {ticker}: {e}")
            
        return news_items[:5]
    
    def classify_strategy(self, news_items):
        """
        Classify M&A strategy based on news content.
        Returns strategy name and reasoning.
        """
        strategies = {
            'merger_arbitrage': {
                'keywords': ['agree to acquire', 'merger agreement', 'tender offer', 'deal announced', 'closing expected'],
                'reasoning': 'Deal announced with clear terms - suitable for merger arbitrage to capture spread between current price and deal price.'
            },
            'distressed_ma': {
                'keywords': ['bankruptcy', 'financial distress', 'liquidity crisis', 'debt restructuring', 'fire sale'],
                'reasoning': 'Company facing financial difficulties - distressed M&A opportunity as assets may be undervalued.'
            },
            'hostile_takeover': {
                'keywords': ['hostile', 'unsolicited', 'rejected offer', 'proxy fight', 'activist investor'],
                'reasoning': 'Unsolicited bid or activist pressure - hostile takeover play with potential for premium increase.'
            },
            'spin_off_investing': {
                'keywords': ['spin-off', 'spinoff', 'separation', 'carve-out', 'independent company'],
                'reasoning': 'Corporate separation announced - spin-off investing opportunity as sum-of-parts value may exceed conglomerate discount.'
            },
            'consolidation_play': {
                'keywords': ['industry consolidation', 'sector merger', 'scale combination', 'market share', 'synergies'],
                'reasoning': 'Industry consolidation trend - consolidation play as companies merge to achieve scale and market power.'
            }
        }
        
        classified = []
        for item in news_items:
            title_lower = item['title'].lower()
            matched_strategy = None
            
            for strategy_name, strategy_info in strategies.items():
                if any(keyword in title_lower for keyword in strategy_info['keywords']):
                    matched_strategy = {
                        'strategy': strategy_name.replace('_', ' ').title(),
                        'reasoning': strategy_info['reasoning'],
                        'news_item': item
                    }
                    break
            
            if not matched_strategy:
                # Default to merger arbitrage for general M&A news
                matched_strategy = {
                    'strategy': 'Merger Arbitrage',
                    'reasoning': 'General M&A activity detected - monitor for deal terms and regulatory approval timeline.',
                    'news_item': item
                }
            
            classified.append(matched_strategy)
        
        return classified


if __name__ == "__main__":
    scraper = MAScraper()
    results = scraper.search_news('AAPL', days_back=7)
    print(f"Found {len(results)} news items for AAPL")
    for item in results[:3]:
        print(f"- {item['title'][:80]}...")
