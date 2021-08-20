import { capitalizer } from '../../helper/functionUtils'
import dataStorage from '../../dataStorage'

export const ACCOUNT_TYPE = {
    INDIVIDUAL: 'INDIVIDUAL',
    JOINT: 'JOINT',
    COMPANY: 'COMPANY',
    TRUST_INDIVIDUAL: 'TRUST_INDIVIDUAL',
    TRUST_COMPANY: 'TRUST_COMPANY',
    SUPER_FUND_INDIVIDUAL: 'SUPER_FUND_INDIVIDUAL',
    SUPER_FUND_COMPANY: 'SUPER_FUND_COMPANY'
}

export const UPLOAD_TYPE = {
    'EKYC_REPORT': 'EKYC REPORT',
    'TELEPHONE_BILL': 'TELEPHONE BILL',
    'ELECTRICITY_GAS_BILL': 'ELECTRICITY GAS BILL',
    'WATER_BILL': 'WATER BILL',
    'COUNCIL_RATES_NOTICE': 'COUNCIL RATES NOTICE',
    'BANK_STATEMENT': 'BANK STATEMENT',
    'DRIVER_LICENSE_PHOTO_FRONT': 'DRIVER LICENSE PHOTO FRONT',
    'DRIVER_LICENSE_PHOTO_BACK': 'DRIVER LICENSE PHOTO BACK',
    'PASSPORT_PHOTO': 'PASSPORT PHOTO',
    'DRIVER_LICENSE_PHOTO': 'DRIVER LICENSE PHOTO'
}

export const MAPPING_ACCOUNT_TYPE = {
    [ACCOUNT_TYPE.INDIVIDUAL]: {
        ADD_BUTTON: 'lang_add_another_applicant',
        REMOVE_BUTTON: 'lang_remove_applicant',
        APPLICANT_DETAIL: 'lang_applicant_details',
        NUMBER_OF_APPLICANT: 'lang_applicants',
        TYPE_APPLICANT: 'lang_applicant'
    },
    [ACCOUNT_TYPE.JOINT]: {
        ADD_BUTTON: 'lang_add_another_applicant',
        REMOVE_BUTTON: 'lang_remove_applicant',
        APPLICANT_DETAIL: 'lang_applicant_details',
        NUMBER_OF_APPLICANT: 'lang_applicants',
        TYPE_APPLICANT: 'lang_applicant'
    },
    [ACCOUNT_TYPE.COMPANY]: {
        ADD_BUTTON: 'lang_add_another_company_officer',
        REMOVE_BUTTON: 'lang_remove_company_officer',
        APPLICANT_DETAIL: 'lang_company_officer_details',
        NUMBER_OF_APPLICANT: 'lang_company_officers',
        TYPE_APPLICANT: 'lang_company_officer'
    },
    [ACCOUNT_TYPE.TRUST_INDIVIDUAL]: {
        ADD_BUTTON: 'lang_add_another_trustee',
        REMOVE_BUTTON: 'lang_remove_trustee',
        APPLICANT_DETAIL: 'lang_trustee_details',
        NUMBER_OF_APPLICANT: 'lang_trustees',
        TYPE_APPLICANT: 'lang_trustee'
    },
    [ACCOUNT_TYPE.TRUST_COMPANY]: {
        ADD_BUTTON: 'lang_add_another_company_officer',
        REMOVE_BUTTON: 'lang_remove_company_officer',
        APPLICANT_DETAIL: 'lang_company_officer_details',
        NUMBER_OF_APPLICANT: 'lang_company_officers',
        TYPE_APPLICANT: 'lang_company_officer'
    },
    [ACCOUNT_TYPE.SUPER_FUND_INDIVIDUAL]: {
        ADD_BUTTON: 'lang_add_another_applicant',
        REMOVE_BUTTON: 'lang_remove_applicant',
        APPLICANT_DETAIL: 'lang_applicant_details',
        NUMBER_OF_APPLICANT: 'lang_applicants',
        TYPE_APPLICANT: 'lang_applicant'
    },
    [ACCOUNT_TYPE.SUPER_FUND_COMPANY]: {
        ADD_BUTTON: 'lang_add_another_company_officer',
        REMOVE_BUTTON: 'lang_remove_company_officer',
        APPLICANT_DETAIL: 'lang_company_officer_details',
        NUMBER_OF_APPLICANT: 'lang_company_officers',
        TYPE_APPLICANT: 'lang_company_officer'
    }
}

export const DOCUMENT_TYPE = {
    DOCUMENT: 'document',
    GOVERNMENT_ID: 'government_id'
}

export const FIELD = {
    // common
    ERRORS: 'errors',
    EXISTED_DOCUMENTS: 'existed_document',
    IS_ACCEPTED: 'is_accepted',
    EKYC_AML_CONSENT: 'ekyc_aml_consent',
    TOS_CONSENT: 'tos_consent',
    HAVE_TO_EDIT: 'have_to_edit',
    DOCUMENT_NAME: 'document_name',
    TYPE_OF_DOCUMENT: 'type_of_document',
    VERIFIED_DOCUMENTS: 'verified_documents',
    PENDING_DOCUMENTS: 'pending_documents',
    LOCKEDOUT_DOCUMENTS: 'lockedout_documents',
    STEP_SCREEN: 'step_screen',
    LATEST_SCREEN: 'latest_screen',
    APPLICANT_ID: 'applicant_id',
    VERIFICATION_ID: 'gbg_verification_id',
    CMA: 'new_cma',
    CMA_SOURCE_OF_FUNDS: 'cma_source_of_funds',
    CMA_SOURCE_OF_FUNDS_DESC: 'cma_source_of_funds_desc',
    CMA_ACCOUNT_PURPOSE: 'cma_account_purpose',
    CMA_ACCOUNT_PURPOSE_DESC: 'cma_account_purpose_desc',
    SEND_REGISTRATION_EMAIL: 'send_registration_email',
    ORGANIZATION_CODE: 'organization_code',
    BRANCH_CODE: 'branch_code',
    ADVISOR_CODE: 'advisor_code',
    VETTING_RULES: 'branch',
    SCHEDULE_CODE: 'schedule_code',
    // primary applicant
    APPLICANT_DETAILS: 'applicant_details',
    TITLE: 'title',
    FIRST_NAME: 'first_name',
    MIDDLE_NAME: 'middle_name',
    LAST_NAME: 'last_name',
    DOB: 'dob',
    EMAIL: 'email',
    APPLICANT_EMAIL: 'applicant_email',
    COMFIRM_EMAIL: 'comfirm_email',
    APPLICANT_HOME_PHONE: 'applicant_home_phone',
    APPLICANT_WORK_PHONE: 'applicant_work_phone',
    APPLICANT_FAX_PHONE: 'applicant_fax_phone',
    APPLICANT_MOBILE_PHONE: 'applicant_mobile_phone',
    // trust details
    TRUST_NAME: 'trust_name',
    TRUST_ABN: 'trust_abn',
    TRUST_TFN: 'trust_tfn',
    TRUST_TAX_EXEMPTION: 'trust_tax_exemption',
    TRUST_TAX_EXEMPTION_DETAILS: 'trust_tax_exemption_details',
    TRUST_ASSET_SOURCE_DETAILS: 'trust_asset_source_details',
    TRUST_ACTIVITY: 'trust_activity',
    TRUST_COUNTRY_OF_ESTABLISHMENT: 'trust_country_of_establishment',
    TRUST_TYPE: 'trust_type',
    // fund details
    SUPER_FUND_NAME: 'super_fund_name',
    SUPER_FUND_ABN: 'super_fund_abn',
    SUPER_FUND_TFN: 'super_fund_tfn',
    SUPER_FUND_TAX_EXEMPTION: 'super_fund_tax_exemption',
    SUPER_FUND_TAX_EXEMPTION_DETAILS: 'super_fund_tax_exemption_details',
    SMSF: 'smsf',
    // number of applicants - Array of applicant
    RELATIONSHIP_TYPE: 'relationship_type',
    RELATIONSHIP_DESCRIPTION: 'relationship_description',
    // company details
    COMPANY_NAME: 'company_name',
    COMPANY_TYPE: 'company_type',
    COMPANY_ACN: 'company_acn',
    COMPANY_ABN: 'company_abn',
    COMPANY_TFN: 'company_tfn',
    NOTBA: 'nature_of_business_activity',
    COMPANY_ADDRESS: 'company_registered_office_address_full_address',
    COMPANY_FULL_ADDRESS: 'company_principal_place_of_business_address_full_address',
    ROA_COUNTRY: 'company_registered_office_address_country',
    ROA_STATE: 'roa_state',
    ROA_UNIT_FLAT_NUMBER: 'roa_unit_flat_number',
    ROA_STREET_NUMBER_NAME: 'roa_street_number_name',
    ROA_SUBURB: 'roa_city_suburb',
    ROA_POSTCODE: 'roa_postcode',
    COMPANY_COUNTRY: 'company_principal_place_of_business_address_country',
    COMPANY_SAME_AS_ROA: 'company_same_as_roa',
    COMPANY_WORK_PHONE: 'company_work_phone',
    COMPANY_FAX_PHONE: 'company_fax_phone',
    COMPANY_MOBILE_PHONE: 'company_mobile_phone',
    COMPANY_EMAIL: 'company_email',
    COMPANY_TAX_EXEMPTION_DETAILS: 'company_tax_exemption_details',
    COMPANY_TAX_EXEMPTION: 'company_tax_exemption',
    COUNTRY_OF_INCORPORATION: 'company_country_of_incorporation',
    COMPANY_DATE_OF_INCORPORATION: 'company_date_of_incorporation',
    COMPANY_NATURE_OF_BUSINESS_ACTIVITY: 'company_nature_of_business_activity',
    // settlement details
    SETTLEMENT_METHOD: 'settlement_method',
    SETTLEMENT_EXISTING_HIN: 'settlement_existing_hin',
    SETTLEMENT_PID: 'settlement_pid',
    SETTLEMENT_SUPPLEMENTARY_REFERENCE: 'settlement_supplementary_reference',
    // trade comfirmations
    TRADE_CONFIRMATIONS: 'trade_confirmations',
    CLIENT_ADDRESS: 'client_address',
    // {
    METHOD: 'method',
    // EMAIL: 'email',
    FAX: 'fax',
    POSTAL_ADDRESS_COUNTRY: 'postal_address_country',
    POSTAL_ADDRESS_FULL_ADDRESS: 'postal_address_full_address',
    // }
    // applicants details
    // TITLE: 'title',
    // FIRST_NAME: 'first_name',
    // MIDDLE_NAME: 'middle_name',
    // LAST_NAME: 'last_name',
    GENDER: 'gender',
    // DOB: 'dob',
    // RELATIONSHIP_TYPE: 'relationship_type',
    // RELATIONSHIP_DESCRIPTION: 'relationship_description',
    AUSTRALIAN_TAX_RESIDENT: 'australian_tax_resident',
    TFN: 'tfn',
    GOVERNMENT_ID_TYPE: 'type',
    STATE_OF_ISSUE: 'state_of_issue',
    FIRST_NAME_ON_CARD: 'first_name',
    MIDDLE_NAME_ON_CARD: 'middle_name',
    LAST_NAME_ON_CARD: 'last_name',
    GOVERNMENT_ID_NUMBER: 'number',
    OCCUPATION_TYPE: 'occupation_type',
    OCCUPATION_CATEGORY: 'occupation_category',
    SOURCE_OF_WEALTH: 'source_of_wealth',
    NATIONALITY: 'nationality',
    COUNTRY_OF_BIRTH: 'country_of_birth',
    RA_UNIT_FLAT_NUMBER: 'ra_unit_flat_number',
    // TFN: 'tfn',
    TFN_EXEMPTION: 'tax_exemption',
    EXEMPTION_DETAILS: 'tax_exemption_details',
    RESIDENTIAL_ADDRESS_FULL_ADDRESS: 'residential_address_full_address',
    RESIDENTIAL_ADDRESS_COUNTRY: 'residential_address_country',
    SAME_AS_RA: 'same_as_ra',
    RA_STATE: 'ra_state',
    RA_STREET_NUMBER_NAME: 'ra_street_number_name',
    RA_SUBURB: 'ra_city_suburb',
    RA_POSTCODE: 'ra_postcode',
    PA_STATE: 'pa_state',
    PA_STREET_NUMBER_NAME: 'pa_street_number_name',
    PA_SUBURB: 'pa_city_suburb',
    PA_POSTCODE: 'pa_postcode',
    // add government id
    EKYC_OVERALL_STATUS: 'ekyc_overall_status',
    EKYC_GOVID_STATUS: 'ekyc_govid_status',
    EKYC_DOCUMENT_STATUS: 'ekyc_document_status',
    GOVERNMENT_ID: 'government_id',
    INDIVIDUAL_REFERENCE_NUMBER: 'medicare_individual_reference_number',
    MEDICARE_NAME_ON_CARD: 'medicare_name_on_card',
    CARD_COLOUR: 'medicare_card_colour',
    CARD_EXPIRY_DATE: 'medicare_card_expiry_date',
    PASSPORT_PHOTO: 'PASSPORT_PHOTO',
    DRIVER_LICENSE_PHOTO_FRONT: 'DRIVER_LICENSE_PHOTO_FRONT',
    DRIVER_LICENSE_PHOTO_BACK: 'DRIVER_LICENSE_PHOTO_BACK',
    UPLOADED_DOCUMENTS: 'uploaded_documents',
    DOCUMENT_TYPE: 'document_type',
    DOCUMENT_DATA: 'document_data',
    UPLOADED_DOCUMENT: 'document_file_name',
    // bank account details
    BANK_ACCOUNT_TYPE: 'bank_account_type',
    BANK_CMT_PROVIDER: 'bank_cmt_provider',
    BANK_BSB: 'bank_bsb',
    // account man
    ACCOUNT_STATUS: 'account_status',
    ACTION: 'action',
    EQUIX_ID: 'equix_id',
    ACCOUNT_ID: 'account_id',
    ACCOUNT_TYPE: 'account_type',
    ACCOUNT_HOLDER_NAME: 'account_name',
    VETTING_RULES_GROUP: 'branch',
    HIN: 'hin',
    ADVISOR_NAME: 'advisor_name',
    ORGANISATION_NAME: 'organization_name',
    BRANCH_NAME: 'branch_name',
    EMAIL_ADDRESS: 'email',
    MOBILE_NUMBER: 'mobile_phone',
    COUNTRY: 'country',
    ACCOUNT_ADDRESS: 'account_address',
    CMA_PROVIDER: 'bank_cmt_provider',
    BSB: 'bank_bsb',
    BANK_ACCOUNT_NAME: 'bank_account_name',
    BANK_ACCOUNT_NUMBER: 'bank_account_number',
    BANK_TRANSACTION_TYPE: 'bank_transaction_type',
    EQUITY_BROKERAGE_SCHEDULE: 'tradeable_products_equity',
    LAST_UPDATE: 'last_updated',
    DATE_CREATED: 'date_created',
    ACTOR: 'actor',
    TRADEABLE_PRODUCTS: 'tradeable_products',
    EQUITY: 'equity',
    COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_STREET_NUMBER: 'company_principal_place_of_business_address_street_number',
    COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_UNIT_FLAT_NUMBER: 'company_principal_place_of_business_address_unit_flat_number',
    COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_STREET_NAME: 'company_principal_place_of_business_address_street_name',
    COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_STREET_TYPE: 'company_principal_place_of_business_address_street_type',
    COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CITY_SUBURB: 'company_principal_place_of_business_address_city_suburb',
    COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_STATE: 'company_principal_place_of_business_address_state',
    COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_POSTCODE: 'company_principal_place_of_business_address_postcode',
    COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_ADDRESS_LINE_1: 'company_principal_place_of_business_address_address_line_1',
    COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_ADDRESS_LINE_2: 'company_principal_place_of_business_address_address_line_2',
    COMPANY_REGISTERED_OFFICE_ADDRESS_STREET_NUMBER: 'company_registered_office_address_street_number',
    COMPANY_REGISTERED_OFFICE_ADDRESS_UNIT_FLAT_NUMBER: 'company_registered_office_address_unit_flat_number',
    COMPANY_REGISTERED_OFFICE_ADDRESS_STREET_NAME: 'company_registered_office_address_street_name',
    COMPANY_REGISTERED_OFFICE_ADDRESS_STREET_TYPE: 'company_registered_office_address_street_type',
    COMPANY_REGISTERED_OFFICE_ADDRESS_CITY_SUBURB: 'company_registered_office_address_city_suburb',
    COMPANY_REGISTERED_OFFICE_ADDRESS_STATE: 'company_registered_office_address_state',
    COMPANY_REGISTERED_OFFICE_ADDRESS_POSTCODE: 'company_registered_office_address_postcode',
    COMPANY_REGISTERED_OFFICE_ADDRESS_ADDRESS_LINE_1: 'company_registered_office_address_address_line_1',
    COMPANY_REGISTERED_OFFICE_ADDRESS_ADDRESS_LINE_2: 'company_registered_office_address_address_line_2',

    POSTAL_ADDRESS_STREET_NUMBER: 'postal_address_street_number',
    POSTAL_ADDRESS_UNIT_FLAT_NUMBER: 'postal_address_unit_flat_number',
    POSTAL_ADDRESS_STREET_NAME: 'postal_address_street_name',
    POSTAL_ADDRESS_STREET_TYPE: 'postal_address_street_type',
    POSTAL_ADDRESS_CITY_SUBURB: 'postal_address_city_suburb',
    POSTAL_ADDRESS_STATE: 'postal_address_state',
    POSTAL_ADDRESS_POSTCODE: 'postal_address_postcode',
    POSTAL_ADDRESS_ADDRESS_LINE_1: 'postal_address_address_line_1',
    POSTAL_ADDRESS_ADDRESS_LINE_2: 'postal_address_address_line_2',
    RESIDENTIAL_ADDRESS_STREET_NUMBER: 'residential_address_street_number',
    RESIDENTIAL_ADDRESS_UNIT_FLAT_NUMBER: 'residential_address_unit_flat_number',
    RESIDENTIAL_ADDRESS_STREET_NAME: 'residential_address_street_name',
    RESIDENTIAL_ADDRESS_STREET_TYPE: 'residential_address_street_type',
    RESIDENTIAL_ADDRESS_CITY_SUBURB: 'residential_address_city_suburb',
    RESIDENTIAL_ADDRESS_STATE: 'residential_address_state',
    RESIDENTIAL_ADDRESS_POSTCODE: 'residential_address_postcode',
    RESIDENTIAL_ADDRESS_ADDRESS_LINE_1: 'residential_address_address_line_1',
    RESIDENTIAL_ADDRESS_ADDRESS_LINE_2: 'residential_address_address_line_2'
}

