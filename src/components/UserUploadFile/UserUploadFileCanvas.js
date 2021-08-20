
import React from 'react';
import { translate } from 'react-i18next';
import Icon from '../Inc/Icon/Icon';
import Lang from '../Inc/Lang/Lang';
import Dropzone from 'react-dropzone';
import Grid from '../Inc/CanvasGrid';
import MoreOption from '../Inc/MoreOption/MoreOption';
import dataStorage from '../../dataStorage';
import readXlsxFile from 'read-excel-file';
import {
    postData,
    getData,
    getUrlOrgBranchAdvisor,
    getUserGroupUrl,
    getUrlCreateUser
} from '../../helper/request';
import logger from '../../helper/log'
import { USER_STATUS, STATE_CODE, dicSort } from '../../constants/user_man_enum';
import uuidv4 from 'uuid/v4';
import { TYPE } from '../Inc/CanvasGrid/Constant/gridConstant';
import { clone } from '../../helper/functionUtils'

function trim(str) {
    if (!str) return '';
    return str + '';
}

const backgroundColorObj = {
    true: {
        'error': 'rgba(210, 51, 92, 0.3)',
        'success': 'rgba(4, 190, 91, 0.3)'
    },
    false: {
        'error': 'rgba(210, 51, 92, 0.2)',
        'success': 'rgba(4, 190, 91, 0.2)'
    }
}
export class UserUploadFile extends React.Component {
    constructor(props) {
        super(props);
        this.doCancel = this.doCancel.bind(this);
        this.getData = null;
        this.setData = null;
        this.setColumn = null;
        this.refreshView = null;
        this.opt = null;
        this.failCount = 0;
        this.successCount = 0;
        this.processCount = 0;
        this.columns = null;
        this.dicOrg = {};
        this.dicAdvisor = {};
        this.dicBranch = {};
        this.listData = [];
        this.intervalId = null;
        this.dicResponse = {};
        this.dicUserGroup = {};
        this.getColumnDef();
        this.filterError = true;
        this.filterSuccess = true;
        this.filterProcessing = true;
        this.dicStatusFilter = {
            error: 'error',
            success: 'success',
            processing: 'processing'
        };
        this.dicEmail = {}
        this.listFinal = []
        this.state = {
            stateText: '',
            count: 0,
            failCount: 0,
            successCount: 0,
            processCount: 0,
            isError: false,
            stateCode: STATE_CODE.UPLOAD,
            statusLoading: null
        }
        this.getRoleGroup = this.getRoleGroup.bind(this)
        props.resize && props.resize((w, h) => {
            if (this.grid && this.grid.canvas) this.grid.canvas.resize()
        })
    }

    getBackgroundColorKey = params => {
        if (params.data.response) {
            return backgroundColorObj[params.config.rows.index % 2 === 0][params.data.response]
        }
        return ''
    }

    getColumnDef() {
        this.columns = [
            {
                headerName: 'lang_full_name',
                name: 'full_name',
                type: TYPE.UPLOAD_STATUS,
                getBackgroundColorKey: this.getBackgroundColorKey
            },
            {
                headerName: 'USER_LOGIN',
                name: 'user_login',
                getBackgroundColorKey: this.getBackgroundColorKey
            },
            {
                headerName: 'lang_api_access',
                name: 'api_access',
                getBackgroundColorKey: this.getBackgroundColorKey
            },
            {
                headerName: 'lang_user_group',
                name: 'user_group',
                getBackgroundColorKey: this.getBackgroundColorKey
            },
            {
                headerName: 'lang_role_group',
                name: 'role_group',
                getBackgroundColorKey: this.getBackgroundColorKey
            },
            {
                headerName: 'lang_access_method',
                name: 'access_method',
                getBackgroundColorKey: this.getBackgroundColorKey
            },
            {
                headerName: 'lang_status',
                name: 'status',
                getBackgroundColorKey: this.getBackgroundColorKey
            },
            {
                headerName: 'lang_temporary_password',
                name: 'temporary_password',
                getBackgroundColorKey: this.getBackgroundColorKey
            },
            {
                headerName: 'lang_send_temporary_password',
                name: 'send_temporary_password',
                getBackgroundColorKey: this.getBackgroundColorKey
            },
            {
                headerName: 'PHONE_NUMBER',
                name: 'phone_number',
                getBackgroundColorKey: this.getBackgroundColorKey
            },
            {
                headerName: 'EMAIL_TEMPLATE',
                name: 'email_template',
                getBackgroundColorKey: this.getBackgroundColorKey
            },
            {
                headerName: 'lang_organisation_code',
                name: 'organisation_code',
                getBackgroundColorKey: this.getBackgroundColorKey
            },
            {
                headerName: 'lang_branch_code',
                name: 'branch_code',
                getBackgroundColorKey: this.getBackgroundColorKey
            },
            {
                headerName: 'lang_advisor_code',
                name: 'advisor_code',
                getBackgroundColorKey: this.getBackgroundColorKey
            },
            {
                headerName: 'lang_account_id',
                name: 'account_id',
                getBackgroundColorKey: this.getBackgroundColorKey
            },
            {
                headerName: 'lang_notes',
                name: 'notes',
                getBackgroundColorKey: this.getBackgroundColorKey
            }
        ]
    }

