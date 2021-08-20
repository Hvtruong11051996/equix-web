import React from 'react';
import Highchart from '../ChartDetail/Highchart';
import Grid from '../Inc/Grid';
import { roundFloat, formatNumberVolume, formatNumberValue, formatNumberPrice, renderFlagImg } from '../../helper/functionUtils';
import { translate, Trans } from 'react-i18next';
import logger from '../../helper/log';
import { setTimeout } from 'timers';
import Flag from '../Inc/Flag';
import Lang from '../Inc/Lang';
import IconProduct from '../Inc/IconProduct/IconProduct'

class TopHoldingsValuation extends React.Component {
    constructor(props) {
        super(props);
        this.chartData = null;
        this.state = {
            options: {},
            isLoading: props.isLoading,
            data: [{ symbol: 'BHP', company_name: 'BHP BLT FPO', trade_price: 28.83, quantity: 100, value: 250.02 }],
            timeShow: props.timeShow,
            widthClass: ''
        };
        this.width = this.props.width;
        this.createData = this.createData.bind(this)
        props.resize((w, h) => {
            this.width = w
            this.changeWidthChart(w, () => {
                const newData = JSON.parse(JSON.stringify(this.chartData));
                const height = this.state.data.length * 48 + 64;
                if (this.myInputPie) {
                    this.optionConstructor({ widthChart: this.myInputPie.offsetWidth, heightChart: height }, newData)
                }
            })
        })
    }

    changeWidthChart(width, cb) {
        try {
            width >= 640 ? this.setState({ widthClass: 'width50' }, cb)
                : this.setState({ widthClass: 'width100' }, cb)
        } catch (error) {
            logger.error('changeWidthChart On TopHoldingsValuation' + error)
        }
    }

    getColumns() {
        return [
            {
                headerName: 'CODE',
                field: 'code',
                filter: 'agTextColumnFilter',
                // width: 80,
                cellRenderer: (params) => {
                    // if (params.data.code === 'TotalValue') return null
                    const div = document.createElement('div');
                    const divCode = document.createElement('div');
                    const iconProductContainer = document.createElement('div')
                    divCode.innerHTML = params.data.code;
                    divCode.classList.add('divCode');
                    const divFlag = document.createElement('div');
                    if (params.data.display_exchange) {
                        const exchange = params.data.symbol.split('.')[1] ? params.data.symbol.split('.')[1] : params.data.display_exchange
                        ReactDOM.render(<Flag symbolObj={{ exchange }} />, divFlag);
                    }
                    const divWrap = document.createElement('div');
                    divWrap.className = 'flagCustom';
                    iconProductContainer.classList.add('centerize-vertical')
                    iconProductContainer.classList.add('calibrate-icon-product')
                    iconProductContainer.style.marginRight = '5px'
                    ReactDOM.render(<IconProduct symbolObj={params.data} />, iconProductContainer)
                    divWrap.appendChild(iconProductContainer);
                    divWrap.appendChild(divFlag);
                    div.appendChild(divCode);
                    div.appendChild(divWrap);
                    div.className = 'doubleReport';
                    const title = `${params.data.code || params.data.symbol} (${(params.data.class || '').toUpperCase()})`
                    div.title = title
                    return div;
                }
            },
            {
                headerName: 'SECURITY',
                field: 'company_name',
                filter: 'agTextColumnFilter',
                width: 192,
                pinnedRowCellRenderer: (params) => {
                    return ''
                },
                cellRenderer: (params) => {
                    // if (params.data.company_name === 'TotalValue') return null
                    const div = document.createElement('div');
                    const divName = document.createElement('div');
                    divName.innerHTML = params.data.company_name || params.data.code || '';
                    div.appendChild(divName);
                    divName.className = 'companies_NameCustom';
                    return div;
                }
            },
            {
                headerName: 'QUANTITY',
                field: 'quantity',
                filter: 'agNumberColumnFilter',
                width: 64,
                pinnedRowCellRenderer: (params) => {
                    return ''
                },
                cellRenderer: (params) => {
                    // if (params.data.quantity === 'TotalValue') return null
                    const div = document.createElement('div');
                    div.innerHTML = formatNumberVolume(params.data.quantity);
                    return div;
                }
            },
            {
                headerName: 'PRICE',
                field: 'price',
                filter: 'agNumberColumnFilter',
                width: 64,
                pinnedRowCellRenderer: (params) => {
                    return ''
                },
                cellRenderer: (params) => {
                    // if (params.data.price === 'TotalValue') return null
                    if (!params.data.price) return '--'
                    const div = document.createElement('div');
                    div.innerHTML = formatNumberPrice(params.data.price, true);
                    if (!params.data.price) {
                        div.innerHTML = formatNumberPrice(0, true);
                    }
                    return div;
                }
            },
            {
                headerName: 'VALUE (' + this.props.currency + ')',
                field: 'value_convert',
                filter: 'agNumberColumnFilter',
                width: 74,
                cellRenderer: (params) => {
                    // if (params.data.code === 'TOTAL (AUD)') {
                    //     const div = document.createElement('div');
                    //     div.innerHTML = formatNumberValue(params.data.value_convert, true);
                    //     return div;
                    // } else {
                    const div = document.createElement('div');
                    div.innerHTML = formatNumberValue(params.data.value_convert, true);
                    return div;
                    // }
                }
            },
            {
                headerName: 'VALUE',
                field: 'value',
                filter: 'agNumberColumnFilter',
                width: 74,
                pinnedRowCellRenderer: (params) => {
                    return ''
                },
                cellRenderer: (params) => {
                    if (params.data.code === 'TOTAL (AUD)') return null
                    if (params.data.value === 'TotalValue') return null
                    const div = document.createElement('div');
                    div.innerHTML = formatNumberValue(params.data.value, true);
                    return div;
                }
            }
        ]
    }

