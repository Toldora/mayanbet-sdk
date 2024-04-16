import handlebars from 'handlebars';
import queryString from 'query-string';
import signUpFormTemplate from '@static/templates/sign-up-form.hbs?raw';
import {
  setToLS,
  prepareInputMask,
  generateId,
  generatePassword,
} from '@/utils';
import { registerUser, registerUserViaTelephone } from '@/api/registration';
import { sendMessage, validatePhone } from '@/api/wavix';
import { AUTH_FIELD, ERROR_MESSAGES_EN, ERROR_MESSAGES_PT } from '@/const';

export class SignUpForm {
  formRef = null;
  isValid = false;
  isTelAuthType = true;
  isVisiblePassword = false;
  isSubmitLoading = false;

  constructor({ formRef }) {
    this.formRef = formRef;

    prepareInputMask(this.formRef);

    [...this.formRef[AUTH_FIELD.authType]].forEach(radioRef => {
      radioRef.addEventListener('change', e =>
        this.onChangeAuthType.bind(this)(e),
      );
    });
    [
      this.formRef[AUTH_FIELD.tel],
      this.formRef[AUTH_FIELD.email],
      this.formRef[AUTH_FIELD.password],
    ].forEach(ref => {
      ref.addEventListener('input', this.onInput.bind(this));
    });
    this.formRef.agreeCheck.addEventListener(
      'change',
      this.onChangeCheckbox.bind(this),
    );
    this.formRef.addEventListener('submit', e => this.onSubmit.bind(this)(e));

    const hidePasswordBtnRefs = this.formRef.querySelectorAll(
      '.js-password-input-btn',
    );
    [...hidePasswordBtnRefs].forEach(ref => {
      ref.addEventListener('click', this.togglePasswordVisibility);
    });
  }

  validate() {
    const { tel, email, password, submitBtn, agreeCheck } = this.formRef;
    if (!email || !password || !agreeCheck || !submitBtn) return;

    let isValid = false;

    if (this.isTelAuthType) {
      const onlyNumbersRegex = new RegExp('\\d');
      isValid =
        onlyNumbersRegex.test(tel.value[tel.value.length - 1]) &&
        agreeCheck.checked;
    } else {
      isValid =
        email.validity.valid && password.validity.valid && agreeCheck.checked;
    }

    this.isValid = isValid;

    if (isValid) {
      submitBtn.classList.remove('app-button--disabled');
    } else {
      submitBtn.classList.add('app-button--disabled');
    }
  }

  onChangeAuthType(event) {
    const isTel = event.target.value === AUTH_FIELD.tel;

    this.isTelAuthType = isTel;

    if (isTel) {
      this.formRef.classList.remove('sign-up-form__form--auth-with-email');
      this.formRef.classList.add('sign-up-form__form--auth-with-tel');

      this.formRef[AUTH_FIELD.tel].required = true;
      [
        this.formRef[AUTH_FIELD.email],
        this.formRef[AUTH_FIELD.password],
      ].forEach(ref => {
        ref.required = false;
        ref.value = '';
      });
    } else {
      this.formRef.classList.remove('sign-up-form__form--auth-with-tel');
      this.formRef.classList.add('sign-up-form__form--auth-with-email');
      this.formRef[AUTH_FIELD.tel].required = false;
      [
        this.formRef[AUTH_FIELD.email],
        this.formRef[AUTH_FIELD.password],
      ].forEach(ref => {
        ref.required = true;
      });
      this.formRef[AUTH_FIELD.tel].value = '';
    }

    const errorRef = this.formRef.querySelector('.js-auth-error');
    errorRef.classList.remove('visible');

    this.validate();
  }

  onInput = () => {
    this.validate();
  };

  onChangeCheckbox = () => {
    this.validate();
  };

  onSubmit = async event => {
    event.preventDefault();

    const searchString = queryString.parse(window.location.search);

    try {
      if (!this.isValid || this.isSubmitLoading) return;

      this.isSubmitLoading = true;
      this.formRef.fieldset.disabled = true;
      this.formRef.submitBtn.classList.add('loading');

      const defaultBody = {
        nickname: generateId(),
        currency: 'BRL',
        country: 'BR',
        affiliateTag: searchString.click_id ?? '',
        bonusCode: searchString.bonus_code ?? '',
      };

      let responseData = null;

      if (this.isTelAuthType) {
        const rawPhone = this.formRef[AUTH_FIELD.tel].value;
        const phone = `55${rawPhone}`;
        // // Remove all characters except numbers
        // const phone = rawPhone.replace(/[^\d]/g, '');

        const { valid } = await validatePhone(phone);

        if (!valid) {
          throw new Error(ERROR_MESSAGES_PT.invalidPhone);
        }

        const password = generatePassword();

        const body = {
          ...defaultBody,
          phone,
          password,
        };

        responseData = (await registerUserViaTelephone(body)).data;

        const smsData = {
          from: '551151181700',
          to: `+${phone}`,
          message_body: {
            text: `Sua nova senha no Mayan.bet é: ${password}`,
            media: [null],
          },
        };

        await sendMessage(smsData);
      } else {
        const body = {
          ...defaultBody,
          email: this.formRef[AUTH_FIELD.email].value,
          password: this.formRef[AUTH_FIELD.password].value,
        };

        responseData = (await registerUser(body)).data;
      }

      setToLS('isAlreadyRegistered', true);

      searchString.state = responseData?.autologinToken;
      const stringifiedSearch = queryString.stringify(searchString);

      window.location.replace(
        `${
          import.meta.env.VITE_REDIRECT_URL
        }/auth/autologin/?${stringifiedSearch}`,
      );
    } catch (error) {
      const errorMessages = [];

      if (error.response) {
        const validationErrors = error.response?.data?.error?.fields;
        if (validationErrors) {
          errorMessages.push(Object.values(validationErrors).flat());
        }
      } else {
        errorMessages.push([error.message]);
      }

      if (!errorMessages.length) {
        searchString['sign-up'] = true;
        const stringifiedSearch = queryString.stringify(searchString);

        window.location.replace(
          `${import.meta.env.VITE_REDIRECT_URL}/?${stringifiedSearch}`,
        );
        return;
      }

      const enMessageEntries = Object.entries(ERROR_MESSAGES_EN);
      const translations = errorMessages.map(([message]) => {
        const errorKey = enMessageEntries.find(
          ([, value]) => message === value,
        );
        return errorKey?.[0] ? ERROR_MESSAGES_PT[errorKey[0]] : message;
      });

      const errorRef = this.formRef.querySelector('.js-auth-error');
      errorRef.innerHTML = translations.join('<br/>');
      errorRef.classList.add('visible');
    } finally {
      this.isSubmitLoading = false;
      if (this.formRef.fieldset) {
        this.formRef.fieldset.disabled = false;
      }
      if (this.formRef.submitBtn) {
        this.formRef.submitBtn.classList.remove('loading');
      }
    }
  };

  togglePasswordVisibility() {
    if (this.isVisiblePassword) {
      this.classList.add('sign-up-form__password-input-btn--pass-hidden');
      this.previousElementSibling.type = 'password';
    } else {
      this.classList.remove('sign-up-form__password-input-btn--pass-hidden');
      this.previousElementSibling.type = 'text';
    }
    this.isVisiblePassword = !this.isVisiblePassword;
  }
}

export const compileSignUpFormMarkup = (options = {}) => {
  return handlebars.compile(signUpFormTemplate)(options);
};
