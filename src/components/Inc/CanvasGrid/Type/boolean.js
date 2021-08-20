import { drawCheck, drawCheckbox, drawCheckboxEmpty } from '../helper/draw';
export function size(params) {
    return 40;
}

const objMap = {
    true: 'enable',
    false: 'disable'
}

export default function (params) {
    const { gc, config, isEditMode, value, grid, setValue, style, colDef } = params;
    if (params.data && params.data._provider) return
    gc.beginPath();
    const b = config.bounds;
    const height = 18;
    const width = 18;
    const xImg = b.x + 8 + 0.5;
    const yImg = b.y + Math.round((b.height - height) / 2) + 0.5;
    const disable = isEditMode && colDef.disable
    gc.fillStyle = disable ? style.getPropertyValue('--hover-default') : params.rowTextStyle
    if (isEditMode) value ? drawCheckbox(params, xImg, yImg, width, height) : drawCheckboxEmpty(params, xImg, yImg, width, height);
    else if (value) drawCheck(params, xImg, yImg, width, height);
    gc.closePath();
    return {
        click: e => {
            if (!isEditMode) return;
            if (colDef.stringValue) {
                setValue(objMap[!value])
            } else {
                setValue(!value);
            }
            grid.repaint();
        },
        mouseMove: e => {
            if (disable) grid.div.style.cursor = 'not-allowed';
            else grid.div.style.cursor = 'pointer'
        }
    }
}
