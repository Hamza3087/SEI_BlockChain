import { appTheme } from 'plugins/appTheme';
import plantedTree from '@/assets/planted-tree.svg';

interface CardProps {
  count?: number;
  label: string;
  status?: string;
  onClick?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  count,
  label,
  status,
  onClick,
  className = '',
}) => {
  const isUploadFailed = label.toLowerCase() === 're-upload trees';

  const handleClick = () => {
    if (count !== 0 && onClick) {
      onClick();
    }
  };

  const cursorStyle = count === 0 ? 'default' : 'pointer';

  return (
    <div
      className={`w-42 rounded-2xl overflow-hidden shadow-lg p-5 ${className}`}
      style={{
        backgroundColor: appTheme.secondaryPalette.greenishBlue,
        border: `2px solid ${appTheme.secondaryPalette.borderColor}`,
        cursor: cursorStyle,
      }}
      onClick={handleClick} // Attach the onClick handler here
    >
      <div
        className={`flex flex-row justify-between ${
          isUploadFailed ? 'items-center' : 'items-start'
        }`}
      >
        <div
          className={
            isUploadFailed
              ? 'flex flex-row items-center gap-4'
              : 'flex flex-col items-start'
          }
        >
          <span
            className='text-sm font-regular'
            style={{
              color: appTheme.secondaryPalette.lightGreen,
            }}
          >
            {label}
          </span>
          <div className='py-2'>
            <span
              className='text-2xl font-bold'
              style={{
                color: appTheme.primaryPalette.white,
              }}
            >
              {count}
            </span>
          </div>
        </div>
        <div className='relative'>
          <img alt='Tree' src={plantedTree} className='w-8 h-8' />
          {status && (
            <img
              alt='Status'
              src={status}
              className='w-4 h-4 absolute -bottom-0 -right-0 top-3'
            />
          )}
        </div>
      </div>
    </div>
  );
};
