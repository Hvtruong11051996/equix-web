import React, { Component } from 'react';
import Lang from '../Inc/Lang/Lang';
import Form, { TYPE } from '../Inc/Form/Form';
import { OPTIONS, EDITSTATE, NOTIFYENUM, TIME, APIACCESSENUM, compareObjects } from './constants';
import APIAccess from '../../constants/api_access';
import UserType from '../../constants/user_type_enum';
import Confirm from '../Inc/Confirm/Confirm'
import FooterButton from '../Inc/FooterButton/FooterButton'
import { getData, getUserDetailUrl, putData, postData, getResetPasswordUrl } from '../../helper/request';
import dataStorage from '../../dataStorage';
import { func } from '../../storage';
import { emitter, eventEmitter, emitterRefresh, eventEmitterRefresh } from '../../constants/emitter_enum';
import { UserGroupEnum, optionsStatus } from '../../constants/user_man_enum';
import send from '../../constants/sendStatus';
import { registerAllOrders, unregisterAllOrders } from '../../streaming';
import { clone } from '../../helper/functionUtils';
import logger from '../../helper/log';

const getStructure = (data = {}) => {
    const apiAccess = data.api_access || APIAccess.RETAIL
    return {
        type: 'object',
        properties: {
            User_Information: {
                title: 'lang_user_information',
                type: TYPE.GROUP
            },
            full_name: {
                title: 'lang_full_name',
                type: TYPE.STRING,
                rules: {
                    required: true,
                    between: '3,255'
                }
            },
            user_login_id: {
                title: 'lang_user_login',
                type: TYPE.LABEL,
                rules: {
                    required: true,
                    email: true
                }
            },
            phone: {
                title: 'lang_phone_number',
                type: TYPE.STRING,
                rules: {
                    phone: true
                }
            },
            email_template: {
                title: 'lang_email_template',
                type: TYPE.EMAILTEMP
            },
            access_method: {
                title: 'lang_access_method',
                type: TYPE.DROPDOWN,
                rules: {
                    required: true
                },
                options: [
                    { label: 'lang_internal_only', value: 0 }
                ]
            },
            api_access: {
                title: 'lang_api_access',
                valueClass: 'text-uppercase',
                type: TYPE.DROPDOWN,
                noSetDefault: true,
                options: OPTIONS.API_ACCESS
            },
            user_group: {
                title: 'lang_user_group',
                type: TYPE.DROPDOWN,
                options: UserGroupEnum
            },
            status: {
                title: 'lang_status',
                type: TYPE.DROPDOWN,
                options: optionsStatus
            },
            role_group: {
                title: 'lang_role',
                rules: {
                    required: true
                },
                type: TYPE.ROLEGROUP
            },
            password: {
                title: 'lang_password',
                type: TYPE.PASSWORD,
                rules: {
                    required: true,
                    password: true
                },
                hide: true,
                btnText: 'lang_generate'
            },
            Management: {
                title: 'lang_management',
                type: TYPE.GROUP
            },
            manage: {
                hide: !(apiAccess === APIAccess.OPERATOR),
                type: TYPE.LABEL,
                defaultValue: 'lang_immutable_manage'
            },
            manage_advisor: {
                title: 'lang_manage',
                hide: !(apiAccess === APIAccess.ADVISOR),
                type: TYPE.MANAGE,
                noAdd: true
            },
            list_mapping: {
                title: 'lang_account_id_uppercase',
                hide: !(apiAccess === APIAccess.RETAIL),
                type: TYPE.ACCOUNT
            },
            Notes: {
                title: 'lang_notes',
                type: TYPE.GROUP
            },
            note: {
                title: 'lang_description',
                type: TYPE.TEXTAREA
            }
        }
    }
}

