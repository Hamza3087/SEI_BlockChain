import { post } from 'modules/api';
import { HistoryEvent } from './types';

export const userHistoryUrl = '/user-history';

export type UserHistoryPayload = { history: HistoryEvent[] };

export type UserHistoryResponse = Record<string, never>;

export type UserHistoryError = object;

export const postUserHistory = (payload: UserHistoryPayload) =>
  post<UserHistoryResponse, UserHistoryPayload>(userHistoryUrl, payload);
