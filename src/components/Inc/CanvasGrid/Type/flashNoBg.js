import { truncateText, showTooltip, hideTooltip } from '../helper/func';
export function size(params) {
    params.gc.font = params.font || '13px Roboto, sans-serif';
    return params.gc.measureText(params.displayValue).width + 16;
}

function toDisplayValue(params) {
    if (typeof params.colDef.formater === 'function') return params.colDef.formater(params)
    return (params.value === 0 || params.value ? params.value : '--')
}

export default function (params) {
    const { gc, config, style, grid, displayValue, colDef, isFirst } = params
    if (params.data && params.data._provider) return
    const b = config.bounds
    function draw(newValue) {
        const display = newValue || displayValue
        gc.fillStyle = params.rowStyle;
        gc.fillRect(b.x, b.y, b.width, b.height);
        if (typeof colDef.getTextColorKey === 'function') {
            gc.fillStyle = style.getPropertyValue(colDef.getTextColorKey(params)) || params.rowTextStyle;
        } else gc.fillStyle = params.rowTextStyle;
        gc.textBaseline = 'middle'
        let x = b.x + 8 + 0.5;
        if (!isFirst) {
            if (colDef.align === 'right' || params.isLast) {
                x = b.x + b.width - 10 + 0.5;
                gc.textAlign = 'right';
            } else if (colDef.align === 'center') {
                x = Math.ceil(b.width / 2) + b.x + 0.5;
                gc.textAlign = 'center';
            }
        }
        const y = Math.ceil(b.height / 2) + b.y + 0.5;
        gc.font = params.font;
        const text = truncateText(params, display, b.width - 16);
        gc.fillText(text, x, y);
        gc.closePath();
    }
    draw();
    return {
        frame: now => {
            params.value = params.data[params.name]
            params.displayValue = toDisplayValue(params)
            if (params.value !== params.valueOld) {
                params.valueOld = params.value;
                draw(params.displayValue);
            }
        },
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
