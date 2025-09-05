import { PropsWithChildren } from 'react';

type MenuItemProps = PropsWithChildren & {
  onSelect: () => void;
};

export function MenuItem(props: MenuItemProps) {
  return (
    <div
      className='px-3 py-2 hover:bg-teal-300 dark:hover:bg-teal-600 cursor-pointer'
      onClick={props.onSelect}
    >
      {props.children}
    </div>
  );
}
