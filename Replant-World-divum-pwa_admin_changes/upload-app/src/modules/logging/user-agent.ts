/// <reference types="user-agent-data-types" />

import { UAParser } from 'ua-parser-js';
import { UserAgent } from './types';

const uaParsed = UAParser();

const clientHints = window.navigator.userAgentData?.getHighEntropyValues([
  'model',
  'platformVersion',
]);

const buildUserAgent = async () => {
  const result: UserAgent = {
    browser: uaParsed.browser.name,
    browser_version: uaParsed.browser.version,
    device: uaParsed.device.model || 'unknown',
    os: uaParsed.os.name,
    os_version: uaParsed.os.version?.split('.')[0], // only major release
    user_agent: uaParsed.ua,
  };
  if (
    clientHints &&
    result.device === 'K' &&
    result.os === 'Android' &&
    result.os_version === '10'
  ) {
    const { model, platformVersion } = await clientHints;
    result.device = model;
    result.os_version = platformVersion?.split('.')[0]; // only major release
  }
  return result;
};

const userAgent = buildUserAgent();

export const getUserAgent = () => userAgent;
