import React from 'react';
import logger from '../../helper/log';
import {
    getData,
    getUrlOrderResponseLatest,
    deleteData,
    makePlaceOrderUrl,
    makePriceLevel1UrlNew,
    getRealtimePriceUrlNew,
    requirePin
} from '../../helper/request';
import Flag from '../Inc/Flag';
import Lang from '../Inc/Lang';
import { translate } from 'react-i18next';
import {
    changeColorBySide,
    formatSide,
    formatDisplayName,
    formatAccountName,
    formatAccountId,
    formatExpireDate,
    formatDisplayExchange,
    formatVolume,
    formatFilledQuantity,
    formatOrderType,
    tranferDuration,
    getActionType,
    checkValidTranslation,
    mapContentWarning,
    mapError,
    isJsonString,
    formatLimitPrice,
    formatStopPrice, isAUSymbol, formatNumberPrice, formatNumberValue, checkRole
} from '../../helper/functionUtils'
import { unregisterAllOrders, registerAllOrders, registerUser, unregisterUser } from '../../streaming';
import { emitter, eventEmitter } from '../../constants/emitter_enum';
import Confirm from '../Inc/Confirm';
import dataStorage from '../../dataStorage';
import { func } from '../../storage';
import s from '../OrderPadV2/OrderPad.module.css';
import Icon from '../Inc/Icon';
import { regisRealtime, unregisRealtime } from '../../helper/streamingSubscriber';
import sideEnum from '../../constants/enum';
import orderEnum from '../../constants/order_enum';
import MapRoleComponent from '../../constants/map_role_component'

