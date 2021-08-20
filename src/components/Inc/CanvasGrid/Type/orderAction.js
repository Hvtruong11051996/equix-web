import { truncateText, showTooltip, hideTooltip } from '../helper/func';
import { drawInformationOutline, drawContrast, drawCartOff } from '../helper/draw';
import { requirePin, getUrlOrderDetailByTag, getData } from '../../../../helper/request';
import dataStorage from '../../../../dataStorage';
import sideEnum from '../../../../constants/enum';
import orderEnum from '../../../../constants/order_enum';
import MapRoleComponent from '../../../../constants/map_role_component';
import { checkRole, parseJSON } from '../../../../helper/functionUtils';

const STATUS_VALUE = {
    NEW: 0,
    PARTIALLY_FILLED: 1,
    FILLED: 2,
    DONE_FOR_DAY: 3,
    CANCELLED: 4,
    REPLACED: 5,
    PENDING_CANCEL: 6,
    STOPPED: 7,
    REJECTED: 8,
    SUSPENDED: 9,
    PENDING_NEW: 10,
    CALCULATED: 11,
    EXPIRED: 12,
    ACCEPTED_FOR_BIDDING: 13,
    PENDING_REPLACE: 14,
    PLACE: 15,
    REPLACE: 16,
    CANCEL: 17,
    UNKNOWN: 18,
    DENY_TO_CANCEL: 22,
    DENY_TO_REPLACE: 23,
    PURGED: 24,
    APPROVE_TO_CANCEL: 25,
    APPROVE_TO_REPLACE: 26,
    TRIGGER: 27
}
const listNotAllowModifyCancel = [STATUS_VALUE.PENDING_CANCEL, STATUS_VALUE.APPROVE_TO_CANCEL, STATUS_VALUE.FILLED, STATUS_VALUE.CANCELLED, STATUS_VALUE.REJECTED, STATUS_VALUE.EXPIRED, STATUS_VALUE.PURGED]
const listNotAllowModify = [STATUS_VALUE.TRIGGER, STATUS_VALUE.PENDING_REPLACE]

const isDisableBtn = function (data, type) {
    const state = dataStorage.accountsObjDic[data.account_id] && dataStorage.accountsObjDic[data.account_id].state ? dataStorage.accountsObjDic[data.account_id].state : 'active'
    const disable = state !== 'active' || listNotAllowModifyCancel.includes(data.order_status)
    const disableModify = listNotAllowModify.includes(data.order_status)
    const listState = data.passed_state && parseJSON(data.passed_state);
    const triggered = (Array.isArray(listState) && (listState.indexOf('TRIGGER') > -1 || listState.indexOf('TRIGGERED') > -1 || listState.indexOf('Triggered') > -1)) || data.order_state === 'TRIGGERED'
    if (disable || !dataStorage.connected || (data && data.origin_broker_order_id && data.origin_broker_order_id !== data.broker_order_id) || data.origination === 201) {
        return truncateText
    }
    if (type === 'modify' && disableModify) return true
    if (type === 'cancel' && triggered) return true
    return false
}

