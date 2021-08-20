import React from 'react';
import {
    getUrlTotalPosition,
    putData,
    postData,
    getData,
    makeFeelUrl,
    requirePin,
    getUrlCheckErrorModifyOrder,
    getUrlAnAccount,
    getCommodityInfoUrl,
    makeSymbolUrl,
    getUrlOrderById
} from '../../helper/request'
import {
    formatNumberPrice,
    formatNumberVolume,
    formatNumberValue,
    changeColor,
    changeColorByTrend,
    showMoneyFormatter,
    genOrderType,
    mapError,
    renderExchange,
    isAUSymbol,
    checkValidTranslation,
    checkRole,
    checkRoleWidget,
    formatSide,
    getDisplayExchange,
    formatExchange,
    formatCompanyName,
    formatExpireDate,
    getVolume,
    parseNumber,
    getCurrency
} from '../../helper/functionUtils'
import InputDropDown from '../Inc/InputDrop';
import TablePrice from '../Inc/TablePriceOrder';
import durationeEnum from '../../constants/duration_enum';
import orderType from '../../constants/order_type';
import dataStorage from '../../dataStorage';
import orderEnum from '../../constants/order_enum';
import logger from '../../helper/log';
import { translate } from 'react-i18next';
import { registerAccount, unregisterAccount } from '../../streaming';
import errorValidate from '../../constants/error_validate';
import config from '../../../public/config'
import Lang from '../Inc/Lang/Lang';
import MapRoleComponent from '../../constants/map_role_component';
import moment from 'moment';
import Flag from '../Inc/Flag';
import NoTag from '../Inc/NoTag';
import constances from '../SecurityDetail/constances';
import SecurityDetailIcon from '../Inc/SecurityDetailIcon/SecurityDetailIcon';
import sideEnum from '../../constants/enum';
import Toggle from '../Inc/Toggle';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'

const TIMEOUT_DEFAULT = 20000;

export class ModifyOrder extends React.Component {
    constructor(props) {
        super(props);
        checkRoleWidget(this, [MapRoleComponent.MODIFY_BUTTON_ALL_ORDERS, MapRoleComponent.MODIFY_BUTTON_ORDERS, MapRoleComponent.MODIFY_BUTTON_ORDER_DETAIL])
        const data = (props.data && props.data.data) || {}
        const dataLoadState = props.loadState()
        this.isValidBeforeConfirmOrder = false
        this.errClass = '';
        this.symbol = data.symbol || ''
        this.classproduct = data.class || ''
        this.trading_halt = data.trading_halt || false
        this.display_name = data.display_name || ''
        this.company_name = formatCompanyName(data)
        this.condition = data.condition_name || ''
        this.duration = data.duration || 'GTC'
        this.exchangeMarket = renderExchange(data.exchange)
        this.side = formatSide(data)
        this.display_exchange = getDisplayExchange(data)
        this.exchange = formatExchange(data)
        this.account_id = data.account_id || ''
        this.account_name = data.account_name || ''
        this.filled = data.filled_quantity
        this.broker_order_id = data.broker_order_id
        this.orderTypeDrop = data.order_type || orderType.MARKETTOLIMIT
        this.oldVolume = (dataLoadState && dataLoadState.data && dataLoadState.data.data.volume) || getVolume(data) || 0;
        this.oldLimitPrice = (dataLoadState && dataLoadState.data && dataLoadState.data.data.limit_price) || data.limit_price
        this.oldStopPrice = (dataLoadState && dataLoadState.data && dataLoadState.data.data.stop_price) || data.stop_price
        this.expire_date = data.expire_date
        this.trading_market = data.trading_market || ''
        this.masterCode = data.display_master_code || '--'
        this.masterName = data.display_master_name || '--'
        this.country = data.country || ''
        this.data = data
        this.dicPositions = {};
        this.dicProfitVal = {};
        this.isSymbolFuture = data.class
        this.state = {
            isConnected: dataStorage.connected,
            data: {},
            limitPrice: this.oldLimitPrice,
            volume: this.oldVolume,
            stopPrice: this.oldStopPrice,
            dataCashAccount: null,
            errorOrder: '',
            isChange: false,
            collapseTextDepcription: true,
            estimatedPriceObj: {},
            isLoading: false,
            currency: this.props.currency,
            commodityInfoObj: {},
            symbolObj: {}
        }
        this.realtimeDataBalances = this.realtimeDataBalances.bind(this);
        this.getAnAccount = this.getAnAccount.bind(this)
    }

    getDataByOrderId = async () => {
        const url = getUrlOrderById(this.broker_order_id)
        getData(url).then((res) => {
            if (res.data[0].order_type) this.orderTypeDrop = res.data[0].order_type
        }).catch(error => {
            logger.error('getDataByOrderId on ModifyOrder:' + error)
        })
    }

