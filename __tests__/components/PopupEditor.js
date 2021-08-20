import Compoment from '../../src/components/Inc/PopupEditor/PopupEditor';
import React from 'react';
import { render } from '@testing-library/react'
import dataStorage from '../../src/dataStorage'
import log from '../../src/helper/log';
import * as request from '../../src/helper/request';
global.MutationObserver = class {
    disconnect() { }
    observe(element, initObject) { }
};
dataStorage.checkUpdate = true
const props1 = {
    value: 1,
    label: 'color',
    type: 'inputNumber',
    placeholder: '',
    close: function() { },
    options: [
        { value: 0, label: '#ccc' },
        { value: 1, label: '#fff' }
    ],
    actionName: 'addNewMarginAction',
    onChange: function() { },
    onSuccess: function() { }
}
let x;
x = new Compoment(props1);
beforeEach(() => {
    x = new Compoment(props1);
});
x.state = {}
x.setState = () => { }
class PopupEditor extends React.Component {
    componentDidMount() {
        document.querySelector('.btn-dask').click()
        document.querySelector('.btn-ok').click()
    }
    render() {
        return <Compoment {...props1} />
    }
}
test('PopupEditor render', () => {
    render(<PopupEditor />)
})
test('PopupEditor render', () => {
    props1.type = 'inputText'
    props1.middleText = 'middleText'
    render(<PopupEditor />)
})
test('PopupEditor render', () => {
    props1.type = 'chooseColor'
    render(<PopupEditor />)
})

test('PopupEditor changeConnection false', () => {
    x.state.connected = true
    x.changeConnection(false)
})

test('handleOnClickConfirm actionName = addNewMarginAction', () => {
    x.state.value = 1
    x.props.actionName = 'addNewMarginAction'
    x.onChangeInput(x.state.value)
    x.addNewMarginAction = jest.fn()
    x.handleOnClickConfirm()
})

test('handleOnClickConfirm1', () => {
    x.valueOld = 2
    x.props.type = 'chooseColor'
    x.props.actionName = ''
    x.timeoutID = '456'
    x.onChangeInput(1)
    x.handleOnClickConfirm()
})

test('handleOnClickConfirm2', () => {
    x.state.value = 1
    x.props.type = 'chooseColor'
    x.props.actionName = ''
    x.onChangeInput(1)
    x.handleOnClickConfirm()
})

test('addNewMarginAction response.success', () => {
    const res = {
        data: {
            actor: 'tuanphan',
            updated: '123434'
        }
    }
    x.setState = jest.fn();
    jest.spyOn(request, 'postData')
        .mockImplementation(() => new Promise(resolve => {
            resolve(res)
        }))
    x.props.close = jest.fn();
    x.addNewMarginAction();
    setTimeout(() => {
        expect(x.props.close).toBeCalled();
    }, 100);
})

test('addNewMarginAction response.errorCode', () => {
    const res = {
        response: { errorCode: {} }
    }
    x.setState = jest.fn((t, cb) => {
        if (typeof cb === 'function') cb()
    })
    jest.spyOn(request, 'postData')
        .mockImplementation((string) => new Promise((resolve, reject) => {
            reject(res)
        }))
    x.addNewMarginAction();
    setTimeout(() => {
        expect(x.setState).toBeCalled();
    }, 100);
})
