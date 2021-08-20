import React from 'react';
import dataStorage from '../../dataStorage'
import uuidv4 from 'uuid/v4'
import logger from '../../helper/log';
import Lang from '../Inc/Lang/Lang';
import {
    getCreateMultiWatchlist,
    getDeleteWatchlist,
    deleteData,
    postData,
    putData,
    getUpdateWatchlist
} from '../../helper/request';
import {
    getDropdownContentDom,
    clone,
    checkRole
} from '../../helper/functionUtils';
import QuickMenu from './QuickMenu';
import MapRoleComponent from '../../constants/map_role_component';
import Icon from '../Inc/Icon/Icon';
import PriceDisplay from '../../constants/price_display_type';
import ConverValueWl from './price_display_watchlist';
import NoTag from '../Inc/NoTag/NoTag';
import SvgIcon, { path } from '../Inc/SvgIcon';

class SearchBoxWatchlist extends React.Component {
    constructor(props) {
        super(props)
        this.isShowing = false;
        if (this.props.fn) {
            this.props.fn({
                buildMenu: this.buildMenu,
                handleOnChangeDropDown: this.handleOnChangeDropDown,
                updateLayout: this.updateLayout
            })
        }
        this.buildMenu()
        this.initTemplate()
        this.initButton()
        this.userWatchlist = []
        this.state = {
            dropDownFilter: props.dropDownFilter
        }
        this.dicWatchlist = props.dicWatchlist || {};
    }

    defineChildDefaultMenu = (label, value, labelPriority) => {
        const obj = {
            label: <div className='pre-wl-DropItem'><Lang>{label}</Lang></div>,
            value
        }
        !!labelPriority && (obj.label_priority = <Lang>{labelPriority}</Lang>)
        return obj;
    }

    componentDidUpdate(nextProps) {
        if (nextProps.dicWatchlist && nextProps.dicWatchlist !== this.dicWatchlist) this.dicWatchlist = nextProps.dicWatchlist;
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }
    componentDidMount = () => {
        document.addEventListener('mousedown', this.handleClickOutside);
    };
    handleClickOutside = (event) => {
        try {
            this.isFocus = false;
            this.isSaving = false;
            this.target && this.target.classList.remove('active');
            this.refWl && this.refWl.classList.remove('active');
            if (this.refWl && (this.refWl.contains(event.target) || (this.quickMenuDiv && this.quickMenuDiv.contains(event.target)))) {

            } else {
                if (this.clearAction) this.clearAction()
            }
        } catch (error) {
            logger.error('handleClickOutside On DropDown' + error)
        }
    }

