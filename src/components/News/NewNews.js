import React from 'react';
import ReactGA from 'react-ga';
import { translate } from 'react-i18next';
import timeago from 'timeago.js';
import uuidv4 from 'uuid/v4';
import { getApiFilter } from '../api';
import DropDown from '../DropDown';
import SearchBox from '../SearchBox';
import dataStorage from '../../dataStorage';
import DatePicker, { getStartTime, getEndTime, convertTimeStamp } from '../Inc/DatePicker';

import moment from 'moment';
import { clone, checkPropsStateShouldUpdate, hideElement, checkTimeAgo, checkDownloadNews, checkToday, checkToUpperCase } from '../../helper/functionUtils';
import logger from '../../helper/log';
import { getData, getRealtimePriceUrlNew, getNewDetails, getUrlAllSymbolRelatedNews, getUrlCountReadNews, putData, makeSymbolUrl, postData } from '../../helper/request';
import Grid from '../Inc/CanvasGrid';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant'
import FilterBox from '../Inc/FilterBox';
import Pdf from '../Inc/Pdf';
import showModal from '../Inc/Modal';
import { registerUser, unregisterUser } from '../../streaming';
import { regisRealtime, unregisRealtime } from '../../helper/streamingSubscriber';
import Auth from '../AuthV2';
import Lang from '../Inc/Lang/Lang';
import ExampleCustomInput from '../Inc/ExampleCustomInput';
import SecurityDetailIcon from '../Inc/SecurityDetailIcon/SecurityDetailIcon'
import ToggleLine from '../Inc/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'

const FIELD = {
    UPDATED: 'updated',
    UPDATED_TIME: 'updated_time',
    CODE: 'symbol',
    PAGES: 'page_count',
    TAGS: 'type_news'
}

const pageObjDefault = {
    total_count: 0,
    total_pages: 1,
    current_page: 1,
    temp_end_page: 0
}

const QUERY_DEFAULT = {
    query: {
        bool: {
            must: []
        }
    },
    sort: []
}

