import React from 'react';
import uuidv4 from 'uuid/v4';
import dataStorage from '../../dataStorage'
import logger from '../../helper/log';
import {
    formatNumberValue,
    checkPropsStateShouldUpdate,
    hideElement,
    getSymbolAccountWhenFirstOpenLayout,
    resetAccountOfLayout,
    checkRole,
    checkShowAccountSearch,
    formatNumberVolume
} from '../../helper/functionUtils';
import { func } from '../../storage';
import Lang from '../Inc/Lang/Lang';
import {
    emitter,
    eventEmitter,
    emitterRefresh,
    eventEmitterRefresh
} from '../../constants/emitter_enum';
import { getData, getUrlAnAccount, getUrlTotalPosition, getUrlMarginConfig, completeApi } from '../../helper/request';
import { registerAccount, unregisterAccount } from '../../streaming';
import SearchAccount from '../SearchAccount/SearchAccount';
import Icon from '../Inc/Icon/Icon';
import NoTag from '../Inc/NoTag/NoTag';
import showModal from '../Inc/Modal/Modal';
import ConfirmAccountSummary from '../Inc/ConfirmAccountSummary/ConfirmAccountSummary';
import config from '../../../public/config'
import colorEnum from '../../constants/enumColor'
import MapRoleComponent from '../../constants/map_role_component'
import { regisRealtime, unregisRealtime } from '../../helper/streamingSubscriber';
import s from './PortfolioSummary.module.css';
import ToggleLine from '../Inc/ToggleLine/ToggleLine';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event';
class PortfolioSummary extends React.Component {
    constructor(props) {
        super(props);
        this.isMount = false
        this.realtimeDataBalances = this.realtimeDataBalances.bind(this);
        this.changeAccount = this.changeAccount.bind(this);
        this.accountRefresh = func.getStore(emitter.STREAMING_ACCOUNT_DATA);
        this.accountInfo = {}
        this.listMarginConfig = []
        this.maxValueConfig = 0;
        this.view = {};
        const initState = this.props.loadState();
        this.collapse = initState.collapse ? 1 : 0
        this.corlorConfig = {
            '0': '#eee8aa',
            '1': '#ffd700',
            '2': '#ffa500',
            '3': '#ff4500',
            '4': '#ff0000',
            '5': '#cd853f',
            '6': '#d2691e',
            '7': '#8b4513',
            '8': '#a52a28',
            '9': '#800001',
            '10': '#9400d3',
            '11': '#9932cc',
            '12': '#8b008b',
            '13': '#8a007e',
            '14': '#4b0083'
        }
        this.state = {
            data: {},
            accountObj: {},
            show: false
        };

        const hasRole38 = checkRole(MapRoleComponent.PORTFOLIO_SUMMARY_DERIVATIVES_ONLY);
        const hasRole37 = checkRole(MapRoleComponent.PORTFOLIO_SUMMARY_EQUITIES_ONLY);
        const hasRole8 = checkRole(MapRoleComponent.PORTFOLIO_SUMMARY_EQUITIES_AND_DERIVATIVES);

        this.hasRole38 = hasRole37 ? false : hasRole38;
        this.hasRole37 = hasRole37;
        this.hasRole8 = hasRole8;

        this.id = uuidv4();
        props.receive({
            account: this.changeAccount
        });
        props.glContainer.on('show', () => {
            hideElement(props, false, this.id);
        });
        props.glContainer.on('hide', () => {
            hideElement(props, true, this.id);
        });
    }

