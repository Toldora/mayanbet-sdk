import { validatePhoneApi } from '@/api';
import { ERROR_MESSAGES_AZ, ERROR_MESSAGES_PT, LOCALE } from '@/const';

export const validatePhone = async (phone, options = {}) => {
  const currentLocaleErrorMessages =
    options.locale === LOCALE.azerbaijan
      ? ERROR_MESSAGES_AZ
      : ERROR_MESSAGES_PT;

  try {
    // // Remove all characters except numbers
    // const phone = rawPhone.replace(/[^\d]/g, '');

    const { valid } = await validatePhoneApi(phone);

    if (!valid) {
      throw new Error(currentLocaleErrorMessages.invalidPhone);
    }
  } catch (error) {
    if (
      Object.values(currentLocaleErrorMessages).some(
        message => message === error.message,
      )
    ) {
      throw error;
    }
  }
};
