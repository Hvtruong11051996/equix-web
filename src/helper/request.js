import axios from 'axios';
import { isLogin, todo, clone, IsJsonString, checkRequirePin } from './functionUtils';
import logger from '../helper/log';
import * as helper from '../helper/request';
import dataStorage from '../dataStorage';
import config from '../../public/config';
import showModal from '../components/Inc/Modal';
import Pin from '../components/Pin';
import UpdateMe from '../components/Inc/Overlay/updateMe';
import WhatsNew from '../components/WhatsNew';
import requestWorker from '../workers/request';
import Workers from '../workers';
import { refreshAccessToken } from '../helper/api'

const apiMap = {
    '/portfolio/operation|/portfolio?account_id=': {
        NEXT: 'https://om-staging-streaming.equix.app/v1',
        DEMO: 'https://om-staging-streaming.equix.app/v1',
        STAGING: 'https://om-staging-streaming.equix.app/v1'
    },
    '/noti/notification/streaming-data': {
        NEXT: 'https://om-staging-streaming.equixapp.com',
        BETA: 'https://om-beta-streaming.equixapp.com',
        STAGING: 'https://om-staging-streaming.equixapp.com',
        DEMO: 'https://om-staging-streaming.equixapp.com',
        PRODUCTION: dataStorage.isDemo ? 'https://om-demo-streaming.equixapp.com' : 'https://om-prod1-streaming.equixapp.com'
    },
    '/agility/report': {
        PRODUCTION: '/v4',
        BETA: '/v4',
        NEXT: '/v4'
    },
    '/balances/account': {
        PRODUCTION: '/v2',
        BETA: '/v2'
    },
    '/order': {
        NEXT: '/v2'
    },
    '/portfolio/total': {
        PRODUCTION: '/v2',
        BETA: '/v2'
    },
    '/report/get_report_eod': {
        PRODUCTION: '/v2',
        BETA: '/v2'
    },
    '/portfolio/inquery': {
        PRODUCTION: '/v2',
        BETA: '/v2'
    },
    '/advisor/portfolio/inquery': {
        PRODUCTION: '/v2',
        BETA: '/v2'
    },
    '/balances/portfolio-performance': {
        PRODUCTION: '/v2',
        BETA: '/v2'
    }
};

export function getLogSignOutUrl() {
    return completeApi(`/auth/logout`)
}

export function getOpeningAccountUrl(path) {
    if (dataStorage.env_config.roles.openingAccount) {
        return completeApi(`/user/account-opening${path || ''}`)
    }
}

export function completeApi(api, env = dataStorage.env_config) {
    let baseUrl = '';
    let version = env && env.api && env.api.version;
    let m = '';
    const obj = env && env.api && env.api.custom
    if (obj) {
        Object.keys(obj).map(pre => {
            if ((!m || pre.includes(m)) && new RegExp('^' + pre.replace(/\?/g, '\\?')).test(api)) {
                m = pre;
                baseUrl = obj[pre]
            }
        });
    }
    if (/^\/v\d+/.test(baseUrl)) {
        version = baseUrl.substr(1);
        baseUrl = '';
    }
    if (!baseUrl && env) baseUrl = (env.api.backendBase || env.api.baseUrl) + '/' + version;
    return baseUrl + api;
}
const dicRequest = {};
const dicResolve = {};
const dicReject = {};

const CancelToken = axios.CancelToken;
const urlCalendar = {
    'NEXT': {
        'ASX': 'CALENDAR:ASX20191565670548898',
        'NASDAQ': 'CALENDAR:NASDAQ20191565670589002',
        'NYSE': 'CALENDAR:NYSE20191565670622755',
        'NSX': 'CALENDAR:NSX20191565670663272',
        'CXA': 'CALENDAR:CXA20191565683849108',
        'AXW': 'CALENDAR:AXW20191565687432824'
    },
    'BETA': {
        'ASX': 'CALENDAR:ASX20191565877986020',
        'NASDAQ': 'CALENDAR:NASDAQ20191565879695670',
        'NYSE': 'CALENDAR:NYSE20191565881054542',
        'NSX': 'CALENDAR:NSX20191565881142854',
        'CXA': 'CALENDAR:CXA20191565881170146',
        'AXW': 'CALENDAR:AXW20191565881195152'
    },
    'PRODUCTION': {
        'ASX': 'CALENDAR:ASX20191565877986020',
        'NASDAQ': 'CALENDAR:NASDAQ20191565879695670',
        'NYSE': 'CALENDAR:NYSE20191565881054542',
        'NSX': 'CALENDAR:NSX20191565881142854',
        'CXA': 'CALENDAR:CXA20191565881170146',
        'AXW': 'CALENDAR:AXW20191565881195152'
    }
}

