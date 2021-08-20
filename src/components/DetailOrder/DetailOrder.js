import React from 'react';
import logger from '../../helper/log';
import orderEnum from '../../constants/order_enum';
import { getData, getUrlOrderDetailByTag, requirePin, getUrlOrderById, getUrlOrderByNumber, makeSymbolUrl, getUrlAnAccount } from '../../helper/request';
import Flag from '../Inc/Flag';
import Lang from '../Inc/Lang';
import { translate } from 'react-i18next'
import dataStorage from '../../dataStorage';
import SecurityDetailIcon from '../Inc/SecurityDetailIcon/SecurityDetailIcon'
import listOrderRetailView from '../../constants/listOrderRetailView'
import listOrderRetailWebSV from '../../constants/listOrderRetailWebSV'

import {
    convertObjToArray,
    clone,
    changeColorBySide,
    checkRole,
    mapData,
    getAnAccountInfo,
    formatSide,
    formatDisplayName,
    formatExchange,
    formatCompanyName,
    formatAccountName,
    formatAccountId,
    formatExpireDate,
    formatDisplayExchange,
    formatLimitPrice,
    formatStopPrice,
    formatVolume,
    formatInitTime,
    formatFilledQuantity,
    formatFilledPrice,
    formatOrderType,
    formatOrderField,
    formatEstTotalAud,
    formatDuration,
    formatDisplayOrderId,
    formatRejectReason,
    formatmasterCode,
    formatmasterName,
    getOrigination,
    formatinitialMargin,
    formatmaintenanceMargin,
    formatparentOrderNumber,
    formatDestination,
    formatEstimatedValueWebSV,
    formatovernightMargin,
    formatproduct,
    formatParentOrderId,
    parseJSON,
    convertEmptyObjectToNull,
    isAUSymbol,
    showMoneyFormatter,
    getDisplayExchange
} from '../../helper/functionUtils'
import orderState from '../../constants/order_state';
import { registerAccount, unregisterAccount, unregisterUser, registerUser } from '../../streaming';
import actionType from '../../constants/action_type_enum';
import { func } from '../../storage';
import { emitter, eventEmitter } from '../../constants/emitter_enum';
import OrderHistoryDetail from '../OrderHistoryDetail'
import OrderHistoryDetailWebSV from '../OrderHistoryDetailWebSV'
import uuidv4 from 'uuid/v4';
import MapRoleComponent from '../../constants/map_role_component';
import sideEnum from '../../constants/enum';
import moment from 'moment-timezone';
class DetailOrder extends React.Component {
    constructor(props) {
        super(props);
        this.checkOrderStatusByNoti = func.getStore(emitter.CHECK_ORDER_STATUS);
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.accountRefresh = func.getStore(emitter.STREAMING_ACCOUNT_DATA);
        this.accountId = null;
        this.isConnected = dataStorage.connected;
        this.isAllOrderWebSV = props.data.order_number
        this.state = {
            data: props.data || {},
            listOrder: [],
            connectedAgain: dataStorage.connected
        }
        this.realtimeData = this.realtimeData.bind(this);
        this.realTimeDataUser = this.realTimeDataUser.bind(this)
        this.getAnAccount = this.getAnAccount.bind(this)
    }

    renderOrderHistory() {
        const listOrder = this.state.listOrder.sort((a, b) => {
            if (b.seq_num === a.seq_num) return b.updated - a.updated;
            return b.seq_num - a.seq_num;
        });
        const data = (this.state.data || {})
        const listState = data.passed_state && parseJSON(data.passed_state);
        this.triggered = (Array.isArray(listState) && (listState.indexOf('TRIGGER') > -1 || listState.indexOf('TRIGGERED') > -1 || listState.indexOf('Triggered') > -1)) || data.order_state === 'TRIGGERED'
        const code = this.state.data.symbol;
        let conditionName = null;
        if (listOrder.length > 0) {
            conditionName = (listOrder[0] || {}).condition_name;
        }
        const listOrderRender = [];
        listOrder.map((item, index) => {
            if (dataStorage.userInfo.user_type === 'operation' || listOrderRetailView.indexOf(item.order_status) > -1) {
                listOrderRender.push(
                    <OrderHistoryDetail {...this.props}
                        key={uuidv4()}
                        conditionName={conditionName}
                        code={code}
                        data={item}
                        accountId={dataStorage.account_id}
                        prev={listOrder[index + 1]} />)
            }
        })
        return listOrderRender;
    }
    renderOrderHistoryWebSV() {
        const listOrder = this.state.listOrder;
        const code = this.state.data.symbol;
        let conditionName = null;
        if (listOrder.length > 0) {
            conditionName = (listOrder[0] || {}).condition_name;
        }
        const listOrderRender = [];
        listOrder.map((item, index) => {
            if (listOrderRetailWebSV.indexOf(item.order_status) > -1) {
                listOrderRender.push(
                    <OrderHistoryDetailWebSV {...this.props}
                        key={uuidv4()}
                        conditionName={conditionName}
                        code={code}
                        data={item}
                        accountId={dataStorage.account_id}
                        prev={listOrder[index + 1]} />)
            }
        })
        return listOrderRender;
    }

