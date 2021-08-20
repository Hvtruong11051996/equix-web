import React, { Component } from 'react'
import logger from '../../helper/log'
import dataStorage from '../../dataStorage'
import Lang from '../Inc/Lang/Lang'
import SearchAccount from '../SearchAccount/SearchAccount'
import {
    hideElement,
    getSymbolAccountWhenFirstOpenLayout,
    resetAccountOfLayout
} from '../../helper/functionUtils'
import uuidv4 from 'uuid/v4'
import styles from './AccountDetail.module.css'
import ToggleLine from '../Inc/ToggleLine';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'

class AccountDetail extends Component {
    constructor(props) {
        super(props)
        const initState = this.props.loadState()
        this.collapse = initState.collapse ? 1 : 0
        this.id = uuidv4()
        this.state = {
            accountObj: initState.accountObj || {}
        }
        props.glContainer.on('show', () => {
            hideElement(props, false, this.id)
        })
        props.glContainer.on('hide', () => {
            hideElement(props, true, this.id)
        })
        props.receive({
            account: this.changeAccount
        })
    }

    renderProducts = data => (
        <div className={styles.itemRow}>
            <p className={`${styles.itemLabel} size--3`}><Lang>lang_products</Lang></p>
            <div>
                {data.equity_trading ? <p className={`${styles.productItem} size--2`}><Lang>lang_equity</Lang></p> : null}
                {data.warrants_trading ? <p className={`${styles.productItem} size--2`}><Lang>lang_warrant</Lang></p> : null}
                {data.options_trading ? <p className={`${styles.productItem} size--2`}><Lang>lang_options</Lang></p> : null}
                {data.future_trading ? <p className={`${styles.productItem} size--2`}><Lang>lang_futures</Lang></p> : null}
            </div>
        </div>
    )

    dataReceivedFromSearchAccount = data => {
        if (data) return
        this.changeAccount(data, true)
        this.props.send({
            account: data
        })
    }

    changeAccount = (account, fromReceiveSearchAccount) => {
        // const { newAccount } = getSymbolAccountWhenFirstOpenLayout()
        // if (Object.keys(newAccount).length) {
        //     account = newAccount
        //     resetAccountOfLayout()
        // }
        if (!account) account = dataStorage.accountInfo
        if (!account || !account.account_id) return
        if (!account) account = {}
        this.setState({
            accountObj: account
        })
        this.props.saveState({
            accountObj: account
        })
        if (fromReceiveSearchAccount) {
            this.props.send({
                account: account
            })
        }
    }

    renderPart = (label, value, clsList) => (
        <div className={styles.itemRow}>
            <p className={`${styles.itemLabel} size--3 text-capitalize`}> <Lang>{label}</Lang> </p>
            <p className={`${styles.itemInfo} size--3 ${clsList} showTitle`}>{value}</p>
        </div>
    )

    collapseFunc = (collapse) => {
        this.collapse = collapse ? 1 : 0
        this.props.saveState({
            collapse: this.collapse
        })
        this.forceUpdate()
    }

    render() {
        try {
            const data = this.state.accountObj
            const currency = (data && data.currency) || ''
            const accountId = (data && data.account_id) || ''
            const accountName = (data && data.account_name) || ''
            const hin = (data && data.hin) || ''
            const workPhone = (data && data.work_phone) || ''
            const homePhone = (data && data.home_phone) || ''
            const fax = (data && data.fax) || ''
            const email = (data && data.email) || ''
            const address = (data && data.address) || ''
            const accountType = (data && data.account_type) || ''
            const tempAdvisorCode = data.advisor_code + (data.advisor_name ? ` (${data.advisor_name})` : '')
            const advisorCode = data.advisor_code ? tempAdvisorCode : ''
            const accountLabel = `${accountName || ''}` + (accountId ? ` (${accountId})` : '')
            return (
                <div className={styles.container}>
                    <div className={styles.wrapper + ' qe-widget'}>
                        <div className={`header-wrap ${this.collapse ? 'collapse' : ''}`}>
                            <div className={styles.searchAccountContainer + ' navbar'}>
                                <div className={styles.overflowHidden + ' flex align-items-center'}>
                                    <SearchAccount
                                        accountSumFlag={true}
                                        accountId={accountId}
                                        dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount}
                                    />
                                    <div className={`${styles.accountLabel} size--3 showTitle`}>
                                        {accountLabel}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
                        <div className={styles.innerContainer}>
                            <div className={styles.innerWrapper}>
                                <div className={styles.anotherWrapper}>
                                    <div className={styles.partWrapper}>
                                        <div className={styles.part}>
                                            {this.renderPart('lang_account_id', accountId, 'number')}
                                            {this.renderPart('lang_full_name', accountName, '')}
                                            {this.renderPart('lang_hin_number', hin, 'number')}
                                        </div>
                                        <div className={styles.part}>
                                            {this.renderPart('lang_work_phone', workPhone, 'number')}
                                            {this.renderPart('lang_home_phone', homePhone, 'number')}
                                            {this.renderPart('lang_fax_number', fax, 'number')}
                                        </div>
                                    </div>
                                    <div className={styles.partWrapper}>
                                        <div className={styles.part}>
                                            {this.renderPart('lang_email', email, '')}
                                            {this.renderPart('lang_postal_address', address, 'hiddenTextAccountInfo')}
                                            {this.renderProducts(data)}
                                        </div>
                                        <div className={styles.part}>
                                            {this.renderPart('lang_account_type', accountType, 'number')}
                                            {this.renderPart('lang_advisor', advisorCode, 'number')}
                                            {this.renderPart('lang_base_currency', currency, 'number')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } catch (error) {
            logger.log(`Error while rendering Account Detail: ${error}`)
        }
    }
}

export default AccountDetail
