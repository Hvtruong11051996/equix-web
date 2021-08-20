import React from 'react';
import SvgIcon, { path } from '../../Inc/SvgIcon';
import moment from 'moment';
import Error from '../Error/Error'
import DatePicker from 'react-datepicker';
import { checkValidDateInput, getDatePickerContent, trimAll } from '../../../helper/functionUtils';
import s from './DateInput.module.css';
import Validator from '../../Inc/Validation/validate'
import dataStorage from '../../../dataStorage'

export default class DateInput extends React.Component {
    constructor(props) {
        super(props);
        this.format = 'DD/MM/YYYY'
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.state = {
            reveal: false,
            date: moment()
        }
    }

    getDatePickerContainer(props) {
        const { className, children } = props;
        this.className = className
        this.lastChildren = children
        const div = getDatePickerContent()
        if (!this.datePicker) {
            this.datePicker = document.createElement('div')
            ReactDOM.render(<div style={{ position: 'relative' }} className={className}>{children}</div>, this.datePicker)
            div.appendChild(this.datePicker)
            this.datePicker.style.position = 'absolute';
            this.datePicker.style.display = 'block';
            this.datePicker.style.zIndex = 999999;
            this.datePicker.classList.add('newDatePicker')
            const rect = this.dom.getBoundingClientRect();
            if (window.innerWidth - rect.left > 203) {
                this.datePicker.style.left = rect.left + 'px';
            } else {
                this.datePicker.style.left = rect.left - (24 - this.dom.parentNode.clientWidth) + 'px';
            }
        }
        setTimeout(() => {
            const rect = this.dom.getBoundingClientRect();
            if (window.innerHeight - rect.top > this.datePicker.clientHeight) {
                this.datePicker.style.top = rect.top + this.dom.clientHeight + 'px';
            } else {
                this.datePicker.style.top = rect.top - this.datePicker.clientHeight + 'px';
            }
        }, 0);
        return <div></div>
    }

    reRender = () => {
        ReactDOM.render(<div style={{ position: 'relative' }} className={this.className}> {this.lastChildren} </div>, this.datePicker)
    }

    onInput = (e) => {
        const value = e.target.value
        let newValue = value.replace(/[^0-9]/g, '').replace(/(\..*)\./g, '$1');
        let error = ''
        const validate = (v, i) => {
            if (this.format === 'DD/MM/YYYY') {
                if (i === 0) {
                    if (parseInt(v) > 3) return '0' + v + '/'
                }
                if (i === 1) {
                    if (parseInt(value[0]) === 3) {
                        if (parseInt(v) > 1) return 1 + '/'
                    }
                    return v + '/'
                }
                if (i === 2) {
                    if (parseInt(v) > 1) return '0' + v + '/'
                }
                if (i === 3) {
                    if (parseInt(value[3]) === 1) {
                        if (parseInt(v) > 2) return 2 + '/'
                    }
                    return v + '/'
                }
                return v
            } if (this.format === 'MM/YYYY') {
                if (i === 0) {
                    if (parseInt(v) > 1) return '0' + v + '/'
                }
                if (i === 1) {
                    if (parseInt(value[3]) === 1) {
                        if (parseInt(v) > 2) return 2 + '/'
                    }
                    return v + '/'
                }
                return v
            }
        }
        if (e.target.value && e.target.oldValue && e.target.value.length < e.target.oldValue.length) {
            e.target.oldValue = e.target.value
            error = checkValidDateInput(e.target.value, this.format, this.props.limit, this.props.placeholder)
            if (!error) this.setState({ date: moment(e.target.value, this.format) });
            if (e.target.value) this.showError && this.showError(error)
            else this.showError && this.showError(`${this.props.placeholder} is required`)
            this.props.onChange && this.props.onChange(error ? '' : e.target.value)
            return
        }
        let lastValue = e.target.value || ''
        const isInvalid = lastValue.split('/').length !== (this.format === 'DD/MM/YYYY' ? 3 : 2)
        if (isInvalid) {
            lastValue = newValue.split('').map((v, i) => validate(v, i)).join('');
            e.target.value = lastValue
        }
        e.target.oldValue = e.target.value
        error = checkValidDateInput(lastValue, this.format, this.props.limit, this.props.placeholder)
        if (!error) this.setState({ date: moment(lastValue, this.format) });
        if (lastValue) this.showError && this.showError(error)
        else this.showError && this.showError(`${this.props.placeholder} is required`)
        this.props.onChange && this.props.onChange(error ? '' : lastValue)
    }

