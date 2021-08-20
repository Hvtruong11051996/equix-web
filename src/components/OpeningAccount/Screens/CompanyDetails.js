import React from 'react'
import Lang from '../../Inc/Lang/Lang'
import countryOptions from '../../../constants/country_options'
import { FIELD, OPTIONS, ACCOUNT_TYPE } from '../constant'
import Form, { TYPE } from '../../Inc/Form/Form'
import { translateByEnvVariable } from '../../../helper/functionUtils'
const getSchema = (data) => {
    const accountType = data[FIELD.ACCOUNT_TYPE]
    return {
        type: TYPE.OBJECT,
        properties: {
            group1: {
                type: TYPE.GROUP,
                title: 'lang_company'
            },
            [FIELD.COMPANY_NAME]: {
                title: 'lang_full_name_of_company',
                titleClass: 'text-normal',
                rules: {
                    required: true,
                    max: 200
                },
                type: TYPE.STRING
            },
            [FIELD.COMPANY_TYPE]: {
                title: 'lang_company_type',
                rules: {
                    required: true
                },
                type: TYPE.DROPDOWN,
                align: 'right',
                options: OPTIONS.COMPANY_TYPE
            },
            [FIELD.COMPANY_ACN]: {
                title: 'lang_acn',
                titleClass: 'text-normal',
                rules: {
                    required: true,
                    max: 9,
                    number: true
                },
                type: TYPE.NUMBER
            },
            [FIELD.COMPANY_ABN]: {
                title: 'lang_abn',
                titleClass: 'text-normal',
                rules: {
                    max: 11,
                    number: true
                },
                type: TYPE.NUMBER
            },
            [FIELD.COMPANY_TFN]: {
                title: 'lang_tfn',
                titleClass: 'text-normal',
                type: TYPE.STRING,
                rules: {
                    max: 9,
                    number: true,
                    tfn: true
                },
                condition: {
                    [FIELD.COMPANY_TAX_EXEMPTION]: false
                },
                note: 'lang_tfn_note'
            },
            [FIELD.COMPANY_TAX_EXEMPTION]: {
                title: 'lang_tfn_exemption',
                titleClass: 'text-normal',
                type: TYPE.BOOLEAN
            },
            [FIELD.COMPANY_TAX_EXEMPTION_DETAILS]: {
                title: 'lang_exemption_detail',
                rules: {
                    required: true
                },
                type: TYPE.DROPDOWN,
                align: 'right',
                options: OPTIONS.EXEMPTION_DETAILS[accountType || ACCOUNT_TYPE.INDIVIDUAL],
                condition: {
                    [FIELD.COMPANY_TAX_EXEMPTION]: true
                }
            },
            [FIELD.COUNTRY_OF_INCORPORATION]: {
                title: 'lang_country_of_incorporation',
                titleClass: 'text-normal',
                type: TYPE.DROPDOWN,
                align: 'right',
                rules: {
                    required: true
                },
                options: countryOptions,
                translate: false,
                disable: true,
                defaultValue: 'AUSTRALIA',
                help: 'lang_select_company_helptext'
            },
            [FIELD.COMPANY_DATE_OF_INCORPORATION]: {
                title: 'lang_date_of_incorporation',
                titleClass: 'text-normal',
                type: TYPE.DATE_PICKER,
                limit: -0.1,
                rules: {
                    required: true,
                    date: true
                },
                help: 'lang_date_format_helptext'
            },
            [FIELD.COMPANY_NATURE_OF_BUSINESS_ACTIVITY]: {
                title: 'lang_nature_of_the_business_activity',
                titleClass: 'text-normal',
                rules: {
                    required: true,
                    max: 255
                },
                type: TYPE.STRING
            },
            group2: {
                type: TYPE.GROUP,
                title: 'lang_registered_office_address',
                subTitle: 'lang_residential_address_subtitle'
            },
            [FIELD.ROA_COUNTRY]: {
                title: 'lang_country',
                rules: {
                    required: true
                },
                help: 'lang_select_country_helptext',
                type: TYPE.DROPDOWN,
                align: 'right',
                options: countryOptions,
                disable: true,
                defaultValue: 'AUSTRALIA'
            },
            [FIELD.COMPANY_ADDRESS]: {
                title: 'lang_address',
                rules: {
                    required: true,
                    max: 255
                },
                help: 'lang_select_country_helptext',
                prefix: 'company_registered_office_address_',
                type: TYPE.AUTOCOMPLETE
            },
            group3: {
                type: TYPE.GROUP,
                title: 'lang_principal_place_of_business_address',
                titleClass: 'text-normal',
                subTitle: 'lang_residential_address_subtitle'
            },
            [FIELD.COMPANY_SAME_AS_ROA]: {
                title: ' ',
                subTitle: 'lang_same_as_registered_office_address',
                type: TYPE.BOOLEAN
            },
            [FIELD.COMPANY_COUNTRY]: {
                title: 'lang_country',
                rules: {
                    required: true
                },
                help: 'lang_select_country_helptext',
                type: TYPE.DROPDOWN,
                align: 'right',
                options: countryOptions,
                disable: true,
                defaultValue: 'AUSTRALIA',
                condition: {
                    [FIELD.COMPANY_SAME_AS_ROA]: false
                }
            },
            [FIELD.COMPANY_FULL_ADDRESS]: {
                title: 'lang_address',
                rules: {
                    required: true,
                    max: 255
                },
                help: 'lang_select_country_helptext',
                prefix: 'company_principal_place_of_business_address_',
                type: TYPE.AUTOCOMPLETE,
                condition: {
                    [FIELD.COMPANY_SAME_AS_ROA]: false
                }
            },
            group4: {
                type: TYPE.GROUP,
                title: 'lang_contact_details'
            },
            [FIELD.COMPANY_WORK_PHONE]: {
                title: 'lang_work_phone',
                rules: {
                    phone: true,
                    max: 80
                },
                type: TYPE.CALLING_CODE
            },
            [FIELD.COMPANY_FAX_PHONE]: {
                title: 'lang_fax',
                placeholder: 'Fax',
                rules: {
                    phone: true,
                    max: 80
                },
                type: TYPE.CALLING_CODE
            },
            [FIELD.COMPANY_MOBILE_PHONE]: {
                title: 'lang_mobile_phone',
                rules: {
                    calling_code_required: true,
                    phone: true,
                    max: 80
                },
                type: TYPE.CALLING_CODE,
                note: 'lang_mobile_note'
            },
            [FIELD.COMPANY_EMAIL]: {
                title: 'lang_email_address',
                rules: {
                    required: true,
                    email: true,
                    max: 80
                },
                type: TYPE.STRING,
                note: 'lang_email_note'
            }
        }
    }
}
export default class CompanyDetails extends React.Component {
    onChange = (data, errorCount) => {
        this.props.onChange(data, errorCount)
    }
    renderTopInfo = () => {
        return (
            <React.Fragment>
                <div style={{ fontSize: 'var(--size-4)', margin: '16px 0px' }}>{translateByEnvVariable('lang_please_call_note', 'lang_config_support_phone', 'supportPhone')} </div>
                <div style={{ fontSize: 'var(--size-4)', margin: '16px 0px' }}> <span style={{ color: 'var(--semantic-danger)' }}>*</span><span className='text-capitalize'>&nbsp;<Lang>lang_require_symbol</Lang></span></div>
            </React.Fragment >
        )
    }
    render() {
        return <div>
            {this.renderTopInfo()}
            <Form
                onChange={this.onChange}
                data={this.props.data}
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
                schema={getSchema(this.props.data)}
                onKeyPress={this.handleKeyPress}
                marginForm={this.props.marginForm}
            />
        </div>
    }
    componentDidMount() {
        this.setEditMode && this.setEditMode(true)
        this.props.callBackFn && this.props.callBackFn(this.getData)
    }
}
