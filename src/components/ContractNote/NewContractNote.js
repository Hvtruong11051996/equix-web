import React, { Component } from 'react';
import s from './NewContractNote.module.css'
import Pdf from '../Inc/Pdf';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';
import SearchBox from '../SearchBox';
import DropDown from '../DropDown';
import logger from '../../helper/log';
import sideEnum from '../../constants/enum'
import { getData, getContractNoteUrl, makeSymbolUrl, postData } from '../../helper/request';
import {
    checkIsAdvisor,
    compareDate,
    checkToday,
    getIntradayNews,
    convertFormatStpOfPicker,
    getNumberToCharDate,
    formatDate,
    formatCompanyName
} from '../../helper/functionUtils';
import Grid from '../Inc/CanvasGrid';
import Lang from '../Inc/Lang';
import dataStorage from '../../dataStorage';
import SearchAccount from '../SearchAccount';
import uuidv4 from 'uuid/v4';
import userTypeEnum from '../../constants/user_type_enum';
import optionsDrop from '../../constants/options_drop_down';
import moment from 'moment-timezone';
import ExampleCustomInput from '../Inc/ExampleCustomInput';
import DatePicker, { getStartTime, getEndTime, convertTimeToGMTString, getResetMaxDate, convertTimeStamp } from '../Inc/DatePicker';
import { registerUser, unregisterUser } from '../../streaming';
import { convertObjFilter, mapSortObj, mapFiltertObj } from '../../helper/FilterAndSort';
import { getApiFilter } from '../api';
import SecurityDetailIcon from '../Inc/SecurityDetailIcon/SecurityDetailIcon'
import ToggleLine from '../Inc/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'

const PAGINATION_DEFAULT = {
    current_page: 1,
    total_count: 0,
    total_pages: 0,
    page_size: 50
}
const lstCheckSide = [
    {
        label: 'buy',
        value: 'B'
    },
    {
        label: 'sell',
        value: 'S'
    }
]
export class ContractNote extends Component {
    constructor(props) {
        super(props);
        const initState = this.props.loadState();
        this.setPage = null;
        this.state = {
            detail: null,
            symbolObj: {},
            filterSelected: initState.filterSelected || 'quarter', // contract note duration mac dinh luon la quarter
            accountObj: {},
            minDate: getStartTime(),
            maxDate: getEndTime()
        }
        this.realTimeDataUser = this.realTimeDataUser.bind(this)
        this.changeValue = this.changeValue.bind(this);
        this.changeAccount = this.changeAccount.bind(this);
        this.props.receive({
            account: this.changeAccount,
            symbol: this.changeValue
        });
        this.pageId = 1;
        this.columns = [
            {
                header: 'lang_day',
                name: 'updated',
                type: TYPE.LABEL,
                formater: (params) => {
                    let data = params.data;
                    return formatDate(data.updated);
                }
            },
            {
                header: 'lang_side',
                name: 'is_buy',
                options: lstCheckSide,
                type: TYPE.LABEL_WIDTH_BG,
                getBackgroundColorKey: (params) => {
                    const side = (params.data.is_buy === 'B' ? 'BUY' : 'SELL');
                    if (side === sideEnum.BUYSIDE) return '--buy-light';
                    return '--sell-light';
                },
                formater: (params) => {
                    const side = (params.data.is_buy === 'B' ? 'BUY' : 'SELL');
                    return side;
                }
            },
            {
                header: 'lang_code',
                name: 'symbol',
                type: TYPE.SYMBOL,
                formater: (params) => {
                    return params.data.display_name || params.data.symbol;
                }
            },
            {
                header: 'lang_security',
                type: TYPE.LABEL,
                name: 'cnote_company_name',
                formater: (params) => {
                    return formatCompanyName(params.data)
                }
            }
        ]
    }

