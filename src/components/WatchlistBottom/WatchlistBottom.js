import React from 'react';
import uuidv4 from 'uuid/v4';
import actionTypeEnum from '../../constants/action_type_enum';
import PriceDisplay from '../../constants/price_display_type';
import SymbolClass from '../../constants/symbol_class';
import dataStorage from '../../dataStorage';
import {
  formatNumberPrice, formatNumberValue,
  formatNumberVolume, getCompanyInfo, getIntradayNews,
  getTopCompany, isDemo
} from '../../helper/functionUtils';
import logger from '../../helper/log';
import {
  getAllWatchlist,
  getCreateMultiWatchlist,
  getData,
  getUpdateWatchlist,
  makeSymbolUrl, postData, putData
} from '../../helper/request';
import { unregisRealtime } from '../../helper/streamingSubscriber';
import { registerUser, unregisterUser } from '../../streaming';
import FilterBox from '../Inc/FilterBox/FilterBox';
import MoreOption from '../Inc/MoreOption/MoreOption';
import ToggleLine from '../Inc/ToggleLine/ToggleLine';
import ConverValueWl from './price_display_watchlist';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event';
import SearchBoxWatchlist from './SearchBoxWatchlist'
import DropdownWatchlist from './DropdownWatchlist'
import Grid from '../Inc/CanvasGrid/CanvasGrid'
import mappingMarketLabel from './mapping_market_label';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';
import { addPriceListener, removePriceListener } from '../../helper/priceSource'
import config from '../../../public/config'

const WidthbyFont = {
  small: 520,
  medium: 545,
  large: 570
}

const FIELD = {
  SYMBOL: 'symbol',
  BID_SIZE: 'bid_size',
  BID_PRICE: 'bid_price',
  ASK_PRICE: 'ask_price',
  ASK_SIZE: 'ask_size',
  TRADE_PRICE: 'trade_price',
  TRADE_SIZE: 'trade_size',
  CHANGE_POINT: 'change_point',
  CHANGE_PERCENT: 'change_percent',
  VOLUME: 'volume',
  OPEN: 'open',
  HIGH: 'high',
  LOW: 'low',
  PREVIOUS_CLOSE: 'previous_close',
  CLOSE: 'close',
  COMPANY_NAME: 'company_name',
  YDSP: 'yesterday_settlement',
  TEST: 'test'
}

class WatchlistBottomHyper extends React.Component {
  constructor(props) {
    super(props);
    this.id = 'id' + uuidv4();
    this.dicDataSymbol = {};
    this.dicData = {};
    this.dicAdd = {};
    this.dicRemove = {};
    this.realtimePrice = this.realtimePrice.bind(this);
    this.clearRealtime = this.clearRealtime.bind(this);
    this.dataUserWatchListChange = this.dataUserWatchListChange.bind(this);
    this.isConnected = dataStorage.connected;
    const isLoggedIn = !!dataStorage.userInfo;
    const initState = this.props.loadState();
    this.collapse = initState.collapse ? 1 : 0
    this.dataWatchlist = [];
    this.dicWatchlist = {};
    this.width = 0;
    this.height = 0;
    this.totalWidth = 0;
    this.dicData = {};
    const dropDownFilter = initState.selectedLayout || (!isLoggedIn ? 'top-asx-20' : 'user-watchlist')

    props.resize((w, h) => {
      this.handleResize(w, h)
    })
    this.reSizeChildDropDown = this.reSizeChildDropDown.bind(this);
    this.state = {
      typeSearch: SymbolClass.ALL_TYPES,
      dropDownFilter: dropDownFilter,
      dataSearch: [],
      loadingSearch: true,
      valueSearch: '',
      value: isLoggedIn ? (initState.selectedLayout || 'user-watchlist') : dropDownFilter,
      valueFilter: initState.filterAllText || '',
      dicDataSymbol: {}
    };
    this.realTimeData = this.realTimeData.bind(this);
    this.updateDataFireBase = this.updateDataFireBase.bind(this);
    this.controlResize = '';
    dataStorage.dicClearRealtime[this.id] = this.clearRealtime
    this.props.receive({
      symbol: this.changeValue
    });
  }

