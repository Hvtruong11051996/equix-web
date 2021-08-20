import GoldenLayoutWrapper from '../../src/components/GoldenLayoutWrapper';
import { Provider } from 'react-redux';
import configureStore from '../../src/store/configureStore';
import * as request from '../../src/helper/request';
import * as api from '../../src/helper/api';
import * as func from '../../src/helper/functionUtils';
import * as loginFunc from '../../src/helper/loginFunction';
import * as modal from '../../src/components/Inc/Modal';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react'
import dataStorage from '../../src/dataStorage'
import config from '../../src/config';
import { exception } from 'react-ga';
import logger from '../../src/helper/log';
dataStorage.translate = () => { };
dataStorage.userInfo = { 'user_id': 'eq1554351692610', 'user_login_id': 'anh.nguyen@quant-edge.com', 'full_name': 'Nguyễn Minh Quang', 'email': 'minhquang.nguyen@quant-edge.com', 'phone': '+61 123456789', 'access_method': 0, 'role_group': 'RG1564474145532', 'status': 2, 'verify': 1, 'actor': 'anh.nguyen@quant-edge.com', 'updated': 1573525830031, 'list_mapping': null, 'change_password': 0, 'new_email': 'minhquang.nguyen@quant-edge.com', 'user_type': 'operation', 'complete_signup': 1, 'email_template': 'E4', 'organisation_code': null, 'branch_code': null, 'advisor_code': null, 'note': null, 'market_data_au': 3, 'market_data_us': 0, 'user_group': 2, 'addon': 'A0,A1,A2', 'live_news': 1, 'market_data_type': 3, 'email_alert': 'anh.nguyen@quant-edge.com', 'market_data_fu': 0 }
const store = configureStore();

global.MutationObserver = class {
  disconnect() { }
  observe(element, initObject) { }
};