export class News extends React.Component {
    constructor(props) {
        super(props);
        this.isFirst = true
        const initState = this.props.loadState();
        this.pageObj = {
            total_count: 0,
            total_pages: 1,
            current_page: initState.pageId || 1,
            temp_end_page: 0
        }
        this.isRelated = false
        this.collapse = initState.collapse ? 1 : 0
        this.symbolObj = {}
        this.textSearch = initState.textSearch || ''
        this.sign = initState.sign || 'all'
        this.id = uuidv4();
        this.listCodeRelated = [];
        this.page_id = initState.pageId || 1;
        this.filterText = initState.filterText || '';
        this.realtimeDataWatchList = this.realtimeDataWatchList.bind(this);
        this.realtimeNews = this.realtimeNews.bind(this);
        this.updateTimeStamp = this.updateTimeStamp.bind(this);
        this.reRunInterval = this.reRunInterval.bind(this);
        this.realtimeMarkAsRead = this.realtimeMarkAsRead.bind(this);
        this.getDataFromTimeTab = this.getDataFromTimeTab.bind(this);
        this.changeValue = this.changeValue.bind(this);
        this.getUnreadNews = this.getUnreadNews.bind(this);
        this.refreshData = this.refreshData.bind(this);
        this.checkListCodeRelated = this.checkListCodeRelated.bind(this);
        this.handleRedDot = this.handleRedDot.bind(this);
        this.checkParse = this.checkParse.bind(this);
        this.convertSymbolFromArrayToString = this.convertSymbolFromArrayToString.bind(this);
        this.getData = getData;
        this.getData = this.getData.bind(this);
        this.realTimeDataUser = this.realTimeDataUser.bind(this);
        this.updateAllNotice = this.updateAllNotice.bind(this);
        this.updateListcodeRelated = this.updateListcodeRelated.bind(this);
        this.state = {
            minDate: initState.minDate || getStartTime('week'),
            maxDate: initState.maxDate || getEndTime()
        }
        this.props.receive({
            symbol: this.changeValue
        });
        dataStorage.reloadNews.push(this.refreshData);
        this.sort = [];
        this.columns = [
            {
                header: 'lang_date',
                name: FIELD.UPDATED,
                type: TYPE.DATE,
                dateFormat: 'DD MMM YYYY'
            },
            {
                header: 'lang_time',
                name: FIELD.UPDATED_TIME,
                type: TYPE.DATE,
                dateFormat: 'HH:mm:ss'
            },
            {
                header: 'lang_code',
                name: FIELD.CODE,
                type: TYPE.SYMBOL_NEWS,
                formater: (params) => {
                    return params.data.display_name || params.data.symbol || '';
                }
            },
            {
                header: 'lang_pages',
                name: FIELD.PAGES,
                formater: (params) => {
                    if (params.data.page_count > 1) return `${params.data.page_count} Pages`
                    else return `${Math.max(0, params.data.page_count)} Page`
                }
            },
            {
                header: 'lang_tags',
                name: FIELD.TAGS,
                type: TYPE.MULTI_LABEL_WITH_BG,
                valueGetter: (params) => {
                    let obj = {}
                    const listTag = []
                    const tag = this.checkParse(params.data.tag);
                    const sign = this.checkParse(params.data.sign) || [];
                    if (tag) {
                        if (tag.indexOf('TradingHalt') >= 0 || tag.indexOf('SuspensionFromOfficialQuotation') >= 0) {
                            listTag.push('Halt')
                        }
                        if (tag.indexOf('TradingHaltLifted') >= 0 || tag.indexOf('ReinstatementToOfficialQuotation') >= 0) {
                            listTag.push('Halt Lifted')
                        }
                    }
                    if (sign && sign[0] === 'PriceSensitive') {
                        sign[0] = 'Sensitive';
                    }
                    const type = params.data.type_news === 'announcement' ? 'Announcement' : params.data.type_news
                    obj.tag = listTag.join(',')
                    obj.sign = sign.join(',')
                    obj.type = type
                    return obj
                }
            },
            {
                header: 'lang_headline',
                name: 'title',
                formater: (params) => {
                    let res = '';
                    const item = params.data || {}
                    if (item.page_count <= 0) res += '*'
                    if (
                        (item.sign && item.sign.indexOf('PriceSensitive') > -1) ||
                        (item.tag && item.tag.indexOf('SuspensionFromOfficialQuotation') > -1)
                    ) res += '!'
                    res += item.title
                    return res;
                }
            }
        ]
        if (initState.rangeTime) {
            this.handleDateTime(initState.rangeTime)
        } else {
            this.fromDate = convertTimeStamp(getStartTime('week'), true)
            this.toDate = convertTimeStamp(getEndTime())
        }
    }

    checkListCodeRelated(symbol) {
        symbol = symbol || this.symbolObj.symbol;
        if (symbol) {
            if (this.listCodeRelated && this.listCodeRelated.length) {
                const dic = {}
                this.listCodeRelated.map(item => {
                    dic[item] = item;
                })
                if (dic[symbol]) return true
                return false
            } else {
                return false
            }
        } else {
            if (this.listCodeRelated && this.listCodeRelated.length) {
                return true
            } else {
                return false
            }
        }
    }

    handleRedDot(dataInDay, dataMark) {
        try {
            const inDayId = [];
            const markedId = [];
            if (dataInDay && dataInDay.length > 0) {
                for (let index = 0; index < dataInDay.length; index++) {
                    if (dataInDay[index].news_id) {
                        inDayId.push(dataInDay[index].news_id)
                    }
                }
            }
            if (dataMark && dataMark.length > 0) {
                for (let index = 0; index < dataMark.length; index++) {
                    if (dataMark[index].news_id) {
                        markedId.push(dataMark[index].news_id)
                    }
                }
            }
        } catch (error) {
            logger.error('error at handle red dot');
        }
    }
    realtimeMarkAsRead() {
        if (this.listCodeRelated && this.listCodeRelated.length) {
            let url;
            const listCodeRelated = this.convertSymbolFromArrayToString(this.listCodeRelated);
            (this.symbolObj.symbol && this.listCodeRelated.includes(this.symbolObj.symbol)) ? url = getUrlCountReadNews(listCodeRelated) : url = getUrlCountReadNews(listCodeRelated);
            if (this.filterText) url = url + `&filter=${this.filterText}`;
            if (this.sign === 'Price Sensitive') url = url + '&tag=PriceSensitive';
            this.isRelated && url && this.updateMarkAsRead(url);
            this.updateAllNotice();
        }
    }
    updateMarkAsRead(url) {
        try {
            url && getData(url)
                .then(response => {
                    if (response && response.data) {
                        const data = response.data;
                        const dataInDay = data.data_inday || [];
                        const dataMark = data.data_readed || [];
                        this.isRelated && this.handleRedDot(dataInDay, dataMark);
                    }
                })
                .catch((error) => {
                    logger.log('error realtime related news', error)
                });
        } catch (error) {
            logger.error('error update markasRead', error)
        }
    }
    reRunInterval(item) {
        this.intervalId = setInterval(() => this.updateTimeStamp(item), checkTimeAgo(item.updated));
    }

