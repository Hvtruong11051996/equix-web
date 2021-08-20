import React from 'react';
// import moment from 'moment';
import Lang from '../Inc/Lang';
import showModal from '../Inc/Modal';
import Auth from '../AuthV2';
import formState from '../../constants/form_state';
import role from '../../constants/role';
import requireTimeSetting from '../../constants/require_time';
import { func } from '../../storage';
import { emitter, eventEmitter, eventEmitterRefresh, emitterRefresh } from '../../constants/emitter_enum';
import dataStorage from '../../dataStorage';
import MainMenu from '../MainMenu/MainMenu';
import Layout from '../Layout';
import ConfirmLogout from '../ConfirmLogout';
import logger from '../../helper/log';
import { sendRequest, requirePin } from '../../helper/request';
import LayoutType from '../../constants/layout_type';
import userTypeEnum from '../../constants/user_type_enum';
import {
  checkPropsStateShouldUpdate,
  updateDataLayout,
  createNewLayout,
  deleteDataLayout,
  genreNewName,
  diff,
  saveDataSetting,
  getDefaultAccount,
  exportTimeZone,
  getDataSetting,
  translateTimeNew, getLogo
} from '../../helper/functionUtils';
import LoginVariant from 'react-mdi/icons/login-variant';
import LogoutVariant from 'react-mdi/icons/logout-variant';
import { translate } from 'react-i18next';
import { registerUser, unregisterUser } from '../../streaming';
import layoutConfig from '../../layoutConfig';
import uuidv4 from 'uuid/v4';
import moment from 'moment-timezone';
import NoTag from '../Inc/NoTag/NoTag';
import marketDataTypeEmums from '../../constants/market_data_type';
import { addEventListener, removeEventListener, dispatchEvent, EVENTNAME } from '../../helper/event';
import SvgIcon, { path } from '../Inc/SvgIcon';
import LoginAccountProfile from './LoginAccountProfile'
import s from './Header.module.css'

const immutableLayout = {
  DEFAULT: 'defaultLayout'
}

class Header extends React.Component {
  constructor(props) {
    super(props);
    addEventListener(EVENTNAME.marketDataTypeChanged, this.marketDataTypeChanged);
    this.listExist = [];
    this.lastTheme = dataStorage.lastTheme || localStorageNew.getItem('lastTheme', true) || 'theme-dark';
    this.selfChange = false;
    const storeLogin = localStorageNew.getItem('isStayLogin', true);
    this.isStayLogin = storeLogin ? storeLogin === 'true' : false;
    const isLogin = props.isLogin === formState.AFTER_LOGIN || props.isLogin === formState.SET_PIN;
    const defaultObj = {
      label: 'lang_user_layout',
      value: 'userLayout'
    }
    this.state = {
      isLogin: isLogin,
      loadingRefresh: '',
      curTime: exportTimeZone(dataStorage.timeZone, new Date(), true),
      userAccount: '',
      language: dataStorage.lang || 'en',
      layout: isLogin ? dataStorage.usingLayout : 'defaultLayout',
      hover: false,
      optionLayout: [defaultObj],
      fontSize: '',
      isNotiTechnical: dataStorage.isWarning.isNotiTechnical,
      isNotiCashNegative: dataStorage.isWarning.isNotiCashNegative
    };
    this.onChangeLang = this.onChangeLang.bind(this);
    this.realTimeData = this.realTimeData.bind(this);
    this.realtimeLayout = this.realtimeLayout.bind(this);
    this.handleSrcImgLogo = this.handleSrcImgLogo.bind(this);
    this.checkVersionLayoutBeforeOverride = this.checkVersionLayoutBeforeOverride.bind(this);
    // this.getDataUserSetting = this.getDataUserSetting.bind(this)
    dataStorage.checkVersionLayoutBeforeOverride = this.checkVersionLayoutBeforeOverride;
    this.getLayout = this.getLayout.bind(this);
    dataStorage.getLayout = this.getLayout;
    dataStorage.headerCallBack = this.receiveStateLogin.bind(this);
    dataStorage.onChangeLang = this.onChangeLang;
    dataStorage.onChangeTime = this.onChangeTime.bind(this)
    this.warningFunc = this.warningFunc.bind(this);
    dataStorage.warningFunc = this.warningFunc;
    dataStorage.receiveOrderPad = () => {
      this.realTimeMarketDataType()
    }
  }