    componentWillReceiveProps(nextProps, total) {
        try {
            const { t } = this.props
            this.setState({
                width: document.getElementById('rootReportsTab') ? document.getElementById('rootReportsTab').offsetWidth : 0
            })

            if (!nextProps.data) return;
            const dataResponse = JSON.parse(JSON.stringify(nextProps.data));
            this.setState({
                isLoading: nextProps.isLoading,
                timeShow: nextProps.timeShow
            });
            // dataResponse.push({
            //     code: t('TOTAL_AUD'),
            //     company_name: 'TotalValue',
            //     quantity: 'TotalValue',
            //     price: 'TotalValue',
            //     value_convert: nextProps.total,
            //     height: 32
            // })
            this.getDataToGrid(dataResponse, nextProps.total)
            this.chartData = JSON.parse(JSON.stringify(dataResponse));
            this.changeWidthChart(this.width, () => {
                const newData = JSON.parse(JSON.stringify(this.chartData));
                let height = this.state.data.length * 48 + 64;
                height = height > 300 ? 300 : height < 150 ? 150 : height;
                if (this.myInputPie) {
                    this.optionConstructor({ widthChart: this.myInputPie.offsetWidth, heightChart: height }, newData)
                }
            })
        } catch (error) {
            logger.error('componentWillReceiveProps On TopHoldingsValuation' + error)
        }
    }

    getDataToGrid(data, total) {
        try {
            this.setState({
                data
            }, () => {
                this.setData && this.setData(data);
                this.createData(total)
                setTimeout(() => {
                    this.chartData = JSON.parse(JSON.stringify(this.props.data));
                    this.changeWidthChart(this.width, () => {
                        const newData = JSON.parse(JSON.stringify(this.chartData));
                        let height = this.state.data.length * 48 + 64;
                        height = height > 300 ? 300 : height < 150 ? 150 : height;
                        if (this.myInputPie) {
                            this.optionConstructor({ widthChart: this.myInputPie.offsetWidth, heightChart: height }, newData)
                        }
                    })
                })
            })
        } catch (error) {
            logger.error('getDataToGrid On TopHoldingsValuation' + error)
        }
    }

