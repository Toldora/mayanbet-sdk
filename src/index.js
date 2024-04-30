import queryString from 'query-string';

import '@/plugins';
import '@/styles/index.scss';

export * from '@/api';
export * from '@/const';
export * from '@/entities';
export * from '@/utils';

const searchString = queryString.parse(window.location.search);

if (searchString.debug) {
  debugger;
}