    updateTimeStamp(item) {
        if (item.updated && typeof item.updated === 'string') {
            item.updated = moment(item.updated).format('x');
            item.updated = parseInt(item.updated);
        }
        this.intervalId && clearInterval(this.intervalId);
        const divNoti = document.getElementsByClassName(`timeagoNews_${item.updated}`);
        if (divNoti && divNoti.length) {
            const timeAgo = timeago().format(item.updated);
            for (let index = 0; index < divNoti.length; index++) {
                const dom = divNoti[index];
                dom.innerHTML = timeAgo
            }
        }
        this.reRunInterval(item);
    }

    getPdf(data) {
        if (!data || !data.news_id) return
        const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
        const link = getNewDetails(userId, data.news_id);
        putData(link, {})
            .then(bodyData => {
                if (bodyData && bodyData.data) this.setPdf(bodyData.data[0]);
                else this.setPdf(null);
            })
            .catch((error) => {
                logger.error('error at getMarkAsRead', error);
                this.setPdf(null)
            })
    }

    changeValue(symbolObj) {
        try {
            this.symbolObj = symbolObj
            this.getFilterOnSearch()
        } catch (error) {
            logger.error('changeValue On News', error)
        }
    }

    async getDataNews(queryBody) {
        try {
            if (!dataStorage.userInfo) return;
            this.props.loading(true)
            if (this.isRelated && !this.checkListCodeRelated()) {
                this.setData([])
                this.pageObj = pageObjDefault;
                this.setPage && this.setPage(this.pageObj);
                this.props.loading(false);
                return;
            }
            let url = getApiFilter('news', this.page_id);
            if (!url) {
                this.setData([]);
                this.pageObj = pageObjDefault;
                this.setPage && this.setPage(this.pageObj);
                this.props.loading(false);
                return;
            };
            postData(url, queryBody)
                .then(async (bodyData = {}) => {
                    this.props.loading(false);
                    const listData = (bodyData.data && bodyData.data.data) || [];
                    let listSymbol = []
                    const data = bodyData.data || {};
                    let strQuery = listData.map(e => !dataStorage.symbolsObjDic[e.symbol] && encodeURIComponent(e.symbol)).filter(e => e).join(',')
                    if (strQuery) {
                        const url = makeSymbolUrl(strQuery)
                        await getData(url).then(response => {
                            if (response.data && response.data.length) {
                                for (let i = 0; i < response.data.length; i++) {
                                    dataStorage.symbolsObjDic[response.data[i].symbol] = response.data[i]
                                }
                            }
                        }).catch(error => {
                            logger.log(error);
                            this.props.loading(false);
                            this.needToRefresh = true;
                        })
                    }
                    for (let i = 0; i < listData.length; i++) {
                        const symbolObj = dataStorage.symbolsObjDic[listData[i].symbol] || {};
                        listData[i].class = symbolObj.class || ''
                        listData[i].country = symbolObj.country || 'au'
                        listData[i].display_name = symbolObj.display_name || ''
                        listData[i].updated = new Date(listData[i].updated).getTime();
                        listData[i].updated_time = new Date(listData[i].updated).getTime();
                    }
                    this.setData(listData || []);
                    this.pageObj = {
                        total_count: data.total_count || 0,
                        total_pages: data.total_pages || 1,
                        current_page: data.current_page || 1,
                        temp_end_page: 0
                    };
                    this.setPage && this.setPage(this.pageObj);
                })
                .catch((error) => {
                    logger.error(error)
                    this.needToRefresh = true;
                    this.props.loading(false);
                    this.setData([]);
                    this.pageObj = pageObjDefault;
                    this.setPage && this.setPage(this.pageObj);
                });
        } catch (error) {
            logger.error(error);
        }
    }
    convertSymbolFromArrayToString(symbol) {
        try {
            if ((symbol && Array.isArray(symbol) && symbol.lenth)) {
                symbol = symbol.map(item => encodeURIComponent(item)).join(',');
            }
            if (symbol) return symbol;
            return '';
        } catch (error) {
            return '';
        }
    }
    getUnreadNews(symbol, needUpdateNoticeTab, needUpdateNoticeWidget, getAllUnread) {
        try {
            let url;
            symbol = this.convertSymbolFromArrayToString(symbol);
            url = getUrlCountReadNews(symbol)
            if (!url) {
                this.setData([]);
                return
            };
            getData(url).then(bodyData => {
                const data = bodyData && bodyData.data;
                const dataInDay = data.data_inday || [];
                const dataMark = data.data_readed || [];
                this.isRelated && this.handleRedDot(dataInDay, dataMark);
                if (data) {
                    if (needUpdateNoticeTab) this.setNotiCount(data.total_count_unread)
                    if (needUpdateNoticeWidget || getAllUnread) {
                        dataStorage.numberNoticeNews = data.total_count_unread;
                    }
                } else {
                    logger.sendLog('no data get Unread News');
                }
            }).catch(e => {
                logger.sendLog('die link get Unread News', e);
            });
        } catch (error) {
            logger.sendLog('exception link get Unread News');
        };
    }

