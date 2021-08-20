import React from 'react';
import Icon from '../Inc/Icon'
import SvgIcon, { path } from '../Inc/SvgIcon'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import uuidv4 from 'uuid/v4';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import { checkPropsStateShouldUpdate, getDropdownContentDom, clone, capitalizer, getTextByTextClassName } from '../../helper/functionUtils';
import Lang from '../Inc/Lang';
import NoTag from '../Inc/NoTag/NoTag';
import { func } from '../../storage';
import { emitter, eventEmitter } from '../../constants/emitter_enum'
class DropDown extends React.Component {
    constructor(props) {
        super(props);
        this.curentIndex = -1;
        this.lengthIndex = 0;
        this.lastDownTarget = null;
        this.id = uuidv4();
        this.searchBox = `dropDownBoxSelector_${this.id}`;
        const state = this.updateOption();
        this.timeoutId1 = null;
        this.timeoutId2 = null;
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.state = {
            value: this.props.value,
            option: state.option,
            exist: state.exist,
            show: true,
            hover: false,
            connected: dataStorage.connected
        };
        if (this.props.multi && !Array.isArray(this.state.value)) this.state.value = [];
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

    changeConnection = connect => {
        if (this.floatContent) {
            setTimeout(() => {
                const rect = this.wrapperRef.getBoundingClientRect();
                const top = rect.top + this.wrapperRef.offsetHeight;
                const spaceBottom = window.innerHeight - top
                if (rect.top > spaceBottom && spaceBottom < 100) {
                    this.floatContent.style.bottom = (spaceBottom + this.wrapperRef.offsetHeight) + 'px';
                    this.floatContent.style.top = null;
                } else {
                    this.floatContent.style.top = (rect.top + this.wrapperRef.offsetHeight) + 'px';
                    this.floatContent.style.bottom = null
                }
            }, 800);
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
                    exist[item.value] = item
                    option.push(item);
                });
                if (!newProps) {
                    return {
                        option: option,
                        exist: exist
                    }
                } else {
                    const value = props.value === undefined ? this.state.value : props.value
                    if (this.props.skipnull && !exist[value] && option && option[0]) {
                        this.setState({ option, exist, value: option[0].value }, () => {
                            this.onChange(this.state.value);
                        });
                    } else this.setState({ option, exist, value: value })
                }
            }
        } catch (error) {
            logger.error('updateOption On DropDown' + error)
        }
    }

    listenerMouseDown(event) {
        try {
            this.lastDownTarget = event.target;
            if (this.lastDownTarget && (this.lastDownTarget.id === this.searchBox || (this.lastDownTarget.parentNode && this.lastDownTarget.parentNode.id === this.searchBox))) {
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
            if (this.lastDownTarget && this.searchBox && (this.lastDownTarget.id === this.searchBox || (this.lastDownTarget.parentNode && this.lastDownTarget.parentNode.id === this.searchBox))) {
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

    setWrapperRef(node) {
        try {
            this.wrapperRef = node;
            if (node) {
                let div = getDropdownContentDom()
                if (this.props.onlyClick) {
                    node.addEventListener('click', () => {
                        if (this.props.readOnly || this.isShowing) return;
                        this.isShowing = true;
                        this.floatContent = document.createElement('div');
                        if (this.props.isFooter) this.floatContent.classList.add('footerShadow')
                        div.appendChild(this.floatContent);
                        ReactDOM.render(this.renderWithScroll(), this.floatContent);
                        // this.floatContent.style.zIndex = 100000
                        this.floatContent.style.position = 'absolute';
                        this.floatContent.style.display = 'block';
                        this.floatContent.style.boxShadow = 'var(--shadow)';
                        const e = this.floatContent.querySelector('.list')
                        if (e) {
                            e.style.opacity = 0
                            e.style.position = 'relative'
                            this.floatContent.style.width = e.offsetWidth + 'px'
                            e.style.opacity = null
                            e.style.position = null
                        }
                        let dropdownMinWidth;
                        switch (this.props.name) {
                            case 'language':
                                dropdownMinWidth = '160px';
                                break;
                            case 'fontSize':
                                dropdownMinWidth = '115px';
                                break;
                            case 'theme':
                                dropdownMinWidth = '146px';
                                break;
                            case 'brokerHeader':
                                // dropdownMinWidth = this.wrapperRef.clientWidth + 'px'
                                dropdownMinWidth = '160px'
                                break;
                            case 'brokerTabDropDown':
                                dropdownMinWidth = this.wrapperRef.clientWidth + 2 + 'px'
                                break;
                            default:
                                // dropdownMinWidth = node.clientWidth + 2 + 'px';
                                dropdownMinWidth = node.getBoundingClientRect().width - 2 + 'px';
                                break;
                        }
                        this.floatContent.style.minWidth = dropdownMinWidth;
                        document.addEventListener('mouseover', this.hoverEvent);
                        const rect = node.getBoundingClientRect();
                        const top = rect.top + node.offsetHeight;
                        const spaceBottom = window.innerHeight - top - 8
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
                            const totalWidth = rect.left + this.floatContent.offsetWidth;
                            if (totalWidth > window.innerWidth) {
                                this.floatContent.style.left = (window.innerWidth - this.floatContent.offsetWidth) + 'px'
                            } else {
                                if (this.props.position === 'left') this.floatContent.style.left = rect.left + 'px';
                                else this.floatContent.style.left = (rect.left - (this.floatContent.offsetWidth - rect.width) - 1) + 'px'
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
                } else {
                    if (this.props.disable) return
                    node.addEventListener('mouseenter', () => {
                        if (this.props.readOnly || this.isShowing) return;
                        this.isShowing = true;
                        this.floatContent = document.createElement('div');
                        if (this.props.isFooter) this.floatContent.classList.add('footerShadow')
                        div.appendChild(this.floatContent);
                        ReactDOM.render(this.renderWithScroll(), this.floatContent);
                        // this.floatContent.style.zIndex = 100000
                        this.floatContent.style.position = 'absolute';
                        this.floatContent.style.maxWidth = '336px';
                        this.floatContent.style.display = 'block';
                        this.floatContent.style.boxShadow = '0 2px 5px 0 #000';
                        const e = this.floatContent.querySelector('.list')
                        if (e) {
                            e.style.opacity = 0
                            e.style.position = 'relative'
                            this.floatContent.style.width = e.offsetWidth + 'px'
                            e.style.opacity = null
                            e.style.position = null
                        }
                        let dropdownMinWidth;
                        switch (this.props.name) {
                            case 'language':
                                dropdownMinWidth = '160px';
                                break;
                            case 'fontSize':
                                dropdownMinWidth = '115px';
                                break;
                            case 'theme':
                                dropdownMinWidth = '146px';
                                break;
                            case 'brokerHeader':
                                // dropdownMinWidth = this.wrapperRef.clientWidth + 'px'
                                dropdownMinWidth = '160px'
                                break;
                            case 'brokerTabDropDown':
                                dropdownMinWidth = this.wrapperRef.clientWidth + 2 + 'px'
                                break;
                            default:
                                // dropdownMinWidth = node.clientWidth + 2 + 'px';
                                dropdownMinWidth = node.getBoundingClientRect().width - 2 + 'px';
                                break;
                        }
                        this.floatContent.style.minWidth = dropdownMinWidth;
                        document.addEventListener('mouseover', this.hoverEvent);
                        const rect = node.getBoundingClientRect();
                        const top = rect.top + node.offsetHeight;
                        const spaceBottom = window.innerHeight - top - 8
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
                            const totalWidth = rect.left + this.floatContent.offsetWidth;
                            if (totalWidth > window.innerWidth) {
                                this.floatContent.style.left = (window.innerWidth - this.floatContent.offsetWidth) + 'px'
                            } else {
                                if (this.props.position === 'left') this.floatContent.style.left = rect.left + 'px';
                                else {
                                    const left = rect.left - (this.floatContent.offsetWidth - rect.width) - 1;
                                    this.floatContent.style.left = (left < 0 ? 0 : left) + 'px'
                                }
                            }
                        } else {
                            const right = rect.right;
                            const maxRange = right <= window.innerWidth ? right : window.innerWidth
                            this.floatContent.style.left = (maxRange - this.floatContent.offsetWidth) + 'px';
                        }
                        if (this.props.floatLeft) this.floatContent.style.left = rect.left + 'px'
                        if (this.props.widthContent) {
                            this.floatContent.style.width = this.props.widthContent + 'px'
                        }
                    });
                }
                this.props.domFn && this.props.domFn(node)
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
        if (this.floatContent) {
            ReactDOM.render(null, this.floatContent);
            this.floatContent.parentNode && this.floatContent.parentNode.removeChild(this.floatContent)
            if (this.props.onBlur) this.props.onBlur()
        };
        this.isShowing = false;
    }

    onChange = (e) => {
        try {
            if ((this.props.listDisable || []).indexOf(e) > -1) return
            if (this.props.root === 'SaxoBankManagment') {
                this.setState({
                    show: false
                }, () => {
                    this.timeoutId2 = setTimeout(() => {
                        this.timeoutId2 = null;
                        this.setState({
                            show: true
                        })
                    }, 350)
                });
            }
            if (this.props.multiSelect) {
                let curVal = clone(this.state.value)
                const index = curVal.indexOf(e)
                if (index === -1) curVal.push(e)
                else curVal.splice(index, 1)
                curVal = curVal.filter(e => e !== null)
                if (curVal.length === 0) curVal.push(null)
                this.setState({
                    value: curVal
                }, () => {
                    if (typeof this.props.onChange === 'function') {
                        this.props.onChange(curVal);
                    }
                    ReactDOM.render(this.renderWithScroll(), this.floatContent);
                });
                return
            }
            if (this.props.multi) {
                const arr = Array.isArray(this.state.value) ? clone(this.state.value) : [];
                const index = arr.indexOf(e);
                if (index > -1) arr.splice(index, 1)
                else arr.push(e);
                this.setState({
                    value: arr
                }, () => {
                    this.props.onChange && this.props.onChange(this.state.value, this.props.data);
                    ReactDOM.render(this.renderWithScroll(), this.floatContent);
                });
                return;
            }
            this.setState({
                value: e
            }, () => {
                if (typeof this.props.onChange === 'function') {
                    this.props.onChange(e, this.state.exist[e]);
                    setTimeout(() => {
                        this.disableDropdown()
                    }, 200)
                }
            });
        } catch (error) {
            logger.error('onChange On DropDown' + error)
        }
    }

    renderDefault() {
        try {
            if (this.props.multiSelect) {
                let labels = [];
                const existed = this.state.exist;
                (this.state.value || []).map(e => {
                    if (existed[e] && existed[e].label) {
                        let label = this.props.translate ? dataStorage.translate(existed[e].label) : existed[e].label
                        if (existed[e].className) label = getTextByTextClassName(label)
                        labels.push(label)
                    }
                })
                return <div id={`dropDownBoxSelector_${this.id}`} className='' >
                    <div className={`size--3 ${this.props.textRight === true ? 'flexend' : 'flex'} align-items-center`}>
                        <label className={`text-overflow showTitle`}>{labels.join(', ') || this.props.placeholder || '--'}</label>
                    </div>
                    <div className='flex align-items-center'>
                        <SvgIcon path={this.props.path || path.mdiChevronDown} />
                    </div>
                </div>
            }
            if (this.props.multi) {
                if (!this.state.value.length) return this.props.placeholder || '--';
                return <NoTag>
                    <div>
                        {
                            this.state.value.sort((a, b) => {
                                return this.state.exist[a].rank - this.state.exist[b].rank
                            }).map(key => {
                                return <div className={`${this.state.exist[key].className || 'text-capitalize'} dropDownValue showTitle flex size--3 ${this.props.readOnly ? 'paddingRight8' : ''}`} key={key}>
                                    {this.state.exist[key].icon ? <img style={{ maxWidth: 18 + 'px' }} src={this.state.exist[key].icon} className="margin-right8 flex" /> : null}
                                    <div style={{ position: 'absolute', opacity: '0' }}> <Lang>{this.state.exist[key].label}</Lang> </div>
                                    {this.props.hideKey ? null : this.state.exist[key].label}
                                </div>
                            })
                        }
                    </div>
                    <SvgIcon path={this.props.path || path.mdiChevronDown} className='arrow-down' style={{ marginRight: 2 + 'px' }} />
                </NoTag>
            }
            if (this.props.title === 'Header') {
                return <div id={`dropDownBoxSelector_${this.id}`} className='showTitle'>
                    {
                        this.props.translate ? <div className={`${this.state.exist[this.state.value].className || 'text-capitalize'} dropDownValue size--3 ${this.props.readOnly ? 'paddingRight8' : ''}`}><Lang>{(this.props.hideKey ? this.state.value : this.state.exist[this.state.value].label) || this.props.placeholder || '--'}</Lang></div>
                            : <div className={`${this.state.exist[this.state.value].className || 'text-capitalize'} dropDownValue size--3 ${this.props.readOnly ? 'paddingRight8' : ''}`}>{(this.props.hideKey ? this.state.value : this.state.exist[this.state.value].label) || this.props.placeholder || '--'}</div>
                    }
                    <div>
                        {
                            this.props.readOnly ? null : <SvgIcon path={this.props.path || path.mdiChevronDown} />
                        }
                    </div>
                </div>
            } else if (this.props.title === 'accountDropdown') {
                return <div id={`dropDownBoxSelector_${this.id}`} className='showTitle accountDropdown'>
                    <div className={`dropDownValue size--3 ${this.props.readOnly ? 'paddingRight8' : ''}`}>{typeof this.state.value === 'object' ? (this.state.value.account_id || this.state.value.equix_id || this.state.value.account_name) : this.state.value || '--'}</div>
                    <div>
                        {
                            this.props.readOnly ? null : <SvgIcon path={this.props.path || path.mdiChevronDown} />
                        }
                    </div>
                </div>
            } else if (this.props.action) {
                return <div id={`dropDownBoxSelector_${this.id}`} className='showTitle' >
                    <div className={`size--3 text-capitalize ${this.props.readOnly ? 'paddingRight8' : ''}`}><Lang>lang_action</Lang></div>
                    <div>
                        {
                            this.props.readOnly ? null : <SvgIcon path={this.props.path || path.mdiChevronDown} />
                        }
                    </div>
                </div>
            } else if (this.props.enablePDI) {
                return <NoTag>
                    <div id={`dropDownBoxSelector_${this.id}`} className='showTitle next' >
                        {
                            this.props.translate ? <div className={`size--3 showTitle ${this.props.readOnly ? 'paddingRight8' : ''}`}><Lang>{this.state.exist[this.state.value].label || this.props.placeholder || '--'}</Lang></div>
                                : <div className={`size--3 ${this.props.readOnly ? 'paddingRight8' : ''}`}>{this.state.exist[this.state.value].label || this.props.placeholder || '--'}</div>
                        }
                        <div>
                            {
                                this.props.readOnly ? null : <SvgIcon path={this.props.path || path.mdiChevronDown} />
                            }
                        </div>
                    </div>
                    <div style={{ display: 'none' }}>
                        {(this.state.exist[this.state.value].label && `[${this.state.value}] ${this.state.exist[this.state.value].label}`) || this.props.placeholder || '--'}
                    </div>
                </NoTag>
            } else {
                let label = (this.state.exist[this.state.value] && this.state.exist[this.state.value].label) || this.props.placeholder || '--';
                return <div id={`dropDownBoxSelector_${this.id}`} className='' >
                    {
                        this.props.translate
                            ? <div className={`size--3 ${this.state.exist[this.state.value] && (this.state.exist[this.state.value].value === null || this.state.exist[this.state.value].value === undefined) ? 'isPleaseSelect' : ''} ${this.props.textRight === true ? 'flexend' : 'flex'} ${this.props.readOnly ? 'paddingRight8' : ''}`}>
                                {(this.state.exist[this.state.value] && this.state.exist[this.state.value].icon) ? <img src={this.state.exist[this.state.value].icon} className='margin-right8' style={{ width: 20 + 'px', height: 13 + 'px' }}></img> : null}
                                <label className={`${(this.state.exist[this.state.value] && this.state.exist[this.state.value].className) || 'text-capitalize'} text-overflow showTitle`}> {typeof label === 'object' ? label : <Lang>{label}</Lang>}</label>
                            </div>
                            : <div className={`size--3 ${this.state.exist[this.state.value] && (this.state.exist[this.state.value].value === null || this.state.exist[this.state.value].value === undefined) ? 'isPleaseSelect' : ''} ${this.props.textRight === true ? 'flexend' : 'flex'}  align-items-center ${this.props.readOnly ? 'paddingRight8' : ''}`} style={{ justifyContent: 'flex-start' }}>
                                {(this.state.exist[this.state.value] && this.state.exist[this.state.value].icon) ? <img src={this.state.exist[this.state.value].icon} className='margin-right8' style={{ width: 20 + 'px', height: 13 + 'px' }}></img> : null}
                                {
                                    this.props.hideKey
                                        ? null
                                        : ((this.state.exist[this.state.value] && this.state.exist[this.state.value].label) ? <label className={`${(this.state.exist[this.state.value] && this.state.exist[this.state.value].className) || 'text-capitalize'} text-overflow showTitle`}>{(this.state.exist[this.state.value] && this.state.exist[this.state.value].label)}</label> : (this.props.placeholder ? <label style={this.props.placeholderStyle || {}}>{this.props.placeholder}</label> : <label>--</label>))
                                }
                            </div>
                    }
                    <div className='flex align-items-center'>
                        {
                            this.props.readOnly ? null : <SvgIcon path={this.props.path || path.mdiChevronDown} />
                        }
                    </div>
                </div>
            }
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
        return (
            <div className={`list ${this.props.align ? 'right' : ''}`}>
                {
                    this.state.option.map((v, k) => {
                        if (this.props.multiSelect) {
                            const disableClass = this.props.listDisable && this.props.listDisable.includes(v.value) ? 'disableSelect' : ''
                            return (
                                <div
                                    id={`itemDropDown_${this.id}_${k}`}
                                    className={`${this.state.value.includes(v.value) ? 'size--3 activeDropDown' : 'size--3'} ${this.checkDisableButtonCreateUser(v)} ${disableClass}`}
                                    key={k}
                                    onClick={() => this.onChange(v.value)}>
                                    {
                                        this.props.translate
                                            ? <span className={`text-overflow flex align-items-center`}>
                                                {v.icon ? <img src={v.icon} className='margin-right8' style={{ width: 20 + 'px', height: 13 + 'px' }}></img> : null}
                                                <label className={`${v.className || 'text-capitalize'} text-overflow showTitle`} htmlFor=""><Lang>{v.label}</Lang></label>
                                            </span>
                                            : <span className={`text-overflow flex align-items-center`}>
                                                {v.icon ? <img src={v.icon} className='margin-right8' style={{ width: 20 + 'px', height: 13 + 'px' }}></img> : null}
                                                <label className={`${v.className || 'text-capitalize'} text-overflow showTitle`} htmlFor="">{v.label}</label>
                                            </span>
                                    }{this.state.value.includes(v.value) ? <div><SvgIcon path={path.mdiCheck} fill='var(--ascend-default)' /></div> : null}
                                </div>
                            )
                        }
                        if (this.props.multi) {
                            const disableClass = this.props.listDisable && this.props.listDisable.includes(v.value) ? 'disableSelect' : ''
                            return (
                                <div
                                    id={`itemDropDown_${this.id}_${k}`}
                                    className={`flex ${v.value === this.state.value ? 'size--3 activeDropDown' : 'size--3'} ${this.checkDisableButtonCreateUser(v)} ${disableClass}`}
                                    key={k}
                                    onClick={() => this.onChange(v.value)}>
                                    <span style={{ width: 16 + 'px' }} className="flex">
                                        {
                                            this.props.listDisable && this.props.listDisable.indexOf(v.value) > -1
                                                ? <SvgIcon path={path.mdiCheck} fill='var(--ascend-default)' />
                                                : <NoTag>
                                                    {
                                                        this.state.value.indexOf(v.value) > -1
                                                            ? <img style={{ width: 16 + 'px' }} src={'.' + dataStorage.hrefImg + '/checkbox-marked-outline.svg'} />
                                                            : <img style={{ width: 16 + 'px' }} src={'.' + dataStorage.hrefImg + '/outline-check_box_outline_blank.svg'} />
                                                    }
                                                </NoTag>
                                        }
                                    </span>
                                    <div className="flex " style={{ overflow: 'hidden' }}>
                                        {v.icon ? <img style={{ maxWidth: 18 + 'px' }} src={v.icon} className="margin-left8 margin-right8" /> : null}
                                        {
                                            this.props.translate
                                                ? <span className={`${v.className || 'text-capitalize'} text-overflow showTitle`}><Lang>{v.label}</Lang></span>
                                                : <span className={`${v.className || 'text-capitalize'} text-overflow showTitle`}>{v.label}</span>
                                        }
                                    </div>
                                </div>
                            )
                        }
                        if (this.props.action) {
                            const status = this.props.params.data.status
                            const disableClass = (status === 0 || status === 3 || status === 4 || status === 5) && v.value === 2 ? 'disableSelect' : ''
                            if (v.label.props.children && v.label.props.children === 'divider') {
                                return (
                                    <div className='divider' />
                                )
                            } else {
                                return (
                                    <div
                                        id={`itemDropDown_${this.id}_${k}`}
                                        className={`size--3 dropdown-action ${disableClass} showTitle`}
                                        key={k}
                                        onClick={() => this.onChange(v.value)}>
                                        {this.props.translate ? <span className={`${v.className || 'text-capitalize'} text-overflow showTitle`}><Lang>{v.label}</Lang></span> : <span className={`${v.className || 'text-capitalize'} text-overflow showTitle`}>{v.label}</span>}
                                        {v.value === 4 ? this.props.params.data.change_password ? <img src='/common/checkbox-marked-outline.svg' style={{ height: 20 + 'px' }} /> : <img src='/common/outline-check_box_outline_blank.svg' style={{ height: 20 + 'px' }} /> : null}
                                    </div>
                                )
                            }
                        } else if (this.props.title === 'accountDropdown') {
                            if (this.props.isOpeningAccount) {
                                const disableClass = this.props.listDisable && this.props.listDisable.includes(v.value.account_id) ? 'disableSelect' : ''
                                let value
                                if (typeof (this.state.value) === 'object') value = this.state.value.account_id || this.state.value.equix_id
                                else value = this.state.value
                                return (
                                    <div
                                        id={`itemDropDown_${this.id}_${k}`}
                                        className={`${v.value.equix_id === value ? 'size--3 activeDropDown' : 'size--3'} ${this.checkDisableButtonCreateUser(v)} ${disableClass} showTitle`}
                                        key={k}
                                        onClick={() => this.onChange(v.value)}>
                                        {
                                            this.props.translate ? <span className={`${v.className || 'text-capitalize'} text-overflow showTitle`}><Lang>{v.label}</Lang></span> : <span className={`${v.className || 'text-capitalize'} text-overflow showTitle`}>{v.label}</span>
                                        }
                                        {v.value.equix_id === value ? <div><SvgIcon path={path.mdiCheck} fill='var(--ascend-default)' /></div> : null}
                                    </div>
                                )
                            }
                            const disableClass = this.props.listDisable && this.props.listDisable.includes(v.value.account_id) ? 'disableSelect' : ''
                            let value
                            if (typeof (this.state.value) === 'object') value = this.state.value.account_id
                            else value = this.state.value
                            return (
                                <div
                                    id={`itemDropDown_${this.id}_${k}`}
                                    className={`${v.value.account_id === value ? 'size--3 activeDropDown' : 'size--3'} ${this.checkDisableButtonCreateUser(v)} ${disableClass} showTitle`}
                                    key={k}
                                    onClick={() => this.onChange(v.value)}>
                                    {
                                        this.props.translate ? <span className={`${v.className || 'text-capitalize'} text-overflow showTitle`}><Lang>{v.label}</Lang></span> : <span className={`${v.className || 'text-capitalize'} text-overflow showTitle`}>{v.label}</span>
                                    }{v.value.account_id === value ? <div><SvgIcon path={path.mdiCheck} fill='var(--ascend-default)' /></div> : null}
                                </div>
                            )
                        } else if (this.props.enablePDI) {
                            const disableClass = this.props.listDisable && this.props.listDisable.includes(v.value) ? 'disableSelect' : ''
                            return (
                                <div
                                    id={`itemDropDown_${this.id}_${k}`}
                                    className={`${v.value === this.state.value ? 'size--3 activeDropDown' : 'size--3'} ${this.checkDisableButtonCreateUser(v)} ${disableClass}`}
                                    key={k}
                                    title={`[${v.value}] ${capitalizer(v.label)}`}
                                    onClick={() => this.onChange(v.value)}>
                                    {
                                        this.props.translate ? <span className={`${v.className || 'text-capitalize'} text-overflow showTitle`}><Lang>{v.label}</Lang></span> : <span className={`${v.className || 'text-capitalize'} text-overflow showTitle`}>{v.label}</span>
                                    }{v.value === this.state.value ? <div><SvgIcon path={path.mdiCheck} fill='var(--ascend-default)' /></div> : null}
                                </div>
                            )
                        } else {
                            const disableClass = this.props.listDisable && this.props.listDisable.includes(v.value) ? 'disableSelect' : ''
                            return (
                                <div
                                    id={`itemDropDown_${this.id}_${k}`}
                                    className={`${v.value === this.state.value ? 'size--3 activeDropDown' : 'size--3'} ${this.checkDisableButtonCreateUser(v)} ${disableClass}`}
                                    key={k}
                                    onClick={() => this.onChange(v.value)}>
                                    {
                                        this.props.translate
                                            ? <span className={`text-overflow flex align-items-center`}>
                                                {v.icon ? <img src={v.icon} className='margin-right8' style={{ width: 20 + 'px', height: 13 + 'px' }}></img> : null}
                                                <label className={`${v.className || 'text-capitalize'} text-overflow showTitle`} htmlFor=""> {typeof v.label === 'object' ? v.label : <Lang>{v.label}</Lang>}</label>
                                            </span>
                                            : <span className={`text-overflow flex align-items-center`}>
                                                {v.icon ? <img src={v.icon} className='margin-right8' style={{ width: 20 + 'px', height: 13 + 'px' }}></img> : null}
                                                <label className={`${v.className || 'text-capitalize'} text-overflow showTitle`} htmlFor="">{v.label}</label>
                                            </span>
                                    }{v.value === this.state.value ? <div><SvgIcon path={path.mdiCheck} fill='var(--ascend-default)' /></div> : null}
                                </div>
                            )
                        }
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
                    style={this.props.style || {}}
                    className={`dropDown size--3 ${this.props.title === 'Header' ? 'header' : ''} ${this.state.show ? '' : 'close'} ${this.props.className || ''} ${this.props.readOnly ? 'readOnly' : ''} ${this.props.styleBranch ? ' styleBranch' : ''}`}
                    // onBlur={() => this.setState({ show: false })}
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
            this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection);
        } catch (error) {
            logger.error('componentDidMount On DropDown' + error)
        }
    }

    componentWillUnmount() {
        try {
            const dropDownContent = document.getElementById('dropDownContent')
            dropDownContent && this.floatContent && dropDownContent.contains(this.floatContent) && dropDownContent.removeChild(this.floatContent);
            document.removeEventListener('mouseover', this.hoverEvent);
            document.removeEventListener('mousedown', this.handleClickOutside);
            document.removeEventListener('keydown', this.listenerKeyDown.bind(this), false);
            this.timeoutId1 && clearTimeout(this.timeoutId1);
            this.timeoutId2 && clearTimeout(this.timeoutId2);
            this.emitConnectionID && this.emitConnectionID.remove();
        } catch (error) {
            logger.error('componentWillUnmount On DropDown' + error)
        }
    }
}

export default DropDown;