  marketDataTypeChanged = () => {
    this.forceUpdate();
  }

  realTimeMarketDataType() {
    this.forceUpdate()
  }

  warningFunc() {
    this.setState({
      isNotiTechnical: dataStorage.isWarning.isNotiTechnical,
      isNotiCashNegative: dataStorage.isWarning.isNotiCashNegative
    })
  }

  getLayout() {
    this.listExist = [];
    const optionLayout = [];
    optionLayout.push({
      label: 'lang_default_layout',
      value: 'defaultLayout'
    });
    const lst = dataStorage.listLayout || {};
    let listLayout = Object.keys(lst).map(k => {
      lst[k].key = k;
      if (!lst[k].updated) {
        lst[k].updated = 0;
      }
      return lst[k];
    });
    if (listLayout && listLayout.length) {
      listLayout = listLayout.sort((a, b) => {
        const aTime = a.init_time || a.updated;
        const bTime = b.init_time || b.updated;
        return bTime - aTime;
      });
    }
    for (let i = 0; i < listLayout.length; i++) {
      const element = listLayout[i];
      const key = element.key || '';
      const name = element.layout_name || '';
      name && this.listExist.push(name);
      const item = {
        label: name,
        value: key
      };
      optionLayout.push(item);
    }
    optionLayout.push({
      label: 'lang_save_layout',
      value: 'SaveLoad'
    });
    this.listExist.push('defaultLayout');
    this.listExist.push('SaveLoad');
    if (this.state.layout !== dataStorage.usingLayout || diff(this.state.optionLayout, optionLayout)) {
      this.setState({
        optionLayout,
        layout: this.state.isLogin ? dataStorage.usingLayout : 'defaultLayout'
      })
    }
  }
  saveNewSetting(key, value) {
    const newObj = {};
    newObj[key] = value;
    saveDataSetting({ data: newObj })
  }

  // async getDataUserSetting() {
  //   try {
  //     await getDataSetting().then(response => {
  //       if (response) {
  //         let defaultTz = dataStorage.env_config.timezone || 'Australia/Sydney'
  //         let setting = response.data || {};
  //         if (!setting.timezone) {
  //           this.saveNewSetting('timezone', defaultTz)
  //         }
  //         if (typeof setting.timezone === 'string') {
  //           this.timeZone = defaultTz
  //           dataStorage.timeZone = defaultTz
  //         } else {
  //           this.timeZone = (defaultTz)
  //           dataStorage.timeZone = defaultTz
  //         }
  //       }
  //     })
  //   } catch (ex) {
  //     logger.log('getDataUserSetting')
  //   }
  // }
  async receiveStateLogin() {
    const isLogin = !!dataStorage.userInfo;
    if (isLogin) {
      if (dataStorage.userInfo) {
        const userId = dataStorage.userInfo.user_id;
        // await this.getDataUserSetting()
        unregisterUser(userId, this.realTimeData, 'user_setting')
        registerUser(userId, this.realTimeData, 'user_setting');
        unregisterUser(userId, this.realtimeLayout, 'layout')
        registerUser(userId, this.realtimeLayout, 'layout');
      }
      this.setState({
        isLogin: isLogin,
        layout: dataStorage.usingLayout || ''
        // ,
        // curTime: exportTimeZone(dataStorage.timeZone, new Date(), true)
      });
    } else {
      this.forceUpdate()
    }
  }

  showLoginForm() {
    try {
      showModal({
        component: Auth
      });
      func.emitter(emitter.MAIN_FORM, eventEmitter.CHANGE_MAIN_STATE, formState.LOGIN)
    } catch (error) {
      logger.error('showLoginForm On Header' + error)
    }
  }

  showSignupForm() {
    try {
      showModal({
        component: Auth,
        isSignUp: true
      });
      func.emitter(emitter.MAIN_FORM, eventEmitter.CHANGE_MAIN_STATE, formState.LOGIN)
    } catch (error) {
      logger.error('showLoginForm On Header' + error)
    }
  }

