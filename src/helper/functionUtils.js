import config from '../../public/config';
import dataStorage from '../dataStorage';
import { getDateStringWithFormat } from '../helper/dateTime';
import NotiType from '../constants/noti_type';
import OrderType from '../constants/noti_order_type';
import orderStatus from '../constants/order_status';
import orderState from '../constants/order_state';
import origination from '../constants/origination';
import orderStateWebSV from '../constants/orderStateWebSV';
import actionStateWebSV from '../constants/actionStateWebSV';
import * as helper from '../helper/request';
import logger from '../helper/log';
import axios from 'axios';
import sessionTransaction from '../constants/sessionTransaction';
import moment from 'moment';
import Lang from '../components/Inc/Lang';
import UpdateSystem from '../components/Inc/Overlay/system';
import orderEnum from '../constants/order_enum';
import MapRoleComponent from '../constants/map_role_component';
import orderEnumNew from '../constants/order_enum_new';
import marketDataTypeEmums from '../constants/market_data_type';
import exchangeEnum from '../constants/exchange_enum';
import orderType from '../constants/order_type';
import { func } from '../storage';
import { emitter, eventEmitter } from '../constants/emitter_enum';
import formState from '../constants/form_state';
import { autoRefreshToken, postDecode, postRefreshWithoutPin, loginNew } from './api';
import { afterLogin } from '../helper/loginFunction';
import showModal from '../components/Inc/Modal';
import Pin from '../components/Pin';
import exchangeTradingMarketEnum from '../constants/exchange_trading_market_enum'
import role from '../constants/role';
import roleOrder from '../constants/role_order';
import userRoles from '../constants/user_roles';
import userTypeEnum from '../constants/user_type_enum';
import CryptoJS from 'react-native-crypto-js';
import uuidv4 from 'uuid/v4';
import sideEnum from '../constants/enum';
import env from '../constants/enviroments';
import Color from '../constants/color';
import requestWorker from '../workers/request';
import Workers from '../workers';
import NoTag from '../components/Inc/NoTag/NoTag';
import { MAPPING_MONTHS } from '../components/SecurityDetail/constances';
import warning from '../components/Inc/Warning';
import confirm from '../components/Inc/Confirm';
import ContextMenu from '../components/ContextMenu'
import MarketDataAgreementPopup from '../components/MarketDataAgreementPopup';
import { MARKETASTATUS } from '../components/Inc/CanvasGrid/Type/marketData';
import { dispatchEvent, EVENTNAME } from './event';
import { regisRealtime as regisRealtimePrice, unregisRealtime as unregisRealtimePrice } from './streamingSubscriber'
import { regisRealtime, unregisRealtime } from '../streaming'
import { marketDataType } from './priceSource'
import { FIELD, ACCOUNT_STATUS, EKYC_STATUS, GOVID_STATUS, DOCUMENT_STATUS, DOCUMENT_TYPE } from '../components/OpeningAccount/constant';

const diffTime = {
    SECOND: 1000,
    MINUTE: 1000 * 60,
    HOUR: 1000 * 1 * 60,
    DAY: 1000 * 60 * 60 * 24
}
let timeoutAlert

const CancelToken = axios.CancelToken;
let cancel;
const TIMEOUT_CANCEL_REQUEST = 5000;

const t = dataStorage.translate;

const styleTheme = {
    'theme-light': {
        color: '#4a4a4a',
        background: '#F7F8FA',
        border: '#DADDE0',
        textColor: '#666666'
    },
    'theme-blue': {
        color: 'var(--secondary-default)',
        background: 'var(--secondary-default)'
    },
    'theme-dark': {
        color: 'var(--secondary-default)',
        background: 'var(--primary-light)',
        border: 'var(--primary-light)',
        textColor: 'var(--secondary-default)'
    }
}

const iconProductsMapping = {
    'equity': { label: 'equity', sign: 'eq', color: 'rgba(0, 184, 0, 0.7)' },
    'future': { label: 'futures', sign: 'fu', color: '#1d7cad' },
    'etf': { label: 'etf', sign: 'etf', color: '#f37022' },
    'mf': { label: 'managed funds', sign: 'mf', color: '#ba8221' },
    'warrant': { label: 'warrant', sign: 'wa', color: '#4c6a97' },
    'option': { label: 'option', sign: 'op', color: '#128d98' }
}

const EVENT_HUB = {
    REGISTER_REALTIME: 'register_realtime',
    UNREGISTER_REALTIME: 'unegister_realtime',
    OTHER_FROM_MAIN: 'other_from_main',
    OTHER_FROM_POPOUT: 'other_from_popout',
    RESET_TIMEOUT_REQUEST: 'resetTimeoutRequest'
}

export function getStorageUrl(path) { // to prevent cache
    return `${config.storageUrl}/${path}?alt=media&${window.ver}`
}

export function addVerUrl(url) { // to prevent cache
    if (url.includes('?')) return `${url}&${window.ver}`
    return `${url}?${window.ver}`
}

export function hideTooltip() {
    const tooltip = document.getElementById('tooltip')
    tooltip && (tooltip.style.opacity = 0)
}

export function IsJsonString(str) {
    let res
    try {
        res = JSON.parse(str);
    } catch (e) {
        return str;
    }
    return res;
}

export function readFileTerms(file, dom) {
    let env = dataStorage.web_config.common.project
    if (file === 'TermsAndConditions.md' && !dataStorage.web_config[env].roles.bannerStax) {
        const filePathByEnv = dataStorage.web_config[env].api.terms ? `${dataStorage.web_config[env].api.terms}/${file}` : `https://equix-static-assets.web.app/equix/terms/${file}`
        fetch(filePathByEnv).then(response => {
            const reader = response.body.getReader();
            return new ReadableStream({
                start(controller) {
                    function push() {
                        reader.read().then(({ done, value }) => {
                            if (done) {
                                controller.close();
                                return;
                            }
                            controller.enqueue(value);
                            push();
                        })
                    }
                    push();
                }
            });
        }).then(stream => {
            return new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text();
        }).then(result => {
            dom.innerHTML = marked(result)
        });
    } else {
        const readTextFile = (file) => {
            const rawFile = new XMLHttpRequest();
            rawFile.open('GET', `${file}?${config.version}`, false);
            rawFile.onreadystatechange = () => {
                if (rawFile.readyState === 4) {
                    if (rawFile.status === 200 || rawFile.status === 0) {
                        const allText = rawFile.responseText;
                        dom.innerHTML = marked(allText);
                    }
                }
            }
            rawFile.send(null);
        }
        const filePathByEnv = `/Terms/${dataStorage.web_config[dataStorage.web_config.common.project].roles.bannerStax ? 'stax' : 'dev1'}/${file}`
        readTextFile(filePathByEnv)
    }
}

export function translateByEnv(key) {
    const keyByEnv = `${key}_${dataStorage.env_config.env}`;
    const value = dataStorage.translate(key)
    const valueByEnv = keyByEnv && dataStorage.translate(keyByEnv)
    if (keyByEnv !== valueByEnv) return valueByEnv
    else return value
}

export function translateByEnvVariable(key, replaceKey, keyword) {
    const value = dataStorage.translate(key)
    const replaceValue = dataStorage.translate(replaceKey)
    return replaceValue ? value.replace(`##${keyword}##`, replaceValue) : value
}

export function isStreaming() {
    let type = marketDataTypeEmums.DELAYED
    if (dataStorage.env_config.roles.useNewMarketData) {
        type = (dataStorage.userInfo ? Math.max(...Object.values(dataStorage.marketDataType || {})) : marketDataTypeEmums.DELAYED)
    } else {
        type = (dataStorage.userInfo ? Math.max(dataStorage.userInfo.market_data_fu, dataStorage.userInfo.market_data_au, dataStorage.userInfo.market_data_us) : marketDataTypeEmums.DELAYED)
    }
    return type === marketDataTypeEmums.STREAMING
}

export function trimAll(str = '') {
    return str.replace(/\s+/g, ' ').trim()
}

export function checkShowOpeningAccount() {
    // return true
    const isNotOperator = dataStorage.userInfo && (![userTypeEnum.OPERATOR, userTypeEnum.ADVISOR].includes(dataStorage.userInfo.user_type))
    const listAccount = dataStorage.accounts || []
    const DONE_STATUS = ['active', 'inactive', 'closed']
    let isDoneCreateAccount = true
    for (let index = 0; index < listAccount.length; index++) {
        const element = listAccount[index];
        const status = (element.status + '').toLowerCase()
        if (!DONE_STATUS.includes(status)) {
            isDoneCreateAccount = false
            break
        }
    }
    return isNotOperator && isDoneCreateAccount && (!dataStorage.openingAccount || (dataStorage.openingAccount && (!dataStorage.openingAccount.account_status || dataStorage.openingAccount.account_status === ACCOUNT_STATUS.INACTIVE)))
}
export function checkShowOpeningAccountStax() {
    // return true
    const isNotOperator = dataStorage.userInfo && (![userTypeEnum.OPERATOR, userTypeEnum.ADVISOR].includes(dataStorage.userInfo.user_type))
    const listAccount = dataStorage.accounts || []
    const DONE_STATUS = ['active', 'inactive', 'closed']
    let isDoneCreateAccount = true
    for (let index = 0; index < listAccount.length; index++) {
        const element = listAccount[index];
        const status = (element.status + '').toLowerCase()
        if (!DONE_STATUS.includes(status)) {
            isDoneCreateAccount = false
            break
        }
    }
    return isNotOperator && isDoneCreateAccount && (!dataStorage.openingAccount || (dataStorage.openingAccount && (!dataStorage.openingAccount.account_status || ![ACCOUNT_STATUS.INACTIVE, ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.CLOSED].includes(dataStorage.openingAccount.account_status))))
}

export function getDataAddGovernmentId(data) {
    const isHaveToEdit = (data) => data[FIELD.EKYC_OVERALL_STATUS] === EKYC_STATUS.EKYC_IN_PROGRESS && data[FIELD.EKYC_GOVID_STATUS] === GOVID_STATUS.EKYC_IN_PROGRESS
    const isHaveToAdd = (data) => data[FIELD.EKYC_OVERALL_STATUS] === EKYC_STATUS.EKYC_IN_PROGRESS && [GOVID_STATUS.EKYC_VERIFIED, GOVID_STATUS.EKYC_VERIFIED_ADMINS, GOVID_STATUS.EKYC_VERIFIED_WITH_CHANGES, GOVID_STATUS.EKYC_LOCKED_OUT, GOVID_STATUS.EKYC_PENDING].includes(data[FIELD.EKYC_GOVID_STATUS])
    const isPendingDocument = (data) => data[FIELD.EKYC_DOCUMENT_STATUS] === DOCUMENT_STATUS.EKYC_PENDING
    const listApplicantGovernmentId = (data[FIELD.APPLICANT_DETAILS] || []).reduce((acc, cur) => {
        let isEdit = false
        let isAdd = false
        const obj = {
            [FIELD.EQUIX_ID]: data[FIELD.EQUIX_ID],
            [FIELD.APPLICANT_ID]: cur[FIELD.APPLICANT_ID],
            [FIELD.VERIFICATION_ID]: cur[FIELD.VERIFICATION_ID],
            [FIELD.TITLE]: cur[FIELD.TITLE],
            [FIELD.FIRST_NAME]: cur[FIELD.FIRST_NAME],
            [FIELD.MIDDLE_NAME]: cur[FIELD.MIDDLE_NAME],
            [FIELD.LAST_NAME]: cur[FIELD.LAST_NAME],
            [FIELD.DOB]: cur[FIELD.DOB],
            [FIELD.VERIFIED_DOCUMENTS]: [],
            [FIELD.PENDING_DOCUMENTS]: [],
            [FIELD.LOCKEDOUT_DOCUMENTS]: [],
            [FIELD.GOVERNMENT_ID]: [],
            [FIELD.EXISTED_DOCUMENTS]: {}
        }
        const govId = cur[FIELD.GOVERNMENT_ID] || []
        if (govId.length) {
            govId.map(e => {
                e[FIELD.TYPE_OF_DOCUMENT] = DOCUMENT_TYPE.GOVERNMENT_ID
                e[FIELD.EKYC_OVERALL_STATUS] = cur[FIELD.EKYC_OVERALL_STATUS]
                if ([GOVID_STATUS.EKYC_VERIFIED, GOVID_STATUS.EKYC_VERIFIED_ADMINS, GOVID_STATUS.EKYC_VERIFIED_WITH_CHANGES].includes(e[FIELD.EKYC_GOVID_STATUS])) {
                    obj[FIELD.VERIFIED_DOCUMENTS].push(e)
                    if (!obj[FIELD.EXISTED_DOCUMENTS][e[FIELD.GOVERNMENT_ID_TYPE]]) {
                        obj[FIELD.EXISTED_DOCUMENTS][e[FIELD.GOVERNMENT_ID_TYPE]] = true
                    }
                }
                if (e[FIELD.EKYC_GOVID_STATUS] === GOVID_STATUS.EKYC_LOCKED_OUT) {
                    obj[FIELD.LOCKEDOUT_DOCUMENTS].push(e)
                    if (!obj[FIELD.EXISTED_DOCUMENTS][e[FIELD.GOVERNMENT_ID_TYPE]]) {
                        obj[FIELD.EXISTED_DOCUMENTS][e[FIELD.GOVERNMENT_ID_TYPE]] = true
                    }
                }
                if (isHaveToEdit(e)) {
                    isEdit = true
                    obj[FIELD.GOVERNMENT_ID].push(e)
                }
                if (isHaveToAdd(e)) isAdd = true
            })
        } else {
            isAdd = true
        }
        const documents = cur[FIELD.UPLOADED_DOCUMENTS] || []
        documents.map(e => {
            e[FIELD.TYPE_OF_DOCUMENT] = DOCUMENT_TYPE.DOCUMENT
            if (e[FIELD.EKYC_DOCUMENT_STATUS] === DOCUMENT_STATUS.EKYC_VERIFIED_ADMINS) {
                obj[FIELD.VERIFIED_DOCUMENTS].push(e)
                if (!obj[FIELD.EXISTED_DOCUMENTS][e[FIELD.DOCUMENT_TYPE]]) {
                    obj[FIELD.EXISTED_DOCUMENTS][e[FIELD.DOCUMENT_TYPE]] = true
                }
            }
            if (isPendingDocument(e)) {
                obj[FIELD.PENDING_DOCUMENTS].push(e)
            }
        })
        if (!obj[FIELD.GOVERNMENT_ID].length && isAdd) obj[FIELD.GOVERNMENT_ID].push({})
        obj[FIELD.HAVE_TO_EDIT] = isEdit ? 'edit' : (isAdd ? 'add' : '')
        if (obj[FIELD.GOVERNMENT_ID].length || isAdd) acc.push(obj)
        return acc
    }, [])
    const listData = listApplicantGovernmentId.filter(e => e[FIELD.HAVE_TO_EDIT])
    return listData || []
}

export function capitalizeFirstLetter(string = '') {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export function getTextByTextClassName(text = '', className) {
    switch (className) {
        case 'text-uppercase': return text.toUpperCase()
        case 'text-lowercase': return text.toLowerCase()
        case 'text-normal': return text
        case 'text-capitalize':
        default: return text.toCapitalize()
    }
}

export function capitalizer(string = '') {
    if (typeof string !== 'string') return string // dom in dropdown
    const list = string.toLowerCase().split(' ').map(e => e && capitalizeFirstLetter(e))
    return list.join(' ')
}

export function uppercaser(string = '') {
    if (typeof string !== 'string') return string // dom in dropdown
    return string.toUpperCase()
}

export function checkValidDateInput(data, format = 'DD/MM/YYYY', limit, title, errorText) {
    if (format === 'MM/YYYY') {
        const listValue = (data + '').split('/')
        const month = parseInt(listValue[0])
        const year = parseInt(listValue[1])
        if (listValue.length !== 2 || !month || !year) return stringFormatVar(dataStorage.translate('lang_form_error_invalid'), dataStorage.translate(title))
        if (month > 12 || year < 1000) return stringFormatVar(dataStorage.translate('lang_form_error_invalid'), dataStorage.translate(title))
        if (limit !== null && limit !== undefined) {
            const timeStamp = new Date(`${month}/${1}/${year}`).getTime()
            const now = new Date()
            const limitTimeStamp = now.setFullYear(now.getFullYear() + parseInt(limit))
            if (limit < 0) {
                if (!timeStamp || timeStamp > limitTimeStamp) {
                    return errorText ? dataStorage.translate(errorText) : stringFormatVar(dataStorage.translate('lang_form_error_invalid'), dataStorage.translate(title))
                }
            } else {
                if (!timeStamp || timeStamp < limitTimeStamp) {
                    return errorText ? dataStorage.translate(errorText) : stringFormatVar(dataStorage.translate('lang_form_error_invalid'), dataStorage.translate(title))
                }
            }
        }
        return ''
    } else {
        let year = ''
        const listValue = (data + '').split('/')
        const day = parseInt(listValue[0])
        const month = parseInt(listValue[1])
        if (format === 'DD/MM/YY') year = parseInt(listValue[2]) + 2000
        else year = parseInt(listValue[2])
        if (listValue.length !== 3 || !day || !month || !year) return stringFormatVar(dataStorage.translate('lang_form_error_invalid'), dataStorage.translate(title))
        const isNamNhuan = (year) => {
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
        }
        const checkValidDate = (day, month, year) => {
            const timeStamp = new Date(`${month}/${day}/${year}`).getTime()
            if (month > 12 || year < 1000) return stringFormatVar(dataStorage.translate('lang_form_error_invalid'), dataStorage.translate(title))
            switch (month) {
                case 1: case 3: case 5: case 7: case 8: case 10: case 12:
                    if (day > 31) return stringFormatVar(dataStorage.translate('lang_form_error_invalid'), dataStorage.translate(title))
                    break
                case 2:
                    if (isNamNhuan(year)) {
                        if (day > 29) return stringFormatVar(dataStorage.translate('lang_form_error_invalid'), dataStorage.translate(title))
                    } else if (day > 28) return stringFormatVar(dataStorage.translate('lang_form_error_invalid'), dataStorage.translate(title))
                    break
                case 4: case 6: case 9: case 11:
                    if (day > 30) return stringFormatVar(dataStorage.translate('lang_form_error_invalid'), dataStorage.translate(title))
                    break
                default: return stringFormatVar(dataStorage.translate('lang_form_error_invalid'), dataStorage.translate(title))
            }
            if (limit !== null && limit !== undefined) {
                const now = new Date()
                const limitTimeStamp = now.setFullYear(now.getFullYear() + parseInt(limit))
                if (limit < 0) {
                    if (!timeStamp || timeStamp > limitTimeStamp) {
                        return errorText ? dataStorage.translate(errorText) : stringFormatVar(dataStorage.translate('lang_form_error_invalid'), dataStorage.translate(title))
                    }
                } else {
                    if (!timeStamp || timeStamp < limitTimeStamp) {
                        return errorText ? dataStorage.translate(errorText) : stringFormatVar(dataStorage.translate('lang_form_error_invalid'), dataStorage.translate(title))
                    }
                }
                return ''
            }
        }
        return checkValidDate(day, month, year)
    }
}

export function createRequestUpdate(data, value) {
    if (!checkRole(MapRoleComponent.EDIT_BUTTON_ALERT)) return
    if (timeoutAlert) clearTimeout(timeoutAlert);
    timeoutAlert = setTimeout(() => {
        const status = value ? 1 : 0
        const url = helper.getUrlAlert('?user_id=' + dataStorage.userInfo.user_id + '&alert_id=' + data.alert_id)
        helper.putData(url, { data: { status: status } }).then(res => {
            console.log('success')
        }).catch(e => {
            console.log('error: ', e)
        })
    }, 500);
}

export function getContentByEnvAndLang(content = '') {
    if (!content) return ''
    const COMPANY_DEFAULT = 'Quant Egde'
    const PRODUCT_DEFAULT = 'EQUIX'
    const companyName = dataStorage.translate('lang_config_company_name')
    const productName = dataStorage.translate('lang_config_product_name')
    const text = dataStorage.translate(content).replace(/##Company_Name##/g, companyName || COMPANY_DEFAULT)
        .replace(/##Product_Name##/g, productName || PRODUCT_DEFAULT)
    return text
}
export function isOneAccount() {
    return dataStorage.lstAccountCheck && dataStorage.lstAccountCheck.length <= 1
}

export function emitDataEventHub(data) {
    if (!dataStorage.goldenLayout.goldenLayout || !dataStorage.goldenLayout.goldenLayout.eventHub) return
    const type = isSubWindow() ? EVENT_HUB.OTHER_FROM_POPOUT : EVENT_HUB.OTHER_FROM_MAIN
    dataStorage.goldenLayout.goldenLayout.eventHub.emit(type, data)
}

export function isSubWindow() {
    // return false
    return window.isSubWindow
}
export function handleDataEventHub(data = {}) {
    Object.keys(data).forEach(key => {
        const value = data[key]
        switch (key) {
            case 'theme': setTheme(value)
                break
            case 'size': setFontSize(value)
                break
            case 'lang': setLanguage(value)
                break
            case 'logout': logout()
                break
            default: break
        }
    })
}

export function checkRequirePin() {
    dataStorage.goldenLayout && dataStorage.goldenLayout.goldenLayout && dataStorage.goldenLayout.goldenLayout.eventHub && dataStorage.goldenLayout.goldenLayout.eventHub.emit(EVENT_HUB.RESET_TIMEOUT_REQUEST)
}

export function resetTimeoutRequest() {
    if (dataStorage.timeoutPIN) clearTimeout(dataStorage.timeoutPIN)
    // dataStorage.requireTime = 0.2
    if (dataStorage.requireTime) {
        dataStorage.timeoutPIN = setTimeout(() => {
            helper.requirePin();
        }, dataStorage.requireTime * 60 * 1000)
    }
}

export function addEventHubListener() {
    if (isSubWindow()) {
        dataStorage.goldenLayout.goldenLayout.eventHub.on(EVENT_HUB.OTHER_FROM_MAIN, (obj) => {
            handleDataEventHub(obj)
        })
    } else {
        dataStorage.goldenLayout.goldenLayout.eventHub.on(EVENT_HUB.OTHER_FROM_POPOUT, (obj) => {
            handleDataEventHub(obj)
        })
        dataStorage.goldenLayout.goldenLayout.eventHub.on(EVENT_HUB.REGISTER_REALTIME, (obj) => {
            if (obj.isStreamingPrice) regisRealtimePrice(obj)
            else regisRealtime(obj)
        })
        dataStorage.goldenLayout.goldenLayout.eventHub.on(EVENT_HUB.UNREGISTER_REALTIME, (obj) => {
            if (obj.isStreamingPrice) unregisRealtimePrice(obj)
            else unregisRealtime(obj)
        })
        dataStorage.goldenLayout.goldenLayout.eventHub.on(EVENT_HUB.RESET_TIMEOUT_REQUEST, (data) => {
            setTimeout(() => {
                resetTimeoutRequest()
            }, 0)
        })
    }
}

export function addPopoutEventHubListener(obj = {}) {
    if (!isSubWindow() || !obj.url) return
    if (!dataStorage.goldenLayout || !dataStorage.goldenLayout.goldenLayout || !dataStorage.goldenLayout.goldenLayout.eventHub) return
    const cloneObj = { ...obj }
    cloneObj.callback = window.popoutId
    dataStorage.goldenLayout.goldenLayout.eventHub.emit(EVENT_HUB.REGISTER_REALTIME, cloneObj)
    dataStorage.goldenLayout.goldenLayout.eventHub.on(`${obj.url}`, (data) => {
        obj.callback && obj.callback(data)
    })
}

export function removePopoutEventHubListener(obj) {
    if (!isSubWindow()) return
    if (!dataStorage.goldenLayout || !dataStorage.goldenLayout.goldenLayout || !dataStorage.goldenLayout.goldenLayout.eventHub) return
    const cloneObj = { ...obj }
    cloneObj.callback = window.popoutId
    dataStorage.goldenLayout.goldenLayout.eventHub.emit(EVENT_HUB.UNREGISTER_REALTIME, cloneObj)
    dataStorage.goldenLayout.goldenLayout.eventHub.off(`${obj.url}`)
}

export function closeChartLayout() {
    Object.keys(dataStorage.closeChartLayout).forEach(key => {
        dataStorage.closeChartLayout[key] && dataStorage.closeChartLayout[key]()
    })
}

export function updateChartExchangeDisplay() {
    try {
        const refChartList = document.querySelectorAll('.TVChartContainer')
        for (let i = 0, len = refChartList.length; i < len; i++) {
            const refChart = refChartList[i];
            const contentDocument = refChart.firstChild && refChart.firstChild.contentDocument;
            const exchangeCells = contentDocument.querySelectorAll('.symbol-edit-popup .symbol-edit-popup-td.type')
            for (let j = 0, len2 = exchangeCells.length; j < len2; j++) {
                const excCell = exchangeCells[j];
                const content = excCell.innerText || '';
                const firstText = content.split('-')[0] || '';
                const cls = firstText.trim();
                ReactDOM.render((<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <div className='size--2 iconProduct'>{cls}</div>
                    <div className={`size--1 iconProductSign ${cls}_background`}>
                        {iconProductsMapping[cls].sign || ''}
                    </div>
                </div>), excCell)
            }
        }
    } catch (error) {
        logger.log(`Error while modifying exchange columns in search box modal: ${error}`)
    }
}

function red(color) {
    return parseInt(color.replace('#', '').slice(0, 2), 16)
}

function green(color) {
    return parseInt(color.replace('#', '').slice(2, 4), 16)
}

function blue(color) {
    return parseInt(color.replace('#', '').slice(4, 6), 16)
}

export function transparentBackgroundColorMixin(alpha, color) {
    return `rgba(${red(color)}, ${green(color)}, ${blue(color)}, ${alpha})`
}

export function createContextMenu() {
    let div = document.getElementById('popoutContextMenuCanvas');
    if (!div) {
        div = document.createElement('div');
        div.id = 'popoutContextMenuCanvas';
        // div.className = 'ag-theme-fresh';
        ReactDOM.render(<ContextMenu />, div)
        document.body.appendChild(div)
    }
}

export function removeQuickmenu() {
    let lstQmenu = document.getElementsByClassName('quickMenu');
    if (lstQmenu && lstQmenu.length) {
        lstQmenu = [...lstQmenu];
        lstQmenu.map((e, i) => {
            e && (e.innerHTML = '');
            e && e.parentNode.removeChild(e);
        })
    }
}

export function isJsonString(str) {
    let res = '';
    try {
        res = JSON.parse(str);
    } catch (e) {
        return false;
    }
    return res;
}

export function clearCurSessionPopup() {
    const isShow = localStorageNew.getItem('showed_session_popup')
    if (isShow === 'true') {
        dataStorage.goldenLayout.alertSession.classList.remove('show')
        localStorageNew.removeItem('showed_session_popup')
    }
}

export function parseNumber(num) {
    try {
        const res = Number(num);
        if (!isNaN(res)) return res;
        return 0;
    } catch (error) {
        return 0;
    }
}

export function getAnAccountInfo(accountId, cb) {
    if (!accountId) return;
    const url = helper.getUrlAnAccount(accountId)
    helper.getData(url).then(response => {
        const data = response && response.data && response.data[0]
        if (data) {
            data.account_id && (dataStorage.accountsObjDic[`${data.account_id}`] = data);
            cb && cb(data)
        }
    })
}

export function checkShowAccountSearch() {
    if (dataStorage.userInfo && dataStorage.userInfo.user_type === userTypeEnum.OPERATOR) return true;
    if (dataStorage.userInfo && dataStorage.userInfo.user_type === userTypeEnum.ADVISOR) return true;
    return dataStorage.lstAccountCheck && dataStorage.lstAccountCheck.length > 1
}

export function getPdf(url, cb) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + dataStorage.accessToken);
    // Now set response type
    xhr.responseType = 'arraybuffer';
    xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
            const blob = new Blob([xhr.response], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(blob)
            cb && cb(pdfUrl)
        }
        if (xhr.status >= 400) {
            cb && cb()
        }
    })
    xhr.send();
}
export function saveDataWhenChangeEnv() {
    const envConfig = dataStorage.env_config;
    dataStorage.currentEnv = envConfig.env;
    localStorageNew.setItem('current_env', envConfig.env, true);
}

