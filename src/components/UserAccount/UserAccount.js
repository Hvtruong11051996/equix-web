import React, { Component } from 'react';
import { translate } from 'react-i18next';
import uuidv4 from 'uuid/v4';
import errorEnum from '../../constants/error_enum';
import MapRoleComponent from '../../constants/map_role_component';
import role from '../../constants/role';
import statusEnum from '../../constants/status_enum';
import userTypeEnum from '../../constants/user_type_enum';
import dataStorage from '../../dataStorage';
import { addEventListener, EVENTNAME, removeEventListener } from '../../helper/event';
import { convertObjFilter } from '../../helper/FilterAndSort';
import { checkRoleWidget, formatNumberValue, getCsvFile, hideElement } from '../../helper/functionUtils';
import logger from '../../helper/log';
import * as helper from '../../helper/request';
import { getApiFilter } from '../api';
import CanvasGrid from '../Inc/CanvasGrid';
import { FORM } from '../Inc/CanvasGrid/Constant/gridConstant';
import FilterBox from '../Inc/FilterBox';
import ListCheckBoxComponent from '../Inc/Grid/ListCheckBoxComponent';
import Lang from '../Inc/Lang';
import MoreOption from '../Inc/MoreOption';
import ToggleLine from '../Inc/ToggleLine';

const PAGE_SIZE = 50;
const PAGINATION_DEFAULT = {
  current_page: 1,
  total_count: 0,
  total_pages: 0,
  page_size: PAGE_SIZE
}
const GRID_LEVEL = [80, 50, 50]
const DEFAULT_VALUE = '--'
export class UserAccount extends Component {
  constructor(props) {
    super(props);
    const initState = this.props.loadState();
    checkRoleWidget(this, MapRoleComponent.UserAccount, null, [userTypeEnum.ADVISOR, userTypeEnum.RETAIL]);
    this.error = null;
    this.collapse = initState.collapse ? 1 : 0
    this.filterText = initState.filterText || '';
    this.setPageUser = null;
    this.setPageAccount = null;
    this.listUser = [];
    this.id = uuidv4();
    this.listAccount = [];
    this.paginationUser = PAGINATION_DEFAULT;
    this.paginationAccount = PAGINATION_DEFAULT;
    this.state = {
      columns: dataStorage.userInfo && dataStorage.userInfo.user_type === role.OPERATION ? this.getUserColumn() : this.getAccountColumn(),
      listUser: [],
      listAccount: [],
      accountFilter: '',
      userFilter: ''
    }
    props.glContainer.on('show', () => {
      hideElement(props, false, this.id);
    });
    props.glContainer.on('hide', () => {
      hideElement(props, true, this.id);
    });
    this.createData = this.createData.bind(this)
  }

