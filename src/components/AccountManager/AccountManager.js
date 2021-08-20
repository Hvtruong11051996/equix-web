import FilterBox from '../Inc/FilterBox';
import React from 'react';
import Lang from '../Inc/Lang';
import dataStorage from '../../dataStorage';
import { emitter, eventEmitter } from '../../constants/emitter_enum';
import { func } from '../../storage';
import { registerAllOrders, unregisterAllOrders, unregisterUser, registerUser } from '../../streaming';
import { getData, getUrlAccountManagement, createNewBranch, postData, getReportCsvFileUrl, putData, getUrlAccountCqg } from '../../helper/request';
import uuidv4 from 'uuid/v4';
import { hideElement, formatInitTime, getCsvFile, clone, checkRole, renderClass } from '../../helper/functionUtils'
import Grid from '../Inc/CanvasGrid';
import logger from '../../helper/log';
import { getApiFilter } from '../api';
import { convertObjFilter } from '../../helper/FilterAndSort';
import ButtonGroup from '../Inc/ButtonGroup';
import DropDown from '../DropDown/DropDown';
import Tag from '../Inc/Tag';
import ToggleLine from '../Inc/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';
import MapRoleComponent from '../../constants/map_role_component'

const GRID_LEVEL = [160, 72, 72, 72, 72, 72]
const MARGIN_FLAG_SHOW_OPITION = [
    { labelFixed: 'Normal', value: 0 },
    { labelFixed: 'System Hold', value: 1 },
    { labelFixed: 'Admin Hold', value: 2 }
]

const MARGIN_FLAG_OPITION = [
    { label: 'Normal', value: 0 },
    // { label: 'System Hold', value: 1 },
    { label: 'Admin Hold', value: 2 }
]

const statusFilterObj = [
    { label: 'active', value: 'active' },
    { label: 'inactive', value: 'inactive' }
]
export default class AccountManager extends React.Component {
    constructor(props) {
        super(props);
        const initState = this.props.loadState();
        this.filter = initState.valueFilter || '';
        this.accountRefresh = func.getStore(emitter.STREAMING_ACCOUNT_DATA);
        this.dicData = {}
        this.dicBranch = []
        this.state = {
            error_code: '',
            loading: false,
            isError: false,
            isConnected: dataStorage.connected,
            loadingConfirm: false,
            valueFilter: initState.valueFilter || '',
            isEditable: false
        }
        this.id = uuidv4();
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.timeoutID = {}
        props.glContainer.on('show', () => {
            hideElement(props, false, this.id);
        });
        props.glContainer.on('hide', () => {
            hideElement(props, true, this.id);
        });
        this.dicBranchChange = {};
        this.dicOldBranch = {}
        this.collapse = initState.collapse ? 1 : 0
        this.filterAndSearch = { 'query': { 'bool': { 'must': [] } } }
    }

    changePageAction = num => {
        this.pageId = num;
        this.getFilterOnSearch(null, true);
    }

    getDataAccountManagement = () => {
        try {
            if (!this.pageId) this.pageId = 1;
            if (!this.pageSize) this.pageSize = 50;
            if (!this.filter) this.filter = '';
            let cb = postData
            let url = getApiFilter('account', this.pageId);
            this.props.loading(true);
            cb(url, this.filterAndSearch).then(response => {
                this.props.loading(false)
                if (response.data && response.data.data) {
                    let data = response.data;
                    let listData = response.data.data || [];
                    for (let i = 0; i < listData.length; i++) {
                        // if (listData[i].last_update) listData[i].last_update = formatInitTime({ init_time: listData[i].last_update }, dataStorage.timeZone);
                        this.dicData[listData[i].account_id] = listData[i]
                    }
                    this.setData(listData);
                    const havePageData = data.current_page && data.total_count && data.total_pages;
                    this.pageObj = {
                        total_count: havePageData ? data.total_count : 0,
                        total_pages: havePageData ? data.total_pages : 1,
                        current_page: havePageData ? data.current_page : 1,
                        temp_end_page: 0,
                        page_size: this.pageSize
                    }
                    this.setPage && this.setPage(this.pageObj);
                } else {
                    this.pageObj = {
                        total_count: 0,
                        total_pages: 1,
                        current_page: 1,
                        temp_end_page: 0,
                        page_size: this.pageSize
                    };
                    this.setPage && this.setPage(this.pageObj);
                    this.setData([])
                }
            })
                .catch(error => {
                    this.props.loading(false);
                    this.setData([]);
                    logger.log('error at get all symbol realted news', error);
                })
        } catch (error) {
            logger.log('error getDataAccountManagement', error)
        }
    }