    activeSubmenu(workingItem) {
        if (!workingItem) return;
        const target = workingItem && workingItem.parentNode && workingItem.parentNode.parentNode && workingItem.parentNode.parentNode.parentNode
        if (this.refWl === target) {
            this.target && this.target.classList.remove('active');
            this.target = null;
        } else {
            target && target.classList.add('active');
            this.target = target;
        }
    }
    initTemplate() {
        this.template = {
            save: (qm, item, next) => {
                if (item.type !== 'new') {
                    this.isSaving = true;
                }
                this.refWl && this.refWl.classList.add('active');
                return <NoTag>
                    <Icon className='qe-lib-icon' style={{ transition: 'none', height: '13px', width: '14px', marginRight: '10px' }}
                        src={item.value === 'Create New Watchlist' ? 'file/create-new-folder' : 'content/save'} />
                    <input id='saveNewWatchlist' maxLength='100' title={dataStorage.translate('lang_please_fillout_input')} className='empty' ref={dom => setTimeout(() => {
                        this.activeSubmenu(dom);
                        dom && dom.focus()
                    }, 200)} onChange={(event) => {
                        item.newValue = event.target.value.trim();
                        event.target.className = qm.inputValue ? '' : 'empty'
                        if (event.target.value.trim()) {
                            if (this.userWatchlist.filter(a => a.watchlist_name === event.target.value.trim()).length || !event.target.value.trim()) {
                                event.target.nextElementSibling.classList.remove('pre-wl-btn-enable');
                            } else {
                                event.target.nextElementSibling.classList.add('pre-wl-btn-enable');
                            }
                        } else {
                            event.target.nextElementSibling.classList.remove('pre-wl-btn-enable');
                        }
                    }}
                        required
                        type='text'
                        onKeyDown={(event) => {
                            event.persist()
                            this.timeoutId && clearTimeout(this.timeoutId)
                            this.timeoutId = setTimeout(() => {
                                if (event.keyCode === 13) {
                                    if (event.target.value.trim()) {
                                        next(true)
                                    }
                                }
                            }, 200)
                        }}
                    />
                    <div className='pre-wl-btnSave text-capitalize' onClick={() => {
                        next(true);
                    }}><Lang>lang_save</Lang></div>
                    <div className='placeHolderNewWatchlist text-capitalize'><Lang>lang_new_watchlist</Lang>...</div>
                </NoTag>
            },
            update: (qm, item, next) => {
                this.refWl && this.refWl.classList.add('active');
                let check = 0;
                return <NoTag>
                    <input
                        maxLength='100'
                        onChange={(event) => {
                            if (event.target.value) {
                                if (this.userWatchlist.filter(a => a.watchlist_name === event.target.value.trim()).length || !event.target.value.trim()) {
                                    event.target.nextElementSibling.nextElementSibling.classList.add('disabled');
                                    check = 0;
                                } else {
                                    event.target.nextElementSibling.nextElementSibling.classList.remove('disabled');
                                    item.newValue = event.target.value;
                                    check = 1;
                                }
                            } else {
                                event.target.nextElementSibling.nextElementSibling.classList.add('disabled');
                                check = 0;
                            }
                        }} type="text"
                        ref={dom => {
                            this.activeSubmenu(dom);
                            setTimeout(() => {
                                if (dom) {
                                    dom.focus();
                                    dom.setSelectionRange(dom.value.length, dom.value.length);
                                }
                            }, 200)
                        }}
                        defaultValue={item.name || ''}
                        onKeyDown={(event) => {
                            event.persist()
                            this.timeoutId && clearTimeout(this.timeoutId)
                            this.timeoutId = setTimeout(() => {
                                if (event.keyCode === 13) {
                                    if (event.target.value.trim()) {
                                        next(true)
                                    }
                                }
                            }, 200)
                        }}
                    />
                    <div className='showTitle no' onClick={() => next()}>No</div>
                    <div className='showTitle yes disabled' onClick={() => {
                        if (check === 1) next(true)
                    }}>Yes</div>
                </NoTag>
            },
            delete: (qm, item, next) => {
                this.refWl && this.refWl.classList.add('active');
                return <NoTag>
                    <div style={{ marginLeft: '8px !important' }} ref={dom => this.activeSubmenu(dom)}>Delete Watchlist?</div>
                    <div style={{ marginLeft: '18px !important' }} className='no showTitle' onClick={() => next()}>No</div>
                    <div className='yes showTitle' onClick={() => next(true)}>Yes</div>
                </NoTag>
            },
            override: (qm, item, next) => {
                this.refWl && this.refWl.classList.add('active');
                return <NoTag>
                    <div ref={dom => this.activeSubmenu(dom)}>lang_overwrite Watchlist?</div>
                    <div className='showTitle no' onClick={() => next()}>No</div>
                    <div className='showTitle yes' onClick={() => next(true)}>Yes</div>
                </NoTag>
            }
        }
    }
    initButton() {
        this.button = {
            update: () => {
                if (this.isSaving) return ''
                return <Icon className='qe-lib-icon' style={{ transition: 'none', marginRight: '3px' }} src='image/edit' />
            },
            delete: (item) => {
                if (this.isSaving) return ''
                if (item.value === this.state.value) return ''
                return <Icon className='qe-lib-icon' style={{ transition: 'none' }} src='navigation/close' />
            },
            override: (item, next) => {
                if (!this.isSaving) return ''
                return <div className='pre-wl-btn-Override' onClick={() => {
                    next(true);
                }}>Save</div>
            }
        }
    }
    handleClickArrow() {
        if (this.clearAction) this.clearAction();
    }

