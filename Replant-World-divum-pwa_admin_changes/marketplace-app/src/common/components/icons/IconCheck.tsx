import clsx from 'clsx';
import { IconProps } from './types';

export function IconCheck({ className, overrideColors }: IconProps) {
  return (
    <svg
      className={clsx(
        !overrideColors && 'stroke-black dark:stroke-white',
        className
      )}
      width='100'
      height='100'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m4.5 12.75 6 6 9-13.5'
      />
    </svg>
  );
}
