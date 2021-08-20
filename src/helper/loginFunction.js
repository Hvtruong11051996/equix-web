import userRoles from '../constants/user_roles';
import dataStorage from '../dataStorage';
import logger from '../helper/log';
import {
  postDecode,
  autoRefreshToken,
  postChangePin
} from './api';
import {
  getData,
  makeUserDetailUrl,
  getOpeningAccountUrl,
  makeMappingAccountlUrl,
  getUserGroupUrl,
  getAllAccountUrl,
  getAllWatchlist,
  makeSymbolUrl,
  getUrlTotalPosition, requirePin,
  getUserDetailUrl,
  getAllAccountNewUrl
} from '../helper/request';
import role from '../constants/role';
import MapRoleComponent from '../constants/map_role_component'
import {
  registerAccount,
  registerAccountStreaming,
  unregisterAccount,
  registerAllOrders,
  registerUser,
  unregisterUser,
  registerWarningTechnicalStreaming,
  unregisterWarningTechnicalStreaming
} from '../streaming';
import {
  getDataSetting,
  saveDataSetting,
  updateDataLayout,
  getAllLayout,
  createNewLayout,
  getDisplayRole,
  logout,
  removeQuickmenu,
  preprocessUserDetailNoti,
  getLstAccountAfterLogin,
  setLanguage,
  saveDataWhenChangeEnv,
  checkRole,
  clone,
  clearPrice,
  checkShowAccessModal,
  clearCurSessionPopup
} from '../helper/functionUtils';
import LayoutType from '../constants/layout_type';
import UserStatus from '../constants/user_status';
import PriceSourceEnum from '../constants/price_source_enum';
import showModal from '../components/Inc/Modal';
import Lang from '../components/Inc/Lang';
import Terms from '../../Terms/Terms';
import layoutConfig from '../layoutConfig';
import config from '../../public/config';
import uuidv4 from 'uuid/v4';
import consfirm from '../components/Inc/Confirm';
import warning from '../components/Inc/Warning';
import actionTypeEnum from '../constants/action_type_enum';
import sideEnum from '../constants/enum';
import showPanel from '../components/PanelBuySell/PanelBuySell';
import BuySellPanel from '../components/BuySellPanel/BuySellPanel';
import { EVENTNAME, dispatchEvent } from '../helper/event'
import { marketDataType } from '../helper/priceSource'

const defaultLayout = 'User Layout';
const defaultChartLayout = 'User Template';
export function changePinAction(token, pin, cb) {
  postChangePin(token, pin, true)
    .then(response => {
      if (response.data) {
        dataStorage.pinWasChanged = true;
        const data = response.data;
        if (data && data.baseUrl) {
          dataStorage.env_config.api.backendBase = 'https://' + data.baseUrl
          // dataStorage.href = dataStorage.href.replace(/(\/\/)([^/]+)/, '$1' + data.baseUrl)
        }
        dataStorage.accessToken = data.accessToken;
        const tokenKey = `${dataStorage.loginEmail}_refresh_token`;
        logger.log('CHECK TOKEN ===> LOGIN FUNCTION loginAction showModal postPin SET NEW TOKEN: ', dataStorage);
        localStorageNew && localStorageNew.setItem(tokenKey, data.refreshToken);
        if (localStorageNew.getItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : ''))) localStorageNew.removeItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : ''))
        if (!dataStorage.userInfo) {
          afterLogin(() => {
            saveDataWhenChangeEnv();
            dataStorage.isGuest = false;
            cb && cb()
          }, null);
        }
        postDecode(pin, data.refreshToken)
          .then(res => {
            if (res.data) {
              autoRefreshToken(res.data.token);
            }
          })
          .catch(error => {
            if (error.response && error.response.errorCode === 2089) {
              localStorageNew.removeItem('isStayLogin', true);
              warning({
                message: 'lang_pin_expired',
                callback: () => {
                  this.props.handlePopUpLogout && this.props.handlePopUpLogout(false)
                  window.location.reload();
                }
              });
            }
            logger.log(error)
          })
      }
    }).catch(error => {
      logger.log(error);
    })
}

