import React from 'react'
import Lang from '../../Inc/Lang'
import s from '../OpeningAccount.module.css'
import Form, { TYPE } from '../../Inc/Form'
import SvgIcon, { path } from '../../Inc/SvgIcon'
import { FIELD, BUTTON, OPTIONS, ACCOUNT_STATUS, BANK_ACCOUNT_TYPE, TRANSACTION_TYPE, CMT_PROVIDER } from '../constant'
import { getOpeningAccountUrl, putData, getData, postData } from '../../../helper/request'
import dataStorage from '../../../dataStorage'
import { addEventListener, removeEventListener, EVENTNAME } from '../../../helper/event'
import logger from '../../../helper/log'
import { unregisterUser, registerUser } from '../../../streaming';
import { clone, translateByEnvVariable } from '../../../helper/functionUtils'
import Button, { buttonType } from '../../Elements/Button/Button'
import Important from '../PopUp/Important'
import showModal from '../../Inc/Modal';

const fields = [
    FIELD.BANK_ACCOUNT_TYPE,
    FIELD.BANK_CMT_PROVIDER,
    FIELD.BANK_BSB,
    FIELD.BANK_ACCOUNT_NUMBER,
    FIELD.BANK_ACCOUNT_NAME,
    FIELD.BANK_TRANSACTION_TYPE
]

const getStructure = (disable) => {
    let optionsBank = []
    const dataOpeningAcc = dataStorage.openingAccount
    const status = dataStorage.openingAccount.account_status
    if (['SPONSORED_HIN_TRANSFER', 'SPONSORED_NEW_HIN', 'ISSUER_SPONSORED'].includes(dataOpeningAcc[FIELD.SETTLEMENT_METHOD])) {
        optionsBank = OPTIONS.BANK_ACCOUNT_TYPE.filter((e) => e.value !== 'EMPTY')
    } else {
        optionsBank = OPTIONS.BANK_ACCOUNT_TYPE
    }
    return {
        type: TYPE.OBJECT,
        properties: {
            [FIELD.BANK_ACCOUNT_TYPE]: {
                title: 'lang_account_type',
                type: TYPE.DROPDOWN,
                align: 'right',
                options: optionsBank,
                rules: {
                    required: true
                },
                disable: disable
            },
            [FIELD.BANK_CMT_PROVIDER]: {
                title: 'lang_cmt_provider',
                type: TYPE.DROPDOWN,
                align: 'right',
                options: OPTIONS.CMT_PROVIDER,
                defaultValue: CMT_PROVIDER.MBLA,
                condition: {
                    [FIELD.BANK_ACCOUNT_TYPE]: ['BANK_ACCOUNT', 'LINKED_CMT_CMA']
                },
                rules: {
                    required: (data) => {
                        return ['BANK_ACCOUNT', 'LINKED_CMT_CMA'].includes(data[FIELD.BANK_ACCOUNT_TYPE])
                    }
                },
                disable: true
            },
            [FIELD.BANK_BSB]: {
                title: 'lang_bsb',
                titleClass: 'text-uppercase',
                type: TYPE.NUMBER,
                condition: {
                    [FIELD.BANK_ACCOUNT_TYPE]: ['BANK_ACCOUNT', 'LINKED_CMT_CMA']
                },
                rules: {
                    number: true,
                    max: 14,
                    required: (data) => {
                        return ['BANK_ACCOUNT', 'LINKED_CMT_CMA'].includes(data[FIELD.BANK_ACCOUNT_TYPE])
                    }
                },
                disable: disable
            },
            [FIELD.BANK_ACCOUNT_NUMBER]: {
                title: 'lang_account_number',
                type: TYPE.NUMBER,
                condition: {
                    [FIELD.BANK_ACCOUNT_TYPE]: ['BANK_ACCOUNT', 'LINKED_CMT_CMA']
                },
                rules: {
                    number: true,
                    max: 20,
                    required: (data) => {
                        return ['BANK_ACCOUNT', 'LINKED_CMT_CMA'].includes(data[FIELD.BANK_ACCOUNT_TYPE])
                    }
                },
                disable: disable
            },
            [FIELD.BANK_ACCOUNT_NAME]: {
                title: 'lang_account_name',
                type: TYPE.STRING,
                condition: {
                    [FIELD.BANK_ACCOUNT_TYPE]: ['BANK_ACCOUNT', 'LINKED_CMT_CMA']
                },
                rules: {
                    required: (data) => {
                        return ['BANK_ACCOUNT', 'LINKED_CMT_CMA'].includes(data[FIELD.BANK_ACCOUNT_TYPE])
                    },
                    max: 80
                },
                disable: disable
            },
            [FIELD.BANK_TRANSACTION_TYPE]: {
                title: 'lang_transaction_type',
                type: TYPE.DROPDOWN,
                align: 'right',
                options: OPTIONS.TRANSACTION_TYPE,
                defaultValue: TRANSACTION_TYPE.BOTH,
                condition: {
                    [FIELD.BANK_ACCOUNT_TYPE]: ['BANK_ACCOUNT', 'LINKED_CMT_CMA']
                },
                rules: {
                    required: (data) => {
                        return ['BANK_ACCOUNT', 'LINKED_CMT_CMA'].includes(data[FIELD.BANK_ACCOUNT_TYPE])
                    }
                },
                disable: true
            }
        }
    }
}

