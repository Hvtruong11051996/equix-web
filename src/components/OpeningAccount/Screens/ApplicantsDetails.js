import React, { useState } from 'react'
import { FIELD, OPTIONS, GOVERNMENT_ID_TYPE, OCCUPATION_TYPE, ACCOUNT_TYPE, CARD_COLOUR, RELATIONSHIP_TYPE } from '../constant'
import Lang from '../../Inc/Lang/Lang'
import countryOptions from '../../../constants/country_options'
import Form, { TYPE } from '../../Inc/Form/Form'
import dataStorage from '../../../dataStorage'
import { translateByEnvVariable } from '../../../helper/functionUtils'
import moment from 'moment'

const getInitialSchema = (props, occupationType) => {
    const typeApplicant = props.typeAppllicant
    const index = props.index
    const applicantCount = props.data.applicant_details.length
    const accountType = props.data[FIELD.ACCOUNT_TYPE]
    const isMultiApplicant = applicantCount > 1
    OPTIONS.GOVERNMENT_ID_TYPE.shift()
    OPTIONS.GOVERNMENT_ID_TYPE.unshift({ label: 'lang_no_government_id', value: null, className: 'text-normal' })
    const schema = {
        type: TYPE.OBJECT,
        properties: {
            group1: {
                title: `${dataStorage.translate(typeApplicant)} ${isMultiApplicant ? index + 1 : ''}`,
                translate: false,
                type: TYPE.GROUP
            },
            [FIELD.TITLE]: {
                title: 'lang_title',
                rules: {
                    required: true
                },
                options: OPTIONS.TITLE,
                type: TYPE.DROPDOWN,
                align: 'right'
            },
            [FIELD.FIRST_NAME]: {
                title: 'lang_first_name',
                rules: {
                    required: true,
                    max: 50
                },
                help: 'lang_alert_before_provide_info_helptext',
                type: TYPE.STRING
            },
            [FIELD.MIDDLE_NAME]: {
                title: 'lang_middle_name',
                rules: {
                    max: 50
                },
                help: 'lang_alert_before_provide_info_helptext',
                type: TYPE.STRING
            },
            [FIELD.LAST_NAME]: {
                title: 'lang_last_name',
                rules: {
                    required: true,
                    max: 100
                },
                help: 'lang_alert_before_provide_info_helptext',
                type: TYPE.STRING
            },
            [FIELD.GENDER]: {
                title: 'lang_gender',
                rules: {
                    required: true
                },
                options: OPTIONS.GENDER,
                type: TYPE.DROPDOWN,
                align: 'right'
            },
            [FIELD.DOB]: {
                titleClass: 'text-normal',
                title: 'lang_date_of_birth',
                rules: {
                    required: true,
                    date: true
                },
                limit: -18,
                errorText: 'lang_over_18_years_old',
                help: 'lang_date_format_helptext',
                type: TYPE.DATE_PICKER
            },
            [FIELD.RELATIONSHIP_TYPE]: {
                title: 'lang_relationship_type',
                rules: {
                    required: true
                },
                multiSelect: true,
                options: OPTIONS.RELATIONSHIP_TYPE[accountType],
                help: 'lang_relationship_type_helptext',
                type: TYPE.DROPDOWN,
                align: 'right'
            },
            [FIELD.RELATIONSHIP_DESCRIPTION]: {
                title: 'lang_relationship_description',
                rules: {
                    required: true,
                    max: 40
                },
                condition: {
                    [FIELD.RELATIONSHIP_TYPE]: RELATIONSHIP_TYPE.OTHER
                },
                type: TYPE.STRING
            },
            [FIELD.NATIONALITY]: {
                title: 'lang_nationality',
                rules: {
                    required: true
                },
                help: 'lang_select_country_helptext',
                options: countryOptions,
                translate: false,
                type: TYPE.DROPDOWN,
                align: 'right',
                // disable: true,
                defaultValue: 'AUSTRALIA'
            },
            [FIELD.COUNTRY_OF_BIRTH]: {
                title: 'lang_country_of_birth',
                rules: {
                    required: true
                },
                help: 'lang_select_country_helptext',
                options: countryOptions,
                translate: false,
                type: TYPE.DROPDOWN,
                align: 'right',
                // disable: true,
                defaultValue: 'AUSTRALIA'
            },
            [FIELD.OCCUPATION_TYPE]: {
                title: 'lang_occupation_type',
                rules: {
                    required: true
                },
                translate: false,
                options: OPTIONS.OCCUPATION_TYPE,
                type: TYPE.DROPDOWN,
                align: 'right'
            },
            [FIELD.OCCUPATION_CATEGORY]: {
                title: 'lang_occupation_category',
                rules: {
                    required: true
                },
                translate: false,
                options: OPTIONS.OCCUPATION_CATEGORY[occupationType || OCCUPATION_TYPE.BUSINESS_OWNER],
                type: TYPE.DROPDOWN,
                align: 'right'
            },
            [FIELD.SOURCE_OF_WEALTH]: {
                title: 'lang_source_of_wealth',
                titleClass: 'text-normal',
                rules: {
                    required: true
                },
                options: OPTIONS.SOURCE_OF_WEALTH,
                type: TYPE.DROPDOWN,
                align: 'right'
            },
            [FIELD.AUSTRALIAN_TAX_RESIDENT]: {
                title: 'lang_australian_tax_resident',
                // rules: {
                //     required: true
                // },
                // disable: true,
                defaultValue: true,
                type: TYPE.BOOLEAN
            },
            [FIELD.TFN]: {
                title: 'lang_tfn',
                titleClass: 'text-normal',
                rules: {
                    max: 9,
                    number: true,
                    required: (data) => {
                        return data[FIELD.AUSTRALIAN_TAX_RESIDENT] && data[FIELD.TFN_EXEMPTION] === false
                    },
                    tfn: true
                },
                note: 'lang_note_tfn',
                condition: {
                    [FIELD.AUSTRALIAN_TAX_RESIDENT]: true,
                    [FIELD.TFN_EXEMPTION]: false
                },
                type: TYPE.STRING
            },
            [FIELD.TFN_EXEMPTION]: {
                titleClass: 'text-normal',
                title: 'lang_tax_file_number_exemption',
                condition: {
                    [FIELD.AUSTRALIAN_TAX_RESIDENT]: true
                },
                type: TYPE.BOOLEAN
            },
            [FIELD.EXEMPTION_DETAILS]: {
                title: 'lang_exemption_detail',
                rules: {
                    required: true,
                    max: 255
                },
                condition: {
                    [FIELD.AUSTRALIAN_TAX_RESIDENT]: true,
                    [FIELD.TFN_EXEMPTION]: true
                },
                options: OPTIONS.EXEMPTION_DETAILS[accountType || ACCOUNT_TYPE.INDIVIDUAL],
                type: TYPE.DROPDOWN,
                align: 'right'
            },
            group2: {
                title: 'lang_verification_documents',
                subTitle: 'lang_verification_documents_subtitle',
                type: TYPE.GROUP
            },
            governmentLabel: {
                type: TYPE.LABEL_EMPTY,
                title: 'lang_government_id'
            },
            [FIELD.GOVERNMENT_ID]: {
                type: TYPE.ARRAY,
                items: {
                    type: TYPE.OBJECT,
                    properties: {
                        [FIELD.GOVERNMENT_ID_TYPE]: {
                            title: 'lang_government_id_type',
                            titleClass: 'text-normal',
                            help: 'lang_government_id_type_helptext',
                            options: OPTIONS.GOVERNMENT_ID_TYPE,
                            type: TYPE.DROPDOWN,
                            align: 'right',
                            rules: {
                                required: function (data, rootData) {
                                    if (rootData['uploaded_documents'] && rootData['uploaded_documents'][0] && rootData['uploaded_documents'][0]['document_type']) return false;
                                    return true;
                                }
                            },
                            note: 'lang_goverment_id_type_note'
                        },
                        [FIELD.STATE_OF_ISSUE]: {
                            title: 'lang_state_of_issue',
                            condition: {
                                [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.DRIVER_LICENSE
                            },
                            options: OPTIONS.STATE_OF_ISSUE,
                            type: TYPE.DROPDOWN,
                            align: 'right',
                            rules: {
                                required: function (data) {
                                    return data[FIELD.GOVERNMENT_ID_TYPE]
                                }
                            }
                        },
                        [FIELD.FIRST_NAME_ON_CARD]: {
                            title: 'lang_first_name_on_card',
                            help: 'lang_government_id_info_helptext',
                            condition: {
                                [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT]
                            },
                            type: TYPE.STRING,
                            align: 'right',
                            rules: {
                                only_text_and_special_characters: true,
                                first_name_middle_name_lenght: (data) => {
                                    if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) {
                                        return 30
                                    } else return ''
                                },
                                between: (data) => {
                                    if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.DRIVER_LICENSE) {
                                        return '1,20'
                                    } else return ''
                                }
                            }
                        },
                        [FIELD.MIDDLE_NAME_ON_CARD]: {
                            title: 'lang_middle_name_on_card',
                            help: 'lang_government_id_info_helptext',
                            condition: {
                                [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT]
                            },
                            type: TYPE.STRING,
                            align: 'right',
                            rules: {
                                only_text_and_special_characters: true,
                                first_name_middle_name_lenght: (data) => {
                                    if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) {
                                        return 30
                                    } else return ''
                                },
                                between: (data) => {
                                    if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.DRIVER_LICENSE) {
                                        return '1,20'
                                    } else return ''
                                }
                            }
                        },
                        [FIELD.LAST_NAME_ON_CARD]: {
                            title: 'lang_last_name_on_card',
                            condition: {
                                [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT]
                            },
                            type: TYPE.STRING,
                            align: 'right',
                            rules: {
                                required: function (data) {
                                    return data[FIELD.GOVERNMENT_ID_TYPE]
                                },
                                between: (data) => {
                                    if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) {
                                        return '1,31'
                                    } else if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.DRIVER_LICENSE) {
                                        return '1,40'
                                    } else return ''
                                },
                                only_text_and_special_characters: true
                            }
                        },
                        [FIELD.GOVERNMENT_ID_NUMBER]: {
                            title: 'lang_government_id_number',
                            titleClass: 'text-normal',
                            condition: {
                                [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT, GOVERNMENT_ID_TYPE.MEDICARE_CARD]
                            },
                            type: TYPE.STRING,
                            rules: {
                                between: (data) => {
                                    if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) {
                                        return '8,9'
                                    } else if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.DRIVER_LICENSE) {
                                        return '1,10'
                                    } else return '1,10'
                                },
                                required: function (data) {
                                    return data[FIELD.GOVERNMENT_ID_TYPE]
                                },
                                passport: true,
                                medicare: true,
                                drive_license: true
                            }
                        },
                        [FIELD.INDIVIDUAL_REFERENCE_NUMBER]: {
                            title: 'lang_individual_reference_number',
                            condition: {
                                [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD
                            },
                            type: TYPE.NUMBER,
                            rules: {
                                required: function (data) {
                                    return data[FIELD.GOVERNMENT_ID_TYPE]
                                },
                                number: true,
                                max: 1
                            }
                        },
                        [FIELD.MEDICARE_NAME_ON_CARD]: {
                            title: 'lang_name_on_card',
                            condition: {
                                [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD
                            },
                            type: TYPE.STRING,
                            rules: {
                                required: function (data) {
                                    return data[FIELD.GOVERNMENT_ID_TYPE]
                                },
                                max: 27,
                                special_characters: true
                            }
                        },
                        [FIELD.CARD_COLOUR]: {
                            title: 'lang_card_colour',
                            condition: {
                                [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD
                            },
                            options: OPTIONS.MEDICARE_CARD_COLOUR,
                            type: TYPE.DROPDOWN,
                            align: 'right',
                            rules: {
                                required: function (data) {
                                    return data[FIELD.GOVERNMENT_ID_TYPE]
                                }
                            }
                        },
                        [FIELD.CARD_EXPIRY_DATE]: {
                            title: 'lang_card_expiry_date',
                            condition: {
                                [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD
                            },
                            limit: 0,
                            type: TYPE.DATE_PICKER,
                            errorText: 'lang_your_card_is_expired',
                            rules: {
                                required: function (data) {
                                    return data[FIELD.GOVERNMENT_ID_TYPE]
                                },
                                date: true
                            }
                        }
                        // [FIELD.PASSPORT_PHOTO]: {
                        //     title: 'lang_upload_photo_of_passport',
                        //     align: 'right',
                        //     placeholder: 'Select File (PNG, JPG or PDF)',
                        //     placeholderRight: true,
                        //     condition: { [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.PASSPORT] },
                        //     type: TYPE.INPUT_FILE,
                        //     rules: {
                        //         maxSize: 25,
                        //         fileType: 'image photo'
                        //     }
                        // },
                        // [FIELD.DRIVER_LICENSE_PHOTO_FRONT]: {
                        //     title: 'lang_upload_photo_front',
                        //     align: 'right',
                        //     placeholder: 'Select File (PNG, JPG or PDF)',
                        //     placeholderRight: true,
                        //     condition: { [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE] },
                        //     type: TYPE.INPUT_FILE,
                        //     rules: {
                        //         maxSize: 25,
                        //         fileType: 'image photo',
                        //         required: (data) => {
                        //             return data[FIELD.DRIVER_LICENSE_PHOTO_BACk]
                        //         }
                        //     }
                        // },
                        // [FIELD.DRIVER_LICENSE_PHOTO_BACK]: {
                        //     title: 'lang_upload_photo_back',
                        //     align: 'right',
                        //     placeholder: 'Select File (PNG, JPG or PDF)',
                        //     placeholderRight: true,
                        //     condition: { [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE] },
                        //     type: TYPE.INPUT_FILE,
                        //     rules: {
                        //         maxSize: 25,
                        //         fileType: 'image photo',
                        //         required: (data) => {
                        //             return data[FIELD.DRIVER_LICENSE_PHOTO_FRONT]
                        //         }
                        //     }
                        // }
                    }
                }
            },
            divide: {
                type: TYPE.DIVIDE,
                title: ' '
            },
            documentLabel: {
                type: TYPE.LABEL_EMPTY,
                title: 'lang_document'
            },
            [FIELD.UPLOADED_DOCUMENTS]: {
                type: TYPE.ARRAY,
                items: {
                    type: TYPE.OBJECT,
                    properties: {
                        document_type: {
                            title: 'lang_type_of_document',
                            titleClass: 'text-normal',
                            type: TYPE.DROPDOWN,
                            align: 'right',
                            options: OPTIONS.DOCUMENT_UPLOAD,
                            rules: {
                                required: function (data, rootData) {
                                    if (rootData[FIELD.GOVERNMENT_ID] && rootData[FIELD.GOVERNMENT_ID][0] && rootData[FIELD.GOVERNMENT_ID][0][FIELD.GOVERNMENT_ID_TYPE]) return false;
                                    return true;
                                }
                            }
                        },
                        document_data: {
                            title: 'lang_select_document_to_upload',
                            titleClass: 'text-normal',
                            help: 'lang_select_document_to_upload_helptext',
                            type: TYPE.INPUT_FILE,
                            placeholder: 'Select File (PNG, JPG or PDF)',
                            placeholderRight: true,
                            follow: 'document_type',
                            rules: {
                                required: function (data) {
                                    return data.document_type && data[FIELD.GOVERNMENT_ID_TYPE]
                                }
                            }
                        }
                    }
                }
            },
            group3: {
                title: 'lang_residential_address',
                subTitle: 'lang_residential_address_subtitle',
                type: TYPE.GROUP
            },
            [FIELD.RESIDENTIAL_ADDRESS_COUNTRY]: {
                title: 'lang_country',
                rules: {
                    required: true
                },
                help: 'lang_select_country_helptext',
                options: countryOptions,
                translate: false,
                type: TYPE.DROPDOWN,
                align: 'right',
                disable: true,
                defaultValue: 'AUSTRALIA'
            },
            [FIELD.RESIDENTIAL_ADDRESS_FULL_ADDRESS]: {
                title: 'lang_address',
                rules: {
                    required: true,
                    max: 80
                },
                help: 'lang_select_resident_address_helptext',
                prefix: 'residential_address_',
                type: TYPE.AUTOCOMPLETE
            },
            group4: {
                title: 'lang_postal_address',
                type: TYPE.GROUP
            },
            [FIELD.SAME_AS_RA]: {
                title: ' ',
                subTitle: 'lang_same_as_resident_address',
                type: TYPE.BOOLEAN
            },
            [FIELD.POSTAL_ADDRESS_COUNTRY]: {
                title: 'lang_country',
                rules: {
                    required: true
                },
                help: 'lang_select_country_helptext',
                options: countryOptions,
                translate: false,
                type: TYPE.DROPDOWN,
                align: 'right',
                disable: true,
                defaultValue: 'AUSTRALIA',
                condition: {
                    [FIELD.SAME_AS_RA]: false
                }
            },
            [FIELD.POSTAL_ADDRESS_FULL_ADDRESS]: {
                title: 'lang_address',
                rules: {
                    required: true,
                    max: 80
                },
                help: 'lang_select_postal_address_helptext',
                prefix: 'postal_address_',
                type: TYPE.AUTOCOMPLETE,
                condition: {
                    [FIELD.SAME_AS_RA]: false
                }
            },
            group5: {
                title: 'lang_contact_details',
                type: TYPE.GROUP
            },
            [FIELD.APPLICANT_HOME_PHONE]: {
                title: 'lang_home_phone',
                rules: {
                    phone: true
                },
                type: TYPE.CALLING_CODE
            },
            [FIELD.APPLICANT_WORK_PHONE]: {
                title: 'lang_work_phone',
                rules: {
                    phone: true
                },
                type: TYPE.CALLING_CODE
            },
            [FIELD.APPLICANT_FAX_PHONE]: {
                title: 'lang_fax',
                placeholder: 'Fax',
                rules: {
                    phone: true
                },
                type: TYPE.CALLING_CODE
            },
            [FIELD.APPLICANT_MOBILE_PHONE]: {
                title: 'lang_mobile_phone',
                rules: {
                    phone: true,
                    calling_code_required: true
                },
                type: TYPE.CALLING_CODE,
                note: 'lang_mobile_note'
            },
            [FIELD.APPLICANT_EMAIL]: {
                title: 'lang_email_address',
                rules: {
                    required: true,
                    email: true,
                    max: 80
                },
                type: TYPE.STRING,
                note: 'lang_email_note'
            },
            [FIELD.IS_ACCEPTED]: {
                title: 'lang_is_accepted',
                type: TYPE.TERM,
                showError: false,
                rules: {
                    required: true
                }
            }
        }
    }
    return schema
}
export default class ApplicantDetails extends React.Component {
    constructor(props) {
        super(props)
        this.documentType = props.data.applicant_details[this.props.index][FIELD.UPLOADED_DOCUMENTS] &&
            props.data.applicant_details[this.props.index][FIELD.UPLOADED_DOCUMENTS][0] &&
            props.data.applicant_details[this.props.index][FIELD.UPLOADED_DOCUMENTS][0][FIELD.DOCUMENT_TYPE]
        this.occupationType = props.data.applicant_details[this.props.index][FIELD.OCCUPATION_TYPE]
        this.cardColour = props.data.applicant_details[this.props.index] && props.data.applicant_details[this.props.index][FIELD.GOVERNMENT_ID] &&
            props.data.applicant_details[this.props.index][FIELD.GOVERNMENT_ID][0] && props.data.applicant_details[this.props.index][FIELD.GOVERNMENT_ID][0][FIELD.CARD_COLOUR]
    }

