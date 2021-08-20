import React from 'react'
import dataStorage from '../../dataStorage'
import Icon from '../Inc/Icon/Icon'
import Lang from '../Inc/Lang/Lang'
import { dispatchEvent, addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon'

const MODE = {
    VIEW: 'view',
    EDIT: 'edit',
    OVERRIDE: 'override',
    DELETE: 'delete'
}

const FIXED_ITEMS = ['default_template', 'save_template']

export default class ItemLayout extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mode: MODE.VIEW
        }
    }

    componentDidMount() {
        addEventListener(EVENTNAME.chartLayoutChange, this.chartLayoutChange)
    }

    componentWillUnmount() {
        removeEventListener(EVENTNAME.chartLayoutChange, this.chartLayoutChange)
    }

    chartLayoutChange = (id) => {
        if (id === this.props.id || this.state.mode === MODE.VIEW) return
        this.changeMode()
    }

    changeMode = (mode = MODE.VIEW) => {
        this.isChangeMode = true
        if (mode !== MODE.VIEW) dispatchEvent(EVENTNAME.chartLayoutChange, this.props.id)
        setTimeout(() => {
            this.setState({ mode })
        }, 200)
    }

    getKeyEnter(event) {
        const keyCode = event.which || event.keyCode;
        if (keyCode === 13) this.saveLayout()
    }

    onChangeNameEdit = (e) => {
        this.inputValue = e.target.value.trim();
        const parent = e.target.parentElement && e.target.parentElement.parentElement
        if (!this.inputValue || this.props.listExited.includes(this.inputValue)) {
            parent.classList.add('empty')
        } else if (parent.className.includes('empty')) {
            parent.classList.remove('empty')
        }
    }

    onEditKeyPress = (e) => {
        if (this.inputValue && !this.props.listExited.includes(this.inputValue)) {
            this.getKeyEnter(e, false)
        }
    }

    saveLayout = () => {
        switch (this.state.mode) {
            case MODE.EDIT:
            case MODE.OVERRIDE:
                const layoutName = this.inputValue
                if (this.props.id === 'save_template') this.props.createNewLayout && this.props.createNewLayout(layoutName)
                else this.props.updateLayout && this.props.updateLayout(this.props.id, layoutName)
                this.inputValue = ''
                break
            case MODE.DELETE:
                this.props.updateLayout && this.props.deleteLayout(this.props.id)
                break
            case MODE.VIEW:
            default:
                break
        }
        this.changeMode()
    }

    renderEditMode = () => {
        const placeholder = FIXED_ITEMS.includes(this.props.id) ? 'New template label...' : ''
        return (
            <div className='itemChartLayout empty'>
                <div className='leftItemChildren showTitle leftItemChildrenInput'>
                    <Icon className='' src='social/person'></Icon>
                    <input className='chartLayoutInput' required type="text"
                        ref={ref => setTimeout(() => {
                            ref && ref.focus();
                            ref && ref.setSelectionRange(999, 999)
                        }, 200)}
                        defaultValue={name || ''}
                        onKeyPress={e => this.onEditKeyPress(e)}
                        onChange={e => this.onChangeNameEdit(e)}
                        type="text" placeholder={placeholder}
                    />
                </div>
                {this.renderConfirm()}
            </div>
        )
    }

    renderConfirm = () => {
        const isStatic = FIXED_ITEMS.includes(this.props.id)
        if (isStatic) {
            return <div className='chartLayoutSaveButton text-capitalize'
                onClick={this.saveLayout}>
                <Lang>lang_save</Lang>
            </div>
        }
        return (
            <div className='rightItemChildren mode'>
                <div className='yes text-uppercase' onClick={this.saveLayout}><Lang>lang_yes</Lang></div>
                <div className='no text-uppercase' onClick={this.changeMode}><Lang>lang_no</Lang></div>
            </div>
        )
    }

    renderOverrideMode = () => {
        return (
            <div className={`itemChartLayout ${this.props.isActive ? 'activeDropDownChart' : ''}`}>
                <div className='leftItemChildren text-capitalize showTitle'>
                    <Icon src='social/person'></Icon>
                    <Lang>lang_ask_overwrite</Lang>
                </div>
                {this.renderConfirm()}
            </div>
        )
    }

    renderDeleteMode = () => {
        return (
            <div className='itemChartLayout'>
                <div className='leftItemChildren text-capitalize showTitle'>
                    <Icon src='social/person'></Icon>
                    <Lang>lang_ask_delete_template</Lang>
                </div>
                {this.renderConfirm()}
            </div>
        )
    }

    switchMode() {
        switch (this.state.mode) {
            case MODE.EDIT:
                return this.renderEditMode()
            case MODE.OVERRIDE:
                return this.renderOverrideMode()
            case MODE.DELETE:
                return this.renderDeleteMode()
            case MODE.VIEW:
            default:
                return this.renderViewMode()
        }
    }

    onChangeLayout = () => {
        if (this.props.id === 'save_template') this.changeMode(MODE.EDIT)
        else this.props.onChangeLayout && this.props.onChangeLayout(this.props.id)
    }

    renderViewMode = () => {
        const isStatic = FIXED_ITEMS.includes(this.props.id)
        return (
            <div className={`itemChartLayout ${this.props.isActive ? 'activeDropDownChart' : ''} ${this.props.id}`}
                onClick={() => {
                    if (this.isChangeMode) {
                        this.isChangeMode = false
                        return
                    }
                    this.timerClick && clearTimeout(this.timerClick)
                    this.timerClick = setTimeout(() => {
                        this.onChangeLayout()
                    }, 500)
                }}
                onDoubleClick={() => {
                    this.timerClick && clearTimeout(this.timerClick)
                    if (!isStatic) this.changeMode(MODE.EDIT)
                }}>
                <div className='leftItemChildren showTitle text-capitalize'>
                    <Icon src={this.props.iconName} className=''></Icon>
                    <Lang>{this.props.label}</Lang>
                </div>
                <div className='rightItemChildren'>
                    {
                        this.props.isActive ? <SvgIcon path={path.mdiCheck} fill='var(--ascend-default)' /> : null
                    }
                    {
                        isStatic ? null : <div className='chartLayoutOption'>
                            <div className='deleteChartLayout' title={dataStorage.translate('lang_overwrite').toCapitalize()} onClick={() => this.changeMode(MODE.OVERRIDE)}>
                                <svg className='' style={{ 'marginBottom': '1px', fill: '#c5cbce' }} width="16" height="16" viewBox="0 0 24 24">
                                    <path d="M14,12H19.5L14,6.5V12M8,5H15L21,11V21A2,2 0 0,1 19,23H8C6.89,23 6,22.1 6,21V18H11V20L15,17L11,14V16H6V7A2,2 0 0,1 8,5M13.5,3H4V16H6V18H4A2,2 0 0,1 2,16V3A2,2 0 0,1 4,1H11.5L13.5,3Z" />
                                </svg>
                            </div>
                            <div className='deleteChartLayout' title={dataStorage.translate('lang_delete').toCapitalize()} onClick={() => this.changeMode(MODE.DELETE)}>
                                <Icon src='navigation/close'></Icon>
                            </div>
                        </div>
                    }
                </div>
            </div>
        )
    }

    render() {
        return this.switchMode()
    }
}
