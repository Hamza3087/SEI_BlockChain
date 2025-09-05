import clsx from 'clsx';
import { IconProps } from './types';

export function IconMap({ className, overrideColors }: IconProps) {
  return (
    <svg
      className={clsx(
        !overrideColors && 'fill-black dark:fill-white',
        className
      )}
      xmlns='http://www.w3.org/2000/svg'
      height='24'
      viewBox='0 -960 960 960'
      width='24'
    >
      <path d='m600-141.54-240-84-172.153 66.615q-17.692 6.846-32.769-3.923-15.077-10.769-15.077-29.461v-524.613q0-11.846 6.347-21.269 6.346-9.423 17.807-13.654L360-818.46l240 84 172.153-66.615q17.692-6.846 32.769 3.346 15.077 10.192 15.077 28.5v527.69q0 12.23-6.923 21.461-6.924 9.231-18.77 13.462L600-141.54Zm-29.999-73.383v-468l-180.002-62.923v468l180.002 62.923Zm59.998 0L760-258v-474l-130.001 49.077v468ZM200-228l130.001-49.846v-468L200-702v474Zm429.999-454.923v468-468Zm-299.998-62.923v468-468Z' />
    </svg>
  );
}
