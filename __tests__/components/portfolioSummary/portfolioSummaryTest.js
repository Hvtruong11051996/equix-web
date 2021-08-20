import Compoment from '../../../src/components/PortfolioSummary/PortfolioSummary';
import * as request from '../../../src/helper/request';
import React from 'react';
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
let testfunc = jest.spyOn(streamingFunc, 'unregisterOrders')
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

test('portfolioSummary', () => {
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
    let test = render(<Compoment {...props1} />);
})
test('render', () => {
    x.state.accountObj.account_id = 1;
    x.render();
    expect(x.render).toMatchSnapshot();
})
test('render', () => {
    x.state = null;
    let logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    x.render();
    expect(logger).toBeCalled();
})
test('componentDidMount', () => {
    x.subscription = null;
    let logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    x.componentDidMount();
    expect(logger).toBeCalled();
})
test('changeAccount', () => {
    let data = true;
    jest.spyOn(functionUtils, 'getSymbolAccountWhenFirstOpenLayout')
        .mockImplementation(() => {
            return { newAccount: { account_id: 1 } };
        })
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    x.state = { accountObj: { account_id: 1 } }

    x.changeAccount(data);
    expect(testfunc).not.toBeCalled();
})

test('componentWillUnmount', () => {
    x.emitID = { remove: () => { } }
    x.emitConnectionID = { remove: () => { } }
    x.emitRefreshID = { remove: () => { } }
    x.state.accountObj.account_id = 1;
    x.componentWillUnmount()
    expect(testfunc).toBeCalled();
})
test('componentWillUnmount', () => {
    x.state = null
    let logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    x.componentWillUnmount()
    expect(logger).toBeCalled();
})

test('changeAccount', () => {
    let data = false;
    jest.spyOn(functionUtils, 'getSymbolAccountWhenFirstOpenLayout')
        .mockImplementation(() => {
            return { newAccount: {} };
        })
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    x.changeAccount(data);
    expect(x.setState).not.toBeCalled();
})
test('changeAccount', () => {
    let data = true;
    jest.spyOn(functionUtils, 'getSymbolAccountWhenFirstOpenLayout')
        .mockImplementation(() => {
            return { newAccount: { account_id: 1 } };
        })
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    x.changeAccount(data);
    expect(x.setState).toBeCalled();
})

test('shouldComponentUpdate', () => {
    let logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    x.shouldComponentUpdate();
    expect(logger).toBeCalled()
})

test('shouldComponentUpdate', () => {
    let nextState = { isHidden: true };
    expect(x.shouldComponentUpdate({}, nextState)).toEqual(false);
})

test('shouldComponentUpdate', () => {
    let nextState = { isHidden: false };
    expect(x.shouldComponentUpdate({}, nextState)).toEqual(true);
})
test('shouldComponentUpdate', () => {
    let nextState = { isHidden: false };
    dataStorage.checkUpdate = true;
    let checkPropsStateShouldUpdate = jest.spyOn(functionUtils, 'checkPropsStateShouldUpdate')
        .mockImplementation(() => { })
    x.shouldComponentUpdate({}, nextState)
    expect(checkPropsStateShouldUpdate).toBeCalled();
})
test('shouldComponentUpdate', () => {
    let nextState = null;
    let logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    x.shouldComponentUpdate({}, nextState)
    expect(logger).toBeCalled();
})
test('refreshData', () => {
    x.state.data = { a: 1, b: 2, c: 3 };
    const logger = jest.spyOn(log, 'log');
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    x.getDataAccount = jest.fn();
    x.refreshData('refresh');
    expect(x.getDataAccount).toBeCalled();
})

test('refreshData', () => {
    x.state.data = { a: 1, b: 2, c: 3 };
    const logger = jest.spyOn(log, 'log');
    x.setState = jest.fn(({ }, cb) => {
        if (typeof cb === 'function') cb()
    });
    x.getDataAccount = jest.fn();
    x.refreshData('reabcfresh');
    expect(x.getDataAccount).not.toBeCalled();
})

test('refreshData', () => {
    x.state = null;
    const logger = jest.spyOn(log, 'error');
    x.refreshData('refresh');
    expect(logger).toBeCalled();
})

test('mappingObject', () => {
    x.setState = jest.fn()
    x.mappingObject();
    expect(x.setState).toBeCalled();
})

test('realtimeDataBalances', () => {
    x.setState = jest.fn()
    x.state.accountObj.account_id = 1
    x.realtimeDataBalances({ account_id: 1 });
    expect(x.setState).toBeCalled();
})

test('realtimeDataBalances', () => {
    x.setState = jest.fn()
    x.state.accountObj.account_id = 2
    x.realtimeDataBalances({ account_id: 1 });
    expect(x.setState).not.toBeCalled();
})

test('dataReceivedFromSearchAccount', () => {
    x.changeAccount = jest.fn()
    x.dataReceivedFromSearchAccount(9999);
    expect(x.changeAccount).toBeCalled();
})

