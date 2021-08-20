import React, { Component } from 'react';
import logger from '../../helper/log';
import Lang from '../Inc/Lang';
import { func } from '../../storage';
import Form from '../Inc/Form';
import Confirm from '../Inc/Confirm'
import FooterButton from '../Inc/FooterButton'
import { getData, getUserDetailUrl, putData, postData, getResetPasswordUrl, getUrlCreateUser } from '../../helper/request';
import dataStorage from '../../dataStorage';
import { clone } from '../../helper/functionUtils'
import { emitter, eventEmitter, emitterRefresh, eventEmitterRefresh } from '../../constants/emitter_enum';
import UserStatus from '../../constants/user_status';
import APIAccess from '../../constants/api_access';
import UserType from '../../constants/user_type_enum';
import { UserGroupEnum, optionsStatus } from '../../constants/user_man_enum';
import send from '../../constants/sendStatus';
import { registerAllOrders, unregisterAllOrders } from '../../streaming';
import uuidv4 from 'uuid/v4';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'

const apiAccessEnum = {
    0: 'retail',
    1: 'advisor',
    2: 'operation'
}

const editState = {
    CREATE: 0,
    VIEW: 1,
    EDIT: 2
}

const spinImg = 'common/Spinner-white.svg';

const getStructure = (state, id) => {
    return {
        type: 'object',
        properties: {
            User_Information: {
                // label: true,
                title: 'lang_user_information',
                type: 'group',
                classNames: 'User_Information'
            },
            full_name: {
                title: 'lang_full_name',
                rules: {
                    required: true,
                    between: '3,255'
                },
                type: 'string',
                classNames: 'full_name'
            },
            user_login_id: {
                title: 'lang_user_login',
                rules: {
                    required: true,
                    email: true
                },
                lowerCase: false,
                type: 'label',
                classNames: 'user_login_id'
            },
            phone: {
                title: 'lang_phone_number',
                type: 'string',
                rules: {
                    phone: true
                },
                classNames: 'phone'
            },
            email_template: {
                type: 'emailTemp',
                title: 'lang_email_template',
                classNames: 'email_template'
            },
            access_method: {
                title: 'lang_access_method',
                type: 'dropdown',
                rules: {
                    required: true
                },
                classNames: 'access_method',
                options: [
                    { label: 'lang_internal_only', value: 0, className: 'text-uppercase' }
                ],
                forceUpdate: true
            },
            api_access: {
                type: 'dropdown',
                title: 'lang_api_access',
                titleClass: 'text-normal',
                classNames: 'api_access',
                options: [
                    { label: 'lang_retail', value: 0, className: 'text-uppercase' },
                    { label: 'lang_advisor', value: 1, className: 'text-uppercase' },
                    { label: 'lang_operator', value: 2, className: 'text-uppercase' }
                ],
                forceUpdate: true
            },
            user_group: {
                title: 'lang_user_group',
                classNames: 'user_group',
                type: 'dropdown',
                options: UserGroupEnum
            },
            status: {
                title: 'lang_status',
                type: 'dropdown',
                options: optionsStatus,
                forceUpdate: true
            },
            role_group: {
                rules: {
                    required: true
                },
                title: 'lang_role',
                classNames: 'role_group',
                type: 'roleGroup'
            },
            password: {
                title: 'lang_password',
                rules: {
                    required: true,
                    password: true
                },
                hide: false,
                classNames: 'password-field-container password',
                btnText: 'lang_generate',
                type: 'password',
                row: 'triple'
            },
            Management: {
                // label: true,
                classNames: 'Management',
                title: 'lang_management',
                type: 'group',
                fullWidth: true
            },
            manage: {
                hide: true,
                classNames: 'label-single-line manage',
                type: 'label',
                defaultValue: 'lang_immutable_manage',
                row: 'doulble'
            },
            manage_advisor: {
                title: 'lang_manage',
                hide: true,
                classNames: 'manage_advisor',
                id: id || '',
                type: 'manage'
            },
            list_mapping: {
                title: 'lang_account_id_uppercase',
                classNames: 'Create_User_List_Account',
                hide: false,
                id: id || '',
                type: 'account'
            },
            Notes: {
                title: 'lang_notes',
                type: 'group',
                classNames: 'Notes',
                fullWidth: true
            },
            note: {
                classNames: 'note',
                title: 'lang_description',
                type: 'textarea'
            }
        }
    }
}

