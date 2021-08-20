import React from 'react';
import s from './Button.module.css';

export const buttonType = {
    info: s.info,
    success: s.success,
    danger: s.danger,
    ascend: s.ascend
}

export const buttonSize = {
    small: s.small,
    medium: s.medium,
    large: s.large
}

export default class Button extends React.Component {
    click = () => {
        !this.props.disabled && this.props.onClick && this.props.onClick();
    }
    render() {
        return <div className={`${s.button} ${this.props.type || ''} ${this.props.size || ''} ${this.props.mini ? s.mini : ''} ${this.props.disabled ? s.disabled : ''} ${this.props.className || ''}`} style={this.props.style} onClick={this.click}>
            {this.props.children}
        </div>
    }
}