    changeConnection = (isConnected) => {
        if (isConnected !== this.state.isConnected) {
            this.setState({
                isConnected
            })
            if (isConnected) this.getFilterOnSearch();
        }
    }

    realtimeDataBranch = (data, action) => {
        try {
            switch (action.toUpperCase()) {
                case 'UPDATE':
                    for (let i = 0; i < this.dicBranch.length; i++) {
                        if (data.branch_id === this.dicBranch[i].value) {
                            let dataDd = { label: data.branch_name, value: data.branch_id }
                            this.dicBranch[i] = dataDd
                            break;
                        }
                    }
                    break;
                case 'INSERT':
                    let dataDd = { label: data.branch_name, value: data.branch_id }
                    this.dicBranch.push(dataDd)
                    break;
                case 'DELETE':
                    this.dicBranch = this.dicBranch.filter(x => x.value !== data.branch_id)
                    break;
            }
            this.setColumn(this.colDefsAccountManagement());
        } catch (error) {
            logger.log('error realtime branch', error)
        }
    }

    onRowClicked = data => {
        if (data) {
            this.props.send({
                account: data
            })
        }
    }

    getAllBranch = () => {
        const url = createNewBranch();
        this.props.loading(true)
        getData(url)
            .then(response => {
                this.props.loading(false)
                if (response.data && response.data.data && response.data.data.branch) {
                    let listBranch = response.data.data.branch;
                    const list = [];
                    if (listBranch && listBranch.length) {
                        this.objBranch = {};
                        listBranch.map(item => {
                            list.push({ labelFixed: item.branch_name, value: item.branch_id })
                            this.objBranch[item.branch_id] = item.branch_name;
                        });
                        this.dicBranch = list;
                        this.enumBranch = []
                        list.map(item => {
                            this.enumBranch.push(item.label)
                        })
                    }
                    this.setColumn(this.colDefsAccountManagement());
                }
            }).catch(error => {
                this.props.loading(false)
                logger.log('error getAllBranch', error)
            })
    }

    realTimeDataUser = value => {
        if (value.timezone) {
            this.getFilterOnSearch()
        }
    }

    realtimeData = (data) => {
        if (data.account_id) {
            if (this.timeoutID[data.account_id]) clearTimeout(this.timeoutID[data.account_id])
            const status = data.cqg_account_status
            if (status === 'COMPLETED') {
                if (this.timeoutID[data.account_id]) clearTimeout(this.timeoutID[data.account_id])
                this.dicData[data.account_id].cqg_account_status = 'LOADING_COMPLETED'
                this.addOrUpdate(this.dicData[data.account_id])
                setTimeout(() => {
                    this.dicData[data.account_id].cqg_account_status = data.cqg_account_status
                    this.dicData[data.account_id].cqg_account_id = data.cqg_account_id
                    this.addOrUpdate(this.dicData[data.account_id])
                }, 3000);
            } else {
                if (status === 'CREATING' || status === 'CONFIGURING') {
                    this.timeoutID[data.account_id] = setTimeout(() => {
                        this.dicData[data.account_id].errorMessage = 'lang_timeout_can_not_connected_server'
                        this.dicData[data.account_id].cqg_account_status = status === 'CREATING' ? 'NOT_CREATED' : 'NOT_CONFIGURED'
                        this.addOrUpdate(this.dicData[data.account_id])
                    }, 20000);
                } else {
                    if (this.timeoutID[data.account_id]) clearTimeout(this.timeoutID[data.account_id])
                }
                if (data.cqg_account_status) this.dicData[data.account_id].cqg_account_status = data.cqg_account_status
                if (data.error_message) this.dicData[data.account_id].errorMessage = data.error_message
                this.addOrUpdate(this.dicData[data.account_id])
            }
        }
    }

