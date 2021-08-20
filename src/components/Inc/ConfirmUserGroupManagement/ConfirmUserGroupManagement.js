import React from 'react';
import Icon from '../Icon';
import DropDown from '../../DropDown';
import Lang from '../Lang';
import dataStorage from '../../../dataStorage';
import { emitter, eventEmitter } from '../../../constants/emitter_enum';
import { func } from '../../../storage';
import { deleteData, getUserGroupUrl, postData } from '../../../helper/request';
import logger from '../../../helper/log';
import { translate } from 'react-i18next';
import NoTag from '../../Inc/NoTag'
import Button, { buttonType } from '../../Elements/Button/Button';
import SvgIcon, { path } from '../SvgIcon/SvgIcon';

class ConfirmUserGroupManagement extends React.Component {
    constructor(props) {
        super(props);
        if (props.type === 'Create') {
            this.options = [
                {
                    label: <div className='showTitle text-uppercase'><Lang>lang_default</Lang></div>,
                    value: 'DEFAULT'
                }
            ];
            this.dicGroup = {
                'DEFAULT': 'DEFAULT'
            };
        } else {
            this.options = []
            this.dicGroup = {};
        }
        this.passHandleOnChangeDropdown = false
        if (props.options && props.options.length) {
            for (let i = 0; i < props.options.length; i++) {
                let item = props.options[i]
                let obj = {}
                obj.label = item.headerFixed || item.header
                obj.value = item.headerFixed || item.header;
                this.dicGroup[item.headerFixed || item.header] = item.name || item.field;
                this.options.push(obj)
            }
        }
        if (props.type === 'Create') {
            this.copy_user_group_id = this.dicGroup['DEFAULT'];
        } else {
            this.copy_user_group_id = Object.values(this.dicGroup)[0]
        }
        const defaultGroup = this.options.length > 0 ? this.options[0].value : null
        this.state = {
            isConnected: dataStorage.connected,
            dataIsChanged: props.type === 'Create' ? false : !!defaultGroup,
            group_name: defaultGroup
        }
        this.copy_group_name = null;
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.handleConfirm = this.handleConfirm.bind(this)
    }

    changeConnection(isConnected) {
        if (!isConnected !== !this.state.isConnected) {
            this.setState({ isConnected })
        }
    }

    handleOnChangeDropdown(data) {
        if (this.props.type === 'Create') {
            this.setState({
                group_name: data
            })
            this.copy_user_group_id = this.dicGroup[data]
        } else {
            this.setState({
                dataIsChanged: true,
                group_name: data
            })
            this.copy_user_group_id = this.dicGroup[data]
            this.passHandleOnChangeDropdown = true
        }
    }

    handleOnChangeInput(input) {
        ReactDOM.render(<div></div>, this.refError)
        if (input.target.value) {
            this.setState({
                dataIsChanged: true
            })
        } else {
            this.setState({
                dataIsChanged: false
            })
        }
    }

    handleConfirm(id) {
        if (!this.state.isConnected) return;
        if (!this.state.dataIsChanged) return;
        let url
        switch (this.props.type) {
            case 'Create':
                let inputVal = (this.input.value || '').toUpperCase();
                url = getUserGroupUrl()
                let obj = {
                    data: {
                        role_group_name: inputVal,
                        ref_role_group_id: this.copy_user_group_id || ''
                    }
                }
                postData(url, obj)
                    .then(response => {
                        this.props.callBack('lang_create_role_successfully')
                        this.props.close();
                    })
                    .catch(error => {
                        let errorCode
                        if (error && error.response && error.response.data && error.response.data.errorCode) {
                            errorCode = Array.isArray(error.response.data.errorCode) ? error.response.data.errorCode[0] : error.response.data.errorCode;
                        }
                        if (error && error.response && error.response.errorCode) {
                            errorCode = Array.isArray(error.response.errorCode) ? error.response.errorCode[0] : error.response.errorCode;
                        }
                        const errorText = errorCode ? `error_code_${errorCode}` : 'lang_create_role_unsuccessfully'
                        ReactDOM.render(<Lang>{errorText}</Lang>, this.refError)
                        this.input && this.input.focus()
                        logger.error(error)
                    })

                break;
            case 'Remove':
                let userGroupId = this.dicGroup[this.options[0].value] || ''
                if (this.passHandleOnChangeDropdown) {
                    userGroupId = this.copy_user_group_id || ''
                    this.passHandleOnChangeDropdown = false
                }
                url = getUserGroupUrl(userGroupId)
                deleteData(url)
                    .then(response => {
                        this.props.callBack('lang_delete_role_successfully')
                        this.props.close();
                    })
                    .catch(error => {
                        let errorCode
                        if (error && error.response && error.response.data && error.response.data.errorCode) {
                            errorCode = Array.isArray(error.response.data.errorCode) ? error.response.data.errorCode[0] : error.response.data.errorCode;
                        }
                        if (error && error.response && error.response.errorCode) {
                            errorCode = Array.isArray(error.response.errorCode) ? error.response.errorCode[0] : error.response.errorCode;
                        }
                        const errorText = errorCode ? `error_code_${errorCode}` : 'lang_delete_role_unsuccessfully'
                        ReactDOM.render(<Lang>{errorText}</Lang>, this.refError)
                        logger.error(error)
                    })
                break;
        }
    }

