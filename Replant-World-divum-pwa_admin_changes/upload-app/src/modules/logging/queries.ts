import { useMutation } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { isOnline } from 'modules/offline';
import * as offlineDb from 'modules/offline/db';
import {
  UserHistoryError,
  UserHistoryResponse,
  postUserHistory,
  userHistoryUrl,
} from './api';
import { HistoryEvent } from './types';

// works only online; used to upload logs from offline database
export const useUserHistoryBulkMutation = () =>
  useMutation<
    AxiosResponse<UserHistoryResponse>,
    AxiosError<UserHistoryError>,
    HistoryEvent[]
  >({
    mutationKey: ['POST', userHistoryUrl, 'bulk'],
    mutationFn: (events) => postUserHistory({ history: events }),
  });

// works offline
export const useUserHistoryMutation = () =>
  useMutation<
    AxiosResponse<UserHistoryResponse> | string,
    AxiosError<UserHistoryError>,
    HistoryEvent
  >({
    mutationKey: ['POST', userHistoryUrl, 'single'],
    mutationFn: (event) => {
      if (isOnline()) {
        return postUserHistory({ history: [event] });
      }
      return offlineDb.saveLogEntry(event);
    },
    networkMode: 'always',
  });
