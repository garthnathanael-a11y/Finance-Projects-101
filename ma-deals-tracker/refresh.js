const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

// NASDAQ100 symbols (as of recent data)
const NASDAQ100_SYMBOLS = [
    'AAPL', 'MSFT', 'AMZN', 'NVDA', 'GOOGL', 'GOOG', 'META', 'TSLA', 'AVGO', 'COST',
    'NFLX', 'AMD', 'PEP', 'ADBE', 'CSCO', 'TMUS', 'INTC', 'CMCSA', 'TXN', 'QCOM',
    'INTU', 'AMGN', 'HON', 'AMAT', 'SBUX', 'ISRG', 'BKNG', 'GILD', 'ADI', 'MDLZ',
    'VRTX', 'ADP', 'REGN', 'LRCX', 'PANW', 'MU', 'PYPL', 'SNPS', 'KLAC', 'CDNS',
    'MELI', 'ASML', 'CHTR', 'ABNB', 'MAR', 'MRVL', 'ORLY', 'CSX', 'ADSK', 'NXPI',
    'FTNT', 'WDAY', 'MNST', 'PCAR', 'DASH', 'ROP', 'AEP', 'PAYX', 'ROST', 'ODFL',
    'KDP', 'EA', 'VRSK', 'CTSH', 'DXCM', 'BKR', 'GEHC', 'EXC', 'KHC', 'LULU',
    'XEL', 'IDXX', 'CTAS', 'FAST', 'BIIB', 'EBAY', 'DLTR', 'CPRT', 'ILMN', 'WBD',
    'CSGP', 'ZS', 'ANSS', 'DDOG', 'TTWO', 'ON', 'TEAM', 'ALGN', 'ENPH', 'WBA',
    'SIRI', 'LCID', 'RIVN', 'ZM', 'DOCU', 'PTON', 'ROKU', 'TWLO', 'SQ', 'SHOP'
];

const DEALS_FILE = path.join(__dirname, 'deals.json');
const ALERTS_FILE = path.join(__dirname, 'alerts.json');

// Email configuration (update with your credentials)
const EMAIL_CONFIG = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
    }
};

// Strategy mapping based on deal characteristics
function determineStrategy(deal) {
    const description = (deal.title + ' ' + deal.summary).toLowerCase();
    
    // Hostile Takeover Plays - Check this FIRST before general M&A
    if (description.includes('hostile') || description.includes('unsolicited') || description.includes('resistance')) {
        return {
            strategy: 'Hostile Takeover Plays',
            reasoning: 'Unsolicited bid or resistance from target company management indicates a hostile takeover attempt. Consider shorting the acquirer or going long on the target if you believe the deal will close at a higher price.'
        };
    }
    
    // Spin-Off Investing
    if (description.includes('spin-off') || description.includes('spinoff') || description.includes('divestiture') || description.includes('separate')) {
        return {
            strategy: 'Spin-Off Investing',
            reasoning: 'Company is separating a business unit. Spin-offs often outperform as they unlock hidden value, reduce conglomerate discount, and allow focused management. Consider investing in both parent and spin-off entity.'
        };
    }
    
    // Distressed M&A
    if (description.includes('distress') || description.includes('bankrupt') || description.includes('restructuring')) {
        return {
            strategy: 'Distressed M&A',
            reasoning: 'Target company is in financial distress. These deals often involve significant discounts and complex capital structures. High risk but potential for substantial returns if restructuring succeeds.'
        };
    }
    
    // Consolidation Plays
    if (description.includes('consolidat') || description.includes('industry consolidat') || description.includes('sector consolidat')) {
        return {
            strategy: 'Consolidation Plays',
            reasoning: 'Industry consolidation trend. Multiple players merging to achieve scale efficiencies. Look for remaining targets in the sector that may be acquired next.'
        };
    }
    
    // Merger Arbitrage: Standard acquisitions with announced deals
    if (description.includes('acquisition') || description.includes('merge') || description.includes('buy') || description.includes('acquire')) {
        return {
            strategy: 'Merger Arbitrage',
            reasoning: 'Standard announced M&A deal. Profit from the spread between current market price and acquisition price. Monitor regulatory approval risks and deal completion timeline.'
        };
    }
    
    // Default to Merger Arbitrage for any M&A activity
    return {
        strategy: 'Merger Arbitrage',
        reasoning: 'General M&A activity detected. Analyze deal terms, premium offered, regulatory landscape, and financing conditions to determine optimal positioning.'
    };
}

