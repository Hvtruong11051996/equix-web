import { truncateText, showTooltip, hideTooltip } from '../helper/func';
import { drawCheck, drawCheckbox, drawCheckboxEmpty } from '../helper/draw';
export function size(params) {
    const { isEditMode, displayValue, gc } = params;
    if (isEditMode) return gc.getTextWidth(displayValue) + 45
    return gc.getTextWidth(displayValue) + 30
}
export default function (params) {
    const { gc, config, isEditMode, grid, colDef, style, displayValue, dicLabelClick } = params;
    if (params.data && params.data._provider) return
    gc.beginPath();
    const b = config.bounds;
    const height = 18;
    const width = 18;
    const xImg = b.x + 8 + 0.5;
    const yImg = b.y + Math.round((b.height - height) / 2) + 0.5;
    if (typeof colDef.getTextColorKey === 'function') {
        gc.fillStyle = style.getPropertyValue(colDef.getTextColorKey(params)) || params.rowTextStyle;
    } else gc.fillStyle = params.rowTextStyle;

    if (isEditMode) {
        if (dicLabelClick[displayValue]) drawCheckbox(params, xImg, yImg, width, height)
        else drawCheckboxEmpty(params, xImg, yImg, width, height);
        gc.textBaseline = 'middle'
        let x = width + xImg + 5
        if (colDef.align === 'right' || params.isLast) {
            x = b.x + b.width - 8 + 0.5;
            gc.textAlign = 'right';
        } else if (colDef.align === 'center') {
            x = Math.ceil(b.width / 2) + b.x + 0.5;
            gc.textAlign = 'center';
        }
        const y = Math.ceil(b.height / 2) + b.y + 0.5;
        gc.font = params.font;
        const text = truncateText(params, displayValue, b.width - 16);
        gc.fillText(text, x, y);
        gc.closePath();
    } else {
        gc.textBaseline = 'middle'
        let x = b.x + 8 + 0.5;
        if (colDef.align === 'right' || params.isLast) {
            x = b.x + b.width - 8 + 0.5;
            gc.textAlign = 'right';
        } else if (colDef.align === 'center') {
            x = Math.ceil(b.width / 2) + b.x + 0.5;
            gc.textAlign = 'center';
        }
        const y = Math.ceil(b.height / 2) + b.y + 0.5;
        gc.font = params.font;
        const text = truncateText(params, displayValue, b.width - 16);
        gc.fillText(text, x, y);
        gc.closePath();
    }
    return {
        click: e => {
            if (!isEditMode) return;
            if (!dicLabelClick[params.data.user_id]) dicLabelClick[params.data.user_id] = displayValue;
            else delete dicLabelClick[params.data.user_id]
            grid.repaint();
        }
    }
}
