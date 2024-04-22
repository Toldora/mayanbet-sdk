import axios from 'axios';

export const turboApi = axios.create({
  baseURL: process.env.VITE_API_URL,
});

export const wavixApi = axios.create({
  baseURL: process.env.VITE_WAVIX_API_URL,
});
