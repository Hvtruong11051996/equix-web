import Compoment from '../../src/components/AlertList';
import * as request from '../../src/helper/request';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react'
import dataStorage from '../../src/dataStorage'
import * as storage from '../../src/storage';
import log from '../../src/helper/log';
import * as functionUtils from '../../src/helper/functionUtils';
// import styles from '../../src/components/UserInfor/UserInfor.module.css'
const dataRow = [
    {
        'alert_id': 'e92617f0-eff3-11e9-98d2-31de8706adf5',
        'user_id': 'eq1554351692610',
        'symbol': 'AAL.XNAS',
        'exchange': 'XNAS',
        'alert_type': 'LAST_PRICE',
        'status': 1,
        'target': 0,
        'alert_repeat': null,
        'alert_trigger': 'Above',
        'method': ['EMAIL', 'NOTIFICATION'],
        'email': null,
        'created': 1571216647919,
        'updated': 1573658581296,
        'display_name': 'AAL.NASDAQ',
        'currency': 'USD'
    },
    {
        'alert_id': 'e92617f0-eff3-11e9-98d2-31de8706adf6',
        'user_id': 'eq1554351692616',
        'symbol': 'BHP.ASX',
        'exchange': 'ASX',
        'alert_type': 'LAST_PRICE',
        'status': 1,
        'target': 0,
        'alert_repeat': null,
        'alert_trigger': 'Above',
        'method': ['EMAIL', 'NOTIFICATION'],
        'email': null,
        'created': 1571216647919,
        'updated': 1573658581296,
        'display_name': 'BHP.ASX',
        'currency': 'USD'
    }
]
const symbolInfo = [
    {
        'symbol': 'AAL.XNAS',
        'display_name': 'AAL.NASDAQ',
        'company': 'AMERICAN AIRLINES GROUP INC.',
        'status': 'active',
        'exchanges': ['XNAS'],
        'country': 'US',
        'company_name': 'AMERICAN AIRLINES GROUP INC.',
        'list_trading_market': null,
        'trading_halt': 0,
        'currency': 'USD',
        'ISIN': 'US02376R1023',
        'display_exchange': 'NASDAQ',
        'last_halt': null,
        'last_haltlift': 1560211201398,
        'type': 0,
        'display_master_code': null,
        'display_master_name': null
    },
    {
        'symbol': 'BHP.ASX',
        'display_name': 'BHP.ASX',
        'company': 'AMERICAN AIRLINES GROUP INC.',
        'status': 'active',
        'exchanges': ['ASX'],
        'country': 'US',
        'company_name': 'AMERICAN AIRLINES GROUP INC.',
        'list_trading_market': null,
        'trading_halt': 0,
        'currency': 'USD',
        'ISIN': 'US02376R1023',
        'display_exchange': 'ASX',
        'last_halt': null,
        'last_haltlift': 1560211201398,
        'type': 0,
        'display_master_code': null,
        'display_master_name': null
    }
]
global.MutationObserver = class {
    disconnect() { }
    observe(element, initObject) { }
};
const props1 = {
    loadState: function() {
        return {}
    },
    loading: function() { },
    saveState: function() { }
}
dataStorage.translate = () => { }
dataStorage.userInfo = {
    user_id: '159713'
}
dataStorage.goldenLayout = {
    addComponentToStack: function() { }
}
let x;
beforeEach(() => {
    x = new Compoment(props1);
    x.remove = () => { }
    x.addOrUpdate = () => { }
    x.state = {}
    x.data = dataRow
});
x = new Compoment(props1);
x.state = {}
x.data = dataRow
x.setState = () => { }
class AlertList extends React.Component {
    componentDidMount() {
        // document.querySelector('.modify-symbol').click()
        // document.querySelector('.remove-symbol').click()
    }
    render() {
        storage.func = {
            setStore: (name, emitter) => {
                return { addListener: () => { } };
            },
            getStore: (name) => {
                return { addListener: () => { } };
            },
            emitter: (name, eventName, data) => {
                return { addListener: () => { } };
            }
        }
        return <Compoment {...props1} />
    }
}
test('AlertList render', () => {
    const res = {
        data: dataRow
    }
    jest.spyOn(request, 'getData')
        .mockImplementation((string) => new Promise(resolve => {
            if (string === 'AAL.XNAS') {
                resolve({ data: symbolInfo })
            } else {
                resolve(res)
            }
        }))
    render(<AlertList></AlertList>)
})
test('AlertList render', () => {
    x.render()
})

