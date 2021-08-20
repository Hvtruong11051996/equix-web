import { EventEmitter } from 'fbemitter';

export const emitter = new EventEmitter();
export const dicData = {
}
export const dicRegister = {
}
export const dicToken = {
}
export const dicCheck = {
}

function getEventName(type, pattern, code) {
    if (!type || !pattern) return null;
    return `${type}|${pattern}|${code}`;
}
export function unregister(opt = {}) {
    const { type, pattern, code } = opt;
    const eventName = getEventName(type, pattern, code);
    const itemH = dicRegister[eventName];
    if (itemH) {
        itemH.remove();
        dicRegister[eventName] = null;
    }
    delete dicData[type + pattern];
    const sub = dicCheck[type + pattern];
    sub && sub.stop();
    delete dicCheck[type + pattern];
    // dicData[type + pattern] = null;
}
export function register(opt = {}) {
    const { type, pattern, code, callback } = opt;
    const eventName = getEventName(type, pattern, code);
    const dataTemp = dicData[type + pattern] || {};
    const data = dataTemp.data || {};
    const dataLevel2 = data[code];

    emitter.addListener(eventName, callback);
}
export function unregisterLink(opt = {}) {
    const { eventName, callback, subscription } = opt;
    if (subscription) {
        subscription.remove();
    }
    // dicData[type + pattern] = null;
}
export function emitterData(dataDic, type, symbol) {
    if (Object.keys(dataDic).length === 0) {
        let eventName = getEventName(symbol, type, symbol);
        emitter.emit(eventName, dataDic);
    } else {
        for (const code in dataDic) {
            const val = dataDic[code];
            let eventName = getEventName(symbol, type, symbol);
            emitter.emit(eventName, val);
        }
    }
}
export function emitterSymbol(eventName, symbol) {
    if (symbol) {
        emitter.emit(eventName, symbol);
    }
}
export function registerLink(opt = {}) {
    const { eventName, callback } = opt;
    const subscription = emitter.addListener(eventName, callback);
    // dicToken[subscription] = subscription;
    return subscription;
}
export function registerSettings(opt = {}) {
    const { eventName, callback } = opt;
    const subscription = emitter.addListener(eventName, callback);
    // dicToken[subscription] = subscription;
    return subscription;
}
export function emitterSetting(eventName, listSetting) {
    if (listSetting) {
        emitter.emit(eventName, listSetting);
    }
}
function getKeyVal(data) {
    return data._key || data.symbol || data.code;
}