export const method = {
    get: 'GET',
    post: 'POST',
    put: 'PUT'
}

export const tableName = {
    symbol: 'symbol',
    auth: 'auth'
};
export function requirePin(cb) {
    if (!cb && document.querySelector('#modal>div>.pinFormRoot')) return
    if (cb && (dataStorage.requireTime || dataStorage.verifiedPin)) {
        cb();
        return;
    }
    if (!dataStorage.requirePinList) dataStorage.requirePinList = [];
    dataStorage.requirePinList.push(cb);
    removeDropdownContent();
    showModal({
        component: Pin,
        props: {
            title: 'firstLogin',
            canClose: !!cb,
            success: () => {
                dataStorage.requirePinList.map(cb => cb && cb());
                dataStorage.requirePinList = [];
            }
        }
    });
}

export function removeDropdownContent() {
    const dropdown = document.getElementById('dropDownContent');
    if (dropdown) dropdown.innerHTML = '';
}

const TIMEOUT_DEFAULT = 20000;
export function sendRequest(method, url, cbFunction, timeOut = TIMEOUT_DEFAULT, data, justResolve, requestId, token, responseType, skip) {
    if (url && !url.endsWith('/log/data')) {
        checkRequirePin()
    }
    if (!method || !url) return;
    let cancel = null;
    const urlLog = helper.getLogUrl();
    const currentTime = new Date().getTime()
    const checkTimeToken = (currentTime - dataStorage.tokenTime) / 60000
    const env = dataStorage.currentEnv
    if (env !== 'guest' && !skip && checkTimeToken > 15 && !url.endsWith('auth/refresh') && !url.endsWith('/log/data')) {
        return new Promise((resolve, reject) => {
            if (!dataStorage.requestQueue) dataStorage.requestQueue = [];
            dataStorage.requestQueue.push({ method, url, cbFunction, timeOut, data, justResolve, requestId, token, responseType, skip, resolve, reject });
            if (dataStorage.waitResfreshToken) return;
            dataStorage.waitResfreshToken = true;
            setTimeout(() => {
                refreshAccessToken(() => {
                    if (dataStorage.requestQueue) {
                        dataStorage.requestQueue.forEach(req => {
                            sendRequest(req.method, req.url, req.cbFunction, req.timeOut, req.data, req.justResolve, req.requestId, req.token, req.responseType, true).then(res => req.resolve(res)).catch(res => req.reject(res));
                        });
                    }
                    delete dataStorage.waitResfreshToken;
                    delete dataStorage.requestQueue;
                });
            }, 300);
        });
    }
    const handleRequest = (resolve, reject) => {
        let timeOutSever = 0;
        const headers = {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                Authorization: `Bearer ${token || dataStorage.accessToken}`
            },
            cancelToken: new CancelToken(function executor(c) {
                cancel = c;
            }),
            responseType: responseType
        };
        const requestIdKey = 'Request-Id';
        if (requestId) {
            headers.headers[requestIdKey] = requestId;
        }

        if (timeOut) {
            timeOutSever = setTimeout(() => {
                timeOutSever = 0;
                if (method === 'get') {
                    logger.sendLog(`Timeout request get - ${url} `)
                    cancel && cancel();
                    console.log('-time out request -')
                    handleRequest(resolve, reject)
                } else {
                    reject({ errorTimeOut: ['Server.Timeout'], requestId: headers.headers[requestIdKey] })
                    cbFunction && cbFunction({ errorTimeOut: ['Server.Timeout'], requestId: headers.headers[requestIdKey] })
                }
            }, timeOut)
        }
        const thenFn = (response) => {
            timeOutSever && clearTimeout(timeOutSever);
            const dataResponse = { data: response.data, requestId: headers.headers[requestIdKey] };
            if (cbFunction) cbFunction(dataResponse);
            resolve(dataResponse);
        };
        const catchFn = (error) => {
            timeOutSever && clearTimeout(timeOutSever);
            logger.log('error: ', error);
            const errStr = error + '';
            if (url !== urlLog) {
                logger.sendLog(`CATCH FUNCTION: ${errStr} ERROR FROM ${url}`);
            }
            errStr !== 'Error: Network Error' && timeOutSever && clearTimeout(timeOutSever)
            if (!timeOut || timeOutSever) {
                cbFunction && cbFunction(error)
                logger.log('error:1 ', error);
                const newObjError = !dataStorage.isTest && method === 'get'
                    ? {
                        response: error || null
                    }
                    : {
                        response: error.response && error.response.data ? error.response.data : null
                    }
                justResolve ? resolve({ data: [], requestId: headers.headers[requestIdKey] }) : reject(newObjError);
            }
        };

        if (method === 'post' || method === 'put') {
            axios[method](url, data, headers).then(thenFn).catch(catchFn);
        } else if (method === 'delete') {
            axios[method](url, headers).then(thenFn).catch(catchFn);
        } else {
            if (url.includes('news_inday')) {
                console.log('c')
            }
            if (!dicRequest[url]) {
                dicRequest[url] = true;
                dicResolve[url] = [];
                dicResolve[url].push(thenFn);
                dicReject[url] = [];
                dicReject[url].push(catchFn);
                // if (data) headers.params = data

                // this.worker.postMessage('Fetch Users');

                // this.worker.addEventListener('message', event => {
                //     console.log('event.data.length: ', event.data.length)
                // });
                if (!dataStorage.isTest) {
                    const reqWorker = new Workers(requestWorker);
                    reqWorker.executeTask({ url, token: (token || dataStorage.accessToken) }, (data) => {
                        if (data.status === 200) {
                            const lstResolve = dicResolve[url] || [];
                            delete dicRequest[url];
                            delete dicResolve[url];
                            delete dicReject[url];
                            const dataResponse = data ? IsJsonString(data.data) : null
                            for (let index = 0; index < lstResolve.length; index++) {
                                const resolveFunc = lstResolve[index];
                                resolveFunc && resolveFunc({ data: dataResponse });
                            }
                        } else {
                            if (url !== urlLog) {
                                logger.sendLog(`REQUEST ERROR FROM ${url} status: ${data ? data.status : null}`);
                                const newError = data.error + '';
                                logger.sendLog(`REQUEST ERROR: ${newError}`);
                            }
                            const lstReject = dicReject[url] || [];
                            delete dicRequest[url];
                            delete dicResolve[url];
                            delete dicReject[url];
                            for (let index = 0; index < lstReject.length; index++) {
                                const rejectFunc = lstReject[index];
                                rejectFunc && rejectFunc(data.error);
                            }
                        }
                    })
                } else {
                    axios[method](url, headers).then(data => {
                        const lstResolve = dicResolve[url] || [];
                        delete dicRequest[url];
                        delete dicResolve[url];
                        delete dicReject[url];
                        for (let index = 0; index < lstResolve.length; index++) {
                            const resolveFunc = lstResolve[index];
                            resolveFunc && resolveFunc(clone(data));
                        }
                    }).catch(error => {
                        if (url !== urlLog) {
                            logger.sendLog(`REQUEST ERROR FROM ${url}`);
                            const newError = error + '';
                            logger.sendLog(`REQUEST ERROR: ${newError}`);
                        }
                        const lstReject = dicReject[url] || [];
                        delete dicRequest[url];
                        delete dicResolve[url];
                        delete dicReject[url];
                        for (let index = 0; index < lstReject.length; index++) {
                            const rejectFunc = lstReject[index];
                            rejectFunc && rejectFunc(error);
                        }
                    });
                }
            } else {
                dicResolve[url].push(thenFn);
                dicReject[url].push(catchFn);
            }
        }
    }
    return new Promise((resolve, reject) => {
        handleRequest(resolve, reject);
    });
}
export function getData(url, cb, timeOut, justResolve, responseType) {
    if (!url) return
    return sendRequest('get', url, cb, timeOut, null, justResolve, null, null, responseType);
}
export function postData(url, data, cb, timeOut, requestId, token) {
    if (!url) return
    return sendRequest('post', url, cb, timeOut, data, null, requestId, token);
}
export function putData(url, data, cb, timeOut) {
    if (!url) return
    return sendRequest('put', url, cb, timeOut, data);
}
export async function deleteData(url, cb, timeOut) {
    if (!url) return
    return sendRequest('delete', url, cb, timeOut);
}

