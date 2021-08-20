import React from 'react'
import { jsPDF as JsPDF } from 'jspdf'
import s from './OpeningAccount.module.css'
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon'
import Lang from '../Inc/Lang/Lang'
import uuidv4 from 'uuid/v4';
import { ACCOUNT_TYPE, FIELD, SCREEN, BUTTON, OPTIONS, MAPPING_ACCOUNT_TYPE, RELATIONSHIP_TYPE, METHOD, FIELD_BY_ACCOUNT_TYPE, SETTLEMENT_METHOD, FIELD_BY_APPLICANT_DETAILS_SCREEN, GOVERNMENT_ID_TYPE } from './constant'
import AccountType from './Screens/AccountType'
import PrimaryApplicant from './Screens/PrimaryApplicant'
import TrustDetails from './Screens/TrustDetails'
import SuperFundDetails from './Screens/SuperFundDetails'
import CompanyDetails from './Screens/CompanyDetails'
import SettlementDetails from './Screens/SettlementDetails'
import TradeConfirmations from './Screens/TradeConfirmations'
import NumberOfApplicant from './Screens/NumberOfApplicant'
import ApplicantsDetails from './Screens/ApplicantsDetails'
import { clone, capitalizeFirstLetter } from '../../helper/functionUtils'
import { getOpeningAccountUrl, postData, putData, getData, deleteData, getUrlAddressMetaData } from '../../helper/request'
import dataStorage from '../../dataStorage'
import CloseApplication from './PopUp/CloseApplication'
import CreditHeader from './PopUp/CreditHeader'
import Important from './PopUp/Important'
import SaveDraft from './PopUp/SaveDraft'
import showModal from '../Inc/Modal';
import { EVENTNAME, dispatchEvent, addEventListener, removeEventListener } from '../../helper/event'
import Button, { buttonSize, buttonType } from '../Elements/Button/Button';
import CryptoJS from 'react-native-crypto-js';
import role from '../../constants/role';
import logger from '../../helper/log';

const EMPTY_VALUE = ''
const LIST_ACCOUNT_TYPE_COMPANY = [ACCOUNT_TYPE.COMPANY, ACCOUNT_TYPE.TRUST_COMPANY, ACCOUNT_TYPE.SUPER_FUND_COMPANY]
const LIST_ACCOUNT_TYPE_JOINT_INDIVIDUAL = [ACCOUNT_TYPE.INDIVIDUAL, ACCOUNT_TYPE.JOINT, ACCOUNT_TYPE.TRUST_INDIVIDUAL, ACCOUNT_TYPE.SUPER_FUND_INDIVIDUAL]

export default class OpeningAccount extends React.Component {
    constructor(props) {
        super(props)
        const isRetail = dataStorage.userInfo && dataStorage.userInfo.user_type === role.RETAIL
        this.OBJ_DEFAULT = {
            [FIELD.STEP_SCREEN]: SCREEN.ACCOUNT_TYPE.value,
            [FIELD.LATEST_SCREEN]: SCREEN.ACCOUNT_TYPE.value,
            [FIELD.ACCOUNT_TYPE]: ACCOUNT_TYPE.INDIVIDUAL,
            [FIELD.APPLICANT_DETAILS]: [{
                [FIELD.FIRST_NAME]: (isRetail && dataStorage.userInfo[FIELD.FIRST_NAME]) || EMPTY_VALUE,
                [FIELD.MIDDLE_NAME]: (isRetail && dataStorage.userInfo[FIELD.MIDDLE_NAME]) || EMPTY_VALUE,
                [FIELD.LAST_NAME]: (isRetail && dataStorage.userInfo[FIELD.LAST_NAME]) || EMPTY_VALUE,
                [FIELD.APPLICANT_MOBILE_PHONE]: (isRetail && dataStorage.userInfo['phone']) || EMPTY_VALUE,
                [FIELD.APPLICANT_EMAIL]: (isRetail && dataStorage.userInfo[FIELD.EMAIL]) || EMPTY_VALUE,
                [FIELD.DOB]: (isRetail && dataStorage.userInfo[FIELD.DOB]) || EMPTY_VALUE,
                [FIELD.RESIDENTIAL_ADDRESS_STREET_NUMBER]: (isRetail && dataStorage.userInfo['street_number']) || EMPTY_VALUE,
                [FIELD.RESIDENTIAL_ADDRESS_UNIT_FLAT_NUMBER]: (isRetail && dataStorage.userInfo['unit_flat_number']) || EMPTY_VALUE,
                [FIELD.RESIDENTIAL_ADDRESS_STREET_NAME]: (isRetail && dataStorage.userInfo['street_name']) || EMPTY_VALUE,
                [FIELD.RESIDENTIAL_ADDRESS_STREET_TYPE]: (isRetail && dataStorage.userInfo['street_type']) || EMPTY_VALUE,
                [FIELD.RESIDENTIAL_ADDRESS_CITY_SUBURB]: (isRetail && dataStorage.userInfo['city_suburb']) || EMPTY_VALUE,
                [FIELD.RESIDENTIAL_ADDRESS_STATE]: (isRetail && dataStorage.userInfo['address_state']) || EMPTY_VALUE,
                [FIELD.RESIDENTIAL_ADDRESS_POSTCODE]: (isRetail && dataStorage.userInfo['address_postcode']) || EMPTY_VALUE,
                [FIELD.RESIDENTIAL_ADDRESS_ADDRESS_LINE_1]: (isRetail && dataStorage.userInfo['address_line_1']) || EMPTY_VALUE,
                [FIELD.RESIDENTIAL_ADDRESS_ADDRESS_LINE_2]: (isRetail && dataStorage.userInfo['address_line_2']) || EMPTY_VALUE,
                [FIELD.RESIDENTIAL_ADDRESS_FULL_ADDRESS]: (isRetail && dataStorage.userInfo['full_address']) || EMPTY_VALUE,
                [FIELD.GOVERNMENT_ID]: [{
                    [FIELD.FIRST_NAME_ON_CARD]: (isRetail && dataStorage.userInfo[FIELD.FIRST_NAME]) || EMPTY_VALUE,
                    [FIELD.MIDDLE_NAME_ON_CARD]: (isRetail && dataStorage.userInfo[FIELD.MIDDLE_NAME]) || EMPTY_VALUE,
                    [FIELD.LAST_NAME_ON_CARD]: (isRetail && dataStorage.userInfo[FIELD.LAST_NAME]) || EMPTY_VALUE
                }]
            }]
        }
        this.obj = props.data || clone(this.OBJ_DEFAULT)
        if (dataStorage.openingAccount && dataStorage.openingAccount[FIELD.EQUIX_ID]) dataStorage.openingAccount = this.obj
        if (!this.obj[FIELD.STEP_SCREEN]) this.obj[FIELD.STEP_SCREEN] = `${SCREEN.ACCOUNT_TYPE.value}`
        if (!this.obj[FIELD.LATEST_SCREEN]) this.obj[FIELD.LATEST_SCREEN] = this.obj[FIELD.STEP_SCREEN]
        if (!this.obj[FIELD.APPLICANT_DETAILS]) this.obj[FIELD.APPLICANT_DETAILS] = [{}]
        if (this.obj[FIELD.COMPANY_SAME_AS_ROA] === null || this.obj[FIELD.COMPANY_SAME_AS_ROA] === undefined) this.obj[FIELD.COMPANY_SAME_AS_ROA] = false
        this.errorObj = this.obj[FIELD.ERRORS] || {}
        this.state = {
            curScreen: this.obj[FIELD.STEP_SCREEN]
        }
        this.saveMess = false
        this.listButton = this.getListButton(this.obj[FIELD.STEP_SCREEN])
        this.isConnected = dataStorage.connected;
    }