const listButton = [BUTTON.SUBMIT, BUTTON.CANCEL]
export default class BankAccountDetail extends React.Component {
    constructor(props) {
        super(props);
        this.objData = props.data || {}
        this.data = this.getInitialData()
        if (['SPONSORED_HIN_TRANSFER', 'SPONSORED_NEW_HIN', 'ISSUER_SPONSORED'].includes(this.data[FIELD.SETTLEMENT_METHOD])) {
            if (this.data[FIELD.BANK_ACCOUNT_TYPE] === 'EMPTY') {
                this.data[FIELD.BANK_ACCOUNT_TYPE] = null
            }
        }
        this.linkCMA = ''
        this.linkThirdParty = ''
        this.isConnected = dataStorage.isConnected
        this.state = {
            status: (dataStorage.openingAccount && dataStorage.openingAccount.account_status) || ''
        }
    }

    getInitialData() {
        const data = clone(dataStorage.openingAccount || {})
        if (data[FIELD.ACCOUNT_STATUS] === ACCOUNT_STATUS.BANK_PENDING) {
            return {}
        } else {
            getStructure(true)
            return data
        }
    }

    renderHeader() {
        return <div className={s.header}>
            <div className={s.title + ' ' + 'showTitle text-capitalize'}>{dataStorage.env_config.roles.bannerStax ? <Lang>lang_set_up_trading_account</Lang> : <Lang>lang_open_trading_account</Lang>}</div>
            <div className={s.icon} onClick={() => this.props.close()}><SvgIcon path={path.mdiClose} /></div>
        </div>
    }
    renderTitle() {
        return <div className={s.mainTitle + ' ' + 'showTitle text-capitalize'}><Lang>lang_bank_account_details</Lang></div>
    }
    componentDidMount() {
        if (this.state.status === ACCOUNT_STATUS.BANK_SUBMITTED) {
            this.setSchema && this.setSchema(getStructure(true))
        }
        this.setEditMode && this.setEditMode(true)
        addEventListener(EVENTNAME.connectionChanged, this.changeConnection)
        try {
            const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
            addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
            registerUser(userId, this.realTimeDataUser, 'ACCOUNT_OPENING')
        } catch (error) {
            logger.log('error at banner realtime', error)
        }
        let url = getOpeningAccountUrl()
        getData(url).then(res => {
            if (res.data[0].new_cma === false) {
                this.refBtnDownCMA && this.refBtnDownCMA.classList.add(s.hidden)
            }
            this.linkCMA = res.data[0].cma_new_download
            this.linkThirdParty = res.data[0].cma_third_party_download
        }).catch(error => {
            console.error('download BankAccountDetails fail: ', error)
        })
    }