export function getContractNoteUrl(accountId, symbol, duration = 'day', pageId = 1, advisor = false, rangeTime, filterAndSearch, pageSize = 50) {
    // if (filterAndSearch) {
    //     return `${dataStorage.href}/search/cnote/?page_id=1`
    // } else {
    if (duration === 'all') {
        return completeApi(`/${advisor ? 'advisor/' : ''}cnote/inquery?account_id=${accountId}${symbol ? `&symbol=${symbol}` : ''}&duration=${duration}&page_id=${pageId}`);
    } else {
        return completeApi(`/${advisor ? 'advisor/' : ''}cnote/inquery?account_id=${accountId}${symbol ? `&symbol=${symbol}` : ''}&page_id=${pageId}&page_size=${pageSize}&from=${rangeTime.fromDate}&to=${rangeTime.toDate}`);
    }
    // }
}

export function getSignUpUrl(env) {
    return completeApi(`/user/sign-up`, env)
}

export function getAllPriceUrl(exchange, path) {
    return completeApi(`/feed-snapshot-aio/price/${exchange}/${path}`);
}

export function getReportPdfFileUrl(reportType, accountId, fromDate, toDate) {
    return completeApi(`/agility/report/${reportType}/${accountId}?from=${fromDate}&to=${toDate}`);
}
export function getReportCsvFileUrl(targetResquet) {
    return completeApi(`/search/export/${targetResquet}`);
}
export function getBrokerCsvFileUrl(targetResquet) {
    return completeApi(`/export/broker-report/${targetResquet}`)
}

