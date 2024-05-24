import { sendMessageWavix, sendMessageMMD } from '@/api';

export const sendSms = async ({ phone, text }) => {
  try {
    const wavixData = {
      from: 'mayanbet',
      to: `+${phone}`,
      message_body: {
        text,
        media: [null],
      },
    };

    await sendMessageWavix(wavixData);
  } catch (error) {
    sendMessageMMD({ phone, text });
  }
};

export const sendFallbackSms = async ({ phone, text }) => {
  const mmdData = {
    to: phone,
    text,
  };

  sendMessageMMD(mmdData);
};
