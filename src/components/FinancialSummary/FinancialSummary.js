import React from 'react';
import moment from 'moment';
import Highchart from '../ChartDetail/Highchart';
import dataStorage from '../../dataStorage'
import { getDateStringWithFormat } from '../../helper/dateTime'
import { formatNumberValue, checkPropsStateShouldUpdate, showNumber2, checkHaveData, fixTheme } from '../../helper/functionUtils';
import logger from '../../helper/log';
import { translate } from 'react-i18next';
import Lang from '../Inc/Lang';
import { getData, getUrlReport } from '../../helper/request';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'
import Notag from '../Inc/NoTag';
import s from './FinancialSummary.module.css'
class FinancialSummary extends React.Component {
  constructor(props) {
    super(props);
    this.accountId = props.accountId;
    this.state = {
      accountId: props.accountId,
      data: {},
      widthChart: 0,
      heightChart: 0,
      fromDate: props.fromDate,
      toDate: props.toDate,
      listTotal: {},
      options: {},
      optionsEnd: {},
      optionsBar: {},
      stateClickSize: props.stateClickSize,
      widthClass: '',
      isConnected: dataStorage.connected,
      isSameDay: !!(props.fromDate.format('DD/MM/YYYY') === props.toDate.format('DD/MM/YYYY'))
    }
    this.width = this.props.width;
    props.resize((w, h, first) => {
      this.width = w;
      if (first) return;
      this.changeWidthChart(this.width, () => {
        if (this.myInput) {
          this.optionConstructor({ widthChart: this.myInput.offsetWidth, heightChart: this.myInput.offsetHeight }, { widthChart: this.myInputPie.offsetWidth, heightChart: this.myInputPie.offsetHeight }, this.state.data)
        }
      })
    });
  }

  changeWidthChart(width, cb) {
    try {
      if (!width) {
        this.financialRoot.clientWidth >= 640 ? this.setState({ widthClass: 'width50' }, cb)
          : this.setState({ widthClass: 'width100' }, cb)
        return
      }
      width >= 640 ? this.setState({ widthClass: 'width50' }, cb)
        : this.setState({ widthClass: 'width100' }, cb)
    } catch (error) {
      logger.error('changeWidthChart On FinancialSummary' + error)
    }
  }

  checkDate(date) {
    return moment(date, 'DD/MM/YYYY').format('DD/MM/YY');
    // return getTimestampUTCNoneDMY(date)
  }

  getData(fromDate, toDate) {
    // fromDate = +fromDate;
    // toDate = +toDate;
    try {
      if (fromDate && toDate) {
        const accountId = this.accountId || this.state.accountId;
        if (!accountId) return;
        const fDate = getDateStringWithFormat(fromDate, 'DD/MM/YY');
        const tDate = getDateStringWithFormat(toDate, 'DD/MM/YY');
        const urlFinanciaReport = getUrlReport('financial', accountId, fDate, tDate);
        this.props.loading(true)
        getData(urlFinanciaReport)
          .then(response => {
            this.props.loading(false)
            const data = response.data;
            const isSameDay = !!(fromDate.format('DD/MM/YY') === toDate.format('DD/MM/YY'));
            this.setState({
              data: data || {},
              isSameDay,
              accountId: this.accountId
            }, () => {
              this.changeWidthChart(this.width, () => {
                if (this.myInput) {
                  this.optionConstructor({ widthChart: this.myInput.offsetWidth, heightChart: this.myInput.offsetHeight }, { widthChart: this.myInputPie.offsetWidth, heightChart: this.myInputPie.offsetHeight }, this.state.data)
                }
              })
            }
            )
            this.convertForTotalValue(data || {})
          })
          .catch((error) => {
            this.props.loading(false)
            logger.error('getData On FinancialSummary1' + error);
            this.needToRefresh = true;
          })
      }
    } catch (error) {
      logger.error('getData On FinancialSummary' + error);
    }
  }

