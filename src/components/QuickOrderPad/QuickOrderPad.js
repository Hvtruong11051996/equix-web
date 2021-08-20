import React from 'react';
import {
    getUrlTotalPosition,
    postData,
    getData,
    putData,
    makeSymbolUrl,
    makeFeelUrl,
    getUrlAnAccount,
    requirePin,
    getUrlCheckErrorPlaceOrder,
    makePlaceOrderUrl,
    getUrlCheckErrorModifyOrder,
    getUrlOrderResponseLatest,
    getUrlOrderById
} from '../../helper/request'
import {
    showMoneyFormatter,
    genOrderType,
    mapError,
    isAUSymbol,
    checkValidTranslation,
    checkRole,
    checkShowAccountSearch,
    formatCompanyName,
    diff,
    parseNumber,
    formatExpireDate,
    isJsonString,
    mapContentWarning,
    saveDataSetting,
    uppercaser
} from '../../helper/functionUtils'
import { _optionsDurationSaxo, _optionsDuration, optionsDurationSaxo, defaultDurations } from '../../constants/options_duration';
import ORDER_TYPE from '../../constants/order_type';
import orderEnum from '../../constants/order_enum';
import role from '../../constants/role';
import errorValidate from '../../constants/error_validate';
import uuidv4 from 'uuid/v4';
import dataStorage from '../../dataStorage';
import SearchBox from '../SearchBox';
import SearchAccount from '../SearchAccount';
import logger from '../../helper/log';
import {
    registerAllOrders,
    registerAccount,
    registerUser,
    unregisterAllOrders,
    unregisterAccount,
    unregisterUser
} from '../../streaming';
import config from '../../../public/config'
import DatePicker from '../Inc/DatePicker';
import moment from 'moment';
import Lang from '../Inc/Lang/Lang';
import MapRoleComponent from '../../constants/map_role_component';
import ExampleCustomInput from '../Inc/ExampleCustomInput';
import exchangeTradingMarketEnum from '../../constants/exchange_trading_market_enum'
import SecurityDetailIcon from '../Inc/SecurityDetailIcon/SecurityDetailIcon';
import Flag from '../Inc/Flag';
import Toggle from '../Inc/Toggle';
import NoTag from '../Inc/NoTag';
import DropDown from '../DropDown/DropDown';
import Mapping from '../../constants/dictionary'
import NumberInput from '../Inc/NumberInput';
import DurationCustomInput from '../Inc/DurationCustomInput';
import Icon from '../Inc/Icon';
import Confirm from '../Inc/Confirm';
import durationeEnum from '../../constants/duration_enum';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'

const auTimeZone = 'Australia/Sydney';
const usTimeZone = 'America/New_York';
const TIMEOUT_DEFAULT = 60 * 1000 * 2;
let DICTIONARY

export class OrdersPad extends React.Component {
    constructor(props) {
        super(props);
        const initState = props.state || {}
        DICTIONARY = Mapping.getDictionary()
        this.data = (initState.data && initState.data.data) || initState.data || {}
        this.isModifyOrder = initState.stateOrder && initState.stateOrder === 'ModifyOrder'
        this.isChange = !this.isModifyOrder
        this.isClose = this.data.isClose
        this.dicPositions = {};
        this.dicProfitVal = {};
        this.dicUserChoice = {};
        this.minDate = moment().tz(auTimeZone)
        this.contingent = initState && initState.contingentOrder;
        if (this.minDate.format('HH') >= 8) this.minDate = this.minDate.add('day', 1)
        this.objDataOrder = {
            side: (this.contingent ? 'SELL' : '') || (this.data.side && this.data.side.toUpperCase()) || 'BUY',
            duration: this.data.duration || 'GTC',
            quantity: (this.data.quantity) || 0,
            volume: (this.data.volume) || 0,
            limitPrice: initState.limitPrice || this.data.limit_price || 0,
            stopPrice: this.data.stop_price || 0,
            symbolObj: (this.data.symbolObj) || {},
            symbol: this.data.symbol || '',
            minDate: this.minDate,
            estimatedPriceObj: {},
            inputIsPicker: false,
            accountId: this.data.account_id || '',
            optionOrderType: [],
            optionsDuration: [],
            optionsExchange: [],
            disableSide: this.contingent ? 'disable' : ''
        }
        this.accountId = this.objDataOrder.accountId
        this.symbol = this.objDataOrder.symbol
        this.typeConfirm = this.isModifyOrder ? orderEnum.MODIFY_ORDER : orderEnum.NEW_ORDER
        this.dontSaveOrder = this.contingent ? dataStorage.dataSetting.dontSaveOrderContingent : dataStorage.dataSetting.dontSaveOrder
        if (!dataStorage.dataSetting.saveAsDefaultOrder) dataStorage.dataSetting.saveAsDefaultOrder = {}
        if (!dataStorage.dataSetting.saveAsDefaultOrderContingent) dataStorage.dataSetting.saveAsDefaultOrderContingent = {}
        this.dicSaveAsDefault = this.contingent ? dataStorage.dataSetting.saveAsDefaultOrderContingent : dataStorage.dataSetting.saveAsDefaultOrder
        this.dicKeySaveAsDefault = []
        this.tabOptionOrderTypeSaxo = [
            { label: <Lang>lang_limit</Lang>, value: 'Limit' },
            { label: <Lang>lang_market</Lang>, value: 'Market' }
        ]
        this.tabOptionOrderFuture = [
            !this.contingent ? { label: <Lang>lang_limit</Lang>, value: 'Limit' } : { label: <Lang>lang_stop_loss</Lang>, value: 'StopLoss' },
            !this.contingent ? { label: <Lang>lang_market</Lang>, value: 'Market' } : { label: <Lang>lang_stop_limit</Lang>, value: 'StopLimit' }
        ]
        this.minDate = moment().tz(auTimeZone)
        if (this.minDate.format('HH') >= 8) this.minDate = this.minDate.add('day', 1)
        this.state = {
            isConnected: dataStorage.connected
        }
    }

    connectionChanged = (isConnected) => {
        if (!isConnected !== !this.state.isConnected) {
            this.setState({ isConnected }, () => {
                isConnected && this.refreshData();
            })
        }
    }

    refreshData = () => {
        try {
            this.getCashByAccount();
            this.checkOrderExisted()
        } catch (error) {
            logger.error('refreshData On OrdersV2' + error)
        }
    }
    settingChanged = (setting) => {
        let state = this.props.state;
        if (!this.contingent && setting && setting.hasOwnProperty('checkQuickOrderPad') && !setting.checkQuickOrderPad) {
            requirePin(() => dataStorage.goldenLayout.addComponentToStack('Order', { stateOrder: state.stateOrder, data: state.data }));
            this.props.close()
        }
    }
    componentDidMount() {
        try {
            const accountId = this.accountId || ''
            if (accountId) {
                registerAccount(accountId, this.realtimeDataBalances, 'accountsummary');
            }
            if (!checkShowAccountSearch()) {
                if (dataStorage.accountInfo) {
                    this.dataReceivedFromSearchAccount(dataStorage.accountInfo)
                }
            }
            registerAllOrders(this.realtimeData, 'order')
            if (!this.contingent) registerUser(dataStorage.userInfo.user_id, this.settingChanged, 'user_setting');
            this.getDefaultPropertySymbol(this.objDataOrder.symbolObj)
            addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
            addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
            if (!this.objDataOrder.inputIsPicker && this.elementDate) {
                this.elementDate.querySelector('.datepicker-input-period').addEventListener('change', (e) => {
                    this.lastDate = e.target.value
                })
            }
        } catch (error) {
            logger.error('componentDidMount On OrdersV2 ' + error)
        }
    }

    componentWillUnmount() {
        try {
            if (this.dontSaveOrder) {
                let data
                if (this.contingent) {
                    data = {
                        dontSaveOrderContingent: this.dontSaveOrder,
                        saveAsDefaultOrderContingent: {}
                    }
                } else {
                    data = {
                        dontSaveOrder: this.dontSaveOrder,
                        saveAsDefaultOrder: {}
                    }
                }
                Object.assign(dataStorage.dataSetting, data)
                saveDataSetting({ data }).then(() => {
                    console.log('dontSaveOrder = true and clear saveAsDefaultOrder')
                })
            }
            unregisterAllOrders(this.realtimeData, 'order');
            if (!this.contingent) unregisterUser(dataStorage.userInfo.user_id, this.settingChanged, 'user_setting');
            const accountId = this.accountId || ''
            removeEventListener(EVENTNAME.clickToRefresh, this.refreshData)
            removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
            if (accountId) {
                unregisterAccount(accountId, this.realtimeDataBalances, 'accountsummary');
            }
        } catch (error) {
            logger.error('componentWillUnmount On OrdersV2 ' + error)
        }
    }

