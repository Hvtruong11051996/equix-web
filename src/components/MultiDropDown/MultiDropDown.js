import React from 'react';
import Icon from '../Inc/Icon'
import Lang from '../Inc/Lang'
import NoTag from '../Inc/NoTag'
import uuidv4 from 'uuid/v4';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import { checkPropsStateShouldUpdate, getDropdownContentDom } from '../../helper/functionUtils';
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon';

class MultiDropdown extends React.Component {
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
            arrOption: this.props.value || [],
            option: state.option,
            exist: state.exist,
            show: true,
            hover: false,
            titleDropDown: '',
            checkedAll: false,
            optionsNotChange: this.props.optionsNotChange || []
        };
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
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
                    exist[item.value] = v;
                    option.push(item);
                });
                if (!newProps) {
                    return {
                        option: option,
                        exist: exist
                    }
                } else {
                    this.setState({ option, exist, value: props.value })
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
                        this.floatContent.style.minWidth = '205px'
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
    onChangeAll() {
        let saveArrOption = [];
        if (this.state.arrOption.length !== this.state.option.length) {
            saveArrOption = this.state.option.map(item => {
                return item.value
            });
        }
        this.setState({
            arrOption: saveArrOption
        }, () => {
            if (typeof this.props.onChange === 'function') {
                this.props.onChange(saveArrOption);
                ReactDOM.render(this.renderWithScroll(), this.floatContent);
            }
        })
    }
    onChange = (e) => {
        try {
            if (this.state.optionsNotChange.indexOf(e) > -1) return
            const saveArrOption = this.state.arrOption;
            const index = this.state.arrOption.indexOf(e);
            if (index > -1) {
                saveArrOption.splice(index, 1);
            } else {
                saveArrOption.push(e);
            }
            this.setState({
                arrOption: saveArrOption
            }, () => {
                if (typeof this.props.onChange === 'function') {
                    this.props.onChange(saveArrOption);
                    ReactDOM.render(this.renderWithScroll(), this.floatContent);
                }
            })
        } catch (error) {
            logger.error('onChange On DropDown' + error)
        }
    }

    renderDefault() {
        try {
            if (this.props.headerCheckBox) {
                if (this.state.arrOption.length === this.state.option.length) {
                    return <div id={`dropDownBoxSelector_${this.id}`} className='orderHide'>
                        <div><SvgIcon path={path.mdiCheckBoxOutline} /></div>
                        <div></div>
                    </div>
                } else if (this.state.arrOption.length) {
                    return <div id={`dropDownBoxSelector_${this.id}`} className='orderHide'>
                        <div><SvgIcon path={path.mdiCheckboxIntermediate} /></div>
                        <div></div>
                    </div>
                } else {
                    return <div id={`dropDownBoxSelector_${this.id}`} className='orderHide'>
                        <div><SvgIcon path={path.mdiCheckboxBlankOutline} /></div>
                        <div></div>
                    </div>
                }
            } else if (this.props.displayIconHeader) {
                let content = '--';
                if (this.state.arrOption.length) {
                    content = this.state.arrOption.map((value, index) => {
                        index++;
                        if (this.state.exist[value]) return <span key={uuidv4()} className='margin-right8'><Icon src={this.state.exist[value].icon} /></span>;
                    })
                }
                return <div id={`dropDownBoxSelector_${this.id}`} className='orderHide'>
                    <div className='size--3'>{content}</div>
                    <div> <SvgIcon path={path.mdiChevronDown} /></div>
                </div>
            } else {
                let content = '--';
                if (this.state.arrOption.length === this.state.option.length) {
                    content = <Lang>lang_all</Lang>
                } else if (this.state.arrOption.length) {
                    content = this.state.arrOption.map((value, index) => {
                        index++;
                        if (index === this.state.arrOption.length) {
                            return <span className={(this.state.exist[value] && this.state.exist[value].className) || 'text-capitalize'} key={uuidv4()}><Lang>{this.state.exist[value].label}</Lang></span>;
                        }
                        return <span className={(this.state.exist[value] && this.state.exist[value].className) || 'text-capitalize'} key={uuidv4()}><Lang>{this.state.exist[value].label}</Lang>, </span>;
                    })
                }
                return <div id={`dropDownBoxSelector_${this.id}`} className='orderHide'>
                    <div className='size--3 text-capitalize'>{content}</div>
                    <div> <SvgIcon path={path.mdiChevronDown} /></div>
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
        let checkedAll;
        if (!this.props.isDontCheckAll) {
            if (this.state.arrOption.length === this.state.option.length) {
                checkedAll = <SvgIcon path={path.mdiCheckBoxOutline} />
            } else if (this.state.arrOption.length) {
                checkedAll = <SvgIcon path={path.mdiCheckboxIntermediate} />
            } else {
                checkedAll = <SvgIcon path={path.mdiCheckboxBlankOutline} />
            }
        }
        return (
            <div className='list multi'>
                {
                    this.props.isDontCheckAll
                        ? null
                        : <div onClick={() => this.onChangeAll()} className={'orderHeaderDD size--3 showTitle'}>
                            {checkedAll}
                            <div className={'orderDDPadding text-capitalize'}>{this.props.headerCheckBox ? <Lang>lang_all_none</Lang> : <span className='text-capitalize'><Lang>lang_all</Lang></span>}</div>
                        </div>
                }
                {
                    this.state.option.map((v, k) => {
                        const index = this.state.optionsNotChange.indexOf(v.value) + 1
                        return (
                            <div
                                id={`itemDropDown_${this.id}_${k}`}
                                key={uuidv4()}
                                onClick={() => this.onChange(v.value)}
                                className={`showTitle ${index ? 'not-allowed' : ''}`}
                            >
                                {
                                    this.state.optionsNotChange.indexOf(v.value) > -1
                                        ? <SvgIcon path={path.mdiCheck} />
                                        : <NoTag>
                                            {
                                                this.state.arrOption.indexOf(v.value) > -1
                                                    ? <SvgIcon path={path.mdiCheckBoxOutline} />
                                                    : <SvgIcon path={path.mdiCheckboxBlankOutline} />
                                            }
                                        </NoTag>
                                }
                                {
                                    v.icon
                                        ? <div className='flex margin-left8  margin-right8'><Icon src={v.icon} /></div>
                                        : null
                                }
                                <div className={`${v.className || 'text-capitalize'} box-overflow`}><Lang>{v.label}</Lang></div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    render() {
        try {
            return (
                <div
                    className={`dropDown size--3 ${this.props.title === 'Header' ? 'header' : ''} ${this.state.show ? '' : 'close'} ${this.props.className || ''}`}
                    onBlur={() => this.setState({ show: false })}
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

    componentDidMount() {
        try {
            this.lastDownTarget = null;
            document.addEventListener('keydown', this.listenerKeyDown.bind(this), false);
            // document.addEventListener('mouseover', this.listenerMouseDown.bind(this), false);
            document.addEventListener('mousedown', this.handleClickOutside);
        } catch (error) {
            logger.error('componentDidMount On DropDown' + error)
        }
    }

    componentWillUnmount() {
        try {
            document.removeEventListener('mouseover', this.hoverEvent);
            document.removeEventListener('mousedown', this.handleClickOutside);
            document.removeEventListener('keydown', this.listenerKeyDown.bind(this), false);
            this.timeoutId1 && clearTimeout(this.timeoutId1);
            this.timeoutId2 && clearTimeout(this.timeoutId2);
        } catch (error) {
            logger.error('componentWillUnmount On DropDown' + error)
        }
    }
}

export default MultiDropdown;
