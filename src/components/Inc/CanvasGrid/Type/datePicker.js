import { drawCalendar } from '../helper/draw';
import { truncateText, showTooltip, hideTooltip } from '../helper/func';
import { getDatePickerContent } from '../../../../helper/functionUtils';
import moment from 'moment';
import dataStorage from '../../../../dataStorage'
import DatePicker from 'react-datepicker';

export function size(params = {}) {
    const { gc, isEditMode, value, colDef } = params;
    const dateFormat = !value || value === '--' ? '--' : moment(value).format(colDef.dateFormat);
    gc.font = params.font;
    return Math.max(params.gc.measureText(dateFormat).width + (isEditMode ? 48 : 0), 150);
}

function onSelect(d, params) {
    params.setValue(+new Date(d))
    params.grid.repaint();
}

export default function (params) {
    if (params.data && params.data._provider) return
    const { gc, config, isEditMode, value, grid, setValue, style, colDef } = params;
    const dateFormat = !value || value === '--' ? '--' : moment(value).format(colDef.dateFormat);
    gc.beginPath();
    const b = config.bounds;
    gc.fillStyle = params.rowTextStyle;
    if (isEditMode) {
        gc.strokeStyle = style.getPropertyValue('--border') || '#3d3f48';
        gc.strokeRect(b.x + 8 + 0.5, b.y + 4 + 0.5, b.width - 16, b.height - 8); // plus 0.5 to fix blurry
        const height = 18;
        const width = 18;
        const xImg = b.x + 11 + 0.5;
        const yImg = b.y + Math.round((b.height - height) / 2) + 0.5;
        drawCalendar(params, xImg, yImg, width, height)
        gc.moveTo(b.x + 8 + 0.5 + 24, b.y + 4 + 0.5);
        gc.lineTo(b.x + 8 + 0.5 + 24, b.y + b.height - 4);
        gc.stroke()
        gc.textBaseline = 'middle'
        const x = b.x + 8 + 0.5 + 24 + 8;
        const y = Math.ceil(b.height / 2) + b.y + 0.5;
        gc.font = params.font;
        const text = truncateText(params, dateFormat, b.width - 16);
        gc.fillText(text, x, y);
    } else {
        gc.textBaseline = 'middle'
        const x = b.x + 8 + 0.5;
        const y = Math.ceil(b.height / 2) + b.y + 0.5;
        gc.font = params.font;
        const text = truncateText(params, dateFormat, b.width - 16);
        gc.fillText(text, x, y);
    }
    gc.closePath();
    const rect = grid.div.getBoundingClientRect();
    return {
        click: e => {
            if (!isEditMode) return
            const div = getDatePickerContent();
            const label = document.createElement('label');
            label.style.zIndex = 100;
            label.style.position = 'absolute';
            ReactDOM.render(<DatePicker onSelect={d => {
                div.removeChild(label)
                onSelect(d, params)
            }} />, label, () => {
            })
            div.appendChild(label);
            const top = rect.top + b.y + b.height - 22;
            label.style.top = top + 'px';
            const left = rect.left + b.x + 8;
            label.style.left = left + 'px';
            label.click()
        },
        mouseMove: e => {
            showTooltip(dateFormat, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
        },
        mouseLeave: e => {
            hideTooltip();
        }
    }
}
