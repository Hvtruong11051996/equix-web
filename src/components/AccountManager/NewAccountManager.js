import FilterBox from '../Inc/FilterBox';
import React from 'react';
import Lang from '../Inc/Lang';
import dataStorage from '../../dataStorage';
import { emitter, eventEmitter } from '../../constants/emitter_enum';
import callList from '../../constants/calling_code'
import { func } from '../../storage';
import { registerAllOrders, unregisterAllOrders, unregisterUser, registerUser } from '../../streaming';
import { getData, createNewBranch, postData, getReportCsvFileUrl, putData, getOpeningAccountUrl, deleteData } from '../../helper/request';
import uuidv4 from 'uuid/v4';
import { hideElement, getCsvFile, renderClass, clone, capitalizeFirstLetter, capitalizer, checkRole } from '../../helper/functionUtils'
import Grid from '../Inc/CanvasGrid';
import logger from '../../helper/log';
import { getApiFilter } from '../api';
import ButtonGroup from '../Inc/ButtonGroup/NewButtonGroup';
import ButtonCreateGroup from '../Inc/ButtonGroup/ButtonCreateGroup';
import Tag from '../Inc/Tag';
import ToggleLine from '../Inc/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';
import s from './AccountManager.module.css'
import { FIELD, ACCOUNT_TYPE, OPTIONS, ACCOUNT_STATUS } from '../OpeningAccount/constant'
import userTypeEnum from '../../constants/user_type_enum';
import MapRoleComponent from '../../constants/map_role_component'

const LIST_ACCOUNT_TYPE_COMPANY = [ACCOUNT_TYPE.COMPANY, ACCOUNT_TYPE.TRUST_COMPANY, ACCOUNT_TYPE.SUPER_FUND_COMPANY]
const DEFAULT_VALUE = '--'
const FAKE_DATA = {
    'date_created': '1608530501618',
    'actor': '837292',
    'last_update': '1608530501618',
    'account_id': 'S89309123',
    'hin': '949038492',
    'equix_id': 'EQ-342332',
    'account_status': 'BANK_SUBMITTED',
    'client_type': 'PRIVATE',
    'account_type': 'INDIVIDUAL',
    'based_currency': 'AUD',
    'branch': 'DEFAULT VETTING RULES',
    'organization_code': 'TETEST',
    'organization_name': 'MORRISON SECURITIES TEST',
    'branch_code': 'TE',
    'branch_name': 'MORRISON SECURITIES TEST',
    'advisor_code': 'BD',
    'advisor_name': 'BLACK DOG INSTITUTE',
    'gst_payable': true,
    'new_cma': true,
    'cma_source_of_funds': 'SUPERANNUATION_CONTRIBUTIONS',
    'cma_account_purpose': 'SAVINGS',
    'tradeable_products': {
        'equity': 'S0058',
        'mutual_funds': null
    },
    'trade_confirmations': [
        {
            'method': 'EMAIL',
            'attention': 'man.nguyen@quant-edge.com',
            'email': 'man.nguyen@quant-edge.com',
            'auto_print': false
        }
    ],
    'settlement_method': 'SPONSORED_NEW_HIN',
    'bank_account_type': 'BANK_ACCOUNT',
    'bank_bsb': 435232,
    'bank_account_number': 9834982374,
    'bank_account_name': 'Man Nguyen',
    'bank_transaction_type': 'BOTH',
    'applicant_count': 1,
    'applicant_details': [
        {
            'applicant_id': 'fadsi2334',
            'tos_consent': true,
            'ekyc_aml_consent': true,
            'gbg_verification_id': 'BsdiuqwQ',
            'ekyc_overall_status': 'EKYC_VERIFIED',
            'ekyc_aml_status': true,
            'title': 'MR',
            'first_name': 'Man',
            'middle_name': 'TWOPASS',
            'last_name': 'Nguyen',
            'relationship_type': 'OWNER',
            'dob': '01/07/1997',
            'gender': 'MALE',
            'australian_tax_resident': true,
            'tfn': 84592090238,
            'tax_exemption': false,
            'government_id': [
                {
                    'ekyc_govid_status': 'EKYC_VERIFIED',
                    'type': 'DRIVER_LICENSE',
                    'state_of_issue': 'VIC',
                    'number': '11111111'
                }
            ],
            'source_of_wealth': 'EMPLOYMENT',
            'nationality': 'AUSTRALIA',
            'occupation_type': 'Business Owner',
            'occupation_category': 'Construction',
            'same_as_ra': true,
            'residential_address_full_address': '105 HARP RD, KEW EAST VIC 3102',
            'residential_address_street_number': '105',
            'residential_address_street_name': 'HARP',
            'residential_address_street_type': 'ROAD',
            'residential_address_city_suburb': 'KEW EAST',
            'residential_address_state': 'VIC',
            'residential_address_postcode': '3102',
            'residential_address_country': 'AUSTRALIA',
            'postal_address_full_address': '105 HARP RD, KEW EAST VIC 3102',
            'postal_address_street_number': '105',
            'postal_address_street_name': 'HARP',
            'postal_address_street_type': 'ROAD',
            'postal_address_city_suburb': 'KEW EAST',
            'postal_address_state': 'VIC',
            'postal_address_postcode': '3102',
            'postal_address_country': 'AUSTRALIA',
            'applicant_mobile_phone': 'AU|984729304',
            'applicant_email': 'man.nguyen@quant-edge.com'
        }
    ]
}

