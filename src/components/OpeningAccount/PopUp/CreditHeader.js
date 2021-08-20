import React from 'react'
import Lang from '../../Inc/Lang/Lang'
import s from '../OpeningAccount.module.css'
import { FIELD, BUTTON, OPTIONS, METHOD } from '../constant'
import SvgIcon, { path } from '../../Inc/SvgIcon/SvgIcon'
import dataStorage from '../../../dataStorage';
import Button, { buttonType } from '../../Elements/Button/Button';
import { addEventListener, removeEventListener, EVENTNAME } from '../../../helper/event'

export default class CreditHeaderFailureNotification extends React.Component {
    constructor(props) {
        super(props);
        this.listData = props.data.lstData || dataStorage.openingAccount.applicant_details
        this.state = {
            curIndex: 0
        }
    }
    getListButton(page) {
        if (this.listData.length === 1) return [BUTTON.OK]
        switch (page) {
            case 1: return [BUTTON.NEXT]
            case this.listData.length: return [BUTTON.BACK, BUTTON.OK]
            default: return [BUTTON.BACK, BUTTON.NEXT]
        }
    }
    onBtnClick(btn) {
        switch (btn) {
            case BUTTON.NEXT:
                this.onNext()
                break
            case BUTTON.BACK:
                this.onBack()
                break
            case BUTTON.OK:
            default: this.props.close()
                break
        }
    }
    onNext() {
        if (this.state.curIndex < this.listData.length - 1) {
            this.setState({
                curIndex: this.state.curIndex + 1
            })
        }
    }
    onBack() {
        if (this.state.curIndex > 0) {
            this.setState({
                curIndex: this.state.curIndex - 1
            })
        }
    }
    renderHeader() {
        return <div className={s.header} style={{ padding: '0 8px' }}>
            <div className={s.title + ' ' + 'showTitle text-capitalize'}><Lang>lang_open_trading_account</Lang></div>
            <div className={s.icon} onClick={() => this.props.close()}><SvgIcon path={path.mdiClose} /></div>
        </div>
    }
    renderPageNum() {
        return <div style={{ fontWeight: 'bold', display: 'flex', flexDirection: 'row', alignItems: 'baseline', paddingLeft: '16px' }}>
            <div style={{ fontSize: 'var(--size-6)' }}>{this.state.curIndex + 1}</div>
            <div style={{ fontSize: 'var(--size-6)' }}>/{this.listData.length}</div>
        </div>
    }
    renderButton() {
        const listButton = this.getListButton(this.state.curIndex + 1)
        return <div className={s.buttonGroup} ref={ref => this.refBtn = ref} style={{ padding: '0px 16px 16px 0' }}>
            {
                listButton.map((e, i) => {
                    return <Button type={[BUTTON.NEXT, BUTTON.SUBMIT, BUTTON.OK].includes(e) ? buttonType.ascend : ''} disabled={this.isConnected} onClick={() => this.onBtnClick(e)} key={`button_item_${i}`} className={s.button}>
                        <div className={`${s.buttonContainer + ' ' + 'showTitle text-capitalize'}`}><Lang>{e}</Lang></div>
                    </Button>
                })
            }
        </div>
    }

    changeConnection = (isConnected) => {
        if (this.isConnected !== isConnected) {
            this.isConnected = isConnected
            if (isConnected) this.refBtn && this.refBtn.classList.remove(s.disableBtn)
            else this.refBtn && this.refBtn.classList.add(s.disableBtn)
        }
    }

    renderBottom() {
        return <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            {this.renderPageNum()}
            {this.renderButton()}
        </div>
    }
    renderContent() {
        let content = dataStorage.translate('lang_confirm_credit_header')
        content = content.replace('{1}', this.listData[this.state.curIndex].title.toCapitalize() + '. ' + this.listData[this.state.curIndex].first_name)
        content = content.replace('{2}', '<a target=\'_blank\' href=\'https://www.checkyourcredit.com.au/Personal\' style="color: var(--semantic-info)">https://www.checkyourcredit.com.au/Personal</a>')
        content = content.replaceAll('\n', '<br/>')
        return <div>
            <div style={{ padding: '16px' }} dangerouslySetInnerHTML={{ __html: content }}></div>
        </div>
    }

    componentDidMount() {
        addEventListener(EVENTNAME.connectionChanged, this.changeConnection)
    }

    render() {
        return <div className={s.popup} style={{ minHeight: '64vh', width: '72vw' }}>
            {this.renderHeader()}
            <div style={{ flex: '1' }}>
                <div className={s.mainTitle + ' ' + 'showTitle text-capitalize'} style={{ fontSize: 'var(--size-7)', margin: '0 16px', padding: '16px 0', borderBottom: '1px solid var(--primary-light)' }}><Lang>lang_credit_header_failure_notification</Lang></div>
                {this.renderContent()}
            </div>
            {this.renderBottom()}
        </div>
    }
}
