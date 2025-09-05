import replantWorldImg from '@/assets/replant.png';
import clsx from 'clsx';
import { InstallButton } from 'modules/install';
import { NavigationBar } from 'modules/navigation';
import { useOfflineStore } from 'modules/offline';
import { UploadProgressBar } from 'modules/plants/components';

type Props = {
  children?: React.ReactNode;
  hideInstall?: boolean;
  navigation?: boolean;
};

export const Layout: React.FC<Props> = ({
  children,
  navigation = false,
  hideInstall = false,
}) => {
  const { isUploading } = useOfflineStore();

  return (
    <div className='max-w-xl mx-auto h-dvh'>
      <div className='p-4 flex gap-4 items-center justify-between'>
        <img className='h-9 invert dark:invert-0' src={replantWorldImg} />
        <UploadProgressBar />
        {!hideInstall && !isUploading && <InstallButton />}
      </div>
      <div
        className={clsx(
          navigation ? `h-[calc(100dvh-148px)]` : `h-[calc(100dvh-84px)]`,
          navigation
            ? `max-h-[calc(100dvh-148px)]`
            : `max-h-[calc(100dvh-84px)]`,
          'overflow-y-auto'
        )}
      >
        <div className='px-4 h-full min-h-full max-h-full'>{children}</div>
      </div>
      {navigation ? (
        <div className='h-20 p-4'>
          <NavigationBar />
        </div>
      ) : (
        <div className='h-4' />
      )}
    </div>
  );
};
