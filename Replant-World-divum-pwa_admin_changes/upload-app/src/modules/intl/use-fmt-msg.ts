import { useIntl as _useIntl } from 'react-intl';

import messages from './en-US.json';

export type MessageDict = typeof messages;
export type MessageKey = keyof typeof messages;

export const useFmtMsg = () => {
  const { formatMessage } = _useIntl();

  // simplify formatMessage API
  const fmtMsg = (
    id: MessageKey,
    values?: {
      [key: string]: string | number | boolean | null | undefined | Date;
    }
  ) => formatMessage({ id }, values);

  return fmtMsg;
};

export type FmtMsgFn = ReturnType<typeof useFmtMsg>;