    componentWillUnmount() {
        const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
        unregisterUser(userId, this.realTimeDataUser, 'ACCOUNT_OPENING')
    }
    refreshData = async () => {
        let data = null
        await getData(getOpeningAccountUrl('/draft'))
            .then((res) => {
                console.log('c2r success')
                if (res.data && !res.data.equix_id) {
                    data = res.data
                }
            }).catch(error => {
                console.error(`c2r error ${error}`)
            })
        if (!data || !Object.keys(data).length) {
            await getData(getOpeningAccountUrl())
                .then(res => {
                    console.log(`c2r RESPONSE`);
                    if (res.data) {
                        console.log(`c2r SUCCESS: ${JSON.stringify(res.data)}`);
                        data = res.data && res.data[0]
                    }
                }).catch(error => {
                    console.error(`c2r ERROR: ${error}`);
                });
        }
        dataStorage.openingAccount = data
        this.data = this.getInitialData()
        this.status = dataStorage.openingAccount && dataStorage.openingAccount.account_status
        this.setState({
            status: this.status
        })
    }
    realTimeDataUser = obj => {
        const data = JSON.parse(obj)
        if (data && data[FIELD.ACCOUNT_STATUS]) {
            if (data[FIELD.APPLICANT_DETAILS] && typeof data[FIELD.APPLICANT_DETAILS] === 'string') {
                data[FIELD.APPLICANT_DETAILS] = JSON.parse(data[FIELD.APPLICANT_DETAILS])
            }
            if (data[FIELD.TRADE_CONFIRMATIONS] && typeof data[FIELD.TRADE_CONFIRMATIONS] === 'string') {
                data[FIELD.TRADE_CONFIRMATIONS] = JSON.parse(data[FIELD.TRADE_CONFIRMATIONS])
            }
            dataStorage.openingAccount = Object.assign(dataStorage.openingAccount || {}, data)
            this.status = dataStorage.openingAccount && dataStorage.openingAccount.account_status
            this.data = this.getInitialData()
            if (this.status === ACCOUNT_STATUS.BANK_SUBMITTED) {
                this.setSchema && this.setSchema(getStructure(true))
                this.refBtn && this.refBtn.classList.add(s.disableBtn)
            } else {
                this.refBtn && this.refBtn.classList.remove(s.disableBtn)
                this.setSchema && this.setSchema(getStructure(false))
            }
            if (this.status === ACCOUNT_STATUS.MORRISON_PENDING) {
                this.props.close()
                return
            }
            this.setState({
                status: this.status
            })
        }
    }

    onChange = (data, errCount) => {
        this.objData = Object.assign(this.objData, data)
        if (data[FIELD.BANK_ACCOUNT_TYPE]) {
            this.setTitle('instructions')
            this.refBtn && this.refBtn.classList.remove(s.unShow)
        } else {
            this.refBtn && this.refBtn.classList.add(s.unShow)
            if (!dataStorage.env_config.roles.bannerStax) this.setTitle('note')
            else this.setTitle('important')
        }
        if (this.objData[FIELD.BANK_ACCOUNT_TYPE] === BANK_ACCOUNT_TYPE.BANK_ACCOUNT) this.mode = 'cma'
        else if (this.objData[FIELD.BANK_ACCOUNT_TYPE] === BANK_ACCOUNT_TYPE.LINKED_CMT_CMA) this.mode = 'thirdParty'
        this.forceUpdate()
    }

    onSubmitPopup() {
        showModal({
            component: Important,
            props: {
                closeAll: this.props.close,
                process: 'submitted',
                title: 'lang_submit_bank_account_detail',
                submitText: 'lang_bank_detail_submitted_text'
            },
            className: 'allowNested'
        });
    }