const FIELD_BY_ACCOUNT_TYPE_SCREEN = [FIELD.ACCOUNT_TYPE, FIELD.CMA, FIELD.CMA_SOURCE_OF_FUNDS, FIELD.CMA_SOURCE_OF_FUNDS_DESC, FIELD.CMA_ACCOUNT_PURPOSE, FIELD.CMA_ACCOUNT_PURPOSE_DESC, FIELD.SEND_REGISTRATION_EMAIL, FIELD.ORGANIZATION_CODE, FIELD.BRANCH_CODE, FIELD.ADVISOR_CODE, FIELD.VETTING_RULES, FIELD.SCHEDULE_CODE]
const FIELD_BY_SETTLEMENT_SCREEN = [FIELD.SETTLEMENT_METHOD, FIELD.SETTLEMENT_EXISTING_HIN, FIELD.SETTLEMENT_PID, FIELD.SETTLEMENT_SUPPLEMENTARY_REFERENCE]
const FIELD_BY_COMPANY_SCREEN = [FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_POSTCODE, FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_STATE, FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_CITY_SUBURB, FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_ADDRESS_LINE_1, FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_ADDRESS_LINE_2, FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_STREET_TYPE, FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_STREET_NAME, FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_UNIT_FLAT_NUMBER, FIELD.COMPANY_REGISTERED_OFFICE_ADDRESS_STREET_NUMBER, FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_POSTCODE, FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_STATE, FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CITY_SUBURB, FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_ADDRESS_LINE_1, FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_ADDRESS_LINE_2, FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_STREET_TYPE, FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_STREET_NAME, FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_UNIT_FLAT_NUMBER, FIELD.COMPANY_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_STREET_NUMBER, FIELD.COMPANY_COUNTRY, FIELD.COMPANY_NAME, FIELD.COMPANY_TYPE, FIELD.COMPANY_ACN, FIELD.COMPANY_ABN, FIELD.COMPANY_TFN, FIELD.COMPANY_TAX_EXEMPTION, FIELD.COMPANY_TAX_EXEMPTION_DETAILS, FIELD.COUNTRY_OF_INCORPORATION, FIELD.COMPANY_DATE_OF_INCORPORATION, FIELD.COMPANY_NATURE_OF_BUSINESS_ACTIVITY, FIELD.ROA_COUNTRY, FIELD.COMPANY_ADDRESS, FIELD.COMPANY_SAME_AS_ROA, FIELD.COMPANY_COUNTRY, FIELD.COMPANY_FULL_ADDRESS, FIELD.COMPANY_WORK_PHONE, FIELD.COMPANY_FAX_PHONE, FIELD.COMPANY_MOBILE_PHONE, FIELD.COMPANY_EMAIL]
const FIELD_BY_TRUST_SCREEN = [FIELD.TRUST_NAME, FIELD.TRUST_ABN, FIELD.TRUST_TFN, FIELD.TRUST_TAX_EXEMPTION, FIELD.TRUST_TAX_EXEMPTION_DETAILS, FIELD.TRUST_ASSET_SOURCE_DETAILS, FIELD.TRUST_ACTIVITY, FIELD.TRUST_COUNTRY_OF_ESTABLISHMENT, FIELD.TRUST_TYPE]
const FIELD_BY_SUPER_FUND_SCREEN = [FIELD.SUPER_FUND_NAME, FIELD.SUPER_FUND_ABN, FIELD.SUPER_FUND_TFN, FIELD.SUPER_FUND_TAX_EXEMPTION, FIELD.SUPER_FUND_TAX_EXEMPTION_DETAILS, FIELD.SMSF]
export const FIELD_BY_APPLICANT_DETAILS_SCREEN = [FIELD.APPLICANT_ID, FIELD.EKYC_AML_CONSENT, FIELD.TOS_CONSENT, FIELD.TITLE, FIELD.FIRST_NAME, FIELD.MIDDLE_NAME, FIELD.LAST_NAME, FIELD.GENDER, FIELD.DOB, FIELD.RELATIONSHIP_TYPE, FIELD.RELATIONSHIP_DESCRIPTION, FIELD.NATIONALITY, FIELD.COUNTRY_OF_BIRTH, FIELD.OCCUPATION_TYPE, FIELD.OCCUPATION_CATEGORY, FIELD.SOURCE_OF_WEALTH, FIELD.AUSTRALIAN_TAX_RESIDENT, FIELD.TFN, FIELD.TFN_EXEMPTION, FIELD.EXEMPTION_DETAILS, FIELD.GOVERNMENT_ID, FIELD.UPLOADED_DOCUMENTS, FIELD.RESIDENTIAL_ADDRESS_STREET_NUMBER, FIELD.RESIDENTIAL_ADDRESS_POSTCODE, FIELD.RESIDENTIAL_ADDRESS_ADDRESS_LINE_1, FIELD.RESIDENTIAL_ADDRESS_ADDRESS_LINE_2, FIELD.RESIDENTIAL_ADDRESS_STATE, FIELD.RESIDENTIAL_ADDRESS_STREET_NAME, FIELD.RESIDENTIAL_ADDRESS_CITY_SUBURB, FIELD.RESIDENTIAL_ADDRESS_STREET_TYPE, FIELD.RESIDENTIAL_ADDRESS_UNIT_FLAT_NUMBER, FIELD.POSTAL_ADDRESS_CITY_SUBURB, FIELD.POSTAL_ADDRESS_STATE, FIELD.POSTAL_ADDRESS_STREET_NAME, FIELD.POSTAL_ADDRESS_STREET_NUMBER, FIELD.POSTAL_ADDRESS_UNIT_FLAT_NUMBER, FIELD.POSTAL_ADDRESS_STREET_TYPE, FIELD.POSTAL_ADDRESS_POSTCODE, FIELD.POSTAL_ADDRESS_ADDRESS_LINE_1, FIELD.POSTAL_ADDRESS_ADDRESS_LINE_2, FIELD.RESIDENTIAL_ADDRESS_COUNTRY, FIELD.RESIDENTIAL_ADDRESS_FULL_ADDRESS, FIELD.SAME_AS_RA, FIELD.POSTAL_ADDRESS_COUNTRY, FIELD.POSTAL_ADDRESS_FULL_ADDRESS, FIELD.APPLICANT_HOME_PHONE, FIELD.APPLICANT_WORK_PHONE, FIELD.APPLICANT_FAX_PHONE, FIELD.APPLICANT_MOBILE_PHONE, FIELD.APPLICANT_EMAIL]
export const FIELD_BY_ACCOUNT_TYPE = {
    [ACCOUNT_TYPE.INDIVIDUAL]: [
        ...FIELD_BY_ACCOUNT_TYPE_SCREEN,
        ...FIELD_BY_SETTLEMENT_SCREEN,
        FIELD.TRADE_CONFIRMATIONS, // array
        FIELD.APPLICANT_DETAILS // array
    ],
    [ACCOUNT_TYPE.JOINT]: [
        ...FIELD_BY_ACCOUNT_TYPE_SCREEN,
        ...FIELD_BY_SETTLEMENT_SCREEN,
        FIELD.TRADE_CONFIRMATIONS, // array
        FIELD.APPLICANT_DETAILS // array
    ],
    [ACCOUNT_TYPE.COMPANY]: [
        ...FIELD_BY_ACCOUNT_TYPE_SCREEN,
        ...FIELD_BY_SETTLEMENT_SCREEN,
        ...FIELD_BY_COMPANY_SCREEN,
        ...FIELD_BY_SETTLEMENT_SCREEN,
        FIELD.TRADE_CONFIRMATIONS, // array
        FIELD.APPLICANT_DETAILS // array
    ],
    [ACCOUNT_TYPE.TRUST_INDIVIDUAL]: [
        ...FIELD_BY_ACCOUNT_TYPE_SCREEN,
        ...FIELD_BY_TRUST_SCREEN,
        ...FIELD_BY_SETTLEMENT_SCREEN,
        FIELD.TRADE_CONFIRMATIONS, // array
        FIELD.APPLICANT_DETAILS // array
    ],
    [ACCOUNT_TYPE.TRUST_COMPANY]: [
        ...FIELD_BY_ACCOUNT_TYPE_SCREEN,
        ...FIELD_BY_TRUST_SCREEN,
        ...FIELD_BY_COMPANY_SCREEN,
        ...FIELD_BY_SETTLEMENT_SCREEN,
        FIELD.TRADE_CONFIRMATIONS, // array
        FIELD.APPLICANT_DETAILS // array
    ],
    [ACCOUNT_TYPE.SUPER_FUND_INDIVIDUAL]: [
        ...FIELD_BY_ACCOUNT_TYPE_SCREEN,
        ...FIELD_BY_SUPER_FUND_SCREEN,
        ...FIELD_BY_SETTLEMENT_SCREEN,
        FIELD.TRADE_CONFIRMATIONS, // array
        FIELD.APPLICANT_DETAILS // array
    ],
    [ACCOUNT_TYPE.SUPER_FUND_COMPANY]: [
        ...FIELD_BY_ACCOUNT_TYPE_SCREEN,
        ...FIELD_BY_SUPER_FUND_SCREEN,
        ...FIELD_BY_COMPANY_SCREEN,
        ...FIELD_BY_SETTLEMENT_SCREEN,
        FIELD.TRADE_CONFIRMATIONS, // array
        FIELD.APPLICANT_DETAILS // array
    ]
}

