import React from 'react';
import FilterBox from '../Inc/FilterBox';
import { translate } from 'react-i18next';
import dataStorage from '../../dataStorage';
import ButtonGroup from '../Inc/ButtonGroup';
import Tag from '../Inc/Tag';
import { getData, getMarketData, getUserDetailUrl, putData, postData, getReportCsvFileUrl } from '../../helper/request';
import { func } from '../../storage';
import { emitter, eventEmitter } from '../../constants/emitter_enum';
import { registerAllOrders, unregisterAllOrders, unregisterUser, registerUser } from '../../streaming';
import logger from '../../helper/log';
import { clone, checkRole, getIndexOfTimeZone, getCsvFile } from '../../helper/functionUtils';
import Confirm from '../Inc/Confirm';
import uuidv4 from 'uuid/v4';
import MapRoleComponent from '../../constants/map_role_component';
import moment from 'moment';
import Lang from '../Inc/Lang';
import ListCheckBoxComponent from '../Inc/Grid/ListCheckBoxComponent';
import { getApiFilter } from '../api';
import { convertObjFilter, mapFiltertObj } from '../../helper/FilterAndSort';
import config from '../../../public/config';
import ToggleLine from '../Inc/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import CanvasGrid from '../Inc/CanvasGrid';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';
import { MARKETASTATUS } from '../Inc/CanvasGrid/Type/marketData'

const TIMEOUT_DEFAULT = 20000;
const pageSize = 50
const optionsMarketData = [
    {
        label: 'lang_noaccess',
        value: 0
    },
    {
        label: 'lang_delayed',
        value: 1
    },
    {
        label: 'lang_click_2_refresh',
        value: 2
    },
    {
        label: 'lang_realtime',
        value: 3
    }
]

export class MarketDataManagement extends React.Component {
    constructor(props) {
        super(props);
        const initState = this.props.loadState();
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.accountRefresh = func.getStore(emitter.STREAMING_ACCOUNT_DATA);
        this.isConnected = dataStorage.connected;
        this.pageObj = {}
        this.filterText = initState.valueFilter || ''
        this.listResponse = [];
        this.sort = [];
        this.filter = [];
        this.id = uuidv4();
        this.collapse = initState.collapse ? 1 : 0
        this.state = {
            error: '',
            isConnected: dataStorage.connected,
            idShowWarning: false,
            loadingConfirm: false,
            haveErrorOrder: true,
            isNodata: true,
            isEditable: false,
            valueFilter: initState.valueFilter || ''
        }
        props.confirmClose(() => this.state.isEditable)
    }

    getColums = () => {
        let columns = [
            {
                header: 'lang_user_login',
                name: 'user_login_id',
                width: 140,
                pinned: true
            },
            {
                header: 'lang_market_data',
                name: 'market_data_type',
                type: 'dropdown',
                options: optionsMarketData,
                setValue: (params, value, name) => {
                    Object.keys(params.data).forEach(key => {
                        if (key.includes('market_data_type_')) {
                            if (value > 1) {
                                if (params.data.market_data_type > 1 && params.getValue(key)) params.setValue(value, key);
                                else params.setValue(0, key)
                            } else params.setValue(value, key)
                        }
                    });
                    params.setValue(value);
                },
                getBackgroundColorKey: (params) => {
                    let value = params.value;
                    switch (value) {
                        case 0:
                            return '--semantic-danger';
                        case 1:
                            return '--background-gray';
                        case 2:
                            return '--background-yellow';
                        case 3:
                            return '--semantic-success';
                    }
                },
                getTextColorKey: () => {
                    return '--menu-background-hover'
                }
            },
            ...(this.listExchange || []).map(ex => {
                return {
                    headerFixed: ex.display_exchange || ex.exchange,
                    name: 'market_data_type_' + ex.exchange,
                    type: 'marketData',
                    exchange: ex.exchange,
                    suppressSort: true,
                    suppressFilter: true
                }
            }),
            {
                header: 'lang_email',
                name: 'email',
                width: 120
            },
            {
                header: 'lang_actor',
                name: 'actor',
                width: 124
            },
            {
                header: 'lang_last_updated',
                name: 'updated',
                type: TYPE.DATE,
                dateFormat: 'DD MMM YYYY',
                sortable: false,
                decimal: 2,
                width: 144
            }
        ]
        return columns
    }

    changeConnection = isConnected => {
        if (!isConnected !== !this.state.isConnected) {
            this.setState({ isConnected })
            if (isConnected) {
                this.getFilterOnSearch()
            }
        }
    }

