import React from 'react';
import {
    getData,
    getUrlBrokerData,
    makeSymbolUrl,
    getBrokerCsvFileUrl,
    makePriceLevel1UrlNew
} from '../../helper/request'
import {
    formatNumberPrice,
    formatNumberVolume,
    formatNumberWithTextBroker,
    formatNumberValue,
    checkRole,
    isAUSymbol,
    getCsvFileBroker
} from '../../helper/functionUtils'
import dataStorage from '../../dataStorage';
import Scroll from '../Inc/Scroll/Scroll'
import { func } from '../../storage';
import { emitter, emitterRefresh, eventEmitter, eventEmitterRefresh } from '../../constants/emitter_enum';
import logger from '../../helper/log';
import Lang from '../Inc/Lang/Lang';
import BrokerHeader from '../Inc/BrokerHeader';
import DropDown from '../DropDown/DropDown';
import { defaultHeaderDropdownOptions } from '../../constants/broker_data'
import Grid from '../Inc/Grid/Grid';
import uuidv4 from 'uuid/v4';
import Flag from '../Inc/Flag/Flag';
import StockShareAnalysis from '../StockShareAnalysis';
// import { regisRealtime, unregisRealtime } from '../../helper/streamingSubscriber';
import moment from 'moment-timezone';
import ExampleCustomInput from '../Inc/ExampleCustomInput';
import { handleChangeDatePicker, setDatePickerDefault, changeDateWithFrequence, setInitMondayDate, setInitFridayDate } from '../Inc/BrokerDataFrequencyAndTime/FrequencyAndTimeBroker';
import DatePicker from '../Inc/DatePicker/DatePicker';

const pageSize = 50

