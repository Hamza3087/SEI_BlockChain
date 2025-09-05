import { PropsWithChildren } from 'react';

export function Menu(props: PropsWithChildren) {
  return (
    <div className='absolute left-0 top-full flex flex-col bg-teal-200 dark:bg-teal-700 my-1 w-full rounded-xl overflow-hidden shadow-xl'>
      {props.children}
    </div>
  );
}
