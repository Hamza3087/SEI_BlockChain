import React, { useState, useEffect } from 'react';
import Icon from '../../components/icon/Icon';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { Block } from '../../components/block/Block';

// Helper to generate page numbers (with ellipsis if needed)
const getPageNumbers = (currentPage, pageCount) => {
  const delta = 2;
  const range = [];
  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(pageCount - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }
  if (currentPage - delta > 2) {
    range.unshift('...');
  }
  if (currentPage + delta < pageCount - 1) {
    range.push('...');
  }
  range.unshift(1);
  if (pageCount > 1) range.push(pageCount);
  return [...new Set(range)];
};

const PaginationPage = ({
  totalCount = 0,
  currentPage = 1,
  perPage = 10,
  onPageChange = () => {},
  ...props
}) => {
  const [pageCount, setPageCount] = useState(
    Math.ceil(totalCount / perPage) || 1
  );

  useEffect(() => {
    setPageCount(Math.ceil(totalCount / perPage) || 1);
  }, [totalCount]);

  const pageNumbers = getPageNumbers(currentPage, pageCount);

  const handlePageChange = (page) => {
    if (
      page !== '...' &&
      page !== currentPage &&
      page >= 1 &&
      page <= pageCount
    ) {
      onPageChange(page);
    }
  };

  return (
    <React.Fragment>
      <Block size='lg'>
        <Pagination aria-label='Page navigation'>
          <PaginationItem disabled={currentPage === 1}>
            <PaginationLink
              className='page-link-prev'
              href='#prev'
              onClick={(ev) => {
                ev.preventDefault();
                handlePageChange(currentPage - 1);
              }}
            >
              <Icon name='chevrons-left' />
              <span>Prev</span>
            </PaginationLink>
          </PaginationItem>
          {pageNumbers.map((page, idx) =>
            page === '...' ? (
              <PaginationItem
                key={idx}
                disabled
              >
                <PaginationLink tag='span'>
                  <Icon name='more-h' />
                </PaginationLink>
              </PaginationItem>
            ) : (
              <PaginationItem
                key={idx}
                active={page === currentPage}
              >
                <PaginationLink
                  href='#item'
                  onClick={(ev) => {
                    ev.preventDefault();
                    handlePageChange(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem disabled={currentPage === pageCount}>
            <PaginationLink
              className='page-link-next'
              href='#next'
              onClick={(ev) => {
                ev.preventDefault();
                handlePageChange(currentPage + 1);
              }}
            >
              <span>Next</span>
              <Icon name='chevrons-right' />
            </PaginationLink>
          </PaginationItem>
        </Pagination>
      </Block>
    </React.Fragment>
  );
};

export default PaginationPage;
