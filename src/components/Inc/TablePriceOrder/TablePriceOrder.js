import React from 'react';
import Icon from '../Icon';
import Lang from '../Lang';
import logger from '../../../helper/log';
import { formatNumberPrice, formatNumberValue, clone } from '../../../helper/functionUtils';
import dataStorage from '../../../dataStorage';
import Color from '../../../constants/color'
import { addPriceListener, removePriceListener } from '../../../helper/priceSource'

const DEFAULT_PRICE_OBJ = {
    trade_price: null,
    change_point: null,
    change_percent: null,
    trade_size: null,
    bid_size: null,
    bid_price: null,
    ask_size: null,
    ask_price: null
}

class TablePriceOrder extends React.Component {
    constructor(props) {
        super(props);
        this.checkClassResult = ''
        this.isChangeSymbol = false
        this.state = {
            data: {},
            isConnected: dataStorage.connected
        }
        this.clearPrice = this.clearPrice.bind(this);
    }

    clearPrice() {
        if (!this.props.symbolObj.symbol) return;
        removePriceListener(this.realtimePrice)
    }

    componentWillReceiveProps(nextProps) {
        try {
            if (!nextProps.symbolObj) return
            else {
                if (Object.keys(nextProps.symbolObj).length) {
                    this.timeout && clearTimeout(this.timeout)
                    if (this.props.symbolObj.symbol && this.props.symbolObj.symbol !== nextProps.symbolObj.symbol) this.isChangeSymbol = true
                    if (!this.props.symbolObj.symbol) {
                        removePriceListener(this.realtimePrice)
                        nextProps.symbolObj.symbol && addPriceListener(nextProps.symbolObj, this.realtimePrice)
                    } else {
                        this.timeout = setTimeout(() => {
                            if (this.isChangeSymbol || !this.props.symbolObj.symbol) {
                                removePriceListener(this.realtimePrice)
                                nextProps.symbolObj.symbol && addPriceListener(nextProps.symbolObj, this.realtimePrice)
                            }
                        }, 200)
                    }
                } else {
                    removePriceListener(this.realtimePrice)
                    let data = clone(this.state.data);
                    for (var key in data) {
                        data[key] = '--';
                    }
                    this.setState({
                        data: data
                    })
                }
            }
        } catch (error) {
            logger.error('componentWillReceiveProps On TablePriceOrder' + error)
        }
    }
    componentDidMount() {
        this.props.symbolObj && this.props.symbolObj.symbol && addPriceListener(this.props.symbolObj, this.realtimePrice)
    }
    componentWillUnmount() {
        removePriceListener(this.realtimePrice)
    }

    realtimePrice = (obj) => {
        if (obj && obj.quote) {
            const data = obj.quote;
            if (!this.props.symbolObj.symbol) return;
            let listData = {};
            if (this.isChangeSymbol) {
                listData = Object.assign(clone(DEFAULT_PRICE_OBJ), data)
                this.isChangeSymbol = false
            } else listData = Object.assign(clone(this.state.data), data);
            this.setState({
                data: listData
            })
        }
    }

    renderPriceNumber(type) {
        try {
            const dataPrice = this.state.data || {};
            let changePercent = '(--%)';
            let changePoint = '--';
            let caseZero = false;
            if (dataPrice && dataPrice.change_percent !== undefined && dataPrice.change_percent !== null && dataPrice.change_percent === 0) {
                changePercent = '(0.00%)';
                caseZero = true;
            } else if (dataPrice && dataPrice.change_percent) {
                changePercent = '(' + formatNumberValue(dataPrice.change_percent, true) + '%)'
            }
            if (dataPrice && dataPrice.change_point !== undefined && dataPrice.change_point !== null && dataPrice.change_point === 0) {
                changePoint = '0.0000'
                caseZero = true;
            } else if (dataPrice && dataPrice.change_point) {
                changePoint = formatNumberPrice(dataPrice.change_point, true)
            }
            if (type === 'tradePrice') {
                return (<span className={`showTitle trade_price_text ${this.priceClass(dataPrice, 'trade_price')}`} >{dataPrice && dataPrice.hasOwnProperty('trade_price') ? formatNumberPrice(dataPrice.trade_price, true) : '--'}&nbsp;</span>)
            }
            if (type === 'changePoint') {
                return (<span className={`showTitle ${caseZero ? 'normalText' : dataPrice && this.changeColor(dataPrice.change_point)}`} > {changePoint}&nbsp;</span>)
            }
            if (type === 'changePercent') {
                return (<span className={`showTitle ${caseZero ? 'normalText' : dataPrice && this.changeColor(dataPrice.change_percent)}`}>{changePercent}</span>)
            }
            if (type === 'quantityLastTrade') {
                return (<span className='normalText showTitle'>{dataPrice.trade_size ? `(${formatNumberPrice(dataPrice.trade_size)})` : '(--)'}</span>)
            }
            if (dataPrice && type === 'IconChange') {
                if (this.changeColor(dataPrice.change_point) === 'priceUp') {
                    return <Icon color={Color.PRICE_UP} hoverColor={Color.PRICE_UP} src='navigation/arrow-drop-up'></Icon>
                }
                if (this.changeColor(dataPrice.change_point) === 'priceDown') {
                    return <Icon color={Color.PRICE_DOWN} hoverColor={Color.PRICE_DOWN} src='navigation/arrow-drop-down'></Icon>
                }
            }
        } catch (error) {
            logger.error('renderPriceNumber On TablePriceOrder ' + error)
        }
    }

