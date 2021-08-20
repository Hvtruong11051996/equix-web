import React from 'react';
import uuidv4 from 'uuid/v4';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import NumberInput from '../Inc/NumberInput';
import SvgIcon, { path } from '../Inc/SvgIcon';
import {
    checkPropsStateShouldUpdate,
    getDropdownContentDom
} from '../../helper/functionUtils';
import Lang from '../Inc/Lang';

class NewInputDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.curentIndex = -1;
        this.lengthIndex = 0;
        this.lastDownTarget = null;
        this.id = uuidv4();
        this.searBox = `dropDownBoxSelector_${this.id}`;
        const state = this.updateOption();
        this.timeoutId1 = null;
        this.timeoutId2 = null;
        this.state = {
            value: this.props.value,
            option: state.option,
            exist: state.exist,
            show: true,
            hover: false,
            inputNumber: this.props.valueInput || 0
        };
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.hoverEvent = this.hoverEvent.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.checkDisableButtonCreateUser = this.checkDisableButtonCreateUser.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        try {
            if (!nextProps.options) return;
            this.updateOption(nextProps);
            this.decimalNumber()
            this.setState({ inputNumber: nextProps.valueInput || 0 })
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
                    if (v !== null) {
                        const item = typeof v === 'string' ? { value: v, label: v } : v;
                        exist[item.value] = item.label_priority || item.label;
                        option.push(item);
                    }
                });
                if (!newProps) {
                    return {
                        option: option,
                        exist: exist
                    }
                } else {
                    if (this.props.skipnull && !exist[this.state.value]) {
                        this.setState({ option, exist, value: option && option[0] && option[0].value, inputNumber: 0 }, () => {
                            this.onChange(this.state.value);
                            this.props.onChangeInput(0)
                        });
                    } else this.setState({ option, exist, value: props.value, inputNumber: props.valueInput })
                }
            }
        } catch (error) {
            logger.error('updateOption On DropDown' + error)
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

    setWrapperRef = (node) => {
        try {
            this.wrapperRef = node;
            if (node && node.offsetParent) {
                console.log(node)
                let div = getDropdownContentDom();
                node.querySelector('svg').addEventListener('mouseenter', () => {
                    if (this.props.readOnly || this.isShowing) return;
                    this.isShowing = true;
                    this.floatContent = document.createElement('div');
                    div.appendChild(this.floatContent);
                    ReactDOM.render(this.renderWithScroll(), this.floatContent);
                    // this.floatContent.style.zIndex = 100000
                    this.floatContent.style.position = 'absolute';
                    this.floatContent.style.display = 'block';
                    let dropdownMinWidth = node.clientWidth + 'px';
                    this.floatContent.style.minWidth = dropdownMinWidth;
                    document.addEventListener('mouseover', this.hoverEvent);
                    const rect = node.getBoundingClientRect();
                    const top = rect.top + node.offsetHeight;
                    const left = rect.left;
                    const totalWidth = left + this.floatContent.offsetWidth;
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
                    if (totalWidth > window.innerWidth) {
                        this.floatContent.style.left = (window.innerWidth - this.floatContent.offsetWidth) + 'px'
                    } else {
                        this.floatContent.style.left = rect.left + 'px';
                    }
                })
                node.addEventListener('mouseenter', (e) => {
                    if (node.querySelector('input')) return;
                    if (this.props.readOnly || this.isShowing) return;
                    this.isShowing = true;
                    this.floatContent = document.createElement('div');
                    div.appendChild(this.floatContent);
                    ReactDOM.render(this.renderWithScroll(), this.floatContent);
                    // this.floatContent.style.zIndex = 100000
                    this.floatContent.style.position = 'absolute';
                    this.floatContent.style.display = 'block';
                    let dropdownMinWidth = node.clientWidth + 'px';
                    this.floatContent.style.minWidth = dropdownMinWidth;
                    document.addEventListener('mouseover', this.hoverEvent);
                    const rect = node.getBoundingClientRect();
                    const top = rect.top + node.offsetHeight;
                    const left = rect.left;
                    const totalWidth = left + this.floatContent.offsetWidth;
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
                    if (totalWidth > window.innerWidth) {
                        this.floatContent.style.left = (window.innerWidth - this.floatContent.offsetWidth) + 'px'
                    } else {
                        this.floatContent.style.left = rect.left + 'px';
                    }
                });
            }
        } catch (error) {
            logger.error('setWrapperRef On DropDown' + error)
        }
    }

    handleClickOutside(event) {
        try {
            if (this.state.show) return;
            if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
                this.setState({
                    show: false
                }, () => {
                    this.timeoutId1 = setTimeout(() => {
                        this.timeoutId1 = null;
                        this.setState({
                            show: true
                        })
                    }, 350)
                });
            }
        } catch (error) {
            logger.error('handleClickOutside On DropDown' + error)
        }
    }

    disableDropdown() {
        document.removeEventListener('mouseover', this.hoverEvent);
        ReactDOM.render(null, this.floatContent);
        this.floatContent.parentNode.removeChild(this.floatContent);
        this.isShowing = false;
    }

    decimalNumber = () => {
        if (this.props.formatType === 'price') return 4
        else if (this.props.formatType === 'value%') return 2
        else if (this.props.formatType === 'volumn') return 0
    }

    onBlur = (target) => {
        this.isFocus = false
        this.forceUpdate()
    }

    onChange = (e) => {
        try {
            this.setState({
                value: e, show: false
            }, () => {
                this.timeoutId2 = setTimeout(() => {
                    this.timeoutId2 = null;
                    this.setState({
                        show: true
                    })
                }, 350)
            });
            if (typeof this.props.onChange === 'function') {
                this.disableDropdown()
                this.props.onChange(e, this.props.stateName);
            }
        } catch (error) {
            logger.error('onChange On DropDown' + error)
        }
    }

    renderDefault() {
        try {
            const option = this.state.option.find(e => e.value === this.state.value)
            return <div id={`dropDownBoxSelector_${this.id}`} className='showTitle' ref={dom => this.dom = dom}>
                {
                    this.state.value !== 'USER_INPUT'
                        ? this.props.translate ? <div className={`${(option && option.className) || 'text-capitalize'} size--3 showTitle paddingRight8`}><Lang>{this.state.exist[this.state.value] || '--'}</Lang></div>
                            : <div className={`${(option && option.className) || 'text-capitalize'} size--3 showTitle paddingRight8`}>{this.state.exist[this.state.value] || '--'}</div>
                        : <NumberInput
                            negative={this.props.isMin} // nhap -
                            decimal={this.decimalNumber()} // sp thap phan
                            value={this.props.valueInput}
                            onChange={this.props.onChangeInput}
                        />
                }
                <div className={`percent-icon text-center ${this.props.formatType !== 'value%' ? 'hidden' : ''}`}
                    onClick={() => this.dom.querySelector('.NewInputDropdown input').focus()}>%
                </div>
                <div className={`${this.props.disableArowIconDropdown || this.props.formatType === 'value%' ? 'hidden' : ''}`}><SvgIcon path={path.mdiChevronDown} /></div>
            </div>
        } catch (error) {
            logger.error('renderDefault On DropDown' + error)
        }
    }

    handleKeyPress = (event, value) => {
        try {
            if (event.key === 'Enter') {
                this.onChange(value)
            }
        } catch (error) {
            logger.error('handleKeyPress On DropDown' + error)
        }
    }

    renderWithScroll() {
        const upperCase = this.props.upperCase ? 'text-uppercase' : ''
        return (
            <div className={`${this.props.className || ''} list`}>
                {
                    this.state.option.map((v, k) => {
                        const disableClass = this.props.listDisable && this.props.listDisable.includes(v.value) ? 'disableSelect' : ''
                        return (
                            <div
                                id={`itemDropDown_${this.id}_${k}`}
                                className={`${v.value === this.state.value ? 'size--3 activeDropDown' : 'size--3'} ${this.checkDisableButtonCreateUser(v)} ${disableClass} showTitle`}
                                key={k}
                                onClick={() => this.onChange(v.value)}>
                                {
                                    this.props.translate ? <span className={`${v.className || 'text-capitalize'} text-overflow showTitle ${upperCase}`}><Lang>{v.label}</Lang></span> : <span className={`${v.className || 'text-capitalize'} text-overflow showTitle ${upperCase}`}>{v.label}</span>
                                }{v.value === this.state.value ? <div><SvgIcon path={path.mdiCheck} fill='var(--ascend-default)' /></div> : null}
                            </div>
                        )
                    })
                }
            </div>
        )
    }
    checkDisableButtonCreateUser(v) {
        if (this.props.userGroup) {
            if (v.value === 0 && this.props && this.props.listAccount && this.props.listAccount.length > 1 && this.props.listAccount[0] !== 0) {
                return 'qe-disabled-createUser';
            }
        };
    }
    render() {
        try {
            return (
                <div
                    className={`dropDown size--3 NewInputDropdown ${this.state.show ? '' : 'close'} ${this.props.className || ''}`}
                    onMouseOver={this.listenerMouseDown.bind(this)}
                    onMouseOut={() => this.lastDownTarget = null}
                    ref={this.setWrapperRef}>
                    {this.renderDefault()}
                </div>
            );
        } catch (error) {
            logger.error('render On DropDown' + error)
        }
    }

    hoverEvent(event) {
        console.log('hover', event)
        if (event.target) {
            if (this.wrapperRef) {
                if (this.wrapperRef.contains(event.target) || this.floatContent.contains(event.target)) {

                } else {
                    this.disableDropdown()
                }
            }
        }
    }

    componentDidMount() {
        try {
            this.mounted = true
            this.lastDownTarget = null;
            document.addEventListener('keydown', this.listenerKeyDown.bind(this), false);
            document.addEventListener('mousedown', this.handleClickOutside);
        } catch (error) {
            logger.error('componentDidMount On DropDown' + error)
        }
    }

    componentWillUnmount() {
        try {
            const dropDownContent = document.getElementById('dropDownContent')
            dropDownContent && this.floatContent && dropDownContent.contains(this.floatContent) && dropDownContent.removeChild(this.floatContent);
            document.removeEventListener('mousedown', this.handleClickOutside);
            document.removeEventListener('keydown', this.listenerKeyDown.bind(this), false);
            this.timeoutId1 && clearTimeout(this.timeoutId1);
            this.timeoutId2 && clearTimeout(this.timeoutId2);
        } catch (error) {
            logger.error('componentWillUnmount On DropDown' + error)
        }
    }
}

export default NewInputDropdown;
