import clsx from 'clsx';
import { Alert, LoaderBox } from 'common/components';
import { prettifyError, useInfiniteScrolling } from 'common/utils';
import { useFmtMsg } from 'modules/intl';
import { PlantTile, usePlantsInfinite } from '..';

export const CompletedSubmissions: React.FC = () => {
  const fmtMsg = useFmtMsg();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = usePlantsInfinite();

  const { lastItemRef } = useInfiniteScrolling(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  const plants = data?.pages.flatMap((page) => page.results);

  return (
    <>
      <div className='space-y-2.5'>
        {plants?.map((plant, idx, plants) => (
          <PlantTile
            key={plant.id}
            plant={plant}
            ref={idx === plants.length - 1 ? lastItemRef : undefined}
          />
        ))}
      </div>
      {plants?.length === 0 && (
        <div className='text-center'>
          {fmtMsg('youHaveNotSubmittedAnyTreesYet')}
        </div>
      )}
      <Alert
        className={clsx(!error && 'hidden')}
        severity='error'
        text={error ? prettifyError(error) : ''}
      />
      <LoaderBox visible={isFetching} />
    </>
  );
};