export const SCREEN = {
    ACCOUNT_TYPE: {
        label: 'lang_account_details',
        value: 'account_type'
    },
    PRIMARY_APPLICANT: {
        label: 'lang_personal_information',
        value: 'primary_applicant'
    },
    TRUST_DETAILS: {
        label: 'lang_trust_details',
        value: 'trust_details'
    },
    SUPER_FUND_DETAILS: {
        label: 'lang_super_fund_details',
        value: 'super_fund_details'
    },
    COMPANY_DETAILS: {
        label: 'lang_company_details',
        value: 'company_details'
    },
    SETTLEMENT_DETAILS: {
        label: 'lang_settlement_details',
        value: 'settlement_details'
    },
    TRADE_CONFIRMATIONS: {
        label: 'lang_trade_confirmation',
        value: 'trade_confirmations'
    },
    NUMBER_OF_APPLICANT: {
        label: 'lang_number_of_applicant',
        value: 'number_of_applicant'
    },
    APPLICANTS_DETAILS: {
        label: 'lang_identify_verification',
        value: 'applicants_details'
    }
}
export const BUTTON = {
    NEXT: 'lang_next',
    CANCEL: 'lang_cancel',
    BACK: 'lang_back',
    SAVE_DRAFT: 'lang_save_and_continue_later',
    RESTART: 'lang_restart',
    SUBMIT: 'lang_submit',
    DELETE_DRAFT: 'lang_delete_draft',
    SAVE_AND_UPLOAD: 'lang_save_and_upload',
    CLOSE: 'lang_close',
    YES: 'lang_yes',
    NO: 'lang_no',
    OK: 'lang_ok'
}
export const CMA = {
    CREATE_NEW: true,
    USE_EXISTING: false
}

export const GOVERNMENT_ID_TYPE = {
    DRIVER_LICENSE: 'DRIVER_LICENSE',
    MEDICARE_CARD: 'MEDICARE_CARD',
    PASSPORT: 'PASSPORT'
}
export const STATE_OF_ISSUE = {
    ACT: 'ACT',
    NSW: 'NSW',
    NT: 'NT',
    QLD: 'QLD',
    SA: 'SA',
    TAS: 'TAS',
    VIC: 'VIC',
    WA: 'WA'
}

export const ACCOUNT_STATUS = {
    EKYC_IN_PROGRESS: 'EKYC_IN_PROGRESS',
    EKYC_VERIFIED_ADMINS: 'EKYC_VERIFIED_ADMINS',
    EKYC_PENDING: 'EKYC_PENDING',
    EKYC_MORE_INFO: 'EKYC_MORE_INFO',
    EKYC_AML_STATUS: 'ekyc_aml_status',
    EKYC_INTERACTIVE_LOCKED_OUT: 'EKYC_INTERACTIVE_LOCKED_OUT',
    EKYC_FAILED_AML: 'EKYC_FAILED_AML',
    EKYC_LOCKED_OUT: 'EKYC_LOCKED_OUT',
    BANK_PENDING: 'BANK_PENDING',
    BANK_SUBMITTED: 'BANK_SUBMITTED',
    MORRISON_PENDING: 'MORRISON_PENDING',
    MORRISON_CANCELLED: 'MORRISON_CANCELLED',
    MORRISON_IN_REFERRED: 'MORRISON_IN_REFERRED',
    CLOSED: 'CLOSED',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    CREATED_FAILED: 'CREATED_FAILED',
    CREATING: 'CREATING'
}

export const TRUST_TYPE = {
    BARE: 'BARE',
    DISCRETIONARY: 'DISCRETIONARY',
    FIXED: 'FIXED',
    UNIT: 'UNIT',
    OTHER: 'OTHER'
}

export const METHOD = {
    EMAIL: 'EMAIL',
    // FAX: 'FAX',
    POSTAL: 'POSTAL'
}
export const BANK_ACCOUNT_TYPE = {
    EMPTY: 'EMPTY',
    BANK_ACCOUNT: 'BANK_ACCOUNT',
    LINKED_CMT_CMA: 'LINKED_CMT_CMA'
}

export const TRANSACTION_TYPE = {
    BOTH: 'BOTH',
    CREDIT: 'CREDIT',
    DEBIT: 'DEBIT'
}

export const CMT_PROVIDER = {
    ADL: 'ADL',
    ANZ: 'ANZ',
    DDH: 'DDH',
    DDHW: 'DDHW',
    MBLA: 'MBLA'
}

export const EKYC_STATUS = {
    EKYC_VERIFIED: 'EKYC_VERIFIED',
    EKYC_VERIFIED_ADMINS: 'EKYC_VERIFIED_ADMINS',
    EKYC_VERIFIED_WITH_CHANGES: 'EKYC_VERIFIED_WITH_CHANGES',
    EKYC_IN_PROGRESS: 'EKYC_IN_PROGRESS',
    EKYC_PENDING: 'EKYC_PENDING',
    EKYC_LOCKED_OUT: 'EKYC_LOCKED_OUT'
}

export const GOVID_STATUS = {
    EKYC_VERIFIED: 'EKYC_VERIFIED',
    EKYC_VERIFIED_ADMINS: 'EKYC_VERIFIED_ADMINS',
    EKYC_VERIFIED_WITH_CHANGES: 'EKYC_VERIFIED_WITH_CHANGES',
    EKYC_IN_PROGRESS: 'EKYC_IN_PROGRESS',
    EKYC_PENDING: 'EKYC_PENDING',
    EKYC_LOCKED_OUT: 'EKYC_LOCKED_OUT'
}

export const DOCUMENT_STATUS = {
    EKYC_VERIFIED_ADMINS: 'EKYC_VERIFIED_ADMINS',
    EKYC_REJECTED_ADMINS: 'EKYC_REJECTED_ADMINS',
    EKYC_PENDING: 'EKYC_PENDING'
}

export const BANK_STATUS = {
    BANK_PENDING: 'BANK_PENDING',
    BANK_SUBMITTED: 'BANK_SUBMITTED'
}

export const MORRISON_STATUS = {
    MORRISON_PENDING: 'MORRISON_PENDING',
    MORRISON_CANCELLED: 'MORRISON_CANCELLED',
    MORRISON_IN_REFERRED: 'MORRISON_IN_REFERRED'
}

