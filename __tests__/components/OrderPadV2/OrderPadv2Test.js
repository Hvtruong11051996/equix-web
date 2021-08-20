import Compoment from '../../../src/components/OrderPadV2/OrderPadV2';
import * as request from '../../../src/helper/request';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react'
import dataStorage from '../../../src/dataStorage'
import * as functionUtils from '../../../src/helper/functionUtils'
import log from '../../../src/helper/log';
import { UndoVariantIcon } from 'mdi-react';
import * as storage from '../../../src/storage';
global.Worker = class {
    postMessage() { }
    addEventListener() { }
    disconnect() { }
    observe(element, initObject) { }
};
global.URL.createObjectURL = jest.fn();

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
dataStorage.translate = () => { }
dataStorage.accountInfo = {}
dataStorage.dataSetting = {}
dataStorage.userInfo = {}
let x;
beforeEach(() => {
    x = new Compoment(props1);
});
test('orderPadV2', () => {
    jest.spyOn(request, 'getUrlTotalPosition')
        .mockImplementation(() => {
            return 'urlBalancesAccount'
        })
    jest.spyOn(request, 'getData')
        .mockImplementation((url) => new Promise(resolve => {
            if (url === 'undefined/user/account?account_id=undefined') {
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
                        min_price_movement: null
                    }]
                })
            }
            if (url === 'urlBalancesAccount') {
                resolve({

                })
            }
        }))
    render(<Compoment {...props1} />)
})
