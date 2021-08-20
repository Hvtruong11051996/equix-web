import React from 'react'
import s from './Dropdown.module.css'
import SvgIcon, { path } from '../Inc/SvgIcon'
import { getDropdownContentDom } from '../../helper/functionUtils'

export default class Dropdown extends React.Component {
    constructor(props) {
        super(props)
        this.fullOption = [...this.props.optionsFixTop, ...this.props.options]
        this.value = this.props.value || []
        this.hoverEvent = this.hoverEvent.bind(this);
        //     this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    componentDidMount() {
        document.addEventListener('mouseover', this.hoverEvent);
        document.addEventListener('mousedown', this.hoverEvent);
    }

    componentWillUnmount() {
        document.removeEventListener('mouseover', this.hoverEvent);
        document.removeEventListener('mousedown', this.hoverEvent);
    }

    renderDefaultValue() {
        const valueStr = this.value.join(', ').trim()
        return <div className={s.defaultValue}>
            {valueStr || '--'}
        </div>
    }

    renderDropdownIcon() {
        return <SvgIcon className={s.dropdownIcon} path={this.props.path || path.mdiChevronDown} />
    }

    onChange = (value) => {
        this.value = value
        this.props.onChange && this.props.onChange(value)
        this.forceUpdate()
    }

    renderListOption() {
        return <ListOption {...this.props} onChange={this.onChange} />
    }

    setWrapperRef = (node) => {
        this.wrapperRef = node;
        if (node) {
            let div = getDropdownContentDom()
            node.addEventListener('mouseenter', () => {
                if (this.isShowing) return;
                this.isShowing = true
                this.floatContent = document.createElement('div');
                div.appendChild(this.floatContent);
                ReactDOM.render(this.renderListOption(), this.floatContent);
                this.floatContent.style.position = 'absolute';
                this.floatContent.style.display = 'block';
                this.floatContent.style.boxShadow = '0 2px 5px 0 #000';
                this.floatContent.style.width = '280px';
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
                const right = rect.right;
                const maxRange = right <= window.innerWidth ? right : window.innerWidth
                this.floatContent.style.left = (maxRange - this.floatContent.offsetWidth) + 8 + 'px';
            });
        }
    }

    hoverEvent(event) {
        if (event.target) {
            if (this.wrapperRef) {
                if (this.wrapperRef.contains(event.target) || (this.floatContent && this.floatContent.contains(event.target))) {

                } else {
                    this.disableDropdown()
                }
            }
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

    render() {
        return <div
            style={this.props.style || {}}
            className={s.container}
            ref={this.setWrapperRef}>
            {this.renderDefaultValue()}
            {this.renderDropdownIcon()}
        </div>
    }
}

class Item extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            checked: this.props.checked || false
        }
    }

    onSelect = () => {
        this.setState(prevState => ({ checked: !prevState.checked }))
        this.props.onSelect(this.props.data)
    }

    render() {
        return <div key={this.props.key} className={s.item + ' ' + (this.props.disable ? s.disableItem : '') + ' ' + this.props.className} onClick={() => this.props.disable || this.onSelect()}>
            <SvgIcon className={s.searchIcon} path={this.state.checked ? path.mdiCheckboxMarkedCircle : path.mdiCheckboxBlankCircleOutline} />
            <div className={s.label}>{this.props.data.label}</div>
        </div>
    }
}

class ListOption extends React.Component {
    constructor(props) {
        super(props)
        this.value = props.value
        this.state = {
            textSearch: '',
            disable: props.value.includes('Everything')
        }
    }

    onSearchOption = (e) => {
        const textSearch = e.target.value
        this.timeout && clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
            this.setState({ textSearch: textSearch.toLowerCase() })
        }, 300)
    }

    renderSearchOption() {
        return <div className={s.searchOption}>
            <SvgIcon className={s.searchIcon} path={path.mdiMagnify} />
            <input className={s.inputSearch} onChange={this.onSearchOption} />
        </div>
    }

    renderFixOptions() {
        return <div>
            {
                this.props.optionsFixTop.map((e, i) => {
                    if (this.state.textSearch && !(e.label + '').toLowerCase().includes(this.state.textSearch)) return null
                    const checked = this.value.includes(e.value)
                    const disable = this.state.disable && !e.all
                    return <Item key={`renderFixOptions_${i}`} className={e.className} disable={disable} checked={checked} data={e} onSelect={(opt) => disable || this.onSelect(opt)} />
                })
            }
        </div>
    }

    onSelect = (option) => {
        const value = [...new Set(this.value)]
        const index = value.findIndex(e => e === option.value)
        if (index !== -1) {
            value.splice(index, 1)
        } else value.push(option.value)
        this.setState({ disable: value.includes('Everything') })
        this.props.onChange && this.props.onChange(value);
        this.value = [...value]
    }

    renderOptions() {
        return <div>
            {
                this.props.options.map((e, i) => {
                    if (this.state.textSearch && !(e.label + '').toLowerCase().includes(this.state.textSearch)) return null
                    const checked = this.value.includes(e.value)
                    const disable = this.state.disable && !e.all
                    return <Item key={`renderOptions_${i}`} disable={disable} checked={checked} data={e} onSelect={this.onSelect} />
                })
            }
        </div>
    }

    renderDotedLine() {
        return <div className={s.lineDotted}></div>
    }

    render() {
        return <div className={s.listOption}>
            {this.renderSearchOption()}
            {this.renderFixOptions()}
            {this.renderDotedLine()}
            {this.renderOptions()}
        </div>
    }
}