    changeConnection = (isConnected) => {
        if (isConnected && this.isConnected !== isConnected) {
            this.isConnected = isConnected;
            this.refBtnDownCMA && this.refBtnDownCMA.classList.remove(s.disableBtn)
            this.refBtnDown && this.refBtnDown.classList.remove(s.disableBtn)
        } else {
            this.refBtn && this.refBtn.classList.add(s.disableBtn)
            this.refBtnDownCMA && this.refBtnDownCMA.classList.add(s.disableBtn)
            this.refBtnDown && this.refBtnDown.classList.add(s.disableBtn)
        }
    }
    onBtnClick = (btn) => {
        switch (btn) {
            case BUTTON.SUBMIT:
                this.onSubmit()
                break
            case BUTTON.CANCEL:
            default: this.props.close()
                break
        }
    }
    onSubmit = () => {
        const data = this.getData()
        const dataObj = {}
        let url = ''
        if (data) {
            for (let index = 0; index < fields.length; index++) {
                const field = fields[index];
                if (data[FIELD.BANK_ACCOUNT_TYPE] === 'BANK_ACCOUNT' && field === FIELD.BANK_CMT_PROVIDER) continue
                if (data[field]) {
                    dataObj[field] = data[field]
                }
            }
            const equixID = dataStorage.openingAccount.equix_id
            equixID ? url = getOpeningAccountUrl(`?equix_id=${equixID}`) : url = getOpeningAccountUrl('?equix_id=')
            putData(url, dataObj).then(res => {
                this.onSubmitPopup()
                this.props.close()
                console.log('submit BankAccountDetails success')
            }).catch(error => {
                console.error('onSubmit BankAccountDetails fail: ', error)
            })
        }
    }
    onDownload = (type) => {
        if (type === 'CMA') {
            this.link = this.linkCMA
        } else this.link = this.linkThirdParty
        if (!this.link) return
        const req = new XMLHttpRequest()
        req.open('GET', this.link)
        req.responseType = 'blob'
        req.setRequestHeader('Authorization', 'Bearer ' + dataStorage.accessToken)
        req.onreadystatechange = () => {
            if (req.readyState === 4 && req.status === 200) {
                const file = new Blob([req.response], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);
                var element = document.createElement('a');
                element.setAttribute('download', type + '.pdf');
                element.setAttribute('href', fileURL);
                element.setAttribute('target', '_blank');
                element.click();
                this.refCheckBtn && this.refCheckBtn.classList.remove(s.unShow)
                if (type === 'CMA') this.setState({ downCMA: true })
                else this.setState({ downThirdParty: true })
            }
        };
        req.send();
    }

    renderButton() {
        // const submitTooltip = 'Please download your pre-filled application to proceed.'
        const classBtn = this.data[FIELD.ACCOUNT_STATUS] === ACCOUNT_STATUS.BANK_SUBMITTED ? s.disableBtn : ''
        return <div className={s.buttonGroup + ' ' + classBtn + ' ' + s.unShow} ref={ref => this.refBtn = ref}>
            {
                listButton.map((e, i) => {
                    return <Button type={[BUTTON.SUBMIT].includes(e) ? buttonType.ascend : ''} key={`button_item_${i}`} className={`${s.button} ${[BUTTON.SUBMIT].includes(e) ? s.checkBtn : ''}`} style={{ height: '32px' }}>
                        <div className={`${s.buttonContainer + ' ' + 'showTitle'}`}
                            // title={`${[BUTTON.SUBMIT].includes(e) ? submitTooltip : ''}`}
                            onClick={() => this.onBtnClick(e)}><Lang>{e}</Lang></div>
                    </Button>
                })
            }
        </div>
    }

    renderWarning = () => {
        if (this.state.status !== ACCOUNT_STATUS.BANK_SUBMITTED) return null
        return <div className={s.warning}>
            <SvgIcon path={path.mdiAlert} />
            <div style={{ color: 'var(--secondary-default)', fontSize: 'var(--size-4)', display: 'flex', justifyContent: 'flex-start', margin: '16px 0', width: '100%' }}><Lang>lang_bank_infor_warning</Lang></div>
        </div>
    }

    renderNote() {
        let content = translateByEnvVariable('lang_bank_account_detail_note', 'lang_config_product_name', 'productName')
        const email = '<a target="_blank" href="mailto:transact@macquarie.com" style="cursor: pointer; text-decoration: unset">transact@macquarie.com</a>'
        if (this.mode === 'cma') {
            content = dataStorage.translate('lang_new_cma_account_applicant_note').replace('{email}', email)
        } else if (this.mode === 'thirdParty') {
            content = dataStorage.translate('lang_existing_macquarie_account_holders').replace('{email}', email)
        }
        return <div style={{ fontSize: 'var(--size-4)' }} dangerouslySetInnerHTML={{ __html: content }}></div>
    }
    renderStaxNote() {
        let content = translateByEnvVariable('lang_bank_account_detail_note_stax', 'lang_config_product_name', 'productName')
        const email = '<a target="_blank" href="mailto:transact@macquarie.com" style="cursor: pointer; text-decoration: underline; color: var(--color-white)">transact@macquarie.com</a>'
        if (this.mode === 'cma') {
            content = dataStorage.translate('lang_new_cma_account_applicant_note_stax').replace('{email}', email)
        } else if (this.mode === 'thirdParty') {
            content = dataStorage.translate('lang_existing_macquarie_account_holders_stax').replace('{email}', email)
        }
        content = content.replaceAll('\n', '<br/>')
        return <div style={{ fontSize: 'var(--size-4)' }} dangerouslySetInnerHTML={{ __html: content }}></div>
    }