const time = {
    TIME_SHOW_ERROR: 2000,
    TIME_SHOW_INFO: 2000,
    TIME_OUT_REQUEST: 500
}

const notifyEnum = {
    CREATE_USER_REQUEST: 'lang_creating_user',
    CREATE_USER_SUCCESS: 'lang_creating_user_success',
    UPDATE_USER_REQUEST: 'lang_updating_user_information',
    UPDATE_USER_SUCCESS: 'lang_update_userinfo_success',
    SEND_RESET_PASSWORD: 'lang_sending_reset_pass',
    SEND_RESET_PASSWORD_SUCCESS: 'lang_sending_reset_pass_success'
}

export class UserDetail extends Component {
    constructor(props) {
        super(props);
        const propsData = props.loadState();
        this.userId = propsData.user_id;
        this.accountRefresh = func.getStore(emitter.STREAMING_ACCOUNT_DATA);
        this.subscription = func.getStore(emitterRefresh.CLICK_TO_REFRESH);
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.list_mapping = [];
        this.manage_advisor = [];
        this.curData = {};
        this.originData = {};
        this.id = uuidv4();
        this.diffObj = {};
        this.disableResetPassword = false;
        this.isRedirect = true
        this.state = {
            isCreate: editState.VIEW,
            notify: '',
            isChange: false,
            isConnected: dataStorage.connected,
            isLoading: send.NONE
        }
        this.realTimeData = this.realTimeData.bind(this)
        props.confirmClose(() => this.state.isCreate === editState.EDIT)
    }

    convertData(res) {
        const data = clone(res);
        if (data.api_access === null || (typeof data.api_access === 'undefined')) {
            if (data.user_type !== null && (typeof data.user_type !== 'undefined')) {
                switch (data.user_type) {
                    case UserType.RETAIL: data.api_access = APIAccess.RETAIL; break;
                    case UserType.ADVISOR: data.api_access = APIAccess.ADVISOR; break;
                    case UserType.OPERATOR: data.api_access = APIAccess.OPERATOR; break;
                }
            }
        }
        const manageAdvisor = [];
        if (data.api_access === APIAccess.RETAIL) {
            if (data.list_mapping) {
                const listACC = data.list_mapping;
                listACC && Array.isArray(listACC) && listACC.length > 0 && listACC.map((e, i) => {
                    if (e) {
                        manageAdvisor.push({ account_id: e.account_id, account_name: e.account_name });
                    }
                })
                data.manage_advisor = manageAdvisor;
                this.manage_advisor = manageAdvisor;
            }
        }
        if (data.api_access === APIAccess.ADVISOR) {
            if (data.organisation_code) {
                const listOC = data.organisation_code.split(',')
                listOC && Array.isArray(listOC) && listOC.length > 0 && listOC.map((e, i) => {
                    if (e) manageAdvisor.push({ OC: e });
                })
            }
            if (data.branch_code) {
                const listBC = data.branch_code.split(',')
                listBC && Array.isArray(listBC) && listBC.length > 0 && listBC.map((e, i) => {
                    if (e) {
                        const temp = e.split('.');
                        manageAdvisor.push({ OC: temp[0], BC: temp[1] });
                    }
                })
            }
            if (data.advisor_code) {
                const listAC = data.advisor_code.split(',')
                listAC && Array.isArray(listAC) && listAC.length > 0 && listAC.map((e, i) => {
                    if (e) {
                        const temp = e.split('.');
                        manageAdvisor.push({ OC: temp[0], BC: temp[1], AC: temp[2] });
                    }
                })
            }
            if (data.list_mapping) {
                const listACC = data.list_mapping;
                listACC && Array.isArray(listACC) && listACC.length > 0 && listACC.map((e, i) => {
                    if (e) {
                        manageAdvisor.push({ account_id: e.account_id, account_name: e.account_name });
                    }
                })
            }
            if (data.organisation_code || data.branch_code || data.advisor_code || data.list_mapping) {
                data.manage_advisor = manageAdvisor;
                this.manage_advisor = manageAdvisor;
            }
        }
        this.list_mapping = data.list_mapping || [];
        return data;
    }

