import React from 'react';
import showModal from '../Inc/Modal';
import ConfirmUserGroupManagement from '../Inc/ConfirmUserGroupManagement';
import Lang from '../Inc/Lang';
import ButtonGroup from '../Inc/ButtonGroup';
import FilterBox from '../Inc/FilterBox';
import { getData, putData, getUserGroupUrl, getMappingRoleUserGroupUrl } from '../../helper/request';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import { hideElement, checkRole, mapError, formatInitTime } from '../../helper/functionUtils'
import uuidv4 from 'uuid/v4';
import { emitter, eventEmitter } from '../../constants/emitter_enum';
import { registerAllOrders, unregisterAllOrders, unregisterUser, registerUser } from '../../streaming';
import { func } from '../../storage';
import roleEnum from '../../constants/roleEnum';
import DropDown from '../DropDown/DropDown';
import CanvasGrid from '../Inc/CanvasGrid';
import ToggleLine from '../Inc/ToggleLine';
import NoTag from '../Inc/NoTag'
import MoreOption from '../Inc/MoreOption';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';
import OptionLayoutEnum from '../../constants/optionLayout'

export class UserGroupManagement extends React.Component {
    constructor(props) {
        super(props);
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.accountRefresh = func.getStore(emitter.STREAMING_ACCOUNT_DATA);
        this.dicRole = {}
        this.userType = ((dataStorage.userInfo && dataStorage.userInfo.group_name) || '')
        this.columns = []
        const initState = this.props.loadState();
        this.state = {
            errorOrder: '',
            isShowWarning: false,
            haveErrorOrder: true,
            updated: null,
            actor: null,
            valueFilter: initState.valueFilter || ''
        }
        this.collapse = initState.collapse ? 1 : 0
        this.dicLayout = OptionLayoutEnum
        this.optionLayout = [];
        for (const key in this.dicLayout) {
            const element = {
                label: this.dicLayout[key],
                value: roleEnum[key]
            }
            this.optionLayout.push(element)
        }
        this.realtimeData = this.realtimeData.bind(this);
        this.realtimeRole = this.realtimeRole.bind(this);
        this.realTimeDataUser = this.realTimeDataUser.bind(this)
        // this.id = uuidv4();
        // props.glContainer && props.glContainer.on('show', () => {
        //     hideElement(props, false, this.id);
        // });
        // props.glContainer && props.glContainer.on('hide', () => {
        //     hideElement(props, true, this.id);
        // });
        props.confirmClose(() => this.state.isEditable)
    }

    realTimeDataUser(value) {
        if (value.timezone) {
            this.getAllUserGroupManagement()
        }
    }

    realtimeRole(data, NULL, title) {
        if (!data) return
        this.addOrUpdate(data.data);
        this.setState({
            actor: data.actor,
            group_name: data.group_name,
            updated: data.updated
        })
    }

    realtimeData(data, data1, title) {
        if (!/^ROLEGROUP/.test(title)) return
        let roleGroupId = data.data.role_group_id || ''
        let roleGroupName = data.data.role_group_name || ''
        let listRole = data.data.list_role || []
        if (/^ROLEGROUP#INSERT#/.test(title)) {
            const item = {
                header: roleGroupName,
                headerFixed: roleGroupName,
                name: roleGroupId,
                maxWidth: 160,
                suppressFilter: true,
                suppressSort: true,
                type: TYPE.BOOLEAN,
                fnType: params => params.data.role_id === roleEnum.LAYOUT_0 && TYPE.DROPDOWN,
                options: this.optionLayout,
                enableRowGroup: true
            }
            this.dicLayoutOption[roleGroupId] = (listRole.filter(i => /LAYOUT_/.test(i)) || [])[0]
            this.columns = this.columns.map(col => {
                return { ...col }
            });
            this.columns.splice(2, 0, item);
            this.setColumn(this.columns)
        }

        if (/^ROLEGROUP#REMOVE#/.test(title)) {
            for (let i = 0; i < this.columns.length; i++) {
                if (this.columns[i].name === roleGroupId) {
                    this.columns.splice(i, 1)
                    break;
                }
            }
            this.setColumn(this.columns);
        }
        let roleArr = listRole
        if (/^ROLEGROUP#UPDATE#/.test(title)) {
            roleArr = listRole.split(',');
        }
        if (/^ROLEGROUP#(INSERT|REMOVE)#/.test(title)) {
            listRole = listRole.join(',')
        }
        let lstData = this.getData().map(val => {
            if (val.role_id === 'LAYOUT_0') {
                val[roleGroupId] = (listRole.match(/LAYOUT_[0-9]+/) || [''])[0]
            } else val[roleGroupId] = roleArr.indexOf(val.role_id) > -1;
            return val
        })
        this.setData(lstData)
        this.setState({
            actor: data.actor,
            group_name: data.group_name,
            updated: data.updated
        })
    }

