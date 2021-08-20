import Lang from '../../components/Inc/Lang/Lang'
import durationeEnum from '../duration_enum'
import orderType from '../order_type';

/*
** Mapping order type
*/

const ORDER_TYPE_FUTURE = [
    { label: 'lang_limit', value: orderType.LIMIT },
    { label: 'lang_market', value: orderType.MARKET },
    { label: 'lang_stop_limit', value: orderType.STOP_LIMIT },
    { label: 'lang_stop_loss', value: orderType.STOPLOSS }
]
const ORDER_TYPE_US = [
    { label: 'lang_limit', value: orderType.LIMIT },
    { label: 'lang_market', value: orderType.MARKET }
]
const ORDER_TYPE_AU = [
    { label: 'lang_limit', value: orderType.LIMIT },
    { label: 'lang_market_to_limit', value: orderType.MARKETTOLIMIT }
]
const ORDER_TYPE_SSX = [
    { label: 'lang_limit', value: orderType.LIMIT },
    { label: 'lang_market', value: orderType.MARKET }
]
const ORDER_TYPE_CONTINGENT = [
    { label: 'lang_stop_limit', value: orderType.STOP_LIMIT }
]
const ORDER_TYPE_MAPPING = {
    equity: ORDER_TYPE_AU,
    option: ORDER_TYPE_AU,
    etf: ORDER_TYPE_AU,
    mf: ORDER_TYPE_AU,
    warrant: ORDER_TYPE_AU,
    NSX: ORDER_TYPE_AU,
    SSX: ORDER_TYPE_SSX,
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
    { label: durationeEnum['FOK'], value: 'FOK', className: 'text-normal' },
    { label: durationeEnum['IOC'], value: 'IOC', className: 'text-normal' }
]
const GTC_DAY_GTD_IOC = [
    { label: durationeEnum['GTC'], value: 'GTC' },
    { label: durationeEnum['DAY'], value: 'DAY' },
    { label: durationeEnum['GTD'], value: 'GTD' },
    { label: durationeEnum['IOC'], value: 'IOC', className: 'text-normal' }
]

const GTC_DAY_GTD_FOK = [
    { label: durationeEnum['GTC'], value: 'GTC' },
    { label: durationeEnum['DAY'], value: 'DAY' },
    { label: durationeEnum['GTD'], value: 'GTD' },
    { label: durationeEnum['IOC'], value: 'FOK', className: 'text-normal' }
]

const DAY_GTC = [
    { label: durationeEnum['DAY'], value: 'DAY' },
    { label: durationeEnum['GTC'], value: 'GTC' }
]
const DURATION_MAPPING = {
    [`equity|${orderType.LIMIT}`]: FULL_DURATION,
    [`equity|${orderType.MARKETTOLIMIT}`]: FULL_DURATION,
    [`equity|${orderType.STOP_LIMIT}`]: GTC_DAY_GTD_IOC,
    [`option|${orderType.LIMIT}`]: FULL_DURATION,
    [`option|${orderType.MARKETTOLIMIT}`]: FULL_DURATION,
    [`etf|${orderType.LIMIT}`]: FULL_DURATION,
    [`mf|${orderType.LIMIT}`]: FULL_DURATION,
    [`etf|${orderType.MARKETTOLIMIT}`]: FULL_DURATION,
    [`mf|${orderType.MARKETTOLIMIT}`]: FULL_DURATION,
    [`warrant|${orderType.LIMIT}`]: FULL_DURATION,
    [`warrant|${orderType.MARKETTOLIMIT}`]: FULL_DURATION,
    [`NSX|${orderType.LIMIT}`]: GTC_DAY_GTD_IOC,
    [`NSX|${orderType.MARKETTOLIMIT}`]: FULL_DURATION,
    [`SSX|${orderType.LIMIT}`]: GTC_DAY_GTD_IOC,
    [`SSX|${orderType.MARKETTOLIMIT}`]: FULL_DURATION,
    [`SSX|${orderType.MARKET}`]: FULL_DURATION,
    [`future`]: GTC_DAY_GTD_FOK,
    [`us`]: DAY_GTC
}

/*
** Mapping exchange
*/
const FULL_EXCHANGE = [
    { label: 'BESTMKT', value: 'N:BESTMKT' },
    { label: 'ASX', value: 'ASX:ASX' },
    { label: 'ASXCP', value: 'ASX:ASXCP' },
    { label: 'CXA', value: 'N:CXA' },
    { label: 'CXACP', value: 'CXA:CXACP' },
    { label: 'qCXA', value: 'N:qCXA' },
    { label: 'NSX', value: 'N:NSX' },
    { label: 'SSX', value: 'SSX:SSX' }
]
const BEST_ASX = [
    { label: 'BESTMKT', value: 'N:BESTMKT' },
    { label: 'ASX', value: 'ASX:ASX' }
]

