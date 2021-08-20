import React from 'react'
import Lang from '../../Inc/Lang'
import dataStorage from '../../../dataStorage'
import Form, { TYPE } from '../../Inc/Form/Form'
import showModal from '../../Inc/Modal';
import s from './SignUp.module.css'
import Input from '../../Elements/Input';
import Phone from '../../Elements/Phone';
import DateInput from '../../Elements/DateInput';
import Address from '../../Elements/Address';
import Dropdown from '../../Elements/Dropdown';
import Checkbox from '../../Elements/Checkbox';
import SignUpSuccess from './SignUpSuccess'
import { getData, postData, getSignUpUrl, getUrlAddressMetaData } from '../../../helper/request'
import { addEventListener, removeEventListener, EVENTNAME } from '../../../helper/event';
import { trimAll, translateByEnvVariable } from '../../../helper/functionUtils'
import Terms from '../../../../Terms/Terms';
import CryptoJS from 'react-native-crypto-js';

const FIELD = {
    FIRST_NAME: 'first_name',
    MIDDLE_NAME: 'middle_name',
    LAST_NAME: 'last_name',
    DOB: 'dob',
    PHONE_NUMBER: 'phone',
    COUNTRY: 'country',
    ADDRESS: 'address',
    USER_NAME: 'user_login_id',
    RECAPTCHA: 'recaptcha'
}

class SignUp extends React.Component {
    constructor(props) {
        super(props)
        props.setLabel('lang_join_us_now_signup');
        this.isFirst = true
        this.isAccept = false
        this.state = {
            disabled: true,
            waiting: false,
            connected: dataStorage.connected
        }
        this.data = {};
    }

    connectionChanged = (connected) => {
        this.setState({ connected: connected });
    }

