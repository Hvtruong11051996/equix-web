import React from 'react';
import { translate } from 'react-i18next';
import Icon from '../Icon/Icon';
import Lang from '../Lang';
import DropDown from '../../DropDown/DropDown';
import { emitter, eventEmitter } from '../../../constants/emitter_enum';
import { func } from '../../../storage';
import logger from '../../../helper/log';
import { mapError } from '../../../helper/functionUtils'
import { postData, deleteData, getDataBranch, createNewBranch } from '../../../helper/request';
import Button, { buttonType } from '../../Elements/Button/Button';
import SvgIcon, { path } from '../SvgIcon/SvgIcon';

class ConfirmAccountGroupManagement extends React.Component {
    constructor(props) {
        super(props);
        this.copy_group_name = null
        this.state = {
            connected: true,
            errorCode: '',
            isLoading: false,
            value: ''
        }
        this.input = {}
        this.handleConfirm = this.handleConfirm.bind(this)
        this.options = this.props.option
        this.renderContent = this.renderContent.bind(this)
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.createNewGroupAccFromPopup = this.createNewGroupAccFromPopup.bind(this)
    }

    hiddenWarning = () => {
        try {
            setTimeout(() => {
                this.setState({
                    errorCode: ''
                })
            }, 4000)
        } catch (error) {
            logger.error('hiddenWarning On ConfirmAccountGroupManagement ' + error)
        }
    }
    createNewGroupAccFromPopup(data) {
        let obj = {}
        if (data.data.copy_group_name === 'DEFAULT') {
            obj = {
                branch_name: data.data.new_group_name
            }
        } else {
            obj = {
                branch_name: data.data.new_group_name,
                ref_branch_id: data.data.copy_group_name
            }
        }
        let url = createNewBranch()
        postData(url, {
            data: obj
        }).then(response => {
            data.errStatus = 'lang_create_vetting_rule_successfully'
            data.type = 'Create'
            this.props.callBack(data)
            this.props.close();
        })
            .catch(error => {
                const errorCode = error.response && error.response.errorCode
                if (errorCode) {
                    this.setState({
                        isLoading: false,
                        errorCode: mapError(errorCode)
                    }, () => {
                        this.hiddenWarning();
                    })
                }
                logger.error(error)
            })
    }
    removeGroupAccFromPopup(data) {
        try {
            let url = getDataBranch(data.data.copy_group_name);
            deleteData(url).then(response => {
                if (response.data) {
                    data.errStatus = 'lang_delete_vetting_rule_successfully'
                    data.type = 'Remove'
                    this.props.callBack(data)
                    this.props.close();
                }
            }).catch(error => {
                const errorCode = error.response && error.response.errorCode
                if (errorCode) {
                    this.setState({
                        isLoading: false,
                        errorCode: mapError(errorCode)
                    }, () => {
                        this.hiddenWarning();
                    })
                }
                logger.error(error)
            })
        } catch (er) {
        }
    }
    handleOnChangeDropdown(data) {
        this.copy_group_name = data || this.options.NORMAL_ACCOUNT
    }

    handleConfirm() {
        if (!this.state.connected ||
            this.state.isLoading ||
            (this.props.type === 'Create' && !this.state.value)) {
            return
        }
        let data = {}
        this.setState({ isLoading: true })
        switch (this.props.type) {
            case 'Create':
                let inputVal = (this.input.value + '').toUpperCase();
                let dataCurrent = {
                    data: {
                        new_group_name: inputVal,
                        copy_group_name: this.copy_group_name || this.props.option[0].id
                    }
                }
                this.createNewGroupAccFromPopup(dataCurrent);
                break
            case 'Remove':
                data = {
                    type: 'Remove',
                    data: {
                        copy_group_name: this.copy_group_name || this.props.option[0].id
                    }
                }
                this.removeGroupAccFromPopup(data)
                break
            default:
                break
        }
    }

    renderHeader() {
        switch (this.props.type) {
            case 'Create':
                return <div style={{ width: '100%' }} className='header text-uppercase showTitle size--4'>
                    <label style={{ width: '100%' }} className='text-overflow text-uppercase text-center'><Lang>lang_create_new_vetting_rules_group</Lang></label>
                </div>
            case 'Remove':
                return <div style={{ width: '100%' }} className='header text-uppercase showTitle size--4'>
                    <label style={{ width: '100%' }} className='text-overflow text-uppercase text-center'><Lang>lang_remove_vetting_rules_group</Lang></label>
                </div>
            default:
                return <div></div>
        }
    }