    getDicEmailTemp() {
        this.dicEmail = {}
        dataStorage.dicEmailTemp.map(item => {
            item.label && (this.dicEmail[(item.label + '').toLowerCase()] = item.value)
        })
        return this.dicEmail
    }

    doCancel() {
        this.props.openImportForm && this.props.openImportForm(false)
    }

    getUserGroup(group) {
        if (!group) return '';
        const typeLowerCase = trim(group).toUpperCase();
        switch (typeLowerCase) {
            case 'SUPER ADMIN':
                return 3
            case 'ADMIN':
                return 2
            case 'ADVISOR':
                return 1
            case 'OTHERS':
                return 0
            default:
                return '';
        }
    }

    getRoleGroup(group) {
        if (!group) return '';
        const groupInfo = this.dicUserGroup[trim(group).toUpperCase()] || {}
        return groupInfo.group_id;
    }

    getUserType(type) {
        const typeLowerCase = trim(type).toUpperCase();
        switch (typeLowerCase) {
            case 'ADVISOR':
                return 'advisor'
            case 'OPERATOR':
                return 'operation'
            case 'RETAIL':
                return 'retail'
            default:
                return '';
        }
    }

    getAccessMethod(access) {
        const text = ((access + '').trim()).toUpperCase()
        if (text === 'INTERNAL ONLY') return 0;
        else if (text === 'FIRST INTERNAL THEN EXTERNAL') return 1;
        else return '';
    }

    getStatus(status) {
        const statusUpper = (status + '').toUpperCase().replace(/\s/g, '_');
        return USER_STATUS[statusUpper];
    }

    getTemporaryPassword(password) {
        return password;
    }

    getSendTemporaryPassword(send) {
        if (!send) return 0
        const sendLower = (send + '').toLowerCase();
        if (sendLower === 'yes') {
            return 1
        }
        return 0
    }

    getEmailTemplate(template) {
        if (!template) return ''
        const emailTemp = trim(template);
        return this.dicEmail[(emailTemp + '').toLowerCase()] || emailTemp;
    }

    getCode(org, dicCode, key) {
        if (!org) return undefined;
        const listOrg = (org + '').split(',');
        let orgReturn = '';
        for (let index = 0; index < listOrg.length; index++) {
            const element = listOrg[index].replace(/\s/g, '')
            const orgTemp = dicCode[element];
            if (orgTemp) {
                orgReturn += `${orgTemp[key]},`;
            }
        }
        return orgReturn ? orgReturn.substring(0, orgReturn.length - 1) : '';
    }

    getOrgCode(org) {
        const itemReturn = this.getCode(org, this.dicOrg, 'organisation_name');
        return itemReturn;
    }

    getBranchCode(branch) {
        const itemReturn = this.getCode(branch, this.dicBranch, 'branch_name');
        return itemReturn;
    }

    getAdvisorCode(advisor) {
        const itemReturn = this.getCode(advisor, this.dicAdvisor, 'advisor_name');
        return itemReturn;
    }

    getAccounts(accounts) {
        if (!accounts) return '';
        const accountsString = accounts + '';
        const listString = accountsString.split(',');
        let stringReturn = listString.join(',').replace(/\s/g, '')
        return stringReturn
    }

