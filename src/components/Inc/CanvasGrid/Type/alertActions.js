import { pointInPath } from '../helper/func';
import { drawPlayListRemove, drawModifyBtn } from '../helper/draw';
import dataStorage from '../../../../dataStorage';
import MapRoleComponent from '../../../../constants/map_role_component';
import { checkRole } from '../../../../helper/functionUtils';

export default function (params) {
    const isAllowModify = checkRole(MapRoleComponent.MODIFY_BUTTON_ALERT)
    const isAllowRemove = checkRole(MapRoleComponent.REMOVE_BUTTON_ALERT)
    if (!isAllowRemove && !isAllowModify) return;
    const { gc, config, style, root, data, grid, gridId, rowHover } = params
    if (params.data && params.data._provider) return
    const b = config.bounds
    let lstAction = []
    let btnPosition = {}
    isAllowModify && lstAction.push('modifyBtn')
    isAllowRemove && lstAction.push('removeBtn')
    const drawButton = () => {
        gc.fillStyle = params.rowTextStyle;
        gc.textBaseline = 'middle';
        gc.textAlign = 'left';
        gc.font = params.font;
        lstAction.forEach((val, i) => {
            const w = 18;
            const h = 18;
            let x = 8 + (26 * i);
            let y = b.y + (b.height - h) / 2;
            gc.globalAlpha = dataStorage.connected ? 1 : 0.5
            if (val === 'modifyBtn') {
                btnPosition['modifyBtn'] = { x, y, w, h }
                if (params.btnHover !== val && dataStorage.connected) {
                    gc.fillStyle = style.getPropertyValue('--semantic-info');
                    gc.fillRect(x, y, w, h);
                    gc.fillStyle = style.getPropertyValue('--secondary-light')
                    drawModifyBtn(params, x + 3, y + 3, 12, 12);
                } else {
                    gc.fillStyle = params.rowStyle;
                    gc.fillRect(x, y, w, h);
                    gc.fillStyle = gc.strokeStyle = style.getPropertyValue('--semantic-info');
                    gc.strokeRect(x, y, w, h);
                    drawModifyBtn(params, x + 3, y + 3, 12, 12);
                }
            }
            if (val === 'removeBtn') {
                btnPosition['removeBtn'] = { x, y, w, h }
                if (params.btnHover !== val && dataStorage.connected) {
                    gc.fillStyle = style.getPropertyValue('--semantic-danger');
                    gc.fillRect(x, y, w, h)
                    gc.fillStyle = style.getPropertyValue('--secondary-light')
                    drawPlayListRemove(params, x + 5, y + 6, 14, 14)
                } else {
                    gc.fillStyle = params.rowStyle;
                    gc.fillRect(x, y, w, h)
                    gc.fillStyle = gc.strokeStyle = style.getPropertyValue('--semantic-danger');
                    gc.strokeRect(x, y, w, h);
                    drawPlayListRemove(params, x + 5, y + 6, 14, 14)
                }
            }
            gc.globalAlpha = 1;
        })
    }
    rowHover && drawButton();
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
    return {
        click: (e) => {
            e.preventDefault()
            if (!dataStorage.connected) return;
            const p = e.detail.gridPoint;
            let btnClick = checkBtn(p, btnPosition)
            switch (btnClick) {
                case 'modifyBtn':
                    dataStorage.goldenLayout.addComponentToStack('NewAlert', {
                        alert_id: params.data.alert_id,
                        data: params.data,
                        isModifyAlert: true,
                        symbolObj: dataStorage.symbolsObjDic[params.data.symbol] || {}
                    })
                    break;
                case 'removeBtn':
                    const id = 'switch_' + gridId + '_' + config.gridCell.y;
                    params.colDef.removeCallback && params.colDef.removeCallback(data, id)
                    break;
                default:
                    break;
            }
        },
        mouseMove: e => {
            if (!dataStorage.connected) return;
            const p = e.detail.gridPoint;
            params.btnHover = checkBtn(p, btnPosition);
            drawButton();
        }
    }
}