export function getBalanceForAccount(stringquery) {
    return completeApi(`/balances/account/${stringquery}?account_type=account_balances`);
}

export function getTotalMarketValueForAccount(stringquery) {
    return completeApi(`/portfolio/total-market-value/${stringquery}`);
}

export function getAllAccountUrl(userId, pageId = 1, pageSize = 100, filterText) {
    let res = completeApi(`/user/account/inquery?user_id=${userId}&page_id=${pageId}&page_size=${pageSize}`);
    if (filterText && filterText !== '') {
        res += `&filter=${filterText.toLowerCase()}`
    }
    return res;
}
export function getAllAccountNewUrl(userId, pageId = 1, pageSize = 100, filterText) {
    let res = completeApi(`/user/account-opening/inquery?user_id=${userId}&page_id=${pageId}&page_size=${pageSize}`);
    if (filterText && filterText !== '') {
        res += `&filter=${filterText.toLowerCase()}`
    }
    return res;
}

export function getConnectionUrl() {
    return completeApi(`/info`);
}

export function getCheckTokenUrl(token, env) {
    return completeApi(`/onboarding/check-pin?accessToken=${token}`, env)
}

export function getLogUrl() {
    return completeApi(`/log/data`);
}
export function getStreamingAccountUrl(accountId) {
    return completeApi(`/noti/notification/streaming-data/account?${accountId}`);
}
export function getAccountStreamingUrl(accountId) {
    return completeApi(`/noti/notification/streaming-data/account/${accountId}`);
}
export function getAllAccountsStreamingUrl() {
    return completeApi(`/noti/notification/streaming-data/operation/operation`)
    // return `http://localhost:8089/v1/noti/notification/streaming-data/operation/operation`;
}
export function getUserStreamingUrl(userId, env) {
    return completeApi(`/noti/notification/streaming-data/user/${userId}`, env)
}

export function getBranchStreamingUrl(userId, oldVersion) {
    return completeApi(`/noti/notification/streaming-data/branch/${userId}`)
}

export function getWarningTechnicalStreamingUrl() {
    return completeApi(`/noti/notification/streaming-data/all/all`)
}

export function getUrlAuth(env) {
    return completeApi(`/auth`, env);
}
export function getUrlPin(env) {
    return completeApi(`/auth/pin`, env);
}
export function getUrlChangePin(env) {
    return completeApi(`/auth/change-pin`, env);
}
export function getUrlDecode(env) {
    return completeApi(`/auth/decode`, env);
}
export function getUrlRefresh(env) {
    return completeApi(`/auth/refresh`, env);
}

export function getSessionUrl(sessionId, env) {
    return completeApi(`/auth/session?session_id=${sessionId}`, env);
}
export function getSettingUrl(userId, type) {
    switch (type) {
        case method.get:
            return completeApi(`/user/user_setting/${userId}?type=web`);
        case method.post: case method.put:
            return completeApi(`/user/user_setting/${userId}/web`);
    }
}

export function getLayoutUrl(userId, layoutId) {
    if (layoutId) {
        return completeApi(`/user/layout/${userId}/${layoutId}`);
    } else {
        return completeApi(`/user/layout/${userId}`);
    }
}
function handleDuplicateSymbol(strQuery) {
    try {
        return [...new Set(strQuery.split(','))].join(',');
    } catch (error) {
        return strQuery
    }
}
export function makeMarketUrl(path) {
    return path ? completeApi(`/market-info/${path}`) : '';
}

export function makeSymbolUrl(path) {
    let queryString;
    if (path) queryString = handleDuplicateSymbol(path)
    return queryString ? completeApi(`/market-info/symbol/${queryString}`) : '';
}

export function feedSnapshot(symbol, exchanges, form) {
    const normal = []
    const delayed = []
    const lstFuEx = ['IFSG', 'XCME', 'IFEU', 'IFLX', 'XCBT', 'IFUS', 'XNYM', 'XCEC', 'XSCE', 'XTKT', 'XKLS', 'XLME'];
    const lstAuExHaveDot = ['ASX', 'NSX', 'BSX'];
    if (/\.[a-z]+$/i.test(symbol) && !lstAuExHaveDot.includes(exchanges)) {
        if (lstFuEx.includes(exchanges)) {
            if (!dataStorage.priceSourceNoAccessFu) {
                if (dataStorage.priceSourceDelayedFu) delayed.push(symbol)
                else normal.push(symbol)
            }
        } else {
            if (!dataStorage.priceSourceNoAccessUs) {
                if (dataStorage.priceSourceDelayedUs) delayed.push(symbol)
                else normal.push(symbol)
            }
        }
    } else {
        if (!dataStorage.priceSourceNoAccessAu) {
            if (dataStorage.priceSourceDelayedAu) delayed.push(symbol)
            else normal.push(symbol)
        }
    }

    return {
        normal: normal.length ? completeApi(`/feed-snapshot/${form}/${exchanges}/${symbol}`) : '',
        delayed: delayed.length ? completeApi(`/feed-delayed-snapshot/${form}/${exchanges}/${symbol}`) : ''
    }
}

