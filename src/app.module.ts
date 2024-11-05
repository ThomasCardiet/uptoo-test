import { Module } from '@nestjs/common';
import { ScraperModule } from './scraper/scraper.module';
import { ScraperService } from './scraper/scraper.service';
import { ScraperController } from './scraper/scraper.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // Add env variables
    ConfigModule.forRoot({
      envFilePath: `.env`,
      isGlobal: true,
    }),
    ScraperModule,
  ],
  providers: [ScraperService],
  controllers: [ScraperController],
})
export class AppModule {}
