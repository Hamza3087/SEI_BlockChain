import { useSpecies } from 'modules/species';
import { forwardRef } from 'react';
import { NewTree } from '..';

type Props = {
  plant: NewTree;
};

export const WaitingPlantTile = forwardRef<HTMLDivElement, Props>(
  ({ plant }, ref) => {
    const { data: species } = useSpecies();

    const { botanical_name, common_name } =
      species?.find((species) => species.id === plant.assigned_species_id)
        ?.species || {};

    return (
      <div
        className='p-2.5 rounded-xl dark:bg-teal-700 border dark:border-0 border-teal-600  text-black dark:text-white space-y-2'
        ref={ref}
      >
        <div className='flex gap-4'>
          <img
            src={plant.image}
            alt='Tree'
            className='aspect-3/4 object-cover rounded-md w-28 h-full'
          />
          <div className='flex flex-col text-sm font-light'>
            <span className='text-base font-bold'>{botanical_name}</span>
            <span className='mb-3'>{common_name}</span>
            <span>{`${plant.latitude}, ${plant.longitude}`}</span>
          </div>
        </div>
      </div>
    );
  }
);
