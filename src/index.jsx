import GoldenLayoutWrapper from './components/GoldenLayoutWrapper';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import { exception } from 'react-ga';
import config from '../public/config'
import './i18n';
// import css
import '../css/base.css';
import '../css/fontSize.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-dark.css';
import '../css/main.css';
import '../css/theme-grid.css';
import '../css/theme-single.css';
import '../css/json-schema.css';
import '../css/form.css';
// import '../css/bootstrap.min.css';
import logger from './helper/log';
import dataStorage from './dataStorage';
import { getData } from './helper/request';
import 'native-scroll'
import Lang from './components/Inc/Lang'
import { getStorageUrl } from './helper/functionUtils'

let lastTheme = 'theme-dark';
let lastEnv = 'dev1';
dataStorage.isTest = location.search.match(/^\?test/);
dataStorage.isIntervalRealtime = location.search.match(/^\?interval/);
if (dataStorage.isIntervalRealtime) {
    dataStorage.timeInterval = Number(location.search.replace('?interval=', ''));
}
const getTextError = (obj) => {
    let stringReturn = '';
    if (typeof obj === 'object') {
        stringReturn += ` ${(function (obj) {
            try {
                const seen = [];
                return JSON.stringify(obj, function (key, val) {
                    if (val != null && typeof val === 'object') {
                        if (seen.indexOf(val) >= 0) {
                            return;
                        }
                        seen.push(val);
                    }
                    return val;
                });
            } catch (e) {
                return 'can not log here';
            }
        })(obj)}`;
    } else if (typeof obj === 'string') {
        stringReturn = ` ${obj}`
    }
    return stringReturn;
}

const store = configureStore();
if (dataStorage.checkUpdate) {
    const { whyDidYouUpdate } = require('why-did-you-update')
    whyDidYouUpdate(React)
}

const MaintainScreen = (props) => {
    const env = dataStorage.web_config.common.project
    return <div className={`loadingMainScreen`}
        style={{
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundImage: `url(${dataStorage.web_config[env].branding.background})`
        }}>
        <img className='loading_logo' src={dataStorage.web_config[env].branding.logo} />
        <img src='common/Spinner-white.svg' width='26px' height='26px' style={{ padding: 32 }} />
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            maxWidth: 600,
            padding: '0 64px',
            textAlign: 'center'
        }}><Lang>lang_update_system_demo</Lang></div>
    </div>
}

const initWeb = () => {
    const isMaintain = dataStorage.web_config.common.maintain
    ReactDOM.render(
        isMaintain ? <MaintainScreen /> : <Provider store={store}>
            <GoldenLayoutWrapper />
        </Provider>
        , document.getElementById('root')
    );
}

fetch(`${config.storageUrl}/web.json?alt=media&${window.ver}`)
    .then(response => response.json())
    .then((configWeb) => {
        dataStorage.web_config = configWeb;
        const enviroment = configWeb.common.project
        lastEnv = localStorage.getItem('lastEnv')
        if (enviroment && lastEnv !== enviroment) {
            lastEnv = enviroment
            localStorage.setItem('lastEnv', enviroment)
            localStorage.removeItem('isStayLogin')
        }
        var cssId = 'myCss';
        lastTheme = localStorage.getItem('lastTheme') || 'theme-dark'
        dataStorage.theme = lastTheme;
        if (!document.getElementById(cssId)) {
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = getStorageUrl(`${lastTheme}.css`)
            link.media = 'all';
            head.appendChild(link);
            if (lastTheme === 'theme-light') {
                document.body.classList.add('theme-light')
            } else {
                document.body.classList.remove('theme-light')
            }
        }
        if (console) {
            var cssRule =
                'color: rgb(249, 162, 34);' +
                'font-size: 60px;' +
                'font-weight: bold;' +
                'text-shadow: 1px 1px 5px rgb(249, 162, 34);' +
                'filter: dropshadow(color=rgb(249, 162, 34), offx=1, offy=1);';
            console.log('%cSTOP!', cssRule);

            window.localStorageNew = {};
            dataStorage.local = {};
            Object.keys(localStorage).map(key => {
                dataStorage.local[key] = localStorage[key];
            });
            localStorageNew.clear = () => {
                dataStorage.local = {};
                localStorage.clear()
            };
            localStorageNew.removeItem = (key, isNotOverride) => {
                let newKey = key;
                if (!key.includes('newUniqueKey_') && !isNotOverride) {
                    const email = dataStorage.loginEmail;
                    newKey = 'newUniqueKey' + '_' + email + '_' + enviroment + '_' + key;
                }
                delete dataStorage.local[newKey];
                localStorage.removeItem(newKey);
            }
            localStorageNew.setItem = (key, val, isNotOverride) => {
                let newKey = key;
                if (!key.includes('newUniqueKey_') && !isNotOverride) {
                    const email = dataStorage.loginEmail;
                    newKey = 'newUniqueKey' + '_' + email + '_' + enviroment + '_' + key;
                    delete dataStorage.local[key];
                    localStorage.removeItem(key);
                }
                dataStorage.local[newKey] = val;
                localStorage.setItem(newKey, val)
            }
            localStorageNew.getItem = (key, isNotOverride) => {
                if (isNotOverride) {
                    return dataStorage.local[key];
                }
                let newKey = key;
                const email = dataStorage.loginEmail;
                const newKey2 = 'newUniqueKey' + '_' + email + '_' + enviroment + '_' + key;
                const newValue = dataStorage.local[newKey2];
                if (newValue) return newValue !== 'null' ? newValue : null;
                if (!key.includes('newUniqueKey_') && !isNotOverride) {
                    let value = dataStorage.local[key];
                    if (value === 'null') value = null;
                    newKey = newKey2;
                    dataStorage.local[newKey2] = value;
                    localStorage.setItem(newKey, value);
                    delete dataStorage.local[key];
                    localStorage.removeItem(key);
                }
                return dataStorage.local[newKey] !== 'null' ? dataStorage.local[newKey] : null
            }
            const errorConsole = console.error;
            console.error = (...arg) => {
                let stringReturn = 'Exception Error: '
                if (Array.isArray(arg)) {
                    for (let index = 0; index < arg.length; index++) {
                        const element = arg[index];
                        stringReturn += getTextError(element);
                    }
                } else {
                    stringReturn += getTextError(arg);
                }
                // logger.error(
                exception({
                    description: stringReturn,
                    fatal: true
                });
                logger.sendLogError(stringReturn);
                errorConsole && errorConsole(...arg);
            }
        }
        const style = getComputedStyle(document.body);
        (async () => {
            while (!style.getPropertyValue('--background')) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            initWeb();
        })()
    }).catch(e => {
        logger.sendLogError('cannot load web.json file');
    })