    getUserDetail() {
        if (!this.userId) return;
        this.props.loading(true);
        const url = getUserDetailUrl(`user-details/${this.userId}`);
        getData(url).then(res => {
            let data = (res && res.data && res.data[0]) || (res && res.data) || {}
            console.log('res status====', data.status)
            const dataObj = this.convertData(data);
            this.props.loading(false);
            this.onChange(dataObj);
            this.curData = clone(dataObj);
            this.originData = clone(dataObj);
        }).catch(error => {
            this.props.loading(false);
            logger.log(`Get user detail from ${this.userId} error: ${error}`)
        })
    }

    componentDidMount() {
        this.emitID = this.subscription && this.subscription.addListener(eventEmitterRefresh.CLICK_TO_REFRESH_STATE, this.refreshData.bind(this));
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
        this.emitRefreshID = this.accountRefresh && this.accountRefresh.addListener(eventEmitter.REFRESH_DATA_ACCOUNT, this.refreshData.bind(this));
        this.props.setTitle({ text: 'lang_user_detail' });
        this.getUserDetail()
        registerAllOrders(this.realTimeData, 'user_detail');
    }

    componentWillUnmount() {
        this.emitID && this.emitID.remove();
        this.emitConnectionID && this.emitConnectionID.remove();
        this.emitRefreshID && this.emitRefreshID.remove();
        unregisterAllOrders(this.realtimeData, 'user_detail');
    }

    realTimeData(dataRealtime) {
        if (dataRealtime && dataRealtime.user_id && (this.state.isCreate !== editState.EDIT) && (dataRealtime.user_id === this.userId)) {
            const data = this.convertData(dataRealtime)
            const lastData = Object.assign(this.curData, data);
            switch (data.api_access) {
                case APIAccess.RETAIL:
                    delete this.originData.manage_advisor;
                    delete lastData.manage_advisor;
                    break;
                case APIAccess.ADVISOR:
                    break;
                case APIAccess.OPERATOR:
                    delete this.originData.manage_advisor;
                    delete lastData.manage_advisor;
                    delete this.originData.list_mapping;
                    delete lastData.list_mapping;
                    break;
            }
            this.originData = Object.assign(this.originData, data);
            this.setData(lastData)
            this.onChange();
        }
    }

    checkChangeArray(data) {
        const obj = {};
        if (data.api_access === APIAccess.OPERATOR) return obj;
        if (data.api_access === APIAccess.RETAIL) {
            let listNewAccounts = [];
            data && data.list_mapping && Array.isArray(data.list_mapping) && data.list_mapping.length > 0 && data.list_mapping.map(e => {
                if (e.account_id) listNewAccounts.push(e.account_id);
            });
            let listCurAccounts = [];
            this.originData && this.originData.list_mapping && Array.isArray(this.originData.list_mapping) && this.originData.list_mapping.length > 0 && this.originData.list_mapping.map(e => {
                if (e.account_id) listCurAccounts.push(e.account_id);
            });
            const totalListAccounts = [...new Set([...listNewAccounts, ...listCurAccounts])]
            if (listCurAccounts.length !== listNewAccounts.length || totalListAccounts.length !== listCurAccounts.length) {
                // obj.list_mapping = listNewAccounts.join(',');
                obj.list_mapping = data.list_mapping;
            }
            this.list_mapping = data.list_mapping;
        }
        if (data.api_access === APIAccess.ADVISOR) {
            let listNewOrganisation = [];
            let listNewBranch = [];
            let listNewAdvisor = [];
            let listNewAccount = [];
            let listMappingAdvisor = [];
            data && data.manage_advisor && Array.isArray(data.manage_advisor) && data.manage_advisor.length > 0 && data.manage_advisor.map(e => {
                if (e.account_id) {
                    listNewAccount.push(e.account_id);
                    listMappingAdvisor.push({
                        account_id: e.account_id,
                        account_name: e.account_name,
                        AC: e.AC,
                        BC: e.BC,
                        OC: e.OC
                    })
                } else if (e.AC) {
                    listNewAdvisor.push(e.AC)
                } else if (e.BC) {
                    listNewBranch.push(e.BC);
                } else if (e.OC) {
                    listNewOrganisation.push(e.OC);
                }
            });
            let listCurOrganisation = [];
            let listCurBranch = [];
            let listCurAdvisor = [];
            let listCurAccount = [];
            this.originData && this.originData.manage_advisor && Array.isArray(this.originData.manage_advisor) && this.originData.manage_advisor.length > 0 && this.originData.manage_advisor.map(e => {
                if (e.account_id) {
                    listCurAccount.push(e.account_id);
                } else if (e.AC) {
                    listCurAdvisor.push(e.AC)
                } else if (e.BC) {
                    listCurBranch.push(e.BC);
                } else if (e.OC) {
                    listCurOrganisation.push(e.OC);
                }
            });
            const totallistOC = [...new Set([...listNewOrganisation, ...listCurOrganisation])]
            const totalListBC = [...new Set([...listNewBranch, ...listCurBranch])]
            const totalListAC = [...new Set([...listNewAdvisor, ...listCurAdvisor])]
            const totalListAccount = [...new Set([...listNewAccount, ...listCurAccount])]
            if (listCurOrganisation.length !== listNewOrganisation.length || totallistOC.length !== listCurOrganisation.length) {
                obj.organisation_code = listNewOrganisation.join(',');
            }
            if (listCurBranch.length !== listNewBranch.length || totalListBC.length !== listCurBranch.length) {
                obj.branch_code = listNewBranch.join(',');
            }
            if (listCurAdvisor.length !== listNewAdvisor.length || totalListAC.length !== listCurAdvisor.length) {
                obj.advisor_code = listNewAdvisor.join(',');
            }
            if (listCurAccount.length !== listNewAccount.length || totalListAccount.length !== listCurAccount.length) {
                // obj.list_mapping = listNewAccount.join(',');
                obj.list_mapping = listMappingAdvisor;
            }
            this.manage_advisor = data.manage_advisor;
        }
        return obj;
    }

