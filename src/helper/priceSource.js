import dataStorage from '../dataStorage';
import { completeApi, getData, getRealtimePriceUrlNew } from './request';
import { addEventListener, EVENTNAME } from './event';
import { regisRealtime, unregisRealtime } from './streamingSubscriber';
import { clone } from './functionUtils'
const dicCallback = {};
const dicSymbol = {};
const dicPrice = {};
export const marketDataType = {
    noAccess: 0,
    delayed: 1,
    clickToRefresh: 2,
    streaming: 3
}

const SPECIAL_EXCHANGE = ['SSX']

export const getMarketDataType = (symbolObj) => {
    if (dataStorage.env_config.roles.useNewMarketData) {
        const exchange = (symbolObj.exchanges && symbolObj.exchanges[0]) || symbolObj.exchange
        if (!dataStorage.marketDataType || [null, undefined].includes(dataStorage.marketDataType[exchange])) return marketDataType.delayed
        return dataStorage.marketDataType[exchange]
    } else if (dataStorage.userInfo) {
        if (symbolObj.class === 'future') {
            return dataStorage.userInfo.market_data_fu
        } else if (symbolObj.country === 'US') {
            return dataStorage.userInfo.market_data_us
        } else if (symbolObj.country === 'AU') {
            return dataStorage.userInfo.market_data_au
        }
    }
    return marketDataType.delayed;
}
const processRealtimeData = (data) => {
    if (dicCallback[data.symbol]) dicCallback[data.symbol].forEach(cb => cb(data));
}
const processRealtimeDataError = (data) => {
    if (dicCallback[data.symbol]) dicCallback[data.symbol].forEach(cb => cb({})); // eslint-disable-line
}
const updateRealtime = () => {
    unregisRealtime({
        callback: processRealtimeData
    });
    Object.keys(dicCallback).forEach(symbol => {
        if (dicSymbol[symbol]) {
            const symbolObj = dicSymbol[symbol]
            const type = getMarketDataType(symbolObj);
            if (type !== marketDataType.streaming) return
            let encoded = encodeURIComponent(symbol);
            const exchange = symbolObj.exchanges && symbolObj.exchanges[0];
            if (!isSpecialExchange(exchange) && symbolObj.country === 'AU') encoded += '.ASX';
            regisRealtime({
                url: getRealtimePriceUrlNew(`price/${encoded}`, symbolObj),
                callback: processRealtimeData
            });
        }
    });
}
const clearData = (symbol, isNoAccess) => {
    if (dicPrice[symbol] && dicCallback[symbol]) {
        const price = dicPrice[symbol];
        if (price.quote) {
            Object.keys(price.quote).forEach(key => {
                if (key === 'exchange' || key === 'symbol') return;
                if (!isNoAccess) {
                    if (key === 'trade_price' || key === 'bid_price' || key === 'ask_price') return;
                }
                price.quote[key] = '--';
            })
        }
        if (price.trades) {
            Object.keys(price.trades).forEach(key => {
                price.trades[key] = '--';
            })
        }
        if (price.depth) {
            if (price.depth.ask) {
                Object.keys(price.depth.ask).forEach(key => {
                    price.depth.ask[key].number_of_trades = '--';
                    price.depth.ask[key].price = '--';
                    price.depth.ask[key].quantity = '--';
                })
            }
            if (price.depth.bid) {
                Object.keys(price.depth.bid).forEach(key => {
                    price.depth.bid[key].number_of_trades = '--';
                    price.depth.bid[key].price = '--';
                    price.depth.bid[key].quantity = '--';
                })
            }
        }
        dicCallback[symbol].forEach(cb => cb(price));
    }
}

function isSpecialExchange(exchange) {
    return SPECIAL_EXCHANGE.includes(exchange)
}

