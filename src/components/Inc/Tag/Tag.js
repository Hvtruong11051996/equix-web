import React from 'react';
import { renderClass } from '../../../helper/functionUtils';
import Lang from '../Lang/Lang'
const objClassBg = {
    advisor_code: 'bg-primary',
    branch_code: 'bg-orange',
    list_mapping: 'bg-gray',
    organisation_code: 'bg-green'
}

const accessMethodMapping = {
    'INTERNAL ONLY': 'lang_internal_only',
    'FIRST INTERNAL THEN EXTERNAL': 'lang_first_internal_then_external',
    'PENDING EMAIL VERIFICATION': 'lang_pending_email_verification',
    'ADMIN BLOCKED': 'lang_admin_blocked',
    'SECURITY BLOCKED': 'lang_security_blocked'
}
class Tag extends React.Component {
    render() {
        const enumNames = this.props.enumNames || null
        if (enumNames) {
            const value = enumNames[this.props.lstTag]
            return (
                <div className='showTitle' style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <div className={`box-overflow`}>
                        <div className='text-overflow'>
                            <label key={value} className={`tag ${renderClass(value)} text-uppercase`}>
                                {accessMethodMapping[value] ? <Lang>{accessMethodMapping[value]}</Lang> : <Lang>{value}</Lang>}
                            </label>
                        </div>
                    </div>
                </div>
            )
        } else if (this.props.fixBackgound) {
            const value = this.props.lstTag.toUpperCase()
            return (
                <div className='showTitle' style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <div className={`box-overflow`}>
                        <div className='text-overflow'>
                            <label key={value} className={`tag ${renderClass(value)}`}><Lang>{value}</Lang></label>
                        </div>
                    </div>
                </div>
            )
        } else if (this.props.multiBackgound) {
            const obj = this.props.lstTag
            if (typeof obj === 'object') {
                return (
                    <div className='box-overflow'>
                        <div className='text-overflow'>
                            {
                                Object.keys(obj).map((item, key) => {
                                    if (obj[item]) {
                                        const dataArr = obj[item].split(',')
                                        if (dataArr.length > 1) {
                                            return dataArr.map((value, key) => {
                                                return <label key={key} className={`tag showTitle ${objClassBg[item]}`}>{this.props.noTranslate ? value : <Lang>{value}</Lang>}</label>
                                            })
                                        } else {
                                            return <label key={key} className={`tag showTitle ${objClassBg[item]}`}>{this.props.noTranslate ? obj[item] : <Lang>{obj[item]}</Lang>}</label>
                                        }
                                    } else {
                                        return null
                                    }
                                })
                            }
                        </div>
                    </div>
                )
            }
        } else {
            const tagArr = this.props.lstTag && this.props.lstTag.split(',')
            if (tagArr && tagArr.length === 1) {
                const value = tagArr[0].toUpperCase()
                return (
                    <div className='box-overflow'>
                        <div className='showTitle' className='text-overflow'>
                            <label key={value} className='tag bg-green'><Lang>{value}</Lang></label>
                        </div>
                    </div>
                )
            } else {
                return (
                    <div className='box-overflow'>
                        <div className='text-overflow'>
                            {
                                tagArr.map((item, key) => {
                                    return <label key={key} className='tag bg-green showTitle'><Lang>{item}</Lang></label>
                                })
                            }
                        </div>
                    </div>
                )
            }
        }
    }
}
export default Tag;