class Wraper extends React.Component {
  constructor(props) {
    super(props);
    let lastTheme = 'theme-dark';
    const getTextError = (obj) => {
      let stringReturn = '';
      if (typeof obj === 'object') {
        stringReturn += ` ${(function(obj) {
          try {
            const seen = [];
            return JSON.stringify(obj, function(key, val) {
              if (val != null && typeof val === 'object') {
                if (seen.indexOf(val) >= 0) {
                  return;
                }
                seen.push(val);
              }
              return val;
            });
          } catch (e) {
            return 'can not log here';
          }
        })(obj)}`;
      } else if (typeof obj === 'string') {
        stringReturn = ` ${obj}`
      }
      return stringReturn;
    }

    if (console) {
      var cssRule =
        'color: rgb(249, 162, 34);' +
        'font-size: 60px;' +
        'font-weight: bold;' +
        'text-shadow: 1px 1px 5px rgb(249, 162, 34);' +
        'filter: dropshadow(color=rgb(249, 162, 34), offx=1, offy=1);';
      console.log('%cSTOP!', cssRule);

      // console.log = () => {
      //     return true;
      // }
      // console.info = () => {
      //     return true
      // }
      // console.warn = () => {
      //     return true
      // }
      window.localStorageNew = {};
      localStorageNew.clear = () => {
        localStorage.clear()
      };
      const lastEmail = config.guestApiAccount.username
      lastTheme = localStorage.getItem('lastTheme') || 'theme-dark'
      dataStorage.theme = lastTheme;
      localStorageNew.removeItem = (key, isNotOverride) => {
        let newKey = key;
        if (!key.includes('newUniqueKey_') && !isNotOverride) {
          const email = dataStorage.loginEmail || lastEmail;
          let isDemo;
          if (dataStorage.hasOwnProperty('isDemo')) isDemo = dataStorage.isDemo;
          else isDemo = localStorage.getItem('isDemo') === 'true';
          const enviroment = isDemo ? 'demo' : 'notdemo';
          newKey = 'newUniqueKey' + '_' + email + '_' + enviroment + '_' + key;
        }
        localStorage.removeItem(newKey);
      }
      localStorageNew.setItem = (key, val, isNotOverride) => {
        let newKey = key;
        if (!key.includes('newUniqueKey_') && !isNotOverride) {
          const email = dataStorage.loginEmail || lastEmail;
          let isDemo;
          if (dataStorage.hasOwnProperty('isDemo')) isDemo = dataStorage.isDemo;
          else isDemo = localStorage.getItem('isDemo') === 'true';
          const enviroment = isDemo ? 'demo' : 'notdemo';
          newKey = 'newUniqueKey' + '_' + email + '_' + enviroment + '_' + key;
          localStorage.removeItem(key);
        }
        localStorage.setItem(newKey, val)
      }
      localStorageNew.getItem = (key, isNotOverride) => {
        if (isNotOverride) {
          return localStorage.getItem(key)
        }
        let newKey = key;
        const email = dataStorage.loginEmail || lastEmail;
        let isDemo;
        if (dataStorage.hasOwnProperty('isDemo')) isDemo = dataStorage.isDemo;
        else isDemo = localStorage.getItem('isDemo') === 'true';
        const enviroment = isDemo ? 'demo' : 'notdemo';
        const newKey2 = 'newUniqueKey' + '_' + email + '_' + enviroment + '_' + key;
        const newValue = localStorage.getItem(newKey2);
        if (newValue) return newValue !== 'null' ? newValue : null;
        if (!key.includes('newUniqueKey_') && !isNotOverride) {
          let value = localStorage.getItem(key);
          if (value === 'null') value = null;
          newKey = newKey2;
          localStorage.setItem(newKey, value)
          localStorage.removeItem(key);
        }
        return localStorage.getItem(newKey) !== 'null' ? localStorage.getItem(newKey) : null
      }
      const errorConsole = console.error;
      console.error = (...arg) => {
        let stringReturn = 'Exception Error: '
        if (Array.isArray(arg)) {
          for (let index = 0; index < arg.length; index++) {
            const element = arg[index];
            stringReturn += getTextError(element);
          }
        } else {
          stringReturn += getTextError(arg);
        }
        // logger.error(
        exception({
          description: stringReturn,
          fatal: true
        });
        logger.sendLogError(stringReturn);
        errorConsole && errorConsole(...arg);
      }
      dataStorage.loginEmail = 'anh.nguyen';
      localStorage.setItem('loginEmail', 'anh.nguyen');
      localStorage.setItem('isStayLogin', 'true');
      localStorageNew.setItem(`anh.nguyen_refresh_token`, '123456789123456789');
    }

    window.jQuery = require('jquery');
    window.$ = window.jQuery;
  }
  render() {
    return <Provider store={store}>
      <GoldenLayoutWrapper />
    </Provider>
  }
}
test('refreshData', () => {
  jest.spyOn(func, 'getDataLayout')
    .mockImplementation(() => new Promise(resolve => {
      resolve({
        data: {
          layout: '[{"type":"stack","isClosable":true,"reorderEnabled":true,"title":"","activeItemIndex":0,"content":[{"type":"component","component":"SecurityDetail","componentName":"lm-react-component","isClosable":true,"reorderEnabled":true,"title":"SecurityDetail","componentState":{"openFromMenu":true,"symbol":{"symbol":"ANZ","class":"equity","code":"ANZ","display_name":"ANZ.ASX","company":"ANZ BANK FPO","status":"active","exchanges":["ASX"],"country":"AU","contract_unit":null,"contract_months":null,"listing_date":null,"min_price_movement":null,"last_trading_day":null,"cash_settlement_price":null,"trading_hours":null,"settlement_day":null,"position_limit":null,"daily_price_limit":null,"cftc_approved":null,"updated":"2019-08-25T22:30:33.000Z","company_name":"ANZ BANK FPO","GICS_industry_group":"Banks","list_trading_market":["ASX:ASX","N:CXA","CXA:CXACP","N:qCXA","N:BESTMKT","N:FIXED CO"],"trading_halt":0,"currency":"AUD","ISIN":"AU000000ANZ3","display_exchange":"ASX","last_halt":null,"last_haltlift":null,"type":0,"display_master_code":null,"display_master_name":null,"master_code":null,"master_name":null,"expiry_date":null,"first_noti_day":null,"security_name":null,"origin_symbol":"ANZ"},"color":0,"data":{"symbol":"ANZ"}}}]}]'
        }
      })
    }));
  // jest.spyOn(api, 'postDecode')
  //   .mockImplementation(() => new Promise(resolve => {
  //     resolve({
  //       data: {}
  //     })
  //   }));
  api.postDecode = () => new Promise(resolve => {
      resolve({
        data: {}
      })
    });
  api.postRefreshWithoutPin = (token, cb) => {
    cb && cb()
  };
  loginFunc.afterLogin = cb => cb && cb()
  // jest.mock('../../src/components/Inc/Modal', (obj) => {
  //   obj && obj.props && obj.props.success && obj.props.success('123');
  // });
  render(<Wraper />)
})
