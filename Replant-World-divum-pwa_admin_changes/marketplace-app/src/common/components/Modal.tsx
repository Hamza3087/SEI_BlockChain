import { PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

import { IconX } from './icons';

type ModalProps = PropsWithChildren & {
  title: string;
  subtitle?: string;
  onClose: () => void;
};

export function Modal(props: ModalProps) {
  const modal = (
    <div
      // Need the z-index to be higher than Leaflet
      className='w-full h-dvh flex items-center justify-center absolute top-0 left-0 bg-black bg-opacity-50 z-[2000]'
      onClick={() => props.onClose()}
    >
      <div
        className='sm:rounded-2xl p-2 sm:p-16 bg-teal-100 dark:bg-teal-900 w-full max-h-full sm:w-auto overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='pb-2 sm:pb-8'>
          <div className='flex justify-between'>
            <h2 className='text-3xl font-bold'>{props.title}</h2>
            <span
              className='text-3xl cursor-pointer'
              onClick={() => props.onClose()}
            >
              <IconX className='w-6 h-6' />
            </span>
          </div>
          {props.subtitle && <h3 className='text-xl'>{props.subtitle}</h3>}
        </div>
        {props.children}
      </div>
    </div>
  );

  return <>{createPortal(modal, document.body)}</>;
}
