import React from 'react';
// import DPicker from '../DatePickerLibary';
import DPicker from 'react-datepicker';
import dataStorage from '../../../dataStorage';
import moment from 'moment-timezone';
import { getDropdownContentDom } from '../../../helper/functionUtils';

export function getStartTimeFilter(objData, date = moment(), arrDate, mustNot) {
    const dateConver = moment.tz(date, dataStorage.timeZone);
    dateConver.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    if (mustNot) {
        if (arrDate && arrDate.indexOf(objData.filed_name) > -1) return moment(new Date(dateConver)).tz('GMT').add(1, 'days').format()
        return moment(new Date(dateConver)).add(1, 'days').toDate().getTime()
    } else {
        if (arrDate && arrDate.indexOf(objData.filed_name) > -1) return moment(dateConver).tz('GMT').format()
        return new Date(dateConver).getTime();
    }
}

export function getEndTimeFilter(objData, date = moment(), arrDate, mustNot) {
    const dateConver = moment.tz(date, dataStorage.timeZone);
    dateConver.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
    if (mustNot) {
        if (arrDate && arrDate.indexOf(objData.filed_name) > -1) return moment(new Date(dateConver)).tz('GMT').add(-1, 'days').add(1, 'seconds').format()
        return moment(new Date(dateConver)).add(-1, 'days').add(1, 'seconds').toDate().getTime()
    } else {
        if (arrDate && arrDate.indexOf(objData.filed_name) > -1) return moment(dateConver).tz('GMT').format()
        return new Date(dateConver).getTime();
    }
}

export function convertTimeToGMTString(date) {
    let afterConvert = moment(date).tz('GMT').format('DD/MM/YY-HH:mm:ss.SSS')
    return afterConvert
}
export function getStartTime(date = moment(), timeZone) {
    if (typeof date === 'string') date = moment().add(-1, date).add(1, 'day');
    const dateConver = moment(date).tz(timeZone || dataStorage.timeZone);
    dateConver.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    return dateConver;
}
export function getResetMaxDate(maxDate) {
    const dateConver = moment(maxDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    return dateConver
}
export function getEndTime(date = moment(), timeZone) {
    const dateConver = moment(date).tz(timeZone || dataStorage.timeZone);
    dateConver.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
    return dateConver;
}
export function convertTimeStamp(date) {
    return new Date(date).getTime()
}

class DatePicker extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selected: props.selected || +new Date()
        }
    }

    convertLocalTimeZone(date) {
        try {
            if (!date) return date;
            const dateConvert = (this.props.isReport) ? date : moment(date).tz(this.props.timeZone || dataStorage.timeZone);
            const dateOnly = moment(dateConvert.format('YYYY-MM-DDT00:00:00'))
            if (this.props.isNewReportTab) {
                return dateOnly.add(-1, 'day')
            }
            return dateOnly.toDate();
        } catch (error) {
            console.log('error convertLocalTimeZone', error)
        }
    }

    onChange(date) {
        date = moment(date)
        if (this.oldDate === date.format('DD/MM/YYYY')) return;
        const timeZone = this.props.timeZone || dataStorage.timeZone || moment.tz.guess()
        const dateConver = moment.tz(date.format('YYYY-MM-DDT00:00:00'), timeZone)
        const newDate = this.props.minDate ? getEndTime(dateConver, timeZone) : getStartTime(dateConver, timeZone)
        this.setState({ selected: newDate })
        this.props.onChange(newDate)
        this.handleCalendarClose()
        this.oldDate = date.format('DD/MM/YYYY');
    }

    handleCalendarClose = () => {
        document.querySelector('body').classList.remove('hidenRightClick')
        this.floatContent && ReactDOM.render(null, this.floatContent);
        this.floatContent = null
        const div = getDropdownContentDom().querySelectorAll('.newDatePicker')
        Object.keys(div).map(index => div[index].remove())
    }

    chooseDate = (props) => {
        const { className, children } = props;
        this.className = className
        this.lastChildren = children
        let div = getDropdownContentDom()
        if (!this.floatContent) {
            document.querySelector('body').classList.add('hidenRightClick')
            this.floatContent = document.createElement('div');
            div.appendChild(this.floatContent);
            setTimeout(() => {
                ReactDOM.render(<div style={{ position: 'relative' }} className={className}> {this.lastChildren} </div>, this.floatContent)
            }, 0);
            this.floatContent.style.position = 'absolute';
            this.floatContent.style.display = 'block';
            this.floatContent.classList.add('newDatePicker')
            const rect = this.dom.getBoundingClientRect();
            // 203 : width datePicker
            if (window.innerWidth - rect.left > 203) {
                this.floatContent.style.left = rect.left + 'px';
            } else {
                this.floatContent.style.left = rect.left - (203 - this.dom.parentNode.clientWidth) + 'px';
            }
        }
        setTimeout(() => {
            const rect = this.dom.getBoundingClientRect();
            if (window.innerHeight - rect.top > this.floatContent.clientHeight) {
                this.floatContent.style.top = rect.top + this.dom.clientHeight + 'px';
            } else {
                this.floatContent.style.top = rect.top - this.floatContent.clientHeight + 'px';
            }
        }, 0);
        return <div></div>
    };

    reRender = () => {
        ReactDOM.render(<div style={{ position: 'relative' }} className={this.className}> {this.lastChildren} </div>, this.floatContent)
    }

    handleClickOutside = (event) => {
        if (!this.floatContent) return
        if (!this.floatContent.contains(event.target)) {
            this.handleCalendarClose()
            this.setOpen(false)
        }
    }

    remove = () => {
        this.handleCalendarClose()
        this.setOpen(false)
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    render() {
        return <div ref={dom => this.dom = dom}>
            <DPicker
                customInput={this.props.customInput || null}
                dateFormat={this.props.dateFormat || 'dd/MM/yyyy'}
                selected={this.convertLocalTimeZone(this.state.selected)}
                minDate={!this.props.isMinDate ? this.convertLocalTimeZone(this.props.minDate) : null}
                maxDate={this.props.notSetMaxDate ? null : (this.convertLocalTimeZone(!this.props.isMinDate ? (this.props.dayToAdd ? moment().add(this.props.dayToAdd, 'day') : moment()).tz(this.props.timeZone || dataStorage.timeZone) : this.props.maxDate))}
                onChange={this.onChange.bind(this)}
                calendarContainer={this.chooseDate}
                onMonthChange={this.reRender}
                setOpen={cb => this.setOpen = cb}
            />
        </div>
    }
}

export default DatePicker;
