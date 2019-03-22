'use strict';

import { request } from './base-request';

var DEFAULT_HOST = 'accounts.spotify.com',
  DEFAULT_PORT = 443,
  DEFAULT_SCHEME = 'https';

export function builder() {
  return builder()
    .withHost(DEFAULT_HOST)
    .withPort(DEFAULT_PORT)
    .withScheme(DEFAULT_SCHEME);
}