const BEST_ASX_CXA = [
    { label: 'BESTMKT', value: 'N:BESTMKT' },
    { label: 'ASX', value: 'ASX:ASX' },
    { label: 'CXA', value: 'N:CXA' }
]
const BEST_ASX_CXACP = [
    { label: 'BESTMKT', value: 'N:BESTMKT' },
    { label: 'ASX', value: 'ASX:ASX' },
    { label: 'CXACP', value: 'CXA:CXACP' }
]
const BEST_ASX_CXA_CXACP_QCXA = [
    { label: 'BESTMKT', value: 'N:BESTMKT' },
    { label: 'ASX', value: 'ASX:ASX' },
    { label: 'CXA', value: 'N:CXA' },
    { label: 'CXACP', value: 'CXA:CXACP' },
    { label: 'qCXA', value: 'N:qCXA' }
]
const ASX_ONLY = [{ label: 'ASX', value: 'ASX:ASX' }]
const SSX_ONLY = [{ label: 'SSX', value: 'SSX:SSX' }]
const AXW_ONLY = [{ label: 'AXW', value: 'AXW:ASX' }]
const NSX_ONLY = [{ label: 'NSX', value: 'NSX:NSX' }]
const FIXED_CO_EXCHANGE = [{ label: 'FIXED CO', value: 'N:FIXED CO' }]
const EXCHANGE_MAPPING = {
    // Symbol Australia Equity - Limit
    [`equity|${orderType.LIMIT}|GTC`]: BEST_ASX_CXACP,
    [`equity|${orderType.LIMIT}|DAY`]: BEST_ASX_CXA_CXACP_QCXA,
    [`equity|${orderType.LIMIT}|GTD`]: BEST_ASX_CXACP,
    [`equity|${orderType.LIMIT}|FOK`]: BEST_ASX_CXA_CXACP_QCXA,
    [`equity|${orderType.LIMIT}|IOC`]: BEST_ASX_CXA_CXACP_QCXA,
    // Symbol Australia Equity - Market To Limit
    [`equity|${orderType.MARKETTOLIMIT}|GTC`]: BEST_ASX,
    [`equity|${orderType.MARKETTOLIMIT}|DAY`]: BEST_ASX,
    [`equity|${orderType.MARKETTOLIMIT}|GTD`]: BEST_ASX,
    [`equity|${orderType.MARKETTOLIMIT}|FOK`]: BEST_ASX,
    [`equity|${orderType.MARKETTOLIMIT}|IOC`]: BEST_ASX,
    // Symbol Australia Equity - Stop Loss
    [`equity|${orderType.STOP_LIMIT}|GTC`]: [],
    [`equity|${orderType.STOP_LIMIT}|DAY`]: [],
    [`equity|${orderType.STOP_LIMIT}|GTD`]: [],
    [`equity|${orderType.STOP_LIMIT}|IOC`]: [],
    // Symbol Company Option - Limit
    [`option|${orderType.LIMIT}|GTC`]: ASX_ONLY,
    [`option|${orderType.LIMIT}|DAY`]: ASX_ONLY,
    [`option|${orderType.LIMIT}|GTD`]: ASX_ONLY,
    [`option|${orderType.LIMIT}|FOK`]: ASX_ONLY,
    [`option|${orderType.LIMIT}|IOC`]: ASX_ONLY,
    // Symbol Company Option - Market To Limit
    [`option|${orderType.MARKETTOLIMIT}|GTC`]: ASX_ONLY,
    [`option|${orderType.MARKETTOLIMIT}|DAY`]: ASX_ONLY,
    [`option|${orderType.MARKETTOLIMIT}|GTD`]: ASX_ONLY,
    [`option|${orderType.MARKETTOLIMIT}|FOK`]: ASX_ONLY,
    [`option|${orderType.MARKETTOLIMIT}|IOC`]: ASX_ONLY,
    // Symbol ETF - Limit
    [`etf|${orderType.LIMIT}|GTC`]: [],
    [`etf|${orderType.LIMIT}|DAY`]: AXW_ONLY,
    [`etf|${orderType.LIMIT}|GTD`]: [],
    [`etf|${orderType.LIMIT}|FOK`]: [],
    [`etf|${orderType.LIMIT}|IOC`]: [],
    // Symbol ETF - Market To Limit
    [`etf|${orderType.MARKETTOLIMIT}|GTC`]: [],
    [`etf|${orderType.MARKETTOLIMIT}|DAY`]: [],
    [`etf|${orderType.MARKETTOLIMIT}|GTD`]: [],
    [`etf|${orderType.MARKETTOLIMIT}|FOK`]: [],
    [`etf|${orderType.MARKETTOLIMIT}|IOC`]: [],
    // Symbol MF - Limit
    [`mf|${orderType.LIMIT}|GTC`]: [],
    [`mf|${orderType.LIMIT}|DAY`]: [AXW_ONLY],
    [`mf|${orderType.LIMIT}|GTD`]: [],
    [`mf|${orderType.LIMIT}|FOK`]: [],
    [`mf|${orderType.LIMIT}|IOC`]: [],
    // Symbol MF - Market To Limit
    [`mf|${orderType.MARKETTOLIMIT}|GTC`]: [],
    [`mf|${orderType.MARKETTOLIMIT}|DAY`]: [],
    [`mf|${orderType.MARKETTOLIMIT}|GTD`]: [],
    [`mf|${orderType.MARKETTOLIMIT}|FOK`]: [],
    [`mf|${orderType.MARKETTOLIMIT}|IOC`]: [],
    // Symbol Warrant - Limit
    [`warrant|${orderType.LIMIT}|GTC`]: AXW_ONLY,
    [`warrant|${orderType.LIMIT}|DAY`]: [],
    [`warrant|${orderType.LIMIT}|GTD`]: [],
    [`warrant|${orderType.LIMIT}|FOK`]: [],
    [`warrant|${orderType.LIMIT}|IOC`]: [],
    // Symbol Warrant - Market To Limit
    [`warrant|${orderType.MARKETTOLIMIT}|GTC`]: AXW_ONLY,
    [`warrant|${orderType.MARKETTOLIMIT}|DAY`]: [],
    [`warrant|${orderType.MARKETTOLIMIT}|GTD`]: [],
    [`warrant|${orderType.MARKETTOLIMIT}|FOK`]: [],
    [`warrant|${orderType.MARKETTOLIMIT}|IOC`]: [],
    // Symbol NSX - Limit NSX
    [`NSX|${orderType.LIMIT}|GTC`]: [],
    [`NSX|${orderType.LIMIT}|DAY`]: [],
    [`NSX|${orderType.LIMIT}|GTD`]: [],
    [`NSX|${orderType.LIMIT}|IOC`]: [],
    // Symbol NSX - Market To Limit NSX
    [`NSX|${orderType.MARKETTOLIMIT}|GTC`]: [],
    [`NSX|${orderType.MARKETTOLIMIT}|DAY`]: [],
    [`NSX|${orderType.MARKETTOLIMIT}|GTD`]: [],
    [`NSX|${orderType.MARKETTOLIMIT}|FOK`]: [],
    [`NSX|${orderType.MARKETTOLIMIT}|IOC`]: [],
    // Symbol SSX - Limit SSX
    [`SSX|${orderType.LIMIT}|GTC`]: SSX_ONLY,
    [`SSX|${orderType.LIMIT}|DAY`]: SSX_ONLY,
    [`SSX|${orderType.LIMIT}|GTD`]: SSX_ONLY,
    [`SSX|${orderType.LIMIT}|IOC`]: SSX_ONLY,
    // Symbol SSX - Market To Limit SSX
    [`SSX|${orderType.MARKETTOLIMIT}|GTC`]: SSX_ONLY,
    [`SSX|${orderType.MARKETTOLIMIT}|DAY`]: SSX_ONLY,
    [`SSX|${orderType.MARKETTOLIMIT}|GTD`]: SSX_ONLY,
    [`SSX|${orderType.MARKETTOLIMIT}|FOK`]: SSX_ONLY,
    [`SSX|${orderType.MARKETTOLIMIT}|IOC`]: SSX_ONLY,
    // Symbol SSX - Market SSX
    [`SSX|${orderType.MARKET}|GTC`]: SSX_ONLY,
    [`SSX|${orderType.MARKET}|DAY`]: SSX_ONLY,
    [`SSX|${orderType.MARKET}|GTD`]: SSX_ONLY,
    [`SSX|${orderType.MARKET}|FOK`]: SSX_ONLY,
    [`SSX|${orderType.MARKET}|IOC`]: SSX_ONLY,
    contingent: FIXED_CO_EXCHANGE
}

export default {
    ORDER_TYPE_MAPPING,
    DURATION_MAPPING,
    EXCHANGE_MAPPING
}
