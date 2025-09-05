import { LoaderBox } from 'common/components';
import { Check, Close, FindInPage, Park } from 'common/icons';
import { useFmtMsg } from 'modules/intl';
import { PlantTile, usePlants, usePlantsSummary } from 'modules/plants';
import { useSpecies } from 'modules/species';
import { InfoBox } from './InfoBox';

export const Dashboard: React.FC = () => {
  const fmtMsg = useFmtMsg();

  const { data: summary, isLoading: isLoadingSummary } = usePlantsSummary();

  const { data: plants, isLoading: isLoadingPlants } = usePlants(1, '');

  useSpecies(); // just fetch them so that they get saved to indexed DB immediately after login

  return (
    <div>
      <div className='grid grid-cols-2 gap-3 mb-5'>
        <InfoBox
          title={fmtMsg('addedTrees')}
          icon={
            <Park
              overrideColor
              pathClassName='fill-white'
              svgClassName='h-7 w-7'
            />
          }
          isLoading={isLoadingSummary}
          value={summary?.added_count}
          className={'bg-blue-400'}
        />
        <InfoBox
          title={fmtMsg('pendingTrees')}
          icon={
            <FindInPage
              overrideColor
              pathClassName='fill-white'
              svgClassName='h-7 w-7'
            />
          }
          isLoading={isLoadingSummary}
          value={summary?.pending_review_count}
          className={'bg-bisque-400'}
        />
        <InfoBox
          title={fmtMsg('approvedTrees')}
          icon={
            <Check
              overrideColor
              pathClassName='fill-white'
              svgClassName='h-6 w-6'
            />
          }
          isLoading={isLoadingSummary}
          value={summary?.approved_count}
          className={'bg-green-400'}
        />
        <InfoBox
          title={fmtMsg('rejectedTrees')}
          icon={
            <Close
              overrideColor
              pathClassName='fill-white'
              svgClassName='h-6 w-6'
            />
          }
          isLoading={isLoadingSummary}
          value={summary?.rejected_count}
          className={'bg-red-400'}
        />
      </div>
      <LoaderBox visible={isLoadingPlants} />
      <div className='space-y-2.5'>
        {plants?.results.slice(0, 3).map((plant) => (
          <PlantTile plant={plant} key={plant.id} />
        ))}
      </div>
    </div>
  );
};
