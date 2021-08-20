import React from 'react';
import TopHoldingsValuation from './TopHoldingsValuation';
import BottomHoldingsValuation from './BottomHoldingsValuation';
import { checkPropsStateShouldUpdate, getSymbolStringQuery, getCompanyInfo } from '../../helper/functionUtils';
import { getDateStringWithFormat } from '../../helper/dateTime'
import dataStorage from '../../dataStorage';
import logger from '../../helper/log';
import { translate } from 'react-i18next';
import { getData, makeSymbolUrl, getUrlReport } from '../../helper/request';
import Lang from '../Inc/Lang';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'
class HoldingsValuation extends React.Component {
  constructor(props) {
    super(props);
    this.accountId = props.accountId;
    this.state = {
      accountId: props.accountId,
      data: {},
      width: this.props.width,
      fromDate: props.fromDate,
      toDate: props.toDate,
      isSameDay: !!(props.fromDate === props.toDate),
      isConnected: dataStorage.connected
    }
    this.reportWidth = 0
  }

  async getData(fromDate, toDate) {
    try {
      if (fromDate && toDate) {
        const accountId = this.accountId || this.state.accountId;
        if (!accountId) return;
        this.props.loadingon();

        this.setState(
          { isLoading: true }
        )
        const fDate = getDateStringWithFormat(fromDate, 'DD/MM/YY');
        const tDate = getDateStringWithFormat(toDate, 'DD/MM/YY');
        let data = [];
        await getData(getUrlReport('holdings', accountId, fDate, tDate)).then(response => {
          data = response.data;
        }).catch((error) => {
          logger.error('getData On HoldingValuation1', error);
          this.needToRefresh = true;
        });

        const isSameDay = !!(fromDate && toDate && fromDate.format('DDMMYYYY') === toDate.format('DDMMYYYY'));
        if (data) {
          const newList = [...(data.lst_start || []), ...(data.lst_end || [])];
          let symbolStringQuery = getSymbolStringQuery(newList);
          if (symbolStringQuery) {
            await getCompanyInfo(symbolStringQuery).then(() => { })
          }
          data.lst_end = this.setCompanyName(data.lst_end);
          data.lst_start = this.setCompanyName(data.lst_start);
          this.setState({
            accountId: this.accountId,
            isLoading: false,
            data,
            isSameDay
          }, () => this.props.loadingoff && this.props.loadingoff())
        } else {
          this.setState({
            accountId: this.accountId
          },
            () => this.props.loadingoff && this.props.loadingoff()
          );
        }
      }
    } catch (error) {
      logger.error('getData On HoldingValuation' + error)
    }
  }

  setCompanyName(listData = []) {
    const list = listData || [];
    try {
      for (let o = 0; o < list.length; o++) {
        const element = list[o];
        const symbolObj = dataStorage.symbolsObjDic[element.symbol];
        if (symbolObj) {
          element.code = symbolObj.display_name;
          element.country = symbolObj.country;
          element.company_name = symbolObj.company_name || symbolObj.company || symbolObj.company_name || symbolObj.display_name;
          element.display_exchange = symbolObj.display_exchange;
          element.class = symbolObj.class || ''
        } else {
          element.code = element.symbol;
          element.class = element.class || ''
        }
      }
      return list.sort((a, b) => {
        return b.value - a.value;
      });
    } catch (error) {
      logger.error('setCompanyName On HoldingValuation' + error)
    }
  }

  async getCompanyInfo(stringQuery) {
    try {
      return new Promise((resolve) => {
        const urlMarketInfo = makeSymbolUrl(stringQuery)
        getData(urlMarketInfo).then(res => {
          const dicData = {};
          for (let p = 0; p < res.data.length; p++) {
            const element = res.data[p];
            dicData[element.symbol] = element;
          }
          resolve(dicData)
        }).catch(() => {
          resolve({})
        })
      });
    } catch (error) {
      logger.error('getCompanyInfo On HoldingValuation', error)
    }
  }

  componentWillReceiveProps(nextProps) {
    try {
      if (nextProps.width) {
        this.setState({
          width: nextProps.width
        })
      }
      if (nextProps.fromDate && nextProps.toDate && nextProps.accountId) {
        if (this.state.fromDate === nextProps.fromDate && this.state.toDate === nextProps.toDate &&
          (nextProps.accountId === this.state.accountId || this.accountId !== this.state.accountId)) return
        this.accountId = nextProps.accountId
        this.setState({
          fromDate: nextProps.fromDate,
          toDate: nextProps.toDate,
          data: {}
        }, () => this.getData(this.state.fromDate, this.state.toDate))
      }
    } catch (error) {
      logger.error('componentWillReceiveProps On HoldingValuation' + error)
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
      logger.error('shouldComponentUpdate On HoldingValuation' + error)
    }
  }

  render() {
    try {
      return (
        <div className='rootHold'>
          <div className='titleHold showTitle size--4'><span className='text-capitalize'><Lang>lang_holdings_valuation</Lang> {this.state.fromDate.format('DD/MM/YYYY')} {this.state.isSameDay ? null : '- ' + this.state.toDate.format('DD/MM/YYYY')}</span></div>
          <div className='scroll-wrap' style={{ overflow: 'auto' }}>
            <TopHoldingsValuation
              currency={this.props.currency}
              width={this.state.width}
              resize={this.props.resize.bind(this)}
              isLoading={this.state.isLoading}
              total={this.state.data.total_end_of_period}
              data={this.state.data.lst_end || []}
              timeShow={this.state.toDate.format('DD MMM YYYY')}
              glContainer={this.props.glContainer} />
            {
              !this.state.isSameDay
                ? <BottomHoldingsValuation
                  currency={this.props.currency}
                  width={this.state.width}
                  resize={this.props.resize.bind(this)}
                  isLoading={this.state.isLoading}
                  total={this.state.data.total_start_of_period}
                  data={this.state.data.lst_start || []}
                  timeShow={this.state.fromDate.format('DD MMM YYYY')}
                  glContainer={this.props.glContainer} />
                : null
            }
          </div>
        </div>
      );
    } catch (error) {
      logger.error('render On HoldingValuation' + error)
    }
  }

  componentDidMount() {
    try {
      const report = document.getElementById('#rootReportsTab')
      if (report) {
        this.reportWidth = report.offsetWidth
      }
      addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
      addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
      this.getData(this.props.fromDate, this.props.toDate)
    } catch (error) {
      logger.error('componentDidMount On HoldingValuation' + error)
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

  refreshData = () => {
    this.getData(this.props.fromDate, this.props.toDate);
  }
}

export default translate('translations')(HoldingsValuation);
