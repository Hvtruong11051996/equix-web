import Compoment from '../../../src/components/SecurityInfo/SecurityInfo';
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
    resize: function() {
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
    render(<Compoment {...props1} />)
})
test('realTimePrice', () => {
    const data = JSON.parse('{"exchange":"ASX","symbol":"ANZ","quote":{"trade_size":3,"trade_price":25.125,"volume":2911043,"value_traded":71213425.025,"change_point":0.415,"change_percent":1.6795,"number_of_trades":13175,"symbol":"ANZ","exchange":"ASX","check_close":true,"updated":1576470080022,"indicative_price":null,"surplus_volume":null,"side":null},"trades":[{"exchange":"ASX","symbol":"ANZ","price":25.125,"quantity":3,"id":1576470116110,"time":1576470080020,"timeFormat":"11:21:20"},{"exchange":"ASX","symbol":"ANZ","price":25.125,"quantity":3,"id":1576470116111,"time":1576470080022,"timeFormat":"11:21:20"}]}')
    x.realtimePrice(data)
})
// test('changeValue', async () => {
//     x.state.symbol = 'ANZ'
//     x.state.exchange = 'ASX'
//     jest.spyOn(request, 'makePriceLevel1UrlNew').mockImplementation(() => {
//         return { normal: 'undefined/feed-delayed-snapshot/level1/ASX/ANZ' }
//     })
//     jest.spyOn(request, 'getData')
//         .mockImplementation((url) => new Promise(resolve => {
//             if (url === 'undefined/market-info/symbol/ANZ') {
//                 resolve({
//                     data: [{
//                         symbol: 'ANZ',
//                         class: 'equity',
//                         code: 'ANZ',
//                         display_name: 'ANZ.ASX',
//                         company: 'ANZ BANK FPO',
//                         status: 'active',
//                         exchanges: ['ASX'],
//                         country: 'AU',
//                         contract_unit: null,
//                         contract_months: null,
//                         listing_date: null,
//                         min_price_movement: null,
//                         last_trading_day: null,
//                         cash_settlement_price: null,
//                         trading_hours: null,
//                         settlement_day: null,
//                         position_limit: null,
//                         daily_price_limit: null,
//                         cftc_approved: null,
//                         updated: '2019-08-25T22:30:33.000Z',
//                         company_name: 'ANZ BANK FPO',
//                         GICS_industry_group: 'Banks',
//                         list_trading_market:
//                             ['ASX:ASX',
//                                 'N:CXA',
//                                 'CXA:CXACP',
//                                 'N:qCXA',
//                                 'N:BESTMKT',
//                                 'N:FIXED CO'],
//                         trading_halt: 0,
//                         currency: 'AUD',
//                         ISIN: 'AU000000ANZ3',
//                         display_exchange: 'ASX',
//                         last_halt: null,
//                         last_haltlift: null,
//                         type: 0,
//                         display_master_code: null,
//                         display_master_name: null,
//                         master_code: null,
//                         master_name: null,
//                         expiry_date: null,
//                         first_noti_day: null,
//                         security_name: null,
//                         origin_symbol: 'ANZ'
//                     }
//                     ]
//                 })
//             } else if (url === 'undefined/feed-delayed-snapshot/level1/ASX/ANZ') {
//                 resolve({
//                     data: [
//                         JSON.parse('{"exchange":"ASX","symbol":"ANZ","depth":{"ask":{"0":{"symbol":"ANZ","side":"Ask","quantity":350,"number_of_trades":1,"price":24.78,"exchanges":"ASX"},"1":{"symbol":"ANZ","side":"Ask","quantity":1095,"number_of_trades":1,"price":24.8,"exchanges":"ASX"},"2":{"symbol":"ANZ","side":"Ask","quantity":2000,"number_of_trades":1,"price":24.81,"exchanges":"ASX"},"3":{"symbol":"ANZ","side":"Ask","quantity":500,"number_of_trades":1,"price":24.82,"exchanges":"ASX"},"4":{"symbol":"ANZ","side":"Ask","quantity":390,"number_of_trades":1,"price":24.85,"exchanges":"ASX"},"5":{"symbol":"ANZ","side":"Ask","quantity":1000,"number_of_trades":1,"price":24.86,"exchanges":"ASX"},"6":{"symbol":"ANZ","side":"Ask","quantity":1230,"number_of_trades":1,"price":24.87,"exchanges":"ASX"},"7":{"symbol":"ANZ","side":"Ask","quantity":1660,"number_of_trades":1,"price":24.89,"exchanges":"ASX"},"8":{"symbol":"ANZ","side":"Ask","quantity":4030,"number_of_trades":2,"price":24.9,"exchanges":"ASX"},"9":{"symbol":"ANZ","side":"Ask","quantity":3059,"number_of_trades":3,"price":24.92,"exchanges":"ASX"}},"bid":{"0":{"symbol":"ANZ","side":"Bid","quantity":9876,"number_of_trades":5,"price":24.7,"exchanges":"ASX"},"1":{"symbol":"ANZ","side":"Bid","quantity":201,"number_of_trades":1,"price":24.63,"exchanges":"ASX"},"2":{"symbol":"ANZ","side":"Bid","quantity":4220,"number_of_trades":4,"price":24.6,"exchanges":"ASX"},"3":{"symbol":"ANZ","side":"Bid","quantity":2000,"number_of_trades":1,"price":24.58,"exchanges":"ASX"},"4":{"symbol":"ANZ","side":"Bid","quantity":1800,"number_of_trades":2,"price":24.54,"exchanges":"ASX"},"5":{"symbol":"ANZ","side":"Bid","quantity":1000,"number_of_trades":1,"price":24.52,"exchanges":"ASX"},"6":{"symbol":"ANZ","side":"Bid","quantity":19505,"number_of_trades":11,"price":24.5,"exchanges":"ASX"},"7":{"symbol":"ANZ","side":"Bid","quantity":305,"number_of_trades":1,"price":24.45,"exchanges":"ASX"},"8":{"symbol":"ANZ","side":"Bid","quantity":2041,"number_of_trades":2,"price":24.4,"exchanges":"ASX"},"9":{"symbol":"ANZ","side":"Bid","quantity":1050,"number_of_trades":1,"price":24.36,"exchanges":"ASX"}}},"quote":{"exchange":"ASX","symbol":"ANZ","ask_price":24.78,"ask_size":350,"bid_price":24.7,"bid_size":9876,"change_percent":2.0231,"change_point":0.49,"close":24.71,"high":24.87,"low":24.34,"open":24.37,"trade_price":24.71,"trade_size":4128,"updated":1576214241360,"volume":7204353,"previous_close":24.22,"value_traded":171159474.195,"indicative_price":null,"auction_volume":null,"side":null,"surplus_volume":null},"trades":{"798c48ec-6460-4b56-aa39-8be41acb5da2":{"price":24.7503,"quantity":1087,"id":1576214241360,"time":1576214208855},"0bbe03cc-1644-476a-a39b-82d019d30dd6":{"price":24.71,"quantity":4128,"id":1576213857341,"time":1576213824477},"5c4cbb76-48c6-4a1b-94fc-e9ec2a6e6872":{"price":24.71,"quantity":3967,"id":1576213857328,"time":1576213824474},"af7190a6-7a27-44f1-b682-0cd2e6cc46e9":{"price":24.71,"quantity":453,"id":1576213857316,"time":1576213824472},"fe87a0f2-4083-4eae-969b-a940ce86ec5c":{"price":24.71,"quantity":5922,"id":1576213857217,"time":1576213824468},"e2b20e75-0a53-408f-9647-b84e2ad185da":{"price":24.71,"quantity":4313,"id":1576213857216,"time":1576213824468},"56208174-94a6-4482-adfd-216471b3bb20":{"price":24.71,"quantity":1568,"id":1576213857215,"time":1576213824465},"3a358e42-ba41-42bc-8eaf-6cdc0dd2c4c2":{"price":24.71,"quantity":10000,"id":1576213857211,"time":1576213824463},"1dc4ce3c-d93a-4276-aa5c-7f4f918e48ef":{"price":24.71,"quantity":10000,"id":1576213857211,"time":1576213824461},"16424b8f-b5a7-4c98-8945-2c8a34567f3b":{"price":24.71,"quantity":3211,"id":1576213857210,"time":1576213824461},"abd67158-b1d7-4542-a81c-3a0b216cdf45":{"price":24.71,"quantity":1789,"id":1576213857204,"time":1576213824459},"73a55219-1888-420e-9a8f-b3913219ce43":{"price":24.71,"quantity":2211,"id":1576213857204,"time":1576213824457},"b5744268-b210-4122-8adf-f26f21028706":{"price":24.71,"quantity":3644,"id":1576213857203,"time":1576213824455},"58ab2c62-9db4-48fd-aa8c-1c7e19761537":{"price":24.71,"quantity":4145,"id":1576213857202,"time":1576213824453},"377068d9-4d47-42a7-8275-e0f2fca12a79":{"price":24.71,"quantity":10000,"id":1576213857201,"time":1576213824450},"139aba8d-8395-4ec9-8fce-d2604eb02768":{"price":24.71,"quantity":2548,"id":1576213857196,"time":1576213824448},"93c4a808-cf06-440a-9d94-5041f3c57193":{"price":24.71,"quantity":1516,"id":1576213857195,"time":1576213824445},"1ce18e43-383c-4f73-b977-2e8f052687aa":{"price":24.71,"quantity":200,"id":1576213857194,"time":1576213824443},"35615c55-662f-4da2-8fef-cf8b2a72a55a":{"price":24.71,"quantity":100,"id":1576213857187,"time":1576213824443},"9252a4a5-0f2d-41ff-9860-188b90dd437b":{"price":24.71,"quantity":2000,"id":1576213857187,"time":1576213824441},"53f34a43-ab12-436d-a2d0-69f83a56b627":{"price":24.71,"quantity":3636,"id":1576213857186,"time":1576213824436},"9fdab3dd-405a-48e2-a0b8-57f146568bbc":{"price":24.71,"quantity":1936,"id":1576213857179,"time":1576213824436},"79725af7-8c3f-47e5-bd71-98dc28f409d3":{"price":24.71,"quantity":7143,"id":1576213857173,"time":1576213824434},"da81915d-d512-447f-8bc9-545f76bd44d2":{"price":24.71,"quantity":5906,"id":1576213857165,"time":1576213824432},"c02a3614-50e9-4c31-8870-8ad6d3261e68":{"price":24.71,"quantity":449,"id":1576213857165,"time":1576213824428},"2c609e56-8b0a-490d-9088-c3c6a4ae1309":{"price":24.71,"quantity":7770,"id":1576213857158,"time":1576213824427},"83f70be6-fa0d-4bb5-b5ca-2771f9af757a":{"price":24.71,"quantity":750,"id":1576213857158,"time":1576213824424},"1532cb84-3980-46f5-a7c3-c8cca2594d3c":{"price":24.71,"quantity":1031,"id":1576213857157,"time":1576213824422},"ea9e1e9a-57d8-4868-a496-e556e578d332":{"price":24.71,"quantity":8092,"id":1576213857147,"time":1576213824417},"1e47460c-52b3-4960-9b3a-a833885d83d1":{"price":24.71,"quantity":537,"id":1576213857147,"time":1576213824415},"f31a9167-3cd1-47f2-908b-ec5d87cca9fe":{"price":24.71,"quantity":2832,"id":1576213857146,"time":1576213824412},"a8ea8ca8-fb73-4ae9-ac52-cc76c1bfd685":{"price":24.71,"quantity":3647,"id":1576213857145,"time":1576213824410},"bcb5e8d8-b698-4a8d-8450-4e9e110010ee":{"price":24.71,"quantity":6699,"id":1576213857145,"time":1576213824410},"0718f14e-bf6a-4415-b364-5fd1d663331c":{"price":24.71,"quantity":17391,"id":1576213857141,"time":1576213824408},"4fdbbb22-f353-48b3-aa94-cf07c2e3b0a1":{"price":24.71,"quantity":46158,"id":1576213857140,"time":1576213824406},"8c3fbe82-c4f1-475b-b47a-55baf19ecafd":{"price":24.71,"quantity":4615,"id":1576213857139,"time":1576213824404},"4a4ed0db-ab99-48c6-ba92-b3edfadcf10c":{"price":24.71,"quantity":200,"id":1576213857134,"time":1576213824399},"ca711c1d-4a1e-46e9-8750-aa0d449de8c5":{"price":24.71,"quantity":20010,"id":1576213857133,"time":1576213824397},"6d7799d3-fe69-4ec3-8063-08dec07552b4":{"price":24.71,"quantity":1216,"id":1576213857132,"time":1576213824397},"7ac50809-f155-419d-8d97-b1d64feed757":{"price":24.71,"quantity":16301,"id":1576213857131,"time":1576213824395},"5c25167e-c48e-43c3-a0bd-b445298db17c":{"price":24.71,"quantity":200,"id":1576213857126,"time":1576213824393},"c6938491-f72a-42cd-9a11-f5fa763af397":{"price":24.71,"quantity":2000,"id":1576213857125,"time":1576213824387},"b0666e2d-e9a6-4df0-9742-13ee8c2be1b3":{"price":24.71,"quantity":23800,"id":1576213857124,"time":1576213824387},"a4f05854-9967-46fb-afe7-6c0eb7587818":{"price":24.71,"quantity":16865,"id":1576213857123,"time":1576213824386},"d3bd4698-c147-4733-b3cb-2fff59689756":{"price":24.71,"quantity":245,"id":1576213857118,"time":1576213824384},"bd0d1bc5-dc9f-49f0-8809-b51007977003":{"price":24.71,"quantity":289,"id":1576213857117,"time":1576213824382},"67a007e8-2360-4b5f-8349-2578585454e8":{"price":24.71,"quantity":6,"id":1576213857112,"time":1576213824380},"3d429e13-d96b-4a6e-a4f5-1a5da23e0458":{"price":24.71,"quantity":8383,"id":1576213857112,"time":1576213824378},"75070364-100e-4839-bf8f-24bdee6d2019":{"price":24.71,"quantity":36485,"id":1576213857111,"time":1576213824376},"c2fdc0c7-863f-4299-9bce-d774117e4380":{"price":24.71,"quantity":958,"id":1576213857110,"time":1576213824373}}}')
//                     ]
//                 })
//             }
//         }))
//     const symbolObj = {
//         symbol: 'ANZ',
//         class: 'equity',
//         code: 'ANZ',
//         display_name: 'ANZ.ASX',
//         company: 'ANZ BANK FPO',
//         status: 'active',
//         exchanges: ['ASX'],
//         country: 'AU',
//         contract_unit: null,
//         contract_months: null,
//         listing_date: null,
//         min_price_movement: null,
//         last_trading_day: null,
//         cash_settlement_price: null,
//         trading_hours: null,
//         settlement_day: null,
//         position_limit: null,
//         daily_price_limit: null,
//         cftc_approved: null,
//         updated: '2019-08-25T22:30:33.000Z',
//         company_name: 'ANZ BANK FPO',
//         GICS_industry_group: 'Banks',
//         list_trading_market:
//             ['ASX:ASX',
//                 'N:CXA',
//                 'CXA:CXACP',
//                 'N:qCXA',
//                 'N:BESTMKT',
//                 'N:FIXED CO'],
//         trading_halt: 0,
//         currency: 'AUD',
//         ISIN: 'AU000000ANZ3',
//         display_exchange: 'ASX',
//         last_halt: null,
//         last_haltlift: null,
//         type: 0,
//         display_master_code: null,
//         display_master_name: null,
//         master_code: null,
//         master_name: null,
//         expiry_date: null,
//         first_noti_day: null,
//         security_name: null,
//         origin_symbol: 'ANZ'
//     }
//     x.listCb = {
//         depth: () => { },
//         cos: () => { },
//         quote: () => { }
//     }
//     x.changeValue(symbolObj)
// })
test('shouldComponentUpdate', () => {
    dataStorage.checkUpdate = true
    const checkPropsStateShouldUpdate = jest.spyOn(functionUtils, 'checkPropsStateShouldUpdate')
        .mockImplementation(() => {
        })
    x.shouldComponentUpdate('a', 'b')
    expect(checkPropsStateShouldUpdate).toBeCalled()
})
// test('shouldComponentUpdate if', () => {
//     dataStorage.checkUpdate = false
//     const checkPropsStateShouldUpdate = jest.spyOn(functionUtils, 'checkPropsStateShouldUpdate')
//         .mockImplementation(() => {
//         })

//     expect(x.shouldComponentUpdate('a', 'b')).toEqual(true)
// })
