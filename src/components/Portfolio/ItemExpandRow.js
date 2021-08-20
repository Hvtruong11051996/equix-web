import React from 'react';
import { translate } from 'react-i18next';
import moment from 'moment';
import dataStorage from '../../dataStorage';
import { formatNumberPrice, formatNumberValue, clone, formatNumberVolume, translateTime } from '../../helper/functionUtils'
import Icon from '../Inc/Icon';
import logger from '../../helper/log';
import { completeApi, getData, getUrlTransactionAccount } from '../../helper/request';
import { getCountryCode } from '../Inc/Flag';
import Lang from '../Inc/Lang';
import { emitter, eventEmitter } from '../../constants/emitter_enum';
import { func } from '../../storage';
import config from '../../config';
import { regisRealtime, unregisRealtime } from '../../helper/streamingSubscriber';
import Color from '../../constants/color'
class OrderTransactionDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            code: props.code,
            rowData: props.rowData,
            volume: 0,
            is_buy: false,
            price: 0,
            trade_date: new Date().getTime(),
            updated: new Date().getTime()
        }
    }

    getDetailTransaction() {
        try {
            this.setState({
                volume: this.state.rowData ? this.state.rowData.volume : 0,
                is_buy: this.state.rowData ? this.state.rowData.is_buy : true,
                price: this.state.rowData ? formatNumberPrice(this.state.rowData.price, true) : 0,
                trade_date: this.state.rowData ? this.state.rowData.trade_date : new Date().getTime(),
                updated: this.state.rowData ? this.state.rowData.updated : new Date().getTime()
            })
        } catch (error) {
            logger.error('getDetailTransaction on OrderTransactionDetail ItemExpandRow', error)
        }
    }

    componentDidMount() {
        try {
            this.getDetailTransaction()
        } catch (error) {
            logger.error('componentDidMount on OrderTransactionDetail ItemExpandRow', error)
        }
    }

    render() {
        try {
            return (
                <div>
                    <div className='itemRowExpand'>
                        <div className='size--3'>
                            <Icon src={`${this.state.is_buy === '1' ? 'hardware/keyboard-arrow-up' : 'hardware/keyboard-arrow-down'}`} color={`${this.state.is_buy === '1' ? Color.BUY : Color.SELL}`} height={21} />
                            <span>{formatNumberVolume(this.state.volume)} @ {this.state.price}</span>
                        </div>
                        <div>
                            <span className='time_expand_porfolio size--3'>{translateTime(moment(this.state.updated).format('DD MMM YYYY HH:mm:ss'), true, dataStorage.timeZone)}</span>
                        </div>
                    </div>
                    <div className='lineRowItem'></div>
                </div>
            )
        } catch (error) {
            logger.error('render on OrderTransactionDetail ItemExpandRow', error)
        }
    }
}
class ItemExpandRow extends React.Component {
    constructor(props) {
        super(props);
        this.accountRefresh = func.getStore(emitter.STREAMING_ACCOUNT_DATA);
        this.state = {
            dataExpand: this.props.data || {},
            listOrder: [],
            showButton: props.api.hideCount
        };

        function getData(field) {
            if (props.api.dicCol) {
                const col = props.api.dicCol[field];
                if (col) {
                    let _value;

                    if (['today_change_val', 'upnl'].indexOf(col.field) > -1) {
                        if (props.data[col.field] !== 0 && !props.data[col.field]) {
                            return '--'
                        } else {
                            _value = props.data[col.field];
                            return formatNumberValue(_value, true)
                        }
                    } else if (['today_change_percent', 'profit_per'].indexOf(col.field) > -1) {
                        if (props.data[col.field] !== 0 && !props.data[col.field]) {
                            return '--'
                        } else {
                            const result = props.data[col.field] * 100 || 0;
                            return formatNumberValue(result, true) + '%';
                        }
                    } else if (['market_price', 'average_price'].indexOf(col.field) > -1) {
                        if (props.data[col.field] !== 0 && !props.data[col.field]) {
                            return '--'
                        } else {
                            _value = props.data[col.field];
                            return formatNumberPrice(_value, true)
                        }
                    } else if (['value_convert', 'value', 'book_value_aud'].indexOf(col.field) > -1) {
                        if (col.field === 'value') {
                            const countryCode = getCountryCode(props.data);
                            if (countryCode === 'au') return '';
                        }
                        if (props.data[col.field] !== 0 && !props.data[col.field]) {
                            return '--'
                        } else {
                            _value = props.data[col.field];
                            return formatNumberValue(_value, true)
                        }
                    }
                }
            }
            return props.data[field];
        }
    }

