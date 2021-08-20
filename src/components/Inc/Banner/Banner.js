/* eslint-disable brace-style */
import React from 'react';
import s from './Banner.module.css'
import SvgIcon, { path } from '../SvgIcon'
import dataStorage from '../../../dataStorage';
import MapRoleComponent from '../../../constants/map_role_component';
import { getOpeningAccountUrl, getData } from '../../../helper/request';
import { checkRole, clone, getDataAddGovernmentId, checkShowOpeningAccountStax } from '../../../helper/functionUtils';
import Lang from '../Lang';
import showModal from '../Modal';
import OpeningAccount from '../../OpeningAccount/OpeningAccount'
import BankAccountDetail from '../../OpeningAccount/Screens/BankAccountDetail'
import AddGovernmentID from '../../OpeningAccount/Screens/AddGovernmentID'
import CreditHeader from '../../OpeningAccount/PopUp/CreditHeader'
import userTypeEnum from '../../../constants/user_type_enum';
import { addEventListener, removeEventListener, EVENTNAME } from '../../../helper/event'
import logger from '../../../helper/log'
import { FIELD, ACCOUNT_STATUS, EKYC_STATUS, GOVID_STATUS, DOCUMENT_STATUS, DOCUMENT_TYPE } from '../../OpeningAccount/constant';
import { registerAllOrders, unregisterAllOrders, unregisterUser, registerUser } from '../../../streaming';

const obj = {
    2: {
        gotDraft: {
            icon: '',
            tooltip: ''
        },
        EKYC_PENDING: {
            icon: 'magnify',
            tooltip: 'A problem have occurred during your KYC process! Our staff have been notify and they are investigating. We are sorry for any inconvenience caused.'
        },
        EKYC_IN_PROGRESS: {
            icon: 'progressAlert',
            tooltip: 'We are trying to verify your information with our KYC provider please check back later!'
        },
        EKYC_MORE_INFO: {
            icon: 'progressCheck',
            tooltip: 'We need more information from you please click here to add another Government ID to continue.'
        },
        EKYC_LOCKED_OUT: {
            icon: 'lock',
            tooltip: 'You have been locked out from the KYC process due to too many attempts with the wrong information.'
        }
    },
    3: {
        BANK_PENDING: {
            icon: 'progressPending',
            tooltip: 'Please click here to update your bank account details once you have successfuly opened an account with the bank.'
        },
        BANK_SUBMITTED: {
            icon: 'magnify',
            tooltip: 'Thank you for submitting your bank account details. Our staff have been notified. We will let you know if there is anything wrong!'
        }
    },
    4: {
        MORRISON_PENDING: {
            icon: 'progressPending',
            tooltip: 'We have submitted your application to Morrison. We will notify you when there is an status update. Thank you for your patient.'
        },
        MORRISON_CANCELLED: {
            icon: 'close',
            tooltip: ''
        },
        MORRISON_IN_REFERRED: {
            icon: 'magnify',
            tooltip: ''
        }
    },
    5: {
        ACTIVE: {
            icon: 'check',
            tooltip: ''
        }
    }
}

export default class Banner extends React.Component {
    constructor(props) {
        super(props);
        this.status = dataStorage.openingAccount && dataStorage.openingAccount.account_status
        // this.status = ACCOUNT_STATUS.EKYC_AML_STATUS
        this.state = {
            step: this.getStepByStatus()
        }
        this.dataSave = {}
        this.icon = {
            check: <SvgIcon path={path.mdiCheck} />,
            magnify: <SvgIcon path={path.mdiMagnify} />,
            progressAlert: <SvgIcon path={path.mdiProgress} />,
            progressPending: <SvgIcon path={path.progressPending} />,
            progressLock: <SvgIcon path={path.progressLock} />,
            progressCheck: <SvgIcon path={path.mdiProgressCheck} />,
            lock: <SvgIcon path={path.mdiLock} />,
            close: <SvgIcon path={path.mdiClose} />,
            accountVerify: <SvgIcon path={path.accountVerify} fill='#141414' />,
            bank: <SvgIcon path={path.bank} fill='#141414' />,
            checkAccount: <SvgIcon path={path.checkAccount} fill='#141414' />
        }
        this.addComponentToStack = this.addComponentToStack.bind(this);
        addEventListener(EVENTNAME.loginChanged, this.loginChanged)
    }
    addComponentToStack(index, state = {}) {
        if (dataStorage.goldenLayoutMain) {
            dataStorage.goldenLayoutMain.addComponentToStack(index, state);
            return;
        }
        if (index === 'OpeningAccount') {
            showModal({
                component: OpeningAccount,
                className: 'allowNested'
            });
            return
        }
        if (index === 'AddGovernmentID') {
            showModal({
                component: AddGovernmentID,
                className: 'allowNested',
                props: {
                    listData: state
                }
            });
            return
        }
        if (index === 'BankAccountDetail') {
            showModal({
                component: BankAccountDetail,
                dataToOpen: this.dataSave,
                saveDateUpdate: this.saveDateUpdate
            });
            return
        }
        if (index === '') { }
    }