    checkDisableButton() {
        const params = this.state;
        const isChildOrderId = params.data && params.data.origin_broker_order_id && params.data.origin_broker_order_id !== params.data.broker_order_id
        if (!params.data.symbol) return
        if (params.data.order_status === orderState.FILLED ||
            params.data.order_status === orderState.EXPIRED ||
            params.data.order_status === orderState.REJECTED ||
            params.data.order_status === orderState.UNKNOWN ||
            params.data.order_status === orderState.CANCELLED ||
            params.data.order_status === orderState.PENDING_CANCEL
        ) {
            return 'disableModifyCancelOrderDetail'
        }
        let className = ''
        let disable
        const state = dataStorage.accountsObjDic[params.data.account_id] && dataStorage.accountsObjDic[params.data.account_id].state ? dataStorage.accountsObjDic[params.data.account_id].state : 'active';
        disable = !(state === 'active');
        if (disable || !this.isConnected || isChildOrderId) {
            className = 'disableModifyCancelOrderDetail';
        }
        if ([orderState.FILLED, orderState.CANCELLED, orderState.REJECTED, orderState.REJECTED, orderState.PENDING_CANCEL].indexOf(params.data.order_status) > -1) {
            className = 'disableModifyCancelOrderDetail';
        }
        if ([orderState.PENDING_REPLACE].indexOf(params.data.order_status) > -1 || this.triggered) {
            className = 'disableModifyOrderDetail';
        }
        return className
    }

