import { useQuery } from '@tanstack/react-query';
import { useFmtMsg } from 'modules/intl';
import { IconCoin, IconLeaf, IconSponsor, IconTree } from 'common/components';
import { SponsorSummaryBox } from './SponsorSummaryBox';
import { SponsorSimple } from './types';
import { getSponsor } from './api';

type SponsorSummaryProps = {
  sponsor: SponsorSimple;
};

export function SponsorSummary({ sponsor: sponsor }: SponsorSummaryProps) {
  const fmtMsg = useFmtMsg();

  const { data } = useQuery({
    queryKey: ['sponsorDetails', sponsor],
    queryFn: () => getSponsor(sponsor.id),
  });

  return (
    <div>
      <div className='flex gap-3 items-center mb-4'>
        <IconSponsor className='w-6' />
        <h2 className='text-2xl font-bold'>{sponsor.name}</h2>
      </div>
      {data ? (
        <div className='flex flex-col sm:flex-row gap-5 w-full'>
          <SponsorSummaryBox
            icon={
              <IconTree
                className='w-8 h-8 fill-green-400 dark:fill-green-300'
                overrideColors={true}
              />
            }
            label={fmtMsg('sponsoredTrees')}
            value={data?.trees}
          />
          <SponsorSummaryBox
            icon={
              <IconLeaf
                className='w-8 h-8 fill-green-400 dark:fill-green-300'
                overrideColors={true}
              />
            }
            label={fmtMsg('speciesOfTrees')}
            value={data?.species}
          />
          <SponsorSummaryBox
            icon={
              <IconCoin
                className='w-8 h-8 fill-green-400 dark:fill-green-300'
                overrideColors={true}
              />
            }
            label={fmtMsg('sponsoredTreesValues')}
            value={`${Number(data.total_trees_cost_usd).toLocaleString()} USD`}
          />
        </div>
      ) : null}
    </div>
  );
}