export function makePriceLevel1Url(path, exchange) {
    if (dataStorage.isGuest) {
        return {
            delayed: path ? completeApi(`/${'feed-delayed-snapshot'}/level1/${exchange || ''}/${path}`) : ''
        }
    }
    const lstFuEx = ['IFSG', 'XCME', 'IFEU', 'IFLX', 'XCBT', 'IFUS', 'XNYM', 'XCEC', 'XSCE', 'XTKT', 'XKLS', 'XLME', 'XCBT'];
    const lstAuExHaveDot = ['ASX', 'NSX', 'BSX'];
    // return path ? `${dataStorage.href}/${dataStorage.userInfo && !dataStorage.isGuest && !dataStorage.priceSourceDelayed ? 'feed-snapshot' : 'feed-delayed-snapshot'}/level1/${exchange || ''}/${path}` : '';
    const lst = path.split(',');
    const normal = []
    const delayed = []
    const deny = []
    lst.map(symbol => {
        if (/\.[a-z]+$/i.test(encodeURIComponent(symbol)) && !lstAuExHaveDot.includes(exchange)) {
            if (lstFuEx.includes(exchange)) {
                if (dataStorage.priceSourceNoAccessFu) deny.push(symbol)
                else if (dataStorage.priceSourceDelayedFu) delayed.push(symbol)
                else normal.push(symbol)
            } else {
                if (dataStorage.priceSourceNoAccessUs) deny.push(symbol)
                else if (dataStorage.priceSourceDelayedUs) delayed.push(symbol)
                else normal.push(symbol)
            }
        } else {
            if (dataStorage.priceSourceNoAccessAu) deny.push(symbol)
            else if (dataStorage.priceSourceDelayedAu) delayed.push(symbol)
            else normal.push(symbol)
        }
    })
    // feed-snapshot-aio/price/${exchange}/${path}
    return {
        normal: normal.length ? completeApi(`/feed-snapshot-aio/price/${exchange || ''}/${normal.join(',')}`) : '',
        delayed: delayed.length ? completeApi(`/feed-delayed-snapshot/level1/${exchange || ''}/${delayed.join(',')}`) : '',
        deny: deny.join(',')
    }
}
export function makePriceLevel1UrlNew(path, exchange) {
    if (dataStorage.isGuest) {
        return {
            delayed: path ? completeApi(`/${'feed-delayed-snapshot'}/level1/${exchange || ''}/${path}`) : ''
        }
    }
    const lst = path.split(',');
    const normal = []
    const delayed = []
    const deny = []
    lst.map(symbol => {
        switch (dataStorage.marketDataType[exchange]) {
            case 0:
                deny.push(symbol)
                break;
            case 1:
                delayed.push(symbol)
                break;
            case 2:
            case 3:
                normal.push(symbol)
                break;
            default:
                break;
        }
    })
    return {
        normal: normal.length ? completeApi(`/feed-snapshot-aio/price/${exchange || ''}/${normal.join(',')}`) : '',
        delayed: delayed.length ? completeApi(`/feed-delayed-snapshot-aio/price/${exchange || ''}/${delayed.join(',')}`) : '',
        deny: deny.join(',')
    }
}
export function makeSymbolDynamicWatchlistUrl(path) {
    return path ? completeApi(`/dynamic-watchlist/${path}`) : '';
}
export function getUrlUserWatchList(userID, apiType) {
    return completeApi(`/dynamic-watchlist/${apiType}/${userID}`);
}
export function makeNewsUrl(path) {
    return path ? completeApi(`/news/${path}`) : ''
}
export function makeNewsIntradayUrl(path) {
    return completeApi(`/news?type=recent&symbol=${path}`)
}
export function makeHistorycalUrl(path) {
    return path ? completeApi(`/historical/${path}`) : ''
}
export function makeUserDetailUrl(path) {
    return completeApi(`/user/user-details${path}`)
}
export function makeMappingAccountlUrl(path) {
    return path ? completeApi(`/user/mapping_account${path}`) : ''
}
export function makeFeelUrl() {
    return completeApi(`/fee`)
}
export function makePlaceOrderUrl(path) {
    return path ? completeApi(`/order${path}`) : completeApi(`/order`)
}
export function getUrlOrderById(orderId) {
    return completeApi(`/order?order_id=${orderId}`);
}
export function getUrlOrderByNumber(orderNumber) {
    return completeApi(`/order/web_services?order_number=${orderNumber}`);
}
export function getUrlOrderByClienId(orderId) {
    return completeApi(`/order?client_order_id=${orderId}`);
}
export function getUrlOrderResponseLatest(orderId, isPlace) {
    const type = isPlace ? 'client_order_id' : 'broker_order_id';
    return completeApi(`/order/response_lastest?${type}=${orderId}`);
}
export function getUrlOrderDetailByTag(orderId) {
    return completeApi(`/order?order_id=${orderId}&detail=true`);
}
export function getOrderUrl(orderId) {
    return completeApi(`/order/${orderId}`);
}
export function getUrlUserPositionByAccountId(accountId) {
    return completeApi(`/portfolio/user_position/${accountId}`);
}
export function getUrlTotalPosition(accountID) {
    return completeApi(`/portfolio/total/${accountID}`)
}
export function getMarginDetailUrl() {
    return completeApi(`/margin/margin-detail/`)
}
export function getMarginLevelUrl() {
    return completeApi(`/margin/level/`)
}
export function getBranchInfoUrl() {
    return completeApi(`/margin/margin-detail/inquery`)
}
export function getEditLevelUrl(path) {
    return completeApi('/margin/level/' + path)
}
export function getEditRuleLevelUrl(path) {
    return completeApi('/margin/margin-detail/' + path)
}
export function getEditMarginDetailUrl(path) {
    return completeApi('/margin/margin-detail/' + path)
}
export function getUrlAnAccount(accountID) {
    return completeApi(`/user/account?account_id=${accountID}`)
}
export function getUrlMarginConfig(accountID) {
    return completeApi(`/margin/margin_level/${accountID}`)
}
export function getUrlMappingAccountMarket(path) {
    return path ? completeApi(`/user/routing_account/${path}`) : completeApi(`/user/routing_account`)
}
export function getUrlAccounts(accountID, market) {
    return completeApi(`/user/${market === 'paritech' ? 'account' : 'account_saxobank'}?account_id=${accountID}`)
}
export function getUrlAllAccountsSaxo() {
    return completeApi(`/user/account_saxobank`)
}
export function makeUrlAccountsSaxo(path) {
    return path ? completeApi(`/user/account_saxobank/${path}`) : ''
}
export function getUrlTransactionAccount(accountId, symbol) {
    return completeApi(`/transactions/${accountId}/${symbol}?top=5`)
}
export function getUrlTransactionAccountNoLimit(accountId, symbol) {
    return completeApi(`/transactions/${accountId}/${symbol}`)
}

