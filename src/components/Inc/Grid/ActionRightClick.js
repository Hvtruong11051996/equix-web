import {
    getData,
    deleteData,
    getUpdateWatchlist,
    putData,
    getUserDetailUrl,
    getResetPasswordUrl,
    postData,
    getUrlAnAccount,
    makeSymbolUrl,
    getUrlAlert
} from '../../../helper/request';
import Flag from '../Flag/Flag';
import logger from '../../../helper/log';
import dataStorage from '../../../dataStorage';
import Icon from '../../Inc/Icon';
import ReactDOMServer from 'react-dom/server';
import SymbolClass from '../../../constants/symbol_class';
import { stringFormat, checkRole, isLogin, parseJSON } from '../../../helper/functionUtils';
import Confirm from '../../Inc/Confirm';
import Lang from '../../Inc/Lang';
import MapRoleComponent from '../../../constants/map_role_component';

let timeoutAlert

export async function getDataSymbol(dataSymbol, type = 'all types') {
    let className = '';
    switch (type) {
        case SymbolClass.ALL_TYPES: className = 'equity,future,etf,mf,warrant'; break;
        default: className = type; break;
    }
    let dataAfterCall = []
    const url = makeSymbolUrl(encodeURIComponent(dataSymbol.symbol));
    await getData(url)
        .then((response) => {
            dataAfterCall = response.data
        })
    if (dataAfterCall.length === 0) {
        return dataSymbol
    }
    return dataAfterCall[0]
}
export async function getDataAnAccount(accountId) {
    const url = getUrlAnAccount(accountId);
    let infor = {}
    await getData(url).then(response => {
        if (response.data && response.data.length && response.data[0].account_id) {
            infor = response.data
            dataStorage.accountsObjDic[infor.account_id] = infor
        }
    }).catch(error => {
        that.cb({ account: dataStorage.accountInfo }, 'doNotSave');
    })
    return infor
}
export function removeSymbolRow(data) {
    Confirm({
        checkWindowLoggedOut: true,
        header: 'lang_confirm_cancel_alert',
        message: 'lang_ask_confirm_delete_alert',
        callback: () => {
            createRequestDelete(data)
        },
        cancelCallback: () => { }
    })
}
export function objOverSystem(inforSymbol) {
    const checkOverSystem = checkSymbolOverSystem(inforSymbol)
    if (checkOverSystem) {
        inforSymbol.exchanges = inforSymbol.exchange
        inforSymbol.display_name = inforSymbol.symbol
        inforSymbol.isOverSystem = true
    }
    return inforSymbol
}

