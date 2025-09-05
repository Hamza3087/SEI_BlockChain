import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import {
  LOGIN_URL,
  LOGOUT_URL,
  LoginError,
  LoginPayload,
  LoginResponse,
  REGISTER_TO_ORGANIZATION_URL,
  RESET_PASSWORD_URL,
  RegisterIntoOrganizationError,
  RegisterPayload,
  RegisterResponse,
  RegisteredOrganizationError,
  RegisteredOrganizationResponse,
  ResetPasswordError,
  ResetPasswordPayload,
  getRegisteredOrganization,
  postLogin,
  postLogout,
  postRegisterIntoOrganization,
  postResetPassowrd,
} from '.';

export const registeredOrganizationQueryKey = (code: string | null) => [
  'GET',
  REGISTER_TO_ORGANIZATION_URL,
  code,
];

export const useLoginMutation = () =>
  useMutation<
    AxiosResponse<LoginResponse>,
    AxiosError<LoginError>,
    LoginPayload
  >({
    mutationKey: ['POST', LOGIN_URL],
    mutationFn: postLogin,
  });

export const useLogoutMutation = () =>
  useMutation<
    AxiosResponse<Record<string, never>>,
    AxiosError<{ detail: string }>,
    Record<string, never>
  >({
    mutationKey: ['POST', LOGOUT_URL],
    mutationFn: postLogout,
  });

export const useRegisterIntoOrganizationMutation = (code: string) => {
  const mutation = useMutation<
    AxiosResponse<RegisterResponse>,
    AxiosError<RegisterIntoOrganizationError>,
    RegisterPayload
  >({
    mutationFn: (payload) => postRegisterIntoOrganization(payload, code),
  });

  return mutation;
};

export const useRegisteredOrganization = (code: string | null) =>
  useQuery<
    RegisteredOrganizationResponse,
    AxiosError<RegisteredOrganizationError>
  >({
    queryKey: registeredOrganizationQueryKey(code),
    queryFn: () => getRegisteredOrganization(code!),
    enabled: !!code,
  });

export const useResetPasswordMutation = () =>
  useMutation<
    AxiosResponse<Record<string, never>>,
    AxiosError<ResetPasswordError>,
    ResetPasswordPayload
  >({
    mutationKey: ['POST', RESET_PASSWORD_URL],
    mutationFn: postResetPassowrd,
  });
