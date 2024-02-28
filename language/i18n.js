import { I18n } from 'i18n-js';

const i18n = new I18n();
i18n.translations = {
    en: require('./en.json'),
    zh: require('./zh.json'),
    my: require('./my.json'),
}

i18n.fallbacks = true;
i18n.defaultLocale = "en";
i18n.locale = "en";
export default i18n;