export function createRequestDelete(data) {
    const url = getUrlAlert('/' + data.alert_id)
    deleteData(url).then(res => {
        console.log('delete success')
    }).catch(e => {
        console.log('error: ', e)
    })
}
export function showConfirm(userLoginId) {
    Confirm({
        checkWindowLoggedOut: true,
        header: 'lang_confirm',
        message: <div><span className='text-overflow notWhiteSpace'><Lang>lang_confirm_reset_password</Lang> {userLoginId}?</span></div>,
        callback: () => {
            const url = getResetPasswordUrl();
            postData(url, { data: { user_login_id: userLoginId, type: 'forgot_password' } }).then(res => {
            }).catch(error => {
                logger.log('error reset password: ', error)
            })
        },
        cancelCallback: () => {
            logger.log('cancel reset password')
        }
    })
}
export function showConfirmForce(userId, userLoginId, changePassword) {
    const t = dataStorage.translate
    let keyMess = t('confirm_force_password')
    let data = {}
    data.change_password = changePassword ? 0 : 1
    if (!data.change_password) keyMess = t('confirm_force_password_cancel')
    const mess = stringFormat(keyMess, {
        userLoginId: userLoginId
    })
    Confirm({
        checkWindowLoggedOut: true,
        header: 'lanbg_confirm',
        message: <span className='text-overflow notWhiteSpace'>{mess}</span>,
        notTranslate: true,
        callback: () => {
            const url = getUserDetailUrl(`user-details/${userId}`);
            putData(url, { data })
                .then(res => {
                })
                .catch(error => {
                    logger.log(' errpr force password', error)
                })
        },
        cancelCallback: () => {
            logger.log('cancel force password')
        }
    })
}
export function checkSymBolExist(symbolOfData, symbolOfClick) {
    if (symbolOfData.length > 0) {
        for (let i = 0; i < symbolOfData.length; i++) {
            if (symbolOfData[i] && symbolOfData[i].symbol && (symbolOfData[i].symbol === symbolOfClick)) {
                return true
            }
        }
        return false
    }
    return false
}
export function checkSymbolOverSystem(objSymbol) {
    if (objSymbol.display_name === undefined || objSymbol.display_name === '') {
        return true
    }
    if (objSymbol.origination === 201) {
        return true
    }
    return false
}
export function postDataSymBolWatchlist(obj, action) {
    putData(getUpdateWatchlist(obj.watchlist, obj.user_id, action), {
        data: obj
    }).then(() => {
        console.log('ADD ok')
    }).catch(error => {
    });
}
export function removeOneSymbol(inforSymbol, action = 'remove') {
    let idWatchlist = dataStorage.usingWatchlist
    let nameWatchlist = dataStorage.usingWatchlist_name
    let obj = {
        user_id: dataStorage.userInfo.user_id,
        watchlist: idWatchlist,
        watchlist_name: nameWatchlist,
        value: [{
            symbol: inforSymbol.data.symbol,
            rank: new Date().getTime()
        }]
    }
    postDataSymBolWatchlist(obj, action)
}
export function getMenuWatchlist(params) {
    if (!dataStorage.userInfo) return
    let watchlist = dataStorage.watchlist || {}
    let subWatchlist = []
    if (watchlist !== {}) {
        watchlist.map((item, index) => {
            let oneItem = {
                name: item.watchlist_name,
                action: (data) => {
                    let symbolOfData = item.value
                    let symbolOfClick = params.node.data.symbol || ''
                    let idWatchlist = item.watchlist
                    let symbol = params.node.data.symbol || ''
                    let nameWatchlist = item.watchlist_name
                    let obj = {
                        user_id: dataStorage.userInfo.user_id,
                        watchlist: idWatchlist,
                        watchlist_name: nameWatchlist,
                        value: [{
                            symbol: symbol,
                            rank: new Date().getTime()
                        }]
                    }
                    let exist = checkSymBolExist(symbolOfData || [], symbolOfClick)
                    if (exist) {
                        postDataSymBolWatchlist(obj, 'remove')
                    } else {
                        postDataSymBolWatchlist(obj, 'add')
                    }
                },
                cssClasses: ['subOption'],
                icon: ((flag) => {
                    let symbolOfData = item.value
                    let symbolOfClick = params.node.data.symbol
                    let exist = checkSymBolExist(symbolOfData || [], symbolOfClick)
                    if (exist) {
                        return ReactDOMServer.renderToString(<Icon src="navigation/check" className='active' style={{ fill: 'var(--ascend-default) !important' }} />)
                    }
                    return ReactDOMServer.renderToString(<Icon src="content/add" />)
                })()
            }
            subWatchlist.push(oneItem)
        })
        return subWatchlist
    }
    return []
}
export function checkSymBolCancleFilled(data = {}) {
    let getDataState = (data.order_state && data.order_state.toUpperCase()) || ''
    if ((getDataState === 'EXPIRED') || (getDataState === 'PENDING_CANCEL') || getDataState.includes('CANCELED') || ((getDataState !== 'PARTIALLY_FILLED') && getDataState.includes('FILLED')) || getDataState.includes('REJECTED')) {
        return true
    }
    return false
}

export function checkSymBolModifyOrder(data = {}) {
    let listState = parseJSON(data.passed_state)
    let trigger = (Array.isArray(listState) && (listState.indexOf('TRIGGER') > -1 || listState.indexOf('TRIGGERED') > -1 || listState.indexOf('Triggered') > -1)) || data.order_state === 'TRIGGERED'
    let getDataState = data.order_state || ''
    if ((getDataState === 'PENDING_REPLACE') || (trigger)) {
        return true
    }
    return false
}
export function createRequestUpdate(data, value) {
    if (!checkRole(MapRoleComponent.EDIT_BUTTON_ALERT)) return
    if (timeoutAlert) clearTimeout(timeoutAlert);
    timeoutAlert = setTimeout(() => {
        const status = value ? 1 : 0
        const url = getUrlAlert('?user_id=' + dataStorage.userInfo.user_id + '&alert_id=' + data.alert_id)
        putData(url, { data: { status: status } }).then(res => {
            console.log('success')
        }).catch(e => {
            console.log('error: ', e)
        })
    }, 500);
}
export function actionOpenChart(inforSymbol) {
    dataStorage.goldenLayout.addComponentToStack('ChartTV', {
        needConfirm: false,
        data: {
            symbolObj: inforSymbol
        },
        color: 5
    })
}
export function openSecurityDetail(inforSymbol) {
    dataStorage.goldenLayout.addComponentToStack('SecurityDetail', {
        needConfirm: false,
        data: { symbolObj: inforSymbol },
        color: 5
    })
}
export function openMorningstar(inforSymbol) {
    dataStorage.goldenLayout.addComponentToStack('MorningStar', {
        needConfirm: false,
        data: { symbolObj: inforSymbol },
        color: 5
    })
}
export function openTiprank(inforSymbol) {
    dataStorage.goldenLayout.addComponentToStack('TipRank', {
        needConfirm: false,
        data: { symbolObj: inforSymbol },
        color: 5
    })
}
export function createNewAlert(inforSymbol) {
    dataStorage.goldenLayout.addComponentToStack('NewAlert',
        {
            data: {
                symbolObj: inforSymbol
            },
            color: 5
        })
}
export function addComponent(nameWidget, data) {
    dataStorage.goldenLayout.addComponentToStack(nameWidget, data)
}