    renderHeader() {
        switch (this.props.type) {
            case 'Create':
                return <div className='header text-uppercase size--4'><Lang>lang_create_new_role_group</Lang></div>
            case 'Remove':
                return <div className='header text-uppercase size--4'><Lang>lang_remove_role_group</Lang></div>
            default:
                return <div></div>
        }
    }

    renderContent() {
        switch (this.props.type) {
            case 'Create':
                return <div className='content size--3'>
                    <div className='styleErrorPopup' ref={(ref) => this.refError = ref}></div>
                    <div className='row'>
                        <div className='text-overflow text-capitalize' style={{ width: '40%' }}><Lang>lang_role_group_name</Lang></div>
                        <div style={{ display: 'flex', width: '60%' }}>
                            <input
                                ref={dom => {
                                    this.input = dom
                                    setTimeout(() => {
                                        dom && dom.focus()
                                    }, 10)
                                }}
                                className='inputCreate user size--3'
                                placeholder='...'
                                onChange={this.handleOnChangeInput.bind(this)} />
                        </div>
                    </div>
                    <div className='row'>
                        <div className='text-overflow' style={{ width: '40%' }}>
                            <Lang>lang_copy_workflow_from</Lang>
                        </div>
                        <div style={{ width: '60%' }}>
                            <DropDown
                                upperCase={true}
                                className="dropdownGroup"
                                options={this.options}
                                value={this.state.group_name}
                                onChange={this.handleOnChangeDropdown.bind(this)}
                            />
                        </div>
                    </div>
                </div>
            case 'Remove':
                return <div className='content size--3'>
                    <div className='styleErrorPopup' ref={(ref) => this.refError = ref}></div>
                    <div className='row'>
                        <div className='text-overflow text-capitalize' style={{ width: '40%' }}><Lang>lang_role_group_name</Lang></div>
                        <div style={{ width: '60%' }}>
                            <DropDown
                                upperCase={true}
                                className="DropdownGroup"
                                options={this.options}
                                value={this.state.group_name}
                                onChange={this.handleOnChangeDropdown.bind(this)} />
                        </div>

                    </div>
                </div>
            default:
                return <div></div>
        }
    }

    renderFooter() {
        return <div className='footer confirmBtnRoot btn-group'>
            <Button type={buttonType.danger} className='btn' onClick={() => this.props.close()}>
                <SvgIcon path={path.mdiClose} />
                <span className='text-uppercase'><Lang>lang_cancel</Lang></span>
            </Button>
            <Button type={buttonType.success} disabled={!this.state.dataIsChanged || !this.options.length} className='btn' onClick={() => this.handleConfirm()}>
                <span className='text-uppercase'><Lang>lang_confirm</Lang></span>
            </Button>
        </div >
    }

    render() {
        return <div className={`confirmUserGroupManagement ${this.state.isConnected ? '' : 'disable'}`}>
            {this.renderHeader()}
            {this.renderContent()}
            {this.renderFooter()}
        </div>
    }

    componentDidMount() {
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
    }
}

export default translate('translations')(ConfirmUserGroupManagement)