const ACCOUNT_TYPE_STRING = {
    INDIVIDUAL: 'INDIVIDUAL',
    JOINT: 'JOINT',
    COMPANY: 'COMPANY',
    TRUST_INDIVIDUAL: 'TRUST INDIVIDUAL',
    TRUST_COMPANY: 'TRUST COMPANY',
    SUPER_FUND_INDIVIDUAL: 'SUPER FUND INDIVIDUAL',
    SUPER_FUND_COMPANY: 'SUPER FUND COMPANY'
}
export default class AccountManager extends React.Component {
    constructor(props) {
        super(props);
        const initState = this.props.loadState();
        this.filter = initState.valueFilter || '';
        this.valueFilter = this.filter
        this.accountRefresh = func.getStore(emitter.STREAMING_ACCOUNT_DATA);
        this.dicData = {}
        this.objBranch = {}
        this.dicBranch = []
        this.isConnected = dataStorage.connected
        this.id = uuidv4();
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.timeoutID = {}
        this.dicBranchChange = {};
        this.dicOldBranch = {}
        this.collapse = initState.collapse ? 1 : 0
        this.filterAndSearch = { 'query': { 'bool': { 'must': [] } } }
        this.dicPhoneNumber = callList.reduce((acc, cur) => {
            acc[cur.value] = cur.phoneCode
            return acc
        }, {})
        this.state = {
            isEditMode: false
        }
    }

    changePageAction = num => {
        this.pageId = num;
        this.getFilterOnSearch(null, true);
    }

    getDataAccountManagement = () => {
        try {
            if (!this.pageId) this.pageId = 1;
            if (!this.pageSize) this.pageSize = 50;
            if (!this.filter) this.filter = '';
            let cb = postData
            let url = getApiFilter('account_opening', this.pageId);
            this.props.loading(true);
            cb(url, this.filterAndSearch).then(response => {
                this.props.loading(false)
                if (response.data && response.data.data) {
                    let data = response.data;
                    let listData = response.data.data || [];
                    for (let i = 0; i < listData.length; i++) {
                        this.dicData[listData[i][FIELD.EQUIX_ID]] = listData[i]
                        listData[i][FIELD.DATE_CREATED] = +listData[i][FIELD.DATE_CREATED]
                        listData[i][FIELD.LAST_UPDATE] = +listData[i][FIELD.LAST_UPDATE]
                    }
                    this.listData = listData
                    this.setData(listData);
                    const havePageData = data.current_page && data.total_count && data.total_pages;
                    this.pageObj = {
                        total_count: havePageData ? data.total_count : 0,
                        total_pages: havePageData ? data.total_pages : 1,
                        current_page: havePageData ? data.current_page : 1,
                        temp_end_page: 0,
                        page_size: this.pageSize
                    }
                    this.setPage && this.setPage(this.pageObj);
                } else {
                    this.pageObj = {
                        total_count: 0,
                        total_pages: 1,
                        current_page: 1,
                        temp_end_page: 0,
                        page_size: this.pageSize
                    };
                    this.setPage && this.setPage(this.pageObj);
                    this.setData([])
                }
            })
                .catch(error => {
                    this.props.loading(false);
                    this.setData([]);
                    logger.log('error at get all symbol realted news', error);
                })
        } catch (error) {
            logger.log('error getDataAccountManagement', error)
        }
    }

