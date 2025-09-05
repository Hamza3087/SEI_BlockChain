import { IconMap } from 'common/components';
import { useFmtMsg } from 'modules/intl';
import { Link } from 'react-router-dom';

export const MapButton: React.FC<Record<string, never>> = () => {
  const fmtMsg = useFmtMsg();
  return (
    <Link
      className='bg-gray-200 dark:bg-teal-700 flex gap-2 h-full hover:opacity-75 items-center px-4 sm:px-6 rounded-xl'
      to='/map'
    >
      <IconMap />
      <span className='hidden sm:inline'>{fmtMsg('map')}</span>
    </Link>
  );
};