export function getUrlReport(type, accountID, from, to) {
    return completeApi(`/report/get_report_eod/${accountID}?type_report=${type}&from=${from}&to=${to}`)
}

export function getLastOrder(accountId) {
    return completeApi(`/order?tag=latest&account_id=${accountId}`)
}
export function getUrlDataBusinessLog(isOperation, userId, accountId, pageId, pageSize, filterText, duration, rangeTime) {
    let url = completeApi(`/business-log/inquery?`);
    if (userId) url += `user_id=${userId}`;
    if (pageId) url += `&page_id=${pageId}`;
    if (pageSize) url += `&page_size=${pageSize}`;
    if (filterText) url += `&filter=${filterText}`;
    if (duration === 'All') url += `&duration=all`;
    else {
        if (rangeTime) url += `&from=${rangeTime.fromDate}&to=${rangeTime.toDate}`
    }
    if (url.indexOf('?&') >= 0) {
        url = url.replace('?&', '?');
    }
    return url;
}

export function getCurrencies(data) {
    return completeApi(`/feed-snapshot/level1/FX/${data}`)
}

export function getFilterOrder(obj, advisor = false) {
    const lst = [];
    for (let key in obj) {
        if (obj[key]) lst.push(key + '=' + obj[key]);
    }
    return completeApi(`/${advisor ? 'advisor/' : ''}order/inquery?${lst.join('&')}`)
}

export function getFilterAllHoldings(userId, pageId, pageSize, filterText1, advisor = false) {
    const filterText = filterText1 && filterText1 !== '' && typeof filterText1 === 'string' ? `&filter=${filterText1.toLowerCase()}` : '';
    return completeApi(`/${advisor ? 'advisor/' : ''}portfolio/inquery?user_id=${userId}&page_id=${pageId || 1}${pageSize ? `&page_size=${pageSize}` : ''}${filterText}`)
}

export function getPortfolioPerformance(path) {
    return completeApi(`/balances/portfolio-performance/${path}`)
}

