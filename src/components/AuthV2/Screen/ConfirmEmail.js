import React from 'react';
import Lang from '../../Inc/Lang';
import Input from '../../Elements/Input';
import { sendVerifyUsernameUrl, verifyUsernameUrl, postData } from '../../../helper/request';
import logger from '../../../helper/log';
import dataStorage from '../../../dataStorage';
import { addEventListener, removeEventListener, EVENTNAME } from '../../../helper/event';
import s from './ConfirmEmail.module.css';
export default class Login extends React.Component {
    constructor(props) {
        super(props);
        props.setLabel(this.props.type === 'forgot_password' ? 'lang_guide_reset_password' : 'lang_activate_account');
        this.email = props.email || '';
        this.code = props.code || '';
        this.state = {
            count: 0,
            disabled: !this.email || !this.code,
            disabledSendCode: !this.email,
            connected: dataStorage.connected
        };
        addEventListener(EVENTNAME.connectionChanged, this.connectionChanged);
    }
    connectionChanged = (connected) => {
        this.setState({ connected: connected });
    }
    inputChanged = (e) => {
        if (e.target.name === 'email') {
            this.email = e && e.target.value
        }
        if (e.target.name === 'code') {
            this.code = e && e.target.value
        }
        const state = {}
        const disabled = !this.email || !this.code;
        if (this.state.disabled !== disabled) state.disabled = disabled
        if (this.state.disabledSendCode !== !this.email) state.disabledSendCode = !this.email;
        if (Object.keys(state).length) this.setState(state);
    }
    sendCode = () => {
        if (this.state.count || this.state.disabledSendCode || !this.state.connected) return;
        if (!this.email) return;
        const data = {
            user_login_id: (this.email || '').trim(),
            type: this.props.type
        }
        try {
            const url = sendVerifyUsernameUrl(this.props.envConfig);
            let count = 60;
            postData(url, { data }).then(res => { }).catch(err => {
                count = 0;
                let errorCode = err.response && err.response.errorCode;
                if (Array.isArray(errorCode)) errorCode = errorCode[0]
                this.props.showError(dataStorage.translate(isNaN(+errorCode) ? errorCode : `error_code_${errorCode}`));
                logger.log('Error in sendCode: ', err)
            });
            this.setState({ count: count });
            const id = setInterval(() => {
                if (count) count--;
                if (count <= 0) clearInterval(id);
                this.setState({ count: count });
            }, 1000);
        } catch (error) {
            logger.log('Error in sendCode: ', error)
        }
    }
    consfirmEmail = () => {
        if (this.state.disabled || !this.state.connected) return;
        if (this.code.length !== 6 || !(+this.code)) {
            this.props.showError(dataStorage.translate('lang_invalid_digit_code'));
            return;
        }
        const url = verifyUsernameUrl(this.props.envConfig);
        const data = {
            user_login_id: (this.email + '').trim(),
            verify_code: this.code,
            type: this.props.type
        }
        postData(url, { data }).then(res => {
            if (res.errorTimeOut) {
                this.props.showError(dataStorage.translate('error_code_2000'));
            } else {
                this.props.goTo('createPassword', {
                    allowCancel: this.props.type === 'forgot_password',
                    title: this.props.type === 'forgot_password' ? 'lang_guide_reset_password' : 'lang_choose_a_password',
                    description: this.props.type === 'forgot_password' ? 'lang_desceiption_reset_pass' : 'lang_change_pass_security',
                    token: res && res.data && res.data.token,
                    email: this.email,
                    type: this.props.type
                });
            }
        }).catch(err => {
            let errorCode = err.response && err.response.errorCode;
            if (Array.isArray(errorCode)) errorCode = errorCode[0]
            this.props.showError(dataStorage.translate(isNaN(+errorCode) ? errorCode : `error_code_${errorCode}`));
            logger.log('consfirmEmail Error: ', err)
        })
    }
    componentWillUnmount() {
        removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged);
    }
    render() {
        return <div className={s.container}>
            <div className={s.form}>
                <div className={s.field}>
                    <div className={s.inputGroup}>
                        <Input className={s.formInput} onChange={this.inputChanged} autoFocus required type='username' name='email' placeholder='Email' defaultValue={this.email} />
                        <div className={s.submit + (this.state.count || this.state.disabledSendCode || !this.state.connected ? ' ' + s.disabled : '') + ' ' + 'text-capitalize'} onClick={this.sendCode}>{this.state.count || <Lang>lang_send_Code</Lang>}</div>
                    </div>
                </div>
                <div className={s.field}>
                    <Input className={s.formInput} onChange={this.inputChanged} required type='text' name='code' placeholder={dataStorage.translate('lang_enter_code')} defaultValue={this.code} />
                </div>
                <div className={s.buttonGroup}>
                    <div className={s.submit + (this.state.disabled || !this.state.connected ? ' ' + s.disabled : '') + ' ' + 'text-capitalize'} onClick={this.consfirmEmail}><Lang>lang_confirm</Lang></div>
                    <div className={s.cancel + ' ' + 'text-capitalize'} onClick={() => this.props.goTo('login')}><Lang>lang_cancel</Lang></div>
                </div>
            </div>
        </div>
    }
}