  connectionChanged = isConnected => {
    if (isConnected && this.error === errorEnum.NETWORK_ERROR) {
      this.onChangeText(this.filterText);
      this.error = null;
    }
    this.opt && this.opt.api && this.opt.api.refreshView();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.isHidden) return false;
    return true;
  }

  componentDidMount() {
    addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
    addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
    if (dataStorage.userInfo && dataStorage.userInfo.user_type === role.OPERATION) {
      this.getDataAllAccount(1, this.filterText, () => {
        this.setData && this.setData(this.listUser)
      });
    } else {
      const cb = () => {
        this.setData2 && this.setData2(this.listAccount)
        console.log('this.setData2 :>> ', this.setData2);
      }
      this.getFilterOnSearch(null, null, { page: 1, cb })
    }
  }

  refreshData = eventName => {
    if (eventName !== 'refresh') return;
    this.onChangeText(this.filterText);
  }

  componentWillUnmount() {
    removeEventListener(EVENTNAME.clickToRefresh, this.refreshData)
    removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
  }

  getDataAllAccount(pageId, filterText, cb = this.setData2) {
    try {
      let cbfilter2 = this.filterAndSearch ? helper.postData : helper.getData;
      const oldText = filterText;
      const userId = dataStorage.userInfo.user_id;
      let url;
      if (this.filterAndSearch) {
        url = getApiFilter('account', pageId)
      }
      this.props.loading(true);
      cbfilter2(url, this.filterAndSearch)
        .then(snap => {
          this.props.loading(false)
          this.error = null;
          const listData = snap && snap.data && snap.data.data ? snap.data.data : [];
          this.listAccount = listData;
          const obj = {};
          obj.current_page = snap && snap.data && snap.data.current_page ? parseInt(snap.data.current_page) : 1;
          obj.total_count = snap && snap.data && snap.data.total_count ? snap.data.total_count : 0;
          obj.total_pages = snap && snap.data && snap.data.total_pages ? snap.data.total_pages : 0;
          obj.page_size = PAGE_SIZE;
          this.setPageAccount(obj);
          this.paginationAccount = obj;
          if (this.listAccount.length) {
            let stringQuery = this.listAccount.map((val) => {
              dataStorage.accountsObjDic[`${val.account_id}`] = val;
              return val.account_id;
            }).join(',');
            const balanceUrl = helper.getBalanceForAccount(stringQuery);
            this.props.loading(true);
            helper.getData(balanceUrl)
              .then(response => {
                this.props.loading(false);
                if (oldText !== this.filterText) cb && cb(obj);
                if (response && response.data) {
                  let listBalance = response.data;
                  const dicAccBalance = {}
                  if (listBalance && listBalance.account_balances) {
                    listBalance.account_balances.forEach((val, i) => {
                      dicAccBalance[val.account_id] = val
                    })
                  }
                  for (let index = 0; index < this.listAccount.length; index++) {
                    const el = this.listAccount[index];
                    const val = dicAccBalance[el.account_id] || {}
                    el.account_balance = val.amount;
                    el.total_market_value = val.total_market_value;
                    el.total_profit_amount = val.total_profit_amount;
                    el.total_profit_percent = val.total_profit_percent;
                  }
                  cb && cb(this.listAccount);
                  setTimeout(() => {
                    this.createData(listBalance.total_account_balance, listBalance.total_market_value, listBalance.total_profit_amount, listBalance.total_profit_percent);
                  }, 200);
                } else {
                  cb && cb(obj);
                }
              })
              .catch(error => {
                this.props.loading(false)
                logger.log('getDataAllAccount: ', error)
                cb && cb(obj);
              })
          } else {
            this.listAccount = []
            cb && cb(obj);
          }
        })
        .catch(error => {
          this.props.loading(false)
          logger.log('getDataAllAccount: ', error)
          if (error.message && error.message !== '' && error.message.toUpperCase() === errorEnum.NETWORK_ERROR) {
            this.error = errorEnum.NETWORK_ERROR;
          } else {
            this.listAccount = [];
            cb && cb(PAGINATION_DEFAULT);
          }
        })
    } catch (error) {
      logger.log('getDataAllAccount exception: ', error)
    }
  }

  getAccountColumn() {
    return [
      {
        headerName: 'lang_client_id',
        field: 'account_id',
        filter: 'agTextColumnFilter',
        cellRenderer: params => {
          const div = document.createElement('div');
          div.className = 'user-client-man-first-line size--3';
          div.innerText = params.data.account_id || '--';
          return div;
        },
        pinnedRowCellRenderer: (params) => {
          return ''
        }
      },
      {
        headerName: 'lang_client_name',
        field: 'account_name',
        filter: 'agTextColumnFilter',
        pinnedRowCellRenderer: (params) => {
          return ''
        },
        cellRenderer: params => {
          let accountName = '--';
          if (params.data.account_name !== null && params.data.account_name !== undefined) {
            accountName = params.data.account_name;
          }
          const div = document.createElement('div');
          div.className = 'user-client-man-second-line size--3';
          div.innerText = accountName
          return div;
        }
      },
      {
        headerName: 'lang_hin',
        field: 'hin',
        filter: 'agTextColumnFilter',
        pinnedRowCellRenderer: (params) => {
          return ''
        },
        cellRenderer: params => {
          const div = document.createElement('div');
          div.className = 'user-client-man-first-line size--3';
          div.classList.add('align-right');
          div.innerText = params.data.hin || '--';
          return div;
        }
      },
      {
        headerName: 'lang_advisor',
        field: 'advisor_code',
        filter: 'agTextColumnFilter',
        pinnedRowCellRenderer: (params) => {
          return ''
        },
        cellRenderer: params => {
          const div = document.createElement('div');
          div.className = 'user-client-man-second-line size--3';
          div.innerText = params.data.advisor_code || '--';
          return div;
        }
      },
      {
        headerName: 'lang_portfolio_summary',
        field: 'account_balance',
        menuTabs: ['generalMenuTab', 'columnsMenuTab'],
        sortable: false,
        pinnedRowCellRenderer: (params) => {
          let totalMarketValue = '';
          if (params.data.account_balance !== null && params.data.account_balance !== undefined) {
            totalMarketValue = formatNumberValue(params.data.account_balance, true);
          } else {
            totalMarketValue = '--';
          }
          const div = document.createElement('div');
          div.className = 'user-client-man-second-line size--3 align-right pointer-events-auto';
          div.innerText = div.title = div.title = totalMarketValue;
          return div;
        },
        cellRenderer: params => {
          let accountBalance = '';
          if (params.data.account_balance !== null && params.data.account_balance !== undefined) {
            accountBalance = formatNumberValue(params.data.account_balance, true);
          } else {
            accountBalance = '--';
          }
          const div = document.createElement('div');
          div.className = 'user-client-man-first-line size--3';
          div.classList.add('align-right');
          div.innerText = accountBalance
          return div;
        }
      },
      {
        headerName: 'lang_securities_at_market_value',
        field: 'total_market_value',
        menuTabs: ['generalMenuTab', 'columnsMenuTab'],
        sortable: false,
        pinnedRowCellRenderer: (params) => {
          let totalMarketValue = '';
          if (params.data.total_market_value !== null && params.data.total_market_value !== undefined) {
            totalMarketValue = formatNumberValue(params.data.total_market_value, true);
          } else {
            totalMarketValue = '--';
          }
          const div = document.createElement('div');
          div.className = 'user-client-man-second-line size--3 align-right pointer-events-auto';
          div.innerText = div.title = totalMarketValue;
          return div;
        },
        cellRenderer: params => {
          let totalMarketValue = '';
          if (params.data.total_market_value !== null && params.data.total_market_value !== undefined) {
            totalMarketValue = formatNumberValue(params.data.total_market_value, true);
          } else {
            totalMarketValue = '--';
          }
          const div = document.createElement('div');
          div.className = 'user-client-man-second-line size--3';
          div.classList.add('align-right');
          div.innerText = totalMarketValue
          return div;
        }
      },
      {
        headerName: 'lang_profit',
        field: 'total_profit_amount',
        headerIsNumber: true,
        menuTabs: ['generalMenuTab', 'columnsMenuTab'],
        pinnedRowCellRenderer: (params) => {
          let div = document.createElement('div');
          div.innerText = div.title = params.data.total_profit_amount !== null && params.data.total_profit_amount !== undefined ? `${formatNumberValue(params.data.total_profit_amount, true)}` : '--';
          div.className = 'priceNone';
          if (parseFloat(formatNumberValue(params.data.total_profit_amount, true)) > 0) {
            div.className = 'priceUp';
          } else if (parseFloat(formatNumberValue(params.data.total_profit_amount, true)) < 0) {
            div.className = 'priceDown';
          }
          div.className += ' align-right pointer-events-auto';
          return div;
        },
        cellRenderer: params => {
          const div = document.createElement('div');
          div.innerText = params.data.total_profit_amount !== null && params.data.total_profit_amount !== undefined ? formatNumberValue(params.data.total_profit_amount, true) : '--';
          div.className = 'user-client-man-first-line size--3 align-right priceNone';
          if (parseFloat(formatNumberValue(params.data.total_profit_amount, true)) > 0) {
            div.className = ' user-client-man-first-line size--3 align-right priceUp';
          } else if (parseFloat(formatNumberValue(params.data.total_profit_amount, true)) < 0) {
            div.className = ' user-client-man-first-line size--3 align-right priceDown';
          }
          return div;
        }
      },
      {
        headerName: 'lang_percent_profit',
        field: 'total_profit_percent',
        headerIsNumber: true,
        menuTabs: ['generalMenuTab', 'columnsMenuTab'],
        pinnedRowCellRenderer: (params) => {
          let div = document.createElement('div');
          div.innerText = div.title = params.data.total_profit_percent !== null && params.data.total_profit_percent !== undefined ? `${formatNumberValue(params.data.total_profit_percent, true)} %` : '--';
          div.className = 'priceNone';
          if (params.data.total_profit_percent > 0) {
            div.className = 'priceUp';
          } else if (params.data.total_profit_percent < 0) {
            div.className = 'priceDown';
          }
          div.className += ' align-right pointer-events-auto';
          return div;
        },
        cellRenderer: params => {
          let div = document.createElement('div');
          div.innerText = params.data.total_profit_percent !== null && params.data.total_profit_percent !== undefined ? `${formatNumberValue(params.data.total_profit_percent, true)} %` : '--';
          div.className = 'user-client-man-first-line size--3 align-right priceNone';
          if (formatNumberValue(params.data.total_profit_percent, true) > 0) {
            div.className = 'user-client-man-first-line size--3 align-right priceUp';
          } else if (formatNumberValue(params.data.total_profit_percent, true) < 0) {
            div.className = 'user-client-man-first-line size--3 align-right priceDown';
          }
          return div;
        }
      },
      {
        headerName: 'lang_status',
        field: 'status',
        filter: ListCheckBoxComponent,
        filterVal: [
          { label: 'active', value: 'active' },
          { label: 'inactive', value: 'inactive' }
        ],
        filterType: 'text'
      }
    ];
  }

  getUserColumn() {
    return [
      {
        headerName: 'lang_user_login',
        field: 'user_login_id',
        filter: 'agTextColumnFilter',
        cellRenderer: params => {
          const div = document.createElement('div');
          div.className = 'user-client-man-first-line size--3';
          div.innerText = params.data.user_login_id || '--';
          return div;
        }
      },
      {
        headerName: 'lang_client_id',
        field: 'list_mapping',
        filter: 'agTextColumnFilter',
        cellRenderer: params => {
          let listAccountMapping = '--';
          if (params.data.list_mapping !== null && params.data.list_mapping !== undefined) {
            listAccountMapping = params.data.list_mapping;
          }
          const div = document.createElement('div');
          div.className = 'user-client-man-second-line size--3';
          div.innerText = listAccountMapping
          return div;
        }
      },
      {
        headerName: 'lang_status',
        field: 'state',
        filter: ListCheckBoxComponent,
        filterVal: [
          { label: 'lang_active', value: 'Active' },
          { label: 'Disabled', value: 'Disabled' }
        ],
        filterType: 'text',
        cellRenderer: params => {
          const value = params.data.state
          const status = value === statusEnum.ONLINE ? 'Active' : 'Disabled';
          const rootDiv = document.createElement('div');
          rootDiv.className = 'user-status';
          const div = document.createElement('div');
          const icon = document.createElement('div');
          icon.className = 'circle';
          icon.classList.add(status);
          ReactDOM.render(<Lang>{status}</Lang>, div)
          rootDiv.appendChild(div);
          rootDiv.appendChild(icon);
          return rootDiv;
        }
      },
      {
        headerName: 'lang_user_group',
        field: 'role',
        filter: ListCheckBoxComponent,
        filterVal: [
          { label: 'Operator', value: 'Operator' },
          { label: 'Advisor', value: 'Advisor' },
          { label: 'lang_retail', value: 'Retail' },
          { label: 'Client', value: 'Client' }
        ],
        filterType: 'text',
        cellRenderer: params => {
          const div = document.createElement('div');
          let value = params.data.role
          if (value === role.OPERATION) value = role.OPERATOR;
          ReactDOM.render(<Lang>{value}</Lang>, div)
          div.className = 'user-role size--3';
          return div
        }
      }
    ];
  }

  createData(total_account_balance = 0, total_market_value = 0, total_profit_amount = 0, total_profit_percent = 0) {
    let result = [{
      account_balance: total_account_balance,
      total_market_value: total_market_value,
      total_profit_amount: total_profit_amount,
      total_profit_percent: total_profit_percent
    }];
    // this.setPinnedBottomRowData(result)
  }
  onChangeTab() {
    if ((!this.listAccount || !this.listAccount.length)) {
      this.setData2 && this.setData2(this.listAccount)
      this.setState({
        columns: this.getAccountColumn()
      }, () => {
        const text = this.filterText || '';
        const cb = () => {
          this.setData2 && this.setData2(this.listAccount)
          this.setState({
            columns: this.getAccountColumn(),
            accountFilter: text
          });
        }
        const ins = this.opt && this.opt.api.getFilterInstance('status');
        if (ins) {
          ins.setModel({ 'value': ['active'], 'operator': 'OR', 'filterType': 'text', 'checkAll': 0 })
          ins.agParams.filterChangedCallback();
        }
        this.getFilterOnSearch(null, null, { page: 1, cb })
      })
    } else {
      if (this.filterText !== this.state.accountFilter) {
        this.setState({
          columns: this.getAccountColumn()
        }, () => {
          this.onChangeText(this.filterText);
        })
      } else {
        this.setState({
          columns: this.getAccountColumn()
        }, () => {
          this.setData2 && this.setData2(this.listAccount)
          this.setPageAccount(this.paginationAccount)
        });
      }
    }
  }

  renderTabs() {
    if (dataStorage.userInfo && dataStorage.userInfo.user_type === role.OPERATION) {
      return (
        <div className='tabs-view text-capitalize'>
          <div onClick={() => this.onChangeTab(0)} className={`tab size--3`}>
            <Lang>lang_all_user</Lang>
          </div>
          <div onClick={() => this.onChangeTab(1)} className={`tab size--3 tab-active`}>
            <Lang>lang_all_account</Lang>
          </div>
        </div>
      )
    } else {
      return null
    }
  }

  onChangeText = textFilter => {
    const text = textFilter;
    this.filterText = text;
    this.props.saveState({
      filterText: text
    })
    const cb = () => {
      this.setState({
        column: this.getAccountColumn(),
        accountFilter: text
      }, () => {
        this.setData2 && this.setData2(this.listAccount)
      })
    }
    this.getFilterOnSearch(null, null, { page: this.paginationAccount.current_page, cb })
  }

  onRowClicked = dataRow => {
    dataStorage.account_id = dataRow.data.account_id;
    dataStorage.accountInfo = dataRow.data;
    this.props.send({
      account: dataRow.data
    })
  }

  pageChangedAccount = page => {
    this.props.loading(true);
    const cb = () => {
      this.setData2 && this.setData2(this.listAccount)
      this.props.loading(false);
    }
    this.getFilterOnSearch(null, null, { page, cb })
  }

  getFilterOnSearch = (filter, sort, option = {}) => {
    const { cb, page } = option
    if (filter && sort) {
      this.filter = filter;
      this.sort = sort;
    }
    // this.sort = (this.sort || []).filter(item => {
    //   return (item.colId !== 'account_balance') && (item.colId !== 'total_market_value')
    // })
    const filterAndSort = {
      query: this.filter || [],
      sort: this.sort || [],
      filterAll: this.filterText
    }
    this.filterAndSearch = convertObjFilter(filterAndSort)
    this.getDataAllAccount(page, this.filterText, cb);
  }

  setGridPaginate = () => {
    return {
      setPage: cb => {
        this.setPageAccount = cb
      },
      pageChanged: this.pageChangedAccount
    }
  }

  getCsvFunction = (obj) => {
    if (this.csvWoking) return
    this.csvWoking = true
    getCsvFile({
      url: helper.getReportCsvFileUrl('account'),
      body_req: this.filterAndSearch,
      columnHeader: obj.columns,
      lang: dataStorage.lang,
      glContainer: this.props.glContainer
    }, () => {
      this.csvWoking = false;
    });
  }

  getColums = () => {
    let columns = [
      {
        header: 'lang_client_id',
        name: 'account_id',
        width: 140,
        pinned: true
      },
      {
        header: 'lang_user_login',
        name: 'account_name',
        width: 120
      },
      {
        header: 'lang_hin',
        name: 'hin',
        width: 124
      },
      {
        header: 'lang_advisor',
        name: 'advisor_code',
        width: 144
      },
      {
        header: 'lang_portfolio_summary',
        name: 'account_balance',
        width: 144,
        align: 'right'
      },
      {
        header: 'lang_securities_at_market_value',
        name: 'total_market_value',
        width: 144,
        align: 'right'
      },
      {
        header: 'lang_profit',
        name: 'total_profit_amount',
        width: 144,
        align: 'right'
      },
      {
        header: 'lang_percent_profit',
        name: 'total_profit_percent',
        width: 144,
        align: 'right'
      },
      {
        header: 'lang_status',
        name: 'status',
        width: 144,
        align: 'right'
      }
    ];
    return columns;
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
        callback: (boundRef) => this.showColumnMenu(boundRef)
      },
      {
        value: 'Filters',
        label: 'lang_filters',
        callback: (boundRef) => this.showFilterMenu(boundRef)
      }
    ]
  }

  collapseFunc = (collapse) => {
    this.collapse = collapse ? 1 : 0
    this.props.saveState({
      collapse: this.collapse
    })
    this.forceUpdate()
  }
  render() {
    return (
      <div className='user-client-man-container'>
        {this.renderTabs()}
        <div className={`header-wrap isMoreOption flex ${this.collapse ? 'collapse' : ''}`}>
          <div className='navbar more' style={{ width: '100%' }}>
            <FilterBox
              value={this.filterText}
              onChange={this.onChangeText}
            />
          </div>
          <MoreOption agSideButtons={this.createagSideButtons()} />
        </div>
        <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
        <CanvasGrid
          {...this.props}
          id={FORM.USER_MANAGEMENT}
          showProvider={true}
          performance={true}
          onRowClicked={this.onRowClicked.bind(this)}
          getFilterOnSearch={this.getFilterOnSearch}
          paginate={this.setGridPaginate()}
          fn={fn => {
            this.setData2 = fn.setData
            this.exportCSV = fn.exportCsv
            this.resetFilter = fn.resetFilter
            this.autoSize = fn.autoSize
            this.showColumnMenu = fn.showColumnMenu
            this.showFilterMenu = fn.showFilterMenu
            this.autoSize = fn.autoSize
          }}
          fnKey={this.fnKey}
          columns={this.getColums()}
          autoFit={true}
        />

      </div>
    )
  }
}

export default translate('translations')(UserAccount)
