import React, { Component } from 'react';
import Lang from '../Inc/Lang';
import { translate } from 'react-i18next';
import Icon from '../Inc/Icon';

export class PasswordField extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: 'password'
        };
    }

    onChange(event) {
        const value = (event && event.target && event.target.value) || '';
        this.props.onChange && this.props.onChange(value)
    }

    onMouseOver() {
        this.input && this.input.type && (this.input.type = 'text')
    }

    onMouseOut() {
        this.input && this.input.type && (this.input.type = 'password')
    }

    onClick() {
        if (this.state.type === 'text') {
            this.setState({ type: 'password' })
        } else {
            this.setState({ type: 'text' })
        }
        // if (this.input && this.input.type) {
        //     if (this.input.type === 'password') {
        //         this.input.type = 'text'
        //     } else if (this.input.type === 'text') {
        //         this.input.type = 'password'
        //     }
        // }
    }

    render() {
        const { name, formData, required, readonly, uiSchema, schema, t } = this.props;
        const placeholder = (uiSchema && uiSchema['ui:placeholder']) || '';
        const maxLength = (schema && schema.maxLength) || 255;
        const minLength = (schema && schema.minLength) || 8;
        const pattern = (schema && schema.pattern) || '';
        return (
            <div>
                <input required={required} className='form-control'
                    ref={(node) => this.input = node}
                    type={this.state.type}
                    autoComplete="off"
                    autoFocus={!!(uiSchema && uiSchema['ui:placeholder'] === 'current_password')}
                    // maxLength={maxLength}
                    // minLength={minLength}
                    // pattern={pattern}
                    required={true}
                    readOnly={readonly} value={formData}
                    onChange={this.onChange.bind(this)}>
                </input>
                <Icon
                    src={this.state.type === 'password' ? 'image/remove-red-eye' : 'action/visibility-off'}
                    color='#c5cbce'
                    onClick={this.onClick.bind(this)}
                />
                <div className='fakePlacehold text-capitalize'><Lang>{placeholder}</Lang></div>
            </div>
        );
    }
}

export default translate('translations')(PasswordField);
