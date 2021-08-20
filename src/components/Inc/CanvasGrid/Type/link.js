import { truncateText, showTooltip, hideTooltip, pointInPath } from '../helper/func';
import dataStorage from '../../../../dataStorage'
import { drawActiveIcon, drawCloseIcon, drawSearch, drawEkycInProgress } from '../helper/draw';

export function size(params) {
    params.gc.font = params.font || '13px Roboto, sans-serif';
    return params.gc.measureText(params.displayValue).width + 40;
}

const userTypeMap = {
    operation: 'operator',
    retail: 'retail',
    advisor: 'advisor'
}

const documentStatusMap = {
    EKYC_REJECTED: 'EKYC REJECTED',
    EKYC_VERIFIED: 'EKYC VERIFIED',
    EKYC_PENDING: 'EKYC PENDING',
    EQ_IN_PROGRESS_REJECT: 'REJECT IN PROGRESS',
    EQ_IN_PROGRESS_APPROVE: 'APPROVE IN PROGRESS'
}

export default function (params) {
    const { gc, config, style, grid, displayValue, colDef, isFirst } = params
    if (params.data && params.data._provider) return
    const b = config.bounds
    let textPos = {}
    let iconPos = {}
    if (typeof colDef.getTextColorKey === 'function') {
        gc.fillStyle = style.getPropertyValue(colDef.getTextColorKey(params)) || params.rowTextStyle;
    } else gc.fillStyle = params.rowTextStyle;
    gc.textBaseline = 'middle'
    gc.textAlign = 'left';
    let x = b.x + 8 + 0.5;
    const y = Math.ceil(b.height / 2) + b.y + 0.5;
    gc.font = params.font;
    const text = truncateText(params, displayValue, b.width - 16);
    if (!params.group) {
        if (params.data.ekyc_document_status === 'EKYC_REJECTED') {
            gc.fillStyle = style.getPropertyValue('--semantic-danger')
            drawCloseIcon(params, x, y - 7, 16, 16)
        } else if (params.data.ekyc_document_status === 'EKYC_VERIFIED') {
            gc.fillStyle = style.getPropertyValue('--semantic-success')
            drawActiveIcon(params, x, y - 7, 16, 16)
        } else if (params.data.ekyc_document_status === 'EKYC_PENDING') {
            gc.fillStyle = params.rowTextStyle
            drawSearch(params, x, y - 7, 16, 16)
        } else if (params.data.ekyc_document_status === 'EQ_IN_PROGRESS_REJECT' || params.data.ekyc_document_status === 'EQ_IN_PROGRESS_APPROVE') {
            gc.fillStyle = params.rowTextStyle
            drawEkycInProgress(params, x, y - 7, 16, 16)
        }

        gc.fillStyle = style.getPropertyValue('--semantic-info')
        gc.strokeStyle = style.getPropertyValue('--semantic-info')
        gc.moveTo(x + 22, y + gc.getTextHeight(text).height / 2)
        gc.lineTo(x + 22 + gc.getTextWidth(text) + 4, y + gc.getTextHeight(text).height / 2)
        gc.stroke()
    }
    if (params.group) {
        gc.fillText(text, x, y);
    } else {
        gc.fillText(text, x + 24, y);
    }
    iconPos = {
        x,
        y: y - 8,
        w: 16,
        h: 16
    }
    textPos = {
        x,
        y: y - gc.getTextHeight(text).height / 2,
        w: gc.getTextWidth(text) + 26,
        h: gc.getTextHeight(text).height + 5
    }
    gc.closePath();
    return {
        click: (e) => {
            const p = e.detail.gridPoint;
            if (pointInPath(p, textPos)) {
                if (params.data.link) {
                    let link = params.data.link
                    let env = link.split('-')
                    env[1] = userTypeMap[dataStorage.userInfo.user_type]
                    let newLink = env.join('-')
                    const req = new XMLHttpRequest()
                    req.open('GET', newLink)
                    req.responseType = 'blob'
                    req.setRequestHeader('Authorization', 'Bearer ' + dataStorage.accessToken)
                    req.onreadystatechange = () => {
                        if (req.readyState === 4 && req.status === 200) {
                            const fileURL = URL.createObjectURL(req.response);
                            var element = document.createElement('a');
                            element.setAttribute('download', params.data.document_title);
                            element.setAttribute('href', fileURL);
                            element.setAttribute('target', '_blank');
                            element.click();
                        }
                    };
                    req.send();
                }
            }
        },
        mouseMove: e => {
            // if (text.length === displayValue.length) return;
            const rect = grid.div.getBoundingClientRect();
            const p = e.detail.gridPoint;
            if (pointInPath(p, iconPos)) {
                showTooltip(documentStatusMap[params.data.ekyc_document_status], rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
            } else if (pointInPath(p, textPos)) {
                grid.div.style.cursor = 'pointer';
                showTooltip(params.displayValue, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
            } else hideTooltip();
        },
        mouseLeave: e => {
            hideTooltip();
        }
    }
}
