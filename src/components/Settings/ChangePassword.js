import React from 'react';
import Icon from '../Inc/Icon';
import Lang from '../Inc/Lang';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage'
import { func } from '../../storage';
import Form from 'react-jsonschema-form';
import extraFields from 'react-jsonschema-form-extras';
import PasswordField from '../CustomField/passwordField';
import { postData, getChangePasswordlUrl } from '../../helper/request';
import { ObjectFieldTemplate } from '../CustomField/objectFieldTemplate';
import { getSecretKey } from '../../helper/functionUtils';
import { emitter, eventEmitter } from '../../constants/emitter_enum';
import CryptoJS from 'react-native-crypto-js';

const fields = Object.assign(extraFields, { passwordField: PasswordField });

const patternCheckPass = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z].{7,}$/ // eslint-disable-line

const initSchema = {
    schema: {
        title: '',
        type: 'object',
        required: [],
        properties: {
            'currentPassword': {
                type: 'string'
            },
            'newPassword': {
                type: 'string'
            },
            'confirmPassword': {
                type: 'string'
            }
        }
    },
    uiSchema: {
        currentPassword: {
            classNames: 'currentPassword',
            'ui:field': 'passwordField',
            'ui:placeholder': 'lang_current_password'
        },
        newPassword: {
            classNames: 'newPassword',
            'ui:field': 'passwordField',
            'ui:placeholder': 'lang_new_password'
        },
        confirmPassword: {
            classNames: 'confirmPassword',
            'ui:field': 'passwordField',
            'ui:placeholder': 'lang_confirm_new_password'
        }
    },
    formData: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    }
}

class ChangePassword extends React.Component {
    constructor(props) {
        super(props);
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        window.turnOnEncrypt = true;
        this.state = {
            isConnected: dataStorage.connected,
            isLoading: false,
            error: '',
            isOk: false,
            formData: initSchema.formData,
            animationClass: ''
        }
    }

    componentDidMount() {
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
        this.setState({
            animationClass: 'fadeInAnimation'
        })
    }

    changeConnection(isConnected) {
        this.setState({ isConnected })
    }

    componentWillUnmount() {
        this.emitConnectionID && this.emitConnectionID.remove();
    }

    transformErrors(errors) {
        return errors.map(error => {
            switch (error.name) {
                case 'pattern':
                    switch (error.property) {
                        case "['newPassword']": error.message = this.props.t('lang_phone_invalid'); break;
                    }
                    break;
                case 'required':
                    switch (error.property) {
                    }
            }
            return error;
        });
    }

    onChange(data) {
        const formData = data.formData || {};
        const curData = this.state.formData;
        const { currentPassword, newPassword, confirmPassword } = formData;
        let index = 0;
        if (currentPassword !== curData.currentPassword) {
            index = 1;
        }
        if (newPassword !== curData.newPassword) {
            index = 2;
        }
        if (confirmPassword !== curData.confirmPassword) {
            index = 3;
        }
        let isOk = !!(currentPassword && newPassword && confirmPassword);
        this.setState({ formData: data.formData, isOk }, () => {
            this.checkValidate(false, index);
        })
    }

    onSubmit(data) {
        const userInfo = dataStorage.userInfo;
        if (!userInfo || !userInfo.user_login_id) return;
        const { currentPassword, newPassword } = data.formData;
        const url = getChangePasswordlUrl(userInfo.user_login_id);
        getSecretKey().then(() => {
            const config = dataStorage.env_config
            const data = {
                user_login_id: userInfo.user_login_id,
                old_password: dataStorage.session ? CryptoJS.AES.encrypt(currentPassword, dataStorage.session[config.env].key).toString() : currentPassword,
                password: dataStorage.session ? CryptoJS.AES.encrypt(newPassword, dataStorage.session[config.env].key).toString() : newPassword
            }
            if (dataStorage.session) data.session_id = dataStorage.session[config.env].id;
            dataStorage.isChangePassword = true
            postData(url, {
                data: data
            }).then(res => {
                window.turnOnEncrypt = false;
                this.setState({ isLoading: false })
                this.props.changeTitle && this.props.changeTitle(true)
                logger.log('Change password success');
            }).catch(error => {
                const errorCode = (error && error.response && error.response.errorCode) || 'UNKNOWN_ERROR'
                this.setState({ error: `error_code_${errorCode}`, isLoading: false })
                logger.log('Change password failure');
            })
        });
    }

