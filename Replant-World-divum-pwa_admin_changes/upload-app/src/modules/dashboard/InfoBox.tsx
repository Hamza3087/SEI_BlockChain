import clsx from 'clsx';
import { Loader } from 'common/components';

type Props = {
  className: string;
  icon: React.ReactNode;
  isLoading: boolean;
  title: string;
  value?: number;
};

export const InfoBox: React.FC<Props> = ({
  className,
  icon,
  isLoading,
  title,
  value,
}) => {
  return (
    <div
      className={clsx(
        'p-2.5 rounded-xl flex gap-2 justify-between opacity-90',
        className
      )}
    >
      <div className='flex flex-col justify-between'>
        <span className='text-sm font-semibold text-white dark:text-white'>
          {title}
        </span>
        <span className='text-3xl font-medium text-white dark:text-white'>
          {isLoading ? <Loader /> : value}
        </span>
      </div>
      <div className='opacity-60'>{icon}</div>
    </div>
  );
};
