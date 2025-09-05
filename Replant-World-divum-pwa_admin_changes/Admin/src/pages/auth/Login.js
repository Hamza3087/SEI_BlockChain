import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Icon,
  PreviewCard
} from '../../components/Component';
import { Form, Spinner, Alert } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { login } from '../../redux/actions/authActions';
import '../../assets/scss/login.scss';
import i18n from '../../locales/en.json';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [passState, setPassState] = useState(false);

  // Get authentication state from Redux store
  const authState = useSelector((state) => state.auth);
  const loading = authState?.loading || false;
  const authError = authState?.error || null;
  const isAuthenticated = authState?.isAuthenticated || false;

  // Redirect if authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '/');
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onFormSubmit = (formData) => {
    // Dispatch login action with form data
    dispatch(
      login({
        email: formData.name,
        password: formData.passcode
      })
    );
  };

  return (
    <>
      <Head title={i18n.login} />
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
                className='title'
                tag='h4'
              >
                <div style={{ fontSize: '18px' }}>{i18n.login}</div>
              </BlockTitle>
              <BlockDes>
                <p className='sub_title fw-medium'>{i18n.loginDescription}</p>
              </BlockDes>
            </BlockContent>
          </BlockHead>
          {authError && (
            <div className='mb-3'>
              <Alert
                color='danger'
                className='alert-icon'
              >
                <Icon name='alert-circle' /> {authError}
              </Alert>
            </div>
          )}
          <Form
            className='is-alter'
            onSubmit={handleSubmit(onFormSubmit)}
          >
            <div className='form-group'>
              <div className='form-label-group'>
                <label
                  className='form-label title fw-medium'
                  htmlFor='default-01'
                >
                  {i18n.username}
                </label>
              </div>
              <div className='form-control-wrap'>
                <input
                  type='text'
                  id='default-01'
                  {...register('name', { required: 'This field is required' })}
                  placeholder='Enter your username'
                  className='form-control-lg form-control'
                  style={{
                    boxShadow: 'none'
                  }}
                />
                {errors.name && (
                  <span className='invalid'>{errors.name.message}</span>
                )}
              </div>
            </div>
            <div className='form-group'>
              <div className='form-label-group'>
                <label
                  className='form-label title fw-medium'
                  htmlFor='password'
                >
                  {i18n.password}
                </label>
                <Link
                  className='link custom-text-color'
                  to={`${process.env.PUBLIC_URL}/auth-reset`}
                >
                  {/* {i18n.forgotPassword} ? */}
                </Link>
              </div>
              <div className='form-control-wrap'>
                <a
                  href='#password'
                  onClick={(ev) => {
                    ev.preventDefault();
                    setPassState(!passState);
                  }}
                  className={`form-icon lg form-icon-right passcode-switch ${
                    passState ? 'is-hidden' : 'is-shown'
                  }`}
                >
                  <Icon
                    name='eye'
                    className='passcode-icon icon-show'
                  ></Icon>

                  <Icon
                    name='eye-off'
                    className='passcode-icon icon-hide'
                  ></Icon>
                </a>
                <input
                  type={passState ? 'text' : 'password'}
                  id='password'
                  {...register('passcode', {
                    required: 'This field is required'
                  })}
                  placeholder='Enter your password'
                  className={`form-control-lg form-control ${
                    passState ? 'is-hidden' : 'is-shown'
                  }`}
                  style={{
                    boxShadow: 'none'
                  }}
                />
                {errors.passcode && (
                  <span className='invalid'>{errors.passcode.message}</span>
                )}
              </div>
            </div>
            <div className='form-group'>
              <Button
                size='lg'
                className='btn-block'
                type='submit'
                style={{ color: 'white' }}
                color='primary'
              >
                {loading ? (
                  <Spinner
                    size='sm'
                    color='light'
                  />
                ) : (
                  i18n.login
                )}
              </Button>
            </div>
          </Form>
        </PreviewCard>
      </Block>
    </>
  );
};
export default Login;
