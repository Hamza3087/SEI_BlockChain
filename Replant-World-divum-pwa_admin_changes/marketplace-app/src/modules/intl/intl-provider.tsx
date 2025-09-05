import { IntlProvider as _IntlProvider } from 'react-intl';
import messages from './en-US.json';

type Props = {
  children: React.ReactNode;
};

export const IntlProvider: React.FC<Props> = ({ children }) => {
  const locale = 'en-US';
  return (
    <_IntlProvider locale={locale} messages={messages}>
      {children}
    </_IntlProvider>
  );
};
