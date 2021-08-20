import Compoment from '../../../src/components/Indexes/Indexes';
import * as request from '../../../src/helper/request';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react'
import dataStorage from '../../../src/dataStorage'
import * as functionUtils from '../../../src/helper/functionUtils'
import log from '../../../src/helper/log';
import { UndoVariantIcon } from 'mdi-react';
import * as storage from '../../../src/storage';
const props1 = {
    loadState: function() {
        return {}
    },
    glContainer: {
        on: function(key, cb) {
            jest.spyOn(functionUtils, 'hideElement')
                .mockImplementation(() => { })
            cb()
        },
        _contentElement: [],
        _element: [{
            contains: function() {
                return true
            },
            react: function() {
            },
            removeChild: function() {
                return true
            }
        }],
        isHidden: true
    },
    confirmClose: function() {
    },
    loading: function() {
    },
    resize: function() {
    },
    receive: function() {
    },
    send: function() {
    },
    saveState: function() {
    },
    hideElement: function() {
    }
}
dataStorage.symbolsObjDic = { '': ['XAO', 'XTL', 'XFL', 'XTO', 'XJO'] }
dataStorage.translate = () => { }
let x;
beforeEach(() => {
    x = new Compoment(props1);
});
test('Indexes', () => {
    jest.spyOn(request, 'getData')
        .mockImplementation((url) => new Promise(resolve => {
            if (url === 1) {
                resolve({
                    data: [{
                        symbol: 'AMH.XNYS',
                        class: 'index',
                        code: 'XNAS@AMH',
                        display_name: 'AMH.NYSE',
                        company: 'AMERICAN HOMES 4 RENT',
                        status: 'active',
                        exchanges: ['XNYS'],
                        country: 'US',
                        contract_unit: null,
                        contract_months: null,
                        listing_date: null,
                        min_price_movement: null,
                        last_trading_day: null,
                        cash_settlement_price: null,
                        trading_hours: null,
                        settlement_day: null,
                        position_limit: null,
                        daily_price_limit: null,
                        cftc_approved: null,
                        updated: '2019-06-11T00:00:02.000Z',
                        company_name: 'AMERICAN HOMES 4 RENT',
                        GICS_industry_group: null,
                        list_trading_market: null,
                        trading_halt: 0,
                        currency: 'USD',
                        ISIN: 'US02665T3068',
                        display_exchange: 'NYSE',
                        last_halt: null,
                        last_haltlift: 1560211200615,
                        type: 0,
                        display_master_code: null,
                        display_master_name: null,
                        master_code: null,
                        master_name: null,
                        expiry_date: null,
                        first_noti_day: null,
                        security_name: null,
                        origin_symbol: null
                    },
                    {
                        symbol: 'NSXAEI.NSX',
                        class: 'index',
                        code: 'NSXAEI',
                        display_name: 'NSXAEI.NSX',
                        company: 'NSX All Equities Index',
                        status: 'active',
                        exchanges: ['NSX'],
                        country: 'AU',
                        contract_unit: null,
                        contract_months: null,
                        listing_date: null,
                        min_price_movement: null,
                        last_trading_day: null,
                        cash_settlement_price: null,
                        trading_hours: null,
                        settlement_day: null,
                        position_limit: null,
                        daily_price_limit: null,
                        cftc_approved: null,
                        updated: null,
                        company_name: 'NSX All Equities Index',
                        GICS_industry_group: null,
                        list_trading_market: ['NSX:NSX'],
                        trading_halt: 0,
                        currency: 'AUD',
                        ISIN: 'AUNSXAEI',
                        display_exchange: 'NSX',
                        last_halt: 0,
                        last_haltlift: 0,
                        type: 0,
                        display_master_code: null,
                        display_master_name: null,
                        master_code: null,
                        master_name: null,
                        expiry_date: null,
                        first_noti_day: null,
                        security_name: null,
                        origin_symbol: null
                    }
                    ]
                })
            } else if (url === 'undefined/feed-snapshot/level1/FX/AUDUSD,GBPUSD,EURUSD') {
                resolve({
                    data: [
                        {
                            exchange: 'FX',
                            symbol: 'AUDUSD',
                            ask_price: 0.67888,
                            bid_price: 0.67883,
                            updated: 1574390014146,
                            indicative_price: null,
                            auction_volume: null,
                            side: null,
                            surplus_volume: null
                        },
                        {
                            exchange: 'FX',
                            symbol: 'GBPUSD',
                            ask_price: 1.29166,
                            bid_price: 1.29153,
                            updated: 1574390014151,
                            indicative_price: null,
                            auction_volume: null,
                            side: null,
                            surplus_volume: null
                        }
                    ]
                })
            }
            resolve({
                data: {
                    value: [{ symbol: 'XAO', rank: 0 },
                    { symbol: 'XTL', rank: 1 },
                    { symbol: 'XFL', rank: 2 },
                    { symbol: 'XTO', rank: 3 },
                    { symbol: 'XJO', rank: 4 }]
                }
            })
        }))
    jest.spyOn(request, 'getRealtimePriceUrlNew')
        .mockImplementation(() => {
            return 'abc'
        }
        )
    jest.spyOn(request, 'makePriceLevel1UrlNew')
        .mockImplementation(() => {
            return { normal: 1 }
        }
        )
    storage.func = {
        setStore: (name, emitter) => {
            return { addListener: () => { } };
        },
        getStore: (name) => {
            return {
                addListener: () => {
                    return { remove: () => { } }
                }
            };
        },
        emitter: (name, eventName, data) => {
            return {
                addListener: () => {
                    return { remove: () => { } }
                }
            };
        }
    }
    render(<Compoment {...props1} />)
})
test('getSymbolInfo', () => {
    const logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({ data: 1 })
        }))
    x.getSymbolInfo()
    expect(logger).not.toHaveBeenCalled()
})
test('refreshData', () => {
    const logger = jest.spyOn(log, 'error');
    x.refreshData('refresh', 0)
    expect(logger).toHaveBeenCalled()
})
test('refreshData', () => {
    x.setData1 = jest.fn()
    x.setData2 = jest.fn()
    x.loadData = jest.fn()
    x.getData1 = () => {
        return [{ c: 1 }, { a: 1 }]
    }
    x.getData2 = () => {
        return [{ c: 1 }, { a: 1 }]
    }
    x.refreshData('refresh', 0)
    expect(x.loadData).toHaveBeenCalled()
})
test('refreshData', () => {
    x.setData1 = jest.fn()
    x.setData2 = jest.fn()
    x.loadData = jest.fn()
    x.getData1 = () => {
        return [{ company_name: 1 }, { trade_price: 1 }, { symbol: 3 }]
    }
    x.getData2 = () => {
        return [{ symbol: 1 }, { a: 1 }]
    }
    x.refreshData('refresh', 0)
    expect(x.loadData).toHaveBeenCalled()
})
test('refreshData', () => {
    x.setData1 = jest.fn()
    x.setData2 = jest.fn()
    x.loadData = jest.fn()
    x.getData1 = () => {
        return [{ c: 1 }, { a: 1 }]
    }
    x.getData2 = () => {
        return [{ c: 1 }, { a: 1 }]
    }
    x.refreshData('123', 0)
    expect(x.loadData).not.toBeCalled()
})
test('refreshData', () => {
    x.setData1 = jest.fn()
    x.setData2 = jest.fn()
    x.loadData = jest.fn()
    x.getData1 = () => {
        return [{ c: 1 }, { a: 1 }]
    }
    x.getData2 = () => {
        return [{ c: 1 }, { a: 1 }]
    }
    x.refreshData('refresh', true)
    expect(x.setData1).not.toBeCalled()
})
test('changeConnection', () => {
    x.needToRefresh = true;
    x.refreshData = jest.fn()
    x.changeConnection(true)
    expect(x.refreshData).toBeCalled();
})
test('changeConnection', () => {
    x.needToRefresh = true;
    x.refreshData = jest.fn()
    x.changeConnection(false)
    expect(x.refreshData).not.toBeCalled();
})
test('onRowClicked', async () => {
    let data = { data: { symbol: {} } }
    x.dataDicIndex = null
    const logger = jest.spyOn(log, 'error');
    x.onRowClicked(data)
    expect(logger).toHaveBeenCalled()
})
test('onRowClicked', async () => {
    let data = { data: 1 }
    x.dataDicIndex = null
    const logger = jest.spyOn(log, 'error');
    x.onRowClicked(data)
    expect(logger).toHaveBeenCalled()
})
test('onRowClicked', () => {
    let data = { data: { symbol: 'symbolName' } }
    x.refreshData = jest.fn()
    x.dataDicIndex = { symbolName: 1 }
    x.onRowClicked(data)
    expect(x.refreshData).toBeCalled();
})
test('onRowClicked', () => {
    x.refreshData = jest.fn()
    let data = {}
    x.onRowClicked(data)
    expect(x.refreshData).not.toBeCalled();
})
test('onRowClicked', () => {
    x.refreshData = jest.fn()
    let data = { data: { symbol: 'symbolName' } }
    x.dataDicIndex = {}
    x.onRowClicked(data)
    expect(x.refreshData).not.toBeCalled();
})
test('realtimePrice', () => {
    const obj = { quote: 1 }
    x.addOrUpdate1 = jest.fn()
    x.props.glContainer.isHidden = false
    x.realtimePrice(obj)
    expect(x.addOrUpdate1).toBeCalled();
})
test('realtimePrice', () => {
    const obj = { quote: 1 }
    x.addOrUpdate1 = jest.fn()
    x.props.glContainer.isHidden = false
    x.realtimePrice()
    expect(x.addOrUpdate1).not.toBeCalled();
})
test('realtimePrice', () => {
    const obj = { quote: 1 }
    x.addOrUpdate1 = jest.fn()
    x.props.glContainer.isHidden = true
    x.realtimePrice(obj)
    expect(x.addOrUpdate1).not.toBeCalled();
})
test('loadData', async () => {
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({ data: [{}, {}] })
        }))
    x.setData1 = jest.fn()
    x.setData2 = jest.fn()
    x.loadData()
    expect(x.setData2).not.toBeCalled()
})
test('loadData', async () => {
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve({ data: { value: 1 } })
        }))
    // eslint-disable-next-line prefer-promise-reject-errors
    x.getPrice = jest.fn().mockReturnValueOnce(Promise.reject('error'))
    x.loadData()
    x.setData1 = jest.fn()
    x.setData2 = jest.fn()
    expect(x.setData2).not.toBeCalled()
})
test('loadData', async () => {
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve({})
        }))
    x.loadData()
    x.setData1 = jest.fn()
    x.setData2 = jest.fn()
    expect(x.setData2).not.toBeCalled()
})
test('loadData', async () => {
    const logger = jest.spyOn(log, 'error');
    x.loadData()
    expect(logger).toBeCalled()
})
test('getDataUrl', () => {
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({ data: [{}, {}] })
        }))
    expect(x.getDataUrl('url', [], {}, {})).resolves.toBe(false)
})
test('getPrice', async () => {
    const logger = jest.spyOn(log, 'error');
    x.getPrice(null)
    expect(logger).toBeCalled()
})
test('getPrice', () => {
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve({ data: [1] })
        }))
    jest.spyOn(request, 'makePriceLevel1UrlNew')
        .mockImplementation(() => {
            return { normal: 1, delayed: 2, deny: 3 }
        }
        )
    jest.spyOn(request, 'getRealtimePriceUrlNew')
        .mockImplementation(() => {
            return 'abc'
        }
        )
    x.getSymbolInfo = jest.fn().mockReturnValueOnce(Promise.resolve([1, 2, 3]))
    expect(x.getPrice([{ symbol: 1, rank: 2 }])).resolves.toEqual([])
})
test('getPrice', () => {
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve({ data: [1] })
        }))
    jest.spyOn(request, 'makePriceLevel1UrlNew')
        .mockImplementation(() => {
            return { normal: 1, delayed: 2, deny: 3 }
        }
        )
    jest.spyOn(request, 'getRealtimePriceUrlNew')
        .mockImplementation(() => {
            return 'abc'
        }
        )
    x.getSymbolInfo = jest.fn().mockReturnValueOnce(Promise.resolve([1, 2, 3]))
    expect(x.getPrice([{ symbol: '', rank: 2 }])).resolves.toEqual([])
})
test('getPrice', () => {
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve({ data: [1] })
        }))
    jest.spyOn(request, 'makePriceLevel1UrlNew')
        .mockImplementation(() => {
            return { normal: 1, delayed: 2, deny: 3 }
        }
        )
    jest.spyOn(request, 'getRealtimePriceUrlNew')
        .mockImplementation(() => {
            return 'abc'
        }
        )
    x.getSymbolInfo = jest.fn().mockReturnValueOnce(Promise.resolve([1, 2, 3]))
    expect(x.getPrice([{ symbol: 1, rank: 2 }])).resolves.toEqual([])
})
test('getPrice', () => {
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve({ data: [1] })
        }))
    jest.spyOn(request, 'makePriceLevel1UrlNew')
        .mockImplementation(() => {
            return {}
        }
        )
    jest.spyOn(request, 'getRealtimePriceUrlNew')
        .mockImplementation(() => {
            return 'abc'
        }
        )
    x.getSymbolInfo = jest.fn().mockReturnValueOnce(Promise.resolve([1, 1, 'ASX']))
    expect(x.getPrice([{ symbol: 1, rank: 2 }])).resolves.toEqual([])
})
test('getPrice', () => {
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve({ data: [1] })
        }))
    jest.spyOn(request, 'makePriceLevel1UrlNew')
        .mockImplementation(() => {
            return {}
        }
        )
    jest.spyOn(request, 'getRealtimePriceUrlNew')
        .mockImplementation(() => {
            return 'abc'
        }
        )
    x.getSymbolInfo = jest.fn().mockReturnValueOnce(Promise.resolve([{ symbol: 1, exchanges: [1] }, { symbol: 1, exchanges: [1] }, { symbol: 1, exchanges: ['ASX'] }]))
    expect(x.getPrice([{ symbol: 1, a: 1, rank: 2 }, { symbol: 1, a: 1, rank: 2 }])).resolves.toEqual([])
})
test('getPrice', () => {
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve({ data: [1] })
        }))
    jest.spyOn(request, 'makePriceLevel1UrlNew')
        .mockImplementation(() => {
            return {}
        }
        )
    jest.spyOn(request, 'getRealtimePriceUrlNew')
        .mockImplementation(() => {
            return 'abc'
        }
        )
    x.getSymbolInfo = jest.fn().mockReturnValueOnce(Promise.resolve([{ symbol: 2, exchanges: [2] }]))
    expect(x.getPrice([{ symbol: 1, a: 1, rank: 2 }, { symbol: 1, a: 1, rank: 2 }])).resolves.toEqual([])
})
test('getPrice', () => {
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve()
        }))
    jest.spyOn(request, 'makePriceLevel1UrlNew')
        .mockImplementation(() => {
            return { data: 1 }
        }
        )
    jest.spyOn(request, 'getRealtimePriceUrlNew')
        .mockImplementation(() => {
            return 'abc'
        }
        )
    x.getSymbolInfo = jest.fn().mockReturnValueOnce(Promise.resolve([{ symbol: 2, exchanges: [2] }]))
    expect(x.getPrice([{ symbol: 1, a: 1, rank: 2 }, { symbol: 1, a: 1, rank: 2 }])).resolves.toEqual([])
})
test('getPrice', () => {
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve({ data: [1] })
        }))
    jest.spyOn(request, 'makePriceLevel1UrlNew')
        .mockImplementation(() => {
            return {}
        }
        )
    jest.spyOn(request, 'getRealtimePriceUrlNew')
        .mockImplementation(() => {
            return 'abc'
        }
        )
    x.getSymbolInfo = jest.fn().mockReturnValueOnce(Promise.resolve())
    expect(x.getPrice([{ symbol: 1, a: 1, rank: 2 }, { symbol: 1, a: 1, rank: 2 }])).resolves.toEqual([])
})
test('componentDidMount', () => {
    x.checkConnection = {}
    const logger = jest.spyOn(log, 'error');
    x.componentDidMount()
    expect(logger).toBeCalled()
})
test('componentDidMount', () => {
    x.emitID = {}
    const logger = jest.spyOn(log, 'error');
    x.componentWillUnmount()
    expect(logger).toBeCalled()
})
test('render', () => {
    x.getColumnsCurr = 'exception'
    const logger = jest.spyOn(log, 'error');
    x.render()
    expect(logger).toBeCalled()
})
test('getColumnsMarket check if ALL ORDINARIES', () => {
    const abc = x.getColumnsMarket()
    const params = { data: { company_name: 'ALL ORDINARIES' }, colDef: { field: 'company_name' } }
    abc.map(column => {
        if (column.cellRenderer) column.cellRenderer(params)
    })
})
test('getColumnsMarket check if roundFloat', () => {
    const abc = x.getColumnsMarket()
    const params = { data: { change_percent: '123' }, colDef: { field: 'change_percent' } }
    abc.map(column => {
        if (column.cellRenderer) column.cellRenderer(params)
    })
})
test('getColumnsMarket check if roundFloat', () => {
    const abc = x.getColumnsMarket()
    const params = { data: { change_percent: '-1' }, colDef: { field: 'change_percent' } }
    abc.map(column => {
        if (column.cellRenderer) column.cellRenderer(params)
    })
})
test('getColumnsMarket check if header close', () => {
    const abc = x.getColumnsMarket()
    const params = { data: { close: '111' }, colDef: { field: 'close' } }
    abc.map(column => {
        if (column.cellRenderer) column.cellRenderer(params)
    })
})
test('getColumnsCurr', () => {
    const abc = x.getColumnsCurr()
    const params = { data: { symbol: 'AUDUSD' }, colDef: { field: 'symbol' } }
    abc.map(column => {
        if (column.cellRenderer) column.cellRenderer(params)
    })
})
test('getColumnsCurr check if checkCodeFlag', () => {
    const abc = x.getColumnsCurr()
    const params = { data: { symbol: 'EUREUR' }, colDef: { field: 'symbol' } }
    abc.map(column => {
        if (column.cellRenderer) column.cellRenderer(params)
    })
})
test('getColumnsCurr check if bid_price', () => {
    const abc = x.getColumnsCurr()
    const params = { data: { symbol: 'EUREUR', bid_price: '123' }, colDef: { field: 'symbol' } }
    abc.map(column => {
        if (column.cellRenderer) column.cellRenderer(params)
    })
})
