import { IconProps } from 'common/icons';
import { useMatch, useNavigate } from 'react-router-dom';

type Props = {
  Icon: React.ComponentType<IconProps>;
  IconActive: React.ComponentType<IconProps>;
  path: string;
  showBadge?: boolean;
};

export const NavigationButton: React.FC<Props> = ({
  IconActive,
  Icon,
  path,
  showBadge = false,
}) => {
  const navigate = useNavigate();

  const isActive = useMatch(path);

  return (
    <button className='relative' onClick={() => navigate(path)}>
      {isActive ? (
        <IconActive
          overrideColor
          pathClassName='cursor-pointer fill-white'
          svgClassName='size-7'
        />
      ) : (
        <Icon
          overrideColor
          pathClassName='cursor-pointer fill-white'
          svgClassName='size-7'
        />
      )}
      {showBadge && (
        <div className='w-2 h-2 bg-orange-600 rounded-lg absolute top-[-0.25rem] right-[-0.25rem]' />
      )}
    </button>
  );
};
