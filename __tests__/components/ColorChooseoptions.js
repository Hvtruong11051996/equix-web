import Compoment from '../../src/components/ColorChooseOptions/ColorChooseoptions';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react'
import dataStorage from '../../src/dataStorage'
import log from '../../src/helper/log';
import * as functionUtils from '../../src/helper/functionUtils';
import ReactDOM from 'react-dom';
global.MutationObserver = class {
    disconnect() { }
    observe(element, initObject) { }
};
dataStorage.checkUpdate = true
const props1 = {
    value: 'ccc',
    options: [
        { value: 'ccc', label: '#ccc' },
        { value: 'fff', label: '#fff' }
    ]
}
let x;
x = new Compoment(props1);
x.props.options = [
    { value: 'ccc', label: '#ccc' },
    { value: 'fff', label: '#fff' }
]
// console.log('==========ReactDOM', ReactDOM)
// ReactDOM.render = jest.fn();
class ColorChooseOptions extends React.Component {
    componentDidMount() {
        document.querySelector('.choose-color').dispatchEvent(new Event('mouseenter'))
        document.querySelector('.choose-color').dispatchEvent(new Event('mouseeover'))
        document.querySelector('.choose-color').dispatchEvent(new Event('mouseout'))
        this.forceUpdate()
    }
    render() {
        return <Compoment {...props1} />
    }
}
test('ColorChooseOptions render', () => {
    render(<ColorChooseOptions></ColorChooseOptions>)
})
test('ColorChooseOptions render', () => {
    x.render()
})

test('ColorChooseOptions onChange function', () => {
    x.floatContent = {}
    x.onChange(1)
})