  logOut() {
    try {
      showModal({
        component: ConfirmLogout
      });
    } catch (error) {
      logger.error('logOut On Header' + error)
    }
  }

  onChangeTime = () => {
    this.setState({
      curTime: exportTimeZone(dataStorage.timeZone || defaultTz, new Date(), true)
    })
  }
  click2Refresh() {
    try {
      func.emitter(emitterRefresh.CLICK_TO_REFRESH, eventEmitterRefresh.CLICK_TO_REFRESH_STATE, 'refresh');
      dispatchEvent(EVENTNAME.clickToRefresh, 'refresh');
      let defaultTz = (moment.tz.guess() === 'Asia/Saigon' ? 'Asia/Ho_Chi_Minh' : moment.tz.guess())
      this.setState({
        loadingRefresh: 'iconRefresh',
        curTime: exportTimeZone(dataStorage.timeZone || defaultTz, new Date(), true)
      }, () => {
        setTimeout(() => {
          this.setState({
            loadingRefresh: 'null'
          })
        }, 1000)
      })
    } catch (error) {
      logger.error('click2Refresh On Header1 ', error)
    }
  }

  getDefaultLayoutByRole() {
    return layoutConfig.getLayout()
  }

  saveCurrentSymbolAccountOfLayout = layoutID => {
    const symbolKey = `symbol_${layoutID}`
    const accountKey = `account_${layoutID}`
    !dataStorage.symbolAccountMappingLayout && (dataStorage.symbolAccountMappingLayout = {})
    dataStorage.symbolAccountMappingLayout = {
      ...dataStorage.symbolAccountMappingLayout,
      [symbolKey]: dataStorage.lastSymbol || dataStorage.defaultSymbol,
      [accountKey]: dataStorage.lastAccount || dataStorage.defaultAccount
    }
  }

  handleOnChangeLayout(id) {
    try {
      this.saveCurrentSymbolAccountOfLayout(dataStorage.usingLayout)
      if (id === immutableLayout.DEFAULT) {
        const defaultLayout = this.getDefaultLayoutByRole();
        dataStorage.usingLayout = id;
        getDefaultAccount().then(() => {
          dataStorage.goldenLayout.initGoldenLayout(defaultLayout);
        }).catch(error => logger.log('get default account error' + JSON.stringify(error)))
      } else {
        const lst = dataStorage.listLayout;
        const curLayout = lst[id];
        curLayout['is_using_layout'] = id
        dataStorage.curLayoutVersion = curLayout.updated;
        dataStorage.usingLayout = id;
        curLayout.key && delete curLayout.key
        curLayout.init_time && delete curLayout.init_time
        this.setState({ layout: id })
        updateDataLayout(id, curLayout).then(() => {
          this.selfChange = true;
          dataStorage.isChangeLayout = true;
          dataStorage.goldenLayout.initGoldenLayout();
          this.removeLayoutDeleted(() => this.getLayout());
        })
      }
    } catch (error) {
      logger.error('handleOnChangeLayout On Header' + error)
    }
  }

  handleSaveChartLayout = () => {
    try {
      const widgets = (dataStorage.goldenLayout &&
        dataStorage.goldenLayout.goldenLayout &&
        dataStorage.goldenLayout.goldenLayout.root &&
        dataStorage.goldenLayout.goldenLayout.root.getItemsByType &&
        dataStorage.goldenLayout.goldenLayout.root.getItemsByType('component')) || []
      const charts = widgets.filter(widget => widget.config.component === 'ChartTV')
      if (!charts || charts.length < 0) return;
      const chartStates = charts.map(chart => chart.config.componentState)
      const groupCharts = {}
      for (let i = 0; i < chartStates.length; i++) {
        const chrt = chartStates[i]
        if (!groupCharts[chrt.chartID]) {
          groupCharts[chrt.chartID] = []
        }
        groupCharts[chrt.chartID].push(chrt)
      }
      for (let chartId in groupCharts) {
        this.sortByModifiedTime(groupCharts[chartId])
        const lastChartLayout = groupCharts[chartId][0]
        const { actionType, chartID, chartSaveLayoutCallback } = lastChartLayout
        chartSaveLayoutCallback && chartSaveLayoutCallback(chartID, actionType)
      }
    } catch (error) {
      logger.log(`Error while saving current chart layout: ${error}`)
    }
  }

