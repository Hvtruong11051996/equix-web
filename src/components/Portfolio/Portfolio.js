import React from 'react';
import uuidv4 from 'uuid/v4';
import Grid from '../Inc/CanvasGrid';
import dataStorage from '../../dataStorage';
import logger from '../../helper/log';
import {
  formatNumberPrice,
  formatNumberValue,
  formatNumberVolume,
  checkPropsStateShouldUpdate,
  hideElement,
  checkRole,
  isInvalidData,
  getCsvFile,
  checkShowAccountSearch
} from '../../helper/functionUtils'
import {
  postData,
  getData,
  makeSymbolUrl,
  getUrlTotalPosition,
  getReportCsvFileUrl,
  getUrlTransactionAccountNoLimit, completeApi,
  getUrlAnAccount
} from '../../helper/request';
import { registerAccount, unregisterAccount, registerAllOrders, unregisterAllOrders, registerUser, unregisterUser } from '../../streaming';
import FilterBox from '../Inc/FilterBox'
import SearchAccount from '../SearchAccount';
import MapRoleComponent from '../../constants/map_role_component';
import { getCountryCode } from '../Inc/Flag';
import { getApiFilter } from '../api';
import config from '../../../public/config';
import { regisRealtime, unregisRealtime } from '../../helper/streamingSubscriber';
import SymbolClass, { LANG_CLASS } from '../../constants/symbol_class';
import ToggleLine from '../Inc/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant'
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'

const lstCheckSide = [
  { label: 'lang_buy', value: 'buy', className: 'text-uppercase' },
  { label: 'lang_sell', value: 'sell', className: 'text-uppercase' },
  { label: 'lang_closed', value: 'close', className: 'text-uppercase' }
]
class Portfolio extends React.Component {
  constructor(props) {
    super(props);
    const initState = this.props.loadState();
    this.symbolWait = {}
    this.id = uuidv4();
    this.isReady = false;
    this.isConnected = dataStorage.connected;
    this.collapse = initState.collapse ? 1 : 0
    this.pageObj = {
      total_count: 0,
      total_pages: 1,
      current_page: 1,
      page_size: 50
    }
    this.state = {
      accountObj: {},
      defaultOptionPortfolio: 'Holdings',
      defaultOptionDate: initState.defaultOptionDate || '3months',
      option: {},
      valueFilter: initState.valueFilter || ''
    }

    props.glContainer.on('show', () => {
      hideElement(props, false, this.id);
    });
    props.glContainer.on('hide', () => {
      hideElement(props, false, this.id);
    });

    this.realTimeDataUser = this.realTimeDataUser.bind(this)
    this.changeAccount = this.changeAccount.bind(this);
    this.realtimeData = this.realtimeData.bind(this);
    !this.props.isAllHoldings && this.props.receive({
      account: this.changeAccount
    });
    this.bodyExport = {}
    this.dicSymbol = {}
    this.showClosePositionBtn = false;
    this.filterAllText = '';
    this.oldValue = '';
    this.dicCompanyName = {};
    this.dicData = {};
    this.isFirst = true;
    this.symbolWait = {}
  }

  changeAccount(account, checkForm) {
    if (!account) account = dataStorage.accountInfo;
    if (!account || !account.account_id) return
    if (!account) account = {};
    if (!this.state.accountObj || this.state.accountObj.account_id !== account.account_id) {
      this.needRegisRealtime = true;
      this.setState({
        accountObj: account,
        currency: account.currency
      }, () => {
        if (checkForm === 'receiveToSearchAccount') {
          this.props.send({
            account: account
          })
        }
        this.getDataPofolio();
      })
    }
  }

