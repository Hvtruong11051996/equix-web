import dataStorage from '../dataStorage';
import config from '../../public/config';
import logger from './log'
import { EventEmitter } from 'fbemitter';
import { func } from '../storage';
import { emitter, eventEmitter } from '../constants/emitter_enum';
import { isSubWindow, allowC2r, addPopoutEventHubListener, removePopoutEventHubListener } from '../helper/functionUtils'
import { makeData } from '../helper/fakeDataRealtime';
import sseWorker from '../workers/sse';
import Workers from '../workers';
import uuidv4 from 'uuid/v4';

const dicWorkerSub = {};

function init(obj = {}) {
    let { url, uid } = obj;
    let subscription = null;
    const id = uuidv4();
    // let timeCheck = null;
    let reqWorker = null;
    let sub = ''
    if (!dataStorage.isTest) {
    } else {
        if (url.indexOf('portfolio') > -1) {
            if (url.indexOf('access_token') === -1) {
                if (url.indexOf('account_id') > -1) url += `&access_token=${dataStorage.accessToken}`
                else url += `?access_token=${dataStorage.accessToken}`
            }
            sub = new EventSource(url, {
                withCredentials: false
            })
        } else {
            sub = new EventSourceEx(url, {
                headers: {
                    Authorization: `Bearer ${dataStorage.accessToken}`
                }
            })
        }
    }

    const fnCb = async (cbFn, dataRealtime, rt) => {
        return new Promise(resolve => {
            cbFn && cbFn(dataRealtime, uid);
            resolve();
        }).catch(err => {
            resolve();
        })
    }
    let connected = false;

    const onMessage = (e) => {
        let dataRealtime = null;
        if (!dataStorage.isTest) {
            dataRealtime = e.data;
        } else {
            const dataRealtimeTemp = JSON.parse(e.data);
            const keyConvert = {
                1: 'exchange',
                2: 'symbol',
                3: 'ask_price',
                4: 'ask_size',
                5: 'bid_price',
                6: 'bid_size',
                7: 'trade_price',
                8: 'trade_size',
                9: 'open',
                10: 'high',
                11: 'low',
                12: 'close',
                13: 'previous_close',
                14: 'change_point',
                15: 'change_percent',
                16: 'volume',
                17: 'value_traded',
                18: 'updated'
            };
            dataRealtime = {};

            for (const key in dataRealtimeTemp) {
                const val = dataRealtimeTemp[key];
                const newKey = keyConvert[key];
                if (newKey) {
                    dataRealtime[newKey] = val;
                } else {
                    dataRealtime[key] = val;
                }
            }
        }

        if (dataRealtime.type === 'ping') return;
        const processData = async () => {
            return new Promise(resolve => {
                let urlNew = url.replace(/[?&]access_token=[^?&=]+/, '')
                const m = urlNew.match(/^(.*[/=])([^/=]+)$/)
                let symbol;
                let exchange;
                if (urlNew.indexOf(`news/all`) > -1) {
                    symbol = 'all';
                } else {
                    symbol = dataRealtime.symbol || (dataRealtime[0] && dataRealtime[0].symbol)
                    if (symbol) {
                        symbol = encodeURIComponent(symbol);
                    }
                    exchange = dataRealtime.exchange || (dataRealtime[0] && dataRealtime[0].exchange)
                }
                if (symbol !== 'all' && exchange && (symbol && !symbol.endsWith('.' + exchange) && !dataRealtime.interval)) {
                    symbol += `.${exchange}`
                }
                if (!symbol && dataRealtime.data) {
                    if (m[2] !== 'operation') {
                        let dataAccount = typeof dataRealtime.data.object_changed === 'string' && JSON.parse(dataRealtime.data.object_changed);
                        if (dataAccount) symbol = dataAccount.account_id || ''
                    } else {
                        symbol = m[2]
                    }
                }
                let listListener = dataStorage.handleStremingBySymbol[symbol + '-' + m[1]] || [];
                const listPromise = [];
                if (!isSubWindow() && dataStorage.goldenLayout.goldenLayout) dataStorage.goldenLayout.goldenLayout.eventHub.emit(obj.url, dataRealtime)
                for (let r = 0; r < listListener.length; r++) {
                    const cbFn = listListener[r];
                    if (!cbFn || typeof cbFn !== 'function') continue
                    const abc = fnCb(cbFn, dataRealtime, r);
                    listPromise.push(abc);
                }
                Promise.all(listPromise).then(resList => {
                    resolve();
                }).catch(er => {
                    resolve();
                })
            });
        }
        // console.log('DATA REALTIME START');
        processData();
        // console.log('DATA REALTIME END');
    };

    const onOpen = (e) => {
        connected = true;
        logger.log(`Open nchan ${url}`);
    };
    const onError = (error) => {
        logger.log(`SSE ${url} error...`);
        logger.error(error); // message
        logger.log(`SSE ${url} is Closing...`);
        connected = false;
        sub.close();
        sub = null;
        logger.log(`SSE ${url} was Closed`);
        if (dataStorage.showPin) {
            const reConnectWhenEnterPin = () => {
                logger.log(`SSE ${url} is re-connecting...`);
                if (url.indexOf('portfolio') > -1) {
                    if (url.indexOf('access_token') === -1) {
                        if (url.indexOf('account_id') > -1) url += `&access_token=${dataStorage.accessToken}`
                        else url += `?access_token=${dataStorage.accessToken}`
                    }
                    sub = new EventSource(url, {
                        withCredentials: false
                    })
                } else {
                    sub = new EventSourceEx(url, {
                        headers: {
                            Authorization: `Bearer ${dataStorage.accessToken}`
                        }
                    })
                }
                sub.addEventListener('message', onMessage);
                sub.addEventListener('error', onError);
                sub.addEventListener('open', onOpen);
                subscription && subscription.remove();
                subscription = null;
            }
            subscription = emiterPin.addListener(eventEmitter.ENTER_PIN_SUCCESS, reConnectWhenEnterPin);
        } else {
            if (dataStorage.connected) {
                setTimeout(() => {
                    logger.log(`SSE ${url} is re-connecting...`);
                    if (url.indexOf('portfolio') > -1) {
                        if (url.indexOf('access_token') === -1) {
                            if (url.indexOf('account_id') > -1) url += `&access_token=${dataStorage.accessToken}`
                            else url += `?access_token=${dataStorage.accessToken}`
                        }
                        sub = new EventSource(url, {
                            withCredentials: false
                        })
                    } else {
                        if (!dataStorage.handleStreming[url]) return
                        sub = new EventSourceEx(url, {
                            headers: {
                                Authorization: `Bearer ${dataStorage.accessToken}`
                            }
                        })
                    }
                    sub.addEventListener('message', onMessage);
                    sub.addEventListener('error', onError);
                    sub.addEventListener('open', onOpen);
                }, 1000)
            } else {
                const emitNetwork = func.getStore(emitter.CHECK_CONNECTION);
                if (emitNetwork) {
                    const subcriberId = emitNetwork.addListener(eventEmitter.CHANGE_CONNECTION, (isConnected) => {
                        if (isConnected) {
                            subcriberId && subcriberId.remove();
                            logger.log(`SSE ${url} is re-connecting...`);
                            if (url.indexOf('portfolio') > -1) {
                                if (url.indexOf('access_token') === -1) {
                                    if (url.indexOf('account_id') > -1) url += `&access_token=${dataStorage.accessToken}`
                                    else url += `?access_token=${dataStorage.accessToken}`
                                }
                                sub = new EventSource(url, {
                                    withCredentials: false
                                })
                            } else {
                                sub = new EventSourceEx(url, {
                                    headers: {
                                        Authorization: `Bearer ${dataStorage.accessToken}`
                                    }
                                })
                            }
                            sub.addEventListener('message', onMessage);
                            sub.addEventListener('error', onError);
                            sub.addEventListener('open', onOpen);
                        }
                    })
                }
            }
        }
    };
    const excuteFunc = (url, type, data) => {
        const dicDataSub = dicWorkerSub[url] || {};
        for (const key in dicDataSub) {
            const element = dicDataSub[key];
            if (key === 'reqWorker') {
            } else {
                const fn = element[type];
                fn(data);
            }
        }
    }
    const createWorker = () => {
        const checkExist = dicWorkerSub[url];
        let isContinue = false;
        if (checkExist) {
            for (const k in checkExist) {
                const el = checkExist[k];
                if (el.callbackFn === obj.callback) {
                    isContinue = true;
                    break;
                }
            }
            if (!isContinue) {
                checkExist[id] = { id, onOpen, onMessage, onErrorWrk, callbackFn: obj.callback }
                dicWorkerSub[url] = checkExist;
                console.log('dicWorkerSub: ', dicWorkerSub);
            }
        } else {
            reqWorker = new Workers(sseWorker, 'SSE Subcribe');
            const itemWrkSub = { reqWorker };
            itemWrkSub[id] = { id, onOpen, onMessage, onErrorWrk, callbackFn: obj.callback };
            dicWorkerSub[url] = itemWrkSub;
            console.log('=> dicWorkerSub: ', dicWorkerSub);
            reqWorker.executeTask({ url, token: dataStorage.accessToken }, (data) => {
                if (data.type === 'open') {
                    excuteFunc(url, 'onOpen', data.data)
                } else if (data.type === 'message') {
                    excuteFunc(url, 'onMessage', data)
                } else if (data.type === 'error') {
                    delete dicWorkerSub[url];
                    reqWorker && reqWorker.terminate();
                    excuteFunc(url, 'onErrorWrk', data.data)
                }
            }, false)
        }
    }

    const onErrorWrk = (error) => {
        logger.log(`SSE ${url} error...`);
        logger.error(error); // message
        logger.log(`SSE ${url} is Closing...`);
        connected = false;
        logger.log(`SSE ${url} was Closed`);
        if (dataStorage.showPin) {
            const reConnectWhenEnterPin = () => {
                logger.log(`SSE ${url} is re-connecting...`);
                createWorker();
                subscription && subscription.remove();
                subscription = null;
            }
            subscription = emiterPin.addListener(eventEmitter.ENTER_PIN_SUCCESS, reConnectWhenEnterPin);
        } else {
            if (dataStorage.connected) {
                setTimeout(() => {
                    logger.log(`SSE ${url} is re-connecting...`);
                    createWorker();
                }, 1000)
            } else {
                const emitNetwork = func.getStore(emitter.CHECK_CONNECTION);
                if (emitNetwork) {
                    const subcriberId = emitNetwork.addListener(eventEmitter.CHANGE_CONNECTION, (isConnected) => {
                        if (isConnected) {
                            subcriberId && subcriberId.remove();
                            logger.log(`SSE ${url} is re-connecting...`);
                            createWorker();
                        }
                    })
                }
            }
        }
    };

    if (!dataStorage.isTest) {
        createWorker();
    } else {
        sub.addEventListener('error', onError);
        sub.addEventListener('open', onOpen);
        sub.addEventListener('message', onMessage);
    }

    // const ws = new WebSocket('ws://localhost:40510');
    // ws.onopen = function () {
    //     console.log('websocket is connected ...')
    //     ws.send('connected')
    // }

    // ws.onmessage = onMessage;
    return () => {
        sub && sub.close && sub.close()
        delete dicWorkerSub[url];
        reqWorker && reqWorker.terminate && reqWorker.terminate();
    }
}

