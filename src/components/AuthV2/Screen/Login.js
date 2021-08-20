import React from 'react';
import Lang from '../../Inc/Lang';
import showConfirm from '../../Inc/Confirm';
import showWarning from '../../Inc/Warning';
import showModal from '../../Inc/Modal';
import Checkbox from '../../Elements/Checkbox';
import Input from '../../Elements/Input';
import Pin from '../../Pin';
import { login, postPin, postDecode, autoRefreshToken } from '../../../helper/api';
import logger from '../../../helper/log';
import { setEnvConfig, todo, saveDataWhenChangeEnv } from '../../../helper/functionUtils';
import { afterLogin } from '../../../helper/loginFunction';
import dataStorage from '../../../dataStorage';
import requireTimeSetting from '../../../constants/require_time';
import { addEventListener, removeEventListener, EVENTNAME } from '../../../helper/event';
import s from './Login.module.css';
export default class Login extends React.Component {
    constructor(props) {
        super(props);
        props.setLabel('lang_sign_in_label');
        this.username = '';
        this.password = '';
        this.state = {
            disabled: true,
            connected: dataStorage.connected
        };
        addEventListener(EVENTNAME.connectionChanged, this.connectionChanged);
    }
    connectionChanged = (connected) => {
        this.setState({ connected: connected });
    }
    loginAction(email, password) {
        this.setState({ waiting: true });
        login(email, password, false, this.props.envConfig).then(response => {
            if (response && response.data && (response.data.accessToken || response.data.refreshToken)) {
                const data = response.data;
                const accessToken = data.accessToken;
                const refreshToken = data.refreshToken;
                dataStorage.loginEmail = email;
                localStorageNew.setItem('loginEmail', email, true)
                const time = localStorageNew ? localStorageNew.getItem(`requireTime_${email}`) : requireTimeSetting.ON_CHANGE;
                dataStorage.requireTime = time ? parseInt(time) : requireTimeSetting.ON_CHANGE;
                dataStorage.verifiedPin = false;
                localStorageNew.setItem('session_id', response.data.deviceID);
                localStorageNew.removeItem('last_session_id')
                localStorageNew.removeItem('showed_session_popup')
                if (accessToken) {
                    let refreshToken = localStorageNew.getItem(`${email}_refresh_token`);// remove nhung refresh token cu luu tren may
                    if (refreshToken) {
                        localStorageNew.removeItem(`${email}_refresh_token`);
                    }
                    showModal({
                        component: Pin,
                        props: {
                            title: 'firstLogin',
                            done: (pin) => {
                                pin && todo(pin);
                                postPin(accessToken, pin, this.props.envConfig).then(response => {
                                    this.props.envConfig.api.backendBase = 'https://' + response.data.baseUrl
                                    setEnvConfig(this.props.envConfig.env)
                                    logger.sendLog(`POST PIN email: ${dataStorage.loginEmail} PIN: ${pin}`)
                                    if (response.data) {
                                        const data = response.data;
                                        const accessToken = data.accessToken;
                                        dataStorage.accessToken = accessToken;
                                        logger.log('CHECK TOKEN ===> Login loginAction showModal postPin SET NEW TOKEN: ', dataStorage);
                                        const tokenKey = `${dataStorage.loginEmail}_refresh_token`;
                                        localStorageNew && localStorageNew.setItem(tokenKey, response.data.refreshToken);
                                        afterLogin(() => {
                                            saveDataWhenChangeEnv();
                                            dataStorage.isGuest = false;
                                            dataStorage.goldenLayout.initGoldenLayout();
                                            this.setState({ waiting: false });
                                            this.props.close();
                                        }, () => {
                                            this.disableClose = false
                                        });
                                        postDecode(response.data.pin, response.data.refreshToken, this.props.envConfig).then(res => {
                                            if (res.data) {
                                                const dataResfresh = res.data;
                                                autoRefreshToken(dataResfresh.token);
                                            }
                                        }).catch(error => {
                                            if (error.response && error.response.errorCode === 2089) {
                                                localStorageNew.removeItem('isStayLogin', true);
                                                showWarning({
                                                    message: 'lang_pin_expired',
                                                    callback: () => {
                                                        window.location.reload();
                                                    }
                                                });
                                            }
                                            this.disableClose = false
                                            logger.error(error)
                                        })
                                    }
                                }).catch(error => {
                                    this.disableClose = false
                                    logger.error(error)
                                    let errorCode = error.response && error.response.errorCode;
                                    errorCode = Array.isArray(errorCode) ? errorCode[0] : errorCode;
                                    if (+errorCode === 2089) {
                                        this.props.close && this.props.close();
                                        showConfirm({
                                            checkWindowLoggedOut: true,
                                            message: 'lang_pin_request_expired',
                                            callback: () => {
                                                window.location.reload();
                                            }
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
                if (refreshToken) {
                    setEnvConfig(this.props.envConfig.env)
                    setTimeout(() => {
                        const tokenKey = `${email}_refresh_token`;
                        localStorageNew && localStorageNew.setItem(tokenKey, refreshToken);
                        showModal({
                            component: Pin,
                            props: {
                                title: 'firstLogin',
                                canClose: false,
                                closeSuccess: this.props.close,
                                success: (pin) => {
                                    pin && todo(pin);
                                    this.isStay && localStorageNew.setItem('isStayLogin', this.isStay, true)
                                    dataStorage.isStayLogin = this.isStay;
                                    dataStorage.verifiedPin = true;
                                    dataStorage.goldenLayout.initGoldenLayout(null, this.props.close);
                                    this.setState({ waiting: false });
                                }
                            }
                        });
                        dataStorage.tokenRefresh = refreshToken
                        dataStorage.intervalRefreshToken && clearInterval(dataStorage.intervalRefreshToken)
                    }, 1000)
                }
            } else {
                this.setState({
                    err: 'UNKNOWN_ERROR',
                    showErr: true,
                    loader: false
                })
                logger.sendLog('can not get refreshToken', JSON.stringify(response && response.data))
            }
            this.disableClose = false
        }).catch(error => {
            console.error(error);
            this.disableClose = false
            this.setState({ waiting: false });
            let errorCode = error && error.response && error.response.errorCode;
            const token = error && error.response && error.response.token;
            errorCode = errorCode && parseInt(errorCode) ? errorCode : '2000';
            if (+errorCode === 2059 || +errorCode === 2057) {
                this.props.goTo('createPassword', {
                    title: 'lang_choose_a_password',
                    description: +errorCode === 2059 ? 'lang_force_use_description' : 'lang_change_pass_security',
                    email: email,
                    token: token,
                    type: 'forgot_password'
                })
            } else {
                let err
                if (isNaN(+errorCode)) err = errorCode
                else {
                    err = `error_code_${errorCode}`;
                }
                this.props.showError(dataStorage.translate(err));
            }
        });
    }
    inputChanged = (e) => {
        if (e.target.name === 'username') {
            this.username = e && e.target.value
        }
        if (e.target.name === 'password') {
            this.password = e && e.target.value
        }
        const disabled = !this.username || !this.password;
        if (this.state.disabled !== disabled) this.setState({ disabled: disabled });
    }
    submitAction = (e) => {
        e.preventDefault();
        if (this.state.disabled || this.state.waiting || !this.state.connected) return;
        try {
            if (!this.username || !this.password) return;
            this.loginAction((this.username + '').trim(), this.password);
        } catch (error) {
            logger.error('login error: ' + error)
        }
    }
    componentDidMount() {
        if (this.props.username && this.props.password) {
            this.loginAction(this.props.username, this.props.password);
        }
    }
    componentWillUnmount() {
        removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged);
    }
    render() {
        return <form action='' method='post' onSubmit={this.submitAction} ref={dom => this.outerWrapperRef = dom} noValidate>
            <div className={s.container}>
                <div className={s.form}>
                    <div className={s.field}>
                        <Input className={s.formInput} onChange={(e) => this.inputChanged(e)} autoFocus type='username' name='username' placeholder='Email' defaultValue={this.props.params && this.props.params.username} />
                    </div>
                    <div className={s.field}>
                        <Input className={s.formInput} onChange={(e) => this.inputChanged(e)} type='password' name='password' placeholder='Password' defaultValue={this.props.password} />
                    </div>
                    <Checkbox className={s.formCheckbox} label='lang_stay_signed_in' onChange={value => this.isStay = value} />
                    <input type="submit" style={{ display: 'none' }} ref={dom => this.submit = dom} />
                    <div className={s.submit + (this.state.disabled || this.state.waiting || !this.state.connected ? ' ' + s.disabled : '')} onClick={() => this.submit && this.submit.click()}>
                        {this.state.waiting ? <img src='common/Spinner-white.svg' /> : <div className='text-capitalize'><Lang>lang_sign_in</Lang> (<span>{this.props.demo ? <Lang>{this.props.envConfig.envName || 'lang_demo'}</Lang> : <Lang>{this.props.envConfig.envName || 'lang_live'}</Lang>}</span>)</div>}
                    </div>
                </div>
                <div className={s.ref}><span onClick={() => this.props.goTo('signup')} className={s.link + ' ' + 'text-capitalize'}><Lang>lang_sign_up</Lang></span>  |  <span className={s.link + ' ' + 'firstLetterUpperCase'} onClick={() => this.props.goTo('confirmEmail', { type: 'forgot_password' })}><Lang>lang_ask_forgot_password</Lang></span>  |  <span className={s.link + ' ' + 'firstLetterUpperCase'} onClick={() => this.props.goTo('confirmEmail', { type: 'sign_up' })}><Lang>lang_activate_account</Lang></span></div>
            </div>
        </form>
    }
}
