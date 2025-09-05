import { useRef } from 'react';

type LoadMoreFn = () => void;

export const useInfiniteScrolling = (loadMore: LoadMoreFn) => {
  const lastItemObserverRef = useRef<IntersectionObserver>();
  const lastItemRef = (node: HTMLElement | null) => {
    if (!node) {
      return;
    }

    if (lastItemObserverRef && lastItemObserverRef.current) {
      lastItemObserverRef.current.disconnect();
    }
    lastItemObserverRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });
    lastItemObserverRef.current.observe(node);
  };
  return { lastItemRef };
};
