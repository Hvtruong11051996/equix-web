import historyProvider from './historyProvider'
import dataStorage from '../../../dataStorage'
import moment from 'moment'
import stream from './stream'
import SymbolClass from '../../../constants/symbol_class'
import { getData, makeMarketUrl } from '../../../helper/request'
import { updateChartExchangeDisplay } from '../../../helper/functionUtils'

const SYMBOL_TYPES = [
    {
        'name': 'ALL TYPES',
        'value': SymbolClass.ALL_TYPES
    },
    {
        'name': 'EQUITY',
        'value': SymbolClass.EQUITY
    },
    {
        'name': 'ETF',
        'value': SymbolClass.ETF
    },
    {
        'name': 'MANAGED FUNDS',
        'value': SymbolClass.MF
    },
    {
        'name': 'WARRANT',
        'value': SymbolClass.WARRANT
    },
    {
        'name': 'FUTURES',
        'value': SymbolClass.FUTURE
    }
]
const MAX_SEARCH_RESULTS = 30;
const supportedResolutions = ['1', '5', '30', '60', '120', 'D', 'W', 'M']
const config = {
    supported_resolutions: supportedResolutions,
    symbols_types: SYMBOL_TYPES,
    exchanges: [
        {
            'value': '',
            'name': 'All Exchanges',
            'desc': ''
        },
        {
            'value': 'ASX',
            'name': 'ASX',
            'desc': 'ASX'
        }
    ]
}

export default (cbReady, cbResolve, id) => {
    return {
        onReady: cb => {
            console.log('=====onReady running')
            cbReady && cbReady()
            setTimeout(() => cb(config), 0)
        },
        searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {
            console.log('====Search Symbols running')
            if (!userInput) {
                onResultReadyCallback([]);
                return;
            }
            let classQuery = symbolType;
            if (symbolType === SymbolClass.ALL_TYPES) classQuery = 'equity,future,etf,mf,warrant'
            const url = makeMarketUrl(`symbol/company_name?class=${classQuery}&status=active&symbol=${encodeURIComponent(userInput)}&top=${MAX_SEARCH_RESULTS}`);
            getData(url).then(response => {
                const data = (response && response.data) || [];
                const listData = [];
                if (data && data.length) {
                    for (let i = 0; i < data.length; i++) {
                        const obj = {};
                        const element = data[i];
                        if (!dataStorage.symbolsObjDic[element.symbol]) {
                            dataStorage.symbolsObjDic[element.symbol] = element
                        }
                        obj.trading_halt = element.trading_halt || 0;
                        obj.symbol = element.symbol
                        obj.full_name = element.symbol;
                        obj.description = (element.company_name || element.company || element.security_name || '').toUpperCase();
                        obj.type = element.class || '';
                        obj.exchange = element.exchanges && element.exchanges[0] ? element.exchanges[0] : ''
                        listData.push(obj)
                    }
                }
                onResultReadyCallback(listData);
                listData.length && updateChartExchangeDisplay()
            }).catch(error => {
                console.error('searchSymbols chart api error: ', error);
                onResultReadyCallback([]);
            });
        },
        resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
            const symbolInfo = dataStorage.symbolsObjDic[symbolName]
            if (!symbolInfo) {
                setTimeout(function() {
                    onResolveErrorCallback('unknown symbol!')
                }, 0)
            } else {
                cbResolve && cbResolve(symbolInfo)
                // expects a symbolInfo object in response
                console.log('======resolveSymbol running')
                // console.log('resolveSymbol:',{symbolName})
                const exchange = symbolInfo.exchanges && symbolInfo.exchanges[0] ? symbolInfo.exchanges[0] : ''
                const description = (symbolInfo.security_name || symbolInfo.company_name || symbolInfo.company || '').toUpperCase()
                const isUS = symbolInfo.country === 'US'
                var symbolStub = {
                    name: symbolInfo.display_name || '',
                    symbol: symbolInfo.symbol,
                    description,
                    type: 'stock',
                    session: isUS ? '0930-1600' : '0900-1613',
                    minmov: 1,
                    minmov2: 0,
                    timezone: isUS ? 'America/New_York' : 'Australia/Sydney',
                    ticker: symbolInfo.symbol || '',
                    exchange,
                    pricescale: 10000,
                    has_intraday: true,
                    intraday_multipliers: [
                        '1',
                        '5',
                        '30',
                        '60',
                        '120',
                        'D',
                        'W',
                        'M'
                    ],
                    supported_resolutions: ['1', '5', '30', '60', '120', 'D', '1D', 'W', '1W', 'M', '1M'],
                    has_no_volume: false,
                    has_daily: true,
                    has_weekly_and_monthly: true,
                    volume_precision: 8,
                    data_status: 'delayed_streaming'
                }
                setTimeout(function() {
                    onSymbolResolvedCallback(symbolStub)
                    console.log('Resolving that symbol....', symbolStub)
                }, 0)
            }
            // onResolveErrorCallback('Not feeling it today')
        },
        getBars: function(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
            console.log('=====getBars running')
            // console.log('function args',arguments)
            // console.log(`Requesting bars between ${new Date(from * 1000).toISOString()} and ${new Date(to * 1000).toISOString()}`)
            historyProvider.getBars(symbolInfo, resolution, from, to, firstDataRequest)
                .then(bars => {
                    if (bars.length) {
                        onHistoryCallback(bars, { noData: false })
                    } else {
                        onHistoryCallback(bars, { noData: true })
                    }
                }).catch(err => {
                    console.log({ err })
                    onErrorCallback(err)
                })
        },
        subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) => {
            console.log('=====subscribeBars runnning')
            stream.subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback)
        },
        unsubscribeBars: subscriberUID => {
            console.log('=====unsubscribeBars running')
            stream.unsubscribeBars(subscriberUID)
        },
        calculateHistoryDepth: (resolution, resolutionBack, intervalBack) => {
            // optional
            console.log('=====calculateHistoryDepth running')
        },
        getMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
            // optional
            console.log('=====getMarks running')
        },
        getTimeScaleMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
            // optional
            console.log('=====getTimeScaleMarks running')
        },
        getServerTime: cb => {
            console.log('=====getServerTime running')
        }
    }
}
