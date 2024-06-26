import axios from 'axios';

export const turboApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const wavixApi = axios.create({
  baseURL: import.meta.env.VITE_WAVIX_API_URL,
});

export const zerobounceApi = axios.create({
  baseURL: import.meta.env.VITE_ZEROBOUNCE_API_URL,
});

export const mmdsmartApi = axios.create({
  baseURL: import.meta.env.VITE_MMDSMART_API_URL,
});
