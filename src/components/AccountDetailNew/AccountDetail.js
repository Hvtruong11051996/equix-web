import React, { Component } from 'react'
import logger from '../../helper/log'
import dataStorage from '../../dataStorage'
import Lang from '../Inc/Lang/Lang'
import SearchAccount from '../SearchAccount/SearchAccount'
import {
    getSymbolAccountWhenFirstOpenLayout,
    resetAccountOfLayout,
    clone,
    getDataAddGovernmentId,
    checkRole,
    checkIsAdvisor
} from '../../helper/functionUtils'
import uuidv4 from 'uuid/v4'
import styles from './AccountDetail.module.css'
import ToggleLine from '../Inc/ToggleLine/ToggleLine';
import ButtonGroup from '../Inc/ButtonGroup/NewButtonGroup';
import { getOpeningAccountUrl, putData, createNewBranch, getData, getAllAccountNewUrl, editBranch, deleteData, getUrlAddressMetaData } from '../../helper/request'
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'
import Form, { TYPE as FORM_TYPE } from '../Inc/Form';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';
import FilterBox from '../Inc/FilterBox';
import Grid from '../Inc/CanvasGrid';
import MoreOption from '../Inc/MoreOption';
import countryOptions from '../../constants/country_options'
import { OPTIONS, FIELD, GOVERNMENT_ID_TYPE, METHOD, MAPPING_ACCOUNT_TYPE, ACCOUNT_TYPE, ACCOUNT_STATUS, UPLOAD_TYPE } from '../OpeningAccount/constant'
import SvgIcon, { path } from '../Inc/SvgIcon'
import showModal from '../Inc/Modal'
import DocumentUpload from './DocumentUpload'
import TradeConfirmations from './TradeConfirmations'
import AddGovernmentID from '../OpeningAccount/Screens/AddGovernmentID'
import { registerUser, unregisterUser, registerAllOrders, unregisterAllOrders } from '../../streaming'
import userTypeEnum from '../../constants/user_type_enum';
import MapRoleComponent from '../../constants/map_role_component'
import Button, { buttonType } from '../Elements/Button/Button'
import CryptoJS from 'react-native-crypto-js';
import showConfirm from '../Inc/Confirm';

const accountTypeOptions = {
    BANK_SUBMITTED: [
        { label: 'Bank Submited', value: ACCOUNT_STATUS.BANK_SUBMITTED },
        { label: 'Bank Pending', value: ACCOUNT_STATUS.BANK_PENDING },
        { label: 'Morrison Pending', value: ACCOUNT_STATUS.MORRISON_PENDING }
    ],
    CLOSED: [
        { label: 'lang_closed', value: 'CLOSED', className: 'text-uppercase' },
        { label: 'lang_active', value: 'ACTIVE', className: 'text-uppercase' },
        { label: 'lang_inactive', value: 'INACTIVE', className: 'text-uppercase' }
    ],
    ACTIVE: [
        { label: 'lang_active', value: 'ACTIVE', className: 'text-uppercase' },
        { label: 'lang_inactive', value: 'INACTIVE', className: 'text-uppercase' },
        { label: 'lang_closed', value: 'CLOSED', className: 'text-uppercase' }
    ],
    INACTIVE: [
        { label: 'lang_inactive', value: 'INACTIVE', className: 'text-uppercase' },
        { label: 'lang_active', value: 'ACTIVE', className: 'text-uppercase' },
        { label: 'lang_closed', value: 'CLOSED', className: 'text-uppercase' }
    ]
}
const MAPPING_GOVERMENT_TYPE = {
    DRIVER_LICENSE: 'driver license',
    MEDICARE_CARD: 'medicare card',
    PASSPORT: 'passport'
}

const governmentIconObj = {
    'EKYC_VERIFIED': {
        path: path.mdiCheckCircle,
        color: 'var(--semantic-success)'
    },
    'EKYC_PENDING': {
        path: path.mdiMagnify,
        color: 'var(--secondary-default)'
    },
    'EKYC_LOCKED_OUT': {
        path: path.mdiLock,
        color: 'var(--semantic-warning)'
    },
    'EKYC_IN_PROGRESS': {
        path: path.mdiCloseCircle,
        color: 'var(--semantic-danger)'
    }
}