    showError = (err) => {
        if (err.length) {
            this.showErrorForm(err)
            this.dom.classList.add('haveErrorSignUp')
        } else {
            this.showErrorForm('')
            this.dom.classList.remove('haveErrorSignUp')
        }
    }

    onChangeDate(date) {
        const dateStr = moment(date).format(this.format)
        this.input && (this.input.value = dateStr || '');
        this.props.onChange && this.props.onChange(dateStr)
        this.close()
        this.setState({ date: moment(date) })
    }

    close() {
        this.datePicker && ReactDOM.render(null, this.datePicker);
        this.datePicker = null
        this.setOpen(false)
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside.bind(this));
        window.addEventListener('resize', this.onResize.bind(this))
    }

    componentWillUnmount() {
        this.close()
        document.removeEventListener('mousedown', this.handleClickOutside.bind(this));
        window.removeEventListener('resize', this.onResize.bind(this))
    }

    onResize() {
        if (this.datePicker) {
            const diffW = window.innerWidth - this.width
            const diffH = window.innerHeight - this.height
            const rect = this.datePicker.getBoundingClientRect()
            this.datePicker.style.left = rect.left + diffW / 2 + 'px'
            this.datePicker.style.top = rect.top + diffH / 2 + 'px'
            this.width = window.innerWidth
            this.height = window.innerHeight
        }
    }

    handleClickOutside(event) {
        if (!this.datePicker) return
        if (!this.datePicker.contains(event.target)) {
            this.close()
        }
    }

    handleKeyPress = (event) => {
        try {
            if (event.key === '/') {
                event.preventDefault();
                return
            }
            if (event.key === 'Enter') {
                this.props.onKeyPress && this.props.onKeyPress()
            }
        } catch (error) {
            console.error('handleKeyPress On String field' + error)
        }
    }

    render() {
        const limitDateObj = {}
        const limitDate = new Date(new Date().setFullYear(new Date().getFullYear() + parseInt(this.props.limit)))
        if (this.props.limit < 0) limitDateObj.maxDate = limitDate
        else limitDateObj.minDate = limitDate
        return <div className={s.input + (this.props.className ? ' ' + this.props.className : '')} style={this.props.style} >
            <div ref={ref => this.dom = ref}
                className={s.datePickerContainer}>
                <DatePicker selected={this.state.date.toDate()} onChange={date => this.onChangeDate(date)}
                    calendarContainer={this.getDatePickerContainer.bind(this)}
                    setOpen={cb => this.setOpen = cb}
                    {...limitDateObj}
                    onMonthChange={this.reRender}
                    customInput={<SvgIcon className={s.datePickerIcon} path={path.mdiCalendarBlank} />} />
            </div>
            <input
                ref={dom => {
                    this.input = dom
                }}
                autoComplete='off'
                type='tel'
                maxLength={this.format === 'DD/MM/YYYY' ? 10 : 7}
                placeholder={this.props.placeholder + (this.props.required ? ' *' : '')}
                onInput={this.onInput}
                onKeyPress={this.handleKeyPress.bind(this)}
                onBlur={this.onInput}
            />
            <div className={s.border1}></div>
            <div className={s.border2}></div>
            <Error fn={fn => this.showErrorForm = fn.showError} />
        </div>
    }
}
