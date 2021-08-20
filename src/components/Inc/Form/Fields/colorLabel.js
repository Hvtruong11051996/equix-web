import React from 'react';
class colorLabel extends React.Component {
    constructor(props) {
        super(props);
        this.className = '';
        this.CaculatorClassName = this.CaculatorClassName.bind(this)
    }
    CaculatorClassName() {
        // case account Managerment
        if (this.props.name === 'domestic_partner_status' || this.props.name === 'internal_partner_status') {
            switch (this.props.value.toUpperCase()) {
                case 'ACTIVE':
                case 'ENABLED':
                    return this.className = 'qe-label-green'
                case 'DISABLED':
                case 'INACTIVE':
                    return this.className = 'qe-label-gray'
                default:
                    return this.className = ''
            }
        }
    }
    render() {
        if (!this.props.value) return <div className='showTitle'>--</div>
        return (
            <div style={{ paddingLeft: 0, paddingRight: 0 }}>
                <div className={`box-overflow`}>
                    <div style={{ paddingLeft: 8, paddingRight: 8 }} className={`showTitle text-overflow ${this.CaculatorClassName()}`}>{this.props.value}</div>
                </div>
            </div>
        )
    }
}
export default colorLabel;
