import { truncateText, showTooltip, hideTooltip, pointInPath } from '../helper/func';
import { drawInformationOutline, drawCheckCircle, drawLoad } from '../helper/draw';
import dataStorage from '../../../../dataStorage'

export function size(params) {
    params.gc.font = params.font || '13px Roboto, sans-serif';
    return params.gc.measureText(params.displayValue).width + 16;
}

export default function (params) {
    const { gc, config, style, grid, displayValue, colDef, isFirst } = params
    if (params.data && params.data._provider) return
    const b = config.bounds
    let backgroundColor = (typeof params.colDef.getBackgroundColorKey === 'function' && params.colDef.getBackgroundColorKey(params)) || params.config.backgroundColor;
    if (params.rowHover) backgroundColor = style.getPropertyValue('--menu-background-hover');
    if (params.rowSelected) backgroundColor = style.getPropertyValue('--ascend-dark')
    gc.fillStyle = backgroundColor;
    gc.fillRect(b.x, b.y, b.width, b.height)
    let iconPos = {};
    gc.textBaseline = 'middle'
    let x = b.x + 8 + 0.5;
    const y = Math.ceil(b.height / 2) + b.y + 0.5;

    if (params.data.response) {
        if (params.data.response === 'error') {
            gc.fillStyle = style.getPropertyValue('--semantic-danger')
            drawInformationOutline(params, x, y - 12, 24, 24)
        } else if (params.data.response === 'processing') {
            gc.fillStyle = style.getPropertyValue('--semantic-info')
            drawLoad(params, x, y - 12, 24, 24)
        } else {
            gc.fillStyle = style.getPropertyValue('--semantic-success')
            drawCheckCircle(params, x, y - 12, 24, 24)
        }
        iconPos = { x, y: y - 12, w: 24, h: 24 }
        x += 32
    }
    gc.font = params.font;
    if (typeof colDef.getTextColorKey === 'function') {
        gc.fillStyle = style.getPropertyValue(colDef.getTextColorKey(params)) || params.rowTextStyle;
    } else gc.fillStyle = params.rowTextStyle;
    const text = truncateText(params, displayValue, b.width - 16);
    gc.fillText(text, x, y);
    gc.closePath();
    return {
        click: (e) => { },
        mouseMove: e => {
            let stringDetailError = '';
            const p = e.detail.gridPoint;
            if (params.data.errorDetail && pointInPath(p, iconPos)) {
                if (params.data.errorDetail.length && Array.isArray(params.data.errorDetail)) {
                    for (let index = 0; index < params.data.errorDetail.length; index++) {
                        const element = params.data.errorDetail[index];
                        stringDetailError += `<div class='detailError'><span class='errorIcon'>!</span><span class='errorText'>${dataStorage.translate(`error_code_${element}`)}</span></div> \n`;
                    }
                } else {
                    stringDetailError += `<div class='detailError'><span class='errorIcon'>!</span><span class='errorText'>${dataStorage.translate(`error_code_${params.data.errorDetail}`)}</span></div> \n`;
                }
                const rect = grid.div.getBoundingClientRect();
                showTooltip(stringDetailError, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
            } else {
                const rect = grid.div.getBoundingClientRect();
                showTooltip(params.displayValue, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
            }
        },
        mouseLeave: e => {
            hideTooltip();
        }
    }
}
