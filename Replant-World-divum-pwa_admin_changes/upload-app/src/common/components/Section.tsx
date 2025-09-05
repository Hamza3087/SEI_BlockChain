import clsx from 'clsx';

type Props = {
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export const Section: React.FC<Props> = ({ children, actions, className }) => {
  return (
    <div className={clsx('h-full flex flex-col gap-4', className)}>
      <div className='grow'>{children}</div>
      {actions}
    </div>
  );
};
