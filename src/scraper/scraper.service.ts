import { Injectable } from '@nestjs/common';

import { URLSearchParams } from 'url';

import axios from 'axios';

import * as cheerio from 'cheerio';
import * as Excel from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

import { JobOffer } from './interfaces/job-offers.interface';
import { OfferSearch } from './interfaces/offer-search.interface';

import { SEARCHS } from '../config/keywords';
import {
  OFFER_FILE_FOLDER_NAME,
  OFFER_FILE_PREFIX,
  SEARCH_PAGE_COUNT,
} from '../config';

// File rows needed to display in excel file
const FILE_ROWS = ['Title', 'Company', 'Link', 'Location'];

@Injectable()
export class ScraperService {
  /**
   * Scrapes `JobOffers` for the given `OfferSearch` criteria.
   * @param searchs - `OfferSearch` array containing job title and location.
   * @returns `JobOffer` array with title, company, and link.
   */
  async scrapeJobOffers(searchs: OfferSearch[]): Promise<JobOffer[]> {
    const allOffers: JobOffer[] = [];

    // Getting 3 first search page from searchs array
    for (const search of searchs) {
      for (let page = 1; page <= SEARCH_PAGE_COUNT; page++) {
        const offers = await this.scrapeHelloWorkPage(search, page);
        allOffers.push(...offers);
      }
    }

    return allOffers;
  }

  /**
   * Generates the URL for a HelloWork job search.
   * @param title - Job title.
   * @param location - Job Location.
   * @param page - Page number of the search results.
   * @returns Generated URL for the HelloWork job search.
   */
  private generateUrl({
    title,
    location,
    page,
  }: {
    title: string;
    location: string;
    page: number;
  }) {
    const baseUrl = `${process.env.HELLO_WORK_BASE_URL}/fr-fr/emploi/recherche.html/`;

    // Default values added to search params
    const sortType = 'relevance';
    const radius = '20';
    const date = 'all';

    // Construct URL Search Params
    const params = new URLSearchParams({
      k: title,
      l: location,
      st: sortType,
      ray: radius,
      d: date,
      p: `${page}`,
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Scrapes job offers from a single page of the HelloWork job search.
   * @param search - `OfferSearch` criteria including job title and location.
   * @param page - Page number of the search results to scrape.
   * @returns Array of `JobOffer` objects scraped from the HelloWork page.
   */
  private async scrapeHelloWorkPage(
    search: OfferSearch,
    page: number,
  ): Promise<JobOffer[]> {
    const { title, location } = search;

    try {
      // Fetch HelloWork page with current search params (job title, job location, page)
      const response = await axios.get(
        this.generateUrl({ title, location, page }),
        {
          timeout: 2000,
        },
      );

      const html = response.data;

      const $ = cheerio.load(response.data);

      const offers: JobOffer[] = [];

      // Get offer list childrens from page html
      const offersList = $(
        'ul[data-id-storage-local-storage-key-param="visited_offers"] li',
        html,
      );

      // Get needed text informations in offer items
      offersList.each((i, elem) => {
        const title = $(elem).find('p').eq(0).text().trim();
        const company = $(elem).find('p').eq(1).text().trim();
        const link = $(elem).find('a').attr('href');

        offers.push({
          search,
          title,
          company,
          link,
        });
      });

      return offers;
    } catch (error) {
      console.error(`Error scraping for ${title}, page ${page}:`, error);
      throw new Error(`Error scraping for ${title}, page ${page}`);
    }
  }

  /**
   * Exports the given `JobOffer` array to an Excel file.
   * @param offers - Array of `JobOffer` objects to export.
   */
  exportToExcel(offers: JobOffer[]): void {
    try {
      const workbook = new Excel.Workbook();

      SEARCHS.forEach((search) => {
        const worksheet = workbook.addWorksheet(search.title);

        // Add row title
        worksheet.addRow(FILE_ROWS);

        // Filter offers by search title to match current worksheet
        const filteredOffers = offers.filter(
          (offer) => offer?.search.title === search.title,
        );

        // Add worksheet rows from offers
        filteredOffers.forEach((offer) => {
          worksheet.addRow([
            offer.title,
            offer.company,
            `${process.env.HELLO_WORK_BASE_URL}${offer.link}`,
            offer.search.location,
          ]);
        });
      });

      // Save Excel file to chosen folder
      const timestamp = new Date().getTime();
      const folderPath = path.resolve(OFFER_FILE_FOLDER_NAME);

      // Check if folder exists, and create it if not
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const filePath = `${folderPath}/${OFFER_FILE_PREFIX}${timestamp}.xlsx`;
      workbook.xlsx.writeFile(filePath);
    } catch (error) {
      console.error('Error creating excel file', error);
      throw new Error('Error creating excel file');
    }
  }
}