    getFilterOnSearch = (filter, sort, rangeTime, needResetPage) => {
        if (!needResetPage) this.pageId = 1;
        let fromDate;
        let toDate;
        if (this.state.filterSelected === 'custom') {
            if (!rangeTime) {
                rangeTime = {
                    min: this.state.minDate,
                    max: this.state.maxDate
                }
            }
        }
        if (!rangeTime) {
            if (this.state.filterSelected === 'custom') {
                fromDate = convertTimeStamp(getStartTime(moment()))
                toDate = convertTimeStamp(getEndTime())
            } else {
                fromDate = convertTimeStamp(getStartTime(this.state.filterSelected), true)
                toDate = convertTimeStamp(getEndTime())
            }
        } else {
            fromDate = convertFormatStpOfPicker(rangeTime.min, dataStorage.timeZone, true)
            toDate = convertFormatStpOfPicker(rangeTime.max, dataStorage.timeZone)
        }
        const sortDefault = [
            { colId: 'updated', sort: 'desc' }
        ]
        this.sort = mapSortObj(sortDefault, sort, this.sort || []);
        this.filter = mapFiltertObj(filter, this.filter);
        const filterAndSort = {
            query: this.filter || [],
            sort: this.sort || [],
            date: {
                field: 'updated',
                from: Number(fromDate),
                to: Number(toDate)
            }
        }
        if (this.state.filterSelected === 'all') {
            delete filterAndSort.date
        } else {
            filterAndSort.date.from = fromDate;
            filterAndSort.date.to = toDate;
        }
        if (this.state.symbolObj.symbol) {
            filterAndSort.symbol = {
                field: 'symbol',
                value: this.state.symbolObj.symbol
            }
        }
        if (this.state.accountObj.account_id) filterAndSort.account_id = this.state.accountObj.account_id;
        this.filterAndSearch = convertObjFilter(filterAndSort);
        this.getDataContractNote()
    }

    componentWillUnmount() {
        removeEventListener(EVENTNAME.clickToRefresh, this.refreshData)
        removeEventListener(EVENTNAME.connectionChanged, this.changeConnection)
        const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
        unregisterUser(userId, this.realTimeDataUser, 'user_setting')
    }

    refreshData = () => {
        this.getFilterOnSearch();
    }
    changeConnection = (isConnected) => {
        isConnected && this.refreshData('refresh');
    }
    realTimeDataUser(value) {
        try {
            if (value.timezone) {
                this.setState({
                    minDate: getStartTime(this.state.minDate),
                    maxDate: getEndTime(getResetMaxDate(this.state.maxDate))
                }, () => {
                    this.refreshData('refresh');
                })
            }
        } catch (ex) {
            logger('realTimeDataUser')
        }
    }

    componentDidMount() {
        const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
        registerUser(userId, this.realTimeDataUser, 'user_setting');
        addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
        addEventListener(EVENTNAME.connectionChanged, this.changeConnection)
    }

    getDataContractNote() {
        const idRequest = uuidv4();
        const that = this;
        let myRequest;
        let url = ''
        const accountId = this.state.accountObj && this.state.accountObj.account_id
        if (!accountId) {
            this.setPage(PAGINATION_DEFAULT);
            this.setData([]);
            return;
        }
        if (this.filterAndSearch) {
            myRequest = postData;
            url = getApiFilter('cnote', this.pageId);
        } else {
            myRequest = getData;
            that.idRequest = idRequest;
            const symbol = this.state.symbolObj && this.state.symbolObj.symbol
            if (this.state.filterSelected === 'custom') {
                const time = {
                    fromDate: convertTimeToGMTString(getStartTime(this.state.minDate)),
                    toDate: convertTimeToGMTString(getEndTime(this.state.maxDate))
                }
                url = getContractNoteUrl(accountId, symbol, this.state.filterSelected, this.pageId, checkIsAdvisor(), time);
            } else if ((this.state.filterSelected !== 'custom') && (this.state.filterSelected !== 'all')) {
                const time = {
                    fromDate: convertTimeToGMTString(getStartTime(this.state.filterSelected)),
                    toDate: convertTimeToGMTString(getEndTime())
                }
                url = getContractNoteUrl(accountId, symbol, this.state.filterSelected, this.pageId, checkIsAdvisor(), time);
            } else {
                url = getContractNoteUrl(accountId, symbol, this.state.filterSelected, this.pageId, checkIsAdvisor());
            }
        }
        this.props.loading(true);
        myRequest(url, this.filterAndSearch)
            .then(async response => {
                this.props.loading(false);
                if (response.data && response.data.data) {
                    let data = response.data.data;
                    const obj = {};
                    obj.current_page = +response.data.current_page || 1;
                    obj.total_count = +response.data.total_count || 1;
                    obj.total_pages = +response.data.total_pages || 1;
                    obj.page_size = 50;
                    this.setPage(obj);
                    let newData = [];
                    let stringQuery = '';
                    const listSymbol = [];
                    for (let index = 0, length = data.length; index < length; index++) {
                        if (data[index] && data[index].symbol) listSymbol.push(encodeURIComponent(data[index].symbol));
                    }
                    stringQuery = [...new Set(listSymbol)].toString();
                    if (stringQuery) {
                        this.props.loading(true)
                        const urlMarketInfo = makeSymbolUrl(stringQuery);
                        let intradayObj = {};
                        await getIntradayNews(stringQuery).then(obj => {
                            intradayObj = obj;
                        });
                        await getData(urlMarketInfo).then(res => {
                            res = res.data;
                            this.props.loading(false)
                            const dicCompany = {};
                            const dicDisplayName = {};
                            const dicExchange = {};
                            const dicClass = {};
                            const dicSymbolInfo = {};
                            for (let index = 0, length = res.length; index < length; index++) {
                                const element = res[index];
                                dicCompany[element.symbol] = element.company_name || element.company || '';
                                dicDisplayName[element.symbol] = element.display_name || '';
                                dicExchange[element.symbol] = element.exchange || (element.exchanges && element.exchanges[0]) || '';
                                dicClass[element.symbol] = element.class || '';
                                dicSymbolInfo[element.symbol] = element;
                            }
                            for (let index = 0, length = data.length; index < length; index++) {
                                const element = data[index];
                                element.company_name = dicCompany[element.symbol];
                                element.display_name = dicDisplayName[element.symbol];
                                element.exchange = dicExchange[element.symbol];
                                element.class = dicClass[element.symbol];
                                element.symbolInfo = dicSymbolInfo[element.symbol]
                                element.trading_halt = intradayObj[element.symbol];
                                newData.push(element);
                            }
                            this.setData(newData);
                        }).catch(error => {
                            logger.sendLog('error getCompanyNameContractNote', error);
                            this.setPage(PAGINATION_DEFAULT);
                            this.setData([]);
                        })
                    } else {
                        this.setData(data);
                    }
                } else {
                    this.setPage(PAGINATION_DEFAULT);
                    this.setData([]);
                }
            })
            .catch(error => {
                logger.error('error at getDataContractNote', error)
                this.props.loading(false)
                this.setPage(PAGINATION_DEFAULT);
                this.setData([]);
            })
    }
    onFilter(filterSelected) {
        this.setState({
            filterSelected
        }, () => this.getFilterOnSearch());
    }
    dataReceivedFromSearchBox(symbolObj, isDelete) {
        try {
            if (isDelete) {
                this.setState({
                    symbolObj: {}
                }, () => {
                    this.getFilterOnSearch();
                })
            } else {
                this.setState({
                    symbolObj
                }, () => {
                    this.getFilterOnSearch()
                })
                this.props.send({
                    symbol: symbolObj,
                    force: true
                })
            }
        } catch (error) {
            logger.error('dataReceivedFromSearchBox On Contract Note', error)
        }
    }

