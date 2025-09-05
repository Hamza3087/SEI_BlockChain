import { AxiosError } from 'axios';
import { Alert, LoaderBox } from 'common/components';
import { prettifyError } from 'common/utils';
import { Country } from 'modules/countries';
import { useFmtMsg } from 'modules/intl';
import { openSnackbar } from 'modules/snackbar';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  RegisterError,
  RegisteredOrganizationError,
  enterValidUsername,
  passwordIsTooSimilarToUsername,
  phoneNumberIsNotValid,
  registrationLinkExpired,
  useRegisterIntoOrganizationMutation,
  useRegisteredOrganization,
} from '.';
import { SignupForm } from './SignupForm';
import { validatePassword, validatePhoneNumber } from './utils';
import { InstallButton } from 'modules/install';
import { useOfflineStore } from 'modules/offline';
import { appTheme } from 'plugins/appTheme';
import logo from '@/assets/logo.svg';
import loginBackGround from '@/assets/splash-screen.jpg';

export const Signup: React.FC = () => {
  const { isUploading } = useOfflineStore();
  const fmtMsg = useFmtMsg();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');

  const {
    data: organization,
    error: organizationError,
    isLoading: isOrganizationLoading,
  } = useRegisteredOrganization(code);

  const [login, setLogin] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState<Country>();

  const [loginError, setLoginError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [countryError, setCountryError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const registerMutation = useRegisterIntoOrganizationMutation(code!);

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

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const loginTrimmed = login.trim();
    const phoneNumberTrimmed = phoneNumber.trim();

    if (!loginTrimmed) {
      setLoginError(fmtMsg('fieldRequired'));
    }

    if (!phoneNumberTrimmed) {
      setPhoneNumberError(fmtMsg('fieldRequired'));
    }

    if (!country) {
      setCountryError(fmtMsg('fieldRequired'));
    }

    if (!validatePassword(password)) {
      setPasswordError(fmtMsg('wrongPasswordFormat'));
      return;
    }

    if (!validatePhoneNumber(phoneNumberTrimmed)) {
      setPhoneNumberError(fmtMsg('phoneNumberIsNotValid'));
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(fmtMsg('passwordsAreNotTheSame'));
      return;
    }

    if (
      loginError ||
      passwordError ||
      confirmPasswordError ||
      phoneNumberError ||
      countryError
    ) {
      return;
    }

    if (country && phoneNumberTrimmed && loginTrimmed && password) {
      registerMutation.mutate(
        {
          username: loginTrimmed,
          phone_number: phoneNumberTrimmed,
          country: country?.id,
          password: password,
        },
        {
          onSuccess: () => {
            openSnackbar(fmtMsg('youHaveSuccessfullySignedUp'), 'success');
            navigate('/login');
          },
        }
      );
    }
  };

  const getErrorText = (error: AxiosError<RegisterError>) => {
    if (phoneNumberIsNotValid(error.response?.data)) {
      return fmtMsg('phoneNumberIsNotValid');
    }

    if (passwordIsTooSimilarToUsername(error.response?.data)) {
      return fmtMsg('passwordIsTooSimilarToUsername');
    }

    if (enterValidUsername(error.response?.data)) {
      return fmtMsg('enterValidUsername');
    }

    return prettifyError(error);
  };

  const getWrongCodeErrorText = (
    error: AxiosError<RegisteredOrganizationError> | null
  ) => {
    if (registrationLinkExpired(error?.response?.data)) {
      return fmtMsg('registrationLinkExpired');
    }

    return fmtMsg('registrationLinkIsInvalid');
  };

  if (!code || organizationError) {
    return (
      <div className='flex items-center justify-center w-screen'>
        <div className='relative w-full max-w-md h-dvh overflow-hidden'>
          {/* Background */}
          <div className='absolute inset-0 z-0 w-full h-full'>
            <img
              alt='Signup Screen'
              src={loginBackGround}
              className='w-full h-full object-cover'
            />
            <img
              alt='Logo'
              src={logo}
              className='absolute top-8 left-2 m-4 w-12 h-12 object-contain z-10'
            />
            <div className='absolute top-8 right-2 m-4 object-contain z-10'>
              {!isUploading && <InstallButton />}
            </div>
          </div>
          
          {/* Error Content */}
          <div className='absolute bottom-0 left-0 right-0 z-10 w-full'>
            <div className='w-full p-4 bg-white rounded-t-3xl shadow-md'>
              <div className='flex flex-col gap-5 mb-5 w-full'>
                {!code && (
                  <Alert
                    text={fmtMsg('signupCodeIsMissingFromTheUrl')}
                    severity={'error'}
                  />
                )}
                {organizationError && (
                  <Alert
                    text={getWrongCodeErrorText(organizationError)}
                    severity={'error'}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isOrganizationLoading) {
    return <LoaderBox />;
  }

  return (
    <div className='flex items-center justify-center w-screen'>
      <div className='relative w-full max-w-md h-dvh overflow-hidden'>
        {/* Background */}
        <div className='absolute inset-0 z-0 w-full h-full'>
          <img
            alt='Signup Screen'
            src={loginBackGround}
            className='w-full h-full object-cover'
          />
          <img
            alt='Logo'
            src={logo}
            className='absolute top-8 left-2 m-4 w-12 h-12 object-contain z-10'
          />
          <div className='absolute top-8 right-2 m-4 object-contain z-10'>
            {!isUploading && <InstallButton />}
          </div>
        </div>

        {/* Form Content */}
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
                {fmtMsg('signUp')}
              </h1>
              <p
                className='text-[1rem] font-semibold'
                style={{
                  color: appTheme.secondaryPalette.silverSand,
                }}
              >
                {organization?.planting_organization?.name}
              </p>
            </div>

            {/* Error Alert */}
            {registerMutation.isError && (
              <Alert
                severity='error'
                text={getErrorText(registerMutation.error)}
                className='mb-4'
              />
            )}

            {/* Form */}
            <form onSubmit={submit}>
              <SignupForm
                login={login}
                phoneNumber={phoneNumber}
                password={password}
                confirmPassword={confirmPassword}
                countries={organization?.planting_organization.countries || []}
                loginError={loginError}
                phoneNumberError={phoneNumberError}
                countryError={countryError}
                passwordError={passwordError}
                confirmPasswordError={confirmPasswordError}
                country={country}
                onLoginChange={(val) => {
                  setLoginError('');
                  setLogin(val);
                }}
                onPhoneNumberChange={(val) => {
                  setPhoneNumberError('');
                  setPhoneNumber(val);
                }}
                onPasswordChange={(val) => {
                  setPasswordError('');
                  setPassword(val);
                }}
                onConfirmPasswordChange={(val) => {
                  setConfirmPasswordError('');
                  setConfirmPassword(val);
                }}
                onCountryChange={(val: Country) => {
                  setCountryError('');
                  setCountry(val);
                }}
              />

              {/* Sign up button */}
              <button
                type='submit'
                className='w-full text-sm font-medium py-2.5 rounded-3xl focus:outline-none mt-4'
                style={{
                  color: appTheme.primaryPalette.white,
                  backgroundColor: appTheme.secondaryPalette.darkForestGreen,
                }}
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? fmtMsg('loading') : fmtMsg('signUp')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