test('dataReceivedFromSearchAccount', () => {
    x.changeAccount = jest.fn()
    x.dataReceivedFromSearchAccount(null);
    expect(x.changeAccount).not.toBeCalled();
})

test('getCashByAccount full complete', () => {
    let getData = jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise(resolve => {
            resolve({ data: { available_balance: 1 } })
        }))
    x.account_id = 1;
    x.setState = jest.fn()
    x.getCashByAccount();
    setTimeout(() => {
        expect(x.setState).toHaveBeenCalled();
    }, 0);
})

test('getCashByAccount getData get null  data', () => {
    let getData = jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise(resolve => {
            resolve({ data: null })
        }))
    x.account_id = 1;
    x.setState = jest.fn()
    x.getCashByAccount();
    setTimeout(() => {
        expect(x.setState).toHaveBeenCalled();
    }, 0);
})

test('getCashByAccount getData not work', () => {
    let logger = jest.spyOn(log, 'log').mockImplementation(() => { });
    let getData = jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise(() => {
            reject('error')
        }))
    x.account_id = 1;
    x.setState = jest.fn()
    x.getCashByAccount();
    setTimeout(() => {
        expect(logger).toHaveBeenCalled();
    }, 0);
})

test('getCashByAccount get error before getData', () => {
    let logger = jest.spyOn(log, 'error').mockImplementation(() => { });
    x.props.loading = null;
    x.account_id = 1;
    x.getCashByAccount();
    expect(logger).toHaveBeenCalled();
})

test('getCashByAccount no account_id', () => {
    x.account_id = 0;
    props1.loading = jest.fn();
    x.getCashByAccount();
    expect(props1.loading).not.toBeCalled();
})

test('tempFormatDigit', () => {
    x.state.currency = 'USD';
    x.tempFormatDigit(123, 'red');
    expect(x.tempFormatDigit).toMatchSnapshot();
})

test('tempFormatDigit', () => {
    x.tempFormatDigit('123', 'red');
    expect(x.tempFormatDigit).toMatchSnapshot();
})

test('tempFormatDigit', () => {
    x.tempFormatDigit('sad', '');
    expect(x.tempFormatDigit).toMatchSnapshot();
})
test('tempFormatDigit', () => {
    x.tempFormatDigit('');
    expect(x.tempFormatDigit).toMatchSnapshot();
})

test('tempFormatDigitPercent', () => {
    x.tempFormatDigitPercent(123);
    expect(x.tempFormatDigitPercent).toMatchSnapshot();
})

test('tempFormatDigitPercent', () => {
    x.tempFormatDigitPercent('123');
    expect(x.tempFormatDigitPercent).toMatchSnapshot();
})
test('tempFormatDigitPercent', () => {
    x.tempFormatDigitPercent('--');
    expect(x.tempFormatDigitPercent).toMatchSnapshot();
})
test('tempFormatDigitPercent', () => {
    x.tempFormatDigitPercent(-123);
    expect(x.tempFormatDigitPercent).toMatchSnapshot();
})
test('tempFormatDigitPercent', () => {
    x.tempFormatDigitPercent(0);
    expect(x.tempFormatDigitPercent).toMatchSnapshot();
})

test('tempFormatDigitPercent', () => {
    x.tempFormatDigitPercent('----');
    expect(x.tempFormatDigitPercent).toMatchSnapshot();
})

test('tempFormatDigitColor', () => {
    x.tempFormatDigitColor(123, true);
    expect(x.tempFormatDigitColor).toMatchSnapshot();
})
test('tempFormatDigitColor', () => {
    x.tempFormatDigitColor(0, true);
    expect(x.tempFormatDigitColor).toMatchSnapshot();
})
test('tempFormatDigitColor', () => {
    x.tempFormatDigitColor('0', true);
    expect(x.tempFormatDigitColor).toMatchSnapshot();
})
test('tempFormatDigitColor', () => {
    x.tempFormatDigitColor(-12, true);
    expect(x.tempFormatDigitColor).toMatchSnapshot();
})

test('tempFormatDigitColor', () => {
    x.tempFormatDigitColor(-12, false);
    expect(x.tempFormatDigitColor).toMatchSnapshot();
})

test('tempFormatDigitColor', () => {
    x.tempFormatDigitColor('--', true);
    expect(x.tempFormatDigitColor).toMatchSnapshot();
})

test('tempFormatDigitColor', () => {
    x.tempFormatDigitColor('--', false);
    expect(x.tempFormatDigitColor).toMatchSnapshot();
})

test('tempFormatDigitColor', () => {
    x.tempFormatDigitColor('---', true);
    expect(x.tempFormatDigitColor).toMatchSnapshot();
})

test('tempFormatDigitColor', () => {
    x.tempFormatDigitColor('0', false);
    expect(x.tempFormatDigitColor).toMatchSnapshot();
})

test('tempFormatDigitColor', () => {
    x.state.currency = 'USD'
    x.tempFormatDigitColor(12, true);
    expect(x.tempFormatDigitColor).toMatchSnapshot();
})
test('tempFormatDigitColor', () => {
    x.state.currency = 'USD'
    x.tempFormatDigitColor(12, false);
    expect(x.tempFormatDigitColor).toMatchSnapshot();
})

