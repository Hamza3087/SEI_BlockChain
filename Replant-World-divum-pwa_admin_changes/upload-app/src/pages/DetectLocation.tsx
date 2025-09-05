import React, { useState } from 'react';
import locationBg from '@/assets/splash-screen.jpg';
import { DetailsHeader } from '../common/components/DetailsHeader';
import { appTheme } from 'plugins/appTheme';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlantsMutation } from 'modules/plants';
import { useFmtMsg } from 'modules/intl';
import { openSnackbar } from 'modules/snackbar';
import { useAuthRequired } from 'modules/auth';

export const Location: React.FC = () => {
  useAuthRequired();
  const plantsMutation = usePlantsMutation();
  const fmtMsg = useFmtMsg();
  const navigate = useNavigate();
  const location = useLocation();
  const { tmpImage, selectedSpeciesId, selectedSpecies } = location.state || {};
  const [locationInput, setLocationInput] = useState(
    tmpImage?.latitude && tmpImage?.longitude
      ? `${tmpImage.latitude},${tmpImage.longitude}`
      : ''
  );

  const navigateToDashboard = () => navigate('/dashboard');

  const handleSaveLocation = async () => {
    const [latitudeStr, longitudeStr] = locationInput
      .split(',')
      .map((coord) => coord.trim());

    const latitude = parseFloat(latitudeStr);
    const longitude = parseFloat(longitudeStr);

    // Validate the location input
    if (
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      openSnackbar(fmtMsg('pleaseEnterValidLocation'), 'error');
      return;
    }

    // Update the tmpImage object with the new location
    const updatedTmpImage = {
      ...tmpImage,
      latitude,
      longitude,
    };

    try {
      // If a species is selected, call the API to save the plant with the updated location
      if (selectedSpeciesId && selectedSpecies) {
        await plantsMutation.mutateAsync({
          assigned_species_id: selectedSpeciesId,
          ...updatedTmpImage,
        });
        openSnackbar(fmtMsg('successYouCanNowAddAnotherTree'), 'success', 5000);
      }

      // Navigate to the location-details page with the updated location
      navigate('/location-details', { state: updatedTmpImage });
    } catch (error) {
      openSnackbar(fmtMsg('failedToUpdateLocation'), 'error');
    }
  };

  return (
    <div className='flex items-center justify-center w-screen'>
      <div className='relative w-full max-w-md h-dvh overflow-hidden'>
        {/* Background */}
        <div className='absolute inset-0 z-0 w-full h-full'>
          <img
            alt='Location'
            src={locationBg}
            className='w-full h-full object-cover'
          />
          <div
            className='absolute inset-0 bg-black'
            onClick={navigateToDashboard}
            style={{ opacity: '0.4' }}
          ></div>
        </div>

        {/* Input Fields */}
        <div className='absolute bottom-0 left-0 right-0 z-10 w-full'>
          <div className='w-full px-2 pb-2 pt-0 bg-white rounded-t-3xl shadow-md relative'>
            {/* Header */}
            <div className='mb-6 flex gap-2 flex-col'>
              <DetailsHeader
                title={fmtMsg('selectLocation')}
                onClose={navigateToDashboard}
                draggable
              />
              <div className='flex flex-col px-6 space-y-6'>
                <span
                  className='text-medium font-medium'
                  style={{
                    color: appTheme.secondaryPalette.davysGray,
                  }}
                >
                  {fmtMsg('unableToDetectLocation')}
                </span>
                <input
                  type='text'
                  id='username'
                  className='text-sm rounded-lg block w-full p-3 border-none focus:outline-none'
                  style={{
                    color: appTheme.primaryPalette.black,
                    backgroundColor: appTheme.secondaryPalette.paleLightGray,
                  }}
                  placeholder='Enter Latitude, Longitude (e.g., 40.7128, -74.0060)'
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  required
                />
                <button
                  type='submit'
                  className='w-full text-base font-medium py-3 mt-1 rounded-3xl focus:outline-none'
                  style={{
                    color: appTheme.primaryPalette.white,
                    backgroundColor: appTheme.secondaryPalette.seaGreen,
                  }}
                  aria-label='Save'
                  onClick={handleSaveLocation}
                >
                  {fmtMsg('save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