    changeConnection = (isConnected) => {
        if (isConnected !== this.isConnected) {
            this.isConnected = isConnected
            if (isConnected) this.getFilterOnSearch(null, true);
        }
    }

    onRowClicked = data => {
        if (data) {
            this.props.send({
                account: data
            })
        }
    }

    getAllBranch = () => {
        const url = createNewBranch();
        this.props.loading(true)
        getData(url)
            .then(response => {
                this.props.loading(false)
                if (response.data && response.data.data && response.data.data.branch) {
                    let listBranch = response.data.data.branch;
                    const list = [];
                    if (listBranch && listBranch.length) {
                        this.objBranch = {};
                        listBranch.map(item => {
                            list.push({ labelFixed: item.branch_name, value: item.branch_id })
                            this.objBranch[item.branch_id] = item.branch_name;
                        });
                        this.dicBranch = list;
                    }
                    this.setColumn(this.colDefsAccountManagement());
                }
            }).catch(error => {
                this.props.loading(false)
                logger.log('error getAllBranch', error)
            })
    }

    hideFieldsInQuickFilter = (hideFields) => {
        try {
            const filterGridItems = document.querySelectorAll('.accountManagerContainer .ag-filter-toolpanel-instance .ag-header-cell-text')
            Array.from(filterGridItems).map(item => {
                const needHiding = hideFields.includes(item.innerText)
                if (needHiding && item.parentNode && item.parentNode.parentNode) {
                    item.parentNode.parentNode.style.display = 'none'
                }
            })
        } catch (error) {
            logger.log('Error while hidding fields in quick filter: ', error)
        }
    }

    realtimeDataAccount = (data) => {
        this.addOrUpdate(data)
    }

    getDisplayPhoneNumber(phoneStr = '') {
        const phoneList = phoneStr.split('|')
        const phoneCode = phoneList[0].toLowerCase()
        const phoneNumber = phoneList[1]
        return phoneCode ? `+${this.dicPhoneNumber[phoneCode] || ''} ${phoneNumber}` : DEFAULT_VALUE
    }

