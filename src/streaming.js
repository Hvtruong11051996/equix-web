
import { getAccountStreamingUrl, getUserStreamingUrl, getStreamingAccountUrl, getAllAccountsStreamingUrl, getBranchStreamingUrl, getWarningTechnicalStreamingUrl } from './helper/request';
import { subcriber, unregister } from './sse';
import { addPopoutEventHubListener, isSubWindow } from './helper/functionUtils'
import logger from './helper/log';
import dataStorage from './dataStorage';
import config from '../public/config';

export function regisRealtime(obj = {}) {
    if (!obj.url) return
    if (isSubWindow()) {
        addPopoutEventHubListener(obj)
        return
    }
    subcriber(obj.url, obj.callback, obj.type);
}

export function unregisRealtime(obj = {}) {
    if (!obj.url) return
    if (isSubWindow()) {
        removePopoutEventHubListener(obj)
        return
    }
    unregister(obj.url, obj.callback, obj.type);
}

export function registerAccount(accountId, callback, type) {
    const url = accountId ? dataStorage.accountStreamingUrl : null;
    regisRealtime({ url, callback, type })
}
export function unregisterAccount(accountId, callback, type) {
    const url = accountId ? dataStorage.accountStreamingUrl : null;
    unregisRealtime({ url, callback, type })
}
export function registerAccountStreaming(accountId, callback, type, isOperator = false) {
    const url = accountId ? isOperator ? getAllAccountsStreamingUrl() : getStreamingAccountUrl(accountId) : null;
    dataStorage.accountStreamingUrl = url;
    regisRealtime({ url, callback, type })
}

export function registerAllOrders(callback, type) {
    const url = dataStorage.accountStreamingUrl
    regisRealtime({ url, callback, type })
}

export function unregisterAllOrders(callback, type) {
    const url = dataStorage.accountStreamingUrl;
    unregisRealtime({ url, callback, type })
}

export function registerUser(userId, callback, type) {
    const url = userId ? getUserStreamingUrl(userId) : null;
    regisRealtime({ url, callback, type })
}
export function unregisterUser(userId, callback, type) {
    const url = userId ? getUserStreamingUrl(userId, userId === 'guest' ? dataStorage.web_config['guest'] : null) : null;
    unregisRealtime({ url, callback, type })
}
export function registerBranch(userId, callback, type) {
    const url = userId ? getAllAccountsStreamingUrl(userId) : null;
    regisRealtime({ url, callback, type })
}
export function unregisterBranch(userId, callback, type) {
    const url = userId ? getAllAccountsStreamingUrl(userId) : null;
    unregisRealtime({ url, callback, type })
}
export function registerWarningTechnicalStreaming(userId, callback, type) {
    const url = userId ? getWarningTechnicalStreamingUrl() : null;
    regisRealtime({ url, callback, type })
}
export function unregisterWarningTechnicalStreaming(userId, callback, type) {
    const url = userId ? getWarningTechnicalStreamingUrl() : null;
    unregisRealtime({ url, callback, type })
}
