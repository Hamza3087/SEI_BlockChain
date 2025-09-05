import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Icon from '../../../icon/Icon';
import {
  Badge,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
  Input
} from 'reactstrap';
import {
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow
} from '../../../table/DataTable';
import AddSpeciesModal from '../../../AddSpeciesModal';
import AssignSpeciesModal from '../../../AssignSpeciesModal';
import AddOrganizationModal from '../../../AddOrganizationModal';
import SideBarDetails from '../../../SidebarDetails';
import AddSponsorModal from '../../../AddSponsorModal';
import AssignNftModal from '../../../AssignNftModal';
import AddUserModal from '../../../AddUserModal';
import ApproveRejectModal from '../../../ApproveRejectModal';
import filter from '../../../../images/icons/filter.svg';
import search from '../../../../images/icons/search.svg';
import TreeReviewCard from '../../../TreeReviewList';
import FilterModal from '../../../Filter';
import {
  formattedDate,
  refreshThePage,
  hasActiveFilters
} from '../../../../utils/helperFunction';
import { fetchOrganizationDetails } from '../../../../redux/actions/fetchOrgAction';
import { deleteSpecies } from '../../../../redux/actions/deleteSpeciesAction';
import { mintNft } from '../../../../redux/actions/mintNftAction';
// import { fetchDataByType } from '../../../../redux/actions/treeActions';
import ImagePreviewModal from '../../../ImagePreviewModal';
import { showToast } from '../../../../components/ToastNotification';
import { DASHBOARD, LISTING } from '../../../../apiConstants/constant';
import i18n from '../../../../locales/en.json';
import SignupLinkModal from '../../../SignupLinkModal';
import { generateSignupLink } from '../../../../redux/actions/signupLinkAction';
import { generateUserResetLink } from '../../../../redux/actions/userResetLinkAction';
import api from '../../../../apiConstants/axiosConfig';
import { fetchDataByType } from '../../../../redux/actions/treeActions';

