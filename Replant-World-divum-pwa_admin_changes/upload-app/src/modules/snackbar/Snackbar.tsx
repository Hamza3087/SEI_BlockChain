import { Snackbar as MuiSnackbar } from '@mui/base';
import clsx from 'clsx';
import { Severity } from './types';

type Props = {
  children?: React.ReactNode;
  severity: Severity;
  onClose: () => void;
};

export const Snackbar: React.FC<Props> = ({ children, severity, onClose }) => {
  return (
    <MuiSnackbar
      className={clsx(
        'rounded-lg px-5 py-2.5 text-base',
        severity === 'error' ? 'bg-red-400' : 'bg-green-400'
      )}
      autoHideDuration={7500}
      open={true}
      onClose={onClose}
    >
      {children}
    </MuiSnackbar>
  );
};
