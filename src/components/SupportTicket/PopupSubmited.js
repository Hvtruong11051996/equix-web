import s from './SupportTicket.module.css'
import React from 'react'
import Lang from '../Inc/Lang'
import SvgIcon, { path } from '../Inc/SvgIcon'
import dataStorage from '../../dataStorage'
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event';
import { FIELD, BUTTON } from '../OpeningAccount/constant'
import Button, { buttonType } from '../Elements/Button/Button'

export default class PopUpSubmited extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            connected: dataStorage.connected
        }
        this.isFirst = true
    }
    renderHeader() {
        return <div className={s.header} style={{ padding: '0 8px' }}>
            <div className={s.title + ' ' + 'showTitle text-capitalize'}><Lang>lang_client_support_title</Lang></div>
            <div className={s.icon} onClick={() => this.props.close()}><SvgIcon path={path.mdiClose} /></div>
        </div>
    }
    renderButton() {
        return <div className={s.buttonGroup} style={{ padding: '8px 16px 16px' }}>
            <Button type={buttonType.ascend} className={s.button}>
                <div className={`${s.buttonContainer + ' ' + 'showTitle text-uppercase'}`} onClick={() => this.props.close()}><Lang>lang_ok</Lang></div>
            </Button>
        </div>
    }
    render() {
        return <div className={s.popup} style={{ width: '541px' }}>
            {this.renderHeader()}
            <div style={{ flex: '1' }}>
                <div className={s.mainTitle + ' ' + 'showTitle text-capitalize'} style={{ fontSize: 'var(--size-7)', margin: '16px 16px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}><Lang>lang_support_ticket_successful_main_title</Lang></div>
                <div className={s.title + ' ' + 'showTitle'} style={{ fontSize: 'var(--size-4)', margin: '16px' }}><Lang>lang_support_ticket_successful_sub_title</Lang></div>
            </div>
            {this.renderButton()}
        </div>
    }
}
