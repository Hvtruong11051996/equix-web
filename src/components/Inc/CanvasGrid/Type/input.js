import s from '../CanvasGrid.module.css';
import { showTooltip, truncateText, hideTooltip } from '../helper/func';
import dataStorage from '../../../../dataStorage'

export function size(params) {
    params.gc.font = params.font || '13px Roboto, sans-serif';
    return params.gc.measureText(params.value).width + 16;
}
export default function (params) {
    const { gc, config, style, data, name, displayValue, value, isEditMode, grid, gridId, position, setValue, colDef } = params
    if (params.data && params.data._provider) return
    const b = config.bounds
    gc.fillStyle = params.rowTextStyle;
    gc.textBaseline = 'middle'
    // gc.textAlign = 'right'
    const x = b.x + 8;
    const y = Math.ceil(b.height / 2) + b.y;
    gc.font = params.font;
    const id = 'input_' + gridId + '_' + position;
    let input = grid.div.querySelector('#' + id);
    if (isEditMode) {
        const disable = isEditMode && colDef.disable
        if (!input) {
            input = document.createElement('input');
            input.id = id;
            input.value = displayValue || '';
            input.style.zIndex = 100;
            input.style.position = 'absolute';
            input.className = s.input;
            input.maxLength = 255;
            input.title = colDef.tooltipInput ? dataStorage.translate(colDef.tooltipInput) : ''
            input.oninput = () => {
                if (colDef.min !== null && colDef.min !== undefined) {
                    if (!isNaN(+input.value)) {
                        input.value = +input.value >= colDef.min ? +input.value : colDef.min
                    } else {
                        input.value = colDef.min
                    }
                }
                setValue(input.value || '')
            }
            grid.div.appendChild(input);
        }
        if (disable) {
            input.style.cursor = 'not-allowed'
            input.style.opacity = 0.5
        }
        if (colDef.inputAlign === 'right') {
            input.style.textAlign = 'right'
        }
        input.style.transform = `translate(${b.x + 4}px, ${b.y + 4}px)`;
        input.style.width = (b.width - 8) + 'px';
    } else {
        if (input) input.parentNode.removeChild(input);
        let textValue = truncateText(params, displayValue, b.width - 10)
        gc.fillText(textValue || '', x, y);
    }
    gc.closePath();
    return {
        mouseMove: (e) => {
            if (isEditMode) return;
            const rect = grid.div.getBoundingClientRect();
            if (value || value === 0) showTooltip(value, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
            else hideTooltip()
        },
        inVisible: (e) => {
            if (input) input.parentNode.removeChild(input);
        },
        mouseLeave: e => {
            hideTooltip();
        }
    }
}