  sortByModifiedTime = arr => {
    arr.sort((a, b) => b.lastAction - a.lastAction)
  }

  checkVersionLayoutBeforeOverride(id) {
    if (!id) id = dataStorage.usingLayout || '';
    let type = '';
    if (dataStorage.userInfo && dataStorage.userInfo.user_type && dataStorage.userInfo.user_type === role.OPERATION) {
      type = LayoutType.ADMIN_LAYOUT;
    } else {
      type = LayoutType.USER_LAYOUT;
    }
    let lst = dataStorage.listLayout;
    let newLayout = {};
    let newestLayout = lst[id];
    let newestVersion = (newestLayout && newestLayout.updated) || (+new Date() + '');
    if (!lst[id]) newestVersion = +new Date() + '';
    const curVersion = dataStorage.curLayoutVersion || '0';
    if (curVersion === newestVersion) {
      const currentLayout = lst[id] || {};
      currentLayout.linkColor = `${dataStorage.linkColor || 0}`;
      currentLayout.layout = JSON.stringify(dataStorage.goldenLayout.goldenLayout.toConfig().content);
      currentLayout.account_id = dataStorage.account_id || '';
      currentLayout.updated = +new Date() + '';
      currentLayout.key && delete currentLayout.key
      currentLayout.init_time && delete currentLayout.init_time
      dataStorage.curLayoutVersion = currentLayout.updated;
      dataStorage.listLayout[id] = currentLayout;
      this.handleSaveChartLayout()
      updateDataLayout(id, currentLayout)
        .then(() => {
          this.selfChange = true;
          logger.log('override current layout success');
        })
        .catch(() => {
          logger.log('override current layout failure');
        })
    } else {
      const curName = (newestLayout && newestLayout.layout_name);
      const newName = genreNewName(curName, lst);
      const newId = uuidv4();
      newLayout = {
        linkColor: `${dataStorage.linkColor || 0}`,
        layout_id: newId,
        layout: JSON.stringify(dataStorage.goldenLayout.goldenLayout.toConfig().content),
        layout_name: newName,
        chart_layout: dataStorage.usingChartLayout,
        type,
        account_id: dataStorage.account_id || '',
        updated: +new Date() + ''
      }
      dataStorage.listLayout[newId] = newLayout;
      dataStorage.curLayoutVersion = newLayout.updated;
      dataStorage.usingLayout = newId;
      this.setState({ layout: newId })
      dataStorage.isChangeLayout = true;
      newLayout.is_using_layout = newId;
      this.handleSaveChartLayout()
      createNewLayout(newLayout)
        .then(() => {
          this.selfChange = true;
          this.removeLayoutDeleted(() => this.getLayout());
          logger.log('override create new layout success');
        })
        .catch(() => {
          logger.log('override create new layout failure');
        })
    }
  }

  overrideLayout(id) {
    if (id === dataStorage.usingLayout) {
      this.checkVersionLayoutBeforeOverride(id);
    } else {
      let lst = dataStorage.listLayout;
      if (lst[id]) {
        const curLayout = lst[id];
        curLayout.layout = JSON.stringify(dataStorage.goldenLayout.goldenLayout.toConfig().content);
        curLayout.updated = +new Date() + '';
        curLayout.linkColor = `${dataStorage.linkColor || 0}`;
        this.setState({ layout: id })
        dataStorage.usingLayout = id;
        curLayout.key && delete curLayout.key
        curLayout.init_time && delete curLayout.init_time
        dataStorage.listLayout[id] = curLayout;
        this.handleSaveChartLayout()
        updateDataLayout(id, curLayout)
          .then(() => {
            this.selfChange = true;
            logger.log(`override layout ${(curLayout.layout_name + '').toUpperCase()} success`);
          })
          .catch(() => {
            logger.log(`override layout ${(curLayout.layout_name + '').toUpperCase()} failure`);
          })
      }
    }
  }

