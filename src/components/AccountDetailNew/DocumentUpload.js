import React from 'react'
import Lang from '../Inc/Lang'
import s from './AccountDetail.module.css'
import SvgIcon, { path } from '../Inc/SvgIcon'
import Form, { TYPE } from '../Inc/Form'
import { FIELD, BUTTON, OPTIONS, METHOD, DOCUMENT_UPLOAD } from '../OpeningAccount/constant'
import dataStorage from '../../dataStorage'
import { getOpeningAccountUrl, putData } from '../../helper/request'
import Button, { buttonType } from '../Elements/Button/Button'
import { clone } from '../../helper/functionUtils'

const formStructure = (options, options2, documentDisable, applicantDisable) => {
    return {
        type: TYPE.OBJECT,
        properties: {
            applicant: {
                title: 'lang_applicant',
                type: TYPE.DROPDOWN,
                align: 'right',
                options: options,
                disable: applicantDisable,
                rules: {
                    required: true
                }
            },
            type_of_document: {
                title: 'lang_type_of_document',
                type: TYPE.DROPDOWN,
                align: 'right',
                options: options2,
                disable: documentDisable,
                rules: {
                    required: true
                }
            },
            select_document_to_update: {
                title: 'lang_select_document_to_upload',
                titleClass: 'text-normal',
                type: TYPE.INPUT_FILE,
                listAccept: documentDisable === 'EKYC_REPORT' ? 'application/pdf' : null,
                rules: {
                    required: true
                }
            }
        }
    }
}

const listButton = [BUTTON.SAVE_AND_UPLOAD, BUTTON.CANCEL]
export default class DocumentUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        this.data = props.data.data || props.data
        this.applicant = props.applicant || []
        this.aplicantOptions = []
        this.applicant_id = (props.applicant[0] || {}).applicant_id
        this.documentOptions = {}
        this.defaultOptions = [
            {
                label: 'EKYC REPORT',
                value: 'EKYC_REPORT'
            },
            {
                label: 'lang_telephone_bill',
                value: DOCUMENT_UPLOAD.TELEPHONE_BILL
            },
            {
                label: 'lang_electricity_gas_bill',
                value: DOCUMENT_UPLOAD.ELECTRICITY_GAS_BILL
            },
            {
                label: 'lang_water_bill',
                value: DOCUMENT_UPLOAD.WATER_BILL
            },
            {
                label: 'lang_council_rates_notice',
                value: DOCUMENT_UPLOAD.COUNCIL_RATES_NOTICE
            },
            {
                label: 'lang_bank_statement',
                value: DOCUMENT_UPLOAD.BANK_STATEMENT
            }
        ]
        this.createOptions();
    }

    createOptions = () => {
        this.applicant.forEach((x, i) => {
            this.aplicantOptions.push({ value: x.applicant_id, label: `${x.first_name} ${x.last_name}` })
            if (this.props.document) {
                this.documentOptions[x.applicant_id] = [this.defaultOptions.find(e => e.value === this.props.document)]
            } else {
                this.documentOptions[x.applicant_id] = clone(OPTIONS.DOCUMENT_UPLOAD)
                if (x.uploaded_documents) {
                    let findReject = x.uploaded_documents.findIndex(x => ['EKYC_REJECTED_ADMINS', 'EKYC_REJECTED'].includes(x.ekyc_document_status))
                    if (findReject > -1) {
                        this.documentOptions[x.applicant_id] = this.documentOptions[x.applicant_id].filter(v => v.value === x.uploaded_documents[findReject].document_type)
                    } else {
                        (x.uploaded_documents || []).forEach(v => {
                            if (['EKYC_VERIFIED_ADMINS', 'EQ_IN_PROGRESS_REJECT', 'EQ_IN_PROGRESS_APPROVE', 'EKYC_VERIFIED'].includes(v.ekyc_document_status)) {
                                this.documentOptions[x.applicant_id].splice(this.documentOptions[x.applicant_id].findIndex(val => val.value === v.document_type), 1)
                            }
                        })
                    }
                }
            }
        })
    }

    componentDidMount() {
        this.setEditMode && this.setEditMode(true)
    }
    onBtnClick = (btn) => {
        switch (btn) {
            case BUTTON.SAVE_AND_UPLOAD:
                this.onSubmit()
                break
            case BUTTON.CANCEL:
            default: this.props.close()
                break
        }
    }

    createDataUpload = (data) => {
        return {
            applicant_details: [
                {
                    applicant_id: data.applicant,
                    gbg_verification_id: (this.applicant.find(x => x.applicant_id === data.applicant) || {}).gbg_verification_id,
                    uploaded_documents: [
                        {
                            document_type: data.type_of_document,
                            document_data: data.select_document_to_update
                        }
                    ]
                }
            ]
        }
    }

    onSubmit = () => {
        const data = this.getData()
        const dataUpload = this.createDataUpload(data)
        if (data) {
            const url = getOpeningAccountUrl(`?equix_id=${this.data.equix_id}`)
            putData(url, dataUpload).then(res => {
                this.props.close()
            }).catch(error => {
            })
            // alert('ok')
        }
    }

    onChange = (data, err, val) => {
        if (val && val.data && val.name === 'applicant' && this.applicant_id !== val.data[val.name]) {
            this.applicant_id = val.data[val.name]
            this.forceUpdate()
        }
    }

    renderHeader() {
        return <div className={s.header} style={{ padding: '0 8px' }}>
            <div className={s.title + ' ' + 'showTitle' + ' ' + 'text-capitalize'} ><Lang>lang_document_upload</Lang></div>
            <div className={s.icon} onClick={() => this.props.close()}><SvgIcon path={path.mdiClose} /></div>
        </div>
    }
    renderContent() {
        return <div style={{ padding: '0 8px' }}><Form
            {...this.props}
            onChange={this.onChange}
            // marginForm={true}
            fn={fn => {
                this.setEditMode = fn.setEditMode
                this.getDefaultData = fn.getDefaultData
                this.setData = fn.setData
                this.getData = fn.getData
            }}
            schema={formStructure(this.aplicantOptions, this.documentOptions[this.applicant_id], this.props.document || this.documentOptions[this.applicant_id].length === 1, this.aplicantOptions.length === 1)}
        /></div>
    }
    renderButton() {
        return <div className={s.buttonGroup} style={{ padding: '8px 16px 16px' }}>
            {
                listButton.map((e, i) => {
                    return <Button type={[BUTTON.SAVE_AND_UPLOAD].includes(e) ? buttonType.ascend : ''} key={`button_item_${i}`} className={s.button}>
                        <div className={`${s.buttonContainer + ' ' + 'showTitle'}`} onClick={() => this.onBtnClick(e)}><Lang>{e}</Lang></div></Button>
                })
            }
        </div>
    }
    render() {
        return <div className={s.popup} style={{ minHeight: '41vh', width: '56vw' }}>
            {this.renderHeader()}
            <div style={{ flex: '1' }}>
                <div className={s.mainTitle + ' ' + 'showTitle text-capitalize'} style={{ fontSize: '24px', margin: '16px' }}><Lang>lang_document_upload</Lang></div>
                <div className={s.title + ' ' + 'showTitle'} style={{ paddingLeft: '16px', fontSize: 'var(--size-4)' }}><span style={{ color: 'var(--semantic-danger)', marginLeft: '4px' }}>*</span><span className='text-capitalize'>&nbsp;<Lang>lang_require_symbol</Lang></span></div>
                {this.renderContent()}
            </div>
            {this.renderButton()}
        </div>
    }
}
