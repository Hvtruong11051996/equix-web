import React from 'react';
import dataStorage from '../../dataStorage'
import {
    changeColorBySide,
    formatNumberVolume,
    formatNumberPrice,
    checkPropsStateShouldUpdate,
    mapError,
    convertObjToArray,
    getActionType,
    showMoneyFormatter,
    mapContentWarning,
    tranferDuration,
    stringFormat,
    isAUSymbol,
    checkValidTranslation,
    checkRole,
    checkRoleWidget,
    mapData,
    formatSide,
    formatDisplayName,
    formatExchange,
    formatCompanyName,
    formatAccountName,
    formatAccountId,
    formatExpireDate,
    formatExpireDateConfirmOrder,
    formatTradingMarket,
    formatDisplayExchange,
    formatLimitPrice,
    formatStopPrice,
    formatVolume,
    formatFirstTransaction,
    isJsonString,
    formatDuration,
    getDisplayExchange
} from '../../helper/functionUtils'
import orderEnum from '../../constants/order_enum';
import orderTypeEnum from '../../constants/order_type';
import orderState from '../../constants/order_state';
import { postData, putData, getData, makePlaceOrderUrl, deleteData, getUrlOrderDetailByTag, requirePin, getUrlOrderById, getUrlOrderResponseLatest, getUrlOrderByClienId, getUrlAnAccount } from '../../helper/request';
import logger from '../../helper/log';
import Icon from '../Inc/Icon'
import { unregisterAllOrders, registerAllOrders } from '../../streaming';
import { emitter, eventEmitter } from '../../constants/emitter_enum';
import { func } from '../../storage';
import uuidv4 from 'uuid/v4';
import config from '../../../public/config'
import Lang from '../Inc/Lang/Lang';
import exchangeTradingMarketEnum from '../../constants/exchange_trading_market_enum';
import MapRoleComponent from '../../constants/map_role_component';
import sideEnum from '../../constants/enum';
import moment from 'moment';
import NoTag from '../Inc/NoTag';
import SecurityDetailIcon from '../Inc/SecurityDetailIcon/SecurityDetailIcon'
import { getNote, note } from '../OrderHistoryDetail'

const TIMEOUT_DEFAULT = 60 * 1000 * 2;
class ConfirmOrder extends React.Component {
    constructor(props) {
        super(props)
        this.lastClick = null;
        if (props.data.typeConfirm === 'CANCEL_ORDER') {
            checkRoleWidget(this, [MapRoleComponent.CANCEL_BUTTON_ORDERS, MapRoleComponent.CANCEL_BUTTON_ORDER_DETAIL, MapRoleComponent.CANCEL_BUTTON_ALL_ORDERS])
        }
        this.accountRefresh = func.getStore(emitter.STREAMING_ACCOUNT_DATA);
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.state = {
            dataAccount: props.data.dataAccount || {},
            isConnected: dataStorage.connected,
            isShowWarning: false,
            errorOrder: '',
            haveErrorOrder: false,
            loadingConfirm: false,
            firstTransaction: {},
            currency: this.props.currency || props.data.dataAccount.currency || ''
        }
        this.dataRequest = props.data.dataRequest || {}
        this.typeConfirm = props.data.typeConfirm || ''
        this.estimatedPriceObj = this.state.dataAccount.estimatedPriceObj || {}
        this.clientOrderId = null;
        this.disableConfirmButton = true
        this.getAnAccount = this.getAnAccount.bind(this)
        this.realtimeData = this.realtimeData.bind(this);
        if ((this.typeConfirm === 'CANCEL_ORDER' && checkRole(MapRoleComponent.CONFIRM_CANCEL_BUY_OR_SELL_ORDER)) ||
            (this.typeConfirm === 'MODIFY_ORDER' && checkRole(MapRoleComponent.COMFIRM_MODIFY_BUY_OR_SELL_ORDER)) ||
            ((this.typeConfirm === 'NEW_ORDER' && checkRole(MapRoleComponent.CONFIRM_PLACE_BUY_OR_SELL_ORDER)))) {
            this.disableConfirmButton = false
        }
    }

    changeConnection(isConnected) {
        if (!isConnected !== !this.state.isConnected) {
            this.setState({ isConnected })
        }
    }

    getFirstTransaction(brokerOrderId) {
        if (!brokerOrderId) brokerOrderId = this.state.dataAccount.broker_order_id;
        if (!brokerOrderId) return
        let url = getUrlOrderDetailByTag(brokerOrderId)
        this.props.loading(true)
        getData(url)
            .then(response => {
                this.props.loading(false)
                if (response.data && response.data.length > 0) {
                    const listOrder = convertObjToArray(response.data || {})
                    const firstTransaction = listOrder[listOrder.length - 1] || {}
                    firstTransaction.display_name = this.state.dataAccount.display_name
                    this.setState({
                        firstTransaction: firstTransaction
                    })
                }
            })
            .catch(error => {
                this.props.loading(false)
                logger.error(error)
                this.setState({ firstTransaction: {} })
            })
    }

    hiddenWarning() {
        try {
            setTimeout(() => {
                this.setState({ isShowWarning: false })
            }, 4000)
        } catch (error) {
            logger.error('hiddenWarning On NewOrder ' + error)
        }
    }

