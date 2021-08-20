import React from 'react'
import s from './overview.module.css'
import Flashing from './flashing'
import Lang from '../Inc/Lang/Lang'
import { formatNumberPrice, clone } from '../../helper/functionUtils'
import { addPriceListener, removePriceListener } from '../../helper/priceSource'
import dataStorage from '../../dataStorage'
import Icon from '../Inc/Icon'

const LIST_INDICES = [
    { label: 'lang_SP20', value: 'top-asx-20' },
    { label: 'lang_SP50', value: 'top-asx-50' },
    { label: 'lang_SP100', value: 'top-asx-100' },
    { label: 'lang_SP200', value: 'top-asx-200' }
]
const COUNTRY = {
    AU: 'au',
    US: 'us'
}

export class Box extends React.Component {
    constructor(props) {
        super(props)
        this.active = props.active
        this.state = {
            data: props.data || {}
        }
    }

    componentWillUnmount() {
        this.unregisterRealtimeData()
    }

    isAUSymbol = (symbolInfo) => {
        return symbolInfo.country && (symbolInfo.country + '').toLowerCase() === COUNTRY.AU
    }

    realtimePrice = (newData) => {
        if (!newData || !newData.quote) return
        const data = clone(this.state.data)
        Object.assign(data, newData.quote)
        this.setState({ data })
    }

    registerRealtimeData = () => {
        this.registed = true
        const symbolInfo = dataStorage.symbolsObjDic[this.state.data.symbol]
        addPriceListener(symbolInfo, this.realtimePrice)
    }

    unregisterRealtimeData = () => {
        removePriceListener(this.realtimePrice)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ data: nextProps.data || {} }, () => {
            if (!this.registed) {
                this.unregisterRealtimeData()
                this.registerRealtimeData()
            }
        })
    }

    renderHeader() {
        return (
            <div className={`${s.row} ${s.rowBetween}`}>
                <div className={s.nameText}><Lang>{this.props.name}</Lang></div>
                <div className={`${this.state.data.status === 'active' ? s.colorUp : s.colorDown} ${s.circle}`}></div>
            </div>
        )
    }

    renderContent() {
        return <Flashing data={this.state.data} />
    }

    renderChart() {
        const { data } = this.state
        const range = data.high - data.low
        const open = (data.open - data.low) * 100 / range
        const trade = Math.max(0, (data.trade_price - data.low) * 100 / range)
        const isUp = trade > open
        const min = isUp ? open : trade
        const max = isUp ? trade : open
        return (
            <div className={s.chart}>
                <div className={s.bar}>
                    <div className={`${s.fill} ${isUp ? s.colorUp : s.colorDown}`} style={{ left: min + '%', right: Math.max(100 - max, 0) + '%' }}></div>
                    <div className={isUp ? s.arrowRight : s.arrowLeft} style={min > 0 ? { left: `${min}%` } : { right: `${Math.max(100 - max, 0)}%` }}></div>
                </div>
                <div className={`${s.row} ${s.rowBetween}`}>
                    <div className={s.rangeText}>{formatNumberPrice(data.low, true)}</div>
                    <div className={s.rangeText}>{formatNumberPrice(data.high, true)}</div>
                </div>
            </div>
        )
    }

    setActive = () => {
        if (this.active) return
        this.active = true
        this.props.setActive(this.props.index)
        this.dom && this.dom.classList.toggle(s.active)
    }

    removeActive = () => {
        this.active = false
        this.dom && this.dom.classList.toggle(s.active)
    }

    render() {
        return (
            <div className={`${s.boxContainer} ${s.column} ${this.active ? s.active : ''}`}
                ref={ref => this.dom = ref}
                onClick={this.setActive}>
                {this.renderHeader()}
                {this.renderContent()}
                {this.renderChart()}
            </div>
        )
    }
}

export default class ListBox extends React.Component {
    constructor(props) {
        super(props)
        this.activeIndex = 0
        this.box = []
        this.state = {
            listData: []
        }
        this.onResize = this.onResize.bind(this)
        props.onResize && props.onResize(this.onResize)
        this.getDataOverview = this.getDataOverview.bind(this)
        this.props.register(this.getDataOverview)
    }

