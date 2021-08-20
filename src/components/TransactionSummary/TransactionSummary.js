import React from 'react';
import moment from 'moment';
import { translate } from 'react-i18next';
import Grid from '../Inc/Grid';
import { formatNumberNew2, formatNumberPrice, formatNumberValue, checkPropsStateShouldUpdate, sortData, getSymbolStringQuery, getCompanyInfo, formatNumberVolume } from '../../helper/functionUtils';
import { getData, getUrlReport } from '../../helper/request';
import dataStorage from '../../dataStorage';
import logger from '../../helper/log';
import Flag from '../Inc/Flag';
import Lang from '../Inc/Lang';
import { getDateStringWithFormat } from '../../helper/dateTime'
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'
class TransactionSummary extends React.Component {
  constructor(props) {
    super(props);
    this.accountId = props.accountId;
    const { i18n } = props;
    this.state = {
      accountId: props.accountId,
      fromDate: props.fromDate,
      toDate: props.toDate,
      listData: []
    };
    i18n.on('languageChanged', this.languageChanged.bind(this));
    this.checkDate = this.checkDate.bind(this)
  }

  languageChanged() {
    this.setState({
      changed: !this.state.changed,
      listData: this.data
    })
  }

  getColumns() {
    return [
      {
        headerName: 'lang_type',
        field: 'type',
        width: 72,
        filter: 'agTextColumnFilter',
        cellRenderer: (params) => {
          const div = document.createElement('div');
          if (Number(params.data.type) === 1) {
            ReactDOM.render(<span className='text-capitalize'><Lang>lang_buy</Lang></span>, div)
          } else if (Number(params.data.type) === 0) {
            ReactDOM.render(<span className='text-capitalize'><Lang>lang_sell</Lang></span>, div)
          } else {
            div.innerHTML = params.data.type
          }
          return div;
        },
        valueGetter: params => {
          if (Number(params.data.type) === 1) {
            return 'Buy'
          } else if (Number(params.data.type) === 0) {
            return 'Sell'
          } else {
            return params.data.type
          }
        }
      },
      {
        headerName: 'lang_date',
        field: 'date',
        width: 64,
        menuTabs: ['generalMenuTab', 'columnsMenuTab'],
        sortable: false,
        cellRenderer: (params) => {
          if (params.data.date === 'TotalValue' || params.data.date === '') return null
          const div = document.createElement('div');
          div.innerHTML = moment(params.data.date).format('DD/MM/YYYY');
          return div;
        },
        valueGetter: params => {
          if (params.data.date === 'TotalValue' || params.data.date === '') return null
          return moment(params.data.date).format('DD/MM/YYYY');
        }
      },
      {
        headerName: 'lang_quantity',
        field: 'quantity',
        width: 64,
        filter: 'agNumberColumnFilter',
        cellRenderer: (params) => {
          if (params.data.quantity === 'TotalValue') return null
          const div = document.createElement('div');
          div.innerHTML = formatNumberVolume(params.data.quantity || 0);
          return div;
        },
        valueGetter: params => {
          if (params.data.quantity === 'TotalValue') return null
          return formatNumberVolume(params.data.quantity || 0)
        }
      },
      {
        headerName: 'lang_price',
        field: 'unit_price',
        width: 62,
        filter: 'agNumberColumnFilter',
        cellRenderer: (params) => {
          if (params.data.unit_price === 'TotalValue') return null
          const div = document.createElement('div');
          div.innerHTML = formatNumberPrice(params.data.unit_price, true);
          return div;
        },
        valueGetter: params => {
          if (params.data.unit_price === 'TotalValue') return null
          return formatNumberPrice(params.data.unit_price, true);
        }
      },
      {
        headerName: 'lang_value',
        field: 'trade_value',
        width: 72,
        filter: 'agNumberColumnFilter',
        cellRenderer: (params) => {
          if (params.data.trade_value === 'TotalValue') return null
          const div = document.createElement('div');
          div.innerHTML = formatNumberValue(params.data.trade_value, true);
          return div;
        },
        valueGetter: params => {
          if (params.data.trade_value === 'TotalValue') return null
          return formatNumberValue(params.data.trade_value, true);
        }
      },
      {
        headerName: 'lang_total_fees',
        field: 'total_fees',
        width: 104,
        filter: 'agNumberColumnFilter',
        cellRenderer: (params) => {
          if (params.data.total_fees === 'TotalValue') return null
          const div = document.createElement('div');
          div.innerHTML = formatNumberValue(params.data.total_fees, true);
          return div;
        },
        valueGetter: params => {
          if (params.data.total_fees === 'TotalValue') return null
          return formatNumberValue(params.data.total_fees, true);
        }
      },
      {
        headerName: 'lang_total',
        field: 'total_value',
        width: 80,
        filter: 'agNumberColumnFilter',
        cellRenderer: (params) => {
          if (params.data.total_value === 'TotalValue') return null
          const div = document.createElement('div');
          div.innerHTML = formatNumberValue(params.data.total_value, true);
          return div;
        },
        valueGetter: params => {
          if (params.data.total_value === 'TotalValue') return null
          return formatNumberValue(params.data.total_value, true);
        }
      },
      {
        headerName: 'lang_exchange_rate',
        field: 'bid',
        width: 112,
        filter: 'agNumberColumnFilter',
        cellRenderer: (params) => {
          if (params.data.bid === 'TotalValue') return null
          const div = document.createElement('div');
          div.innerHTML = formatNumberNew2(params.data.bid, 5, true);
          return div;
        },
        valueGetter: params => {
          if (params.data.bid === 'TotalValue') return null
          return formatNumberNew2(params.data.bid, 5, true);
        }
      }
    ];
  }

