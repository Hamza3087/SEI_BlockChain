import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { get, post } from 'modules/api';
import {
  isOnline,
  offlineTreesQueryKey,
  useOfflineStore,
} from 'modules/offline';
import * as offlineDb from 'modules/offline/db';
import { NewTree, Page, Plant, PlantsSummary } from '.';

const PAGE_SIZE = 15;

const plantsSummaryUrl = '/trees/summary';
const plantsUrl = '/trees';

const plantsInfiniteQueryKey = ['GET', plantsUrl, 'infinite'];
const plantsQueryKey = (page: number) => ['GET', plantsUrl, page];
const plantsSummaryQueryKey = ['POST', plantsUrl, 'summary'];
const postPlantsQueryKey = ['POST', plantsUrl];

export const allPlantsQueryKey = ['GET', plantsUrl];

const mapStatusToApiParam = (status: string): string | null => {
  // Status mapping from UI to API
  switch (status) {
    case 'PENDING':
      return 'PENDING';
    case 'APPROVED':
      return 'APPROVED';
    case 'REJECTED':
      return 'REJECTED';
    case 'PLANTED':
    case 'FAILED':
      // No status filter for planted trees or failed uploads
      return null;
    default:
      return null;
  }
};

const getPlants = async (page: number, status: string) => {
  const apiStatus = mapStatusToApiParam(status);
  let url = `${plantsUrl}?page_size=${PAGE_SIZE}&page=${page}`;
  // Only add status parameter if it's mapped to a valid API value
  if (apiStatus) {
    url += `&status=${apiStatus}`;
  }

  const response = await get<Page<Plant>>(url);
  return response.data;
};

const getPlantsSummary = async () => {
  const response = await get<PlantsSummary>(plantsSummaryUrl);
  return response.data;
};

export const postPlants = (payload: NewTree) =>
  post<Plant, NewTree>(plantsUrl, payload);

const postPlantsOrSaveToDb = async (payload: NewTree) => {
  if (isOnline()) {
    const response = await postPlants(payload);
    return { response, onLine: true };
  }
  await offlineDb.saveNewTree(payload);
  return { onLine: false };
};

export const usePlants = (page: number, status: string) =>
  useQuery<Page<Plant>>({
    queryFn: () => getPlants(page, status),
    queryKey: [...plantsQueryKey(page), status],
  });

export const usePlantsSummary = () =>
  useQuery<PlantsSummary>({
    queryFn: () => getPlantsSummary(),
    queryKey: plantsSummaryQueryKey,
  });

export const usePlantsMutation = () => {
  const queryClient = useQueryClient();

  const { incTotalCount } = useOfflineStore();

  return useMutation<
    { response?: AxiosResponse<Plant>; onLine: boolean },
    Error,
    NewTree
  >({
    mutationKey: postPlantsQueryKey,
    mutationFn: postPlantsOrSaveToDb,
    onSuccess: (data) => {
      if (data.onLine) {
        queryClient.invalidateQueries({ queryKey: allPlantsQueryKey }); // invalidates all plants queries if uploaded to BE
      } else {
        queryClient.invalidateQueries({ queryKey: offlineTreesQueryKey });
        incTotalCount();
      }
    },
    networkMode: 'always',
  });
};

export const usePlantsInfinite = (status: string = '') =>
  useInfiniteQuery<
    Page<Plant>,
    AxiosError,
    InfiniteData<Page<Plant>>,
    string[],
    number
  >({
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (!lastPage.next) {
        return;
      }
      return lastPageParam + 1;
    },
    queryKey: [...plantsInfiniteQueryKey, status],
    queryFn: ({ pageParam }) => getPlants(pageParam, status),
  });
