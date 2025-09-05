import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRequired } from 'modules/auth'; // Assuming this hook checks authentication
import splashScreen from '@/assets/splash-screen.jpg';
import logo from '@/assets/logo.svg';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthRequired();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated]);

  return (
    <div className='w-full h-dvh overflow-hidden relative'>
      <div className='flex items-center justify-center h-full'>
        <img
          alt='Splash Screen'
          src={splashScreen}
          className='object-contain'
        />
        <img
          alt='Logo'
          src={logo}
          className='absolute w-20 h-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-contain'
        />
      </div>
    </div>
  );
};
