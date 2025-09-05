// LoadingSpinner.js
import React, { useState, useEffect } from 'react';
import LoadingService from './LoadingService';
import { Spinner } from 'reactstrap';

const LoadingSpinner = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to loading state changes
    const unsubscribe = LoadingService.onLoadingChange(setIsLoading);

    // Cleanup subscription on component unmount
    return unsubscribe;
  }, []);

  if (!isLoading) return null;

  return (
    <div className='dashlite-spinner-overlay'>
      <Spinner color='primary' />
      <span className='visually-hidden'>Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
