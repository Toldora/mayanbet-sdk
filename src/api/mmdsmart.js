import { mmdsmartApi } from './instance';

const sendMessageMMD = async messageFormData => {
  const response = await mmdsmartApi.post('/sms', {
    api_key: import.meta.env.VITE_MMDSMART_API_KEY,
    from: 'MayanBet',
    ...messageFormData,
  });
  return response.data;
};

export { sendMessageMMD };
