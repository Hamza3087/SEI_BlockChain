import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Head from '../layout/head/Head';
import Content from '../layout/content/Content';
import TransactionTable from '../components/partials/default/transaction/Transaction';
import { Card } from 'reactstrap';
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
import {
  fetchDataByType,
  searchData,
  clearSearchData
} from '../redux/actions/treeActions';
import {
  capitalizeFirstLetter,
  formatDate,
  formattedDate,
  formatCountries,
  formatList
} from '../utils/helperFunction';
// import { fetchSponsorDetails } from '../redux/actions/fetchSponsorAction';
import SponsorDetails from './SponsorDetails';
import i18n from '../locales/en.json';

const PeopleOrganization = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  // Get activeIndex from URL parameters or default to 0
  const getInitialActiveState = () => {
    const params = new URLSearchParams(location.search);
    const activeIndex = parseInt(params.get('stat'));
    return !isNaN(activeIndex) && activeIndex >= 0 && activeIndex < 3
      ? activeIndex
      : 0;
  };

  // const sponsorDetails = useSelector(
  //   (state) => state.sponsorDetails.sponsorDetails
  // );
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [showSponsorDetails, setShowSponsorDetails] = useState(null);
  const [isLoadingSponsorDetails, setIsLoadingSponsorDetails] = useState(null);
  const handleSponsorDetailsClick = async (sponsor) => {
    setIsLoadingSponsorDetails(true);
    try {
      // const content = await dispatch(fetchSponsorDetails(sponsor?.id));
      // Assume fetchSponsorDetails returns an object in content.payload
      // Map the fields to match SponsorCard requirements
      const formattedSponsorData = {
        sponsor: sponsor?.id,
        // fall back to sponsor if a field is missing on fetched data
        name: sponsor?.name,
        type: sponsor?.type,
        contact_person_email: sponsor?.contact_person_email,
        created_on: formatDate(sponsor?.created_on),
        wallet_address: sponsor?.wallet_address
      };
      setSelectedSponsor(formattedSponsorData);
      setShowSponsorDetails(true);
    } catch (error) {
      console.error('Error fetching sponsor details:', error);
    } finally {
      setIsLoadingSponsorDetails(false);
    }
  };

  const searchTerm = useSelector((state) => state.tree.searchTerm);
  const isSearchActive = useSelector((state) => state.tree.isSearchActive);
  const [activeStat, setActiveStat] = useState(getInitialActiveState());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterData, setFilterData] = useState({});

  const getApiType = (index) => {
    const types = ['organisation', 'sponsor', 'users'];
    return types[index];
  };

  useEffect(() => {
    const type = getApiType(activeStat);
    if (isSearchActive && searchTerm) {
      dispatch(searchData(searchTerm, type, currentPage, itemsPerPage));
    } else {
      dispatch(fetchDataByType(type, currentPage, itemsPerPage));
    }
  }, [
    activeStat,
    currentPage,
    itemsPerPage,
    dispatch,
    isSearchActive,
    searchTerm
  ]);

  const peopleOrganizationData = useSelector(
    (state) => state.dashboard.dashboardData
  );

  const pageCount = useSelector((state) => state.tree.totalCount);
  const peopleOrganizationList = useSelector((state) => state.tree.treesData);

  const formattedPeopleOrganizationList = peopleOrganizationList?.map(
    (peoples) => ({
      ...peoples,
      role: capitalizeFirstLetter(peoples.role),
      updated_on: formatDate(peoples.updated_on),
      created_on: formatDate(peoples.created_on),
      date_joined: formattedDate(peoples.date_joined),
      species: formatList(peoples?.species),
      nft_ordered: peoples?.nft_ordered ?? '-',
      nft_ordered_usd: peoples?.nft_ordered_usd ?? '-',
      countries: formatCountries(peoples?.countries),
      original_countries: peoples?.countries, // Preserve original countries data
      email: peoples?.email ?? '-',
      approved_trees: peoples?.approved_trees ?? '-',
      available_to_mint: peoples?.available_to_mint ?? '-'
    })
  );

  const peopleOrganizationStats = [
    {
      count: peopleOrganizationData?.organization_count,
      label: i18n.organisations,
      bgColor: '#F3E8FF',
      activeBorderColor: '#9B3FFF'
      // isDisabled:
      //   !peopleOrganizationData?.organization_count ||
      //   peopleOrganizationData.organization_count === 0
    },
    {
      count: peopleOrganizationData?.sponsor_count,
      label: i18n.sponsors,
      bgColor: '#FFE9AF',
      activeBorderColor: '#FDB501'
      // isDisabled:
      //   !peopleOrganizationData?.sponsor_count ||
      //   peopleOrganizationData.sponsor_count === 0
    },
    {
      count: peopleOrganizationData?.user_count,
      label: i18n.users,
      bgColor: '#B7F1DB',
      activeBorderColor: '#0ECF85',
      isDisabled:
        !peopleOrganizationData?.user_count ||
        peopleOrganizationData.user_count === 0
    }
  ];

  const headers = {
    Organisations: [
      { label: 'Name', key: 'name', size: 'md' },
      { label: 'Contact Person', key: 'contact_person_full_name', size: 'md' },
      { label: 'Approved Trees', key: 'approved_trees', size: 'md' },
      { label: 'Available To Mint', key: 'available_to_mint', size: 'md' },
      { label: 'Email', key: 'contact_person_email', size: 'md' },
      { label: 'Species', key: 'species', size: 'lg' },
      { label: 'Countries', key: 'countries', size: 'md' },
      { label: 'Created on', key: 'created_on', size: 'md' },
      { label: 'Updated on', key: 'updated_on', size: 'md' },
      { label: 'Action', key: 'actions', size: 'md' }
    ],
    Sponsors: [
      { label: 'Name', key: 'name', size: 'md' },
      { label: 'Type', key: 'type', size: 'md' },
      { label: 'Wallet Address', key: 'wallet_address', size: 'md' },
      {
        label: 'Contact Person Email',
        key: 'contact_person_email',
        size: 'md'
      },
      { label: 'NFT Order', key: 'nft_ordered', size: 'md' },
      { label: 'NFT Order Value USD', key: 'nft_ordered_usd', size: 'md' },
      { label: 'Action', key: 'actions', size: 'md' }
    ],
    Users: [
      { label: 'Username', key: 'username', size: 'md' },
      { label: 'Email', key: 'email', size: 'md' },
      { label: 'Role', key: 'role', size: 'md' },
      { label: 'Country', key: 'country', size: 'md' },
      {
        label: 'Planting Organization',
        key: 'planting_organization',
        size: 'md'
      },
      { label: 'Date Joined', key: 'date_joined', size: 'md' },
      { label: 'Action', key: 'actions', size: 'md' }
    ]
  };

  const handleStatClick = (index) => {
    if (peopleOrganizationStats[index].isDisabled) return;
    setActiveStat(index);
    setCurrentPage(1);

    // Update URL with new activeIndex
    const newUrl = `${window.location.pathname}?stat=${index}`;
    window.history.pushState({}, '', newUrl);
    if (isSearchActive) {
      dispatch(clearSearchData(getApiType(index), 1, itemsPerPage, {}));
    } else {
      dispatch(fetchDataByType(getApiType(index), 1, itemsPerPage, '', {}));
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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

  const handleApplyFilter = (filter) => {
    setFilterData(filter);
    dispatch(
      fetchDataByType(
        peopleOrganizationStats[activeStat].label,
        1,
        10,
        searchTerm,
        filter
      )
    );
  };

  const handleClearFilter = () => {
    setFilterData({});
  };

  return (
    <React.Fragment>
      <Head title={i18n.peopleOrganisation}></Head>
      <Content>
        {showSponsorDetails ? (
          <SponsorDetails
            sponsorDatas={selectedSponsor}
            onBack={() => setShowSponsorDetails(false)}
            isLoading={isLoadingSponsorDetails}
          />
        ) : (
          <>
            <BlockHead size='sm'>
              <BlockBetween>
                <BlockHeadContent>
                  <BlockTitle
                    page
                    tag='h1'
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
                  <StatisticsCards
                    stats={peopleOrganizationStats}
                    onCardClick={handleStatClick}
                    isPeopleAndOrganization={true}
                    activeCard={activeStat}
                  />
                  <hr
                    className='my-4'
                    style={{
                      borderWidth: '2px'
                    }}
                  />
                  <Card className='card-bordered'>
                    <TransactionTable
                      headers={
                        headers[peopleOrganizationStats[activeStat].label]
                      }
                      data={formattedPeopleOrganizationList}
                      title={peopleOrganizationStats[activeStat].label}
                      activeTab={peopleOrganizationStats[activeStat].label}
                      onSearch={handleSearch}
                      onClearSearch={handleClearSearch}
                      searchTerm={searchTerm}
                      isSearchActive={isSearchActive}
                      onSponsorDetailsClick={handleSponsorDetailsClick}
                      onApplyFilter={handleApplyFilter}
                      onClearFilter={handleClearFilter}
                      filterData={filterData}
                      currentFilterData={filterData}
                    />
                  </Card>
                </Col>
              </Row>
            </Block>
            <Block className='d-flex justify-content-end'>
              {' '}
              <PaginationPage
                currentPage={currentPage}
                totalCount={pageCount}
                perPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </Block>
          </>
        )}
      </Content>
    </React.Fragment>
  );
};
export default PeopleOrganization;
