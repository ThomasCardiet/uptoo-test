import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { SEARCHS } from '../config/keywords';

import { ScraperService } from './scraper.service';

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
    try {
      // Scraping search offers
      const offers = await this.scraperService.scrapeJobOffers(SEARCHS);

      // Creating excel file
      this.scraperService.exportToExcel(offers);

      return {
        message: 'Excel file successfully created',
      };
    } catch (error) {
      console.error('Error generating scraping file:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error generating excel file',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