    hiddenWarning = () => {
        try {
            setTimeout(() => {
                this.setState({ idShowWarning: false })
            }, 4000)
        } catch (error) {
            logger.error('hiddenWarning On MarketData ' + error)
        }
    }

    realtimeData = (data) => {
        if (data && data.user_id && data.data) {
            const row = this.getData().filter(row => row.user_id === data.user_id)[0];
            const dic = {};
            if (row) {
                data.data.forEach(ex => {
                    row['market_data_type_' + ex.exchange] = ex.market_data_type;
                    dic[ex.exchange] = ex;
                });
                if (row.data) {
                    row.market_data_type = 0;
                    let actor = ''
                    let updated = 0
                    row.data.forEach(ex => {
                        if (dic[ex.exchange]) Object.assign(ex, dic[ex.exchange]);
                        if (ex.market_data_type) row.market_data_type = ex.market_data_type;
                        if (ex.updated && ex.updated > updated) {
                            actor = ex.actor
                            updated = ex.updated
                        }
                    })
                    row.actor = actor
                    row.updated = updated
                }
                this.addOrUpdate(row);
            }
        }
    }

    handleSaveButton = (pageChange, isEdit) => {
        const lstData = this.getData(true);
        const dic = {};
        let empty = false;
        const listUpdate = lstData.map(item => {
            let checked = false;
            const lst = item.data.filter(ex => {
                if (item.market_data_type === item['market_data_type_' + ex.exchange]) checked = true;
                return ex.market_data_type !== item['market_data_type_' + ex.exchange]
            }).map(ex => {
                let newValue = item['market_data_type_' + ex.exchange];
                let status = ex.status;
                if (item.market_data_type === 0) {
                    newValue = item.market_data_type
                    status = MARKETASTATUS.noAccess
                } else if (newValue === 1) {
                    status = MARKETASTATUS.subscribed;
                } else if (ex.market_data_type > 1) {
                    if (newValue < 2) {
                        checked = true;
                        status = MARKETASTATUS.pendingCancel;
                        newValue = ex.market_data_type;
                    }
                } else {
                    if (newValue === 0) status = MARKETASTATUS.noAccess;
                    else if (newValue > 1) status = MARKETASTATUS.pendingSubscribe;
                }
                const obj = {
                    exchange: ex.exchange,
                    market_data_type: newValue,
                    status: status
                };
                dic[item.user_id + '|' + ex.exchange] = obj;
                return obj;
            });
            if (!checked) empty = true;
            return {
                user_id: item.user_id,
                exchange_access: lst
            }
        }).filter(item => item.exchange_access.length);
        if (empty) {
            this.setState({
                error: 'lang_please_select_at_least_one_exchange',
                idShowWarning: true,
                loadingConfirm: false,
                haveErrorOrder: true
            }, () => this.hiddenWarning())
            return;
        }

        if (listUpdate.length > 0) {
            const url = getUserDetailUrl('market-data');
            putData(url, listUpdate).then(res => {
                lstData.forEach(item => {
                    const lst = item.data.filter(ex => ex.market_data_type !== item['market_data_type_' + ex.exchange]).map(ex => {
                        const obj = dic[item.user_id + '|' + ex.exchange];
                        if (obj) Object.assign(ex, obj);
                    });
                });
                this.setState({
                    error: 'lang_update_market_data_information_successfully',
                    idShowWarning: true,
                    loadingConfirm: false,
                    haveErrorOrder: false,
                    isEditable: isEdit || false
                }, () => {
                    this.hiddenWarning()
                    this.saveData();
                    this.setEditMode(this.state.isEditable);
                })
            }).catch(e => {
                logger.log(e);
                this.setState({
                    error: 'lang_update_market_data_information_unsuccessfully',
                    idShowWarning: true,
                    loadingConfirm: false,
                    haveErrorOrder: true
                }, () => this.hiddenWarning())
            })
        } else {
            this.setState({
                isEditable: false,
                error: 'lang_no_change_in_the_market_data_information',
                idShowWarning: true,
                loadingConfirm: false,
                haveErrorOrder: true
            }, () => {
                this.hiddenWarning()
                this.setEditMode(this.state.isEditable);
            })
        }
    }

    handleCancelButton = () => {
        this.setState({ isEditable: false }, () => {
            this.setEditMode(this.state.isEditable);
            this.resetData();
        })
    }

