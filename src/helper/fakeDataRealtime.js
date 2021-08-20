
let temp = null;
let intervalId = null;
export function makeData(cb) {
    temp = cb;
    const listSymbol = [
        {
            'symbol': 'ABP',
            'rank': 0
        },
        {
            'symbol': 'ABC',
            'rank': 1
        },
        {
            'symbol': 'APT',
            'rank': 2
        },
        {
            'symbol': 'AGL',
            'rank': 3
        },
        {
            'symbol': 'ALQ',
            'rank': 4
        },
        {
            'symbol': 'ALU',
            'rank': 5
        },
        {
            'symbol': 'AWC',
            'rank': 6
        },
        {
            'symbol': 'AMC',
            'rank': 7
        },
        {
            'symbol': 'AMP',
            'rank': 8
        },
        {
            'symbol': 'ANN',
            'rank': 9
        },
        {
            'symbol': 'ANZ',
            'rank': 10
        },
        {
            'symbol': 'APA',
            'rank': 11
        },
        {
            'symbol': 'APX',
            'rank': 12
        },
        {
            'symbol': 'ARB',
            'rank': 13
        },
        {
            'symbol': 'ALG',
            'rank': 14
        },
        {
            'symbol': 'ALL',
            'rank': 15
        },
        {
            'symbol': 'ASX',
            'rank': 16
        },
        {
            'symbol': 'ALX',
            'rank': 17
        },
        {
            'symbol': 'AZJ',
            'rank': 18
        },
        {
            'symbol': 'ASL',
            'rank': 19
        },
        {
            'symbol': 'AST',
            'rank': 20
        },
        {
            'symbol': 'API',
            'rank': 21
        },
        {
            'symbol': 'AOG',
            'rank': 22
        },
        {
            'symbol': 'BOQ',
            'rank': 23
        },
        {
            'symbol': 'BAP',
            'rank': 24
        },
        {
            'symbol': 'BPT',
            'rank': 25
        },
        {
            'symbol': 'BGA',
            'rank': 26
        },
        {
            'symbol': 'BAL',
            'rank': 27
        },
        {
            'symbol': 'BEN',
            'rank': 28
        },
        {
            'symbol': 'BHP',
            'rank': 29
        },
        {
            'symbol': 'BIN',
            'rank': 30
        },
        {
            'symbol': 'BKL',
            'rank': 31
        },
        {
            'symbol': 'BSL',
            'rank': 32
        },
        {
            'symbol': 'BLD',
            'rank': 33
        },
        {
            'symbol': 'BXB',
            'rank': 34
        },
        {
            'symbol': 'BVS',
            'rank': 35
        },
        {
            'symbol': 'BRG',
            'rank': 36
        },
        {
            'symbol': 'BKW',
            'rank': 37
        },
        {
            'symbol': 'BWP',
            'rank': 38
        },
        {
            'symbol': 'CTX',
            'rank': 39
        },
        {
            'symbol': 'CAR',
            'rank': 40
        },
        {
            'symbol': 'CGF',
            'rank': 41
        },
        {
            'symbol': 'CHC',
            'rank': 42
        },
        {
            'symbol': 'CQR',
            'rank': 43
        },
        {
            'symbol': 'CNU',
            'rank': 44
        },
        {
            'symbol': 'CLW',
            'rank': 45
        },
        {
            'symbol': 'CIM',
            'rank': 46
        },
        {
            'symbol': 'CWY',
            'rank': 47
        },
        {
            'symbol': 'CCL',
            'rank': 48
        },
        {
            'symbol': 'COH',
            'rank': 49
        },
        {
            'symbol': 'COL',
            'rank': 50
        },
        {
            'symbol': 'CBA',
            'rank': 51
        },
        {
            'symbol': 'CPU',
            'rank': 52
        },
        {
            'symbol': 'CTD',
            'rank': 53
        },
        {
            'symbol': 'CGC',
            'rank': 54
        },
        {
            'symbol': 'CCP',
            'rank': 55
        },
        {
            'symbol': 'CMW',
            'rank': 56
        },
        {
            'symbol': 'CWN',
            'rank': 57
        },
        {
            'symbol': 'CSL',
            'rank': 58
        },
        {
            'symbol': 'CSR',
            'rank': 59
        },
        {
            'symbol': 'CYB',
            'rank': 60
        },
        {
            'symbol': 'DXS',
            'rank': 61
        },
        {
            'symbol': 'DHG',
            'rank': 62
        },
        {
            'symbol': 'DMP',
            'rank': 63
        },
        {
            'symbol': 'DOW',
            'rank': 64
        },
        {
            'symbol': 'DLX',
            'rank': 65
        },
        {
            'symbol': 'ECX',
            'rank': 66
        },
        {
            'symbol': 'ELD',
            'rank': 67
        },
        {
            'symbol': 'EHL',
            'rank': 68
        },
        {
            'symbol': 'EHE',
            'rank': 69
        },
        {
            'symbol': 'EVN',
            'rank': 70
        },
        {
            'symbol': 'FPH',
            'rank': 71
        },
        {
            'symbol': 'FBU',
            'rank': 72
        },
        {
            'symbol': 'FLT',
            'rank': 73
        },
        {
            'symbol': 'FMG',
            'rank': 74
        },
        {
            'symbol': 'GUD',
            'rank': 75
        },
        {
            'symbol': 'GEM',
            'rank': 76
        },
        {
            'symbol': 'GXY',
            'rank': 77
        },
        {
            'symbol': 'GMG',
            'rank': 78
        },
        {
            'symbol': 'GPT',
            'rank': 79
        },
        {
            'symbol': 'GNC',
            'rank': 80
        },
        {
            'symbol': 'GOZ',
            'rank': 81
        },
        {
            'symbol': 'GWA',
            'rank': 82
        },
        {
            'symbol': 'HVN',
            'rank': 83
        },
        {
            'symbol': 'HLS',
            'rank': 84
        },
        {
            'symbol': 'HSO',
            'rank': 85
        },
        {
            'symbol': 'HUB',
            'rank': 86
        },
        {
            'symbol': 'IEL',
            'rank': 87
        },
        {
            'symbol': 'ILU',
            'rank': 88
        },
        {
            'symbol': 'IPL',
            'rank': 89
        },
        {
            'symbol': 'IGO',
            'rank': 90
        },
        {
            'symbol': 'ING',
            'rank': 91
        },
        {
            'symbol': 'IAG',
            'rank': 92
        },
        {
            'symbol': 'IVC',
            'rank': 93
        },
        {
            'symbol': 'IFL',
            'rank': 94
        },
        {
            'symbol': 'IPH',
            'rank': 95
        },
        {
            'symbol': 'IRE',
            'rank': 96
        },
        {
            'symbol': 'JHX',
            'rank': 97
        },
        {
            'symbol': 'JHG',
            'rank': 98
        },
        {
            'symbol': 'JBH',
            'rank': 99
        },
        {
            'symbol': 'A2M',
            'rank': 100
        },
        {
            'symbol': 'LLC',
            'rank': 101
        },
        {
            'symbol': 'LNK',
            'rank': 102
        },
        {
            'symbol': 'LYC',
            'rank': 103
        },
        {
            'symbol': 'MFG',
            'rank': 104
        },
        {
            'symbol': 'MGR',
            'rank': 105
        },
        {
            'symbol': 'MIN',
            'rank': 106
        },
        {
            'symbol': 'MMS',
            'rank': 107
        },
        {
            'symbol': 'MND',
            'rank': 108
        },
        {
            'symbol': 'MPL',
            'rank': 109
        },
        {
            'symbol': 'MQG',
            'rank': 110
        },
        {
            'symbol': 'MTS',
            'rank': 111
        },
        {
            'symbol': 'MYO',
            'rank': 112
        },
        {
            'symbol': 'MYX',
            'rank': 113
        },
        {
            'symbol': 'NAB',
            'rank': 114
        },
        {
            'symbol': 'NAN',
            'rank': 115
        },
        {
            'symbol': 'NCM',
            'rank': 116
        },
        {
            'symbol': 'NEC',
            'rank': 117
        },
        {
            'symbol': 'NHC',
            'rank': 118
        },
        {
            'symbol': 'NHF',
            'rank': 119
        },
        {
            'symbol': 'NSR',
            'rank': 120
        },
        {
            'symbol': 'NST',
            'rank': 121
        },
        {
            'symbol': 'NUF',
            'rank': 122
        },
        {
            'symbol': 'NVT',
            'rank': 123
        },
        {
            'symbol': 'NWS',
            'rank': 124
        },
        {
            'symbol': 'NXT',
            'rank': 125
        },
        {
            'symbol': 'OML',
            'rank': 126
        },
        {
            'symbol': 'ORA',
            'rank': 127
        },
        {
            'symbol': 'ORE',
            'rank': 128
        },
        {
            'symbol': 'ORG',
            'rank': 129
        },
        {
            'symbol': 'ORI',
            'rank': 130
        },
        {
            'symbol': 'OSH',
            'rank': 131
        },
        {
            'symbol': 'OZL',
            'rank': 132
        },
        {
            'symbol': 'PDL',
            'rank': 133
        },
        {
            'symbol': 'PGH',
            'rank': 134
        },
        {
            'symbol': 'PLS',
            'rank': 135
        },
        {
            'symbol': 'PMV',
            'rank': 136
        },
        {
            'symbol': 'PNI',
            'rank': 137
        },
        {
            'symbol': 'PPT',
            'rank': 138
        },
        {
            'symbol': 'PTM',
            'rank': 139
        },
        {
            'symbol': 'QAN',
            'rank': 140
        },
        {
            'symbol': 'QBE',
            'rank': 141
        },
        {
            'symbol': 'QUB',
            'rank': 142
        },
        {
            'symbol': 'REA',
            'rank': 143
        },
        {
            'symbol': 'RHC',
            'rank': 144
        },
        {
            'symbol': 'RIO',
            'rank': 145
        },
        {
            'symbol': 'RMD',
            'rank': 146
        },
        {
            'symbol': 'RRL',
            'rank': 147
        },
        {
            'symbol': 'RSG',
            'rank': 148
        },
        {
            'symbol': 'RWC',
            'rank': 149
        },
        {
            'symbol': 'S32',
            'rank': 150
        },
        {
            'symbol': 'SAR',
            'rank': 151
        },
        {
            'symbol': 'SBM',
            'rank': 152
        },
        {
            'symbol': 'SCG',
            'rank': 153
        },
        {
            'symbol': 'SCP',
            'rank': 154
        },
        {
            'symbol': 'SDA',
            'rank': 155
        },
        {
            'symbol': 'SDF',
            'rank': 156
        },
        {
            'symbol': 'SEK',
            'rank': 157
        },
        {
            'symbol': 'SFR',
            'rank': 158
        },
        {
            'symbol': 'SGM',
            'rank': 159
        },
        {
            'symbol': 'SGP',
            'rank': 160
        },
        {
            'symbol': 'SGR',
            'rank': 161
        },
        {
            'symbol': 'SHL',
            'rank': 162
        },
        {
            'symbol': 'SIG',
            'rank': 163
        },
        {
            'symbol': 'SIQ',
            'rank': 164
        },
        {
            'symbol': 'SKC',
            'rank': 165
        },
        {
            'symbol': 'SKI',
            'rank': 166
        },
        {
            'symbol': 'SOL',
            'rank': 167
        },
        {
            'symbol': 'SPK',
            'rank': 168
        },
        {
            'symbol': 'STO',
            'rank': 169
        },
        {
            'symbol': 'SUL',
            'rank': 170
        },
        {
            'symbol': 'SUN',
            'rank': 171
        },
        {
            'symbol': 'SVW',
            'rank': 172
        },
        {
            'symbol': 'SWM',
            'rank': 173
        },
        {
            'symbol': 'SXL',
            'rank': 174
        },
        {
            'symbol': 'SYD',
            'rank': 175
        },
        {
            'symbol': 'SYR',
            'rank': 176
        },
        {
            'symbol': 'TAH',
            'rank': 177
        },
        {
            'symbol': 'TCL',
            'rank': 178
        },
        {
            'symbol': 'TGR',
            'rank': 179
        },
        {
            'symbol': 'TLS',
            'rank': 180
        },
        {
            'symbol': 'TME',
            'rank': 181
        },
        {
            'symbol': 'TNE',
            'rank': 182
        },
        {
            'symbol': 'TPM',
            'rank': 183
        },
        {
            'symbol': 'TWE',
            'rank': 184
        },
        {
            'symbol': 'URW',
            'rank': 185
        },
        {
            'symbol': 'VCX',
            'rank': 186
        },
        {
            'symbol': 'VEA',
            'rank': 187
        },
        {
            'symbol': 'VOC',
            'rank': 188
        },
        {
            'symbol': 'VVR',
            'rank': 189
        },
        {
            'symbol': 'WBC',
            'rank': 190
        },
        {
            'symbol': 'WEB',
            'rank': 191
        },
        {
            'symbol': 'WES',
            'rank': 192
        },
        {
            'symbol': 'WHC',
            'rank': 193
        },
        {
            'symbol': 'WOR',
            'rank': 194
        },
        {
            'symbol': 'WOW',
            'rank': 195
        },
        {
            'symbol': 'WPL',
            'rank': 196
        },
        {
            'symbol': 'WSA',
            'rank': 197
        },
        {
            'symbol': 'WTC',
            'rank': 198
        },
        {
            'symbol': 'XRO',
            'rank': 199
        }
    ]
    fakeData(listSymbol, temp);
}

