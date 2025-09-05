import { IconHome } from 'common/components';
import { useFmtMsg } from 'modules/intl';
import { Link } from 'react-router-dom';

export const HomeButton: React.FC<Record<string, never>> = () => {
  const fmtMsg = useFmtMsg();
  return (
    <Link
      className='absolute bg-clip-padding bg-white border-2 border-black/20 flex gap-2 hover:opacity-95 items-center left-[52px] px-1.5 py-1.5 rounded top-2.5 z-[1000]'
      to='/'
    >
      <IconHome overrideColors className='fill-black size-4' />
      <span className='hidden leading-none sm:inline text-black text-sm'>
        {fmtMsg('home')}
      </span>
    </Link>
  );
};
