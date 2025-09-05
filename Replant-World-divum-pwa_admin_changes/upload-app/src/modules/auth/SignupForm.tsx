import { Call, Lock, LocationOn } from 'common/icons';
import { Country } from 'modules/countries';
import { useFmtMsg } from 'modules/intl';
import { useState, useEffect, useRef } from 'react';
import { appTheme } from 'plugins/appTheme';
import user from '@/assets/user.svg';
import eyeInvisible from '@/assets/eye-invisible.svg';
import eyeVisible from '@/assets/eye-visible.svg';

type Props = {
  login: string;
  phoneNumber: string;
  country?: Country;
  password: string;
  confirmPassword: string;
  loginError?: string;
  phoneNumberError?: string;
  countryError?: string;
  passwordError?: string;
  confirmPasswordError?: string;
  countries: Country[];
  onLoginChange: (val: string) => void;
  onPhoneNumberChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onConfirmPasswordChange: (val: string) => void;
  onCountryChange: (val: Country) => void;
};

export const SignupForm: React.FC<Props> = ({
  phoneNumber,
  login,
  password,
  country,
  confirmPassword,
  loginError,
  phoneNumberError,
  countryError,
  passwordError,
  confirmPasswordError,
  countries,
  onLoginChange,
  onPhoneNumberChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onCountryChange,
}) => {
  const fmtMsg = useFmtMsg();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);


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

  const getInputBackgroundColor = (value: string) => {
    return value ? appTheme.secondaryPalette.mintGreen : appTheme.secondaryPalette.mercuryGray;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <form className='flex flex-col gap-4'>
      {/* Login field */}
      <div>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <img src={user} alt='User' className='h-4 w-4' />
          </div>
          <input
            type='text'
            className='text-sm rounded-lg block w-full pl-10 p-2.5 focus:outline-none'
            autoComplete='username'
            style={{
              color: appTheme.secondaryPalette.darkGreen,
              backgroundColor: getInputBackgroundColor(login),
              border: loginError
                ? `1px solid ${appTheme.secondaryPalette.errorRed}`
                : 'none',
            }}
            placeholder={fmtMsg('login')}
            value={login}
            onChange={(e) => onLoginChange(e.target.value)}
            onFocus={(e) => {
              e.target.style.backgroundColor = getInputBackgroundColor(login);
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = getInputBackgroundColor(login);
            }}
          />
        </div>
        {loginError && (
          <p className='text-left font-medium text-sm text-red-400 dark:text-red-400 mt-1'>
            {loginError}
          </p>
        )}
      </div>

      {/* Phone Number field */}
      <div>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <Call
              overrideColor
              pathClassName='fill-[#305335]'
              svgClassName='h-5 w-5'
            />
          </div>
          <input
            type='tel'
            className='text-sm rounded-lg block w-full pl-10 p-2.5 focus:outline-none'
            autoComplete='tel'
            style={{
              color: appTheme.secondaryPalette.darkGreen,
              backgroundColor: getInputBackgroundColor(phoneNumber),
              border: phoneNumberError
                ? `1px solid ${appTheme.secondaryPalette.errorRed}`
                : 'none',
            }}
            placeholder={fmtMsg('phoneNumber')}
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            onFocus={(e) => {
              e.target.style.backgroundColor = getInputBackgroundColor(phoneNumber);
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = getInputBackgroundColor(phoneNumber);
            }}
          />
        </div>
        {phoneNumberError && (
          <p className='text-left font-medium text-sm text-red-400 dark:text-red-400 mt-1'>
            {phoneNumberError}
          </p>
        )}
      </div>

      {/* Country field */}
      <div ref={countryDropdownRef}>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <LocationOn
              overrideColor
              pathClassName='fill-[#305335]'
              svgClassName='h-5 w-5'
            />
          </div>
          <div
            className='text-sm rounded-lg block w-full pl-10 pr-10 p-2.5 focus:outline-none cursor-pointer'
            style={{
              color: appTheme.secondaryPalette.darkGreen,
              backgroundColor: getInputBackgroundColor(country?.name || ''),
              border: countryError
                ? `1px solid ${appTheme.secondaryPalette.errorRed}`
                : 'none',
            }}
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
          >
            <span className={country?.name ? '' : 'text-gray-500'}>
              {country?.name || fmtMsg('country')}
            </span>
          </div>
          <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
            <svg 
              className={`h-4 w-4 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} 
              fill='none' 
              stroke='currentColor' 
              viewBox='0 0 24 24'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
            </svg>
          </div>
          
          {/* Dropdown */}
          {showCountryDropdown && (
            <div className='absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto'>
              {countries.map((countryOption) => (
                <div
                  key={countryOption.id}
                  className='px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm'
                  style={{
                    color: appTheme.secondaryPalette.darkGreen,
                  }}
                  onClick={() => {
                    onCountryChange(countryOption);
                    setShowCountryDropdown(false);
                  }}
                >
                  {countryOption?.name}
                </div>
              ))}
            </div>
          )}
        </div>
        {countryError && (
          <p className='text-left font-medium text-sm text-red-400 dark:text-red-400 mt-1'>
            {countryError}
          </p>
        )}
      </div>

      {/* Password field */}
      <div>
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
            className='text-sm rounded-lg block w-full pl-10 pr-10 p-2.5 focus:outline-none'
            autoComplete='new-password'
            style={{
              color: appTheme.secondaryPalette.darkGreen,
              backgroundColor: getInputBackgroundColor(password),
              border: passwordError
                ? `1px solid ${appTheme.secondaryPalette.errorRed}`
                : 'none',
            }}
            placeholder={fmtMsg('password')}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onFocus={(e) => {
              e.target.style.backgroundColor = getInputBackgroundColor(password);
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = getInputBackgroundColor(password);
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
      <div>
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
            className='text-sm rounded-lg block w-full pl-10 pr-10 p-2.5 focus:outline-none'
            autoComplete='new-password'
            style={{
              color: appTheme.secondaryPalette.darkGreen,
              backgroundColor: getInputBackgroundColor(confirmPassword),
              border: confirmPasswordError
                ? `1px solid ${appTheme.secondaryPalette.errorRed}`
                : 'none',
            }}
            placeholder={fmtMsg('confirmPassword')}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            onFocus={(e) => {
              e.target.style.backgroundColor = getInputBackgroundColor(confirmPassword);
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = getInputBackgroundColor(confirmPassword);
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
    </form>
  );
};
