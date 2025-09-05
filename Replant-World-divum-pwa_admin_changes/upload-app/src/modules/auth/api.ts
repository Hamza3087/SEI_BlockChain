import { get, post } from 'modules/api';
import {
  LoginPayload,
  LoginResponse,
  RegisterError,
  RegisterIntoOrganizationError,
  RegisterPayload,
  RegisterResponse,
  RegisteredOrganizationError,
  RegisteredOrganizationResponse,
  ResetPasswordPayload,
} from '.';

export const LOGIN_URL = '/auth/login';
export const LOGOUT_URL = '/auth/logout';
export const REGISTER_TO_ORGANIZATION_URL =
  '/auth/register-to-organization/{code}';
export const RESET_PASSWORD_URL = '/auth/reset-password';

export const getRegisteredOrganization = async (code: string) => {
  const response = await get<RegisteredOrganizationResponse>(
    REGISTER_TO_ORGANIZATION_URL.replace('{code}', `${code}`)
  );
  return response.data;
};

export const postLogin = (payload: LoginPayload) =>
  post<LoginResponse, LoginPayload>(LOGIN_URL, payload);

export const postLogout = () =>
  post<Record<string, never>, Record<string, never>>(LOGOUT_URL);

export const postRegisterIntoOrganization = (
  payload: RegisterPayload,
  code: string
) =>
  post<RegisterResponse, RegisterPayload>(
    REGISTER_TO_ORGANIZATION_URL.replace('{code}', `${code}`),
    payload
  );

export const postResetPassowrd = (payload: ResetPasswordPayload) =>
  post<Record<string, never>, ResetPasswordPayload>(
    RESET_PASSWORD_URL,
    payload
  );

export const phoneNumberIsNotValid = (
  errResponseData?: RegisterError | RegisterIntoOrganizationError
) => {
  for (const err of errResponseData?.phone_number || []) {
    const match = err.match(PHONE_NUMBER_IS_NOT_VALID);
    if (match) {
      return match;
    }
  }
  return undefined;
};

export const passwordIsTooSimilarToUsername = (
  errResponseData?: RegisterError | RegisterIntoOrganizationError
) => {
  for (const err of errResponseData?.password || []) {
    const match = err.match(PASSWORD_IS_TOO_SIMILAR_TO_USERNAME);
    if (match) {
      return match;
    }
  }
  return undefined;
};

export const enterValidUsername = (
  errResponseData?: RegisterError | RegisterIntoOrganizationError
) => {
  for (const err of errResponseData?.username || []) {
    const match = err.match(ENTER_VALID_USERNAME);
    if (match) {
      return match;
    }
  }
  return undefined;
};

export const registrationLinkExpired = (
  errResponseData?: RegisteredOrganizationError
) => {
  for (const err of errResponseData?.non_field_errors || []) {
    const match = err.match(CODE_HAS_EXPIRED);
    if (match) {
      return match;
    }
  }
  return undefined;
};

const PHONE_NUMBER_IS_NOT_VALID = 'The phone number entered is not valid.';
const PASSWORD_IS_TOO_SIMILAR_TO_USERNAME =
  'The password is too similar to the username.';
const ENTER_VALID_USERNAME = `Enter a valid username. This value may contain only letters, numbers, and @/./+/-/_ characters.`;
const CODE_HAS_EXPIRED = 'The code has expired.';
