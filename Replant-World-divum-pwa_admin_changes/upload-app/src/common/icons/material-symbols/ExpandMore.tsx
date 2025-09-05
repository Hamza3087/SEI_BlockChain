import clsx from 'clsx';
import { IconProps } from 'common/icons';

export const ExpandMore: React.FC<IconProps> = ({
  overrideColor,
  pathClassName,
  svgClassName,
}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    height='24'
    viewBox='0 -960 960 960'
    width='24'
    className={svgClassName}
  >
    <path
      className={clsx(
        !overrideColor && 'fill-black dark:fill-white',
        pathClassName
      )}
      d='M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z'
    />
  </svg>
);
