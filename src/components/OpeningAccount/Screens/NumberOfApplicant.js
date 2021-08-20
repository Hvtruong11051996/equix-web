import React from 'react'
import Lang from '../../Inc/Lang'
import { FIELD, MAPPING_ACCOUNT_TYPE, OPTIONS, ACCOUNT_TYPE, RELATIONSHIP_TYPE } from '../constant'
import Form, { TYPE } from '../../Inc/Form'
import { clone, translateByEnvVariable } from '../../../helper/functionUtils'
import s from '../OpeningAccount.module.css'

const getSchema = (accountType) => {
    return {
        type: TYPE.OBJECT,
        properties: {
            [FIELD.APPLICANT_DETAILS]: {
                type: TYPE.ARRAY,
                items: {
                    type: 'object',
                    properties: {
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
                            type: TYPE.STRING
                        },
                        [FIELD.MIDDLE_NAME]: {
                            title: 'lang_middle_name',
                            rules: {
                                max: 50
                            },
                            type: TYPE.STRING
                        },
                        [FIELD.LAST_NAME]: {
                            title: 'lang_last_name',
                            rules: {
                                required: true,
                                max: 100
                            },
                            type: TYPE.STRING
                        },
                        [FIELD.RELATIONSHIP_TYPE]: {
                            title: 'lang_relationship_type',
                            rules: {
                                required: true
                            },
                            help: 'lang_relationship_type_helptext',
                            options: OPTIONS.RELATIONSHIP_TYPE[accountType],
                            multiSelect: true,
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
                        }
                    }
                }
            }
        }
    }
}

export default class NumberOfApplicant extends React.Component {
    onChange = (data, errorCount) => {
        this.props.onChange(data, errorCount)
    }
    addItem = () => {
        const data = this.getDefaultData();
        let curData = clone(data.applicant_details)
        curData.push({})
        data.applicant_details = curData;
        this.setData(data);
        this.forceUpdate()
    }
    removeItem = () => {
        const data = this.getDefaultData();
        if (data.applicant_details.length > 1) {
            let curData = clone(data.applicant_details)
            curData.pop()
            // data.applicant_details.splice(data.applicant_details.length - 1, 1);
            data.applicant_details = curData;
            this.setData(data);
            this.forceUpdate()
        }
    }
    renderTopInfo = () => {
        return (
            <React.Fragment>
                <div style={{ fontSize: 'var(--size-4)', margin: '16px 0px 0px' }}>Please provide the full names of all individuals applying for the account(s) below.</div>
                <div style={{ fontSize: 'var(--size-4)', margin: '16px 0px' }}>{translateByEnvVariable('lang_please_call_note', 'lang_config_support_phone', 'supportPhone')} </div>
                <div style={{ fontSize: 'var(--size-4)', margin: '16px 0px' }}> <span style={{ color: 'var(--semantic-danger)' }}>*</span><span className='text-capitalize'>&nbsp;<Lang>lang_require_symbol</Lang></span></div>
            </React.Fragment >
        )
    }
    render() {
        const minCount = this.props.data[FIELD.ACCOUNT_TYPE] === ACCOUNT_TYPE.JOINT ? 2 : 1
        const maxCount = 4
        const isHaveRemoveBtn = this.props.data[FIELD.APPLICANT_DETAILS].length > minCount
        const isHaveAddBtn = this.props.data[FIELD.APPLICANT_DETAILS].length < maxCount
        const addBtn = MAPPING_ACCOUNT_TYPE[this.props.data[FIELD.ACCOUNT_TYPE]].ADD_BUTTON
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
                schema={getSchema(this.props.data[FIELD.ACCOUNT_TYPE])}
                onKeyPress={this.handleKeyPress}
                marginForm={this.props.marginForm}
            />
            <div className={s.divider}></div>
            <div className={s.btnAddRemove}>
                {
                    isHaveAddBtn ? <div onClick={this.addItem} className={s.contentButton + ' ' + 'text-capitalize'}>
                        <Lang>{addBtn}</Lang>
                    </div> : null
                }
                {
                    isHaveRemoveBtn ? <div onClick={this.removeItem} className={s.contentButton + ' ' + 'text-capitalize'}>
                        <Lang>{MAPPING_ACCOUNT_TYPE[this.props.data[FIELD.ACCOUNT_TYPE]].REMOVE_BUTTON}</Lang>
                    </div> : null
                }
            </div>
        </div>
    }
    componentDidMount() {
        this.setEditMode && this.setEditMode(true)
        this.props.callBackFn && this.props.callBackFn(this.getData)
        // if (this.props.data.account_type === ACCOUNT_TYPE.JOINT) {
        //     this.addItem();
        // }
    }
}
