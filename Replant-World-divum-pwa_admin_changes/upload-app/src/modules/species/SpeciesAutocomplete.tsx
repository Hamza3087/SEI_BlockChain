import { useAutocomplete } from '@mui/base/useAutocomplete';
import clsx from 'clsx';
// import { Search } from 'common/icons';
import search from '@/assets/search.svg';
import { appTheme } from 'plugins/appTheme';
// import { useFmtMsg } from 'modules/intl';
import { AssignedSpecies, useSpecies } from 'modules/species';

type Props = {
  error?: string;
  value: AssignedSpecies | null;
  onChange: (value: AssignedSpecies | null) => void;
};

export const SpeciesAutocomplete: React.FC<Props> = ({
  error,
  value,
  onChange,
}) => {
  // const fmtMsg = useFmtMsg();

  const { data } = useSpecies();

  const formatOptionLabel = (option: AssignedSpecies) =>
    `${option.species.common_name} (${option.species.botanical_name})`;

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
  } = useAutocomplete({
    getOptionLabel: formatOptionLabel,
    id: 'species',
    options: data || [],
    value,
    onChange: (_, newValue) => {
      // if (newValue) {
      onChange(newValue);
      // }
    },
  });

  return (
    <div className='relative text-base'>
      {/* <label
        className={'text-left text-black dark:text-white'}
        htmlFor='species'
      >
        {fmtMsg('species')}
      </label> */}
      <div
        {...getRootProps()}
        className={clsx(
          // 'border dark:text-white text-black py-4 px-5 w-full flex gap-2 rounded-full cursor-text items-center',
          error
            ? 'border-red-400 dark:border-red-400'
            : 'border-black dark:border-white'
        )}
      >
        <input
          // {...getInputProps()}
          {...getInputProps()}
          name='species'
          // placeholder={fmtMsg('search')}
          // className='text-black dark:text-white placeholder-black dark:placeholder-white border-0 bg-transparent focus:outline-none w-full'
          type='text'
          placeholder='Jackfruit, Artocarpus heterophyll..'
          className='w-full p-3 rounded-lg text-medium focus:outline-none font-normal pr-10'
          style={{
            backgroundColor: appTheme.secondaryPalette.paleLightGray,
            color: appTheme.primaryPalette.black,
            opacity: 0.6,
          }}
          value={value ? formatOptionLabel(value) : ''}
        />
        {/* <Search svgClassName='h-5 min-h-5 min-w-5 w-5' /> */}
        <img
          src={search}
          alt='Search'
          className='w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 opacity-60'
        />
      </div>
      {groupedOptions.length > 0 && (
        <ul
          {...getListboxProps()}
          className='absolute box-border p-1.5 overflow-auto rounded-xl dark:bg-teal-900 bg-white w-full border border-black dark:border-white shadow-xl max-h-40 z-10 cursor-pointer'
        >
          {data &&
            (groupedOptions as typeof data).map((option, index) => (
              <li
                {...getOptionProps({ option, index })}
                className='m-2 text-black dark:text-white'
                key={option.species.botanical_name}
              >
                {formatOptionLabel(option)}
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
