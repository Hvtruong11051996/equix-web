import { truncateText, showTooltip, hideTooltip } from '../helper/func';
import { drawCartPlus, drawClose, drawInformationOutline } from '../helper/draw';
import { requirePin } from '../../../../helper/request';
import dataStorage from '../../../../dataStorage';
import sideEnum from '../../../../constants/enum';
import MapRoleComponent from '../../../../constants/map_role_component';
import { checkRole, capitalizeFirstLetter } from '../../../../helper/functionUtils';
import Color from '../../../../constants/color.js'

export default function (params) {
    if (!params.detail && params.data.side === 'Close') return;
    if (params.data && params.data._provider) return
    const { gc, config, style, grid, data, rowHover } = params
    const b = config.bounds
    const viewNew = checkRole(params.root.props.isAllHoldings ? MapRoleComponent.NEW_ORDER_BUTTON_HOLDINGS : MapRoleComponent.NEW_ORDER_BUTTON_PORTFOLIO);
    const viewClose = checkRole(params.root.props.isAllHoldings ? MapRoleComponent.CLOSE_ORDER_BUTTON_HOLDINGS : MapRoleComponent.CLOSE_ORDER_BUTTON_PORTFOLIO);
    const x1 = b.x + b.width - 64 + 0.5;
    const x2 = b.x + b.width - 32 + 0.5;
    const y = b.y + 4 + 0.5;
    const drawButton = () => {
        gc.fillStyle = params.rowTextStyle;
        gc.textBaseline = 'middle';
        gc.textAlign = 'center';
        gc.font = params.font;
        if (params.detail) {
            if (!data.broker_order_id) return;
            if (params.sellActive && dataStorage.connected) {
                gc.fillStyle = params.rowStyle;
                gc.fillRect(x2, y, 24, 24);
                gc.fillStyle = gc.strokeStyle = style.getPropertyValue('--semantic-info');
                gc.strokeRect(x2, y, 24, 24);
                drawInformationOutline(params, b.x + b.width - 30, b.y + 6, 20, 20);
            } else {
                if (!dataStorage.connected) {
                    gc.fillStyle = params.rowStyle;
                    gc.fillRect(x2, y, 24, 24);
                    gc.globalAlpha = 0.4;
                }
                gc.fillStyle = style.getPropertyValue('--semantic-info');
                gc.fillRect(x2, y, 24, 24);
                gc.fillStyle = style.getPropertyValue('--secondary-light');
                drawInformationOutline(params, b.x + b.width - 30, b.y + 6, 20, 20);
                gc.globalAlpha = 1;
            }
        } else {
            if (params.buyActive && viewNew) {
                gc.fillStyle = params.rowStyle;
                gc.fillRect(x1, y, 24, 24);
                gc.fillStyle = gc.strokeStyle = style.getPropertyValue('--buy-light');
                gc.strokeRect(x1, y, 24, 24);
                drawCartPlus(params, b.x + b.width - 62, b.y + 6, 20, 20);
            } else {
                if (!dataStorage.connected || !viewNew) {
                    gc.fillStyle = params.rowStyle;
                    gc.fillRect(x1, y, 24, 24);
                    gc.globalAlpha = 0.4;
                }
                gc.fillStyle = style.getPropertyValue('--buy-light');
                gc.fillRect(x1, y, 24, 24);
                gc.fillStyle = style.getPropertyValue('--secondary-light');
                drawCartPlus(params, b.x + b.width - 62, b.y + 6, 20, 20);
                gc.globalAlpha = 1;
            }

            if (params.sellActive && viewClose) {
                gc.fillStyle = params.rowStyle;
                gc.fillRect(x2, y, 24, 24);
                gc.fillStyle = gc.strokeStyle = style.getPropertyValue('--sell-light');
                gc.strokeRect(x2, y, 24, 24);
                drawClose(params, b.x + b.width - 30, b.y + 6, 20, 20);
            } else {
                if (!dataStorage.connected || !viewClose) {
                    gc.fillStyle = params.rowStyle;
                    gc.fillRect(x2, y, 24, 24);
                    gc.globalAlpha = 0.4;
                }
                gc.fillStyle = style.getPropertyValue('--sell-light');
                gc.fillRect(x2, y, 24, 24);
                gc.fillStyle = style.getPropertyValue('--secondary-light');
                drawClose(params, b.x + b.width - 30, b.y + 6, 20, 20);
                gc.globalAlpha = 1;
            }
        }
    }
    if (rowHover) {
        drawButton();
    }
    return {
        click: (e) => {
            if (!dataStorage.connected) return;
            const p = e.detail.gridPoint;
            if (viewNew && p.x >= x1 && p.x <= x1 + 24 && p.y >= y && p.y <= y + 24) {
                if (params.detail) return;
                e.preventDefault();
                requirePin(() => {
                    dataStorage.goldenLayout.addComponentToStack(
                        'Order',
                        {
                            stateOrder: 'NewOrder',
                            currency: data.currency,
                            data: {
                                symbol: data.symbol,
                                account_id: data.account_id,
                                account_name: data.account_name,
                                side: sideEnum.BUYSIDE
                            }
                        });
                });
            } else if (p.x >= x2 && p.x <= x2 + 24 && p.y >= y && p.y <= y + 24) {
                if (params.detail) {
                    if (!data.broker_order_id) return;
                    e.preventDefault();
                    requirePin(() => {
                        dataStorage.goldenLayout.addComponentToStack('Order', {
                            needConfirm: false,
                            stateOrder: 'DetailOrder',
                            data: params.data,
                            currency: params.root.props.currency || data.currency
                        })
                    });
                } else if (viewClose) {
                    e.preventDefault();
                    requirePin(() => {
                        const side = data.volume > 0 ? sideEnum.SELLSIDE : sideEnum.BUYSIDE
                        dataStorage.goldenLayout.addComponentToStack(
                            'Order',
                            {
                                stateOrder: 'NewOrder',
                                currency: params.root.props.currency || data.currency,
                                data: {
                                    symbol: data.symbol,
                                    account_id: data.account_id,
                                    account_name: data.account_name,
                                    side: side,
                                    volume: Math.abs(data.volume),
                                    isClose: true
                                }
                            })
                    });
                }
            }
        },
        mouseMove: e => {
            if (!dataStorage.connected) return;
            const p = e.detail.gridPoint;
            if (viewNew && !params.detail && p.x >= x1 && p.x <= x1 + 24 && p.y >= y && p.y <= y + 24) {
                const rect = grid.div.getBoundingClientRect();
                showTooltip(dataStorage.translate('lang_new_order').toCapitalize(), rect.x + p.x + 10, rect.y + p.y);
                grid.div.style.cursor = 'pointer';
                params.buyActive = true;
                delete params.sellActive;
            } else if ((viewClose || (params.detail && data.broker_order_id)) && p.x >= x2 && p.x <= x2 + 24 && p.y >= y && p.y <= y + 24) {
                const rect = grid.div.getBoundingClientRect();
                const tooltip = dataStorage.translate(params.detail ? 'lang_details' : 'lang_close').toCapitalize()
                showTooltip(tooltip, rect.x + p.x + 10, rect.y + p.y);
                grid.div.style.cursor = 'pointer';
                delete params.buyActive;
                params.sellActive = true;
            } else {
                delete params.buyActive;
                delete params.sellActive;
            }
            drawButton();
        }
    }
}