    saveDateUpdate = (data) => {
        this.dataSave = data;
    }
    getStepByStatus() {
        let step = 1;
        switch (this.status) {
            case '' || null || undefined: return 1
            case ACCOUNT_STATUS.EKYC_PENDING:
            case ACCOUNT_STATUS.EKYC_IN_PROGRESS:
            case ACCOUNT_STATUS.EKYC_MORE_INFO:
            case ACCOUNT_STATUS.EKYC_INTERACTIVE_LOCKED_OUT:
            case ACCOUNT_STATUS.EKYC_LOCKED_OUT: return 2
            case ACCOUNT_STATUS.BANK_PENDING:
            case ACCOUNT_STATUS.BANK_SUBMITTED: return 3
            case ACCOUNT_STATUS.MORRISON_PENDING:
            case ACCOUNT_STATUS.MORRISON_CANCELLED:
            case ACCOUNT_STATUS.MORRISON_IN_REFERRED: return 4
            case ACCOUNT_STATUS.EKYC_AML_STATUS:
                showModal({
                    component: CreditHeader
                });
                step = 3;
                break;
            case ACCOUNT_STATUS.ACTIVE: return 5
            default: return 1
        }
        return step
    }
    showStep = (step) => {
        const data = dataStorage.openingAccount ? clone(dataStorage.openingAccount) : {}
        switch (step) {
            case 1: this.addComponentToStack('OpeningAccount')
                break
            case 2:
                if ([ACCOUNT_STATUS.EKYC_PENDING, ACCOUNT_STATUS.EKYC_LOCKED_OUT].includes(data[FIELD.ACCOUNT_STATUS])) return
                const listData = getDataAddGovernmentId(data)
                if (listData.length) {
                    this.addComponentToStack('AddGovernmentID', listData)
                }
                break
            case 3: this.addComponentToStack('BankAccountDetail', data)
                break
        }
    }
    currentStep() {
        const data = obj[this.state.step]
        if (!data) return null
        if (!dataStorage.env_config.roles.bannerStax) {
            return <div title={data[this.status].tooltip} onClick={() => { this.showStep(this.state.step) }}>{this.icon[data[this.status].icon]}</div>
        } else {
            return <div title={data[this.status].tooltip} onClick={() => { this.showStep(this.state.step) }}>{this.icon['progressAlert']}</div>
        }
    }