    async confirmOrder() {
        try {
            const validate = this.validateForm();
            if (validate) return;
            await this.getDataByOrderId()
            this.setNote(this.state.volume)
            const orderTypeByExchange = genOrderType(this.orderTypeDrop)
            const objOrder = {
                broker_order_id: this.broker_order_id,
                volume: parseFloat(this.state.volume),
                note: JSON.stringify(this.note)
            };
            const limitPrice = parseFloat(this.state.limitPrice)
            const stopPrice = parseFloat(this.state.stopPrice)
            switch (orderTypeByExchange) {
                case orderType.MARKETTOLIMIT:
                    break;
                case orderType.LIMIT:
                    objOrder['limit_price'] = limitPrice;
                    break;
                case orderType.STOP:
                    objOrder['stop_price'] = stopPrice;
                    break;
                case orderType.STOP_LIMIT:
                    objOrder['stop_price'] = stopPrice;
                    objOrder['limit_price'] = limitPrice;
                    break;
                default:
                    break;
            }
            this.timeoutRequestOrder = setTimeout(() => {
                this.setState({
                    errorOrder: 'lang_timeout_cannot_be_connected_server',
                    isShowWarning: true,
                    isLoading: false
                }, () => this.hiddenWarning())
            }, TIMEOUT_DEFAULT)
            await this.checkValidBeforeConfirmOrder(objOrder)
            if (!this.isValidBeforeConfirmOrder) return
            this.props.saveState({
                needConfirm: true,
                dataConfirm: {
                    typeConfirm: orderEnum.MODIFY_ORDER,
                    dataRequest: objOrder,
                    dataAccount: {
                        order_type: orderTypeByExchange,
                        note: this.note,
                        side: this.side,
                        account_name: this.account_name,
                        account_id: this.account_id,
                        symbol: this.symbol,
                        exchange: this.exchange,
                        display_name: this.display_name,
                        company_name: this.company_name,
                        duration: this.duration,
                        limit_price: this.state.limitPrice,
                        stop_price: this.state.stopPrice,
                        volume: this.state.volume > 0 ? this.state.volume : -this.state.volume,
                        estimatedPriceObj: this.state.estimatedPriceObj,
                        oldlimitPrice: this.oldLimitPrice,
                        oldstopPrice: this.oldStopPrice,
                        oldVolume: this.oldVolume,
                        filled: this.filled,
                        condition_name: this.condition,
                        broker_order_id: this.broker_order_id,
                        display_exchange: this.display_exchange || '',
                        trading_market: this.exchange,
                        expire_date: moment(this.expire_date).format('YYYYMMDD'),
                        isSymbolFuture: this.isSymbolFuture,
                        currency: this.state.currency,
                        unit: this.data.currency,
                        country: this.data.country,
                        unitcommonity: this.state.commodityInfoObj.unit || '',
                        contractSize: this.state.commodityInfoObj.contract_size || '',
                        displayExpireDate: this.data.expiry_date,
                        firstNoticeDay: this.data.first_noti_day,
                        master_code: this.data.master_code,
                        class: this.data.class
                    }
                }
            })
        } catch (error) {
            logger.error('confirmOrder On ModifyOrder' + error)
        }
    }

    async checkValidBeforeConfirmOrder(orderModifyObject) {
        try {
            const that = this
            let url = getUrlCheckErrorModifyOrder(orderModifyObject.broker_order_id)
            const obj = { 'data': orderModifyObject }
            that.setState({
                isLoading: true
            })
            await putData(url, obj)
                .then(response => {
                    if (response.data && response.data.errorCode === 'SUCCESS') {
                        that.isValidBeforeConfirmOrder = true
                        that.setState({
                            isLoading: false
                        })
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
                        that.isValidBeforeConfirmOrder = false
                        that.setState({
                            errorOrder: mapError(errorString, orderEnum.MODIFY_ORDER),
                            idShowWarning: true,
                            isLoading: false
                        }, () => that.hiddenWarning())
                    }
                })
                .catch(error => {
                    if (this.timeoutRequestOrder) clearTimeout(this.timeoutRequestOrder)
                    let errorContent = 'UnknownError'
                    if (error.response && error.response.errorCode) {
                        errorContent = error.response.errorCode
                    }
                    if (Array.isArray(errorContent)) errorContent = errorContent[0];
                    that.isValidBeforeConfirmOrder = false
                    that.setState({
                        isLoading: false,
                        errorOrder: mapError(errorContent, orderEnum.MODIFY_ORDER),
                        idShowWarning: true
                    }, () => that.hiddenWarning())
                    logger.error(error)
                })
        } catch (error) {
            logger.error(error)
        }
    }

    hiddenWarning() {
        try {
            this.errClass = ''
            setTimeout(() => this.setState({ errorOrder: false }), 5000)
        } catch (error) {
            logger.error('hiddenWarning On ModifyOrder' + error)
        }
    }

    checkVolumeInput() {
        try {
            if (parseFloat(this.state.volume) === 0) {
                this.errClass = 'errVolume'
                this.setState({
                    errorOrder: errorValidate.OrderVolumeZero
                }, () => this.hiddenWarning())
                return true
            } else if (this.filled) {
                if (this.state.volume < this.filled) {
                    this.errClass = 'errVolume'
                    this.setState({
                        errorOrder: errorValidate.VolumeMoreThanFilled
                    }, () => this.hiddenWarning())
                    return true
                }
            }
            return false;
        } catch (error) {
            logger.error('checkVolumeInput On ModifyOrder' + error)
        }
    }

    checkLimitPrice() {
        try {
            if (parseFloat(this.state.limitPrice) === 0) {
                this.errClass = 'errLimitPrice'
                this.setState({
                    errorOrder: errorValidate.OrderLimitPriceZero
                }, () => this.hiddenWarning())
                return true
            }
            return false;
        } catch (error) {
            logger.error('checkLimitPrice On ModifyOrder' + error)
        }
    }

    checkStopPrice() {
        try {
            if (parseFloat(this.state.stopPrice) === 0) {
                this.errClass = 'errStopPrice'
                this.setState({
                    errorOrder: errorValidate.OrderStopPriceZero
                }, () => this.hiddenWarning())
                return true
            }
            return false;
        } catch (error) {
            logger.error('checkStopPrice On ModifyOrder' + error)
        }
    }

    validateForm() {
        try {
            switch (this.orderTypeDrop) {
                case orderType.STOP_LIMIT:
                    return this.checkVolumeInput() || this.checkLimitPrice() || this.checkStopPrice();
                case orderType.STOPLOSS:
                    return this.checkVolumeInput() || this.checkStopPrice();
                case orderType.LIMIT:
                    return this.checkVolumeInput() || this.checkLimitPrice();
                case orderType.LIMIT_SAXO:
                    return this.checkVolumeInput() || this.checkLimitPrice();
                case orderType.MARKETTOLIMIT:
                    return this.checkVolumeInput();
                case orderType.MARKET_SAXO:
                    return this.checkVolumeInput();
                default:
                    return this.checkVolumeInput();
            }
        } catch (error) {
            logger.error('validateForm On ModifyOrder' + error)
        }
    }

