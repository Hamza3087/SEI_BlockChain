import React from 'react';
import { appTheme } from 'plugins/appTheme';
import closeIcon from '@/assets/close.svg';
import drag from '@/assets/drag.svg';
import { useFmtMsg } from 'modules/intl';

type Props = {
  title: string;
  count?: number;
  onClose: () => void;
  draggable?: boolean;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: () => void;
};

export const DetailsHeader: React.FC<Props> = ({
  title,
  count,
  onClose,
  draggable = false,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) => {
  const fmtMsg = useFmtMsg();

  return (
    <div className='relative'>
      {draggable && (
        <div className='absolute top-3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mb-2'>
          <img
            src={drag}
            alt='Draggable'
            className='w-12 h-8 cursor-pointer touch-none'
            style={{
              touchAction: 'none',
              userSelect: 'none',
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        </div>
      )}
      <div className='flex justify-between items-start p-6 pb-2'>
        <div className='flex flex-col space-y-1 mt-2'>
          <h6
            className='text-medium font-bold'
            style={{
              color: appTheme.primaryPalette.black,
            }}
          >
            {title}
          </h6>
          <h6
            className='text-sm font-medium'
            style={{
              color: appTheme.secondaryPalette.slateGray,
            }}
          >
            {count !== undefined ? `${count} ${fmtMsg('trees')}` : ''}
          </h6>
        </div>
        <button onClick={onClose}>
          <img src={closeIcon} alt='Close' className='w-6 h-6' />
        </button>
      </div>
    </div>
  );
};
