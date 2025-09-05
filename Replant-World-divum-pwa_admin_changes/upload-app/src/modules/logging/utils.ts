const sliceSizeError = 'Slice size must be non-zero positive integer.';

export const slicedArray = <T>(array: T[], sliceSize: number): T[][] => {
  if (sliceSize <= 0 || !Number.isInteger(sliceSize)) {
    throw new Error(sliceSizeError);
  }
  const slices: T[][] = [];
  for (let i = 0; i < array.length; i += sliceSize) {
    slices.push(array.slice(i, i + sliceSize));
  }
  return slices;
};
