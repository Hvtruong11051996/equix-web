import React from 'react'
import { formatNumberPrice, formatNumberValue, transparentBackgroundColorMixin } from '../../helper/functionUtils'
import s from './overview.module.css'

const DEFAULT_VALUE = '--'
const SPEED_OPACITY_FLASHING = 0.05
const SIGN = [-1, 1]

const dicColor = {
    color: 'var(--secondary-default)',
    priceUp: 'var(--buy-light)',
    priceDown: 'var(--sell-light)'
}
export default class SearchSymbol extends React.Component {
    constructor(props) {
        super(props)
        this.requestId = null
        this.start = null
        this.opacity = 1
        const data = props.data || {}
        this.prevState = {
            tradePrice: data.trade_price || 0,
            changePoint: data.change_point || 0,
            changePercent: data.change_percent || 0
        }
        this.state = {
            tradePrice: data.trade_price || DEFAULT_VALUE,
            changePoint: data.change_point || DEFAULT_VALUE,
            changePercent: data.change_percent || DEFAULT_VALUE
        }
    }

    getFakeValue(value) {
        if (!value) return 0
        const res = value + SIGN[Math.round(Math.random())] * value / 10
        return res
    }

    fakeRealtime() {
        const { tradePrice, changePoint, changePercent } = this.state
        this.setPrevState()
        this.setState({
            tradePrice: this.getFakeValue(tradePrice),
            changePoint: this.getFakeValue(changePoint),
            changePercent: this.getFakeValue(changePercent)
        })
    }

    componentDidMount() {
        // setTimeout(() => {
        //     this.fakeId = setInterval(() => {
        //         this.fakeRealtime()
        //     }, 1000)
        // }, 2000)
    }

    componentWillUnmount() {
        clearInterval(this.fakeId)
    }

    componentWillReceiveProps(nextProps) {
        const data = nextProps.data || {}
        if (this.isNotChange(data)) return
        this.setPrevState()
        this.setState({
            tradePrice: data.trade_price || DEFAULT_VALUE,
            changePoint: data.change_point || DEFAULT_VALUE,
            changePercent: data.change_percent || DEFAULT_VALUE
        })
    }

    setPrevState = () => {
        this.prevState = {
            tradePrice: this.state.tradePrice,
            changePoint: this.state.changePoint,
            changePercent: this.state.changePercent
        }
    }

    isNotChange = (obj) => {
        return obj.trade_price === this.state.tradePrice &&
            obj.change_point === this.state.changePoint &&
            obj.change_percent === this.state.changePercent
    }

    flash = (bg) => {
        const that = this
        return function (timeStamp) {
            if (that.start === null) that.start = timeStamp
            const elapsed = timeStamp - that.start
            that.opacity -= SPEED_OPACITY_FLASHING
            that.opacity = Math.max(0, that.opacity)
            if (that.tradePrice) {
                that.tradePrice.style.background = transparentBackgroundColorMixin(that.opacity, bg)
            }
            if (elapsed < 1000 / 3) {
                if (elapsed > 300) {
                    that.tradePrice.style.background = 'transparent'
                    that.tradePrice.style.color = bg
                    that.requestId = requestAnimationFrame(that.flash(bg))
                } else that.requestId = requestAnimationFrame(that.flash(bg))
            } else {
                cancelAnimationFrame(that.requestId)
                that.tradePrice.style.background = 'transparent'
                that.tradePrice.style.color = bg
            }
        }
    }

    getColor = (field) => {
        let className = 'color'
        if (this.state[field] > 0) className = 'priceUp';
        else if (this.state[field] < 0) className = 'priceDown';
        return dicColor[className]
    }

    flashing = () => {
        const className = this.state.tradePrice > this.prevState.tradePrice ? 'priceUp' : this.state.tradePrice < this.prevState.tradePrice ? 'priceDown' : 'color'
        const bg = dicColor[className]
        if (className !== 'color' && !this.isRefresh && this.tradePrice) {
            this.opacity = 1
            this.start = null
            this.tradePrice.style.background = bg
            this.tradePrice.style.color = 'var(--secondary-light)'
            this.requestId = requestAnimationFrame(this.flash(bg))
            return
        }
        return bg
    }

    render() {
        const {
            tradePrice,
            changePoint,
            changePercent
        } = this.state
        return (
            <div className={s.row}>
                <div ref={ref => this.tradePrice = ref}
                    style={{ color: this.flashing() }} className={s.mainPriceText + ' showTitle'}>
                    {tradePrice || tradePrice === 0 ? formatNumberPrice(tradePrice, true) : DEFAULT_VALUE}
                </div>
                <div style={{ width: 4 }} />
                <div className={s.column}>
                    <div style={{ color: this.getColor('changePoint') }} className={s.subPriceText + ' showTitle'}>
                        {changePoint || changePoint === 0 ? `${changePoint > 0 ? '+' : ''}${formatNumberPrice(changePoint, true)}` : DEFAULT_VALUE}
                    </div>
                    <div style={{ color: this.getColor('changePercent') }} className={s.subPriceText + ' showTitle'}>
                        {changePercent || changePercent === 0 ? `${changePercent > 0 ? '+' : ''}${formatNumberValue(changePercent, true)}` + '%' : DEFAULT_VALUE}
                    </div>
                </div>
            </div>
        )
    }
}