export default class UserDetail extends Component {
    constructor(props) {
        super(props)
        const propsData = props.loadState();
        this.accountRefresh = func.getStore(emitter.STREAMING_ACCOUNT_DATA);
        this.subscription = func.getStore(emitterRefresh.CLICK_TO_REFRESH);
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.userId = propsData.user_id;
        this.disableResetPassword = false;
        this.state = {
            mode: EDITSTATE.VIEW,
            isConnected: dataStorage.connected
        }
        this.curData = {}
        this.putData = {}
        this.api_access = APIAccess.RETAIL
    }

    getUserDetail() {
        if (!this.userId) return;
        this.props.loading(true);
        const url = getUserDetailUrl(`user-details/${this.userId}`);
        getData(url).then(res => {
            let data = (res && res.data && res.data[0]) || (res && res.data) || {}
            const dataObj = this.convertData(data);
            this.setDataStructure(dataObj)
            this.curData = clone(dataObj)
            this.setData(dataObj)
            this.props.loading(false);
        }).catch(error => {
            this.props.loading(false);
            logger.log(`Get user detail from ${this.userId} error: ${error}`)
        })
    }
    convertData(res) {
        let data = res;
        if (data.api_access === null || (typeof data.api_access === 'undefined')) {
            if (data.user_type !== null && (typeof data.user_type !== 'undefined')) {
                switch (data.user_type) {
                    case UserType.RETAIL: data.api_access = APIAccess.RETAIL; break;
                    case UserType.ADVISOR: data.api_access = APIAccess.ADVISOR; break;
                    case UserType.OPERATOR: data.api_access = APIAccess.OPERATOR; break;
                }
            }
        }
        const listManage = [];
        if (data.api_access) {
            if (data.api_access === APIAccess.ADVISOR) {
                if (data.organisation_code) {
                    const listOC = data.organisation_code.split(',')
                    listOC && Array.isArray(listOC) && listOC.length > 0 && listOC.map((e) => {
                        listManage.push({ OC: e });
                    })
                }
                if (data.branch_code) {
                    const listBC = data.branch_code.split(',')
                    listBC && Array.isArray(listBC) && listBC.length > 0 && listBC.map((e) => {
                        const temp = e.split('.')
                        listManage.push({ OC: temp[0], BC: temp[1] })
                    })
                }
                if (data.advisor_code) {
                    const listAC = data.advisor_code.split(',')
                    listAC && Array.isArray(listAC) && listAC.length > 0 && listAC.map((e) => {
                        const temp = e.split('.')
                        listManage.push({ OC: temp[0], BC: temp[1], AC: temp[2] })
                    })
                }
            }
            if (data.list_mapping) {
                const listACC = data.list_mapping;
                listACC && Array.isArray(listACC) && listACC.length > 0 && listACC.map((e) => {
                    listManage.push({ account_id: e.account_id, account_name: e.account_name });
                })
            }
        }
        if (data.organisation_code || data.branch_code || data.advisor_code || data.list_mapping) data.manage_advisor = listManage;
        return data;
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
    refreshData() {
        try {
            this.getUserDetail()
        } catch (error) {
            logger.error('refreshData On User detail' + error)
        }
    }
    changeConnection(isConnected) {
        this.setState({ isConnected })
    }

    realTimeData(dataRealtime) {
        if (dataRealtime && dataRealtime.user_id && (this.state.mode !== EDITSTATE.EDIT) && (dataRealtime.user_id === this.userId)) {
            const data = this.convertData(dataRealtime)
            const lastData = Object.assign(this.curData, data);
            switch (data.api_access) {
                case APIAccess.RETAIL: delete lastData.manage_advisor; break;
                case APIAccess.ADVISOR: break;
                case APIAccess.OPERATOR:
                    delete lastData.manage_advisor;
                    delete lastData.list_mapping;
                    break;
            }
            this.setData(lastData)
            this.onChange();
        }
    }

    setDataStructure(data) {
        this.setSchema(getStructure(data))
    }
    onChange(data) {
        if (!data || !data.user_id) return
        if (data && [1, 2].includes(data.status)) this.disableResetPassword = false
        else this.disableResetPassword = true
        const compare = compareObjects(this.curData, data)
        if (compare === false) {
            this.putData = this.getData(true, true) || {};
            this.setState({ isChange: true })
        } else this.setState({ isChange: false })
        if (this.api_access !== data.api_access) {
            this.setDataStructure(data)
            this.api_access = data.api_access
        }
    }

    resetPass() {
        let info = {
            request: notifyEnum.SEND_RESET_PASSWORD,
            success: notifyEnum.SEND_RESET_PASSWORD_SUCCESS
        }
        let url = getResetPasswordUrl();
        let data = {
            user_login_id: this.curData['user_login_id'],
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
    confirmReset() {
        Confirm({
            header: 'lang_confirm',
            message: <div><span className='firstLetterUpperCase'><Lang>lang_confirm_reset_password</Lang> {this.curData['user_login_id']}?</span></div>,
            checkWindowLoggedOut: true,
            callback: () => {
                this.resetPass()
            }
        })
    }
    editUser() {
        this.setEditMode(true);
        this.setState({
            mode: EDITSTATE.EDIT,
            isChange: false
        })
    }
    saveUser() {
        const userId = this.userId
        const url = getUserDetailUrl(`user-details/${userId}`);
        const dataPut = this.putData
        if (dataPut.manage_advisor) {
            dataPut.list_mapping = dataPut.manage_advisor
            delete dataPut.manage_advisor
        }
        if (dataPut.api_access === this.curData.api_access) delete dataPut.api_access
        if (dataPut.access_method === this.curData.access_method) delete dataPut.access_method
        if (dataPut.status === this.curData.api_access) delete dataPut.status
        if (dataPut.user_group === this.curData.user_group) delete dataPut.user_group
        putData(url, { data: dataPut }).then(() => {
            this.setState({ mode: EDITSTATE.VIEW })
            this.setEditMode(false)
            this.onChangeOriginData()
        }).catch(error => {
            let errorCode = '2000';
            if (error && error.response && error.response.errorCode && Array.isArray(error.response.errorCode) && error.response.errorCode.length) {
                errorCode = error.response.errorCode[0] || '2000'
            } else errorCode = error.response.errorCode || '2000'
            errorCode = errorCode && parseInt(errorCode) ? errorCode : '2000';
            this.sendError(`error_code_${errorCode}`, () => {
                this.setState({ isLoading: send.NONE, notify: null });
            })
        })
    }
    cancelEdit() {
        this.setState({ mode: EDITSTATE.VIEW })
        this.setEditMode(false);
        this.setData(clone(this.curData))
    }
    getAction = ({ mode, isLoading, isChange }) => {
        if (mode === EDITSTATE.EDIT) {
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
        } else {
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
        }
    }

    sendError(error, cb) {
        this.setState({
            isLoading: send.ERROR,
            notify: error
        }, () => {
            setTimeout(() => {
                cb && cb()
            }, TIME.TIME_SHOW_ERROR)
        })
    }
    getNotifyType = isLoading => {
        switch (isLoading) {
            case send.REQUEST: return 'request-background';
            case send.SUCCESS: return 'request-background';
            case send.ERROR: return 'error-background';
            default: return '';
        }
    }
    renderNotify = ({ isLoading, notify }) => {
        if (isLoading === send.NONE) return null;
        return <div className={`errorOrder size--3 ${this.getNotifyType(isLoading)}`} ><Lang>{notify}</Lang></div>
    }

    render() {
        return (
            <div style={{ overflow: 'auto' }}>
                {this.renderNotify(this.state)}
                <div style={{ flex: 1, overflow: 'auto' }}>
                    <Form
                        onChange={this.onChange.bind(this)}
                        fn={fn => {
                            this.setData = fn.setData;
                            this.getData = fn.getData;
                            this.setEditMode = fn.setEditMode
                            this.setSchema = fn.setSchema;
                            this.onChangeOriginData = fn.onChangeOriginData
                        }}
                        stripe={true}
                        schema={getStructure()}
                    />
                </div>
                <FooterButton actions={this.getAction(this.state)} />
            </div >
        )
    }
}
