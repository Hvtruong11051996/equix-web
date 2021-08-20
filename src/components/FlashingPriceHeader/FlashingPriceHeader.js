import React from 'react';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import {
    formatNumberPrice,
    formatNumberValue
} from '../../helper/functionUtils';
import { showTooltip, hideTooltip } from '../Inc/CanvasGrid/helper/func';

const FONT_SIZE = {
    'small': {
        'size--3': '13px',
        'size--4': '16px'
    },
    'medium': {
        'size--3': '14px',
        'size--4': '17px'
    },
    'large': {
        'size--3': '15px',
        'size--4': '18px'
    }
}

export class FlashingPriceHeader extends React.Component {
    constructor() {
        super();
        this.priceObjOld = {};
        this.startPaint = true;
    }
    shouldComponentUpdate() {
        return false
    }

    triggerPrice = (nextProps) => {
        if (this.props.priceObj[this.props.field] !== this.priceObjOld[this.props.field]) {
            this.startPaint = true;
            this.start = new Date().getTime();
            if (this.props.symbolObj && this.props.symbolObj.symbol !== this.symbolOld) {
                this.symbolOld = this.props.symbolObj.symbol
                this.priceObjOld = {}
            }
            if (nextProps.priceObj[this.props.field] === '--' || !nextProps.priceObj[this.props.field]) this.color = this.style.getPropertyValue('--secondary-light')
            else {
                const isDown = this.props.field === 'trade_price' ? this.color = nextProps.priceObj[this.props.field] < this.priceObjOld[this.props.field] : this.props.priceObj[this.props.field] < 0
                this.color = isDown ? this.style.getPropertyValue('--sell-light') : this.style.getPropertyValue('--buy-light')
            }
            this.priceObjOld = { ...this.props.priceObj }
        }
    }

    paint = () => {
        this.style = getComputedStyle(document.body);
        this.triggerPrice(this.props)
        if (this.startPaint) {
            const ctx = this.canvasRef.getContext('2d');
            let txt
            if (this.props.field === 'change_percent') txt = '(' + formatNumberValue(this.props.priceObj[this.props.field], true) + '%)'
            else txt = formatNumberPrice(this.props.priceObj[this.props.field], true)
            this.txt = txt
            const fontSize = (FONT_SIZE[dataStorage.fontSize][this.props.size] || '17px') + ' Roboto, sans-serif'
            ctx.font = fontSize
            const scale = window.devicePixelRatio
            const textWidth = ctx.measureText(txt).width + 8
            const textHeight = parseInt(fontSize)
            this.canvasRef.style.width = textWidth + 'px'
            this.canvasRef.style.height = textHeight + 'px';
            this.canvasRef.width = Math.floor(textWidth * scale)
            this.canvasRef.height = Math.floor(textHeight * scale)
            ctx.scale(scale, scale);
            ctx.font = fontSize
            ctx.clearRect(0, 0, this.canvasRef.width, this.canvasRef.height);
            ctx.fillStyle = this.color || this.style.getPropertyValue('--secondary-default')
            if (this.props.field === 'trade_price') {
                const now = new Date().getTime();
                if (this.start && now - this.start < 320) {
                    const alpha = (300 - now + this.start) / 300;
                    ctx.globalAlpha = alpha < 0 ? 0 : alpha;
                    ctx.fillRect(0, 0, this.canvasRef.width, this.canvasRef.height);
                    if (ctx.globalAlpha) ctx.fillStyle = this.style.getPropertyValue('--secondary-default');
                    ctx.globalAlpha = 1;
                } else this.startPaint = false;
            } else this.startPaint = false;
            ctx.textBaseline = 'top'
            ctx.fillText(txt, 0, 2);
        }
        window.requestAnimationFrame(this.paint)
    }

    showTooltip = (e) => {
        const rect = e.target.getBoundingClientRect();
        showTooltip(this.txt, e.screenX + 10, rect.y + 10);
    }

    componentDidMount() {
        window.requestAnimationFrame(this.paint)
    }

    componentWillUnmount() {
        try {
            window.cancelAnimationFrame(this.paint)
        } catch (error) {
            logger.error('componentWillUnmount' + error)
        }
    }

    render() {
        return (
            <canvas
                width={0} height={0}
                className='myCanvas'
                ref={dom => this.canvasRef = dom}
                onMouseMove={
                    this.showTooltip
                }
                onMouseLeave={() => hideTooltip()}
            />
        )
    }
}

export default FlashingPriceHeader;
