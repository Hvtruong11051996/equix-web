import { truncateText, showTooltip, hideTooltip, pointInPath } from '../helper/func';
import { getCountryCode } from '../../Flag/Flag';
import { drawDragBtn } from '../helper/draw';
const dicFlags = {};
export function size(params) {
    params.gc.font = params.font || '13px Roboto, sans-serif';
    return params.gc.measureText(params.displayValue).width + 60 + (getCountryCode(params.data) ? 28 : 0);
}

let drawIntraday = (gc, data, style, b) => {
    gc.beginPath();
    if (data.intradayNews) gc.fillStyle = style.getPropertyValue('--ascend-default');
    else gc.fillStyle = style.getPropertyValue('--secondary-default');
    gc.font = '12px Roboto';
    gc.fillRect(b.x + b.width - 32, b.y + 9, gc.getTextWidth('A') + 4, 12)
    gc.fillStyle = style.getPropertyValue('--primary-dark');
    gc.fillText('A', b.x + b.width - 30, b.y + b.height / 2)
    gc.closePath();
}

let drawDragButton = (gc, b, x, y, style, params) => {
    let xDrag = b.x + 8 + 0.5;
    let yDrag = y - 8;
    let wDrag = 16;
    let hDrag = 16;
    params.dragBtn = { x: xDrag, y: yDrag, w: wDrag, h: hDrag }
    gc.beginPath();
    gc.fillStyle = style.getPropertyValue('--ascend-default')
    gc.fillRect(b.x + 8 + 0.5, y - 8, 16, 16)
    gc.fillStyle = style.getPropertyValue('--color-white')
    drawDragBtn(params, x, y - 8, 16, 16)
    gc.closePath();
}

export default function (params) {
    const { gc, config, style, grid, displayValue, colDef, data } = params
    if (params.data && params.data._provider) return
    const b = config.bounds
    let width = b.width;
    drawIntraday(gc, data, style, b)
    const countryCode = getCountryCode(params.data);
    if (countryCode) {
        width = b.width - 28;
        if (!dicFlags[countryCode]) {
            dicFlags[countryCode] = new Image();
            dicFlags[countryCode].src = 'flag/' + countryCode + '.png';
        }
        gc.drawImage(dicFlags[countryCode], b.x + b.width - 60, b.y + 11, 20, 10);
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
    let y = Math.ceil(b.height / 2) + b.y + 0.5;
    gc.font = params.font;
    const text = truncateText(params, displayValue, width - 48);
    gc.fillText(text, x, y);
    if (params.rowHover) drawDragButton(gc, b, x, y, style, params)
    gc.closePath();
    return {
        mouseMove: e => {
            // if (text.length === displayValue.length) return;
            const rect = grid.div.getBoundingClientRect();
            showTooltip(params.displayValue, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
            if (params.root.enableDrag && e.detail.gridPoint.y <= 32) {
                params.root.enableDrag = false;
                params.root.hiddenAnimation();
                params.root.props.onRowDragEnd && params.root.props.onRowDragEnd()
            }
        },
        mouseLeave: e => {
            hideTooltip();
            if (params.root.enableDrag && e.detail.gridPoint.y <= 32) {
                params.root.enableDrag = false;
                params.root.hiddenAnimation();
                params.root.props.onRowDragEnd && params.root.props.onRowDragEnd()
            }
        },
        mouseDown: e => {
            if (pointInPath(e.detail.gridPoint, params.dragBtn)) {
                params.root.enableDrag = true;
                params.root.dragIndex = e.detail.dataCell.y
                params.root.dataDrag = params.data
            } else {
                params.root.enableDrag = false;
                params.root.hiddenAnimation();
                params.root.props.onRowDragEnd && params.root.props.onRowDragEnd()
            }
        },
        mouseUp: e => {
            params.root.enableDrag = false;
            params.root.hiddenAnimation();
            params.root.props.onRowDragEnd && params.root.props.onRowDragEnd()
        },
        drag: e => {
            if (params.root.enableDrag) {
                const endIndexOrg = e.detail.mouse.y / 32;
                const endIndex = parseInt(endIndexOrg) > params.root._listData.length ? params.root._listData.length - 1 : parseInt(endIndexOrg) - 1;
                if (params.root.dragIndex !== endIndex) {
                    params.root.changeRowPoisition(params.root.dragIndex, endIndex)
                    params.root.dragIndex = endIndex;
                }
                params.root.createDragAnimation(e, params.root.dataDrag);
            } else {
                params.root.hiddenAnimation();
            }
        }
    }
}