const TIMEOUT_DEFAULT = 60 * 1000 * 2;
class QuickCancelOrder extends React.Component {
    constructor(props) {
        super(props);
        this.data = props.state.data.data
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION)
        this.accountRefresh = func.getStore(emitter.STREAMING_ACCOUNT_DATA);
        this.state = ({
            errorOrder: '',
            isConnected: dataStorage.connected
        })
    }

    componentWillUnmount() {
        this.closeConfirm && this.closeConfirm();
        this.emitConnectionID && this.emitConnectionID.remove();
        this.emitRefreshID && this.emitRefreshID.remove();
        unregisterUser(dataStorage.userInfo.user_id, this.settingChanged, 'user_setting');
        unregisterAllOrders(this.realtimeData, 'order');
        unregisRealtime({
            callback: this.realtimePrice
        });
        if (this.intervalId) clearInterval(this.intervalId);
    }
    settingChanged = (setting) => {
        if (!this.contingent && setting && setting.hasOwnProperty('checkQuickOrderPad') && !setting.checkQuickOrderPad) {
            requirePin(() => {
                dataStorage.goldenLayout.addComponentToStack('Order', {
                    stateOrder: 'DetailOrder',
                    data: { data: this.data },
                    needConfirm: true,
                    dataConfirm: { typeConfirm: orderEnum.CANCEL_ORDER, dataAccount: this.data },
                    currency: '--'
                });
            });
            this.props.close()
        }
    }

    componentDidMount() {
        this.fetchPrice(this.data);
        registerAllOrders(this.realtimeData, 'order')
        registerUser(dataStorage.userInfo.user_id, this.settingChanged, 'user_setting');
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
        this.emitRefreshID = this.accountRefresh && this.accountRefresh.addListener(eventEmitter.REFRESH_DATA_ACCOUNT, this.checkOrderExisted.bind(this));
    }

    changeConnection = (isConnected) => {
        if (!isConnected !== !this.state.isConnected) {
            this.setState({ isConnected })
        }
    }

    showConfirm = () => {
        if (this.state.isLoading || !this.state.isConnected) return
        let mess = 'lang_ask_cancel_order'
        Confirm({
            checkWindowLoggedOut: true,
            header: 'lang_confirm',
            message: mess,
            checkConnect: true,
            callback: () => {
                this.confirmOrder()
            },
            cancelCallback: () => {
                logger.log('cancel confirmOrder')
            },
            init: closeFn => this.closeConfirm = closeFn
        })
    }

    confirmOrder = () => {
        try {
            this.setState({
                errorOrder: mapContentWarning(false, 'CANCEL_ORDER'),
                waiting: true,
                isLoading: true
            })
            this.timeoutRequestOrder = setTimeout(() => {
                this.setState({
                    errorOrder: 'lang_timeout_cannot_be_connected_server',
                    waiting: false,
                    isLoading: false
                })
            }, TIMEOUT_DEFAULT)
            this.listenerCancelOrder(this.data.broker_order_id)
        } catch (error) {
            logger.error('confirmOrder On ConfirmOrder' + error)
        }
    }

    listenerCancelOrder(brokerOrderId) {
        const urlCancel = makePlaceOrderUrl(`/${brokerOrderId || ''}`)
        deleteData(urlCancel)
            .then(response => {
                this.handleResponseOrder(response)
            })
            .catch(error => {
                logger.error(error)
                this.handleError(error)
            })
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
                    errorOrder: mapError(errorString, 'CANCEL_ORDER'),
                    isLoading: false
                })
            }
        }
    }

    checkOrderExisted(id) {
        let orderId;
        let url = '';
        orderId = this.data.broker_order_id;
        url = getUrlOrderResponseLatest(orderId)
        orderId && url && getData(url).then(response => {
            if (response && response.data && response.data.length && response.data[0]) {
                const text = JSON.parse(response.data[0].text)
                const updated = response.data[0].updated ? new Date(response.data[0].updated).getTime() : null;
                logger.sendLog('receive order result: ' + id + ' ' + updated + ' ' + this.lastClick + ' ' + JSON.stringify(response.data));
                this.realtimeData(response.data[0], {}, text.title || '')
            }
        }).catch(error => {
            logger.sendLog('checkOrderExisted comfirmorder error')
        })
    }

    realtimeData = (dataObj, data, title) => {
        if ((dataObj.account_id && formatAccountId(this.data) !== dataObj.account_id) || !data) return
        if (this.data.broker_order_id) {
            if (dataObj.broker_order_id !== this.data.broker_order_id) return;
        }
        if (!title) return;
        if (/#TIMEOUT$/.test(title)) {
            if (this.timeoutRequestOrder) clearTimeout(this.timeoutRequestOrder)
            if (this.isRejected) return
            this.setState({
                errorOrder: 'lang_timeout_cannot_be_connected_server',
                waiting: false
            })
        }
        if (/#SUCCESS$/.test(title)) {
            if (this.intervalId) clearInterval(this.intervalId);
            this.setState({
                errorOrder: mapContentWarning(true, 'CANCEL_ORDER'),
                waiting: true,
                isLoading: false
            }, () => this.hiddenWarning(true))
            // return
        }
        if (/#REJECT$/.test(title)) {
            if (this.intervalId) clearInterval(this.intervalId);
            if (this.timeoutRequestOrder) clearTimeout(this.timeoutRequestOrder)
            const dataParser = dataObj.text && isJsonString(dataObj.text);
            const text = dataParser ? dataParser.text : dataObj.text;
            const errorString = mapError(text || dataObj.reject_reason, 'CANCEL_ORDER');
            this.isRejected = true;
            this.setState({
                errorOrder: errorString,
                waiting: false,
                isLoading: false
            })
        }
    }

    handleError = (error) => {
        let errorString = 'Error'
        if ((error.response && error.response.data && error.response.data.errorCode) || (error.response && error.response.errorCode)) {
            if (error.response.data) errorString = error.response.data.errorCode
            errorString = error.response.errorCode
        }
        this.setState({
            errorOrder: mapError(errorString, 'CANCEL_ORDER'),
            waiting: false
        })
    }

    hiddenWarning(closeForm) {
        try {
            setTimeout(() => {
                this.setState({
                    errorOrder: '',
                    waiting: false
                })
                if (closeForm) this.props.close()
            }, 4000)
        } catch (error) {
            logger.error('hiddenWarning On NewOrder ' + error)
        }
    }

    disableError = () => {
        if (this.state.errorOrder && !this.state.waiting) {
            this.errClass = ''
            this.setState({ errorOrder: '' })
        }
    }

    scrollRoot() {
        const errorOrder = this.state.errorOrder;
        const domScroll = this.dom
        if (errorOrder) {
            domScroll && (domScroll.scrollTop = 0)
        }
        if (typeof errorOrder === 'string') {
            if (checkValidTranslation(errorOrder)) {
                return <Lang>{errorOrder}</Lang>
            } else {
                return errorOrder
            }
        }
        return errorOrder
    }
    realtimePrice = (obj) => {
        this.priceObj = obj.quote;
        this.updatePrice();
    }
    updatePrice = (symbolChanged) => {
        if (!this.dom || !this.priceObj) return;
        if (symbolChanged || !this.priceObjOld) this.priceObjOld = {};
        const domPrice = this.dom.querySelector('.' + s.price);
        const domPercent = this.dom.querySelector('.' + s.percent);
        if (domPrice) {
            domPrice.innerText = formatNumberPrice(this.priceObj.trade_price, true);
            let oldValue = this.priceObjOld.trade_price;
            if (oldValue !== this.priceObj.trade_price) {
                if (oldValue === undefined || this.priceObj.trade_price > oldValue) {
                    domPrice.classList.remove('priceDown');
                    domPrice.classList.add('priceUp');
                } else if (this.priceObj.trade_price < oldValue) {
                    domPrice.classList.remove('priceUp');
                    domPrice.classList.add('priceDown');
                }
                if (domPrice.classList.contains('flash')) {
                    domPrice.classList.remove('flash');
                    domPrice.classList.add('flash2');
                } else {
                    domPrice.classList.remove('flash2');
                    domPrice.classList.add('flash');
                }
                domPrice.title = this.priceObj.trade_price;
                this.priceObjOld.trade_price = this.priceObj.trade_price;
            }
        }
        if (domPercent) {
            domPercent.innerText = '(' + formatNumberValue(this.priceObj.change_percent, true) + '%)';
            if (this.priceObj.change_percent > 0) {
                domPercent.classList.add('priceUp')
                domPercent.classList.remove('priceDown')
                domPercent.setAttribute('title', formatNumberValue(this.priceObj.change_percent, true) + '%');
            } else if (this.priceObj.change_percent < 0) {
                domPercent.classList.add('priceDown')
                domPercent.classList.remove('priceUp')
            } else {
                domPercent.className = '';
            }
            domPercent.title = formatNumberValue(this.priceObj.change_percent, true) + '%';
        }
    }
    fetchPrice = (symbolObj) => {
        const decode = encodeURIComponent(symbolObj.symbol);
        const exc = symbolObj.exchange;
        const urlObj = makePriceLevel1UrlNew(decode, exc, true);
        const url = urlObj.normal || urlObj.delayed;
        unregisRealtime({
            callback: this.realtimePrice
        });
        regisRealtime({
            url: getRealtimePriceUrlNew(`price/${decode}${isAUSymbol(symbolObj) && exc === 'ASX' ? ('.' + exc) : ''}`, symbolObj),
            callback: this.realtimePrice
        });
        if (url) {
            getData(url)
                .then(res => {
                    this.priceObj = (res.data && res.data[0] && res.data[0].quote) || (res.data && res.data[0]);
                    this.updatePrice()
                })
                .catch(error => {
                    logger.error(error);
                    delete this.priceObj;
                    this.updatePrice()
                })
        }
    }
    showSymbolInfo = () => {
        if (!this.data.symbol || !checkRole(MapRoleComponent.SecurityDetail)) return;
        dataStorage.goldenLayout.addComponentToStack('SecurityDetail', {
            needConfirm: false,
            data: { symbolObj: this.data }
        })
    }
    render() {
        const data = this.data
        return (
            <div className={`detailOrder newOrderRoot`} ref={dom => this.dom = dom} onClick={() => this.disableError()}>
                {this.props.state.custom
                    ? <div className={s.header} ref={dom => dom && this.props.setHeader && this.props.setHeader(dom)}>
                        <div className={s.headerContent + ' ' + s.symbolText}>
                            <div className={s.headerSymbolCancel}>
                                {data.display_name}
                            </div>
                            <div><span className={s.price}>--</span><span className={s.percent}>(--)</span></div>
                        </div>
                        <div>
                            {data.symbol && checkRole(MapRoleComponent.SecurityDetail) ? <span onClick={this.showSymbolInfo}><Icon color={'#666b77'} src={'action/info-outline'} style={{ height: '16px', width: '16px' }} /></span> : null}
                            <span onClick={this.props.close}><Icon color={'#666b77'} src={'navigation/close'} style={{ height: '16px', width: '16px' }} /></span>
                        </div>
                    </div> : null}
                <div className='body text-capitalize'>
                    <div id='Scroll_Root_NewOrder'>
                        <div style={{ overflow: 'hidden' }}>
                            <div className={`errorOrder size--3 ${this.state.errorOrder ? '' : 'myHidden'} ${this.state.waiting ? 'yellow' : ''}`}>{this.scrollRoot()}</div>
                            <div className='detailOrderContainer'>
                                <div>
                                    <div className='myRow changeColorHover'>
                                        <div className='showTitle leftRowOrderPad size--3 text-capitalize'><Lang>lang_account</Lang></div>
                                        <div className='showTitle padding-left8'>
                                            {formatAccountName(data)} ({formatAccountId(data)})
                                        </div>
                                    </div>
                                    {this.props.state.custom ? null : <div className='myRow changeColorHover'>
                                        <div className='showTitle leftRowOrderPad size--3 text-capitalize'><Lang>lang_code</Lang></div>
                                        <div className='showTitle symbol'>
                                            {formatDisplayName(data)}
                                            {<Flag symbolObj={data} />}
                                        </div>
                                    </div>}
                                    <div className='myRow changeColorHover'>
                                        <div className='showTitle leftRowOrderPad size--3 text-capitalize'><Lang>lang_side</Lang></div>
                                        <div>
                                            <span style={changeColorBySide(formatSide(data))}>
                                                <Lang>{formatSide(data)}</Lang>
                                            </span>
                                        </div>
                                    </div>
                                    <div className='myRow changeColorHover'>
                                        <div className='showTitle leftRowOrderPad size--3 text-capitalize'><Lang>lang_order_type</Lang></div>
                                        <div className='showTitle ellipsis text-capitalize'>{formatOrderType(data)}</div>
                                    </div>
                                    {
                                        this.data.order_type === 'STOPLIMIT_ORDER' || this.data.order_type === 'STOP_ORDER'
                                            ? <div className='myRow changeColorHover'>
                                                <div className='showTitle leftRowOrderPad size--3 text-capitalize '><Lang>lang_trigger_price</Lang></div>
                                                <div className='showTitle'>{formatStopPrice(data)}</div>
                                            </div>
                                            : null
                                    }
                                    <div className='myRow changeColorHover'>
                                        <div className='showTitle leftRowOrderPad size--3 text-capitalize'><Lang>lang_limit_price</Lang> </div>
                                        <div className='showTitle'>{formatLimitPrice(data)}</div>
                                    </div>
                                    <div className='myRow changeColorHover'>
                                        <div className='showTitle leftRowOrderPad size--3 text-capitalize'><Lang>lang_quantity_ordered</Lang> </div>
                                        <div className='showTitle'>{formatVolume(data)}</div>
                                    </div>
                                    <div className='myRow changeColorHover'>
                                        <div className='showTitle leftRowOrderPad size--3 text-capitalize'><Lang>lang_quantity_filled</Lang> </div>
                                        <div className='showTitle'>{formatFilledQuantity(data)}</div>
                                    </div>
                                    <div className="myRow changeColorHover">
                                        <span className='showTitle leftRowOrderPad text-capitalize'><Lang>lang_duration</Lang></span>
                                        <span className='showTitle'><Lang>{tranferDuration(this.data.duration)}</Lang></span>
                                    </div>
                                    {this.data.duration === 'GTD'
                                        ? <div className="myRow changeColorHover">
                                            <span className='showTitle leftRowOrderPad text-capitalize'><Lang>lang_date</Lang></span>
                                            <span className='showTitle'>{formatExpireDate(this.data)}</span>
                                        </div>
                                        : null
                                    }
                                    <div className='myRow changeColorHover'>
                                        <span className='showTitle leftRowOrderPad text-capitalize'><Lang>lang_exchange</Lang></span>
                                        <div className='showTitle textShow size--3'>
                                            {formatDisplayExchange(this.data)}
                                        </div>
                                    </div>
                                    <div className='myRow changeColorHover'>
                                        <span className='showTitle leftRowOrderPad text-capitalize'><Lang>lang_status</Lang></span>
                                        <span className='showTitle text-capitalize'>{getActionType(this.data.order_status)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='footer'>
                    <div className='line'></div>
                    <div className='actionContainer btn-group fs15 size--4'>
                        <div className={`cancelOrderBtn btn ${(this.state.errorOrder || !this.state.isConnected) ? 'disable' : ''}`} onClick={() => this.showConfirm()}>
                            <span className='flex text-uppercase'>{this.state.isLoading ? <img src='common/Spinner-white.svg' className='padding-right8' /> : null}<Lang>lang_cancel_order</Lang></span>
                        </div>
                    </div>
                </div>
                {/* end .footer */}
            </div>
        )
    }
}

export default (translate('translations')(QuickCancelOrder));
