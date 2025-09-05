import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Head from '../layout/head/Head';
import Content from '../layout/content/Content';
import { Card, Badge, Button, Input } from 'reactstrap';
import {
  Block,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Row,
  Col,
  BlockBetween
} from '../components/Component';
import { formatMintStatus, hasActiveFilters } from '../utils/helperFunction';
import PaginationPage from './components/Pagination';
import { fetchDataByType } from '../redux/actions/treeActions';
import Icon from '../components/icon/Icon';
import {
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow
} from '../components/table/DataTable';
import FilterModal from '../components/Filter';
import search from '../images/icons/search.svg';
import filter from '../images/icons/filter.svg';
import i18n from '../locales/en.json';

const NftHistory = () => {
  const dispatch = useDispatch();
  const { loading, error, data, count } = useSelector(
    (state) => state.dashboard.nftHistory
  );
  const [activeTab] = useState('NFT History');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [searchKeyword, setSearchKeyword] = useState('');
  const [lastSearchAttempt, setLastSearchAttempt] = useState('');
  const [filterData, setFilterData] = useState({});
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    dispatch(
      fetchDataByType(
        activeTab,
        currentPage,
        perPage,
        lastSearchAttempt,
        filterData
      )
    );
  }, [
    currentPage,
    perPage,
    dispatch,
    activeTab,
    filterData,
    lastSearchAttempt
  ]);

  const handleSearch = (search) => {
    setCurrentPage(1);
    setSearchKeyword(search);
    setLastSearchAttempt(search);
    dispatch(fetchDataByType(activeTab, 1, perPage, searchKeyword, filterData));
  };

  const handleClearSearch = () => {
    setCurrentPage(1);
    setSearchKeyword('');
    setLastSearchAttempt('');
    dispatch(fetchDataByType(activeTab, currentPage, perPage, '', filterData));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleApplyFilter = (filter) => {
    setFilterData(filter);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setFilterData({});
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(searchKeyword);
    }
  };

  const toggleFilterModal = () => setIsFilterModalOpen(!isFilterModalOpen);

  const renderMintedState = (state) => {
    const stateColors = {
      minted: '#00C925',
      'to be minted': '#3148F7',
      failed: '#EE0000',
      pending: '#FDB501'
    };

    const normalizedState = state?.trim()?.toLowerCase();
    const color = stateColors[normalizedState] || '#6c757d';

    return (
      <Badge
        style={{ color }}
        className='badge-dot badge-dot-xs'
      >
        {state}
      </Badge>
    );
  };

  const mapApiDataToComponentFormat = (apiData) => {
    if (!apiData || !apiData.length) return [];

    return apiData.map((item) => ({
      id: item.nft_id || '-',
      sponsorName: item.sponsor_name || '-',
      sponsorType: item.sponsor_type || '-',
      speciesName: item.species_name,
      mintedState: formatMintStatus(item?.minting_state),
      plantedOn: item.planted_on,
      community: item.organization_name,
      reviewedOn: item.reviewed_on
    }));
  };

  const headers = [
    { label: 'ID', key: 'id', size: 'md' },
    { label: 'Sponsor Name', key: 'sponsorName', size: 'xl' },
    { label: 'Sponsors Type', key: 'sponsorType', size: 'xl' },
    { label: 'Species Name', key: 'speciesName', size: '2xl' },
    { label: 'Minting State', key: 'mintedState', size: 'xl' },
    { label: 'Planted On', key: 'plantedOn', size: 'xl' },
    { label: 'Organization Community', key: 'community', size: 'lg' },
    { label: 'Review On', key: 'reviewedOn', size: 'xl' }
  ];

  const transformedData = mapApiDataToComponentFormat(data);

  const renderActionButtons = () => {
    return (
      <div
        className='d-flex align-items-center gap-2'
        style={{ position: 'relative' }}
      >
        <div style={{ position: 'relative' }}>
          <Button
            style={{
              borderRadius: '8px',
              backgroundColor: '#FAFAFA',
              borderColor: '#E7E7E7',
              padding: '0.3rem 0.9rem'
            }}
            onClick={toggleFilterModal}
          >
            <img
              src={filter}
              alt='Filter'
              style={{ marginRight: '12px' }}
            />
            <span
              className='fw-normal'
              style={{ color: '#2C3E50', fontSize: '14px', marginTop: '2px' }}
            >
              {i18n.filter}
            </span>
          </Button>
          {hasActiveFilters(filterData) && (
            <div
              style={{
                position: 'absolute',
                top: '3px', 
                right: 'calc(100% - 40px)',
                width: '12px',
                height: '12px',
                backgroundColor: '#0D5A42',
                borderRadius: '50%',
                border: '2px solid white'
              }}
            />
          )}
        </div>
        <div
          style={{
            borderLeft: '1px solid #EDEDED',
            height: '30.5px',
            margin: '0 8px'
          }}
        ></div>
        <div className='form-control-wrap'>
          <div className='form-icon form-icon-right'>
            {searchKeyword ? (
              <Icon
                name='cross-sm'
                onClick={handleClearSearch}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              <img
                src={search}
                alt='Search'
              />
            )}
          </div>
          <Input
            className='form-control'
            style={{
              borderRadius: '8px',
              backgroundColor: '#FAFAFA',
              borderColor: isSearchFocused ? '#1D5942' : '#E7E7E7',
              boxShadow: 'none',
              fontSize: '14px',
              width: '100%',
              minWidth: '10.1875rem',
              maxWidth: '19.1875rem'
            }}
            type='text'
            id='default-3'
            placeholder={i18n.search}
            value={searchKeyword}
            onChange={handleSearchChange}
            onKeyPress={handleSearchSubmit}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>
      </div>
    );
  };

  const renderNoDataFound = () => {
    return (
      <div className='text-center py-5'>
        <div className='mb-3'>
          <Icon
            name='file-text'
            className=''
            style={{ fontSize: '2.5rem' }}
          />
        </div>
        <h5
          className='fw-semibold'
          style={{
            color: '#000000'
          }}
        >
          {i18n.dataNotFound}
        </h5>
      </div>
    );
  };

  const hasNoData = !transformedData || transformedData.length === 0;

  return (
    <React.Fragment>
      <Head title={i18n.nftHistory}></Head>
      <Content>
        <BlockHead size='sm'>
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle
                page
                tag='h3'
                className='black-text fw-medium'
              >
                {i18n.adminDashboard}
              </BlockTitle>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>
        <Block>
          <Row className='g-gs'>
            <Col size='12'>
              <Card className='card-bordered'>
                {loading ? (
                  <div className='d-flex justify-content-center align-items-center p-5'>
                    <span>Loading NFT history data...</span>
                  </div>
                ) : error ? (
                  <div className='d-flex justify-content-center align-items-center p-5 text-danger'>
                    <span>Error loading NFT history: {error}</span>
                  </div>
                ) : (
                  <>
                    <div className='card-inner border-header'>
                      <div className='card-title-group'>
                        <h6 className='title'>
                          <span
                            className='me-2 fw-medium black-text'
                            style={{ fontSize: '20px' }}
                          >
                            {activeTab}
                          </span>
                        </h6>
                        <div className='d-flex align-center gap-2'>
                          {renderActionButtons()}
                        </div>
                      </div>
                    </div>

                    {hasNoData ? (
                      renderNoDataFound()
                    ) : (
                      <DataTableBody
                        className=''
                        bodyclass='nk-tb-orders'
                      >
                        <DataTableHead>
                          {headers?.map((header, index) => (
                            <DataTableRow
                              key={index}
                              size={header.size || 'md'}
                            >
                              <span
                                className='fw-base header-text'
                                style={{ fontSize: '14px' }}
                              >
                                {header.label}
                              </span>
                            </DataTableRow>
                          ))}
                        </DataTableHead>
                        {transformedData.map((item, idx) => (
                          <DataTableItem key={idx}>
                            {headers?.map((header, index) => (
                              <DataTableRow
                                key={index}
                                size={header.size || 'md'}
                              >
                                <span
                                  className={`tb-lead fw-normal value-text`}
                                >
                                  {header.key === 'mintedState'
                                    ? renderMintedState(item[header.key])
                                    : item[header.key]}
                                </span>
                              </DataTableRow>
                            ))}
                          </DataTableItem>
                        ))}
                      </DataTableBody>
                    )}
                  </>
                )}
              </Card>
            </Col>
          </Row>
        </Block>
        <Block className='d-flex justify-content-end'>
          {count > perPage && (
            <PaginationPage
              currentPage={currentPage}
              totalCount={count}
              perPage={perPage}
              onPageChange={handlePageChange}
            />
          )}
        </Block>
        <FilterModal
          isOpen={isFilterModalOpen}
          toggle={toggleFilterModal}
          header='Filter By:'
          activeTab={activeTab}
          onApplyFilter={handleApplyFilter}
          onClearFilter={handleClearFilter}
        />
      </Content>
    </React.Fragment>
  );
};
export default NftHistory;
