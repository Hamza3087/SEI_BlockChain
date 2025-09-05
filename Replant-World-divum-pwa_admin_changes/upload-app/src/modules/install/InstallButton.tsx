import install from '@/assets/install.svg';
import { appTheme } from 'plugins/appTheme';
import { useFmtMsg } from 'modules/intl';
import { Link } from 'react-router-dom';

export const InstallButton: React.FC = () => {
  const fmtMsg = useFmtMsg();

  const isOpenedAsApp = window.matchMedia('(display-mode: standalone)').matches;

  if (isOpenedAsApp) {
    return null;
  }

  return (
    <Link to={'/how-to-install'}>
      <div
        className='flex flex-row items-center gap-2 font-semibold rounded-full py-[0.3rem] px-[1.2rem]'
        style={{
          backgroundColor: appTheme.primaryPalette.white,
        }}
      >
        <span
          style={{
            color: appTheme.secondaryPalette.darkForestGreen,
          }}
        >
          {fmtMsg('install')}
        </span>
        <button>
          <img src={install} alt='Install' className='w-4 h-4' />
        </button>
      </div>
    </Link>
  );
};
