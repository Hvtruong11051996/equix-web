import React from 'react';
import Icon from '../Inc/Icon';
import Lang from '../Inc/Lang';
import logger from '../../helper/log';
import { formatNumberPrice, formatNumberValue, clone } from '../../helper/functionUtils';
import dataStorage from '../../dataStorage';
import { addPriceListener, removePriceListener } from '../../helper/priceSource'
import Color from '../../constants/color'

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

class TablePriceAlert extends React.Component {
    constructor(props) {
        super(props);
        this.checkClassResult = ''
        this.state = {
            data: {},
            isConnected: dataStorage.connected
        }
    }

    componentWillReceiveProps(nextProps) {
        try {
            if (!nextProps.symbolObj) return
            if (nextProps.symbolObj && this.props.symbolObj && nextProps.symbolObj.symbol !== this.props.symbolObj.symbol) {
                removePriceListener(this.realtimePrice)
                if (nextProps.symbolObj.symbol) addPriceListener(nextProps.symbolObj, this.realtimePrice)
                else this.setState({ data: {} })
            }
        } catch (error) {
            logger.error('componentWillReceiveProps On TablePriceOrder' + error)
        }
    }

    componentWillUnmount() {
        removePriceListener(this.realtimePrice)
    }

    componentDidMount() {
        this.props.symbolObj && this.props.symbolObj.symbol && addPriceListener(this.props.symbolObj, this.realtimePrice)
    }

    realtimePrice = (obj) => {
        if (obj && obj.quote) {
            const dataQuote = obj.quote;
            if (!this.props.symbolObj.symbol) return;
            const data = obj.isClear ? DEFAULT_PRICE_OBJ : this.state.data
            this.setState({
                data: { ...data, ...dataQuote }
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
                changePoint = '0.000'
                caseZero = true;
            } else if (dataPrice && dataPrice.change_point) {
                changePoint = formatNumberPrice(dataPrice.change_point, true)
            }
            if (type === 'tradePrice') {
                return (<span className={`showTitle trade_price_text ${this.priceClass(dataPrice, 'trade_price')}`} style={{ marginRight: '4px' }} >{dataPrice && dataPrice.trade_price ? formatNumberPrice(dataPrice.trade_price, true) : '--'}</span>)
            }
            if (type === 'bidRender') {
                return (<span className={`showTitle trade_price_text ${this.priceClass(dataPrice, 'bid_price')}`} style={{ marginRight: '4px' }} >{dataPrice && dataPrice.bid_price ? formatNumberPrice(dataPrice.bid_price, true) : '--'}</span>)
            }
            if (type === 'askRender') {
                return (<span className={`showTitle trade_price_text ${this.priceClass(dataPrice, 'ask_price')}`} style={{ marginRight: '4px' }} >{dataPrice && dataPrice.ask_price ? formatNumberPrice(dataPrice.ask_price, true) : '--'}</span>)
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
            if (type === 'todayVolumn') {
                return (<span className='normalText showTitle'>{dataPrice.volume ? `${formatNumberPrice(dataPrice.volume)}` : '--'}</span>)
            }
            if (type === 'bidQuantity') {
                return (<span className='normalText showTitle'>{dataPrice.bid_size ? `(${formatNumberPrice(dataPrice.bid_size)})` : '(--)'}</span>)
            }
            if (type === 'askQuantity') {
                return (<span className='normalText showTitle'>{dataPrice.ask_size ? `(${formatNumberPrice(dataPrice.ask_size)})` : '(--)'}</span>)
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
            logger.error('renderPriceNumber On TablePriceAlert ' + error)
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
            logger.error('changeColor On TablePriceAlert ' + error)
        }
    }

    renderSubTable() {
        const dataPrice = this.state.data;
        return (
            [<div key='1' className='changeColorHover custome text-capitalize'>
                <div className='showTitle'>
                    <Lang>lang_open</Lang>
                </div>
                <div className='showTitle'>
                    <Lang>lang_high</Lang>
                </div>
                <div className='showTitle text-center'>
                    <Lang>lang_low</Lang>
                </div>
                <div className='showTitle'>
                    <Lang>lang_prev_close</Lang>
                </div>
                <div className='showTitle'>
                    <Lang>lang_close</Lang>
                </div>
            </div>,
            <div key='2' className='changeColorHover custome'>
                <div className='normalText showTitle'>
                    {(dataPrice && dataPrice.open && formatNumberPrice(dataPrice.open, 4)) || '--'}
                </div>
                <div className='normalText showTitle'>
                    <span className={`showTitle `}>{(dataPrice && dataPrice.high && formatNumberPrice(dataPrice.high, 4)) || '--'}</span>
                </div>
                <div className={`normalText showTitle text-center`}>
                    <span className={`showTitle`} >{(dataPrice && dataPrice.low && formatNumberPrice(dataPrice.low, 4)) || '--'}</span>
                </div>
                <div className={`normalText showTitle`}>
                    <span className={`showTitle`} >{(dataPrice && dataPrice.previous_close && formatNumberPrice(dataPrice.previous_close, 4)) || '--'}</span>
                </div>
                <div className={'normalText textRight showTitle'}>
                    {(dataPrice && dataPrice.close && formatNumberPrice(dataPrice.close, 4)) || '--'}
                </div>
            </div>]
        )
    }
    priceClass(data = {}, key) {
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
        const volumeRender = this.renderPriceNumber('quantityLastTrade');
        const todayVolumn = this.renderPriceNumber('todayVolumn');

        const bidRender = this.renderPriceNumber('bidRender');
        const bidQuanRender = this.renderPriceNumber('bidQuantity');
        const askRender = this.renderPriceNumber('askRender');
        const askQuanRender = this.renderPriceNumber('askQuantity');

        const changePointRender = this.renderPriceNumber('changePoint');
        const changePrecentRender = this.renderPriceNumber('changePercent');
        const iconChange = this.renderPriceNumber('IconChange');
        try {
            return <div className='newOrderPrice size--3'>
                <div className="rowOrderPad changeColorHover">
                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_last_trade_quantity</Lang>}</div>
                    <div className='showTitle size--3 changeColorHover'>{tradePriceRender}{volumeRender}</div>
                </div>
                <div className="rowOrderPad changeColorHover">
                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_today_change_today_change_percent</Lang>}</div>
                    <div className='showTitle normalText size--3 changeColorHover'>{iconChange}{changePointRender}{changePrecentRender}</div>
                </div>
                <div className="rowOrderPad changeColorHover">
                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_bid_quantity</Lang>}</div>
                    <div className='showTitle size--3 changeColorHover'>{bidRender}{bidQuanRender}</div>
                </div>
                <div className="rowOrderPad changeColorHover">
                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_offer_quantity</Lang>}</div>
                    <div className='showTitle size--3 changeColorHover'>{askRender}{askQuanRender}</div>
                </div>
                <div className="rowOrderPad changeColorHover">
                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_today_volume</Lang>}</div>
                    <div className='showTitle size--3 changeColorHover'>{todayVolumn}</div>
                </div>
                {this.renderSubTable()}
            </div>;
        } catch (error) {
            logger.error('render On TablePriceAlert' + error)
        }
    }
}

export default TablePriceAlert
