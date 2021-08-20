import React, { Component } from 'react';
import DropDown from '../DropDown';
import Lang from '../Inc/Lang';
import { UserGroup } from './../../constants/UserDetail';

export class DropdownField extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    handleOnChangeDropdown(data) {
        this.props.formData.value = data;
        this.props.onChange && this.props.onChange(this.props.formData)
    }

    render() {
        const { name, formData, required, readonly, uiSchema } = this.props;
        let listValue = formData.listValue;
        let listDisable = [];
        return (
            <div className="customFieldContainer">
                <label className='showTitle'><Lang>{name}</Lang>{`${required ? '*' : ''}`}</label>
                <div className={`formDropdownContainerFlex ${readonly ? 'readonlyInput' : ''}`}>
                    <DropDown
                        options={listValue || []}
                        readOnly={readonly}
                        listDisable={listDisable}
                        value={formData.value || 0}
                        onChange={this.handleOnChangeDropdown.bind(this)} />
                </div>
            </div>
        );
    }
}

export default DropdownField;
