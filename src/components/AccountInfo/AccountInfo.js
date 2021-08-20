import React from 'react';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import Lang from '../Inc/Lang';
import SearchAccount from '../SearchAccount';
import { hideElement, getSymbolAccountWhenFirstOpenLayout, resetAccountOfLayout } from '../../helper/functionUtils';
import uuidv4 from 'uuid/v4';
import ToggleLine from '../Inc/ToggleLine';
class AccountInfo extends React.Component {
    constructor(props) {
        super(props);
        const initState = this.props.loadState();
        this.collapse = initState.collapse ? 1 : 0
        this.id = uuidv4();
        this.state = {
            accountObj: initState.accountObj || {}
        }
        props.glContainer.on('show', () => {
            hideElement(props, false, this.id);
        });
        props.glContainer.on('hide', () => {
            hideElement(props, true, this.id);
        });
        this.handleResize = this.handleResize.bind(this);
        props.resize((width) => {
            this.handleResize(width)
        });
        this.changeAccount = this.changeAccount.bind(this);
        props.receive({
            account: this.changeAccount
        });
    }

    handleResize(width) {
        if (this.dom) {
            this.dom.className = 'accountInfo';
            if (width < 750) {
                this.dom.classList.add('single');
            } else if (width < 1280) {
                this.dom.classList.add('half');
            } else {
                this.dom.classList.add('lagre');
            }
        }
    }

    renderProducts() {
        const data = this.state.accountObj;
        return (<div className='ItemRow'>
            <p className='firstLetterUpperCase lablel size--3'> <Lang>lang_products</Lang> </p>
            <div>
                {data.equity_trading ? <p className='firstLetterUpperCase products size--2'><Lang>lang_equity</Lang> </p> : null}
                {data.warrants_trading ? <p className='firstLetterUpperCase products size--2'><Lang>lang_warrant</Lang> </p> : null}
                {data.options_trading ? <p className='firstLetterUpperCase products size--2'><Lang>lang_options</Lang> </p> : null}
                {data.future_trading ? <p className='firstLetterUpperCase products size--2'><Lang>lang_futures</Lang> </p> : null}
            </div>
        </div>
        )
    }

    dataReceivedFromSearchAccount(data) {
        if (data) {
            this.changeAccount(data, true)
            this.props.send({
                account: data
            })
        }
    }

    changeAccount(account, fromReceiveSearchAccount) {
        if (!account) account = dataStorage.accountInfo
        if (!account || !account.account_id) return
        this.setState({
            accountObj: account
        });
        this.props.saveState({
            accountObj: account
        })
        if (fromReceiveSearchAccount) {
            this.props.send({
                account: account
            })
        }
    }

    collapseFunc = (collapse) => {
        this.collapse = collapse ? 1 : 0
        this.props.saveState({
            collapse: this.collapse
        })
        this.forceUpdate()
    }

    render() {
        try {
            const data = this.state.accountObj;
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
            const advisorCode = data.advisor_code ? (data.advisor_code + (data.advisor_name ? ' (' + data.advisor_name + ')' : '')) : ''
            return (
                <div className='userAccount'>
                    <div className='user-content qe-widget'>
                        <div className={`header-wrap ${this.collapse ? 'collapse' : ''}`}>
                            <div className={' navbar'}>
                                <div className='accSearchRowAd'>
                                    <SearchAccount
                                        // showInactiveAccount={true}
                                        accountSumFlag={true}
                                        accountId={accountId}
                                        dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount.bind(this)} />
                                    <div className='rightRowOrderPad accSumName size--3 showTitle'>{`${accountName || ''} ` + `${accountId ? '(' + accountId + ')' : ''}`}</div>
                                </div>
                            </div>
                        </div>
                        <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            <div className='accountInfo userInfo' ref={dom => this.dom = dom}>
                                <div>
                                    <div>
                                        <div className='ItemRow'>
                                            <p className='capitalize lablel size--3'> <Lang>lang_account_id</Lang> </p>
                                            <p className='Info size--3 number showTitle'>{accountId}
                                            </p>
                                        </div>
                                        <div className='ItemRowGray'>
                                            <p className='capitalize lablel size--3'> <Lang>lang_full_name</Lang> </p>
                                            <p className='Info size--3 showTitle'>{accountName}</p>
                                        </div>
                                        <div className='ItemRow'>
                                            <p className='lablel size--3'> <Lang>lang_hin_number</Lang> </p>
                                            <p className='Info size--3 number showTitle'>{hin}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='ItemRowGray'>
                                            <p className='capitalize lablel size--3'> <Lang>lang_work_phone</Lang></p>
                                            <p className='Info size--3 number showTitle'>{workPhone}</p>
                                        </div>
                                        <div className='ItemRow'>
                                            <p className='capitalize lablel size--3'> <Lang>lang_home_phone</Lang> </p>
                                            <p className='Info size--3 number'>{homePhone}</p>
                                        </div>
                                        <div className='ItemRowGray'>
                                            <p className='capitalize lablel size--3'> <Lang>lang_fax_number</Lang> </p>
                                            <p className='Info size--3 number showTitle'>{fax}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <div className='ItemRow'>
                                            <p className='capitalize lablel size--3'> <Lang>lang_email</Lang> </p>
                                            <p className='Info size--3 showTitle'>{email}</p>
                                        </div>
                                        <div className='ItemRowGray'>
                                            <p className='capitalize lablel size--3'> <Lang>lang_postal_address</Lang> </p>
                                            <p className='Info size--3 hiddenTextAccountInfo showTitle'>{address}</p>
                                        </div>
                                        {this.renderProducts()}
                                    </div>
                                    <div>
                                        <div className='ItemRowGray'>
                                            <p className='capitalize lablel size--3'> <Lang>lang_account_type</Lang> </p>
                                            <p className='Info size--3 showTitle'>{accountType}</p>
                                        </div>
                                        <div className='ItemRow'>
                                            <p className='capitalize lablel size--3'> <Lang>lang_advisor</Lang> </p>
                                            <p className='Info size--3 showTitle'>{advisorCode}</p>
                                        </div>
                                        <div className='ItemRowGray'>
                                            <p className='capitalize lablel size--3'> <Lang>lang_base_currency</Lang> </p>
                                            <p className='Info size--3 showTitle'>{currency}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } catch (error) {
            logger.log('error Account Info', error)
        }
    }
}

export default AccountInfo