  getColums(currency) {
    let columns = [
      {
        header: 'lang_code',
        name: 'display_name',
        type: TYPE.SYMBOL,
        fnType: params => params.detail && 'transaction',
        formater: (params) => {
          if (params.bottom) return dataStorage.translate('lang_total').toUpperCase();
          return params.data.display_name || params.data.symbol || '';
        }
      },
      {
        header: 'lang_security',
        hide: true,
        name: 'security_name',
        formater: (params) => {
          if (params.bottom) return '';
          if (params.detail) return '';
          return params.data.security_name || params.data.company_name || '';
        }
      },
      {
        header: 'lang_side',
        name: 'side',
        options: lstCheckSide,
        suppressGroup: true,
        getTextColorKey: (params) => {
          if (params.bottom) return '';
          if (params.detail) return params.data.is_buy + '' === '1' ? '--buy-light' : '--sell-light';
          if ((params.data.side + '').toLocaleLowerCase() === 'buy') return '--buy-light';
          if ((params.data.side + '').toLocaleLowerCase() === 'sell') return '--sell-light';
        },
        formater: (params) => {
          if (params.bottom) return '';
          if (params.detail) return params.data.is_buy + '' === '1' ? 'BUY' : 'SELL';
          return (params.data.side === 'Close' ? 'Closed' : params.data.side).toUpperCase();
        }
      },
      {
        header: 'lang_quantity',
        name: 'volume',
        align: 'right',
        suppressGroup: true,
        getTextColorKey: (params) => {
          if (params.bottom) return '';
          if (params.detail) return params.data.is_buy + '' === '1' ? '--buy-light' : '--sell-light';
          if ((params.data.side + '').toLocaleLowerCase() === 'buy') return '--buy-light';
          if ((params.data.side + '').toLocaleLowerCase() === 'sell') return '--sell-light';
        },
        formater: (params) => {
          if (params.bottom) return '';
          if (params.data) {
            if ((params.data.side + '').toLocaleLowerCase() === 'close') return ''
            return formatNumberVolume(params.data.volume);
          }
        }
      },
      {
        header: 'lang_mkt_price',
        name: 'market_price',
        align: 'right',
        suppressGroup: true,
        type: TYPE.FLASH,
        formater: (params) => {
          if (params.bottom) return '';
          if (params.data) {
            return formatNumberPrice(params.value, true);
          }
        }
      },
      {
        header: 'lang_average_price',
        align: 'right',
        type: TYPE.FLASH_NO_BG,
        suppressGroup: true,
        name: 'average_price',
        formater: (params) => {
          if (params.bottom) return '';
          if (params.data) {
            if (params.data.side === 'Close') return '';
            const value = params.detail ? params.data.price : params.data.average_price
            if (isInvalidData(value)) return '--';
            return formatNumberPrice(value, true);
          }
        }
      },
      {
        header: 'lang_book_val',
        aggFunc: 'sum',
        suppressGroup: true,
        align: 'right',
        name: 'book_value',
        type: TYPE.FLASH_NO_BG,
        hide: false,
        formater: (params) => {
          if (params.bottom) return '';
          if (params.detail) return '';
          if (params.data) {
            if (params.data.side === 'Close') return '';
            const countryCode = getCountryCode(params.data);
            if (countryCode === 'au') return '';
            if (isInvalidData(params.data.book_value)) {
              return '--';
            }
            return formatNumberValue(params.data.book_value, true);
          }
        }
      },
      {
        header: 'lang_book_value_currency',
        name: 'book_value_convert',
        suppressGroup: true,
        type: TYPE.FLASH_NO_BG,
        align: 'right',
        formater: (params) => {
          if (params.detail) return '';
          if (params.data) {
            if (params.data.side === 'Close') return '';
            if (isInvalidData(params.data.book_value_convert)) {
              return '--';
            }
            let value = params.data.book_value_convert;
            let trueCurrency = currency || this.state.currency || '';
            let innerDiv = '--'
            if (trueCurrency === 'VND') innerDiv = formatNumberVolume(value, true);
            else innerDiv = formatNumberValue(value, true);
            return innerDiv
          }
        }
      },
      {
        header: 'lang_market_val',
        name: 'value',
        type: TYPE.FLASH_NO_BG,
        align: 'right',
        suppressGroup: true,
        hide: false,
        formater: (params) => {
          if (params.bottom) return '';
          if (params.detail) return '';
          if (params.data) {
            if (params.data.side === 'Close') return '';
            const countryCode = getCountryCode(params.data);
            if (countryCode === 'au') return '';
            if (isInvalidData(params.data.value)) return '--';
            let value = params.data.value;
            return formatNumberValue(value, true);
          }
        }
      },
      {
        header: 'lang_market_value_currency',
        name: 'value_convert',
        align: 'right',
        type: TYPE.FLASH_NO_BG,
        suppressGroup: true,
        formater: (params) => {
          if (params.detail) return '';
          if (params.data) {
            if (params.data.side === 'Close') return '';
            if (isInvalidData(params.data.value_convert)) return '--';
            let value = params.data.value_convert
            let trueCurrency = currency || this.state.currency || '';
            let innerDiv = '--'
            if (trueCurrency === 'VND') innerDiv = formatNumberVolume(value, true);
            else innerDiv = formatNumberValue(value, true);
            return innerDiv
          }
        }
      },
      {
        header: 'lang_today_profit_loss',
        align: 'right',
        type: TYPE.FLASH_NO_BG,
        name: 'today_change_val',
        suppressGroup: true,
        getTextColorKey: (params) => {
          if (params.data.today_change_val > 0) return '--buy-light';
          if (params.data.today_change_val < 0) return '--sell-light';
        },
        formater: (params) => {
          if (params.detail) return '';
          if (params.data) {
            if (params.data.side === 'Close') return '';
            let todayChangeVal;
            const marketPrice = params.data.market_price
            const preClose = params.data.pre_close
            const volume = params.data.volume
            if (isInvalidData(params.data.today_change_val)) {
              return '--';
            } else if (((marketPrice - preClose) * volume) === 0) {
              todayChangeVal = 0.00
            } else {
              todayChangeVal = params.data.today_change_val;
            }
            return formatNumberPrice(todayChangeVal, true);
          }
        }
      },
      {
        header: 'lang_today_profit_loss_percent',
        name: 'today_change_percent',
        align: 'right',
        type: TYPE.FLASH_NO_BG,
        suppressGroup: true,
        getTextColorKey: (params) => {
          if (params.data.today_change_percent > 0) return '--buy-light';
          if (params.data.today_change_percent < 0) return '--sell-light';
        },
        formater: (params) => {
          if (params.detail) return '';
          if (params.data) {
            if (params.data.side === 'Close') return '';
            let result
            if (isInvalidData(params.data.today_change_percent)) {
              return '--';
            } else {
              result = params.data.today_change_percent * 100 || 0;
              if (!params.data.footerFlag) result = formatNumberValue(result, true)
              else result = params.data.today_change_percent
              return formatNumberValue(result, true) + '%'
            }
          }
        }
      },
      {
        header: 'lang_total_profit_loss',
        align: 'right',
        name: 'upnl',
        type: TYPE.FLASH_NO_BG,
        suppressGroup: true,
        getTextColorKey: (params) => {
          if (params.data.upnl > 0) return '--buy-light';
          if (params.data.upnl < 0) return '--sell-light';
        },
        formater: (params) => {
          if (params.detail) return '';
          if (params.data) {
            if (params.data.side === 'Close') return '';
            let upnl;
            if (isInvalidData(params.data.upnl)) {
              return '--';
            } else {
              upnl = params.data.upnl;
            }
            return formatNumberValue(upnl, true);
          }
        }
      },
      {
        header: 'lang_total_profit_loss_percent',
        align: 'right',
        type: TYPE.FLASH_NO_BG,
        name: 'profit_percent',
        suppressGroup: true,
        getTextColorKey: (params) => {
          if (params.data.profit_percent > 0) return '--buy-light';
          if (params.data.profit_percent < 0) return '--sell-light';
        },
        formater: (params) => {
          if (params.detail) return '';
          if (params.data) {
            if (params.data.side === 'Close') return '';
            let result;
            if (isInvalidData(params.data.profit_percent)) {
              return '--';
            } else {
              result = params.data.profit_percent;
              if (!params.data.footerFlag) result = formatNumberValue(result * 100, true) + '%';
              else result = formatNumberValue(result, true) + '%';
            }
            return result;
          }
        }
      }, (this.props.isAllHoldings ? (checkRole(MapRoleComponent.NEW_ORDER_BUTTON_HOLDINGS) || checkRole(MapRoleComponent.CLOSE_ORDER_BUTTON_HOLDINGS)) : (checkRole(MapRoleComponent.NEW_ORDER_BUTTON_PORTFOLIO) || checkRole(MapRoleComponent.CLOSE_ORDER_BUTTON_PORTFOLIO))) ? {
        header: 'lang_action',
        name: 'actionOrder',
        float: true,
        type: TYPE.HOLDING_ACTIONS
      } : null,
      {
        header: 'lang_security_type',
        name: 'style',
        options: [
          { label: LANG_CLASS.EQUITY, value: 'equity' },
          { label: LANG_CLASS.ETF, value: 'etf' },
          { label: LANG_CLASS.FUTURES, value: 'future' },
          { label: LANG_CLASS.MF, value: 'managed funds' },
          { label: LANG_CLASS.OPTION, value: 'option' },
          { label: LANG_CLASS.WARRANT, value: 'warrant' },
          { label: LANG_CLASS.OTHERS, value: 'Others' }
        ],
        groupIndex: 0,
        valueGetter: (params) => {
          if (params.data) {
            let result;
            result = params.data.style || params.data.class || 'others'
            return (result + '').toUpperCase();
          }
        },
        formater: params => {
          if (params.bottom) return '';
          return (params.value + '')
        }
      }
    ]
    let columnsAll = [
      {
        header: 'lang_client_id',
        name: 'account_id',
        suppressGroup: true,
        formater: (params) => {
          if (params.detail) return '';
          if (params.data) {
            if (!params.detail) {
              return params.data.account_id
            }
          }
          return ''
        }
      },
      {
        header: 'lang_client_name',
        hide: true,
        suppressGroup: true,
        name: 'account_name',
        formater: (params) => {
          if (params.detail) return '';
          if (params.data) {
            if (!params.detail) {
              return params.data.account_name | ''
            }
          }
          return ''
        }
      },
      ...columns
    ]
    return (this.props.isAllHoldings ? columnsAll : columns);
  }
  mapSymbol(data, symbolObj) {
    data.trading_halt = symbolObj.trading_halt || 0
    data.display_exchange = symbolObj.display_exchange || ''
    data.class = symbolObj.class || ''
    data.display_master_code = symbolObj.display_master_code || ''
    data.display_master_name = symbolObj.display_master_name || ''
    data.country = symbolObj.country || ''
    data.currency = symbolObj.currency || ''
    data.master_code = symbolObj.master_code
    data.first_noti_day = symbolObj.first_noti_day
    data.expiry_date = symbolObj.expiry_date
  }
  currencyAccSymbol = (currencyAcc, currencySymbol) => {
    return currencyAcc === currencySymbol
  }
  realtimeData(dataRealtime) {
    let data;
    if (typeof dataRealtime === 'string') data = JSON.parse(dataRealtime)
    else data = dataRealtime
    if (data.ping) return
    const arrType = data.data.title.split('#')
    if (data.data.object_changed) data = JSON.parse(data.data.object_changed);
    if (arrType[0] === 'portfolio') {
      if (dataStorage.symbolsObjDic[data.symbol]) {
        this.mapSymbol(data, dataStorage.symbolsObjDic[data.symbol]);
        this.addOrUpdate(data, this.props.isAllHoldings);
      } else {
        if (this.symbolWait[data.symbol]) {
          this.symbolWait[data.symbol][data.account_id] = data
        } else {
          this.symbolWait[data.symbol] = { [data.account_id]: data }
          const urlMarketInfo = makeSymbolUrl(encodeURIComponent(data.symbol))
          getData(urlMarketInfo)
            .then(response => {
              if (response.data && response.data[0]) {
                const symbolObj = response.data[0]
                dataStorage.symbolsObjDic[data.symbol] = symbolObj
                Object.keys(this.symbolWait[data.symbol]).forEach(key => {
                  let elm = this.symbolWait[data.symbol][key]
                  this.mapSymbol(elm, symbolObj);
                  this.addOrUpdate(elm, this.props.isAllHoldings);
                  delete this.symbolWait[data.symbol][key]
                })
                delete this.symbolWait[data.symbol]
              }
            })
            .catch(error => {
              logger.log(error)
            })
        }
      }
    } else if (arrType[0] === 'TRANSACTION') {
      dataStorage.symbolsObjDic[data.symbol] && this.mapSymbol(data, dataStorage.symbolsObjDic[data.symbol]);
      this.addDetail(data, this.fnKey(data));
    } else if (arrType[0] === 'accountsummary') {
      if (this.state.accountObj && this.state.accountObj.account_id && this.state.accountObj.account_id !== data.account_id) return;
      this.setTotalRow(data)
    }
  }
  realTimeDataUser(value) {
    if (value.timezone) {
      this.refreshData('refresh')
    }
  }
  fnKey = (data, isDetail) => {
    if (isDetail) return data.id
    return data.account_id + data.group_code
  }
  componentWillUnmount() {
    try {
      const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
      removeEventListener(EVENTNAME.clickToRefresh, this.refreshData)
      unregisRealtime({ callback: this.realtimeData });
      unregisterUser(userId, this.realTimeDataUser, 'user_setting')
      if (dataStorage.callBackReloadTheme[this.id]) {
        delete dataStorage.callBackReloadTheme[this.id];
      }
    } catch (error) {
      logger.error('componentWillUnmount On Portfolio' + error)
    }
  }

