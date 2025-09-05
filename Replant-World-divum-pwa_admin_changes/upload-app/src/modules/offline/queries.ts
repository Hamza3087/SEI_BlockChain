import { useInfiniteQuery } from '@tanstack/react-query';
import * as offlineDb from './db';

const PAGE_SIZE = 15;

export const offlineTreesQueryKey = ['Offline trees'];

export const useOfflineTreesInfinite = () => {
  return useInfiniteQuery({
    queryKey: offlineTreesQueryKey,
    queryFn: async ({ pageParam }) => {
      const results = await offlineDb.loadNewTrees(pageParam, PAGE_SIZE);
      const next =
        (await offlineDb.getNewTreesTotalCount()) > pageParam + PAGE_SIZE;
      return {
        results,
        next,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (!lastPage.next) {
        return;
      }
      return lastPageParam + PAGE_SIZE;
    },
    networkMode: 'always',
  });
};
