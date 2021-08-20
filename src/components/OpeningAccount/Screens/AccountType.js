import React, { useReducer, useRef, useEffect } from 'react';
import Lang from '../../Inc/Lang/Lang'
import logger from '../../../helper/log'
import { putData, getData, getDataBranch, enumBranch, editBranch, getUrlOrgBranchAdvisor, getUrlOrgBranAdv } from '../../../helper/request';
import { FIELD, CMA, OPTIONS, ACCOUNT_TYPE } from '../constant'
import Form, { TYPE } from '../../Inc/Form/Form'
import { clone, capitalizer, translateByEnvVariable } from '../../../helper/functionUtils'
import { map } from 'jquery';
import label from '../../Inc/CanvasGrid/Type/label';
import dataStorage from '../../../dataStorage'
import userTypeEnum from '../../../constants/user_type_enum';

const defaultOptions = { label: 'Please Select', value: null }
const defaultOptionsNoTrans = { label: 'Please Select', value: null }
const optionsDefault = {
    vettingRules: [defaultOptions],
    schedules: [defaultOptions],
    organizationCode: [defaultOptions],
    branchCode: {},
    advisorCode: {}
}

const getSchema = (options = {}, data = {}) => {
    let lastPart = {}
    const keyOptionsBranch = `${data[FIELD.ORGANIZATION_CODE]}`
    const keyOptionsAdvisor = `${data[FIELD.ORGANIZATION_CODE]}_${data[FIELD.BRANCH_CODE]}`
    if ([userTypeEnum.OPERATOR, userTypeEnum.ADVISOR].includes(dataStorage.userInfo.user_type)) {
        lastPart = {
            advisor_operator_settings: {
                type: TYPE.GROUP,
                title: 'lang_advisor_operator_settings',
                titleClass: 'text-normal'
            },
            [FIELD.SEND_REGISTRATION_EMAIL]: {
                type: TYPE.BOOLEAN,
                title: 'lang_send_registration_email'
            },
            [FIELD.ORGANIZATION_CODE]: {
                title: 'lang_organization',
                type: TYPE.DROPDOWN,
                align: 'right',
                options: options.organizationCode || [defaultOptions]
            },
            [FIELD.BRANCH_CODE]: {
                title: 'lang_branch',
                type: TYPE.DROPDOWN,
                align: 'right',
                options: (options.branchCode && options.branchCode[keyOptionsBranch]) || [defaultOptions],
                rules: {
                    required: true
                },
                condition: {
                    [FIELD.ORGANIZATION_CODE]: options.organizations
                }
            }
        }
        if (options.advisorCode && options.advisorCode[keyOptionsAdvisor]) {
            lastPart = {
                ...lastPart,
                [FIELD.ADVISOR_CODE]: {
                    title: 'lang_advisor',
                    type: TYPE.DROPDOWN,
                    align: 'right',
                    options: (options.advisorCode && options.advisorCode[keyOptionsAdvisor]) || [defaultOptions],
                    rules: {
                        required: true
                    },
                    condition: {
                        [FIELD.ORGANIZATION_CODE]: options.organizations
                    }
                }
            }
        }
        lastPart = {
            ...lastPart,
            [FIELD.VETTING_RULES]: {
                title: 'lang_vetting_rules_group',
                type: TYPE.DROPDOWN,
                align: 'right',
                translate: false,
                options: options.vettingRules || [defaultOptions],
                rules: {
                    required: true
                }
            },
            [FIELD.SCHEDULE_CODE]: {
                title: 'lang_equity_brokerage_schedule',
                type: dataStorage.env_config.roles.searchSchedule ? TYPE.SEARCHLOCAL : TYPE.DROPDOWN,
                translate: false,
                align: 'right',
                options: options.schedules || [defaultOptionsNoTrans],
                rules: {
                    required: true
                }
            }
        }
    }
    const optionsAccountType = clone(OPTIONS.ACCOUNT_TYPE)
    if (dataStorage.env_config.roles.onlyIndividual) optionsAccountType.length = 1
    return {
        type: TYPE.OBJECT,
        properties: {
            account_type_question: {
                type: TYPE.GROUP,
                title: 'lang_account_type_question',
                titleClass: 'text-normal'
            },
            [FIELD.ACCOUNT_TYPE]: {
                type: TYPE.DROPDOWN,
                align: 'right',
                replaceHelpText: 'supportPhone',
                replaceHelpKey: 'lang_config_support_phone',
                help: 'lang_select_account_type_helptext',
                title: 'lang_account_type',
                rules: {
                    required: true
                },
                options: optionsAccountType
            },
            cma_question: {
                type: TYPE.GROUP,
                titleClass: 'text-normal',
                title: 'lang_cma_question'
            },
            [FIELD.CMA]: {
                type: TYPE.DROPDOWN,
                align: 'right',
                title: 'lang_CMA',
                titleClass: 'text-normal',
                rules: {
                    required: true
                },
                options: OPTIONS.CMA,
                note: (value) => {
                    if (value === true) {
                        return 'lang_cma_note_true'
                    } else if (value === false) {
                        return 'lang_cma_note_false'
                    }
                    return 'lang_cma_note'
                }
            },
            [FIELD.CMA_SOURCE_OF_FUNDS]: {
                type: TYPE.DROPDOWN,
                align: 'right',
                rules: {
                    required: true
                },
                title: 'lang_source_of_funds',
                help: 'lang_source_of_funds_helptext',
                options: OPTIONS.CMA_SOURCE_OF_FUNDS
            },
            [FIELD.CMA_SOURCE_OF_FUNDS_DESC]: {
                type: TYPE.STRING,
                title: 'lang_source_of_funds_description',
                rules: {
                    required: true,
                    max: 255
                },
                condition: {
                    [FIELD.CMA_SOURCE_OF_FUNDS]: 'OTHER'
                }
            },
            [FIELD.CMA_ACCOUNT_PURPOSE]: {
                type: TYPE.DROPDOWN,
                align: 'right',
                rules: {
                    required: true
                },
                title: 'lang_account_purpose',
                help: 'lang_account_purpose_helptext',
                options: OPTIONS.CMA_ACCOUNT_PURPOSE
            },
            [FIELD.CMA_ACCOUNT_PURPOSE_DESC]: {
                type: TYPE.STRING,
                title: 'lang_account_purpose_description',
                rules: {
                    required: true,
                    max: 255
                },
                condition: {
                    [FIELD.CMA_ACCOUNT_PURPOSE]: 'OTHER'
                }
            },
            ...lastPart
        }
    }
}

