import React, { useMemo, useEffect } from 'react';
import checked from '@/assets/check.svg';
import unChecked from '@/assets/circle-empty.svg';
import { appTheme } from 'plugins/appTheme';
import { useSpecies } from 'modules/species';

interface SpeciesCardProps {
  onSelectSpecies: (speciesId: number | null, species: any) => void;
  selectedSpeciesId: number | null;
  sortOrder?: 'asc' | 'desc';
  searchFilter?: number | null;
  onSpeciesCountChange: (count: number) => void; // Add a callback prop for species count
}

export const SpeciesCard: React.FC<SpeciesCardProps> = ({
  onSelectSpecies,
  selectedSpeciesId,
  sortOrder = 'asc',
  searchFilter = null,
  onSpeciesCountChange,
}) => {
  const { data: species } = useSpecies();
  // Handle species selection
  const handleSelectSpecies = (id: number) => {
    const newSelectedId = id === selectedSpeciesId ? null : id;
    // If selecting a species, find the species object to pass up
    if (newSelectedId !== null && species) {
      const selectedSpecies = species.find((item) => item.id === id);
      onSelectSpecies(newSelectedId, selectedSpecies);
    } else {
      // If deselecting
      onSelectSpecies(null, null);
    }
  };

  const filteredAndSortedSpecies = useMemo(() => {
    if (!species) {
      return [];
    }

    let filtered = [...species];
    if (searchFilter !== null) {
      filtered = filtered.filter((item) => item.id === searchFilter);
    }

    // Sort the filtered results
    return filtered.sort((a, b) => {
      const nameA = (a.species.common_name || '').toLowerCase();
      const nameB = (b.species.common_name || '').toLowerCase();

      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
  }, [species, sortOrder, searchFilter]);

  useEffect(() => {
    onSpeciesCountChange(filteredAndSortedSpecies.length);
  }, [filteredAndSortedSpecies.length, onSpeciesCountChange]);

  if (filteredAndSortedSpecies.length === 0) {
    return (
      <div className='p-4 text-center'>
        <p style={{ color: appTheme.secondaryPalette.davysGray }}>
          No species match your search. Please try different terms.
        </p>
      </div>
    );
  }

  //   return [...species].sort((a, b) => {
  //     const nameA = (a.species.common_name || '').toLowerCase();
  //     const nameB = (b.species.common_name || '').toLowerCase();

  //     if (sortOrder === 'asc') {
  //       return nameA.localeCompare(nameB);
  //     } else {
  //       return nameB.localeCompare(nameA);
  //     }
  //   });
  // }, [species, sortOrder]);

  return (
    <div className='space-y-4 mb-4 max-h-60 overflow-y-auto scrollbar-hide'>
      {filteredAndSortedSpecies?.map((item, index) => (
        <div
          key={item.id || index}
          className='flex items-center gap-4 p-2 border-b'
          style={{ borderColor: appTheme.secondaryPalette.whiteSmoke }}
        >
          {/* <div className='w-16 h-16 rounded-lg overflow-hidden'>
            <img
              src={store?.image?.image}
              alt='Checked Icon'
              className='w-full h-full object-cover'
            />
          </div> */}
          <div className='flex-1'>
            <h3
              className='font-bold text-base'
              style={{
                color: appTheme.primaryPalette.black,
              }}
            >
              {item.species.common_name ?? '-'}{' '}
            </h3>
            <p
              className='text-sm'
              style={{
                color: appTheme.secondaryPalette.davysGray,
              }}
            >
              {item.species.botanical_name ?? '-'}
            </p>
          </div>
          <img
            src={selectedSpeciesId === item.id ? checked : unChecked}
            alt={selectedSpeciesId === item.id ? 'Selected' : 'Not Selected'}
            className='w-6 h-6 cursor-pointer'
            onClick={() => handleSelectSpecies(item.id)}
          />
        </div>
      ))}
    </div>
  );
};