test('AlertList getDataAlertList no data', () => {
    const res = {
    }
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise(resolve => {
            resolve(res)
        }))
    render(<AlertList></AlertList>)
})

test('AlertList getDataAlertList response.data', () => {
    const res = {
        error: {}
    }
    jest.spyOn(request, 'getData')
        .mockImplementation((string) => new Promise(resolve => {
            resolve(res)
        }))
    render(<AlertList></AlertList>)
})

test('AlertList getDataAlertList reject', () => {
    const res = {}
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            reject(res)
        }))
    render(<AlertList></AlertList>)
})

test('AlertList changeConnection true', () => {
    x.state.isConnected = false
    x.getDataAlertList = jest.fn()
    x.changeConnection(true)
    expect(x.getDataAlertList).toBeCalled();
})

test('AlertList changeConnection false', () => {
    x.getDataAlertList = jest.fn()
    x.changeConnection(false)
    expect(x.getDataAlertList).not.toBeCalled();
})

test('AlertList changeConnection true - true', () => {
    x.state.isConnected = true
    x.getDataAlertList = jest.fn()
    x.changeConnection(true)
    expect(x.getDataAlertList).not.toBeCalled();
})

test('AlertList dataReceivedFromFilterBox', () => {
    x.getDataAlertList = jest.fn()
    x.dataReceivedFromFilterBox('tuan.phan')
    expect(x.getDataAlertList).toBeCalled();
})

test('AlertList refreshData', () => {
    x.getDataAlertList = jest.fn()
    x.refreshData()
    expect(x.getDataAlertList).toBeCalled();
})

test('AlertList getFilterQuickSearch', () => {
    x.setQuickFilter = jest.fn().mockImplementation(() => {
        console.log('getFilterQuickSearch')
    })
    x.getFilterQuickSearch()
    expect(x.setQuickFilter).toBeCalled();
})

test('AlertList handleRowDoubleClicked', () => {
    dataStorage.goldenLayout.addComponentToStack = jest.fn().mockImplementation(() => {
        console.log('handleRowDoubleClicked')
    })
    x.handleRowDoubleClicked({ data: { alert_id: 1, symbol: 2 } })
    expect(dataStorage.goldenLayout.addComponentToStack).toBeCalled();
})

test('componentWillUnmount', () => {
    x.emitID = {}
    const logger = jest.spyOn(log, 'error');
    x.componentWillUnmount()
    expect(logger).toBeCalled()
})

test('getColums if alert_type === "TODAY_VOLUME"', () => {
    const abc = x.getColums()
    const params = {
        data: Object.assign(dataRow[0], { alert_type: 'TODAY_VOLUME' })
    }
    jest.spyOn(functionUtils, 'checkRole')
        .mockImplementation(() => new Promise(resolve => {
            resolve(1)
        }))
    abc.map(column => {
        if (!column) return
        if (column.cellRenderer) column.cellRenderer(params)
        if (column.getQuickFilterText) column.getQuickFilterText(params)
        if (column.valueGetter) column.valueGetter(params)
    })
})

test('getColums if alert_type === "CHANGE_PERCENT"', () => {
    const abc = x.getColums()
    const params = {
        data: Object.assign(dataRow[0], { alert_type: 'CHANGE_PERCENT', status: null })
    }
    jest.spyOn(functionUtils, 'checkRole')
        .mockImplementation(() => new Promise(resolve => {
            resolve(1)
        }))
    abc.map(column => {
        if (!column) return
        if (column.cellRenderer) column.cellRenderer(params)
        if (column.getQuickFilterText) column.getQuickFilterText(params)
        if (column.valueGetter) column.valueGetter(params)
    })
})

test('getColums if alert_type === "CHANGE_POINT"', () => {
    const abc = x.getColums()
    const params = {
        data: Object.assign(dataRow[0], { alert_type: 'CHANGE_POINT' })
    }
    abc.map(column => {
        if (!column) return
        if (column.cellRenderer) column.cellRenderer(params)
        if (column.getQuickFilterText) column.getQuickFilterText(params)
        if (column.valueGetter) column.valueGetter(params)
    })
})

test('getColums if alert_type === "NEWS"', () => {
    const abc = x.getColums()
    const params = {
        data: Object.assign(dataRow[0], { alert_type: 'NEWS', target_news: 'Everything' })
    }
    abc.map(column => {
        if (!column) return
        if (column.cellRenderer) column.cellRenderer(params)
        if (column.getQuickFilterText) column.getQuickFilterText(params)
        if (column.valueGetter) column.valueGetter(params)
    })
})