    componentDidMount() {
        addEventListener(EVENTNAME.connectionChanged, this.changeConnection)
    }
    changeConnection = (isConnected) => {
        if (isConnected !== this.isConnected) {
            this.isConnected = isConnected;
            this.forceUpdate();
        }
    }
    renderHeader() {
        return <div className={s.header}>
            <div className={s.title + ' ' + 'showTitle text-capitalize'}><Lang>lang_open_trading_account</Lang></div>
            <div className={s.icon} onClick={() => this.onClose()}><SvgIcon path={path.mdiClose} /></div>
        </div>
    }

    getProps() {
        const accountType = this.obj[FIELD.ACCOUNT_TYPE]
        switch (this.state.curScreen) {
            case SCREEN.ACCOUNT_TYPE.value:
                return {
                    component: AccountType,
                    title: 'lang_new_trading_account'
                }
            case SCREEN.PRIMARY_APPLICANT.value: return {
                component: PrimaryApplicant,
                title: 'lang_primary_applicant'
            }
            case SCREEN.TRUST_DETAILS.value: return {
                component: TrustDetails,
                title: 'lang_trust_details'
            }
            case SCREEN.SUPER_FUND_DETAILS.value: return {
                component: SuperFundDetails,
                title: 'lang_super_fund_details'
            }
            case SCREEN.NUMBER_OF_APPLICANT.value: return {
                component: NumberOfApplicant,
                title: MAPPING_ACCOUNT_TYPE[accountType].NUMBER_OF_APPLICANT
            }
            case SCREEN.COMPANY_DETAILS.value: return {
                component: CompanyDetails,
                title: 'lang_company_details'
            }
            case SCREEN.SETTLEMENT_DETAILS.value: return {
                component: SettlementDetails,
                title: 'lang_settlement_details'
            }
            case SCREEN.TRADE_CONFIRMATIONS.value: return {
                component: TradeConfirmations,
                title: 'lang_trade_confirmations'
            }
            case SCREEN.APPLICANTS_DETAILS.value: return {
                component: ApplicantsDetails,
                typeAppllicant: MAPPING_ACCOUNT_TYPE[accountType].TYPE_APPLICANT,
                index: 0,
                title: MAPPING_ACCOUNT_TYPE[accountType].APPLICANT_DETAIL
            }
            default:
                const index = parseInt(this.state.curScreen.split('_').pop()) - 1
                const isLast = index === this.obj[FIELD.APPLICANT_DETAILS].length - 1
                return {
                    component: ApplicantsDetails,
                    typeAppllicant: MAPPING_ACCOUNT_TYPE[accountType].TYPE_APPLICANT,
                    index,
                    title: MAPPING_ACCOUNT_TYPE[accountType].APPLICANT_DETAIL
                }
        }
    }

    getListScreen() {
        const accountType = this.obj[FIELD.ACCOUNT_TYPE]
        const listScreen = [SCREEN.ACCOUNT_TYPE, SCREEN.PRIMARY_APPLICANT]
        if ([ACCOUNT_TYPE.TRUST_COMPANY, ACCOUNT_TYPE.TRUST_INDIVIDUAL].includes(accountType)) listScreen.push(SCREEN.TRUST_DETAILS)
        if ([ACCOUNT_TYPE.SUPER_FUND_COMPANY, ACCOUNT_TYPE.SUPER_FUND_INDIVIDUAL].includes(accountType)) listScreen.push(SCREEN.SUPER_FUND_DETAILS)
        if ([ACCOUNT_TYPE.COMPANY, ACCOUNT_TYPE.TRUST_COMPANY, ACCOUNT_TYPE.SUPER_FUND_COMPANY].includes(accountType)) listScreen.push(SCREEN.COMPANY_DETAILS)
        if (!dataStorage.env_config.roles.removeSettlementDetails) listScreen.push(SCREEN.SETTLEMENT_DETAILS)
        listScreen.push(SCREEN.TRADE_CONFIRMATIONS)
        if (!dataStorage.env_config.roles.removeNumberOfApplicant) listScreen.push(SCREEN.NUMBER_OF_APPLICANT)
        listScreen.push(SCREEN.APPLICANTS_DETAILS)
        const listApplicant = this.obj[FIELD.APPLICANT_DETAILS] || []
        if (listApplicant.length > 1) {
            for (let index = 1; index <= listApplicant.length; index++) {
                listScreen.push({
                    label: `lang_applicant`,
                    value: `${SCREEN.APPLICANTS_DETAILS.value}_${index}`,
                    index
                })
            }
        }
        return listScreen
    }

