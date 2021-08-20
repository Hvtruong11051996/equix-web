import React from 'react'
import Lang from '../../Inc/Lang'
import s from '../OpeningAccount.module.css'
import Form, { TYPE } from '../../Inc/Form'
import SvgIcon, { path } from '../../Inc/SvgIcon'

export default class ConfirmPopUp extends React.Component {
    renderHeader() {
        return <div className={s.header}>
            <div className={s.title + ' ' + 'showTitle text-capitalize'}><Lang>lang_open_trading_account</Lang></div>
            <div className={s.icon} onClick={() => this.props.close()}><SvgIcon path={path.mdiClose} /></div>
        </div>
    }
    renderContent() {
        return <div>
            <div className={s.mainTitle + ' ' + 'showTitle text-capitalize'} style={{ padding: '8px 0', border: '1px solid var(--primary-light)' }}><Lang>lang_credit_header_failure_notification</Lang></div>
        </div>
    }
    render() {
        return <div>
            {this.renderHeader()}
        </div>
    }
}
