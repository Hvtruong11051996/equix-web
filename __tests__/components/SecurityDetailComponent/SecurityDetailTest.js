import Compoment from '../../../src/components/SecurityDetail/SecurityDetail';
import * as request from '../../../src/helper/request';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react'
import dataStorage from '../../../src/dataStorage'
import * as functionUtils from '../../../src/helper/functionUtils'
import log from '../../../src/helper/log';
import { UndoVariantIcon } from 'mdi-react';
import * as storage from '../../../src/storage';
import moment from 'moment-timezone';

const props1 = {
    loadState: function () {
        return {
            data: {
                symbolObj: {
                    symbol: 'KCEH20.IFUS',
                    class: 'future',
                    initial_margin: 3267,
                    maintenance_margin: 2970,
                    overnight_margin: 0,
                    contract_size: 37500,
                    multiplier: 0.01,
                    unit: 'pound',
                    currency: 'USD',
                    tick_size: 0.05,
                    time_zone: '(GMT- 05:00) Eastern Time (from the 1st Sunday in November every year) - (GMT- 04:00) Eastern Time (from the 2nd Sunday in March every year)',
                    trading_hours: '  - Sunday - Friday, 4:15 a.m - 1:30 p.m ',
                    list_contract: ['3', ' 5', ' 7', ' 9', ' 12'],
                    time_changed: 1559277998219,
                    symbolDisplay: 'KCEH20.ICE_US',
                    securityDisplay: 'Coffee (ICE): March 2020',
                    lang_master_symbol: 'KCE.IFUS',
                    productField: 'Future',
                    code: 'F.US.KCEH20',
                    display_name: 'KCEH20.ICE_US',
                    company: null,
                    status: 'active',
                    exchanges: ['XLME'],
                    country: 'US',
                    contract_unit: null,
                    contract_months: 'H20',
                    listing_date: '2019-11-21T22:34:03.000Z',
                    min_price_movement: 1,
                    last_trading_day: '2020-03-19T00:00:00.000Z',
                    cash_settlement_price: 1,
                    settlement_day: '2019-11-21T22:34:03.000Z',
                    position_limit: 1,
                    daily_price_limit: 1,
                    cftc_approved: null,
                    updated: '2019-11-21T22:34:03.000Z',
                    company_name: null,
                    GICS_industry_group: null,
                    list_trading_market: ['IFUS'],
                    trading_halt: 0,
                    ISIN: '1',
                    display_exchange: 'ICE_US',
                    last_halt: 0,
                    last_haltlift: 0,
                    type: 1,
                    display_master_code: 'KCE.ICE_US',
                    display_master_name: 'Coffee (ICE)',
                    master_name: 'Coffee (ICE)',
                    master_code: 'Coffee (ICE)',
                    expiry_date: '032020',
                    first_noti_day: '2020-02-20T00:00:00.000Z',
                    security_name: 'Coffee (ICE): March 2020',
                    origin_symbol: null
                }
            }
        }
    },
    glContainer: {
        on: function (key, cb) {
            jest.spyOn(functionUtils, 'hideElement')
                .mockImplementation(() => { })
            cb()
        },
        _contentElement: [],
        _element: [{
            contains: function () {
                return true
            },
            react: function () {
            },
            removeChild: function () {
                return true
            }
        }],
        isHidden: true
    },
    confirmClose: function () {
    },
    loading: function () {
    },
    resize: function () {
    },
    receive: function () {
    },
    send: function () {
    },
    saveState: function () {
    },
    hideElement: function () {
    }
}
const props4 = {
    loadState: function () {
        return {
            data: {
                symbolObj: {
                    symbol: 'KCEH20.IFUS',
                    class: 'future',
                    initial_margin: 3267,
                    maintenance_margin: 2970,
                    overnight_margin: 0,
                    contract_size: 37500,
                    multiplier: 0.01,
                    unit: 'pound',
                    currency: 'USD',
                    tick_size: 0.05,
                    time_zone: '(GMT- 05:00) Eastern Time (from the 1st Sunday in November every year) - (GMT- 04:00) Eastern Time (from the 2nd Sunday in March every year)',
                    trading_hours: '  - Sunday - Friday, 4:15 a.m - 1:30 p.m ',
                    list_contract: ['3', ' 5', ' 7', ' 9', ' 12'],
                    time_changed: 1559277998219,
                    symbolDisplay: 'KCEH20.ICE_US',
                    securityDisplay: 'Coffee (ICE): March 2020',
                    lang_master_symbol: 'KCE.IFUS',
                    productField: 'Future',
                    code: 'F.US.KCEH20',
                    display_name: 'KCEH20.ICE_US',
                    company: null,
                    status: 'active',
                    exchanges: ['XLME'],
                    country: 'US',
                    contract_unit: null,
                    contract_months: 'H20',
                    listing_date: '2019-11-21T22:34:03.000Z',
                    min_price_movement: 1,
                    last_trading_day: '2020-03-19T00:00:00.000Z',
                    cash_settlement_price: 1,
                    settlement_day: '2019-11-21T22:34:03.000Z',
                    position_limit: 1,
                    daily_price_limit: 1,
                    cftc_approved: null,
                    updated: '2019-11-21T22:34:03.000Z',
                    company_name: null,
                    GICS_industry_group: null,
                    list_trading_market: ['IFUS'],
                    trading_halt: 0,
                    ISIN: '1',
                    display_exchange: 'ICE_US',
                    last_halt: 0,
                    last_haltlift: 0,
                    type: 1,
                    display_master_code: 'KCE.ICE_US',
                    display_master_name: 'Coffee (ICE)',
                    master_name: 'Coffee (ICE)',
                    expiry_date: '032020',
                    first_noti_day: '2020-02-20T00:00:00.000Z',
                    security_name: 'Coffee (ICE): March 2020',
                    origin_symbol: null
                }
            }
        }
    },
    glContainer: {
        on: function (key, cb) {
            jest.spyOn(functionUtils, 'hideElement')
                .mockImplementation(() => { })
            cb()
        },
        _contentElement: [],
        _element: [{
            contains: function () {
                return true
            },
            react: function () {
            },
            removeChild: function () {
                return true
            }
        }],
        isHidden: true
    },
    confirmClose: function () {
    },
    loading: function () {
    },
    resize: function () {
    },
    receive: function () {
    },
    send: function () {
    },
    saveState: function () {
    },
    hideElement: function () {
    }
}
const props2 = {
    loadState: function () {
        return {
            data: {
            }
        }
    },
    glContainer: {
        on: function (key, cb) {
            jest.spyOn(functionUtils, 'hideElement')
                .mockImplementation(() => { })
            cb()
        },
        _contentElement: [],
        _element: [{
            contains: function () {
                return true
            },
            react: function () {
            },
            removeChild: function () {
                return true
            }
        }],
        isHidden: true
    },
    confirmClose: function () {
    },
    loading: function () {
    },
    resize: function () {
    },
    receive: function () {
    },
    send: function () {
    },
    saveState: function () {
    },
    hideElement: function () {
    }
}
const props3 = {
    loadState: function () {
        return {
        }
    },
    glContainer: {
        on: function (key, cb) {
            jest.spyOn(functionUtils, 'hideElement')
                .mockImplementation(() => { })
            cb()
        },
        _contentElement: [],
        _element: [{
            contains: function () {
                return true
            },
            react: function () {
            },
            removeChild: function () {
                return true
            }
        }],
        isHidden: true
    },
    confirmClose: function () {
    },
    loading: function () {
    },
    resize: function () {
    },
    receive: function () {
    },
    send: function () {
    },
    saveState: function () {
    },
    hideElement: function () {
    }
}
dataStorage.translate = () => { }
let x;
beforeEach(() => {
    x = new Compoment(props1);
});
test('SecurityDetail props2', () => {
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
    render(<Compoment {...props2} />)
})
test('SecurityDetail props3', () => {
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
    render(<Compoment {...props3} />)
})
test('SecurityDetail props4', () => {
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
    x.refreshTimeoutID = true
    jest.useFakeTimers();

    render(<Compoment {...props4} />)
    jest.advanceTimersByTime(400);
})
test('SecurityDetail', () => {
    jest.spyOn(request, 'getData')
        .mockImplementation((url) => new Promise(resolve => {
            if (url === 'undefined/commodity-info/symbol/KCE.IFUS') {
                resolve({
                    data: [{
                        symbol: 'KCEH20.IFUS',
                        class: 'future',
                        code: 'F.US.KCEH20',
                        display_name: 'KCEH20.ICE_US',
                        company: null,
                        status: 'active',
                        exchanges: ['IFUS'],
                        country: 'US',
                        contract_unit: null,
                        contract_months: 'H20',
                        listing_date: '2019-11-21T22:34:03.000Z',
                        min_price_movement: 1,
                        last_trading_day: '2020-03-19T00:00:00.000Z',
                        cash_settlement_price: 1,
                        trading_hours: null,
                        settlement_day: '2019-11-21T22:34:03.000Z',
                        position_limit: 1,
                        daily_price_limit: 1,
                        cftc_approved: null,
                        updated: '2019-11-21T22:34:03.000Z',
                        company_name: null,
                        GICS_industry_group: null,
                        list_trading_market: ['IFUS'],
                        trading_halt: 0,
                        currency: 'USD',
                        ISIN: '1',
                        display_exchange: 'ICE_US',
                        last_halt: 0,
                        last_haltlift: 0,
                        type: 1,
                        display_master_code: 'KCE.ICE_US',
                        display_master_name: 'Coffee (ICE)',
                        master_code: 'KCE.IFUS',
                        master_name: 'Coffee (ICE)',
                        expiry_date: '032020',
                        first_noti_day: '2020-02-20T00:00:00.000Z',
                        security_name: 'Coffee (ICE): March 2020',
                        origin_symbol: null
                    },
                    {
                        symbol: 'KCEH21.IFUS',
                        class: 'future',
                        code: 'F.US.KCEH21',
                        display_name: 'KCEH21.ICE_US',
                        company: null,
                        status: 'active',
                        exchanges: ['IFUS'],
                        country: 'US',
                        contract_unit: null,
                        contract_months: 'H21',
                        listing_date: '2019-09-20T03:48:32.000Z',
                        min_price_movement: 1,
                        last_trading_day: '2021-03-19T00:00:00.000Z',
                        cash_settlement_price: 1,
                        trading_hours: null,
                        settlement_day: '2019-09-20T03:48:32.000Z',
                        position_limit: 1,
                        daily_price_limit: 1,
                        cftc_approved: null,
                        updated: '2019-09-20T03:48:32.000Z',
                        company_name: null,
                        GICS_industry_group: null,
                        list_trading_market: ['IFUS'],
                        trading_halt: 0,
                        currency: 'USD',
                        ISIN: '1',
                        display_exchange: 'ICE_US',
                        last_halt: 0,
                        last_haltlift: 0,
                        type: 1,
                        display_master_code: 'KCE.ICE_US',
                        display_master_name: 'Coffee (ICE)',
                        master_code: 'KCE.IFUS',
                        master_name: 'Coffee (ICE)',
                        expiry_date: '032021',
                        first_noti_day: '2021-02-18T00:00:00.000Z',
                        security_name: 'Coffee (ICE): March 2021',
                        origin_symbol: null
                    }
                    ]
                })
            } else if (url === 'undefined/market-info/symbol?master_code=KCE.IFUS' || 'undefined/commodity-info/symbol/qwe') {
                resolve({
                    data: [
                        {
                            symbol: 'KCE.IFUS',
                            class: 'future',
                            initial_margin: 3267,
                            maintenance_margin: 2970,
                            overnight_margin: 0,
                            contract_size: 37500,
                            multiplier: 0.01,
                            unit: 'pound',
                            currency: 'USD',
                            tick_size: 0.05,
                            time_zone: '(GMT- 05:00) Eastern Time (from the 1st Sunday in November every year) - (GMT- 04:00) Eastern Time (from the 2nd Sunday in March every year)',
                            trading_hours: '  - Sunday - Friday, 4:15 a.m - 1:30 p.m ',
                            list_contract: ['3', ' 5', ' 7', ' 9', ' 12'],
                            time_changed: 1559277998219
                        }
                    ]
                })
            }
        }))

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
test('getColumns', () => {
    const abc = x.getColumns()
    const params = {
        data: {
            symbol: 'KCE#.IFUS',
            class: 'future',
            code: 'F.US.KCE',
            display_name: 'KCE#.ICE_US',
            company: null,
            status: 'active',
            exchanges: ['IFUS'],
            country: 'US',
            contract_unit: null,
            contract_months: null,
            listing_date: '2019-11-21T22:34:17.000Z',
            min_price_movement: 1,
            last_trading_day: null,
            cash_settlement_price: 1,
            trading_hours: null,
            settlement_day: '2019-11-21T22:34:17.000Z',
            position_limit: 1,
            daily_price_limit: 1,
            cftc_approved: null,
            updated: '2019-11-21T22:34:17.000Z',
            company_name: null,
            GICS_industry_group: null,
            list_trading_market: ['IFUS'],
            trading_halt: 0,
            currency: 'USD',
            ISIN: '1',
            display_exchange: 'ICE_US',
            last_halt: 0,
            last_haltlift: 0,
            type: 2,
            display_master_code: 'KCE.ICE_US',
            display_master_name: 'Coffee (ICE)',
            master_code: 'KCE.IFUS',
            master_name: 'Coffee (ICE)',
            expiry_date: null,
            first_noti_day: null,
            security_name: 'Coffee (ICE)',
            origin_symbol: null,
            key: 'KCE#.ICE_US_fb382739-66fe-4443-a945-6ad7735c2b73'
        },
        colDef: { field: 'company_name' }
    }
    abc.map(column => {
        if (column.cellRenderer) column.cellRenderer(params)
    })
})
test('getColumns check else isInvalidData', () => {
    const abc = x.getColumns()
    x.isInvalidData = jest.fn().mockImplementation(() => {
        return false
    })
    const params = {
        data: {
            company_name: 'KCE#.IFUS'
        },
        colDef: { field: 'company_name' }
    }
    abc.map(column => {
        if (column.cellRenderer) column.cellRenderer(params)
    })
})
test('getColumns check else isInvalidData', () => {
    const abc = x.getColumns()
    x.isInvalidData = jest.fn().mockImplementation(() => {
        return false
    })
    const params = {
        data: {
            company_name: 'KCE#.IFUS'
        },
        colDef: {}
    }
    abc.map(column => {
        if (column.cellRenderer) column.cellRenderer(params)
    })
})
test('changeConnection', () => {
    x.setState = jest.fn().mockImplementation()
    x.changeConnection(true)
    expect(x.setState).toBeCalled()
})
test('isInvalidData else', () => {
    const params = {
        data: {
            company_name: 'KCE#.IFUS'
        },
        colDef: { field: 'company_name' }
    }
    expect(x.isInvalidData(params)).toBe(false)
})
test('isFutureSymbol else', () => {
    const symbolObj = { ANZ: '123' }
    expect(x.isFutureSymbol(symbolObj)).toBe(false)
})
test('isFutureSymbol else', () => {
    const symbolObj = { ANZ: 'abc' }
    const field = 'abc'
    expect(x.isFutureSymbol(symbolObj, field)).toBe(false)
})
test('isFutureSymbol DEFAULT_STR', () => {
    const symbolObj = { ANZ: {} }
    const field = 'ANZ'
    expect(x.isFutureSymbol(symbolObj, field)).toBe(false)
})
test('isFutureSymbol else', () => {
    expect(x.isFutureSymbol()).toBe(false)
})
test('changeValue', () => {
    x.initialState.openFromMenu = true;
    const symbolObj = {
        symbol: 'LALZ.XLME',
        class: 'future'
    }
    jest.spyOn(functionUtils, 'getSymbolAccountWhenFirstOpenLayout')
        .mockImplementation(() => {
            return { newSymbolObj: { account_id: 1 } }
        })
    x.dataReceivedFromSearchBox = jest.fn()
    x.changeValue(symbolObj)
    expect(x.dataReceivedFromSearchBox).toBeCalled()
})
test('changeValue check if else ', () => {
    x.initialState.openFromMenu = false;
    x.dataReceivedFromSearchBox = jest.fn()
    x.changeValue()
    expect(x.dataReceivedFromSearchBox).not.toBeCalled()
})
test('changeValue check if else ', () => {
    x.initialState.openFromMenu = true;
    x.dataReceivedFromSearchBox = jest.fn()
    jest.spyOn(functionUtils, 'getSymbolAccountWhenFirstOpenLayout')
        .mockImplementation(() => {
            return { newSymbolObj: 1 }
        })
    const symbolObj = {
        symbol: 'KCEH20.IFUS'
    }
    x.changeValue(symbolObj)
    expect(x.dataReceivedFromSearchBox).not.toBeCalled()
})
test('dataReceivedFromSearchBox ', async () => {
    x.requestID = 123
    const symbolObj = {
        class: 'future'
    }
    jest.useFakeTimers();
    x.getSymbolCommodityInfo = jest.fn().mockImplementation(() => {
        return {}
    })
    props1.saveState = jest.fn();
    x.dataReceivedFromSearchBox(symbolObj)
    jest.advanceTimersByTime(400);
    setTimeout(() => {
        expect(props1.saveState).toBeCalled()
    }, 500);
})
test('parseListContract', () => {
    x.state.symbolObj = {
        exchanges: ['abc']
    }
    const listContract = ['3', ' a']
    expect(x.parseListContract(listContract)).toEqual('Mar (H),  a')
})
test('parseListContract catch', () => {
    x.state.symbolObj = {
        exchanges: ['abc']
    }
    const listContract = {}
    expect(x.parseListContract(listContract)).toEqual('')
})
test('parseListContract else', () => {
    x.state.symbolObj = {
        exchanges: ['abc']
    }
    expect(x.parseListContract()).toEqual('')
})
test('parseExpiryDate', () => {
    const value = '122019'
    expect(x.parseExpiryDate(value)).toEqual('Dec2019')
})
test('parseExpiryDate', () => {
    const value = '132019'
    expect(x.parseExpiryDate(value)).toEqual('undefined2019')
})
test('parseExpiryDate', () => {
    const value = 'Dec19'
    expect(x.parseExpiryDate(value)).toEqual('Dec2019')
})
test('refreshData', async () => {
    x.setState = jest.fn().mockImplementation((a, cb) => {
        cb()
    })
    x.getSymbolCommodityInfo = jest.fn()
    x.refreshData('refresh')
    expect(x.getSymbolCommodityInfo).toBeCalled()
})
test('refreshData catch', () => {
    x.state = null
    x.getSymbolCommodityInfo = jest.fn()
    const logger = jest.spyOn(log, 'error');
    x.refreshData('refresh').then(() => {
        expect(logger).toBeCalled()
    })
})
test('refreshData if else', async () => {
    x.setState = jest.fn().mockImplementation((a, cb) => {
        cb()
    })
    x.getSymbolCommodityInfo = jest.fn()
    x.refreshData('abc')
    expect(x.getSymbolCommodityInfo).not.toBeCalled()
})
test('getSymbolCommodityInfo catch', async () => {
    x.setState = jest.fn().mockImplementation((a, cb) => {
        cb()
    })
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({ data: 1 })
        }))
    const sizeColumnsToFit = jest.fn()
    x.opt = { api: { sizeColumnsToFit } }
    x.refreshDataID = 123123
    x.refreshTimeoutID = 12312
    x.setColumn = jest.fn()
    x.setData = jest.fn()
    x.props.loading = jest.fn()
    const logger = jest.spyOn(log, 'log');
    x.getSymbolCommodityInfo({ class: 'future', master_code: 'abc' }, 'abc').then(() => {
        expect(logger).toBeCalled()
    })
})
test('getSymbolCommodityInfo else parentResponse', async () => {
    x.setState = jest.fn().mockImplementation((a, cb) => {
        cb()
    })
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve({ data: 1 })
        }))
    const sizeColumnsToFit = jest.fn()
    x.opt = { api: { sizeColumnsToFit } }
    x.refreshDataID = 123123
    x.refreshTimeoutID = 12312
    x.setColumn = jest.fn()
    x.setData = jest.fn()
    x.props.loading = jest.fn()
    const logger = jest.spyOn(log, 'log');
    x.getSymbolCommodityInfo({ class: 'future', master_code: 'abc' }, 'abc').then(() => {
        expect(x.setState).toBeCalled()
    })
})
test('getSymbolCommodityInfo else parentResponse', async () => {
    x.setState = jest.fn().mockImplementation((a, cb) => {
        cb()
    })
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve({ data: { errorCode: 1 } })
        }))
    const sizeColumnsToFit = jest.fn()
    x.opt = { api: { sizeColumnsToFit } }
    x.refreshDataID = 123123
    x.refreshTimeoutID = 12312
    x.setColumn = jest.fn()
    x.setData = jest.fn()
    x.props.loading = jest.fn()
    const logger = jest.spyOn(log, 'log');
    x.getSymbolCommodityInfo({ class: 'future', master_code: 'abc' }, 'abc').then(() => {
        expect(x.setState).toBeCalled()
    })
})
test('getSymbolCommodityInfo else parentResponse', async () => {
    x.setState = jest.fn().mockImplementation((a, cb) => {
        cb()
    })
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve({ data: 1 })
        }))
    const sizeColumnsToFit = jest.fn()
    x.opt = { api: { sizeColumnsToFit } }
    x.refreshDataID = 123123
    x.refreshTimeoutID = 12312
    x.setColumn = jest.fn()
    x.setData = jest.fn()
    x.props.loading = jest.fn()
    const logger = jest.spyOn(log, 'log');
    x.getSymbolCommodityInfo({ class: 'future', master_code: 'abc' }, 'abc').then(() => {
        expect(x.setState).toBeCalled()
    })
})
test('getSymbolCommodityInfo else parentResponse', async () => {
    x.setState = jest.fn().mockImplementation((a, cb) => {
        cb()
    })
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve(undefined)
        }))
    const sizeColumnsToFit = jest.fn()
    x.opt = { api: { sizeColumnsToFit } }
    x.refreshDataID = 123123
    x.refreshTimeoutID = 12312
    x.setColumn = jest.fn()
    x.setData = jest.fn()
    x.props.loading = jest.fn()
    const logger = jest.spyOn(log, 'log');
    x.getSymbolCommodityInfo({ class: 'future', master_code: 'abc' }, 'abc').then(() => {
        expect(x.setState).toBeCalled()
    })
})
test('getSymbolCommodityInfo else master code', async () => {
    x.setState = jest.fn().mockImplementation((a, cb) => {
        cb()
    })
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve({ data: { errorCode: 1 } })
        }))
    const sizeColumnsToFit = jest.fn()
    x.opt = { api: { sizeColumnsToFit } }
    x.refreshDataID = 123123
    x.refreshTimeoutID = 12312
    x.setColumn = jest.fn()
    x.setData = jest.fn()
    x.props.loading = jest.fn()
    const logger = jest.spyOn(log, 'log');
    x.getSymbolCommodityInfo({ class: 'future', master_code: 'abc' }, 'abc').then(() => {
        expect(x.setState).toBeCalled()
    })
})
test('getSymbolCommodityInfo else master code', async () => {
    x.setState = jest.fn().mockImplementation((a, cb) => {
        cb()
    })
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve({})
        }))
    const sizeColumnsToFit = jest.fn()
    x.opt = { api: { sizeColumnsToFit } }
    x.refreshDataID = 123123
    x.refreshTimeoutID = 12312
    x.setColumn = jest.fn()
    x.setData = jest.fn()
    x.props.loading = jest.fn()
    const logger = jest.spyOn(log, 'log');
    x.getSymbolCommodityInfo({ class: 'future', master_code: 'abc' }, 'abc').then(() => {
        expect(x.setState).toBeCalled()
    })
})
test('getSymbolCommodityInfo else master code', async () => {
    x.setState = jest.fn().mockImplementation((a, cb) => {
        cb()
    })
    jest.spyOn(request, 'getData')
        .mockImplementation(() => {
            return {}
        })
    const sizeColumnsToFit = jest.fn()
    x.opt = { api: { sizeColumnsToFit } }
    x.refreshDataID = 123123
    x.refreshTimeoutID = 12312
    x.setColumn = jest.fn()
    x.setData = jest.fn()
    x.props.loading = jest.fn()
    jest.useFakeTimers();
    const logger = jest.spyOn(log, 'log');
    x.getSymbolCommodityInfo({ class: 'future' }, 'abc').then(() => {
        expect(x.setState).toBeCalled()
    })
    jest.advanceTimersByTime(1000);
})
test('getSymbolCommodityInfo if isFutureSymbol', async () => {
    x.setState = jest.fn().mockImplementation((a, cb) => {
        if (typeof cb === 'function') cb()
    })
    jest.spyOn(request, 'getData')
        .mockImplementation(() => {
            return {}
        })
    const sizeColumnsToFit = jest.fn()
    x.opt = { api: { sizeColumnsToFit } }
    x.refreshDataID = 123123
    x.refreshTimeoutID = 12312
    x.setColumn = jest.fn()
    x.setData = jest.fn()
    x.props.loading = jest.fn()
    jest.useFakeTimers();
    const logger = jest.spyOn(log, 'log');
    x.getSymbolCommodityInfo({ class: 'equity' }).then(() => {
        expect(x.props.loading).toBeCalled()
    })
    jest.advanceTimersByTime(1000);
})
test('getSymbolCommodityInfo else isFutureSymbol', async () => {
    x.setState = jest.fn().mockImplementation((a, cb) => {
        if (typeof cb === 'function') cb()
    })
    jest.spyOn(request, 'getData')
        .mockImplementation(() => {
            return {}
        })
    const sizeColumnsToFit = jest.fn()
    x.opt = { api: { sizeColumnsToFit } }
    x.refreshDataID = 123123
    x.refreshTimeoutID = 12312
    x.setColumn = jest.fn()
    x.setData = jest.fn()
    x.props.loading = jest.fn()
    jest.useFakeTimers();
    const logger = jest.spyOn(log, 'log');
    x.getSymbolCommodityInfo({ class: 'equity' }, 'refresh').then(() => {
        expect(x.props.loading).toBeCalled()
    })
    jest.advanceTimersByTime(1000);
})
test('getSymbolCommodityInfo else isFutureSymbol', async () => {
    x.setState = jest.fn().mockImplementation((a, cb) => {
        if (typeof cb === 'function') cb()
    })
    jest.spyOn(request, 'getData')
        .mockImplementation(() => {
            return {}
        })
    const sizeColumnsToFit = jest.fn()
    x.opt = { api: { sizeColumnsToFit } }
    x.refreshDataID = 123123
    x.refreshTimeoutID = 12312
    x.setColumn = jest.fn()
    x.setData = jest.fn()
    x.props.loading = jest.fn()
    jest.useFakeTimers();
    const logger = jest.spyOn(log, 'log');
    x.getSymbolCommodityInfo({ class: 'equity' }, 'abc').then(() => {
        expect(x.props.loading).toBeCalled()
    })
    jest.advanceTimersByTime(1000);
})
test('componentDidMount', async () => {
    x.opt = {
        api: {
            sizeColumnsToFit: function () {
            }
        }
    }
    x.getSymbolCommodityInfo = jest.fn()
    x.componentDidMount().then(() => {
        expect(x.getSymbolCommodityInfo).toBeCalled()
    })
})
test('componentDidMount', async () => {
    x.subscription = null
    const logger = jest.spyOn(log, 'error');
    x.componentDidMount().then(() => {
        expect(logger).toBeCalled()
    })
})
test('renderValueField', () => {
    const fieldName = { name: 'security', translateKey: 'Code', dataKey: 'display_name' }
    x.state.symbolObj = { abc: 1, company: 2 }
    expect(x.renderValueField(fieldName)).toMatchSnapshot()
})
test('renderValueField', () => {
    const fieldName = { name: 'security', translateKey: 'Code', dataKey: 'display_name' }
    x.state.symbolObj = { abc: 1, company_name: 2 }
    expect(x.renderValueField(fieldName)).toMatchSnapshot()
})
test('renderValueField value null', () => {
    const fieldName = { name: 'masterCode', translateKey: 'Code', dataKey: 'display_name' }
    x.state.symbolObj = { abc: 1, company_name: 2 }
    expect(x.renderValueField(fieldName)).toMatchSnapshot()
})
test('renderValueField value null', () => {
    const fieldName = { name: 'contractStatus', translateKey: 'Code', dataKey: 'display_name' }
    x.state.symbolObj = { abc: 1, company_name: 2 }
    expect(x.renderValueField(fieldName)).toMatchSnapshot()
})
test('renderValueField value null', () => {
    const fieldName = { name: 'lastTradingDay', translateKey: 'Code', dataKey: 'display_name' }
    x.state.symbolObj = { abc: 1, company_name: 2 }
    expect(x.renderValueField(fieldName)).toMatchSnapshot()
})
test('renderValueField value null', () => {
    const fieldName = { name: 'product', translateKey: 'Code', dataKey: 'display_name' }
    x.state.symbolObj = { abc: 1, company_name: 2 }
    expect(x.renderValueField(fieldName)).toMatchSnapshot()
})
test('renderValueField value null', () => {
    const fieldName = { name: 'listedContract', translateKey: 'Code', dataKey: 'display_name' }
    x.state.symbolObj = { abc: 1, company_name: 2 }
    expect(x.renderValueField(fieldName)).toMatchSnapshot()
})
test('renderValueField value null', () => {
    const fieldName = { name: 'lang_maintenance_margin', translateKey: 'Code', dataKey: 'display_name' }
    x.state.symbolObj = { abc: 1, company_name: 2 }
    expect(x.renderValueField(fieldName)).toMatchSnapshot()
})
test('renderValueField value null', () => {
    const fieldName = { name: 'expiryDate', translateKey: 'Code', dataKey: 'display_name' }
    x.state.symbolObj = { abc: 1, company_name: 2 }
    expect(x.renderValueField(fieldName)).toMatchSnapshot()
})
test('renderValueField value null', () => {
    const fieldName = { name: 'noname', translateKey: 'Code', dataKey: 'display_name' }
    x.state.symbolObj = { abc: 1, company_name: 2 }
    expect(x.renderValueField(fieldName)).toMatchSnapshot()
})
test('renderValueField value expiryDate', () => {
    const fieldName = { name: 'expiryDate', translateKey: 'Code', dataKey: 'display_name' }
    x.state.symbolObj = { display_name: 1, company_name: 2 }
    expect(x.renderValueField(fieldName)).toMatchSnapshot()
})
test('renderHeader catch', () => {
    x.renderHeader = null
    const logger = jest.spyOn(log, 'error');
    x.render()
    expect(logger).toBeCalled()
})
test('renderHeader catch', () => {
    x.renderHeader = null
    const fields = {
        left:
            [{ name: 'code', translateKey: 'Code', dataKey: 'display_name' },
            {
                selfChanged: 'security',
                translateKey: 'Security',
                dataKey: 'security_name'
            },
            {
                name: 'exchange',
                translateKey: 'Exchange',
                dataKey: 'display_exchange'
            }]
    }
    const logger = jest.spyOn(log, 'error');
    x.renderSpecificFields(fields, 'left')
    expect(logger).toBeCalled()
})
test('renderSpecificFields selfChanged', () => {
    x.renderHeader = null
    const fields = {
        left:
            [{ name: 'code', translateKey: 'Code', dataKey: 'display_name' },
            {
                selfChanged: 'security',
                translateKey: 'Security',
                dataKey: 'security_name'
            },
            {
                name: 'exchange',
                translateKey: 'Exchange',
                dataKey: 'display_exchange'
            }]
    }
    expect(x.renderSpecificFields(fields, 'left')).toMatchSnapshot()
})
test('renderSpecificFields selfChanged', () => {
    x.isFutureLME = jest.fn().mockImplementation(() => {
        return false
    })
    const fields = {
        left:
            [{ name: 'code', translateKey: 'Code', dataKey: 'display_name' },
            {
                selfChanged: 'security',
                translateKey: 'Security',
                dataKey: 'security_name'
            },
            {
                name: 'exchange',
                translateKey: 'Exchange',
                dataKey: 'display_exchange'
            }]
    }
    expect(x.renderSpecificFields(fields, 'left')).toMatchSnapshot()
})
