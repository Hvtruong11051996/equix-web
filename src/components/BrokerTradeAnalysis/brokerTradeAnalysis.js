import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { translate } from 'react-i18next';
import BrokerHeader from '../Inc/BrokerHeader';
import Flag from '../Inc/Flag';
import NoTag from '../Inc/NoTag';
import Grid from '../Inc/Grid';
import { func } from '../../storage';
import { defaultHeaderDropdownOptions } from '../../constants/broker_data';
import { emitter, emitterRefresh, eventEmitter, eventEmitterRefresh } from '../../constants/emitter_enum';
import Highcharts from '../ChartDetail/Highchart';
import {
    formatNumberPrice,
    formatNumberValue,
    formatNumberVolume,
    checkRole,
    fixTheme,
    getCsvFileBroker
} from '../../helper/functionUtils';
import { getData, getUrlBrokerData, makeSymbolUrl, getUrlAllBrokerName, getUrlAllTradeType, getBrokerCsvFileUrl } from '../../helper/request';

import uuidv4 from 'uuid/v4';
import IconProduct from '../Inc/IconProduct/IconProduct';
import DatePicker, { getStartTime, getEndTime, convertTimeToGMTString, getResetMaxDate } from '../Inc/DatePicker';
import moment, { lang } from 'moment';
import ExampleCustomInput from '../Inc/ExampleCustomInput';
import DropDown from '../DropDown/DropDown';
import Lang from '../Inc/Lang';
import dataStorage from '../../dataStorage';
import logger from '../../helper/log';
const PAGE_SIZE = 50;
const PAGINATION_DEFAULT = {
    current_page: 1,
    total_count: 0,
    total_pages: 0,
    page_size: PAGE_SIZE
}
class brokerTradeAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.dicSymbol = {};
        this.page_id = 1;
        this.checkBrokerTabState = this.props.brokerTabState && Object.keys(this.props.brokerTabState).length !== 0 && this.props.brokerTabState.brokerID !== '00';
        this.state = {
            datePicker: (this.checkBrokerTabState && this.props.brokerTabState.datePicker) ? moment(this.props.brokerTabState.datePicker) : moment(moment().tz(dataStorage.timeZone)).subtract(3, 'days'),
            broker_id: this.checkBrokerTabState ? this.props.brokerTabState.brokerID : '1136',
            brokerOption: []
        }
        this.subscription = func.getStore(emitterRefresh.CLICK_TO_REFRESH);
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION)
        this.id = uuidv4();
        this.categoriChart = [];
        this.seriesChart = [];
        this.codeGroup = true;
        this.chartName = 'OpenMarkets';
        props.resize((w, h) => {
            let chartWidth = w / 3 + 20;
            let chartHeight = h - 70;
            this.chartOption(this.categoriChart, this.seriesChart, chartWidth, chartHeight);
        })
        this.ExchangeOpition = [
            {
                label: <Lang>lang_asx_trade_match</Lang>,
                value: 'AXS:TM'
            }
        ]
        this.columns = [
            {
                headerName: 'Code',
                field: 'security_code',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                width: 110,
                customTooltip: 'CODE',
                cellRenderer: (params) => {
                    if (params.node.group) {
                        if (params.colDef.headerName === 'Group' || params.node.level > 0) {
                            const divRoot = document.createElement('div');
                            const divSymbol = document.createElement('div');
                            const divSymbolName = document.createElement('div');
                            const flag = document.createElement('div');
                            flag.className = 'divFlag';
                            divSymbolName.innerHTML = (params.node.allLeafChildren[0].data.display_name || params.node.allLeafChildren[0].data.security_code || params.node.allLeafChildren[0].data.symbol || '--').toUpperCase();
                            divRoot.appendChild(divSymbol);
                            divRoot.appendChild(flag);
                            divSymbol.appendChild(divSymbolName);
                            divSymbol.style.flex = '1';
                            ReactDOM.render(
                                <Flag symbolObj={params.node.allLeafChildren[0].data} />
                                , flag);
                            divRoot.className = 'symbolWlRoot';
                            divRoot.style.display = 'flex';
                            divRoot.style.justifyContent = 'center';
                            divSymbolName.className = 'symbol-name';
                            divRoot.title = params.node.allLeafChildren[0].data.security_code;
                            return divRoot;
                        } else {
                            return null
                        }
                    } else {
                        const divRoot = document.createElement('div');
                        const divSymbol = document.createElement('div');
                        const divSymbolName = document.createElement('div');
                        const flag = document.createElement('div');
                        flag.className = 'divFlag';
                        divSymbolName.innerHTML = (params.data.display_name || params.data.security_code || params.symbol || '--').toUpperCase();
                        divRoot.appendChild(divSymbol);
                        divRoot.appendChild(flag);
                        divSymbol.appendChild(divSymbolName);
                        divSymbol.style.flex = '1';
                        ReactDOM.render(
                            <Flag symbolObj={params.data} />
                            , flag);
                        divRoot.className = 'symbolWlRoot';
                        divRoot.style.display = 'flex';
                        divRoot.style.justifyContent = 'center';
                        divSymbolName.className = 'symbol-name';
                        divRoot.title = params.data.security_code;
                        return divRoot;
                    }
                }
            },
            {
                headerName: 'lang_trade_time',
                field: 'trade_time',
                enableRowGroup: false,
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                customTooltip: 'TRADE TIME'
            },
            {
                headerName: 'lang_time_grouping',
                field: 'time_grouping',
                customTooltip: 'TIME GROUPING',
                sortable: false
            },
            {
                headerName: 'lang_trade_price',
                field: 'trade_price',
                enableRowGroup: false,
                customTooltip: 'TRADE PRICE',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                aggFunc: 'sum',
                cellRenderer: (params) => {
                    if (!params.node.group) {
                        let div = document.createElement('div');
                        div.classList.add('text-right');
                        div.innerHTML = formatNumberPrice(params.data.trade_price, true) || '--';
                        return div
                    } else {
                        let div = document.createElement('div');
                        div.classList.add('text-right');
                        let num = params.node && params.node.aggData && params.node.aggData.trade_price;
                        div.innerHTML = formatNumberPrice(num || 0, true) || '--';
                        return div
                    }
                }
            },
            {
                headerName: 'lang_trade_volume',
                field: 'trade_volume',
                headerIsNumber: true,
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                customTooltip: 'TRADE VOLUME',
                enableRowGroup: false,
                aggFunc: 'sum',
                cellRenderer: (params) => {
                    if (!params.node.group) {
                        let div = document.createElement('div');
                        div.classList.add('text-right');
                        div.innerHTML = formatNumberVolume(params.data.trade_volume || 0, true) || '--';
                        return div
                    } else {
                        let div = document.createElement('div');
                        div.classList.add('text-right');
                        let num = params.node && params.node.aggData && params.node.aggData.trade_volume
                        div.innerHTML = formatNumberVolume(num || 0, true) || '--';
                        return div
                    }
                }
            },
            {
                headerName: 'lang_trade_value_money_symbol',
                field: 'trade_value',
                headerIsNumber: true,
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                enableRowGroup: false,
                customTooltip: 'TRADE VALUE',
                aggFunc: 'sum',
                cellRenderer: (params) => {
                    if (!params.node.group) {
                        let div = document.createElement('div');
                        div.classList.add('text-right');
                        div.innerHTML = formatNumberValue(params.data.trade_value || 0, true) || '--';
                        return div
                    } else {
                        let div = document.createElement('div');
                        div.classList.add('text-right');
                        let num = params.node && params.node.aggData && params.node.aggData.trade_value;
                        div.innerHTML = formatNumberValue(num || 0, true) || '--';
                        return div
                    }
                }
            },
            {
                headerName: 'lang_buy_broker_name',
                field: 'buyer_name',
                customTooltip: 'BROKER NAME OF BUYING BROKER',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                sortable: false,
                enableRowGroup: false,
                cellRenderer: (params) => {
                    if (!params.node.group) {
                        let str = this.dicBrokerName[params.data.buyer_id] ? this.dicBrokerName[params.data.buyer_id] : '--';
                        return str;
                    }
                }

            },
            {
                headerName: 'lang_buy_xref',
                field: 'buy_x_ref',
                customTooltip: 'BUY XREF',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                sortable: false,
                enableRowGroup: false,
                cellRenderer: (params) => {
                    if (!params.node.group) {
                        let str = params.data.buy_x_ref ? params.data.buy_x_ref : '--';
                        return str;
                    }
                }
            },
            {
                headerName: 'lang_sell_broker_name',
                field: 'seller_name',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                sortable: false,
                customTooltip: 'BROKER NAME OF SELLING BROKER',
                cellRenderer: (params) => {
                    if (!params.node.group) {
                        let str = this.dicBrokerName[params.data.seller_id] ? this.dicBrokerName[params.data.seller_id] : '--';
                        return str;
                    }
                },
                enableRowGroup: false
            },
            {
                headerName: 'lang_sell_xref',
                field: 'sell_x_ref',
                customTooltip: 'SELL XREF',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                sortable: false,
                cellRenderer: (params) => {
                    if (!params.node.group) {
                        let str = params.data.sell_x_ref ? params.data.sell_x_ref : '--';
                        return str;
                    }
                },
                enableRowGroup: false
            },
            {
                headerName: 'lang_condition_codes',
                field: 'trade_type',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                sortable: false,
                customTooltip: 'TRADE TYPE CONDOTION CODES',
                headerIsNumber: true,
                cellRenderer: (params) => {
                    if (!params.node.group) {
                        let div = document.createElement('div');
                        div.classList.add('text-right');
                        let str = (!params.data.trade_type || params.data.trade_type === 'UNKNOW') ? '--' : (this.dicTradeType && this.dicTradeType[params.data.trade_type]);
                        div.innerText = str;
                        return div;
                    }
                },
                enableRowGroup: false
            }
        ]
    }

    headerOptions = () => {
        return [
            {
                label: 'lang_broker',
                type: 'dropdown',
                component: <DropDown onChange={this.handleBrokerDdChange} options={this.state.brokerOption} value={this.state.broker_id} enablePDI={true} />
            },
            {
                label: 'lang_exchange',
                type: 'dropdown',
                component: <DropDown options={defaultHeaderDropdownOptions['exchange']} value={'ASX:TM'} />
            },
            {
                label: 'lang_time',
                type: 'datePicker',
                component: <DatePicker
                    selected={this.state.datePicker || moment().subtract(3, 'days')}
                    maxDate={moment().subtract(3, 'days')}
                    customInput={<ExampleCustomInput type='from' />}
                    onChange={this.handleTimeHeaderChange.bind(this)}
                    dayToAdd={-3}
                />
            }
        ]
    }
    pageChanged(pageId) {
        if (this.page_id === pageId) return;
        this.page_id = pageId;
        this.getGridData();
    }
    handleBrokerDdChange = (e) => {
        this.setState({
            broker_id: e
        }, () => {
            // this.props.brokerTabState.brokerID = this.state.broker_id;
            // const brokerTabState = this.props.brokerTabState;
            this.props.handleSaveLayout({
                brokerID: this.state.broker_id,
                symbolObj: {},
                nameBroker: 4
            });
            this.page_id = 1
            this.getGridData();
            this.itemWidth = this.brkHeader.querySelector('.slider-inner').scrollWidth;
        })
    }
    handleTimeHeaderChange(e) {
        this.setState({
            datePicker: e
        }, () => {
            this.props.handleSaveLayout({
                datePicker: this.state.datePicker,
                symbolObj: {},
                nameBroker: 4
            });
            this.page_id = 1
            this.getGridData();
        })
    }
    getBrokerDd(brokers) {
        const brokerID = this.state.broker_id;
        try {
            // const url = getUrlAllBrokerName();
            // return getData(url)
            //     .then((result) => {
            //         let data = result.data.data || result.data;
            let data = brokers
            if (data) {
                let brokerOption = [];
                data.sort((a, b) => {
                    return a.broker_name > b.broker_name ? 1 : -1;
                })
                data.forEach((item, i) => {
                    if (item.broker_id !== '00') {
                        brokerOption.push({ label: item.broker_name, value: item.broker_id })
                    }
                })
                this.setState({
                    brokerOption: brokerOption,
                    broker_id: brokerID || '1136'
                }, () => {
                    const brokerState = {
                        brokerID: this.state.broker_id,
                        datePicker: this.state.datePicker,
                        symbolObj: {},
                        nameBroker: 4
                    }
                    this.props.handleSaveLayout(brokerState);
                })
            }
            // })
        } catch (error) {
            logger.error(error)
        }
    }
    getFilterOnSearch = (filter, sort) => {
        // console.log(sort)
        if (sort.length) {
            console.log(sort[0].sort, '----', sort[0].colId)
            this.setState({ sortField: sort[0].colId, sortType: sort[0].sort.toUpperCase() },
                () => {
                    this.getGridData(this.state)
                })
        } else this.setState({ sortField: null, sortType: null }, () => this.getGridData(this.state))
    }
    getCodeGroupData(data) {
        let groupObj = {};
        data.forEach((value, index) => {
            if (value.display_name) {
                if (groupObj[value.display_name]) {
                    groupObj[value.display_name] += value.trade_value;
                } else {
                    groupObj[value.display_name] = value.trade_value;
                }
            } else {
                if (groupObj[value.security_code]) {
                    groupObj[value.security_code] += value.trade_value;
                } else {
                    groupObj[value.security_code] = value.trade_value;
                }
            }
        });
        return groupObj;
    }
    getTimeGroupData(data) {
        let groupObj = {};
        data.forEach((value, index) => {
            if (groupObj[value.time_grouping]) {
                groupObj[value.time_grouping] += value.trade_value;
            } else {
                groupObj[value.time_grouping] = value.trade_value;
            }
        });
        return groupObj;
    }
    changeConnection = (isConnected) => {
        if (!isConnected !== !this.state.isConnected) {
            this.setState({ isConnected }, () => {
                isConnected && this.getGridData();
            })
        }
    }
    getGridData = async () => {
        let datePicker = moment(this.state.datePicker).format('DD/MM/YYYY');
        let brokerId = this.state.broker_id;
        this.chartName = this.dicBrokerName[brokerId];
        let sortField = this.state.sortField || null;
        let sortType = this.state.sortType || null;
        try {
            this.props.loading(true);

            if (!this.dicTradeType) {
                const tradeTypeUrl = getUrlAllTradeType();
                await getData(tradeTypeUrl).then(res => {
                    if (res.data && res.data.data && res.data.data.length) {
                        this.dicTradeType = {};
                        res.data.data.map(item => {
                            this.dicTradeType[item.condition_code] = item.trade_type;
                        })
                    }
                });
            }
            const id = uuidv4();
            this.requestId = id;
            let url = getUrlBrokerData(`/broker-trade-analysis?broker_id=${brokerId}&trade_date=${datePicker}&page_id=${this.page_id}&page_size=50&exchange=ASX:TM`);
            if (sortField) url += `&sort=${sortField}&sort_type=${sortType}`
            await getData(url)
                .then(async (result) => {
                    if (this.requestId !== id) return;
                    this.props.loading(false);
                    let data = result.data.data
                    this.data = data;
                    let categoriChart = [];
                    let seriesChart = [];
                    if (data && data.length > 0) {
                        const obj = {};
                        obj.current_page = +result.data.current_page || 1;
                        obj.total_count = +result.data.total_count || 1;
                        obj.total_pages = +result.data.total_page || 1;
                        obj.page_size = PAGE_SIZE;
                        this.setPage(obj);
                        let symbolArr = [...new Set(data.map(x => encodeURIComponent(x.security_code)))].filter(v => !dataStorage.symbolsObjDic[v]);
                        if (symbolArr.length) {
                            let strSymbol = makeSymbolUrl(symbolArr.join(','))
                            await getData(strSymbol).then((res) => {
                                res.data.forEach((v) => {
                                    dataStorage.symbolsObjDic[v.symbol] = v;
                                })
                            });
                        }
                        data.forEach((v) => {
                            v.country = (dataStorage.symbolsObjDic[v.security_code] && dataStorage.symbolsObjDic[v.security_code].country) || '';
                            v.display_name = (dataStorage.symbolsObjDic[v.security_code] && dataStorage.symbolsObjDic[v.security_code].display_name) || '';
                        })
                        this.setDataChart(data)
                        this.setData(data);
                    } else {
                        this.setPage(PAGINATION_DEFAULT);
                        this.chartOption(categoriChart, seriesChart)
                        this.setData([]);
                    }
                }).catch((err) => {
                    if (this.requestId !== id) return;
                    this.props.loading(false);
                    this.setPage(PAGINATION_DEFAULT);
                    this.setDataChart([])
                    this.setData([])
                    console.error(err)
                })
        } catch (error) {
            logger.error(error)
            this.props.loading(false);
            this.setPage(PAGINATION_DEFAULT);
            this.setData([])
        }
    }
    changeTheme = () => {
        this.setDataChart(this.data)
    }
    getCsvFunction2 = (gridDom) => {
        if (this.csvWoking) return
        this.csvWoking = true
        let columnHeaderGrid = this.getAllDisplayedColumns()
        let brokerId = this.state.broker_id;
        let datePicker = moment(this.state.datePicker).format('DD/MM/YYYY');
        let sortType = this.state.sortType || null
        let sortField = this.state.sortField || null
        let body = {
            'query': {
                'broker_id': brokerId,
                'trade_date': datePicker,
                'exchange': 'ASX:TM'
            }
        }
        const columnHeader = {
            'broker_report': columnHeaderGrid
        }
        if (sortField) {
            body.query.sort = sortField
            body.query.sort_type = sortType || 'desc'
        }
        getCsvFileBroker({
            url: getBrokerCsvFileUrl('broker-trade-analysis'),
            body_req: body,
            columnHeader: columnHeader,
            lang: dataStorage.lang,
            gridDom: gridDom,
            glContainer: this.props.glContainer,
            fileName: 'Broker_Trade_Analysis'
        }, () => {
            this.csvWoking = false;
        });
    }
    async getBrokerName() {
        const url = getUrlAllBrokerName();
        const obj = {};
        await getData(url)
            .then((result) => {
                let data = result.data.data || result.data;
                data.forEach((v, i) => {
                    obj[v.broker_id] = v.broker_name;
                });
                return obj;
            })
        return obj;
    }
    async componentDidMount() {
        this.dicBrokerName = await this.getBrokerName();
        let broker = this.props.brokers;
        this.getBrokerDd(broker)
        //     .then(() => {
        //     this.itemWidth = this.brkHeader.querySelector('.slider-inner').scrollWidth;
        // });
        this.getGridData().then(() => {
            this.opt && this.opt.columnApi && this.opt.columnApi.setRowGroupColumns(['security_code']);
        }).catch((err) => {
            console.log(err)
        });
        if (!dataStorage.callBackReloadTheme[this.id]) {
            dataStorage.callBackReloadTheme[this.id] = this.changeTheme
        }
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
        this.emitID = this.subscription && this.subscription.addListener(eventEmitterRefresh.CLICK_TO_REFRESH_STATE, this.refreshData.bind(this));
    }

    refreshData = () => {
        this.setDataChart();
        this.setData([]);
        this.getGridData();
    }

    chartOption = (categoriChart, seriesChart, width = this.chartDiv.offsetWidth, height = this.chartDiv.offsetHeight) => {
        this.categoriChart = categoriChart;
        this.seriesChart = seriesChart;
        let chartOption = {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent',
                plotBackgroundColor: null,
                plotBorderWidth: 0,
                plotShadow: false,
                spacingTop: 45,
                width: (width < 180 ? 180 : width),
                height: height
            },
            title: {
                text: `<span class='showTitle next'>${this.chartName}</span> <div class='hidden'>[${this.state.broker_id}] ${this.chartName}</div>`,
                style: {
                    color: fixTheme(dataStorage.theme, 'textColor'),
                    fontSize: '15px'
                },
                margin: 8,
                useHTML: true
            },
            xAxis: {
                categories: categoriChart,
                gridLineWidth: 0,
                title: {
                    text: null
                },
                labels: {
                    style: {
                        color: fixTheme(dataStorage.theme, 'textColor')
                    }
                }
            },
            yAxis: {
                min: 0,
                gridLineWidth: 0,
                title: {
                    text: ''
                },
                labels: {
                    style: {
                        color: fixTheme(dataStorage.theme, 'textColor')
                    }
                }
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: false
                    },
                    color: '#25a196',
                    borderWidth: 0
                }
            },
            tooltip: {
                backgroundColor: fixTheme(dataStorage.theme, 'background'),
                borderColor: fixTheme(dataStorage.theme, 'border'),
                borderWidth: 0,
                borderRadius: 0,
                style: {
                    color: fixTheme(dataStorage.theme, 'color')
                }
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'Trade value',
                data: seriesChart
            }]
        }
        this.setState({
            chartOption: chartOption
        })
    }
    setDataChart(data) {
        let categoriChart = [];
        let seriesChart = [];
        if (data && data.length > 0) {
            let groupObj = this.codeGroup ? this.getCodeGroupData(data) : this.getTimeGroupData(data);
            Object.keys(groupObj).sort((a, b) => {
                return groupObj[b] - groupObj[a]
            }).map((v) => {
                categoriChart.push(v);
                seriesChart.push(Number(groupObj[v].valueOf()))
            });
        }
        this.chartOption(categoriChart, seriesChart)
    }
    columnRowGroupChanged(params) {
        let data = this.data;
        let categoriChart = [];
        let seriesChart = [];
        if (data) {
            if (params.columns.length > 0) {
                let colId = params.columns[0].colId;
                if (colId === 'security_code') {
                    this.codeGroup = true;
                } else {
                    this.codeGroup = false;
                }
                this.setDataChart(data)
            } else {
                this.opt.columnApi.autoSizeColumn('security_code');
                this.codeGroup = true;
                this.setDataChart(data)
            }
        }
    }
    render() {
        return (
            <div className='qe-widget brkTrade'>
                <div className='brk-stk' ref={dom => this.brkHeader = dom}>
                    <BrokerHeader {...this.props} hiddenSearchBox={true} items={this.headerOptions()} itemWidth={this.itemWidth} disableRefreshBtn={true} />
                </div>
                <div style={{ flex: '1', overflow: 'auto' }}>
                    <div className='gridAnalysis'>
                        <Grid
                            {...this.props}
                            opt={(opt) => {
                                this.opt = opt;
                            }}
                            paginate={{
                                setPage: cb => {
                                    this.setPage = cb
                                },
                                pageChanged: this.pageChanged.bind(this)
                            }}
                            fn={fn => {
                                this.addOrUpdate = fn.addOrUpdate;
                                this.remove = fn.remove;
                                this.setData = fn.setData;
                                this.getData = fn.getData;
                                this.setColumn = fn.setColumn;
                                this.refreshView = fn.refreshView;
                                this.getAllDisplayedColumns = fn.getAllDisplayedColumns
                            }}
                            disableGroupUseEntireRow={true}
                            name={'brokerTradeAnalysis'}
                            columns={this.columns}
                            onlyOneRow={true}
                            loadingCallback={this.props.loadingCallback}
                            rowHeight={48}
                            needShowAllColumns={true}
                            getFilterOnSearch={this.getFilterOnSearch}
                            nameWidget={'BrokerTradeAnalysis'}
                            columnRowGroupChanged={this.columnRowGroupChanged.bind(this)}
                            multiExpand={true}
                            getCsvFunction2={this.getCsvFunction2.bind(this)}
                            isBroker={true}
                        />
                    </div>
                    <div className='chartAnalysis' ref={dom => dom ? this.chartDiv = dom : null}>{this.state.chartOption ? <Highcharts option={this.state.chartOption} /> : null}</div>
                </div>
            </div>
        );
    }
}

export default translate('translations')(brokerTradeAnalysis);
