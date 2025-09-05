import { Message, Severity } from './types';

export const SNACKBAR_EVENT = 'ReplantWorld:openSnackbar';

export const openSnackbar = (
  message: string,
  severity: Severity,
  duration: number = 3000
) => {
  const event = new CustomEvent<Message>(SNACKBAR_EVENT, {
    detail: { message, severity, duration },
  });
  document.dispatchEvent(event);
};