    changeValue(symbolObj) {
        try {
            if (symbolObj.fromNews && (dataStorage.userInfo.user_type === userTypeEnum.OPERATOR || dataStorage.userInfo.user_type === userTypeEnum.ADVISOR)) return;
            this.setState({
                symbolObj
            }, () => {
                this.getFilterOnSearch();
            })
        } catch (error) {
            logger.error('changeValue On Contract Note', error)
        }
    }
    changeAccount(account) {
        if (!account) account = dataStorage.accountInfo;
        if (!account || !account.account_id) return;
        if (!account) account = {};
        if (!this.state.accountObj || this.state.accountObj.account_id !== account.account_id) {
            this.setState({
                accountObj: account
            }, () => {
                this.getFilterOnSearch()
                this.props.send({
                    account: account
                })
            })
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

    triggerButton = (btn) => {
        this.dom.querySelector('button ' + btn).click()
    }
    createagSideButtons = () => {
        return [
            {
                value: 'ResetFilter',
                label: 'lang_reset_filter',
                callback: () => this.resetFilter(true)
            },
            {
                value: 'Resize',
                label: 'lang_resize',
                callback: () => this.resize()
            },
            {
                value: 'Columns',
                label: 'lang_columns',
                callback: (boundOption) => this.showColumnMenu()
            },
            {
                value: 'Filters',
                label: 'lang_filters',
                callback: (boundOption) => this.showFilterMenu()
            }
        ]
    }

    ChangeMaxMinDate = (date, type) => {
        if (type === 'max') {
            this.setState({
                maxDate: date,
                value: 0
            }, () => {
                this.handleAllMaxMinDate(this.state.minDate, date);
            })
        } else {
            this.setState({
                minDate: date,
                value: 0
            }, () => {
                this.handleAllMaxMinDate(date, this.state.maxDate);
            })
        }
    }
    handleAllMaxMinDate(min, max) {
        const rangeTime = {
            min: min,
            max: max
        }
        this.getFilterOnSearch(null, null, rangeTime)
    }
    onChangeDate(type, value) {
        if (type === 'from') {
            this.fromDate = value;
        } else {
            this.toDate = value;
        }
    }
    createMoreOption = () => {
        const check = checkToday(moment(this.state.maxDate));
        return [
            {
                class: 'width100',
                component: <DropDown
                    options={optionsDrop.listTimeFilter}
                    value={this.state.filterSelected}
                    placeholder={'Week'}
                    translate={true}
                    rightAlign={true}
                    style={{ width: '100%' }}
                    onChange={this.onFilter.bind(this)} />
            },
            {
                component: this.state.filterSelected === 'custom'
                    ? <div className={s.dateGr}>
                        <DatePicker
                            customInput={<ExampleCustomInput type='from' onChangeDate={this.onChangeDate.bind(this, 'from')} />}
                            selected={this.state.minDate}
                            maxDate={check ? moment().tz(dataStorage.timeZone) : this.state.maxDate}
                            onChange={this.ChangeMaxMinDate.bind(this, 'min')}
                            isMinDate={true}
                        />
                        <DatePicker
                            customInput={<ExampleCustomInput type='to' onChangeDate={this.onChangeDate.bind(this, 'to')} />}
                            selected={this.state.maxDate}
                            minDate={this.state.minDate}
                            maxDate={moment().tz(dataStorage.timeZone)}
                            onChange={this.ChangeMaxMinDate.bind(this, 'max')}
                        />
                    </div>
                    : null
            }
        ]
    }

    collapseFunc = (collapse) => {
        this.collapse = collapse ? 1 : 0
        this.props.saveState({
            collapse: this.collapse
        })
        this.forceUpdate()
    }

    changePageAction = num => {
        this.pageId = num;
        this.getFilterOnSearch(null, true);
    }
    setGridPaginate = () => {
        return {
            setPage: cb => {
                this.setPage = cb
            },
            pageChanged: this.changePageAction
        }
    }
    setDetail(detail) {
        try {
            this.setState({
                detail
            });
        } catch (error) {
            logger.error('setDetail exception On contract note', error)
        }
    }
    onRowClicked(item) {
        try {
            this.setDetail(item || null)
        } catch (error) {
            logger.error('onRowClicked On Contract note', error)
        }
    }

    render() {
        let accountId = (this.state.accountObj && this.state.accountObj.account_id) || '';
        let accountName = (this.state.accountObj && this.state.accountObj.account_name) || '';
        let displayName = (this.state.symbolObj && this.state.symbolObj.display_name) || '';
        let symbol = (this.state.symbolObj && this.state.symbolObj.symbol) || ''
        return (
            <div className={s.contractNoteContainer} ref={dom => this.dom = dom}>
                <div className={`${this.collapse === 1 ? s.collapse : ''}`} style={{ display: 'flex' }}>
                    <div className={s.search}>
                        <div className={s.accSearchContainerParent}>
                            <div className={s.accSearchContainer}>
                                <SearchAccount
                                    accountSumFlag={true}
                                    getAllData={true}
                                    accountId={accountId}
                                    dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount.bind(this)} />
                                <div className={s.accName + ' ' + 'showTitle'}>{`${accountName} ${accountId ? '(' + accountId + ')' : ''}`}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <SearchBox
                                resize={this.props.resize}
                                loading={this.props.loading}
                                allowDelete={true}
                                getAllData={true}
                                obj={this.state.symbolObj}
                                symbol={symbol}
                                dataReceivedFromSearchBox={this.dataReceivedFromSearchBox.bind(this)} />
                            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
                                <SecurityDetailIcon
                                    {...this.props}
                                    symbolObj={this.state.symbolObj}
                                    isHidden={!displayName}
                                    iconStyle={{ position: 'unset', top: 'unset', transform: 'unset', marginRight: 4 }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={s.moreOp}> <MoreOption lstItems={this.createMoreOption()} agSideButtons={this.createagSideButtons()} /></div>
                </div>
                <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
                <div style={{ height: 'calc(100% - 48px)' }}>
                    <Grid key='contract_note'
                        {...this.props}
                        id={FORM.CONTRACT_NOTE}
                        columns={this.columns}
                        hideButton={true}
                        autoFit={true}
                        keys='C_NOTE'
                        fn={fn => {
                            this.setData = fn.setData
                            this.getData = fn.getData
                            this.setColumn = fn.setColumn
                            this.resize = fn.autoSize
                            this.resetFilter = fn.resetFilter
                            this.showColumnMenu = fn.showColumnMenu
                            this.showFilterMenu = fn.showFilterMenu
                        }}
                        paginate={this.setGridPaginate()}
                        onRowClicked={this.onRowClicked.bind(this)}
                    // getFilterOnSearch={this.getFilterOnSearch}
                    />
                    <Pdf
                        pageCount={true}
                        data={this.state.detail}
                        title={dataStorage.translate('lang_contract_notes').toCapitalize()}
                        back={() => {
                            this.setDetail(null)
                        }} />
                </div>
            </div>
        )
    }
}

export default ContractNote
