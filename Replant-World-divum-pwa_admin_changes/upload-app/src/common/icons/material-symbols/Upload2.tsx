import clsx from 'clsx';
import { IconProps } from 'common/icons';

// Upload 2 is the name of the icon in Material Symbols library
export const Upload2: React.FC<IconProps> = ({
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
      d='M160-80v-80h640v80H160Zm200-160v-280H200l280-360 280 360H600v280H360Z'
    />
  </svg>
);
