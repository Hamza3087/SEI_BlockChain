import { Country } from 'modules/countries';

export type LoginPayload = {
  password: string;
  username: string;
};

export type LoginError = {
  non_field_errors?: string[];
};

export type LoginResponse = { username: string };

export type RegisterPayload = {
  username: string;
  phone_number: string;
  country: number;
  password: string;
};

export type RegisterError = {
  username?: string[];
  phone_number?: string[];
  country?: string[];
  password?: string[];
  details?: string[];
};

export type RegisterResponse = {
  username: string;
  phone_number: string;
  country: number;
};

export type RegisterIntoOrganizationError = RegisterError & {
  code?: string[];
};

export type RegisteredOrganizationResponse = {
  planting_organization: {
    name: string;
    countries: Country[];
  };
};

export type RegisteredOrganizationError = {
  non_field_errors?: string[];
};

export type ResetPasswordPayload = {
  password: string;
  token: string;
  uid: string;
};

export type ResetPasswordError = {
  password?: string[];
  token?: string[];
  uid?: string[];
};
