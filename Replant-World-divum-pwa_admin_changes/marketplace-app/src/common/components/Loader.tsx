import { BeatLoader } from 'react-spinners';

export type LoaderProps = { size?: number; color?: string };

export const Loader: React.FC<LoaderProps> = ({ size = 10 }) => (
  <BeatLoader size={size} speedMultiplier={0.5} color={'#808080'} />
);
