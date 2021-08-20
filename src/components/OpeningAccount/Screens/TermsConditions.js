import React from 'react'
import s from '../OpeningAccount.module.css'
import SvgIcon, { path } from '../../Inc/SvgIcon'
import Lang from '../../Inc/Lang'

const TERMS = [
    {
        title: 'AML/CTF consent',
        content: 'By accepting these terms and conditions you give consent for Quant Edge EQUIX App to disclose your name, residential address and date of birth to a credit reporting agency and ask the credit reporting agency to provide an assessment of whether the personal information so provided matches (in whole or in part) personal information contained in a credit information file in the possession or control of the credit reporting agency to assist in verifying your identity for the purposes of the Anti-Money Laundering and Counter-Terrorism Act 2006. The credit reporting agency may prepare and provide Quant Edge EQUIX App with such an assessment and may use your personal information including the names, residential addresses and dates of birth contained in credit information files of you and other individuals for the purposes of preparing such an assessment. If you disagree with having your identity verified by a credit reporting agency, please do not check the consent box or contact Quant Edge EQUIX App so that we can discuss other options with you.'
    },
    {
        title: 'EKYC consent',
        content: 'By accepting these terms and conditions you give consent for Quant Edge EQUIX App to disclose your name, residential address, date of birth to a third party KYC provider to verify your information. You agreed that you are authorised to provide the government  ID details and you understand that the details will be checked against records held by the Issuer or Official Record Holder. Our third party KYC provider will verify your government ID details with the Australian Government’s Document Verification Service (DVS). The DVS is a national online system that allows organisations to compare an individual’s identifying information with a government record.',
        link: 'More information about the DVS is available on their website.'
    }
]

export default class TermsConditions extends React.Component {
    renderHeader() {
        return <div className={s.header + ' ' + s.termsHeader}>
            <div className={s.title + ' ' + 'showTitle' + ' ' + 'size--4'}><Lang>lang_terms_conditions_header</Lang></div>
            <div className={s.icon} onClick={() => this.props.close()}><SvgIcon path={path.mdiClose} /></div>
        </div>
    }

    renderContent() {
        return <div className={s.termsContent}>
            <div className={s.termsPadding}>
                {
                    TERMS.map(e => {
                        return <div className={s.termsCondition} key={e.title}>
                            <div className={s.termsTitle}>{e.title}</div>
                            <div className={s.terms}>{e.content} <a href='http://www.dvs.gov.au/' target='_blank'>{e.link}</a></div>
                        </div>
                    })
                }
            </div>
        </div>
    }

    render() {
        return (
            <div className={s.termsContainer}>
                {this.renderHeader()}
                {this.renderContent()}
            </div>
        )
    }
}
