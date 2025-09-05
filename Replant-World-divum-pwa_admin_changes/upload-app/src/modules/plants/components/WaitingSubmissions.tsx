import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import clsx from 'clsx';
import { Alert, Button, LoaderBox } from 'common/components';
import { CloudOff, Upload2 } from 'common/icons';
import { prettifyError, useInfiniteScrolling } from 'common/utils';
import { useFmtMsg } from 'modules/intl';
import {
  offlineTreesQueryKey,
  useIsOnline,
  useOfflineStore,
  useOfflineTreesInfinite,
} from 'modules/offline';
import { openSnackbar } from 'modules/snackbar';
import { WaitingPlantTile } from '.';
import { allPlantsQueryKey } from '..';

export const WaitingSubmissions: React.FC = () => {
  const fmtMsg = useFmtMsg();

  const queryClient = useQueryClient();

  const store = useOfflineStore();

  const isOnline = useIsOnline();

  const showUploadButton = store.totalCount > 0 && !store.isUploading;

  const upload = async () => {
    try {
      await store.upload();
      openSnackbar(fmtMsg('uploadFinishedSuccessfully'), 'success');
    } catch (e) {
      openSnackbar(
        fmtMsg('uploadAborted', {
          error: e instanceof AxiosError ? prettifyError(e) : String(e),
        }),
        'error'
      );
    } finally {
      queryClient.invalidateQueries({ queryKey: allPlantsQueryKey });
      queryClient.invalidateQueries({ queryKey: offlineTreesQueryKey });
    }
  };

  const { lastItemRef } = useInfiniteScrolling(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useOfflineTreesInfinite();

  const plants = data?.pages.flatMap((page) => page.results);

  return (
    <div className='space-y-5'>
      {showUploadButton && (
        <div className='flex gap-4 items-center'>
          <Button
            Icon={Upload2}
            disabled={!isOnline}
            size='md'
            onClick={upload}
          >
            {fmtMsg('uploadAll')}
          </Button>
          {!isOnline && (
            <div className='flex gap-2 items-center text-sm'>
              <CloudOff svgClassName='w-4 h-4 min-w-4 min-h-4' />
              {fmtMsg('youAreOffline')}
            </div>
          )}
        </div>
      )}
      <div className='space-y-2.5'>
        {plants?.map((plant, idx, plants) => (
          <WaitingPlantTile
            key={plant.id}
            plant={plant.tree}
            ref={idx === plants.length - 1 ? lastItemRef : undefined}
          />
        ))}
        {plants?.length === 0 && (
          <div className='text-center'>
            {fmtMsg('youHaveNoTreesWaitingForSubmission')}
          </div>
        )}
        <Alert
          className={clsx(!error && 'hidden')}
          severity='error'
          header={fmtMsg('failedToLoadWaitingTrees')}
          text={error ? String(error) : ''}
        />
        <LoaderBox visible={isFetching} />
      </div>
    </div>
  );
};