  changeValue = () => {
    // this.getDataWatchlist()
  }

  clearRealtime() {
    unregisRealtime({
      callback: this.realtimePrice
    });
  }

  handleResize = (w, h) => {
    this.width = w;
    this.height = h;
    this.reSizeChildDropDown(w);
    const div = document.getElementById('dropDownContent');
    if (this.floatContent && div && div.children && div.children[0]) {
      const node = this.myInput;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const top = rect.top + node.offsetHeight;
      const left = rect.left;
      const totalWidth = left + 555;
      const spaceBottom = window.innerHeight - top
      if (rect.top > spaceBottom && spaceBottom < 100) {
        this.height = (rect.top > 336 ? 336 : rect.top - 33);
        if (this.floatContent) {
          this.floatContent.style.bottom = (spaceBottom + node.offsetHeight) + 'px';
          this.floatContent.style.maxHeight = this.height;
          this.floatContent.style.height = this.height;
          this.floatContent.style.top = null;
        }
      } else {
        this.height = (spaceBottom > 336 ? 336 : spaceBottom - 33);
        if (this.floatContent) {
          this.floatContent.style.top = top + 'px';
          this.floatContent.style.bottom = null
          this.floatContent.style.maxHeight = this.height;
          this.floatContent.style.height = this.height;
        }
      }
      if (totalWidth > window.innerWidth) {
        const fontSize = localStorageNew.getItem('lastFontSize', true) || 'medium';
        const spaceLeft = left + this.myInput.offsetWidth - WidthbyFont[fontSize] + 2
        if (spaceLeft < 0) this.floatContent.style.left = '0px'
        else this.floatContent.style.left = spaceLeft - 2 + 'px'
      } else {
        this.floatContent.style.left = rect.left + 'px';
      }
      this.loadDropdown()
    }
    if (this.grid && this.grid.canvas) this.grid.canvas.resize()
  }
  onRowDragEnd = () => {
    try {
      let newList = this.grid.behavior.getData()
      const current = new Date().getTime();
      const lst = [];
      for (let q = 0; q < newList.length; q++) {
        const element = newList[q];
        element.rank = current + q;
        lst.push({
          symbol: element.symbol,
          rank: element.rank
        });
      }
      this.dicWatchlist[this.state.dropDownFilter].value = lst;
      this.updateLayout(this.state.dropDownFilter, this.dicWatchlist[this.state.dropDownFilter].watchlist_name);
    } catch (error) {
      logger.error('onRowDrag On Watch List', error)
    }
  }