    defineColumn = (headerName, field, options = {}) => {
        let translate = false;
        let column = {};
        const optionStatus = clone(OPTIONS.ACCOUNT_STATUS)
        optionStatus.shift()
        switch (field) {
            case FIELD.VETTING_RULES_GROUP:
                column = {
                    header: headerName,
                    name: field,
                    type: TYPE.DROPDOWN,
                    bgOnlyEdit: true,
                    options: this.dicBranch,
                    formater: (params) => {
                        return (params.data[field] && this.objBranch[params.data[field]]) || params.data[field] || DEFAULT_VALUE
                    }
                }
                break
            case FIELD.EQUITY_BROKERAGE_SCHEDULE:
                column = {
                    header: headerName,
                    name: field,
                    type: TYPE.LABEL,
                    formater: (params) => {
                        const tradeableProducts = params.data[FIELD.TRADEABLE_PRODUCTS] && typeof params.data[FIELD.TRADEABLE_PRODUCTS] === 'string' ? JSON.parse(params.data[FIELD.TRADEABLE_PRODUCTS]) : (params.data[FIELD.TRADEABLE_PRODUCTS] || {})
                        return tradeableProducts[FIELD.EQUITY] || DEFAULT_VALUE
                    }
                }
                break
            case FIELD.EMAIL_ADDRESS:
                column = {
                    header: headerName,
                    name: field,
                    type: TYPE.LABEL,
                    formater: (params) => {
                        if (LIST_ACCOUNT_TYPE_COMPANY.includes(params.data[FIELD.ACCOUNT_TYPE])) {
                            return params.data[FIELD.COMPANY_EMAIL] || DEFAULT_VALUE
                        } else {
                            const applicants = params.data[FIELD.APPLICANT_DETAILS] && typeof params.data[FIELD.APPLICANT_DETAILS] === 'string' ? JSON.parse(params.data[FIELD.APPLICANT_DETAILS]) : (params.data[FIELD.APPLICANT_DETAILS] || [{}])
                            return applicants[0][FIELD.APPLICANT_EMAIL] || DEFAULT_VALUE
                        }
                    }
                }
                break
            case FIELD.MOBILE_NUMBER:
                column = {
                    header: headerName,
                    name: field,
                    type: TYPE.LABEL,
                    formater: (params) => {
                        if (LIST_ACCOUNT_TYPE_COMPANY.includes(params.data[FIELD.ACCOUNT_TYPE])) {
                            return this.getDisplayPhoneNumber(params.data[FIELD.COMPANY_MOBILE_PHONE])
                        } else {
                            const applicants = params.data[FIELD.APPLICANT_DETAILS] && typeof params.data[FIELD.APPLICANT_DETAILS] === 'string' ? JSON.parse(params.data[FIELD.APPLICANT_DETAILS]) : (params.data[FIELD.APPLICANT_DETAILS] || [{}])
                            return this.getDisplayPhoneNumber(applicants[0][FIELD.APPLICANT_MOBILE_PHONE])
                        }
                    }
                }
                break
            case FIELD.COUNTRY:
                column = {
                    header: headerName,
                    name: field,
                    type: TYPE.LABEL,
                    formater: (params) => {
                        if (LIST_ACCOUNT_TYPE_COMPANY.includes(params.data[FIELD.ACCOUNT_TYPE])) {
                            return params.data[FIELD.COUNTRY_OF_INCORPORATION] || DEFAULT_VALUE
                        } else {
                            const applicants = params.data[FIELD.APPLICANT_DETAILS] && typeof params.data[FIELD.APPLICANT_DETAILS] === 'string' ? JSON.parse(params.data[FIELD.APPLICANT_DETAILS]) : (params.data[FIELD.APPLICANT_DETAILS] || [{}])
                            return applicants[0][FIELD.NATIONALITY] || DEFAULT_VALUE
                        }
                    }
                }
                break
            case FIELD.ACCOUNT_ADDRESS:
                column = {
                    header: headerName,
                    name: field,
                    type: TYPE.LABEL,
                    formater: (params) => {
                        if (LIST_ACCOUNT_TYPE_COMPANY.includes(params.data[FIELD.ACCOUNT_TYPE])) {
                            return params.data[FIELD.COMPANY_ADDRESS] || DEFAULT_VALUE
                        } else {
                            const applicants = params.data[FIELD.APPLICANT_DETAILS] && typeof params.data[FIELD.APPLICANT_DETAILS] === 'string' ? JSON.parse(params.data[FIELD.APPLICANT_DETAILS]) : (params.data[FIELD.APPLICANT_DETAILS] || [{}])
                            return applicants[0][FIELD.RESIDENTIAL_ADDRESS_FULL_ADDRESS] || DEFAULT_VALUE
                        }
                    }
                }
                break
            case FIELD.LAST_UPDATE:
            case FIELD.DATE_CREATED:
                column = {
                    header: headerName,
                    name: field,
                    type: TYPE.DATE,
                    dateFormat: 'DD MMM YYYY'
                }
                break
            case FIELD.ACCOUNT_STATUS:
                column = {
                    header: headerName,
                    name: field,
                    type: TYPE.ACCOUNT_STATUS,
                    formater: (params) => {
                        return params.data[field] ? (params.data[field] + '').toUpperCase() : DEFAULT_VALUE
                    },
                    options: optionStatus
                }
                break
            case FIELD.ADVISOR_NAME:
            case FIELD.BANK_TRANSACTION_TYPE:
                column = {
                    header: headerName,
                    name: field,
                    type: TYPE.LABEL,
                    formater: (params) => {
                        return params.data[field] ? capitalizer(params.data[field]) : DEFAULT_VALUE
                    }
                }
                break
            case FIELD.ACCOUNT_TYPE:
                column = {
                    header: headerName,
                    name: field,
                    type: TYPE.LABEL,
                    formater: (params) => {
                        return params.data[field] ? capitalizer(ACCOUNT_TYPE_STRING[params.data[field]]) : DEFAULT_VALUE
                    }
                }
                break
            case FIELD.ORGANISATION_NAME:
                column = {
                    header: headerName,
                    name: field,
                    type: TYPE.LABEL,
                    formater: (params) => {
                        return params.data[field] ? (params.data[field] + '').toUpperCase() : DEFAULT_VALUE
                    }
                }
                break
            case FIELD.ACTION:
                column = {
                    header: headerName,
                    name: field,
                    options: (params) => {
                        switch (params.data[FIELD.ACCOUNT_STATUS]) {
                            case ACCOUNT_STATUS.BANK_SUBMITTED:
                                return [
                                    { label: 'lang_bank_pending', value: ACCOUNT_STATUS.BANK_PENDING, cb: (params, value) => this.updateAccountStatus(params, value), className: 'text-uppercase' },
                                    { label: 'lang_morrison_pending', value: ACCOUNT_STATUS.MORRISON_PENDING, cb: (params, value) => this.updateAccountStatus(params, value), className: 'text-uppercase' }
                                ]
                            case ACCOUNT_STATUS.ACTIVE:
                                return [
                                    { label: 'lang_closed', value: ACCOUNT_STATUS.CLOSED, cb: (params, value) => this.updateAccountStatus(params, value), className: 'text-uppercase' },
                                    { label: 'lang_inactive', value: ACCOUNT_STATUS.INACTIVE, cb: (params, value) => this.updateAccountStatus(params, value), className: 'text-uppercase' }
                                ]
                            case ACCOUNT_STATUS.INACTIVE:
                                return [
                                    { label: 'lang_closed', value: ACCOUNT_STATUS.CLOSED, cb: (params, value) => this.updateAccountStatus(params, value), className: 'text-uppercase' },
                                    { label: 'lang_active', value: ACCOUNT_STATUS.ACTIVE, cb: (params, value) => this.updateAccountStatus(params, value), className: 'text-uppercase' }
                                ]
                            case ACCOUNT_STATUS.CLOSED:
                                return [
                                    { label: 'lang_active', value: ACCOUNT_STATUS.ACTIVE, cb: (params, value) => this.updateAccountStatus(params, value), className: 'text-uppercase' },
                                    { label: 'lang_inactive', value: ACCOUNT_STATUS.INACTIVE, cb: (params, value) => this.updateAccountStatus(params, value), className: 'text-uppercase' }
                                ]
                            case ACCOUNT_STATUS.EKYC_IN_PROGRESS:
                            case ACCOUNT_STATUS.EKYC_PENDING:
                            case ACCOUNT_STATUS.EKYC_MORE_INFO:
                            case ACCOUNT_STATUS.EKYC_LOCKED_OUT:
                                const userInfo = dataStorage.userInfo || {}
                                if (userInfo.user_type === userTypeEnum.OPERATOR) {
                                    return [
                                        { label: 'lang_delete', value: 'delete', cb: (params, value) => this.deleteAccount(params, value), className: 'text-uppercase' }
                                    ]
                                } else {
                                    return []
                                }
                            default: return []
                        }
                    },
                    type: TYPE.ACTION_NO_TEXT,
                    suppressSort: true,
                    suppressFilter: true
                }
                break
            case FIELD.EQUIX_ID:
            case FIELD.ADVISOR_CODE:
            case FIELD.ORGANIZATION_CODE:
            case FIELD.BRANCH_CODE:
                column = {
                    header: headerName,
                    name: field,
                    type: TYPE.LABEL,
                    hide: true
                }
                break
            default:
                column = {
                    header: headerName,
                    name: field,
                    type: TYPE.LABEL
                }
                break
        }
        return column
    }

