// api/stream.js
import historyProvider from './historyProvider.js'
import { getRealtimeChart, getRealtimePriceUrlNew } from '../../../helper/request'
import dataStorage from '../../../dataStorage'
import { regisRealtime, unregisRealtime } from '../../../helper/streamingSubscriber'
import { isAUSymbol } from '../../../helper/functionUtils'
import { getMarketDataType } from '../../../helper/priceSource'

const objTime = {
    '1': '1m',
    '5': '5m',
    '30': '30m',
    '60': '1h',
    '120': '2h',
    'D': '1d',
    '1D': '1d',
    'W': 'week',
    '1W': 'week',
    'M': 'month',
    '1M': 'month'
}

const marketDataType = {
    noAccess: 0,
    delayed: 1,
    clickToRefresh: 2,
    streaming: 3
}

const sub = {}
const timeout = {}

const convertToNumber = function (value) {
    if (typeof value === 'number') return value
    if (typeof value === 'string') return parseFloat((value).replace(/,/g, ''))
}

const callbackFn = (obj, uid) => {
    const updateCb = sub[uid]
    const lastBar = obj.symbol && historyProvider.history[uid].lastBar
    if (lastBar && lastBar.time > obj.time) return
    const newObject = {
        close: convertToNumber(obj.close),
        high: convertToNumber(obj.high),
        time: convertToNumber(obj.time),
        low: convertToNumber(obj.low),
        open: convertToNumber(obj.open),
        volume: convertToNumber(obj.volume)
    }
    timeout[uid] && clearTimeout(timeout[uid])
    timeout[uid] = setTimeout(() => {
        updateCb && updateCb.forEach(cb => {
            console.log(`YOLO: uid-${uid} ${obj.symbol}`)
            cb(newObject)
        });
    }, 200)
    historyProvider.history[uid] = { lastBar: newObject }
}

const realtimeChartCb = function (obj, uid) {
    for (const key in sub) {
        if (key.includes(obj.symbol)) {
            callbackFn(obj, uid)
        }
    }
}

const realtimePrice = function (obj, uid) {
    const updateCb = sub[uid]
    const item = obj.quote || obj || {}
    const price = item.close || item.trade_price
    const lastBar = obj.symbol && historyProvider.history[obj.symbol].lastBar
    if (lastBar.time > item.updated) return
    const newObject = {
        ...lastBar,
        close: convertToNumber(price || 0),
        volume: convertToNumber(item.volume || 0)
    };
    if (price < lastBar.low) newObject.low = convertToNumber(price)
    else if (price > lastBar.high) newObject.high = convertToNumber(price)
    historyProvider.history[obj.symbol] = { lastBar: newObject }
    updateCb && updateCb.forEach(cb => cb(newObject));
}

const fakeRealtime = function () {
    setInterval(() => {
        for (const uid in sub) {
            const updateCb = sub[uid]
            const lastBar = historyProvider.history[uid].lastBar
            const newObject = {
                close: convertToNumber(lastBar.close * (Math.random() * 0.4 + 99.8) / 100),
                high: convertToNumber(lastBar.high),
                time: convertToNumber(lastBar.time),
                low: convertToNumber(lastBar.low),
                open: convertToNumber(lastBar.open),
                volume: convertToNumber(lastBar.volume)
            }
            timeout[uid] && clearTimeout(timeout[uid])
            timeout[uid] = setTimeout(() => {
                updateCb && updateCb.forEach(cb => {
                    console.log(`YOLO: uid-${uid}`)
                    cb(newObject)
                });
            }, 200)
        }
    }, 5000);
}

export default {
    subscribeBars: function (symbolInfo, resolution, updateCb, uid, resetCache) {
        if (sub[uid]) sub[uid].push(updateCb)
        else sub[uid] = [updateCb]
        // fakeRealtime()
        // register realtime new bar
        const type = getMarketDataType(symbolInfo);
        if (type === marketDataType.streaming) {
            const urlHistory = getRealtimeChart(`${objTime[resolution]}/${symbolInfo.exchange}/${encodeURIComponent(symbolInfo.symbol)}`, dataStorage.symbolsObjDic[symbolInfo.symbol])
            regisRealtime({
                url: urlHistory,
                callback: realtimeChartCb,
                uid
            })
        }
        // register realtime update last bar
        // const urlPrice = getRealtimePriceUrlNew(`price/${encodeURIComponent(symbolInfo.symbol)}${isAUSymbol(symbolInfo.exchange) && symbolInfo.exchange === 'ASX' ? ('.' + symbolInfo.exchange) : ''}`, symbolInfo)
        // regisRealtime({
        //     url: urlPrice,
        //     callback: realtimePrice,
        //     uid
        // })
    },
    unsubscribeBars: function (uid) {
        delete sub[uid]
        unregisRealtime({
            callback: realtimeChartCb
        })
        // unregisRealtime({
        //     callback: realtimePrice
        // })
    }
}
