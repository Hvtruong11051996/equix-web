import React from 'react';
import { renderClass } from '../../../../helper/functionUtils';
const enumName = {
    0: 'NO ACCESS',
    1: 'DELAYED',
    2: 'CLICK2REFRESH',
    3: 'STREAMING'
}
class Use extends React.Component {
    render() {
        const value = enumName[this.props.data[this.props.schema.use]]
        if (!value) return <div className='showTitle'>--</div>
        return (
            <div style={{ paddingLeft: 0, paddingRight: 0 }}>
                <div className={`box-overflow`}>
                    <div style={{ paddingLeft: 8, paddingRight: 8 }} className={`showTitle text-overflow ${renderClass(value)}`}>{value}</div>
                </div>
            </div>
        )
    }
}
export default Use;
