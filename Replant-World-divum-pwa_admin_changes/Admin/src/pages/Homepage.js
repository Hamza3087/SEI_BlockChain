import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Head from '../layout/head/Head';
import Content from '../layout/content/Content';
import TransactionTable from '../components/partials/default/transaction/Transaction';
import { Card, Button } from 'reactstrap';
import {
  Block,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Row,
  Col,
  BlockBetween
} from '../components/Component';
import StatisticsCards from './components/StatisticsCards';
import PaginationPage from './components/Pagination';
import pending from '../images/icons/pending.svg';
import approved from '../images/icons/approved.svg';
import rejected from '../images/icons/rejected.svg';
import toMint from '../images/icons/mint.svg';
import allTrees from '../images/icons/tree.svg';
import species from '../images/icons/species.svg';
import filter from '../images/icons/filter.svg';
import PercentageCard from './components/PercentageCard';
import ReChart from './components/ReChart';
import i18n from '../locales/en.json';
import {
  capitalizeFirstLetter,
  formatDate,
  formatDateTime,
  formatMintStatus,
  hasActiveFilters
} from '../utils/helperFunction';
import {
  fetchDataByType,
  searchData,
  clearSearchData
} from '../redux/actions/treeActions';
import { fetchStatisticsData } from '../redux/actions/dashboardAction';
import InfiniteScrollObserver from '../components/InfiniteScroll';
import { DASHBOARD } from '../apiConstants/constant';
import { showToast } from '../components/ToastNotification';
import api from '../apiConstants/axiosConfig';

