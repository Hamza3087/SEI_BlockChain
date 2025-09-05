import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom close button for toasts
const CloseButton = () => {
  return (
    <span
      className='btn-trigger toast-close-button'
      role='button'
    >
      <i className='ni ni-cross'></i>
    </span>
  );
};

// Default toast options
const defaultOptions = {
  position: 'top-center',
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: false,
  closeButton: <CloseButton />
};

// Toast service functions
export const showToast = {
  success: (message, options = {}) => {
    return toast.success(message, { ...defaultOptions, ...options });
  },
  error: (message, options = {}) => {
    return toast.error(message, { ...defaultOptions, ...options });
  },
  info: (message, options = {}) => {
    return toast.info(message, { ...defaultOptions, ...options });
  },
  warning: (message, options = {}) => {
    return toast.warning(message, { ...defaultOptions, ...options });
  }
};

// The actual Toast component to be included once in your app
const ToastNotification = () => {
  return <ToastContainer />;
};

export default ToastNotification;
