const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser with Puppeteer...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  console.log('Page loaded successfully!');
  console.log('Page title:', await page.title());
  
  await page.screenshot({ 
    path: 'legalese-screenshot.png',
    fullPage: true 
  });
  console.log('Screenshot saved as legalese-screenshot.png');
  
  console.log('\nBrowser is now running. Press Ctrl+C to close.');
  
  process.on('SIGINT', async () => {
    console.log('\nClosing browser...');
    await browser.close();
    process.exit(0);
  });
  
  await new Promise(() => {});
})();