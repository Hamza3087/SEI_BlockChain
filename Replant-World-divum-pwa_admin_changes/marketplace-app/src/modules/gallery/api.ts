import { get } from 'modules/api';
import { Paginated } from 'types';
import { SponsorDetails, SponsorSimple, Tree } from './types';

export type GetTreesParams = {
  sponsor?: number;
  offset?: number;
  pageSize?: number;
};

export function getTrees(params: GetTreesParams) {
  return get<Paginated<Tree>>('nfts', { params }).then(
    (response) => response.data
  );
}

export type AutocompleteSponsorsParams = {
  search?: string;
};

export function autocompleteSponsors(params: AutocompleteSponsorsParams) {
  return get<Paginated<SponsorSimple>>('sponsors', {
    params,
  }).then((response) => response.data);
}

export function getSponsor(sponsorId: number) {
  return get<SponsorDetails>(`sponsors/${sponsorId}`).then(
    (response) => response.data
  );
}
