import React from 'react'
import Header from './header.js'
import Grid from '../Inc/CanvasGrid'
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant'
import {
  formatNumberPrice,
  formatNumberVolume,
  formatNumberValue,
  isDemo
} from '../../helper/functionUtils'
import s from './overview.module.css'
import dataStorage from '../../dataStorage'
import { makeSymbolDynamicWatchlistUrl, getData, makeSymbolUrl } from '../../helper/request'
import { addPriceListener, removePriceListener } from '../../helper/priceSource'
import config from '../../../public/config'

const FIELD = {
  CODE: 'display_name',
  SECURITY: 'company_name',
  TRADE_PRICE: 'trade_price',
  CHANGE_POINT: 'change_point',
  CHANGE_PERCENT: 'change_percent',
  VOLUME: 'volume',
  OPEN: 'open',
  HIGH: 'high',
  LOW: 'low',
  CLOSE: 'close',
  PREVIOUS_CLOSE: 'previous_close',
  YDSP: 'yesterday_settlement'
}
const DEFAULT_VALUE = '--'
const WIDTH_BOX = 180
const WIDTH_OF_ALL_BOX = WIDTH_BOX * 4 + 8 * 3 + 16 // boxWidth + padding + parentPadding
const WIDTH_OF_THREE_BOX = WIDTH_BOX * 3 + 8 * 2 + 16 + 24 * 2 // boxWidth + padding + parentPadding + next, prev width
const WIDTH_OF_TWO_BOX = WIDTH_BOX * 2 + 8 + 16 + 24 * 2
const WIDTH_OF_ONE_BOX = WIDTH_BOX + 16 + 24 * 2
const DEFAULT_PRICE = {
  'ask_price': '--',
  'ask_size': '--',
  'bid_price': '--',
  'bid_size': '--',
  'change_percent': '--',
  'change_point': '--',
  'close': '--',
  'high': '--',
  'low': '--',
  'open': '--',
  'trade_price': '--',
  'trade_size': '--',
  'updated': '--',
  'volume': '--',
  'previous_close': '--',
  'value_traded': '--',
  'indicative_price': '--',
  'auction_volume': '--',
  'surplus_volume': '--'
}

