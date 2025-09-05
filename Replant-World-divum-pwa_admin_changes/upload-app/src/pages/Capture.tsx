import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '@/assets/logo.svg';
import close from '@/assets/close-white.svg';
import keep from '@/assets/keep.svg';
import retake from '@/assets/retake.svg';
// import camera from '@/assets/camera.svg';
import ellipse from '@/assets/light-ellipse.svg';
import { appTheme } from 'plugins/appTheme';
import { useNewPlantStore } from '../modules/new-plant/store';
import { openSnackbar } from 'modules/snackbar';
import { useLogLocationFailed, useLogLocationSucceeded } from 'modules/logging';
import { PlantSelection } from './PlantSelection';
import { useFmtMsg } from 'modules/intl';
import { Camera } from '@/common/icons';
import { useAuthRequired } from 'modules/auth';

type Props = {
  hideInstall?: boolean;
};
export const Capture: React.FC<Props> = () => {
  useAuthRequired();

  const store = useNewPlantStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPreview, setIsPreview] = useState(false);
  const [showPlantSelection, setShowPlantSelection] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const playerRef = useRef<HTMLVideoElement>(null);
  const fmtMsg = useFmtMsg();
  const logLocationFailed = useLogLocationFailed();
  const logLocationSucceeded = useLogLocationSucceeded();

  // Initialize camera when entering capture mode
  useEffect(() => {
    if (location.pathname === '/capture' && !store.isCaptureModalOpen) {
      store.openCapture(fmtMsg);
    }
  }, [location.pathname, store, fmtMsg]);

  // Set video stream to player when available
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !store.stream) return;

    player.srcObject = store.stream;

    // Wait for video to be ready
    player.onloadedmetadata = () => {
      player.play().catch((err) => console.error('Error playing video:', err));
    };

    return () => {
      if (store.stream) {
        store.stream.getTracks().forEach((track) => track.stop());
        player.srcObject = null; // Clear the video source
      }
    };
  }, [store.stream]);

  useEffect(() => {
    return () => {
      store.setTmpImage(undefined);
      store.setIsGettingLocation(false);
      store.closeCapture();
      store.setCameraPermissionDenied(false);
    };
  }, []);

  // Capture image and handle location logic
  const captureImage = async () => {
    const player = playerRef.current!;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Set canvas dimensions to match video frame
    canvas.width = player.videoWidth;
    canvas.height = player.videoHeight;

    // Draw the current video frame to the canvas
    ctx.drawImage(player, 0, 0, canvas.width, canvas.height);

    const capturedImage = {
      image: canvas.toDataURL('image/jpeg', 0.8),
      captured_at: new Date().toISOString(),
      latitude: '',
      longitude: '',
    };

    store.setTmpImage(capturedImage);
    store.setIsGettingLocation(true);
    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        const accuracy = position.coords.accuracy;
        const updatedImage = {
          ...capturedImage,
          latitude: latitude,
          longitude: longitude,
        };

        store.setTmpImage(updatedImage);
        logLocationSucceeded(accuracy);
      },
      (error) => {
        store.setIsGettingLocation(false);
        openSnackbar(fmtMsg('locationPermissionDenied'), 'error');
        logLocationFailed({
          name: 'GeolocationPositionError',
          message: error.message,
        });
      },
      {
        timeout: 5000,
      }
    );
    store.setIsGettingLocation(false);
    setIsPreview(true);
  };

  // Retake photo
  const handleRetake = async () => {
    setIsPreview(false); // Exit preview mode
    store.setTmpImage(undefined);
    store.openCapture(fmtMsg);
    navigate('/capture');
  };

  // Proceed to next step
  const handleProceed = () => {
    if (store.tmpImage) {
      store.setImage(store.tmpImage);
      setShowPlantSelection(true); // Show PlantSelection component
      // store.closeCapture();
    }
  };

  // Selector button component for main screen
  const CaptureSelector = () => (
    <div>
      <span>{fmtMsg('photo')}</span>
      <div
        className={clsx(
          'border py-4 px-5 rounded-full flex justify-center items-center gap-2',
          store.imageError
            ? 'border-red-400 dark:border-red-400'
            : 'border-black dark:border-white'
        )}
        onClick={() => {
          // Open capture and immediately navigate to the capture page
          store.openCapture(fmtMsg);
          navigate('/capture');
        }}
      >
        <Camera
          pathClassName='fill-[#FFFFFF]'
          overrideColor
          svgClassName='opacity-90 size-7'
        />
        <span className='font-bold'>
          {store.image ? fmtMsg('changePhoto') : fmtMsg('capturePhoto')}
        </span>
      </div>
      {store.imageError && (
        <span className={'text-left text-red-400 dark:text-red-400'}>
          {store.imageError}
        </span>
      )}
    </div>
  );

  // Full-screen capture view
  const CaptureView = () => (
    <div className='fixed inset-0 flex items-start justify-center z-50'>
      <div
        className='max-w-md w-full h-full relative flex flex-col'
        style={{ backgroundColor: appTheme.secondaryPalette.darkTealGreen }}
      >
        {/* Logo at the top */}
        <div className='pt-4 px-6 flex-row flex items-center justify-between'>
          <div>
            <img alt='Logo' src={logo} className='w-12 h-12 object-contain' />
          </div>
          <div onClick={() => navigate('/dashboard')}>
            <img
              alt='Close'
              src={close}
              className='w-10 h-10 object-contain cursor-pointer opacity-40'
            />
          </div>
        </div>

        {/* Center content area - takes up most of the space */}
        <div className='flex-grow flex items-center justify-center p-4 relative'>
          {/* Hidden video element for capturing - always present but hidden when in preview */}
          <div
            className={clsx('relative w-[90%] h-[80%]', isPreview && 'hidden')}
          >
            <video
              className={clsx('w-full h-full object-cover')}
              autoPlay
              playsInline
              muted
              ref={playerRef}
            />
            <div
              className='absolute inset-4 rounded-lg pointer-events-none'
              style={{
                border: '2px dashed white',
                opacity: '30%',
              }}
            ></div>
            {/* Custom corner borders */}
            <div className='absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg'></div>
            <div className='absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg'></div>
            <div className='absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg'></div>
            <div className='absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg'></div>
          </div>

          {/* Image element for captured image in preview mode */}
          {isPreview && store.tmpImage && (
            <img
              src={store.tmpImage.image}
              alt='Captured Preview'
              className={clsx(
                'w-[90%] h-[80%] object-cover',
                !isPreview && 'hidden'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
            />
          )}

          {/* Fallback image display if image fails to load */}
          {isPreview && store.tmpImage && !imageLoaded && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='bg-gray-800 text-white p-4 rounded'>
                Failed to load preview
              </div>
            </div>
          )}

          {/* Loader for geolocation */}
          {store.isGettingLocation && (
            <div className='absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white px-6 py-4 rounded-lg'>
              Getting location...
            </div>
          )}

          {/* Loading indicator for camera */}
          {store.isCameraLoading && !isPreview && (
            <div className='absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white px-6 py-4 rounded-lg'>
              Loading camera...
            </div>
          )}
        </div>

        {/* Bottom area for controls */}
        <div className='p-6'>
          {!isPreview ? (
            <div
              className={clsx(
                'mx-auto w-16 h-16 relative',
                store.cameraPermissionDenied
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer'
              )}
              onClick={!store.cameraPermissionDenied ? captureImage : undefined} // Disable onClick if permission is denied
            >
              <img src={ellipse} alt='Ellipse' className='w-full h-full' />
              <Camera
                pathClassName='fill-[#FFFFFF]'
                overrideColor
                svgClassName={clsx(
                  'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8',
                  store.cameraPermissionDenied ? 'opacity-50' : 'opacity-100' // Visual indication
                )}
              />
            </div>
          ) : (
            <div className='flex flex-row items-center justify-between gap-4'>
              <button
                type='button'
                className='w-full text-base font-semibold py-3 rounded-3xl focus:outline-none border'
                style={{
                  color: appTheme.primaryPalette.white,
                  backgroundColor: appTheme.secondaryPalette.darkTealGreen,
                  borderColor: appTheme.secondaryPalette.darkForestGreen,
                }}
                onClick={handleRetake}
              >
                <div className='flex flex-row items-center justify-center gap-4'>
                  <img
                    src={retake}
                    alt='Retake'
                    className='w-[1.3rem] h-[1.3rem]'
                  />
                  {fmtMsg('retake')}
                </div>
              </button>
              <button
                type='button'
                className='w-full text-base font-semibold py-3 rounded-3xl focus:outline-none'
                style={{
                  color: appTheme.primaryPalette.white,
                  backgroundColor: appTheme.secondaryPalette.darkForestGreen,
                }}
                onClick={handleProceed}
              >
                <div className='flex flex-row items-center justify-center gap-4'>
                  <img
                    src={keep}
                    alt='Keep'
                    className='w-[0.9rem] h-[1.3rem]'
                  />
                  {fmtMsg('keep')}
                </div>
              </button>
            </div>
          )}
        </div>

        {showPlantSelection && (
          <PlantSelection
            onClose={() => setShowPlantSelection(false)}
            tmpImage={store.tmpImage}
          />
        )}
      </div>
    </div>
  );

  // Determine which component to render
  const renderComponent = () => {
    if (location.pathname === '/capture' || store.isCaptureModalOpen) {
      return <CaptureView />;
    } else {
      return <CaptureSelector />;
    }
  };

  return <>{renderComponent()}</>;
};

export default Capture;
