import React from 'react';
import DropDown from '../../DropDown';
import logger from '../../../helper/log'
class SchemaDropDown extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: null }
        this.listSelect = (this.props.enum && this.props.enum.map((value, index) => {
            return { label: this.props.enumNames[index], value: value }
        })) || [];

        const dicDropdown = {};
        if (this.props.enum) {
            for (let index = 0; index < this.props.enum.length; index++) {
                const element = this.props.enum[index];
                dicDropdown[element] = { label: this.props.enumNames[index], value: element, index };
            }
        }
        this.dicDropdown = dicDropdown;

        this.handleOnChangeAll = this.handleOnChangeAll.bind(this);
        this.caculatorClassName = this.caculatorClassName.bind(this);
        let value;
        let label;
        let valDropdown;
        if (props.data[props.name] || props.data[props.name] === '0' || props.data[props.name] === 0) {
            if (props.name === 'user_group') {
                const valueTemp = props.data[props.name];
                const group = this.dicDropdown[valueTemp];
                if (group) {
                    label = group.label;
                    value = group.index;
                    valDropdown = valueTemp;
                }
            } else {
                value = parseInt(props.data[props.name]);
                label = props.enumNames[props.data[props.name]];
            }
        } else {
            value = null;
            label = null;
        }
        this.state = {
            value,
            label,
            valDropdown
        }
        // can not edit when press button edit
        // -------------
        this.caculatorClassName(this.state.value);
        this.flag = false;
    }
    componentWillReceiveProps(props) {
        let value
        let label
        if (props.data[props.name] || props.data[props.name] === '0' || props.data[props.name] === 0) {
            if (props.name === 'user_group') {
                const valueTemp = props.data[props.name];
                const group = this.dicDropdown[valueTemp];
                if (group) {
                    label = group.label;
                    value = group.index;
                }
            } else {
                value = parseInt(props.data[props.name]);
            }
        } else {
            value = null;
        }
        this.setState({
            value: value,
            label: label || props.enumNames[props.data[props.name]]
        })
    }
    caculatorClassName(value) {
        try {
            if (!this.state.value && !this.flag) value = this.props.data[this.props.name];
            // MARKET ACCESS
            if (this.props.field === 'au_market' || this.props.field === 'us_market') {
                switch (value) {
                    case 0:
                    case '0':
                        return this.classNameField = 'qe-dropdown-gray'
                    case 1:
                    case '1':
                        return this.classNameField = 'qe-dropdown-orange'
                    case 2:
                    case '2':
                        return this.classNameField = 'qe-dropdown-green'
                    case 3:
                    case '3':
                        return this.classNameField = 'qe-dropdown-yellow'
                    default:
                        return this.classNameField = 'qe-dropdown-none'
                }
            }
            // ------------
            // ACCOUNT MANAGEMENT
            if (this.props.field === 'om_equix_status') {
                switch (value) {
                    case 0:
                    case '0':
                        return this.classNameField = 'qe-dropdown-gray'
                    case 1:
                    case '1':
                        return this.classNameField = 'qe-dropdown-green'
                    default:
                        return this.classNameField = 'qe-dropdown-none'
                }
            }
            if (this.props.field === 'branch') {
                switch (value) {
                    case 0:
                    case '0':
                        return this.classNameField = 'qe-dropdown-gray'
                    case 1:
                    case '1':
                        return this.classNameField = 'qe-dropdown-green'
                    case 2:
                    case '2':
                        return this.classNameField = 'qe-dropdown-orange'
                    default:
                        return this.classNameField = 'qe-dropdown-none'
                }
            }
            // --------------
            // START MARKETDATA
            if (this.props.field === 'market_data_type') {
                switch (value) {
                    //  ['NO ACCESS', 'DELAYED', 'CLICK2REFRESH', 'STREAMING']
                    case 0:
                    case '0':
                        return this.classNameField = 'qe-dropdown-gray'
                    case 1:
                    case '1':
                        return this.classNameField = 'qe-dropdown-orange'
                    case 2:
                    case '2':
                        return this.classNameField = 'qe-dropdown-yellow'
                    case 3:
                    case '3':
                        return this.classNameField = 'qe-dropdown-green'
                    default:
                        return this.classNameField = 'qe-dropdown-none'
                }
            }
            // END MARKETDATA
            // START USER MANAGEMANT
            if (this.props.field === 'status') {
                switch (value) {
                    //  ['BLOCKED', 'VIEW ONLY', 'ACTIVE']
                    case 0:
                    case '0':
                        return this.classNameField = 'qe-dropdown-gray'
                    case 1:
                    case '1':
                        return this.classNameField = 'qe-dropdown-orange'
                    case 2:
                    case '2':
                        return this.classNameField = 'qe-dropdown-green'
                    default:
                        return this.classNameField = 'qe-dropdown-none'
                }
            }
            if (this.props.field === 'access_method') {
                switch (value) {
                    //  ['INTERNAL ONLY', 'FIRST INTERNAL THEN EXTERNAL'],
                    case 1:
                    case '1':
                        return this.classNameField = 'qe-dropdown-orange'
                    case 0:
                    case '0':
                        return this.classNameField = 'qe-dropdown-green'
                    default:
                        return this.classNameField = 'qe-dropdown-none'
                }
            }
            // END USER MANAGEMANT
        } catch (error) {
            logger.log('error caculatorClassName', error)
        }
    }
    handleOnChangeAll(data) {
        this.props.onChange(data);
        if (this.props.field === 'user_group') {
            const group = this.dicDropdown[data];
            this.setState({
                value: group ? group.index : null,
                valDropdown: data
            })
        } else {
            this.setState({
                value: data
            })
        }
        this.flag = true;
    }
    render() {
        if (this.props.field === 'user_group') {
            logger.log('ABCH');
        }
        if (this.props.field === 'us_market' && !this.props.data.saxo_account_id && this.props.data.account_id) {
            return <div className='qe-label-gray showTitle'>{this.state.label || '--'}</div>
        }
        if ((!this.props.data.user_id && !this.props.data.account_id) || !this.props.editable) {
            return (
                <div className={`${this.caculatorClassName(this.state.value)}`}>
                    <div className='box-overflow'>
                        <div style={{ padding: '0 8px' }} className='text-overflow showTitle'>{this.props.enumNames[this.state.value] || '--'}</div>
                    </div>
                </div>
            )
        }
        return <div style={{ padding: 0 }} title={this.props.enumNames[this.state.value] || ''} className={this.caculatorClassName(this.state.value) || ''}>
            <DropDown
                ref={dom => this.props.setDom(dom)}
                onChange={this.handleOnChangeAll.bind(this)}
                options={this.listSelect}
                value={this.props.field === 'user_group' ? this.state.valDropdown : this.state.value}
            />
        </div>
    }
}
export default SchemaDropDown;