class AccountType extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        this[FIELD.ORGANIZATION_CODE] = null
        this[FIELD.BRANCH_CODE] = null
        this.options = {
            ...clone(optionsDefault),
            organizations: []
        }
    }

    onChange = (data, errorCount) => {
        if (data[FIELD.ORGANIZATION_CODE] !== this[FIELD.ORGANIZATION_CODE]) {
            this[FIELD.ORGANIZATION_CODE] = data[FIELD.ORGANIZATION_CODE]
            if (this.options.branchCode[data[FIELD.ORGANIZATION_CODE]]) {
                data[FIELD.BRANCH_CODE] = this.options.branchCode[data[FIELD.ORGANIZATION_CODE]][1].value
            }
            this[FIELD.BRANCH_CODE] = data[FIELD.BRANCH_CODE]
            if (this.options.advisorCode[`${data[FIELD.ORGANIZATION_CODE]}_${data[FIELD.BRANCH_CODE]}`]) {
                data[FIELD.ADVISOR_CODE] = this.options.advisorCode[`${data[FIELD.ORGANIZATION_CODE]}_${data[FIELD.BRANCH_CODE]}`][1].value
            }
            const newSchema = getSchema(this.options, this.props.data)
            this.setSchema && this.setSchema(newSchema)
            this.props.onChange && this.props.onChange(data, errorCount)
            return
        }
        if (data[FIELD.BRANCH_CODE] !== this[FIELD.BRANCH_CODE]) {
            this[FIELD.BRANCH_CODE] = data[FIELD.BRANCH_CODE]
            if (this.options.advisorCode[`${data[FIELD.ORGANIZATION_CODE]}_${data[FIELD.BRANCH_CODE]}`]) {
                data[FIELD.ADVISOR_CODE] = this.options.advisorCode[`${data[FIELD.ORGANIZATION_CODE]}_${data[FIELD.BRANCH_CODE]}`][1].value
            }
            const newSchema = getSchema(this.options, this.props.data)
            this.setSchema && this.setSchema(newSchema)
        }
        this.props.onChange && this.props.onChange(data, errorCount)
    }

    componentDidMount() {
        this.setEditMode && this.setEditMode(true)
        this.props.callBackFn && this.props.callBackFn(this.getData)
        if (![userTypeEnum.OPERATOR, userTypeEnum.ADVISOR].includes(dataStorage.userInfo.user_type)) return
        this.options = {
            ...clone(optionsDefault),
            organizations: []
        }
        const listPromise = []
        let urlAllBranch = getDataBranch();
        let urlUrlOrgBranchAdvisor = getUrlOrgBranAdv('all');
        listPromise.push(this.createPromise(urlAllBranch))
        listPromise.push(this.createPromise(urlUrlOrgBranchAdvisor))
        if (listPromise.length) {
            Promise.all(listPromise).then(res => {
                if (res[0] && res[0].data && res[0].data.branch) {
                    const listVetting = res[0].data.branch || []
                    this.options.vettingRules = listVetting.reduce((acc, cur) => {
                        acc.push({ label: cur.branch_name, value: cur.branch_id })
                        return acc
                    }, [defaultOptions])
                }
                if (res[1] && res[1]) {
                    const listSchedule = res[1].Brokerage_Schedule_List || []
                    this.options.schedules = listSchedule.reduce((acc, cur) => {
                        acc.push({ label: cur.Schedule_Description, value: cur.Schedule_Code })
                        return acc
                    }, [defaultOptionsNoTrans])
                    const treeObj = res[1].Organization_Matrix || {}
                    Object.keys(treeObj).map(organizationCode => {
                        this.options.organizations.push(organizationCode)
                        this.options.organizationCode.push({ label: capitalizer(organizationCode), value: organizationCode })
                        this.options.branchCode[organizationCode] = [defaultOptions]
                        treeObj[organizationCode].branch_code && treeObj[organizationCode].branch_code.map(branch => {
                            this.options.branchCode[organizationCode].push({ label: capitalizer(branch.name), value: branch.code })
                            if (branch && branch.advisor_code) {
                                this.options.advisorCode[`${organizationCode}_${branch.code}`] = [defaultOptions]
                                branch.advisor_code.map(advisor => {
                                    this.options.advisorCode[`${organizationCode}_${branch.code}`].push({ label: capitalizer(advisor.name), value: advisor.code })
                                })
                            }
                        })
                    })
                }
                const newSchema = getSchema(this.options, this.props.data)
                this.setSchema && this.setSchema(newSchema)
            })
        }
    }

    createPromise(url) {
        return new Promise((resolve) => {
            getData(url).then(res => {
                resolve(res.data || [])
            }).catch(error => {
                console.error(`createPromise ${url} error`)
                resolve([])
            })
        })
    }

    renderTopInfo = () => {
        return (
            <React.Fragment>
                <div style={{
                    borderRadius: '4px',
                    border: '1px solid var(--ascend-default)',
                    padding: '8px 16px',
                    margin: '8px 0px',
                    background: 'var(--ascend-default)',
                    color: 'var(--color-white)'
                }}>
                    <div style={{ fontSize: 'var(--size-5)' }}>Important</div>
                    <div style={{ fontSize: 'var(--size-4)', margin: '8px 0px 0px' }}>All applicants must declare they are in Australia at the time of application and only Australian addresses will be accepted.</div>
                </div>
                <div style={{ fontSize: 'var(--size-4)', margin: '8px 0px' }}>{translateByEnvVariable('lang_please_call_note', 'lang_config_support_phone', 'supportPhone')}</div>
                <div style={{ fontSize: 'var(--size-4)', margin: '8px 0px' }}> <span style={{ color: 'var(--semantic-danger)' }}>*</span><span className='text-capitalize'>&nbsp;<Lang>lang_require_symbol</Lang></span></div>
            </React.Fragment >
        )
    }

    renderForm = () => {
        return <Form
            {...this.props}
            onChange={this.onChange}
            fn={fn => {
                this.setEditMode = fn.setEditMode
                this.getData = fn.getData
                this.setSchema = fn.setSchema
                this.setData = fn.setData
            }}
            schema={getSchema(this.options, this.props.data)}
        />
    }

    render() {
        return <div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'column' }}>
            {this.renderTopInfo()}
            {this.renderForm()}
        </div>
    }
}
export default AccountType