    setNote(volume) {
        try {
            let modifyAction;
            if (volume > 0) {
                modifyAction = 'ADD'
            } else if (volume < 0) {
                modifyAction = 'REDUCE'
            } else {
                // Case volume = 0;
                if (this.state.limitPrice > this.oldLimitPrice) {
                    modifyAction = 'ADD'
                } else {
                    modifyAction = 'REDUCE'
                }
            }
            this.note = {
                order_state: 'UserAmend',
                modify_action: modifyAction,
                exchange: this.exchangeMarket,
                data: {
                    side: this.side.toUpperCase(),
                    volume_old: this.oldVolume,
                    volume: volume,
                    stop_price: this.state.stopPrice,
                    limit_price: this.state.limitPrice,
                    stop_price_old: this.oldStopPrice,
                    limit_price_old: this.oldLimitPrice
                }
            }
        } catch (error) {
            logger.log('SetNote on Modify:', error)
        }
    }

    realtimeDataBalances(data) {
        if (data.account_id && this.account_id !== data.account_id) return;
        this.setState({
            dataCashAccount: data
        });
    }

    handleInputStopPrice(e) {
        try {
            let input = e + ''
            if (!/^\d*\.?\d*$/.test(input)) {
                input = input.replace(/[^0-9.-]/g, '');
                input = input.replace(/-+/g, '');
                input = input.replace(/\.(\d*)\.+/g, '.$1');
            }

            let value = input + '';
            if (parseFloat(input) < 0) {
                value = '0'
            }
            this.setState({
                stopPrice: value
            }, () => {
                value && this.getFees()
                this.checkUpdateValue();
            })
        } catch (error) {
            logger.error('handleInputStopPrice On NewOrder ' + error)
        }
    }
    handleInputLimitPrice(e) {
        try {
            let input = e + ''
            if (!/^\d*\.?\d*$/.test(input)) {
                input = input.replace(/[^0-9.-]/g, '');
                input = input.replace(/-+/g, '');
                input = input.replace(/\.(\d*)\.+/g, '.$1');
            }

            let value = input + '';
            if (parseFloat(input) < 0) {
                value = '0'
            }
            this.setState({
                limitPrice: value
            }, () => {
                value && this.getFees()
                this.checkUpdateValue();
            })
        } catch (error) {
            logger.error('handleInputlimitPrice On NewOrder ' + error)
        }
    }

    handleInputVolume(e) {
        try {
            let input = (e + '').replace(/[^\d]/g, '');
            let value = input + '';
            if (parseFloat(input) < 0) {
                value = '0'
            }
            this.props.saveState({
                volume: value
            })
            this.setState({
                volume: value
            }, () => {
                this.checkUpdateValue();
                value && this.getFees()
            })
        } catch (error) {
            logger.error('handleInputVolume On NewOrder ' + error)
        }
    }

    getFees(cb) {
        try {
            const objOrder = {
                code: this.symbol,
                volume: parseFloat(this.state.volume),
                exchange: this.exchange,
                order_type: genOrderType(this.orderTypeDrop),
                is_buy: this.side === 'BUY',
                account_id: this.account_id,
                duration: this.duration
            };
            const limitPrice = parseFloat(this.state.limitPrice)
            const stopPrice = parseFloat(this.state.stopPrice)
            const orderTypeByExchange = genOrderType(this.orderTypeDrop)
            switch (orderTypeByExchange) {
                case orderType.MARKETTOLIMIT:
                    break;
                case orderType.LIMIT:
                    objOrder['limit_price'] = limitPrice;
                    break;
                case orderType.STOP:
                    objOrder['stop_price'] = stopPrice;
                    break;
                case orderType.STOP_LIMIT:
                    objOrder['stop_price'] = stopPrice;
                    objOrder['limit_price'] = limitPrice;
                    break;
                default:
                    break;
            }
            if (objOrder.volume > 0) {
                const urlFees = makeFeelUrl();
                const obj = { 'data': objOrder }
                postData(urlFees, obj)
                    .then(response => {
                        this.setState({
                            estimatedPriceObj: response.data
                        })
                    })
                    .catch(error => {
                        logger.error(error)
                        this.setState({
                            estimatedPriceObj: {}
                        })
                    })
            }
            cb && cb()
        } catch (error) {
            logger.log('Get Fees On ModifyOrder ' + error)
        }
    }

    getCashByAccount() {
        try {
            let url = getUrlTotalPosition(this.account_id)
            getData(url)
                .then(response => {
                    const dataCashAccount = response.data || {};
                    if (dataCashAccount.positions && dataCashAccount.positions.length) {
                        dataCashAccount.positions.map(item => {
                            if ((item.side + '').toLocaleLowerCase() !== 'close') {
                                this.dicPositions[item.symbol] = item
                            }
                        });
                    }
                    if (dataCashAccount.profitVal && Object.keys(dataCashAccount.profitVal).length) {
                        this.dicProfitVal = dataCashAccount.profitVal
                    }
                    this.setState({
                        dataCashAccount: dataCashAccount
                    })
                })
                .catch(error => {
                    logger.error(error)
                    this.setState({
                        dataCashAccount: null
                    })
                })
        } catch (error) {
            logger.error('getCashByAccount dataStorage.account_idOn ModifyOrder' + error)
        }
    }