export function getRealtimePriceUrlNew(path, symbol) {
    // return `http://localhost:8089/v1/noti/notification/streaming-data/operation/operation`
    return `${dataStorage.env_config.api.custom.marketData}/${path}`
}

export function getRealtimeChart(path, symbol) {
    return getRealtimePriceUrlNew(`historical/${path}`, symbol)
}
export function checkVersion(check) {
    let url = `/ver?` + (new Date()).getTime();
    var headers = new Headers();
    headers.append('pragma', 'no-cache');
    headers.append('cache-control', 'no-cache');
    const thenFn = (response) => {
        if (check) {
            let newVersion;
            if (response && response.data) newVersion = response.data.toString();
            let currentVersion = localStorageNew.getItem('version');
            if (!currentVersion || (newVersion && currentVersion && newVersion !== currentVersion)) {
                localStorageNew.setItem('version', newVersion);
                if (!dataStorage.web_config[dataStorage.web_config.common.project].roles.bannerStax) {
                    showModal({
                        component: WhatsNew
                    });
                }
            }
        } else {
            if (!dataStorage.firstVersion) {
                dataStorage.firstVersion = response.data;
                return;
            }
            if (!dataStorage.updateMeShowed && dataStorage.firstVersion !== response.data) {
                dataStorage.updateMeShowed = true;
                showModal({
                    component: UpdateMe
                });
            }
        }
    };
    const catchFn = (error) => {
    };
    axios['get'](url, headers).then(thenFn).catch(catchFn);
}
export function getCreateMultiWatchlist(userId) {
    return completeApi(`/dynamic-watchlist/${userId}`)
}
export function getAllWatchlist(userId) {
    return completeApi(`/dynamic-watchlist/inquery?user_id=${userId}`)
}
export function getDeleteWatchlist(watchlistId, userId) {
    return completeApi(`/dynamic-watchlist/${watchlistId}/${userId}`)
}
export function getUpdateWatchlist(watchlistId, userId, action) {
    return completeApi(`/dynamic-watchlist/${watchlistId}/${userId}`) + (action ? `?action=${action}` : ``)
}
export function getNewDetails(userId, newsId) {
    return completeApi(`/analysis/news/read_news/${newsId}`)
}
export function getUrlAllSymbolRelatedNews() {
    return completeApi(`/analysis/symbol`)
}
export function getUrlCountReadNews(symbol) {
    let url;
    if (!symbol) return null;
    url = completeApi(`/analysis/news/news_inday?symbol=${symbol}`);
    return url;
}
export function getUrlCheckErrorPlaceOrder() {
    return completeApi(`/order/vetting/place/`)
}

export function getUrlCheckErrorModifyOrder(brokerOrderId) {
    return completeApi(`/order/vetting/amend/${brokerOrderId}`)
}

export function getUserDetailUrl(str) {
    return completeApi(`/user/${str}`)
}

export function getUpdateMarketAccessUrl(accountId) {
    return completeApi(`/user/market-access/${accountId}`)
}

export function getMarketAccessManagementUrl(pageId = 1, pageSize = 50, filterText = '') {
    return filterText ? completeApi(`/user/market-access/inquery?page_id=${pageId}&page_size=${pageSize}&filter=${filterText}`)
        : completeApi(`/user/market-access/inquery?page_id=${pageId}&page_size=${pageSize}`)
}

export function getChangePasswordlUrl(userLoginId) {
    return completeApi(`/user/change-password/${userLoginId}`)
}

export function getResetPasswordUrl() {
    return completeApi(`/auth/send-verify-username`)
}

export function getSearchCodeUrl(codeType) {
    let type = '';
    switch (codeType) {
        case 0: type = 'organisation'; break;
        case 1: type = 'branch'; break;
        case 2: type = 'advisor'; break;
    }
    return completeApi(`/user/account/code?type=${type}&filter=`)
}

export function getUserMan(filterText, pageId, pageSize) {
    const strQuery = filterText && filterText !== '' && typeof filterText === 'string' ? `&filter=${filterText.toLowerCase()}` : '';
    return completeApi(`/user/inquery?page_id=${pageId || 1}${pageSize ? `&page_size=${pageSize}` : ''}${strQuery}`)
}
export function getUrlCreateUser(data, meThod) {
    return completeApi(`/user/user-details`)
}
export function getUrlOrgBranchAdvisor(type) {
    return completeApi(`/user/account/code?type=${type}`)
}
export function getUrlOrgBranAdv(type) {
    return completeApi(`/user/account/config?type=${type}`)
}
export function getUserGroupUrl(userGroupId) {
    if (userGroupId) {
        return completeApi(`/user/role-group/${userGroupId}`)
    } else {
        return completeApi(`/user/role-group`)
    }
}
export function getMappingRoleUserGroupUrl() {
    return completeApi(`/user/role-group/mapping-role`)
}
export function getUrlAccountManagement(pageId, pageSize, filter) {
    if (!filter) return completeApi(`/user/account_info/inquery?page_id=${pageId}&page_size=${pageSize}`)
    return completeApi(`/user/account_info/inquery?page_id=${pageId}&page_size=${pageSize}&filter=${filter}`)
}
export function getMarginAccountSummaryUrl(pageId, pageSize) {
    return completeApi(`/search/margin-summary?page_id=${pageId}&page_size=${pageSize}`)
}

