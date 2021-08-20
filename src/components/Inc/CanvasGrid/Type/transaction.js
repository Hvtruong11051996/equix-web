import { truncateText, showTooltip, hideTooltip } from '../helper/func';
import { drawArrowUp, drawArrowDown, drawFlag } from '../helper/draw';
import moment from 'moment-timezone';
export function size(params) {
    params.gc.font = params.font || '13px Roboto, sans-serif';
    return params.gc.measureText(moment(params.data.trade_date).format('DD MMM YYYY HH:mm:ss')).width + 48;
}
export default function (params) {
    const { gc, config, style, grid, colDef } = params
    if (params.data && params.data._provider) return
    const b = config.bounds
    const width = b.width - 32;
    gc.fillStyle = params.data.is_buy ? style.getPropertyValue('--buy-light') : style.getPropertyValue('--sell-light');
    if (params.data.sod) {
        drawFlag(params, b.x + 8, b.y + 4, 24, 24);
    } else {
        params.data.is_buy
            ? drawArrowUp(params, b.x + 8, b.y + 4, 24, 24)
            : drawArrowDown(params, b.x + 8, b.y + 4, 24, 24)
    }
    gc.fillStyle = params.rowTextStyle;
    gc.textBaseline = 'middle';
    let x = b.x + 32 + 8 + 0.5;
    if (colDef.align === 'right') {
        x = b.x + 32 + width - 8 + 0.5;
        gc.textAlign = 'right';
    } else if (colDef.align === 'center') {
        x = Math.ceil(width / 2) + b.x + 32 + 0.5;
        gc.textAlign = 'center';
    }
    const y = Math.ceil(b.height / 2) + b.y + 0.5;
    gc.font = params.font;
    const displayValue = moment(params.data.trade_date).format('DD MMM YYYY HH:mm:ss');
    const text = truncateText(params, displayValue, width - 16);
    gc.fillText(text, x, y);
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
