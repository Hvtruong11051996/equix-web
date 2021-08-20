import React from 'react';
import Grid from '../Inc/Grid';
import {
    formatNumberPrice,
    formatNumberValue,
    formatNumberVolume,
    formatNumberWithTextBroker,
    clone,
    getCsvFileBroker
} from '../../helper/functionUtils';
import { getData, makeSymbolUrl, getUrlBrokerData, getUrlBrokerNameByID, getBrokerCsvFileUrl } from '../../helper/request';
import logger from '../../helper/log';
import Flag from '../Inc/Flag/Flag';
import DatePicker from '../Inc/DatePicker/DatePicker';
import BrokerHeader from '../Inc/BrokerHeader/BrokerHeader';
import { defaultHeaderDropdownOptions, getBrokerOptions, getTradeTypeOptions, getSecurityTypeOptions, getIndexOptions } from '../../constants/broker_data'
import dataStorage from '../../dataStorage';
import { emitter, eventEmitter, emitterRefresh, eventEmitterRefresh } from '../../constants/emitter_enum';
import { func } from '../../storage';
import { registerUser, unregisterUser } from '../../streaming';
import DropDown from '../DropDown/DropDown';
import Lang from '../Inc/Lang/Lang';
import moment from 'moment-timezone';
import ExampleCustomInput from '../Inc/ExampleCustomInput';
import { handleChangeDatePicker, setDatePickerDefault, changeDateWithFrequence, setInitMondayDate, setInitFridayDate } from '../Inc/BrokerDataFrequencyAndTime/FrequencyAndTimeBroker';

const PAGE_SIZE = 50;
const PAGINATION_DEFAULT = {
    current_page: 1,
    total_count: 0,
    total_pages: 0,
    page_size: PAGE_SIZE
}

