import React from 'react';
import Lang from '../../Inc/Lang';
import Input from '../../Elements/Input';
import { createPasswordUrl, postData } from '../../../helper/request';
import dataStorage from '../../../dataStorage';
import { addEventListener, removeEventListener, EVENTNAME } from '../../../helper/event';
import s from './CreatePassword.module.css';
export default class Login extends React.Component {
    constructor(props) {
        super(props);
        props.setLabel(props.title, props.description);
        this.password = '';
        this.confirmPassword = '';
        this.state = {
            disabled: true,
            connected: dataStorage.connected
        };
        addEventListener(EVENTNAME.connectionChanged, this.connectionChanged);
    }
    connectionChanged = (connected) => {
        this.setState({ connected: connected });
    }
    inputChanged = (e) => {
        if (e.target.name === 'password') {
            this.password = e && e.target.value
        }
        if (e.target.name === 'confirmPassword') {
            this.confirmPassword = e && e.target.value
        }
        const disabled = !this.password || !this.confirmPassword;
        if (this.state.disabled !== disabled) this.setState({ disabled: disabled });
    }

    submit = () => {
        if (this.state.disabled || !this.state.connected) return;
        if (this.confirmPassword !== this.password) {
            this.props.showError(dataStorage.translate('lang_password_dont_match'));
            return
        }
        const url = createPasswordUrl(this.props.envConfig);
        const data = {
            token: this.props.token,
            user_login_id: this.props.email,
            password: this.password
        }
        postData(url, { data }).then(res => {
            this.props.goTo('login', {
                username: this.props.email,
                password: this.password
            })
        }).catch(err => {
            let errorCode = err.response && err.response.errorCode;
            errorCode = Array.isArray(errorCode) ? errorCode[0] : errorCode
            this.props.showError(dataStorage.translate(isNaN(+errorCode) ? errorCode : `error_code_${errorCode}`));
        })
    }
    componentWillUnmount() {
        removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged);
    }
    render() {
        return <div className={s.container}>
            <div className={s.form}>
                <div className={s.field}>
                    <Input className={s.formInput} onChange={this.inputChanged} autoFocus required type='password' name='password' autocomplete="new-password" placeholder={dataStorage.translate('lang_password')} />
                </div>
                <div className={s.field}>
                    <Input className={s.formInput} onChange={this.inputChanged} required type='password' name='confirmPassword' placeholder={dataStorage.translate('lang_confirm_password')} />
                </div>
                <div className={s.buttonGroup}>
                    <div className={s.submit + (this.state.disabled || !this.state.connected ? ' ' + s.disabled : '') + ' ' + 'text-capitalize'} onClick={this.submit}><Lang>lang_change_password</Lang></div>
                    {this.props.allowCancel ? <div className={s.cancel + ' ' + 'text-capitalize'} onClick={() => this.props.goTo('login')}><Lang>lang_cancel</Lang></div> : ''}
                </div>
            </div>
        </div>
    }
}
