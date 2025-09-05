import React from 'react';
import { Card, Row, Col } from 'reactstrap';
import user from '../images/icons/user.svg';
import mail from '../images/icons/mail.svg';
import wallet from '../images/icons/wallet.svg';
import backIcon from '../images/icons/back.svg';

const SponsorCard = ({ sponsorData, onBack }) => {
  return (
    <div className='card-inner-group'>
      <div className='d-flex align-items-center gap-2 mb-4'>
        <img
          src={backIcon}
          onClick={onBack}
          style={{ cursor: 'pointer' }}
          alt='Back'
        />
        <h6
          className='nk-block-title fw-normal'
          style={{ color: '#000000' }}
        >
          {sponsorData?.name || 'Sponsor Details'}
        </h6>
      </div>

      <Card
        style={{
          border: '1px solid #DFDFDF',
          backgroundColor: 'white',
          marginBottom: '1.5rem'
        }}
      >
        <div className='card-inner-group'>
          <div className='p-3'>
            <Row className='gy-4'>
              <Col
                xs={12}
                sm={4}
                md={4}
                className='d-flex align-items-center'
              >
                <div
                  className='d-flex align-items-center justify-around'
                  style={{ minWidth: '100%' }}
                >
                  <div
                    className='d-flex align-items-start'
                    style={{ minWidth: '120px' }}
                  >
                    <img
                      src={user}
                      alt='Type'
                      width={18}
                      className='me-2'
                    />
                    <span
                      className='fw-normal'
                      style={{ color: '#000000', whiteSpace: 'nowrap' }}
                    >
                      Type
                    </span>
                  </div>
                  <span
                    className='fw-normal ms-3 text-truncate'
                    style={{ color: '#000000' }}
                  >
                    {sponsorData?.type || '-'}
                  </span>
                </div>
                <div
                  style={{
                    borderLeft: '1px solid #949AA7',
                    height: '16px',
                    margin: '0 8px'
                  }}
                ></div>
              </Col>

              {/* <Col
                xs={12}
                sm={6}
                md={3}
                className='d-flex align-items-center'
              >
                <div
                  className='d-flex align-items-center justify-around'
                  style={{ minWidth: '100%' }}
                >
                  <div
                    className='d-flex align-items-center'
                    style={{ minWidth: '120px' }}
                  >
                    <img
                      src={calendar}
                      alt='Created on'
                      width={18}
                      className='me-2'
                    />
                    <span
                      className='fw-normal'
                      style={{ color: '#000000', whiteSpace: 'nowrap' }}
                    >
                      Created on
                    </span>
                  </div>
                  <span
                    className='fw-normal ms-3 text-truncate'
                    style={{ color: '#000000' }}
                  >
                    {sponsorData?.created_on || '-'}
                  </span>
                </div>
                <div
                  style={{
                    borderLeft: '1px solid #949AA7',
                    height: '16px',
                    margin: '0 8px'
                  }}
                ></div>
              </Col> */}

              <Col
                xs={12}
                sm={4}
                md={4}
                className='d-flex align-items-center'
              >
                <div
                  className='d-flex align-items-center justify-around'
                  style={{ minWidth: '100%' }}
                >
                  <div
                    className='d-flex align-items-start'
                    style={{ minWidth: '120px' }}
                  >
                    <img
                      src={mail}
                      alt='Email'
                      width={18}
                      className='me-2'
                    />
                    <span
                      className='fw-normal'
                      style={{ color: '#000000', whiteSpace: 'nowrap' }}
                    >
                      Contact Email
                    </span>
                  </div>
                  <span
                    className='fw-normal ms-3 text-truncate'
                    style={{ color: '#000000' }}
                  >
                    {sponsorData?.contact_person_email || '-'}
                  </span>
                </div>
                <div
                  style={{
                    borderLeft: '1px solid #949AA7',
                    height: '16px',
                    margin: '0 8px'
                  }}
                ></div>
              </Col>

              <Col
                xs={12}
                sm={4}
                md={4}
                className='d-flex align-items-center'
              >
                <div
                  className='d-flex align-items-center justify-around'
                  style={{ minWidth: '100%' }}
                >
                  <div
                    className='d-flex align-items-start'
                    style={{ minWidth: '120px' }}
                  >
                    <img
                      src={wallet}
                      alt='Wallet'
                      width={18}
                      className='me-2'
                    />
                    <span
                      className='fw-normal'
                      style={{ color: '#000000', whiteSpace: 'nowrap' }}
                    >
                      Wallet Address
                    </span>
                  </div>
                  <span
                    className='fw-normal ms-3 text-truncate'
                    style={{ color: '#000000' }}
                  >
                    {sponsorData?.wallet_address || '-'}
                  </span>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SponsorCard;
