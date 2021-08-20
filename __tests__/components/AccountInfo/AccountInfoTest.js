import Compoment from '../../../src/components/AccountInfo/AccountInfo';
import * as request from '../../../src/helper/request';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react'
import dataStorage from '../../../src/dataStorage'
import log from '../../../src/helper/log';
import * as functionUtils from '../../../src/helper/functionUtils';
import Scroll from '../../../src/components/Inc/Scroll/Scroll';

global.MutationObserver = class {
    disconnect() { }
    observe(element, initObject) { }
};

const props1 = {
    loadState: function() {
        return {
            accountObj: {
                currency: 1,
                account_id: 1,
                account_name: 1,
                hin: 1,
                work_phone: 1,
                home_phone: 1,
                fax: 1,
                email: 1,
                address: 1,
                account_type: 1,
                advisor_code: 1,
                advisor_name: 1
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
const props2 = {
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
const props3 = {
    loadState: function() {
        return {
            accountObj: {
                currency: 1,
                account_id: 1,
                account_name: 1,
                hin: 1,
                work_phone: 1,
                home_phone: 1,
                fax: 1,
                email: 1,
                address: 1,
                account_type: 1,
                advisor_code: 1
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
test('AccountInfo', () => {
    const AccountInfo = render(<Compoment {...props1} />)
})

test('AccountInfo', () => {
    const AccountInfo = render(<Compoment {...props2} />)
})
test('AccountInfo', () => {
    const AccountInfo = render(<Compoment {...props3} />)
})

test('render', () => {
    x.state = null;
    const logger = jest.spyOn(log, 'log');
    x.render();
    expect(logger).toBeCalled();
})

test('handleResize', () => {
    x.dom = {
        className: 'khai',
        classList: {
            add: (a) => {
                x.dom.className = a;
            }
        }
    };
    x.handleResize(730);
    expect(x.dom.className).toEqual('single');
})
test('handleResize', () => {
    x.dom = {
        className: 'khai',
        classList: {
            add: (a) => {
                x.dom.className = a;
            }
        }
    };
    x.handleResize(1270);
    expect(x.dom.className).toEqual('half');
})
test('handleResize', () => {
    x.dom = {
        className: 'khai',
        classList: {
            add: (a) => {
                x.dom.className = a;
            }
        }
    };
    x.handleResize(9999);
    expect(x.dom.className).toEqual('lagre');
})

test('handleResize', () => {
    x.dom = false;
    x.handleResize(9999);
})

test('renderProducts', () => {
    x.dom = false;
    x.state.accountObj = { equity_trading: 1, warrants_trading: 1, options_trading: 1, future_trading: 1 }
    x.renderProducts();
    expect(x.renderProducts).toMatchSnapshot();
})

test('renderProducts', () => {
    x.dom = false;
    x.state.accountObj = { equity_trading: 1, warrants_trading: 1, options_trading: 1, future_trading: 1 }
    x.renderProducts();
    expect(x.renderProducts).toMatchSnapshot();
})

test('dataReceivedFromSearchAccount', () => {
    let data = true;
    x.changeAccount = jest.fn();
    x.state.accountObj = { equity_trading: 1, warrants_trading: 1, options_trading: 1, future_trading: 1 }
    x.dataReceivedFromSearchAccount(data);
    expect(x.changeAccount).toBeCalled();
})

test('dataReceivedFromSearchAccount', () => {
    let data = false;
    x.state.accountObj = { equity_trading: 1, warrants_trading: 1, options_trading: 1, future_trading: 1 }
    x.dataReceivedFromSearchAccount(data);
    x.changeAccount = jest.fn();
    expect(x.changeAccount).not.toBeCalled();
})

test('changeAccount', () => {
    let data = true;
    jest.spyOn(functionUtils, 'getSymbolAccountWhenFirstOpenLayout')
        .mockImplementation(() => {
            return { newAccount: { account_id: 1 } };
        })
    x.state.accountObj = { equity_trading: 1, warrants_trading: 1, options_trading: 1, future_trading: 1 }
    props1.send = jest.fn();
    x.changeAccount(data, true);
    expect(props1.send).toBeCalled();
})

test('changeAccount', () => {
    let data = true;
    jest.spyOn(functionUtils, 'getSymbolAccountWhenFirstOpenLayout')
        .mockImplementation(() => {
            return { newAccount: { account_id: 1 } };
        })
    x.state.accountObj = { equity_trading: 1, warrants_trading: 1, options_trading: 1, future_trading: 1 }
    props1.send = jest.fn();
    x.changeAccount(data, false);
    expect(props1.send).not.toBeCalled();
})

test('changeAccount', () => {
    let data = true;
    jest.spyOn(functionUtils, 'getSymbolAccountWhenFirstOpenLayout')
        .mockImplementation(() => {
            return { newAccount: { khai: 1 } };
        })
    props1.saveState = jest.fn();
    x.changeAccount(data, false);
    expect(props1.saveState).not.toBeCalled();
})

test('changeAccount', () => {
    let data = true;
    jest.spyOn(functionUtils, 'getSymbolAccountWhenFirstOpenLayout')
        .mockImplementation(() => {
            return { newAccount: {} };
        })
    props1.saveState = jest.fn();
    x.changeAccount(data, false);
    expect(props1.saveState).not.toBeCalled();
})

test('changeAccount', () => {
    let data = true;
    jest.spyOn(functionUtils, 'getSymbolAccountWhenFirstOpenLayout')
        .mockImplementation(() => {
            return { newAccount: {} };
        })
    props1.saveState = jest.fn();
    x.changeAccount(false, false);
    expect(props1.saveState).not.toBeCalled();
})