    hideFieldsInQuickFilter = (hideFields) => {
        try {
            const filterGridItems = document.querySelectorAll('.accountManagerContainer .ag-filter-toolpanel-instance .ag-header-cell-text')
            Array.from(filterGridItems).map(item => {
                const needHiding = hideFields.includes(item.innerText)
                if (needHiding && item.parentNode && item.parentNode.parentNode) {
                    item.parentNode.parentNode.style.display = 'none'
                }
            })
        } catch (error) {
            logger.log('Error while hidding fields in quick filter: ', error)
        }
    }

    realtimeDataAccount = (data) => {
        this.addOrUpdate(data)
    }

    defineColumn = (headerName, field, options = {}) => {
        let translate = false;
        let column = {};
        let { filterObj = {}, width = 120, hide, ddoptions, optionsShow, columnType } = options
        if (['VETTING_RULES_GROUP', 'MARGIN_FLAG'].indexOf(headerName) > -1) {
            translate = true
            column = {
                header: headerName,
                name: field,
                type: TYPE.DROPDOWN,
                options: ddoptions,
                optionsShow,
                width
            }
        } else if ((['CQG_ACTION'].indexOf(headerName) > -1)) {
            column = {
                header: headerName,
                name: field,
                type: TYPE.CQG
                // cellRenderer: (params) => this.createReadOnlyNode(params, translate)
            }
        } else if (['LAST_UPDATE'].indexOf(headerName) > -1) {
            column = {
                header: headerName,
                name: field,
                type: TYPE.DATE,
                dateFormat: 'DD MMM YYYY hh:mm:ss'
            }
        } else if (headerName === 'STATUS') {
            column = {
                header: headerName,
                name: field,
                type: TYPE.LABEL_WIDTH_BG,
                filter: {
                    'filter': [
                        'active'
                    ],
                    'type': 'in'
                },
                formater: (params) => {
                    return (params.value + '').toUpperCase();
                },
                getBackgroundColorKey: (params) => {
                    return params.value === 'active' ? '--background-green' : '--background-orange'
                },
                options: statusFilterObj
            }
        } else {
            column = {
                header: headerName,
                name: field,
                type: TYPE.LABEL,
                width,
                columnType,
                cellRenderer: (params) => this.createReadOnlyNode(params, translate)
            }
        }
        if (hide) column.hide = true;
        if (filterObj !== 'noFilter') {
            column = { ...column, ...filterObj }
        } else {
            column = { ...column, menuTabs: ['generalMenuTab', 'columnsMenuTab'], sortable: false }
        }
        return column
    }

    colDefsAccountManagement = () => {
        return ([
            this.defineColumn('lang_branch_code', 'branch_code'),
            this.defineColumn('lang_account_id', 'account_id'),
            this.defineColumn('lang_account_name', 'account_name'),
            this.defineColumn('lang_vetting_rules_group', 'account_group', { ddoptions: this.dicBranch }),
            this.defineColumn('lang_margin_flag', 'margin_flag', { ddoptions: MARGIN_FLAG_OPITION, optionsShow: MARGIN_FLAG_SHOW_OPITION }),
            this.defineColumn('lang_saxo_account_id', 'saxo_account_id'),
            this.defineColumn('lang_saxo_client_id', 'saxo_account_number'),
            this.defineColumn('lang_last_updated', 'last_update'),
            this.defineColumn('lang_email_address', 'email'),
            this.defineColumn('lang_hin', 'hin'),
            this.defineColumn('lang_advisor_code', 'advisor_code'),
            this.defineColumn('lang_account_type', 'account_type'),
            this.defineColumn('lang_organisation_code', 'organisation_code'),
            this.defineColumn('lang_advisor_name', 'advisor_name'),
            this.defineColumn('lang_date_created', 'date_created'),
            this.defineColumn('lang_status', 'status'),
            checkRole(MapRoleComponent.EDIT_ACCOUNT) ? this.defineColumn('lang_cqg_action', 'cqg_account_status')
                : null,
            this.defineColumn('lang_pid', 'pid'),
            this.defineColumn('lang_cross_reference', 'cross_reference'),
            this.defineColumn('lang_client_type', 'client_type'),
            this.defineColumn('lang_warrant_trading', 'warrants_trading', { columnType: 'number' }),
            this.defineColumn('lang_options_trading', 'options_trading', { columnType: 'number' }),
            this.defineColumn('lang_internation_trading', 'international_trading'),
            this.defineColumn('lang_equities_brokerage_schedule', 'equities_brokerage_schedule'),
            this.defineColumn('lang_options_brokerage_schedule', 'options_brokerage_schedule'),
            this.defineColumn('lang_bank_institution_code', 'bank_institution_code'),
            this.defineColumn('lang_bsb', 'bsb', { hide: true }),
            this.defineColumn('lang_bank_account_number', 'bank_account_number', { hide: true }),
            this.defineColumn('lang_bank_account_name', 'bank_account_name', { hide: true }),
            this.defineColumn('lang_bank_transaction_type', 'bank_transaction_type'),
            this.defineColumn('lang_account_designation', 'account_designation'),
            this.defineColumn('lang_contract_note_email_address', 'contractnote_email_address'),
            this.defineColumn('lang_work_phone', 'work_phone'),
            this.defineColumn('lang_mobile_phone', 'mobile_phone'),
            this.defineColumn('lang_home_phone', 'home_phone'),
            this.defineColumn('lang_address_line_1', 'address_line_1'),
            this.defineColumn('lang_address_line_2', 'address_line_2'),
            this.defineColumn('lang_address_line_3', 'address_line_3'),
            this.defineColumn('lang_address_line_4', 'address_line_4'),
            this.defineColumn('lang_post_code', 'post_code'),
            this.defineColumn('lang_country_code', 'country_code')
        ])
    }

