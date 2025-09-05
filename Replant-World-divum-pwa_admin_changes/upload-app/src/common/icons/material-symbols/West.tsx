import clsx from 'clsx';
import { IconProps } from 'common/icons';

// This icon has weight = 200
export const West: React.FC<IconProps> = ({
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
      d='M196.077-460.769h624.692q8.5 0 14.25-5.758t5.75-14.269q0-8.512-5.75-14.243-5.75-5.73-14.25-5.73H195.308l191.923-192.154q5.359-5.423 5.602-13.558.244-8.134-5.602-14.114-5.359-5.482-13.641-5.482t-13.898 5.615L142.615-503.385q-5.231 5.231-7.346 10.795t-2.115 11.923q0 6.359 2.15 12.282t7.311 11l217.077 217.077q5.423 5.616 13.558 5.616t13.981-5.616q6.615-5.846 6.231-14.269-.385-8.423-6.231-14.269L196.077-460.769Z'
    />
  </svg>
);
