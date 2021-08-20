import React from 'react'
import './style.css'
import Lang from '../Inc/Lang'
import Enum from './constants'
import sideEnum from '../../constants/enum'
import {
    formatNumberPrice,
    formatNumberValue,
    checkRole, setFontSize, setTheme, stringFormat, setLanguage
} from '../../helper/functionUtils'
import MapRoleComponent from '../../constants/map_role_component'
import Confirm from '../Inc/Confirm'
import showModal from '../Inc/Modal'
import dataStorage from '../../dataStorage'
import orderEnum from '../../constants/order_enum'
import Auth from '../AuthV2';
import ConfirmLogout from '../ConfirmLogout'
import Icon from '../Inc/Icon'
import {
    postData,
    getData,
    putData,
    requirePin,
    getUrlOrderDetailByTag,
    getUserDetailUrl,
    getUpdateWatchlist
} from '../../helper/request'
import {
    getDataAnAccount
} from '../Inc/Grid/ActionRightClick'
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon'
import { FORM } from '../Inc/CanvasGrid/Constant/gridConstant';

const { STATUS_VALUE, FONT_SIZE } = Enum

const listNotAllowModifyCancel = [STATUS_VALUE.PENDING_CANCEL, STATUS_VALUE.APPROVE_TO_CANCEL, STATUS_VALUE.FILLED, STATUS_VALUE.CANCELLED, STATUS_VALUE.REJECTED, STATUS_VALUE.EXPIRED, STATUS_VALUE.PURGED]
const listNotAllowModify = [STATUS_VALUE.TRIGGER, STATUS_VALUE.PENDING_REPLACE]

const ACTIONS = {
    MORE: 0,
    USER_DETAIL: 1,
    RESET_PASSWORD: 2,
    ACTIVITIES: 3,
    FORCE_TO_CHANGE_PASSWORD: 4,
    ORDERS: 5,
    PORTFOLIO_HOLDING: 6,
    PORTFOLIO_SUMMARY: 7,
    ACCOUNT_INFO: 8,
    NEW_ORDER: 9,
    CLOSE_POSITION: 10,
    CLOSE_POSITION_CONTINGENT: 11,
    MODIFY_ORDER: 12,
    CANCEL_ORDER: 13,
    ORDER_DETAIL: 14,
    CHART: 15,
    BUY: 16,
    SELL: 17,
    DEPTH: 18,
    SECURITY_DETAIL: 19,
    MORNING_STAR: 20,
    TIP_RANK: 21,
    CREATE_NEW_ALERT: 22,
    ADD_TO_WATCHLIST: 23,
    REMOVE_FROM_THIS_WATCHLIST: 24,
    LIMIT_ORDER_AT: 26,
    MODIFY_ALERT: 27,
    DELETE_ALERT: 28,
    INACTIVE_ALERT: 29,
    ACTIVE_ALERT: 30,
    BUY_WITH_CONTINGENT_ORDER: 31,
    SELL_WITH_CONTINGENT_ORDER: 32,
    MODIFY_WITH_CONTINGENT_ORDER: 33,
    CANCEL_WITH_CONTINGENT_ORDER: 34
}

const RIGHT_CLICK_1 = [
    ACTIONS.NEW_ORDER,
    ACTIONS.CLOSE_POSITION,
    ACTIONS.BUY,
    ACTIONS.SELL,
    ACTIONS.MODIFY_ORDER,
    ACTIONS.CANCEL_ORDER,
    ACTIONS.ORDER_DETAIL,
    ACTIONS.LIMIT_ORDER_AT
]

const RIGHT_CLICK_2 = [
    ACTIONS.BUY_WITH_CONTINGENT_ORDER,
    ACTIONS.SELL_WITH_CONTINGENT_ORDER,
    ACTIONS.MODIFY_WITH_CONTINGENT_ORDER,
    ACTIONS.CANCEL_WITH_CONTINGENT_ORDER
]

const RIGHT_CLICK_4 = [
    ACTIONS.MORE,
    ACTIONS.CREATE_NEW_ALERT,
    ACTIONS.ADD_TO_WATCHLIST,
    ACTIONS.REMOVE_FROM_THIS_WATCHLIST,
    ACTIONS.CREATE_NEW_ALERT,
    ACTIONS.MODIFY_ALERT,
    ACTIONS.ACTIVE_ALERT,
    ACTIONS.INACTIVE_ALERT
]

const SIDE = {
    BUY: 'BUY',
    SELL: 'SELL'
}

function addComponent(widgetName, data) {
    dataStorage.goldenLayout.addComponentToStack(widgetName, { ...data, ...{ color: 5 } })
}

