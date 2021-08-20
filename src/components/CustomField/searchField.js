import React, { Component } from 'react';
import SearchAccount from '../SearchAccount';
import DropDown from '../DropDown';
import Lang from '../Inc/Lang';

export class SearchField extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    dataReceivedFromSearchAccount(data) {
        const newData = {
            account_id: data.account_id,
            account_name: data.account_name || ''
        }
        this.props.formData.push(newData);
        this.props.onChange && this.props.onChange(this.props.formData)
        this.forceUpdate();
    }

    onRemove(data, index) {
        this.props.formData.splice(index, 1);
        this.props.onChange && this.props.onChange(this.props.formData)
        this.forceUpdate();
    }

    render() {
        const { name, readonly, formData, uiSchema } = this.props;
        // const isRetail = !!(uiSchema && uiSchema.isRetail)
        const isConnected = !!(uiSchema && uiSchema.isConnected)
        let readOnly = readonly;
        this.listExist = [];
        Array.isArray(formData) && formData.length && formData.map((e, i) => {
            e.account_id && this.listExist.push(e.account_id)
        })
        return (
            <div className={`customFieldContainer ${readOnly || !isConnected ? 'readonlyInput' : ''}`}>
                <div className='searchAccountContainer'>
                    <label className='showTitle'><Lang>{name}</Lang></label>
                    <div style={{ flex: 1 }}>
                        <SearchAccount
                            required={true}
                            placeHolder='ADD...'
                            isCustomField={true}
                            exists={this.listExist}
                            // isRetail={isRetail}
                            showInactiveAccount={true}
                            readOnly={readOnly}
                            accountSumFlag={true}
                            dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount.bind(this)} />
                    </div>
                </div>
                <div className={`listSearchAccountContainer ${readonly || !isConnected ? 'readonlyInput' : ''}`}>
                    {
                        Array.isArray(formData) && formData.length ? formData.map((e, i) => {
                            if (!e.account_id) return;
                            const acc = `${e.account_name || ''} (${e.account_id})`
                            return (
                                <div key={i} className="customFieldContainer">
                                    <label title={acc}>{acc}</label>
                                    <div className='qe-value text-uppercase qe-removeButton' onClick={() => {
                                        readonly || this.onRemove(e, i)
                                    }}>
                                        <Lang>lang_remove</Lang>
                                    </div>
                                </div>
                            )
                        }) : null
                    }
                </div>
            </div>
        );
    }
}

export default SearchField;
