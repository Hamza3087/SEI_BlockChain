import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { submitPasswordReset } from '../../redux/actions/changePasswordAction';
import i18n from '../../locales/en.json';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { success } = useSelector((state) => state.changePassword);

  const { token, uid } = location.state || {};
  // Redirect on success
  useEffect(() => {
    if (success) {
      setTimeout(() => {
        navigate('/login');
      }, 5000); // delay by 5 seconds
    }
  }, [success, navigate]);

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (newPassword !== confirmPassword) {
      return;
    }
    if (!token || !uid) {
      console.error('Token or UID is missing');
      return;
    }
    dispatch(submitPasswordReset(newPassword, token, uid));
  };

  return (
    <>
      <Head title={i18n.resetPassword} />
      <Block className='nk-block-middle nk-auth-body  wide-xs'>
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
                className='title'
                tag='h5'
              >
                <div style={{ fontSize: '18px' }}>{i18n.resetPassword}</div>
              </BlockTitle>
              <BlockDes>
                <p className='sub_title fw-medium'>
                  {i18n.resetPasswordDescription}
                </p>
              </BlockDes>
            </BlockContent>
          </BlockHead>
          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <div className='form-label-group'>
                <label
                  className='form-label title fw-medium'
                  htmlFor='default-01'
                >
                  {i18n.newPassword}
                </label>
              </div>
              <input
                type='password'
                className='form-control form-control-lg'
                id='default-01'
                placeholder='Enter new password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  boxShadow: 'none'
                }}
              />
            </div>
            <div className='form-group'>
              <div className='form-label-group'>
                <label
                  className='form-label title fw-medium'
                  htmlFor='default-02'
                >
                  {i18n.reEnterPassword}
                </label>
              </div>
              <input
                type='password'
                className='form-control form-control-lg'
                id='default-02'
                placeholder='Re-enter new password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                color='primary'
                type='submit'
              >
                {i18n.resetPassword}
              </Button>
            </div>
          </form>
        </PreviewCard>
      </Block>
    </>
  );
};
export default ResetPassword;