    onResize(size) {
        this.size = size
        this.prev && this.prev.classList.add(s.disable)
        this.next && this.next.classList.remove(s.disable)
        switch (size) {
            case 'tiny':
                this.box[0] && this.box[0].dom.classList.remove(s.hidden)
                this.box[1] && this.box[1].dom.classList.add(s.hidden)
                this.box[2] && this.box[2].dom.classList.add(s.hidden)
                this.box[3] && this.box[3].dom.classList.add(s.hidden)
                break
            case 'small':
                this.box[0] && this.box[0].dom.classList.remove(s.hidden)
                this.box[1] && this.box[1].dom.classList.remove(s.hidden)
                this.box[2] && this.box[2].dom.classList.add(s.hidden)
                this.box[3] && this.box[3].dom.classList.add(s.hidden)
                break
            case 'medium':
                this.box[0] && this.box[0].dom.classList.remove(s.hidden)
                this.box[1] && this.box[1].dom.classList.remove(s.hidden)
                this.box[2] && this.box[2].dom.classList.remove(s.hidden)
                this.box[3] && this.box[3].dom.classList.add(s.hidden)
                break
            case 'large':
                this.box[0] && this.box[0].dom.classList.remove(s.hidden)
                this.box[1] && this.box[1].dom.classList.remove(s.hidden)
                this.box[2] && this.box[2].dom.classList.remove(s.hidden)
                this.box[3] && this.box[3].dom.classList.remove(s.hidden)
                break
            default: break
        }
    }

    async getDataOverview() {
        if (!this.props.getDataOverview) return
        let listData = await this.props.getDataOverview('top-5-asx-index')
        listData = listData.sort((a, b) => a.rank - b.rank).slice(-4)
        this.setState({ listData })
    }

    async componentDidMount() {
        this.getDataOverview()
    }

    setActive = (index) => {
        this.box[this.activeIndex] && this.box[this.activeIndex].removeActive && this.box[this.activeIndex].removeActive()
        this.activeIndex = index
        const value = LIST_INDICES[index].value
        this.props.setIndices && this.props.setIndices(value)
    }

    onPrev = (e) => {
        if (e.target.classList.contains(s.disable)) return
        const shows = this.box.filter(b => b.dom && b.dom.classList && !b.dom.classList.contains(s.hidden))
        const hiddens = this.box.filter(b => b.dom && b.dom.classList && b.dom.classList.contains(s.hidden))
        if (shows[0] && shows[0].props.index === 1) {
            this.prev && this.prev.classList.add(s.disable)
        } else this.prev && this.prev.classList.remove(s.disable)
        this.next && this.next.classList.remove(s.disable)
        const show = shows[shows.length - 1]
        show.dom.classList.add(s.hidden)
        for (let index = 0; index < hiddens.length; index++) {
            const hidden = hiddens[index];
            if (hidden.props.index === shows[0].props.index - 1) {
                hidden.dom.classList.remove(s.hidden)
                return
            }
        }
    }

    onNext = (e) => {
        if (e.target.classList.contains(s.disable)) return
        const shows = this.box.filter(b => b.dom && b.dom.classList && !b.dom.classList.contains(s.hidden))
        const hiddens = this.box.filter(b => b.dom && b.dom.classList && b.dom.classList.contains(s.hidden))
        if (shows[shows.length - 1] && shows[shows.length - 1].props.index === 2) {
            this.next && this.next.classList.add(s.disable)
        } else this.next && this.next.classList.remove(s.disable)
        this.prev && this.prev.classList.remove(s.disable)
        const show = shows[0]
        show.dom.classList.add(s.hidden)
        for (let index = 0; index < hiddens.length; index++) {
            const hidden = hiddens[index];
            if (hidden.props.index <= show.props.index) continue
            hidden.dom.classList.remove(s.hidden)
            return
        }
    }

    render() {
        return <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className={s.prev + ' ' + s.disable} onClick={this.onPrev} ref={ref => this.prev = ref}><Icon src={'navigation/chevron-left'} /></div>
            <div className={`${s.row} ${s.list}`}>
                {
                    LIST_INDICES.map((e, i) => {
                        return <Box key={i} name={e.label}
                            data={this.state.listData[i] || {}}
                            setActive={this.setActive}
                            active={i === 0} index={i} ref={ref => this.box[i] = ref} />
                    })
                }
            </div>
            <div className={s.next} ref={ref => this.next = ref} onClick={this.onNext}><Icon src={'navigation/chevron-right'} /></div>
        </div>
    }
}
