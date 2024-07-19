import handlebars from 'handlebars';
import svgIconTemplate from '@static/templates/svg-icon.hbs?raw';
import authTypeRadioBrTemplate from '@static/templates/br/auth-type-radio-br.hbs?raw';
import authTypeRadioAzTemplate from '@static/templates/az/auth-type-radio-az.hbs?raw';

handlebars.registerPartial('svg-icon', svgIconTemplate);
handlebars.registerPartial('auth-type-radio-br', authTypeRadioBrTemplate);
handlebars.registerPartial('auth-type-radio-az', authTypeRadioAzTemplate);

handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper('isGreaterOrEqual', function (arg1, arg2, options) {
  return arg1 >= arg2 ? options.fn(this) : options.inverse(this);
});
