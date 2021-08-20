import React from 'react';
import { translate } from 'react-i18next';
import moment from 'moment';
import dataStorage from '../../dataStorage';
import { formatNumberPrice, formatNumberVolume, stringFormat, isAUSymbol, parseJSON, clone, translateTime, formatVolume } from '../../helper/functionUtils'
import Icon from '../Inc/Icon';
import orderState from '../../constants/order_state';
import orderType from '../../constants/order_type';
import originOrderType from '../../constants/origin_order_type';
import logger from '../../helper/log';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import NoTag from '../Inc/NoTag/NoTag';
import Lang from '../Inc/Lang';
import dicOrderRecord from '../OrderHistoryDetail/dicOrderRecord'
import Color from '../../constants/color'
export function getNote(data) {
    try {
        let obj = {}
        for (var key in dicOrderRecord[data.order_status]) {
            obj[key] = dataStorage.translate(dicOrderRecord[data.order_status][key]);
        }
        if (obj) {
            let note;
            if (data.order_type === orderType.STOP_LIMIT || data.order_type === orderType.STOP) {
                const listState = data.passed_state && parseJSON(data.passed_state);
                const triggered = (Array.isArray(listState) && (listState.indexOf('TRIGGER') > -1 || listState.indexOf('TRIGGERED') > -1 || listState.indexOf('Triggered') > -1)) || data.order_state === 'TRIGGERED'
                // const triggered = false;
                if (data.order_type === orderType.STOP_LIMIT) {
                    if (triggered) {
                        note = obj.recordStopLimitTrigger
                    }
                    if (!note) note = obj.recordStopLimit
                } else {
                    if (triggered) {
                        note = obj.recordStopLossTrigger
                    }
                    if (!note) note = obj.recordStopLoss
                }
            } else {
                if (data.order_type === orderType.LIMIT) {
                    note = obj.recordLimit
                } else {
                    note = obj.recordMarket
                }
            }
            return note || '';
        }
        return '';
    } catch (error) {
        logger.error('getDetailTransaction On ItemExpandRow Orderlist' + error)
    }
}
export function note(data) {
    const listOrderStatus = [16, 14, 26, 5, 23]
    return getNote(data).replace(/<([a-z0-9_]+)>/g, (m1, key) => {
        if (key === 'direction') {
            return data.is_buy ? 'BUY' : 'SELL'
        }
        if (key === 'stop_price_old' || key === 'limit_price_old') {
            const orderAction = data.order_action && (parseJSON(data.order_action))
            if (orderAction && orderAction.note) {
                const note = typeof orderAction.note === 'string' ? parseJSON(orderAction.note) : orderAction.note
                return note && note.data && note.data[key] ? formatNumberPrice(note.data[key], true) : '--'
            }
            return '--'
        }
        if (key === 'volume_old') {
            const orderAction = data.order_action && (parseJSON(data.order_action))
            if (orderAction && orderAction.note) {
                const note = typeof orderAction.note === 'string' ? parseJSON(orderAction.note) : orderAction.note
                return note && note.data && note.data[key] ? formatNumberVolume(note.data[key], true) : '--'
            }
            return '--'
        }
        if (key === 'filled_quantity' || key === 'leave_quantity') {
            return data.hasOwnProperty(key) ? formatNumberVolume(data[key], true) : '--'
        }
        if (key === 'avg_price') {
            return data.hasOwnProperty(key) ? formatNumberPrice(data[key], true) : '--'
        }
        if (key === 'volume') {
            const orderAction = data.order_action && (parseJSON(data.order_action))
            if ([5, 14, 16, 23, 26].indexOf(data.order_status) > -1 && orderAction && orderAction.note) {
                const note = typeof orderAction.note === 'string' ? parseJSON(orderAction.note) : orderAction.note
                if (note && note.data && note.data[key]) {
                    return formatNumberVolume(note.data[key], true)
                }
            }
            if ((listOrderStatus.indexOf(data.order_status) === -1) && data.hasOwnProperty(key)) {
                return formatNumberVolume(data[key], true)
            }
            return '--'
        }
        if (key === 'limit_price' || key === 'stop_price') {
            const orderAction = data.order_action && (parseJSON(data.order_action))
            if ([5, 14, 16, 23, 26].indexOf(data.order_status) > -1 && orderAction && orderAction.note) {
                const note = typeof orderAction.note === 'string' ? parseJSON(orderAction.note) : orderAction.note
                if (note && note.data && note.data[key]) {
                    return formatNumberPrice(note.data[key], true)
                }
            }
            if ((listOrderStatus.indexOf(data.order_status) === -1) && data.hasOwnProperty(key)) {
                return formatNumberPrice(data[key], true)
            }
            return '--'
        }
        if (key === 'display_name') {
            const displayName = data.display_name || data.symbol
            return displayName
        }
        if (key === 'reason') {
            const rejectReason = data.reject_reason
            return rejectReason
        }
        return data[key] || data[key] === 0 ? data[key] : '--'
    })
}
class OrderHistoryDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    getUserAction() {
        try {
            const data = this.props.data;
            if (data.actor_changed) {
                if (data.actor_changed === 'EX-CHANGE') {
                    return <span className='text-uppercase'><Lang>lang_exchange</Lang></span>
                }
                return data.actor_changed;
            } else {
                return dataStorage.userInfo.user_login_id;
            }
        } catch (error) {
            logger.error('getUserAction On ItemExpandRow Orderlist' + error)
        }
    }

    getIcon(isBuy, state) {
        try {
            let iconName = 'action/bookmark';
            switch (state) {
                case orderState.UNKNOWN:
                    break;
                case orderState.NEW:
                    iconName = 'content/flag';
                    break;
                case orderState.DONE_FOR_DAY:
                case orderState.CALCULATED:
                case orderState.ACCEPTED_FOR_BIDDING:
                    iconName = 'action/turned-in'
                    break;
                case orderState.PARTIALLY_FILLED:
                case orderState.FILLED:
                    iconName = isBuy ? 'hardware/keyboard-arrow-up' : 'hardware/keyboard-arrow-down';
                    break;
                case orderState.PLACE:
                case orderState.REPLACE:
                case orderState.CANCEL:
                    iconName = 'social/person';
                    break;
                case orderState.STOPPED:
                case orderState.SUSPENDED:
                    return <FontAwesomeIcon className="fontawesome-icon" icon={faInfo} color={isBuy ? Color.BUY : Color.SELL} />
                case orderState.REJECTED:
                case orderState.EXPIRED:
                case orderState.CANCELLED:
                case orderState.PURGED:
                    iconName = 'content/remove';
                    break;
                case orderState.PENDING_REPLACE:
                case orderState.PENDING_CANCEL:
                case orderState.PENDING_NEW:
                    iconName = 'navigation/more-horiz';
                    break;
                case orderState.REJECT_ACTION_REPLACE:
                case orderState.REJECT_ACTION_CANCEL:
                    iconName = 'content/clear';
                    break;
                case orderState.REPLACED:
                case orderState.APPROVE_TO_CANCEL:
                case orderState.APPROVE_TO_REPLACE:
                    iconName = 'navigation/check';
                    break;
                case orderState.TRIGGER:
                    iconName = 'image/flash-on'
                    break;
                case orderState.DENY_TO_REPLACE:
                case orderState.DENY_TO_CANCEL:
                    iconName = 'content/clear';
                    break;
            }
            return (
                <Icon src={iconName} color={isBuy ? Color.BUY : Color.SELL} />
            );
        } catch (error) {
            logger.error('getIcon On ItemExpandRow Orderlist' + error)
        }
    }

    render() {
        try {
            const data = this.props.data
            return (
                <div>
                    {this.props.form === 'ItemExpandRow'
                        ? <NoTag>
                            <div className='itemRowExpand'>
                                <div className='size--3'>
                                    {this.getIcon(data.is_buy, data.order_status)}
                                    <div className='itemRowExpandLeft size--2'>
                                        <span className='size--3 showTitle'>{note(data)}</span>
                                    </div>
                                </div>
                                <div className='itemRowExpandRight size--2'>
                                    <span>{this.getUserAction(data.actor_changed)}</span>
                                    <span>{translateTime(data.updated, true, dataStorage.timeZone)}</span>
                                </div>
                            </div>
                            <div className='lineRowItem'></div>
                        </NoTag>
                        : <NoTag>
                            <div className='myRow changeColorHover orderHistoryRecord'>
                                <div className='showTitle'>
                                    {this.getIcon(data.is_buy, data.order_status)}
                                    <span>{note(data)}</span>
                                </div>
                                <div className='showTitle'>
                                    {this.getUserAction(data.actor_changed)}
                                </div>
                            </div>
                            <div className='myRow changeColorHover leftRowOrderPad size--3'>
                                <div></div>
                                <div>
                                    <div></div>{translateTime(data.updated, true, dataStorage.timeZone)}
                                </div>
                            </div>
                        </NoTag>
                    }
                </div>
            )
        } catch (error) {
            logger.error('render On ItemExpandRow Orderlist' + error)
        }
    }

    componentDidMount() {
        try {
        } catch (error) {
            logger.error('componentDidMount On ItemExpandRow Orderlist' + error)
        }
    }
}

export default translate('translations')(OrderHistoryDetail);