    renderContentButton(changeValue) {
        try {
            const { t } = this.props;
            let changeText = '';
            let disable = false;
            if (this.side === 'BUY') {
                if (this.state.isChange) {
                    changeText = t('lang_modify_to_buy').toUpperCase() + ' ';
                    disable = this.state.isChange
                } else {
                    changeText = t('lang_place_buy_order').toUpperCase()
                }
            } else {
                if (this.state.isChange) {
                    changeText = t('lang_modify_to_sell').toUpperCase() + ' '
                    disable = this.state.isChange
                } else {
                    changeText = t('lang_place_sell_order').toUpperCase()
                }
            }
            if (disable) {
                if (changeValue < 0) {
                    changeText += t('lang_reduce') + ' ' + formatNumberValue(Number(Math.abs(changeValue)));
                } else if (changeValue > 0) {
                    changeText += t('lang_add_uppercase') + ' ' + formatNumberValue(Number(Math.abs(changeValue)));
                } else {
                    changeText += 0
                }
                const symbol = this.display_name || '';
                switch (this.orderTypeDrop) {
                    case orderType.LIMIT:
                        changeText += '   @ ' + t('lang_lmt') + ' ' + formatNumberPrice(this.state.limitPrice, true)
                        break;
                    case orderType.STOPLOSS:
                        changeText += ' ' + t('lang_at') + ' ' + (<Lang>lang_market_price</Lang>)
                        changeText += ' @ ' + t('lang_trigger') + ' ' + formatNumberPrice(this.state.stopPrice, true)
                        break;
                    case orderType.STOP:
                        changeText += ' ' + t('lang_at') + ' ' + (<Lang>lang_market_price</Lang>)
                        changeText += ' @ ' + t('lang_trigger') + ' ' + formatNumberPrice(this.state.stopPrice, true)
                        break;
                    case orderType.STOP_LIMIT:
                        changeText += '   @ ' + t('lang_lmt') + ' ' + formatNumberPrice(this.state.limitPrice, true) + ' ' + t('lang_trigger') + ' ' + formatNumberPrice(this.state.stopPrice, true)
                        break;
                    default:
                        changeText += ` ${t('lang_of')} ` + symbol;
                        changeText += ' ' + t('lang_at') + ' ' + (<Lang>lang_market_price</Lang>)
                        break;
                }
            }
            this.setState({
                contentButton: changeText
            })
        } catch (error) {
            logger.error('renderContentButton On ModifyOrder' + error)
        }
    }

    checkUpdateValue() {
        try {
            let changeValue = parseNumber(this.state.volume) - parseNumber(this.oldVolume);
            if ((parseNumber(this.state.volume) !== parseNumber(this.oldVolume)) || (parseNumber(this.state.limitPrice) !== parseNumber(this.oldLimitPrice)) || (parseNumber(this.state.stopPrice) !== parseNumber(this.oldStopPrice))) {
                this.isChange = true;
            } else {
                this.isChange = false;
            }
            this.valueTemp = changeValue;
            this.setState({
                isChange: this.isChange
            }, () => this.renderContentButton(changeValue))
        } catch (error) {
            logger.error('checkUpdateValue On ModifyOrder' + error)
        }
    }

    renderPriceNumber() {
        try {
            const dataPrice = this.state.data;
            let changePercent = '(--%)';
            let changePoint = '--';
            if (dataPrice && dataPrice.change_percent !== undefined && dataPrice.change_percent !== null && dataPrice.change_percent === 0) {
                changePercent = '(0.00%)'
            } else if (dataPrice && dataPrice.change_percent) {
                changePercent = '(' + formatNumberValue(dataPrice.change_percent, true) + '%)'
            }
            if (dataPrice && dataPrice.change_point !== undefined && dataPrice.change_point !== null && dataPrice.change_point === 0) {
                changePoint = '0.0000'
            } else if (dataPrice && dataPrice.change_point) {
                changePoint = formatNumberPrice(dataPrice.change_point, true)
            }
            return (
                <div>
                    <span className='trade_price_text' style={dataPrice && changeColorByTrend(dataPrice.trend)}>{dataPrice && dataPrice.trade_price ? formatNumberPrice(dataPrice.trade_price, true) : ' -- '}</span>
                    <span style={dataPrice && changeColor(dataPrice.change_point)}>{changePoint}</span>
                    <span style={dataPrice && changeColor(dataPrice.change_percent)}>{changePercent}</span>
                </div>
            )
        } catch (error) {
            logger.error('renderPriceNumber On ModifyOrder' + error)
        }
    }

    renderRowOption() {
        const { t } = this.props;
        switch (this.orderTypeDrop) {
            case orderType.LIMIT:
                return (<div className={`rowOrderPad changeColorHover`}>
                    <div className={`leftRowOrderPad text-capitalize`}>{<Lang>lang_limit_price</Lang>}</div>
                    <div>
                        <InputDropDown
                            formatType='price'
                            suppressDropDown={true}
                            className='inputDropLimitPrice'
                            withInput={true}
                            type='number'
                            options={[]}
                            value={this.state.limitPrice}
                            sort={true}
                            scroll={true}
                            onChangeInput={this.handleInputLimitPrice.bind(this)}
                        />
                    </div>
                </div>)
            case orderType.STOP_LIMIT:
                return (
                    <div> <div className={`rowOrderPad changeColorHover`}>
                        <div className={`leftRowOrderPad text-capitalize`}>{<Lang>lang_trigger_price</Lang>}</div>
                        <div>
                            <InputDropDown
                                formatType='price'
                                suppressDropDown={true}
                                className='inputDropStopPrice'
                                withInput={true}
                                options={[]}
                                value={this.state.stopPrice}
                                type='number'
                                scroll={true}
                                onChangeInput={this.handleInputStopPrice.bind(this)}
                            />
                        </div>
                    </div>
                        <div className={`rowOrderPad changeColorHover`}>
                            <div className={`leftRowOrderPad text-capitalize`}>{<Lang>lang_limit_price</Lang>}</div>
                            <div>
                                <InputDropDown
                                    formatType='price'
                                    suppressDropDown={true}
                                    className='inputDropLimitPrice'
                                    withInput={true}
                                    options={[]}
                                    value={this.state.limitPrice}
                                    type='number'
                                    scroll={true}
                                    sort={true}
                                    onChangeInput={this.handleInputLimitPrice.bind(this)}
                                />
                            </div>
                        </div>
                    </div>
                )
            case orderType.STOP:
                return (<div className={`rowOrderPad changeColorHover`}>
                    <div className={`leftRowOrderPad text-capitalize`}>{<Lang>lang_trigger_price</Lang>}</div>
                    <div>
                        <InputDropDown
                            formatType='price'
                            suppressDropDown={true}
                            className='inputDropStopPrice'
                            withInput={true}
                            options={[]}
                            value={this.state.stopPrice}
                            type='number'
                            scroll={true}
                            onChangeInput={this.handleInputStopPrice.bind(this)}
                        />
                    </div>
                </div>)
            default:
                return null
        }
    }

