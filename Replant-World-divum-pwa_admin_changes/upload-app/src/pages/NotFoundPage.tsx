import { useFmtMsg } from 'modules/intl';
import { Link } from 'react-router-dom';
import { InstallButton } from 'modules/install';
import { useOfflineStore } from 'modules/offline';

// Import assets
import loginBackGround from '@/assets/splash-screen.jpg';
import logo from '@/assets/logo.svg';
import { appTheme } from 'plugins/appTheme';

type Props = {
  hideInstall?: boolean;
};

export const NotFoundPage: React.FC<Props> = ({ hideInstall = false }) => {
  const { isUploading } = useOfflineStore();
  const fmtMsg = useFmtMsg();

  return (
    <div className='flex items-center justify-center w-screen'>
      <div className='relative w-full max-w-md h-dvh overflow-hidden'>
        {/* Background */}
        <div className='absolute inset-0 z-0 w-full h-full'>
          <div>
            <img
              alt='Not Found Screen'
              src={loginBackGround}
              className='w-full h-full object-cover'
            />
            <img
              alt='Logo'
              src={logo}
              className='absolute top-8 left-2 m-4 w-12 h-12 object-contain z-10'
            />
            <div className='absolute top-8 right-2 m-4 object-contain z-10'>
              {!hideInstall && !isUploading && <InstallButton />}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='absolute bottom-0 left-0 right-0 z-10 w-full'>
          <div className='w-full p-4 bg-white rounded-t-3xl shadow-md'>
            {/* Header */}
            <div className='text-center mb-6 flex gap-2 flex-col'>
              <h1
                className='text-2xl font-semibold'
                style={{
                  color: appTheme.primaryPalette.black,
                }}
              >
                {fmtMsg('pageNotFound')}
              </h1>
              <p
                className='text-[0.8125rem] font-semibold'
                style={{
                  color: appTheme.secondaryPalette.lightBlack,
                }}
              >
                {fmtMsg('pageYouAreTryingToReachDoesNotExist')}
              </p>
            </div>

            {/* Go to Dashboard button */}
            <Link to={'/dashboard'}>
              <button
                className='w-full text-sm font-medium py-2.5 rounded-3xl focus:outline-none'
                style={{
                  color: appTheme.primaryPalette.white,
                  backgroundColor: appTheme.secondaryPalette.darkForestGreen,
                }}
              >
                {fmtMsg('goToDashboard')}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
