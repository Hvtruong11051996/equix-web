import Compoment from '../../../src/components/ContractNote/ContractNote';
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
import showModal from '../../../src/components/Inc/Modal';


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
