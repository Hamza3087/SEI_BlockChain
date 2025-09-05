import { BeatLoader } from 'react-spinners';

export type LoaderProps = { size?: number; color?: string };

// base for more complex loader components
export const Loader: React.FC<LoaderProps> = ({
  size = 10,
  color = '#808080',
}) => <BeatLoader size={size} speedMultiplier={0.5} color={color} />;
