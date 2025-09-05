import clsx from 'clsx';
import { Check, Close, FindInPage } from 'common/icons';
import { useFmtMsg } from 'modules/intl';
import { ReviewState } from '../types';

type Props = {
  state: ReviewState;
};

export const ReviewStatePill: React.FC<Props> = ({ state }) => {
  const fmtMsg = useFmtMsg();

  return (
    <div
      className={clsx(
        'rounded-full py-1 px-2 flex items-center gap-1 text-sm font-semibold leading-none text-white dark:text-white opacity-90',
        state === 'PENDING' && 'bg-bisque-400',
        state === 'APPROVED' && 'bg-green-400',
        state === 'REJECTED' && 'bg-red-400'
      )}
    >
      {state === 'PENDING' && (
        <>
          <FindInPage
            overrideColor
            pathClassName='fill-white'
            svgClassName='h-3.5 w-3.5'
          />
          <span>{fmtMsg('pending')}</span>
        </>
      )}
      {state === 'APPROVED' && (
        <>
          <Check
            overrideColor
            pathClassName='fill-white'
            svgClassName='h-3.5 w-3.5'
          />
          <span>{fmtMsg('approved')}</span>
        </>
      )}
      {state === 'REJECTED' && (
        <>
          <Close
            overrideColor
            pathClassName='fill-white'
            svgClassName='h-3.5 w-3.5'
          />
          <span>{fmtMsg('rejected')}</span>
        </>
      )}
    </div>
  );
};
