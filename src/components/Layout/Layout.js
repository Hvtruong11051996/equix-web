import React from 'react';
import uuidv4 from 'uuid/v4';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import { checkPropsStateShouldUpdate } from '../../helper/functionUtils';
import Lang from '../Inc/Lang';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'
import SvgIcon, { path } from '../Inc/SvgIcon'
class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.timeoutBlur2 = null;
        this.timeoutBlur = null;
        this.curentIndex = -1;
        this.lastDownTarget = null;
        this.id = uuidv4();
        this.isMount = true;
        this.searBox = `dropDownBoxSelector_${this.id}`;
        const state = this.updateOption();
        this.state = {
            value: this.props.value,
            option: state.option,
            exist: state.exist,
            isShow: false,
            show: true,
            hover: false,
            type: {}
        };
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        dataStorage.handleClickOutside = this.handleClickOutside;
    }

    componentWillReceiveProps(nextProps) {
        try {
            if (!nextProps.options) return;
            this.updateOption(nextProps);
        } catch (error) {
            logger.error('componentWillReceiveProps On DropDown' + error)
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
                    this.setState({ option, exist, value: props.value })
                }
            }
        } catch (error) {
            logger.error('updateOption On DropDown' + error)
        }
    }

    listenerMouseDown(event) {
        try {
            dataStorage.turnOffChartDropDownCallback && dataStorage.turnOffChartDropDownCallback()
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
        } catch (error) {
            logger.error('setWrapperRef On DropDown' + error)
        }
    }

    handleClickOutside(event) {
        try {
            if (this.state.isShow && this.state.show && this.wrapperRef && !this.wrapperRef.contains(event.target)) {
                this.setState({
                    show: false,
                    isShow: false
                }, () => setTimeout(() => this.isMount && this.setState({
                    show: true
                }), 350))
                const element = document.getElementsByClassName('saveLayoutDropDown ');
                element && element.classList && element.classList.remove && classList.remove('active');
                this.setState({ type: {} });
            }
        } catch (error) {
            logger.error('handleClickOutside On DropDown' + error)
        }
    }

    onChange = (k, e) => {
        if ((k && k === this.state.option.length - 1)) {
            this.save(k);
            this.setState({ isShow: true })
            return;
        }
        // if (k === 0) {
        //     this.props.onChange && this.props.onChange(e);
        //     return;
        // }
        if (this.pause) {
            this.setState({ isShow: true })
            this.pause = false;
            return;
        }
        try {
            this.setState({
                value: e,
                show: false,
                type: {}
            }, () => setTimeout(() => this.isMount && this.setState({
                show: true
            }), 350));
            logger.log(this.state.option)
            if (typeof this.props.onChange === 'function') {
                this.props.onChange(e);
            }
        } catch (error) {
            logger.error('onChange On DropDown' + error)
        }
    }

    renderDefault() {
        try {
            const value = this.state.exist[this.state.value] || this.props.placeholder || '---';
            if (this.props.title === 'Header') {
                return <div id={`dropDownBoxSelector_${this.id}`}
                    style={{ height: '56px', display: 'flex', alignItems: 'center' }}>
                    <div><SvgIcon style={{ width: '20px', paddingRight: '4px' }} path={path.mdiCollage} /></div>
                    <div className='dropDownValue size--3 showTitle text-capitalize'><Lang>lang_layout</Lang></div>
                    <div><SvgIcon style={{ width: '20px', paddingLeft: '4px' }} path={path.mdiChevronDown} /></div>
                </div>
            } else {
                return <div id={`dropDownBoxSelector_${this.id}`}
                    style={{ height: '56px', display: 'flex', alignItems: 'center' }}>
                    <div><SvgIcon path={path.mdiAccount} /></div>
                    <div className='size--3 showTitle'>{['User Layout', 'lang_default_layout', 'lang_save_layout'].includes(value) ? <Lang>{value}</Lang> : value}</div>
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
    };

    setType(k, str) {
        const type = {};
        type[k] = str;
        this.setState({ type })
    }

    setTypeAdvance(key, value) {
        const { type } = this.state;
        type[key] = value;
        this.setState({ type })
    }

    update(index) {
        this.pause = true;
        this.inputValue = (this.state.option[index] && this.state.option[index].label) || '';
        this.setType(index, 'update');
    }

    confirmUpdate(index, id) {
        if (typeof this.props.update === 'function') this.props.update(id, this.inputValue);
        this.setType(index, '');
    }

    delete(k) {
        this.pause = true;
        this.setType(k, 'delete');
    }

    confirmOverride(e, layoutName) {
        if (this.wrapperRef.classList.contains('active')) {
            this.wrapperRef.classList.remove('active');
        }
        this.setState({ type: {} });
        this.props.overrideLayout && this.props.overrideLayout(layoutName);
    }

    confirmDelete(id) {
        if (this.wrapperRef.classList.contains('active')) {
            this.wrapperRef.classList.remove('active');
        }
        this.setState({ type: {} });
        if (typeof this.props.delete === 'function') this.props.delete(id);
    }
    override(k) {
        this.setType(k, 'override');
        this.setState({ isShow: true });
    }
    save(k) {
        this.inputValue = '';
        this.setType(k, 'save');
    }

    confirmSave() {
        if (!this.checkInputValueEmptyExist) return;
        if (this.wrapperRef.classList.contains('active')) {
            this.wrapperRef.classList.remove('active');
        }
        this.setState({ type: {} });
        this.scrollContent && (this.scrollContent.scrollTop = 0)
        if (typeof this.props.save === 'function') this.props.save(this.inputValue);
    }

    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (dataStorage.checkUpdate) {
                return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state)
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On Layout', error)
        }
    }

    getKeyEnter(event, func, self, index, id) {
        const keyCode = event.which || event.keyCode;
        if (keyCode === 13) {
            if (func === 'funcSave') {
                self.confirmSave()
            } else if (func === 'funcUpdate') {
                self.confirmUpdate(index, id)
            }
        }
    }

    handleOnFocus(e) {
        this.timeoutBlur && clearTimeout(this.timeoutBlur);
        this.timeoutBlur2 && clearTimeout(this.timeoutBlur2);
        if (!this.wrapperRef.classList.contains('active')) {
            this.wrapperRef.classList.add('active');
        }
    }

    addActiveClass() {
        try {
            const element = document.getElementsByClassName('saveLayoutDropDown');
            element[0].classList.add('active');
        } catch (error) {
            logger.error('add class active ' + error)
        }
    }

    handleOnBlur(e) {
        this.timeoutBlur = setTimeout(() => {
            if (this.isMount) {
                if (this.wrapperRef.classList.contains('active')) {
                    this.wrapperRef.classList.remove('active');
                }
                this.setState({ type: {} });
            }
        }, 300);
    }

    handleOnBlur2(k) {
        this.timeoutBlur2 = setTimeout(() => {
            if (this.isMount) {
                if (this.wrapperRef.classList.contains('active')) {
                    this.wrapperRef.classList.remove('active');
                }
                this.setTypeAdvance(k, '')
            }
        }, 300);
    }

    renderRow(v, k) {
        const lenOption = this.state.option.length;
        const isSelected = !!(v.value === this.state.value);
        const isSave = !!(this.state.type[lenOption - 1] === 'save');
        let iconSrc = '';
        switch (v.label) {
            case 'lang_default_layout':
                iconSrc = path.mdiViewQuilt
                break;
            case 'lang_save_layout':
                iconSrc = path.mdiContentSave;
                break;
            default:
                iconSrc = path.mdiAccount;
                break;
        }
        if (this.state.type[k] === 'override') {
            this.addActiveClass();
            return <div
                id={`itemDropDown_${this.id}_${k}`}
                className={`hideText ${isSelected ? 'activeDropDown' : ''}`}
                key={k}>
                <SvgIcon path={iconSrc} />
                <div className='dropDownInput waittingConfirm text-capitalize'>
                    <div><Lang>lang_ask_overwrite</Lang></div>
                    <div>
                        <div className='yes text-capitalize' onClick={(e) => this.confirmOverride(e, v.value)}><Lang>lang_yes</Lang></div>
                        <div className='no text-capitalize' onClick={() => this.setType(k, '')}><Lang>lang_no</Lang></div>
                    </div>
                </div>
            </div>
        }
        if (this.state.type[k] === 'update') {
            return <div
                id={`itemDropDown_${this.id}_${k}`}
                className={`${isSelected ? 'activeDropDown' : ''} updatingLayout`}
                key={k}>
                <SvgIcon path={iconSrc} />
                <div className='dropDownInput empty'>
                    <div>
                        <input defaultValue={this.inputValue || ''}
                            onChange={(event) => {
                                this.inputValue = event.target.value.trim()
                                const parent = event.target.parentElement && event.target.parentElement.parentElement;
                                if (!this.inputValue || this.props.exist.includes(this.inputValue)) {
                                    parent.className = 'dropDownInput empty'
                                } else if (parent.className.includes('empty')) {
                                    parent.className = 'dropDownInput';
                                }
                            }}
                            type="text"
                            ref={dom => setTimeout(() => {
                                if (dom) {
                                    dom.focus()
                                    dom.setSelectionRange(999, 999)
                                }
                            }, 200)}
                            onKeyPress={(e) => {
                                if (this.inputValue && !this.props.exist.includes(this.inputValue)) {
                                    this.getKeyEnter(e, 'funcUpdate', this, k, v.value)
                                }
                            }}
                            // required
                            // onBlur={this.handleOnBlur2.bind(this, k)}
                            onFocus={this.handleOnFocus.bind(this)}
                            className='size--3'
                        />
                    </div>
                    <div className='yes text-capitalize' onClick={() => {
                        if (this.inputValue && !this.props.exist.includes(this.inputValue)) {
                            this.confirmUpdate(k, v.value)
                        }
                    }}><Lang>lang_yes</Lang></div>
                    <div className='no text-capitalize' onClick={() => this.setType(k, '')}><Lang>lang_no</Lang></div>
                </div>
            </div>
        }
        if (this.state.type[k] === 'delete') {
            return <div
                id={`itemDropDown_${this.id}_${k}`}
                className={`hideText ${isSelected ? 'activeDropDown' : ''}`}
                key={k}>
                <SvgIcon path={iconSrc} />
                <div className='dropDownInput waittingConfirm'>
                    <div><Lang>lang_ask_delete_layout</Lang></div>
                    <div>
                        <div className='yes text-capitalize' onClick={() => this.confirmDelete(v.value)}><Lang>lang_yes</Lang></div>
                        <div className='no text-capitalize' onClick={() => this.setType(k, '')}><Lang>lang_no</Lang></div>
                    </div>
                </div>
            </div>
        }
        if (this.state.type[k] === 'save') {
            return <div
                id={`itemDropDown_${this.id}_${k}`}
                className={`${isSelected ? 'activeDropDown' : ''} updatingLayout`}
                key={k}>
                <div className='layoutDropItem showTitle text-capitalize'><SvgIcon path={iconSrc} />{['userLayout', 'defaultDayout', 'SaveLoad'].includes(v.value) ? <Lang>{v.label}</Lang> : v.label}</div>
                <div className='dropDownInput empty'>
                    <input
                        id='saveLayoutField'
                        required
                        title={dataStorage.translate('lang_please_fillout_input')}
                        className='size--3'
                        ref={dom => setTimeout(() => {
                            dom && dom.focus()
                        }, 200)}
                        onChange={(event) => {
                            this.inputValue = event.target.value.trim();
                            const parent = event.target.parentElement && event.target.parentElement;
                            if (!this.inputValue || this.props.exist.includes(this.inputValue)) {
                                parent.classList.add('empty')
                                this.checkInputValueEmptyExist = false;
                            } else if (parent.className.includes('empty')) {
                                parent.classList.remove('empty')
                                this.checkInputValueEmptyExist = true;
                            }
                        }}
                        onKeyPress={(e) => {
                            if (this.inputValue && !this.props.exist.includes(this.inputValue)) {
                                this.getKeyEnter(e, 'funcSave', this, '', '')
                            }
                        }}
                        // required
                        onBlur={isSave ? null : this.handleOnBlur.bind(this)}
                        onFocus={this.handleOnFocus.bind(this)}
                        type="text" />
                    <div className='placeHolderLayout'><Lang>lang_create_new_layout_placeholder</Lang></div>
                    <div className='bg-default yes text-capitalize' onClick={() => this.confirmSave(v.value)}><Lang>lang_save</Lang></div>
                </div>
            </div>
        }
        return (
            <div
                id={`itemDropDown_${this.id}_${k}`}
                className={isSelected ? 'activeDropDown' : ''}
                key={k}
                onDoubleClick={() => {
                    if (k === 0) return;
                    setTimeout(() => {
                        this.doubleClick = true;
                        this.update(k)
                    }, 0)
                }}
                onClick={() => {
                    setTimeout(() => {
                        if (this.doubleClick) {
                            this.doubleClick = false;
                            return;
                        }
                        this.onChange(k, v.value)
                    }, 300)
                }}>
                <div className={`text ${isSelected ? 'hidden-close' : 'ic-default'} ${k === 0 ? 'defaultLayout' : ''}`}>
                    <div className='layoutDropItem'>
                        <SvgIcon style={{ flexShrink: 0 }} path={iconSrc} />
                        <div className='layoutLabel showTitle text-capitalize'>{['user_layout', 'defaultLayout', 'SaveLoad'].includes(v.value) ? <Lang>{v.label}</Lang> : v.label}</div>
                    </div>
                    {isSelected ? <SvgIcon className='layout-checked' style={{ flexShrink: 0, width: '20px', height: '20px' }} path={path.mdiCheck} fill='var(--ascend-default)' /> : null}
                </div>
                <div className={`btn-gr ${isSave ? 'btnSaveActiveContainer' : ''}`} style={{ overflow: 'hidden' }}>
                    {
                        k && (k < lenOption - 1) ? [
                            <div className='flex1' key='flex1'></div>,
                            <div className='modifyButton btnEdit' key='edit' title={dataStorage.translate('lang_overwrite').toCapitalize()} onClick={() => {
                                this.doubleClick = true;
                                // this.setState({ type: { [k]: 'override' } })
                                this.override(k);
                            }}>
                                <svg style={{ marginBottom: 1 }} width="24" height="24" viewBox="0 0 24 24" className={'next'}>
                                    <path d="M14,12H19.5L14,6.5V12M8,5H15L21,11V21A2,2 0 0,1 19,23H8C6.89,23 6,22.1 6,21V18H11V20L15,17L11,14V16H6V7A2,2 0 0,1 8,5M13.5,3H4V16H6V18H4A2,2 0 0,1 2,16V3A2,2 0 0,1 4,1H11.5L13.5,3Z" />
                                </svg>
                                <div className='text-capitalize' style={{ display: 'none' }}><Lang>lang_overwrite</Lang></div>
                            </div>,
                            <div className='modifyButton btnDelete' key='delete' title={dataStorage.translate('lang_delete').toCapitalize()} onClick={() => {
                                this.delete(k, v.value);
                                this.addActiveClass();
                            }}>
                                <SvgIcon className='next' style={{ transition: 'none' }} path={path.mdiClose} />
                                <div className='text-capitalize' style={{ display: 'none' }}><Lang>lang_delete</Lang></div>
                            </div>
                        ] : null
                    }
                </div>
            </div>
        )
    }

    render() {
        try {
            let heightLst = {};
            const lenOption = this.state.option.length;
            const row = lenOption - 2;
            if (row < 5) {
                heightLst = { height: 32 * row + 'px' }
            } else if (row >= 5) {
                heightLst = { height: '160px' }
            }
            return (
                <div
                    className={`dropDown size--3 ${(this.props.title === 'Header') ? 'header' : ''} ${this.state.show ? '' : 'close'} ${this.props.className || ''}`}
                    onMouseOver={this.listenerMouseDown.bind(this)}
                    onMouseOut={() => this.lastDownTarget = null}
                    ref={this.setWrapperRef}>
                    {this.renderDefault()}
                    <div className='list'>
                        <div className='list-top size--3'>{this.renderRow(this.state.option[0], 0)}</div>
                        <div className='list-content size--3' style={heightLst}>
                            <div className='list-scroll' ref={dom => {
                                this.scrollContent = dom;
                            }}>
                                {
                                    this.state.option.map((v, k) => {
                                        if (!k || k === lenOption - 1) return null;
                                        return this.renderRow(v, k);
                                    })
                                }
                            </div>
                        </div>
                        <div className='list-bottom size--3'>{this.renderRow(this.state.option[lenOption - 1], lenOption - 1)}</div>
                    </div>
                </div>
            );
        } catch (error) {
            logger.error('render On Layout' + error)
        }
    }
    refreshData = () => {
        this.setState({ type: {} })
    }
    componentDidMount() {
        addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
        try {
            document.addEventListener('mousedown', this.handleClickOutside);
        } catch (error) {
            logger.error('componentDidMount On DropDown' + error)
        }
    }

    componentWillUnmount() {
        try {
            this.isMount = false;
            removeEventListener(EVENTNAME.clickToRefresh, this.refreshData)
            document.removeEventListener('mousedown', this.handleClickOutside);
        } catch (error) {
            logger.error('componentWillUnmount On DropDown' + error)
        }
    }
}

export default Layout;
