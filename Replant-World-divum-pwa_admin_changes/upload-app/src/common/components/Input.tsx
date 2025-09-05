import clsx from 'clsx';
import { IconProps, Visibility, VisibilityOff } from 'common/icons';
import { HTMLInputTypeAttribute, useState } from 'react';

type Props = {
  Icon: React.ComponentType<IconProps>;
  label?: string;
  placeholder: string;
  value?: string;
  className?: string;
  onChange: (e: string) => void;
  type?: HTMLInputTypeAttribute;
  error?: string;
};

export const Input: React.FC<Props> = ({
  Icon,
  label,
  placeholder,
  value,
  className,
  onChange,
  type = 'text',
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className='flex flex-col gap-1.5 text-base w-full'>
      {label && (
        <label className={'text-left text-black dark:text-white'}>
          {label}
        </label>
      )}
      <div
        className={clsx(
          'border dark:text-white text-black py-2.5 px-5 w-full flex gap-2 rounded-full cursor-text items-center',
          error
            ? 'dark:border-red-400 border-red-400'
            : 'border-black dark:border-white',
          className
        )}
      >
        <InputIcon Icon={Icon} />
        <input
          onChange={(e) => onChange(e.target.value)}
          value={value}
          placeholder={placeholder}
          className='text-black dark:text-white placeholder-gray-500 border-0 bg-transparent focus:outline-none w-full'
          type={showPassword ? 'text' : type}
        />
        {type === 'password' && (
          <div onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? (
              <InputIcon Icon={VisibilityOff} />
            ) : (
              <InputIcon Icon={Visibility} />
            )}
          </div>
        )}
      </div>
      {error && (
        <label className={'text-left text-red-400 dark:text-red-400'}>
          {error}
        </label>
      )}
    </div>
  );
};

export const InputIcon: React.FC<{
  Icon: React.ComponentType<IconProps>;
}> = ({ Icon }) => (
  <Icon
    overrideColor
    pathClassName='fill-gray-500'
    svgClassName={'h-5 min-h-5 min-w-5 opacity-80 w-5'}
  />
);
