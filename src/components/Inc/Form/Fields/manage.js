import React from 'react';
import Lang from './../../../Inc/Lang'
import Icon from './../../../Inc/Icon'
import SearchAccount from './../../../SearchAccount'
import SearchCode from './../../../SearchAccount/SearchCode'
import DropDown from './../../../DropDown'
import { getSearchCodeUrl } from './../../../../helper/request'
import dataStorage from '../../../../dataStorage'

const listDropdown = [
    { label: 'lang_organisation_code', value: 0, className: 'text-uppercase' },
    { label: 'lang_branch_code', value: 1, className: 'text-uppercase' },
    { label: 'lang_advisor_code', value: 2, className: 'text-uppercase' },
    { label: 'lang_account_id', value: 3, className: 'text-uppercase' }
]

class Manage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDropdown: 0
        }
    }

    dataReceivedFromSearchAccount(data) {
        const curValue = this.props.value ? JSON.parse(JSON.stringify(this.props.value)) : [];
        curValue.push({
            OC: data.organisation_code,
            BC: data.branch_code,
            AC: data.advisor_code,
            account_name: data.account_name,
            account_id: data.account_id
        });
        dataStorage.force_update_create_user = true;
        this.props.onChange(curValue);
    }

    dataReceivedFromSearchCode(data) {
        let curValue = this.props.value ? JSON.parse(JSON.stringify(this.props.value)) : [];
        const obj = Object.assign({}, data.organisation_code ? { OC: data.organisation_code } : {}, data.branch_code ? { BC: data.branch_code } : {}, data.advisor_code ? { AC: data.advisor_code } : {}, data.account_name ? { account_name: data.account_name } : {})
        if (curValue && Array.isArray(curValue)) {
        } else {
            curValue = [];
        }
        curValue.push(obj)
        dataStorage.force_update_create_user = true;
        this.props.onChange(curValue);
    }

    removeCode(index) {
        let curValue = this.props.value ? JSON.parse(JSON.stringify(this.props.value)) : [];
        curValue.splice(index, 1);
        dataStorage.force_update_create_user = true;
        this.props.onChange(curValue);
    }

    handleOnChangeDropdown(value) {
        this.setState({
            selectedDropdown: value
        })
    }
    componentWillReceiveProps(nextProps) {
        console.log(nextProps);
        if (nextProps.editable && nextProps.editable !== this.props.editable) {
            this.setState({
                selectedDropdown: 0
            })
        }
    }

    render() {
        const { editable, schema, name, value } = this.props;
        const { selectedDropdown } = this.state;
        const url = getSearchCodeUrl(selectedDropdown)
        let placeHolder = ''
        let key = ''
        let exists = []
        switch (selectedDropdown) {
            case 0: placeHolder = 'lang_search_organisation'
                key = 'organisation_code';
                if (value && Array.isArray(value) && value.length) {
                    for (let index = 0; index < value.length; index++) {
                        const element = value[index];
                        if (element && element.OC && !element.BC) exists.push(element.OC)
                    }
                }
                break;
            case 1: placeHolder = 'lang_search_branch'
                key = 'branch_code'
                if (value && Array.isArray(value) && value.length) {
                    for (let index = 0; index < value.length; index++) {
                        const element = value[index];
                        if (element && element.BC && !element.AC) exists.push(element.BC)
                    }
                }
                break;
            case 2: placeHolder = 'lang_search_advisor'
                key = 'advisor_code'
                if (value && Array.isArray(value) && value.length) {
                    for (let index = 0; index < value.length; index++) {
                        const element = value[index];
                        if (element && element.AC && !element.account_id) exists.push(element.AC)
                    }
                }
                break;
            case 3: placeHolder = 'SearchAccount'
                if (value && Array.isArray(value) && value.length) {
                    for (let index = 0; index < value.length; index++) {
                        const element = value[index];
                        if (element && element.account_id) exists.push(element.account_id)
                    }
                }
                break;
            default: break;
        }
        return <div
            style={{ flexDirection: 'column' }}
        >
            {
                editable ? <div style={{ marginBottom: '4px' }}>
                    <DropDown
                        translate={true}
                        options={listDropdown}
                        value={this.state.selectedDropdown}
                        onChange={this.handleOnChangeDropdown.bind(this)} />
                    {
                        selectedDropdown === 3 ? <SearchAccount
                            required={true}
                            multiSelect={true}
                            placeHolder={placeHolder}
                            id={schema && schema.id}
                            isCustomField={true}
                            exists={exists}
                            showInactiveAccount={true}
                            accountSumFlag={true}
                            noAdd={schema.noAdd}
                            dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount.bind(this)} /> : <SearchCode
                                url={url}
                                mainKey={key}
                                required={true}
                                id={schema && schema.id}
                                placeHolder={placeHolder}
                                isCustomField={true}
                                exists={exists}
                                accountSumFlag={true}
                                noAdd={schema.noAdd}
                                dataReceivedFromSearchAccount={this.dataReceivedFromSearchCode.bind(this)} />
                    }
                </div> : null
            }
            {
                value && Array.isArray(value) && value.length > 0 && value.map((e, i) => {
                    return (
                        <div
                            style={{ display: 'flex', alignItems: 'center', padding: '1px 0', justifyContent: editable ? 'space-between' : 'flex-end' }}
                            key={`manage_advisor_${i}`
                            }>
                            <div style={{ display: 'flex' }}>
                                {e.OC ? <div className='qe-form-account-box bg-green' title={`Organisation Code: ${e.OC} ${e.BC ? ' | Branch Code: ' + e.BC : ''} ${e.AC ? ' | Advisor Code: ' + e.AC : ''}`}>{e.OC}</div> : null}
                                {e.BC ? <div className='qe-form-account-box bg-orange' title={`Organisation Code: ${e.OC} ${e.BC ? ' | Branch Code: ' + e.BC : ''} ${e.AC ? ' | Advisor Code: ' + e.AC : ''}`}>{e.BC}</div> : null}
                                {e.AC ? <div className='qe-form-account-box bg-blue' title={`Organisation Code: ${e.OC} ${e.BC ? ' | Branch Code: ' + e.BC : ''} ${e.AC ? ' | Advisor Code: ' + e.AC : ''}`}>{e.AC || ''}</div> : null}
                                {e.account_id ? <div className='qe-form-account-box bg-gray' title={`${e.account_name || ''} ${e.account_name ? '(' + e.account_id + ')' : e.account_id}`}>{`${e.account_name || ''} ${e.account_name ? '(' + e.account_id + ')' : e.account_id}`}</div> : null}
                            </div>
                            {
                                editable ? <div className='bg-red' style={{ height: '22px', justifyContent: 'center', cursor: 'pointer', alignItems: 'center', display: 'flex', padding: '0 4px' }} onClick={() => this.removeCode(i)}>
                                    <Icon style={{ transition: 'none' }} src='navigation/close' />
                                    <span className='text-uppercase'><Lang>lang_remove</Lang></span>
                                </div> : null
                            }
                        </div>
                    );
                })
            }
        </div>
    }
}
export default Manage;
