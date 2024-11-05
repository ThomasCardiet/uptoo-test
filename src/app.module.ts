import { Module } from '@nestjs/common';
import { ScraperModule } from './scraper/scraper.module';
import { ScraperService } from './scraper/scraper.service';
import { ScraperController } from './scraper/scraper.controller';

@Module({
  imports: [ScraperModule],
  providers: [ScraperService],
  controllers: [ScraperController],
})
export class AppModule {}
