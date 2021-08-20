import React from 'react';
import { translate } from 'react-i18next';
import moment from 'moment';
import dataStorage from '../../dataStorage';
import { formatNumberPrice, formatNumberVolume, stringFormat, isAUSymbol, parseJSON, clone, translateTime, formatVolume } from '../../helper/functionUtils'
import Icon from '../Inc/Icon/Icon';
import orderState from '../../constants/order_state';
import orderType from '../../constants/order_type';
import originOrderType from '../../constants/origin_order_type';
import logger from '../../helper/log';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import NoTag from '../Inc/NoTag/NoTag';
import Lang from '../Inc/Lang/Lang';
import dicOrderRecordWebSV from './dicOrderRecordWebSV';
import Color from '../../constants/color'

class OrderHistoryDetailWebSV extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    getUserAction() {
        try {
            const data = this.props.data;
            if (data.destination) {
                if (data.destination === 'EX-CHANGE') {
                    return <span className='text-uppercase'><Lang>lang_exchange</Lang></span>
                }
                return data.destination;
            } else {
                return '--';
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
                    iconName = 'hardware/keyboard-arrow-up';
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
            }
            return (
                <Icon src={iconName} color={isBuy ? Color.BUY : Color.SELL} />
            );
        } catch (error) {
            logger.error('getIcon On ItemExpandRow Orderlist' + error)
        }
    }

    getNote() {
        try {
            const data = this.props.data
            const obj = dicOrderRecordWebSV[data.order_status];
            if (obj) {
                let note;
                if (data.order_type) {
                    if (data.order_type === 'LIMIT_ORDER') {
                        note = obj.recordLimit
                    }
                    if (data.order_type === 'MARKETTOLIMIT_ORDER') {
                        note = obj.recordMarket
                    }
                    if (data.order_type === 'STOP_ORDER') {
                        note = obj.recordStopLoss
                    }
                    if (data.order_type === 'STOPLIMIT_ORDER') {
                        note = obj.recordStopLimit
                    }
                }
                return note
            }
            return '';
        } catch (error) {
            logger.error('getDetailTransaction On ItemExpandRow Orderlist' + error)
        }
    }

    note() {
        const checknote = this.getNote()
        if (!checknote) return null
        return checknote.replace(/<([a-z0-9_]+)>/g, (m1, key) => {
            if (key === 'direction') {
                return this.props.data.is_buy ? 'BUY' : 'SELL'
            }
            if (key === 'filled_quantity' || key === 'leave_quantity') {
                return this.props.data[key] ? formatNumberVolume(this.props.data[key], true) : '--'
            }
            if (key === 'avg_price' || key === 'stop_price' || key === 'limit_price') {
                return this.props.data[key] ? formatNumberPrice(this.props.data[key], true) : '--'
            }
            if (key === 'volume') {
                return this.props.data[key] ? formatNumberVolume(this.props.data[key], true) : '--'
            }
            if (key === 'Reason') {
                return this.props.data[key] ? this.props.data.reject_reason : '--'
            }
            return this.props.data[key] || this.props.data[key] === 0 ? this.props.data[key] : '--'
        })
    }
    render() {
        try {
            const data = this.props.data
            const checknote = this.note()
            if (!checknote) return null
            return (
                <div>
                    <NoTag>
                        <div className='myRow changeColorHover orderHistoryRecord'>
                            <div className='showTitle'>
                                {this.getIcon(data.is_buy, data.order_status)}
                                <span>{checknote}</span>
                            </div>
                            <div className='showTitle'>
                                {this.getUserAction(data.actor_changed)}
                            </div>
                        </div>
                        <div className='myRow changeColorHover leftRowOrderPad size--3'>
                            <div></div>
                            <div>
                                <div></div>{moment(data.updated).tz('GMT').format('DD MMM YYYY HH:mm:ss')}
                            </div>
                        </div>
                        <div className='lineRowItem'></div>
                    </NoTag>
                </div>
            )
        } catch (error) {
            logger.error('render On ItemExpandRow Orderlist' + error)
        }
    }

    componentDidMount() {
        try {
            this.note()
        } catch (error) {
            logger.error('componentDidMount On ItemExpandRow Orderlist' + error)
        }
    }
}

export default translate('translations')(OrderHistoryDetailWebSV);
