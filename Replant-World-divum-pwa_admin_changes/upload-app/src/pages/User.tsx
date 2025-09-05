import userProfile from '@/assets/splash-screen.jpg';
import { calculateTimeDifference } from '../common/utils/date-format';
import { appTheme } from 'plugins/appTheme';
import logo from '@/assets/logo.svg';
import { useFmtMsg } from 'modules/intl';
import { MenuBar } from './MenuBar';
import { useUser } from '../modules/user/index';
import { Profile } from './Profile';
import { PlantDetails } from './PlantDetails';
import { useState } from 'react';
import { InstallButton } from 'modules/install';
import { useOfflineStore } from 'modules/offline';

type Props = {
  hideInstall?: boolean;
};

export const User: React.FC<Props> = ({ hideInstall = false }) => {
  const { isUploading } = useOfflineStore();
  const fmtMsg = useFmtMsg();
  const { data: user } = useUser();
  const [showProfile, setShowProfile] = useState(false);
  const [showPlantDetails, setShowPlantDetails] = useState(false);
  const [selectedCardLabel, setSelectedCardLabel] = useState('');
  const [selectedCardCount, setSelectedCardCount] = useState(0);
  const [selectedCardStatus, setSelectedCardStatus] = useState('');

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  const handleCardClick = (label: string, count: number, status: string) => {
    setSelectedCardLabel(label);
    setSelectedCardCount(count);
    setShowPlantDetails(true);
    setSelectedCardStatus(status);
  };

  const handleClosePlantDetails = () => {
    setShowPlantDetails(false);
  };
  return (
    <div className='w-full h-dvh overflow-hidden'>
      <div className='relative w-full max-w-md mx-auto h-full'>
        <div className='absolute inset-0'>
          <img
            alt='User Profile'
            src={userProfile}
            className='object-cover w-full h-full'
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className='relative h-full flex flex-col justify-between'>
          <div className='pb-4 mt-6'>
            <img
              alt='Logo'
              src={logo}
              className='w-12 h-12 m-4 object-contain mb-6'
            />
            <div className='absolute top-4 right-1 m-4 object-contain z-10'>
              {!hideInstall && !isUploading && <InstallButton />}
            </div>
            <div className='pl-6'>
              <h1
                className='text-3xl font-bold mb-1'
                style={{
                  color: appTheme.primaryPalette.white,
                }}
              >
                {fmtMsg('greetingText')}, {user?.username}
              </h1>
              <p
                className='text-medium'
                style={{
                  color: appTheme.primaryPalette.white,
                  opacity: 0.8,
                }}
              >
                {user?.date_joined
                  ? calculateTimeDifference(user?.date_joined)
                  : 'Started Today'}
              </p>
            </div>
          </div>
          <MenuBar
            onProfileClick={handleProfileClick}
            onCardClick={handleCardClick}
          />
          {showPlantDetails && (
            <PlantDetails
              onClose={handleClosePlantDetails}
              title={selectedCardLabel}
              count={selectedCardCount}
              status={selectedCardStatus}
            />
          )}
          {showProfile && <Profile onClose={handleCloseProfile} />}
        </div>
      </div>
    </div>
  );
};
