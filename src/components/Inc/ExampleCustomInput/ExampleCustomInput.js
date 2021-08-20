import React from 'react';
import {
    checkInvalidInput,
    getReplaceText,
    checkValidateDate
} from '../../../helper/functionUtils'
import Icon from '../../Inc/Icon'
import SvgIcon, { path } from '../../Inc/SvgIcon'

const KeyCode = {
    BACKSPACE: 8,
    DELETE: 127,
    GOBACK: 37,
    GOFORWARD: 39
}
class ExampleCustomInput extends React.Component {
    constructor(props) {
        super(props);
        this.listInput = [];
        const { value } = this.props;
        const listValue = (value + '').replace(/\//g, '');
        this.state = {
            value,
            day1: listValue[0] || 'd',
            day2: listValue[1] || 'd',
            month1: listValue[2] || 'm',
            month2: listValue[3] || 'm',
            year1: listValue[4] || 'y',
            year2: listValue[5] || 'y',
            year3: listValue[6] || 'y',
            year4: listValue[7] || 'y'
        }
    }

    componentDidMount() {
        const listInput = document.querySelectorAll(`#datepicker-input-custom-container-${this.props.type} .datepicker-input-custom`);
        this.listInput = listInput;
        if (listInput && listInput.length) {
            for (let index = 0; index < listInput.length; index++) {
                const element = listInput[index];
                element.addEventListener('keydown', event => {
                    this.onKeyPress(event.keyCode, index)
                })
            }
        }
    }

    onKeyPress(code, index) {
        const nextIndex = index + 1 === 2 ? 3 : index + 1 === 5 ? 6 : index + 1;
        const prevIndex = index - 1 === 2 ? 1 : index - 1 === 5 ? 4 : index - 1;
        switch (code) {
            case KeyCode.BACKSPACE:
                if (this.listInput[prevIndex]) {
                    this.listInput[prevIndex].focus();
                    this.listInput[prevIndex].setSelectionRange(1, 1)
                    this.onChangeText(index, '')
                } else {
                    this.listInput[index].focus();
                    this.onChangeText(index, '')
                    this.listInput[index].setSelectionRange(0, 0)
                }
                break;
            case KeyCode.DELETE:
                if (this.listInput[nextIndex]) {
                    this.listInput[nextIndex].focus();
                    this.listInput[nextIndex].setSelectionRange(0, 0)
                    this.onChangeText(index, '')
                } else {
                    this.listInput[index].focus();
                    this.listInput[index].setSelectionRange(1, 1)
                    this.onChangeText(index, '')
                }
                break;
            case KeyCode.GOBACK:
                if (this.listInput[prevIndex]) {
                    this.listInput[prevIndex].focus();
                    this.listInput[prevIndex].setSelectionRange(1, 1)
                }
                break;
            case KeyCode.GOFORWARD:
                if (this.listInput[nextIndex]) {
                    this.listInput[nextIndex].focus();
                }
                break;
            default:
                if (code >= 48 && code <= 57) {
                    if (isNaN(parseInt(this.listInput[index].value))) {
                        if (!checkInvalidInput(index, code)) return;
                        this.onChangeText(index, String.fromCharCode(code))
                        if (this.listInput[nextIndex]) {
                            this.listInput[nextIndex].focus();
                            this.listInput[nextIndex].setSelectionRange(0, 0)
                        }
                    } else {
                        if (this.listInput[nextIndex] && this.listInput[nextIndex].value && isNaN(parseInt(this.listInput[nextIndex].value))) {
                            if (!checkInvalidInput(nextIndex, code)) return;
                            this.onChangeText(nextIndex, String.fromCharCode(code))
                            this.listInput[nextIndex].focus();
                            this.listInput[nextIndex].setSelectionRange(1, 1)
                        }
                    }
                }
                break;
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps && nextProps.value) {
            const listValue = (nextProps.value + '').replace(/\//g, '');
            this.setState({
                value: nextProps.value,
                day1: listValue[0],
                day2: listValue[1],
                month1: listValue[2],
                month2: listValue[3],
                year1: listValue[4],
                year2: listValue[5],
                year3: listValue[6],
                year4: listValue[7]
            })
        }
    }

    onChangeText(index, text) {
        let curValue = this.state.value;
        let listCurValue = curValue.split('');
        const replaceText = getReplaceText(text, index);
        listCurValue[index] = replaceText;
        curValue = listCurValue.toString().replace(/,/g, '');
        const check = checkValidateDate(index, curValue);
        if (!check) return;
        const listValue = (curValue + '').replace(/\//g, '');
        this.setState({
            value: curValue,
            day1: listValue[0],
            day2: listValue[1],
            month1: listValue[2],
            month2: listValue[3],
            year1: listValue[4],
            year2: listValue[5],
            year3: listValue[6],
            year4: listValue[7]
        }, () => {
            this.props.onChangeDate && this.props.onChangeDate(this.state.value)
        })
    }

    render() {
        return (
            <div id={`datepicker-input-custom-container-${this.props.type}`} className={`${this.props.className ? this.props.className : ''}`} onClick={this.props.onClick}>
                {
                    this.props.topIconCalendar
                        ? <div className={`topIconCalendar ${this.props.classTopIcon ? this.props.classTopIcon : ''}`}>
                            <SvgIcon path={path.mdiCalendarBlank} />
                        </div>
                        : ''
                }
                <div className={'input-group'}>
                    <input
                        maxLength={1}
                        className='datepicker-input-custom'
                        onChange={() => { }}
                        placeholder={this.state.day1}
                        value={this.state.day1}
                    />
                    <input
                        maxLength={1}
                        className='datepicker-input-custom'
                        onChange={() => { }}
                        placeholder={this.state.day2}
                        value={this.state.day2}
                    />
                    <input
                        className='datepicker-input-custom separate-input-date'
                        onChange={() => { }}
                        value={'/'}
                    />
                    <input
                        maxLength={1}
                        className={this.state.month1 === 'm' ? 'datepicker-input-custom datepicker-input-custom-special' : 'datepicker-input-custom'}
                        onChange={() => { }}
                        placeholder={this.state.month1}
                        value={this.state.month1}
                    />
                    <input
                        maxLength={1}
                        className={this.state.month2 === 'm' ? 'datepicker-input-custom datepicker-input-custom-special' : 'datepicker-input-custom'}
                        onChange={() => { }}
                        placeholder={this.state.month2}
                        value={this.state.month2}
                    />
                    <input
                        className='datepicker-input-custom separate-input-date'
                        onChange={() => { }}
                        value={'/'}
                    />
                    <input
                        maxLength={1}
                        className='datepicker-input-custom'
                        onChange={() => { }}
                        placeholder={this.state.year1}
                        value={this.state.year1}
                    />
                    <input
                        maxLength={1}
                        className='datepicker-input-custom'
                        onChange={() => { }}
                        placeholder={this.state.year2}
                        value={this.state.year2}
                    />
                    <input
                        maxLength={1}
                        className='datepicker-input-custom'
                        onChange={() => { }}
                        placeholder={this.state.year3}
                        value={this.state.year3}
                    />
                    <input
                        maxLength={1}
                        className='datepicker-input-custom'
                        onChange={() => { }}
                        placeholder={this.state.year4}
                        value={this.state.year4}
                    />
                </div>
                {!this.props.hidenIconCalendar ? <Icon src={'editor/insert-invitation'} style={{ 'height': '16px', 'marginLeft': '6px', 'marginRight': '6px' }} color={'#758696'} /> : ''}
            </div>
        )
    }
}
export default ExampleCustomInput
