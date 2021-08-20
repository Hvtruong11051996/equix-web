import React from 'react';
import Lang from '../Inc/Lang';
import DropDown from '../DropDown';
import logger from '../../helper/log';
import { getUrlDataBusinessLog, getData } from '../../helper/request';
import { formatNumberNew2, translateTime1, checkToday } from '../../helper/functionUtils'
import dataStorage from '../../dataStorage';
import role from '../../constants/role';
import ORDER_TYPE from '../../constants/order_type';
import uuidv4 from 'uuid/v4';
import DatePicker, { getStartTime, getEndTime, convertTimeToGMTString, getResetMaxDate } from '../Inc/DatePicker/DatePicker';
import ExampleCustomInput from '../Inc/ExampleCustomInput';
import { registerUser, unregisterUser } from '../../streaming';
import NoTag from '../Inc/NoTag';
import { getTimeBusinessLog } from '../../helper/dateTime';
import ToggleLine from '../Inc/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event';
import Paginate from '../Inc/Paginate'
import moment from 'moment';
import s from './Activities.module.css'

const USER_STATUS = {
    2: 'lang_active',
    0: 'lang_inactive',
    1: 'lang_pending_email_verification',
    5: 'lang_security_blocked',
    4: 'lang_admin_blocked',
    3: 'lang_closed'
}

const DURATION_DROPDOWN = [
    { label: 'lang_all', value: 'All' },
    { label: 'lang_day', value: 'day' },
    { label: 'lang_week', value: 'week' },
    { label: 'lang_month', value: 'month' },
    { label: 'lang_quarter', value: 'quarter' },
    { label: 'lang_year', value: 'year' },
    { label: 'lang_custom', value: 'custom' }
]

const DEFAULT_PAGE_OBJ = {
    total_count: 0,
    total_pages: 1,
    current_page: 1,
    temp_end_page: 0
}

const ORDER_MAPPING = {
    place_order0: 'lang_place_sell_order',
    place_order1: 'lang_place_buy_order',
    modify_order0: 'lang_modify_sell_order',
    modify_order1: 'lang_modify_buy_order',
    cancel_order0: 'lang_cancel_sell_order',
    cancel_order1: 'lang_cancel_buy_order'
}

export default class Activities extends React.Component {
    constructor(props) {
        super(props);
        const initState = this.props.loadState();
        this.collapse = initState.collapse ? 1 : 0
        this.id = uuidv4();
        this.userId = initState.user_id || dataStorage.userInfo.user_id;
        this.user_login_id = initState.user_login_id || dataStorage.loginEmail;
        this.pageId = initState.pageId || 1;
        this.pageSize = initState.pageSize || 50;
        if (!initState.initActivities) this.props.saveState({ initActivities: this.userId })
        this.state = {
            allFilterted: initState.allFilterted || 'week',
            filterSearch: initState.filterSearch || 'All',
            minDate: initState.minDate || getStartTime(moment(moment()).tz(dataStorage.timeZone)),
            maxDate: initState.maxDate || getEndTime(moment(moment()).tz(dataStorage.timeZone)),
            listData: []
        }
        this.pageObj = {
            total_count: DEFAULT_PAGE_OBJ.total_count,
            total_pages: DEFAULT_PAGE_OBJ.total_pages,
            current_page: this.pageId,
            temp_end_page: DEFAULT_PAGE_OBJ.temp_end_page
        }
        this.dicSymbolInfo = {};
        this.LIST_DEVICE_APP = ['ANDROID', 'IOS']
    }

    handleOnChangeSearchDropDown = selected => {
        // if (selected === 'All') selected = '';
        this.props.saveState({
            filterSearch: selected
        });
        this.pageId = 1;
        this.setState({
            filterSearch: selected
        }, () => {
            this.getFilterOnSearch();
        })
    }

    handleOnChangeAll = selected => {
        this.pageId = 1;
        this.props.saveState({
            allFilterted: selected
        });
        this.setState({
            allFilterted: selected
        }, () => {
            this.getFilterOnSearch();
        })
    }

    pageChanged = pageId => {
        this.pageId = pageId;
        this.props.saveState({
            pageId: pageId
        });
        this.getFilterOnSearch();
    }

    getNameOfActor = (accountDetails, data) => {
        return `${(accountDetails && accountDetails.data.account_name) || '--'} (${((data && data.account_id !== '#' && data.account_id)) || (accountDetails && accountDetails.data && accountDetails.data.account) || '--'})`
    }

    parseJson = str => {
        try {
            if (typeof (str) === 'object') return str;
            return JSON.parse(str)
        } catch (e) {
            return {}
        }
    }

    showInfoDevice = data => {
        try {
            let detail;
            if (data && data.device_info && data.device_info !== '#' && typeof data.device_info === 'string') detail = this.parseJson(data.device_info, 'showInfoDevice');
            if (detail) {
                const os = detail.os && detail.os.name ? detail.os.name : ''
                const browser = detail.browser && detail.browser.name ? detail.browser.name : ''
                const model = detail.device && detail.device.model ? detail.device.model : ''
                const vendor = detail.device && detail.device.vendor ? detail.device.vendor : ''
                const osUpperCase = os ? os.toUpperCase() : '';
                let deviceInfoShow = <span className='text-uppercase'><Lang>lang_equix_web</Lang> <Lang>lang_on</Lang> {browser} <Lang>lang_browser</Lang> (<Lang>lang_desktop</Lang>)</span>
                if (os && this.LIST_DEVICE_APP.indexOf(osUpperCase) >= 0) {
                    if (vendor && model) {
                        deviceInfoShow = <span className='text-uppercase'> <Lang>lang_equix_app</Lang> <Lang>lang_on</Lang> {vendor} {model} (<Lang>lang_mobile</Lang>) </span>
                    } else {
                        deviceInfoShow = <span className='text-uppercase'> <Lang>lang_equix_app</Lang> <Lang>lang_on</Lang> {os} (<Lang>lang_mobile</Lang>) </span>
                    }
                    return os ? deviceInfoShow : <div className='text-capitalize'><Lang>lang_unknown_device</Lang></div>
                }
                return browser ? deviceInfoShow : <div className='text-capitalize'><Lang>lang_unknown_device</Lang></div>
            } else return <div className='text-capitalize'><Lang>lang_unknown_device</Lang></div>
        } catch (error) {
            logger.log('parse device info error', error)
        }
    }