    optionConstructor(dimetionPieChart, propsData) {
        try {
            const { t } = this.props;
            let data = [];
            let otherPer = 0;

            let lstTmp = [];
            if (propsData && propsData.length) {
                for (let i = 0; i < propsData.length; i++) {
                    const percent = roundFloat((propsData[i].percent_holdings || 0) * 100, 2);
                    if (percent !== null && percent !== undefined && !isNaN(percent) && typeof percent === 'number') {
                        if (percent < 5) {
                            otherPer += percent;
                            if (percent > 0) {
                                lstTmp.push({
                                    name: propsData[i].code,
                                    y: percent
                                })
                            }
                        } else {
                            data.push({
                                name: propsData[i].code,
                                y: percent
                            })
                        }
                    }
                }
                if (lstTmp.length > 1) {
                    data.sort(function (a, b) {
                        return b.y - a.y;
                    });
                    if (otherPer) {
                        data.push({
                            name: `${t('lang_others')}`,
                            y: otherPer
                        })
                    }
                } else {
                    data = [...data, ...lstTmp]
                }

                if (data.length > 1) {
                    let sumPercent = 0;
                    for (let k = 0; k < data.length - 1; k++) {
                        sumPercent += data[k].y
                    }
                    data[data.length - 1].y = 100 - sumPercent
                }
            }

            let chartOptions = {
                chart: {
                    backgroundColor: 'transparent',
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie',
                    width: dimetionPieChart.widthChart,
                    height: dimetionPieChart.heightChart - 22
                },
                title: {
                    text: ''
                },
                tooltip: {
                    formatter: function () {
                        return this.key + ' ' + formatNumberValue(this.percentage, true) + '%';
                    },
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    borderWidth: 0,
                    style: {
                        color: '#030405',
                        fontSize: 10,
                        fontWeight: 'normal'
                    },
                    padding: 5
                },
                legend: {
                    enabled: true,
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'top',
                    backgroundColor: 'transparent',
                    itemStyle: {
                        color: '#c5cbce',
                        fontSize: '11px',
                        fontWeight: 500
                    },
                    symbolHeight: 8,
                    symbolWidth: 8,
                    symbolRadius: 4,
                    x: 0,
                    y: 50,
                    itemHoverStyle: {
                        color: '#c5cbce'
                    },
                    labelFormatter: function () {
                        return '<div class="labelFormatter size--2"><div class="codeHolding showTitle">' + this.name + '</div><div class="numHolding showTitle">' + renderFlagImg(this.name, 'report') + formatNumberValue(this.percentage, true) + '%</div></div>';
                    },
                    useHTML: true,
                    itemMarginBottom: 8
                },
                colors: [
                    '#4a90e2', '#DBECF7', '#76ddfb', '#1AA3D1'
                ],
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        colors: ['#dc143c', '#ff69b4', '#ff6347', '#eee8aa', '#ee82ee', '#8a2be2', '#6a5acd', '#32cd32', '#2e8b57', '#808000',
                            '#008080', '#40e0d0', '#b0e0e6', '#000080', '#f5deb3', '#b8860b', '#800000', '#dcdcdc', '#778899', '#6494ed'],
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false,
                            distance: -20,
                            formatter: function () {
                                return formatNumberValue(this.percentage, true) + '%';
                            },
                            style: {
                                fontFamily: 'Roboto',
                                fontSize: 13,
                                fontWeight: 500,
                                fontStyle: 'normal',
                                fontStretch: 'normal',
                                lineHeight: 'normal',
                                letterSpacing: -0.1,
                                textAlign: 'center',
                                color: '#ffffff'
                            }
                        },
                        showInLegend: true,
                        point: {
                            events: {
                                legendItemClick: function (e) {
                                    e.preventDefault()
                                }
                            }
                        }
                    },
                    series: {
                        borderWidth: 0,
                        borderColor: 'transparent'
                    }
                },
                series: [{
                    colorByPoint: true,
                    innerSize: '50%',
                    states: {
                        hover: {
                            enabled: false
                        }
                    },
                    data: data
                }]
            }
            this.setState({
                options: chartOptions
            })
        } catch (error) {
            logger.error('optionConstructor On TopHoldingsValuation' + error)
        }
    }

    createData(total) {
        let result = [];
        if (this.props.total) {
            result.push({
                code: 'TOTAL (' + this.props.currency + ')',
                company_name: '',
                quantity: '',
                price: '',
                value_convert: total || this.props.total,
                value: ''
            });
            setTimeout(() => {
                this.setPinnedBottomRowData && this.setPinnedBottomRowData(result)
            }, 100)
        }
    }

    renderPieChart() {
        try {
            if (this.state.data.length) {
                return (
                    <div>
                        <div className='pieTitle showTitle'>
                            <span><Lang>lang_holdings_valuation_at</Lang> {this.state.timeShow} <span className='text-capitalize'><Lang>lang_chart</Lang></span></span>
                        </div>
                        <div className={`pieChartHoldingStart ${this.state.widthClass}`} ref={input => {
                            this.myInputPie = input;
                        }}>
                            <div className='titleHodingEndStart showTitle size--2'><span><Lang>lang_holdings_valuation_at</Lang> {this.state.timeShow}</span></div>
                            <div>{Object.keys(this.state.options).length !== 0 ? <Highchart option={this.state.options} /> : ''}</div>
                        </div>
                    </div>
                )
            } else {
                return null
            }
        } catch (error) {
            logger.error('renderPieChart On TopHoldingsValuation' + error)
        }
    }

    render() {
        try {
            return (
                <div className={`topHoldRoot ${this.state.widthClass} newNoScroll`}>
                    {
                        this.width < 640 ? this.renderPieChart() : null
                    }
                    <div className={`${this.state.data.length ? '' : 'width100'}`}>
                        <div className={'chartTitle'}>
                            <div>
                                <span className='showTitle'><Lang>lang_holdings_valuation_at</Lang> {this.state.timeShow}</span>
                            </div>
                            <div>
                            </div>
                        </div>
                        {
                            this.state.data.length
                                ? <div className={`${this.state.widthClass}`}>
                                    <Grid
                                        {...this.props}
                                        level={[
                                            140,
                                            80,
                                            80
                                        ]}
                                        getFilterOnSearch={this.getFilterOnSearch}
                                        fn={fn => {
                                            this.setPinnedBottomRowData = fn.setPinnedBottomRowData
                                            this.setData = fn.setData
                                            this.addOrUpdate = fn.addOrUpdate
                                            this.getData = fn.getData
                                            this.setColumn = fn.setColumn
                                        }}
                                        opt={(opt) => this.opt = opt}
                                        columns={this.getColumns()}
                                        fnKey={data => {
                                            return data.code;
                                        }}
                                    />
                                </div>
                                : null
                        }
                    </div>
                    {
                        this.width < 640 ? null : this.renderPieChart()
                    }
                </div>
            )
        } catch (error) {
            logger.error('render On TopHoldingsValuation' + error)
        }
    }
    getFilterOnSearch = (filter, sort) => {
        // if (filter && sort) {
        //     this.filter = filter || []
        //     this.sort = sort || []
        // }
        // const filterAndSort = {
        //     query: this.filter,
        //     sort: this.sort,
        //     filterAll: this.state.textSearch,
        //     date: {
        //         from: this.fromDate,
        //         to: this.toDate,
        //         field: 'updated'
        //     },
        //     symbol: this.state.symbolObj.code || ''
        // }
        // this.filterAndSearch = convertObjFilter(filterAndSort)
        // this.getDataNews(filterAndSort.symbol)
    }
    componentDidMount() {
        try {
            const data = this.props.data;
            data.push({
                code: this.props.t('TOTAL_AUD'),
                company_name: 'TotalValue',
                quantity: 'TotalValue',
                price: 'TotalValue',
                value_convert: this.props.total,
                height: 32
            })
            this.getDataToGrid(data);
        } catch (error) {
            logger.error('componentDidMount On TopHoldingsValuation' + error)
        }
    }
}

export default translate('translations')(TopHoldingsValuation);
