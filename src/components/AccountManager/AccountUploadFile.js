
import React from 'react';
import SvgIcon, { path } from '../Inc/SvgIcon';
import Lang from '../Inc/Lang';
import { Spinner2 } from '../Inc/Loading/Spinner';
import Dropzone from 'react-dropzone';
import Grid from '../Inc/CanvasGrid';
import { TYPE } from '../Inc/CanvasGrid/Constant/gridConstant';
import dataStorage from '../../dataStorage';
import readXlsxFile from 'read-excel-file';
import {
    postData,
    getOpeningAccountUrl
} from '../../helper/request';
import logger from '../../helper/log'
import { STATE_CODE } from '../../constants/user_man_enum';
import s from './AccountManager.module.css'
import { validateBody } from './validateAccount'
import XLSX from 'xlsx'
import moment from 'moment'
import uuidv4 from 'uuid/v4'
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'
import { FIELD, ACCOUNT_TYPE } from '../OpeningAccount/constant'
import { checkValidDateInput } from '../../helper/functionUtils'

const dicField = {
    // Application details
    'Client Type': 'client_type',
    'Account Holder Type': 'account_type',
    // 'Account Name 1': 'account_name',
    // 'Account Name N': '',
    // 'External Identifier 1': 'equix_id',
    // 'Account Holder Name 1': 'account_name',
    // 'Account Holder Name N': '',
    // 'Account Designation': 'account_designation',
    // 'Account Address': '',
    // 'Postal Address': 'postal_address_',
    // 'Brokerage Schedule': 'tradeable_products',
    'GST Payable': 'gst_payable',
    'Have CMA Account?': 'new_cma',
    'Source Of Fund': 'cma_source_of_funds',
    'Source Of Fund Description': 'cma_source_of_funds_desc',
    'Account Purpose': 'cma_account_purpose',
    'Account Purpose Description': 'cma_account_purpose_desc',
    'Send Registration Email': 'send_registration_email',
    // Brokerage Schedule
    'Equity Brokerage Schedule': 'tradeable_products.equity',
    'Options Brokerage Schedule': 'tradeable_products.options',
    'Futures Brokerage Schedule': 'tradeable_products.futures',
    'ETF Brokerage Schedule': 'tradeable_products.etf',
    'Index Brokerage Schedule': 'tradeable_products.index',
    'Forex Brokerage Schedule': 'tradeable_products.forex',
    'Warrants Brokerage Schedule': 'tradeable_products.warrants',
    'Mutual Funds Brokerage Schedule': 'tradeable_products.mutual_funds',
    // Trade Confirmations (10 maximum)
    'Trade Confirmation 1 Type': 'method',
    // 'Trade Confirmation 1 Attention': 'attention',
    'Trade Confirmation 1 Email': 'email',
    'Trade Confirmation 1 Fax': 'fax',
    'Trade Confirmation 1 Postal Address': 'postal_address_',
    'Trade Confirmation 1 Is Client Address': 'client_address', // TRUE/FALSE
    'Trade Confirmation 1 Auto Print': 'auto_print', // TRUE/FALSE
    // Settlement Details
    'Settlement Method': 'settlement_method',
    'Existing HIN': 'settlement_existing_hin',
    'PID': 'settlement_pid',
    'Supplementary Reference': 'settlement_supplementary_reference',
    'Company Name': 'company_name',
    'Company ABN': 'company_abn',
    'Company ACN': 'company_acn',
    'Company TFN': 'company_tfn',
    'Company TFN Exemption Details': 'company_tax_exemption_details',
    'Company Type': 'company_type',
    'Country Of Incorporation': 'company_country_of_incorporation',
    'Date Of Incorporation': 'company_date_of_incorporation',
    'Principal Place of Business Address': 'company_principal_place_of_business_address_',
    'Registered Office Address': 'company_registered_office_address_',
    'Contact Details': 'See Notes',
    'Nature Of Business Activity': 'company_nature_of_business_activity',
    // 'Company Industry': 'company_industry',
    'Trust Name': 'trust_name',
    'Trust Type': 'trust_type',
    'Country Of Establishment': 'trust_country_of_establishment',
    'Nature Of Trust Activity': 'trust_activity',
    'Asset Source Details': 'trust_asset_source_details',
    'Trust Fund TFN': 'trust_tfn',
    'Trust Fund ABN': 'trust_abn',
    'Super Fund Name': 'super_fund_name',
    'Super Fund TFN': 'super_fund_tfn',
    'Super Fund ABN': 'super_fund_abn',
    'Self Managed Super Fund?': 'smsf',
    // Applicant Details
    // 'Applicant Count': 'applicant_count',
    'Relationship Type': 'relationship_type',
    'Other Relationship type description': 'relationship_description',
    'Title': 'title',
    'First Name': 'first_name',
    'Middle Names': 'middle_name',
    'Last Name': 'last_name',
    'Date of Birth': 'dob',
    'Gender': 'gender',
    'TFN': 'tfn',
    'TFN Exemption Details': 'tax_exemption_details',
    'Residential Address': 'residential_address_',
    'Contact': 'See Notes',
    'Source Of Wealth': 'source_of_wealth',
    'Nationality': 'nationality',
    'Country Of Birth': 'country_of_birth',
    'Occupation Category': 'occupation_category',
    'Occupation Type': 'occupation_type',
    'Australian Tax Resident': 'australian_tax_resident',
    'Government ID': 'government_id.type',
    'Government ID State': 'government_id.state_of_issue',
    'Government ID Number': 'government_id.number',
    'Government ID Medicare Name On Card': 'government_id.medicare_name_on_card',
    'Government ID Medicare Individual Reference Number': 'government_id.medicare_individual_reference_number',
    'Government ID Medicare Card Colour': 'government_id.medicare_card_colour',
    'Government ID Medicare Expiry Date': 'government_id.medicare_card_expiry_date'
}

