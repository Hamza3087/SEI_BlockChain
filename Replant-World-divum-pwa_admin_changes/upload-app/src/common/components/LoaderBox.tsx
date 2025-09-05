import { Loader, LoaderProps } from '.';

type Props = LoaderProps & {
  visible?: boolean;
  height?: string;
  margin?: string;
  width?: string;
};

export const LoaderBox: React.FC<Props> = ({
  visible = true,
  height = '200px',
  margin = '0',
  width = '100%',
  ...loaderProps
}) => {
  return (
    <div
      style={{ height, margin, width }}
      className={visible ? 'flex items-center justify-center' : 'hidden'}
    >
      <Loader {...loaderProps} />
    </div>
  );
};
