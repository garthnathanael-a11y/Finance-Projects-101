"""
NASDAQ-100 constituents fetcher.
Returns the list of tickers in the NASDAQ-100 index.
"""
import requests
from bs4 import BeautifulSoup

# Static list of NASDAQ-100 constituents (updated periodically)
# This serves as a fallback when Wikipedia is unavailable
NASDAQ100_TICKERS = [
    'AAPL', 'MSFT', 'AMZN', 'NVDA', 'GOOGL', 'GOOG', 'META', 'TSLA', 'AVGO', 
    'COST', 'NFLX', 'AMD', 'PEP', 'ADBE', 'CSCO', 'TMUS', 'CMCSA', 'INTC', 
    'TXN', 'QCOM', 'INTU', 'AMGN', 'HON', 'AMAT', 'SBUX', 'ISRG', 'BKNG', 
    'GILD', 'MDLZ', 'ADI', 'VRTX', 'ADP', 'REGN', 'LRCX', 'PANW', 'MU', 
    'PYPL', 'SNPS', 'CDNS', 'KLAC', 'MELI', 'ASML', 'ABNB', 'CHTR', 'MAR', 
    'ORLY', 'CSX', 'MRVL', 'FTNT', 'DASH', 'PCAR', 'MNST', 'ADSK', 'NXPI', 
    'WDAY', 'ROP', 'CPRT', 'AEP', 'PAYX', 'ROST', 'ODFL', 'KDP', 'FAST', 
    'EA', 'VRSK', 'CTSH', 'BKR', 'DXCM', 'GEHC', 'EXC', 'LULU', 'XEL', 
    'CTAS', 'IDXX', 'KHC', 'TEAM', 'CSGP', 'AZN', 'FANG', 'ON', 'DDOG', 
    'ANSS', 'ZS', 'TTWO', 'CDW', 'WBD', 'BIIB', 'ILMN', 'GFS', 'MDB', 
    'WBA', 'ARM', 'SMCI', 'CRWD', 'DLTR', 'ALGN', 'ENPH', 'MRNA', 'ZM'
]

def get_nasdaq100_tickers():
    """
    Fetch NASDAQ-100 constituents from Wikipedia or return static list.
    Returns a list of ticker symbols.
    """
    url = "https://en.wikipedia.org/wiki/Nasdaq-100"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'lxml')
        
        # Find the table with NASDAQ-100 constituents
        tables = soup.find_all('table', {'class': 'wikitable'})
        tickers = []
        
        for table in tables:
            rows = table.find_all('tr')
            for row in rows[1:]:  # Skip header row
                cells = row.find_all('td')
                if len(cells) >= 2:
                    ticker_cell = cells[0].find('a') or cells[0]
                    ticker = ticker_cell.text.strip()
                    if ticker and not ticker.startswith('['):
                        tickers.append(ticker)
        
        if tickers:
            return tickers
        else:
            print("No tickers found in Wikipedia table, using static list")
            return NASDAQ100_TICKERS
        
    except Exception as e:
        print(f"Error fetching NASDAQ-100 from Wikipedia: {e}")
        print("Using static NASDAQ-100 list as fallback")
        return NASDAQ100_TICKERS


if __name__ == "__main__":
    tickers = get_nasdaq100_tickers()
    if tickers:
        print(f"Found {len(tickers)} NASDAQ-100 constituents")
        print(f"First 10: {tickers[:10]}")
    else:
        print("Failed to fetch NASDAQ-100 constituents")
