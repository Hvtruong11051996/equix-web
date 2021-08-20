import React from 'react';
import SearchAccount from '../SearchAccount';
import role from '../../constants/role';
import logger from '../../helper/log';
import s from './OrderPad.module.css';
import Lang from '../Inc/Lang';
import durationeEnum from '../../constants/duration_enum';
import Icon from '../Inc/Icon';
import DropDown from '../DropDown/DropDown';
import SearchBox from '../SearchBox';
import moment from 'moment';
import {
  getUrlCheckErrorModifyOrder,
  getUrlCheckErrorPlaceOrder, makePlaceOrderUrl,
  postData,
  putData,
  getData,
  requirePin,
  makeFeelUrl,
  getCommodityInfoUrl,
  getUrlAnAccount,
  getUrlOrderById,
  completeApi,
  getUrlTotalPosition, makeSymbolUrl, getUrlOrderResponseLatest
} from '../../helper/request';
import uuidv4 from 'uuid/v4';
import {
  mapError,
  genOrderType,
  showMoneyFormatter,
  isAUSymbol,
  formatNumberPrice,
  formatNumberVolume,
  formatProfitLoss,
  checkShowAccountSearch,
  formatExpireDate,
  formatNumberValue, saveDataSetting, mapContentWarning, isJsonString, checkRole, roundFloat
} from '../../helper/functionUtils';
import orderEnum from '../../constants/order_enum';
import orderTypeEnum from '../../constants/order_type';
import dataStorage from '../../dataStorage';
import NumberInput from '../Inc/NumberInput';
import { regisRealtime, unregisRealtime } from '../../helper/streamingSubscriber';
import DatePicker from '../Inc/DatePicker/DatePicker';
import ExampleCustomInput from '../Inc/ExampleCustomInput';
import { registerAllOrders, registerUser, unregisterAllOrders, unregisterUser } from '../../streaming';
import sideEnum from '../../constants/enum';
import errorValidate from '../../constants/error_validate';
import NoTag from '../Inc/NoTag';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'
import { addPriceListener, removePriceListener } from '../../helper/priceSource'
import Mapping from '../../constants/dictionary'

const auTimeZone = 'Australia/Sydney';
const usTimeZone = 'America/New_York';
const TIMEOUT_DEFAULT = 60 * 1000 * 2;

let DICTIONARY

export class OrderPadV2 extends React.Component {
  constructor(props) {
    super(props);
    DICTIONARY = Mapping.getDictionary()
    this.oldVolume = (props && props.state && props.state.data && props.state.data.data && props.state.data.data.volume)
    this.oldLimitPrice = (props && props.state && props.state.data && props.state.data.data && props.state.data.data.limit_price)
    this.oldStopPrice = (props && props.state && props.state.data && props.state.data.data && props.state.data.data.stop_price)
    dataStorage.receiveOrderPad = (data, color) => {
      if (!data) {
        this.symbolChanged(this.symbolObj)
      } else {
        if (color === this.view.color) {
          if (data.account) this.accountChanged(data.account)
          if (data.symbol) this.symbolChanged(data.symbol)
        }
      }
    }
    this.minDate = moment().tz(auTimeZone)
    if (this.minDate.format('HH') >= 8) this.minDate = this.minDate.add('day', 1)
    this.view = {
      isBuy: true,
      minDate: this.minDate,
      orderType: orderTypeEnum.LIMIT,
      optionsPrice: 'Market',
      color: 5,
      volume: 0
    };
    this.isModifyOrder = props.state && props.state.stateOrder === 'ModifyOrder';
    if (this.isModifyOrder) {
      const data = (props.state.data && props.state.data.data) || props.state.data || {}
      this.view.isBuy = !!data.is_buy;
      this.view.orderType = data.order_type;
      this.view.duration = data.duration;
      this.view.exchange = data.display_exchange;
      this.view.volume = data.volume;
      this.view.limitPrice = data.limit_price;
      this.view.stopPrice = data.stop_price;
      this.view.expiry_date = formatExpireDate(data);
    }
    this.reCalculateOrderValue(true);
    if (!checkShowAccountSearch()) {
      const accountId = dataStorage.accountInfo.account_id;
      const url = getUrlAnAccount(accountId);
      getData(url).then(response => {
        if (response.data && response.data[0]) {
          this.accountChanged(response.data[0])
        }
      })
    }
    if (this.props.state && this.props.state.data) {
      this.data = this.props.state.data.data || this.props.state.data;
      this.broker_order_id = this.data && this.data.broker_order_id
      this.view.isBuy = this.props.state.data.side !== 'SELL';
      let symbol = this.data.symbol || (this.data.symbolObj && this.data.symbolObj.symbol)
      if (!symbol && dataStorage.getSymbolBuySellPanel) symbol = (dataStorage.getSymbolBuySellPanel() || {}).symbol;
      if (symbol) {
        const decode = encodeURIComponent(symbol);
        const urlMarketInfo = makeSymbolUrl(decode);
        getData(urlMarketInfo).then(response => {
          if (response.data) {
            this.skipResetVolume = true
            this.symbolChanged(response.data[0]);
            dataStorage.buySellPanelSymbolChanged && dataStorage.buySellPanelSymbolChanged(response.data[0], this.isModifyOrder)
            if (this.props.state.orderTypeSelection === 'Limit') this.orderTypeChanged(orderTypeEnum.LIMIT);
            if (this.props.state.orderTypeSelection === 'StopLimit') this.orderTypeChanged(orderTypeEnum.STOP_LIMIT);
            if (this.data.volume) {
              const volume = this.data.volume;
              this.handleInputVolume(volume, 'volume')
              this.volumeChanged = false
            }
            if (this.props.state.limitPrice) {
              this.handleInputVolume(this.props.state.limitPrice, 'limitPrice')
            }
            if (this.props.state.stopPrice) {
              this.handleInputVolume(this.props.state.stopPrice, 'stopPrice')
            }
          }
        })
      } else {
        if (this.data.volume) {
          const volume = this.data.volume;
          this.handleInputVolume(volume, 'volume')
          this.volumeChanged = false
        }
        if (this.props.state.limitPrice) {
          this.handleInputVolume(this.props.state.limitPrice, 'limitPrice')
        }
        if (this.props.state.stopPrice) {
          this.handleInputVolume(this.props.state.stopPrice, 'stopPrice')
        }
      }
      const accountId = this.data.account_id
      if (accountId) {
        const url = getUrlAnAccount(accountId);
        getData(url).then(response => {
          if (response.data && response.data[0]) {
            this.accountChanged(response.data[0])
          }
        })
      }
    }
    this.typeConfirm = this.isModifyOrder ? orderEnum.MODIFY_ORDER : orderEnum.NEW_ORDER;
    this.symbolObj = {};
    this.accountObj = {};
    this.priceObj = {};
    this.estimatedPriceObj = {};
    this.commodityInfoObj = {};
    this.dicPositions = {};
    this.dicProfitVal = {};
    this.isSymbolFuture = false;
    this.view.orderTypeOption = [
      { label: <Lang>lang_limit</Lang>, value: orderTypeEnum.LIMIT },
      { label: <Lang>lang_market_to_limit</Lang>, value: orderTypeEnum.MARKET },
      { label: <Lang>lang_stop_loss</Lang>, value: orderTypeEnum.STOP_LIMIT }];
    if (!dataStorage.dataSetting.saveAsDefaultOrderV2) dataStorage.dataSetting.saveAsDefaultOrderV2 = {};
    this.dicSaveAsDefault = dataStorage.dataSetting.saveAsDefaultOrderV2;
    this.dontSaveOrder = dataStorage.dataSetting.dontSaveOrderV2;
    this.props.setResizeCallback((delta, fn) => {
      if (delta > 1 && !this.view.expand) {
        fn(344);
        this.view.expand = true;
        this.forceUpdate();
      }
      if (delta < -1 && this.view.expand) {
        fn(-344);
        this.view.expand = false;
        this.forceUpdate();
      }
    });
  }
  settingChanged = (setting) => {
    if (setting && setting.hasOwnProperty('checkQuickOrderPad') && !setting.checkQuickOrderPad) {
      requirePin(() => {
        if (this.isModifyOrder) {
          const side = this.data.side && this.data.side === 'Buy' ? sideEnum.BUYSIDE : sideEnum.SELLSIDE;
          dataStorage.goldenLayout.addComponentToStack('Order', {
            stateOrder: 'ModifyOrder',
            data: { data: this.data, side: side },
            needConfirm: false,
            currency: '--'
          })
        } else {
          dataStorage.goldenLayout.addComponentToStack('Order', { stateOrder: 'NewOrder', data: { side: sideEnum.BUYSIDE } })
        }
      });
      this.props.close()
    }
  }
  getSymbolOrderV2 = () => {
    return this.symbolObj;
  }
  componentDidMount() {
    try {
      if (!this.isModifyOrder) {
        dataStorage.orderSymbolChanged = this.symbolChanged;
        dataStorage.orderHandleInputVolume = this.handleInputVolume;
        dataStorage.orderDirectionChanged = this.directionChanged;
        dataStorage.getSymbolOrderV2 = this.getSymbolOrderV2;
      }
      registerAllOrders(this.realtimeData, 'order');
      addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
      registerUser(dataStorage.userInfo.user_id, this.settingChanged, 'user_setting');
    } catch (error) {
      logger.error('componentDidMount On OrdersV2 ' + error)
    }
  }