    handleOnMouseEnter() {
        if (this.isShowing) return;
        this.isShowing = true;
        const quickMenu = <QuickMenu
            menu={this.menu}
            template={this.template}
            button={checkRole(MapRoleComponent.CREATE_REMOVE_ADD_WATCHLIST) ? this.button : {}}
            onChange={this.onQuickMenuChange}
            value={this.state.dropDownFilter || this.state.value}
            onlyOne={true}
            fn={fn => {
                this.setValue = fn.setValue
                this.clearAction = fn.clearAction
                this.setMenu = fn.setMenu
            }}
            controlResize={this.controlResize}
        />

        let div = getDropdownContentDom()
        this.quickMenuDiv = document.createElement('div')
        this.quickMenuDiv.className = 'quickMenu'
        div.appendChild(this.quickMenuDiv)
        ReactDOM.render(quickMenu, this.quickMenuDiv)
        this.quickMenuDiv.style.position = 'absolute';
        this.quickMenuDiv.style.display = 'block';
        let dropdownMinWidth = this.refWl.clientWidth + 'px';
        this.quickMenuDiv.style.minWidth = dropdownMinWidth;
        document.addEventListener('mouseover', this.hoverEvent);
        const rect = this.refWl.getBoundingClientRect();
        const top = rect.top + this.refWl.clientHeight;
        const spaceBottom = window.innerHeight - top
        this.quickMenuDiv.style.left = rect.left + 'px';
        if (rect.top > spaceBottom && spaceBottom < 200) {
            this.quickMenuDiv.style.bottom = (spaceBottom + this.refWl.clientHeight) + 'px';
            this.quickMenuDiv.style.maxHeight = (rect.top > 336 ? 336 : rect.y) + 'px'
            this.quickMenuDiv.style.top = null;
        } else {
            this.quickMenuDiv.style.top = (rect.top + this.refWl.clientHeight) + 'px';
            this.quickMenuDiv.style.bottom = null
            this.quickMenuDiv.style.maxHeight = (spaceBottom > 336 ? 336 : spaceBottom) + 'px'
        }
    }
    hoverEvent = (event) => {
        if (event.target) {
            if (this.refWl) {
                if (!this.refWl.contains(event.target) && !this.quickMenuDiv.contains(event.target)) {
                    this.disableDropdown()
                }
            }
        }
    }

    disableDropdown() {
        this.clearAction && this.clearAction();
        document.removeEventListener('mouseover', this.hoverEvent);
        // ReactDOM.render(null, this.quickMenuDiv);
        this.quickMenuDiv && this.quickMenuDiv.parentNode && this.quickMenuDiv.parentNode.removeChild(this.quickMenuDiv);
        this.isShowing = false
    }

    onQuickMenuChange = (item, action) => {
        if (action === 'save') {
            if (!checkRole(MapRoleComponent.CREATE_REMOVE_ADD_WATCHLIST)) return
            this.saveLayout(item.newValue, item.type === 'new');
        } else if (action === 'delete') {
            if (!checkRole(MapRoleComponent.CREATE_REMOVE_ADD_WATCHLIST)) return
            this.deleteLayout(item.value);
        } else if (action === 'update') {
            if (!checkRole(MapRoleComponent.CREATE_REMOVE_ADD_WATCHLIST)) return
            this.updateLayout(item.value, item.newValue, null, action);
        } else if (action === 'override') {
            if (!checkRole(MapRoleComponent.CREATE_REMOVE_ADD_WATCHLIST)) return
            this.updateLayout(item.value);
        } else {
            this.handleOnChangeDropDown(item);
        }
    }
    buildMenu = (userWatchlist) => {
        if (userWatchlist) this.userWatchlist = userWatchlist
        const isLogin = !!dataStorage.userInfo;
        const userMenu = (userWatchlist || []).map(data => {
            return {
                label: <div>{data.watchlist_name}</div>,
                value: data.watchlist,
                name: data.watchlist_name,
                action: ['update', 'delete', 'override']
            }
        })
        let menu;
        if (dataStorage.userInfo) {
            if (checkRole(MapRoleComponent.CREATE_REMOVE_ADD_WATCHLIST)) {
                menu = [
                    {
                        label: <div className='text-capitalize'><Icon className='qe-lib-icon' style={{ transition: 'none', height: '13px', width: '14px', marginRight: '10px' }}
                            src='file/create-new-folder' /><Lang>lang_create_new_watchlist</Lang></div>,
                        value: PriceDisplay.CreateNewWatchlist,
                        action: ['save'],
                        type: 'new',
                        checkNoValue: true,
                        name: PriceDisplay.CreateNewWatchlist
                    },
                    {
                        label: <span className='text-capitalize'><Lang>lang_favorites</Lang></span>,
                        className: 'pre-wl-bordItem',
                        displayIconCheck: true,
                        value: 'user-watchlist',
                        name: PriceDisplay.Favorites
                    },
                    ...userMenu
                ]
            } else {
                menu = [
                    {
                        label: <span className='text-capitalize'><Lang>lang_favorites</Lang></span>,
                        className: 'pre-wl-bordItem',
                        displayIconCheck: true,
                        value: 'user-watchlist',
                        name: PriceDisplay.Favorites
                    },
                    ...userMenu
                ]
            }
        } else {
            menu = [
                this.defineChildDefaultMenu('lang_SP20', 'top-asx-20')
            ];
        }
        this.menu = menu;
        if (this.setMenu) this.setMenu(menu);
    }

