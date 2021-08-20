import React, { Component } from 'react';
import logger from '../../helper/log';
import Lang from '../Inc/Lang';
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon'
import { func } from '../../storage';
import Form, { TYPE } from '../Inc/Form';
import { OPTIONS, TIME, NOTIFYENUM, EDITSTATE, SEND, USERTYPE, APIACCESS, USERSTATUS, APIACCESSENUM } from './constants';
import { UserGroupEnum, optionsStatus } from '../../constants/user_man_enum';
import { getData, putData, postData, getUrlCreateUser } from '../../helper/request';
import dataStorage from '../../dataStorage';
import { clone, checkRole } from '../../helper/functionUtils'
import MapRoleComponent from '../../constants/map_role_component'
import { emitter, eventEmitter, emitterRefresh, eventEmitterRefresh } from '../../constants/emitter_enum';
import { registerAllOrders, unregisterAllOrders } from '../../streaming';
import uuidv4 from 'uuid/v4';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'
import s from './CreateUser.module.css'
import userTypeEnum from '../../constants/user_type_enum';
import Button, { buttonType } from '../Elements/Button/Button';

const initialData = {
    full_name: '',
    user_login_id: '',
    phone: 'au|',
    password: '',
    change_password: true,
    role_group: 'RG0',
    user_group: 3,
    email_template: 'E1',
    note: '',
    access_method: null,
    status: 2,
    api_access: 0,
    list_mapping: []
}

const getStructure = (disable) => {
    let apiAccessOption = dataStorage.userInfo.user_type === userTypeEnum.OPERATOR ? OPTIONS.API_ACCESS : OPTIONS.API_ACCESS.filter(x => x.value !== 2)
    return {
        noPaddingtop: true,
        type: TYPE.OBJECT,
        properties: {
            User_Information: {
                title: 'lang_user_detail',
                type: TYPE.GROUP
            },
            full_name: {
                type: TYPE.STRING,
                title: 'lang_full_name',
                rules: {
                    required: true,
                    between: '3,255'
                },
                disable: disable
            },
            user_login_id: {
                title: 'lang_user_login',
                type: TYPE.STRING,
                rules: {
                    required: true,
                    email: true
                },
                help: 'lang_user_login_help',
                disable: disable
            },
            phone: {
                title: 'lang_phone_number',
                type: TYPE.CALLING_CODE,
                rules: {
                    calling_code: true,
                    calling_code_btw: '3,16'
                },
                disable: disable
            },
            password: {
                title: 'lang_password',
                rules: {
                    required: true,
                    password: true,
                    min: 8,
                    max: 25
                },
                btnText: 'lang_generate',
                type: TYPE.PASSWORD,
                noBox: true,
                condition: { status: USERSTATUS.ACTIVE },
                disable: disable
            },
            send_password: {
                title: ' ',
                type: TYPE.BOOLEAN,
                textRight: true,
                subTitle: 'lang_send_password_to_email',
                condition: { status: USERSTATUS.ACTIVE },
                disable: disable
            },
            change_password: {
                title: ' ',
                type: TYPE.BOOLEAN,
                disable: true,
                defaultValue: true,
                active: true,
                subTitle: 'lang_require_password_change_on_next_sign_in',
                condition: { status: USERSTATUS.ACTIVE }
            },
            role_group: {
                title: 'lang_role_group',
                rules: {
                    required: true
                },
                type: TYPE.ROLEGROUP,
                // pleaseSelect: true,
                disable: disable
            },
            email_template: {
                title: 'lang_email_template',
                type: TYPE.EMAILTEMP,
                disable: disable
            },
            status: {
                title: 'lang_status',
                type: TYPE.DROPDOWN,
                align: 'right',
                options: optionsStatus,
                forceUpdate: true,
                noEditBox: disable
            },
            note: {
                title: 'lang_note',
                type: TYPE.TEXTAREA,
                disable: disable
            },
            access_permission: {
                title: 'lang_access_permission',
                type: TYPE.GROUP
            },
            access_method: {
                title: 'lang_access_method',
                type: TYPE.DROPDOWN,
                align: 'right',
                options: OPTIONS.ACCESS_METHOD,
                noEditBox: disable
            },
            api_access: {
                title: 'lang_api_access',
                titleClass: 'text-normal',
                type: TYPE.DROPDOWN,
                align: 'right',
                options: apiAccessOption,
                rules: {
                    required: true
                },
                noEditBox: disable
            },
            user_group: {
                title: 'lang_user_group',
                type: TYPE.DROPDOWN,
                align: 'right',
                options: OPTIONS.USER_GROUP,
                rules: {
                    required: true
                },
                noEditBox: disable
            },
            organization: {
                title: 'lang_organization_management',
                type: TYPE.GROUP,
                condition: { api_access: APIACCESS.ADVISOR }
            },
            organization_management: {
                title: 'lang_search_organization',
                type: TYPE.NEWMANAGE,
                field: 'organisation_code',
                search: 'org',
                condition: { api_access: APIACCESS.ADVISOR },
                help: 'lang_organization_help',
                disable: disable
            },
            branch: {
                title: 'lang_branch_management',
                type: TYPE.GROUP,
                condition: { api_access: APIACCESS.ADVISOR }
            },
            branch_management: {
                title: 'lang_search_branch',
                type: TYPE.NEWMANAGE,
                field: 'branch_code',
                search: 'branch',
                condition: { api_access: APIACCESS.ADVISOR },
                help: 'lang_branch_help',
                disable: disable
            },
            advisor: {
                title: 'lang_advisor_management',
                type: TYPE.GROUP,
                condition: { api_access: APIACCESS.ADVISOR }
            },
            manage_advisor: {
                title: 'lang_search_advisor',
                type: TYPE.NEWMANAGE,
                field: 'advisor_code',
                search: 'adv',
                condition: { api_access: APIACCESS.ADVISOR },
                help: 'lang_manage_help',
                disable: disable
            },
            add_account: {
                title: 'lang_account_management',
                type: TYPE.GROUP,
                condition: { api_access: [APIACCESS.ADVISOR, APIACCESS.RETAIL] }
            },
            list_mapping: {
                title: 'lang_search_account',
                type: TYPE.ACCOUNT,
                createUser: true,
                help: 'lang_list_mapping_help',
                condition: { api_access: [APIACCESS.ADVISOR, APIACCESS.RETAIL] },
                disable: disable
            }
        }
    }
}