    createObjToSendServer(user) {
        const newObj = {
            user_login_id: undefined,
            full_name: undefined,
            user_type: undefined,
            role_group: undefined,
            user_group: undefined,
            access_method: undefined,
            status: undefined,
            email_template: undefined,
            phone: undefined,
            password: undefined,
            organisation_code: undefined,
            branch_code: undefined,
            advisor_code: undefined,
            list_mapping: undefined,
            send_password: undefined,
            note: undefined
        };

        newObj.user_login_id = trim(user.user_login);
        newObj.email = trim(user.user_login); // tam gui len backend
        newObj.full_name = trim(user.full_name);
        newObj.user_type = this.getUserType(user.api_access);
        newObj.role_group = this.getRoleGroup(user.role_group);
        newObj.user_group = this.getUserGroup(user.user_group);
        newObj.access_method = user.access_method ? this.getAccessMethod(user.access_method) : '';
        newObj.status = this.getStatus(user.status);
        newObj.email_template = this.getEmailTemplate(user.email_template);
        newObj.phone = trim(user.phone_number);
        newObj.password = this.getTemporaryPassword(user.temporary_password);
        newObj.organisation_code = this.getOrgCode(user.organisation_code);
        newObj.branch_code = this.getBranchCode(user.branch_code);
        newObj.advisor_code = this.getAdvisorCode(user.advisor_code);
        newObj.list_mapping = this.getAccounts(user.account_id);
        newObj.send_password = this.getSendTemporaryPassword(user.send_temporary_password);
        newObj.note = trim(user.notes);
        return newObj
    }
    createPromise(userInput) {
        const objSend = this.createObjToSendServer(userInput);
        if (!objSend) return null;
        return new Promise(resolve => {
            const id = userInput.id;
            const url = getUrlCreateUser();
            postData(url, { 'data': objSend })
                .then(res => {
                    if (res.errorTimeOut) {
                        this.failCount++;
                        this.dicResponse[id] = {
                            code: 'error',
                            errorDetail: res.errorTimeOut
                        }
                        this.setState({
                            statusLoading: (this.failCount + this.successCount) / this.countRow * 100
                        })
                        resolve({
                            code: res
                        });
                    } else {
                        this.successCount++;
                        this.dicResponse[id] = {
                            code: 'success',
                            errorDetail: []
                        }
                        this.setState({
                            statusLoading: (this.failCount + this.successCount) / this.countRow * 100
                        })
                        resolve({
                            code: res
                        });
                    }
                })
                .catch(err => {
                    const response = err.response || {};
                    this.failCount++;
                    this.dicResponse[id] = {
                        code: 'error',
                        errorDetail: response.errorCode || 'server_timeout'
                    }
                    this.setState({
                        statusLoading: (this.failCount + this.successCount) / this.countRow * 100
                    })
                    resolve({
                        code: err
                    });
                });
        })
    }

    renderHeader() {
        const { t } = this.props
        return (
            <div className={'headerUpload size--4'}>
                <div><Lang>lang_create_user_in_bulk</Lang></div>
                <div title={t('CLOSE')} className={'closeButton'} onClick={() => {
                    this.props.openImportForm && this.props.openImportForm(false)
                }}><Icon src={'navigation/close'} /></div>
            </div>
        )
    }

    renderError() {
        return (
            this.state.stateText ? <div className={this.state.isError ? 'errorUpload' : 'warningUpload'}>
                <div><Lang>{this.state.stateText}</Lang></div>
            </div> : null
        )
    }

