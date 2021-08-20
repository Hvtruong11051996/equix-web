import React from 'react';
import logger from '../../helper/log';
import { translate } from 'react-i18next';
const arrPin = ['pin', 'pin', 'pin', 'pin', 'pin', 'pin']

class PinInput extends React.Component {
    constructor(props) {
        super(props)
        this.arrPin = [];
        this.state = {
            show: false
        };
        this.keyBoardPress = this.keyBoardPress.bind(this);
        if (typeof this.props.receiveKey === 'function') this.props.receiveKey(this.receivedKey.bind(this));
    }

    mapInputPin() {
        const inputPin = arrPin.map((item, index) => {
            if (item === 'pin') {
                const itemShow = index === this.arrPin.length - 1 ? this.arrPin[index] + '' : '';
                return (<div key={index} style={index === 2 ? { marginRight: '16px' } : {}} className={`symbolPrivatePinCode ${this.arrPin[index] || this.arrPin[index] === 0 ? 'filled' : ''}`}>
                    {itemShow && this.state.show ? itemShow : ''}
                </div>);
            }
        });
        return inputPin;
    }

    updateState() {
        this.setState({
            show: true
        }, () => {
            if (this.timeout) clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.setState({
                    show: false
                });
            }, 500);
        })
    }

    receivedKey(keyBoardSend) {
        if (keyBoardSend || keyBoardSend === 0) {
            if (keyBoardSend === 'delete') {
                this.removeSymbolCode()
            } else {
                if (keyBoardSend && keyBoardSend.length === 6) {
                    this.arrPin = keyBoardSend;
                    this.setState({
                        show: false
                    })
                } else this.addSymbolCode(keyBoardSend)
            }
        } else {
            this.arrPin = [];
            this.updateState();
        }
    }

    removeSymbolCode() {
        if (this.arrPin.length !== 0) {
            this.arrPin.splice(-1, 1)
            this.arrPin && this.props.getPinResult(this.arrPin);
            this.updateState();
        }
    }

    addSymbolCode(num) {
        if (this.arrPin.length < 6) {
            this.arrPin.push(num);
            this.arrPin && this.props.getPinResult(this.arrPin);
            this.updateState();
        }
    }

    keyBoardPress(e) {
        if (this.dom && this.dom.parentNode.parentNode.parentNode.classList.contains('myHidden')) return;
        const num = Number(e.key);
        if (/^\d+$/.test(num)) {
            this.addSymbolCode(num)
        } if (e.key === 'Backspace') {
            this.removeSymbolCode()
        }
    }

    componentWillMount() {
        window.addEventListener('keydown', this.keyBoardPress, false)
    }

    render() {
        try {
            return (
                <div ref={dom => this.dom = dom} className='pinInputRoot'>{this.mapInputPin()}</div>
            );
        } catch (error) {
            logger.error('render on ConfirmLogout' + error);
        }
    }

    componentDidMount() {
        this.props.sendFuncKey && this.props.sendFuncKey(this.keyBoardPress);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.keyBoardPress, false)
    }
}

export default translate('translations')(PinInput);