test('addClass', () => {
    x.setState = jest.fn();
    x.addClass();
    expect(x.setState).toBeCalled();
})

test('handleClickIcon', () => {
    x.handleClickIcon();
    expect(showModal).toMatchSnapshot();
})

test('renderInfoInline', () => {
    x.renderInfoInline();
    expect(x.renderInfoInline).toMatchSnapshot();
})
test('renderInfoInline', () => {
    let valueFunc = () => {
        return true
    }
    let valueFuncRight = () => {
        return true
    }
    x.renderInfoInline('', valueFunc, valueFuncRight, true, true, true, false);
    expect(x.renderInfoInline).toMatchSnapshot();
})
test('renderInfoInline', () => {
    let valueFunc = () => {
        return true
    }
    let valueFuncRight = () => {
        return true
    }
    x.renderInfoInline('', valueFunc, valueFuncRight, true, true, true, true);
    expect(x.renderInfoInline).toMatchSnapshot();
})

test('renderInfoToggle', () => {
    x.renderInfoToggle();
    expect(x.renderInfoToggle).toMatchSnapshot();
})

test('renderInfoTxt', () => {
    x.renderInfoTxt();
    expect(x.renderInfoTxt).toMatchSnapshot();
})

test('renderInfoTxt', () => {
    x.state.show = true;
    x.renderInfoTxt();
    expect(x.renderInfoTxt).toMatchSnapshot();
})

test('getDataAccount', () => {
    x.state.accountObj = { account_id: 1 };
    let logger = jest.spyOn(log, 'error').mockImplementation(() => { })
    let geturl = jest.spyOn(request, 'getUrlAnAccount')
        .mockImplementation(() => {
            return 'tren'
        })
    let getUrlTotal = jest.spyOn(request, 'getUrlTotalPosition')
        .mockImplementation(() => {
            return 'duoi'
        })

    let getData = jest.spyOn(request, 'getData')
        .mockImplementation((url) => new Promise((resolve, reject) => {
            if (url === 'tren') {
                reject('khai')
            }
            if (url === 'duoi') {
                reject('khai')
            }
        }))
    x.mappingObject = jest.fn();
    x.getDataAccount();
    setTimeout(() => {
        expect(logger).toBeCalled();
    }, 0);
})
test('getDataAccount', () => {
    x.state.accountObj = { account_id: 1 };
    let logger = jest.spyOn(log, 'error').mockImplementation(() => { })
    let geturl = jest.spyOn(request, 'getUrlAnAccount')
        .mockImplementation(() => {
            return 'tren'
        })
    let getUrlTotal = jest.spyOn(request, 'getUrlTotalPosition')
        .mockImplementation(() => {
            return 'duoi'
        })

    let getData = jest.spyOn(request, 'getData')
        .mockImplementation((url) => new Promise((resolve, reject) => {
            if (url === 'tren') {
                resolve('khai')
            }
            if (url === 'duoi') {
                resolve('khai')
            }
        }))
    x.mappingObject = jest.fn();
    x.getDataAccount();
    setTimeout(() => {
        expect(logger).toBeCalled();
    }, 0);
})
test('getDataAccount', () => {
    x.state.accountObj = { account_id: 1 };
    let geturl = jest.spyOn(request, 'getUrlAnAccount')
        .mockImplementation(() => {
            return 'tren'
        })
    let getUrlTotal = jest.spyOn(request, 'getUrlTotalPosition')
        .mockImplementation(() => {
            return 'duoi'
        })

    let getData = jest.spyOn(request, 'getData')
        .mockImplementation((url) => new Promise(resolve => {
            if (url === 'tren') {
                let datar = [{ account_name: 'khai', currency: 'usd' }]
                resolve({ data: datar })
            }
            if (url === 'duoi') {
                let datar = [{ account_name: 'khai', currency: 'usd' }]
                resolve({ data: datar })
            }
        }))
    x.mappingObject = jest.fn();
    x.getDataAccount();
    setTimeout(() => {
        expect(x.mappingObject).toBeCalled();
    }, 10);
})
test('getDataAccount', () => {
    let geturl = jest.spyOn(request, 'getUrlAnAccount')
        .mockImplementation(() => {
            return 'tren'
        })
    x.getDataAccount();
    setTimeout(() => {
        expect(geturl).not.toBeCalled();
    }, 10);
})

test('getDataAccount', () => {
    let logger = jest.spyOn(log, 'error').mockImplementation(() => { })
    x.state = null;
    x.getDataAccount();
    setTimeout(() => {
        expect(logger).toBeCalled();
    }, 0);
})

test('changeConnection', () => {
    x.refreshData = jest.fn();
    x.changeConnection(true);
    expect(x.refreshData).not.toBeCalled();
})

test('changeConnection', () => {
    x.refreshData = jest.fn();
    x.needToRefresh = true;
    x.changeConnection(true);
    expect(x.refreshData).toBeCalled();
})