export const PID = [
    {
        label: 'lang_euroz_securities_limited',
        value: 1027
    },
    {
        label: 'lang_euroz_securities_limited',
        value: 1028
    },
    {
        label: 'lang_terrain_securities_pty_ltd',
        value: 1033
    },
    {
        label: 'lang_cybertrade_australia_securities_limited',
        value: 1042
    },
    {
        label: 'lang_westpac_securities_limited',
        value: 1052
    },
    {
        label: 'lang_bridges_financial_services_pty_ltd',
        value: 1062
    },
    {
        label: 'lang_bridges_financial_services_pty_limited',
        value: 1063
    },
    {
        label: 'lang_bridges_financial_services_pty_limited',
        value: 1064
    },
    {
        label: 'lang_credit_suisse_first_boston_aust_equ_ltd',
        value: 1103
    },
    {
        label: 'lang_credit_suisse_equities_(australia)_ltd',
        value: 1104
    },
    {
        label: 'lang_berndale_securities_ltd',
        value: 1113
    },
    {
        label: 'lang_burdett,_buckeridge_&_young_limited',
        value: 1123
    },
    {
        label: 'lang_bby_limited',
        value: 1124
    },
    {
        label: 'lang_cameron_stockbroking_limited',
        value: 1132
    },
    {
        label: 'lang_openmarkets_australia_limited',
        value: 1135
    },
    {
        label: 'lang_open_markets_australia_limited',
        value: 1136
    },
    {
        label: 'lang_peake_lands_kirwan_pty_ltd',
        value: 1153
    },
    {
        label: 'lang_lands_kirwan_tong_stockbrokers_pty_ltd',
        value: 1158
    },
    {
        label: 'lang_fleet_stockbroking_ltd',
        value: 1183
    },
    {
        label: 'lang_fortis_clearing_sydney_pty_limited',
        value: 1192
    },
    {
        label: 'lang_abn_amro_clearing_sydney_pty_ltd',
        value: 1193
    },
    {
        label: 'lang_reynolds_&_co_pty_ltd',
        value: 1212
    },
    {
        label: 'lang_wealthhub_securities_limited',
        value: 1226
    },
    {
        label: 'lang_wealthhub_securities_limited',
        value: 1227
    },
    {
        label: 'lang_foster_stockbroking_pty_ltd',
        value: 1231
    },
    {
        label: 'lang_grange_securities_limited',
        value: 1312
    },
    {
        label: 'lang_bnp_paribas_equities_private_(aust)_ltd',
        value: 1322
    },
    {
        label: 'lang_bnp_paribas_equities_(australia)_limited',
        value: 1353
    },
    {
        label: 'lang_hudson_securities_pty_ltd',
        value: 1382
    },
    {
        label: 'lang_dicksons_ltd',
        value: 1392
    },
    {
        label: 'lang_commonwealth_securities_limited',
        value: 1402
    },
    {
        label: 'lang_etrade_australia_securities_limited',
        value: 1442
    },
    {
        label: 'lang_southern_cross_equities_ltd',
        value: 1452
    },
    {
        label: 'lang_southern_cross_equities_limited',
        value: 1459
    },
    {
        label: 'lang_william_noall_ltd',
        value: 1493
    },
    {
        label: 'lang_ubs_securities_australia_limited',
        value: 1502
    },
    {
        label: 'lang_ubs_securities_australia_limited',
        value: 1505
    },
    {
        label: 'lang_bell_potter_securities_limited',
        value: 1543
    },
    {
        label: 'lang_macquarie_securities_(australia)_limited',
        value: 1572
    },
    {
        label: 'lang_commonwealth_securities_ltd_(margin_len)',
        value: 1602
    },
    {
        label: 'lang_religare_securities_australia_pty_ltd',
        value: 1652
    },
    {
        label: 'lang_findlay_&_co_stockbroking_ltd',
        value: 1782
    },
    {
        label: 'lang_pershing_securities_australia_pty_ltd',
        value: 1792
    },
    {
        label: 'lang_hsbc_stockbroking_(australia)_pty_ltd',
        value: 1802
    },
    {
        label: 'lang_finclear_execution_limited',
        value: 1822
    },
    {
        label: 'lang_tiffit_securities_(australia)_ptd_ltd',
        value: 1833
    },
    {
        label: 'lang_merrill_lynch_private_(australia)_ltd',
        value: 1843
    },
    {
        label: 'lang_cazenove_australia_pty_ltd',
        value: 1862
    },
    {
        label: 'lang_bnp_paribas_securities_sevices',
        value: 1892
    },
    {
        label: 'lang_avcol_stockbroking_pty_ltd',
        value: 1992
    },
    {
        label: 'lang_td_waterhouse_investor_services_limited',
        value: 2002
    },
    {
        label: 'lang_baker_young_stockbrokers_limited',
        value: 2022
    },
    {
        label: 'lang_baker_young_stockbrokers_limited',
        value: 2026
    },
    {
        label: 'lang_citigroup_global_markets_australia_p/l',
        value: 2032
    },
    {
        label: 'lang_citigroup_global_markets_aust_pty_ltd',
        value: 2033
    },
    {
        label: 'lang_deutsche_securities_australia_limited',
        value: 2102
    },
    {
        label: 'lang_deutsche_securities_australia_limited',
        value: 2103
    },
    {
        label: 'lang_deutsche_securities_australia_limited',
        value: 2104
    },
    {
        label: 'lang_deutsche_securities_australia_limited',
        value: 2105
    },
    {
        label: 'lang_mj_wren_and_partners_stockbrokers',
        value: 2183
    },
    {
        label: 'lang_joseph_palmer_&_sons',
        value: 2262
    },
    {
        label: 'lang_aot_australia_pty_ltd',
        value: 2282
    },
    {
        label: 'lang_ord_minnett_ltd',
        value: 2332
    },
    {
        label: 'lang_ord_minnett_limited',
        value: 2337
    },
    {
        label: 'lang_ord_minnett',
        value: 2338
    },
    {
        label: 'lang_ord_minnett_limited',
        value: 2339
    },
    {
        label: 'lang_anz_securities_limited',
        value: 2353
    },
    {
        label: 'lang_macquarie_equities_ltd_retail',
        value: 2442
    },
    {
        label: 'lang_statton_securities',
        value: 2492
    },
    {
        label: 'lang_ccz_statton_equities_pty_ltd',
        value: 2493
    },
    {
        label: 'lang_instinet_australia_limited',
        value: 2502
    },
    {
        label: 'lang_rbc_securities_australia_pty_limited',
        value: 2542
    },
    {
        label: 'lang_third_party_platform_pty_ltd',
        value: 2552
    },
    {
        label: 'lang_kj_polkinghorne_&_co_pty_ltd',
        value: 2622
    },
    {
        label: 'lang_cmc_markets_stockbroking_limited',
        value: 2652
    },
    {
        label: 'lang_cmc_markets_stockbroking_limited',
        value: 2662
    },
    {
        label: 'lang_abn_amro_equities_australia_ltd',
        value: 2703
    },
    {
        label: 'lang_cimb_securities_(australia)_ltd',
        value: 2705
    },
    {
        label: 'lang_d2mx_pty_ltd',
        value: 2894
    },
    {
        label: 'lang_intersuisse_securities_limited',
        value: 2921
    },
    {
        label: 'lang_octa_phillip_securities_limited(pershing',
        value: 2922
    },
    {
        label: 'lang_intersuisse_ltd',
        value: 2923
    },
    {
        label: 'lang_phillip_capital_limited',
        value: 2924
    },
    {
        label: 'lang_jp_morgan_securities_australia_limited',
        value: 2972
    },
    {
        label: 'lang_shaw_stockbroking_limited',
        value: 2981
    },
    {
        label: 'lang_shaw_stockbroking_limited',
        value: 2982
    },
    {
        label: 'lang_morgan_stanley_dean_witter_aust_sec_ltd',
        value: 2992
    },
    {
        label: 'lang_ubs_private_clients_australia_limited',
        value: 3003
    },
    {
        label: 'lang_citigroup_securities_clearing_aust_ltd',
        value: 3033
    },
    {
        label: 'lang_daiwa_securities_smbc_stockbroking_ltd',
        value: 3063
    },
    {
        label: 'lang_austock_securities_limited',
        value: 3073
    },
    {
        label: 'lang_austock_limited',
        value: 3074
    },
    {
        label: 'lang_barton_capital_securities_pty_ltd',
        value: 3083
    },
    {
        label: 'lang_comsec_trading_limited',
        value: 3102
    },
    {
        label: 'lang_cba_equities_limited',
        value: 3103
    },
    {
        label: 'lang_el&c_baillieu_stockbroking_ltd',
        value: 3113
    },
    {
        label: 'lang_baillieu_holst_ltd',
        value: 3118
    },
    {
        label: 'lang_johnson_taylor_potter_limited',
        value: 3173
    },
    {
        label: 'lang_tolhurst_noall_limited',
        value: 3223
    },
    {
        label: 'lang_falkiners_stockbroking_limited',
        value: 3273
    },
    {
        label: 'lang_opes_prime_stockbroking_ltd',
        value: 3303
    },
    {
        label: 'lang_tir_securities_(australia)_limited',
        value: 3332
    },
    {
        label: 'lang_morgan_stanley_wealth_management_austral',
        value: 3383
    },
    {
        label: 'lang_itg_australia_limited',
        value: 3453
    },
    {
        label: 'lang_fw_holst_&_co_pty_ltd',
        value: 3523
    },
    {
        label: 'lang_lonsec_limited',
        value: 3552
    },
    {
        label: 'lang_lonsec_limited_(pershing)',
        value: 3554
    },
    {
        label: 'lang_finclear_execution_limited_(ubs)',
        value: 3555
    },
    {
        label: 'lang_finclear_execution_limited_(ubs)',
        value: 3556
    },
    {
        label: 'lang_goldman_sachs_j_b_were_pty_ltd',
        value: 3610
    },
    {
        label: 'lang_goldman_sachs_jb_were',
        value: 3614
    },
    {
        label: 'lang_merrill_lynch_equities_(australia)_ltd',
        value: 3663
    },
    {
        label: 'lang_merrill_lynch_equities_(aust)_ltd',
        value: 3666
    },
    {
        label: 'lang_charles_schwab_australia_pty_ltd',
        value: 3882
    },
    {
        label: 'lang_morgans_financial_limited',
        value: 4064
    },
    {
        label: 'lang_burrell_stockbroking_pty_ltd',
        value: 4094
    },
    {
        label: 'lang_challenger_first_pacific_limited',
        value: 4114
    },
    {
        label: 'lang_wilson_htm_ltd',
        value: 4124
    },
    {
        label: 'lang_wilsons_advisory_and_stockbroking_ltd',
        value: 4125
    },
    {
        label: 'lang_wilsons_advisory_and_stockbroking_ltd',
        value: 4126
    },
    {
        label: 'lang_taylor_collison_ltd',
        value: 5125
    },
    {
        label: 'lang_taylor_collison_limited',
        value: 5127
    },
    {
        label: 'lang_taylor_collison_limited',
        value: 5128
    },
    {
        label: 'lang_taylor_collison_limited',
        value: 5129
    },
    {
        label: 'lang_dj_carmichael_pty_limited',
        value: 6046
    },
    {
        label: 'lang_dj_carmichael_pershing',
        value: 6047
    },
    {
        label: 'lang_cibc_world_markets_australia_limited',
        value: 6056
    },
    {
        label: 'lang_jdv_limited',
        value: 6066
    },
    {
        label: 'lang_hartleys_limited',
        value: 6086
    },
    {
        label: 'lang_kirke_securities_ltd',
        value: 6126
    },
    {
        label: 'lang_kirke_securities_ltd',
        value: 6128
    },
    {
        label: 'lang_kirke_securities_ltd',
        value: 6129
    },
    {
        label: 'lang_montagu_stockbrokers_pty_ltd',
        value: 6176
    },
    {
        label: 'lang_hogan_&_partners_stockbrokers_pty_ltd',
        value: 6186
    },
    {
        label: 'lang_chartpac_securities_ltd',
        value: 6206
    },
    {
        label: 'lang_australian_investment_exchange_limited',
        value: 6381
    },
    {
        label: 'lang_australian_investment_exchange',
        value: 6386
    },
    {
        label: 'lang_tricom_equities_limited',
        value: 6682
    },
    {
        label: 'lang_stonebridge_securities_limited',
        value: 6684
    },
    {
        label: 'lang_canaccord_genuity_patersons_limited',
        value: 6776
    },
    {
        label: 'lang_canaccord_genuity_financial_ltd',
        value: 6777
    },
    {
        label: 'lang_state_one_stockbroking_ltd',
        value: 6786
    },
    {
        label: 'lang_state_one_stockbroking',
        value: 6788
    },
    {
        label: 'lang_mortimer_&_chua_pty_ltd',
        value: 6886
    },
    {
        label: 'lang_shadforths_limited',
        value: 7047
    },
    {
        label: 'lang_c_j_weedon_&_company',
        value: 7107
    },
    {
        label: 'lang_citicorp_warrants',
        value: 8014
    },
    {
        label: 'lang_rbs_warrants',
        value: 8072
    },
    {
        label: 'lang_australian_clearing_house_pty_limited',
        value: 8332
    },
    {
        label: 'lang_asx_international_services_pty_limited',
        value: 8902
    },
    {
        label: 'lang_optiver_australia_pty_ltd',
        value: 9232
    },
    {
        label: 'lang_timberhill_australia',
        value: 9402
    },
    {
        label: 'lang_onevue_fund_serviced_limited',
        value: 11225
    },
    {
        label: 'lang_national_australia_bank_ltd',
        value: 11331
    },
    {
        label: 'lang_commonwealth_custodial_services_limited',
        value: 20001
    },
    {
        label: 'lang_jpmorgan_custodial_services_pty_ltd',
        value: 20003
    },
    {
        label: 'lang_anz_nominees_limited',
        value: 20005
    },
    {
        label: 'lang_national_australia_bank_custodian_serv',
        value: 20006
    },
    {
        label: 'lang_bnp_paribas_fund_services_australasia_pl',
        value: 20007
    },
    {
        label: 'lang_rbc_global_services_australia_pty_ltd',
        value: 20009
    },
    {
        label: 'lang_navigator_australia_limited',
        value: 20016
    },
    {
        label: 'lang_citicorp_nominees_pty_ltd',
        value: 20018
    },
    {
        label: 'lang_bt_securities_limited_(margin_lending)',
        value: 20021
    },
    {
        label: 'lang_trust_company_of_australia_limited',
        value: 20025
    },
    {
        label: 'lang_permanent_trustee_company_ltd',
        value: 20027
    },
    {
        label: 'lang_hih_casualty_&_general_insurance_ltd',
        value: 20031
    },
    {
        label: 'lang_merrill_lynch_(australia)_nominees_pty_ltd',
        value: 20036
    },
    {
        label: 'lang_invia_custodian_pty_ltd',
        value: 20039
    },
    {
        label: 'lang_westpac_custodian_nominees_limited',
        value: 20041
    },
    {
        label: 'lang_iag_asset_management_limited',
        value: 20042
    },
    {
        label: 'lang_hsbc_asset_management_noms_(aust)_p/l',
        value: 20052
    },
    {
        label: 'lang_equity_trustees_limited',
        value: 20054
    },
    {
        label: 'lang_hsbc_custody_nominees_(aust)_limited',
        value: 20057
    },
    {
        label: 'lang_national_mutual_funds_management_limited',
        value: 20059
    },
    {
        label: 'lang_guardian_trust_australia_limited',
        value: 20063
    },
    {
        label: 'lang_certes_ct_pty_ltd',
        value: 20066
    },
    {
        label: 'lang_perpetual_trustees_consolidated_limited',
        value: 20068
    },
    {
        label: 'lang_australian_casualty_&_life_limited',
        value: 20075
    },
    {
        label: 'lang_jpmorgan_custodians_limited',
        value: 20080
    },
    {
        label: 'lang_jpmorgan_custodial_services_p/l_(btlife)',
        value: 20081
    },
    {
        label: 'lang_sandhurst_trustees_limited',
        value: 20082
    },
    {
        label: 'lang_ioof_investment_management_limited_(vic)',
        value: 20083
    },
    {
        label: 'lang_tower_australia_limited',
        value: 20085
    },
    {
        label: 'lang_sepon_(australia)_pty_limited',
        value: 20092
    },
    {
        label: 'lang_gio_asset_management_ltd',
        value: 20096
    },
    {
        label: 'lang_anz_executors_&_trustee_company_limited',
        value: 20098
    },
    {
        label: 'lang_cgu_insurance_limited',
        value: 20100
    },
    {
        label: 'lang_jp_morgan_nominess_australia_limited',
        value: 20104
    },
    {
        label: 'lang_national_australia_trustees_limited',
        value: 20106
    },
    {
        label: 'lang_bank_of_western_australia_limited',
        value: 20110
    },
    {
        label: 'lang_margaret_street_nominees_pty_limited',
        value: 20117
    },
    {
        label: 'lang_australian_executor_trustee_limited',
        value: 20120
    },
    {
        label: 'lang_computershare_clearing_pty_ltd',
        value: 20127
    },
    {
        label: 'lang_jdv_solutions_pty_ltd',
        value: 20128
    },
    {
        label: 'lang_asgard_capital_management_limited',
        value: 20131
    },
    {
        label: 'lang_suncorp_metway_insurance_limited',
        value: 20151
    },
    {
        label: 'lang_suncorp_custodian_services_pty_ltd',
        value: 20152
    },
    {
        label: 'lang_national_mutual_life_nominees_ltd',
        value: 20157
    },
    {
        label: 'lang_state_trustees_limited',
        value: 20159
    },
    {
        label: 'lang_individual_portfolio_managers_pty_ltd',
        value: 20168
    },
    {
        label: 'lang_bpc_securities_pty_ltd',
        value: 20306
    },
    {
        label: 'lang_australian_stockbroking_&_advisory_serv',
        value: 20311
    },
    {
        label: 'lang_merrill_lynch_investment_managers_ltd',
        value: 20366
    },
    {
        label: 'lang_netwealth_investments_limited',
        value: 20367
    },
    {
        label: 'lang_link_market_services',
        value: 20378
    },
    {
        label: 'lang_custody_execution_&_clearing_services_pl',
        value: 20404
    },
    {
        label: 'lang_ing_life_limited',
        value: 21000
    },
    {
        label: 'lang_bond_street_custodians_limited_insto',
        value: 21003
    },
    {
        label: 'lang_tower_trust_(sa)_ltd',
        value: 21007
    },
    {
        label: 'lang_leveraged_equities_nominees_limited',
        value: 21008
    },
    {
        label: 'lang_public_trustee_(sa)',
        value: 21009
    },
    {
        label: 'lang_hsbc_securities_investments_(aust)_p/l',
        value: 21013
    },
    {
        label: 'lang_macquarie_investment_management_ltd',
        value: 21015
    },
    {
        label: 'lang_zurich_investment_management_limited',
        value: 21017
    },
    {
        label: 'lang_metway_credit_corporation_ltd',
        value: 21018
    },
    {
        label: 'lang_anz_margin_services_pty_ltd',
        value: 21019
    },
    {
        label: 'lang_tyndall_investment_management_limited',
        value: 21021
    },
    {
        label: 'lang_perpetual_trustees_tasmania_limited',
        value: 21022
    },
    {
        label: 'lang_acs_securities_pty_ltd',
        value: 21023
    },
    {
        label: 'lang_jpmorgan_custodial_services_p/l_(subcus)',
        value: 21024
    },
    {
        label: 'lang_bt_portfolio_services_limited',
        value: 21025
    },
    {
        label: 'lang_bnp_paribas_equity_finance_pty_ltd',
        value: 21026
    },
    {
        label: 'lang_bond_street_custodians_ltd_ptf_serv',
        value: 21028
    },
    {
        label: 'lang_office_of_the_protective_commissioner',
        value: 21029
    },
    {
        label: 'lang_national_margin_services_pty_limited',
        value: 21030
    },
    {
        label: 'lang_national_stock_exchange_of_australia_ltd',
        value: 21031
    },
    {
        label: 'lang_the_rock_investment_planning',
        value: 21033
    },
    {
        label: 'lang_bt_portfolio_services_ltd',
        value: 21034
    },
    {
        label: 'lang_tasmanian_perpetual_trustees_limited',
        value: 21035
    },
    {
        label: 'lang_mutual_trust_pty_ltd',
        value: 21036
    },
    {
        label: 'lang_jp_morgan_nominees_australia_ltd_gsp',
        value: 21104
    },
    {
        label: 'lang_anz_nominees_ltd',
        value: 21105
    },
    {
        label: 'lang_rbc_investor_services_trust',
        value: 21119
    },
    {
        label: 'lang_chimaera_capital_pty_ltd',
        value: 22123
    },
    {
        label: 'lang_anz_securities_limited',
        value: 22353
    },
    {
        label: 'lang_value_nominees_(st_george)',
        value: 22888
    },
    {
        label: 'lang_ubs_wealth_management_australia',
        value: 23005
    },
    {
        label: 'lang_shadforths/ubs_securities',
        value: 27048
    },
    {
        label: 'lang_bnp_paribas_securities_sevices',
        value: 27050
    },
    {
        label: 'lang_one_managed_investment_funds_limited',
        value: 27052
    },
    {
        label: 'lang_crestone_wealth_management_limited',
        value: 27054
    }
]