export default class CreateUser extends Component {
    constructor(props) {
        super(props);
        this.accountRefresh = func.getStore(emitter.STREAMING_ACCOUNT_DATA);
        this.subscription = func.getStore(emitterRefresh.CLICK_TO_REFRESH);
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.list_mapping = [];
        this.manage_advisor = [];
        this.curData = {};
        this.originData = {};
        this.id = uuidv4();
        this.state = {
            isCreate: this.userId ? EDITSTATE.VIEW : EDITSTATE.CREATE,
            notify: '',
            isChange: !this.userId,
            isConnected: dataStorage.connected,
            isLoading: SEND.NONE
        }
        this.realTimeData = this.realTimeData.bind(this)
        initialData.role_group = dataStorage.userInfo.user_type === userTypeEnum.ADVISOR ? dataStorage.userInfo.role_group : 'RG0'
    }

    convertData(res) {
        const data = clone(res);
        if (data.api_access === null || (typeof data.api_access === 'undefined')) {
            if (data.user_type !== null && (typeof data.user_type !== 'undefined')) {
                switch (data.user_type) {
                    case USERTYPE.RETAIL: data.api_access = APIACCESS.RETAIL; break;
                    case USERTYPE.ADVISOR: data.api_access = APIACCESS.ADVISOR; break;
                    case USERTYPE.OPERATOR: data.api_access = APIACCESS.OPERATOR; break;
                }
            }
        }
        const manageAdvisor = [];
        if (data.api_access === APIACCESS.RETAIL) {
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
        if (data.api_access === APIACCESS.ADVISOR) {
            if (data.organisation_code) {
                const listOC = data.organisation_code.split(',')
                listOC && Array.isArray(listOC) && listOC.length > 0 && listOC.map((e, i) => {
                    if (e) manageAdvisor.push({ organisation_code: e });
                })
            }
            if (data.branch_code) {
                const listBC = data.branch_code.split(',')
                listBC && Array.isArray(listBC) && listBC.length > 0 && listBC.map((e, i) => {
                    if (e) {
                        const temp = e.split('.');
                        manageAdvisor.push({ organisation_code: temp[0], branch_code: temp[1] });
                    }
                })
            }
            if (data.advisor_code) {
                const listAC = data.advisor_code.split(',')
                listAC && Array.isArray(listAC) && listAC.length > 0 && listAC.map((e, i) => {
                    if (e) {
                        const temp = e.split('.');
                        manageAdvisor.push({ organisation_code: temp[0], branch_code: temp[1], advisor_code: temp[2] });
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

    componentDidMount() {
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
        this.setEditMode && this.setEditMode(true);
        const schema = this.getSchema();
        if (dataStorage.userInfo && dataStorage.userInfo.user_group === 2) {
            schema.properties.user_group.options = [{
                label: 'Advisor',
                value: 1
            },
            {
                label: 'Others',
                value: 0
            }]
            initialData.user_group = 0
            if (dataStorage.userInfo && dataStorage.userInfo.user_type === userTypeEnum.ADVISOR) {
                schema.properties.api_access.options = [{
                    label: 'Advisor',
                    value: 1
                },
                {
                    label: 'Retail',
                    value: 0
                }]
            }
        }
        this.setData(clone(initialData));
        this.onChange();
        this.curData = clone(initialData);
        registerAllOrders(this.realTimeData, 'user_detail');
        this.setSchema(schema)
    }

    componentWillUnmount() {
        this.emitID && this.emitID.remove();
        this.emitConnectionID && this.emitConnectionID.remove();
        this.emitRefreshID && this.emitRefreshID.remove();
        unregisterAllOrders(this.realtimeData, 'user_detail');
    }

    realTimeData(dataRealtime) {
        if (dataRealtime && dataRealtime.user_id && (this.state.isCreate !== EDITSTATE.EDIT) && (dataRealtime.user_id === this.userId)) {
            const data = this.convertData(dataRealtime)
            const lastData = Object.assign(this.curData, data);
            switch (data.api_access) {
                case APIACCESS.RETAIL:
                    delete this.originData.manage_advisor;
                    delete lastData.manage_advisor;
                    break;
                case APIACCESS.ADVISOR:
                    break;
                case APIACCESS.OPERATOR:
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
        if (data.api_access === APIACCESS.OPERATOR) return obj;
        if (data.api_access === APIACCESS.RETAIL) {
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
        if (data.api_access === APIACCESS.ADVISOR) {
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
                        advisor_code: e.advisor_code,
                        branch_code: e.branch_code,
                        organisation_code: e.organisation_code
                    })
                } else if (e.advisor_code) {
                    listNewAdvisor.push(e.advisor_code)
                } else if (e.branch_code) {
                    listNewBranch.push(e.branch_code);
                } else if (e.organisation_code) {
                    listNewOrganisation.push(e.organisation_code);
                }
            });
            let listCurOrganisation = [];
            let listCurBranch = [];
            let listCurAdvisor = [];
            let listCurAccount = [];
            this.originData && this.originData.manage_advisor && Array.isArray(this.originData.manage_advisor) && this.originData.manage_advisor.length > 0 && this.originData.manage_advisor.map(e => {
                if (e.account_id) {
                    listCurAccount.push(e.account_id);
                } else if (e.advisor_code) {
                    listCurAdvisor.push(e.advisor_code)
                } else if (e.branch_code) {
                    listCurBranch.push(e.branch_code);
                } else if (e.organisation_code) {
                    listCurOrganisation.push(e.organisation_code);
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
        if (!data || (this.state.isCreate !== EDITSTATE.CREATE && !data.user_id)) return;
        const schema = this.getSchema();
        if (data && data.status === this.curData.status && data.api_access === this.curData.api_access) {
            this.curData = clone(data);
            if (dataStorage.force_update_create_user) {
                dataStorage.force_update_create_user = false;
                this.setData(data);
            }
            return;
        }
        this.curData = clone(data);
        if (!data || (data && data.api_access === APIACCESS.RETAIL && (!data.list_mapping || data.list_mapping.length === 0))) {
            data.list_mapping = [];
            data && data.manage_advisor && Array.isArray(data.manage_advisor) && data.manage_advisor.length > 0 && data.manage_advisor.map(e => {
                if (e.account_id) {
                    data.list_mapping.push({
                        account_id: e.account_id,
                        account_name: e.account_name,
                        advisor_code: e.advisor_code,
                        branch_code: e.branch_code,
                        organisation_code: e.organisation_code
                    })
                }
            })
        }
        if (data.api_access === APIACCESS.ADVISOR) {
            data.manage_advisor = data.manage_advisor
        }
        if (data && data.api_access === APIACCESS.OPERATOR) {
            schema.properties.api_access.note = 'Operator have all access to everything by default'
        } else {
            schema.properties.api_access.note = null
        }
        this.setSchema(schema)
        this.setData(data, true)
        if (data.api_access !== this.apiAccess || !dataObj) {
            this.apiAccess = data.api_access
            this.autoScroll()
        }
    }

    autoScroll() {
        if (this._scroll) {
            if (typeof this.oldHeight === 'number') {
                const diff = this.oldHeight - (this._scroll && this._scroll.children && this._scroll.children[0].offsetHeight)
                this._scroll.scrollTop = this._scroll.scrollTop - diff
            }
            this.oldHeight = this._scroll && this._scroll.children && this._scroll.children[0].offsetHeight
        }
    }

    resetNoti() {
        this.setEditMode(false);
        this.setState({ isLoading: SEND.NONE, notify: null, isChange: false });
    }

    handlerData(data) {
        if (!data) return {};
        const obj = {
            full_name: data.full_name || '',
            user_login_id: (data.user_login_id || '').toLowerCase(),
            email: data.user_login_id || '',
            phone: data.phone || '',
            user_group: data.user_group,
            role_group: data.role_group || '',
            user_type: APIACCESSENUM[data.api_access],
            status: data.status,
            email_template: data.email_template,
            access_method: data.access_method,
            note: data.note || ''
        }
        if (data.phone === 'au|') obj.phone = ''
        if (data.status === USERSTATUS.ACTIVE) {
            obj.password = data.password;
            obj.change_password = 1;
            obj.send_password = data.send_password ? 1 : 0;
        }
        if (Array.isArray(data.list_mapping)) {
            if (data.list_mapping.length > 0) {
                let listMapping = '';
                for (let index = 0; index < data.list_mapping.length; index++) {
                    const element = data.list_mapping[index];
                    listMapping += element.account_id + ',';
                }
                listMapping = listMapping.replace(/.$/, '');
                obj.list_mapping = listMapping
            }
        }
        if (Array.isArray(data.branch_management)) {
            if (data.branch_management.length > 0) {
                let branchCode = '';
                for (let index = 0; index < data.branch_management.length; index++) {
                    const element = data.branch_management[index];
                    branchCode += element.branch_code + ',';
                }
                branchCode = branchCode.replace(/.$/, '');
                obj.branch_code = branchCode
            }
        }
        if (Array.isArray(data.organization_management)) {
            if (data.organization_management.length > 0) {
                let organisationCode = '';
                for (let index = 0; index < data.organization_management.length; index++) {
                    const element = data.organization_management[index];
                    organisationCode += element.organisation_code + ',';
                }
                organisationCode = organisationCode.replace(/.$/, '');
                obj.organisation_code = organisationCode
            }
        }
        if (Array.isArray(data.manage_advisor)) {
            if (data.manage_advisor.length > 0) {
                let advisorCode = '';
                for (let index = 0; index < data.manage_advisor.length; index++) {
                    const element = data.manage_advisor[index];
                    advisorCode += element.advisor_code + ',';
                }
                advisorCode = advisorCode.replace(/.$/, '');
                obj.advisor_code = advisorCode
            }
        }
        return obj;
    }

    createUser() {
        const data = this.getData();
        if (!data) return
        const dataObj = this.handlerData(data);
        this.sendRequest(NOTIFYENUM.CREATE_USER_REQUEST, () => {
            const url = getUrlCreateUser();
            postData(url, { data: dataObj }).then(res => {
                this.userId = (res && res.data && res.data.user_id) || (res && res.user_id);
                const newData = Object.assign(data, res.data || {})
                this.setData(newData)
                // this.props.saveState && this.props.saveState({ user_id: this.userId })
                this.sendSuccess(NOTIFYENUM.CREATE_USER_SUCCESS, () => {
                    this.props.close()
                })
            }).catch(error => {
                let errorCode = '2000';
                if (error && error.response && error.response.errorCode && Array.isArray(error.response.errorCode) && error.response.errorCode.length) {
                    errorCode = error.response.errorCode[0] || '2000'
                } else {
                    errorCode = error.response.errorCode || '2000'
                }
                errorCode = errorCode && parseInt(errorCode) ? errorCode : '2000';
                this.sendError(`error_code_${errorCode}`, () => {
                    this.setState({ isLoading: SEND.NONE, notify: null });
                })
            })
            // }
        })
    }

    clearCreateData() {
        this.resetData();
        this.onChange();
        this.setData(clone(initialData));
        const inputSearch = document.getElementById(`searchBoxSelector_${this.id}`)
        if (inputSearch) {
            inputSearch.value = '';
        }
    }

    changeConnection(isConnected) {
        if (!isConnected !== !this.state.isConnected) {
            this.setState({ isConnected })
        }
    }

    sendRequest(info, cb) {
        // this.props.loading(true);
        this.setState({
            isLoading: SEND.REQUEST,
            notify: info
        }, () => {
            setTimeout(() => {
                // this.props.loading(false);
                cb && cb();
            }, TIME.TIME_SHOW_INFO)
        })
    }

    sendSuccess(info, cb) {
        this.setState({
            isLoading: SEND.SUCCESS,
            isCreate: EDITSTATE.VIEW,
            notify: info
        }, () => {
            setTimeout(() => {
                cb && cb()
            }, TIME.TIME_SHOW_INFO)
        });
    }

    sendError(error, cb) {
        this.setState({
            isLoading: SEND.ERROR,
            notify: error
        }, () => {
            setTimeout(() => {
                cb && cb()
            }, TIME.TIME_SHOW_ERROR)
        })
    }

    handleKeyPress() {
        try {
            this.createUser();
        } catch (error) {
            logger.error('handleKeyPress On createUser' + error)
        }
    }
    getNotifyBg = isLoading => {
        switch (isLoading) {
            case SEND.REQUEST:
                return 'var(--semantic-warning)';
            case SEND.SUCCESS:
                return 'var(--semantic-success)';
            case SEND.ERROR:
                return 'var(--semantic-danger)';
            default:
                return 'var(--semantic-warning)';
        }
    }

    renderHeader() {
        return <div className={s.header}>
            <div className={s.title + ' ' + 'showTitle text-capitalize'}>{this.state.created ? <Lang>lang_user_detail</Lang> : <Lang>lang_create_user</Lang>}</div>
            <div className={s.icon} onClick={() => this.props.close()}><SvgIcon path={path.mdiClose} /></div>
        </div>
    }
    renderBottom() {
        const { isConnected } = this.state
        return <div className='footer' style={{ display: 'flex', flexDirection: 'row', padding: '0 8px 8px 8px' }}>
            <div className={s.btn} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }} ref={ref => this.refActBtn = ref}>
                <Button type={buttonType.danger} className={s.footerBtn + ' text-uppercase'} style={{ marginLeft: '8px' }} onClick={() => this.clearCreateData()}><Lang>lang_clear_data</Lang></Button>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Button type={buttonType.ascend} disabled={!checkRole(MapRoleComponent.CREATE_NEW_USER) || !isConnected} className={s.footerBtn + ' text-uppercase'} onClick={() => this.createUser()}><Lang>lang_create_new_user</Lang></Button>
                    <Button className={s.footerBtn + ' text-uppercase'} onClick={() => this.props.close()}><Lang>lang_close</Lang></Button>
                </div>
            </div>
        </div>
    }
    renderNotify = ({ isLoading, notify }) => {
        if (isLoading === SEND.NONE) return null;
        return (<div className={`errorOrder size--3`} style={{ background: this.getNotifyBg(isLoading) }}>
            <Lang>{notify}</Lang>
        </div>)
    }

    render() {
        const { isCreate } = this.state
        return (
            <div className={s.container} style={{ overflow: 'auto' }}>
                {this.renderHeader()}
                {this.renderNotify(this.state)}
                <div style={{ flex: 1, overflow: 'auto', margin: '8px 0 16px 8px', paddingRight: '16px' }} ref={ref => this._scroll = ref}>
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
                        }}
                        schema={getStructure(false)}
                        data={initialData}
                        onKeyPress={this.handleKeyPress.bind(this)}
                        marginForm={true}
                    />
                </div>
                {this.renderBottom()}
            </div >
        );
    }
}