export class BrokerActivityAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.initState = props.loadState()
        this.subscription = func.getStore(emitterRefresh.CLICK_TO_REFRESH);
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION)
        this.user_id = dataStorage.userInfo.user_id
        this.pageObj = {}
        this.page_id = 1
        this.dicSymbolInfo = {}
        this.dicData2 = {}
        this.dicTradeTypes = {}
        this.dicBrokers = {}
        this.dataOld = []
        this.dataOldBottom = []
        this.dateTimeDefault = moment(moment().tz(dataStorage.timeZone)).subtract(3, 'days');
        this.defaultBrokerID = '00';
        this.defaultSecurityType = 'Total';
        this.defaultExchange = 'ASX:TM';
        this.defaultView = 'BUY_SELL';
        this.defaultTradeType = 'Total';
        this.defaultFrequency = 'Weekly';
        this.defaultFromDate = setInitMondayDate(moment(this.dateTimeDefault));
        this.defalutToDate = setInitFridayDate(moment(this.dateTimeDefault)).day;
        this.checkBrokerTabState = this.props.brokerTabState && Object.keys(this.props.brokerTabState).length !== 0
        const { brokers, securityTypes, tradeTypes } = this.props
        this.state = {
            isConnected: dataStorage.connected,
            data: {},
            brokers: brokers || [],
            securityTypes: securityTypes || [],
            tradeTypes: tradeTypes || [],
            // sortField: 'tot_val',
            // sortType: 'desc',
            brokerID: this.checkBrokerTabState ? this.props.brokerTabState.brokerID : ((this.props.objValue && this.props.objValue.brokerID) ? this.props.objValue.brokerID : ((this.initState.brokerState && this.initState.brokerState.brokerID) || this.defaultBrokerID)),
            securityType: this.checkBrokerTabState ? ((this.props.brokerTabState.securityType === '--' && Object.keys(this.props.brokerTabState.symbolObj).length === 0) ? this.defaultSecurityType : (this.props.brokerTabState.securityType || this.defaultSecurityType)) : ((this.props.objValue && this.props.objValue.securityType) ? this.props.objValue.securityType : this.defaultSecurityType),
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

    createHeaderOptions = (brokers, securityTypes, tradeTypes, fromSelected, toSelected) => {
        const { brokerID, exchange, view, tradeType, securityType, frequency, fromDate, toDate } = this.state
        return [
            {
                label: 'lang_broker',
                type: 'dropdown',
                component: <DropDown
                    enablePDI={true}
                    options={brokers}
                    value={brokerID}
                    onChange={e => this.onChange(e, 'brokerID')}
                    rightAlign={true}
                    name='brokerHeader'
                    translate={false}
                />
            },
            {
                label: 'lang_exchange',
                type: 'dropdown',
                component: <DropDown
                    options={defaultHeaderDropdownOptions['exchange']}
                    value={exchange}
                    onChange={e => this.onChange(e, 'exchange')}
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
                    translate={false}
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

    onChange = (val, type) => {
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
            } else {
                Object.assign(state, { [type]: val })
            }
            if (this.state.sortField) {
                state.sortType = null
                state.sortField = null
            }
            this.page_id = 1
            this.setState(state, () => {
                if (type === 'securityType') {
                    this.props.handleSaveLayout({ symbolObj: {} });
                }
                this.allActionDropDown(type)
            });
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
                // code
                headerName: 'lang_code',
                field: 'security_code',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                customTooltip: 'Security code',
                cellRenderer: (params) => {
                    const divRoot = document.createElement('div');
                    const divSymbol = document.createElement('div');
                    const divSymbolName = document.createElement('div');
                    const divFlag = document.createElement('div');
                    divSymbol.classList.add('divSymbol');
                    const flagContent = document.createElement('div');
                    const exchange = params.data.exchange || '';
                    if (exchange) {
                        ReactDOM.render(
                            <Flag symbolObj={params.data} />
                            , flagContent);
                    }
                    divFlag.appendChild(flagContent);
                    divFlag.classList.add('divFlag');
                    divSymbolName.innerHTML = params.data.display_name || params.data.security_code;
                    divRoot.appendChild(divSymbol);
                    divSymbol.appendChild(divSymbolName);
                    divRoot.appendChild(divFlag);
                    divRoot.className = 'symbolWlRoot';
                    divSymbolName.classList = 'symbol-name color-primary text-decoration-hover pointer';
                    divRoot.title = params.data.display_name || params.data.security_code;
                    divRoot.classList.add('flex');
                    divSymbolName.onclick = () => {
                        this.setState({ securityType: '--' }, () => this.swithComponent(this.dicSymbolInfo[params.data.security_code], true))
                    }
                    return divRoot;
                },
                valueGetter: (params) => {
                    return params.data.display_name || params.data.security_code;
                }
            },
            this.state.view !== 'BUY_SELL'
                ? {
                    headerName: 'lang_value',
                    field: 'value',
                    sort: 'desc',
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
                    }
                    // valueGetter: (params) => {
                    //     return Number(params.data[params.colDef.field])
                    // }
                } : null,
            this.state.view === 'BUY_SELL'
                ? {
                    headerName: 'lang_tot_val',
                    field: 'total_value',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Total value traded for period',
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
                    //     if (params.data[params.colDef.field] || params.data[params.colDef.field] === 0) {
                    //         return Number(params.data[params.colDef.field]);
                    //     }
                    // }
                } : null,
            {
                headerName: 'lang_tot_val%',
                field: 'traded_percent',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                customTooltip: 'Percentage of security traded by broker',
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
                //     return Number(params.data[params.colDef.field])
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
                        let data = this.renderNumberVolume(params.data[params.colDef.field]);
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
                    //     return Number(params.data[params.colDef.field])
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
                    //     return Number(params.data[params.colDef.field])
                    // }
                } : null,
            this.state.view === 'BUY_SELL'
                ? {
                    headerName: 'lang_net_val',
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
                    //     return Number(params.data[params.colDef.field])
                    // }
                } : null,
            this.state.view === 'BUY_SELL'
                ? {
                    headerName: 'lang_net_vol',
                    field: 'net_volume',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Net volume of buys and sells',
                    cellRenderer: (params) => {
                        let div = document.createElement('div');
                        let data = this.renderNumberVolume(params.data[params.colDef.field]);
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
                    //     return Number(params.data[params.colDef.field])
                    // }
                } : null,
            this.state.view === 'BUY_SELL'
                ? {
                    headerName: 'lang_buy_vol',
                    field: 'buy_volume',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Volume bought',
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
                    //     if (params.data[params.colDef.field] || params.data[params.colDef.field] === 0) {
                    //         return Number(params.data[params.colDef.field]);
                    //     }
                    // }
                } : null,
            this.state.view === 'BUY_SELL'
                ? {
                    headerName: 'lang_buy_prc',
                    field: 'buy_price',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Average buy price',
                    cellRenderer: (params) => {
                        let div = document.createElement('div');
                        div.className = 'showTitle';
                        const value = params.data[params.colDef.field];
                        if (Number(value) === 0) return '0.0000'
                        div.innerText = value ? formatNumberPrice(value, true) : '--';
                        return div;
                    }
                    // valueGetter: (params) => {
                    //     if (params.data[params.colDef.field] || params.data[params.colDef.field] === 0) {
                    //         return Number(params.data[params.colDef.field]);
                    //     }
                    // }
                } : null,
            this.state.view === 'BUY_SELL'
                ? {
                    headerName: 'lang_sell_vol',
                    field: 'sell_volume',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Volume sold',
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
                    //     if (params.data[params.colDef.field] || params.data[params.colDef.field] === 0) {
                    //         return Number(params.data[params.colDef.field]);
                    //     }
                    // }
                } : null,
            this.state.view === 'BUY_SELL'
                ? {
                    headerName: 'lang_sell_prc',
                    field: 'sell_price',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Average sell price',
                    cellRenderer: (params) => {
                        let div = document.createElement('div');
                        div.className = 'showTitle';
                        const value = params.data[params.colDef.field];
                        if (Number(value) === 0) return '0.0000'
                        div.innerText = value ? formatNumberPrice(value, true) : '--';
                        return div;
                    }
                    // valueGetter: (params) => {
                    //     if (params.data[params.colDef.field] || params.data[params.colDef.field] === 0) {
                    //         return Number(params.data[params.colDef.field]);
                    //     }
                    // }
                } : null,
            {
                headerName: 'lang_avg_mkt_prc',
                field: 'avg_price',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                customTooltip: 'Average traded price for market',
                cellRenderer: (params) => {
                    let div = document.createElement('div');
                    div.className = 'showTitle';
                    const value = params.data[params.colDef.field];
                    if (Number(value) === 0) return '0.0000'
                    div.innerText = value ? formatNumberPrice(value, true) : '--';
                    return div;
                }
                // valueGetter: (params) => {
                //     if (params.data[params.colDef.field] || params.data[params.colDef.field] === 0) {
                //         return Number(params.data[params.colDef.field]);
                //     }
                // }
            },
            {
                headerName: 'lang_bid',
                field: 'bid_price',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                customTooltip: 'Bid price',
                sortable: false
            },
            {
                headerName: 'lang_offer',
                field: 'ask_price',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                customTooltip: 'Ask price',
                sortable: false
            },
            {
                headerName: 'lang_last',
                field: 'trade_price',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                customTooltip: 'Last price',
                sortable: false
            },
            this.state.view === 'BUY_SELL'
                ? {
                    headerName: 'lang_exchange',
                    field: 'exchange',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    customTooltip: 'Exchange',
                    headerIsNumber: true,
                    sortable: false,
                    cellRenderer: (params) => {
                        let div = document.createElement('div');
                        div.classList.add('text-right');
                        let str = params.data.exchange ? params.data.exchange : '--';
                        div.innerText = str;
                        return div;
                    }
                } : null
        ]
    }

    renderNumberWithText = (value) => {
        return formatNumberWithTextBroker(value, 2, true) + '';
    }

    renderNumberVolume = (value) => {
        if (value === null) return '--'
        if (Number(value) === 0) return '0'
        if (value) {
            if (value >= 100000) return formatNumberWithTextBroker(value, 2) + '';
            return formatNumberVolume(value) + '';
        }
        return '--';
    }

    swithComponent = (symbolObj) => {
        this.props.getSymbolObj(symbolObj);
        const brokerState = {
            brokerID: this.state.brokerID,
            securityType: this.state.securityType,
            exchange: this.state.exchange,
            view: this.state.view,
            tradeType: this.state.tradeType,
            frequency: this.state.frequency,
            fromDate: this.state.fromDate,
            toDate: this.state.toDate,
            symbolObj: symbolObj || {},
            nameBroker: 1
        }
        this.props.handleSaveLayout(brokerState);
        this.props.changeWidget({
            symbolObj: symbolObj || {},
            objValue: {
                brokerID: this.state.brokerID,
                securityType: this.state.securityType,
                exchange: this.state.exchange,
                view: this.state.view,
                tradeType: this.state.tradeType,
                frequency: this.state.frequency,
                fromDate: this.state.fromDate,
                toDate: this.state.toDate,
                symbolObj: symbolObj || {}
            }
        })
    }

    pageChanged = (pageId) => {
        if (this.page_id === pageId) return;
        this.page_id = pageId
        this.getDataBroker()
    }

    realtimePrice = (obj) => {
        // if (obj.quote) {
        //     Object.assign(this.dicData2[obj.symbol], obj.quote)
        //     this.addOrUpdate2(this.dicData2[obj.symbol])
        // }
    }

    getSymbolInfo = async (path) => {
        const urlMarketInfo = makeSymbolUrl(path);
        await getData(urlMarketInfo).then(res => {
            res = res.data;
            for (let index = 0, length = res.length; index < length; index++) {
                this.dicSymbolInfo[res[index].symbol] = res[index]
                this.dicSymbolInfo[res[index].symbol].company_name = res[index].company_name || res[index].company || res[index].security_name || '--'
            }
        }).catch(error => {
            logger.sendLog('error getCompanyName AlertList', error);
        })
    }

    getSymbolPrice = async (listCode) => {
        try {
            const symbolArray = listCode.split(',')
            let symbolArr = symbolArray.filter(v => !dataStorage.symbolsObjDic[v])
            if (symbolArr.length > 0) {
                const symbolStringUrl = makeSymbolUrl(symbolArr.join(','));
                await getData(symbolStringUrl)
                    .then(response => {
                        if (response.data && response.data.length) {
                            for (let i = 0; i < response.data.length; i++) {
                                dataStorage.symbolsObjDic[response.data[i].symbol] = response.data[i]
                            }
                        }
                    })
                    .catch(error => {
                        logger.log(error)
                    })
            }
            let urlObj = makePriceLevel1UrlNew(listCode, 'ASX');
            const url = urlObj.normal || urlObj.delayed
            await getData(url)
                .then(response => {
                    const data = response.data || {};
                    data.map(itemPrice => {
                        if (itemPrice.quote) {
                            if (itemPrice.quote.ask_price) this.dicSymbolInfo[itemPrice.symbol].ask_price = itemPrice.quote.ask_price
                            if (itemPrice.quote.bid_price) this.dicSymbolInfo[itemPrice.symbol].bid_price = itemPrice.quote.bid_price
                            if (itemPrice.quote.trade_price) this.dicSymbolInfo[itemPrice.symbol].trade_price = itemPrice.quote.trade_price
                        }
                    })
                })
                .catch((error) => {
                    console.log('getSymbolPrice ', error)
                });
        } catch (error) {
            console.log(error)
        }
    }
    getDataBroker = (refresh) => {
        // unregisRealtime({
        //     callback: this.realtimePrice
        // });
        const { brokerID, securityType, tradeType, exchange, view, frequency, sortField, sortType } = this.state
        const fromDate = moment(this.state.fromDate).format('DD/MM/YYYY');
        const toDate = moment(this.state.toDate).format('DD/MM/YYYY');
        const brokerState = {
            brokerID: brokerID,
            securityType: securityType,
            exchange: exchange,
            view: view,
            tradeType: tradeType,
            frequency: frequency,
            fromDate: this.state.fromDate,
            toDate: this.state.toDate,
            nameBroker: 1,
            sortField: sortField || null,
            sortType: sortType || null
        }
        this.props.handleSaveLayout(brokerState);
        let path = `/broker-activity-analysis?broker_id=${brokerID}&from_date=${fromDate}&to_date=${toDate}&frequency=${frequency.toUpperCase()}&view=${view}&exchange=${exchange}&page_size=${pageSize}&page_id=${this.page_id}`
        // &sort=${sortField}&sort_type=${sortType}
        if (securityType !== 'Total' && securityType !== '--') {
            path += `&security_type=${securityType}`
        }
        if (tradeType !== 'Total') {
            path += `&trade_type=${tradeType}`
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
                if (this.data2.length > 0) {
                    this.setState({ isNodata: false })
                    let stringQuery = '';
                    const listSymbol = [];
                    for (let index = 0, length = this.data2.length; index < length; index++) {
                        this.data2[index].broker_id = uuidv4()
                        if (this.data2[index] && this.data2[index].security_code) listSymbol.push(encodeURIComponent(this.data2[index].security_code));
                    }
                    stringQuery = [...new Set(listSymbol)].toString();
                    if (stringQuery) {
                        await this.getSymbolInfo(stringQuery)
                        await this.getSymbolPrice(stringQuery)
                    }
                    for (let i = 0; i < this.data2.length; i++) {
                        const symbol = this.data2[i].security_code
                        if (this.dicSymbolInfo[symbol]) {
                            this.data2[i].exchange = this.dicSymbolInfo[symbol].exchanges[0]
                            this.data2[i].display_name = this.dicSymbolInfo[symbol].display_name
                            this.data2[i].ask_price = this.dicSymbolInfo[symbol].ask_price
                            this.data2[i].bid_price = this.dicSymbolInfo[symbol].bid_price
                            this.data2[i].trade_price = this.dicSymbolInfo[symbol].trade_price
                            this.dicData2[symbol] = this.data2[i]
                            const exc = this.data2[i].exchange
                        }
                    }
                }

                this.dataOldBottom = this.data2 || []
                const data = response.data.data.trade_type_report || [];
                this.data = []
                const lstColumns = [{
                    headerName: 'VALUE',
                    menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                    sortable: false,
                    field: 'key',
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
                        headerFixed: item.trade_type !== 'TOTAL' ? this.dicTradeTypes[item.trade_type] : dataStorage.translate('total_market'),
                        menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                        sortable: false,
                        field: item.trade_type,
                        // headerFixed: true,
                        cellRenderer: (params) => {
                            let div = document.createElement('div');
                            let value = Number(params.data[params.colDef.field]);
                            if (value === 0) value = '0.00';
                            let data = formatNumberWithTextBroker(value, 2) || '--'
                            let textShow = document.createElement('div');
                            let titleShow = document.createElement('div');
                            div.appendChild(textShow)
                            div.appendChild(titleShow)
                            textShow.innerText = data;
                            titleShow.innerText = formatNumberValue(params.data[params.colDef.field]);
                            titleShow.className = 'showTitle hidenForTitle';
                            return div;
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
                this.setData2(this.data2)
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
        const { brokerID, securityType, tradeType, exchange, view, frequency, sortField, sortType } = this.state
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
        if (securityType !== 'Total' && securityType !== '--') {
            body.query['security_type'] = securityType
        }
        if (tradeType !== 'Total') {
            body.query['trade_type'] = tradeType
        }
        if (brokerID !== '00') {
            body.query['broker_id'] = brokerID
        }
        if (sortField) {
            body.query.sort = sortField
            body.query.sort_type = sortType || 'desc'
        }
        const columnHeader = {
            'trade_type_report': columnHeaderGrid1,
            'broker_report': columnHeaderGrid2
        }
        getCsvFileBroker({
            url: getBrokerCsvFileUrl('broker-activity-analysis'),
            body_req: body,
            columnHeader: columnHeader,
            lang: dataStorage.lang,
            gridDom: gridDom,
            glContainer: this.props.glContainer,
            fileName: 'Broker_Activity_Analysis'
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
            logger.error('componentWillUnmount On BrokerActivityAnalysis ' + error)
        }
    }

    changeConnection = (isConnected) => {
        if (!isConnected !== !this.state.isConnected) {
            this.setState({ isConnected }, () => {
                isConnected && this.refreshData();
            })
        }
    }
    getFilterOnSearch = (filter, sort) => {
        // console.log(sort)
        if (sort.length) {
            console.log(sort[0].sort, '----', sort[0].colId)
            this.setState({ sortField: sort[0].colId, sortType: sort[0].sort.toUpperCase() }, () => this.getDataBroker())
        } else this.setState({ sortField: null, sortType: null }, () => this.getDataBroker())
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
    refreshData = () => {
        try {
            if (this.dataOld && this.dataOld.length) {
                const arr = this.dataAtRefresh(this.dataOld)
                this.setData(arr)
            }
            if (this.dataOldBottom && this.dataOldBottom.length) {
                const arrBot = this.dataAtRefresh(this.dataOldBottom)
                this.setData2(arrBot)
            }
            this.getDataBroker()
        } catch (error) {
            logger.error('refreshData On getDataBroker' + error)
        }
    }
    setDicTradeTypes = (list) => {
        if (list.length) {
            list.map(item => {
                this.dicTradeTypes[item.value] = item.label
            })
        }
    }

    resizeColumns = () => {
        this.opt && this.opt.fitAll && this.opt.fitAll();
    }

    render() {
        const { brokerForm, brokerDataReportOptions, defaultBrokerDataReport, handleChangeBrokerDataReports } = this.props;
        try {
            return (
                <div className='qe-widget stock-share-analysis'>
                    <BrokerHeader
                        {...this.props}
                        items={this.createHeaderOptions(this.state.brokers, this.state.securityTypes, this.state.tradeTypes, this.state.fromDate, this.state.toDate)}
                        hiddenSearchBox={true}
                        brokerForm={brokerForm}
                        brokerDataReportOptions={brokerDataReportOptions}
                        defaultBrokerDataReport={defaultBrokerDataReport}
                        handleChangeBrokerDataReports={handleChangeBrokerDataReports}
                        refreshData={this.refreshData}
                    />
                    <div className='stock-share-analysis-grid'>
                        <section>
                            {
                                this.props && this.props.renderTabs(
                                    <Grid
                                        {...this.props}
                                        isReady={this.isReady}
                                        name={'brokerActivityAnalysis'}
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
                                        fnKey={data => {
                                            return data.key
                                        }}
                                        hidesSaveCsv={true}
                                        // getCsvFunction2={this.getCsvFunction2}
                                        onlyOneRow={true}
                                        loadingCallback={this.props.loadingCallback}
                                        opt={(opt) => this.opt = opt}
                                        columns={[]}
                                    // sort={{ total_value: 'desc' }}
                                    />
                                )
                            }
                        </section>
                        <Grid
                            {...this.props}
                            isReady={this.isReady}
                            onlyOneRow={true}
                            name={'brokerActivityAnalysis2'}
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
                                return data.security_code
                            }}
                            paginate={{
                                setPage: (cb) => {
                                    this.setPage = cb
                                },
                                page_size: pageSize,
                                pageChanged: this.pageChanged.bind(this)
                            }}
                            // hidesSaveCsv={true}
                            getCsvFunction2={this.getCsvFunction2}
                            onlyOneRow={true}
                            getFilterOnSearch={this.getFilterOnSearch}
                            loadingCallback={this.props.loadingCallback}
                            // opt={(opt) => this.opt = opt}
                            columns={this.getColumns2()}
                        />
                    </div>
                </div >
            )
        } catch (err) {
            logger.error('render On BrokerActivityAnalysis ' + err)
        }
    }

    componentDidMount() {
        try {
            this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
            this.emitID = this.subscription && this.subscription.addListener(eventEmitterRefresh.CLICK_TO_REFRESH_STATE, this.refreshData.bind(this));
            if (this.props.func) {
                this.props.func({
                    resizeColumns: this.resizeColumns
                })
            }
            // const [brokers, securityTypes, tradeTypes] = await Promise.all([getBrokerOptions(), getSecurityTypeOptions(), getTradeTypeOptions()])
            const tradeTypes = this.state.tradeTypes;
            this.setDicTradeTypes(tradeTypes)
            let securityType = this.state.securityType ? this.state.securityType : '';
            if (securityType && securityType === '--') securityType = 'Total';
            const tradeType = this.state.tradeType || tradeTypes[0].value;
            this.setState({
                tradeType,
                securityType
            }, () => this.getDataBroker())
        } catch (error) {
            logger.error('componentDidMount On BrokerActivityAnalysis ' + error)
        }
    }
}

export default BrokerActivityAnalysis
