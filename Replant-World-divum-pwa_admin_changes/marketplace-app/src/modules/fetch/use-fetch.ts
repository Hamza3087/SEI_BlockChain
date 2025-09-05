import { useCallback, useMemo } from 'react';

type FetchFn = typeof fetch;

type FetchEnhancerFn = (nextFetch: FetchFn) => FetchFn;

const composeEnhancers = (enhancers: FetchEnhancerFn[], fetch: FetchFn) =>
  enhancers.reduceRight((fetch, enhancer) => {
    return enhancer(fetch);
  }, fetch);



const apiOrigin = window.location.origin.includes('localhost')
  ? 'http://localhost:8001'
  : window.location.origin;

export const apiBaseUrl = apiOrigin + '/api';

const provideApiBaseUrl: FetchEnhancerFn = (nextFetch) => (input, init) => {
  if (typeof input === 'string') {
    input = apiBaseUrl + input; // TODO: do the same when input is Request or URL object
  }
  return nextFetch(input, init);
};

const useHandleUnauthenticated = () => {
  // const dispatch = useDispatch();
  // const navigate = useNavigate();

  const handleUnauthenticated: FetchEnhancerFn = useCallback(
    (nextFetch) =>
      async (...args) => {
        const response = await nextFetch(...args);
        if (response.status === 403) {
          // dispatch({ type: 'LOG_OUT'})
          // navigate('/login')
        }
        return response;
      },
    [
      /* dispatch, navigate */
    ]
  );

  return handleUnauthenticated;
};

export const useFetch = () => {
  const handleUnauthenticated = useHandleUnauthenticated();

  const fetch = useMemo(
    () =>
      composeEnhancers(
        [provideApiBaseUrl, handleUnauthenticated],
        globalThis.fetch
      ),
    [handleUnauthenticated]
  );

  return fetch;
};

/**
 * export const useTransactionsQuery = () => {
 *   const fetch = useFetch();
 *   const query = useQuery(() => fetch('/transactions'));
 *   return query;
 * }
 */
