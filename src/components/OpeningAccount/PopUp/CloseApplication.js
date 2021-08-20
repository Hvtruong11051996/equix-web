import React from 'react'
import Lang from '../../Inc/Lang'
import s from '../OpeningAccount.module.css'
import { FIELD, BUTTON, OPTIONS, METHOD } from '../constant'
import showModal from '../../Inc/Modal';
import SvgIcon, { path } from '../../Inc/SvgIcon'
import MainSrceen from '../OpeningAccount'
import Button, { buttonType } from '../../Elements/Button/Button';

const listButton = [BUTTON.YES, BUTTON.NO]

export default class CreditHeaderFailureNotification extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    onBtnClick = (btn) => {
        switch (btn) {
            case BUTTON.YES:
                this.props.closeAll()
                this.props.close()
                break
            case BUTTON.NO:
                this.props.close()
                break
        }
    }
    renderHeader() {
        return <div className={s.header} style={{ padding: '0 8px' }}>
            <div className={s.title + ' ' + 'showTitle text-capitalize'}><Lang>lang_open_trading_account</Lang></div>
            <div className={s.icon} onClick={() => this.onBtnClick(BUTTON.NO)}><SvgIcon path={path.mdiClose} /></div>
        </div>
    }
    renderButton() {
        return <div className={s.buttonGroup} ref={ref => this.refBtn = ref} style={{ padding: '8px 16px 16px' }}>
            {
                listButton.map((e, i) => {
                    return <Button type={[BUTTON.YES].includes(e) ? buttonType.danger : ''} onClick={() => this.onBtnClick(e)} key={`button_item_${i}`} className={s.button}>
                        <div className={`${s.buttonContainer + ' ' + 'showTitle text-capitalize'}`}><Lang>{e}</Lang></div>
                    </Button>
                })
            }
        </div>
    }
    renderContent() {
        return <div style={{ margin: '16px' }}>
            {this.props.saveMess === true ? <Lang>lang_note_question_close_application_savebtn</Lang> : <Lang>lang_note_question_close_application</Lang>}
        </div>
    }
    render() {
        return <div className={s.popup} style={{ minHeight: '24vh', width: '39vw', minWidth: '520px' }} >
            {this.renderHeader()}
            <div style={{ flex: '1' }}>
                <div className={s.mainTitle + ' ' + 'showTitle'} style={{ fontSize: 'var(--size-6)', margin: '0 16px', padding: '16px 0', borderBottom: '1px solid var(--primary-light)' }}><Lang>lang_question_close_application</Lang></div>
                {this.renderContent()}
            </div>
            {this.renderButton()}
        </div>
    }
}