export function getMarketData(filterText, pageId, pageSize) {
    const strQuery = filterText && filterText !== '' && typeof filterText === 'string' ? `&filter=${filterText.toLowerCase()}` : '';
    return completeApi(`/user/market_data/inquery?page_id=${pageId || 1}${pageSize ? `&page_size=${pageSize}` : ''}${strQuery}`)
}
export function getDataBranch(branchId) {
    if (branchId) {
        return completeApi(`/user/branch/${branchId}`)
    } else {
        return completeApi(`/user/branch`)
    }
}
export function createNewBranch() {
    return completeApi(`/user/branch`)
}
export function enumBranch() {
    return completeApi(`/user/branch?type=enum`)
}
export function editBranch(branchId) {
    return completeApi(`/user/branch/${branchId}`)
}

export function forgotUsernameUrl() {
    return completeApi(`/auth/forgot-username`)
}

export function sendVerifyEmailUrl() {
    return completeApi(`/user/verification/send-verify-email/`)
}

export function verifyEmailUrl() {
    return completeApi(`/user/verification/verify-email/`)
}

export function createPasswordUrl(env) {
    return completeApi(`/auth/create-password`, env)
}

export function sendVerifyUsernameUrl(env) {
    return completeApi(`/auth/send-verify-username/`, env)
}

export function verifyUsernameUrl(env) {
    return completeApi(`/auth/verify-username`, env)
}
export function getEmailTempUrl() {
    return completeApi(`/user/email-template`)
}
export function getUserAddon() {
    return completeApi(`/user/addon`)
}
export function getCommodityInfoUrl(symbol) {
    if (!symbol) return;
    return completeApi(`/commodity-info/symbol/${symbol}`)
}

export function getUrlEditEmailNoti(userID) {
    return completeApi(`/user/user-details/email_alert/${userID}`)
}

export function getUrlEditSmsNoti(userID) {
    return completeApi(`/user/user-details/alert-sms/${userID}`)
}

export function getUrlAlert(path) {
    return completeApi(`/alert${path}`)
}
export function getUrlBrokerData(path) {
    return completeApi(`/broker-report${path}`)
}

export function getUrlAllBrokerName() {
    return completeApi(`/broker-name/broker-name`)
}

export function getUrlBrokerNameByID(brokerID) {
    return completeApi(`/broker-name/broker-name?id=${brokerID}`)
}

export function getUrlAllSecurityType(securityID) {
    return completeApi(`/broker-name/security-type`)
}

export function getUrlAllTradeType() {
    return completeApi(`/broker-name/trade-type`)
}

export function getUrlAllIndex() {
    return completeApi(`/market-info/symbol/company_name?class=index`)
}

export function getUrlCalendarASX(envCalendar) {
    return completeApi(`/calendar/${urlCalendar[envCalendar].ASX}`)
}

export function getUrlCalendarNASDAQ(envCalendar) {
    return completeApi(`/calendar/${urlCalendar[envCalendar].NASDAQ}`)
}

export function getUrlCalendarNYSE(envCalendar) {
    return completeApi(`/calendar/${urlCalendar[envCalendar].NYSE}`)
}

export function getUrlCalendarNSX(envCalendar) {
    return completeApi(`/calendar/${urlCalendar[envCalendar].NSX}`)
}

export function getUrlCalendarCXA(envCalendar) {
    return completeApi(`/calendar/${urlCalendar[envCalendar].CXA}`)
}

export function getUrlCalendarAXW(envCalendar) {
    return completeApi(`/calendar/${urlCalendar[envCalendar].AXW}`)
}

export function getUrlAccountCqg(path) {
    return completeApi(`/user/account_cqg/${path}`)
}

export function getUrlSearchAddress(searchValue) {
    return completeApi(`/harmony-right-address/lookup?filter=${searchValue}`)
}
export function getUrlAddressAutocomplete(searchValue, env) {
    return completeApi(`/address-finder/autocomplete?filter=${searchValue}`, env)
}
export function getUrlAddressMetaData(encryptedId, env) {
    return completeApi(`/address-finder/metadata?id=${encryptedId}`, env)
}
export function getUrlSupportTicket() {
    return completeApi(`/support-ticket`)
}