// Fetch M&A news from various sources
async function fetchMANews() {
    const deals = [];
    const today = new Date();
    
    // Simulated news sources - in production, integrate with real APIs
    const newsSources = [
        {
            name: 'Reuters M&A',
            url: 'https://www.reuters.com/markets/deals/'
        },
        {
            name: 'Bloomberg M&A',
            url: 'https://www.bloomberg.com/markets/mergers-acquisitions'
        },
        {
            name: 'WSJ M&A',
            url: 'https://www.wsj.com/news/business/deals'
        }
    ];
    
    // Sample data structure for demonstration
    // In production, this would scrape real news or use paid APIs
    const sampleDeals = generateSampleDeals();
    
    for (const sampleDeal of sampleDeals) {
        if (NASDAQ100_SYMBOLS.includes(sampleDeal.symbol)) {
            const strategyInfo = determineStrategy(sampleDeal);
            deals.push({
                ...sampleDeal,
                ...strategyInfo,
                sources: sampleDeal.sources || [],
                lastUpdated: today.toISOString()
            });
        }
    }
    
    return deals;
}

// Generate sample deals for demonstration
function generateSampleDeals() {
    // This is sample data - in production, replace with real API calls
    return [
        {
            symbol: 'AAPL',
            companyName: 'Apple Inc.',
            title: 'Apple Acquires AI Startup for $2 Billion',
            summary: 'Apple announced the acquisition of an artificial intelligence startup to enhance its machine learning capabilities across its product lineup.',
            dealValue: '$2.0B',
            announcementDate: new Date().toISOString(),
            status: 'Announced',
            sources: [
                { name: 'Reuters', url: 'https://www.reuters.com/technology/apple-acquires-ai-startup' },
                { name: 'Bloomberg', url: 'https://www.bloomberg.com/news/apple-ai-acquisition' },
                { name: 'CNBC', url: 'https://www.cnbc.com/apple-acquisition-news' }
            ]
        },
        {
            symbol: 'NVDA',
            companyName: 'NVIDIA Corporation',
            title: 'NVIDIA in Talks to Acquire Semiconductor Competitor',
            summary: 'NVIDIA is reportedly in advanced discussions to acquire a rival semiconductor company in a deal valued at over $10 billion, marking a major consolidation in the chip industry.',
            dealValue: '$10.5B',
            announcementDate: new Date(Date.now() - 86400000).toISOString(),
            status: 'In Talks',
            sources: [
                { name: 'Wall Street Journal', url: 'https://www.wsj.com/nvidia-acquisition-talks' },
                { name: 'Financial Times', url: 'https://www.ft.com/nvidia-semiconductor-deal' }
            ]
        },
        {
            symbol: 'TSLA',
            companyName: 'Tesla Inc.',
            title: 'Tesla Faces Hostile Takeover Attempt by Investment Group',
            summary: 'A consortium of investors has made an unsolicited bid to acquire Tesla, facing resistance from current management. The hostile takeover attempt values the company at a significant premium.',
            dealValue: '$180B',
            announcementDate: new Date(Date.now() - 172800000).toISOString(),
            status: 'Hostile Bid',
            sources: [
                { name: 'Bloomberg', url: 'https://www.bloomberg.com/tesla-hostile-takeover' },
                { name: 'Reuters', url: 'https://www.reuters.com/tesla-unsolicited-bid' },
                { name: 'MarketWatch', url: 'https://www.marketwatch.com/tesla-takeover-attempt' }
            ]
        },
        {
            symbol: 'META',
            companyName: 'Meta Platforms Inc.',
            title: 'Meta to Spin Off VR Division into Separate Company',
            summary: 'Meta announced plans to spin off its Virtual Reality division into an independent publicly traded company, allowing investors to value the VR business separately.',
            dealValue: 'N/A',
            announcementDate: new Date(Date.now() - 259200000).toISOString(),
            status: 'Announced',
            sources: [
                { name: 'TechCrunch', url: 'https://techcrunch.com/meta-vr-spinoff' },
                { name: 'The Verge', url: 'https://www.theverge.com/meta-spinoff-news' }
            ]
        },
        {
            symbol: 'AMZN',
            companyName: 'Amazon.com Inc.',
            title: 'Amazon Acquires Healthcare Company in Distressed Sale',
            summary: 'Amazon purchased a struggling healthcare technology company out of bankruptcy proceedings at a discounted valuation, expanding its healthcare footprint.',
            dealValue: '$1.2B',
            announcementDate: new Date(Date.now() - 345600000).toISOString(),
            status: 'Completed',
            sources: [
                { name: 'Healthcare Dive', url: 'https://www.healthcaredive.com/amazon-distressed-acquisition' },
                { name: 'Modern Healthcare', url: 'https://www.modernhealthcare.com/amazon-bankruptcy-purchase' }
            ]
        }
    ];
}