class BrokerHistory extends React.Component {
    constructor(props) {
        super(props);
        this.initState = this.props.loadState();
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION)
        this.accountRefresh = func.getStore(emitter.STREAMING_ACCOUNT_DATA);
        this.subscription = func.getStore(emitterRefresh.CLICK_TO_REFRESH);
        this.brokerID = '00';
        this.indexID = 'Total';
        this.securityTypeID = 'Total';
        this.tradeTypeID = 'Total';
        this.frequencyID = 'Weekly';
        this.dicBrokersName = {};
        this.dicTradeTypesName = {};
        this.dicSecuritysName = {};
        this.url = '';
        this.dateTimeDefault = moment(moment().tz(dataStorage.timeZone)).subtract(3, 'days');
        this.objChangeDd = {
            broker: this.initState.brokerID || this.brokerID,
            index: this.initState.indexID || this.indexID,
            exchange: this.initState.exchange || 'ASX:TM',
            securityType: this.initState.securityTypeID || this.securityTypeID,
            tradeType: this.initState.tradeTypeID || this.tradeTypeID,
            view: this.initState.view || 'BUY_SELL',
            frequency: this.initState.frequency || this.frequencyID,
            reportType: this.initState.reportType || 'BROKER_ACTIVITY_ANALYSIS'
        };
        let hide = true;
        if (this.initState) {
            if (this.initState.reportType && this.initState.reportType !== 'BROKER_ACTIVITY_ANALYSIS') hide = false;
        }
        this.state = {
            isConnected: dataStorage.connected,
            fromDate: (this.initState.fromDate && moment(this.initState.fromDate)) || setInitMondayDate(moment(this.dateTimeDefault)),
            toDate: (this.initState.toDate && moment(this.initState.toDate)) || setInitFridayDate(moment(this.dateTimeDefault)).day,
            brokers: [],
            indexs: [],
            tradeTypes: [],
            securityTypes: [],
            brokerID: this.initState.brokerID || this.brokerID,
            symbolObj: this.initState.symbolObj || {},
            symbol: (this.initState.symbolObj && Object.keys(this.initState.symbolObj).length !== 0 && this.initState.symbolObj.symbol) || '',
            indexID: this.initState.indexID || this.indexID,
            exchange: this.initState.exchange || 'ASX:TM',
            securityTypeID: this.initState.securityTypeID || this.securityTypeID,
            tradeTypeID: this.initState.tradeTypeID || this.tradeTypeID,
            frequency: this.initState.frequency || this.frequencyID,
            view: this.initState.view || 'BUY_SELL',
            hide: hide,
            type: this.initState.reportType || 'BROKER_ACTIVITY_ANALYSIS',
            viewGrid: 'BUY_SELL',
            security: 'TOTAL'
        }
        if (this.initState.toDate) {
            let changeDatePicker = handleChangeDatePicker(this.state.frequency, this.state.toDate, 'to', { fromDate: this.state.fromDate, toDate: this.state.toDate })
            this.state.toDate = changeDatePicker.toDate;
        }
        this.dicSymbolInfo = {};
        this.page_id = 1;
        this.checkBrokerDropDown = true;
        this.checkSercurityDropDown = false;
        this.brokerShareHistoryOptions = [
            {
                label: <Lang>lang_broker_activity_analysis</Lang>,
                value: 'BROKER_ACTIVITY_ANALYSIS'
            },
            {
                label: <Lang>lang_stock_share_analysis</Lang>,
                value: 'STOCK_SHARE_ANALYSIS'
            },
            {
                label: <Lang>lang_broker_stock_detail</Lang>,
                value: 'BROKER_STOCK_DETAIL'
            }
        ]
    }

    headerOptions = (brokers, indexs, securityTypes, tradeTypes, fromSelected, toSelected) => {
        const { brokerID, indexID, securityTypeID, tradeTypeID, fromDate, toDate } = this.state;
        return [
            {
                label: 'lang_index',
                type: 'dropdown',
                component: <DropDown
                    options={indexs}
                    value={indexID}
                    onChange={e => this.onChange(e, 'Index')}
                    rightAlign={true}
                    name='brokerHeader'
                />
            },
            this.state.type !== 'STOCK_SHARE_ANALYSIS' ? {
                label: 'lang_broker',
                type: 'dropdown',
                component: <DropDown
                    enablePDI={true}
                    options={brokers}
                    value={brokerID}
                    onChange={e => this.onChange(e, 'Broker')}
                    rightAlign={true}
                    name='brokerHeader'
                />
            } : null,
            {
                label: 'lang_exchange',
                type: 'dropdown',
                component: <DropDown
                    options={defaultHeaderDropdownOptions['exchange']}
                    value={defaultHeaderDropdownOptions['exchange'][0].value}
                    onChange={e => this.onChange(e, 'Exchange')}
                    name='brokerHeader'
                    rightAlign={true}
                />
            },
            {
                label: 'lang_security_type',
                type: 'dropdown',
                component: <DropDown
                    options={securityTypes}
                    value={securityTypeID}
                    onChange={e => this.onChange(e, 'Security_Type')}
                    name='brokerHeader'
                    rightAlign={true}
                />
            },
            this.state.type !== 'BROKER_STOCK_DETAIL' ? {
                label: 'lang_trade_type',
                type: 'dropdown',
                component: <DropDown
                    options={tradeTypes}
                    value={tradeTypeID}
                    onChange={e => this.onChange(e, 'Trade_Type')}
                    name='brokerHeader'
                    rightAlign={true}
                />
            } : null,
            this.state.type !== 'BROKER_STOCK_DETAIL' ? {
                label: 'lang_view',
                type: 'dropdown',
                component: <DropDown
                    options={defaultHeaderDropdownOptions['view']}
                    onChange={e => this.onChange(e, 'View')}
                    name='brokerHeader'
                    rightAlign={true}
                    value={this.state.view}
                />
            } : null,
            {
                label: 'lang_frequency',
                type: 'dropdown',
                component: <DropDown
                    options={defaultHeaderDropdownOptions['frequency']}
                    onChange={e => this.onChange(e, 'Frequency')}
                    name='brokerHeader'
                    rightAlign={true}
                    value={this.state.frequency}
                />
            },
            {
                label: 'lang_start',
                type: 'Date_Time_Picker',
                component: <DatePicker
                    customInput={<ExampleCustomInput type='from' />}
                    selected={fromSelected}
                    maxDate={toDate}
                    onChange={e => this.handleClickDatePicker(e, 'from')}
                    notSetMaxDate={false}
                    isMinDate={true}
                />
            },
            {
                label: 'lang_end',
                type: 'Date_Time_Picker',
                component: <DatePicker
                    customInput={<ExampleCustomInput type='to' />}
                    selected={toSelected}
                    minDate={fromDate}
                    maxDate={this.dateTimeDefault}
                    dayToAdd={'-3'}
                    onChange={e => this.handleClickDatePicker(e, 'to')}
                    notSetMaxDate={false}
                    isMinDate={false}
                />
            }
        ]
    }

    changeConnection = (isConnected) => {
        if (isConnected !== this.state.isConnected) {
            this.setState({ isConnected }, () => {
                isConnected && this.getDataResultBroker(this.objChangeDd);
            })
        }
    }

    handleClickDatePicker = (date, field) => {
        let dateTime = {};
        let frequency = this.state.frequency;
        let fromDate = this.state.fromDate;
        let toDate = this.state.toDate;
        if (field === 'from') dateTime = handleChangeDatePicker(frequency, date, 'from', { fromDate: fromDate, toDate: toDate });
        if (field === 'to') dateTime = handleChangeDatePicker(frequency, date, 'to', { fromDate: fromDate, toDate: toDate });
        this.setState({
            fromDate: dateTime.fromDate,
            toDate: dateTime.toDate
        }, () => {
            this.objChangeDd.fromDate = this.state.fromDate;
            this.objChangeDd.toDate = this.state.toDate;
            this.getDataResultBroker(this.objChangeDd)
        })
    }

    onBtnChangeDisplayBroker = (value, fieldName) => {
        if (fieldName === 'broker') {
            this.setState({ brokerID: value, symbolObj: {} }, () => {
                this.objChangeDd.broker = value;
                this.handleChangeShareHistory('BROKER_ACTIVITY_ANALYSIS')
            })
        }

        if (fieldName === 'CODE') {
            if (value === 'TOTAL') {
                this.setState({ symbolObj: {}, symbol: '' }, () => {
                    this.handleChangeShareHistory('STOCK_SHARE_ANALYSIS', value)
                });
            } else {
                const urlMarketInfo = makeSymbolUrl(encodeURIComponent(value));
                getData(urlMarketInfo).then((res) => {
                    if (fieldName === 'CODE') {
                        if (res && res.data[0]) {
                            this.setState({ symbolObj: res.data[0], symbol: res.data[0].symbol }, () => {
                                this.handleChangeShareHistory('STOCK_SHARE_ANALYSIS', value)
                            });
                        }
                    } else {
                        this.handleChangeShareHistory('BROKER_ACTIVITY_ANALYSIS')
                    }
                })
            }
        }
    }

    getColumns = (viewGrid) => {
        let columns = []
        columns = [
            this.state.type === 'STOCK_SHARE_ANALYSIS' ? {
                headerName: 'lang_broker',
                field: 'broker_id',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const parentDiv = document.createElement('div')
                    const div = document.createElement('div');
                    const tooltip = document.createElement('div')
                    div.className = 'showTitle next'
                    div.innerText = value ? this.dicBrokersName && this.dicBrokersName[value] + '' : '--';
                    div.style = 'color: var(--hover-default); cursor: pointer';
                    div.onclick = () => {
                        this.onBtnChangeDisplayBroker(value, params.colDef.headerName);
                    }
                    tooltip.innerText = value ? this.dicBrokersName && this.dicBrokersName[value] && `[${value}] ${this.dicBrokersName[value]}` : '--';
                    tooltip.style.display = 'none'
                    parentDiv.appendChild(div)
                    parentDiv.appendChild(tooltip)
                    return parentDiv;
                }
            } : null,
            (this.state.type === 'BROKER_ACTIVITY_ANALYSIS') ? {
                headerName: 'CODE',
                field: 'security_code',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                width: 110,
                cellRenderer: (params) => {
                    if (!params.data.security_code && !params.data.display_name && !params.data[params.colDef.field]) return '--';
                    const divRoot = document.createElement('div');
                    const divSymbol = document.createElement('div');
                    const divSymbolName = document.createElement('div');
                    const divFlag = document.createElement('div');
                    divSymbol.classList.add('divSymbol');
                    const flagContent = document.createElement('div');
                    const exchange = params.data.display_exchange || '';
                    if (exchange) {
                        ReactDOM.render(
                            <Flag symbolObj={params.data} />
                            , flagContent);
                    }
                    divFlag.appendChild(flagContent);
                    divFlag.classList.add('divFlag');
                    divRoot.appendChild(divSymbol);
                    divSymbol.appendChild(divSymbolName);
                    divRoot.appendChild(divFlag);
                    divRoot.className = 'symbolWlRoot';
                    divSymbolName.className = 'symbol-name';
                    if (params.data[params.colDef.field] === 'TOTAL') {
                        let fieldCodeSymbol = '';
                        if (this.state.securityTypeID === 'Total') fieldCodeSymbol = this.dicSecuritysName && this.dicSecuritysName['Total'].toUpperCase();
                        else fieldCodeSymbol = this.dicSecuritysName && this.dicSecuritysName[this.state.securityTypeID].toUpperCase();
                        divSymbolName.innerText = fieldCodeSymbol;
                        divRoot.title = fieldCodeSymbol;
                    } else if (params.data[params.colDef.field] === 'anonymous') {
                        let fieldCodeSymbol = params.data[params.colDef.field].toUpperCase();
                        divSymbolName.innerText = fieldCodeSymbol;
                        divRoot.title = fieldCodeSymbol;
                    } else {
                        divSymbolName.innerHTML = params.data.display_name !== '' ? params.data.display_name : params.data[params.colDef.field];
                        divRoot.title = params.data.display_name !== '' ? params.data.display_name : params.data[params.colDef.field];
                    }
                    divRoot.onclick = () => {
                        this.onBtnChangeDisplayBroker(params.data[params.colDef.field], params.colDef.headerName);
                    }
                    divRoot.classList.add('flex');
                    divSymbolName.style = 'color: var(--hover-default); cursor: pointer';
                    return divRoot;
                }
            } : null,
            this.state.type === 'BROKER_STOCK_DETAIL' ? {
                headerName: 'lang_trade_type',
                field: 'trade_type',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    div.innerText = value ? (value === 'TOTAL' ? dataStorage.translate('total_market') : this.dicTradeTypesName[value]).toUpperCase() : '--';
                    div.className = 'showTitle';
                    return div;
                }
            } : null,
            this.state.type === 'BROKER_STOCK_DETAIL' ? {
                headerName: 'avg_mkt_price',
                field: 'avg_price',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    div.innerText = (value || value === 0) ? formatNumberPrice(value, true) : '--';
                    div.className += ' showTitle';
                    return div;
                }
            } : null,
            ((this.state.type === 'BROKER_STOCK_DETAIL') || (viewGrid && ((viewGrid === 'BUY') || (viewGrid === 'SELL')))) ? null : {
                headerName: 'tot_val',
                headerIsNumber: true,
                field: 'total_value',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    div.innerText = (value || value === 0) ? (value === 0 ? '0.00' : formatNumberWithTextBroker(value, 2, true)) + '' : '--';
                    div.className = 'showTitle';
                    return div;
                }
            },
            (viewGrid && (viewGrid === 'BUY' || viewGrid === 'SELL')) ? {
                headerName: 'lang_value',
                headerIsNumber: true,
                field: 'value',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    if (value || Number(value) === 0) div.innerText = formatNumberValue(value, true);
                    else div.innerText = '--';
                    div.className = 'showTitle';
                    return div;
                }
            } : null,
            (this.state.type === 'BROKER_ACTIVITY_ANALYSIS') ? {
                headerName: 'tot_val%',
                headerIsNumber: true,
                field: 'market_percent',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const num = Number(value);
                    if (isNaN(num)) return '--'
                    const div = document.createElement('div');
                    let text = ''
                    let innerText = ''
                    if (num < 0.005 || num === 0) {
                        text = '0.00'
                    } else {
                        text = formatNumberValue(num, true)
                    }
                    innerText = text + '%'
                    div.innerText = innerText
                    div.className = 'showTitle';
                    return div;
                }
            } : null,
            this.state.type === 'STOCK_SHARE_ANALYSIS' ? {
                headerName: 'tot_val%',
                headerIsNumber: true,
                field: 'traded_percent',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const num = Number(value);
                    if (isNaN(num)) return '--'
                    const div = document.createElement('div');
                    let text = ''
                    let innerText = ''
                    if (num < 0.005 || num === 0) {
                        text = '0.00'
                    } else {
                        text = formatNumberValue(num, true)
                    }
                    innerText = text + '%'
                    div.innerText = innerText
                    div.className = 'showTitle';
                    return div;
                }
            } : null,
            (viewGrid && (viewGrid === 'BUY_SELL' || viewGrid === '')) ? {
                headerName: 'net_val',
                headerIsNumber: true,
                field: 'net_value',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    div.innerText = (value || value === 0) ? (value === 0 ? '0.00' : formatNumberWithTextBroker(value, 2)) + '' : '--';
                    div.className = 'showTitle';
                    return div;
                }
            } : null,
            (viewGrid && (viewGrid === 'BUY_SELL' || viewGrid === '')) ? {
                headerName: 'net_vol',
                headerIsNumber: true,
                field: 'net_volume',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    div.innerText = (value || value === 0) ? (value === 0 ? 0 : formatNumberWithTextBroker(value, 0)) + '' : '--';
                    div.className = 'showTitle';
                    return div;
                }
            } : null,
            (viewGrid && (viewGrid === 'BUY' || viewGrid === 'SELL')) ? {
                headerName: 'lang_volume',
                headerIsNumber: true,
                field: 'volume',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    if (value || Number(value) === 0) div.innerText = formatNumberVolume(value, true);
                    else div.innerText = '--';
                    div.className = 'showTitle';
                    return div;
                }
            } : null,
            (viewGrid && (viewGrid === 'BUY' || viewGrid === 'SELL')) ? {
                headerName: 'lang_price',
                headerIsNumber: true,
                field: 'price',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    if (value || Number(value) === 0) div.innerText = formatNumberPrice(value, true);
                    else div.innerText = '--';
                    div.className = 'showTitle';
                    return div;
                }
            } : null,
            ((viewGrid && (viewGrid === 'BUY' || viewGrid === 'SELL')) && this.state.securityTypeID === 'ST15' && this.state.type === 'BROKER_ACTIVITY_ANALYSIS') ? {
                headerName: 'avg prem',
                headerIsNumber: true,
                field: 'avg_prem',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    if (value || Number(value) === 0) {
                        if (Number(value) > 0) {
                            div.className = 'priceUp';
                            div.innerHTML = formatNumberPrice(value, true)
                        } else if (Number(value) < 0) {
                            div.className = 'priceDown';
                            div.innerHTML = formatNumberPrice(value, true)
                        } else {
                            div.innerHTML = formatNumberPrice(value, true)
                        }
                    } else {
                        div.innerHTML = '--';
                    }
                    div.className += ' showTitle';
                    return div;
                }
            } : null,
            (this.state.type !== 'BROKER_STOCK_DETAIL' && (viewGrid && viewGrid !== 'SELL')) ? {
                headerName: 'lang_buy_trades',
                headerIsNumber: true,
                field: 'buy_count',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    if (value || Number(value) === 0) div.innerText = formatNumberVolume(value, true);
                    else div.innerText = '--';
                    div.className = 'showTitle';
                    return div;
                }
            } : null,
            this.state.type === 'BROKER_STOCK_DETAIL' ? {
                headerName: 'buy_val',
                headerIsNumber: true,
                field: 'buy_value',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    if (value || Number(value) === 0) div.innerText = formatNumberValue(value, true);
                    else div.innerText = '--';
                    div.className = 'showTitle';
                    return div;
                }
            } : null,
            (viewGrid && viewGrid === 'BUY_SELL') ? {
                headerName: 'buy_vol',
                headerIsNumber: true,
                field: 'buy_volume',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const num = Number(value);
                    const div = document.createElement('div');
                    div.innerText = (num || num === 0) ? (num === 0 ? '0.00' : formatNumberWithTextBroker(num, 2)) + '' : '--';
                    div.className = 'showTitle';
                    return div;
                }
            } : null,
            (viewGrid && viewGrid === 'BUY_SELL') ? {
                headerName: 'buy_prc',
                headerIsNumber: true,
                field: 'buy_price',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    if (value || Number(value) === 0) div.innerText = formatNumberPrice(value, true);
                    else div.innerText = '--';
                    div.className = 'showTitle';
                    return div;
                }
            } : null,
            (this.state.type !== 'BROKER_STOCK_DETAIL' && (viewGrid && viewGrid !== 'BUY')) ? {
                headerName: 'lang_sell_trades',
                headerIsNumber: true,
                field: 'sell_count',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    if (value || Number(value) === 0) div.innerText = formatNumberVolume(value, true);
                    else div.innerText = '--';
                    div.className = 'showTitle';
                    return div;
                }
            } : null,
            this.state.type === 'BROKER_STOCK_DETAIL' ? {
                headerName: 'sell_val',
                headerIsNumber: true,
                field: 'sell_value',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    if (value || Number(value) === 0) div.innerText = formatNumberValue(value, true);
                    else div.innerText = '--';
                    div.className = 'showTitle';
                    return div;
                }
            } : null,
            (viewGrid && viewGrid === 'BUY_SELL') ? {
                headerName: 'sell_vol',
                headerIsNumber: true,
                field: 'sell_volume',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    div.innerText = (value || value === 0) ? (value === 0 ? 0 : formatNumberWithTextBroker(value, 0)) : '--';
                    div.className = 'showTitle';
                    return div;
                }
            } : null,
            (viewGrid && viewGrid === 'BUY_SELL') ? {
                headerName: 'sell_prc',
                headerIsNumber: true,
                field: 'sell_price',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    if (value || Number(value) === 0) div.innerText = formatNumberPrice(value, true);
                    else div.innerText = '--';
                    div.className = 'showTitle';
                    return div;
                }
            } : null,
            (this.state.type !== 'BROKER_STOCK_DETAIL' && (viewGrid && viewGrid === 'BUY_SELL')) ? {
                headerName: '#trades',
                headerIsNumber: true,
                field: 'trades_count',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    const value = params.data[params.colDef.field];
                    const div = document.createElement('div');
                    div.innerText = (value || value === 0) ? (value === 0 ? 0 : formatNumberWithTextBroker(value, 0)) + '' : '--';
                    div.className = 'showTitle';
                    return div;
                }
            } : null
        ]
        return columns;
    }

    onChange = (data, fieldName) => {
        let viewGrid = data || '';
        let viewField = fieldName || '';
        const state = {}
        switch (fieldName) {
            case 'Broker': this.objChangeDd.broker = data;
                Object.assign(state, { brokerID: data })
                break;
            case 'Index': this.objChangeDd.index = data;
                Object.assign(state, { indexID: data })
                break;
            case 'Exchange': this.objChangeDd.exchange = data;
                Object.assign(state, { exchange: data })
                break;
            case 'Security_Type':
                this.objChangeDd.securityType = data;
                Object.assign(state, { securityTypeID: data, symbolObj: {}, symbol: '' })
                break;
            case 'Trade_Type': this.objChangeDd.tradeType = data;
                Object.assign(state, { tradeTypeID: data })
                break;
            case 'View': this.objChangeDd.view = data;
                Object.assign(state, { view: data })
                break;
            case 'Frequency':
                this.objChangeDd.frequency = data;
                let fromDate = this.state.fromDate;
                let toDate = this.state.toDate;
                const dateTime = changeDateWithFrequence(data, { fromDate: fromDate, toDate: toDate });
                Object.assign(state, {
                    frequency: data,
                    fromDate: dateTime.fromDate,
                    toDate: dateTime.toDate
                })
                break;
        }
        this.setState(state, () => this.allActionDropDown(this.objChangeDd, viewGrid, viewField))
    }
    getCsvFunction2 = (gridDom) => {
        if (this.csvWoking) return
        this.csvWoking = true
        const symbol = this.state.symbol;
        const reportType = this.objChangeDd.reportType;
        // let url = getUrlBrokerData(`/broker-share-history?from_date=${obj.fromDate}&to_date=${obj.toDate}&frequency=${obj.frequency.toUpperCase()}&page_id=${this.page_id}&page_size=50&exchange=ASX:TM&report_type=${obj.reportType}&broker_id=${obj.broker}`);
        let columnHeaderGrid = this.getAllDisplayedColumns()
        const fromDate = moment(this.state.fromDate).format('DD/MM/YYYY');
        const toDate = moment(this.state.toDate).format('DD/MM/YYYY');
        const frequency = this.state.frequency;
        let body = {
            'query': {
                'from_date': fromDate,
                'to_date': toDate,
                'frequency': frequency.toUpperCase(),
                'exchange': 'ASX:TM',
                'report_type': reportType
            }
        }
        if (this.objChangeDd.index !== 'Total') body.query['index'] = this.objChangeDd.index
        if (this.objChangeDd.view && this.objChangeDd.view !== 'Total') body.query['view'] = this.objChangeDd.view
        if (symbol !== 'TOTAL' && symbol) body.query['security_code'] = symbol;
        if (this.objChangeDd.securityType !== 'Total' && this.objChangeDd.securityType !== '--') {
            body.query['security_type'] = this.objChangeDd.securityType
        }
        if (this.objChangeDd.tradeType && this.objChangeDd.tradeType !== 'Total') {
            body.query['trade_type'] = this.objChangeDd.tradeType
        }
        if (this.objChangeDd.brokerID !== '00') {
            body.query['broker_id'] = this.objChangeDd.brokerID
        }
        const columnHeader = {
            'broker_report': columnHeaderGrid
        }
        const fileName = (reportType === 'BROKER_ACTIVITY_ANALYSIS') ? 'Broker_Activity_Analysis' : (reportType === 'STOCK_SHARE_ANALYSIS' ? 'Stock_Share_Analysis' : 'Broker_Stock_Detail')
        getCsvFileBroker({
            url: getBrokerCsvFileUrl('broker-share-history'),
            body_req: body,
            columnHeader: columnHeader,
            lang: dataStorage.lang,
            gridDom: gridDom,
            glContainer: this.props.glContainer,
            fileName: 'Broker_Share_History' + '_' + fileName
        }, () => {
            this.csvWoking = false;
        });
    }
    allActionDropDown = (objChangeDd, grid, field) => {
        if (field === 'View') {
            this.setColumn(this.getColumns(grid), true)
            this.getDataResultBroker(objChangeDd)
        } else if (field === 'Security_Type') {
            this.setColumn(this.getColumns(this.state.view), true)
            this.getDataResultBroker(objChangeDd)
        } else this.getDataResultBroker(objChangeDd)
    }

    getSymbolInfo = async (path) => {
        const urlMarketInfo = makeSymbolUrl(path);
        await getData(urlMarketInfo).then(res => {
            res = res.data;
            for (let index = 0, length = res.length; index < length; index++) {
                this.dicSymbolInfo[res[index].symbol] = res[index]
                this.dicSymbolInfo[res[index].symbol].display_name = res[index].display_name || '--';
                this.dicSymbolInfo[res[index].symbol].display_exchange = res[index].display_exchange || '--'
                this.dicSymbolInfo[res[index].symbol].country = res[index].country || '--'
            }
        }).catch(error => {
            logger.sendLog('error display name BrokerHistory', error);
        })
    }

    getDataResultBroker = (obj = {}) => {
        obj.toDate = moment(this.state.toDate).format('DD/MM/YYYY');
        obj.fromDate = moment(this.state.fromDate).format('DD/MM/YYYY');
        obj.frequency = this.state.frequency;
        const symbol = this.state.symbol;
        const reportType = obj.reportType;
        this.props.saveState && this.props.saveState({
            brokerID: obj.broker,
            indexID: obj.index,
            exchange: obj.exchange,
            securityTypeID: obj.securityType,
            tradeTypeID: obj.tradeType,
            view: obj.view,
            frequency: obj.frequency,
            reportType: reportType,
            fromDate: moment(this.state.fromDate),
            toDate: moment(this.state.toDate),
            symbolObj: this.state.symbolObj
        })
        try {
            this.props.loading(true)
            let url = getUrlBrokerData(`/broker-share-history?from_date=${obj.fromDate}&to_date=${obj.toDate}&frequency=${obj.frequency.toUpperCase()}&page_id=${this.page_id}&page_size=50&exchange=${obj.exchange}&report_type=${reportType}&broker_id=${obj.broker}`);
            if (obj.index !== 'Total') url += `&index=${obj.index}`;
            if (obj.securityType !== 'Total' && obj.securityType !== '--') url += `&security_type=${obj.securityType}`;
            if (obj.tradeType !== '' && obj.tradeType !== 'TOTAL' && obj.tradeType !== 'Total') url += `&trade_type=${obj.tradeType}`;
            if (obj.view) url += `&view=${obj.view}`;
            if (symbol !== 'TOTAL' && symbol) url += `&security_code=${symbol}`;
            this.url = url;
            getData(url)
                .then(async (res) => {
                    let queryString = []
                    this.data = res.data.data
                    const obj = {};
                    obj.current_page = +res.data.current_page || 1;
                    obj.total_count = +res.data.total_count || 1;
                    obj.total_pages = +res.data.total_page || 1;
                    obj.page_size = PAGE_SIZE;
                    this.setPage && this.setPage(obj);
                    if (this.data && (this.data.length > 0)) {
                        for (let index = 0, length = this.data.length; index < length; index++) {
                            if (this.data[index] && this.data[index].security_code) {
                                queryString.push(encodeURIComponent(this.data[index].security_code))
                            }
                        }
                        if (queryString.length) {
                            await this.getSymbolInfo(queryString.toString());
                        }

                        for (let i = 0; i < this.data.length; i++) {
                            if (this.data[i].security_code) {
                                const symbol = this.data[i].security_code
                                this.data[i].display_name = (this.dicSymbolInfo[symbol] && this.dicSymbolInfo[symbol].display_name) || (this.dicSymbolInfo[symbol] && this.dicSymbolInfo[symbol].security_code) || ''
                                this.data[i].display_exchange = (this.dicSymbolInfo[symbol] && this.dicSymbolInfo[symbol].display_exchange) || ''
                                this.data[i].country = (this.dicSymbolInfo[symbol] && this.dicSymbolInfo[symbol].country) || ''
                            }
                        }
                        this.setData(this.data);
                    } else {
                        this.setPage && this.setPage(PAGINATION_DEFAULT);
                        this.setData([]);
                    }
                    this.props.loading(false)
                })
                .catch((error) => {
                    this.props.loading(false)
                    logger.error(error)
                    this.setPage && this.setPage(PAGINATION_DEFAULT);
                    this.setData([]);
                })
        } catch (error) {
            this.props.loading(false)
            logger.error(error)
            this.setData([]);
            this.setPage && this.setPage(PAGINATION_DEFAULT);
        }
    }

    async getDataBrokerTradeTypeSecurity() {
        try {
            const [brokers, indexs, tradeTypes, securityTypes] = await Promise.all([
                getBrokerOptions(),
                getIndexOptions(),
                getTradeTypeOptions(),
                getSecurityTypeOptions()
            ])
            this.setState({
                brokers: brokers[0],
                indexs,
                tradeTypes,
                securityTypes
            })
            brokers[0].map(item => {
                this.dicBrokersName[item.value] = item.label
            })
            securityTypes.map(item => {
                this.dicSecuritysName[item.value] = item.label
            })
            tradeTypes.map(item => {
                this.dicTradeTypesName[item.value] = item.label;
            })
        } catch (error) {
            logger.log(`Error while getting data: ${error}`)
        }
    }

    refreshData = () => {
        this.getDataResultBroker(this.objChangeDd)
    }

    async componentDidMount() {
        this.setColumn(this.getColumns(this.state.view), true)
        await this.getDataBrokerTradeTypeSecurity();
        this.emitID = this.subscription && this.subscription.addListener(eventEmitterRefresh.CLICK_TO_REFRESH_STATE, this.refreshData)
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
        this.emitRefreshID = this.accountRefresh && this.accountRefresh.addListener(eventEmitter.REFRESH_DATA_ACCOUNT, this.getDataResultBroker(this.objChangeDd));
        if (this.state.brokers.length !== 0 && this.state.securityTypes.length !== 0 && this.state.tradeTypes.length !== 0) this.getDataResultBroker(this.objChangeDd)
    }

    componentWillUnmount() {
        try {
            this.emitID && this.emitID.remove()
            this.emitConnectionID && this.emitConnectionID.remove();
            this.emitRefreshID && this.emitRefreshID.remove();
        } catch (error) {
            logger.error('componentWillUnmount On BrokerHistory' + error)
        }
    }
    dataReceivedFromBrokerHeader = (symbol) => {
        let securityTypeID = '--';
        if (Object.keys(symbol).length === 0) securityTypeID = 'Total';
        this.setState({ symbol: symbol.symbol, symbolObj: symbol, securityTypeID }, () => {
            this.objChangeDd.securityType = this.state.securityTypeID;
            this.getDataResultBroker(this.objChangeDd)
        })
    }

    pageChanged(pageId) {
        if (this.page_id === pageId) return;
        this.page_id = pageId;
        this.getDataResultBroker(this.objChangeDd);
    }

    setGridPaginate = () => {
        return {
            setPage: cb => {
                this.setPage = cb
            },
            pageChanged: this.pageChanged.bind(this)
        }
    }

    handleChangeShareHistory = (type, value) => {
        let securityTypeID = this.state.securityTypeID;
        switch (type) {
            case 'BROKER_ACTIVITY_ANALYSIS':
                if (securityTypeID === '--') securityTypeID = 'Total'
                this.setState({
                    hide: true,
                    type: type,
                    symbol: '',
                    symbolObj: {},
                    securityTypeID
                }, () => {
                    this.objChangeDd.view = this.state.view;
                    this.objChangeDd.broker = this.state.brokerID;
                    this.objChangeDd.reportType = type;
                    this.objChangeDd.tradeType = this.state.tradeTypeID;
                    this.objChangeDd.securityType = this.state.securityTypeID;
                    this.setColumn(this.getColumns(this.state.view), true)
                    this.getDataResultBroker(this.objChangeDd)
                })
                break;
            case 'STOCK_SHARE_ANALYSIS':
                if (Object.keys(this.state.symbolObj).length !== 0) securityTypeID = '--'
                if (value && value !== 'TOTAL') {
                    this.setState({ hide: false, type: type, symbol: value, securityTypeID }, () => {
                        this.objChangeDd.view = this.state.view;
                        this.objChangeDd.broker = '00';
                        this.objChangeDd.tradeType = this.state.tradeTypeID;
                        this.objChangeDd.reportType = type;
                        this.objChangeDd.securityType = this.state.securityTypeID;
                        this.setColumn(this.getColumns(this.state.view), true)
                        this.getDataResultBroker(this.objChangeDd)
                    })
                } else {
                    this.setState({ hide: false, type: type, securityTypeID }, () => {
                        this.objChangeDd.view = this.state.view;
                        this.objChangeDd.broker = '00';
                        this.objChangeDd.tradeType = this.state.tradeTypeID;
                        this.objChangeDd.reportType = type;
                        this.objChangeDd.securityType = this.state.securityTypeID;
                        this.setColumn(this.getColumns(this.state.view), true)
                        this.getDataResultBroker(this.objChangeDd)
                    })
                }
                break;
            case 'BROKER_STOCK_DETAIL':
                if (Object.keys(this.state.symbolObj).length !== 0) securityTypeID = '--'
                this.setState({ hide: false, type: type, viewGrid: null, view: 'BUY_SELL', securityTypeID }, () => {
                    this.objChangeDd.broker = this.state.brokerID;
                    this.objChangeDd.tradeType = '';
                    this.objChangeDd.view = '';
                    this.objChangeDd.reportType = type;
                    this.objChangeDd.securityType = this.state.securityTypeID;
                    this.setColumn(this.getColumns(this.state.view), true)
                    this.getDataResultBroker(this.objChangeDd)
                })
                break;
        }
    }

    render() {
        return (
            <div className='qe-widget'>
                <div className='brk-stk'>
                    <BrokerHeader
                        {...this.props}
                        symbolObj={this.state.symbolObj}
                        handleChangeShareHistory={this.handleChangeShareHistory}
                        brokerShareHistoryOptions={this.brokerShareHistoryOptions}
                        defaultShareHistory={this.state.type}
                        hiddenSearchBox={this.state.hide}
                        items={this.headerOptions(this.state.brokers, this.state.indexs, this.state.securityTypes, this.state.tradeTypes, this.state.fromDate, this.state.toDate)}
                        dataReceivedFromBrokerHeader={this.dataReceivedFromBrokerHeader}
                        brokerForm={'BrokerShareHistory'}
                    />
                </div>
                <div className='gridDiv' style={{ flex: 1 }}>
                    <Grid
                        {...this.props}
                        isReady={this.isReady}
                        onlyOneRow={true}
                        // getFilterOnSearch={this.getFilterOnSearch}
                        fn={fn => {
                            this.addOrUpdate = fn.addOrUpdate
                            this.setData = fn.setData
                            this.getData = fn.getData
                            this.refreshView = fn.refreshView
                            this.updateField = fn.updateField
                            this.setSelectedRowData = fn.setSelectedRowData
                            this.setSelected = fn.setSelected
                            this.setColumn = fn.setColumn
                            this.getAllDisplayedColumns = fn.getAllDisplayedColumns
                        }}
                        paginate={this.setGridPaginate()}
                        rowBuffer={50}
                        // loadingCallback={this.props.loadingCallback}
                        columns={[]}
                        rowHeight={32}
                        getCsvFunction2={this.getCsvFunction2}
                    />
                </div>
            </div>
        );
    }
}

export default BrokerHistory;
