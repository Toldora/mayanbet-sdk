import { zerobounceApi } from './instance';

const validateEmail = async email => {
  const response = await zerobounceApi.get(
    `/validate?api_key=${
      import.meta.env.VITE_ZEROBOUNCE_API_KEY
    }&email=${email}`,
  );
  return response.data;
};

export { validateEmail };
