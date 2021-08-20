import Compoment from '../../../src/components/ProcessEod/ProcessEod';
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
import showModal from '../../../src/components/Inc/Modal/Modal';
import moment from 'moment';

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
let x;
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

beforeEach(() => {
    x = new Compoment(props1);
});

// test('componentWillUnmount', () => {
//     x.emitID = { remove: () => { } }
//     x.emitConnectionID = { remove: () => { } }
//     x.emitRefreshID = { remove: () => { } }
//     dataStorage.userInfo = false;
//     x.componentWillUnmount()
//     expect(testUnMountFunc).not.toBeCalled();
// })

// test('changeConnection', () => {
//     x.setState = jest.fn();
//     x.changeConnection(true);

//     expect(x.setState).toBeCalled();
// })

// test('getGridData 1', () => {
//     x.setPage = jest.fn();
//     jest.spyOn(request, 'getData')
//         .mockImplementation((url) => new Promise((resolve, reject) => {
//             // eslint - disable - next - line prefer - promise - reject - errors
//             resolve({ data: 1 })
//         }))
//     x.getGridData();
// })
// test('getGridData 2', () => {
//     x.setPage = jest.fn();
//     jest.spyOn(request, 'getData')
//         .mockImplementation((url) => new Promise((resolve, reject) => {
//             // eslint - disable - next - line prefer - promise - reject - errors
//             resolve({ data: '1' })
//         }))
//     x.getGridData();
// })

// test('getGridData 3', () => {
//     x.setPage = jest.fn();
//     jest.spyOn(request, 'getData')
//         .mockImplementation((url) => new Promise((resolve, reject) => {
//             // eslint - disable - next - line prefer - promise - reject - errors
//             resolve({
//                 data: {
//                     data: [1, 2]
//                 }
//             })
//         }))
//     x.setData = jest.fn();
//     x.getGridData();
// })
// test('getGridData 4', () => {
//     x.setPage = jest.fn();
//     jest.spyOn(request, 'getData')
//         .mockImplementation((url) => new Promise((resolve, reject) => {
//             // eslint - disable - next - line prefer - promise - reject - errors
//             reject({
//                 data: {
//                     data: [1, 2]
//                 }
//             })
//         }))
//     x.setData = jest.fn();
//     x.getGridData();
// })
// test('pageChanged', () => {
//     x.getGridData = jest.fn();
//     x.pageChanged();
//     expect(x.getGridData).toBeCalled();
// })
// test('pageChanged 1', () => {
//     x.getGridData = jest.fn();
//     x.page_id = 1
//     x.pageChanged(1);
//     expect(x.getGridData).not.toBeCalled();

// })

test('getProcessTime', () => {
    x.getProcessTime();
})
// test('realTimeData 1', () => {
//     let data = {
//         action_details: 'test'
//     }
//     x.addOrUpdate = jest.fn();
//     x.setPage = jest.fn();
//     x.objPage = {}
//     x.realTimeData(data);
// })

// test('realTimeData 2', () => {
//     let data = {
//         test: 'test'
//     }
//     x.addOrUpdate = jest.fn();
//     x.setPage = jest.fn();
//     x.objPage = {}
//     x.realTimeData(data);
// })

// test('Indexes', () => {
//     storage.func = {
//         setStore: (name, emitter) => {
//             return { addListener: () => { } };
//         },
//         getStore: (name) => {
//             return {
//                 addListener: () => {
//                     return { remove: () => { } }
//                 }
//             };
//         },
//         emitter: (name, eventName, data) => {
//             return {
//                 addListener: () => {
//                     return { remove: () => { } }
//                 }
//             };
//         }
//     }
//     dataStorage.userInfo = 1;
//     x.opt = {
//         fitAll: (e) => {
//             return e
//         }
//     }
//     render(<Compoment {...props1} />)
// })
// test('Indexes', () => {
//     storage.func = {
//         setStore: (name, emitter) => {
//             return { addListener: () => { } };
//         },
//         getStore: (name) => {
//             return {
//                 addListener: () => {
//                     return { remove: () => { } }
//                 }
//             };
//         },
//         emitter: (name, eventName, data) => {
//             return {
//                 addListener: () => {
//                     return { remove: () => { } }
//                 }
//             };
//         }
//     }
//     dataStorage.userInfo = 0;
//     render(<Compoment {...props1} />)
// })
