import Compoment from '../../../src/components/MarginControlManagement/MarginControlManagement';
import * as request from '../../../src/helper/request';
import React from 'react';
import ReactDom from 'react-dom';
import { cleanup, fireEvent, render } from '@testing-library/react'
import dataStorage from '../../../src/dataStorage'
import log from '../../../src/helper/log';
import * as functionUtils from '../../../src/helper/functionUtils';
import Scroll from '../../../src/components/Inc/Scroll/Scroll';
import * as storage from '../../../src/storage';
import * as streamingFunc from '../../../src/streaming';
import styles from '../../../src/components/PortfolioSummary/PortfolioSummary.module.css'
import showModal from '../../../src/components/Inc/Modal/Modal';

global.MutationObserver = class {
    disconnect() { }
    observe(element, initObject) { }
};

global.Worker = class {
    postMessage() { }
    addEventListener() { }
    disconnect() { }
    observe(element, initObject) { }
};

global.URL.createObjectURL = jest.fn();
let testfunc = jest.spyOn(streamingFunc, 'registerBranch')
let testUnMountFunc = jest.spyOn(streamingFunc, 'unregisterBranch')
const props1 = {
    loadState: function() {
        return {

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
        cb()
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
test('componentWillUnmount', () => {
    x.emitID = { remove: () => { } }
    x.emitConnectionID = { remove: () => { } }
    x.emitRefreshID = { remove: () => { } }
    dataStorage.userInfo = false;
    x.componentWillUnmount()
    expect(testUnMountFunc).not.toBeCalled();
})


test('componentWillUnmount', () => {
    x.emitID = { remove: () => { } }
    x.emitConnectionID = { remove: () => { } }
    x.emitRefreshID = { remove: () => { } }
    dataStorage.userInfo = true;
    x.componentWillUnmount()
    expect(testUnMountFunc).toBeCalled();
})

test('render', () => {
    x.state.connected = true;
    x.render();
    expect(x.render).toMatchSnapshot();
})
test('render', () => {
    x.state.connected = false;
    x.render();
    expect(x.render).toMatchSnapshot();
})


test('getDataMarginControlManagement', () => {
    jest.spyOn(request, 'getData')
        .mockImplementation((url) => new Promise((resolve, reject) => {
            // eslint - disable - next - line prefer - promise - reject - errors
            resolve({ data: 1 })
        }))
    x.setColumn = ([]) => {
    }
    x.column = [1, 2];
    x.setState = jest.fn();
    let logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    x.getDataMarginControlManagement();
})
test('getDataMarginControlManagement', () => {
    jest.spyOn(request, 'getData')
        .mockImplementation((url) => new Promise((resolve, reject) => {
            // eslint - disable - next - line prefer - promise - reject - errors
            if (url === 'undefined/margin/margin-detail/') {
                resolve({ data: [1] })
            } else if (url === 'undefined/margin/level/') {
                resolve({ data: [1] })
            } else if (url === 'undefined/margin/margin-detail/inquery') {
                resolve({ data: [1, 2] })
            }
        }))
    x.setColumn = ([]) => {
    }
    x.column = [1, 2];
    x.setData = jest.fn()
    x.setState = jest.fn();
    x.getDataMarginControlManagement().then(() => {
        expect(x.setData).toBeCalled();
    })

})
test('getDataMarginControlManagement', () => {
    jest.spyOn(request, 'getData')
        .mockImplementation((url) => new Promise((resolve, reject) => {
            // eslint - disable - next - line prefer - promise - reject - errors
            if (url === 'undefined/margin/margin-detail/') {
                resolve({ data: [1, 2] })
            } else if (url === 'undefined/margin/level/') {
                resolve({ data: [1, 2] })
            } else if (url === 'undefined/margin/margin-detail/inquery') {
                resolve({ data: [1, 2] })
            }
        }))
    x.setColumn = ([]) => {
    }
    x.column = [1, 2];
    x.opt = {
        api: {
            setPinnedTopRowData: () => {

            }
        }
    }
    x.setData = jest.fn()
    x.isFirst = true;
    x.setState = jest.fn();
    x.getDataMarginControlManagement(false).then(() => {
        expect(x.setData).toBeCalled();
    })
})
test('renderHeader update = true', () => {
    x.subscription = null;
    let logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    let time = new Date()
    x.state.updated = time.getTime();
    jest.spyOn(functionUtils, 'formatInitTime')
        .mockImplementation((time) => {
            return time;
        })
    x.renderHeader();
    expect(x.renderHeader).toMatchSnapshot();
})
test('renderHeader userInfo = true', () => {
    x.subscription = null;
    let logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    x.state.haveErrorOrder = true;
    x.state.isShowWarning = true;
    x.state.activeEdit = true;
    jest.spyOn(functionUtils, 'checkRole')
        .mockImplementation(() => {
            return true;
        })
    dataStorage.userInfo = {
        user_login_id: 'test'
    }
    x.renderHeader();
    expect(x.renderHeader).toMatchSnapshot();
})
test('renderHeader edit true and connected false', () => {
    x.subscription = null;
    let logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    x.state.haveErrorOrder = true;
    x.state.isShowWarning = true;
    x.state.activeEdit = true;
    x.state.connected = false;
    jest.spyOn(functionUtils, 'checkRole')
        .mockImplementation(() => {
            return true;
        })
    x.renderHeader();
    expect(x.renderHeader).toMatchSnapshot();
})
test('renderHeader connected true and edit false', () => {
    x.subscription = null;
    let logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    x.state.haveErrorOrder = true;
    x.state.isShowWarning = true;
    x.state.activeEdit = false;
    x.state.connected = true;
    jest.spyOn(functionUtils, 'checkRole')
        .mockImplementation(() => {
            return true;
        })
    x.renderHeader();
    expect(x.renderHeader).toMatchSnapshot();
})
test('renderHeader connected false and edit false', () => {
    x.subscription = null;
    let logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    x.state.haveErrorOrder = true;
    x.state.isShowWarning = true;
    x.state.activeEdit = false;
    x.state.connected = false;
    jest.spyOn(functionUtils, 'checkRole')
        .mockImplementation(() => {
            return true;
        })
    x.renderHeader();
    expect(x.renderHeader).toMatchSnapshot();
})
test('addMarginSuccess', () => {
    let data = {
        data: {
            actor: true,
            updated: true
        }
    }
    x.getDataMarginControlManagement = jest.fn();
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    x.addMarginSuccess(data);
    expect(x.setState).toBeCalled();
})

test('addNewMargin', () => {
    x.addNewMargin()
    expect(showModal).toMatchSnapshot();
})

test('addNewMargin connected false', () => {
    x.state.connected = false
    x.addNewMargin()
    expect(x.addNewMargin()).toEqual(undefined)
})
test('hiddenWarning', () => {
    jest.useFakeTimers();
    x.setState = jest.fn();
    x.hiddenWarning();
    jest.runAllTimers();
    expect(x.setState).toBeCalled();
})

test('saveAfterEditGroupMargin 1', () => {
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    x.saveAfterEditGroupMargin();
    x.dicAlertChange = { a: 1 }
    expect(x.setState).toBeCalled();
})
test('saveAfterEditGroupMargin 2', () => {
    jest.useFakeTimers();

    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    x.dicRemoveLevel = [1];
    jest.spyOn(request, 'deleteData')
        .mockImplementation((url) => new Promise((resolve, reject) => {
            // eslint - disable - next - line prefer - promise - reject - errors
            resolve({ data: 1 })
        }))
    jest.spyOn(request, 'putData')
        .mockImplementation((url) => new Promise((resolve, reject) => {
            // eslint - disable - next - line prefer - promise - reject - errors
            resolve({ data: 1 })
        }))
    x.getDataMarginControlManagement = jest.fn();
    x.dicAlertChange = { a: 1 }
    x.saveAfterEditGroupMargin();
    jest.runAllTimers();
    expect(x.setState).toBeCalled();
})
test('saveAfterEditGroupMargin 3', () => {
    jest.spyOn(request, 'deleteData')
        .mockImplementation((url) => new Promise((resolve, reject) => {
            //eslint - disable - next - line prefer - promise - reject - errors
            resolve({ data: 1 })
        }))
    jest.spyOn(request, 'putData')
        .mockImplementation((url) => new Promise((resolve, reject) => {
            //eslint - disable - next - line prefer - promise - reject - errors
            resolve({ data: 1 })
        }))
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    x.dicRemoveLevel = [];
    x.dicEditMarginLevel = { a: 1 };
    x.dicEditMarginRule = { a: 1 };
    x.dicAlertChange = { a: 1 };
    x.getDataMarginControlManagement = jest.fn();
    x.checkUnchange = jest.fn(() => {
        return true
    })
    x.saveAfterEditGroupMargin();
    expect(x.setState).toBeCalled();
})
test('saveAfterEditGroupMargin 4', () => {
    jest.useFakeTimers();
    jest.spyOn(request, 'deleteData')
        .mockImplementation((url) => new Promise((resolve, reject) => {
            //eslint - disable - next - line prefer - promise - reject - errors
            resolve({ data: 1 })
        }))
    jest.spyOn(request, 'putData')
        .mockImplementation((url) => new Promise((resolve, reject) => {
            //eslint - disable - next - line prefer - promise - reject - errors
            reject({ response: { errorCode: 1 } })
        }))
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    x.checkUnchange = jest.fn(() => {
        return true
    })
    x.dicRemoveLevel = [];
    x.dicEditMarginLevel = { a: 1 };
    x.dicEditMarginRule = { a: 1 };
    x.dicAlertChange = [];
    x.getDataMarginControlManagement = jest.fn();
    x.saveAfterEditGroupMargin();
    jest.runAllTimers();
    expect(x.setState).toBeCalled();
})
test('saveAfterEditGroupMargin 5', () => {
    jest.useFakeTimers();
    jest.spyOn(request, 'deleteData')
        .mockImplementation((url) => new Promise((resolve, reject) => {
            //eslint - disable - next - line prefer - promise - reject - errors
            resolve({ data: 1 })
        }))
    jest.spyOn(request, 'putData')
        .mockImplementation((url) => new Promise((resolve, reject) => {
            // eslint - disable - next - line prefer - promise - reject - errors
            reject({ response: { message: 1 } })
        }))
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    x.dicRemoveLevel = [];
    x.dicEditMarginLevel = { a: 1 };
    x.dicEditMarginRule = { a: 1 };
    x.dicAlertChange = [];
    x.checkUnchange = jest.fn(() => {
        return true
    })
    x.getDataMarginControlManagement = jest.fn();
    x.saveAfterEditGroupMargin();
    jest.runAllTimers();
    expect(x.setState).toBeCalled();
})

test('editGroupMargin', () => {
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    x.refreshView = jest.fn();
    x.editGroupMargin();
    expect(x.setState).toBeCalled();
})

test('cancelAfterEditGroupMargin', () => {
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    x.getDataMarginControlManagement = jest.fn()
    x.refreshView = jest.fn();
    x.cancelAfterEditGroupMargin();
    expect(x.setState).toBeCalled();
})

test('groupRowRenderer', () => {
    x.dicMarginType = {
        20: {
            margin_level: "20.00",
            margin_value: 20,
            margin_type: 3,
            actor: "ha.ngo123",
            created_time: 1581411225249,
            updated: 1581411250110,
            description: 'test'
        }
    }
    let data = { node: { key: '20' } }
    x.groupRowRenderer(data);
})
test('groupRowRenderer', () => {
    x.dicMarginType = {
        20: {
            margin_level: "20.00",
            margin_value: 20,
            margin_type: 3,
            actor: "ha.ngo123",
            created_time: 1581411225249,
            updated: 1581411250110,
        }
    }
    let data = { node: { key: '40' } }
    x.groupRowRenderer(data);
})
test('groupRowRenderer', () => {
    x.state.activeEdit = true;
    x.dicEditDataMargin = {
        20: {
            margin_level: "20.00",
            margin_value: 20,
            margin_type: 3,
            actor: "ha.ngo123",
            created_time: 1581411225249,
            updated: 1581411250110,
        }
    }
    let data = { node: { key: '20' } }
    x.groupRowRenderer(data);
})
test('groupRowRenderer test drawimg click', () => {
    x.state.activeEdit = true;
    x.dicEditDataMargin = {
        20: {
            margin_level: "20.00",
            margin_value: 20,
            margin_type: 3,
            actor: "ha.ngo123",
            created_time: 1581411225249,
            updated: 1581411250110,
        }
    }
    let data = { node: { key: '20' } }
    x.editMarginType = jest.fn()
    let testfn = x.groupRowRenderer(data);
    testfn.querySelector('.drawImgBtn').click()
    expect(x.editMarginType).toBeCalled();
})
test('groupRowRenderer test drawimg click', () => {
    x.state.activeEdit = true;
    x.dicEditDataMargin = {
        20: {
            margin_level: "20.00",
            margin_value: 20,
            margin_type: 3,
            actor: "ha.ngo123",
            created_time: 1581411225249,
            updated: 1581411250110,
        }
    }
    let data = { node: { key: '20' } }
    x.state.connected = false;
    x.editMarginType = jest.fn()
    let testfn = x.groupRowRenderer(data);
    testfn.querySelector('.drawImgBtn').click()
    expect(x.editMarginType).not.toBeCalled();
})
test('groupRowRenderer test edit click', () => {
    x.state.activeEdit = true;
    x.dicEditDataMargin = {
        20: {
            margin_level: "20.00",
            margin_value: 20,
            margin_type: 3,
            actor: "ha.ngo123",
            created_time: 1581411225249,
            updated: 1581411250110,
        }
    }
    let data = { node: { key: '20' } }
    x.editDes = jest.fn();
    let testfn = x.groupRowRenderer(data);
    testfn.querySelector('.editImgBtn').click()
    expect(x.editDes).toBeCalled();
})
test('groupRowRenderer test edit click', () => {
    x.state.activeEdit = true;
    x.dicEditDataMargin = {
        20: {
            margin_level: "20.00",
            margin_value: 20,
            margin_type: 3,
            actor: "ha.ngo123",
            created_time: 1581411225249,
            updated: 1581411250110,
        }
    }
    let data = { node: { key: '20' } }
    x.state.connected = false;
    x.editDes = jest.fn();
    let testfn = x.groupRowRenderer(data);
    testfn.querySelector('.editImgBtn').click()
    expect(x.editDes).not.toBeCalled();
})
test('groupRowRenderer test removeImgBtn click', () => {
    x.state.activeEdit = true;
    x.dicEditDataMargin = {
        20: {
            margin_level: "20.00",
            margin_value: 20,
            margin_type: 3,
            actor: "ha.ngo123",
            created_time: 1581411225249,
            updated: 1581411250110,
        }
    }
    let data = { node: { key: '20' } }
    let testfn = x.groupRowRenderer(data);
    x.removeMarginLevel = jest.fn();
    testfn.querySelector('.removeImgBtn').click()
    expect(x.removeMarginLevel).toBeCalled();
})
test('groupRowRenderer test removeImgBtn click', () => {
    x.state.activeEdit = true;
    x.dicEditDataMargin = {
        20: {
            margin_level: "20.00",
            margin_value: 20,
            margin_type: 3,
            actor: "ha.ngo123",
            created_time: 1581411225249,
            updated: 1581411250110,
        }
    }
    let data = { node: { key: '20' } }
    x.state.connected = false;
    let testfn = x.groupRowRenderer(data);
    x.removeMarginLevel = jest.fn();
    testfn.querySelector('.removeImgBtn').click()
    expect(x.removeMarginLevel).not.toBeCalled();
})

test('checkUnchange 1', () => {
    x.dicRemoveLevel = [1]
    x.dicEditMarginLevel = {
        1: {
            data: {
                margin_level: "50.00",
                description: "test",
                margin_type: 4
            }
        }
    }
    x.dicMarginType = {
        '50.00': {
            margin_level: "50.00",
            margin_value: 50,
            margin_type: 0,
            actor: "op.autotest@gmail.com",
            created_time: 1582000367919,
            updated: 1582000367919
        }
    }
    x.dicEditMarginRule = {
        1: {
            branch_id: "BR1557106473069",
            branch_name: "FUTURE MARKET CASH VETTING RULES",
            description: null,
            margin_level: "50.00",
            margin_value: 50,
            margin_rules: ["SENDING_WARNING"],
            actor: "op.daube@gmail.com",
            updated: 1581976217671,
            margin_type: 0,
            alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"]
        }
    }
    x.dicMarginRule = {
        1: ["CANCEL_ALL_ORDERS", "CLOSE_ALL_POSITION"]
    }
    x.dicAlertChange = {
        1: {
            language: "cn",
            alert: ["SEND_EMAIL", "PUSH_NOTIFICATION"]
        }
    }
    x.dicAlertMethods = {
        1: ["SEND_EMAIL", "PUSH_NOTIFICATION"]
    }
    x.dicLanguage = {
        1: 'cn'
    }
    expect(x.checkUnchange()).toEqual(true)
})
test('checkUnchange 2', () => {
    x.dicRemoveLevel = [1]
    x.dicEditMarginLevel = {
        1: {
            data: {
                margin_level: "50.00",
                margin_type: 0
            }
        }
    }
    x.dicMarginType = {
        '50.00': {
            margin_level: "50.00",
            margin_value: 50,
            margin_type: 0,
            actor: "op.autotest@gmail.com",
            created_time: 1582000367919,
            updated: 1582000367919
        }
    }
    x.dicEditMarginRule = {
        1: {
            branch_id: "BR1557106473069",
            branch_name: "FUTURE MARKET CASH VETTING RULES",
            description: null,
            margin_level: "50.00",
            margin_value: 50,
            margin_rules: ["CANCEL_ALL_ORDERS", "CLOSE_ALL_POSITION"],
            actor: "op.daube@gmail.com",
            updated: 1581976217671,
            margin_type: 0,
            alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"]
        }
    }
    x.dicMarginRule = {
        1: ["CANCEL_ALL_ORDERS", "CLOSE_ALL_POSITION"]
    }
    x.dicAlertChange = {
        1: {
            language: "cn",
            alert: ["SEND_EMAIL", "PUSH_NOTIFICATION"]
        }
    }
    x.dicAlertMethods = {
        1: ["SEND_EMAIL", "PUSH_NOTIFICATION"]
    }
    x.dicLanguage = {
        1: 'vn'
    }
    expect(x.checkUnchange()).toEqual(true)
})
test('checkUnchange 3', () => {
    expect(x.checkUnchange()).toEqual(false)
})

test('editMarginType 1', () => {
    x.params = {
        margin_level: 1,
        margin_type: 0
    }
    x.editMarginType();
    expect(showModal).toMatchSnapshot();
})

test('editMarginType connected false', () => {
    x.state.connected = false
    x.editMarginType()
    expect(x.editMarginType()).toEqual(undefined)
})

test('editMarginTypeAction 1', () => {
    x.params = {
        margin_level: 1,
        margin_type: 0
    }
    x.dicEditMarginLevel = {}
    x.refreshView = jest.fn();
    x.editMarginTypeAction();
    expect(x.refreshView).toBeCalled();
})

test('editMarginTypeAction 2', () => {
    x.params = {
        margin_level: 1,
        margin_type: 0
    }
    x.dicEditMarginLevel = {
        'undefined/margin/level/1': {
            data: {
                margin_type: 0
            }
        }
    }
    x.dicEditDataMargin = {
        1: {
            margin_type: 0
        }
    }
    x.refreshView = jest.fn();
    x.editMarginTypeAction();
    expect(x.refreshView).toBeCalled();
})

test('editDesAction 1', () => {
    x.params = {
        margin_level: 1,
        margin_type: 0
    }
    x.dicEditMarginLevel = {}
    x.refreshView = jest.fn();
    x.dicEditDataMargin = {
        1: {
            margin_type: 0,
            description: 'test'
        }
    }
    x.editDesAction();
    expect(x.refreshView).toBeCalled();
})

test('editDesAction 2', () => {
    x.params = {
        margin_level: 1,
        margin_type: 0
    }
    x.dicEditMarginLevel = {
        'undefined/margin/level/1': {
            data: {
                margin_type: 0
            }
        }
    }
    x.dicEditDataMargin = {
        1: {
            margin_type: 0,
            description: 'test'
        }
    }
    x.refreshView = jest.fn();
    x.editDesAction();
    expect(x.refreshView).toBeCalled();
})

test('removeMarginLevel', () => {
    x.getData = jest.fn(() => {
        return [1, 2]
    })
    x.remove = jest.fn(([]) => {
        return true;
    })
    x.removeMarginLevel();
    expect(x.remove).toBeCalled();
})

test('editDes 1', () => {
    let data = {
        margin_level: 1
    }
    x.editDes(data);
    expect(showModal).toMatchSnapshot();
})

test('editDes 2', () => {
    x.state.connected = false;
    let data = {
        margin_level: 1
    }
    expect(x.editDes(data)).toEqual(undefined)
})

test('createColumnHeader', () => {
    let data = {
        data: [{
            branch_id: "BR00000000",
            branch_name: "DEFAULT VETTING RULES",
            alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"],
            alert_language: "en",
            actor: "op.daube@gmail.com",
            created: 1581407486324,
            updated: 1581982285210
        }]
    }
    x.createColumnHeader(data);

})
test('cellRender un active edit', () => {
    let data = {
        data: [{
            branch_id: "BR00000000",
            branch_name: "DEFAULT VETTING RULES",
            alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"],
            alert_language: "en",
            actor: "op.daube@gmail.com",
            created: 1581407486324,
            updated: 1581982285210
        }]
    }
    let datap = [
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "t",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "Notifications",
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL", 'SEND_SMS'],
                    alert_language: "vi",
                    actor: "ha.ngo123",
                    created: 1581407486324,
                    updated: 1582085818826,
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "Notifications",
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL", 'SEND_SMS'],
                    alert_language: "vi",
                    actor: "ha.ngo123",
                    created: 1581407486324,
                    updated: 1582085818826,
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "Notifications",
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    alert_methods: [],
                    alert_language: "vi",
                    actor: "ha.ngo123",
                    created: 1581407486324,
                    updated: 1582085818826,
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "Language",
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"],
                    alert_language: "vi",
                    actor: "ha.ngo123",
                    created: 1581407486324,
                    updated: 1582085818826,
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "Language",
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"],
                    alert_language: "en",
                    actor: "ha.ngo123",
                    created: 1581407486324,
                    updated: 1582085818826,
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "Language",
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"],
                    alert_language: "cn",
                    actor: "ha.ngo123",
                    created: 1581407486324,
                    updated: 1582085818826,
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "Risk Management",
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"],
                    alert_language: "cn",
                    actor: "ha.ngo123",
                    created: 1581407486324,
                    updated: 1582085818826,
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "Pre-Trade Vetting",
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"],
                    alert_language: "cn",
                    actor: "ha.ngo123",
                    created: 1581407486324,
                    updated: 1582085818826,
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "test",
                actionsEnum: 'SENDING_WARNING',
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    description: null,
                    margin_level: "50.00",
                    margin_value: 50,
                    margin_rules: ['SENDING_WARNING',
                        'CANCEL_ALL_ORDERS',
                        'CLOSE_ALL_POSITION',
                        'REDUCE_POSITION_ONLY'],
                    actor: "anh.nguyen@quant-edge.com",
                    updated: 1582099968612,
                    margin_type: 0,
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"]
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "test",
                actionsEnum: 'tes',
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    description: null,
                    margin_level: "50.00",
                    margin_value: 50,
                    margin_rules: ['SENDING_WARNING',
                        'CANCEL_ALL_ORDERS',
                        'CLOSE_ALL_POSITION',
                        'REDUCE_POSITION_ONLY'],
                    actor: "anh.nguyen@quant-edge.com",
                    updated: 1582099968612,
                    margin_type: 0,
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"]
                }
            }
        }
    ]
    x.dicAlertMethods = ['SEND_EMAIL', 'PUSH_NOTIFICATION', 'SEND_SMS'];
    let abc = x.createColumnHeader(data);
    abc.map(column => {
        datap.forEach(xd => {
            if (column.cellRenderer) column.cellRenderer(xd)
            if (column.valueGetter) column.valueGetter(xd)
        })

    })
})
test('cellRender  active edit', () => {
    jest.useFakeTimers();
    x.state.activeEdit = true;
    let data = {
        data: [{
            branch_id: "BR00000000",
            branch_name: "DEFAULT VETTING RULES",
            alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"],
            alert_language: "en",
            actor: "op.daube@gmail.com",
            created: 1581407486324,
            updated: 1581982285210
        }]
    }
    let datap = [
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "t",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "Notifications",
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL", 'SEND_SMS'],
                    alert_language: "vi",
                    actor: "ha.ngo123",
                    created: 1581407486324,
                    updated: 1582085818826,
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "Notifications",
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL", 'SEND_SMS'],
                    alert_language: "vi",
                    actor: "ha.ngo123",
                    created: 1581407486324,
                    updated: 1582085818826,
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "Notifications",
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    alert_methods: [],
                    alert_language: "vi",
                    actor: "ha.ngo123",
                    created: 1581407486324,
                    updated: 1582085818826,
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "Language",
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"],
                    alert_language: "vi",
                    actor: "ha.ngo123",
                    created: 1581407486324,
                    updated: 1582085818826,
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "Language",
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"],
                    alert_language: "en",
                    actor: "ha.ngo123",
                    created: 1581407486324,
                    updated: 1582085818826,
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "Language",
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"],
                    alert_language: "cn",
                    actor: "ha.ngo123",
                    created: 1581407486324,
                    updated: 1582085818826,
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "Risk Management",
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"],
                    alert_language: "cn",
                    actor: "ha.ngo123",
                    created: 1581407486324,
                    updated: 1582085818826,
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "Pre-Trade Vetting",
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"],
                    alert_language: "cn",
                    actor: "ha.ngo123",
                    created: 1581407486324,
                    updated: 1582085818826,
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "test",
                groupColumn: 1,
                actionsEnum: 'SENDING_WARNING',
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    description: null,
                    margin_level: "50.00",
                    margin_value: 50,
                    margin_rules: ['SENDING_WARNING',
                        'CANCEL_ALL_ORDERS',
                        'CLOSE_ALL_POSITION',
                        'REDUCE_POSITION_ONLY'],
                    actor: "anh.nguyen@quant-edge.com",
                    updated: 1582099968612,
                    margin_type: 0,
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"]
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "test",
                groupColumn: 2,
                actionsEnum: 'SENDING_WARNING',
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    description: null,
                    margin_level: "50.00",
                    margin_value: 50,
                    margin_rules: ['SENDING_WARNING',
                        'CANCEL_ALL_ORDERS',
                        'CLOSE_ALL_POSITION',
                        'REDUCE_POSITION_ONLY'],
                    actor: "anh.nguyen@quant-edge.com",
                    updated: 1582099968612,
                    margin_type: 0,
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"]
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "test",
                actionsEnum: 'SENDING_WARNING',
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    description: null,
                    margin_level: "50.00",
                    margin_value: 50,
                    margin_rules: ['CANCEL_ALL_ORDERS',
                        'CLOSE_ALL_POSITION',
                        'REDUCE_POSITION_ONLY'],
                    actor: "anh.nguyen@quant-edge.com",
                    updated: 1582099968612,
                    margin_type: 0,
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"]
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "test",
                actionsEnum: 'SENDING_WARNING',
                groupColumn: 1,
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    description: null,
                    margin_level: "50.00",
                    margin_value: 50,
                    margin_rules: ['CANCEL_ALL_ORDERS',
                        'CLOSE_ALL_POSITION',
                        'REDUCE_POSITION_ONLY'],
                    actor: "anh.nguyen@quant-edge.com",
                    updated: 1582099968612,
                    margin_type: 0,
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"]
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "test",
                actionsEnum: 'actionsEnum',
                groupColumn: 2,
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    description: null,
                    margin_level: "50.00",
                    margin_value: 50,
                    margin_rules: ['CANCEL_ALL_ORDERS',
                        'CLOSE_ALL_POSITION',
                        'REDUCE_POSITION_ONLY'],
                    actor: "anh.nguyen@quant-edge.com",
                    updated: 1582099968612,
                    margin_type: 0,
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"]
                }
            }
        },
        {
            colDef: {
                cellClass: "ag-first-cell",
                resizable: true,
                sortable: false,
                headerName: "Actions List",
                field: "BR00000000",
                menuTabs: [],
                minWidth: 120,
                suppressMovable: true,
                enableRowGroup: true,
                maxWidth: 500
            },
            data: {
                actions: "test",
                actionsEnum: 'tes',
                BR00000000: {
                    branch_id: "BR00000000",
                    branch_name: "DEFAULT VETTING RULES",
                    description: null,
                    margin_level: "50.00",
                    margin_value: 50,
                    margin_rules: ['SENDING_WARNING',
                        'CANCEL_ALL_ORDERS',
                        'CLOSE_ALL_POSITION',
                        'REDUCE_POSITION_ONLY'],
                    actor: "anh.nguyen@quant-edge.com",
                    updated: 1582099968612,
                    margin_type: 0,
                    alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"]
                }
            }
        }
    ]
    x.dicAlertMethods = ['SEND_EMAIL', 'PUSH_NOTIFICATION', 'SEND_SMS'];
    x.opt = {
        api: {
            forEachLeafNode: (cb) => {
                let datatest = {
                    data: {
                        actionsEnum: 'SENDING_WARNING',
                        groupColumn: 1,
                        BR00000000: {
                            branch_id: "BR00000000",
                            branch_name: "DEFAULT VETTING RULES",
                            description: null,
                            margin_level: "50.00",
                            margin_value: 50,
                            margin_rules: ['SENDING_WARNING',
                                'CANCEL_ALL_ORDERS',
                                'CLOSE_ALL_POSITION',
                                'REDUCE_POSITION_ONLY'],
                            actor: "anh.nguyen@quant-edge.com",
                            updated: 1582099968612,
                            margin_type: 0,
                            alert_methods: ["PUSH_NOTIFICATION", "SEND_EMAIL"]
                        }
                    }
                }
                if (typeof cb === 'function') cb(datatest)
            },
            refreshCells: (t) => {
                return t
            }
        },

    }

    let abc = x.createColumnHeader(data);
    abc.map(column => {
        datap.forEach(xd => {
            if (column.cellRenderer) {
                if (xd.data.actions === 'test') {
                    let div = column.cellRenderer(xd)
                    div.click();
                } else {
                    column.cellRenderer(xd)
                }
            }
            if (column.valueGetter) column.valueGetter(xd)
        })
    })
    jest.runAllTimers();
})

