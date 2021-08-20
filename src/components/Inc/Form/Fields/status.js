import React from 'react';
import DropDown from '../../../DropDown';
import Lang from '../../../Inc/Lang';
import logger from '../../../../helper/log'
export default class Status extends React.Component {
    handleOnChangeAll(selected) {
        this.props.onChange(selected);
    }
    render() {
        try {
            const lable = this.props.schema.title ? <Lang>{this.props.schema.title}</Lang> : '';
            return (
                <div className={`qe-row qe-col-1-3 ${this.props.schema.title}`} title={this.props.schema.title}>
                    <div className='qe-label'>{lable}</div>
                    <DropDown
                        options={[
                            { label: <span className='text-uppercase'><Lang>lang_view_only</Lang></span>, value: 1 },
                            { label: <span className='text-uppercase'><Lang>lang_disabled</Lang></span>, value: 0 },
                            { label: <span className='text-uppercase'><Lang>lang_normal</Lang></span>, value: 2 }
                        ]}
                        onChange={this.handleOnChangeAll.bind(this)} />
                </div>
            )
        } catch (error) {
            logger.log('error render Status Create User', error)
        }
    }
}
