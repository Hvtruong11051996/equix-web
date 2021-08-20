import dataStorage from '../../../dataStorage'
import { getData, makeHistorycalUrl } from '../../../helper/request'
import uuidv4 from 'uuid/v4'
import { convertToDateWithFormatUtc, getBusinessTimeString } from '../../../helper/dateTime'
const history = {}
const DELTA_TIME = 5 * 24 * 60 * 60 * 1000
const lstFuEx = ['IFSG', 'XCME', 'IFEU', 'IFLX', 'XCBT', 'IFUS', 'XNYM', 'XCEC', 'XSCE', 'XTKT', 'XKLS', 'XLME']
const lstAuExHaveDot = ['ASX', 'NSX', 'BSX']
const DIC_RESOLUTION = {
    1: '1m',
    5: '5m',
    30: '30m',
    60: '1h',
    120: '2h',
    D: 'day',
    '1D': 'day',
    W: 'week',
    '1W': 'week',
    M: 'month',
    '1M': 'month',
    unknown: '1h'
}

const FIELD = {
    TIME: 'time',
    OPEN: 'open',
    HIGH: 'high',
    LOW: 'low',
    CLOSE: 'close',
    VOLUME: 'volume'
}

const convertToNumber = function (value) {
    if (typeof value === 'number') return value
    if (typeof value === 'string') return parseFloat((value).replace(/,/g, ''))
}

const convertDataChart = (dataStr) => {
    if (!dataStr) return []
    const dataStub = dataStr.data && dataStr.data.match(/([^,\n]+,){3,}[^,\n]+/g).map(item => item.split(','))
    const res = []
    if (dataStub && dataStub.length) {
        for (let i = 1; i < dataStub.length; i++) {
            const obj = {}
            dataStub[i].map((v, k) => {
                const key = (dataStub[0][k] + '').toLowerCase()
                let value = ''
                if (key === FIELD.TIME) {
                    let date = (v || '').replace(/^([\d]+)\/([\d]+)/, '$2/$1')
                    date = convertToDateWithFormatUtc(date, 'MM/DD/YY-hh:mm:ss')
                    value = date.getTime()
                } else value = convertToNumber(v)
                obj[key] = value
            })
            res.push(obj)
        }
    }
    return res.sort((a, b) => a.time - b.time)
}

const getHistoryUrl = function (resolution, exchange, symbol, startTime, endTime) {
    if (/\.[a-z]+$/i.test(encodeURIComponent(symbol)) && !lstAuExHaveDot.includes(exchange)) {
        if (lstFuEx.includes(exchange)) {
            if (dataStorage.priceSourceNoAccessFu) return
        } else if (dataStorage.priceSourceNoAccessUs) return
    } else {
        if (dataStorage.priceSourceNoAccessAu) return
    }
    const from = getBusinessTimeString(startTime)
    const to = getBusinessTimeString(endTime)
    return makeHistorycalUrl(`${exchange}/${symbol}?interval=${DIC_RESOLUTION[resolution || 'unknown']}&from=${from}&to=${to}&count=500`)
}

const getHistoryData = function (symbolInfo, resolution, from, to) {
    return new Promise(resolve => {
        let symbol = symbolInfo.symbol
        const exchange = symbolInfo.exchange
        symbol = (symbol + '').trim()
        const decode = encodeURIComponent(symbol)
        const startTime = from * 1000 - DELTA_TIME
        const endTime = to * 1000
        const urlHistorycal = getHistoryUrl(resolution, exchange, decode, startTime, endTime)
        getData(urlHistorycal)
            .then(dataChart => {
                const bars = convertDataChart(dataChart)
                resolve(bars)
            })
            .catch(error => resolve([]))
    })
}

export default {
    history: history,
    getBars: async function (symbolInfo, resolution, from, to, first) {
        return getHistoryData(symbolInfo, resolution, from, to)
            .then(bars => {
                if (first) {
                    var lastBar = bars[bars.length - 1]
                    history[`${symbolInfo.symbol}_${resolution}`] = { lastBar }
                }
                return bars || []
            })
    }
}
