import { BackButton } from '.';

type Props = {
  text: string;
  onBack?: () => void;
};

export const Header: React.FC<Props> = ({ text, onBack }) => {
  return (
    <header className='flex flex-col gap-5'>
      {onBack && <BackButton onClick={onBack} />}
      <h2
        className={'text-black dark:text-white text-center text-2xl font-bold'}
      >
        {text}
      </h2>
    </header>
  );
};
