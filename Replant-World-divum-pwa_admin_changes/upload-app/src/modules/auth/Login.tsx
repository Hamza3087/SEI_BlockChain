// import poptechImg from '@/assets/poptech.png';
// import { AxiosError } from 'axios';
// import { Alert, Button, Input, Section } from 'common/components';
// import { Lock, Person } from 'common/icons';
// import { prettifyError } from 'common/utils';
// import { useFmtMsg } from 'modules/intl';
// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { LoginError, useLoginMutation } from './';

// export const Login: React.FC = () => {
//   const fmtMsg = useFmtMsg();

//   const navigate = useNavigate();

//   const [login, setLogin] = useState('');
//   const [password, setPassword] = useState('');

//   const [loginError, setLoginError] = useState('');
//   const [passwordError, setPasswordError] = useState('');

//   const loginMutation = useLoginMutation();

//   const logIn = async () => {
//     if (loginMutation.isPending) {
//       return;
//     }

//     const loginTrimmed = login.trim();
//     const passwordTrimmed = password.trim();

//     let loginError = '';
//     let passwordError = '';

//     if (!login.trim()) {
//       loginError = fmtMsg('fieldRequired');
//     }

//     if (!password.trim()) {
//       passwordError = fmtMsg('fieldRequired');
//     }

//     setLoginError(loginError);
//     setPasswordError(passwordError);

//     if (loginError || passwordError) {
//       return;
//     }

//     await loginMutation.mutateAsync({
//       password: passwordTrimmed,
//       username: loginTrimmed,
//     });
//     navigate('/');
//   };

//   const getErrorText = (error: AxiosError<LoginError>) => {
//     if (
//       error.response?.data.non_field_errors?.includes(
//         'Incorrect username or password.'
//       )
//     ) {
//       return fmtMsg('incorrectLoginOrPassword');
//     }
//     return prettifyError(error);
//   };

//   return (
//     <Section
//       actions={
//         <Button isLoading={loginMutation.isPending} onClick={logIn}>
//           {fmtMsg('logIn')}
//         </Button>
//       }
//     >
//       <form className='flex flex-col gap-5 h-full items-center justify-end pb-2'>
//         <img src={poptechImg} className='h-9 invert dark:invert-0' />
//         {loginMutation.isError && (
//           <Alert severity='error' text={getErrorText(loginMutation.error)} />
//         )}
//         <Input
//           Icon={Person}
//           label={fmtMsg('login')}
//           placeholder={fmtMsg('login')}
//           value={login}
//           onChange={(value) => {
//             setLoginError('');
//             setLogin(value);
//           }}
//           error={loginError}
//         />
//         <Input
//           Icon={Lock}
//           label={fmtMsg('password')}
//           placeholder={fmtMsg('password')}
//           value={password}
//           type='password'
//           error={passwordError}
//           onChange={(value) => {
//             setPasswordError('');
//             setPassword(value);
//           }}
//         />
//         <Link
//           className='text-sm text-right text-gray-500 w-full mt-[-1rem]'
//           to={'/forgot-password'}
//         >
//           {fmtMsg('forgotYourPassword')}
//         </Link>
//       </form>
//     </Section>
//   );
// };

import { AxiosError } from 'axios';
import { Alert } from 'common/components';
import { prettifyError } from 'common/utils';
import { useFmtMsg } from 'modules/intl';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginError, useLoginMutation } from '.';
import { InstallButton } from 'modules/install';
import { useOfflineStore } from 'modules/offline';

// Import new assets
import user from '@/assets/user.svg';
// import passWord from '@/assets/password.svg';
import { Lock } from 'common/icons';
import eyeInvisible from '@/assets/eye-invisible.svg';
import eyeVisible from '@/assets/eye-visible.svg';
import poptech from '@/assets/poptech.svg';
// import rememberMeChecked from 'assets/remember-me-checked.svg';
// import rememberMeUnchecked from 'assets/circle-blank.svg';
import loginBackGround from '@/assets/splash-screen.jpg';
import logo from '@/assets/logo.svg';
import { appTheme } from 'plugins/appTheme';