    renderLoginLogOutAction = data => {
        let accountDetails = data && data.action_details;
        accountDetails = this.parseJson(accountDetails);
        return <div className='decriptionContainer'>
            <div className='grayBox text-uppercase size--2'> <Lang>{(data.action + '').toBackEndTransKey()}</Lang></div>
            <div className='grayBox size--2 text-uppercase'>{this.showInfoDevice(data)}</div>
            <div className='normalText size--3'> <Lang>lang_with</Lang> </div>
            <div className='grayBox text-uppercase size--2'><Lang>lang_ip_adress</Lang> {data.ip_address}</div>
            {data.action === 'sign_in' ? <div className='grayBox text-uppercase size--2'> <Lang>{accountDetails && accountDetails.res_data && accountDetails.res_data.errorCode === 'SUCCESSFUL' ? 'lang_successfully' : 'lang_unsuccessfully'}</Lang></div> : null}
        </div>
    }

    renderPlaceOrder = ({ accountDetail = {}, data = {}, isBuy, isStopOrder }) => (
        <div className='decriptionContainer'>
            <div className={isBuy ? 'buyBox size--2' : 'sellBox size--2 text-uppercase'}> <Lang>{ORDER_MAPPING[data.action + Number(isBuy)]}</Lang> </div>
            <div className='normalText size--3'>{accountDetail.data.volume || '--'}</div>
            <div className='normalText size--3'> <Lang>lang_units</Lang></div>
            <div className='normalText size--3'> <Lang>lang_of</Lang> </div>
            <div className='grayBox size--2'>{(accountDetail && accountDetail.data && accountDetail.data.display_name) || '--'}</div>
            <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
            {accountDetail.data.limit_price ? <div className='grayBox text-uppercase size--2'><Lang>lang_limit_price</Lang></div> : <div className='grayBox size--2'><Lang>lang_market_price</Lang></div>}
            {accountDetail.data.limit_price ? <div className='normalText size--3'>{formatNumberNew2(accountDetail.data.limit_price, 4, true) || '--'} </div> : null}
            {isStopOrder ? <div className='normalText size--3 stopOrderStyle'>, <Lang>lang_trigger_at</Lang> </div> : null}
            {isStopOrder ? <div className='grayBox text-uppercase size--2'><Lang>lang_stop_price</Lang></div> : null}
            {isStopOrder ? <div className='normalText size--3'>{formatNumberNew2(accountDetail.data.stop_price, 4, true) || '--'}</div> : null}
            <div className='normalText size--3'> <Lang>lang_for</Lang> </div>
            <div className='grayBox size--2'>{this.getNameOfActor(accountDetail, data, 'order')}</div>
            <div className='normalText size--3'> <Lang>lang_on</Lang></div>
            <div className='grayBox size--2'>{this.showInfoDevice(data)}</div>
            <div className='normalText size--3'> <Lang>lang_with</Lang> </div>
            <div className='grayBox text-uppercase size--2'><Lang>lang_ip_adress</Lang> {data.ip_address}</div>
        </div>
    )

