import clsx from 'clsx';
import { IconProps } from 'common/icons';
import { Loader } from '.';

type Props = {
  Icon?: React.ComponentType<IconProps>;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  size?: 'lg' | 'md' | 'sm';
  type?: 'primary' | 'secondary';
  onClick?: () => void;
};

export const Button: React.FC<Props> = ({
  Icon,
  children,
  className,
  disabled = false,
  isLoading = false,
  size = 'lg',
  type = 'primary',
  onClick,
}) => {
  return (
    <button
      className={clsx(
        'cursor-pointer flex font-bold items-center justify-center rounded-full',
        size === 'lg'
          ? 'gap-2 py-2.5 text-xl w-full'
          : size === 'md'
          ? 'gap-1 px-3 py-1.5 text-base'
          : 'gap-1 px-2 py-0.5 text-sm',
        type === 'primary'
          ? disabled
            ? 'bg-gray-500 text-white'
            : 'bg-bisque-400 text-white'
          : disabled
          ? 'border-2 border-gray-500 text-gray-500'
          : 'border-2 border-bisque-400 text-bisque-400',
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {isLoading && (
        <Loader
          size={size === 'lg' ? 8 : size === 'md' ? 6 : 4}
          color={type === 'primary' ? '#FFFFFF' : '#C7AA94'}
        />
      )}
      {Icon && (
        <Icon
          overrideColor
          pathClassName={
            type === 'primary'
              ? 'fill-white'
              : disabled
              ? 'fill-gray-500'
              : 'fill-bisque-400'
          }
          svgClassName={clsx(
            size === 'lg'
              ? 'w-7 h-7 min-w-7 min-h-7'
              : size === 'md'
              ? 'w-6 h-6 min-w-6 min-h-6'
              : 'w-4 h-4 min-w-4 min-h-4'
          )}
        />
      )}
      {children}
    </button>
  );
};