    renderType() {
        const { t } = this.props;
        switch (this.orderTypeDrop) {
            case orderType.MARKET:
                return t('lang_market')
            case orderType.LIMIT:
                return t('lang_limit')
            case orderType.MARKETTOLIMIT:
                return t('lang_market_to_limit')
            case orderType.STOP:
                return t('lang_stop_loss')
            case orderType.STOP_LIMIT:
                if (this.isSymbolFuture === 'future') {
                    return t('lang_stop_limit')
                } else {
                    return t('lang_stop_loss')
                }
            default:
                return '--'
        }
    }

    scrollRoot() {
        const { t } = this.props;
        const errorOrder = this.state.errorOrder;
        const domScroll = document.getElementById('Scroll_Root_ModifyOrder');
        if (errorOrder) {
            domScroll.scrollTop = 0
        }
        if (typeof errorOrder === 'string') {
            if (checkValidTranslation(errorOrder)) {
                return t(errorOrder)
            } else {
                return errorOrder
            }
        }
        return errorOrder
    }

    handleClearAllData() {
        this.setState({
            volume: this.oldVolume,
            limitPrice: this.oldLimitPrice,
            stopPrice: this.oldStopPrice,
            isChange: false
        }, () => {
            this.getFees()
            this.valueTemp = '';
            this.renderContentButton();
        })
    }

    changeConnection = isConnected => {
        if (!isConnected !== !this.state.isConnected) {
            this.setState({ isConnected })
        }
    }
    getCommodityInfoUrl(symbolObj) {
        const decode = encodeURIComponent(symbolObj.master_code || symbolObj.symbol)
        const urlComodityInfo = getCommodityInfoUrl(decode)
        getData(urlComodityInfo).then(res => {
            if (res.data && res.data[0]) {
                this.setState({
                    commodityInfoObj: res.data[0]
                })
            } else {
                this.setState({
                    commodityInfoObj: {}
                })
            }
        }).catch(() => {
            this.setState({
                commodityInfoObj: {}
            })
        })
    }
    parseExpiryDate = (value, position) => {
        if (!value) return '--'
        const monthNumber = Number(value.slice(0, position))
        const convertedMonth = (constances.MAPPING_MONTHS[monthNumber] || {}).shortLabel
        const yearNumber = value.slice(position);
        return `${convertedMonth}${yearNumber}`
    }
    closePosition = () => {
        requirePin(() => {
            const volumePosition = (this.dicPositions[this.symbol] || {}).volume
            const side = volumePosition > 0 ? sideEnum.SELLSIDE : sideEnum.BUYSIDE
            dataStorage.goldenLayout.addComponentToStack('Order', { stateOrder: 'NewOrder', data: { symbol: this.symbol, account_id: this.account_id, side: side, volume: volumePosition, isClose: true } })
        })
    }
    changeColor = (value) => {
        try {
            const val = value;
            if (!value) return;
            value = formatNumberValue(value, true)
            if (value === 0 && value === '--') {
                return 'normalText'
            } else if (val < 0) {
                return 'priceDown'
            } else if (val > 0) {
                return 'priceUp'
            }
            return 'normalText'
        } catch (error) {
            logger.error('changeColor On TablePriceOrder ' + error)
        }
    }

