import { useAutocomplete } from '@mui/base/useAutocomplete';
import clsx from 'clsx';
import { InputIcon } from 'common/components';
import { ExpandLess, ExpandMore, LocationOn } from 'common/icons';
import { useFmtMsg } from 'modules/intl';
import { Country } from './api';

type Props = {
  options: Country[];
  value?: Country;
  onChange: (val: Country) => void;
  error?: string;
  className?: string;
};

export const CountriesAutocomplete: React.FC<Props> = ({
  options,
  value,
  className,
  onChange,
  error,
}) => {
  const fmtMsg = useFmtMsg();

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
  } = useAutocomplete({
    getOptionLabel: (option) => option.name,
    id: 'autocomplete',
    options,
    value,
    onChange: (_, newValue) => {
      if (newValue) {
        onChange(newValue);
      }
    },
  });

  return (
    <div className={clsx('relative text-base', className)}>
      <label className={'text-left text-black dark:text-white'}>
        {fmtMsg('country')}
      </label>
      <div
        {...getRootProps()}
        className={clsx(
          'border dark:text-white text-black py-2.5 px-5 w-full flex gap-2 rounded-full cursor-text items-center mt-1',
          error
            ? 'border-red-400 dark:border-red-400'
            : 'border-black dark:border-white'
        )}
      >
        <InputIcon Icon={LocationOn} />
        <input
          {...getInputProps()}
          placeholder={fmtMsg('country')}
          className=' text-black dark:text-white placeholder-gray-500 border-0 bg-transparent focus:outline-none w-full'
        />
        {groupedOptions.length ? (
          <InputIcon Icon={ExpandLess} />
        ) : (
          <InputIcon Icon={ExpandMore} />
        )}
      </div>
      {groupedOptions.length > 0 && (
        <ul
          {...getListboxProps()}
          className='absolute box-border p-1.5 overflow-auto rounded-xl dark:bg-teal-900 bg-white w-full border border-black dark:border-white shadow-xl max-h-40'
        >
          {options &&
            (groupedOptions as typeof options).map((option, index) => (
              <li
                {...getOptionProps({ option, index })}
                className='m-2 text-black dark:text-white'
                key={option.id}
              >
                {option.name}
              </li>
            ))}
        </ul>
      )}
      {error && (
        <span className={'text-left text-red-400 dark:text-red-400'}>
          {error}
        </span>
      )}
    </div>
  );
};
