import Compoment from '../../../src/components/TimeAndSale/TimeAndSale';
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
let x;
beforeEach(() => {
    x = new Compoment(props1);
});

test('changeValue', () => {
    x.setData = jest.fn()
    const data = JSON.parse('{"cc9d3732-d226-4d41-85a9-613d5ad01815":{"price":24.71,"quantity":135450,"id":1576474747731,"time":1576474711552},"fd5c5ab5-ce12-478c-8ee1-9c80772bf26d":{"price":25.05,"quantity":22500,"id":1576473022119,"time":1576472983522},"c2acc699-cc7f-4589-9506-bda8a897af7a":{"price":25.05,"quantity":20522,"id":1576473022118,"time":1576472983520},"b21a5549-c7b4-48de-bf36-cb2590baf0c5":{"price":25.05,"quantity":1478,"id":1576473022115,"time":1576472983520},"7f695427-a5d7-4d8d-b14f-726d10769757":{"price":25.05,"quantity":5859,"id":1576473022115,"time":1576472983516},"cffee50a-1f7d-4ed0-bd29-26fc16376118":{"price":25.05,"quantity":8495,"id":1576473022114,"time":1576472983516},"cc2f3afd-4c2d-47e2-82ac-3f25ea162353":{"price":25.05,"quantity":8879,"id":1576473022113,"time":1576472983512},"ed6b5a51-4470-40dd-87d3-e886baf411a9":{"price":25.05,"quantity":2426,"id":1576473022094,"time":1576472983512},"f23fdcac-3301-4dff-b362-9505a2527e47":{"price":25.05,"quantity":2255,"id":1576473022094,"time":1576472983508},"f1d87d30-c917-4244-b397-ede676acd840":{"price":25.05,"quantity":200,"id":1576473022093,"time":1576472983508},"c674d14f-4f66-48d9-804b-0fda00e343a1":{"price":25.05,"quantity":500,"id":1576473022075,"time":1576472983504},"6ed14ee2-dc80-4f34-8cd0-9c98af8f3375":{"price":25.05,"quantity":542,"id":1576473022074,"time":1576472983504},"e7738088-71df-48ee-b95e-fe6a9b5f864a":{"price":25.05,"quantity":1189,"id":1576473022055,"time":1576472983499},"55e0625f-ca5f-4309-b065-26a87f4038c8":{"price":25.05,"quantity":10758,"id":1576473022055,"time":1576472983499},"873b0a71-e0b7-42a4-aec8-0d02f56a9f1c":{"price":25.05,"quantity":100,"id":1576473022031,"time":1576472983495},"8b4fbe51-cb7f-446b-9635-54c44ac89abe":{"price":25.05,"quantity":200,"id":1576473022008,"time":1576472983495},"d1388714-e0d6-483a-97b1-77c5c28b47b7":{"price":25.05,"quantity":8256,"id":1576473021980,"time":1576472983495},"7e169064-8823-449f-9778-2e55f9209c2e":{"price":25.05,"quantity":3000,"id":1576473021979,"time":1576472983487},"2cbc21f0-5308-4d99-998b-d5cb73fb0660":{"price":25.05,"quantity":1600,"id":1576473021962,"time":1576472983487},"2be0c808-2cff-4173-aad2-ba6ef92bed61":{"price":25.05,"quantity":3288,"id":1576473021961,"time":1576472983483},"b0cee9ac-6c2d-4a3b-98b1-b076213d0fdc":{"price":25.05,"quantity":15013,"id":1576473021960,"time":1576472983481},"50994f4e-b7a6-4a76-83fb-2635cbeb103e":{"price":25.05,"quantity":2023,"id":1576473021959,"time":1576472983479},"ab6a8d54-2b7d-47ba-ac4f-d722e77371b4":{"price":25.05,"quantity":1494,"id":1576473021946,"time":1576472983479},"74cc3a16-fe74-4b06-b95f-0c8ac6e6f67b":{"price":25.05,"quantity":50,"id":1576473021905,"time":1576472983475},"04315601-4fc6-41a5-9c49-35eaa3d6a06f":{"price":25.05,"quantity":350,"id":1576473021900,"time":1576472983475},"7c5edb39-4c86-4849-982d-dbe58aaf4a67":{"price":25.05,"quantity":1070,"id":1576473021899,"time":1576472983471},"7ab7ff7d-cdb9-4121-9e21-3e85c6b3d929":{"price":25.05,"quantity":406,"id":1576473021890,"time":1576472983471},"fe7cef8e-3c50-4e60-a645-7058445af9e5":{"price":25.05,"quantity":278,"id":1576473021889,"time":1576472983467},"8c86bec9-c2fe-4b2c-8ba4-29d2cabe7bd3":{"price":25.05,"quantity":5077,"id":1576473021887,"time":1576472983467},"5cc6fd22-fc76-4861-83be-bf77fcf9ed3e":{"price":25.05,"quantity":405,"id":1576473021886,"time":1576472983463},"dd9d3c8e-38d7-4d08-a810-5423d4fa4871":{"price":25.05,"quantity":2764,"id":1576473021885,"time":1576472983463},"cb6b9da2-cd10-40f6-9a5c-0b1e9347beae":{"price":25.05,"quantity":79,"id":1576473021881,"time":1576472983459},"c3f50dd0-84c9-4211-aaa9-5bc7b630ee22":{"price":25.05,"quantity":79,"id":1576473021880,"time":1576472983459},"a16e20d9-6d14-4a56-8ce3-a3266996314e":{"price":25.05,"quantity":30,"id":1576473021874,"time":1576472983455},"226ecf86-b289-4421-8669-0e5e2f54ca33":{"price":25.05,"quantity":20095,"id":1576473021837,"time":1576472983455},"c98fa8ab-9a1c-4e45-8ebb-2b579a2eb068":{"price":25.05,"quantity":1250,"id":1576473021835,"time":1576472983451},"80c29b83-8292-411b-817d-496e8fbdd479":{"price":25.05,"quantity":1500,"id":1576473021836,"time":1576472983451},"40ee60dd-ae9e-4876-b4ee-660c43c974ee":{"price":25.05,"quantity":100,"id":1576473021829,"time":1576472983447},"b46723ee-9c15-4559-919c-44f3631b43b5":{"price":25.05,"quantity":500,"id":1576473021828,"time":1576472983447},"f2c1dd6b-67d6-49d2-9b25-5a252469b97c":{"price":25.05,"quantity":5000,"id":1576473021827,"time":1576472983443},"b44181f4-fd2b-4f08-84d8-50cec7a2ed8c":{"price":25.05,"quantity":10000,"id":1576473021827,"time":1576472983443},"409ce450-aaa0-4404-8761-0d401390e679":{"price":25.05,"quantity":60,"id":1576473021821,"time":1576472983439},"f2cd9539-b139-483d-80c2-08693ec0e32a":{"price":25.05,"quantity":16940,"id":1576473021820,"time":1576472983439},"51148dea-2c34-42e9-b200-a6130257de5c":{"price":25.05,"quantity":13732,"id":1576473021811,"time":1576472983435},"6b1723de-bb33-42f2-83bb-eeb1fa90ee25":{"price":25.05,"quantity":3465,"id":1576473021803,"time":1576472983435},"1fc62cd0-5df5-436c-bbdd-f750892096ed":{"price":25.05,"quantity":6000,"id":1576473021776,"time":1576472983431},"42ce52c5-de24-4dba-9a83-b09182ddf1f8":{"price":25.05,"quantity":418,"id":1576473021775,"time":1576472983431},"161687a7-c54f-4ca8-8a04-09a8c62cb0ad":{"price":25.05,"quantity":794,"id":1576473021774,"time":1576472983426},"22b2022d-7441-4876-a425-791f6c3bd15e":{"price":25.05,"quantity":3,"id":1576473021774,"time":1576472983426},"93a697fb-6b68-487b-a0bb-7749ce556def":{"price":25.05,"quantity":11,"id":1576473021773,"time":1576472983426}}')
    x.changeValue({ symbol: 'ANZ' }, data)
    expect(x.setData).toBeCalled()
})
test('changeValue else data = null', () => {
    x.setData = jest.fn()
    x.changeValue({ symbol: 'ANZ' }, null)
    expect(x.setData).toBeCalled()
})
test('changeValue catch', () => {
    x.setData = jest.fn()
    x.setState = null
    const logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    x.changeValue({ symbol: 'ANZ' }, null)
    expect(logger).toBeCalled()
})
test('changedValue', () => {
    x.setData = jest.fn()
    const data = null
    x.changedValue(data)
    expect(x.setData).toBeCalled()
})
test('changedValue', () => {
    x.setData = jest.fn()
    const data = {
        '1fc62cd0 - 5df5- 436c-bbdd - f750892096ed': {
            id: 1576473021776,
            price: 25.05,
            quantity: 6000,
            time: null
        }
    }
    x.changedValue(data)
    expect(x.setData).toBeCalled()
})
test('changedValue catch', () => {
    const data = {
        '1fc62cd0 - 5df5- 436c-bbdd - f750892096ed': {
            id: 1576473021776,
            price: 25.05,
            quantity: 6000,
            time: null
        }
    }
    const logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    x.changedValue(data)
    expect(logger).toBeCalled()
})
test('changeConnection catch', () => {
    x.state = { symbol: 'ANZ.ASX' }
    x.getData = jest.fn().mockImplementation(() => {
        return [4, 9, 16, 25]
    })
    const isConnected = true
    x.needToRefresh = true
    x.changeConnection(isConnected)
    const logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    expect(logger).toBeCalled()
})
test('changeConnection else', () => {
    x.refreshData = jest.fn()
    const isConnected = false
    x.needToRefresh = true
    x.changeConnection(isConnected)
    expect(x.refreshData).not.toBeCalled()
})
test('changeConnection', () => {
    x.setData = jest.fn()
    x.state = { symbol: 'ANZ.ASX' }
    x.getData = jest.fn().mockImplementation(() => {
        return [{ symbol: 4 }, { id: 4 }, { key: 4 }, { index: 4 }]
    })
    const isConnected = true
    x.needToRefresh = true
    x.changeConnection(isConnected)
    expect(x.setData).toBeCalled()
})
test('changeConnection', () => {
    x.setData = jest.fn()
    x.state = { symbol: 'ANZ.ASX' }
    x.getData = jest.fn().mockImplementation(() => {
        return [{ a: 4 }, { b: 4 }, { c: 4 }, { d: 4 }]
    })
    const isConnected = true
    x.needToRefresh = true
    x.changeConnection(isConnected)
    expect(x.setData).toBeCalled()
})
test('refreshData', () => {
    x.setData = jest.fn()
    x.refreshData('abc')
    expect(x.setData).not.toBeCalled()
})
test('refreshData', () => {
    x.state = { symbol: 'ANZ.ASX' }
    x.setData = jest.fn()
    x.refreshData('abc')
    expect(x.setData).not.toBeCalled()
})
test('refreshData', () => {
    x.state = { symbol: 'ANZ.ASX' }
    x.setData = jest.fn()
    x.getData = jest.fn().mockImplementation(() => {
        return [{ a: 4 }, { b: 4 }, { c: 4 }, null]
    })
    x.refreshData('refresh')
    expect(x.setData).toBeCalled()
})
test('realtimePrice', () => {
    x.setData = jest.fn()
    const obj = JSON.parse('[{"exchange":"ASX","symbol":"BHP","price":40.22,"quantity":71,"id":1576549673364,"time":1576549636147}]')
    x.realtimePrice(obj)
    expect(x.setData).not.toBeCalled()
})
test('realtimePrice if', () => {
    x.listData = JSON.parse('[{"price":40.225,"quantity":47,"id":1576549669855,"time":1576549632638,"timeFormat":"09:27:12","index":0,"key":0},{"price":40.225,"quantity":7,"id":1576549669543,"time":1576549632322,"timeFormat":"09:27:12","index":1,"key":1},{"price":40.225,"quantity":62,"id":1576549669542,"time":1576549632320,"timeFormat":"09:27:12","index":2,"key":2},{"price":40.225,"quantity":3,"id":1576549669540,"time":1576549632317,"timeFormat":"09:27:12","index":3,"key":3},{"price":40.22,"quantity":13,"id":1576549669439,"time":1576549632209,"timeFormat":"09:27:12","index":4,"key":4},{"price":40.22,"quantity":62,"id":1576549668691,"time":1576549631460,"timeFormat":"09:27:11","index":5,"key":5},{"price":40.23,"quantity":6,"id":1576549667423,"time":1576549630219,"timeFormat":"09:27:10","index":6,"key":6},{"price":40.23,"quantity":142,"id":1576549667422,"time":1576549630216,"timeFormat":"09:27:10","index":7,"key":7},{"price":40.23,"quantity":23,"id":1576549667421,"time":1576549630213,"timeFormat":"09:27:10","index":8,"key":8},{"price":40.23,"quantity":16,"id":1576549667420,"time":1576549630213,"timeFormat":"09:27:10","index":9,"key":9},{"price":40.23,"quantity":240,"id":1576549667419,"time":1576549630211,"timeFormat":"09:27:10","index":10,"key":10},{"price":40.23,"quantity":53,"id":1576549667415,"time":1576549630209,"timeFormat":"09:27:10","index":11,"key":11},{"price":40.23,"quantity":110,"id":1576549667414,"time":1576549630209,"timeFormat":"09:27:10","index":12,"key":12},{"price":40.23,"quantity":151,"id":1576549667413,"time":1576549630206,"timeFormat":"09:27:10","index":13,"key":13},{"price":40.23,"quantity":38,"id":1576549667411,"time":1576549630206,"timeFormat":"09:27:10","index":14,"key":14},{"price":40.23,"quantity":1,"id":1576549667411,"time":1576549630203,"timeFormat":"09:27:10","index":15,"key":15},{"price":40.23,"quantity":149,"id":1576549667410,"time":1576549630203,"timeFormat":"09:27:10","index":16,"key":16},{"price":40.23,"quantity":499,"id":1576549667409,"time":1576549630200,"timeFormat":"09:27:10","index":17,"key":17},{"price":40.23,"quantity":68,"id":1576549667408,"time":1576549630200,"timeFormat":"09:27:10","index":18,"key":18},{"price":40.23,"quantity":143,"id":1576549667407,"time":1576549630197,"timeFormat":"09:27:10","index":19,"key":19},{"price":40.23,"quantity":181,"id":1576549667406,"time":1576549630197,"timeFormat":"09:27:10","index":20,"key":20},{"price":40.23,"quantity":82,"id":1576549662343,"time":1576549625062,"timeFormat":"09:27:05","index":21,"key":21},{"price":40.23,"quantity":87,"id":1576549649664,"time":1576549612413,"timeFormat":"09:26:52","index":22,"key":22},{"price":40.235,"quantity":60,"id":1576549643027,"time":1576549605820,"timeFormat":"09:26:45","index":23,"key":23},{"price":40.23,"quantity":281,"id":1576549634030,"time":1576549596821,"timeFormat":"09:26:36","index":24,"key":24},{"price":40.23,"quantity":70,"id":1576549634029,"time":1576549596821,"timeFormat":"09:26:36","index":25,"key":25},{"price":40.24,"quantity":46,"id":1576549625558,"time":1576549588335,"timeFormat":"09:26:28","index":26,"key":26},{"price":40.24,"quantity":197,"id":1576549623142,"time":1576549585943,"timeFormat":"09:26:25","index":27,"key":27},{"price":40.23,"quantity":30,"id":1576549623043,"time":1576549585842,"timeFormat":"09:26:25","index":28,"key":28},{"price":40.23,"quantity":100,"id":1576549623038,"time":1576549585839,"timeFormat":"09:26:25","index":29,"key":29},{"price":40.23,"quantity":10,"id":1576549622969,"time":1576549585726,"timeFormat":"09:26:25","index":30,"key":30},{"price":40.23,"quantity":5,"id":1576549622968,"time":1576549585724,"timeFormat":"09:26:25","index":31,"key":31},{"price":40.23,"quantity":72,"id":1576549622950,"time":1576549585721,"timeFormat":"09:26:25","index":32,"key":32},{"price":40.23,"quantity":23,"id":1576549622937,"time":1576549585719,"timeFormat":"09:26:25","index":33,"key":33},{"price":40.23,"quantity":5,"id":1576549622936,"time":1576549585719,"timeFormat":"09:26:25","index":34,"key":34},{"price":40.23,"quantity":1,"id":1576549622935,"time":1576549585717,"timeFormat":"09:26:25","index":35,"key":35},{"price":40.23,"quantity":7,"id":1576549622927,"time":1576549585715,"timeFormat":"09:26:25","index":36,"key":36},{"price":40.22,"quantity":342,"id":1576549615989,"time":1576549578774,"timeFormat":"09:26:18","index":37,"key":37},{"price":40.22,"quantity":110,"id":1576549615988,"time":1576549578771,"timeFormat":"09:26:18","index":38,"key":38},{"price":40.22,"quantity":13,"id":1576549615987,"time":1576549578770,"timeFormat":"09:26:18","index":39,"key":39},{"price":40.225,"quantity":60,"id":1576549615967,"time":1576549578750,"timeFormat":"09:26:18","index":40,"key":40},{"price":40.23,"quantity":56,"id":1576549597528,"time":1576549560304,"timeFormat":"09:26:00","index":41,"key":41},{"price":40.23,"quantity":100,"id":1576549596387,"time":1576549559153,"timeFormat":"09:25:59","index":42,"key":42},{"price":40.22,"quantity":53,"id":1576549595787,"time":1576549558550,"timeFormat":"09:25:58","index":43,"key":43},{"price":40.23,"quantity":214,"id":1576549595573,"time":1576549558352,"timeFormat":"09:25:58","index":44,"key":44},{"price":40.23,"quantity":3,"id":1576549595572,"time":1576549558352,"timeFormat":"09:25:58","index":45,"key":45},{"price":40.23,"quantity":1,"id":1576549595571,"time":1576549558349,"timeFormat":"09:25:58","index":46,"key":46},{"price":40.23,"quantity":71,"id":1576549595568,"time":1576549558349,"timeFormat":"09:25:58","index":47,"key":47},{"price":40.23,"quantity":2,"id":1576549595568,"time":1576549558347,"timeFormat":"09:25:58","index":48,"key":48},{"price":40.23,"quantity":222,"id":1576549595564,"time":1576549558345,"timeFormat":"09:25:58","index":49,"key":49}]')
    x.setData = jest.fn()
    const obj = JSON.parse('[{"exchange":"ASX","symbol":"BHP","price":40.22,"quantity":71,"id":1576549673364,"time":1576549636147}]')
    x.realtimePrice(obj)
    expect(x.setData).not.toBeCalled()
})
test('realtimePrice if', () => {
    x.setData = jest.fn()
    const obj = JSON.parse('{"exchange":"ASX","symbol":"BHP","price":40.22,"quantity":71,"id":1576549673364,"time":1576549636147}')
    x.realtimePrice(obj)
    expect(x.setData).not.toBeCalled()
})
test('realtimePrice if prop', () => {
    x.props.glContainer.isHidden = false
    x.setData = jest.fn()
    const obj = JSON.parse('{"exchange":"ASX","symbol":"BHP","price":40.22,"quantity":71,"id":1576549673364,"time":1576549636147}')
    x.realtimePrice(obj)
    expect(x.setData).toBeCalled()
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
test('column', () => {
    const params = { data: { change_percent: '-1' }, colDef: { field: 'change_percent' } }
    x.column().map(column => {
        if (column.cellRenderer) column.cellRenderer(params)
    })
})
test('constructor', () => {
    x.listDataRender = true
    x.setData = jest.fn()
    x.constructor(props1)
    expect(x.setData).toBeCalled()
})
test('constructor', () => {
    x.listDataRender = true
    x.setData = jest.fn()
    x.opt = {}
    x.opt.fitAll = jest.fn()
    x.constructor(props1)
    expect(x.opt.fitAll).toBeCalled()
})
