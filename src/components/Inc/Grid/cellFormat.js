import { formatNumberNew2, formatNumberWithText, isAUSymbol } from '../../../helper/functionUtils';
import moment from 'moment/moment';
import orderTypeShow from '../../../constants/order_type_show';
import exchangeShow from '../../../constants/exchange_enum_show';
import orderState from '../../../constants/order_state';
import exchangeTradingMarketEnum from '../../../constants/exchange_trading_market_enum';
import config from '../../../config';
import Lang from '../Lang'

function getTradingMarketString(tradingMarket) {
    try {
        const newTradingMarket = (tradingMarket + '').replace('[Demo]', '');
        if (newTradingMarket === 'ASX:TM') {
            return 'ASX TradeMatch Market';
        }
        if (newTradingMarket === 'ASX:CP') {
            return 'ASX Centre Point';
        }
        return newTradingMarket;
    } catch (error) {
        logger.error('getTradingMarketString On OrderList ', error)
    }
}
export default function cellFormat(props, field) {
    if (props.api.dicCol) {
        const column = props.api.dicCol[field] || 'est_total_aud';
        try {
            if (column) {
                if (props.data[field] === '--') return props.data[field];
                if (column.typeCustom === 'number') {
                    if (!props.data[field] || props.data[field] === '--') return '--';
                    return formatNumberNew2(props.data[field], column.decimal, true);
                } else if (column.field === 'change_percent') {
                    const num = formatNumberNew2(props.data[field], 2, true);
                    return num === '--' ? num : num + '%';
                } else if (column.field === 'change_point') {
                    let num = formatNumberNew2(props.data[field], 3, true);
                    if (props.data[field] > 0) num = '+' + num;
                    return num;
                } else if (column.field === 'volume' || props.data[field] === '--') {
                    if (!props.data[field]) return '--';
                    return formatNumberWithText(props.data[field], 1);
                } else if (column.field === 'init_time') {
                    const initTime = props.data.init_time;
                    return moment(initTime).format('DD MMM YY HH:mm:ss');
                } else if (column.field === 'fees') {
                    const data = props.data;
                    let totalFees = (data.estimated_brokerage || 0) + (data.estimated_tax || 0)
                    totalFees = totalFees === 0 ? '--' : totalFees
                    return formatNumberNew2(totalFees, 2, true);
                } else if (column.field === 'limitPrice') {
                    let limitPrice = ''
                    if (!props.data.limitPrice || props.data.limitPrice === 0) {
                        limitPrice = '--'
                    } else if (orderTypeShow[props.data['orderType']] === orderTypeShow.MARKETTOLIMIT_ORDER) {
                        limitPrice = '--'
                    } else {
                        limitPrice = formatNumberNew2(props.data.limitPrice, 3, true)
                    }
                    return limitPrice;
                } else if (column.field === 'stopPrice') {
                    let stopPrice = ''
                    if (!props.data.stopPrice) {
                        stopPrice = '--'
                    }
                    if ((orderTypeShow[props.data['orderType']] === orderTypeShow.MARKETTOLIMIT_ORDER) || (orderTypeShow[props.data['orderType']] === orderTypeShow.LIMIT_ORDER)) {
                        stopPrice = '--'
                    } else {
                        stopPrice = formatNumberNew2(props.data.stopPrice, 3, true)
                    }
                    return stopPrice;
                } else if (column.field === 'orderType') {
                    switch (props.data.orderType) {
                        case 'LIMIT_ORDER':
                            return <Lang>lang_limit</Lang>
                        case 'MARKETTOLIMIT_ORDER':
                            return <Lang>lang_market_to_limit</Lang>
                        case 'MARKET_ORDER':
                            return <Lang>lang_market</Lang>
                        case 'STOP_ORDER':
                            if (props.data.limitPrice) {
                                return <Lang>lang_limit</Lang>
                            } else {
                                return <Lang>lang_market</Lang>
                            }
                    }
                } else if (column.field === 'exchange') {
                    let resultExchange = '--'
                    let tradingMarket = props.data.trading_market;
                    if (tradingMarket) {
                        tradingMarket = tradingMarket.replace('[Demo]', '')
                    }
                    if (tradingMarket === 'SAXO_BANK') {
                        resultExchange = props.data.display_exchange
                    } else {
                        // resultExchange = getTradingMarketString(tradingMarket)
                        resultExchange = exchangeTradingMarketEnum[tradingMarket] ? exchangeTradingMarketEnum[tradingMarket].display : '--'
                    }
                    return resultExchange;

                    // const exchangeReturn = exchangeShow[props.data[field]];
                    // return exchangeReturn ? exchangeReturn : props.data[field];
                } else if (column.field === 'condition_name') {
                    const conditionName = props.data[field] || '--';
                    if (conditionName === 'StopLoss') {
                        return 'STOP LOSS'
                    }
                    if (conditionName === 'TrailingStopLoss') {
                        return 'TRAILING_STOP_LIMIT'
                    }
                    return conditionName;
                } else if (column.field === 'orderId') {
                    if (props.data && props.data.orderId) {
                        return props.data.orderId.length > 20 ? '--' : props.data.orderId;
                    }
                    return '--';
                } else if (column === 'est_total_aud') {
                    if (props.data.order_status === orderState.CANCELLED ||
                        props.data.order_status === orderState.EXPIRED ||
                        props.data.order_status === orderState.REJECTED ||
                        props.data.order_status === orderState.UNKNOWN
                    ) {
                        return '--'
                    } else {
                        const orderAction = props.data.order_action
                        if (orderAction) {
                            return formatNumberNew2(JSON.parse(orderAction).total, 3, true)
                        } else {
                            return '--'
                        }
                    }
                } else if (column.field === 'est_fees_aud') {
                    if (props.data.order_status === orderState.CANCELLED ||
                        props.data.order_status === orderState.EXPIRED ||
                        props.data.order_status === orderState.REJECTED ||
                        props.data.order_status === orderState.UNKNOWN
                    ) {
                        return '--'
                    } else {
                        const orderAction = props.data.order_action
                        if (orderAction) {
                            return formatNumberNew2(JSON.parse(orderAction).estimated_fees, 3, true)
                        } else {
                            return '--'
                        }
                    }
                }
            }
        } catch (ex) {
            //
        }
    }
    return props.data[field];
}
