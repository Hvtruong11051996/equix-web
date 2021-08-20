import React from 'react';
import SvgIcon, { path } from '../../Inc/SvgIcon';
import Lang from '../../Inc/Lang';
import DropDown from '../../DropDown/DropDown';
import callList from '../../../constants/calling_code'
import s from './Dropdown.module.css';
import Error from '../Error/Error'
import Validator from '../../Inc/Validation/validate'
import dataStorage from '../../../dataStorage'
import countryOptions from '../../../constants/country_options'

export default class Dropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        if (this.props.defaultValue) {
            this.props.onChange && this.props.onChange(this.props.defaultValue)
        }
    }

    onChange = (value) => {
        this.props.onChange && this.props.onChange(value)
    }

    render() {
        return <div className={s.input + (this.props.className ? ' ' + this.props.className : '') + ' ' + (this.props.disable ? s.disable : '')}
            style={this.props.style} ref={dom => this.dom = dom}>
            <DropDown
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                }}
                placeholder={this.props.placeholder}
                placeholderStyle={{
                    color: 'var(--secondary-dark)'
                }}
                disable={this.props.disable}
                value={this.props.defaultValue}
                onChange={this.onChange}
                path={path.mdiMenuDown}
                translate={false}
                options={countryOptions}
            />
            <div className={s.border1}></div>
            <div className={s.border2}></div>
            <Error fn={fn => this.showError = fn.showError} />
        </div>
    }
}