  refreshData = () => {
    try {
      this.getDataPofolio(true)
    } catch (error) {
      logger.error('refreshData On Portfolio' + error)
    }
  }

  setTotalRow = (objData) => {
    if (!this.props.isAllHoldings && objData) {
      this.setBottomRow({
        book_value_convert: objData.securities_at_cost || '',
        book_value: '',
        value_convert: objData.total_market_value,
        value: '',
        today_change_val: objData.total_today_change_amount,
        today_change_percent: objData.total_today_change_percent,
        upnl: objData.total_profit_amount,
        profit_percent: objData.total_profit_percent,
        footerFlag: true
      })
    }
  }

  getDataPofolio = async (refresh) => {
    try {
      if (refresh) {
        const lstKeys = [
          'account_id',
          'symbol',
          'account_name',
          'display_name',
          'company_name',
          'market_price',
          'display_exchange',
          'exchange',
          'trading_halt',
          'volume',
          'average_price',
          'class'
        ]
        this.getData().forEach(obj => {
          for (var key in obj) {
            if (lstKeys.indexOf(key) === -1) {
              obj[key] = '--';
            }
          }
        });
      }
      let cb = this.props.isAllHoldings ? postData : getData
      this.requestId = uuidv4();
      const accountId = this.state.accountObj && this.state.accountObj.account_id
      let url;
      if (this.props.isAllHoldings) {
        url = getApiFilter('portfolio', this.page_id || 1)
      } else {
        if (!accountId) return;
        url = getUrlTotalPosition(accountId);
      }
      const requestId = this.requestId;
      let lstSymbol = [];
      this.data = []
      this.props.loading(true)
      await cb(url, this.filterAndSearch)
        .then(response => {
          this.props.loading(false)
          if (requestId !== this.requestId) return;
          this.isReady = true;
          const dataObj = response.data || {};
          this.setTotalRow({ ...dataObj, ...response.securities_at_cost || '' })
          if (this.props.isAllHoldings) {
            this.data = dataObj.data || []
            this.pageObj = {
              total_count: dataObj.total_count || 0,
              total_pages: dataObj.total_pages || 1,
              current_page: dataObj.current_page || 1,
              page_size: 50
            }
            this.setPage && this.setPage(this.pageObj);
          } else {
            this.data = dataObj.positions || []
          }
          this.data.map(item => {
            if (!dataStorage.symbolsObjDic[item.symbol]) {
              lstSymbol.push(encodeURIComponent(item.symbol));
            } else {
              this.mapSymbol(item, dataStorage.symbolsObjDic[item.symbol]);
            }
            this.dicData[item.symbol] = {};
          })
        })
        .catch(error => {
          logger.log(error)
          this.props.loading(false)
          if (requestId !== this.requestId) return;
          this.needToRefresh = true;
          this.pageObj = {
            total_count: 0,
            total_pages: 1,
            current_page: 1,
            page_size: 50
          }
          this.setData([])
          this.setPage && this.setPage(this.pageObj);
        })

      while (lstSymbol && lstSymbol.length) {
        const newList = lstSymbol;
        lstSymbol = newList.splice(100);
        const symbolStringUrl = makeSymbolUrl(newList.join(','));
        this.props.loading(true)
        await getData(symbolStringUrl)
          .then(response => {
            this.props.loading(false)
            if (response.data && response.data.length) {
              for (let i = 0; i < response.data.length; i++) {
                dataStorage.symbolsObjDic[response.data[i].symbol] = response.data[i];
              }
              for (let i = 0; i < response.data.length; i++) {
                this.mapSymbol(this.data[i], dataStorage.symbolsObjDic[this.data[i].symbol]);
              }
            }
          })
          .catch(error => {
            logger.log(error)
            this.props.loading(false)
            this.needToRefresh = true;
          })
      }
      this.setData(this.data || []);
      if (this.props.isAllHoldings && this.isFirst) {
        let url;
        if (dataStorage.userInfo.user_type === 'advisor') {
          url = dataStorage.userInfo.advisor_code ? `?advisor_code=${dataStorage.userInfo.advisor_code}` : ''
        } else if (dataStorage.userInfo.user_type === 'retail') {
          url = '?account_id=' + (dataStorage.listMapping || []).join(',');
        } else {
          url = '/operation'
        }
        if (url) {
          regisRealtime({
            url: completeApi(`/portfolio${url}`),
            callback: this.realtimeData
          });
        }
        this.isFirst = false;
      } else if (this.needRegisRealtime) {
        unregisRealtime({ callback: this.realtimeData });
        regisRealtime({
          url: completeApi(`/portfolio?account_id=${accountId}`),
          callback: this.realtimeData
        });
        this.needRegisRealtime = false;
      }
    } catch (error) {
      logger.error('getDataPofolio On Portfolio' + error)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    try {
      if (nextState.isHidden) return false;
      if (dataStorage.checkUpdate) {
        return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state)
      }
      return true;
    } catch (error) {
      logger.error('shouldComponentUpdate On Portfolio', error)
    }
  }

