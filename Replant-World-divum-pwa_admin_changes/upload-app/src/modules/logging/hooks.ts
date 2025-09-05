import { isOnline } from 'modules/offline';
import * as offlineDb from 'modules/offline/db';
import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUserHistoryBulkMutation, useUserHistoryMutation } from './queries';
import { HistoryEvent } from './types';
import { getUserAgent } from './user-agent';
import { slicedArray } from './utils';

export const useLogLocationFailed = () => {
  const mutation = useUserHistoryMutation();

  const logLocationFailed = async (error: Error) => {
    const userAgent = await getUserAgent();
    const event: HistoryEvent = {
      created_at: new Date().toISOString(),
      error_name: error.name,
      error_message: error.message,
      event_type: 'LOCATION_FAILED',
      ...userAgent,
    };
    return mutation.mutate(event);
  };

  return logLocationFailed;
};

export const useLogLocationSucceeded = () => {
  const mutation = useUserHistoryMutation();

  const logLocationSucceeded = async (accuracy: number) => {
    const userAgent = await getUserAgent();
    const event: HistoryEvent = {
      accuracy: parseInt(accuracy.toPrecision(12), 10),
      created_at: new Date().toISOString(),
      event_type: 'LOCATION_SUCCEEDED',
      ...userAgent,
    };
    return mutation.mutate(event);
  };

  return logLocationSucceeded;
};

const SLICE_SIZE = 100;

export const useUploadLogWhenOnline = () => {
  const { mutateAsync } = useUserHistoryBulkMutation();

  const uploadLog = useCallback(async () => {
    const log = await offlineDb.loadAllLogEntries();
    const logSlices = slicedArray(log, SLICE_SIZE);
    for (const slice of logSlices) {
      await mutateAsync(slice);
      await offlineDb.deleteLogEntries(slice.map((item) => item.created_at));
    }
  }, [mutateAsync]);

  // Log upload requires authentication, so only pages that require user to be
  // authenticated should upload it. Otherwise, 401 error would occur and trigger
  // a handler that could potentially disrupt the flow of pages that don't require
  // authentication.
  const location = useLocation();
  const routes = ['/dashboard', '/capture', '/location-details', '/location'];
  const isLoggedIn = routes.includes(location.pathname);

  // initial upload on app startup
  useEffect(() => {
    if (isOnline() && isLoggedIn) {
      uploadLog();
    }
  }, [isLoggedIn, uploadLog]);

  const handleOnline = useCallback(() => {
    if (!isLoggedIn) {
      return;
    }
    uploadLog();
  }, [isLoggedIn, uploadLog]);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [handleOnline]);
};
