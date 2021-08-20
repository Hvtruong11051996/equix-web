import { drawSquareCheckbox, drawUncheckSquare } from '../helper/draw';
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
    const height = 24;
    const width = 24;
    const xImg = b.x + 8 + 0.5;
    const yImg = b.y + Math.round((b.height - height) / 2) + 0.5;
    if (isEditMode) {
        if (value) {
            gc.fillStyle = style.getPropertyValue('--semantic-info') || '#1d7cad';
            drawSquareCheckbox(params, xImg, yImg, width, height)
        } else {
            gc.fillStyle = style.getPropertyValue('--border') || '#3c3e47';
            drawUncheckSquare(params, xImg, yImg, width, height);
        }
    } else {
        gc.fillStyle = params.rowTextStyle;
        gc.textBaseline = 'middle'
        gc.fillText(value ? 'YES' : 'NO', b.x + 8 + 0.5, b.y + Math.ceil(b.height / 2) + 0.5)
    }
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
        }
    }
}
