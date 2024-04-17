import handlebars from 'handlebars';
import svgIconTemplate from '@static/templates/svg-icon.hbs?raw';
import authTypeRadioTemplate from '@static/templates/auth-type-radio.hbs?raw';

handlebars.registerPartial('svg-icon', svgIconTemplate);
handlebars.registerPartial('auth-type-radio', authTypeRadioTemplate);

handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper('isGreaterOrEqual', function (arg1, arg2, options) {
  return arg1 >= arg2 ? options.fn(this) : options.inverse(this);
});
