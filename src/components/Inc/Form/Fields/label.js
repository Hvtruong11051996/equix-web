import React from 'react';
import dataStorage from '../../../../dataStorage';
import Lang from '../../Lang/Lang'

class Label extends React.Component {
    render() {
        const enumNames = (this.props.schema && this.props.schema.enumNames) || null
        const eNum = (this.props.schema && this.props.schema.enum) || null
        if (this.props.schema.customFn) {
            const value = this.props.schema.customFn(this.props.value, this.props.data)
            if (typeof value === 'string') return <div>{this.props.schema.translate !== false ? <Lang>{value}</Lang> : value}</div>
            else return <div>{value}</div>
        }
        if (!this.props.value && !enumNames) return <div className='showTitle'>{this.props.schema.translate !== false ? <Lang>{this.props.schema.defaultValue || '--'}</Lang> : (this.props.schema.defaultValue || '--')}</div>
        if (enumNames && eNum) {
            if (this.props.name === 'user_group') {
                const value = dataStorage.userGroupDic[this.props.value]
                return (
                    <div className={`box-overflow`}>
                        <div className={`text-overflow showTitle`}>{this.props.schema.translate !== false ? <Lang>{value}</Lang> : value}</div>
                    </div>
                )
            }
        }

        if (this.props.name === 'user_type') {
            return (
                <div className='box-overflow'><div className='text-oveorflow showTitle'>{this.props.schema.translate !== false ? <Lang>{this.props.value.toUpperCase()}</Lang> : this.props.value.toUpperCase()}</div></div>
            )
        }
        if (this.props.name === 'list_mapping') {
            const tagArr = this.props.value.split(',')
            return (
                <div className='box-overflow'><div className='text-overflow showTitle'>
                    {
                        tagArr.map((item, index) => {
                            return <label key={index} className='tag bg-green'>{item}</label>
                        })
                    }
                </div></div>
            )
        }
        if (this.props.name === 'user_login_id' && !this.props.value.includes('@')) {
            return <div className='box-overflow'><div className={`${this.props.schema.classNames || 'text-overflow'} showTitle`}>{this.props.value}</div></div>
        }
        return <div className='box-overflow'><div className={`${this.props.schema.classNames || 'text-overflow'} showTitle`}>{RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(this.props.value) ? this.props.value : (this.props.schema.translate !== false ? <Lang>{this.props.value}</Lang> : this.props.value)}</div></div> // eslint-disable-line
    }
}
export default Label;