    updateUI = () => {
        if (this.timeoutId) clearTimeout(this.timeoutId)
        this.timeoutId = setTimeout(() => {
            this.forceUpdate()
        }, 100);
    }

    disableError = () => {
        if (this.state.errorOrder && !this.state.waiting) {
            this.errClass = ''
            this.setState({ errorOrder: '' })
        }
    }

    dataReceivedFromSearchAccount = (data) => {
        unregisterAccount(this.accountId, this.realtimeDataBalances, 'accountsummary');
        registerAccount(data.account_id, this.realtimeDataBalances, 'accountsummary');
        this.objDataOrder.accountObj = data
        this.accountId = data.account_id
        this.objDataOrder.currency = data.currency
        this.getCashByAccount()
    }

    dataReceivedFromSearchBox = (symbolObj) => {
        try {
            if (symbolObj.symbol === this.objDataOrder.symbolObj.symbol) return
            this.objDataOrder.volume = 0
            this.objDataOrder.limitPrice = 0
            this.objDataOrder.stopPrice = 0
            if (!this.contingent) this.objDataOrder.side = 'BUY'
            this.objDataOrder.displayExchange = ''
            this.dicUserChoice = {}
            this.objDataOrder.symbolObj = symbolObj
            this.objDataOrder.estimatedPriceObj = {}
            this.getDefaultPropertySymbol(symbolObj)
        } catch (error) {
            logger.error('dataReceivedFromSearchBox On NewOrder ' + error)
        }
    }

    realtimeDataBalances = (data) => {
        if (!this.accountObj) return;
        if (this.accountId !== data.account_id) return;
        if (!diff(this.objDataOrder.dataCashAccount, data)) return
        this.objDataOrder.dataCashAccount = data
        this.updateUI()
    }

