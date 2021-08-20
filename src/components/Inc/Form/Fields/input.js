import React from 'react';
import Lang from '../../../Inc/Lang';
export default class SchemaString extends React.Component {
    constructor(props) {
        super(props);
        this.setFormData.bind(this);
        this.lable = this.props.schema.title ? this.props.schema.title : '';
        this.value = props.formData
        this.dataInput = props.formData;
        this.messageError = '';
        this.addClassReponsive = '';
        this.renderSuggestUserLoginId = this.renderSuggestUserLoginId.bind(this);
    }
    componentDidMount() {
    }
    componentWillReceiveProps(props) {
    }
    setFormData(data) {
        this.dataInput = data;
        this.props.onChange(data);
    }
    renderRowError() {
    }
    renderSuggestUserLoginId() {
    }
    render() {
        return (
            <div ref={dom => this.dom} className={`qe-row qe-can-error ${this.addClassReponsive} ${this.props.schema.title}`} title={this.props.schema.title}>
                <div className='qe-rowData'>
                    <div className='qe-input'>
                        <input
                            autoComplete='off'
                            className='size--3'
                            placeholder={'...'}
                            value={this.props.formData}
                            onChange={event => {
                                this.setFormData(event.target.value)
                            }} />
                    </div>
                </div>
                {this.renderRowError()}
                {/* {this.renderSuggestUserLoginId()} */}
            </div>
        );
    }
}
