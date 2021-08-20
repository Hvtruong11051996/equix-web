import React from 'react';
import Lang from '../Inc/Lang';
import Icon from '../Inc/Icon';
import dataStorage from '../../dataStorage';
import {
    getUrlEditEmailNoti,
    getUrlEditSmsNoti,
    postData,
    putData
} from '../../helper/request';
import { func } from '../../storage';
import { emitter, eventEmitter } from '../../constants/emitter_enum';
import DropDown from '../DropDown/DropDown';
import Button, { buttonType } from '../Elements/Button/Button';
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon';
class EditEmailNotification extends React.Component {
    constructor(props) {
        super(props);
        this.objUser = this.props.userObj
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.state = {
            connected: dataStorage.connected,
            valError: false,
            emailEmpty: true,
            error: ''
        }
    }
    getKeyEnter(event) {
        const keyCode = event.which || event.keyCode;
        if (keyCode === 13) {
            if (this.props.isSmsNoti) {
                this.modifySmsAlert()
            } else {
                this.modifyEmailAlert()
            }
        }
    }
    renderHeader() {
        return <div className='header size--4 text-capitalize'><Lang>{this.props.headerText}</Lang></div>
    }
    renderContent() {
        if (this.props.isSmsNoti) {
            return <div className='content size--3'>
                <div className='row detail'>
                    <span className='firstLetterUpperCase'><Lang>{this.props.middleText}</Lang></span>
                </div>
                <div className={`styleErrorPopup size--3 ${this.state.error ? '' : 'hidden'}`}><Lang>{(this.state.error ? 'error_code_' : '') + this.state.error}</Lang></div>
                <div className='row'>
                    <div className='flagDd'>
                        <DropDown
                            className="DropDownOrder"
                            options={[
                                // {
                                //     label: '',
                                //     value: 'Chinese',
                                //     icon: '/flag/cn.png'
                                // }, {
                                //     label: '',
                                //     value: 'English',
                                //     icon: '/flag/gb.png'
                                // },
                                {
                                    label: '',
                                    value: 'Vietnamese',
                                    icon: '/flag/vn.png'
                                }
                            ]}
                            hideKey={true}
                            value={this.Ddvalue || 'Vietnamese'}
                            onChange={this.onChangeDd}
                        />
                    </div>
                    <input
                        className='input-text-sms'
                        placeholder='SMS'
                        onKeyPress={e => {
                            this.getKeyEnter(e)
                        }}
                        ref={dom => {
                            setTimeout(() => {
                                if (dom) {
                                    dom.focus();
                                }
                            }, 200)
                        }}
                        onChange={(event) => {
                            this.onChangeInput(event.target.value)
                        }}></input>
                </div>
            </div>
        } else {
            return <div className='content size--3'>
                <div className='row detail'>
                    <span className='firstLetterUpperCase'><Lang>{this.props.middleText}</Lang></span>
                </div>
                <div className={`styleErrorPopup size--3 ${this.state.error ? '' : 'hidden'}`}><Lang>{(this.state.error ? 'error_code_' : '') + this.state.error}</Lang></div>
                <div className='row'>
                    <input
                        className='input-text-email'
                        placeholder='Email'
                        onKeyPress={e => {
                            this.getKeyEnter(e)
                        }}
                        ref={dom => {
                            setTimeout(() => {
                                if (dom) {
                                    dom.focus();
                                }
                            }, 200)
                        }}
                        onChange={(event) => {
                            this.onChangeInput(event.target.value)
                        }}></input>
                </div>
            </div>
        }
    }
    onChangeDd = (value) => {
        this.Ddvalue = value
        if (this.timeOutID) clearTimeout(this.timeOutID)
        this.timeOutID = setTimeout(() => {
            if (!this.value.length) this.setState({ emailEmpty: true })
            else this.setState({ emailEmpty: false })
        }, 300)
    }
    onChangeInput = (value) => {
        this.value = value
        if (this.timeOutID) clearTimeout(this.timeOutID)
        this.timeOutID = setTimeout(() => {
            if (!this.value.length) this.setState({ emailEmpty: true })
            else this.setState({ emailEmpty: false })
        }, 300)
    }
    modifyEmailAlert() {
        if (!this.state.connected || this.state.emailEmpty) return
        const patternCheckMail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/
        if (this.value && patternCheckMail.test(this.value) && this.value.length < 255) {
            let obj = {
                'data': {
                    'email_alert': this.value
                }
            }
            const url = getUrlEditEmailNoti(this.props.paramId)
            putData(url, obj)
                .then(response => {
                    this.props.close();
                })
                .catch(error => {
                    this.setState({
                        error: error.response.errorCode
                    }, () => this.hiddenWarning())
                })
        } else {
            this.setState({
                error: '2004'
            }, () => this.hiddenWarning())
        }
    }
    modifySmsAlert() {
        if (!this.state.connected || this.state.emailEmpty) return

        if (this.value && this.value.length < 255) {
            let obj = {
                'data': {
                    'sms_alert': this.value,
                    'code': '(+84)'
                }
            }
            let url = getUrlEditSmsNoti(this.props.paramId);
            putData(url, obj)
                .then(response => {
                    this.props.close();
                })
                .catch(error => {
                    this.setState({
                        error: error.response.errorCode
                    }, () => this.hiddenWarning())
                })
        } else {
            this.setState({
                error: '2004'
            }, () => this.hiddenWarning())
        }
    }

    hiddenWarning = () => {
        try {
            setTimeout(() => {
                this.setState({ error: '' })
            }, 4000)
        } catch (error) {
            logger.error('hiddenWarning On EditEmailNotificaton ' + error)
        }
    }
    renderFooter() {
        return <div className='footer confirmBtnRoot btn-group text-uppercase'>
            <Button type={buttonType.danger} className='btn' onClick={() => this.props.close()}>
                <SvgIcon path={path.mdiClose} />
                <span><Lang>lang_cancel</Lang></span>
            </Button>
            <Button type={buttonType.success} disabled={!this.state.connected || this.state.emailEmpty} className='btn' onClick={() => {
                if (this.props.isSmsNoti) {
                    this.modifySmsAlert()
                } else {
                    this.modifyEmailAlert()
                }
            }}>
                <SvgIcon path={path.mdiCheck} />
                <span><Lang>lang_ok</Lang></span>
            </Button>
        </div >
    }
    changeConnection = connect => {
        this.setState({
            connected: connect
        })
    }
    componentDidMount() {
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection);
    }
    componentWillUnmount() {
        this.emitConnectionID && this.emitConnectionID.remove();
    }
    render() {
        return <div className='confirmUserGroupManagement editEmailAlert'>
            {this.renderHeader()}
            {this.renderContent()}
            {this.renderFooter()}
        </div>
    }
}

export default EditEmailNotification
