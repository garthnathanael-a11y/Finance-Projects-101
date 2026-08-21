const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Path to the deals data file
const DEALS_FILE = path.join(__dirname, 'deals.json');

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Load deals from file
function loadDeals() {
    try {
        if (fs.existsSync(DEALS_FILE)) {
            const data = fs.readFileSync(DEALS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading deals:', error);
    }
    return [];
}

// API endpoint to get all M&A deals
app.get('/api/deals', (req, res) => {
    const deals = loadDeals();
    res.json(deals);
});

// API endpoint to get a specific deal by stock symbol
app.get('/api/deals/:symbol', (req, res) => {
    const deals = loadDeals();
    const symbol = req.params.symbol.toUpperCase();
    const deal = deals.find(d => d.symbol === symbol);
    
    if (!deal) {
        return res.status(404).json({ error: 'Deal not found' });
    }
    
    res.json(deal);
});

// API endpoint to get deals by strategy
app.get('/api/strategy/:strategy', (req, res) => {
    const deals = loadDeals();
    const strategy = req.params.strategy.toLowerCase().replace(/-/g, ' ');
    const filteredDeals = deals.filter(d => 
        d.strategy.toLowerCase().includes(strategy)
    );
    
    res.json(filteredDeals);
});

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`M&A Deals Tracker server running on http://localhost:${PORT}`);
    console.log('API endpoints available:');
    console.log(`  GET /api/deals - Get all M&A deals`);
    console.log(`  GET /api/deals/:symbol - Get deal by stock symbol`);
    console.log(`  GET /api/strategy/:strategy - Get deals by strategy`);
});