async function getInitUserLayout(data, layoutType) {
  if (Object.keys(data).length === 0) {
    const id = uuidv4();
    let layout = layoutConfig.getLayout()
    const newLayout = {
      layout_id: id,
      layout_name: defaultLayout,
      type: layoutType,
      layout: JSON.stringify(layout),
      updated: +new Date() + ''
    }
    dataStorage.curLayoutVersion = newLayout.updated;
    dataStorage.usingLayout = id;
    dataStorage.listLayout[id] = newLayout;
    newLayout.is_using_layout = id;
    await createNewLayout(newLayout)
      .then(() => {
        logger.log('create default user layout success')
      })
      .catch(error => {
        logger.log(error)
      })
    dataStorage.getLayout && dataStorage.getLayout()
  } else {
    dataStorage.listLayout = data;
    if (!dataStorage.usingLayout || !data[dataStorage.usingLayout]) {
      let newestLayout = {};
      let listLayoutArr = Object.keys(data).map(l => data[l]);
      if (listLayoutArr && listLayoutArr.length > 1) {
        const listLayoutArrSorted = listLayoutArr.sort((a, b) => b.updated - a.updated);
        newestLayout = listLayoutArrSorted[0] || {};
      } else {
        newestLayout = listLayoutArr[0]
      }
      dataStorage.usingLayout = newestLayout.layout_id;
      newestLayout['is_using_layout'] = newestLayout.layout_id;
      newestLayout.init_time && delete newestLayout.init_time;
      newestLayout.key && delete newestLayout.key
      await updateDataLayout(newestLayout.layout_id, newestLayout)
        .then(() => {
          logger.log('update using user layout success')
        })
        .catch(error => {
          logger.log(error)
        })
    }
    dataStorage.getLayout && dataStorage.getLayout()
  }
}

async function getInitLayout() {
  let listData = {};
  let type = '';
  let listDataChart = {};
  await getAllLayout().then(res => {
    const data = res.data || {};
    dataStorage.usingLayout = data.is_using_layout;
    dataStorage.usingChartLayout = data.is_using_chart_layout;
    if (dataStorage.userInfo.user_type && dataStorage.userInfo.user_type === role.OPERATION) {
      type = LayoutType.ADMIN_LAYOUT;
    } else {
      type = LayoutType.USER_LAYOUT;
    }
    for (const key in data) {
      const element = data[key];
      if (key === dataStorage.usingLayout) {
        dataStorage.curLayoutVersion = element.updated;
        dataStorage.account_id = element.account_id;
      }
      if (key === dataStorage.usingChartLayout) {
        dataStorage.curChartLayoutVersion = element.updated;
      }
      if (element && element.type === type) {
        listData[key] = element;
      }
      if (element && element.type === LayoutType.CHART_LAYOUT) {
        listDataChart[key] = element;
      }
    }
  }).catch((x) => {
    logger.error('getInitLayout', x)
  })
  await getInitUserLayout(listData, type);
  await getInitChartLayout(listDataChart)
}

async function getInitChartLayout(data) {
  if (Object.keys(data).length === 0) {
    const id = uuidv4();
    const newLayout = {
      layout_id: id,
      layout_name: defaultChartLayout,
      type: LayoutType.CHART_LAYOUT,
      layout: null,
      updated: +new Date() + ''
    }
    dataStorage.curChartLayoutVersion = newLayout.updated;
    dataStorage.usingChartLayout = id;
    dataStorage.listChartLayout[id] = newLayout;
    newLayout.is_using_chart_layout = id;
    await createNewLayout(newLayout)
      .then(() => {
        logger.log('create default chart layout success')
      })
      .catch(error => {
        logger.log(error)
      })
  } else {
    if (Object.keys(data).length === 1) {
      const curChartLayout = data[Object.keys(data)[0]];
      if (curChartLayout.layout_name === defaultLayout) {
        curChartLayout.layout_name = defaultChartLayout;
        data[curChartLayout.layout_id].layout_name = defaultChartLayout;
        data[curChartLayout.layout_id].init_time && delete data[curChartLayout.layout_id].init_time;
        updateDataLayout(curChartLayout.layout_id, curChartLayout).then(() => {
          logger.log('update name chart layout success');
        }).catch(() => {
          logger.log('update name chart layout failure');
        })
      }
    }
    dataStorage.listChartLayout = data;
    const lst = dataStorage.listLayout;
    const usingLayout = dataStorage.usingLayout;
    let curLayout = lst[usingLayout];
    if (!curLayout) {
      let lstArr = Object.keys(lst).map(l => lst[l]);
      if (lstArr && lstArr.length) {
        const lstArrSorted = lstArr.sort((a, b) => b.updated - a.updated);
        const newestLayout = lstArrSorted[0] || {};
        curLayout = newestLayout;
      }
    }
    if (curLayout.chart_layout) {
      dataStorage.usingChartLayout = curLayout.chart_layout;
    }
    if (!dataStorage.usingChartLayout || !data[dataStorage.usingChartLayout]) {
      let lstChartArr = Object.keys(data).map(l => data[l]);
      let newestLayout = {};
      if (lstChartArr && lstChartArr.length > 1) {
        const lstChartArrSorted = lstChartArr.sort((a, b) => b.updated - a.updated);
        newestLayout = lstChartArrSorted[0] || {};
      } else {
        newestLayout = lstChartArr[0];
      }
      dataStorage.usingChartLayout = newestLayout.layout_id;
    }
  }
}

