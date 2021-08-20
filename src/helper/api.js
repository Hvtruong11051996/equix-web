import { getUrlAuth, postData, getUrlPin, getUrlDecode, getUrlRefresh, getUrlChangePin } from './request';
import dataStorage from '../dataStorage';
import config from '../../public/config';
import logger from '../helper/log';
import { getSecretKey, logout, emitDataEventHub } from './functionUtils';
import CryptoJS from 'react-native-crypto-js';
import warning from '../components/Inc/Warning';
// import { setInterval, clearInterval } from 'worker-timers';

const REFRESH_TIME = 15 * 60 * 1000;
export let networkSubcriberId = null;
export function refreshAccessToken(cb) {
    logger.log(`RENEW TOKEN => SEND REFRESH TOKEN  - ${new Date().getTime()}`);
    postRefresh(dataStorage.tokenRefresh)
        .then(result => {
            logger.log(`RENEW TOKEN => REFRESH TOKEN SUCCESS - ${new Date().getTime()}`);
            if (result.data && result.data.accessToken) {
                dataStorage.tokenTime = new Date().getTime();
                dataStorage.accessToken = result.data.accessToken;
                emitDataEventHub({ accessToken: result.data.accessToken })
                logger.log('CHECK TOKEN ===> AUTO REFRESH loginAction showModal postPin SET NEW TOKEN: ', dataStorage);
                cb && cb();
            } else {
                logger.log(`RENEW TOKEN => CAN NOT RENEW TOKEN BECAUSE - ${new Date().getTime()}`);
            }
        })
        .catch(err => {
            logger.log(`RENEW TOKEN => CAN NOT RENEW TOKEN  - ${new Date().getTime()}`);
            logger.error(err);
            const errorEnum = {
                USER_ADMIN_BLOCKED: 2023,
                USER_INACTIVE: 2013,
                USER_CLOSED: 2022,
                USER_SECURITY_BLOCKED: 2032
            }
            if (err.response) {
                if (!dataStorage.userInfo) return
                let errorCode = err.response.errorCode
                if ([errorEnum.USER_ADMIN_BLOCKED, errorEnum.USER_INACTIVE, errorEnum.USER_CLOSED, errorEnum.USER_SECURITY_BLOCKED].indexOf(errorCode) > -1) {
                    warning({
                        message: 'lang_force_logout',
                        callback: () => {
                            setTimeout(() => {
                                if (localStorageNew.getItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : ''))) localStorageNew.removeItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : ''))
                                logout();
                            }, 1000)
                        }
                    })
                } else {
                    console.log('refreshFailed: ', err)
                    localStorageNew.removeItem('isStayLogin', true);
                    warning({
                        message: 'lang_pin_expired',
                        callback: () => {
                            window.location.reload();
                        }
                    });
                }
            }
        })
}
export function autoRefreshToken(token) {
    dataStorage.tokenRefresh = token;
    dataStorage.tokenTime = new Date().getTime();
    if (dataStorage.intervalRefreshToken) clearRefreshToken(dataStorage.intervalRefreshToken);
    dataStorage.intervalRefreshToken = setInterval(refreshAccessToken, REFRESH_TIME)
}
export function clearRefreshToken(intervalId) {
    intervalId && clearInterval(intervalId);
}

export function postRefreshWithoutPin(tokenRefresh, cb) {
    postRefresh(tokenRefresh)
        .then(result => {
            if (result.data && result.data.accessToken) {
                dataStorage.accessToken = result.data.accessToken;
                logger.log('CHECK TOKEN ===> POST REFRESH WITH loginAction showModal postPin SET NEW TOKEN: ', dataStorage);
                cb && cb();
            } else {
                logger.log('=> CAN NOT RENEW TOKEN', result);
            }
        })
        .catch(err => {
            logger.log('CAN NOT RENEW TOKEN');
            logger.error(err);
        });
}

