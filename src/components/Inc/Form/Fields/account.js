import React from 'react';
import SvgIcon, { path } from '../../SvgIcon'
import s from '../Form.module.css'
import Lang from '../../../Inc/Lang';
import SearchAccount from './../../../SearchAccount/SearchAccountCU'
import dataStorage from '../../../../dataStorage'

class Account extends React.Component {
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

    removeCode(index) {
        let curValue = this.props.value ? JSON.parse(JSON.stringify(this.props.value)) : [];
        curValue.splice(index, 1);
        dataStorage.force_update_create_user = true;
        this.props.onChange(curValue);
    }

    removeItem(item) {
        if (!item || !item.account_id || !this.props.value || !Array.isArray(this.props.value)) return
        const index = this.props.value.findIndex(e => item.account_id === e.account_id)
        if (index > -1) this.removeCode(index)
    }

    render() {
        const { editable, schema, name, value } = this.props;
        let exists = [];
        if (value && Array.isArray(value) && value.length) {
            for (let index = 0; index < value.length; index++) {
                const element = value[index];
                if (element && element.account_id) exists.push(element.account_id)
            }
        }
        return <div style={{ flexDirection: 'column' }}>
            {
                editable ? <div style={{ marginBottom: '4px' }}>
                    <SearchAccount
                        required={true}
                        placeHolder=''
                        isCustomField={true}
                        noAdd={true}
                        exists={exists}
                        id={schema && schema.id}
                        showInactiveAccount={true}
                        accountSumFlag={true}
                        multiSelect={true}
                        createUser={this.props.schema.createUser}
                        removeItem={item => this.removeItem(item)}
                        dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount.bind(this)} />
                </div> : null
            }
            <div style={(value && Array.isArray(value) && value.length > 0) ? { borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '8px' } : null}>
                {
                    value && Array.isArray(value) && value.length > 0 && value.map((e, i) => {
                        return (
                            e.account_id ? <div
                                key={i}
                                style={{ display: 'flex', alignItems: 'center', padding: '1px 0', justifyContent: editable ? 'space-between' : 'flex-end' }}
                            >
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
                                        <div className='hiddenTooltip text-uppercase' ><Lang>lang_remove</Lang> </div>
                                    </div> : null
                                }
                            </div> : null
                        );
                    })
                }
            </div>
        </div>
    }
}
export default Account;