    handleEditButton = () => {
        if (!this.state.isConnected) return
        this.setState({ isEditable: true }, () => this.setEditMode(this.state.isEditable))
    }

    handlePressButton = param => {
        switch (param) {
            case 'Edit':
                this.handleEditButton()
                break;
            case 'Cancel':
                this.handleCancelButton()
                break;
            case 'Save':
                this.handleSaveButton()
                break;
            default:
                break;
        }
    }

    dataReceivedFromFilterBox = filterText => {
        this.setQuickFilter(filterText);
        // this.filterText = filterText;
        // this.props.saveState({
        //     valueFilter: filterText
        // })
        // this.page_id = 1;
        // this.getFilterOnSearch()
    }

    getDataMarketData = () => {
        let cb, url
        // if (this.filterAndSearch) {
        //     url = getApiFilter('market_data', this.page_id)
        //     cb = postData
        // } else {
        //     cb = getData
        //     url = getMarketData(this.filterText, this.page_id, pageSize);
        // }
        cb = getData
        url = getUserDetailUrl('market-data');
        this.props.loading(true)
        cb(url)
            .then(response => {
                this.props.loading(false)
                if (response.error) return
                this.isReady = true;
                this.dataObj = response.data || {};
                this.pageObj = {
                    total_count: this.dataObj.total_count,
                    total_pages: this.dataObj.total_pages,
                    current_page: this.dataObj.current_page,
                    temp_end_page: 0
                }
                if (this.dataObj.length > 0) {
                    this.listExchange = this.dataObj[0].data;
                    // this.listExchange = dataStorage.userInfo.data
                    this.setColumn(this.getColums());
                    this.setState({ isNodata: false })
                } else this.setState({ isNodata: true })
                const listData = this.dataObj.map(item => {
                    item.market_data_type = 0;
                    let actor = ''
                    let updated = 0
                    item.data && item.data.forEach(ex => {
                        if (ex.market_data_type) item.market_data_type = ex.market_data_type;
                        item['market_data_type_' + ex.exchange] = ex.market_data_type;
                        if (ex.updated && ex.updated > updated) {
                            actor = ex.actor
                            updated = ex.updated
                        }
                    })
                    item.actor = actor
                    item.updated = updated
                    return item;
                })
                this.setData(listData)
                // this.setPage(this.pageObj)
            })
            .catch(error => {
                this.props.loading(false)
                this.setState({ isNodata: true })
                this.setData([])
                this.pageObj = {
                    total_count: 0,
                    total_pages: 1,
                    current_page: 1,
                    temp_end_page: 0
                }
                // this.setPage(this.pageObj)
            })
    }

    pageChanged = pageId => {
        if (this.page_id === pageId) return;
        let listDataChange = []
        if (this.state.isEditable) {
            const lstData = this.getData()
            lstData.map(item => {
                if (item._old) {
                    let changed = false;
                    Object.keys(item._old).map(field => {
                        if (item[field] !== item._old[field]) changed = true;
                    });
                    if (changed) listDataChange.push(item)
                }
            })
            if (listDataChange.length > 0) {
                Confirm({
                    checkWindowLoggedOut: true,
                    header: 'Confirm',
                    message: 'lang_would_you_like_to_save_change',
                    widthAuto: true,
                    callback: () => {
                        this.page_id = pageId
                        this.handleSaveButton(true, true)
                    },
                    noCallback: () => {
                        this.updateField(data => {
                            if (data._old) {
                                delete data._old;
                            }
                        });
                        this.page_id = pageId
                        this.getFilterOnSearch(null, null, true)
                    },
                    cancelCallback: () => {
                        this.updateField(data => {
                            if (data._old) {
                                Object.assign(data, data._old);
                                delete data._old;
                            }
                            return true;
                        });
                        // this.setPage(this.pageObj)
                    }
                })
            } else {
                this.page_id = pageId;
                this.getFilterOnSearch(null, null, true);
            }
        } else {
            this.page_id = pageId;
            this.getFilterOnSearch(null, null, true)
        }
    }

    componentWillUnmount() {
        try {
            this.emitConnectionID && this.emitConnectionID.remove();
            this.emitRefreshID && this.emitRefreshID.remove();
            const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
            unregisterUser(userId, this.realTimeDataUser, 'user_setting');
            unregisterAllOrders(this.realtimeData, 'MARKET_DATA_UPDATE');
        } catch (error) {
            logger.error('componentWillUnmount On MarketData' + error)
        }
    }