    render() {
        try {
            const { t } = this.props;
            const isSymbolFuture = this.classproduct === 'future'
            const masterCode = (this.masterCode && this.masterCode) || '--'
            const masterName = (this.masterName && this.masterName) || '--'
            const unit = (this.data && this.data.currency)
            const averagePrice = this.dicPositions[this.symbol] && formatNumberPrice(this.dicPositions[this.symbol].average_price)
            const volumePosition = this.dicPositions[this.symbol] && formatNumberVolume(this.dicPositions[this.symbol].volume)
            const proitLoss = this.dicProfitVal && this.dicProfitVal[this.symbol]

            let cashAvailable = null;
            if (this.state.symbolObj && this.state.symbolObj.symbol && this.state.dataCashAccount) {
                if (this.state.symbolObj.class === 'future') {
                    cashAvailable = this.state.dataCashAccount.initial_margin_available
                } else if (isAUSymbol(this.state.symbolObj)) {
                    cashAvailable = this.state.dataCashAccount.available_balance_au || this.state.dataCashAccount.cash_available_au;
                } else {
                    cashAvailable = this.state.dataCashAccount.available_balance_us || this.state.dataCashAccount.cash_available_us;
                }
            }

            return (
                <div className={`newOrderContainer modifyorder size--4`}>
                    <div className='contentSliderPopUp'>
                        <div style={{ height: '100%' }}>
                            <div className={`newOrderRoot ${this.symbol ? '' : 'noneSymbol'} ${this.errClass} `}>
                                <div className='body'>
                                    <div id='Scroll_Root_ModifyOrder'>
                                        <div className={`errorOrder size--3 ${this.state.errorOrder ? '' : 'myHidden'} `}>{this.scrollRoot()}</div>
                                        <div className='newOrderWigetContainer'>
                                            <div className='newOrderBody size--3'>
                                                <div>
                                                    <Toggle className='title' nameToggle='lang_account_security_information' />
                                                    <div className='container'>
                                                        <div>
                                                            <div className="rowOrderPad changeColorHover">
                                                                <div className={`showTitle leftRowOrderPad text-capitalize`}>{<Lang>lang_account</Lang>}</div>
                                                                <div className={`showTitle rightRowOrderPad size--3`}>
                                                                    {(this.account_name)} ({this.account_id})
                                                                </div>
                                                            </div>
                                                            <div className={`rowOrderPad marginBot10 changeColorHover`}>
                                                                <div className={`leftRowOrderPad text-capitalize`}><Lang>lang_code</Lang></div>
                                                                <div className={`btnOrder text symbol size--3`} >
                                                                    {
                                                                        this.trading_halt ? <div className='trading-halt-symbol'>!</div> : null
                                                                    }
                                                                    {this.display_name}
                                                                    {<Flag symbolObj={this.data} />}
                                                                </div>
                                                            </div>
                                                            <div className={`rowOrderPad marginBot10 changeColorHover`}>
                                                                <div className={`leftRowOrderPad text-capitalize`}>{<Lang>lang_security</Lang>}</div>
                                                                <div className={`btnOrder text symbol size--3`} >
                                                                    {this.company_name}
                                                                    <SecurityDetailIcon
                                                                        {...this.props}
                                                                        symbolObj={this.data}
                                                                        iconStyle={{ position: 'unset', top: 'unset', transform: 'unset', marginLeft: 8 }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            {
                                                                isSymbolFuture
                                                                    ? <div className="rowOrderPad changeColorHover">
                                                                        <div className='showTitle leftRowOrderPad'>{<Lang>lang_master_code</Lang>}</div>
                                                                        <div className={`btnOrder text symbol size--3`} >
                                                                            {masterCode.toUpperCase()}
                                                                            {masterCode === '--' ? '' : <Flag symbolObj={this.data} />}
                                                                        </div>
                                                                    </div>
                                                                    : null
                                                            }
                                                            {
                                                                isSymbolFuture
                                                                    ? <div className="rowOrderPad changeColorHover">
                                                                        <div className='showTitle leftRowOrderPad'>{<Lang>lang_master_name</Lang>}</div>
                                                                        <div className='showTitle size--3 changeColorHover'>{masterName.toUpperCase()}</div>
                                                                    </div>
                                                                    : null
                                                            }
                                                        </div>
                                                        <div>
                                                            {
                                                                this.classproduct
                                                                    ? <div className="rowOrderPad changeColorHover">
                                                                        <div className='showTitle leftRowOrderPad'>{<Lang>lang_product</Lang>}</div>
                                                                        <div className='showTitle size--3 changeColorHover'>{this.classproduct.toUpperCase()}</div>
                                                                    </div>
                                                                    : null
                                                            }
                                                            <TablePrice symbolObj={this.state.symbolObj} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Toggle className='title' nameToggle='lang_order_information'></Toggle>
                                                    <div className='container'>
                                                        <div>
                                                            <div className={`rowOrderPad changeColorHover`}>
                                                                <div className={`showTitle leftRowOrderPad text-capitalize`}>{<Lang>lang_side</Lang>}</div>
                                                                <div className={`btnOrderRoot text ${this.side === 'BUY' ? 'buy' : ' sell'}`}>
                                                                    <div className={`btnOrder text size--3 ${this.side === 'BUY' ? 'buy' : ' sell'} text-uppercase`} >
                                                                        <Lang>{this.side === 'BUY' ? 'lang_buy' : 'lang_sell'}</Lang>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className={`rowOrderPad changeColorHover`}>
                                                                <div className={`showTitle leftRowOrderPad text-capitalize`}>{<Lang>lang_quantity</Lang>}</div>
                                                                <div>
                                                                    <InputDropDown
                                                                        suppressDropDown={true}
                                                                        className='inputDropVolume'
                                                                        withInput={true}
                                                                        format={'int'}
                                                                        type='number'
                                                                        options={[]}
                                                                        value={this.state.volume}
                                                                        onChangeInput={this.handleInputVolume.bind(this)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className={`rowOrderPad changeColorHover`}>
                                                                <div className={`showTitle leftRowOrderPad text-capitalize`}><Lang>lang_filled</Lang></div>
                                                                <div className={`btnOrderRoot text`}>
                                                                    <div className={`btnOrder text size--3`} >
                                                                        {this.filled ? parseInt(formatNumberVolume(this.filled)) : '--'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className={`rowOrderPad changeColorHover`}>
                                                                <div className={`showTitle leftRowOrderPad text-capitalize`}><Lang>lang_order_type</Lang></div>
                                                                <div className={`btnOrderRoot text`}>
                                                                    <div className={`btnOrder text size--3 text-capitalize`} >
                                                                        {this.renderType()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {this.renderRowOption()}
                                                            <div className={`rowOrderPad changeColorHover`}>
                                                                <div className={`showTitle leftRowOrderPad text-capitalize`}><Lang>lang_duration</Lang></div>
                                                                <div className={`btnOrderRoot text`}>
                                                                    <div className={`btnOrder text size--3`} >
                                                                        <Lang>{durationeEnum[this.duration]}</Lang>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {isAUSymbol(this.exchange) && this.duration === 'GTD' ? (
                                                                <div className={`rowOrderPad changeColorHover`}>
                                                                    <div className={`showTitle leftRowOrderPad text-capitalize`}><Lang>lang_date</Lang></div>
                                                                    <div className={`btnOrderRoot text`}>
                                                                        <div className={`btnOrder text size--3`}>{formatExpireDate(this.data)}</div>
                                                                    </div>
                                                                </div>
                                                            ) : null}
                                                            <div className={`rowOrderPad changeColorHover`}>
                                                                <div className={`showTitle leftRowOrderPad text-capitalize`}><Lang>lang_exchange</Lang></div>
                                                                <div className={`btnOrderRoot text`}>
                                                                    <div className={`btnOrder text size--3`} >
                                                                        {this.display_exchange}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Toggle className='title' nameToggle='lang_details'></Toggle>
                                                    <div className='container'>
                                                        <div>
                                                            {
                                                                unit === 'USD'
                                                                    ? <div className="rowOrderPad changeColorHover">
                                                                        <div className='showTitle leftRowOrderPad'><Lang>lang_order_amount_usd</Lang></div>
                                                                        <div className='showTitle uppercase'>{showMoneyFormatter(this.state.estimatedPriceObj.order_amount, unit)} <Lang>lang_usd</Lang></div>
                                                                    </div>
                                                                    : null
                                                            }
                                                            {
                                                                isSymbolFuture
                                                                    ? <div className="rowOrderPad changeColorHover">
                                                                        <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_initial_margin_impact</Lang>}{' (' + (unit || '--') + ')'}</div>
                                                                        <div className='showTitle'>{showMoneyFormatter(this.state.estimatedPriceObj.initial_margin_impact, unit)} {unit}</div>
                                                                    </div>
                                                                    : null
                                                            }
                                                            {
                                                                isSymbolFuture
                                                                    ? <div className="rowOrderPad changeColorHover">
                                                                        <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_maintenance_margin_impact</Lang>}{' (' + (unit || '--') + ')'}</div>
                                                                        <div className='showTitle'>{showMoneyFormatter(this.state.estimatedPriceObj.maintenance_margin_impact, unit)} {unit}</div>
                                                                    </div>
                                                                    : null
                                                            }
                                                            <div className="rowOrderPad changeColorHover">
                                                                <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_order_amount</Lang>} {getCurrency(this.state.currency)}</div>
                                                                <div className='showTitle'>{showMoneyFormatter(this.state.estimatedPriceObj.order_amount_convert, this.state.currency)} {this.state.currency}</div>
                                                            </div>
                                                            {
                                                                isSymbolFuture
                                                                    ? <div className="rowOrderPad changeColorHover">
                                                                        <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_initial_margin_impact</Lang>}{' (' + (this.state.currency || '--') + ')'}</div>
                                                                        <div className='showTitle'>{showMoneyFormatter(this.state.estimatedPriceObj.initial_margin_impact_convert)} {this.state.currency}</div>
                                                                    </div>
                                                                    : null
                                                            }
                                                            {
                                                                isSymbolFuture
                                                                    ? <div className="rowOrderPad changeColorHover">
                                                                        <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_maintenance_margin_impact</Lang>}{' (' + (this.state.currency || '--') + ')'}</div>
                                                                        <div className='showTitle'>{showMoneyFormatter(this.state.estimatedPriceObj.maintenance_margin_impact_convert)} {this.state.currency}</div>
                                                                    </div>
                                                                    : null
                                                            }
                                                            {
                                                                dataStorage.env_config.roles.showAdditionalFees ? <NoTag>
                                                                    <div className="rowOrderPad changeColorHover">
                                                                        <div className='showTitle leftRowOrderPad text-capitalize'><Lang>lang_fees</Lang>{this.state.currency ? ' (' + this.state.currency + ')' : ''}</div>
                                                                        <div className='showTitle'>{showMoneyFormatter(this.state.estimatedPriceObj.fees, this.state.currency)} {this.state.currency}</div>
                                                                    </div>
                                                                    {this.state.estimatedPriceObj.gst
                                                                        ? <div className="rowOrderPad changeColorHover">
                                                                            <div className='showTitle leftRowOrderPad text-capitalize'><Lang>lang_gst</Lang> (10%) {this.state.currency ? ' (' + this.state.currency + ')' : ''}</div>
                                                                            <div className='showTitle'>{showMoneyFormatter(this.state.estimatedPriceObj.gst, this.state.currency)} {this.state.currency}</div>
                                                                        </div>
                                                                        : null}
                                                                </NoTag> : null
                                                            }
                                                            <div className="rowOrderPad changeColorHover">
                                                                <div className='showTitle leftRowOrderPad text-capitalize'><Lang>lang_estimated_fees</Lang> {getCurrency(this.state.currency)}</div>
                                                                <div className='showTitle'>{showMoneyFormatter(this.state.estimatedPriceObj.estimated_fees, this.state.currency)} {this.state.currency}</div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="rowOrderPad changeColorHover">
                                                                <div className='showTitle leftRowOrderPad text-capitalize'><Lang>lang_estimated_total</Lang> {getCurrency(this.state.currency)}</div>
                                                                <div className='showTitle'>{showMoneyFormatter(this.state.estimatedPriceObj.total_convert, this.state.currency)} {this.state.currency}</div>
                                                            </div>
                                                            {isSymbolFuture
                                                                ? <NoTag>
                                                                    {this.exchange !== 'XLME'
                                                                        ? <div className="rowOrderPad changeColorHover">
                                                                            <div className='showTitle leftRowOrderPad text-capitalize'><Lang>lang_expiry_date</Lang></div>
                                                                            <div className='showTitle'>{this.parseExpiryDate(this.state.data.expiry_date || this.data.expiry_date, 2)}</div>
                                                                        </div>
                                                                        : null
                                                                    }
                                                                    <div className="rowOrderPad changeColorHover">
                                                                        <div className='showTitle leftRowOrderPad text-capitalize'><Lang>lang_first_notice_day</Lang></div>
                                                                        <div className='showTitle'>{(this.state.data.first_noti_day || this.data.first_noti_day) ? moment(this.state.data.first_noti_day || this.data.first_noti_day).format('DD MMM YYYY') : '--'}</div>
                                                                    </div>
                                                                    <div className="rowOrderPad changeColorHover">
                                                                        <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_contract_size</Lang>}</div>
                                                                        <div className='showTitle'>{this.data.contract_size || this.state.commodityInfoObj.contract_size || '--'}</div>
                                                                    </div>
                                                                    <div className="rowOrderPad changeColorHover text-capitalize">
                                                                        <div className='showTitle leftRowOrderPad'>{<Lang>lang_unit</Lang>}</div>
                                                                        <div className='showTitle capitalize'>{this.data.unit || this.state.commodityInfoObj.unit || '--'}</div>
                                                                    </div>
                                                                </NoTag>
                                                                : null
                                                            }
                                                            {
                                                                isSymbolFuture
                                                                    ? <NoTag>
                                                                        <div className="rowOrderPad changeColorHover">
                                                                            <div className='showTitle leftRowOrderPad text-capitalize'><Lang>lang_net_position</Lang></div>
                                                                            <div style={{ display: 'flex' }}>
                                                                                <div className='showTitle'>{volumePosition && averagePrice ? volumePosition + ' @ ' + averagePrice : '--'}</div>
                                                                                {
                                                                                    volumePosition && averagePrice
                                                                                        ? <div className={`closePositionNewOrder btn btn-close`} onClick={this.closePosition} ><img className="icon" src="common/close.svg" /></div>
                                                                                        : null
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                        <div className="rowOrderPad changeColorHover">
                                                                            <div className='leftRowOrderPad text-capitalize'><Lang>lang_profit_per_loss</Lang></div>
                                                                            <div style={{ display: 'flex' }}>
                                                                                <div className='profitLoss'><div className={`showTitle ${proitLoss === 0 ? 'normalText' : proitLoss && this.changeColor(proitLoss)}`}>{proitLoss || proitLoss === 0 ? formatNumberValue(proitLoss, true) : '--'}</div><span>&nbsp;{this.state.currency}</span></div>
                                                                            </div>
                                                                        </div>
                                                                    </NoTag>
                                                                    : null
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='footer'>
                                    <div className='line'></div>
                                    <div>
                                        <div className={`bigButtonOrder ${this.side === 'BUY' ? '' : 'sell'} ${(this.state.isChange && this.state.isConnected && !this.state.isLoading && checkRole(MapRoleComponent.MODIFY_BUY_OR_SELL_ORDER)) ? '' : 'disable'} `} onClick={() => {
                                            if (!checkRole(MapRoleComponent.MODIFY_BUY_OR_SELL_ORDER)) return;
                                            if (this.state.isLoading) return;
                                            this.getFees(() => this.state.isChange && this.state.isConnected && requirePin(() => this.confirmOrder()))
                                        }}>
                                            {isSymbolFuture
                                                ? <div>
                                                    <span className='size--4'>{this.state.isLoading ? <img src='common/Spinner-white.svg' /> : null} {this.state.contentButton}</span>
                                                    <span className='size--3'>{<Lang>lang_initial_margin_available_to_trade_is</Lang>} {showMoneyFormatter(cashAvailable, this.state.currency)} {this.state.currency}</span>
                                                </div>
                                                : <div>
                                                    <span className='size--4'>{this.state.isLoading ? <img src='common/Spinner-white.svg' /> : null} {this.state.contentButton}</span>
                                                    <span className='size--3'>{<Lang>lang_cash_available_to_trade_is</Lang>} {showMoneyFormatter(cashAvailable, this.state.currency)} {this.state.currency}</span>

                                                </div>
                                            }
                                        </div>
                                        <div className='orderAddition'>
                                            <div className={`clearAllData size--3 text-capitalize`} onClick={this.handleClearAllData.bind(this)}>
                                                <Lang>lang_clear_all_data</Lang>
                                            </div>
                                            {this.state.symbolObj && this.state.symbolObj.class === 'equity' && !isAUSymbol(this.state.symbolObj) && this.side === 'BUY' ? <div className='clearAllData size--3 underline italic' title='Cash Available to Buy US Securities does not include your settlement in T+2 & Others'>
                                                <Lang>lang_ask_different_in_cash_available</Lang>
                                            </div> : null}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            )
        } catch (error) {
            logger.error('render On ModifyOrder' + error)
            return null;
        }
    }
    getAnAccount() {
        getData(getUrlAnAccount(this.account_id)).then(res => {
            this.setState({
                currency: res.data[0] && res.data[0].currency
            })
        })
    }

