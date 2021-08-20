import React from 'react';
import {
    checkInvalidInput,
    getReplaceText,
    checkValidateDate
} from '../../../helper/functionUtils'
import Icon from '../Icon/Icon'
import moment from 'moment-timezone';
import DatePicker, { getStartTime, getEndTime, convertTimeToGMTString, convertTimeStamp, getResetMaxDate } from '../DatePicker/DatePicker';

const KeyCode = {
    BACKSPACE: 8,
    DELETE: 127,
    GOBACK: 37,
    GOFORWARD: 39
}
class DurationCustomInput extends React.Component {
    constructor(props) {
        super(props);
        const { value } = this.props;
        const listValue = (value + '').replace(/\//g, '');
        this.state = {
            value: ''
        }
        if (this.props.period) {
            this.props.period(true)
        }
    }
    onChangeText = (value) => {
        let time
        value = value.toLowerCase()
        let dateDefault = moment().tz('Australia/Sydney')
        if (dateDefault.format('HH') <= 8) dateDefault = dateDefault.add('day', -1)
        if (/^\d+[a-zA-Z]$/.test(value) && !value.startsWith('0')) {
            if (value.includes('d')) {
                time = moment(dateDefault).tz('GMT').add(parseInt(value.substring(0, value.length - 1)), 'days');
            }
            if (value.includes('w')) {
                time = moment(dateDefault).tz('GMT').add(parseInt(value.substring(0, value.length - 1)), 'weeks');
            }
            if (value.includes('m')) {
                time = moment(dateDefault).tz('GMT').add(parseInt(value.substring(0, value.length - 1)), 'months');
            }
            if (value.includes('y')) {
                time = moment(dateDefault).tz('GMT').add(parseInt(value.substring(0, value.length - 1)), 'year');
            }
        }
        if (!time) {
            this.props.period(true)
            if (this.props.formName === 'QuickOrder') {
                this.props.onChange && this.props.onChange(false, value)
            }
        } else {
            this.props.onChange && this.props.onChange(getStartTime(time), value)
            this.props.period(false)
        }
    }

    componentDidMount() {
        if (this.props.lastDate) this.onChangeText(this.props.lastDate)
    }

    render() {
        return (
            <div>
                <div className="react-datepicker-wrapper">
                    <div className="react-datepicker__input-container">
                        <div id="datepicker-input-custom-container">
                            <input
                                className='datepicker-input-period'
                                onChange={(e) => this.onChangeText(e.target.value)}
                                placeholder={'2D 3W 4M 1Y'}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default DurationCustomInput