    renderLeftContent() {
        let listScreen = this.getListScreen()
        const latestScreen = this.obj[FIELD.LATEST_SCREEN]
        const currentScreen = this.state.curScreen
        const dicError = this.errorObj
        const priority = Object.values(listScreen).reduce((acc, cur, i) => Object.assign(acc, { [cur.value]: i }), {})
        return <div className={s.leftContent}>
            {
                listScreen.map((e, i) => {
                    const isSub = e.hasOwnProperty('index')
                    const isPass = priority[e.value] <= priority[latestScreen]
                    const isActive = currentScreen.includes(e.value)
                    let isErrorScreen = dicError[e.value] && currentScreen !== e.value
                    if (e.value === SCREEN.APPLICANTS_DETAILS.value && latestScreen.includes(`${SCREEN.APPLICANTS_DETAILS.value}_`)) isErrorScreen = false
                    return <div key={`leftContent_item_${i}`} className={`${s.screenName} ${isActive ? s.active : ''} ${isPass ? s.pass : ''} ${isSub ? s.subMenu : ''}`}
                        onClick={() => isPass && this.setScreen(e)}>
                        <div className={s.nameContainer + ' ' + 'showTitle text-capitalize' + ' ' + (isErrorScreen ? s.isErrorScreen : '')}>
                            <div className={s.circle} />
                            <Lang>{e.label}</Lang>
                            {isSub ? <span>{` ${e.index}`}</span> : null}
                        </div>
                    </div>
                })
            }
        </div>
    }

    getNextScreen() {
        const listScreen = this.getListScreen()
        const priority = Object.values(listScreen).reduce((acc, cur, i) => Object.assign(acc, { [cur.value]: i }), {})
        const curScreenIndex = priority[this.state.curScreen]
        let nextIndex = curScreenIndex + 1
        if (this.obj[FIELD.APPLICANT_DETAILS].length > 1 && this.state.curScreen === SCREEN.NUMBER_OF_APPLICANT.value) {
            nextIndex += 1
        }
        const nextScreen = listScreen[nextIndex]
        const latestIndex = priority[this.obj[FIELD.LATEST_SCREEN]]
        if (nextIndex > latestIndex) {
            this.obj[FIELD.STEP_SCREEN] = nextScreen.value
            this.obj[FIELD.LATEST_SCREEN] = nextScreen.value
        }
        return nextScreen
    }

    getBackScreen() {
        const listScreen = this.getListScreen()
        const priority = Object.values(listScreen).reduce((acc, cur, i) => Object.assign(acc, { [cur.value]: i }), {})
        const curScreenIndex = priority[this.state.curScreen]
        let prevIndex = curScreenIndex - 1
        if (this.obj[FIELD.APPLICANT_DETAILS].length > 1 && this.state.curScreen === `${SCREEN.APPLICANTS_DETAILS.value}_1`) {
            prevIndex -= 1
        }
        return listScreen[prevIndex] || 0
    }

    setScreen(screen) {
        let valueScreen = screen.value
        if (valueScreen === SCREEN.APPLICANTS_DETAILS.value && this.obj[FIELD.APPLICANT_DETAILS].length > 1) {
            valueScreen = `${SCREEN.APPLICANTS_DETAILS.value}_${1}`
        }
        this.listButton = this.getListButton(valueScreen)
        this.setState({ curScreen: valueScreen })
        this._scroll && (this._scroll.scrollTop = 0)
    }

    setDefaultValueForScreen() {
        const obj = clone(this.obj)
        if (!obj[FIELD.TRADE_CONFIRMATIONS] || !obj[FIELD.TRADE_CONFIRMATIONS][0] ||
            !obj[FIELD.TRADE_CONFIRMATIONS][0][FIELD.METHOD] || !obj[FIELD.TRADE_CONFIRMATIONS][0][FIELD.EMAIL]) {
            if (!obj[FIELD.TRADE_CONFIRMATIONS]) obj[FIELD.TRADE_CONFIRMATIONS] = [{}]
            obj[FIELD.TRADE_CONFIRMATIONS][0][FIELD.METHOD] = METHOD.EMAIL
            if (LIST_ACCOUNT_TYPE_COMPANY.includes(obj[FIELD.ACCOUNT_TYPE])) {
                obj[FIELD.COMPANY_EMAIL] && (obj[FIELD.TRADE_CONFIRMATIONS][0][FIELD.EMAIL] = obj[FIELD.COMPANY_EMAIL])
            } else {
                if (obj[FIELD.APPLICANT_DETAILS] && obj[FIELD.APPLICANT_DETAILS][0] &&
                    obj[FIELD.APPLICANT_DETAILS][0][FIELD.APPLICANT_EMAIL]) {
                    (obj[FIELD.TRADE_CONFIRMATIONS][0][FIELD.EMAIL] = obj[FIELD.APPLICANT_DETAILS][0][FIELD.APPLICANT_EMAIL])
                }
            }
            Object.assign(this.obj, obj)
        }
    }

    onNext() {
        if (this.isValid()) {
            const nextScreen = this.getNextScreen()
            if (nextScreen.value === SCREEN.TRADE_CONFIRMATIONS.value) this.setDefaultValueForScreen()
            this.setScreen(nextScreen)
        }
    }

    onBack() {
        const backScreen = this.getBackScreen()
        this.setScreen(backScreen)
    }

    onRestart() {
        this.obj = clone(this.OBJ_DEFAULT)
        this.errorObj = {}
        this.setScreen(SCREEN.ACCOUNT_TYPE)
    }

    setError = (errorCount) => {
        this.errorObj[this.state.curScreen] = errorCount
        const applicant1 = `${SCREEN.APPLICANTS_DETAILS.value}_${1}`
        if (this.errorObj.hasOwnProperty(applicant1)) {
            this.errorObj[SCREEN.APPLICANTS_DETAILS.value] = this.errorObj[applicant1]
        }
    }

