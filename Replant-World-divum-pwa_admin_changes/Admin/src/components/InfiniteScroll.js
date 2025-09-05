import React, { useEffect, useRef } from 'react';

const InfiniteScrollObserver = ({ onIntersect, isLoading, hasMore }) => {
  const observerRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading && hasMore) {
          onIntersect();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [isLoading, hasMore, onIntersect]);

  return (
    <div className='infinite-scroll-observer'>
      <div ref={observerRef} />
      {isLoading && (
        <div className='text-center py-3'>
          <div
            className='spinner-border spinner-border-sm'
            role='status'
          >
            <span className='visually-hidden'>Loading...</span>
          </div>
          <span className='ms-2'>Loading more...</span>
        </div>
      )}
      {!hasMore && !isLoading && (
        <div className='text-center mb-2'>
          <h5>No more results to load!</h5>
        </div>
      )}
    </div>
  );
};

export default InfiniteScrollObserver;