export const OCCUPATION_TYPE = {
    BUSINESS_OWNER: 'Business Owner',
    CHIEF_EXECUTIVES: 'Chief Executives, General Managers and Legislators',
    CLERIAL_ADMINISTRATIVE: 'Clerical and administrative workers',
    COMUNITY_PERSONAL: 'Community and personal service workers',
    EMPLOYEES: 'Employees',
    HOMEMAKER: 'Homemaker',
    LABOURERS: 'Labourers',
    MACHINERY_OPERATORS: 'Machinery operators and drivers',
    MILITARY: 'Military',
    PROFESSIONALS: 'Professionals',
    RETIRED: 'Retired',
    SALES_WORKERS: 'Sales workers',
    STUDENT: 'Student',
    TECHNICIANS_TRADES: 'Technicians and trades workers'
}

const listOccupationCategory = {
    [OCCUPATION_TYPE.BUSINESS_OWNER]: [
        'Accommodation and Food Services',
        'Administrative and Support Services',
        'Arms or Weapons Manufacture or Distribution',
        'Arts and Recreation Services',
        'Bar or Licensed Club',
        'Betting, Bookmaking, Gambling and Gaming',
        'Cafe and Restaurant',
        'Charity Community or Social Services',
        'Construction',
        'Digital Currency Traders',
        'Education and Training',
        'Electricity, Gas, Water and Waste Services',
        'Farming and Agriculture',
        'Financial and Insurance Services',
        'Health Care and Social Assistance',
        'Hotel and Motel',
        'Information Media and Telecommunications',
        'Jewel, Gem and Precious Metals',
        'Mining, Gas, Oil and Petroleum',
        'Money Exchange or Foreign FX Services',
        'Pawn Brokers',
        'Professional, Scientific and Technical Services',
        'Public Administration and Safety',
        'Real Estate Agent',
        'Rental, Hiring and Real Estate Services',
        'Retail Trade',
        'Transport, Postal and Warehousing',
        'Wholesale Trade'
    ],
    [OCCUPATION_TYPE.CHIEF_EXECUTIVES]: [
        'Accommodation and Food Services',
        'Administrative and Support Services',
        'Arms or Weapons Manufacture or Distribution',
        'Arts and Recreation Services',
        'Bar or Licensed Club',
        'Betting, Bookmaking, Gambling and Gaming',
        'Cafe and Restaurant',
        'Charity Community or Social Services',
        'Construction',
        'Digital Currency Traders',
        'Education and Training',
        'Electricity, Gas, Water and Waste Services',
        'Farming and Agriculture',
        'Financial and Insurance Services',
        'Health Care and Social Assistance',
        'Hotel and Motel',
        'Information Media and Telecommunications',
        'Jewel, Gem and Precious Metals',
        'Mining, Gas, Oil and Petroleum',
        'Money Exchange or Foreign FX Services',
        'Pawn Brokers',
        'Professional, Scientific and Technical Services',
        'Public Administration and Safety',
        'Real Estate Agent',
        'Rental, Hiring and Real Estate Services',
        'Retail Trade',
        'Transport, Postal and Warehousing',
        'Wholesale Trade'
    ],
    [OCCUPATION_TYPE.CLERIAL_ADMINISTRATIVE]: [
        'Clerical and Administrative Workers',
        'Clerical and Office Support Workers',
        'General Clerical Workers',
        'Inquiry Clerks and Receptionists',
        'Numerical Clerks',
        'Office Managers and Program Administrators',
        'Personal Assistants and Secretaries'
    ],
    [OCCUPATION_TYPE.COMUNITY_PERSONAL]: [
        'Carers and Aides',
        'Health and Welfare Support Workers',
        'Hospitality Workers',
        'Protective Service Workers',
        'Sports and Personal Service Workers'
    ],
    [OCCUPATION_TYPE.EMPLOYEES]: [
        'Advertising, Public Relations and Sales',
        'Construction, Distribution and Production',
        'Education, Health and Welfare Services',
        'Farmers and Farm',
        'Hospitality, Retail and Service',
        'Information & Communication Technology'
    ],
    [OCCUPATION_TYPE.HOMEMAKER]: ['Homemaker'],
    [OCCUPATION_TYPE.LABOURERS]: [
        'Cleaners and Laundry Workers',
        'Construction and Mining Labourers',
        'Factory Process Workers',
        'Farm, Forestry and Garden Workers',
        'Food Preparation Assistants',
        'Labourers'
    ],
    [OCCUPATION_TYPE.MACHINERY_OPERATORS]: [
        'Machinery',
        'Mobile Plant Operators',
        'Road and Rail Drivers',
        'Storepersons'
    ],
    [OCCUPATION_TYPE.MILITARY]: [
        'Military enlisted',
        'Military officer'
    ],
    [OCCUPATION_TYPE.PROFESSIONALS]: [
        'Accountants, Auditors and Company Secretaries',
        'Arts and Media Professionals',
        'Aviation',
        'Business, Human Resource and Marketing Professionals',
        'Design, Engineering, Science and Transport Professionals',
        'Doctor, Veterinarian, Health Professionals',
        'Education Professionals',
        'Financial Brokers and Dealers, and Investment Advisers',
        'Information & Communication Technology Professionals',
        'Legal, Social and Welfare Professionals',
        'Real Estate Agent'
    ],
    [OCCUPATION_TYPE.RETIRED]: ['Retired'],
    [OCCUPATION_TYPE.SALES_WORKERS]: [
        'Sales Assistants and Salespersons',
        'Sales Representatives and Agents',
        'Sales Support Workers'
    ],
    [OCCUPATION_TYPE.STUDENT]: ['Student'],
    [OCCUPATION_TYPE.TECHNICIANS_TRADES]: [
        'Automotive and Engineering Trades Workers',
        'Construction Trades Workers',
        'Electrotechnology and Telecommunications Trades Workers',
        'Engineering and Science Technicians',
        'Food Trades Workers',
        'Information & Communication Technology Technicians',
        'Other Technicians and Trades Workers',
        'Skilled Animal and Horticultural Workers'
    ]
}

