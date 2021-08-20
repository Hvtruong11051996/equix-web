import React, { useState, useEffect } from 'react'
import SvgIcon, { path } from '../../SvgIcon'
import Terms from '../../../../../Terms/Terms';
import showModal from '../../Modal';
import Checkbox from '../../../Elements/Checkbox'
import s from '../Form.module.css'
import dataStorage from '../../../../dataStorage'

const AcceptButton = (props) => {
    const [isCheck, setIsCheck] = useState(props.value)

    useEffect(() => {
        setIsCheck(!!props.value)
    }, [props.value])

    const onTermsService = () => {
        showModal({
            component: Terms,
            className: 'allowNested',
            props: {
                name: 'TermsAndConditions',
                noAccBtn: true
            }
        });
    }
    const onTermsCondition = () => {
        if (dataStorage.env_config.termsConditionsUrl) {
            window.open(dataStorage.env_config.termsConditionsUrl);
        } else {
            showModal({
                component: Terms,
                className: 'allowNested',
                props: {
                    name: 'TermsAndConditionsForEKYC'
                }
            });
        }
    }
    const onPrivacyPolicy = () => {
        const policyLink = dataStorage.translate('lang_config_policy_link')
        if (policyLink) window.open(policyLink);
        else {
            showModal({
                component: Terms,
                className: 'allowNested',
                props: {
                    name: 'PrivacyPolicy'
                }
            });
        }
    }

    const onOpenLink = (term) => {
        let url = ''
        switch (term) {
            case 'STAX':
                url = 'https://www.stax.trade/legal/terms-conditions'
                break;
            case 'Morrison':
                url = 'https://assets.stax.trade/legal/morrison-securities-terms-conditions-v5.pdf'
                break;
            case 'PrivacyPolicy':
                url = 'https://www.stax.trade/legal/privacy-policy'
                break;
            case 'KYC':
                url = 'https://assets.stax.trade/legal/ricard-securities-aml-ctf-policy-v1.pdf'
                break;
            default:
                break;
        }
        window.open(url)
    }

    const onCheck = () => {
        props.onChange && props.onChange(!isCheck)
        setIsCheck(!isCheck)
    }

    return <div className={s.term} style={{
        display: 'flex',
        alignItems: 'flex-start'
    }}>
        <Checkbox className='showTitle' checked={isCheck} onChange={props.onChange} setRef={ref => props.setDom(ref)} />
        {['stax', 'staxUat', 'staxDemo'].includes(dataStorage.env_config.env)
            ? <div style={{ padding: '0 0 0 8px', textTransform: 'none', textAlign: 'center' }} className={s.termsText}>
                By checking this box you have read and agreed to both the <a onClick={() => onOpenLink('STAX')}>STAX Trade</a> and <a onClick={() => onOpenLink('Morrison')}>Morrison Securities</a> Terms {'&'} Conditions, <a onClick={() => onOpenLink('PrivacyPolicy')}>Privacy Policy</a> and the <a onClick={() => onOpenLink('KYC')}>Terms &amp; Conditions for KYC and AML/CTF consents</a>
            </div>
            : <div style={{ padding: '0 0 0 8px', textTransform: 'none', textAlign: 'center' }} className={s.termsText}>
                By checking this box you have read and agreed to our <a onClick={onTermsService}>Terms of Services</a>, <a onClick={onPrivacyPolicy}>Privacy Policy</a> and the <a onClick={onTermsCondition}>Terms &amp; Conditions for KYC and AML/CTF consents</a>
            </div>
        }
    </div>
}

export default AcceptButton
