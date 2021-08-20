import React from 'react';
import SvgIcon, { path } from '../../SvgIcon'
import { ACCOUNT_STATUS } from '../../../OpeningAccount/constant'
import DropDown from '../../../DropDown';

const valueMap = {
    active: 'ACTIVE',
    bank_pending: 'BANK PENDING',
    bank_submitted: 'BANK SUBMITTED',
    closed: 'CLOSED',
    ekyc_failed_aml: 'EKYC FAILED AML',
    ekyc_in_progress: 'EKYC IN PROGRESS',
    ekyc_interactive_locked_out: 'EKYC INTERACTIVE LOCKED OUT',
    ekyc_locked_out: 'EKYC LOCKED OUT',
    ekyc_more_info: 'EKYC MORE INFO',
    ekyc_pending: 'EKYC PENDING',
    inactive: 'INACTIVE',
    morrison_cancelled: 'MORRISON CANCELLED',
    morrison_in_referred: 'MORRISON IN REFERRED',
    morrison_pending: 'MORRISON PENDING'
}
class BtnNoClick extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: props.value
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ value: nextProps.value })
    }

    getIconByvalue(value) {
        switch ((value + '').toLowerCase()) {
            case ACCOUNT_STATUS.ACTIVE.toLowerCase():
                return {
                    getIcon: <SvgIcon fill='var(--color-white)' style={{ width: '20px', paddingRight: '8px' }} path={path.mdiCheckCircle} />,
                    bg: 'var(--semantic-success)'
                }
            case ACCOUNT_STATUS.EKYC_MORE_INFO.toLowerCase():
                return {
                    getIcon: <SvgIcon fill='var(--color-white)' style={{ width: '20px', paddingRight: '8px' }} path={path.mdiProgress} />,
                    bg: 'var(--semantic-info)'
                }
            case ACCOUNT_STATUS.CLOSED.toLowerCase():
            case ACCOUNT_STATUS.CREATED_FAILED.toLowerCase():
                return {
                    getIcon: <SvgIcon fill='var(--color-white)' style={{ width: '20px', paddingRight: '8px' }} path={path.mdiCloseCircle} />,
                    bg: 'var(--semantic-danger)'
                }
            case ACCOUNT_STATUS.EKYC_PENDING.toLowerCase():
            case ACCOUNT_STATUS.BANK_SUBMITTED.toLowerCase():
            case ACCOUNT_STATUS.MORRISON_IN_REFERRED.toLowerCase():
                return {
                    getIcon: <SvgIcon fill='var(--color-white)' style={{ width: '20px', paddingRight: '8px' }} path={path.mdiMagnify} />,
                    bg: 'var(--semantic-warning)'
                }
            case ACCOUNT_STATUS.EKYC_IN_PROGRESS.toLowerCase():
                return {
                    getIcon: <SvgIcon fill='var(--color-white)' style={{ width: '20px', paddingRight: '8px' }} path={path.mdiProgress} />,
                    bg: 'var(--secondary-dark)'
                }
            case ACCOUNT_STATUS.EKYC_LOCKED_OUT.toLowerCase():
                return {
                    getIcon: <SvgIcon fill='var(--color-white)' style={{ width: '20px', paddingRight: '8px' }} path={path.mdiLock} />,
                    bg: 'var(--semantic-danger)'
                }
            case ACCOUNT_STATUS.BANK_PENDING.toLowerCase():
            case ACCOUNT_STATUS.MORRISON_PENDING.toLowerCase():
                return {
                    getIcon: <SvgIcon fill='var(--color-white)' style={{ width: '20px', paddingRight: '8px' }} path={path.progressPending} />,
                    bg: 'var(--secondary-dark)'
                }
            case ACCOUNT_STATUS.CREATING.toLowerCase():
                return {
                    getIcon: <SvgIcon fill='var(--color-white)' style={{ width: '20px', paddingRight: '8px' }} path={path.creatingAccount} />,
                    bg: 'var(--secondary-dark)'
                }
            default:
                return {
                    getIcon: <SvgIcon fill='var(--color-white)' style={{ width: '20px', paddingRight: '8px' }} path={path.mdiProgress} />,
                    bg: 'var(--secondary-dark)'
                }
        }
    }

    onChange = data => {
        this.props.onChange(data);
        this.setState({
            value: data
        })
    }

    render() {
        let content = this.getIconByvalue(this.state.value)
        let text = valueMap[(this.state.value + '').toLowerCase()]
        if (this.props.schema.options && this.props.editable) {
            return (<div style={{ padding: 0 }} ref={dom => {
                this.dom = dom
                this.props.setDom(dom)
            }}>
                <DropDown
                    translate={true}
                    onChange={this.onChange}
                    options={this.props.schema.options || []}
                    value={this.state.value}
                    textRight={true}
                    align={this.props.schema.align}
                />
            </div>
            )
        }
        return (
            this.state.value
                ? <div style={{ height: '24px' }}>
                    <div style={{ display: 'inline-flex', backgroundColor: content.bg, color: 'var(--color-white)', alignItems: 'center', padding: '0px 4px' }}>
                        {content.getIcon}
                        {text}
                    </div>
                </div>
                : null
        )
    }
}
export default BtnNoClick;
