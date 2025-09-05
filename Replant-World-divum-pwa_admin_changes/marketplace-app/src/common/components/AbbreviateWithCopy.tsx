import { useMemo, useState } from 'react';
import { IconCopy } from './icons/IconCopy';
import { IconCheck } from './icons/IconCheck';

const MAX_LENGTH = 10;

export type AbbreviateWithCopyProps = {
  value: string;
};
export function AbbreviateWithCopy({ value }: AbbreviateWithCopyProps) {
  const [isCopied, setIsCopied] = useState(false);
  const abbreviatedValue = useMemo(() => abbreviate(value), [value]);

  function abbreviate(value: string) {
    if (value.length > MAX_LENGTH) {
      return value.substring(0, MAX_LENGTH) + '…';
    }
    return value;
  }

  function copy() {
    window.navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }

  const copyTemplate = (
    <div className=' ml-2 cursor-pointer' onClick={copy}>
      {isCopied ? (
        <IconCheck className='w-6 h-6' />
      ) : (
        <IconCopy className='w-6 h-6' />
      )}
    </div>
  );

  return (
    <div className='flex items-center' title={value}>
      <span>{abbreviatedValue}</span>
      {value.length > abbreviatedValue.length ? copyTemplate : null}
    </div>
  );
}