    realtimeData(dataObj, data, title) {
        if ((this.typeConfirm === orderEnum.NEW_ORDER && this.clientOrderId && this.clientOrderId !== dataObj.client_order_id) || (dataObj.account_id && formatAccountId(this.state.dataAccount) !== dataObj.account_id)) return
        if (this.state.dataAccount.broker_order_id) {
            if (dataObj.broker_order_id !== this.state.dataAccount.broker_order_id) return;
        }
        if (!title) return;
        if (this.typeConfirm === orderEnum.NEW_ORDER && this.clientOrderId !== dataObj.client_order_id) return;
        if (/#TIMEOUT$/.test(title)) {
            if (this.timeoutRequestOrder) clearTimeout(this.timeoutRequestOrder)
            if (this.isRejected) return
            this.setState({
                errorOrder: 'lang_timeout_cannot_be_connected_server',
                isShowWarning: true,
                loadingConfirm: false,
                haveErrorOrder: true
            }, () => this.hiddenWarning())
        }
        if (/#SUCCESS$/.test(title)) {
            if (this.intervalId) clearInterval(this.intervalId);
            if (this.timeoutRequestOrder) clearTimeout(this.timeoutRequestOrder)
            this.setState({
                loadingConfirm: false,
                errorOrder: mapContentWarning(true, this.typeConfirm),
                haveErrorOrder: false
            }, () => {
                let url = dataObj.broker_order_id ? getUrlOrderById(dataObj.broker_order_id) : getUrlOrderByClienId(dataObj.client_order_id);
                this.props.loading(true)
                getData(url)
                    .then(response => {
                        this.props.loading(false)
                        if (response.data && response.data.length) {
                            data = response.data[0] || {}
                            data.company_name = formatCompanyName(this.state.dataAccount)
                            data.account_name = formatAccountName(this.state.dataAccount)
                            data.display_name = formatDisplayName(this.state.dataAccount)
                            data.master_code = this.state.dataAccount.master_code
                            data.country = this.state.dataAccount.country
                            data.expiry_date = this.state.dataAccount.displayExpireDate
                            data.first_noti_day = this.state.dataAccount.firstNoticeDay
                            data.unit = this.state.dataAccount.unitcommonity
                            data.contract_size = this.state.dataAccount.contractSize
                            setTimeout(() => {
                                this.props.saveState({
                                    stateOrder: 'DetailOrder',
                                    needConfirm: false,
                                    data: mapData({ ...this.state.dataAccount, ...data }),
                                    currency: this.props.currency
                                })
                            }, 2000)
                        }
                    })
                    .catch(error => {
                        this.props.loading(false)
                        setTimeout(() => {
                            this.props.saveState({
                                stateOrder: 'DetailOrder',
                                needConfirm: false,
                                data: {},
                                currency: this.props.currency
                            })
                        }, 2000)
                        logger.error(error)
                    })
            })
            return
        }
        if (/#REJECT$/.test(title)) {
            if (this.intervalId) clearInterval(this.intervalId);
            if (this.timeoutRequestOrder) clearTimeout(this.timeoutRequestOrder)
            const dataParser = dataObj.text && isJsonString(dataObj.text);
            const text = dataParser ? dataParser.text : dataObj.text;
            const errorString = mapError(text || dataObj.reject_reason, this.typeConfirm);
            this.isRejected = true;
            this.setState({
                errorOrder: errorString,
                isShowWarning: true,
                loadingConfirm: false,
                haveErrorOrder: true
            }, () => this.hiddenWarning())
        }
    }

    handleError(error) {
        let errorString = 'Error'
        if ((error.response && error.response.data && error.response.data.errorCode) || (error.response && error.response.errorCode)) {
            if (error.response.data) errorString = error.response.data.errorCode
            errorString = error.response.errorCode
        }
        this.setState({
            errorOrder: mapError(errorString, this.typeConfirm),
            isShowWarning: true,
            loadingConfirm: false,
            haveErrorOrder: true
        }, () => this.hiddenWarning())
    }

    handleResponseOrder(response) {
        if (response.data) {
            if (response.data.errorCode === 'SUCCESS') {
                if (response.data.order_id) {
                    this.clientOrderId = response.data.order_id;
                    if (this.intervalId) clearInterval(this.intervalId);
                    this.intervalId = setInterval(() => {
                        logger.sendLog('receive order result: ' + response.data.order_id);
                        this.checkOrderExisted(response.data.order_id);
                    }, 10000);
                }
            } else {
                if (this.timeoutRequestOrder) clearTimeout(this.timeoutRequestOrder)
                let errorString = ''
                if (response.data.errorCode) {
                    if (typeof response.data.errorCode === 'string') {
                        errorString = response.data.errorCode
                    } else {
                        if (response.data.errorCode.length && response.data.errorCode.length > 0) {
                            errorString = Math.min(...response.data.errorCode)
                        }
                    }
                }
                this.setState({
                    errorOrder: mapError(errorString, this.typeConfirm),
                    isShowWarning: true,
                    loadingConfirm: false,
                    haveErrorOrder: true
                }, () => this.hiddenWarning())
            }
        }
    }

    listenerPlaceOrder(orderPlaceObject) {
        const urlPlaceOrder = makePlaceOrderUrl();
        this.clientOrderId = this.state.dataAccount.account_id + '_' + uuidv4().replace(/-/g, '')
        orderPlaceObject.client_order_id = this.clientOrderId;
        const obj = { 'data': orderPlaceObject }
        this.props.loading(true)
        postData(urlPlaceOrder, obj)
            .then(response => {
                this.props.loading(false)
                this.handleResponseOrder(response)
            })
            .catch(error => {
                this.props.loading(false)
                logger.error(error)
                this.handleError(error)
            })
    }

    listenerModifyOrder(orderModifyObject) {
        const urlModifyOrder = makePlaceOrderUrl(`/${this.state.dataAccount.broker_order_id}`)
        const obj = { 'data': orderModifyObject }
        this.props.loading(true)
        putData(urlModifyOrder, obj)
            .then(response => {
                this.props.loading(false)
                this.handleResponseOrder(response)
            })
            .catch(error => {
                this.props.loading(false)
                logger.error(error)
                this.handleError(error)
            })
    }

    listenerCancelOrder(brokerOrderId) {
        const urlCancel = makePlaceOrderUrl(`/${brokerOrderId || ''}`)
        this.props.loading(true)
        deleteData(urlCancel)
            .then(response => {
                this.props.loading(false)
                this.handleResponseOrder(response)
            })
            .catch(error => {
                this.props.loading(false)
                logger.error(error)
                this.handleError(error)
            })
    }

