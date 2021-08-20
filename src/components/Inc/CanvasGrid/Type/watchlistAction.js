import { pointInPath, showTooltip, hideTooltip } from '../helper/func';
import { drawPlayListRemove, drawInformationOutline } from '../helper/draw';
import { requirePin } from '../../../../helper/request';
import dataStorage from '../../../../dataStorage';
import sideEnum from '../../../../constants/enum';
import MapRoleComponent from '../../../../constants/map_role_component';
import { checkRole } from '../../../../helper/functionUtils';

const BTN_NAME = {
    securityBtn: 'Security Detail',
    removeBtn: 'Remove',
    sellBtn: 'Sell',
    buyBtn: 'Buy'
}

export default function (params) {
    if (!params.detail && params.data.side === 'Close') return;
    const { gc, config, style, root, data, rowHover, grid } = params
    if (params.data && params.data._provider) return
    const b = config.bounds
    let lstAction = []
    let btnPosition = {}
    if ((checkRole(MapRoleComponent.CREATE_REMOVE_ADD_WATCHLIST))) {
        lstAction.push('removeBtn')
    }
    if (checkRole(MapRoleComponent.SecurityDetail)) {
        lstAction.push('securityBtn')
    }
    if (checkRole(MapRoleComponent.WATCHLIST_1)) {
        lstAction.push('buySellBtn')
    }
    const drawButton = () => {
        gc.fillStyle = params.rowTextStyle;
        gc.textBaseline = 'middle';
        gc.textAlign = 'left';
        gc.font = params.font;
        lstAction.forEach((val, i) => {
            let w = 18;
            let h = 18;
            let x = b.x + b.width - (26 * i) - 26;
            let y = b.y + 7;
            gc.globalAlpha = dataStorage.connected ? 1 : 0.5
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
            if (val === 'securityBtn') {
                btnPosition['securityBtn'] = { x, y, w, h }
                if (params.btnHover !== val && dataStorage.connected) {
                    gc.fillStyle = style.getPropertyValue('--semantic-info');
                    gc.fillRect(x, y, w, h);
                    gc.fillStyle = style.getPropertyValue('--secondary-light')
                    drawInformationOutline(params, x + 3, y + 3, 12, 12);
                } else {
                    gc.fillStyle = params.rowStyle;
                    gc.fillRect(x, y, w, h);
                    gc.fillStyle = gc.strokeStyle = style.getPropertyValue('--semantic-info');
                    gc.strokeRect(x, y, w, h);
                    drawInformationOutline(params, x + 3, y + 3, 12, 12);
                }
            }
            if (val === 'buySellBtn') {
                gc.font = '400 14px Roboto';
                // Sell btn coordinates
                let xSell = b.x + b.width - (26 * i) - 8 - gc.getTextWidth('SELL') - 8
                let ySell = b.y + 7;
                let wSell = gc.getTextWidth('SELL') + 8
                let hSell = 18;
                // Buy btn coordinates
                let xBuy = xSell - gc.getTextWidth('BUY') - 16
                let yBuy = b.y + 7;
                let wBuy = gc.getTextWidth('BUY') + 8
                let hBuy = 18;
                btnPosition['sellBtn'] = { x: xSell, y: ySell, w: wSell, h: hSell }
                if (params.btnHover !== 'sellBtn' && dataStorage.connected) {
                    gc.fillStyle = style.getPropertyValue('--sell-light')
                    gc.fillRect(xSell, ySell, wSell, hSell);
                    gc.fillStyle = style.getPropertyValue('--secondary-light');
                    gc.fillText('SELL', xSell + 4, b.y + b.height / 2);
                } else {
                    gc.fillStyle = params.rowStyle;
                    gc.fillRect(xSell, ySell, wSell, hSell)
                    gc.fillStyle = gc.strokeStyle = style.getPropertyValue('--sell-light');
                    gc.strokeRect(xSell, ySell, wSell, hSell);
                    gc.fillText('SELL', xSell + 4, b.y + b.height / 2);
                }
                btnPosition['buyBtn'] = { x: xBuy, y: yBuy, w: wBuy, h: hBuy }
                if (params.btnHover !== 'buyBtn' && dataStorage.connected) {
                    gc.fillStyle = style.getPropertyValue('--buy-light');
                    gc.fillRect(xBuy, yBuy, wBuy, hBuy);
                    gc.fillStyle = style.getPropertyValue('--secondary-light');
                    gc.fillText('BUY', xBuy + 4, b.y + b.height / 2);
                } else {
                    gc.fillStyle = params.rowStyle;
                    gc.fillRect(xBuy, yBuy, wBuy, hBuy);
                    gc.fillStyle = gc.strokeStyle = style.getPropertyValue('--buy-light');
                    gc.strokeRect(xBuy, yBuy, wBuy, hBuy);
                    gc.fillText('BUY', xBuy + 4, b.y + b.height / 2);
                }
            }
            gc.globalAlpha = 1;
        })
    }
    if (rowHover) {
        drawButton();
    }
    let checkBtn = (p, objPoint) => {
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
            if (!dataStorage.connected) return;
            const p = e.detail.gridPoint;
            let btnClick = checkBtn(p, btnPosition)
            switch (btnClick) {
                case 'securityBtn':
                    e.preventDefault()
                    dataStorage.goldenLayout.addComponentToStack('SecurityDetail', {
                        needConfirm: false,
                        data: { symbolObj: data }
                        // color
                    })
                    break;
                case 'removeBtn':
                    e.preventDefault();
                    root.remove(data, () => {
                        params.colDef.removeCallback && params.colDef.removeCallback('remove', data)
                    });
                    break;
                case 'sellBtn':
                    e.preventDefault()
                    if (!dataStorage.userInfo || !dataStorage.connected) return;
                    requirePin(() => dataStorage.goldenLayout.addComponentToStack('Order', { stateOrder: 'NewOrder', data: { symbol: data.symbol, side: sideEnum.SELLSIDE } }))
                    break;
                case 'buyBtn':
                    e.preventDefault()
                    if (!dataStorage.userInfo || !dataStorage.connected) return;
                    requirePin(() => dataStorage.goldenLayout.addComponentToStack('Order', { stateOrder: 'NewOrder', data: { symbol: data.symbol, side: sideEnum.BUYSIDE } }))
                    break;
                default:
                    break;
            }
        },
        mouseMove: e => {
            if (!dataStorage.connected) return;
            const p = e.detail.gridPoint;
            params.btnHover = checkBtn(p, btnPosition);
            const rect = grid.div.getBoundingClientRect();
            showTooltip(BTN_NAME[params.btnHover], rect.x + p.x + 10, rect.y + p.y);
            drawButton();
        }
    }
}
