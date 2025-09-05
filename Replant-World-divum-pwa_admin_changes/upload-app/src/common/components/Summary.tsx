type Props = {
  children?: React.ReactNode;
};

export const Summary: React.FC<Props> = ({ children }) => (
  <div className='bg-gray-100 dark:bg-teal-700 p-2.5 rounded-lg flex flex-col gap-2.5'>
    {children}
  </div>
);