  pageChanged(pageId) {
    if (this.page_id === pageId) return;
    this.page_id = pageId;
    this.getDataPofolio(null, null, true);
  }

  async onRowClicked(data) {
    const { symbol, account_id: accountId } = data
    if (symbol && accountId) {
      const objSend = {}
      if (!this.dicSymbol[symbol]) {
        const url = makeSymbolUrl(encodeURIComponent(symbol))
        this.props.loading(true)
        await getData(url)
          .then(response => {
            this.props.loading(false)
            this.dicSymbol[symbol] = (response.data && response.data[0]) || {}
          })
          .catch(error => {
            this.props.loading(false)
            logger.log(error)
          })
      }
      objSend.symbol = this.dicSymbol[symbol]

      if (!dataStorage.dicAccounts[accountId]) {
        this.props.loading(true)
        await getData(getUrlAnAccount(accountId))
          .then(response => {
            this.props.loading(false);
            dataStorage.dicAccounts[accountId] = (response.data && response.data[0]) || {};
          })
          .catch(error => {
            logger.error(error)
            this.props.loading(false);
          });
      }
      objSend.account = dataStorage.dicAccounts[accountId]
      this.props.send(objSend)
    }
  }

  getFilterOnSearch = (body, notResetPage = true) => {
    if (!notResetPage) this.page_id = 1
    if (!this.props.isAllHoldings) {
      this.filterAndSearch = null;
      this.getDataPofolio()
    } else {
      this.filterAndSearch = body
      this.getDataPofolio()
    }
  }

