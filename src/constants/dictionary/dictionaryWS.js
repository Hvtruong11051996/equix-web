import Lang from '../../components/Inc/Lang/Lang'
import durationeEnum from '../duration_enum'
import orderType from '../order_type';

/*
** Mapping order type
*/
const ORDER_TYPE_FUTURE = [
    { label: <Lang>lang_limit</Lang>, value: orderType.LIMIT },
    { label: <Lang>lang_market</Lang>, value: orderType.MARKET },
    { label: <Lang>lang_stop_limit</Lang>, value: orderType.STOP_LIMIT },
    { label: <Lang>lang_stop_loss</Lang>, value: orderType.STOPLOSS }
]
const ORDER_TYPE_US = [
    { label: <Lang>lang_limit</Lang>, value: orderType.LIMIT },
    { label: <Lang>lang_market</Lang>, value: orderType.MARKET }
]
const ORDER_TYPE_AU = [
    { label: <Lang>=lang_limit</Lang>, value: orderType.LIMIT },
    { label: <Lang>lang_market_to_limit</Lang>, value: orderType.MARKETTOLIMIT }
]
const ORDER_TYPE_CONTINGENT = [
    { label: <Lang>lang_stop_limit</Lang>, value: orderType.STOP_LIMIT }
]
const ORDER_TYPE_MAPPING = {
    equity: ORDER_TYPE_AU,
    option: ORDER_TYPE_AU,
    etf: ORDER_TYPE_AU,
    mf: ORDER_TYPE_AU,
    warrant: ORDER_TYPE_AU,
    NSX: ORDER_TYPE_AU,
    BSX: ORDER_TYPE_AU,
    future: ORDER_TYPE_FUTURE,
    us: ORDER_TYPE_US,
    contingent: ORDER_TYPE_CONTINGENT
}

/*
** Mapping duration
*/
const FULL_DURATION = [
    { label: durationeEnum['GTC'], value: 'GTC' },
    { label: durationeEnum['DAY'], value: 'DAY' },
    { label: durationeEnum['GTD'], value: 'GTD' },
    { label: durationeEnum['FOK'], value: 'FOK' },
    { label: durationeEnum['IOC'], value: 'IOC' }
]
const DAY_ONLY = [{ label: durationeEnum['DAY'], value: 'DAY' }]
const GTC_DAY_GTD_IOC = [
    { label: durationeEnum['GTC'], value: 'GTC' },
    { label: durationeEnum['DAY'], value: 'DAY' },
    { label: durationeEnum['GTD'], value: 'GTD' },
    { label: durationeEnum['IOC'], value: 'IOC' }
]
const GTC_ONLY = [{ label: durationeEnum['GTC'], value: 'GTC' }]
const GTC_DAY_GTD = [
    { label: durationeEnum['GTC'], value: 'GTC' },
    { label: durationeEnum['DAY'], value: 'DAY' },
    { label: durationeEnum['GTD'], value: 'GTD' }
]
const GTC_DAY_GTD_FOK = [
    { label: durationeEnum['GTC'], value: 'GTC' },
    { label: durationeEnum['DAY'], value: 'DAY' },
    { label: durationeEnum['GTD'], value: 'GTD' },
    { label: durationeEnum['IOC'], value: 'FOK' }
]

