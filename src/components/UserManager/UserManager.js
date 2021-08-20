import React from 'react';
import FilterBox from '../Inc/FilterBox/FilterBox';
import dataStorage from '../../dataStorage';
import ButtonGroup from '../Inc/ButtonGroup/ButtonGroup';
import Tag from '../Inc/Tag/Tag';
import { getData, getUserMan, getUserDetailUrl, putData, getResetPasswordUrl, postData, getUserGroupUrl, getEmailTempUrl, getUserAddon, getReportCsvFileUrl } from '../../helper/request';
import { func } from '../../storage';
import { emitter, eventEmitter } from '../../constants/emitter_enum';
import { registerAllOrders, unregisterAllOrders, registerUser, unregisterUser } from '../../streaming';
import logger from '../../helper/log';
import { clone, checkRole, mapError, stringFormat, getIndexOfTimeZone, getCsvFile } from '../../helper/functionUtils';
import Confirm from '../Inc/Confirm/Confirm';
import uuidv4 from 'uuid/v4';
import MapRoleComponent from '../../constants/map_role_component';
import Grid from '../Inc/CanvasGrid/CanvasGrid';
import Lang from '../Inc/Lang/Lang';
import Icon from '../Inc/Icon/Icon';
import MultiDropDown from '../MultiDropDown/MultiDropDown';
import UserUploadFile from '../UserUploadFile/UserUploadFileCanvas';
import { optionsAccessMethod, optionsListCheck, optionsAipAccess, UserGroupEnum, USER_STATUS } from '../../constants/user_man_enum';
import { getApiFilter } from '../api';
import ToggleLine from '../Inc/ToggleLine/ToggleLine';
import MoreOption from '../Inc/MoreOption/MoreOption';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event';
import Button from '../Elements/Button/Button';
import SvgIcon, { path } from '../Inc/SvgIcon';