type Props = {
  hideInstall?: boolean;
};

export const Login: React.FC<Props> = ({ hideInstall = false }) => {
  const { isUploading } = useOfflineStore();
  const fmtMsg = useFmtMsg();
  const navigate = useNavigate();

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // New UI state
  const [showPassword, setShowPassword] = useState(false);
  // const [rememberMe, setRememberMe] = useState(false);

  const loginMutation = useLoginMutation();

  const logIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loginMutation.isPending) {
      return;
    }

    const loginTrimmed = login.trim();
    const passwordTrimmed = password.trim();

    let loginError = '';
    let passwordError = '';

    if (!loginTrimmed) {
      loginError = fmtMsg('fieldRequired');
    }

    if (!passwordTrimmed) {
      passwordError = fmtMsg('fieldRequired');
    }

    setLoginError(loginError);
    setPasswordError(passwordError);

    if (loginError || passwordError) {
      return;
    }

    await loginMutation.mutateAsync({
      password: passwordTrimmed,
      username: loginTrimmed,
    });
    navigate('/');
  };

  const getErrorText = (error: AxiosError<LoginError>) => {
    if (
      error.response?.data.non_field_errors?.includes(
        'Incorrect username or password.'
      )
    ) {
      return fmtMsg('incorrectLoginOrPassword');
    }
    return prettifyError(error);
  };

  // Prevent scrolling when input is focused
  useEffect(() => {
    const handleFocus = () => {
      document.body.classList.add('no-scroll');
    };
    const handleBlur = () => {
      document.body.classList.remove('no-scroll');
    };
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input) => {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
    });
    return () => {
      inputs.forEach((input) => {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      });
    };
  }, []);

  // Add styles for autofill
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px ${appTheme.secondaryPalette.mintGreen} inset !important;
        -webkit-text-fill-color: ${appTheme.secondaryPalette.darkGreen} !important;
        transition: background-color 5000s ease-in-out 0s !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const getLoginBackgroundColor = () => {
    // Only mintGreen if there's actual content (typed or autofilled)
    if (login) {
      return appTheme.secondaryPalette.mintGreen;
    }
    return appTheme.secondaryPalette.mercuryGray;
  };

  const getPasswordBackgroundColor = () => {
    // Only mintGreen if there's actual content (typed or autofilled)
    if (password) {
      return appTheme.secondaryPalette.mintGreen;
    }
    return appTheme.secondaryPalette.mercuryGray;
  };

  return (
    <div className='flex items-center justify-center w-screen'>
      <div className='relative w-full max-w-md h-dvh overflow-hidden'>
        {/* Background */}
        <div className='absolute inset-0 z-0 w-full h-full'>
          <div>
            <img
              alt='Login Screen'
              src={loginBackGround}
              className='w-full h-full object-cover'
            />
            <img
              alt='Logo'
              src={logo}
              className='absolute top-8 left-2 m-4 w-12 h-12 object-contain z-10'
            />
            <div className='absolute top-8 right-2 m-4 object-contain z-10'>
              {!hideInstall && !isUploading && <InstallButton />}
            </div>
          </div>
        </div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-[30%]'>
          <img alt='Poptech' src={poptech} className='object-contain w-full' />
        </div>
        {/* Input Fields */}
        <div className='absolute bottom-0 left-0 right-0 z-10 w-full'>
          <div className='w-full p-4 bg-white rounded-t-3xl shadow-md'>
            {/* Header */}
            <div className='text-center mb-6 flex gap-2 flex-col'>
              <h1
                className='text-2xl font-semibold'
                style={{
                  color: appTheme.primaryPalette.black,
                }}
              >
                {fmtMsg('welcomeBack')}
              </h1>
              <p
                className='text-[0.8125rem] font-semibold'
                style={{
                  color: appTheme.secondaryPalette.silverSand,
                }}
              >
                {fmtMsg('loginWithReplantWorld')}
              </p>
            </div>

            {/* Error Alert */}
            {loginMutation.isError && (
              <Alert
                severity='error'
                text={getErrorText(loginMutation.error)}
                className='mb-4'
              />
            )}

            {/* Form */}
            <form onSubmit={logIn}>
              {/* Username field */}
              <div className='mb-4'>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <img src={user} alt='User' className='h-4 w-4' />
                  </div>
                  <input
                    type='text'
                    className={`text-sm rounded-lg block w-full pl-10 p-2.5 focus:outline-none`}
                    autoComplete='username'
                    style={{
                      color: appTheme.secondaryPalette.darkGreen,
                      backgroundColor: getLoginBackgroundColor(),
                      border: loginError
                        ? `1px solid ${appTheme.secondaryPalette.errorRed}`
                        : 'none',
                    }}
                    placeholder={fmtMsg('username')}
                    value={login}
                    onChange={(e) => {
                      setLoginError('');
                      setLogin(e.target.value);
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor =
                        getLoginBackgroundColor();
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor =
                        getLoginBackgroundColor();
                    }}
                  />
                </div>
                {loginError && (
                  <p className='text-left font-medium text-sm text-red-400 dark:text-red-400 mt-1'>
                    {loginError}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className='mb-4'>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock
                      overrideColor
                      pathClassName='fill-[#305335]'
                      svgClassName='h-5 w-5'
                    />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`text-sm rounded-lg block w-full pl-10 pr-10 p-2.5 focus:outline-none`}
                    autoComplete='current-password'
                    style={{
                      color: appTheme.secondaryPalette.darkGreen,
                      backgroundColor: getPasswordBackgroundColor(),
                      border: passwordError
                        ? `1px solid ${appTheme.secondaryPalette.errorRed}`
                        : 'none',
                    }}
                    placeholder={fmtMsg('password')}
                    value={password}
                    onChange={(e) => {
                      setPasswordError('');
                      setPassword(e.target.value);
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor =
                        getPasswordBackgroundColor();
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor =
                        getPasswordBackgroundColor();
                    }}
                  />
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <button
                      type='button'
                      className='text-gray-500 focus:outline-none'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <img
                        alt={showPassword ? 'Show password' : 'Hide password'}
                        src={showPassword ? eyeInvisible : eyeVisible}
                        className='h-4 w-4'
                      />
                    </button>
                  </div>
                </div>
                {passwordError && (
                  <p className='text-left font-medium text-sm text-red-400 dark:text-red-400 mt-1'>
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Remember me and Forgot Password */}
              <div className='flex justify-end items-center mb-3'>
                {/* <div className='flex items-center'>
                  <img
                    src={rememberMe ? rememberMeChecked : rememberMeUnchecked}
                    alt='Remember Me'
                    className='w-5 h-5 cursor-pointer'
                    onClick={() => setRememberMe(!rememberMe)}
                  />
                  <label
                    className='ml-2 text-sm font-semibold'
                    style={{
                      color: appTheme.secondaryPalette.lightGray,
                    }}
                  >
                    {fmtMsg('rememberMe')}
                  </label>
                </div> */}
                <Link
                  to='/forgot-password'
                  className='text-sm font-semibold'
                  style={{
                    color: appTheme.secondaryPalette.darkForestGreen,
                  }}
                >
                  {fmtMsg('forgotYourPassword')}
                </Link>
              </div>

              {/* Login button */}
              <button
                type='submit'
                className='w-full text-sm font-medium py-2.5 rounded-3xl focus:outline-none'
                style={{
                  color: appTheme.primaryPalette.white,
                  backgroundColor: appTheme.secondaryPalette.darkForestGreen,
                }}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? fmtMsg('loading') : fmtMsg('login')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
