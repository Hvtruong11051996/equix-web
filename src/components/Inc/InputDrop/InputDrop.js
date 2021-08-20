import React from 'react';
import SvgIcon, { path } from '../SvgIcon'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import uuidv4 from 'uuid/v4';
import logger from '../../../helper/log';
import dataStorage from '../../../dataStorage';
import { checkPropsStateShouldUpdate, formatNumberPrice, getDropdownContentDom } from '../../../helper/functionUtils';
import { translate } from 'react-i18next';

class InputDrop extends React.Component {
    constructor(props) {
        super(props);
        this.curentIndex = -1;
        this.lengthIndex = 0;
        this.lastDownTarget = null;
        this.receiveChange = true;
        this.id = uuidv4();
        this.isMount = false
        this.searBox = `dropDownBoxSelector_${this.id}`;
        const state = this.updateOption();
        this.state = {
            value: this.props.value,
            option: state.option,
            exist: state.exist,
            show: true,
            hover: false
        };
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.listenerMouseDown = this.listenerMouseDown.bind(this);
        this.onClickMouseDown = this.onClickMouseDown.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        try {
            if (!nextProps.options) return;
            this.updateOption(nextProps);
        } catch (error) {
            logger.error('componentWillReceiveProps On DropDown' + error)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (dataStorage.checkUpdate) {
                const check = checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
                return check;
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On DropDown', error)
        }
    }

    updateOption(newProps) {
        try {
            let option = [];
            let exist = {};
            const props = newProps || this.props;
            if (props.options) {
                props.options.map((v, k) => {
                    const item = typeof v === 'string' ? { value: v, label: v } : v;
                    exist[item.value] = item.label;
                    option.push(item);
                });
                if (!newProps) {
                    return {
                        option: option,
                        exist: exist
                    }
                } else {
                    this.isMount && this.setState({ option, exist, value: props.value });
                }
            } else return {}
        } catch (error) {
            logger.error('updateOption On DropDown' + error)
        }
    }

    componentWillUnmount() {
        try {
            this.isMount = false
            document.removeEventListener('mousedown', this.handleClickOutside);
        } catch (error) {
            logger.error('componentWillUnmount On DropDown' + error)
        }
    }

    listenerMouseDown(event) {
        try {
            this.lastDownTarget = event.target;
            if (this.lastDownTarget && (this.lastDownTarget.id === this.searBox || (this.lastDownTarget.parentNode && this.lastDownTarget.parentNode.id === this.searBox))) {
                this.curentIndex = -1;
            }
        } catch (error) {
            logger.error('listenerMouseDown On DropDown' + error)
        }
    }

    nextHoverElement(unit) {
        try {
            this.curentIndex = this.curentIndex + unit;
            if (unit < 0 && this.curentIndex <= 0) {
                this.curentIndex = 0;
            }
            const nextElement = document.getElementById(`itemDropDown_${this.id}_${this.curentIndex}`);
            const currentlement = document.getElementById(`itemDropDown_${this.id}_${this.curentIndex - unit}`);
            if (nextElement) {
                nextElement.className = nextElement.className + ' dropDownHover';
            } else {
                if (this.curentIndex > 0 || this.curentIndex < 0) {
                    this.curentIndex = -1;
                    this.nextHoverElement(unit);
                }
            }
            if (currentlement) {
                currentlement.className = (currentlement.className + '').replace(/dropDownHover/g, '');
            }
        } catch (error) {
            logger.error('nextHoverElement On DropDown' + error)
        }
    }

    listenerKeyDown(event) {
        try {
            if (this.lastDownTarget && this.searBox && (this.lastDownTarget.id === this.searBox || (this.lastDownTarget.parentNode && this.lastDownTarget.parentNode.id === this.searBox))) {
                if (event.keyCode === 40) {
                    this.nextHoverElement(1);
                    // down
                }
                if (event.keyCode === 38) {
                    // up
                    this.nextHoverElement(-1);
                }
                if (event.keyCode === 13) {
                    const nextElement = document.getElementById(`itemDropDown_${this.id}_${this.curentIndex}`);
                    if (nextElement) {
                        // textContent
                        for (let index = 0; index < this.state.option.length; index++) {
                            const element = this.state.option[index];
                            if (nextElement.textContent === element.label) {
                                this.onChange(element.value)
                                break;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            logger.error('listenerKeyDown On DropDown' + error)
        }
    }

    disableDropdown = () => {
        document.removeEventListener('mouseover', this.hoverEvent);
        if (this.floatContent) {
            ReactDOM.render(null, this.floatContent);
            this.floatContent.parentNode && this.floatContent.parentNode.removeChild(this.floatContent)
            if (this.props.onBlur) this.props.onBlur()
        };
        this.isShowing = false;
    }
    hoverEvent = (event) => {
        if (event.target) {
            if (this.wrapperRef) {
                if (this.wrapperRef.contains(event.target) || this.floatContent.contains(event.target)) {

                } else {
                    this.disableDropdown()
                }
            }
        }
    }
    setWrapperRef = (node) => {
        try {
            if (this.props.suppressDropDown) return
            this.wrapperRef = node;
            if (node) {
                let div = getDropdownContentDom()
                node.addEventListener('mouseenter', () => {
                    if (this.props.readOnly || this.isShowing) return;
                    this.isShowing = true;
                    this.floatContent = document.createElement('div');
                    div.appendChild(this.floatContent);
                    ReactDOM.render(this.renderWithScroll(), this.floatContent);
                    // this.floatContent.style.zIndex = 100000
                    this.floatContent.style.position = 'absolute';
                    this.floatContent.style.display = 'block';
                    const e = this.floatContent.querySelector('.list')
                    if (e) {
                        e.style.opacity = 0
                        e.style.position = 'relative'
                        this.floatContent.style.width = e.offsetWidth + 'px'
                        e.style.opacity = null
                        e.style.position = null
                    }
                    this.floatContent.style.minWidth = node.clientWidth + 'px';
                    document.addEventListener('mouseover', this.hoverEvent);
                    const rect = node.getBoundingClientRect();
                    const top = rect.top + node.offsetHeight;
                    const spaceBottom = window.innerHeight - top
                    if (rect.top > spaceBottom && spaceBottom < 100) {
                        this.floatContent.style.bottom = (spaceBottom + node.offsetHeight) + 'px';
                        this.floatContent.style.maxHeight = (rect.top > 336 ? 336 : rect.top) + 'px'
                        this.floatContent.style.top = null;
                    } else {
                        this.floatContent.style.top = (rect.top + node.offsetHeight) + 'px';
                        this.floatContent.style.bottom = null
                        this.floatContent.style.maxHeight = (spaceBottom > 336 ? 336 : spaceBottom) + 'px'
                    }
                    if (!this.props.rightAlign) {
                        const left = rect.left;
                        const totalWidth = left + this.floatContent.offsetWidth;
                        if (totalWidth > window.innerWidth) {
                            this.floatContent.style.left = (window.innerWidth - this.floatContent.offsetWidth) + 'px'
                        } else {
                            this.floatContent.style.left = rect.left + 'px';
                        }
                    } else {
                        const right = rect.right;
                        const maxRange = right <= window.innerWidth ? right : window.innerWidth
                        this.floatContent.style.left = (maxRange - this.floatContent.offsetWidth) + 'px';
                    }
                    if (this.props.widthContent) {
                        this.floatContent.style.width = this.props.widthContent + 'px'
                    }
                });
            }
        } catch (error) {
            logger.error('setWrapperRef On DropDown' + error)
        }
    }

    handleClickOutside(event) {
        try {
            if (this.props.withInput) return;
            if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
                this.isMount && this.setState({
                    show: false
                }, () => setTimeout(() => {
                    this.isMount && this.setState({ show: true })
                }, 350));
            }
        } catch (error) {
            logger.error('handleClickOutside On DropDown' + error)
        }
    }

    onChange = (e) => {
        try {
            this.isMount && this.setState({
                value: e, show: false
            }, () => setTimeout(() => this.isMount && this.setState({
                show: true
            }), 350));
            if (typeof this.props.onChange === 'function') {
                this.disableDropdown()
                this.props.onChange(e, this.props.stateName || null);
            }
        } catch (error) {
            logger.error('onChange On DropDown' + error)
        }
    }

    handleInputDrop(e) {
        let number
        if (this.props.formatType === 'price') number = 4
        const regex = new RegExp(`\\.([0-9]{${number}})[0-9]+$`)
        if (number) {
            if (/[^\d.]/.test(e.target.value)) e.target.value = (e.target.value + '').replace(/[^\d.]/g, '')
        }
        if (/(\.[\d]*)\./.test(e.target.value)) e.target.value = (e.target.value + '').replace(/(\.[\d]*)\./g, '$1')
        if (regex.test(e.target.value)) e.target.value = e.target.value.replace(regex, '.$1')
        const text = e.target.value;
        this.props.onChangeInput && this.props.onChangeInput(text, this.props.stateName)
    }

    handleBlur(e) {
        this.receiveChange = true;
        const text = e.target.value;
        if (text === '' || parseFloat(text) === 0) {
            this.isMount && this.setState({
                value: '0'
            }, () => this.props.onChangeInput && this.props.onChangeInput(this.state.value, this.props.stateName))
        }
    }

    handleFocus() {
        this.receiveChange = false;
    }

    renderDefault() {
        try {
            const { t } = this.props;
            const showText = this.state.exist[this.state.value] || this.props.placeholder || '';
            const showTextInput = this.state.exist[this.state.value + ''] || this.state.value + '' || '';

            if (this.props.withInput) {
                let keyTrans = ''
                let text = ''
                if (showTextInput && showTextInput.$$typeof) {
                    keyTrans = showText.props.children
                    text = t(`${keyTrans}`)
                } else {
                    if (showTextInput === '') {
                        //
                    } else {
                        if (!this.receiveChange) {
                            text = showTextInput
                        } else {
                            text = this.props.format === 'int' ? formatNumberPrice(showTextInput) : formatNumberPrice(showTextInput, true, true)
                        }
                    }
                }
                return <div id={`dropDownBoxSelector_${this.id}`} className=''>
                    <input className='inputInDrop size--3' value={text} onChange={this.handleInputDrop.bind(this)} onFocus={this.handleFocus.bind(this)} onBlur={this.handleBlur.bind(this)} maxLength="15" />
                    {this.props.suppressDropDown ? null : <div > <SvgIcon path={path.mdiChevronDown} /></div>}
                </div>
            }
            if (this.props.title === 'Header') {
                return <div id={`dropDownBoxSelector_${this.id}`} className='showTitle'>
                    <div className='dropDownValue size--3'>{showText}</div>
                    {this.props.suppressDropDown ? null : <div > <SvgIcon path={path.mdiChevronDown} /></div>}
                </div>
            } else {
                return <div id={`dropDownBoxSelector_${this.id}`} className='showTitle'>
                    <div className='size--3'>{showText}</div>
                    {this.props.suppressDropDown ? null : <div > <SvgIcon path={path.mdiChevronDown} /></div>}
                </div>
            }
        } catch (error) {
            logger.error('renderDefault On DropDown' + error)
        }
    }

    handleKeyPress = (event, value) => {
        try {
            if (event.key === 'Enter') {
                this.onChange(value);
                this.isMount && this.setState({ show: false }, () => setTimeout(() => this.isMount && this.setState({ show: true }, 300)))
            }
        } catch (error) {
            logger.error('handleKeyPress On DropDown' + error)
        }
    }

    renderWithScroll() {
        const scroll = this.props.scroll
        if (scroll) {
            const lst = this.state.option.map((v, k) => {
                let value = v.value ? v.value : (v.value === '' ? '' : v)
                let label = v.label ? v.label : v
                value = value + '';
                if (this.props.type === 'number' && this.props.format === 'int') {
                    label = formatNumberPrice(label)
                } else if (this.props.type === 'number' && this.props.format !== 'int') {
                    label = formatNumberPrice(label, true, true)
                } else {
                    //
                }
                let valueCurrent = this.props.format === 'int' ? this.state.value + '' : formatNumberPrice(this.state.value, true, true)
                return (
                    <div
                        id={`itemDropDown_${this.id}_${k}`}
                        className={`showTitle size--3 ${value === valueCurrent ? 'activeDropDown' : ''}`}
                        key={k}
                        onClick={() => this.onChange(value)}>
                        {label}{value === valueCurrent ? <SvgIcon path={path.mdiCheck} fill='var(--ascend-default)' /> : null}
                    </div>
                )
            });
            let index = this.state.option.findIndex(x => parseFloat(x.value) === parseFloat(this.state.value)) || 0;
            this.domScroll && (this.domScroll.scrollTop = (index - 2) * 32)

            const heightLst = this.props.withInput ? { height: '160px' } : {}
            heightLst.overflow = 'auto';

            return (<div style={heightLst}>
                <div id={`scrollNumber_${this.id}`}>
                    <div className={`list`} >
                        {
                            lst
                        }
                    </div>
                </div>
            </div>)
        } else {
            return (
                <div className={`list`} >
                    {
                        this.state.option.map((v, k) => {
                            const checkDiv = v.checkDiv ? v.checkDiv : null
                            let value = v.value ? v.value : (v.value === '' ? '' : v)
                            let label = v.label
                            value = value + '';
                            if (this.props.type === 'number' && this.props.format === 'int') {
                                label = formatNumberPrice(label)
                            } else if (this.props.type === 'number' && this.props.format !== 'int') {
                                label = formatNumberPrice(label, true, true)
                            } else {
                                //
                            }
                            let valueCurrent = this.state.value + ''
                            return (
                                <div
                                    id={`itemDropDown_${this.id}_${k}`}
                                    className={`size--3 showTitle ${value === valueCurrent ? ' activeDropDown' : ''}`}
                                    key={k}
                                    onClick={() => this.onChange(value)}>
                                    {label}{value === valueCurrent ? <SvgIcon path={path.mdiCheck} fill='var(--ascend-default)' /> : null}
                                </div>
                            )
                        })
                    }
                </div>)
        }
    }
    onClickMouseDown(event) {
        let check = this.props.value;
        if (event && Number(check) === 0) {
            this.isMount && this.setState({
                value: ''
            })
        }
    }
    render() {
        try {
            return (
                <MuiThemeProvider>
                    <div
                        className={`inputDrop size--3 ${this.props.title === 'Header' ? 'header' : ''} ${this.state.show ? '' : 'close'} ${this.props.className || ''}`}
                        onMouseOver={this.listenerMouseDown.bind(this)}
                        onMouseOut={() => this.lastDownTarget = null}
                        onClick={this.onClickMouseDown.bind(this)}
                        ref={this.setWrapperRef}>
                        {this.renderDefault()}
                    </div>
                </MuiThemeProvider>
            );
        } catch (error) {
            logger.error('render On DropDown' + error)
        }
    }

    componentDidMount() {
        try {
            this.isMount = true
            this.lastDownTarget = null;
            document.addEventListener('keydown', this.listenerKeyDown.bind(this), false);
            document.addEventListener('mousedown', this.handleClickOutside);
            document.removeEventListener('mouseover', this.hoverEvent);
            this.domScroll = document.getElementById(`scrollNumber_${this.id}`)
            this.domScroll && (this.domScroll.scrollTop = 579)
            if (this.props.sort) {
                this.isMount && this.setState({
                    option: this.state.option.sort((a, b) => {
                        return b.value - a.value
                    })
                })
            }
        } catch (error) {
            logger.error('componentDidMount On DropDown' + error)
        }
    }
}

export default translate('translations')(InputDrop);