    hiddenWarning() {
        setTimeout(() => {
            this.setState({
                isShowWarning: false
            })
        }, 2000)
    }

    handleCallBackConfirm(data) {
        this.setState({
            errorOrder: data,
            isShowWarning: true,
            haveErrorOrder: false
        }, () => this.hiddenWarning())
    }

    handleCreate() {
        showModal({
            component: ConfirmUserGroupManagement,
            props: {
                type: 'Create',
                options: this.columns && this.columns.filter(item => ['role_group', 'description'].indexOf(item.name) === -1),
                callBack: this.handleCallBackConfirm.bind(this)
            }
        })
    }

    handleRemove() {
        showModal({
            component: ConfirmUserGroupManagement,
            props: {
                type: 'Remove',
                options: this.columns && this.columns.filter(item => ['role_group', 'description', 'UG0', 'UG1', 'UG2', 'UG3'].indexOf(item.name) === -1),
                callBack: this.handleCallBackConfirm.bind(this)
            }
        })
    }

    checkDiff() {
        let newArray = this.getData();
        if (!newArray) return
        if (newArray.length) {
            let newDescription = []
            const dicData = {};
            const dicChange = {};

            this.getColumn(true).forEach(col => {
                dicChange[col.name] = true
            });
            newDescription = this.getData(true, ['role_id', 'description']).map(item => {
                return {
                    role_id: item.role_id,
                    description: item.description
                }
            })
            for (let i = 0; i < newArray.length; i++) {
                for (var key in newArray[i]) {
                    if (key === 'key' || key === 'role_id' || key === 'role_group') continue;
                    else if (key !== 'description') {
                        if (!dicData[key]) dicData[key] = [];
                        if (newArray[i][key]) {
                            if (newArray[i].role_id === 'LAYOUT_0') {
                                dicData[key].push(newArray[i][key])
                            } else {
                                dicData[key].push(newArray[i].role_id)
                            }
                        }
                    }
                }
            }
            let result = {}
            let newGroupChange = {}
            for (var key2 in dicData) {
                if (dicChange[key2]) {
                    newGroupChange[key2] = dicData[key2]
                }
            }
            result.newGroupChange = newGroupChange
            result.newDescription = newDescription
            return result
        }
    }

