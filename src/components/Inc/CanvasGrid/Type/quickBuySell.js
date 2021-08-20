import { showTooltip, hideTooltip } from '../helper/func';
import { requirePin } from '../../../../helper/request';
import dataStorage from '../../../../dataStorage';
import sideEnum from '../../../../constants/enum';
import Color from '../../../../constants/color';
import { checkRole } from '../../../../helper/functionUtils';
export default function (params) {
    const { gc, config, style, grid, value, displayValue, colDef, rowHover } = params
    if (params.data && params.data._provider) return
    const b = config.bounds
    const x = colDef.right ? grid.canvas.width - 8 - 93 + 0.5 : b.x + 8 + 0.5
    const y = b.y + 4 + 0.5
    const drawButton = () => {
        gc.fillStyle = params.rowTextStyle;
        gc.textBaseline = 'middle';
        gc.textAlign = 'center';
        const yCenter = Math.ceil(b.height / 2) + b.y + 0.5;
        gc.font = params.font;
        if (colDef.role && !checkRole(colDef.role)) return
        if (colDef.isHidden) {
            const [field, val] = colDef.isHidden
            if (params.data[field] === val) return
        }
        if (!dataStorage.connected || params.buyActive) {
            gc.fillStyle = params.rowStyle;
            gc.fillRect(x, y, 46, 24);
            gc.fillStyle = gc.strokeStyle = params.buyActive && dataStorage.connected ? style.getPropertyValue('--buy-light') : style.getPropertyValue('--buy-dark');
            gc.strokeRect(x, y, 46, 24);
            gc.fillText('BUY', x + 23, yCenter);
        } else {
            gc.fillStyle = style.getPropertyValue('--buy-light');
            gc.fillRect(x, y, 46, 24);
            gc.fillStyle = style.getPropertyValue('--secondary-light');
            gc.fillText('BUY', x + 23, yCenter);
        }

        if (!dataStorage.connected || params.sellActive) {
            gc.fillStyle = params.rowStyle;
            gc.fillRect(x + 47, y, 46, 24);
            gc.fillStyle = gc.strokeStyle = params.sellActive && dataStorage.connected ? style.getPropertyValue('--sell-light') : style.getPropertyValue('--sell-dark');
            gc.strokeRect(x + 47, y, 46, 24);
            gc.fillText('SELL', x + 23 + 46, yCenter);
        } else {
            gc.fillStyle = style.getPropertyValue('--sell-light');
            gc.fillRect(x + 47, y, 46, 24);
            gc.fillStyle = style.getPropertyValue('--secondary-light');
            gc.fillText('SELL', x + 23 + 46, yCenter);
        }
    }
    if (rowHover) {
        drawButton();
    }
    return {
        click: (e) => {
            if (colDef.role && !checkRole(colDef.role)) return
            if (colDef.isHidden) {
                const [field, val] = colDef.isHidden
                if (params.data[field] === val) return
            }
            if (!dataStorage.connected) return;
            const symbolObj = colDef.selfData ? params.data : params.root.props.loadState().symbol;
            if (!symbolObj) return;
            const p = e.detail.gridPoint;
            if (p.x >= x && p.x <= x + 46 && p.y >= y && p.y <= y + 24) {
                e.preventDefault();
                requirePin(() => dataStorage.goldenLayout.addComponentToStack('Order', { stateOrder: 'NewOrder', data: { symbol: symbolObj.symbol, symbolObj: symbolObj, side: sideEnum.BUYSIDE }, orderTypeSelection: 'Limit', limitPrice: params.data.price }));
            } else if (p.x >= x + 47 && p.x <= x + 93 && p.y >= y && p.y <= y + 24) {
                e.preventDefault();
                requirePin(() => dataStorage.goldenLayout.addComponentToStack('Order', { stateOrder: 'NewOrder', data: { symbol: symbolObj.symbol, symbolObj: symbolObj, side: sideEnum.SELLSIDE }, orderTypeSelection: 'Limit', limitPrice: params.data.price }));
            }
        },
        mouseMove: e => {
            if (!dataStorage.connected) return;
            if (colDef.role && !checkRole(colDef.role)) return
            const p = e.detail.gridPoint;
            if (p.x >= x && p.x <= x + 93 && p.y >= y && p.y <= y + 24) {
                grid.div.style.cursor = 'pointer';
                const rect = grid.div.getBoundingClientRect();
                if (p.x > x + 46) {
                    delete params.buyActive;
                    params.sellActive = true;
                    hideTooltip();
                    showTooltip('SELL', rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
                } else {
                    params.buyActive = true;
                    delete params.sellActive;
                    hideTooltip();
                    showTooltip('BUY', rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
                }
            } else {
                delete params.buyActive;
                delete params.sellActive;
            }
            drawButton();
        }
    }
}
