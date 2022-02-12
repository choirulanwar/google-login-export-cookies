import { Injectable } from '@nestjs/common';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const UserAgent = require('user-agents');
puppeteer.use(StealthPlugin());

@Injectable()
export class PuppeteerService {
  launchOptions = {
    headless: false,
  };

  async getBrowser(): Promise<{ browser: Browser; page: Page }> {
    const userAgent = new UserAgent({ deviceCategory: 'desktop' });
    const browser = await puppeteer.launch(this.launchOptions);
    const pages = await browser.pages();
    if (pages.length > 1) {
      await pages[0].close();
    }

    const page = await browser.newPage();
    await page.setViewport({
      width: userAgent.data.viewportWidth,
      height: userAgent.data.viewportHeight,
    });
    await page.setUserAgent(userAgent.toString());

    return {
      browser,
      page,
    };
  }

  async getCookies(page: Page): Promise<any[]> {
    const cookies = await page.cookies();

    return cookies;
  }
}
