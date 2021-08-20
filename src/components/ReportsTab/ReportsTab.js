import React from 'react';
import FinancialSummary from '../FinancialSummary';
import HoldingsValuation from '../HoldingsValuation';
import TransactionSummary from '../TransactionSummary';
import CashAccountSummary from '../CashAccountSummary';
import DropDown from '../DropDown';
import logger from '../../helper/log';
import {
    checkPropsStateShouldUpdate,
    hideElement
} from '../../helper/functionUtils';
import dataStorage from '../../dataStorage';
import DatePicker, { getStartTime, getEndTime, getResetMaxDate } from '../Inc/DatePicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import { translate } from 'react-i18next';
import SearchAccount from '../SearchAccount';
import uuidv4 from 'uuid/v4';
import NoTag from '../Inc/NoTag';
import ExampleCustomInput from '../Inc/ExampleCustomInput'
import optionsDrop from '../../constants/options_drop_down';
import ToggleLine from '../Inc/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'

class ReportsTab extends React.Component {
    constructor(props) {
        super(props);
        const initState = this.props.loadState();
        this.collapse = initState.collapse ? 1 : 0
        const today = new Date();
        const yesterday = today.setDate(today.getDate() - 1);
        const minDate = new Date(yesterday);
        const maxDate = new Date(yesterday);
        this.id = uuidv4();

        minDate.setUTCHours(0, 0, 0, 0);
        maxDate.setUTCHours(0, 0, 0, 0);
        minDate.setFullYear(minDate.getFullYear());
        maxDate.setFullYear(maxDate.getFullYear());
        this.isShow = true;
        this.state = {
            tabActiveContainer: 1,
            minDate: getStartTime(moment().add(-1, 'day'), 'GMT'),
            maxDate: getEndTime(moment().add(-1, 'day'), 'GMT'),
            value: 1,
            defaultOption: 'Day',
            clickDatePicker: false,
            accountObj: {}
        };
        Object.assign(this.state, initState);
        props.glContainer.on('show', () => {
        });
        props.glContainer.on('hide', () => {
            this.removeFloating()
        });
        props.resize((w) => {
            this.width = w;
            this.changeWidthChart(this.width)
            this.setState({
                width: w
            })
        });
        this.changeAccount = this.changeAccount.bind(this);
        this.handleChangeMinDate = this.handleChangeMinDate.bind(this);
        this.handleChangeMaxDate = this.handleChangeMaxDate.bind(this);
        this.onSelectDropDown = this.onSelectDropDown.bind(this);
        this.handleDropDownReport = this.handleDropDownReport.bind(this);
        this.changeWidthChart = this.changeWidthChart.bind(this);
        this.realTimeDataUser = this.realTimeDataUser.bind(this)
        this.props.receive({
            account: this.changeAccount
        });
    }

    changeAccount(account) {
        if (!account) account = dataStorage.accountInfo;
        if (!account || !account.account_id) return
        if (!account) account = {};
        if (!this.state.accountObj || this.state.accountObj.account_id !== account.account_id) {
            this.setState({
                accountObj: account,
                currency: account.currency
            })
            this.props.send({
                account: account
            })
        }
    }

    loadingoff() {
        try {
            this.props.loading(false);
        } catch (error) {
            logger.error('loadingoff On ReportsTab' + error)
        }
    }

    loadingon() {
        try {
            this.props.loading(true);
        } catch (error) {
            logger.error('loadingon On ReportsTab' + error)
        }
    }

    renderContentTab(state) {
        try {
            this.state.maxDate && typeof this.state.maxDate !== 'string' && this.state.maxDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
            let accountId = (this.state.accountObj && this.state.accountObj.account_id) || '';
            let currency = this.state.currency
            switch (state) {
                case 1:
                    return <FinancialSummary isHidden={this.state.isHidden} accountId={accountId} loading={this.props.loading} loadingon={this.loadingon.bind(this)} loadingoff={this.loadingoff.bind(this)} resize={this.props.resize} fromDate={this.state.minDate} toDate={this.state.maxDate} width={this.state.width} currency={currency} glContainer={this.props.glContainer} />
                case 2:
                    return <HoldingsValuation isHidden={this.state.isHidden} accountId={accountId} loading={this.props.loading} loadingon={this.loadingon.bind(this)} loadingoff={this.loadingoff.bind(this)} resize={this.props.resize} fromDate={this.state.minDate} toDate={this.state.maxDate} width={this.state.width} currency={currency} glContainer={this.props.glContainer} />
                case 3:
                    return <CashAccountSummary isHidden={this.state.isHidden} accountId={accountId} loading={this.props.loading} loadingon={this.loadingon.bind(this)} loadingoff={this.loadingoff.bind(this)} resize={this.props.resize} fromDate={this.state.minDate} toDate={this.state.maxDate} currency={currency} glContainer={this.props.glContainer} />
                case 4:
                    return <TransactionSummary isHidden={this.state.isHidden} accountId={accountId} loading={this.props.loading} loadingon={this.loadingon.bind(this)} loadingoff={this.loadingoff.bind(this)} resize={this.props.resize} fromDate={this.state.minDate} toDate={this.state.maxDate} currency={currency} glContainer={this.props.glContainer} />
                default:
                    break;
            }
        } catch (error) {
            logger.error('renderContentTab On ReportsTab' + error)
        }
    }