    getCashByAccount() {
        try {
            let accountId = this.accountId || '';
            if (!accountId) return;
            const urlBalancesAccount = getUrlTotalPosition(`${accountId}` || '');
            getData(urlBalancesAccount)
                .then(response => {
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
                        this.objDataOrder.dataCashAccount = dataCashAccount
                        if (this.timeoutGetFee) clearTimeout(this.timeoutGetFee)
                        this.timeoutGetFee = setTimeout(() => this.getFees(), 300)
                    }
                })
                .catch(error => {
                    this.objDataOrder.dataCashAccount = null
                    logger.error('getCashByAccount On OrdersV2 ' + error)
                    this.updateUI()
                })
        } catch (error) {
            logger.error('getCashByAccount On OrdersV2 ' + error)
        }
    }

    checkClassDisable = (side) => {
        if (!this.isModifyOrder) return ''
        if (side !== this.objDataOrder.side) return 'disable'
    }

    getFees(cb, noValidate) {
        try {
            let accountId = this.accountId || '';
            if ((!this.objDataOrder.symbol || !this.objDataOrder.orderTypeDrop || !accountId) && !noValidate) {
                this.updateUI()
                return;
            }
            const objOrder = {
                code: this.objDataOrder.symbolObj.symbol,
                volume: parseFloat(this.objDataOrder.volume),
                exchange: this.objDataOrder.exchange,
                order_type: genOrderType(this.objDataOrder.orderTypeDrop),
                is_buy: this.objDataOrder.side === 'BUY',
                account_id: accountId,
                duration: this.objDataOrder.duration
            };
            const holdingData = this.dicPositions[this.objDataOrder.symbol]
            if (holdingData && !this.volumeChanged && !this.isModifyOrder) {
                if (!objOrder.is_buy) {
                    objOrder.volume = holdingData.volume > 0
                        ? Math.abs(holdingData.volume)
                        : 0;
                } else {
                    if (this.isClose) {
                        objOrder.volume = holdingData.volume < 0
                            ? Math.abs(holdingData.volume)
                            : 0;
                    } else {
                        objOrder.volume = 0;
                    }
                }
            }
            const limitPrice = parseFloat(this.objDataOrder.limitPrice)
            const stopPrice = parseFloat(this.objDataOrder.stopPrice)
            const orderTypeByExchange = genOrderType(this.objDataOrder.orderTypeDrop)
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
                        this.objDataOrder.estimatedPriceObj = res.data
                        if (!this.volumeChanged) this.objDataOrder.volume = objOrder.volume
                        this.updateUI()
                    }
                }, null, requestId)
            } else {
                const state2 = {
                    order_amount_usd: null,
                    order_amount_aud: null,
                    order_amount: null,
                    order_amount_convert: null,
                    estimated_fees: null,
                    total: null,
                    total_convert: null,
                    initial_margin: null,
                    overnight_margin: null,
                    maintenance_margin: null
                }
                Object.assign(this.objDataOrder.estimatedPriceObj, state2)
                if (!this.volumeChanged) this.objDataOrder.volume = objOrder.volume
                this.updateUI()
            }
            cb && cb()
        } catch (error) {
            logger.error('getFees On OrdersV2 ' + error)
        }
    }

    async getDefaultPropertySymbol(symbolObj) {
        // Get data back from search box
        const objState = {}
        if (this.accountId) {
            const url = getUrlAnAccount(this.accountId)
            getData(url).then(response => {
                if (response.data && response.data[0]) {
                    this.dataReceivedFromSearchAccount(response.data[0], true)
                }
            })
        }
        if (symbolObj && symbolObj.symbol) {
            objState.symbolObj = symbolObj
        } else {
            if (this.data && this.data.symbol && this.data.symbol !== '') {
                const decode = encodeURIComponent(this.data.symbol)
                const urlMarketInfo = makeSymbolUrl(decode);
                await getData(urlMarketInfo).then(response => {
                    if (response.data) {
                        objState.symbolObj = response.data[0];
                    }
                })
            }
        }

        if (objState.symbolObj) {
            this.symbol = objState.symbolObj.symbol
            if (!this.lastSymbol) this.lastSymbol = this.symbol
            this.dicKeySaveAsDefault = []
            if (!this.isModifyOrder) {
                objState.exchange = (objState.symbolObj.exchanges && objState.symbolObj.exchanges[0]) || ''
                objState.symbol = objState.symbolObj.symbol
                objState.unit = objState.symbolObj.currency
                const key = this.getKeyBySymbol(objState.symbolObj)
                this.objDataOrder.optionOrderType = this.sortOptionsDropdown(DICTIONARY.ORDER_TYPE_MAPPING[key] || [])
                Object.assign(this.objDataOrder, objState)
                this.getCashByAccount()
                await this.handleOnChangeOrderType(this.objDataOrder.optionOrderType[0] && this.objDataOrder.optionOrderType[0].value, true)
            } else {
                const data = this.data
                this.objDataOrder.symbolObj = objState.symbolObj
                this.oldVolume = data.volume
                this.oldLimitPrice = data.limit_price
                this.oldStopPrice = data.stop_price
                this.broker_order_id = data.broker_order_id

                this.objDataOrder.orderTypeDrop = data.order_type
                this.objDataOrder.volume = this.oldVolume
                this.objDataOrder.limitPrice = this.oldLimitPrice
                this.objDataOrder.stopPrice = this.oldStopPrice
                this.objDataOrder.exchange = data.exchange
                this.objDataOrder.filled = data.filled_quantity
                Object.assign(this.objDataOrder, objState)
                this.getCashByAccount()
                this.getTextButton()
            }
        }
    }

    sortOptionsDropdown = (options = []) => {
        const priority = {
            'ASX:BESTMKT': 10,
            'ASX': 9,
            'ASX:ASXCP': 8,
            'AXW:ASX': 7,
            'CXA:CXA': 6,
            'CXA:CXACP': 5,
            'CXA:qCXA': 4,
            'NSX:NSX': 3
        }
        const listExchanges = options.sort((a, b) => {
            return (priority[b.value] || 0) - (priority[a.value] || 0)
        })
        return listExchanges
    }

    saveToDicUserChoice = () => {
        if (!this.symbol) return
        let type_ = this.objDataOrder.side + '_' + this.objDataOrder.orderTypeDrop
        if (!this.lastType) this.lastType = type_
        if (!Object.keys(this.dicUserChoice).length) {
            this.dicUserChoice[type_] = {}
            this.dicUserChoice[type_].limitPrice = this.objDataOrder.limitPrice
            this.dicUserChoice[type_].stopPrice = this.objDataOrder.stopPrice
            this.dicUserChoice[type_].duration = this.objDataOrder.duration
            this.dicUserChoice[type_].exchange = this.objDataOrder.exchange
            this.lastType = type_
        } else {
            if (!this.dicUserChoice[type_]) {
                this.dicUserChoice[type_] = {}
                this.dicUserChoice[type_].limitPrice = 0
                this.dicUserChoice[type_].stopPrice = 0
                this.dicUserChoice[type_].duration = this.objDataOrder.optionsDuration[0].value
                this.dicUserChoice[type_].exchange = (this.objDataOrder.optionsExchange && this.objDataOrder.optionsExchange[0] && this.objDataOrder.optionsExchange[0].value) || this.objDataOrder.displayExchange
            } else {
                if (this.lastType === type_) {
                    this.dicUserChoice[type_].limitPrice = this.objDataOrder.limitPrice
                    this.dicUserChoice[type_].stopPrice = this.objDataOrder.stopPrice
                    this.dicUserChoice[type_].duration = this.objDataOrder.duration
                    this.dicUserChoice[type_].exchange = this.objDataOrder.exchange
                }
            }
            this.lastType = type_
        }
        this.setStateFromDicUserChoice(type_)
    }

    getKeyBySymbol = (symbolObj, suffix = '') => {
        const exchange = symbolObj.exchanges && symbolObj.exchanges.length && symbolObj.exchanges[0]
        if (['NSX', 'BSX', 'SSX'].includes(exchange)) return exchange + suffix
        const country = (symbolObj.country + '').toLowerCase()
        if (symbolObj.class === 'future') return symbolObj.class
        if (this.contingent) return 'contingent'
        if (country === 'us') return country
        return symbolObj.class + suffix
    }

    setStateFromDicUserChoice = (type) => {
        const type_ = type
        const state = {}
        const userChoice = this.dicUserChoice[type_]
        if (Object.keys(this.dicUserChoice).length) {
            if (this.dicUserChoice && userChoice) {
                state.limitPrice = userChoice.limitPrice
                state.stopPrice = userChoice.stopPrice
                state.duration = userChoice.duration
                state.exchange = userChoice.exchange
                if (this.contingent) {
                    state.optionsExchange = DICTIONARY.EXCHANGE_MAPPING['contingent']
                } else {
                    const key = this.getKeyBySymbol(this.objDataOrder.symbolObj, `|${this.objDataOrder.orderTypeDrop}|${state.duration}`)
                    state.optionsExchange = DICTIONARY.EXCHANGE_MAPPING[key] || []
                }
            }
            Object.assign(this.objDataOrder, state)
        }
        if (this.timeoutGetFee) clearTimeout(this.timeoutGetFee)
        this.timeoutGetFee = setTimeout(() => this.getFees(), 300)
        if (this.symbol && !this.isModifyOrder && !this.dontSaveOrder) {
            const symbolObj = this.objDataOrder.symbolObj || {}
            const _class = symbolObj.class || this.data.class
            const _country = symbolObj.country || this.data.country
            const _orderType = this.objDataOrder.orderTypeDrop
            const _side = this.objDataOrder.side || this.data.side
            this.typeSaveDefault = _class + '_' + _country + '_' + _orderType + '_' + _side
            const index = this.dicKeySaveAsDefault.indexOf(this.typeSaveDefault)
            if ((index < 0 || this.lastSymbol !== this.symbol) && this.dicSaveAsDefault[this.typeSaveDefault]) {
                if (index < 0) this.dicKeySaveAsDefault.push(this.typeSaveDefault)
                this.lastSymbol = this.symbol
                this.objDataOrder.duration = this.dicSaveAsDefault[this.typeSaveDefault].duration
                this.objDataOrder.exchange = this.dicSaveAsDefault[this.typeSaveDefault].exchange
                this.dicUserChoice[type_].duration = this.dicSaveAsDefault[this.typeSaveDefault].duration
                this.dicUserChoice[type_].exchange = this.dicSaveAsDefault[this.typeSaveDefault].exchange
                this.handleOnChangeExchange(null, this.dicUserChoice[type_].exchange)
            }
            if (!this.dicSaveAsDefault[this.typeSaveDefault]) {
                if (index < 0) this.dicKeySaveAsDefault.push(this.typeSaveDefault)
                this.lastSymbol = this.symbol
            }
        }
        this.updateUI()
        setTimeout(() => {
            if (this.objDataOrder.duration === 'GTD' && this.elementDate && !this.objDataOrder.inputIsPicker) {
                const elm = this.elementDate.querySelector('.datepicker-input-period')
                elm.addEventListener('change', (e) => {
                    this.lastDate = e.target.value
                })
                if (this.lastDate) elm.value = this.lastDate
            }
        }, 100);
        this.saveAsDefault()
    }

    saveAsDefault = (isSaveAsDefault) => {
        if (this.dontSaveOrder) return
        const symbolObj = this.objDataOrder.symbolObj || {}
        const _class = symbolObj.class || this.data.class
        const _country = symbolObj.country || this.data.country
        const _orderType = this.objDataOrder.orderTypeDrop
        const _side = this.objDataOrder.side || this.data.side
        this.typeSaveDefault = _class + '_' + _country + '_' + _orderType + '_' + _side
        if (isSaveAsDefault) this.dicKeySaveAsDefault.push(this.typeSaveDefault)
        if (!this.dicSaveAsDefault[this.typeSaveDefault]) this.dicSaveAsDefault[this.typeSaveDefault] = {}
        this.dicSaveAsDefault[this.typeSaveDefault].duration = this.objDataOrder.duration
        this.dicSaveAsDefault[this.typeSaveDefault].exchange = this.objDataOrder.exchange
        let data
        if (this.contingent) {
            data = {
                saveAsDefaultOrderContingent: this.dicSaveAsDefault
            }
        } else {
            data = {
                saveAsDefaultOrder: this.dicSaveAsDefault
            }
        }
        Object.assign(dataStorage.dataSetting, data)
        saveDataSetting({ data }).then(() => {
            console.log('saveAsDefaultOrder ok')
        })
    }

    handleOnChangeOrderType = async (value, isFirst) => {
        if (this.objDataOrder.orderTypeDrop === value && !isFirst) return
        this.objDataOrder.orderTypeDrop = value
        this.handleOnChangeDuration()
    }

    handleOnChangeDuration = (value) => {
        if (value) {
            this.objDataOrder.duration = value
        } else {
            const key = this.getKeyBySymbol(this.objDataOrder.symbolObj, `|${this.objDataOrder.orderTypeDrop}`)
            this.objDataOrder.optionsDuration = DICTIONARY.DURATION_MAPPING[key] || []
            this.objDataOrder.duration = this.objDataOrder.optionsDuration[0] && this.objDataOrder.optionsDuration[0].value
        }
        this.handleOnChangeExchange()
    }

    handleOnChangeExchange = (value, fill) => {
        if (value) {
            this.objDataOrder.exchange = value
            this.closeDropdown && this.closeDropdown()
        } else {
            const symbolObj = this.objDataOrder.symbolObj
            const isAUOrderIRESS = isAUSymbol(symbolObj);
            if (isAUOrderIRESS) {
                const key = this.getKeyBySymbol(symbolObj, `|${this.objDataOrder.orderTypeDrop}|${this.objDataOrder.duration}`)
                this.objDataOrder.optionsExchange = DICTIONARY.EXCHANGE_MAPPING[key] || []
                if (fill) this.objDataOrder.exchange = fill
                else this.objDataOrder.exchange = this.objDataOrder.optionsExchange[0] && this.objDataOrder.optionsExchange[0].value
            } else {
                const exchange = (symbolObj && symbolObj.exchanges && symbolObj.exchanges[0]) || ''
                const exchangeObj = exchangeTradingMarketEnum[exchange]
                if (!exchange || !exchangeObj) {
                    this.objDataOrder.displayExchange = symbolObj.display_exchange || '--'
                } else {
                    this.objDataOrder.displayExchange = exchangeObj.display ? exchangeObj.display : '--'
                }
            }
        }
        let isCheckValue = false
        this.objDataOrder.optionsExchange.map(item => {
            if (this.objDataOrder.exchange === item.value) isCheckValue = true
        })
        if (!isCheckValue && this.objDataOrder.optionsExchange.length) this.objDataOrder.exchange = this.objDataOrder.optionsExchange[0] && this.objDataOrder.optionsExchange[0].value
        this.saveToDicUserChoice()
    }

    handleInputPrice = (value, stateName) => {
        try {
            if (stateName === 'volume' && !this.volumeChanged) this.volumeChanged = true
            const obj = {}
            obj[stateName] = value || 0
            this.objDataOrder[stateName] = value || 0
            if (this.isModifyOrder) {
                if ((parseNumber(this.objDataOrder.volume) !== parseNumber(this.oldVolume)) ||
                    (parseNumber(this.objDataOrder.limitPrice) !== parseNumber(this.oldLimitPrice)) ||
                    (parseNumber(this.objDataOrder.stopPrice) !== parseNumber(this.oldStopPrice))) {
                    this.isChange = true;
                } else {
                    this.isChange = false;
                }
                this.getTextButton(true)
            }
            if (this.timeoutsaveToDicUserChoice) clearTimeout(this.timeoutsaveToDicUserChoice)
            this.timeoutsaveToDicUserChoice = setTimeout(() => this.saveToDicUserChoice(), 500)
        } catch (error) {
            logger.error('handleInputPrice On OrdersV2 ' + error)
        }
    }

    handleChangeMinDate = (date) => {
        try {
            if (date) {
                this.objDataOrder.minDate = date
                this.saveToDicUserChoice()
                this.updateUI()
            } else {
            }
        } catch (error) {
            logger.error('handleChangeMinDate On OrdersV2' + error)
        }
    };

    onChangeInputType = () => {
        this.objDataOrder.inputIsPicker = !this.objDataOrder.inputIsPicker
        this.objDataOrder.minDate = this.minDate
        if (this.objDataOrder.inputIsPicker) this.period = false
        else this.period = true
        this.saveToDicUserChoice()
    }

    getTextButton = (updateUI) => {
        try {
            if (this.isModifyOrder) {
                let changeText = '';
                if (this.objDataOrder.side.toUpperCase() === 'BUY') {
                    if (this.isChange) {
                        changeText = dataStorage.translate('lang_modify_buy_order')
                    } else {
                        changeText = dataStorage.translate('PLACE_BUY_ORDER')
                    }
                } else {
                    if (this.isChange) {
                        changeText = dataStorage.translate('lang_modify_sell_order')
                    } else {
                        changeText = dataStorage.translate('PLACE_SELL_ORDER')
                    }
                }
                this.textButton = changeText
                if (updateUI) this.updateUI()
            }
        } catch (error) {
            logger.error('renderContentButton On ModifyOrder' + error)
        }
    }

    changeSide = (side) => {
        try {
            if (side !== this.objDataOrder.side) {
                if (this.objDataOrder.disableSide && side === 'BUY') return
                if (this.isModifyOrder || this.state.isLoading) return
                this.objDataOrder.side = side
                if (this.symbol) this.saveToDicUserChoice()
                else this.updateUI()
            }
        } catch (error) {
            logger.error('changeSide On OrdersV2 ' + error)
        }
    }

    isCheckAsDefault = () => {
        if (this.state.isLoading) return
        this.dontSaveOrder = !this.dontSaveOrder
        if (!this.dontSaveOrder) {
            let data
            this.saveAsDefault(true)
            this.lastSymbol = this.symbol
            if (this.contingent && dataStorage.dataSetting.dontSaveOrderContingent) {
                data = {
                    dontSaveOrderContingent: this.dontSaveOrder
                }
            } else {
                data = {
                    dontSaveOrder: this.dontSaveOrder
                }
            }
            saveDataSetting({ data }).then(() => {
                console.log('dontSaveOrder = false')
            })
        }
        this.forceUpdate()
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

    handleClearAllData = () => {
        this.dicUserChoice = {}
        let obj = {}
        if (this.isModifyOrder) {
            this.isChange = false
            this.objDataOrder.volume = this.oldVolume
            this.objDataOrder.limitPrice = this.oldLimitPrice
            this.objDataOrder.stopPrice = this.oldStopPrice
        } else {
            obj = {
                accountObj: dataStorage.lstAccountDropdown && (dataStorage.lstAccountDropdown.length <= 5) ? this.objDataOrder.accountObj : {},
                symbol: '',
                symbolObj: {},
                orderTypeDrop: ORDER_TYPE.MARKETTOLIMIT,
                duration: 'GTC',
                exchange: '',
                optionOrderType: [],
                optionsDuration: [],
                optionsExchange: [],
                volume: 0,
                limitPrice: 0,
                stopPrice: 0,
                minDate: this.minDate,
                estimatedPriceObj: {},
                unit: 'AUD',
                side: this.contingent ? 'SELL' : 'BUY',
                disableSide: this.contingent ? 'disable' : '',
                displayExchange: '',
                currency: dataStorage.lstAccountDropdown && (dataStorage.lstAccountDropdown.length <= 5) ? this.objDataOrder.currency : ''
            }
            this.data = {}
            this.accountId = obj.accountObj.account_id || ''
            this.symbol = ''
            if (!dataStorage.lstAccountDropdown) {
                if (dataStorage.listMapping && dataStorage.listMapping.length && dataStorage.listMapping.length !== 1) {
                    obj.accountObj = {};
                }
                if (checkShowAccountSearch()) {
                    obj.dataCashAccount = null
                }
            }
        }
        const state = {
            idShowWarning: false,
            errorOrder: ''
        }
        if (this.isModifyOrder) {
            this.getTextButton();
            if (this.timeoutGetFee) clearTimeout(this.timeoutGetFee)
            this.timeoutGetFee = setTimeout(() => this.getFees(), 300)
        } else {
            Object.assign(this.objDataOrder, obj)
        }
        this.setState(state)
    }

    showConfirm = () => {
        let mess = 'lang_ask_place_order'
        if (this.isModifyOrder) mess = 'lang_ask_modify_order'
        this.isChange = false
        this.setState({
            isLoading: false
        })
        this.updateUI()
        Confirm({
            checkWindowLoggedOut: true,
            header: 'lang_confirm',
            message: mess,
            checkConnect: true,
            isOrderPopup: true,
            callback: () => {
                this.confirmOrder()
            },
            cancelCallback: () => {
                this.isChange = true
                this.updateUI()
            }
        })
    }

    confirmOrder() {
        try {
            this.setState({
                waiting: true,
                errorOrder: mapContentWarning(false, this.typeConfirm),
                isLoading: true
            }, () => {
                this.timeoutRequestOrder2 = setTimeout(() => {
                    this.isChange = true
                    this.setState({
                        errorOrder: 'lang_timeout_cannot_be_connected_server',
                        isLoading: false,
                        waiting: false
                    });
                }, TIMEOUT_DEFAULT)
                if (this.isModifyOrder) this.listenerModifyOrder(this.dataRequest);
                else this.listenerPlaceOrder(this.dataRequest);
            })
        } catch (error) {
            logger.error('confirmOrder On ConfirmOrder' + error)
        }
    }

    listenerModifyOrder = (orderModifyObject) => {
        const urlModifyOrder = makePlaceOrderUrl(`/${this.dataAccount.broker_order_id}`)
        const obj = { 'data': orderModifyObject }
        putData(urlModifyOrder, obj)
            .then(response => {
                this.handleResponseOrder(response)
            })
            .catch(error => {
                logger.error(error)
                this.handleError(error)
            })
    }

    listenerPlaceOrder = (orderPlaceObject) => {
        const urlPlaceOrder = makePlaceOrderUrl();
        this.clientOrderId = this.accountId + '_' + uuidv4().replace(/-/g, '')
        orderPlaceObject.client_order_id = this.clientOrderId;
        const obj = { 'data': orderPlaceObject }
        postData(urlPlaceOrder, obj)
            .then(response => {
                this.handleResponseOrder(response)
            })
            .catch(error => {
                logger.error(error)
                this.handleError(error)
            })
    }

    handleResponseOrder = (response) => {
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
                if (this.timeoutRequestOrder2) clearTimeout(this.timeoutRequestOrder2)
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
                this.isChange = true
                this.setState({
                    errorOrder: mapError(errorString, this.typeConfirm),
                    waiting: false,
                    isLoading: false
                })
            }
        }
    }

    checkOrderExisted(id) {
        let orderId;
        let url = '';
        if (this.isModifyOrder) {
            orderId = this.dataAccount.broker_order_id;
            url = getUrlOrderResponseLatest(orderId)
        } else {
            orderId = this.clientOrderId
            url = getUrlOrderResponseLatest(orderId, true)
        }

        orderId && url && getData(url).then(response => {
            if (response && response.data && response.data.length && response.data[0]) {
                const text = JSON.parse(response.data[0].text)
                const updated = response.data[0].updated ? new Date(response.data[0].updated).getTime() : null;
                logger.sendLog('receive order result: ' + id + ' ' + updated + ' ' + this.lastClick + ' ' + JSON.stringify(response.data));
                this.realtimeData(response.data[0], {}, text.title || '')
            }
        }).catch(() => {
            logger.sendLog('checkOrderExisted comfirmorder error')
        })
    }

    realtimeData = (dataObj, data, title) => {
        if ((!this.isModifyOrder && this.clientOrderId && this.clientOrderId !== dataObj.client_order_id) || (dataObj.account_id && this.accountId !== dataObj.account_id)) return
        if (this.dataAccount.broker_order_id) {
            if (dataObj.broker_order_id !== this.dataAccount.broker_order_id) return;
        }
        if (!title) return;
        if (!this.isModifyOrder && this.clientOrderId !== dataObj.client_order_id) return;
        if (/#TIMEOUT$/.test(title)) {
            if (this.timeoutRequestOrder) clearTimeout(this.timeoutRequestOrder)
            if (this.isRejected) return
            this.isChange = true
            this.setState({
                errorOrder: 'lang_timeout_cannot_be_connected_server',
                isLoading: false,
                waiting: false
            })
        }
        if (/#SUCCESS$/.test(title)) {
            if (this.intervalId) clearInterval(this.intervalId);
            this.isChange = false
            this.setState({
                isLoading: false,
                errorOrder: mapContentWarning(true, this.typeConfirm)
            }, () => this.hiddenWarning(true))
            return
        }
        if (/#REJECT$/.test(title)) {
            if (this.intervalId) clearInterval(this.intervalId);
            if (this.timeoutRequestOrder) clearTimeout(this.timeoutRequestOrder)
            if (this.timeoutRequestOrder2) clearTimeout(this.timeoutRequestOrder2)
            const dataParser = dataObj.text && isJsonString(dataObj.text);
            const text = dataParser ? dataParser.text : dataObj.text;
            const errorString = mapError(text || dataObj.reject_reason, this.typeConfirm);
            this.isRejected = true;
            this.isChange = true
            this.setState({
                errorOrder: errorString,
                isLoading: false,
                waiting: false
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
            errorOrder: mapError(errorString, this.typeConfirm),
            isLoading: false
        })
    }

    getDataByOrderId = async () => {
        const url = getUrlOrderById(this.broker_order_id)
        getData(url).then((res) => {
            if (res.data[0].order_type) this.objDataOrder.orderTypeDrop = res.data[0].order_type
        }).catch(error => {
            logger.error('getDataByOrderId on QuickOrderPad:' + error)
        })
    }

    checkVetting = async () => {
        try {
            const validate = this.validateForm();
            if (validate) return;
            this.setState({
                isLoading: true
            })
            if (this.isModifyOrder) {
                await this.getDataByOrderId()
            }
            this.setNote()
            const orderTypeByExchange = genOrderType(this.objDataOrder.orderTypeDrop)
            this.dataRequest = {}
            if (this.isModifyOrder) {
                this.dataRequest = {
                    broker_order_id: this.broker_order_id,
                    volume: parseFloat(this.objDataOrder.volume),
                    note: this.note
                };
            } else {
                this.dataRequest = {
                    code: this.objDataOrder.symbol,
                    volume: parseFloat(this.objDataOrder.volume),
                    order_type: orderTypeByExchange,
                    note: this.note,
                    is_buy: this.objDataOrder.side === 'BUY',
                    account_id: this.accountId,
                    duration: this.objDataOrder.duration,
                    exchange: this.objDataOrder.exchange
                };
            }
            if ((isAUSymbol(this.objDataOrder.symbolObj) ||
                this.objDataOrder.symbolObj.class === 'future') && this.objDataOrder.duration === 'GTD' &&
                !this.isModifyOrder) {
                this.dataRequest.expire_date = this.objDataOrder.minDate.format('YYYYMMDD')
            }
            const limitPrice = parseFloat(this.objDataOrder.limitPrice)
            const stopPrice = parseFloat(this.objDataOrder.stopPrice)
            switch (orderTypeByExchange) {
                case ORDER_TYPE.MARKETTOLIMIT:
                    break;
                case ORDER_TYPE.LIMIT:
                    this.dataRequest['limit_price'] = limitPrice;
                    break;
                case ORDER_TYPE.STOP:
                    this.dataRequest['stop_price'] = stopPrice;
                    break;
                case ORDER_TYPE.STOP_LIMIT:
                    this.dataRequest['stop_price'] = stopPrice;
                    this.dataRequest['limit_price'] = limitPrice;
                    break;
                default:
                    break;
            }
            this.timeoutRequestOrder = setTimeout(() => {
                this.isChange = true
                this.setState({
                    errorOrder: 'lang_timeout_cannot_be_connected_server',
                    isLoading: false,
                    waiting: false
                })
            }, TIMEOUT_DEFAULT);
            await this.checkValidBeforeConfirmOrder(this.dataRequest)
            if (!this.isValidBeforeConfirmOrder) return
            if (this.timeoutRequestOrder) clearTimeout(this.timeoutRequestOrder)
            this.dataAccount = {
                broker_order_id: this.broker_order_id || ''
            }
            this.showConfirm()
        } catch (error) {
            logger.error('confirmOrder On OrdersV2 ' + error)
        }
    }

    validateForm = () => {
        if (!this.isModifyOrder) {
            const accountId = this.accountId || '';
            if (!accountId && !this.errClass) {
                this.errClass = 'errNoneAccount'
                this.setState({
                    errorOrder: errorValidate.AccountMustBeSelectedFirst
                })
                return true;
            }
            if (!this.objDataOrder.symbol && !this.errClass) {
                this.errClass = 'errNoneSymbol'
                this.setState({
                    errorOrder: errorValidate.CodeMustBeSelectedFirst
                })
                return true;
            }
            if (this.period && this.objDataOrder.duration === 'GTD' && !this.errClass) {
                this.errClass = 'errPeriod'
                this.setState({
                    errorOrder: 'lang_period_date_format_invalid'
                })
                return true;
            }
        }
        switch (this.objDataOrder.orderTypeDrop) {
            case ORDER_TYPE.STOP_LIMIT:
                return this.checkVolumeInput() || this.checkLimitPrice();
            case ORDER_TYPE.STOPLOSS:
                return this.checkVolumeInput();
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
    }

    checkVolumeInput = () => {
        try {
            if (parseFloat(this.objDataOrder.volume) === 0 && !this.errClass) {
                this.errClass = 'errVolume'
                this.setState({
                    errorOrder: errorValidate.OrderVolumeZero
                })
                return true
            }
            if (this.objDataOrder.filled && this.isModifyOrder && !this.errClass) {
                if (this.objDataOrder.volume < this.objDataOrder.filled) {
                    this.errClass = 'errVolume'
                    this.setState({
                        errorOrder: errorValidate.VolumeMoreThanFilled
                    })
                    return true
                }
            }

            return false;
        } catch (error) {
            logger.error('checkVolumeInput On OrdersV2 ' + error)
        }
    }

    checkLimitPrice = () => {
        try {
            if (parseFloat(this.objDataOrder.limitPrice) === 0 && !this.errClass) {
                this.errClass = 'errLimitPrice'
                this.setState({
                    errorOrder: errorValidate.OrderLimitPriceZero
                })
                return true
            }
            return false;
        } catch (error) {
            logger.error('checkLimitPrice On OrdersV2 ' + error)
        }
    }

    checkStopPrice = () => {
        try {
            if (parseFloat(this.objDataOrder.stopPrice) === 0 && !this.errClass) {
                this.errClass = 'errStopPrice'
                this.setState({
                    errorOrder: errorValidate.OrderStopPriceZero
                })
                return true
            }
            return false;
        } catch (error) {
            logger.error('checkStopPrice On OrdersV2 ' + error)
        }
    }

    hiddenWarning(closeForm) {
        try {
            setTimeout(() => {
                this.errClass = ''
                this.setState({
                    errorOrder: '',
                    waiting: false
                })
                if (closeForm) this.props.close()
            }, 4000)
        } catch (error) {
            logger.error('hiddenWarning On OrdersV2 ' + error)
        }
    }

    setNote = () => {
        try {
            const exchange = this.objDataOrder.exchange
            const limitPrice = this.objDataOrder.limitPrice
            const stopPrice = this.objDataOrder.stopPrice
            const volume = this.objDataOrder.volume
            let modifyAction;
            if (volume > 0) {
                modifyAction = 'ADD'
            } else if (volume < 0) {
                modifyAction = 'REDUCE'
            } else {
                // Case volume = 0;
                if (this.objDataOrder.limitPrice > this.oldLimitPrice) {
                    modifyAction = 'ADD'
                } else {
                    modifyAction = 'REDUCE'
                }
            }
            this.note = {
                order_state: this.isModifyOrder ? 'UserAmend' : 'UserPlace',
                modify_action: this.isModifyOrder ? modifyAction : 'null',
                exchange: exchange,
                data: {
                    side: this.objDataOrder.side.toUpperCase(),
                    volume: this.objDataOrder.volume
                }
            }
            if (this.isModifyOrder) {
                this.note.data.stop_price = this.objDataOrder.stopPrice
                this.note.data.limit_price = this.objDataOrder.limitPrice
                this.note.data.volume_old = this.oldVolume
                this.note.data.stop_price_old = this.oldStopPrice
                this.note.data.limit_price_old = this.oldLimitPrice
            }
            switch (this.objDataOrder.orderTypeDrop) {
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
            logger.error('setNote On OrdersV2 ' + error)
        }
    }

    checkValidBeforeConfirmOrder = async (orderPlaceObject) => {
        try {
            const that = this
            let url, method
            orderPlaceObject.note = JSON.stringify(orderPlaceObject.note)
            if (this.isModifyOrder) {
                method = putData
                url = getUrlCheckErrorModifyOrder(orderPlaceObject.broker_order_id)
            } else {
                method = postData
                url = getUrlCheckErrorPlaceOrder()
                orderPlaceObject.client_order_id = uuidv4().replace(/-/g, '')
            }
            const obj = { 'data': orderPlaceObject }
            await method(url, obj)
                .then(response => {
                    if (that.timeoutRequestOrder) clearTimeout(that.timeoutRequestOrder)
                    if (response.data && response.data.errorCode === 'SUCCESS') {
                        that.isValidBeforeConfirmOrder = true
                    } else if (response.errorTimeOut) {
                        that.isChange = true
                        that.setState({
                            errorOrder: 'lang_timeout_cannot_be_connected_server',
                            isLoading: false,
                            waiting: false
                        });
                    } else {
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
                            errorOrder: mapError(errorString, orderEnum.NEW_ORDER),
                            isLoading: false
                        })
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
                    that.setState({
                        isLoading: false,
                        errorOrder: mapError(errorContent, orderEnum.NEW_ORDER),
                        idShowWarning: true
                    })
                    logger.error(error)
                })
        } catch (error) {
            logger.error(error)
        }
    }

    renderQuantity = () => {
        return (
            <div className={`rowOrderPad changeColorHover`}>
                <div className={`showTitle text-capitalize`}>{<Lang>lang_quantity</Lang>}</div>
                <div className={`inputDropVolume ${this.state.isLoading ? 'disabled-action' : ''}`}>
                    <div className={`inputDrop size--3`}>
                        <div>
                            <NumberInput
                                stateName='volume'
                                className={`inputDrop size--3 border-none cursor-text`}
                                decimal={0}
                                value={this.objDataOrder.volume}
                                onChange={this.handleInputPrice}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    renderLimitPrice = () => {
        return (
            <div className={`rowOrderPad changeColorHover`}>
                <div className={`leftRowOrderPad showTitle text-capitalize`}>{<Lang>lang_limit_price</Lang>}</div>
                <div className={`inputDrop size--3 ${this.state.isLoading ? 'disabled-action' : ''}`}>
                    <div className='inputDropLimitPrice '>
                        <NumberInput
                            stateName='limitPrice'
                            className={`inputDrop size--3 border-none cursor-text`}
                            decimal={4}
                            value={this.objDataOrder.limitPrice}
                            onChange={this.handleInputPrice}
                        />
                    </div>
                </div>
            </div>
        )
    }

    renderTriggerPrice = () => {
        return (
            <div className={`rowOrderPad changeColorHover`}>
                <div className={`leftRowOrderPad text-capitalize`}>{<Lang>lang_trigger_price</Lang>}</div>
                <div className={`inputDrop size--3 ${this.state.isLoading ? 'disabled-action' : ''}`}>
                    <div className='inputDropStopPrice'>
                        <NumberInput
                            stateName='stopPrice'
                            className={`inputDrop size--3 border-none`}
                            decimal={4}
                            value={this.objDataOrder.stopPrice}
                            onChange={this.handleInputPrice}
                        />
                    </div>
                </div>
            </div>
        )
    }

    renderOrderType = () => {
        const orderType = (this.data.class !== 'future' && this.objDataOrder.orderTypeDrop === ORDER_TYPE.STOP_LIMIT) ? 'lang_stop_Loss' : this.objDataOrder.orderTypeDrop
        return (
            <div className={`rowOrderPad changeColorHover`}>
                <div className={`showTitle text-capitalize`}>{<Lang>lang_order_type</Lang>}</div>
                {
                    this.isModifyOrder
                        ? <div><Lang>{orderType}</Lang></div>
                        : <NoTag>
                            {
                                this.objDataOrder.optionOrderType && this.objDataOrder.optionOrderType.length === 1
                                    ? <div className='text-capitalize' style={{ paddingRight: '12px' }}><Lang>{this.objDataOrder.optionOrderType[0].label}</Lang></div>
                                    : <div className={`${this.state.isLoading ? 'disabled-action' : ''}`}>
                                        <DropDown
                                            translate={true}
                                            skipnull={true}
                                            closeDropdown={disableDrop => this.closeDropdown = disableDrop}
                                            className="DropDownOrderType"
                                            options={this.objDataOrder.optionOrderType}
                                            value={this.objDataOrder.orderTypeDrop}
                                            onChange={this.handleOnChangeOrderType}
                                        />
                                    </div>
                            }
                        </NoTag>
                }
            </div>
        )
    }

    renderDuration = () => {
        return (
            <div className={`rowOrderPad changeColorHover`}>
                <div className={`showTitle text-capitalize`}>{<Lang>lang_duration</Lang>}</div>
                <div>
                    {
                        this.isModifyOrder
                            ? durationeEnum[this.objDataOrder.duration]
                            : <div className={`${this.state.isLoading ? 'disabled-action' : ''}`}>
                                <DropDown
                                    skipnull={true}
                                    closeDropdown={disableDrop => this.closeDropdown = disableDrop}
                                    className="DropDownOrderType"
                                    translate={true}
                                    options={this.objDataOrder.optionsDuration || []}
                                    value={this.objDataOrder.duration}
                                    onChange={this.handleOnChangeDuration}
                                />
                            </div>
                    }
                </div>
            </div>
        )
    }

    renderDurationGTD = () => {
        return (
            <NoTag>
                {
                    !this.isModifyOrder
                        ? <div className={`rowOrderPad changeColorHover `}>
                            <div className={'gtdTitle'}>
                                <div className={`showTitle text-capitalize`}>
                                    <Lang>lang_date</Lang>
                                </div>
                                {
                                    this.objDataOrder.inputIsPicker
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
                            <div className={`${this.state.isLoading ? 'disabled-action' : ''} inputDrop size--3 period`} ref={dom => this.elementDate = dom}>
                                {this.objDataOrder.inputIsPicker
                                    ? <DatePicker
                                        timeZone={isAUSymbol(this.objDataOrder.symbolObj) ? auTimeZone : usTimeZone}
                                        customInput={<ExampleCustomInput onChange={this.handleChangeMinDate} selected={this.objDataOrder.minDate} hidenIconCalendar={true} />}
                                        selected={this.objDataOrder.minDate}
                                        minDate={this.minDate}
                                        onChange={this.handleChangeMinDate}
                                        notSetMaxDate={true}
                                    /> : <DurationCustomInput formName='QuickOrder' onChange={this.handleChangeMinDate} lastDate={this.lastDate} selected={this.objDataOrder.minDate} period={period => this.period = period} />
                                }
                                <span onClick={this.onChangeInputType}><Icon src={this.objDataOrder.inputIsPicker ? 'image/edit' : 'editor/insert-invitation'} style={{ 'height': '16px', 'width': 'auto' }} color={'var(--secondary-default)'} /></span>
                            </div>
                        </div>
                        : <div className={`rowOrderPad changeColorHover`}>
                            <div className={`showTitle leftRowOrderPad`}><Lang>lang_date</Lang></div>
                            <div className={`btnOrderRoot text`}>
                                <div className={`btnOrder text size--3`}>{formatExpireDate(this.props.state.data.data || this.props.state.data)}</div>
                            </div>
                        </div>
                }
            </NoTag>
        )
    }

    renderExchange = () => {
        let displayExchange = ''
        if (isAUSymbol(this.objDataOrder.symbolObj) && this.contingent) {
            displayExchange = 'FIXED CO'
        } else {
            displayExchange = this.data.display_exchange
        }
        return (
            <div className='rowOrderPad changeColorHover'>
                <div className='showTitle text-capitalize'>{<Lang>lang_exchange</Lang>}</div>
                {
                    this.objDataOrder.displayExchange || !this.objDataOrder.exchange
                        ? <div className='showTitle textShow size--3'>{this.objDataOrder.displayExchange || '--'}</div>
                        : <NoTag>
                            {
                                this.isModifyOrder
                                    ? <div>{displayExchange}</div>
                                    : <div className={`${this.state.isLoading ? 'disabled-action' : ''}`}>
                                        <DropDown
                                            skipnull={true}
                                            formater={uppercaser}
                                            closeDropdown={disableDrop => this.closeDropdown = disableDrop}
                                            className="DropDownOrderType"
                                            options={this.objDataOrder.optionsExchange || []}
                                            value={this.objDataOrder.exchange}
                                            onChange={this.handleOnChangeExchange}
                                        />
                                    </div>
                            }
                        </NoTag>
                }
            </div>
        )
    }

    renderEmpty = () => {
        return (
            <div className='rowOrderPad'></div>
        )
    }

    getLstRender = () => {
        const orderType = this.objDataOrder.orderTypeDrop
        const duration = this.objDataOrder.duration
        if (orderType === ORDER_TYPE.LIMIT) {
            if (duration === 'GTD') {
                return [this.renderLimitPrice(), this.renderExchange(), this.renderDuration(), this.renderDurationGTD()]
            } else {
                return [this.renderLimitPrice(), this.renderEmpty(), this.renderDuration(), this.renderExchange()]
            }
        }
        if (orderType === ORDER_TYPE.MARKETTOLIMIT || orderType === ORDER_TYPE.MARKET) {
            if (duration === 'GTD') {
                return [this.renderEmpty(), this.renderExchange(), this.renderDuration(), this.renderDurationGTD()]
            } else {
                return [this.renderDuration(), this.renderExchange()]
            }
        }

        if (orderType === ORDER_TYPE.STOPLOSS) {
            if (duration === 'GTD') {
                return [this.renderTriggerPrice(), this.renderExchange(), this.renderDuration(), this.renderDurationGTD()]
            } else {
                return [this.renderTriggerPrice(), this.renderEmpty(), this.renderDuration(), this.renderExchange()]
            }
        }

        if (orderType === ORDER_TYPE.STOP_LIMIT) {
            if (duration === 'GTD') {
                return [this.renderTriggerPrice(), this.renderLimitPrice(), this.renderDuration(), this.renderDurationGTD(), this.renderExchange(), this.renderEmpty()]
            } else {
                return [this.renderTriggerPrice(), this.renderLimitPrice(), this.renderDuration(), this.renderExchange()]
            }
        }
        return []
    }

    render() {
        const lstRender = this.getLstRender()
        let isShowingReatailMappingOneAccount = false
        if (dataStorage.userInfo &&
            (dataStorage.userInfo.user_type === role.RETAIL || dataStorage.userInfo.user_type === role.ADVISOR) &&
            dataStorage.accountInfo &&
            (dataStorage.accountInfo.status === 'active') &&
            dataStorage.lstAccountDropdown &&
            dataStorage.lstAccountDropdown.length === 1) {
            isShowingReatailMappingOneAccount = true
        }
        const accountObj = this.objDataOrder.accountObj || {}
        const symbolObj = this.objDataOrder.symbolObj
        const checkShowAccount = checkShowAccountSearch();
        const accountId = (checkShowAccount || isShowingReatailMappingOneAccount)
            ? (this.accountId || '')
            : ''
        const accountName = (checkShowAccount || isShowingReatailMappingOneAccount)
            ? ((accountObj && accountObj.account_name) || this.data.account_name || '')
            : ''
        const displayName = (symbolObj && symbolObj.display_name) || ''
        const companyName = formatCompanyName(this.objDataOrder.symbolObj)
        const tradingHalt = (this.objDataOrder.symbolObj && this.objDataOrder.symbolObj.trading_halt) || ''
        const side = this.objDataOrder.side.toUpperCase()
        const isSymbolFuture = (this.objDataOrder.symbolObj && this.objDataOrder.symbolObj.class === 'future')
        let cashAvailable = null;
        const currency = this.objDataOrder.currency ? ' (' + (this.objDataOrder.currency) + ')' : ''
        if (this.objDataOrder.symbolObj && this.objDataOrder.symbolObj.symbol && this.objDataOrder.dataCashAccount) {
            if (this.objDataOrder.symbolObj.class === 'future') {
                cashAvailable = this.objDataOrder.dataCashAccount.initial_margin_available
            } else if (isAUSymbol(this.objDataOrder.symbolObj)) {
                cashAvailable = this.objDataOrder.dataCashAccount.available_balance_au || this.objDataOrder.dataCashAccount.cash_available_au;
            } else {
                cashAvailable = this.objDataOrder.dataCashAccount.available_balance_us || this.objDataOrder.dataCashAccount.cash_available_us;
            }
        }
        return (
            <div className={`newOrderContainer quickOrder size--4`} ref={domWrap => {
                domWrap && (domWrap.parentNode.parentNode.onclick = () => this.disableError())
            }}>
                <div style={{ height: '100%' }}>
                    <div className={`newOrderRoot ${this.errClass}`}>
                        <div className='body'>
                            <div id='Scroll_Root_NewOrder' ref={dom => {
                                this.dom = dom;
                            }}>
                                <div className={`errorOrder size--3 ${this.state.errorOrder ? '' : 'myHidden'} ${this.state.waiting ? 'yellow' : ''}`}>{this.scrollRoot()}</div>
                                <div className='newOrderWigetContainer'>
                                    <div className='newOrderBody size--3'>
                                        <div>
                                            <div className='title'></div>
                                            <div className='container'>
                                                <div>
                                                    <div className={`rowOrderPad changeColorHover`}>
                                                        <div className={`showTitle text-capitalize`}>{<Lang>lang_account</Lang>}</div>
                                                        <div className='size--3'>
                                                            {
                                                                checkShowAccount && !this.isModifyOrder
                                                                    ? <div className={`accountSearchRow ${this.state.isLoading ? 'disabled-action' : ''}`}>
                                                                        <SearchAccount
                                                                            accountId={accountId}
                                                                            formName='newOrder'
                                                                            dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount}
                                                                        />
                                                                    </div>
                                                                    : <div className='accountSearchRow'>
                                                                        <div className={`showTitle onlyCompanyName size--3 changeColorHover`}>{`${accountId ? '' + accountId : ''}`}</div>
                                                                    </div>
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className={`showTitle rowOrderPad onlyCompanyName size--3 changeColorHover`}>{`${accountName} ${accountId ? '(' + accountId + ')' : ''}`}</div>
                                                </div>
                                                <div>
                                                    <div className='rowOrderPad changeColorHover'>
                                                        <div className={`showTitle text-capitalize`}>{<Lang>lang_code</Lang>}</div>
                                                        <div className={`newOrder-code-security ${this.state.isLoading ? 'disabled-action' : ''}`}>
                                                            {
                                                                !this.isModifyOrder
                                                                    ? <div className={`newOrder-code-security ${this.state.isLoading ? 'disabled-action' : ''}`}>
                                                                        <SearchBox
                                                                            resize={this.props.resize}
                                                                            loading={this.props.loading}
                                                                            trading_halt={tradingHalt}
                                                                            contingentOrder={this.contingent}
                                                                            obj={this.objDataOrder.symbolObj}
                                                                            placing={false}
                                                                            symbol={this.objDataOrder.symbol}
                                                                            display_name={displayName}
                                                                            dataReceivedFromSearchBox={this.dataReceivedFromSearchBox.bind(this)}
                                                                            checkNewOrder={true}
                                                                        />
                                                                    </div>
                                                                    : <div className={`newOrder-code-security`}>
                                                                        {
                                                                            tradingHalt ? <div className='trading-halt-symbol'>!</div> : null
                                                                        }
                                                                        {displayName}
                                                                        {<Flag symbolObj={this.objDataOrder.symbolObj} inlineStyle={{ marginLeft: 8 }} />}
                                                                    </div>
                                                            }
                                                        </div>
                                                    </div>
                                                    {
                                                        displayName
                                                            ? <div className="rowOrderPad changeColorHover">
                                                                <div></div>
                                                                <div className='showTitle size--3 changeColorHover flexVerticalCenter'>
                                                                    <div>{companyName.toUpperCase()}</div>
                                                                    <div className='flexVerticalCenter'>
                                                                        <SecurityDetailIcon
                                                                            {...this.props}
                                                                            symbolObj={this.objDataOrder.symbolObj}
                                                                            iconStyle={{ position: 'unset', top: 'unset', transform: 'unset', marginLeft: 8 }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            : null
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        {/* end row  */}
                                        <div>
                                            <div className='container'>
                                                <div className={`rowOrderPad changeColorHover`} style={{ height: 32 }}>
                                                    <div className={`btnOrderRoot ${side === 'BUY' ? '' : ' sell'} ${this.state.isLoading ? 'disabled-action' : ''}`} style={{ width: '100%' }}>
                                                        <div className={`btnOrder btnBuy size--3 ${side === 'BUY' ? 'buy' : 'sell'} ${this.checkClassDisable('BUY')} ${this.objDataOrder.disableSide}`} onClick={() => this.changeSide('BUY')} >
                                                            {< Lang >BUY</Lang>}
                                                        </div>
                                                        <div className={`btnOrder btnSell size--3 ${side === 'BUY' ? 'buy' : 'sell'} ${this.checkClassDisable('SELL')}`} onClick={() => this.changeSide('SELL')} >
                                                            {< Lang >SELL</Lang>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* end row */}
                                        {
                                            (symbolObj.symbol || this.data.symbol)
                                                ? <NoTag>
                                                    <div>
                                                        <div className="title"></div>
                                                        <div className="containerOrderPad">
                                                            <div className='rowOrderPad-wrap'>
                                                                {this.renderQuantity()}
                                                                {this.renderOrderType()}
                                                                {
                                                                    lstRender.length && lstRender.map(item => {
                                                                        return item
                                                                    })
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {
                                                            this.isModifyOrder
                                                                ? <Toggle className={`title`} nameToggle='lang_details'></Toggle>
                                                                : <Toggle className={`title hide`} nameToggle='lang_details'></Toggle>
                                                        }
                                                        <div className='container'>
                                                            <div>
                                                                {
                                                                    this.objDataOrder.unit === 'USD'
                                                                        ? <div className="rowOrderPad changeColorHover">
                                                                            <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_order_amount_usd</Lang>}</div>
                                                                            <div className='showTitle'>{showMoneyFormatter((this.objDataOrder.estimatedPriceObj.order_amount), this.objDataOrder.unit)} USD</div>
                                                                        </div>
                                                                        : null
                                                                }
                                                                <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_order_amount</Lang>}{currency}</div>
                                                                    <div className='showTitle'>{showMoneyFormatter((this.objDataOrder.estimatedPriceObj.order_amount_convert), this.objDataOrder.currency)} {this.objDataOrder.currency}</div>
                                                                </div>
                                                                {
                                                                    dataStorage.env_config.roles.showAdditionalFees ? <NoTag>
                                                                        <div className="rowOrderPad changeColorHover">
                                                                            <div className='showTitle leftRowOrderPad text-capitalize'><Lang>lang_fees</Lang>{this.objDataOrder.currency ? ' (' + this.objDataOrder.currency + ')' : ''}</div>
                                                                            <div className='showTitle'>{showMoneyFormatter(this.objDataOrder.estimatedPriceObj.fees, this.objDataOrder.currency)} {this.objDataOrder.currency}</div>
                                                                        </div>
                                                                        {this.objDataOrder.estimatedPriceObj.gst
                                                                            ? <div className="rowOrderPad changeColorHover">
                                                                                <div className='showTitle leftRowOrderPad text-capitalize'><Lang>lang_gst</Lang> (10%) {this.objDataOrder.currency ? ' (' + this.objDataOrder.currency + ')' : ''}</div>
                                                                                <div className='showTitle'>{showMoneyFormatter(this.objDataOrder.estimatedPriceObj.gst, this.objDataOrder.currency)} {this.objDataOrder.currency}</div>
                                                                            </div>
                                                                            : null}
                                                                    </NoTag> : null
                                                                }
                                                            </div>
                                                            <div>
                                                                <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_estimated_fees</Lang>}{currency}</div>
                                                                    <div className='showTitle'>{showMoneyFormatter(this.objDataOrder.estimatedPriceObj.estimated_fees, this.objDataOrder.currency)} {this.objDataOrder.currency}</div>
                                                                </div>
                                                                <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_estimated_total</Lang>}{currency}</div>
                                                                    <div className='showTitle'>{showMoneyFormatter(this.objDataOrder.estimatedPriceObj.total_convert, this.objDataOrder.currency)} {this.objDataOrder.currency}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* end row */}
                                                </NoTag>
                                                : null
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* end .body */}
                        <div className='footer'>
                            <div className='line'></div>
                            <div>
                                <div className={`bigButtonOrder ${side === 'BUY' ? '' : 'sell'} ${(this.state.isConnected && !this.state.isLoading && checkRole(MapRoleComponent.PLACE_BUY_OR_SELL_ORDER) && this.isChange) ? '' : 'disable'}`} onClick={() => {
                                    if (!checkRole(MapRoleComponent.PLACE_BUY_OR_SELL_ORDER)) return
                                    if (this.state.isLoading) return;
                                    if (this.errClass) return;
                                    if (this.accountId) {
                                        this.getFees(() => this.state.isConnected && requirePin(() => this.checkVetting()), true)
                                    } else {
                                        this.state.isConnected && requirePin(() => this.checkVetting())
                                    }
                                }} >
                                    <div>
                                        {
                                            this.isModifyOrder
                                                ? <span className='size--4'>{this.state.isLoading ? <img src='common/Spinner-white.svg' /> : null} {this.textButton}</span>
                                                : <span className='size--4 text-uppercase'>{this.state.isLoading ? <img src='common/Spinner-white.svg' /> : null} {side === 'BUY' ? <Lang>lang_place_buy_order</Lang> : <Lang>lang_place_sell_order</Lang>}</span>
                                        }
                                        <span className='size--3'>
                                            {isSymbolFuture ? <Lang>lang_initial_margin_available_to_trade_is</Lang> : <Lang>lang_cash_available_to_trade_is</Lang>}
                                            &nbsp;{showMoneyFormatter(cashAvailable, this.objDataOrder.currency)} {this.objDataOrder.currency || '--'}
                                        </span>
                                    </div>
                                </div>
                                <div className='orderAddition paddingQuickOrderPad'>
                                    <div style={{ display: 'flex' }}>
                                        <div className={`text-capitalize clearAllData size--3 ${this.state.isLoading ? ' disabled' : ''}`}
                                            onClick={() => this.handleClearAllData()}
                                        >
                                            <Lang>lang_clear_all_data</Lang>
                                        </div>
                                        {
                                            (!this.isModifyOrder && this.symbol)
                                                ? <div className={`checkbox-default size--3 pointer ${this.state.isLoading ? ' disabled' : ''}`}
                                                    onClick={() => this.isCheckAsDefault()}
                                                >
                                                    <img src={`${this.dontSaveOrder ? '/common/outline-check_box_outline_blank.svg' : '/common/checkbox-marked-outline.svg'}`} style={{ height: 18 + 'px' }} ></img>
                                                    <span><Lang>lang_save_as_default</Lang></span>
                                                </div>
                                                : null
                                        }
                                    </div>
                                    {
                                        this.objDataOrder.symbolObj && this.objDataOrder.symbolObj.class === 'equity' && !isAUSymbol(this.objDataOrder.symbolObj) && side === 'BUY'
                                            ? <div className='size--3 italic' title='Cash Available to Buy US Securities does not include your settlement in T+2 & Others'>
                                                <Lang>lang_ask_different_in_cash_available</Lang>
                                            </div>
                                            : null
                                    }
                                </div>
                            </div>
                        </div>
                        {/* end .footer */}
                    </div>
                </div>
            </div >
        )
    }
}

export default OrdersPad