const stringFields = [
    'client_type',
    'account_type',
    'account_name',
    'equix_id',
    'account_designation',
    'cma_source_of_funds',
    'cma_source_of_funds_desc',
    'cma_account_purpose',
    'cma_account_purpose_desc',
    'send_registration_email',
    'equity',
    'options',
    'futures',
    'etf',
    'index',
    'forex',
    'warrants',
    'mutual_funds',
    'method',
    'email',
    'fax',
    'settlement_method',
    'settlement_supplementary_reference',
    'company_name',
    'company_tax_exemption_details',
    'company_type',
    'company_country_of_incorporation',
    'company_nature_of_business_activity',
    'trust_name',
    'trust_type',
    'trust_country_of_establishment',
    'trust_activity',
    'trust_asset_source_details',
    'super_fund_name',
    'relationship_type',
    'relationship_description',
    'title',
    'first_name',
    'middle_name',
    'last_name',
    'gender',
    'tax_exemption_details',
    'source_of_wealth',
    'nationality',
    'occupation_category',
    'occupation_type',
    'type',
    'state_of_issue',
    'number',
    'medicare_name_on_card',
    'medicare_card_colour'
]

const accountTypeTran = {
    [ACCOUNT_TYPE.INDIVIDUAL]: 'lang_individual',
    [ACCOUNT_TYPE.JOINT]: 'lang_joint',
    [ACCOUNT_TYPE.COMPANY]: 'lang_company',
    [ACCOUNT_TYPE.TRUST_INDIVIDUAL]: 'lang_trust_individual',
    [ACCOUNT_TYPE.TRUST_COMPANY]: 'lang_trust_company',
    [ACCOUNT_TYPE.SUPER_FUND_COMPANY]: 'lang_super_fund_company',
    [ACCOUNT_TYPE.SUPER_FUND_INDIVIDUAL]: 'lang_super_fund_individual'
}
export class AccountUploadFile extends React.Component {
    constructor(props) {
        super(props);
        this.failCount = 0;
        this.successCount = 0;
        this.processCount = 0;
        this.listData = [];
        this.listDataImported = [];
        this.listDataFailed = [];
        this.state = {
            stateText: '',
            count: 0,
            failCount: 0,
            successCount: 0,
            processCount: 0,
            isError: false,
            stateCode: STATE_CODE.UPLOAD,
            statusLoading: null
        }
        addEventListener(EVENTNAME.connectionChanged, this.connectionChanged);
    }

