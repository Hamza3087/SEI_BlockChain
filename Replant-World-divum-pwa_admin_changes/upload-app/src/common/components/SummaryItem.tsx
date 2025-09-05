type Props = {
  children?: React.ReactNode;
};

export const SummaryItem: React.FC<Props> = ({ children }) => (
  <div className='flex justify-between items-center gap-2.5'>
    {children}
  </div>
);
