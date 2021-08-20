import React from 'react';
import SvgIcon, { path } from '../../SvgIcon'
import s from '../Form.module.css'
import Lang from '../../../Inc/Lang';
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
            organisation_code: data.organisation_code,
            branch_code: data.branch_code,
            advisor_code: data.advisor_code,
            account_name: data.account_name,
            account_id: data.account_id
        });
        dataStorage.force_update_create_user = true;
        this.props.onChange(curValue);
    }

    dataReceivedFromSearchCode(data) {
        let curValue = this.props.value ? JSON.parse(JSON.stringify(this.props.value)) : [];
        const obj = Object.assign({}, data.organisation_code ? { organisation_code: data.organisation_code } : {}, data.branch_code ? { branch_code: data.branch_code } : {}, data.advisor_code ? { advisor_code: data.advisor_code } : {}, data.account_name ? { account_name: data.account_name } : {})
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

    removeItem(item) {
        if (!item || !this.props.schema.field || !item[this.props.schema.field] || !this.props.value || !Array.isArray(this.props.value)) return
        const index = this.props.value.findIndex(e => item[this.props.schema.field] === e[this.props.schema.field])
        if (index > -1) this.removeCode(index)
    }

    // handleOnChangeDropdown(value) {
    //     let search = ''
    //     switch (value) {
    //         case 'org': return search = 0
    //         case 'branch': return search = 1
    //         case 'adv': return search = 2
    //     }
    //     this.setState({
    //         selectedDropdown: search
    //     })
    // }
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
        let { selectedDropdown } = this.state;
        switch (this.props.schema.search) {
            case 'org': selectedDropdown = 0
                break;
            case 'branch': selectedDropdown = 1
                break;
            case 'adv': selectedDropdown = 2
                break;
            default: break
        }
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
                        if (element && element.organisation_code && !element.branch_code) exists.push(element.organisation_code)
                    }
                }
                break;
            case 1: placeHolder = 'lang_search_branch'
                key = 'branch_code'
                if (value && Array.isArray(value) && value.length) {
                    for (let index = 0; index < value.length; index++) {
                        const element = value[index];
                        if (element && element.branch_code && !element.advisor_code) exists.push(element.branch_code)
                    }
                }
                break;
            case 2: placeHolder = 'lang_search_advisor'
                key = 'advisor_code'
                if (value && Array.isArray(value) && value.length) {
                    for (let index = 0; index < value.length; index++) {
                        const element = value[index];
                        if (element && element.advisor_code && !element.account_id) exists.push(element.advisor_code)
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
                editable ? <div style={{ marginBottom: '4px', paddingBottom: '8px' }}>
                    {
                        selectedDropdown === 3 ? <SearchAccount
                            required={true}
                            multiSelect={true}
                            placeHolder={placeHolder}
                            id={schema && schema.id}
                            isCustomField={true}
                            noAdd={true}
                            noAdd={true}
                            exists={exists}
                            showInactiveAccount={true}
                            accountSumFlag={true}
                            removeItem={item => this.removeItem(item)}
                            dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount.bind(this)} />
                            : <SearchCode
                                url={url}
                                mainKey={key}
                                required={true}
                                id={schema && schema.id}
                                placeHolder={placeHolder}
                                isCustomField={true}
                                noAdd={true}
                                noAdd={true}
                                exists={exists}
                                accountSumFlag={true}
                                removeItem={item => this.removeItem(item)}
                                dataReceivedFromSearchAccount={this.dataReceivedFromSearchCode.bind(this)} />
                    }
                </div> : null
            }
            <div style={(value && Array.isArray(value) && value.length > 0) ? { borderTop: '1px solid var(--border)', paddingTop: '8px' } : null}>
                {
                    value && Array.isArray(value) && value.length > 0 && value.map((e, i) => {
                        return (
                            <div
                                style={{ display: 'flex', alignItems: 'center', padding: '1px 0', justifyContent: editable ? 'space-between' : 'flex-end' }}
                                key={`manage_advisor_${i}`
                                }>
                                <div style={{ display: 'flex', flex: '1', overflow: 'hidden' }}>
                                    {e.account_id ? <div className={s.btn + ' ' + s.btnLightGray} style={{ display: 'flex', flex: '1', overflow: 'hidden' }} title={`${e.account_name || ''} ${e.account_name ? '(' + e.account_id + ')' : e.account_id}`}>
                                        <div className={s.textEllipsis}>
                                            {e.account_name || ''}
                                        </div>
                                        <div>
                                            {e.account_name ? ' (' + e.account_id + ')' : e.account_id}
                                        </div>
                                    </div> : null}
                                    {e.advisor_code ? <div className={s.btn + ' ' + s.btnGray} title={`Organisation Code: ${e.organisation_code} ${e.branch_code ? ' | Branch Code: ' + e.branch_code : ''} ${e.advisor_code ? ' | Advisor Code: ' + e.advisor_code : ''}`}>{e.advisor_code || ''}</div> : null}
                                    {e.branch_code ? <div className={s.btn + ' ' + s.btnYellow} title={`Organisation Code: ${e.organisation_code} ${e.branch_code ? ' | Branch Code: ' + e.branch_code : ''} ${e.advisor_code ? ' | Advisor Code: ' + e.advisor_code : ''}`}>{e.branch_code}</div> : null}
                                    {e.organisation_code ? <div className={s.btn + ' ' + s.btnBlue} title={`Organisation Code: ${e.organisation_code} ${e.branch_code ? ' | Branch Code: ' + e.branch_code : ''} ${e.advisor_code ? ' | Advisor Code: ' + e.advisor_code : ''}`}>{e.organisation_code}</div> : null}
                                </div>
                                {
                                    editable ? <div className={`${s.btnRed} showTitle`} style={{ height: '16px', width: '16px', justifyContent: 'center', cursor: 'pointer', alignItems: 'center', display: 'flex', borderRadius: '50%' }} onClick={() => this.removeCode(i)}>
                                        <SvgIcon path={path.mdiClose} style={{ fill: 'unset' }} />
                                        <div className={'hiddenTooltip text-uppercase'} ><Lang>lang_remove</Lang> </div>
                                    </div> : null
                                }
                            </div>
                        );
                    })
                }
            </div>
        </div>
    }
}
export default Manage;
