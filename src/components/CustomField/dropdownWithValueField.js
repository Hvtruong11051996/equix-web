import React, { Component } from 'react';
import DropDown from '../DropDown';

export class DropdownWithValueField extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    onChange(event) {
        const data = (event && event.target && event.target.value) || ''
        this.props.formData.value1 = data;
        this.props.onChange && this.props.onChange(this.props.formData)
    }

    handleOnChangeDropdown(data) {
        this.props.formData.value2 = data;
        this.props.onChange && this.props.onChange(this.props.formData)
    }

    render() {
        const { name, formData, required, readonly } = this.props;
        return (
            <div className="customFieldContainer">
                <label>{`${name}${required ? '*' : ''}`}</label>
                <input
                    readOnly={readonly}
                    className="form-control"
                    type="text"
                    value={formData.value1 || ''}
                    onChange={this.onChange.bind(this)}
                />
                <div className={`formDropdownContainer ${readonly ? 'readonlyInput' : ''}`}>
                    <DropDown
                        options={formData.listValue || []}
                        readOnly={readonly}
                        value={formData.value2 || 0}
                        onChange={this.handleOnChangeDropdown.bind(this)} />
                </div>
            </div>
        );
    }
}

export default DropdownWithValueField;
