import React from 'react'
import Lang from '../../Inc/Lang'
import s from '../OpeningAccount.module.css'
import { FIELD } from '../constant'
import SvgIcon, { path } from '../../Inc/SvgIcon'
import { getOpeningAccountUrl, postData, putData } from '../../../helper/request'
import { clone } from '../../../helper/functionUtils'
import { dispatchEvent, EVENTNAME } from '../../../helper/event'
import Input from '../../Elements/Input'
import dataStorage from '../../../dataStorage'
import Button, { buttonType } from '../../Elements/Button/Button';

export default class SaveDraft extends React.Component {
    constructor(props) {
        super(props);
        this.name = props.draft_name;
        if (!this.name && this.props.data) {
            this.name = dataStorage.translate(`lang_${this.props.data.account_type.toLowerCase()}`)
            if (this.props.data.applicant_details && this.props.data.applicant_details[0]) {
                this.name += ' (' + this.props.data.applicant_details[0].first_name + ' ' + this.props.data.applicant_details[0].last_name + ')'
            }
        }
        this.state = {
            disabled: this.props.draft_id ? false : !this.name
        }
    }
    onChange = e => {
        this.name = e.target.value;
        const disabled = /^\s*$/.test(this.name);
        if (this.state.disabled !== disabled) this.setState({ disabled })
    }
    onBtnClick = () => {
        console.log('Save draft success')
        const url = this.props.draft_id ? getOpeningAccountUrl('/draft') + '?draft_id=' + this.props.draft_id : getOpeningAccountUrl('/draft')
        const processFn = this.props.draft_id ? putData : postData
        const data = clone(this.props.data)
        data[FIELD.ERRORS] = this.props.errorObj
        processFn(url, {
            name: this.props.draft_name || this.name || '',
            data
        }).then(() => {
            dataStorage.gotDraft = true
            console.log('Save draft success')
            dispatchEvent(EVENTNAME.loginChanged);
            this.props.closeForm()
            this.props.close()
        }).catch(error => {
            console.error(`onSaveDraft opening account ${error}`)
        })
    }
    renderHeader() {
        return <div className={s.header} style={{ padding: '0 8px' }}>
            <div className={s.title + ' ' + 'showTitle text-capitalize'}><Lang>lang_account_opening</Lang></div>
            <div className={s.icon} onClick={this.props.close}><SvgIcon path={path.mdiClose} /></div>
        </div>
    }
    render() {
        let isDisable = !!this.props.draft_id
        return <div className={s.popup} style={{ width: '400px', maxWidth: '100vw' }} >
            {this.renderHeader()}
            <div style={{ padding: '8px' }}>
                {isDisable ? null : <div className='text-capitalize'><Lang>lang_choose_draft_name</Lang></div>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '16px' }}>
                    <div className='text-capitalize'><Lang>lang_draft_name</Lang></div>
                    <Input style={{ width: '200px', marginLeft: '16px', backgroundColor: isDisable ? 'var(--primary-dark)' : '' }} onChange={this.onChange} disabled={isDisable} defaultValue={this.name} />
                </div>
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <Button type={buttonType.ascend} onClick={this.onBtnClick} className={s.button} disabled={this.state.disabled} >
                        <Lang>lang_save</Lang>
                    </Button>
                </div>
            </div>
        </div>
    }
}
