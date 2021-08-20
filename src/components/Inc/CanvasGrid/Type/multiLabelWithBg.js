import { truncateText, showTooltip, hideTooltip } from '../helper/func';
export function size(params) {
    params.gc.font = params.font || '13px Roboto, sans-serif';
    return params.gc.measureText(params.displayValue).width + 26;
}

const drawBg = (gc, b, color) => {
    gc.beginPath();
    gc.fillStyle = color;
    gc.fillRect(b.x, b.y, b.w, b.h)
    gc.closePath();
}

const objClassBg = {
    advisor_code: '--ascend-default',
    branch_code: '--background-orange',
    list_mapping: '--background-tag-retail',
    organisation_code: '--background-green',
    tag: '--background-news-tag',
    type: '--background-news-type',
    sign: '--background-news-sign'
}

export default function (params) {
    const { gc, config, style, grid, colDef, displayValue, value } = params
    if (params.data && params.data._provider) return
    const b = config.bounds
    gc.font = params.font;
    let x = b.x + 8 + 0.5;
    const y = Math.ceil(b.height / 2) + b.y + 0.5;
    if (typeof value === 'object') {
        Object.keys(value).map((item, index) => {
            if (value[item]) {
                let bgColor = style.getPropertyValue(objClassBg[item]);
                const dataArr = value[item].split(',')
                dataArr.forEach((val, i) => {
                    const originText = (val + '').toUpperCase()
                    const text = truncateText(params, originText, b.width - 16);
                    let textHeight = gc.getTextHeight().height;
                    let textWidth = gc.getTextWidth(text)
                    let bgBound = {
                        x: x - 6,
                        y: y - textHeight / 2 - 3,
                        w: textWidth + 12,
                        h: textHeight + 5
                    }
                    drawBg(gc, bgBound, bgColor);
                    gc.beginPath()
                    gc.fillStyle = '#ffffff';
                    gc.textBaseline = 'middle'
                    // gc.textAlign = 'right'

                    gc.fillText(text, x, y);
                    gc.closePath();
                    x += bgBound.w + 5
                })
            }
        })
    }

    return {
        mouseMove: e => {
            // if (text.length === displayValue.length) return;
            const rect = grid.div.getBoundingClientRect();
            let display = ''
            if (typeof params.displayValue === 'object') {
                display = Object.values(params.displayValue).filter(e => e).join(', ')
            }
            showTooltip(display, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
        },
        mouseLeave: e => {
            hideTooltip();
        }
    }
}
