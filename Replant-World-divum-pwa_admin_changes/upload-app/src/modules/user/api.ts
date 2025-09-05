import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { get } from 'modules/api';
import { User } from '.';

const userUrl = '/user';

export const userQueryKey = ['GET', userUrl] as const;

const getUser = async () => {
  const response = await get<User>(userUrl);
  return response.data;
};

export const useUser = () =>
  useQuery<User, AxiosError>({
    queryKey: userQueryKey,
    queryFn: () => getUser(),
  });