    refreshData = () => {
        try {
            this.getMarketInfo()
        } catch (error) {
            logger.error('refreshData On ModifyOrder' + error)
        }
    }

    getMarketInfo = () => {
        try {
            if (!this.symbol) return;
            const decode = encodeURIComponent(this.symbol);
            const urlMarketInfo = makeSymbolUrl(decode);
            this.props.loading(true)
            getData(urlMarketInfo)
                .then(response => {
                    this.props.loading(false)
                    if (response.data && response.data.length > 0) {
                        this.props.send({
                            symbol: response.data[0],
                            keyWidget: 'Click_Open_Order_Pad'
                        })
                        this.setState({
                            symbolObj: response.data[0]
                        }, () => this.getFees())
                    }
                })
                .catch(error => {
                    logger.error(error)
                    this.props.loading(false)
                })
        } catch (error) {
            logger.error('getDataPrice On ModifyOrder' + error)
        }
    }
    componentDidMount() {
        try {
            const order = this.props.data;
            if (!order || !order.data) return;
            registerAccount(this.account_id, this.realtimeDataBalances, 'accountsummary');
            addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
            addEventListener(EVENTNAME.connectionChanged, this.changeConnection)
            this.getMarketInfo()
            this.checkUpdateValue()
            this.getCashByAccount()
            if (this.isSymbolFuture === 'future') this.getCommodityInfoUrl(this.data)
            if (this.props.currency === 'needGetAccount' || this.props.currency === '--' || !this.props.currency) this.getAnAccount()
            this.props.i18n.on('languageChanged', () => {
                this.renderContentButton(this.valueTemp);
            })
        } catch (error) {
            logger.error('componentDidMount On ModifyOrder' + error)
        }
    }

    componentWillUnmount() {
        removeEventListener(EVENTNAME.clickToRefresh, this.refreshData)
        removeEventListener(EVENTNAME.connectionChanged, this.changeConnection)
        unregisterAccount(this.account_id, this.realtimeDataBalances, 'accountsummary');
    }

    componentWillReceiveProps(nextProps) {
        if (this.timeoutRequestOrder) clearTimeout(this.timeoutRequestOrder)
    }
}

export default translate('translations')(ModifyOrder)
