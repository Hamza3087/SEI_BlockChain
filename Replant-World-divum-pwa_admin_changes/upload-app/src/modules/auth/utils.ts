import parsePhoneNumber from 'libphonenumber-js';

export const validatePassword = (password: string) =>
  /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);

export const validatePhoneNumber = (phoneNumber: string) => {
  const parseNumber = parsePhoneNumber(phoneNumber);
  return parseNumber?.isPossible() && parseNumber.isValid();
};
