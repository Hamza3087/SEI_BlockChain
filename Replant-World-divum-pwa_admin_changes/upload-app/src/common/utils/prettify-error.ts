import { AxiosError } from 'axios';

export const prettifyError = (err: AxiosError) => {
  if (err.response?.data) {
    const header = `${err.message}\n`;
    if (err.response.status >= 500) {
      if (`${err.response?.data}`.includes('NoneType')) {
        const header = `Internal Server Error</strong>\n`;
        return (
          header +
          `Unfortunately there was an unexpected server error. Try logging in again, and if that doesn't help, contact the site administrator.`
        );
      }

      return header;
    }
    if (typeof err.response.data === 'object') {
      return header + prettifyJSON(err.response.data);
    }
    return header + err.response.data;
  }

  return err.message;
};

// TODO: make it recursive
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prettifyJSON = (obj: any) => {
  return Object.entries(obj)
    .map(([key, items]) => {
      if (!Array.isArray(items)) {
        items = [items];
      } // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (items as any[])
        .map((item) => `${prettifyKey(key)}: ${item}`)
        .join('\n');
    })
    .join('\n');
};

const prettifyKey = (key: string) => {
  const words = key.split('_');
  const firstWord = words[0];
  const restWords = words.slice(1);
  return [firstWord[0].toUpperCase() + firstWord.slice(1), ...restWords].join(
    ' '
  );
};