class AccountDetail extends Component {
    constructor(props) {
        super(props)
        this.isMount = false
        const initState = this.props.loadState()
        this.collapse = initState.collapse ? 1 : 0
        if (initState.account && initState.account.tradeable_products) initState.account.tradeable_products_arr = Object.keys(initState.account.tradeable_products) || []
        this.state = {
            accObj: initState.account || {},
            valueFilter: initState.valueFilter || '',
            isEdit: false,
            listManage: []
        }
        this.dicBranchOpt = []
        props.receive({
            account: this.changeAccount
        })
        this.id = uuidv4();
        this.obj = {};
        this.slideIndex = 0;
        const userInfo = dataStorage.userInfo || {};
        this.accountTypeGroup = {
            account_type_question: {
                type: FORM_TYPE.GROUP,
                title: 'lang_account_info'
            },
            account_name: {
                title: 'lang_account_name',
                type: FORM_TYPE.LABEL
            },
            account_id: {
                title: 'lang_account_number',
                type: FORM_TYPE.LABEL
            },
            tradeable_products_arr: {
                title: 'lang_tradeable_products',
                type: 'tagRadius'
            },
            account_status: {
                title: 'lang_account_status',
                type: FORM_TYPE.BTN_NO_CLICK,
                align: 'right'
            },
            client_type: {
                title: 'lang_client_type',
                type: FORM_TYPE.NUMBER
            },
            account_type: {
                title: 'lang_account_type',
                type: FORM_TYPE.DROPDOWN,
                align: 'right',
                options: OPTIONS.ACCOUNT_TYPE
            },
            based_currency: {
                title: 'lang_based_currency',
                type: FORM_TYPE.DROPDOWN,
                align: 'right'
            },
            advisor_name: {
                title: 'lang_advisor',
                type: FORM_TYPE.DROPDOWN,
                align: 'right'
            },
            branch_code: {
                title: 'lang_branch_code',
                type: FORM_TYPE.DROPDOWN,
                align: 'right'
            },
            organization_code: {
                title: 'lang_organization_code',
                type: FORM_TYPE.DROPDOWN,
                align: 'right'
            },
            hin: {
                title: 'lang_hin',
                type: FORM_TYPE.STRING
            },
            branch: {
                title: 'lang_branch',
                type: FORM_TYPE.DROPDOWN,
                align: 'right'
            },
            gst_payable: {
                title: 'lang_gst_payable',
                type: FORM_TYPE.LABEL,
                translate: false,
                customFn: value => {
                    return value ? (value + '').toUpperCase() : value
                }
            },
            applicant_count: {
                title: 'lang_number_of_applicant',
                type: FORM_TYPE.STRING
            }
        }
        this.accountTypeGroupNotEdit = {
            account_type_question: {
                type: FORM_TYPE.GROUP,
                title: 'lang_account_info'
            },
            account_name: {
                title: 'lang_account_name',
                translate: false,
                type: FORM_TYPE.LABEL
            },
            account_id: {
                title: 'lang_account_number',
                type: FORM_TYPE.LABEL
            },
            tradeable_products_arr: {
                title: 'lang_tradeable_products',
                type: 'tagRadius'
            },
            account_status: {
                title: 'lang_account_status',
                type: FORM_TYPE.BTN_NO_CLICK,
                align: 'right'
            },
            client_type: {
                title: 'lang_client_type',
                type: FORM_TYPE.LABEL,
                translate: false,
                customFn: (value) => {
                    if (!value) return '--'
                    return (value + '').toCapitalize()
                }
            },
            account_type: {
                title: 'lang_account_type',
                type: FORM_TYPE.DROPDOWN,
                align: 'right',
                options: OPTIONS.ACCOUNT_TYPE,
                notEdit: true,
                disable: true
            },
            based_currency: {
                title: 'lang_based_currency',
                translate: false,
                type: FORM_TYPE.LABEL
            },
            advisor_name: {
                title: 'lang_advisor',
                type: FORM_TYPE.LABEL,
                translate: false,
                customFn: (value) => {
                    if (!value) return '--'
                    return (value + '').toCapitalize()
                }
            },
            branch_code: {
                title: 'lang_branch_code',
                translate: false,
                type: FORM_TYPE.LABEL
            },
            organization_code: {
                title: 'lang_organization_code',
                translate: false,
                type: FORM_TYPE.LABEL,
                customFn: (value) => {
                    if (!value) return '--'
                    return (value + '').toCapitalize()
                }
            },
            hin: {
                title: 'lang_hin',
                type: FORM_TYPE.LABEL
            },
            branch: userInfo.user_type === userTypeEnum.OPERATOR
                ? {
                    title: 'lang_vetting_rule_group',
                    type: FORM_TYPE.DROPDOWN,
                    translate: false,
                    options: this.dicBranchOpt
                }
                : {
                    title: 'lang_vetting_rule_group',
                    customFn: (value) => {
                        return ((dataStorage.branchObjDic[value] || value || '') + '').toCapitalize()
                    },
                    translate: false,
                    type: FORM_TYPE.LABEL
                },
            gst_payable: {
                title: 'lang_gst_payable',
                type: FORM_TYPE.LABEL,
                translate: false,
                customFn: value => {
                    return (value + '').toUpperCase()
                }
            },
            applicant_count: {
                title: 'lang_number_of_applicant',
                type: FORM_TYPE.LABEL
            }
        }
        this.accountTypeGroupEditAccountStatus = () => {
            return {
                account_type_question: {
                    type: FORM_TYPE.GROUP,
                    title: 'lang_account_info'
                },
                account_name: {
                    title: 'lang_account_name',
                    translate: false,
                    type: FORM_TYPE.LABEL
                },
                account_id: {
                    title: 'lang_account_number',
                    type: FORM_TYPE.LABEL
                },
                tradeable_products_arr: {
                    title: 'lang_tradeable_products',
                    type: 'tagRadius'
                },
                account_status: {
                    title: 'lang_account_status',
                    type: FORM_TYPE.BTN_NO_CLICK,
                    align: 'right',
                    options: accountTypeOptions[this.state.accObj.account_status],
                    rules: {
                        required: true
                    }
                },
                client_type: {
                    title: 'lang_client_type',
                    type: FORM_TYPE.LABEL,
                    customFn: (value) => {
                        if (!value) return '--'
                        return (value + '').toCapitalize()
                    }
                },
                account_type: {
                    title: 'lang_account_type',
                    type: FORM_TYPE.DROPDOWN,
                    align: 'right',
                    options: OPTIONS.ACCOUNT_TYPE,
                    notEdit: true,
                    disable: true
                },
                based_currency: {
                    title: 'lang_based_currency',
                    translate: false,
                    type: FORM_TYPE.LABEL
                },
                advisor_name: {
                    title: 'lang_advisor',
                    type: FORM_TYPE.LABEL,
                    translate: false,
                    customFn: (value) => {
                        if (!value) return '--'
                        return (value + '').toCapitalize()
                    }
                },
                branch_code: {
                    title: 'lang_branch_code',
                    type: FORM_TYPE.LABEL,
                    translate: false,
                    customFn: (value) => {
                        if (!value) return '--'
                        return (value + '').toCapitalize()
                    }
                },
                organization_code: {
                    title: 'lang_organization_code',
                    translate: false,
                    type: FORM_TYPE.LABEL,
                    customFn: (value) => {
                        if (!value) return '--'
                        return (value + '').toCapitalize()
                    }
                },
                hin: {
                    title: 'lang_hin',
                    type: FORM_TYPE.LABEL
                },
                branch: userInfo.user_type === userTypeEnum.OPERATOR
                    ? {
                        title: 'lang_vetting_rule_group',
                        type: FORM_TYPE.DROPDOWN,
                        translate: false,
                        options: this.dicBranchOpt
                    }
                    : {
                        title: 'lang_vetting_rule_group',
                        customFn: (value) => {
                            return ((dataStorage.branchObjDic[value] || value || '') + '').toCapitalize()
                        },
                        translate: false,
                        type: FORM_TYPE.LABEL
                    },
                gst_payable: {
                    title: 'lang_gst_payable',
                    type: FORM_TYPE.LABEL,
                    translate: false,
                    customFn: value => {
                        return (value + '').toUpperCase()
                    }
                },
                applicant_count: {
                    title: 'lang_number_of_applicant',
                    type: FORM_TYPE.LABEL
                }
            }
        }
        this.accountTypeGroupEditActive = () => {
            return {
                account_type_question: {
                    type: FORM_TYPE.GROUP,
                    title: 'lang_account_info'
                },
                account_name: {
                    title: 'lang_account_name',
                    translate: false,
                    type: FORM_TYPE.LABEL
                },
                account_id: {
                    title: 'lang_account_number',
                    type: FORM_TYPE.LABEL
                },
                tradeable_products_arr: {
                    title: 'lang_tradeable_products',
                    type: 'tagRadius'
                },
                account_status: {
                    title: 'lang_account_status',
                    type: FORM_TYPE.BTN_NO_CLICK,
                    align: 'right',
                    options: accountTypeOptions[this.state.accObj.account_status],
                    rules: {
                        required: true
                    }
                },
                client_type: {
                    title: 'lang_client_type',
                    type: FORM_TYPE.LABEL,
                    customFn: (value) => {
                        if (!value) return '--'
                        return (value + '').toCapitalize()
                    }
                },
                account_type: {
                    title: 'lang_account_type',
                    type: FORM_TYPE.DROPDOWN,
                    align: 'right',
                    options: OPTIONS.ACCOUNT_TYPE,
                    notEdit: true,
                    disable: true
                },
                based_currency: {
                    title: 'lang_based_currency',
                    translate: false,
                    type: FORM_TYPE.LABEL
                },
                advisor_name: {
                    title: 'lang_advisor',
                    type: FORM_TYPE.LABEL,
                    translate: false,
                    customFn: (value) => {
                        if (!value) return '--'
                        return (value + '').toCapitalize()
                    }
                },
                branch_code: {
                    title: 'lang_branch_code',
                    type: FORM_TYPE.LABEL,
                    translate: false,
                    customFn: (value) => {
                        if (!value) return '--'
                        return (value + '').toCapitalize()
                    }
                },
                organization_code: {
                    title: 'lang_organization_code',
                    translate: false,
                    type: FORM_TYPE.LABEL,
                    customFn: (value) => {
                        if (!value) return '--'
                        return (value + '').toCapitalize()
                    }
                },
                hin: {
                    title: 'lang_hin',
                    type: FORM_TYPE.LABEL
                },
                branch: userInfo.user_type === userTypeEnum.OPERATOR
                    ? {
                        title: 'lang_vetting_rule_group',
                        type: FORM_TYPE.DROPDOWN,
                        translate: false,
                        options: this.dicBranchOpt
                    }
                    : {
                        title: 'lang_vetting_rule_group',
                        customFn: (value) => {
                            return ((dataStorage.branchObjDic[value] || value || '') + '').toCapitalize()
                        },
                        translate: false,
                        type: FORM_TYPE.LABEL
                    },
                gst_payable: {
                    title: 'lang_gst_payable',
                    type: FORM_TYPE.LABEL,
                    translate: false,
                    customFn: value => {
                        return (value + '').toUpperCase()
                    }
                },
                applicant_count: {
                    title: 'lang_number_of_applicant',
                    type: FORM_TYPE.LABEL
                }
            }
        }
        this.brokerageSchedulesGroup = {
            brokerage_schedules_title: {
                title: 'lang_brokerage_schedules',
                type: FORM_TYPE.GROUP
            },
            tradeable_products: {
                type: FORM_TYPE.OBJECT,
                properties: {

                }
            }
        }

        this.trustDetailsGroup = {
            trust_details_title: {
                type: FORM_TYPE.GROUP,
                title: 'lang_trust_details'
            },
            [FIELD.TRUST_NAME]: {
                type: FORM_TYPE.LABEL,
                title: 'lang_trust_name',
                titleClass: 'text-normal'
            },
            [FIELD.TRUST_ABN]: {
                type: FORM_TYPE.LABEL,
                title: 'lang_abn',
                titleClass: 'text-normal'
            },
            [FIELD.TRUST_TAX_EXEMPTION]: {
                type: FORM_TYPE.DROPDOWN,
                align: 'right',
                title: 'lang_tfn_exemption',
                titleClass: 'text-normal',
                options: [
                    { label: 'lang_tfn_', value: false },
                    { label: 'lang_exemption', value: true }
                ]
            },
            [FIELD.TRUST_TFN]: {
                type: FORM_TYPE.NUMBER,
                title: 'lang_tfn',
                titleClass: 'text-normal',
                condition: {
                    [FIELD.TRUST_TAX_EXEMPTION]: false
                }
            },
            [FIELD.TRUST_TAX_EXEMPTION_DETAILS]: {
                type: FORM_TYPE.DROPDOWN,
                align: 'right',
                title: 'lang_exemption_detail',
                options: [
                    {
                        'label': 'Under 16 years of age',
                        'value': 'Under 16 years of age'
                    },
                    {
                        'label': 'Pensioner receiving Social Security / Service Pension',
                        'value': 'Pensioner receiving Social Security / Service Pension'
                    },
                    {
                        'label': 'Recipient of other Social Security Pension or benefit',
                        'value': 'Recipient of other Social Security Pension or benefit'
                    },
                    {
                        'label': 'Not required to lodge a Tax Return',
                        'value': 'Not required to lodge a Tax Return'
                    },
                    {
                        'label': 'Norfolk Island Resident',
                        'value': 'Norfolk Island Resident'
                    },
                    {
                        'label': 'Non-resident of Australia',
                        'value': 'Non-resident of Australia'
                    }
                ],
                condition: {
                    [FIELD.TRUST_TAX_EXEMPTION]: true
                }
            },
            [FIELD.TRUST_ASSET_SOURCE_DETAILS]: {
                type: FORM_TYPE.LABEL,
                title: 'lang_asset_source'
            },
            [FIELD.TRUST_ACTIVITY]: {
                type: FORM_TYPE.LABEL,
                titleClass: 'text-normal',
                title: 'lang_trust_activity'
            },
            [FIELD.TRUST_COUNTRY_OF_ESTABLISHMENT]: {
                type: FORM_TYPE.LABEL,
                title: 'lang_country_of_establishment'
            },
            [FIELD.TRUST_TYPE]: {
                type: FORM_TYPE.LABEL
            }
        }

        this.trustDetailsGroupNotEdit = {
            trust_details_title: {
                type: FORM_TYPE.GROUP,
                title: 'lang_trust_details'
            },
            [FIELD.TRUST_NAME]: {
                type: FORM_TYPE.LABEL,
                title: 'lang_trust_name',
                titleClass: 'text-normal'
            },
            [FIELD.TRUST_ABN]: {
                type: FORM_TYPE.LABEL,
                title: 'lang_abn',
                titleClass: 'text-normal'
            },
            [FIELD.TRUST_TAX_EXEMPTION]: {
                type: FORM_TYPE.DROPDOWN,
                align: 'right',
                title: 'lang_tfn_exemption',
                titleClass: 'text-normal',
                options: [
                    { label: 'lang_tfn_', value: false },
                    { label: 'lang_exemption', value: true }
                ],
                notEdit: true,
                disable: true
            },
            [FIELD.TRUST_TFN]: {
                type: FORM_TYPE.LABEL,
                title: 'lang_tfn',
                titleClass: 'text-normal',
                condition: {
                    [FIELD.TRUST_TAX_EXEMPTION]: false
                }
            },
            [FIELD.TRUST_TAX_EXEMPTION_DETAILS]: {
                type: FORM_TYPE.DROPDOWN,
                align: 'right',
                title: 'lang_exemption_detail',
                options: [
                    {
                        'label': 'Under 16 years of age',
                        'value': 'Under 16 years of age'
                    },
                    {
                        'label': 'Pensioner receiving Social Security / Service Pension',
                        'value': 'Pensioner receiving Social Security / Service Pension'
                    },
                    {
                        'label': 'Recipient of other Social Security Pension or benefit',
                        'value': 'Recipient of other Social Security Pension or benefit'
                    },
                    {
                        'label': 'Not required to lodge a Tax Return',
                        'value': 'Not required to lodge a Tax Return'
                    },
                    {
                        'label': 'Norfolk Island Resident',
                        'value': 'Norfolk Island Resident'
                    },
                    {
                        'label': 'Non-resident of Australia',
                        'value': 'Non-resident of Australia'
                    }
                ],
                condition: {
                    [FIELD.TRUST_TAX_EXEMPTION]: true
                },
                notEdit: true,
                disable: true
            },
            [FIELD.TRUST_ASSET_SOURCE_DETAILS]: {
                type: FORM_TYPE.LABEL,
                title: 'lang_asset_source'
            },
            [FIELD.TRUST_ACTIVITY]: {
                type: FORM_TYPE.LABEL,
                titleClass: 'text-normal',
                title: 'lang_trust_activity'
            },
            [FIELD.TRUST_COUNTRY_OF_ESTABLISHMENT]: {
                type: FORM_TYPE.LABEL,
                title: 'lang_country_of_establishment'
            },
            [FIELD.TRUST_TYPE]: {
                type: FORM_TYPE.LABEL
            }
        }
        this.superFundDetailsGroup = {
            super_fund_details_title: {
                title: 'lang_super_fund_details',
                type: FORM_TYPE.GROUP
            },
            [FIELD.SUPER_FUND_NAME]: {
                type: TYPE.LABEL,
                title: 'lang_fund_name'
            },
            [FIELD.SUPER_FUND_ABN]: {
                type: TYPE.LABEL,
                title: 'lang_abn',
                titleClass: 'text-normal'
            },
            [FIELD.SUPER_FUND_TAX_EXEMPTION]: {
                type: TYPE.DROPDOWN,
                title: 'lang_tfn_exemption',
                titleClass: 'text-normal',
                options: [
                    { label: 'lang_tfn_', value: false },
                    { label: 'lang_exemption', value: true }
                ]
            },
            [FIELD.SUPER_FUND_TFN]: {
                type: TYPE.NUMBER,
                title: 'lang_tfn',
                titleClass: 'text-normal',
                rules: {
                    number: true
                },
                condition: {
                    [FIELD.SUPER_FUND_TAX_EXEMPTION]: false
                }
            },
            [FIELD.SUPER_FUND_TAX_EXEMPTION_DETAILS]: {
                type: TYPE.DROPDOWN,
                title: 'lang_exemption_detail',
                options: [
                    {
                        label: 'lang_under_16_years_of_age',
                        value: 'Under 16 years of age'
                    },
                    {
                        label: 'lang_pensioner_receiving_social_security_service_pension',
                        value: 'Pensioner receiving Social Security / Service Pension'
                    },
                    {
                        label: 'lang_recipient_of_other_social_security_pension_or_benefit',
                        value: 'Recipient of other Social Security Pension or benefit'
                    },
                    {
                        label: 'lang_not_required_to_lodge_a_tax_return',
                        value: 'Not required to lodge a Tax Return'
                    },
                    {
                        label: 'lang_norfolk_island_resident',
                        value: 'Norfolk Island Resident'
                    },
                    {
                        label: 'lang_non_resident_of_australia',
                        value: 'Non-resident of Australia'
                    }
                ],
                condition: {
                    [FIELD.SUPER_FUND_TAX_EXEMPTION]: true
                }
            },
            [FIELD.SMSF]: {
                type: TYPE.LABEL,
                title: 'lang_self_managed_super_fund',
                customFn: (value) => {
                    return (value + '').toUpperCase();
                }
            }
        }
        this.superFundDetailsGroupNotEdit = {
            super_fund_details_title: {
                title: 'lang_super_fund_details',
                type: FORM_TYPE.GROUP
            },
            [FIELD.SUPER_FUND_NAME]: {
                type: TYPE.LABEL,
                title: 'lang_fund_name'
            },
            [FIELD.SUPER_FUND_ABN]: {
                type: TYPE.LABEL,
                title: 'lang_abn',
                titleClass: 'text-normal'
            },
            [FIELD.SUPER_FUND_TAX_EXEMPTION]: {
                type: TYPE.DROPDOWN,
                title: 'lang_tfn_exemption',
                titleClass: 'text-normal',
                options: [
                    { label: 'lang_tfn_', value: false },
                    { label: 'lang_exemption', value: true }
                ],
                notEdit: true,
                disable: true
            },
            [FIELD.SUPER_FUND_TFN]: {
                type: TYPE.LABEL,
                title: 'lang_tfn',
                titleClass: 'text-normal',
                condition: {
                    [FIELD.SUPER_FUND_TAX_EXEMPTION]: false
                }
            },
            [FIELD.SUPER_FUND_TAX_EXEMPTION_DETAILS]: {
                type: TYPE.DROPDOWN,
                title: 'lang_exemption_detail',
                options: [
                    {
                        label: 'lang_under_16_years_of_age',
                        value: 'Under 16 years of age'
                    },
                    {
                        label: 'lang_pensioner_receiving_social_security_service_pension',
                        value: 'Pensioner receiving Social Security / Service Pension'
                    },
                    {
                        label: 'lang_recipient_of_other_social_security_pension_or_benefit',
                        value: 'Recipient of other Social Security Pension or benefit'
                    },
                    {
                        label: 'lang_not_required_to_lodge_a_tax_return',
                        value: 'Not required to lodge a Tax Return'
                    },
                    {
                        label: 'lang_norfolk_island_resident',
                        value: 'Norfolk Island Resident'
                    },
                    {
                        label: 'lang_non_resident_of_australia',
                        value: 'Non-resident of Australia'
                    }
                ],
                notEdit: true,
                disable: true,
                condition: {
                    [FIELD.SUPER_FUND_TAX_EXEMPTION]: true
                }
            },
            [FIELD.SMSF]: {
                type: TYPE.LABEL,
                title: 'lang_self_managed_super_fund',
                customFn: (value) => {
                    return (value + '').toUpperCase();
                }
            }
        }

        this.companyDetailsGroup = {
            company_details_title: {
                title: 'lang_company_details',
                type: FORM_TYPE.GROUP
            },
            company_name: {
                type: FORM_TYPE.LABEL,
                title: 'lang_company_name'
            },
            company_type: {
                title: 'lang_company_type',
                type: FORM_TYPE.LABEL,
                customFn: (value) => {
                    if (!value) return '--'
                    const keyLang = (value + '').toBackEndTransKey()
                    return keyLang
                }
            },
            company_acn: {
                title: 'lang_acn',
                titleClass: 'text-normal',
                type: FORM_TYPE.LABEL
            },
            company_abn: {
                title: 'lang_abn',
                type: FORM_TYPE.LABEL,
                titleClass: 'text-normal'
            },
            company_tax_exemption: {
                title: 'lang_tfn_exemption',
                titleClass: 'text-normal',
                type: FORM_TYPE.DROPDOWN,
                align: 'right',
                options: [
                    { label: 'lang_tfn_', value: false },
                    { label: 'lang_exemption', value: true }
                ]
            },
            company_tfn: {
                title: 'lang_tfn',
                titleClass: 'text-normal',
                type: FORM_TYPE.STRING,
                condition: {
                    company_tax_exemption: false
                }
            },
            company_tax_exemption_details: {
                title: 'lang_exemption_detail',
                type: FORM_TYPE.DROPDOWN,
                align: 'right',
                options: [
                    {
                        label: 'lang_not_required_to_lodge_a_tax_return',
                        value: 'Not required to lodge a Tax Return'
                    },
                    {
                        label: 'lang_norfolk_island_resident',
                        value: 'Norfolk Island Resident'
                    },
                    {
                        label: 'lang_non_resident_of_australia',
                        value: 'Non-resident of Australia'
                    }
                ],
                condition: {
                    company_tax_exemption: true
                }
            },
            company_industry: {
                type: FORM_TYPE.LABEL,
                title: 'lang_company_industry'
            },
            company_nature_of_business_activity: {
                type: FORM_TYPE.LABEL,
                title: 'lang_business_activity'
            },
            company_country_of_incorporation: {
                type: FORM_TYPE.LABEL,
                title: 'lang_country_of_incorporation',
                titleClass: 'text-normal',
                customFn: (value) => {
                    if (!value) return '--'
                    return (value + '').toCapitalize()
                }
            },
            company_date_of_incorporation: {
                type: FORM_TYPE.DATE_PICKER,
                titleClass: 'text-normal',
                title: 'lang_date_of_incorporation',
                notEdit: true
            },
            company_mobile_phone: {
                type: FORM_TYPE.CALLING_CODE,
                title: 'lang_mobile_phone'
            },
            company_email: {
                type: FORM_TYPE.STRING,
                title: 'lang_email'
            },
            company_registered_office_address_unit_full_address: {
                type: FORM_TYPE.AUTOCOMPLETE,
                title: 'lang_registerd_office_address',
                prefix: 'company_registered_office_address_',
                disable: true
            },
            company_principal_place_of_business_address_full_address: {
                type: FORM_TYPE.AUTOCOMPLETE,
                title: 'lang_principal_place_of_business_address',
                titleClass: 'text-normal',
                prefix: 'company_principal_place_of_business_address_',
                disable: true
            }
        }

        this.companyDetailsGroupNotEdit = {
            company_details_title: {
                title: 'lang_company_details',
                type: FORM_TYPE.GROUP
            },
            company_name: {
                type: FORM_TYPE.LABEL,
                title: 'lang_company_name'
            },
            company_type: {
                title: 'lang_company_type',
                type: FORM_TYPE.LABEL,
                customFn: (value) => {
                    if (!value) return '--'
                    const keyLang = (value + '').toBackEndTransKey()
                    return keyLang
                }
            },
            company_acn: {
                title: 'lang_acn',
                titleClass: 'text-normal',
                type: FORM_TYPE.LABEL
            },
            company_abn: {
                title: 'lang_abn',
                type: FORM_TYPE.LABEL,
                titleClass: 'text-normal'
            },
            company_tax_exemption: {
                title: 'lang_tfn_exemption',
                titleClass: 'text-normal',
                type: FORM_TYPE.DROPDOWN,
                align: 'right',
                options: [
                    { label: 'lang_tfn_', value: false },
                    { label: 'lang_exemption', value: true }
                ],
                disable: true,
                notEdit: true
            },
            company_tfn: {
                title: 'lang_tfn',
                titleClass: 'text-normal',
                type: FORM_TYPE.LABEL,
                condition: {
                    company_tax_exemption: false
                }
            },
            company_tax_exemption_details: {
                title: 'lang_exemption_detail',
                type: FORM_TYPE.DROPDOWN,
                align: 'right',
                options: [
                    {
                        label: 'lang_not_required_to_lodge_a_tax_return',
                        value: 'Not required to lodge a Tax Return'
                    },
                    {
                        label: 'lang_norfolk_island_resident',
                        value: 'Norfolk Island Resident'
                    },
                    {
                        label: 'lang_non_resident_of_australia',
                        value: 'Non-resident of Australia'
                    }
                ],
                disable: true,
                notEdit: true,
                condition: {
                    company_tax_exemption: true
                }
            },
            company_industry: {
                title: 'lang_company_industry',
                type: FORM_TYPE.LABEL
            },
            company_nature_of_business_activity: {
                type: FORM_TYPE.LABEL,
                title: 'lang_business_activity'
            },
            company_country_of_incorporation: {
                type: FORM_TYPE.LABEL,
                title: 'lang_country_of_incorporation',
                titleClass: 'text-normal',
                customFn: (value) => {
                    if (!value) return '--'
                    return (value + '').toCapitalize()
                }
            },
            company_date_of_incorporation: {
                type: FORM_TYPE.DATE_PICKER,
                titleClass: 'text-normal',
                title: 'lang_date_of_incorporation',
                notEdit: true
            },
            company_mobile_phone: {
                type: FORM_TYPE.CALLING_CODE,
                title: 'lang_mobile_phone',
                disable: true,
                disableNoBorder: true
            },
            company_email: {
                type: FORM_TYPE.LABEL,
                title: 'lang_email'
            },
            company_registered_office_address_unit_full_address: {
                type: FORM_TYPE.AUTOCOMPLETE,
                title: 'lang_registerd_office_address',
                prefix: 'company_registered_office_address_',
                disable: true
            },
            company_principal_place_of_business_address_full_address: {
                type: FORM_TYPE.AUTOCOMPLETE,
                title: 'lang_principal_place_of_business_address',
                titleClass: 'text-normal',
                prefix: 'company_principal_place_of_business_address_',
                disable: true
            }
        }

        this.settlementDetailsGroup = {
            settlement_details_title: {
                type: FORM_TYPE.GROUP,
                title: 'lang_settlement_details'
            },
            [FIELD.SETTLEMENT_METHOD]: {
                title: 'lang_settlement_method',
                options: OPTIONS.SETTLEMENT_METHOD,
                type: TYPE.DROPDOWN
            },
            [FIELD.SETTLEMENT_EXISTING_HIN]: {
                title: 'lang_existing_hin',
                rules: {
                    max: 10,
                    number: true
                },
                condition: {
                    [FIELD.SETTLEMENT_METHOD]: 'SPONSORED_HIN_TRANSFER'
                },
                type: TYPE.NUMBER
            },
            [FIELD.SETTLEMENT_PID]: {
                title: 'lang_pid',
                titleClass: 'text-uppercase',
                rules: {
                    max: 10
                },
                condition: {
                    [FIELD.SETTLEMENT_METHOD]: ['SPONSORED_HIN_TRANSFER', 'DVP']
                },
                options: OPTIONS.PID,
                type: TYPE.DROPDOWN
            },
            [FIELD.SETTLEMENT_SUPPLEMENTARY_REFERENCE]: {
                title: 'lang_supplementar_reference',
                rules: {
                    max: 128
                },
                condition: {
                    [FIELD.SETTLEMENT_METHOD]: 'DVP'
                },
                type: TYPE.STRING
            }
        }

        this.settlementDetailsGroupNotEdit = {
            settlement_details_title: {
                type: FORM_TYPE.GROUP,
                title: 'lang_settlement_details'
            },
            [FIELD.SETTLEMENT_METHOD]: {
                title: 'lang_settlement_method',
                options: OPTIONS.SETTLEMENT_METHOD,
                type: TYPE.DROPDOWN,
                disable: true,
                notEdit: true
            },
            [FIELD.SETTLEMENT_EXISTING_HIN]: {
                title: 'lang_existing_hin',
                condition: {
                    [FIELD.SETTLEMENT_METHOD]: 'SPONSORED_HIN_TRANSFER'
                },
                type: TYPE.LABEL
            },
            [FIELD.SETTLEMENT_PID]: {
                title: 'lang_pid',
                titleClass: 'text-uppercase',
                condition: {
                    [FIELD.SETTLEMENT_METHOD]: ['SPONSORED_HIN_TRANSFER', 'DVP']
                },
                type: TYPE.LABEL
            },
            [FIELD.SETTLEMENT_SUPPLEMENTARY_REFERENCE]: {
                title: 'lang_supplementar_reference',
                condition: {
                    [FIELD.SETTLEMENT_METHOD]: 'DVP'
                },
                type: TYPE.LABEL
            }
        }

        this.bankingDetailsGroup = (data) => {
            let optionsBank = []
            if (['SPONSORED_HIN_TRANSFER', 'SPONSORED_NEW_HIN', 'ISSUER_SPONSORED'].includes(data.settlement_method)) {
                optionsBank = [
                    { label: 'Please Select', value: null },
                    { label: 'lang_bank_account', value: 'BANK_ACCOUNT' },
                    { label: 'lang_linked_cmt_cma', value: 'LINKED_CMT_CMA', className: 'text-normal' }
                ]
            } else {
                optionsBank = [
                    { label: 'Please Select', value: null },
                    { label: 'lang_empty', value: 'EMPTY' },
                    { label: 'lang_bank_account', value: 'BANK_ACCOUNT' },
                    { label: 'lang_linked_cmt_cma', value: 'LINKED_CMT_CMA', className: 'text-normal' }
                ]
            }
            return {
                banking_details_title: {
                    type: FORM_TYPE.GROUP,
                    title: 'lang_banking_details'
                },
                [FIELD.BANK_ACCOUNT_TYPE]: {
                    title: 'lang_account_type',
                    type: FORM_TYPE.DROPDOWN,
                    align: 'right',
                    options: optionsBank
                },
                [FIELD.BANK_CMT_PROVIDER]: {
                    title: 'lang_cmt_provider',
                    type: FORM_TYPE.DROPDOWN,
                    align: 'right',
                    rules: {
                        required: (data) => {
                            return ['LINKED_CMT_CMA'].includes(data[FIELD.BANK_ACCOUNT_TYPE])
                        }
                    },
                    options: [
                        { label: 'Please Select', value: null },
                        { label: 'lang_adelaide_bank_limited', value: 'ADL' },
                        { label: 'lang_anz_v2plus', value: 'ANZ' },
                        { label: 'lang_ddh_graham', value: 'DDH' },
                        { label: 'lang_ddh_westpac', value: 'DDHW' },
                        { label: 'lang_macquarie_bank_limited', value: 'MBLA' }
                    ],
                    condition: {
                        [FIELD.BANK_ACCOUNT_TYPE]: 'LINKED_CMT_CMA'
                    }
                },
                [FIELD.BANK_BSB]: {
                    title: 'lang_bsb',
                    type: FORM_TYPE.NUMBER,
                    condition: {
                        [FIELD.BANK_ACCOUNT_TYPE]: ['BANK_ACCOUNT', 'LINKED_CMT_CMA']
                    },
                    rules: {
                        number: true,
                        max: 14,
                        required: (data) => {
                            return ['BANK_ACCOUNT', 'LINKED_CMT_CMA'].includes(data[FIELD.BANK_ACCOUNT_TYPE])
                        }
                    }
                },
                [FIELD.BANK_ACCOUNT_NUMBER]: {
                    title: 'lang_account_number',
                    type: FORM_TYPE.NUMBER,
                    condition: {
                        [FIELD.BANK_ACCOUNT_TYPE]: ['BANK_ACCOUNT', 'LINKED_CMT_CMA']
                    },
                    rules: {
                        number: true,
                        max: 20,
                        required: (data) => {
                            return ['BANK_ACCOUNT', 'LINKED_CMT_CMA'].includes(data[FIELD.BANK_ACCOUNT_TYPE])
                        }
                    }
                },
                [FIELD.BANK_ACCOUNT_NAME]: {
                    title: 'lang_account_name',
                    type: FORM_TYPE.STRING,
                    condition: {
                        [FIELD.BANK_ACCOUNT_TYPE]: ['BANK_ACCOUNT', 'LINKED_CMT_CMA']
                    },
                    rules: {
                        required: (data) => {
                            return ['BANK_ACCOUNT', 'LINKED_CMT_CMA'].includes(data[FIELD.BANK_ACCOUNT_TYPE])
                        },
                        max: 80
                    }
                },
                [FIELD.BANK_TRANSACTION_TYPE]: {
                    title: 'lang_transaction_type',
                    type: FORM_TYPE.DROPDOWN,
                    align: 'right',
                    options: [
                        { label: 'Please Select', value: null },
                        { label: 'lang_creadit_and_debit', value: 'BOTH', className: 'text-normal' },
                        { label: 'lang_credit', value: 'CREDIT' },
                        { label: 'lang_debit', value: 'DEBIT' }
                    ],
                    condition: {
                        [FIELD.BANK_ACCOUNT_TYPE]: ['BANK_ACCOUNT', 'LINKED_CMT_CMA']
                    },
                    rules: {
                        required: (data) => {
                            return ['BANK_ACCOUNT', 'LINKED_CMT_CMA'].includes(data[FIELD.BANK_ACCOUNT_TYPE])
                        }
                    }
                }
            }
        }

        this.bankingDetailsGroupNotEdit = {
            banking_details_title: {
                type: FORM_TYPE.GROUP,
                title: 'lang_banking_details'
            },
            [FIELD.BANK_ACCOUNT_TYPE]: {
                title: 'lang_account_type',
                type: TYPE.DROPDOWN,
                options: [
                    { label: '--', value: null },
                    { label: 'lang_empty', value: 'EMPTY' },
                    { label: 'lang_bank_account', value: 'BANK_ACCOUNT' },
                    { label: 'lang_linked_cmt_cma', value: 'LINKED_CMT_CMA', className: 'text-normal' }
                ],
                notEdit: true,
                disable: true
            },
            [FIELD.BANK_CMT_PROVIDER]: {
                title: 'lang_cmt_provider',
                type: TYPE.LABEL,
                condition: {
                    [FIELD.BANK_ACCOUNT_TYPE]: 'LINKED_CMT_CMA'
                }
            },
            [FIELD.BANK_BSB]: {
                title: 'lang_bsb',
                type: TYPE.LABEL,
                condition: {
                    [FIELD.BANK_ACCOUNT_TYPE]: ['BANK_ACCOUNT', 'LINKED_CMT_CMA']
                }
            },
            [FIELD.BANK_ACCOUNT_NUMBER]: {
                title: 'lang_account_number',
                type: TYPE.LABEL,
                condition: {
                    [FIELD.BANK_ACCOUNT_TYPE]: ['BANK_ACCOUNT', 'LINKED_CMT_CMA']
                }
            },
            [FIELD.BANK_ACCOUNT_NAME]: {
                title: 'lang_account_name',
                type: TYPE.LABEL,
                condition: {
                    [FIELD.BANK_ACCOUNT_TYPE]: ['BANK_ACCOUNT', 'LINKED_CMT_CMA']
                }
            },
            [FIELD.BANK_TRANSACTION_TYPE]: {
                title: 'lang_transaction_type',
                type: TYPE.LABEL,
                condition: {
                    [FIELD.BANK_ACCOUNT_TYPE]: ['BANK_ACCOUNT', 'LINKED_CMT_CMA']
                }
            }
        }

        this.tradeConfirmationsGroup = {
            trade_confirmations_title: {
                title: 'lang_trade_confirmations',
                type: FORM_TYPE.GROUP,
                open: () => {
                    showModal({
                        component: TradeConfirmations,
                        props: {
                            onSuccess: this.onChangeTradeConfirm,
                            frirtData: { trade_confirmations: this.state.accObj.trade_confirmations }
                        }
                    });
                }
            },
            trade_confirmations: {
                type: FORM_TYPE.ARRAY,
                items: {
                    type: FORM_TYPE.OBJECT,
                    properties: {
                        [FIELD.METHOD]: {
                            title: 'lang_method',
                            type: FORM_TYPE.LABEL,
                            customFn: (value) => {
                                if (!value) return '--'
                                return 'lang_' + value.toLowerCase()
                            }
                        },
                        [FIELD.EMAIL]: {
                            title: 'lang_email',
                            type: FORM_TYPE.LABEL,
                            condition: {
                                [FIELD.METHOD]: METHOD.EMAIL
                            }
                        },
                        [FIELD.FAX]: {
                            title: 'lang_fax',
                            placeholder: 'Fax',
                            disable: true,
                            disableNoBorder: true,
                            type: FORM_TYPE.CALLING_CODE,
                            condition: {
                                [FIELD.METHOD]: METHOD.FAX
                            }
                        },
                        [FIELD.POSTAL_ADDRESS_COUNTRY]: {
                            title: 'lang_country',
                            type: FORM_TYPE.LABEL,
                            defaultValue: 'AUSTRALIA',
                            disable: true,
                            condition: {
                                [FIELD.METHOD]: METHOD.POSTAL
                            }
                        },
                        [FIELD.POSTAL_ADDRESS_FULL_ADDRESS]: {
                            title: 'lang_address',
                            type: FORM_TYPE.LABEL,
                            condition: {
                                [FIELD.METHOD]: METHOD.POSTAL
                            },
                            prefix: 'postal_address_'
                        }
                    }
                }
            }
        }

        this.tradeConfirmationsGroupNotEdit = {
            trade_confirmations_title: {
                title: 'lang_trade_confirmations',
                type: FORM_TYPE.GROUP
            },
            trade_confirmations: {
                type: FORM_TYPE.ARRAY,
                items: {
                    type: FORM_TYPE.OBJECT,
                    properties: {
                        [FIELD.METHOD]: {
                            title: 'lang_method',
                            type: FORM_TYPE.LABEL,
                            customFn: (value) => {
                                if (!value) return '--'
                                return 'lang_' + value.toLowerCase()
                            }
                        },
                        [FIELD.EMAIL]: {
                            title: 'lang_email',
                            type: FORM_TYPE.LABEL,
                            condition: {
                                [FIELD.METHOD]: METHOD.EMAIL
                            }
                        },
                        [FIELD.FAX]: {
                            title: 'lang_fax',
                            placeholder: 'Fax',
                            disable: true,
                            disableNoBorder: true,
                            type: FORM_TYPE.CALLING_CODE,
                            condition: {
                                [FIELD.METHOD]: METHOD.FAX
                            }
                        },
                        [FIELD.POSTAL_ADDRESS_COUNTRY]: {
                            title: 'lang_country',
                            type: FORM_TYPE.LABEL,
                            defaultValue: 'AUSTRALIA',
                            disable: true,
                            condition: {
                                [FIELD.METHOD]: METHOD.POSTAL
                            }
                        },
                        [FIELD.POSTAL_ADDRESS_FULL_ADDRESS]: {
                            title: 'lang_address',
                            type: FORM_TYPE.LABEL,
                            condition: {
                                [FIELD.METHOD]: METHOD.POSTAL
                            },
                            prefix: 'postal_address_'
                        }
                    }
                }
            }
        }
        this.applicantDetailsGroup = (data = {}) => {
            return {
                applicant_details: {
                    type: FORM_TYPE.ARRAY,
                    slide: true,
                    displayField: (data, index) => {
                        if (Object.keys(data).length) {
                            return (data.account_type ? dataStorage.translate(MAPPING_ACCOUNT_TYPE[data.account_type].TYPE_APPLICANT) : 'Applicant ') + '' + (index + 1) + ' detail'
                        }
                        return 'Applicant Details'
                    },
                    items: {
                        type: 'object',
                        properties: {
                            account_name: {
                                title: 'lang_account_name',
                                type: FORM_TYPE.LABEL,
                                translate: false,
                                customFn: (value, data) => {
                                    if (!data.first_name || !data.last_name) return '--'
                                    return data.first_name + ' ' + data.last_name
                                }
                            },
                            gender: {
                                title: 'lang_gender',
                                type: FORM_TYPE.DROPDOWN,
                                align: 'right',
                                options: [
                                    { label: 'lang_male', value: 'MALE' },
                                    { label: 'lang_female', value: 'FEMALE' }
                                ]
                            },
                            dob: {
                                title: 'lang_date_of_birth',
                                titleClass: 'text-normal',
                                type: FORM_TYPE.DATE_PICKER,
                                notEdit: true
                            },
                            nationality: {
                                title: 'lang_nationality',
                                type: FORM_TYPE.DROPDOWN,
                                align: 'right',
                                translate: false,
                                options: countryOptions
                            },
                            occupation_type: {
                                type: FORM_TYPE.DROPDOWN,
                                align: 'right',
                                title: 'lang_occupation_type',
                                options: [
                                    {
                                        'label': 'Business Owner',
                                        'value': 'Business Owner'
                                    },
                                    {
                                        'label': 'Chief Executives, General Managers and Legislators',
                                        'value': 'Chief Executives, General Managers and Legislators'
                                    },
                                    {
                                        'label': 'Clerical and administrative workers',
                                        'value': 'Clerical and administrative workers'
                                    },
                                    {
                                        'label': 'Community and personal service workers',
                                        'value': 'Community and personal service workers'
                                    },
                                    {
                                        'label': 'Employees',
                                        'value': 'Employees'
                                    },
                                    {
                                        'label': 'Homemaker',
                                        'value': 'Homemaker'
                                    },
                                    {
                                        'label': 'Labourers',
                                        'value': 'Labourers'
                                    },
                                    {
                                        'label': 'Machinery operators and drivers',
                                        'value': 'Machinery operators and drivers'
                                    },
                                    {
                                        'label': 'Military',
                                        'value': 'Military'
                                    },
                                    {
                                        'label': 'Professionals',
                                        'value': 'Professionals'
                                    },
                                    {
                                        'label': 'Retired',
                                        'value': 'Retired'
                                    },
                                    {
                                        'label': 'Sales workers',
                                        'value': 'Sales workers'
                                    },
                                    {
                                        'label': 'Student',
                                        'value': 'Student'
                                    },
                                    {
                                        'label': 'Technicians and trades workers',
                                        'value': 'Technicians and trades workers'
                                    }
                                ]
                            },
                            occupation_category: {
                                title: 'lang_occupation_category',
                                type: FORM_TYPE.DROPDOWN,
                                align: 'right',
                                options: [
                                    {
                                        'label': 'Accommodation and Food Services',
                                        'value': 'Accommodation and Food Services'
                                    },
                                    {
                                        'label': 'Administrative and Support Services',
                                        'value': 'Administrative and Support Services'
                                    },
                                    {
                                        'label': 'Arms or Weapons Manufacture or Distribution',
                                        'value': 'Arms or Weapons Manufacture or Distribution'
                                    },
                                    {
                                        'label': 'Arts and Recreation Services',
                                        'value': 'Arts and Recreation Services'
                                    },
                                    {
                                        'label': 'Bar or Licensed Club',
                                        'value': 'Bar or Licensed Club'
                                    },
                                    {
                                        'label': 'Betting, Bookmaking, Gambling and Gaming',
                                        'value': 'Betting, Bookmaking, Gambling and Gaming'
                                    },
                                    {
                                        'label': 'Cafe and Restaurant',
                                        'value': 'Cafe and Restaurant'
                                    },
                                    {
                                        'label': 'Charity Community or Social Services',
                                        'value': 'Charity Community or Social Services'
                                    },
                                    {
                                        'label': 'Construction',
                                        'value': 'Construction'
                                    },
                                    {
                                        'label': 'Digital Currency Traders',
                                        'value': 'Digital Currency Traders'
                                    },
                                    {
                                        'label': 'Education and Training',
                                        'value': 'Education and Training'
                                    },
                                    {
                                        'label': 'Electricity, Gas, Water and Waste Services',
                                        'value': 'Electricity, Gas, Water and Waste Services'
                                    },
                                    {
                                        'label': 'Farming and Agriculture',
                                        'value': 'Farming and Agriculture'
                                    },
                                    {
                                        'label': 'Financial and Insurance Services',
                                        'value': 'Financial and Insurance Services'
                                    },
                                    {
                                        'label': 'Health Care and Social Assistance',
                                        'value': 'Health Care and Social Assistance'
                                    },
                                    {
                                        'label': 'Hotel and Motel',
                                        'value': 'Hotel and Motel'
                                    },
                                    {
                                        'label': 'Information Media and Telecommunications',
                                        'value': 'Information Media and Telecommunications'
                                    },
                                    {
                                        'label': 'Jewel, Gem and Precious Metals',
                                        'value': 'Jewel, Gem and Precious Metals'
                                    },
                                    {
                                        'label': 'Mining, Gas, Oil and Petroleum',
                                        'value': 'Mining, Gas, Oil and Petroleum'
                                    },
                                    {
                                        'label': 'Money Exchange or Foreign FX Services',
                                        'value': 'Money Exchange or Foreign FX Services'
                                    },
                                    {
                                        'label': 'Pawn Brokers',
                                        'value': 'Pawn Brokers'
                                    },
                                    {
                                        'label': 'Professional, Scientific and Technical Services',
                                        'value': 'Professional, Scientific and Technical Services'
                                    },
                                    {
                                        'label': 'Public Administration and Safety',
                                        'value': 'Public Administration and Safety'
                                    },
                                    {
                                        'label': 'Real Estate Agent',
                                        'value': 'Real Estate Agent'
                                    },
                                    {
                                        'label': 'Rental, Hiring and Real Estate Services',
                                        'value': 'Rental, Hiring and Real Estate Services'
                                    },
                                    {
                                        'label': 'Retail Trade',
                                        'value': 'Retail Trade'
                                    },
                                    {
                                        'label': 'Transport, Postal and Warehousing',
                                        'value': 'Transport, Postal and Warehousing'
                                    },
                                    {
                                        'label': 'Wholesale Trade',
                                        'value': 'Wholesale Trade'
                                    }
                                ]
                            },
                            tax_exemption: {
                                type: FORM_TYPE.DROPDOWN,
                                align: 'right',
                                title: 'lang_tfn_exemption',
                                titleClass: 'text-normal',
                                options: [
                                    { label: 'lang_tfn_', value: false },
                                    { label: 'lang_exemption', value: true }
                                ]
                            },
                            tfn: {
                                type: FORM_TYPE.STRING,
                                title: 'lang_tfn',
                                titleClass: 'text-normal',
                                condition: {
                                    tax_exemption: false
                                }
                            },
                            tax_exemption_details: {
                                type: FORM_TYPE.DROPDOWN,
                                align: 'right',
                                title: 'lang_exemption_detail',
                                options: OPTIONS.EXEMPTION_DETAILS[data.account_type],
                                condition: {
                                    tax_exemption: true
                                }
                            },
                            applicant_mobile_phone: {
                                title: 'lang_mobile_phone',
                                type: FORM_TYPE.CALLING_CODE
                            },
                            applicant_email: {
                                title: 'lang_email',
                                type: FORM_TYPE.STRING,
                                rule: {
                                    email: true
                                }
                            },
                            residential_address_full_address: {
                                title: 'lang_registered_office_address',
                                type: FORM_TYPE.AUTOCOMPLETE,
                                prefix: 'residential_address_'
                            },
                            postal_address_full_address: {
                                title: 'lang_principal_place_of_business_address',
                                titleClass: 'text-normal',
                                type: FORM_TYPE.AUTOCOMPLETE,
                                prefix: 'postal_address_'
                            },
                            ekyc_status: {
                                title: 'lang_ekyc_status',
                                titleClass: 'text-normal',
                                type: FORM_TYPE.LABEL,
                                customFn: (value, data) => this.renderEkycStatus(value, data)
                            },
                            ekyc_failed_reason: {
                                title: 'lang_ekyc_description',
                                titleClass: 'text-normal',
                                type: FORM_TYPE.LABEL,
                                customFn: (value, data) => this.renderEkycFailedReason(value, data)
                            },
                            government: {
                                title: 'lang_government_ids',
                                titleClass: 'text-normal',
                                type: FORM_TYPE.GROUP,
                                notCollapse: true
                            },
                            [FIELD.GOVERNMENT_ID]: {
                                type: FORM_TYPE.ARRAY,
                                items: {
                                    type: FORM_TYPE.OBJECT,
                                    properties: {
                                        [FIELD.GOVERNMENT_ID_TYPE]: {
                                            title: 'lang_government_id_type',
                                            titleClass: 'text-normal',
                                            type: FORM_TYPE.LABEl,
                                            customFn: (value, data) => this.renderGovernmentId(value, data)
                                        },
                                        [FIELD.GOVERNMENT_ID_NUMBER]: {
                                            title: 'lang_government_id_number',
                                            titleClass: 'text-normal',
                                            type: FORM_TYPE.LABEL,
                                            translate: false,
                                            condition: {
                                                [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT]
                                            }
                                        },
                                        [FIELD.INDIVIDUAL_REFERENCE_NUMBER]: {
                                            title: 'lang_government_id_details',
                                            titleClass: 'text-normal',
                                            condition: {
                                                [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD
                                            },
                                            type: FORM_TYPE.LABEL,
                                            customFn: (value, data) => {
                                                return (
                                                    <div>
                                                        {data.medicare_name_on_card} ({data.medicare_individual_reference_number})
                                                        <div>{data.number}</div>
                                                    </div>
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        this.applicantDetailsGroupNotEdit = {
            applicant_details: {
                type: FORM_TYPE.ARRAY,
                slide: true,
                displayField: (data, index) => {
                    if (Object.keys(data).length) {
                        return (data.account_type ? dataStorage.translate(MAPPING_ACCOUNT_TYPE[data.account_type].TYPE_APPLICANT) : 'Applicant ') + '' + (index + 1) + ' detail'
                    }
                    return 'Applicant Details'
                },
                items: {
                    type: 'object',
                    properties: {
                        account_name: {
                            title: 'lang_account_name',
                            type: FORM_TYPE.LABEL,
                            translate: false,
                            customFn: (value, data) => {
                                if (!data.first_name || !data.last_name) return '--'
                                return data.first_name + ' ' + data.last_name
                            }
                        },
                        gender: {
                            title: 'lang_gender',
                            type: FORM_TYPE.LABEL,
                            customFn: (value) => {
                                if (!value) return '--'
                                return 'lang_' + value.toLowerCase()
                            }
                        },
                        dob: {
                            title: 'lang_date_of_birth',
                            titleClass: 'text-normal',
                            type: FORM_TYPE.DATE_PICKER,
                            notEdit: true
                        },
                        nationality: {
                            title: 'lang_nationality',
                            translate: false,
                            type: FORM_TYPE.LABEL,
                            customFn: (value) => {
                                if (!value) return '--'
                                return (value + '').toCapitalize()
                            }
                        },
                        occupation_type: {
                            type: FORM_TYPE.LABEL,
                            title: 'lang_occupation_type'
                        },
                        occupation_category: {
                            title: 'lang_occupation_category',
                            type: FORM_TYPE.LABEL
                        },
                        tax_exemption: {
                            type: FORM_TYPE.DROPDOWN,
                            align: 'right',
                            title: 'lang_tfn_exemption',
                            titleClass: 'text-normal',
                            notEdit: true,
                            disable: true,
                            options: [
                                { label: 'lang_tfn_', value: false },
                                { label: 'lang_exemption', value: true }
                            ]
                        },
                        tfn: {
                            type: FORM_TYPE.LABEL,
                            title: 'lang_tfn',
                            titleClass: 'text-normal',
                            condition: {
                                tax_exemption: false
                            }
                        },
                        tax_exemption_details: {
                            type: FORM_TYPE.LABEL,
                            title: 'lang_exemption_detail',
                            condition: {
                                tax_exemption: true
                            }
                        },
                        applicant_mobile_phone: {
                            title: 'lang_mobile_phone',
                            type: FORM_TYPE.CALLING_CODE,
                            disableNoBorder: true,
                            disable: true
                        },
                        applicant_email: {
                            title: 'lang_email',
                            type: FORM_TYPE.LABEL
                        },
                        residential_address_full_address: {
                            title: 'lang_registered_office_address',
                            type: FORM_TYPE.AUTOCOMPLETE,
                            prefix: 'residential_address_',
                            disable: true,
                            disableNoBorder: true
                        },
                        postal_address_full_address: {
                            title: 'lang_principal_place_of_business_address',
                            titleClass: 'text-normal',
                            type: FORM_TYPE.AUTOCOMPLETE,
                            prefix: 'postal_address_',
                            disable: true,
                            disableNoBorder: true
                        },
                        ekyc_status: {
                            title: 'lang_ekyc_status',
                            titleClass: 'text-normal',
                            type: FORM_TYPE.LABEL,
                            customFn: (value, data) => this.renderEkycStatus(value, data)
                        },
                        ekyc_failed_reason: {
                            title: 'lang_ekyc_description',
                            titleClass: 'text-normal',
                            type: FORM_TYPE.LABEL,
                            customFn: (value, data) => this.renderEkycFailedReason(value, data)
                        },
                        government: {
                            title: 'lang_government_ids',
                            titleClass: 'text-normal',
                            type: FORM_TYPE.GROUP,
                            notCollapse: true
                        },
                        [FIELD.GOVERNMENT_ID]: {
                            type: FORM_TYPE.ARRAY,
                            items: {
                                type: FORM_TYPE.OBJECT,
                                properties: {
                                    [FIELD.GOVERNMENT_ID_TYPE]: {
                                        title: 'lang_government_id_type',
                                        titleClass: 'text-normal',
                                        type: FORM_TYPE.LABEl,
                                        customFn: (value, data) => this.renderGovernmentId(value, data)
                                    },
                                    [FIELD.GOVERNMENT_ID_NUMBER]: {
                                        title: 'lang_government_id_number',
                                        titleClass: 'text-normal',
                                        type: FORM_TYPE.LABEL,
                                        translate: false,
                                        condition: {
                                            [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT]
                                        }
                                    },
                                    [FIELD.INDIVIDUAL_REFERENCE_NUMBER]: {
                                        title: 'lang_government_id_details',
                                        titleClass: 'text-normal',
                                        condition: {
                                            [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD
                                        },
                                        type: FORM_TYPE.LABEL,
                                        customFn: (value, data) => {
                                            return (
                                                <div>
                                                    {data.medicare_name_on_card} ({data.medicare_individual_reference_number})
                                                    <div>{data.number}</div>
                                                </div>
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        this.applicantDetailsGroupEditGoverment = (data = {}) => {
            let dataClone = clone(data);
            if (dataClone && dataClone.applicant_details) {
                if (dataClone.applicant_details.length - 1 < this.slideIndex) this.slideIndex = 0
                dataClone.applicant_details = [dataClone.applicant_details[this.slideIndex]]
            }
            this.governmentData = getDataAddGovernmentId(dataClone)
            return {
                applicant_details: {
                    type: FORM_TYPE.ARRAY,
                    slide: true,
                    displayField: (data, index) => {
                        if (Object.keys(data).length) {
                            return (data.account_type ? dataStorage.translate(MAPPING_ACCOUNT_TYPE[data.account_type].TYPE_APPLICANT) : 'Applicant ') + '' + (index + 1) + ' detail'
                        }
                        return 'Applicant Details'
                    },
                    items: {
                        type: 'object',
                        properties: {
                            account_name: {
                                title: 'lang_account_name',
                                type: FORM_TYPE.LABEL,
                                translate: false,
                                customFn: (value, data) => {
                                    if (!data.first_name || !data.last_name) return '--'
                                    return data.first_name + ' ' + data.last_name
                                }
                            },
                            gender: {
                                title: 'lang_gender',
                                type: FORM_TYPE.LABEL,
                                customFn: (value) => {
                                    if (!value) return '--'
                                    return 'lang_' + value.toLowerCase()
                                }
                            },
                            dob: {
                                title: 'lang_date_of_birth',
                                titleClass: 'text-normal',
                                type: FORM_TYPE.DATE_PICKER,
                                notEdit: true
                            },
                            nationality: {
                                title: 'lang_nationality',
                                translate: false,
                                type: FORM_TYPE.LABEL,
                                customFn: (value) => {
                                    if (!value) return '--'
                                    return (value + '').toCapitalize()
                                }
                            },
                            occupation_type: {
                                type: FORM_TYPE.LABEL,
                                title: 'lang_occupation_type'
                            },
                            occupation_category: {
                                title: 'lang_occupation_category',
                                type: FORM_TYPE.LABEL
                            },
                            tax_exemption: {
                                type: FORM_TYPE.DROPDOWN,
                                align: 'right',
                                title: 'lang_tfn_exemption',
                                titleClass: 'text-normal',
                                notEdit: true,
                                disable: true,
                                options: [
                                    { label: 'lang_tfn_', value: false },
                                    { label: 'lang_exemption', value: true }
                                ]
                            },
                            tfn: {
                                type: FORM_TYPE.LABEL,
                                title: 'lang_tfn',
                                titleClass: 'text-normal',
                                condition: {
                                    tax_exemption: false
                                }
                            },
                            tax_exemption_details: {
                                type: FORM_TYPE.LABEL,
                                title: 'lang_exemption_detail',
                                condition: {
                                    tax_exemption: true
                                }
                            },
                            applicant_mobile_phone: {
                                title: 'lang_mobile_phone',
                                type: FORM_TYPE.CALLING_CODE,
                                disableNoBorder: true,
                                disable: true
                            },
                            applicant_email: {
                                title: 'lang_email',
                                type: FORM_TYPE.LABEL
                            },
                            residential_address_full_address: {
                                title: 'lang_registered_office_address',
                                type: FORM_TYPE.AUTOCOMPLETE,
                                prefix: 'residential_address_',
                                disable: true,
                                disableNoBorder: true
                            },
                            postal_address_full_address: {
                                title: 'lang_principal_place_of_business_address',
                                titleClass: 'text-normal',
                                type: FORM_TYPE.AUTOCOMPLETE,
                                prefix: 'postal_address_',
                                disable: true,
                                disableNoBorder: true
                            },
                            ekyc_status: {
                                title: 'lang_ekyc_status',
                                titleClass: 'text-normal',
                                type: FORM_TYPE.LABEL,
                                customFn: (value, data) => this.renderEkycStatus(value, data)
                            },
                            ekyc_failed_reason: {
                                title: 'lang_ekyc_description',
                                titleClass: 'text-normal',
                                type: FORM_TYPE.LABEL,
                                customFn: (value, data) => this.renderEkycFailedReason(value, data)
                            },
                            government: this.governmentData.length
                                ? {
                                    title: 'lang_government_ids',
                                    titleClass: 'text-normal',
                                    type: FORM_TYPE.GROUP,
                                    open: () => {
                                        showModal({
                                            component: AddGovernmentID,
                                            className: 'allowNested',
                                            props: {
                                                listData: this.governmentData,
                                                isAccountDetails: true
                                            }
                                        });
                                    },
                                    notCollapse: true
                                }
                                : {
                                    title: 'lang_government_ids',
                                    titleClass: 'text-normal',
                                    type: FORM_TYPE.GROUP,
                                    notCollapse: true
                                },
                            [FIELD.GOVERNMENT_ID]: {
                                type: FORM_TYPE.ARRAY,
                                items: {
                                    type: FORM_TYPE.OBJECT,
                                    properties: {
                                        [FIELD.GOVERNMENT_ID_TYPE]: {
                                            title: 'lang_government_id_type',
                                            titleClass: 'text-normal',
                                            type: FORM_TYPE.LABEl,
                                            customFn: (value, data) => this.renderGovernmentId(value, data)
                                        },
                                        [FIELD.GOVERNMENT_ID_NUMBER]: {
                                            title: 'lang_government_id_number',
                                            titleClass: 'text-normal',
                                            type: FORM_TYPE.LABEL,
                                            translate: false,
                                            condition: {
                                                [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT]
                                            }
                                        },
                                        [FIELD.INDIVIDUAL_REFERENCE_NUMBER]: {
                                            title: 'lang_government_id_details',
                                            titleClass: 'text-normal',
                                            condition: {
                                                [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD
                                            },
                                            type: FORM_TYPE.LABEL,
                                            customFn: (value, data) => {
                                                return (
                                                    <div>
                                                        {data.medicare_name_on_card} ({data.medicare_individual_reference_number})
                                                        <div>{data.number}</div>
                                                    </div>
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    onChangeTradeConfirm = (data) => {
        let dataForm = this.getDefaultData();
        dataForm.trade_confirmations = data;
        this.setData(dataForm)
    }

    collapseFunc = (collapse) => {
        this.collapse = collapse ? 1 : 0
        this.props.saveState({
            collapse: this.collapse
        })
        this.forceUpdate()
    }

    changeAccount = (acc) => {
        if (acc && acc.equix_id && acc.equix_id !== this.state.accObj.equix_id) {
            if (typeof acc.trade_confirmations === 'string') acc.trade_confirmations = JSON.parse(acc.trade_confirmations)
            if (typeof acc.tradeable_products === 'string') acc.tradeable_products = JSON.parse(acc.tradeable_products)
            if (typeof acc.applicant_details === 'string') acc.applicant_details = JSON.parse(acc.applicant_details)
            if (acc.tradeable_products) acc.tradeable_products_arr = Object.keys(acc.tradeable_products) || []
            let cloneAcc = clone(acc);
            this.isMount && this.setState({ accObj: cloneAcc }, async () => {
                if (dataStorage.branchObjDic[acc.branch]) {
                    await this.getBranchById(acc.branch)
                }
                this.setSchema && this.setSchema(this.getStructure(acc))
                this.setData && this.setData(acc)
                this.setDataGrid && this.setGridData(acc)
            })
            this.props.send({
                account: acc
            })
        }
    }

    onChange = (dataObj, err, valueChange) => {
        if (this.obj && valueChange) this.obj[valueChange.name] = valueChange.data[valueChange.name]
        if (this.account_type && dataObj.account_type !== this.account_type) {
            this.setSchema(this.getStructure(dataObj))
            this.account_type = dataObj.account_type
        }
    }

    renderEkycFailedReason = (value, data) => {
        let dataClone = clone(data)
        const userInfo = dataStorage.userInfo || {};
        const userType = userInfo.user_type
        let overallStatus = dataClone.ekyc_overall_status;
        let govermentData = (dataClone.government_id || []).pop();
        let govermentStatus = (govermentData && govermentData.ekyc_govid_status) || '';
        let documentData = (dataClone.uploaded_documents || []).pop();
        let documentStatus = (documentData && documentData.ekyc_document_status) || '';
        let text = ''
        if (userType === userTypeEnum.RETAIL) {
            if (overallStatus === 'EKYC_PENDING') text = 'lang_overall_ekyc_pending_reason_retail'
            else if (overallStatus === 'EKYC_LOCKED_OUT') text = 'lang_overall_ekyc_lockout_reason_retail'
            else if (overallStatus === 'EKYC_VERIFIED') text = 'lang_overall_ekyc_verified_retail'
            else {
                if (govermentStatus === 'EKYC_VERIFIED' || !govermentStatus) {
                    if (!documentStatus) text = 'lang_overall_ekyc_pending_reason_retail'
                    else if (['EKYC_PENDING', 'EQ_IN_PROGRESS_REJECT', 'EQ_IN_PROGRESS_APPROVE'].includes(documentStatus)) text = 'lang_ekyc_document_pending_reason_retail'
                    else if (documentStatus === 'EKYC_REJECTED') text = 'lang_ekyc_document_reject_reason_retail'
                    else if (documentStatus === 'EKYC_VERIFIED') text = 'lang_overall_ekyc_pending_reason_retail'
                } else if (govermentStatus === 'EKYC_IN_PROGRESS') {
                    text = 'lang_goverment_inprogess_reason_retail'
                } else if (govermentStatus === 'EKYC_LOCKED_OUT') {
                    if (!documentStatus) text = 'lang_eykc_lockout_reason_retail'
                    else if (['EKYC_PENDING', 'EQ_IN_PROGRESS_REJECT', 'EQ_IN_PROGRESS_APPROVE'].includes(documentStatus)) text = 'lang_ekyc_goverment_lockout_document_pending_reason_retail'
                    else if (documentStatus === 'EKYC_REJECTED') text = 'lang_ekyc_goverment_lockout_document_reject_reason_retail'
                    else if (documentStatus === 'EKYC_VERIFIED') text = 'lang_ekyc_goverment_lockout_document_verified_reason_retail'
                } else if (govermentStatus === 'EKYC_PENDING') {
                    if (!documentStatus) text = `lang_ekyc_goverment_pending_retail`
                    else if (['EKYC_PENDING', 'EQ_IN_PROGRESS_REJECT', 'EQ_IN_PROGRESS_APPROVE'].includes(documentStatus)) text = `lang_ekyc_goverment_pending_document_pending_retail`
                    else if (documentStatus === 'EKYC_REJECTED') text = `lang_ekyc_goverment_pending_document_reject_retail`
                    else if (documentStatus === 'EKYC_VERIFIED') text = `lang_ekyc_goverment_pending_document_verified_retail`
                }
            }
        } else {
            if (overallStatus === 'EKYC_PENDING') text = 'lang_overall_ekyc_pending_reason'
            else if (overallStatus === 'EKYC_LOCKED_OUT') text = 'lang_overall_ekyc_lockout_reason'
            else if (overallStatus === 'EKYC_VERIFIED') text = 'lang_overall_ekyc_verified'
            else {
                if (govermentStatus === 'EKYC_VERIFIED' || !govermentStatus) {
                    if (!documentStatus) text = 'lang_ekyc_goverment_verify_no_doc'
                    else if (['EQ_IN_PROGRESS_REJECT', 'EQ_IN_PROGRESS_APPROVE'].includes(documentStatus)) text = 'lang_ekyc_goverment_verify_document_eq_reason'
                    else if (documentStatus === 'EKYC_PENDING') text = 'lang_ekyc_goverment_verified_document_pending'
                    else if (documentStatus === 'EKYC_REJECTED') text = 'lang_ekyc_document_reject_reason'
                    else if (documentStatus === 'EKYC_VERIFIED') text = 'lang_ekyc_goverment_verify_document_verify_reason'
                } else if (govermentStatus === 'EKYC_IN_PROGRESS') {
                    text = 'lang_goverment_inprogess_reason'
                } else if (govermentStatus === 'EKYC_LOCKED_OUT') {
                    if (!documentStatus) text = 'lang_eykc_lockout_reason'
                    else if (['EQ_IN_PROGRESS_REJECT', 'EQ_IN_PROGRESS_APPROVE'].includes(documentStatus)) text = 'lang_ekyc_goverment_lockout_document_eq_reason'
                    else if (documentStatus === 'EKYC_PENDING') text = 'lang_ekyc_goverment_lockout_document_pending'
                    else if (documentStatus === 'EKYC_REJECTED') text = 'lang_ekyc_goverment_lockout_document_reject_reason'
                    else if (documentStatus === 'EKYC_VERIFIED') text = 'lang_ekyc_goverment_lockout_document_verified_reason'
                } else if (govermentStatus === 'EKYC_PENDING') {
                    if (!documentStatus) text = 'lang_overall_ekyc_pending_reason'
                    else if (['EQ_IN_PROGRESS_REJECT', 'EQ_IN_PROGRESS_APPROVE'].includes(documentStatus)) text = 'lang_ekyc_goverment_pending_document_eq_reason'
                    else if (documentStatus === 'EKYC_PENDING') text = 'lang_ekyc_goverment_pending_document_pending'
                    else if (documentStatus === 'EKYC_REJECTED') text = 'lang_ekyc_goverment_pending_document_reject_reason'
                    else if (documentStatus === 'EKYC_VERIFIED') text = 'lang_ekyc_goverment_pending_document_verified_reason'
                }
            }
        }
        let textTrans = dataStorage.translate(text)
        if (govermentData) textTrans = (textTrans.replace('<Gov_id_type>', MAPPING_GOVERMENT_TYPE[govermentData.type] + '').toCapitalize())
        if (documentData) textTrans = (textTrans.replace('<document_type>', UPLOAD_TYPE[documentData.document_type] + '').toCapitalize())

        return (
            <div>
                {textTrans}
            </div>
        )
    }

    renderEkycStatus = (value, data) => {
        let dataClone = clone(data)
        if (!dataClone.ekyc_overall_status) return ''
        let textArr = dataClone.ekyc_overall_status.split('_')
        textArr.shift();
        let text = textArr.join(' ').toCapitalize()
        return (
            <div>{text}</div>
        )
    }

    setGridData = (acc) => {
        let dataGrid = []
        if (acc.applicant_details && acc.applicant_details.length) {
            acc.applicant_details.forEach((x, i) => {
                if (x.uploaded_documents) {
                    x.uploaded_documents.forEach(v => {
                        dataGrid.push({
                            first_name: x.first_name,
                            last_name: x.last_name,
                            applicant_index: i,
                            applicant_id: x.applicant_id,
                            actor: v.actor,
                            link: v.document_link,
                            document_title: UPLOAD_TYPE[v.document_type],
                            document_type: v.document_type,
                            ekyc_document_status: v.ekyc_document_status,
                            last_updated: v.last_updated,
                            indexData: v.document_type === 'EKYC_REPORT' ? 1 : 0,
                            ekyc_overall_status: x.ekyc_overall_status
                        })
                    })
                }
            })
        }
        // }
        dataGrid.sort((a, b) => b.indexData - a.indexData)
        this.setDataGrid(dataGrid)
    }

    getProperty = (data) => {
        const userInfo = dataStorage.userInfo || {};
        let accountType = data.account_type;
        let accountStatus = (data.account_status && data.account_status.toUpperCase()) || 'EKYC_IN_PROGRESS'
        let accountTypeGroup = {}
        let brokerageSchedulesGroup = {}
        let settlementDetailsGroup = {}
        let bankingDetailsGroup = {}
        let tradeConfirmationsGroup = {}
        let applicantDetailsGroup = {}
        let trustDetailsGroup = {}
        let companyDetailsGroup = {}
        let superFundDetailsGroup = {}

        if (accountStatus === 'EKYC_IN_PROGRESS' || accountStatus === 'EKYC_MORE_INFO') {
            accountTypeGroup = this.accountTypeGroupNotEdit
            brokerageSchedulesGroup = this.brokerageSchedulesGroup
            settlementDetailsGroup = this.settlementDetailsGroupNotEdit
            bankingDetailsGroup = this.bankingDetailsGroupNotEdit
            tradeConfirmationsGroup = this.tradeConfirmationsGroupNotEdit
            applicantDetailsGroup = this.applicantDetailsGroupEditGoverment(data)
            trustDetailsGroup = this.trustDetailsGroupNotEdit
            companyDetailsGroup = this.companyDetailsGroupNotEdit
            superFundDetailsGroup = this.superFundDetailsGroupNotEdit
        } else if (['EKYC_PENDING', 'EKYC_LOCKED_OUT', 'MORRISON_PENDING', 'MORRISON_IN_REFERRED'].includes(accountStatus)) {
            accountTypeGroup = this.accountTypeGroupNotEdit
            brokerageSchedulesGroup = this.brokerageSchedulesGroup
            settlementDetailsGroup = this.settlementDetailsGroupNotEdit
            bankingDetailsGroup = this.bankingDetailsGroupNotEdit
            tradeConfirmationsGroup = this.tradeConfirmationsGroupNotEdit
            applicantDetailsGroup = this.applicantDetailsGroupNotEdit
            trustDetailsGroup = this.trustDetailsGroupNotEdit
            companyDetailsGroup = this.companyDetailsGroupNotEdit
            superFundDetailsGroup = this.superFundDetailsGroupNotEdit
        } else if (accountStatus === 'BANK_PENDING') {
            accountTypeGroup = this.accountTypeGroupNotEdit
            brokerageSchedulesGroup = this.brokerageSchedulesGroup
            settlementDetailsGroup = this.settlementDetailsGroupNotEdit
            bankingDetailsGroup = this.bankingDetailsGroup(data)
            tradeConfirmationsGroup = this.tradeConfirmationsGroupNotEdit
            applicantDetailsGroup = this.applicantDetailsGroupNotEdit
            trustDetailsGroup = this.trustDetailsGroupNotEdit
            companyDetailsGroup = this.companyDetailsGroupNotEditonch
            superFundDetailsGroup = this.superFundDetailsGroupNotEdit
        } else if (accountStatus === 'MORRISON_CANCELLED') {
            accountTypeGroup = this.accountTypeGroupNotEdit
            brokerageSchedulesGroup = this.brokerageSchedulesGroup
            settlementDetailsGroup = this.settlementDetailsGroupNotEdit
            bankingDetailsGroup = this.bankingDetailsGroupNotEdit
            tradeConfirmationsGroup = this.tradeConfirmationsGroupNotEdit
            applicantDetailsGroup = this.applicantDetailsGroupNotEdit
            trustDetailsGroup = this.trustDetailsGroupNotEdit
            companyDetailsGroup = this.companyDetailsGroupNotEdit
            superFundDetailsGroup = this.superFundDetailsGroupNotEdit
        } else if (['BANK_SUBMITTED', 'CLOSED', 'INACTIVE', 'ACTIVE'].includes(accountStatus)) {
            accountTypeGroup = userInfo.user_type === userTypeEnum.RETAIL ? this.accountTypeGroupNotEdit : this.accountTypeGroupEditAccountStatus()
            brokerageSchedulesGroup = this.brokerageSchedulesGroup
            settlementDetailsGroup = this.settlementDetailsGroupNotEdit
            bankingDetailsGroup = this.bankingDetailsGroupNotEdit
            tradeConfirmationsGroup = this.tradeConfirmationsGroupNotEdit
            applicantDetailsGroup = this.applicantDetailsGroupNotEdit
            trustDetailsGroup = this.trustDetailsGroupNotEdit
            companyDetailsGroup = this.companyDetailsGroupNotEdit
            superFundDetailsGroup = this.superFundDetailsGroupNotEdit
        }

        if (accountType === ACCOUNT_TYPE.INDIVIDUAL) {
            return {
                ...accountTypeGroup,
                ...brokerageSchedulesGroup,
                ...settlementDetailsGroup,
                ...bankingDetailsGroup,
                ...tradeConfirmationsGroup,
                ...applicantDetailsGroup
            }
        } else if (accountType === ACCOUNT_TYPE.JOINT) {
            return {
                ...accountTypeGroup,
                ...brokerageSchedulesGroup,
                ...settlementDetailsGroup,
                ...bankingDetailsGroup,
                ...tradeConfirmationsGroup,
                ...applicantDetailsGroup
            }
        } else if (accountType === ACCOUNT_TYPE.COMPANY) {
            return {
                ...accountTypeGroup,
                ...brokerageSchedulesGroup,
                ...companyDetailsGroup,
                ...settlementDetailsGroup,
                ...bankingDetailsGroup,
                ...tradeConfirmationsGroup,
                ...applicantDetailsGroup
            }
        } else if (accountType === ACCOUNT_TYPE.TRUST_INDIVIDUAL) {
            return {
                ...accountTypeGroup,
                ...brokerageSchedulesGroup,
                ...trustDetailsGroup,
                ...settlementDetailsGroup,
                ...bankingDetailsGroup,
                ...tradeConfirmationsGroup,
                ...applicantDetailsGroup
            }
        } else if (accountType === ACCOUNT_TYPE.TRUST_COMPANY) {
            return {
                ...accountTypeGroup,
                ...brokerageSchedulesGroup,
                ...trustDetailsGroup,
                ...companyDetailsGroup,
                ...settlementDetailsGroup,
                ...bankingDetailsGroup,
                ...tradeConfirmationsGroup,
                ...applicantDetailsGroup
            }
        } else if (accountType === ACCOUNT_TYPE.SUPER_FUND_COMPANY) {
            return {
                ...accountTypeGroup,
                ...brokerageSchedulesGroup,
                ...superFundDetailsGroup,
                ...companyDetailsGroup,
                ...settlementDetailsGroup,
                ...bankingDetailsGroup,
                ...tradeConfirmationsGroup,
                ...applicantDetailsGroup
            }
        } else if (accountType === ACCOUNT_TYPE.SUPER_FUND_INDIVIDUAL) {
            return {
                ...accountTypeGroup,
                ...brokerageSchedulesGroup,
                ...superFundDetailsGroup,
                ...settlementDetailsGroup,
                ...bankingDetailsGroup,
                ...tradeConfirmationsGroup,
                ...applicantDetailsGroup
            }
        } else {
            return {
                ...accountTypeGroup
            }
        }
    }

    getStructure = (data) => {
        let tradeableProducts = data.tradeable_products || {}
        this.brokerageSchedulesGroup['tradeable_products']['properties'] = {}
        Object.keys(tradeableProducts).forEach(x => {
            this.brokerageSchedulesGroup.tradeable_products.properties[x] = {
                title: 'lang_' + x,
                translate: false,
                type: FORM_TYPE.LABEL
            }
        })
        let properties = this.getProperty(data)
        return {
            type: 'object',
            properties: properties
        }
    }

    callbackSlide = (index) => {
        this.slideIndex = index;
        this.timeoutSlide && clearTimeout(this.timeoutSlide)
        this.timeoutSlide = setTimeout(() => {
            if (this.state.isEdit) {
                let dataNew = { ...this.state.accObj, ...this.obj }
                this.setSchema(this.getStructure(dataNew))
            } else this.setSchema(this.getStructure(this.state.accObj))
        }, 200)
    }

    renderForm = () => {
        return (
            <Form
                {...this.props}
                onChange={this.onChange.bind(this)}
                fn={fn => {
                    this.setData = fn.setData;
                    this.getData = fn.getData;
                    this.resetData = fn.resetData;
                    this.clearData = fn.clearData;
                    this.setEditMode = fn.setEditMode
                    this.setSchema = fn.setSchema;
                    this.getSchema = fn.getSchema;
                    this.getDefaultData = fn.getDefaultData
                }}
                schema={{}}
                toggleGroup={true}
                stripe={true}
                noDispatch={true}
                callbackSlide={this.callbackSlide}
            // onKeyPress={this.handleKeyPress.bind(this)}
            />
        )
    }

    renderGovernmentId = (value, data) => {
        if (!value) return '--'
        let text = '';
        if (value === 'MEDICARE_CARD') {
            text = `${dataStorage.translate('lang_medicare_card')} (${data.medicare_card_colour})`
        } else if (value === 'PASSPORT') {
            text = dataStorage.translate('lang_passport')
        } else {
            text = `${dataStorage.translate('lang_driver_license')} (${data.state_of_issue})`
        }
        let icon = governmentIconObj[data.ekyc_govid_status] || {}
        return (
            <div style={{ display: 'inline-flex' }}>
                <div>{text}</div>
                <SvgIcon style={{ width: '16px', paddingLeft: '8px' }} path={icon.path} fill={icon.color} />
            </div>
        )
    }

    putBankSubmit = nextToMorision => {
        const url = getOpeningAccountUrl(`?equix_id=${this.state.accObj.equix_id}`)
        let obj = nextToMorision ? { account_status: 'MORRISON_PENDING' } : { account_status: 'BANK_PENDING' }
        putData(url, obj).then(res => {
            this.setEditMode(false)
            this.isMount && this.setState({ isEdit: false })
        }).catch(error => {
        })
    }
    renderBtn = () => {
        const userInfo = dataStorage.userInfo || {};
        if (!this.state.accObj || (this.state.accObj && !this.state.accObj.account_status)) return null
        if (userInfo.user_type === userTypeEnum.ADVISOR && ['EKYC_PENDING', 'EKYC_LOCKED_OUT', 'MORRISON_PENDING', 'MORRISON_CANCELLED'].includes(this.state.accObj.account_status)) return null
        else if (userInfo.user_type === userTypeEnum.RETAIL && ['BANK_SUBMITTED', 'MORRISON_CANCELLED', 'MORRISON_IN_REFERRED', 'ACTIVE', 'CLOSED', 'INACTIVE'].includes(this.state.accObj.account_status)) return null
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <ButtonGroup
                    callback={this.handleCallBackActionGroup}
                    value={this.state.isEdit}
                />
                {this.state.accObj.account_status === 'BANK_SUBMITTED' && userInfo.user_type !== userTypeEnum.RETAIL
                    ? <div style={{ display: 'inline-flex' }} >
                        <Button type={buttonType.success} onClick={() => {
                            this.putBankSubmit(true)
                        }}>
                            <SvgIcon style={{ width: '20px', paddingRight: '8px' }} path={path.mdiCheckCircle} />
                            APPROVE & SUBMIT
                        </Button>
                        <Button type={buttonType.danger} onClick={() => {
                            this.putBankSubmit(false)
                        }}>
                            <SvgIcon style={{ width: '20px', paddingRight: '8px' }} path={path.mdiCloseCircle} />
                            REJECT
                        </Button>
                    </div>
                    : null
                }
            </div>
        )
    }

    handleCallBackActionGroup = (type) => {
        switch (type) {
            case 'edit':
                this.account_type = this.state.accObj.account_type
                this.obj = {};
                this.setEditMode(true)
                this.isMount && this.setState({ isEdit: true })
                break;
            case 'save':
                if (Object.keys(this.obj).length) {
                    if (this.state.accObj.account_status === 'BANK_PENDING') {
                        if (!this.obj.bank_account_name) this.obj.bank_account_name = this.state.accObj.bank_account_name
                        if (!this.obj.bank_account_number) this.obj.bank_account_number = this.state.accObj.bank_account_number
                        if (!this.obj.bank_account_type) this.obj.bank_account_type = this.state.accObj.bank_account_type
                        if (!this.obj.bank_bsb) this.obj.bank_bsb = this.state.accObj.bank_bsb
                        if (!this.obj.bank_cmt_provider) this.obj.bank_cmt_provider = this.state.accObj.bank_cmt_provider
                        if (!this.obj.bank_transaction_type) this.obj.bank_transaction_type = this.state.accObj.bank_transaction_type
                        if (this.obj.bank_account_type === 'BANK_ACCOUNT') {
                            delete this.obj.bank_cmt_provider
                        }
                    }
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
                    const saveData = () => {
                        Object.keys(this.obj).forEach(x => {
                            if (this.obj[x] === null || this.obj[x] === undefined || this.obj[x] === '') delete this.obj[x]
                        })
                        const url = getOpeningAccountUrl(`?equix_id=${this.state.accObj.equix_id}`)
                        putData(url, this.obj).then(res => {
                            this.setEditMode(false)
                            this.isMount && this.setState({ isEdit: false })
                        }).catch(error => {
                        })
                    }
                    if (lst.length) {
                        const lstEncrypted = lst.map(id => encodeURIComponent(CryptoJS.AES.encrypt(id, 'QRPY36kzhjTNbQqF').toString()));
                        const metaUrl = getUrlAddressMetaData(lstEncrypted.join(','));
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
                            saveData();
                        }).catch(error => {
                            if (error && error.response && error.response.errorCode) {
                                const errorText = `error_code_${error.response.errorCode}`
                                const text = dataStorage.translate(errorText) || 'Failed to get address'
                                this.props.showError && this.props.showError(text)
                            } else this.props.showError && this.props.showError('Failed to get address')
                        });
                    } else {
                        saveData();
                    }
                } else {
                    this.setEditMode(false)
                    this.isMount && this.setState({ isEdit: false })
                }
                break;
            case 'cancel':
                this.setEditMode(false)
                let cloneData = clone(this.state.accObj)
                this.setSchema(this.getStructure(cloneData))
                this.setData(cloneData)
                this.dataClone = null
                this.account_type = null
                this.isMount && this.setState({ isEdit: false })
                break;
            default:
                break;
        }
    }

    checkDocumentUpload = () => {
        let applicantToUpload = []
        const userInfo = dataStorage.userInfo || {}
        if (['EKYC_IN_PROGRESS', 'EKYC_MORE_INFO'].includes(this.state.accObj.account_status)) {
            this.state.accObj.applicant_details.forEach((v, i) => {
                if (v.ekyc_overall_status === 'EKYC_IN_PROGRESS') {
                    if (v.uploaded_documents) {
                        let index = v.uploaded_documents.findIndex(x => ['EKYC_PENDING', 'EQ_IN_PROGRESS_REJECT', 'EQ_IN_PROGRESS_APPROVE'].includes(x.ekyc_document_status))
                        if (index === -1) applicantToUpload.push(v)
                    } else applicantToUpload.push(v)
                }
            })
        } else if (['BANK_PENDING', 'BANK_SUBMITTED', 'MORRISON_PENDING', 'MORRISON_CANCELLED', 'MORRISON_IN_REFERRED'].includes(this.state.accObj.account_status) && userInfo.user_type === userTypeEnum.OPERATOR) {
            this.state.accObj.applicant_details.forEach((v, i) => {
                if (v.uploaded_documents) {
                    let index = v.uploaded_documents.findIndex(x => x.document_type === 'EKYC_REPORT')
                    if (index === -1) applicantToUpload.push(v)
                } else applicantToUpload.push(v)
            })
        }
        return applicantToUpload
    }

    renderDocumentUploadAndMoreOption = () => {
        let applicantToUpload = this.checkDocumentUpload();
        return (
            <div style={{ justifyContent: applicantToUpload.length ? 'space-between' : 'flex-end' }} className={'header-wrap ' + styles.filterAndMore}>
                {applicantToUpload.length
                    ? <div onClick={() => this.documentUploadClick(applicantToUpload)} style={{ display: 'flex', alignItems: 'center', padding: '0px 12px', border: '1px solid var(--border)', backgroundColor: 'var(--primary-light)', cursor: 'pointer' }}><SvgIcon style={{ width: '16px', marginRight: '4px' }} path={path.mdiFileUpload} /> Document Upload</div>
                    : null}
                <MoreOption agSideButtons={this.createagSideButtons()} />
            </div>
        )
    }

    documentUploadClick = (applicantToUpload) => {
        let document = ''
        if (['BANK_PENDING', 'BANK_SUBMITTED', 'MORRISON_PENDING', 'MORRISON_CANCELLED', 'MORRISON_IN_REFERRED'].includes(this.state.accObj.account_status)) {
            document = 'EKYC_REPORT'
        }
        showModal({
            component: DocumentUpload,
            data: this.state.accObj,
            props: {
                applicant: applicantToUpload,
                document: document
            }
        });
    }

    createagSideButtons = () => {
        return [
            {
                value: 'ExportCSV',
                label: 'lang_export_csv',
                callback: () => this.exportCSV()
            },
            {
                value: 'ResetFilter',
                label: 'lang_reset_filter',
                callback: () => this.resetFilter(true)
            },
            {
                value: 'Resize',
                label: 'lang_resize',
                callback: () => this.autoSize()
            },
            {
                value: 'Columns',
                label: 'lang_columns',
                callback: (boundRef) => this.showColumnMenu(boundRef)
            },
            {
                value: 'Filters',
                label: 'lang_filters',
                callback: (boundRef) => this.showFilterMenu(boundRef)
            }
        ]
    }

    setGridFnKey = (data) => {
        return data.account_id
    }
    renderGrid = () => {
        return <Grid
            {...this.props}
            id={FORM.ACCOUNT_DETAIL}
            fn={fn => {
                this.addDetail = fn.addDetailr
                this.addOrUpdate = fn.addOrUpdate
                this.setDataGrid = fn.setData
                this.setBottomRow = fn.setBottomRow
                this.getDataGrid = fn.getData
                this.remove = fn.remove
                this.setColumn = fn.setColumn
                this.autoSize = fn.autoSize
                this.exportCSV = fn.exportCsv
                this.resetFilter = fn.resetFilter
                this.setQuickFilter = fn.setQuickFilter
                this.showColumnMenu = fn.showColumnMenu
                this.showFilterMenu = fn.showFilterMenu
            }}
            fnKey={this.setGridFnKey}
            columns={this.getColums()}
            autoFit={true}
        />
    }

    getColums = () => {
        return [
            {
                header: 'lang_document_title',
                name: 'applicant_id',
                groupIndex: 0,
                formater: (params) => {
                    if (params.group) return `${params.data.first_name} ${params.data.last_name} (Applicant ${(params.data.applicant_index + 1)})`
                    return params.data.document_title
                },
                type: 'link'
            },
            {
                header: 'lang_actor',
                name: 'actor'
            },
            {
                header: 'lang_last_updated',
                name: 'last_updated',
                type: 'date',
                dateFormat: 'DD MMM YYYY hh:mm:ss'
            },
            {
                header: 'lang_action_list',
                name: 'khai',
                options: (params) => {
                    const userInfo = dataStorage.userInfo || {};
                    if (params.data.ekyc_overall_status === 'EKYC_IN_PROGRESS') {
                        if (params.data.ekyc_document_status === 'EKYC_REJECTED') return [{ label: 'Reupload', value: 'Reupload', icon: 'mdiUpload', cb: (params, value) => this.checkChange(params, value) }, { label: 'Delete', value: 'delete', icon: 'mdiDelete', cb: (params, value) => this.checkChange(params, value) }]
                        else if (params.data.ekyc_document_status === 'EKYC_PENDING' && userInfo.user_type === userTypeEnum.OPERATOR) return [{ label: 'Approve', value: 'approve', icon: 'mdiCheckCircle', cb: (params, value) => this.checkChange(params, value) }, { label: 'Reject', value: 'reject', icon: 'mdiCloseCircle', cb: (params, value) => this.checkChange(params, value) }]
                    } else if (params.data.ekyc_document_status === 'EKYC_REJECTED') {
                        return [{ label: 'Delete', value: 'delete', icon: 'mdiDelete', cb: (params, value) => this.checkChange(params, value) }]
                    }
                    return []
                },
                type: TYPE.ACTION_NO_TEXT,
                suppressSort: true,
                suppressFilter: true
            }
        ]
    }

    checkChange = (params, value) => {
        if (value === 'Reupload') {
            let applicantToUpload = this.state.accObj.applicant_details[params.applicant_index]
            let documentToUpload = params.document_type
            showModal({
                component: DocumentUpload,
                data: this.state.accObj,
                props: {
                    applicant: [applicantToUpload],
                    document: documentToUpload
                }
            });
        } else if (value === 'delete') {
            const url = getOpeningAccountUrl(`/document?equix_id=${this.state.accObj.equix_id}&applicant_id=${params.applicant_id}&document_type=${params.document_type}`)
            deleteData(url).then(() => {

            }).catch((err) => {
                console.log(err)
            })
        } else if (value === 'approve') {
            const url = getOpeningAccountUrl(`/document`);
            let dataPut = {
                equix_id: this.state.accObj.equix_id,
                applicant_id: params.applicant_id,
                document_type: params.document_type,
                ekyc_document_status: 'EQ_IN_PROGRESS_APPROVE'
            }
            putData(url, dataPut).then(() => {

            }).catch((err) => {
                console.log(err)
                logger.log('error approve document', err)
            })
        } else if (value === 'reject') {
            const url = getOpeningAccountUrl(`/document`);
            let dataPut = {
                equix_id: this.state.accObj.equix_id,
                applicant_id: params.applicant_id,
                document_type: params.document_type,
                ekyc_document_status: 'EKYC_REJECTED'
            }
            putData(url, dataPut).then(() => {

            }).catch((err) => {
                console.log(err)
                logger.log('error reject document', err)
            })
        }
    }

    getAllBranch = () => {
        return new Promise((resolve) => {
            const url = createNewBranch();
            getData(url)
                .then(response => {
                    if (response.data && response.data.data && response.data.data.branch) {
                        let listBranch = response.data.data.branch;
                        if (listBranch && listBranch.length) {
                            listBranch.forEach(item => {
                                dataStorage.branchObjDic[item.branch_id] = item.branch_name;
                                this.dicBranchOpt.push({ label: item.branch_name, value: item.branch_id })
                            });
                        }
                    }
                    resolve()
                }).catch(error => {
                    logger.log('error getAllBranch', error)
                    resolve()
                })
        })
    }

    getBranchById = (branchId) => {
        return new Promise((resolve) => {
            const url = editBranch(branchId);
            getData(url)
                .then(response => {
                    let listBranch = response || []
                    if (listBranch && listBranch.length) {
                        listBranch.forEach(item => {
                            dataStorage.branchObjDic[item.branch_id] = item.branch_name;
                        });
                    }
                    resolve()
                }).catch(error => {
                    logger.log('error getBranchById', error)
                    resolve()
                })
        })
    }

    async componentDidMount() {
        this.isMount = true
        const userInfo = dataStorage.userInfo || {};
        if (userInfo.user_type === userTypeEnum.OPERATOR || userInfo.user_type === userTypeEnum.ADVISOR) await this.getAllBranch()
        const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
        const initState = this.props.loadState()
        let initialAccount = null
        if (initState && initState.account && initState.account.equix_id) {
            const url = getOpeningAccountUrl(`?equix_id=${initState.account.equix_id}`)
            console.log('========>url', url)
            await getData(url).then((response) => {
                initialAccount = response.data.data.find(x => x.equix_id === initState.account.equix_id)
            }).catch(error => {
                console.log('=====>', error)
            })
        }
        const url = getAllAccountNewUrl(userId, 1, 6)
        await getData(url).then(response => {
            if (response.data && response.data.data) {
                let listAcc = response.data.data.map(x => {
                    return { label: `${x.account_name} (${x.account_id || x.equix_id})`, value: x }
                })
                if (listAcc.length === 1) {
                    let accObj = response.data.data[0]
                    this.isMount && this.setState({ listManage: listAcc, accObj: initialAccount || accObj }, () => {
                        if (Object.keys(this.state.accObj).length) {
                            let acc = clone(this.state.accObj)
                            if (dataStorage.branchObjDic[acc.branch]) {
                                this.getBranchById(acc.branch)
                            }
                            this.setSchema && this.setSchema(this.getStructure(acc))
                            this.setData && this.setData(acc)
                            this.setDataGrid && this.setGridData(acc)
                        }
                    })
                } else {
                    const state = { listManage: listAcc }
                    if (initialAccount) state.accObj = initialAccount
                    this.isMount && this.setState(state, () => {
                        if (Object.keys(this.state.accObj).length) {
                            let acc = clone(this.state.accObj)
                            this.setSchema && this.setSchema(this.getStructure(acc))
                            this.setData && this.setData(acc)
                            this.setDataGrid && this.setGridData(acc)
                        }
                    })
                }
            }
        }).catch(error => {
            console.log('=====>', error)
        })

        if (userInfo.user_type === userTypeEnum.OPERATOR) {
            registerAllOrders(this.realtimeAccountOpening, 'ACCOUNT_OPENING')
        } else {
            registerUser(userInfo.user_id, this.realtimeAccountOpening, 'ACCOUNT_OPENING')
        }
    }

    componentWillUnmount() {
        this.isMount = false
        const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
        unregisterUser(userId, this.realtimeAccountOpening, 'ACCOUNT_OPENING')
        unregisterAllOrders(this.realtimeAccountOpening, 'ACCOUNT_OPENING')
    }

    closeWidget = () => {
        if (dataStorage.goldenLayout) {
            const lst = dataStorage.goldenLayout.goldenLayout.root.getItemsByType('component');
            if (lst.length) {
                const lstMatch = lst.filter(item => item.config === this.props.glContainer._config);
                if (lstMatch.length) {
                    lstMatch[0].parent.removeChild(lstMatch[0]);
                }
            }
        }
    }

    realtimeAccountOpening = (data, action) => {
        if (action === 'DELETE') {
            let dataParse = JSON.parse(data)
            if (dataParse.equix_id === this.state.accObj.equix_id) {
                showConfirm({
                    message: 'lang_account_deleted_by_admin',
                    title: 'lang_account_details',
                    callback: () => {
                        this.closeWidget()
                    }
                })
            }
        } else {
            let dataParse = JSON.parse(data)
            if (dataParse.equix_id === this.state.accObj.equix_id) {
                if (typeof dataParse.applicant_details === 'string') dataParse.applicant_details = JSON.parse(dataParse.applicant_details)
                let acc = { ...this.state.accObj, ...dataParse }
                this.isMount && this.setState({ accObj: acc }, () => {
                    let newAcc = clone(acc)
                    this.setSchema && this.setSchema(this.getStructure(newAcc))
                    this.setData && this.setData(newAcc)
                    this.setDataGrid && this.setGridData(newAcc)
                })
            }
        }
    }

    render() {
        try {
            const data = this.state.accObj
            const accountLabel = data.equix_id || ''
            if (this.state.listManage.length === 0) return null
            return (
                <div className={`isAccountDetails ${styles.container}`}>
                    <div className={styles.wrapper + ' qe-widget'}>
                        <div className={`header-wrap`}>
                            <div className={styles.searchAccountContainer + ' navbar'}>
                                <div className={styles.overflowHidden + ' flex align-items-center'}>
                                    {this.state.listManage.length !== 1
                                        ? <SearchAccount
                                            newLink={true}
                                            showInactiveAccount={true}
                                            activeValue={this.state.accObj}
                                            accountSumFlag={true}
                                            dataReceivedFromSearchAccount={this.changeAccount}
                                            optionsAcc={this.state.listManage}
                                            position='left'
                                        />
                                        : null
                                    }
                                    <div className={`${styles.accountLabel} size--3 showTitle`}>
                                        {accountLabel}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.inner}>
                            <div className={`${styles.innerContainer} header-wrap ${this.collapse ? 'collapse' : ''}`}>
                                {checkRole(MapRoleComponent.EDIT_ACCOUNT_DETAIL)
                                    ? this.renderBtn()
                                    : null
                                }
                                {this.renderForm()}
                            </div>
                            <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
                            <div className={styles.bottom}>
                                {this.renderDocumentUploadAndMoreOption()}
                                {this.renderGrid()}
                            </div>
                        </div>
                    </div>
                </div>
            )
        } catch (error) {
            logger.log(`Error while rendering Account Detail: ${error}`)
        }
    }
}

export default AccountDetail
