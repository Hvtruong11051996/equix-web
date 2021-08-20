import React, { useRef, useEffect } from 'react'
import { FIELD, OPTIONS, ACCOUNT_TYPE } from '../constant'
import Lang from '../../Inc/Lang/Lang'
import Form, { TYPE } from '../../Inc/Form/Form'
import countryOptions from '../../../constants/country_options'
import { translateByEnvVariable } from '../../../helper/functionUtils'

const getSchema = (data) => {
    const accountType = data[FIELD.ACCOUNT_TYPE]
    return {
        type: TYPE.OBJECT,
        properties: {
            [FIELD.TRUST_NAME]: {
                type: TYPE.STRING,
                title: 'lang_trust_name',
                titleClass: 'text-normal',
                rules: {
                    required: true,
                    max: 200
                }
            },
            [FIELD.TRUST_ABN]: {
                type: TYPE.NUMBER,
                title: 'lang_abn',
                titleClass: 'text-normal',
                rules: {
                    number: true,
                    max: 11
                }
            },
            [FIELD.TRUST_TFN]: {
                type: TYPE.STRING,
                title: 'lang_tfn',
                titleClass: 'text-normal',
                note: 'lang_tfn_note',
                rules: {
                    number: true,
                    max: 9,
                    tfn: true
                },
                condition: {
                    [FIELD.TRUST_TAX_EXEMPTION]: false
                }
            },
            [FIELD.TRUST_TAX_EXEMPTION]: {
                type: TYPE.BOOLEAN,
                titleClass: 'text-normal',
                title: 'lang_tfn_exemption'
            },
            [FIELD.TRUST_TAX_EXEMPTION_DETAILS]: {
                type: TYPE.DROPDOWN,
                align: 'right',
                title: 'lang_exemption_detail',
                rules: {
                    required: true
                },
                options: OPTIONS.EXEMPTION_DETAILS[accountType || ACCOUNT_TYPE.INDIVIDUAL],
                condition: {
                    [FIELD.TRUST_TAX_EXEMPTION]: true
                }
            },
            [FIELD.TRUST_ASSET_SOURCE_DETAILS]: {
                type: TYPE.STRING,
                rules: {
                    required: true,
                    max: 255
                },
                title: 'lang_asset_source'
            },
            [FIELD.TRUST_ACTIVITY]: {
                type: TYPE.STRING,
                titleClass: 'text-normal',
                title: 'lang_trust_activity',
                rules: {
                    required: true,
                    max: 255
                },
                help: 'lang_trust_activity_helptext'
            },
            [FIELD.TRUST_COUNTRY_OF_ESTABLISHMENT]: {
                type: TYPE.DROPDOWN,
                align: 'right',
                title: 'lang_country_of_establishment',
                options: countryOptions,
                translate: false,
                help: 'lang_established_helptext',
                disable: true,
                defaultValue: 'AUSTRALIA'
            },
            [FIELD.TRUST_TYPE]: {
                type: TYPE.DROPDOWN,
                align: 'right',
                title: 'lang_trust_type',
                rules: {
                    required: true
                },
                options: OPTIONS.TRUST_TYPE
            }
        }
    }
}

const TrustDetails = (props) => {
    const that = useRef({})
    useEffect(() => {
        that.current.setEditMode && that.current.setEditMode(true)
        props.callBackFn && props.callBackFn(that.current.getData)
    }, [])
    const onChange = (data, errorCount) => {
        props.onChange && props.onChange(data, errorCount)
    }
    const renderTopInfo = () => {
        return (
            <React.Fragment>
                <div style={{ fontSize: 'var(--size-4)', margin: '8px 0px' }}>{translateByEnvVariable('lang_please_call_note', 'lang_config_support_phone', 'supportPhone')} </div>
                <div style={{ fontSize: 'var(--size-4)', margin: '8px 0px' }}> <span style={{ color: 'var(--semantic-danger)' }}>*</span><span className='text-capitalize'>&nbsp;<Lang>lang_require_symbol</Lang></span></div>
            </React.Fragment >
        )
    }
    const renderForm = () => {
        return <Form
            {...props}
            onChange={onChange}
            fn={fn => {
                that.current.setEditMode = fn.setEditMode
                that.current.getData = fn.getData
            }}
            schema={getSchema(props.data)}
        />
    }
    return <div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'column' }}>
        {renderTopInfo()}
        {renderForm()}
    </div>
}
export default TrustDetails
