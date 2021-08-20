import React, { Component } from 'react'
import BrokerHeader from '../Inc/BrokerHeader/BrokerHeader'
import DropDown from '../DropDown/DropDown'
import { defaultHeaderDropdownOptions } from '../../constants/broker_data'
import SymbolPrice from '../SymbolPrice/SymbolPrice'
import logger from '../../helper/log'
import uuidv4 from 'uuid/v4'
import Grid from '../Inc/Grid/Grid'
import { getUrlBrokerData, getData, getBrokerCsvFileUrl } from '../../helper/request'
import { func } from '../../storage'
import { emitter, eventEmitter, emitterRefresh, eventEmitterRefresh } from '../../constants/emitter_enum'
import dataStorage from '../../dataStorage'
import { formatNumberNew2, formatNumberWithTextBroker, getCsvFileBroker } from '../../helper/functionUtils'
import moment from 'moment-timezone';
import ExampleCustomInput from '../Inc/ExampleCustomInput';
import { handleChangeDatePicker, setDatePickerDefault, changeDateWithFrequence, setInitMondayDate, setInitFridayDate } from '../Inc/BrokerDataFrequencyAndTime/FrequencyAndTimeBroker';
import DatePicker from '../Inc/DatePicker/DatePicker';
class BrokerStockDetail extends Component {
    constructor(props) {
        super(props)
        this.defaultBroker = '00'
        this.defaultExchange = 'ASX:TM'
        this.defaultSecurityType = 'Total'
        this.defaultFrequency = 'Weekly'
        this.dateTimeDefault = moment(moment().tz(dataStorage.timeZone)).subtract(3, 'days');
        this.defaultFromDate = setInitMondayDate(moment(this.dateTimeDefault))
        this.defaultToDate = setInitFridayDate(moment(this.dateTimeDefault)).day
        this.subscription = func.getStore(emitterRefresh.CLICK_TO_REFRESH)
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION)
        this.initialState = this.props.loadState()
        this.tradeTypesMapping = {}
        this.checkBrokerTabState = this.props.brokerTabState && Object.keys(this.props.brokerTabState).length !== 0
        const { brokers, securityTypes } = this.props
        this.state = {
            isConnected: dataStorage.connected,
            symbolObj: this.checkBrokerTabState ? this.props.brokerTabState.symbolObj : {},
            brokers: brokers || [],
            securityTypes: securityTypes || [],
            brokerID: this.checkBrokerTabState ? this.props.brokerTabState.brokerID : this.defaultBroker,
            securityType: this.checkBrokerTabState ? (Object.keys(this.props.brokerTabState.symbolObj).length === 0 ? (this.props.brokerTabState.securityType === '--' ? this.defaultSecurityType : this.props.brokerTabState.securityType) : '--') : this.defaultSecurityType,
            exchange: this.checkBrokerTabState ? this.props.brokerTabState.exchange : this.defaultExchange,
            frequency: this.checkBrokerTabState ? this.props.brokerTabState.frequency : this.defaultFrequency,
            fromDate: this.checkBrokerTabState ? moment(this.props.brokerTabState.fromDate) : this.defaultFromDate,
            toDate: this.checkBrokerTabState ? moment(this.props.brokerTabState.toDate) : this.defaultToDate
        }
        if (this.checkBrokerTabState) {
            let changeDatePicker = handleChangeDatePicker(this.state.frequency, this.state.toDate, 'to', { fromDate: this.state.fromDate, toDate: this.state.toDate })
            this.state.toDate = changeDatePicker.toDate;
        }
        this.columns = [
            {
                headerName: 'lang_trade_type',
                field: 'trade_type',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: params => {
                    if (!params || !params.data || !params.colDef || !params.colDef.field || (params.data[params.colDef.field] !== 0 && !params.data[params.colDef.field])) return '--'
                    const div = document.createElement('div')
                    div.innerText = (this.tradeTypesMapping && this.tradeTypesMapping[params.data.trade_type]) || '--'
                    if (params.data.trade_type === 'TOTAL') {
                        div.innerText = dataStorage.translate('total_market') || '--'
                    }
                    div.className = 'showTitle'
                    div.style.textTransform = 'uppercase'
                    return div
                }
            },
            {
                headerName: 'avg_mkt_price',
                field: 'avg_price',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: params => {
                    if (!params || !params.data || !params.data.trade_type) return '--'
                    const div = document.createElement('div')
                    div.innerText = formatNumberNew2(params.data[params.colDef.field], 4, true)
                    div.className = 'showTitle'
                    return div
                }
            },
            {
                headerName: 'net_val',
                field: 'net_value',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: params => {
                    if (!params || !params.data || !params.colDef || !params.colDef.field || (params.data[params.colDef.field] !== 0 && !params.data[params.colDef.field])) return '--'
                    const div = document.createElement('div')
                    if (params.data[params.colDef.field] === 0) {
                        div.innerText = formatNumberNew2(params.data[params.colDef.field], 2, true)
                    } else {
                        div.innerText = formatNumberWithTextBroker(params.data[params.colDef.field], 2)
                    }
                    div.className = 'showTitle'
                    return div
                }
            },
            {
                headerName: 'net_vol',
                field: 'net_volume',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: params => {
                    if (!params || !params.data || !params.colDef || !params.colDef.field || (params.data[params.colDef.field] !== 0 && !params.data[params.colDef.field])) return '--'
                    const div = document.createElement('div')
                    let textShow = document.createElement('div');
                    let titleShow = document.createElement('div');
                    if (params.data[params.colDef.field] === 0) {
                        textShow.innerText = formatNumberNew2(params.data[params.colDef.field], 0, true)
                    } else {
                        textShow.innerText = formatNumberWithTextBroker(params.data[params.colDef.field], 0)
                    }
                    titleShow.innerText = formatNumberNew2(params.data[params.colDef.field], 0, true)
                    titleShow.className = 'showTitle hidenForTitle'
                    div.appendChild(textShow)
                    div.appendChild(titleShow)
                    return div
                }
            },
            {
                headerName: 'buy_val',
                field: 'buy_value',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: params => {
                    if (!params || !params.data || !params.colDef || !params.colDef.field || (params.data[params.colDef.field] !== 0 && !params.data[params.colDef.field])) return '--'
                    const div = document.createElement('div')
                    let textShow = document.createElement('div');
                    let titleShow = document.createElement('div');
                    if (params.data[params.colDef.field] === 0) {
                        textShow.innerText = formatNumberNew2(params.data[params.colDef.field], 2, true)
                    } else {
                        textShow.innerText = formatNumberWithTextBroker(params.data[params.colDef.field], 2)
                    }
                    titleShow.innerText = formatNumberNew2(params.data[params.colDef.field], 2, true)
                    titleShow.className = 'showTitle hidenForTitle'
                    div.appendChild(textShow)
                    div.appendChild(titleShow)
                    return div
                }
            },
            {
                headerName: 'buy_vol',
                field: 'buy_volume',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: params => {
                    if (!params || !params.data || !params.colDef || !params.colDef.field || (params.data[params.colDef.field] !== 0 && !params.data[params.colDef.field])) return '--'
                    const div = document.createElement('div')
                    let textShow = document.createElement('div');
                    let titleShow = document.createElement('div');
                    if (params.data[params.colDef.field] === 0) {
                        textShow.innerText = formatNumberNew2(params.data[params.colDef.field], 2, true)
                    } else {
                        textShow.innerText = formatNumberWithTextBroker(params.data[params.colDef.field], 2)
                    }
                    titleShow.innerText = formatNumberNew2(params.data[params.colDef.field], 2, true)
                    titleShow.className = 'showTitle hidenForTitle'
                    div.appendChild(textShow)
                    div.appendChild(titleShow)
                    return div
                }
            },
            {
                headerName: 'buy_prc',
                field: 'buy_price',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: params => {
                    if (!params || !params.data || !params.colDef || !params.colDef.field || (params.data[params.colDef.field] !== 0 && !params.data[params.colDef.field])) return '--'
                    const div = document.createElement('div')
                    div.innerText = formatNumberNew2(params.data[params.colDef.field], 4, true)
                    div.className = 'showTitle'
                    return div
                }
            },
            {
                headerName: 'sell_val',
                field: 'sell_value',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: params => {
                    if (!params || !params.data || !params.colDef || !params.colDef.field || (params.data[params.colDef.field] !== 0 && !params.data[params.colDef.field])) return '--'
                    const div = document.createElement('div')
                    let textShow = document.createElement('div');
                    let titleShow = document.createElement('div');
                    if (params.data[params.colDef.field] === 0) {
                        textShow.innerText = formatNumberNew2(params.data[params.colDef.field], 2, true)
                    } else {
                        textShow.innerText = formatNumberWithTextBroker(params.data[params.colDef.field], 2)
                    }
                    titleShow.innerText = formatNumberNew2(params.data[params.colDef.field], 2, true)
                    titleShow.className = 'showTitle hidenForTitle'
                    div.appendChild(textShow)
                    div.appendChild(titleShow)
                    return div
                }
            },
            {
                headerName: 'sell_vol',
                field: 'sell_volume',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: params => {
                    if (!params || !params.data || !params.colDef || !params.colDef.field || (params.data[params.colDef.field] !== 0 && !params.data[params.colDef.field])) return '--'
                    const div = document.createElement('div')
                    let textShow = document.createElement('div');
                    let titleShow = document.createElement('div');
                    if (params.data[params.colDef.field] === 0) {
                        textShow.innerText = formatNumberNew2(params.data[params.colDef.field], 2, true)
                    } else {
                        textShow.innerText = formatNumberWithTextBroker(params.data[params.colDef.field], 2)
                    }
                    titleShow.innerText = formatNumberNew2(params.data[params.colDef.field], 2, true)
                    titleShow.className = 'showTitle hidenForTitle'
                    div.appendChild(textShow)
                    div.appendChild(titleShow)
                    return div
                }
            },
            {
                headerName: 'sell_prc',
                field: 'sell_price',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: params => {
                    if (!params || !params.data || !params.colDef || !params.colDef.field || (params.data[params.colDef.field] !== 0 && !params.data[params.colDef.field])) return '--'
                    const div = document.createElement('div')
                    div.innerText = formatNumberNew2(params.data[params.colDef.field], 4, true)
                    div.className = 'showTitle'
                    return div
                }
            }
        ]
    }

    getCsvFunction2 = (gridDom) => {
        if (this.csvWoking) return
        this.csvWoking = true
        const { brokerID = '', securityType = '', symbolObj, exchange = '', frequency, sortField, sortType } = this.state
        const fromDate = moment(this.state.fromDate).format('DD/MM/YYYY')
        const toDate = moment(this.state.toDate).format('DD/MM/YYYY')
        const securityCode = symbolObj.symbol || ''
        let columnHeaderGrid = this.getAllDisplayedColumns()
        let body = {
            'query': {

                'broker_id': brokerID,
                'exchange': 'ASX:TM',
                'frequency': frequency.toUpperCase(),
                'from_date': fromDate,
                'to_date': toDate
            }
        }
        if (securityCode) body.query['security_code'] = securityCode
        else if (securityType !== 'Total' && securityType !== '--') {
            body.query['security_type'] = securityType
        }
        if (sortField) {
            body.query.sort = sortField
            body.query.sort_type = sortType || 'desc'
        }
        const columnHeader = {
            'broker_report': columnHeaderGrid
        }
        getCsvFileBroker({
            url: getBrokerCsvFileUrl('broker-stock-detail'),
            body_req: body,
            columnHeader: columnHeader,
            lang: dataStorage.lang,
            gridDom: gridDom,
            glContainer: this.props.glContainer,
            fileName: 'Broker_Stock_Detail'
        }, () => {
            this.csvWoking = false;
        });
    }

    getStockDetail = state => {
        const { brokerID = '', securityType = '', symbolObj, exchange = '', frequency, sortField, sortType } = state
        const fromDate = moment(this.state.fromDate).format('DD/MM/YYYY')
        const toDate = moment(this.state.toDate).format('DD/MM/YYYY')
        const brokerState = {
            brokerID: brokerID,
            securityType: securityType,
            exchange: this.state.exchange,
            frequency: frequency,
            fromDate: this.state.fromDate,
            toDate: this.state.toDate,
            symbolObj: symbolObj,
            nameBroker: 3,
            sortField: sortField || null,
            sortType: sortType || null
        }
        this.props.handleSaveLayout(brokerState);
        try {
            this.props.loading(true)
            const securityCode = symbolObj.symbol || ''
            let url = getUrlBrokerData(`/broker-stock-detail?broker_id=${brokerID}&exchange=${exchange}&frequency=${frequency.toUpperCase()}&from_date=${fromDate}&to_date=${toDate}`)
            if (securityCode) {
                url += `&security_code=${securityCode}`
            }
            if (securityType !== 'Total' && securityType !== '--') {
                url += `&security_type=${securityType}`
            }
            if (sortField) url += `&sort=${sortField}&sort_type=${sortType}`
            getData(url)
                .then(response => {
                    if (response && response.data && response.data.data) {
                        this.setData(this.filterTrading(response.data.data))
                        this.props.loading(false)
                    } else {
                        this.setData([])
                        this.props.loading(false)
                    }
                }).catch(error => {
                    console.log('error load data', error)
                    this.setData([])
                    this.props.loading(false)
                })
        } catch (error) {
            logger.log(`Error while getting stock detail data: ${error}`)
        }
    }

    createHeaderOptions = (brokers, securityTypes, fromSelected, toSelected) => {
        const { brokerID, exchange, securityType, frequency, fromDate, toDate } = this.state
        return [
            {
                label: 'Broker',
                type: 'dropdown',
                component: <DropDown
                    enablePDI={true}
                    options={brokers}
                    value={brokerID}
                    onChange={e => this.onChange(e, 'brokerID')}
                    rightAlign={true}
                    name='brokerHeader'
                />
            },
            {
                label: 'Exchange',
                type: 'dropdown',
                component: <DropDown
                    options={defaultHeaderDropdownOptions['exchange']}
                    value={exchange}
                    onChange={e => this.onChange(e, 'exchange')}
                    name='brokerHeader'
                    rightAlign={true}
                />
            },
            {
                label: 'securityType',
                type: 'dropdown',
                component: <DropDown
                    options={securityTypes}
                    value={securityType}
                    onChange={e => this.onChange(e, 'securityType')}
                    name='brokerHeader'
                    rightAlign={true}
                />
            },
            {
                label: 'frequency',
                type: 'dropdown',
                component: <DropDown
                    options={defaultHeaderDropdownOptions['frequency']}
                    onChange={e => this.onChange(e, 'Frequency')}
                    name='brokerHeader'
                    rightAlign={true}
                    value={frequency}
                />
            },
            {
                label: 'start',
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
                label: 'end',
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

    refreshData = async eventName => {
        try {
            const listEmptyData = this.getData().map(obj => {
                const newObj = { ...obj }
                if (newObj) {
                    for (let key in newObj) {
                        if (key && (key !== 'symbol' && key !== 'id' && key !== 'key' && key !== 'index')) {
                            newObj[key] = '--'
                        }
                    }
                }
                return newObj
            })
            this.setData && this.setData(listEmptyData)
            this.getStockDetail(this.state)
            this.refreshDataSymbol()
            // const result = await this.getStockDetail(this.state)
            // if (result && result.length && this.setData) {
            //     this.setData(this.filterTrading(result))
            // }
        } catch (error) {
            logger.error(`Error while refreshing data: ${error}`)
        }
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
            } else if (type === 'securityType') {
                Object.assign(state, {
                    securityType: val,
                    symbolObj: []
                })
                this.props.getSymbolObj({});
            } else {
                Object.assign(state, { [type]: val })
            }
            this.setState(state, async () => {
                this.getStockDetail(this.state)
                // const result = await this.getStockDetail(this.state)
                // if (result && result.length) {
                //     this.setData(this.filterTrading(result))
                // } else {
                //     this.setData([])
                // }
            })
        } catch (error) {
            logger.log(`Error while changing header option: ${error}`)
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
        }, async () => {
            this.getStockDetail(this.state)
            // const result = await this.getStockDetail(this.state)
            // if (result && result.length) {
            //     this.setData(this.filterTrading(result))
            // } else {
            //     this.setData([])
            // }
        })
    }
    getFilterOnSearch = (filter, sort) => {
        // console.log(sort)
        if (sort.length) {
            this.setState({ sortField: sort[0].colId, sortType: sort[0].sort.toUpperCase() },
                () => {
                    this.getStockDetail(this.state)
                })
        } else this.setState({ sortField: null, sortType: null }, () => this.getStockDetail(this.state))
    }
    filterTrading = (result) => {
        let listTrading = []
        for (let i = 0; i < result.length; i++) {
            if (this.tradeTypesMapping[result[i].trade_type]) {
                listTrading.push(result[i])
            }
        }
        return listTrading || []
    }
    changeConnection = isConnected => {
        if (isConnected === true) {
            this.getStockDetail(this.state)
        }
    }

    dataReceivedFromBrokerHeader = symbolObj => {
        let securityType = '--';
        this.props.getSymbolObj(symbolObj);
        if (Object.keys(symbolObj).length === 0) securityType = 'Total';
        this.setState({ symbolObj, securityType }, () => {
            this.getStockDetail(this.state)
            // const result = await this.getStockDetail(this.state)
            // result && result.length && this.setData && this.setData(this.filterTrading(result))
        })
    }

    render() {
        const { symbolObj, brokers, securityTypes, fromDate, toDate } = this.state
        return (
            <div className='qe-widget brk-stk'>
                <BrokerHeader
                    {...this.props}
                    refreshData={this.refreshData}
                    symbolObj={symbolObj}
                    items={this.createHeaderOptions(brokers, securityTypes, fromDate, toDate)}
                    dataReceivedFromBrokerHeader={this.dataReceivedFromBrokerHeader}
                />
                <SymbolPrice
                    {...this.props}
                    symbolObj={this.state.symbolObj}
                    refresh={(fn) => {
                        this.refreshDataSymbol = fn
                    }}
                />
                <Grid
                    {...this.props}
                    fn={fn => {
                        this.setData = fn.setData
                        this.getData = fn.getData
                        this.getAllDisplayedColumns = fn.getAllDisplayedColumns
                    }}
                    name={'brokerStockDetail'}
                    autoHeight={true}
                    needFitFullScreen={true}
                    getFilterOnSearch={this.getFilterOnSearch}
                    fnKey={data => uuidv4()}
                    opt={opt => this.opt = opt}
                    columns={this.columns}
                    rowHeight={32}
                    getCsvFunction2={this.getCsvFunction2}
                />
            </div>
        )
    }

    componentDidMount() {
        try {
            this.emitID = this.subscription && this.subscription.addListener(eventEmitterRefresh.CLICK_TO_REFRESH_STATE, this.refreshData)
            this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection)
            this.opt && this.opt.api && this.opt.api.sizeColumnsToFit && this.opt.api.sizeColumnsToFit()
            // const [brokers, securityTypes, tradeTypes] = await Promise.all([getBrokerOptions(), getSecurityTypeOptions(), getTradeTypeOptions()])
            // const [brokers, securityTypes, tradeTypes] = [this.props.brokers, this.props.securityTypes, this.props.tradeTypes]
            // const { securityType, symbol, brokerID } = this.initialState
            const stateObj = {
                securityType: this.state.securityType || securityTypes[0].value,
                brokerID: this.state.brokerID || brokers[0].value
            }
            this.setDicTradeTypes(this.props.tradeTypes)
            this.setState(stateObj, () => {
                this.getStockDetail(this.state)
                // const result = await this.getStockDetail(this.state)
                // result && result.length && this.setData && this.setData(this.filterTrading(result))
            })
        } catch (error) {
            logger.log(`Error in componentDidMount of BrokerStockDetail: ${error}`)
        }
    }

    setDicTradeTypes = (tradeTypes) => {
        if (tradeTypes.length) {
            tradeTypes.map(tradeTypeObj => {
                let key = tradeTypeObj.value
                if (key === 'Total') {
                    key = 'TOTAL'
                }
                this.tradeTypesMapping[key] = tradeTypeObj.label
            })
        }
    }

    componentWillUnmount() {
        this.emitID && this.emitID.remove()
        this.emitConnectionID && this.emitConnectionID.remove()
    }
}

export default BrokerStockDetail
