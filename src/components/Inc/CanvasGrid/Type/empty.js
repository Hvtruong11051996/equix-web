import { truncateText, showTooltip, hideTooltip } from '../helper/func';
export function size(params) {
    params.gc.font = params.font || '13px Roboto, sans-serif';
    return params.gc.measureText(params.displayValue).width + 16;
}
export default function (params) {
    const { gc, config, style, grid, displayValue, colDef, isFirst } = params
    if (params.data && params.data._provider) return
    const b = config.bounds
    if (typeof colDef.getTextColorKey === 'function') {
        gc.fillStyle = style.getPropertyValue(colDef.getTextColorKey(params)) || params.rowTextStyle;
    } else gc.fillStyle = params.rowTextStyle;
    gc.textBaseline = 'middle'
    let x = b.x + 8 + 0.5;

    // all text align is left EQ-4120
    // if (!isFirst) {
    //     if (colDef.align === 'right' || params.isLast) {
    //         x = b.x + b.width - 10 + 0.5;
    //         gc.textAlign = 'right';
    //     } else if (colDef.align === 'center') {
    //         x = Math.ceil(b.width / 2) + b.x + 0.5;
    //         gc.textAlign = 'center';
    //     }
    // }
    const y = Math.ceil(b.height / 2) + b.y + 0.5;
    gc.font = params.font;
    const text = ''
    gc.fillText(text, x, y);
    gc.closePath();
    return {
        click: (e) => { },
        mouseMove: e => {
        },
        mouseLeave: e => {
            hideTooltip();
        }
    }
}
