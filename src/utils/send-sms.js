import { sendMessageWavix, sendMessageMMD } from '@/api';

export const sendSms = async ({ phone, text }) => {
  try {
    const mmdData = {
      to: phone,
      text,
    };

    await sendMessageMMD(mmdData);
  } catch (error) {
    sendFallbackSms({ phone, text });
  }
};

export const sendFallbackSms = async ({ phone, text }) => {
  const wavixData = {
    from: 'mayanbet',
    to: `+${phone}`,
    message_body: {
      text,
      media: [null],
    },
  };

  sendMessageWavix(wavixData);
};