    onChange(obj = {}, errorCount = 0) {
        this.setError(errorCount)
        if (obj[FIELD.ACCOUNT_TYPE] !== this.obj[FIELD.ACCOUNT_TYPE] || obj[FIELD.APPLICANT_DETAILS].length !== this.obj[FIELD.APPLICANT_DETAILS].length) {
            if (obj[FIELD.ACCOUNT_TYPE] !== this.obj[FIELD.ACCOUNT_TYPE]) {
                obj[FIELD.LATEST_SCREEN] = SCREEN.ACCOUNT_TYPE.value
                if (obj[FIELD.ACCOUNT_TYPE] === ACCOUNT_TYPE.JOINT) {
                    if (obj[FIELD.APPLICANT_DETAILS].length === 1) {
                        obj[FIELD.APPLICANT_DETAILS].push({})
                    }
                } else {
                    let curApplicants = obj[FIELD.APPLICANT_DETAILS]
                    curApplicants = curApplicants.filter(e => {
                        return e[FIELD.FIRST_NAME] || e[FIELD.LAST_NAME] || (e[FIELD.RELATIONSHIP_TYPE] &&
                            e[FIELD.RELATIONSHIP_TYPE] !== RELATIONSHIP_TYPE.OWNER) || (e[FIELD.TITLE] && e[FIELD.TITLE] !== 'MR')
                    })
                    if (curApplicants.length === 0) curApplicants = [{}]
                    obj[FIELD.APPLICANT_DETAILS] = curApplicants
                }
                for (let index = 0; index < obj[FIELD.APPLICANT_DETAILS].length; index++) {
                    const element = obj[FIELD.APPLICANT_DETAILS][index];
                    const relationshipType = element[FIELD.RELATIONSHIP_TYPE] && Array.isArray(element[FIELD.RELATIONSHIP_TYPE]) ? element[FIELD.RELATIONSHIP_TYPE] : [element[FIELD.RELATIONSHIP_TYPE]]
                    const type = OPTIONS.RELATIONSHIP_TYPE[obj[FIELD.ACCOUNT_TYPE]].find(e => relationshipType.includes(e.value))
                    if (!type) delete obj[FIELD.APPLICANT_DETAILS][index][FIELD.RELATIONSHIP_TYPE]
                }
            }
            if (Object.keys(obj[FIELD.APPLICANT_DETAILS][0]).length && obj[FIELD.APPLICANT_DETAILS].length < this.obj[FIELD.APPLICANT_DETAILS].length) {
                if (obj[FIELD.APPLICANT_DETAILS].length) obj[FIELD.LATEST_SCREEN] = SCREEN.APPLICANTS_DETAILS.value
                else obj[FIELD.LATEST_SCREEN] = `${SCREEN.APPLICANTS_DETAILS.value}_${obj[FIELD.APPLICANT_DETAILS].length}`
            }
            Object.assign(this.obj, obj)
            this.forceUpdate()
        } else {
            Object.assign(this.obj, obj)
        }
    }

    getListButton(screen = this.state.curScreen) {
        switch (screen) {
            case SCREEN.ACCOUNT_TYPE.value:
                return (
                    this.saveMess = false,
                    [BUTTON.NEXT, BUTTON.CANCEL])
            case SCREEN.PRIMARY_APPLICANT.value:
                return (
                    this.saveMess = false,
                    [BUTTON.NEXT, BUTTON.BACK, BUTTON.RESTART])
            case SCREEN.TRUST_DETAILS.value: case SCREEN.SUPER_FUND_DETAILS.value:
            case SCREEN.NUMBER_OF_APPLICANT.value: case SCREEN.COMPANY_DETAILS.value:
            case SCREEN.SETTLEMENT_DETAILS.value: case SCREEN.TRADE_CONFIRMATIONS.value:
                return (
                    this.saveMess = true,
                    [BUTTON.NEXT, BUTTON.BACK, BUTTON.SAVE_DRAFT])
            case SCREEN.APPLICANTS_DETAILS.value:
                return (
                    this.saveMess = true,
                    [BUTTON.SUBMIT, BUTTON.BACK, BUTTON.SAVE_DRAFT])
            default: if (screen.includes(`${SCREEN.APPLICANTS_DETAILS.value}_`)) {
                const lastIndex = this.obj[FIELD.APPLICANT_DETAILS].length
                const index = parseInt(screen.split('_').pop())
                if (index === lastIndex) {
                    return (
                        this.saveMess = true,
                        [BUTTON.SUBMIT, BUTTON.BACK, BUTTON.SAVE_DRAFT])
                } else {
                    return (
                        this.saveMess = true,
                        [BUTTON.NEXT, BUTTON.BACK, BUTTON.SAVE_DRAFT])
                }
            }
                return (
                    this.saveMess = true,
                    [BUTTON.NEXT, BUTTON.BACK, BUTTON.SAVE_DRAFT])
        }
    }

    onSaveDraft() {
        showModal({
            component: SaveDraft,
            props: {
                draft_id: this.props.draft_id,
                draft_name: this.props.draft_name,
                data: this.obj,
                errorObj: this.errorObj,
                closeForm: this.props.close
            }
        });
    }

    onDeleteDraft() {
        if (!this.props.draft_id) return;
        deleteData(getOpeningAccountUrl('/draft') + '?draft_id=' + this.props.draft_id)
            .then((res) => {
            }).catch(error => {
                console.error(`remove darft opening account error ${error}`)
            })
    }