    componentWillUnmount() {
        removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged);
    }

    connectionChanged = () => {
        this.forceUpdate();
    }

    createColumns = () => {
        const columns = [
            {
                header: 'lang_account_type',
                name: 'account_type',
                formater: params => dataStorage.translate(accountTypeTran[params.value])
            },
            {
                header: 'lang_account_holder_name',
                name: 'account_name',
                formater: params => {
                    if (params.data && params.data[FIELD.ACCOUNT_TYPE]) {
                        if (params.data[FIELD.ACCOUNT_TYPE].includes('TRUST')) return params.data.trust_name || '';
                        if (params.data[FIELD.ACCOUNT_TYPE].includes('SUPER_FUND')) return params.data.super_fund_name || '';
                        if (params.data[FIELD.ACCOUNT_TYPE] === 'COMPANY') return params.data.company_email || '';
                        if (params.data.applicant_details && params.data.applicant_details[0]) {
                            let str = params.data.applicant_details[0].first_name + ' ' + params.data.applicant_details[0].last_name
                            if (params.data[FIELD.ACCOUNT_TYPE].includes('JOINT') && params.data.applicant_details[1]) str += ' & ' + params.data.applicant_details[1].first_name + ' ' + params.data.applicant_details[1].last_name
                            return str;
                        }
                    }
                    return '';
                }
            },
            {
                header: 'lang_email_address',
                name: 'account_email',
                formater: params => {
                    if (params.data && params.data[FIELD.ACCOUNT_TYPE]) {
                        if (params.data[FIELD.ACCOUNT_TYPE].includes('COMPANY')) return params.data.company_email || '';
                        return (params.data.applicant_details && params.data.applicant_details[0] && params.data.applicant_details[0].applicant_email) || ''
                    }
                    return '';
                }
            },
            {
                header: 'lang_mobile_number',
                name: 'account_mobile_phone',
                formater: params => {
                    if (params.data && params.data[FIELD.ACCOUNT_TYPE]) {
                        if (params.data[FIELD.ACCOUNT_TYPE].includes('COMPANY')) return params.data.company_mobile_phone || '';
                        return (params.data.applicant_details && params.data.applicant_details[0] && params.data.applicant_details[0].applicant_mobile_phone) || ''
                    }
                    return '';
                }
            },
            {
                header: 'lang_country',
                name: 'account_country',
                formater: params => {
                    if (params.data && params.data[FIELD.ACCOUNT_TYPE]) {
                        if (params.data[FIELD.ACCOUNT_TYPE].includes('COMPANY')) return params.data.company_country_of_incorporation || '';
                        return (params.data.applicant_details && params.data.applicant_details[0] && params.data.applicant_details[0].nationality) || ''
                    }
                    return '';
                }
            },
            {
                header: 'lang_account_address',
                name: 'account_address',
                formater: params => {
                    if (params.data && params.data[FIELD.ACCOUNT_TYPE]) {
                        if (params.data[FIELD.ACCOUNT_TYPE].includes('COMPANY')) return params.data.company_registered_office_address_full_address || '';
                        return (params.data.applicant_details && params.data.applicant_details[0] && params.data.applicant_details[0].postal_address_full_address) || ''
                    }
                    return '';
                }
            },
            {
                header: 'lang_cma_provider',
                name: 'bank_cmt_provider'
            },
            {
                header: 'lang_bsb',
                name: 'bank_bsb'
            },
            {
                header: 'lang_bank_account_name',
                name: 'bank_account_name'
            },
            {
                header: 'lang_bank_account_number',
                name: 'bank_account_number'
            },
            {
                header: 'lang_bank_transaction_type',
                name: 'bank_transaction_type'
            },
            {
                header: 'lang_equity_brokerage_schedule',
                name: 'tradeable_products',
                formater: params => (params.value && params.value.equity) || ''
            }
        ]
        if (this.state.stateCode === STATE_CODE.PREVIEW) {
            return [{
                header: 'select',
                name: 'select',
                cellOnHeader: true,
                type: TYPE.SELECT_ROW
            }, ...columns]
        }
        return [{
            header: 'select',
            name: 'select',
            cellOnHeader: true,
            type: 'openingIndicator'
        }, {
            header: 'lang_account_status',
            name: 'create_status',
            type: 'createAccountStatus'
        }, ...columns];
    }

    closeForm = () => {
        this.props.onClose && this.props.onClose()
    }
    validateData = (data) => {
        if (!data[FIELD.ACCOUNT_TYPE]) return false;
        // if (!data[FIELD.CMA]) return false;
        // if (!data[FIELD.CMA_SOURCE_OF_FUNDS]) return false;
        if (data[FIELD.CMA_SOURCE_OF_FUNDS] === 'OTHER' && !data[FIELD.CMA_SOURCE_OF_FUNDS]) return false;
        // if (!data[FIELD.CMA_ACCOUNT_PURPOSE]) return false;
        if (data[FIELD.CMA_ACCOUNT_PURPOSE] === 'OTHER' && !data[FIELD.CMA_ACCOUNT_PURPOSE_DESC]) return false;
        // company detail
        if (data[FIELD.ACCOUNT_TYPE] === 'COMPANY') {
            if (!data[FIELD.COMPANY_NAME]) return false;
            if (data[FIELD.COMPANY_NAME].length > 200) return false;
            if (!data[FIELD.COMPANY_TYPE]) return false;
            if (!data[FIELD.COMPANY_ACN]) return false;
            if (data[FIELD.COMPANY_ACN].length > 255) return false;
            if (!data[FIELD.COMPANY_ABN]) return false;
            if (data[FIELD.COMPANY_ABN].length > 255) return false;
            if (data[FIELD.COMPANY_TAX_EXEMPTION] && !data[FIELD.COMPANY_TAX_EXEMPTION_DETAILS]) return false;
            if (!data[FIELD.COMPANY_TYPE]) return false;
        }

        return validateBody(data);
    }
    onDrop = (files) => {
        logger.log(files);
        this.listDataFailed = [];
        this.setState({
            stateCode: STATE_CODE.IMPORTING,
            stateText: 'lang_importing_account',
            isError: false
        }, () => {
            readXlsxFile(files[0])
                .then((rows) => {
                    if (rows && rows.length > 1) {
                        const listProperty = rows[0];
                        const listData = [];
                        const fillAddress = (obj, field, value) => {
                            if (!value) value = '';
                            const arr = (value + '').split('|');
                            if (arr[5] && arr[6]) {
                                const tmp = arr[5];
                                arr[5] = arr[6];
                                arr[6] = tmp;
                            }
                            const fullAddress = arr.filter(txt => txt).join(' ');
                            if (fullAddress) {
                                const unitFlatNumber = arr[0];
                                const streetNumber = arr[1] || '';
                                const streetName = arr[2] || '';
                                const streetType = arr[3] || '';
                                const citySuburb = arr[4] || '';
                                const state = arr[5] || '';
                                const postcode = arr[6] || '';
                                const country = arr[7] || '';
                                obj[field + 'full_address'] = fullAddress;
                                obj[field + 'unit_flat_number'] = unitFlatNumber;
                                obj[field + 'street_number'] = streetNumber;
                                obj[field + 'street_name'] = streetName;
                                obj[field + 'street_type'] = streetType;
                                obj[field + 'city_suburb'] = citySuburb;
                                obj[field + 'postcode'] = postcode;
                                obj[field + 'state'] = state;
                                obj[field + 'country'] = country;
                                obj[field + 'full_address'] = `${unitFlatNumber} ${streetNumber} ${streetName} ${streetType}, ${citySuburb} ${state} ${postcode} ${country}`
                            }
                        }
                        for (let rowCount = 1; rowCount < rows.length; rowCount++) {
                            const row = rows[rowCount] || [];
                            const obj = { id: uuidv4() };
                            const originObj = {};
                            for (let i = 0; i < row.length; i++) {
                                originObj[listProperty[i]] = row[i];
                                if (listProperty[i] === 'Postal Address') continue;
                                if (row[i] === null) continue;
                                const field = dicField[listProperty[i]];
                                if (field === 'account_type' && row[i]) {
                                    if (row[i].includes('COMPANY')) {
                                        obj.company_industry = '54494541000'
                                        obj.company_tax_exemption = false
                                        obj.company_same_as_roa = false
                                        obj.company_country_of_incorporation = 'AUSTRALIA'
                                    }
                                    if (row[i].includes('SUPER_FUND')) {
                                        obj.super_fund_tax_exemption = false
                                        obj.smsf = false
                                    }
                                    if (row[i].includes('TRUST')) {
                                        obj.trust_tax_exemption = false
                                    }
                                }
                                const sm = listProperty[i].match(/^(Trade Confirmation\s)(\d+)(\s.*)$/);
                                if (sm) {
                                    //  Trade Confirmations
                                    const key = sm[1] + '1' + sm[3];
                                    if (!dicField[key]) continue;
                                    if (!obj.trade_confirmations) obj.trade_confirmations = [];
                                    const index = sm[2] - 1
                                    const objTmp = {};
                                    if (dicField[key].endsWith('_')) {
                                        fillAddress(objTmp, dicField[key], row[i]);
                                    } else {
                                        objTmp[dicField[key]] = row[i];
                                    }
                                    if (Object.keys(objTmp).length) {
                                        if (!obj.trade_confirmations[index]) obj.trade_confirmations[index] = objTmp;
                                        else Object.assign(obj.trade_confirmations[index], objTmp)
                                    }
                                } else if (field) {
                                    // Application details
                                    if (field === 'super_fund_tax_exemption_details') obj.super_fund_tax_exemption = !!row[i]
                                    if (field === 'trust_tax_exemption_details') obj.trust_tax_exemption = !!row[i]

                                    if (field === 'company_date_of_incorporation') obj[field] = moment(row[i]).format('DD/MM/YYYY')
                                    else if (field.endsWith('_')) {
                                        fillAddress(obj, field, row[i]);
                                    } else if (field.startsWith('tradeable_products.')) {
                                        if (!obj.tradeable_products) obj.tradeable_products = {};
                                        obj.tradeable_products[field.replace('tradeable_products.', '')] = row[i]
                                    } else if (listProperty[i] === 'Contact Details') {
                                        if (!row[i]) row[i] = '';
                                        const arr = (row[i] + '').split('|')
                                        if (arr[0]) obj.company_work_phone = (arr[0]).replaceAll('-', '|');
                                        if (arr[1]) obj.company_mobile_phone = (arr[1] || '').replaceAll('-', '|');
                                        if (arr[2]) obj.company_fax_phone = (arr[2] || '').replaceAll('-', '|');
                                        if (arr[3]) obj.company_email = (arr[3] || '');
                                    } else obj[field] = stringFields.includes(field) ? row[i] + '' : row[i]
                                } else {
                                    const m = listProperty[i].match(/^(.*)\s(\d+)$/)
                                    if (m) {
                                        // Applicant Details
                                        if (dicField[m[1]]) {
                                            if (!obj.applicant_details) obj.applicant_details = [];
                                            const index = m[2] - 1
                                            if (!obj.applicant_details[index]) {
                                                obj.applicant_details[index] = {
                                                    tos_consent: true,
                                                    ekyc_aml_consent: true,
                                                    applicant_id: uuidv4(),
                                                    australian_tax_resident: true,
                                                    same_as_ra: true,
                                                    occupation_type: 'Business Owner',
                                                    tax_exemption: !!row[listProperty.indexOf('TFN Exemption Details ' + m[2])]
                                                };
                                            }
                                            if (dicField[m[1]].endsWith('_')) {
                                                fillAddress(obj.applicant_details[index], dicField[m[1]], row[i]);
                                            } else if (dicField[m[1]] === 'dob') {
                                                obj.applicant_details[index][dicField[m[1]]] = moment(row[i]).format('DD/MM/YYYY');
                                            } else if (m[1] === 'Contact') {
                                                if (!row[i]) row[i] = '';
                                                const arr = (row[i] + '').split('|')
                                                if (arr[0]) obj.applicant_details[index].applicant_home_phone = (arr[0]).replaceAll('-', '|');
                                                if (arr[1]) obj.applicant_details[index].applicant_work_phone = (arr[1] || '').replaceAll('-', '|');
                                                if (arr[2]) obj.applicant_details[index].applicant_mobile_phone = (arr[2] || '').replaceAll('-', '|');
                                                if (arr[3]) obj.applicant_details[index].applicant_fax_phone = (arr[3] || '').replaceAll('-', '|');
                                                if (arr[4]) obj.applicant_details[index].applicant_email = (arr[4] || '');
                                            } else if (dicField[m[1]].startsWith('government_id.')) {
                                                const key = dicField[m[1]].replace('government_id.', '');
                                                if (!obj.applicant_details[index].government_id) obj.applicant_details[index].government_id = [{}]
                                                if (key === 'medicare_card_expiry_date') obj.applicant_details[index].government_id[0][key] = moment(row[i]).format('MM/YYYY');
                                                else obj.applicant_details[index].government_id[0][key] = stringFields.includes(key) ? row[i] + '' : row[i];
                                            } else obj.applicant_details[index][dicField[m[1]]] = stringFields.includes(dicField[m[1]]) ? row[i] + '' : row[i];
                                        }
                                    }
                                }
                            }
                            console.log(obj);
                            if (this.validateData(obj)) {
                                listData.push(obj);
                                this.listDataImported.push(originObj);
                            } else this.listDataFailed.push(originObj);
                        }
                        this.listData = listData;
                        this.setState({
                            stateCode: STATE_CODE.PREVIEW,
                            stateText: ''
                        }, () => {
                            this.setData && this.setData(listData)
                        })
                    } else {
                        this.setState({
                            stateCode: STATE_CODE.UPLOAD,
                            stateText: 'lang_no_data_was_imported_from_this_file',
                            isError: true
                        })
                    }
                }).catch(err => {
                    logger.log(err);
                    this.setState({
                        stateCode: STATE_CODE.UPLOAD,
                        stateText: 'lang_failed_to_import_accounts',
                        isError: true
                    })
                })
        })
    }

    processCreateAccount = () => {
        const lst = this.getData();
        this.listDataImported = this.listDataImported.filter((x, i) => lst[i] && lst[i].select)
        this.listData = lst.filter(item => item.select);
        const createAccount = async () => {
            const url = getOpeningAccountUrl();
            const dic = {}
            for (let i = 0; i < this.listData.length; i++) {
                const data = this.listData[i];
                const obj = { ...data }
                obj.tos_ip = dataStorage.ipPublish || window.ipPublic || '1.1.1.1';
                obj.tos_user_agent = navigator.userAgent
                delete obj.id;
                delete obj.select;
                delete obj.account_name;
                dic[i] = true;
                postData(url, obj).then((res) => {
                    delete dic[i];
                    Object.assign(data, res.data);
                    data.create_status = 'SUCCESS';
                    this.addOrUpdate(data);
                    this.autoSize('create_status');
                    this.forceUpdate();
                }).catch(error => {
                    delete dic[i];
                    data.create_status = 'FAILED';
                    this.addOrUpdate(data);
                    this.autoSize('create_status');
                    this.forceUpdate();
                    console.error(`onSubmit opening account ${error}`)
                })
                while (Object.keys(dic).length > 5) {
                    await new Promise((resolve) => {
                        setTimeout(resolve, 100);
                    })
                }
            }
        }
        createAccount();
        this.setState({
            stateCode: STATE_CODE.PROCESSING,
            stateText: '',
            isError: false
        }, () => {
            this.autoSize('create_status');
        })
        this.setData(this.listData);
    }

    download(url) {
        var div = document.getElementById('download');
        if (!div) {
            div = document.createElement('div');
            div.style.display = 'none';
            div.id = 'download';
            document.body.appendChild(div);
        }
        div.innerHTML = '';
        var iframe = document.createElement('iframe');
        iframe.src = url;
        div.appendChild(iframe);
    }

    onDownloadTemplate = () => {
        this.download('/template/account-template.xlsx');
    }

    onCancel = () => {
        // this.setState({
        //     stateCode: STATE_CODE.UPLOAD
        // })
        this.closeForm()
    }

    downloadXlsx = (data, fileName) => {
        var sheet = XLSX.utils.json_to_sheet(data)

        // A workbook is the name given to an Excel file
        var wb = XLSX.utils.book_new() // make Workbook of Excel

        // add Worksheet to Workbook
        XLSX.utils.book_append_sheet(wb, sheet, 'Book1')

        // export Excel file
        XLSX.writeFile(wb, fileName + '.xlsx')
    }

    onDownloadFailImported = () => {
        if (this.listDataFailed.length) {
            this.downloadXlsx(this.listDataFailed, 'fail-imported');
        }
    }
    onDownloadFailCreate = () => {
        const lst = this.getData()
        const lstExport = [...this.listDataFailed, ...this.listDataImported.filter((x, i) => lst[i] && lst[i].create_status === 'FAILED')];
        if (lstExport.length) {
            this.downloadXlsx(lstExport, 'fail-created');
        }
    }

    renderDownloadTemplate() {
        return <div className={s.btn} onClick={this.onDownloadTemplate}>
            <SvgIcon path={path.mdiFileDownload} className={s.icon} />
            <div className={s.textBtn + ' ' + 'showTitle text-capitalize'}><Lang>lang_download_template</Lang></div>
        </div>
    }

    renderDownloadFailImported() {
        return <div className={s.btn} onClick={this.onDownloadFailImported}>
            <SvgIcon path={path.mdiFileDownload} className={s.icon} />
            <div className={s.textBtn + ' ' + 'showTitle text-capitalize'}><Lang>lang_download_failed_imported</Lang></div>
        </div>
    }

    renderDownloadFailCreate() {
        return <div className={s.btn} onClick={this.onDownloadFailCreate}>
            <SvgIcon path={path.mdiFileDownload} className={s.icon} />
            <div className={s.textBtn + ' ' + 'showTitle text-capitalize'}><Lang>lang_download_failed_create</Lang></div>
        </div>
    }

    renderSuccessImportCount() {
        const successCount = this.listData.length
        return <div className={s.btn + ' ' + s.noBorder}>
            <SvgIcon path={path.mdiCheckCircle} className={s.iconSuccess} />
            <div className={s.textBtn + ' ' + 'showTitle text-capitalize'}><Lang>lang_success_imported</Lang> </div>
            <b>{successCount}</b>
        </div>
    }

    renderFailedImportCount() {
        const failedCount = this.listDataFailed.length
        return <div className={s.btn + ' ' + s.noBorder}>
            <SvgIcon path={path.mdiCloseCircle} className={s.iconFailed} />
            <div className={s.textBtn + ' ' + 'showTitle text-capitalize'}><Lang>lang_failed_imported</Lang> </div>
            <b>{failedCount}</b>
        </div>
    }

    renderCreatingCount() {
        const lst = this.getData().filter(data => !data.create_status)
        return <div className={s.btn + ' ' + s.noBorder}>
            <SvgIcon path={path.mdiCheckCircle} className={s.icon} />
            <div className={s.textBtn + ' ' + 'showTitle text-capitalize'}><Lang>lang_creating_count</Lang> </div>
            <b>{lst.length}</b>
        </div>
    }

    renderSuccessCreateCount() {
        const lst = this.getData().filter(data => data.create_status === 'SUCCESS')
        return <div className={s.btn + ' ' + s.noBorder}>
            <SvgIcon path={path.mdiCheckCircle} className={s.iconSuccess} />
            <div className={s.textBtn + ' ' + 'showTitle text-capitalize'}><Lang>lang_success_create</Lang> </div>
            <b>{lst.length}</b>
        </div>
    }

    renderFailedCreateCount() {
        const lst = this.getData().filter(data => data.create_status === 'FAILED')
        return <div className={s.btn + ' ' + s.noBorder}>
            <SvgIcon path={path.mdiCloseCircle} className={s.iconFailed} />
            <div className={s.textBtn + ' ' + 'showTitle text-capitalize'}><Lang>lang_failed_create</Lang> </div>
            <b>{lst.length}</b>
        </div>
    }

    renderCloseButton() {
        return <div className={s.btn} onClick={this.closeForm}>
            <div className={s.textBtn + ' ' + s.noIcon + ' ' + 'showTitle text-uppercase'}><Lang>lang_close</Lang></div>
        </div>
    }

    renderSelectButton = () => {
        const lst = this.getData().filter(data => !data.create_status)
        if (lst.length) return '';
        return <div className={s.btn} onClick={() => this.setState({ stateCode: STATE_CODE.UPLOAD })}>
            <SvgIcon path={path.mdiPublish} className={s.icon} />
            <div className={s.textBtn + ' ' + 'showTitle text-uppercase'}><Lang>lang_select_file</Lang></div>
        </div>
    }

    renderSaveButton = () => {
        const count = !this.getData ? 0 : this.getData().filter(x => x.select).length;
        return <div className={s.btn + ' ' + s.saveBtn} onClick={() => count && dataStorage.connected && this.processCreateAccount()} style={{ opacity: count && dataStorage.connected ? 1 : 0.54 }}>
            <SvgIcon path={path.mdiCheckCircle} className={s.icon} />
            <div className={s.textBtn + ' ' + 'showTitle text-uppercase'}><Lang>lang_create</Lang> {count} <Lang>lang_accounts</Lang></div>
        </div>
    }

    renderCancelButton() {
        return <div className={s.btn + ' ' + s.cancelBtn} onClick={this.onCancel}>
            <SvgIcon path={path.mdiCloseCircle} className={s.icon} />
            <div className={s.textBtn + ' ' + 'showTitle text-uppercase'}><Lang>lang_cancel</Lang></div>
        </div>
    }

    renderHeader() {
        return (
            <div className={s.headerUpload}>
                <div className='text-capitalize'><Lang>lang_bulk_create_account</Lang></div>
                <div className={s.iconWrapper} onClick={this.closeForm}><SvgIcon path={path.mdiClose} /></div>
            </div>
        )
    }

    renderBody() {
        switch (this.state.stateCode) {
            case STATE_CODE.IMPORTING:
                return <div className={s.uploadFile}>
                    <div className={s.errorContainer}>
                        {/* <SvgIcon path={path.mdiRestart} className={s.icon} /> */}
                        <Spinner2 />
                        <div style={{ width: 8 }} />
                        <Lang>{this.state.stateText}</Lang>
                    </div>
                </div>
            case STATE_CODE.UPLOAD:
                return <div className={s.uploadFile}>
                    <div style={{ padding: 6 }}><Lang>lang_drop_a_file_here</Lang></div>
                    <div style={{ padding: 6 }}><Lang>lang_or</Lang></div>
                    <Dropzone
                        multiple={false}
                        onDrop={this.onDrop}
                        onClick={evt => {
                            if (!dataStorage.connected) evt.preventDefault()
                        }}
                    >
                        {({ getRootProps, getInputProps }) => (
                            <div {...getRootProps()} style={{ margin: 6 }}>
                                <input {...getInputProps()} />
                                <div className={s.btn}>
                                    <SvgIcon path={path.mdiFileUpload} className={s.icon} />
                                    <div className={s.textBtn + ' ' + 'showTitle text-capitalize'}><Lang>lang_select_file</Lang></div>
                                </div>
                            </div>
                        )}
                    </Dropzone>
                    {
                        this.state.stateText ? <div className={s.errorContainer}>
                            <SvgIcon path={path.mdiCloseCircle} className={s.icon + ' ' + s.errorIcon} />
                            <div><Lang>{this.state.stateText}</Lang></div>
                        </div> : null
                    }
                </div>
            case STATE_CODE.PREVIEW:
            case STATE_CODE.PROCESSING:
            case STATE_CODE.FINISH:
                return <div className={s.uploadFile}>
                    <Grid
                        {...this.props}
                        fnKey={data => {
                            return data.id
                        }}
                        autoFit={true}
                        onRowClicked={() => {
                            this.forceUpdate();
                        }}
                        columns={this.createColumns()}
                        fn={fn => {
                            this.addOrUpdate = fn.addOrUpdate
                            this.setData = fn.setData
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
                    />
                </div>
            default:
                break;
        }
    }
    renderLeftFooter() {
        const failedCount = this.listDataFailed.length
        const erroCount = this.getData && this.getData().filter(data => data.create_status === 'FAILED').length
        switch (this.state.stateCode) {
            case STATE_CODE.UPLOAD:
            case STATE_CODE.IMPORTING:
                return this.renderDownloadTemplate()
            case STATE_CODE.PREVIEW:
                return <div className={s.footerLeft}>
                    {failedCount ? this.renderDownloadFailImported() : this.renderDownloadTemplate()}
                    {this.renderSuccessImportCount()}
                    {this.renderFailedImportCount()}
                </div>
            case STATE_CODE.PROCESSING:
                return <div className={s.footerLeft}>
                    {erroCount ? this.renderDownloadFailCreate() : this.renderDownloadTemplate()}
                    {this.renderCreatingCount()}
                    {this.renderSuccessCreateCount()}
                    {this.renderFailedCreateCount()}
                </div>
            case STATE_CODE.FINISH:
                return null
            default:
                return null
        }
    }

    renderRightFooter() {
        switch (this.state.stateCode) {
            case STATE_CODE.UPLOAD:
                return this.renderCloseButton()
            case STATE_CODE.IMPORTING:
                return this.renderCancelButton()
            case STATE_CODE.PREVIEW:
                return <div className={s.footerRight}>
                    {this.renderSaveButton()}
                    {this.renderCancelButton()}
                </div>
            case STATE_CODE.PROCESSING:
                return <div className={s.footerRight} >
                    {this.renderSelectButton()}
                    {this.renderCloseButton()}
                </div >
            case STATE_CODE.FINISH:
                return null
            default:
                return null
        }
    }
    renderFooter() {
        return (
            <div className={s.footerUpload}>
                {this.renderLeftFooter()}
                {this.renderRightFooter()}
            </div>
        )
    }
    render() {
        if (this.setColumn) this.setColumn(this.createColumns());
        return (
            <div className={s.uploadBody}>
                {this.renderHeader()}
                {this.renderBody()}
                {this.renderFooter()}
            </div>
        )
    }
}

export default AccountUploadFile;