const TransactionTable = ({
  headers,
  data,
  title,
  activeTab,
  onSearch,
  onClearSearch,
  onSponsorDetailsClick,
  formattedMintedData,
  searchValue,
  onApplyFilter,
  onClearFilter,
  onImageClick,
  filterData,
  isFilterModalOpen,
  toggleFilterModal,
  currentFilterData
}) => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isAssignSpeciesModal, setAssignSpeciesModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchValue || '');
  const [isAssignNftModal, setAssignNftModal] = useState(false);
  const [isFilterModalOpenLocal, setIsFilterModalOpenLocal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrgForModal, setSelectedOrgForModal] = useState(null);
  const [assignSpeciesModalContext, setAssignSpeciesModalContext] =
    useState('header'); // 'header' or 'option'
  // Add new state for checkboxes for To Mint tab
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);

  // Add state for ApproveRejectModal
  const [isApproveRejectModalOpen, setIsApproveRejectModalOpen] =
    useState(false);
  const [selectedTree, setSelectedTree] = useState(null);
  const [approveRejectModalAction, setApproveRejectModalAction] = useState(''); // 'edit-approval' or 'edit-rejection'

  // Add new state for image preview
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  //States for signup/reset links
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkModalType, setLinkModalType] = useState(''); // "signup" or "reset"
  const [linkData, setLinkData] = useState(null);

  // Sync local search term with prop when it changes (e.g., when cleared from parent)
  useEffect(() => {
    setSearchTerm(searchValue ?? '');
  }, [searchValue]);

  // Reset selected rows when changing tabs
  useEffect(() => {
    setSelectedRows({});
    setSelectAll(false);
  }, [activeTab]);

  // Clear local search state when activeTab changes (unless it's "NFTHistory")
  useEffect(() => {
    if (activeTab !== 'NFT History') {
      setSearchTerm('');
    }
  }, [activeTab]);

  // Add this function to handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Remove the automatic clear - let parent component handle it
  };

  // Add this function to handle search submission
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Call the search action from props with current search term
      onSearch(searchTerm);
    }
  };

  // Add this function to clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    onClearSearch();
  };

  // Update the functions that open the modal:
  const handleHeaderAssignSpecies = () => {
    setAssignSpeciesModalContext('header');
    toggleAssignSpeciesModal();
  };

  const handleOptionAssignSpecies = (item) => {
    setAssignSpeciesModalContext('option');
    toggleAssignSpeciesModal();
    setSelectedOrgForModal(item); // Store the selected org
  };

  // Handle opening the approve/reject modal for editing approvals
  const handleEditApproval = (item) => {
    setSelectedTree(item);
    setApproveRejectModalAction('edit-approval');
    toggleApproveRejectModal();
  };

  // Handle opening the approve/reject modal for editing rejections
  const handleEditRejection = (item) => {
    setSelectedTree(item);
    setApproveRejectModalAction('edit-rejection');
    toggleApproveRejectModal();
  };

  // Handle checkbox for a single row
  const handleRowCheckboxChange = (treeId) => {
    const newSelectedRows = { ...selectedRows };
    newSelectedRows[treeId] = !selectedRows[treeId];

    setSelectedRows(newSelectedRows);

    // Check if all are selected
    const allSelected = data.every((item) => newSelectedRows[item.tree_id]);
    setSelectAll(allSelected);
  };

  // Handle "select all" checkbox
  const handleSelectAllCheckboxChange = () => {
    const newSelectAll = !selectAll;
    const newSelectedRows = {};

    if (newSelectAll) {
      // Select all rows
      data.forEach((item) => {
        newSelectedRows[item.tree_id] = true;
      });
    }
    // If unchecked, leave empty object to deselect all

    setSelectAll(newSelectAll);
    setSelectedRows(newSelectedRows);
  };

  // Get count of selected trees
  const getSelectedCount = () => {
    return Object.values(selectedRows).filter((selected) => selected).length;
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleFilterModalLocal = () => setIsFilterModalOpenLocal(!isFilterModalOpenLocal);
  
  // Use external filter modal state if provided (for homepage), otherwise use local state
  const isFilterModalOpenState = toggleFilterModal ? isFilterModalOpen : isFilterModalOpenLocal;
  const toggleFilterModalFn = toggleFilterModal || toggleFilterModalLocal;
  const toggleAssignSpeciesModal = () =>
    setAssignSpeciesModal(!isAssignSpeciesModal);
  const toggleAssignNftModal = () => setAssignNftModal(!isAssignNftModal);
  const toggleApproveRejectModal = () =>
    setIsApproveRejectModalOpen(!isApproveRejectModalOpen);
  const toggleSidebar = (org = null) => {
    setIsSidebarOpen(!isSidebarOpen);
    if (org) {
      setSelectedOrg(org);
    }
  };
  // Check if the activeTab is in pending state
  const isPendingState = activeTab === 'Pending';
  // Check if the activeTab is To Mint
  const isToMintTab = activeTab === 'To Mint';

  // Format data for TreeReviewCards if in pending state
  const formatDataForReviewCards = () => {
    return data.map((item) => ({
      id: item?.tree_id,
      imageUrl: item?.image_url,
      planter: item?.planted_by,
      species: item?.species_name,
      organization: item?.organisation_name,
      location: item?.location,
      uid: '#' + item?.tree_id,
      dateTime: formattedDate(item?.planted_on),
      userId: item?.user_id
    }));
  };

  const renderMintedState = (state) => {
    const stateColors = {
      minted: '#00C925',
      'to be minted': '#3148F7',
      failed: '#EE0000',
      pending: '#FDB501'
    };

    // Normalize the state input
    const normalizedState = state?.trim()?.toLowerCase();

    // Find matching color (case-insensitive)
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

  const handleDeleteSpecies = (item) => {
    {
      try {
        dispatch(deleteSpecies(item.species_id)).catch((error) => {
          console.error('Error deleting species:', error);
        });
        refreshThePage();
      } catch (error) {
        console.error('Error in delete operation:', error);
      }
    }
  };

  const handleOrganizationDetails = async (item) => {
    try {
      setIsLoading(true);
      // Fetch organization details by ID
      const response = await dispatch(fetchOrganizationDetails(item.id));
      // Combine the basic item data with the fetched details
      const orgData = {
        ...item,
        details: response.payload
      };
      // Open sidebar with combined data
      setSelectedOrg(orgData);
      setIsSidebarOpen(true);
      // Open sidebar with fetched data
      toggleSidebar(response);
    } catch (error) {
      console.error('Error fetching organization details:', error);
      // Show error notification if needed
    } finally {
      setIsLoading(false);
    }
  };

  const handleSponsorDetails = (item) => {
    if (activeTab === 'Sponsors' && onSponsorDetailsClick) {
      onSponsorDetailsClick(item);
    }
  };

  const handleAssignTree = (item) => {
    setAssignNftModal({
      add: true,
      sponsorData: item,
      sponsorName: item.name
    });
  };

  const handleGenerateReport = async () => {
    try {
      setIsDownloading(true);
      // Make API request to get the report
      const response = await fetch(`${DASHBOARD.GENERATE_REPORT}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(
          `Failed to download report: ${response.status} ${response.statusText}`
        );
      }
      // Get the filename from the Content-Disposition header, or use a default name
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'tree_report.csv';

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

      // Convert response to blob
      const blob = await response.blob();
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
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
      showToast.error('Failed to download report. Please try again later.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerateTreeReport = async () => {
    try {
      setIsDownloading(true);
      
      // Build the endpoint with current search and filter parameters
      let endpoint = `${LISTING.TREES_LISTING}?report=1`;
      
      // Add search parameter if exists
      if (searchTerm && searchTerm.trim() !== '') {
        endpoint += `&organisation_name=${encodeURIComponent(searchTerm)}`;
      }
      
      // Add filter parameters if they exist
      if (filterData && Object.keys(filterData).length > 0) {
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
          endpoint += `&${apiKey}=${encodeURIComponent(filterValue)}`;
        });
      }
      
      // Make API request to get the tree report with current filters and search
      const response = await api.get(endpoint, {
        responseType: 'blob' // Important for file downloads
      });

      // Get the filename from the Content-Disposition header, or use a default name
      const contentDisposition = response.headers?.['content-disposition'];
      let filename = 'tree_report.csv';

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
      showToast.success('Tree report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading tree report:', error);
      // Check if error is a Blob (API error response)
      if (error instanceof Blob) {
        try {
          // Handle Blob error - convert to text and parse as JSON
          const errorText = await error.text();
          const errorData = JSON.parse(errorText);
          showToast.error(errorData?.message || 'Failed to download tree report. Please try again later.');
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          // If parsing fails, show default error message
          showToast.error('Failed to download tree report. Please try again later.');
        }
      } else {
        // Fallback error message
        showToast.error('Failed to download tree report. Please try again later.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEditSponsor = (item) => {
    setIsModalOpen({
      edit: true,
      sponsorData: item
    });
  };

  const handleEditOrganization = (item) => {
    setIsModalOpen({
      edit: true,
      organizationData: item
    });
  };

  // Function to handle bulk minting of selected NFTs
  const handleBulkMint = () => {
    const selectedIds = Object.keys(selectedRows).filter(
      (id) => selectedRows[id]
    );
    const numericIds = selectedIds?.map((id) => parseInt(id));
    dispatch(mintNft(numericIds))
      .then((response) => {
        // Reset selection after successful minting
        setSelectedRows({});
        setSelectAll(false);
        // Replace reload with navigation to current URL with activeIndex
        refreshThePage();
      })
      .catch((error) => {
        console.error('Error minting trees:', error);
      });
  };

  const handleImageClick = (imageUrl) => {
    setPreviewImageUrl(imageUrl);
    setImagePreviewModal(true);
  };

  // Add toggle function for image preview modal
  const toggleImagePreview = () => {
    setImagePreviewModal(!imagePreviewModal);
    if (!imagePreviewModal) {
      setPreviewImageUrl('');
    }
  };

  // Toggle function for signup link modal
  const toggleLinkModal = () => setIsLinkModalOpen(!isLinkModalOpen);

  // Handle generate signup link using the redux action
  const handleGenerateSignupLink = async (item) => {
    const response = await dispatch(generateSignupLink(item?.id));
    setLinkData(response);
    setLinkModalType('signup');
    toggleLinkModal();
  };

  // Update handleResetLink
  const handleResetLink = async (item) => {
    const response = await dispatch(generateUserResetLink(item?.user_id));
    setLinkData(response);
    setLinkModalType('reset');
    toggleLinkModal();
  };

  const DropdownTrans = ({ item }) => {
    // Different dropdown items based on activeTab
    const renderDropdownItems = () => {
      switch (activeTab) {
        case 'Species':
          return (
            <ul className='link-list-plain'>
              <li>
                <DropdownItem
                  tag='a'
                  href='#delete'
                  onClick={(ev) => {
                    ev.preventDefault();
                    handleDeleteSpecies(item);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'unset',
                    gap: '2px',
                    color: '#556482'
                  }}
                  className='delete-species-item'
                >
                  <Icon
                    name='trash'
                    style={{
                      fontSize: '18px'
                    }}
                  />
                  {i18n.deleteSpecies}
                </DropdownItem>
              </li>
            </ul>
          );
        case 'Approved':
          return (
            <ul className='link-list-plain'>
              <li>
                <DropdownItem
                  tag='a'
                  href='#edit-approval'
                  onClick={(ev) => {
                    ev.preventDefault();
                    handleEditApproval(item);
                  }}
                >
                  {i18n.editApproval}
                </DropdownItem>
              </li>
            </ul>
          );
        case 'Rejected':
          return (
            <ul className='link-list-plain'>
              <li>
                <DropdownItem
                  tag='a'
                  href='#edit-rejection'
                  onClick={(ev) => {
                    ev.preventDefault();
                    handleEditRejection(item);
                  }}
                >
                  {i18n.editRejection}{' '}
                </DropdownItem>
              </li>
            </ul>
          );
        case 'Users':
          return (
            <ul className='link-list-plain'>
              <li>
                <DropdownItem
                  tag='a'
                  href='#reset-link'
                  onClick={(ev) => {
                    ev.preventDefault();
                    handleResetLink(item);
                  }}
                >
                  {i18n.passwordResetLink}
                </DropdownItem>
              </li>
            </ul>
          );

        case 'Organisations':
          return (
            <ul className='link-list-plain'>
              <li>
                <DropdownItem
                  tag='a'
                  href='#assign'
                  onClick={(ev) => {
                    ev.preventDefault();
                    handleOptionAssignSpecies(item);
                  }}
                >
                  {i18n.assignSpecies}
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  tag='a'
                  href='#details'
                  onClick={(ev) => {
                    ev.preventDefault();
                    // Call the handleOrganizationDetails function with the current item
                    handleOrganizationDetails(item);
                  }}
                >
                  {i18n.organizationDetails}
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  tag='a'
                  href='#signup-link'
                  onClick={(ev) => {
                    ev.preventDefault();
                    handleGenerateSignupLink(item);
                  }}
                >
                  {i18n.generateLink}
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  tag='a'
                  href='#edit'
                  onClick={(ev) => {
                    ev.preventDefault();
                    handleEditOrganization(item);
                  }}
                >
                  {i18n.edit}
                </DropdownItem>
              </li>
            </ul>
          );

        case 'Sponsors':
          return (
            <ul className='link-list-plain'>
              <li>
                <DropdownItem
                  tag='a'
                  href='#details'
                  onClick={(ev) => {
                    ev.preventDefault();
                    handleSponsorDetails(item);
                  }}
                >
                  {i18n.sponsorDetails}
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  tag='a'
                  href='#assign'
                  onClick={(ev) => {
                    ev.preventDefault();
                    handleAssignTree(item);
                  }}
                  // onClick={() => setAssignNftModal({ add: true })}
                >
                  {i18n.assignNft}
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  tag='a'
                  href='#edit'
                  onClick={(ev) => {
                    ev.preventDefault();
                    handleEditSponsor(item);
                  }}
                >
                  {i18n.edit}
                </DropdownItem>
              </li>
            </ul>
          );

        // default:
        //   // Default dropdown items for other tabs
        //   return (
        //     <ul className='link-list-plain'>
        //       <li>
        //         <DropdownItem
        //           tag='a'
        //           href='#view'
        //           onClick={(ev) => ev.preventDefault()}
        //         >
        //           View Details
        //         </DropdownItem>
        //       </li>
        //     </ul>
        //   );
      }
    };

    return (
      <UncontrolledDropdown>
        <DropdownToggle
          tag='a'
          className='text-soft dropdown-toggle btn btn-icon btn-trigger'
        >
          <Icon
            name='more-h'
            style={{ color: '#000000' }}
          ></Icon>
        </DropdownToggle>
        <DropdownMenu
          end
          style={{
            borderRadius: '11px'
          }}
        >
          {renderDropdownItems()}
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  };

  const renderActionButtons = () => {
    const commonButtons = (
      <div
        className='d-flex align-items-center gap-2'
        style={{ position: 'relative' }}
      >
        {/* Hide filter button on homepage since it's shown in header */}
        {window.location.pathname !== '/' && (
          <div style={{ position: 'relative' }}>
            <Button
              style={{
                borderRadius: '8px',
                backgroundColor: '#FAFAFA',
                borderColor: '#E7E7E7',
                padding: '0.3rem 0.9rem'
              }}
              onClick={toggleFilterModalFn}
              data-filter-button="homepage"
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
        )}
        {/* Only show divider if filter button is visible */}
        {window.location.pathname !== '/' && (
          <div
            style={{
              borderLeft: '1px solid #EDEDED',
              height: '30.5px',
              margin: '0 8px'
            }}
          ></div>
        )}
        <div className='form-control-wrap'>
          <div className='form-icon form-icon-right'>
            {searchTerm ? (
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
            placeholder={
              activeTab === 'Species' 
                ? 'Search by Species Name'
                : activeTab === 'Sponsors'
                ? 'Search by Sponsor Name'
                : activeTab === 'Users'
                ? 'Search by User Name'
                : 'Search by Organisation'
            }
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleSearchSubmit}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>
      </div>
    );

    const newActions = ['Species', 'Organisations', 'Sponsors', 'Users'];
    const renderAddActionButton = (
      <>
        {' '}
        <div
          style={{
            borderLeft: '1px solid #EDEDED',
            height: '30.5px',
            margin: '0 8px'
          }}
        ></div>
        <Button
          style={{ borderRadius: '50%', backgroundColor: '#0D5A42' }}
          color='btn btn-icon btn-rg'
          className='btn-icon'
          onClick={() => setIsModalOpen({ add: true })}
        >
          <Icon
            name='plus'
            style={{ color: 'white' }}
          ></Icon>
        </Button>
      </>
    );

    switch (activeTab) {
      case 'Trees':
        return (
          <>
            {commonButtons}
            <div
              style={{
                borderLeft: '1px solid #EDEDED',
                height: '30.5px',
                margin: '0 8px'
              }}
            ></div>
            <Button
              className='fw-medium btn'
              style={{
                borderRadius: '8px',
                backgroundColor: '#0D5A42',
                whiteSpace: 'nowrap',
                fontSize: '14px'
              }}
              onClick={handleGenerateTreeReport}
              disabled={isDownloading}
            >
              {isDownloading ? 'Downloading...' : i18n.generateTreeReport}
            </Button>
          </>
        );
      case 'To Mint':
        return (
          <>
            <Button
              style={{
                borderRadius: '8px',
                background: 'rgba(255, 195, 0, 0.16)',
                border: 'none',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '8px'
              }}
              className='badge-md'
            >
              <span
                className='fw-medium'
                style={{ color: '#B47200', opacity: '100%', fontSize: '12px' }}
              >
                {formattedMintedData?.mintedInfo}
              </span>
              {formattedMintedData?.lastMintedAt && (
                <>
                  {' '}
                  <div
                    style={{
                      color: '#000000',
                      opacity: '8%',
                      fontSize: '12px'
                    }}
                  >
                    {' '}
                    |{' '}
                  </div>
                  <span
                    className='fw-medium'
                    style={{
                      color: '#B47200',
                      opacity: '100%',
                      fontSize: '12px'
                    }}
                  >
                    {formattedMintedData?.lastMintedAt}
                  </span>
                </>
              )}
            </Button>
            {commonButtons}
            <div
              style={{
                borderLeft: '1px solid #EDEDED',
                height: '30.5px',
                margin: '0 8px'
              }}
            ></div>
            <Button
              className='fw-medium btn'
              style={{
                borderRadius: '8px',
                backgroundColor: '#0D5A42',
                whiteSpace: 'nowrap',
                fontSize: '14px',
                cursor: getSelectedCount() === 0 ? 'default' : 'pointer',
                opacity: getSelectedCount() === 0 ? 0.7 : 1
              }}
              onClick={handleBulkMint}
              disabled={getSelectedCount() === 0}
            >
              {i18n.mintNft}
            </Button>
          </>
        );
      case 'Organisations':
        return (
          <>
            {' '}
            {commonButtons}
            <div
              style={{
                borderLeft: '1px solid #EDEDED',
                height: '30.5px',
                margin: '0 8px'
              }}
            ></div>
            <span
              onClick={handleHeaderAssignSpecies}
              className='ms-auto'
              style={{ color: '#0D5A42', cursor: 'pointer' }}
            >
              {i18n.assignSpecies}
            </span>
            {renderAddActionButton}
          </>
        );
      case 'Sponsors':
        return (
          <>
            {' '}
            {commonButtons}
            <div
              style={{
                borderLeft: '1px solid #EDEDED',
                height: '30.5px',
                margin: '0 8px'
              }}
            ></div>
            <span
              onClick={() => setAssignNftModal({ add: true })}
              className='ms-auto'
              style={{ color: '#0D5A42', cursor: 'pointer' }}
            >
              {i18n.assignNft}
            </span>
            {renderAddActionButton}
          </>
        );
      default:
        return (
          <>
            {commonButtons}
            {activeTab !== 'Users' && newActions.includes(activeTab) && (
              <>{renderAddActionButton}</>
            )}
          </>
        );
    }
  };

  // Function to render no data found message
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

  // Check if data is empty or undefined
  const hasNoData = !data || data.length === 0;

  // New function for handling filter application
  const handleApplyFilter = (filterData) => {
    onApplyFilter(filterData);
    // dispatch(fetchDataByType(activeTab, 1, 10, '', filterData));
  };

  const handleClearFilter = (filterData) => {
    onClearFilter(filterData);
  };

  return (
    <React.Fragment>
      <div className='card-inner border-header'>
        <div className='card-title-group'>
          <h6 className='title'>
            <span
              className='me-2 fw-medium black-text'
              style={{ fontSize: '20px' }}
            >
              {title}
            </span>
          </h6>
          <div className='d-flex align-center gap-2'>
            {renderActionButtons()}
          </div>
        </div>
      </div>

      {/* Show the no data found message when there's no data */}
      {hasNoData ? (
        renderNoDataFound()
      ) : isPendingState ? (
        // Display TreeReviewCards when in Pending state with data
        <div
          className='nk-block'
          style={{ backgroundColor: 'transparent' }}
        >
          {formatDataForReviewCards().map((item) => (
            <div
              key={item.id}
              style={{
                padding: '0.5rem',
                borderBottom: '1px solid #E6E6E6',
                paddingBottom: '1.5rem !important',
                margin: '0 0 1.3rem 0'
              }}
            >
              <TreeReviewCard plantingData={item} />
            </div>
          ))}
        </div>
      ) : (
        // Otherwise display regular table
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
                {/* Render checkbox for header in To Mint tab */}
                {isToMintTab && header.key === 'checkbox' ? (
                  <div className='custom-control custom-control-sm custom-checkbox'>
                    <input
                      type='checkbox'
                      className='custom-control-input'
                      checked={selectAll}
                      onChange={handleSelectAllCheckboxChange}
                      id='selectAllCheckbox'
                    />
                    <label
                      className='custom-control-label'
                      htmlFor='selectAllCheckbox'
                    ></label>
                  </div>
                ) : (
                  <span
                    className='fw-base header-text'
                    style={{ fontSize: '14px' }}
                  >
                    {header.label}
                  </span>
                )}
              </DataTableRow>
            ))}
          </DataTableHead>
          {data.map((item, idx) => (
            <DataTableItem key={idx}>
              {headers?.map((header, index) => (
                <DataTableRow
                  key={index}
                  size={header.size || 'md'}
                >
                  {header.key === 'actions' ? (
                    <DropdownTrans item={item} />
                  ) : header.key === 'checkbox' && isToMintTab ? (
                    <div className='custom-control custom-control-sm custom-checkbox'>
                      <input
                        type='checkbox'
                        className='custom-control-input'
                        checked={selectedRows[item.tree_id] || false}
                        onChange={() => handleRowCheckboxChange(item.tree_id)}
                        id={`checkbox-${item.tree_id}`}
                      />
                      <label
                        className='custom-control-label'
                        htmlFor={`checkbox-${item.tree_id}`}
                      ></label>
                    </div>
                  ) : (header.key === 'image_url' &&
                      (activeTab === 'Rejected' || activeTab === 'Approved')) ||
                    header.key === 'image' ? (
                    <div>
                      <img
                        className='custom-user-avatar'
                        src={item[header.key] || item.image_url || item.image}
                        style={{ cursor: 'pointer' }}
                        onClick={() =>
                          handleImageClick(
                            item[header.key] || item.image_url || item.image
                          )
                        }
                        alt='Tree'
                      />
                    </div>
                  ) : header.key === 'mintedState' ? (
                    <div className='tb-lead fw-normal value-text'>
                      {renderMintedState(item[header.key])}
                    </div>
                  ) : (
                    <span
                      className={`tb-lead ${
                        [
                          'planting_cost',
                          'nft_ordered',
                          'nft_ordered_usd'
                        ].includes(header.key)
                          ? 'fw-semibold'
                          : 'fw-normal'
                      } value-text`}
                    >
                      {item[header.key]}
                    </span>
                  )}
                </DataTableRow>
              ))}
            </DataTableItem>
          ))}
        </DataTableBody>
      )}
      {activeTab === 'Species' && (
        <>
          {' '}
          <AddSpeciesModal
            isOpen={isModalOpen}
            toggle={toggleModal}
            header={i18n.addSpecies}
          />
        </>
      )}
      {activeTab === 'Organisations' && (
        <>
          {' '}
          <AddOrganizationModal
            isOpen={isModalOpen}
            toggle={toggleModal}
            header={isModalOpen?.edit ? i18n.editOrganisation : i18n.addOrganisation}
            organizationData={isModalOpen?.organizationData || null}
          />
          <AssignSpeciesModal
            isOpen={isAssignSpeciesModal}
            toggle={toggleAssignSpeciesModal}
            header={i18n.assignSpecies}
            showOrganizationField={assignSpeciesModalContext === 'header'}
            organizationId={
              assignSpeciesModalContext === 'option'
                ? selectedOrgForModal?.id
                : null
            }
          />
          <SideBarDetails
            showDetailModal={isSidebarOpen}
            toggleDetailModal={toggleSidebar}
            selectedOrg={selectedOrg}
            isLoading={isLoading}
            item={selectedOrg}
            isAssignSpeciesModal={isAssignSpeciesModal}
            toggleAssignSpeciesModal={toggleAssignSpeciesModal}
            assignSpeciesModalContext={assignSpeciesModalContext}
            setAssignSpeciesModalContext={setAssignSpeciesModalContext}
          />
        </>
      )}
      {activeTab === 'Users' && (
        <AddUserModal
          isOpen={isModalOpen}
          toggle={toggleModal}
          header={i18n.addUser}
        />
      )}
      {activeTab === 'Sponsors' && (
        <>
          {' '}
          <AddSponsorModal
            isOpen={isModalOpen}
            toggle={toggleModal}
            header={i18n.addSponsor}
          />
          <AssignNftModal
            isOpen={isAssignNftModal}
            toggle={toggleAssignNftModal}
            header={i18n.assignNft}
            sponsorData={isAssignNftModal?.sponsorData}
            sponsorName={isAssignNftModal?.sponsorName}
          />
        </>
      )}
      {/* Render ApproveRejectModal for both Edit Approval and Edit Rejection actions */}
      {(activeTab === 'Approved' || activeTab === 'Rejected') && (
        <ApproveRejectModal
          isOpen={isApproveRejectModalOpen}
          toggle={toggleApproveRejectModal}
          header={
            approveRejectModalAction === 'edit-approval'
              ? i18n.editApproval
              : i18n.editRejection
          }
          plantingData={selectedTree}
          approveAction={approveRejectModalAction}
        />
      )}
      <FilterModal
        isOpen={isFilterModalOpenState}
        toggle={toggleFilterModalFn}
        header='Filter By:'
        activeTab={activeTab}
        onApplyFilter={handleApplyFilter}
        onClearFilter={handleClearFilter}
        currentFilterData={currentFilterData}
      />
      <ImagePreviewModal
        isOpen={imagePreviewModal}
        toggle={toggleImagePreview}
        imageUrl={previewImageUrl}
      />
      <SignupLinkModal
        isOpen={isLinkModalOpen}
        toggle={toggleLinkModal}
        header={
          linkModalType === 'signup' ? i18n.signUpLink : i18n.passwordResetLink
        }
        linkData={linkData}
      />
    </React.Fragment>
  );
};

export default TransactionTable;
