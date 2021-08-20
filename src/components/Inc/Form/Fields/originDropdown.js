import React from 'react';
import DropDown from '../../../DropDown';
import Lang from '../../Lang/Lang'
class SchemaDropDown extends React.Component {
    constructor(props) {
        super(props);
        this.handleOnChangeAll = this.handleOnChangeAll.bind(this);
        let defaultValue = (props.schema && props.schema.enum && props.schema.enum[0]) || {}
        this.state = {
            value: props.value || defaultValue.value
        }
    }

    handleOnChangeAll(data) {
        this.props.onChange(data);
        this.setState({
            value: data
        })
    }

    render() {
        if (!this.props.editable) {
            return (
                <div className='box-overflow'>
                    <div className='text-overflow showTitle'><Lang>{this.props.schema.enumNames[this.state.value] || '--'}</Lang></div>
                </div>
            )
        }
        return <div style={{ padding: 0 }}>
            <DropDown
                translate={true}
                domfn={dom => this.props.setDom(dom)}
                onChange={this.handleOnChangeAll.bind(this)}
                options={this.props.schema.enum || []}
                value={this.state.value}
            />
        </div>
    }
}
export default SchemaDropDown;
