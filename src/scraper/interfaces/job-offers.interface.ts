import { OfferSearch } from './offer-search.interface';

/**
 * JobOffer interface include SearchOffer for excel export
 */
export interface JobOffer {
  search: OfferSearch;
  company: string;
  title: string;
  link: string;
}
