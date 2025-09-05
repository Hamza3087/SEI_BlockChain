import { useQuery } from '@tanstack/react-query';
import { Loader, Pagination, ReplantLogo } from 'common/components';
import { useFmtMsg } from 'modules/intl';
import { useEffect, useState } from 'react';
import { SponsorSearchBox } from './SponsorSearchBox';
import { SponsorSummary } from './SponsorSummary';
import { TreesGrid } from './TreesGrid';
import { getTrees } from './api';
import { SponsorSimple } from './types';
import { MapButton } from './MapButton';

export function Gallery() {
  const fmtMsg = useFmtMsg();
  const [offset, setOffset] = useState(0);
  const [sponsor, setSponsor] = useState<SponsorSimple | null>(null);

  const { data: trees, isLoading } = useQuery({
    queryKey: ['trees', offset, sponsor],
    queryFn: () => getTrees({ offset, sponsor: sponsor?.id }),
  });

  useEffect(() => {
    const el = document.getElementById('root-scroll');
    if (el) {
      el.scrollTo({ top: 0 });
    }
  }, [trees]);

  function onSearch(sponsor: SponsorSimple | null) {
    setSponsor(sponsor);
    setOffset(0);
  }

  return (
    <div className='p-2 pb-12 lg:px-20 lg:py-12 flex flex-col gap-10'>
      <div className='flex justify-between gap-10'>
        <ReplantLogo />
        <div className='flex gap-4 items-center'>
          <MapButton />
          <SponsorSearchBox onSearch={onSearch} />
        </div>
      </div>

      <div className='text-3xl text-center font-light'>
        {fmtMsg('replantWorldsProofOfPlantingNftGallery')}
      </div>

      {sponsor && <SponsorSummary sponsor={sponsor} />}

      {isLoading && (
        <div className='flex justify-center my-20'>
          <Loader />
        </div>
      )}

      {trees && (
        <>
          <div>
            {sponsor && (
              <h3 className='text-xl font-bold mb-4'>
                {fmtMsg('sponsoredTrees')}
              </h3>
            )}
            <TreesGrid trees={trees?.results} />
            {trees?.count === 0 && <p>{fmtMsg('noTrees')}</p>}
          </div>
          <div className='flex justify-center'>
            <Pagination
              paginated={trees}
              onPaginated={(paginate) => setOffset(paginate.offset)}
            />
          </div>
        </>
      )}
    </div>
  );
}
