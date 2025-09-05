import { ReactNode } from 'react';

type ReadOnlyFieldProps = {
  label: string;
  value: ReactNode;
};

export function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div className='flex justify-between gap-5 w-full border-b border-gray-100 dark:border-teal-700 last:border-b-0 py-2'>
      <span>{label}</span>
      <span className='text-teal-650 text-right'>{value}</span>
    </div>
  );
}
