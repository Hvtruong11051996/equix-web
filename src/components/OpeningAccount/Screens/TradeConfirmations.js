import React, { useState, useRef, useEffect } from 'react'
import Lang from '../../Inc/Lang/Lang'
import Form, { TYPE } from '../../Inc/Form/Form'
import { FIELD, METHOD, OPTIONS } from '../constant'
import s from '../OpeningAccount.module.css'
import countryOptions from '../../../constants/country_options'
import { translateByEnvVariable } from '../../../helper/functionUtils'

const FORM_STUCTURE = {
    type: TYPE.OBJECT,
    properties: {
        [FIELD.TRADE_CONFIRMATIONS]: {
            type: TYPE.ARRAY,
            items: {
                type: TYPE.OBJECT,
                properties: {
                    [FIELD.METHOD]: {
                        title: 'lang_method',
                        rules: {
                            required: true
                        },
                        options: OPTIONS.METHOD,
                        type: TYPE.DROPDOWN,
                        align: 'right'
                    },
                    [FIELD.EMAIL]: {
                        title: 'lang_email',
                        rules: {
                            required: true,
                            email: true,
                            max: 80
                        },
                        type: TYPE.STRING,
                        condition: {
                            [FIELD.METHOD]: METHOD.EMAIL
                        }
                    },
                    [FIELD.POSTAL_ADDRESS_COUNTRY]: {
                        title: 'lang_country',
                        rules: {
                            required: true
                        },
                        options: countryOptions,
                        translate: false,
                        type: TYPE.DROPDOWN,
                        align: 'right',
                        defaultValue: 'AUSTRALIA',
                        help: 'lang_select_country_helptext',
                        disable: true,
                        condition: {
                            [FIELD.METHOD]: METHOD.POSTAL
                        }
                    },
                    [FIELD.POSTAL_ADDRESS_FULL_ADDRESS]: {
                        title: 'lang_address',
                        rules: {
                            required: true,
                            max: 255
                        },
                        type: TYPE.AUTOCOMPLETE,
                        help: 'lang_address_helptext',
                        condition: {
                            [FIELD.METHOD]: METHOD.POSTAL
                        },
                        prefix: 'postal_address_'
                    },
                    [FIELD.CLIENT_ADDRESS]: {
                        title: 'lang_client_address',
                        titleClass: 'visible-hidden',
                        subTitle: 'lang_i_confirm_this_is_my_contact_address',
                        type: TYPE.BOOLEAN,
                        condition: {
                            [FIELD.METHOD]: [METHOD.POSTAL, METHOD.EMAIL]
                        },
                        rules: {
                            required: true
                        }
                    }
                }
            }
        }
    }
}

const TradeConfirmations = (props) => {
    const that = useRef({})
    const [reRender, setReRender] = useState(1)
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
                <div style={{ fontSize: 'var(--size-4)', margin: '8px 0px 0px' }}>You need at least 1 trade confirmation method. By default we will use your email. This is required for receiving contract notes. It will also be used for future account correspondence, such as payment confirmations. </div>
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
                that.current.getDefaultData = fn.getDefaultData
                that.current.setData = fn.setData
                that.current.getData = fn.getData
            }}
            schema={FORM_STUCTURE}
        />
    }

    const addItem = (e) => {
        const data = that.current.getDefaultData();
        data.trade_confirmations && data.trade_confirmations.push({});
        that.current.setData(data);
        setReRender(reRender + 1)
    }
    const removeItem = (e) => {
        const data = that.current.getDefaultData();
        if (data.trade_confirmations.length > 1) {
            data.trade_confirmations.splice(data.trade_confirmations.length - 1, 1);
            that.current.setData(data);
            setReRender(reRender + 1)
        }
    }

    const renderBtn = () => {
        const data = props.data || {};
        return <div className={s.btnAddRemove}>
            {
                !data.trade_confirmations || data.trade_confirmations.length > 9 ? null : <div onClick={addItem} className={s.contentButton}>Add Another Trade Confirmation</div>
            }
            {
                !data.trade_confirmations || data.trade_confirmations.length < 2 ? null : <div onClick={removeItem} className={s.contentButton}>Remove Last Trade Confirmation</div>
            }
        </div>
    }

    return <div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'column' }}>
        {renderTopInfo()}
        {renderForm()}
        <div className={s.divider}></div>
        {renderBtn()}
    </div>
}
export default TradeConfirmations