function setNotifyConfig(setting) {
  // dataStorage.enableStreaming = setting.streamingPrice
  dataStorage.isShowNotification = !!setting.showNotifications;
  dataStorage.showAllNews = !!setting.showAllNews;
  dataStorage.showCancelled = !!setting.showCancelled;
  dataStorage.showExpired = !!setting.showExpired;
  dataStorage.showFilled = !!setting.showFilled;
  dataStorage.showOnMarket = !!setting.showOnMarket;
  dataStorage.showRejected = !!setting.showRejected;
  dataStorage.showPartialFill = !!setting.showPartialFill;
  dataStorage.requireTime = setting.requireTime;
  dataStorage.beforeLogin = false;
}

async function getDefaultAccountInListMapping() {
  if (dataStorage.accountInfo) return;
  const accountDefaultUrl = getAllAccountUrl(dataStorage.userInfo.user_id, 1, 50);
  logger.sendLog(`DATA MAPPING RESPONSE1 url: ${accountDefaultUrl}`);
  await getData(accountDefaultUrl, response => {
    if (!response) {
      dataStorage.account_id = null;
      return;
    }
    dataStorage.accounts = [];
    logger.sendLog(`DATA MAPPING RESPONSE2`);
    if (response.data && response.data.data && response.data.data.length > 0) {
      const listData = response.data.data;
      logger.sendLog(`DATA MAPPING RESPONSE2 DATA: ${JSON.stringify(response)}`);
      dataStorage.accounts = listData;
      dataStorage.accountsObjDic = listData.reduce((acc, cur) => {
        cur.account_id && (acc[cur.account_id] = cur)
        return acc
      }, {})
      if (listData.length) {
        let accountInfo = listData.find(function (element) {
          return element.status === 'active';
        });
        if (!accountInfo) {
          dataStorage.account_id = '';
          dataStorage.accountInfo = {};
          // dataStorage.accountsObjDic[`${accountInfo.account_id}`] = accountInfo
        } else {
          dataStorage.account_id = accountInfo.account_id;
          dataStorage.accountInfo = accountInfo;
          dataStorage.accountsObjDic[`${accountInfo.account_id}`] = accountInfo
        }
      }
    } else {
      dataStorage.account_id = null;
      logger.sendLog(`DATA MAPPING RESPONSE2 []`);
    }
  })
}