const fakeData = (listSymbolObj) => {
    setTimeout(() => {
        let number = 0;
        intervalId && clearInterval(intervalId);
        intervalId = setInterval(() => {
            let result = {}
            number++;
            console.log('number: ', number)
            listSymbolObj.map(item => {
                item.exchange = 'ASX'
                // fake quote
                const aa = Math.floor((Math.random() * 10) + 1);
                if (aa % 3 === 0) return;
                result = {
                    symbol: item.symbol,
                    exchange: item.exchange
                };
                const quote = {
                    symbol: item.symbol,
                    exchange: item.exchange,
                    trend: 'None'
                }
                randomInteger(1, 50, quote, 'trade_price', 4);
                randomInteger(1, 50, quote, 'ask_price', 4);
                randomInteger(1, 50, quote, 'bid_price', 4);
                randomInteger(1, 50, quote, 'ask_size', 4);
                plusNumber(quote, 'bid_size', number);
                randomInteger(1, 50, quote, 'change_percent', 4, true);
                randomInteger(1, 50, quote, 'change_point', 4, true);
                randomInteger(1, 50, quote, 'close', 4);
                randomInteger(1, 50, quote, 'high', 4);
                randomInteger(1, 50, quote, 'low', 4);
                randomInteger(1, 50, quote, 'open', 4);
                randomInteger(1, 50, quote, 'trade_size', 4);
                randomInteger(1, 500, quote, 'volume', 4);
                randomInteger(1, 500, quote, 'previous_close', 4);
                randomInteger(1, 500, quote, 'value_traded', 4);
                quote.updated = new Date().getTime();
                result.quote = quote

                // fake depth
                const data = []
                const ask = {}
                const bid = {}
                for (let i = 0; i < 10; i++) {
                    ask[i] = fakeDataBidAsk(item.exchange, item.symbol, 'Ask')
                    bid[i] = fakeDataBidAsk(item.exchange, item.symbol, 'Bid')
                }
                const depth = {
                    ask,
                    bid
                };
                result.depth = depth

                //	fake trades
                const trades = {
                    symbol: item.symbol,
                    exchange: item.exchange,
                    time: (new Date()).getTime(),
                    id: (new Date()).getTime() + 300
                }
                randomInteger(1, 50, trades, 'price', 2);
                randomInteger(1, 200, trades, 'quantity', 0);
                result.trades = trades
                temp && temp({ data: JSON.stringify(result) })
            });
        }, 100);
    }, 3000);
};
const fakeDataBidAsk = (exchange) => {
    const obj = {}
    randomInteger(1, 200, obj, 'quantity', 0);
    randomInteger(1, 100, obj, 'price', 1);
    randomInteger(1, 2, obj, 'number_of_trades', 0);
    obj.exchanges = [exchange];
    return obj
}

const randomInteger = (min = 1, max, obj, field, rate, isNegative) => {
    const rateOption = Math.floor((Math.random() * rate) + 1);
    if (rateOption !== 1) return obj;
    let negative = 1;
    if (isNegative && Math.floor((Math.random() * 2) + 1) === 2) negative = -1;
    const value = Math.floor((Math.random() * max) + min);
    obj[field] = value * negative;
    return obj;
};

const plusNumber = (obj, field, number) => {
    obj[field] = number + 1;
    return obj;
};
