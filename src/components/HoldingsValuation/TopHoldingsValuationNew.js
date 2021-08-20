import React from 'react';
import Highchart from '../ChartDetail/Highchart';
import Grid from '../Inc/CanvasGrid/CanvasGrid';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';
import { roundFloat, formatNumberVolume, formatNumberValue, formatNumberPrice, renderFlagImg } from '../../helper/functionUtils';
import { translate, Trans } from 'react-i18next';
import logger from '../../helper/log';
import { setTimeout } from 'timers';
import MoreOption from '../Inc/MoreOption/MoreOption';
import Flag from '../Inc/Flag/Flag';
import Lang from '../Inc/Lang/Lang';
import IconProduct from '../Inc/IconProduct/IconProduct'

const FIELD = {
    CODE: 'code',
    COMPANY_NAME: 'company_name',
    QUANTITY: 'quantity',
    PRICE: 'price',
    VALUE_CONVERT: 'value_convert',
    VALUE: 'value'
}

class TopHoldingsValuation extends React.Component {
    constructor(props) {
        super(props);
        this.isMount = false
        this.chartData = null;
        this.state = {
            options: {},
            isLoading: props.isLoading,
            data: [{ symbol: 'BHP', company_name: 'BHP BLT FPO', trade_price: 28.83, quantity: 100, value: 250.02 }],
            timeShow: props.timeShow,
            widthClass: ''
        };
        this.width = this.props.width;
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
            if (!this.isMount) return
            width >= 640 ? this.setState({ widthClass: 'width50' }, cb)
                : this.setState({ widthClass: 'width100' }, cb)
        } catch (error) {
            logger.error('changeWidthChart On TopHoldingsValuation' + error)
        }
    }

    getColumns() {
        return [
            {
                header: 'lang_code',
                name: FIELD.CODE,
                type: TYPE.SYMBOL
            },
            {
                header: 'lang_security',
                name: FIELD.COMPANY_NAME,
                formater: (params) => {
                    if (params.data) return (params.data.company_name || params.data.company || params.data.security_name || '--').toUpperCase();
                    else return '--'
                }
            },
            {
                header: 'lang_quantity',
                name: FIELD.QUANTITY
            },
            {
                header: 'lang_price',
                name: FIELD.PRICE,
                formater: (params) => {
                    if (params.value || params.value === 0) return formatNumberPrice(params.value, true)
                    else return '--'
                }
            },
            {
                headerFixed: 'VALUE (' + this.props.currency + ')',
                name: FIELD.VALUE_CONVERT
            },
            {
                header: 'lang_value',
                name: FIELD.VALUE
            }
        ]
    }

    componentWillReceiveProps(nextProps, total) {
        try {
            const { t } = this.props
            this.isMount && this.setState({
                width: document.getElementById('rootReportsTab') ? document.getElementById('rootReportsTab').offsetWidth : 0
            })

            if (!nextProps.data) return;
            const dataResponse = JSON.parse(JSON.stringify(nextProps.data));
            this.isMount && this.setState({
                isLoading: nextProps.isLoading,
                timeShow: nextProps.timeShow
            });
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

    setTotalRow = (total) => {
        this.setBottomRow({
            code: 'TOTAL (' + this.props.currency + ')',
            company_name: ' ',
            quantity: ' ',
            price: ' ',
            value_convert: total || this.props.total,
            value: ' '
        })
    }

    getDataToGrid(data, total) {
        try {
            this.isMount && this.setState({
                data
            }, () => {
                this.setData && this.setData(data);
                this.setTotalRow(total)
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
            this.isMount && this.setState({
                options: chartOptions
            })
        } catch (error) {
            logger.error('optionConstructor On TopHoldingsValuation' + error)
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

    createagSideButtons = () => {
        return [
            {
                value: 'ExportCSV',
                label: 'lang_export_csv',
                callback: () => this.exportCsv()
            },
            {
                value: 'ResetFilter',
                label: 'lang_reset_filter',
                callback: () => this.resetFilter()
            },
            {
                value: 'Resize',
                label: 'lang_resize',
                callback: () => this.autoSize()
            },
            {
                value: 'Columns',
                label: 'lang_columns',
                callback: (boundOption) => this.showColumnMenu(boundOption, true)
            },
            {
                value: 'Filters',
                label: 'lang_filters',
                callback: (boundOption) => this.showFilterMenu(boundOption, true)
            }
        ]
    }

    render() {
        try {
            return (
                <div className={`topHoldRoot ${this.state.widthClass} newNoScroll`}>
                    {
                        this.width < 640 ? this.renderPieChart() : null
                    }
                    <div className={`${this.state.data.length ? '' : 'width100'}`}>
                        <div className={`header-wrap isMoreOption chartTitle`} style={{ paddingBottom: 0 }}>
                            <div className='navbar'>
                                <span className='showTitle'><Lang>lang_holdings_valuation_at</Lang> {this.state.timeShow}</span>
                            </div>
                            <MoreOption agSideButtons={this.createagSideButtons()} />
                        </div>
                        <div className={`${this.state.widthClass}`}>
                            <Grid
                                {...this.props}
                                fn={fn => {
                                    this.addOrUpdate = fn.addOrUpdate
                                    this.setData = fn.setData
                                    this.setColumn = fn.setColumn
                                    this.getData = fn.getData
                                    this.setBottomRow = fn.setBottomRow
                                    this.exportCsv = fn.exportCsv
                                    this.autoSize = fn.autoSize
                                    this.resetFilter = fn.resetFilter
                                    this.setQuickFilter = fn.setQuickFilter
                                    this.showColumnMenu = fn.showColumnMenu
                                    this.showFilterMenu = fn.showFilterMenu
                                    this.remove = fn.remove
                                }}
                                columns={this.getColumns()}
                                fnKey={data => {
                                    return data.code;
                                }}
                            />
                        </div>
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

    componentWillUnmount() {
        this.isMount = false
    }

    componentDidMount() {
        try {
            this.isMount = true
            const data = this.props.data;
            this.getDataToGrid(data);
        } catch (error) {
            logger.error('componentDidMount On TopHoldingsValuation' + error)
        }
    }
}

export default translate('translations')(TopHoldingsValuation);
