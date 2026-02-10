import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ta from './locales/ta.json';
import hi from './locales/hi.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import zh from './locales/zh.json';
import ar from './locales/ar.json';

const resources = {
    en: { translation: en },
    ta: { translation: ta },
    hi: { translation: hi },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de },
    zh: { translation: zh },
    ar: { translation: ar }
};

const storedLanguage = typeof localStorage !== 'undefined' ? localStorage.getItem('language') : null;
const initialLanguage = storedLanguage || 'en';

i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false
    }
});

export default i18n;