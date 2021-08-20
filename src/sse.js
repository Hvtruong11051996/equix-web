import 'event-source-any-where';
import dataStorage from './dataStorage';
import { func } from './storage';
import logger from './helper/log';
import actionType from './constants/action_type_enum';
import { handleShowNotification, handleNetwork } from './helper/functionUtils';
import { EventEmitter } from 'fbemitter';
import { emitter, eventEmitter } from './constants/emitter_enum';
import config from '../public/config';
import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';

const EventSource = NativeEventSource || EventSourcePolyfill;

let subcriberId = {};
let lastPing;
const TIME_DURATION = 10 * 1000;
let timeoutId = {};

const emiterPin = new EventEmitter();
func.setStore(emitter.PIN_INPUT, emiterPin);

function addType(url, type, cbFn) {
    let itemDic = dataStorage.typeRegisters[url];

    if (!itemDic) {
        itemDic = {};
    }

    let itemType = itemDic[type];
    if (!itemType) {
        itemType = [];
    }

    itemType.push(cbFn);
    itemDic[type] = itemType;
    dataStorage.typeRegisters[url] = itemDic;
}

function getTypeFromTitle(title = '') {
    // ORDER_DETAIL#INSERT#00000000_0000_0000_bb71_5b03b4f20071
    const listSplit = title.split('#');
    if (listSplit.length > 0) return (listSplit[0] + '').toUpperCase();
    return '';
}
function getActionFromTitle(title = '') {
    // ORDER_DETAIL#INSERT#00000000_0000_0000_bb71_5b03b4f20071
    const listSplit = title.split('#');
    const action = (listSplit[1] + '').toUpperCase();
    return actionType[action];
}
function parseJSONorNot(mayBeJSON) {
    if (typeof mayBeJSON === 'string') {
        return JSON.parse(mayBeJSON);
    } else {
        return mayBeJSON;
    }
}

