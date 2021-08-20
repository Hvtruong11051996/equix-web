import React from 'react';
import Icon from '../Inc/Icon'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import uuidv4 from 'uuid/v4';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import { checkPropsStateShouldUpdate, getDropdownContentDom } from '../../helper/functionUtils';
import Lang from '../Inc/Lang';
import NoTag from '../Inc/NoTag/NoTag';
import ReactDOM from 'react-dom';
class ColorChooseOptions extends React.Component {
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
            option: state.option,
            exist: state.exist,
            show: true,
            hover: false
        };
        this.value = this.props.value
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.hoverEvent = this.hoverEvent.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
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
                    if (v !== null) {
                        const item = v;
                        exist[item.value] = item
                        option.push(item);
                    }
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

    setWrapperRef(node) {
        try {
            this.wrapperRef = node;
            if (node) {
                let div = getDropdownContentDom()
                node.addEventListener('mouseenter', () => {
                    if (this.isShowing) return;
                    this.isShowing = true;
                    this.floatContent = document.createElement('div');
                    ReactDOM.render(this.renderWithScroll(), this.floatContent, () => {
                        div.appendChild(this.floatContent);
                    });
                    this.floatContent.style.position = 'absolute';
                    this.floatContent.style.display = 'block';
                    let dropdownMinWidth;
                    if (this.props.fixWidth) {
                        this.floatContent.style.minWidth = '144px'
                    } else this.floatContent.style.minWidth = dropdownMinWidth;
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

    disableDropdown() {
        document.removeEventListener('mouseover', this.hoverEvent);
        if (this.floatContent) {
            ReactDOM.render(null, this.floatContent);
            this.floatContent.parentNode && this.floatContent.parentNode.removeChild(this.floatContent)
        };
        this.isShowing = false;
    }

    onChange = (e) => {
        try {
            this.value = e
            this.setState({ show: false });
            this.props.onChange && this.props.onChange(this.value)
            this.disableDropdown()
        } catch (error) {
            logger.error('onChange On DropDown' + error)
        }
    }

    renderDefault() {
        try {
            return <div className='showTitle flex align-items-center pointer' >
                <div style={{ alignItems: 'center' }}>
                    <Icon src='hardware/keyboard-arrow-down' />
                </div>
                <div className={`size--3`} style={{ background: this.state.exist[this.value].label, width: 16 + 'px', height: 16 + 'px' }}>
                </div>
            </div>
        } catch (error) {
            logger.error('renderDefault On DropDown' + error)
        }
    }

    renderWithScroll() {
        return (
            <div className={`${this.props.className || ''} list`}>
                <div className="list-color">
                    {
                        this.state.option.map((v, k) => {
                            return (
                                <div
                                    className={`size--3 showTitle item-color`}
                                    key={k}
                                    onClick={() => this.onChange(v.value)}
                                    style={{ background: v.label, width: 16 + 'px', height: 16 + 'px' }}>
                                    {
                                        v.value === this.value
                                            ? <div><Icon style={{ transition: 'none', width: 16 + 'px' }} fill='#fff' src='navigation/check' /></div>
                                            : null
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }

    render() {
        try {
            return (
                <div
                    style={this.props.style || {}}
                    className={`choose-color flex size--3 ${this.state.show ? '' : 'close'}`}
                    onMouseOver={this.listenerMouseDown.bind(this)}
                    onMouseOut={() => this.lastDownTarget = null}
                    ref={this.setWrapperRef}>
                    {this.renderDefault()}
                </div>
            );
        } catch (error) {
            logger.error('render On ChooseColor' + error)
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
            document.addEventListener('mousedown', this.handleClickOutside);
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
            this.timeoutId1 && clearTimeout(this.timeoutId1);
            // this.timeoutId2 && clearTimeout(this.timeoutId2);
        } catch (error) {
            logger.error('componentWillUnmount On DropDown' + error)
        }
    }
}

export default ColorChooseOptions;
