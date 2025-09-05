import { formattedDate } from 'common/utils';
import { useFmtMsg } from 'modules/intl';
import { forwardRef } from 'react';
import { Plant } from '.';
import { ReviewStatePill } from './components';

type Props = {
  plant: Plant;
};

export const PlantTile = forwardRef<HTMLDivElement, Props>(({ plant }, ref) => {
  const fmtMsg = useFmtMsg();

  return (
    <div
      className='p-2.5 rounded-xl dark:bg-teal-700 border dark:border-0 border-teal-600  text-black dark:text-white space-y-2'
      ref={ref}
    >
      <div className='flex gap-4 relative'>
        <img
          src={plant.image}
          alt='Tree'
          className='aspect-3/4 object-cover rounded-md w-28 h-full'
        />
        <div className='flex flex-col text-sm font-light'>
          <span className='text-base font-bold'>
            {plant.species.botanical_name}
          </span>
          <span className='mb-3'>{plant.species.common_name}</span>
          <span>{`${plant.latitude}, ${plant.longitude}`}</span>
          <span>{formattedDate(plant.created_at)}</span>
          <span>{`#${plant.id}`}</span>
        </div>
        <div className='absolute bottom-0 right-0'>
          <ReviewStatePill state={plant.review_state} />
        </div>
      </div>
      {plant.rejection_reason && (
        <div className='text-red-400 text-sm'>
          {fmtMsg('rejectionReason') + ': ' + plant.rejection_reason}
        </div>
      )}
    </div>
  );
});