    refreshDataAccount = type => {
        if (!this.state.isEditable) {
            this.getFilterOnSearch()
        }
    }

    componentDidMount() {
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection);
        this.emitRefreshID = this.accountRefresh && this.accountRefresh.addListener(eventEmitter.REFRESH_DATA_ACCOUNT, this.refreshDataAccount);
        const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
        registerUser(userId, this.realTimeDataUser, 'user_setting');
        registerAllOrders(this.realtimeData, 'MARKET_DATA_UPDATE');
        this.getFilterOnSearch()
    }

    renderHeader = () => {
        let checkRoleNavBar = checkRole(MapRoleComponent.EDIT_MARKET_DATA);
        return (
            <div className={`header-wrap flex ${this.collapse ? 'collapse' : ''}`}>
                <div className='navbar' style={!checkRoleNavBar ? { justifyContent: 'flex-end' } : {}}>
                    <ButtonGroup
                        requireRole={MapRoleComponent.EDIT_MARKET_DATA}
                        editModeOnly={true}
                        loadingConfirm={this.state.loadingConfirm}
                        isEditable={this.state.isEditable}
                        isNodata={this.state.isNodata}
                        callBack={(param) => {
                            this.handlePressButton(param)
                        }}
                    />
                    <div className='box-filter'>
                        <FilterBox
                            value={this.state.valueFilter}
                            onChange={this.dataReceivedFromFilterBox}
                        />
                    </div>
                </div>
                <MoreOption agSideButtons={this.createagSideButtons()} />
            </div>
        )
    }
    getCsvFunction = (obj) => {
        if (this.csvWoking) return
        this.csvWoking = true
        getCsvFile({
            url: getReportCsvFileUrl('market_data'),
            body_req: this.filterAndSearch,
            columnHeader: obj.columns,
            lang: dataStorage.lang,
            glContainer: this.props.glContainer
        }, () => {
            this.csvWoking = false;
        });
    }
    getFilterOnSearch = (filter, sort, resetPageId) => {
        if (!resetPageId) this.page_id = 1;
        if (sort && sort.length === 0) {
            this.sort = []
        } else if (sort && sort.length) {
            this.sort = sort
        }
        this.filter = mapFiltertObj(filter, this.filter)
        const filterAndSort = {
            query: this.filter || {},
            sort: this.sort || [],
            filterAll: this.filterText
        }
        this.filterAndSearch = convertObjFilter(filterAndSort)
        this.getDataMarketData()
    }

    realTimeDataUser = value => {
        if (value.timezone) {
            this.refreshView()
        }
    }

    setGridPaginate = () => {
        return {
            setPage: (cb) => {
                this.setPage = cb
            },
            page_size: pageSize,
            pageChanged: this.pageChanged
        }
    }

    collapseFunc = (collapse) => {
        this.collapse = collapse ? 1 : 0
        this.props.saveState({
            collapse: this.collapse
        })
        this.forceUpdate()
    }

    createagSideButtons = () => {
        return [
            {
                value: 'ExportCSV',
                label: 'lang_export_csv',
                callback: () => this.exportCsv()
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

    render() {
        return (
            <div className='marketdata-wrap root qe-widget isMoreOption' ref={dom => this.dom = dom}>
                <div className={`errorOrder size--3 ${this.state.haveErrorOrder ? '' : 'yellow'} ${this.state.idShowWarning ? '' : 'myHidden'}`}><Lang>{this.state.error}</Lang></div>
                {this.renderHeader()}
                <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
                <div className='scroll-wrap'>
                    <CanvasGrid
                        {...this.props}
                        id={FORM.MARKET_DATA_MANAGEMENT}
                        columns={this.getColums()}
                        fnKey={data => {
                            return data.user_id
                        }}
                        onlySystem={true}
                        fn={fn => {
                            this.setQuickFilter = fn.setQuickFilter
                            this.addOrUpdate = fn.addOrUpdate
                            this.setData = fn.setData
                            this.getData = fn.getData
                            this.resetData = fn.resetData
                            this.saveData = fn.saveData
                            this.setEditMode = fn.setEditMode
                            this.setColumn = fn.setColumn
                            this.exportCsv = fn.exportCsv
                            this.resetFilter = fn.resetFilter
                            this.autoSize = fn.autoSize
                            this.showColumnMenu = fn.showColumnMenu
                            this.showFilterMenu = fn.showFilterMenu
                        }} />
                </div>
            </div>
        )
    }
}

export default translate('translations')(MarketDataManagement);