export async function loginRandomPin(isSavePin = true, pin = '010203') {
    try {
        const email = dataStorage.web_config['guest'].auth.username
        const password = new Date().getTime() + ''
        return new Promise((resolve, reject) => {
            login(email, password, true)
                .then(res => {
                    if (res.data) {
                        dataStorage.loginEmail = email;
                        postPin(res.data.accessToken, pin)
                            .then(result => {
                                if (result.data) {
                                    dataStorage.loginEmail = email;
                                    const tokenKey = `${email}_refresh_token`;
                                    const pinKey = `${email}_pin_refresh_token`;

                                    localStorageNew && localStorageNew.setItem(tokenKey, result.data.refreshToken);
                                    dataStorage.accessToken = result.data.accessToken;
                                    logger.log('CHECK TOKEN ===> RANDOM PIN loginAction showModal postPin SET NEW TOKEN: ', dataStorage);
                                    if (isSavePin) {
                                        localStorageNew && localStorageNew.setItem(pinKey, result.data.pin);
                                    }
                                    return resolve(result);
                                } else {
                                    return reject({ error: 'DATA_IS_NULL' }); // eslint-disable-line
                                }
                            })
                            .catch(err => {
                                return reject(err);
                            })
                    } else {
                        return reject({ error: 'DATA_IS_NULL' }); // eslint-disable-line
                    }
                })
                .catch(error => {
                    return reject(error);
                })
        });
    } catch (error) {
        console.error('loginRandomPin api error: ', error)
    }
}

export function login(email, password, isGuestAcc, env = dataStorage.env_config) {
    email = (email + '').trim()
    return new Promise((resolve, reject) => {
        getSecretKey(env)
            .then(() => {
                const uri = getUrlAuth(env);
                let provider = 'quantedge';
                if (!isGuestAcc) {
                    // todo check env
                    provider = 'paritech';
                }
                const data = {
                    data: {
                        'username': (email + '').toLocaleLowerCase(),
                        'password': dataStorage.session[env.env] ? CryptoJS.AES.encrypt(password, dataStorage.session[env.env].key).toString() : password,
                        'provider': provider,
                        'storage_token': !isGuestAcc
                    }
                };
                if (dataStorage.session[env.env]) data.data.session_id = dataStorage.session[env.env].id;
                logger.sendLog('start login: ' + email + ' data:' + JSON.stringify(data));
                return postData(uri, data)
                    .then(res => {
                        logger.sendLog('login success: ' + email);
                        resolve(res);
                    })
                    .catch(error => {
                        logger.sendLog('login failed: ' + email);
                        reject(error);
                    });
            })
            .catch(error => {
                logger.log(error)
            })
    });
}

export function loginNew(email, password, env = dataStorage.env_config) {
    return new Promise((resolve, reject) => {
        getSecretKey(env)
            .then(() => {
                const uri = getUrlAuth(env);
                const data = {
                    data: {
                        'username': (email + '').toLocaleLowerCase(),
                        'password': dataStorage.session[env.env] ? CryptoJS.AES.encrypt(password, dataStorage.session[env.env].key).toString() : password,
                        'provider': 'paritech', // todo check env
                        'storage_token': false
                    }
                };
                if (dataStorage.session[env.env]) data.data.session_id = dataStorage.session[env.env].id;
                logger.sendLog('start login new: ' + email + ' data:' + JSON.stringify(data));
                postData(uri, data)
                    .then(res => {
                        logger.sendLog('login new success: ' + email);
                        resolve(res);
                    })
                    .catch(error => {
                        logger.sendLog('login new failed: ' + email);
                        reject(error);
                    });
            })
            .catch(error => {
                logger.log(error)
            })
    });
}

