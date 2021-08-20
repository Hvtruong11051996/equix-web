import Compoment from '../../../src/components/TheMostInfomation/TheMostInfomation';
import SearchBox from '../../../src/components/SearchBox/SearchBox';
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
    loadState: function() {
        return {
            data: {
            }
        }
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
    resize: function(cb) {
        cb && cb()
    },
    realtimeCb: function() {
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
dataStorage.translate = () => { }
dataStorage.goldenLayout = {
    addComponentToStack: function() {

    }
}
SearchBox.componentDidMount = () => {
    console.log('this', this)
    this.props.dataReceivedFromSearchBox && this.props.dataReceivedFromSearchBox();
}
let x;
const data = JSON.parse('{"exchange":"ASX","symbol":"ANZ","ask_price":24.94,"ask_size":19318,"bid_price":24.92,"bid_size":8792,"change_percent":-0.3995,"change_point":-0.1,"high":25.2,"low":24.91,"open":25.2,"trade_price":24.93,"trade_size":5,"updated":1576724003668,"volume":6700297,"previous_close":25.03,"value_traded":129278877.105,"indicative_price":null,"auction_volume":null,"side":null,"surplus_volume":null}')
const symbolObj = JSON.parse('{"symbol":"ANZ","class":"equity","code":"ANZ","display_name":"ANZ.ASX","company":"ANZ BANK FPO","status":"active","exchanges":["ASX"],"country":"AU","contract_unit":null,"contract_months":null,"listing_date":null,"min_price_movement":null,"last_trading_day":null,"cash_settlement_price":null,"trading_hours":null,"settlement_day":null,"position_limit":null,"daily_price_limit":null,"cftc_approved":null,"updated":"2019-08-25T22:30:33.000Z","company_name":"ANZ BANK FPO","GICS_industry_group":"Banks","list_trading_market":["ASX:ASX","N:CXA","CXA:CXACP","N:qCXA","N:BESTMKT","N:FIXED CO"],"trading_halt":0,"currency":"AUD","ISIN":"AU000000ANZ3","display_exchange":"ASX","last_halt":null,"last_haltlift":null,"type":0,"display_master_code":null,"display_master_name":null,"master_code":null,"master_name":null,"expiry_date":null,"first_noti_day":null,"security_name":null,"origin_symbol":"ANZ"}')
beforeEach(() => {
    x = new Compoment(props1);
});
class TheMostInfomation extends React.Component {
    componentDidMount() {
        this.obj.symbol && this.obj.symbol(symbolObj, data)
        dataStorage.userInfo = {}
        document.querySelector('.sliderInfo .nextSlider').click()
    }
    render() {
        return <Compoment {...props1} receive={(obj) => {
            this.obj = obj
        }} />
    }
}
class TheMostInfomation1 extends React.Component {
    componentDidMount() {
        this.obj.symbol && this.obj.symbol(symbolObj, data)
        dataStorage.userInfo = {}
        document.querySelector('.sliderInfo .backSlider').click()
    }
    render() {
        return <Compoment {...props1} receive={(obj) => {
            this.obj = obj
        }} />
    }
}
test('UserInfor render', () => {
    render(<TheMostInfomation></TheMostInfomation>)
})
test('UserInfor render', () => {
    render(<TheMostInfomation1></TheMostInfomation1>)
})

test('refreshDataAfterLogin', () => {
    x.setState = jest.fn()
    x.state.data = JSON.parse('{"exchange":"ASX","symbol":"ANZ","ask_price":24.93,"ask_size":3047,"bid_price":24.92,"bid_size":2103,"change_percent":-0.4395,"change_point":-0.11,"high":25.2,"low":24.91,"open":25.2,"trade_price":24.92,"trade_size":1,"updated":1576723033702,"volume":6610025,"previous_close":25.03,"value_traded":127038527.24,"indicative_price":null,"auction_volume":null,"side":null,"surplus_volume":null,"number_of_trades":10926,"check_close":true,"ask_num":19,"bid_num":22}')
    x.refreshDataAfterLogin()
    expect(x.setState).toBeCalled()
})
test(' resizeButton', () => {
    x.setState = jest.fn()
    x.resizeButton(210)
    expect(x.setState).toBeCalled()
})
test('resizeButton catch', () => {
    x.setState = null
    const logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    x.resizeButton(310)
    expect(logger).toBeCalled()
})
test('changeValue', () => {
    dataStorage.userInfo = false
    x.setState = jest.fn().mockImplementation((a, cb) => {
        if (typeof cb === 'function') cb()
    })
    x.getDataCompany = jest.fn()
    const symbolObj = JSON.parse('{"symbol":"ANZ","class":"equity","code":"ANZ","display_name":"ANZ.ASX","company":"ANZ BANK FPO","status":"active","exchanges":["ASX"],"country":"AU","contract_unit":null,"contract_months":null,"listing_date":null,"min_price_movement":null,"last_trading_day":null,"cash_settlement_price":null,"trading_hours":null,"settlement_day":null,"position_limit":null,"daily_price_limit":null,"cftc_approved":null,"updated":"2019-08-25T22:30:33.000Z","company_name":"ANZ BANK FPO","GICS_industry_group":"Banks","list_trading_market":["ASX:ASX","N:CXA","CXA:CXACP","N:qCXA","N:BESTMKT","N:FIXED CO"],"trading_halt":0,"currency":"AUD","ISIN":"AU000000ANZ3","display_exchange":"ASX","last_halt":null,"last_haltlift":null,"type":0,"display_master_code":null,"display_master_name":null,"master_code":null,"master_name":null,"expiry_date":null,"first_noti_day":null,"security_name":null,"origin_symbol":"ANZ"}')
    const data = JSON.parse('{"exchange":"ASX","symbol":"ANZ","ask_price":24.94,"ask_size":19318,"bid_price":24.92,"bid_size":8792,"change_percent":-0.3995,"change_point":-0.1,"high":25.2,"low":24.91,"open":25.2,"trade_price":24.93,"trade_size":5,"updated":1576724003668,"volume":6700297,"previous_close":25.03,"value_traded":129278877.105,"indicative_price":null,"auction_volume":null,"side":null,"surplus_volume":null}')
    x.changeValue(symbolObj, data)
    expect(x.getDataCompany).toBeCalled()
})
test('changeValue else', () => {
    dataStorage.userInfo = true
    x.setState = jest.fn().mockImplementation((a, cb) => {
        if (typeof cb === 'function') cb()
    })
    x.setData = null
    x.oldSymbol = 'FB.XNAS'
    const data = JSON.parse('{"exchange":"ASX","symbol":"ANZ","ask_price":24.94,"ask_size":19318,"bid_price":24.92,"bid_size":8792,"change_percent":-0.3995,"change_point":-0.1,"high":25.2,"low":24.91,"open":25.2,"trade_price":24.93,"trade_size":5,"updated":1576724003668,"volume":6700297,"previous_close":25.03,"value_traded":129278877.105,"indicative_price":null,"auction_volume":null,"side":null,"surplus_volume":null}')
    const symbolObj = JSON.parse('{"class":"equity","code":"ANZ","company":"ANZ BANK FPO","status":"active","country":"AU","contract_unit":null,"contract_months":null,"listing_date":null,"min_price_movement":null,"last_trading_day":null,"cash_settlement_price":null,"trading_hours":null,"settlement_day":null,"position_limit":null,"daily_price_limit":null,"cftc_approved":null,"updated":"2019-08-25T22:30:33.000Z","company_name":"ANZ BANK FPO","GICS_industry_group":"Banks","list_trading_market":["ASX:ASX","N:CXA","CXA:CXACP","N:qCXA","N:BESTMKT","N:FIXED CO"],"trading_halt":0,"currency":"AUD","ISIN":"AU000000ANZ3","display_exchange":"ASX","last_halt":null,"last_haltlift":null,"type":0,"display_master_code":null,"display_master_name":null,"master_code":null,"master_name":null,"expiry_date":null,"first_noti_day":null,"security_name":null,"origin_symbol":"ANZ"}')
    x.changeValue(symbolObj, data)
    const logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    expect(logger).toBeCalled()
})
test('shouldComponentUpdate', () => {
    jest.spyOn(functionUtils, 'checkPropsStateShouldUpdate')
        .mockImplementation(() => {
            return true
        })
    dataStorage.checkUpdate = true
    expect(x.shouldComponentUpdate('a', 'b')).toEqual(true)
})
test('shouldComponentUpdate catch', () => {
    jest.spyOn(functionUtils, 'checkPropsStateShouldUpdate')
        .mockImplementation(() => {
            afjdkajfkjf()
        })
    dataStorage.checkUpdate = true
    x.shouldComponentUpdate('a', 'b')
    const logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    expect(logger).toBeCalled()
})
test('shouldComponentUpdate if', () => {
    dataStorage.checkUpdate = false
    expect(x.shouldComponentUpdate('a', 'b')).toEqual(true)
})
test('shouldComponentUpdate isHidden', () => {
    dataStorage.checkUpdate = false
    expect(x.shouldComponentUpdate('a', { isHidden: 1 })).toEqual(false)
})
test('dataReceivedFromSearchBox', () => {
    x.setState = jest.fn().mockImplementation((a, cb) => {
        if (typeof cb === 'function') cb()
    })
    x.dataReceivedFromSearchBox(symbolObj)
    expect(x.setState).toBeCalled()
})
test('dataReceivedFromSearchBox', () => {
    dataStorage.userInfo = false
    x.getDataCompany = jest.fn()
    x.setState = jest.fn().mockImplementation((a, cb) => {
        if (typeof cb === 'function') cb()
    })
    x.dataReceivedFromSearchBox(symbolObj)
    expect(x.getDataCompany).toBeCalled()
})
test('dataReceivedFromSearchBox', () => {
    dataStorage.userInfo = false
    x.props.send = jest.fn()
    const symbolObj1 = JSON.parse('{"class":"equity","code":"ANZ","display_name":"ANZ.ASX","company":"ANZ BANK FPO","status":"active","exchanges":["ASX"],"country":"AU","contract_unit":null,"contract_months":null,"listing_date":null,"min_price_movement":null,"last_trading_day":null,"cash_settlement_price":null,"trading_hours":null,"settlement_day":null,"position_limit":null,"daily_price_limit":null,"cftc_approved":null,"updated":"2019-08-25T22:30:33.000Z","company_name":"ANZ BANK FPO","GICS_industry_group":"Banks","list_trading_market":["ASX:ASX","N:CXA","CXA:CXACP","N:qCXA","N:BESTMKT","N:FIXED CO"],"trading_halt":0,"currency":"AUD","ISIN":"AU000000ANZ3","display_exchange":"ASX","last_halt":null,"last_haltlift":null,"type":0,"display_master_code":null,"display_master_name":null,"master_code":null,"master_name":null,"expiry_date":null,"first_noti_day":null,"security_name":null,"origin_symbol":"ANZ"}')
    x.getDataCompany = jest.fn()
    x.setState = jest.fn().mockImplementation((a, cb) => {
        if (typeof cb === 'function') cb()
    })
    x.dataReceivedFromSearchBox(symbolObj1)
    expect(x.props.send).not.toBeCalled()
})
test('dataReceivedFromSearchBox catch', () => {
    dataStorage.userInfo = false
    x.getDataCompany = jest.fn().mockImplementation(() => {
        asdads()
    })
    x.setState = jest.fn().mockImplementation((a, cb) => {
        if (typeof cb === 'function') cb()
    })
    const logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    x.dataReceivedFromSearchBox(symbolObj)
    expect(logger).toBeCalled()
})
test('changeColor', () => {
    const value = 10
    expect(x.changeColor(value)).toEqual('cl-up')
})
test('changeConnection else', () => {
    x.refreshData = jest.fn()
    const isConnected = false
    x.needToRefresh = true
    x.changeConnection(isConnected)
    expect(x.refreshData).not.toBeCalled()
})
test('changeConnection', () => {
    x.refreshData = jest.fn()
    const isConnected = true
    x.needToRefresh = true
    x.changeConnection(isConnected)
    expect(x.refreshData).toBeCalled()
})
test('refreshData', () => {
    const evenName = 'abc'
    x.getDataCompany = jest.fn()
    x.refreshData(evenName)
    expect(x.getDataCompany).not.toBeCalled()
})
test('refreshData', () => {
    const evenName = 'refresh'
    x.getDataCompany = jest.fn()
    x.refreshData(evenName)
    expect(x.getDataCompany).toBeCalled()
})
test('refreshData catch', () => {
    const evenName = 'refresh'
    x.getDataCompany = jest.fn().mockImplementation(() => {
        abc()
    })
    const logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    x.refreshData(evenName)
    expect(logger).toBeCalled()
})
test('getDataCompany catch', async () => {
    x.state.symbol = 'ANZ.ASX'
    x.state.data = JSON.parse('{"exchange":"ASX","symbol":"ANZ","ask_price":24.93,"ask_size":3047,"bid_price":24.92,"bid_size":2103,"change_percent":-0.4395,"change_point":-0.11,"high":25.2,"low":24.91,"open":25.2,"trade_price":24.92,"trade_size":1,"updated":1576723033702,"volume":6610025,"previous_close":25.03,"value_traded":127038527.24,"indicative_price":null,"auction_volume":null,"side":null,"surplus_volume":null,"number_of_trades":10926,"check_close":true,"ask_num":19,"bid_num":22}')
    x.getDataCompany()
    const logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    expect(logger).toBeCalled()
})
test('getDataCompany catch', async () => {
    x.state.symbol = 'ANZ.ASX'
    x.convertDataRender = jest.fn().mockImplementation(() => {
        return { disableBtn: 1 }
    })
    x.state.data = JSON.parse('{"exchange":"ASX","symbol":"ANZ","ask_price":24.93,"ask_size":3047,"bid_price":24.92,"bid_size":2103,"change_percent":-0.4395,"change_point":-0.11,"high":25.2,"low":24.91,"open":25.2,"trade_price":24.92,"trade_size":1,"updated":1576723033702,"volume":6610025,"previous_close":25.03,"value_traded":127038527.24,"indicative_price":null,"auction_volume":null,"side":null,"surplus_volume":null,"number_of_trades":10926,"check_close":true,"ask_num":19,"bid_num":22}')
    x.getDataCompany()
    const logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    expect(logger).toBeCalled()
})
test('getDataCompany', async () => {
    x.state.symbol = 'ANZ.ASX'
    x.setData = jest.fn()
    jest.spyOn(request, 'getData')
        .mockImplementation((url) => new Promise(resolve => {
            if (url === 'undefined/market-info/symbol/ANZ.ASX') {
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
                        }
                    ]
                })
            } else if (url === 'undefined/feed-delayed-snapshot/level1//ANZ.ASX') {
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
                        }
                    ]
                })
            }
        }))
    x.convertDataRender = jest.fn().mockImplementation(() => {
        return { disableBtn: 1 }
    })
    x.symbolChanged = 'BHP.ASX'
    x.state.data = JSON.parse('{"exchange":"ASX","symbol":"ANZ","ask_price":24.93,"ask_size":3047,"bid_price":24.92,"bid_size":2103,"change_percent":-0.4395,"change_point":-0.11,"high":25.2,"low":24.91,"open":25.2,"trade_price":24.92,"trade_size":1,"updated":1576723033702,"volume":6610025,"previous_close":25.03,"value_traded":127038527.24,"indicative_price":null,"auction_volume":null,"side":null,"surplus_volume":null,"number_of_trades":10926,"check_close":true,"ask_num":19,"bid_num":22}')
    x.getDataCompany().then(() => {
        expect(x.setData).toBeCalled()
    })
})
test('getDataCompany else', async () => {
    x.isMount = false
    x.state.symbol = 'ANZ.ASX'
    x.setData = jest.fn()
    jest.spyOn(request, 'getData')
        .mockImplementation((url) => new Promise(resolve => {
            if (url === 'undefined/market-info/symbol/ANZ.ASX') {
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
                        }
                    ]
                })
            } else if (url === 'undefined/feed-delayed-snapshot/level1//ANZ.ASX') {
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
                        }
                    ]
                })
            }
        }))
    x.convertDataRender = jest.fn().mockImplementation(() => {
        return { disableBtn: 1 }
    })
    x.state.data = JSON.parse('{"exchange":"ASX","symbol":"ANZ","ask_price":24.93,"ask_size":3047,"bid_price":24.92,"bid_size":2103,"change_percent":-0.4395,"change_point":-0.11,"high":25.2,"low":24.91,"open":25.2,"trade_price":24.92,"trade_size":1,"updated":1576723033702,"volume":6610025,"previous_close":25.03,"value_traded":127038527.24,"indicative_price":null,"auction_volume":null,"side":null,"surplus_volume":null,"number_of_trades":10926,"check_close":true,"ask_num":19,"bid_num":22}')
    x.getDataCompany().then(() => {
        expect(x.setData).toBeCalled()
    })
})
test('getDataCompany else', async () => {
    x.isMount = false
    x.setData = jest.fn()
    x.convertDataRender = jest.fn().mockImplementation(() => {
        return { disableBtn: 1 }
    })
    x.getDataCompany().then(() => {
        expect(x.setData).not.toBeCalled()
    })
})
test('getDataCompany else', async () => {
    x.state.symbol = 'ANZ.ASX'
    x.setData = jest.fn()
    jest.spyOn(request, 'getData')
        .mockImplementation((url) => new Promise(resolve => {
            if (url === 'undefined/market-info/symbol/ANZ.ASX') {
                resolve({
                    data1: [
                    ]
                })
            } else if (url === 'undefined/feed-delayed-snapshot/level1//ANZ.ASX') {
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
                        }
                    ]
                })
            }
        }))
    jest.spyOn(request, 'makePriceLevel1UrlNew')
        .mockImplementation(() => {
            return { delayed1: 'undefined/feed-delayed-snapshot/level1//ANZ.ASX' }
        })
    x.convertDataRender = jest.fn().mockImplementation(() => {
        return { disableBtn: 1 }
    })
    x.state.data = JSON.parse('{"exchange":"ASX","symbol":"ANZ","ask_price":24.93,"ask_size":3047,"bid_price":24.92,"bid_size":2103,"change_percent":-0.4395,"change_point":-0.11,"high":25.2,"low":24.91,"open":25.2,"trade_price":24.92,"trade_size":1,"updated":1576723033702,"volume":6610025,"previous_close":25.03,"value_traded":127038527.24,"indicative_price":null,"auction_volume":null,"side":null,"surplus_volume":null,"number_of_trades":10926,"check_close":true,"ask_num":19,"bid_num":22}')
    x.getDataCompany().then(() => {
        expect(x.setData).toBeCalled()
    })
})
test('getDataCompany', async () => {
    x.state.symbol = 'ANZ.ASX'
    x.setData = jest.fn()
    jest.spyOn(request, 'getData')
        .mockImplementation((url) => new Promise(resolve => {
            if (url === 'undefined/market-info/symbol/ANZ.ASX') {
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
                        }
                    ]
                })
            } else if (url === 'undefined/feed-delayed-snapshot/level1//ANZ.ASX1') {
                resolve({
                    data1: [
                    ]
                })
            }
        }))
    x.convertDataRender = jest.fn().mockImplementation(() => {
        return { disableBtn: 1 }
    })
    jest.spyOn(request, 'makePriceLevel1UrlNew')
        .mockImplementation(() => {
            return { delayed: 'undefined/feed-delayed-snapshot/level1//ANZ.ASX1' }
        })
    x.symbolChanged = 'BHP.ASX'
    x.state.data = JSON.parse('{"exchange":"ASX","symbol":"ANZ","ask_price":24.93,"ask_size":3047,"bid_price":24.92,"bid_size":2103,"change_percent":-0.4395,"change_point":-0.11,"high":25.2,"low":24.91,"open":25.2,"trade_price":24.92,"trade_size":1,"updated":1576723033702,"volume":6610025,"previous_close":25.03,"value_traded":127038527.24,"indicative_price":null,"auction_volume":null,"side":null,"surplus_volume":null,"number_of_trades":10926,"check_close":true,"ask_num":19,"bid_num":22}')
    x.getDataCompany().then(() => {
        expect(x.setData).toBeCalled()
    })
})
test('setData', () => {
    x.setState = jest.fn()
    const data = {}
    x.dicOld = {}
    x.symbolChanged = {}
    x.setData(data)
    expect(x.setState).toBeCalled()
})
test('setData else', () => {
    x.setState = jest.fn()
    const data = {}
    x.dicOld = true
    x.setData(data)
    expect(x.setState).toBeCalled()
})
test('realtimePrice', () => {
    const obj = {}
    x.data = {}
    x.convertDataRender = jest.fn().mockImplementation(() => {
        return { disableBtn: 1 }
    })
    x.realtimePrice(obj)
    expect(x.convertDataRender).not.toBeCalled()
})
test('realtimePrice', () => {
    const obj = {}
    x.convertDataRender = jest.fn().mockImplementation(() => {
        return { disableBtn: 1 }
    })
    x.props.glContainer.isHidden = false
    x.realtimePrice(obj)
    expect(x.convertDataRender).toBeCalled()
})
test('priceClass >', () => {
    x.dicOld = {
        trade_price: 24.73,
        trade_price_class: 'priceUp flash'
    }
    jest.useFakeTimers();
    const data1 = { trade_price: 26 }
    const key = 'trade_price'
    expect(x.priceClass(data1, key)).toEqual('priceUp flash2')
    jest.advanceTimersByTime(400);
})
test('priceClass > else', () => {
    x.dicOld = {
        trade_price: 24.73,
        trade_price_class: 'priceUp',
        trade_price_timeoutId: 123

    }
    jest.useFakeTimers();
    const data1 = { trade_price: 26 }
    const key = 'trade_price'
    expect(x.priceClass(data1, key)).toEqual('priceUp flash')
    jest.advanceTimersByTime(400);
})
test('priceClass <', () => {
    x.dicOld = {
        trade_price: 24.73,
        trade_price_class: 'priceDown flash'
    }
    jest.useFakeTimers();
    const data1 = { trade_price: 24 }
    const key = 'trade_price'
    expect(x.priceClass(data1, key)).toEqual('priceDown flash2')
    jest.advanceTimersByTime(400);
})
test('priceClass < else', () => {
    x.dicOld = {
        trade_price: 24.73,
        trade_price_class: 'priceDown'
    }
    jest.useFakeTimers();
    const data1 = { trade_price: 24 }
    const key = 'trade_price'
    expect(x.priceClass(data1, key)).toEqual('priceDown flash')
    jest.advanceTimersByTime(400);
})
test('priceClass --', () => {
    x.dicOld = {
        trade_price: 24.73,
        trade_price_class: 'priceDown'
    }
    jest.useFakeTimers();
    const data1 = { trade_price: '--' }
    const key = 'trade_price'
    expect(x.priceClass(data1, key)).toEqual('normalText')
    jest.advanceTimersByTime(400);
})
test('priceClass else ', () => {
    x.dicOld = {
        trade_price: 24.73,
        trade_price_timeoutId: 123
    }
    jest.useFakeTimers();
    const data1 = { avg: 25 }
    const key = 'trade_price'
    expect(x.priceClass(data1, key)).toEqual('priceUp')
    jest.advanceTimersByTime(400);
})
test('handleClickBuyButton', () => {
    const requirePin = jest.spyOn(request, 'requirePin')
        .mockImplementation((cb) => {
            cb && cb()
        })
    x.handleClickBuyButton()
    expect(requirePin).toBeCalled()
})
test('handleClickSellButton', () => {
    const requirePin = jest.spyOn(request, 'requirePin')
        .mockImplementation((cb) => {
            cb && cb()
        })
    x.handleClickSellButton()
    expect(requirePin).toBeCalled()
})
test('renderContent', () => {
    const v2 = { label: 'LAST QTY' }
    expect(x.renderContent(v2)).toEqual('--')
})
test('renderContent else', () => {
    const v2 = {
        label: 'LAST QTY',
        value: 0
    }
    expect(x.renderContent(v2)).toEqual(0)
})
test('renderContent if', () => {
    const v2 = {
        label: 'Volume',
        value: 0
    }
    expect(x.renderContent(v2)).toEqual('--')
})
test('handleResize', () => {
    const res = false
    x.setState = jest.fn()
    x.handleResize(res)
})
