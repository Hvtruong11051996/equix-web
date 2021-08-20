import React from 'react';
import SvgIcon, { path } from '../../SvgIcon'
import s from '../Form.module.css'
import Lang from '../../../Inc/Lang';
import Checkbox from '../../../Elements/Checkbox'

class Boolean extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isChecked: props.value
        }
    }

    componentDidMount() {
        if (this.props.value === null || this.props.value === undefined) this.props.data[this.props.name] = this.props.schema.defaultValue || false
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.value !== !this.state.isChecked) {
            this.setState({
                isChecked: nextProps.value
            })
        }
    }

    render() {
        const disable = this.props.schema.disable || !this.props.editable || (['UG0', 'UG1', 'UG2', 'UG3'].indexOf(this.props.name) > -1)
        return <Checkbox setRef={this.props.setDom} className='showTitle' style={{ width: '100%' }} defaultChecked={this.state.isChecked} disabled={disable} onChange={this.props.onChange} isRequire={this.props.schema.isRequire} label={this.props.schema.subTitle} />
    }
}

export default Boolean
