import React from 'react';
import FilterBox from '../Inc/FilterBox';
import { translate } from 'react-i18next';
import dataStorage from '../../dataStorage';
import ButtonGroup from '../Inc/ButtonGroup';
import { getData, getMarketData, getUserDetailUrl, putData, postData } from '../../helper/request';
import { func } from '../../storage';
import { emitter, eventEmitter } from '../../constants/emitter_enum';
import { registerAllOrders, unregisterAllOrders } from '../../streaming';
import logger from '../../helper/log';
import { checkRole } from '../../helper/functionUtils';
import Confirm from '../Inc/Confirm';
import uuidv4 from 'uuid/v4';
import MapRoleComponent from '../../constants/map_role_component';
import Lang from '../Inc/Lang';
import { getApiFilter } from '../api';
import ToggleLine from '../Inc/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import CanvasGrid from '../Inc/CanvasGrid';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';

const TIMEOUT_DEFAULT = 20000;
const pageSize = 50
const optionsMarketData = [
    {
        label: 'NOACCESS',
        value: 0
    },
    {
        label: 'DELAYED',
        value: 1
    },
    {
        label: 'CLICK2REFRESH',
        value: 2
    },
    {
        label: 'REALTIME',
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
                header: 'lang_user_id',
                name: 'user_id',
                width: 120
            },
            {
                header: 'lang_market_data',
                name: 'market_data_type',
                type: TYPE.DROPDOWN,
                options: optionsMarketData,
                setValue: (params, value) => {
                    Object.keys(params.data).forEach(key => {
                        if (/^market_data_..$/.test(key)) {
                            if (!value) {
                                params.setValue(value, key)
                            } else {
                                if (params.getValue(key)) params.setValue(value, key)
                            }
                        }
                    });
                    params.setValue(value);
                },
                valueGetter: (params) => {
                    return params.value || params.data.market_data_au || params.data.market_data_us || params.data.market_data_fu || 0
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
            {
                header: 'lang_au_market',
                name: 'market_data_au',
                type: TYPE.BOOLEAN,
                suppressSort: true,
                suppressFilter: true,
                setValue: (params, value) => {
                    if (value) params.setValue(params.getValue('market_data_type'))
                    else params.setValue(0)
                }
            },
            {
                header: 'lang_us_market',
                name: 'market_data_us',
                type: TYPE.BOOLEAN,
                suppressSort: true,
                suppressFilter: true,
                setValue: (params, value) => {
                    if (value) params.setValue(params.getValue('market_data_type'))
                    else params.setValue(0)
                }
            },
            {
                header: 'lang_futures',
                name: 'market_data_fu',
                type: TYPE.BOOLEAN,
                suppressSort: true,
                suppressFilter: true,
                setValue: (params, value) => {
                    if (value) params.setValue(params.getValue('market_data_type'))
                    else params.setValue(0)
                }
            },
            {
                header: 'lang_user_login',
                name: 'user_login_id',
                width: 140
            },
            {
                header: 'lang_email',
                name: 'email',
                width: 120
            },
            {
                header: 'lang_full_name',
                name: 'full_name',
                width: 124
            },
            {
                header: 'lang_actor',
                name: 'actor',
                width: 124
            },
            {
                header: 'lang_last_updated',
                name: 'updated',
                headerIsNumber: true,
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

    realtimeData = (data, action) => {
        if (data && data.user_id) {
            if (action === 'UPDATE') {
                this.addOrUpdate(data, true)
            } else if (Number(this.dataObj.current_page) === 1) {
                let index2 = -1
                if (this.filterText && (data.user_id.indexOf(this.filterText) > -1 ||
                    (data.user_login_id && data.user_login_id.indexOf(this.filterText) > -1) ||
                    (data.full_name && data.full_name.indexOf(this.filterText) > -1) ||
                    (data.email && data.email.indexOf(this.filterText) > -1))) {
                    index2 = 0
                }
                if (index2 > -1 || !this.filterText) {
                    this.dataObj.data.splice(pageSize, 10)
                    data.market_data_type = 2
                    this.addOrUpdate(data)
                }
            }
        }
    }

    createRequestUpdate = newObj => {
        let data = { data: {} }
        data.data.market_data_us = newObj.market_data_us
        data.data.market_data_au = newObj.market_data_au
        data.data.market_data_fu = newObj.market_data_fu
        return new Promise(resolve => {
            const url = getUserDetailUrl(`market_data/${newObj.user_id}`);
            putData(url, data).then(() => {
                resolve();
            }).catch(e => {
                this.listResponse.push({ error: e });
                resolve({ error: e });
            })
        });
    }

    handleSaveButton = (pageChange, isEdit) => {
        this.listResponse = []
        const listDataChange = this.getData(true).map(item => this.createRequestUpdate(item));

        if (listDataChange.length > 0) {
            this.timeoutRequest = setTimeout(() => {
                this.setState({
                    error: 'lang_timeout_cannot_be_connected_server',
                    idShowWarning: true,
                    loadingConfirm: false,
                    haveErrorOrder: true,
                    isDisplayBtn: !this.state.isDisplayBtn
                }, () => this.hiddenWarning())
            }, TIMEOUT_DEFAULT)
            this.setState({
                error: 'lang_updating_market_data_information',
                idShowWarning: true,
                loadingConfirm: true,
                haveErrorOrder: false
            })

            Promise.all(listDataChange).then(() => {
                if (this.listResponse.length) {
                    clearTimeout(this.timeoutRequest)
                    this.setState({
                        error: 'lang_update_market_data_information_unsuccessfully',
                        idShowWarning: true,
                        loadingConfirm: false,
                        haveErrorOrder: true
                    }, () => this.hiddenWarning())
                } else {
                    clearTimeout(this.timeoutRequest)
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
                }
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

    getDataMarketData = (body) => {
        let cb, url
        if (body) {
            url = getApiFilter('market_data', this.page_id)
            cb = postData
        } else {
            cb = getData
            url = getMarketData(this.filterText, this.page_id, pageSize);
        }
        this.props.loading(true)
        cb(url, body)
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
                if (this.dataObj.data.length > 0) {
                    this.setState({ isNodata: false })
                } else this.setState({ isNodata: true })
                this.setData(this.dataObj.data)
                this.setPage(this.pageObj)
            })
            .catch(() => {
                this.props.loading(false)
                this.setState({ isNodata: true })
                this.setData([])
                this.pageObj = {
                    total_count: 0,
                    total_pages: 1,
                    current_page: 1,
                    temp_end_page: 0
                }
                this.setPage(this.pageObj)
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
                    header: 'lang_confirm',
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
                        this.setPage(this.pageObj)
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
            unregisterAllOrders(this.realtimeData, 'MARKET_DATA');
            unregisterAllOrders(this.realtimeData, 'USER_DETAIL');
        } catch (error) {
            logger.error('componentWillUnmount On MarketData' + error)
        }
    }

    refreshDataAccount = () => {
        if (!this.state.isEditable) {
            this.getFilterOnSearch()
        }
    }

    componentDidMount() {
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection);
        this.emitRefreshID = this.accountRefresh && this.accountRefresh.addListener(eventEmitter.REFRESH_DATA_ACCOUNT, this.refreshDataAccount);
        registerAllOrders(this.realtimeData, 'MARKET_DATA');
        registerAllOrders(this.realtimeData, 'USER_DETAIL');
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
    getFilterOnSearch = (body, resetPageId) => {
        if (!resetPageId) this.page_id = 1;
        this.getDataMarketData(body)
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
                label: 'Columns',
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
                        }}
                        paginate={{
                            setPage: (cb) => {
                                this.setPage = cb
                            },
                            pageChanged: this.pageChanged
                        }}
                        getFilterOnSearch={this.getFilterOnSearch}
                    />
                </div>
            </div>
        )
    }
}

export default translate('translations')(MarketDataManagement);