export function setBranding() {
    const TITLE_DEFAULT = 'EQUIX'
    const isGuest = dataStorage.env_config.env === env.GUEST
    const notLoginTitle = dataStorage.translate('lang_config_guest_title') || TITLE_DEFAULT
    const isDemo = dataStorage.env_config.env === 'demo';
    const loginTitle = isDemo ? dataStorage.translate('lang_config_title_demo') : dataStorage.translate('lang_config_title') || TITLE_DEFAULT
    const title = isGuest ? (notLoginTitle || loginTitle) : loginTitle
    document.title = title
    const icon = document.querySelector("link[rel*='icon']")
    const fav = addVerUrl(dataStorage.web_config[dataStorage.web_config.common.project].branding.fav)
    if (fav && icon) {
        icon.href = fav
        icon.onerror = `this.href='/branding/fav/dev1.png`
    }
}

export function setEnvConfig(env) {
    try {
        if (!env) {
            logger.error(`env is empty`)
            return
        }
        if (dataStorage.env_config && dataStorage.env_config.env === env) return
        const webConfig = dataStorage.web_config || {};
        if (!webConfig) logger.sendLog(`${env} - CAN NOT GET WEB CONFIG`);
        const newEnv = webConfig[env]
        if (!newEnv) {
            logger.sendLog(`${env} - CAN NOT GET ENV CONFIG. CLEAR LOCAL STORAGE AND RELOAD THE WEB APP`);
            localStorageNew.clear();
            window.location.reload();
            return;
        } else {
            dataStorage.env_config = webConfig[env];
            setBranding();
            callInitFunc();
        }
    } catch (error) {
        logger.error(`exception when setEnvConfig`);
    }
}

export function callInitFunc() {
    for (let index = 0; index < dataStorage.listFunctionInit.length; index++) {
        const fnInit = dataStorage.listFunctionInit[index];
        fnInit();
    }
}

export function checkPassword(passwordValue, successCallback, errorCallback) {
    try {
        if (!passwordValue) return
        const email = dataStorage.loginEmail
        const password = passwordValue
        loginNew(email, password).then(response => {
            if (response && response.data && response.data.accessToken) {
                const token = response.data.accessToken;
                successCallback && successCallback(token);
            } else {
                errorCallback && errorCallback()
            }
        }).catch(response => {
            if (response.message) {
                errorCallback && errorCallback()
            }
        })
    } catch (error) {
        errorCallback && errorCallback()
        logger.error('checkPassword On ChangePAssword' + error)
    }
}

export function checkRoleWidget(widget, role, addOn, typeUser) {
    let show = false;
    if (dataStorage.userInfo && dataStorage.userInfo.user_type && typeUser && !typeUser.includes(dataStorage.userInfo.user_type)) {
        show = false;
    }
    if (addOn) {
        show = dataStorage.userInfo && dataStorage.userInfo.addon && dataStorage.userInfo.addon.includes(addOn)
    } else {
        if (Array.isArray(role)) {
            role.map(r => {
                if (checkRole(r, false)) show = true;
            });
        } else {
            show = checkRole(role);
        }
    }
    if (dataStorage.userInfo && dataStorage.userInfo.user_type === userTypeEnum.RETAIL && dataStorage.listMapping && Array.isArray(dataStorage.listMapping) && dataStorage.listMapping.length < 2) {
        if ((Array.isArray(role) && role.includes(MapRoleComponent.UserAccount)) ||
            role === MapRoleComponent.AllOrders ||
            role === MapRoleComponent.AllHoldings) {
            show = false
        }
    }
    if (role === MapRoleComponent.CreateUser && widget.state && widget.state.user_id) {
        // Phan biet dong mo 2 form DetailUser va CreateUser do dung chung 1 component UserDetail
        show = true
    }
    if (!show) {
        setTimeout(() => {
            if (dataStorage.goldenLayout) {
                const lst = dataStorage.goldenLayout.goldenLayout.root.getItemsByType('component');
                if (lst.length) {
                    const lstMatch = lst.filter(item => item.config === widget.props.glContainer._config);
                    if (lstMatch.length) {
                        lstMatch[0].parent.removeChild(lstMatch[0]);
                    }
                }
            }
        }, 500);
    }
}
export function checkRole(role, isAnd = true) {
    // return true
    if (Array.isArray(role)) {
        return isAnd ? (role.filter(r => checkRole(r)).length === role.length) : !!role.filter(r => checkRole(r)).length
    }
    if (typeof role === 'boolean') return role
    if (role === MapRoleComponent.DISABLE) return false
    if (!role || role === MapRoleComponent.ENABLE) return true;
    if (dataStorage.userInfo && dataStorage.userInfo.user_type === userTypeEnum.ADVISOR) {
        if (roleOrder.indexOf(role) > -1 && !dataStorage.accountInfo) {
            return false
        }
        if ([MapRoleComponent.SaxoClientsManagement,
        MapRoleComponent.UserManager,
        MapRoleComponent.UserGroupManagement,
        // MapRoleComponent.AccountManager,
        MapRoleComponent.BranchManagement,
        MapRoleComponent.MarketDataManagement
        ].indexOf(role) > -1) return false
    } else if (dataStorage.userInfo && dataStorage.userInfo.user_type === userTypeEnum.RETAIL) {
        if (roleOrder.indexOf(role) > -1 && !dataStorage.accountInfo) {
            return false
        }
        if ([MapRoleComponent.SaxoClientsManagement,
        MapRoleComponent.CreateUser,
        MapRoleComponent.UserManager,
        MapRoleComponent.UserGroupManagement,
        MapRoleComponent.AccountManager,
        MapRoleComponent.BranchManagement,
        MapRoleComponent.MarketDataManagement
        ].indexOf(role) > -1) return false
    }
    return !!userRoles[role];
}

export function genreNewName(name, lst) {
    if (!name || (typeof name !== 'string')) return;
    const reg = name.match(/ (\d+)$/);
    const replaceText = reg ? reg[1] : '';
    let originalName = replaceText ? name.replace(replaceText, '') : name;
    originalName = originalName.trim();
    const listLayoutName = Object.keys(lst).map(k => {
        if (lst[k] && lst[k].layout_name && typeof lst[k].layout_name === 'string') {
            return lst[k].layout_name
        }
    }).filter(name => name);
    let lstName = listLayoutName.reduce((res, name) => {
        const reg = new RegExp(/\s[^\s]+$/);
        const firstName = name && name.replace(reg, '');
        if (name && name.includes(originalName) && firstName && firstName.trim() === originalName) {
            res.push(name);
        }
        return res;
    }, []);
    let maxVersion = '';
    if (lstName && lstName.length > 1) {
        lstName = lstName.sort((a, b) => a.length - b.length || a.localeCompare(b));
        maxVersion = lstName[lstName.length - 1];
    } else if (lstName.length === 1) {
        maxVersion = lstName[0];
    } else if (lstName.length === 0) {
        maxVersion = name;
    }
    const regMax = maxVersion.match(/ (\d+)$/);
    const numMaxVersion = regMax ? parseInt(regMax[1]) : 0;
    const newName = originalName + ' ' + (numMaxVersion + 1) + '';
    logger.log('NEWNAME: ', newName);
    return newName;
}

export function stringFormat(str = '', obj = {}) {
    return str.replace(/##([^#]+)##/g, function (a, b) {
        return obj[b] || a;
    })
}

export function stringFormatVar() {
    const arg = arguments;
    return (arg[0] || '').replace(/\{(\d+)\}/g, (_a, b) => arg[b]);
}

export function logout(skipReload, showLoginForm) {
    emitDataEventHub({ logout: true })
    if (isSubWindow()) {
        window.close()
        return
    }
    logSignOut()
    localStorageNew.removeItem('isStayLogin', true)
    localStorageNew.removeItem('loginEmail')
    localStorageNew.removeItem('saveKey');
    localStorageNew.removeItem('last_session_id')
    localStorageNew.removeItem('showed_session_popup')
    localStorageNew.removeItem('session_id')
    localStorageNew.removeItem(`requiredTime_${dataStorage.loginEmail}`);
    localStorageNew.removeItem(`${dataStorage.loginEmail}_refresh_token`);
    dataStorage.loginEmail = null;
    dataStorage.isStayLogin = false;
    dataStorage.isSessionAnotherLogin = false
    dataStorage.accessToken = null;
    showLoginForm && localStorageNew.setItem('show_login_form', 'true')
    if (!skipReload) {
        window.location.reload();
    }
}

export function logSignOut() {
    const url = helper.getLogSignOutUrl()
    helper.postData(url, {}).then(() => {
        logger.log(`send log signout success`);
    }).catch(err => {
        logger.log(`send log signout failure`);
    })
}

export function checkTimeAgo(id) {
    if (id && typeof id === 'string') {
        id = moment(id).format('x');
        id = parseInt(id);
    }
    const nowTime = new Date().getTime();
    const diff = nowTime - id;
    if (diff >= diffTime.DAY) {
        return diffTime.DAY;
    } else if (diff >= diffTime.HOUR) {
        return diffTime.HOUR;
    } else return diffTime.MINUTE;
}

export function tranferDuration(duration) {
    switch (duration) {
        case 'GTC': return 'lang_good_till_cancelled';
        case 'FOK': return 'lang_fill_or_kill';
        case 'DAY': return 'lang_day_only';
        case 'IOC': return 'lang_immediate_or_cancel';
        case 'GTD': return 'lang_good_till_date';
        case 'FAK': return 'lang_fill_and_kill';
        default: return 'lang_good_till_cancelled';
    }
}

export async function getSecretKey(env = dataStorage.env_config) {
    if (!window.turnOnEncrypt) return;
    if (!dataStorage.session) dataStorage.session = {};
    if (dataStorage.session[env.env]) return;
    const sessionId = new Date().getTime() + '';
    await helper.postData(helper.getSessionUrl(sessionId, env)).then(res => {
        dataStorage.session[env.env] = res.data && res.data.data;
        dataStorage.session[env.env].id = sessionId;
        if (dataStorage.session[env.env]) {
            if (dataStorage.session[env.env].timeoutId) clearTimeout(dataStorage.session[env.env].timeoutId);
            dataStorage.session[env.env].timeoutId = setTimeout(() => {
                delete dataStorage.session[env.env];
            }, Number(dataStorage.session[env.env].time_expire - 1000))
        }
    }).catch(() => {
        dataStorage.session[env.env] = null;
    })
}

export function saveDataSetting(newObj, skipLog) {
    return new Promise((resolve, reject) => {
        const userId = dataStorage.userInfo && dataStorage.userInfo.user_id;
        if (userId) {
            let url = helper.getSettingUrl(userId, helper.method.put);
            if (skipLog) url += '?layout=auto';
            helper.putData(url, newObj).then(info => {
                logger.log(`save new setting success`);
                resolve(info);
            }).catch(error => {
                logger.log(`save new setting failured`);
                reject(error);
            })
        }
    })
}

export function getDataSetting() {
    return new Promise(async (resolve, reject) => {
        const userId = dataStorage.userInfo && dataStorage.userInfo.user_id;
        if (userId) {
            const url = helper.getSettingUrl(userId, helper.method.get);
            await helper.getData(url).then(data => {
                logger.log(`get setting success`);
                resolve(data);
            }).catch(error => {
                logger.log(`get setting failured: ${error}`);
                reject(error);
            })
        }
    })
}

export function getDataLayout(layoutId) {
    return new Promise(async (resolve, reject) => {
        const userId = dataStorage.userInfo && dataStorage.userInfo.user_id;
        const url = helper.getLayoutUrl(userId, layoutId);
        await helper.getData(url).then(data => {
            logger.log(`get data layout success`);
            resolve(data);
        }).catch(error => {
            logger.log(`get data layout failured: ${error}`);
            reject(error);
        })
    })
}

export function getAllLayout() {
    return new Promise(async (resolve, reject) => {
        const userId = dataStorage.userInfo && dataStorage.userInfo.user_id;
        const url = helper.getLayoutUrl(userId);
        await helper.getData(url).then(res => {
            logger.log(`get data layout success`);
            resolve(res);
        }).catch(error => {
            logger.log(`get data layout failured: ${error}`);
            reject(error);
        })
    })
}

export function updateDataLayout(layoutId, newObj) {
    return new Promise((resolve, reject) => {
        const userId = dataStorage.userInfo && dataStorage.userInfo.user_id;
        let url = helper.getLayoutUrl(userId, layoutId);
        helper.putData(url, { data: newObj }).then(info => {
            resolve(info);
        }).catch(error => {
            logger.log(`update layout failured`);
            reject(error);
        })
    })
}

export function deleteDataLayout(layoutId) {
    return new Promise((resolve, reject) => {
        const userId = dataStorage.userInfo && dataStorage.userInfo.user_id;
        let url = helper.getLayoutUrl(userId, layoutId);
        helper.deleteData(url).then(info => {
            logger.log(`delete layout success`);
            resolve(info);
        }).catch(error => {
            logger.log(`delete layout failured`);
            reject(error);
        })
    })
}

export function createNewLayout(newObj) {
    return new Promise((resolve, reject) => {
        const userId = dataStorage.userInfo && dataStorage.userInfo.user_id;
        let url = helper.getLayoutUrl(userId);
        helper.postData(url, { data: newObj }).then(info => {
            logger.log(`create new layout success`);
            resolve(info);
        }).catch(error => {
            logger.log(`create new layout failured`);
            reject(error);
        })
    })
}

export function getAccountInfo(accountId, cb) {
    if (dataStorage.accountsObjDic[accountId]) {
        cb && cb();
    } else {
        const url = helper.getUrlAnAccount(accountId);
        helper.getData(url).then(snap => {
            const accountInfo = snap.data && snap.data.length && snap.data[0] ? snap.data[0] : {};
            dataStorage.accountsObjDic[`${accountInfo.account_id}`] = accountInfo;
            cb && cb();
        })
    }
}

export function showMoneyFormatter(money, currency) {
    if (['USD', 'AUD'].indexOf(currency) > -1) {
        if (money === null || money === undefined || isNaN(money)) {
            return '--';
        }
        if (typeof money === 'string') {
            money = parseFloat(money);
        }
        if (isNaN(money)) return '--';
        if (money < 0) {
            return '-$' + `${formatNumberValue(Math.abs(money), true)}`
        } else {
            return '$' + `${formatNumberValue(money, true)}`
        }
    } else if (currency === 'VND') {
        if (money === null || money === undefined || isNaN(money)) {
            return '--';
        }
        if (typeof money === 'string') {
            money = parseFloat(money);
        }
        if (money < 0) {
            return '-' + `${formatNumberValue(Math.abs(money), true, false, currency)}`
        } else {
            return `${formatNumberValue(money, true, false, currency)}`
        }
    } else {
        if (money === null || money === undefined || isNaN(money)) {
            return '--';
        }
        if (typeof money === 'string') {
            money = parseFloat(money);
        }
        if (isNaN(money)) return '--';
        if (money < 0) {
            return '-' + `${formatNumberValue(Math.abs(money), true)}`
        } else {
            return '' + `${formatNumberValue(money, true)}`
        }
    }
}

export function getTimeOffsetUSA() {
    // EST
    const est = moment().utcOffset('-0500');
    const estDate = est.date();
    const estDay = est.day();
    const estMonth = est.month();
    const estHour = est.hour();
    const estMinute = est.minute();
    let sundaySecondMarch = null;
    if (estDate > 7 && estDate < 15 && estDay === 0 && estMonth === 2) sundaySecondMarch = estDate;
    // EDT
    const edt = moment().utcOffset('-0400');
    const edtDate = edt.date();
    const edtDay = edt.day();
    const edtMonth = edt.month();
    const edtHour = edt.hour();
    let sundayFirstNovember = null;
    if (edtDate && edtDate < 8 && edtDay === 0 && edtMonth === 10) sundayFirstNovember = edtDate;
    if ((estDate === sundaySecondMarch && estMonth === 2 && estHour >= 2 && estMinute > 0) ||
        (estDate > sundaySecondMarch && estMonth === 2) || (estMonth > 2 && estMonth < 10) ||
        (edtMonth === 10 && edtDate < sundayFirstNovember) ||
        (edtMonth === 10 && edtDate === sundayFirstNovember && edtHour < 2)) {
        return '-0400';
    } else {
        return '-0500';
    }
}

