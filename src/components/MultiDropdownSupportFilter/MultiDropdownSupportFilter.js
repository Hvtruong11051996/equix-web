import React from 'react';
import Icon from '../Inc/Icon'
import Lang from '../Inc/Lang'
import uuidv4 from 'uuid/v4';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import { checkPropsStateShouldUpdate } from '../../helper/functionUtils';

class MultiDropdownSupportFilter extends React.Component {
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
        this.textFilter = ''
        this.state = {
            arrOption: this.props.value || [],
            option: state.option,
            optionsFixTop: state.optionsFixTop,
            exist: state.exist,
            show: true,
            hover: false,
            titleDropDown: '',
            checkedAll: false
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
            let optionsFixTop = [];
            let exist = {};
            const props = newProps || this.props;
            if (props.options) {
                const optionsSort = props.options.sort((a, b) => (a.label).localeCompare(b.label));
                optionsSort.map((v, k) => {
                    const item = typeof v === 'string' ? { value: v, label: v } : v;
                    exist[item.value] = item.label_priority || item.label;
                    option.push(item);
                });
                props.optionsFixTop.map((v, k) => {
                    const item = typeof v === 'string' ? { value: v, label: v } : v;
                    exist[item.value] = item.label_priority || item.label;
                    optionsFixTop.push(item);
                });
                if (!newProps) {
                    return {
                        option: option,
                        exist: exist,
                        optionsFixTop: optionsFixTop
                    }
                } else {
                    this.setState({ optionsFixTop, option, exist, value: props.value })
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

    setWrapperRef(node) {
        try {
            this.wrapperRef = node;
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
    onChangeAll(checkAll) {
        let saveArrOption = this.state.arrOption;
        const index = saveArrOption.indexOf(checkAll)
        if (index > -1) {
            saveArrOption.splice(index, 1)
        } else {
            saveArrOption.push(checkAll)
        }
        this.setState({
            arrOption: saveArrOption
        })
        if (typeof this.props.onChange === 'function') {
            this.props.onChange(saveArrOption, this.props.stateName);
        }
    }
    onChange = (e) => {
        try {
            const saveArrOption = this.state.arrOption;
            const index = this.state.arrOption.indexOf(e);
            if (index > -1) {
                saveArrOption.splice(index, 1);
            } else {
                saveArrOption.push(e);
            }
            this.setState({
                arrOption: saveArrOption
            })
            if (typeof this.props.onChange === 'function') {
                this.props.onChange(saveArrOption, this.props.stateName);
            }
        } catch (error) {
            logger.error('onChange On DropDown' + error)
        }
    }

    renderDefault() {
        try {
            let content = '--';
            if (this.state.arrOption.indexOf('Everything') > -1) {
                content = <Lang>lang_everything</Lang>
            } else if (this.state.arrOption.length) {
                content = this.state.arrOption.map((value, index) => {
                    index++;
                    if (index === this.state.arrOption.length) {
                        return <span key={uuidv4()}>{this.state.exist[value]}</span>;
                    }
                    return <span key={uuidv4()}>{this.state.exist[value]} </span>;
                })
            }
            return <div id={`dropDownBoxSelector_${this.id}`} className='orderHide'>
                <div className='size--3 paddingRight8 text-capitalize'>{content}</div>
                <div> <Icon src='navigation/arrow-drop-down' /></div>
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

    filterItemDropdown = (textFilter) => {
        this.textFilter = textFilter.toUpperCase() || ''
        const lstDropdown = this.dom.querySelectorAll('div[id^="itemDropDown"]')
        const orderHeaderDD = this.dom.querySelector('.orderHeaderDD')
        if (orderHeaderDD.innerText.toUpperCase().indexOf(this.textFilter) > -1) {
            orderHeaderDD.classList.remove('hidden')
        } else {
            orderHeaderDD.classList.add('hidden')
        }
        lstDropdown.forEach(element => {
            if (element.innerText.toUpperCase().indexOf(this.textFilter) > -1) {
                element.classList.remove('hidden')
            } else {
                element.classList.add('hidden')
            }
        });
    }

    renderWithScroll() {
        return (
            <div className="scroll-wrap">
                <div id={`scrollNumber_${this.id}`}>
                    <div className='list' ref={dom => this.dom = dom}>
                        <div className="filter-box-dropdown">
                            <Icon className="iconMenu" src={'action/search'} />
                            <input className="input-filter line-bottom" onChange={(e) => this.filterItemDropdown(e.target.value)} />
                        </div>
                        <div onClick={() => this.onChangeAll('Everything')} className={'orderHeaderDD size--3 showTitle'}>
                            <div className={`check-circle ${this.state.arrOption.indexOf('Everything') > -1 ? 'active' : ''}`}></div>
                            <div className={'orderDDPadding'}><Lang>lang_everything</Lang></div>
                        </div>
                        {
                            this.state.optionsFixTop.map((v, k) => {
                                let isClassHidden = ''
                                if (v.label.toUpperCase().indexOf(this.textFilter.toUpperCase()) === -1) isClassHidden = 'hidden'
                                return (
                                    <div
                                        id={`itemDropDown_${this.id}_${k}`}
                                        key={uuidv4()}
                                        onClick={() => this.onChange(v.value)}
                                        className={`showTitle  ${isClassHidden} ${this.state.arrOption.indexOf('Everything') > -1 ? 'disable' : ''}`}
                                    >
                                        <div className={`check-circle ${this.state.arrOption.indexOf(v.value) > -1 ? 'active' : ''}`}></div>
                                        <div className="text-overflow">{v.label}</div>
                                    </div>
                                )
                            })
                        }
                        <div className="line-dotted"></div>
                        {
                            this.state.option.map((v, k) => {
                                let isClassHidden = ''
                                if (v.label.toUpperCase().indexOf(this.textFilter.toUpperCase()) === -1) isClassHidden = 'hidden'
                                return (
                                    <div
                                        id={`itemDropDown_${this.id}_${k}`}
                                        key={uuidv4()}
                                        onClick={() => this.onChange(v.value)}
                                        className={`showTitle ${isClassHidden} ${this.state.arrOption.indexOf('Everything') > -1 ? 'disable' : ''}`}
                                    >
                                        <div className={`check-circle ${this.state.arrOption.indexOf(v.value) > -1 ? 'active' : ''}`}></div>
                                        <div className="text-overflow">{v.label}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }

    render() {
        try {
            return (
                <div
                    className={`dropDown size--3 ${this.props.title === 'Header' ? 'header' : ''} ${this.props.className || ''}`}
                    onMouseOver={this.listenerMouseDown.bind(this)}
                    onMouseOut={() => this.lastDownTarget = null}
                    ref={this.setWrapperRef}>
                    {this.renderDefault()}
                    {this.renderWithScroll()}
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
            document.removeEventListener('mousedown', this.handleClickOutside);
            document.removeEventListener('keydown', this.listenerKeyDown.bind(this), false);
            this.timeoutId1 && clearTimeout(this.timeoutId1);
            this.timeoutId2 && clearTimeout(this.timeoutId2);
        } catch (error) {
            logger.error('componentWillUnmount On DropDown' + error)
        }
    }
}

export default MultiDropdownSupportFilter;