    onChange(dataObj) {
        const data = dataObj || this.getDefaultData();
        if (!data || !data.user_id) {
            return;
        }
        if (data && [0, 3, 4, 5].indexOf(data.status) > -1) {
            this.disableResetPassword = true
        } else {
            this.disableResetPassword = false
        }
        if (data && this.state.isCreate === editState.EDIT) {
            const obj = this.checkChangeArray(data);
            const dataDiff = this.getData(true, true) || {};
            delete dataDiff.manage_advisor;
            delete dataDiff.list_mapping;
            const diff = Object.assign(dataDiff, obj);
            Object.assign(this.diffObj, dataDiff, obj);
            this.setState({
                isChange: !!(Object.keys(diff).length)
            })
        }
        const schema = this.getSchema();
        if (data && data.status === this.curData.status && data.api_access === this.curData.api_access) {
            this.curData = clone(data);
            if (dataStorage.force_update_create_user) {
                dataStorage.force_update_create_user = false;
                schema.properties.password.hide = true;
                this.setSchema(schema)
            }
            return;
        }
        this.curData = clone(data);
        schema.properties.password.hide = true;
        if (!data || (data && data.api_access === APIAccess.RETAIL)) {
            data.list_mapping = [];
            data && data.manage_advisor && Array.isArray(data.manage_advisor) && data.manage_advisor.length > 0 && data.manage_advisor.map(e => {
                if (e.account_id) {
                    data.list_mapping.push({
                        account_id: e.account_id,
                        account_name: e.account_name,
                        AC: e.AC,
                        BC: e.BC,
                        OC: e.OC
                    })
                }
            })
            if (schema && schema.properties && schema.properties.manage && !schema.properties.manage.hide) {
                schema.properties.manage.hide = true;
            }
            if (schema && schema.properties && schema.properties.manage_advisor && !schema.properties.manage_advisor.hide) {
                schema.properties.manage_advisor.hide = true;
            }
            if (schema && schema.properties && schema.properties.list_mapping && schema.properties.list_mapping.hide) {
                schema.properties.list_mapping.hide = false;
            }
        } else {
            if (schema && schema.properties && schema.properties.list_mapping && !schema.properties.list_mapping.hide) {
                schema.properties.list_mapping.hide = true;
            }
            if (data.api_access === APIAccess.ADVISOR) {
                data.manage_advisor = data.manage_advisor || data.list_mapping;
                if (schema && schema.properties && schema.properties.manage && !schema.properties.manage.hide) {
                    schema.properties.manage.hide = true;
                }
                if (schema && schema.properties && schema.properties.manage_advisor && schema.properties.manage_advisor.hide) {
                    schema.properties.manage_advisor.hide = false;
                }
            } else {
                if (schema && schema.properties && schema.properties.manage && schema.properties.manage.hide) {
                    schema.properties.manage.hide = false;
                }
                if (schema && schema.properties && schema.properties.manage_advisor && !schema.properties.manage_advisor.hide) {
                    schema.properties.manage_advisor.hide = true;
                }
            }
        }
        this.setSchema(schema)
        this.setData(data, true)
    }