    onDrop(files) {
        logger.log(files);
        this.setState({
            stateText: 'lang_uploading_file',
            isError: false
        }, () => {
            readXlsxFile(files[0])
                .then((rows) => {
                    const listProperty = rows && rows.length ? rows[0] : [];
                    const listData = [];
                    this.listData = [];
                    if (rows && rows.length > 1) {
                        for (let index = 1; index < rows.length; index++) {
                            const listDataRow = rows[index] || [];
                            if (listDataRow[0] && listDataRow[1]) {
                                const obj = {
                                    id: uuidv4()
                                };
                                for (let i = 0; i < listDataRow.length; i++) {
                                    const element = listDataRow[i];
                                    if (i < listProperty.length) {
                                        let key = listProperty[i];
                                        if (key === 'ROLES') key = 'ROLE_GROUP'
                                        let newKey = key.toLocaleLowerCase();
                                        newKey = newKey.replace(/\s/g, '_');
                                        obj[newKey] = element;
                                    }
                                }
                                listData.push(obj);
                            }
                        }
                        this.listData = listData;
                        this.setState({
                            stateCode: STATE_CODE.PREVIEW,
                            stateText: ''
                        })
                    } else {
                        this.setState({
                            stateText: 'lang_no_data_was_imported_from_this_file',
                            isError: true
                        }, () => setTimeout(() => {
                            this.setState({ stateText: '' })
                        }, 4000))
                    }
                }).catch(err => {
                    logger.log(err);
                    this.setState({
                        stateText: 'lang_format_is_not_support',
                        isError: true
                    })
                })
        })
    }

