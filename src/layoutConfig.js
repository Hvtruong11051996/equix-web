import dataStorage from './dataStorage';
import env from './constants/enviroments'
import role from './constants/role';

const objLayout = {
  LAYOUT_0: null,
  LAYOUT_1: null,
  LAYOUT_2: null,
  LAYOUT_3: null,
  LAYOUT_4: null,
  LAYOUT_5: null,
  LAYOUT_6: null,
  LAYOUT_7: null,
  LAYOUT_8: null,
  LAYOUT_9: null,
  LAYOUT_10: null,
  LAYOUT_11: null,
  LAYOUT_12: null,
  LAYOUT_13: null,
  LAYOUT_14: null,
  LAYOUT_16: null,
  LAYOUT_15: null
}

const init = () => {
  const getDefaultLayoutAfterLogin = (percentHeightTop = 40, percentWidth = 20) => {
    return [
      {
        'type': 'row',
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'content': [
          {
            'type': 'column',
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'width': percentWidth,
            'content': [
              {
                'type': 'stack',
                'width': 20,
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': percentHeightTop,
                'content': [
                  {
                    'type': 'component',
                    'component': 'MarketOverview',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_market_overview'
                  }
                ]
              },
              {
                'type': 'stack',
                'header': {},
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': 100 - percentHeightTop,
                'content': [
                  {
                    'type': 'component',
                    'component': 'WatchlistBottom',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_watchlist',
                    'componentState': {
                    }
                  }
                ]
              }
            ]
          },
          {
            'type': 'row',
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'width': 100 - percentWidth * 2,
            'content': [
              {
                'type': 'stack',
                'header': {},
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': 100,
                'width': 100,
                'content': [
                  {
                    'type': 'component',
                    'component': 'ChartTV',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_chart',
                    'componentState': {
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'Portfolio',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_portfolio_holding'
                  },
                  {
                    'type': 'component',
                    'component': 'MorningStar',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_morning_star'
                  },
                  {
                    'type': 'component',
                    'component': 'Order',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_new_order',
                    'componentState': {
                      'stateOrder': 'NewOrder',
                      'color': 5
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'TipRank',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_tip_rank'
                  },
                  {
                    'type': 'component',
                    'component': 'OrderList',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_orders'
                  },
                  {
                    'type': 'component',
                    'component': 'MarketDepth',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_market_depth'
                  }
                ]
              }
            ]
          },
          {
            'type': 'column',
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'width': percentWidth,
            'content': [
              {
                'type': 'stack',
                'header': {},
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': percentHeightTop,
                'width': percentWidth,
                'content': [
                  {
                    'type': 'component',
                    'component': 'RelatedNews',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_market_news'
                  }
                ]
              },
              {
                'type': 'stack',
                'header': {},
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': 100 - percentHeightTop,
                'content': [
                  {
                    'type': 'component',
                    'component': 'PortfolioSummary',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_portfolio_summary'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }

  const getStaffDefaultLayout = (percentHeightTop = 40, percentWidth = 20) => {
    return [
      {
        'type': 'row',
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'width': 100,
        'content': [
          {
            'type': 'stack',
            'header': {},
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'activeItemIndex': 0,
            'height': 100,
            'width': 100 - percentWidth,
            'content': [
              {
                'type': 'component',
                'component': 'Portfolio',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_portfolio_holding',
                'componentState': {
                  'showLoading': false,
                  'color': 0,
                  'account': {},
                  'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":117,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":293,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":86,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"market_price","hide":false,"aggFunc":null,"width":89,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"average_price","hide":false,"aggFunc":null,"width":88,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value_aud","hide":false,"aggFunc":null,"width":126,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value_convert","hide":false,"aggFunc":null,"width":139,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_val","hide":false,"aggFunc":null,"width":120,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_percent","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"upnl","hide":false,"aggFunc":null,"width":101,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"profit_percent","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                }
              },
              {
                'type': 'component',
                'component': 'UserManager',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_user_manager',
                'componentState': {
                  'showLoading': false,
                  'color': 5,
                  'colState': '[{"colId":"user_id","hide":false,"aggFunc":null,"width":140,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"user_login_id","hide":false,"aggFunc":null,"width":216,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"full_name","hide":false,"aggFunc":null,"width":216,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"user_type","hide":false,"aggFunc":null,"width":117,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"role_group","hide":false,"aggFunc":null,"width":171,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"user_group","hide":false,"aggFunc":null,"width":114,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"access_method","hide":false,"aggFunc":null,"width":239,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"status","hide":false,"aggFunc":null,"width":93,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"email_template","hide":false,"aggFunc":null,"width":216,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"live_news","hide":false,"aggFunc":null,"width":89,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"morningStar","hide":false,"aggFunc":null,"width":108,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"tipRank","hide":false,"aggFunc":null,"width":86,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"email","hide":false,"aggFunc":null,"width":115,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"phone","hide":false,"aggFunc":null,"width":115,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"list_mapping","hide":false,"aggFunc":null,"width":107,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"note","hide":false,"aggFunc":null,"width":70,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actor","hide":false,"aggFunc":null,"width":70,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"updated","hide":false,"aggFunc":null,"width":102,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"action","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                }
              }
            ]
          },
          {
            'type': 'stack',
            'header': {},
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'activeItemIndex': 0,
            'width': percentWidth,
            'content': [
              {
                'type': 'component',
                'component': 'AccountDetailNew',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_account_detail',
                'componentState': {
                  'showLoading': false,
                  'color': 0,
                  'account': {}
                }
              },
              {
                'type': 'component',
                'component': 'PortfolioSummary',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_portfolio_summary',
                'componentState': {
                  'showLoading': false,
                  'color': 0,
                  'account': {}
                }
              }
            ]
          }
        ]
      }
    ]
  }

  const getOperatorDTRDefaultLayoutMuda = (percentHeightTop = 40, percentWidth = 20) => {
    return [
      {
        'type': 'row',
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'content': [
          {
            'type': 'stack',
            'header': {

            },
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'activeItemIndex': 0,
            'width': 27.30446927374301,
            'content': [
              {
                'type': 'component',
                'component': 'CreateUser',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_create_user',
                'componentState': {
                  'color': 5,
                  'dataForm': {
                    'full_name': '',
                    'user_login_id': '',
                    'phone': '',
                    'email_template': 'E1',
                    'access_method': 0,
                    'api_access': 0,
                    'user_group': 0,
                    'role_group': 'RG0',
                    'status': 2,
                    'password': '',
                    'manage': 'lang_immutable_manage',
                    'list_mapping': [

                    ],
                    'note': ''
                  }
                }
              }
            ]
          },
          {
            'type': 'stack',
            'width': 72.69553072625698,
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'activeItemIndex': 0,
            'content': [
              {
                'type': 'component',
                'component': 'AccountManager',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_account_man',
                'componentState': {
                  'color': 0,
                  'colState': '[{"name":"branch_code"},{"name":"account_id"},{"name":"account_name"},{"name":"account_group"},{"name":"margin_flag"},{"name":"saxo_account_id"},{"name":"saxo_account_number"},{"name":"last_update"},{"name":"email"},{"name":"hin"},{"name":"advisor_code"},{"name":"account_type"},{"name":"organisation_code"},{"name":"advisor_name"},{"name":"date_created"},{"name":"status","filter":{"filter":["active"],"type":"in"}},{"name":"cqg_account_status"},{"name":"pid"},{"name":"cross_reference"},{"name":"client_type"},{"name":"warrants_trading"},{"name":"options_trading"},{"name":"international_trading"},{"name":"equities_brokerage_schedule"},{"name":"options_brokerage_schedule"},{"name":"bank_institution_code"},{"name":"bsb","hide":true},{"name":"bank_account_number","hide":true},{"name":"bank_account_name","hide":true},{"name":"bank_transaction_type"},{"name":"account_designation"},{"name":"contractnote_email_address"},{"name":"work_phone"},{"name":"mobile_phone"},{"name":"home_phone"},{"name":"address_line_1"},{"name":"address_line_2"},{"name":"address_line_3"},{"name":"address_line_4"},{"name":"post_code"},{"name":"country_code"}]',
                  'valueFilter': ''
                }
              },
              {
                'type': 'component',
                'component': 'UserManager',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_user_manager',
                'componentState': {
                  'color': 5,
                  'colState': '[{"name":"user_id"},{"name":"user_login_id"},{"name":"full_name"},{"name":"user_type"},{"name":"role_group"},{"name":"user_group"},{"name":"access_method"},{"name":"status"},{"name":"email_template"},{"name":"live_news"},{"name":"morningStar"},{"name":"brokerData"},{"name":"email"},{"name":"phone"},{"name":"list_mapping"},{"name":"note"},{"name":"actor"},{"name":"updated"},{"name":"action"}]',
                  'valueFilter': ''
                }
              },
              {
                'type': 'component',
                'component': 'UserGroupManagement',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_roles_management',
                'componentState': {
                  'color': 5,
                  'colState': '[{"name":"role_group","groupIndex":1},{"name":"description"},{"name":"RG0"},{"name":"RG1"},{"name":"RG2"},{"name":"RG3"},{"name":"RG4"},{"name":"RG5"},{"name":"RG1605679752518"},{"name":"RG1605768207091"}]',
                  'valueFilter': ''
                }
              },
              {
                'type': 'component',
                'component': 'BranchManagement',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_vetting_rules_man',
                'componentState': {
                  'color': 5,
                  'sortState': '[{"colId":"market_type","sort":"desc"},{"colId":"rule","sort":"asc"}]',
                  'colState': '[{"colId":"market_type","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":0},{"colId":"rule","hide":false,"aggFunc":null,"width":79,"pivotIndex":null,"pinned":null,"rowGroupIndex":1},{"colId":"conditional_rule","hide":false,"aggFunc":null,"width":465,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"validate","hide":false,"aggFunc":null,"width":342,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"DEFAULT VETTING RULES","hide":false,"aggFunc":null,"width":335,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"THAO CUTE","hide":false,"aggFunc":null,"width":195,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                }
              },
              {
                'type': 'component',
                'component': 'MarketDataManagement',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_market_data_man',
                'componentState': {
                  'color': 5
                }
              }
            ]
          }
        ]
      }
    ]
  }
  const getOperatorDTRDefaultLayout = (percentHeightTop = 40, percentWidth = 20) => {
    return [
      {
        'type': 'row',
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'content': [
          {
            'type': 'stack',
            'header': {},
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'activeItemIndex': 0,
            'height': 100,
            'width': 100 - percentWidth,
            'content': [
              {
                'type': 'component',
                'component': 'OrderList',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_orders',
                'componentState': {
                  'showLoading': false,
                  'color': 0,
                  'account': {},
                  'valFilter': [
                    'WORKING_',
                    'STOPLOSS_',
                    'FILLED_',
                    'CANCELLED_'
                  ],
                  'colState': '[{"colId":"init_time","hide":false,"aggFunc":null,"width":138,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"display_name","hide":false,"aggFunc":null,"width":123,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":356,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actionOrder","hide":false,"aggFunc":null,"width":108,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"order_status","hide":false,"aggFunc":null,"width":108,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"advisor_code","hide":false,"aggFunc":null,"width":108,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_id","hide":false,"aggFunc":null,"width":96,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_name","hide":false,"aggFunc":null,"width":156,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"side","hide":false,"aggFunc":null,"width":75,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"quantity","hide":false,"aggFunc":null,"width":86,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"filled_quantity","hide":false,"aggFunc":null,"width":70,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"limit_price","hide":false,"aggFunc":null,"width":94,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"stop_price","hide":false,"aggFunc":null,"width":93,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"filled_price","hide":false,"aggFunc":null,"width":100,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"order_type","hide":false,"aggFunc":null,"width":96,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"duration","hide":false,"aggFunc":null,"width":86,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_order_id","hide":false,"aggFunc":null,"width":120,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"condition_name","hide":false,"aggFunc":null,"width":91,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"est_fees_aud","hide":false,"aggFunc":null,"width":112,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"order_action","hide":false,"aggFunc":null,"width":119,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"exchange","hide":false,"aggFunc":null,"width":90,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                }
              },
              {
                'type': 'component',
                'component': 'Portfolio',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_portfolio_holding',
                'componentState': {
                  'showLoading': false,
                  'color': 0,
                  'account': {},
                  'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":138,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":269,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actionOrder","hide":false,"aggFunc":null,"width":92,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":78,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"market_price","hide":false,"aggFunc":null,"width":82,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"average_price","hide":false,"aggFunc":null,"width":72,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"upnl","hide":false,"aggFunc":null,"width":89,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"profit_percent","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value_aud","hide":false,"aggFunc":null,"width":126,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value_convert","hide":false,"aggFunc":null,"width":139,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_val","hide":false,"aggFunc":null,"width":120,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_percent","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                }
              },
              {
                'type': 'component',
                'component': 'AllOrders',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_all_Orders',
                'componentState': {
                  'showLoading': false,
                  'color': 5,
                  'colState': '[{"colId":"init_time","hide":false,"aggFunc":null,"width":60,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"order_status","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"advisor_code","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_id","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_name","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_name","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"side","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"quantity","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"filled_quantity","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"limit_price","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"stop_price","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"filled_price","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"order_type","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"duration","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_order_id","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"condition_name","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"est_fees_aud","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"order_action","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"exchange","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actionOrder","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                }
              },
              {
                'type': 'component',
                'component': 'ContractNote',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_contract_notes',
                'componentState': {
                  'showLoading': false,
                  'color': 0,
                  'account': {}
                }
              }
            ]
          },
          {
            'type': 'stack',
            'header': {},
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'activeItemIndex': 0,
            'width': percentWidth,
            'content': [
              {
                'type': 'component',
                'component': 'Order',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_new_order',
                'componentState': {
                  'showLoading': false,
                  'stateOrder': 'NewOrder',
                  'data': {
                    'side': 'BUY'
                  },
                  'color': 5
                }
              }
            ]
          }
        ]
      }
    ]
  }

  const getTradingFutureDefaultLayout = (percentHeightTop = 40, percentWidth = 20) => {
    return [
      {
        'type': 'row',
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'content': [
          {
            'type': 'column',
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'width': 23.420865862313697,
            'content': [
              {
                'type': 'stack',
                'width': 20,
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': 40,
                'content': [
                  {
                    'type': 'component',
                    'component': 'MarketOverview',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_market_overview',
                    'componentState': {
                      'showLoading': false,
                      'color': 0,
                      'colState': '[{"colId":"company_name","hide":false,"aggFunc":null,"width":119,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":84,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":91,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":71,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":false,"aggFunc":null,"width":96,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":true,"aggFunc":null,"width":69,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
                      'colStatesecond': '[{"colId":"symbol","hide":false,"aggFunc":null,"width":155,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":132,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                    }
                  }
                ]
              },
              {
                'type': 'stack',
                'header': {},
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': 60,
                'content': [
                  {
                    'type': 'component',
                    'component': 'WatchlistBottom',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_watchlist',
                    'componentState': {
                      'showLoading': false,
                      'color': 0,
                      'sortState': '[{"colId":"display_name","sort":"asc"}]',
                      'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":131,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":78,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":82,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":76,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":88,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_price","hide":false,"aggFunc":null,"width":104,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":false,"aggFunc":null,"width":84,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":false,"aggFunc":null,"width":84,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":false,"aggFunc":null,"width":84,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":false,"aggFunc":null,"width":84,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"Yesterday_settlement_price","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":101,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_size","hide":false,"aggFunc":null,"width":79,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_size","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_size","hide":false,"aggFunc":null,"width":91,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":false,"aggFunc":null,"width":103,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"rank","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"expiry_date","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"symbol","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"master_name","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_master_code","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"class","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actionOrder","hide":false,"aggFunc":null,"width":130,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
                      'initName': 'Favorites',
                      'selectedLayout': 'user-watchlist',
                      'filterState': '{}'
                    }
                  }
                ]
              }
            ]
          },
          {
            'type': 'row',
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'width': 76.5081618168914,
            'content': [
              {
                'type': 'stack',
                'header': {},
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': 100,
                'width': 69.1588785046729,
                'content': [
                  {
                    'type': 'component',
                    'component': 'ChartTV',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_chart',
                    'componentState': {
                      'showLoading': false,
                      'color': 0
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'MarketDepth',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_market_depth',
                    'componentState': {
                      'showLoading': false,
                      'color': 0,
                      'sortState': '[{"colId":"index","sort":"asc"}]',
                      'colState': '[{"colId":"timeFormat","hide":false,"aggFunc":null,"width":89,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"quantity","hide":false,"aggFunc":null,"width":122,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"price","hide":false,"aggFunc":null,"width":164,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"index","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'RelatedNews',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_market_news',
                    'componentState': {
                      'showLoading': false,
                      'color': 0,
                      'colState': '[{"colId":"updated_1","hide":false,"aggFunc":null,"width":71,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"updated","hide":false,"aggFunc":null,"width":96,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"symbol","hide":false,"aggFunc":null,"width":138,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"type_news","hide":false,"aggFunc":null,"width":192,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"title","hide":false,"aggFunc":null,"width":393,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"page_count","hide":false,"aggFunc":null,"width":86,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'Order',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_new_order',
                    'componentState': {
                      'stateOrder': 'NewOrder',
                      'color': 5
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'OrderList',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_orders',
                    'componentState': {
                      'showLoading': false,
                      'color': 0,
                      'account': {},
                      'valFilter': [
                        'WORKING_',
                        'STOPLOSS_',
                        'FILLED_',
                        'CANCELLED_'
                      ],
                      'colState': '[{"colId":"init_time","hide":false,"aggFunc":null,"width":142,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actionOrder","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"side","hide":false,"aggFunc":null,"width":75,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"order_status","hide":false,"aggFunc":null,"width":96,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_name","hide":false,"aggFunc":null,"width":118,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"order_type","hide":false,"aggFunc":null,"width":80,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"quantity","hide":false,"aggFunc":null,"width":67,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"limit_price","hide":false,"aggFunc":null,"width":78,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"filled_price","hide":false,"aggFunc":null,"width":83,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"filled_quantity","hide":false,"aggFunc":null,"width":70,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"stop_price","hide":false,"aggFunc":null,"width":93,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":193,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"est_fees_aud","hide":false,"aggFunc":null,"width":112,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"order_action","hide":false,"aggFunc":null,"width":119,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"condition_name","hide":false,"aggFunc":null,"width":91,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"duration","hide":false,"aggFunc":null,"width":86,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_name","hide":false,"aggFunc":null,"width":156,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"advisor_code","hide":false,"aggFunc":null,"width":108,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_id","hide":false,"aggFunc":null,"width":96,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_order_id","hide":false,"aggFunc":null,"width":120,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"exchange","hide":false,"aggFunc":null,"width":90,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
                      'sortState': '[]'
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'Portfolio',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_portfolio_holding',
                    'componentState': {
                      'color': 0,
                      'account': {},
                      'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":148,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actionOrder","hide":false,"aggFunc":null,"width":92,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":91,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"market_price","hide":false,"aggFunc":null,"width":94,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"average_price","hide":false,"aggFunc":null,"width":92,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"upnl","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"profit_percent","hide":false,"aggFunc":null,"width":103,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value_aud","hide":false,"aggFunc":null,"width":135,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value_convert","hide":false,"aggFunc":null,"width":149,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_val","hide":false,"aggFunc":null,"width":128,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_percent","hide":false,"aggFunc":null,"width":136,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value","hide":false,"aggFunc":null,"width":103,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value","hide":false,"aggFunc":null,"width":117,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                    }
                  }
                ]
              },
              {
                'type': 'stack',
                'header': {},
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': 100,
                'width': 30.8411214953271,
                'content': [
                  {
                    'type': 'component',
                    'component': 'PortfolioSummary',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_portfolio_summary',
                    'componentState': {
                      'showLoading': false,
                      'color': 0,
                      'account': {
                        'account_id': '0000',
                        'account_name': 'UN-BOOKED TRADE A/C',
                        'currency': 'AUD',
                        'address_line_1': null,
                        'email': null,
                        'mobile_phone': null,
                        'fax': null,
                        'status': 'inactive',
                        'sources': null,
                        'hin': null,
                        'advisor_code': 'OMR',
                        'broker_id': null,
                        'pid': null,
                        'client_type': null,
                        'driver_licence': null,
                        'date_created': null,
                        'trading_account': null,
                        'work_phone': null,
                        'warrants_trading': 1,
                        'options_trading': 1,
                        'branch': 'BR00000000',
                        'om_equix_status': '1',
                        'actor': 'system',
                        'last_update': 1553669193917,
                        'actor_market': 'system',
                        'last_update_market': 1553669193917,
                        'us_market': 2,
                        'au_market': 3,
                        'organisation_code': '03',
                        'advisor_name': 'OpenMarkets',
                        'address_line_2': null,
                        'address_line_3': null,
                        'address_line_4': null,
                        'home_phone': null,
                        'account_type': null,
                        'branch_code': '03',
                        'international_trading': '0',
                        'equities_brokerage_schedule': null,
                        'options_brokerage_schedule': null,
                        'bank_institution_code': null,
                        'bsb': null,
                        'bank_account_number': null,
                        'bank_account_name': null,
                        'bank_transaction_type': null,
                        'account_designation': null,
                        'contractnote_email_address': null,
                        'post_code': null,
                        'country_code': null,
                        'cross_reference': '0000'
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }

  const getAdvisorTradingDefaultLayoutMuda = (percentHeightTop = 40, percentWidth = 20) => {
    return [
      {
        'type': 'column',
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'content': [
          {
            'type': 'stack',
            'height': 50,
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'activeItemIndex': 0,
            'content': [
              {
                'type': 'component',
                'component': 'UserAccount',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_client_management',
                'componentState': {
                  'account': {

                  },
                  'color': 0,
                  'filterState': '{"status":{"value":["active"],"operator":"OR","filterType":"text","checkAll":0}}',
                  'colState': '[{"colId":"account_id","hide":false,"aggFunc":null,"width":119,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_name","hide":false,"aggFunc":null,"width":273,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"hin","hide":false,"aggFunc":null,"width":77,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"advisor_code","hide":false,"aggFunc":null,"width":114,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_balance","hide":false,"aggFunc":null,"width":211,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"total_market_value","hide":false,"aggFunc":null,"width":272,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"total_profit_amount","hide":false,"aggFunc":null,"width":103,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"total_profit_percent","hide":false,"aggFunc":null,"width":113,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"status","hide":false,"aggFunc":null,"width":142,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                }
              }
            ]
          },
          {
            'type': 'stack',
            'header': {

            },
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'activeItemIndex': 1,
            'height': 50,
            'content': [
              {
                'type': 'component',
                'component': 'AllHoldings',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_all_holdings',
                'componentState': {
                  'color': 0,
                  'colState': '[{"name":"account_id"},{"name":"account_name","hide":true},{"name":"display_name"},{"name":"security_name","hide":true},{"name":"side"},{"name":"volume"},{"name":"market_price"},{"name":"average_price"},{"name":"book_value","hide":false},{"name":"book_value_convert"},{"name":"value","hide":false},{"name":"value_convert"},{"name":"today_change_val"},{"name":"today_change_percent"},{"name":"upnl"},{"name":"profit_percent"},{"name":"class","groupIndex":0}]',
                  'valueFilter': ''
                }
              },
              {
                'type': 'component',
                'component': 'AllOrders',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_all_orders',
                'componentState': {
                  'color': 0,
                  'openWidget': 'OrderList',
                  'filter': {
                    'option': [
                      'WORKING_'
                    ],
                    'duration': 'Day'
                  },
                  'collapse': 0,
                  'colState': '[{"name":"user_login","hide":false},{"name":"account_name","hide":true},{"name":"account_id","hide":false},{"name":"class","groupIndex":0},{"name":"order_status"},{"name":"is_buy"},{"name":"filled_quantity"},{"name":"symbol"},{"name":"volume"},{"name":"limit_price"},{"name":"stop_price"},{"name":"avg_price"},{"name":"order_type"},{"name":"duration"},{"name":"company_name"},{"name":"destination"},{"name":"exchange"},{"name":"advisor_code"},{"name":"broker_order_id"},{"name":"init_time"},{"name":"origination","hide":true},{"name":"updated","hide":true},{"name":"estimated_fees"},{"name":"total_convert"}]',
                  'valueFilter': ''
                }
              }
            ]
          }
        ]
      }
    ]
  }
  const getAdvisorTradingDefaultLayout = (percentHeightTop = 40, percentWidth = 20) => {
    return [
      {
        'type': 'row',
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'content': [
          {
            'type': 'stack',
            'width': percentWidth * 1.5,
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'activeItemIndex': 0,
            'content': [
              {
                'type': 'component',
                'component': 'UserAccount',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_client_management',
                'componentState': {
                  'account': {
                    'account_id': '0000',
                    'account_name': 'UN-BOOKED TRADE A/C',
                    'currency': 'AUD',
                    'address_line_1': null,
                    'email': null,
                    'mobile_phone': null,
                    'fax': null,
                    'status': 'inactive',
                    'sources': null,
                    'hin': null,
                    'advisor_code': 'OMR',
                    'broker_id': null,
                    'pid': null,
                    'client_type': null,
                    'driver_licence': null,
                    'date_created': null,
                    'trading_account': null,
                    'work_phone': null,
                    'warrants_trading': 1,
                    'options_trading': 1,
                    'branch': 'BR00000000',
                    'om_equix_status': '1',
                    'actor': 'system',
                    'last_update': 1553669193917,
                    'actor_market': 'system',
                    'last_update_market': 1553669193917,
                    'us_market': 2,
                    'au_market': 3,
                    'organisation_code': '03',
                    'advisor_name': 'OpenMarkets',
                    'address_line_2': null,
                    'address_line_3': null,
                    'address_line_4': null,
                    'home_phone': null,
                    'account_type': null,
                    'branch_code': '03',
                    'international_trading': '0',
                    'equities_brokerage_schedule': null,
                    'options_brokerage_schedule': null,
                    'bank_institution_code': null,
                    'bsb': null,
                    'bank_account_number': null,
                    'bank_account_name': null,
                    'bank_transaction_type': null,
                    'account_designation': null,
                    'contractnote_email_address': null,
                    'post_code': null,
                    'country_code': null,
                    'cross_reference': '0000',
                    'source': 'Agility'
                  },
                  'color': 0,
                  'colState': '[{"colId":"account_id","hide":false,"aggFunc":null,"width":74,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_name","hide":false,"aggFunc":null,"width":210,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"hin","hide":false,"aggFunc":null,"width":92,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"advisor_code","hide":false,"aggFunc":null,"width":84,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_balance","hide":false,"aggFunc":null,"width":152,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"total_market_value","hide":false,"aggFunc":null,"width":195,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                }
              }
            ]
          },
          {
            'type': 'column',
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'width': percentWidth * 2,
            'content': [
              {
                'type': 'stack',
                'header': {},
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'width': percentWidth * 2,
                'height': 50,
                'content': [
                  {
                    'type': 'component',
                    'component': 'PortfolioSummary',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_portfolio_summary',
                    'componentState': {
                      'account': {
                        'account_id': '177574',
                        'account_name': 'MR DUNCAN STUART MCLAUCHLAN',
                        'currency': 'AUD',
                        'address_line_1': 'PO BOX 4467',
                        'email': 'duncanmcl@bigpond.com',
                        'mobile_phone': null,
                        'fax': null,
                        'status': 'active',
                        'sources': null,
                        'hin': '0082077162',
                        'advisor_code': 'EQS',
                        'broker_id': null,
                        'pid': null,
                        'client_type': null,
                        'driver_licence': null,
                        'date_created': 'Jul 12 2018',
                        'trading_account': null,
                        'work_phone': null,
                        'warrants_trading': 1,
                        'options_trading': 1,
                        'branch': 'BR29011995',
                        'om_equix_status': '1',
                        'actor': 'system',
                        'last_update': 1553458254826,
                        'actor_market': 'system',
                        'last_update_market': 1553458254826,
                        'us_market': 2,
                        'au_market': 2,
                        'organisation_code': '03',
                        'advisor_name': 'Equity Story',
                        'address_line_2': 'MYAREE WA',
                        'address_line_3': null,
                        'address_line_4': null,
                        'home_phone': null,
                        'account_type': 'Individual',
                        'branch_code': '03',
                        'international_trading': '1',
                        'equities_brokerage_schedule': '$0.00+$5.00-0.050%',
                        'options_brokerage_schedule': null,
                        'bank_institution_code': 'MBL',
                        'bsb': '182-512',
                        'bank_account_number': '966410995',
                        'bank_account_name': 'DUNCAN STUART MCLAUCHLAN',
                        'bank_transaction_type': 'DRCR',
                        'account_designation': null,
                        'contractnote_email_address': 'duncanmcl@bigpond.com;duncanmcl@bigpond.com',
                        'post_code': '6154',
                        'country_code': 'AU',
                        'cross_reference': '177574',
                        'source': 'Agility',
                        'address': 'PO BOX 4467, MYAREE WA, 6154, AU'
                      },
                      'color': 0
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'Portfolio',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_portfolio_holding',
                    'componentState': {
                      'account': {
                        'account_id': '177574',
                        'account_name': 'MR DUNCAN STUART MCLAUCHLAN',
                        'currency': 'AUD',
                        'address_line_1': 'PO BOX 4467',
                        'email': 'duncanmcl@bigpond.com',
                        'mobile_phone': null,
                        'fax': null,
                        'status': 'active',
                        'sources': null,
                        'hin': '0082077162',
                        'advisor_code': 'EQS',
                        'broker_id': null,
                        'pid': null,
                        'client_type': null,
                        'driver_licence': null,
                        'date_created': 'Jul 12 2018',
                        'trading_account': null,
                        'work_phone': null,
                        'warrants_trading': 1,
                        'options_trading': 1,
                        'branch': 'BR29011995',
                        'om_equix_status': '1',
                        'actor': 'system',
                        'last_update': 1553458254826,
                        'actor_market': 'system',
                        'last_update_market': 1553458254826,
                        'us_market': 2,
                        'au_market': 2,
                        'organisation_code': '03',
                        'advisor_name': 'Equity Story',
                        'address_line_2': 'MYAREE WA',
                        'address_line_3': null,
                        'address_line_4': null,
                        'home_phone': null,
                        'account_type': 'Individual',
                        'branch_code': '03',
                        'international_trading': '1',
                        'equities_brokerage_schedule': '$0.00+$5.00-0.050%',
                        'options_brokerage_schedule': null,
                        'bank_institution_code': 'MBL',
                        'bsb': '182-512',
                        'bank_account_number': '966410995',
                        'bank_account_name': 'DUNCAN STUART MCLAUCHLAN',
                        'bank_transaction_type': 'DRCR',
                        'account_designation': null,
                        'contractnote_email_address': 'duncanmcl@bigpond.com;duncanmcl@bigpond.com',
                        'post_code': '6154',
                        'country_code': 'AU',
                        'cross_reference': '177574',
                        'source': 'Agility',
                        'address': 'PO BOX 4467, MYAREE WA, 6154, AU'
                      },
                      'color': 0,
                      'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":107,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":126,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":93,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"market_price","hide":false,"aggFunc":null,"width":104,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"average_price","hide":false,"aggFunc":null,"width":103,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value_aud","hide":false,"aggFunc":null,"width":122,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value_convert","hide":false,"aggFunc":null,"width":137,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_val","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_percent","hide":false,"aggFunc":null,"width":103,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"upnl","hide":false,"aggFunc":null,"width":82,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"profit_percent","hide":false,"aggFunc":null,"width":90,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actionOrder","hide":false,"aggFunc":null,"width":109,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'AccountDetailNew',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_account_detail',
                    'componentState': {
                      'account': {
                        'account_id': '0000',
                        'account_name': 'UN-BOOKED TRADE A/C',
                        'currency': 'AUD',
                        'address_line_1': null,
                        'email': null,
                        'mobile_phone': null,
                        'fax': null,
                        'status': 'inactive',
                        'sources': null,
                        'hin': null,
                        'advisor_code': 'OMR',
                        'broker_id': null,
                        'pid': null,
                        'client_type': null,
                        'driver_licence': null,
                        'date_created': null,
                        'trading_account': null,
                        'work_phone': null,
                        'warrants_trading': 1,
                        'options_trading': 1,
                        'branch': 'BR00000000',
                        'om_equix_status': '1',
                        'actor': 'system',
                        'last_update': 1553669193917,
                        'actor_market': 'system',
                        'last_update_market': 1553669193917,
                        'us_market': 2,
                        'au_market': 3,
                        'organisation_code': '03',
                        'advisor_name': 'OpenMarkets',
                        'address_line_2': null,
                        'address_line_3': null,
                        'address_line_4': null,
                        'home_phone': null,
                        'account_type': null,
                        'branch_code': '03',
                        'international_trading': '0',
                        'equities_brokerage_schedule': null,
                        'options_brokerage_schedule': null,
                        'bank_institution_code': null,
                        'bsb': null,
                        'bank_account_number': null,
                        'bank_account_name': null,
                        'bank_transaction_type': null,
                        'account_designation': null,
                        'contractnote_email_address': null,
                        'post_code': null,
                        'country_code': null,
                        'cross_reference': '0000',
                        'source': 'Agility'
                      },
                      'color': 0,
                      'accountObj': {
                        'account_id': '0000',
                        'account_name': 'UN-BOOKED TRADE A/C',
                        'currency': 'AUD',
                        'address_line_1': null,
                        'email': null,
                        'mobile_phone': null,
                        'fax': null,
                        'status': 'inactive',
                        'sources': null,
                        'hin': null,
                        'advisor_code': 'OMR',
                        'broker_id': null,
                        'pid': null,
                        'client_type': null,
                        'driver_licence': null,
                        'date_created': null,
                        'trading_account': null,
                        'work_phone': null,
                        'warrants_trading': 1,
                        'options_trading': 1,
                        'branch': 'BR00000000',
                        'om_equix_status': '1',
                        'actor': 'system',
                        'last_update': 1553669193917,
                        'actor_market': 'system',
                        'last_update_market': 1553669193917,
                        'us_market': 2,
                        'au_market': 3,
                        'organisation_code': '03',
                        'advisor_name': 'OpenMarkets',
                        'address_line_2': null,
                        'address_line_3': null,
                        'address_line_4': null,
                        'home_phone': null,
                        'account_type': null,
                        'branch_code': '03',
                        'international_trading': '0',
                        'equities_brokerage_schedule': null,
                        'options_brokerage_schedule': null,
                        'bank_institution_code': null,
                        'bsb': null,
                        'bank_account_number': null,
                        'bank_account_name': null,
                        'bank_transaction_type': null,
                        'account_designation': null,
                        'contractnote_email_address': null,
                        'post_code': null,
                        'country_code': null,
                        'cross_reference': '0000',
                        'source': 'Agility'
                      }
                    }
                  }
                ]
              },
              {
                'type': 'stack',
                'header': {},
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': 50,
                'content': [
                  {
                    'type': 'component',
                    'component': 'OrderList',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_orders',
                    'componentState': {
                      'account': {
                        'account_id': '177574',
                        'account_name': 'MR DUNCAN STUART MCLAUCHLAN',
                        'currency': 'AUD',
                        'address_line_1': 'PO BOX 4467',
                        'email': 'duncanmcl@bigpond.com',
                        'mobile_phone': null,
                        'fax': null,
                        'status': 'active',
                        'sources': null,
                        'hin': '0082077162',
                        'advisor_code': 'EQS',
                        'broker_id': null,
                        'pid': null,
                        'client_type': null,
                        'driver_licence': null,
                        'date_created': 'Jul 12 2018',
                        'trading_account': null,
                        'work_phone': null,
                        'warrants_trading': 1,
                        'options_trading': 1,
                        'branch': 'BR29011995',
                        'om_equix_status': '1',
                        'actor': 'system',
                        'last_update': 1553458254826,
                        'actor_market': 'system',
                        'last_update_market': 1553458254826,
                        'us_market': 2,
                        'au_market': 2,
                        'organisation_code': '03',
                        'advisor_name': 'Equity Story',
                        'address_line_2': 'MYAREE WA',
                        'address_line_3': null,
                        'address_line_4': null,
                        'home_phone': null,
                        'account_type': 'Individual',
                        'branch_code': '03',
                        'international_trading': '1',
                        'equities_brokerage_schedule': '$0.00+$5.00-0.050%',
                        'options_brokerage_schedule': null,
                        'bank_institution_code': 'MBL',
                        'bsb': '182-512',
                        'bank_account_number': '966410995',
                        'bank_account_name': 'DUNCAN STUART MCLAUCHLAN',
                        'bank_transaction_type': 'DRCR',
                        'account_designation': null,
                        'contractnote_email_address': 'duncanmcl@bigpond.com;duncanmcl@bigpond.com',
                        'post_code': '6154',
                        'country_code': 'AU',
                        'cross_reference': '177574',
                        'source': 'Agility',
                        'address': 'PO BOX 4467, MYAREE WA, 6154, AU'
                      },
                      'color': 0,
                      'valueFilter': '',
                      'colState': '[{"colId":"init_time","hide":false,"aggFunc":null,"width":244,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"order_status","hide":false,"aggFunc":null,"width":126,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"advisor_code","hide":false,"aggFunc":null,"width":115,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_id","hide":false,"aggFunc":null,"width":102,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_name","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_name","hide":false,"aggFunc":null,"width":166,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"is_buy","hide":false,"aggFunc":null,"width":102,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":103,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"filled_quantity","hide":false,"aggFunc":null,"width":100,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"limit_price","hide":false,"aggFunc":null,"width":120,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"stop_price","hide":false,"aggFunc":null,"width":117,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"filled_price","hide":false,"aggFunc":null,"width":114,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"order_type","hide":false,"aggFunc":null,"width":120,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"duration","hide":false,"aggFunc":null,"width":111,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_order_id","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"est_fees_aud","hide":false,"aggFunc":null,"width":131,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"est_total_aud","hide":false,"aggFunc":null,"width":136,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"exchange","hide":false,"aggFunc":null,"width":114,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":145,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actionOrder","hide":false,"aggFunc":null,"width":101,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'AllOrders',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_all_orders',
                    'componentState': {
                      'color': 0,
                      'colState': '[{"colId":"init_time","hide":false,"aggFunc":null,"width":246,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"order_status","hide":false,"aggFunc":null,"width":148,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"advisor_code","hide":false,"aggFunc":null,"width":114,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_id","hide":false,"aggFunc":null,"width":102,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_name","hide":false,"aggFunc":null,"width":121,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_name","hide":false,"aggFunc":null,"width":119,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"is_buy","hide":false,"aggFunc":null,"width":92,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"filled_quantity","hide":false,"aggFunc":null,"width":73,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"limit_price","hide":false,"aggFunc":null,"width":99,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"stop_price","hide":false,"aggFunc":null,"width":99,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"filled_price","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"order_type","hide":false,"aggFunc":null,"width":102,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"duration","hide":false,"aggFunc":null,"width":115,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_order_id","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"est_fees_aud","hide":false,"aggFunc":null,"width":134,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"est_total_aud","hide":false,"aggFunc":null,"width":143,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"exchange","hide":false,"aggFunc":null,"width":117,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actionOrder","hide":false,"aggFunc":null,"width":153,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
                      'account': {
                        'account_id': '177574',
                        'account_name': 'MR DUNCAN STUART MCLAUCHLAN',
                        'currency': 'AUD',
                        'address_line_1': 'PO BOX 4467',
                        'email': 'duncanmcl@bigpond.com',
                        'mobile_phone': null,
                        'fax': null,
                        'status': 'active',
                        'sources': null,
                        'hin': '0082077162',
                        'advisor_code': 'EQS',
                        'broker_id': null,
                        'pid': null,
                        'client_type': null,
                        'driver_licence': null,
                        'date_created': 'Jul 12 2018',
                        'trading_account': null,
                        'work_phone': null,
                        'warrants_trading': 1,
                        'options_trading': 1,
                        'branch': 'BR29011995',
                        'om_equix_status': '1',
                        'actor': 'system',
                        'last_update': 1553458254826,
                        'actor_market': 'system',
                        'last_update_market': 1553458254826,
                        'us_market': 2,
                        'au_market': 2,
                        'organisation_code': '03',
                        'advisor_name': 'Equity Story',
                        'address_line_2': 'MYAREE WA',
                        'address_line_3': null,
                        'address_line_4': null,
                        'home_phone': null,
                        'account_type': 'Individual',
                        'branch_code': '03',
                        'international_trading': '1',
                        'equities_brokerage_schedule': '$0.00+$5.00-0.050%',
                        'options_brokerage_schedule': null,
                        'bank_institution_code': 'MBL',
                        'bsb': '182-512',
                        'bank_account_number': '966410995',
                        'bank_account_name': 'DUNCAN STUART MCLAUCHLAN',
                        'bank_transaction_type': 'DRCR',
                        'account_designation': null,
                        'contractnote_email_address': 'duncanmcl@bigpond.com;duncanmcl@bigpond.com',
                        'post_code': '6154',
                        'country_code': 'AU',
                        'cross_reference': '177574',
                        'source': 'Agility',
                        'address': 'PO BOX 4467, MYAREE WA, 6154, AU'
                      },
                      'valueFilter': ''
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'AllHoldings',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_all_holdings',
                    'componentState': {
                      'color': 0,
                      'account': {
                        'account_id': '177574',
                        'account_name': 'MR DUNCAN STUART MCLAUCHLAN',
                        'currency': 'AUD',
                        'address_line_1': 'PO BOX 4467',
                        'email': 'duncanmcl@bigpond.com',
                        'mobile_phone': null,
                        'fax': null,
                        'status': 'active',
                        'sources': null,
                        'hin': '0082077162',
                        'advisor_code': 'EQS',
                        'broker_id': null,
                        'pid': null,
                        'client_type': null,
                        'driver_licence': null,
                        'date_created': 'Jul 12 2018',
                        'trading_account': null,
                        'work_phone': null,
                        'warrants_trading': 1,
                        'options_trading': 1,
                        'branch': 'BR29011995',
                        'om_equix_status': '1',
                        'actor': 'system',
                        'last_update': 1553458254826,
                        'actor_market': 'system',
                        'last_update_market': 1553458254826,
                        'us_market': 2,
                        'au_market': 2,
                        'organisation_code': '03',
                        'advisor_name': 'Equity Story',
                        'address_line_2': 'MYAREE WA',
                        'address_line_3': null,
                        'address_line_4': null,
                        'home_phone': null,
                        'account_type': 'Individual',
                        'branch_code': '03',
                        'international_trading': '1',
                        'equities_brokerage_schedule': '$0.00+$5.00-0.050%',
                        'options_brokerage_schedule': null,
                        'bank_institution_code': 'MBL',
                        'bsb': '182-512',
                        'bank_account_number': '966410995',
                        'bank_account_name': 'DUNCAN STUART MCLAUCHLAN',
                        'bank_transaction_type': 'DRCR',
                        'account_designation': null,
                        'contractnote_email_address': 'duncanmcl@bigpond.com;duncanmcl@bigpond.com',
                        'post_code': '6154',
                        'country_code': 'AU',
                        'cross_reference': '177574',
                        'source': 'Agility',
                        'address': 'PO BOX 4467, MYAREE WA, 6154, AU'
                      },
                      'colState': '[{"colId":"account_id","hide":false,"aggFunc":null,"width":88,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_name","hide":false,"aggFunc":null,"width":211,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"display_name","hide":false,"aggFunc":null,"width":124,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":211,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":91,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"market_price","hide":false,"aggFunc":null,"width":101,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"average_price","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value_aud","hide":false,"aggFunc":null,"width":133,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value","hide":true,"aggFunc":null,"width":131,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value_convert","hide":false,"aggFunc":null,"width":147,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value","hide":true,"aggFunc":null,"width":121,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_val","hide":false,"aggFunc":null,"width":102,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_percent","hide":false,"aggFunc":null,"width":104,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"upnl","hide":false,"aggFunc":null,"width":104,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"profit_percent","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actionOrder","hide":false,"aggFunc":null,"width":112,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                    }
                  }
                ]
              }
            ]
          },
          {
            'type': 'column',
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'width': 100 - percentWidth * 3.5,
            'content': [
              {
                'type': 'stack',
                'header': {},
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'width': percentWidth * 1.5,
                'height': 50,
                'content': [
                  {
                    'type': 'component',
                    'component': 'MarketDepth',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_market_depth',
                    'componentState': {
                      'color': 0,
                      'sortState': '[{"colId":"index","sort":"asc"}]',
                      'disableCollapse': false,
                      'colState': '[{"colId":"time","hide":false,"aggFunc":null,"width":101,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"quantity","hide":false,"aggFunc":null,"width":91,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"price","hide":false,"aggFunc":null,"width":91,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"index","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                    }
                  }
                ]
              },
              {
                'type': 'stack',
                'header': {},
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': 50,
                'content': [
                  {
                    'type': 'component',
                    'component': 'ChartTV',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_chart',
                    'componentState': {
                      'color': 0
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }

  const getRetailViewOnlyLayout = (percentHeightTop = 40, percentWidth = 20) => {
    return [
      {
        'type': 'row',
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'content': [
          {
            'type': 'stack',
            'width': 50,
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'activeItemIndex': 0,
            'content': [
              {
                'type': 'component',
                'component': 'Portfolio',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_portfolio_holding',
                'componentState': {
                  'color': 0,
                  'account': {},
                  'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":122,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actionOrder","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":99,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"market_price","hide":false,"aggFunc":null,"width":103,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"average_price","hide":false,"aggFunc":null,"width":102,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"upnl","hide":false,"aggFunc":null,"width":104,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"profit_percent","hide":false,"aggFunc":null,"width":112,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value_aud","hide":false,"aggFunc":null,"width":145,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value_convert","hide":false,"aggFunc":null,"width":160,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_val","hide":false,"aggFunc":null,"width":138,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_percent","hide":false,"aggFunc":null,"width":146,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value","hide":false,"aggFunc":null,"width":112,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                }
              }
            ]
          },
          {
            'type': 'stack',
            'header': {},
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'activeItemIndex': 0,
            'width': 50,
            'content': [
              {
                'type': 'component',
                'component': 'PortfolioSummary',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_portfolio_summary',
                'componentState': {
                  'color': 0,
                  'account': {}
                }
              },
              {
                'type': 'component',
                'component': 'AccountDetailNew',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_account_detail',
                'componentState': {
                  'color': 0,
                  'account': {}
                }
              }
            ]
          }
        ]
      }
    ]
  }

  const getEndClientUserTradingDefaultLayout = (percentHeightTop = 40, percentWidth = 20) => {
    return [
      {
        'type': 'row',
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'content': [
          {
            'type': 'stack',
            'header': {},
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'activeItemIndex': 0,
            'height': 100,
            'width': 50,
            'content': [
              {
                'type': 'component',
                'component': 'Portfolio',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_portfolio_holding',
                'componentState': {
                  'color': 0,
                  'account': {},
                  'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":108,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":199,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actionOrder","hide":false,"aggFunc":null,"width":92,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":86,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"market_price","hide":false,"aggFunc":null,"width":89,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"average_price","hide":false,"aggFunc":null,"width":88,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"upnl","hide":false,"aggFunc":null,"width":90,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"profit_percent","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value_aud","hide":false,"aggFunc":null,"width":126,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value_convert","hide":false,"aggFunc":null,"width":139,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_val","hide":false,"aggFunc":null,"width":120,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_percent","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                }
              },
              {
                'type': 'component',
                'component': 'UserAccount',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_user_vs_client_man',
                'componentState': {
                  'color': 0,
                  'account': {},
                  'initTitle': 'lang_user_vs_client_man',
                  'colState': '[{"colId":"account_id","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_name","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"hin","hide":false,"aggFunc":null,"width":115,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"advisor_code","hide":false,"aggFunc":null,"width":88,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_balance","hide":false,"aggFunc":null,"width":157,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"total_market_value","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                }
              },
              {
                'type': 'component',
                'component': 'AccountDetailNew',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_account_detail',
                'componentState': {
                  'color': 0,
                  'account': {}
                }
              }
            ]
          },
          {
            'type': 'stack',
            'header': {},
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'activeItemIndex': 0,
            'width': 50,
            'content': [
              {
                'type': 'component',
                'component': 'PortfolioSummary',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_portfolio_summary',
                'componentState': {
                  'color': 0,
                  'account': {}
                }
              }
            ]
          }
        ]
      }
    ]
  }

  const getRetailUserTradingDefaultLayoutMuda = (percentHeightTop = 40, percentWidth = 20) => {
    return [
      {
        'type': 'row',
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'content': [
          {
            'type': 'column',
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'width': percentWidth,
            'content': [
              {
                'type': 'stack',
                'header': {

                },
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': 50,
                'content': [
                  {
                    'type': 'component',
                    'component': 'MarketOverview',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_market_overview',
                    'componentState': {
                      'color': 0
                    }
                  }
                ]
              },
              {
                'type': 'stack',
                'header': {

                },
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'width': 50,
                'height': 50,
                'content': [
                  {
                    'type': 'component',
                    'component': 'Order',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_new_order',
                    'componentState': {
                      'stateOrder': 'NewOrder',
                      'data': {
                        'side': 'BUY'
                      },
                      'color': 5,
                      'initTitle': 'lang_new_order',
                      'account': {
                        'account_id': '182756',
                        'account_name': 'MORRISON ACCOUNT 0001',
                        'currency': 'VND',
                        'address_line_1': null,
                        'email': 'thao.doan@quant-edge.com',
                        'mobile_phone': null,
                        'fax': null,
                        'status': 'active',
                        'cqg_account_status': 'EMPTY',
                        'sources': null,
                        'hin': null,
                        'advisor_code': 'OMR',
                        'broker_id': null,
                        'pid': null,
                        'client_type': null,
                        'driver_licence': null,
                        'date_created': null,
                        'trading_account': null,
                        'work_phone': null,
                        'warrants_trading': null,
                        'options_trading': null,
                        'branch': 'BR00000000',
                        'om_equix_status': 'tcb',
                        'actor': 'thi-anh.nguyen@quant-edge.com',
                        'last_update': 1605757432091,
                        'actor_market': 'system',
                        'last_update_market': 1605668382644,
                        'us_market': 2,
                        'au_market': 3,
                        'organisation_code': 'MORRISON',
                        'advisor_name': null,
                        'address_line_2': null,
                        'address_line_3': null,
                        'address_line_4': null,
                        'home_phone': null,
                        'account_type': 'RETAIL',
                        'branch_code': null,
                        'international_trading': null,
                        'equities_brokerage_schedule': null,
                        'options_brokerage_schedule': null,
                        'bank_institution_code': null,
                        'bsb': null,
                        'bank_account_number': null,
                        'bank_account_name': null,
                        'bank_transaction_type': null,
                        'account_designation': null,
                        'contractnote_email_address': null,
                        'post_code': null,
                        'country_code': null,
                        'cross_reference': null,
                        'source': 'morrison',
                        'equity_trading': null,
                        'future_trading': null,
                        'margin_flag': null,
                        'contact_phone': null,
                        'business_registration_code': null,
                        'corporate_taxpayer_identification_number': null,
                        'margin_account': null,
                        'representative_name': null,
                        'date_of_birth': null,
                        'personal_papers_type': null,
                        'personal_papers_number': null,
                        'date_granted_identity_papers': null
                      },
                      'lastAccountId': '182756',
                      'accountName': 'MORRISON ACCOUNT 0001',
                      'currency': 'VND'
                    }
                  }
                ]
              }
            ]
          },
          {
            'type': 'column',
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'width': percentWidth * 2,
            'content': [
              {
                'type': 'stack',
                'width': 75.76815642458101,
                'height': 69.19504643962848,
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'content': [
                  {
                    'type': 'component',
                    'component': 'ChartTV',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_chart',
                    'componentState': {
                      'color': 0
                    }
                  }
                ]
              },
              {
                'type': 'stack',
                'header': {

                },
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 2,
                'height': 30.804953560371516,
                'content': [
                  {
                    'type': 'component',
                    'component': 'OrderList',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_orders',
                    'componentState': {
                      'account': {
                        'account_id': '182756',
                        'account_name': 'MORRISON ACCOUNT 0001',
                        'currency': 'VND',
                        'address_line_1': null,
                        'email': 'thao.doan@quant-edge.com',
                        'mobile_phone': null,
                        'fax': null,
                        'status': 'active',
                        'cqg_account_status': 'EMPTY',
                        'sources': null,
                        'hin': null,
                        'advisor_code': 'OMR',
                        'broker_id': null,
                        'pid': null,
                        'client_type': null,
                        'driver_licence': null,
                        'date_created': null,
                        'trading_account': null,
                        'work_phone': null,
                        'warrants_trading': null,
                        'options_trading': null,
                        'branch': 'BR00000000',
                        'om_equix_status': 'tcb',
                        'actor': 'thi-anh.nguyen@quant-edge.com',
                        'last_update': 1605757432091,
                        'actor_market': 'system',
                        'last_update_market': 1605668382644,
                        'us_market': 2,
                        'au_market': 3,
                        'organisation_code': 'MORRISON',
                        'advisor_name': null,
                        'address_line_2': null,
                        'address_line_3': null,
                        'address_line_4': null,
                        'home_phone': null,
                        'account_type': 'RETAIL',
                        'branch_code': null,
                        'international_trading': null,
                        'equities_brokerage_schedule': null,
                        'options_brokerage_schedule': null,
                        'bank_institution_code': null,
                        'bsb': null,
                        'bank_account_number': null,
                        'bank_account_name': null,
                        'bank_transaction_type': null,
                        'account_designation': null,
                        'contractnote_email_address': null,
                        'post_code': null,
                        'country_code': null,
                        'cross_reference': null,
                        'source': 'morrison',
                        'equity_trading': null,
                        'future_trading': null,
                        'margin_flag': null,
                        'contact_phone': null,
                        'business_registration_code': null,
                        'corporate_taxpayer_identification_number': null,
                        'margin_account': null,
                        'representative_name': null,
                        'date_of_birth': null,
                        'personal_papers_type': null,
                        'personal_papers_number': null,
                        'date_granted_identity_papers': null
                      },
                      'color': 0,
                      'openWidget': 'OrderList',
                      'filter': {
                        'option': [
                          'WORKING_'
                        ],
                        'duration': 'Day'
                      },
                      'collapse': 0,
                      'colState': '[{"name":"user_login","hide":true},{"name":"account_name","hide":true},{"name":"account_id","hide":true},{"name":"class","groupIndex":0},{"name":"order_status"},{"name":"is_buy"},{"name":"filled_quantity"},{"name":"symbol"},{"name":"volume"},{"name":"limit_price"},{"name":"stop_price"},{"name":"avg_price"},{"name":"order_type"},{"name":"duration"},{"name":"company_name"},{"name":"destination"},{"name":"exchange"},{"name":"advisor_code"},{"name":"broker_order_id"},{"name":"init_time"},{"name":"origination","hide":true},{"name":"updated","hide":true},{"name":"estimated_fees"},{"name":"total_convert"}]',
                      'valueFilter': ''
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'Portfolio',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_portfolio_holding',
                    'componentState': {
                      'account': {
                        'account_id': '182756',
                        'account_name': 'MORRISON ACCOUNT 0001',
                        'currency': 'VND',
                        'address_line_1': null,
                        'email': 'thao.doan@quant-edge.com',
                        'mobile_phone': null,
                        'fax': null,
                        'status': 'active',
                        'cqg_account_status': 'EMPTY',
                        'sources': null,
                        'hin': null,
                        'advisor_code': 'OMR',
                        'broker_id': null,
                        'pid': null,
                        'client_type': null,
                        'driver_licence': null,
                        'date_created': null,
                        'trading_account': null,
                        'work_phone': null,
                        'warrants_trading': null,
                        'options_trading': null,
                        'branch': 'BR00000000',
                        'om_equix_status': 'tcb',
                        'actor': 'thi-anh.nguyen@quant-edge.com',
                        'last_update': 1605757432091,
                        'actor_market': 'system',
                        'last_update_market': 1605668382644,
                        'us_market': 2,
                        'au_market': 3,
                        'organisation_code': 'MORRISON',
                        'advisor_name': null,
                        'address_line_2': null,
                        'address_line_3': null,
                        'address_line_4': null,
                        'home_phone': null,
                        'account_type': 'RETAIL',
                        'branch_code': null,
                        'international_trading': null,
                        'equities_brokerage_schedule': null,
                        'options_brokerage_schedule': null,
                        'bank_institution_code': null,
                        'bsb': null,
                        'bank_account_number': null,
                        'bank_account_name': null,
                        'bank_transaction_type': null,
                        'account_designation': null,
                        'contractnote_email_address': null,
                        'post_code': null,
                        'country_code': null,
                        'cross_reference': null,
                        'source': 'morrison',
                        'equity_trading': null,
                        'future_trading': null,
                        'margin_flag': null,
                        'contact_phone': null,
                        'business_registration_code': null,
                        'corporate_taxpayer_identification_number': null,
                        'margin_account': null,
                        'representative_name': null,
                        'date_of_birth': null,
                        'personal_papers_type': null,
                        'personal_papers_number': null,
                        'date_granted_identity_papers': null
                      },
                      'color': 0
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'PortfolioSummary',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_portfolio_summary',
                    'componentState': {
                      'account': {
                        'account_id': '182756',
                        'account_name': 'MORRISON ACCOUNT 0001',
                        'currency': 'VND',
                        'address_line_1': null,
                        'email': 'thao.doan@quant-edge.com',
                        'mobile_phone': null,
                        'fax': null,
                        'status': 'active',
                        'cqg_account_status': 'EMPTY',
                        'sources': null,
                        'hin': null,
                        'advisor_code': 'OMR',
                        'broker_id': null,
                        'pid': null,
                        'client_type': null,
                        'driver_licence': null,
                        'date_created': null,
                        'trading_account': null,
                        'work_phone': null,
                        'warrants_trading': null,
                        'options_trading': null,
                        'branch': 'BR00000000',
                        'om_equix_status': 'tcb',
                        'actor': 'thi-anh.nguyen@quant-edge.com',
                        'last_update': 1605757432091,
                        'actor_market': 'system',
                        'last_update_market': 1605668382644,
                        'us_market': 2,
                        'au_market': 3,
                        'organisation_code': 'MORRISON',
                        'advisor_name': null,
                        'address_line_2': null,
                        'address_line_3': null,
                        'address_line_4': null,
                        'home_phone': null,
                        'account_type': 'RETAIL',
                        'branch_code': null,
                        'international_trading': null,
                        'equities_brokerage_schedule': null,
                        'options_brokerage_schedule': null,
                        'bank_institution_code': null,
                        'bsb': null,
                        'bank_account_number': null,
                        'bank_account_name': null,
                        'bank_transaction_type': null,
                        'account_designation': null,
                        'contractnote_email_address': null,
                        'post_code': null,
                        'country_code': null,
                        'cross_reference': null,
                        'source': 'morrison',
                        'equity_trading': null,
                        'future_trading': null,
                        'margin_flag': null,
                        'contact_phone': null,
                        'business_registration_code': null,
                        'corporate_taxpayer_identification_number': null,
                        'margin_account': null,
                        'representative_name': null,
                        'date_of_birth': null,
                        'personal_papers_type': null,
                        'personal_papers_number': null,
                        'date_granted_identity_papers': null
                      },
                      'color': 0
                    }
                  }
                ]
              }
            ]
          },
          {
            'type': 'column',
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'width': percentWidth,
            'content': [
              {
                'type': 'stack',
                'header': {

                },
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'width': 37.884078212290504,
                'height': 50,
                'content': [
                  {
                    'type': 'component',
                    'component': 'MarketDepth',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_market_depth',
                    'componentState': {
                      'color': 0
                    }
                  }
                ]
              },
              {
                'type': 'stack',
                'header': {

                },
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': 50,
                'content': [
                  {
                    'type': 'component',
                    'component': 'CourseOfSale',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_course_of_sales',
                    'componentState': {
                      'color': 0
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }

  const getRetailUserTradingDefaultLayout = (percentHeightTop = 40, percentWidth = 20) => {
    return [
      {
        'type': 'row',
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'content': [
          {
            'type': 'column',
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'width': percentWidth,
            'content': [
              {
                'type': 'stack',
                'width': 20,
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': percentHeightTop,
                'content': [
                  {
                    'type': 'component',
                    'component': 'MarketOverview',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_market_overview',
                    'componentState': {
                      'showLoading': false,
                      'color': 0,
                      'colState': '[{"colId":"company_name","hide":false,"aggFunc":null,"width":119,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":84,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":91,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":71,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":false,"aggFunc":null,"width":96,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":true,"aggFunc":null,"width":69,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
                      'colStatesecond': '[{"colId":"symbol","hide":false,"aggFunc":null,"width":155,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":132,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                    }
                  }
                ]
              },
              {
                'type': 'stack',
                'header': {},
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': 100 - percentHeightTop,
                'content': [
                  {
                    'type': 'component',
                    'component': 'WatchlistBottom',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_watchlist',
                    'componentState': {
                      'showLoading': false,
                      'color': 0,
                      'sortState': '[{"colId":"display_name","sort":"asc"}]',
                      'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":131,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":78,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":82,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":76,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":88,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_price","hide":false,"aggFunc":null,"width":104,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":false,"aggFunc":null,"width":84,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":false,"aggFunc":null,"width":84,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":false,"aggFunc":null,"width":84,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":false,"aggFunc":null,"width":84,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":101,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_size","hide":false,"aggFunc":null,"width":79,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_size","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_size","hide":false,"aggFunc":null,"width":91,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":false,"aggFunc":null,"width":103,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actionOrder","hide":false,"aggFunc":null,"width":130,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"rank","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"Yesterday_settlement_price","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"expiry_date","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"symbol","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"class","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
                      'initTitle': 'lang_watchlist',
                      'initName': 'Favorites',
                      'selectedLayout': 'user-watchlist',
                      'filterState': '{}'
                    }
                  }
                ]
              }
            ]
          },
          {
            'type': 'row',
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'width': 100 - percentWidth,
            'content': [
              {
                'type': 'stack',
                'header': {},
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': 100,
                'width': 100 - percentWidth,
                'content': [
                  {
                    'type': 'component',
                    'component': 'ChartTV',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_chart',
                    'componentState': {
                      'showLoading': false,
                      'color': 0
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'MarketDepth',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_market_depth',
                    'componentState': {
                      'showLoading': false,
                      'color': 0,
                      'sortState': '[{"colId":"index","sort":"asc"}]',
                      'colState': '[{"colId":"timeFormat","hide":false,"aggFunc":null,"width":89,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"quantity","hide":false,"aggFunc":null,"width":122,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"price","hide":false,"aggFunc":null,"width":164,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"index","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'RelatedNews',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_market_news',
                    'componentState': {
                      'showLoading': false,
                      'color': 0,
                      'colState': '[{"colId":"updated_1","hide":false,"aggFunc":null,"width":71,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"updated","hide":false,"aggFunc":null,"width":96,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"symbol","hide":false,"aggFunc":null,"width":138,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"type_news","hide":false,"aggFunc":null,"width":192,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"title","hide":false,"aggFunc":null,"width":393,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"page_count","hide":false,"aggFunc":null,"width":86,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'Order',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_new_order',
                    'componentState': {
                      'stateOrder': 'NewOrder',
                      'color': 5
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'OrderList',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_orders',
                    'componentState': {
                      'showLoading': false,
                      'color': 0,
                      'account': {},
                      'valFilter': [
                        'WORKING_',
                        'STOPLOSS_',
                        'FILLED_',
                        'CANCELLED_'
                      ],
                      'colState': '[{"colId":"init_time","hide":false,"aggFunc":null,"width":142,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actionOrder","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"side","hide":false,"aggFunc":null,"width":75,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"order_status","hide":false,"aggFunc":null,"width":96,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_name","hide":false,"aggFunc":null,"width":118,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"order_type","hide":false,"aggFunc":null,"width":80,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"quantity","hide":false,"aggFunc":null,"width":67,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"limit_price","hide":false,"aggFunc":null,"width":78,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"filled_price","hide":false,"aggFunc":null,"width":83,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"filled_quantity","hide":false,"aggFunc":null,"width":70,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"stop_price","hide":false,"aggFunc":null,"width":93,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":193,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"est_fees_aud","hide":false,"aggFunc":null,"width":112,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"order_action","hide":false,"aggFunc":null,"width":119,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"condition_name","hide":false,"aggFunc":null,"width":91,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"duration","hide":false,"aggFunc":null,"width":86,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_name","hide":false,"aggFunc":null,"width":156,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"advisor_code","hide":false,"aggFunc":null,"width":108,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_id","hide":false,"aggFunc":null,"width":96,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_order_id","hide":false,"aggFunc":null,"width":120,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"exchange","hide":false,"aggFunc":null,"width":90,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
                      'sortState': '[]'
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'Portfolio',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_portfolio_holding',
                    'componentState': {
                      'color': 0,
                      'account': {},
                      'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":148,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actionOrder","hide":false,"aggFunc":null,"width":92,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":91,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"market_price","hide":false,"aggFunc":null,"width":94,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"average_price","hide":false,"aggFunc":null,"width":92,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"upnl","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"profit_percent","hide":false,"aggFunc":null,"width":103,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value_aud","hide":false,"aggFunc":null,"width":135,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value_convert","hide":false,"aggFunc":null,"width":149,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_val","hide":false,"aggFunc":null,"width":128,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_percent","hide":false,"aggFunc":null,"width":136,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value","hide":false,"aggFunc":null,"width":103,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value","hide":false,"aggFunc":null,"width":117,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                    }
                  }
                ]
              },
              {
                'type': 'stack',
                'header': {},
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': 100,
                'width': percentWidth,
                'content': [
                  {
                    'type': 'component',
                    'component': 'PortfolioSummary',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_portfolio_summary',
                    'componentState': {
                      'showLoading': false,
                      'color': 0,
                      'account': {}
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }

  const getDefaultLayoutNotLogin = () => {
    return [{
      'type': 'row',
      'isClosable': true,
      'reorderEnabled': true,
      'title': '',
      'content': [
        {
          'type': 'column',
          'isClosable': true,
          'reorderEnabled': true,
          'title': '',
          'width': 60.145422686659515,
          'content': [
            {
              'type': 'stack',
              'width': 63.70905716265264,
              'isClosable': true,
              'reorderEnabled': true,
              'title': '',
              'activeItemIndex': 0,
              'height': 58.58895705521472,
              'content': [{
                'type': 'component',
                'component': 'MarketOverview',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_market_overview',
                'componentState': {
                  'color': 0
                }
              }]
            },
            {
              'type': 'stack',
              'header': {

              },
              'isClosable': true,
              'reorderEnabled': true,
              'title': '',
              'activeItemIndex': 0,
              'height': 41.41104294478528,
              'content': [
                {
                  'type': 'component',
                  'component': 'ChartTV',
                  'componentName': 'lm-react-component',
                  'isClosable': true,
                  'reorderEnabled': true,
                  'title': 'lang_chart',
                  'componentState': {
                    'color': 4,
                    'interval': 30
                  }
                }
              ]
            }
          ]
        },
        {
          'type': 'column',
          'isClosable': true,
          'reorderEnabled': true,
          'title': '',
          'width': 39.781797109555924,
          'content': [
            {
              'type': 'stack',
              'header': {

              },
              'isClosable': true,
              'reorderEnabled': true,
              'title': '',
              'activeItemIndex': 0,
              'height': 63.95705521472392,
              'width': 50.681596884128524,
              'content': [{
                'type': 'component',
                'component': 'ChartTV',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_chart',
                'componentState': {
                  'color': 0
                }
              }]
            },
            {
              'type': 'stack',
              'header': {

              },
              'isClosable': true,
              'reorderEnabled': true,
              'title': '',
              'activeItemIndex': 0,
              'height': 36.04294478527608,
              'content': [
                {
                  'type': 'component',
                  'component': 'RelatedNews',
                  'componentName': 'lm-react-component',
                  'isClosable': true,
                  'reorderEnabled': true,
                  'title': 'lang_market_news',
                  'componentState': {
                    'showLoading': false,
                    'color': 0,
                    'colState': '[{"name":"updated"},{"name":"updated_time"},{"name":"symbol"},{"name":"page_count"},{"name":"type_news"},{"name":"title"}]',
                    'valueFilter': ''
                  }
                }
              ]
            }
          ]
        }
      ]
    }
    ]
  }

  const getRetailFutureDefaultLayout = () => {
    return [{
      'type': 'column',
      'isClosable': true,
      'reorderEnabled': true,
      'title': '',
      'content': [{
        'type': 'row',
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'height': 53.6118363794604,
        'content': [{
          'type': 'stack',
          'width': 50,
          'height': 37.5,
          'isClosable': true,
          'reorderEnabled': true,
          'title': '',
          'activeItemIndex': 1,
          'content': [{
            'type': 'component',
            'component': 'WatchlistBottom',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_watchlist',
            'componentState': {
              'color': 0,
              'sortState': '[]',
              'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":191,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_size","hide":false,"aggFunc":null,"width":86,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_price","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_size","hide":false,"aggFunc":null,"width":100,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_size","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":87,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"Yesterday_settlement_price","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":false,"aggFunc":null,"width":109,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":220,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"expiry_date","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"master_name","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_master_code","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
              'initTitle': 'lang_watchlist',
              'initName': 'Favorites'
            }
          }, {
            'type': 'component',
            'component': 'WatchlistBottom',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_watchlist',
            'componentState': {
              'color': 4,
              'sortState': '[]',
              'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":190,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_size","hide":false,"aggFunc":null,"width":83,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_price","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_size","hide":false,"aggFunc":null,"width":100,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_size","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":87,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"Yesterday_settlement_price","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":false,"aggFunc":null,"width":109,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":362,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"expiry_date","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"master_name","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_master_code","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
              'initTitle': 'lang_watchlist',
              'initName': 'Favorites',
              'selectedLayout': 'user-watchlist',
              'valueFilter': '',
              'filterState': '{}'
            }
          }, {
            'type': 'component',
            'component': 'WatchlistBottom',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_watchlist',
            'componentState': {
              'color': 4,
              'sortState': '[]',
              'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_size","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_price","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_size","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_size","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"Yesterday_settlement_price","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"expiry_date","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"master_name","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_master_code","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
              'initTitle': 'lang_watchlist',
              'initName': 'Favorites',
              'selectedLayout': 'user-watchlist'
            }
          }, {
            'type': 'component',
            'component': 'WatchlistBottom',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_watchlist',
            'componentState': {
              'color': 4,
              'sortState': '[]',
              'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":96,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_size","hide":false,"aggFunc":null,"width":55,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":57,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_price","hide":false,"aggFunc":null,"width":67,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_size","hide":false,"aggFunc":null,"width":60,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":55,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_size","hide":false,"aggFunc":null,"width":58,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":55,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":58,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":59,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":false,"aggFunc":null,"width":55,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":false,"aggFunc":null,"width":55,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":false,"aggFunc":null,"width":55,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"Yesterday_settlement_price","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":false,"aggFunc":null,"width":66,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":false,"aggFunc":null,"width":55,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":98,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"expiry_date","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"master_name","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_master_code","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
              'initTitle': 'lang_watchlist',
              'initName': 'Favorites',
              'selectedLayout': 'user-watchlist'
            }
          }]
        }, {
          'type': 'stack',
          'header': {},
          'isClosable': true,
          'reorderEnabled': true,
          'title': '',
          'activeItemIndex': 0,
          'width': 50,
          'content': [{
            'type': 'component',
            'component': 'ChartTV',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_chart',
            'componentState': {
              'color': 0,
              'chartID': 'ae646d9b-53dc-4f65-984b-ca47dcd1393a',
              'actionType': 'override',
              'lastAction': 1575008209903,
              'usingChartLayout': 'ae646d9b-53dc-4f65-984b-ca47dcd1393a'
            }
          }, {
            'type': 'component',
            'component': 'Order',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_new_order',
            'componentState': { 'stateOrder': 'NewOrder', 'data': { 'side': 'BUY' }, 'color': 5, 'initTitle': 'lang_new_order' }
          }, {
            'type': 'component',
            'component': 'RelatedNews',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_market_news',
            'componentState': {
              'color': 0,
              'colState': '[{"colId":"updated","hide":false,"aggFunc":null,"width":115,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"updated_1","hide":false,"aggFunc":null,"width":90,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"symbol","hide":false,"aggFunc":null,"width":190,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"page_count","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"type_news","hide":false,"aggFunc":null,"width":241,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"title","hide":false,"aggFunc":null,"width":415,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
            }
          }]
        }]
      }, {
        'type': 'stack',
        'header': {},
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'activeItemIndex': 0,
        'height': 46.3881636205396,
        'width': 100,
        'content': [{
          'type': 'component',
          'component': 'Portfolio',
          'componentName': 'lm-react-component',
          'isClosable': true,
          'reorderEnabled': true,
          'title': 'lang_portfolio_holding',
          'componentState': {
            'account': {
              'account_id': '182756',
              'account_name': 'QUANT EDGE PTY LTD',
              'currency': 'AUD',
              'address_line_1': 'UNIT 614',
              'email': 'equix.support@quant-edge.com',
              'mobile_phone': '61481080999',
              'fax': null,
              'status': 'active',
              'sources': null,
              'hin': '0082989064',
              'advisor_code': 'OMR',
              'broker_id': null,
              'pid': null,
              'client_type': 'Normal',
              'driver_licence': null,
              'date_created': 'Oct  9 2018',
              'trading_account': null,
              'work_phone': null,
              'warrants_trading': 1,
              'options_trading': 1,
              'branch': 'BR00000000',
              'om_equix_status': '1',
              'actor': 'system',
              'last_update': 1574197724958,
              'actor_market': 'system',
              'last_update_market': 1574197724958,
              'us_market': 2,
              'au_market': 3,
              'organisation_code': '03',
              'advisor_name': 'OpenMarkets',
              'address_line_2': '6 STATION STREET',
              'address_line_3': 'MOORABBIN  VIC',
              'address_line_4': null,
              'home_phone': null,
              'account_type': 'Company',
              'branch_code': '03',
              'international_trading': '1',
              'equities_brokerage_schedule': '$0.00+$13.95-0.070%',
              'options_brokerage_schedule': null,
              'bank_institution_code': 'MBL',
              'bsb': '182-512',
              'bank_account_number': '966058240',
              'bank_account_name': 'QUANT EDGE PTY LTD',
              'bank_transaction_type': 'DRCR',
              'account_designation': null,
              'contractnote_email_address': 'equix.support@quant-edge.com',
              'post_code': '3189',
              'country_code': 'AU',
              'cross_reference': '182756',
              'source': 'Agility',
              'equity_trading': null,
              'future_trading': null,
              'address': 'UNIT 614, 6 STATION STREET, MOORABBIN  VIC, 3189, AU'
            },
            'color': 0,
            'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":193,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":313,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":111,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"market_price","hide":false,"aggFunc":null,"width":124,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"average_price","hide":false,"aggFunc":null,"width":124,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value_convert","hide":false,"aggFunc":null,"width":151,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value","hide":false,"aggFunc":null,"width":136,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value_convert","hide":false,"aggFunc":null,"width":170,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value","hide":false,"aggFunc":null,"width":136,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_val","hide":false,"aggFunc":null,"width":124,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_percent","hide":false,"aggFunc":null,"width":111,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"upnl","hide":false,"aggFunc":null,"width":129,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"profit_percent","hide":false,"aggFunc":null,"width":102,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actionOrder","hide":false,"aggFunc":null,"width":108,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
            'sortState': '[]'
          }
        }]
      }]
    }];
  }

  const getAdvisorFutureDefaultLayout = () => {
    return [{
      'type': 'column',
      'isClosable': true,
      'reorderEnabled': true,
      'title': '',
      'content': [{
        'type': 'row',
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'height': 62.5,
        'content': [{
          'type': 'stack',
          'header': {},
          'isClosable': true,
          'reorderEnabled': true,
          'title': '',
          'activeItemIndex': 1,
          'height': 100,
          'width': 48.13725490196079,
          'content': [{
            'type': 'component',
            'component': 'WatchlistBottom',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_watchlist',
            'componentState': {
              'showLoading': false,
              'color': 0,
              'sortState': '[]',
              'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":192,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_size","hide":false,"aggFunc":null,"width":82,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_price","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_size","hide":false,"aggFunc":null,"width":99,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_size","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":87,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":86,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"Yesterday_settlement_price","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":false,"aggFunc":null,"width":109,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":272,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"expiry_date","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"master_name","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_master_code","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
              'initTitle': 'lang_watchlist',
              'initName': 'Favorites',
              'selectedLayout': 'user-watchlist',
              'filterState': '{}'
            }
          }, {
            'type': 'component',
            'component': 'WatchlistBottom',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_watchlist',
            'componentState': {
              'color': 4,
              'sortState': '[]',
              'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":190,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_size","hide":false,"aggFunc":null,"width":82,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_price","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_size","hide":false,"aggFunc":null,"width":99,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_size","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"Yesterday_settlement_price","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":false,"aggFunc":null,"width":109,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":358,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"expiry_date","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"master_name","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_master_code","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
              'initTitle': 'lang_watchlist',
              'initName': 'Favorites',
              'selectedLayout': 'user-watchlist'
            }
          }, {
            'type': 'component',
            'component': 'WatchlistBottom',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_watchlist',
            'componentState': {
              'color': 4,
              'sortState': '[]',
              'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":154,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_size","hide":false,"aggFunc":null,"width":82,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_price","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_size","hide":false,"aggFunc":null,"width":99,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_size","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":87,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"Yesterday_settlement_price","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":false,"aggFunc":null,"width":109,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":186,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"expiry_date","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"master_name","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_master_code","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
              'initTitle': 'lang_watchlist',
              'initName': 'Favorites',
              'selectedLayout': 'user-watchlist'
            }
          }, {
            'type': 'component',
            'component': 'WatchlistBottom',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_watchlist',
            'componentState': {
              'color': 4,
              'sortState': '[]',
              'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":192,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_size","hide":false,"aggFunc":null,"width":82,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_price","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_size","hide":false,"aggFunc":null,"width":99,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_size","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"Yesterday_settlement_price","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":false,"aggFunc":null,"width":109,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":false,"aggFunc":null,"width":74,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":326,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"expiry_date","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"master_name","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_master_code","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
              'initTitle': 'lang_watchlist',
              'initName': 'Favorites',
              'selectedLayout': 'user-watchlist'
            }
          }]
        }, {
          'type': 'stack',
          'header': {},
          'isClosable': true,
          'reorderEnabled': true,
          'title': '',
          'activeItemIndex': 0,
          'height': 100,
          'width': 51.86274509803921,
          'content': [{
            'type': 'component',
            'component': 'ChartTV',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_chart',
            'componentState': {
              'showLoading': false,
              'color': 0,
              'chartID': '3b6a31ac-03fc-4a08-9351-366dddf026ab',
              'actionType': 'override',
              'lastAction': 1575021913317
            }
          }, {
            'type': 'component',
            'component': 'NewReport',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_reports',
            'componentState': {
              'color': 5
            }
          }]
        }]
      }, {
        'type': 'row',
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'height': 37.5,
        'content': [{
          'type': 'stack',
          'header': {},
          'isClosable': true,
          'reorderEnabled': true,
          'title': '',
          'activeItemIndex': 0,
          'height': 37.5,
          'width': 50,
          'content': [{
            'type': 'component',
            'component': 'UserAccount',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_client_management',
            'componentState': {
              'account': {},
              'color': 0,
              'filterState': '{"status":{"value":["active"],"operator":"OR","filterType":"text","checkAll":0}}',
              'filterText': ''
            }
          }]
        }, {
          'type': 'stack',
          'header': {},
          'isClosable': true,
          'reorderEnabled': true,
          'title': '',
          'activeItemIndex': 1,
          'width': 50,
          'content': [{
            'type': 'component',
            'component': 'AllHoldings',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_all_holdings',
            'componentState': {
              'color': 0,
              'colState': '[{"colId":"ag-Grid-AutoColumn-symbol","hide":false,"aggFunc":null,"width":30,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"account_id","hide":false,"aggFunc":"sum","width":118,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_name","hide":false,"aggFunc":"sum","width":150,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"symbol","hide":true,"aggFunc":null,"width":30,"pivotIndex":null,"pinned":null,"rowGroupIndex":0},{"colId":"display_name","hide":false,"aggFunc":"sum","width":90,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":"first","width":121,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"side","hide":false,"aggFunc":"first","width":76,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":"sum","width":124,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"market_price","hide":false,"aggFunc":"sum","width":129,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"average_price","hide":false,"aggFunc":"sum","width":126,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value_convert","hide":false,"aggFunc":"sum","width":259,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value","hide":true,"aggFunc":"sum","width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value_convert","hide":false,"aggFunc":"sum","width":279,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value","hide":true,"aggFunc":"sum","width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_val","hide":false,"aggFunc":"sum","width":112,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_percent","hide":false,"aggFunc":"sum","width":124,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"upnl","hide":false,"aggFunc":"sum","width":103,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"profit_percent","hide":false,"aggFunc":"sum","width":113,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
            }
          }, {
            'type': 'component',
            'component': 'AllOrders',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_all_orders',
            'componentState': {
              'color': 0,
              'openWidget': 'OrderList',
              'filter': { 'option': ['WORKING_', 'STOPLOSS_', 'FILLED_', 'CANCELLED_'], 'duration': 'Day' },
              'sortState': '[{"colId":"updated","sort":"desc"}]',
              'valFilter': ['WORKING_', 'STOPLOSS_', 'FILLED_', 'CANCELLED_']
            }
          }]
        }]
      }]
    }];
  }

  const getQEITDefaultLayoutDev = () => {
    return [
      {
        'type': 'row',
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'content': [
          {
            'type': 'column',
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'width': 57.3632538569425,
            'content': [
              {
                'type': 'stack',
                'header': {},
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': 54.39137134052389,
                'width': 56.5647133680889,
                'content': [
                  {
                    'type': 'component',
                    'component': 'AllHoldings',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_all_holdings',
                    'componentState': {
                      'color': 0,
                      'colState': '[{"colId":"account_id","hide":false,"aggFunc":null,"width":92,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"display_name","hide":false,"aggFunc":null,"width":122,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"today_change_percent","hide":false,"aggFunc":null,"width":123,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"upnl","hide":false,"aggFunc":null,"width":105,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"profit_percent","hide":false,"aggFunc":null,"width":87,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_val","hide":false,"aggFunc":null,"width":86,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":true,"aggFunc":null,"width":257,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"market_price","hide":false,"aggFunc":null,"width":99,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"average_price","hide":false,"aggFunc":null,"width":105,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"account_name","hide":false,"aggFunc":null,"width":342,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value_convert","hide":true,"aggFunc":null,"width":199,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value","hide":true,"aggFunc":null,"width":94,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value_convert","hide":true,"aggFunc":null,"width":215,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value","hide":true,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
                      'sortState': '[]'
                    }
                  }
                ]
              },
              {
                'type': 'stack',
                'header': {},
                'isClosable': true,
                'reorderEnabled': true,
                'title': '',
                'activeItemIndex': 0,
                'height': 45.60862865947611,
                'content': [
                  {
                    'type': 'component',
                    'component': 'WatchlistBottom',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_watchlist',
                    'componentState': {
                      'color': 0,
                      'sortState': '[{"colId":"rank","sort":"asc"}]',
                      'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":194,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":99,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":99,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":91,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_size","hide":true,"aggFunc":null,"width":82,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":99,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_price","hide":false,"aggFunc":null,"width":115,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_size","hide":true,"aggFunc":null,"width":99,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_size","hide":true,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":109,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":true,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":true,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":true,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"Yesterday_settlement_price","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":true,"aggFunc":null,"width":108,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":true,"aggFunc":null,"width":87,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":true,"aggFunc":null,"width":270,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"expiry_date","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"master_name","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_master_code","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"rank","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
                      'initTitle': 'lang_watchlist',
                      'initName': 'Favorites',
                      'selectedLayout': 'user-watchlist'
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'MarketOverview',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_market_overview',
                    'componentState': {
                      'color': 0,
                      'colState': '[{"colId":"company_name","hide":false,"aggFunc":null,"width":293,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":166,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":184,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":159,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":true,"aggFunc":null,"width":69,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":true,"aggFunc":null,"width":108,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":true,"aggFunc":null,"width":67,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":true,"aggFunc":null,"width":63,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":true,"aggFunc":null,"width":74,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
                      'colStatesecond': '[{"colId":"symbol","hide":false,"aggFunc":null,"width":427,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":375,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                    }
                  },
                  {
                    'type': 'component',
                    'component': 'MarketDepth',
                    'componentName': 'lm-react-component',
                    'isClosable': true,
                    'reorderEnabled': true,
                    'title': 'lang_market_depth',
                    'componentState': {
                      'color': 0,
                      'sortState': '[{"colId":"index","sort":"asc"}]',
                      'disableCollapse': false,
                      'colState': '[{"colId":"time","hide":false,"aggFunc":null,"width":196,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"quantity","hide":false,"aggFunc":null,"width":103,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"price","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"index","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
                    }
                  }
                ]
              }
            ]
          },
          {
            'type': 'stack',
            'header': {},
            'isClosable': true,
            'reorderEnabled': true,
            'title': '',
            'activeItemIndex': 0,
            'height': 100,
            'width': 42.6367461430575,
            'content': [
              {
                'type': 'component',
                'component': 'Portfolio',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_portfolio_holding',
                'componentState': {
                  'account': {
                    'account_id': '159713',
                    'account_name': 'HUMAN FACTORS ASSISTANT PAMELA STREICH',
                    'currency': 'AUD',
                    'address_line_1': '368 Kristian Island Avon',
                    'email': 'Marielle_Watsica@hotmail.com',
                    'mobile_phone': '523-763-6343',
                    'fax': null,
                    'status': 'active',
                    'sources': null,
                    'hin': '0098781023',
                    'advisor_code': 'EQ1',
                    'broker_id': null,
                    'pid': '27978',
                    'client_type': null,
                    'driver_licence': null,
                    'date_created': 'Apr 1 2019',
                    'trading_account': null,
                    'work_phone': '523-763-6343',
                    'warrants_trading': 0,
                    'options_trading': 0,
                    'branch': 'BR00000000',
                    'om_equix_status': '1',
                    'actor': 'system',
                    'last_update': 1554451883786,
                    'actor_market': 'system',
                    'last_update_market': 1554451883786,
                    'us_market': 2,
                    'au_market': 3,
                    'organisation_code': '1433',
                    'advisor_name': 'EquixMarket',
                    'address_line_2': 'Hawaii',
                    'address_line_3': 'Kelleyborough',
                    'address_line_4': 'Sierra Leone',
                    'home_phone': '493-573-5534',
                    'account_type': 'Individual',
                    'branch_code': '144',
                    'international_trading': '0',
                    'equities_brokerage_schedule': '$0.00+$13.95-0.070%',
                    'options_brokerage_schedule': '$0.00+$13.95-0.000%',
                    'bank_institution_code': 'HBA',
                    'bsb': '575-820',
                    'bank_account_number': '163006896',
                    'bank_account_name': 'HUMAN FACTORS ASSISTANT PAMELA STREICH COMPANY',
                    'bank_transaction_type': 'DRCR',
                    'account_designation': 'PAMELA STREICH PTY',
                    'contractnote_email_address': 'Marielle_Watsica@hotmail.com',
                    'post_code': '59200',
                    'country_code': 'FK',
                    'cross_reference': '159713',
                    'address': '368 Kristian Island Avon, Hawaii, Kelleyborough, Sierra Leone, 59200, FK'
                  },
                  'color': 0,
                  'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":122,"pivotIndex":null,"pinned":"left","rowGroupIndex":null},{"colId":"upnl","hide":false,"aggFunc":null,"width":105,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"profit_percent","hide":false,"aggFunc":null,"width":93,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_val","hide":false,"aggFunc":null,"width":86,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"today_change_percent","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"market_price","hide":false,"aggFunc":null,"width":99,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":true,"aggFunc":null,"width":161,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"average_price","hide":false,"aggFunc":null,"width":105,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value_convert","hide":true,"aggFunc":null,"width":129,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"book_value","hide":true,"aggFunc":null,"width":94,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value_convert","hide":true,"aggFunc":null,"width":144,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"value","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
                  'sortState': '[]',
                  'defaultOptionPortfolio': 'Holdings'
                }
              },
              {
                'type': 'component',
                'component': 'PortfolioSummary',
                'componentName': 'lm-react-component',
                'isClosable': true,
                'reorderEnabled': true,
                'title': 'lang_portfolio_summary',
                'componentState': {
                  'account': {
                    'account_id': '159713',
                    'account_name': 'HUMAN FACTORS ASSISTANT PAMELA STREICH',
                    'currency': 'AUD',
                    'address_line_1': '368 Kristian Island Avon',
                    'email': 'Marielle_Watsica@hotmail.com',
                    'mobile_phone': '523-763-6343',
                    'fax': null,
                    'status': 'active',
                    'sources': null,
                    'hin': '0098781023',
                    'advisor_code': 'EQ1',
                    'broker_id': null,
                    'pid': '27978',
                    'client_type': null,
                    'driver_licence': null,
                    'date_created': 'Apr 1 2019',
                    'trading_account': null,
                    'work_phone': '523-763-6343',
                    'warrants_trading': 0,
                    'options_trading': 0,
                    'branch': 'BR00000000',
                    'om_equix_status': '1',
                    'actor': 'system',
                    'last_update': 1554451883786,
                    'actor_market': 'system',
                    'last_update_market': 1554451883786,
                    'us_market': 2,
                    'au_market': 3,
                    'organisation_code': '1433',
                    'advisor_name': 'EquixMarket',
                    'address_line_2': 'Hawaii',
                    'address_line_3': 'Kelleyborough',
                    'address_line_4': 'Sierra Leone',
                    'home_phone': '493-573-5534',
                    'account_type': 'Individual',
                    'branch_code': '144',
                    'international_trading': '0',
                    'equities_brokerage_schedule': '$0.00+$13.95-0.070%',
                    'options_brokerage_schedule': '$0.00+$13.95-0.000%',
                    'bank_institution_code': 'HBA',
                    'bsb': '575-820',
                    'bank_account_number': '163006896',
                    'bank_account_name': 'HUMAN FACTORS ASSISTANT PAMELA STREICH COMPANY',
                    'bank_transaction_type': 'DRCR',
                    'account_designation': 'PAMELA STREICH PTY',
                    'contractnote_email_address': 'Marielle_Watsica@hotmail.com',
                    'post_code': '59200',
                    'country_code': 'FK',
                    'cross_reference': '159713',
                    'address': '368 Kristian Island Avon, Hawaii, Kelleyborough, Sierra Leone, 59200, FK'
                  },
                  'color': 5
                }
              }
            ]
          }
        ]
      }
    ];
  }

  const getOperatorFutureDefaultLayout = () => {
    return [{
      'type': 'column',
      'isClosable': true,
      'reorderEnabled': true,
      'title': '',
      'content': [{
        'type': 'row',
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'height': 55.63981042654028,
        'content': [{
          'type': 'stack',
          'width': 51.617647058823536,
          'height': 37.5,
          'isClosable': true,
          'reorderEnabled': true,
          'title': '',
          'activeItemIndex': 1,
          'content': [{
            'type': 'component',
            'component': 'WatchlistBottom',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_watchlist',
            'componentState': {
              'color': 0,
              'sortState': '[]',
              'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":191,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_size","hide":false,"aggFunc":null,"width":86,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_price","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_size","hide":false,"aggFunc":null,"width":100,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_size","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":87,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"Yesterday_settlement_price","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":false,"aggFunc":null,"width":109,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":220,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"expiry_date","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"master_name","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_master_code","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
              'initTitle': 'lang_watchlist',
              'initName': 'Favorites',
              'selectedLayout': 'user-watchlist',
              'valueFilter': '',
              'filterState': '{}'
            }
          }, {
            'type': 'component',
            'component': 'WatchlistBottom',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_watchlist',
            'componentState': {
              'color': 4,
              'sortState': '[]',
              'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":190,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_size","hide":false,"aggFunc":null,"width":82,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_price","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_size","hide":false,"aggFunc":null,"width":99,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_size","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"Yesterday_settlement_price","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":false,"aggFunc":null,"width":109,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":false,"aggFunc":null,"width":106,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":358,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"expiry_date","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"master_name","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_master_code","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
              'initTitle': 'lang_watchlist',
              'initName': 'Favorites',
              'selectedLayout': 'user-watchlist'
            }
          }, {
            'type': 'component',
            'component': 'WatchlistBottom',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_watchlist',
            'componentState': {
              'color': 4,
              'sortState': '[]',
              'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":191,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_size","hide":false,"aggFunc":null,"width":83,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_price","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_size","hide":false,"aggFunc":null,"width":100,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_size","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":87,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":97,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"Yesterday_settlement_price","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":false,"aggFunc":null,"width":109,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":220,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"expiry_date","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"master_name","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_master_code","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
              'initTitle': 'lang_watchlist',
              'initName': 'Favorites',
              'selectedLayout': 'user-watchlist'
            }
          }, {
            'type': 'component',
            'component': 'WatchlistBottom',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_watchlist',
            'componentState': {
              'color': 4,
              'sortState': '[]',
              'colState': '[{"colId":"display_name","hide":false,"aggFunc":null,"width":220,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_size","hide":false,"aggFunc":null,"width":96,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"bid_price","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_price","hide":false,"aggFunc":null,"width":127,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"ask_size","hide":false,"aggFunc":null,"width":116,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_price","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"trade_size","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_point","hide":false,"aggFunc":null,"width":101,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"change_percent","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"volume","hide":false,"aggFunc":null,"width":112,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"open","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"high","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"low","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"Yesterday_settlement_price","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"previous_close","hide":false,"aggFunc":null,"width":126,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"close","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"company_name","hide":false,"aggFunc":null,"width":254,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"expiry_date","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"master_name","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"display_master_code","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
              'initTitle': 'lang_watchlist',
              'initName': 'Favorites',
              'selectedLayout': 'user-watchlist'
            }
          }]
        }, {
          'type': 'stack',
          'header': {},
          'isClosable': true,
          'reorderEnabled': true,
          'title': '',
          'activeItemIndex': 0,
          'width': 48.382352941176464,
          'content': [{
            'type': 'component',
            'component': 'ChartTV',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'lang_chart',
            'componentState': {
              'color': 0,
              'chartID': 'ae646d9b-53dc-4f65-984b-ca47dcd1393a',
              'actionType': 'override',
              'lastAction': 1575024021725,
              'usingChartLayout': 'ae646d9b-53dc-4f65-984b-ca47dcd1393a'
            }
          }]
        }]
      }, {
        'type': 'stack',
        'header': {},
        'isClosable': true,
        'reorderEnabled': true,
        'title': '',
        'activeItemIndex': 0,
        'height': 44.36018957345972,
        'content': [{
          'type': 'component',
          'component': 'UserManager',
          'componentName': 'lm-react-component',
          'isClosable': true,
          'reorderEnabled': true,
          'title': 'lang_user_manager',
          'componentState': {
            'color': 5,
            'colState': '[{"colId":"user_id","hide":false,"aggFunc":null,"width":154,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"user_login_id","hide":false,"aggFunc":null,"width":500,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"full_name","hide":false,"aggFunc":null,"width":159,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"user_type","hide":false,"aggFunc":null,"width":105,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"role_group","hide":false,"aggFunc":null,"width":81,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"user_group","hide":false,"aggFunc":null,"width":110,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"access_method","hide":false,"aggFunc":null,"width":155,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"status","hide":false,"aggFunc":null,"width":250,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"email_template","hide":false,"aggFunc":null,"width":136,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"live_news","hide":false,"aggFunc":null,"width":98,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"morningStar","hide":false,"aggFunc":null,"width":122,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"tipRank","hide":false,"aggFunc":null,"width":95,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"brokerData","hide":false,"aggFunc":null,"width":115,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"email","hide":false,"aggFunc":null,"width":223,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"phone","hide":false,"aggFunc":null,"width":142,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"list_mapping","hide":false,"aggFunc":null,"width":500,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"note","hide":false,"aggFunc":null,"width":76,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actor","hide":false,"aggFunc":null,"width":222,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"updated","hide":false,"aggFunc":null,"width":174,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"action","hide":false,"aggFunc":null,"width":109,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]',
            'sortState': '[]'
          }
        }, {
          'type': 'component',
          'component': 'MarketDataManagement',
          'componentName': 'lm-react-component',
          'isClosable': true,
          'reorderEnabled': true,
          'title': 'lang_market_data_man',
          'componentState': {
            'color': 5,
            'colState': '[{"colId":"user_id","hide":false,"aggFunc":null,"width":209,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"market_data_type","hide":false,"aggFunc":null,"width":213,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"market_data_au","hide":false,"aggFunc":null,"width":140,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"market_data_us","hide":false,"aggFunc":null,"width":140,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"market_data_fu","hide":false,"aggFunc":null,"width":120,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"user_login_id","hide":false,"aggFunc":null,"width":331,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"email","hide":false,"aggFunc":null,"width":331,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"full_name","hide":false,"aggFunc":null,"width":214,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"actor","hide":false,"aggFunc":null,"width":299,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"updated","hide":false,"aggFunc":null,"width":234,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
          }
        }, {
          'type': 'component',
          'component': 'BranchManagement',
          'componentName': 'lm-react-component',
          'isClosable': true,
          'reorderEnabled': true,
          'title': 'lang_vetting_rules_man',
          'componentState': {
            'color': 5,
            'sortState': '[{"colId":"market_type","sort":"desc"},{"colId":"rule","sort":"asc"}]',
            'colState': '[{"colId":"market_type","hide":true,"aggFunc":null,"width":200,"pivotIndex":null,"pinned":null,"rowGroupIndex":0},{"colId":"rule","hide":false,"aggFunc":null,"width":79,"pivotIndex":null,"pinned":null,"rowGroupIndex":1},{"colId":"conditional_rule","hide":false,"aggFunc":null,"width":423,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"validate","hide":false,"aggFunc":null,"width":339,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"DEFAULT VETTING RULES","hide":false,"aggFunc":null,"width":305,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"FUTURE MARKET CASH VETTING RULES","hide":false,"aggFunc":null,"width":443,"pivotIndex":null,"pinned":null,"rowGroupIndex":null},{"colId":"AU & US MARKET CASH VETTING RULES","hide":false,"aggFunc":null,"width":443,"pivotIndex":null,"pinned":null,"rowGroupIndex":null}]'
          }
        }]
      }]
    }];
  }

  const getSuperAdminDefaultLayout = (w, h) => {
    return getRetailUserTradingDefaultLayout(w, h)
  }

  const getAdminDefaultLayout = (w, h) => {
    return getRetailUserTradingDefaultLayout(w, h)
  }

  const getAdvisorViewOnlyDefaultLayout = (w, h) => {
    return getRetailViewOnlyLayout(w, h)
  }

  const getChineseUserTradingDefaultLayout = (w, h) => {
    return getRetailViewOnlyLayout(w, h)
  }

  const getRetailUserViewOnlyDefaultLayout = (w, h) => {
    return getRetailViewOnlyLayout(w, h)
  }

  const getEndClientUserViewOnlyDefaultLayout = (w, h) => {
    return getRetailViewOnlyLayout(w, h)
  }

  const getLayoutByUserType = (w, h) => {
    switch (dataStorage.userInfo.user_type) {
      case role.OPERATION: return getOperatorLayout(w, h)
      default: return getDefaultLayoutAfterLogin(w, h)
    }
  }

  const getLayout = (w, h) => {
    if (!dataStorage.userInfo) return getDefaultLayoutNotLogin(w, h)
    if (dataStorage.layout_role) return objLayout[dataStorage.layout_role](w, h);
    else return getLayoutByUserType(w, h)
  }

  const getRetailDefaultLayout = (w, h) => {
    switch (dataStorage.env_config.env) {
      case env.MORRISON:
      case env.EQUIX: return getRetailUserTradingDefaultLayoutMuda(w, h)
      default: return getRetailUserTradingDefaultLayout(w, h)
    }
  }

  const getAdvisorDefaultLayout = (w, h) => {
    switch (dataStorage.env_config.env) {
      case env.MORRISON:
      case env.EQUIX: return getAdvisorTradingDefaultLayoutMuda(w, h)
      default: return getAdvisorTradingDefaultLayout(w, h)
    }
  }

  const getOperatorDefaultLayout = (w, h) => {
    switch (dataStorage.env_config.env) {
      case env.MORRISON:
      case env.EQUIX: return getOperatorDTRDefaultLayoutMuda(w, h)
      default: return getOperatorDTRDefaultLayout(w, h)
    }
  }

  const getQEITDefaultLayout = (w, h) => {
    switch (dataStorage.env_config.env) {
      case env.MORRISON:
      case env.EQUIX: return getRetailUserTradingDefaultLayoutMuda(w, h)
      default: return getQEITDefaultLayoutDev(w, h)
    }
  }

  objLayout.LAYOUT_0 = getSuperAdminDefaultLayout
  objLayout.LAYOUT_1 = getAdminDefaultLayout
  objLayout.LAYOUT_2 = getOperatorDefaultLayout
  objLayout.LAYOUT_3 = getStaffDefaultLayout
  objLayout.LAYOUT_4 = getAdvisorDefaultLayout
  objLayout.LAYOUT_5 = getAdvisorViewOnlyDefaultLayout
  objLayout.LAYOUT_6 = getRetailDefaultLayout
  objLayout.LAYOUT_7 = getChineseUserTradingDefaultLayout
  objLayout.LAYOUT_8 = getRetailUserViewOnlyDefaultLayout
  objLayout.LAYOUT_9 = getEndClientUserTradingDefaultLayout
  objLayout.LAYOUT_10 = getEndClientUserViewOnlyDefaultLayout
  objLayout.LAYOUT_11 = getTradingFutureDefaultLayout
  objLayout.LAYOUT_12 = getRetailFutureDefaultLayout
  objLayout.LAYOUT_13 = getAdvisorFutureDefaultLayout
  objLayout.LAYOUT_14 = getOperatorFutureDefaultLayout
  objLayout.LAYOUT_15 = getQEITDefaultLayout
  objLayout.getLayout = getLayout
}
dataStorage.listFunctionInit.push(init);
export default objLayout;
