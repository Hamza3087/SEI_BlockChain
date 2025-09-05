import { Summary, SummaryItem } from 'common/components';
import { ImageLine } from 'common/icons';
import { useFmtMsg } from 'modules/intl';
import { useNewPlantStore } from '../store';

export const NewPlantSummary: React.FC = () => {
  const fmtMsg = useFmtMsg();

  const store = useNewPlantStore();

  return (
    <Summary>
      <SummaryItem>
        <span>{fmtMsg('photo')}</span>
        <div className='rounded border border-black dark:border-white h-20 aspect-3/4 flex items-center justify-center box-content'>
          {store.image ? (
            <img className='h-20 rounded' src={store.image.image} />
          ) : (
            <ImageLine svgClassName='opacity-90' />
          )}
        </div>
      </SummaryItem>
      <SummaryItem>
        <span>{fmtMsg('botanicalName')}</span>
        <span className='text-right'>
          {store.species?.species.botanical_name ?? '-'}
        </span>
      </SummaryItem>
      <SummaryItem>
        <span>{fmtMsg('commonName')}</span>
        <span className='text-right'>
          {store.species?.species.common_name ?? '-'}
        </span>
      </SummaryItem>
      <SummaryItem>
        <span>{fmtMsg('location')}</span>
        <span className='text-right'>
          {store.image
            ? `${store.image.latitude}, ${store.image.longitude}`
            : ' -'}
        </span>
      </SummaryItem>
    </Summary>
  );
};
