import React from 'react';
class Custom extends React.Component {
    render() {
        if (this.props.schema.customFn) return this.props.schema.customFn(this.props.value);
        if (!this.props.value) return <div className='showTitle'>--</div>
        return <div className='box-overflow'><div className='showTitle text-overflow'>{this.props.value}</div></div>
    }
}
export default Custom;