export function getTimeOffsetAUS() {
    // AEDT
    const aedt = moment().utcOffset('1100');
    const aedtDate = aedt.date();
    const aedtDay = aedt.day();
    const aedtMonth = aedt.month();
    const aedtHour = aedt.hour();
    const aedtMinute = aedt.minute();
    let sundayFirstApril = null;
    if (aedtDate && aedtDate < 8 && aedtDay === 0 && aedtMonth === 3) sundayFirstApril = aedtDate;
    // AEST
    const aest = moment().utcOffset('+1000');
    const aestDate = aest.date();
    const aestDay = aest.day();
    const aestMonth = aest.month();
    const aestHour = aest.hour();
    let sundayFirstNovember = null;
    if (aestDate && aestDate < 8 && aestDay === 0 && aestMonth === 10) sundayFirstNovember = aestDate;
    if ((aedtDate === sundayFirstApril && aedtMonth === 3 && aedtHour >= 3 && aedtMinute > 0) ||
        (aedtDate > sundayFirstApril && aedtMonth === 3) || (aedtMonth > 3 && aedtMonth < 10) ||
        (aestMonth === 10 && aestDate < sundayFirstNovember) ||
        (aestMonth === 10 && aestDate === sundayFirstNovember && aestHour < 2)) {
        return '1000';
    } else {
        return '1100';
    }
}

export function checkOpenSecsionUSA() {
    const offset = getTimeOffsetUSA();
    const time = moment().utcOffset(offset)
    const totalMinute = time.hour() * 60 + time.minute();
    if (totalMinute > sessionTransaction.OPEN_USA && totalMinute < sessionTransaction.CLOSE_USA) return true;
    return false;
}

export function checkOpenSecsionAUS() {
    const offset = getTimeOffsetAUS();
    const time = moment().utcOffset(offset)
    const totalMinute = time.hour() * 60 + time.minute();
    if (totalMinute > sessionTransaction.OPEN_AUS && totalMinute < sessionTransaction.CLOSE_AUS) return true;
    return false;
}

export async function getDefaultAccount() {
    if (!dataStorage.userInfo) return;
    return new Promise(resolve => {
        const url = helper.getAllAccountUrl(dataStorage.userInfo.user_id, 1, 50, '');
        helper.getData(url).then(snap => {
            const listAccount = snap && snap.data && snap.data.data ? snap.data.data : [];
            if (listAccount.length) {
                let accountInfo = listAccount.find(function (element) {
                    return element.status === 'active';
                });
                if (!accountInfo) {
                    dataStorage.account_id = '';
                    dataStorage.accountInfo = {};
                    // dataStorage.accountsObjDic[`${accountInfo.account_id}`] = accountInfo
                } else {
                    dataStorage.account_id = accountInfo.account_id;
                    dataStorage.accountInfo = accountInfo;
                    dataStorage.accountsObjDic[`${accountInfo.account_id}`] = accountInfo
                }
            }
            resolve();
        })
    });
}

export function filterObjtoArr(obj, predicate) {
    let arr = Object.keys(obj)
        .filter(key => predicate(obj[key]))
    return arr
}

export function checkTimeHoliday() {
    const lstAuExchange = ['ASX', 'NSX', 'CXA', 'AXW']
    const lstUsExchange = ['NASDAQ', 'NYSE']
    lstAuExchange.map(exchange => {
        if (dataStorage.timeHoliday && dataStorage.timeHoliday[exchange]) {
            const specialDays = dataStorage.timeHoliday[exchange].data.special_days
            const timeZone = dataStorage.timeHoliday[exchange].data.time_zone
            const timeServer = dataStorage.timeServer
            if (timeZone && specialDays && timeServer) {
                const formatTimezone = moment(timeServer).tz(timeZone).format('DD/MM/YYYY')
                const timeHoliday = Array.isArray(specialDays) && specialDays.indexOf(formatTimezone) > -1
                dataStorage.isHolidayAU[exchange] = timeHoliday
            }
        }
    });
    lstUsExchange.map(exchange => {
        if (dataStorage.timeHoliday && dataStorage.timeHoliday[exchange]) {
            const specialDays = dataStorage.timeHoliday[exchange].data.special_days
            const timeZone = dataStorage.timeHoliday[exchange].data.time_zone
            const timeServer = dataStorage.timeServer
            if (timeZone && specialDays && timeServer) {
                const formatTimezone = moment(timeServer).tz(timeZone).format('DD/MM/YYYY')
                const timeHoliday = Array.isArray(specialDays) && specialDays.indexOf(formatTimezone) > -1
                dataStorage.isHolidayUS[exchange] = timeHoliday
            }
        }
    })
    const lstTimeHolidayAu = filterObjtoArr(dataStorage.isHolidayAU, x => x === true)
    const lstTimeHolidayUs = filterObjtoArr(dataStorage.isHolidayUS, x => x === true)
    const auLength = lstTimeHolidayAu.length
    const usLength = lstTimeHolidayUs.length
    // only exchange
    let strExchange;
    if (auLength + usLength === 1) {
        dataStorage.goldenLayout.onlyExchange.classList.add('show')
        strExchange = `${lstTimeHolidayAu[0] || lstTimeHolidayUs[0]} exchange is currently closed `
    } else if (auLength + usLength === (lstAuExchange.length + lstUsExchange.length)) {
        dataStorage.goldenLayout.onlyExchange.classList.add('show')
        strExchange = `The AU & US markets are currently closed  `
    } else if ((auLength === 1 && usLength > 0 && usLength < lstUsExchange.length) || (usLength === 1 && auLength > 0 && auLength < lstAuExchange.length)) {
        dataStorage.goldenLayout.onlyExchange.classList.add('show')
        strExchange = `${lstTimeHolidayAu.join(', ')} & ${lstTimeHolidayUs.join(', ')} exchanges are currently closed  `
    } else if ((auLength === 0 && usLength === lstUsExchange.length) || (usLength === 0 && auLength === lstAuExchange.length)) {
        dataStorage.goldenLayout.onlyExchange.classList.add('show')
        strExchange = `The ${auLength === lstAuExchange.length ? 'AU' : 'US'} market is currently closed  `
    } else if ((auLength > 1 && auLength < lstAuExchange.length && usLength === 0) || (usLength > 1 && usLength < lstUsExchange.length && auLength === 0)) {
        dataStorage.goldenLayout.onlyExchange.classList.add('show')

        let lastAu = lstTimeHolidayAu.splice(lstTimeHolidayAu.length - 1);
        let lastUs = lstTimeHolidayUs.splice(lstTimeHolidayUs.length - 1);
        strExchange = `${lastAu.length ? (lstTimeHolidayAu.join(', ') + ' & ' + lastAu.join('')) : ''} ${lastUs.length ? (lstTimeHolidayUs.join(', ') + ' & ' + lastUs.join('')) : ''} exchanges are currently closed  `
    } else if ((auLength === lstAuExchange.length && usLength === 1) || (usLength === lstUsExchange.length && auLength === 1)) {
        dataStorage.goldenLayout.onlyExchange.classList.add('show')
        strExchange = `${auLength === lstAuExchange.length ? 'The AU market' : 'The US market'} & ${auLength === lstAuExchange.length ? lstTimeHolidayUs.join(', ') : lstTimeHolidayAu.join(', ')} exchange are currently closed  `
    } else if ((auLength > 1 && usLength === lstUsExchange.length) || (usLength > 1 && auLength === lstAuExchange.length)) {
        dataStorage.goldenLayout.onlyExchange.classList.add('show')
        strExchange = `${auLength === lstAuExchange.length ? 'The AU market' : 'The US market'} & ${auLength === lstAuExchange.length ? lstTimeHolidayUs.join(', ') : lstTimeHolidayAu.join(', ')} exchanges are currently closed  `
    } else {
        dataStorage.goldenLayout.onlyExchange.classList.remove('show')
    }
    ReactDOM.render(`${strExchange}`, dataStorage.goldenLayout.onlyExchange)
}

function networkInterval(data) {
    if (dataStorage.userInfo && data.show_market_data_alert && !dataStorage.priceAlertShowed) {
        dataStorage.priceAlertShowed = true;
        warning({
            message: [
                {
                    value: 'lang_price_alert_1',
                    valHighLight: 'lang_price_alert_2'
                },
                {
                    value: 'lang_price_alert_3'
                },
                { value: 'lang_price_alert_4', isPhone: '03 8199 7704' }
            ],
            isWarning: true,
            isCheckIndex: 0,
            callback: () => { }
        })
    }
}

export function handleNetwork(isConnected) {
    if (isConnected !== dataStorage.connected) {
        // getIpPublish((ip) => {
        //     dataStorage.ipPublic = ip
        // })
        dataStorage.connected = isConnected;
        func.emitter(emitter.CHECK_CONNECTION, eventEmitter.CHANGE_CONNECTION, isConnected);
        dispatchEvent(EVENTNAME.connectionChanged, isConnected);
        isConnected && func.emitter(emitter.CHECK_CONNECTION, eventEmitter.CHANGE_CONNECTION_AFTER_RENEW_TOKEN, isConnected);
        if (dataStorage.goldenLayout.alertConnection) {
            if (isConnected) dataStorage.goldenLayout.alertConnection.classList.remove('show')
            else dataStorage.goldenLayout.alertConnection.classList.add('show')
        }
        isConnected && func.emitter(emitter.CHECK_CONNECTION_STREAM, eventEmitter.CHANGE_CONNECTION_STREAM, isConnected);
    }
}

export function checkNetworkConnection(cb) {
    const url = helper.getConnectionUrl();
    return new Promise(() => {
        if (!dataStorage.isTest) {
            const reqWorker = new Workers(requestWorker);
            let timeoutId = setTimeout(() => {
                cb && cb(false); // eslint-disable-line
                // cancel();
            }, TIMEOUT_CANCEL_REQUEST);

            reqWorker.executeTask({ url, token: dataStorage.accessToken }, (data) => {
                if (data.status === 200) {
                    const infoData = data && data.data ? JSON.parse(data.data) : {}
                    networkInterval(infoData);
                    dataStorage.timeServer = infoData.timeserver
                    if (dataStorage.timeHoliday && Object.keys(dataStorage.timeHoliday).length > 0) checkTimeHoliday()
                    if (infoData.maintain) {
                        if (!dataStorage.isTest) {
                            dataStorage.maintain = true;
                            showModal({
                                component: UpdateSystem
                            });
                        }
                    } else if (dataStorage.maintain) window.location.reload();
                    timeoutId && clearTimeout(timeoutId)
                    cb && cb(true) // eslint-disable-line
                } else {
                    timeoutId && clearTimeout(timeoutId)
                    cb && cb(false) // eslint-disable-line
                }
            });
        } else {
            const configHeader = {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                    Authorization: `Bearer ${dataStorage.accessToken}`
                },
                cancelToken: new CancelToken(function executor(c) {
                    cancel = c;
                })
            };
            let timeoutId = setTimeout(() => {
                cb && cb(false); // eslint-disable-line
                cancel();
            }, TIMEOUT_CANCEL_REQUEST)
            axios.get(url, configHeader)
                .then((res) => {
                    dataStorage.timeServer = res.data.timeserver
                    if (res && res.data && res.data.maintain) {
                        if (!dataStorage.isTest) {
                            dataStorage.maintain = true;
                            showModal({
                                component: UpdateSystem
                            });
                        }
                    } else if (dataStorage.maintain) window.location.reload();
                    networkInterval(res && res.data);
                    timeoutId && clearTimeout(timeoutId)
                    if (dataStorage.timeHoliday && Object.keys(dataStorage.timeHoliday).length > 0) checkTimeHoliday()
                    cb && cb(true) // eslint-disable-line
                })
                .catch((error) => {
                    timeoutId && clearTimeout(timeoutId)
                    cb && cb(false) // eslint-disable-line
                });
        }
    });
}