test('getColums if alert_type === "LAST_PRICE"', () => {
    const abc = x.getColums()
    const params = {
        data: Object.assign(dataRow[1], { alert_type: 'LAST_PRICE', target: 5 })
    }
    abc.map(column => {
        if (!column) return
        if (column.cellRenderer) column.cellRenderer(params)
        if (column.getQuickFilterText) column.getQuickFilterText(params)
        if (column.valueGetter) column.valueGetter(params)
    })
})

test('getColums if alert_type === "LAST_PRICE"', () => {
    const abc = x.getColums()
    const params = {
        data: Object.assign(dataRow[0], { alert_type: 'LAST_PRICE', target: 'YESTERDAY_OPEN' })
    }
    abc.map(column => {
        if (!column) return
        if (column.cellRenderer) column.cellRenderer(params)
        if (column.getQuickFilterText) column.getQuickFilterText(params)
        if (column.valueGetter) column.valueGetter(params)
    })
})

test('RealtimeData with acction "INSERT"', () => {
    x.dicSymbolInfo = { 'AAL.XNAS': symbolInfo[0] }
    x.realtimeData(dataRow[0], 'INSERT')
})

test('RealtimeData with acction "INSERT"', () => {
    x.dicSymbolInfo = { 'AAL.XNAS': symbolInfo[0] }
    x.realtimeData(Object.assign(dataRow[0], { alert_type: 'NEWS', target: 'PriceSensitive#TradingHalt' }), 'INSERT')
})
test('RealtimeData with acction "INSERT"', () => {
    x.dicSymbolInfo = { 'AAL.XNAS': symbolInfo[0] }
    x.filterText = 'AMP'
    x.realtimeData(dataRow[0], 'INSERT')
})

test('RealtimeData with acction "INSERT"', () => {
    x.dicSymbolInfo = {}
    x.getSymbolInfo = jest.fn().mockImplementation(() => {
        x.dicSymbolInfo = {
            'AAA.XNAS': {
                'symbol': 'AAA.XNAS',
                'display_name': 'AAA.NASDAQ',
                'company': 'AMERICAN AIRLINES GROUP INC.',
                'status': 'active',
                'exchanges': ['XNAS'],
                'country': 'US',
                'company_name': 'AMERICAN AIRLINES GROUP INC.',
                'list_trading_market': null,
                'trading_halt': 0,
                'currency': 'USD'
            }
        }
    })
    x.realtimeData({ alert_id: '123456', symbol: 'AAA.XNAS' }, 'INSERT')
})

test('RealtimeData with acction "INSERT"', () => {
    x.dicSymbolInfo = {}
    x.getSymbolInfo = jest.fn().mockImplementation(() => {
        x.dicSymbolInfo = {
            'AAA.XNAS': {
                'symbol': 'AAA.XNAS',
                'display_name': 'AAA.NASDAQ',
                'company': 'AMERICAN AIRLINES GROUP INC.',
                'status': 'active',
                'exchanges': ['XNAS'],
                'country': 'US',
                'list_trading_market': null,
                'trading_halt': 0,
                'currency': 'USD'
            }
        }
    })
    x.realtimeData({ alert_id: '123456', symbol: 'AAA.XNAS' }, 'INSERT')
})

test('RealtimeData with acction "DELETE"', () => {
    x.realtimeData({ alert_id: 'e92617f0-eff3-11e9-98d2-31de8706adf5' }, 'DELETE')
})

test('RealtimeData with acction "UPDATE"', () => {
    x.realtimeData({ alert_id: 'e92617f0-eff3-11e9-98d2-31de8706adf5' }, 'UPDATE')
})

test('RealtimeData with acction "UPDATE"', () => {
    x.realtimeData({ alert_id: 'e92617f0-eff3-11e9-98d2-31de8706adf5', alert_type: 'NEWS', target: 'PriceSensitive#TradingHalt' }, 'UPDATE')
})

test('RealtimeData with acction "UPDATE"', () => {
    x.realtimeData({ alert_id: '123', alert_type: 'NEWS', target: 'PriceSensitive#TradingHalt' }, 'UPDATE')
})

test('RealtimeData with acction NOT ID', () => {
    x.realtimeData({})
})

test('RealtimeData with acction NONE', () => {
    x.realtimeData(dataRow[0], 'NONE')
})
