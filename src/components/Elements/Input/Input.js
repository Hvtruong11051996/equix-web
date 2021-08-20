import React from 'react';
import SvgIcon, { path } from '../../Inc/SvgIcon';
import Lang from '../../Inc/Lang';
import Error from '../Error/Error'
import s from './Input.module.css';
import { trimAll } from '../../../helper/functionUtils'
import Validator from '../../Inc/Validation/validate'
import dataStorage from '../../../dataStorage'

export default class Input extends React.Component {
    constructor(props) {
        super(props);
        this.defaultValue = props.defaultValue
        this.state = {
            reveal: false
        }
    }
    renderIcon = () => {
        if (this.props.type === 'username') {
            return <SvgIcon path={path.mdiClose} onClick={() => {
                const input = this.dom && this.dom.querySelector('input');
                if (!input) return;
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                nativeInputValueSetter.call(input, '');
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }} />
        }
        if (this.props.type === 'password') {
            return <SvgIcon path={this.state.reveal ? path.mdiEyeOff : path.mdiEye} onClick={() => {
                const input = this.dom && this.dom.querySelector('input');
                if (!input) return;
                if (this.state.reveal) input.type = 'password';
                else input.type = 'text';
                this.setState({ reveal: !this.state.reveal });
            }} />
        }
        return ''
    }

    onChange = (e) => {
        let errCount = 0
        switch (this.props.validate) {
            case 'email':
                if (e.target.value) {
                    if (Validator.EMAIL.regex.test(e.target.value)) {
                        this.showError && this.showError('')
                    } else this.showError && this.showError(dataStorage.translate(Validator.EMAIL.error))
                } else if (this.props.required) {
                    this.showError && this.showError(`${(this.props.placeholder)} is required`)
                } else this.showError && this.showError('')
                break
            default:
                if (this.props.required) {
                    const value = trimAll(e.target.value)
                    if (!value) this.showError && this.showError(`${(this.props.placeholder)} is required`)
                    else this.showError && this.showError('')
                }
        }
        this.props.onChange(e)
    }
    showError = (err) => {
        if (err.length) {
            this.showErrorForm(err)
            this.dom.classList.add('haveErrorSignUp')
        } else {
            this.showErrorForm('')
            this.dom.classList.remove('haveErrorSignUp')
        }
    }

    render() {
        const inputProps = { ...this.props };
        delete inputProps.style;
        delete inputProps.className;
        inputProps.placeholder = `${this.props.placeholder}${this.props.required ? ' *' : ''}`
        delete inputProps.onChange;
        return <div className={s.input + (this.props.className ? ' ' + this.props.className : '')} style={this.props.style} ref={dom => this.dom = dom}>
            <input autoComplete={this.defaultValue ? 'new-password' : 'on'} {...inputProps} onBlur={this.onChange} onChange={this.onChange} required defaultValue={this.defaultValue} />
            <div className={s.border1}></div>
            <div className={s.border2}></div>
            {/* <div className={s.placeholder + ' ' + 'text-capitalize'}>{this.props.placeholder}{this.props.required ? ' *' : ''}</div> */}
            <div className={s.floatIcon}>{this.renderIcon()}</div>
            <Error fn={fn => this.showErrorForm = fn.showError} />
        </div>
    }
}
