import React from 'react';
import Logo from '../../images/logo.svg';
import LogoDark from '../../images/logo.svg';
import Head from '../../layout/head/Head';
import {
  Block,
  BlockContent,
  BlockDes,
  BlockHead,
  BlockTitle,
  Button,
  PreviewCard
} from '../../components/Component';
import { Link } from 'react-router-dom';
import '../../assets/scss/login.scss';
import i18n from '../../locales/en.json';

const ForgotPassword = () => {
  return (
    <>
      <Head title={i18n.forgotPassword} />
      <Block className='nk-block-middle nk-auth-body wide-xs'>
        <div className='brand-logo pb-4 text-center'>
          <Link
            to={process.env.PUBLIC_URL + '/'}
            className='logo-link'
          >
            <img
              className='logo-light logo-img logo-img-lg'
              src={Logo}
              alt='logo'
            />
            <img
              className='logo-dark logo-img logo-img-lg'
              src={LogoDark}
              alt='logo-dark'
            />
          </Link>
        </div>
        <PreviewCard
          className='card-bordered'
          bodyClass='card-inner-lg'
        >
          <BlockHead>
            <BlockContent>
              <BlockTitle
                tag='h5'
                className='title'
              >
                <div style={{ fontSize: '18px' }}>{i18n.forgotPassword}</div>
              </BlockTitle>
              <BlockDes>
                <p className='sub_title fw-medium'>
                  {i18n.forgotPasswordDescription}
                </p>
              </BlockDes>
            </BlockContent>
          </BlockHead>
          <form>
            <div className='form-group'>
              <div className='form-label-group'>
                <label
                  className='form-label title fw-medium'
                  htmlFor='default-01'
                >
                  {i18n.email}
                </label>
              </div>
              <input
                type='text'
                className='form-control form-control-lg'
                id='default-01'
                placeholder='Enter your email address'
                style={{
                  boxShadow: 'none'
                }}
              />
            </div>
            <div className='form-group'>
              <Button
                style={{ color: 'white' }}
                size='lg'
                className='btn-block'
                onClick={(ev) => ev.preventDefault()}
                color='primary'
              >
                {i18n.submit}
              </Button>
            </div>
          </form>
        </PreviewCard>
      </Block>
    </>
  );
};
export default ForgotPassword;
