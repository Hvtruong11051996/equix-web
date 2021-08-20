import React from 'react';
import {
    getUrlTotalPosition,
    postData,
    getData,
    makeSymbolUrl,
    makeFeelUrl,
    getLastOrder,
    getUrlAnAccount,
    requirePin,
    getUrlCheckErrorPlaceOrder,
    getCommodityInfoUrl,
    completeApi
} from '../../helper/request'
import {
    formatNumberPrice,
    formatNumberVolume,
    formatProfitLoss,
    countDecimalPart,
    showMoneyFormatter,
    genOrderType,
    mapError,
    isAUSymbol,
    checkValidTranslation,
    checkRole,
    checkShowAccountSearch,
    setNullLoadState,
    getCountryFromExchange,
    formatCompanyName,
    formatNumberValue,
    diff,
    getNumberToCharDate
} from '../../helper/functionUtils'
import InputDropDown from '../Inc/InputDrop';
import TablePrice from '../Inc/TablePriceOrder';
import exchangeEnum from '../../constants/exchange_enum';
import ORDER_TYPE from '../../constants/order_type';
import orderEnum from '../../constants/order_enum';
import role from '../../constants/role';
import errorValidate from '../../constants/error_validate';
import uuidv4 from 'uuid/v4';
import dataStorage from '../../dataStorage';
import SearchBox from '../SearchBox';
import SearchAccount from '../SearchAccount';
import logger from '../../helper/log';
import { regisRealtime, unregisRealtime } from '../../streaming';
import DatePicker from '../Inc/DatePicker';
import moment from 'moment';
import Lang from '../Inc/Lang/Lang';
import MapRoleComponent from '../../constants/map_role_component';
import DurationCustomInput from '../Inc/DurationCustomInput';
import exchangeTradingMarketEnum from '../../constants/exchange_trading_market_enum'
import SecurityDetailIcon from '../Inc/SecurityDetailIcon/SecurityDetailIcon';
import Flag from '../Inc/Flag';
import Toggle from '../Inc/Toggle';
import NoTag from '../Inc/NoTag';
import DropDown from '../DropDown/DropDown';
import sideEnum from '../../constants/enum';
import ExampleCustomInput from '../Inc/ExampleCustomInput/ExampleCustomInput';
import Icon from '../Inc/Icon/Icon';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'
import Mapping from '../../constants/dictionary'
import { LANG_CLASS } from '../../constants/symbol_class';

const auTimeZone = 'Australia/Sydney';
const usTimeZone = 'America/New_York';
const TIMEOUT_DEFAULT = 60 * 1000 * 2;

const PRODUCT = {
    FX: 'forex'
}
let DICTIONARY

export class NewOrder extends React.Component {
    constructor(props) {
        super(props);
        const initState = props.loadState()
        DICTIONARY = Mapping.getDictionary()
        this.isMount = false
        this.isClose = initState.data && initState.data.isClose
        this.requestId = null;
        this.listOrderType = []
        this.listDuration = []
        this.listExchange = []
        this.isValidBeforeConfirmOrder = false
        this.dicUserChoice = {}
        this.dicPositions = {};
        this.dicProfitVal = {};
        this.errClass = '';
        this.minDate = moment().tz(auTimeZone)
        if (this.minDate.format('HH') >= 8) this.minDate = this.minDate.add('day', 1)
        this.state = {
            isConnected: dataStorage.connected,
            side: (initState.side) || (props.data || {}).side || 'BUY',
            symbol: '',
            data: {},
            volume: (initState.data && initState.data.volume) || 0,
            condition: '',
            limitPrice: initState.limitPrice || 0,
            stopPrice: 0,
            duration: initState.duration || 'GTC',
            collapseTextDepcription: true,
            dataCashAccount: null,
            errorOrder: '',
            idShowWarning: false,
            unit: initState.unit || 'AUD',
            exchange: initState.exchange || '',
            symbolObj: (initState.data && initState.data.symbolObj) || initState.symbol || {},
            commodityInfoObj: {},
            estimatedPriceObj: {},
            accountObj: (props.data && checkShowAccountSearch()) ? props.data : {},
            clickToRefresh: false,
            isLoading: false,
            minDate: this.minDate,
            orderType: initState.orderType || ORDER_TYPE.MARKETTOLIMIT,
            currency: initState.currency,
            inputIsPicker: false
        };
        this.changeValue = this.changeValue.bind(this);
        this.realtimeDataBalances = this.realtimeDataBalances.bind(this);
        this.changeAccount = this.changeAccount.bind(this);
        this.renderDuration = this.renderDuration.bind(this);
        this.props.receive({
            account: this.changeAccount,
            symbol: this.changeValue
        });
        this.curAcc = ''
    }

    changeAccount(account) {
        if (!account) account = dataStorage.accountInfo;
        if (!account || !account.account_id) return;
        if (account.status === 'inactive') return
        if (!account) account = {};
        if (!this.state.accountObj || this.state.accountObj.account_id !== account.account_id) {
            unregisRealtime({ callback: this.realtimeDataBalances });
            regisRealtime({
                url: completeApi(`/portfolio?account_id=${account.account_id}`),
                callback: this.realtimeDataBalances,
                type: 'accountsummary'
            });
            this.isMount && this.setState({
                accountObj: account || {},
                currency: account.currency
            }, () => this.getCashByAccount())
        }
    }

    realtimeDataBalances(data) {
        if (!this.state.accountObj) return;
        if (data.account_id && this.state.accountObj.account_id !== data.account_id) return;
        if (!diff(this.state.dataCashAccount, data)) return
        this.isMount && this.setState({
            dataCashAccount: data
        });
    }

    changeValue(symbolObj) {
        this.props.saveState({
            data: {
                side: this.state.side,
                symbol: (symbolObj && symbolObj.symbol) || ''
            }
        })
        if (!symbolObj.isRightClick) {
            this.getDefaultPropertySymbol(symbolObj)
        } else {
            this.getDefaultPropertySymbol(symbolObj || {});
        }
    }

    async resetData(orderOption) {
        try {
            console.log(orderOption)
            this.dicUserChoice = {}
            let volume;
            let lastOrderObj;
            const state = this.props.loadState()
            if (orderOption && orderOption.volume) {
                volume = orderOption.volume;
            }
            if (lastOrderObj) {
                lastOrderObj.order_type = lastOrderObj.orderType
            } else {
                let accountId = (this.state.accountObj && this.state.accountObj.account_id) || '';
                if (accountId) {
                    const url = getLastOrder(accountId) + '&symbol=' + encodeURIComponent(this.state.symbol) || '';
                    await getData(url)
                        .then(response => {
                            if (response.data && response.data.length > 0) {
                                lastOrderObj = response.data[0]
                            }
                        })
                        .catch(err => {
                            logger.error('resetData On NewOrder ' + err)
                        })
                }
            }
            if (lastOrderObj && lastOrderObj.volume) {
                // volume = lastOrderObj.volume;
            }
            if ((state && state.data && state.data.volume)) {
                volume = Number(state.data.volume)
            }
            let orderType = isAUSymbol(this.state.symbolObj) ? ORDER_TYPE.LIMIT : ORDER_TYPE.MARKET;
            if (state && state.orderType) {
                orderType = state.orderType
            }
            let exchange = this.state.exchange
            if (state && state.exchange) {
                exchange = state.exchange
            }

            this.isMount && this.setState({
                exchange,
                collapseTextDepcription: true,
                condition: '',
                volume: (volume > 0 ? volume : -volume) || 0,
                errorOrder: '',
                idShowWarning: false,
                orderType,
                estimatedPriceObj: {}
            }, () => {
                this.setStateFromDicUserChoice(true, this.state.side)
            })
        } catch (error) {
            logger.error('resetData On NewOrder ' + error)
        }
    }