    saveLayout(name, isNew) {
        try {
            for (let id in this.dicWatchlist) {
                if (this.dicWatchlist[id].watchlist_name === name) return
            }
            const newObj = {};
            newObj.user_id = dataStorage.userInfo.user_id;
            newObj.watchlist = uuidv4();
            newObj.watchlist_name = name;
            this.props.saveActiveId && this.props.saveActiveId(newObj.watchlist)
            // this.waitForActiveId = newObj.watchlist;
            if (isNew) {
                newObj.value = [];
            } else {
                newObj.value = this.grid.behavior.getData().map(element => {
                    return {
                        symbol: element.symbol,
                        rank: element.rank
                    }
                });
            }
            const urlMultiWatchlist = getCreateMultiWatchlist(dataStorage.userInfo.user_id);
            postData(urlMultiWatchlist, { data: newObj })
        } catch (error) {
            logger.error('saveLayout On Watchlist' + error)
        }
    }
    updateLayout = (wlId, name, sortBySearchSymbol, action) => {
        if (!this.dicWatchlist[wlId]) return;
        if (name) this.dicWatchlist[wlId].watchlist_name = name;
        this.dicWatchlist[wlId].user_id = dataStorage.userInfo.user_id;
        if (sortBySearchSymbol) {
        } else if (!name) {
            let index = 0;
            this.dicWatchlist[wlId].value = this.grid.behavior.getData().map(element => {
                return {
                    symbol: element.symbol,
                    rank: index++
                }
            })
        }
        if (!this.dicWatchlist[wlId].value) {
            this.dicWatchlist[wlId].value = [];
        }
        let urlUpdateWl = getUpdateWatchlist(wlId, dataStorage.userInfo.user_id);
        let data = this.dicWatchlist[wlId]
        delete data.init_time;
        delete data.isFake;
        let dataWl = clone(this.dicWatchlist[wlId]);
        let dataValue = []
        for (let i = 0; i < dataWl.value.length; i++) {
            dataValue.push({
                symbol: dataWl.value[i].symbol,
                rank: dataWl.value[i].rank
            })
        }
        dataWl.value = dataValue
        putData(urlUpdateWl, { data: dataWl })
        if ((this.state.dropDownFilter !== wlId) && (action !== 'update')) {
            this.props.setTitle({ text: 'Watchlist', name: this.currentWatchlistName });
            this.handleOnChangeDropDown(wlId);
        }
    }

    deleteLayout(wlId) {
        if (!dataStorage.userInfo) return;
        if (wlId) {
            const urlgetDeleteWatchlist = getDeleteWatchlist(wlId, dataStorage.userInfo.user_id);
            deleteData(urlgetDeleteWatchlist)
        }
    }

    handleOnChangeDropDown = (data) => {
        try {
            let value = data;
            if (data.value) value = data.value;
            if (data.name === PriceDisplay.Favorites) {
                value = 'user-watchlist';
            }
            this.setState({
                dropDownFilter: value
            }, () => {
                this.props.handleOnChangeDropDown && this.props.handleOnChangeDropDown(value)
                this.setValue && this.setValue(value);
            });
        } catch (error) {
            logger.error('handleOnChangeDropDown On Watch List', error)
        }
    }

    renderDefault() {
        try {
            let name = '';
            if (this.state.dropDownFilter === 'user-watchlist') {
                dataStorage.usingWatchlist = 'user-watchlist'
                dataStorage.usingWatchlist_name = 'Favorites'
                name = <span className='text-capitalize'><Lang>lang_favorites</Lang></span>
            } else {
                name = this.dicWatchlist[this.state.dropDownFilter] ? (this.dicWatchlist[this.state.dropDownFilter].watchlist_name) : <Lang>{ConverValueWl[this.state.dropDownFilter]}</Lang>;
            }
            return <div className='dropDownHeader size--3'>
                <div className='left'>{name}</div>
                <div className='right' onClick={this.handleClickArrow}><Icon className='qe-lib-icon' src='navigation/arrow-drop-down' /></div>
            </div>
        } catch (error) {
            logger.error('renderDefault On DropDown' + error)
        }
    }

    render() {
        return (
            <div className='pre-dropDownNormal' ref={dom => {
                this.refWl = dom;
            }}
                onMouseEnter={this.handleOnMouseEnter.bind(this)}
            >
                {this.renderDefault()}
            </div>
        )
    }
}
export default SearchBoxWatchlist;
