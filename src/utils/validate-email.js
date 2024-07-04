import { validateEmailApi } from '@/api';
import { EMAIL_VALIDATION_VALID_STATUSES, ERROR_MESSAGES_PT } from '@/const';

export const validateEmail = async email => {
  try {
    // // Code plus character for query param
    const codedEmail = email.replace(/\+/g, '%2B');

    const { status, error } = await validateEmailApi(codedEmail);

    if (error) return;

    if (!EMAIL_VALIDATION_VALID_STATUSES[status?.toLowerCase()]) {
      throw new Error(ERROR_MESSAGES_PT.invalidEmail);
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