    colorChange(key, value) {
        try {
            if (key === 'Value' || key === 'Average Price' || key === 'Market Price') {
                return 'priceNone'
            }
            value = parseFloat(value)
            return `${value > 0 ? 'priceUp' : ''} ${value < 0 ? 'priceDown' : ''} ${value === 0 ? 'priceNone' : ''}`
        } catch (error) {
            logger.error('colorChange on ItemExpandRow ItemExpandRow', error)
        }
    }

    componentWillReceiveProps(nextProps) {
        try {
            if (nextProps.api) {
                this.setState({
                    showButton: nextProps.api.hideCount
                })
            }
            if (nextProps.expandData) {
                this.setState({
                    expandData: nextProps.expandData
                })
            }
        } catch (error) {
            logger.error('componentWillReceiveProps on ItemExpandRow ItemExpandRow', error)
        }
    }

    getDataPostion() {
        try {
            const accountId = this.props.data.account_id;
            const itemData = this.state.dataExpand;
            this.accountId = accountId;
            const decode = encodeURIComponent(itemData.group_code || itemData.symbol)
            const url = getUrlTransactionAccount(accountId, decode);
            getData(url).then(response => {
                const data = response.data;
                if (data) {
                    const listOrder = (data || []).sort(function (a, b) {
                        return b.updated - a.updated;
                    });
                    this.setState({
                        listOrder
                    });
                }
            })
        } catch (error) {
            logger.error('getDataPostion on ItemExpandRow ItemExpandRow', error)
        }
    }

    realtimeData = (dataRealtime) => {
        try {
            let data, objChanged
            if (typeof dataRealtime === 'string') data = JSON.parse(dataRealtime)
            else data = dataRealtime
            if (data.ping) return
            if (data.data.title.split('#')[0] !== 'TRANSACTION') return
            if (data.data.object_changed) objChanged = JSON.parse(data.data.object_changed)
            if (!this.checkGroupCode(this.state.dataExpand, objChanged)) return
            let checkInsert = this.state.listOrder.findIndex(x => x.id === objChanged.id)
            if (checkInsert === -1 && (this.state.listOrder[0] && this.state.listOrder[0].updated < objChanged.updated)) {
                const listOrder = clone(this.state.listOrder) || [];
                listOrder.unshift(objChanged);
                this.setState({ listOrder });
            }
        } catch (error) {
            logger.error('realtimeData on ItemExpandRow ItemExpandRow', error)
        }
    }

    checkGroupCode = (dataExpand, dataRealtime) => {
        const srt1 = dataExpand.symbol + dataExpand.group_code || ''
        const str2 = dataRealtime.symbol + dataRealtime.group_code || ''
        if (srt1 === str2) return true
        return false
    }

    componentDidMount() {
        try {
            const accountId = this.props.data.account_id;
            unregisRealtime({ callback: this.realtimeData });
            regisRealtime({
                url: completeApi(`/portfolio?account_id=${accountId}`),
                callback: this.realtimeData
            });
            this.emitRefreshID = this.accountRefresh && this.accountRefresh.addListener(eventEmitter.REFRESH_DATA_ACCOUNT, this.getDataPostion.bind(this));
            this.getDataPostion();
            setTimeout(() => {
                this.props.node.setRowHeight(this.height + this.props.api.hideCount * 32);
                this.props.api.onRowHeightChanged();
            }, 100);
        } catch (error) {
            logger.error('componentDidMount on ItemExpandRow ItemExpandRow', error)
        }
    }

    componentWillUnmount() {
        try {
            this.emitRefreshID && this.emitRefreshID.remove();
            unregisRealtime({ callback: this.realtimeData });
        } catch (error) {
            logger.error('componentWillUnmount on ItemExpandRow ItemExpandRow', error)
        }
    }
    renderOrderTransaction() {
        try {
            const listOrder = this.state.listOrder;
            // if (listOrder.length === 0) return
            const itemData = this.state.dataExpand;
            const code = itemData.symbol;
            const listOrderRender = listOrder.map((item, index) => {
                return (<OrderTransactionDetail key={item.updated} code={code} rowData={item} accountId={dataStorage.account_id} />)
            });
            this.height = 48 * listOrderRender.length;
            this.height += this.props.api.hideCount * 32
            if (this.height) {
                this.props.node.setRowHeight(this.height);
                this.props.api.onRowHeightChanged();
            }
            return listOrderRender;
        } catch (error) {
            logger.error('renderOrderTransaction on ItemExpandRow ItemExpandRow', error)
        }
    }

    render() {
        try {
            return (
                <div className='expandPorfolioRoot'>
                    {this.renderOrderTransaction()}
                </div>
            )
        } catch (error) {
            logger.error('render on ItemExpandRow ItemExpandRow', error)
        }
    }
}

export default translate('translations')(ItemExpandRow);