    resetNoti() {
        this.setEditMode(false);
        this.setState({ isLoading: send.NONE, notify: null, isChange: false });
    }

    checkValidate(data) {
        if (data.full_name === '') {
            return 'lang_full_name_required'
        }
        if (data.user_login_id === '') {
            return 'lang_user_login_required'
        }
        if (data.status === UserStatus.ACTIVE && data.password === '') {
            return 'lang_password_required'
        }
        return '';
    }

    refreshData() {
        try {
            this.getUserDetail()
        } catch (error) {
            logger.error('refreshData On User detail' + error)
        }
    }

    changeConnection(isConnected) {
        this.setState({
            isConnected
        })
    }

    saveUser() {
        if (this.diffObj.full_name !== undefined) {
            const fullName = (this.diffObj && this.diffObj.full_name) || ''
            if (fullName.length < 3 || fullName.length > 255) return
        }

        if (this.state.isCreate === editState.EDIT) {
            this.setEditMode(false);
        }
        this.sendRequest(notifyEnum.UPDATE_USER_REQUEST, () => {
            const dataObj = this.diffObj;
            const error = this.checkValidate(dataObj)
            if (error) {
                this.sendError(error, () => {
                    this.setState({ isLoading: send.NONE, notify: null });
                })
            } else {
                const userId = this.userId
                const url = getUserDetailUrl(`user-details/${userId}`);
                // dataObj.user_id = userId
                if (dataObj.user_login_id) {
                    dataObj.email = dataObj.user_login_id;
                }
                if (dataObj.api_access !== null && typeof dataObj.api_access !== 'undefined') {
                    dataObj.user_type = apiAccessEnum[dataObj.api_access]
                    delete dataObj.api_access
                }
                delete dataObj.password
                delete dataObj.user_login_id
                putData(url, { data: dataObj }).then(() => {
                    this.diffObj = {};
                    this.sendSuccess(notifyEnum.UPDATE_USER_SUCCESS, () => {
                        this.originData = clone(this.curData);
                        this.resetNoti()
                    })
                    this.onChangeOriginData()
                }).catch(error => {
                    if (this.state.isCreate === editState.EDIT) {
                        this.setEditMode(true);
                    }
                    let errorCode = '2000';
                    if (error && error.response && error.response.errorCode && Array.isArray(error.response.errorCode) && error.response.errorCode.length) {
                        errorCode = error.response.errorCode[0] || '2000'
                    } else {
                        errorCode = error.response.errorCode || '2000'
                    }
                    errorCode = errorCode && parseInt(errorCode) ? errorCode : '2000';
                    this.sendError(`error_code_${errorCode}`, () => {
                        this.setState({ isLoading: send.NONE, notify: null });
                    })
                })
            }
        })
    }

    sendRequest(info, cb) {
        this.props.loading(true);
        this.setState({
            isLoading: send.REQUEST,
            notify: info
        }, () => {
            setTimeout(() => {
                this.props.loading(false);
                cb && cb();
            }, time.TIME_SHOW_INFO)
        })
    }

    sendSuccess(info, cb) {
        this.setState({
            isLoading: send.SUCCESS,
            isCreate: editState.VIEW,
            notify: info
        }, () => {
            setTimeout(() => {
                cb && cb()
            }, time.TIME_SHOW_INFO)
        });
        this.props.setTitle && this.props.setTitle({ text: 'lang_user_detail' });
    }

    sendError(error, cb) {
        this.setState({
            isLoading: send.ERROR,
            notify: error
        }, () => {
            setTimeout(() => {
                cb && cb()
            }, time.TIME_SHOW_ERROR)
        })
    }

    resetPass() {
        let data = {};
        let info = {
            request: notifyEnum.SEND_RESET_PASSWORD,
            success: notifyEnum.SEND_RESET_PASSWORD_SUCCESS
        }
        let url = getResetPasswordUrl();
        const loginId = this.curData['user_login_id'];
        data = {
            user_login_id: loginId,
            type: 'forgot_password'
        }
        this.sendRequest(info.request || '', () => {
            postData(url, { data }).then(res => {
                this.sendSuccess(info.success || '', () => {
                    this.resetNoti()
                })
            }).catch(error => {
                const errorCode = (error && error.response && error.response.data && error.response.data.errorCode) || '2000'
                this.sendError(`error_code_${errorCode}`, () => {
                    this.resetNoti()
                })
            })
        })
    }