test('changeConnection', () => {
    x.setState = jest.fn();
    x.changeConnection(true);

    expect(x.setState).toBeCalled();
})

test('handleOnChangeNotiDropDown', () => {
    let e = {};
    let data = {
        colDef: {
            cellClass: "ag-first-cell",
            resizable: true,
            sortable: false,
            headerName: "Actions List",
            field: "BR00000000",
            menuTabs: [],
            minWidth: 120,
            suppressMovable: true,
            enableRowGroup: true,
            maxWidth: 500
        }
    }
    x.handleOnChangeNotiDropDown(e, data);
})
test('handleOnChangeNotiDropDown', () => {
    let e = {};
    x.dicAlertChange = {
        BR00000000: {}
    }
    let data = {
        colDef: {
            cellClass: "ag-first-cell",
            resizable: true,
            sortable: false,
            headerName: "Actions List",
            field: "BR00000000",
            menuTabs: [],
            minWidth: 120,
            suppressMovable: true,
            enableRowGroup: true,
            maxWidth: 500
        }
    }
    x.handleOnChangeNotiDropDown(e, data);
})
test('handleOnChangeLanguageDropDown', () => {
    let e = {};
    x.dicAlertChange = {
        BR00000000: {}
    }
    let data = {
        colDef: {
            cellClass: "ag-first-cell",
            resizable: true,
            sortable: false,
            headerName: "Actions List",
            field: "BR00000000",
            menuTabs: [],
            minWidth: 120,
            suppressMovable: true,
            enableRowGroup: true,
            maxWidth: 500
        }
    }
    x.handleOnChangeLanguageDropDown(e, e, e, data);
})
test('handleOnChangeLanguageDropDown', () => {
    let e = {};
    x.dicAlertChange = {}
    let data = {
        colDef: {
            cellClass: "ag-first-cell",
            resizable: true,
            sortable: false,
            headerName: "Actions List",
            field: "BR00000000",
            menuTabs: [],
            minWidth: 120,
            suppressMovable: true,
            enableRowGroup: true,
            maxWidth: 500
        }
    }
    x.handleOnChangeLanguageDropDown(e, e, e, data);
})
test('realTimeData', () => {
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    let data = {
        actor: 'test',
        updated: 'test',
    };
    let actionNotify = {};
    let title = 'BRANCH#INSERT';
    x.getDataMarginControlManagement = jest.fn();
    x.realTimeData(data, actionNotify, title);
    expect(x.getDataMarginControlManagement).toBeCalled();
})
test('realTimeData', () => {
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    let data = {
        actor: 'test',
        updated: 'test',
    };
    let actionNotify = {};
    let title = 'BRANCH#DELETE';
    x.getDataMarginControlManagement = jest.fn();
    x.realTimeData(data, actionNotify, title);
    expect(x.getDataMarginControlManagement).toBeCalled();
})
test('realTimeData', () => {
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    x.state.activeEdit = true;
    let data = {
        actor: 'test',
        updated: 'test',
    };
    let actionNotify = {};
    let title = 'BRANCH#DELETE';
    x.getDataMarginControlManagement = jest.fn();
    x.realTimeData(data, actionNotify, title)
    expect(x.getDataMarginControlManagement).not.toBeCalled();
})
test('realTimeData', () => {
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    let data = {
        actor: 'test',
        updated: 'test',
    };
    let actionNotify = {};
    let title = 'BRANCH#D3ELETE';
    x.getDataMarginControlManagement = jest.fn();
    x.realTimeData(data, actionNotify, title)
    expect(x.getDataMarginControlManagement).not.toBeCalled();
})
test('realTimeLevel 1', () => {
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    let data = {
        actor: 'test',
        updated: 'test',
    };
    let actionNotify = {};
    let title = 'BRANCH#D3ELETE';
    x.refreshView = jest.fn();
    x.realTimeLevel(data, actionNotify, title)
    expect(x.refreshView).not.toBeCalled();
})
test('realTimeLevel 2', () => {
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    let data = {
        actor: 'test',
        updated: 'test',
    };
    let actionNotify = {};
    let title = 'MARGIN_GROUP#UPDATE';
    x.refreshView = jest.fn();
    x.realTimeLevel(data, actionNotify, title)
    expect(x.refreshView).toBeCalled();
})
test('realTimeLevel 3', () => {
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    let data = {
        actor: 'test',
        updated: 'test',
    };
    let actionNotify = {};
    let title = 'MARGIN_LEVEL#CREATE';
    x.getDataMarginControlManagement = jest.fn();
    x.realTimeLevel(data, actionNotify, title)
    expect(x.getDataMarginControlManagement).toBeCalled();
})
test('realTimeLevel 4', () => {
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    let data = {
        actor: 'test',
        updated: 'test',
    };
    let actionNotify = {};
    let title = 'MARGIN_LEVEL#UPDATE';
    x.refreshView = jest.fn();
    x.realTimeLevel(data, actionNotify, title)
    expect(x.refreshView).toBeCalled();
})
test('realTimeLevel 5', () => {
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    let data = {
        actor: 'test',
        updated: 'test',
        margin_level: 1
    };
    let actionNotify = {};
    let title = 'MARGIN_LEVEL#DELETE';
    x.refreshView = jest.fn();
    x.getData = jest.fn(() => {
        return [
            {
                groupColumn: 1
            }
        ]
    })
    x.remove = jest.fn();
    x.realTimeLevel(data, actionNotify, title)
    expect(x.refreshView).toBeCalled();
})
test('realTimeLevel 6', () => {
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    let data = {
        actor: 'test',
        updated: 'test',
        margin_level: 1
    };
    let actionNotify = {};
    let title = 'MARGIN_DETAIL#UPDATE';
    x.refreshView = jest.fn();
    x.getData = jest.fn(() => {
        return [
            {
                groupColumn: 1
            }
        ]
    })
    x.realTimeLevel(data, actionNotify, title)
    expect(x.refreshView).toBeCalled();
})
test('realTimeLevel 7', () => {
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    let data = {
        actor: 'test',
        updated: 'test',
        margin_level: 4
    };
    let actionNotify = {};
    let title = 'MARGIN_DETAIL#UPDATE';
    x.refreshView = jest.fn();
    x.getData = jest.fn(() => {
        return [
            {
                groupColumn: 1
            }
        ]
    })
    x.realTimeLevel(data, actionNotify, title)
    expect(x.refreshView).toBeCalled();
})
test('realTimeLevel 8', () => {
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    x.state.activeEdit = true;
    let data = {
        actor: 'test',
        updated: 'test',
        margin_level: 4
    };
    let actionNotify = {};
    let title = 'MARGIN_DETAIL#UPDATE';
    x.refreshView = jest.fn();
    x.getData = jest.fn(() => {
        return [
            {
                groupColumn: 1
            }
        ]
    })
    x.realTimeLevel(data, actionNotify, title)
    expect(x.refreshView).not.toBeCalled();
})
test('test', () => {
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
    dataStorage.userInfo = true;
    let test = render(<Compoment {...props1} />);
})
test('test', () => {
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
    dataStorage.userInfo = false;

    let test = render(<Compoment {...props1} />);
})