export default function (params) {
    if (params.detail) return;
    if (params.data && params.data._provider) return
    const { gc, config, style, grid, data, rowHover } = params
    const b = config.bounds
    const viewModify = checkRole(params.root.props.allOrders ? MapRoleComponent.MODIFY_BUTTON_ALL_ORDERS : MapRoleComponent.MODIFY_BUTTON_ORDERS);
    const viewCancel = checkRole(params.root.props.allOrders ? MapRoleComponent.CANCEL_BUTTON_ALL_ORDERS : MapRoleComponent.CANCEL_BUTTON_ORDERS);
    const isDisableModify = viewModify && isDisableBtn(data, 'modify');
    const isDisableCancel = viewCancel && isDisableBtn(data, 'cancel');
    const x1 = b.x + b.width - 96 + 0.5;
    const x2 = b.x + b.width - 64 + 0.5;
    const x3 = b.x + b.width - 32 + 0.5;
    const y = b.y + 4 + 0.5;
    const drawButton = () => {
        gc.fillStyle = params.rowTextStyle;
        gc.textBaseline = 'middle';
        gc.textAlign = 'center';
        gc.font = params.font || '13px Roboto, sans-serif';
        if (params.detailActive && dataStorage.connected) {
            gc.fillStyle = params.rowStyle;
            gc.fillRect(x1, y, 24, 24);
            gc.fillStyle = gc.strokeStyle = style.getPropertyValue('--semantic-info');
            gc.strokeRect(x1, y, 24, 24);
            drawInformationOutline(params, b.x + b.width - 94, b.y + 6, 20, 20);
        } else {
            if (!dataStorage.connected) {
                gc.fillStyle = params.rowStyle;
                gc.fillRect(x1, y, 24, 24);
                gc.globalAlpha = 0.4;
            }
            gc.fillStyle = style.getPropertyValue('--semantic-info');
            gc.fillRect(x1, y, 24, 24);
            gc.fillStyle = style.getPropertyValue('--secondary-light');
            drawInformationOutline(params, b.x + b.width - 94, b.y + 6, 20, 20);
            gc.globalAlpha = 1;
        }
        if (viewModify) {
            if (params.modifyActive && !isDisableModify) {
                gc.fillStyle = params.rowStyle;
                gc.fillRect(x2, y, 24, 24);
                gc.fillStyle = gc.strokeStyle = style.getPropertyValue('--semantic-info');
                gc.strokeRect(x2, y, 24, 24);
                drawContrast(params, b.x + b.width - 62, b.y + 6, 20, 20);
            } else {
                if (!dataStorage.connected || isDisableModify) {
                    gc.fillStyle = params.rowStyle;
                    gc.fillRect(x2, y, 24, 24);
                    gc.globalAlpha = 0.4;
                }
                gc.fillStyle = style.getPropertyValue('--semantic-info');
                gc.fillRect(x2, y, 24, 24);
                gc.fillStyle = style.getPropertyValue('--secondary-light');
                drawContrast(params, b.x + b.width - 62, b.y + 6, 20, 20);
                gc.globalAlpha = 1;
            }
        }

        if (viewCancel) {
            if (params.cancelActive && !isDisableCancel) {
                gc.fillStyle = params.rowStyle;
                gc.fillRect(x3, y, 24, 24);
                gc.fillStyle = gc.strokeStyle = style.getPropertyValue('--semantic-danger');
                gc.strokeRect(x3, y, 24, 24);
                drawCartOff(params, b.x + b.width - 30, b.y + 6, 20, 20);
            } else {
                if (!dataStorage.connected || isDisableCancel) {
                    gc.fillStyle = params.rowStyle;
                    gc.fillRect(x3, y, 24, 24);
                    gc.globalAlpha = 0.4;
                }
                gc.fillStyle = style.getPropertyValue('--semantic-danger');
                gc.fillRect(x3, y, 24, 24);
                gc.fillStyle = style.getPropertyValue('--secondary-light');
                drawCartOff(params, b.x + b.width - 30, b.y + 6, 20, 20);
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
            if (p.x >= x1 && p.x <= x1 + 24 && p.y >= y && p.y <= y + 24) {
                e.preventDefault();
                dataStorage.goldenLayout.addComponentToStack('Order', {
                    needConfirm: false,
                    stateOrder: 'DetailOrder',
                    data: data,
                    currency: params.root.props.currency || '--'
                })
            } else if (viewModify && p.x >= x2 && p.x <= x2 + 24 && p.y >= y && p.y <= y + 24) {
                if (isDisableModify) return
                e.preventDefault();
                requirePin(() => {
                    const side = data.side && data.side === 'Buy' ? sideEnum.BUYSIDE : (data.is_buy ? sideEnum.BUYSIDE : sideEnum.SELLSIDE);
                    dataStorage.goldenLayout.addComponentToStack('Order', {
                        contingentOrder: data && (data.order_type === 'STOPLIMIT_ORDER' || data.order_type === 'STOP_ORDER') && checkRole(MapRoleComponent.CONTINGENT_ORDER_PAD) && dataStorage.dataSetting.checkQuickOrderPad,
                        stateOrder: 'ModifyOrder',
                        data: { data: data, side: side },
                        needConfirm: false,
                        currency: params.root.props.currency || '--'
                    });
                });
            } else if (viewCancel && p.x >= x3 && p.x <= x3 + 24 && p.y >= y && p.y <= y + 24) {
                if (isDisableCancel) return
                e.preventDefault();
                requirePin(() => {
                    if (data && data.broker_order_id) {
                        const url = getUrlOrderDetailByTag(data.broker_order_id)
                        getData(url).then(response => {
                            const listHistory = response.data || [];
                            const orderStatus = listHistory[0] && listHistory[0].order_status ? listHistory[0].order_status : data.order_status;
                            const obj = data;
                            obj.order_status = orderStatus;
                            dataStorage.goldenLayout.addComponentToStack('Order', {
                                contingentOrder: data && (data.order_type === 'STOPLIMIT_ORDER' || data.order_type === 'STOP_ORDER') && checkRole(MapRoleComponent.CONTINGENT_ORDER_PAD) && dataStorage.dataSetting.checkQuickOrderPad,
                                stateOrder: 'DetailOrder',
                                data: { data: data },
                                needConfirm: true,
                                dataConfirm: { typeConfirm: orderEnum.CANCEL_ORDER, dataAccount: obj },
                                currency: params.root.props.currency || '--'
                            })
                        })
                    }
                });
            }
        },
        mouseMove: e => {
            if (!dataStorage.connected) return;
            const p = e.detail.gridPoint;
            if (p.x >= x1 && p.x <= x1 + 24 && p.y >= y && p.y <= y + 24) {
                const rect = grid.div.getBoundingClientRect();
                showTooltip(dataStorage.translate('lang_detail_order').toCapitalize(), rect.x + p.x + 10, rect.y + p.y);
                grid.div.style.cursor = 'pointer';
                params.detailActive = true;
                delete params.modifyActive;
                delete params.cancelActive;
            } else if (viewModify && p.x >= x2 && p.x <= x2 + 24 && p.y >= y && p.y <= y + 24) {
                const rect = grid.div.getBoundingClientRect();
                showTooltip(dataStorage.translate('lang_modify_order').toCapitalize(), rect.x + p.x + 10, rect.y + p.y);
                grid.div.style.cursor = isDisableModify ? 'not-allowed' : 'pointer';
                delete params.detailActive;
                params.modifyActive = true;
                delete params.cancelActive;
            } else if (viewCancel && p.x >= x3 && p.x <= x3 + 24 && p.y >= y && p.y <= y + 24) {
                const rect = grid.div.getBoundingClientRect();
                showTooltip(dataStorage.translate('lang_cancel_order').toCapitalize(), rect.x + p.x + 10, rect.y + p.y);
                grid.div.style.cursor = isDisableCancel ? 'not-allowed' : 'pointer';
                delete params.detailActive;
                delete params.modifyActive;
                params.cancelActive = true;
            } else {
                delete params.detailActive;
                delete params.modifyActive;
                delete params.cancelActive;
            }
            drawButton();
        }
    }
}
