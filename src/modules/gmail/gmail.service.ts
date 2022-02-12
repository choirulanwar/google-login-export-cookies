import { Injectable } from '@nestjs/common';
import { Page } from 'puppeteer';

interface IInput {
  email: string;
  password: string;
}

@Injectable()
export class GmailService {
  async login(page: Page, input: IInput) {
    const EMAIL_SELECTOR = 'input[type="email"]';
    const PASSWORD_SELECTOR = 'input[type="password"]';
    const OTP_SELECTOR = 'input[type="tel"]';
    const TOS_SELECTOR = 'input[name"accept"]';
    const MAIL_SEARCH_SELECTOR = 'input[name="q"]';

    await page.waitForTimeout(5000);

    console.log('[+] Navigating to login page');
    await page.goto('https://mail.google.com/', {
      waitUntil: 'networkidle2',
    });

    await page.waitForSelector(EMAIL_SELECTOR, {
      visible: true,
      timeout: 30000,
    });
    await page.waitForTimeout(1000);
    await page.focus(EMAIL_SELECTOR);
    console.log('[+] Inputting email');
    await page.type(EMAIL_SELECTOR, input.email, { delay: 150 });
    await page.click('#identifierNext', {
      delay: 150,
    });

    await page.waitForSelector(PASSWORD_SELECTOR, {
      visible: true,
      timeout: 30000,
    });
    await page.waitForTimeout(1000);
    await page.focus(PASSWORD_SELECTOR);
    console.log('[+] Inputting password');
    await page.type(PASSWORD_SELECTOR, input.password, { delay: 150 });
    await page.click('#passwordNext', { delay: 150 });

    console.log('[+] Check required verification');
    const [OTPCheck, TOSCheck] = await Promise.allSettled([
      page.waitForSelector(OTP_SELECTOR, { visible: true, timeout: 10000 }),
      page.waitForSelector(TOS_SELECTOR, { visible: true, timeout: 10000 }),
    ]);

    if (OTPCheck.status === 'fulfilled') {
      throw Error('Need OTP');
    }
    if (TOSCheck.status === 'fulfilled') {
      await page.click(TOS_SELECTOR);
    }

    await page.waitForSelector(MAIL_SEARCH_SELECTOR, {
      visible: true,
      timeout: 30000,
    });
    await page.waitForTimeout(5000);
  }
}