    deleteAccount = (params, value) => {
        if (!params || !params.equix_id) return
        if (this.dicData[params.equix_id]) this.remove(this.dicData[params.equix_id])
        const url = getOpeningAccountUrl(`?equix_id=${params.equix_id}`)
        deleteData(url).then(res => {
            console.log('delete account  success')
        }).catch(error => {
            console.error('delete account fail: ', error)
        })
    }
    updateAccountStatus = (params, value) => {
        if (!params || !params.equix_id) return
        const url = getOpeningAccountUrl(`?equix_id=${params.equix_id}`)
        putData(url, { account_status: value }).then(res => {
            console.log('update account status success')
        }).catch(error => {
            console.error('onSubmit addGovernmentId fail: ', error)
        })
    }

    colDefsAccountManagement = () => {
        return ([
            this.defineColumn('lang_account_status', FIELD.ACCOUNT_STATUS),
            this.defineColumn('lang_action', FIELD.ACTION),
            this.defineColumn('lang_applicant_id', FIELD.EQUIX_ID),
            this.defineColumn('lang_account_id', FIELD.ACCOUNT_ID),
            this.defineColumn('lang_account_type', FIELD.ACCOUNT_TYPE),
            this.defineColumn('lang_account_holder_name', FIELD.ACCOUNT_HOLDER_NAME),
            this.defineColumn('lang_vetting_rules_group', FIELD.VETTING_RULES_GROUP),
            this.defineColumn('lang_hin', FIELD.HIN),
            this.defineColumn('lang_advisor_code', FIELD.ADVISOR_CODE),
            this.defineColumn('lang_advisor_name', FIELD.ADVISOR_NAME),
            this.defineColumn('lang_organisation_code', FIELD.ORGANIZATION_CODE),
            this.defineColumn('lang_organisation_name', FIELD.ORGANISATION_NAME),
            this.defineColumn('lang_branch_code', FIELD.BRANCH_CODE),
            this.defineColumn('lang_branch_name', FIELD.BRANCH_NAME),
            this.defineColumn('lang_email_address', FIELD.EMAIL_ADDRESS),
            this.defineColumn('lang_mobile_number', FIELD.MOBILE_NUMBER),
            this.defineColumn('lang_country', FIELD.COUNTRY),
            this.defineColumn('lang_account_address', FIELD.ACCOUNT_ADDRESS),
            this.defineColumn('lang_cma_provider', FIELD.CMA_PROVIDER),
            this.defineColumn('lang_bsb', FIELD.BSB),
            this.defineColumn('lang_bank_account_name', FIELD.BANK_ACCOUNT_NAME),
            this.defineColumn('lang_bank_account_number', FIELD.BANK_ACCOUNT_NUMBER),
            this.defineColumn('lang_bank_transaction_type', FIELD.BANK_TRANSACTION_TYPE),
            this.defineColumn('lang_equity_brokerage_schedule', FIELD.EQUITY_BROKERAGE_SCHEDULE),
            this.defineColumn('lang_last_updated', FIELD.LAST_UPDATE),
            this.defineColumn('lang_date_created', FIELD.DATE_CREATED),
            this.defineColumn('lang_actor', FIELD.ACTOR)
        ])
    }