    handleDropDownReport = (type) => {
        try {
            if (type === this.state.tabActiveContainer) return;
            this.setState({
                tabActiveContainer: type
            });
            this.props.saveState({
                tabActiveContainer: type
            })
        } catch (error) {
            logger.error('handleDropDownReport On ReportsTab' + error)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (dataStorage.checkUpdate) {
                return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state)
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On ReportsTab' + error)
        }
    }

    handleChangeMinDate = (date) => {
        try {
            this.setState({
                clickDatePicker: true,
                minDate: date,
                value: 0
            })
            this.props.saveState({
                clickDatePicker: true,
                minDate: date,
                value: 0
            })
        } catch (error) {
            logger.error('handleChangeMinDate On ReportsTab' + error)
        }
    };

    handleChangeMaxDate = (date) => {
        try {
            this.setState({
                maxDate: date,
                value: 0
            })
            this.props.saveState({
                maxDate: date,
                value: 0
            })
        } catch (error) {
            logger.error('handleChangeMaxDate On ReportsTab' + error)
        }
    };

    onSelectDropDown = (value) => {
        try {
            let startDate
            let endDate
            if (value === 'Custom' && (this.state.defaultOption !== 'Custom')) {
                startDate = getStartTime(moment(), 'GMT').add(-1, 'day')
                endDate = getEndTime(moment(), 'GMT').add(-1, 'day')
                this.setState({
                    clickDatePicker: false,
                    minDate: startDate,
                    maxDate: endDate,
                    defaultOption: 'Custom'
                })
            } else if (value === 'Custom' && (this.state.defaultOption === 'Custom')) {
                this.setState({
                    defaultOption: value
                })
                return;
            } else {
                startDate = getStartTime(value).add(-1, 'day')
                endDate = getEndTime().add(-1, 'day')
                this.setState({
                    clickDatePicker: false,
                    minDate: startDate,
                    maxDate: endDate,
                    defaultOption: value
                })
            }
            this.fromDate = new Date(startDate).getTime();
            this.props.saveState({
                clickDatePicker: false,
                minDate: startDate,
                maxDate: endDate,
                defaultOption: value
            })
        } catch (error) {
            logger.error('onSelectDropDown On ReportsTab' + error)
        }
    };

    changeWidthChart(width, cb) {
        try {
            width >= 640 ? this.setState({ widthClass: 'width50' }, cb)
                : this.setState({ widthClass: 'width100' }, cb)
        } catch (error) {
            logger.error('changeWidthChart On ReportsTab' + error)
        }
    }

