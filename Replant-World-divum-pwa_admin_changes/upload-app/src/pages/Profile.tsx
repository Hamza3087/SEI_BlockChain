import React from 'react';
import { DetailsHeader } from '../common/components/DetailsHeader';
// import map from '@/assets/location.svg';
// import phone from '@/assets/phone.svg';
import divider from '@/assets/divider.svg';
import logoBlack from '@/assets/logo-black.png';
import { appTheme } from 'plugins/appTheme';
import { useFmtMsg } from 'modules/intl';
import { useUser } from '../modules/user/index';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../modules/auth/index';
import { Call, LocationOn } from '@/common/icons';

interface ProfileProps {
  onClose: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onClose }) => {
  const fmtMsg = useFmtMsg();
  const navigate = useNavigate();

  const logoutMutation = useLogoutMutation();

  const queryClient = useQueryClient();

  const logOut = async () => {
    if (logoutMutation.isPending) {
      return;
    }
    await logoutMutation.mutateAsync({});
    queryClient.removeQueries(); // remove all queries
    navigate('/login');
  };

  const { data: user } = useUser();
  return (
    <div className='absolute inset-0 flex items-end justify-center z-50'>
      <div
        className='absolute inset-0 opacity-60'
        style={{
          backgroundColor: 'black',
        }}
        onClick={onClose} // Add onClick handler to close the profile
      ></div>

      <div
        className='w-full max-w-md rounded-t-3xl shadow-md relative'
        style={{
          backgroundColor: appTheme.primaryPalette.white,
        }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the profile from closing it
      >
        <DetailsHeader title='' onClose={onClose} />
        <div className='flex flex-col p-5 space-y-6'>
          <div className='flex items-center flex-row space-x-4'>
            <img
              src={logoBlack}
              alt='Profile'
              className='w-[6rem] h-[4rem] rounded-full object-contain'
            />
            <div className='flex flex-col items-start gap-y-1'>
              <h2
                className='text-2xl font-semibold'
                style={{
                  color: appTheme.secondaryPalette.darkSlateGray,
                }}
              >
                {user?.username}
              </h2>
              <p
                className='text-medium'
                style={{
                  color: appTheme.secondaryPalette.smokeGray,
                }}
              >
                {user?.planting_organization?.name}
              </p>
            </div>
          </div>
          <div className='flex flex-row items-center gap-2'>
            <div className='flex flex-row items-center gap-1'>
              <LocationOn
                overrideColor
                pathClassName='fill-[#1B2924]'
                svgClassName='h-5 w-5'
              />
              <p
                className='text-base'
                style={{
                  color: appTheme.secondaryPalette.smokeGray,
                }}
              >
                {user?.country?.name}
              </p>
            </div>
            <img src={divider} alt='Divider' />
            <div className='flex flex-row items-center gap-1'>
              <Call
                overrideColor
                pathClassName='fill-[#1B2924]'
                svgClassName='h-5 w-5'
              />
              <p
                className='text-base'
                style={{
                  color: appTheme.secondaryPalette.smokeGray,
                }}
              >
                {user?.phone_number}
              </p>
            </div>
          </div>
          <div>
            <button
              // isLoading={logoutMutation.isPending}
              type='submit'
              onClick={logOut}
              className='w-full text-base font-medium py-3 mt-1 rounded-3xl focus:outline-none'
              style={{
                color: appTheme.primaryPalette.white,
                backgroundColor: appTheme.secondaryPalette.seaGreen,
              }}
              aria-label='Logout'
            >
              {fmtMsg('logOut')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