    getFilterOnSearch = async (body, notResetPage) => {
        if (!this.dicBranch.length) await this.getAllBranch();
        if (!notResetPage) this.pageId = 1
        if (body) {
            this.filterAndSearch = body
        }
        this.getDataAccountManagement();
    }

    setGridFnKey = data => {
        if (!data) {
            logger.log(data);
        }
        return `${data.account_id}`;
    }

    setGridPaginate = () => {
        return {
            setPage: cb => {
                this.setPage = cb
            },
            pageChanged: this.changePageAction
        }
    }

    getCsvFunction = (obj) => {
        if (this.csvWoking) return;
        this.csvWoking = true
        getCsvFile({
            url: getReportCsvFileUrl('account'),
            body_req: this.filterAndSearch,
            columnHeader: obj.columns,
            lang: dataStorage.lang,
            glContainer: this.props.glContainer
        }, () => {
            this.csvWoking = false;
        });
    }
    handleSave() {
        let dataChange = this.getData(true, true);
        let putArr = []
        Object.keys(dataChange).forEach(item => {
            let dataPut = {
                data: { ...dataChange[item], account_id: item }
            }
            let url = `${dataStorage.env_config.api.backendBase}/user/account_info/${item}`
            putArr.push(putData(url, dataPut))
        })
        if (putArr.length) {
            this.setState({
                isEditable: false,
                loading: true,
                isError: false,
                error_code: 'lang_updating_account_information'
            }, () => {
                setTimeout(() => {
                    Promise.all(putArr).then((res) => {
                        this.setState({
                            isEditable: false,
                            loading: true,
                            isError: false,
                            error_code: 'lang_update_account_information_successfully'
                        }, () => {
                            this.setEditMode(this.state.isEditable)
                            this.saveData()
                            this.hiddenWaring()
                        })
                    }).catch((error) => {
                        this.setState({
                            isEditable: false,
                            loading: true,
                            isError: true,
                            error_code: error.response.errorCode[0] || 'Update Fail'
                        }, () => {
                            this.setEditMode(this.state.isEditable)
                            this.hiddenWaring()
                        })
                    })
                }, 1000);
            })
        } else {
            this.setState({
                isEditable: false,
                loading: true,
                isError: false,
                error_code: 'lang_there_is_no_change_in_the_account_information'
            }, () => {
                this.setEditMode(this.state.isEditable)
                this.hiddenWaring()
            })
        }
    }
    hiddenWaring() {
        setTimeout(() => {
            this.setState({ loading: false })
        }, 4000);
    }