    getFilterOnSearch = (body = null, notResetPage = true) => {
        if (!this.dicBranch.length) this.getAllBranch()
        if (!notResetPage) this.pageId = 1
        if (body) {
            this.filterAndSearch = body
        }
        this.getDataAccountManagement()
    }

    setGridFnKey = data => {
        if (!data) {
            logger.log(data);
        }
        return `${data[FIELD.EQUIX_ID]}`;
    }

    setGridPaginate = () => {
        return {
            setPage: cb => {
                this.setPage = cb
            },
            pageChanged: this.changePageAction
        }
    }

    getCsvFunction = (obj) => {
        if (this.csvWoking) return;
        this.csvWoking = true
        getCsvFile({
            url: getReportCsvFileUrl('account_opening'),
            body_req: this.filterAndSearch,
            columnHeader: obj.columns,
            lang: dataStorage.lang,
            glContainer: this.props.glContainer
        }, () => {
            this.csvWoking = false;
        });
    }

    showError = (err, isErr = false) => {
        this.errorRef && this.errorRef.showError && this.errorRef.showError(err, isErr)
    }

    handleSave() {
        let dataChange = this.getData(true, true);
        let putArr = []
        Object.keys(dataChange).forEach(item => {
            let dataPut = { ...dataChange[item] }
            const url = getOpeningAccountUrl(`?equix_id=${item}`)
            putArr.push(putData(url, dataPut))
        })
        if (putArr.length) {
            this.showError('lang_updating_account_information')
            this.setState({ isEditMode: false }, () => {
                setTimeout(() => {
                    Promise.all(putArr).then((res) => {
                        this.showError('lang_update_account_information_successfully')
                        this.setEditMode(this.state.isEditMode)
                        this.saveData()
                    }).catch((error) => {
                        this.showError(error.response.error_code[0] || 'Update Fail', true)
                        this.setEditMode(this.state.isEditMode)
                    })
                }, 1000);
            })
        } else {
            this.showError('lang_there_is_no_change_in_the_account_information')
        }
    }