export default class MarketOverview extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.width = 0
    props.resize((w, h) => {
      this.onWidgetResize(w, h)
    })
    this.realtimePrice = this.realtimePrice.bind(this)
  }

  onWidgetResize = (w, h) => {
    if (!this.dom) return
    this.width = w
    this.height = h
    let parent = this.dom.parentElement;
    this.dom.className = ''
    parent.className = ''
    this.dom.classList.add('qe-widget')
    parent.classList.add('wrapComponent')
    let called = false
    if (w >= WIDTH_OF_ALL_BOX) {
      this.dom.classList.add(s.largeWidth)
      this.onResize && this.onResize('large')
      called = true
    }
    if (w >= WIDTH_OF_THREE_BOX) {
      this.dom.classList.add(s.mediumWidth)
      if (!called) {
        this.onResize && this.onResize('medium')
        called = true
      }
    }
    if (w >= WIDTH_OF_TWO_BOX) {
      this.dom.classList.add(s.smallWidth)
      if (!called) {
        this.onResize && this.onResize('small')
        called = true
      }
    }
    if (w >= WIDTH_OF_ONE_BOX) {
      this.dom.classList.add(s.tinyWidth)
      if (!called) {
        this.onResize && this.onResize('tiny')
        called = true
      }
    }
    if (w < WIDTH_OF_THREE_BOX) parent && parent.classList.add('smallWidth')
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
        callback: (boundOption) => this.showColumnMenu(boundOption)
      },
      {
        value: 'Filters',
        label: 'lang_filters',
        callback: (boundOption) => this.showFilterMenu(boundOption)
      }
    ]
  }

  createRequestPrice = (url) => {
    return new Promise((resolve) => {
      getData(url).then(res => {
        resolve(res.data || [])
      }).catch(error => {
        console.error(`getDataPrice ${url} error`)
        resolve([])
      })
    })
  }

  realtimePrice(obj) {
    if (obj.quote) this.addOrUpdate(obj.quote, true);
  }

  componentWillUnmount() {
    removePriceListener(this.realtimePrice)
  }

  getDataSnapshot = (priceTable, filterText) => {
    return new Promise(async resolve => {
      this.props.loading(true)
      const topSymbolUrl = makeSymbolDynamicWatchlistUrl(`${priceTable}/0`)
      const topSymbol = await getData(topSymbolUrl) // get top
      let symbols = topSymbol.data.value
      if (!symbols || !symbols.length) {
        this.props.loading(false)
        resolve([])
        return
      }
      const symbolString = symbols.map(e => !dataStorage.symbolsObjDic[e.symbol] && encodeURIComponent(e.symbol)).filter(e => e).join(',')
      if (symbolString) {
        const symbolInfoUrl = makeSymbolUrl(symbolString)
        await getData(symbolInfoUrl).then(response => { // get symbol info
          for (let i = 0; i < response.data.length; i++) {
            dataStorage.symbolsObjDic[response.data[i].symbol] = response.data[i]
          }
        }).catch(error => console.error('getSymbolInfor getDataSnapshot Overview error: ', error))
      }
      let listSymbol = []
      for (let index = 0; index < symbols.length; index++) {
        const element = symbols[index]
        const symbolObj = dataStorage.symbolsObjDic[element.symbol] || {}
        listSymbol.push(symbolObj)
        symbols[index] = Object.assign(symbolObj, element, DEFAULT_PRICE)
      }
      if (priceTable !== 'top-5-asx-index') {
        // removePriceListener(this.realtimePrice)
        addPriceListener(listSymbol, this.realtimePrice)
      }
      symbols = symbols.sort(function (a, b) {
        return a.rank - b.rank
      });
      this.props.loading(false)
      resolve(symbols || [])
    })
  }

  getDataWatchlist = async (priceTable, filterText) => {
    if (priceTable !== this.priceTable) {
      if (priceTable !== 'top-5-asx-index') {
        removePriceListener(this.realtimePrice)
      }
    }
    const listData = await this.getDataSnapshot(priceTable, filterText)
    if (!(this.priceTable + '').includes('top-asx') && (priceTable + '').includes('top-asx')) {
      this.onWidgetResize(this.width, this.height)
    }
    this.priceTable = priceTable
    this.setData(listData || [])
  }

  onQuickFilter = (value) => {
    this.setQuickFilter(value)
  }

  renderHeader() {
    return <Header {...this.props}
      onResize={fn => this.onResize = fn}
      onQuickFilter={this.onQuickFilter}
      getDataWatchlist={this.getDataWatchlist}
      getDataOverview={this.getDataSnapshot}
      createagSideButtons={this.createagSideButtons}
    />
  }

  onRowClicked = (data) => {
    const symbolObj = data.symbol && dataStorage.symbolsObjDic[data.symbol]
    if (symbolObj) {
      this.props.send({
        symbol: symbolObj
      });
    }
  }

  fnKey(data) {
    return data.symbol
  }

  getColums() {
    const columns = [
      {
        header: 'lang_code',
        name: FIELD.CODE,
        type: TYPE.SYMBOL,
        formater: (params) => params.data.display_name || params.data.symbol || DEFAULT_VALUE
      },
      {
        header: 'lang_security',
        name: FIELD.SECURITY,
        formater: (params) => {
          if (params.data) return (params.data.company_name || params.data.company || params.data.security_name || '--').toUpperCase();
          else return '--'
        }
      },
      {
        header: 'lang_price',
        name: FIELD.TRADE_PRICE,
        type: TYPE.FLASH,
        formater: (params) => formatNumberPrice(params.value, true),
        align: 'right'
      },
      {
        header: 'lang_change',
        name: FIELD.CHANGE_POINT,
        type: TYPE.FLASH_NO_BG,
        formater: (params) => {
          if (params.value || params.value === 0) return formatNumberPrice(params.value, true)
          else return DEFAULT_VALUE
        },
        getTextColorKey: (params) => {
          return params.value > 0 ? '--buy-light' : params.value < 0 ? '--sell-light' : '--secondary-default'
        },
        align: 'right'
      },
      {
        header: 'lang_percent_change',
        name: FIELD.CHANGE_PERCENT,
        type: TYPE.FLASH_NO_BG,
        getTextColorKey: (params) => {
          return params.value > 0 ? '--buy-light' : params.value < 0 ? '--sell-light' : '--secondary-default'
        },
        formater: (params) => {
          if (params.value || params.value === 0) {
            let value = formatNumberValue(params.value, true)
            return value !== DEFAULT_VALUE ? value + '%' : value
          } else return DEFAULT_VALUE
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
          } else return DEFAULT_VALUE
        },
        align: 'right'
      },
      {
        header: 'lang_open',
        name: FIELD.OPEN,
        type: TYPE.FLASH_NO_BG,
        formater: (params) => {
          if (params.value || params.value === 0) return formatNumberPrice(params.value, true)
          else return DEFAULT_VALUE
        },
        align: 'right'
      },
      {
        header: 'lang_high',
        name: FIELD.HIGH,
        type: TYPE.FLASH_NO_BG,
        formater: (params) => {
          if (params.value || params.value === 0) return formatNumberPrice(params.value, true)
          else return DEFAULT_VALUE
        },
        align: 'right'
      },
      {
        header: 'lang_low',
        name: FIELD.LOW,
        type: TYPE.FLASH_NO_BG,
        formater: (params) => {
          if (params.value || params.value === 0) return formatNumberPrice(params.value, true)
          else return DEFAULT_VALUE
        },
        align: 'right'
      },
      {
        header: 'lang_close',
        name: FIELD.CLOSE,
        type: TYPE.FLASH_NO_BG,
        formater: (params) => {
          if (params.value || params.value === 0) return formatNumberPrice(params.value, true)
          else return DEFAULT_VALUE
        },
        align: 'right'
      },
      {
        header: 'lang_prev_dot_close',
        name: FIELD.PREVIOUS_CLOSE,
        type: TYPE.FLASH_NO_BG,
        formater: (params) => {
          if (params.value || params.value === 0) return formatNumberPrice(params.value, true)
          else return DEFAULT_VALUE
        },
        align: 'right'
      }
    ]
    const config = dataStorage.web_config[dataStorage.web_config.common.project]
    if (config && config.roles.showFuture) {
      columns.push({
        header: 'lang_ydsp',
        name: FIELD.YDSP,
        formater: (params) => formatNumberPrice(params.value, true)
      })
    }
    return columns
  }

  renderContent() {
    return <Grid
      {...this.props}
      id={FORM.MARKET_OVERVIEW}
      showProvider={true}
      performance={true}
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
      columns={this.getColums()}
      autoFit={true}
    />
  }

  render() {
    return (
      <div className={`qe-widget`} ref={dom => this.dom = dom}>
        {this.renderHeader()}
        {this.renderContent()}
      </div>
    )
  }
}
