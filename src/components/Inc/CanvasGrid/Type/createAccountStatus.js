import dataStorage from '../../../../dataStorage';
import { drawCreatingAccount, drawEkycInProgress, drawCloseCircle } from '../helper/draw';
import { truncateText, showTooltip, hideTooltip } from '../helper/func';

export function size(params) {
    try {
        let text = 'CREATING';
        if (params.value === 'SUCCESS') {
            text = 'EKYC IN PROGRESS';
        } else if (params.value === 'FAILED') {
            text = 'CREATE FAILED';
        }
        params.gc.font = params.font || '13px Roboto, sans-serif';
        return Math.max(params.gc.measureText(text).width + 56, 60);
    } catch (error) {
        console.error('accountStatus - size error: ', error)
    }
}

export default function (params) {
    try {
        const { gc, config, style, value } = params
        if (params.data && params.data._provider) return
        const b = config.bounds
        let text = 'CREATING';
        let draw = drawCreatingAccount;
        let color = style.getPropertyValue('--secondary-dark');
        if (value === 'SUCCESS') {
            text = 'EKYC IN PROGRESS';
            draw = drawEkycInProgress;
        } else if (value === 'FAILED') {
            text = 'CREATE FAILED';
            draw = drawCloseCircle;
            color = style.getPropertyValue('--semantic-danger');
        }

        text = truncateText(params, text, b.width - 32 - 16);
        gc.textBaseline = 'middle'
        const yText = Math.ceil(b.height / 2) + b.y + 0.5;

        const wIcon = 16
        const hIcon = 16
        gc.font = params.font
        const wText = gc.measureText(text).width
        const padding = 8
        const wContent = wIcon + padding + wText
        gc.fillStyle = color
        gc.fillRect(b.x + 8 + 0.5, b.y + 4, b.width - 16, b.height - 8)
        gc.fillStyle = params.rowTextStyle
        const xIcon = b.x + 8 + (b.width - wContent - 16) / 2 + 0.5
        draw(params, xIcon, b.y + (b.height - hIcon) / 2 - 0.5, wIcon, hIcon);
        gc.fillText(text, xIcon + wIcon + padding, yText)
    } catch (error) {
        console.error('accountStatus - default function error: ', error)
    }
}