    changeAccount(account) {
        if (!account) account = dataStorage.accountInfo;
        if (!account || !account.account_id) return;
        if (!account) account = {};
        if (!this.state.accountObj || this.state.accountObj.account_id !== account.account_id) {
            unregisRealtime({
                callback: this.realtimeData
            });
            regisRealtime({
                url: completeApi(`/portfolio?account_id=${account.account_id}`),
                callback: this.realtimeData
            });
        }
        this.isMount && this.setState({
            accountObj: account
        }, () => {
            this.getDataAccount()
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (nextState.isHidden) return false;
            if (dataStorage.checkUpdate) {
                return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On PortfolioSummary', error)
        }
    }

    async getDataSummary() {
        try {
            let accountId = this.state.accountObj && this.state.accountObj.account_id
            if (!accountId) {
                this.isMount && this.setState({
                    data: {}
                })
                return
            }
            const urlAccSum = getPortfolioSummaryInfo(accountId);
        } catch (error) {
            logger.error('getDataSummary On PortfolioSummary', error)
        }
    }
    preDataDrawChart(marginConfig) {
        const listReturn = [];
        if (marginConfig && marginConfig.length > 0) {
            let hasLager100 = false;
            const listConfig = (marginConfig || []).sort((a, b) => {
                if (a.margin_value >= this.maxValueConfig) {
                    hasLager100 = true;
                }
                if (b.margin_value >= this.maxValueConfig) {
                    hasLager100 = true;
                }
                return a.margin_value - b.margin_value;
            });
            let prevValue = 0;
            // const dicColor = {};
            for (let index = 0; index < listConfig.length; index++) {
                const config = listConfig[index];
                const valConvert = config.margin_value > 100 ? 100 : config.margin_value;
                const color = this.corlorConfig[config.margin_type];
                // if (!color) {
                //     color = this.corlorConfig[Math.floor(Math.random() * 15) + 1];
                // }

                const obj = {
                    color,
                    value: config.margin_value,
                    percent: (valConvert - prevValue) * 100 / this.maxValueConfig
                }
                prevValue = valConvert;
                listReturn.push(obj);
                if (valConvert >= 100) {
                    break;
                }
            }
            if (!hasLager100) {
                const obj100 = {
                    color: 'var(--secondary-default)',
                    value: 100,
                    percent: (100 - prevValue) * 100 / this.maxValueConfig
                }
                listReturn.push(obj100);
            }
        }
        return listReturn;
    }
    async getDataAccount() {
        try {
            let accountId = this.state.accountObj && this.state.accountObj.account_id
            if (!accountId) {
                this.isMount && this.setState({
                    data: {}
                })
                return
            }
            const urlMarginConfig = getUrlMarginConfig(accountId);
            this.maxValueConfig = 100;
            await getData(urlMarginConfig)
                .then(response => {
                    const marginConfig = response.data || {};
                    this.listMarginConfig = this.preDataDrawChart(marginConfig)
                })
                .catch(error => {
                    logger.error(error)
                    this.listMarginConfig = this.preDataDrawChart({ listMarginLevel: [] })
                });
            const urlAnAcc = getUrlAnAccount(accountId);
            this.props.loading(true)
            await getData(urlAnAcc)
                .then(response => {
                    this.props.loading(false);
                    const dataInfo = (response.data && response.data.length && response.data[0]) || {};
                    this.accountInfo = { full_name: dataInfo.account_name || this.accountName, currency: dataInfo.currency };
                })
                .catch(error => {
                    logger.error(error)
                    this.props.loading(false);
                    this.accountInfo = { full_name: this.accountName, currency: this.state.currency };
                    this.needToRefresh = true;
                });
            const urlPortfolioSummary = getUrlTotalPosition(accountId);
            this.props.loading(true)
            await getData(urlPortfolioSummary)
                .then(response => {
                    this.props.loading(false);
                    this.mappingObject(response.data, this.accountInfo);
                }).catch(error => {
                    this.props.loading(false);
                    logger.error(error)
                    this.needToRefresh = true;
                });
        } catch (error) {
            logger.error('getDataAccount On PortfolioSummary', error)
        }
    }

    refreshData = (eventName) => {
        try {
            if (eventName !== 'refresh') return
            const data = this.state.data;
            for (let key in data) {
                data[key] = '--';
            }
            this.isMount && this.setState({
                data
            }, () => this.getDataAccount())
        } catch (error) {
            logger.error('refreshData On PortfolioSummary', error)
        }
    }

    realtimeData = (dataRealtime) => {
        let data, objChange
        if (typeof dataRealtime === 'string') data = JSON.parse(dataRealtime)
        else data = dataRealtime
        if (data.ping) return;
        if (data.data.object_changed) objChange = JSON.parse(data.data.object_changed)
        const arrType = data.data.title.split('#')
        if (arrType[0] === 'accountsummary') {
            this.mappingObject(objChange, this.accountInfo.data)
        }
    }

    mappingObject(objAccount = {}, accountInfo = {}) {
        const data = {
            pending_settlement: objAccount.pending_settlement,
            pending_settlement_t0: objAccount.pending_settlement_t0,
            pending_settlement_t1: objAccount.pending_settlement_t1,
            pending_settlement_t2: objAccount.pending_settlement_t2,
            pending_settlement_tother: objAccount.pending_settlement_tother,
            total_market_value: objAccount.total_market_value,
            account_balance: objAccount.account_balance,
            open_order: objAccount.open_order,
            available_balance: objAccount.available_balance,
            cash_balance: objAccount.cash_balance,
            net_exposure: objAccount.net_exposure,
            total_today_change_amount: objAccount.total_today_change_amount,
            total_today_change_percent: objAccount.total_today_change_percent,
            total_profit_amount: objAccount.total_profit_amount,
            total_profit_percent: objAccount.total_profit_percent,
            securities_at_cost: objAccount.securities_at_cost,
            sell_open_order: objAccount.sell_open_order,
            equities_cost_to_close: objAccount.equities_cost_to_close,
            total_pl_margin_position: objAccount.total_pl_margin_position,
            value_of_position: objAccount.value_of_position,
            account_value: objAccount.account_value,
            not_available_as_margin_collateral: objAccount.not_available_as_margin_collateral,
            initial_margin_impact: objAccount.initial_margin_impact,
            initial_margin_impact_convert: objAccount.initial_margin_impact_convert,
            initial_margin_reserved: objAccount.initial_margin_reserved,
            initial_margin_reserved_convert: objAccount.initial_margin_reserved_convert,
            initial_margin_available: objAccount.initial_margin_available,
            maintenance_margin_reserved: objAccount.maintenance_margin_reserved,
            maintenance_margin_reserved_convert: objAccount.maintenance_margin_reserved_convert,
            maintenance_margin_available: objAccount.maintenance_margin_available,
            margin_utilisation: objAccount.margin_utilisation,
            margin_ratio: objAccount.margin_ratio,
            pl_of_margin: objAccount.pl_of_margin,
            stockAtCost: objAccount.securities_at_cost,
            cost_to_close: objAccount.cost_to_close,
            future_open_order_fee: objAccount.future_open_order_fee,
            margin_type: objAccount.margin_type
        };
        const listMarginLevel = objAccount.list_margin_level || []
        this.listMarginConfig = listMarginLevel.length ? this.preDataDrawChart({ listMarginLevel }) : this.listMarginConfig
        this.isMount && this.setState(Object.assign(accountInfo, {
            data: data,
            currency: accountInfo.currency || this.state.currency
        }));
    }

    realtimeDataBalances(data) {
        if (data.account_id && this.state.accountObj.account_id !== data.account_id) return;
        this.isMount && this.setState({
            data
        })
    }

    componentWillUnmount() {
        try {
            this.isMount = false
            removeEventListener(EVENTNAME.clickToRefresh, this.refreshData);
            removeEventListener(EVENTNAME.connectionChanged, this.changeConnection);
            this.emitRefreshID && this.emitRefreshID.remove();
            if (this.state.accountObj && this.state.accountObj.account_id) {
                unregisterAccount(this.state.accountObj.account_id, this.realtimeDataBalances, 'accountsummary');
                unregisRealtime({
                    callback: this.realtimeData
                });
            }
        } catch (error) {
            logger.error('componentWillUnmount On PortfolioSummary', error)
        }
    }

    dataReceivedFromSearchAccount(data) {
        if (data) {
            this.changeAccount(data)
            this.props.send({
                account: data
            })
        }
    }

    getCashByAccount() {
        try {
            if (!this.account_id) return;
            const urlBalancesAccount = getUrlTotalPosition(`${this.account_id}` || '');
            this.props.loading(true)
            getData(urlBalancesAccount)
                .then(response => {
                    this.props.loading(false)
                    const dataCashAccount = response.data || {};
                    this.isMount && this.setState({
                        cashAvailable: dataCashAccount.available_balance_au
                    })
                })
                .catch(error => {
                    logger.log(error)
                    this.props.loading(false)
                    this.isMount && this.setState({
                        cashAvailable: '--'
                    })
                })
        } catch (error) {
            logger.error('getCashByAccount On NewOrder ', error)
        }
    }

    tempFormatDigit(number, lightBlueColor) {
        if (['AUD', 'USD'].indexOf(this.state.currency) > -1) {
            const text = typeof number === 'number' ? formatNumberValue(number, true) + '' || '0.00' : (formatNumberValue(number, true) || '0.00');
            const strTemp = text.replace(/([^-]+)/, '$$' + '$1 ' + (this.state.currency));
            return (
                <div className={`itemRight showTitle ${lightBlueColor ? 'lightBlueColor' : ''}`}>
                    {strTemp || '--'}
                </div>
            )
        } else if (this.state.currency === 'VND') {
            const text = formatNumberVolume(number, true) + '' || '0';
            const strTemp = text.replace(/([^-]+)/, '$1 ' + (this.state.currency));
            return (
                <div className={`itemRight showTitle ${lightBlueColor ? 'lightBlueColor' : ''}`}>
                    {strTemp || '--'}
                </div>
            )
        } else {
            const text = typeof number === 'number' ? formatNumberValue(number, true) + '' || '0.00' : (formatNumberValue(number, true) || '0.00');
            const strTemp = text.replace(/([^-]+)/, '$1 ' + (this.state.currency || ''));
            return (
                <div className={`itemRight showTitle ${lightBlueColor ? 'lightBlueColor' : ''}`}>
                    {strTemp || '--'}
                </div>
            )
        }
    }
    tempFormatOnly(number) {
        const text = typeof number === 'number' ? formatNumberValue(number, true) + '' || '0.00' : (formatNumberValue(number, true) || '0.00');
        let txtValue = text;
        if (number === '--') {
            txtValue = '--'
        } else {
            txtValue = text.replace(/([^-]+)/, '$1 ' + '%')
        }
        return txtValue;
    }
    tempFormatDigitPercent(number) {
        const text = typeof number === 'number' ? formatNumberValue(number, true) + '' || '0.00' : (formatNumberValue(number, true) || '0.00');
        let txtValue = text;
        if (number === '--') {
            txtValue = '--'
        } else {
            txtValue = text.replace(/([^-]+)/, '$1 ' + '%')
        }
        if (number < 0) {
            return (
                <div className={`itemRight showTitle ${s.priceDown}`}>
                    {txtValue}
                </div>
            )
        } else if (number > 0) {
            return (
                <div className={`itemRight showTitle ${s.priceUp}`}>
                    {txtValue}
                </div>
            )
        } else if (number === 0) {
            return (
                <div className="itemRight showTitle">
                    {txtValue}
                </div>
            )
        } else if (number === '--') {
            return (
                <div className="itemRight showTitle">
                    {txtValue}
                </div>
            )
        }
    }

    tempFormatDigitColor(number) {
        let text = (formatNumberValue(number, true) + '' || '0.00');
        if (this.state.currency === 'VND') {
            text = (formatNumberVolume(number, true) + '' || '0');
        }
        let strTemp = '';
        if (number === '--') {
            strTemp = '--'
        } else {
            if (['USD', 'AUD'].indexOf(this.state.currency) > -1) {
                strTemp = text.replace(/([^-]+)/, '$$' + '$1 ' + (this.state.currency));
            } else {
                strTemp = text.replace(/([^-]+)/, '$1 ' + (this.state.currency || ''));
            }
        }
        if (number === '--') {
            return (
                <div className="itemRight showTitle">
                    {strTemp}
                </div>
            )
        } else if (number > 0) {
            return (
                <div className={`itemRight showTitle ${s.priceUp}`}>
                    {strTemp}
                </div>
            )
        } else if (number < 0) {
            return (
                <div className={`itemRight showTitle ${s.priceDown}`}>
                    {strTemp}
                </div>
            )
        } else if (number === 0 || number === '0') {
            return (
                <div className="itemRight showTitle">
                    {strTemp}
                </div>
            )
        }
    }

    addClass = () => {
        this.isMount && this.setState({
            show: !this.state.show
        })
    }

    handleClickIcon = e => {
        showModal({
            component: ConfirmAccountSummary,
            props: {
                type: 'Remove'
            }
        })
    }

    changeConnection = (isConnected) => {
        if (isConnected && this.needToRefresh) {
            this.needToRefresh = false;
            this.refreshData('refresh');
        }
    }

    componentDidMount() {
        try {
            this.isMount = true
            addEventListener(EVENTNAME.clickToRefresh, this.refreshData);
            addEventListener(EVENTNAME.connectionChanged, this.changeConnection);
            this.emitRefreshID = this.accountRefresh && this.accountRefresh.addListener(eventEmitter.REFRESH_DATA_ACCOUNT, this.refreshData.bind(this));
        } catch (error) {
            logger.error('componentDidMount On PortfolioSummary', error)
        }
    }
    showSearchAccount = (show) => {
        if (this.isModifyOrder) return;
        this.view.searchingAccount = show;
        this.forceUpdate();
        if (!show) return;
        setTimeout(() => {
            this.searchAccountDom && this.searchAccountDom.focus();
        }, 10)
    }
    renderChart() {
        const listReturn = []
        const ratioMarginPercent = this.maxValueConfig ? ((this.state.data.margin_ratio * 100 / this.maxValueConfig) > 98 ? 98 : (this.state.data.margin_ratio * 100 / this.maxValueConfig)) : 0;
        if (this.listMarginConfig.length) {
            listReturn.push(
                <div key={uuidv4()} className='maker' style={{
                    left: `${ratioMarginPercent < 0 ? 0 : ratioMarginPercent}%`
                }}>
                    <div style={{ backgroundColor: 'red' }}></div>
                    <div className='makerIcon' style={{}}>
                        <Icon hoverColor='var(--secondary-default)' className='iconMaker' src='navigation/arrow-drop-down'></Icon>
                    </div>
                </div>
            )
            for (let index = 0; index < this.listMarginConfig.length; index++) {
                const element = this.listMarginConfig[index];
                listReturn.push(
                    <div key={index} className='itemChart' style={{ background: element.color, width: `${element.percent}%` }}>
                    </div>
                )
            }
        }
        return listReturn;
    }
    renderPercentConfig() {
        const listReturn = []
        const marginRatio = this.state.data.margin_ratio;
        for (let index = 0; index < this.listMarginConfig.length; index++) {
            const element = this.listMarginConfig[index];
            let val = 0;
            if (marginRatio > 100) {
                val = element.value >= 100 ? `100+` : element.value;
            } else {
                val = formatNumberValue(element.value > 100 ? 100 : element.value);
            }
            listReturn.push(
                <div key={`listReturn_${index}`} className='textChart showTitle' style={{ width: `${element.percent}%` }}>
                    {`${val}%`}
                </div>
            )
        }
        return listReturn;
    }
    renderInfoTxt() {
        const hasFullCol = (this.hasRole8 || this.hasRole38)
        return (
            <div className='accountInfo'>
                <div className={`topClassInfo ${hasFullCol ? 'leftClassInfo' : 'leftClassInfo1'}`}>
                    <div className="second">
                        <div className="size--4">
                            <div className="itemLeft headerLarge showTitle" style={{ opacity: 1, textAlign: 'left' }}>
                                <Lang>lang_cash_and_position</Lang>
                            </div>
                        </div>
                        {(this.hasRole37 || this.hasRole38 || this.hasRole8) ? (<div>
                            <div className="itemLeft text-capitalize showTitle">
                                <Lang>lang_cash_balance</Lang>
                            </div>
                            <div className="itemRight">
                                {this.tempFormatDigit(this.state.data.cash_balance) || '--'}
                            </div>
                        </div>) : null}
                        {(this.hasRole37 || this.hasRole8) ? (<div className="">
                            <div className="itemLeft">
                                <div className="toggleMain flex" onClick={() => this.addClass()} ref={dom => {
                                    if (dom) {
                                        dom.onclick = () => {
                                            dom.classList.contains('show') ? dom.classList.remove('show') : dom.classList.add('show');
                                        }
                                    }
                                }}>
                                    <div className="toggleArrow">
                                        <Icon src='hardware/keyboard-arrow-right'></Icon>
                                    </div>
                                    <div className='transtionStatus showTitle'><Lang>lang_transaction_not_booked</Lang></div>
                                </div>
                                <div className='showTitle next' style={{ display: 'inline-flex', marginLeft: '4px' }}>
                                    <Icon
                                        key={new Date()}
                                        src='action/info-outline'
                                        hoverColor='rgb(197, 203, 206)'
                                    /* onClick={this.handleClickIcon} */
                                    />
                                </div>
                                <div className='firstLetterUpperCase' style={{ display: 'none' }}>
                                    <Lang>lang_summary_popup</Lang>
                                </div>
                            </div>
                            <div className="">
                                {this.tempFormatDigitColor(this.state.data.pending_settlement) || '--'}
                            </div>
                        </div>) : null}
                        {
                            (this.hasRole37 || this.hasRole8) && this.state.show
                                ? <NoTag>
                                    <div className='toggleSub'>
                                        <div className="itemLeft firstLetterUpperCase itemToggle showTitle">
                                            <Lang>lang_today</Lang>
                                        </div>
                                        <div className="itemToggleRight">
                                            {this.tempFormatDigitColor(this.state.data.pending_settlement_t0) || '--'}
                                        </div>
                                    </div>
                                    <div className='toggleSub'>
                                        <div className="itemLeft firstLetterUpperCase itemToggle showTitle">
                                            <Lang>lang_t1</Lang>
                                        </div>
                                        <div className="itemToggleRight">
                                            {this.tempFormatDigitColor(this.state.data.pending_settlement_t1) || '--'}
                                        </div>
                                    </div>
                                    <div className='toggleSub'>
                                        <div className="itemLeft firstLetterUpperCase itemToggle showTitle">
                                            <Lang>lang_t2</Lang>
                                        </div>
                                        <div className="itemToggleRight">
                                            {this.tempFormatDigitColor(this.state.data.pending_settlement_t2) || '--'}
                                        </div>
                                    </div>
                                    <div className='toggleSub'>
                                        <div className="itemLeft firstLetterUpperCase itemToggle showTitle">
                                            <Lang>lang_others</Lang>
                                        </div>
                                        <div className="itemToggleRight">
                                            {this.tempFormatDigitColor(this.state.data.pending_settlement_tother) || '--'}
                                        </div>
                                    </div>
                                    {/* Open buy */}
                                    <div className='toggleSub'>
                                        <div className="itemLeft text-capitalize itemToggle showTitle">
                                            <Lang>lang_pen_buy_orders</Lang>
                                        </div>
                                        <div className="itemToggleRight">
                                            {this.tempFormatDigitColor(this.state.data.open_order) || '--'}
                                        </div>
                                    </div>
                                    {/* Open SELL */}
                                    <div className='toggleSub'>
                                        <div className="itemLeft text-capitalize itemToggle showTitle">
                                            <Lang>lang_pen_sell_orders</Lang>
                                        </div>
                                        <div className="itemToggleRight">
                                            {this.tempFormatDigitColor(this.state.data.sell_open_order) || '--'}
                                        </div>
                                    </div>
                                    {/* EST FEES */}
                                    {(this.hasRole8) ? (<div className='toggleSub'>
                                        <div className="itemLeft itemToggle showTitle">
                                            <Lang>lang_est_fees_for_open_futures_orders</Lang>
                                        </div>
                                        <div className="itemToggleRight">
                                            {this.tempFormatDigitColor(this.state.data.future_open_order_fee) || '--'}
                                        </div>
                                    </div>) : null}
                                </NoTag>
                                : null
                        }
                        {(this.hasRole37 || this.hasRole8) ? (<div>
                            <div className="itemLeft text-capitalize headerNormal showTitle">
                                <Lang>lang_cash</Lang>
                            </div>
                            <div className="itemRight headerNormal">
                                {this.tempFormatDigit(this.state.data.available_balance) || '--'}
                            </div>
                        </div>) : null}
                        {(this.hasRole37 || this.hasRole8) ? (<div>
                            <div className="itemLeft itemLeftExtended undoFlex showTitle">
                                <Lang>lang_value_of_stock_etfs_bonds_funds</Lang>
                            </div>
                            <div className="itemRight">
                                {this.tempFormatDigit(this.state.data.total_market_value) || '--'}
                            </div>
                        </div>) : null}
                        {(this.hasRole8) ? (<div>
                            <div className="itemLeft itemLeftExtended undoFlex showTitle">
                                <Lang>lang_profit_loss_of_margin_positions</Lang>
                            </div>
                            <div className="itemRight">
                                {this.tempFormatDigitColor(this.state.data.pl_of_margin) || '--'}
                            </div>
                        </div>) : null}
                        {(this.hasRole37 || this.hasRole8) ? (<div>
                            <div className="itemLeft itemLeftExtended undoFlex showTitle">
                                <Lang>lang_value_of_positions</Lang>
                            </div>
                            <div className="itemRight">
                                {this.tempFormatDigit(this.state.data.value_of_position) || '--'}
                            </div>
                        </div>) : null}

                        {(this.hasRole37 || this.hasRole8 || this.hasRole38) ? (<div>
                            <div className="itemLeft text-capitalize headerNormal showTitle">
                                <Lang>lang_account_value</Lang>
                            </div>
                            <div className="itemRight headerNormal">
                                {this.tempFormatDigit(this.state.data.account_value) || '--'}
                            </div>
                        </div>) : null}
                        {/* {
                                this.state.show
                                    ? null : <NoTag>
                                        <div className='opt1' />
                                        <div className='opt1' />
                                        <div className='opt1' />
                                        <div className='opt1' />
                                    </NoTag>
                            } */}
                    </div>
                </div>
                <div className={`topClassInfo  ${hasFullCol ? 'rightClassInfo' : 'rightClassInfo1'} rightClassInfoExtend`}>
                    {(this.hasRole8 || this.hasRole38) ? (<div className={`${hasFullCol ? 'second' : 'second1'} secondExtendedNew`}>
                        <div className="size--4">
                            <div className="itemLeft text-capitalize headerLarge showTitle" style={{ opacity: 1 }}>
                                <Lang>lang_margin</Lang>
                            </div>
                            <div className="itemRight">
                            </div>
                        </div>
                        {(this.hasRole8 || this.hasRole38) ? (<div>
                            <div className="itemLeft itemLeftExtended undoFlex showTitle">
                                <Lang>lang_not_available_as_margin_collateral</Lang>
                            </div>
                            {this.tempFormatDigit(this.state.data.not_available_as_margin_collateral) || '--'}
                        </div>) : null}
                        {(this.hasRole8 || this.hasRole38) ? (<div>
                            <div className="itemLeft text-capitalize undoFlex showTitle">
                                <Lang>lang_maintenance_margin_reserved</Lang>
                            </div>
                            {this.tempFormatDigit(this.state.data.maintenance_margin_reserved_convert) || '--'}
                        </div>) : null}
                        {(this.hasRole8 || this.hasRole38) ? (<div>
                            <div className="itemLeft text-capitalize headerNormalSpecial showTitle">
                                <Lang>lang_initial_margin_available</Lang>
                            </div>
                            {this.tempFormatDigit(this.state.data.initial_margin_available) || '--'}
                        </div>) : null}
                        {(this.hasRole8 || this.hasRole38) ? (<div className="lagerRow">
                            <div className="itemFirst">
                                {
                                    this.renderChart()
                                }
                            </div>
                            <div className="item">
                                {
                                    this.renderPercentConfig()
                                }
                            </div>
                            <div className="itemLast text-capitalize showTitle">
                                <Lang>lang_margin_ratio_level</Lang>
                            </div>
                        </div>) : null}
                        {(this.hasRole8 || this.hasRole38) ? (<div>
                            <div className="itemLeft text-capitalize headerNormal showTitle">
                                <Lang>lang_margin_ratio</Lang>
                            </div>
                            <div className={`itemRight headerNormal showTitle ${this.state.data.margin_ratio > 0 ? s.priceUp : s.priceDown}`}>
                                {this.tempFormatOnly(this.state.data.margin_ratio) || '--'}
                            </div>
                        </div>) : null}
                    </div>) : null}
                    <div className={`${hasFullCol ? 'second' : 'second1'}`} style={{ opacity: 1 }}>
                        <div className="size--4">
                            <div className="itemLeft text-capitalize headerLarge showTitle">
                                <Lang>lang_performance</Lang>
                            </div>
                            <div className="itemRight">
                            </div>
                        </div>
                        <div>
                            <div className="itemLeft showTitle text-capitalize">
                                <Lang>lang_percent_profit_loss</Lang>
                            </div>
                            <div className="itemRight">
                                {this.tempFormatDigitPercent(this.state.data.total_profit_percent) || '--'}
                            </div>
                        </div>
                        <div>
                            <div className="itemLeft itemLeftExtended showTitle text-capitalize">
                                <Lang>lang_unrealized_profit_and_loss</Lang>
                            </div>
                            <div className="itemRight">
                                {this.tempFormatDigitColor(this.state.data.total_profit_amount) || '--'}
                            </div>
                        </div>
                        <div>
                            <div className="itemLeft showTitle">
                                <Lang>lang_percent_today_change</Lang>
                            </div>
                            <div className="itemRight">
                                {this.tempFormatDigitPercent(this.state.data.total_today_change_percent) || '--'}
                            </div>
                        </div>
                        <div>
                            <div className="itemLeft showTitle">
                                <Lang>lang_today_change</Lang>
                            </div>
                            <div className="itemRight">
                                {this.tempFormatDigitColor(this.state.data.total_today_change_amount) || '--'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
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
            const accountId = this.state.accountObj && this.state.accountObj.account_id
            const accountName = this.state.accountObj && this.state.accountObj.account_name
            const checkShowAccount = checkShowAccountSearch();
            return (
                <div className='accountSummaryContainer qe-widget'>
                    <div className={`header-wrap flex ${this.collapse ? 'collapse' : ''}`}>
                        <div className='navbar'>
                            <div className='accountSumSearch size--3'>
                                <div className='accSearchRowAd'>
                                    <SearchAccount
                                        accountSumFlag={true}
                                        accountId={accountId}
                                        dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount.bind(this)} />
                                    <div className={`rightRowOrderPad accSumName size--3 showTitle`}>{`${accountName || ''} ` + `${accountId ? '(' + accountId + ')' : ''}`}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
                    <div id='accountSummary' className={'containerTheMost'}>
                        {(this.hasRole38 || this.hasRole37 || this.hasRole8) ? this.renderInfoTxt() : null}
                    </div>
                </div>
            )
        } catch (error) {
            logger.error('render On PortfolioSummary', error)
        }
    }
}

export default PortfolioSummary
