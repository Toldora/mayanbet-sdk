import handlebars from 'handlebars';
import queryString from 'query-string';
import signUpFormBrTemplate from '@static/templates/br/sign-up-form-br.hbs?raw';
import signUpFormAzTemplate from '@static/templates/az/sign-up-form-az.hbs?raw';
import {
  prepareInputMask,
  generateId,
  // sendSms,
  validateEmail,
  validatePhone,
} from '@/utils';
import { registerUser, registerUserViaTelephone } from '@/api';
import {
  AUTH_FIELD,
  LOCALE,
  ERROR_MESSAGES_EN,
  ERROR_MESSAGES_PT,
} from '@/const';

export class SignUpForm {
  formRef = null;
  isValid = false;
  isTelAuthType = false;
  isVisiblePassword = false;
  isSubmitLoading = false;
  submitCallback = null;

  constructor({ formRef, submitCallback = null, redirectParams }) {
    this.formRef = formRef;
    this.submitCallback = submitCallback;
    this.isTelAuthType =
      this.formRef[AUTH_FIELD.authType]?.value === AUTH_FIELD.tel;

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
    this.formRef.addEventListener('submit', e =>
      this.onSubmit.bind(this)(e, redirectParams),
    );

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

    this.isValid =
      (this.isTelAuthType
        ? /\d/.test(tel.value[tel.value.length - 1])
        : email.validity.valid) &&
      password.validity.valid &&
      agreeCheck.checked;

    if (this.isValid) {
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

      this.formRef[AUTH_FIELD.email].required = false;
      this.formRef[AUTH_FIELD.email].value = '';
    } else {
      this.formRef.classList.remove('sign-up-form__form--auth-with-tel');
      this.formRef.classList.add('sign-up-form__form--auth-with-email');

      this.formRef[AUTH_FIELD.email].required = true;

      this.formRef[AUTH_FIELD.tel].required = false;
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

  onSubmit = async (event, redirectParams = {}) => {
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
        password: this.formRef[AUTH_FIELD.password].value,
      };

      let responseData = null;

      if (this.isTelAuthType) {
        const rawPhone = this.formRef[AUTH_FIELD.tel].value;
        const phone = `55${rawPhone}`;

        await validatePhone(phone);

        const body = {
          ...defaultBody,
          phone,
        };

        responseData = (await registerUserViaTelephone(body)).data;

        // await sendSms({
        //   phone,
        //   text: `Sua nova senha no Mayan.bet é: ${password}`,
        // });
      } else {
        const email = this.formRef[AUTH_FIELD.email].value;

        await validateEmail(email);

        const body = {
          ...defaultBody,
          email,
        };

        responseData = (await registerUser(body)).data;
      }

      await this.submitCallback?.();

      Object.entries(redirectParams).forEach(([key, value]) => {
        searchString[key] = value;
      });
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

      if (
        errorMessages.some(
          ([message]) =>
            message === ERROR_MESSAGES_EN.emailExist ||
            message === ERROR_MESSAGES_EN.phoneExist,
        )
      ) {
        searchString['wallet'] = 'deposit';
        searchString['sign-in'] = true;
        const stringifiedSearch = queryString.stringify(searchString);

        window.location.replace(
          `${import.meta.env.VITE_REDIRECT_URL}/?${stringifiedSearch}`,
        );
        return;
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
  const { locale = LOCALE.brazil } = options;

  switch (locale) {
    case LOCALE.brazil:
      return handlebars.compile(signUpFormBrTemplate)(options);

    case LOCALE.azerbaijan:
      return handlebars.compile(signUpFormAzTemplate)(options);

    default:
      return handlebars.compile(signUpFormBrTemplate)(options);
  }
};