    getAllHoldingVsPersonalWatchlist() {
        return new Promise(async (resolve) => {
            if (!dataStorage.userInfo) resolve();
            const url = getUrlAllSymbolRelatedNews();
            url && getData(url)
                .then(res => {
                    this.listCodeRelated = res.data || []
                    resolve()
                })
                .catch(error => {
                    this.listCodeRelated = [];
                    resolve()
                    logger.error('error at get all symbol realted news', error)
                });
        })
    }
    updateListcodeRelated(obj) {
        try {
            if (obj && obj.symbol) {
                if (this.timeoutUpdateNews) clearTimeout(this.timeoutUpdateNews);
                this.timeoutUpdateNews = setTimeout(() => {
                    this.updateAllNotice();
                }, 300)
            }
        } catch (error) {
            console.log('updateListcodeRelated error' + error);
            logger.error('updateListcodeRelated error', error);
        }
    }
    onChangeTab = (isRelated) => {
        this.page_id = 1;
        this.props.saveState({ isRelated: isRelated })
        this.isRelated = isRelated
        this.getFilterOnSearch();
        this.updateAllNotice();
    }

    refreshData = (eventName) => {
        try {
            if (eventName !== 'refresh') return;
            this.onChangeTab(this.isRelated);
        } catch (error) {
            logger.error('refreshData On News', error);
        }
    }

    checkParse(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return JSON.parse(str);
    }

    onChangeSign(index) {
        try {
            if (!dataStorage.userInfo) return;
            this.props.saveState({
                sign: index
            });
            this.sign = index
            this.getFilterOnSearch()
            this.updateAllNotice();
        } catch (error) {
            logger.error('onChangeSign On News', error)
        }
    }

    dataReceivedFromSearchBox(symbolObj = {}, isDelete) {
        try {
            this.symbolObj = symbolObj
            if (!Object.keys(symbolObj)) {
                this.setData([])
                return
            }
            this.props.send({
                symbol: symbolObj,
                force: true
            });
            this.getFilterOnSearch()
        } catch (error) {
            logger.error('dataReceivedFromSearchBox On News', error)
        }
    }