  saveLayout(name) {
    const isAdmin = dataStorage.userInfo && dataStorage.userInfo.user_type && dataStorage.userInfo.user_type === role.OPERATION;
    const newId = uuidv4();
    const newLayout = {
      layout_id: newId,
      layout: JSON.stringify(dataStorage.goldenLayout.goldenLayout.toConfig().content),
      layout_name: name,
      linkColor: `${dataStorage.linkColor || 0}`,
      chart_layout: dataStorage.usingChartLayout,
      type: isAdmin ? LayoutType.ADMIN_LAYOUT : LayoutType.USER_LAYOUT,
      account_id: dataStorage.account_id || '',
      updated: +new Date() + ''
    }
    this.setState({ layout: newId })
    dataStorage.curLayoutVersion = newLayout.updated;
    dataStorage.listLayout[newId] = newLayout;
    dataStorage.usingLayout = newId;
    newLayout.is_using_layout = newId;
    this.handleSaveChartLayout()
    createNewLayout(newLayout)
      .then(() => {
        this.selfChange = true;
        this.removeLayoutDeleted(() => this.getLayout())
        logger.log(`create new layout success`);
      })
      .catch(() => {
        logger.log(`create new layout failure`);
      })
  }

  removeLayoutDeleted(cb) {
    if (dataStorage.deletingLayout && dataStorage.listLayout[dataStorage.deletingLayout.layout_id]) {
      delete dataStorage.listLayout[dataStorage.deletingLayout.layout_id];
      cb && cb();
    }
  }

  updateLayout(id, newName) {
    let lst = dataStorage.listLayout;
    const curLayout = lst[id];
    curLayout['layout_name'] = newName;
    curLayout['updated'] = +new Date() + '';
    curLayout['account_id'] = curLayout.account_id || '';
    if (id === dataStorage.usingLayout) {
      dataStorage.curLayoutVersion = curLayout.updated;
    }
    dataStorage.listLayout[id] = curLayout;
    curLayout.key && delete curLayout.key
    curLayout.init_time && delete curLayout.init_time
    updateDataLayout(id, curLayout)
      .then(() => {
        this.selfChange = true;
        logger.log(`update name layout ${(curLayout.layout_name + '').toUpperCase()} success`);
      })
      .catch(() => {
        logger.log(`update name layout ${(curLayout.layout_name + '').toUpperCase()} failure`);
      })
  }

  deleteLayout(id) {
    let lst = dataStorage.listLayout;
    delete lst[id];
    dataStorage.listLayout = lst;
    deleteDataLayout(id)
      .then(() => {
        this.selfChange = true;
        if (id === dataStorage.usingLayout) {
          dataStorage.usingLayout = immutableLayout.DEFAULT;
          this.handleOnChangeLayout(immutableLayout.DEFAULT);
        }
        logger.log('delete user layout success');
      })
      .catch(() => {
        logger.log('delete user layout failure');
      })
  }

