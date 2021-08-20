import React from 'react';
import {
    getData,
    getUrlBrokerData,
    getBrokerCsvFileUrl
} from '../../helper/request'
import {
    getSymbolAccountWhenFirstOpenLayout,
    resetSymbolOfLayout,
    formatNumberPrice,
    formatNumberVolume,
    formatNumberValue,
    formatNumberWithTextBroker,
    checkRole,
    getCsvFileBroker
} from '../../helper/functionUtils'
import dataStorage from '../../dataStorage';
import { func } from '../../storage';
import { emitter, emitterRefresh, eventEmitter, eventEmitterRefresh } from '../../constants/emitter_enum';
import logger from '../../helper/log';
import Lang from '../Inc/Lang/Lang';
import SymbolPrice from '../SymbolPrice';
import BrokerHeader from '../Inc/BrokerHeader';
import DropDown from '../DropDown/DropDown';
import { defaultHeaderDropdownOptions } from '../../constants/broker_data'
import Grid from '../Inc/Grid/Grid';
import moment from 'moment-timezone';
import ExampleCustomInput from '../Inc/ExampleCustomInput';
import { handleChangeDatePicker, setDatePickerDefault, changeDateWithFrequence, setInitMondayDate, setInitFridayDate } from '../Inc/BrokerDataFrequencyAndTime/FrequencyAndTimeBroker';
import DatePicker from '../Inc/DatePicker/DatePicker';
const pageSize = 50
export class StockShareAnalysis extends React.Component {
    constructor(props) {
        super(props);
        // this.initState = props.loadState()
        this.subscription = func.getStore(emitterRefresh.CLICK_TO_REFRESH);
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION)
        this.user_id = dataStorage.userInfo.user_id
        this.pageObj = {}
        this.dicBrokersName = {}
        this.dicTradeTypes = {}
        this.page_id = 1
        this.dataOld = []
        this.data2Old = []
        this.dateTimeDefault = moment(moment().tz(dataStorage.timeZone)).subtract(3, 'days');
        this.defaultSecurityType = 'Total';
        this.defaultExchange = 'ASX:TM';
        this.defaultView = 'BUY_SELL';
        this.defaultTradeType = 'Total';
        this.defaultFrequency = 'Weekly';
        this.defaultFromDate = setInitMondayDate(moment(this.dateTimeDefault));
        this.defalutToDate = setInitFridayDate(moment(this.dateTimeDefault)).day;
        this.initialState = this.props.loadState()
        const { brokers, securityTypes, tradeTypes } = this.props
        this.checkBrokerTabState = this.props.brokerTabState && Object.keys(this.props.brokerTabState).length !== 0
        const symbolObj = this.props.brokerTabState.symbolObj || (this.props.objValue && this.props.objValue.symbolObj) || {}
        this.state = {
            isConnected: dataStorage.connected,
            symbol: (Object.keys(symbolObj).length !== 0 && symbolObj.symbol) || '',
            symbolObj: symbolObj,
            data: {},
            brokers: brokers || [],
            securityTypes: securityTypes || [],
            tradeTypes: tradeTypes || [],
            securityType: this.checkBrokerTabState ? (Object.keys(symbolObj).length === 0 ? (this.props.brokerTabState.securityType === '--' ? this.defaultSecurityType : (this.props.brokerTabState.securityType || ((this.props.objValue && this.props.objValue.securityType) ? this.props.objValue.securityType : this.defaultSecurityType))) : '--') : this.defaultSecurityType,
            exchange: this.checkBrokerTabState ? this.props.brokerTabState.exchange : ((this.props.objValue && this.props.objValue.exchange) ? this.props.objValue.exchange : this.defaultExchange),
            view: this.checkBrokerTabState ? this.props.brokerTabState.view : ((this.props.objValue && this.props.objValue.view) ? this.props.objValue.view : this.defaultView),
            tradeType: this.checkBrokerTabState ? this.props.brokerTabState.tradeType : ((this.props.objValue && this.props.objValue.tradeType) ? this.props.objValue.tradeType : this.defaultTradeType),
            frequency: this.checkBrokerTabState ? this.props.brokerTabState.frequency : ((this.props.objValue && this.props.objValue.frequency) ? this.props.objValue.frequency : this.defaultFrequency),
            fromDate: this.checkBrokerTabState ? moment(this.props.brokerTabState.fromDate) : ((this.props.objValue && this.props.objValue.fromDate) ? moment(this.props.objValue.fromDate) : this.defaultFromDate),
            toDate: this.checkBrokerTabState ? moment(this.props.brokerTabState.toDate) : ((this.props.objValue && this.props.objValue.toDate) ? moment(this.props.objValue.toDate) : this.defalutToDate)
        };
        if (this.checkBrokerTabState) {
            let changeDatePicker = handleChangeDatePicker(this.state.frequency, this.state.toDate, 'to', { fromDate: this.state.fromDate, toDate: this.state.toDate })
            this.state.toDate = changeDatePicker.toDate;
        }
    }

    createHeaderOptions = (securityTypes, tradeTypes, fromSelected, toSelected) => {
        const { exchange, view, tradeType, securityType, frequency, fromDate, toDate } = this.state
        return [
            {
                label: 'lang_exchange',
                type: 'dropdown',
                component: <DropDown
                    options={defaultHeaderDropdownOptions['exchange']}
                    value={exchange}
                    onChange={e => this.onChange(e, 'Exchange')}
                    name='brokerHeader'
                    rightAlign={true}
                    translate={false}
                />
            },
            {
                label: 'lang_security_type',
                type: 'dropdown',
                component: <DropDown
                    options={securityTypes}
                    value={securityType}
                    onChange={e => this.onChange(e, 'securityType')}
                    name='brokerHeader'
                    rightAlign={true}
                    translate={false}
                />
            },
            {
                label: 'lang_trade_type',
                type: 'dropdown',
                component: <DropDown
                    options={tradeTypes}
                    value={tradeType}
                    onChange={e => this.onChange(e, 'tradeType')}
                    name='brokerHeader'
                    rightAlign={true}
                    translate={false}
                />
            },
            {
                label: 'lang_view',
                type: 'dropdown',
                component: <DropDown
                    options={defaultHeaderDropdownOptions['view']}
                    value={view}
                    onChange={e => this.onChange(e, 'view')}
                    name='brokerHeader'
                    rightAlign={true}
                />
            },
            {
                label: 'lang_frequency',
                type: 'dropdown',
                component: <DropDown
                    options={defaultHeaderDropdownOptions['frequency']}
                    onChange={e => this.onChange(e, 'Frequency')}
                    name='brokerHeader'
                    rightAlign={true}
                    value={frequency}
                    translate={false}
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

    swithComponent = (brokerID) => {
        const { securityType, exchange, view, tradeType, frequency, fromDate, toDate } = this.state;
        this.setState({ brokerID }, () => {
            const brokerState = {
                brokerID: brokerID,
                securityType: securityType,
                exchange: exchange,
                view: view,
                tradeType: tradeType,
                frequency: frequency,
                fromDate: fromDate,
                toDate: toDate,
                nameBroker: 2
            }
            this.props.handleSaveLayout(brokerState);
            this.props.changeWidget({
                objValue: {
                    brokerID: brokerID,
                    securityType: securityType,
                    exchange: exchange,
                    view: view,
                    tradeType: tradeType,
                    frequency: frequency,
                    fromDate: fromDate,
                    toDate: toDate
                }
            })
        })
    }
    getFilterOnSearch = (filter, sort) => {
        // console.log(sort)
        if (sort.length) {
            console.log(sort[0].sort, '----', sort[0].colId)
            this.setState({ sortField: sort[0].colId, sortType: sort[0].sort.toUpperCase() }, () => this.getDataBroker())
        } else this.setState({ sortField: null, sortType: null }, () => this.getDataBroker())
    }
    onChange = async (val, type) => {
        const state = {};
        try {
            if (type === 'Frequency') {
                let fromDate = this.state.fromDate;
                let toDate = this.state.toDate;
                const dateTime = changeDateWithFrequence(val, { fromDate: fromDate, toDate: toDate });
                Object.assign(state, {
                    frequency: val,
                    fromDate: dateTime.fromDate,
                    toDate: dateTime.toDate
                })
            } else if (type === 'securityType') {
                Object.assign(state, {
                    securityType: val,
                    symbolObj: [],
                    symbol: ''
                })
                this.props.getSymbolObj({})
            } else {
                Object.assign(state, { [type]: val })
            }
            this.page_id = 1
            this.setState(state, () => this.allActionDropDown(type))
        } catch (error) {
            logger.log(`Error while changing header option: ${error}`)
        }
    }

    allActionDropDown = (type) => {
        if (type === 'view') {
            this.setColumn2(this.getColumns2(), true)
            this.getDataBroker(null)
        } else setTimeout(() => this.getDataBroker(), 0)
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
            this.getDataBroker()
        })
    }

    getColumns2 = () => {
        return [
            {
                headerName: 'broker',
                field: 'broker_id',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                customTooltip: 'Broker name',
                cellRenderer: (params) => {
                    const parentDiv = document.createElement('div')
                    const div = document.createElement('div')
                    div.classList = 'text-capitalize color-primary text-decoration-hover pointer showTitle next'
                    div.innerText = this.dicBrokersName[params.data.broker_id] ? this.dicBrokersName[params.data.broker_id] : params.data.broker_id
                    div.onclick = () => {
                        this.swithComponent(params.data.broker_id);
                    }
                    const tooltip = document.createElement('div')
                    tooltip.innerText = this.dicBrokersName[params.data.broker_id] ? '[' + params.data.broker_id + '] ' + this.dicBrokersName[params.data.broker_id] : params.data.broker_id
                    parentDiv.appendChild(div)
                    parentDiv.appendChild(tooltip)
                    return parentDiv
                },
                valueGetter: (params) => {
                    return this.dicBrokersName[params.data.broker_id] ? this.dicBrokersName[params.data.broker_id] : params.data.broker_id
                }
            },
            {
                headerName: 'lang_rank',
                field: 'rank',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    let div = document.createElement('div');
                    div.innerText = params.data[params.colDef.field];
                    div.className = 'showTitle';
                    return div;
                }
            },
            this.state.view !== 'BUY_SELL'
                ? {
                    headerName: 'lang_value',
                    field: 'value',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Value traded for period',
                    cellRenderer: (params) => {
                        let div = document.createElement('div');
                        let data = this.renderNumberWithText(params.data[params.colDef.field])
                        let textShow = document.createElement('div');
                        let titleShow = document.createElement('div');
                        div.appendChild(textShow)
                        div.appendChild(titleShow)
                        textShow.innerText = data;
                        titleShow.innerText = formatNumberValue(params.data[params.colDef.field]);
                        titleShow.className = 'showTitle hidenForTitle';
                        return div;
                    },
                    valueGetter: (params) => {
                        return Number(params.data[params.colDef.field])
                    }
                } : null,
            this.state.view === 'BUY_SELL'
                ? {
                    headerName: 'tot_val',
                    field: 'total_value',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Total Value traded for period',
                    cellRenderer: (params) => {
                        let div = document.createElement('div');
                        let data = this.renderNumberWithText(params.data[params.colDef.field])
                        let textShow = document.createElement('div');
                        let titleShow = document.createElement('div');
                        div.appendChild(textShow)
                        div.appendChild(titleShow)
                        textShow.innerText = data;
                        titleShow.innerText = formatNumberValue(params.data[params.colDef.field]);
                        titleShow.className = 'showTitle hidenForTitle';
                        return div;
                    }
                    // valueGetter: (params) => {
                    //     return this.renderNumberWithText(params.data[params.colDef.field])
                    // }
                } : null,
            {
                headerName: 'tot_val%',
                field: 'traded_percent',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                customTooltip: 'Percentage  of total traded value',
                cellRenderer: (params) => {
                    let div = document.createElement('div');
                    let data = this.renderNumberWithText(params.data[params.colDef.field])
                    let textShow = document.createElement('div');
                    let titleShow = document.createElement('div');
                    div.appendChild(textShow)
                    div.appendChild(titleShow)
                    textShow.innerText = data;
                    titleShow.innerText = formatNumberValue(params.data[params.colDef.field]);
                    titleShow.className = 'showTitle hidenForTitle';
                    return div;
                }
                // valueGetter: (params) => {
                //     return this.renderNumberWithText(params.data[params.colDef.field])
                // }
            },
            this.state.view !== 'BUY_SELL'
                ? {
                    headerName: 'lang_volume',
                    field: 'volume',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Volume traded for period',
                    cellRenderer: (params) => {
                        let div = document.createElement('div');
                        let data = this.renderNumberWithText(params.data[params.colDef.field])
                        let textShow = document.createElement('div');
                        let titleShow = document.createElement('div');
                        div.appendChild(textShow)
                        div.appendChild(titleShow)
                        textShow.innerText = data;
                        titleShow.innerText = formatNumberVolume(params.data[params.colDef.field]);
                        titleShow.className = 'showTitle hidenForTitle';
                        return div;
                    }
                    // valueGetter: (params) => {
                    //     return this.renderNumberWithText(params.data[params.colDef.field])
                    // }
                } : null,
            this.state.view !== 'BUY_SELL'
                ? {
                    headerName: 'lang_price',
                    field: 'price',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Average trade price',
                    cellRenderer: (params) => {
                        let div = document.createElement('div');
                        let data = this.renderNumberWithText(params.data[params.colDef.field])
                        let textShow = document.createElement('div');
                        let titleShow = document.createElement('div');
                        div.appendChild(textShow)
                        div.appendChild(titleShow)
                        textShow.innerText = data;
                        titleShow.innerText = formatNumberPrice(params.data[params.colDef.field]);
                        titleShow.className = 'showTitle hidenForTitle';
                        return div;
                    }
                    // valueGetter: (params) => {
                    //     return this.renderNumberWithText(params.data[params.colDef.field])
                    // }
                } : null,
            this.state.view === 'BUY_SELL'
                ? {
                    headerName: 'net_val',
                    field: 'net_value',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Net value of buys and sells',
                    cellRenderer: (params) => {
                        let div = document.createElement('div');
                        let data = this.renderNumberWithText(params.data[params.colDef.field])
                        let textShow = document.createElement('div');
                        let titleShow = document.createElement('div');
                        div.appendChild(textShow)
                        div.appendChild(titleShow)
                        textShow.innerText = data;
                        titleShow.innerText = formatNumberValue(params.data[params.colDef.field]);
                        titleShow.className = 'showTitle hidenForTitle';
                        return div;
                    }
                    // valueGetter: (params) => {
                    //     return this.renderNumberWithText(params.data[params.colDef.field])
                    // }
                } : null,
            this.state.view === 'BUY_SELL'
                ? {
                    headerName: 'net_vol',
                    field: 'net_volume',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Net volume of buys and sells',
                    cellRenderer: (params) => {
                        return this.renderNumberVolume(params.data[params.colDef.field])
                    }
                    // valueGetter: (params) => {
                    //     return this.renderNumberVolume(params.data[params.colDef.field])
                    // }
                } : null,
            this.state.view === 'BUY_SELL'
                ? {
                    headerName: 'buy_vol',
                    field: 'buy_volume',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Volume bought',
                    cellRenderer: (params) => {
                        return this.renderNumberVolume(params.data[params.colDef.field])
                    }
                    // valueGetter: (params) => {
                    //     return this.renderNumberVolume(params.data[params.colDef.field])
                    // }
                } : null,
            this.state.view === 'BUY_SELL'
                ? {
                    headerName: 'buy_prc',
                    field: 'buy_price',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Average buy price',
                    cellRenderer: (params) => {
                        let div = document.createElement('div');
                        div.className = 'showTitle';
                        div.innerText = this.renderNumberPrice(params.data[params.colDef.field]);
                        return div;
                    }
                    // valueGetter: (params) => {
                    //     return this.renderNumberPrice(params.data[params.colDef.field])
                    // }
                } : null,
            this.state.view !== 'SELL'
                ? {
                    headerName: 'lang_buy_trades',
                    field: 'buy_count',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Number of buy transactions',
                    cellRenderer: (params) => {
                        return this.renderNumberVolume(params.data[params.colDef.field]);
                    }
                    // valueGetter: (params) => {
                    //     return this.renderNumberVolume(params.data[params.colDef.field])
                    // }
                } : null,
            this.state.view === 'BUY_SELL'
                ? {
                    headerName: 'sell_vol',
                    field: 'sell_volume',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Volume sold',
                    cellRenderer: (params) => {
                        return this.renderNumberVolume(params.data[params.colDef.field]);
                    }
                    // valueGetter: (params) => {
                    //     return this.renderNumberVolume(params.data[params.colDef.field])
                    // }
                } : null,
            this.state.view === 'BUY_SELL'
                ? {
                    headerName: 'sell_prc',
                    field: 'sell_price',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Average sell price',
                    cellRenderer: (params) => {
                        let div = document.createElement('div');
                        div.className = 'showTitle';
                        div.innerText = this.renderNumberPrice(params.data[params.colDef.field]);
                        return div;
                    }
                    // valueGetter: (params) => {
                    //     return this.renderNumberPrice(params.data[params.colDef.field])
                    // }
                } : null,
            this.state.view !== 'BUY'
                ? {
                    headerName: 'lang_sell_trades',
                    field: 'sell_count',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Number of sell transactions',
                    cellRenderer: (params) => {
                        return this.renderNumberVolume(params.data[params.colDef.field]);
                    }
                    // valueGetter: (params) => {
                    //     return this.renderNumberVolume(params.data[params.colDef.field])
                    // }
                } : null,
            this.state.view !== 'BUY_SELL'
                ? {
                    headerName: 'avg prem',
                    field: 'avg_prem',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Premium between average price and broker price',
                    cellRenderer: (params) => {
                        let div = document.createElement('div');
                        div.className = 'showTitle'
                        div.innerText = this.renderNumberPrice(params.data[params.colDef.field]);
                        return div
                    },
                    valueGetter: (params) => {
                        return this.renderNumberPrice(params.data[params.colDef.field])
                    }
                } : null,
            this.state.view !== 'BUY_SELL'
                ? {
                    headerName: 'mkt_prem',
                    field: 'market_prem',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Premium between market price and broker price',
                    headerIsNumber: true,
                    cellRenderer: (params) => {
                        let div = document.createElement('div');
                        div.classList.add('text-right', 'showTitle');
                        div.innerText = this.renderNumberPrice(params.data[params.colDef.field])
                        return div;
                    }
                    // valueGetter: (params) => {
                    //     return this.renderNumberPrice(params.data[params.colDef.field])
                    // }
                } : null,
            this.state.view === 'BUY_SELL'
                ? {
                    headerName: '#trades',
                    field: 'trades_count',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Total number ',
                    cellRenderer: (params) => {
                        return this.renderNumberVolume(params.data[params.colDef.field]);
                    }
                    // valueGetter: (params) => {
                    //     return this.renderNumberVolume(params.data[params.colDef.field])
                    // }
                } : null
        ]
    }

    renderNumberWithText = (value) => {
        return formatNumberWithTextBroker(value, 2, true) + '';
    }

    renderNumberVolume = (value) => {
        let div = document.createElement('div');
        let valueShow = value;
        if (value === null) valueShow = '--';
        if (Number(value) === 0) valueShow = 0;
        if (valueShow && valueShow !== '--' && valueShow !== 0) {
            if (value >= 100000) valueShow = formatNumberWithTextBroker(value, 2, true) + '';
            valueShow = formatNumberVolume(value);
        }
        let textShow = document.createElement('div');
        let titleShow = document.createElement('div');
        div.appendChild(textShow)
        div.appendChild(titleShow)
        textShow.innerText = valueShow;
        titleShow.innerText = formatNumberVolume(value);
        titleShow.className = 'showTitle hidenForTitle';
        return div;
    }

    renderNumberPrice = (value) => {
        return formatNumberPrice(value, true) + '';
    }

    pageChanged = (pageId) => {
        if (this.page_id === pageId) return;
        this.page_id = pageId
        this.getDataBroker()
    }
    dataAtRefresh = (dataOld) => {
        let arr = []
        for (var item = 0; item < dataOld.length; item++) {
            let obj = {}
            for (var key in dataOld[item]) {
                if (key !== 'bid_price' &&
                    key !== 'broker_id' &&
                    key !== 'ask_price' &&
                    key !== 'display_name' &&
                    key !== 'exchange' &&
                    key !== 'key' &&
                    key !== 'security_code' &&
                    key !== 'symbol' &&
                    key !== 'trade_price') {
                    obj[key] = '--';
                } else obj[key] = dataOld[item][key]
            }
            arr.push(obj)
        }
        return arr
    }
    getDataBroker = (refresh) => {
        if (refresh) {
            try {
                if (this.dataOld && this.dataOld.length) {
                    const data = this.dataAtRefresh(this.dataOld)
                    this.setData(data)
                }
                if (this.data2Old && this.data2Old.length) {
                    const data2 = this.dataAtRefresh(this.data2Old)
                    this.setData2(data2)
                }
            } catch (error) {
                this.setData([])
                this.setData2([])
            }
        }
        const { securityType, tradeType, exchange, view, symbol, frequency, symbolObj, sortField, sortType } = this.state
        const fromDate = moment(this.state.fromDate).format('DD/MM/YYYY');
        const toDate = moment(this.state.toDate).format('DD/MM/YYYY');
        const brokerState = {
            securityType: securityType,
            exchange: this.state.exchange,
            view: view,
            tradeType: tradeType,
            frequency: frequency,
            fromDate: this.state.fromDate,
            toDate: this.state.toDate,
            symbolObj: symbolObj,
            nameBroker: 2,
            sortField: sortField || null,
            sortType: sortType || null
        }
        this.props.handleSaveLayout(brokerState);
        if (!securityType || !tradeType || !exchange || !frequency || !fromDate || !toDate || !view) return
        let path = `/stock-share-analysis?from_date=${fromDate}&to_date=${toDate}&frequency=${frequency.toUpperCase()}&view=${view}&exchange=${exchange}&page_size=${pageSize}&page_id=${this.page_id}`
        if (securityType !== 'Total' && securityType !== '--') {
            path += `&security_type=${securityType}`
        }
        if (tradeType !== 'Total') {
            path += `&trade_type=${tradeType}`
        }
        if (symbol) {
            path += `&security_code=${symbol}`
        }
        if (sortField) path += `&sort=${sortField}&sort_type=${sortType}`
        const url = getUrlBrokerData(path)
        this.props.loading(true)
        getData(url)
            .then(async response => {
                this.props.loading(false)
                if (response.error) return
                this.isReady = true;
                this.data2 = response.data.data.broker_report || [];
                this.setData2(this.data2)
                this.data2Old = this.data2 || []
                const data = response.data.data.trade_type_report || [];
                this.data = []
                const lstColumns = [{
                    headerName: 'VALUE',
                    field: 'key',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    sortable: false,
                    cellRenderer: (params) => {
                        const div = document.createElement('div')
                        div.className = 'text-uppercase'
                        ReactDOM.render(<Lang>{params.data.key}</Lang>, div)
                        return div
                    }
                }]
                const dicData = {}
                data.map(item => {
                    lstColumns.push({
                        headerName: this.dicTradeTypes[item.trade_type] ? this.dicTradeTypes[item.trade_type] : dataStorage.translate('total_market'),
                        field: item.trade_type,
                        menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                        cellRenderer: (params) => {
                            let num = 2
                            if (params.data.key === 'avg_price') num = 4
                            let value = params.data[params.colDef.field];
                            if (Number(value) === 0) {
                                if (num === 2) value = '0.00';
                                else value = '0.0000';
                            }
                            let div = document.createElement('div');
                            let data = formatNumberWithTextBroker(value, num, true);
                            let textShow = document.createElement('div');
                            let titleShow = document.createElement('div');
                            div.appendChild(textShow)
                            div.appendChild(titleShow)
                            textShow.innerText = data;
                            titleShow.innerText = num === 2 ? formatNumberValue(params.data[params.colDef.field]) : formatNumberPrice(params.data[params.colDef.field])
                            titleShow.className = 'showTitle hidenForTitle';
                            return div;
                        },
                        valueGetter: (params) => {
                            let num = 2
                            if (params.data.key === 'avg_price') num = 4
                            const value = params.data[params.colDef.field];
                            if (Number(value) === 0) {
                                if (num === 2) return '0.00'
                                else return '0.0000'
                            }
                            return formatNumberWithTextBroker(value, num);
                        }
                    })
                    Object.keys(item).map(key => {
                        if (key !== 'trade_type') {
                            if (!dicData[key]) dicData[key] = { key: key };
                            dicData[key][item.trade_type] = item[key]
                            dicData[key].broker_type = item.trade_type
                        }
                    })
                })
                Object.keys(dicData).map(item => {
                    this.data.push(dicData[item])
                })
                this.setColumn(lstColumns, true)
                this.setData(this.data)
                this.dataOld = this.data || []
                if (!this.data2.length) {
                    this.setState({ isNodata: true })
                }
                this.pageObj = {
                    total_count: response.data.total_count || 0,
                    total_pages: response.data.total_page || 1,
                    current_page: response.data.current_page || 1,
                    temp_end_page: 0
                }
                this.setPage(this.pageObj)
            })
            .catch(error => {
                this.props.loading(false)
                this.setState({ isNodata: true })
                this.setData([])
                this.setData2([])
                this.pageObj = {
                    total_count: 0,
                    total_pages: 1,
                    current_page: 1,
                    temp_end_page: 0
                }
                this.setPage(this.pageObj)
            })
    }

    getCsvFunction2 = (gridDom) => {
        if (this.csvWoking) return
        this.csvWoking = true
        let columnHeaderGrid1 = this.getAllDisplayedColumns1()
        let columnHeaderGrid2 = this.getAllDisplayedColumns2()
        const { securityType, tradeType, exchange, view, symbol, frequency, sortField, sortType } = this.state
        const fromDate = moment(this.state.fromDate).format('DD/MM/YYYY');
        const toDate = moment(this.state.toDate).format('DD/MM/YYYY');
        // let path = `/broker-activity-analysis?from_date=${fromDate}&to_date=${toDate}&frequency=${frequency.toUpperCase()}&view=${view}&exchange=${exchange}&page_size=${pageSize}&page_id=${this.page_id}&&export=CSV`
        let body = {
            'query': {
                'from_date': fromDate,
                'to_date': toDate,
                'frequency': frequency.toUpperCase(),
                'view': view,
                'exchange': exchange
            }
        }
        if (symbol) body.query['security_code'] = symbol;
        else if (securityType !== 'Total' && securityType !== '--') {
            body.query['security_type'] = securityType
        }
        if (tradeType !== 'Total') {
            body.query['trade_type'] = tradeType
        }
        // if (brokerID !== '00') {
        //     body.query[broker_id] = brokerID
        // }
        if (sortField) {
            body.query.sort = sortField
            body.query.sort_type = sortType || 'desc'
        }
        const columnHeader = {
            'trade_type_report': columnHeaderGrid1,
            'broker_report': columnHeaderGrid2
        }
        getCsvFileBroker({
            url: getBrokerCsvFileUrl('stock-share-analysis'),
            body_req: body,
            columnHeader: columnHeader,
            lang: dataStorage.lang,
            gridDom: gridDom,
            glContainer: this.props.glContainer,
            fileName: 'Stock_Share_Analysis'
        }, () => {
            this.csvWoking = false;
        });
    }

    componentWillUnmount() {
        try {
            this.emitID && this.emitID.remove();
            this.emitConnectionID && this.emitConnectionID.remove();
            this.emitRefreshID && this.emitRefreshID.remove();
        } catch (error) {
            logger.error('componentWillUnmount On StockShareAnalysis ' + error)
        }
    }

    changeConnection = (isConnected) => {
        if (!isConnected !== !this.state.isConnected) {
            this.setState({ isConnected }, () => {
                isConnected && this.refreshData('refresh');
            })
        }
    }
    refreshData = async (eventName) => {
        try {
            // if (!Object.keys(this.dicBrokersName).length || !Object.keys(this.dicTradeTypes).length) {
            //     await this.getDataOptions()
            // }
            this.getDataBroker('refresh')
            this.refreshDataSymbol()
        } catch (error) {
            logger.error('refreshData On StockShareAnalysis' + error)
        }
    }

    dataReceivedFromBrokerHeader = symbolObj => {
        let securityType = '--';
        this.props.getSymbolObj(symbolObj);
        if (Object.keys(symbolObj).length === 0) securityType = 'Total';
        this.setState({ symbolObj: symbolObj, symbol: symbolObj.symbol, securityType }, () => this.getDataBroker())
    }

    resizeColumns = () => {
        this.opt && this.opt.fitAll && this.opt.fitAll();
    }

    render() {
        try {
            return (
                <div className='qe-widget stock-share-analysis'>
                    <BrokerHeader
                        {...this.props}
                        symbolObj={this.state.symbolObj}
                        items={this.createHeaderOptions(this.state.securityTypes, this.state.tradeTypes, this.state.fromDate, this.state.toDate)}
                        dataReceivedFromBrokerHeader={this.dataReceivedFromBrokerHeader}
                        refreshData={this.refreshData}
                    />
                    <section>
                        <SymbolPrice
                            {...this.props}
                            symbolObj={this.state.symbolObj}
                            refresh={(fn) => {
                                this.refreshDataSymbol = fn
                            }}
                            disableCollapse={this.props.brokerTabState.disableCollapse || false}
                        />
                    </section>
                    <section className='collapse-grid'>
                        {
                            this.props && this.props.renderTabs(
                                <Grid
                                    {...this.props}
                                    style={{ maxHeight: '228px' }}
                                    isReady={this.isReady}
                                    name={'stockShareAnalysis'}
                                    onlyOneRow={true}
                                    // noSupportFilter={true}
                                    fn={fn => {
                                        this.addOrUpdate = fn.addOrUpdate
                                        this.setData = fn.setData
                                        this.remove = fn.remove
                                        this.setColumn = fn.setColumn
                                        this.setQuickFilter = fn.setQuickFilter
                                        this.getAllDisplayedColumns1 = fn.getAllDisplayedColumns
                                    }}
                                    opt={opt => this.opt = opt}
                                    fnKey={data => {
                                        return data.key
                                    }}
                                    onlyOneRow={true}
                                    loadingCallback={this.props.loadingCallback}
                                    columns={[]}
                                    hidesSaveCsv={true}
                                />
                            )
                        }
                    </section>
                    <Grid
                        {...this.props}
                        isReady={this.isReady}
                        onlyOneRow={true}
                        name={'stockShareAnalysis2'}
                        // noSupportFilter={true}
                        fn={fn => {
                            this.addOrUpdate2 = fn.addOrUpdate
                            this.setData2 = fn.setData
                            this.remove2 = fn.remove
                            this.setColumn2 = fn.setColumn
                            this.setQuickFilter2 = fn.setQuickFilter
                            this.getAllDisplayedColumns2 = fn.getAllDisplayedColumns
                        }}
                        fnKey={data => {
                            return data.broker_id
                        }}
                        getCsvFunction2={this.getCsvFunction2}
                        paginate={{
                            setPage: (cb) => {
                                this.setPage = cb
                            },
                            page_size: pageSize,
                            pageChanged: this.pageChanged.bind(this)
                        }}
                        onlyOneRow={true}
                        getFilterOnSearch={this.getFilterOnSearch}
                        loadingCallback={this.props.loadingCallback}
                        // opt={(opt) => this.opt = opt}
                        columns={this.getColumns2()}
                    />
                </div >
            )
        } catch (error) {
            logger.error('render On StockShareAnalysis ' + error)
        }
    }

    getDataOptions = async () => {
        // const [securityTypes, tradeTypes, brokers] = await Promise.all([getSecurityTypeOptions(), getTradeTypeOptions(), getBrokerOptions()])
        // const { securityType, exchange, tradeType, view, symbol, frequency, fromDate, toDate } = this.initialState
        const { brokers, tradeTypes, securityType, exchange, tradeType, view, symbol, frequency, fromDate, toDate } = this.state
        this.setDicBrokes(brokers)
        this.setDicTradeTypes(tradeTypes)
        const stateObj = {
            tradeType: tradeType || tradeTypes[0].value
        }
        securityType && (stateObj.securityType = securityType || this.state.securityTypes[0].value)
        if (securityType && securityType === '--') stateObj.securityType = '--'
        exchange && (stateObj.exchange = exchange)
        view && (stateObj.view = view)
        frequency && (stateObj.frequency = frequency)
        fromDate && (stateObj.fromDate = fromDate)
        toDate && (stateObj.toDate = toDate)
        this.setState(stateObj)
    }

    setDicBrokes = (brokers) => {
        if (brokers.length) {
            brokers.map(item => {
                this.dicBrokersName[item.value] = item.label
            })
        }
    }

    setDicTradeTypes = (tradeTypes) => {
        if (tradeTypes.length) {
            tradeTypes.map(item => {
                this.dicTradeTypes[item.value] = item.label
            })
        }
    }

    async componentDidMount() {
        try {
            this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
            this.emitID = this.subscription && this.subscription.addListener(eventEmitterRefresh.CLICK_TO_REFRESH_STATE, this.refreshData.bind(this));
            await this.getDataOptions()
            this.getDataBroker()
            if (this.props.func) {
                this.props.func({
                    resizeColumns: this.resizeColumns
                })
            }
        } catch (error) {
            logger.error('componentDidMount On StockShareAnalysis ' + error)
        }
    }
}

export default StockShareAnalysis
