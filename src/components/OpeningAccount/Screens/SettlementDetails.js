import React from 'react'
import Lang from '../../Inc/Lang/Lang'
import Form, { TYPE } from '../../Inc/Form/Form'
import { FIELD, OPTIONS, SETTLEMENT_METHOD } from '../constant'
import { translateByEnvVariable } from '../../../helper/functionUtils'

const schema = {
    type: TYPE.OBJECT,
    properties: {
        [FIELD.SETTLEMENT_METHOD]: {
            title: 'lang_settlement_method',
            rules: {
                required: true
            },
            options: OPTIONS.SETTLEMENT_METHOD,
            type: TYPE.DROPDOWN,
            align: 'right'
        },
        [FIELD.SETTLEMENT_EXISTING_HIN]: {
            title: 'lang_existing_hin',
            rules: {
                required: true,
                number: true,
                max: 10
            },
            condition: {
                [FIELD.SETTLEMENT_METHOD]: SETTLEMENT_METHOD.SPONSORED_HIN_TRANSFER
            },
            type: TYPE.NUMBER
        },
        [FIELD.SETTLEMENT_PID]: {
            title: 'lang_pid',
            titleClass: 'text-uppercase',
            rules: {
                required: true
            },
            condition: {
                [FIELD.SETTLEMENT_METHOD]: [SETTLEMENT_METHOD.SPONSORED_HIN_TRANSFER, SETTLEMENT_METHOD.DVP]
            },
            options: OPTIONS.PID,
            type: TYPE.DROPDOWN,
            align: 'right'
        },
        [FIELD.SETTLEMENT_SUPPLEMENTARY_REFERENCE]: {
            title: 'lang_supplementar_reference',
            rules: {
                required: true,
                max: 128
            },
            condition: {
                [FIELD.SETTLEMENT_METHOD]: SETTLEMENT_METHOD.DVP
            },
            type: TYPE.STRING
        }
    }
}
export default class SettlementDetails extends React.Component {
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
                schema={schema}
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