    aiCheckForm = (data) => {
        try {
            switch (data[FIELD.SETTLEMENT_METHOD]) {
                case SETTLEMENT_METHOD.SPONSORED_NEW_HIN:
                case SETTLEMENT_METHOD.ISSUER_SPONSORED:
                    delete data[FIELD.SETTLEMENT_EXISTING_HIN]
                    delete data[FIELD.SETTLEMENT_PID]
                    delete data[FIELD.SETTLEMENT_SUPPLEMENTARY_REFERENCE]
                    break
                case SETTLEMENT_METHOD.SPONSORED_HIN_TRANSFER:
                    delete data[FIELD.SETTLEMENT_SUPPLEMENTARY_REFERENCE]
                    break
                case SETTLEMENT_METHOD.DVP:
                    delete data[FIELD.SETTLEMENT_EXISTING_HIN]
                    break
                default: break
            }
            if (data[FIELD.CMA_ACCOUNT_PURPOSE] !== 'OTHER') delete data[FIELD.CMA_ACCOUNT_PURPOSE_DESC]
            if (data[FIELD.CMA_SOURCE_OF_FUNDS] !== 'OTHER') delete data[FIELD.CMA_SOURCE_OF_FUNDS_DESC]
            if (!data[FIELD.TRUST_TAX_EXEMPTION]) delete data[FIELD.TRUST_TAX_EXEMPTION_DETAILS]
            else delete data[FIELD.TRUST_TFN]
            if (!data[FIELD.SUPER_FUND_TAX_EXEMPTION]) delete data[FIELD.SUPER_FUND_TAX_EXEMPTION_DETAILS]
            else delete data[FIELD.SUPER_FUND_TFN]
            if (!data[FIELD.COMPANY_TAX_EXEMPTION]) delete data[FIELD.COMPANY_TAX_EXEMPTION_DETAILS]
            else delete data[FIELD.COMPANY_TFN]
            if (data[FIELD.COMPANY_SAME_AS_ROA]) {
                data[FIELD.COMPANY_COUNTRY] = data[FIELD.ROA_COUNTRY] || '';
                data[FIELD.COMPANY_FULL_ADDRESS] = data[FIELD.COMPANY_ADDRESS] || '';
                data[FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_STREET_NUMBER] = data[FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_STREET_NUMBER] || '';
                data[FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_UNIT_FLAT_NUMBER] = data[FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_UNIT_FLAT_NUMBER] || '';
                data[FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_STREET_NAME] = data[FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_STREET_NAME] || '';
                data[FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_STREET_TYPE] = data[FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_STREET_TYPE] || '';
                data[FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CITY_SUBURB] = data[FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_CITY_SUBURB] || '';
                data[FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_STATE] = data[FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_STATE] || '';
                data[FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_POSTCODE] = data[FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_POSTCODE] || '';
                data[FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_ADDRESS_LINE_1] = data[FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_ADDRESS_LINE_1] || '';
                data[FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_ADDRESS_LINE_2] = data[FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_ADDRESS_LINE_2] || '';
            }
            data[FIELD.APPLICANT_DETAILS].forEach(x => {
                if (x[FIELD.SAME_AS_RA]) {
                    x[FIELD.POSTAL_ADDRESS_COUNTRY] = x[FIELD.RESIDENTIAL_ADDRESS_COUNTRY] || '';
                    x[FIELD.POSTAL_ADDRESS_FULL_ADDRESS] = x[FIELD.RESIDENTIAL_ADDRESS_FULL_ADDRESS] || '';
                    x[FIELD.POSTAL_ADDRESS_STREET_NUMBER] = x[FIELD.RESIDENTIAL_ADDRESS_STREET_NUMBER] || '';
                    x[FIELD.POSTAL_ADDRESS_UNIT_FLAT_NUMBER] = x[FIELD.RESIDENTIAL_ADDRESS_UNIT_FLAT_NUMBER] || '';
                    x[FIELD.POSTAL_ADDRESS_STREET_NAME] = x[FIELD.RESIDENTIAL_ADDRESS_STREET_NAME] || '';
                    x[FIELD.POSTAL_ADDRESS_STREET_TYPE] = x[FIELD.RESIDENTIAL_ADDRESS_STREET_TYPE] || '';
                    x[FIELD.POSTAL_ADDRESS_CITY_SUBURB] = x[FIELD.RESIDENTIAL_ADDRESS_CITY_SUBURB] || '';
                    x[FIELD.POSTAL_ADDRESS_STATE] = x[FIELD.RESIDENTIAL_ADDRESS_STATE] || '';
                    x[FIELD.POSTAL_ADDRESS_POSTCODE] = x[FIELD.RESIDENTIAL_ADDRESS_POSTCODE] || '';
                    x[FIELD.POSTAL_ADDRESS_ADDRESS_LINE_1] = x[FIELD.RESIDENTIAL_ADDRESS_ADDRESS_LINE_1] || '';
                    x[FIELD.POSTAL_ADDRESS_ADDRESS_LINE_2] = x[FIELD.RESIDENTIAL_ADDRESS_ADDRESS_LINE_2] || '';
                }
                if (!x.relationship_type.includes('OTHER')) {
                    delete x.relationship_description
                }
                if (!x.australian_tax_resident) {
                    x.tax_exemption = false;
                    delete x.tfn
                }
                if (!x.tax_exemption) {
                    delete x.tax_exemption_details
                } else delete x.tfn
                if (!x.uploaded_documents[0].document_type || !x.uploaded_documents[0].document_data) {
                    delete x.uploaded_documents
                }
                let uploadDocumentData = []
                const pushDocument = (obj) => {
                    if (Object.keys(obj).length) {
                        if (uploadDocumentData) {
                            uploadDocumentData.push(obj)
                        } else {
                            uploadDocumentData = [obj]
                        }
                    }
                }
                let obj = {}
                if (x.government_id && x.government_id[0].PASSPORT_PHOTO) {
                    obj.document_type = 'PASSPORT_PHOTO'
                    obj.document_data = x.government_id[0].PASSPORT_PHOTO
                }
                pushDocument(obj)
                obj = {}
                if (x.government_id && (x.government_id[0].DRIVER_LICENSE_PHOTO_FRONT || x.government_id[0].DRIVER_LICENSE_PHOTO_BACK)) {
                    obj.document_type = 'DRIVER_LICENSE_PHOTO'
                    const img1 = new Image()
                    const img2 = new Image()
                    var canvas = document.createElement('canvas')
                    canvas.id = 'upload_driver_license'
                    canvas.width = 630
                    canvas.height = 220
                    var ctx = canvas.getContext('2d')
                    // ctx.drawImage(img1, 10, 10, 200, 200)
                    // ctx.drawImage(img2, 210, 10, 200, 200)
                    img1.onload = () => {
                        ctx.drawImage(img1, 10, 10, 300, 200)
                    }
                    img1.src = x.government_id[0].DRIVER_LICENSE_PHOTO_FRONT
                    img2.onload = () => {
                        ctx.drawImage(img2, 320, 10, 300, 200)
                    }
                    img2.src = x.government_id[0].DRIVER_LICENSE_PHOTO_BACK
                    setTimeout(() => {
                        var imgData = canvas.toDataURL('image/jpeg', 1.0);
                        var pdf = new JsPDF();
                        pdf.addImage(imgData, 'JPEG', 0, 0);
                        const arrPDF = pdf.output('arraybuffer')
                        var binary = '';
                        var bytes = new Uint8Array(arrPDF);
                        var len = bytes.byteLength;
                        for (var i = 0; i < len; i++) {
                            binary += String.fromCharCode(bytes[i]);
                        }
                        obj.document_data = 'data:application/pdf;base64,' + window.btoa(binary)
                    }, 1000);
                }
                pushDocument(obj)

                if (x.uploaded_documents && x.uploaded_documents[0].document_datadocument_name) delete x.uploaded_documents[0].document_datadocument_name

                if (!x.government_id || !x.government_id[0].type) delete x.government_id
                else {
                    x.government_id.forEach(v => {
                        if (!v.first_name || (v.first_name && !(v.first_name + '').trim())) delete v.first_name
                        if (!v.middle_name || (v.middle_name && !(v.middle_name + '').trim())) delete v.middle_name
                        delete v.PASSPORT_PHOTO
                        delete v.DRIVER_LICENSE_PHOTO_BACK
                        delete v.DRIVER_LICENSE_PHOTO_FRONT
                        delete v.PASSPORT_PHOTOdocument_name
                        delete v.DRIVER_LICENSE_PHOTO_BACKdocument_name
                        delete v.DRIVER_LICENSE_PHOTO_FRONTdocument_name
                        if (v.type === 'DRIVER_LICENSE') {
                            delete v.medicare_name_on_card
                            delete v.medicare_individual_reference_number
                            delete v.medicare_card_colour
                            delete v.medicare_card_expiry_date
                            for (let i = 0; i < uploadDocumentData.length; i++) {
                                if (uploadDocumentData[i].document_type === 'DRIVER_LICENSE_PHOTO') {
                                    if (!x.uploaded_documents) x.uploaded_documents = []
                                    x.uploaded_documents.push(uploadDocumentData[i])
                                }
                            }
                        } else if (v.type === 'MEDICARE_CARD') {
                            delete [FIELD.FIRST_NAME_ON_CARD]
                            delete [FIELD.MIDDLE_NAME_ON_CARD]
                            delete [FIELD.LAST_NAME_ON_CARD]
                            delete v.state_of_issue
                            delete v.last_name
                        } else if (v.type === 'PASSPORT') {
                            delete v.state_of_issue
                            delete v.medicare_name_on_card
                            delete v.medicare_individual_reference_number
                            delete v.medicare_card_colour
                            delete v.medicare_card_expiry_date
                            for (let i = 0; i < uploadDocumentData.length; i++) {
                                if (uploadDocumentData[i].document_type === 'PASSPORT_PHOTO') {
                                    if (!x.uploaded_documents) x.uploaded_documents = []
                                    x.uploaded_documents.push(uploadDocumentData[i])
                                }
                            }
                        }
                    })
                }
                Object.keys(x).forEach(v => {
                    if (x[v] === null || x[v] === undefined || x[v] === '') delete x[v]
                })
            })
            data.trade_confirmations.forEach(x => {
                if (x[FIELD.METHOD] === 'EMAIL') {
                    delete x.fax
                    delete x[FIELD.POSTAL_ADDRESS_COUNTRY]
                    delete x[FIELD.POSTAL_ADDRESS_FULL_ADDRESS]
                    delete x[FIELD.POSTAL_ADDRESS_STREET_NUMBER]
                    delete x[FIELD.POSTAL_ADDRESS_UNIT_FLAT_NUMBER]
                    delete x[FIELD.POSTAL_ADDRESS_STREET_NAME]
                    delete x[FIELD.POSTAL_ADDRESS_STREET_TYPE]
                    delete x[FIELD.POSTAL_ADDRESS_CITY_SUBURB]
                    delete x[FIELD.POSTAL_ADDRESS_STATE]
                    delete x[FIELD.POSTAL_ADDRESS_POSTCODE]
                    delete x[FIELD.POSTAL_ADDRESS_ADDRESS_LINE_1]
                    delete x[FIELD.POSTAL_ADDRESS_ADDRESS_LINE_2]
                }
                if (x[FIELD.METHOD] === 'FAX') {
                    delete x.email
                    delete x[FIELD.POSTAL_ADDRESS_COUNTRY]
                    delete x[FIELD.POSTAL_ADDRESS_FULL_ADDRESS]
                    delete x[FIELD.POSTAL_ADDRESS_STREET_NUMBER]
                    delete x[FIELD.POSTAL_ADDRESS_UNIT_FLAT_NUMBER]
                    delete x[FIELD.POSTAL_ADDRESS_STREET_NAME]
                    delete x[FIELD.POSTAL_ADDRESS_STREET_TYPE]
                    delete x[FIELD.POSTAL_ADDRESS_CITY_SUBURB]
                    delete x[FIELD.POSTAL_ADDRESS_STATE]
                    delete x[FIELD.POSTAL_ADDRESS_POSTCODE]
                    delete x[FIELD.POSTAL_ADDRESS_ADDRESS_LINE_1]
                    delete x[FIELD.POSTAL_ADDRESS_ADDRESS_LINE_2]
                }
                if (x[FIELD.METHOD] === 'POSTAL') {
                    delete x.email
                    delete x.fax
                }
            })
            if (!data[FIELD.ORGANIZATION_CODE]) {
                delete data[FIELD.ADVISOR_CODE]
                delete data[FIELD.BRANCH_CODE]
            }
        } catch (error) {
            logger.sendLogError({
                error: 'aiCheckForm exception',
                errorObj: error,
                body: this.obj
            })
        }
    }