    changeColor(value) {
        try {
            const val = value;
            if (!value) return;
            value = formatNumberValue(value, true)
            if (value === 0 && value === '--') {
                return 'normalText'
            } else if (val < 0) {
                return 'priceDown'
            } else if (val > 0) {
                return 'priceUp'
            }
            return 'normalText'
        } catch (error) {
            logger.error('changeColor On TablePriceOrder ' + error)
        }
    }

    renderSubTable() {
        const dataPrice = this.state.data;
        return (
            [<div key='1' className='changeColorHover custome'>
                <div className='showTitle text-capitalize'>
                    <Lang>lang_bid_qty</Lang>
                </div>
                <div className='showTitle text-capitalize'>
                    <Lang>lang_bid_price</Lang>
                </div>
                <div className='showTitle text-capitalize'>
                    <Lang>lang_offer_price</Lang>
                </div>
                <div className='showTitle text-capitalize'>
                    <Lang>lang_offer_qty</Lang>
                </div>
            </div>,
            <div key='2' className='changeColorHover custome'>
                <div className='normalText showTitle'>
                    {dataPrice && dataPrice.bid_size ? formatNumberPrice(dataPrice.bid_size) : '--'}
                </div>
                <div className={`${this.priceClass(dataPrice, 'bid_price') || 'normalText'} showTitle `}>
                    <span className={`showTitle trade_price_text ${this.priceClass(dataPrice, 'bid_price')}`}>{dataPrice && dataPrice.bid_price ? formatNumberPrice(dataPrice.bid_price, true) : '--'}</span>
                </div>
                <div className={`${this.priceClass(dataPrice, 'ask_price') || 'normalText'} showTitle`}>
                    <span className={`showTitle trade_price_text ${this.priceClass(dataPrice, 'ask_price')}`} >{dataPrice && dataPrice.ask_price ? formatNumberPrice(dataPrice.ask_price, true) : '--'}</span>
                </div>
                <div className={'textRight showTitle'}>
                    {dataPrice && dataPrice.ask_size ? formatNumberPrice(dataPrice.ask_size) : '--'}
                </div>
            </div>]
        )
    }
    priceClass(data, key) {
        if (!this.dicOld) this.dicOld = {};
        if (!data[key] || data[key] === '--') {
            return 'normalText';
        }
        if (data[key] === '--') {
            this.dicOld[key + '_class'] = 'normalText';
        } else {
            let old = this.dicOld[key];
            this.dicOld[key] = data[key];
            if (old === undefined || data[key] > old) {
                if (data['trade_size'] === '--') {
                    this.dicOld[key + '_class'] = 'priceUp';
                } else if (this.dicOld[key + '_class'] === 'priceUp flash') this.dicOld[key + '_class'] = 'priceUp flash2';
                else this.dicOld[key + '_class'] = 'priceUp flash';
            } else if (data[key] < old) {
                if (data['trade_size'] === '--') {
                    this.dicOld[key + '_class'] = 'priceDown';
                } else if (this.dicOld[key + '_class'] === 'priceDown flash') this.dicOld[key + '_class'] = 'priceDown flash2';
                else this.dicOld[key + '_class'] = 'priceDown flash';
            }
        }
        let classResult = this.dicOld[key + '_class'] || 'normalText'
        return classResult;
    }

    render() {
        const tradePriceRender = this.renderPriceNumber('tradePrice');
        const changePointRender = this.renderPriceNumber('changePoint');
        const changePrecentRender = this.renderPriceNumber('changePercent');
        const volumeRender = this.renderPriceNumber('quantityLastTrade');
        const iconChange = this.renderPriceNumber('IconChange');
        try {
            return <div className='newOrderPrice size--3'>
                <div className='changeColorHover' >
                    <div className='showTitle text-capitalize'><Lang>lang_last_trade_quantity</Lang></div>
                    <div>{tradePriceRender}{volumeRender}</div>
                </div>
                <div className='changeColorHover' >
                    <div className='showTitle text-capitalize'><Lang>lang_today_change</Lang></div>
                    <div className='centerByFlex'>{iconChange}{changePointRender}{changePrecentRender}</div>
                </div>
                {this.renderSubTable()}
            </div>;
        } catch (error) {
            logger.error('render On TablePriceOrder' + error)
        }
    }
}

export default TablePriceOrder
