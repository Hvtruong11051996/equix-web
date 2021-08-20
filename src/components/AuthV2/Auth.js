import React from 'react';
import s from './Auth.module.css';
import Login from './Screen/Login';
import SignUp from './Screen/SignUp';
import ConfirmEmail from './Screen/ConfirmEmail';
import CreatePassword from './Screen/CreatePassword';
import dataStorage from '../../dataStorage';
import SvgIcon, { path } from '../Inc/SvgIcon';
import Lang from '../Inc/Lang';
import { addVerUrl } from '../../helper/functionUtils'

export default class Auth extends React.Component {
    constructor(props) {
        super(props);
        this.demoEnv = dataStorage.web_config.demo || {}
        this.liveEnv = dataStorage.web_config[dataStorage.web_config.common.project] || {}
        const isDemo = dataStorage.mode === 'demo'
        this.state = {
            activeEnv: isDemo ? this.demoEnv : (this.liveEnv || this.demoEnv || {}),
            envDisabled: this.props.data.isSignUp,
            demo: isDemo || !this.liveEnv
        }
        window.turnOnEncrypt = true;
        this.component = this.props.data && this.props.data.isSignUp ? SignUp : Login;
        this.params = {};
    }
    close = () => {
        window.turnOnEncrypt = false;
        this.setState({ show: false });
        setTimeout(() => {
            this.props.close && this.props.close();
        }, 300);
    }
    showError = (msg) => {
        setTimeout(() => {
            if (this.errorDom && msg) {
                this.errorDom.innerText = msg;
                this.errorDom.classList.add(s.active)
            }
        });
    }
    disableEnv = (disabled) => {
        this.setState({ envDisabled: disabled });
    }
    setMode = (isDemo) => {
        if (this.state.envDisabled) return;
        this.setState({
            demo: isDemo,
            activeEnv: isDemo ? this.demoEnv : this.liveEnv
        })
    }
    setLabel = (label, subLabel) => {
        this.setState({ label: label || '', subLabel: subLabel || '' });
    }
    goTo = (name, params) => {
        this.params = params || {};
        if (name === 'login') {
            this.component = Login;
        }
        if (name === 'signup') {
            this.component = SignUp;
        }
        if (name === 'confirmEmail') {
            this.component = ConfirmEmail;
        }
        if (name === 'createPassword') {
            this.component = CreatePassword;
        }
        this.disableEnv(!['login'].includes(name))
    }
    onClick = (e) => {
        if (this.errorDom && !this.errorDom.contains(e.target)) this.errorDom.classList.remove(s.active);
    }
    renderListLogo = () => {
        return <div className={s.logo}>
            {[this.demoEnv, this.liveEnv].map(item => {
                const logo = addVerUrl(dataStorage.theme === 'theme-dark' ? item.branding.logoDark : item.branding.logoLight)
                return <img key={item.env} className={this.state.activeEnv.env === item.env ? s.active : ''} src={logo} />
            })}
        </div>
    }
    componentDidMount() {
        setTimeout(() => {
            this.setState({ show: true });
        }, 10);
        if (this.props.goTo) {
            const params = this.props.params || {}
            const isDemo = dataStorage.mode === 'demo'
            const envConfig = isDemo ? this.demoEnv : this.liveEnv
            params && (params.env = envConfig.env)
            this.goTo(this.props.goTo, params);
            if (params.env) {
                if (envConfig) {
                    const state = {
                        activeEnv: envConfig
                    }
                    state.demo = isDemo
                    this.setState(state);
                }
            }
        }
    }
    render() {
        const Component = this.component;
        return <div className={s.container + (this.state.show ? ' ' + s.show : '')} onClick={this.onClick}>
            <div className={s.header}>
                {this.renderListLogo()}
                <div className={s.close} onClick={this.close}><SvgIcon path={path.mdiClose} /></div>
            </div>
            <div className={s.body}>
                <div className={s.error} ref={dom => this.errorDom = dom}></div>
                {this.state.label ? <div className={s.label + ' ' + `${['lang_guide_reset_password', 'lang_join_us_now_signup'].includes(this.state.label) ? 'firstLetterUpperCase' : 'text-capitalize'}`} ><Lang>{this.state.label}</Lang></div> : ''}
                {this.state.subLabel ? <div className={s.subLabel + ' ' + `${['lang_desceiption_reset_pass', 'lang_choose_a_password'].includes(this.state.label) ? 'firstLetterUpperCase' : 'text-capitalize'}`}><Lang>{this.state.subLabel}</Lang></div> : ''}
                <div className={s.switch + (this.state.demo ? ' ' + s.demo : '') + (this.state.envDisabled ? ' ' + s.disabled : '')}>
                    <div className={this.liveEnv ? '' : s.disableEnv} onClick={() => this.liveEnv && this.setMode(false)}><Lang>{(this.liveEnv && this.liveEnv.envName) || 'lang_live'}</Lang></div>
                    <div className={this.demoEnv ? '' : s.disableEnv} onClick={() => this.demoEnv && this.setMode(true)}><Lang>{(this.demoEnv && this.demoEnv.envName) || 'lang_demo'}</Lang></div>
                </div>
                <Component {...this.props} envConfig={this.state.activeEnv} showError={this.showError} close={this.props.close} setLabel={this.setLabel} goTo={this.goTo} {...this.params} demo={this.state.demo} />
            </div>
        </div>
    }
}