  getColumns = () => {
    const columns = [
      {
        header: 'lang_code',
        name: FIELD.SYMBOL,
        type: TYPE.SYMBOL_WATCHLIST,
        formater: params => {
          if (params.data) {
            return params.data.display_name || params.data.symbol
          }
          return '--'
        }
      },
      {
        header: 'lang_movement',
        name: FIELD.TEST,
        formater: () => {
          return ''
        },
        hide: true
      },
      {
        header: 'lang_bid_qty',
        name: FIELD.BID_SIZE,
        type: TYPE.FLASH_NO_BG,
        formater: (params) => {
          if (params.value || params.value === 0) return formatNumberVolume(params.value, true)
          return '--'
        },
        align: 'right'
      },
      {
        header: 'lang_bid_price',
        name: FIELD.BID_PRICE,
        type: TYPE.FLASH,
        align: 'right',
        formater: (params) => formatNumberPrice(params.value, true)
      },
      {
        header: 'lang_offer_price',
        name: FIELD.ASK_PRICE,
        type: TYPE.FLASH,
        align: 'right',
        formater: (params) => formatNumberPrice(params.value, true)
      },
      {
        header: 'lang_offer_qty',
        name: FIELD.ASK_SIZE,
        type: TYPE.FLASH_NO_BG,
        formater: (params) => {
          if (params.value || params.value === 0) return formatNumberVolume(params.value, true)
          return '--'
        },
        align: 'right'
      },
      {
        header: 'lang_last',
        name: FIELD.TRADE_PRICE,
        type: TYPE.FLASH,
        align: 'right',
        formater: (params) => formatNumberPrice(params.value, true)
      },
      {
        header: 'lang_quantity',
        name: FIELD.TRADE_SIZE,
        type: TYPE.FLASH_NO_BG,
        formater: (params) => {
          if (params.value || params.value === 0) return formatNumberVolume(params.value, true)
          return '--'
        },
        align: 'right'
      },
      {
        header: 'lang_change',
        name: FIELD.CHANGE_POINT,
        type: TYPE.FLASH_NO_BG,
        formater: (params) => {
          if (params.value || params.value === 0) return formatNumberPrice(params.value, true)
          else return '--'
        },
        getTextColorKey: (params) => {
          return params.value > 0 ? '--buy-light' : params.value < 0 ? '--sell-light' : ''
        },
        align: 'right'
      },
      {
        header: 'lang_percent_change',
        name: FIELD.CHANGE_PERCENT,
        type: TYPE.FLASH_NO_BG,
        getTextColorKey: (params) => {
          return params.value > 0 ? '--buy-light' : params.value < 0 ? '--sell-light' : ''
        },
        formater: (params) => {
          if (params.value || params.value === 0) {
            let value = formatNumberValue(params.value, true)
            return value !== '--' ? value + '%' : value
          } else return '--'
        },
        align: 'right'
      },
      {
        header: 'lang_volume',
        name: FIELD.VOLUME,
        type: TYPE.FLASH_NO_BG,
        formater: (params) => {
          if (params.value || params.value === 0) {
            return formatNumberVolume(params.value, true)
          } else return '--'
        },
        align: 'right'
      },
      {
        header: 'lang_open',
        name: FIELD.OPEN,
        type: TYPE.FLASH_NO_BG,
        formater: (params) => {
          if (params.value || params.value === 0) return formatNumberPrice(params.value, true)
          else return '--'
        },
        align: 'right'
      },
      {
        header: 'lang_high',
        name: FIELD.HIGH,
        type: TYPE.FLASH_NO_BG,
        formater: (params) => {
          if (params.value || params.value === 0) return formatNumberPrice(params.value, true)
          else return '--'
        },
        align: 'right'
      },
      {
        header: 'lang_low',
        name: FIELD.LOW,
        type: TYPE.FLASH_NO_BG,
        formater: (params) => {
          if (params.value || params.value === 0) return formatNumberPrice(params.value, true)
          else return '--'
        },
        align: 'right'
      },
      {
        header: 'lang_prev_dot_close',
        name: FIELD.PREVIOUS_CLOSE,
        type: TYPE.FLASH_NO_BG,
        formater: (params) => {
          if (params.value || params.value === 0) return formatNumberPrice(params.value, true)
          else return '--'
        },
        align: 'right'
      },
      {
        header: 'lang_close',
        name: FIELD.CLOSE,
        type: TYPE.FLASH_NO_BG,
        formater: (params) => {
          if (params.value || params.value === 0) return formatNumberPrice(params.value, true)
          else return '--'
        },
        align: 'right'
      },
      {
        header: 'lang_security_name',
        name: FIELD.COMPANY_NAME,
        formater: (params) => {
          if (params.data) return (params.data.company_name || params.data.company || params.data.security_name || '--').toUpperCase();
          else return '--'
        }
      }
    ];
    const config = dataStorage.web_config[dataStorage.web_config.common.project]
    if (config && config.roles.showFuture) {
      columns.push({
        header: 'lang_ydsp',
        name: FIELD.YDSP,
        formater: (params) => formatNumberPrice(params.value, true)
      })
    }
    columns.push({
      header: 'lang_action',
      name: 'actionOrder',
      float: true,
      type: TYPE.WATCHLIST_ACTION,
      removeCallback: this.updateDataFireBase
    })
    return columns
  }

  reSizeChildDropDown(w) {
    if (w >= 1360) {
      this.controlResize = 'moreThanOrEqua1360';
    } else if (w > 600) {
      this.controlResize = 'moreThanOrEqua600'
    }
  }
  saveActiveId = (watchlistId) => {
    this.waitForActiveId = watchlistId;
  }