export function regisRealtime(obj) {
    try {
        if (!dataStorage.userInfo) return
        if (isSubWindow()) {
            obj.isStreamingPrice = true
            addPopoutEventHubListener(obj)
            return
        }
        if (dataStorage.isSessionAnotherLogin) return
        if (!dataStorage.handleStreming) dataStorage.handleStreming = {}
        if (!dataStorage.handleStremingBySymbol) dataStorage.handleStremingBySymbol = {}
        if (obj.url) {
            const url = obj.url
            const m = obj.url.match(/^(.*[/=])([^/=]+)$/)
            if (!m) return;
            const origin = m[1]
            const allSymbol = (m[2] || '').split(',')
            allSymbol.map(symbol => {
                let urlKeyPush
                for (let urlKey in dataStorage.handleStreming) {
                    if (urlKey.indexOf(origin) === 0) {
                        if (urlKey.match(new RegExp('(/|=|,)' + symbol + '(,|$)'))) {
                            if (dataStorage.handleStremingBySymbol[symbol + '-' + origin].indexOf(obj.callback) === -1) {
                                dataStorage.handleStremingBySymbol[symbol + '-' + origin].push(obj.callback)
                            }
                            return
                        }
                        if (!urlKeyPush && urlKey.length < 1000) urlKeyPush = urlKey
                    }
                }
                if (urlKeyPush) {
                    if (dataStorage.handleStreming[urlKeyPush].timeoutId) {
                        clearTimeout(dataStorage.handleStreming[urlKeyPush].timeoutId)
                    }
                    if (dataStorage.handleStreming[urlKeyPush].stop) dataStorage.handleStreming[urlKeyPush].stop()
                    const lstSymbol = dataStorage.handleStreming[urlKeyPush]
                    delete dataStorage.handleStreming[urlKeyPush]
                    const newUrl = urlKeyPush + ',' + symbol
                    const lst = [symbol, ...lstSymbol];
                    dataStorage.handleStreming[newUrl] = lst
                    // if (obj.total === lst.length) {
                    dataStorage.handleStreming[newUrl].timeoutId = setTimeout(() => {
                        dataStorage.handleStreming[newUrl].stop = init({ url: newUrl, callback: obj.callback, uid: obj.uid })
                        // }
                    }, 50);
                } else {
                    dataStorage.handleStreming[origin + symbol] = [symbol]
                    dataStorage.handleStreming[origin + symbol].timeoutId = setTimeout(() => {
                        // if (obj.total === 1) {
                        dataStorage.handleStreming[origin + symbol].stop = init({ url: origin + symbol, callback: obj.callback, uid: obj.uid })
                        // }
                    }, 50);
                }
                dataStorage.handleStremingBySymbol[symbol + '-' + origin] = [obj.callback]
            })
        }
    } catch (error) {
        logger.error('error regisRealtime')
    }
}