    handleCallBackActionGroup(type) {
        switch (type) {
            case 'Edit':
                this.setState({ isEditable: true }, () => this.setEditMode(this.state.isEditable));
                break;
            case 'Cancel':
                this.setState({ isEditable: false }, () => {
                    this.setEditMode(this.state.isEditable)
                    this.resetData();
                });
                break;
            case 'Save':
                this.handleSave()
                break;
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

    componentDidMount() {
        try {
            const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
            registerUser(userId, this.realTimeDataUser, 'user_setting')
            this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection);
            this.emitRefreshID = this.accountRefresh && this.accountRefresh.addListener(eventEmitter.REFRESH_DATA_ACCOUNT, this.getFilterOnSearch);
            // this.getFilterOnSearch();
            registerAllOrders(this.realtimeDataBranch, 'BRANCH');
            registerAllOrders(this.realtimeDataAccount, 'ACCOUNT_MANAGEMENT');
            registerAllOrders(this.realtimeData, 'CQG_ACCOUNT_STATUS');
            const hideFields = ['lang_warrant_trading', 'lang_options_trading', 'lang_internation_trading']
            this.hideFieldsInQuickFilter(hideFields)
        } catch (error) {
            logger.log('error at didmout account management', error)
        }
    }

    componentWillUnmount() {
        const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
        unregisterUser(userId, this.realTimeDataUser, 'user_setting')
        unregisterAllOrders(this.realtimeData, 'CQG_ACCOUNT_STATUS');
        this.emitConnectionID && this.emitConnectionID.remove();
        this.emitRefreshID && this.emitRefreshID.remove();
        unregisterAllOrders(this.realtimeDataBranch, 'BRANCH');
    }

    render() {
        try {
            return (
                <div className='accountManagerContainer root qe-widget' ref={dom => this.dom = dom}>
                    <div className={`errorOrder size--3 ${this.state.loading ? '' : 'myHidden'} ${(this.state.isError) ? '' : 'yellow'}`}>{<Lang>{this.state.error_code}</Lang>}</div>
                    <div className={`header-wrap isMoreOption flex ${this.collapse ? 'collapse' : ''}`}>
                        <div className='navbar'>
                            <ButtonGroup
                                requireRole={MapRoleComponent.EDIT_ACCOUNT}
                                isOnlyEdit={true}
                                isEditable={this.state.isEditable}
                                callBack={this.handleCallBackActionGroup.bind(this)}
                            />
                            <div className='box-filter'>
                                <FilterBox
                                    value={this.state.valueFilter}
                                    onChange={(data) => this.setQuickFilter(data)} />
                            </div>
                        </div>
                        <MoreOption agSideButtons={this.createagSideButtons()} />
                    </div>
                    <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
                    <div className='accountManagerContain'>
                        <Grid
                            id={FORM.ACCOUNT_MANAGEMENT}
                            {...this.props}
                            hideButton={true}
                            onlyOneRow={true}
                            autoHeight={true}
                            fn={fn => {
                                this.addOrUpdate = fn.addOrUpdate
                                this.setData = fn.setData
                                this.resetData = fn.resetData
                                this.getData = fn.getData
                                this.setEditMode = fn.setEditMode
                                this.updateField = fn.updateField
                                this.setSelectedRowData = fn.setSelectedRowData
                                this.setSelected = fn.setSelected
                                this.setColumn = fn.setColumn
                                this.setGridFunctions = fn.setGridFunctions
                                this.exportCsv = fn.exportCsv
                                this.resetFilter = fn.resetFilter
                                this.autoSize = fn.autoSize
                                this.resetFilter = fn.resetFilter
                                this.setQuickFilter = fn.setQuickFilter
                                this.showColumnMenu = fn.showColumnMenu
                                this.showFilterMenu = fn.showFilterMenu
                                this.saveData = fn.saveData
                            }}
                            getCsvFunction={this.getCsvFunction}
                            loadingCallback={this.props.loadingCallback}
                            getFilterOnSearch={this.getFilterOnSearch}
                            fnKey={this.setGridFnKey}
                            paginate={this.setGridPaginate()}
                            columns={this.colDefsAccountManagement()}
                            onRowClicked={this.onRowClicked}
                            onlySystem={true}
                        />
                    </div>
                </div>
            )
        } catch (error) {
            logger.log('Error while rendering AccountManager: ', error)
        }
    }
}
