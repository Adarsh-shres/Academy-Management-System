const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE ERROR: ${msg.text()}`);
    }
  });
  page.on('pageerror', error => {
    console.log(`UNCAUGHT ERROR: ${error.message}`);
  });

  // Set mock session in local storage to force login state if possible, 
  // or just navigate to /dashboard and see if it crashes before redirect,
  // or if it redirects to /login.
  console.log('Navigating to http://localhost:5174/teacher/dashboard...');
  await page.goto('http://localhost:5174/teacher/dashboard', { waitUntil: 'networkidle' });
  
  const content = await page.evaluate(() => {
    return document.body.innerHTML;
  });
  console.log('BODY HTML LENGTH:', content.length);
  
  await browser.close();
})();
