import user from '@/assets/user.svg';
import passWord from '@/assets/password.svg';
import eyeInvisible from '@/assets/eye-invisible.svg';
import eyeVisible from '@/assets/eye-visible.svg';
import rememberMeChecked from '@/assets/remember-me-checked.svg';
import rememberMeUnchecked from '@/assets/circle-blank.svg';
import loginBackGround from '@/assets/splash-screen.jpg';
import logo from '@/assets/logo.svg';
import { appTheme } from 'plugins/appTheme';
import React, { useState } from 'react';

export const LoginFields: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
  };
  return (
    <div className='flex items-center justify-center w-screen'>
      <div className='relative w-full max-w-md h-dvh overflow-hidden'>
        {/* //Background Page */}

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
              className='absolute top-8 left-4 m-4 w-12 h-12 object-contain z-10'
            />
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
                Welcome Back
              </h1>
              <p
                className='text-[0.8125rem] font-semibold'
                style={{
                  color: appTheme.secondaryPalette.silverSand,
                }}
              >
                Login with Replant World
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Username field */}
              <div className='mb-4'>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <span className=''>
                      <img src={user} alt='User' className='h-4 w-4' />
                    </span>
                  </div>
                  <input
                    type='text'
                    id='username'
                    className='text-sm rounded-lg block w-full pl-10 p-2.5 border-none focus:outline-none'
                    style={{
                      color: appTheme.secondaryPalette.darkGreen,
                      backgroundColor: appTheme.secondaryPalette.paleGreen,
                    }}
                    placeholder='Username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className='mb-4'>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <span className=''>
                      <img src={passWord} alt='Password' className='h-4 w-4' />
                    </span>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id='password'
                    className='text-sm rounded-lg block w-full pl-10 pr-10 p-2.5 border-none focus:outline-none'
                    style={{
                      color: appTheme.secondaryPalette.darkGreen,
                      backgroundColor: appTheme.secondaryPalette.paleGreen,
                    }}
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <button
                      type='button'
                      className='text-gray-500 focus:outline-none'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <img
                          alt='Eye Visible'
                          src={eyeVisible}
                          className='h-4 w-4'
                        />
                      ) : (
                        <img
                          alt='Eye Invisible'
                          src={eyeInvisible}
                          className='h-4 w-4'
                        />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember me and Forgot Password */}
              <div className='flex justify-between items-center mb-6'>
                <div className='flex items-center'>
                  <img
                    src={rememberMe ? rememberMeChecked : rememberMeUnchecked}
                    alt='Remember Me'
                    className='w-5 h-5 cursor-pointer'
                    onClick={() => setRememberMe(!rememberMe)}
                  />
                  <label
                    htmlFor='remember-me'
                    className='ml-2 text-sm font-semibold'
                    style={{
                      color: appTheme.secondaryPalette.lightGray,
                    }}
                  >
                    Remember Me
                  </label>
                </div>
                <p
                  className='text-sm font-semibold cursor-pointer'
                  style={{
                    color: appTheme.secondaryPalette.darkForestGreen,
                  }}
                >
                  Forgot Password ?
                </p>
              </div>

              {/* Login button */}
              <button
                type='submit'
                className='w-full text-sm font-medium py-2.5 rounded-3xl focus:outline-none'
                style={{
                  color: appTheme.primaryPalette.white,
                  backgroundColor: appTheme.secondaryPalette.darkForestGreen,
                }}
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