const Homepage = () => {
  const location = useLocation();

  // Get activeIndex from URL parameters or default to 0
  const getInitialActiveState = () => {
    const params = new URLSearchParams(location.search);
    const activeIndex = parseInt(params.get('stat'));
    return !isNaN(activeIndex) && activeIndex >= 0 && activeIndex < 6
      ? activeIndex
      : 0;
  };

  const dispatch = useDispatch();
  const statistics = useSelector((state) => state.statistics.statistics);
  const treeData = useSelector((state) => state.dashboard.dashboardData);
  const treesList = useSelector((state) => state.tree.treesData);
  const treesSummary = useSelector((state) => state.tree.dashboardSummary);
  const mintedInfo = useSelector((state) => state.tree?.mintInfo);
  const lastMintedAt = useSelector((state) => state.tree?.lastMintedAt);
  const searchTerm = useSelector((state) => state.tree.searchTerm);
  const pageCount = useSelector((state) => state.tree.totalCount);
  const isSearchActive = useSelector((state) => state.tree.isSearchActive);
  const isLoading = useSelector((state) => state.tree.loading);
  const [hasMore, setHasMore] = useState(true);

  const [activeStat, setActiveStat] = useState(getInitialActiveState());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  // New state variable for filter data
  const [filterData, setFilterData] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const stats = [
    {
      count: treesSummary?.total_trees,
      label: i18n.trees,
      displayText: i18n.trees,
      bgColor: '#DDCCBE',
      activeBorderColor: '#C7AB95',
      icon: allTrees
      // isDisabled: !treesSummary?.total_trees || treesSummary.total_trees === 0
    },
    {
      count: treesSummary?.trees_to_review,
      label: i18n.pending,
      displayText: i18n.treesToReview,
      bgColor: '#FFE9AF',
      activeBorderColor: '#FDB501',
      icon: pending,
      isDisabled: !treesSummary?.trees_to_review || treesSummary.trees_to_review === 0
    },
    {
      count: treesSummary?.approved_trees,
      label: i18n.approved,
      displayText: i18n.plantedTrees,
      bgColor: '#B7F1DB',
      activeBorderColor: '#0CCF83',
      icon: approved,
      isDisabled: !treesSummary?.approved_trees || treesSummary.approved_trees === 0
    },
    {
      count: treesSummary?.rejected_trees,
      label: i18n.rejected,
      displayText: i18n.rejectedTrees,
      bgColor: '#FFCECE',
      activeBorderColor: '#FF7886',
      icon: rejected,
      isDisabled: !treesSummary?.rejected_trees || treesSummary.rejected_trees === 0
    },
    {
      count: treesSummary?.minted_trees,
      label: i18n.toMint,
      displayText: i18n.toMint,
      bgColor: '#BBEBFF',
      activeBorderColor: '#1ABBFD',
      icon: toMint,
      isDisabled: !treesSummary?.minted_trees || treesSummary.minted_trees === 0
    },
    {
      count: treesSummary?.species_count,
      label: i18n.species,
      displayText: i18n.species,
      bgColor: '#F3E8FF',
      activeBorderColor: '#7A00FF',
      icon: species
      // isDisabled: !treesSummary?.species_count || treesSummary.species_count === 0
    }
  ];

  useEffect(() => {
    setHasMore(treesList?.length < pageCount);
  }, [treesList, pageCount]);

  const getApiType = (index) => {
    const types = [
      'all',
      'pending',
      'approved',
      'rejected',
      'to_mint',
      'species'
    ];
    return types[index];
  };

  const loadMore = useCallback(() => {
    const totalPages = Math.ceil(pageCount / itemsPerPage);
    if (isLoading || currentPage >= totalPages) return;
    setCurrentPage((prevPage) => prevPage + 1);
    const type = getApiType(activeStat);
    dispatch(
      fetchDataByType(
        type,
        currentPage + 1,
        itemsPerPage,
        searchTerm,
        filterData
      )
    );
  }, [
    isLoading,
    currentPage,
    pageCount,
    itemsPerPage,
    activeStat,
    searchTerm,
    filterData,
    dispatch
  ]);

  const handleApplyFilter = (filter) => {
    setFilterData(filter);
    dispatch(
      fetchDataByType(getApiType(activeStat), 1, 10, searchTerm, filter)
    );
    // Refresh statistics with new filter data
    if (filter && Object.keys(filter).length > 0) {
      dispatch(fetchStatisticsData(filter));
    } else {
      dispatch(fetchStatisticsData());
    }
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setFilterData({});
    dispatch(fetchDataByType(getApiType(activeStat), 1, 10, searchTerm, {}));
    // Refresh statistics without filter data
    dispatch(fetchStatisticsData());
    setCurrentPage(1);
  };

  useEffect(() => {
    const type = getApiType(activeStat);
    if (isSearchActive && searchTerm) {
      dispatch(
        searchData(searchTerm, type, currentPage, itemsPerPage, filterData)
      );
    } else {
      dispatch(
        fetchDataByType(type, currentPage, itemsPerPage, searchTerm, filterData)
      );
    }
  }, [
    activeStat,
    currentPage,
    itemsPerPage,
    dispatch,
    isSearchActive,
    searchTerm,
    filterData
  ]);

  useEffect(() => {
    // Pass filter data to statistics API if filters are applied
    if (filterData && Object.keys(filterData).length > 0) {
      dispatch(fetchStatisticsData(filterData));
    } else {
      dispatch(fetchStatisticsData());
    }
  }, [dispatch, filterData]);

  const headers = {
    Trees: [
      { label: 'ID', key: 'tree_id', size: 'md' },
      { label: 'Species Name', key: 'species_name', size: 'xl' },
      {
        label: 'Review State',
        key: 'review_state',
        size: 'md'
      },
      { label: 'Minting State', key: 'minting_state', size: 'lg' },
      { label: 'NFT ID', key: 'nft_id', size: 'md' },
      { label: 'Sponsors', key: 'sponsor', size: 'md' },
      {
        label: 'Organization Community',
        key: 'organisation_name',
        size: 'xl'
      },
      { label: 'Planter', key: 'planted_by', size: 'lg' },
      { label: 'Planted On', key: 'planted_on', size: 'xl' }
    ],
    Pending: [
      { label: 'Image', key: 'image_url', size: 'md' },
      { label: 'Species Name', key: 'species_name', size: 'md' },
      { label: 'Organization Community', key: 'organisation_name', size: 'xl' },
      { label: 'Planted By', key: 'planted_by', size: 'xl' },
      { label: 'Planted On', key: 'planted_on', size: 'xl' },
      { label: 'Comment', key: 'comment', size: 'xl' },
      { label: 'Approve/Reject', key: 'status', size: 'xl' }
    ],
    Approved: [
      { label: 'Image', key: 'image_url', size: 'md' },
      { label: 'ID', key: 'tree_id', size: 'md' },
      { label: 'Species Name', key: 'species_name', size: 'md' },
      { label: 'Minting State', key: 'minting_state', size: 'md' },
      { label: 'NFT ID', key: 'nft_id', size: 'md' },
      { label: 'Sponsors', key: 'sponsor', size: 'md' },
      { label: 'Organization Community', key: 'organisation_name', size: 'xl' },
      { label: 'Planted By', key: 'planted_by', size: 'xl' },
      { label: 'Planted On', key: 'planted_on', size: 'lg' },
      { label: 'Approved On', key: 'approved_on', size: 'lg' },
      { label: 'Action', key: 'actions', size: 'lg' }
    ],
    Rejected: [
      { label: 'Image', key: 'image_url', size: 'md' },
      { label: 'Species Name', key: 'species_name', size: 'md' },
      { label: 'Organisation', key: 'organisation_name', size: 'md' },
      { label: 'Planted By', key: 'planted_by', size: 'md' },
      { label: 'Planted On', key: 'planted_on', size: 'md' },
      { label: 'Rejected On', key: 'rejected_on', size: 'md' },
      { label: 'Action', key: 'actions', size: 'lg' }
      // { label: 'Created at', key: 'created_at', size: 'md' }
    ],
    'To Mint': [
      { label: '', key: 'checkbox', size: 'sm' },
      { label: 'ID', key: 'tree_id', size: 'md' },
      { label: 'Species Name', key: 'species_name', size: 'md' },
      { label: 'Approved On', key: 'approved_on', size: 'lg' },
      { label: 'Minting State', key: 'minting_state', size: 'md' },
      { label: 'Sponsors', key: 'sponsor', size: 'md' },
      { label: 'Organisation', key: 'organisation_name', size: 'lg' },
      { label: 'NFT ID', key: 'nft_id', size: 'md' },
      { label: 'Created By', key: 'planted_by', size: 'md' },
      { label: 'Created at', key: 'created_at', size: 'md' }
    ],
    Species: [
      { label: 'Common Name', key: 'common_name', size: 'lg' },
      { label: 'Botanical Name', key: 'botanical_name', size: 'lg' },
      { label: 'IUCN Status', key: 'iucn_status', size: 'lg' },
      { label: 'Action', key: 'actions', size: 'lg' }
    ]
  };
  const percentageData = [
    {
      count: `${statistics?.content?.approved_trees || 0} %`,
      label: i18n.approved
    },
    {
      count: `${statistics?.content?.planted_trees || 0}`,
      label: i18n.mintedTrees
    },
    {
      count: statistics?.content?.average_cost || '$0',
      label: i18n.avgCost
    },
    {
      count: statistics?.content?.total_nft || '$0',
      label: i18n.totalNft
    }
  ];

  const formattedTreesList = treesList?.map((tree) => ({
    ...tree,
    species_name: `${tree.species_name} (${tree.botanical_name})`,
    planted_on: formatDate(tree.planted_on),
    review_state: capitalizeFirstLetter(tree.review_state),
    minting_state: formatMintStatus(tree.minting_state),
    nft_id: tree.nft_id || '-',
    sponsor: tree.sponsor || '-',
    approved_on: formatDateTime(tree.approved_on),
    rejected_on: formatDateTime(tree.rejected_on),
    created_at: formatDateTime(tree?.planted_on)
  }));

  const formattedMintedData = {
    mintedInfo: mintedInfo,
    lastMintedAt: lastMintedAt
  };

  const handleStatClick = (index) => {
    if (stats[index].isDisabled) return;
    setActiveStat(index);
    setCurrentPage(1); // Reset to first page when changing tabs
    // Update URL with new activeIndex
    const newUrl = `${window.location.pathname}?stat=${index}`;
    window.history.pushState({}, '', newUrl);

    if (isSearchActive) {
      dispatch(clearSearchData(getApiType(index), 1, itemsPerPage, filterData));
    } else {
      // If no active search, just fetch data for the new tab with current filter
      dispatch(fetchDataByType(getApiType(index), 1, itemsPerPage, '', filterData));
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const type = getApiType(activeStat);
    dispatch(fetchDataByType(type, page, itemsPerPage, searchTerm, filterData));
  };

  // New search handlers
  const handleSearch = (term) => {
    if (!term.trim()) {
      handleClearSearch();
      return;
    }
    const type = getApiType(activeStat);
    dispatch(searchData(term, type, 1, itemsPerPage, filterData));
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    const type = getApiType(activeStat);
    dispatch(clearSearchData(type, currentPage, itemsPerPage, filterData));
  };

  const toggleFilterModal = () => setIsFilterModalOpen(!isFilterModalOpen);

  const handleGenerateReport = async () => {
    try {
      setIsDownloading(true);
      
      // Build the endpoint with current filter parameters
      let endpoint = `${DASHBOARD.GENERATE_REPORT}`;
      
      // Add filter parameters if they exist
      if (filterData && Object.keys(filterData).length > 0) {
        const params = new URLSearchParams();
        Object.entries(filterData).forEach(([filterKey, filterValue]) => {
          if (!filterValue && filterValue !== 0) return; // skip if no value
          // Convert Date objects to ISO string or extract id from object
          if (filterValue instanceof Date) {
            filterValue = filterValue.toISOString();
          } else if (typeof filterValue === 'object') {
            filterValue = filterValue.id || '';
          }
          if (!filterValue) return;
          let apiKey = filterKey;
          switch (filterKey) {
            case 'organisation':
              apiKey = 'organisation_id';
              break;
            case 'planter':
              apiKey = 'planted_by';
              break;
            case 'sponsor':
              apiKey = 'sponsor_id';
              break;
            case 'species':
              apiKey = 'species_id';
              break;
            case 'country':
              apiKey = 'country_id';
              break;
            case 'iucn':
              apiKey = 'iucn_id';
              break;
            default:
              break;
          }
          params.append(apiKey, filterValue);
        });
        endpoint += `?${params.toString()}`;
      }
      
      // Make API request to get the report using axios
      const response = await api.get(endpoint, {
        responseType: 'blob' // Important for file downloads
      });

      // Get the filename from the Content-Disposition header, or use a default name
      const contentDisposition = response.headers?.['content-disposition'];
      let filename = 'dashboard_report.csv';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=(?:(\\?['"])(.*?)\1|(?:[^\s]+'.*?')?([^;\n]*))/i
        );
        if (filenameMatch && filenameMatch[2]) {
          filename = filenameMatch[2];
        } else if (filenameMatch && filenameMatch[3]) {
          filename = filenameMatch[3];
        }
      }

      // Create a URL for the blob
      const url = window.URL.createObjectURL(response);
      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      // Check if error is a Blob (API error response)
      if (error instanceof Blob) {
        try {
          // Handle Blob error - convert to text and parse as JSON
          const errorText = await error.text();
          const errorData = JSON.parse(errorText);
          showToast.error(errorData?.message || 'Failed to download report. Please try again later.');
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          // If parsing fails, show default error message
          showToast.error('Failed to download report. Please try again later.');
        }
      } else {
        // Fallback error message
        showToast.error('Failed to download report. Please try again later.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <React.Fragment>
      <Head title={i18n.treeManagement}></Head>
      <Content>
        <BlockHead size='sm'>
          <BlockBetween>
                <BlockTitle
                  page
                  tag='h3'
                  className='black-text fw-medium'
                >
                  {i18n.adminDashboard}
                </BlockTitle>
                <div className='d-flex align-items-center gap-2'>
                  <div style={{ position: 'relative' }}>
                    <Button
                      style={{
                        borderRadius: '8px',
                        backgroundColor: '#FAFAFA',
                        borderColor: '#ACACAC',
                        padding: '0.4rem 0.9rem'
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
                  {stats[activeStat].label === 'Trees' && (
                    <Button
                      className='fw-medium btn'
                      style={{
                        borderRadius: '8px',
                        backgroundColor: '#0D5A42',
                        whiteSpace: 'nowrap',
                        fontSize: '14px'
                      }}
                      onClick={handleGenerateReport}
                      disabled={isDownloading}
                    >
                      {isDownloading ? 'Downloading...' : i18n.dashboardReport}
                    </Button>
                  )}
                </div>
          </BlockBetween>
        </BlockHead>
        <Block>
          <Row className='g-gs'>
            <Col size='12'>
              <BlockHead
                size='md'
                className={activeStat !== 0 ? 'no-padding-bottom' : ''}
              >
                <StatisticsCards
                  stats={stats}
                  onCardClick={handleStatClick}
                  activeCard={activeStat}
                />
              </BlockHead>
              {activeStat === 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '0fr 1fr 1fr',
                    gap: '1rem'
                  }}
                >
                  <PercentageCard stats={percentageData} />
                  <ReChart
                    title={i18n.iucnStatus}
                    // amount={statistics?.content?.avg_cost_usd}
                    // unit='USD'
                    data={statistics?.content?.iucn_status}
                  />
                  <ReChart
                    title={i18n.speciesMix}
                    // amount='10,820'
                    // unit='USD'
                    data={statistics?.content?.species_mix}
                  />
                </div>
              )}
              <hr
                className='my-4'
                style={{ borderWidth: '2px' }}
              />
              <Card
                className='card-bordered'
                style={
                  stats[activeStat].label === 'Pending'
                    ? { border: 'none' }
                    : {}
                }
              >
                <TransactionTable
                  headers={headers[stats[activeStat].label]}
                  data={formattedTreesList}
                  title={stats[activeStat].displayText}
                  activeTab={stats[activeStat].label}
                  onSearch={handleSearch}
                  onClearSearch={handleClearSearch}
                  searchTerm={searchTerm}
                  isSearchActive={isSearchActive}
                  formattedMintedData={formattedMintedData}
                  onApplyFilter={handleApplyFilter}
                  onClearFilter={handleClearFilter}
                  filterData={filterData}
                  isFilterModalOpen={isFilterModalOpen}
                  toggleFilterModal={toggleFilterModal}
                  currentFilterData={filterData}
                />
                {stats[activeStat].label === 'Pending' && (
                  <InfiniteScrollObserver
                    onIntersect={loadMore}
                    isLoading={isLoading}
                    hasMore={hasMore}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </Block>
        <Block className='d-flex justify-content-end'>
          {stats[activeStat].label !== 'Pending' && (
            <PaginationPage
              currentPage={currentPage}
              totalCount={pageCount}
              perPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          )}
        </Block>
      </Content>
    </React.Fragment>
  );
};

export default Homepage;