    onChangeDate(type, value) {
        if (type === 'from') {
            this.fromDate = value;
            this.props.saveState({ fromDateReq: value })
        } else {
            this.toDate = value;
            this.props.saveState({ toDateReq: value })
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
    renderHeaderAdmin() {
        try {
            let accountId = (this.state.accountObj && this.state.accountObj.account_id) || '';
            let accountName = (this.state.accountObj && this.state.accountObj.account_name) || '';
            return (
                <NoTag>
                    <div>
                        <div className='accSearchRowAd'>
                            <SearchAccount
                                // showInactiveAccount={true}
                                accountSumFlag={true}
                                accountId={accountId}
                                dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount.bind(this)} />
                            <div className={`rightRowOrderPad accSumName size--3 showTitle`}>{`${accountName} ${accountId ? '(' + accountId + ')' : ''}`}</div>
                        </div>
                    </div>
                    <div className="reportLine"></div>
                </NoTag>
            )
        } catch (error) {
            logger.error('renderHeaderAdmin ' + error)
        }
    }

    removeFloating(index) {
        if (!index || index === 1) {
            const datePickerFrom = document.getElementById('datePickerFrom')
            datePickerFrom && this.fromContent && datePickerFrom.contains(this.fromContent) && datePickerFrom.removeChild(this.fromContent);
        }
        if (!index || index === 2) {
            const datePickerTo = document.getElementById('datePickerTo')
            datePickerTo && this.toContent && datePickerTo.contains(this.toContent) && datePickerTo.removeChild(this.toContent);
        }
    }
    checkToday(date) {
        const now = moment().tz(dataStorage.timeZone);
        const curYear = now.format('YYYY');
        const curMonth = now.format('MM');
        const curDay = now.format('DD');
        const day = date.format('YYYY');
        const month = date.format('MM');
        const year = date.format('DD');
        if (day === curDay && month === curMonth && year === curYear) return true;
        return false;
    }
    handleOnClickOutside(isFrom) {
        try {
            if (isFrom && this.checkFromDate === moment(this.state.minDate).format('DD/MM/YYYY')) return;
            if (!isFrom && this.checkToDate === moment(this.state.maxDate).format('DD/MM/YYYY')) return;
            if (typeof (this.fromDate) === 'string') this.fromDate = parseInt(this.fromDate);
            if (typeof (this.toDate) === 'string') this.toDate = parseInt(this.toDate);
            const fromDate = moment(this.fromDate).tz(dataStorage.timeZone).format('DD/MM/YYYY');
            const toDate = moment(this.toDate).tz(dataStorage.timeZone).format('DD/MM/YYYY');
            const newValue = isFrom ? this.fromDate.split('/') : this.toDate.split('/');
            const newDay = parseInt(newValue[0]);
            const newMonth = parseInt(newValue[1]) - 1;
            const newYear = parseInt(newValue[2]);
            const newDate = new Date(newYear, newMonth, newDay);
            if (isFrom) {
                if (fromDate.includes('d') || fromDate.includes('m') || fromDate.includes('y') ||
                    newDate.getTime() > this.state.maxDate.getTime() || !this.checkDateInvalid(newYear, newMonth, newDay)) {
                    this.setState({
                        openDatePickerTo: false,
                        openDatePickerFrom: false
                    })
                } else {
                    this.getDataFromTimeTab(newDate, this.state.maxDate, true);
                    this.setState({
                        minDate: newDate,
                        openDatePickerTo: false,
                        openDatePickerFrom: false
                    })
                }
            } else {
                if (toDate.includes('d') || toDate.includes('m') || toDate.includes('y') ||
                    newDate.getTime() < this.state.minDate.getTime() || !this.checkDateInvalid(newYear, newMonth, newDay)) {
                    this.setState({
                        openDatePickerTo: false,
                        openDatePickerFrom: false
                    })
                } else {
                    this.getDataFromTimeTab(this.state.minDate, newDate, true);
                    this.setState({
                        maxDate: newDate,
                        openDatePickerTo: false,
                        openDatePickerFrom: false
                    })
                }
            }
        } catch (error) {
            logger.error('handleOnClickOutside On ReportsTab' + error)
        }
    }

    collapseFunc = (collapse) => {
        this.collapse = collapse ? 1 : 0
        this.props.saveState({
            collapse: this.collapse
        })
        this.forceUpdate()
    }

    createMoreOption = () => {
        const check = this.checkToday(moment(this.state.maxDate));
        return [
            {
                component: <div className='fullw100'>
                    <DropDown
                        translate={true}
                        className="DropDownTimeTab"
                        options={optionsDrop.optionsTransactionReport}
                        value={this.state.tabActiveContainer}
                        onChange={this.handleDropDownReport}
                    />
                </div>
            },
            {
                component: <div className='fullw100'>
                    <DropDown
                        translate={true}
                        className={`DropDownTimeTab ${this.state.clickDatePicker ? 'blur' : ''}`}
                        options={optionsDrop.optionsDayNewReport}
                        value={this.state.defaultOption}
                        onChange={this.onSelectDropDown}
                    />
                </div>
            },
            {
                component: this.state.defaultOption === 'Custom'
                    ? <div className="input-date-gr">
                        <DatePicker
                            customInput={<ExampleCustomInput type='from' />}
                            selected={this.state.minDate}
                            maxDate={check ? moment() : this.state.maxDate}
                            onChange={this.handleChangeMinDate.bind(this)}
                            isMinDate={true}
                            timeZone={'GMT'}
                            isReport={true}
                        />
                    </div>
                    : null
            },
            {
                component: this.state.defaultOption === 'Custom'
                    ? <div className="input-date-gr input-date-gr-to">
                        <DatePicker
                            customInput={<ExampleCustomInput type='to' />}
                            selected={this.state.maxDate}
                            minDate={this.state.minDate}
                            maxDate={moment()}
                            onChange={this.handleChangeMaxDate.bind(this)}
                            timeZone={'GMT'}
                            isReport={true}
                            dayToAdd={-1}
                        />
                    </div>
                    : null
            }
        ]
    }

    createagSideButtons = () => {
        return [
            {
                value: 'ResetFilter',
                label: 'lang_reset_filter',
                class: 'disabled'
            },
            {
                value: 'Resize',
                label: 'lang_resize',
                class: 'disabled'
            },
            {
                value: 'Columns',
                label: 'lang_columns',
                class: 'disabled'
            },
            {
                value: 'Filters',
                label: 'lang_filters',
                class: 'disabled'
            }
        ]
    }

    render() {
        const accountId = (this.state.accountObj && this.state.accountObj.account_id) || '';
        const accountName = (this.state.accountObj && this.state.accountObj.account_name) || '';
        try {
            return (
                <div id='rootReportsTab' className='rootReportsTab qe-widget'>
                    <div className={`header-wrap isMoreOption flex ${this.collapse ? 'collapse' : ''}`}>
                        <div className='navbar'>
                            <div className='accSearchRowAd'>
                                <SearchAccount
                                    accountSumFlag={true}
                                    accountId={accountId}
                                    dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount.bind(this)}
                                />
                                <div className={`rightRowOrderPad accSumName size--3 showTitle`}>{`${accountName} ${accountId ? '(' + accountId + ')' : ''}`}</div>
                            </div>
                        </div>
                        <MoreOption lstItems={this.createMoreOption()} agSideButtons={this.createagSideButtons()} />
                    </div>
                    <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
                    {this.renderContentTab(this.state.tabActiveContainer)}
                </div >
            );
        } catch (error) {
            logger.error('render On ReportsTab' + error)
        }
    }