    async confirmOrder() {
        try {
            const validate = this.validateForm();
            if (validate) return;
            this.setNote()
            const arr = (this.state.exchange && this.state.exchange === 'ASX') ? ['ASX', 'ASX', 'ASX'] : this.state.exchange.match(/^([^:]+):(.*)/);
            const checkExchangeNSX = (arr && arr[0] && (['NSX:NSX', 'BSX:BSX', 'SSX:SSX'].includes(arr[0])))
            const exchangeObj = isAUSymbol(this.state.symbolObj) ? (checkExchangeNSX ? (this.state.symbolObj && this.state.symbolObj.display_exchange) : (arr && (arr[1] === 'AXW' && arr[2] === 'ASX' ? 'AXW' : arr[2])) || '') : (this.state.symbolObj && this.state.symbolObj.display_exchange)
            const accountId = (this.state.accountObj && this.state.accountObj.account_id) || ''
            const accountName = (this.state.accountObj && this.state.accountObj.account_name) || ''
            const displayName = (this.state.symbolObj && this.state.symbolObj.display_name) || ''
            const companyName = (this.state.symbolObj && this.state.symbolObj.company_name) || ''
            const securityName = (this.state.symbolObj && this.state.symbolObj.security_name) || ''
            const country = (this.state.symbolObj && this.state.symbolObj.country) || ''
            const unitcommonity = (this.state.commodityInfoObj && this.state.commodityInfoObj.unit) || '--'
            const contractSize = (this.state.commodityInfoObj && this.state.commodityInfoObj.contract_size) || '--'
            const displayExpireDate = (this.state.symbolObj && this.state.symbolObj.expiry_date)
            const firstNoticeDay = (this.state.symbolObj && this.state.symbolObj.first_noti_day)
            const masterCode = (this.state.symbolObj && this.state.symbolObj.master_code)
            const symbol = this.state.symbol
            const volume = this.state.volume
            const exchange = this.state.exchange
            const side = this.state.side
            const duration = this.state.duration
            const orderTypeByExchange = genOrderType(this.state.orderType)
            const objOrder = {
                code: symbol,
                volume: parseFloat(volume),
                order_type: orderTypeByExchange,
                note: this.note,
                is_buy: side === 'BUY',
                account_id: accountId,
                duration: duration,
                exchange: exchange
            };
            if ((isAUSymbol(this.state.symbolObj) || this.state.symbolObj.class === 'future') && duration === 'GTD') {
                objOrder.expire_date = this.state.minDate.format('YYYYMMDD')
            }
            const limitPrice = parseFloat(this.state.limitPrice)
            const stopPrice = parseFloat(this.state.stopPrice)
            switch (orderTypeByExchange) {
                case ORDER_TYPE.MARKETTOLIMIT:
                    break;
                case ORDER_TYPE.LIMIT:
                    objOrder['limit_price'] = limitPrice;
                    break;
                case ORDER_TYPE.STOP:
                    objOrder['stop_price'] = stopPrice;
                    break;
                case ORDER_TYPE.STOP_LIMIT:
                    objOrder['stop_price'] = stopPrice;
                    objOrder['limit_price'] = limitPrice;
                    break;
                default:
                    break;
            }
            this.timeoutRequestOrder = setTimeout(() => {
                this.isMount && this.setState({
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
                    typeConfirm: orderEnum.NEW_ORDER,
                    dataRequest: objOrder,
                    dataAccount: {
                        order_type: this.state.orderType,
                        note: this.note,
                        side: side,
                        account_name: accountName,
                        account_id: accountId,
                        symbol: symbol,
                        exchange: exchange,
                        display_name: displayName,
                        company_name: companyName,
                        security_name: securityName,
                        duration: duration,
                        expire_date: this.state.minDate.format('YYYYMMDD'),
                        limit_price: limitPrice,
                        stop_price: stopPrice,
                        volume: parseFloat(volume),
                        estimatedPriceObj: this.state.estimatedPriceObj,
                        trading_market: exchange || '',
                        display_exchange: exchangeObj,
                        currency: this.state.currency,
                        unit: this.state.unit,
                        isSymbolFuture: this.state.symbolObj.class,
                        country: country,
                        unitcommonity: unitcommonity,
                        contractSize: contractSize,
                        displayExpireDate: displayExpireDate,
                        firstNoticeDay: firstNoticeDay,
                        master_code: masterCode,
                        class: this.state.symbolObj.class
                    }
                }
            })
        } catch (error) {
            logger.error('confirmOrder On NewOrder ' + error)
        }
    }

    async checkValidBeforeConfirmOrder(orderPlaceObject) {
        try {
            const that = this
            let url = getUrlCheckErrorPlaceOrder()
            orderPlaceObject.note = JSON.stringify(orderPlaceObject.note)
            orderPlaceObject.client_order_id = uuidv4().replace(/-/g, '')
            const obj = { 'data': orderPlaceObject }
            this.isMount && this.setState({
                isLoading: true
            })
            await postData(url, obj)
                .then(response => {
                    if (response.data && response.data.errorCode === 'SUCCESS') {
                        that.isValidBeforeConfirmOrder = true
                        that.isMount && that.setState({
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
                        that.isMount && that.setState({
                            errorOrder: mapError(errorString, orderEnum.NEW_ORDER),
                            idShowWarning: true,
                            isLoading: false
                        }, () => that.hiddenWarning())
                    }
                })
                .catch(error => {
                    if (this.timeoutRequestOrder) clearTimeout(this.timeoutRequestOrder)
                    let errorContent = 'UnknownError'
                    if (error.response && error.response && error.response.errorCode) {
                        if (typeof error.response.errorCode === 'string') {
                            errorContent = error.response.errorCode
                        } else {
                            if (error.response.errorCode.length && error.response.errorCode.length > 0) {
                                errorContent = Math.min(...error.response.errorCode)
                            }
                        }
                    }

                    that.isValidBeforeConfirmOrder = false
                    that.isMount && that.setState({
                        isLoading: false,
                        errorOrder: mapError(errorContent, orderEnum.NEW_ORDER),
                        idShowWarning: true
                    }, () => that.hiddenWarning())
                    logger.error(error)
                })
        } catch (error) {
            logger.error(error)
        }
    }

    dataReceivedFromSearchBox(symbolObj) {
        try {
            if (symbolObj.symbol === this.state.symbol) return
            this.needToRefresh = true
            setNullLoadState(this)
            this.getDefaultPropertySymbol(symbolObj)
            this.props.send({
                symbol: symbolObj
            })
            this.props.saveState({
                data: {
                    side: this.state.side,
                    symbol: (symbolObj && symbolObj.symbol) || '',
                    currency: this.state.currency
                }
            })
        } catch (error) {
            logger.error('dataReceivedFromSearchBox On NewOrder ' + error)
        }
    }

    dataReceivedFromSearchAccount(data, isfirst = false) {
        try {
            if (data) {
                this.props.send({
                    account: data
                })
            }
            this.props.saveState({
                lastAccountId: data.account_id || '',
                accountName: data.account_name || '',
                currency: data.currency
            })
            let accountId = (this.state.accountObj && this.state.accountObj.account_id) || '';
            if (dataStorage.userInfo && dataStorage.userInfo.user_type === role.OPERATION) {
                unregisRealtime({ callback: this.realtimeDataBalances });
                if (!data.account_id) {
                    this.isMount && this.setState({
                        dataCashAccount: null,
                        accountObj: data,
                        currency: '--'
                    })
                } else {
                    regisRealtime({
                        url: completeApi(`/portfolio?account_id=${data.account_id}`),
                        callback: this.realtimeDataBalances,
                        type: 'accountsummary'
                    });
                    this.isMount && this.setState({
                        accountObj: data,
                        currency: data.currency
                    }, () => {
                        this.getCashByAccount(() => this.getFees());
                    })
                }
            } else {
                let value = data.account_id;
                if (accountId === value && !isfirst) return;
                dataStorage.accountInfo = data;
                dataStorage.account_id = value;
                localStorageNew.setItem('userAccount' + dataStorage.loginEmail, value);
                unregisRealtime({ callback: this.realtimeDataBalances });
                regisRealtime({
                    url: completeApi(`/portfolio?account_id=${data.account_id}`),
                    callback: this.realtimeDataBalances,
                    type: 'accountsummary'
                });
                this.isMount && this.setState({
                    accountObj: data,
                    currency: data.currency
                }, () => {
                    this.getCashByAccount(() => this.getFees());
                })
            }
        } catch (error) {
            logger.error('dataReceivedFromSearchAccount On NewOrder ' + error)
        }
    }

    componentWillUnmount() {
        try {
            this.isMount = false
            removeEventListener(EVENTNAME.clickToRefresh, this.refreshData)
            removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
            if (this.state.accountObj && this.state.accountObj.account_id) {
                unregisRealtime({ callback: this.realtimeDataBalances });
            }
        } catch (error) {
            logger.error('componentWillUnmount On NewOrder ' + error)
        }
    }

    checkEnableBuySell(disable, orderType = this.state.orderType) {
        const container = this.props.glContainer && this.props.glContainer._element[0]
        if (orderType === ORDER_TYPE.STOP_LIMIT && !disable) {
            if (this.state.side !== 'SELL') this.isMount && this.setState({ side: 'SELL' })
            setTimeout(() => {
                container.querySelector('.newOrderRoot .btnOrderRoot .btnOrder.btnBuy') && container.querySelector('.newOrderRoot .btnOrderRoot .btnOrder.btnBuy').classList.add('disable')
            }, 0);
        } else {
            container.querySelector('.newOrderRoot .btnOrderRoot .btnOrder.btnBuy') && container.querySelector('.newOrderRoot .btnOrderRoot .btnOrder.btnBuy').classList.remove('disable')
            if (disable) this.isMount && this.setState({ side: 'BUY' })
        }
    }

    setStateFromDicUserChoice(loadState, side) {
        const type_ = side + '_' + this.state.orderType
        const state = {}
        state.side = side
        const userChoice = this.dicUserChoice[type_]
        const initialState = this.props.loadState()
        if (userChoice) {
            userChoice.duration && (state.duration = userChoice.duration)
            state.limitPrice = userChoice.limitPrice
            state.stopPrice = userChoice.stopPrice
            state.minDate = userChoice.minDate
            userChoice.exchange && (state.exchange = userChoice.exchange)
            if (loadState) {
                if ((initialState && initialState.duration)) {
                    state.duration = initialState.duration
                }
                if ((initialState && initialState.limitPrice)) {
                    state.limitPrice = initialState.limitPrice
                }
                if ((initialState && initialState.stopPrice)) {
                    state.stopPrice = initialState.stopPrice
                }
                if ((initialState && initialState.minDate)) {
                    state.minDate = initialState.minDate
                }
                if ((initialState && initialState.exchange)) {
                    state.exchange = initialState.exchange
                }
            }
        } else {
            state.limitPrice = 0
            state.stopPrice = 0
            state.minDate = this.minDate
            state.duration = this.getDurationDefault(this.state.symbolObj, this.state.orderType);
            state.exchange = this.getExchangeDefault(this.state.symbolObj, this.state.orderType, state.duration)
            if (loadState) {
                if ((initialState && initialState.duration)) {
                    state.duration = initialState.duration
                }
                if ((initialState && initialState.limitPrice)) {
                    state.limitPrice = initialState.limitPrice
                }
                if ((initialState && initialState.stopPrice)) {
                    state.stopPrice = initialState.stopPrice
                }
                if ((initialState && initialState.minDate)) {
                    state.minDate = initialState.minDate
                }
                if ((initialState && initialState.exchange)) {
                    state.exchange = initialState.exchange
                }
            }
            this.dicUserChoice[type_] = state
        }
        this.getExchangeDefault(this.state.symbolObj, this.state.orderType, state.duration)
        this.isMount && this.setState(state, () => {
            this.getFees()
        })
    }

    saveToDicUserChoice(data, orderType = this.state.orderType, exchange = this.state.exchange) {
        let type_ = this.state.side + '_' + (orderType || this.state.orderType)
        const userChoice = this.dicUserChoice[type_]
        if (!userChoice) return
        if (this.dicUserChoice && userChoice) {
            if (data.duration) {
                userChoice.duration = data.duration
            }
            if (data.limitPrice || Number(data.limitPrice) === 0) {
                userChoice.limitPrice = data.limitPrice
            }
            if (data.stopPrice || Number(data.stopPrice) === 0) {
                userChoice.stopPrice = data.stopPrice
            }
            if (data.minDate) {
                userChoice.minDate = data.minDate
            }
            if (data.exchange || exchange) {
                userChoice.exchange = data.exchange || exchange
            }
        }
    }

    changeSide(side) {
        try {
            if (side !== this.state.side) {
                if (!(this.state.symbolObj && this.state.symbolObj.class === 'future')) this.checkEnableBuySell(false)
                this.setStateFromDicUserChoice(false, side)
            }
        } catch (error) {
            logger.error('changeSide On NewOrder ' + error)
        }
    }

    getExchangeDefault = (symbolObj = {}, orderType, duration) => {
        if (!Object.keys(symbolObj).length) return
        const key = this.getKeyBySymbol(symbolObj, `|${orderType}|${duration}`)
        const listExchange = DICTIONARY.EXCHANGE_MAPPING[key] || []
        this.listExchange = listExchange
        return (listExchange[0] && listExchange[0].value) || (symbolObj.exchanges && symbolObj.exchanges[0]) || ''
    }

    handleOnChangeOrderType(orderType) {
        try {
            if (orderType !== this.state.orderType) {
                const state = {}
                state.orderType = orderType
                state.duration = this.getDurationDefault(this.state.symbolObj, orderType)
                state.exchange = this.getExchangeDefault(this.state.symbolObj, orderType, state.duration)
                if (!(this.state.symbolObj && this.state.symbolObj.class === 'future')) this.checkEnableBuySell(false, orderType)
                this.props.saveState(state)
                this.isMount && this.setState(state, () => {
                    this.saveToDicUserChoice({ orderType }, orderType)
                    setTimeout(() => {
                        this.setStateFromDicUserChoice(false, this.state.side)
                        this.closeDropdown && this.closeDropdown()
                    }, 0);
                })
            }
        } catch (error) {
            logger.error('handleOnChangeOrderType On NewOrder ' + error)
        }
    }

    handleOnChangeDuration(duration) {
        try {
            if (!Object.keys(this.state.symbolObj).length) return
            if (duration !== this.state.duration) {
                const exchange = this.getExchangeDefault(this.state.symbolObj, this.state.orderType, duration)
                this.saveToDicUserChoice({ exchange, duration }, null, exchange)
                this.props.saveState(duration)
                let state = {
                    duration,
                    exchange,
                    minDate: this.minDate,
                    inputIsPicker: false
                }
                if (duration === 'GTD') {
                    state.enableGtd = true
                } else state.enableGtd = false
                this.isMount && this.setState(state, () => {
                    this.closeDropdown && this.closeDropdown()
                })
                setTimeout(() => {
                    if (duration === 'GTD' && this.elementDate && !this.state.inputIsPicker) {
                        this.elementDate.querySelector('.datepicker-input-period').addEventListener('change', (e) => {
                            this.lastDate = e.target.value
                        })
                    }
                }, 500);
            }
        } catch (error) {
            logger.error('handleOnChangeDuration On NewOrder ' + error)
        }
    }

    handleOnChangeExchange(exchange) {
        try {
            if (exchange !== this.state.exchange) {
                const state = {}
                state.exchange = exchange
                this.saveToDicUserChoice({ exchange: state.exchange }, null, exchange)
                this.props.saveState(state)
                this.isMount && this.setState(state, () => {
                    this.setStateFromDicUserChoice(false, this.state.side, true)
                    this.closeDropdown && this.closeDropdown()
                })
            }
        } catch (error) {
            logger.error('handleOnChangeExchange On NewOrder ' + error)
        }
    }

    handleInputVolume(e) {
        try {
            this.volumeChanged = true;
            let input = (e + '').replace(/[^\d]/g, '')
            input = input.replace(/^0+([1-9])/, '$1')
            let value = input + ''
            if (parseFloat(input) < 0) {
                value = '0'
            }
            value = value === '' ? 0 : value
            this.isMount && this.setState({
                volume: value
            })
            this.props.saveState({
                volume: value
            })
            this.setTimeOutID && clearTimeout(this.setTimeOutID)
            this.setTimeOutID = setTimeout(() => {
                this.getFees()
            }, 300);
        } catch (error) {
            logger.error('handleInputVolume On NewOrder ' + error)
        }
    }

    handleInputLimitPrice(e) {
        try {
            let input = e + '';
            input = input.replace(/^0+([1-9])/, '$1');

            if (!/^\d*\.?\d*$/.test(input)) {
                input = input.replace(/[^0-9.-]/g, '');
                input = input.replace(/-+/g, '');
                input = input.replace(/\.(\d*)\.+/g, '.$1');
            }

            let value = input + '';
            if (parseFloat(input) < 0) value = '0'
            if (value === '' || !value) value = 0;
            if (countDecimalPart(parseFloat(input)) > 4) return
            this.saveToDicUserChoice({ 'limitPrice': value })
            this.props.saveState({
                limitPrice: value
            })
            this.isMount && this.setState({
                limitPrice: value
            }, () => {
                this.setStateFromDicUserChoice(false, this.state.side)
            })
        } catch (error) {
            logger.error('handleInputLimitPrice On NewOrder ' + error)
        }
    }

    handleInputStopPrice(e) {
        try {
            let input = e + ''
            input = input.replace(/^0+([1-9])/, '$1');

            if (!/^\d*\.?\d*$/.test(input)) {
                input = input.replace(/[^0-9.-]/g, '');
                input = input.replace(/-+/g, '');
                input = input.replace(/\.(\d*)\.+/g, '.$1');
            }

            let value = input + '';
            if (parseFloat(input) < 0) value = '0'
            if (value === '' || !value) value = 0;
            if (countDecimalPart(parseFloat(input)) > 4) return
            this.saveToDicUserChoice({ 'stopPrice': value })
            this.isMount && this.setState({
                stopPrice: value
            }, () => {
                this.setStateFromDicUserChoice(false, this.state.side)
            })
        } catch (error) {
            logger.error('handleInputStopPrice On NewOrder ' + error)
        }
    }

    setNote() {
        try {
            const exchange = this.state.exchange
            const limitPrice = this.state.limitPrice
            const stopPrice = this.state.stopPrice
            this.note = {
                order_state: 'UserPlace',
                modify_action: 'null',
                exchange: exchange,
                data: {
                    side: this.state.side.toUpperCase(),
                    volume: this.state.volume
                }
            }
            switch (this.state.orderType) {
                case ORDER_TYPE.MARKET:
                    this.note.order_type = 'MARKET_ORDER'
                    break;
                case ORDER_TYPE.MARKETTOLIMIT:
                    this.note.order_type = 'MARKETTOLIMIT_ORDER'
                    break;
                case ORDER_TYPE.LIMIT:
                    this.note.order_type = 'LIMIT_ORDER'
                    this.note.data.limit_price = limitPrice
                    break;
                case ORDER_TYPE.STOP_LIMIT:
                    this.note.order_type = 'STOPLIMIT_ORDER'
                    this.note.data.limit_price = limitPrice
                    this.note.data.stop_price = stopPrice
                    break;
                case ORDER_TYPE.STOP:
                    this.note.order_type = 'STOP_ORDER'
                    this.note.data.stop_price = stopPrice
                    break;
                case ORDER_TYPE.STOPLOSS:
                    this.note.order_type = 'STOP_ORDER'
                    this.note.data.stop_price = stopPrice
                    break;
                default:
                    break;
            }
        } catch (error) {
            logger.error('setNote On NewOrder ' + error)
        }
    }

    getFees(cb) {
        try {
            this.timeoutFee && clearTimeout(this.timeoutFee)
            this.timeoutFee = setTimeout(() => {
                let accountId = (this.state.accountObj && this.state.accountObj.account_id) || (this.props.loadState().lastAccountId) || '';
                if (!this.state.symbol || !this.state.orderType || !accountId) return;
                const objOrder = {
                    code: this.state.symbol,
                    volume: parseFloat(this.state.volume),
                    exchange: this.state.exchange,
                    order_type: genOrderType(this.state.orderType),
                    is_buy: this.state.side === 'BUY',
                    account_id: accountId,
                    duration: this.state.duration
                };
                if (this.isClose) {
                    if (this.dicPositions[this.state.symbol] && !this.volumeChanged) {
                        if (!objOrder.is_buy) {
                            objOrder.volume = this.dicPositions[this.state.symbol].volume > 0
                                ? Math.abs(this.dicPositions[this.state.symbol].volume)
                                : 0;
                        }
                        if (objOrder.is_buy) {
                            objOrder.volume = this.dicPositions[this.state.symbol].volume < 0
                                ? Math.abs(this.dicPositions[this.state.symbol].volume)
                                : 0;
                        }
                    }
                } else {
                    if (this.dicPositions[this.state.symbol] && !this.volumeChanged) {
                        if (!objOrder.is_buy) {
                            objOrder.volume = this.dicPositions[this.state.symbol].volume > 0
                                ? Math.abs(this.dicPositions[this.state.symbol].volume)
                                : 0;
                        }
                        if (objOrder.is_buy) {
                            objOrder.volume = 0;
                        }
                    }
                }
                const limitPrice = parseFloat(this.state.limitPrice)
                const stopPrice = parseFloat(this.state.stopPrice)
                const orderTypeByExchange = genOrderType(this.state.orderType)
                switch (orderTypeByExchange) {
                    case ORDER_TYPE.MARKETTOLIMIT:
                        break;
                    case ORDER_TYPE.LIMIT:
                        objOrder['limit_price'] = limitPrice;
                        break;
                    case ORDER_TYPE.STOP:
                        objOrder['stop_price'] = stopPrice;
                        break;
                    case ORDER_TYPE.STOP_LIMIT:
                        objOrder['stop_price'] = stopPrice;
                        objOrder['limit_price'] = limitPrice;
                        break;
                    default:
                        break;
                }
                if (objOrder.volume > 0) {
                    const urlFees = makeFeelUrl();
                    const obj = { 'data': objOrder }
                    const requestId = uuidv4();
                    this.requestId = requestId;
                    postData(urlFees, obj, res => {
                        if (res.error) return
                        if (res && res.data && this.requestId === res.requestId) {
                            const state = {
                                estimatedPriceObj: res.data
                            }
                            if (!this.volumeChanged) state.volume = objOrder.volume
                            this.isMount && this.setState(
                                state
                            )
                        }
                    }, null, requestId)
                } else {
                    const state2 = {
                        estimatedPriceObj: {
                            order_amount_usd: null,
                            order_amount_aud: null,
                            order_amount: null,
                            order_amount_convert: null,
                            estimated_fees: null,
                            total: null,
                            initial_margin: null,
                            overnight_margin: null,
                            maintenance_margin: null
                        }
                    }
                    if (!this.volumeChanged) state2.volume = objOrder.volume
                    this.isMount && this.setState(state2)
                }
                cb && cb()
            }, 350)
        } catch (error) {
            logger.error('getFees On NewOrder ' + error)
        }
    }

    getCashByAccount(cb) {
        try {
            let accountId = (this.state.accountObj && this.state.accountObj.account_id) || '';
            if (!accountId) return;
            const urlBalancesAccount = getUrlTotalPosition(`${accountId}` || '');
            this.props.loading(true)
            getData(urlBalancesAccount)
                .then(response => {
                    this.props.loading(false)
                    if (!!response.data && this.curAcc !== response.data.account_id) {
                        this.getFees()
                        this.curAcc = response.data.account_id
                    }
                    if (response.data && Object.keys(response.data).length > 0) {
                        const dataCashAccount = response.data || {};
                        this.dicPositions = {};
                        this.dicProfitVal = {};
                        if (dataCashAccount.positions && dataCashAccount.positions.length) {
                            dataCashAccount.positions.map(item => {
                                if ((item.side + '').toLocaleLowerCase() !== 'close') {
                                    this.dicPositions[item.symbol] = item
                                }
                            });
                        }
                        if (dataCashAccount.profitVal && Object.keys(dataCashAccount.profitVal).length) {
                            this.dicProfitVal = dataCashAccount.profitVal;
                        }
                        cb && cb();
                        this.isMount && this.setState({
                            dataCashAccount: dataCashAccount
                        });
                    }
                })
                .catch(error => {
                    this.props.loading(false)
                    cb && cb();
                    this.isMount && this.setState({
                        dataCashAccount: null
                    })
                    logger.error('getCashByAccount On NewOrder ' + error)
                })
        } catch (error) {
            logger.error('getCashByAccount On NewOrder ' + error)
        }
    }

    hiddenWarning() {
        try {
            setTimeout(() => {
                this.errClass = ''
                this.isMount && this.setState({ idShowWarning: false })
            }, 4000)
        } catch (error) {
            logger.error('hiddenWarning On NewOrder ' + error)
        }
    }

    checkVolumeInput() {
        try {
            if (parseFloat(this.state.volume) === 0) {
                this.errClass = 'errVolume'
                this.isMount && this.setState({
                    errorOrder: errorValidate.OrderVolumeZero,
                    idShowWarning: true
                }, () => this.hiddenWarning())
                return true
            }
            return false;
        } catch (error) {
            logger.error('checkVolumeInput On NewOrder ' + error)
        }
    }

    checkLimitPrice() {
        try {
            if (parseFloat(this.state.limitPrice) === 0) {
                this.errClass = 'errLimitPrice'
                this.isMount && this.setState({
                    errorOrder: errorValidate.OrderLimitPriceZero,
                    idShowWarning: true
                }, () => this.hiddenWarning())
                return true
            }
            return false;
        } catch (error) {
            logger.error('checkLimitPrice On NewOrder ' + error)
        }
    }

    checkStopPrice() {
        try {
            if (parseFloat(this.state.stopPrice) === 0) {
                this.errClass = 'errStopPrice'
                this.isMount && this.setState({
                    errorOrder: errorValidate.OrderStopPriceZero,
                    idShowWarning: true
                }, () => this.hiddenWarning())
                return true
            }
            return false;
        } catch (error) {
            logger.error('checkStopPrice On NewOrder ' + error)
        }
    }

    validateForm() {
        try {
            let accountId = (this.state.accountObj && this.state.accountObj.account_id) || '';
            if (!accountId) {
                this.errClass = 'errNoneAccount'
                this.isMount && this.setState({
                    errorOrder: errorValidate.AccountMustBeSelectedFirst,
                    idShowWarning: true
                }, () => this.hiddenWarning())
                return true;
            }
            if (!this.state.symbol || this.state.symbol === '') {
                this.errClass = 'errNoneSymbol'
                this.isMount && this.setState({
                    errorOrder: errorValidate.CodeMustBeSelectedFirst,
                    idShowWarning: true
                }, () => this.hiddenWarning())
                return true;
            }
            if (this.period && this.state.enableGtd) {
                this.errClass = 'errPeriod'
                this.isMount && this.setState({
                    errorOrder: 'lang_period_date_format_invalid',
                    idShowWarning: true
                }, () => this.hiddenWarning())
                return true;
            }
            switch (this.state.orderType) {
                case ORDER_TYPE.STOP_LIMIT:
                    return this.checkVolumeInput() || this.checkLimitPrice() || this.checkStopPrice();
                case ORDER_TYPE.STOPLOSS:
                    return this.checkVolumeInput() || this.checkStopPrice();
                case ORDER_TYPE.LIMIT:
                    return this.checkVolumeInput() || this.checkLimitPrice();
                case ORDER_TYPE.LIMIT_SAXO:
                    return this.checkVolumeInput() || this.checkLimitPrice();
                case ORDER_TYPE.MARKETTOLIMIT:
                    return this.checkVolumeInput();
                case ORDER_TYPE.MARKET_SAXO:
                    return this.checkVolumeInput();
                default:
                    return this.checkVolumeInput();
            }
        } catch (error) {
            logger.error('validateForm On NewOrder ' + error)
        }
    }

    connectionChanged = (isConnected) => {
        if (!isConnected !== !this.state.isConnected) {
            this.isMount && this.setState({ isConnected }, () => {
                isConnected && this.refreshData('refresh');
            })
        }
    }

    renderRowOption() {
        const orderType = this.state.orderType;
        const limitPrice = this.state.limitPrice
        const stopPrice = this.state.stopPrice
        switch (orderType) {
            case ORDER_TYPE.MARKETTOLIMIT:
                return null
            case ORDER_TYPE.LIMIT:
                return (<div className={`rowOrderPad changeColorHover`}>
                    <div className={`leftRowOrderPad text-capitalize`}>{<Lang>lang_limit_price</Lang>}</div>
                    <div>
                        <InputDropDown
                            formatType='price'
                            suppressDropDown={true}
                            className='inputDropLimitPrice'
                            withInput={true}
                            // scroll={true}
                            sort={true}
                            type='number'
                            options={[]}
                            value={limitPrice}
                            onChangeInput={this.handleInputLimitPrice.bind(this)}
                        />
                    </div>
                </div>)
            case ORDER_TYPE.STOP_LIMIT:
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
                                value={stopPrice}
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
                                    value={limitPrice}
                                    type='number'
                                    scroll={true}
                                    sort={true}
                                    onChangeInput={this.handleInputLimitPrice.bind(this)}
                                />
                            </div>
                        </div>
                    </div>
                )
            case ORDER_TYPE.STOPLOSS:
                return (<div className={`rowOrderPad changeColorHover`}>
                    <div className={`leftRowOrderPad text-capitalize`}>{<Lang>lang_trigger_price</Lang>}</div>
                    <div>
                        <InputDropDown
                            formatType='price'
                            suppressDropDown={true}
                            className='inputDropStopPrice'
                            withInput={true}
                            options={[]}
                            value={stopPrice}
                            type='number'
                            scroll={true}
                            onChangeInput={this.handleInputStopPrice.bind(this)}
                        />
                    </div>
                </div>)
        }
    }

    scrollRoot() {
        const errorOrder = this.state.errorOrder;
        const domScroll = this.props.glContainer._element[0].querySelector('#Scroll_Root_NewOrder');
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

    handleClearAllData() {
        this.dicUserChoice = {}
        const orderType = isAUSymbol({}) ? ORDER_TYPE.LIMIT : ORDER_TYPE.MARKET // fix bug order type same initial
        this.listOrderType = [] // fix bug order type same initial
        const obj = {
            accountObj: dataStorage.lstAccountDropdown && (dataStorage.lstAccountDropdown.length <= 5) ? this.state.accountObj : {},
            symbol: '',
            symbolObj: {},
            data: {},
            collapseTextDepcription: true,
            condition: '',
            volume: 0,
            errorOrder: '',
            idShowWarning: false,
            duration: 'GTC',
            estimatedPriceObj: {},
            unit: 'AUD',
            exchange: '',
            side: 'BUY',
            minDate: this.minDate,
            limitPrice: 0,
            stopPrice: 0,
            orderType: orderType || ORDER_TYPE.MARKETTOLIMIT,
            currency: dataStorage.lstAccountDropdown && (dataStorage.lstAccountDropdown.length <= 5) ? this.state.currency : ''
        }
        if (dataStorage.listMapping && dataStorage.listMapping.length && dataStorage.listMapping.length !== 1) {
            obj.side = 'BUY'
        }
        this.props.loadState().lastAccountId = '';
        if (!dataStorage.lstAccountDropdown) {
            if (dataStorage.listMapping && dataStorage.listMapping.length && dataStorage.listMapping.length !== 1) {
                obj.accountObj = {};
            }
            if (checkShowAccountSearch()) {
                obj.dataCashAccount = null
            }
        }
        this.props.saveState(obj)
        this.isMount && this.setState(obj)
        const buyButton = document.querySelector('.btnOrder.btnBuy.sell.disable');
        buyButton && buyButton.classList.remove('disable');
    }

    handleChangeMinDate = (date) => {
        try {
            this.saveToDicUserChoice({ 'minDate': date })
            const minDateObj = {
                minDate: date
            }
            // this.props.saveState(minDateObj)
            this.isMount && this.setState(minDateObj, () => {
                this.setStateFromDicUserChoice(false, this.state.side)
            })
        } catch (error) {
            logger.error('handleChangeMinDate On NewOrder' + error)
        }
    };

    onChangeInputType = () => {
        this.isMount && this.setState({
            inputIsPicker: !this.state.inputIsPicker,
            minDate: this.minDate
        }, () => {
            if (this.state.inputIsPicker) this.period = false
            else {
                this.period = true
                const elm = this.elementDate.querySelector('.datepicker-input-period')
                elm.addEventListener('change', (e) => {
                    this.lastDate = e.target.value
                })
                if (this.lastDate) {
                    elm.value = this.lastDate
                }
            }
        })
    }

    renderDuration(duration, options) {
        return (
            <div>
                <DropDown
                    translate={true}
                    skipnull={true}
                    closeDropdown={disableDrop => this.closeDropdown = disableDrop}
                    className="DropDownOrderType"
                    options={options}
                    value={duration}
                    onChange={this.handleOnChangeDuration.bind(this)}
                />
            </div>
        )
    }

    checkAUSymbol = symbolObj => {
        if (symbolObj && symbolObj.country) {
            return symbolObj.country.slice(0, 2).toLocaleLowerCase() === 'au'
        }
        return getCountryFromExchange(symbolObj.exchange) === 'au'
    }

    getDisplayExchange = symbolObj => {
        const exchange = (symbolObj && symbolObj.exchanges && symbolObj.exchanges[0]) || ''
        const exchangeObj = exchangeTradingMarketEnum[exchange]
        if (!exchange || !exchangeObj) {
            return (symbolObj.display_exchange || '--')
        }
        return exchangeObj.display ? exchangeObj.display : '--'
    }
    closePosition = () => {
        requirePin(() => {
            const volumePosition = (this.dicPositions[this.state.symbol] || {}).volume
            const side = volumePosition > 0 ? sideEnum.SELLSIDE : sideEnum.BUYSIDE
            dataStorage.goldenLayout.addComponentToStack('Order', {
                stateOrder: 'NewOrder',
                data: {
                    symbol: this.state.symbolObj.symbol,
                    account_id: this.state.accountObj.account_id,
                    volume: volumePosition,
                    isClose: true,
                    side
                }
            })
        })
    }
    changeColor = (value) => {
        try {
            const val = value;
            if (!value) return;
            value = formatNumberValue(value, true)
            if (value === 0 && value === '--') {
                return 'normalText'
            }
            if (val < 0) {
                return 'priceDown'
            }
            if (val > 0) {
                return 'priceUp'
            }
            return 'normalText'
        } catch (error) {
            logger.error('changeColor On TablePriceOrder ' + error)
        }
    }

    renderExchange = exchange => {
        return (
            <InputDropDown
                className="DropDownOrderType"
                options={this.listExchange}
                value={exchange}
                closeDropdown={disableDrop => this.closeDropdown = disableDrop}
                onChange={this.handleOnChangeExchange.bind(this)}
            />
        )
    }

    getKeyBySymbol = (symbolObj, suffix = '') => {
        const exchange = symbolObj.exchanges && symbolObj.exchanges.length && symbolObj.exchanges[0]
        if (['NSX', 'BSX', 'SSX'].includes(exchange)) return exchange + suffix
        const country = (symbolObj.country + '').toLowerCase()
        if (symbolObj.class === 'future') return symbolObj.class
        if (country === 'us') return country
        return symbolObj.class + suffix
    }

    render() {
        try {
            let isShowingReatailMappingOneAccount = false
            if (dataStorage.userInfo &&
                (dataStorage.userInfo.user_type === role.RETAIL || dataStorage.userInfo.user_type === role.ADVISOR) &&
                dataStorage.accountInfo &&
                (dataStorage.accountInfo.status === 'active') &&
                dataStorage.lstAccountDropdown &&
                dataStorage.lstAccountDropdown.length === 1) {
                isShowingReatailMappingOneAccount = true
            }
            const exchange = this.state.symbolObj && this.state.symbolObj.exchanges && this.state.symbolObj.exchanges[0];
            const checkShowAccount = checkShowAccountSearch();
            let lastAccountId = this.props.loadState().lastAccountId
            if (dataStorage.listMapping.indexOf(lastAccountId) < 0) {
                lastAccountId = ''
            }
            const isSymbolFuture = (this.state.symbolObj && this.state.symbolObj.class === 'future')

            const averagePrice = this.dicPositions[this.state.symbol] && formatNumberPrice(this.dicPositions[this.state.symbol].average_price, true)
            const volumePosition = this.dicPositions[this.state.symbol] && formatNumberVolume(this.dicPositions[this.state.symbol].volume, true)
            const profitLoss = this.dicProfitVal && this.dicProfitVal[this.state.symbol]
            const accountId = (checkShowAccount || isShowingReatailMappingOneAccount)
                ? ((this.state.accountObj && this.state.accountObj.account_id) || '')
                : ''
            const accountName = (checkShowAccount || isShowingReatailMappingOneAccount)
                ? ((this.state.accountObj && this.state.accountObj.account_name) || '')
                : ''
            const isAUOrderIRESS = this.state.exchange && this.checkAUSymbol(this.state.symbolObj);
            const side = this.state.side
            const companyName = formatCompanyName(this.state.symbolObj)
            const tradingHalt = (this.state.symbolObj && this.state.symbolObj.trading_halt) || ''
            const classproduct = (this.state.symbolObj && this.state.symbolObj.class) || '--'
            const displayName = (this.state.symbolObj && this.state.symbolObj.display_name) || ''
            const masterCode = (this.state.symbolObj && this.state.symbolObj.display_master_code) || '--'
            const masterName = (this.state.symbolObj && this.state.symbolObj.display_master_name) || '--'
            const unitcommonity = (this.state.commodityInfoObj && this.state.commodityInfoObj.unit) || '--'
            const contractSize = (this.state.commodityInfoObj && this.state.commodityInfoObj.contract_size) || '--'
            const displayExpireDate = (this.state.symbolObj && this.state.symbolObj.expiry_date)
            const firstNoticeDay = (this.state.symbolObj && this.state.symbolObj.first_noti_day)
            let cashAvailable = null;
            if (this.state.symbolObj.symbol && this.state.dataCashAccount) {
                if (this.state.symbolObj.class === 'future') {
                    cashAvailable = this.state.dataCashAccount.initial_margin_available
                } else if (isAUSymbol(this.state.symbolObj)) {
                    cashAvailable = this.state.dataCashAccount.available_balance_au || this.state.dataCashAccount.cash_available_au;
                } else {
                    cashAvailable = this.state.dataCashAccount.available_balance_us || this.state.dataCashAccount.cash_available_us;
                }
            }
            const isDisable = !this.state.isConnected || this.state.isLoading || !checkRole(MapRoleComponent.PLACE_BUY_OR_SELL_ORDER) || classproduct === PRODUCT.FX
            return (
                <div className={`newOrderContainer size--4`}>
                    <div style={{ height: '100%' }}>
                        <div className={`newOrderRoot ${this.errClass}`}>
                            <div className='body'>
                                <div id='Scroll_Root_NewOrder'>
                                    <div className={`errorOrder size--3 ${this.state.idShowWarning ? '' : 'myHidden'}`}>{this.scrollRoot()}</div>
                                    <div className='newOrderWigetContainer'>
                                        <div className='newOrderBody size--3'>
                                            <div>
                                                <Toggle className='title' nameToggle='lang_account_security_information' />
                                                <div className='container'>
                                                    <div>
                                                        <div className={`rowOrderPad changeColorHover`}>
                                                            <div className={`showTitle text-capitalize`}>{<Lang>lang_account</Lang>}</div>
                                                            <div className='accountSearch size--3'>
                                                                <div className='accountSearchRow'>
                                                                    {
                                                                        checkShowAccount
                                                                            ? <SearchAccount
                                                                                accountId={accountId}
                                                                                formName='newOrder'
                                                                                dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount.bind(this)} formName='newOrder' />
                                                                            : <div className={`showTitle onlyCompanyName size--3 changeColorHover`}>{`${accountName} ${accountId ? '(' + accountId + ')' : ''}`}</div>
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {
                                                            checkShowAccount
                                                                ? <div className={`showTitle rowOrderPad onlyCompanyName size--3 changeColorHover`}>{`${accountName} ${accountId ? '(' + accountId + ')' : ''}`}</div>
                                                                : null
                                                        }
                                                        <div className='rowOrderPad changeColorHover'>
                                                            <div className={`showTitle text-capitalize`}>{<Lang>lang_code</Lang>}</div>
                                                            <div className='newOrder-code-security'>
                                                                <SearchBox
                                                                    contingentOrder={this.props.contingentOrder}
                                                                    resize={this.props.resize}
                                                                    loading={this.props.loading}
                                                                    trading_halt={tradingHalt}
                                                                    obj={this.state.symbolObj}
                                                                    placing={false}
                                                                    symbol={this.state.symbol}
                                                                    display_name={displayName}
                                                                    dataReceivedFromSearchBox={this.dataReceivedFromSearchBox.bind(this)}
                                                                    checkNewOrder={true}
                                                                />
                                                            </div>
                                                        </div>
                                                        {
                                                            displayName
                                                                ? <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_security</Lang>}</div>
                                                                    <div className='showTitle size--3 changeColorHover flexVerticalCenter'>
                                                                        <div>{companyName.toUpperCase()}</div>
                                                                        <div className='flexVerticalCenter'><SecurityDetailIcon
                                                                            {...this.props}
                                                                            symbolObj={this.state.symbolObj}
                                                                            iconStyle={{ position: 'unset', top: 'unset', transform: 'unset', marginLeft: 8 }}
                                                                        /></div>
                                                                    </div>
                                                                </div>
                                                                : null
                                                        }
                                                        {
                                                            isSymbolFuture
                                                                ? <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_master_code</Lang>}</div>
                                                                    <div className='showTitle size--3 changeColorHover symbolflag'>{masterCode.toUpperCase()} {masterCode === '--' ? '' : <Flag symbolObj={this.state.symbolObj} />}</div>
                                                                </div>
                                                                : null
                                                        }
                                                        {
                                                            isSymbolFuture
                                                                ? <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_master_name</Lang>}</div>
                                                                    <div className='showTitle size--3 changeColorHover'>{masterName.toUpperCase()}</div>
                                                                </div>
                                                                : null
                                                        }
                                                    </div>
                                                    <div>
                                                        {
                                                            classproduct && displayName
                                                                ? <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_product</Lang>}</div>
                                                                    <div className='showTitle size--3 changeColorHover text-uppercase'>{<Lang>{LANG_CLASS[classproduct] || classproduct}</Lang>}</div>
                                                                </div>
                                                                : null
                                                        }
                                                        <TablePrice receive={this.props.receive} symbolObj={this.state.symbolObj} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <Toggle className='title' nameToggle='lang_order_information'></Toggle>
                                                <div className='container'>
                                                    <div>
                                                        <div className={`rowOrderPad changeColorHover`}>
                                                            <div className='showTitle text-capitalize'>{<Lang>lang_side</Lang>}</div>
                                                            <div className={`btnOrderRoot ${side === 'BUY' ? '' : ' sell'}`}>
                                                                <div className={`btnOrder btnBuy size--3 ${side === 'BUY' ? 'buy' : 'sell'} text-uppercase`} onClick={() => this.changeSide('BUY')}>
                                                                    {<Lang>lang_buy</Lang>}
                                                                </div>
                                                                <div className={`btnOrder btnSell size--3 ${side === 'BUY' ? 'buy' : 'sell'} text-uppercase`} onClick={() => this.changeSide('SELL')}>
                                                                    {<Lang>lang_sell</Lang>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className={`rowOrderPad changeColorHover`}>
                                                            <div className={`showTitle text-capitalize`}>{<Lang>lang_quantity</Lang>}</div>
                                                            <div className={``}>
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
                                                            <div className={`showTitle text-capitalize`}>{<Lang>lang_order_type</Lang>}</div>
                                                            <div>
                                                                <DropDown
                                                                    translate={true}
                                                                    skipnull={true}
                                                                    closeDropdown={disableDrop => this.closeDropdown = disableDrop}
                                                                    className="DropDownOrderType"
                                                                    options={this.listOrderType}
                                                                    value={this.state.orderType}
                                                                    onChange={this.handleOnChangeOrderType.bind(this)}
                                                                />
                                                            </div>
                                                        </div>
                                                        {this.renderRowOption()}
                                                    </div>
                                                    <div>
                                                        <div className={`rowOrderPad changeColorHover`}>
                                                            <div className={`showTitle text-capitalize`}>{<Lang>lang_duration</Lang>}</div>
                                                            {this.renderDuration(this.state.duration, this.listDuration)}
                                                        </div>
                                                        {this.state.duration === 'GTD' ? (
                                                            <div className={`rowOrderPad changeColorHover`}>
                                                                <div className={'gtdTitle'}>
                                                                    <div className={`showTitle text-capitalize`}>
                                                                        <Lang>lang_date</Lang>
                                                                    </div>
                                                                    {
                                                                        this.state.inputIsPicker
                                                                            ? ''
                                                                            : <div className={'gtdIconDetail showTitle next'}>
                                                                                <Icon
                                                                                    src='action/info-outline'
                                                                                    hoverColor='rgb(197, 203, 206)'
                                                                                />
                                                                            </div>
                                                                    }
                                                                    <div style={{ display: 'none' }}>
                                                                        <div><u>Please enter period of time in format:</u></div>
                                                                        <br></br>
                                                                        <div> <b>{'<NUMBER>'}</b> Day <b>(D)</b>, Week <b>(W)</b>, Month <b>(M)</b>, Year <b>(Y)</b>. </div>
                                                                        <br></br>
                                                                        <div><i>E.g: 2D, 3W, 4M, 1Y</i></div>
                                                                        <br></br>
                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>Or <b style={{ marginLeft: '3px', marginRight: '3px' }}> Pick a Date </b>simply by selecting calendar icon <Icon src={'editor/insert-invitation'} style={{ 'height': '12px', 'width': '12px' }} color={'#757575'} /></div>
                                                                    </div>
                                                                </div>
                                                                <div className='inputDrop size--3 period' ref={dom => this.elementDate = dom}>
                                                                    {this.state.inputIsPicker
                                                                        ? <DatePicker
                                                                            timeZone={isAUSymbol(this.state.symbolObj) ? auTimeZone : usTimeZone}
                                                                            customInput={<ExampleCustomInput onChange={this.handleChangeMinDate} selected={this.state.minDate} hidenIconCalendar={true} />}
                                                                            selected={this.state.minDate}
                                                                            minDate={this.minDate}
                                                                            onChange={this.handleChangeMinDate}
                                                                            notSetMaxDate={true}
                                                                        /> : <DurationCustomInput onChange={this.handleChangeMinDate} lastDate={this.lastDate} selected={this.state.minDate} period={period => this.period = period} />
                                                                    }
                                                                    <span onClick={this.onChangeInputType}><Icon src={this.state.inputIsPicker ? 'image/edit' : 'editor/insert-invitation'} style={{ 'height': '16px', 'width': 'auto' }} color={'var(--secondary-default)'} /></span>
                                                                </div>
                                                            </div>
                                                        ) : null}
                                                        <div className='rowOrderPad changeColorHover'>
                                                            <div className='showTitle text-capitalize'>{<Lang>lang_exchange</Lang>}</div>
                                                            {isAUOrderIRESS ? (
                                                                <div>
                                                                    {this.renderExchange(this.state.exchange)}
                                                                </div>
                                                            ) : <div className='showTitle textShow size--3'>{this.getDisplayExchange(this.state.symbolObj)}</div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <Toggle className='title' nameToggle='lang_details'></Toggle>
                                                <div className='container'>
                                                    <div>
                                                        {
                                                            this.state.unit === 'USD'
                                                                ? <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad'>{<Lang>lang_order_amount_usd</Lang>}</div>
                                                                    <div className='showTitle'>{showMoneyFormatter((this.state.estimatedPriceObj.order_amount), this.state.unit)} USD</div>
                                                                </div>
                                                                : null
                                                        }
                                                        {
                                                            isSymbolFuture
                                                                ? <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_initial_margin_impact</Lang>}{' (' + (this.state.unit) + ')'}</div>
                                                                    <div className='showTitle'>{showMoneyFormatter(this.state.estimatedPriceObj.initial_margin_impact, this.state.unit)} {this.state.unit}</div>
                                                                </div>
                                                                : null
                                                        }
                                                        {
                                                            isSymbolFuture
                                                                ? <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_maintenance_margin_impact</Lang>}{' (' + (this.state.unit) + ')'}</div>
                                                                    <div className='showTitle'>{showMoneyFormatter(this.state.estimatedPriceObj.maintenance_margin_impact, this.state.unit)} {this.state.unit}</div>
                                                                </div>
                                                                : null
                                                        }
                                                        <div className="rowOrderPad changeColorHover">
                                                            <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_order_amount</Lang>}{this.state.currency ? ' (' + (this.state.currency) + ')' : ''}</div>
                                                            <div className='showTitle'>{showMoneyFormatter((this.state.estimatedPriceObj.order_amount_convert), this.state.currency)} {this.state.currency}</div>
                                                        </div>
                                                        {
                                                            isSymbolFuture
                                                                ? <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_initial_margin_impact</Lang>}{this.state.currency ? ' (' + (this.state.currency) + ')' : ''}</div>
                                                                    <div className='showTitle'>{showMoneyFormatter(this.state.estimatedPriceObj.initial_margin_impact_convert, this.state.currency)} {this.state.currency}</div>
                                                                </div>
                                                                : null
                                                        }
                                                        {
                                                            isSymbolFuture
                                                                ? <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_maintenance_margin_impact</Lang>}{this.state.currency ? ' (' + (this.state.currency) + ')' : ''}</div>
                                                                    <div className='showTitle'>{showMoneyFormatter(this.state.estimatedPriceObj.maintenance_margin_impact_convert, this.state.currency)} {this.state.currency}</div>
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
                                                            <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_estimated_fees</Lang>} {this.state.currency ? ' (' + (this.state.currency) + ')' : ''}</div>
                                                            <div className='showTitle'>{showMoneyFormatter(this.state.estimatedPriceObj.estimated_fees, this.state.currency)} {this.state.currency}</div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="rowOrderPad changeColorHover">
                                                            <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_estimated_total</Lang>}{this.state.currency ? ' (' + (this.state.currency) + ')' : ''}</div>
                                                            <div className='showTitle'>{showMoneyFormatter(this.state.estimatedPriceObj.total_convert, this.state.currency)} {this.state.currency}</div>
                                                        </div>
                                                        {isSymbolFuture
                                                            ? <NoTag>
                                                                {exchange !== 'XLME'
                                                                    ? <div className="rowOrderPad changeColorHover">
                                                                        <div className='showTitle leftRowOrderPad text-capitalize'><Lang>lang_expiry_date</Lang></div>
                                                                        <div className='showTitle'>{displayExpireDate ? getNumberToCharDate(displayExpireDate) : '--'}</div>
                                                                    </div>
                                                                    : null
                                                                }
                                                                <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'><Lang>lang_first_notice_day</Lang></div>
                                                                    <div className='showTitle'>{firstNoticeDay ? moment(firstNoticeDay).format('DD MMM YYYY') : '--'}</div>
                                                                </div>
                                                                <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_contract_size</Lang>}</div>
                                                                    <div className='showTitle'>{contractSize}</div>
                                                                </div>
                                                                <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_unit</Lang>}</div>
                                                                    <div className='showTitle capitalize'>{unitcommonity}</div>
                                                                </div>
                                                            </NoTag>
                                                            : null
                                                        }
                                                        {(checkShowAccount || (dataStorage.lstAccountDropdown || dataStorage.lstAccountDropdown.length)) && displayName && isSymbolFuture
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
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'><Lang>lang_profit_per_loss</Lang></div>
                                                                    <div className='profitLoss'>
                                                                        <div className={`showTitle ${profitLoss === 0 ? '' : profitLoss && this.changeColor(profitLoss)}`}>
                                                                            {profitLoss ? `${formatProfitLoss(profitLoss)} ${this.state.currency}` : formatProfitLoss(profitLoss)}
                                                                        </div>
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
                                    <div className={`bigButtonOrder ${side === 'BUY' ? '' : 'sell'} ${isDisable ? 'disable' : ''}`} onClick={() => {
                                        if (!checkRole(MapRoleComponent.PLACE_BUY_OR_SELL_ORDER)) return
                                        if (this.state.isLoading) return;
                                        if (this.state.accountObj.account_id && this.state.symbolObj.symbol) {
                                            this.getFees(() => this.state.isConnected && requirePin(() => this.confirmOrder()))
                                        } else {
                                            this.state.isConnected && requirePin(() => this.confirmOrder())
                                        }
                                    }} >
                                        {isSymbolFuture
                                            ? <div>
                                                <span className='size--4 text-uppercase'>{this.state.isLoading ? <img src='common/Spinner-white.svg' /> : null} {side === 'BUY' ? <Lang>lang_place_buy_order</Lang> : <Lang>lang_place_sell_order</Lang>}</span>
                                                <span className='size--3'>{<Lang>lang_initial_margin_available_to_trade_is</Lang>} {showMoneyFormatter(cashAvailable, this.state.currency)} {this.state.currency || '--'}</span>
                                            </div>
                                            : <div>
                                                <span className='size--4 text-uppercase'>{this.state.isLoading ? <img src='common/Spinner-white.svg' /> : null} {side === 'BUY' ? <Lang>lang_place_buy_order</Lang> : <Lang>lang_place_sell_order</Lang>}</span>
                                                <span className='size--3'>{<Lang>lang_cash_available_to_trade_is</Lang>} {showMoneyFormatter(cashAvailable, this.state.currency)} {this.state.currency || '--'}</span>
                                            </div>
                                        }
                                    </div>
                                    <div className='orderAddition'>
                                        <div className={`text-capitalize ${dataStorage.userInfo && dataStorage.userInfo.user_type === role.OPERATION ? 'clearAllData size--3' : 'clearAllDataGuest size--3'} ${this.state.isLoading ? ' disabled' : ''}`} onClick={this.handleClearAllData.bind(this)}>
                                            <Lang>lang_clear_all_data</Lang>
                                        </div>
                                        {this.state.symbolObj && this.state.symbolObj.class === 'equity' && this.state.symbolObj.country === 'US' && !isAUSymbol(this.state.symbolObj) && this.state.side === 'BUY' ? <div className='clearAllData size--3 underline italic' title='Cash Available to Buy US Securities does not include your settlement in T+2 & Others'>
                                            <Lang>lang_ask_different_in_cash_available</Lang>
                                        </div> : null}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            )
        } catch (error) {
            logger.error('render On NewOrder ' + error)
        }
    }

    async getDefaultPropertySymbol(symbolObj = {}) {
        const state = this.props.loadState()
        const objState = {}
        let dataReset, orderForm
        let accountId = (state.account && state.account.account_id) || (state.data && state.data.account_id) || '';
        if (accountId) {
            const url = getUrlAnAccount(accountId)
            getData(url).then(response => {
                if (response.data && response.data[0]) {
                    this.dataReceivedFromSearchAccount(response.data[0], true)
                }
            })
        } else if (dataStorage.lstAccountCheck && dataStorage.lstAccountCheck.length && dataStorage.lstAccountCheck.length <= 5) {
            this.dataReceivedFromSearchAccount(dataStorage.lstAccountCheck[0].value, true)
        }
        if (!symbolObj.symbol) {
            orderForm = this.props.data;
            if (orderForm && orderForm.symbol && orderForm.symbol !== '') {
                const decode = encodeURIComponent(orderForm.symbol)
                const urlMarketInfo = makeSymbolUrl(decode);
                await getData(urlMarketInfo).then(response => {
                    if (response.data) symbolObj = response.data[0]
                })
            }
        }
        objState.symbolObj = symbolObj
        objState.symbol = symbolObj.symbol
        objState.unit = symbolObj.currency
        const orderTypeDefault = this.getOrderTypeBySymbol(symbolObj)
        objState.orderType = orderTypeDefault
        const durationDefault = this.getDurationDefault(symbolObj, orderTypeDefault)
        objState.duration = durationDefault
        objState.exchange = this.getExchangeDefault(symbolObj, orderTypeDefault, durationDefault)
        if (objState.symbolObj.class === 'future') this.getCommodityInfoUrl(objState)
        else {
            this.isMount && this.setState(objState, () => {
                this.resetData(dataReset)
                this.getCashByAccount()
                this.checkEnableBuySell(false)
            })
        }
    }

    getOrderTypeBySymbol = (symbolObj = {}) => {
        if (!Object.keys(symbolObj).length) return
        const key = this.getKeyBySymbol(symbolObj)
        const listOrderType = DICTIONARY.ORDER_TYPE_MAPPING[key] || []
        this.listOrderType = listOrderType
        return listOrderType[0] && listOrderType[0].value
    }

    getDurationDefault = (symbolObj = {}, orderType) => {
        if (!Object.keys(symbolObj).length) return
        const key = this.getKeyBySymbol(symbolObj, `|${orderType}`)
        const listDuration = DICTIONARY.DURATION_MAPPING[key] || []
        this.listDuration = listDuration
        return listDuration[0] && listDuration[0].value
    }

    getCommodityInfoUrl(state = {}) {
        const symbolObj = state.symbolObj
        const decode = encodeURIComponent(symbolObj.master_code || symbolObj.symbol)
        const urlComodityInfo = getCommodityInfoUrl(decode)
        getData(urlComodityInfo).then(res => {
            if (res.data && res.data[0]) {
                state.commodityInfoObj = res.data[0]
            }
            this.isMount && this.setState(state)
        })
    }

    refreshData = (eventName) => {
        try {
            if (eventName !== 'refresh') return;
            this.getCashByAccount(() => this.getFees());
        } catch (error) {
            logger.error('refreshData On newOrder' + error)
        }
    }
    componentDidMount() {
        try {
            this.isMount = true
            let accountId = (this.state.accountObj && this.state.accountObj.account_id) || '';
            if (accountId) {
                regisRealtime({
                    url: completeApi(`/portfolio?account_id=${accountId}`),
                    callback: this.realtimeDataBalances,
                    type: 'accountsummary'
                });
            }
            if (!checkShowAccountSearch()) {
                if (Object.keys(dataStorage.accountInfo).length) {
                    this.dataReceivedFromSearchAccount(dataStorage.accountInfo)
                }
            }
            this.getDefaultPropertySymbol(this.state.symbolObj)
            addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
            addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
            if (!this.state.inputIsPicker && this.elementDate) {
                this.elementDate.querySelector('.datepicker-input-period').addEventListener('change', (e) => {
                    this.lastDate = e.target.value
                })
            }
        } catch (error) {
            logger.error('componentDidMount On NewOrder ' + error)
        }
    }
}

export default NewOrder