const processFetchData = (pendingSymbol) => {
    function fetchData(exchangeObj, path) {
        Object.keys(exchangeObj).forEach(exchange => {
            if (!exchange) return
            const url = completeApi(`/${path}/price/${exchange || ''}/${exchangeObj[exchange].join(',')}`);
            getData(url).then(res => {
                if (res && res.data && res.data.length) {
                    for (let i = 0; i < res.data.length; i++) {
                        const price = res.data[i] && res.data[i];
                        if (!price) continue;
                        if (price.trades) {
                            price.trades = Object.keys(price.trades).map((key, index) => {
                                price.trades[key].index = index;
                                return price.trades[key]
                            })
                        }
                        processRealtimeData(price);
                        if (dicPrice[price.symbol]) Object.assign(dicPrice[price.symbol], price);
                        else dicPrice[price.symbol] = price;
                    }
                } else processRealtimeDataError({ symbol: exchangeObj[exchange] })
            }).catch(error => {
                processRealtimeDataError({ symbol: exchangeObj[exchange] })
                console.log('error', error);
            })
        })
    }
    const objNormal = {};
    const objDelayed = {};
    let symbolObj = {}
    Object.keys(pendingSymbol || dicCallback).forEach(symbol => {
        symbolObj = dicSymbol[symbol];
        if (!symbolObj) return;
        const type = getMarketDataType(symbolObj);
        const exchange = symbolObj.exchanges && symbolObj.exchanges[0];
        if (exchange) {
            if (type === marketDataType.delayed) {
                !pendingSymbol && clearData(symbol);
                if (!objDelayed[exchange]) objDelayed[exchange] = [];
                objDelayed[exchange].push(encodeURIComponent(symbol));
            } else if (type === marketDataType.clickToRefresh || type === marketDataType.streaming) {
                if (!pendingSymbol) {
                    if (type === marketDataType.streaming) return;
                    clearData(symbol);
                }
                if (!objNormal[exchange]) objNormal[exchange] = [];
                objNormal[exchange].push(encodeURIComponent(symbol));
            }
        }
    })
    if (Object.keys(objNormal).length === 0 && Object.keys(objDelayed).length === 0 && Object.keys(pendingSymbol).length === 1) {
        processRealtimeData({
            depth: {
                ask: {},
                bid: {}
            },
            exchange: symbolObj.exchanges[0],
            symbol: symbolObj.symbol,
            quote: {},
            trades: [],
            isClear: true
        });
    } else {
        fetchData(objNormal, 'feed-snapshot-aio');
        fetchData(objDelayed, 'feed-delayed-snapshot-aio');
    }
}
addEventListener(EVENTNAME.clickToRefresh, () => {
    processFetchData();
});
const oldMarketDataType = {}
let timeoutId;
let pendingSymbol = {};
addEventListener(EVENTNAME.marketDataTypeChanged, (data) => {
    if (data.market_data_type !== oldMarketDataType[data.exchange]) {
        if (oldMarketDataType[data.exchange] === marketDataType.streaming || data.market_data_type === marketDataType.streaming) updateRealtime();
        if (data.market_data_type === marketDataType.noAccess) {
            Object.keys(dicCallback).forEach(symbol => {
                const symbolObj = dicSymbol[symbol];
                if (!symbolObj) return;
                const exchange = symbolObj.exchanges && symbolObj.exchanges[0];
                if (exchange === data.exchange) clearData(symbol, true);
            })
        } else {
            Object.keys(dicCallback).forEach(symbol => {
                const symbolObj = dicSymbol[symbol];
                if (!symbolObj) return;
                const exchange = symbolObj.exchanges && symbolObj.exchanges[0];
                if (exchange === data.exchange) {
                    pendingSymbol[symbol] = symbolObj;
                    if (timeoutId) clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        timeoutId = null;
                        processFetchData(pendingSymbol);
                        pendingSymbol = {};
                    }, 500)
                }
            })
        }
        oldMarketDataType[data.exchange] = data.market_data_type;
    }
});
export const addPriceListener = (symbolObjOrlistSymbolObj, cb) => {
    if (!Array.isArray(symbolObjOrlistSymbolObj)) symbolObjOrlistSymbolObj = [symbolObjOrlistSymbolObj]
    symbolObjOrlistSymbolObj.forEach(symbolObj => {
        if (symbolObj && typeof cb === 'function') {
            pendingSymbol[symbolObj.symbol] = symbolObj;
            const type = getMarketDataType(symbolObj);
            dicSymbol[symbolObj.symbol] = symbolObj;
            if (!dicCallback[symbolObj.symbol]) {
                dicCallback[symbolObj.symbol] = [cb];
                if (type === marketDataType.streaming) updateRealtime();
            } else if (!dicCallback[symbolObj.symbol].includes(cb)) dicCallback[symbolObj.symbol].push(cb);
        }
    })
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        timeoutId = null;
        processFetchData(pendingSymbol);
        pendingSymbol = {};
    }, 100)
}
export const removePriceListener = (cb) => {
    if (typeof cb === 'function') {
        Object.keys(dicCallback).forEach(symbol => {
            const index = dicCallback[symbol].indexOf(cb);
            if (index > -1) {
                dicCallback[symbol].splice(index, 1);
            }
            if (!dicCallback[symbol].length) delete dicCallback[symbol];
            const symbolObj = dicSymbol[symbol];
            if (!symbolObj) return;
            const exchange = symbolObj.exchanges && symbolObj.exchanges[0];
            if (getMarketDataType(symbolObj) === marketDataType.streaming) updateRealtime();
        })
    }
}