    componentWillUnmount() {
        removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged);
        removeEventListener(EVENTNAME.themeChanged, this.themeChanged)
    }

    componentDidMount() {
        addEventListener(EVENTNAME.connectionChanged, this.connectionChanged);
        addEventListener(EVENTNAME.themeChanged, this.themeChanged)
    }

    isEmpty = (value) => {
        return ['', null, undefined].includes(value)
    }

    onChange(field, e) {
        if (field === FIELD.ADDRESS) {
            this.data.addressId = e.id;
            this.data.full_address = e.full_address || '';
        } else {
            const value = e.target ? e.target.value : (e || '')
            this.data[field] = trimAll(value)
        }
        this.checkDisableButton()
    }

    renderForm() {
        return <div className={s.fakeScrollContainer}>
            <div className={s.form + ' ' + (this.state.waiting ? s.submitting : '')}>
                <div className={s.field}>
                    <Input className={s.formInput} onChange={(e) => this.onChange(FIELD.USER_NAME, e)} autoFocus required defaultValue={this.props.email} validate='email' maxLength={100} placeholder={dataStorage.translate('lang_email_address')} />
                </div>
                <div className={s.field}>
                    <Input className={s.formInput} onChange={(e) => this.onChange(FIELD.FIRST_NAME, e)} required maxLength={80} placeholder={dataStorage.translate('lang_first_name')} />
                </div>
                <div className={s.field}>
                    <Input className={s.formInput} onChange={(e) => this.onChange(FIELD.MIDDLE_NAME, e)} maxLength={80} placeholder={dataStorage.translate('lang_middle_name')} />
                </div>
                <div className={s.field}>
                    <Input className={s.formInput} onChange={(e) => this.onChange(FIELD.LAST_NAME, e)} required maxLength={80} placeholder={dataStorage.translate('lang_last_name')} />
                </div>
                <div className={s.field}>
                    <DateInput className={s.formInput} onChange={(e) => this.onChange(FIELD.DOB, e)} required placeholder={dataStorage.translate('lang_date_of_birth')} limit={-0.1} />
                </div>
                <div className={s.field}>
                    <Phone className={s.formInput} onChange={(e) => this.onChange(FIELD.PHONE_NUMBER, e)} required placeholder={dataStorage.translate('lang_phone_number')} />
                </div>
                <div className={s.field}>
                    <Dropdown className={s.formInput} disable defaultValue={'AUSTRALIA'} onChange={(e) => this.onChange(FIELD.COUNTRY, e)} placeholder={dataStorage.translate('lang_country')} />
                </div>
                <div className={s.field}>
                    <Address className={s.formInput} onChange={(e) => this.onChange(FIELD.ADDRESS, e)} envConfig={this.props.envConfig} maxLength={200} placeholder={dataStorage.translate('lang_address')} />
                </div>
            </div>
        </div>
    }
    checkDisableButton = () => {
        let checkError = (this.signUpRef && this.signUpRef.querySelectorAll('.haveErrorSignUp')) || 1
        const disabled = checkError.length || !this.isAccept || this.isEmpty(this.data[FIELD.RECAPTCHA]) || this.isEmpty(this.data[FIELD.FIRST_NAME]) || this.isEmpty(this.data[FIELD.LAST_NAME]) || this.isEmpty(this.data[FIELD.PHONE_NUMBER]) || this.isEmpty(this.data[FIELD.USER_NAME])
        if (this.state.disabled !== disabled) this.setState({ disabled: disabled });
    }

    onCallback = (token) => {
        // console.log('YOLO callback: ', token)
        this.data[FIELD.RECAPTCHA] = token
        this.checkDisableButton()
    }
    onExpiredCallback = (data) => {
        // console.log('YOLO expired callback: ', data)
        this.data[FIELD.RECAPTCHA] = null
        this.checkDisableButton()
    }
    onErrorCallback = (data) => {
        // console.log('YOLO error callback: ', data)
        this.data[FIELD.RECAPTCHA] = null
        this.checkDisableButton()
    }

    themeChanged = () => {
        grecaptcha.render('recaptcha', {
            sitekey: '6LdaBzEaAAAAAMP16MYvQI3mA4ReJv1k167rHSeS',
            callback: this.onCallback,
            theme: dataStorage.theme === 'theme-light' ? 'light' : 'dark',
            'expired-callback': this.onExpiredCallback,
            'error-callback': this.onErrorCallback
        });
    }

    renderCaptcha() {
        return <div ref={ref => {
            if (this.isFirst) {
                this.isFirst = false
                grecaptcha.render(ref, {
                    sitekey: '6LdaBzEaAAAAAMP16MYvQI3mA4ReJv1k167rHSeS',
                    callback: this.onCallback,
                    theme: dataStorage.theme === 'theme-light' ? 'light' : 'dark',
                    'expired-callback': this.onExpiredCallback,
                    'error-callback': this.onErrorCallback
                });
            }
        }} id='recaptcha' className={s.captchaContainer}></div>
    }

    renderbutton() {
        const isDisable = this.state.disabled || this.state.waiting || !this.state.connected
        return <div className={s.buttonContainer}>
            <input type="submit" style={{ display: 'none' }} ref={dom => this.submit = dom} />
            <div className={s.submit + ' ' + (isDisable ? s.disabled : '') + ' ' + 'firstLetterUpperCase'} onClick={() => !isDisable && this.submit && this.submit.click()}>
                {this.state.waiting ? <img src='common/Spinner-white.svg' /> : <Lang>lang_sign_up</Lang>}
            </div>
        </div>
    }

    renderFooter() {
        return <div className={s.footerContainer}>
            <div className={s.textBtn + ' ' + 'text-capitalize'} onClick={() => this.props.goTo('login')}><Lang>lang_sign_in</Lang></div>
            <div className={s.divide}>|</div>
            <div className={s.textBtn + ' ' + 'text-capitalize'} onClick={() => this.props.goTo('confirmEmail', { type: 'forgot_password' })}><Lang>lang_ask_forgot_password</Lang></div>
            <div className={s.divide}>|</div>
            <div className={s.textBtn + ' ' + 'text-capitalize'} onClick={() => this.props.goTo('confirmEmail', { type: 'sign_up' })}><Lang>lang_activate_account</Lang></div>
        </div>
    }

    submitAction = (e) => {
        e.preventDefault();
        try {
            if (this.state.waiting || !this.state.connected) return
            const catchFn = error => {
                grecaptcha.reset()
                this.data[FIELD.RECAPTCHA] = null
                this.checkDisableButton()
                this.setState({ waiting: false });
                if (error && error.response && error.response.errorCode) {
                    const errorText = `error_code_${error.response.errorCode}`
                    const text = dataStorage.translate(errorText) || 'Failed to create an account'
                    this.props.showError && this.props.showError(text)
                } else this.props.showError && this.props.showError('Failed to create an account')
            }
            const createUser = () => {
                Object.keys(this.data).forEach(key => {
                    if (!this.data[key]) delete this.data[key];
                });
                const envConfig = this.props.envConfig
                const url = getSignUpUrl(envConfig)
                if (!url) return
                postData(url, this.data).then(res => {
                    this.props.close && this.props.close()
                    showModal({
                        component: SignUpSuccess
                    });
                }).catch(catchFn)
            }
            if (this.data[FIELD.RECAPTCHA]) {
                this.setState({ waiting: true })
                if (this.data.addressId) {
                    const id = CryptoJS.AES.encrypt(this.data.addressId, 'QRPY36kzhjTNbQqF').toString();
                    const metaUrl = getUrlAddressMetaData(encodeURIComponent(id), this.props.envConfig);
                    getData(metaUrl).then((res) => {
                        delete this.data.addressId;
                        if (res.data && res.data.length) {
                            const obj = { ...res.data[0] }
                            delete obj.id;
                            Object.assign(this.data, obj);
                            console.log(res);
                        }
                        createUser();
                    }).catch(catchFn);
                } else {
                    createUser();
                }
            }
        } catch (error) {
            this.setState({ waiting: false });
            logger.error('login error: ' + error)
        }
    }

    onChangeAccept = () => {
        this.isAccept = !this.isAccept
        this.checkDisableButton()
    }

    showPolicy = () => {
        const policyLink = dataStorage.translate('lang_config_policy_link')
        if (policyLink) window.open(policyLink);
        else {
            showModal({
                component: Terms,
                className: 'allowNested',
                props: {
                    name: 'PrivacyPolicy'
                }
            });
        }
    }

    showTermsCondition = () => {
        showModal({
            component: Terms,
            className: 'allowNested',
            props: {
                name: 'TermsAndConditions',
                noAccBtn: true
            }
        });
    }

    renderAcceptBtn = () => {
        const env = dataStorage.web_config.common.project
        return <div className={s.acceptContainer + ' ' + 'showTitle'}>
            <Checkbox onChange={this.onChangeAccept} />
            <div style={!dataStorage.web_config[env].roles.noBreakWord ? { wordBreak: 'break-all' } : {}}>
                <Lang>{translateByEnvVariable('lang_agree_sign_up_policy', 'lang_config_product_name', 'productName')}</Lang>&nbsp;
                <span onClick={this.showPolicy} className={s.policyText + ' ' + 'text-capitalize'}>
                    <Lang>{dataStorage.web_config[env].roles.termSignUp ? 'lang_privacy_policy' : 'lang_privacy_policy_financial_services_guide'}</Lang>&nbsp;</span>
                <span>&nbsp;<Lang>lang_and</Lang>&nbsp;</span>
                <span onClick={this.showTermsCondition} className={s.policyText + ' ' + 'text-capitalize'}><Lang>lang_terms_and_conditions</Lang></span>
            </div>
        </div>
    }

    render() {
        return <form action='' method='post' onSubmit={this.submitAction} noValidate>
            <div ref={dom => this.signUpRef = dom} className={s.container}>
                {this.renderForm()}
                {this.renderCaptcha()}
                {this.renderAcceptBtn()}
                {this.renderbutton()}
                {this.renderFooter()}
            </div>
        </form>
    }
}

export default SignUp
