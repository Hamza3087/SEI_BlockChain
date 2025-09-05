import { AxiosError } from 'axios';
import { Alert } from 'common/components';
import { prettifyError } from 'common/utils';
import { useFmtMsg } from 'modules/intl';
import { openSnackbar } from 'modules/snackbar';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ResetPasswordError, useResetPasswordMutation } from '.';
import { validatePassword } from './utils';
import { InstallButton } from 'modules/install';
import { useOfflineStore } from 'modules/offline';

// Import assets
import { Lock } from 'common/icons';
import eyeInvisible from '@/assets/eye-invisible.svg';
import eyeVisible from '@/assets/eye-visible.svg';
import loginBackGround from '@/assets/splash-screen.jpg';
import logo from '@/assets/logo.svg';
import { appTheme } from 'plugins/appTheme';

type Props = {
  hideInstall?: boolean;
};

export const ResetPassword: React.FC<Props> = ({ hideInstall = false }) => {
  const { isUploading } = useOfflineStore();
  const fmtMsg = useFmtMsg();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const resetPasswordMutation = useResetPasswordMutation();

  const submit = () => {
    if (!validatePassword(password)) {
      setPasswordError(fmtMsg('wrongPasswordFormat'));
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(fmtMsg('passwordsAreNotTheSame'));
      return;
    }

    resetPasswordMutation.mutate(
      { password, token, uid },
      {
        onSuccess: () => {
          openSnackbar(fmtMsg('passwordChangedSuccessfully'), 'success');
          navigate('/login');
        },
      }
    );
  };

  const getErrorText = (error: AxiosError<ResetPasswordError>) => {
    if (
      error.response?.data.token?.includes('Invalid value.') ||
      error.response?.data.uid?.includes('Invalid value.')
    ) {
      return fmtMsg('linkExpiredOrIncorrect');
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

  const getPasswordBackgroundColor = () => {
    if (password) {
      return appTheme.secondaryPalette.mintGreen;
    }
    return appTheme.secondaryPalette.mercuryGray;
  };

  const getConfirmPasswordBackgroundColor = () => {
    if (confirmPassword) {
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
              alt='Reset Password Screen'
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
                {fmtMsg('resetPassword')}
              </h1>
            </div>

            {/* Error Alert */}
            {resetPasswordMutation.error && (
              <Alert
                severity='error'
                text={getErrorText(resetPasswordMutation.error)}
                className='mb-4'
              />
            )}

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
              {/* New Password field */}
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
                    autoComplete='new-password'
                    style={{
                      color: appTheme.secondaryPalette.darkGreen,
                      backgroundColor: getPasswordBackgroundColor(),
                      border: passwordError
                        ? `1px solid ${appTheme.secondaryPalette.errorRed}`
                        : 'none',
                    }}
                    placeholder={fmtMsg('newPassword')}
                    value={password}
                    onChange={(e) => {
                      setPasswordError('');
                      setPassword(e.target.value);
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = getPasswordBackgroundColor();
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = getPasswordBackgroundColor();
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

              {/* Confirm Password field */}
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`text-sm rounded-lg block w-full pl-10 pr-10 p-2.5 focus:outline-none`}
                    autoComplete='new-password'
                    style={{
                      color: appTheme.secondaryPalette.darkGreen,
                      backgroundColor: getConfirmPasswordBackgroundColor(),
                      border: confirmPasswordError
                        ? `1px solid ${appTheme.secondaryPalette.errorRed}`
                        : 'none',
                    }}
                    placeholder={fmtMsg('confirmNewPassword')}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPasswordError('');
                      setConfirmPassword(e.target.value);
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = getConfirmPasswordBackgroundColor();
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = getConfirmPasswordBackgroundColor();
                    }}
                  />
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <button
                      type='button'
                      className='text-gray-500 focus:outline-none'
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <img
                        alt={showConfirmPassword ? 'Show password' : 'Hide password'}
                        src={showConfirmPassword ? eyeInvisible : eyeVisible}
                        className='h-4 w-4'
                      />
                    </button>
                  </div>
                </div>
                {confirmPasswordError && (
                  <p className='text-left font-medium text-sm text-red-400 dark:text-red-400 mt-1'>
                    {confirmPasswordError}
                  </p>
                )}
              </div>

              {/* Reset button */}
              <button
                type='submit'
                className='w-full text-sm font-medium py-2.5 rounded-3xl focus:outline-none'
                style={{
                  color: appTheme.primaryPalette.white,
                  backgroundColor: appTheme.secondaryPalette.darkForestGreen,
                }}
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? fmtMsg('loading') : fmtMsg('reset')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