  renderDisplayAccount() {
    const oneAccount = !!(dataStorage.listMapping && dataStorage.listMapping.length === 1)
    const noneCode = !!(!dataStorage.userInfo.organisation_code && !dataStorage.userInfo.branch_code && !dataStorage.userInfo.advisor_code)
    if ((dataStorage.userInfo.user_type === userTypeEnum.RETAIL && oneAccount) ||
      (dataStorage.userInfo.user_type === userTypeEnum.ADVISOR && oneAccount && noneCode)) {
      const accountId = dataStorage.accountInfo && dataStorage.accountInfo.account_id;
      const accountName = (dataStorage.accountInfo && dataStorage.accountInfo.account_name) || ''
      return <span>{dataStorage.userInfo.user_login_id}  ({!/RG\d{3,}/.test(dataStorage.userInfo.role_group) ? (dataStorage.userInfo.group_name || '').toUpperCase() : (dataStorage.userInfo.group_name || '')}) {accountName ? '-' : ''} {accountName} {accountId ? `(${accountId})` : ''}</span>
    } else {
      return <span>{dataStorage.userInfo.user_login_id} ({!/RG\d{3,}/.test(dataStorage.userInfo.role_group) ? (dataStorage.userInfo.group_name || '').toUpperCase() : (dataStorage.userInfo.group_name || '')})</span>
    }
  }
  renderStatus() {
    const marketDataType = (this.state.isLogin ? (dataStorage.env_config.roles.useNewMarketData ? Math.max(...Object.values(dataStorage.marketDataType || {})) : Math.max(dataStorage.userInfo.market_data_fu, dataStorage.userInfo.market_data_au, dataStorage.userInfo.market_data_us)) : marketDataTypeEmums.DELAYED);
    if (marketDataType === marketDataTypeEmums.NOACCESS) return <div><Lang>lang_no_access_to_market_data</Lang></div>
    return <NoTag>
      {marketDataType === marketDataTypeEmums.CLICK2REFRESH
        ? <div>
          <div className='text-capitalize' style={{ paddingRight: '4px' }}><Lang>lang_last_refresh</Lang> </div>
          {translateTimeNew(this.state.curTime, true, dataStorage.env_config.timezone || 'Australia/Sydney' || this.timeZone)}
        </div>
        : null}
      <div className="refreshIcon showTitle next">
        <div className='flex'>
          <div className={this.state.loadingRefresh} style={{ cursor: 'pointer' }} onClick={() => this.click2Refresh()}><SvgIcon style={{ width: '20px' }} path={path.mdiSync} /> </div>
          <div style={{ paddingLeft: '4px' }} className="refreshText text-capitalize"> <span onClick={() => this.click2Refresh()}><Lang>lang_refresh</Lang></span></div>
        </div>
      </div>
      <div>
        <div className='text-capitalize' style={{ paddingRight: '4px' }}><Lang>lang_last_refresh</Lang> </div>
        {translateTimeNew(this.state.curTime, true, dataStorage.env_config.timezone || 'Australia/Sydney' || this.timeZone)}
      </div>
      {marketDataType === marketDataTypeEmums.DELAYED ? <div className='flex'>
        <SvgIcon path={path.mdiClockAlert} style={{ height: '20px' }} />&nbsp;<Lang>lang_market_delayed</Lang>
      </div> : null}
    </NoTag>
  }
  renderNotiTechnical(isNotiTechnical) {
    if (isNotiTechnical) {
      return (
        <div>
          <span className='iconWarning showTitle next'>
            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="19" viewBox="0 0 23 19">
              <path fill="#F7B500" fillRule="nonzero" d="M12.202 12h-2.034V8h2.034v4zm0 4h-2.034v-2h2.034v2zM0 19h22.37L11.186 0 0 19z" />
            </svg>
          </span>
          <div style={{ display: 'none' }}>
            <div><Lang>lang_technical_difficulties_1</Lang>&nbsp;</div>
            <div className='topHoldRoot'><Lang>lang_technical_difficulties_2</Lang></div>
            <div>
              <span><Lang>lang_technical_difficulties_3</Lang>&nbsp;</span>
              <span className='underline portfolioBold' style={{ color: '#17202A ' }}><Lang>lang_technical_difficulties_4</Lang></span>
              <span><Lang>lang_technical_difficulties_5</Lang></span>
            </div>
            <div className='topHoldRoot'><Lang>lang_technical_difficulties_6</Lang></div>
            <div className='topHoldRoot'><Lang>lang_technical_difficulties_7</Lang></div>
          </div>
        </div>
      )
    } else return null
  }
  renderNotiCashNegative(isNotiCashNegative) {
    const supportEmail = dataStorage.translate('lang_config_support_email')
    if (dataStorage.userInfo && dataStorage.userInfo.user_type === 'retail' && isNotiCashNegative) {
      return (
        <div>
          <span className='iconWarning showTitle next'>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
              <path fill="#E02020" fillRule="nonzero" d="M2 0h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm8 10V4H8v6h2zm0 4v-2H8v2h2z" />
            </svg>
          </span>
          <div style={{ display: 'none' }}>
            <div><Lang>lang_negative_available_cash_balance_1</Lang></div>
            <div className='topHoldRoot'><Lang>lang_negative_available_cash_balance_2</Lang></div>
            <div className='topHoldRoot'><Lang>lang_negative_available_cash_balance_3</Lang>&nbsp;<span>
              {
                supportEmail ? <a target="_blank" href={`mailto:${supportEmail}`} className="color-primary">{supportEmail}</a>
                  : <a href={`tel:${dataStorage.translate('lang_config_support_phone')}`} className="color-primary"><Lang>lang_config_support_phone</Lang></a>}
            </span></div>
          </div>
        </div>
      )
    } else return null;
  }
  renderWarning() {
    return (
      <div className='rootTimeTab'>
        {this.renderNotiTechnical(this.state.isNotiTechnical)}
        {this.renderNotiCashNegative(this.state.isNotiCashNegative)}
      </div>
    )
  }