  realTimeData(data, action, title, updateAction) {
    const t = dataStorage.translate;
    if (action === actionTypeEnum.INSERT) {
      if (this.dicWatchlist[data.watchlist]) {
        Object.assign(this.dicWatchlist[data.watchlist], data)
      } else {
        this.userWatchlist.unshift(data);
        this.dicWatchlist[data.watchlist] = data;
      }
      this.buildMenu(this.userWatchlist)
      if (data.watchlist === this.waitForActiveId) {
        dataStorage.usingWatchlist_id = data.watchlist;
        dataStorage.usingWatchlist_name = data.watchlist_name;
        this.handleOnChangeDropDown(data.watchlist)
      }
    } else if (action === actionTypeEnum.DELETE) {
      if (!this.dicWatchlist[data]) return;
      let name = '';
      for (let i = 0; i < this.userWatchlist.length; i++) {
        if (this.userWatchlist[i].watchlist === data) {
          name = this.userWatchlist[i].watchlist_name || '';
          this.userWatchlist.splice(i, 1);
          delete this.dicWatchlist[data];
          this.buildMenu(this.userWatchlist)
          if (data === this.state.dropDownFilter) {
            const time = new Date().getTime();
            const title = t('lang_deleted_watchlist');
            const body = t('lang_watchlist_deleted_noti');
            dataStorage.showNotification && dataStorage.showNotification(title, body, time, data, name)
            this.handleOnChangeDropDown('user-watchlist');
          }
          break;
        }
      }
    } else if (action === actionTypeEnum.UPDATE) {
      if (!this.dicWatchlist[data.watchlist]) return;
      !updateAction && Object.assign(this.dicWatchlist[data.watchlist], data);
      this.buildMenu(this.userWatchlist)
      if (this.state.dropDownFilter === data.watchlist) {
        this.buildMenu(this.userWatchlist);
        const dicData = {};
        for (let index = 0; index < data.value.length; index++) {
          const element = data.value[index];
          dicData[element.symbol] = element;
          if (updateAction === 'remove') {
            delete this.dicData[element.symbol];
            delete this.dicDataSymbol[element.symbol]
          } else {
            this.dicData[element.symbol] = element;
            this.dicDataSymbol[element.symbol] = element;
          }
        }
        if (updateAction) {
          if (!data.value || data.value.length === 0) return;
          if (!this.dicWatchlist[data.watchlist].value) {
            this.dicWatchlist[data.watchlist].value = []
          }
          if (updateAction === 'remove') {
            this.dataWatchlist = this.dataWatchlist.filter(item => {
              return !dicData[item.symbol];
            });
            this.dicWatchlist[data.watchlist].value = this.dicWatchlist[data.watchlist].value.filter(item => {
              return !dicData[item.symbol];
            });
            this.remove(data.value)
            if (this.state.dataSearch) {
              this.forceUpdate()
            }
          }
          if (updateAction === 'add') {
            for (let index = 0; index < data.value.length; index++) {
              const element = data.value[index];
              if (this.dataWatchlist.findIndex(x => x.symbol === element.symbol) < 0) this.dataWatchlist.unshift(element)
            }
            // this.dataWatchlist = [...data.value, ...this.dataWatchlist];
            this.dicWatchlist[data.watchlist].value = [...this.dicWatchlist[data.watchlist].value, ...data.value];
            this.sortRankFromRealtime(this.dataWatchlist, 'add')
            this.dataUserWatchListChange(this.dataWatchlist, data.watchlist, false, data.watchlist_name || this.currentWatchlistName)
          }
        } else {
          Object.assign(this.dicWatchlist[data.watchlist], data);
          this.dicWatchlist[data.watchlist].watchlist_name = data.watchlist_name
          this.setState({
            dropDownFilter: data.watchlist
          })
          this.buildMenu(this.userWatchlist)
          this.dataUserWatchListChange(this.dicWatchlist[data.watchlist].value, data.watchlist, false, data.watchlist_name || this.currentWatchlistName)
        }
      }
    }
  }

  sortRankFromRealtime(data) {
    for (let i = 0; i < data.length; i++) {
      data[i].rank = i
    }
    return data
  }