    handleChangeMinDate = (date) => {
        try {
            this.setState({
                minDate: date,
                value: 0
            }, () => {
                this.handleAllMaxMinDate(date, this.state.maxDate);
                this.checkFromDate = moment(date).tz(dataStorage.timeZone).format('DD/MM/YYYY');
            })
            this.props.saveState({
                minDate: date
            })
        } catch (error) {
            logger.error('handleChangeMinDate On ReportsTab' + error)
        }
    };

    handleChangeMaxDate = (date) => {
        try {
            this.setState({
                maxDate: date,
                value: 0
            }, () => {
                this.handleAllMaxMinDate(this.state.minDate, date);
                this.checkToDate = moment(date).tz(dataStorage.timeZone).format('DD/MM/YYYY');
            })
            this.props.saveState({
                maxDate: date
            })
        } catch (error) {
            logger.error('handleChangeMaxDate On ReportsTab' + error)
        }
    }

    handleAllMaxMinDate(min, max) {
        try {
            const rangeTime = {
                min: min,
                max: max
            }
            this.onSelectDropDown('Custom', rangeTime)
        } catch (err) {
            console.log('handleAllMaxMinDate')
        }
    }

    realTimeDataUser(value) {
        if (value.timezone) {
            this.setState({
                minDate: getStartTime(this.state.minDate),
                maxDate: getEndTime(getResetMaxDate(this.state.maxDate))
            }, () => {
                this.onSelectDropDown('Custom')
            })
        }
    }
    connectionChanged = (isConnected) => {
        if (isConnected) {
            this.setState({
                fromDate: this.state.minDate.toDate().getTime(),
                toDate: this.state.maxDate.toDate().getTime()
            })
            this.changeAccount(dataStorage.accountInfo);
        }
    }
    componentWillUnmount() {
        try {
            this.removeFloating();
            removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
        } catch (error) {
            logger.error('componentWillUnmount On Indexes' + error)
        }
    }
    componentDidMount() {
        try {
            addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
        } catch (error) {
            logger.error('componentDidMount On ReportsTab' + error)
        }
    }
}

export default translate('translations')(ReportsTab);
