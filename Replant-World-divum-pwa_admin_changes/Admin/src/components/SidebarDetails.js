import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Modal,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import Icon from '../../src/components/icon/Icon';
import { deleteOrgSpecies } from '../redux/actions/deleteOrgSpeciesAction';
import closeIcon from '../images/icons/close.svg';
import contactPerson from '../images/icons/user.svg';
import email from '../images/icons/mail.svg';
import globe from '../images/icons/globe.svg';
import calendar from '../images/icons/calendar.svg';
import tree from '../images/icons/tree-black.svg';
// import menu from '../images/icons/menu-icon.svg';
import menuBlack from '../images/icons/menu-icon-black.svg';
import {
  formatDateWithoutComma,
  formatCountries
} from '../utils/helperFunction';
import AssignSpeciesModal from './AssignSpeciesModal';
import i18n from '../locales/en.json';

const SpeciesCard = ({ item, orgId }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

  const handleDeleteSpecies = () => {
    dispatch(deleteOrgSpecies(item?.species_id, orgId));
  };

  return (
    <div
      style={{
        marginBottom: '1rem',
        border: '1px solid #D2D7E1',
        borderRadius: '12px'
      }}
    >
      <div
        style={{
          padding: '0.8rem',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <div
            style={{
              marginBottom: '0.3rem'
            }}
          >
            <span
              className='fw-bold'
              style={{ color: '#000000' }}
            >
              {item.species_name}{' '}
            </span>
            <span
              className='fw-normal'
              style={{ color: '#000000' }}
            >
              ({item.botanical_name})
            </span>
          </div>
          {/* Native Row */}
          <div
            style={{
              marginBottom: '0.3rem'
            }}
          >
            <span style={{ fontSize: '14px', color: '#000000' }}>
              Native :{' '}
            </span>
            <span style={{ color: '#7D7D7D', fontSize: '14px' }}>
              {item.is_native ? 'Yes' : 'No'}
            </span>
          </div>

          {/* Country Row */}
          {/* <div
            style={{
              marginBottom: '0.3rem'
            }}
          >
            <span style={{ fontSize: '14px', color: '#000000' }}>
              Country :{' '}
            </span>
            <span style={{ color: '#7D7D7D', fontSize: '14px' }}>
              {item.country}
            </span>
          </div> */}

          {/* IUCN Status Row */}
          <div>
            <span style={{ fontSize: '14px', color: '#000000' }}>
              IUCN Status :{' '}
            </span>
            <span style={{ color: '#7D7D7D', fontSize: '14px' }}>
              {item.iucn_status}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'end',
            flexDirection: 'column'
          }}
        >
          <Dropdown
            isOpen={dropdownOpen}
            toggle={toggleDropdown}
          >
            <DropdownToggle
              tag='div'
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                paddingRight: 0
              }}
            >
              <img
                src={menuBlack}
                style={{
                  width: '1.3rem'
                }}
                alt='Menu'
              />
            </DropdownToggle>
            <DropdownMenu end>
              <DropdownItem
                style={{
                  padding: '0.8rem',
                  display: 'flex',
                  alignItems: 'unset',
                  gap: '12px'
                }}
                className='delete-species-item'
                onClick={handleDeleteSpecies}
              >
                <Icon
                  name='trash'
                  style={{ fontSize: '18px' }}
                />
                {i18n.deleteSpecies}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          {/* Price Section */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.75rem',
              color: '#000000'
            }}
          >
            <div></div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: '500',
                margin: '0'
              }}
            >
              ${item.planting_cost_usd}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable component for organization details
