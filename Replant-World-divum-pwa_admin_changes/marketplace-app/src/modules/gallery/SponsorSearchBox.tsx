import { useQuery } from '@tanstack/react-query';
import { useClickAway, useDebounce } from '@uidotdev/usehooks';
import { IconSearch, IconX, Menu, MenuItem } from 'common/components';
import { useFmtMsg } from 'modules/intl';
import { useState } from 'react';
import { autocompleteSponsors } from './api';
import { SponsorSimple } from './types';

type SponsorSearchBoxProps = {
  onSearch: (sponsor: SponsorSimple | null) => void;
};

export function SponsorSearchBox(props: SponsorSearchBoxProps) {
  const fmtMsg = useFmtMsg();
  const [searchTerm, setSearchTerm] = useState('');
  const [focused, setFocused] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const ref = useClickAway<HTMLDivElement>(() => setFocused(false));

  const { data: sponsors } = useQuery({
    queryKey: ['sponsors', debouncedSearchTerm],
    queryFn: () => autocompleteSponsors({ search: debouncedSearchTerm }),
    enabled: focused,
  });

  function select(sponsor: SponsorSimple) {
    setSearchTerm(sponsor.name);
    setFocused(false);
    props.onSearch(sponsor);
  }

  function onChange(value: string) {
    setSearchTerm(value);
    props.onSearch(null);
  }

  return (
    <div
      className='relative w-48 sm:w-72 bg-gray-200 dark:bg-teal-700 rounded-xl flex items-center justify-end pr-3 h-14'
      ref={ref}
    >
      <input
        type='text'
        placeholder={fmtMsg('search')}
        className='px-6 py-2 absolute left-0 top-0 w-full h-full bg-transparent rounded-xl pr-10'
        value={searchTerm}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
      />
      <div className='flex max-w-4 z-10' onClick={() => onChange('')}>
        {searchTerm ? <IconX className='cursor-pointer' /> : <IconSearch />}
      </div>

      {focused && sponsors?.results?.length ? (
        <Menu>
          {sponsors.results.map((sponsor) => (
            <MenuItem onSelect={() => select(sponsor)} key={sponsor.id}>
              {sponsor.name}
            </MenuItem>
          ))}
        </Menu>
      ) : null}
    </div>
  );
}