    checkValidate(forceCheck, index) {
        const { newPassword, confirmPassword } = this.state.formData;
        if (forceCheck || (newPassword && newPassword.length >= 8) || (confirmPassword && confirmPassword.length >= 8)) {
            if (!newPassword.match(patternCheckPass)) {
                this.setState({ error: 'lang_new_password_invalid' })
                return false;
            }
            if (index) {
                if (index === 3 && confirmPassword.length >= newPassword.length && confirmPassword !== newPassword) {
                    this.setState({ error: 'lang_password_not_match' })
                    return false
                }
                if (index === 2 && confirmPassword.length >= 8 && confirmPassword !== newPassword) {
                    this.setState({ error: 'lang_password_not_match' })
                    return false
                }
            } else {
                if (confirmPassword !== newPassword) {
                    this.setState({ error: 'lang_password_not_match' })
                    return false
                }
            }
        }
        this.setState({ error: '', isLoading: forceCheck })
        return true;
    }

    onClick = () => {
        const check = this.checkValidate(true);
        check && this.submitButton && this.submitButton.click();
    }
    nothingWorking = () => {
    }

    onCancel() {
        this.setState({
            animationClass: 'fadeOutAnimation'
        })
        setTimeout(() => {
            this.props.changeTitle && this.props.changeTitle(false)
        }, 400)
    }

    render() {
        const { error, formData, isOk, isConnected, isLoading } = this.state;
        return (
            <div ref={dom => this.dom = dom} className={`changePasswordContainer ${error} ${this.state.animationClass}`}>
                <div className='changepasswordTitle changepasswordText size--4 text-capitalize'><Lang>lang_change_your_password</Lang></div>
                <div style={{ padding: '16px 16px 0 16px' }}>
                    <Form fields={fields}
                        schema={initSchema.schema}
                        uiSchema={initSchema.uiSchema}
                        formData={formData}
                        ObjectFieldTemplate={ObjectFieldTemplate}
                        transformErrors={errors => this.transformErrors(errors)}
                        liveValidate={!!formData.currentPassword}
                        autocomplete="off"
                        onChange={this.onChange.bind(this)}
                        onSubmit={this.onSubmit.bind(this)}
                        noHtml5Validate={true}
                        showErrorList={false}
                    >
                        {
                            error ? <div className='changepasswordError size--3'>
                                <Lang>{error}</Lang>
                            </div> : null
                        }
                        <button type='submit' ref={(btn) => {
                            this.submitButton = btn
                        }} className="hidden" />
                    </Form>
                </div>
                <div className='changePasswordConfirm'>
                    <div style={{ marginRight: 8 }} onClick={this.onCancel.bind(this)} className={isLoading ? 'disableBtn' : 'enableBtn'}>
                        <Icon className='icon' src='navigation/close' color='#ffffff' />
                        <div className='changepasswordText size--4 text-uppercase'><Lang>lang_cancel</Lang></div>
                    </div>
                    <div style={{ marginLeft: 8 }} className={isOk && !isLoading && isConnected ? 'enableBtn setting-changePass' : 'disableBtn'}
                        onClick={isOk && !isLoading && isConnected ? this.onClick : this.nothingWorking}>
                        {
                            isLoading ? <img className='icon' src='common/Spinner-white.svg' />
                                : <Icon className='icon' src='navigation/check' color='#ffffff' />
                        }
                        <div className='changepasswordText size--4 text-uppercase'><Lang>lang_ok</Lang></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ChangePassword;
