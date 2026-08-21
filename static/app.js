// M&A Deals Dashboard JavaScript

let currentDeals = [];

// Load deals on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDeals();
    checkAlerts();
});

// Load all M&A deals from API
async function loadDeals() {
    const dealsGrid = document.getElementById('dealsGrid');
    dealsGrid.innerHTML = '<div class="loading">Loading M&A deals...</div>';
    
    try {
        const response = await fetch('/api/deals');
        const data = await response.json();
        
        if (data.deals && data.deals.length > 0) {
            currentDeals = data.deals;
            displayDeals(data.deals);
            updateLastUpdated(data.last_updated);
        } else {
            dealsGrid.innerHTML = `
                <div class="no-deals">
                    <p>No M&A deals detected yet.</p>
                    <p>Click "Scan Now" to search for recent M&A activity.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading deals:', error);
        dealsGrid.innerHTML = '<div class="no-deals">Error loading deals. Please refresh or scan manually.</div>';
    }
}

// Display deals in grid
function displayDeals(deals) {
    const dealsGrid = document.getElementById('dealsGrid');
    dealsGrid.innerHTML = '';
    
    // Group deals by ticker
    const groupedDeals = {};
    deals.forEach(deal => {
        if (!groupedDeals[deal.ticker]) {
            groupedDeals[deal.ticker] = [];
        }
        groupedDeals[deal.ticker].push(deal);
    });
    
    // Create cards for each ticker
    Object.keys(groupedDeals).forEach(ticker => {
        const tickerDeals = groupedDeals[ticker];
        const primaryDeal = tickerDeals[0];
        
        const card = document.createElement('div');
        card.className = 'deal-card';
        card.onclick = () => showDealDetails(ticker);
        
        const strategyClass = getStrategyClass(primaryDeal.strategy);
        
        card.innerHTML = `
            <div class="deal-header">
                <span class="ticker-badge">${ticker}</span>
                <span class="strategy-badge ${strategyClass}">${primaryDeal.strategy}</span>
            </div>
            <div class="deal-title">${primaryDeal.title}</div>
            <div class="deal-date">📅 ${primaryDeal.date} | 🔗 ${tickerDeals.length} source(s)</div>
        `;
        
        dealsGrid.appendChild(card);
    });
}

// Get CSS class for strategy
function getStrategyClass(strategy) {
    const strategyMap = {
        'Merger Arbitrage': 'strategy-merger-arbitrage',
        'Distressed M&A': 'strategy-distressed-m-a',
        'Hostile Takeover': 'strategy-hostile-takeover',
        'Spin-Off Investing': 'strategy-spin-off-investing',
        'Consolidation Play': 'strategy-consolidation-play'
    };
    return strategyMap[strategy] || 'strategy-merger-arbitrage';
}

// Show deal details in modal
function showDealDetails(ticker) {
    const modal = document.getElementById('dealModal');
    const tickerDeals = currentDeals.filter(d => d.ticker === ticker);
    
    if (tickerDeals.length === 0) return;
    
    const primaryDeal = tickerDeals[0];
    
    document.getElementById('modalTicker').textContent = `${ticker} - ${primaryDeal.strategy}`;
    document.getElementById('modalStrategy').textContent = primaryDeal.strategy;
    document.getElementById('modalStrategy').className = `strategy-badge ${getStrategyClass(primaryDeal.strategy)}`;
    document.getElementById('modalReasoning').textContent = `💡 Strategy Reasoning: ${primaryDeal.reasoning}`;
    
    // Build sources list
    const sourcesList = document.getElementById('modalSources');
    sourcesList.innerHTML = '';
    
    tickerDeals.forEach((deal, index) => {
        const sourceItem = document.createElement('div');
        sourceItem.className = 'source-item';
        sourceItem.innerHTML = `
            <a href="${deal.url}" target="_blank" rel="noopener noreferrer">
                📄 ${deal.title}
            </a>
            <div class="source-meta">
                Source: ${deal.source} | Date: ${deal.date}
            </div>
        `;
        sourcesList.appendChild(sourceItem);
    });
    
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('dealModal').classList.remove('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('dealModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Trigger manual scan
async function triggerScan() {
    const scanBtn = document.querySelector('.scan-btn');
    scanBtn.disabled = true;
    scanBtn.textContent = '⏳ Scanning...';
    
    try {
        const response = await fetch('/api/scan', { method: 'POST' });
        const result = await response.json();
        
        if (result.status === 'scan_complete') {
            setTimeout(() => {
                loadDeals();
                checkAlerts();
                scanBtn.disabled = false;
                scanBtn.textContent = '🔄 Scan Now';
            }, 2000);
        }
    } catch (error) {
        console.error('Error triggering scan:', error);
        scanBtn.disabled = false;
        scanBtn.textContent = '🔄 Scan Now';
        alert('Error during scan. Please try again.');
    }
}

// Check for new alerts
async function checkAlerts() {
    try {
        const response = await fetch('/api/alerts');
        const data = await response.json();
        
        const alertsDiv = document.getElementById('alerts');
        
        if (data.last_scan) {
            const lastScanDate = new Date(data.last_scan);
            alertsDiv.innerHTML = `
                <h3>🚨 Recent M&A Activity Alert</h3>
                <p>Last scan: ${lastScanDate.toLocaleString()}</p>
                <p>${data.deal_titles ? data.deal_titles.length : 0} deal(s) identified in latest scan.</p>
            `;
            alertsDiv.classList.add('active');
        }
    } catch (error) {
        console.error('Error checking alerts:', error);
    }
}

// Update last updated timestamp
function updateLastUpdated(timestamp) {
    const lastUpdatedSpan = document.getElementById('lastUpdated');
    if (timestamp) {
        const date = new Date(timestamp);
        lastUpdatedSpan.textContent = date.toLocaleString();
    } else {
        lastUpdatedSpan.textContent = 'Never';
    }
}