    renderClass(item) {
        try {
            let str = '';
            if (item.page_count <= 0) {
                str += 'showC1 '
            }
            if (
                (item.sign && item.sign.indexOf('PriceSensitive') > -1) ||
                (item.tag && item.tag.indexOf('SuspensionFromOfficialQuotation') > -1)
            ) {
                str += 'showC2 '
            }
            return str;
        } catch (error) {
            logger.error('renderClass On News', error)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (nextState.isHidden) return false;
            if (dataStorage.checkUpdate) {
                return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On News', error)
        }
    }

    flashClass(item) {
        if (!this.existed) this.existed = {};
        if (item) {
            if (this.existed[item.news_id]) {
                return '';
            } else {
                this.existed[item.news_id] = true;
                return 'flash';
            }
        }
        return '';
    }

    checkDateInvalid(year, month, day) {
        if (month > 12) return false;
        switch (month + 1) {
            case 1: case 3: case 5: case 7: case 8: case 10: case 12:
                if (day > 31) return false;
                break;
            case 4: case 6: case 9: case 11:
                if (day > 30) return false;
                break;
            case 2:
                if ((year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 === 0)) {
                    if (day > 29) return false;
                } else {
                    if (day > 28) return false;
                }
        }
        return true;
    }
    getDataFromTimeTab(fromDateBack, toDateBack, isClickOutside) {
        try {
            const rangeTime = {
                min: fromDateBack,
                max: toDateBack
            }
            this.handleDateTime(rangeTime)
            if (isClickOutside) return;
            this.getFilterOnSearch();
            this.updateAllNotice();
        } catch (error) {
            logger.error('getDataFromTimeTab On ReportsTab' + error)
        }
    }
    handleDateTime = (rangeTime) => {
        try {
            this.fromDate = new Date(rangeTime.min).getTime();
            this.toDate = new Date(rangeTime.max).getTime();
            this.props.saveState({
                rangeTime: rangeTime
            })
        } catch (error) {
            logger.sendLog('error handle date time news')
        }
    }
    handleChangeMinDate = (date) => {
        try {
            this.getDataFromTimeTab(date, this.state.maxDate);
            this.setState({
                minDate: date,
                value: 0
            });
            this.props.saveState({
                minDate: date,
                value: 0
            })
        } catch (error) {
            logger.error('handleChangeMinDate On ReportsTab' + error)
        }
    };

    handleChangeMaxDate = (date) => {
        try {
            this.getDataFromTimeTab(this.state.minDate, date);
            this.setState({
                maxDate: date
            })
            this.props.saveState({
                maxDate: date
            })
        } catch (error) {
            logger.error('handleChangeMaxDate On ReportsTab' + error)
        }
    }

    onChangeDate(type, value) {
        if (type === 'from') {
            this.fromDate = value;
        } else {
            this.toDate = value;
        }
        const rangeTime = {
            min: this.fromDate,
            max: this.toDate
        }
        this.handleDateTime(rangeTime)
        this.props.saveState()
    }

    checkToday(date) {
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonth = now.getMonth();
        const curDay = now.getDate();
        const day = date.date();
        const month = date.month();
        const year = date.year();
        if (day === curDay && month === curMonth && year === curYear) return true;
        return false;
    }

    createMoreOption = () => {
        const check = checkToday(moment(this.state.maxDate));
        return [
            {
                class: 'width100',
                component: <DropDown
                    options={[
                        { label: 'lang_all', value: 'all' },
                        { label: 'lang_price_sensitive', value: 'PriceSensitive' }
                    ]}
                    translate={true}
                    value={this.sign}
                    placeholder={'All'}
                    onChange={this.onChangeSign.bind(this)}
                />
            },
            {
                component: <div className='input-date-gr'>
                    <DatePicker
                        customInput={<ExampleCustomInput
                            type='from'
                            onChangeDate={this.onChangeDate.bind(this, 'from')}
                        />}
                        selected={this.state.minDate}
                        maxDate={check ? moment() : this.state.maxDate}
                        onChange={this.handleChangeMinDate.bind(this)}
                        isMinDate={true}
                    />
                </div>
            },
            {
                component: <div className='input-date-gr input-date-gr-to'>
                    <DatePicker
                        customInput={<ExampleCustomInput
                            type='to'
                            onChangeDate={this.onChangeDate.bind(this, 'to')}
                        />}
                        selected={this.state.maxDate}
                        minDate={this.state.minDate}
                        onChange={this.handleChangeMaxDate.bind(this)}
                    />
                </div>
            }
        ]
    }

    createagSideButtons = () => {
        return [
            {
                value: 'ResetFilter',
                label: 'lang_reset_filter',
                callback: () => this.resetFilter(true)
            },
            {
                value: 'Resize',
                label: 'lang_resize',
                callback: () => this.resize()
            },
            {
                value: 'Columns',
                label: 'lang_columns',
                callback: (boundRef) => this.showColumnMenu(boundRef)
            },
            {
                value: 'Filters',
                label: 'lang_filters',
                callback: (boundRef) => this.showFilterMenu(boundRef)
            }
        ]
    }

    collapseFunc = (collapse) => {
        this.props.saveState({ collapse: +collapse })
        this.collapse = +collapse
        this.dom && this.dom.classList.toggle('collapse')
    }

    renderHeader() {
        return (
            <React.Fragment>
                <div className={`header-wrap isMoreOption ${this.collapse ? 'collapse' : ''}`} ref={ref => this.dom = ref}>
                    <div className='navbar more'>
                        <div className='navbarLeft width100'>
                            <SearchBox
                                resize={this.props.resize}
                                loading={this.props.loading}
                                allowDelete={true}
                                getAllData={true}
                                symbol={this.symbolObj.symbol}
                                display_name={this.symbolObj.display_name}
                                obj={this.symbolObj}
                                dataReceivedFromSearchBox={this.dataReceivedFromSearchBox.bind(this)}
                            />
                            <SecurityDetailIcon
                                {...this.props}
                                isHidden={!this.symbolObj.display_name}
                                symbolObj={this.symbolObj}
                                iconStyle={{ position: 'unset', top: 'unset', transform: 'unset', marginLeft: 4 }}
                            />
                        </div>
                        <FilterBox
                            placeholder={'lang_search'}
                            onChange={(e) => this.setQuickFilter(e)} value={this.textSearch} />
                    </div>
                    <MoreOption lstItems={this.createMoreOption()} agSideButtons={this.createagSideButtons()} />
                </div>
                <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
            </React.Fragment>
        )
    }

    onRowClicked(data) {
        data && checkDownloadNews(data.updated) && this.getPdf(data)
    }

    checkToUpperCase(field, value, type) {
        if (type === 'number') return value
        const array = ['symbol']
        if (array.indexOf(field) > -1) return (value + '').toUpperCase()
        else return value
    }

    getBodyFilter(query, noResetPage) {
        const filterBody = query ? clone(query) : QUERY_DEFAULT
        if (!noResetPage) this.page_id = 1;
        if (this.symbolObj && this.symbolObj.symbol) {
            filterBody.query.bool.must.push({
                wildcard: {
                    symbol: {
                        wildcard: `*${this.symbolObj.symbol}*`
                    }
                }
            })
        }
        if (this.sign !== 'all') {
            filterBody.query.bool.must.push({
                wildcard: {
                    sign: {
                        value: '*' + this.sign + '*'
                    }
                }
            })
        }
        if (this.isRelated) {
            const obj = []
            this.listCodeRelated.map(value => {
                const term = {}
                term['symbol'] = { 'value': this.checkToUpperCase('symbol', value, 'text') }
                obj.push({ 'term': term });
            })
            filterBody.query.bool.must.push({
                bool: {
                    should: obj
                }
            })
        }
        filterBody.query.bool.must.push({
            range: {
                updated: {
                    from: this.fromDate,
                    to: this.toDate
                }
            }
        })
        filterBody.sort.length === 0 && filterBody.sort.push({
            'updated': {
                'order': 'desc'
            }
        })
        return filterBody
    }

    getFilterOnSearch = (body = this.queryBody, noResetPage = false) => {
        this.queryBody = body
        const queryBody = this.getBodyFilter(body, noResetPage)
        if (this.isFirst) {
            this.isFirst = false
            this.getAllHoldingVsPersonalWatchlist().then(() => this.getDataNews(queryBody))
        } else this.getDataNews(queryBody)
    }

    renderGrid() {
        return <Grid
            {...this.props}
            id={FORM.NEWS}
            columns={this.columns}
            showProvider={true}
            autoFit={true}
            fn={fn => {
                this.addDetail = fn.addDetail
                this.addOrUpdate = fn.addOrUpdate
                this.setData = fn.setData
                this.setBottomRow = fn.setBottomRow
                this.getData = fn.getData
                this.remove = fn.remove
                this.setColumn = fn.setColumn
                this.autoSize = fn.autoSize
                this.exportCSV = fn.exportCsv
                this.resetFilter = fn.resetFilter
                this.setQuickFilter = fn.setQuickFilter
                this.showColumnMenu = fn.showColumnMenu
                this.showFilterMenu = fn.showFilterMenu
            }}
            getFilterOnSearch={this.getFilterOnSearch}
            paginate={{
                setPage: (cb) => {
                    this.setPage = cb
                },
                pageChanged: this.pageChanged.bind(this)
            }}
            fnKey={data => data.news_id}
            onRowClicked={this.onRowClicked.bind(this)}
        />
    }

    renderRequireLogin() {
        return <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', height: '100%' }}>
            <div className='please-login size--3'>
                <span className='firstLetterUpperCase'><Lang>lang_please</Lang></span>
                {
                    window.isSubWindow
                        ? <span className='firstLetterUpperCase'>&nbsp;<Lang>lang_sign_in</Lang>&nbsp;</span>
                        : <span onClick={() => this.showLoginForm()}
                            className='btn-login firstLetterUpperCase'>&nbsp;<Lang>lang_sign_in</Lang>&nbsp;</span>
                }
                <Lang>lang_to_access_market_announcements</Lang>
            </div>
        </div>
    }

    renderContent() {
        if (dataStorage.userInfo) return this.renderGrid()
        else return this.renderRequireLogin()
    }

    renderPdf() {
        return <PdfWrapper registerFn={fn => this.setPdf = fn} />
    }

    renderTabbar() {
        return <TabNews onChangeTab={this.onChangeTab} registerFn={fn => this.setNotiCount = fn} isRelated={this.isRelated} />
    }

    pageChanged(pageId) {
        if (this.page_id === pageId) return;
        this.page_id = pageId;
        this.props.saveState({
            page_id: this.page_id
        })
        this.getFilterOnSearch(this.queryBody, true)
        this.updateAllNotice();
    }
    showLoginForm() {
        try {
            showModal({
                component: Auth
            });
        } catch (error) {
            logger.error('showLoginForm On Header' + error)
        }
    }

    connectionChanged = (isConnected) => {
        if (isConnected && this.needToRefresh) {
            this.getDataFromTimeTab(this.state.minDate, this.state.maxDate);
            this.needToRefresh = false;
            this.refreshData('refresh');
        }
    }
    realTimeDataUser(value) {
        if (value.timezone) {
            this.refreshData('refresh')
        }
    }
    componentDidMount() {
        try {
            if (!dataStorage.userInfo) return;
            const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
            this.accountId = dataStorage.account_id;
            addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
            addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
            if (!userId) return;
            registerUser(userId, this.realtimeDataWatchList, 'user_watchlist');
            registerUser(userId, this.realtimeMarkAsRead, 'READNEWS');
            registerUser(userId, this.realTimeDataUser, 'user_setting');
            regisRealtime({ url: getRealtimePriceUrlNew(`news/all`), callback: this.realtimeNews })
        } catch (error) {
            logger.error('componentDidMount On News', error)
        }
    }
    addTotalNewsWhenRealTime = () => {
        const tempTotalCount = this.pageObj && this.pageObj.total_count && this.pageObj.total_count + 1;
        const NEWS_PER_PAGES = 50;
        const totalPages = tempTotalCount % NEWS_PER_PAGES === 0 ? tempTotalCount / NEWS_PER_PAGES : Math.floor(tempTotalCount / NEWS_PER_PAGES) + 1;
        this.pageObj.total_count = tempTotalCount;
        this.pageObj.total_pages = totalPages;
        this.setPage && this.setPage(this.pageObj);
    }

    updateAllNotice() {
        if (!this.listCodeRelated || (this.listCodeRelated && !this.listCodeRelated.length)) {
            dataStorage.numberNoticeNews = 0;
            this.setData([]);
            return;
        }
        if (this.symbolObj.symbol) {
            const check = this.checkListCodeRelated(this.symbolObj.symbol);
            check ? this.getUnreadNews(this.symbolObj.symbol, true, null) : this.setData([]);
            this.getUnreadNews(this.listCodeRelated, null, null, true);
        } else {
            this.getUnreadNews(this.listCodeRelated, true, true);
        }
    }
    realtimeDataWatchList() {
        try {
            this.getAllHoldingVsPersonalWatchlist().then(() => this.getFilterOnSearch());
        } catch (error) {
            logger.log('error realtimeData', error)
        }
    }
    async realtimeNews(obj) {
        try {
            const check = this.checkListCodeRelated(obj.symbol);
            if (!this.isRelated || (this.isRelated && check)) {
                if (this.symbolObj.symbol && this.symbolObj.symbol !== obj.symbol) return;
                let objData;
                if (obj.sign && typeof obj.sign === 'string') {
                    objData = JSON.parse(obj.sign);
                } else {
                    objData = obj.sign;
                }
                if (this.sign === 'PriceSensitive' && objData !== 'PriceSensitive') return;
                if (this.page_id !== 1) return;
                const nowDate = new Date().getDate();
                if (new Date(this.toDate).getDate() !== nowDate) return;
                let symbolObj = dataStorage.symbolsObjDic[obj.symbol]
                const url = makeSymbolUrl(obj.symbol)
                if (!symbolObj) {
                    await getData(url).then(response => {
                        if (response.data && response.data.length) {
                            symbolObj = response.data[0]
                            dataStorage.symbolsObjDic[obj.symbol] = symbolObj
                        }
                    }).catch(error => {
                        logger.log('get symbol info realtime news' + error);
                    })
                }
                if (symbolObj) {
                    obj.class = symbolObj.class || ''
                    obj.country = symbolObj.country || 'au'
                    obj.display_name = symbolObj.display_name || ''
                }
                obj.updated = new Date(obj.updated).getTime();
                obj.updated_time = new Date(obj.updated).getTime();
                this.addOrUpdate(obj);
            }
            if ((this.isRelated && check) ||
                (!this.isRelated && !this.symbolObj.symbol) ||
                (!this.isRelated && obj.symbol === this.symbolObj.symbol)) {
                this.addTotalNewsWhenRealTime();
            }
        } catch (error) {
            logger.error('error realtimeNews', error)
        }
    }

    removeFloating(index) {
        if (!index || index === 1) {
            const datePickerFrom = document.getElementById('datePickerFrom')
            datePickerFrom && this.fromContent && datePickerFrom.contains(this.fromContent) && datePickerFrom.removeChild(this.fromContent);
        }
        if (!index || index === 1) {
            const datePickerTo = document.getElementById('datePickerTo')
            datePickerTo && this.toContent && datePickerTo.contains(this.toContent) && datePickerTo.removeChild(this.toContent);
        }
    }

    componentWillUnmount() {
        try {
            const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
            this.removeFloating()
            removeEventListener(EVENTNAME.clickToRefresh, this.refreshData)
            removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
            if (!userId) return;
            unregisterUser(userId, this.realtimeMarkAsRead, 'READNEWS');
            unregisterUser(userId, this.realtimeDataWatchList, 'user_watchlist');
            unregisterUser(userId, this.realTimeDataUser, 'user_setting');
            unregisRealtime({ callback: this.realtimeNews });
        } catch (error) {
            logger.error('componentWillUnmount On News', error)
        }
    }

    render() {
        try {
            return (
                <div id='newsContainer' className={`newsContainer qe-widget`}>
                    {this.renderHeader()}
                    {this.renderTabbar()}
                    {this.renderContent()}
                    {this.renderPdf()}
                </div>
            );
        } catch (error) {
            logger.error('render On News', error)
        }
    }
}

export default translate('translations')(News);

class TabNews extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isRelated: props.isRelated,
            numberNotice: 0
        }
        this.setNotiCount = this.setNotiCount.bind(this)
        this.props.registerFn && this.props.registerFn(this.setNotiCount)
    }

    onChangeTab(isRelated) {
        this.setState({ isRelated })
        this.props.onChangeTab && this.props.onChangeTab(isRelated)
    }

    setNotiCount(numberNotice) {
        this.setState({ numberNotice })
    }

    render() {
        return <div className='market-news-option'>
            <div className='btnGroup size--3 text-capitalize'>
                <div onClick={() => this.onChangeTab(false)}
                    className={`${!this.state.isRelated ? 'active' : ''}`}><Lang>lang_all_market</Lang>
                </div>
                <div onClick={() => this.onChangeTab(true)}
                    className={this.state.isRelated ? 'active' : ''}><Lang>lang_related_news</Lang>
                    {this.state.numberNotice ? <div className='noticeNews size--2'>{this.state.numberNotice}</div> : null}
                </div>
            </div>
        </div>
    }
}

export class PdfWrapper extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            detail: props.detail
        }
        this.setDetail = this.setDetail.bind(this)
        props.registerFn && props.registerFn(this.setDetail)
    }

    setDetail(detail) {
        this.setState({ detail })
    }

    render() {
        return <Pdf
            pageCount={true}
            data={this.state.detail}
            back={() => this.setState({ detail: null })} />
    }
}
