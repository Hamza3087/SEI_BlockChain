import React from 'react';
import loginBackGround from '@/assets/splash-screen.jpg';
import { appTheme } from 'plugins/appTheme';
import { DetailsHeader } from '../common/components/DetailsHeader';
import { useNavigate } from 'react-router-dom';
import { useFmtMsg } from 'modules/intl';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const fmtMsg = useFmtMsg();
  const goBack = () => navigate(-1);

  return (
    <div className='flex items-center justify-center w-screen'>
      <div className='relative w-full max-w-md h-dvh overflow-hidden'>
        {/* Background */}
        <div className='absolute inset-0 z-0 w-full h-full'>
          <img
            alt='Login Screen'
            src={loginBackGround}
            className='w-full h-full object-cover'
          />
          <div
            className='absolute inset-0 bg-black'
            onClick={goBack}
            style={{ opacity: '0.4' }}
          ></div>
        </div>

        {/* Input Fields */}
        <div className='absolute bottom-0 left-0 right-0 z-10 w-full'>
          <div className='w-full px-2 pb-2 pt-0 bg-white rounded-t-3xl shadow-md'>
            {/* Header */}
            <div className='mb-6 flex gap-2 flex-col'>
              <DetailsHeader
                title={fmtMsg('needHelpAccessingAccount')}
                onClose={goBack}
                draggable
              />

              <p
                className=' py-0 px-8 pl-7 pt-2 text-left text-[0.9125rem] font-medium'
                style={{
                  color: appTheme.secondaryPalette.davysGray,
                }}
              >
                {fmtMsg('contactCoordinatorAndAskForLink')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
