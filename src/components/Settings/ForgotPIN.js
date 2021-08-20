import React from 'react';
import Icon from '../Inc/Icon';
import Lang from '../Inc/Lang';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage'
import { setTimeout } from 'timers';
import { loginNew } from '../../helper/api';

class ForgotPIN extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            passwordValue: '',
            incorrectPassword: false,
            showForgotPIN: props.showForgotPIN || false,
            loader: false,
            type: 'password',
            animationClass: ''
        }
    }

    handleOnChange(e) {
        try {
            this.setState({
                passwordValue: e.target.value
            })
        } catch (error) {
            logger.error('handleOnChange On Settings' + error)
        }
    }

    handleCancelPassword() {
        try {
            this.setState({
                animationClass: 'fadeOutAnimation'
            });
            setTimeout(() => {
                this.props.changeTitle('Security');
            }, 400)
        } catch (error) {
            logger.error('handleCancelPassword On Settings' + error)
        }
    }
    hiddenError() {
        setTimeout(() => this.setState({
            incorrectPassword: false
        }), 4000)
    }

    handleOkPassword() {
        try {
            if (!this.state.passwordValue) return
            this.setState({
                loader: true
            })
            const email = dataStorage.loginEmail
            const password = this.state.passwordValue
            loginNew(email, password).then(response => {
                if (response && response.data && response.data.accessToken) {
                    const token = response.data.accessToken;
                    this.setState({
                        loader: false
                    });
                    this.props.changeTitle('Forgot PIN New PIN', token);
                } else {
                    this.setState({
                        loader: false,
                        incorrectPassword: true
                    }, () => this.hiddenError())
                }
            }).catch(error => {
                if ((+error.errorCode || +error.response.errorCode) === 2062) {
                    this.setState({
                        loader: false,
                        incorrectPassword: true
                    }, () => this.hiddenError())
                }
            })
        } catch (error) {
            logger.error('handleOkPassword On Settings' + error)
        }
    }

    handleOnFocus(e) {
        const element = e.target.parentElement.parentElement.parentElement.parentElement;
        element.classList.add('active');
    }

    handleOnBlur(e) {
        const element = e.target.parentElement.parentElement.parentElement.parentElement;
        element.classList.remove('active');
    }

    componentDidMount() {
        this.passInput && this.passInput.focus();
        this.setState({
            animationClass: 'fadeInAnimation'
        })
    }

    focusInnput() {
        this.passInput && this.passInput.focus();
    }

    handlePressOkButton(e) {
        if (e.keyCode === 13) {
            this.handleOkPassword()
        }
    }

    onClick() {
        if (this.state.type === 'text') {
            this.setState({ type: 'password' })
        } else {
            this.setState({ type: 'text' })
        }
    }

    render() {
        return (
            <div className={`rightSettings resetPinRow ${this.state.animationClass}`}>
                <div className='resetText size--4'>
                    <Lang>lang_reset_your_pin</Lang>
                </div>
                <div className='enterPasswordText size--3 firstLetterUpperCase'>
                    <Lang>lang_please_enter_your_password</Lang>
                </div>
                <div className='inputPassword'>
                    <input
                        ref={(input) => {
                            this.passInput = input
                        }}
                        id='userInputPassword' className='size--4' required
                        onBlur={this.handleOnBlur.bind(this)}
                        onKeyDown={this.handlePressOkButton.bind(this)}
                        onFocus={this.handleOnFocus.bind(this)}
                        type={this.state.type}
                        value={this.state.passwordValue}
                        onChange={this.handleOnChange.bind(this)}
                        autoComplete='off'
                    />
                    <div className='placeHolderPassword size--4 text-capitalize' onClick={this.focusInnput.bind(this)}><Lang>lang_password</Lang></div>
                    <Icon
                        src={this.state.type === 'password' ? 'image/remove-red-eye' : 'action/visibility-off'}
                        color='var(--secondary-default)'
                        onClick={this.onClick.bind(this)}
                        style={{ position: 'absolute', right: '25px', cursor: 'pointer' }}
                    />
                </div>
                <div className='incorrectText text-capitalize'>
                    {this.state.incorrectPassword ? <Lang>lang_incorrect_password</Lang> : null}
                </div>
                <div className='btn-group'>
                    <div style={{
                        display: 'flex',
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '4px 12px'
                    }} className={`btn btn size--4 btn-dask ${this.state.showForgotPIN ? 'disabled' : ''} text-uppercase`} onClick={this.state.showForgotPIN ? null : this.handleCancelPassword.bind(this)}>
                        <Icon
                            src={'navigation/close'}
                            color='#ffffff'
                            style={{ width: 20, height: 20 }}
                            className='icon'
                        />
                        <span><Lang>lang_cancel</Lang></span>
                    </div>
                    <div style={{ width: 16 }} />
                    {this.state.loader
                        ? <div style={{
                            display: 'flex',
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '4px 12px'
                        }} className='btn size--4' onClick={this.handleOkPassword.bind(this)}>
                            <img className='icon' src='common/Spinner-white.svg' />
                        </div>
                        : <div style={{
                            display: 'flex',
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '4px 12px'
                        }} className={`btn size--4 ${!this.state.passwordValue ? 'disabled' : ''} text-uppercase`} onClick={this.handleOkPassword.bind(this)}>
                            <Icon
                                src={'navigation/check'}
                                color='#ffffff'
                                style={{ width: 20, height: 20 }}
                                className='icon'
                            />
                            <span><Lang>lang_ok</Lang></span>
                        </div>
                    }

                </div>
            </div>

        )
    }
}

export default ForgotPIN;
