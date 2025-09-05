import { useCallback, useEffect, useState } from 'react';
import { useOfflineStore } from '.';

export const useInitOffline = () => {
  const { syncTotalCount } = useOfflineStore();
  useEffect(() => {
    syncTotalCount();
  }, [syncTotalCount]);
};

export const useIsOnline = () => {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

  const handleOffline = useCallback(() => setIsOnline(false), []);
  const handleOnline = useCallback(() => setIsOnline(true), []);

  useEffect(() => {
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [handleOffline, handleOnline]);

  return isOnline;
};
