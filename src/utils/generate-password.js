const CHARS = '0123456789';
const PASSWORD_LENGTH = 6;

export const generatePassword = (passwordLength = PASSWORD_LENGTH) => {
  let password = '';

  for (let i = 0; i < passwordLength; i += 1) {
    const randomNumber = Math.floor(Math.random() * CHARS.length);
    password += CHARS.substring(randomNumber, randomNumber + 1);
  }

  return password;
};
