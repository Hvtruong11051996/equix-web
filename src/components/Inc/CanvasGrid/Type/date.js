import { truncateText, showTooltip, hideTooltip } from '../helper/func';
import moment from 'moment';

export function size(params) {
    const dateFormat = moment(params.value).format(params.colDef.dateFormat);
    params.gc.font = params.font;
    return params.gc.measureText(dateFormat).width + 26;
}
export default function (params) {
    const { gc, config, style, grid, value, colDef } = params
    if (params.data && params.data._provider) return
    const dateFormat = !value || value === '--' ? '--' : moment(Number(value)).format(colDef.dateFormat);
    const b = config.bounds
    gc.fillStyle = params.rowTextStyle;
    gc.textBaseline = 'middle'
    // gc.textAlign = 'right'
    const x = b.x + 8 + 0.5;
    const y = Math.ceil(b.height / 2) + b.y + 0.5;
    gc.font = params.font;
    const text = truncateText(params, dateFormat, b.width - 16);
    gc.fillText(text, x, y);
    gc.closePath();
    return {
        mouseMove: e => {
            // if (text.length === dateFormat.length) return;
            const rect = grid.div.getBoundingClientRect();
            showTooltip(dateFormat, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
        },
        mouseLeave: e => {
            hideTooltip();
        }
    }
}
