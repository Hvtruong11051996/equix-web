import React, { Component } from 'react';
import Lang from '../Inc/Lang';

export class SchemaField extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    onChange(event) {
        const value = (event && event.target && event.target.value) || '';
        this.props.onChange && this.props.onChange(value)
    }

    render() {
        const { name, formData, required, readonly, uiSchema, schema } = this.props;
        const placeholder = (uiSchema && uiSchema['ui:placeholder']) || '';
        const maxLength = (schema && schema.maxLength) || 255;
        const pattern = (schema && schema.pattern) || '';
        const format = (schema && schema.format) || 'text';
        return (
            <div className="customFieldContainer" title={readonly ? formData : ''}>
                <label className='showTitle'><Lang>{name}</Lang>{`${required ? '*' : ''}`}</label>
                <input required={required} className='form-control'
                    // type={format}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    minLength={minLength || 0}
                    pattern={pattern}
                    readOnly={readonly} value={formData} type="text"
                    onChange={this.onChange.bind(this)}>
                </input>
            </div>
        );
    }
}

export default SchemaField;
