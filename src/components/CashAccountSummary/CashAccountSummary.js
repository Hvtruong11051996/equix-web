import React from 'react';
import { getDateStringWithFormat } from '../../helper/dateTime'
import { formatNumberValue, checkPropsStateShouldUpdate } from '../../helper/functionUtils';
import dataStorage from '../../dataStorage'
import logger from '../../helper/log';
import { translate } from 'react-i18next';
import { getData, getUrlReport } from '../../helper/request';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'
import Lang from '../Inc/Lang';
import s from './CashAccountSummary.module.css'
class CashAccountSummary extends React.Component {
    constructor(props) {
        super(props);
        this.accountId = props.accountId;
        this.state = {
            fromDate: props.fromDate,
            toDate: props.toDate,
            data: {}
        }
    }
    componentDidMount() {
        try {
            addEventListener(EVENTNAME.clickToRefresh, this.refreshData);
            this.getData(this.props.fromDate, this.props.toDate);
        } catch (error) {
            logger.error('componentDidMount On CashAccountSummary', error)
        }
    }

    componentWillReceiveProps(nextProps) {
        try {
            if (nextProps.fromDate && nextProps.toDate && nextProps.accountId) {
                if (this.state.fromDate === nextProps.fromDate && this.state.toDate === nextProps.toDate && nextProps.accountId === this.accountId) return

                this.accountId = nextProps.accountId;
                this.setState({
                    fromDate: nextProps.fromDate,
                    toDate: nextProps.toDate
                }, () => this.getData(this.state.fromDate, this.state.toDate))
            }
        } catch (error) {
            logger.error('componentWillReceiveProps On CashAccountSummary', error)
        }
    }

    getData(fromDate, toDate) {
        try {
            if (fromDate && toDate) {
                const accountId = this.accountId
                if (!accountId) return;
                const fDate = getDateStringWithFormat(fromDate, 'DD/MM/YY');
                const tDate = getDateStringWithFormat(toDate, 'DD/MM/YY');
                const urlCashReport = getUrlReport('cash', accountId, fDate, tDate);
                this.props.loading(true)
                getData(urlCashReport)
                    .then(response => {
                        this.props.loading(false)
                        if (response.data) {
                            this.setState({
                                data: response.data
                            })
                        }
                    })
                    .catch(error => {
                        logger.log(error)
                        this.props.loading(false)
                    })
            }
        } catch (error) {
            logger.error('getData On CashAccountSummary', error)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (nextProps.isHidden) return false;
            if (dataStorage.checkUpdate) {
                return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state)
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On CashAccountSummary', error)
        }
    }

    render() {
        try {
            const oneDay = this.state.fromDate.format('DD/MM/YYYY') === this.state.toDate.format('DD/MM/YYYY');
            return (
                <div className='cashAccountSummaryRoot'>
                    {oneDay ? <div className='timeHeaderCash text-uppercase showTitle size--4'><Lang>lang_cash_account_summary</Lang> {this.state.fromDate.format('DD/MM/YYYY')}</div> : <div className='timeHeaderCash showTitle size--4 text-uppercase'><Lang>lang_cash_account_summary</Lang> {this.state.fromDate.format('DD/MM/YYYY')} - {this.state.toDate.format('DD/MM/YYYY')}</div>}
                    <div className='titleCardCashAccount '>
                        <div className='showTitle'><Lang>lang_cash_at_start_of_period</Lang></div>
                        <div className='showTitle'>{this.state.data ? formatNumberValue(this.state.data.balance_start_of_period, true) : '--'}</div>
                    </div>
                    <div className='rowCashAccount'>
                        <div className='showTitle text-capitalize'><Lang>lang_net_trade_flows</Lang></div>
                        <div className={` showTitle ${this.state.data && this.state.data.net_trade_flows < 0 ? s.colorSell : ''}`}>{this.state.data ? (formatNumberValue(this.state.data.net_trade_flows, true) === '0' ? '0.00' : formatNumberValue(this.state.data.net_trade_flows, true)) : '--'}</div>
                    </div>
                    <div className='rowCashAccount '>
                        <div className='showTitle text-capitalize'><Lang>lang_total_fees</Lang></div>
                        <div className='showTitle'>{this.state.data ? (formatNumberValue(this.state.data.total_fees, true) === '0' ? '0.00' : formatNumberValue(this.state.data.total_fees, true)) : '--'}</div>
                    </div>
                    <div className='titleCardCashAccount '>
                        <div className='showTitle'><Lang>lang_cash_at_end_of_period</Lang></div>
                        <div className='showTitle'>{this.state.data ? formatNumberValue(this.state.data.balance_end_of_period, true) : '--'}</div>
                    </div>
                </div>
            );
        } catch (error) {
            logger.error('render On CashAccountSummary', error)
        }
    }

    componentWillUnmount() {
        removeEventListener(EVENTNAME.clickToRefresh, this.refreshData);
    }

    refreshData() {
        this.getData(this.props.fromDate, this.props.toDate);
    }
}

export default translate('translations')(CashAccountSummary);
