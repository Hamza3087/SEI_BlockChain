import { format, parseISO } from 'date-fns';

export const TIME_WITHOUT_DATE_FORMAT = 'HH:mm';
export const DATE_WITHOUT_TIME_FORMAT = 'dd-MM-yyy';

export const formattedDate = (date: string) =>
  format(parseISO(date), DATE_WITHOUT_TIME_FORMAT);
export const formattedTime = (time: string) =>
  format(parseISO(time), TIME_WITHOUT_DATE_FORMAT);

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);

  // Format date as "DD MMM YYYY"
  const formattedDate = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return `${formattedDate}`;
};

// Function to calculate time difference and return a human-readable string
export const calculateTimeDifference = (timestamp: string): string => {
  if (!timestamp) return 'Started Today';

  const currentTime = new Date();
  const pastTime = new Date(timestamp);
  const diffInMilliseconds: number = currentTime.getTime() - pastTime.getTime();

  const years: number = Math.floor(
    diffInMilliseconds / (1000 * 60 * 60 * 24 * 365)
  );
  const months: number = Math.floor(
    (diffInMilliseconds % (1000 * 60 * 60 * 24 * 365)) /
      (1000 * 60 * 60 * 24 * 30)
  );
  const days: number = Math.floor(
    (diffInMilliseconds % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
  );

  let timeString = '';
  if (years !== 0)
    timeString += `${Math.abs(years)} year${Math.abs(years) > 1 ? 's' : ''}`;
  if (months !== 0)
    timeString +=
      (timeString ? ', ' : '') +
      `${Math.abs(months)} month${Math.abs(months) > 1 ? 's' : ''}`;
  if (days !== 0)
    timeString +=
      (timeString ? ', ' : '') +
      `${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''}`;

  return timeString ? `Growing ${timeString}` : 'Started Today';
};