  renderMarketDataType() {
    let type = marketDataTypeEmums.DELAYED
    if (dataStorage.env_config.roles.useNewMarketData) {
      type = (this.state.isLogin ? Math.max(...Object.values(dataStorage.marketDataType || {})) : marketDataTypeEmums.DELAYED)
    } else {
      type = (this.state.isLogin ? Math.max(dataStorage.userInfo.market_data_fu, dataStorage.userInfo.market_data_au, dataStorage.userInfo.market_data_us) : marketDataTypeEmums.DELAYED)
    }
    return type === marketDataTypeEmums.STREAMING ? null : this.renderStatus()
  }

  renderSettingBtn = () => {
    return (
      <div className='text-capitalize' style={{ cursor: 'pointer' }} onClick={() => requirePin(() => dataStorage.goldenLayout.addComponentToStack('Settings'))}>
        <SvgIcon style={{ width: '20px', paddingRight: '4px' }} path={path.mdiCog} />
        <Lang>lang_settings</Lang>
      </div>
    )
  }

  headerRightContent() {
    try {
      let layout = dataStorage.usingLayout
      return (
        <div className='headerRight size--3'>
          {this.renderWarning()}
          {this.state.isLogin
            ? <div className="headerRight">
              {this.renderMarketDataType()}
              <Layout
                title='Header'
                className={`${this.state.isLogin ? 'saveLayoutDropDown size--3' : 'saveLayoutDropDown size--3 unlogin'}`}
                placeholder={'lang_default_layout'}
                options={this.state.optionLayout}
                exist={this.listExist}
                value={layout}
                save={this.saveLayout.bind(this)}
                overrideLayout={this.overrideLayout.bind(this)}
                update={this.updateLayout.bind(this)}
                delete={this.deleteLayout.bind(this)}
                onChange={this.handleOnChangeLayout.bind(this)} />
              {
                dataStorage.userInfo
                  ? this.renderSettingBtn()
                  : null
              }
              <LoginAccountProfile logOut={this.logOut} />
            </div>
            : <div>
              <div className='flex' style={{ alignItems: 'center', padding: '0 16px' }}>
                <SvgIcon path={path.mdiClockAlert} style={{ height: '20px', marginTop: 0 }} />&nbsp;<Lang>lang_market_delayed</Lang>
              </div>
              <div className='loginBtnHeader showTitle text-capitalize' onClick={() => this.showLoginForm()}>
                <Lang>lang_sign_in</Lang>
              </div>
              <div className={s.headerRightBtn + ' ' + 'showTitle text-capitalize'} onClick={() => this.showSignupForm()}>
                <Lang>lang_sign_up_free</Lang>
              </div>
            </div>
          }
        </div>
      )
    } catch (error) {
      logger.error('headerRightContent On Header' + error)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    try {
      if (dataStorage.checkUpdate) {
        return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state)
      }
      return true;
    } catch (error) {
      logger.error('shouldComponentUpdate On Header', error)
    }
  }

  onChangeLang() {
    const lang = dataStorage.lang;
    this.props.i18n.changeLanguage(lang);
    this.setState({
      language: lang
    })
  }
  handleSrcImgLogo() {
    return getLogo();
  }
  render() {
    try {
      const src = this.handleSrcImgLogo()
      return (
        <div style={{ zIndex: '10002' }}>
          <div className='headerBoxHover'></div>
          <div className='headerRoot'>
            <MainMenu handlePopUpLogout={this.props.handlePopUpLogout} isLogin={this.state.isLogin} />
            <img style={{ marginTop: '3px' }} height='24px' src={src} />
            {this.headerRightContent()}
          </div>
        </div>
      );
    } catch (error) {
      logger.error('render On Header' + error)
    }
  }

  componentWillUnmount() {
    removeEventListener(EVENTNAME.marketDataTypeChanged, this.marketDataTypeChanged);
    this.emitID && this.emitID.remove();
  }