export function subcriber(url, callbackFn, types = '') {
    const newUrl = url;
    const newCallbackFn = callbackFn;
    let lastEventId = '12345';
    let connected = false;
    const newTypes = types.toUpperCase();
    window.onbeforeunload = () => {
        logger.log('Dude, are you sure you want to refresh? Think of the kittens!');
    }
    const listType = [newTypes]
    for (let t = 0; t < listType.length; t++) {
        addType(newUrl, listType[t], newCallbackFn);
    }

    let eventSource = dataStorage.sseRegisters[newUrl];
    if (!eventSource) {
        let options = {
            headers: {
                Authorization: `Bearer ${dataStorage.accessToken}`,
                'Access-Control-Allow-Origin': '*'
            }
        };
        eventSource = new EventSource(`${newUrl}${newUrl && newUrl.indexOf('?') >= 0 ? '&' : '?'}handshake-interval=3000&retry=3000&lastEventId=${lastEventId}&access_token=${dataStorage.accessToken}`, options);
        dataStorage.sseRegisters[newUrl] = eventSource;
        const onOpen = (...arg) => {
            connected = true;
            logger.log(`SSE ${newUrl} CONNECTED`);
            onMessage({ data: `{"data":{"ping":${+new Date()}}}` })
        };
        const onError = (error) => {
            logger.log(`SSE ${newUrl} error...`);
            logger.error(error);
            if (connected) {
                logger.error(`SSE ${newUrl} is Closing...`);
                logger.error(error); // message
            }
            connected = false;
            logger.log(`SSE ${newUrl} is Closing...`);
            eventSource && eventSource.close();
            eventSource = null;
        };
        const onMessage = (data) => {
            if (!dataStorage.connected) handleNetwork(true)
            dataStorage.timeoutNetwork && clearTimeout(dataStorage.timeoutNetwork)
            dataStorage.timeoutNetwork = setTimeout(() => {
                handleNetwork(false)
            }, 10000)
            if (data.lastEventId) lastEventId = data.lastEventId;
            if (data.data) data = data.data;
            if (data && data !== "'{}'") {
                // logger.sendLog('SSE message' + data);
                // console.log('SSE message' + data);
                let objectParse = JSON.parse(data);
                if (objectParse.data) objectParse = objectParse.data
                if (objectParse && objectParse.ping) dataStorage.ping = objectParse.ping
                if (timeoutId[newUrl]) {
                    clearTimeout(timeoutId[newUrl]);
                    delete timeoutId[newUrl]
                }
                if (subcriberId[newUrl]) {
                    subcriberId[newUrl].remove();
                    delete subcriberId[newUrl]
                }
                timeoutId[newUrl] = setTimeout(() => {
                    const emitNetwork = func.getStore(emitter.CHECK_CONNECTION_STREAM);
                    if (emitNetwork) {
                        subcriberId[newUrl] = emitNetwork.addListener(eventEmitter.CHANGE_CONNECTION_STREAM, (isConnected) => {
                            if (newUrl.includes('//guest') && dataStorage.userInfo) {
                                subcriberId[newUrl].remove();
                                delete subcriberId[newUrl]
                                clearTimeout(timeoutId[newUrl]);
                                delete timeoutId[newUrl]
                                return
                            }
                            // console.log('SSE connected: ' + isConnected)
                            if (isConnected) {
                                // console.log('SSE timeout: ' + newUrl);
                                logger.sendLog('SSE timeout: ' + newUrl)
                                onError();
                                if (subcriberId[newUrl]) {
                                    subcriberId[newUrl].remove();
                                    delete subcriberId[newUrl]
                                }
                                logger.log(`SSE ${newUrl} is re-connecting...`);
                                options = {
                                    headers: {
                                        Authorization: `Bearer ${dataStorage.accessToken}`,
                                        'Access-Control-Allow-Origin': '*'
                                    }
                                };
                                eventSource = new EventSource(`${newUrl}${newUrl && newUrl.indexOf('?') >= 0 ? '&' : '?'}handshake-interval=3000&retry=3000&lastEventId=${lastEventId}&access_token=${dataStorage.accessToken}`, options);
                                dataStorage.sseRegisters[newUrl] = eventSource;
                                eventSource.addEventListener('message', onMessage);
                                eventSource.addEventListener('error', onError);
                                eventSource.addEventListener('open', onOpen);
                                // console.log(newUrl)
                                if (newUrl.includes('operation') || newUrl.includes('account')) {
                                    func.emitter(emitter.STREAMING_ACCOUNT_DATA, eventEmitter.REFRESH_DATA_ACCOUNT, 'refresh');
                                }
                            }
                        })
                    }
                }, TIME_DURATION)
                if (objectParse.ping) {
                    // console.log('SSE ', new Date(objectParse.ping))
                } else {
                    if (objectParse && objectParse.object_changed) {
                        const title = objectParse.title || '';
                        const objectChanged = objectParse.object_changed;
                        const typeNotify = getTypeFromTitle(title);
                        const actionNotify = getActionFromTitle(title);
                        const dicByUrl = dataStorage.typeRegisters[newUrl] || {};
                        const dicByType = dicByUrl[typeNotify] || [];
                        const objData = parseJSONorNot(objectChanged);
                        const notif = objectParse;
                        const listPromisse = [];
                        for (let t = 0; t < dicByType.length; t++) {
                            const cbType = dicByType[t];
                            listPromisse.push(new Promise(resolve => {
                                setTimeout(() => {
                                    const data = JSON.parse(JSON.stringify(objData))
                                    cbType && cbType(data, actionNotify, title, objectParse.action);
                                    resolve();
                                })
                            }))
                        }
                        // listPromisse.push(new Promise(resolve => {
                        //     resolve();
                        // }))
                        if (listPromisse.length) {
                            Promise.all(listPromisse).then(() => {
                                handleShowNotification(notif);
                            }).catch(err => {
                                logger.error(err);
                            });
                        } else {
                            handleShowNotification(notif);
                        }
                    }
                }
            }
        };
        eventSource.addEventListener('message', onMessage);
        eventSource.addEventListener('error', onError);
        eventSource.addEventListener('open', onOpen);
    }
}

export function unregister(url, callbackFn, type = '') {
    const newTypes = type.toUpperCase();
    if (!dataStorage.typeRegisters[url]) dataStorage.typeRegisters[url] = {};
    const dicByUrl = dataStorage.typeRegisters[url];
    const dicByType = dicByUrl[newTypes] || [];
    const index = dicByType.indexOf(callbackFn);
    if (index >= 0) {
        dicByType.splice(index, 1);
        if (!dicByType.length) delete dicByUrl[newTypes];
    }
    dataStorage.typeRegisters[url] = dicByUrl;
    if (!dicByUrl || !Object.keys(dicByUrl).length) dataStorage.sseRegisters[url] && dataStorage.sseRegisters[url].close();
}

export function unregisterAll(url) {
    const eventSource = dataStorage.sseRegisters[url];
    if (eventSource) {
        eventSource.removeAllListeners();
        eventSource.close();
    }
}