    onSubmit = (cb) => {
        try {
            const obj = {};
            if (this.obj.company_registered_office_address_id) obj[this.obj.company_registered_office_address_id] = true;
            if (this.obj.company_principal_place_of_business_address_id) obj[this.obj.company_principal_place_of_business_address_id] = true;
            if (this.obj.trade_confirmations) {
                this.obj.trade_confirmations.forEach(item => {
                    if (item.postal_address_id) obj[item.postal_address_id] = true;
                })
            }
            if (this.obj.trade_confirmations) {
                this.obj.trade_confirmations.forEach(item => {
                    if (item.postal_address_id) obj[item.postal_address_id] = true;
                })
            }
            if (this.obj.applicant_details) {
                this.obj.applicant_details.forEach(item => {
                    if (item.postal_address_id) obj[item.postal_address_id] = true;
                    if (item.residential_address_id) obj[item.residential_address_id] = true;
                })
            }
            const lst = Object.keys(obj);
            if (lst.length) {
                const lstEncrypted = lst.map(id => encodeURIComponent(CryptoJS.AES.encrypt(id, 'QRPY36kzhjTNbQqF').toString()));
                const metaUrl = getUrlAddressMetaData(lstEncrypted.join(','), this.props.envConfig);
                getData(metaUrl).then((res) => {
                    const dic = {};
                    if (res.data && res.data.length) {
                        res.data.forEach(item => dic[item.id] = item);
                    }
                    const mapField = (obj, prefix) => {
                        const data = dic[obj[`${prefix}id`]];
                        delete obj[`${prefix}id`]
                        obj[`${prefix}street_number`] = data.street_number || '';
                        obj[`${prefix}unit_flat_number`] = data.unit_flat_number || '';
                        obj[`${prefix}street_name`] = data.street_name || '';
                        obj[`${prefix}street_type`] = data.street_type || '';
                        obj[`${prefix}city_suburb`] = data.city_suburb || '';
                        obj[`${prefix}state`] = data.state || '';
                        obj[`${prefix}postcode`] = data.postcode || '';
                        obj[`${prefix}full_address`] = data.full_address || '';
                        obj[`${prefix}address_line_1`] = data.address_line_1 || '';
                        obj[`${prefix}address_line_2`] = data.address_line_2 || '';
                    }
                    if (dic[this.obj.company_registered_office_address_id]) mapField(this.obj, 'company_registered_office_address_');
                    if (dic[this.obj.company_principal_place_of_business_address_id]) mapField(this.obj, 'company_principal_place_of_business_address_');
                    if (this.obj.trade_confirmations) {
                        this.obj.trade_confirmations.forEach(item => {
                            if (dic[item.postal_address_id]) mapField(item, 'postal_address_');
                        })
                    }
                    if (this.obj.applicant_details) {
                        this.obj.applicant_details.forEach(item => {
                            if (dic[item.postal_address_id]) mapField(item, 'postal_address_');
                            if (dic[item.residential_address_id]) mapField(item, 'residential_address_');
                        })
                    }
                    this.onSubmitStep2(cb);
                }).catch(error => {
                    logger.sendLogError({
                        error: 'get meta data address error',
                        errorObj: error,
                        body: this.obj
                    })
                    this.setState({ waiting: false });
                    if (error && error.response && error.response.errorCode) {
                        const errorText = `error_code_${error.response.errorCode}`
                        const text = dataStorage.translate(errorText) || 'Failed to create an account'
                        this.props.showError && this.props.showError(text)
                        logger.sendLogError('get meta data address error ' + text)
                    } else this.props.showError && this.props.showError('Failed to create an account')
                });
            } else {
                this.onSubmitStep2(cb);
            }
        } catch (error) {
            logger.sendLogError({
                error: 'onSubmit exception',
                errorObj: error,
                body: this.obj
            })
        }
    }
    onSubmitStep2 = (cb) => {
        try {
            const url = getOpeningAccountUrl()
            let data = clone(this.obj)
            const applicants = data[FIELD.APPLICANT_DETAILS]
            applicants.map(e => {
                delete e[FIELD.IS_ACCEPTED]
                if (dataStorage.env_config.roles.addRelationshipTypeDefault) e[FIELD.RELATIONSHIP_TYPE] = RELATIONSHIP_TYPE.OWNER
                if (e[FIELD.GOVERNMENT_ID] && (e[FIELD.GOVERNMENT_ID].length === 0 || !e[FIELD.GOVERNMENT_ID][0][FIELD.GOVERNMENT_ID_TYPE])) delete e[FIELD.GOVERNMENT_ID]
                if (e[FIELD.UPLOADED_DOCUMENTS && e[FIELD.UPLOADED_DOCUMENTS].length === 0]) delete e[FIELD.UPLOADED_DOCUMENTS]
                e[FIELD.FIRST_NAME] = capitalizeFirstLetter(e[FIELD.FIRST_NAME])
                e[FIELD.MIDDLE_NAME] && (e[FIELD.MIDDLE_NAME] = capitalizeFirstLetter(e[FIELD.MIDDLE_NAME]))
                e[FIELD.LAST_NAME] = capitalizeFirstLetter(e[FIELD.LAST_NAME])
                e[FIELD.EKYC_AML_CONSENT] = true
                e[FIELD.TOS_CONSENT] = true
                if (!e[FIELD.APPLICANT_ID]) e[FIELD.APPLICANT_ID] = uuidv4()
                if (e[FIELD.UPLOADED_DOCUMENTS]) {
                    for (let index = 0; index < e[FIELD.UPLOADED_DOCUMENTS].length; index++) {
                        delete e[FIELD.UPLOADED_DOCUMENTS][index][FIELD.DOCUMENT_NAME];
                    }
                }
                if (e[FIELD.RELATIONSHIP_TYPE] && Array.isArray(e[FIELD.RELATIONSHIP_TYPE])) {
                    e[FIELD.RELATIONSHIP_TYPE] = e[FIELD.RELATIONSHIP_TYPE].join('|')
                }
            })
            this.aiCheckForm(data)
            const objData = {}
            const listField = FIELD_BY_ACCOUNT_TYPE[data[FIELD.ACCOUNT_TYPE]]
            for (let index = 0; index < listField.length; index++) {
                const field = listField[index];
                if (field === FIELD.APPLICANT_DETAILS) {
                    objData[field] = []
                    const applicants = data[field]
                    for (let i = 0; i < applicants.length; i++) {
                        const applicant = applicants[i];
                        objData[field][i] = {}
                        for (let j = 0; j < FIELD_BY_APPLICANT_DETAILS_SCREEN.length; j++) {
                            const childField = FIELD_BY_APPLICANT_DETAILS_SCREEN[j];
                            if (applicant[childField] !== null && applicant[childField] !== undefined && applicant[childField] !== '') {
                                objData[field][i][childField] = applicant[childField]
                            }
                        }
                    }
                } else {
                    if (data[field] !== null && data[field] !== undefined && data[field] !== '') {
                        if (field === FIELD.SCHEDULE_CODE) {
                            objData[FIELD.TRADEABLE_PRODUCTS] = {
                                [FIELD.EQUITY]: data[field]
                            }
                        } else objData[field] = data[field]
                    }
                }
            }
            setTimeout(() => {
                let updatePhoto = {}
                for (let i = 0; i < objData.applicant_details.length; i++) {
                    const e = objData.applicant_details[i];
                    if (e.uploaded_documents && e.uploaded_documents.length > 1) {
                        updatePhoto[e.applicant_id] = [e.uploaded_documents.pop()]
                    }
                }
                if (dataStorage.env_config.roles.removeSettlementDetails) objData[FIELD.SETTLEMENT_METHOD] = SETTLEMENT_METHOD.SPONSORED_NEW_HIN
                objData.tos_ip = dataStorage.ipPublish || window.ipPublic || '1.1.1.1';
                objData.tos_user_agent = navigator.userAgent
                postData(url, objData, null, 60000).then((res) => {
                    let arrApplicantFalse = [];
                    const equixID = res.data.equix_id
                    let applicantData = []
                    res.data.ekyc_status.forEach(x => {
                        if (updatePhoto[x.applicant_id]) {
                            applicantData.push({
                                applicant_id: x.applicant_id,
                                gbg_verification_id: x.verification_id,
                                uploaded_documents: updatePhoto[x.applicant_id]
                            })
                        }
                        if (x.ekyc_aml_status === 'FALSE') arrApplicantFalse.push(x.applicant_id)
                    })
                    if (applicantData.length) {
                        const urlUpdateDoc = getOpeningAccountUrl(`?equix_id=${equixID}`)
                        let dataPut = { applicant_details: applicantData }
                        putData(urlUpdateDoc, dataPut, null, 60000).then((res) => {
                            this.onDeleteDraft();
                            cb && cb()
                            this.props.close()
                        }).catch(error => {
                            cb && cb()
                            console.error('onSubmit opening account', error)
                        })
                    } else {
                        this.onDeleteDraft();
                        cb && cb()
                        this.props.close()
                    }
                    let lstApplicantFalse = objData.applicant_details.filter(x => arrApplicantFalse.includes(x.applicant_id))
                    if (arrApplicantFalse.length) this.showCreditHeader(lstApplicantFalse)
                }).catch(error => {
                    cb && cb()
                    console.error('onSubmit opening account', error)
                    logger.sendLogError({
                        error: 'onSubmitStep2 postdata failed',
                        errorObj: error,
                        body: this.obj
                    })
                })
            }, 1001);
        } catch (error) {
            logger.sendLogError({
                error: 'onSubmitStep2 exception',
                errorObj: error,
                body: this.obj
            })
        }
    }
    showCreditHeader(lstApplicantFalse) {
        showModal({
            component: CreditHeader,
            lstData: lstApplicantFalse
        });
    }
    onClose() {
        showModal({
            component: CloseApplication,
            props: { closeAll: this.props.close, saveMess: this.saveMess },
            className: 'allowNested'
        });
    }
    onImportant() {
        try {
            if (dataStorage.web_config[dataStorage.web_config.common.project].roles.submitImmediately) this.onSubmit()
            else {
                const listScreen = this.getListScreen()
                const noError = Object.keys(this.errorObj).filter(screen => this.errorObj[screen] > 0 && listScreen.find(e => e.value === screen)).length === 0
                if (this.isValid() && noError) {
                    showModal({
                        component: Important,
                        props: {
                            submitAll: this.onSubmit,
                            closeAll: this.props.close,
                            submitText: 'lang_opening_account_submitted_text'
                        },
                        className: 'allowNested'
                    });
                }
            }
        } catch (error) {
            logger.sendLogError({
                error: 'onImportant exception',
                errorObj: error,
                body: this.obj
            })
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
            case BUTTON.RESTART:
                this.onRestart()
                break
            case BUTTON.SAVE_DRAFT:
                this.onSaveDraft()
                break
            case BUTTON.SUBMIT:
                this.onImportant()
                break
            case BUTTON.DELETE_DRAFT:
                this.onDeleteDraft()
                break
            case BUTTON.CANCEL:
            default: this.props.close()
                break
        }
    }

