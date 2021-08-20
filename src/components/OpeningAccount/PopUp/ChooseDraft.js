import React from 'react'
import Lang from '../../Inc/Lang'
import s from '../OpeningAccount.module.css'
import { FIELD } from '../constant'
import SvgIcon, { path } from '../../Inc/SvgIcon'
import { getOpeningAccountUrl, getData, deleteData, putData } from '../../../helper/request'
import DropDown from '../../DropDown'
import showModal from '../../Inc/Modal'
import dataStorage from '../../../dataStorage'
import Button, { buttonType } from '../../Elements/Button/Button';
import OpeningAccount from '../OpeningAccount'
import { getDropdownContentDom, hideTooltip } from '../../../helper/functionUtils'
import { truncateText } from '../../Inc/CanvasGrid/helper/func'
import QuickMenu from '../../WatchlistBottom/QuickMenu'
import Icon from '../../Inc/Icon'
import NoTag from '../../Inc/NoTag'

export default class SaveDraft extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            options: [],
            isWaiting: true
        }
        this.initTemplate()
        this.initButton()
    }

    initButton = () => {
        this.button = {
            update: () => {
                if (this.isSaving) return ''
                return <Icon className='qe-lib-icon' style={{ transition: 'none', marginRight: '3px' }} src='image/edit' />
            },
            delete: (item) => {
                if (this.isSaving) return ''
                if (item.value === this.state.value) return ''
                return <Icon className='qe-lib-icon' style={{ transition: 'none' }} src='navigation/close' />
            }
        }
    }
    onChange = value => {
        this.value = value
    }
    openForm = (id, name, obj) => {
        showModal({
            component: OpeningAccount,
            className: 'allowNested',
            props: {
                draft_id: id,
                draft_name: name,
                data: obj
            }
        });
        this.props.close();
    }
    onBtnClick = () => {
        const obj = (this.dicDraft && this.dicDraft[this.value] && this.dicDraft[this.value]) || {}
        this.openForm(this.value, obj.name, obj.data)
    }
    renderHeader() {
        return <div className={s.header} style={{ padding: '0 8px' }}>
            <div className={s.title + ' ' + 'showTitle text-capitalize'}><Lang>lang_account_opening</Lang></div>
            <div className={s.icon} onClick={this.props.close}><SvgIcon path={path.mdiClose} /></div>
        </div>
    }
    removeDraft = (key) => {
        deleteData(getOpeningAccountUrl('/draft') + '?draft_id=' + key)
            .then((res) => {
                if (this.dicDraft) delete this.dicDraft[key];
                this.updateOption()
                this.disableDropdown()
            }).catch(error => {
                this.disableDropdown()
                console.error(`remove darft opening account error ${error}`)
            })
    }
    updateOption = (isFirst) => {
        const obj = this.dicDraft || {};
        let options = Object.keys(obj).map(key => {
            return {
                label: <div>
                    <div style={{ flex: '1', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{obj[key].name}</div>
                </div>,
                value: key,
                name: obj[key].name,
                action: ['update', 'delete']
            }
        })
        this.menu = options
        if (isFirst) this.value = options[0] && options[0].value
        this.setMenu && this.setMenu()
        this.forceUpdate()
    }
    componentDidMount = () => {
        getData(getOpeningAccountUrl('/draft'))
            .then((res) => {
                if (res.data) {
                    if (!res.data || !Object.keys(res.data).length) this.openForm();
                    this.dicDraft = res.data;
                    this.updateOption(true);
                    this.setState({
                        isWaiting: false
                    })
                }
            }).catch(error => {
                console.error(`get darft opening account error ${error}`)
            })
    }

    onQuickMenuChange = (item, action) => {
        if (!action && item) {
            this.value = item.value
            this.forceUpdate()
            this.disableDropdown()
        }
        if (action === 'delete') {
            this.removeDraft(item.value)
        } else if (action === 'update') {
            this.updateDraftName(item)
        }
    }

    updateDraftName = data => {
        let dataPut = this.dicDraft[data.value];
        dataPut.name = data.newValue
        putData(getOpeningAccountUrl('/draft') + '?draft_id=' + data.value, dataPut).then(res => {
            this.updateOption()
        }).catch(err => {
            console.log('errr', err)
        })
    }

    initTemplate() {
        this.template = {
            update: (qm, item, next) => {
                this.refWl && this.refWl.classList.add('active');
                let check = 0;
                return <NoTag>
                    <input
                        maxLength='100'
                        onChange={(event) => {
                            if (event.target.value.trim() && event.target.value.trim() !== (item.name + '').trim()) {
                                event.target.nextElementSibling.nextElementSibling.classList.remove('disabled');
                                item.newValue = event.target.value;
                                check = 1;
                            } else {
                                event.target.nextElementSibling.nextElementSibling.classList.add('disabled');
                                check = 0;
                            }
                        }} type="text"
                        ref={dom => {
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
                                    if (event.target.value.trim() && event.target.value.trim() !== (item.name + '').trim()) {
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
                    <div style={{ marginLeft: '8px !important' }}>Delete Draft?</div>
                    <div style={{ marginLeft: '18px !important' }} className='no showTitle' onClick={() => next()}>No</div>
                    <div className='yes showTitle' onClick={() => next(true)}>Yes</div>
                </NoTag>
            }
        }
    }

    handleOnMouseEnter = () => {
        if (this.isShowing) return;
        this.isShowing = true;
        const quickMenu = <QuickMenu
            menu={this.menu}
            template={this.template}
            button={this.button || {}}
            onChange={this.onQuickMenuChange}
            value={this.value}
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
        hideTooltip()
    }

    renderDefault = () => {
        const obj = (this.dicDraft && this.dicDraft[this.value] && this.dicDraft[this.value]) || {}
        return (
            <div className='dropDown size--3' style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{obj.name}</div>
                <SvgIcon path={path.mdiChevronDown} />
            </div>
        )
    }
    render() {
        return <div className={s.popup} style={{ width: '400px', maxWidth: '100vw' }} >
            {this.renderHeader()}
            {this.state.isWaiting
                ? <div style={{ height: '112px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> <img className='icon' src='common/Spinner-white.svg' /> </div>
                : <div style={{ padding: '8px' }}>
                    <div className='text-capitalize'><Lang>lang_choose_draft</Lang></div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '16px' }}>
                        <div className='text-capitalize'><Lang>lang_draft</Lang></div>
                        <div
                            ref={dom => this.refWl = dom}
                            onMouseEnter={this.handleOnMouseEnter}
                            style={{ width: '200px', marginLeft: '16px' }}
                        >
                            {this.renderDefault()}
                        </div>
                        {/* <DropDown style={{ width: '200px', marginLeft: '16px' }} options={this.state.options} value={this.state.options[0] && this.state.options[0].value} onChange={this.onChange} skipnull={true} /> */}
                    </div>
                    <div className='text-capitalize' style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                        <Button onClick={this.openForm} className={s.button}>
                            <Lang>lang_create_new</Lang>
                        </Button>
                        <Button type={buttonType.ascend} onClick={this.onBtnClick} className={s.button}>
                            <Lang>lang_select</Lang>
                        </Button>
                    </div>
                </div>
            }
        </div>
    }
}
