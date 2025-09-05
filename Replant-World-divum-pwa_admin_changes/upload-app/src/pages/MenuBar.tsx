import React from 'react';
import { Card } from 'pages/Card';
import { useFmtMsg } from 'modules/intl';
import { useNavigate } from 'react-router-dom';
import { appTheme } from 'plugins/appTheme';
import rejected from '@/assets/reject.svg';
import approved from '@/assets/approve.svg';
import uploadFailed from '@/assets/upload-failed.svg';
import waiting from '@/assets/waiting.svg';
import union from '@/assets/union.svg';
// import camera from '@/assets/camera.svg';
// import home from '@/assets/home.svg';
import user from '@/assets/user.svg';
import ellipse from '@/assets/ellipse.svg';
import { useSpecies } from 'modules/species';
import { usePlantsSummary } from 'modules/plants';
import { useOfflineStore } from 'modules/offline';
import { Camera, Home } from '@/common/icons';

interface MenuBarProps {
  onProfileClick: () => void;
  onCardClick: (label: string, count: number, status: string) => void;
}
export const MenuBar: React.FC<MenuBarProps> = ({
  onProfileClick,
  onCardClick,
}) => {
  const fmtMsg = useFmtMsg();
  const navigate = useNavigate();
  const { totalCount } = useOfflineStore();

  const handleCameraClick = () => {
    navigate('/capture'); // Navigate to the capture page
  };
  const { data: summary } = usePlantsSummary(); // isLoading: isLoadingSummary

  useSpecies(); // just fetch them so that they get saved to indexed DB immediately after login

  return (
    <div
      className=' w-full max-w-md rounded-t-3xl shadow-md overflow-hidden'
      style={{
        backgroundColor: appTheme.secondaryPalette.darkTealGreen,
      }}
    >
      <div className='grid grid-cols-2 p-5 pb-6 gap-6'>
        <Card
          count={summary?.added_count}
          label={fmtMsg('addedTrees')}
          onClick={() =>
            onCardClick(
              fmtMsg('plantedTrees'),
              summary?.added_count ?? 0,
              'PLANTED'
            )
          }
        />
        <Card
          count={summary?.pending_review_count}
          label={fmtMsg('pending')}
          status={waiting}
          onClick={() =>
            onCardClick(
              fmtMsg('pendingTrees'),
              summary?.pending_review_count ?? 0,
              'PENDING'
            )
          }
        />
        <Card
          count={summary?.rejected_count}
          label={fmtMsg('rejected')}
          status={rejected}
          onClick={() =>
            onCardClick(
              fmtMsg('rejectedTrees'),
              summary?.rejected_count ?? 0,
              'REJECTED'
            )
          }
        />
        <Card
          count={summary?.approved_count}
          label={fmtMsg('approved')}
          status={approved}
          onClick={() =>
            onCardClick(
              fmtMsg('approvedTrees'),
              summary?.approved_count ?? 0,
              'APPROVED'
            )
          }
        />
        {totalCount > 0 && (
          <Card
            count={totalCount}
            label={fmtMsg('uploadFailed')}
            status={uploadFailed}
            onClick={() =>
              onCardClick(
                fmtMsg('failedToShareTrees'),
                totalCount ?? 0,
                'FAILED'
              )
            }
            className='col-span-2 px-5 py-2'
          />
        )}
      </div>
      <div className='relative mt-6'>
        <img src={union} alt='Union' className='w-full object-cover' />
        <div className='absolute bottom-0 left-0 right-0 flex justify-between items-center h-16'>
          <button className='absolute left-12 bottom-8 p-2'>
            <Home
              overrideColor
              pathClassName='fill-[#FFFFFF]'
              svgClassName='w-6 h-6'
            />
          </button>
          <div className='absolute left-1/2 bottom-12 transform -translate-x-1/2 z-10 p-2'>
            <button
              className='relative cursor-pointer'
              onClick={handleCameraClick}
            >
              <img src={ellipse} alt='Ellipse' className='w-16 h-16' />
              <Camera
                pathClassName='fill-[#FFFFFF]'
                overrideColor
                svgClassName='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-7 h-7'
              />
            </button>
          </div>
          <button
            onClick={onProfileClick}
            className='absolute right-12 bottom-8 p-2'
          >
            <img
              src={user}
              alt='Profile'
              className='w-6 h-6 invert brightness-0'
            />
          </button>
        </div>
      </div>
    </div>
  );
};