  getCsvFunction = (obj) => {
    if (this.csvWoking) return
    this.csvWoking = true
    getCsvFile({
      url: getReportCsvFileUrl('portfolio'),
      body_req: this.filterAndSearch,
      columnHeader: obj.columns,
      lang: dataStorage.lang,
      glContainer: this.props.glContainer
    }, () => {
      this.csvWoking = false;
    });
  }

  getPortfolioBottonRow = async (dataRow, setDetail) => {
    const url = getUrlTransactionAccountNoLimit(dataRow.account_id, dataRow.group_code)
    let data
    await getData(url)
      .then(res => {
        data = res.data;
        if (data) {
          data = (data || []).sort(function (a, b) {
            return b.trade_date - a.trade_date;
          });
          data.forEach(e => {
            e.symbol = '';
          });
        }
      })
    if (data) setDetail(data);
    return data
  }

  renderContent() {
    return <Grid
      {...this.props}
      id={this.props.isAllHoldings ? FORM.ALL_HOLDINGS : FORM.PORTFOLIO_HOLDINGS}
      currency={this.state.currency}
      onRowClicked={this.onRowClicked.bind(this)}
      fn={fn => {
        this.addDetail = fn.addDetail
        this.addOrUpdate = fn.addOrUpdate
        this.setData = fn.setData
        this.setBottomRow = fn.setBottomRow
        this.getData = fn.getData
        this.remove = fn.remove
        this.setColumn = fn.setColumn
        this.autoSize = fn.autoSize
        this.exportCSV = fn.exportCsv
        this.resetFilter = fn.resetFilter
        this.setQuickFilter = fn.setQuickFilter
        this.showColumnMenu = fn.showColumnMenu
        this.showFilterMenu = fn.showFilterMenu
      }}
      fnKey={this.fnKey}
      detailSource={this.getPortfolioBottonRow}
      oneDetail={true}
      getFilterOnSearch={this.props.isAllHoldings ? this.getFilterOnSearch : null}
      paginate={this.props.isAllHoldings ? {
        setPage: (cb) => {
          this.setPage = cb
        },
        pageChanged: this.pageChanged.bind(this)
      } : null}
      columns={this.getColums()}
    />
  }

