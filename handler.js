'use strict';
const chromium = require('chrome-aws-lambda');
const puppeteer = chromium.puppeteer;

module.exports.index = async (event, context) => {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      defaultViewport: { width: 1200, height: 630 },
      headless: true,
      executablePath: await chromium.executablePath,
      args: chromium.args,
    });

    const page = await browser.newPage();
    await page.goto(event['queryStringParameters'].address, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
    });

    const image = await page.screenshot({
      clip: { x: 0, y: 0, width: 1200, height: 630 },
      encoding: 'base64'
    });

    const base64Image = image.toString('base64');
    // cached.set(url, base64Image);
    // return base64Image;
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          image: base64Image,
          input: event,
        },
        null,
        2
      ),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500
    };
  }
  finally {
    if (browser)
      await browser.close();
  }
};
