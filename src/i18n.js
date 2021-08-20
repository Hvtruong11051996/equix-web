import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import ChainedBackend from 'i18next-chained-backend'
// import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { reactI18nextModule } from 'react-i18next'
import dataStorage from './dataStorage'
import { addVerUrl } from './helper/functionUtils'
import config from '../public/config'

i18n
    .use(ChainedBackend)
    .use(LanguageDetector)
    .use(reactI18nextModule)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'cn', 'vi'],
        // have a common namespace used around the full app
        debug: true,
        interpolation: {
            escapeValue: false // not needed for react!!
        },
        react: {
            wait: true
        },
        backend: {
            backends: [Backend, Backend],
            backendOptions: [
                {
                    loadPath: addVerUrl(`${config.storageUrl}/{{lng}}.json?alt=media`)
                }
            ]
        }
    }, (e, t) => {
        dataStorage.translate = t
    })
export default i18n;
