import puppeteer from 'puppeteer';

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function autoScroll(page) {
  await page.evaluate(async () => {
    return new Promise((resolve: any) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

export async function newPage(
  browser: any,
  url: string,
  { log, inject, consoleHandler } = { log: console.log, inject: null, consoleHandler: null }
) {
  log(['newPage > 1 > `' + url + '`'], ['p1']);

  const pages = await browser.pages();

  log(['newPage > 2 > `' + url + '`'], ['p1']);

  const page = pages[0];
  await page.setExtraHTTPHeaders({
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'max-age=0',
    priority: 'u=0, i',
    'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    cookie: '',
  });

  if (inject) {
    await page.evaluateOnNewDocument(inject);
  }

  log(['newPage > 3 > `' + url + '`'], ['p1']);

  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  log(['newPage > 4 > `' + url + '`'], ['p1']);

  await page.goto(url, {
    timeout: 60 * 1000,
    waitUntil: 'domcontentloaded', // networkidle0
  } as any);

  log(['newPage > 5 > `' + url + '`'], ['p1']);

  if (consoleHandler) {
    page.on('console', consoleHandler);
  }

  await sleep(5000);

  log(['newPage > 6 > `' + url + '`'], ['p1']);

  await page.evaluate(() => window.stop());

  log(['newPage > 7 > `' + url + '`'], ['p1']);

  return page;
}

export async function open() {
  const browser = await puppeteer.launch({
    headless: true,
    // headless: 'old',
    // headless: "new",
    // headless: true,
    // executablePath:
    //     './chrome/mac_arm-126.0.6478.63/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', //'/usr/bin/chromium-browser'
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security', // disabling CORS
      '--disable-site-isolation-trials',
      '--disable-notifications', // to disable native notification window on Mac OS
      '--no-zygote', // Seems to help avoid zombies https://github.com/puppeteer/puppeteer/issues/1825
    ],
    devtools: false,
    ignoreHTTPSErrors: true,
    slowMo: 0,
  });

  return browser;
}

export async function findPage(target, { browser }) {
  let page;

  while (!page) {
    const pages = await browser.pages();

    for (const p of pages) {
      const url = await p.url();

      if (!p.cerebroInit) {
        // p.setDefaultNavigationTimeout(30000)
        await p.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        );
        await p.setViewport({
          width: 960,
          height: 800,
        });
        await p.setRequestInterception(true);
        p.on('request', (request) => {
          if (
            request.resourceType() === 'stylesheet' ||
            request.resourceType() === 'font' ||
            request.resourceType() === 'image'
          ) {
            request.abort();
          } else {
            request.continue();
          }
        });

        p.cerebroInit = true;
      }

      if (url.indexOf(target) !== -1) {
        page = p;
      }

      await sleep(1000);
    }
  }

  return page;
}