    handleSave() {
        const diffArray = this.checkDiff();
        let errorList = []
        let url = ''
        const listPromise = []
        if (diffArray.newDescription.length > 0) {
            url = getMappingRoleUserGroupUrl();
            listPromise.push(new Promise(resolve => {
                putData(url, { data: diffArray.newDescription }).then(response => {
                    if (response.data) {
                        if (response.data.message === 'Success') {
                            this.saveData();
                        } else {
                            errorList.push(response.data.message || '')
                        }
                    }
                    resolve()
                }).catch(error => {
                    errorList.push(error)
                    logger.error(error)
                    resolve()
                })
            }))
        }
        if (Object.keys(diffArray.newGroupChange).length) {
            for (var key in diffArray.newGroupChange) {
                listPromise.push(new Promise(resolve => {
                    url = getUserGroupUrl(key)
                    let removeEleNull = diffArray.newGroupChange[key].filter((el) => {
                        return el != null;
                    });
                    const obj = {
                        data: {
                            list_role: removeEleNull
                        }
                    };
                    putData(url, obj)
                        .then(response => {
                            if (response.data) {
                                if (response.data.message === 'Success') {
                                    this.saveData();
                                } else {
                                    errorList.push(response.data.message || '')
                                }
                            }
                            resolve()
                        })
                        .catch(error => {
                            resolve()
                            let errorCode = ''
                            if (error && error.response && error.response.errorCode) errorCode = error.response.errorCode
                            errorList.push(errorCode)
                            logger.error(error)
                        })
                }))
            }
        }
        if (!listPromise || listPromise.length === 0) {
            this.setState({ isEditable: false }, () => this.setEditMode(false));
            this.setState({
                errorOrder: 'error_code_2026',
                isShowWarning: true,
                haveErrorOrder: false
            }, () => this.hiddenWarning())
            return
        }
        this.setState({
            errorOrder: 'lang_updating_role_information',
            isShowWarning: true,
            haveErrorOrder: false
        }, () => setTimeout(() => {
            Promise.all(listPromise)
                .then(response => {
                    if (errorList.length > 0) {
                        this.setState({
                            errorOrder: mapError(errorList[0]),
                            isShowWarning: true,
                            haveErrorOrder: true
                        }, () => this.hiddenWarning())
                    } else {
                        this.setState({
                            errorOrder: 'lang_save_role_successfully',
                            isShowWarning: true,
                            haveErrorOrder: false,
                            isEditable: false
                        }, () => {
                            this.hiddenWarning()
                            this.setEditMode(false)
                        })
                    }
                })
                .catch(error => {
                    logger.error(error)
                    const errorCode = (error && error.response && error.response.data && error.response.data.errorCode);
                    const errorText = errorCode ? `error_code_${errorCode}` : 'lang_save_role_unsuccessfully'
                    this.setState({
                        errorOrder: errorText,
                        isShowWarning: true,
                        haveErrorOrder: true
                    }, () => this.hiddenWarning())
                })
        }), 500)
    }