  sortAgainToFirst(symbolObj) {
    try {
      if (!this.dicWatchlist[this.state.dropDownFilter]) return;
      let newList = this.dicWatchlist[this.state.dropDownFilter].value;
      let current = new Date().getTime();
      let lst = [];
      let needSort = {};
      symbolObj.rank = current - 1;
      needSort.rank = symbolObj.rank
      needSort.symbol = symbolObj.symbol
      lst.push(needSort)
      let index = 0;
      for (let q = 0; q < newList.length; q++) {
        if (newList[q].symbol === symbolObj.symbol) {
          continue
        }
        const element = newList[q];
        element.rank = current + index;
        lst.push({
          symbol: element.symbol,
          rank: element.rank
        });
        index++;
      }
      this.dicWatchlist[this.state.dropDownFilter].value = lst;
      this.updateLayout(this.state.dropDownFilter, this.dicWatchlist[this.state.dropDownFilter].watchlist_name, true);
    } catch (error) {
      logger.error('onRowDrag On Watch List', error)
    }
  }

  async updateDataFireBase(action, symbolObj) {
    try {
      if (!this.dicWatchlist[this.state.dropDownFilter]) return
      if (action === 'add') {
        delete this.dicRemove[symbolObj.symbol];
        if (!this.dicData[symbolObj.symbol]) {
          this.dicAdd[symbolObj.symbol] = {
            symbol: symbolObj.symbol,
            rank: +new Date()
          };
        }
      } else {
        if (this.dicData[symbolObj.symbol]) {
          this.dicRemove[symbolObj.symbol] = {
            symbol: symbolObj.symbol,
            rank: 0
          }
        }
      }
      this.timer && clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        const listAdd = Object.keys(this.dicAdd).map(k => this.dicAdd[k]);
        const listRemove = Object.keys(this.dicRemove).map(k => this.dicRemove[k]);
        const objAdd = {
          user_id: dataStorage.userInfo.user_id,
          watchlist: this.dicWatchlist[this.state.dropDownFilter].watchlist,
          watchlist_name: this.dicWatchlist[this.state.dropDownFilter].watchlist_name,
          value: listAdd
        }
        const objRemove = {
          user_id: dataStorage.userInfo.user_id,
          watchlist: this.dicWatchlist[this.state.dropDownFilter].watchlist,
          watchlist_name: this.dicWatchlist[this.state.dropDownFilter].watchlist_name,
          value: listRemove
        }
        if (this.dicWatchlist[this.state.dropDownFilter]) {
          this.dicWatchlist[this.state.dropDownFilter].isFake = false;
        }
        if (this.dicWatchlist[this.state.dropDownFilter].isFake) {
          delete this.dicWatchlist[this.state.dropDownFilter].isFake
          postData(getCreateMultiWatchlist(objAdd.user_id) + '?action=add', {
            data: objAdd
          }).then(() => {
            let sent = objAdd.value || []
            if (sent && sent.length !== 0) {
              for (let i = 0; i < sent.length; i++) {
                if (sent[i].symbol) {
                  if (this.dicAdd[sent[i].symbol]) {
                    delete this.dicAdd[sent[i].symbol]
                  }
                }
              }
            } else {
              this.dicAdd = {};
            }
          }).catch(() => {
            let sent = objAdd.value || []
            if (sent && sent.length !== 0) {
              for (let i = 0; i < sent.length; i++) {
                if (sent[i].symbol) {
                  if (this.dicAdd[sent[i].symbol]) {
                    delete this.dicAdd[sent[i].symbol]
                  }
                }
              }
            } else {
              this.dicAdd = {};
            }
          });
        } else {
          if (listRemove && listRemove.length) {
            delete objRemove.init_time;
            putData(getUpdateWatchlist(objRemove.watchlist, objRemove.user_id, 'remove'), {
              data: objRemove
            }).then(() => {
              let sent = objRemove.value || []
              if (sent && sent.length !== 0) {
                for (let i = 0; i < sent.length; i++) {
                  if (sent[i].symbol) {
                    if (this.dicRemove[sent[i].symbol]) {
                      delete this.dicRemove[sent[i].symbol]
                    }
                  }
                }
              } else {
                this.dicRemove = {};
              }
            }).catch(() => {
              let sent = objRemove.value || []
              if (sent && sent.length !== 0) {
                for (let i = 0; i < sent.length; i++) {
                  if (sent[i].symbol) {
                    if (this.dicRemove[sent[i].symbol]) {
                      delete this.dicRemove[sent[i].symbol]
                    }
                  }
                }
              } else {
                this.dicRemove = {};
              }
            });
          }
          if (listAdd && listAdd.length) {
            delete objAdd.init_time;
            putData(getUpdateWatchlist(objAdd.watchlist, objAdd.user_id, 'add'), {
              data: objAdd
            }).then(() => {
              let sent = objAdd.value || []
              if (sent && sent.length !== 0) {
                for (let i = 0; i < sent.length; i++) {
                  if (sent[i].symbol) {
                    if (this.dicAdd[sent[i].symbol]) {
                      delete this.dicAdd[sent[i].symbol]
                    }
                  }
                }
              } else {
                this.dicAdd = {};
              }
            }).catch(() => {
              let sent = objAdd.value || []
              if (sent && sent.length !== 0) {
                for (let i = 0; i < sent.length; i++) {
                  if (sent[i].symbol) {
                    if (this.dicAdd[sent[i].symbol]) {
                      delete this.dicAdd[sent[i].symbol]
                    }
                  }
                }
              } else {
                this.dicAdd = {};
              }
            });
          }
        }
      }, 1000)
    } catch (error) {
      logger.error('Update Database Fire Base On WatchList', error)
    }
  }

  changeConnection = (isConnected) => {
    this.isChangeConnect = true
    if (isConnected && this.isConnected !== isConnected) {
      this.isConnected = isConnected;
      this.getDataWatchlist();
    }
    if (!isConnected !== !this.isConnected) {
      this.isConnected = isConnected;
    }
    this.grid && this.grid.repaint();
  }

  realtimePrice(obj) {
    if (obj.quote) this.addOrUpdate(obj.quote, true);
  }

  async dataUserWatchListChange(data, watchlistId, needToRefresh, watchlistName) {
    const requestId = uuidv4();
    this.requestId = requestId;
    if (data) this.dataWatchlist = data;
    if (needToRefresh) {
      this.needToRefresh = true;
      return;
    }
    let arr = [];
    if (data && Array.isArray(data) && data.length > 0) arr = data;
    this.currentWatchlistName = mappingMarketLabel[watchlistId] ? mappingMarketLabel[watchlistId] : (watchlistName || '')
    this.props.setTitle({ text: 'lang_watchlist', name: this.currentWatchlistName });
    let stringQuery;
    if (arr) stringQuery = arr.map(x => encodeURIComponent(x.symbol)).join(',')
    let symbolArr = arr.filter(v => !dataStorage.symbolsObjDic[v.symbol])
    if (symbolArr.length > 0) {
      const symbolStringUrl = makeSymbolUrl(symbolArr.map(x => x.symbol).join(','));
      getData(symbolStringUrl).then(data => {
        let dataArr = data.data
        if (dataArr.length) {
          for (let i = 0; i < dataArr.length; i++) {
            dataStorage.symbolsObjDic[dataArr[i].symbol] = dataArr[i]
          }
        }
      })
    }
    this.dicDataSymbol = {};
    this.dicData = {};
    if (stringQuery) {
      let intradayObj = {};
      await getIntradayNews(stringQuery).then(obj => {
        intradayObj = obj;
      });
      let listSymbol = [];
      await getCompanyInfo(stringQuery).then(res => {
        if (res && res.length) listSymbol = res;
      });
      removePriceListener(this.realtimePrice)
      addPriceListener(listSymbol, this.realtimePrice)
      for (let w = 0; w < listSymbol.length; w++) {
        this.dicDataSymbol[listSymbol[w].symbol] = listSymbol[w];
      }
      for (let i = 0; i < arr.length; i++) {
        const rank = arr[i].rank;
        const symbolCode = arr[i].symbol;
        if (this.dicDataSymbol[symbolCode]) arr[i] = Object.assign(this.dicDataSymbol[symbolCode], arr[i])
        arr[i].rank = rank;
        arr[i].id = arr[i].symbol;
        arr[i].watchlist_name = this.state.dropDownFilter;
        arr[i].watchlist = this.state.dicWatchlist && this.state.dicWatchlist[this.state.dropDownFilter] && this.state.dicWatchlist[this.state.dropDownFilter].watchlist;
        arr[i].intradayNews = intradayObj[symbolCode];
        this.dicData[symbolCode] = arr[i];
      }

      arr = arr.sort(function (a, b) {
        return a.rank - b.rank
      });
      arr = this.sortRankFromRealtime(arr);
      this.setDataCallBack(arr).then(() => {
        setTimeout(() => {
          this.grid && this.grid.repaint()
        }, 1000)
      })
      this.setState({ dicDataSymbol: this.dicDataSymbol })

      this.needToRefresh = false;
    } else {
      dataStorage.connected && this.props.loading(false);
      this.setData([]);
      this.setState({ dicDataSymbol: this.dicDataSymbol })
    }
    this.props.loading(false);
  }

  setDataCallBack = (data) => {
    return new Promise((resolve, reject) => {
      this.setData(data)
      resolve()
    })
  }

  getDataSymbol(watchlistId, isRefresh) {
    getTopCompany(watchlistId || this.state.dropDownFilter, isRefresh ? (data, watchlistId, needToRefresh, watchlistName) => {
      this.dataUserWatchListChange(data, watchlistId, needToRefresh, watchlistName)
    } : this.dataUserWatchListChange, this.dicWatchlist[this.state.dropDownFilter] && dataStorage.userInfo ? dataStorage.userInfo.user_id : 0);
  }

  async getDataWatchlist() {
    if (dataStorage.userInfo) {
      this.favoriteWatchlist = null;
      let urlAllWatchlist = getAllWatchlist(dataStorage.userInfo && dataStorage.userInfo.user_id);
      await getData(urlAllWatchlist).then(response => {
        this.userWatchlist = [];
        if (response.data.data && response.data.data.length) {
          for (let i = 0; i < response.data.data.length; i++) {
            if (response.data.data[i].time) {
              continue;
            }
            if (response.data.data[i].watchlist === 'user-watchlist') {
              this.favoriteWatchlist = response.data.data[i];
              this.favoriteWatchlist.watchlist_name = PriceDisplay.Favorites
              if (!this.favoriteWatchlist.value) this.favoriteWatchlist.value = [];
              continue;
            }
            this.userWatchlist.push(response.data.data[i]);
            this.dicWatchlist[response.data.data[i].watchlist] = response.data.data[i];
          }
        }
        if (!this.favoriteWatchlist) {
          this.favoriteWatchlist = {
            watchlist: 'user-watchlist',
            watchlist_name: PriceDisplay.Favorites,
            value: [],
            isFake: true
          };
        }
        this.dicWatchlist[this.favoriteWatchlist.watchlist] = this.favoriteWatchlist;
        const state = {};
        if (!this.dicWatchlist[this.state.dropDownFilter] && !ConverValueWl[this.state.dropDownFilter]) {
          state.dropDownFilter = 'user-watchlist';
          this.triggerDropdownChange('user-watchlist')
        }
        this.setState({ dicWatchlist: this.dicWatchlist })
        this.setState(state)
        this.buildMenu(this.userWatchlist)
      });
    }
    this.getDataSymbol();
  }

  getRootGrid = (grid) => {
    this.grid = grid;
  }

  componentDidMount() {
    try {
      if (dataStorage.userInfo) registerUser(dataStorage.userInfo.user_id, this.realTimeData, 'user_watchlist');
      this.getDataWatchlist();
      addEventListener(EVENTNAME.connectionChanged, this.changeConnection)
    } catch (error) {
      logger.error('componentDidMount On Watch List', error)
    }
  }

  componentWillUnmount() {
    try {
      this.disableDropdownSymbol && this.disableDropdownSymbol()
      if (dataStorage.userInfo) unregisterUser(dataStorage.userInfo.user_id, this.realTimeData, 'user_watchlist');
      removePriceListener(this.realtimePrice)
      removeEventListener(EVENTNAME.connectionChanged, this.changeConnection)
    } catch (error) {
      logger.error('componentWillUnmount On Watch List', error)
    }
  }

  collapseFunc = (collapse) => {
    this.collapse = collapse ? 1 : 0
    this.props.saveState({
      collapse: this.collapse
    })
    this.forceUpdate()
  }

  createagSideButtons = () => {
    return [
      {
        value: 'ExportCSV',
        label: 'lang_export_csv',
        callback: () => this.exportCsv()
      },
      {
        value: 'ResetFilter',
        label: 'lang_reset_filter',
        callback: () => this.resetFilter()
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

  onRowClicked = (data) => {
    const symbolObj = data.symbol && dataStorage.symbolsObjDic[data.symbol]
    if (symbolObj) {
      this.props.send({
        symbol: symbolObj
      });
    }
  }

  triggerDropdownChange = (value) => {
    this.props.saveState({
      selectedLayout: value
    });
    this.setState({
      dropDownFilter: value
    }, () => {
      this.props.loading(true);
      this.getDataSymbol(value);
    });
  }

  setGridFnKey = (data) => {
    return data.symbol
  }

  render() {
    try {
      return (
        <div ref={dom => this.gridCanvasDiv1 = dom} className='watchlistRoot watchlistFin ag-theme-fresh qe-widget' id={this.id}>
          <div className={`header-wrap isMoreOption ${this.collapse ? 'collapse' : ''}`}>
            <div className='navbar'>
              <div className='searchVsAddBox'>
                <DropdownWatchlist fn={fn => {
                  this.buildMenu = fn.buildMenu
                  this.handleOnChangeDropDown = fn.handleOnChangeDropDown
                  this.updateLayout = fn.updateLayout
                }} saveActiveId={this.saveActiveId} dicWatchlist={this.state.dicWatchlist} handleOnChangeDropDown={this.triggerDropdownChange} dropDownFilter={this.state.dropDownFilter} />
                {
                  this.dicWatchlist[this.state.dropDownFilter]
                    ? <SearchBoxWatchlist fn={fn => {
                      this.disableDropdownSymbol = fn.disableDropdownSymbol
                    }}
                      updateDataFireBase={this.updateDataFireBase}
                      dicDataSymbol={this.state.dicDataSymbol}
                      parent={this}
                    />
                    : null
                }
              </div>
              <div className='boxFilter fin-boxFilter' style={{ display: 'flex' }}>
                <FilterBox
                  value={this.state.valueFilter}
                  onChange={(str) => {
                    this.setQuickFilter(str)
                  }}
                />
              </div>
            </div>
            <MoreOption agSideButtons={this.createagSideButtons()} />
          </div>
          <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
          <div ref={dom => this.gridCanvasDiv = dom} className='gridCanvas' style={{ height: '100%' }}>
            <Grid
              {...this.props}
              id={FORM.WATCHLIST}
              showProvider={true}
              performance={true}
              fn={fn => {
                this.addOrUpdate = fn.addOrUpdate
                this.setData = fn.setData
                this.setColumn = fn.setColumn
                this.getData = fn.getData
                this.exportCsv = fn.exportCsv
                this.autoSize = fn.autoSize
                this.resetFilter = fn.resetFilter
                this.setQuickFilter = fn.setQuickFilter
                this.showColumnMenu = fn.showColumnMenu
                this.showFilterMenu = fn.showFilterMenu
                this.remove = fn.remove
              }}
              fnKey={this.setGridFnKey}
              columns={this.getColumns()}
              onRowClicked={this.onRowClicked}
              autoFit={true}
              enableDrag={true}
              getRootGrid={this.getRootGrid}
              updateDataFireBase={this.updateDataFireBase}
              onRowDragEnd={this.onRowDragEnd}
            />
          </div>
        </div>
      );
    } catch (error) {
      logger.error('Render On Watch List', error)
    }
  }
}

export default WatchlistBottomHyper
