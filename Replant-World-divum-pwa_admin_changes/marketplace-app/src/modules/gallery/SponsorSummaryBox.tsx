import { ReactElement } from 'react';

type SponsorSummaryBoxProps = {
  icon: ReactElement;
  value: string | number;
  label: string | number;
};

export function SponsorSummaryBox(props: SponsorSummaryBoxProps) {
  return (
    <div className='flex items-center gap-5 rounded-2xl bg-teal-300 dark:bg-teal-700 px-8 py-3 text-green-400 dark:text-green-300 w-full'>
      {props.icon}
      <div className='flex flex-col'>
        <div className='text-2xl font-bold'>{props.value}</div>
        <div>{props.label}</div>
      </div>
    </div>
  );
}