  componentWillUnmount() {
    try {
      if (!this.isModifyOrder) {
        delete dataStorage.orderPadSymbolChanged
        delete dataStorage.orderHandleInputVolume
        delete dataStorage.orderDirectionChanged
        delete dataStorage.getSymbolOrderV2;
      }
      this.closeConfirm && this.closeConfirm();
      if (this.intervalId) clearInterval(this.intervalId);
      unregisterAllOrders(this.realtimeData, 'order');
      removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
      removePriceListener(this.realtimePrice)
      unregisterUser(dataStorage.userInfo.user_id, this.settingChanged, 'user_setting');
      unregisRealtime({
        callback: this.realtimeDataCashAccount
      })
      if (this.dontSaveOrder) {
        const data = {
          dontSaveOrderV2: this.dontSaveOrder,
          saveAsDefaultOrderV2: {}
        }
        saveDataSetting({ data }).then(() => {
          console.log('dontSaveOrder = true and clear saveAsDefaultOrder');
        });
      }
    } catch (error) {
      logger.error('componentWillUnmount On OrdersV2 ' + error)
    }
  }

  restoreUserChoice = () => {
    const userChoice = (this.dicUserChoice && this.dicUserChoice[this.view.isBuy + '|' + this.view.orderType]) || {}
    this.view.limitPrice = userChoice.limitPrice || 0;
    this.view.stopPrice = userChoice.stopPrice || 0;
  }
  saveUserChoice = () => {
    if (!this.dicUserChoice) this.dicUserChoice = {};
    this.dicUserChoice[this.view.isBuy + '|' + this.view.orderType] = {
      limitPrice: this.view.limitPrice,
      stopPrice: this.view.stopPrice
    }
  }
  directionChanged = (isBuy) => {
    if (this.isModifyOrder) return;
    if (this.view.disabled || this.view.isNotConnected) return;
    if (!this.volumeChanged && this.data && this.data.isClose && !this.clearBtn) {
      if ((this.data.side === 'BUY') === isBuy && !this.symbolWasChanged) {
        this.view.volume = this.data.volume
      } else {
        this.view.volume = 0
      }
    }
    this.view.isBuy = isBuy;
    const defaultObj = this.getDefaultObj();
    if (defaultObj) {
      this.durationChanged(defaultObj.duration)
    }
    this.reCalculateVolume();
    this.timeoutGetFees()
    this.restoreUserChoice();
    this.fillHoding()
    this.forceUpdate();
  }
  showSearchAccount = (show) => {
    if (this.isModifyOrder) return;
    this.view.searchingAccount = show;
    this.forceUpdate();
    if (!show) return;
    setTimeout(() => {
      this.searchAccountDom && this.searchAccountDom.focus();
    }, 10)
  }
  showSearchSymbol = (show) => {
    if (this.isModifyOrder || !this.view.searchingSymbol === !show) return;
    this.view.searchingSymbol = show;
    this.forceUpdate();
    if (!show) return;
    setTimeout(() => {
      this.searchSymbolDom && this.searchSymbolDom.focus();
    }, 10)
  }
  getCommodityInfoUrl = (symbolObj) => {
    const decode = encodeURIComponent(symbolObj.master_code || symbolObj.symbol)
    const urlComodityInfo = getCommodityInfoUrl(decode)
    getData(urlComodityInfo).then(res => {
      if (res.data && res.data[0]) {
        this.commodityInfoObj = res.data[0]
      }
      this.forceUpdate()
    })
  }
  realtimePrice = (obj) => {
    if (obj.quote) {
      this.updatePrice(obj);
      this.reCalculateOrderValue(true);
    }
  }
  updatePrice = (obj) => {
    if (!this.dom || !this.priceObj) return;
    Object.assign(this.priceObj, obj.quote);
    if (!this.priceObjOld || this.priceObjOld.symbol !== obj.symbol) this.priceObjOld = {};
    this.priceObjOld.symbol = obj.symbol
    const domPrice = this.dom.querySelector('.' + s.price);
    const domPercent = this.dom.querySelector('.' + s.percent);
    if (domPrice) {
      domPrice.innerText = formatNumberPrice(this.priceObj.trade_price, true);
      let oldValue = this.priceObjOld.trade_price;
      if (!this.priceObj.trade_price) {
        domPrice.classList.remove('priceDown');
        domPrice.classList.remove('priceUp');
      } else if (oldValue !== this.priceObj.trade_price) {
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
        domPercent.classList.add('priceUp');
        domPercent.classList.remove('priceDown');
        domPercent.setAttribute('title', formatNumberValue(this.priceObj.change_percent, true) + '%');
      } else if (this.priceObj.change_percent < 0) {
        domPercent.classList.add('priceDown');
        domPercent.classList.remove('priceUp');
      } else {
        domPercent.classList.remove('priceUp');
        domPercent.classList.remove('priceDown');
      }
      domPercent.title = formatNumberValue(this.priceObj.change_percent, true) + '%';
    }
    if (this.dom.querySelector('.chartDay')) {
      const range = this.priceObj.high - this.priceObj.low;
      const open = (this.priceObj.open - this.priceObj.low) * 100 / range
      const trade = ((this.priceObj.trade_price - this.priceObj.low) * 100 / range) < 0 ? 0 : (this.priceObj.trade_price - this.priceObj.low) * 100 / range
      const min = trade < open ? trade : open
      const max = trade > open ? trade : open
      const fill = this.dom.querySelector('.chartDay .' + s.fill);
      if (fill) {
        fill.style.left = min + '%';
        fill.style.right = (100 - max) + '%';
      }
      const point = this.dom.querySelector('.chartDay .' + s.point);
      if (point) point.style.left = `calc(${trade}% - 3px)`;
      const lim = this.dom.querySelector('.chartDay .' + s.lim);
      if (lim) {
        lim.childNodes[0].innerText = formatNumberValue(this.priceObj.low, true)
        lim.childNodes[1].innerText = formatNumberValue(this.priceObj.high, true)
      }
    }
  }

  getKeyBySymbol = (symbolObj, suffix = '') => {
    const exchange = symbolObj.exchanges && symbolObj.exchanges.length && symbolObj.exchanges[0]
    if (['NSX', 'BSX', 'SSX'].includes(exchange)) return exchange + suffix
    const country = (symbolObj.country + '').toLowerCase()
    if (symbolObj.class === 'future') return symbolObj.class
    if (country === 'us') return country
    return symbolObj.class + suffix
  }

  symbolChanged = async (symbolObj = {}, isLink) => {
    if (isLink && this.isModifyOrder) return;
    if (this.view.disabled) return
    dataStorage.defaultSymbol = symbolObj;
    this.send({ symbol: symbolObj })
    this.dicUserChoice = {};
    if (symbolObj.symbol === 'future') this.isSymbolFuture = true
    let orderTypeOption
    const key = this.getKeyBySymbol(symbolObj)
    orderTypeOption = DICTIONARY.ORDER_TYPE_MAPPING[key] || []
    if (symbolObj.class === 'future') {
      this.getCommodityInfoUrl(symbolObj)
    }
    this.dicUserChoice = {}
    if (this.skipResetVolume) delete this.skipResetVolume
    else {
      this.view.volume = 0;
    }
    if (this.symbolObj.symbol && this.symbolObj.symbol !== symbolObj.symbol) {
      this.symbolWasChanged = true
    }
    if (symbolObj && symbolObj.symbol && !dataStorage.symbolsObjDic[symbolObj.symbol]) {
      const symbolStringUrl = makeSymbolUrl(encodeURIComponent(symbolObj.symbol));
      await getData(symbolStringUrl)
        .then(response => {
          if (response.data && response.data.length) {
            for (let i = 0; i < response.data.length; i++) {
              dataStorage.symbolsObjDic[response.data[i].symbol] = response.data[i]
            }
          }
        })
        .catch(error => {
          logger.log(error)
        })
    }
    removePriceListener(this.realtimePrice)
    this.symbolObj = symbolObj;
    addPriceListener(this.symbolObj, this.realtimePrice)
    this.timeoutGetFees()
    this.fillHoding()
    this.view.searchingSymbol = false;
    this.view.orderTypeOption = orderTypeOption;
    this.orderTypeChanged(orderTypeOption[0].value)
  }

