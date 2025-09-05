export type Paginate = {
  offset: number;
  limit: number;
};

export type Paginated<T> = Paginate & {
  count: number;
  results: T[];
};
