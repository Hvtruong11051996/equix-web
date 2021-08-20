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

export default function (params) {
    const { gc, config, style, grid, colDef, displayValue } = params
    if (params.data && params.data._provider) return
    const b = config.bounds
    const x = b.x + 8 + 0.5;
    const y = Math.ceil(b.height / 2) + b.y + 0.5;
    gc.font = params.font;
    const originText = (displayValue + '').toUpperCase()
    const text = truncateText(params, originText, b.width - 16);
    let textHeight = gc.getTextHeight().height;
    let textWidth = gc.getTextWidth(text)
    let bgColor = typeof params.colDef.getBackgroundColorKey === 'function' && style.getPropertyValue(params.colDef.getBackgroundColorKey(params));
    if (!bgColor) bgColor = params.rowStyle
    let bgBound
    if (colDef.fullWidth && !params.group) {
        bgBound = {
            x: b.x + 8,
            y: b.y + 4,
            w: b.width - 16,
            h: b.height - 8
        }
    } else {
        bgBound = {
            x: x - 6,
            y: y - textHeight / 2 - 3,
            w: textWidth + 12,
            h: textHeight + 5
        }
    }
    drawBg(gc, bgBound, bgColor);

    gc.beginPath()
    gc.fillStyle = '#ffffff';
    gc.textBaseline = 'middle'
    if (colDef.fullWidth && !params.group) gc.fillText(text, b.x + ((b.width - textWidth) / 2), y);
    else gc.fillText(text, x, y);
    gc.closePath();
    return {
        mouseMove: e => {
            // if (text.length === displayValue.length) return;
            const rect = grid.div.getBoundingClientRect();
            showTooltip(params.displayValue, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
        },
        mouseLeave: e => {
            hideTooltip();
        }
    }
}
