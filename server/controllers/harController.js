// src/controllers/harController.js
const puppeteer = require('puppeteer');

/**
 * Generates a HAR file for the specified URL
 */
exports.generateHar = async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let browser = null;
  
  try {
    // Launch puppeteer with minimal configuration for serverless environment
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1280,720',
      ],
      defaultViewport: { width: 1280, height: 720 }
    });

    const page = await browser.newPage();
    
    // Enable network tracking
    const client = await page.target().createCDPSession();
    await client.send('Network.enable');
    
    // Store network events
    const entries = [];
    
    // Listen for network events
    client.on('Network.requestWillBeSent', params => {
      entries.push({
        startedDateTime: new Date(params.timestamp * 1000).toISOString(),
        request: {
          method: params.request.method,
          url: params.request.url,
          headers: params.request.headers,
          queryString: Object.entries(new URL(params.request.url).searchParams).map(([name, value]) => ({
            name,
            value
          })),
          cookies: [],
          headersSize: -1,
          bodySize: -1
        },
        response: null,
        cache: {},
        timings: {
          send: -1,
          wait: -1,
          receive: -1
        }
      });
    });

    client.on('Network.responseReceived', params => {
      const entry = entries.find(e => e.request.url === params.response.url);
      if (entry) {
        entry.response = {
          status: params.response.status,
          statusText: params.response.statusText,
          headers: params.response.headers,
          content: {
            size: -1,
            mimeType: params.response.mimeType
          },
          redirectURL: params.response.redirectURL,
          headersSize: -1,
          bodySize: -1
        };
      }
    });

    // Navigate to the URL
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000 // 30 seconds timeout
    });
    
    // Wait for a moment to capture any additional resources
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create HAR object
    const har = {
      log: {
        version: '1.2',
        creator: {
          name: 'HAR Viewer',
          version: '1.0'
        },
        pages: [],
        entries: entries
      }
    };
    
    // Set headers for HAR file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${new URL(url).hostname}.har`);
    
    // Send the HAR content
    res.send(JSON.stringify(har, null, 2));
    
  } catch (error) {
    console.error('Error generating HAR:', error);
    res.status(500).json({ 
      error: 'Failed to generate HAR file',
      details: error.message 
    });
  } finally {
    // Always close the browser
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
};