  convertForTotalValue(listData) {
    try {
      if (listData) {
        const listTotal = {
          total_account_balance_value: listData.total_account_balance_value,
          net_trade_flows: listData.net_trade_flows,
          total_brokerage: listData.total_brokerage
        }
        this.setState({
          listTotal: listTotal
        })
      }
    } catch (error) {
      logger.error('convertForTotalValue On FinancialSummary' + error)
    }
  }

  componentWillReceiveProps(nextProps) {
    try {
      if (nextProps.fromDate && nextProps.toDate && nextProps.accountId) {
        if (nextProps.fromDate === this.state.fromDate && nextProps.toDate === this.state.toDate &&
          (nextProps.accountId === this.state.accountId || this.accountId !== this.state.accountId)) {
          return
        }
        this.accountId = nextProps.accountId
        this.setState({
          fromDate: nextProps.fromDate,
          toDate: nextProps.toDate
        }, () => {
          this.getData(this.state.fromDate, this.state.toDate);
        })
      }
    } catch (error) {
      logger.error('componentWillReceiveProps On FinancialSummary' + error)
    }
  }

  optionConstructor(dimetionBarChart, dimetionPieChart, listData) {
    try {
      const { t } = this.props;
      if (listData) {
        let _witdhChart;
        if (this.state.isSameDay) {
          _witdhChart = dimetionPieChart.widthChart
        } else {
          _witdhChart = dimetionPieChart.widthChart / 2
        }
        let chartDataStart = [];
        let chartColorStart = [];
        let chartDataEnd = [];
        let chartColorEnd = [];
        const caststart = showNumber2(listData.percent_cash_start)
        const holdingstart = 100 - caststart
        const castend = showNumber2(listData.percent_cash_end)
        const holdingsend = 100 - castend
        if (caststart) {
          chartDataStart.push({
            name: t('lang_cash'),
            y: caststart
          })
          chartColorStart.push('var(--semantic-info)')
        }
        if (holdingstart) {
          chartDataStart.push(
            {
              name: t('lang_holding'),
              y: holdingstart
            })
          chartColorStart.push('var(--buy-light)')
        }
        if (castend) {
          chartDataEnd.push({
            name: t('lang_cash'),
            y: castend
          })
          chartColorEnd.push('var(--semantic-info)')
        }
        if (holdingsend) {
          chartDataEnd.push(
            {
              name: t('lang_holding'),
              y: holdingsend
            })
          chartColorEnd.push('var(--buy-light)')
        }

        let chartOptions = {
          chart: {
            backgroundColor: 'transparent',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            width: _witdhChart,
            height: 151
          },
          title: {
            text: ''
          },
          tooltip: {
            // pointFormat: '<b>{point.percentage:.2f}%'
            formatter: function () {
              return this.key + ' ' + formatNumberValue(this.percentage, true) + '%';
            },
            backgroundColor: '#fff',
            borderRadius: 2,
            borderWidth: 0,
            style: {
              color: '#030405',
              fontSize: 10,
              fontWeight: 'normal'
            },
            padding: 5
          },
          legend: {
            enabled: false
            // layout: 'horizontal',
            // align: 'center',
            // verticalAlign: 'top',
            // backgroundColor: 'transparent',
            // itemStyle: {
            //   color: '#c5cbce',
            //   fontSize: 12,
            //   fontWeight: 300,
            //   fontFamily: 'inherit'
            // },
            // itemHoverStyle: {
            //   color: '#c5cbce'
            // }
          },
          colors: chartColorStart,
          plotOptions: {
            pie: {
              size: 112,
              borderColor: 'transparent',
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                enabled: true,
                distance: (caststart === 100 || !caststart) ? -57 : -20,
                formatter: function () {
                  return formatNumberValue(this.percentage, true) + '%';
                },
                style: {
                  fontFamily: 'Roboto',
                  fontSize: 12,
                  fontWeight: 300,
                  fontStyle: 'normal',
                  fontStretch: 'normal',
                  lineHeight: 'normal',
                  letterSpacing: -0.1,
                  textAlign: 'center',
                  stroke: '#fff',
                  strokeWidth: 1,
                  color: '#ffffff'
                }
              },
              showInLegend: true,
              point: {
                events: {
                  legendItemClick: function (e) {
                    e.preventDefault()
                  }
                }
              }
            }
          },
          series: [{
            colorByPoint: true,
            states: {
              hover: {
                enabled: false
              }
            },
            data: chartDataStart
          }]
        }
        let chartOptionsEnd = {
          chart: {
            backgroundColor: 'transparent',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            width: _witdhChart,
            height: 151
          },
          title: {
            text: ''
          },
          tooltip: {
            // pointFormat: '<b>{point.percentage:.2f}%'
            formatter: function () {
              return this.key + ' ' + formatNumberValue(this.percentage, true) + '%';
            },
            backgroundColor: '#fff',
            borderRadius: 2,
            borderWidth: 0,
            style: {
              color: '#030405',
              fontSize: 10,
              fontWeight: 'normal'
            },
            padding: 5
          },
          legend: {
            enabled: false,
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'top',
            // floating: true,
            backgroundColor: 'transparent',
            itemStyle: {
              color: fixTheme(dataStorage.theme, 'color'),
              fontSize: 12,
              fontWeight: 300,
              fontFamily: 'inherit'
            },
            itemHoverStyle: {
              color: fixTheme(dataStorage.theme, 'color')
            }
          },
          colors: chartColorEnd,
          plotOptions: {
            pie: {
              size: 112,
              borderColor: 'transparent',
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                enabled: true,
                distance: (castend === 100 || !castend) ? -57 : -20,
                formatter: function () {
                  return formatNumberValue(this.percentage, true) + '%';
                },
                style: {
                  fontFamily: 'inherit',
                  fontSize: 12,
                  fontWeight: 300,
                  fontStyle: 'normal',
                  fontStretch: 'normal',
                  lineHeight: 'normal',
                  letterSpacing: -0.1,
                  textAlign: 'center',
                  stroke: '#fff',
                  strokeWidth: 1,
                  color: '#fff'
                }
              },
              showInLegend: true,
              point: {
                events: {
                  legendItemClick: function (e) {
                    e.preventDefault()
                  }
                }
              }
            }
          },
          series: [{
            colorByPoint: true,
            states: {
              hover: {
                enabled: false
              }
            },
            data: chartDataEnd
          }]
        }
        let chartOptionsBar = {
          colors: this.state.isSameDay ? ['var(--buy-light)'] : ['var(--semantic-info)', 'var(--buy-light)'],
          title: {
            text: ''
          },
          chart: {
            width: dimetionBarChart.widthChart,
            height: 170,
            backgroundColor: 'transparent',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'bar',
            spacingRight: 80
          },
          legend: {
            enabled: false
            // verticalAlign: 'top',
            // layout: 'horizontal',
            // align: 'right',
            // x: dimetionPieChart.widthChart - dimetionBarChart.widthChart + 80,
            // itemStyle: {
            //   fontSize: 12,
            //   color: '#c5cbce',
            //   fontWeight: 300,
            //   fontFamily: 'Roboto'
            // },
            // labelFormatter: function () {
            //   return this.name
            // },
            // itemHoverStyle: {
            //   color: '#c5cbce'
            // }
          },
          xAxis: {
            categories: [t('lang_holding'), t('lang_cash'), t('lang_portfolio_summary')],
            title: {
              text: null
            },
            labels: {
              overflow: 'justify',
              style: {
                color: fixTheme(dataStorage.theme, 'color'),
                stroke: '#fff',
                strokeWidth: 1,
                fontWeight: 300,
                lign: 'right',
                fontSize: 12
              }
            }
          },
          yAxis: {
            min: 0,
            gridLineColor: 'transparent',
            title: {
              text: null
            },
            labels: {
              overflow: 'justify',
              style: {
                color: fixTheme(dataStorage.theme, 'color'),
                stroke: '#fff',
                strokeWidth: 1,
                fontWeight: 300,
                lign: 'right',
                fontSize: 12
              }
            }
          },
          tooltip: {
            // pointFormat: '<b>{point.percentage:.2f}%'
            formatter: function () {
              // if (this.series.name === 'Start of period' && that.state.fromDate === that.state.toDate) return
              return this.key + ' ' + formatNumberValue(this.y, true);
            },
            backgroundColor: '#fff',
            borderRadius: 2,
            borderWidth: 0,
            style: {
              color: '#030405',
              fontSize: 10,
              fontWeight: 'normal'
            },
            padding: 5,
            followPointer: true
          },
          plotOptions: {
            series: {
              pointWidth: this.state.isSameDay ? 14 : 12,
              borderColor: 'transparent',
              events: {
                legendItemClick: function (e) {
                  e.preventDefault()
                }
              },
              states: {
                hover: {
                  enabled: this.state.fromDate !== this.state.toDate
                }
              }
            }
          },
          series: this.state.isSameDay ? [
            {
              name: 'Start of period',
              data: [listData.holdings_end_of_period || 0, listData.cash_end_of_period || 0, listData.account_balance_end_of_period || 0],
              dataLabels: {
                enabled: false
              }
            }
          ] : [{
            name: 'Start of period',
            data: [listData.holdings_start_of_period || 0, listData.cash_start_of_period || 0, listData.account_balance_start_of_period || 0],
            dataLabels: {
              enabled: false
            }
          }, {
            name: 'End of period',
            data: [listData.holdings_end_of_period || 0, listData.cash_end_of_period || 0, listData.account_balance_end_of_period || 0],
            dataLabels: {
              enabled: true,
              style: {
                textOutline: false
              },
              formatter: function () {
                let x = (this.point || { x: 0 }).x;
                let second = this.y || 0;
                let first = this.series.chart.series[0].data[x].y;
                let result = formatNumberValue(second - first, true);
                return '<div class="dataLabel">' + result + '</div>'
              },
              useHTML: true
            }
          }],
          responsive: {
            rules: [{
              condition: {
                maxWidth: 500
              }
            }]
          }
        }
        this.setState({
          options: chartOptions,
          optionsEnd: chartOptionsEnd,
          optionsBar: chartOptionsBar
        })
      }
    } catch (error) {
      logger.error('optionConstructor On FinancialSummary' + error)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    try {
      if (nextProps.isHidden) return false;
      if (dataStorage.checkUpdate) {
        const check = checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
        return check;
      }
      return true;
    } catch (error) {
      logger.error('shouldComponentUpdate On FinancialSummary' + error)
    }
  }

  render() {
    try {
      return (
        <div className='finacialRoot' ref={(div) => this.financialRoot = div}>
          <div className='textHeaderTimeContainer'>
            {this.state.fromDate.format('DD/MM/YYYY') !== this.state.toDate.format('DD/MM/YYYY')
              ? <div className='textHeaderTime text-uppercase showTitle size--4'><Lang>lang_financial_summary</Lang> <span>{this.state.fromDate.format('DD/MM/YYYY')}</span> - <span>{this.state.toDate.format('DD/MM/YYYY')}</span></div>
              : <div className='textHeaderTime text-uppercase showTitle size--4'><Lang>lang_financial_summary</Lang> <span>{this.state.fromDate.format('DD/MM/YYYY')}</span></div>}
          </div>
          <div className="flex1" style={{ overflow: 'auto' }}>
            <div className={'chartFinacialContainer'}>
              <div className={`barChartFinacial ${this.state.widthClass}`} ref={input => {
                this.myInput = input;
              }}>
                {
                  checkHaveData(this.state.optionsBar)
                    ? <div className='showTitle text-capitalize'><Lang>lang_summary_information</Lang></div>
                    : null
                }
                {
                  checkHaveData(this.state.optionsBar) && !this.state.isSameDay
                    ? <div className="boxlegend text-right fullw100 fs10 size--2">
                      <span className='showTitle firstLetterUpperCase'><Lang>lang_start_of_period</Lang></span>
                      <span className='showTitle firstLetterUpperCase'><Lang>lang_end_of_period</Lang></span>
                    </div>
                    : null
                }
                {
                  checkHaveData(this.state.optionsBar) && !this.state.isSameDay
                    ? <div className='titleLabelChart text-right fullw100 fs10 size--2'>+/-</div>
                    : null
                }
                {
                  checkHaveData(this.state.optionsBar)
                    ? <Highchart option={this.state.optionsBar} title={'Summary_Information'} isSameDay={this.state.isSameDay} />
                    : null
                }
              </div>
              <div className={`pieChartFinacial ${this.state.widthClass}`} ref={input => {
                this.myInputPie = input;
              }}>
                {
                  checkHaveData(this.state.optionsBar)
                    ? <div className='showTitle'><Lang>lang_cash_holding_chart</Lang></div>
                    : null
                }
                {
                  checkHaveData(this.state.optionsBar)
                    ? <div className="boxlegend text-center fullw100 fs10 size--2">
                      <span className='showTitle text-capitalize'><Lang>lang_cash</Lang></span>
                      <span className='showTitle text-capitalize'><Lang>lang_holding</Lang></span>
                    </div>
                    : null
                }
                {
                  checkHaveData(this.state.optionsBar)
                    ? <div>
                      <div>
                        <div className="wrapPieCHart">
                          {
                            this.state.isSameDay
                              ? (Object.keys(this.state.optionsEnd).length !== 0 ? <Highchart option={this.state.optionsEnd} /> : '')
                              : (Object.keys(this.state.options).length !== 0 ? <Highchart option={this.state.options} /> : '')
                          }
                        </div>
                        <div className='dateCashHolding showTitle'>{this.state.fromDate.format('DD/MM/YYYY')}</div>
                      </div>
                      {
                        (this.props.fromDate.format() !== this.props.toDate.format()) && (Object.keys(this.state.optionsEnd).length !== 0)
                          ? <Notag>
                            <div className="wrapPieCHart">
                              <div>
                                <Highchart option={this.state.optionsEnd} />
                              </div>
                              <div>
                                {this.state.isSameDay ? null : ((Object.keys(this.state.optionsEnd).length !== 0 ? <div className='showTitle dateCashHolding'>
                                  {this.state.toDate.format('DD/MM/YYYY')}
                                </div> : ''))}
                              </div>
                            </div>
                          </Notag>
                          : null
                      }
                    </div>
                    : null
                }
              </div>
            </div>
            <div className="titleBottom fullw100 ">
              <div className='myRow titleSmallerTitle size--3'>
                <div className='titleTotal text-capitalize showTitle'><Lang>lang_portfolio_summary</Lang></div>
                <div className='numberValue showTitle'>{formatNumberValue(this.state.listTotal.total_account_balance_value, true)}</div>
              </div>
              <div className='myRow rowNetTradeFlows size--3'>
                <div className='titleTotal text-capitalize showTitle'><Lang>lang_net_trade_flows</Lang></div>
                <div className={`showTitle numberValue ${this.state.listTotal.net_trade_flows < 0 ? s.colorSell : ''}`}>{formatNumberValue(this.state.listTotal.net_trade_flows, true)}</div>
              </div>
              <div className='myRow rowTotalFees size--3'>
                <div className='titleTotal text-capitalize showTitle'><Lang>lang_total_fees</Lang></div>
                <div className='numberValue showTitle'>{formatNumberValue(this.state.listTotal.total_brokerage, true)}</div>
              </div>
            </div>
          </div >
        </div >
      );
    } catch (error) {
      logger.error('render On FinancialSummary' + error)
    }
  }

  connectionChanged = (isConnected) => {
    if (isConnected && this.needToRefresh) {
      this.needToRefresh = false;
      this.refreshData();
    }
  }

  componentWillUnmount() {
    removeEventListener(EVENTNAME.clickToRefresh, this.refreshData)
    removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
  }

  refreshData = () => {
    this.getData(this.props.fromDate, this.props.toDate);
  }

  componentDidMount() {
    try {
      addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
      addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
      this.getData(this.state.fromDate, this.state.toDate)
    } catch (error) {
      logger.error('componentDidMount On FinancialSummary' + error)
    }
  }
}

export default translate('translations')(FinancialSummary);