  componentWillReceiveProps(nextProps) {
    try {
      if (!nextProps.accountId || !nextProps.fromDate || !nextProps.toDate) return;
      if (this.state.fromDate === nextProps.fromDate && this.state.toDate === nextProps.toDate &&
        (nextProps.accountId === this.state.accountId || this.accountId !== this.state.accountId)) return
      this.accountId = nextProps.accountId;
      this.setState({
        fromDate: nextProps.fromDate,
        toDate: nextProps.toDate
      }, () => this.getData(this.state.fromDate, this.state.toDate))
    } catch (error) {
      logger.error('componentWillReceiveProps On TransactionSummary' + error)
    }
  }

  checkDate(date) {
    return moment(date, 'DD/MM/YYYY').format('DD/MM/YY');
    // return getTimestampUTCNoneDMY(date)
  }

  getData(fromDate, toDate) {
    try {
      if (fromDate && toDate) {
        const accountId = this.accountId || this.state.accountId;
        if (!accountId) return;
        this.setState({
          listData: []
        }, () => {
          const fDate = getDateStringWithFormat(fromDate, 'DD/MM/YY');
          const tDate = getDateStringWithFormat(toDate, 'DD/MM/YY');
          const urlTransactionReport = getUrlReport('transaction', accountId, fDate, tDate);
          this.props.loading(true)
          getData(urlTransactionReport)
            .then(response => {
              this.props.loading(false)
              if (response.data) {
                let sortedData = sortData(response.data)
                const newList = [];
                if (!dataStorage.symbolsObjDic) dataStorage.symbolsObjDic = {};
                for (const key in response.data) {
                  newList.push(key);
                }
                let symbolStringQuery = getSymbolStringQuery(newList);
                if (symbolStringQuery) {
                  getCompanyInfo(symbolStringQuery)
                }
                this.data = sortedData;
                this.setState({
                  listData: sortedData,
                  accountId: this.accountId
                })
              }
            })
            .catch((error) => {
              this.props.loading(false)
              logger.error('getData On TransactionSummary1' + error);
              this.needToRefresh = true;
            })
        });
      }
    } catch (error) {
      logger.error('getData On TransactionSummary' + error)
    }
  }