export function postPin(token, pin, env = dataStorage.env_config) {
    return new Promise((resolve, reject) => {
        getSecretKey(env)
            .then(() => {
                const uri = getUrlPin(env);
                const data = {
                    data: {
                        pin: dataStorage.session[env.env] ? CryptoJS.AES.encrypt(pin, dataStorage.session[env.env].key).toString() : pin,
                        accessToken: token,
                        env: 'WEB_POST_PIN'
                    }
                };
                if (dataStorage.session[env.env]) data.data.session_id = dataStorage.session[env.env].id;
                logger.sendLog(`===> POST PIN email: ${dataStorage.loginEmail} PIN: ${pin}`);
                if (!pin) {
                    logger.sendLog('Nếu Thấy Thông báo này liên hệ Le Bui Thank you :): ' + dataStorage.loginEmail);
                }
                logger.log('DATA_PIN:', data)
                postData(uri, data)
                    .then(res => {
                        resolve(res);
                    })
                    .catch(error => {
                        reject(error);
                    });
            })
            .catch(error => {
                logger.log(error)
            })
    });
}

export async function postChangePin(token, pin, isForgot, env = dataStorage.env_config) {
    return new Promise((resolve, reject) => {
        getSecretKey(env)
            .then(() => {
                const uri = isForgot ? getUrlPin(env) : getUrlChangePin(env);
                const data = isForgot
                    ? {
                        data: {
                            pin: dataStorage.session[env.env] ? CryptoJS.AES.encrypt(pin, dataStorage.session[env.env].key).toString() : pin,
                            accessToken: token,
                            env: 'WEB_FORGOT_PIN'
                        }
                    }
                    : {
                        data: {
                            pin: dataStorage.session[env.env] ? CryptoJS.AES.encrypt(pin, dataStorage.session[env.env].key).toString() : pin,
                            refreshToken: token,
                            env: 'WEB_CHANGE_PIN'
                        }
                    }
                if (dataStorage.session[env.env]) data.data.session_id = dataStorage.session[env.env].id;
                logger.sendLog(`POST PIN email: ${dataStorage.loginEmail} PIN: ${pin} FORGOT: ${isForgot}`);
                return postData(uri, data)
                    .then(res => {
                        resolve(res);
                    }).catch(error => {
                        reject(error);
                    });
            })
            .catch(error => {
                logger.log(error)
            })
    });
}

export function postDecode(pin, token, env = dataStorage.env_config) {
    return new Promise((resolve, reject) => {
        getSecretKey(env)
            .then(() => {
                const uri = getUrlDecode(env);
                const data = {
                    data: {
                        token,
                        pin: dataStorage.session[env.env] ? CryptoJS.AES.encrypt(pin, dataStorage.session[env.env].key).toString() : pin
                    }
                };
                if (dataStorage.session[env.env]) data.data.session_id = dataStorage.session[env.env].id;
                logger.sendLog(`start post decode`);
                return postData(uri, data)
                    .then(res => {
                        logger.sendLog('post decode success data:' + JSON.stringify(data) + 'res: ' + JSON.stringify(res && res.data));
                        resolve(res);
                    })
                    .catch(error => {
                        logger.sendLog('post decode failed data:' + JSON.stringify(data));
                        reject(error);
                    });
            })
            .catch(error => {
                logger.log(error)
            })
    });
}

export async function postRefresh(token, env) {
    return new Promise((resolve, reject) => {
        const uri = getUrlRefresh(env);
        const sessionId = localStorageNew.getItem('session_id');
        const data = {
            data: {
                refreshToken: token,
                deviceID: sessionId
            }
        };
        return postData(uri, data)
            .then(res => {
                if (res.data && res.data.baseUrl) {
                    dataStorage.env_config.api.backendBase = 'https://' + res.data.baseUrl
                    // dataStorage.href = dataStorage.href.replace(/(\/\/)([^/]+)/, '$1' + res.data.baseUrl)
                }
                localStorageNew && localStorageNew.setItem('last_session_id', res.data.deviceID)
                logger.sendLog('post refresh success data:' + JSON.stringify(data) + 'res: ' + JSON.stringify(res && res.data));
                resolve(res);
            })
            .catch(error => {
                logger.sendLog('post refresh failed data:' + JSON.stringify(data));
                reject(error);
            });
    });
}
