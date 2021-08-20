import React, { useEffect, useState, useRef } from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import Icon from '../../../Inc/Icon'
import SvgIcon, { path } from '../../SvgIcon'
import s from '../Form.module.css'
import { FIELD, CARD_COLOUR } from '../../../OpeningAccount/constant'
import { checkValidDateInput, getDatePickerContent } from '../../../../helper/functionUtils';

class DateTime extends React.Component {
    constructor(props) {
        super(props);
        this.input = null;
        this.format = 'DD/MM/YYYY'
        this.getFormat(props)
        const initValue = this.isValidDate(props.value) ? props.value : null
        this.state = {
            date: initValue ? moment(props.value) : moment(),
            disable: !!props.schema.disable
        }
        this.cardColour = props.data[FIELD.CARD_COLOUR]
    }

    getFormat(props) {
        if (props.name === FIELD.CARD_EXPIRY_DATE) {
            if (props.data[FIELD.CARD_COLOUR] === CARD_COLOUR.GREEN) {
                this.format = 'MM/YYYY'
                this.input && this.input.setAttribute('maxLength', 7)
            } else {
                this.format = 'DD/MM/YY'
                this.input && this.input.setAttribute('maxLength', 8)
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data[FIELD.CARD_COLOUR] !== this.cardColour) {
            if (this.input && this.input.value) {
                if (nextProps.data[FIELD.CARD_COLOUR] === CARD_COLOUR.GREEN) {
                    this.input.value = ''
                } else if (this.cardColour === CARD_COLOUR.GREEN) {
                    this.input.value = ''
                }
            }
            this.cardColour = this.cardColour = nextProps.data[FIELD.CARD_COLOUR]
        } else {
            this.input && (this.input.value = nextProps.value || '')
        }
        const state = { disable: nextProps.schema.disable }
        this.getFormat(nextProps)
        if (!checkValidDateInput(nextProps.value, this.format, nextProps.schema.limit, nextProps.schema.title, nextProps.schema.errorText)) {
            state.date = nextProps.value ? moment(nextProps.value, this.format) : moment()
        }
        this.setState(state)
    }

    handleClickOutside(event) {
        if (!this.datePicker) return
        if (!this.datePicker.contains(event.target)) {
            this.close()
        }
    }

    close() {
        this.datePicker && ReactDOM.render(null, this.datePicker);
        this.datePicker = null
        this.setOpen(false)
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside.bind(this));
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

    onInput = (e) => {
        const value = e.target.value
        let newValue = value.replace(/[^0-9]/g, '').replace(/(\..*)\./g, '$1');
        if (this.isInvalid(value)) {
            e.target.value = e.target.oldValue;
            return
        }
        const validate = (v, i) => {
            if (this.format === 'DD/MM/YYYY' || this.format === 'DD/MM/YY') {
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
            } else if (this.format === 'MM/YYYY') {
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
            } else if (this.format === 'DD/MM/YY') {
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
            }
        }
        if (e.target.value && e.target.oldValue && e.target.value.length < e.target.oldValue.length) {
            e.target.oldValue = e.target.value
            if (!checkValidDateInput(e.target.value, this.format, this.props.schema.limit, this.props.schema.title, this.props.schema.errorText)) {
                this.setState({ date: moment(e.target.value, this.format) });
            }
            this.props.onChange && this.props.onChange(e.target.value)
            return
        }
        let lastValue = e.target.value || ''
        const isInvalid = lastValue.split('/').length !== (this.format === 'MM/YYYY' ? 2 : 3)
        if (isInvalid) {
            lastValue = newValue.split('').map((v, i) => validate(v, i)).join('');
            e.target.value = lastValue
        }
        e.target.oldValue = e.target.value
        if (!checkValidDateInput(lastValue, this.format, this.props.schema.limit, this.props.schema.title, this.props.schema.errorText)) {
            this.setState({ date: moment(lastValue, this.format) });
        }
        this.props.onChange && this.props.onChange(lastValue)
    }

    isValidDate(value) {
        return +new Date(value) > 0
    }

    isInvalid(value = '') {
        const lst = value.split('/')
        if (this.format === 'MM/YYYY') {
            return lst[0].length > 2 || (lst[1] && lst[1].length > 4)
        } else if (this.format === 'DD/MM/YYYY') {
            return lst[0].length > 2 || (lst[1] && lst[1].length > 2) || (lst[2] && lst[2].length > 4)
        }
    }

    onChangeDate(date) {
        const dateStr = moment(date).format(this.format)
        this.input && (this.input.value = dateStr || '');
        this.props.onChange && this.props.onChange(dateStr)
        this.close()
        this.setState({ date: moment(date) })
    }

    reRender = () => {
        ReactDOM.render(<div style={{ position: 'relative' }} className={this.className}> {this.lastChildren} </div>, this.datePicker)
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

    render() {
        if (this.props.schema.notEdit) return <div style={{ display: 'flex', justifyContent: 'flex-end' }}> {this.props.value} </div>
        if (this.state.disable) {
            return <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '24px',
                border: '1px solid var(--border)',
                paddingRight: '8px',
                cursor: 'not-allowed',
                boxSizing: 'border-box'
            }}>
                <span style={{
                    display: 'flex',
                    height: '100%',
                    alignItems: 'center',
                    borderRight: '1px solid var(--border)'
                }}> <Icon src={'editor/insert-invitation'} style={{ 'height': '16px', 'marginLeft': '6px', 'marginRight': '6px' }} color={'#758696'} /></span>
                {this.state.date.format(this.format)}
            </div>
        } else if (this.props.editable) {
            const limitDateObj = {}
            const limitDate = new Date(new Date().setFullYear(new Date().getFullYear() + parseInt(this.props.schema.limit)))
            if (this.props.schema.limit < 0) limitDateObj.maxDate = limitDate
            else limitDateObj.minDate = limitDate
            return (
                <div style={{
                    display: 'flex',
                    flex: 1,
                    position: 'relative'
                }}>
                    <div
                        ref={ref => this.dom = ref}
                        style={{
                            display: 'flex',
                            position: 'absolute',
                            borderRight: '1px solid var(--border)',
                            height: '24px'
                        }}>
                        <DatePicker
                            selected={this.state.date.toDate()}
                            onChange={date => this.onChangeDate(date)}
                            calendarContainer={this.getDatePickerContainer.bind(this)}
                            setOpen={cb => this.setOpen = cb}
                            {...limitDateObj}
                            onMonthChange={this.reRender}
                            customInput={<SvgIcon className={s.datePickerIcon} path={path.mdiCalendarBlank} />} />
                    </div>
                    <div style={{
                        display: 'flex',
                        flex: 1
                    }}>
                        <input
                            ref={dom => {
                                this.input = dom
                                this.props.setDom(dom)
                            }}
                            autoComplete='off'
                            type='tel'
                            maxLength={this.format === 'DD/MM/YYYY' ? 10 : 7}
                            placeholder={this.format}
                            onInput={this.onInput}
                            onKeyPress={this.handleKeyPress.bind(this)}
                            onFocus={() => this.props.onFocus()}
                            onBlur={() => this.props.onBlur()}
                            defaultValue={this.props.value}
                            name={this.props.name} />
                    </div>
                </div>
            )
        } else {
            return <div style={{ display: 'flex', justifyContent: 'flex-end' }}> {this.props.value} </div>
        }
    }
}
export default DateTime;