const TIMEOUT_DEFAULT = 20000;
const PAGESIZE = 50
export class UserManager extends React.Component {
    constructor(props) {
        super(props);
        const initState = this.props.loadState();
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION)
        addEventListener(EVENTNAME.clickToRefresh, this.getDataUserMan)
        this.pageObj = {}
        this.filterText = initState.valueFilter || ''
        this.listResponse = [];
        this.errorCode = []
        this.dicEmailTemp = {};
        this.userGroupDic = {};
        this.allAddon = {}
        this.optionFilter = []
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
            showUpload: false,
            filter: {},
            valueFilter: initState.valueFilter || ''
        }
        this.getColums = this.getColums.bind(this)
        this.handleSaveButton = this.handleSaveButton.bind(this);
        this.handleCancelButton = this.handleCancelButton.bind(this);
        this.handleEditButton = this.handleEditButton.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.getDataUserMan = this.getDataUserMan.bind(this);
        this.getUserGroup = this.getUserGroup.bind(this);
        this.realtimeData = this.realtimeData.bind(this);
        this.realtimeRoleGroup = this.realtimeRoleGroup.bind(this);
        this.showConfirm = this.showConfirm.bind(this);
        this.optionsListAction = [
            checkRole(MapRoleComponent.USER_DETAIL_USERMAN) ? {
                label: 'lang_open_user_detail',
                value: 0,
                cb: (params, value) => this.checkChange(params, value)
            } : null,
            checkRole(MapRoleComponent.ACTIVITIES_USERMAN) ? {
                label: 'lang_open_activities',
                value: 1,
                cb: (params, value) => this.checkChange(params, value)
            } : null,
            checkRole(MapRoleComponent.RESET_PASSSWORD_USERMAN) ? {
                label: 'lang_reset_password',
                value: 2,
                cb: (params, value) => this.checkChange(params, value)
            } : null,
            checkRole(MapRoleComponent.FORCE_TO_CHANGE_PASSWORD_USERMAN) ? {
                label: 'lang_force_to_change_password',
                className: 'text-normal',
                value: 4,
                divider: true,
                isForceChangePass: true,
                cb: (params, value) => this.checkChange(params, value)
            } : null
        ];
        props.confirmClose(() => this.state.isEditable)
    }

    checkChange(params, value) {
        const userId = params.user_id
        const status = params.status
        const userLoginId = params.user_login_id
        switch (value) {
            case USER_STATUS.INACTIVE:
                dataStorage.goldenLayout.addComponentToStack('CreateUser', { user_id: userId })
                break;
            case USER_STATUS.PENDING_EMAIL_VERIFICATION:
                dataStorage.goldenLayout.addComponentToStack('Activities', { user_id: userId, user_login_id: userLoginId })
                break;
            case USER_STATUS.ACTIVE:
                if (status === 1 || status === 2) this.showConfirm(userLoginId)
                break;
            case USER_STATUS.ADMIN_BLOCKED:
                this.showConfirmForce(userId, userLoginId, params.change_password)
                break;
            default:
                break;
        }
    }

    getColums() {
        let columns = [
            {
                header: 'lang_user_id',
                name: 'user_id',
                type: TYPE.BOOLEAN_LABEL,
                hide: true
            },
            {
                header: 'lang_user_login',
                name: 'user_login_id'
            },
            {
                header: 'lang_full_name',
                name: 'full_name'
            },
            {
                header: 'lang_api_access',
                name: 'user_type',
                type: TYPE.DROPDOWN,
                options: optionsAipAccess,
                getBackgroundColorKey: (params) => {
                    let value = params.value;
                    switch (value) {
                        case 'operation':
                            return '--background-tag-operation';
                        case 'advisor':
                            return '--ascend-default'
                        case 'retail':
                            return '--background-gray';
                        default: return '';
                    }
                },
                getTextColorKey: (params) => {
                    return '--color-white'
                }
            },
            {
                header: 'lang_role',
                name: 'role_group',
                type: TYPE.DROPDOWN,
                translate: false,
                options: dataStorage.userGroupDic,
                bgOnlyEdit: true
            },
            {
                header: 'lang_user_group',
                name: 'user_group',
                type: TYPE.DROPDOWN,
                options: UserGroupEnum,
                suppressSort: true,
                bgOnlyEdit: true
            },
            {
                header: 'lang_access_method',
                name: 'access_method',
                type: TYPE.DROPDOWN,
                options: optionsAccessMethod,
                suppressSort: true,
                getBackgroundColorKey: (params) => {
                    if (params.isEditMode) return '';
                    let value = params.value;
                    switch (value) {
                        case 0:
                            return '--background-tag-operation';
                        case 1:
                            return '--ascend-default'
                        default: return '';
                    }
                },
                getTextColorKey: (params) => {
                    return params.isEditMode ? '' : '--color-white'
                }
            },
            {
                header: 'lang_status',
                name: 'status',
                type: TYPE.DROPDOWN,
                options: optionsListCheck,
                suppressSort: true,
                getBackgroundColorKey: (params) => {
                    let value = params.value;
                    switch (value) {
                        case 0:
                            return '--background-orange';
                        case 1:
                            return '--background-yellow';
                        case 2:
                            return '--background-green';
                        case 3:
                        case 4:
                        case 5:
                            return '--background-red'
                        default: return '';
                    }
                },
                getTextColorKey: (params) => {
                    return '--color-white'
                }
            },
            {
                header: 'lang_email_template',
                name: 'email_template',
                type: TYPE.DROPDOWN,
                translate: false,
                options: dataStorage.dicEmailTemp,
                noUpperCase: true
            },
            {
                header: 'lang_live_news',
                name: 'live_news',
                type: TYPE.BOOLEAN,
                suppressSort: true,
                suppressFilter: true,
                stringValue: true,
                valueGetter: (params) => {
                    if (params.value === 'disable' || !params.value) return false;
                    return true;
                }
            },
            {
                header: 'lang_morning_star',
                name: 'morningStar',
                type: TYPE.BOOLEAN,
                suppressSort: true,
                suppressFilter: true,
                stringValue: true,
                valueGetter: (params) => {
                    if (params.value === 'disable' || !params.value) return false;
                    return true;
                }
            },
            dataStorage.env_config.roles.viewTipRank ? {
                header: 'lang_tip_rank',
                name: 'tipRank',
                type: TYPE.BOOLEAN,
                suppressSort: true,
                suppressFilter: true,
                stringValue: true,
                valueGetter: (params) => {
                    if (params.value === 'disable' || !params.value) return false;
                    return true;
                }
            } : null,
            {
                header: 'lang_broker_data',
                name: 'brokerData',
                type: TYPE.BOOLEAN,
                suppressSort: true,
                suppressFilter: true,
                stringValue: true,
                valueGetter: (params) => {
                    if (params.value === 'disable' || !params.value) return false;
                    return true;
                }
            },
            dataStorage.env_config.roles.contingentOrder ? {
                header: 'lang_contingent_order',
                name: 'contingentOrder',
                type: TYPE.BOOLEAN,
                suppressSort: true,
                suppressFilter: true,
                stringValue: true,
                valueGetter: (params) => {
                    if (params.value === 'disable' || !params.value) return false;
                    return true;
                }
            } : null,
            {
                header: 'lang_email',
                name: 'email'
            },
            {
                header: 'lang_phone_number',
                name: 'phone'
            },
            {
                header: 'lang_management',
                name: 'list_mapping',
                type: TYPE.MULTI_LABEL_WITH_BG,
                suppressSort: true,
                suppressFilter: true,
                valueGetter: (params) => {
                    let obj = {}
                    obj.organisation_code = params.data.organisation_code
                    obj.branch_code = params.data.branch_code
                    obj.advisor_code = params.data.advisor_code
                    obj.list_mapping = params.data.list_mapping
                    return obj
                },
                formater: (params) => {
                    let branch = params.data.branch_code ? params.data.branch_code + ',' : '';
                    let org = params.data.organisation_code ? params.data.organisation_code + ',' : '';
                    let adv = params.data.advisor_code ? params.data.advisor_code + ',' : '';
                    let lst = params.data.list_mapping ? params.data.list_mapping : '';
                    return branch + org + adv + lst;
                }
            },
            {
                header: 'lang_notes',
                name: 'note'
            },
            {
                header: 'lang_actor',
                name: 'actor'
            },
            {
                header: 'lang_last_updated',
                name: 'updated',
                type: TYPE.DATE,
                dateFormat: 'DD MMM YYYY hh:mm:ss'
            },
            (checkRole(MapRoleComponent.USER_DETAIL_USERMAN) || checkRole(MapRoleComponent.ACTIVITIES_USERMAN) || checkRole(MapRoleComponent.RESET_PASSSWORD_USERMAN) || checkRole(MapRoleComponent.FORCE_TO_CHANGE_PASSWORD_USERMAN)) ? {
                header: 'lang_action_list',
                name: 'action',
                options: this.optionsListAction.filter(x => x),
                type: TYPE.ACTION_DROPDOWN,
                suppressSort: true,
                suppressFilter: true
            } : null
        ]
        return columns
    }

    getFilterOnSearch = (body, resetPage) => {
        if (!resetPage) this.page_id = 1;
        if (body) {
            this.filterAndSearch = body
        }
        this.getDataUserMan()
    }

    changeConnection(isConnected) {
        if (isConnected !== this.state.isConnected) {
            this.setState({ isConnected })
            if (isConnected) {
                this.getUserGroup()
                this.getEmailTemplateList()
                this.getFilterOnSearch()
            }
        }
    }

    hiddenWarning() {
        try {
            setTimeout(() => {
                this.setState({ idShowWarning: false })
            }, 4000)
        } catch (error) {
            logger.error('hiddenWarning On UserMan ' + error)
        }
    }

    realtimeData(data, action) {
        if (data.addon) {
            let addon = data.addon;
            if (addon.includes(this.allAddon[1].id) === true) {
                data.morningStar = 'enable'
            } else {
                data.morningStar = 'disable'
            }
            if (addon.includes(this.allAddon[0].id) === true) {
                data.tipRank = 'enable'
            } else {
                data.tipRank = 'disable'
            }
            if (addon.includes(this.allAddon[2].id) === true) {
                data.brokerData = 'enable'
            } else {
                data.brokerData = 'disable'
            }
            delete data.addon
        }
        if (data.live_news) {
            if (!data.live_news) {
                data.live_news = 'disable'
            } else {
                data.live_news = 'enable'
            }
        }
        if (data && data.user_id) {
            if (action === 'UPDATE') {
                const index = (this.dataObj.data || []).findIndex((item) => {
                    return (item.user_id === data.user_id)
                });
                if (index > -1) {
                    const item = clone(this.dataObj.data[index]);
                    if (Array.isArray(data.list_mapping)) {
                        data.list_mapping = (data.list_mapping.map((obj) => obj.account_id)).toString()
                    }
                    let newData = Object.assign(item, data);
                    if (newData.user_type === 'retail') {
                        this.resetData(newData, ['branch_code', 'advisor_code', 'organisation_code'])
                    } else if (newData.user_type === 'operation') {
                        this.resetData(newData, ['branch_code', 'advisor_code', 'organisation_code', 'list_mapping'])
                    }
                    this.addOrUpdate(newData)
                }
            } else if (Number(this.dataObj.current_page) === 1) {
                let index2 = -1
                if (this.filterText && (data.user_id.indexOf(this.filterText) > -1 ||
                    (data.full_name && data.full_name.indexOf(this.filterText) > -1))) {
                    index2 = 0
                }
                if (Array.isArray(data.list_mapping)) {
                    data.list_mapping = (data.list_mapping.map((obj) => obj.account_id)).toString()
                }
                if (index2 > -1 || !this.filterText) {
                    this.addOrUpdate(data)
                }
            }
        }
    }

    realtimeRoleGroup(data) {
        this.getUserGroup(true)
    }

    createRequestUpdate(newObj) {
        let data = { data: {} }
        data.data.user_type = newObj.user_type
        data.data.status = newObj.status
        data.data.role_group = newObj.role_group
        data.data.access_method = newObj.access_method
        data.data.email_template = newObj.email_template
        data.data.email = newObj.email || null
        data.data.user_group = newObj.user_group
        data.data.live_news = (newObj.live_news === 'enable' ? 1 : 0)
        const addOns = [];
        if (newObj.tipRank === 'enable') {
            addOns.push('A0');
        }
        if (newObj.morningStar === 'enable') {
            addOns.push('A1');
        }
        if (newObj.brokerData === 'enable') {
            addOns.push('A2');
        }
        if (newObj.contingentOrder === 'enable') {
            addOns.push('A3');
        }
        data.data.addon = addOns.join(',');
        return new Promise(resolve => {
            const url = getUserDetailUrl(`user-details/${newObj.user_id}`);
            putData(url, data)
                .then(res => {
                    resolve();
                })
                .catch(e => {
                    const errorCode = e.response && e.response.errorCode;
                    this.errorCode.push(errorCode)
                    if (this.listResponse.length) {
                        if (errorCode < this.listResponse[0]) this.listResponse.unshift(errorCode)
                        else this.listResponse.push(errorCode)
                    } else this.listResponse.push(errorCode);
                    resolve(errorCode);
                })
        });
    }

    handleSaveButton(pageChange, isEdit) {
        this.listResponse = []
        let listDataChange = []
        let requireEmail = []
        const lstData = this.getData(true)
        if (lstData.length) {
            lstData.map(item => {
                listDataChange.push(this.createRequestUpdate(item))
            })
            if (listDataChange.length > 0 && requireEmail.length < 1) {
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
                    error: 'Updating_user_information',
                    idShowWarning: true,
                    loadingConfirm: true,
                    haveErrorOrder: false
                })

                Promise.all(listDataChange).then(res => {
                    if (this.listResponse.length) {
                        clearTimeout(this.timeoutRequest)
                        this.setState({
                            error: `error_code_${this.listResponse[0]}`,
                            idShowWarning: true,
                            loadingConfirm: false,
                            haveErrorOrder: true
                        }, () => this.hiddenWarning())
                    } else {
                        clearTimeout(this.timeoutRequest)
                        this.setState({
                            error: 'lang_update_user_information_successfully',
                            idShowWarning: true,
                            loadingConfirm: false,
                            haveErrorOrder: false,
                            isEditable: isEdit || false,
                            filter: []
                        }, () => {
                            this.hiddenWarning()
                            if (pageChange) this.getFilterOnSearch()
                            else {
                                this.setEditMode(this.state.isEditable)
                                this.saveData()
                            }
                        })
                    }
                }).catch(e => {
                    logger.log(e);
                })
            }
        } else {
            this.setState({
                error: 'lang_no_change_user_information',
                idShowWarning: true,
                loadingConfirm: false,
                haveErrorOrder: false,
                isEditable: false
            }, () => {
                this.hiddenWarning()
                this.setEditMode(this.state.isEditable)
            })
        }
    }

    handleCancelButton() {
        this.setState({ isEditable: false }, () => {
            this.setEditMode(this.state.isEditable)
            this.resetData();
        })
    }

    handleEditButton() {
        if (!this.state.isConnected) return
        this.setState({ isEditable: true }, () => {
            this.setEditMode(this.state.isEditable);
            this.updateCanvasSize();
        })
    }

    handlePressButton(param) {
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

    getEmailTemplateList() {
        const url = getEmailTempUrl();
        if (url) {
            getData(url)
                .then(resolve => {
                    if (resolve && resolve.data) {
                        this.listEmailTemp = {}
                        dataStorage.dicEmailTemp = []
                        const listEmailTemp = resolve.data;
                        listEmailTemp.map((item) => {
                            if (item.id && item.name) {
                                this.dicEmailTemp[item.id] = item.name
                                dataStorage.dicEmailTemp.push({ label: item.name, value: item.id })
                            }
                        })
                    }
                    this.setColumn(this.getColums())
                })
                .catch(e => logger.log('error get List Email Template', e))
        }
    }

    getUserGroup(refresh) {
        const url = getUserGroupUrl();
        if (url) {
            getData(url)
                .then(resolve => {
                    dataStorage.userGroupDic = []
                    if (resolve && resolve.data && resolve.data.data) {
                        const listDropDown = resolve.data.data;
                        this.userGroupDic = {}
                        listDropDown.map((item) => {
                            if (item.group_id && item.group_name) {
                                this.userGroupDic[item.group_id] = item.group_name
                                if (item.group_name !== 'DEFAULT') {
                                    dataStorage.userGroupDic.push({ label: (item.group_name || ''), value: item.group_id })
                                }
                            }
                        })
                        this.setColumn(this.getColums())
                    }
                })
                .catch(e => logger.log('error get List user Group', e))
        }
    }

    getDataUserMan = async () => {
        const requestId = uuidv4();
        this.requestId = requestId;
        let url = getUserMan(this.filterText, this.page_id, PAGESIZE);
        let cb = getData
        if (this.filterAndSearch) {
            url = getApiFilter('user', this.page_id)
            cb = postData
        }
        this.props.loading(true);
        this.curData = {};
        const urlAddon = getUserAddon();
        if (urlAddon) {
            await getData(urlAddon)
                .then(resolve => {
                    this.allAddon = resolve.data
                })
                .catch(e => {
                    this.allAddon = []
                })
        }
        await cb(url, this.filterAndSearch)
            .then(response => {
                this.props.loading(false)
                if (requestId !== this.requestId || response.error) return
                this.isReady = true;
                this.dataObj = response.data || {};
                this.listDataObj = clone(response.data.data) || {}
                for (let i = 0; i < this.listDataObj.length; i++) {
                    if (this.listDataObj[i].addon) {
                        let addon = this.listDataObj[i].addon;
                        if (addon.includes(this.allAddon[0] && this.allAddon[0].id)) {
                            this.dataObj.data[i].tipRank = 'enable'
                        } else {
                            this.dataObj.data[i].tipRank = 'disable'
                        }
                        if (addon.includes(this.allAddon[1] && this.allAddon[1].id)) {
                            this.dataObj.data[i].morningStar = 'enable'
                        } else {
                            this.dataObj.data[i].morningStar = 'disable'
                        }
                        if (addon.includes(this.allAddon[2] && this.allAddon[2].id)) {
                            this.dataObj.data[i].brokerData = 'enable'
                        } else {
                            this.dataObj.data[i].brokerData = 'disable'
                        }
                        if (addon.includes(this.allAddon[3] && this.allAddon[3].id)) {
                            this.dataObj.data[i].contingentOrder = 'enable'
                        } else {
                            this.dataObj.data[i].contingentOrder = 'disable'
                        }
                    } else {
                        this.dataObj.data[i].morningStar = 'disable'
                        this.dataObj.data[i].tipRank = 'disable'
                        this.dataObj.data[i].brokerData = 'disable'
                        this.dataObj.data[i].contingentOrder = 'disable'
                    }
                    if (!this.dataObj.data[i].live_news) {
                        this.dataObj.data[i].live_news = 'disable'
                    } else {
                        this.dataObj.data[i].live_news = 'enable'
                    }
                }
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
                this.handleOnChangeDropDown()
                this.setPage(this.pageObj)
            })
            .catch(error => {
                this.props.loading(false)
                if (requestId !== this.requestId) return
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

    pageChanged(pageId) {
        if (this.page_id === pageId) return;
        if (this.state.isEditable) {
            const lstData = this.getData(true)
            if (lstData.length > 0) {
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
                        this.resetData();
                        this.page_id = pageId
                        this.getFilterOnSearch(null, true)
                    },
                    cancelCallback: () => { }
                })
            } else {
                this.page_id = pageId;
                this.getFilterOnSearch(null, true)
            }
        } else {
            this.page_id = pageId;
            this.getFilterOnSearch(null, true)
        }
    }

    componentWillUnmount() {
        try {
            const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
            this.emitConnectionID && this.emitConnectionID.remove();
            removeEventListener(EVENTNAME.clickToRefresh, this.getDataUserMan)
            unregisterAllOrders(this.realtimeData, 'USER_DETAIL');
            unregisterAllOrders(this.realtimeRoleGroup, 'ROLEGROUP');
        } catch (error) {
            logger.error('componentWillUnmount On UserMan' + error)
        }
    }
    componentWillMount() {
        this.getUserGroup()
        this.getEmailTemplateList()
    }

    componentDidMount() {
        const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
        registerAllOrders(this.realtimeData, 'USER_DETAIL');
        registerAllOrders(this.realtimeRoleGroup, 'ROLEGROUP');
        // this.getFilterOnSearch()
    }

    showConfirm = (userLoginId) => {
        Confirm({
            checkWindowLoggedOut: true,
            header: 'lang_confirm',
            message: <div><span className='text-overflow notWhiteSpace'><Lang>lang_confirm_reset_password</Lang> {userLoginId}?</span></div>,
            callback: () => {
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
                    error: 'lang_sending_reset_pass',
                    idShowWarning: true,
                    loadingConfirm: true,
                    haveErrorOrder: false
                })
                const url = getResetPasswordUrl();
                postData(url, { data: { user_login_id: userLoginId, type: 'forgot_password' } }).then(res => {
                    clearTimeout(this.timeoutRequest)
                    this.setState({
                        error: 'lang_sending_reset_pass_success',
                        idShowWarning: true,
                        loadingConfirm: false,
                        haveErrorOrder: false
                    }, () => this.hiddenWarning())
                }).catch(error => {
                    clearTimeout(this.timeoutRequest)
                    let errorCode = ''
                    if (error.response && error.response.errorCode) {
                        errorCode = error.response.errorCode
                    }
                    this.setState({
                        error: mapError(errorCode),
                        idShowWarning: true,
                        loadingConfirm: false,
                        haveErrorOrder: true
                    }, () => this.hiddenWarning())
                })
            },
            cancelCallback: () => {
                logger.log('cancel reset password')
            }
        })
    }

    showConfirmForce(userId, userLoginId, changePassword) {
        const t = dataStorage.translate
        let keyMess = t('lang_confirm_force_password')
        let data = {}
        data.change_password = changePassword ? 0 : 1
        if (!data.change_password) keyMess = t('lang_confirm_force_password_cancel')
        const mess = stringFormat(keyMess, {
            userLoginId: userLoginId
        })
        Confirm({
            checkWindowLoggedOut: true,
            header: 'lang_confirm',
            message: <span className='text-overflow notWhiteSpace'>{mess}</span>,
            notTranslate: true,
            callback: () => {
                const url = getUserDetailUrl(`user-details/${userId}`);
                putData(url, { data })
                    .then(res => {
                    })
                    .catch(error => {
                        logger.log(' error force password', error)
                    })
            },
            cancelCallback: () => {
                logger.log('cancel force password')
            }
        })
    }

    handleOnChangeDropDown(index) {
        try {
            if (index) this.optionFilter = index
            let arrOptions = this.optionFilter
            this.setCheckedRowData({ status: arrOptions || [] })
        } catch (error) {
            logger.error('handleOnChangeDropDown On UserMan ' + error)
        }
    }

    openImportForm(showUpload = true) {
        if (!checkRole(MapRoleComponent.CREATE_USER_IN_BULK_USERMAN)) return
        if (!this.state.isConnected && !showUpload) return
        this.setState({
            showUpload
        })
    }

    renderHeader() {
        const t = dataStorage.translate
        return (
            <div className={`header-wrap isMoreOption flex ${this.collapse ? 'collapse' : ''}`}>
                <div className='navbar'>
                    <div className='boxButton' style={{ display: 'flex' }}>
                        <ButtonGroup
                            requireRole={MapRoleComponent.EDIT_USER_USERMAN}
                            editModeOnly={true}
                            loadingConfirm={this.state.loadingConfirm}
                            isEditable={this.state.isEditable}
                            isNodata={this.state.isNodata}
                            callBack={(param) => {
                                this.handlePressButton(param)
                            }}
                        />
                        {
                            !this.state.isEditable
                                ? <div className='btn-group showTitle'>
                                    <Button className={`btn importButton ${this.state.isConnected && checkRole(MapRoleComponent.CREATE_USER_IN_BULK_USERMAN) ? '' : 'disabled'}`} onClick={this.openImportForm.bind(this, true)}>
                                        <SvgIcon path={path.mdiAccountPlus} />
                                        <span className='text-uppercase'>{<Lang>lang_create_new_in_bulk</Lang>}</span>
                                    </Button>
                                </div>
                                : null
                        }
                    </div>
                    <div className='box-filter'>
                        <FilterBox
                            value={this.state.valueFilter}
                            onChange={(text) => this.setQuickFilter(text)}
                        />
                    </div>
                </div>
                <MoreOption agSideButtons={this.createagSideButtons()} />
            </div>
        )
    }

    getRowCheck(value) {
        this.updateCheckedRow({ status: value })
    }

    getCsvFunction = (obj) => {
        if (this.csvWoking) return
        this.csvWoking = true
        getCsvFile({
            url: getReportCsvFileUrl('user'),
            body_req: this.filterAndSearch,
            glContainer: this.props.glContainer,
            columnHeader: obj.columns,
            lang: dataStorage.lang
        }, () => {
            this.csvWoking = false;
        })
    }

    collapseFunc = (collapse) => {
        this.collapse = collapse ? 1 : 0
        this.setState({ isEditable: false })
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
                callback: () => this.exportCSV()
            },
            {
                value: 'ResetFilter',
                label: 'lang_reset_filter',
                callback: () => this.resetFilter()
            },
            {
                value: 'Resize',
                label: 'lang_resize',
                callback: () => this.resize()
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

    renderOptionsBar() {
        return (
            this.state.isEditable
                ? <div className={`header-wrap options-bar ${this.collapse ? 'collapse' : ''}`}>
                    <div className='navbar line-top' style={{ paddingRight: 0 }}>
                        <div style={{ display: 'flex' }}>
                            <MultiDropDown
                                headerCheckBox={true}
                                className='DropDownOrder'
                                options={optionsListCheck}
                                onChange={this.handleOnChangeDropDown.bind(this)}
                                widthContent={217}
                            />
                            <div className='list-icon'>
                                <div className='showTitle'>
                                    <Icon className='icon qe-lib-icon' onClick={() => this.getRowCheck(USER_STATUS.INACTIVE)} src={'action/lock'} />
                                    <div className='hiddenTooltip text-uppercase'><Lang>lang_inactive</Lang></div>
                                </div>
                                <div className='showTitle'>
                                    <Icon className='icon qe-lib-icon' onClick={() => this.getRowCheck(USER_STATUS.PENDING_EMAIL_VERIFICATION)} src={'communication/email'} />
                                    <div className='hiddenTooltip text-uppercase'><Lang>lang_pending_email_verification</Lang></div>
                                </div>
                                <div className='showTitle'>
                                    <Icon className='icon qe-lib-icon' onClick={() => this.getRowCheck(USER_STATUS.ACTIVE)} src={'action/lock-open'} />
                                    <div className='hiddenTooltip text-uppercase'><Lang>lang_active</Lang></div>
                                </div>
                                <div className='blockA showTitle'>
                                    <Icon className='icon qe-lib-icon' onClick={() => this.getRowCheck(USER_STATUS.ADMIN_BLOCKED)} src={'content/block'} />
                                    <div className='hiddenTooltip text-uppercase'><Lang>lang_admin_blocked</Lang></div>
                                </div>
                                <div className='blockS showTitle'>
                                    <Icon className='icon qe-lib-icon' onClick={() => this.getRowCheck(USER_STATUS.SECURITY_BLOCKED)} src={'content/block'} />
                                    <div className='hiddenTooltip text-uppercase'><Lang>lang_security_blocked</Lang></div>
                                </div>
                                <div className='showTitle'>
                                    <Icon className='icon qe-lib-icon' onClick={() => this.getRowCheck(USER_STATUS.CLOSED)} src={'navigation/cancel'} />
                                    <div className='hiddenTooltip text-uppercase'><Lang>lang_closed</Lang></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                : null
        )
    }

    render() {
        return (
            <div className='user-man-wrap root qe-widget' ref={dom => this.dom = dom}>
                {
                    this.state.showUpload
                        ? <div className='wrapperImport'>
                            <UserUploadFile openImportForm={this.openImportForm.bind(this)} isConnected={this.state.isConnected} />
                        </div>
                        : null
                }
                <div className={`errorOrder size--3 ${this.state.haveErrorOrder ? '' : 'yellow'} ${this.state.idShowWarning ? '' : 'myHidden'}`}><Lang>{this.state.error}</Lang></div>
                {this.renderHeader()}
                {this.renderOptionsBar()}
                <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
                <div className={this.state.isEditable ? 'display-checkbox' : ''} style={{ flex: 1, zIndex: 1 }}>
                    <Grid
                        {...this.props}
                        id={FORM.USER_MANAGEMENT}
                        fn={fn => {
                            this.addOrUpdate = fn.addOrUpdate
                            this.setData = fn.setData
                            this.getData = fn.getData
                            this.setColumn = fn.setColumn
                            this.resize = fn.autoSize
                            this.exportCSV = fn.exportCsv
                            this.resetFilter = fn.resetFilter
                            this.setQuickFilter = fn.setQuickFilter
                            this.setEditMode = fn.setEditMode
                            this.resetData = fn.resetData
                            this.showColumnMenu = fn.showColumnMenu
                            this.showFilterMenu = fn.showFilterMenu
                            this.saveData = fn.saveData
                            this.setCheckedRowData = fn.setCheckedRowData
                            this.updateCheckedRow = fn.updateCheckedRow
                            this.updateCanvasSize = fn.updateCanvasSize
                        }}
                        fnKey={data => {
                            return data.user_id
                        }}
                        getCsvFunction={this.getCsvFunction}
                        getFilterOnSearch={this.getFilterOnSearch}
                        paginate={{
                            setPage: (cb) => {
                                this.setPage = cb
                            },
                            page_size: PAGESIZE,
                            pageChanged: this.pageChanged.bind(this)
                        }}
                        columns={this.getColums()}
                        showConfirm={this.showConfirm}
                    />
                </div>
            </div>
        )
    }
}

export default UserManager;