    renderButton() {
        const listLeftBtn = this.listButton.filter(x => ![BUTTON.NEXT, BUTTON.SUBMIT].includes(x))
        const listRightBtn = this.listButton.filter(x => [BUTTON.NEXT, BUTTON.SUBMIT].includes(x))
        return <div className={s.buttonGroup + ' ' + s.moreElement} ref={ref => this.refBtn = ref}>
            <div>
                {
                    listLeftBtn.map((e, i) => {
                        return <Button size={buttonSize.large} disabled={!this.isConnected} onClick={() => this.onBtnClick(e)} key={`button_item_${i}`} className={s.button}>
                            <div className={`${s.buttonContainer + ' ' + 'showTitle'}`}><Lang>{e}</Lang></div>
                        </Button>
                    })
                }
            </div>
            <div>
                {
                    listRightBtn.map((e, i) => {
                        return <Button type={[BUTTON.NEXT, BUTTON.SUBMIT].includes(e) ? buttonType.ascend : ''} size={buttonSize.large} disabled={!this.isConnected} onClick={() => this.onBtnClick(e)} key={`button_item_${i}`} className={s.button}>
                            <div className={`${s.buttonContainer + ' ' + 'showTitle'}`}><Lang>{e}</Lang></div>
                        </Button>
                    })
                }
            </div>
        </div>
    }

