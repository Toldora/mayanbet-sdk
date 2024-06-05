import { validatePhoneApi } from '@/api';
import { ERROR_MESSAGES_PT } from '@/const';

export const validatePhone = async phone => {
  try {
    // // Remove all characters except numbers
    // const phone = rawPhone.replace(/[^\d]/g, '');

    const { valid } = await validatePhoneApi(phone);

    if (!valid) {
      throw new Error(ERROR_MESSAGES_PT.invalidPhone);
    }
  } catch (error) {
    if (
      Object.values(ERROR_MESSAGES_PT).some(
        message => message === error.message,
      )
    ) {
      throw error;
    }
  }
};
