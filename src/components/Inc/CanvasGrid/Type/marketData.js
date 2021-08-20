// import { drawPath2D } from '../helper/func';
import moment from 'moment';
import { showTooltip, hideTooltip } from '../helper/func';
import { drawCheckCircle, drawCheckPending, drawCheckbox, drawCheckboxEmpty } from '../helper/draw';
import dataStorage from '../../../../dataStorage'

export const MARKETASTATUS = {
    noAccess: 0,
    pendingCancel: 1,
    pendingSubscribe: 2,
    subscribed: 3
}
export function size(params) {
    return 40;
}
export default function (params) {
    const { gc, config, isEditMode, name, data, value, grid, getValue, setValue, style } = params;
    if (params.data && params.data._provider) return
    gc.beginPath();
    const b = config.bounds;
    const height = 18;
    const width = 18;
    const xImg = b.x + Math.round((b.width - width) / 2) + 0.5;
    const yImg = b.y + Math.round((b.height - height) / 2) + 0.5;
    const exchange = name.replace('market_data_type_', '');
    const ex = (data.data || []).filter(ex => ex.exchange === exchange)[0];
    gc.fillStyle = style.getPropertyValue('--secondary-dark') || '#c5cbce';
    if (isEditMode) {
        if (getValue('market_data_type')) {
            if (value) {
                if (config.dataRow[name] === value && ex && ex.status && ex.status === MARKETASTATUS.pendingCancel) {
                    drawCheckboxEmpty(params, xImg, yImg, width, height);
                } else {
                    if (config.dataRow[name] === value && ex.status === MARKETASTATUS.subscribed) gc.fillStyle = style.getPropertyValue('--ascend-default') || '#359ee4';
                    drawCheckbox(params, xImg, yImg, width, height)
                }
            } else drawCheckboxEmpty(params, xImg, yImg, width, height);
        }
    } else {
        if (ex && ex.status === MARKETASTATUS.pendingSubscribe) drawCheckPending(params, xImg, yImg, width, height);
        else if (value) {
            if (ex && ex.status === MARKETASTATUS.subscribed) gc.fillStyle = style.getPropertyValue('--ascend-default') || '#359ee4';
            drawCheckCircle(params, xImg, yImg, width, height);
        }
    }
    gc.closePath();
    return {
        click: e => {
            if (!isEditMode) return;
            const schema = grid.behavior.getSchema();
            const dataCell = e.detail.dataCell;
            const field = schema[dataCell.x].name;
            const dataRow = e.detail.row || {};

            if (value) setValue(0);
            else setValue(getValue('market_data_type'));
            grid.repaint();
        },
        mouseMove: e => {
            const p = e.detail.gridPoint;
            if (p.x >= xImg && p.x <= xImg + width && p.y >= yImg && p.y <= yImg + height) {
                if (isEditMode && getValue('market_data_type')) grid.div.style.cursor = 'pointer';
                if (ex && ex.status !== MARKETASTATUS.noAccess && value) {
                    const date = ex.status === MARKETASTATUS.pendingSubscribe ? ex.start_date : ex.end_date;
                    if (!date) return;
                    const rect = grid.div.getBoundingClientRect();
                    let text = ex.status === MARKETASTATUS.pendingSubscribe ? '<span>Sent</span>' : '<span style="color: var(--primary-dark)">Until</span>';
                    text += '&nbsp;'
                    text += moment(date).utc().format('hh:mm:ss A, DD/MM/YYYY');
                    showTooltip(text, rect.x + p.x + 10, rect.y + p.y, {
                        border: 'solid 1.2px #3c3e47',
                        backgroundColor: 'var(--primary-dark)',
                        color: '#c5cbce'
                    });
                }
            } else {
                hideTooltip({
                    border: null,
                    backgroundColor: null,
                    color: null
                })
            };
        },
        mouseLeave: () => {
            hideTooltip({
                border: null,
                backgroundColor: null,
                color: null
            });
        }
    }
}
