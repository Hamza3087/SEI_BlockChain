import { useFmtMsg } from 'modules/intl';
import { useNavigate } from 'react-router-dom';
import { InstallButton } from 'modules/install';
import { useOfflineStore } from 'modules/offline';

// Import assets
import loginBackGround from '@/assets/splash-screen.jpg';
import logo from '@/assets/logo.svg';
import { appTheme } from 'plugins/appTheme';

import androidStep1 from './assets/android-chrome-step-1.webp';
import androidStep2 from './assets/android-chrome-step-2.webp';
import androidStep3 from './assets/android-chrome-step-3.webp';
import iosStep1 from './assets/ios-safari-step-1.webp';
import iosStep2 from './assets/ios-safari-step-2.webp';
import iosStep3 from './assets/ios-safari-step-3.webp';

type Props = {
  hideInstall?: boolean;
};

export const InstallationSteps: React.FC<Props> = ({ hideInstall = false }) => {
  const { isUploading } = useOfflineStore();
  const fmtMsg = useFmtMsg();

  // The app is mobile only, no need to detect Windows or Linux user agents.
  const ua = window.navigator.userAgent;
  const isAndroid = /Android/.test(ua);
  const isApple = /iPhone|Macintosh/.test(ua);

  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <div className='flex items-center justify-center w-screen'>
      <div className='relative w-full max-w-md h-dvh overflow-hidden'>
        {/* Background */}
        <div className='absolute inset-0 z-0 w-full h-full'>
          <div>
            <img
              alt='Installation Screen'
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
          <div className='w-full p-4 bg-white rounded-t-3xl shadow-md max-h-[65vh] overflow-y-auto'>
            {/* Header */}
            <div className='text-center mb-6 flex gap-2 flex-col'>
              <h1
                className='text-2xl font-semibold'
                style={{
                  color: appTheme.primaryPalette.black,
                }}
              >
                {fmtMsg('installation')}
              </h1>
              <p
                className='text-[0.9rem] font-semibold'
                style={{
                  color: appTheme.secondaryPalette.lightBlack,
                }}
              >
                {fmtMsg('followTheStepsBelowToInstallTheApp')}
              </p>
            </div>

            {/* Installation Steps */}
            <div className='space-y-4 mb-6'>
              {isApple && (
                <>
                  <Step img={iosStep1} text={fmtMsg('clickTheShareButton')} />
                  <Step
                    img={iosStep2}
                    text={fmtMsg('scrollDownToFindAddToHomeScreenOptionAndSelectIt')}
                  />
                  <Step img={iosStep3} text={fmtMsg('clickAddToConfirmInstallation')} />
                </>
              )}
              {isAndroid && (
                <>
                  <Step img={androidStep1} text={fmtMsg('clickTheOptionsMenuButton')} />
                  <Step img={androidStep2} text={fmtMsg('selectInstallAppOption')} />
                  <Step
                    img={androidStep3}
                    text={fmtMsg('clickInstallToConfirmInstallation')}
                  />
                </>
              )}
            </div>

            <p
              className='text-center mb-6 text-[0.9rem] font-semibold'
              style={{
                color: appTheme.secondaryPalette.lightBlack,
              }}
            >
              {fmtMsg('theAppIsNowInstalledAndAddedToTheHomeScreen')}
            </p>

            {/* Back button */}
            <button
              onClick={goBack}
              className='w-full text-sm font-medium py-2.5 rounded-3xl focus:outline-none'
              style={{
                color: appTheme.primaryPalette.white,
                backgroundColor: appTheme.secondaryPalette.darkForestGreen,
              }}
            >
              {fmtMsg('back')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Step: React.FC<{ img: string; text: string }> = ({ img, text }) => (
  <div>
    <img
      className='rounded-xl max-w-64 mx-auto mb-1 border border-teal-900 dark:border-white'
      src={img}
    />
    <p className='text-center text-sm'>{text}</p>
  </div>
);
