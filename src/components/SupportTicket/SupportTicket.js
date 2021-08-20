import s from './SupportTicket.module.css'
import React from 'react'
import Lang from '../Inc/Lang'
import SvgIcon, { path } from '../Inc/SvgIcon'
import Form, { TYPE } from '../Inc/Form'
import dataStorage from '../../dataStorage'
import { putData, postData, getUrlSupportTicket } from '../../helper/request'
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event';
import { FIELD, BUTTON } from '../OpeningAccount/constant'
import Button, { buttonType } from '../Elements/Button/Button'
import showModal from '../Inc/Modal'
import PopUpSubmited from './PopupSubmited'

const getStructure = () => {
    return {
        type: TYPE.OBJECT,
        properties: {
            category: {
                title: 'lang_category',
                type: TYPE.DROPDOWN,
                align: 'left',
                textRight: false,
                options: listCategory,
                rules: {
                    required: true
                }
            },
            title: {
                title: 'lang_title',
                type: TYPE.STRING,
                align: 'right',
                alignLeft: true,
                rules: {
                    between: '5,200',
                    required: true
                }
            },
            description: {
                title: 'lang_description',
                type: TYPE.TEXTAREA,
                alignLeft: true,
                rules: {
                    between: '25,1000',
                    required: true
                }
            },
            attachment: {
                title: 'lang_atachment',
                placeholder: 'Select A Image File',
                listAccept: 'image/jpeg,image/png',
                type: TYPE.INPUT_FILE,
                textAlign: 'left',
                rules: {
                    maxSize: 25,
                    fileType: 'image'
                }
            }
        }
    }
}
const listCategory = [
    {
        label: 'Please Select',
        value: null
    },
    {
        label: 'lang_authentication',
        value: 'Authentication'
    },
    {
        label: 'lang_user',
        value: 'User'
    },
    {
        label: 'lang_account',
        value: 'Account'
    },
    {
        label: 'lang_market_data',
        value: 'MarketData'
    },
    {
        label: 'lang_trading',
        value: 'Trading'
    },
    {
        label: 'lang_portfolio',
        value: 'Portfolio'
    },
    {
        label: 'lang_system',
        value: 'System'
    },
    {
        label: 'lang_operator',
        value: 'Operator'
    },
    {
        label: 'lang_other',
        value: 'Other'
    }
]
const listButton = [BUTTON.SUBMIT, BUTTON.CLOSE]