    confirmReset(type) {
        const askConfirm = <div><span className='firstLetterUpperCase'><Lang>lang_confirm_reset_password</Lang> {this.curData['user_login_id']}?</span></div>
        Confirm({
            header: 'lang_confirm',
            message: askConfirm,
            checkWindowLoggedOut: true,
            callback: () => {
                this.resetPass()
            },
            cancelCallback: () => { }
        })
    }

    editUser() {
        this.setEditMode(true);
        this.setState({
            isCreate: editState.EDIT
        })
    }

    cancelEdit() {
        if (this.state.isChange) {
            this.diffObj = {};
            this.setEditMode(false);
            this.onChange();
            this.setState({
                isChange: false,
                isCreate: editState.VIEW
            })
        } else {
            this.setState({
                isCreate: editState.VIEW
            })
            this.setEditMode(false);
        }
        this.setData(clone(this.originData));
    }

    getAction = ({ isCreate, isLoading, isChange }) => {
        switch (isCreate) {
            case editState.EDIT:
                return [
                    {
                        className: 'bg-blue bg-blue-hover disableBtn',
                        onClick: this.confirmReset.bind(this),
                        text: 'lang_reset_password',
                        srcIcon: 'common/lock-reset.svg'
                    },
                    {
                        className: `bg-blue bg-blue-hover ${!isChange || isLoading ? 'disableBtn' : ''}`,
                        onClick: this.saveUser.bind(this),
                        srcIcon: isLoading === send.REQUEST ? spinImg : 'common/save.svg',
                        text: 'lang_save_changes'
                    },
                    {
                        className: `bg-blue bg-blue-hover ${isLoading ? 'disableBtn' : ''}`,
                        onClick: this.cancelEdit.bind(this),
                        text: 'lang_cancel',
                        srcIcon: 'common/cancel.svg'
                    }
                ]
            case editState.VIEW:
                return [
                    {
                        className: `bg-blue bg-blue-hover ${(isLoading || this.disableResetPassword) ? 'disableBtn' : ''}`,
                        onClick: this.confirmReset.bind(this),
                        srcIcon: 'common/lock-reset.svg',
                        text: 'lang_reset_password'
                    },
                    {
                        className: `bg-blue bg-blue-hover ${isLoading ? 'disableBtn' : ''}`,
                        onClick: this.editUser.bind(this),
                        srcIcon: 'common/edit.svg',
                        text: 'lang_edit'
                    }
                ]
            default:
                return []
        }
    }

    getNotifyType = isLoading => {
        switch (isLoading) {
            case send.REQUEST:
                return 'request-background';
            case send.SUCCESS:
                return 'request-background';
            case send.ERROR:
                return 'error-background';
            default:
                return '';
        }
    }

    renderNotify = ({ isLoading, notify }) => {
        if (isLoading === send.NONE) return null;
        return (<div className={`errorOrder size--3 ${this.getNotifyType(isLoading)}`} >
            <Lang>{notify}</Lang>
        </div>)
    }

    render() {
        const { isCreate } = this.state
        return (
            <div className='createUserDetail' style={{ overflow: 'auto' }}>
                {this.renderNotify(this.state)}
                <div style={{ flex: 1, overflow: 'auto' }}>
                    <Form
                        onChange={this.onChange.bind(this)}
                        fn={fn => {
                            this.setData = fn.setData;
                            this.getData = fn.getData;
                            this.resetData = fn.resetData;
                            this.clearData = fn.clearData;
                            this.setEditMode = fn.setEditMode
                            this.setSchema = fn.setSchema;
                            this.getSchema = fn.getSchema;
                            this.getDefaultData = fn.getDefaultData
                            this.onChangeOriginData = fn.onChangeOriginData
                        }}
                        noSetDefault={true}
                        stripe={true}
                        schema={getStructure(isCreate, this.id)}
                    />
                </div>
                <FooterButton
                    actions={this.getAction(this.state)}
                />
            </div >
        );
    }
}

export default UserDetail;
