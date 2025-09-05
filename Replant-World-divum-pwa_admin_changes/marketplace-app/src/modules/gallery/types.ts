export type SponsorSimple = {
  id: number;
  name: string;
};

export type SponsorDetails = SponsorSimple & {
  trees: number;
  species: number;
  total_trees_cost_usd: string;
};

export type IucnStatus = 'CR' | 'EN' | 'VU' | 'NT' | 'LC' | 'DD';

export type Tree = {
  common_name: string;
  botanical_name: string;
  iucn_status: IucnStatus;
  image: string;
  country: string;
  created_at: string;
  planting_cost_usd: string;
  planter: string;
  planting_organization: string;
  latitude: string;
  longitude: string;
  sponsor: string;
  nft_collection: string;
  nft_id: string;
};