  dataReceivedFromSearchAccount(data) {
    if (data) {
      if (this.opt) this.opt.groupExpandId = []
      this.changeAccount(data, 'receiveToSearchAccount')
      this.props.send({
        account: data
      })
    }
  }

  createagSideButtons = () => {
    return [
      {
        value: 'ExportCSV',
        label: 'lang_export_csv',
        callback: () => this.exportCSV()
      },
      {
        value: 'ResetFilter',
        label: 'lang_reset_filter',
        callback: () => this.resetFilter(true)
      },
      {
        value: 'Resize',
        label: 'lang_resize',
        callback: () => this.autoSize()
      },
      {
        value: 'Columns',
        label: 'lang_columns',
        callback: (boundRef) => this.showColumnMenu(boundRef)
      },
      {
        value: 'Filters',
        label: 'lang_filters',
        callback: (boundRef) => this.showFilterMenu(boundRef)
      }
    ]
  }

  collapseFunc = (collapse) => {
    this.collapse = collapse ? 1 : 0
    this.props.saveState({
      collapse: this.collapse
    })
    this.forceUpdate()
  }

  renderPortfolioHeader = () => {
    let accountId = (this.state.accountObj && this.state.accountObj.account_id) || '';
    let accountName = (this.state.accountObj && this.state.accountObj.account_name) || '';
    return (
      <div className={`header-content flex width100 ${checkShowAccountSearch ? '' : 'notShowAcc'}`}>
        <div className='leftPortfolioHeader'>
          <div className='accSearchRowAd'>
            <SearchAccount
              accountSumFlag={true}
              accountId={accountId}
              dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount.bind(this)} />
            <div className={`rightRowOrderPad accSumName size--3 showTitle`}>{`${accountName} ${accountId ? '(' + accountId + ')' : ''}`}</div>
          </div>
        </div>
        <div className={`portfolioManagementSearch  `}>
          <FilterBox
            onChange={(e) => {
              this.setQuickFilter(e)
            }} value={this.state.valueFilter} />
        </div>
      </div >
    )
  }

  renderAllHoldingHeader() {
    return (
      <div className='portfolioManagementSearch isAllHoldings'>
        <FilterBox onChange={(e) => {
          this.setQuickFilter(e)
        }} value={this.state.valueFilter} />
      </div>
    )
  }

  render() {
    try {
      return (
        <div id='portfolioRoot' className={`portfolioRoot qe-widget ${this.props.isAllHoldings ? 'isAllHoldings' : ''}`} ref={dom => this.dom = dom}>
          <div className={`header-wrap isMoreOption flex ${this.collapse ? 'collapse' : ''}`}>
            <div className='navbar more'>
              {
                this.props.isAllHoldings
                  ? this.renderAllHoldingHeader()
                  : this.renderPortfolioHeader()
              }
            </div>
            <MoreOption agSideButtons={this.createagSideButtons()} />
          </div>
          <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
          {this.renderContent()}
        </div>
      );
    } catch (error) {
      logger.error('render On Portfolio' + error)
    }
  }

  componentDidMount() {
    try {
      const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
      addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
      registerUser(userId, this.realTimeDataUser, 'user_setting');
    } catch (error) {
      logger.error('componentDidMount On Portfolio' + error)
    }
  }
}

export default Portfolio