export function getNotiContentOnMarket(data, displayName) {
    const side = data.is_buy ? dataStorage.translate('BUY') : dataStorage.translate('SELL');
    const volume = data.volume;
    const isSymbolFuture = data.class && data.class === 'future'
    const limitPrice = data.limit_price;
    const stopPrice = data.stop_price;
    const type = data.order_type ? (data.order_type + '').toUpperCase() : '';
    const onMarketMKT = type === OrderType.MARKET || type === OrderType.MARKET_ORDER ? dataStorage.translate('lang_market_new') : dataStorage.translate('lang_market_to_limit_new')
    const onMarketStoploss = dataStorage.translate('lang_stop_loss_new')
    const onMarketLimit = dataStorage.translate('lang_limit_new')
    const onMarketStopLimit = isSymbolFuture ? dataStorage.translate('lang_stop_limit_future_new') : dataStorage.translate('lang_stop_limit_new')
    const onMarketTrailingAmountStopLimit = dataStorage.translate('lang_trailing_amount_stop_limit_new')
    const onMarketTrailingPercentStopLimit = dataStorage.translate('lang_trailing_percent_stop_limit_new')
    switch (type) {
        case OrderType.MARKETTOLIMIT:
        case OrderType.MARKETTOLIMIT_ORDER:
        case OrderType.MARKET:
        case OrderType.MARKET_ORDER:
            return onMarketMKT.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`);
        case OrderType.STOPLOSS:
        case OrderType.STOPLOSS_ORDER:
        case OrderType.STOP_ORDER:
            return onMarketStoploss.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`).replace('##stopPrice##', `${formatNumberNew2(stopPrice, 4, true, true)}`);
        case OrderType.LIMIT:
        case OrderType.LIMIT_ORDER:
            return onMarketLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`).replace('##limitPrice##', `${formatNumberNew2(limitPrice, 4, true, true)}`);
        case OrderType.STOPLIMIT:
        case OrderType.STOPLIMIT_ORDER:
        case OrderType.STOP_LIMIT:
        case OrderType.STOP_LIMIT_ORDER:
            return onMarketStopLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`).replace('##limitPrice##', `${formatNumberNew2(limitPrice, 4, true, true)}`).replace('##stopPrice##', `${formatNumberNew2(stopPrice, 4, true, true)}`);
        case OrderType.TRAILINGSTOPLIMIT_ORDER:
        case OrderType.TRAILINGSTOPLIMIT: // eslint-disable-line
            const trailingValue = data.trailing_type === 'amount' ? data.trailing_amount : data.trailing_percent;
            if (data.trailing_type === 'amount') {
                return onMarketTrailingAmountStopLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`).replace('##limitPrice##', `${formatNumberNew2(limitPrice, 4, true, true)}`).replace('##stopPrice##', `${formatNumberNew2(stopPrice, 4, true, true)}`).replace('##trailingValue##', `${formatNumberNew2(trailingValue, 3)}`);
            } else {
                return onMarketTrailingPercentStopLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`).replace('##limitPrice##', `${formatNumberNew2(limitPrice, 3)}`).replace('##stopPrice##', `${formatNumberNew2(stopPrice, 4, true, true)}`).replace('##trailingValue##', `${formatNumberNew2(trailingValue, 4, true, true)}`);
            }
        default: return '';
    }
}
export function getNotiContentPartialFill(data, displayName) {
    const side = data.is_buy ? dataStorage.translate('BUY') : dataStorage.translate('SELL');
    const volume = data.volume;
    const isSymbolFuture = data.class && data.class === 'future'
    const filledPrice = data.avg_price;
    const limitPrice = data.limit_price;
    const stopPrice = data.stop_price;
    const filledQuantity = data.filled_quantity;
    const type = (data.order_type + '').toUpperCase() || '';
    const partialFillMKT = dataStorage.translate('partialFillMKT')
    const partialFillStoploss = dataStorage.translate('lang_stop_loss_partialfill')
    const partialFillLimit = dataStorage.translate('lang_limit_partialfill')
    const partialFillStopLimit = isSymbolFuture ? dataStorage.translate('lang_stop_limit_future_partialfill') : dataStorage.translate('lang_stop_limit_partialfill')
    const partialFillTrailingAmountStopLimit = dataStorage.translate('lang_trailing_amount_stop_limit_partialfill')
    const partialFillTrailingPercentStopLimit = dataStorage.translate('lang_trailing_perent_stop_limit_partialfill')
    switch (type) {
        case OrderType.MARKETTOLIMIT: case OrderType.MARKETTOLIMIT_ORDER:
        case OrderType.MARKET: case OrderType.MARKET_ORDER:
            return partialFillMKT.replace('##side##', `${side}`).replace(/##volume##/g, `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                .replace('##filledQuantity##', `${formatNumberNew2(filledQuantity)}`).replace('##filledPrice##', formatNumberNew2(filledPrice, 4, true, true));
        case OrderType.STOPLOSS: case OrderType.STOPLOSS_ORDER: case OrderType.STOP_ORDER:
            return partialFillStoploss.replace('##side##', `${side}`).replace(/##volume##/g, `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                .replace('##filledQuantity##', `${formatNumberNew2(filledQuantity)}`).replace('##filledPrice##', formatNumberNew2(filledPrice, 4, true, true)).replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true));
        case OrderType.LIMIT: case OrderType.LIMIT_ORDER:
            return partialFillLimit.replace('##side##', `${side}`).replace(/##volume##/g, `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                .replace('##filledQuantity##', `${formatNumberNew2(filledQuantity)}`).replace('##filledPrice##', formatNumberNew2(filledPrice, 4, true, true)).replace('##limitPrice##', formatNumberNew2(limitPrice, 4, true, true));
        case OrderType.STOPLIMIT: case OrderType.STOPLIMIT_ORDER:
            return partialFillStopLimit.replace('##side##', `${side}`).replace(/##volume##/g, `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                .replace('##filledQuantity##', `${formatNumberNew2(filledQuantity)}`).replace('##filledPrice##', formatNumberNew2(filledPrice, 4, true, true)).replace('##limitPrice##', formatNumberNew2(limitPrice, 4, true, true)).replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true));
        case OrderType.TRAILINGSTOPLIMIT: case OrderType.TRAILINGSTOPLIMIT_ORDER: // eslint-disable-line
            const trailingValue = data.trailing_type === 'amount' ? data.trailing_amount : data.trailing_percent;
            if (data.trailing_type === 'amount') {
                return partialFillTrailingAmountStopLimit.replace('##side##', `${side}`).replace(/##volume##/g, `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                    .replace('##filledQuantity##', `${formatNumberNew2(filledQuantity)}`).replace('##filledPrice##', formatNumberNew2(filledPrice, 4, true, true)).replace('##limitPrice##', formatNumberNew2(limitPrice, 4, true, true))
                    .replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true)).replace('##trailingValue####', formatNumberNew2(trailingValue));
            } else {
                return partialFillTrailingPercentStopLimit.replace('##side##', `${side}`).replace(/##volume##/g, `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                    .replace('##filledQuantity##', `${formatNumberNew2(filledQuantity)}`).replace('##filledPrice##', formatNumberNew2(filledPrice, 4, true, true)).replace('##limitPrice##', formatNumberNew2(limitPrice, 4, true, true))
                    .replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true)).replace('##trailingValue##', formatNumberNew2(trailingValue));
            }
        default: return '';
    }
}
export function getNotiContentFilled(data, displayName) {
    const side = data.is_buy ? dataStorage.translate('BUY') : dataStorage.translate('SELL');
    let volume = data.volume;
    const limitPrice = data.limit_price;
    const stopPrice = data.stop_price;
    const avgPrice = data.avg_price;
    const filledQuantity = data.filled_quantity;
    const type = (data.order_type + '').toUpperCase();
    const filledMKT = type === OrderType.MARKET || type === OrderType.MARKET_ORDER ? dataStorage.translate('lang_market_filled') : dataStorage.translate('lang_market_to_limit_filled')
    const filledStoploss = dataStorage.translate('lang_stop_loss_filled')
    const filledLimit = dataStorage.translate('lang_limit_filled')
    const filledTrailingAmountStopLimit = dataStorage.translate('lang_trailing_amount_stop_limit_filled')
    const filledTrailingPercentStopLimit = dataStorage.translate('lang_trailing_percent_stop_limit_filled')
    switch (type) {
        case OrderType.MARKETTOLIMIT: case OrderType.MARKETTOLIMIT_ORDER:
        case OrderType.MARKET: case OrderType.MARKET_ORDER:
            return filledMKT.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`).replace('##averagePrice##', formatNumberNew2(avgPrice, 4, true, true));
        case OrderType.STOPLOSS: case OrderType.STOPLOSS_ORDER: case OrderType.STOP_ORDER:
            return filledStoploss.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`).replace('##averagePrice##', formatNumberNew2(avgPrice, 4, true, true))
                .replace('##stopPrice##', formatNumberNew2(stopPrice, 3));
        case OrderType.LIMIT: case OrderType.LIMIT_ORDER: case OrderType.STOPLIMIT: case OrderType.STOPLIMIT_ORDER:
            return filledLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`).replace('##averagePrice##', formatNumberNew2(avgPrice, 4, true, true))
                .replace('##limitPrice##', formatNumberNew2(limitPrice, 4, true, true));
        case OrderType.TRAILINGSTOPLIMIT: case OrderType.TRAILINGSTOPLIMIT_ORDER: // eslint-disable-line
            const trailingValue = data.trailing_type === 'amount' ? data.trailing_amount : data.trailing_percent;
            if (data.trailing_type === 'amount') {
                return filledTrailingAmountStopLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                    .replace('##filledQuantity##', `${formatNumberNew2(filledQuantity)}`).replace('##filledPrice##', formatNumberNew2(filledPrice, 4, true, true)).replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true))
                    .replace('##trailingValue##', `${formatNumberNew2(trailingValue)}`).replace('##averagePrice##', formatNumberNew2(avgPrice, 4, true, true));
            } else {
                return filledTrailingPercentStopLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                    .replace('##filledQuantity##', `${formatNumberNew2(filledQuantity)}`).replace('##filledPrice##', formatNumberNew2(filledPrice, 4, true, true)).replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true))
                    .replace('##trailingValue##', `${formatNumberNew2(trailingValue)}`).replace('##averagePrice##', formatNumberNew2(avgPrice, 4, true, true));
            }
        default: return '';
    }
}
export function getNotiContentCancelled(data, displayName) {
    const side = data.is_buy ? dataStorage.translate('BUY') : dataStorage.translate('SELL');
    const isSymbolFuture = data.class && data.class === 'future'
    let volume = data.volume;
    const filledQuantity = data.filled_quantity;
    const restVolume = volume - filledQuantity;
    const limitPrice = data.limit_price;
    const stopPrice = data.stop_price;
    if (filledQuantity) volume = restVolume;
    const type = (data.order_type + '').toUpperCase() || '';
    const cancelledMKT = type === OrderType.MARKET || type === OrderType.MARKET_ORDER ? dataStorage.translate('lang_market_cancelled') : dataStorage.translate('lang_market_to_limit_cancelled')
    const cancelledStoploss = dataStorage.translate('lang_stop_loss_cancelled')
    const cancelledLimit = dataStorage.translate('lang_limit_cancelled')
    const cancelledStopLimitNotTrigger = dataStorage.translate('lang_stop_limit_cancelled_not_trigger')
    const cancelledStopLimit = isSymbolFuture ? dataStorage.translate('lang_stop_limit_future_cancelled') : dataStorage.translate('lang_stop_limit_cancelled')
    const cancelledTrailingAmountStopLimit = dataStorage.translate('lang_trailing_amount_stop_limit_cancelled')
    const filledTrailingPercentStopLimit = dataStorage.translate('lang_trailing_percent_stop_limit_filled')
    switch (type) {
        case OrderType.MARKETTOLIMIT: case OrderType.MARKETTOLIMIT_ORDER:
        case OrderType.MARKET: case OrderType.MARKET_ORDER:
            return cancelledMKT.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`);
        case OrderType.STOPLOSS: case OrderType.STOPLOSS_ORDER: case OrderType.STOP_ORDER:
            return cancelledStoploss.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`).replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true));
        case OrderType.LIMIT: case OrderType.LIMIT_ORDER:
            return cancelledLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`).replace('##limitPrice##', formatNumberNew2(limitPrice, 4, true, true));
        case OrderType.STOPLIMIT: case OrderType.STOPLIMIT_ORDER:
            if (!data.stop_price) { // not trigger
                return cancelledStopLimitNotTrigger.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`).replace('##limitPrice##', formatNumberNew2(limitPrice, 4, true, true));
            } else {
                return cancelledStopLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                    .replace('##limitPrice##', formatNumberNew2(limitPrice, 4, true, true)).replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true));
            }
        case OrderType.TRAILINGSTOPLIMIT: case OrderType.TRAILINGSTOPLIMIT_ORDER: // eslint-disable-line
            const trailingValue = data.trailing_type === 'amount' ? data.trailing_amount : data.trailing_percent;
            if (data.trailing_type === 'amount') {
                return cancelledTrailingAmountStopLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                    .replace('##filledQuantity##', `${formatNumberNew2(filledQuantity)}`).replace('##filledPrice##', formatNumberNew2(filledPrice, 4, true, true)).replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true))
                    .replace('##trailingValue##', `${formatNumberNew2(trailingValue)}`).replace('##averagePrice##', formatNumberNew2(avgPrice, 4, true, true));
            } else {
                return filledTrailingPercentStopLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                    .replace('##filledQuantity##', `${formatNumberNew2(filledQuantity)}`).replace('##filledPrice##', formatNumberNew2(filledPrice, 4, true, true)).replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true))
                    .replace('##trailingValue##', `${formatNumberNew2(trailingValue)}`).replace('##averagePrice##', formatNumberNew2(avgPrice, 4, true, true));
            }
        default: return '';
    }
}
export function getNotiContentRejected(data, displayName) {
    const side = data.is_buy ? dataStorage.translate('BUY') : dataStorage.translate('SELL');
    let volume = data.volume;
    const isSymbolFuture = data.class && data.class === 'future'
    const filledQuantity = data.filled_quantity;
    const limitPrice = data.limit_price;
    const stopPrice = data.stop_price;
    const restVolume = volume - filledQuantity;
    if (filledQuantity) volume = restVolume;
    const type = (data.order_type + '').toUpperCase() || '';
    const rejectedMKT = type === OrderType.MARKET || type === OrderType.MARKET_ORDER ? dataStorage.translate('lang_market_rejected') : dataStorage.translate('lang_market_to_limit_rejected')
    const rejectedLimit = dataStorage.translate('lang_limit_rejected')
    const rejectedStopLimit = isSymbolFuture ? dataStorage.translate('lang_stop_limit_future_rejected') : dataStorage.translate('lang_stop_limit_rejected')
    const rejectedTrailingAmountStopLimit = dataStorage.translate('lang_trailing_amount_stop_limit_rejected')
    const rejectedTrailingPercentStopLimit = dataStorage.translate('lang_trailing_percent_stop_limit_rejected')
    switch (type) {
        case OrderType.MARKETTOLIMIT: case OrderType.MARKETTOLIMIT_ORDER:
        case OrderType.MARKET: case OrderType.MARKET_ORDER:
            return rejectedMKT.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`);
        case OrderType.STOPLOSS: case OrderType.STOPLOSS_ORDER: case OrderType.STOP_ORDER: return '';
        case OrderType.LIMIT: case OrderType.LIMIT_ORDER:
            return rejectedLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`).replace('##limitPrice##', formatNumberNew2(limitPrice, 4, true, true));
        case OrderType.STOPLIMIT: case OrderType.STOPLIMIT_ORDER:
            return rejectedStopLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                .replace('##limitPrice##', formatNumberNew2(limitPrice, 4, true, true)).replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true));
        case OrderType.TRAILINGSTOPLIMIT: case OrderType.TRAILINGSTOPLIMIT_ORDER: // eslint-disable-line
            const trailingValue = data.trailing_type === 'amount' ? data.trailing_amount : data.trailing_percent;
            if (data.trailing_type === 'amount') {
                return rejectedTrailingAmountStopLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                    .replace('##filledQuantity##', `${formatNumberNew2(filledQuantity)}`).replace('##filledPrice##', formatNumberNew2(filledPrice, 4, true, true)).replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true))
                    .replace('##trailingValue##', `${formatNumberNew2(trailingValue)}`);
            } else {
                return rejectedTrailingPercentStopLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                    .replace('##filledQuantity##', `${formatNumberNew2(filledQuantity)}`).replace('##filledPrice##', formatNumberNew2(filledPrice, 4, true, true)).replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true))
                    .replace('##trailingValue##', `${formatNumberNew2(trailingValue)}`);
            }
        default: return '';
    }
}
export function getNotiContentExpired(data, displayName) {
    const side = data.is_buy ? dataStorage.translate('BUY') : dataStorage.translate('SELL');
    const isSymbolFuture = data.class && data.class === 'future'
    let volume = data.volume;
    const limitPrice = data.limit_price;
    const filledQuantity = data.filled_quantity;
    const stopPrice = data.stop_price;
    const restVolume = volume - filledQuantity;
    if (filledQuantity) volume = restVolume;
    const type = (data.order_type + '').toUpperCase() || '';
    const expiredMKT = type === OrderType.MARKET || type === OrderType.MARKET_ORDER ? dataStorage.translate('lang_market_expired') : dataStorage.translate('lang_market_to_limit_expired')
    const expiredStoploss = dataStorage.translate('lang_stop_loss_expired')
    const expiredLimit = dataStorage.translate('lang_limit_expired')
    const expiredStopLimit = isSymbolFuture ? dataStorage.translate('lang_stop_limit_future_expired') : dataStorage.translate('lang_stop_limit_expired')
    const expiredTrailingAmountStopLimit = dataStorage.translate('lang_trailing_amount_stop_limit_expired')
    const expiredTrailingPriceStopLimit = dataStorage.translate('lang_trailing_percent_stop_limit_expired')
    switch (type) {
        case OrderType.MARKETTOLIMIT: case OrderType.MARKETTOLIMIT_ORDER:
        case OrderType.MARKET: case OrderType.MARKET_ORDER:
            return expiredMKT.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`);
        case OrderType.STOPLOSS: case OrderType.STOPLOSS_ORDER: case OrderType.STOP_ORDER:
            return expiredStoploss.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`).replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true));
        case OrderType.LIMIT: case OrderType.LIMIT_ORDER:
            return expiredLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`).replace('##limitPrice##', formatNumberNew2(limitPrice, 4, true, true));
        case OrderType.STOPLIMIT: case OrderType.STOPLIMIT_ORDER:
            return expiredStopLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                .replace('##limitPrice##', formatNumberNew2(limitPrice, 4, true, true)).replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true));
        case OrderType.TRAILINGSTOPLIMIT: case OrderType.TRAILINGSTOPLIMIT_ORDER: // eslint-disable-line
            const trailingValue = data.trailing_type === 'amount' ? data.trailing_amount : data.trailing_percent;
            if (data.trailing_type === 'amount') {
                return expiredTrailingAmountStopLimit.replace('##side##', `${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                    .replace('##filledQuantity##', `${formatNumberNew2(filledQuantity)}`).replace('##filledPrice##', formatNumberNew2(filledPrice, 4, true, true)).replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true))
                    .replace('##trailingValue##', `${formatNumberNew2(trailingValue)}`);
            } else {
                return expiredTrailingPriceStopLimit.replace('##side##', pen`${side}`).replace('##volume##', `${formatNumberNew2(volume)}`).replace('##symbol##', `${displayName}`)
                    .replace('##filledQuantity##', `${formatNumberNew2(filledQuantity)}`).replace('##filledPrice##', formatNumberNew2(filledPrice, 4, true, true)).replace('##stopPrice##', formatNumberNew2(stopPrice, 4, true, true))
                    .replace('##trailingValue##', `${formatNumberNew2(trailingValue)}`);
            }
        default: return '';
    }
}

export function getUserPosition() {
    const accountId = dataStorage.account_id;
    const urlUserPosition = helper.getUrlUserPositionByAccountId(accountId);
    helper.getData(urlUserPosition).then(data => {
        if (data) {
            dataStorage.dicPosition = {};
            Object.keys(data).map(e => {
                if (data[e]) {
                    dataStorage.dicPosition[`${e}`] = true;
                }
            })
        }
    }).catch(error => {
        logger.log(`getUserPosition error: ${error}`)
    })
}

export function getDisplayNameSymbol(symbol) {
    return new Promise((resolve, reject) => {
        if (!symbol) reject(new Error('no symbol'))
        let url = helper.makeSymbolUrl(symbol);
        helper.getData(url).then(snap => {
            if (snap && snap.data && Array.isArray(snap.data) && snap.data.length > 0) {
                const res = snap.data[0];
                resolve(res.display_name || '');
            }
        }).catch(() => {
            resolve('');
        })
    })
}

export function getNotiBody(notif, cb) {
    let body = null;
    const notiType = getNotiType(notif.title);
    const data = JSON.parse(notif.object_changed);
    getDisplayNameSymbol(encodeURIComponent(data.symbol)).then(displayName => {
        switch (notiType) {
            case NotiType.ORDER_DETAIL:
                break;
            case NotiType.ORDER: // eslint-disable-line
                const orderState = data.order_state ? (data.order_state + '').toUpperCase() : '';
                switch (orderState) {
                    case orderStatus.ONMARKET: case orderStatus.NEW:
                        body = getNotiContentOnMarket(data, displayName);
                        break;
                    case orderStatus.PARTIALFILL:
                        body = getNotiContentPartialFill(data, displayName);
                        break;
                    case orderStatus.FILLED:
                        body = getNotiContentFilled(data, displayName);
                        break;
                    case orderStatus.CANCELLED: case orderStatus.CANCELED:
                        body = getNotiContentCancelled(data, displayName);
                        break;
                    case orderStatus.REJECTED:
                        body = getNotiContentRejected(data, displayName);
                        break;
                    case orderStatus.EXPIRED:
                        body = getNotiContentExpired(data, displayName);
                        break;
                    default: break;
                }
                break;
            case NotiType.NEWS:
                body = data.title || '';
                break;
        }
        cb && cb(body);
    }).catch((error) => {
        logger.log(error);
    });
}

export function getAccountName(accountId) {
    return new Promise((resolve) => {
        const url = helper.getUrlAnAccount(`${accountId}`);
        helper.getData(url).then(snap => {
            if (snap && snap.data && snap.data.length) {
                const accountInfo = snap.data[0];
                const accountName = accountInfo.account_name || '';
                dataStorage.dictAccountNoti[accountId] = accountName
                resolve(accountName);
            } else {
                resolve('');
            }
        }).catch(err => {
            resolve('');
        });
    })
}

export function getNotiTitle(notiType, accountId, cb) {
    let title = '';
    switch (notiType) {
        case NotiType.ORDER_DETAIL: case NotiType.ORDER:
            if (dataStorage.dictAccountNoti[accountId]) {
                let accountName = dataStorage.dictAccountNoti[accountId] || ''
                title = accountName && accountName !== '' ? `${accountName} (${accountId})` : accountId;
                cb && cb(title);
            } else {
                getAccountName(accountId).then(accountName => {
                    title = accountName && accountName !== '' ? `${accountName} (${accountId})` : accountId;
                    cb && cb(title);
                })
            }
            break;
        case NotiType.NEWS:
            title = `NEWS`;
            cb && cb(title);
            break;
    }
}

export function showNotification(notif, accountId, orderId) {
    try {
        getNotiBody(notif, body => {
            if (body) {
                const notiType = getNotiType(notif.title);
                getNotiTitle(notiType, accountId, title => {
                    dataStorage.showNotification && dataStorage.showNotification(title, body, new Date().getTime(), orderId, '', true)
                });
            }
        });
    } catch (error) {
        logger.log('showLocalNotification func exception: ', error)
    }
}

export function preprocessSynchronizeNoti(notif) {
}

function emitOrderStatusForOrderDetail(data) {
    if (data.order_status === orderState.FILLED || data.order_status === orderState.CANCELLED) {
        dataStorage.listFilledCancelled[data.broker_order_id] = true;
        func.emitter(emitter.CHECK_ORDER_STATUS, eventEmitter.CHECK_ORDER_STATUS_BY_NOTI, data);
    }
}

export function preprocessOrderNoti(notif) {
    try {
        const data = JSON.parse(notif.object_changed);
        const accountId = data.account_id;
        const listMapping = dataStorage.userInfo && dataStorage.userInfo.list_mapping;
        if (!dataStorage.dicAccounts[accountId] && listMapping && !listMapping.includes(accountId)) return;
        if (data && data.order_state && !dataStorage.dicNotiShowed[`${data.broker_order_id}_${data.order_state}_${data.order_type}_${data.stop_price}_${data.leave_quantity}_${data.limit_price}`]) {
            emitOrderStatusForOrderDetail(data);
            const isShowNoti = checkShowNotiOrder(data);
            if (isShowNoti) {
                const state = (data.order_state + '').toUpperCase();
                const isShowNotification = dataStorage.isShowNotification;
                if (!isShowNotification) return;
                const stateSetting = getStateSettingField(state);
                if (!dataStorage[`${stateSetting}`]) {
                    return;
                } else {
                    showNotification(notif, accountId, data.broker_order_id);
                    dataStorage.dicNotiShowed[`${data.broker_order_id}_${data.order_state}_${data.order_type}_${data.stop_price}_${data.leave_quantity}_${data.limit_price}`] = true;
                }
            }
        }
    } catch (error) {
        logger.error('preprocessOrderNoti Func ERROR: ', error);
    }
}
window.realtime = (data) => {
    dataStorage.dicNotiShowed = {};
    handleShowNotification(data)
    // preprocessOrderNoti(data && data.data);
}
export function preprocessOrderDetailNoti(notif) {
}
export function parseJSON(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return {};
    }
}

export function preprocessNewsNoti(notif) {
    try {
        const newObj = JSON.parse(notif.object_changed);
        if (newObj && newObj.symbol) {
            const showNotifications = dataStorage.isShowNotification;
            if (showNotifications === 'false') return;
            const newsId = newObj.news_id;
            const listPersonal = dataStorage.dicPersonal;
            const listPosition = dataStorage.dicPosition;
            const listPersonalPosition = { ...listPersonal, ...listPosition };
            const symbol = (newObj.symbol + '').replace(/\.AU/g, '');
            const isSensitive = !dataStorage.showAllNews;
            const sensitiveNoti = newObj.sign && Array.isArray(newObj.sign) && newObj.sign.includes('PriceSensitive');
            if ((isSensitive !== 'false') && !sensitiveNoti) return;
            if (newsId && newObj.symbol && listPersonalPosition[`${symbol}`]) {
                let url = helper.makeNewsUrl(newsId);
                helper.getData(url).then(snap => {
                    if (snap && snap.length) {
                        const data = snap[0];
                        if ((isSensitive !== 'false') && data.sign && Array.isArray(data.sign) && !data.sign.includes('PriceSensitive')) return;
                        showNewsLocalNotification(data);
                    }
                }).catch(error => {
                    logger.log('preprocessNewsNoti cannot get news data: ', error);
                })
            }
        }
    } catch (error) {
        logger.log('preprocessNewsNoti func exception: ', error)
    }
}

export function showNewsLocalNotification(data) {
    if (data && data.title) {
        getDisplayNameSymbol(encodeURIComponent(data.symbol)).then(displayName => {
            dataStorage.showNotification && dataStorage.showNotification(displayName, data.title, new Date().getTime());
        })
    }
}

export function preprocessWatchlistNoti(notif) {
}
export function preprocessBalanceNoti(notif) {
}
export function preprocessSettingNoti(notif) {
}
export function preprocessPortfolioNoti(notif) {
}

export function preprocessTransactionNoti(notif) {
    try {
        if (data && data.price) {
            const showNotifications = localStorageNew.getItem('showNotifications' + (dataStorage.userInfo ? dataStorage.userInfo.email : ''))
            if (showNotifications === 'false') return;
            const partialFill = localStorageNew.getItem('showPartialFilledNotifications' + (dataStorage.userInfo ? dataStorage.userInfo.email : ''))
            const objSetting = { partialFill };
            if (objSetting['partial_fill'] === 'false') {
                return;
            } else {
                const filledPrice = data.price;
                const orderId = data.broker_order_id;
                const accountId = data.account_id;
                showNotiPartialfill(filledPrice, orderId, accountId);
            }
        }
    } catch (error) {
        logger.log('preprocessTransactionNoti func exception: ', error)
    }
}
export function preprocessHalt(notif) {
}
export function preprocessAccountNoti(notif) {
}

export function preprocessAlertNoti(data) {
    dataStorage.showNotification && dataStorage.showNotification(data.noti_title, data.body, new Date().getTime(), data.object_changed.alert_id, 'Alert');
}
export function preprocessMarginNoti(data) {
    let objectChange = JSON.parse(data.object_changed);
    let body = data.body;
    let title = `${objectChange.title}`;
    dataStorage.showNotification && dataStorage.showNotification(title, body, new Date().getTime(), null, 'margin');
}

export function showNotiPartialfill(filledPrice, orderId, accountId) {
    const orderUrl = helper.getOrderUrl(orderId);
    helper.getData(orderUrl).then(data => {
        const state = data && data.order_state ? (data.order_state + '').toUpperCase() : '';
        if (data && state === orderStatus.PARTIALFILL) {
            const isShowNotification = dataStorage.isShowNotification;
            if (!isShowNotification) return;
            if (dataStorage.showPartialFill) {
                getDisplayNameSymbol(encodeURIComponent(data.symbol)).then(displayName => {
                    const body = getNotiContentPartialFill(data, displayName)
                    getNotiTitle(NotiType.ORDER, accountId, title => {
                        dataStorage.showNotification && dataStorage.showNotification(title, body, new Date().getTime())
                    });
                })
            }
        }
    }).catch(error => {
        logDevice('info', `showNotiPartialfill - get order data ERROR: ${error}`);
    })
}

export function getStateSettingField(state) {
    switch (state) {
        case orderStatus.ONMARKET: case orderStatus.NEW: return 'showOnMarket';
        case orderStatus.FILLED: return 'showFilled';
        case orderStatus.PARTIALFILL: return 'showPartialFill';
        case orderStatus.REJECTED: return 'showRejected';
        case orderStatus.CANCELLED: case orderStatus.CANCELED: return 'showCancelled';
        case orderStatus.EXPIRED: return 'showExpired';
    }
}

export function preprocessUserDetailNoti(notif, initData) {
    if (notif || initData) {
        const data = initData || JSON.parse(notif.object_changed);
        if (!data.user_id || (data.user_id !== dataStorage.userInfo.user_id)) return;
        if (data && Object.keys(data).includes('live_news') && (data.live_news !== dataStorage.userInfo.live_news)) {
            dataStorage.userInfo.live_news = !!data.live_news;
            for (let index = 0; index < dataStorage.reloadNews.length; index++) {
                const reloadNewsFn = dataStorage.reloadNews[index];
                reloadNewsFn && reloadNewsFn('refresh');
            }
        }
    }
}

export function preprocessLayoutNoti(notif) {
    if (notif && notif.action === 'delete') {
        const data = JSON.parse(notif.object_changed);
        const time = new Date().getTime();
        const title = dataStorage.translate('lang_deleted_layout');
        const chartTitle = dataStorage.translate('lang_deleted_chart_template');
        if (data) {
            let curLayout = {};
            let layoutName = '';
            if (data === dataStorage.usingLayout) {
                curLayout = dataStorage.deletingLayout || {};
                layoutName = curLayout.layout_name || '';
                const body = dataStorage.translate('lang_layout_deleted_noti');
                dataStorage.showNotification && dataStorage.showNotification(title, body, time, data, layoutName)
            }
            if (dataStorage.listUsingChartLayout[data]) {
                curLayout = dataStorage.deletingListChartLayout || {};
                layoutName = curLayout.layout_name || '';
                const body = dataStorage.translate('lang_chart_template_deleted_noti');
                dataStorage.showNotification && dataStorage.showNotification(chartTitle, body, time, data, layoutName)
            }
        }
    }
}

export function handleShowNotification(notif) {
    try {
        if (notif && notif.title) {
            const notiType = getNotiType(notif.title);
            switch (notiType) {
                case NotiType.USER_DETAIL:
                    // preprocessUserDetailNoti(notif);
                    break;
                case NotiType.SYNCHRONIZE:
                    preprocessSynchronizeNoti(notif);
                    break;
                case NotiType.LAYOUT:
                    preprocessLayoutNoti(notif);
                    break;
                case NotiType.AUTH:
                    // preprocessAuthNoti(notif);
                    break;
                case NotiType.ORDER:
                    preprocessOrderNoti(notif);
                    break;
                case NotiType.ORDER_DETAIL:
                    preprocessOrderDetailNoti(notif);
                    break;
                case NotiType.NEWS:
                    preprocessNewsNoti(notif)
                    break;
                case NotiType.WATCHLIST:
                    preprocessWatchlistNoti(notif)
                    break;
                case NotiType.PORTFOLIO:
                    preprocessPortfolioNoti(notif)
                    break;
                case NotiType.BALANCES:
                    preprocessBalanceNoti(notif)
                    break;
                case NotiType.SETTING:
                    preprocessSettingNoti(notif)
                    break;
                case NotiType.TRANSACTION:
                    preprocessTransactionNoti(notif)
                    break;
                case NotiType.HALT:
                    preprocessHalt(notif);
                    break;
                case NotiType.ACCOUNT:
                    preprocessAccountNoti(notif)
                    break;
                case NotiType.BRANCH:
                    preprocessAccountNoti(notif)
                    break;
                case NotiType.ALERT_TRIGGER:
                    preprocessAlertNoti(notif)
                    break;
                case NotiType.MARGIN_CALL:
                    preprocessMarginNoti(notif)
                    break;
            }
        }
    } catch (error) {
        logger.error('HANDLE SHOW NOTIFICATION ERROR: ', error);
    }
}

export function checkShowNotiOrder(data) {
    try {
        const orderState = data.order_state ? (data.order_state + '').toUpperCase() : '';
        switch (orderState) {
            case orderStatus.ONMARKET: case orderStatus.PARTIALFILL: case orderStatus.FILLED:
            case orderStatus.CANCELLED: case orderStatus.REJECTED: case orderStatus.EXPIRED:
            case orderStatus.NEW: case orderStatus.CANCELED:
                return true;
            default: return false;
        }
    } catch (error) {
        logger.log(`checkHandleNoti func exception with ${error}`)
    }
}

export function getNotiType(title) {
    const listData = (title + '').split('#');
    let type = listData[0];
    if (type === dataStorage.account_id) {
        type = listData[1];
    }
    type = (type + '').toUpperCase();
    switch (type) {
        case NotiType.ORDER: return NotiType.ORDER;
        case NotiType.ORDER_DETAIL: return NotiType.ORDER_DETAIL;
        case NotiType.SYNCHRONIZE: return NotiType.SYNCHRONIZE;
        case NotiType.WATCHLIST: return NotiType.WATCHLIST;
        case NotiType.SETTING: return NotiType.SETTING;
        case NotiType.BALANCES: return NotiType.BALANCES;
        case NotiType.PORTFOLIO: return NotiType.PORTFOLIO;
        case NotiType.TRANSACTION: return NotiType.TRANSACTION;
        case NotiType.ACCOUNT: return NotiType.ACCOUNT;
        case NotiType.HALT: return NotiType.HALT;
        case NotiType.NEWS: return NotiType.NEWS;
        case NotiType.AUTH: return NotiType.AUTH;
        case NotiType.LAYOUT: return NotiType.LAYOUT;
        case NotiType.USER_DETAIL: return NotiType.USER_DETAIL;
        // case NotiType.ALERT: return NotiType.ALERT;
        case NotiType.ALERT_TRIGGER: return NotiType.ALERT_TRIGGER;
        case NotiType.MARGIN_CALL: return NotiType.MARGIN_CALL;
    }
}

export function sendLogToServer(message, type) {
    try {
        let textSend = typeof message === 'object' ? JSON.stringify(message) : message;
        const currentDate = new Date();
        const timeFormat = getDateStringWithFormat(currentDate, 'DD/MM/YYYY HH:mm:ss');
        dataStorage.logId = dataStorage.logId + 1;
        textSend = `${timeFormat} - Email: ${dataStorage.loginEmail} - Content: ${textSend} - LogId: ${dataStorage.logId}`;
        const url = helper.getLogUrl();
        const firstKey = uuidv4();
        const dataSend = CryptoJS.AES.encrypt(textSend, firstKey).toString();
        helper.postData(url, { data: dataSend, id: firstKey, type })
    } catch (error) {
        logger.error('SEND LOG ERROR: .', error);
    }
}

export function clone(item) {
    return item ? JSON.parse(JSON.stringify(item)) : item;
}
export function diff(nextObj, currentObj, level) {
    if (level > 4) return false;
    if (!nextObj || !currentObj) {
        return false;
    }
    if (Object.keys(nextObj).sort().join() !== Object.keys(currentObj).sort().join()) return true;
    for (const key in nextObj) {
        if (['glContainer', 'glEventHub', 'i18n', 'refCompnent', '$$typeof', 'layout', 'prototype'].indexOf(key) > -1) continue;
        if (nextObj.hasOwnProperty(key)) {
            const next = nextObj[key];
            const current = currentObj[key];
            if (typeof next !== typeof current) return true;

            if (next && current && typeof next === 'object') {
                if (diff(next, current, (level || 0) + 1)) return true;
            } else {
                if ((next + '') !== (current + '')) return true;
            }
        }
    }
    return false;
}
// export function checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, curProps, curState) {
export function checkPropsStateShouldUpdate(nextProps, nextState, curProps, curState) {
    try {
        return diff(nextProps, curProps) || diff(nextState, curState);
    } catch (error) {
        logger.log(error);
    }
}
export function formatNumberPrice(input, fill, nonFixToZero) {
    if (typeof input === 'string') {
        input = Number(input.replace(/,/g, ''))
    }
    return formatNumberNew2(input, 4, fill, nonFixToZero);
}
export function formatNumberValue(input, fill, nonFixToZero, currency) {
    if (typeof input === 'string') {
        input = Number(input.replace(/,/g, ''))
    }
    if (currency === 'VND') return formatNumberNew2(input, 0, fill, nonFixToZero);
    return formatNumberNew2(input, 2, fill, nonFixToZero);
}
export function formatNumberVolume(input, fill, nonFixToZero) {
    if (typeof input === 'string') {
        input = Number(input.replace(/,/g, ''))
    }
    return formatNumberNew2(input, 0, fill, nonFixToZero);
}
export function formatNumberNew2(input, decimal, fill, nonFixToZero) {
    try {
        if (input === null || isNaN(input) || input === undefined) {
            return '--';
        }
        if ((input + '').includes('e')) {
            if ((input + '').includes('e-')) input = input.toFixed(10);
            else return input;
        }
        if (input === '' && !nonFixToZero) {
            return '0';
        }
        if (decimal == null) {
            if (parseFloat(input) >= 2) {
                input = roundFloat(input, 2);
            } else {
                input = roundFloat(input, 3);
            }
        } else {
            input = roundFloat(input, decimal);
        }
        input = input
            .toString()
            .split('.');
        input[0] = input[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        if (decimal && fill) {
            if (!input[1]) input[1] = '0'.repeat(decimal);
            else input[1] += '0'.repeat(decimal - input[1].length);
        }
        return input.join('.')
    } catch (ex) {
        logger.error(ex);
    }
}

export function roundFloat(numberFloat, lenght) {
    try {
        if (numberFloat == null || lenght == null) {
            return 0;
        }
        // let itenDivison = '1';
        // for (let i = 0; i < lenght; i++) {
        //     itenDivison += '0';
        // }
        // const division = Number(itenDivison);
        let numberString = numberFloat + '';
        if (numberString.includes('e')) {
            return numberFloat
        }
        let arrNumber = numberString.split('.');
        if (!arrNumber[1]) return numberFloat;
        for (let i = 0; i < lenght; i++) {
            if (arrNumber[1][0]) {
                arrNumber[0] += arrNumber[1][0];
                arrNumber[1] = arrNumber[1].substr(1);
            } else {
                arrNumber[0] += '0'
            }
        }
        numberString = arrNumber.join('.');
        arrNumber = Math.round(numberString).toString();
        arrNumber = arrNumber.replace(/^(-?)/, '$1' + '0'.repeat(lenght))
        let result = 0;
        if (lenght > 0) {
            result = parseFloat(arrNumber.substring(0, arrNumber.length - lenght) + '.' + arrNumber.substr(-lenght));
        } else {
            result = arrNumber
        }
        return Number(result)
    } catch (e) {
        logger.error(e);
    }
    return 0;
}
export function formatNumberWithText(labelValue, decimal, fill) {
    if (labelValue === '--') return '--';
    if (!decimal) decimal = 2;
    return Math.abs(Number(labelValue)) >= 1.0e+9 ? formatNumberNew2(Number(labelValue) / 1.0e+9, 2, true) + 'B' : Math.abs(Number(labelValue)) >= 1.0e+6
        ? formatNumberNew2(Number(labelValue) / 1.0e+6, 2, true) + 'M' : Math.abs(Number(labelValue)) >= 1.0e+3
            ? formatNumberNew2(Number(labelValue) / 1.0e+3, 2, true) + 'K' : formatNumberNew2(labelValue, decimal, fill);
}
export function formatNumberWithTextBroker(labelValue, decimal, fill) {
    if (labelValue === '--') return '--';
    if (!decimal) decimal = 2;
    return Math.abs(Number(labelValue)) >= 1.0e+12 ? formatNumberNew2(Number(labelValue) / 1.0e+9, 3, true) + 'B' : Math.abs(Number(labelValue)) >= 1.0e+5
        ? formatNumberNew2(Number(labelValue) / 1.0e+6, 3, true) + 'M' : formatNumberNew2(labelValue, decimal, fill);
}

export function convertObjToArray(data) {
    const listData = [];
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const element = data[key];
            listData.push(element);
        }
    }
    return listData;
}

export function convertFlagToArray(data) {
    return data.match(/^(.{3})(.*)$/);
}

export function checkCodeFlag(data) {
    if (data === 'AUD') {
        return 'AUS'
    } else if (data === 'USD') {
        return 'USA'
    } else if (data === 'GBP') {
        return 'GBR'
    } else if (data === 'EUR') {
        return 'EUR'
    }
}

export function renderFlagImg(symbol, form) {
    if (form === 'report') {
        const obj = symbol.match(/\.([\w]+$)/);
        if (symbol === 'OTHERS') return ''
        if (obj !== null) {
            if (isAUSymbol(obj[1])) {
                return '<img class="icon-flag" src="../flag/au.png" />'
            } else {
                return '<img class="icon-flag" src="../flag/us.png" />'
            }
        } else return '';
    }
}

export function renderClassColorLink(state) {
    switch (state) {
        case EnumLink.GreenLink:
            return s.greenColor;
        case EnumLink.BlueLink:
            return s.blueColor;
        case EnumLink.OrangeLink:
            return s.orangeColor;
        case EnumLink.VioletLink:
            return s.violetColor;
        case EnumLink.YellowLink:
            return s.yellowColor;
        case EnumLink.BlueSkyLink:
            return s.blueSkyColor;
        default:
            break;
    }
}
export function formatlargeValue(value, decimal = 1) {
    if (!value) return 0;
    if (value === '--') return '--';
    let newValue = parseInt(Math.abs(value));
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const suffixNum = Math.floor((('' + newValue).length - 1) / 3);
    let shortValue = parseFloat(suffixNum !== 0 ? value / Math.pow(1000, suffixNum) : value);
    shortValue = Math.round(shortValue * Math.pow(10, decimal)) / Math.pow(10, decimal);
    if (shortValue % 1 === 0) {
        shortValue = parseInt(shortValue);
    }
    return shortValue + suffixes[suffixNum];
}

export function checkUTCTime() {
    let hoursUTC;
    let date = new Date()
    hoursUTC = date.getUTCHours()
    if (hoursUTC > 9 && hoursUTC < 17) {
        return true
    } else {
        return false
    }
}

export function OnNews() {
    let date = new Date();
    var hoursUTC = date.getUTCHours()
    var mins = date.getMinutes();
    if (hoursUTC === 16 && mins <= 13) {
        return true
    }
    if (hoursUTC >= 3 && hoursUTC < 16) {
        return true
    } else {
        return false
    }
}

const START_DAY = {
    HOUR: 8,
    MINUTE: 30
};

const END_DAY = {
    HOUR: 8,
    MINUTE: 29,
    SECOND: 59,
    MILISECOND: 999
};

export function mapError(reasons, orderType) {
    try {
        if (reasons === 'AF_ERROR') {
            if (orderType === orderEnum.NEW_ORDER) {
                reasons += '_NEW_ORDER'
            } else if (orderType === orderEnum.MODIFY_ORDER) {
                reasons += '_MODIFY_ORDER'
            }
        }
        if (typeof reasons === 'number') reasons = (reasons).toString()
        if (!/\s/.test(reasons)) {
            reasons = 'error_code_' + reasons
        }
        return orderEnumNew[reasons] || reasons;
    } catch (error) {
        logger.error('mapError On OrderList' + error)
    }
}

export function changeColor(value) {
    try {
        let style = {};
        if (!value) return;
        value = formatNumberNew2(value, 2)
        if (value === 0 && value === '--') {
            return style = { color: 'var(--secondary-default)' }
        } else if (value < 0) {
            return style = { color: Color.SELL }
        } else if (value > 0) {
            return style = { color: Color.BUY }
        }
        return null
    } catch (error) {
        logger.error('changeColor On ModifyOrder' + error)
    }
}

export function changeColorByTrend(value) {
    try {
        let style = {};
        if (!value) return;
        if (value === 'None') {
            return style = { color: 'var(--secondary-default)' }
        } else if (value === 'Up') {
            return style = { color: Color.BUY }
        } else if (value === 'Down') {
            return style = { color: Color.SELL }
        }
        return null
    } catch (error) {
        logger.error('changeColorByTrend On ModifyOrder' + error)
    }
}

export function changeColorBySide(side) {
    try {
        const style = getComputedStyle(document.body)
        if (side === 'BUY') {
            return { color: style.getPropertyValue('--buy-light') }
        } else {
            return { color: style.getPropertyValue('--sell-light') }
        }
    } catch (error) {
        logger.error('changeColorBySide On ModifyOrder' + error)
    }
}

export function renderExchange(exchange) {
    if (exchange) {
        if (exchange === 'XNAS') {
            return 'NASDAQ'
        } else if (exchange === 'XNYS') {
            return 'NYSE'
        } else {
            return exchange
        }
    } else {
        return exchangeEnum.TRADE_MATCH
    }
}

export function sortData(listData) {
    let listTrans = [];
    const mappingSymbol = {};
    for (const symbol in listData) {
        const mappingOrderId = {};
        if (!mappingSymbol[symbol]) mappingSymbol[symbol] = { symbol, sub_total: listData[symbol].sub_total, list_tran: [] }
        listTrans = listData[symbol].list_tran && listData[symbol].list_tran.length > 1 ? listData[symbol].list_tran.sort((a, b) => b.date - a.date) : listData[symbol].list_tran;
        mappingSymbol[symbol].updated = listTrans[0].date;
        for (let index = 0; index < listTrans.length; index++) {
            const element = listTrans[index];
            const orderId = element.broker_order_id;
            if (!mappingOrderId[orderId]) {
                mappingOrderId[orderId] = { updated: element.date, list_tran: [] };
                mappingOrderId[orderId].list_tran.push(element)
            } else {
                mappingOrderId[orderId].list_tran.push(element)
            }
        }
        for (const orderId in mappingOrderId) {
            let listTemp = mappingOrderId[orderId].list_tran;
            if (listTemp.length > 1) {
                listTemp.unshift(listTemp[listTemp.length - 1]);
                listTemp = listTemp.slice(0, listTemp.length - 1);
            }
            const tmp = mappingSymbol[symbol].list_tran;
            mappingSymbol[symbol].list_tran = [...tmp, ...listTemp];
        }
    }
    let res = [];
    for (const key in mappingSymbol) {
        res.push(mappingSymbol[key]);
    }
    res = res.sort((a, b) => b.updated - a.updated);
    return res;
}

export function getSymbolStringQuery(listData) {
    let stringQuery = '';
    for (let i = 0; i < listData.length; i++) {
        const element = listData[i];
        const symbol = typeof element === 'string' ? element : element.symbol;
        if (symbol && !dataStorage.symbolsObjDic[symbol]) {
            stringQuery += `${encodeURIComponent(symbol)},`
        }
    }
    return stringQuery;
}
export function getActionType(state, textOnly) {
    const tran = (() => {
        switch (state) {
            case orderState.UNKNOWN:
                return ''
            case orderState.NEW:
                return 'lang_new'
            case orderState.PARTIALLY_FILLED:
                return 'lang_partially_filled'
            case orderState.FILLED:
                return 'lang_filled'
            case orderState.DONE_FOR_DAY:
                return 'lang_done_for_day'
            case orderState.CANCELLED:
                return 'lang_cancelled'
            case orderState.REPLACED:
                return 'lang_replaced'
            case orderState.PENDING_CANCEL:
                return 'lang_pending_cancel'
            case orderState.STOPPED:
                return 'lang_stopped'
            case orderState.REJECTED:
                return 'lang_rejected'
            case orderState.SUSPENDED:
                return 'lang_suspended'
            case orderState.PENDING_NEW:
                return 'lang_pending_new'
            case orderState.CALCULATED:
                return 'lang_calculated'
            case orderState.EXPIRED:
                return 'lang_expired'
            case orderState.ACCEPTED_FOR_BIDDING:
                return 'lang_accepted_for_bidding'
            case orderState.PENDING_REPLACE:
                return 'lang_pending_replace'
            case orderState.PLACE:
                return 'lang_place'
            case orderState.REPLACE:
                return 'lang_replace'
            case orderState.CANCEL:
                return 'lang_cancel'
            case orderState.CLIENT_PLACE_ERROR:
                return 'lang_client_place_error'
            case orderState.CLIENT_AMEND_ERROR:
                return 'lang_client_amend_error'
            case orderState.CLIENT_CANCEL_ERROR:
                return 'lang_client_cancel_error'
            case orderState.REJECT_ACTION_CANCEL:
                return 'lang_reject_action_cancel'
            case orderState.REJECT_ACTION_REPLACE:
                return 'lang_reject_action_replace'
            case orderState.PURGED:
                return 'lang_purged'
            case orderState.APPROVE_TO_CANCEL:
                return 'lang_approve_to_cancel'
            case orderState.APPROVE_TO_REPLACE:
                return 'lang_approve_to_replace'
            case orderState.TRIGGER:
                return 'lang_trigger'
            case orderState.DENY_TO_CANCEL:
                return 'lang_deny_to_cancel'
            case orderState.DENY_TO_REPLACE:
                return 'lang_deny_to_replace'
        }
    })();
    if (!tran) return state;
    return textOnly ? dataStorage.translate(tran) : <Lang>{tran}</Lang>
}

export function getOrigination(state) {
    return origination[state] ? dataStorage.translate(origination[state]).toUpperCase() : '--'
}

// Use to count the decimal part of a number
export function countDecimalPart(number) {
    const parsedNumber = number.toString();
    const decimalPartIndex = parsedNumber.indexOf('.');

    if (decimalPartIndex === -1) {
        return 0;
    }

    const decimalPart = parsedNumber.slice((decimalPartIndex + 1), parsedNumber.length);

    return decimalPart.length;
}

// Check if object has specific path
export const objHasPath = (obj, path = '') => {
    let _obj = obj;

    if (typeof path !== 'string') {
        return false;
    }

    const keys = path.trim().split('.');

    if (
        keys.length === 0 ||
        path.trim().length === 0
    ) {
        return true;
    }

    for (const key of keys) {
        if (key.trim().length === 0) {
            continue
        }

        if (
            !_obj ||
            (!_obj[key] && _obj[key] !== null)
        ) {
            return false;
        } else {
            _obj = _obj[key];
        }
    }

    return true;
}

export function getUTCTime({ hour = 0, minute = 0, second = 0, milisecond = 0, date = 0, month = 0, year = 0, timezone = 0 }) {
    const current = new Date();
    current.setUTCHours(hour);
    current.setUTCMinutes(minute);
    current.setUTCSeconds(second);
    current.setUTCMilliseconds(milisecond);
    current.setUTCDate(date);
    current.setUTCMonth(month - 1);
    current.setUTCFullYear(year);
    return current.getTime() - (timezone * 60 * 60 * 1000);
}

export function addDay(time, days) {
    return time + days * 24 * 60 * 60 * 1000;
}

export function getNumberToCharDate(date) {
    if (!date) return '--'
    return moment(date).format('DD MMM YYYY')
}
export function getDateOfTimeZoneFormatObj(date) {
    if (date) {
        let strTime = moment(date).tz(dataStorage.timeZone).format();
        return new Date(strTime.substring(0, 10) + 'Z');
    }
    let strTime = moment().tz(dataStorage.timeZone).format();
    return new Date(strTime.substring(0, 10) + 'Z');
}

export function getStartDay(timeStr, timezone) {
    try {
        const lstFrom = timeStr.split('/');
        const optFrom = {
            hour: START_DAY.HOUR,
            minute: START_DAY.MINUTE,
            date: parseInt(lstFrom[0], 10),
            month: parseInt(lstFrom[1], 10),
            year: parseInt(lstFrom[2]),
            timezone
        };
        return getUTCTime(optFrom);
    } catch (err) {
        logger.error(`Error get start day with err: ${err}`);
        return 0;
    }
}

export function getEndDay(timeStr, timezone, numberDayAdded = 1) {
    try {
        const lstTo = timeStr.split('/');
        const optTo = {
            hour: END_DAY.HOUR,
            minute: END_DAY.MINUTE,
            second: END_DAY.SECOND,
            milisecond: END_DAY.MILISECOND,
            date: parseInt(lstTo[0], 10),
            month: parseInt(lstTo[1], 10),
            year: parseInt(lstTo[2]),
            timezone
        };
        return addDay(getUTCTime(optTo), numberDayAdded);
    } catch (err) {
        console.warn(`Error get end day with err: ${err}`);
        return 0;
    }
}

export function getTimestampUTCNoneDMY(dateStr) {
    const dateStrArr = dateStr.split('/');
    const day = parseInt(dateStrArr[0], 10);
    const month = parseInt(dateStrArr[1], 10);
    const year = parseInt(dateStrArr[2], 10)
    const now = new Date();
    now.setUTCFullYear(year)
    now.setUTCMonth(month - 1)
    now.setUTCDate(day)
    now.setUTCHours(0)
    now.setUTCMinutes(0)
    now.setUTCSeconds(0)
    now.setUTCMilliseconds(0)

    return new Date(now).getTime();
}

export function enableOrder(account) {
    if (!dataStorage.userInfo) return false;
    if (!account) return false;
    if (!account.status || account.status === 'inactive') return false;
    return true;
}

export function chechAccountState(accountId) {
    return new Promise(resolve => {
        if (!dataStorage.userInfo) resolve(false)
        if (dataStorage.accountsObjDic[`${accountId}`]) {
            if (!dataStorage.accountsObjDic[`${accountId}`].status) resolve(false)
        } else {
            const url = helper.getUrlAnAccount(accountId);
            helper.getData(url).then(snap => {
                if (!snap || snap.error) return false;
                const accountInfo = snap && snap.data && snap.data[0] ? snap.data[0] : null;
                dataStorage.accountsObjDic[`${accountId}`] = accountInfo;
                if (!accountInfo || !accountInfo.status || accountInfo.status === 'inactive') resolve(false)
                resolve(true)
            }).catch(() => {
                resolve(false)
            })
        }
    })
}

export function genOrderType(orderTypeValue) {
    if (orderTypeValue) {
        if (orderTypeValue === orderType.STOPLOSS) {
            return orderType.STOP
        }
        return orderTypeValue
    }
}

export function mapContentWarning(success, typeConfirm) {
    try {
        switch (typeConfirm) {
            case orderEnum.NEW_ORDER:
                if (success) {
                    return 'lang_place_order_successfully'
                }
                return 'lang_placing_order'
            case orderEnum.MODIFY_ORDER:
                if (success) {
                    return 'lang_modify_order_successfully'
                }
                return 'lang_modifying_order'
            case orderEnum.CANCEL_ORDER:
                if (success) {
                    return 'lang_cancel_order_successfully'
                }
                return 'lang_cancelling_order'
            default:
                return ''
        }
    } catch (error) {
        logger.error('mapContentWarning On ConfirmOrder' + error)
    }
}

export function showNumber2(number) {
    try {
        if (!number) return null;
        const num = roundFloat(number, 2);
        if (!num) return null;
        return num;
    } catch (error) {
        logger.error('show number ' + error);
        return null;
    }
}

export function showNumber(number) {
    try {
        if (!number) return null;
        const num = roundFloat(number, 3);
        if (!num) return null;
        return num;
    } catch (error) {
        logger.error('show number ' + error);
        return null;
    }
}

export function checkHaveData(data) {
    if (data && data.series) {
        for (let i = 0; i < data.series.length; i++) {
            let series = data.series[i];
            for (let j = 0; j < series.data.length; j++) {
                if (series.data[j] !== 0) {
                    return true
                }
            }
        }
        return false
    }
}

export function checkTimeOnNews(time) {
    try {
        let timeString = moment(time).fromNow().toString()
        if (timeString === 'a few seconds ago' || timeString === 'a minute ago') {
            return false
        }
        if (timeString.indexOf('minute') > 0) {
            if (parseInt(timeString.slice(0, 2)) - 20 <= 0) {
                return false
            }
        }
        return true
    } catch (error) {
        logger.error('OnNews On News', error)
    }
}

export function canDownloadNew(time, item) {
    if (time && typeof time === 'string') {
        time = moment(time).format('x');
        time = parseInt(time);
    }
    const newsDelayTime = dataStorage.userInfo && dataStorage.userInfo.live_news ? 0 : 20;
    const DOWNLOADABLE_TIME = newsDelayTime * 60 * 1000;
    try {
        const currentTime = new Date().getTime();
        if (time + DOWNLOADABLE_TIME > currentTime) {
            const remainTime = time + DOWNLOADABLE_TIME - currentTime;
            if (item && item.news_id) {
                setTimeout(() => {
                    let downloadButtons = document.getElementsByClassName(item.news_id);
                    if (downloadButtons && downloadButtons.length) {
                        for (let index = 0; index < downloadButtons.length; index++) {
                            const downloadBtnDom = downloadButtons[index];
                            if (downloadBtnDom && downloadBtnDom.style) {
                                downloadBtnDom.style.fill = 'var(--hover-default)';
                            }
                        }
                    }
                }, remainTime)
            }
            return false;
        }
        return true;
    } catch (error) {
        logger.error('On canDownloadNew: ', error)
    }
}

export function checkDownloadNews(time) {
    if (time && typeof time === 'string') {
        time = moment(time).format('x');
        time = parseInt(time);
    }
    const newsDelayTime = dataStorage.userInfo && dataStorage.userInfo.live_news ? 0 : 20;
    const DOWNLOADABLE_TIME = newsDelayTime * 60 * 1000;
    const currentTime = new Date().getTime();
    if (time + DOWNLOADABLE_TIME > currentTime) return false;
    return true;
}

export function getTopCompany(type, cb, userId) {
    try {
        const url = helper.makeSymbolDynamicWatchlistUrl(type + '/' + (userId || 0));
        helper.getData(url).then(bodyData => {
            let data = bodyData && bodyData.data && bodyData.data.value;
            if (!data) data = [];
            cb(data, type, false, bodyData.data.watchlist_name)
        }).catch((err) => {
            cb(null, type, true, '')
        });
    } catch (error) {
        logger.error('getTopCompany' + error)
    }
}

export async function getIntradayNews(querry) {
    return new Promise(resolve => {
        const urlIntraday = helper.makeNewsIntradayUrl(querry);
        helper.getData(urlIntraday).then((response) => {
            resolve(response.data || {});
        }).catch(() => {
            logger.error('can not get data symbol index');
            resolve({});
        })
    });
}

export async function getCompanyInfo(symbolStringQuery) {
    try {
        return new Promise((resolve) => {
            const urlMarketInfo = helper.makeSymbolUrl(symbolStringQuery)
            helper.getData(urlMarketInfo).then(response => {
                if (response.data) {
                    for (let i = 0; i < response.data.length; i++) {
                        const element = response.data[i];
                        dataStorage.symbolsObjDic[element.symbol] = element;
                    }
                    resolve(response.data)
                }
            }).catch(err => {
                logger.error(err);
                resolve([])
            })
        });
    } catch (error) {
        logger.error('getCompanyInfo On TransactionSummary' + error)
    }
}

export function hideElement(props, hide, id, cb) {
    const newId = id;
    const c = props.glContainer._contentElement[0];
    const p = props.glContainer._element[0];
    if (hide) {
        if (p.contains(c)) {
            if (!p.react) {
                const dom = c.querySelector('.wrapComponent');
                p.react = dom && dom.react;
            }
            p.removeChild(c);
            cb && cb()
            const div = document.createElement('div');
            if (newId) {
                div.id = `busyBoxFull${newId}`;
                div.className = `busyBoxFull ${newId} text-capitalize`;
                div.innerText = dataStorage.translate('lang_loading_progress')
                p.appendChild(div);
            }
        }
    } else {
        if (newId) {
            setTimeout(() => {
                if (!p.contains(c)) {
                    p.appendChild(c);
                    setTimeout(() => {
                        const someNode = document.getElementById(`busyBoxFull${newId}`);
                        someNode && someNode.parentNode && someNode.parentNode.removeChild(someNode);
                    }, 500);
                    cb && cb()
                }
            }, 500);
        } else {
            if (!p.contains(c)) {
                p.appendChild(c);
            }
        }
    }
}

export function todo(string) {
    if (!string) return;
    if (typeof string !== 'string') string += '';
    const newString = btoa(string);
    localStorageNew.setItem('saveKey', newString);
}

export function dodone(cb) {
    const string = localStorageNew.getItem('saveKey');
    if (!string || string === 'undefined') cb && cb(null);
    const newString = atob(string);
    cb && cb(newString);
}

export function clearPrice() {
    for (const key in dataStorage.dicClearRealtime) {
        dataStorage.dicClearRealtime && dataStorage.dicClearRealtime[key] && dataStorage.dicClearRealtime[key]()
    }
    const lst = dataStorage.goldenLayout.goldenLayout && dataStorage.goldenLayout.goldenLayout.root.getItemsByType('component');
    if (lst && lst.length) {
        for (let i = 0; i < lst.length; i++) {
            const data = lst[i].element[0].react && lst[i].element[0].react.props.glContainer.getState()
            if (data && data.price) {
                lst[i].element[0].react && lst[i].element[0].react.broadcast && lst[i].element[0].react.broadcast({ isClear: true }, 'force')
            }
        }
    }
}

export function autoLoginWithoutVerifyPin(refreshToken) {
    dodone(res => {
        if (res) {
            postDecode(res, refreshToken).then(res => {
                if (res && res.data) {
                    const dataRefresh = res.data;
                    postRefreshWithoutPin(dataRefresh.token, () => {
                        autoRefreshToken(dataRefresh.token);
                        afterLogin(() => {
                            saveDataWhenChangeEnv();
                            dataStorage.isGuest = false;
                            func.emitter(emitter.MAIN_FORM, eventEmitter.CHANGE_MAIN_STATE, formState.AFTER_LOGIN)
                            dataStorage.goldenLayout.initGoldenLayout()
                        }, null);
                    });
                }
            }).catch((err) => {
                const errorCode = err.response && err.response.errorCode
                logger.sendLog(`DECODE ERROR: ${errorCode}`);
                if (errorCode === 'INVALID_TOKEN' || errorCode === 'TOKEN_WAS_CHANGED' || errorCode === 2089) {
                    logout();
                } else {
                    // func.emitter(emitter.MAIN_FORM, eventEmitter.CHANGE_MAIN_STATE, formState.VERIFY_PIN)
                    showModal({
                        component: Pin,
                        props: {
                            title: 'firstLogin',
                            canClose: !dataStorage.requireTime,
                            success: (pin) => {
                                pin && todo(pin);
                                dataStorage.goldenLayout.initGoldenLayout();
                            }
                        }
                    });
                }
            })
        } else {
            // func.emitter(emitter.MAIN_FORM, eventEmitter.CHANGE_MAIN_STATE, formState.VERIFY_PIN)
            showModal({
                component: Pin,
                props: {
                    title: 'firstLogin',
                    canClose: !dataStorage.requireTime,
                    success: (pin) => {
                        pin && todo(pin);
                        dataStorage.goldenLayout.initGoldenLayout();
                    }
                }
            });
        }
    });
}

export function tempFormatDigit(number, numDecimal) {
    const text = typeof number === 'number' ? this.formatNumberNew2(number, numDecimal, true) + '' || '0.00' : (this.formatNumberNew2(number, numDecimal, true) || '0.00');
    const strTemp = text.replace(/([^-]+)/, '$$' + '$1 ' + 'AUD');
    return (
        <div className="itemRight">
            {strTemp}
        </div>
    )
}

export function tempFormatDigitPercent(number, numDecimal) {
    const text = typeof number === 'number' ? formatNumberNew2(number, numDecimal, true) + '' || '0.00' : (formatNumberNew2(number, numDecimal, true) || '0.00');
    let txtValue = text;
    if (number === '--') {
        txtValue = '--'
    } else {
        txtValue = text.replace(/([^-]+)/, '$1 ' + '%')
    }
    if (number < 0) {
        return (
            <div className="itemRight" style={{ color: Color.SELL }}>
                {txtValue}
            </div>
        )
    } else if (number > 0) {
        return (
            <div className="itemRight" style={{ color: Color.BUY }}>
                {txtValue}
            </div>
        )
    } else if (number === 0) {
        return (
            <div className="itemRight">
                {txtValue}
            </div>
        )
    } else if (number === '--') {
        return (
            <div className="itemRight">
                {txtValue}
            </div>
        )
    }
}

export function getTradingMarketString(tradingMarket) {
    try {
        const newTradingMarket = (tradingMarket + '').replace('[Demo]', '');
        if (newTradingMarket === 'ASX:TM') {
            return 'ASX TradeMatch Market';
        }
        if (newTradingMarket === 'ASX:CP') {
            return 'ASX Centre Point';
        }
        return newTradingMarket;
    } catch (error) {
        logger.error('getTradingMarketString On OrderList ', error)
    }
}

export function calculatePositionSearchBox(dom, parentDom) {
    if (dom) {
        let searchSuggest = getDropdownContentDom()
        searchSuggest.innerHTML = '';
        searchSuggest.appendChild(dom);
        const p = parentDom.getBoundingClientRect()
        const left = p.left;
        const top = p.top;
        const right = document.body.clientWidth - left;
        const bottom = document.body.clientHeight - top - parentDom.clientHeight;

        if (right < dom.clientWidth) {
            dom.style.left = null;
            dom.style.right = (right - parentDom.clientWidth) + 'px';
        } else {
            dom.style.right = null;
            dom.style.left = left + 'px';
        }
        dom.style.top = (top + parentDom.clientHeight) + 'px';
        if (bottom < dom.clientHeight) {
            dom.style.bottom = null;
            dom.style.height = bottom;
        } else {
            dom.style.bottom = null;
        }
    }
}

export function getDisplayExchangeByExchange(exchange) {
    if (!exchange || !exchangeTradingMarketEnum[exchange]) {
        return '--'
    }
    return exchangeTradingMarketEnum[exchange].display ? exchangeTradingMarketEnum[exchange].display : '--'
}

export function getDisplayExchange(data) {
    let resultExchange = '--'
    let tradingMarket = data.trading_market;
    let listTradingMarket = data.list_trading_market && data.list_trading_market[0]
    if (tradingMarket) {
        tradingMarket = tradingMarket.replace('[Demo]', '')
    }
    if (isAUSymbol(data)) {
        if (tradingMarket === 'NSX:NSX' || tradingMarket === 'BSX:BSX' || listTradingMarket === 'BSX:BSX' || listTradingMarket === 'NSX:NSX') {
            resultExchange = data.display_exchange
        } else {
            resultExchange = exchangeTradingMarketEnum[tradingMarket] ? exchangeTradingMarketEnum[tradingMarket].display : (data.display_exchange ? data.display_exchange : '--')
        }
    } else {
        resultExchange = data.display_exchange
    }
    if (!resultExchange || resultExchange === 'undefined') return '--'
    return resultExchange;
}

export function mapData(src) {
    try {
        return {
            ...src,
            account_name: src.account_name || '--',
            account_id: src.account_id || '--',
            display_order_id: src.display_order_id,
            side: Number(src.is_buy) ? 'Buy' : 'Sell',
            quantity: src.volume,
            filled_price: src.avg_price,
            passed_state: src.passed_state || [],
            display_exchange: getDisplayExchange(src)
        }
    } catch (error) {
        logger.error('mapData On OrderList ', error)
    }
}

export function colorOrder(state) {
    switch (state) {
        case orderState.NEW:
        case orderState.REPLACED:
        case orderState.CALCULATED:
        case orderState.DONE_FOR_DAY:
        case orderState.ACCEPTED_FOR_BIDDING:
        case orderState.PARTIALLY_FILLED:
        case orderState.TRIGGER:
            return '--background-yellow';
        case orderState.PLACE:
        case orderState.REPLACE:
        case orderState.CANCEL:
        case orderState.PENDING_CANCEL:
        case orderState.PENDING_REPLACE:
        case orderState.PENDING_NEW:
        case orderState.APPROVE_TO_CANCEL:
        case orderState.APPROVE_TO_REPLACE:
            return '--background-lightblue';
        case orderState.STOPPED:
        case orderState.SUSPENDED:
        case orderState.REJECTED:
        case orderState.EXPIRED:
        case orderState.CANCELLED:
        case orderState.PURGED:
        case orderState.DENY_TO_CANCEL:
        case orderState.DENY_TO_REPLACE:
            return '--background-red'
        case orderState.FILLED:
            return '--background-green'
    }
    return '';
}
export function colorOrderWebSevices(state) {
    switch (state) {
        case orderStateWebSV.PURGE:
            return 'OrderYellow';
        case orderStateWebSV.AMEND:
            return 'OrderGray';
        case orderStateWebSV.CANCEL:
            return 'OrderRed'
        case orderStateWebSV.CREATE:
            return 'OrderGreen'
    }
    return '';
}
export function colorOrderWebSevicesActionState(state) {
    switch (state) {
        case actionStateWebSV.PENDING:
            return 'OrderYellow';
        case actionStateWebSV.QUEUED:
        case actionStateWebSV.AUTHORIZING:
            return 'OrderGray';
        case actionStateWebSV.FAILED:
        case actionStateWebSV.DENIED:
            return 'OrderRed'
        case actionStateWebSV.OK:
            return 'OrderGreen'
    }
    return '';
}

export function filterMatched(data, filterText) {
    const filteredText = filterText.toLocaleLowerCase()
    if ((data.account_id || '').toLocaleLowerCase().indexOf(filteredText) > -1) return true;
    if ((data.display_order_id || '').toLocaleLowerCase().indexOf(filteredText) > -1) return true;
    if ((data.symbol || '').toLocaleLowerCase().indexOf(filteredText) > -1) return true;
    return false;
}

export function checkIsAdvisor() {
    return dataStorage.userInfo && dataStorage.userInfo.user_type === userTypeEnum.ADVISOR;
}

export function getStartTime(filterDuration) {
    const now = moment().tz(dataStorage.timeZone)._d;
    let startTime = moment().tz(dataStorage.timeZone)._d;
    startTime.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    filterDuration = filterDuration.toLowerCase()
    switch (filterDuration) {
        case 'day':
            startTime = addDaysToTimeNoChangeHour(now, 0);
            break;
        case 'week':
            startTime = addDaysToTimeNoChangeHour(now, -6);
            break;
        case 'month':
            startTime = addMonthsToTimeNoChangeHour(now, -1);
            break;
        case 'quarter':
            startTime = addMonthsToTimeNoChangeHour(now, -3);
            break;
        case 'year':
            startTime = addMonthsToTimeNoChangeHour(now, -12);
            break;
        default:
            break;
    }

    startTime = convertTimeFormatToTimeStamp(startTime, dataStorage.timeZone);
    return startTime
}

export function minusDate(date) {
    return moment(date).add(-1, 'days')
}

export function convertStartEndTimeToStr(filterDuration, isStart) {
    if (isStart) {
        let startTime = getStartTime(filterDuration)
        return moment(startTime).tz('GMT').format('DD/MM/YY-HH:mm:ss.sss')
    }
    let endTime = getEndTime()
    return moment(endTime).tz('GMT').format('DD/MM/YY-HH:mm:ss.sss')
}
export function getEndTime() {
    const now = moment().tz(dataStorage.timeZone)._d
    let endTime;
    endTime = convertTimeFormatToTimeStamp(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1), dataStorage.timeZone, true)
    return endTime
}

export function addDaysToTimeNoChangeHour(time, days) {
    try {
        return moment(time).add(days, 'd').toDate();
    } catch (error) {
        logger.error(error);
    }
    return time;
}

export function addMonthsToTimeNoChangeHour(time, months) {
    try {
        return addDaysToTimeNoChangeHour(moment(time).add(months, 'M').toDate(), 1);
    } catch (error) {
        logger.log(error);
    }
    return time;
}

export function calSumTotalVol(listAsk, listBid) {
    try {
        let listVol = [];
        const objTotal = {}
        for (let i = 0; i < listAsk.length; i++) {
            const element = listAsk[i];
            listVol.push(element.quantity || 0);
        }
        for (let j = 0; j < listBid.length; j++) {
            const element = listBid[j];
            listVol.push(element.quantity || 0)
        }
        objTotal.totalVol = Math.max(...listVol)
        return objTotal;
    } catch (error) {
        logger.error('calSumTotalVol On MarketDepth' + error)
    }
}

export function renderClass(value) {
    let className = ''
    switch (value) {
        case 'NORMAL':
        case 'VERIFIED':
        case 'STREAMING':
        case 'ACTIVE':
            className = 'bg-green'
            break;
        case 'INACTIVE':
        case 'PENDING VERIFICATION':
        case 'DELAYED':
        case 'NOT_CREATED':
        case 'NOT_CONFIGURED':
            className = 'bg-orange'
            break;
        case 'CLICK2REFRESH':
        case 'PENDING EMAIL VERIFICATION':
            className = 'bg-yellow'
            break;
        case 'BLOCK':
        case 'NO ACCESS':
        case 'CREATING':
        case 'CONFIGURING':
        case 'LOADING_COMPLETED':
            className = 'bg-gray'
            break;
        case 'CLOSED':
        case 'RETAIL':
        case 'ADMIN BLOCKED':
        case 'SECURITY BLOCKED':
            className = 'bg-red'
            break;
        case 'INTERNAL ONLY':
        case 'OPERATOR':
            className = 'bg-lightblue'
            break;
        case 'FIRST INTERNAL THEN EXTERNAL':
        case 'ADVISOR':
        case 'EMPTY':
            className = 'bg-primary'
            break;
        default:
            className = ''
    }
    return className
}

export function getDisplayRole() {
    const role = dataStorage.userInfo && dataStorage.userInfo.user_type
    switch (role) {
        case userTypeEnum.OPERATOR:
            return 'Operation';
        case userTypeEnum.ADVISOR:
            return 'Advisor';
        case userTypeEnum.RETAIL:
            return 'Retail';
    }
    return '';
}

export function validateEmail(emailString) {
    const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9-]+)*$/;
    return emailString.length <= 255 && EMAIL_PATTERN.test(emailString.toLocaleLowerCase())
}

export function getCountryFromExchange(exchange) {
    const symbolObj = exchangeTradingMarketEnum[exchange];
    if (!symbolObj) return 'au';
    return symbolObj.flag;
}

export function isAUSymbol(exchange) {
    if (exchange.country) {
        return exchange.country === 'AU'
    }
    return getCountryFromExchange(exchange) === 'au'
}

export function getDurationByExchange(exchange) {
    const durations = [
        {
            label: durationeEnum['GTC'],
            value: 'GTC'
        },
        {
            label: durationeEnum['GTD'],
            value: 'GTD'
        },
        {
            label: durationeEnum['FOK'],
            value: 'FOK'
        },
        {
            label: durationeEnum['FAK'],
            value: 'FAK'
        },
        {
            label: durationeEnum['DAY'],
            value: 'DAY'
        }
    ]
    switch (exchange) {
        case 'BESTMKT':
            return durations
        case 'ASX':
            return durations
        case 'ASXCP':
            return durations
        case 'CXA':
            return durations
        case 'CXACP':
            return durations
        case 'qCXA':
            return durations
        default:
            return [];
    }
}

export function allowC2r(symbol) {
    const exchange = symbol.split('.')[1];
    let marketType
    if (dataStorage.marketDataType) marketType = dataStorage.marketDataType[exchange]
    else marketType = 1
    return !(marketType === marketDataTypeEmums.STREAMING)
}

export function checkValidTranslation(text) {
    if (/[:\s]/.test(text)) {
        return false
    }
    return true
}

export function closeModalForm(dom, close) {
    const modalContainer = dom && dom.parentNode && dom.parentNode.parentNode;
    const currentForm = dom && dom.parentNode;
    modalContainer.lastChild === currentForm && close();
}

export function exportTimeZone(timeZone, time, IsDate) {
    let zoneNum = moment().tz(timeZone || 'Europe/Paris').format('Z')
    let timeStampAfterConvert = moment(time).utcOffset(zoneNum)
    if (!IsDate) {
        return timeStampAfterConvert
    } else {
        return new Date(timeStampAfterConvert)
    }
}

export function getIndexOfTimeZone(timeZone, hasGMT) {
    let zoneNum = moment().tz(timeZone || 'Europe/Paris').format('Z')
    if (hasGMT) {
        return ' (GMT' + zoneNum + ')'
    }
    return zoneNum
}

export function translateTime(timeStr, isOnlyDate = true, timeZone, IsString, haveHours = true) {
    if (!timeStr) return '--'
    var timeZone1;
    if (typeof timeZone === 'object') timeZone1 = timeZone.location;
    else timeZone1 = timeZone;
    let time = moment(timeStr).tz(timeZone1 || 'Europe/Paris').format('LLL');
    let DD = moment(timeStr).tz(timeZone1 || 'Europe/Paris').format('DD');
    let zoneNum = moment().tz(timeZone1 || 'Europe/Paris').format('Z')
    let arTime = time.split(' ')
    const MMM = (arTime[0] + '').slice(0, 3);
    const YYYY = (arTime[2] + '');
    let TIME = haveHours ? moment(timeStr).tz(timeZone1 || 'Europe/Paris').format('HH:mm:ss') : '';
    if (IsString) {
        return DD + ' ' + MMM + ' ' + YYYY + ' ' + TIME
    }
    return <span>{DD + ' ' + MMM + ' ' + YYYY + ' ' + TIME}</span>
}

export function translateTime1(timeStr, isOnlyDate = true, timeZone, IsString) {
    if (!timeStr) return '--'
    let time = moment(timeStr).tz(timeZone || dataStorage.timeZone).format('DD/MM/YYYY HH:mm:ss');
    let zoneNum = moment().tz(timeZone || dataStorage.timeZone).format('Z')
    let TIME = moment(timeStr).tz(timeZone || dataStorage.timeZone).format('HH:mm:ss')
    if (IsString) {
        return time
    }
    return <span>{time}</span>
}

export function convertTimeFormatToTimeStamp(time, timeZone, isTo) {
    let timeAfterConvert = moment.tz(moment(time).format('YYYY-MM-DDTHH:mm:ss'), timeZone).tz('GMT').format()
    return new Date(timeAfterConvert).getTime()
}

export function convertFormatStpFilter(date, timeZone, isMin) {
    const dateConver = moment(date).tz(timeZone || dataStorage.timeZone);
    if (!isMin) {
        dateConver.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
        return new Date(dateConver).getTime()
    }
    dateConver.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    return new Date(dateConver).getTime()
}

export function convertFormatStpOfPicker(date, timeZone, isMin) {
    if (!(date + '').includes('GMT')) {
        let dateAfterConvert = moment(date).format('YYYY-MM-DD')
        let indexZone = moment().format('Z')
        if (isMin) {
            dateAfterConvert += ' 00:00:00' + indexZone
        } else {
            dateAfterConvert += ' 23:59:59' + indexZone
        }
        let timeStamp1 = convertTimeFormatToTimeStamp(dateAfterConvert, timeZone, !isMin)
        return timeStamp1
    }
    if (isMin) {
        date.setHours(0)
        date.setMinutes(0)
    } else {
        date.setHours(23)
        date.setMinutes(59)
    }
    let timeStamp = convertTimeFormatToTimeStamp(date, timeZone, !isMin)
    return timeStamp
}

export function convertFormatStpOfPicker1(date, timeZone, isMin) {
    if (isMin) {
        date.setHours(0)
        date.setMinutes(0)
        date.setSeconds(0)
        date.setMilliseconds(0)
    } else {
        date.setHours(23)
        date.setMinutes(59)
        date.setSeconds(59)
        date.setMilliseconds(999)
    }
    return moment.tz(moment(date).format('YYYY-MM-DDTHH:mm:ss'), timeZone).tz('GMT').format('DD/MM/YY-HH:mm:ss.SSS')
}
export function convertFormatTimeZone(date) {
    let afterConvert = moment(date).tz(dataStorage.timeZone)
    return afterConvert
}
export function translateJustHourMinute(timeStr, isOnlyDate = true, timeZone, format) {
    if (!timeStr) return '--'

    let zoneNum = moment().tz(timeZone || 'Europe/Paris').format('Z')
    if (format) {
        let time = moment(timeStr).tz(timeZone).format(format)
        return <span>{time || ''}</span>
    }
    const TIME = (timeStr + '').slice(12, 25)
    return <span>{TIME || ''}</span>
}

export function translateJustDate(timeStr, timeZone, format) {
    if (!timeStr) return '--'

    let zoneNum = moment().tz(timeZone || 'Europe/Paris').format('Z')
    if (format) {
        const TIME = moment().tz(timeZone || 'Europe/Paris').format(format)
        return <span>{TIME || ''} (GMT {zoneNum})</span>
    }
    const TIME = moment().tz(timeZone || 'Europe/Paris').format('DD/MM/YYYY')
    return <span>{TIME || ''} (GMT {zoneNum})</span>
}
export function getLogo() {
    const cf = dataStorage.web_config[dataStorage.web_config.common.project]
    const logo = dataStorage.theme === 'theme-light' ? (cf ? cf.branding.logoLight : dataStorage.env_config.branding.logoLight) : (cf ? cf.branding.logoDark : dataStorage.env_config.branding.logoDark)
    return addVerUrl(logo)
}
export function checkTheme(theme) {
    let thisTheme;
    if (theme) {
        thisTheme = theme
    } else {
        if (dataStorage.currentTheme) {
            thisTheme = dataStorage.currentTheme
        } else {
            thisTheme = localStorageNew.getItem('lastTheme', true) || 'theme-dark';
        }
    }
    dataStorage.theme = thisTheme;
    switch (thisTheme) {
        case 'theme-light':
            dataStorage.hrefImg = '/common/light';
            break;
        default:
            dataStorage.hrefImg = '/common/dark';
            break;
    }
}
export function formatSide(data) {
    if (!data) return sideEnum.BUYSIDE;
    if (data.side) {
        return (data.side + '').toUpperCase() || sideEnum.BUYSIDE;
    } else {
        return data.is_buy || data.is_buy === undefined ? sideEnum.BUYSIDE : sideEnum.SELLSIDE;
    }
}
export function formatOrderStateWebSV(data) {
    if (data && data.order_state) {
        return 'INACTIVE'
    } else {
        return 'ACTIVE'
    }
}

export function formatConditionName(data) {
    if (data && data.condition_name) {
        return data.condition_name + ''
    } else {
        return '--'
    }
}

export function formatDisplayName(data) {
    if (data && data.display_name) {
        return data.display_name || ''
    } else if (data && data.symbol) {
        return data.symbol
    } else {
        return '--'
    }
}

export function formatExchange(data) {
    if (data && data.exchange) {
        return data.exchange + ''
    } else {
        return ''
    }
}

export function formatCompanyName(data) {
    if (!data) return '--'
    return (data.company_name || data.company || data.security_name || '--').toUpperCase()
}

export function formatmasterCode(data) {
    if (!data) return '--';
    return (data.display_master_code || data.display_name || '--' + '').toUpperCase();
}

export function formatmasterName(data) {
    if (!data) return '--';
    return (data.display_master_name || data.company_name || data.security_name || '--' + '').toUpperCase();
}

export function formatproduct(data) {
    if (data && data.class) {
        return (data.class + '')
    } else {
        return '--'
    }
}

export function formatAccountName(data) {
    if (data && data.account_name) {
        return data.account_name + ''
    } else {
        return '--'
    }
}

export function formatAccountId(data) {
    if (data && data.account_id) {
        return data.account_id + ''
    } else {
        return '--'
    }
}
export function formatMarketDetail(data) {
    if (data && data.market_detail) {
        return data.market_detail + ''
    } else {
        return '--'
    }
}
export function formatNote(data) {
    if (data && data.origination) {
        return data.origination + ''
    } else {
        return '--'
    }
}

export function formatDate(data) {
    if (data) {
        return moment(data).format('DD/MM/YYYY')
    } else {
        return '--'
    }
}
export function formatExpireDate(data) {
    if (data && data.expire_date) {
        return moment(data.expire_date).tz('GMT').format('DD/MM/YYYY')
    } else {
        return '--'
    }
}
export function formatExpireDateConfirmOrder(data) {
    if (data && data.expire_date) {
        return moment(data.expire_date).format('DD/MM/YYYY')
    } else {
        return '--'
    }
}

export function formatTradingMarket(data) {
    if (data && data.trading_market) {
        return data.trading_market + ''
    } else {
        return '--'
    }
}

export function formatDisplayExchange(data) {
    if (data && data.display_exchange) {
        return data.display_exchange + ''
    } else {
        return '--'
    }
}

export function formatLimitPrice(data) {
    if (data && (data.limit_price || data.limit_price === 0)) {
        return formatNumberPrice(data.limit_price, true)
    } else {
        return '--'
    }
}
export function formatAveragePrice(data) {
    if (data && (data.avg_price || data.avg_price === 0)) {
        return formatNumberPrice(data.avg_price, true)
    } else {
        return '--'
    }
}
export function formatOrderQuantity(data) {
    if (data && (data.volume || data.volume === 0)) {
        return formatNumberVolume(data.volume, true)
    } else {
        return '--'
    }
}
export function formatDoneQuantityToday(data) {
    if (data && (data.done_volume_today || data.done_volume_today === 0)) {
        return formatNumberVolume(data.done_volume_today, true)
    } else {
        return '--'
    }
}
export function formatDoneValueToday(data) {
    if (data && (data.done_value_today || data.done_value_today === 0)) {
        return formatNumberValue(data.done_value_today, true)
    } else {
        return '--'
    }
}
export function formatRootParentOrderNumber(data) {
    if (data && data.root_parent_order_number) {
        return data.root_parent_order_number
    } else {
        return '--'
    }
}
export function formatOrderNumber(data) {
    if (data && data.order_number) {
        return data.order_number
    } else {
        return '--'
    }
}
export function formatparentOrderNumber(data) {
    if (data && data.parent_order_number) {
        return data.parent_order_number
    } else {
        return '--'
    }
}
export function formatPriceMultiplier(data) {
    if (data && (data.price_multiplier || data.price_multiplier === 0)) {
        return formatNumberPrice(data.price_multiplier, true)
    } else {
        return '--'
    }
}

export function formatStopPrice(data) {
    if (data && (data.stop_price || data.stop_price === 0)) {
        return formatNumberPrice(data.stop_price, true)
    } else {
        return '--'
    }
}

export function formatVolume(data) {
    if (data && data.volume) {
        return formatNumberVolume(data.volume, true)
    } else if (data && data.quantity) {
        return formatNumberVolume(data.quantity, true)
    } else {
        return '--'
    }
}

export function getVolume(data) {
    if (data && data.volume) {
        return data.volume
    } else if (data && data.quantity) {
        return data.quantity
    } else {
        return '--'
    }
}

export function formatOrderTypeOrigin(data) {
    if (data && data.order_type_origin) {
        return data.order_type_origin + ''
    } else {
        return '--'
    }
}
export function formatDestination(data) {
    if (data && data.destination) {
        return data.destination + ''
    } else {
        return '--'
    }
}

export function formatInitTimeChart(data, timeZone, isString) {
    // Format of timeStr: 19 Feb 2019 10:10:11
    if (!timeStr) return '--'
    let time = moment(timeStr).tz(timeZone || 'Europe/Paris').format('LLL');
    let zoneNum = moment().tz(timeZone || 'Europe/Paris').format('Z')
    let arTime = time.split(' ')
    const MMM = (arTime[0] + '').slice(0, 3);
    const DD = (arTime[1] + '').slice(0, 2).replace(',', ' ');
    const YYYY = (arTime[2] + '');
    const TIME = (arTime[3] + '')
    if (IsString) {
        return DD + ' ' + MMM + ' ' + YYYY + ' (GMT' + zoneNum + ')'
    }
    return <span>{DD + ' ' + MMM + ' ' + YYYY + ' (GMT' + zoneNum + ')'}</span>
}

export function formatInitTime(data, timeZone, isString, formatType) {
    if (data && data.init_time) {
        if (formatType) return moment(data.init_time).format(formatType)
        return translateTime(moment(data.init_time).format('DD MMM YYYY HH:mm:ss'), true, timeZone, isString)
    } else {
        return '--'
    }
}
export function toDisplayTime(timeStamp, timeZone) {
    if (timeStamp) {
        return translateTime(moment(timeStamp).format('DD MMM YYYY HH:mm:ss'), true, timeZone || dataStorage.timeZone, true)
    } else {
        return '--'
    }
}

export function formatAdvisorCode(data) {
    if (data && data.advisor_code) {
        return data.advisor_code + ''
    } else {
        return '--'
    }
}
export function formatParentOrderId(data) {
    if (data && data.origin_broker_order_id) {
        return data.origin_broker_order_id + ''
    } else {
        if (data && data.broker_order_id) return data.broker_order_id
        return '--'
    }
}
export function formatOrderId(data) {
    if (data && data.broker_order_id) {
        return data.broker_order_id + ''
    } else {
        return '--'
    }
}
export function formatFirstTransaction(data) {
    if (data && data.order_status === 15) {
        return data
    } else {
        return ''
    }
}
export function formatDestinationOrderList(data) {
    if (data && data.destination) {
        return data.destination + ''
    } else {
        return '--'
    }
}

export function formatFilledQuantity(data) {
    if (data && (data.filled_quantity || data.filled_quantity === 0)) {
        return formatNumberVolume(data.filled_quantity, true)
    } else {
        return '--'
    }
}
export function formatDoneValueTotal(data) {
    if (data && (data.done_value_total || data.done_value_total === 0)) {
        return formatNumberValue(data.done_value_total, true)
    } else {
        return '--'
    }
}
export function formatEstimatedValue(data) {
    if (data && (data.estimated_value || data.estimated_value === 0)) {
        return formatNumberValue(data.estimated_value, true)
    } else {
        return '--'
    }
}
export function formatRemainingQuantity(data) {
    if (data && (data.leave_quantity || data.leave_quantity === 0)) {
        return formatNumberVolume(data.leave_quantity, true)
    } else {
        return '--'
    }
}
export function formatUncommittedQuantity(data) {
    if (data && (data.uncommitted_quantity || data.uncommitted_quantity === 0)) {
        return formatNumberVolume(data.uncommitted_quantity, true)
    } else {
        return '--'
    }
}

export function formatFilledPrice(data) {
    if (data && (data.filled_price || data.filled_price === 0)) {
        return formatNumberPrice(data.filled_price, true) || '--'
    } else {
        return '--'
    }
}

export function formatOrderType(data, textOnly) {
    const tran = (() => {
        if (data && data.order_type) {
            switch (data.order_type) {
                case 'LIMIT_ORDER':
                    return 'lang_limit'
                case 'MARKETTOLIMIT_ORDER':
                    return 'lang_MTL'
                case 'MARKET_ORDER':
                    return 'lang_market'
                case 'STOP_ORDER':
                    return 'lang_stop_loss'
                case 'STOPLIMIT_ORDER':
                    if (data.class === 'future') {
                        return 'lang_stop_limit'
                    } else {
                        return 'lang_stop_loss'
                    }
                case 'BEST_ORDER':
                    return 'lang_best'
                case 'DARKLIMIT_ORDER':
                    return 'lang_dark_limit'
            }
        } else {
            return 'lang_default_value'
        }
    })()
    if (!tran) return '--';
    return textOnly ? dataStorage.translate(tran).toUpperCase() : <Lang>{tran}</Lang>
}

export function getCurrency(currency) {
    return '(' + currency + ')'
}

export function formatOrderField(data, field, currency) {
    if (['USD', 'AUD'].indexOf(currency) > -1) {
        if (data && data.hasOwnProperty('order_status')) {
            if (data.order_status === orderState.CANCELLED ||
                data.order_status === orderState.EXPIRED ||
                data.order_status === orderState.REJECTED ||
                data.order_status === orderState.UNKNOWN
            ) {
                return '--'
            } else {
                const orderAction = data.order_action && parseJSON(data.order_action);
                if (orderAction) {
                    return '$' + formatNumberValue(orderAction[field], true)
                } else {
                    return '--'
                }
            }
        } else {
            return '--'
        }
    } else if (currency === 'VND') {
        if (data && data.hasOwnProperty('order_status')) {
            if (data.order_status === orderState.CANCELLED ||
                data.order_status === orderState.EXPIRED ||
                data.order_status === orderState.REJECTED ||
                data.order_status === orderState.UNKNOWN
            ) {
                return '--'
            } else {
                const orderAction = data.order_action && parseJSON(data.order_action);
                if (orderAction) {
                    return formatNumberVolume(orderAction[field], true)
                } else {
                    return '--'
                }
            }
        } else {
            return '--'
        }
    } else {
        if (data && data.hasOwnProperty('order_status')) {
            if (data.order_status === orderState.CANCELLED ||
                data.order_status === orderState.EXPIRED ||
                data.order_status === orderState.REJECTED ||
                data.order_status === orderState.UNKNOWN
            ) {
                return '--'
            } else {
                const orderAction = data.order_action && parseJSON(data.order_action);
                if (orderAction) {
                    return formatNumberValue(orderAction[field], true)
                } else {
                    return '--'
                }
            }
        } else {
            return '--'
        }
    }
}

export function formatEstTotalAud(data, currency) {
    if (['USD', 'AUD'].indexOf(currency) > -1) {
        if (data && data.hasOwnProperty('order_status')) {
            if (data.order_status === orderState.CANCELLED ||
                data.order_status === orderState.EXPIRED ||
                data.order_status === orderState.REJECTED ||
                data.order_status === orderState.UNKNOWN
            ) {
                return '--'
            } else {
                const orderAction = data.order_action && parseJSON(data.order_action);
                if (orderAction) {
                    return '$' + formatNumberValue(orderAction.total_convert, true)
                } else {
                    return '--'
                }
            }
        } else {
            return '--'
        }
    } else if (currency === 'VND') {
        if (data && data.hasOwnProperty('order_status')) {
            if (data.order_status === orderState.CANCELLED ||
                data.order_status === orderState.EXPIRED ||
                data.order_status === orderState.REJECTED ||
                data.order_status === orderState.UNKNOWN
            ) {
                return '--'
            } else {
                const orderAction = data.order_action && parseJSON(data.order_action);
                if (orderAction) {
                    return formatNumberVolume(orderAction.total_convert, true)
                } else {
                    return '--'
                }
            }
        } else {
            return '--'
        }
    } else {
        if (data && data.hasOwnProperty('order_status')) {
            if (data.order_status === orderState.CANCELLED ||
                data.order_status === orderState.EXPIRED ||
                data.order_status === orderState.REJECTED ||
                data.order_status === orderState.UNKNOWN
            ) {
                return '--'
            } else {
                const orderAction = data.order_action && parseJSON(data.order_action);
                if (orderAction) {
                    return formatNumberValue(orderAction.total_convert, true)
                } else {
                    return '--'
                }
            }
        } else {
            return '--'
        }
    }
}
export function formatEstimatedValueWebSV(data, currency) {
    if (['USD', 'AUD'].indexOf(currency) > -1) {
        if (data && data.hasOwnProperty('order_status')) {
            if (data.order_status === orderState.CANCELLED ||
                data.order_status === orderState.EXPIRED ||
                data.order_status === orderState.REJECTED ||
                data.order_status === orderState.UNKNOWN
            ) {
                return '--'
            } else {
                if (data) {
                    return '$' + formatNumberValue(data.estimated_value, true)
                } else {
                    return '--'
                }
            }
        } else {
            return '--'
        }
    } else if (currency === 'VND') {
        if (data && data.hasOwnProperty('order_status')) {
            if (data.order_status === orderState.CANCELLED ||
                data.order_status === orderState.EXPIRED ||
                data.order_status === orderState.REJECTED ||
                data.order_status === orderState.UNKNOWN
            ) {
                return '--'
            } else {
                if (data) {
                    return formatNumberVolume(data.estimated_value, true)
                } else {
                    return '--'
                }
            }
        } else {
            return '--'
        }
    } else {
        if (data && data.hasOwnProperty('order_status')) {
            if (data.order_status === orderState.CANCELLED ||
                data.order_status === orderState.EXPIRED ||
                data.order_status === orderState.REJECTED ||
                data.order_status === orderState.UNKNOWN
            ) {
                return '--'
            } else {
                if (data) {
                    return formatNumberValue(data.estimated_value, true)
                } else {
                    return '--'
                }
            }
        } else {
            return '--'
        }
    }
}

export function formatinitialMargin(data, currency) {
    if (currency === 'VND') {
        if (data && data.hasOwnProperty('order_status')) {
            if (data.order_status === orderState.CANCELLED ||
                data.order_status === orderState.EXPIRED ||
                data.order_status === orderState.REJECTED ||
                data.order_status === orderState.UNKNOWN
            ) {
                return '--'
            } else {
                const orderAction = data.order_action && JSON.parse(data.order_action);
                if (orderAction) {
                    return formatNumberVolume(orderAction.initial_margin_impact_convert)
                } else {
                    return '--'
                }
            }
        } else {
            return '--'
        }
    } else {
        if (data && data.hasOwnProperty('order_status')) {
            if (data.order_status === orderState.CANCELLED ||
                data.order_status === orderState.EXPIRED ||
                data.order_status === orderState.REJECTED ||
                data.order_status === orderState.UNKNOWN
            ) {
                return '--'
            } else {
                const orderAction = data.order_action && JSON.parse(data.order_action);
                if (orderAction) {
                    return formatNumberValue(orderAction.initial_margin_impact_convert, true)
                } else {
                    return '--'
                }
            }
        } else {
            return '--'
        }
    }
}
export function formatmaintenanceMargin(data, currency) {
    if (currency === 'VND') {
        if (data && data.hasOwnProperty('order_status')) {
            if (data.order_status === orderState.CANCELLED ||
                data.order_status === orderState.EXPIRED ||
                data.order_status === orderState.REJECTED ||
                data.order_status === orderState.UNKNOWN
            ) {
                return '--'
            } else {
                const orderAction = data.order_action && JSON.parse(data.order_action);
                if (orderAction) {
                    return formatNumberVolume(orderAction.maintenance_margin_impact_convert, true)
                } else {
                    return '--'
                }
            }
        } else {
            return '--'
        }
    } else {
        if (data && data.hasOwnProperty('order_status')) {
            if (data.order_status === orderState.CANCELLED ||
                data.order_status === orderState.EXPIRED ||
                data.order_status === orderState.REJECTED ||
                data.order_status === orderState.UNKNOWN
            ) {
                return '--'
            } else {
                const orderAction = data.order_action && JSON.parse(data.order_action);
                if (orderAction) {
                    return formatNumberValue(orderAction.maintenance_margin_impact_convert, true)
                } else {
                    return '--'
                }
            }
        } else {
            return '--'
        }
    }
}
export function formatDuration(data, isShortcut) {
    if (data && data.duration) {
        if (isShortcut) {
            if (data.duration === 'GTD') {
                if (data && data.expire_date) return moment(data.expire_date).tz('GMT').format('DD MMM YYYY')
                return '--'
            }
            return data.duration + ''
        } else {
            return <Lang>{tranferDuration(data.duration)}</Lang>
        }
    } else {
        return '--'
    }
}
export function formatProfitLoss(data) {
    if (data) {
        data = formatNumberValue(data, true)
        return data.replace(/(^-?)/, '$1$')
    } else {
        return '--'
    }
}

export function formatDisplayOrderId(data) {
    if (data && (data.display_order_id || data.order_number)) {
        return data.display_order_id || data.order_number + ''
    } else {
        return '--'
    }
}

export function formatRejectReason(data) {
    if (data && data.reject_reason) {
        return data.reject_reason + ''
    } else {
        return '--'
    }
}

export async function getLstAccountAfterLogin() {
    try {
        let url;
        url = helper.getAllAccountUrl(dataStorage.userInfo.user_id, 1, 6, '', checkIsAdvisor())
        await helper.getData(url).then((response) => {
            if (response.data) {
                if (response.data.data && response.data.data.length) {
                    const lst = response.data.data
                    dataStorage.lstAccountDropdown = [];
                    dataStorage.lstAccountCheck = [];
                    lst.map(item => {
                        if (item.account_id && item.account_name) {
                            if (item.status === 'active') {
                                if (!dataStorage.accountInfo) dataStorage.accountInfo = item;
                                dataStorage.lstAccountCheck.push({ label: item.account_name + ' (' + item.account_id + ')', value: item })
                            }
                            dataStorage.lstAccountDropdown.push({ label: item.account_name + ' (' + item.account_id + ')', value: item })
                        }
                    });
                }
            }
        })
    } catch (error) {
        logger.error('getLstAccountAfterLogin On FunctionUtils form' + error)
    }
}

export function fixTheme(theme, type) {
    try {
        return styleTheme[theme][type]
    } catch (error) {
        logger.error('fixTheme On FunctionUtils form' + error)
    }
}

export function checkDateInvalid(year, month, day) {
    if (month > 12) return false;
    switch (month + 1) {
        case 1: case 3: case 5: case 7: case 8: case 10: case 12:
            if (day > 31) return false;
            break;
        case 4: case 6: case 9: case 11:
            if (day > 30) return false;
            break;
        case 2:
            if ((year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 === 0)) {
                if (day > 29) return false;
            } else {
                if (day > 28) return false;
            }
    }
    return true;
}

export function checkInvalidInput(index, code) {
    if (code < 48 || code > 57) return true;
    switch (index) {
        case 0: if (code >= 52) return false;
            break;
        case 3: if (code >= 50) return false;
            break;
        case 6: if (code >= 51 || code <= 49) return false;
    }
    return true;
}

export function getReplaceText(text, index) {
    switch (index) {
        case 0: case 1:
            if (text === '') {
                return 'd';
            }
            break;
        case 3: case 4:
            if (text === '') {
                return 'm';
            }
            break;
        case 6: case 7: case 8: case 9:
            if (text === '') {
                return 'y';
            }
            break;
    }
    return text;
}

export function checkDayBaseMonthAndYear(day, month, year) {
    if (day > 31) return false;
    if (!month) return true;
    switch (month) {
        case 4: case 6: case 9: case 11:
            if (day > 30) return false;
            break;
        case 2:
            if (day > 29) return false;
            if (!year) return true;
            if ((year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 === 0)) {
                return true;
            } else {
                if (day > 28) return false;
            }
    }
    return true;
}

export function checkMonthBaseDayAndYear(day, month, year) {
    if (month > 12) return false;
    switch (month) {
        case 4: case 6: case 9: case 11:
            if (day === 31) return false;
            break;
        case 2:
            if (day > 29) return false;
            if ((year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 === 0)) {
                return true;
            } else {
                if (day > 28) return false;
            }
    }
    return true;
}

export function checkYearBaseDayAndMonth(day, month, year) {
    if (year < 2000) return false;
    if (!month) return true;
    if (month !== 2) return true;
    if ((year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 === 0)) {
        if (day > 29) return false;
    } else {
        if (day > 28) return false;
    }
    return true;
}

export function checkValidateDate(index, date) {
    if (!moment(date, 'dd/mm/yyyy').isValid()) return
    const listDate = date.split('/');
    const day = listDate[0].includes('d') ? null : parseInt(listDate[0]);
    const month = listDate[1].includes('m') ? null : parseInt(listDate[1]);
    const year = listDate[2].includes('y') ? null : parseInt(listDate[2]);
    switch (index) {
        case 0: case 1:
            if (!day) return true;
            return checkDayBaseMonthAndYear(day, month, year)
        case 3: case 4:
            if (!month) return true;
            return checkMonthBaseDayAndYear(day, month, year)
        case 6: case 7: case 8: case 9:
            if (!year) return true;
            return checkYearBaseDayAndMonth(day, month, year)
    }
    return true;
}

export function compareDate(param) {
    let zoneNum = moment().tz(dataStorage.timeZone).format('Z')
    const cur = moment(new Date()).tz(dataStorage.timeZone).format('DD/MM/YYYY');
    const listCur = cur.split('/');
    const date = moment(new Date(param)).tz(dataStorage.timeZone).format('DD/MM/YYYY');
    const listDate = date.split('/');
    const zone = ' (GMT' + zoneNum + ')'
    if (+listDate[2] !== +listCur[2] || +listDate[1] !== +listCur[1] || (+listCur[0] - +listDate[0]) > 1) {
        return date;
    } else if ((+listCur[0] - +listDate[0]) === 1) {
        return 'Yesterday';
    } else {
        return 'Today';
    }
}

export function isInvalidData(data) {
    if (data !== 0 && !data) return true;
    if (data === '--') return true;
    return false;
}

export function checkToday(date) {
    const now = moment().tz(dataStorage.timeZone);
    const curYear = now && typeof now.format === 'function' && now.format('YYYY');
    const curMonth = now && typeof now.format === 'function' && now.format('MM');
    const curDay = now && typeof now.format === 'function' && now.format('DD');
    const day = now && typeof now.format === 'function' && date.format('YYYY');
    const month = now && typeof now.format === 'function' && date.format('MM');
    const year = now && typeof now.format === 'function' && date.format('DD');
    if (day === curDay && month === curMonth && year === curYear) return true;
    return false;
}

export function setLanguage(language = 'en', i18n = dataStorage.i18n, doNotSave) {
    try {
        if (dataStorage.currentLang === language) return
        emitDataEventHub({ lang: language })
        dataStorage.lang = language;
        dataStorage.currentLang = language;
        if (language === i18n.language) return;
        localStorageNew.setItem('lastLang', language, true);
        dataStorage.deviceLang = { 'cn': 'zh_CN', 'en': 'en_US', 'vi': 'vi_VN' }[language];
        i18n && i18n.changeLanguage(language)
        if (!dataStorage.userInfo) {
            localStorageNew.setItem('langBeforeLogin', language)
        }
        // if (window.isSubWindow) return
        if (doNotSave) return;
        saveDataSetting({
            data: {
                lang: language
            }
        }).then(() => {
            logger.log('save user lang success');
        }).catch(error => {
            logger.log('save user lang error');
        })
    } catch (error) {
        logger.error('setLanguage: ' + error)
    }
}

export function setFontSize(size = 'medium') {
    try {
        if (dataStorage.currentFontSize === size) return
        localStorageNew.setItem('lastFontSize', size, true);
        emitDataEventHub({ size })
        dataStorage.fontSize = size;
        dataStorage.currentFontSize = size;
        document.body.classList.remove('small', 'medium', 'large')
        document.body.classList.add(size);
        if (window && window.frames && window.frames.length) {
            for (let i = 0, len = window.frames.length; i < len; i++) {
                window.frames[i] && window.frames[i].document && window.frames[i].document.body && window.frames[i].document.body.classList && window.frames[i].document.body.classList.remove('small', 'medium', 'large')
                window.frames[i] && window.frames[i].document && window.frames[i].document.body && window.frames[i].document.body.classList && window.frames[i].document.body.classList.add(size);
            }
        }
        dispatchEvent(EVENTNAME.fontChanged, size);
    } catch (error) {
        logger.error('setFontSize: ' + error)
    }
}

export function setTheme(theme, force) {
    try {
        if (dataStorage.currentTheme === theme) return
        emitDataEventHub({ theme })
        if (!force) {
            dataStorage.lastTheme = theme;
            localStorageNew.setItem('lastTheme', theme, true);
        }
        checkTheme(theme);
        dataStorage.currentTheme = theme;
        const linkCss = document.getElementById('myCss');
        const listCbChart = Object.keys(dataStorage.callBackReloadTheme);
        if (listCbChart.length) {
            for (let i = 0; i < listCbChart.length; i++) {
                dataStorage.callBackReloadTheme[listCbChart[i]](theme);
            }
        }
        const style = getComputedStyle(document.body);
        if (theme === 'theme-light') {
            document.body.classList.add('theme-light')
        } else {
            document.body.classList.remove('theme-light')
        }
        if (linkCss) {
            linkCss.onload = function () {
                dispatchEvent(EVENTNAME.themeChanged, theme);
            }
            const configWeb = dataStorage.web_config
            const currentColor = style.getPropertyValue('--background');
            linkCss.href = getStorageUrl(`${theme}.css`);
            (async () => {
                while (currentColor === style.getPropertyValue('--background')) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                dispatchEvent(EVENTNAME.themeChanged, theme);
            })()
        };
        if (!window.isSubWindow) {
            dataStorage.headerCallBack && dataStorage.headerCallBack()
        }
    } catch (error) {
        logger.error('setTheme: ' + error)
    }
}
window.updateTheme = () => {
    dispatchEvent(EVENTNAME.themeChanged, dataStorage.currentTheme);
}

export function isEmpty(obj) {
    if (typeof (obj) !== 'object') return false
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

export function convertEmptyObjectToNull(obj) {
    if (!obj) return {}
    for (var key in obj) {
        if (obj[key] && isEmpty(obj[key])) {
            obj[key] = null
        }
    }
    return obj
}

export function getChartDom() {
    let dom = document.querySelector('.popupChartLayout');
    if (!dom) {
        dom = document.createElement('div');
        dom.className = 'popupChartLayout'
        document.body.appendChild(dom);
    } else dom.innerHTML = ''
    return dom
}

export function getDropdownContentDom() {
    let div = document.getElementById('dropDownContent');
    if (!div) {
        div = document.createElement('div');
        div.id = 'dropDownContent';
        document.body.appendChild(div)
    }
    return div
}

export function getDatePickerContent() {
    let div = document.getElementById('datePickerContent');
    if (!div) {
        div = document.createElement('div');
        div.id = 'datePickerContent';
        document.body.appendChild(div)
    }
    return div
}

export function getPopoutMenuGridCanvas() {
    let div = document.getElementById('popoutMenuCanvas');
    if (!div) {
        div = document.createElement('div');
        div.id = 'popoutMenuCanvas';
        div.className = 'ag-theme-fresh';
        document.body.appendChild(div)
    } else div.innerHTML = ''
    return div
}

export function getPopoutMenuHeaderCanvas(id) {
    let div = document.getElementById(id);
    if (!div) {
        div = document.createElement('div');
        div.id = id;
        div.className = 'ag-theme-fresh';
        document.body.appendChild(div)
    }
    return div
}

export function getPopoutDropdownCanvas(id) {
    let div = document.getElementById(id);
    if (!div) {
        div = document.createElement('div');
        div.id = id;
        div.className = 'ag-theme-fresh';
        document.body.appendChild(div)
    }
    return div
}

export function translateTimeNew(timeStr, isOnlyDate = true, timeZone, IsString) {
    // Format of timeStr: 19 Feb 2019 10:10:11
    if (!timeStr) return '--'
    let time = moment(timeStr).tz(timeZone || 'Australia/Sydney').format('DD MMM YYYY HH:mm:ss');
    let zoneNum = moment().tz(timeZone || 'Australia/Sydney').format('Z')
    let arTime = time.split(' ')
    const MMM = ('lang_' + arTime[1].toLowerCase());
    const DD = (arTime[0] + '');
    const YYYY = (arTime[2] + '');
    const hh = (arTime[3] + '');
    const ss = (arTime[3] + '');
    const translatedMonth = dataStorage.translate && dataStorage.translate(MMM)
    // const translatedTimeStr = ` ${DD} ${translatedMonth} ${YYYY} ${hh} (GMT ${zoneNum})`
    const translatedTimeStr = !dataStorage.userInfo ? ` ${DD} ${translatedMonth.toCapitalize()} ${YYYY} ${hh} (GMT ${zoneNum})` : ` ${DD} ${translatedMonth.toCapitalize()} ${YYYY} ${hh}`
    return translatedTimeStr
}
export function translateTimeFormNews(time) {
    // Format of timeStr: 19 Feb 2019 10:10:11
    if (!time) {
        return '--'
    }
    let arTime = time.split(' ')
    const MMM = ('lang_' + arTime[1].toLowerCase());
    const DD = (arTime[0] + '');
    const YYYY = (arTime[2] + '');
    const translatedMonth = dataStorage.translate && dataStorage.translate(MMM)
    const translatedTimeStr = ` ${DD} ${translatedMonth.toCapitalize()} ${YYYY}`
    return translatedTimeStr
}

export function setNullLoadState(_this) {
    if (_this.props.loadState() && _this.props.loadState().duration) {
        _this.props.saveState({ duration: null })
    }
    if (_this.props.loadState() && _this.props.loadState().volume) {
        _this.props.saveState({ volume: null })
    }
    if (_this.props.loadState() && _this.props.loadState().orderTypeSelection) {
        _this.props.saveState({ orderTypeSelection: null })
    }
    if (_this.props.loadState() && _this.props.loadState().orderTypeDrop) {
        _this.props.saveState({ orderTypeDrop: null })
    }
    if (_this.props.loadState() && _this.props.loadState().exchange) {
        _this.props.saveState({ exchange: null })
    }
    if (_this.props.loadState() && _this.props.loadState().limitPrice) {
        _this.props.saveState({ limitPrice: null })
    }
    if (_this.props.loadState() && _this.props.loadState().stopPrice) {
        _this.props.saveState({ stopPrice: null })
    }
}
export function checkSymbolObjInfo(ListsymbolObj, symbol, subSymbol) {
    try {
        if (Array.isArray(ListsymbolObj) && ListsymbolObj.length) {
            const list = {};
            const listName = {};
            ListsymbolObj.map(item => {
                list[item.symbol] = item;
                listName[item.display_name] = item;
            })
            return list[symbol] || listName[symbol] || list[subSymbol] || listName[subSymbol] || ListsymbolObj[0];
        }
        return ListsymbolObj || {};
    } catch (error) {
        logger.sendLog('error checkSymbolObjInfo');
        if (Array.isArray(ListsymbolObj) && ListsymbolObj.length) {
            return ListsymbolObj[0]
        } return ListsymbolObj
    }
}

export function getCsvFileBroker(obj, cb) {
    const fileName = obj.fileName ? obj.fileName : ((window.isSubWindow ? document.title : obj.glContainer.tab.titleElement[0].textContent).replace(/\./g, '').replace(/ - /g, '_').replace(/ /g, '_'));
    let time = moment().tz(dataStorage.timeZone).format('HH_mm_ss')
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.open('POST', obj.url);
    obj.gridDom.parentElement.parentElement.parentElement.querySelector('.download').classList.add('disabled-download')
    xhr.onload = function (e) {
        if (this.status === 200) {
            var blob = this.response;
            if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveBlob(blob, fileName + time + '.csv');
            } else {
                var downloadLink = window.document.createElement('a');
                var contentTypeHeader = xhr.getResponseHeader('Content-Type');
                downloadLink.href = window.URL.createObjectURL(new Blob([blob], { type: contentTypeHeader }));
                downloadLink.download = fileName + '_export_' + time + '.csv';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
        }
        cb && cb()
        obj.gridDom.parentElement.parentElement.parentElement.querySelector('.download').classList.remove('disabled-download')
    };
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${dataStorage.accessToken}`);
    const bodyExport = {
        'data': {
            'body_req': obj.body_req,
            'type': 'CSV',
            'columnHeader': obj.columnHeader,
            'lang': obj.lang
        }
    }
    xhr.send(JSON.stringify(bodyExport));
}
export function getCsvFile(obj, cb) {
    const fileName = (window.isSubWindow ? document.title : obj.glContainer.tab.titleElement[0].textContent).replace(/\./g, '').replace(/ - /g, '_').replace(/ /g, '_') + '_export_';
    let time = moment().tz(dataStorage.timeZone).format('HH_mm_ss')
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.open('POST', obj.url);
    obj.glContainer._contentElement[0].querySelector('.download').classList.add('disabled-download')
    xhr.onload = function (e) {
        if (this.status === 200) {
            var blob = this.response;
            if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveBlob(blob, fileName + time + '.csv');
            } else {
                var downloadLink = window.document.createElement('a');
                var contentTypeHeader = xhr.getResponseHeader('Content-Type');
                downloadLink.href = window.URL.createObjectURL(new Blob([blob], { type: contentTypeHeader }));
                downloadLink.download = fileName + time + '.csv';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
        }
        cb && cb()
        obj.glContainer._contentElement[0].querySelector('.download').classList.remove('disabled-download')
    };
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${dataStorage.accessToken}`);
    const bodyExport = {
        'body_req': obj.body_req,
        'type': 'csv',
        'columnHeader': obj.columnHeader,
        'lang': obj.lang
    }
    xhr.send(JSON.stringify(bodyExport));
}

export function getReportExcelFile(obj, cb) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.open('GET', obj.url);
    obj.dom.querySelector('.reportDowload').classList.add('disabled')
    xhr.onload = function (e) {
        if (this.status === 200) {
            var blob = this.response;
            if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveBlob(blob, 'fileName.xls');
            } else {
                var downloadLink = window.document.createElement('a');
                var contentTypeHeader = xhr.getResponseHeader('Content-Type');
                downloadLink.href = window.URL.createObjectURL(new Blob([blob], { type: contentTypeHeader }));
                downloadLink.download = obj.fileName + '.xls';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
        }
        cb && cb()
        obj.dom.querySelector('.reportDowload').classList.remove('disabled')
    };
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.setRequestHeader('Authorization', `Bearer ${dataStorage.accessToken}`);
    xhr.send(null);
}

export function getSymbolAccountWhenFirstOpenLayout() {
    const symbolKey = `symbol_${dataStorage.usingLayout}`
    const accountKey = `account_${dataStorage.usingLayout}`
    const obj = {
        newSymbolObj: {},
        newAccount: {}
    }
    if (dataStorage.symbolAccountMappingLayout && dataStorage.symbolAccountMappingLayout[symbolKey]) {
        obj.newSymbolObj = dataStorage.symbolAccountMappingLayout[symbolKey]
    }
    if (dataStorage.symbolAccountMappingLayout && dataStorage.symbolAccountMappingLayout[accountKey]) {
        obj.newAccount = dataStorage.symbolAccountMappingLayout[accountKey]
    }
    return obj
}

export function resetSymbolOfLayout() {
    const symbolKey = `symbol_${dataStorage.usingLayout}`
    if (dataStorage.symbolAccountMappingLayout && dataStorage.symbolAccountMappingLayout[symbolKey]) {
        delete dataStorage.symbolAccountMappingLayout[symbolKey]
    }
}

export function resetAccountOfLayout() {
    const accountKey = `account_${dataStorage.usingLayout}`
    if (dataStorage.symbolAccountMappingLayout && dataStorage.symbolAccountMappingLayout[accountKey]) {
        delete dataStorage.symbolAccountMappingLayout[accountKey]
    }
}

export function parseExpiryDate(value, position) {
    if (!value) return '--'
    const monthNumber = Number(value.slice(0, position))
    let convertedMonth = (MAPPING_MONTHS[monthNumber] || {}).shortLabel
    const yearNumber = value.slice(position);
    return `${convertedMonth}${yearNumber}`
}

export function checkShowAccessModal(data, isNotShow) {
    if (data.length) {
        let isChangeValue = 0
        data.map(ex => {
            if (!dataStorage.marketDataType) dataStorage.marketDataType = {}
            if (!dataStorage.marketDataTypeCb) dataStorage.marketDataTypeCb = {}
            if (ex.status === MARKETASTATUS.pendingSubscribe && !isNotShow) {
                if (dataStorage.marketDataTypeCb[ex.exchange]) {
                    dataStorage.marketDataTypeCb[ex.exchange]()
                    delete dataStorage.marketDataTypeCb[ex.exchange]
                }
                showModal({
                    component: MarketDataAgreementPopup,
                    data: ex
                })
            } else {
                if (ex.market_data_type !== dataStorage.marketDataType[ex.exchange]) {
                    if (ex.status !== MARKETASTATUS.pendingSubscribe) {
                        dataStorage.marketDataType[ex.exchange] = ex.market_data_type
                        dispatchEvent(EVENTNAME.marketDataTypeChanged, ex);
                        isChangeValue += 1
                    }
                    if (ex.status === MARKETASTATUS.noAccess || ex.status === MARKETASTATUS.subscribed) {
                        if (dataStorage.marketDataTypeCb[ex.exchange]) {
                            dataStorage.marketDataTypeCb[ex.exchange]()
                            delete dataStorage.marketDataTypeCb[ex.exchange]
                        } else {
                            dataStorage.receiveOrderPad && dataStorage.receiveOrderPad()
                        }
                    }
                }
            }
        })
        if (isChangeValue && isNotShow && dataStorage.goldenLayout.goldenLayout) {
            const lst = dataStorage.goldenLayout.goldenLayout.root.getItemsByType('component');
            if (lst && lst.length) {
                for (let i = 0; i < lst.length; i++) {
                    const r = lst[i].element[0].react;
                    const dataWidget = r && r.props.glContainer.getState()
                    if ((dataWidget && dataWidget.symbol && dataWidget.symbol.exchanges && dataWidget.symbol.exchanges[0]) || (r && r.props.glContainer._config.title === 'Watchlist')) {
                        r && r.broadcast && r.broadcast(dataWidget, 'force')
                    }
                }
            }
            const listPopouts = dataStorage.goldenLayout.goldenLayout.openPopouts;
            if (listPopouts && listPopouts.length) {
                for (let i = 0; i < listPopouts.length; i++) {
                    const r = listPopouts[i]._popoutWindow.document.querySelector('.lm_item_container').react;
                    const dataWidget = r && r.props.glContainer.getState()
                    if ((dataWidget && dataWidget.symbol && dataWidget.symbol.exchanges && dataWidget.symbol.exchanges[0]) || (r && r.props.glContainer._config.title === 'Watchlist')) {
                        r.broadcast && r.broadcast(dataWidget, 'force');
                    }
                }
            }
        }
    }
}