export default class SupportTicket extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            connected: dataStorage.connected
        }
        this.isFirst = true
    }
    connectionChanged = (connected) => {
        this.setState({ connected: connected });
    }
    componentWillUnmount() {
        removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged);
        removeEventListener(EVENTNAME.themeChanged, this.themeChanged)
    }

    componentDidMount() {
        this.setEditMode && this.setEditMode(true)
        addEventListener(EVENTNAME.connectionChanged, this.connectionChanged);
        addEventListener(EVENTNAME.themeChanged, this.themeChanged)
    }

    renderHeader() {
        return <div className={s.header} style={{ paddingTop: '8px' }}>
            <div className={s.mainTitle + ' ' + 'showTitle text-capitalize'} style={{ fontSize: '24px', margin: '16px' }}><Lang>lang_open_client_support</Lang></div>
            <div className={s.icon} onClick={() => this.props.close()}><SvgIcon path={path.mdiClose} /></div>
        </div>
    }

    onChange = () => { }

    renderContent() {
        return <div style={{ paddingBottom: '8px', margin: '0 8px' }}>
            <Form
                {...this.props}
                onChange={this.onChange}
                fn={fn => {
                    this.setEditMode = fn.setEditMode
                    this.getDefaultData = fn.getDefaultData
                    this.setData = fn.setData
                    this.getData = fn.getData
                }}
                schema={getStructure()}
            /></div>
    }
    onCallback = (token) => {
        this.recaptcha = token
        this.forceUpdate()
    }
    onExpiredCallback = (data) => {
        this.recaptcha = null
        this.forceUpdate()
    }
    onErrorCallback = (data) => {
        this.recaptcha = null
        this.forceUpdate()
    }

    themeChanged = () => {
        grecaptcha.render('recaptcha', {
            sitekey: '6LdaBzEaAAAAAMP16MYvQI3mA4ReJv1k167rHSeS',
            callback: this.onCallback,
            theme: dataStorage.theme === 'theme-light' ? 'light' : 'dark',
            'expired-callback': this.onExpiredCallback,
            'error-callback': this.onErrorCallback
        });
    }
    renderCaptcha() {
        return <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '0 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', flex: '1', marginRight: '8px' }}>
                <div>Captcha</div>
                <span style={{ color: 'var(--semantic-danger)', marginLeft: '4px' }}>*</span>
            </div>
            <div ref={ref => {
                if (this.isFirst) {
                    this.isFirst = false
                    grecaptcha.render(ref, {
                        sitekey: '6LdaBzEaAAAAAMP16MYvQI3mA4ReJv1k167rHSeS',
                        callback: this.onCallback,
                        theme: dataStorage.theme === 'theme-light' ? 'light' : 'dark',
                        'expired-callback': this.onExpiredCallback,
                        'error-callback': this.onErrorCallback
                    });
                }
            }} id='recaptcha' className={s.captchaContainer}></div>
        </div>
    }

    handleData = (data) => {
        Object.assign(data, { recaptcha: this.recaptcha })
        // if (data.title && !(data.title + '').trim()) data.title = null
        // if (data.description && !(data.description + '').trim()) data.description = null
        delete data.className
        return data
    }
    showPopUpSubmited() {
        showModal({
            component: PopUpSubmited
        });
    }

    onSubmit = () => {
        if (this.recaptcha) {
            const data = this.getData()
            const dataUpload = this.handleData(data)
            if (data) {
                if (data.attachmentdocument_name) delete data.attachmentdocument_name
                if (typeof data.attachment === 'string') {
                    dataUpload.attachment = [data.attachment]
                }
                const url = getUrlSupportTicket()
                postData(url, dataUpload).then(res => {
                    console.log('done')
                    this.props.close()
                    this.showPopUpSubmited()
                }).catch(error => {
                    grecaptcha.reset()
                    this.recaptcha = null
                })
            }
        }
    }

    onBtnClick = (btn) => {
        switch (btn) {
            case BUTTON.SUBMIT:
                this.onSubmit()
                break
            case BUTTON.CLOSE:
            default: this.props.close()
                break
        }
    }

    renderButton() {
        const isDisable = !this.state.connected || !this.recaptcha
        return <div className={s.buttonGroup} style={{ padding: '8px 16px 16px', marginTop: '32px' }}>
            {
                listButton.map((e, i) => {
                    return <Button type={[BUTTON.SUBMIT].includes(e) ? buttonType.ascend : ''} key={`button_item_${i}`}
                        className={s.button + ' ' + ([BUTTON.SUBMIT].includes(e) ? s.submit : '') + ' ' + (isDisable ? s.disabled : '')}>
                        <div className={`${s.buttonContainer + ' ' + 'showTitle text-uppercase'}`} onClick={() => this.onBtnClick(e)}><Lang>{e}</Lang></div></Button>
                })
            }
        </div>
    }

    render() {
        return <div className={s.popup} style={{ minHeight: '41vh', width: '800px', maxWidth: '56vw', minWidth: '400px' }}>
            {this.renderHeader()}
            <div style={{ flex: '1' }}>
                <div className={s.title + ' ' + 'showTitle'} style={{ fontSize: 'var(--size-4)', margin: '16px' }}><Lang>lang_client_support_sub</Lang></div>
                <div className={s.title + ' ' + 'showTitle'} style={{ paddingBottom: '16px', margin: '0 16px', fontSize: 'var(--size-4)', borderBottom: '1px solid var(--border)' }}><span style={{ color: 'var(--semantic-danger)', marginLeft: '4px' }}>*</span><span className='text-capitalize'>&nbsp;<Lang>lang_require_symbol</Lang></span></div>
                {this.renderContent()}
                {this.renderCaptcha()}
            </div>
            {this.renderButton()}
        </div>
    }
}