const listOccupationType = [
    OCCUPATION_TYPE.BUSINESS_OWNER,
    OCCUPATION_TYPE.CHIEF_EXECUTIVES,
    OCCUPATION_TYPE.CLERIAL_ADMINISTRATIVE,
    OCCUPATION_TYPE.COMUNITY_PERSONAL,
    OCCUPATION_TYPE.EMPLOYEES,
    OCCUPATION_TYPE.HOMEMAKER,
    OCCUPATION_TYPE.LABOURERS,
    OCCUPATION_TYPE.MACHINERY_OPERATORS,
    OCCUPATION_TYPE.MILITARY,
    OCCUPATION_TYPE.PROFESSIONALS,
    OCCUPATION_TYPE.RETIRED,
    OCCUPATION_TYPE.SALES_WORKERS,
    OCCUPATION_TYPE.STUDENT,
    OCCUPATION_TYPE.TECHNICIANS_TRADES
]

export const RELATIONSHIP_TYPE = {
    OWNER: 'OWNER',
    POWER_OF_ATTORNEY: 'POWER_OF_ATTORNEY',
    OTHER: 'OTHER',
    DIRECTOR: 'DIRECTOR',
    BENEFICIAL_OWNER: 'BENEFICIAL_OWNER',
    BENEFICARY: 'BENEFICARY',
    BENEFICARY_CLASS: 'BENEFICARY_CLASS',
    TRUST_CONTRIBUTOR: 'TRUST_CONTRIBUTOR',
    TRUST_EXECUTOR: 'TRUST_EXECUTOR',
    TRUST_APPOINTER_PROTECTOR: 'TRUST_APPOINTER_PROTECTOR',
    TRUST_SETTLOR: 'TRUST_SETTLOR'
}

export const CARD_COLOUR = {
    GREEN: 'G',
    BLUE: 'B',
    YELLOW: 'Y'
}

export const DOCUMENT_UPLOAD = {
    TELEPHONE_BILL: 'TELEPHONE_BILL',
    ELECTRICITY_GAS_BILL: 'ELECTRICITY_GAS_BILL',
    WATER_BILL: 'WATER_BILL',
    COUNCIL_RATES_NOTICE: 'COUNCIL_RATES_NOTICE',
    BANK_STATEMENT: 'BANK_STATEMENT'
}

export const SETTLEMENT_METHOD = {
    SPONSORED_NEW_HIN: 'SPONSORED_NEW_HIN',
    SPONSORED_HIN_TRANSFER: 'SPONSORED_HIN_TRANSFER',
    DVP: 'DVP',
    ISSUER_SPONSORED: 'ISSUER_SPONSORED'
}

