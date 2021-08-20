import React from 'react';
import DropDown from '../../DropDown/DropDown';
import SvgIcon, { path } from '../../Inc/SvgIcon';
import callList from '../../../constants/calling_code'
import s from './Phone.module.css';
import Error from '../Error/Error'
import Validator from '../../Inc/Validation/validate'
import dataStorage from '../../../dataStorage'

export default class Phone extends React.Component {
    constructor(props) {
        super(props);
        const config = dataStorage.web_config[dataStorage.web_config.common.project]
        const defaultCountry = config.countryCode && config.phoneCode ? { countryCode: config.countryCode, phoneCode: config.phoneCode } : { countryCode: 'au', phoneCode: 61 }
        this.dicData = callList.reduce((acc, cur) => {
            if (cur.value && cur.phoneCode) acc[cur.value] = cur.phoneCode
            return acc
        }, {})
        this.state = {
            countryCode: defaultCountry.countryCode,
            phoneCode: defaultCountry.phoneCode
        }
    }

    onChangeCountry = (countryCode) => {
        const phoneCode = this.dicData[countryCode]
        if (!phoneCode) return
        this.setState({ countryCode, phoneCode })
    }

    onChange = (e) => {
        if (e.target.value) {
            if (Validator.PHONE.regex.test(e.target.value)) {
                this.showError && this.showError('')
            } else {
                this.showError && this.showError(dataStorage.translate(Validator.PHONE.error))
            }
        } else if (this.props.required) {
            this.showError && this.showError(`${this.props.placeholder} is required`)
        } else this.showError && this.showError('')
        const value = e.target.value ? `${this.state.countryCode}|${e.target.value}` : ''
        this.props.onChange && this.props.onChange(value)
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
        delete inputProps.placeholder;
        delete inputProps.onChange;
        return <div className={s.input + (this.props.className ? ' ' + this.props.className : '')}
            style={this.props.style} ref={dom => this.dom = dom}>
            <div className={s.dropdown}>
                <DropDown
                    options={callList}
                    hideKey={true}
                    value={this.state.countryCode}
                    onChange={this.onChangeCountry}
                    path={path.mdiMenuDown}
                    floatLeft={true}
                />
            </div>
            <div className={s.phoneCode}>{`+${this.state.phoneCode}`}</div>
            <input className='placeHolder-capitalize' {...inputProps} onBlur={this.onChange} onChange={this.onChange} required maxLength={16}
                placeholder={this.props.placeholder + (this.props.required ? ' *' : '')}
            />
            <div className={s.border1}></div>
            <div className={s.border2}></div>
            <Error fn={fn => this.showErrorForm = fn.showError} />
        </div>
    }
}
