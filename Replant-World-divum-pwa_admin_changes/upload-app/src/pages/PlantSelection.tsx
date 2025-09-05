import React, { useState } from 'react';
import { DetailsHeader } from '../common/components/DetailsHeader';
import { appTheme } from 'plugins/appTheme';
// import search from '@/assets/search.svg';
// import filter from '@/assets/filter.svg';
import sort from '@/assets/sort.svg';
import { useFmtMsg } from 'modules/intl';
import { SpeciesCard } from 'common/components';
import { useNavigate } from 'react-router-dom';
import { useNewPlantStore } from '../modules/new-plant/store';
import { usePlantsMutation } from 'modules/plants';
import { openSnackbar } from 'modules/snackbar';
import { AssignedSpecies } from 'modules/species';
import { SpeciesAutocomplete } from '../modules/species/SpeciesAutocomplete';

interface PlantSelectionProps {
  onClose: () => void;
  tmpImage: any;
}
export const PlantSelection: React.FC<PlantSelectionProps> = ({
  onClose,
  tmpImage,
}) => {
  const fmtMsg = useFmtMsg();
  const navigate = useNavigate();
  const store = useNewPlantStore();
  const plantsMutation = usePlantsMutation();
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | null>(
    null
  );
  const [selectedSpecies, setSelectedSpecies] = useState<any>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchValue, setSearchValue] = useState<AssignedSpecies | null>(null);
  const [speciesCount, setSpeciesCount] = useState(0);

  // Handle species selection from the SpeciesCard component
  const handleSelectSpecies = (speciesId: number | null, species: any) => {
    if (speciesId === selectedSpeciesId) {
      setSelectedSpeciesId(null);
      setSelectedSpecies(null);
      setSearchValue(null);
    } else {
      setSelectedSpeciesId(speciesId);
      setSelectedSpecies(species);
      setSearchValue(species);
    }
  };

  const handleSearchChange = (value: AssignedSpecies | null) => {
    setSearchValue(value);
    // Automatically select the species when chosen from search
    if (value) {
      setSelectedSpeciesId(value.id);
      setSelectedSpecies(value);
    } else {
      setSelectedSpeciesId(null);
      setSelectedSpecies(null);
    }
  };

  // Handle the next button click
  const handleNextClick = async () => {
    // let speciesError: typeof store.speciesError;
    // let imageError: typeof store.imageError;
    // if (!store.image) {
    //   imageError = fmtMsg('fieldRequired');
    // }
    // if (!store.species) {
    //   speciesError = fmtMsg('fieldRequired');
    // }

    // store.setImageError(imageError);
    // store.setSpeciesError(speciesError);

    // if (imageError || speciesError) {
    //   return;
    // }
    if (selectedSpeciesId && selectedSpecies) {
      if (!tmpImage.latitude || !tmpImage.longitude) {
        openSnackbar(fmtMsg('failedToGetLocation'), 'error');
        navigate('/location', {
          state: { tmpImage, selectedSpeciesId, selectedSpecies },
        });
        return;
      }
      await plantsMutation.mutateAsync({
        assigned_species_id: selectedSpeciesId,
        ...tmpImage, // Use tmpImage from props
      });
      // navigate('/location-details');
      navigate('/location-details', { state: tmpImage });
      openSnackbar(fmtMsg('successYouCanNowAddAnotherTree'), 'success', 5000);
    } else {
      openSnackbar(fmtMsg('failedToGetLocation'), 'error');
      navigate('/location');
    }
    // store.setImage(undefined);
  };

  const handleSortClick = () => {
    setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className='absolute inset-0 flex-col flex justify-end'>
      <div
        className='w-full max-w-md rounded-t-3xl shadow-md relative'
        style={{
          backgroundColor: appTheme.primaryPalette.white,
        }}
      >
        <DetailsHeader
          title={fmtMsg('selectSpecies')}
          onClose={onClose}
          draggable
        />
        <div className='flex flex-col p-5 pt-2 space-y-2'>
          <div className='relative mb-4'>
            <SpeciesAutocomplete
              value={searchValue}
              onChange={handleSearchChange}
              error={store.speciesError}
            />
            {/* <input
              type='text'
              placeholder='Jackfruit, Artocarpus heterophyll..'
              className='w-full p-3 rounded-lg text-medium focus:outline-none font-normal'
              style={{
                backgroundColor: appTheme.secondaryPalette.paleLightGray,
                color: appTheme.primaryPalette.black,
                //   opacity: 0.6,
              }}
            />
            <img
              src={search}
              alt='Search'
              className='w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2'
            /> */}
          </div>
          <div className='flex gap-2 mb-4'>
            {/* Commented the code for Future implementation */}
            {/* <button
              className='flex items-center gap-2 px-4 py-2 border rounded-full'
              style={{
                borderColor: appTheme.primaryPalette.black,
              }}
            >
              <img src={filter} alt='Filter' className='w-5 h-5' />
              <span
                className='text-sm font-medium'
                style={{
                  color: appTheme.primaryPalette.black,
                }}
              >
                Filter
              </span>
            </button> */}
            <button
              className='flex items-center gap-2 px-4 py-2 border rounded-full'
              style={{
                borderColor: appTheme.primaryPalette.black,
                opacity: speciesCount === 1 ? 0.4 : 1,
              }}
              onClick={handleSortClick}
              disabled={speciesCount === 1}
            >
              <img src={sort} alt='Sort' className='w-5 h-5' />
              <span
                className='text-sm font-medium'
                style={{
                  color: appTheme.primaryPalette.black,
                }}
              >
                {fmtMsg('sort')}
              </span>
            </button>
          </div>
          <SpeciesCard
            onSelectSpecies={handleSelectSpecies}
            selectedSpeciesId={selectedSpeciesId}
            sortOrder={sortOrder}
            searchFilter={searchValue ? searchValue.id : null}
            onSpeciesCountChange={setSpeciesCount}
          />
          <div>
            <button
              type='submit'
              className='w-full text-base font-medium py-3 mt-1 rounded-3xl focus:outline-none'
              style={{
                color: appTheme.primaryPalette.white,
                backgroundColor: appTheme.secondaryPalette.seaGreen,
                opacity: selectedSpeciesId ? 1 : 0.6,
              }}
              onClick={handleNextClick}
              aria-label='Next'
              disabled={!selectedSpeciesId}
            >
              {fmtMsg('next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
