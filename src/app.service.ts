import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { GmailService } from './modules/gmail/gmail.service';
import { PuppeteerService } from './modules/puppeteer/puppeteer.service';

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

@Injectable()
export class AppService {
  constructor(
    private readonly puppeteerService: PuppeteerService,
    private readonly gmailService: GmailService,
  ) {}

  async gmailLoginAndSaveCookies() {
    const accounts = (
      await fs.promises.readFile(
        path.join(process.cwd(), '.data/accounts.txt'),
        'utf-8',
      )
    ).split(/\r?\n/);
    const succeed = (
      await fs.promises.readFile(
        path.join(process.cwd(), '.data/logs/success.txt'),
        'utf-8',
      )
    ).split(/\r?\n/);
    const failed = (
      await fs.promises.readFile(
        path.join(process.cwd(), '.data/logs/failure.txt'),
        'utf-8',
      )
    ).split(/\r?\n/);

    for (const account of accounts.filter((acc) => {
      const [email] = acc.split('||');
      return !succeed.includes(email);
    })) {
      console.log('[+] Creating new browser');

      const [email, password] = account.split('||');
      const { browser, page } = await this.puppeteerService.getBrowser();

      try {
        console.log('[+] Logging in', email);

        await this.gmailService.login(page, { email, password });

        const cookies = await this.puppeteerService.getCookies(page);

        console.log('[+] Exporting cookies');
        await fs.promises.writeFile(
          path.join(process.cwd(), '.data/cookies', `${email}.json`),
          JSON.stringify(cookies),
          'utf-8',
        );

        await fs.promises.appendFile(
          path.join(process.cwd(), '.data/logs/success.txt'),
          email + '\n',
          'utf-8',
        );
      } catch (error) {
        console.error('[+] Skipping', email, 'Reason', error?.message);
        if (!failed.includes(email)) {
          await fs.promises.appendFile(
            path.join(process.cwd(), '.data/logs/failure.txt'),
            email + '\n',
            'utf-8',
          );
        }
      } finally {
        console.log('[+] Exiting browser\n');
        await sleep(5000);
        await browser.close();
      }

      if (accounts.at(-1) !== account) {
        await sleep(30000);
      }
    }

    await fs.promises.writeFile(
      path.join(process.cwd(), '.data/logs/failure.txt'),
      (
        await fs.promises.readFile(
          path.join(process.cwd(), '.data/logs/failure.txt'),
          'utf-8',
        )
      )
        .split(/\r?\n/)
        .filter((d) => !succeed.includes(d))
        .join('\n'),
      'utf-8',
    );

    console.log('[+] Done');
  }
}
