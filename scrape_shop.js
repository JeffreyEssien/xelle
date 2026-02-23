import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:3000/shop?category=handbags', { waitUntil: 'networkidle0' });

    // Evaluate the content of the page
    const content = await page.evaluate(() => {
        return {
            h1: document.querySelector('h1')?.innerText,
            productsText: document.body.innerText.includes('No products match your filters') ? 'Empty State' : 'Has Products',
            productCards: document.querySelectorAll('.group.block').length,
            allText: document.body.innerText.substring(0, 500)
        };
    });

    console.log(JSON.stringify(content, null, 2));
    await browser.close();
})();
