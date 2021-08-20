import React from 'react';
// import moment from 'moment';
import SearchAccount from '../SearchAccount';
import s from './Footer.module.css';
import MapRoleComponent from '../../constants/map_role_component';
import Lang from '../Inc/Lang/Lang';
import dataStorage from '../../dataStorage';
import logger from '../../helper/log';
import { completeApi, getData, getUrlTotalPosition } from '../../helper/request';
import {
  checkRole,
  checkShowAccountSearch,
  formatNumberValue,
  formatNumberVolume
} from '../../helper/functionUtils';
import { translate } from 'react-i18next';
import { regisRealtime, unregisRealtime } from '../../helper/streamingSubscriber';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'

class Footer extends React.Component {
  constructor(props) {
    super(props);
    dataStorage.footerCallBack = this.receiveStateLogin;
    dataStorage.setFooterAccount = this.accountChanged;
    this.view = {
    };
  }
  componentDidMount() {
    try {
      addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
      addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
    } catch (error) {
      logger.error('componentDidMount On AccountSummary', error)
    }
  }
  connectionChanged = (isConnected) => {
    if (isConnected) {
      this.refreshData('refresh');
    } else {
      this.dataCashAccount = null
      this.forceUpdate()
    }
  }
  refreshData = (eventName) => {
    try {
      if (eventName !== 'refresh') return
      this.getCashByAccount()
    } catch (error) {
      logger.error('refreshData On AccountSummary', error)
    }
  }
  componentWillUnmount() {
    try {
      removeEventListener(EVENTNAME.clickToRefresh, this.refreshData)
      removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
      if (this.accountObj && this.accountObj.account_id) {
        unregisRealtime({
          callback: this.realtimeData
        });
      }
    } catch (error) {
      logger.error('componentWillUnmount On AccountSummary', error)
    }
  }
  receiveStateLogin = async () => {
    const isLogin = !!dataStorage.userInfo;
    if (isLogin) {
      if (dataStorage.userInfo) {
        this.accountChanged(dataStorage.accountInfo)
      }
    } else {
      this.forceUpdate()
    }
  }
  realtimeData = (data) => {
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
  accountChanged = (accountObj, update = false, send) => {
    if (!accountObj || Object.keys(accountObj).length === 0) return;
    if (this.accountObj && this.accountObj.account_id === accountObj.account_id && !update) return;
    this.accountObj = accountObj;
    dataStorage.defaultAccount = accountObj;
    const lst = dataStorage.goldenLayout.goldenLayout && dataStorage.goldenLayout.goldenLayout.root.getItemsByType('component');
    const account = accountObj
    const newAccount = { account }
    if (lst && lst.length && send) {
      for (let i = 0; i < lst.length; i++) {
        if (dataStorage.lastColorLink !== 5) {
          lst[i].element[0].react && lst[i].element[0].react.broadcast(newAccount, null, dataStorage.lastColorChangeAccount === 0 ? 0 : (dataStorage.lastColorChangeAccount || dataStorage.lastColorLink))
        }
      }
    }
    this.view.searchingAccount = false;
    unregisRealtime({
      callback: this.realtimeData
    });
    regisRealtime({
      url: completeApi(`/portfolio?account_id=${accountObj.account_id}`),
      callback: this.realtimeData
    });
    this.forceUpdate()
    this.getCashByAccount()
  }
  changeUpnl = (value, currency) => {
    try {
      const val = value;
      if (currency === 'VND') {
        value = formatNumberVolume(value)
      } else {
        value = formatNumberValue(value, true)
      }
      if (val === 0) {
        return `${value}`
      }
      if (val < 0) {
        return `${value}`
      }
      if (val > 0) {
        return `+${value}`
      }
    } catch (error) {
      logger.error('changeColor On TablePriceOrder ' + error)
    }
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
  formatValueFooter = (value, currency) => {
    if (currency === 'VND') {
      return formatNumberVolume(value)
    } else {
      return formatNumberValue(value, true)
    }
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
            this.dataCashAccount = dataCashAccount
            this.forceUpdate()
          }
        })
        .catch(error => {
          this.dataCashAccount = null
          this.forceUpdate()
          logger.error('getCashByAccount On Footer ' + error)
        })
    } catch (error) {
      logger.error('getCashByAccount On Footer ' + error)
    }
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
  render() {
    try {
      const accountId = this.accountObj && this.accountObj.account_id
      const checkShowAccount = checkShowAccountSearch()
      const currency = this.accountObj && this.accountObj.currency
      let isEquity
      if (checkRole(MapRoleComponent.PORTFOLIO_SUMMARY_DERIVATIVES_ONLY) && checkRole(MapRoleComponent.PORTFOLIO_SUMMARY_EQUITIES_ONLY)) isEquity = true
      return (
        <div style={{ zIndex: '10002' }}>
          {dataStorage.userInfo ? <div className={(this.view.searchingAccount || !accountId ? ' ' + s.searching : '')}>
            {!(!checkRole(MapRoleComponent.PORTFOLIO_SUMMARY_EQUITIES_AND_DERIVATIVES) && !checkRole(MapRoleComponent.PORTFOLIO_SUMMARY_EQUITIES_ONLY) && !checkRole(MapRoleComponent.PORTFOLIO_SUMMARY_DERIVATIVES_ONLY)) ? <div className={s.footerRoot + ' ' + s.afterLogin + ' size--3'}>
              <div className={s.row + ' ' + s.data}>
                <div className={s.widthSearchAccount}>
                  {checkShowAccount ? <div>
                    <div className={s.accountInfo + ' ' + s.accountText} onClick={() => this.showSearchAccount(true)}><div className={s.backgroundAccount}><div className={s.textEllipsis}>{this.accountObj && this.accountObj.account_name}&nbsp; </div><div>{`(${accountId})`}</div></div></div>
                    <div className={s.accountInfo + ' ' + s.accountSearchBox}>
                      <SearchAccount
                        accountId={accountId}
                        formName='newOrder'
                        isFooter={true}
                        dataReceivedFromSearchAccount={(acc, update) => this.accountChanged(acc, update, true)}
                        onBlur={() => this.showSearchAccount(false)}
                        refDom={dom => this.searchAccountDom = dom}
                      />
                    </div>
                  </div> : <div className={s.accountInfo + ' ' + s.accountText} ><div className={s.backgroundAccount}><div className={s.textEllipsis}>{this.accountObj && this.accountObj.account_name}&nbsp; </div><div>{`(${accountId})`}</div></div></div>}
                </div>
              </div>
              <div className={s.row + ' ' + s.data}>
                <div className={`showTitle text-capitalize`}><Lang>lang_account_value</Lang>:</div>
                <div className={`showTitle`}>{this.dataCashAccount ? this.formatValueFooter(this.dataCashAccount.account_value, currency) : '--'}</div>
              </div>
              <div className={s.row + ' ' + s.data}>
                <div className={`showTitle text-capitalize`}><Lang>lang_unrealized_p&l</Lang>:</div>
                <div className={`showTitle ${this.dataCashAccount && this.dataCashAccount.total_profit_amount === 0 ? '' : this.dataCashAccount && this.changeColor(this.dataCashAccount.total_profit_amount)}`}>{this.dataCashAccount ? this.changeUpnl(this.dataCashAccount.total_profit_amount, currency) : '--'}</div>
              </div>
              {checkRole(MapRoleComponent.PORTFOLIO_SUMMARY_EQUITIES_AND_DERIVATIVES) || (checkRole(MapRoleComponent.PORTFOLIO_SUMMARY_DERIVATIVES_ONLY) && !isEquity) ? <div>
                <div className={s.row + ' ' + s.data}>
                  <div className={`showTitle text-capitalize`}><Lang>lang_margin_available</Lang>:</div>
                  <div className={`showTitle`}>{this.dataCashAccount ? this.formatValueFooter(this.dataCashAccount.initial_margin_available, currency) : '--'}</div>
                </div>
              </div> : null}
              {checkRole(MapRoleComponent.PORTFOLIO_SUMMARY_EQUITIES_AND_DERIVATIVES) || checkRole(MapRoleComponent.PORTFOLIO_SUMMARY_EQUITIES_ONLY) ? <div>
                <div className={s.row + ' ' + s.data}>
                  <div className={`showTitle text-capitalize`}><Lang>lang_cash</Lang>:</div>
                  <div className={`showTitle`}>{this.dataCashAccount ? this.formatValueFooter(this.dataCashAccount.available_balance, currency) : '--'}</div>
                </div></div> : null}
              <div className={s.row + ' ' + s.data}>
                <div className={`showTitle text-capitalize`}><Lang>lang_currency</Lang>:</div>
                <div className={`showTitle`}>{this.accountObj ? this.accountObj.currency : '--'}</div>
              </div>
            </div> : null}
          </div>
            : <div className={s.footerRoot}>
              <div className={s.row + ' ' + s.data}>
                <div className={`showTitle text-capitalize`}><Lang>lang_company_name</Lang>:</div>
                <div className={`showTitle`}>Quant Edge JSC</div>
              </div>
              <div className={s.row + ' ' + s.data}>
                <div className={`showTitle text-capitalize`}><Lang>lang_business_registration_number</Lang>:</div>
                <div className={`showTitle`}>0102723382</div>
              </div>
              <div className={s.row + ' ' + s.data}>
                <div className={`showTitle text-capitalize`}><Lang>lang_address</Lang>:</div>
                <div className={`showTitle`}>21st Floor, Hoa Binh Tower. 106 Hoang Quoc Viet St, Cau Giay, Ha Noi, Viet Nam</div>
              </div>
            </div>
          }
        </div>
      );
    } catch (error) {
      logger.error('render On Header' + error)
    }
  }
}

export default translate('translations')(Footer)