  orderTypeChanged = (orderType) => {
    if (this.isModifyOrder) return;
    if (this.view.disabled) return;
    this.view.orderType = orderType;
    let durationOption
    const key = this.getKeyBySymbol(this.symbolObj, `|${orderType}`)
    durationOption = DICTIONARY.DURATION_MAPPING[key] || []
    if (this.view.orderType === orderTypeEnum.STOPLOSS || this.view.orderType === orderTypeEnum.STOP_LIMIT) {
      this.directionChanged(false)
    }
    this.view.durationOption = durationOption
    this.restoreUserChoice();
    this.reCalculateOrderValue(true)
    this.forceUpdate()
    const defaultObj = this.getDefaultObj();
    const defaultDuration = defaultObj ? defaultObj.duration : (durationOption && durationOption[0].value);
    this.durationChanged(defaultDuration)
  }
  durationChanged = (duration) => {
    this.forceUpdate()
    if (!this.symbolObj) return;
    if (this.view.durationOption && !this.view.durationOption.filter(item => item.value === duration).length) duration = this.view.durationOption[0].value
    this.view.duration = duration
    let exchangeOption
    if (this.symbolObj.country === 'US') {
      const dicExchangeByCountry = [
        { label: this.symbolObj.display_exchange, value: this.symbolObj.display_exchange }
      ]
      exchangeOption = dicExchangeByCountry
      this.view.exchangeOption = exchangeOption
      this.exchangeChanged(exchangeOption[0].value, exchangeOption[0])
    } else {
      const key = this.getKeyBySymbol(this.symbolObj, `|${this.view.orderType}|${duration}`)
      exchangeOption = DICTIONARY.EXCHANGE_MAPPING[key] || []
      this.view.exchangeOption = exchangeOption
      const defaultObj = this.getDefaultObj();
      let defaultObjExchange = exchangeOption[0]
      if (defaultObj) {
        let filter = exchangeOption.filter(item => item.value === defaultObj.exchange);
        defaultObjExchange = filter[0] || exchangeOption[0]
      }
      this.exchangeChanged(defaultObjExchange.value, defaultObjExchange)
    }
  }
  exchangeChanged = (exchange, data) => {
    this.view.exchange = exchange;
    this.view.displayExchange = data.label;
    this.saveAsDefault();
    this.forceUpdate();
  }
  timeoutGetFees = () => {
    if (this.timeoutFeeId) clearTimeout(this.timeoutFeeId)
    this.timeoutFeeId = setTimeout(() => this.getFees(), 350)
  }
  getCashByAccount = () => {
    try {
      let accountId = (this.accountObj && this.accountObj.account_id)
      if (!accountId) return
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
            this.timeoutGetFees()
            this.dataCashAccount = dataCashAccount
            this.fillHoding()
            this.forceUpdate()
          }
        })
        .catch(error => {
          cb && cb();
          this.dataCashAccount = null
          this.timeoutGetFees()
          logger.error('getCashByAccount On NewOrder ' + error)
        })
    } catch (error) {
      logger.error('getCashByAccount On NewOrder ' + error)
    }
  }
  fillHoding = () => {
    if (this.dicPositions && this.symbolObj.symbol) {
      const data = this.dicPositions[this.symbolObj.symbol]
      if (!this.isModifyOrder && data && (data.side === 'Buy') !== this.view.isBuy && !this.volumeChanged) {
        this.handleInputVolume(Math.abs(data.volume), 'volume')
        if (data.limit_price) this.handleInputVolume(data.limit_price, 'limitPrice')
        if (data.stop_price) this.handleInputVolume(data.stop_price, 'stop_price')
      }
    }
  }
  send = (data) => {
    const lst = dataStorage.goldenLayout.goldenLayout && dataStorage.goldenLayout.goldenLayout.root.getItemsByType('component');
    if (lst && lst.length) {
      for (let i = 0; i < lst.length; i++) {
        if (dataStorage.lastColorLink !== 5) {
          lst[i].element[0].react && lst[i].element[0].react.broadcast(data, null, this.view.color)
        }
      }
    }
  }
  accountChanged = (accountObj) => {
    if (this.view.disabled) return
    this.accountObj = accountObj;
    this.estimatedPriceObj = {}
    dataStorage.defaultAccount = accountObj
    this.send({ account: accountObj })
    unregisRealtime({
      callback: this.realtimeDataCashAccount
    })
    regisRealtime({
      url: completeApi(`/portfolio?account_id=${accountObj.account_id}`),
      callback: this.realtimeDataCashAccount
    })
    this.forceUpdate()
    this.view.searchingAccount = false;
    this.getCashByAccount()
  }
  handleInputVolume = (value, stateName, isLink) => {
    try {
      if (isLink && this.isModifyOrder) return;
      if (stateName === 'volume' && !this.volumeChanged) this.volumeChanged = true
      const obj = {};
      obj[stateName] = value || 0;
      this.view[stateName] = value || 0;
      if (this.isModifyOrder) {
        const data = (this.props.state.data && this.props.state.data.data) || this.props.state.data || {}
        if (this.view.volume === data.volume && this.view.limitPrice === data.limit_price && this.view.stopPrice === data.stop_price) {
          this.view.noChange = true
        } else {
          this.view.noChange = false
        }
      }
      if (stateName !== 'orderValue') this.reCalculateOrderValue();
      this.saveUserChoice();
      this.timeoutGetFees()
    } catch (error) {
      logger.error('handleInputVolume On OrdersV2 ' + error)
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
          if (response.data && response.data.errorCode === 'SUCCESS') {
            that.isValidBeforeConfirmOrder = true
            if (this.timeoutRequestOrder) clearTimeout(this.timeoutRequestOrder)
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
            that.view.errorOrder = mapError(errorString, that.typeConfirm);
            that.view.disabled = false;
            that.forceUpdate();
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

          that.isValidBeforeConfirmOrder = false;
          that.view.errorOrder = mapError(errorContent, that.typeConfirm);
          that.view.disabled = false;
          that.forceUpdate();
          logger.error(error)
        })
    } catch (error) {
      logger.error(error)
    }
  }
  realtimeDataCashAccount = (data) => {
    if (typeof data === 'string') data = JSON.parse(data)
    const type = data.data.title.split('#')[0]
    if (type !== 'accountsummary') return
    data = JSON.parse(data.data.object_changed)
    const disPlaydata = {
      ...this.dataCashAccount,
      ...data
    }
    this.dataCashAccount = disPlaydata
    this.forceUpdate()
  }
  realtimeData = (dataObj, data, title) => {
    if ((!this.isModifyOrder && this.clientOrderId && this.clientOrderId !== dataObj.client_order_id) || (dataObj.account_id && this.accountObj.account_id !== dataObj.account_id)) return
    if (this.broker_order_id) {
      if (dataObj.broker_order_id !== this.broker_order_id) return;
    }
    if (!title) return;
    if (!this.isModifyOrder && this.clientOrderId !== dataObj.client_order_id) return;
    if (/#TIMEOUT$/.test(title)) {
      if (this.timeoutRequestOrder) clearTimeout(this.timeoutRequestOrder)
      if (this.timeoutRequestOrder2) clearTimeout(this.timeoutRequestOrder2)
      if (this.isRejected) return
      this.view.errorOrder = 'lang_timeout_cannot_be_connected_server';
      this.view.warningOrder = '';
      this.view.disabled = false;
    }
    if (/#SUCCESS$/.test(title)) {
      if (this.intervalId) clearInterval(this.intervalId);
      this.view.warningOrder = mapContentWarning(true, this.typeConfirm);
      this.view.errorOrder = '';
      setTimeout(() => {
        this.props.close();
      }, 4000);
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
      this.view.errorOrder = errorString;
      this.view.warningOrder = '';
      this.view.disabled = false;
    }
    this.isLoading = false
    this.forceUpdate();
  }

  checkOrderExisted(id) {
    let orderId;
    let url = '';
    if (this.isModifyOrder) {
      orderId = this.broker_order_id;
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
        this.view.errorOrder = mapError(errorString, this.typeConfirm);
        this.view.warningOrder = '';
      }
    }
  }
  handleError = (error) => {
    let errorString = 'Error'
    if (error.response && error.response.errorCode) {
      errorString = error.response.errorCode
    }
    this.view.errorOrder = mapError(errorString, this.typeConfirm);
    this.view.warningOrder = '';
    this.view.disabled = false;
    this.forceUpdate();
  }
  placeOrder = () => {
    this.view.warningOrder = mapContentWarning(false, this.typeConfirm);
    // this.view.review = false;
    this.isLoading = true
    // this.forceUpdate();
    this.timeoutRequestOrder2 = setTimeout(() => {
      this.view.errorOrder = 'lang_timeout_cannot_be_connected_server';
      this.view.warningOrder = '';
      this.view.disabled = false;
      this.forceUpdate();
    }, TIMEOUT_DEFAULT);
    let urlPlaceOrder;
    if (this.isModifyOrder) {
      urlPlaceOrder = makePlaceOrderUrl(`/${this.broker_order_id}`);
    } else {
      urlPlaceOrder = makePlaceOrderUrl()
      this.clientOrderId = this.accountObj.account_id + '_' + uuidv4().replace(/-/g, '')
      this.dataRequest.client_order_id = this.clientOrderId;
    }
    const obj = { 'data': this.dataRequest };
    const request = this.isModifyOrder ? putData : postData
    request(urlPlaceOrder, obj)
      .then(response => {
        this.handleResponseOrder(response)
      })
      .catch(error => {
        logger.error(error)
        this.handleError(error)
      })
  }

  showConfirm = () => {
    this.view.review = true;
    this.forceUpdate();
  }
  setNote = () => {
    try {
      const exchange = this.view.exchange
      const limitPrice = this.view.limitPrice
      const stopPrice = this.view.stopPrice
      const volume = this.view.volume
      let modifyAction;
      if (volume > 0) {
        modifyAction = 'ADD'
      } else if (volume < 0) {
        modifyAction = 'REDUCE'
      } else {
        // Case volume = 0;
        if (this.view.limitPrice > this.oldLimitPrice) {
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
          side: this.view.isBuy ? 'BUY' : 'SELL',
          volume: volume,
          volume_old: this.oldVolume,
          stop_price: stopPrice,
          limit_price: limitPrice,
          stop_price_old: this.oldStopPrice,
          limit_price_old: this.oldLimitPrice
        }
      }
      if (this.isModifyOrder) {
        this.note.data.stop_price = this.view.stopPrice
        this.note.data.limit_price = this.view.limitPrice
        this.note.data.volume_old = this.oldVolume
        this.note.data.stop_price_old = this.oldStopPrice
        this.note.data.limit_price_old = this.oldLimitPrice
      }
      switch (this.view.orderType) {
        case orderTypeEnum.MARKET:
          this.note.order_type = 'MARKET_ORDER'
          break;
        case orderTypeEnum.MARKETTOLIMIT:
          this.note.order_type = 'MARKETTOLIMIT_ORDER'
          break;
        case orderTypeEnum.LIMIT:
          this.note.order_type = 'LIMIT_ORDER'
          this.note.data.limit_price = limitPrice
          break;
        case orderTypeEnum.STOP_LIMIT:
          this.note.order_type = 'STOPLIMIT_ORDER'
          this.note.data.limit_price = limitPrice
          this.note.data.stop_price = stopPrice
          break;
        case orderTypeEnum.STOP:
        case orderTypeEnum.STOPLOSS:
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
  getFees = (cb) => {
    try {
      let accountId = this.accountObj && this.accountObj.account_id
      let symbol = this.symbolObj && this.symbolObj.symbol
      if (!accountId || !symbol || !this.view.orderType || !this.view.volume) {
        this.estimatedPriceObj = {}
        this.forceUpdate()
        return
      }
      const objOrder = {
        code: symbol,
        volume: parseFloat(this.view.volume),
        exchange: this.view.exchange,
        order_type: genOrderType(this.view.orderType),
        is_buy: this.view.isBuy,
        account_id: accountId,
        duration: this.view.duration
      };
      const limitPrice = parseFloat(this.view.limitPrice)
      const stopPrice = parseFloat(this.view.stopPrice)
      const orderTypeByExchange = genOrderType(this.view.orderType)
      switch (orderTypeByExchange) {
        case orderTypeEnum.MARKETTOLIMIT:
          break;
        case orderTypeEnum.LIMIT:
          objOrder['limit_price'] = limitPrice;
          break;
        case orderTypeEnum.STOP:
          objOrder['stop_price'] = stopPrice;
          break;
        case orderTypeEnum.STOP_LIMIT:
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
            this.estimatedPriceObj = res.data
            if (!this.volumeChanged) this.view.volume = objOrder.volume
            this.forceUpdate()
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
        Object.assign(this.estimatedPriceObj, state2)
        if (!this.volumeChanged) this.view.volume = objOrder.volume
        this.forceUpdate()
      }
      cb && cb()
    } catch (error) {
      logger.error('getFees On OrdersV2s ' + error)
    }
  }
  getDataByOrderId = async () => {
    const url = getUrlOrderById(this.broker_order_id)
    getData(url).then((res) => {
      if (res.data[0].order_type) this.view.orderType = res.data[0].order_type
    }).catch(error => {
      logger.error('getDataByOrderId on orderPadV2:' + error)
    })
  }
  checkVetting = async () => {
    this.isLoading = true
    this.forceUpdate();
    if (this.isModifyOrder) {
      await this.getDataByOrderId()
    }
    this.dataRequest = {};
    this.setNote()
    if (this.isModifyOrder) {
      this.dataRequest = {
        broker_order_id: this.broker_order_id,
        volume: this.view.volume,
        note: this.note
      };
    } else {
      this.dataRequest = {
        code: this.symbolObj.symbol,
        volume: parseFloat(this.view.volume),
        order_type: this.view.orderType,
        note: this.note,
        is_buy: !!this.view.isBuy,
        account_id: this.accountObj.account_id,
        duration: this.view.duration,
        exchange: this.view.exchange
      };
      if (this.view.duration === 'GTD') {
        this.dataRequest.expire_date = this.view.minDate.format('YYYYMMDD')
      }
    }

    const limitPrice = parseFloat(this.view.limitPrice)
    const stopPrice = parseFloat(this.view.stopPrice)
    switch (this.view.orderType) {
      case orderTypeEnum.MARKETTOLIMIT:
        break;
      case orderTypeEnum.LIMIT:
        this.dataRequest['limit_price'] = limitPrice;
        break;
      case orderTypeEnum.STOP:
      case orderTypeEnum.STOPLOSS:
        this.dataRequest['order_type'] = orderTypeEnum.STOP;
        this.dataRequest['stop_price'] = stopPrice;
        break;
      case orderTypeEnum.STOP_LIMIT:
        this.dataRequest['stop_price'] = stopPrice;
        this.dataRequest['limit_price'] = limitPrice;
        break;
      default:
        break;
    }

    this.timeoutRequestOrder = setTimeout(() => {
      this.view.errorOrder = 'lang_timeout_cannot_be_connected_server';
      this.view.warningOrder = '';
      this.view.disabled = false;
      this.forceUpdate();
    }, TIMEOUT_DEFAULT);
    this.view.disabled = true;
    await this.checkValidBeforeConfirmOrder(this.dataRequest);
    this.isLoading = false
    this.view.disabled = false;
    this.forceUpdate();
    if (!this.isValidBeforeConfirmOrder) return;
    this.showConfirm()
  }
  checkVolumeInput = () => {
    try {
      if (!this.view.volume && !this.errClass) {
        this.errClass = 'errVolume'
        this.view.errorOrder = errorValidate.OrderVolumeZero;
        this.view.warningOrder = '';
        return true
      }
      return false;
    } catch (error) {
      logger.error('checkVolumeInput On OrdersV2 ' + error)
    }
  }
  checkLimitPrice = () => {
    try {
      if (!this.view.limitPrice && !this.errClass) {
        this.errClass = 'errLimitPrice';
        this.view.errorOrder = errorValidate.OrderLimitPriceZero;
        this.view.warningOrder = '';
        return true
      }
      return false;
    } catch (error) {
      logger.error('checkLimitPrice On OrdersV2 ' + error)
    }
  }

  checkStopPrice = () => {
    try {
      if (!this.view.stopPrice && !this.errClass) {
        this.errClass = 'errStopPrice'
        this.view.errorOrder = errorValidate.OrderStopPriceZero;
        this.view.warningOrder = '';
        return true
      }
      return false;
    } catch (error) {
      logger.error('checkStopPrice On OrdersV2 ' + error)
    }
  }
  validateForm = () => {
    if (!this.isModifyOrder) {
      if (!this.symbolObj.symbol) {
        this.errClass = 'errNoneSymbol'
        this.view.errorOrder = errorValidate.CodeMustBeSelectedFirst;
        this.view.warningOrder = '';
        return true;
      }
      if (!this.accountObj.account_id) {
        this.errClass = 'errNoneAccount';
        this.view.errorOrder = errorValidate.AccountMustBeSelectedFirst;
        this.view.warningOrder = '';
        return true;
      }
      if (this.invalidDate && !this.view.useDatePicker && this.view.duration === 'GTD') {
        this.errClass = 'errPeriod';
        this.view.errorOrder = 'lang_period_date_format_invalid';
        this.view.warningOrder = '';
        return true;
      }
    }
    switch (this.view.orderType) {
      case orderTypeEnum.STOP_LIMIT:
        return this.checkVolumeInput() || this.checkLimitPrice();
      case orderTypeEnum.STOPLOSS:
        return this.checkVolumeInput();
      case orderTypeEnum.LIMIT:
        return this.checkVolumeInput() || this.checkLimitPrice();
      case orderTypeEnum.LIMIT_SAXO:
        return this.checkVolumeInput() || this.checkLimitPrice();
      case orderTypeEnum.MARKETTOLIMIT:
        return this.checkVolumeInput();
      case orderTypeEnum.MARKET_SAXO:
        return this.checkVolumeInput();
      default:
        return this.checkVolumeInput();
    }
  }
  submit = (e) => {
    if (this.view.disabled || this.view.isNotConnected) return;
    if (this.view.review) {
      this.placeOrder();
      return;
    }
    if (this.accountObj && !this.view.disabled && !this.view.noChange) {
      if (this.validateForm()) {
        this.forceUpdate();
        e.stopPropagation();
        return;
      }
      !this.view.isNotConnected && this.getFees(() => requirePin(() => this.checkVetting()));
    }
  }
  handleChangeMinDate = (date) => {
    this.view.minDate = date;
    this.forceUpdate()
  };
  changeDateType = () => {
    this.view.useDatePicker = !this.view.useDatePicker;
    this.invalidDate = this.view.useDatePicker;
    this.forceUpdate()
  }
  getDefaultObj = () => {
    if (this.dontSaveOrder) return;
    return this.dicSaveAsDefault[this.getKeySaveAsDefault()];
  }
  getKeySaveAsDefault = () => {
    return this.symbolObj.class + '|' + this.symbolObj.country + '|' + this.view.orderType + '|' + !!this.view.isBuy
  }
  saveAsDefault = () => {
    if (this.dontSaveOrder || this.isModifyOrder) return;
    this.dicSaveAsDefault[this.getKeySaveAsDefault()] = {
      duration: this.view.duration,
      exchange: this.view.exchange
    };
    const data = {
      saveAsDefaultOrderV2: this.dicSaveAsDefault
    };
    if (this.timeoutSaveDataSettingID) clearTimeout(this.timeoutSaveDataSettingID)
    this.timeoutSaveDataSettingID = setTimeout(() => {
      saveDataSetting({ data }).then(() => {
        console.log('saveAsDefaultOrder ok')
      })
    }, 300)
  }
  toggleSaveAsDefault = () => {
    this.dontSaveOrder = !this.dontSaveOrder
    if (!this.dontSaveOrder) {
      this.dicSaveAsDefault[this.getKeySaveAsDefault()] = {
        duration: this.view.duration,
        exchange: this.view.exchange
      };
      const data = {
        saveAsDefaultOrderV2: this.dicSaveAsDefault,
        dontSaveOrderV2: this.dontSaveOrder
      }
      saveDataSetting({ data }).then(() => {
        console.log('dontSaveOrder = false')
      })
    }
    this.forceUpdate()
  }
  renderDetail = (estimatedPriceObj) => {
    if (Object.keys(estimatedPriceObj).length) {
      return (
        <div>
          <div className={s.title + ' ' + s.detail + ' showTitle' + ' ' + 'text-capitalize'}><Lang>lang_summary</Lang></div>
          {this.symbolObj.class !== 'future'
            ? <div className={s.detailContent + ' ' + 'text-capitalize'} style={{ marginBottom: '16px' }}>
              <div className={s.rowOrderPad}>
                <div className={'showTitle'}><Lang>lang_order_amount</Lang></div>
                <div className={s.orderAmountWrap}>
                  {this.symbolObj.currency === 'USD' ? <div className={'showTitle'}>{showMoneyFormatter(estimatedPriceObj.order_amount, this.symbolObj.currency)} {this.symbolObj.currency}</div> : null}
                  <div className={'showTitle'}>{showMoneyFormatter(estimatedPriceObj.order_amount_convert, this.accountObj.currency)} {this.accountObj.currency}</div>
                </div>
              </div>
              {
                dataStorage.env_config.roles.showAdditionalFees ? <NoTag>
                  <div className={s.rowOrderPad}>
                    <div className={'showTitle'}><Lang>lang_fees</Lang>: {this.accountObj.currency}</div>
                    <div className={'showTitle'}>{showMoneyFormatter(estimatedPriceObj.fees, this.accountObj.currency)} {this.accountObj.currency}</div>
                  </div>
                  {estimatedPriceObj.gst
                    ? <div className={s.rowOrderPad}>
                      <div className={'showTitle'}><Lang>lang_gst</Lang> (10%) : {this.accountObj.currency}</div>
                      <div className={'showTitle'}>{showMoneyFormatter(estimatedPriceObj.gst, this.accountObj.currency)} {this.accountObj.currency}</div>
                    </div>
                    : null}
                </NoTag> : null
              }
              <div className={s.rowOrderPad}>
                <div className={'showTitle'}><Lang>lang_estimated_fees</Lang></div>
                <div className={'showTitle'}>{showMoneyFormatter(estimatedPriceObj.estimated_fees, this.accountObj.currency)} {this.accountObj.currency}</div>
              </div>
              <div className={s.rowOrderPad}>
                <div className={'showTitle'}><Lang>lang_estimated_total</Lang></div>
                <div className={'showTitle'}>{showMoneyFormatter(estimatedPriceObj.total, this.accountObj.currency)} {this.accountObj.currency}</div>
              </div>
              {
                this.accountObj.currency === 'VND'
                  ? <div className={s.rowOrderPad}>
                    <div className={'showTitle'}></div>
                    <div className={'showTitle'}>{showMoneyFormatter(estimatedPriceObj.total_convert, this.accountObj.currency)} {this.accountObj.currency}</div>
                  </div>
                  : null
              }
            </div>
            : <div className={s.detailContent}>
              <div>
                <div>
                  <div className={s.rowOrderPad}>
                    <div className={'showTitle'}><Lang>lang_i_m_impact</Lang></div>
                    <div className={'showTitle'}>{showMoneyFormatter(estimatedPriceObj.initial_margin_impact_convert, this.accountObj.currency)} {this.accountObj.currency}</div>
                  </div>
                  <div className={s.rowOrderPad}>
                    <div className={'showTitle'}><Lang>lang_m_m_impact</Lang></div>
                    <div className={'showTitle'}>{showMoneyFormatter(estimatedPriceObj.maintenance_margin_impact_convert, this.accountObj.currency)} {this.accountObj.currency}</div>
                  </div>
                </div>
              </div>
            </div>
          }</div>
      )
    }
  }
  renderBtnPlace = () => {
    let disableClass = this.view.isNotConnected ? 'disable' : '';
    if (!this.view.review) {
      return <div className={`text-uppercase ${disableClass}`}><Lang>lang_review_order</Lang></div>
    }
    return (
      <div className={`${disableClass}`}>
        {this.isModifyOrder ? <div className='text-capitalize'>{this.view.isBuy ? <Lang>lang_modify_buy_order</Lang> : <Lang>lang_modify_sell_order</Lang>}</div> : <div className='text-uppercase'>{this.view.isBuy ? <Lang>lang_place_buy_order</Lang> : <Lang>lang_place_sell_order</Lang>}</div>}
      </div>
    )
  }
  handleOnDropDownPrice = (value) => {
    this.view.optionsPrice = value
    this.forceUpdate()
  }
  showSymbolInfo = () => {
    if (!this.symbolObj.symbol || !checkRole(MapRoleComponent.SecurityDetail)) return;
    dataStorage.goldenLayout.addComponentToStack('SecurityDetail', {
      needConfirm: false,
      data: { symbolObj: this.symbolObj }
    })
  }
  btnClear = () => {
    if (!this.view.disabled) {
      if (this.isModifyOrder) {
        const data = (this.props.state.data && this.props.state.data.data) || this.props.state.data || {}
        this.view.duration = data.duration;
        this.view.exchange = data.exchange;
        this.handleInputVolume(data.volume, 'volume')
        if (data.limit_price) this.handleInputVolume(data.limit_price, 'limitPrice')
        if (data.stop_price) this.handleInputVolume(data.stop_price, 'stopPrice')
      } else {
        this.accountObj = dataStorage.lstAccountDropdown && (dataStorage.lstAccountDropdown.length <= 5) ? this.accountObj : {};
        this.view.isBuy = true;
        this.view.volume = 0
        this.view.displayExchange = null
        this.view.limitPrice = 0;
        this.view.orderValue = 0;
        this.view.stopPrice = 0;
        this.dicUserChoice = {}
        this.symbolChanged();
        this.accountChanged(this.accountObj)
        dataStorage.buySellPanelSymbolChanged && dataStorage.buySellPanelSymbolChanged();
      }
      if (!dataStorage.lstAccountDropdown) {
        if (dataStorage.listMapping && dataStorage.listMapping.length && dataStorage.listMapping.length !== 1) {
          this.accountObj = {};
        }
        if (checkShowAccountSearch()) {
          this.dataCashAccount = null
        }
      }
      this.clearBtn = true
      this.reCalculateOrderValue();
      this.forceUpdate();
    }
  }
  closePosition = () => {
    requirePin(() => {
      const volumePosition = (this.dicPositions[this.symbolObj.symbol] || {}).volume
      const side = volumePosition > 0 ? sideEnum.SELLSIDE : sideEnum.BUYSIDE
      dataStorage.goldenLayout.addComponentToStack('Order', {
        stateOrder: 'NewOrder',
        data: {
          symbol: this.symbolObj.symbol,
          account_id: this.accountObj.account_id,
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
  hideError = () => {
    if (this.view.errorOrder) {
      this.view.errorOrder = '';
      this.errClass = '';
      this.forceUpdate();
    }
  }
  getCalculatedPrice() {
    switch (this.view.orderType) {
      case orderTypeEnum.STOP_LIMIT:
        return this.view.stopPrice || this.view.limitPrice
      case orderTypeEnum.LIMIT:
        return this.view.limitPrice
    }
    if (this.view.isBuy) {
      return (this.priceObj && this.priceObj.ask_price) || 0
    } else {
      return (this.priceObj && this.priceObj.bid_price) || 0
    }
  }
  calculateOrderValue = () => {
    if (this.symbolObj && this.symbolObj.class === 'future') {
      if (this.commodityInfoObj) {
        return roundFloat(this.view.volume * this.getCalculatedPrice() * this.commodityInfoObj.multiplier * this.commodityInfoObj.contract_size, 2)
      }
    } else {
      return roundFloat(this.view.volume * this.getCalculatedPrice(), 2)
    }
  }
  reCalculateOrderValue = (skipUpdate) => {
    this.view.orderValue = this.calculateOrderValue()
    !skipUpdate && this.forceUpdate();
  }
  reCalculateVolume = () => {
    const price = this.getCalculatedPrice();
    if (!price) return 0;
    if (this.symbolObj && this.symbolObj.class === 'future') {
      if (this.commodityInfoObj) {
        if (!this.commodityInfoObj.multiplier) return 0
        if (!this.commodityInfoObj.contract_size) return 0
        this.view.volume = roundFloat(this.view.orderValue / (price * this.commodityInfoObj.multiplier * this.commodityInfoObj.contract_size), 0)
      }
    } else {
      this.view.volume = roundFloat(this.view.orderValue / price, 0);
    }
    this.handleInputVolume(this.view.volume, 'volume')
    // dataStorage.buySellPamelHandleInputPrice && dataStorage.buySellPamelHandleInputPrice(this.view.volume, this.isModifyOrder);
    this.reCalculateOrderValue()
    this.forceUpdate();
  }
  connectionChanged = (isConnected) => {
    if (!isConnected === !this.view.isNotConnected) {
      this.view.isNotConnected = !isConnected
      this.forceUpdate()
    }
  }
  renderType = (orderTypeView) => {
    switch (orderTypeView) {
      case orderTypeEnum.MARKET:
        return <Lang>lang_market</Lang>
      case orderTypeEnum.LIMIT:
        return <Lang>lang_limit</Lang>
      case orderTypeEnum.MARKETTOLIMIT:
        return <Lang>lang_market_to_limit</Lang>
      case orderTypeEnum.STOP:
        return <Lang>lang_stop_loss</Lang>
      case orderTypeEnum.STOP_LIMIT:
        if (this.isSymbolFuture === 'future') {
          return <Lang>lang_stop_limit</Lang>
        } else {
          return <Lang>lang_stop_loss</Lang>
        }
      default:
        return '--'
    }
  }
  renderOrderType = () => {
    return (
      <div className={s.rowOrderPad}>
        <div className={`showTitle text-capitalize`}>{<Lang>lang_order_type</Lang>}</div>
        {
          this.isModifyOrder
            ? <div>{this.renderType(this.view.orderType)}</div>
            : <NoTag>
              {
                this.view.orderTypeOption && this.view.orderTypeOption.length === 1
                  ? <div className='text-capitalize' style={{ paddingRight: '12px' }}><Lang>{this.view.orderTypeOption[0].label}</Lang></div>
                  : <div>
                    <DropDown
                      translate={true}
                      skipnull={true}
                      closeDropdown={disableDrop => this.closeDropdown = disableDrop}
                      className=""
                      options={this.view.orderTypeOption || []}
                      value={this.view.orderType}
                      onChange={this.orderTypeChanged}
                    />
                  </div>
              }
            </NoTag>
        }
      </div>
    )
  }
  renderLimitPrice = () => {
    if (this.view.orderType === orderTypeEnum.LIMIT || this.view.orderType === orderTypeEnum.STOP_LIMIT) {
      return (
        <div className={s.rowOrderPad}>
          <div className={`leftRowOrderPad showTitle text-capitalize`}>{<Lang>lang_limit_price</Lang>}</div>
          <div className={`inputDrop size--3`}>
            <div className='inputDropLimitPrice '>
              <NumberInput
                stateName='limitPrice'
                className={`inputDrop size--3 border-none cursor-text`}
                decimal={4}
                value={this.view.limitPrice}
                requrieRollback={() => this.calculateOrderValue() >= 1e15}
                onChange={this.handleInputVolume}
              />
            </div>
          </div>
        </div>
      )
    }
  }
  renderMarketPrice = () => {
    if (this.view.orderType === orderTypeEnum.STOPLOSS && this.symbolObj.class === 'future') {
      return (
        <div className={s.rowOrderPad}>
          <div className={`leftRowOrderPad showTitle text-capitalize`}>{<Lang>lang_market_price</Lang>}</div>
          <div className={`inputDrop size--3`}>
            <div className={s.marketPrice}>

            </div>
          </div>
        </div>
      )
    }
  }

  renderTriggerPrice = () => {
    if (this.view.orderType === orderTypeEnum.STOP_LIMIT || this.view.orderType === orderTypeEnum.STOPLOSS) {
      return (
        <div className={s.rowOrderPad}>
          <div className={`leftRowOrderPad text-capitalize`}>{<Lang>lang_trigger_price</Lang>}</div>
          <div className={`inputDrop size--3`}>
            <div className='inputDropStopPrice'>
              <NumberInput
                stateName='stopPrice'
                className={`inputDrop size--3 border-none`}
                decimal={4}
                value={this.view.stopPrice}
                onChange={this.handleInputVolume}
              />
            </div>
          </div>
        </div>
      )
    }
  }

  renderQuantity = () => {
    return (
      <div className={s.rowOrderPad}>
        <div className={`showTitle text-capitalize`}>{<Lang>lang_quantity</Lang>}</div>
        <div className={`inputDropVolume`}>
          <div className={`inputDrop size--3`}>
            <div>
              <NumberInput
                stateName='volume'
                className={`inputDrop size--3 border-none cursor-text`}
                decimal={0}
                value={this.view.volume}
                requrieRollback={() => this.calculateOrderValue() >= 1e15}
                onChange={(value) => {
                  this.handleInputVolume(value, 'volume');
                  // dataStorage.buySellPamelHandleInputPrice && dataStorage.buySellPamelHandleInputPrice(value, this.isModifyOrder);
                }}
                monitor={(value) => {
                  dataStorage.buySellPamelHandleInputPrice && dataStorage.buySellPamelHandleInputPrice(value, this.isModifyOrder);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
  renderOrderValue = () => {
    return (
      <div className={s.rowOrderPad}>
        <div className={`showTitle text-capitalize`}>{<Lang>lang_order_value</Lang>}</div>
        <div className={``}>
          <div className={`inputDrop size--3`}>
            <div>
              <NumberInput
                stateName='orderValue'
                className={`inputDrop size--3 border-none cursor-text`}
                decimal={2}
                value={this.view.orderValue}
                onChange={this.handleInputVolume}
                onBlur={this.reCalculateVolume}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderDuration = () => {
    return (
      <div className={s.rowOrderPad}>
        <div className={`showTitle text-capitalize`}>{<Lang>lang_duration</Lang>}</div>
        <div style={{ position: 'relative' }}>
          {
            this.isModifyOrder
              ? durationeEnum[this.view.duration]
              : <div>
                <div className={s.datePicker + ' ' + (this.view.duration === 'GTD' ? s.block : '')}>
                  <DatePicker
                    timeZone={isAUSymbol(this.symbolObj) ? auTimeZone : usTimeZone}
                    customInput={<ExampleCustomInput onChange={this.handleChangeMinDate} selected={this.view.minDate} topIconCalendar={true} hidenIconCalendar={true} />}
                    selected={this.view.minDate}
                    minDate={this.minDate}
                    onChange={this.handleChangeMinDate}
                    notSetMaxDate={true}
                  />
                </div>
                <DropDown
                  skipnull={true}
                  closeDropdown={disableDrop => this.closeDropdown = disableDrop}
                  className=''
                  translate={true}
                  options={this.view.durationOption || []}
                  value={this.view.duration}
                  onChange={this.durationChanged}
                />
              </div>
          }
        </div>
      </div>
    )
  }

  renderExchange = () => {
    return (
      <div className={s.rowOrderPad}>
        <div className='showTitle text-capitalize'>{<Lang>lang_destination</Lang>}</div>
        {
          this.isModifyOrder
            ? <div>{this.view.exchange}</div>
            : <div>
              <DropDown
                skipnull={true}
                readOnly={this.symbolObj && this.symbolObj.class === 'future' && this.view.exchangeOption && this.view.exchangeOption.length === 1}
                closeDropdown={disableDrop => this.closeDropdown = disableDrop}
                className=""
                options={this.view.exchangeOption || []}
                value={this.view.exchange}
                onChange={this.exchangeChanged}
              />
            </div>
        }
      </div>
    )
  }
  renderDirection = () => {
    return <div className={s.rowOrderPad + ' ' + 'text-capitalize'}>
      <div className='showTitle'>{<Lang>lang_side</Lang>}</div>
      <div className={s.orderButton}>
        <div className={s.buy + (this.view.isBuy ? ' ' + s.active : '') + ((this.view.orderType === orderTypeEnum.STOPLOSS || this.view.orderType === orderTypeEnum.STOP_LIMIT) ? ' ' + s.disabled : '')} onClick={() => {
          if (!(this.view.orderType === orderTypeEnum.STOPLOSS || this.view.orderType === orderTypeEnum.STOP_LIMIT)) this.directionChanged(true)
        }}>
          <div><Lang>lang_buy</Lang></div>
        </div>
        <div className={s.sell + (!this.view.isBuy ? ' ' + s.active : '')} onClick={() => this.directionChanged(false)}>
          <div><Lang>lang_sell</Lang></div>
        </div>
      </div>
    </div>
  }
  renderMarketData = () => {
    return <div className={s.rowOrderPad + ' ' + s.colorWhite}>
      <div className='showTitle'>{this.symbolObj.display_name || '--'}</div>
      <div><span className={s.price}>--</span><span className={s.percent}>(--)</span></div>
    </div>
  }
  setColor = (e, _class, color) => {
    if (color !== 5) {
      dataStorage.linkColor = color
      dataStorage.defaultAccount = this.accountObj
      dataStorage.defaultSymbol = this.symbolObj
    }
    const root = e.target.closest('.link')
    const src = root.querySelector('img').getAttribute('src')
    this.elmLink.querySelector('img').setAttribute('src', src)
    this.elmLink.classList = `linkOrderPad link ${_class}`
    this.elmLink.querySelector('.active') && this.elmLink.querySelector('.active').classList.remove('active')
    this.view.color = color
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
  renderSecurityDetail = () => {
    return <div className='text-capitalize' style={{ marginTop: '4px' }}>
      <div className={s.title}><Lang>lang_security_infomation</Lang></div>
      {
        this.symbolObj.class === 'future' ? <div>
          <div className={s.rowOrderPad}>
            <div className={'showTitle'}><Lang>lang_master_symbol</Lang></div>
            <div className={'showTitle'}>{this.symbolObj.display_master_code || this.commodityInfoObj.symbol || '--'}</div>
          </div>
          <div className={s.rowOrderPad}>
            <div className={'showTitle'}><Lang>lang_product</Lang></div>
            <div className={'showTitle text-uppercase '}>{this.commodityInfoObj.class === 'Future' ? 'FUTURES' : this.commodityInfoObj.class || '--'}</div>
          </div>
          <div className={s.rowOrderPad}>
            <div className={'showTitle'}><Lang>lang_settlement_date</Lang></div>
            <div className={'showTitle'}>--</div>
          </div>
          <div className={s.rowOrderPad}>
            <div className={'showTitle'}>Contract Size (Units)</div>
            <div className={'showTitle'}>{formatNumberVolume(this.commodityInfoObj.contract_size) || '--'} ({this.commodityInfoObj.unit || '--'})</div>
          </div>
          <div className={s.rowOrderPad}>
            <div className={'showTitle'}>Min. Price Fluctuation</div>
            <div className={'showTitle'}>{this.commodityInfoObj.tick_size || '--'} ({(this.commodityInfoObj.test || '--') + '/Contract'})</div>
          </div>
        </div> : <div>
          <div className={s.rowOrderPad}>
            <div className={'showTitle'}><Lang>lang_prev_close</Lang></div>
            <div className={'showTitle'}>{formatNumberPrice(this.priceObj.previous_close, true) || '--'}</div>
          </div>
          <div className={s.rowOrderPad}>
            <div className={'showTitle'}><Lang>lang_open</Lang></div>
            <div className={'showTitle'}>{formatNumberPrice(this.priceObj.open, true) || '--'}</div>
          </div>
          <div className={s.rowOrderPad}>
            <div className={'showTitle'}><Lang>lang_volume</Lang></div>
            <div className={'showTitle'}>{formatNumberVolume(this.priceObj.volume, true) || '--'}</div>
          </div>
        </div>
      }
    </div>
  }
  renderPosition = () => {
    const averagePrice = this.symbolObj.symbol && this.dicPositions[this.symbolObj.symbol] && formatNumberPrice(this.dicPositions[this.symbolObj.symbol].average_price, true)
    const volumePosition = this.symbolObj.symbol && this.dicPositions[this.symbolObj.symbol] && formatNumberVolume(this.dicPositions[this.symbolObj.symbol].volume, true)
    const profitLoss = this.dicProfitVal && this.symbolObj.symbol && this.dicProfitVal[this.symbolObj.symbol]
    return <div>
      <div className={s.title + ' ' + 'text-capitalize'}><Lang>lang_position_information</Lang></div>
      <div>
        <div className={s.rowOrderPad}>
          <div className={'showTitle text-capitalize'}><Lang>lang_net_position</Lang></div>
          <div className='showTitle'>{volumePosition && averagePrice ? volumePosition + ' @ ' + averagePrice : 0}</div>
        </div>
        <div className={s.rowOrderPad}>
          <div className={'showTitle text-capitalize'}><Lang>lang_profit_per_loss</Lang></div>
          <div className={`showTitle ${s[this.changeColor(profitLoss)]}`}>
            {profitLoss ? `${formatProfitLoss(profitLoss)} ${this.accountObj.currency}` : 0}
          </div>
        </div>
      </div>
    </div>
  }
  renderChart = () => {
    if (!this.priceObj) return null;
    const range = this.priceObj.high - this.priceObj.low;
    const open = (this.priceObj.open - this.priceObj.low) * 100 / range
    const trade = ((this.priceObj.trade_price - this.priceObj.low) * 100 / range) < 0 ? 0 : (this.priceObj.trade_price - this.priceObj.low) * 100 / range
    const min = trade < open ? trade : open
    const max = trade > open ? trade : open
    let haveWeekChart = false;
    let weekTrade = 0;
    let weekMin = 0;
    let weekMax = 0;
    if (this.priceObj.fifty_two_week_high && this.priceObj.fifty_two_week_low) {
      let weekHigh = (this.priceObj.fifty_two_week_high || 0)
      let weekLow = (this.priceObj.fifty_two_week_low || 0)
      let weekRange = weekHigh - weekLow;
      let weekOpen = (this.priceObj.open - weekLow) * 100 / weekRange
      weekTrade = (this.priceObj.trade_price - weekLow) * 100 / weekRange
      weekMin = weekTrade < weekOpen ? weekTrade : weekOpen
      weekMax = weekTrade > weekOpen ? weekTrade : weekOpen
      haveWeekChart = true
    }

    return <div>
      <div className={s.title + ' ' + 'text-capitalize'}><Lang>lang_day_range</Lang></div>
      <div className={s.chart + ' chartDay'}>
        <div className={s.bar}>
          <div className={s.fill} style={{ left: min + '%', right: (100 - max) + '%' }}></div>
          <div className={s.point} style={{ left: `calc(${trade}% - 3px)` }}></div>
        </div>
        <div className={s.lim}>
          <div>{formatNumberPrice(this.priceObj.low, true)}</div>
          <div>{formatNumberPrice(this.priceObj.high, true)}</div>
        </div>
      </div>
      {
        this.symbolObj.class === 'future' ? <div>
          <div className={s.title}><Lang>lang_52_week_range</Lang></div>
          {haveWeekChart
            ? <div className={s.chart}>
              <div className={s.bar}>
                <div className={s.fill} style={{ left: weekMin + '%', right: (100 - weekMax) + '%' }}></div>
                <div className={s.point} style={{ left: `calc(${weekTrade}% - 3px)` }}></div>
              </div>
              <div className={s.lim}>
                <div>{formatNumberPrice(this.priceObj.fifty_two_week_low, true)}</div>
                <div>{formatNumberPrice(this.priceObj.fifty_two_week_high, true)}</div>
              </div>
            </div>
            : null
          }
          <div className={s.title + ' ' + 'text-capitalize'}><Lang>lang_calendar_year_range</Lang></div>
        </div> : null
      }
    </div>
  }
  renderOrderInfo = () => {
    return <div>
      <div className={s.title + ' ' + 'text-capitalize'}><Lang>lang_order_information</Lang></div>
      <div>
        <div className={s.rowOrderPad}>
          <div className={'showTitle'}><Lang>lang_side</Lang></div>
          <div className='showTitle'><span className={`text-uppercase ${this.view.isBuy ? 'priceUp' : 'priceDown'}`}><Lang>{this.view.isBuy ? 'lang_buy' : 'lang_sell'}</Lang></span></div>
        </div>
        <div className={s.rowOrderPad}>
          <div className={'showTitle text-capitalize'}><Lang>lang_order_type</Lang></div>
          <div className='showTitle text-uppercase'><Lang>{(this.view.orderTypeOption.filter(item => item.value === this.view.orderType) || [{}])[0].label}</Lang></div>
        </div>
        <div className={s.rowOrderPad}>
          <div className={'showTitle text-capitalize'}><Lang>lang_symbol</Lang></div>
          <div className='showTitle'>{this.symbolObj.display_name}</div>
        </div>
        <div className={s.rowOrderPad}>
          <div className={'showTitle text-capitalize'}><Lang>lang_company_name</Lang></div>
          <div className='showTitle'>{this.symbolObj.security_name || this.symbolObj.company_name || this.symbolObj.company}</div>
        </div>
        <div className={s.rowOrderPad}>
          <div className={'showTitle text-capitalize'}><Lang>lang_quantity</Lang></div>
          <div className='showTitle'>{this.view.volume || '--'} <Lang>lang_unit</Lang></div>
        </div>
        {this.view.orderType === orderTypeEnum.STOP_LIMIT || this.view.orderType === orderTypeEnum.STOPLOSS ? <div className={s.rowOrderPad}>
          <div className={'showTitle text-capitalize'}><Lang>lang_trigger_price</Lang></div>
          <div className='showTitle'>{formatNumberPrice(this.view.stopPrice, true)}</div>
        </div> : null}
        {this.view.orderType === orderTypeEnum.LIMIT || this.view.orderType === orderTypeEnum.STOP_LIMIT ? <div className={s.rowOrderPad}>
          <div className={'showTitle text-capitalize'}><Lang>lang_limit_price</Lang></div>
          <div className='showTitle'>{formatNumberPrice(this.view.limitPrice, true)}</div>
        </div> : null}
        <div className={s.rowOrderPad}>
          <div className={'showTitle text-capitalize'}><Lang>lang_duration</Lang></div>
          <div className='showTitle'>{this.view.duration === 'GTD' ? this.renderGTD() : <Lang>{durationeEnum[this.view.duration]}</Lang>}</div>
        </div>
        <div className={s.rowOrderPad}>
          <div className={'showTitle text-capitalize'}><Lang>lang_destination</Lang></div>
          <div className='showTitle'>{this.view.displayExchange}</div>
        </div>
      </div>
    </div>
  }
  renderGTD() {
    return (
      <div className='text-capitalize'>
        <Lang>lang_good_till</Lang>&nbsp;
        {this.view.minDate.format('DD/MM/YYYY')}
      </div>
    )
  }
  renderReview = (cashAvailable) => {
    if (!this.view.review) return null;
    return <div className={s.bodyReview}>
      <div className={s.form}>
        <div>
          <div>
            <div className={s.title + ' ' + 'text-capitalize'}><Lang>lang_account_information</Lang></div>
            <div>
              <div className={s.rowOrderPad}>
                <div className={'showTitle text-capitalize'}><Lang>lang_account_id</Lang></div>
                <div className='showTitle'>{this.accountObj.account_id}</div>
              </div>
              <div className={s.rowOrderPad}>
                <div className={'showTitle text-capitalize'}><Lang>lang_account_name</Lang></div>
                <div className='showTitle'>{this.accountObj.account_name}</div>
              </div>
              {
                this.accountObj.currency === 'VND'
                  ? <div className={s.rowOrderPad}>
                    <div className={'showTitle text-capitalize'}><Lang>lang_initial_margin_available</Lang></div>
                    <div className='showTitle'><span className={`${this.changeColor(cashAvailable)}`}>{showMoneyFormatter(cashAvailable, this.accountObj.currency)} {this.accountObj.currency}</span></div>
                  </div>
                  : <div className={s.rowOrderPad}>
                    <div className={'showTitle text-capitalize'}><Lang>lang_trading_balance</Lang></div>
                    <div className='showTitle'><span className={`${this.changeColor(cashAvailable)}`}>{showMoneyFormatter(cashAvailable, this.accountObj.currency)} {this.accountObj.currency}</span></div>
                  </div>
              }
            </div>
          </div>
          {this.view.expand ? null : this.renderOrderInfo()}
          {this.renderDetail(this.estimatedPriceObj)}
        </div>
        {this.view.expand ? <div>
          {this.renderOrderInfo()}
        </div> : null}
      </div>
    </div>
  }
  render() {
    const checkShowAccount = checkShowAccountSearch()
    let isShowingReatailMappingOneAccount = false
    if (dataStorage.userInfo &&
      (dataStorage.userInfo.user_type === role.RETAIL || dataStorage.userInfo.user_type === role.ADVISOR) &&
      dataStorage.accountInfo &&
      (dataStorage.accountInfo.status === 'active') &&
      dataStorage.lstAccountDropdown &&
      dataStorage.lstAccountDropdown.length === 1) {
      isShowingReatailMappingOneAccount = true
    }
    const accountId = (checkShowAccount || isShowingReatailMappingOneAccount)
      ? ((this.accountObj && this.accountObj.account_id) || '')
      : ''
    const estimatedPriceObj = this.estimatedPriceObj
    let cashAvailable = null;
    if (this.symbolObj.symbol && this.dataCashAccount) {
      if (this.symbolObj.class === 'future') {
        cashAvailable = this.dataCashAccount.initial_margin_available
      } else if (isAUSymbol(this.symbolObj)) {
        cashAvailable = this.dataCashAccount.available_balance_au || this.dataCashAccount.cash_available_au;
      } else {
        cashAvailable = this.dataCashAccount.available_balance_us || this.dataCashAccount.cash_available_us;
      }
    }
    const lst = [s.outline, this.view.isBuy ? s.buy : s.sell];
    if (this.view.disabled) lst.push(s.disabled);
    if (this.view.isNotConnected) lst.push(s.connecting);
    if (this.view.expand) lst.push(s.expand);
    if (this.view.showMore) lst.push(s.more);
    if (this.view.review) lst.push(s.review);
    if (this.isModifyOrder) lst.push(s.isModifyOrder);
    if (this.errClass) lst.push(this.errClass);
    if (this.symbolObj.class === 'future') lst.push(s.future);
    return (
      <div onClick={this.hideError} ref={dom => this.dom = dom} className={lst.join(' ')}>
        <div className={s.header} ref={dom => dom && this.props.setHeader && this.props.setHeader(dom)}>
          <div className={s.iconLink}>
            <div className="linkOrderPad link qe-color5" ref={dom => this.elmLink = dom}>
              <img src="/common/link-variant-off.svg" />
              {(this.isModifyOrder || this.view.review) ? null : <div className="chooseColor">
                <div className="link qe-color0" onClick={(e) => this.setColor(e, 'qe-color0', 0)}><img src="/common/link-variant.svg" /></div>
                <div className="link qe-color1" onClick={(e) => this.setColor(e, 'qe-color1', 1)}><img src="/common/link-variant.svg" /></div>
                <div className="link qe-color2" onClick={(e) => this.setColor(e, 'qe-color2', 2)} ><img src="/common/link-variant.svg" /></div>
                <div className="link qe-color3" onClick={(e) => this.setColor(e, 'qe-color3', 3)}><img src="/common/link-variant.svg" /></div>
                <div className="link qe-color4" onClick={(e) => this.setColor(e, 'qe-color4', 4)} ><img src="/common/link-variant.svg" /></div>
                <div className="link qe-color5" onClick={(e) => this.setColor(e, 'qe-color5', 5)} ><img src="/common/link-variant-off.svg" /></div>
              </div>}
            </div>
          </div>
          <div className='text-capitalize'>{this.view.review ? <Lang>lang_review_order</Lang> : (this.isModifyOrder ? <Lang>lang_modify_order</Lang> : <Lang>lang_new_order</Lang>)}</div>
          <div className={s.closeForm}>
            <span className={s.btnClose} onClick={this.props.close}><Icon color={'#666b77'} src={'navigation/close'} style={{ height: '16px', width: '16px' }} /></span>
          </div>
        </div>
        {this.view.errorOrder ? <div className={`errorOrder size--3`}>{/[\s.]/.test(this.view.errorOrder) ? this.view.errorOrder : <Lang>{this.view.errorOrder}</Lang>}</div> : null}
        {this.view.warningOrder ? <div className={`errorOrder size--3 yellow`}>{/[\s.]/.test(this.view.warningOrder) ? this.view.warningOrder : <Lang>{this.view.warningOrder}</Lang>}</div> : null}
        {this.renderReview(cashAvailable)}
        <div className={s.body}>
          <div>
            {
              checkShowAccount
                ? <div className={(this.view.searchingAccount || !this.accountObj.account_id ? ' ' + s.searching : '')}>
                  <div className={s.accountInfo + ' ' + s.accountText} onClick={() => this.showSearchAccount(true)}><div className={s.backgroundAccount}><div className={s.textEllipsis}>{this.accountObj && this.accountObj.account_name}&nbsp;</div><div>{`(${this.accountObj.account_id})`}</div></div></div>
                  <div className={s.accountInfo + ' ' + s.accountSearchBox}>
                    <SearchAccount
                      accountId={accountId}
                      formName='newOrder'
                      dataReceivedFromSearchAccount={this.accountChanged}
                      onBlur={() => this.showSearchAccount(false)}
                      refDom={dom => this.searchAccountDom = dom}
                    />
                  </div>
                </div>
                : <div className={s.accountInfo + ' ' + s.accountText} ><div className={s.backgroundAccount}><div className={s.textEllipsis}>{this.accountObj && this.accountObj.account_name}&nbsp; </div><div>{`(${this.accountObj.account_id})`}</div></div></div>
            }
            {
              this.accountObj.account_id && this.symbolObj.class
                ? this.accountObj.currency === 'VND'
                  ? <div className={s.availableInfo + ' ' + 'text-capitalize'}>
                    <div className={s.content}>
                      <div><Lang>lang_initial_margin_available</Lang></div>
                      <span className={`${this.changeColor(cashAvailable)}`}>{showMoneyFormatter(cashAvailable, this.accountObj.currency)} {this.accountObj.currency}</span>
                    </div>
                  </div>
                  : <div className={s.availableInfo + ' ' + 'text-capitalize'}>
                    <div className={s.content}>
                      <div><Lang>lang_trading_balance</Lang></div>
                      <span className={`${this.changeColor(cashAvailable)}`}>{showMoneyFormatter(cashAvailable, this.accountObj.currency)} {this.accountObj.currency}</span>
                    </div>
                  </div>
                : null
            }
            <div className={s.line}></div>
            <div className={s.form}>
              <div>
                <div className={s.searchBox + (this.view.searchingSymbol || !this.symbolObj.symbol ? ' ' + s.searching : '')}>
                  <div className={s.symbolText} onClick={() => this.showSearchSymbol(true)}>
                    <div className={s.companyName + ' ' + `size--3` + ' ' + `showTitle`}>
                      {this.symbolObj && (this.symbolObj.company_name || this.symbolObj.security_name)}
                    </div>
                  </div>
                  <div className={s.symbolSearchBox}>
                    <SearchBox
                      dataReceivedFromSearchBox={(symObj) => {
                        this.symbolChanged(symObj);
                        dataStorage.buySellPanelSymbolChanged && dataStorage.buySellPanelSymbolChanged(symObj, this.isModifyOrder)
                      }}
                      contingentOrder={this.props.contingentOrder}
                      placeholder='lang_search_symbol'
                      checkNewOrder={true}
                      obj={this.symbolObj}
                      onBlur={() => this.showSearchSymbol(false)}
                      refDom={dom => this.searchSymbolDom = dom} />
                  </div>
                </div>
                <div>
                  {this.renderMarketData()}
                  {this.renderDirection()}
                  {this.renderOrderType()}
                  {this.renderQuantity()}
                  {this.renderLimitPrice()}
                  {this.renderMarketPrice()}
                  {this.renderTriggerPrice()}
                  {/* {this.renderOrderValue()} */}
                  {this.renderDuration()}
                  {this.renderExchange()}
                </div>
                {this.view.expand ? null : this.renderDetail(estimatedPriceObj)}
                {this.symbolObj.class === 'future' && this.view.showMore && !this.view.expand ? this.renderPosition() : null}
              </div>
              {this.view.showMore ? <div>
                {this.renderSecurityDetail()}
                {this.view.showMore && (this.symbolObj.class !== 'future' || !this.view.expand) ? this.renderChart() : null}
                {this.symbolObj.class !== 'future' || this.view.expand ? this.renderPosition() : null}
              </div> : null}
              {this.view.expand ? <div>
                {this.renderDetail(estimatedPriceObj)}
                {this.symbolObj.class === 'future' && this.view.showMore ? this.renderChart() : null}
              </div> : null}
            </div>
          </div>
        </div>
        {this.symbolObj.class === 'future' ? <div className={s.line}></div> : null}
        <div className={s.footer}>
          <div className={s.submitButton + (this.view.noChange ? ' ' + s.disabled : '')} onClick={this.submit}>
            <div className={s.spinner + (this.isLoading ? '' : ' hidden')}><img src='common/Spinner-white.svg' /></div>
            {this.renderBtnPlace(cashAvailable)}
          </div>
          <div className={s.footerSub}>
            {!this.isModifyOrder
              ? <div className={`${s.checkBox} size--3 pointer ${this.isLoading ? ' disabled' : ''}`}
              >
                <div className={s.flex} onClick={() => this.toggleSaveAsDefault()}>
                  <img src={`${this.dontSaveOrder ? '/common/outline-check_box_outline_blank.svg' : '/common/checkbox-marked-outline.svg'}`} style={{ paddingRight: '8px' }} />
                  <span><Lang>lang_save_as_default</Lang></span>
                </div>
                {this.symbolObj.symbol ? <div className={s.btnClear + ' ' + 'text-capitalize'} onClick={() => {
                  this.view.showMore = !this.view.showMore;
                  this.forceUpdate();
                }}>{this.view.showMore ? <Lang>lang_show_less</Lang> : <Lang>lang_show_all</Lang>}</div> : null}
              </div>
              : <div></div>
            }
            {this.symbolObj && this.symbolObj.class === 'equity' && this.symbolObj.country === 'US' && !isAUSymbol(this.symbolObj) && this.view.isBuy ? <div className='size--3 underline italic' title='Cash Available to Buy US Securities does not include your settlement in T+2 & Others'>
              <Lang>lang_ask_different_in_cash_available</Lang>
            </div> : null}
          </div>
        </div>
      </div>
    )
  }
}

export default OrderPadV2
