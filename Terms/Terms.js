import React from 'react';
import logger from '../src/helper/log';
import dataStorage from '../src/dataStorage';
import { readFileTerms, saveDataSetting } from '../src/helper/functionUtils';
import SvgIcon, { path } from '../src/components/Inc/SvgIcon/SvgIcon';
import Lang from '../src/components/Inc/Lang/Lang'
import s from './Terms.module.css'
import Checkbox from '../src/components/Elements/Checkbox/Checkbox';

export default class Terms extends React.Component {
    constructor(props) {
        super(props)
        this.checked = false
        this.state = {}
        this.firstTime = !dataStorage.hideTermsForm && !this.props.noAccBtn
    }

    componentDidMount() {
        readFileTerms(`${this.props.name}.md`, this.dom)
    }

    onClose = () => {
        if (this.checked) {
            saveDataSetting({ data: { hideTermsForm: this.checked } }).then(() => {
                dataStorage.hideTermsForm = this.checked;
            })
        }
        this.props.close();
    }

    renderContent() {
        return (
            <div className={s.contentContainer}>
                <div className={s.padding}>
                    <div ref={ref => this.dom = ref} className={s.content}>
                    </div>
                </div>
            </div>
        )
    }

    getHeader() {
        switch (this.props.name) {
            case 'TermsAndConditions': return 'lang_terms_of_use'
            case 'TermsAndConditionsForEKYC': return 'lang_terms_conditions_header'
            case 'PrivacyPolicy': return 'lang_privacy_policy_capitalize'
            default: return 'lang_terms_of_use'
        }
    }

    renderHeader() {
        return (
            <div className={s.header + ' ' + (this.firstTime ? s.center : '')}>
                <div className={s.title + ' ' + 'showTitle'}><Lang>{this.getHeader()}</Lang></div>
                <div className={s.icon} onClick={this.onClose}><SvgIcon path={path.mdiClose} /></div>
            </div>
        )
    }

    renderAcceptButton() {
        if (!this.firstTime) return null
        return (
            <div className={s.footer}>
                <div className={s.checkbox}>
                    <Checkbox onChange={(checked) => {
                        this.checked = checked
                    }} label='lang_dont_display_again' />
                </div>
                <div className={s.acceptButton}>
                    <span onClick={this.onClose} className='text-capitalize'><Lang>lang_i_accept</Lang></span>
                </div>
            </div>
        )
    }

    renderFooter() {
        switch (this.props.name) {
            case 'TermsAndConditions':
                return this.renderAcceptButton()
            default: return null
        }
    }

    render() {
        return (
            <div className={s.overlay}>
                <div className={s.container}>
                    {this.renderHeader()}
                    {this.renderContent()}
                    {this.renderFooter()}
                </div>
            </div>
        )
    }
}