    onChange = (data, errorCount) => {
        let occupationCategory
        if (data[FIELD.OCCUPATION_TYPE] !== this.occupationType) {
            this.occupationType = data[FIELD.OCCUPATION_TYPE]
            const occupationType = this.props.data.applicant_details[this.props.index][FIELD.OCCUPATION_TYPE]
            occupationCategory = OPTIONS.OCCUPATION_CATEGORY[occupationType || OCCUPATION_TYPE.BUSINESS_OWNER][0].value
            this.props.data.applicant_details[this.props.index][FIELD.OCCUPATION_CATEGORY] = occupationCategory
            this.setSchema && this.setSchema(getInitialSchema(this.props, occupationType))
        }
        if (data[FIELD.GOVERNMENT_ID] && data[FIELD.GOVERNMENT_ID][0] && data[FIELD.GOVERNMENT_ID][0][FIELD.CARD_COLOUR] !== this.cardColour) {
            if (this.cardColour === CARD_COLOUR.GREEN || data[FIELD.GOVERNMENT_ID][0][FIELD.CARD_COLOUR] === CARD_COLOUR.GREEN) {
                data[FIELD.GOVERNMENT_ID][0][FIELD.CARD_EXPIRY_DATE] = ''
            }
            this.cardColour = data[FIELD.GOVERNMENT_ID][0][FIELD.CARD_COLOUR]
        }
        Object.assign(this.props.data.applicant_details[this.props.index], data);
        this.props.onChange(this.props.data, errorCount)
    }
    renderTopInfo = () => {
        return (
            <React.Fragment>
                <div style={{ fontSize: 'var(--size-4)', margin: '16px 0px' }}><Lang>lang_applicant_detail_produce_line_1</Lang></div>
                <div style={{ fontSize: 'var(--size-4)', margin: '16px 0px' }}>{translateByEnvVariable('lang_applicant_detail_produce_line_2', 'lang_config_product_name', 'productName')}</div>
                <div style={{
                    borderRadius: '4px',
                    border: '1px solid var(--ascend-default)',
                    padding: '8px 16px',
                    margin: '16px 0px',
                    background: 'var(--ascend-default)',
                    color: 'var(--color-white)'
                }}>
                    <div style={{ fontSize: 'var(--size-5)' }}>Important</div>
                    <div style={{ fontSize: 'var(--size-4)', margin: '8px 0px 0px' }}><Lang>lang_please_make_sure_add_government</Lang></div>
                </div>
                <div style={{ fontSize: 'var(--size-4)', margin: '16px 0px' }}>{translateByEnvVariable('lang_please_call_note', 'lang_config_product_name', 'productName')}</div>
                <div style={{ fontSize: 'var(--size-4)', margin: '16px 0px' }}> <span style={{ color: 'var(--semantic-danger)' }}>*</span><span className='text-capitalize'>&nbsp;<Lang>lang_require_symbol</Lang></span></div>
            </React.Fragment >
        )
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps && nextProps.index !== this.props.index) {
            const occupationType = nextProps.data.applicant_details[nextProps.index][FIELD.OCCUPATION_TYPE]
            this.setSchema && this.setSchema(getInitialSchema(nextProps, occupationType))
            const obj = nextProps.data.applicant_details[this.props.index]
            if (obj) {
                Object.keys(obj).forEach(key => {
                    if (nextProps.data.applicant_details[nextProps.index][key] === undefined) {
                        nextProps.data.applicant_details[nextProps.index][key] = null
                    }
                })
            }
            this.setData && this.setData(nextProps.data.applicant_details[nextProps.index] || {})
        }
    }

    render() {
        const occupationType = this.props.data.applicant_details[this.props.index][FIELD.OCCUPATION_TYPE]
        return <div>
            {this.renderTopInfo()}
            <Form
                onChange={this.onChange}
                data={this.props.data.applicant_details[this.props.index] || {}}
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
                schema={getInitialSchema(this.props, occupationType)}
                onKeyPress={this.handleKeyPress}
                marginForm={this.props.marginForm}
                alignRight={true}
            />
        </div>
    }
    componentDidMount() {
        this.setEditMode && this.setEditMode(true)
        this.props.callBackFn && this.props.callBackFn(this.getData)
    }
}
