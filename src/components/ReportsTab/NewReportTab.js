import React from 'react';
import NewReport from '../NewReport';
import DropDown from '../DropDown';
import logger from '../../helper/log';
import {
    checkPropsStateShouldUpdate,
    hideElement,
    getReportExcelFile
} from '../../helper/functionUtils';
import dataStorage from '../../dataStorage';
import DatePicker, { getStartTime, getEndTime, getResetMaxDate } from '../Inc/DatePicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import SearchAccount from '../SearchAccount';
import uuidv4 from 'uuid/v4';
import ReportType from '../../constants/report_type';
import { getReportPdfFileUrl } from '../../helper/request';
import ExampleCustomInput from '../Inc/ExampleCustomInput';
import optionsDrop from '../../constants/options_drop_down';
import ToggleLine from '../Inc/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'
class NewReportTab extends React.Component {
    constructor(props) {
        super(props);
        const initState = this.props.loadState()
        this.id = uuidv4();
        this.url = '';
        this.isShow = true;
        this.collapse = initState.collapse ? 1 : 0

        this.state = {
            tabActiveContainer: dataStorage.env_config.roles.dayReport ? 2 : 3,
            minDate: getStartTime(moment().add(-1, 'day'), 'GMT'),
            maxDate: getEndTime(moment().add(-1, 'day'), 'GMT'),
            value: 1,
            defaultOption: 'Day',
            clickDatePicker: false,
            accountObj: {}
        };
        // console.log('initState --------------------------------->', initState)
        Object.assign(this.state, initState)
        props.glContainer.on('show', () => {
            hideElement(props, false, this.id, () => {
                this.isShow = true;
            });
        });
        props.glContainer.on('hide', () => {
            hideElement(props, true, this.id, () => {
                this.isShow = false;
            });
            this.removeFloating()
        });
        this.changeAccount = this.changeAccount.bind(this);
        this.handleChangeMinDate = this.handleChangeMinDate.bind(this);
        this.handleChangeMaxDate = this.handleChangeMaxDate.bind(this);
        this.onSelectDropDown = this.onSelectDropDown.bind(this);
        this.handleDropDownReport = this.handleDropDownReport.bind(this);
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
                accountObj: account
            })
            this.props.send({
                account: account
            })
        }
    }

    renderContentTab(state) {
        try {
            let type = ReportType.FINANCIAL_TRANSACTIONS;
            const fDate = this.state.minDate && this.state.minDate.format('DD/MM/YY');
            const tDate = this.state.maxDate && this.state.maxDate.format('DD/MM/YY');
            let accountId = (this.state.accountObj && this.state.accountObj.account_id) || '';
            switch (state) {
                case 1:
                    type = ReportType.FINANCIAL_TRANSACTIONS;
                    break;
                case 2:
                    type = ReportType.PORTFOLIO_VALUATION;
                    break;
                case 3:
                    type = ReportType.TRADE_ACTIVITY;
                    break;
                case 4:
                    type = ReportType.MORRISION_PORTFOLIO_VALUATION;
                    break;
                default:
                    type = ReportType.FINANCIAL_TRANSACTIONS;
                    break;
            }
            this.url = accountId ? getReportPdfFileUrl(type, accountId, fDate, this.state.tabActiveContainer === 2 ? fDate : tDate) : '';
            return <NewReport
                url={this.url}
                {...this.props}
            />
        } catch (error) {
            logger.error('renderContentTab On ReportsTab' + error)
        }
    }

    handleDropDownReport = (type) => {
        try {
            if (type === this.state.tabActiveContainer) return;
            this.setState({
                minDate: this.state.minDate,
                maxDate: this.minDate || getEndTime(moment().add(-1, 'day'), 'GMT'),
                tabActiveContainer: type
            })
            this.props.saveState({
                minDate: this.state.minDate,
                maxDate: this.minDate,
                tabActiveContainer: type
            })
        } catch (error) {
            logger.error('handleDropDownReport On ReportsTab' + error)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (dataStorage.checkUpdate) {
                return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On ReportsTab' + error)
        }
    }

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
            } else {
                startDate = getStartTime(value, 'GMT').add(-1, 'day')
                endDate = getEndTime(moment(), 'GMT').add(-1, 'day')
                this.setState({
                    clickDatePicker: false,
                    minDate: startDate,
                    maxDate: endDate,
                    defaultOption: value
                })
            }
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

    dataReceivedFromSearchAccount(data) {
        if (data) {
            this.changeAccount(data)
            this.props.send({
                account: data
            })
        }
    }

    funcDownCsv(state) {
        if (this.csvWoking) return;
        this.csvWoking = true;
        try {
            let type = ReportType.FINANCIAL_TRANSACTIONS;
            switch (state) {
                case 1:
                    type = 'Cash_Ledger_Transactions';
                    break;
                case 2:
                    type = 'Porfolio_Valuation';
                    break;
                case 3:
                    type = 'Trade_Summary';
                    break;
                case 4:
                    type = 'Porfolio_Valuation';
                    break;
                default:
                    type = 'Cash_Ledger_Transactions';
                    break;
            }
            // const urlCsv = accountId ? getReportPdfFileUrl(type, accountId, fDate, this.state.tabActiveContainer === 2 ? fDate : tDate) : '';
            const urlCsv = this.url + '&fileType=Excel'
            getReportExcelFile({
                url: urlCsv,
                fileName: type + '_export_' + moment().tz('GMT').format('HH_mm_ss'),
                dom: this.dom
            }, () => {
                this.csvWoking = false;
            })
        } catch (error) {
            logger.error('renderContentTab On ReportsTab' + error)
        }
    }
    printReport() {
        dataStorage.printFunc && dataStorage.printFunc[this.url] && dataStorage.printFunc[this.url]();
    }

    downloadReport() {
        dataStorage.downloadFunc && dataStorage.downloadFunc[this.url] && dataStorage.downloadFunc[this.url]();
    }
    checkToday(date) {
        const now = moment().tz('GMT');
        const curYear = now.format('YYYY');
        const curMonth = now.format('MM');
        const curDay = now.format('DD');
        const day = date.format('YYYY');
        const month = date.format('MM');
        const year = date.format('DD');
        if (day === curDay && month === curMonth && year === curYear) return true;
        return false;
    }

    realTimeDataUser(value) {
        try {
            if (value.timezone) {
                // const dateConver = moment(this.state.maxDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                this.setState({
                    minDate: getStartTime(this.state.minDate),
                    maxDate: getEndTime(getResetMaxDate(this.state.maxDate))
                }, () => {
                    this.onSelectDropDown('Custom');
                })
            }
        } catch (ex) {
            logger('realTimeDataUser')
        }
    }

    collapseFunc = (collapse) => {
        this.collapse = collapse ? 1 : 0
        this.props.saveState({
            collapse: this.collapse
        })
        this.forceUpdate()
    }

    getReportTypeOptions() {
        if (dataStorage.env_config.roles.dayReport) return optionsDrop.optionsTransactionDayReport
        return optionsDrop.optionsTransactionNewReport
    }

    getReportDurations() {
        if (dataStorage.env_config.roles.dayReport) return optionsDrop.optionsDayReport
        return optionsDrop.optionsDayNewReport
    }

    createMoreOption = () => {
        const check = this.checkToday(moment(this.state.maxDate));
        const dateString = 'Mon May 10 2021 07:00:00 GMT+0700 (Indochina Time)';
        const dateObj = new Date(dateString);
        const momentObj = moment(dateObj);
        return [
            {
                component: <div className='fullw100'>
                    <DropDown
                        translate={true}
                        className="DropDownTimeTab"
                        options={this.getReportTypeOptions()}
                        value={this.state.tabActiveContainer}
                        onChange={this.handleDropDownReport}
                    />
                </div>
            },
            {
                component: (this.state.tabActiveContainer !== 4)
                    ? <div className={`fullw100`}>
                        <DropDown
                            translate={true}
                            className={`DropDownTimeTab ${this.state.clickDatePicker ? 'blur' : ''}`}
                            options={this.getReportDurations()}
                            value={this.state.defaultOption}
                            onChange={this.onSelectDropDown}
                        />
                    </div>
                    : <div></div>
            },
            {
                component: this.state.defaultOption === 'Custom' || (this.state.tabActiveContainer === 4)
                    ? <div className="input-date-gr">
                        <DatePicker
                            customInput={<ExampleCustomInput type='from' />}
                            selected={this.state.minDate}
                            minDate={momentObj}
                            maxDate={check ? moment() : this.state.maxDate}
                            onChange={this.handleChangeMinDate.bind(this)}
                            // isMinDate={true}
                            timeZone={'GMT'}
                        />
                    </div>
                    : null
            },
            {
                component: !dataStorage.env_config.roles.dayReport && this.state.defaultOption === 'Custom' && (this.state.tabActiveContainer !== 2 && this.state.tabActiveContainer !== 4)
                    ? <div className="input-date-gr input-date-gr-to">
                        <DatePicker
                            customInput={<ExampleCustomInput type='to' />}
                            selected={this.state.maxDate}
                            minDate={this.state.minDate}
                            maxDate={moment()}
                            onChange={this.handleChangeMaxDate.bind(this)}
                            // isReport={true}
                            timeZone={'GMT'}
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
                value: 'ExportExcel',
                label: 'lang_export_excel',
                callback: () => this.funcDownCsv(this.state.tabActiveContainer)
            },
            {
                value: 'Print',
                label: 'lang_print',
                callback: () => this.printReport(true)
            },
            {
                value: 'Download',
                label: 'lang_download',
                callback: () => this.downloadReport()
            }
        ]
    }

    render() {
        const accountId = (this.state.accountObj && this.state.accountObj.account_id) || '';
        const accountName = (this.state.accountObj && this.state.accountObj.account_name) || '';
        try {
            return (
                <div id='rootReportsTab' className='rootReportsTab qe-widget' ref={dom => this.dom = dom}>
                    <div className={`header-wrap isMoreOption flex ${this.collapse ? 'collapse' : ''}`}>
                        <div className='navbar'>
                            <div className='accSearchRowAd'>
                                <SearchAccount
                                    accountSumFlag={true}
                                    accountId={accountId}
                                    dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount.bind(this)} />
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
            console.log(moment(date).format('DD MMM YYYY'))
            this.setState({
                minDate: date,
                value: 0
            }, () => {
                if (this.state.tabActiveContainer !== 2) {
                    this.handleAllMaxMinDate();
                }
                this.checkFromDate = moment(date).tz('GMT').format('DD/MM/YYYY');
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
                this.handleAllMaxMinDate();
                this.checkToDate = moment(date).tz('GMT').format('DD/MM/YYYY');
            })
            this.props.saveState({
                maxDate: date
            })
        } catch (error) {
            logger.error('handleChangeMaxDate On ReportsTab' + error)
        }
    }

    handleAllMaxMinDate() {
        try {
            this.onSelectDropDown('Custom')
        } catch (err) {
            console.log('handleAllMaxMinDate')
        }
    }

    connectionChanged = isConnected => {
        if (isConnected) {
            this.changeAccount(dataStorage.accountInfo);
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

    componentWillUnmount() {
        try {
            removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
            this.removeFloating()
        } catch (error) {
            logger.error('componentWillUnmount On Indexes' + error)
        }
    }

    componentDidMount() {
        try {
            let div = document.getElementById('datePickerContent');
            if (!div) {
                div = document.createElement('div');
                div.id = 'datePickerContent';
                document.body.appendChild(div);
            }
            addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
        } catch (error) {
            logger.error('componentDidMount On ReportsTab' + error)
        }
    }
}

export default NewReportTab