// Save deals to file
function saveDeals(deals) {
    try {
        fs.writeFileSync(DEALS_FILE, JSON.stringify(deals, null, 2));
        console.log(`Saved ${deals.length} deals to ${DEALS_FILE}`);
    } catch (error) {
        console.error('Error saving deals:', error);
    }
}

// Load previous deals for comparison
function loadPreviousDeals() {
    try {
        if (fs.existsSync(DEALS_FILE)) {
            const data = fs.readFileSync(DEALS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading previous deals:', error);
    }
    return [];
}

// Load alerts history
function loadAlerts() {
    try {
        if (fs.existsSync(ALERTS_FILE)) {
            const data = fs.readFileSync(ALERTS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
    return [];
}

// Save alerts history
function saveAlerts(alerts) {
    try {
        fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2));
    } catch (error) {
        console.error('Error saving alerts:', error);
    }
}

// Send email alert
async function sendEmailAlert(newDeals) {
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
        console.log('Email not configured. Skipping email alert.');
        return;
    }
    
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);
    
    const dealList = newDeals.map(deal => 
        `<li><strong>${deal.symbol}</strong>: ${deal.title}<br>
        Strategy: ${deal.strategy}<br>
        <a href="${deal.sources[0]?.url || '#'}">Read more</a></li>`
    ).join('');
    
    const mailOptions = {
        from: EMAIL_CONFIG.auth.user,
        to: process.env.ALERT_EMAIL || EMAIL_CONFIG.auth.user,
        subject: `🔔 New M&A Activity Detected - ${newDeals.length} Deal(s)`,
        html: `
            <h2>New M&A Activity Alert</h2>
            <p>The following M&A activities have been detected involving NASDAQ100 companies:</p>
            <ul>${dealList}</ul>
            <p>Visit your M&A Tracker dashboard for detailed analysis.</p>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email alert sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Check for new deals and send alerts
async function checkForNewDeals() {
    console.log('\n=== Checking for new M&A deals ===');
    const currentDeals = await fetchMANews();
    const previousDeals = loadPreviousDeals();
    const alertsHistory = loadAlerts();
    
    // Find new deals
    const newDeals = currentDeals.filter(current => 
        !previousDeals.some(prev => prev.symbol === current.symbol && prev.title === current.title)
    );
    
    if (newDeals.length > 0) {
        console.log(`🚨 ${newDeals.length} new M&A deal(s) detected!`);
        
        // Send alerts
        await sendEmailAlert(newDeals);
        
        // Log to alerts history
        newDeals.forEach(deal => {
            alertsHistory.push({
                symbol: deal.symbol,
                title: deal.title,
                detectedAt: new Date().toISOString()
            });
        });
        saveAlerts(alertsHistory);
        
        // Save updated deals
        saveDeals(currentDeals);
        
        console.log('✅ Alerts sent and deals updated');
    } else {
        console.log('No new deals detected');
        saveDeals(currentDeals);
    }
    
    return currentDeals;
}

// Initial run
checkForNewDeals().then(() => {
    // Schedule weekly refresh (every Monday at 9 AM)
    cron.schedule('0 9 * * 1', () => {
        console.log('\n📅 Running weekly M&A deals refresh...');
        checkForNewDeals();
    });
    
    console.log('✅ M&A Deals refresh script initialized');
    console.log('📅 Weekly refresh scheduled for Mondays at 9:00 AM');
});

module.exports = { checkForNewDeals, fetchMANews };
