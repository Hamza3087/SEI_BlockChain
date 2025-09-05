import { useQuery } from '@tanstack/react-query';
import { get } from 'modules/api';

const COUNTRIES_URL = '/countries';

const COUNTRIES_QUERY_KEY = ['GET', COUNTRIES_URL] as const;

export type Country = {
  id: number;
  name: string;
};

const getCountries = async () => {
  const response = await get<Country[]>(COUNTRIES_URL);
  return response.data;
};

export const useCountries = ({ enabled }: { enabled?: boolean }) =>
  useQuery<Country[]>({
    queryKey: COUNTRIES_QUERY_KEY,
    queryFn: getCountries,
    enabled,
  });