    renderOrder = data => {
        try {
            let accountDetail;
            let isBuy;
            let indexDic;
            if (data.action_details) {
                accountDetail = this.parseJson(data.action_details);
            };
            if (data.action === 'place_order') {
                accountDetail && accountDetail.data && accountDetail.data.is_buy && (accountDetail.data.is_buy === true || accountDetail.data.is_buy === 1) ? isBuy = true : isBuy = false;
            } else if (data.action === 'modify_order') {
                accountDetail && accountDetail.data && accountDetail.data.to && accountDetail.data.to.is_buy ? isBuy = true : isBuy = false;
            }
            if (data.action === 'cancel_order') {
                accountDetail && accountDetail.data && accountDetail.data.is_buy ? isBuy = true : isBuy = false;
            }
            isBuy ? indexDic = 1 : indexDic = 0;
            const placeOrderOptions = { accountDetail, data, isBuy, indexDic }
            switch (data.action) {
                case 'place_order':
                    const stopTypeOrder = [ORDER_TYPE.STOPLOSS, ORDER_TYPE.STOP, ORDER_TYPE.STOP_LIMIT]
                    if (stopTypeOrder.includes(accountDetail.data.order_type)) {
                        placeOrderOptions.isStopOrder = true
                    }
                    return this.renderPlaceOrder(placeOrderOptions)
                case 'modify_order':
                    if (accountDetail.data.from.order_type === ORDER_TYPE.MARKETTOLIMIT || accountDetail.data.from.order_type === ORDER_TYPE.MARKET) {
                        let temporaryCom;
                        if (!accountDetail.data.from.limit_price) {
                            temporaryCom = () => <div className='grayBox size--2'><Lang>lang_market_price</Lang></div>
                        } else {
                            temporaryCom = () => (
                                <NoTag>
                                    <div className='grayBox text-uppercase size--2'><Lang>lang_limit_price</Lang></div>
                                    <div className='normalText size--3'>{formatNumberNew2(accountDetail.data.from.limit_price, 4, true) || '--'}</div>
                                </NoTag>
                            )
                        }
                        return (
                            <div className='decriptionContainer'>
                                <div className={isBuy ? 'buyBox size--2' : 'sellBox size--2 text-uppercase'}> <Lang>{ORDER_MAPPING[data.action + indexDic]}</Lang> </div>
                                <div className='normalText size--3'><Lang>lang_from</Lang></div>
                                <div className='normalText size--3'> {accountDetail.data.from.volume || '--'} </div>
                                <div className='normalText size--3'> <Lang>lang_units</Lang></div>
                                <div className='normalText size--3'> <Lang>lang_of</Lang> </div>
                                <div className='grayBox size--2'>{(accountDetail && accountDetail.data && accountDetail.data.display_name) || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                                {temporaryCom()}
                                <div className='normalText size--3'><Lang>lang_to</Lang></div>
                                <div className='normalText size--3'>{accountDetail.data.to.volume || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_units</Lang></div>
                                <div className='normalText size--3'> <Lang>lang_of</Lang> </div>
                                <div className='grayBox size--2'>{(accountDetail && accountDetail.data && accountDetail.data.display_name) || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                                {temporaryCom()}
                                <div className='normalText size--3'> <Lang>lang_for</Lang> </div>
                                <div className='grayBox size--2'>{this.getNameOfActor(accountDetail, data, 'order')}</div>
                                <div className='normalText size--3'> <Lang>lang_on</Lang></div>
                                <div className='grayBox size--2'>{this.showInfoDevice(data)}</div>
                                <div className='normalText size--3'> <Lang>lang_with</Lang> </div>
                                <div className='grayBox text-uppercase size--2'><Lang>lang_ip_adress</Lang> {data.ip_address}</div>
                            </div>
                        )
                    }
                    if (accountDetail.data.from.order_type === ORDER_TYPE.LIMIT || accountDetail.data.from.order_type === ORDER_TYPE.LIMIT_SAXO) {
                        return (
                            <div className='decriptionContainer'>
                                <div className={isBuy ? 'buyBox size--2' : 'sellBox size--2 text-uppercase'}> <Lang>{ORDER_MAPPING[data.action + indexDic]}</Lang> </div>
                                <div className='normalText size--3'><Lang>lang_from</Lang></div>
                                <div className='normalText size--3'> {accountDetail.data.from.volume || '--'} </div>
                                <div className='normalText size--3'> <Lang>lang_units</Lang></div>
                                <div className='normalText size--3'> <Lang>lang_of</Lang> </div>
                                <div className='grayBox size--2'>{(accountDetail && accountDetail.data && accountDetail.data.display_name) || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                                <div className='grayBox text-uppercase size--2'><Lang>lang_limit_price</Lang></div>
                                <div className='normalText size--3'>{formatNumberNew2(accountDetail.data.from.limit_price, 4, true) || '--'}</div>
                                <div className='normalText size--3'><Lang>lang_to</Lang></div>
                                <div className='normalText size--3'>{accountDetail.data.to.volume || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_units</Lang></div>
                                <div className='normalText size--3'> <Lang>lang_of</Lang> </div>
                                <div className='grayBox size--2'>{(accountDetail && accountDetail.data && accountDetail.data.display_name) || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                                <div className='grayBox text-uppercase size--2'><Lang>lang_limit_price</Lang></div>
                                <div className='normalText size--3'>{formatNumberNew2(accountDetail.data.to.limit_price, 4, true) || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_for</Lang> </div>
                                <div className='grayBox size--2'>{this.getNameOfActor(accountDetail, data, 'order')}</div>
                                <div className='normalText size--3'> <Lang>lang_on</Lang></div>
                                <div className='grayBox size--2'>{this.showInfoDevice(data)}</div>
                                <div className='normalText size--3'> <Lang>lang_with</Lang> </div>
                                <div className='grayBox text-uppercase size--2'><Lang>lang_ip_adress</Lang> {data.ip_address}</div>
                            </div>
                        )
                    }
                    if (accountDetail.data.from.order_type === ORDER_TYPE.LIMIT) {
                        return (
                            <div className='decriptionContainer'>
                                <div className={isBuy ? 'buyBox size--2' : 'sellBox size--2 text-uppercase'}> <Lang>{ORDER_MAPPING[data.action + indexDic]}</Lang> </div>
                                <div className='normalText size--3'><Lang>lang_from</Lang></div>
                                <div className='normalText size--3'> {accountDetail.data.from.volume || '--'} </div>
                                <div className='normalText size--3'> <Lang>lang_units</Lang></div>
                                <div className='normalText size--3'> <Lang>lang_of</Lang> </div>
                                <div className='grayBox size--2'>{(accountDetail && accountDetail.data && accountDetail.data.display_name) || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                                <div className='grayBox size--2'><Lang>lang_market_price</Lang></div>
                                <div className='normalText text-capitalize size--3'><Lang>lang_trigger</Lang></div>
                                <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                                <div className='grayBox text-uppercase size--2'><Lang>lang_stop_price</Lang></div>
                                <div className='normalText size--3'>{formatNumberNew2(accountDetail.data.from.stop_price, 4, true)}</div>
                                <div className='normalText size--3'><Lang>lang_to</Lang></div>
                                <div className='normalText size--3'>{accountDetail.data.to.volume || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_units</Lang></div>
                                <div className='normalText size--3'> <Lang>lang_of</Lang> </div>
                                <div className='grayBox size--2'>{(accountDetail && accountDetail.data && accountDetail.data.display_name) || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                                <div className='grayBox size--2'><Lang>lang_market_price</Lang></div>
                                <div className='normalText text-capitalize size--3'><Lang>lang_trigger</Lang></div>
                                <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                                <div className='grayBox text-uppercase size--2'><Lang>lang_stop_price</Lang></div>
                                <div className='normalText size--3'>{formatNumberNew2(accountDetail.data.from.stop_price, 4, true)}</div>
                                <div className='normalText size--3'> <Lang>lang_for</Lang> </div>
                                <div className='grayBox size--2'>{this.getNameOfActor(accountDetail, data, 'order')}</div>
                                <div className='normalText size--3'> <Lang>lang_on</Lang></div>
                                <div className='grayBox size--2'>{this.showInfoDevice(data)}</div>
                                <div className='normalText size--3'> <Lang>lang_with</Lang> </div>
                                <div className='grayBox text-uppercase size--2'><Lang>lang_ip_adress</Lang> {data.ip_address}</div>
                            </div>
                        )
                    }
                    if (accountDetail.data.from.order_type === ORDER_TYPE.STOP_LIMIT) {
                        return (
                            <div className='decriptionContainer'>
                                <div className={isBuy ? 'buyBox size--2' : 'sellBox size--2 text-uppercase'}> <Lang>{ORDER_MAPPING[data.action + indexDic]}</Lang> </div>
                                <div className='normalText size--3'><Lang>lang_from</Lang></div>
                                <div className='normalText size--3'> {accountDetail.data.from.volume || '--'} </div>
                                <div className='normalText size--3'> <Lang>lang_units</Lang></div>
                                <div className='normalText size--3'> <Lang>lang_of</Lang> </div>
                                <div className='grayBox size--2'>{(accountDetail && accountDetail.data && accountDetail.data.display_name) || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                                <div className='grayBox text-uppercase size--2'><Lang>lang_limit_price</Lang></div>
                                <div className='normalText size--3'>{formatNumberNew2(accountDetail.data.from.limit_price, 4, true) || '--'}</div>
                                <div className='normalText text-capitalize size--3'><Lang>lang_trigger</Lang></div>
                                <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                                <div className='grayBox text-uppercase size--2'><Lang>lang_stop_price</Lang></div>
                                <div className='normalText size--3'>{formatNumberNew2(accountDetail.data.from.stop_price, 4, true) || '--'}</div>
                                <div className='normalText size--3'><Lang>lang_to</Lang></div>
                                <div className='normalText size--3'>{accountDetail.data.to.volume || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_units</Lang></div>
                                <div className='normalText size--3'> <Lang>lang_of</Lang> </div>
                                <div className='grayBox size--2'>{(accountDetail && accountDetail.data && accountDetail.data.display_name) || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                                <div className='grayBox text-uppercase size--2'><Lang>lang_limit_price</Lang></div>
                                <div className='normalText size--3'>{formatNumberNew2(accountDetail.data.from.limit_price, 4, true) || '--'}</div>
                                <div className='normalText text-capitalize size--3'><Lang>lang_trigger</Lang></div>
                                <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                                <div className='grayBox text-uppercase size--2'><Lang>lang_stop_price</Lang></div>
                                <div className='normalText size--3'>{formatNumberNew2(accountDetail.data.from.stop_price, 4, true) || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_for</Lang> </div>
                                <div className='grayBox size--2'>{this.getNameOfActor(accountDetail, data, 'order')}</div>
                                <div className='normalText size--3'> <Lang>lang_on</Lang></div>
                                <div className='grayBox size--2'>{this.showInfoDevice(data)}</div>
                                <div className='normalText size--3'> <Lang>lang_with</Lang> </div>
                                <div className='grayBox text-uppercase size--2'><Lang>lang_ip_adress</Lang> {data.ip_address}</div>
                            </div>
                        )
                    }
                    if (accountDetail.data.from.order_type === ORDER_TYPE.STOP) {
                        return (
                            <div className='decriptionContainer'>
                                <div className={isBuy ? 'buyBox size--2' : 'sellBox size--2 text-uppercase'}> <Lang>{ORDER_MAPPING[data.action + indexDic]}</Lang> </div>
                                <div className='normalText size--3'><Lang>lang_from</Lang></div>
                                <div className='normalText size--3'> {accountDetail.data.from.volume || '--'} </div>
                                <div className='normalText size--3'> <Lang>lang_units</Lang></div>
                                <div className='normalText size--3'> <Lang>lang_of</Lang> </div>
                                <div className='grayBox size--2'>{(accountDetail && accountDetail.data && accountDetail.data.display_name) || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                                <div className='grayBox size--2'><Lang>lang_market_price</Lang></div>
                                <div className='normalText text-capitalize size--3'><Lang>lang_trigger</Lang></div>
                                <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                                <div className='grayBox text-uppercase size--2'><Lang>lang_stop_price</Lang></div>
                                <div className='normalText size--3'>{accountDetail.data.from.stop_price}</div>
                                <div className='normalText size--3'><Lang>lang_to</Lang></div>
                                <div className='normalText size--3'>{accountDetail.data.to.volume || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_units</Lang></div>
                                <div className='normalText size--3'> <Lang>lang_of</Lang> </div>
                                <div className='grayBox size--2'>{(accountDetail && accountDetail.data && accountDetail.data.display_name) || '--'}</div>
                                <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                                <div className='grayBox size--2'><Lang>lang_market_price</Lang></div>
                                <div className='normalText text-capitalize size--3'><Lang>lang_trigger</Lang></div>
                                <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                                <div className='grayBox text-uppercase size--2'><Lang>lang_stop_price</Lang></div>
                                <div className='normalText size--3'>{accountDetail.data.to.stop_price}</div>
                                <div className='normalText size--3'> <Lang>lang_for</Lang> </div>
                                <div className='grayBox size--2'>{this.getNameOfActor(accountDetail, data, 'order')}</div>
                                <div className='normalText size--3'> <Lang>lang_on</Lang></div>
                                <div className='grayBox size--2'>{this.showInfoDevice(data)}</div>
                                <div className='normalText size--3'> <Lang>lang_with</Lang> </div>
                                <div className='grayBox text-uppercase size--2'><Lang>lang_ip_adress</Lang> {data.ip_address}</div>
                            </div>
                        )
                    }
                    break;
                case 'cancel_order':
                    // stop + stoploss, limit saxo + limit paritech, stop limit
                    return (
                        <div className='decriptionContainer'>
                            <div className={'sellBox size--2 text-uppercase'}> <Lang>{ORDER_MAPPING[data.action + indexDic]}</Lang> </div>
                            <div className='normalText size--3'>{this.getUnitsRemain(accountDetail.data.volume, accountDetail.data.filled_quantity) || '--'}</div>
                            <div className='normalText size--3'> <Lang>lang_units</Lang></div>
                            <div className='normalText size--3'> <Lang>lang_of</Lang> </div>
                            <div className='grayBox size--2'>{(accountDetail && accountDetail.data && accountDetail.data.display_name) || '--'}</div>
                            <div className='normalText size--3'> <Lang>lang_at</Lang> </div>
                            {accountDetail.data.limit_price ? <div className='grayBox text-uppercase size--2'><Lang>lang_limit_price</Lang></div> : <div className='grayBox text-uppercase size--2'><Lang>lang_market_price</Lang></div>}
                            {accountDetail.data.limit_price ? <div className='normalText size--3'>{formatNumberNew2(accountDetail.data.limit_price, 4, true)} </div> : null}
                            {accountDetail.data.stop_price ? <div className='normalText size--3 stopOrderStyle'>, <Lang>lang_trigger_at</Lang> </div> : null}
                            {accountDetail.data.stop_price ? <div className='grayBox text-uppercase size--2'><Lang>lang_stop_price</Lang></div> : null}
                            {accountDetail.data.stop_price ? <div className='normalText size--3'>{formatNumberNew2(accountDetail.data.stop_price, 4, true) || '--'}</div> : null}
                            <div className='normalText size--3'> <Lang>lang_for</Lang> </div>
                            <div className='grayBox size--2'>{this.getNameOfActor(accountDetail, data, 'order')}</div>
                            <div className='normalText size--3'> <Lang>lang_on</Lang></div>
                            <div className='grayBox size--2'>{this.showInfoDevice(data)}</div>
                            <div className='normalText size--3'> <Lang>lang_with</Lang> </div>
                            <div className='grayBox text-uppercase size--2'><Lang>lang_ip_adress</Lang> {data.ip_address}</div>
                        </div>
                    )
                default:
                    break;
            }
        } catch (error) {
            logger.log('error render orderBusineslog', error)
        }
    }

    getUnitsRemain = (volume, filled) => {
        if (volume) {
            if (!filled) filled = 0;
            return volume - filled
        }
    }

    renderReport = data => {
        try {
            const actionDetails = this.parseJson(data.action_details, 'renderReport');
            return <div className='decriptionContainer'>
                <div className='grayBox size--2 text-uppercase'> <Lang>lang_request</Lang></div>
                <div className='normalText text-uppercase size--3'> <Lang>{(data.action + '').toBackEndTransKey()}</Lang> <Lang>lang_report</Lang> <Lang>lang_from</Lang> {getTimeBusinessLog(actionDetails.data.from, 'DD MMM YYYY')} <Lang>lang_to</Lang> {getTimeBusinessLog(actionDetails.data.to, 'DD MMM YYYY')} <Lang>lang_of</Lang></div>
                <div className='grayBox size--2'> {this.getNameOfActor(actionDetails)}</div>
                <div className='normalText size--3'> <Lang>lang_on</Lang></div>
                <div className='grayBox size--2'> {this.showInfoDevice(data)}</div>
                <div className='normalText size--3'> <Lang>lang_with</Lang> </div>
                <div className='grayBox text-uppercase size--2'><Lang>lang_ip_adress</Lang> {data.ip_address}</div>
            </div>
        } catch (error) {
            console.log('======================>', error)
        }
    }

    renderDetail = data => {
        const actionDetails = this.parseJson(data.action_details, 'renderdetail');
        return <div className='decriptionContainer'>
            <div className='grayBox text-uppercase size--2'> <Lang>{(data.action + '').toBackEndTransKey()}</Lang></div>
            {(data.action === 'create_role_group' || data.action === 'update_role_group' || data.action === 'delete_role_group') ? <div className='normalText size--3'>{(actionDetails && actionDetails.data && actionDetails.data.role_group_name) || null}</div> : null}
            {(data.action === 'reset_password' || data.action === 'create_user' || data.action === 'change_market_data' || data.action === 'update_user') ? <div className='normalText size--3'>{(actionDetails && actionDetails.data && actionDetails.data.data && actionDetails.data.data.user_login_id) || (actionDetails && actionDetails.data && actionDetails.data.user_login_id) || null}</div> : null}
            {(data.action === 'update_vetting_rule') ? <div className='normalText size--3'>{(actionDetails && actionDetails.data && actionDetails.data.branch_name) || null}</div> : null}
            <div className='normalText size--3'> <Lang>lang_on</Lang></div>
            <div className='grayBox size--2'> {this.showInfoDevice(data)}</div>
            <div className='normalText size--3'> <Lang>lang_with</Lang> </div>
            <div className='grayBox text-uppercase size--2'><Lang>lang_ip_adress</Lang> {data.ip_address}</div>
            {data.action === 'enter_pin' ? <div className='normalText size--3'> <Lang>is</Lang> </div> : null}
            {data.action === 'enter_pin' && actionDetails && actionDetails.res_data.errorCode === 'SUCCESSFUL' ? <div className='grayBox size--2 text-uppercase'><Lang>lang_correct</Lang></div> : null}
            {data.action === 'enter_pin' && actionDetails && actionDetails.res_data.errorCode !== 'SUCCESSFUL' ? <div className='grayBox size--2 text-uppercase'> <Lang>lang_incorrect</Lang></div> : null}
        </div>
    }

    renderSymbol = data => {
        const actionDetails = this.parseJson(data.action_details, 'renderdetail');
        return <div className='decriptionContainer'>
            <div className='grayBox text-uppercase size--2'> <Lang>{(data.action + '').toBackEndTransKey()}</Lang></div>
            {data.action !== 'update_symbol' ? <div className='grayBox size--2'> {(actionDetails && actionDetails.data && actionDetails.data.display_name) || '--'}</div> : null}
            {data.action === 'remove_symbol' ? <div className='normalText size--3'> <Lang>lang_from</Lang></div> : null}
            {data.action === 'add_symbol' ? <div className='normalText size--3'> <Lang>lang_into</Lang></div> : null}
            <div className='normalText size--3 text-capitalize'> <Lang>lang_personal_watchlist</Lang></div>
            <div className='normalText size--3'> <Lang>lang_on</Lang></div>
            <div className='grayBox size--2'> {this.showInfoDevice(data)}</div>
            <div className='normalText size--3'> <Lang>lang_with</Lang> </div>
            <div className='grayBox text-uppercase size--2'><Lang>lang_ip_adress</Lang> {data.ip_address}</div>
        </div>
    }

    renderStatus = data => {
        const actionDetails = this.parseJson(data.action_details, 'renderdetail');
        return <div className='decriptionContainer'>
            <div className='grayBox text-uppercase size--2'> <Lang>{(data.action + '').toBackEndTransKey()}</Lang></div>
            <div className='normalText size--3'> <Lang>lang_from</Lang></div>
            <div className='grayBox size--2'> <Lang>{USER_STATUS[actionDetails.data.from]}</Lang></div>
            <div className='normalText size--3'> <Lang>lang_to</Lang> </div>
            <div className='grayBox size--2'> <Lang>{USER_STATUS[actionDetails.data.to]}</Lang></div>
            <div className='normalText size--3'> <Lang>lang_on</Lang></div>
            <div className='grayBox size--2'> {this.showInfoDevice(data)}</div>
            <div className='normalText size--3'> <Lang>lang_with</Lang> </div>
            <div className='grayBox text-uppercase size--2'><Lang>lang_ip_adress</Lang> {data.ip_address}</div>
        </div>
    }

    renderCell = data => {
        try {
            switch (data.action) {
                case 'sign_in':
                case 'sign_out':
                    return this.renderLoginLogOutAction(data)
                case 'place_order':
                case 'modify_order':
                case 'cancel_order':
                    return this.renderOrder(data)
                case 'query_cash_report':
                case 'query_holdings_report':
                case 'query_financial_report':
                case 'query_transaction_report':
                    return this.renderReport(data)
                case 'update_saxo_account':
                case 'enter_pin':
                case 'update_setting':
                case 'change_news_source':
                case 'delete_watchlist':
                case 'reset_password':
                case 'change_AO':
                case 'forgot_password':
                case 'create_user':
                case 'update_user':
                case 'create_role_group':
                case 'update_role_group':
                case 'delete_role_group':
                case 'change_market_data':
                case 'update_vetting_rule':
                    return this.renderDetail(data);
                case 'add_symbol':
                case 'remove_symbol':
                case 'update_symbol':
                    return this.renderSymbol(data);
                case 'change_status':
                    return this.renderStatus(data);
                default:
                    return null
            }
        } catch (error) {
            logger.log('error render cell bussiness log', error);
        }
    }

    getFilterOnSearch = () => {
        // this.getUrlData(this.isOperation, this.userId, this.accountId, this.pageId, this.pageSize, this.filterText, this.duration, this.rangeTime)
        const { filterSearch, allFilterted, minDate, maxDate } = this.state
        let url = '';
        let filterText = ''
        if (filterSearch !== 'All') filterText = filterSearch
        let range = allFilterted === 'custom'
            ? {
                fromDate: convertTimeToGMTString(minDate),
                toDate: convertTimeToGMTString(maxDate)
            } : {
                fromDate: convertTimeToGMTString(getStartTime(allFilterted)),
                toDate: convertTimeToGMTString(getEndTime())
            }

        url = getUrlDataBusinessLog(this.isOperation, this.userId, '', this.pageId, this.pageSize, filterText, allFilterted, range);
        this.props.loading(true);
        getData(url)
            .then(res => {
                this.props.loading(false);
                let listData = res.data && res.data.data;
                let pageObj = {
                    total_count: (res.data && res.data.total_count) || DEFAULT_PAGE_OBJ.total_count,
                    total_pages: (res.data && res.data.total_pages) || DEFAULT_PAGE_OBJ.total_pages,
                    current_page: (res.data && res.data.current_page) || DEFAULT_PAGE_OBJ.current_page,
                    temp_end_page: DEFAULT_PAGE_OBJ.temp_end_page
                };
                if (listData && listData.length) {
                    let handleListData = [];
                    const listUnsupported = [];
                    listData.map(item => {
                        if (!listUnsupported.includes(item.action)) {
                            handleListData.push(item);
                        }
                    });
                    this.setState({ listData: handleListData });
                    this.setPage && this.setPage(pageObj);
                } else {
                    this.pageObj = DEFAULT_PAGE_OBJ;
                    this.setState({ listData: [] });
                    this.setPage && this.setPage(this.pageObj);
                }
            })
            .catch((error) => {
                logger.error('can not get data business log', error);
                this.props.loading(false);
                this.pageObj = DEFAULT_PAGE_OBJ;
                this.setState({ listData: [] });
                this.setPage && this.setPage(this.pageObj);
            })
    }

    componentWillUnmount() {
        try {
            removeEventListener(EVENTNAME.clickToRefresh, this.refreshData);
        } catch (error) {
            logger.error('componentWillUnmount On News', error)
        }
    }

    componentDidMount() {
        this.isOperation = null;
        if (dataStorage.userInfo.user_type && dataStorage.userInfo.user_type === role.OPERATION) {
            this.isOperation = true;
        } else {
            this.isOperation = false;
        }
        this.getFilterOnSearch();
        addEventListener(EVENTNAME.clickToRefresh, this.refreshData);
    }

    refreshData = eventName => {
        try {
            if (eventName !== 'refresh') return;
            this.getFilterOnSearch();
        } catch (error) {
            logger.error('refreshData On business Log', error);
        }
    }

    handleChangeMinDate = date => {
        try {
            this.setState({
                minDate: date,
                openDatePickerFrom: false
            }, () => {
                this.getFilterOnSearch()
                this.checkFromDate = moment(date).tz(dataStorage.timeZone).format('DD/MM/YYYY');
            })
            this.props.saveState({
                minDate: date
            })
        } catch (error) {
            logger.error('handleChangeMinDate On ReportsTab' + error)
        }
    }

    handleChangeMaxDate = date => {
        try {
            this.setState({
                maxDate: date,
                openDatePickerTo: false
            }, () => {
                this.getFilterOnSearch()
                this.checkToDate = moment(date).tz(dataStorage.timeZone).format('DD/MM/YYYY');
            })
            this.props.saveState({
                maxDate: date
            })
        } catch (error) {
            logger.error('handleChangeMaxDate On ReportsTab' + error)
        }
    }

    onChangeDate = (type, value) => {
        if (type === 'from') {
            this.fromDate = value;
        } else {
            this.toDate = value;
        }
    }

    handleOnClickOutside = isFrom => {
        try {
            if (isFrom && this.checkFromDate === moment(this.state.minDate).format('DD/MM/YYYY')) return;
            if (!isFrom && this.checkToDate === moment(this.state.maxDate).format('DD/MM/YYYY')) return;
            if (typeof (this.fromDate) === 'string') this.fromDate = parseInt(this.fromDate);
            if (typeof (this.toDate) === 'string') this.toDate = parseInt(this.toDate);
            const fromDate = moment(this.fromDate).tz(dataStorage.timeZone).format('DD/MM/YYYY');
            const toDate = moment(this.toDate).tz(dataStorage.timeZone).format('DD/MM/YYYY');
            const newValue = isFrom ? this.fromDate.split('/') : this.toDate.split('/');
            const newDay = parseInt(newValue[0]);
            const newMonth = parseInt(newValue[1]) - 1;
            const newYear = parseInt(newValue[2]);
            const newDate = new Date(newYear, newMonth, newDay);
            const stateObj = {
                openDatePickerTo: false,
                openDatePickerFrom: false
            }
            if (isFrom) {
                if (
                    !fromDate.includes('d') &&
                    !fromDate.includes('m') &&
                    !fromDate.includes('y') &&
                    newDate.getTime() <= this.state.maxDate.getTime() &&
                    this.checkDateInvalid(newYear, newMonth, newDay)
                ) {
                    this.getDataFromTimeTab(newDate, this.state.maxDate, true);
                    stateObj.minDate = newDate;
                }
            } else {
                if (
                    !toDate.includes('d') &&
                    !toDate.includes('m') &&
                    !toDate.includes('y') &&
                    newDate.getTime() >= this.state.minDate.getTime() &&
                    this.checkDateInvalid(newYear, newMonth, newDay)
                ) {
                    this.getDataFromTimeTab(this.state.minDate, newDate, true);
                    stateObj.maxDate = newDate
                }
                this.setState(stateObj)
            }
        } catch (error) {
            logger.error('handleOnClickOutside On ReportsTab' + error)
        }
    }

    getRoleOptions = () => {
        let roleOptions = [
            { label: 'lang_all', value: 'All' },
            { label: 'lang_sign_in_sign_out', value: 'sign' },
            { label: 'lang_update_watchlist', value: 'symbol' },
            { label: 'lang_place_order', value: 'place_order' },
            { label: 'lang_modify_order', value: 'modify_order' },
            { label: 'lang_cancel_order', value: 'cancel_order' },
            { label: 'lang_querry_report', value: 'query' },
            { label: 'lang_change_news_source', value: 'change_news_source' },
            { label: 'lang_change_status', value: 'change_status' },
            { label: 'lang_change_addon', value: 'change_AO', className: 'text-normal' },
            { label: 'lang_reset_password', value: 'reset_password' },
            { label: 'lang_forgot_password', value: 'forgot_password' },
            { label: 'lang_create_user', value: 'create_user' },
            { label: 'lang_update_user', value: 'update_user' },
            { label: 'lang_create_role_group', value: 'create_role_group' },
            { label: 'lang_update_role_group', value: 'update_role_group' },
            { label: 'lang_delete_role_group', value: 'delete_role_group' },
            { label: 'lang_change_market_data', value: 'change_market_data' },
            { label: 'lang_update_vetting_rule', value: 'update_vetting_rule' }
        ]
        if (dataStorage.userInfo && dataStorage.userInfo.user_type === role.OPERATION) {
            roleOptions.push({ label: 'lang_update_scm', value: 'saxo', className: 'text-normal' });
        }
        return roleOptions
    }

    setPaginate = () => {
        let that = this;
        return {
            setPage: cb => {
                that.setPage = cb
            },
            pageChanged: that.pageChanged
        }
    }

    collapseFunc = (collapse) => {
        this.collapse = collapse ? 1 : 0
        this.props.saveState({
            collapse: this.collapse
        })
        this.forceUpdate()
    }

    createMoreOption = () => {
        const check = checkToday(moment(this.state.maxDate));
        return [
            {
                class: 'width100',
                component: <div className='fullw100'>
                    <DropDown
                        translate={true}
                        options={DURATION_DROPDOWN}
                        value={this.state.allFilterted}
                        placeholder={<span className='text-capitalize'><Lang>lang_week</Lang></span>}
                        onChange={this.handleOnChangeAll}
                    />
                </div>
            },
            {
                component: this.state.allFilterted === 'custom'
                    ? <div className="input-date-gr">
                        <DatePicker
                            customInput={<ExampleCustomInput type='from' onChangeDate={this.onChangeDate.bind(this, 'from')} />}
                            selected={this.state.minDate}
                            maxDate={check ? moment().tz(dataStorage.timeZone) : this.state.maxDate}
                            onClickOutside={() => this.handleOnClickOutside(true)}
                            onChange={this.handleChangeMinDate}
                            isMinDate={true}
                        />
                    </div>
                    : null
            },
            {
                component: this.state.allFilterted === 'custom'
                    ? <div className="input-date-gr input-date-gr-to">
                        <DatePicker
                            customInput={<ExampleCustomInput type='to' onChangeDate={this.onChangeDate.bind(this, 'to')} />}
                            selected={this.state.maxDate}
                            minDate={this.state.minDate}
                            maxDate={moment().tz(dataStorage.timeZone)}
                            onClickOutside={() => this.handleOnClickOutside(false)}
                            onChange={this.handleChangeMaxDate}
                        />
                    </div>
                    : null
            }
        ]
    }

    createagSideButtons = () => {
        return [
            {
                value: 'ResetFilter',
                label: 'lang_reset_filter',
                class: 'disabled'
            },
            {
                value: 'Resize',
                label: 'lang_resize',
                class: 'disabled'
            },
            {
                value: 'Columns',
                label: 'lang_columns',
                class: 'disabled'
            },
            {
                value: 'Filters',
                label: 'lang_filters',
                class: 'disabled'
            }
        ]
    }

    renderTime = x => {
        if (x.action === 'save_balance' || x.action === 'export_eod') return null;
        const timeWraith = x.time ? moment(x.time).tz(dataStorage.timeZone).format('DD/MM/YYYY HH:mm:ss') : '--';
        return (
            <div>
                {timeWraith}
            </div>
        )
    }
    renderList = () => {
        return (
            this.state.listData.map(x => {
                return (
                    <div className={s.row} key={x.time}>
                        <div className={s.tag}> {this.renderTime(x)}</div>
                        <div className={s.tag}>{this.user_login_id}</div>
                        {this.renderCell(x)}
                    </div>
                )
            })
        )
    }

    renderContent = () => {
        return (
            <div className={s.wraper}>
                {this.state.listData.length
                    ? this.renderList()
                    : <div className={s.noData + ' text-capitalize'}><Lang>lang_no_data</Lang></div>
                }
            </div>
        )
    }

    renderPagination = () => {
        try {
            return (
                <Paginate ref={ref => this.paginate = ref} paginate={this.setPaginate()} />
            )
        } catch (error) {
            console.log('renderPagination: ', error)
        }
    }

    render() {
        try {
            return (
                <div className='businessLogContainer qe-widget'>
                    <div className={`header-wrap flex ${this.collapse ? 'collapse' : ''}`}>
                        <div className='navbar'>
                            <DropDown
                                translate={true}
                                options={this.getRoleOptions()}
                                value={this.state.filterSearch}
                                placeholder={<span className='text-capitalize'><Lang>lang_all</Lang></span>}
                                onChange={this.handleOnChangeSearchDropDown}
                            />
                        </div>
                        <MoreOption lstItems={this.createMoreOption()} agSideButtons={this.createagSideButtons()} />
                    </div>
                    <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
                    <div className={s.overWrap}>
                        {this.renderContent()}
                        {this.renderPagination()}
                    </div>
                </div>
            )
        } catch (error) {
            logger.log('error at render Business Log', error)
        }
    }
}
