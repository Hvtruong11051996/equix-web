import { truncateText, showTooltip, hideTooltip } from '../helper/func';
import { getCountryCode } from '../../Flag';
const dicFlags = {};
export function size(params) {
    params.gc.font = params.font || '13px Roboto, sans-serif';
    return params.gc.measureText(params.displayValue).width + 16 + (getCountryCode(params.data) ? 28 : 0);
}
export default function (params) {
    const { gc, config, style, grid, displayValue, colDef, data } = params
    if (params.data && params.data._provider) return
    const b = config.bounds
    let width = b.width;
    const countryCode = getCountryCode(params.data);
    if (countryCode) {
        width = b.width - 28;
        if (!dicFlags[countryCode]) {
            dicFlags[countryCode] = new Image();
            dicFlags[countryCode].src = 'flag/' + countryCode + '.png';
        }
        gc.drawImage(dicFlags[countryCode], b.x + b.width - 28, b.y + 11, 20, 10);
    }
    gc.fillStyle = params.rowTextStyle;
    gc.textBaseline = 'middle';
    let x = b.x + 8 + 0.5;
    if (colDef.align === 'right') {
        x = b.x + width - 8 + 0.5;
        gc.textAlign = 'right';
    } else if (colDef.align === 'center') {
        x = Math.ceil(width / 2) + b.x + 0.5;
        gc.textAlign = 'center';
    }
    const y = Math.ceil(b.height / 2) + b.y + 0.5;
    gc.font = params.font;
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