let options = {
    DOCUMENT_UPLOAD: [
        {
            label: 'lang_telephone_bill',
            value: DOCUMENT_UPLOAD.TELEPHONE_BILL
        },
        {
            label: 'lang_electricity_gas_bill',
            value: DOCUMENT_UPLOAD.ELECTRICITY_GAS_BILL
        },
        {
            label: 'lang_water_bill',
            value: DOCUMENT_UPLOAD.WATER_BILL
        },
        {
            label: 'lang_council_rates_notice',
            value: DOCUMENT_UPLOAD.COUNCIL_RATES_NOTICE
        },
        {
            label: 'lang_bank_statement',
            value: DOCUMENT_UPLOAD.BANK_STATEMENT
        }
    ],
    METHOD: [
        {
            label: 'lang_email',
            value: METHOD.EMAIL
        },
        // {
        //     label: 'fax',
        //     value: METHOD.FAX
        // },
        {
            label: 'lang_postal',
            value: METHOD.POSTAL
        }
    ],
    SETTLEMENT_METHOD: [
        {
            label: 'lang_sponsored_new_hin', value: 'SPONSORED_NEW_HIN'
        },
        {
            label: 'lang_sponsored_hin_transfer', value: 'SPONSORED_HIN_TRANSFER'
        },
        {
            label: 'lang_delivery_vs_payment', value: 'DVP'
        },
        {
            label: 'lang_issuer_sponsored', value: 'ISSUER_SPONSORED'
        }
    ],
    ACCOUNT_TYPE: [
        { label: 'lang_individual', value: ACCOUNT_TYPE.INDIVIDUAL },
        { label: 'lang_joint', value: ACCOUNT_TYPE.JOINT },
        { label: 'lang_company', value: ACCOUNT_TYPE.COMPANY },
        { label: 'lang_trust_individual', value: ACCOUNT_TYPE.TRUST_INDIVIDUAL },
        { label: 'lang_trust_company', value: ACCOUNT_TYPE.TRUST_COMPANY },
        { label: 'lang_super_fund_company', value: ACCOUNT_TYPE.SUPER_FUND_COMPANY },
        { label: 'lang_super_fund_individual', value: ACCOUNT_TYPE.SUPER_FUND_INDIVIDUAL }
    ],
    OCCUPATION_CATEGORY: listOccupationType.reduce((acc, cur) => {
        acc[cur] = listOccupationCategory[cur].map(e => ({ label: capitalizer(e), value: e }))
        return acc
    }, {}),
    OCCUPATION_TYPE: listOccupationType.map(e => ({ label: capitalizer(e), value: e })),
    TITLE: [
        {
            label: 'lang_mr',
            value: 'MR'
        },
        {
            label: 'lang_mrs',
            value: 'MRS'
        },
        {
            label: 'lang_ms',
            value: 'MS'
        }
    ],
    GENDER: [
        {
            label: 'lang_male',
            value: 'MALE'
        },
        {
            label: 'lang_female',
            value: 'FEMALE'
        }
    ],
    RELATIONSHIP_TYPE: {
        [ACCOUNT_TYPE.INDIVIDUAL]: [
            { label: 'lang_owner', value: RELATIONSHIP_TYPE.OWNER },
            { label: 'lang_power_of_attorney', value: RELATIONSHIP_TYPE.POWER_OF_ATTORNEY }
        ],
        [ACCOUNT_TYPE.JOINT]: [
            { label: 'lang_owner', value: RELATIONSHIP_TYPE.OWNER },
            { label: 'lang_power_of_attorney', value: RELATIONSHIP_TYPE.POWER_OF_ATTORNEY },
            { label: 'lang_other', value: RELATIONSHIP_TYPE.OTHER }
        ],
        [ACCOUNT_TYPE.COMPANY]: [
            { label: 'lang_director', value: RELATIONSHIP_TYPE.DIRECTOR },
            { label: 'lang_relevant_beneficial_owner_greater_than_25_percent', value: RELATIONSHIP_TYPE.BENEFICIAL_OWNER },
            { label: 'lang_other', value: RELATIONSHIP_TYPE.OTHER }
        ],
        [ACCOUNT_TYPE.TRUST_INDIVIDUAL]: [
            { label: 'lang_owner', value: RELATIONSHIP_TYPE.OWNER },
            { label: 'lang_trust_beneficiary_individual', value: RELATIONSHIP_TYPE.BENEFICARY },
            { label: 'lang_trust_beneficiary_class', value: RELATIONSHIP_TYPE.BENEFICARY_CLASS },
            { label: 'lang_other', value: RELATIONSHIP_TYPE.OTHER },
            { label: 'lang_trust_contributor', value: RELATIONSHIP_TYPE.TRUST_CONTRIBUTOR },
            { label: 'lang_trust_executor', value: RELATIONSHIP_TYPE.TRUST_EXECUTOR },
            { label: 'lang_trust_appointer_protector', value: RELATIONSHIP_TYPE.TRUST_APPOINTER_PROTECTOR },
            { label: 'lang_settlor', value: RELATIONSHIP_TYPE.TRUST_SETTLOR }
        ],
        [ACCOUNT_TYPE.TRUST_COMPANY]: [
            { label: 'lang_director', value: RELATIONSHIP_TYPE.DIRECTOR },
            { label: 'lang_trust_beneficiary_individual', value: RELATIONSHIP_TYPE.BENEFICARY },
            { label: 'lang_trust_beneficiary_class', value: RELATIONSHIP_TYPE.BENEFICARY_CLASS },
            { label: 'lang_other', value: RELATIONSHIP_TYPE.OTHER },
            { label: 'lang_trust_contributor', value: RELATIONSHIP_TYPE.TRUST_CONTRIBUTOR },
            { label: 'lang_trust_executor', value: RELATIONSHIP_TYPE.TRUST_EXECUTOR },
            { label: 'lang_trust_appointer_protector', value: RELATIONSHIP_TYPE.TRUST_APPOINTER_PROTECTOR },
            { label: 'lang_settlor', value: RELATIONSHIP_TYPE.TRUST_SETTLOR },
            { label: 'lang_relevant_beneficial_owner_greater_than_25_percent', value: RELATIONSHIP_TYPE.BENEFICIAL_OWNER }
        ],
        [ACCOUNT_TYPE.SUPER_FUND_INDIVIDUAL]: [
            { label: 'lang_owner', value: RELATIONSHIP_TYPE.OWNER },
            { label: 'lang_other', value: RELATIONSHIP_TYPE.OTHER }
        ],
        [ACCOUNT_TYPE.SUPER_FUND_COMPANY]: [
            { label: 'lang_director', value: RELATIONSHIP_TYPE.DIRECTOR },
            { label: 'lang_relevant_beneficial_owner_greater_than_25_percent', value: RELATIONSHIP_TYPE.BENEFICIAL_OWNER },
            { label: 'lang_other', value: RELATIONSHIP_TYPE.OTHER }
        ]
    },
    SOURCE_OF_WEALTH: [
        {
            label: 'lang_employment',
            value: 'EMPLOYMENT'
        },
        {
            label: 'lang_gift_windfall',
            value: 'GIFT_WINDFALL'
        },
        {
            label: 'lang_inheritance',
            value: 'INHERITANCE'
        },
        {
            label: 'lang_investments_australia',
            value: 'INVESTMENTS_AUSTRALIA'
        },
        {
            label: 'lang_investments_savings',
            value: 'INVESTMENTS_SAVINGS'
        },
        {
            label: 'lang_savings',
            value: 'SAVINGS'
        }
    ],
    TAX_EXEMPTION_DETAILS: [
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
    GOVERNMENT_ID_TYPE: [
        { label: 'lang_driver_license', value: GOVERNMENT_ID_TYPE.DRIVER_LICENSE },
        { label: 'lang_medicare_card', value: GOVERNMENT_ID_TYPE.MEDICARE_CARD },
        { label: 'lang_passport', value: GOVERNMENT_ID_TYPE.PASSPORT }
    ],
    STATE_OF_ISSUE: [
        { label: STATE_OF_ISSUE.ACT, value: STATE_OF_ISSUE.ACT },
        { label: STATE_OF_ISSUE.NSW, value: STATE_OF_ISSUE.NSW },
        { label: STATE_OF_ISSUE.NT, value: STATE_OF_ISSUE.NT },
        { label: STATE_OF_ISSUE.QLD, value: STATE_OF_ISSUE.QLD },
        { label: STATE_OF_ISSUE.SA, value: STATE_OF_ISSUE.SA },
        { label: STATE_OF_ISSUE.TAS, value: STATE_OF_ISSUE.TAS },
        { label: STATE_OF_ISSUE.VIC, value: STATE_OF_ISSUE.VIC },
        { label: STATE_OF_ISSUE.WA, value: STATE_OF_ISSUE.WA }
    ],
    MEDICARE_CARD_COLOUR: [
        {
            label: 'lang_green',
            value: CARD_COLOUR.GREEN
        },
        {
            label: 'lang_blue',
            value: CARD_COLOUR.BLUE
        },
        {
            label: 'lang_yellow',
            value: CARD_COLOUR.YELLOW
        }
    ],
    CMA_SOURCE_OF_FUNDS: [
        { label: 'lang_superannuation_contributions', value: 'SUPERANNUATION_CONTRIBUTIONS' },
        { label: 'lang_commission', value: 'COMMISSION' },
        { label: 'lang_inheritance', value: 'INHERITANCE' },
        { label: 'lang_savings', value: 'SAVINGS' },
        { label: 'lang_investment', value: 'INVESTMENT' },
        { label: 'lang_normal_course_of_business', value: 'NORMAL_COURSE_OF_BUSINESS' },
        { label: 'lang_asset_sale', value: 'ASSET_SALE' },
        { label: 'lang_other', value: 'OTHER' }
    ],
    CMA_ACCOUNT_PURPOSE: [
        { label: 'lang_savings', value: 'SAVINGS' },
        { label: 'lang_growth', value: 'GROWTH' },
        { label: 'lang_income', value: 'INCOME' },
        { label: 'lang_retirement', value: 'RETIREMENT' },
        { label: 'lang_business_account', value: 'BUSINESS_ACCOUNT' },
        { label: 'lang_other', value: 'OTHER' }
    ],
    EXEMPTION_DETAILS: {
        [ACCOUNT_TYPE.TRUST_INDIVIDUAL]: [
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
        [ACCOUNT_TYPE.INDIVIDUAL]: [
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
        [ACCOUNT_TYPE.JOINT]: [
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
        [ACCOUNT_TYPE.SUPER_FUND_INDIVIDUAL]: [
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
        [ACCOUNT_TYPE.TRUST_COMPANY]: [
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
        [ACCOUNT_TYPE.COMPANY]: [
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
        [ACCOUNT_TYPE.SUPER_FUND_COMPANY]: [
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
        ]
    },
    TRUST_TYPE: [
        { label: 'lang_bare', value: TRUST_TYPE.BARE },
        { label: 'lang_discretionary', value: TRUST_TYPE.DISCRETIONARY },
        { label: 'lang_fixed', value: TRUST_TYPE.FIXED },
        { label: 'lang_unit', value: TRUST_TYPE.UNIT },
        { label: 'lang_other', value: TRUST_TYPE.OTHER }
    ],
    COUNTRY: [
        {
            label: 'Aruba ',
            value: 'aw'
        },
        {
            label: 'Afghanistan ',
            value: 'af'
        },
        {
            label: 'Angola ',
            value: 'ao'
        },
        {
            label: 'Anguilla ',
            value: 'ai'
        },
        {
            label: 'Ã…land Islands ',
            value: 'ax'
        },
        {
            label: 'Albania ',
            value: 'al'
        },
        {
            label: 'Andorra ',
            value: 'ad'
        },
        {
            label: 'United Arab Emirates ',
            value: 'ae'
        },
        {
            label: 'Argentina ',
            value: 'ar'
        },
        {
            label: 'Armenia ',
            value: 'am'
        },
        {
            label: 'American Samoa ',
            value: 'as'
        },
        {
            label: 'Antigua and Barbuda ',
            value: 'ag'
        },
        {
            label: 'Australia ',
            value: 'au'
        },
        {
            label: 'Austria ',
            value: 'at'
        },
        {
            label: 'Azerbaijan ',
            value: 'az'
        },
        {
            label: 'Burundi ',
            value: 'bi'
        },
        {
            label: 'Belgium ',
            value: 'be'
        },
        {
            label: 'Benin ',
            value: 'bj'
        },
        {
            label: 'Burkina Faso ',
            value: 'bf'
        },
        {
            label: 'Bangladesh ',
            value: 'bd'
        },
        {
            label: 'Bulgaria ',
            value: 'bg'
        },
        {
            label: 'Bahrain ',
            value: 'bh'
        },
        {
            label: 'Bahamas ',
            value: 'bs'
        },
        {
            label: 'Bosnia and Herzegovina ',
            value: 'ba'
        },
        {
            label: 'Saint BarthÃ©lemy ',
            value: 'bl'
        },
        {
            label: 'Belarus ',
            value: 'by'
        },
        {
            label: 'Belize ',
            value: 'bz'
        },
        {
            label: 'Bermuda ',
            value: 'bm'
        },
        {
            label: 'Bolivia ',
            value: 'bo'
        },
        {
            label: 'Brazil ',
            value: 'br'
        },
        {
            label: 'Barbados ',
            value: 'bb'
        },
        {
            label: 'Brunei ',
            value: 'bn'
        },
        {
            label: 'Bhutan ',
            value: 'bt'
        },
        {
            label: 'Botswana ',
            value: 'bw'
        },
        {
            label: 'Central African Republic ',
            value: 'cf'
        },
        {
            label: 'Canada ',
            value: 'ca'
        },
        {
            label: 'Cocos (Keeling) Islands ',
            value: 'cc'
        },
        {
            label: 'Switzerland ',
            value: 'ch'
        },
        {
            label: 'Chile ',
            value: 'cl'
        },
        {
            label: 'China ',
            value: 'cn'
        },
        {
            label: 'Ivory Coast ',
            value: 'ci'
        },
        {
            label: 'Cameroon ',
            value: 'cm'
        },
        {
            label: 'DR Congo ',
            value: 'cd'
        },
        {
            label: 'Republic of the Congo ',
            value: 'cg'
        },
        {
            label: 'Cook Islands ',
            value: 'ck'
        },
        {
            label: 'Colombia ',
            value: 'co'
        },
        {
            label: 'Comoros ',
            value: 'km'
        },
        {
            label: 'Cape Verde ',
            value: 'cv'
        },
        {
            label: 'Costa Rica ',
            value: 'cr'
        },
        {
            label: 'Cuba ',
            value: 'cu'
        },
        {
            label: 'CuraÃ§ao ',
            value: 'cw'
        },
        {
            label: 'Christmas Island ',
            value: 'cx'
        },
        {
            label: 'Cayman Islands ',
            value: 'ky'
        },
        {
            label: 'Cyprus ',
            value: 'cy'
        },
        {
            label: 'Czechia ',
            value: 'cz'
        },
        {
            label: 'Germany ',
            value: 'de'
        },
        {
            label: 'Djibouti ',
            value: 'dj'
        },
        {
            label: 'Dominica ',
            value: 'dm'
        },
        {
            label: 'Denmark ',
            value: 'dk'
        },
        {
            label: 'Dominican Republic ',
            value: 'do'
        },
        {
            label: 'Dominican Republic ',
            value: 'do'
        },
        {
            label: 'Dominican Republic ',
            value: 'do'
        },
        {
            label: 'Algeria ',
            value: 'dz'
        },
        {
            label: 'Ecuador ',
            value: 'ec'
        },
        {
            label: 'Egypt ',
            value: 'eg'
        },
        {
            label: 'Eritrea ',
            value: 'er'
        },
        {
            label: 'Western Sahara ',
            value: 'eh'
        },
        {
            label: 'Spain ',
            value: 'es'
        },
        {
            label: 'Estonia ',
            value: 'ee'
        },
        {
            label: 'Ethiopia ',
            value: 'et'
        },
        {
            label: 'Finland ',
            value: 'fi'
        },
        {
            label: 'Fiji ',
            value: 'fj'
        },
        {
            label: 'Falkland Islands ',
            value: 'fk'
        },
        {
            label: 'France ',
            value: 'fr'
        },
        {
            label: 'Faroe Islands ',
            value: 'fo'
        },
        {
            label: 'Micronesia ',
            value: 'fm'
        },
        {
            label: 'Gabon ',
            value: 'ga'
        },
        {
            label: 'United Kingdom ',
            value: 'gb'
        },
        {
            label: 'Georgia ',
            value: 'ge'
        },
        {
            label: 'Guernsey ',
            value: 'gg'
        },
        {
            label: 'Ghana ',
            value: 'gh'
        },
        {
            label: 'Gibraltar ',
            value: 'gi'
        },
        {
            label: 'Guinea ',
            value: 'gn'
        },
        {
            label: 'Guadeloupe ',
            value: 'gp'
        },
        {
            label: 'Gambia ',
            value: 'gm'
        },
        {
            label: 'Guinea-Bissau ',
            value: 'gw'
        },
        {
            label: 'Equatorial Guinea ',
            value: 'gq'
        },
        {
            label: 'Greece ',
            value: 'gr'
        },
        {
            label: 'Grenada ',
            value: 'gd'
        },
        {
            label: 'Greenland ',
            value: 'gl'
        },
        {
            label: 'Guatemala ',
            value: 'gt'
        },
        {
            label: 'French Guiana ',
            value: 'gf'
        },
        {
            label: 'Guam ',
            value: 'gu'
        },
        {
            label: 'Guyana ',
            value: 'gy'
        },
        {
            label: 'Hong Kong ',
            value: 'hk'
        },
        {
            label: 'Honduras ',
            value: 'hn'
        },
        {
            label: 'Croatia ',
            value: 'hr'
        },
        {
            label: 'Haiti ',
            value: 'ht'
        },
        {
            label: 'Hungary ',
            value: 'hu'
        },
        {
            label: 'Indonesia ',
            value: 'id'
        },
        {
            label: 'Isle of Man ',
            value: 'im'
        },
        {
            label: 'India ',
            value: 'in'
        },
        {
            label: 'British Indian Ocean Territory ',
            value: 'io'
        },
        {
            label: 'Ireland ',
            value: 'ie'
        },
        {
            label: 'Iran ',
            value: 'ir'
        },
        {
            label: 'Iraq ',
            value: 'iq'
        },
        {
            label: 'Iceland ',
            value: 'is'
        },
        {
            label: 'Israel ',
            value: 'il'
        },
        {
            label: 'Italy ',
            value: 'it'
        },
        {
            label: 'Jamaica ',
            value: 'jm'
        },
        {
            label: 'Jersey ',
            value: 'je'
        },
        {
            label: 'Jordan ',
            value: 'jo'
        },
        {
            label: 'Japan ',
            value: 'jp'
        },
        {
            label: 'Kazakhstan ',
            value: 'kz'
        },
        {
            label: 'Kazakhstan ',
            value: 'kz'
        },
        {
            label: 'Kenya ',
            value: 'ke'
        },
        {
            label: 'Kyrgyzstan ',
            value: 'kg'
        },
        {
            label: 'Cambodia ',
            value: 'kh'
        },
        {
            label: 'Kiribati ',
            value: 'ki'
        },
        {
            label: 'Saint Kitts and Nevis ',
            value: 'kn'
        },
        {
            label: 'South Korea ',
            value: 'kr'
        },
        {
            label: 'Kosovo ',
            value: 'xk'
        },
        {
            label: 'Kuwait ',
            value: 'kw'
        },
        {
            label: 'Laos ',
            value: 'la'
        },
        {
            label: 'Lebanon ',
            value: 'lb'
        },
        {
            label: 'Liberia ',
            value: 'lr'
        },
        {
            label: 'Libya ',
            value: 'ly'
        },
        {
            label: 'Saint Lucia ',
            value: 'lc'
        },
        {
            label: 'Liechtenstein ',
            value: 'li'
        },
        {
            label: 'Sri Lanka ',
            value: 'lk'
        },
        {
            label: 'Lesotho ',
            value: 'ls'
        },
        {
            label: 'Lithuania ',
            value: 'lt'
        },
        {
            label: 'Luxembourg ',
            value: 'lu'
        },
        {
            label: 'Latvia ',
            value: 'lv'
        },
        {
            label: 'Macau ',
            value: 'mo'
        },
        {
            label: 'Saint Martin ',
            value: 'mf'
        },
        {
            label: 'Morocco ',
            value: 'ma'
        },
        {
            label: 'Monaco ',
            value: 'mc'
        },
        {
            label: 'Moldova ',
            value: 'md'
        },
        {
            label: 'Madagascar ',
            value: 'mg'
        },
        {
            label: 'Maldives ',
            value: 'mv'
        },
        {
            label: 'Mexico ',
            value: 'mx'
        },
        {
            label: 'Marshall Islands ',
            value: 'mh'
        },
        {
            label: 'Macedonia ',
            value: 'mk'
        },
        {
            label: 'Mali ',
            value: 'ml'
        },
        {
            label: 'Malta ',
            value: 'mt'
        },
        {
            label: 'Myanmar ',
            value: 'mm'
        },
        {
            label: 'Montenegro ',
            value: 'me'
        },
        {
            label: 'Mongolia ',
            value: 'mn'
        },
        {
            label: 'Northern Mariana Islands ',
            value: 'mp'
        },
        {
            label: 'Mozambique ',
            value: 'mz'
        },
        {
            label: 'Mauritania ',
            value: 'mr'
        },
        {
            label: 'Montserrat ',
            value: 'ms'
        },
        {
            label: 'Martinique ',
            value: 'mq'
        },
        {
            label: 'Mauritius ',
            value: 'mu'
        },
        {
            label: 'Malawi ',
            value: 'mw'
        },
        {
            label: 'Malaysia ',
            value: 'my'
        },
        {
            label: 'Mayotte ',
            value: 'yt'
        },
        {
            label: 'Namibia ',
            value: 'na'
        },
        {
            label: 'New Caledonia ',
            value: 'nc'
        },
        {
            label: 'Niger ',
            value: 'ne'
        },
        {
            label: 'Norfolk Island ',
            value: 'nf'
        },
        {
            label: 'Nigeria ',
            value: 'ng'
        },
        {
            label: 'Nicaragua ',
            value: 'ni'
        },
        {
            label: 'Niue ',
            value: 'nu'
        },
        {
            label: 'Netherlands ',
            value: 'nl'
        },
        {
            label: 'Norway ',
            value: 'no'
        },
        {
            label: 'Nepal ',
            value: 'np'
        },
        {
            label: 'Nauru ',
            value: 'nr'
        },
        {
            label: 'New Zealand ',
            value: 'nz'
        },
        {
            label: 'Oman ',
            value: 'om'
        },
        {
            label: 'Pakistan ',
            value: 'pk'
        },
        {
            label: 'Panama ',
            value: 'pa'
        },
        {
            label: 'Pitcairn Islands ',
            value: 'pn'
        },
        {
            label: 'Peru ',
            value: 'pe'
        },
        {
            label: 'Philippines ',
            value: 'ph'
        },
        {
            label: 'Palau ',
            value: 'pw'
        },
        {
            label: 'Papua New Guinea ',
            value: 'pg'
        },
        {
            label: 'Poland ',
            value: 'pl'
        },
        {
            label: 'Puerto Rico ',
            value: 'pr'
        },
        {
            label: 'Puerto Rico ',
            value: 'pr'
        },
        {
            label: 'North Korea ',
            value: 'kp'
        },
        {
            label: 'Portugal ',
            value: 'pt'
        },
        {
            label: 'Paraguay ',
            value: 'py'
        },
        {
            label: 'Palestine ',
            value: 'ps'
        },
        {
            label: 'French Polynesia ',
            value: 'pf'
        },
        {
            label: 'Qatar ',
            value: 'qa'
        },
        {
            label: 'RÃ©union ',
            value: 're'
        },
        {
            label: 'Romania ',
            value: 'ro'
        },
        {
            label: 'Russia ',
            value: 'ru'
        },
        {
            label: 'Rwanda ',
            value: 'rw'
        },
        {
            label: 'Saudi Arabia ',
            value: 'sa'
        },
        {
            label: 'Sudan ',
            value: 'sd'
        },
        {
            label: 'Senegal ',
            value: 'sn'
        },
        {
            label: 'Singapore ',
            value: 'sg'
        },
        {
            label: 'South Georgia ',
            value: 'gs'
        },
        {
            label: 'Svalbard and Jan Mayen ',
            value: 'sj'
        },
        {
            label: 'Solomon Islands ',
            value: 'sb'
        },
        {
            label: 'Sierra Leone ',
            value: 'sl'
        },
        {
            label: 'El Salvador ',
            value: 'sv'
        },
        {
            label: 'San Marino ',
            value: 'sm'
        },
        {
            label: 'Somalia ',
            value: 'so'
        },
        {
            label: 'Saint Pierre and Miquelon ',
            value: 'pm'
        },
        {
            label: 'Serbia ',
            value: 'rs'
        },
        {
            label: 'South Sudan ',
            value: 'ss'
        },
        {
            label: 'SÃ£o TomÃ© and PrÃ­ncipe ',
            value: 'st'
        },
        {
            label: 'SuricountryName ',
            value: 'sr'
        },
        {
            label: 'Slovakia ',
            value: 'sk'
        },
        {
            label: 'Slovenia ',
            value: 'si'
        },
        {
            label: 'Sweden ',
            value: 'se'
        },
        {
            label: 'Swaziland ',
            value: 'sz'
        },
        {
            label: 'Sint Maarten ',
            value: 'sx'
        },
        {
            label: 'Seychelles ',
            value: 'sc'
        },
        {
            label: 'Syria ',
            value: 'sy'
        },
        {
            label: 'Turks and Caicos Islands ',
            value: 'tc'
        },
        {
            label: 'Chad ',
            value: 'td'
        },
        {
            label: 'Togo ',
            value: 'tg'
        },
        {
            label: 'Thailand ',
            value: 'th'
        },
        {
            label: 'Tajikistan ',
            value: 'tj'
        },
        {
            label: 'Tokelau ',
            value: 'tk'
        },
        {
            label: 'Turkmenistan ',
            value: 'tm'
        },
        {
            label: 'Timor-Leste ',
            value: 'tl'
        },
        {
            label: 'Tonga ',
            value: 'to'
        },
        {
            label: 'Trinidad and Tobago ',
            value: 'tt'
        },
        {
            label: 'Tunisia ',
            value: 'tn'
        },
        {
            label: 'Turkey ',
            value: 'tr'
        },
        {
            label: 'Tuvalu ',
            value: 'tv'
        },
        {
            label: 'Taiwan ',
            value: 'tw'
        },
        {
            label: 'Tanzania ',
            value: 'tz'
        },
        {
            label: 'Uganda ',
            value: 'ug'
        },
        {
            label: 'Ukraine ',
            value: 'ua'
        },
        {
            label: 'Uruguay ',
            value: 'uy'
        },
        {
            label: 'United States ',
            value: 'us'
        },
        {
            label: 'Uzbekistan ',
            value: 'uz'
        },
        {
            label: 'Vatican City ',
            value: 'va'
        },
        {
            label: 'Saint Vincent and the Grenadines ',
            value: 'vc'
        },
        {
            label: 'Venezuela ',
            value: 've'
        },
        {
            label: 'British Virgin Islands ',
            value: 'vg'
        },
        {
            label: 'United States Virgin Islands ',
            value: 'vi'
        },
        {
            label: 'Vietnam ',
            value: 'vn'
        },
        {
            label: 'Vanuatu ',
            value: 'vu'
        },
        {
            label: 'Wallis and Futuna ',
            value: 'wf'
        },
        {
            label: 'Samoa ',
            value: 'ws'
        },
        {
            label: 'Yemen ',
            value: 'ye'
        },
        {
            label: 'South Africa ',
            value: 'za'
        },
        {
            label: 'Zambia ',
            value: 'zm'
        },
        {
            label: 'Zimbabwe ',
            value: 'zw'
        }
    ],
    BANK_ACCOUNT_TYPE: [
        { label: 'lang_empty', value: BANK_ACCOUNT_TYPE.EMPTY },
        { label: 'lang_bank_account', value: BANK_ACCOUNT_TYPE.BANK_ACCOUNT, className: 'text-normal' },
        { label: 'lang_linked_cmt_cma', value: BANK_ACCOUNT_TYPE.LINKED_CMT_CMA, className: 'text-normal' }
    ],
    CMT_PROVIDER: [
        { label: 'lang_adelaide_bank_limited', value: CMT_PROVIDER.ADL },
        { label: 'lang_anz_v2plus', value: CMT_PROVIDER.ANZ, className: 'text-normal' },
        { label: 'lang_ddh_graham', value: CMT_PROVIDER.DDH, className: 'text-normal' },
        { label: 'lang_ddh_westpac', value: CMT_PROVIDER.DDHW, className: 'text-normal' },
        { label: 'lang_macquarie_bank_limited', value: CMT_PROVIDER.MBLA }
    ],
    TRANSACTION_TYPE: [
        { label: 'lang_creadit_and_debit', value: TRANSACTION_TYPE.BOTH },
        { label: 'lang_credit', value: TRANSACTION_TYPE.CREDIT },
        { label: 'lang_debit', value: TRANSACTION_TYPE.DEBIT }
    ],
    COMPANY_TYPE: [
        { label: 'lang_private', value: 'PRIVATE' },
        { label: 'lang_unlisted_public', value: 'UNLISTED_PUBLIC' },
        { label: 'lang_listed_public', value: 'LISTED_PUBLIC' },
        { label: 'lang_financial_institution', value: 'FINANCIAL_INSTITUTION' }
    ],
    CMA: [
        { label: 'lang_create_new_account', value: CMA.CREATE_NEW },
        { label: 'lang_use_existing_account', value: CMA.USE_EXISTING }
    ],
    TYPE_OF_DOCUMENT: [
        { label: 'lang_uploaded_document', value: DOCUMENT_TYPE.DOCUMENT },
        { label: 'lang_government_ids', value: DOCUMENT_TYPE.GOVERNMENT_ID, className: 'text-normal' }
    ],
    ACCOUNT_STATUS: [{ label: 'lang_ekyc_pending', value: ACCOUNT_STATUS.EKYC_PENDING },
    { label: 'lang_ekyc_in_progress', value: ACCOUNT_STATUS.EKYC_IN_PROGRESS },
    { label: 'lang_ekyc_more_info', value: ACCOUNT_STATUS.EKYC_MORE_INFO },
    { label: 'lang_ekyc_interactive_locked_out', value: ACCOUNT_STATUS.EKYC_INTERACTIVE_LOCKED_OUT },
    { label: 'lang_ekyc_failed_aml', value: ACCOUNT_STATUS.EKYC_FAILED_AML },
    { label: 'lang_ekyc_locked_out', value: ACCOUNT_STATUS.EKYC_LOCKED_OUT },
    { label: 'lang_bank_pending', value: ACCOUNT_STATUS.BANK_PENDING },
    { label: 'lang_bank_submitted', value: ACCOUNT_STATUS.BANK_SUBMITTED },
    { label: 'lang_morrison_pending', value: ACCOUNT_STATUS.MORRISON_PENDING },
    { label: 'lang_morrison_cancelled', value: ACCOUNT_STATUS.MORRISON_CANCELLED },
    { label: 'lang_morrison_in_referred', value: ACCOUNT_STATUS.MORRISON_IN_REFERRED },
    { label: 'lang_active', value: ACCOUNT_STATUS.ACTIVE },
    { label: 'lang_close', value: ACCOUNT_STATUS.CLOSED },
    { label: 'lang_inactive', value: ACCOUNT_STATUS.INACTIVE }],
    PID: PID
}

const PLEASE_SELECT_ITEM = { label: 'Please Select', value: null }

export const OPTIONS = Object.keys(options).reduce((acc, cur) => {
    const value = options[cur]
    if (Array.isArray(value)) {
        if (cur !== 'ACCOUNT_TYPE') value.unshift(PLEASE_SELECT_ITEM)
    } else {
        Object.keys(value).forEach(key => {
            value[key].unshift(PLEASE_SELECT_ITEM)
        })
    }
    acc[cur] = value
    return acc
}, {})
