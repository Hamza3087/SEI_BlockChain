import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Content from '../layout/content/Content';
import TransactionTable from '../components/partials/default/transaction/Transaction';
import { Card } from 'reactstrap';
import { Block, Row, Col } from '../components/Component';
import SponsorCard from '../components/SponsorCard';
import PaginationPage from './components/Pagination';
import { formatDate } from '../utils/helperFunction';
import { fetchSponsorDetails } from '../redux/actions/fetchSponsorAction';
import ImagePreviewModal from '../components/ImagePreviewModal';

const SponsorDetails = ({ sponsorDatas, onBack, isLoading }) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [content, setContent] = useState({ data: [], count: 0 });
  const [filterData, setFilterData] = useState({});

  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  // Toggle function for image preview modal
  const toggleImagePreview = () => {
    setImagePreviewModal(!imagePreviewModal);
  };

  // Function to handle image click
  const handleImageClick = (imageUrl) => {
    setPreviewImageUrl(imageUrl);
    toggleImagePreview();
  };

  const handleApplyFilter = (filter) => {
    setFilterData(filter);
    dispatch(
      fetchSponsorDetails(
        sponsorDatas?.sponsor,
        currentPage,
        10,
        searchTerm,
        filter
      )
    ).then((result) => {
      setContent({ data: result?.data, count: result?.count });
    });
  };

  const handleClearFilter = () => {
    setFilterData({});
  };

  useEffect(() => {
    if (sponsorDatas?.sponsor) {
      if (isSearchActive && searchTerm) {
        dispatch(
          fetchSponsorDetails(
            sponsorDatas?.sponsor,
            currentPage,
            10,
            searchTerm,
            filterData
          )
        ).then((result) => {
          setContent({ data: result?.data, count: result?.count });
        });
      } else {
        dispatch(
          fetchSponsorDetails(
            sponsorDatas?.sponsor,
            currentPage,
            10,
            searchTerm,
            filterData
          )
        ).then((result) => {
          setContent({ data: result?.data, count: result?.count });
        });
      }
    }
  }, [dispatch, sponsorDatas?.sponsor, currentPage, searchTerm]);

  // Always derive from state, not from local variables
  const nftData = content?.data || [];
  const pageCount = content?.count;

  // Calculate the range of NFTs currently being viewed
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + nftData?.length - 1, pageCount);
  const viewingText = `Viewing ${startIndex}-${endIndex}/${pageCount} NFTs`;

  const formattedNftData = nftData?.map((nft) => ({
    ...nft,
    capture_date: formatDate(nft?.capture_date),
    botanical_name: nft?.botanical_name || '-',
    comman_name: nft?.comman_name || '-',
    iucn_status: nft?.iucn_status || '-',
    country: nft?.country || '-',
    location: nft?.location || '-',
    nft_collection: nft?.nft_collection || '-',
    nft_id: nft?.nft_id || '-',
    organization: nft?.organization || '-',
    planted_by: nft?.planted_by || '-',
    planting_cost: nft?.planting_cost || '-',
    image: nft?.image || 'Tree Image',
    imageClickHandler: () => handleImageClick(nft?.image)
  }));

  const headers = {
    NFT: [
      {
        label: 'Image',
        key: 'image',
        size: 'md',
        isImage: true
      },
      { label: 'Botanical Name', key: 'botanical_name', size: 'xl' },
      { label: 'Common Name', key: 'comman_name', size: 'xl' },
      { label: 'IUCN status', key: 'iucn_status', size: 'md' },
      { label: 'Country', key: 'country', size: 'lg' },
      { label: 'Location', key: 'location', size: 'md' },
      { label: 'Capture Date', key: 'capture_date', size: 'xl' },
      { label: 'NFT Collection', key: 'nft_collection', size: 'lg' },
      { label: 'NFT ID', key: 'nft_id', size: 'xl' },
      { label: 'Organization', key: 'organization', size: 'xl' },
      { label: 'Planted By', key: 'planted_by', size: 'xl' },
      { label: 'Planted Cost', key: 'planting_cost', size: 'xl' }
    ]
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // You can add API call here if you want pagination for sponsor NFTs
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setIsSearchActive(true);
    setCurrentPage(1);
    // Implement search functionality if needed
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsSearchActive(false);
  };

  return (
    <React.Fragment>
      <Content>
        <SponsorCard
          sponsorData={sponsorDatas} // changed from sponsorDatas to sponsorData
          onBack={onBack}
          isLoading={isLoading}
        />
        {!isLoading && sponsorDatas && (
          <>
            <Block>
              <Row className='g-gs'>
                <Col size='12'>
                  <Card className='card-bordered mt-3'>
                    <TransactionTable
                      headers={headers.NFT}
                      data={formattedNftData}
                      title={`NFT`}
                      activeTab='NFT' // This tabName represents the NFT Listing in Sponsor details page
                      onSearch={handleSearch}
                      onClearSearch={handleClearSearch}
                      searchTerm={searchTerm}
                      isSearchActive={isSearchActive}
                      onApplyFilter={handleApplyFilter}
                      onClearFilter={handleClearFilter}
                      onImageClick={handleImageClick} // Pass the image click handler
                      filterData={filterData}
                      currentFilterData={filterData}
                    />
                  </Card>
                </Col>
              </Row>
            </Block>
            {/* Pagination with Viewing Text */}
            <Block className='d-flex justify-content-between align-items-center'>
              <div
                className='fw-medium'
                style={{
                  color: '#737373'
                }}
              >
                {pageCount > 0 && viewingText}
              </div>
              <PaginationPage
                currentPage={currentPage}
                totalCount={pageCount}
                perPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </Block>
          </>
        )}
        <ImagePreviewModal
          isOpen={imagePreviewModal}
          toggle={toggleImagePreview}
          imageUrl={previewImageUrl}
        />
      </Content>
    </React.Fragment>
  );
};

export default SponsorDetails;
