import React from 'react';
import locationBg from '@/assets/splash-screen.jpg';
import { DetailsHeader } from '../common/components/DetailsHeader';
import { appTheme } from 'plugins/appTheme';
import { useFmtMsg } from 'modules/intl';
import { useNewPlantStore } from '../modules/new-plant/store';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthRequired } from 'modules/auth';

export const LocationSummary: React.FC = () => {
  useAuthRequired();
  const fmtMsg = useFmtMsg();
  const store = useNewPlantStore();
  const navigate = useNavigate();
  const location = useLocation();
  const navigateToDashboard = () => navigate('/dashboard');
  const goToManualLocationSelection = () => navigate('/location');
  const tmpImage = location.state || store.tmpImage;
  const latitude = tmpImage?.latitude;
  const longitude = tmpImage?.longitude;

  return (
    <div className='flex items-center justify-center w-screen'>
      <div className='relative w-full max-w-md h-dvh overflow-hidden'>
        {/* Background */}
        <div className='absolute inset-0 z-0 w-full h-full'>
          <img
            alt='Location Screen'
            src={locationBg}
            className='w-full h-full object-cover'
          />
          <div
            className='absolute inset-0 bg-black'
            onClick={navigateToDashboard}
            style={{ opacity: '0.4' }}
          ></div>
        </div>

        {/* Input Fields */}
        <div className='absolute bottom-0 left-0 right-0 z-10 w-full'>
          <div className='w-full px-2 pb-2 pt-0 bg-white rounded-t-3xl shadow-md relative'>
            {/* Header */}
            <div className='mb-6 flex gap-2 flex-col'>
              <DetailsHeader
                title={fmtMsg('location')}
                onClose={navigateToDashboard}
                draggable
              />

              <div className='flex flex-col px-7 space-y-6'>
                <span
                  className='text-medium font-medium'
                  style={{
                    color: appTheme.secondaryPalette.davysGray,
                  }}
                >
                  {fmtMsg('currentLocationDetection')} ({latitude}, {longitude})
                </span>
                <div
                  className='text-medium font-regular underline cursor-pointer'
                  style={{
                    color: appTheme.secondaryPalette.seaGreen,
                  }}
                  onClick={goToManualLocationSelection}
                >
                  {fmtMsg('changeLocation')}
                </div>
                <button
                  type='submit'
                  className='w-full text-base font-medium py-3 mt-1 rounded-3xl focus:outline-none'
                  style={{
                    color: appTheme.primaryPalette.white,
                    backgroundColor: appTheme.secondaryPalette.seaGreen,
                  }}
                  aria-label='Save'
                  onClick={navigateToDashboard}
                >
                  {fmtMsg('save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