    loginChanged = () => {
        const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
        unregisterUser(userId, this.realTimeDataUser, 'ACCOUNT_OPENING')
        registerUser(userId, this.realTimeDataUser, 'ACCOUNT_OPENING')
        this.status = dataStorage.openingAccount && dataStorage.openingAccount.account_status
        if (dataStorage.openingAccount && dataStorage.openingAccount.applicant_details && dataStorage.openingAccount.applicant_details.length) {
            (dataStorage.openingAccount.applicant_details).forEach(e => {
                if (e.ekyc_overall_status !== ACCOUNT_STATUS.EKYC_IN_PROGRESS) {
                    let findGovermentIndex = (e.government_id || []).findIndex(x => x.ekyc_govid_status === ACCOUNT_STATUS.EKYC_PENDING)
                    if (findGovermentIndex !== -1) this.status = ACCOUNT_STATUS.EKYC_PENDING
                }
            });
        }
        this.setState({
            step: this.getStepByStatus()
        })
        if (dataStorage.env_config.roles.bannerStax && dataStorage.gotDraft && !dataStorage.openingAccount) {
            this.status = 'gotDraft'
            this.setState({ step: 2 })
        }
    }
    realTimeDataUser = obj => {
        const data = JSON.parse(obj)
        if (data) dataStorage.goldenLayout.alertNoAccount && dataStorage.goldenLayout.alertNoAccount.classList && dataStorage.goldenLayout.alertNoAccount.classList.remove('show')
        if (data && data[FIELD.ACCOUNT_STATUS]) {
            if (data[FIELD.APPLICANT_DETAILS] && typeof data[FIELD.APPLICANT_DETAILS] === 'string') {
                data[FIELD.APPLICANT_DETAILS] = JSON.parse(data[FIELD.APPLICANT_DETAILS])
            }
            if (data[FIELD.TRADE_CONFIRMATIONS] && typeof data[FIELD.TRADE_CONFIRMATIONS] === 'string') {
                data[FIELD.TRADE_CONFIRMATIONS] = JSON.parse(data[FIELD.TRADE_CONFIRMATIONS])
            }
            dataStorage.openingAccount = Object.assign(dataStorage.openingAccount || {}, data)
            dataStorage.mainMenuCallBack && dataStorage.mainMenuCallBack();
            this.status = dataStorage.openingAccount && dataStorage.openingAccount.account_status
            if (dataStorage.openingAccount.applicant_details && dataStorage.openingAccount.applicant_details.length) {
                (dataStorage.openingAccount.applicant_details).forEach(e => {
                    if (e.ekyc_overall_status !== ACCOUNT_STATUS.EKYC_IN_PROGRESS) {
                        let findGovermentIndex = (e.government_id || []).findIndex(x => x.ekyc_govid_status === ACCOUNT_STATUS.EKYC_PENDING)
                        if (findGovermentIndex !== -1) this.status = ACCOUNT_STATUS.EKYC_PENDING
                    }
                });
            }
            this.setState({
                step: this.getStepByStatus()
            })
        } else if (data[FIELD.APPLICANT_DETAILS]) {
            if (dataStorage.openingAccount && dataStorage.openingAccount[FIELD.APPLICANT_DETAILS]) {
                dataStorage.openingAccount[FIELD.APPLICANT_DETAILS] = data[FIELD.APPLICANT_DETAILS]
            }
        }
    }

    refreshData = async () => {
        let data = null
        await getData(getOpeningAccountUrl('/draft'))
            .then((res) => {
                if (res.data && !res.data.equix_id) {
                    data = res.data
                }
            }).catch(error => {
                console.error(`get darft opening account error ${error}`)
            })
        if (!data || !Object.keys(data).length) {
            await getData(getOpeningAccountUrl())
                .then(res => {
                    if (res.data) {
                        data = res.data && res.data[0]
                    }
                }).catch(error => {
                    console.error(`GET OPENING ACCOUNT ERROR: ${error}`);
                });
        }
        dataStorage.openingAccount = data
        this.status = dataStorage.openingAccount && dataStorage.openingAccount.account_status
        this.setState({
            step: this.getStepByStatus()
        })
    }

    componentDidMount() {
        try {
            const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
            addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
            registerUser(userId, this.realTimeDataUser, 'ACCOUNT_OPENING')
        } catch (error) {
            logger.log('error at banner realtime', error)
        }
    }
    componentWillUnmount() {
        const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
        unregisterUser(userId, this.realTimeDataUser, 'ACCOUNT_OPENING')
    }

