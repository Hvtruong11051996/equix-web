import React, { useRef, useEffect } from 'react'
import Lang from '../../Inc/Lang/Lang'
import { FIELD, OPTIONS } from '../constant'
import Form, { TYPE } from '../../Inc/Form/Form'
import Modal from '../../Inc/Modal'
import { translateByEnvVariable } from '../../../helper/functionUtils'

const FORM_STUCTURE = {
    type: TYPE.OBJECT,
    properties: {
        [FIELD.TITLE]: {
            type: TYPE.DROPDOWN,
            align: 'right',
            rules: {
                required: true
            },
            title: 'lang_title',
            options: OPTIONS.TITLE
        },
        [FIELD.FIRST_NAME]: {
            type: TYPE.STRING,
            title: 'lang_first_name',
            rules: {
                required: true,
                max: 50
            }
        },
        [FIELD.MIDDLE_NAME]: {
            type: TYPE.STRING,
            title: 'lang_middle_name',
            rules: {
                max: 50
            }
        },
        [FIELD.LAST_NAME]: {
            type: TYPE.STRING,
            title: 'lang_last_name',
            rules: {
                max: 100,
                required: true
            }
        },
        [FIELD.DOB]: {
            type: TYPE.DATE_PICKER,
            title: 'lang_date_of_birth',
            titleClass: 'text-normal',
            limit: -18,
            errorText: 'lang_over_18_years_old',
            rules: {
                required: true,
                date: true
            },
            help: 'lang_applicant_over_18_helptext'
        },
        [FIELD.APPLICANT_EMAIL]: {
            title: 'lang_email_address',
            type: TYPE.STRING,
            rules: {
                max: 80,
                required: true,
                email: true
            },
            help: 'lang_applicant_email_helptext'
        },
        [FIELD.APPLICANT_HOME_PHONE]: {
            type: TYPE.CALLING_CODE,
            title: 'lang_home_phone',
            rules: {
                phone: true
            }
        },
        [FIELD.APPLICANT_MOBILE_PHONE]: {
            type: TYPE.CALLING_CODE,
            title: 'lang_mobile_phone',
            rules: {
                phone: true,
                calling_code_required: true
            },
            note: 'lang_mobile_note'
        }
    }
}
const PrimaryApplicant = (props) => {
    const that = useRef({})
    useEffect(() => {
        that.current.setEditMode && that.current.setEditMode(true)
        props.callBackFn && props.callBackFn(that.current.getData)
    }, [])
    const onChange = (data, errorCount) => {
        Object.assign(props.data.applicant_details[0], data)
        props.onChange && props.onChange(props.data, errorCount)
    }
    const renderTopInfo = () => {
        return (
            <React.Fragment>
                <div style={{ fontSize: 'var(--size-4)', margin: '8px 0px 0px' }}>Provide a primary applicant for the account. The primary applicant must be an authorised signatory on your account(s) and only the primary applicant can modify the application.</div>
                <div style={{ fontSize: 'var(--size-4)', margin: '8px 0px' }}>{translateByEnvVariable('lang_please_call_note', 'lang_config_support_phone', 'supportPhone')} </div>
                <div style={{ fontSize: 'var(--size-4)', margin: '8px 0px' }}> <span style={{ color: 'var(--semantic-danger)' }}>*</span><span className='text-capitalize'>&nbsp;<Lang>lang_require_symbol</Lang></span></div>
            </React.Fragment >
        )
    }
    const renderForm = () => {
        return <Form
            {...props}
            data={(props.data.applicant_details && props.data.applicant_details[0]) || {}}
            onChange={onChange}
            fn={fn => {
                that.current.setEditMode = fn.setEditMode
                that.current.getData = fn.getData
                that.current.setData = fn.setData
            }}
            schema={FORM_STUCTURE}
        />
    }
    return <div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'column' }}>
        {renderTopInfo()}
        {renderForm()}
    </div>
}
export default PrimaryApplicant
