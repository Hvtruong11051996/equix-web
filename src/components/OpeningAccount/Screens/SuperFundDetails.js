import React, { useRef, useEffect } from 'react'
import Lang from '../../Inc/Lang/Lang'
import { FIELD, OPTIONS, ACCOUNT_TYPE } from '../constant'
import Form, { TYPE } from '../../Inc/Form/Form'
import { translateByEnvVariable } from '../../../helper/functionUtils'

const getSchema = (data) => {
    const accountType = data[FIELD.ACCOUNT_TYPE]
    return {
        type: TYPE.OBJECT,
        properties: {
            [FIELD.SUPER_FUND_NAME]: {
                type: TYPE.STRING,
                title: 'lang_fund_name',
                rules: {
                    required: true,
                    max: 200
                }
            },
            [FIELD.SUPER_FUND_ABN]: {
                type: TYPE.NUMBER,
                title: 'lang_abn',
                titleClass: 'text-normal',
                rules: {
                    required: true,
                    number: true,
                    max: 11
                }
            },
            [FIELD.SUPER_FUND_TFN]: {
                type: TYPE.STRING,
                title: 'lang_tfn',
                titleClass: 'text-normal',
                note: 'lang_tfn_note',
                rules: {
                    max: 9,
                    number: true,
                    tfn: true
                },
                condition: {
                    [FIELD.SUPER_FUND_TAX_EXEMPTION]: false
                }
            },
            [FIELD.SUPER_FUND_TAX_EXEMPTION]: {
                type: TYPE.BOOLEAN,
                title: 'lang_tfn_exemption',
                titleClass: 'text-normal'
            },
            [FIELD.SUPER_FUND_TAX_EXEMPTION_DETAILS]: {
                type: TYPE.DROPDOWN,
                align: 'right',
                title: 'lang_exemption_detail',
                rules: {
                    required: true
                },
                options: OPTIONS.EXEMPTION_DETAILS[accountType || ACCOUNT_TYPE.INDIVIDUAL],
                condition: {
                    [FIELD.SUPER_FUND_TAX_EXEMPTION]: true
                }
            },
            [FIELD.SMSF]: {
                type: TYPE.BOOLEAN,
                title: 'lang_self_managed_super_fund'
            }
        }
    }
}

const SuperFundDetail = (props) => {
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
export default SuperFundDetail
