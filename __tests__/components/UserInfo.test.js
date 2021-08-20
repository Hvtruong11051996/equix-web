import Compoment from '../../src/components/UserInfor';
import * as request from '../../src/helper/request';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react'
import * as Modal from '../../src/components/Inc/Modal';
import dataStorage from '../../src/dataStorage'
import log from '../../src/helper/log';
import * as functionUtils from '../../src/helper/functionUtils';
import styles from '../../src/components/UserInfor/UserInfor.module.css'
global.MutationObserver = class {
    disconnect() { }
    observe(element, initObject) { }
};
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
    resize: function(cb) {
        cb()
    },
    hideElement: function() {
    }
}
dataStorage.translate = () => { }
dataStorage.userInfo = {
    user_id: '182756',
    full_name: 'Full Name'
}
let x;
beforeEach(() => {
    x = new Compoment(props1);
    x.dom = {
        className: 'accountInfo',
        classList: {
            add: function() { }
        }
    }
    x.state = {}
    x.state.userObj = {}
});
x = new Compoment(props1);
class UserInfor extends React.Component {
    componentDidMount() {
        document.querySelector('.' + styles.mailAlertIcon).click()
    }
    render() {
        return <Compoment {...props1} />
    }
}
test('UserInfor render', () => {
    render(<UserInfor></UserInfor>)
})
test('UserInfor render', () => {
    x.state.userObj.userType = 'operation'
    x.render()
})

test('UserInfor render', () => {
    x.state.userObj.userType = 'retail'
    x.state.userObj.management = 'Management'
    x.render()
})

test('UserInfor render', () => {
    x.state.userObj.userType = 'advisor'
    x.state.userObj.organisationCode = '12'
    x.dicAccount = {
        '159713': { account_id: 'uid1235', account_name: 'tuan.phan' }
    }
    x.render()
    x.state.userObj.branchCode = '12.AB'
    x.dicAccount = {
        '12.AB': { account_id: 'uid1235', account_name: 'tuan.phan' }
    }
    x.render()
    x.state.userObj.advisorCode = '12.AB.XY'
    x.render()
})

test('UserInfor handleResize', () => {
    x.handleResize(500)
    x.handleResize(768)
    x.handleResize(1366)
})

test('UserInfor getDataUser', () => {
    const res = {
        data: [
            { account_id: 'uid1235', account_name: 'tuan.phan' },
            { account_id: 'uid6789', account_name: 'tuan.phan' }
        ]
    }
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise(resolve => {
            resolve(res)
        }))
    x.getDataUser()
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise(resolve => {
            resolve({})
        }))
    x.getDataUser()
    jest.spyOn(request, 'getData')
        .mockImplementation(() => new Promise((resolve, reject) => {
            reject(res)
        }))
    x.getDataUser()
})

test('UserInfor getDataUser', () => {
    dataStorage.userInfo = null
    x.getDataUser()
})

test('UserInfor editEmailNoti', () => {
    x.editEmailNoti()
})
test('render', () => {
    x.state = null;
    const logger = jest.spyOn(log, 'log');
    x.render();
    expect(logger).toBeCalled();
})