const DAY_GTC = [
    { label: durationeEnum['DAY'], value: 'DAY' },
    { label: durationeEnum['GTC'], value: 'GTC' }
]
const DURATION_MAPPING = {
    // Symbol Australia Equity
    [`equity|${orderType.LIMIT}`]: FULL_DURATION,
    [`equity|${orderType.MARKETTOLIMIT}`]: FULL_DURATION,
    [`equity|${orderType.STOP_LIMIT}`]: GTC_DAY_GTD_IOC,
    // Symbol Company Option
    [`option|${orderType.LIMIT}`]: FULL_DURATION,
    [`option|${orderType.MARKETTOLIMIT}`]: FULL_DURATION,
    // Symbol ETF and MF
    [`etf|${orderType.LIMIT}`]: DAY_ONLY,
    [`etf|${orderType.MARKETTOLIMIT}`]: DAY_ONLY,
    [`mf|${orderType.LIMIT}`]: DAY_ONLY,
    [`mf|${orderType.MARKETTOLIMIT}`]: DAY_ONLY,
    // Symbol Warrant
    [`warrant${orderType.LIMIT}`]: GTC_ONLY,
    [`warrant${orderType.MARKETTOLIMIT}`]: GTC_ONLY,
    // Symbol NSX
    [`NSX|${orderType.LIMIT}`]: GTC_DAY_GTD,
    [`NSX|${orderType.MARKETTOLIMIT}`]: GTC_DAY_GTD,
    // Symbol NSX - BSX
    [`NSX|${orderType.LIMIT}`]: GTC_DAY_GTD,
    [`NSX|${orderType.MARKETTOLIMIT}`]: GTC_DAY_GTD,
    [`future`]: GTC_DAY_GTD_FOK,
    [`us`]: DAY_GTC
}