  checkShowLogin() {
    const isShowLogin = localStorageNew.getItem('show_login_form')
    if (isShowLogin && isShowLogin !== 'undefined') {
      localStorageNew.removeItem('show_login_form')
      setTimeout(() => {
        this.showLoginForm()
      }, 1500)
    }
  }

  componentDidMount() {
    try {
      this.checkShowLogin()
      this.getLayout();
      let fontSize = localStorageNew.getItem('lastFontSize', true);
      fontSize = !fontSize || fontSize === 'null' ? 'medium' : fontSize;
      if (!dataStorage.userInfo) {
        this.onChangeLang();
      }
      if (fontSize !== this.state.fontSize) {
        dataStorage.fontSize = fontSize;
        document.body.classList.remove('small', 'medium', 'large')
        document.body.classList.add(fontSize);
        this.setState({ fontSize })
      }
      const menuBarIcon = document.querySelector('.headerBoxHover')
      menuBarIcon && menuBarIcon.addEventListener('mouseover', () => {
        dataStorage.removeSaveChartLayout && dataStorage.removeSaveChartLayout()
      })
    } catch (error) {
      logger.error('componentDidMount On Header' + error)
    }
  }

  realtimeLayout(data, title) {
    if (data && data.is_using_layout) delete data.is_using_layout;
    const action = (title.includes('#') ? title.split('#')[1] + '' : title).toLowerCase();
    let type = data.type;
    let lstTemp = {};
    if (type === LayoutType.CHART_LAYOUT || (action === 'delete' && dataStorage.listChartLayout[data.layout_id])) {
      lstTemp = dataStorage.listChartLayout;
      type = LayoutType.CHART_LAYOUT;
    } else {
      lstTemp = dataStorage.listLayout;
      type = LayoutType.USER_LAYOUT;
    }
    dataStorage.deletingListChartLayout = lstTemp[data.layout_id];
    switch (action) {
      case 'insert':
        lstTemp[data.layout_id] = data;
        break;
      case 'update':
        lstTemp[data.layout_id] = data;
        if (data.layout_id === dataStorage.usingLayout) {
          lstTemp[data.layout_id].layout_name = dataStorage.listLayout[data.layout_id].layout_name;
        }
        if (dataStorage.listUsingChartLayout[data.layout_id]) {
          lstTemp[data.layout_id].layout_name = dataStorage.listChartLayout[data.layout_id].layout_name;
        }
        break;
      case 'delete':
        if (data.layout_id !== dataStorage.usingLayout) {
          delete lstTemp[data.layout_id];
        } else {
          lstTemp[data.layout_id] && (lstTemp[data.layout_id].updated = +new Date())
          if (type === LayoutType.CHART_LAYOUT) {
            dataStorage.deletingChartLayout = data.layout_id;
          } else {
            dataStorage.deletingLayout = lstTemp[data.layout_id];
            delete lstTemp[data.layout_id];
          }
        }
        break;
      default: lstTemp[data.layout_id] = data; break;
    }
    if (type === LayoutType.CHART_LAYOUT) {
      dataStorage.listChartLayout = lstTemp;
      dataStorage.renderAfterRealtime && dataStorage.renderAfterRealtime();
    } else {
      dataStorage.listLayout = lstTemp;
      this.getLayout();
    }
  }

  realTimeData(setting) {
    if (!setting) return;
    for (const key in setting) {
      switch (key) {
        case 'showNotifications':
          dataStorage.isShowNotification = setting[key];
          break;
        case 'showAllNews': case 'showCancelled': case 'showExpired': case 'showPartialFill':
        case 'showFilled': case 'showOnMarket': case 'showRejected':
          dataStorage[key] = setting[key];
          break;
        case 'requireTime':
          dataStorage.requireTime = setting[key];
          dataStorage.verifiedPin = setting[key] !== requireTimeSetting.ON_CHANGE;
          localStorageNew && localStorageNew.setItem(`requireTime_${dataStorage.loginEmail}`, setting[key]);
          sendRequest();
          break;
        case 'timezone':
          dataStorage[key] = setting[key];
          this.setState({
            curTime: exportTimeZone(setting[key], moment(), true)
          })
          break;
        default: break;
      }
    }
  }
}

export default translate('translations')(Header)
