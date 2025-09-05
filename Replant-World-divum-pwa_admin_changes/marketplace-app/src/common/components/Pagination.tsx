import clsx from 'clsx';
import { useMemo } from 'react';
import { Paginate, Paginated } from 'types';

type PaginationProps = {
  paginated: Paginated<any>;
  onPaginated: (paginate: Paginate) => void;
};

const LINKS_THRESHOLD = 1;

export function Pagination({ paginated, onPaginated }: PaginationProps) {
  const currentPage = useMemo(
    () => Math.ceil(paginated.offset / paginated.limit),
    [paginated]
  );
  const pageCount = useMemo(
    () => Math.ceil(paginated.count / paginated.limit),
    [paginated]
  );

  const pages = calculatePages();

  function calculatePages(): (number | null)[] {
    if (pageCount <= 1) {
      return [];
    }

    const newPages: (number | null)[] = [0];

    const from = Math.max(1, currentPage - LINKS_THRESHOLD);
    const to = Math.min(currentPage + LINKS_THRESHOLD + 1, pageCount - 1);

    if (from > 1) {
      newPages.push(null);
    }

    for (let page = from; page < to; page++) {
      newPages.push(page);
    }

    if (to < pageCount - 1) {
      newPages.push(null);
    }

    if (to < pageCount) {
      newPages.push(pageCount - 1);
    }

    return newPages;
  }

  function paginate(page: number) {
    onPaginated({
      offset: paginated.limit * page,
      limit: paginated.limit,
    });
  }

  return (
    <div className='flex gap-3 items-center'>
      {pages.map((page, index) => {
        return page === null ? (
          <div key={index}>⋯</div>
        ) : (
          <div
            className={clsx(
              'flex items-center bg-teal-200 dark:bg-teal-700 rounded-lg px-3 py-1 cursor-pointer hover:bg-teal-300 dark:hover:bg-teal-600 border-green-400 dark:border-white',
              currentPage === page ? 'bg-teal-300 border-4' : ''
            )}
            onClick={() => paginate(page)}
            key={index}
          >
            {page + 1}
          </div>
        );
      })}
    </div>
  );
}
