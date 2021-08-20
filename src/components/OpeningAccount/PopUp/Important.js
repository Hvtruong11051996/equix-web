import React from 'react'
import Lang from '../../Inc/Lang'
import s from '../OpeningAccount.module.css'
import { FIELD, BUTTON, OPTIONS, METHOD } from '../constant'
import SvgIcon, { path } from '../../Inc/SvgIcon'
import dataStorage from '../../../dataStorage'
import { addEventListener, removeEventListener, EVENTNAME } from '../../../helper/event'
import Terms from '../../../../Terms/Terms';
import showModal from '../../Inc/Modal';
import Button, { buttonSize, buttonType } from '../../Elements/Button/Button';

const listButton = [BUTTON.SUBMIT, BUTTON.CANCEL]
const PROCESS = { SUBMITTED: 'submitted', SUBMITTNG: 'submitting' }

export default class CreditHeaderFailureNotification extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            firstName: 'Ok',
            process: props.process || PROCESS.SUBMITTNG,
            isWaiting: false
        }
    }
    componentDidMount() {
        addEventListener(EVENTNAME.connectionChanged, this.changeConnection)
    }
    changeConnection = (isConnected) => {
        if (this.isConnected !== isConnected) {
            this.isConnected = isConnected
            if (isConnected) this.refBtn && this.refBtn.classList.remove(s.disableBtn)
            else this.refBtn && this.refBtn.classList.add(s.disableBtn)
        }
    }
    onBtnClick = (btn) => {
        switch (btn) {
            case BUTTON.SUBMIT:
                this.setState({ isWaiting: true }, () => {
                    this.props.submitAll(() => {
                        this.setState({ process: PROCESS.SUBMITTED, isWaiting: false })
                    })
                })
                break
            case BUTTON.CANCEL:
            case BUTTON.OK:
            default: this.props.close()
                break
        }
    }
    renderHeader() {
        return <div className={s.header} style={{ padding: '0 8px' }}>
            <div className={s.title + ' ' + 'showTitle text-capitalize'}><Lang>{this.props.title || 'lang_open_trading_account'}</Lang></div>
            <div className={s.icon + ' ' + (this.state.isWaiting ? s.disable : '')} onClick={() => this.state.isWaiting || this.props.close()}><SvgIcon path={path.mdiClose} /></div>
        </div>
    }
    renderButton() {
        if (this.state.process === PROCESS.SUBMITTED) {
            return <div className={`${s.buttonGroup} ${this.isConnected ? '' : s.disableBtn}`} style={{ padding: '8px 16px 16px' }}>
                <Button type={buttonType.ascend} size={buttonSize.large} onClick={() => this.onBtnClick(BUTTON.OK)} className={s.button}>
                    <div className={`${s.buttonContainer + ' ' + 'showTitle text-uppercase'}`}><Lang>lang_ok</Lang></div>
                </Button>
            </div>
        }
        return <div className={`${s.buttonGroup} ${this.isConnected ? '' : s.disableBtn}`} ref={ref => this.refBtn = ref} style={{ padding: '8px 16px 16px' }}>
            {
                listButton.map((e, i) => {
                    return <Button type={[BUTTON.NEXT, BUTTON.SUBMIT].includes(e) ? buttonType.ascend : ''} size={buttonSize.large} disabled={this.state.isWaiting} onClick={() => this.onBtnClick(e)} key={`button_item_${i}`} className={s.button}>
                        <div className={`${s.buttonContainer + ' ' + 'showTitle'}`}>{this.state.isWaiting && e === BUTTON.SUBMIT ? <img className='icon' src='common/Spinner-white.svg' /> : null} <Lang>{e}</Lang></div>
                    </Button>
                })
            }
        </div>
    }
    popUp = (e) => {
        if (e.target.tagName === 'A') {
            const onTermsCondition = () => {
                showModal({
                    component: Terms,
                    className: 'allowNested',
                    props: {
                        name: 'TermsAndConditionsForEKYC'
                    }
                });
            }
        }
    }
    renderContent() {
        let content = dataStorage.translate('lang_note_important')
        let haveLink = true
        if (this.state.process === PROCESS.SUBMITTED && this.props.submitText) {
            content = dataStorage.translate(this.props.submitText)
            haveLink = false
        } else {
            const link = () => {
                return '<a style="color: var(--semantic-info); cursor: pointer">Term and Conditions</a>'
            }
            content = content.replace('{link}', link())
        }
        return <div>
            <div style={{ padding: '16px' }} dangerouslySetInnerHTML={{ __html: content }} onClick={e => haveLink && this.popUp(e)}></div>
        </div>
    }
    render() {
        return <div className={s.popup} style={{ minHeight: '20vh', width: '39vw', minWidth: '520px' }}>
            {this.renderHeader()}
            <div style={{ flex: '1' }}>
                <div className={s.mainTitle + ' ' + 'showTitle'} style={{ fontSize: 'var(--size-7)', margin: '0 16px', padding: '16px 0', borderBottom: '1px solid var(--primary-light)' }}><Lang>lang_important</Lang></div>
                {this.renderContent()}
            </div>
            {this.renderButton()}
        </div>
    }
}
