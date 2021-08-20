import { truncateText, showTooltip, hideTooltip } from '../helper/func';
import { AddImg, CheckDefaultImg, CheckGreenImg, ErrorImg, SpinnerImg } from '../Constant/image';
import { renderClass } from '../../../../helper/functionUtils';
import dataStorage from '../../../../dataStorage';
import { postData, getUrlAccountCqg } from '../../../../helper/request';

export function size(params) {
    params.gc.font = params.font;
    return params.gc.measureText(params.displayValue).width + 26;
}

const getImg = (params) => {
    const status = params.status
    if (status === 'inactive') return 'common/close-red.svg'
    switch (params.cqg_account_status) {
        case 'EMPTY':
            return AddImg
        case 'CREATING':
        case 'CONFIGURING':
            return SpinnerImg
        case 'NOT_CREATED':
        case 'NOT_CONFIGURED':
            return ErrorImg
        case 'LOADING_COMPLETED':
            return CheckDefaultImg
        case 'COMPLETED':
            if (status === 'active') {
                return CheckGreenImg
            }
            break;
        default:
            break;
    }
}
const getTextbutton = (params) => {
    if (params.status === 'inactive' && params.cqg_account_status !== 'COMPLETED') return ''
    let text = ''
    switch (params.cqg_account_status) {
        case 'EMPTY':
            text = 'Create'
            break;
        case 'CREATING':
            text = 'lang_creating'
            break;
        case 'NOT_CREATED':
        case 'NOT_CONFIGURED':
            text = 'lang_retry'
            break;
        case 'CONFIGURING':
            text = 'lang_configuring'
            break;
        case 'LOADING_COMPLETED':
            text = 'lang_completed'
            break;
        case 'COMPLETED':
            return params.cqg_account_id
        default:
            break;
    }
    return (dataStorage.translate(text) + '').toUpperCase();
}

const drawCompletedBtn = (gc, b, dataRow) => {
    let img = getImg(dataRow);
    let text = getTextbutton(dataRow)
    let textDisplay = truncateText({ gc }, text, b.width - 40);
    let textWidth = gc.getTextWidth(textDisplay)
    let x = b.x + b.width - textWidth - 8;
    let y = Math.ceil(b.height / 2) + b.y + 0.5;
    gc.beginPath();
    gc.fillStyle = '#ffffff'
    gc.fillText(textDisplay, x, y)
    gc.drawImage(img, x - 32, b.y + 4, 20, 20)
    gc.closePath();
}

const drawClickBtn = (gc, b, dataRow, style) => {
    let img = getImg(dataRow);
    let text = getTextbutton(dataRow);
    let textDisplay = truncateText({ gc }, text, b.width - 40);
    let textWidth = gc.getTextWidth(textDisplay);
    let textHeight = gc.getTextHeight().height;
    const y = Math.ceil(b.height / 2) + b.y + 0.5;
    let className = renderClass(dataRow.cqg_account_status);
    let bgColor = style.getPropertyValue(className);
    gc.beginPath();
    gc.save();
    gc.fillStyle = bgColor;
    gc.fillRect(b.x + b.width - textWidth - 36, y - textHeight / 2 - 3, textWidth + 40, textHeight + 5);
    gc.restore();
    gc.fillStyle = '#ffffff'
    gc.fillText(textDisplay, b.x + b.width - textWidth - 8, y);
    gc.drawImage(img, b.x + b.width - textWidth - 32, b.y + 8, 15, 15)
    gc.closePath();
}
const cqgAction = (params) => {
    const type = params.data.cqg_account_status
    if (type === 'EMPTY' || type === 'NOT_CREATED' || type === 'NOT_CONFIGURED') {
        setTimeout(() => {
            params.data.cqg_account_status = type === 'EMPTY' ? 'NOT_CREATED' : type
            params.grid.repaint()
        }, 20000);
        let url = getUrlAccountCqg(`create_and_config`)
        if (type === 'NOT_CONFIGURED') {
            url = getUrlAccountCqg(`retry_config`)
        }
        const dataBody = {
            data: {
                account_id: params.data.account_id
            }
        }
        params.data.cqg_account_status = type === 'NOT_CONFIGURED' ? 'CONFIGURING' : 'CREATING'
        postData(url, dataBody).then((e) => {
            // if (this.timeoutID[params.data.account_id]) clearTimeout(this.timeoutID[params.data.account_id])
        }).catch((e) => {
            params.data.errorMessage = (e.response && e.response.errorMessage)
            params.data.errorCode = (e.response && e.response.errorCode) || ''
            params.data.cqg_account_status = type === 'EMPTY' ? 'NOT_CREATED' : type
            if (this.timeoutID[params.data.account_id]) clearTimeout(this.timeoutID[params.data.account_id])
            params.grid.repaint()
        })
    }
}

export default function (params) {
    const { gc, config, style, grid, colDef, displayValue } = params
    if (params.data && params.data._provider) return
    const data = config.dataRow[config.field]
    const b = config.bounds
    gc.font = theme.font || '13px Roboto, sans-serif';
    if (data !== 'COMPLETED' && config.dataRow.status === 'active') {
        drawClickBtn(gc, b, config.dataRow, style)
    } else {
        drawCompletedBtn(gc, b, config.dataRow)
    }

    return {
        click: (e) => {
            if (data !== 'COMPLETED' && params.data.status === 'active') {
                cqgAction(params)
            }
        },
        mouseMove: e => {
            const rect = grid.div.getBoundingClientRect();
            let textBtn = getTextbutton(config.dataRow)
            showTooltip(textBtn, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
        },
        mouseLeave: e => {
            hideTooltip();
        }
    }
}
