import clsx from 'clsx';
import {
  BackButton,
  Button,
  Loader,
  LoaderBox,
  Section,
} from 'common/components';
import { CameraLine, Check, LocationOn, Repeat } from 'common/icons';
import { useFmtMsg } from 'modules/intl';
import { Layout } from 'modules/layout';
import { useLogLocationFailed, useLogLocationSucceeded } from 'modules/logging';
import { openSnackbar } from 'modules/snackbar';
import { useEffect, useRef } from 'react';
import { useNewPlantStore } from '../store';

export const CaptureModal: React.FC = () => {
  const fmtMsg = useFmtMsg();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<HTMLVideoElement>(null);

  const store = useNewPlantStore();

  const logLocationFailed = useLogLocationFailed();
  const logLocationSucceeded = useLogLocationSucceeded();

  const capture = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    const player = playerRef.current;
    if (!canvas || !player || !context) {
      return;
    }
    const captured_at = new Date().toISOString();
    context.drawImage(player, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/jpeg', 0.5);
    store.setIsGettingLocation(true);
    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        store.setIsGettingLocation(false);
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        const accuracy = position.coords.accuracy;
        store.setTmpImage({
          captured_at,
          image,
          latitude,
          longitude,
        });
        logLocationSucceeded(accuracy);
      },
      (error) => {
        store.setIsGettingLocation(false);
        openSnackbar(
          fmtMsg('failedToGetLocation', { error: error.message }),
          'error'
        );
        logLocationFailed({
          name: 'GeolocationPositionError',
          message: error.message,
        });
      },
      {
        timeout: 5000,
      }
    );
  };

  useEffect(() => {
    if (!playerRef.current || !store.stream) {
      return;
    }
    playerRef.current.srcObject = store.stream;
  }, [store.stream]);

  return (
    <div
      className={clsx(
        !store.isCaptureModalOpen && 'hidden',
        'fixed left-0 right-0 top-0 bottom-0 bg-white dark:bg-teal-900 z-10'
      )}
    >
      <Layout>
        <Section
          actions={
            <div className='space-y-4'>
              {store.tmpImage ? (
                <>
                  <Button
                    Icon={Repeat}
                    size='lg'
                    type='secondary'
                    onClick={() => store.setTmpImage(undefined)}
                  >
                    {fmtMsg('retake')}
                  </Button>
                  <Button
                    Icon={Check}
                    onClick={() => {
                      store.setImage(store.tmpImage);
                      store.closeCapture();
                    }}
                  >
                    {fmtMsg('keep')}
                  </Button>
                </>
              ) : (
                <Button
                  Icon={CameraLine}
                  disabled={store.isCameraLoading}
                  onClick={capture}
                >
                  {fmtMsg('capture')}
                </Button>
              )}
            </div>
          }
        >
          <div className='flex flex-col gap-4'>
            <BackButton onClick={store.closeCapture} />
            <LoaderBox visible={store.isCameraLoading} />
            <video
              className={clsx(
                'rounded-lg',
                (store.isCameraLoading || store.tmpImage) && 'hidden',
                'w-full'
              )}
              autoPlay
              playsInline
              ref={playerRef}
            />
            <canvas
              className={clsx(
                'rounded-lg w-full',
                (store.isCameraLoading || !store.tmpImage) && 'hidden'
              )}
              ref={canvasRef}
              width='960'
              height='1280'
            />
            {store.isGettingLocation && (
              <div className='flex gap-4 items-center justify-center'>
                <LocationOn
                  overrideColor
                  pathClassName='fill-gray-500'
                  svgClassName='h-7 min-h-7 min-w-7 opacity-80 w-7'
                />
                <Loader />
              </div>
            )}
          </div>
        </Section>
      </Layout>
    </div>
  );
};