export async function afterLogin(callback, callbackError) {
  try {
    unregisterUser('guest');
    const loginEmail = dataStorage.loginEmail || localStorageNew.getItem('loginEmail', true);
    dataStorage.isDemo = localStorageNew.getItem('isDemo', true)
    const userDetailUrl = makeUserDetailUrl(`?user_login_id=${loginEmail}`)
    dataStorage.isLoggingOut = false
    logger.sendLog(`GET USER DETAIL ${document.body.clientWidth}x${document.body.clientHeight}`)
    console.log(userDetailUrl)
    await getData(userDetailUrl)
      .then(res => {
        logger.sendLog(`GET USER DETAIL RESPONSE`);
        if (res.data) {
          logger.sendLog(`GET USER DETAIL SUCCESS: ${JSON.stringify(res.data)}`);
          dataStorage.userInfo = res.data;
        }
      })
      .catch(error => {
        logger.sendLog(`GET USER ERROR: ${error}`);
        console.error(error)
        dataStorage.userInfo = null;
      });
    const symbol = dataStorage.env_config.roles.symbol || 'ANZ';
    const url = makeSymbolUrl(encodeURIComponent(symbol));
    getData(url).then(resolve => {
      if (resolve && resolve.data) {
        dataStorage.symbolDefault = resolve.data[0]
      }
    }).catch(e => logger.sendLog('error at getDefaultSymbol', e))
    if (dataStorage.env_config.roles.openingAccount) {
      if (!dataStorage.openingAccount || !Object.keys(dataStorage.openingAccount).length) {
        await getData(getOpeningAccountUrl())
          .then(res => {
            logger.sendLog(`GET OPENING ACCOUNT RESPONSE`);
            if (res.data) {
              logger.sendLog(`GET  OPENING ACCOUNT SUCCESS: ${JSON.stringify(res.data)}`);
              dataStorage.openingAccount = res.data && res.data.filter(x => !['ACTIVE', 'INACTIVE', 'CLOSED'].includes(x.account_status))[0]
              dispatchEvent(EVENTNAME.loginChanged);
            }
          }).catch(error => {
            logger.sendLog(`GET OPENING ACCOUNT ERROR: ${error}`);
            console.error(error)
          });
      }
      if (dataStorage.env_config.roles.bannerStax && (!dataStorage.openingAccount || !Object.keys(dataStorage.openingAccount).length)) {
        await getData(getOpeningAccountUrl('/draft'))
          .then(res => {
            logger.sendLog(`GET OPENING ACCOUNT RESPONSE`);
            if (Object.values(res.data).length) {
              dataStorage.gotDraft = true
              dispatchEvent(EVENTNAME.loginChanged);
            }
          }).catch(error => {
            logger.sendLog(`GET OPENING ACCOUNT ERROR: ${error}`);
            console.error(error)
          });
      }
    }
    // watchlist
    if (dataStorage.userInfo) {
      let urlAllWatchlist = getAllWatchlist(dataStorage.userInfo && dataStorage.userInfo.user_id);
      getData(urlAllWatchlist).then(response => {
        if (response.data && response.data.data) {
          let watchlist = response.data.data
          if (watchlist[0].watchlist_name === 'Favourites') watchlist[0].watchlist_name = 'Favorites'
          if (watchlist.length > 1) {
            let indexFavorite = watchlist.findIndex(item => item.watchlist === 'user-watchlist')
            let favorite = watchlist[indexFavorite]
            // favorite.watchlist_name = 'Favourites'
            watchlist.splice(indexFavorite, 1)
            watchlist.unshift(favorite)
          }
          dataStorage.watchlist = watchlist
        }
      })
      let isShowCashNegative = 0;
      let isClickOk = 0;
      const showWarningCashNegative = () => {
        if (dataStorage.userInfo.user_type === 'retail' && dataStorage.isWarning.isNotiCashNegative) {
          if (isShowCashNegative === 0) {
            setTimeout(() => {
              warning({
                message: [
                  {
                    value: 'lang_negative_available_cash_balance_1',
                    valSerial: 'lang_negative_available_cash_balance_2'
                  },
                  { value: 'lang_negative_available_cash_balance_3', isPhone: dataStorage.translate('lang_config_support_phone'), isEmail: dataStorage.translate('lang_config_support_email') }
                ],
                isWarning: true,
                isClickOk: isClickOk,
                isCheckIndex: 0,
                callback: () => {
                  isClickOk++;
                }
              })
            }, 1000)
            isShowCashNegative++;
          }
        }
      }
      const showWarningPopup = () => {
        if (!dataStorage.isWarning.isNotiTechnical) showWarningCashNegative();
        else {
          setTimeout(() => {
            warning({
              message: [
                {
                  value: 'lang_technical_difficulties_1',
                  valSerial: 'lang_technical_difficulties_2'
                },
                {
                  value: 'lang_technical_difficulties_3',
                  valHighLight: 'lang_technical_difficulties_4',
                  underline: true,
                  valSerial: 'lang_technical_difficulties_5',
                  valEnd: 'lang_technical_difficulties_6'
                },
                {
                  value: 'lang_technical_difficulties_7'
                }
              ],
              isClickOk: isClickOk,
              isCheckIndex: (dataStorage.userInfo.user_type === 'retail' && dataStorage.isWarning.isNotiCashNegative) ? 1 : 0,
              callback: () => {
                if (isClickOk === 0) isShowCashNegative = 0;
                isClickOk++;
                showWarningCashNegative()
              },
              isWarning: true
            })
          }, 1000)
        }
      }
      const realtimeWarningTechnical = (dataWarning, actionNotify, title, action) => {
        if (!title) return;
        if (title) {
          let noFile = title.includes('NO_FILE');
          if (noFile && !dataStorage.isWarning.isNotiTechnical) {
            dataStorage.isWarning.isNotiTechnical = true
            showWarningPopup();
            dataStorage.warningFunc && dataStorage.warningFunc()
          } else if (!noFile && dataStorage.isWarning.isNotiTechnical) {
            dataStorage.isWarning.isNotiTechnical = false;
            dataStorage.warningFunc && dataStorage.warningFunc();
            isShowCashNegative = 0;
          }
        }
      }
      let urlMappingAccount = makeMappingAccountlUrl(`?user_id=${dataStorage.userInfo.user_id}`);
      let response;
      await getData(urlMappingAccount).then(r => {
        response = r
      }).catch(err => {
        response = {}
        console.log(err)
      })
      const listData = response.data || []
      for (let i = 0, len = listData.length; i < len; i++) {
        const item = listData[i]
        if (!item.account_id) return;
        let urlTotalPosition = getUrlTotalPosition(item.account_id);
        let res;
        await getData(urlTotalPosition).then(r => {
          res = r
        }).catch(err => {
          res = {}
          console.log(err)
        })
        if (res.data && res.data.length !== 0) {
          if (res.data.available_balance_au < 0 && !dataStorage.isWarning.isNotiCashNegative) dataStorage.isWarning.isNotiCashNegative = true;
          if (res.data.status && !res.data.status.sod_cash && !dataStorage.isWarning.isNotiTechnical) dataStorage.isWarning.isNotiTechnical = true;
        }
      }
      showWarningPopup();
      dataStorage.warningFunc && dataStorage.warningFunc()
      registerWarningTechnicalStreaming(dataStorage.userInfo.user_id, realtimeWarningTechnical, 'SOD_SETTLEMENT_FILE');
    }
    if (!dataStorage.userInfo) {
      localStorageNew.removeItem('isStayLogin', true);
      window.location.reload();
    }

    registerUser(dataStorage.userInfo.user_id, (setting) => {
      dataStorage.dataSetting = Object.assign(dataStorage.dataSetting, setting);
      if (setting.lang && dataStorage.lang !== setting.lang) {
        setLanguage(setting.lang, dataStorage.i18n, true)
        console.log('change: ' + setting.lang)
      }
      if (setting && setting.hasOwnProperty('showPanelBuySell')) {
        if (setting.showPanelBuySell) {
          showPanel({
            component: BuySellPanel,
            props: {
              data: {}
            },
            custom: true
          });
        } else {
          let div = document.querySelector('.panelBuySell');
          if (div && div.parentNode) {
            div.parentNode.removeChild(div)
          }
        }
      }
      if (setting && setting.hasOwnProperty('checkQuickOrderPad')) {
        if (!setting.checkQuickOrderPad) {
          let div = document.querySelector('.panelBuySell');
          if (div && div.parentNode) {
            div.parentNode.removeChild(div)
          }
        } else {
          if (dataStorage.dataSetting.showPanelBuySell) {
            showPanel({
              component: BuySellPanel,
              props: {
                data: {}
              },
              custom: true
            });
          }
        }
      }

      if (setting && setting.hasOwnProperty('checkQuickOrderPad') && setting.checkQuickOrderPad) {
        const lst = dataStorage.goldenLayout.goldenLayout.root.getItemsByType('component');
        if (lst && lst.length) {
          let countOrder = 0;
          let compState = {};
          for (let i = 0; i < lst.length; i++) {
            if (lst[i].config.component === 'Order') {
              const componentState = lst[i].container.getState();
              if (componentState.stateOrder === 'NewOrder' || componentState.stateOrder === 'ModifyOrder' || (componentState.stateOrder === 'DetailOrder' && componentState.needConfirm)) {
                lst[i].parent.removeChild(lst[i]);
                countOrder++;
                compState = { ...componentState };
              }
            }
          }
          if (countOrder === 1) requirePin(() => dataStorage.goldenLayout.addComponentToStack('Order', compState));
          else if (countOrder > 1) requirePin(() => dataStorage.goldenLayout.addComponentToStack('Order', { stateOrder: 'NewOrder', data: { side: sideEnum.BUYSIDE } }));
        }
      }
      if (setting && setting.hasOwnProperty('requireTime')) {
        localStorageNew && localStorageNew.setItem(`requireTime_${dataStorage.loginEmail}`, setting.requireTime);
      }
    }, 'user_setting');

    if (dataStorage.userInfo && (!dataStorage.userInfo.status || (dataStorage.userInfo.status !== UserStatus.ACTIVE && dataStorage.userInfo.status !== UserStatus.PENDING_EMAIL_VERIFICATION))) {
      localStorageNew.removeItem('isStayLogin', true);
      warning({
        message: 'lang_force_logout',
        callback: () => {
          window.location.reload();
        }
      });
    }
    if (dataStorage.userInfo) {
      // dataStorage.mainMenuCallBack && dataStorage.mainMenuCallBack();
      registerUser(dataStorage.userInfo.user_id, (data, action, title, updateAction) => {
        //
        let watchlistRoot = dataStorage.watchlist
        if (action === actionTypeEnum.INSERT) {
          const index = watchlistRoot.findIndex(item => item.watchlist === data.watchlist)
          if (index < 0) watchlistRoot.push(data)
        } else if (action === actionTypeEnum.DELETE) {
          for (let i = 0; i < watchlistRoot.length; i++) {
            if (watchlistRoot[i].watchlist === data) {
              watchlistRoot.splice(i, 1);
              break;
            }
          }
        } else if (action === actionTypeEnum.UPDATE) {
          if (updateAction === 'add') {
            let filterWl = watchlistRoot.filter((item) => {
              return item.watchlist === data.watchlist
            })
            if (filterWl[0].value) {
              // if (filterWl[0].value[data.value[0]]) {
              filterWl[0].value.push(data.value[0])
              // }
            } else {
              filterWl[0].value = []
              filterWl[0].value.push(data.value[0])
            }
          } else if (updateAction === 'remove') {
            let indexFilterWl = watchlistRoot.findIndex((item) => {
              return item.watchlist === data.watchlist
            })
            if (indexFilterWl > -1) {
              let indexSymbol = watchlistRoot[indexFilterWl].value.findIndex((item) => {
                return item.symbol === data.value[0].symbol
              })
              if (indexFilterWl >= 0) {
                watchlistRoot[indexFilterWl].value.splice(indexSymbol, 1)
              }
            }
          } else {
            let indexFilterWl = watchlistRoot.findIndex((item) => {
              return item.watchlist === data.watchlist
            })
            Object.assign(watchlistRoot[indexFilterWl], data);
          }
        }
        dataStorage.watchlist = watchlistRoot
      }, 'user_watchlist');
      registerUser(dataStorage.userInfo.user_id, (dataNew, type, title) => {
        if (dataNew.user_id !== dataStorage.userInfo.user_id) return;
        if (!/#UPDATE$/.test(title)) return;
        preprocessUserDetailNoti(null, dataNew);
        function checkChange(key) {
          if (dataNew.hasOwnProperty(key)) {
            if (key === 'list_mapping') {
              return JSON.stringify(dataStorage.userInfo[key]) !== JSON.stringify(dataNew[key])
            }
            const oldData = dataStorage.userInfo[key];
            const diff = !!(oldData !== dataNew[key]);
            if (diff && key === 'addon') {
              dataStorage.userInfo.addon = dataNew.addon
              dataStorage.mainMenuCallBack && dataStorage.mainMenuCallBack();
            }
            return oldData !== dataNew[key]
          }
          return false;
        }
        if (checkChange('status') || checkChange('user_group')) {
          logout(true);
          dataStorage.isLoggingOut = true
          consfirm({
            message: 'lang_force_logout',
            callback: () => {
              setTimeout(() => {
                if (localStorageNew.getItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : ''))) localStorageNew.removeItem('countFailedPIN' + (dataStorage.loginEmail ? dataStorage.loginEmail : ''))
                window.location.reload();
              }, 1000)
            }
          })
        }
        if (checkChange('addon') ||
          checkChange('access_method') ||
          checkChange('role_group') ||
          checkChange('user_type') ||
          checkChange('list_mapping') ||
          checkChange('advisor_code') ||
          checkChange('branch_code') ||
          checkChange('organisation_code') ||
          dataNew.errorCode === 'INVALID_PARAMS') {
          if (!dataStorage.isLoggingOut) {
            dataStorage.accessToken = null;
            consfirm({
              message: 'lang_force_reload_message',
              callback: () => {
                window.location.reload();
              }
            })
          }
        }
        Object.assign(dataStorage.userInfo, dataNew);
      }, 'USER_DETAIL');

      registerUser(dataStorage.userInfo.user_id, data => {
        if (dataStorage.isChangePassword) {
          dataStorage.isChangePassword = false
          return
        }
        if (data) {
          localStorageNew.removeItem('isStayLogin', true);
          warning({
            message: 'lang_force_logout_change_password',
            callback: () => {
              window.location.reload();
            }
          });
        }
      }, 'user_reset_password');
      if (dataStorage.env_config.roles.useNewMarketData) {
        registerUser(dataStorage.userInfo.user_id, obj => {
          checkShowAccessModal(obj.data)
        }, 'MARKET_DATA_AGREEMENT');

        registerUser(dataStorage.userInfo.user_id, obj => {
          clearCurSessionPopup()
          checkShowAccessModal(obj.data, true)
        }, 'MARKET_DATA_UPDATE');
      }

      if (dataStorage.userInfo.role_group) {
        const url = getUserGroupUrl(dataStorage.userInfo.role_group);
        await getData(url)
          .then(res => {
            if (res.data && res.data.data && res.data.data.length && res.data.data[0].list_role) {
              if (res.data.data[0].group_name) {
                dataStorage.userInfo.group_name = res.data.data[0].group_name
              }
              res.data.data[0].list_role.map(roleName => {
                if (roleName && roleName.includes('LAYOUT')) {
                  dataStorage.layout_role = roleName;
                }
                userRoles[roleName] = true;
              })
            }
          })
          .catch(error => {
            logger.error(error);
          });
      }
    }
    if (dataStorage.userInfo && dataStorage.userInfo.user_id) {
      if (dataStorage.userInfo.user_type !== role.OPERATION) await getLstAccountAfterLogin();
      dataStorage.dataSetting = {}
      await getDataSetting().then(response => {
        if (!response) return;
        const setting = response.data || {};
        // dataStorage.timeZone = setting.timezone
        dataStorage.timeZone = 'Australia/Sydney'
        dataStorage.allowCloseAllWidgets = false // setting.allowCloseAllWidgets
        dataStorage.hideTermsForm = setting.hideTermsForm;
        dataStorage.dataSetting = setting;
        localStorageNew && localStorageNew.setItem(`requireTime_${dataStorage.loginEmail}`, setting.requireTime);
        if (dataStorage.dataSetting.checkQuickOrderPad && dataStorage.dataSetting.showPanelBuySell) {
          showPanel({
            component: BuySellPanel,
            props: {
              data: {}
            },
            custom: true
          });
        }
        if (setting.lang) {
          dataStorage.lang = setting.lang;
          dataStorage.deviceLang = {
            'cn': 'zh_CN',
            'en': 'en_US',
            'vi': 'vi_VN'
          }[setting.lang];
          localStorageNew.setItem('lastLang', setting.lang, true);
          dataStorage.currentLang = setting.lang
        } else {
          if (localStorageNew.getItem('lastLang', true)) {
            dataStorage.lang = localStorageNew.getItem('lastLang', true);
          } else {
            const userLang = navigator.language || navigator.userLanguage || '';
            if (userLang) {
              let lang = userLang.slice(0, 2);
              if (lang && ['zh', 'ZH'].includes(lang)) {
                lang = 'cn';
              }
              dataStorage.lang = lang || 'en';
            } else {
              dataStorage.lang = 'en';
            }
          }
          saveDataSetting({
            data: {
              lang: dataStorage.lang
            }
          }).then(() => {
            logger.log('save new lang for user success')
          })
          dataStorage.deviceLang = {
            'cn': 'zh_CN',
            'en': 'en_US',
            'vi': 'vi_VN'
          }[dataStorage.lang];
        }
        dataStorage.onChangeLang && dataStorage.onChangeLang()
        dataStorage.onChangeTime && dataStorage.onChangeTime()
        setNotifyConfig(setting);
      }).catch(() => { })
      await getInitLayout();
    }
    setTimeout(() => {
      if (!dataStorage.hideTermsForm) {
        showModal({
          component: Terms,
          props: {
            name: 'TermsAndConditions'
          }
        });
      }
    }, 2500);
    let listAccount = [];
    if (dataStorage.userInfo) {
      if (dataStorage.userInfo.user_type === role.OPERATION) {
        registerAccountStreaming(true, null, 'order', true); // don't need callback, only register to show notification
      } else {
        const getListData = (stringData) => {
          if (!stringData) return [];
          const newStringAppend = stringData + '';
          const listMapping = newStringAppend.split(',');
          const listReturn = [];
          for (let t = 0; t < listMapping.length; t++) {
            const accId = listMapping[t];
            if (accId) {
              const listSplit = accId.split('.');
              const accountAdd = (listSplit[listSplit.length - 1] + '').trim()
              accountAdd && listReturn.push(accountAdd);
            }
          }
          return listReturn;
        }
        listAccount = getListData(dataStorage.userInfo.list_mapping);
        const listAdvisor = getListData(dataStorage.userInfo.advisor_code);
        const listBranch = getListData(dataStorage.userInfo.branch_code);
        const listOrg = getListData(dataStorage.userInfo.organisation_code);

        let appendText = '';
        dataStorage.listMapping = listAccount;
        if (listAccount.length > 0) {
          appendText += `${appendText.length > 0 ? '&' : ''}account=${listAccount.join(',')}`;
        }
        if (listAdvisor.length > 0) {
          appendText += `${appendText.length > 0 ? '&' : ''}advisor_code=${listAdvisor.join(',')}`;
        }
        if (listBranch.length > 0) {
          appendText += `${appendText.length > 0 ? '&' : ''}branch_code=${listBranch.join(',')}`;
        }
        if (listOrg.length > 0) {
          appendText += `${appendText.length > 0 ? '&' : ''}organisation_code=${listOrg.join(',')}`;
        }
        if (appendText) {
          registerAccountStreaming(appendText, null, 'order'); // don't need callback, only register to show notification
        }
      }
      if (dataStorage.userInfo.user_type === role.RETAIL && !dataStorage.openingAccount) {
        if (dataStorage.env_config.env === 'demo') {
          dataStorage.goldenLayout.switchLiveBtn && dataStorage.goldenLayout.switchLiveBtn.classList.add('show')
        } else {
          const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
          const url = getAllAccountNewUrl(userId)
          getData(url).then(res => {
            const a = res
            if (res.data.data) {
              dataStorage.goldenLayout.alertNoAccount.classList.remove('show')
            } else {
              if (dataStorage.env_config.roles.openingAccount && checkRole(MapRoleComponent.OPENING_ACCOUNT)) {
                dataStorage.goldenLayout.alertNoAccount.classList.add('show')
              }
            }
          }).catch(error => {
            console.log('==>', error)
          })
        }
      }
      registerAllOrders((data, data1, title) => {
        if (!/^ROLEGROUP/.test(title)) return;
        let roleGroupId = data.data.role_group_id || ''
        if (roleGroupId === dataStorage.userInfo.role_group) {
          if (!dataStorage.isLoggingOut) {
            dataStorage.accessToken = null;
            consfirm({
              message: 'lang_force_reload_message',
              callback: () => {
                window.location.reload();
              }
            })
          }
        }
      }, 'ROLEGROUP');
      await getDefaultAccountInListMapping();
    }
    if (dataStorage.userInfo && dataStorage.env_config.roles.useNewMarketData) {
      const url = getUserDetailUrl('market-data?user_id=' + dataStorage.userInfo.user_id)
      await getData(url).then(res => {
        dataStorage.userInfo.data = res.data[0].data
        checkShowAccessModal(dataStorage.userInfo.data)
      }).catch(error => {
        logger.log('get marketData:', error)
      })
    }

    registerUser(dataStorage.userInfo.user_id, (data = {}) => {
      if (data.device_id === localStorageNew.getItem('session_id')) return
      const isShow = localStorageNew.getItem('showed_session_popup')
      if (isShow === 'true') return
      data.device_id && localStorageNew.setItem('last_session_id', data.device_id)
      dataStorage.goldenLayout.alertSession.classList.add('show')
      setTimeout(() => {
        dataStorage.goldenLayout.goldenLayout && dataStorage.goldenLayout.goldenLayout.updateSize()
      }, 1000)
      consfirm({
        className: 'sessionPopup',
        navbar: 'lang_another_session_login',
        title: 'lang_another_session_login_alert',
        subTitle: 'lang_change_password_alert',
        confirmText: 'lang_relogin_now',
        btnTextClass: 'size--3',
        callback: () => {
          logout(null, true)
        },
        closeCallBack: () => {
          clearPrice()
        }
      })
      localStorageNew.setItem('showed_session_popup', 'true')
      const userMarketData = dataStorage.userInfo.data || []
      for (let index = 0; index < userMarketData.length; index++) {
        const element = userMarketData[index];
        if (element.market_data_type === marketDataType.streaming) {
          element.market_data_type = marketDataType.noAccess
        }
      }
      checkShowAccessModal(userMarketData)
    }, 'REALTIME_LATEST_DEVICE_ID');

    dataStorage.displayRole = getDisplayRole();
    if (dataStorage.headerCallBack) dataStorage.headerCallBack();
    if (dataStorage.footerCallBack) dataStorage.footerCallBack();
    if (dataStorage.mainMenuCallBack) dataStorage.mainMenuCallBack();
    removeQuickmenu();
    callback && callback();
    dispatchEvent(EVENTNAME.loginChanged);
  } catch (error) {
    callbackError && callbackError();
    logger.error('afterLogin Error: ', error);
  }
}
