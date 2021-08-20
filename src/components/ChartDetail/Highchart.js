import React from 'react';
import logger from '../../helper/log';
import { translate } from 'react-i18next';
import Color from '../../constants/color'

var Highcharts = require('highcharts/highstock');
class Highchart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chart: null
        }
    }

    componentWillReceiveProps(nextProps) {
        try {
            if (nextProps.idSeries) {
                var series = this.chart.get(nextProps.idSeries);
                if (series.visible) {
                    series.hide();
                } else {
                    series.show();
                }
            }
            if (JSON.stringify(nextProps.option) === JSON.stringify(this.props.option)) return;
            this.setState({
                chart: new Highcharts[this.props.type || 'Chart'](
                    this.chartEl,
                    nextProps.option
                    , (chartObj) => {
                        if (this.props.title === 'Summary_Information') {
                            let width = this.chartEl.parentNode.clientWidth - 245;
                            if (chartObj.series.length > 1) {
                                $.each(chartObj.series[1] && chartObj.series[1].data, function(i, point1) {
                                    if (point1 && point1.dataLabel) {
                                        point1.dataLabel.attr({ x: width });
                                        point1.dataLabel.attr({ y: point1.dataLabel.y - 12 });
                                        let x = (point1 || { x: 0 }).x;
                                        let second = (point1 || { y: 0 }).y;
                                        let first = chartObj.series[0].data[x].y;
                                        let result = (second - first).toFixed(2);
                                        if (result > 0) {
                                            point1.dataLabel.css({ color: Color.BUY });
                                        } else if (result < 0) {
                                            point1.dataLabel.css({ color: Color.SELL });
                                        } else {
                                            point1.dataLabel.css({ color: '#c5cbce' });
                                        }
                                    }
                                })
                            }
                        }
                        if (this.props.title === 'portPer') {
                            if (chartObj.series.length > 1) {
                                $.each(chartObj.series[0], function(i, point1) {
                                    if (point1 && point1.dataLabel) {
                                        let x = (point1 || { x: 0 }).x;
                                        let second = (point1 || { y: 0 }).y;
                                        let first = chartObj.series[0].data[x].y;
                                        let result = (second - first).toFixed(2);
                                    }
                                })
                            }
                        }
                    }
                )
            })
        } catch (error) {
            logger.error('componentWillReceiveProps On Highchart', error)
        }
    }

    componentWillUnmount() {
        try {
            if (this.state.chart) {
                this.state.chart.destroy();
            }
        } catch (error) {
            logger.error('componentWillUnmount On Highchart', error)
        }
    }

    render() {
        try {
            return (
                <div className={this.props.chartFor} ref={el => this.chartEl = el} />
            )
        } catch (error) {
            logger.error('render On Highchart', error)
        }
    }

    componentDidMount() {
        try {
            this.chart = new Highcharts[this.props.type || 'Chart'](
                this.chartEl,
                this.props.option
                , (chartObj) => {
                    if (this.props.title === 'Summary_Information') {
                        let width = this.chartEl.parentNode.clientWidth - 245;

                        $.each(chartObj.series[1] && chartObj.series[1].data, function(i, point1) {
                            if (point1 && point1.dataLabel) {
                                point1.dataLabel.attr({ x: width });
                                point1.dataLabel.attr({ y: point1.dataLabel.y - 12 });
                                let x = point1.x;
                                let second = point1.y;
                                let first = chartObj.series[0].data[x].y;
                                let result = (second - first).toFixed(2);
                                if (result > 0) {
                                    point1.dataLabel.css({ color: Color.BUY });
                                } else if (result < 0) {
                                    point1.dataLabel.css({ color: Color.SELL });
                                } else {
                                    point1.dataLabel.css({ color: '#c5cbce' });
                                }
                            }
                        })
                    }
                    if (this.props.title === 'portPer') {
                        let width = 245;

                        $.each(chartObj.series[0], function(i, point1) {
                            if (point1 && point1.dataLabel) {
                                point1.dataLabel.attr({ x: width });
                                point1.dataLabel.attr({ y: point1.dataLabel.y - 12 });
                                let x = point1.x;
                                let second = point1.y;
                                let first = chartObj.series[0].data[x].y;
                                let result = (second - first).toFixed(2);
                                if (result > 0) {
                                    point1.dataLabel.css({ color: Color.BUY });
                                } else if (result < 0) {
                                    point1.dataLabel.css({ color: Color.SELL });
                                } else {
                                    point1.dataLabel.css({ color: '#c5cbce' });
                                }
                            }
                        })
                    }
                }
            )
        } catch (error) {
            logger.error('componentDidMount On Highchart', error)
        }
    }
}
export default translate('translations')(Highchart);