    handleCallBackActionGroup(type) {
        switch (type) {
            case 'edit':
                this.setState({ isEditMode: true }, () => {
                    this.setEditMode(this.state.isEditMode)
                })
                break;
            case 'cancel':
                this.setState({ isEditMode: false }, () => {
                    this.setEditMode(this.state.isEditMode)
                })
                this.resetData();
                break;
            case 'save':
                this.handleSave()
                break;
        }
    }

    collapseFunc = (collapse) => {
        this.collapse = collapse ? 1 : 0
        this.props.saveState({
            collapse: this.collapse
        })
        this.forceUpdate()
    }

    createagSideButtons = () => {
        return [
            {
                value: 'ExportCSV',
                label: 'lang_export_csv',
                callback: () => this.exportCsv()
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
                callback: (boundOption) => this.showColumnMenu()
            },
            {
                value: 'lang_filters',
                label: 'lang_filters',
                callback: (boundOption) => this.showFilterMenu()
            }
        ]
    }

    componentDidMount() {
        try {
            const userInfo = dataStorage.userInfo || {};
            this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection);
            this.emitRefreshID = this.accountRefresh && this.accountRefresh.addListener(eventEmitter.REFRESH_DATA_ACCOUNT, () => this.getFilterOnSearch());
            registerAllOrders(this.realtimeDataAccount, 'ACCOUNT_MANAGEMENT');
            if (userInfo.user_type === userTypeEnum.OPERATOR) {
                registerAllOrders(this.realtimeAccountOpening, 'ACCOUNT_OPENING')
            } else {
                registerUser(userInfo.user_id, this.realtimeAccountOpening, 'ACCOUNT_OPENING')
            }
            const hideFields = ['lang_warrant_trading', 'lang_options_trading', 'lang_internation_trading']
            this.hideFieldsInQuickFilter(hideFields)
        } catch (error) {
            logger.log('error at didmout account management', error)
        }
    }

    realtimeAccountOpening = (obj, action) => {
        if (action === 'DELETE') {
            // this.getDataAccountManagement()
        } else {
            const openingAccount = JSON.parse(obj)
            this.addOrUpdate(openingAccount)
            if (!this.dicData[openingAccount[FIELD.EQUIX_ID]] && this.pageObj) {
                this.dicData[openingAccount[FIELD.EQUIX_ID]] = openingAccount
                const newTotalCount = this.pageObj.total_count + 1
                const newTotalPage = Math.ceil(newTotalCount / this.pageSize)
                this.pageObj = {
                    total_count: newTotalCount,
                    total_pages: newTotalPage,
                    current_page: this.pageObj.current_page,
                    temp_end_page: 0,
                    page_size: this.pageSize
                }
                this.setPage && this.setPage(this.pageObj);
            }
        }
    }

    componentWillUnmount() {
        const userInfo = dataStorage.userInfo || {};
        this.emitConnectionID && this.emitConnectionID.remove();
        this.emitRefreshID && this.emitRefreshID.remove();
        if (userInfo.user_type === userTypeEnum.OPERATOR) {
            registerAllOrders(this.realtimeAccountOpening, 'ACCOUNT_OPENING')
        } else {
            registerUser(userInfo.user_id, this.realtimeAccountOpening, 'ACCOUNT_OPENING')
        }
    }

    handleCallBackActionCreateGroup = () => { }

    renderHeader = () => {
        const userInfo = dataStorage.userInfo || {};
        return <div className={`header-wrap isMoreOption flex ${this.collapse ? 'collapse' : ''}`}>
            <div className='navbar'>
                {userInfo.user_type === userTypeEnum.OPERATOR && checkRole(MapRoleComponent.EDIT_ACCOUNT)
                    ? <ButtonGroup
                        callback={this.handleCallBackActionGroup.bind(this)}
                        value={this.state.isEditMode}
                        more={true}
                    />
                    : null
                }
                <ButtonCreateGroup
                    columns={this.colDefsAccountManagement()}
                    callback={this.handleCallBackActionCreateGroup.bind(this)}
                    more={true}
                />
            </div>
            <div className={s.quickFilterContainer}>
                <div className='box-filter fullWidth'>
                    <FilterBox
                        value={this.valueFilter}
                        onChange={(data) => this.setQuickFilter(data)} />
                </div>
                <MoreOption agSideButtons={this.createagSideButtons()} />
            </div>
        </div>
    }

    renderGrid = () => {
        return <div className='accountManagerContain'>
            <Grid
                id={FORM.ACCOUNT_MANAGEMENT}
                {...this.props}
                hideButton={true}
                onlyOneRow={true}
                autoHeight={true}
                fn={fn => {
                    this.addOrUpdate = fn.addOrUpdate
                    this.setData = fn.setData
                    this.remove = fn.remove
                    this.resetData = fn.resetData
                    this.getData = fn.getData
                    this.setEditMode = fn.setEditMode
                    this.updateField = fn.updateField
                    this.setSelectedRowData = fn.setSelectedRowData
                    this.setSelected = fn.setSelected
                    this.setColumn = fn.setColumn
                    this.setGridFunctions = fn.setGridFunctions
                    this.exportCsv = fn.exportCsv
                    this.resetFilter = fn.resetFilter
                    this.autoSize = fn.autoSize
                    this.resetFilter = fn.resetFilter
                    this.setQuickFilter = fn.setQuickFilter
                    this.showColumnMenu = fn.showColumnMenu
                    this.showFilterMenu = fn.showFilterMenu
                    this.saveData = fn.saveData
                }}
                getCsvFunction={this.getCsvFunction}
                loadingCallback={this.props.loadingCallback}
                getFilterOnSearch={this.getFilterOnSearch}
                fnKey={this.setGridFnKey}
                paginate={this.setGridPaginate()}
                columns={this.colDefsAccountManagement()}
                onRowClicked={this.onRowClicked}
                onlySystem={true}
            />
        </div>
    }

    render() {
        try {
            return (
                <div className={s.container + ' ' + 'accountManagerContainer root qe-widget'}>
                    <Error ref={ref => this.errorRef = ref} />
                    {this.renderHeader()}
                    <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
                    {this.renderGrid()}
                </div>
            )
        } catch (error) {
            logger.log('Error while rendering AccountManager: ', error)
        }
    }
}

class Error extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isError: false,
            isShow: false,
            error: ''
        }
    }

    showError = (err, isErr) => {
        this.setState({
            isError: isErr,
            isShow: true,
            error: err
        })
        this.hideError()
    }

    hideError = () => {
        setTimeout(() => {
            this.setState({
                isShow: false,
                error: ''
            })
        }, 4000)
    }

    render() {
        return <div className={`errorOrder size--3 ${this.state.isError ? '' : 'yellow'} ${this.state.isShow ? '' : 'myHidden'}`}>
            <Lang>{this.state.error}</Lang>
        </div>
    }
}
