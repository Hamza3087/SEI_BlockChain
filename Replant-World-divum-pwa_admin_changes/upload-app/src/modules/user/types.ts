import { Country } from 'modules/countries';

export type User = {
  username: string;
  phone_number?: string;
  country?: Country;
  planting_organization?: { name: string };
  date_joined?: string;
};
