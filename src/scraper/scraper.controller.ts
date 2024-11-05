import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScraperService } from './scraper.service';
import { SEARCHS } from 'src/config/keywords';
import { OFFER_FILE_FOLDER_NAME } from 'src/config';

@Controller('generate-scraping-file')
export class ScraperController {
  constructor(private scraperService: ScraperService) {}

  /**
   * Generates an Excel file with the scraped job offers
   * @returns object with status
   */
  @Get()
  @ApiOperation({ summary: 'Generate a scraping file' })
  @ApiResponse({ status: 200, description: 'Scraping file generated' })
  async generateScrapingFile() {
    const offers = await this.scraperService.scrapeJobOffers(SEARCHS);
    this.scraperService.exportToExcel(offers);
    return {
      message: `Fichier Excel généré avec succès dans /${OFFER_FILE_FOLDER_NAME}`,
    };
  }
}