    callBackFn = (cb) => {
        cb && (this.isValid = cb)
    }

    renderRightContent() {
        return <div className={s.rightContent}>
            <MainScreen {...this.getProps()} data={clone(this.obj)}
                setRefScroll={ref => this._scroll = ref}
                onBtnClick={this.onBtnClick.bind(this)}
                onChange={this.onChange.bind(this)}
                callBackFn={this.callBackFn}
                marginForm={true} />
            {this.renderButton()}
        </div>
    }

    renderContent() {
        return <div className={s.content}>
            {this.renderLeftContent()}
            {this.renderRightContent()}
        </div>
    }

    render() {
        return <div className={s.container}>
            {this.renderHeader()}
            {this.renderContent()}
        </div>
    }
}

class MainScreen extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    renderTitle() {
        return <div className={s.mainTitle + ' ' + 'showTitle text-capitalize'}><Lang>{this.props.title}</Lang></div>
    }

    onBtnClick(btn) {
        this.props.onBtnClick && this.props.onBtnClick(btn)
    }

    render() {
        const Component = this.props.component
        return <div className={s.mainScreen}>
            {this.renderTitle()}
            <div className={s.scrollContainer} ref={ref => this.props.setRefScroll && this.props.setRefScroll(ref)}>
                {Component ? <Component key={uuidv4()} {...this.props} /> : null}
            </div>
        </div>
    }
}
