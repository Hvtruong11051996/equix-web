import { drawSwitch, drawSwitchOff } from '../helper/draw';
import { createRequestUpdate } from '../../../../helper/functionUtils'

export function size(params) {
    params.gc.font = params.font || '13px Roboto, sans-serif';
    return params.gc.measureText(params.value).width + 16;
}

export default function (params) {
    const { gc, config, value, grid, setValue, style, colDef } = params;
    if (params.data && params.data._provider) return
    gc.beginPath();
    const b = config.bounds;
    const height = 32;
    const width = 32;
    const xImg = b.x + b.width - width - 8 - 0.5;
    const yImg = b.y + Math.round((b.height - height) / 2) + 0.5;
    const checked = config.dataRow[config.field]
    if (checked) {
        gc.fillStyle = style.getPropertyValue('--buy-light');
        drawSwitch(params, xImg, yImg, width, height)
    } else {
        gc.fillStyle = style.getPropertyValue('--secondary-default')
        drawSwitchOff(params, xImg, yImg, width, height)
    }
    gc.closePath();
    return {
        click: e => {
            createRequestUpdate(params.data, !checked)
        },
        mouseMove: e => {
            grid.div.style.cursor = 'pointer';
        }
    }
}
