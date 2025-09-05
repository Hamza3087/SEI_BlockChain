import { useQuery } from '@tanstack/react-query';
import { get } from 'modules/api';
import { isOnline } from 'modules/offline';
import * as offlineDb from 'modules/offline/db';
import { AssignedSpecies } from './types';

export type AssignedSpeciesResponseData = AssignedSpecies[];

const assignedSpeciesUrl = '/assigned-species';

export const assignedSpeciesQueryKey = ['GET', assignedSpeciesUrl] as const;

const getAssignedSpecies = async () => {
  const response = await get<AssignedSpeciesResponseData>(assignedSpeciesUrl);
  return response.data;
};

const getAssignedSpeciesOrLoadFromDb = async () => {
  if (isOnline()) {
    const species = await getAssignedSpecies();
    await offlineDb.saveAssignedSpecies(species);
    return species;
  }
  return await offlineDb.loadAssignedSpecies();
};

export const useSpecies = () =>
  useQuery({
    queryFn: getAssignedSpeciesOrLoadFromDb,
    queryKey: assignedSpeciesQueryKey,
    networkMode: 'always',
  });