const InfoRow = ({ icon, label, value }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.8rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {icon && (
          <img
            src={icon}
            alt={label}
          />
        )}
        <span
          style={{
            color: '#000000',
            fontSize: '15px'
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          color: '#000000',
          fontSize: '15px'
        }}
      >
        {value}
      </div>
    </div>
  );
};
const SideBarDetails = ({
  showDetailModal,
  toggleDetailModal,
  selectedOrg,
  isLoading,
  item
}) => {
  const orgData = item;
  const [isAssignSpeciesModal, setAssignSpeciesModal] = useState(false);
  const [assignSpeciesModalContext, setAssignSpeciesModalContext] =
    useState('sidebar');

  const toggleAssignSpeciesModal = () => {
    setAssignSpeciesModal(!isAssignSpeciesModal);
  };

  const handleAssignSpecies = () => {
    setAssignSpeciesModalContext('sidebar');
    toggleAssignSpeciesModal();
  };

  const headerStyles = {
    color: '#00071F',
    fontSize: '1.375rem'
  };
  return (
    <>
      <Modal
        isOpen={showDetailModal}
        toggle={toggleDetailModal}
        style={{
          maxWidth: '380px',
          width: '100%',
          marginRight: '0',
          marginTop: '0',
          marginBottom: '0',
          borderRadius: '0',
          height: '100vh',
          position: 'fixed',
          top: '0',
          right: '0',
          boxShadow: '-17px 25px 17.8px 0 rgba(0, 0, 0, 0.14)'
        }}
        contentClassName='p-0'
      >
        {isLoading ? (
          <div className='d-flex justify-content-center align-items-center h-100'>
            <div
              className='spinner-border'
              role='status'
            >
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '3fr 1fr',
                alignItems: 'center',
                padding: '1rem 1.3rem'
              }}
            >
              <span
                className='fw-medium text-sm'
                style={headerStyles}
              >
                {orgData?.content?.name || 'Organization Details'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* <button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem'
                  }}
                >
                  <img
                    src={menu}
                    alt='Menu'
                  />
                </button> */}
                {/* <div
                  style={{
                    borderLeft: '1px solid #EDEDED',
                    height: '24px',
                    alignSelf: 'center',
                    margin: '0 8px'
                  }}
                ></div> */}
                <button
                  className='close-button-style'
                  onClick={toggleDetailModal}
                  aria-label='Close'
                >
                  <img
                    src={closeIcon}
                    alt='Close'
                  />
                </button>
              </div>
            </div>
            <div
              style={{
                padding: '1.3rem',
                paddingTop: '0',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 65px)'
              }}
            >
              {orgData && orgData?.content && (
                <>
                  <div>
                    <InfoRow
                      icon={contactPerson}
                      label='Contact Person'
                      value={orgData?.content?.contact_person_full_name}
                    />
                    <InfoRow
                      icon={email}
                      label='Email'
                      value={orgData?.content?.contact_person_email}
                    />
                    <InfoRow
                      icon={globe}
                      label='Countries'
                      value={formatCountries(orgData?.content?.countries)}
                    />
                    <InfoRow
                      icon={calendar}
                      label='Created on'
                      value={formatDateWithoutComma(
                        orgData?.content?.created_on
                      )}
                    />
                    <InfoRow
                      icon={calendar}
                      label='Updated on'
                      value={formatDateWithoutComma(
                        orgData?.content?.updated_on
                      )}
                    />
                    <InfoRow
                      icon={tree}
                      label='No. of Trees'
                      value={orgData?.content?.no_of_trees}
                    />
                  </div>
                  <hr
                    className='my-2'
                    style={{
                      borderWidth: '1px',
                      borderColor: '#8b909a'
                    }}
                  />
                  <div
                    style={{
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span
                      className='fw-medium text-sm'
                      style={headerStyles}
                    >
                      {i18n.species}
                    </span>
                    {/* {orgData?.content?.species?.length === 0 ? (
                      <span
                        className='ms-auto fw-medium'
                        style={{
                          color: '#0D5A42',
                          opacity: 0.5,
                          cursor: 'default'
                        }}
                      >
                        Assign Species
                      </span>
                    ) : ( */}
                    <span
                      onClick={handleAssignSpecies}
                      className='ms-auto fw-medium'
                      style={{ color: '#0D5A42', cursor: 'pointer' }}
                    >
                      {i18n.assignSpecies}
                    </span>
                    {/* )} */}
                  </div>

                  {orgData?.content?.species.map((item, idx) => (
                    <SpeciesCard
                      key={idx}
                      item={item}
                      orgId={orgData?.content?.id} // Pass the organization ID
                    />
                  ))}
                  {orgData?.content?.species?.length === 0 && (
                    <h6 className='text-center'>No Species Assigned yet!</h6>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </Modal>
      <AssignSpeciesModal
        isOpen={isAssignSpeciesModal}
        toggle={toggleAssignSpeciesModal}
        header={i18n.assignSpecies}
        showOrganizationField={assignSpeciesModalContext === 'header'}
        organizationId={
          assignSpeciesModalContext === 'sidebar' ? orgData?.content?.id : null
        }
      />
    </>
  );
};

export default SideBarDetails;