    handleCallBackActionGroup(type) {
        switch (type) {
            case 'Create':
                this.handleCreate()
                break;
            case 'Edit':
                this.setState({ isEditable: true }, () => this.setEditMode(true));
                break;
            case 'Remove':
                this.handleRemove()
                break;
            case 'Cancel':
                this.setState({ isEditable: false }, () => {
                    this.resetData();
                    this.setEditMode(false);
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
                callback: () => this.resetFilter()
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
    getAllUserGroupManagement() {
        const { t } = this.props;
        let url = getMappingRoleUserGroupUrl()
        const that = this
        that.dicLayoutOption = {}
        this.props.loading(true)
        getData(url)
            .then(response => {
                this.props.loading(false)
                let roles = [];
                if (response.data) {
                    this.mappingUserGroup = response.data
                    roles = response.data || [];
                    for (let i = 0; i < response.data.length; i++) {
                        if (response.data[i].role_name === 'Super Admin Default Layout') {
                            const rolename = 'Default Layout'
                            this.dicRole[response.data[i].role_id] = rolename
                        } else {
                            this.dicRole[response.data[i].role_id] = response.data[i].role_name
                        }
                    }
                    url = getUserGroupUrl()
                    this.props.loading(true)
                    getData(url)
                        .then(response => {
                            this.props.loading(false)
                            if (response.data) {
                                const userGroupArray = response.data.data || []
                                const temp = userGroupArray.sort((a, b) => {
                                    return a['group_id'].length - b['group_id'].length
                                })
                                let temp1 = temp.slice(0, 12)
                                temp1.sort((a, b) => {
                                    const aIndex = a['group_id'].slice(2)
                                    const bIndex = b['group_id'].slice(2)
                                    return aIndex - bIndex
                                })
                                let temp2 = temp.slice(12).sort((a, b) => {
                                    const textA = a['group_id'];
                                    const textB = b['group_id'];
                                    return textB.localeCompare(textA);
                                })
                                const userGroupArraySorted = temp2.concat(temp1)
                                let data = []
                                let columns = [
                                    {
                                        header: 'lang_role',
                                        name: 'role_group',
                                        formater: (params) => {
                                            if (params.group) return params.data.role_group
                                            return this.dicRole[params.data.role_id];
                                        },
                                        suppressSort: true,
                                        groupIndex: 1,
                                        valueGetter: params => {
                                            return this.dicRole[params.data.role_id];
                                        }
                                    },
                                    {
                                        header: 'lang_description',
                                        name: 'description',
                                        type: TYPE.INPUT,
                                        suppressSort: true
                                    }
                                ]
                                this.optionLayout = (roles || []).filter(x => /LAYOUT_/.test(x.role_id)).map(v => {
                                    return {
                                        label: v.role_name,
                                        value: v.role_id
                                    }
                                })
                                for (let j = 0; j < userGroupArraySorted.length; j++) {
                                    if (userGroupArraySorted[j].group_id === 'DEFAULT') continue
                                    const item = userGroupArraySorted[j]
                                    let column = {
                                        headerFixed: item.group_name,
                                        name: item.group_id,
                                        type: TYPE.BOOLEAN,
                                        fnType: params => params.data.role_id === roleEnum.LAYOUT_0 && TYPE.DROPDOWN,
                                        suppressFilter: true,
                                        options: this.optionLayout,
                                        suppressSort: true
                                    }
                                    columns.push(column)
                                    that.dicLayoutOption[userGroupArraySorted[j].group_id] = ((userGroupArraySorted[j].list_role || []).filter(i => /LAYOUT_/.test(i)) || [])[0]
                                }

                                for (let i = 0; i < roles.length; i++) {
                                    let item = {}
                                    const role = roles[i] || {};
                                    if ([
                                        roleEnum.LAYOUT_1,
                                        roleEnum.LAYOUT_2,
                                        roleEnum.LAYOUT_3,
                                        roleEnum.LAYOUT_4,
                                        roleEnum.LAYOUT_5,
                                        roleEnum.LAYOUT_6,
                                        roleEnum.LAYOUT_7,
                                        roleEnum.LAYOUT_8,
                                        roleEnum.LAYOUT_9,
                                        roleEnum.LAYOUT_10,
                                        roleEnum.LAYOUT_11,
                                        roleEnum.LAYOUT_12,
                                        roleEnum.LAYOUT_13,
                                        roleEnum.LAYOUT_14,
                                        roleEnum.LAYOUT_15,
                                        roleEnum.LAYOUT_16
                                    ].indexOf(role.role_id) > -1) continue
                                    if (role && role.role_id && role.role_id !== '--' && role.role_name && role.role_name !== '--') {
                                        item.role_id = role.role_id
                                        item.description = role.description
                                        item.role_group = role.role_id_name;
                                        for (let j = 0; j < userGroupArraySorted.length; j++) {
                                            if (role.role_id === roleEnum.LAYOUT_0 && userGroupArraySorted[j] && userGroupArraySorted[j].group_id) {
                                                item[userGroupArraySorted[j].group_id] = that.dicLayoutOption[userGroupArraySorted[j].group_id]
                                            } else {
                                                item[userGroupArraySorted[j].group_id] = (userGroupArraySorted[j].list_role || []).indexOf(role.role_id) > -1
                                            }
                                        }
                                        data.push(item)
                                    }
                                }
                                this.columns = columns;
                                this.setColumn(columns);
                                this.setData(data);
                                this.setState({
                                    actor: response.data.actor || '',
                                    updated: response.data.updated || '',
                                    group_name: response.data.group_name || ''
                                })
                            }
                        })
                        .catch(error => {
                            this.props.loading(false)
                            logger.error(error)
                        })
                }
            })
            .catch(error => {
                this.props.loading(false)
                logger.error(error)
            })
    }
    renderHeader() {
        return (
            <NoTag>
                <div className={`header-wrap flex ${this.collapse ? 'collapse' : ''}`} style={{ padding: 0 }}>
                    <div className='navbar'>
                        <div className='labelInfor size--3 text-capitalize'>
                            <label><Lang>lang_last_updated</Lang>:&nbsp;</label>
                            <span>{this.state.updated ? formatInitTime({ init_time: this.state.updated }, dataStorage.timeZone, false, 'HH:mm:ss, DD/MM/YYYY') : ''}</span>
                        </div>
                    </div>
                </div>
                <div className={`header-wrap flex ${this.collapse ? 'collapse' : ''}`} style={{ padding: 0 }}>
                    <div className='navbar' style={{ marginBottom: '4px' }}>
                        <div className='labelInfor size--3 text-capitalize'>
                            <label><Lang>lang_user</Lang>:&nbsp;</label>
                            <span>{this.state.actor || (dataStorage.userInfo && dataStorage.userInfo.user_login_id) || ''}</span>&nbsp;<span className='bg-primary'>{this.state.group_name && this.state.group_name.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                <div className={`header-wrap flex ${this.collapse ? 'collapse' : ''}`} >
                    <div className='navbar'>
                        <ButtonGroup
                            requireRole={roleEnum.ROLESMANAGEMENT_0}
                            isEditable={this.state.isEditable} callBack={this.handleCallBackActionGroup.bind(this)} />
                        <div className='box-filter'>
                            <FilterBox
                                value={this.state.valueFilter}
                                onChange={(data) => this.setQuickFilter(data)}
                            />
                        </div>
                    </div>
                    <MoreOption agSideButtons={this.createagSideButtons()} />
                </div>
            </NoTag>
        )
    }

    componentDidMount() {
        const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
        registerUser(userId, this.realTimeDataUser, 'user_setting');
        registerAllOrders(this.realtimeData, 'ROLEGROUP');
        registerAllOrders(this.realtimeRole, 'ROLE');
        this.emitRefreshID = this.accountRefresh && this.accountRefresh.addListener(eventEmitter.REFRESH_DATA_ACCOUNT, this.getAllUserGroupManagement.bind(this));
        this.getAllUserGroupManagement()
    }

    componentWillUnmount() {
        try {
            const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
            unregisterUser(userId, this.realTimeDataUser, 'user_setting')
            this.emitRefreshID && this.emitRefreshID.remove();
            unregisterAllOrders(this.realtimeData, 'ROLEGROUP');
            unregisterAllOrders(this.realtimeRole, 'ROLE');
        } catch (error) {
            logger.error('componentWillUnmount On UserMan' + error)
        }
    }

    render() {
        return <div className={`userGroupManagement qe-widget branch-man-wrap root qe-widget isMoreOption`} ref={dom => this.dom = dom}>
            <div className={`errorOrder size--3 ${this.state.haveErrorOrder ? '' : 'yellow'} ${this.state.isShowWarning ? '' : 'myHidden'}`} ><Lang>{this.state.errorOrder}</Lang></div>
            {this.renderHeader()}
            <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
            <div className={`content`}>
                <CanvasGrid
                    {...this.props}
                    id={FORM.USER_GROUP_MANAGEMENT}
                    columns={this.columns}
                    fnKey={data => data.role_id}
                    fn={fn => {
                        this.getData = fn.getData
                        this.setData = fn.setData
                        this.addOrUpdate = fn.addOrUpdate
                        this.setColumn = fn.setColumn
                        this.getColumn = fn.getColumn
                        this.setEditMode = fn.setEditMode
                        this.resetData = fn.resetData
                        this.hasInvalid = fn.hasInvalid
                        this.exportCsv = fn.exportCsv
                        this.resetFilter = fn.resetFilter
                        this.autoSize = fn.autoSize
                        this.resetFilter = fn.resetFilter
                        this.setQuickFilter = fn.setQuickFilter
                        this.showColumnMenu = fn.showColumnMenu
                        this.showFilterMenu = fn.showFilterMenu
                        this.saveData = fn.saveData
                    }}
                    widgetName={'roleMan'}
                    onlySystem={true}
                    autoFit={true}
                />
            </div>
        </div >
    }
}

export default UserGroupManagement