    renderStep() {
        return (
            <div className={s.fullStep}>
                <div className={(this.state.step >= 1 ? s.bgIcon : null) + ' text-capitalize'}>
                    {(this.state.step === 1
                        ? <div style={{ background: 'var(--color-highlight)', border: '2px solid var(--ascend-default)', boxSizing: 'border-box' }} onClick={() => { this.showStep(1) }}>1</div> : <div>{this.icon['check']}</div>)}
                    <Lang>lang_registration_form</Lang>
                </div>
                <div className={s.line + ' ' + (this.state.step > 1 ? s.bgLine : null)}></div>
                <div className={(this.state.step >= 2 ? s.bgIcon : null)}>
                    {this.state.step >= 2
                        ? (this.state.step === 2
                            ? this.currentStep()
                            : <div title={this.status === ACCOUNT_STATUS.BANK_PENDING ? 'We have successfully verified you with our KYC provider!' : null}>{this.icon['check']}</div>)
                        : <div>2</div>
                    }
                    eKYC
                </div>
                <div className={s.line + ' ' + (this.state.step > 2 ? s.bgLine : null)}></div>
                <div className={(this.state.step >= 3 ? s.bgIcon : null) + ' text-capitalize'}>
                    {this.state.step >= 3
                        ? (this.state.step === 3
                            ? this.currentStep() : <div>{this.icon['check']}</div>)
                        : <div>3</div>}
                    <Lang>lang_bank_account_detail</Lang>
                </div>
                <div className={s.line + ' ' + (this.state.step > 3 ? s.bgLine : null)}></div>
                <div className={(this.state.step >= 4 ? s.bgIcon : null) + ' text-capitalize'}>
                    {this.state.step >= 4
                        ? (this.state.step === 4
                            ? this.currentStep() : <div>{this.icon['check']}</div>)
                        : <div>4</div>}
                    <Lang>lang_processing_account</Lang>
                </div>
                <div className={s.line + ' ' + (this.state.step > 4 ? s.bgLine : null)}></div>
                <div className={(this.state.step > 4 ? s.bgIcon : null) + ' text-capitalize'}>
                    {this.state.step === 5 ? <div>{this.icon['check']}</div> : <div>5</div>}
                    <Lang>lang_done</Lang>
                </div>
            </div>
        )
    }
    renderStaxStep() {
        return (
            <div className={s.fullStep}>
                <div className={s.bgIcon + ' text-capitalize'}>
                    <div>{this.icon['check']}</div>
                    <Lang>lang_sign_up</Lang>
                </div>
                <div className={s.line + ' ' + (this.state.step > 1 ? s.bgLine : null)}></div>
                <div className={(this.state.step >= 2 ? s.bgIcon : null) + ' text-capitalize'}>
                    {this.state.step === 2 ? this.currentStep()
                        : <div onClick={() => { this.showStep(2) }}>{this.icon['accountVerify']}</div>}
                    <Lang>lang_verify_identity</Lang></div>
                <div className={s.line + ' ' + (this.state.step > 2 ? s.bgLine : null)}></div>
                <div className={(this.state.step >= 3 ? s.bgIcon : null) + ' text-capitalize'}>
                    {this.state.step === 3 && this.status !== ACCOUNT_STATUS.BANK_SUBMITTED ? this.currentStep()
                        : <div onClick={() => { this.showStep(3) }}>{this.icon['bank']}</div>}
                    <Lang>lang_setup_trading_account</Lang></div>
                <div className={s.line + ' ' + (this.state.step > 3 ? s.bgLine : null)}></div>
                <div className={(this.state.step >= 4 ? s.bgIcon : null) + ' text-capitalize'}>
                    {this.state.step === 4 ? this.currentStep()
                        : <div>{this.icon['checkAccount']}</div>}
                    <Lang>lang_trade</Lang></div>
            </div>
        )
    }

    render() {
        let checkShow = ''
        if (!checkRole(MapRoleComponent.OPENING_ACCOUNT)) return null
        if (!dataStorage.env_config.roles.bannerStax) checkShow = dataStorage.openingAccount && Object.keys(dataStorage.openingAccount).length && (dataStorage.userInfo.user_type === userTypeEnum.RETAIL) && ![ACCOUNT_STATUS.INACTIVE, ACCOUNT_STATUS.ACTIVE].includes(this.status)
        else {
            checkShow = checkShowOpeningAccountStax()
            dataStorage.goldenLayout.alertNoAccount && dataStorage.goldenLayout.alertNoAccount.classList && dataStorage.goldenLayout.alertNoAccount.classList.remove('show')
        }
        return (
            (checkShow === true
                ? <div className={s.banner} style={dataStorage.env_config.roles.bannerStax ? { boxShadow: 'var(--shadow)' } : {}}>
                    <div className={s.title + ' firstLetterUpperCase'}><Lang>lang_hover_on_each_step</Lang></div>
                    {!dataStorage.env_config.roles.bannerStax ? this.renderStep() : this.renderStaxStep()}
                </div>
                : null)
        )
    }
}