    setTitle = text => {
        this.titleDom.innerText = text
    }
    renderCheckIcon() {
        // this.refBtn && this.refBtn.classList.add(s.disableBtnStax)
        if ((this.mode === 'cma' && this.state.downCMA) || (this.mode === 'thirdParty' && this.state.downThirdParty)) {
            // this.refBtn && this.refBtn.classList.remove(s.disableBtnStax)
            return (
                <div className={s.buttonGroup} ref={ref => this.refCheckBtn = ref} style={{ backgroundColor: 'var(--ascend-default)', borderRadius: '50%', height: '24px', width: '24px', padding: '0', marginTop: '22px', marginLeft: '16px' }}>
                    <SvgIcon path={path.mdiCheck} />
                </div>
            )
        }
    }

    render() {
        return (
            <div className={s.container} style={{ justifyContent: 'space-between', boxShadow: 'var(--shadow)' }}>
                <div style={{ flex: '1', overflow: 'hidden' }}>{this.renderHeader()}
                    <div style={{ margin: '12.5px' }}>{this.renderTitle()}</div>
                    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', margin: '0 12.5px', height: '100%' }}>
                        <div style={{ height: 'calc(100% - 96px)', overflow: 'auto', width: '100%' }} className='header-wrap'>
                            <div className={s.noteBAD}>
                                <div ref={dom => this.titleDom = dom} style={{ fontSize: 'var(--size-5)', fontWeight: 'bold', paddingBottom: '8px' }} className='text-capitalize'>
                                    {!dataStorage.env_config.roles.bannerStax ? <Lang>lang_note</Lang> : <Lang>lang_important</Lang>}
                                </div>
                                {!dataStorage.env_config.roles.bannerStax ? this.renderNote() : this.renderStaxNote()}
                            </div>
                            <div style={{ fontSize: 'var(--size-4)', color: 'var(--secondary-default)', width: '100%', paddingBottom: '8px' }}>{translateByEnvVariable('lang_please_call_note', 'lang_config_support_phone', 'supportPhone')} </div>
                            <div style={{ color: 'var(--secondary-default)', fontSize: 'var(--size-4)', display: 'flex', justifyContent: 'flex-start', margin: '16px 0', width: '100%' }}><div style={{ color: '#a35159' }}>*</div><span className='text-capitalize'>&nbsp;<Lang>lang_require_symbol</Lang></span></div>
                            {this.renderWarning()}
                            <Form
                                schema={getStructure(false)}
                                data={this.data}
                                onChange={this.onChange}
                                fn={fn => {
                                    this.setData = fn.setData;
                                    this.getData = fn.getData;
                                    this.resetData = fn.resetData;
                                    this.clearData = fn.clearData;
                                    this.setEditMode = fn.setEditMode
                                    this.setSchema = fn.setSchema;
                                    this.getDefaultData = fn.getDefaultData
                                }}
                                marginForm={true}
                            />
                        </div>
                    </div>
                </div>
                <div style={{ padding: '0 16px 16px 16px', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex' }}>
                        {
                            this.mode === 'cma'
                                ? <div className={s.downloadBtn} onClick={() => this.onDownload('CMA')} ref={ref => this.refBtnDownCMA = ref}><SvgIcon path={path.mdiFileDownload} />
                                    {dataStorage.env_config.roles.bannerStax ? <Lang>lang_download_cma_application</Lang> : <Lang>lang_download_new_account_application</Lang>}
                                </div>
                                : null
                        }
                        {
                            this.mode === 'thirdParty'
                                ? <div className={s.downloadBtn} onClick={() => this.onDownload('ThirdParty')} ref={ref => this.refBtnDown = ref}><SvgIcon path={path.mdiFileDownload} /><Lang>lang_download_third_party_authority_form</Lang></div>
                                : null
                        }
                        {dataStorage.env_config.roles.bannerStax ? this.renderCheckIcon() : null}
                    </div>
                    {this.renderButton()}
                </div>
            </div>
        )
    }
}