    renderContent() {
        let op = [];
        if (this.options.length) {
            for (let i = 0; i < this.options.length; i++) {
                op.push(
                    {
                        label: this.options[i].name,
                        value: this.options[i].id
                    }
                )
            }
        }
        switch (this.props.type) {
            case 'Create':
                return <div className='content size--3' style={{ paddingTop: '8px' }}>
                    <div className='row'>
                        <div className="showTitle text-capitalize text-overflow padding-right8"><Lang>lang_vetting_rules_group_name</Lang></div>
                        <input type='text' ref={dom => {
                            this.input = dom
                            setTimeout(() => {
                                dom && dom.focus()
                            }, 10)
                        }} className='inputCreate size--3'
                            placeholder='...'
                            onChange={(event) => {
                                if (this.timeOut) clearTimeout(this.timeOut)
                                this.timeOut = setTimeout(() => {
                                    this.setState({ value: this.input.value, errorCode: '' })
                                }, 300);
                            }}
                        />
                    </div>
                    <div className='row'>
                        <div className="showTitle text-overflow padding-right8"><Lang>lang_copy_workflow_from</Lang></div>
                        <div style={{ width: 136 + 'px' }}>
                            <DropDown
                                translate={this.props.translate}
                                isBranch={true}
                                value={op[0].value}
                                className="dropdownGroup"
                                options={op}
                                onChange={this.handleOnChangeDropdown.bind(this)} />
                        </div>
                    </div>
                </div>
            case 'Remove':
                return <div className='content size--3'>
                    <div className='row'>
                        <div className="showTitle text-overflow text-capitalize padding-right8"><Lang>lang_vetting_rules_group_name</Lang></div>
                        <div style={{ width: 136 + 'px' }}>
                            {
                                op[0] && op[0].value
                                    ? <DropDown
                                        translate={this.props.translate}
                                        isBranch={true}
                                        style={{ width: '151px !important' }}
                                        value={op[0].value || false}
                                        className="DropdownGroup"
                                        options={op}
                                        onChange={this.handleOnChangeDropdown.bind(this)}
                                    />
                                    : <DropDown
                                        translate={this.props.translate}
                                        isBranch={true}
                                        style={{ width: '151px !important' }}
                                        className="DropdownGroup"
                                        options={op}
                                        onChange={this.handleOnChangeDropdown.bind(this)} />
                            }
                        </div>
                    </div>
                </div>
            default:
                return <div></div>
        }
    }

    renderFooter() {
        let disabled = false
        if (!this.state.connected ||
            (this.props.type === 'Remove' && (this.options.length === 0)) ||
            (this.props.type === 'Create' && !this.state.value) ||
            this.state.isLoading) {
            disabled = true
        }
        return <div className='footer confirmBtnRoot btn-group'>
            <Button type={buttonType.danger} className='btn' onClick={() => this.props.close()}>
                <SvgIcon path={path.mdiClose} />
                <span className='text-uppercase'><Lang>lang_cancel</Lang></span>
            </Button>
            <Button type={buttonType.success} disabled={disabled} className='btn' onClick={() => this.handleConfirm()}>
                {this.state.isLoading ? <img className="margin-right8" src='common/Spinner-white.svg' /> : <SvgIcon path={path.mdiCheck} />}
                <span className='text-uppercase'><Lang>lang_confirm</Lang></span>
            </Button>
        </div>
    }

    render() {
        return <div className='confirmUserGroupManagement' ref>
            {this.renderHeader()}
            <div className='styleErrorPopup'><Lang>{this.state.errorCode}</Lang></div>
            {this.renderContent()}
            {this.renderFooter()}
        </div>
    }
    changeConnection(connect) {
        this.setState({
            connected: connect
        })
    }
    componentDidMount() {
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
    }
    componentWillUnmount() {
        this.emitConnectionID && this.emitConnectionID.remove();
    }
}

export default translate('translations')(ConfirmAccountGroupManagement)