    createagSideButtons = () => {
        return [
            // {
            //     value: 'ExportCSV',
            //     label: 'lang_export_csv',
            //     callback: () => this.exportCsv()
            // },
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

    renderBody() {
        const classHidden = Math.ceil(this.state.statusLoading) === 100 || this.state.statusLoading === null ? 'myHidden' : ''
        switch (this.state.stateCode) {
            case STATE_CODE.UPLOAD:
                return <div className='uploadFile size--5'>
                    <div>
                        <p className='text-uppercase'><Lang>lang_drop_file_here</Lang></p>
                        <p><Lang>lang_or</Lang></p>
                        <Dropzone
                            multiple={false}
                            onDrop={this.onDrop.bind(this)}
                            onClick={evt => {
                                if (!this.props.isConnected) evt.preventDefault()
                            }}
                        >
                            {({ getRootProps, getInputProps }) => (
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <div className={`btn ${this.props.isConnected ? '' : 'disabled'} showTitle`}>
                                        <Icon className='icon' src={'editor/publish'} />
                                        <span className='text-uppercase'>{<Lang>lang_select_file</Lang>}</span>
                                    </div>
                                </div>
                            )}
                        </Dropzone>
                    </div>
                </div>
            case STATE_CODE.PREVIEW:
            case STATE_CODE.PROCESSING:
            case STATE_CODE.FINISH:
                return <div style={{ display: 'flex', flexDirection: 'column' }} className='contentUpload'>
                    <div className={`loading-status warningUpload text-center ${classHidden} firstLetterUpperCase`}>
                        <Lang>lang_creating_new_user</Lang>...({Math.ceil(this.state.statusLoading)}%)
                    </div>
                    <div className='header-wrap' style={{ justifyContent: 'flex-end', display: 'flex' }}><MoreOption agSideButtons={this.createagSideButtons()} /></div>
                    <Grid
                        {...this.props}
                        opt={(opt) => {
                            this.opt = opt
                        }}
                        fnKey={data => {
                            return data.id
                        }}
                        columns={this.columns}
                        fn={fn => {
                            this.setData = fn.setData
                            this.setColumn = fn.setColumn
                            this.addOrUpdate = fn.addOrUpdate
                            this.getData = fn.getData
                            this.exportCsv = fn.exportCsv
                            this.autoSize = fn.autoSize
                            this.resetFilter = fn.resetFilter
                            this.setQuickFilter = fn.setQuickFilter
                            this.showColumnMenu = fn.showColumnMenu
                            this.showFilterMenu = fn.showFilterMenu
                            this.grid = fn.grid
                        }}
                        onReady={this.onReady}
                    />
                </div>
            default:
                break;
        }
    }

    onReady = () => {
        this.setData && this.setData(this.listData)
    }

    download(url) {
        var div = document.getElementById('download');
        if (!div) {
            div = document.createElement('div');
            div.style.display = 'none';
            div.id = 'download';
            document.body.appendChild(div);
        }
        div.innerHTML = '';
        var iframe = document.createElement('iframe');
        iframe.src = url;
        div.appendChild(iframe);
    }

    clickToDownloadTemplate() {
        this.download(`/template/${dataStorage.env_config.userTemplate || 'user-template.xlsx'}`);
    }

    checkValidData(user) {
        const listError = [];
        if (!user.user_login) listError.push('user_login_is_require');
        if (user.full_name && (user.full_name.length < 3 || user.full_name.length > 255)) {
            listError.push('full_name_must_be_3_to_255_character');
        } else if (!user.full_name) {
            listError.push('full_name_is_require');
        }

        if (user.email_template) {
            const keyEmail = this.dicEmail[trim((user.email_template + '').toLowerCase())] || user.email_template;
            if (!keyEmail) listError.push('2091');
        }

        return listError;
    }

    updateRowData(dicRes = {}, statusFilter = {}, sort = false) {
        if (Object.keys(statusFilter).length > 0) {
            const listUpdate = [];
            const listData = this.getData();
            for (let index = 0; index < listData.length; index++) {
                const element = listData[index];
                const itemInDic = dicRes[element.id];
                const newElement = JSON.parse(JSON.stringify(element));
                if (itemInDic) {
                    newElement.response = itemInDic.code;
                    newElement.errorDetail = itemInDic.errorDetail;
                }
                if (statusFilter[newElement.response]) {
                    listUpdate.push(newElement);
                }
            }
            const listFinal = sort ? listUpdate.sort((a, b) => {
                return dicSort[a.response] - dicSort[b.response]
            }) : listUpdate;
            this.listFinal = listFinal;
            this.addOrUpdate(listFinal, this.state.statusLoading !== null ? 'true' : false);
        }
    }

    async click2CreateUsers() {
        this.dicResponse = {};
        this.failCount = 0;
        this.successCount = 0;
        let lst = JSON.parse(JSON.stringify(this.listData))
        this.countRow = lst.length
        this.setState({
            statusLoading: 0,
            stateCode: STATE_CODE.PROCESSING,
            processCount: this.countRow,
            failCount: 0,
            successCount: 0
        })
        while (lst && lst.length) {
            const listPromise = [];
            const newList = lst;
            lst = newList.splice(50);
            for (let index = 0; index < newList.length; index++) {
                const element = newList[index];
                newList[index].response = 'processing'
                newList[index].errorDetail = [];
                const listError = this.checkValidData(element);
                if (listError && listError.length) {
                    this.dicResponse[element.id] = {
                        code: 'error',
                        errorDetail: listError
                    }
                    this.failCount++;
                    if (this.countRow === this.failCount) {
                        this.setState({
                            statusLoading: null,
                            stateCode: STATE_CODE.FINISH
                        })
                        this.updateRowData(JSON.parse(JSON.stringify(this.dicResponse)), this.dicStatusFilter);
                    }
                    continue;
                }
                const promise = this.createPromise(element);
                if (promise) {
                    listPromise.push(promise);
                }
            }
            if (listPromise.length > 0) {
                this.processCount = listPromise.length;
                this.addOrUpdate(newList, true);
                await Promise.all(listPromise).then(res => {
                    this.setState({
                        failCount: this.failCount,
                        successCount: this.successCount,
                        processCount: this.countRow - this.failCount - this.successCount
                    })

                    this.updateRowData(JSON.parse(JSON.stringify(this.dicResponse)), this.dicStatusFilter);
                });
            } else {
                this.setState({
                    failCount: this.failCount,
                    successCount: this.successCount,
                    processCount: this.countRow - this.failCount - this.successCount
                })
                this.updateRowData(JSON.parse(JSON.stringify(this.dicResponse)), this.dicStatusFilter);
            }
            if (Math.ceil(this.state.statusLoading) === 100) {
                this.setState({
                    statusLoading: null,
                    stateCode: STATE_CODE.FINISH
                })
            }
            this.updateRowData(JSON.parse(JSON.stringify(this.dicResponse)), this.dicStatusFilter);
        }
    }

    click2SortByStatus() {
        const dicRes = JSON.parse(JSON.stringify(this.dicResponse));
        this.updateRowData(dicRes, this.dicStatusFilter, true);
    }

    click2SelectFile() {
        this.listData = [];
        this.setState({
            stateCode: STATE_CODE.UPLOAD
        });
    }

    filterByStatus(status, check) {
        if (check) {
            this.dicStatusFilter[status] = status;
        } else {
            delete this.dicStatusFilter[status];
        }
        let data = clone(this.listFinal)
        let fitlerConditionArr = Object.keys(this.dicStatusFilter)
        data = data.filter(x => fitlerConditionArr.includes(x.response))
        this.setData(data)
        this.forceUpdate()
    }

    renderFooter() {
        switch (this.state.stateCode) {
            case STATE_CODE.UPLOAD:
                return (
                    <div className='footerUpload'>
                        <div className={'leftFooter size--3'}>
                            <div onClick={this.clickToDownloadTemplate.bind(this)} className='linkTextButton showTitle text-capitalize'>{<Lang>lang_download_template</Lang>}</div>
                        </div>
                        <div className={'rightFooter'}>
                            <div className={`btn btn-dask size--4 showTitle`} onClick={this.doCancel}>
                                <Icon className='icon' src='navigation/close' color='#ffffff' />
                                <span className='text-uppercase'>{<Lang>lang_close</Lang>}</span>
                            </div>
                        </div>
                    </div>
                )
            case STATE_CODE.PREVIEW:
                return (
                    <div className='footerUpload'>
                        <div className={'leftFooter size--3'}>

                        </div>
                        <div className={'rightFooter'}>
                            <div className={`btn ${this.props.isConnected ? '' : 'disabled'} showTitle`} onClick={this.props.isConnected ? this.click2CreateUsers.bind(this) : null}>
                                <Icon className='icon' src={'social/person-add'} />
                                <span className='text-uppercase'>{<Lang>lang_create_new_user</Lang>}</span>
                            </div>
                            <div className={`btn btn-dask showTitle`} onClick={this.doCancel}>
                                <Icon className='icon' src='navigation/close' color='#ffffff' />
                                <span className='text-uppercase'>{<Lang>lang_close</Lang>}</span>
                            </div>
                        </div >
                    </div >
                )
            case STATE_CODE.PROCESSING:
                return (
                    <div className='footerUpload'>
                        <div className={'leftFooter size--3'}>
                            <div className={'status'} onClick={() => {
                                this.filterByStatus('error');
                            }}>
                                <div>
                                    <img className='icon' src='common/checkbox-marked-outline.svg'></img>
                                </div>
                                <div>
                                    <span className='text-capitalize'><Lang>lang_failure</Lang>: {this.state.failCount}</span>
                                </div>

                            </div>
                            <div className={'status'} onClick={() => {
                                this.filterByStatus('success');
                            }}>
                                <div>
                                    <img className='icon' src='common/checkbox-marked-outline.svg'></img>
                                </div>
                                <div>
                                    <span className='text-capitalize'><Lang>lang_success</Lang>: {this.state.successCount}</span>
                                </div>

                            </div>
                            <div className={'status'} onClick={() => {
                                this.filterByStatus('processing');
                            }}>
                                <div>
                                    <img className='icon' src='common/checkbox-marked-outline.svg'></img>
                                </div>
                                <div>
                                    <span className='text-capitalize'><Lang>lang_pending</Lang>: {this.state.processCount}</span>
                                </div>
                            </div>
                            <div onClick={this.click2SortByStatus.bind(this)} className='linkTextButton'>{<Lang>lang_sort_by_status</Lang>}</div>
                        </div>
                        <div className={'rightFooter'}>
                            <div className={`btn disabled showTitle`}>
                                <Icon className='icon' src={'social/person-add'} />
                                <span className='text-uppercase'>{<Lang>lang_create_new_user</Lang>}</span>
                            </div>
                            <div className={`btn btn-dask disabled showTitle`}>
                                <Icon className='icon' src='navigation/close' color='#ffffff' />
                                <span className='text-uppercase'>{<Lang>lang_close</Lang>}</span>
                            </div>
                        </div >
                    </div >
                )
            case STATE_CODE.FINISH:
                return (
                    <div className='footerUpload'>
                        <div className={'leftFooter size--3'}>
                            <div className={'status'} onClick={() => {
                                this.filterError = !this.filterError
                                this.filterByStatus('error', this.filterError);
                            }}>
                                <div>
                                    {
                                        this.filterError
                                            ? <img className='icon' src='common/checkbox-marked-outline.svg'></img>
                                            : <img className='icon' src='common/outline-check_box_outline_blank.svg'></img>
                                    }
                                </div>
                                <div>
                                    <span className='text-capitalize'><Lang>lang_failure</Lang>: {this.state.failCount}</span>
                                </div>

                            </div>
                            <div className={'status'} onClick={() => {
                                this.filterSuccess = !this.filterSuccess
                                this.filterByStatus('success', this.filterSuccess);
                            }}>
                                <div>
                                    {
                                        this.filterSuccess
                                            ? <img className='icon' src='common/checkbox-marked-outline.svg'></img>
                                            : <img className='icon' src='common/outline-check_box_outline_blank.svg'></img>
                                    }
                                </div>
                                <div>
                                    <span className='text-capitalize'><Lang>lang_success</Lang>: {this.state.successCount}</span>
                                </div>

                            </div>
                            <div className={'status'} onClick={() => {
                                this.filterProcessing = !this.filterProcessing
                                this.filterByStatus('processing', this.filterProcessing);
                            }}>
                                <div>
                                    {
                                        this.filterProcessing
                                            ? <img className='icon' src='common/checkbox-marked-outline.svg'></img>
                                            : <img className='icon' src='common/outline-check_box_outline_blank.svg'></img>
                                    }
                                </div>
                                <div>
                                    <span className='text-capitalize'><Lang>lang_pending</Lang>: {this.state.processCount}</span>
                                </div>
                            </div>
                            <div onClick={this.click2SortByStatus.bind(this)} className='linkTextButton'>{<Lang>lang_sort_by_status</Lang>}</div>
                        </div>
                        <div className={'rightFooter'}>
                            <div className={`btn ${this.props.isConnected ? '' : 'disabled'} showTitle`} onClick={this.click2SelectFile.bind(this)}>
                                <Icon className='icon' src={'file/create-new-folder'} />
                                <span className='text-uppercase'>{<Lang>lang_select_file</Lang>}</span>
                            </div>
                            <div className={`btn btn-dask showTitle`} onClick={this.doCancel}>
                                <Icon className='icon' src='navigation/close' color='#ffffff' />
                                <span className='text-uppercase'>{<Lang>lang_close</Lang>}</span>
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    componentDidMount() {
        this.dicEmail = this.getDicEmailTemp()
        const url = getUrlOrgBranchAdvisor('all');
        const userGroupUrl = getUserGroupUrl();
        getData(userGroupUrl)
            .then(res => {
                this.dicUserGroup = {};
                if (!res.data || !res.data.data) {
                    this.setState({
                        stateText: 'lang_can_not_get_data',
                        isError: true
                    })
                    return
                }

                for (let index1 = 0; index1 < res.data.data.length; index1++) {
                    const element1 = res.data.data[index1];
                    this.dicUserGroup[element1.group_name.toUpperCase()] = element1;
                }
            })
            .then(() => {
                getData(url)
                    .then(resolve => {
                        logger.log(resolve);
                        this.dicOrg = {};
                        this.dicAdvisor = {};
                        this.dicBranch = {};
                        if (!resolve || !resolve.data || !resolve.data.length) {
                            this.setState({
                                stateText: 'lang_can_not_get_data',
                                isError: true
                            })
                            return;
                        };
                        const listOrg = resolve.data[0] || [];
                        const listBranch = resolve.data[1] || [];
                        const listAdvisor = resolve.data[2] || [];
                        for (let index = 0; index < listOrg.length; index++) {
                            const element = listOrg[index];
                            this.dicOrg[element.organisation_name] = element;
                        }
                        for (let index1 = 0; index1 < listBranch.length; index1++) {
                            const element1 = listBranch[index1];
                            this.dicBranch[element1.branch_name] = element1;
                        }
                        for (let index2 = 0; index2 < listAdvisor.length; index2++) {
                            const element2 = listAdvisor[index2];
                            this.dicAdvisor[element2.advisor_name] = element2;
                        }
                    })
                    .catch(e => {
                        this.setState({
                            stateText: 'lang_can_not_get_data',
                            isError: true
                        })
                    })
            })
            .catch(e => {
                this.setState({
                    stateText: 'lang_can_not_get_data',
                    isError: true
                })
            })
    }

    render() {
        return (
            <div className={'uploadBody'}>
                {
                    this.renderHeader()
                }
                {
                    this.renderError()
                }
                {
                    this.renderBody()
                }
                {
                    this.renderFooter()
                }

            </div>
        )
    }
}

export default translate('translations')(UserUploadFile);
