export type UserAgent = {
  browser?: string;
  browser_version?: string;
  device?: string;
  os?: string;
  os_version?: string;
  user_agent?: string;
};

type HistoryEventTypeEnum = 'LOCATION_FAILED' | 'LOCATION_SUCCEEDED';

export type HistoryEvent = {
  accuracy?: number;
  created_at: string;
  event_type: HistoryEventTypeEnum;
  error_name?: string;
  error_message?: string;
} & UserAgent;
