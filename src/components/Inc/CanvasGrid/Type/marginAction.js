import { truncateText, showTooltip, hideTooltip } from '../helper/func';
import enumColor from '../../../../constants/enumColor';
export function size(params) {
    params.gc.font = params.font || '13px Roboto, sans-serif';
    return params.gc.measureText(params.displayValue).width + 28;
}
export default function (params) {
    const { gc, config, style, grid, displayValue, colDef, isFirst } = params
    if (params.data && params.data._provider) return
    const b = config.bounds
    gc.textBaseline = 'middle'
    let x = b.x + 8 + 0.5;
    gc.font = params.font;
    gc.fillStyle = params.rowTextStyle;
    if (params.data.actions === 'Risk Management' || params.data.actions === 'Pre-Trade Vetting' || params.data.actions === 'Notifications' || params.data.actions === 'Language') {
        gc.font = `${style.getPropertyValue('--size-5')} Roboto, sans-serif`
    } else {
        gc.font = `${style.getPropertyValue('--size-4')} Roboto, sans-serif`
        x += 12;
    }

    const y = Math.ceil(b.height / 2) + b.y + 0.5;
    let text = `${displayValue}`
    gc.fillText(text, x, y);

    gc.closePath();
    return {
        click: (e) => { },
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