    render() {
        const data = this.state.data || {}
        const unit = this.state.unit || '--'
        const isSymbolFuture = data.class === 'future';
        const exchangeObj = getDisplayExchange(data)
        const orderAction = (data.order_action && parseJSON(data.order_action)) || {};
        if (this.state.connectedAgain === false) this.isDisabledClass = 'disabled';
        if (data && data.origination === 201) this.isDisabledClass = 'disabled';
        try {
            return (
                <div className={`detailOrder newOrderRoot ${this.checkDisableButton()}`} ref={dom => this.bodyDom = dom}>
                    <div className='body'>
                        <div id='Scroll_Root_NewOrder'>
                            <div className=' headerCompanyName size--4'>
                                <div className='showTitle size--4' >
                                    {formatCompanyName(data)}
                                </div>
                                <SecurityDetailIcon {...this.props} symbolObj={data} />
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div className='detailOrderContainer'>
                                    <div>
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle leftRowOrderPad size--3'><Lang>lang_order_id_uppercase</Lang></div>
                                            <div className='showTitle ellipsis'>{formatDisplayOrderId(data)}</div>
                                        </div>
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_origination</Lang></div>
                                            <div className='showTitle ellipsis'>{getOrigination(data.origination)}</div>
                                        </div>
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_destination</Lang></div>
                                            <div className='showTitle ellipsis'>{formatDestination(data)}</div>
                                        </div>
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_entry_time</Lang></div>
                                            <div className='showTitle ellipsis'>{(this.isAllOrderWebSV && data.init_time) ? moment(data.init_time).tz('GMT').format('DD MMM YYYY HH:mm:ss') : formatInitTime(data, dataStorage.timeZone)}</div>
                                        </div>
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_account</Lang></div>
                                            <div className='showTitle ellipsis'>
                                                {formatAccountName(data)} ({formatAccountId(data)})
                                            </div>
                                        </div>
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_side</Lang></div>
                                            <div>
                                                <span className='text-uppercase' style={changeColorBySide(formatSide(data))}>
                                                    <Lang>{data.is_buy === 0 ? 'lang_sell' : 'lang_buy'}</Lang>
                                                </span>
                                            </div>
                                        </div>
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_code</Lang></div>
                                            <div className='showTitle symbol'>
                                                {formatDisplayName(data)}
                                                {<Flag symbolObj={data} />}
                                            </div>
                                        </div>
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_security</Lang></div>
                                            <div className='showTitle ellipsis'>{formatCompanyName(data)}</div>
                                        </div>
                                        {isSymbolFuture
                                            ? <div className='myRow changeColorHover'>
                                                <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_master_code</Lang></div>
                                                <div className='showTitle symbol'>{formatmasterCode(data)}
                                                    {data.display_master_code === 'null' ? '' : <Flag symbolObj={data} />}
                                                </div>
                                            </div>
                                            : null
                                        }
                                        {isSymbolFuture
                                            ? <div className='myRow changeColorHover'>
                                                <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_master_name</Lang></div>
                                                <div className='showTitle ellipsis'>{formatmasterName(data)}</div>
                                            </div>
                                            : null
                                        }
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_product</Lang></div>
                                            <div className='showTitle ellipsis uppercase'><Lang>{formatproduct(this.symbolObj)}</Lang></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_quantity</Lang> </div>
                                            <div className='showTitle'>{formatVolume(data)}</div>
                                        </div>
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_filled</Lang></div>
                                            <div className='showTitle'>{formatFilledQuantity(data)}</div>
                                        </div>
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_order_type</Lang></div>
                                            <div className='showTitle ellipsis text-capitalize'>{formatOrderType(data)}</div>
                                        </div>
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_trigger_price</Lang></div>
                                            <div className='showTitle'>{formatStopPrice(data)}</div>
                                        </div>
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_limit_price</Lang></div>
                                            <div className='showTitle'>{formatLimitPrice(data)}</div>
                                        </div>
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_filled_price</Lang></div>
                                            <div className='showTitle'>{formatFilledPrice(data)}</div>
                                        </div>
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_duration</Lang></div>
                                            <div className='showTitle ellipsis'>{formatDuration(data)}</div>
                                        </div>
                                        {
                                            data.duration === 'GTD'
                                                ? <div className='myRow changeColorHover'>
                                                    <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_date</Lang></div>
                                                    <div className='showTitle ellipsis'>{formatExpireDate(data)}</div>
                                                </div>
                                                : null
                                        }
                                        <div className='myRow changeColorHover'>
                                            <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_exchange</Lang></div>
                                            {this.isAllOrderWebSV
                                                ? <div className='showTitle ellipsis'>{formatExchange(data)}</div>
                                                : <div className='showTitle ellipsis'>{exchangeObj}</div>}
                                        </div>
                                        {
                                            [
                                                orderState.CANCELLED,
                                                orderState.EXPIRED,
                                                orderState.REJECTED,
                                                orderState.UNKNOWN
                                            ].indexOf(this.state.data.order_status) > -1 || !isSymbolFuture
                                                ? null
                                                : <div className='myRow changeColorHover'>
                                                    <div className='showTitle text-capitalize leftRowOrderPad size--3'>{data.filled_price ? <Lang>lang_initial_margin_reserved</Lang> : <Lang>lang_initial_margin_impact</Lang>} {' (' + unit + ')'}</div>
                                                    <div className='showTitle'>{formatinitialMargin(data, unit)} {unit}</div>
                                                </div>
                                        }
                                        {
                                            [
                                                orderState.CANCELLED,
                                                orderState.EXPIRED,
                                                orderState.REJECTED,
                                                orderState.UNKNOWN
                                            ].indexOf(this.state.data.order_status) > -1 || !isSymbolFuture
                                                ? null
                                                : <div className='myRow changeColorHover'>
                                                    <div className='showTitle text-capitalize leftRowOrderPad size--3'>{data.filled_price ? <Lang>lang_maintenance_margin_reserved</Lang> : <Lang>lang_maintenance_margin_impact</Lang>}{' (' + unit + ')'}</div>
                                                    <div className='showTitle'>{formatmaintenanceMargin(data, unit)} {unit}</div>
                                                </div>
                                        }
                                        {
                                            !dataStorage.env_config.roles.showAdditionalFees || [
                                                orderState.CANCELLED,
                                                orderState.EXPIRED,
                                                orderState.REJECTED,
                                                orderState.UNKNOWN
                                            ].indexOf(this.state.data.order_status) > -1
                                                ? null
                                                : <div className='myRow changeColorHover'>
                                                    <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_fees</Lang>{' (' + unit + ')'}</div>
                                                    <div className='showTitle'>{formatOrderField(data, 'fees', unit)} {unit}</div>
                                                </div>
                                        }
                                        {
                                            !dataStorage.env_config.roles.showAdditionalFees || [
                                                orderState.CANCELLED,
                                                orderState.EXPIRED,
                                                orderState.REJECTED,
                                                orderState.UNKNOWN
                                            ].indexOf(this.state.data.order_status) > -1 || !orderAction.gst
                                                ? null
                                                : <div className='myRow changeColorHover'>
                                                    <div className='showTitle text-uppercase leftRowOrderPad size--3'><Lang>lang_gst</Lang> (10%) {' (' + unit + ')'}</div>
                                                    <div className='showTitle'>{showMoneyFormatter(orderAction.gst || 0, unit)} {unit}</div>
                                                </div>
                                        }
                                        {
                                            [
                                                orderState.CANCELLED,
                                                orderState.EXPIRED,
                                                orderState.REJECTED,
                                                orderState.UNKNOWN
                                            ].indexOf(this.state.data.order_status) > -1
                                                ? null
                                                : <div className='myRow changeColorHover'>
                                                    <div className='showTitle text-capitalize leftRowOrderPad size--3'>{([orderState.FILLED].indexOf(this.state.data.order_status) > -1) ? <Lang>lang_total_fees</Lang> : <Lang>lang_estimated_fees</Lang>}{' (' + unit + ')'}</div>
                                                    <div className='showTitle'>{formatOrderField(data, 'estimated_fees', unit)} {unit}</div>
                                                </div>
                                        }
                                        {
                                            [
                                                orderState.CANCELLED,
                                                orderState.EXPIRED,
                                                orderState.REJECTED,
                                                orderState.UNKNOWN
                                            ].indexOf(this.state.data.order_status) > -1
                                                ? null
                                                : <div className='myRow changeColorHover'>
                                                    <div className='showTitle text-capitalize leftRowOrderPad size--3'>{([orderState.FILLED].indexOf(this.state.data.order_status) > -1) ? <Lang>lang_total</Lang> : <Lang>lang_estimated_total</Lang>}{' (' + unit + ')'}</div>
                                                    <div className='showTitle'>{this.isAllOrderWebSV ? formatEstimatedValueWebSV(data, unit) : formatEstTotalAud(data, unit)} {unit}</div>
                                                </div>
                                        }
                                        {
                                            [
                                                orderState.CANCELLED,
                                                orderState.EXPIRED,
                                                orderState.REJECTED,
                                                orderState.UNKNOWN
                                            ].indexOf(this.state.data.order_status) > -1
                                                ? <div className='myRow changeColorHover'>
                                                    <div className='showTitle text-capitalize leftRowOrderPad size--3'><Lang>lang_reason</Lang></div>
                                                    <div className='showTitle detail-order-reject-reason'>{formatRejectReason(data)}</div>
                                                </div>
                                                : null
                                        }
                                        {
                                            [
                                                orderState.CANCELLED,
                                                orderState.EXPIRED,
                                                orderState.REJECTED,
                                                orderState.UNKNOWN
                                            ].indexOf(this.state.data.order_status) > -1
                                                ? <div className='myRow'></div>
                                                : null
                                        }
                                        <div className='myRow changeColorHover'>
                                        </div>
                                    </div>
                                </div>
                                <div className='detailOrderContainer detailOrderHistory'>
                                    {this.isAllOrderWebSV ? this.renderOrderHistoryWebSV() : this.renderOrderHistory()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='footer'>
                        <div className='line'></div>
                        {this.isAllOrderWebSV ? null
                            : <div className='actionContainer btn-group fs15 size--4'>
                                <div className={`cancelOrderBtn btn btn-dask ${['disableModifyCancelOrderDetail', 'disableModifyOrderDetail'].indexOf(this.checkDisableButton()) > -1 ? 'noHover' : ''} ${checkRole(MapRoleComponent.CANCEL_BUTTON_ORDER_DETAIL) ? '' : 'disable'} ${this.isDisabledClass}`} onClick={() => {
                                    if (!checkRole(MapRoleComponent.CANCEL_BUTTON_ORDER_DETAIL)) return
                                    if (this.isDisabledClass === 'disabled') return;
                                    if (['disableModifyCancelOrderDetail', 'disableCancelOrderDetail'].indexOf(this.checkDisableButton()) > -1) return
                                    !this.isDisabledClass && requirePin(() => this.handleCancelOrder())
                                }} title={`${dataStorage.translate('lang_cancel_order').toCapitalize()}`}>
                                    <img className='icon' src='common/cart-off.svg' />
                                    <span className='text-uppercase'><Lang>lang_cancel_order</Lang></span>
                                </div>
                                <div className={`modifyOrderBtn btn btn-dask ${['disableModifyCancelOrderDetail', 'disableModifyOrderDetail'].indexOf(this.checkDisableButton()) > -1 ? 'noHover' : ''}  ${checkRole(MapRoleComponent.MODIFY_BUTTON_ORDER_DETAIL) ? '' : 'disable'} ${this.isDisabledClass}`} onClick={() => {
                                    if (!checkRole(MapRoleComponent.MODIFY_BUTTON_ORDER_DETAIL)) return
                                    if (this.isDisabledClass === 'disabled') return;
                                    if (['disableModifyCancelOrderDetail', 'disableModifyOrderDetail'].indexOf(this.checkDisableButton()) > -1) return
                                    !this.isDisabledClass && requirePin(() => this.handleModifyOrder())
                                }} title={`${dataStorage.translate('lang_modify_order').toCapitalize()}`}>
                                    <img className='icon' src='common/contrast.svg' />
                                    <span className='text-uppercase'><Lang>lang_modify_order</Lang></span>
                                </div>
                                <div className={`newOrderBtn btn ${checkRole(MapRoleComponent.NEW_ORDER_BUTTON_ORDER_DETAIL) ? '' : 'disable'} ${this.isDisabledClass}`} onClick={() => {
                                    if (!checkRole(MapRoleComponent.NEW_ORDER_BUTTON_ORDER_DETAIL)) return
                                    !this.isDisabledClass && requirePin(() => this.handleNewOrder())
                                }} title={`${dataStorage.translate('lang_new_order').toCapitalize()}`}>
                                    <img className='icon' src='common/cart-plus.svg' />
                                    <span className='text-uppercase'><Lang>lang_new_order</Lang></span>
                                </div>
                            </div>}
                    </div>
                </div>
            )
        } catch (error) {
            logger.error('render On DetailOrder' + error)
        }
    }

    handleCancelOrder() {
        if (checkRole(MapRoleComponent.QUICK_ORDER_PAD)) {
            if ((checkRole(MapRoleComponent.QUICK_ORDER_PAD) && !checkRole(MapRoleComponent.NORMAL_ORDER_PAD)) || (checkRole(MapRoleComponent.QUICK_ORDER_PAD) && checkRole(MapRoleComponent.NORMAL_ORDER_PAD) && dataStorage.dataSetting.checkQuickOrderPad)) {
                dataStorage.goldenLayout.addComponentToStack('Order', {
                    contingentOrder: this.state.data && (this.state.data.order_type === 'STOPLIMIT_ORDER' || this.state.data.order_type === 'STOP_ORDER'),
                    stateOrder: 'DetailOrder',
                    data: { data: this.state.data },
                    needConfirm: true,
                    dataConfirm: { typeConfirm: orderEnum.CANCEL_ORDER, dataAccount: this.state.data },
                    currency: this.state.currency || '--'
                });
                return;
            }
        }
        this.props.saveState({
            needConfirm: true,
            dataConfirm: {
                typeConfirm: orderEnum.CANCEL_ORDER,
                dataAccount: this.state.data
            }
        })
    }

    handleModifyOrder() {
        if (checkRole(MapRoleComponent.QUICK_ORDER_PAD)) {
            if ((checkRole(MapRoleComponent.QUICK_ORDER_PAD) && !checkRole(MapRoleComponent.NORMAL_ORDER_PAD)) || (checkRole(MapRoleComponent.QUICK_ORDER_PAD) && checkRole(MapRoleComponent.NORMAL_ORDER_PAD) && dataStorage.dataSetting.checkQuickOrderPad)) {
                const side = Number(this.state.data.is_buy) ? 'Buy' : 'Sell';
                dataStorage.goldenLayout.addComponentToStack('Order', {
                    contingentOrder: this.state.data && (this.state.data.order_type === 'STOPLIMIT_ORDER' || this.state.data.order_type === 'STOP_ORDER'),
                    stateOrder: 'ModifyOrder',
                    data: { data: this.state.data, side: side },
                    needConfirm: false,
                    currency: this.state.currency || '--'
                })
                return;
            }
        }
        this.props.saveState({
            stateOrder: 'ModifyOrder',
            needConfirm: false,
            data: {
                data: this.state.data,
                side: Number(this.state.data.is_buy) ? 'Buy' : 'Sell'
            }
        })
    }

    handleNewOrder() {
        dataStorage.goldenLayout.addComponentToStack('Order', {
            stateOrder: 'NewOrder',
            needConfirm: false,
            data: {
                symbol: this.state.data.symbol,
                side: sideEnum.BUYSIDE
            }
        })
    }

    componentWillUnmount() {
        if (dataStorage.listFilledCancelled && dataStorage.listFilledCancelled[this.state.data.display_order_id]) {
            const lst = dataStorage.listFilledCancelled;
            delete lst[`${this.state.data.display_order_id}`];
            dataStorage.listFilledCancelled = lst;
        }
        const userId = dataStorage.userInfo.user_id;
        unregisterUser(userId, this.realTimeDataUser, 'user_setting')
        unregisterAccount(this.accountId, this.realtimeData, 'order_detail');
        this.emitOrderStatusByNotiID && this.emitOrderStatusByNotiID.remove();
        this.emitConnectionID && this.emitConnectionID.remove();
        this.emitRefreshID && this.emitRefreshID.remove();
    }

    realtimeData(data, action) {
        if (data.account_id && data.account_id !== this.accountId) return;
        if (action === actionType.INSERT &&
            data.broker_order_id === this.state.data.broker_order_id) {
            for (let i = 0; i < this.state.listOrder.length; i++) {
                if (this.state.listOrder[i].updated === data.updated) return
            }
            const listOrder = clone(this.state.listOrder) || [];
            let existData = null;
            // if (data.seq_num) {
            //     listOrder.map(item => {
            //         if (item.seq_num && item.seq_num < data.seq_num && item.order_status === data.order_status) {
            //             existData = item
            //         }
            //     })
            // }
            if (existData) {
                Object.assign(existData, data);
            } else {
                listOrder.unshift(data);
            }
            const symbolObj = this.symbolObj
            data.display_exchange = symbolObj.display_exchange || '';
            data.display_name = symbolObj.display_name || '';
            data.company_name = symbolObj.company_name || symbolObj.company || symbolObj.security_name || '';
            data.display_master_code = symbolObj.display_master_code || '';
            data.display_master_name = symbolObj.display_master_name || '';
            data.class = symbolObj.class || '';
            data.country = symbolObj.country || ''
            data.currency = symbolObj.currency || ''
            data.master_code = symbolObj.master_code
            data.expiry_date = symbolObj.expiry_date
            data = mapData(data)
            this.setState({ listOrder, data });
        }
    }

    fetchData = () => {
        const orderId = this.state.data.broker_order_id || this.state.data.display_order_id;
        if (!orderId) return;
        let url = getUrlOrderDetailByTag(orderId)
        getData(url)
            .then(response => {
                const listOrder = convertObjToArray(response.data || {})
                if (listOrder && listOrder.length) {
                    let data = listOrder[0] || {};

                    const accountId = data.account_id;
                    if (accountId) {
                        unregisterAccount(this.accountId, this.realtimeData, 'order_detail');
                        this.accountId = accountId;
                        registerAccount(accountId, this.realtimeData, 'order_detail');
                    }
                    data.side = data.is_buy ? sideEnum.BUYSIDE : sideEnum.SELLSIDE;
                    data.quantity = data.volume;
                    data.filled_price = data.avg_price;
                    const symbol = data.symbol
                    if (symbol) {
                        const decode = encodeURIComponent(symbol)
                        const urlMarketInfo = makeSymbolUrl(decode);
                        getData(urlMarketInfo)
                            .then(response2 => {
                                if (response2.data && response2.data.length) {
                                    const symbolObj = response2.data[0] || {}
                                    symbolObj.trading_market = data.trading_market || '';
                                    this.symbolObj = symbolObj
                                    data.display_exchange = getDisplayExchange(symbolObj) || symbolObj.display_exchange || '';
                                    data.display_name = symbolObj.display_name || '';
                                    data.company_name = symbolObj.company_name || symbolObj.company || symbolObj.security_name || '';
                                    data.display_master_code = symbolObj.display_master_code || '';
                                    data.display_master_name = symbolObj.display_master_name || '';
                                    data.class = symbolObj.class || '';
                                    data.country = symbolObj.country || ''
                                    data.currency = symbolObj.currency || ''
                                    data.master_code = symbolObj.master_code
                                    data.expiry_date = symbolObj.expiry_date
                                    data.first_noti_day = symbolObj.first_noti_day
                                    data.last_trading_day = symbolObj.last_trading_day
                                    this.setState({
                                        data
                                    }, () => {
                                        if (accountId) {
                                            getAnAccountInfo(accountId, res => {
                                                const newData = { ...this.state.data, ...{ account_name: res.account_name || '' } }
                                                this.setState({
                                                    data: newData,
                                                    unit: res.currency
                                                })
                                                this.getDataHistory(listOrder);
                                            })
                                        }
                                    })
                                } else {
                                    this.setState({
                                        data
                                    }, () => {
                                        if (accountId) {
                                            getAnAccountInfo(accountId, res => {
                                                const newData = { ...this.state.data, ...{ account_name: res.account_name || '' } }
                                                this.setState({
                                                    data: newData,
                                                    unit: res.currency

                                                })
                                            })
                                        }
                                        this.getDataHistory(listOrder);
                                    })
                                }
                            }).catch(() => {
                                this.setState({
                                    data
                                }, () => {
                                    if (accountId) {
                                        getAnAccountInfo(accountId, res => {
                                            const newData = { ...this.state.data, ...{ account_name: res.account_name || '' } }
                                            this.setState({
                                                data: newData,
                                                unit: res.currency
                                            })
                                        })
                                    }
                                    this.getDataHistory(listOrder);
                                })
                            })
                    }
                }
            })
            .catch(error => {
                logger.error(error)
                this.setState({
                    data: {}
                })
            })
    }
    fetchDataWebSV = () => {
        const orderNumber = this.isAllOrderWebSV
        let url = getUrlOrderByNumber(orderNumber);
        getData(url)
            .then(response => {
                if (response.data && response.data.length) {
                    let data = response.data[0] || {}
                    data.side = data.is_buy ? sideEnum.BUYSIDE : sideEnum.SELLSIDE;
                    data.quantity = data.volume;
                    data.filled_price = data.avg_price;
                    const symbol = data.symbol
                    if (symbol) {
                        const decode = encodeURIComponent(symbol)
                        const urlMarketInfo = makeSymbolUrl(decode);
                        getData(urlMarketInfo)
                            .then(response2 => {
                                if (response2.data && response2.data.length) {
                                    const symbolObj = response2.data[0] || {}
                                    symbolObj.display_exchange = getDisplayExchange(data) || formatDisplayExchange(data) || formatExchange(data) || '';
                                    this.symbolObj = symbolObj
                                    data.display_exchange = symbolObj.display_exchange || '';
                                    data.display_name = symbolObj.display_name || '';
                                    data.company_name = symbolObj.company_name || symbolObj.company || symbolObj.security_name || '';
                                    data.display_master_code = symbolObj.display_master_code || '';
                                    data.display_master_name = symbolObj.display_master_name || '';
                                    data.class = symbolObj.class || '';
                                    data.country = symbolObj.country || ''
                                    // data.currency = symbolObj.currency || ''
                                    data.master_code = symbolObj.master_code
                                    data.expiry_date = symbolObj.expiry_date
                                    this.setState({
                                        data
                                    }, () => {
                                        const accountId = response.data[0].account_id;
                                        if (accountId) {
                                            getAnAccountInfo(accountId, res => {
                                                const newData = { ...this.state.data, ...{ account_name: res.account_name || '' } }
                                                this.setState({
                                                    data: newData
                                                })
                                                this.getDataHistoryWebSV(response);
                                            })
                                        }
                                    })
                                } else {
                                    this.setState({
                                        data
                                    }, () => {
                                        const accountId = response.data[0].account_id;
                                        if (accountId) {
                                            getAnAccountInfo(accountId, res => {
                                                const newData = { ...this.state.data, ...{ account_name: res.account_name || '' } }
                                                this.setState({
                                                    data: newData
                                                })
                                            })
                                        }
                                        this.getDataHistoryWebSV(accountId);
                                    })
                                }
                            }).catch(() => {
                                this.setState({
                                    data
                                }, () => {
                                    const accountId = response.data[0].account_id;
                                    if (accountId) {
                                        getAnAccountInfo(accountId, res => {
                                            const newData = { ...this.state.data, ...{ account_name: res.account_name || '' } }
                                            this.setState({
                                                data: newData
                                            })
                                        })
                                    }
                                })
                            })
                    }
                }
            })
            .catch(error => {
                logger.error(error)
                this.setState({
                    data: {}
                })
            })
    }

    getDataHistoryWebSV(response) {
        try {
            const listOrder = convertObjToArray(response.data || {})
            const filterListOrder = listOrder.filter(item => {
                const symbolObj = this.symbolObj
                item.display_exchange = getDisplayExchange(symbolObj) || symbolObj.display_exchange || '';
                item.display_name = symbolObj.display_name || '';
                item.company_name = symbolObj.company_name || symbolObj.company || symbolObj.security_name || '';
                item.display_master_code = symbolObj.display_master_code || '';
                item.display_master_name = symbolObj.display_master_name || '';
                item.class = symbolObj.class || '';
                item.country = symbolObj.country || ''
                item.currency = symbolObj.currency || ''
                if (!item.seq_num) return true;
                if (this.seq_num && this.seq_num > item.seq_num) return false;
                this.seq_num = item.seq_num;
                return true;
            })
            this.setState({
                listOrder: filterListOrder
            })
        } catch (error) {
            logger.error('getDataHistory On ItemExpandRow Orderlist' + error)
        }
    }
    getDataHistory(listOrder) {
        try {
            const filterListOrder = listOrder.filter(item => {
                const symbolObj = this.symbolObj
                if (symbolObj) {
                    item.display_exchange = getDisplayExchange(symbolObj) || symbolObj.display_exchange || '';
                    item.display_name = symbolObj.display_name || '';
                    item.company_name = symbolObj.company_name || symbolObj.company || symbolObj.security_name || '';
                    item.display_master_code = symbolObj.display_master_code || '';
                    item.display_master_name = symbolObj.display_master_name || '';
                    item.class = symbolObj.class || '';
                    item.country = symbolObj.country || ''
                    // item.currency = symbolObj.currency || ''
                }
                if (!item.seq_num) return true;
                if (this.seq_num && this.seq_num > item.seq_num) return false;
                this.seq_num = item.seq_num;
                return true;
            })
            this.setState({
                listOrder: filterListOrder
            })
        } catch (error) {
            logger.error('getDataHistory On ItemExpandRow Orderlist' + error)
        }
    }

    changeConnection(isConnected) {
        if (!isConnected !== !this.isConnected) {
            this.isConnected = isConnected;
            this.setState({
                connectedAgain: false
            })
        }
        if (isConnected) {
            this.setState({
                connectedAgain: true
            }, () => {
                this.isDisabledClass = ''
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.loadState && nextProps.loadState().data) {
            this.setState({
                data: nextProps.loadState().data
            })
        }
        // this.getDataHistory(this.state.data.account_id);
    }
    realTimeDataUser(value) {
        if (value.timezone) {
            this.fetchData()
        }
    }
    getAnAccount() {
        if (this.state.data.account_id) {
            getData(getUrlAnAccount(this.state.data.account_id)).then(res => {
                this.setState({
                    unit: res.data[0] && res.data[0].currency
                })
            })
        }
    }
    componentDidMount() {
        // if (this.state.data.account_id) {
        // this.getDataHistory(this.state.data.account_id);
        // if (this.props.currency === 'needGetAccount') this.getAnAccount()
        // } else {
        if (this.isAllOrderWebSV) {
            this.fetchDataWebSV()
        }
        this.fetchData();
        // }
        // if (this.state.data.account_id) {
        //     this.getDataHistory(this.state.data.account_id);
        if (this.state.unit === 'needGetAccount' || !this.state.unit || this.state.unit === '--') this.getAnAccount()
        // } else {
        // this.fetchData();
        // this.getAnAccount()
        // }
        const userId = dataStorage.userInfo.user_id;
        registerUser(userId, this.realTimeDataUser, 'user_setting')
        this.emitOrderStatusByNotiID = this.checkOrderStatusByNoti && this.checkOrderStatusByNoti.addListener(eventEmitter.CHECK_ORDER_STATUS_BY_NOTI, this.changeOrderAction.bind(this));
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
        this.emitRefreshID = this.accountRefresh && this.accountRefresh.addListener(eventEmitter.REFRESH_DATA_ACCOUNT, this.fetchData.bind(this));
    }

    changeOrderAction(data) {
        if (data.broker_order_id !== this.state.data.display_order_id) return;
        switch (data.order_status) {
            case orderState.FILLED: case orderState.CANCELLED:
                if (!this.bodyDom.classList.contains('disableModifyCancelOrderDetail')) {
                    this.bodyDom.classList.add('disableModifyCancelOrderDetail');
                }
                break;
            default:
                if (this.bodyDom.classList.contains('disableModifyCancelOrderDetail')) {
                    this.bodyDom.classList.remove('disableModifyCancelOrderDetail');
                }
                break;
        }
    }
}

export default (translate('translations')(DetailOrder));
