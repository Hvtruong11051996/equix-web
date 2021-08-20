import React from 'react';
import Lang from '../../Inc/Lang/Lang';
import s from './Radio.module.css';

export default class Radio extends React.Component {
    checkChanged = () => {
        if (this.props.disabled || !this.dom || this.dom.checked) return;
        this.dom.checked = true;
        this.props.onChange && this.props.onChange(this.dom.value);
    }
    render() {
        const inputProps = { ...this.props };
        delete inputProps.style;
        delete inputProps.className;
        return <div className={s.radio + (this.props.disabled ? ' ' + s.disabled : '') + (this.props.className ? ' ' + this.props.className : '')} style={this.props.style} onClick={this.checkChanged}>
            <div className={s.icon}>
                <input {...inputProps} type="radio" ref={dom => this.dom = dom} defaultChecked={this.props.defaultChecked || this.props.checked} />
                <div></div>
            </div>
            {this.props.label ? <Lang>{this.props.label}</Lang> : ''}
        </div>
    }
}
