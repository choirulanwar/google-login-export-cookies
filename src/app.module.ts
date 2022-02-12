import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PuppeteerModule } from './modules/puppeteer/puppeteer.module';
import { GmailModule } from './modules/gmail/gmail.module';
import { AppService } from './app.service';

@Module({
  imports: [PuppeteerModule, ConfigModule.forRoot(), GmailModule],
  providers: [AppService],
})
export class AppModule {}