  addTotal(list) {
    const { t } = this.props;
    if (list.list_tran[list.list_tran.length - 1] && list.list_tran[list.list_tran.length - 1].type !== t('TOTAL')) {
      list.list_tran.push({
        type: t('TOTAL'),
        quantity: list.sub_total,
        date: '',
        sub_total: 'TotalValue',
        total_fees: 'TotalValue',
        trade_value: 'TotalValue',
        unit_price: 'TotalValue',
        total_value: 'TotalValue',
        action: 'TotalValue',
        broker_order_id: 'TotalValue',
        bid: 'TotalValue',
        height: 32
      })
    }
    list.list_tran.sort(function (a, b) {
      return b.date - a.date;
    });
    return list.list_tran
  }

  shouldComponentUpdate(nextProps, nextState) {
    try {
      if (nextProps.isHidden) return false;
      if (dataStorage.checkUpdate) {
        return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
      }
      return true;
    } catch (error) {
      logger.error('shouldComponentUpdate On TransactionSummary' + error)
    }
  }

  render() {
    try {
      return (
        <div className='transactionSummaryRoot'>
          <div className='timeHeaderTrans size--4'>
            {
              moment(this.state.fromDate).format('DD/MM/YY') !== moment(this.state.toDate).format('DD/MM/YY')
                ? <span className='showTitle text-uppercase'><Lang>lang_transaction_summary</Lang> {moment(this.state.fromDate).format('DD/MM/YYYY')} - {moment(this.state.toDate).format('DD/MM/YYYY')}</span>
                : <span className='showTitle text-uppercase'><Lang>lang_transaction_summary</Lang> {moment(this.state.fromDate).format('DD/MM/YYYY')}</span>
            }
          </div>
          <div className='listTransRoot'>
            <div className={`noData ${this.state.listData.length ? '' : 'display'}`}></div>
            {this.state.listData.length > 0 && this.state.listData.map((item, index) => {
              const symbol = dataStorage.symbolsObjDic[item.symbol] || {};
              let flag = '';
              if (symbol.exchanges && symbol.exchanges[0]) {
                flag = <Flag symbolObj={symbol} />
              }
              return (
                <div className='transTable noScroll' key={index}>
                  <div className='titleCompanyTrans showTitle size--3'>
                    {`${symbol.display_name || item.symbol}`}
                    <div className='divFlagTrans' key='divFlag'>{flag}</div>
                    {`${symbol.symbol ? '|' : ''} ${symbol.company_name || symbol.company || item.list_tran[0].company_name || ''}`}
                  </div>
                  <div className={'inlineBlock'} style={{ height: '100%' }}>
                    <Grid
                      {...this.props}
                      level={[
                        135,
                        135,
                        135,
                        135
                      ]}
                      opt={(opt) => this.opt = opt}
                      noScroll={true}
                      fn={fn => {
                        fn.setData(this.addTotal(item))
                      }}
                      columns={this.getColumns()}
                      notAbsolute={true}
                      pinnedBottomRowData={[]}
                      total={this.props.total} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      );
    } catch (error) {
      logger.error('render On TransactionSummary' + error)
    }
  }
  connectionChanged = (isConnected) => {
    if (isConnected && this.needToRefresh) {
      this.needToRefresh = false;
      this.refreshData('refresh');
    }
  }
  componentWillUnmount() {
    removeEventListener(EVENTNAME.clickToRefresh, this.refreshData)
    removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
  }

  refreshData = (eventName) => {
    if (eventName !== 'refresh') return;
    this.getData(this.props.fromDate, this.props.toDate);
  }

  componentDidMount() {
    try {
      addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
      addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
      this.getData(this.props.fromDate, this.props.toDate)
    } catch (error) {
      logger.error('componentDidMount On TransactionSummary' + error)
    }
  }
}

export default translate('translations')(TransactionSummary);