export function unregisRealtime(obj) {
    try {
        if (isSubWindow()) {
            obj.isStreamingPrice = true
            removePopoutEventHubListener(obj)
            return
        }
        if (dataStorage.handleStremingBySymbol) {
            for (let src in dataStorage.handleStremingBySymbol) {
                const index = dataStorage.handleStremingBySymbol[src].indexOf(obj.callback)
                if (index > -1) dataStorage.handleStremingBySymbol[src].splice(index, 1)
                if (!dataStorage.handleStremingBySymbol[src].length) {
                    let m = src.match(/^([^-]+)-(.*)$/);
                    if (!m) continue;
                    const symbol = m[1]
                    const origin = m[2]
                    for (let urlKey in dataStorage.handleStreming) {
                        if (urlKey.indexOf(origin) === 0) {
                            if (urlKey.match(new RegExp('(/|=|,)' + symbol + '(,|$)'))) {
                                if (dataStorage.handleStreming[urlKey].timeoutId) {
                                    clearTimeout(dataStorage.handleStreming[urlKey].timeoutId)
                                }
                                if (dataStorage.handleStreming[urlKey].timeoutId) clearTimeout(dataStorage.handleStreming[urlKey].timeoutId)
                                if (dataStorage.handleStreming[urlKey].stop) dataStorage.handleStreming[urlKey].stop()
                                m = urlKey.match(/^(.*[/=])([^/=]+)$/)
                                if (m) {
                                    delete dataStorage.handleStremingBySymbol[symbol + '-' + m[1]]
                                    delete dataStorage.handleStreming[urlKey]
                                    const listSymbol = m[2].split(',')
                                    if (listSymbol.indexOf(symbol) > -1) listSymbol.splice(listSymbol.indexOf(symbol), 1)
                                    if (listSymbol.length) {
                                        const url = m[1] + listSymbol.join(',')
                                        dataStorage.handleStreming[url] = listSymbol
                                        dataStorage.handleStreming[url].timeoutId = setTimeout(() => {
                                            dataStorage.handleStreming[url].stop = init({ url: url })
                                        }, 50);
                                    }
                                }
                                continue
                            }
                        }
                    }
                }
            }
        }
    } catch (e) {
        logger.error('unregisRealtime: ', e)
    }
}