/*
** Mapping exchange
*/
const ExchangeEquityLimitGTC = [
    { label: 'BESTMKT', value: 'ASX:BESTMKT' },
    { label: 'ASX', value: 'ASX' }
]
const ExchangeEquityLimitDay = [
    { label: 'BESTMKT', value: 'ASX:BESTMKT' },
    { label: 'ASX', value: 'ASX' },
    { label: 'ASXCP', value: 'ASX:ASXCP' },
    { label: 'CXA', value: 'CXA:CXA' },
    { label: 'qCXA', value: 'CXA:qCXA' }
]
const ExchangeEquityLimitFOK = [
    { label: 'BESTMKT', value: 'ASX:BESTMKT' },
    { label: 'ASX', value: 'ASX' },
    { label: 'ASXCP', value: 'ASX:ASXCP' },
    { label: 'CXA', value: 'CXA:CXA' }
]
const ExchangeEquityLimitGTD = [
    { label: 'BESTMKT', value: 'ASX:BESTMKT' },
    { label: 'ASX', value: 'ASX' }
]
const ExchangeEquityMKTFOK = [
    { label: 'BESTMKT', value: 'ASX:BESTMKT' },
    { label: 'ASX', value: 'ASX' },
    { label: 'CXA', value: 'CXA:CXA' }
]
const FIXED_CO_EXCHANGE = [{ label: 'FIXED CO', value: 'N:FIXED CO' }]
const defaultExchangeCompanyOption = [{ label: 'ASX', value: 'ASX' }]
const defaultExchangeAXW = [{ label: 'AXW', value: 'AXW:ASX' }]
const defaultExchangeNSX = [{ label: 'NSX', value: 'NSX:NSX' }]
const EXCHANGE_MAPPING = {
    // Symbol Australia Equity - Limit
    [`equity|${orderType.LIMIT}|GTC`]: ExchangeEquityLimitGTC,
    [`equity|${orderType.LIMIT}|DAY`]: ExchangeEquityLimitDay,
    [`equity|${orderType.LIMIT}|GTD`]: ExchangeEquityLimitGTD,
    [`equity|${orderType.LIMIT}|FOK`]: ExchangeEquityLimitFOK,
    [`equity|${orderType.LIMIT}|IOC`]: ExchangeEquityLimitDay,
    // Symbol Australia Equity - Market To Limit
    [`equity|${orderType.MARKETTOLIMIT}|GTC`]: ExchangeEquityLimitGTD,
    [`equity|${orderType.MARKETTOLIMIT}|DAY`]: ExchangeEquityMKTFOK,
    [`equity|${orderType.MARKETTOLIMIT}|GTD`]: ExchangeEquityLimitGTD,
    [`equity|${orderType.MARKETTOLIMIT}|FOK`]: ExchangeEquityMKTFOK,
    [`equity|${orderType.MARKETTOLIMIT}|IOC`]: ExchangeEquityMKTFOK,
    // Symbol Australia Equity - Stop Loss
    [`equity|StopLimit|GTC`]: FIXED_CO_EXCHANGE,
    [`equity|StopLimit|DAY`]: FIXED_CO_EXCHANGE,
    [`equity|StopLimit|GTD`]: FIXED_CO_EXCHANGE,
    [`equity|StopLimit|IOC`]: FIXED_CO_EXCHANGE,
    // Symbol Company Option - Limit
    [`option|${orderType.LIMIT}|GTC`]: defaultExchangeCompanyOption,
    [`option|${orderType.LIMIT}|DAY`]: defaultExchangeCompanyOption,
    [`option|${orderType.LIMIT}|GTD`]: defaultExchangeCompanyOption,
    [`option|${orderType.LIMIT}|FOK`]: defaultExchangeCompanyOption,
    [`option|${orderType.LIMIT}|IOC`]: defaultExchangeCompanyOption,
    // Symbol Company Option - Market To Limit
    [`option|${orderType.MARKETTOLIMIT}|GTC`]: defaultExchangeCompanyOption,
    [`option|${orderType.MARKETTOLIMIT}|DAY`]: defaultExchangeCompanyOption,
    [`option|${orderType.MARKETTOLIMIT}|GTD`]: defaultExchangeCompanyOption,
    [`option|${orderType.MARKETTOLIMIT}|FOK`]: defaultExchangeCompanyOption,
    [`option|${orderType.MARKETTOLIMIT}|IOC`]: defaultExchangeCompanyOption,
    // Symbol ETF and MF - Limit
    [`etf|${orderType.LIMIT}|DAY`]: defaultExchangeAXW,
    [`mf|${orderType.LIMIT}|DAY`]: defaultExchangeAXW,
    // Symbol ETF and MF - Market To Limit
    [`etf|${orderType.MARKETTOLIMIT}|DAY`]: defaultExchangeAXW,
    [`mf|${orderType.MARKETTOLIMIT}|DAY`]: defaultExchangeAXW,
    // Symbol Warrant - Limit
    [`warrant|${orderType.LIMIT}|GTC`]: defaultExchangeAXW,
    // Symbol Warrant - Market To Limit
    [`warrant|${orderType.MARKETTOLIMIT}|GTC`]: defaultExchangeAXW,
    // Symbol NSX - Limit NSX
    [`NSX|${orderType.LIMIT}|GTC`]: defaultExchangeNSX,
    [`NSX|${orderType.LIMIT}|DAY`]: defaultExchangeNSX,
    [`NSX|${orderType.LIMIT}|GTD`]: defaultExchangeNSX,
    // Symbol NSX - Market To Limit NSX
    [`NSX|${orderType.MARKETTOLIMIT}|GTC`]: defaultExchangeNSX,
    [`NSX|${orderType.MARKETTOLIMIT}|DAY`]: defaultExchangeNSX,
    [`NSX|${orderType.MARKETTOLIMIT}|GTD`]: defaultExchangeNSX,
    // Symbol NSX - Limit BSX
    [`NSX|${orderType.LIMIT}|GTC`]: defaultExchangeNSX,
    [`NSX|${orderType.LIMIT}|DAY`]: defaultExchangeNSX,
    [`NSX|${orderType.LIMIT}|GTD`]: defaultExchangeNSX,
    // Symbol NSX - Market To Limit BSX
    [`NSX|${orderType.MARKETTOLIMIT}|GTC`]: defaultExchangeNSX,
    [`NSX|${orderType.MARKETTOLIMIT}|DAY`]: defaultExchangeNSX,
    [`NSX|${orderType.MARKETTOLIMIT}|GTD`]: defaultExchangeNSX,
    contingent: FIXED_CO_EXCHANGE
}

export default {
    ORDER_TYPE_MAPPING,
    DURATION_MAPPING,
    EXCHANGE_MAPPING
}
