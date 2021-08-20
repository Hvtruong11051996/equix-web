import React from 'react';
import { renderClass } from '../../../../helper/functionUtils';

class Tag extends React.Component {
    render() {
        const enumNames = (this.props.schema && this.props.schema.enumNames) || null
        if (!this.props.value && !enumNames) return <div className='showTitle'>--</div>
        if (enumNames) {
            const value = enumNames[this.props.value]
            return (
                <div className='showTitle' style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <div className={`box-overflow`}>
                        <div className='text-overflow'>
                            <label className={`tag ${renderClass(value)}`}>{value}</label>
                        </div>
                    </div>
                </div>
            )
        } else {
            const tagArr = this.props.value.split(',')
            return (
                <div className='box-overflow'>
                    <div className='text-overflow showTitle'>
                        {
                            tagArr.map((item, key) => {
                                return <label key={key} className='tag bg-green'>{item}</label>
                            })
                        }
                    </div>
                </div>
            )
        }
    }
}
export default Tag;