    confirmOrder() {
        try {
            this.setState({
                haveErrorOrder: false,
                loadingConfirm: true,
                isShowWarning: true,
                errorOrder: mapContentWarning(false, this.typeConfirm)
            }, () => {
                this.lastClick = +new Date();
                switch (this.typeConfirm) {
                    case orderEnum.NEW_ORDER:
                        this.listenerPlaceOrder(this.dataRequest);
                        break;
                    case orderEnum.MODIFY_ORDER:
                        this.listenerModifyOrder(this.dataRequest);
                        break;
                    case orderEnum.CANCEL_ORDER:
                        this.listenerCancelOrder(this.state.dataAccount.broker_order_id);
                        break;
                    default:
                        break;
                }
                this.timeoutRequestOrder = setTimeout(() => {
                    this.setState({
                        errorOrder: 'lang_timeout_cannot_be_connected_server',
                        isShowWarning: true,
                        loadingConfirm: false,
                        haveErrorOrder: true
                    }, () => this.hiddenWarning())
                }, TIMEOUT_DEFAULT)
            })
        } catch (error) {
            logger.error('confirmOrder On ConfirmOrder' + error)
        }
    }

    renderDescription() {
        try {
            const dataAccount = this.state.dataAccount || {};
            const isSymbolFuture = dataAccount.class === 'future'
            const side = formatSide(dataAccount)
            const styleSide = changeColorBySide(side)
            const orderType = dataAccount.order_type
            const conditionName = dataAccount.condition_name
            const displayName = formatDisplayName(dataAccount).toUpperCase()
            const exchange = isAUSymbol(formatExchange(dataAccount))
            const limitPrice = formatLimitPrice(dataAccount)
            const stopPrice = formatStopPrice(dataAccount)
            const volume = formatVolume(dataAccount)
            const orderTypeOrigin = dataAccount.order_type_origin

            const oldLimitPrice = dataAccount.oldlimitPrice ? formatNumberPrice(dataAccount.oldlimitPrice, true) : '0.0000';
            const oldStopPrice = dataAccount.oldstopPrice ? formatNumberPrice(dataAccount.oldstopPrice, true) : '0.0000';
            const oldVolume = dataAccount.oldVolume ? formatNumberVolume(dataAccount.oldVolume, true) : '--';
            const filledVolumeCancel = (dataAccount.volume - (dataAccount.filled_quantity || 0)) ? formatNumberVolume(dataAccount.volume - (dataAccount.filled_quantity || 0), true) : '--'
            if (dataAccount.order_status === orderState.PARTIALLY_FILLED) {
                switch (this.typeConfirm) {
                    case orderEnum.MODIFY_ORDER:
                        if (orderType === orderTypeEnum.MARKETTOLIMIT || orderType === orderTypeEnum.MARKET_SAXO) {
                            if (conditionName === 'StopLoss') {
                                // STOP_LOSS
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_modify</Lang></span> <span className='text-uppercase'><Lang>lang_stop</Lang></span>{' '}
                                        <span className='firstLetterUpperCase'><Lang>lang_order_from</Lang></span>{' '}
                                        <span className='text-uppercase' style={styleSide}>{side === sideEnum.BUYSIDE ? <Lang>lang_buying</Lang> : <Lang>lang_selling</Lang>} {oldVolume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>,
                                        <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                        <span style={styleSide}>{oldStopPrice}</span> <Lang>lang_to</Lang>{' '}
                                        <span style={styleSide}>{volume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span>,
                                        <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                        <span style={styleSide}>{stopPrice}</span>?
                                    </span>
                                </div>
                            } else {
                                // MTL
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_modify</Lang></span> <span className='text-uppercase'><Lang>lang_market_to_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_from</Lang></span>{' '}
                                        <span className='text-uppercase' style={styleSide}>{side === sideEnum.BUYSIDE ? <Lang>lang_buying</Lang> : <Lang>lang_selling</Lang>} {oldVolume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span style={styleSide}>{oldLimitPrice}</span> <Lang>lang_to</Lang>{' '}
                                        <span style={styleSide}>{volume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span style={styleSide}>{limitPrice}</span>?
                                    </span>
                                </div>
                            }
                        }
                        if (orderType === orderTypeEnum.LIMIT || orderType === orderTypeEnum.LIMIT_SAXO) {
                            if (conditionName === 'StopLoss') {
                                // STOP_LIMIT
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_modify</Lang></span> <span className='text-uppercase'>{isSymbolFuture ? <Lang>lang_stop_limit</Lang> : <Lang>lang_stop_loss</Lang>}</span> <span className='firstLetterUpperCase'><Lang>lang_order_from</Lang></span>{' '}
                                        <span className='text-uppercase' style={styleSide}>{side === sideEnum.BUYSIDE ? <Lang>lang_buying</Lang> : <Lang>lang_selling</Lang>} {oldVolume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span style={styleSide}>{oldLimitPrice}</span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                        <span style={styleSide}>{oldStopPrice}</span> <Lang>lang_to</Lang>{' '}
                                        <span style={styleSide}>{volume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span style={styleSide}>{limitPrice}</span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                        <span style={styleSide}>{stopPrice}</span>?
                                    </span>
                                </div>
                            } else {
                                // LIMIT
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_modify</Lang></span> <span className='text-uppercase'><Lang>lang_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_from</Lang></span>{' '}
                                        <span className='text-uppercase' style={styleSide}>{side === sideEnum.BUYSIDE ? <Lang>lang_buying</Lang> : <Lang>lang_selling</Lang>} {oldVolume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span style={styleSide}>{oldLimitPrice}</span> <Lang>lang_to</Lang>{' '}
                                        <span style={styleSide}> {volume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span style={styleSide}>{limitPrice}</span>?
                                    </span>
                                </div>
                            }
                        }
                        // BEST
                        if (orderType === orderTypeEnum.BEST) {
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_modify</Lang></span> <span className='text-uppercase'><Lang>lang_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_from</Lang></span>{' '}
                                    <span className='text-uppercase' style={styleSide}>{side === sideEnum.BUYSIDE ? <Lang>lang_buying</Lang> : <Lang>lang_selling</Lang>} {oldVolume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{oldLimitPrice}</span> <Lang>lang_to</Lang>{' '}
                                    <span style={styleSide}> {volume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{limitPrice}</span>?
                                </span>
                            </div>
                        }
                        if (orderType === orderTypeEnum.STOP) {
                            // STOP_LOSS
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_modify</Lang></span> <span className='text-uppercase'><Lang>lang_stop</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_from</Lang></span>{' '}
                                    <span className='text-uppercase' style={styleSide}>{side === sideEnum.BUYSIDE ? <Lang>lang_buying</Lang> : <Lang>lang_selling</Lang>} {oldVolume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                    <span style={styleSide}>{oldStopPrice}</span> <Lang>lang_to</Lang>{' '}
                                    <span style={styleSide}>{volume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                    <span style={styleSide}>{stopPrice}</span>?
                                </span>
                            </div>
                        }
                        if (orderTypeEnum === orderTypeEnum.STOP_LIMIT) {
                            // STOP_LIMIT
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_modify</Lang></span> <span className='text-uppercase'>{isSymbolFuture ? <Lang>lang_stop_limit</Lang> : <Lang>lang_stop_loss</Lang>}</span> <span className='firstLetterUpperCase'><Lang>lang_order_from</Lang></span>{' '}
                                    <span className='text-uppercase' style={styleSide}>{side === sideEnum.BUYSIDE ? <Lang>lang_buying</Lang> : <Lang>lang_selling</Lang>} {oldVolume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{oldLimitPrice}</span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                    <span style={styleSide}>{oldStopPrice}</span> <Lang>lang_to</Lang>{' '}
                                    <span style={styleSide}>{volume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{limitPrice}</span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                    <span style={styleSide}>{stopPrice}</span>?
                                </span>
                            </div>
                        }
                        break;
                    case orderEnum.CANCEL_ORDER:
                        if (orderType === orderTypeEnum.MARKETTOLIMIT) {
                            if (conditionName === 'StopLoss') {
                                // STOP_LOSS
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'>{exchange ? <Lang>lang_stop_loss</Lang> : <Lang>lang_stop</Lang>}</span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                        <span style={styleSide}>{side} {filledVolumeCancel}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                        <span style={styleSide}>{stopPrice}</span>?
                                    </span>
                                </div>
                            } else {
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'><Lang>lang_market_to_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                        <span style={styleSide}>{side} {filledVolumeCancel}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span style={styleSide}>{limitPrice}</span>?
                                    </span>
                                </div>
                            }
                        }
                        if (orderType === orderTypeEnum.MARKET_SAXO) {
                            // SAXO
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'><Lang>lang_stop</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                    <span style={styleSide}>{side} {filledVolumeCancel}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                    <span style={styleSide}>{stopPrice}</span>?
                                </span>
                            </div>
                        }
                        if (orderType === orderTypeEnum.LIMIT) {
                            if (conditionName === 'StopLoss') {
                                // STOP_LIMIT
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'>{isSymbolFuture ? <Lang>lang_stop_limit</Lang> : <Lang>lang_stop_loss</Lang>}</span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                        <span style={styleSide}>{side} {filledVolumeCancel}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span style={styleSide}>{limitPrice}</span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                        <span style={styleSide}>{stopPrice}</span>?
                                    </span>
                                </div>
                            } else {
                                // LIMIT
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'><Lang>lang_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                        <span style={styleSide}>{side} {filledVolumeCancel}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span style={styleSide}>{limitPrice}</span>?
                                    </span>
                                </div>
                            }
                        }
                        if (orderType === orderTypeEnum.BEST) {
                            // BEST
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'><Lang>lang_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                    <span style={styleSide}>{side} {filledVolumeCancel}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{limitPrice}</span>?
                                </span>
                            </div>
                        }
                        if (orderType === orderTypeEnum.STOP) {
                            // STOP_LOSS
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'>{exchange ? <Lang>lang_stop_loss</Lang> : <Lang>lang_stop</Lang>}</span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                    <span style={styleSide}>{side} {filledVolumeCancel}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                    <span style={styleSide}>{stopPrice}</span>?
                                </span>
                            </div>
                        }
                        if (orderType === orderTypeEnum.STOP_LIMIT) {
                            // STOP_LIMIT
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'>{isSymbolFuture ? <Lang>lang_stop_limit</Lang> : <Lang>lang_stop_loss</Lang>}</span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                    <span style={styleSide}>{side} {filledVolumeCancel}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{limitPrice}</span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                    <span style={styleSide}>{stopPrice}</span>?
                                </span>
                            </div>
                        }
                        break;
                    default:
                        break;
                }
            } else {
                switch (this.typeConfirm) {
                    case orderEnum.NEW_ORDER:
                        if (orderType === orderTypeEnum.MARKETTOLIMIT) {
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_place</Lang></span> <span className='text-uppercase'><Lang>lang_market_to_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                    <span style={styleSide}>{side} {volume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>?
                                </span>
                            </div>
                        }
                        if (orderType === orderTypeEnum.MARKET_SAXO) {
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_place</Lang></span> <span className='text-uppercase'><Lang>lang_market</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                    <span style={styleSide}>{side} {volume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>?
                                </span>
                            </div>
                        }
                        if (orderType === orderTypeEnum.LIMIT) {
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_place</Lang></span> <span className='text-uppercase'><Lang>lang_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                    <span style={styleSide}>{side} {volume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{limitPrice}</span>?
                                </span>
                            </div>
                        }
                        if (orderType === orderTypeEnum.STOP_LIMIT) {
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_place</Lang></span> <span className='text-uppercase'>{isSymbolFuture ? <Lang>lang_stop_limit</Lang> : <Lang>lang_stop_loss</Lang>}</span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                    <span style={styleSide}>{side} {volume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{limitPrice}</span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                    <span style={styleSide}>{stopPrice}</span>?
                                </span>
                            </div>
                        }
                        if (orderType === orderTypeEnum.STOPLOSS) {
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_place</Lang></span> <span className='text-uppercase'><Lang>lang_stop_loss</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                    <span style={styleSide}>{side} {volume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                    <span style={styleSide}>{stopPrice}</span>?
                                </span>
                            </div>
                        }
                        if (orderType === orderTypeEnum.STOP) {
                            if (stopPrice && !limitPrice) {
                                // STOP_LOSS
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_place</Lang></span> <span className='text-uppercase'>{exchange ? <Lang>lang_stop_loss</Lang> : <Lang>lang_stop</Lang>}</span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                        <span style={styleSide}>{side} {volume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                        <span style={styleSide}>{stopPrice}</span>?
                                    </span>
                                </div>
                            }
                            if (stopPrice && limitPrice) {
                                // STOP_LIMIT
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_place</Lang></span> <span className='text-uppercase'>{isSymbolFuture ? <Lang>lang_stop_limit</Lang> : <Lang>lang_stop_loss</Lang>}</span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                        <span style={styleSide}>{side} {volume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span style={styleSide}>{limitPrice}</span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                        <span style={styleSide}>{stopPrice}</span>?
                                    </span>
                                </div>
                            }
                        }
                        break;
                    case orderEnum.MODIFY_ORDER:
                        if (orderType === orderTypeEnum.MARKET_SAXO) {
                            if (conditionName === 'StopLoss') {
                                // STOP_LOSS
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_modify</Lang></span> <span className='text-uppercase'><Lang>lang_market</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_from</Lang></span>{' '}
                                        <span className='text-uppercase' style={styleSide}>{side === sideEnum.BUYSIDE ? <Lang>lang_buying</Lang> : <Lang>lang_selling</Lang>} {oldVolume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                        <span style={styleSide}>{oldStopPrice}</span> <Lang>lang_to</Lang>{' '}
                                        <span style={styleSide}>{volume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                        <span style={styleSide}>{stopPrice}</span>?
                                    </span>
                                </div>
                            } else {
                                // MK
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_modify</Lang></span> <span className='text-uppercase'><Lang>lang_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_from</Lang></span>{' '}
                                        <span className='text-uppercase' style={styleSide}>{side === sideEnum.BUYSIDE ? <Lang>lang_buying</Lang> : <Lang>lang_selling</Lang>} {oldVolume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span> <Lang>lang_to</Lang>{' '}
                                        <span style={styleSide}>{volume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>?
                                    </span>
                                </div>
                            }
                        }
                        if (orderType === orderTypeEnum.MARKETTOLIMIT) {
                            if (conditionName === 'StopLoss') {
                                // STOP_LOSS
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_modify</Lang></span> <span className='text-uppercase'><Lang>lang_market_to_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_from</Lang></span>{' '}
                                        <span className='text-uppercase' style={styleSide}>{side === sideEnum.BUYSIDE ? <Lang>lang_buying</Lang> : <Lang>lang_selling</Lang>} {oldVolume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                        <span style={styleSide}>{oldStopPrice}</span> <Lang>lang_to</Lang>{' '}
                                        <span style={styleSide}>{volume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                        <span style={styleSide}>{stopPrice}</span>?
                                    </span>
                                </div>
                            } else {
                                // MTL
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_modify</Lang></span> <span className='text-uppercase'><Lang>lang_market_to_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_from</Lang></span>{' '}
                                        <span className='text-uppercase' style={styleSide}>{side === sideEnum.BUYSIDE ? <Lang>lang_buying</Lang> : <Lang>lang_selling</Lang>} {oldVolume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span> <Lang>lang_to</Lang>{' '}
                                        <span style={styleSide}>{volume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>?
                                    </span>
                                </div>
                            }
                        }
                        if (orderType === orderTypeEnum.LIMIT) {
                            // LIMIT
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_modify</Lang></span> <span className='text-uppercase'><Lang>lang_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_from</Lang></span>{' '}
                                    <span className='text-uppercase' style={styleSide}>{side === sideEnum.BUYSIDE ? <Lang>lang_buying</Lang> : <Lang>lang_selling</Lang>} {oldVolume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{oldLimitPrice}</span> <Lang>lang_to</Lang>{' '}
                                    <span style={styleSide}> {volume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{limitPrice}</span>?
                                </span>
                            </div>
                        }
                        if (orderType === orderTypeEnum.BEST) {
                            // BEST
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_modify</Lang></span> <span className='text-uppercase'><Lang>lang_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_from</Lang></span>{' '}
                                    <span className='text-uppercase' style={styleSide}>{side === sideEnum.BUYSIDE ? <Lang>lang_buying</Lang> : <Lang>lang_selling</Lang>} {oldVolume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{oldLimitPrice}</span> <Lang>lang_to</Lang>{' '}
                                    <span style={styleSide}> {volume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{limitPrice}</span>?
                                </span>
                            </div>
                        }
                        if (orderType === orderTypeEnum.STOP_LIMIT) {
                            // STOP_LIMIT
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_modify</Lang></span> <span className='text-uppercase'>{isSymbolFuture ? <Lang>lang_stop_limit</Lang> : <Lang>lang_stop_loss</Lang>}</span> <span className='firstLetterUpperCase'><Lang>lang_order_from</Lang></span>{' '}
                                    <span className='text-uppercase' style={styleSide}>{side === sideEnum.BUYSIDE ? <Lang>lang_buying</Lang> : <Lang>lang_selling</Lang>} {oldVolume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{oldLimitPrice}</span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                    <span style={styleSide}>{oldStopPrice}</span> <Lang>lang_to</Lang>{' '}
                                    <span style={styleSide}>{volume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{limitPrice}</span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                    <span style={styleSide}>{stopPrice}</span>?
                                </span>
                            </div>
                        }
                        if (orderType === orderTypeEnum.STOP) {
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_modify</Lang></span> <span className='text-uppercase'><Lang>lang_stop_loss</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_from</Lang></span>{' '}
                                    <span className='text-uppercase' style={styleSide}>{side === sideEnum.BUYSIDE ? <Lang>lang_buying</Lang> : <Lang>lang_selling</Lang>} {oldVolume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                    <span style={styleSide}>{oldStopPrice}</span> <Lang>lang_to</Lang>{' '}
                                    <span style={styleSide}>{volume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                    <span style={styleSide}>{stopPrice}</span>?
                                </span>
                            </div>
                        }
                        break;
                    case orderEnum.CANCEL_ORDER:
                        if (orderType === orderTypeEnum.STOP || orderType === orderTypeEnum.MARKETTOLIMIT) {
                            if (conditionName === 'StopLoss' && orderTypeOrigin === 'MarketToLimit') {
                                // STOP_LOSS
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'>{exchange ? <Lang>lang_stop_loss</Lang> : <Lang>lang_stop</Lang>}</span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                        <span style={styleSide}>{side} {volume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                        <span style={styleSide}>{stopPrice}</span>?
                                    </span>
                                </div>
                            }
                        }
                        if (orderType === orderTypeEnum.MARKETTOLIMIT) {
                            if (conditionName !== 'StopLoss') {
                                // MTL
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'><Lang>lang_market_to_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                        <span style={styleSide}>{side} {volume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>?
                                    </span>
                                </div>
                            }
                        }
                        if (orderType === orderTypeEnum.MARKET_SAXO) {
                            if (stopPrice !== '0.000' && stopPrice !== '--') {
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'><Lang>lang_market_to_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                        <span style={styleSide}>{side} {volume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                        <span style={styleSide}>{stopPrice}</span>?
                                    </span>
                                </div>
                            } else {
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'><Lang>lang_market</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                        <span style={styleSide}>{side} {volume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>?
                                    </span>
                                </div>
                            }
                        }
                        if (orderType === orderTypeEnum.STOP || orderType === orderTypeEnum.MARKETTOLIMIT) {
                            if (conditionName === 'StopLoss' && orderTypeOrigin === 'Limit') {
                                // STOP_LIMIT
                                return <div>
                                    <span>
                                        <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'>{isSymbolFuture ? <Lang>lang_stop_limit</Lang> : <Lang>lang_stop_loss</Lang>}</span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                        <span style={styleSide}>{side} {volume}</span> <Lang>lang_of</Lang>{' '}
                                        <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                        <span style={styleSide}>{limitPrice}</span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                        <span style={styleSide}>{stopPrice}</span>?
                                    </span>
                                </div>
                            }
                        }
                        if (orderType === orderTypeEnum.LIMIT) {
                            // LIMIT
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'><Lang>lang_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                    <span style={styleSide}>{side} {volume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{limitPrice}</span>?
                                </span>
                            </div>
                        }
                        if (orderType === orderTypeEnum.BEST) {
                            // BEST
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'><Lang>lang_limit</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                    <span style={styleSide}>{side} {volume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{limitPrice}</span>?
                                </span>
                            </div>
                        }
                        if (orderType === orderTypeEnum.STOP_LIMIT) {
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'>{isSymbolFuture ? <Lang>lang_stop_limit</Lang> : <Lang>lang_stop_loss</Lang>}</span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                    <span style={styleSide}>{side} {volume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span style={styleSide}>{limitPrice}</span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                    <span style={styleSide}>{stopPrice}</span>?
                                </span>
                            </div>
                        }
                        if (orderType === orderTypeEnum.STOP) {
                            return <div>
                                <span>
                                    <span className='text-capitalize'><Lang>lang_cancel</Lang></span> <span className='text-uppercase'><Lang>lang_stop_loss</Lang></span> <span className='firstLetterUpperCase'><Lang>lang_order_to</Lang>&nbsp;</span>
                                    <span style={styleSide}>{side} {volume}</span> <Lang>lang_of</Lang>{' '}
                                    <span style={styleSide}>{displayName}</span> <Lang>lang_at</Lang>{' '}
                                    <span className='text-uppercase' style={styleSide}><Lang>lang_market_price</Lang></span>, <span><Lang>lang_trigger_at</Lang>&nbsp;</span>
                                    <span style={styleSide}>{stopPrice}</span>?
                                </span>
                            </div>
                        }
                        break;
                }
            }
        } catch (error) {
            logger.error('renderDescription On ConfirmOrder' + error)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (dataStorage.checkUpdate) {
                return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On ConfirmOrder', error)
        }
    }
    parseExpiryDate = (value) => {
        if (!value) return '--'
        return moment(value).format('DD MMM YYYY')
    }

    renderTableInfoOrderDefault() {
        const dataAccount = this.state.dataAccount
        const exchange = isAUSymbol(formatExchange(dataAccount))
        const accountName = formatAccountName(dataAccount)
        const accountId = formatAccountId(dataAccount)
        const isSymbolFuture = (dataAccount.isSymbolFuture && dataAccount.isSymbolFuture === 'future')
        const displayExchange = this.state.dataAccount.display_exchange || getDisplayExchange(this.state.dataAccount)
        return (
            <div className='tableInfoOrder'>
                <div className='size--3'>
                    {
                        accountId
                            ? <div className="rowOrderPad changeColorHover">
                                <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_account</Lang></span>
                                <span className='showTitle'>{accountName} ({accountId})</span>
                            </div>
                            : null
                    }
                    <div className="rowOrderPad changeColorHover">
                        <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_duration</Lang></span>
                        <span className='showTitle'>{formatDuration(dataAccount)}</span>
                    </div>
                    {dataAccount.duration === 'GTD' ? (
                        <div className="rowOrderPad changeColorHover">
                            <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_date</Lang></span>
                            <span className='showTitle'>{formatExpireDateConfirmOrder(dataAccount)}</span>
                        </div>
                    ) : null}
                    <div className='rowOrderPad changeColorHover'>
                        <span className='showTitle text-capitalize  leftRowOrderPad'><Lang>lang_exchange</Lang></span>
                        <div className='showTitle textShow size--3'>
                            <Lang>{displayExchange}</Lang>
                        </div>
                    </div>
                </div>
                <div>
                    {
                        !exchange || isSymbolFuture
                            ? <div className="rowOrderPad changeColorHover">
                                <span className='showTitle leftRowOrderPad'><Lang>lang_order_amount_usd</Lang></span>
                                <span className='showTitle text-uppercase'>{showMoneyFormatter(this.estimatedPriceObj.order_amount, dataAccount.unit)} <Lang>lang_usd</Lang></span>
                            </div>
                            : null
                    }
                    {
                        isSymbolFuture && dataAccount.unit
                            ? <div className="rowOrderPad changeColorHover">
                                <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_initial_margin_impact</Lang>{' (' + (dataAccount.unit || '') + ')'}</span>
                                <span className='showTitle'>{showMoneyFormatter(this.estimatedPriceObj.initial_margin_impact, dataAccount.unit)} {<Lang>{dataAccount.unit}</Lang>}</span>

                            </div>
                            : null
                    }
                    {
                        isSymbolFuture && dataAccount.unit
                            ? <div className="rowOrderPad changeColorHover">
                                <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_maintenance_margin_impact</Lang>{' (' + (dataAccount.unit || '') + ')'}</span>
                                <span className='showTitle'>{showMoneyFormatter(this.estimatedPriceObj.maintenance_margin_impact, dataAccount.unit)} {<Lang>{dataAccount.unit}</Lang>}</span>
                            </div>
                            : null
                    }
                    <div className="rowOrderPad changeColorHover">
                        <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_order_amount</Lang>{' (' + this.state.currency + ')'}</span>
                        <span className='showTitle'>{showMoneyFormatter(this.estimatedPriceObj.order_amount_convert, this.state.currency)} <Lang>{this.state.currency}</Lang></span>
                    </div>
                    {
                        isSymbolFuture
                            ? <div className="rowOrderPad changeColorHover">
                                <span className='showTitle text-capitalize leftRowOrderPad'>{<Lang>lang_initial_margin_impact</Lang>}{' (' + (this.state.currency || '') + ')'}</span>
                                <span className='showTitle'>{showMoneyFormatter(this.estimatedPriceObj.initial_margin_impact_convert, this.state.currency)} {<Lang>{this.state.currency}</Lang>}</span>
                            </div>
                            : null
                    }
                    {
                        isSymbolFuture
                            ? <div className="rowOrderPad changeColorHover">
                                <span className='showTitle text-capitalize leftRowOrderPad'>{<Lang>lang_maintenance_margin_impact</Lang>}{' (' + (this.state.currency || '') + ')'}</span>
                                <span className='showTitle'>{showMoneyFormatter(this.estimatedPriceObj.maintenance_margin_impact_convert, this.state.currency)} {<Lang>{this.state.currency}</Lang>}</span>
                            </div>
                            : null
                    }
                    {
                        dataStorage.env_config.roles.showAdditionalFees ? <NoTag>
                            <div className="rowOrderPad changeColorHover">
                                <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_fees</Lang>{this.state.currency ? ' (' + this.state.currency + ')' : ''}</span>
                                <span className='showTitle'>{showMoneyFormatter(this.estimatedPriceObj.fees, this.state.currency)} {this.state.currency}</span>
                            </div>
                            {this.estimatedPriceObj.gst
                                ? <div className="rowOrderPad changeColorHover">
                                    <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_gst</Lang> (10%) {this.state.currency ? ' (' + this.state.currency + ')' : ''}</span>
                                    <span className='showTitle'>{showMoneyFormatter(this.estimatedPriceObj.gst, this.state.currency)} {this.state.currency}</span>
                                </div>
                                : null}
                        </NoTag> : null
                    }
                    <div className="rowOrderPad changeColorHover">
                        <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_estimated_fees</Lang>{' (' + this.state.currency + ')'}</span>
                        <span className='showTitle'>{showMoneyFormatter(this.estimatedPriceObj.estimated_fees, this.state.currency)} <Lang>{this.state.currency}</Lang></span>
                    </div>
                    <div className="rowOrderPad changeColorHover">
                        <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_estimated_total</Lang>{' (' + this.state.currency + ')'}</span>
                        <span className='showTitle'>{showMoneyFormatter(this.estimatedPriceObj.total_convert, this.state.currency)} <Lang>{this.state.currency}</Lang></span>
                    </div>
                    {isSymbolFuture
                        ? <NoTag>
                            {dataAccount.exchange !== 'XLME'
                                ? <div className="rowOrderPad changeColorHover">
                                    <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_expiry_date</Lang></span>
                                    <span className='showTitle'>{this.parseExpiryDate(dataAccount.displayExpireDate, 2)}</span>
                                </div>
                                : null
                            }
                            <div className="rowOrderPad changeColorHover">
                                <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_first_notice_day</Lang></span>
                                <span className='showTitle'>{dataAccount.firstNoticeDay ? moment(dataAccount.firstNoticeDay).format('DD MMM YYYY') : '--'}</span>
                            </div>
                            <div className="rowOrderPad changeColorHover">
                                <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_contract_size</Lang></span>
                                <span className='showTitle'>{this.state.dataAccount.contractSize}</span>
                            </div>
                            <div className="rowOrderPad changeColorHover">
                                <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_unit</Lang></span>
                                <span className='showTitle capitalize'>{this.state.dataAccount.unitcommonity}</span>
                            </div>
                        </NoTag>
                        : null
                    }
                </div>
            </div>
        )
    }

    renderTableInfoOrderCancel() {
        const accountName = formatAccountName(this.state.dataAccount)
        const filledQuantity = this.state.dataAccount.filled_quantity || 0
        const data = formatFirstTransaction(this.state.firstTransaction)
        const accountId = formatAccountId(this.state.dataAccount)
        const displayExchange = this.state.dataAccount.display_exchange || getDisplayExchange(this.state.dataAccount)
        return (
            <div className='tableInfoOrder'>
                <div className='size--3'>
                    <div className='rowOrderPad changeColorHover'>
                        <span className='showTitle leftRowOrderPad'><Lang>lang_order_id_uppercase</Lang></span>
                        <span className='showTitle'>{this.state.dataAccount.display_order_id}</span>
                    </div>
                    {
                        accountId
                            ? <div className="rowOrderPad changeColorHover">
                                <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_account</Lang></span>
                                <span className='showTitle'>{accountName} ({accountId})</span>
                            </div>
                            : null
                    }
                    <div className="rowOrderPad changeColorHover">
                        <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_duration</Lang></span>
                        <span className='showTitle'><Lang>{tranferDuration(this.state.dataAccount.duration)}</Lang></span>
                    </div>
                    {this.state.dataAccount.duration === 'GTD'
                        ? <div className="rowOrderPad changeColorHover">
                            <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_date</Lang></span>
                            <span className='showTitle'>{formatExpireDate(this.state.dataAccount)}</span>
                        </div>
                        : null
                    }
                </div>
                <div>
                    <div className='rowOrderPad changeColorHover'>
                        <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_exchange</Lang></span>
                        <div className='showTitle textShow size--3'>
                            {displayExchange}
                        </div>
                    </div>
                    <div className='rowOrderPad changeColorHover'>
                        <span className='showTitle text-capitalize leftRowOrderPad text-overflow'><Lang>lang_original_order</Lang></span>
                        <span className='showTitle confirmItemRight text-overflow'>{data ? note(data) : '--'}</span>
                    </div>
                    <div className='rowOrderPad changeColorHover'>
                        <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_status</Lang></span>
                        <span className='showTitle text-capitalize'>{getActionType(this.state.dataAccount.order_status)}</span>
                    </div>
                    <div className='rowOrderPad changeColorHover'>
                        <span className='showTitle text-capitalize leftRowOrderPad'><Lang>lang_filled</Lang></span>
                        <span className='showTitle'>{filledQuantity}</span>
                    </div>
                </div>
            </div>
        )
    }

    disableButton() {
        return !this.state.isConnected || this.state.loadingConfirm || this.state.isShowWarning || (this.state.haveErrorOrder === false && this.state.isShowWarning);
    }

    render() {
        try {
            const conDisBtn = this.disableButton();
            const companyName = formatCompanyName(this.state.dataAccount)
            return (
                <div className={`confirmOrderContainer size--4`}>
                    <div className='newOrderRoot'>
                        <div className='body'>
                            <div id='Scroll_Root_NewOrder'>
                                <div className={`errorOrder size--3 ${this.state.haveErrorOrder ? '' : 'yellow'} ${this.state.isShowWarning ? '' : 'myHidden'}`}>
                                    {checkValidTranslation(this.state.errorOrder) ? <Lang>{this.state.errorOrder}</Lang> : this.state.errorOrder}
                                </div>
                                <div className='headerCompanyName size--4 showTitle'>
                                    {companyName}
                                    <div><SecurityDetailIcon {...this.props} symbolObj={this.state.dataAccount} /></div>
                                </div>
                                <div className='infoForOrder size--3'>
                                    <div className='first-gird'>{this.renderDescription()}</div>
                                    {
                                        this.typeConfirm === 'CANCEL_ORDER' ? this.renderTableInfoOrderCancel() : this.renderTableInfoOrderDefault()
                                    }
                                </div>
                            </div>
                        </div>
                        <div className='footer'>
                            <div className='line'></div>
                            <div className='confirmBtnRoot actionContainer size--4'>
                                <div className={`btn size--4 confirmBtnCancel ${!conDisBtn ? '' : 'disable'}`} onClick={() => {
                                    if (this.state.loadingConfirm) return;
                                    if (this.typeConfirm === 'CANCEL_ORDER') {
                                        this.props.saveState({
                                            needConfirm: false,
                                            stateOrder: 'DetailOrder',
                                            data: this.state.dataAccount,
                                            currency: this.props.currency
                                        })
                                    } else {
                                        this.props.saveState({
                                            needConfirm: false
                                        })
                                    }
                                }}>
                                    <span className='icon cancelBtn'><Icon src='navigation/close' /></span>
                                    <span className='showTitle text-uppercase'><Lang>lang_cancel</Lang></span>
                                </div>
                                <div className={`btn size--4 confirmBtnConfirm ${!conDisBtn && !this.disableConfirmButton ? '' : 'disable'}`} onClick={() => {
                                    if (conDisBtn) return
                                    if (this.disableConfirmButton) return
                                    if (!this.state.loadingConfirm) {
                                        requirePin(() => this.confirmOrder());
                                    }
                                }}>
                                    <span className='icon cancelConfirm'> {this.state.loadingConfirm ? <img src='common/Spinner-white.svg' /> : <Icon src='navigation/check' />}</span>
                                    <span className='showTitle text-uppercase'><Lang>lang_confirm</Lang></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } catch (error) {
            logger.error('render On ConfirmOrder' + error)
        }
    }

    componentWillUnmount() {
        this.emitConnectionID && this.emitConnectionID.remove();
        this.emitRefreshID && this.emitRefreshID.remove();
        unregisterAllOrders(this.realtimeData, 'order');
        if (this.intervalId) clearInterval(this.intervalId);
    }

    getAnAccount() {
        getData(getUrlAnAccount(this.account_id)).then(res => {
            this.setState({
                currency: res.data[0] && res.data[0].currency
            })
        })
    }
    componentDidMount() {
        registerAllOrders(this.realtimeData, 'order')
        this.getFirstTransaction();
        if (this.props.currency === 'needGetAccount') this.getAnAccount()
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
        this.emitRefreshID = this.accountRefresh && this.accountRefresh.addListener(eventEmitter.REFRESH_DATA_ACCOUNT, this.checkOrderExisted.bind(this));
    }

    checkOrderExisted(id) {
        let orderId;
        const state = this.props.loadState();
        if (this.typeConfirm !== orderEnum.CANCEL_ORDER && state && state.stateOrder === 'DetailOrder') return;
        let url = '';
        switch (this.typeConfirm) {
            case orderEnum.MODIFY_ORDER: case orderEnum.CANCEL_ORDER:
                orderId = this.state.dataAccount.broker_order_id;
                url = getUrlOrderResponseLatest(orderId)
                break;
            case orderEnum.NEW_ORDER:
                orderId = this.clientOrderId
                url = getUrlOrderResponseLatest(orderId, true)
                break;
            default: break;
        }
        orderId && url && getData(url).then(response => {
            if (response && response.data && response.data.length && response.data[0]) {
                const text = JSON.parse(response.data[0].text)
                const updated = response.data[0].updated ? new Date(response.data[0].updated).getTime() : null;
                logger.sendLog('receive order result: ' + id + ' ' + updated + ' ' + this.lastClick + ' ' + JSON.stringify(response.data));
                // if (!updated || updated <= this.lastClick) return;
                this.realtimeData(response.data[0], {}, text.title || '')
            } else {
                // this.getFirstTransaction();
            }
        }).catch(error => {
            logger.sendLog('checkOrderExisted comfirmorder error')
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data && nextProps.data.typeConfirm && nextProps.data.typeConfirm === 'CANCEL_ORDER') {
            if (nextProps.data.dataAccount) {
                this.typeConfirm = nextProps.data.typeConfirm
                this.setState({
                    dataAccount: nextProps.data.dataAccount
                })
            }
        }
    }
}

export default ConfirmOrder
