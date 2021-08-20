import { pointInPath, showTooltip, hideTooltip, truncateText } from '../helper/func';
import { drawPlayListRemove, drawPalette, drawPen } from '../helper/draw';
import PopupEditor from '../../../Inc/PopupEditor';
import showModal from '../../../Inc/Modal';
import enumColor from '../../../../constants/enumColor';
import { getData, putData, deleteData, getMarginDetailUrl, getMarginLevelUrl, getBranchInfoUrl, getEditLevelUrl, getEditRuleLevelUrl, getEditMarginDetailUrl } from '../../../../helper/request';

export function size(params) {
    params.gc.font = params.font || '13px Roboto, sans-serif';
    return params.gc.measureText(params.displayValue).width + 16;
}
const listBtn = [
    'remove',
    'pen',
    'palette'
]

const checkBtn = (p, objPoint) => {
    let btnName = ''
    for (let val in objPoint) {
        if (pointInPath(p, objPoint[val])) {
            btnName = val;
            break;
        }
    }
    return btnName
}
let btnPosition = {}

const handleEditDes = (des, level, color, params) => {
    const editUrl = getEditLevelUrl(`${level}`);
    const dataBody = {
        data: {
            margin_level: level,
            description: des,
            margin_type: color
        }
    }
    let dataNew = { ...params.data }
    dataNew.description = des
    params.setValue(dataNew)
    params.grid.repaint();
    params.colDef.editMarginLevelCallback && params.colDef.editMarginLevelCallback(editUrl, dataBody)
}

const handleEditColor = (color, level, des, params) => {
    const editUrl = getEditLevelUrl(`${level}`);
    const dataBody = {
        data: {
            margin_level: level,
            description: des,
            margin_type: color
        }
    }
    let dataNew = { ...params.data }
    dataNew.marginType = color
    params.setValue(dataNew)
    params.grid.repaint();
    params.colDef.editMarginLevelCallback && params.colDef.editMarginLevelCallback(editUrl, dataBody)
}
export default function (params) {
    const { gc, config, style, grid, displayValue, colDef, group, isEditMode } = params
    if (params.data && params.data._provider) return
    const b = config.bounds
    if (group) {
        gc.textBaseline = 'middle'
        let x = b.x + 8 + 0.5;

        const y = Math.ceil(b.height / 2) + b.y + 0.5;
        gc.font = `${style.getPropertyValue('--size-5')} Roboto, sans-serif`
        let text = `${displayValue}% MARGIN ${params.data.description ? `(${params.data.description})` : ''}`
        let textEls = truncateText(params, text, b.width - 16)

        if (isEditMode) {
            listBtn.forEach((btn, i) => {
                let w = 26;
                let h = 26;
                let x = b.x + b.width - (32 * i) - 26;
                let y = b.y + 3;
                btnPosition[btn + '|' + displayValue] = { x, y, w, h }
                if (btn === 'remove') {
                    gc.fillStyle = style.getPropertyValue('--border');
                    gc.fillRect(x, y, w, h)
                    gc.fillStyle = style.getPropertyValue('--semantic-danger');
                    gc.fillRect(x + 1, y + 1, w - 2, h - 2)
                    gc.fillStyle = style.getPropertyValue('--secondary-light')
                    drawPlayListRemove(params, x + 8, y + 9, 18, 18)
                } else if (btn === 'pen') {
                    gc.fillStyle = style.getPropertyValue('--border');
                    gc.fillRect(x, y, w, h)
                    gc.fillStyle = style.getPropertyValue('--primary-dark')
                    gc.fillRect(x + 1, y + 1, w - 2, h - 2)
                    gc.fillStyle = style.getPropertyValue('--secondary-light')
                    drawPen(params, x + 2, y + 3, 20, 20)
                } else {
                    gc.fillStyle = style.getPropertyValue('--border');
                    gc.fillRect(x, y, w, h)
                    gc.fillStyle = style.getPropertyValue('--primary-dark')
                    gc.fillRect(x + 1, y + 1, w - 2, h - 2)
                    gc.fillStyle = style.getPropertyValue('--secondary-light')
                    drawPalette(params, x + 2, y + 3, 20, 20)
                }
            })
            textEls = truncateText(params, text, b.width - 112)
        }
        gc.fillStyle = enumColor[params.data.marginType] || params.rowTextStyle;
        gc.fillText(textEls, x, y);
        gc.closePath();
    }
    return {
        click: (e, data) => {
            const p = e.detail.gridPoint;
            let btnClick = checkBtn(p, btnPosition)
            if (btnClick) {
                let splitbtn = btnClick.split('|')
                let btnName = splitbtn[0]
                switch (btnName) {
                    case 'pen':
                        e.preventDefault()
                        showModal({
                            component: PopupEditor,
                            props: {
                                type: 'inputText',
                                placeholder: '...',
                                headerTextFixed: `Description for ${data.displayValue}% Margin`,
                                data: data.data.description,
                                actionName: 'editDesAction',
                                onChange: (dataDes) => handleEditDes(dataDes, data.displayValue, data.data.marginType, data)
                            }
                        })
                        break;
                    case 'remove':
                        e.preventDefault();
                        params.colDef.removeCallback && params.colDef.removeCallback(data.value)
                        break;
                    case 'palette':
                        e.preventDefault()
                        showModal({
                            component: PopupEditor,
                            props: {
                                type: 'chooseColor',
                                headerTextFixed: `Colour for  ${data.displayValue}% Margin`,
                                label: 'lang_margin_colour',
                                options: [
                                    { label: enumColor[0], value: 0 },
                                    { label: enumColor[1], value: 1 },
                                    { label: enumColor[2], value: 2 },
                                    { label: enumColor[3], value: 3 },
                                    { label: enumColor[4], value: 4 },
                                    { label: enumColor[5], value: 5 },
                                    { label: enumColor[6], value: 6 },
                                    { label: enumColor[7], value: 7 },
                                    { label: enumColor[8], value: 8 },
                                    { label: enumColor[9], value: 9 },
                                    { label: enumColor[10], value: 10 },
                                    { label: enumColor[11], value: 11 },
                                    { label: enumColor[12], value: 12 },
                                    { label: enumColor[13], value: 13 },
                                    { label: enumColor[14], value: 14 }
                                ],
                                fixWidth: true,
                                value: data.data.marginType,
                                valueOld: data.data.marginType,
                                onChange: (dataColor) => handleEditColor(dataColor, data.displayValue, data.data.description, data),
                                actionName: 'editMarginType'
                            }
                        })
                        break;
                    default:
                        break;
                }
            }
            return btnClick
        },
        mouseMove: e => {
            // if (text.length === displayValue.length) return;
            const rect = grid.div.getBoundingClientRect();
            showTooltip(params.displayValue, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
        },
        mouseLeave: e => {
            hideTooltip();
        },
        editGroup: true,
        isMargin: true
    }
}
