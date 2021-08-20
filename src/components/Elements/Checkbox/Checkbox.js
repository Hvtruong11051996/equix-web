import React from 'react';
import Lang from '../../Inc/Lang/Lang';
import SvgIcon, { path } from '../../Inc/SvgIcon';
import s from './Checkbox.module.css';
import dataStorage from '../../../dataStorage'

export default class Checkbox extends React.Component {
    checkChanged = () => {
        if (this.props.disabled || !this.dom) return;
        this.dom.checked = !this.dom.checked;
        this.props.onChange && this.props.onChange(this.dom.checked);
    }
    render() {
        let labelText = dataStorage.translate(this.props.label)
        // labelText = this.props.isRequire ? `* ${labelText}` : labelText
        return <div className={s.checkbox + (this.props.disabled ? ' ' + s.disabled : '') + (this.props.className ? ' ' + this.props.className : '')} style={this.props.style} onClick={this.checkChanged}>
            <div ref={ref => {
                this.props.setRef && this.props.setRef(ref)
            }}>
                <input type="checkbox" ref={dom => this.dom = dom} defaultChecked={this.props.defaultChecked || this.props.checked} />
                <SvgIcon path={path.mdiCheck} className={s.marked} />
            </div>
            {/* {labelText ? <span className={s.label}>{labelText.split('').reverse().join('')}</span> : ''} */}
            {labelText ? <span className={s.label}>{labelText}</span> : ''}
        </div>
    }
}