export default class ContextMenu extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isShow: false,
            style: props.style || {},
            data: {}
        }
        this.actions = []
        this.subMenu = {}
        this.items = {}
        this.listDataWatchlist = [...dataStorage.watchlist]
        this.moreActions = [
            {
                text: 'lang_copy',
                shortcut: 'lang_copy_shortcut',
                onClick: this.onCopy,
                icon: <SvgIcon path={path.mdiContentCopy} />
            },
            {
                text: 'lang_copy_with_headers',
                textClass: 'text-normal',
                onClick: this.onCopyWithHeader,
                icon: <SvgIcon path={path.mdiContentCopy} />
            },
            {
                text: 'lang_export_csv',
                onClick: this.onExportCSV,
                icon: <SvgIcon path={path.csv} />,
                className: 'subOption'
            }
        ]
        this.sizeActions = [
            {
                text: 'lang_small',
                value: 'small',
                onClick: this.changeFontSize
            },
            {
                text: 'lang_medium',
                value: 'medium',
                checkActive: this.checkActive,
                onClick: this.changeFontSize
            },
            {
                text: 'lang_large',
                value: 'large',
                onClick: this.changeFontSize
            }
        ]
        this.langActions = [
            {
                text: 'lang_english',
                value: 'en',
                onClick: this.changeLanguage
            },
            {
                text: 'lang_chinese',
                value: 'cn',
                onClick: this.changeLanguage
            },
            {
                text: 'lang_vietnamese',
                value: 'vi',
                onClick: this.changeLanguage
            }
        ]
        this.themeActions = [
            {
                text: 'lang_dark_theme',
                value: 'theme-dark',
                onClick: this.changeTheme
            },
            {
                text: 'lang_light_theme',
                value: 'theme-light',
                onClick: this.changeTheme
            }
        ]
        this.systemActions = [
            {
                text: 'lang_text_size',
                subActions: this.sizeActions,
                icon: <SvgIcon path={path.mdiChevronRight} />
            },
            {
                text: 'lang_theme_colour',
                subActions: this.themeActions,
                icon: <SvgIcon path={path.mdiChevronRight} />
            },
            {
                text: 'lang_language',
                subActions: this.langActions,
                icon: <SvgIcon path={path.mdiChevronRight} />
            },
            {
                text: 'lang_settings',
                onClick: this.onSetting,
                role: this.getRoleSetting
            },
            {
                text: this.getTextSign,
                onClick: this.sign
            }
        ]
        this.onHover = this.onHover.bind(this)
        this.onMouseOver = this.onMouseOver.bind(this)
        this.remove = this.remove.bind(this)
        this.showContextMenu = this.showContextMenu.bind(this)
        this.hideContextMenu = this.hideContextMenu.bind(this)
        this.initActions()
        dataStorage.showContextMenu = this.showContextMenu
        dataStorage.hideContextMenu = this.hideContextMenu
    }

    getTextSign = () => {
        return dataStorage.userInfo ? 'lang_sign_out' : 'lang_sign_in'
    }

    getRoleSetting = () => {
        return dataStorage.userInfo ? MapRoleComponent.SETTING : MapRoleComponent.DISABLE
    }

    hideContextMenu() {
        this.setState({ isShow: false })
    }

    getSubActions = () => {
        this.subActions = this.actions.reduce((acc, cur, index) => {
            if (cur.subActions) acc.push({ index, actions: cur.subActions })
            return acc
        }, [])
    }

    isShowModal = () => {
        const modal = document.getElementById('modal');
        return modal && modal.childElementCount
    }

    showContextMenu({ id, mouse, data, fn = {} }) {
        if (this.isShowModal()) return
        this.listDataWatchlist = [...dataStorage.watchlist]
        this.onExportFn = fn.onExport
        this.onCopyFn = fn.onCopy
        this.onCopyWithHeaderFn = fn.onCopyWithHeader
        this.showConfirm = fn.showConfirm
        this.getActions(id, data)
        this.getSubActions()
        const style = this.getStyle(mouse)
        this.setState({ isShow: true, style, data })
    }

    getMaxWidthAction = () => {
        let max = ''
        for (let index = 0; index < this.actions.length; index++) {
            const text = (this.actions[index] && this.actions[index].text && dataStorage.translate(this.actions[index].text)) || ''
            if (text.length > max) max = text
        }
        const gc = document.createElement('canvas').getContext('2d')
        gc.font = FONT_SIZE[(dataStorage.fontSize + '').toUpperCase()]
        return gc.measureText(max).width + 32
    }

    getStyle = (mouse) => {
        const height = this.actions.length * 32
        let top = mouse.y + 5;
        let left = mouse.x + 5;
        const maxWidth = this.getMaxWidthAction()
        const width = maxWidth > 266 ? maxWidth : 266
        if (window.innerHeight - top < height + 32) top = window.innerHeight - height - 32
        if (window.innerWidth - left < width) left = window.innerWidth - width
        return { top, left, minWidth: width }
    }

    onUserDetail = (data) => {
        addComponent('CreateUser', { user_id: data.user_id })
    }

    changeFontSize = (size) => {
        setFontSize(size)
        dataStorage.mainMenuCallBack && dataStorage.mainMenuCallBack()
    }

    changeLanguage = (lang) => {
        setLanguage(lang)
    }

    changeTheme = (theme) => {
        setTheme(theme)
        dataStorage.mainMenuCallBack && dataStorage.mainMenuCallBack()
    }

    sign = () => {
        dataStorage.userInfo ? this.signOut() : this.signIn()
    }

    signOut = () => {
        showModal({
            component: ConfirmLogout
        })
    }

    signIn = () => {
        showModal({
            component: Auth
        })
    }

    onSetting = () => {
        requirePin(() => addComponent('Settings'))
    }

    onChart = (data) => {
        addComponent('ChartTV', { data: { symbolObj: this.symbolInfo } })
    }

    onResetPassword = (data) => {
        const userLoginId = data.user_login_id
        this.showConfirm && this.showConfirm(userLoginId)
    }

    onActivities = (data) => {
        addComponent('Activities', {
            user_id: data.user_id,
            user_login_id: data.user_login_id
        })
    }

    onForceChangePassword = (data) => {
        const userId = data.user_id
        const userLoginId = data.user_login_id
        const changePassword = data.change_password
        const t = dataStorage.translate
        let keyMess = t('lang_confirm_force_password')
        const putdata = {}
        putdata.change_password = changePassword ? 0 : 1
        if (!data.change_password) keyMess = t('lang_confirm_force_password_cancel')
        const mess = stringFormat(keyMess, {
            userLoginId: userLoginId
        })
        Confirm({
            checkWindowLoggedOut: true,
            header: 'lang_confirm',
            message: <span className='text-overflow notWhiteSpace'>{mess}</span>,
            notTranslate: true,
            callback: () => {
                const url = getUserDetailUrl(`user-details/${userId}`)
                putData(url, { data: putdata })
                    .then(res => {
                    })
                    .catch(error => {
                        console.error(' errpr force password', error)
                    })
            },
            cancelCallback: () => {
                console.log('cancel force password')
            }
        })
    }

    onOrders = async (data) => {
        if (!data.account_id) return
        let infor = [dataStorage.accountsObjDic[data.account_id]]
        if (!infor || !infor[0]) infor = await getDataAnAccount(data.account_id)
        if (Object.keys(infor).length === 0) {
            infor[0] = {}
        }
        infor[0].isRightClick = true
        addComponent('OrderList', {
            needConfirm: false,
            account: infor[0]
        })
    }

    onPortfolioHolding = (data) => {
        addComponent('Portfolio', { accountObj: data })
    }

    onPortfolioSummary = (data) => {
        addComponent('PortfolioSummary', { accountObj: data })
    }

    onAccountInfo = async (data) => {
        if (dataStorage.env_config.roles.openingAccount) {
            if (typeof data.trade_confirmations === 'string') data.trade_confirmations = JSON.parse(data.trade_confirmations)
            if (typeof data.tradeable_products === 'string') data.tradeable_products = JSON.parse(data.tradeable_products)
            if (typeof data.applicant_details === 'string') data.applicant_details = JSON.parse(data.applicant_details)
            addComponent('AccountDetailNew', {
                needConfirm: false,
                account: data
            })
        } else {
            if (!data.account_id) return
            let infor = [dataStorage.accountsObjDic[data.account_id]]
            if (!infor || !infor[0]) infor = await getDataAnAccount(data.account_id)
            const component = dataStorage.env_config.roles.openingAccount ? 'AccountDetailNew' : dataStorage.env_config.roles.viewAccountDetail ? 'AccountDetail' : 'AccountInfo'
            addComponent(component, {
                needConfirm: false,
                accountObj: infor[0]
            })
        }
    }

    onNewOrder = (data) => {
        requirePin(() => addComponent('Order', {
            stateOrder: 'NewOrder',
            data: {
                symbol: data.symbol,
                account_id: data.account_id,
                side: SIDE.BUY
            }
        }))
    }

    onClosePosition = (data) => {
        requirePin(() => {
            const volume = data.volume
            const side = volume > 0 ? SIDE.SELL : SIDE.BUY
            addComponent('Order', {
                stateOrder: 'NewOrder',
                currency: data.currency,
                data: {
                    symbol: data.symbol,
                    symbolObj: this.symbolInfo,
                    account_id: data.account_id,
                    side,
                    volume,
                    isClose: true
                }
            })
        })
    }

    onClosePositionWithContingentOrder = (data) => {
        requirePin(() => {
            const volume = data.volume
            const side = volume > 0 ? SIDE.SELL : SIDE.BUY
            addComponent('Order', {
                stateOrder: 'NewOrder',
                contingentOrder: true,
                currency: data.currency,
                data: {
                    symbol: data.symbol,
                    symbolObj: this.symbolInfo,
                    account_id: data.account_id,
                    side,
                    volume,
                    isClose: true
                }
            })
        })
    }

    onModifyOrder = (data) => {
        const side = data.side === 'Buy' ? SIDE.BUYS : (data.is_buy ? SIDE.BUYS : SIDE.SELL)
        let dataObj = { ...data }
        dataObj.symbolObj = data
        addComponent('Order', {
            stateOrder: 'ModifyOrder',
            contingentOrder: false,
            data: { data: dataObj, side },
            needConfirm: false,
            currency: data.currency || 'needGetAccount'
        })
    }

    onCancelOrder = (data) => {
        if (!data || !data.broker_order_id) return
        const url = getUrlOrderDetailByTag(data.broker_order_id)
        getData(url).then(response => {
            const listHistory = (response.data || []).sort((a, b) => b.order_detail_id - a.order_detail_id)
            const orderStatus = listHistory[0] && listHistory[0].order_status ? listHistory[0].order_status : data.order_status
            data.order_status = orderStatus
            addComponent('Order', {
                stateOrder: 'DetailOrder',
                contingentOrder: false,
                data: { data },
                needConfirm: true,
                dataConfirm: { typeConfirm: orderEnum.CANCEL_ORDER, dataAccount: data },
                currency: data.currency || 'needGetAccount'
            })
        })
    }

    onDetailOrder = (data) => {
        addComponent('Order', {
            needConfirm: false,
            stateOrder: 'DetailOrder',
            data,
            currency: data.currency || 'needGetAccount'
        })
    }

    onSecurityDetail = (data) => {
        addComponent('SecurityDetail', { data: { symbolObj: this.symbolInfo } })
    }

    onMorningStar = (data) => {
        addComponent('MorningStar', { data: { symbolObj: this.symbolInfo } })
    }

    onTipRank = (data) => {
        addComponent('TipRank', { data: { symbolObj: this.symbolInfo } })
    }

    createNewAlert = (data) => {
        addComponent('NewAlert', { data: { symbolObj: this.symbolInfo } })
    }

    removeFromWatchlist = (item) => {
        let obj = {
            user_id: dataStorage.userInfo.user_id,
            watchlist: item.watchlist,
            watchlist_name: item.watchlist_name,
            value: [{
                symbol: this.state.data.symbol,
                rank: +new Date()
            }]
        }
        putData(getUpdateWatchlist(obj.watchlist, obj.user_id, 'remove'), {
            data: obj
        }).then(() => {
        }).catch(error => console.error('removeFromWatchlist ContextMenu error: ', error))
    }

    addToWatchlist = (item) => {
        let obj = {
            user_id: dataStorage.userInfo.user_id,
            watchlist: item.watchlist,
            watchlist_name: item.watchlist_name,
            value: [{
                symbol: this.state.data.symbol,
                rank: +new Date()
            }]
        }
        putData(getUpdateWatchlist(obj.watchlist, obj.user_id, 'add'), {
            data: obj
        }).then(() => {
        }).catch(error => console.error('addToWatchlist ContextMenu error: ', error))
    }

    getYourWatchlist = (data) => {
        return this.listDataWatchlist.reduce((acc, cur) => {
            const isExisted = (cur.value || []).findIndex(e => e.symbol === data.symbol) !== -1
            acc.push({
                text: cur.watchlist_name || '',
                value: cur,
                isWatchlistSub: true,
                onClick: (data, event) => this.actionWatchlistSub(data, event),
                icon: <div className={`icon ${isExisted ? 'active' : 'inactive'}`} style={{ display: 'flex', alignItems: 'center' }}><SvgIcon style={{ height: 24, width: 24 }} path={path.mdiCheck} fill='var(--ascend-default)' /><SvgIcon style={{ height: 24, width: 24 }} path={path.mdiPlus} /></div>
            })
            return acc
        }, [])
    }

    checkAccount = () => {
        const account = dataStorage.accountInfo
        if (!account || !account.status || account.status === 'inactive') return false
        return true
    }

    actionWatchlistSub = (data, event) => {
        let parentTarget = event.target.closest('.ag-menu-option.watchlistSub')
        let iconTarget = parentTarget.querySelector('.icon')
        let watchlist = this.listDataWatchlist.find(x => x.watchlist === data.watchlist)
        const isExisted = (watchlist.value || []).findIndex(x => x.symbol === this.state.data.symbol) !== -1
        if (isExisted) {
            if (iconTarget) iconTarget.classList.replace('active', 'inactive')
            watchlist.value = watchlist.value.filter(x => x.symbol !== this.state.data.symbol)
            this.removeFromWatchlist(data)
        } else {
            if (iconTarget) iconTarget.classList.replace('inactive', 'active')
            if (Array.isArray(watchlist.value)) {
                watchlist.value.push(this.state.data.symbol)
            } else watchlist.value = [this.state.data.symbol]
            this.addToWatchlist(data)
        }
    }

    onLimitOrderAt = (data) => {
        if (data && data.hasOwnProperty('side')) {
            if (data.side === 'Bid') {
                requirePin(() => addComponent('Order', {
                    stateOrder: 'NewOrder',
                    data: {
                        symbol: data.symbol,
                        symbolObj: this.symbolInfo,
                        side: SIDE.BUY
                    },
                    orderTypeSelection: 'Limit',
                    limitPrice: data.price
                }))
            } else if (data.side === 'Ask') {
                requirePin(() => addComponent('Order', {
                    stateOrder: 'NewOrder',
                    data: {
                        symbol: data.symbol,
                        symbolObj: this.symbolInfo,
                        side: SIDE.SELL
                    },
                    orderTypeSelection: 'Limit',
                    limitPrice: data.price
                }))
            }
        }
    }

    onSellWithContigentOrder = (data) => {
        requirePin(() => addComponent('Order', {
            stateOrder: 'NewOrder',
            contingentOrder: true,
            data: {
                symbol: data.symbol,
                symbolObj: this.symbolInfo,
                side: SIDE.SELL
            },
            orderTypeSelection: 'Limit',
            limitPrice: data.price
        }))
    }

    getTitle = (index, data = {}) => {
        switch (index) {
            case ACTIONS.LIMIT_ORDER_AT:
                if (data.side && data.side === 'Bid') return `Buy Limit Order at ${formatNumberPrice(data.price, true)}`
                else return `Sell Limit Order at ${formatNumberPrice(data.price, true)}`
            case ACTIONS.SELL_WITH_CONTINGENT_ORDER: return `Sell with Contingent Order at ${formatNumberPrice(data.price, true)}`
            default: return ''
        }
    }

    getRole = (index, data = {}) => {
        switch (index) {
            case ACTIONS.CHART:
                return dataStorage.userInfo ? MapRoleComponent.ChartTV : MapRoleComponent.DISABLE
            case ACTIONS.LIMIT_ORDER_AT:
                return this.checkAccount() && dataStorage.userInfo ? MapRoleComponent.NEW_ORDER : MapRoleComponent.DISABLE
            case ACTIONS.SELL_WITH_CONTINGENT_ORDER:
                return dataStorage.env_config.roles.contingentOrder && data.side && data.side === 'Ask' && this.checkAccount() && dataStorage.userInfo.addon.includes('A3') ? MapRoleComponent.CONTINGENT_ORDER_PAD : MapRoleComponent.DISABLE
            case ACTIONS.MORNING_STAR:
                return dataStorage.env_config.roles.viewMorningStar && dataStorage.userInfo && dataStorage.userInfo.addon && dataStorage.userInfo.addon.includes('A1') ? MapRoleComponent.ENABLE : MapRoleComponent.DISABLE
            case ACTIONS.TIP_RANK:
                return dataStorage.env_config.roles.viewTipRank && dataStorage.userInfo && dataStorage.userInfo.addon && dataStorage.userInfo.addon.includes('A0') ? MapRoleComponent.ENABLE : MapRoleComponent.DISABLE
            case ACTIONS.RESET_PASSWORD:
                return dataStorage.userInfo && [{ ACTIVE: 2 }.ACTIVE, { PENDING_EMAIL_VERIFICATION: 1 }.PENDING_EMAIL_VERIFICATION].includes(data.status) ? MapRoleComponent.ENABLE : MapRoleComponent.DISABLE
            default: return dataStorage.userInfo ? MapRoleComponent.ENABLE : MapRoleComponent.DISABLE
        }
    }

    onDepth = (data) => {
        addComponent('MarketDepth', { data: { symbolObj: this.symbolInfo } })
    }
    onBuy = () => {
        requirePin(() => dataStorage.goldenLayout.addComponentToStack('Order', {
            stateOrder: 'NewOrder',
            data: {
                // symbolObj: this.symbolInfo,
                side: sideEnum.BUYSIDE
            }
        }))
    }
    onSell = () => {
        requirePin(() => dataStorage.goldenLayout.addComponentToStack('Order', {
            stateOrder: 'NewOrder',
            data: {
                // symbolObj: this.symbolInfo,
                side: sideEnum.SELLSIDE
            }
        }))
    }

    isCancelledOrFilled = (data = {}) => {
        let getDataState = (data.order_state && data.order_state.toUpperCase()) || ''
        if ((getDataState === 'EXPIRED') || (getDataState === 'PENDING_CANCEL') || getDataState.includes('CANCELED') || ((getDataState !== 'PARTIALLY_FILLED') && getDataState.includes('FILLED')) || getDataState.includes('REJECTED')) {
            return true
        }
        return false
    }

    initActions = () => {
        this.dicAction = {
            [ACTIONS.BUY]: {
                text: 'lang_buy',
                onClick: this.onBuy,
                role: MapRoleComponent.NEW_ORDER
            },
            [ACTIONS.SELL]: {
                text: 'lang_sell',
                onClick: this.onSell,
                role: MapRoleComponent.NEW_ORDER
            },
            [ACTIONS.DEPTH]: {
                text: 'lang_depth',
                onClick: this.onDepth,
                role: MapRoleComponent.MarketDepth
            },
            [ACTIONS.CHART]: {
                text: 'lang_chart',
                onClick: this.onChart
            },
            [ACTIONS.LIMIT_ORDER_AT]: {
                onClick: this.onLimitOrderAt
            },
            [ACTIONS.SELL_WITH_CONTINGENT_ORDER]: {
                onClick: this.onSellWithContigentOrder
            },
            [ACTIONS.SECURITY_DETAIL]: {
                text: 'lang_security_detail',
                onClick: this.onSecurityDetail,
                role: MapRoleComponent.SecurityDetail
            },
            [ACTIONS.MORNING_STAR]: {
                text: 'lang_morning_star',
                onClick: this.onMorningStar
            },
            [ACTIONS.TIP_RANK]: {
                text: 'lang_tip_rank',
                onClick: this.onTipRank
            },
            [ACTIONS.CREATE_NEW_ALERT]: {
                text: 'lang_create_new_alert',
                onClick: this.createNewAlert,
                role: MapRoleComponent.NewAlert
            },
            [ACTIONS.ADD_TO_WATCHLIST]: {
                text: 'lang_add_to_watchlist',
                textClass: 'text-normal',
                subActions: this.getYourWatchlist,
                isAnd: true,
                role: [MapRoleComponent.WatchlistBottom, MapRoleComponent.CREATE_REMOVE_ADD_WATCHLIST],
                icon: <SvgIcon path={path.mdiChevronRight} />
            },
            [ACTIONS.MORE]: {
                text: 'lang_more_three_dot',
                textClass: 'text-normal',
                role: MapRoleComponent.ENABLE,
                subActions: this.moreActions,
                icon: <SvgIcon path={path.mdiChevronRight} />
            },
            [ACTIONS.USER_DETAIL]: {
                text: 'lang_user_detail',
                onClick: this.onUserDetail,
                role: MapRoleComponent.USER_DETAIL_USERMAN
            },
            [ACTIONS.RESET_PASSWORD]: {
                text: 'lang_reset_password',
                onClick: this.onResetPassword,
                role: MapRoleComponent.RESET_PASSSWORD_USERMAN
            },
            [ACTIONS.ACTIVITIES]: {
                text: 'lang_activities',
                onClick: this.onActivities,
                isAnd: true,
                role: [MapRoleComponent.ACTIVITIES_USERMAN, MapRoleComponent.Activities]
            },
            [ACTIONS.FORCE_TO_CHANGE_PASSWORD]: {
                text: 'lang_force_to_change_password',
                textClass: 'text-normal',
                onClick: this.onForceChangePassword,
                role: MapRoleComponent.FORCE_TO_CHANGE_PASSWORD_USERMAN
            },
            [ACTIONS.ORDERS]: {
                text: 'lang_orders',
                onClick: this.onOrders,
                role: MapRoleComponent.OrderList
            },
            [ACTIONS.PORTFOLIO_HOLDING]: {
                text: 'lang_portfolio_holding',
                onClick: this.onPortfolioHolding,
                role: MapRoleComponent.Portfolio
            },
            [ACTIONS.PORTFOLIO_SUMMARY]: {
                text: 'lang_portfolio_summary',
                onClick: this.onPortfolioSummary,
                role: [MapRoleComponent.PORTFOLIO_SUMMARY_EQUITIES_AND_DERIVATIVES, MapRoleComponent.PORTFOLIO_SUMMARY_DERIVATIVES_ONLY, MapRoleComponent.PORTFOLIO_SUMMARY_EQUITIES_ONLY],
                isAnd: false
            },
            [ACTIONS.ACCOUNT_INFO]: {
                text: 'lang_account_detail',
                onClick: this.onAccountInfo,
                role: MapRoleComponent.AccountInfo
            },
            [ACTIONS.NEW_ORDER]: {
                text: 'lang_new_order',
                onClick: this.onNewOrder,
                role: MapRoleComponent.NEW_ORDER
            },
            [ACTIONS.CLOSE_POSITION]: {
                text: 'lang_close_position',
                onClick: this.onClosePosition,
                role: MapRoleComponent.NEW_ORDER
            },
            [ACTIONS.CLOSE_POSITION_CONTINGENT]: {
                text: 'lang_close_position_contingent',
                textClass: 'text-normal',
                onClick: this.onClosePositionWithContingentOrder,
                role: [MapRoleComponent.NEW_ORDER, MapRoleComponent.CONTINGENT_ORDER_PAD]
            },
            [ACTIONS.MODIFY_ORDER]: {
                text: 'lang_modify_order',
                onClick: this.onModifyOrder,
                role: MapRoleComponent.MODIFY_BUTTON_ALL_ORDERS
            },
            [ACTIONS.CANCEL_ORDER]: {
                text: 'lang_cancel_order',
                onClick: this.onCancelOrder,
                role: MapRoleComponent.CANCEL_BUTTON_ALL_ORDERS
            },
            [ACTIONS.ORDER_DETAIL]: {
                text: 'lang_order_detail',
                onClick: this.onDetailOrder
            },
            [ACTIONS.REMOVE_FROM_THIS_WATCHLIST]: {
                text: 'lang_remove_from_this_watchlist',
                onClick: this.removeFromWatchlist,
                role: MapRoleComponent.CREATE_REMOVE_ADD_WATCHLIST
            }
        }
    }

    checkSymbolOverSystem = (data) => {
        const ORIGINATION = { IRESS_WS: 201 }
        if (data.display_name === undefined || data.display_name === '' || data.origination === ORIGINATION.IRESS_WS) return true
        return false
    }

    getSystemActions = () => {
        const res = []
        for (let index = 0; index < this.systemActions.length; index++) {
            const action = this.systemActions[index]
            if (action.text && typeof action.text === 'function') {
                action.text = action.text()
            }
            if (action.role && typeof action.role === 'function') {
                action.role = action.role()
            }
            res.push(action)
        }
        return res
    }

    getActions = (id, data) => {
        this.actions = this.getSystemActions()
        if (!data) return
        let actions = []
        let isOverSystem = false
        let isStopLossOrder = false
        switch (id) {
            case FORM.CONTRACT_NOTE:
                actions.push(ACTIONS.BUY, ACTIONS.SELL, ACTIONS.CHART, ACTIONS.DEPTH, ACTIONS.SECURITY_DETAIL, ACTIONS.MORNING_STAR, ACTIONS.TIP_RANK, ACTIONS.CREATE_NEW_ALERT, ACTIONS.ADD_TO_WATCHLIST, ACTIONS.MORE)
                break
            case FORM.WATCHLIST:
                actions.push(ACTIONS.NEW_ORDER, ACTIONS.SELL_WITH_CONTINGENT_ORDER, ACTIONS.CHART, ACTIONS.DEPTH, ACTIONS.SECURITY_DETAIL, ACTIONS.MORNING_STAR, ACTIONS.TIP_RANK, ACTIONS.CREATE_NEW_ALERT, ACTIONS.REMOVE_FROM_THIS_WATCHLIST, ACTIONS.ADD_TO_WATCHLIST, ACTIONS.MORE)
                break
            case FORM.ACCOUNT_MANAGEMENT:
                actions = [ACTIONS.PORTFOLIO_HOLDING, ACTIONS.PORTFOLIO_SUMMARY, ACTIONS.ORDERS, ACTIONS.ACCOUNT_INFO, ACTIONS.MORE]
                break
            case FORM.MARKET_DATA_MANAGEMENT:
            case FORM.USER_GROUP_MANAGEMENT:
            case FORM.VETTING_RULES_MANAGEMENT:
                actions = [ACTIONS.MORE]
                break
            case FORM.MARKET_DEPTH:
                actions.push(ACTIONS.LIMIT_ORDER_AT)
                if (data.side === 'Ask') actions.push(ACTIONS.SELL_WITH_CONTINGENT_ORDER)
                actions.push(ACTIONS.CHART, ACTIONS.SECURITY_DETAIL, ACTIONS.MORNING_STAR, ACTIONS.TIP_RANK, ACTIONS.CREATE_NEW_ALERT, ACTIONS.ADD_TO_WATCHLIST)
                break
            case FORM.USER_MANAGEMENT:
                actions = [ACTIONS.USER_DETAIL, ACTIONS.RESET_PASSWORD, ACTIONS.ACTIVITIES, ACTIONS.FORCE_TO_CHANGE_PASSWORD, ACTIONS.MORE]
                break
            case FORM.ALL_HOLDINGS:
                if (checkRole(MapRoleComponent.NEW_ORDER_BUTTON_HOLDINGS)) actions.push(ACTIONS.NEW_ORDER)
                if (data.side === 'Close') {
                    actions.push(ACTIONS.ORDERS, ACTIONS.PORTFOLIO_HOLDING, ACTIONS.PORTFOLIO_SUMMARY, ACTIONS.ACCOUNT_INFO, ACTIONS.MORE)
                } else {
                    if (checkRole(MapRoleComponent.CLOSE_ORDER_BUTTON_HOLDINGS)) actions.push(ACTIONS.CLOSE_POSITION, ACTIONS.CLOSE_POSITION_CONTINGENT)
                    actions.push(ACTIONS.ORDERS, ACTIONS.PORTFOLIO_HOLDING, ACTIONS.PORTFOLIO_SUMMARY, ACTIONS.ACCOUNT_INFO, ACTIONS.MORE)
                }
                break
            case FORM.PORTFOLIO_HOLDINGS:
                isOverSystem = this.checkSymbolOverSystem(data)
                if (checkRole(MapRoleComponent.NEW_ORDER_BUTTON_PORTFOLIO)) actions.push(ACTIONS.NEW_ORDER)
                if (data.side === 'Close') {
                    actions.push(ACTIONS.CHART, ACTIONS.DEPTH, ACTIONS.SECURITY_DETAIL, ACTIONS.MORNING_STAR, ACTIONS.TIP_RANK, ACTIONS.CREATE_NEW_ALERT)
                } else {
                    if (checkRole(MapRoleComponent.CLOSE_ORDER_BUTTON_PORTFOLIO)) actions.push(ACTIONS.CLOSE_POSITION, ACTIONS.CLOSE_POSITION_CONTINGENT)
                    actions.push(ACTIONS.SELL_WITH_CONTINGENT_ORDER, ACTIONS.CHART, ACTIONS.DEPTH, ACTIONS.SECURITY_DETAIL, ACTIONS.MORNING_STAR, ACTIONS.TIP_RANK, ACTIONS.CREATE_NEW_ALERT)
                }
                if (!isOverSystem) actions.push(ACTIONS.ADD_TO_WATCHLIST)
                actions.push(ACTIONS.MORE)
                break
            case FORM.ALL_ORDERS:
                isOverSystem = this.checkSymbolOverSystem(data)
                isStopLossOrder = ['STOPLIMIT_ORDER', 'STOP_ORDER'].includes(data.order_type)
                if (!listNotAllowModifyCancel.includes(data.order_status) && !isOverSystem) {
                    if (!listNotAllowModify.includes(data.order_status) && checkRole(MapRoleComponent.MODIFY_BUTTON_ALL_ORDERS)) {
                        actions.push(ACTIONS.MODIFY_ORDER)
                        isStopLossOrder && actions.push(ACTIONS.MODIFY_WITH_CONTINGENT_ORDER)
                    }
                    if (checkRole(MapRoleComponent.CANCEL_BUTTON_ALL_ORDERS)) {
                        actions.push(ACTIONS.CANCEL_ORDER)
                        isStopLossOrder && actions.push(ACTIONS.CANCEL_WITH_CONTINGENT_ORDER)
                    }
                }
                actions.push(ACTIONS.ORDER_DETAIL, ACTIONS.PORTFOLIO_HOLDING, ACTIONS.PORTFOLIO_SUMMARY, ACTIONS.ORDERS, ACTIONS.ACCOUNT_INFO, ACTIONS.MORE)
                break
            case FORM.ORDERS:
                isOverSystem = this.checkSymbolOverSystem(data)
                const isParent = data.broker_order_id === data.origin_broker_order_id
                isStopLossOrder = ['STOPLIMIT_ORDER', 'STOP_ORDER'].includes(data.order_type)
                const allowModify = !listNotAllowModify.includes(data.order_status)
                const allowModifyCancel = !listNotAllowModifyCancel.includes(data.order_status)
                if (allowModifyCancel && !isOverSystem && isParent) {
                    if (allowModify && checkRole(MapRoleComponent.MODIFY_BUTTON_ORDERS)) {
                        actions.push(ACTIONS.MODIFY_ORDER)
                        isStopLossOrder && actions.push(ACTIONS.MODIFY_WITH_CONTINGENT_ORDER)
                    }
                    if (checkRole(MapRoleComponent.CANCEL_BUTTON_ORDERS)) {
                        actions.push(ACTIONS.CANCEL_ORDER)
                        isStopLossOrder && actions.push(ACTIONS.CANCEL_WITH_CONTINGENT_ORDER)
                    }
                }
                actions.push(ACTIONS.ORDER_DETAIL, ACTIONS.CHART, ACTIONS.DEPTH, ACTIONS.SECURITY_DETAIL, ACTIONS.MORNING_STAR, ACTIONS.TIP_RANK, ACTIONS.CREATE_NEW_ALERT)
                if (!isOverSystem && checkRole(MapRoleComponent.CREATE_REMOVE_ADD_WATCHLIST)) actions.push(ACTIONS.ADD_TO_WATCHLIST)
                actions.push(ACTIONS.MORE)
                break
            default: break
        }
        if (actions.length) this.actions = []
        for (let index = 0; index < actions.length; index++) {
            const actionIndex = actions[index]
            const action = { ...this.dicAction[actionIndex] }
            if (action && !action.hasOwnProperty('role')) {
                action.role = this.getRole(actionIndex, data)
            }
            if (action && !action.hasOwnProperty('text')) {
                action.customText = this.getTitle(actionIndex, data)
            }
            if (action && action.hasOwnProperty('subActions') && typeof action.subActions === 'function') {
                action.subActions = action.subActions(data)
            }
            action.index = this.getIndex(actionIndex)
            const isEnable = checkRole(action.role, action.hasOwnProperty('isAnd') ? action.isAnd : null)
            action && isEnable && this.actions.push(action)
        }
    }

    getIndex = (index) => {
        if (RIGHT_CLICK_1.includes(index)) return 1
        else if (RIGHT_CLICK_2.includes(index)) return 2
        else if (RIGHT_CLICK_4.includes(index)) return 4
        else return 3
    }

    onCopy = () => {
        this.onCopyFn && this.onCopyFn(this.state.data)
        this.hideContextMenu()
    }

    onCopyWithHeader = () => {
        this.onCopyWithHeaderFn && this.onCopyWithHeaderFn(this.state.data)
        this.hideContextMenu()
    }

    onExportCSV = () => {
        this.onExportFn && this.onExportFn()
    }

    calculateSubMenuPosition(index, actionLength) {
        const { style } = this.state
        if (this.isHaveSymbol()) index++
        const subHeight = 32 * actionLength
        let top = index * 32
        let left = style.minWidth
        if (window.innerHeight - (top + style.top) < subHeight) {
            top += window.innerHeight - (top + style.top) - subHeight
        }
        if (window.innerWidth - (left + style.left) < style.minWidth) {
            if (style.left > style.minWidth) left = style.minWidth * -1
            else left += window.innerWidth - (left + style.left) - style.minWidth
        } else left -= 1
        return {
            top,
            left,
            height: subHeight
        }
    }

    componentDidMount() {
        document.addEventListener('click', (event) => {
            if (event && event.target) {
                const parent = event.target.closest('.ag-menu-option.parentOption')
                if (parent && (parent.classList.contains('ag-menu-option-hover') || parent.classList.contains('header'))) return
                const watchlistSub = event.target.closest('.ag-menu-option.watchlistSub')
                if (watchlistSub) return
            }
            this.hideContextMenu()
        })
    }

    remove() {
        if (!this.state.isShow) return
        this.setState({ isShow: false, style: { display: 'none' } })
    }

    onHover(index, actionLength) {
        if (!this.subMenu[index]) return
        this.activeItem && this.activeItem.classList.remove('active')
        this.activeItem = this.items[index]
        this.items[index].classList.add('active')
        document.addEventListener('mouseover', (e) => this.onMouseOver(e, index))
        const style = this.calculateSubMenuPosition(index, actionLength)
        this.subMenu[index].style.left = style.left + 'px'
        this.subMenu[index].style.top = style.top + 'px'
        this.subMenu[index].style.height = style.height + 'px'
        for (let i = 0; i < this.subActions.length; i++) {
            const element = this.subActions[i]
            if (element.index === index) this.subMenu[element.index].classList.remove('ag-hidden')
            else this.subMenu[element.index].classList.add('ag-hidden')
        }
    }

    removeSubMenu(index) {
        document.removeEventListener('mouseover', (e) => this.onMouseOver(e, index))
        if (this.items[index].classList.contains('active')) {
            this.items[index].classList.remove('active')
        }
        this.subMenu[index].classList.add('ag-hidden')
    }

    onMouseOver(event, index) {
        if (event.target) {
            if (this.subMenu[index] && !this.subMenu[index].classList.contains('ag-hidden')) {
                if ((this.subMenu[index].contains(event.target) ||
                    this.mainMenu.contains(event.target)) &&
                    !event.target.classList.contains('beforeHover')) {
                } else this.removeSubMenu(index)
            }
        }
    }

    isSystemActions = () => {
        return this.actions && this.actions[0] && this.actions[0].text === 'lang_text_size'
    }

    isHaveSymbol = () => {
        if (this.isSystemActions()) return false
        if (!this.state.data || !this.state.data.symbol) return false
        const symbolInfo = dataStorage.symbolsObjDic[this.state.data.symbol]
        if (!symbolInfo) return false
        return true
    }

    renderHeader = () => {
        if (!this.state.data || !this.state.data.symbol || this.isSystemActions()) return null
        if (!this.isHaveSymbol()) return null
        const symbolInfo = dataStorage.symbolsObjDic[this.state.data.symbol]
        this.symbolInfo = symbolInfo
        const flagCode = symbolInfo.country === 'AU' ? 'au' : 'us'
        return (
            <div className="ag-menu-option parentOption header"
                key={`actionRightClick_header`}>
                <span className="ag-menu-option-header">{symbolInfo.display_name || symbolInfo.symbol}</span>
                {flagCode ? <img src={`/flag/${flagCode}.png`} style={{
                    width: 20,
                    height: 11,
                    marginLeft: 8
                }} /> : null}
            </div>
        )
    }

    isDivider = (action) => {
        if (this.dicRightClickIndex[action.index]) return false
        else {
            this.dicRightClickIndex[action.index] = true
            return true
        }
    }

    checkActive = (value) => {
        switch (value) {
            case 'small': case 'medium': case 'large':
                return dataStorage.currentFontSize === value
            case 'theme-dark': case 'theme-light':
                return dataStorage.currentTheme === value
            case 'en': case 'cn': case 'vi':
                return dataStorage.currentLang === value
            default: return false
        }
    }

    onSubItemClick(event, e) {
        e.onClick && e.onClick(e.value || this.state.data, event)
    }

    renderSubItem(e, i) {
        const isActive = this.checkActive(e.value)
        return (
            <div className={`ag-menu-option ${e.isWatchlistSub ? 'watchlistSub' : ''} ${isActive ? 'active' : ''} ${e.className || ''}`}
                key={`renderSubItem_${i}`}
                onClick={(event) => this.onSubItemClick(event, e)}>
                {
                    e.icon ? <span className="ag-menu-option-icon">{e.icon}</span> : null
                }
                <span className={`${e.textClass || 'text-capitalize'} ag-menu-option-text`} style={{ paddingLeft: e.icon ? 0 : 8 }}><Lang>{e.text}</Lang></span>
                <span className="ag-menu-option-shortcut"><Lang>{e.shortcut}</Lang></span>
                <span className="ag-menu-option-popup-pointer">
                    {isActive ? <div className='icon active' style={{ display: 'flex', alignItems: 'center' }}><Icon src="navigation/check" color='var(--ascend-default)' hoverColor='var(--ascend-default)' /></div> : null}
                </span>
            </div>
        )
    }

    onItemClick(e) {
        if (e.subActions) return
        e.onClick && e.onClick(this.state.data)
    }

    renderItem(e, i) {
        let isDivider = this.isDivider(e)
        const isBelowHoverRow = (this.actions[i + 1] && this.actions[i + 1].subActions && !this.actions[i].subActions)
        const isAboveHoverRow = (this.actions[i - 1] && this.actions[i - 1].subActions && !this.actions[i].subActions)
        const isRemoveHoverRow = isBelowHoverRow || isAboveHoverRow
        return (
            <React.Fragment key={`renderItem_${i}`}>
                <div ref={ref => this.items[i] = ref}
                    className={`ag-menu-option parentOption${e.subActions ? ' ag-menu-option-hover' : ' '}${isDivider ? ' divider' : ' '}${isRemoveHoverRow ? ' beforeHover' : ''}`}
                    onClick={() => this.onItemClick(e)}
                    onMouseEnter={event => {
                        e.subActions && this.onHover(i, e.subActions.length)
                    }}>
                    <span className={`ag-menu-option-icon${isRemoveHoverRow ? ' beforeHover' : ''}`}>&nbsp;</span>
                    <span className={`${e.textClass ? e.textClass : 'text-capitalize'} ag-menu-option-text${isRemoveHoverRow ? ' beforeHover' : ''}`}>{e.customText ? e.customText : <Lang>{e.text}</Lang>}</span>
                    <span className={`ag-menu-option-shortcut${isRemoveHoverRow ? ' beforeHover' : ''}`}>{e.shortcut}</span>
                    <span className={`ag-menu-option-popup-pointer${isRemoveHoverRow ? ' beforeHover' : ''}`}>
                        {e.icon || null}
                    </span>
                </div>
            </React.Fragment>
        )
    }

    renderActions() {
        return (
            <div className="ag-menu-list-canvas">
                {this.renderHeader()}
                {
                    this.actions.map((e, i) => {
                        return this.renderItem(e, i)
                    })
                }
            </div>
        )
    }

    renderSubActions() {
        return (
            <React.Fragment>
                {
                    this.subActions.map(e => {
                        return this.renderSubMenu(e)
                    })
                }
            </React.Fragment>
        )
    }

    renderSubMenu(e) {
        return (
            <div ref={ref => this.subMenu[e.index] = ref}
                key={`renderSubMenu_${e.index}`}
                style={{ position: 'absolute', height: e.actions.length * 32 }} className="ag-menu ag-ltr ag-hidden">
                <div className="ag-menu-list-canvas">
                    {
                        e.actions.map((e, i) => {
                            return this.renderSubItem(e, i)
                        })
                    }
                </div>
            </div>
        )
    }

    render() {
        if (!this.state.isShow) return null
        this.dicRightClickIndex = {}
        return (
            <div className='context-menu-canvas ag-theme-fresh ag-popup' style={{
                position: 'absolute',
                ...this.state.style
            }}>
                <div ref={ref => this.mainMenu = ref} className="ag-menu ag-ltr">
                    {this.renderActions()}
                </div>
                {this.renderSubActions()}
            </div>
        )
    }
}
