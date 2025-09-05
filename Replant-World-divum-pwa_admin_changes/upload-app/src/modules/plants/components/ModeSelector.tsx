import clsx from 'clsx';
import { useFmtMsg } from 'modules/intl';
import { useOfflineStore } from 'modules/offline';

type Props = {
  offline: boolean;
  onToggleOffline: (vals: boolean) => void;
};

export const ModeSelector: React.FC<Props> = ({ offline, onToggleOffline }) => {
  const fmtMsg = useFmtMsg();

  const { totalCount } = useOfflineStore();
  const showBadge = totalCount > 0;

  return (
    <div className='flex gap-5 items-start'>
      <button
        className={clsx(
          !offline && 'border-b-2',
          'border-black dark:border-white pb-1'
        )}
        onClick={() => onToggleOffline(false)}
      >
        {fmtMsg('submitted')}
      </button>
      <div className='flex gap-1 items-start justify-start'>
        <button
          className={clsx(
            offline && 'border-b-2',
            'border-black dark:border-white pb-1 flex items-center gap-1'
          )}
          onClick={() => onToggleOffline(true)}
        >
          {fmtMsg('waiting')}
        </button>
        {showBadge && (
          <div className='min-w-5 text-center bg-orange-600 rounded-2xl text-xs px-1.5 py-0.5 mt-0.5'>
            {totalCount}
          </div>
        )}
      </div>
    </div>
  );
};
