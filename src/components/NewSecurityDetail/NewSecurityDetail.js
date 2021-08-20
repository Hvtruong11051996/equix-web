import React from 'react';
import Lang from '../Inc/Lang';
import ToggleLine from '../Inc/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import SearchBox from '../SearchBox';
import dataStorage from '../../dataStorage';
import {
    makeSymbolUrl,
    getData,
    requirePin,
    makeMarketUrl,
    getCommodityInfoUrl
} from '../../helper/request';
import {
    formatNumberPrice,
    formatNumberVolume,
    formatNumberValue, checkRole
} from '../../helper/functionUtils';
import logger from '../../helper/log';
import s from './SecurityDetail.module.css';
import NoTag from '../Inc/NoTag';
import sideEnum from '../../constants/enum';
import MapRoleComponent from '../../constants/map_role_component';
import moment from 'moment';
import SvgIcon, { path } from '../Inc/SvgIcon';
import { addPriceListener, removePriceListener } from '../../helper/priceSource'
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'

const mappingMonth = {
    1: { number: 1, sign: 'F', shortLabel: 'Jan (F)', longLabel: 'January' },
    2: { number: 2, sign: 'G', shortLabel: 'Feb (G)', longLabel: 'February' },
    3: { number: 3, sign: 'H', shortLabel: 'Mar (H)', longLabel: 'March' },
    4: { number: 4, sign: 'J', shortLabel: 'Apr (J)', longLabel: 'April' },
    5: { number: 5, sign: 'K', shortLabel: 'May (K)', longLabel: 'May' },
    6: { number: 6, sign: 'M', shortLabel: 'Jun (M)', longLabel: 'June' },
    7: { number: 7, sign: 'N', shortLabel: 'Jul (N)', longLabel: 'July' },
    8: { number: 8, sign: 'Q', shortLabel: 'Aug (Q)', longLabel: 'August' },
    9: { number: 9, sign: 'U', shortLabel: 'Sep (U)', longLabel: 'September' },
    10: { number: 10, sign: 'V', shortLabel: 'Oct (V)', longLabel: 'October' },
    11: { number: 11, sign: 'X', shortLabel: 'Nov (X)', longLabel: 'November' },
    12: { number: 12, sign: 'Z', shortLabel: 'Dec (X)', longLabel: 'December' }
}

class SecurityDetail extends React.Component {
    constructor(props) {
        super(props)
        const initState = this.props.loadState();
        this.collapse = initState.collapse ? 1 : 0
        this.isConnected = dataStorage.connected;
        this.view = {}
        this.symbolObj = {};
        this.priceObj = {}
        this.state = {
            symbolObj: {}
        }
        this.initialState = this.props.loadState()
        if (this.initialState && this.initialState.data) {
            this.state.symbolObj = this.initialState.data.symbolObj || {}
        }
        props.receive({ symbol: this.symbolChanged });
    }

    collapseFunc = (collapse) => {
        this.collapse = collapse ? 1 : 0
        this.props.saveState({
            collapse: this.collapse
        })
        this.forceUpdate()
    }

    createagSideButtons = () => {
        return [
            {
                value: 'Favorites',
                className: 'text-normal',
                label: 'lang_add_to_favorities',
                callback: () => this.forceUpdate()
            },
            {
                value: 'YourWatchList',
                className: 'text-normal',
                label: 'lang_add_to_your_watchlist',
                callback: () => this.forceUpdate()
            },
            {
                value: 'NewAlert',
                label: 'lang_new_alert',
                callback: () => dataStorage.goldenLayout.addComponentToStack('NewAlert', {
                    data: {
                        symbolObj: this.symbolObj
                    },
                    color: 5
                })
            },
            {
                value: 'NewOrder',
                label: 'lang_new_order',
                callback: () => requirePin(() => dataStorage.goldenLayout.addComponentToStack('Order',
                    {
                        stateOrder: 'NewOrder',
                        data: {
                            side: sideEnum.BUYSIDE,
                            symbol: this.symbolObj.symbol,
                            symbolObj: this.symbolObj
                        }
                    }
                ))
            }
        ]
    }

    realtimePrice = (obj) => {
        if (this.priceObj && obj && obj.quote) {
            Object.assign(this.priceObj, obj.quote);
            this.updatePrice();
        }
    }

    symbolChanged = async (symbolObj) => {
        if (symbolObj && symbolObj.symbol && !dataStorage.symbolsObjDic[symbolObj.symbol]) {
            // this.props.saveState({
            //     symbolObj: symbolObj
            // })
            const symbolStringUrl = makeSymbolUrl(encodeURIComponent(symbolObj.symbol));
            await getData(symbolStringUrl)
                .then(response => {
                    if (response.data && response.data.length) {
                        for (let i = 0; i < response.data.length; i++) {
                            dataStorage.symbolsObjDic[response.data[i].symbol] = response.data[i]
                        }
                    }
                })
                .catch(error => {
                    logger.log(error)
                })
        }
        if (this.symbolObj.symbol !== symbolObj.symbol) {
            this.props.send({
                symbol: symbolObj
            })
        }
        this.priceObj = {}
        this.updatePrice();
        removePriceListener(this.realtimePrice)
        this.symbolObj = symbolObj
        addPriceListener(this.symbolObj, this.realtimePrice)
        this.props.loading(true)
        if (symbolObj.master_code) this.getMasterCode(symbolObj)
        this.props.loading(false)
        this.forceUpdate()
    }

    getMasterCode = async (symbolObj) => {
        const codeUrl = getCommodityInfoUrl(symbolObj.master_code)
        const masterCodeUrl = makeMarketUrl(`symbol?master_code=${symbolObj.master_code}`);
        try {
            let [parentResponse = {}, childrenResponse = {}] = await Promise.all([
                getData(codeUrl),
                getData(masterCodeUrl)
            ])
            let masterCodeData;
            if (childrenResponse.data && childrenResponse.data.length) {
                const index = childrenResponse.data.findIndex((item) => {
                    return item.code === symbolObj.code
                })
                if (index > -1) {
                    masterCodeData = {
                        ...parentResponse.data[0],
                        ...childrenResponse.data[index]
                    }
                }
            } else {
                masterCodeData = {}
            }
            Object.assign(this.symbolObj, masterCodeData)
            console.log('====', this.symbolObj)
            this.forceUpdate()
        } catch (error) {
            logger.log(`Error while getting code and master code data: ${error}`)
            this.props.loading(false)
        }
    }

    flashPrice = (domElement, field) => {
        domElement.innerText = formatNumberPrice(this.priceObj[field], true);
        if (!this.priceObj[field]) {
            domElement.classList.remove('priceDown');
            domElement.classList.remove('priceUp');
        } else {
            if (this.priceObj[field] === undefined || this.priceObj[field] > 0) {
                domElement.classList.remove('priceDown');
                domElement.classList.add('priceUp');
            } else if (this.priceObj[field] < 0) {
                domElement.classList.remove('priceUp');
                domElement.classList.add('priceDown');
            }
            if (domElement.classList.contains('flash')) {
                domElement.classList.remove('flash');
                domElement.classList.add('flash2');
            } else {
                domElement.classList.remove('flash2');
                domElement.classList.add('flash');
            }
            domElement.title = this.priceObj[field];
        }
    }

    updatePrice = (symbolChanged) => {
        if (!this.dom || !this.priceObj) return;
        if (symbolChanged || !this.priceObjOld) this.priceObjOld = {};
        const domPrice = this.dom.querySelector('.' + s.price);
        const domPercent = this.dom.querySelector('.' + s.percent);
        const changePoint = this.dom.querySelector('.' + s.changePoint);
        const bidPrice = this.dom.querySelector('.bidPrice');
        const askPrice = this.dom.querySelector('.askPrice');

        if (domPrice) {
            domPrice.innerText = formatNumberPrice(this.priceObj.trade_price, true);
            let oldValue = this.priceObjOld.trade_price;
            if (!this.priceObj.trade_price) {
                domPrice.classList.remove('priceDown');
                domPrice.classList.remove('priceUp');
            } else if (oldValue !== this.priceObj.trade_price) {
                if (oldValue === undefined || this.priceObj.trade_price > oldValue) {
                    domPrice.classList.remove('priceDown');
                    domPrice.classList.add('priceUp');
                } else if (this.priceObj.trade_price < oldValue) {
                    domPrice.classList.remove('priceUp');
                    domPrice.classList.add('priceDown');
                }
                if (domPrice.classList.contains('flash')) {
                    domPrice.classList.remove('flash');
                    domPrice.classList.add('flash2');
                } else {
                    domPrice.classList.remove('flash2');
                    domPrice.classList.add('flash');
                }
                domPrice.title = this.priceObj.trade_price;
                this.priceObjOld.trade_price = this.priceObj.trade_price;
            }
        }
        if (changePoint) {
            changePoint.innerText = formatNumberPrice(this.priceObj.change_point, true);
            if (this.priceObj.change_point > 0) {
                changePoint.classList.add('priceUp');
                changePoint.classList.remove('priceDown');
                changePoint.setAttribute('title', formatNumberPrice(this.priceObj.change_point, true));
            } else if (this.priceObj.change_point < 0) {
                changePoint.classList.add('priceDown');
                changePoint.classList.remove('priceUp');
            } else {
                changePoint.classList.remove('priceUp');
                changePoint.classList.remove('priceDown');
            }
            changePoint.title = formatNumberPrice(this.priceObj.change_point, true);
        }
        if (domPercent) {
            domPercent.innerText = '(' + formatNumberValue(this.priceObj.change_percent, true) + '%)';
            if (this.priceObj.change_percent > 0) {
                domPercent.classList.add('priceUp');
                domPercent.classList.remove('priceDown');
                domPercent.setAttribute('title', formatNumberValue(this.priceObj.change_percent, true) + '%');
            } else if (this.priceObj.change_percent < 0) {
                domPercent.classList.add('priceDown');
                domPercent.classList.remove('priceUp');
            } else {
                domPercent.classList.remove('priceUp');
                domPercent.classList.remove('priceDown');
            }
            domPercent.title = formatNumberValue(this.priceObj.change_percent, true) + '%';
        }

        if (bidPrice && this.priceObjOld.bid_price !== this.priceObj.bid_price) {
            this.priceObjOld.bid_price = this.priceObj.bid_price;
            this.flashPrice(bidPrice, 'bid_price')
        }
        if (askPrice && this.priceObjOld.ask_price !== this.priceObj.ask_price) {
            this.priceObjOld.ask_price = this.priceObj.ask_price;
            this.flashPrice(askPrice, 'ask_price')
        }

        if (this.dom.querySelector('.chartDay')) {
            const range = this.priceObj.high - this.priceObj.low;
            const open = (this.priceObj.open - this.priceObj.low) * 100 / range
            const trade = ((this.priceObj.trade_price - this.priceObj.low) * 100 / range) < 0 ? 0 : (this.priceObj.trade_price - this.priceObj.low) * 100 / range
            const min = trade < open ? trade : open
            const max = trade > open ? trade : open
            const fill = this.dom.querySelector('.chartDay .' + s.fill);
            if (fill) {
                fill.style.left = min + '%';
                fill.style.right = (100 - max) + '%';
            }
            const point = this.dom.querySelector('.chartDay .' + s.point);
            if (point) point.style.left = `calc(${trade}% - 3px)`;
            const lim = this.dom.querySelector('.chartDay .' + s.lim);
            if (lim) {
                lim.childNodes[0].innerText = formatNumberValue(this.priceObj.low, true)
                lim.childNodes[1].innerText = formatNumberValue(this.priceObj.high, true)
            }
        }
        this.forceUpdate()
    }

    renderChart = () => {
        if (!this.priceObj) return null;
        const range = this.priceObj.high - this.priceObj.low;
        const open = (this.priceObj.open - this.priceObj.low) * 100 / range
        const trade = ((this.priceObj.trade_price - this.priceObj.low) * 100 / range) < 0 ? 0 : (this.priceObj.trade_price - this.priceObj.low) * 100 / range
        const min = trade < open ? trade : open
        const max = trade > open ? trade : open
        let haveWeekChart = false;
        let weekTrade = 0;
        let weekMin = 0;
        let weekMax = 0;
        if (this.priceObj.fifty_two_week_high && this.priceObj.fifty_two_week_low) {
            let weekHigh = (this.priceObj.fifty_two_week_high || 0)
            let weekLow = (this.priceObj.fifty_two_week_low || 0)
            let weekRange = weekHigh - weekLow;
            let weekOpen = (this.priceObj.open - weekLow) * 100 / weekRange
            weekTrade = (this.priceObj.trade_price - weekLow) * 100 / weekRange
            weekMin = weekTrade < weekOpen ? weekTrade : weekOpen
            weekMax = weekTrade > weekOpen ? weekTrade : weekOpen
            haveWeekChart = true
        }
        return <div>
            <div className={s.title + ' size--4 text-capitalize'}><Lang>lang_day_range</Lang></div>
            <div className={s.chart + ' chartDay'}>
                <div className={s.bar}>
                    <div className={s.fill} style={{ left: min + '%', right: (100 - max) + '%' }}></div>
                    <div className={s.point} style={{ left: `calc(${trade}% - 3px)` }}></div>
                </div>
                <div className={s.lim}>
                    <div>{formatNumberPrice(this.priceObj.low, true)}</div>
                    <div>{formatNumberPrice(this.priceObj.high, true)}</div>
                </div>
            </div>
            {
                this.isFutureSymbol()
                    ? <div>
                        <div className={s.title + ' size--4'}><Lang>lang_52_week_range</Lang></div>
                        {haveWeekChart
                            ? <div className={s.chart}>
                                <div className={s.bar}>
                                    <div className={s.fill} style={{ left: weekMin + '%', right: (100 - weekMax) + '%' }}></div>
                                    <div className={s.point} style={{ left: `calc(${weekTrade}% - 3px)` }}></div>
                                </div>
                                <div className={s.lim}>
                                    <div>{formatNumberPrice(this.priceObj.fifty_two_week_low, true)}</div>
                                    <div>{formatNumberPrice(this.priceObj.fifty_two_week_high, true)}</div>
                                </div>
                            </div>
                            : null
                        }
                        <div className={s.title + ' size--4 text-capitalize'}><Lang>lang_calendar_year_range</Lang></div>
                    </div> : null
            }
        </div>
    }

    changeConnection = (isConnected) => {
        if (!isConnected !== !this.isConnected) {
            this.isConnected = isConnected;
            this.forceUpdate()
        }
    }

    isFutureSymbol = () => {
        try {
            if (!this.symbolObj.class) return false;
            if ((this.symbolObj.class + '').toLowerCase() !== 'future') return false
            return true;
        } catch (error) {
            logger.log(`Error while checking whether symbol is future symbol: ${error}`)
            return false;
        }
    }

    componentDidMount() {
        addEventListener(EVENTNAME.connectionChanged, this.changeConnection);
    }

    componentWillUnmount() {
        removeEventListener(EVENTNAME.connectionChanged, this.changeConnection);
        removePriceListener(this.realtimePrice)
    }

    render() {
        return (
            <div className='qe-widget' ref={dom => this.dom = dom}>
                <div className={`header-wrap isMoreOption flex ${this.collapse ? 'collapse' : ''}`}>
                    <div className='navbar'>
                        <div className={s.searchBox + (this.view.searchingSymbol || !this.symbolObj.symbol ? ' ' + s.searching : '')}>
                            <div className={s.symbolSearchBox}>
                                <SearchBox
                                    dataReceivedFromSearchBox={(symObj) => {
                                        this.symbolChanged(symObj);
                                    }}
                                    placeholder='lang_search_symbol'
                                    obj={this.symbolObj}
                                    isNewVersion={true}
                                />
                            </div>
                        </div>
                    </div>
                    <MoreOption symbolObj={this.symbolObj} agSideButtons={this.createagSideButtons()} callback={() => this.forceUpdate()} />
                </div>
                <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />

                <section>
                    <p className='size--7 showTitle'>{(this.symbolObj && this.symbolObj.display_name) || '--'}</p>
                    <p className='size--4' style={{ marginTop: '8px' }}>
                        <span className={s.value + ' ' + s.price}>--</span>&nbsp;&nbsp;
                        <span className={s.changePoint}>--</span>&nbsp;<span className={s.percent}>(--)</span>
                    </p>
                </section>
                <section className={s.grButton}>
                    <div className={s.button}>
                        <div className={s.buttonItem + ' showTitle' + (!checkRole(MapRoleComponent.MarketDepth) || !this.isConnected ? ' disabled' : '')} onClick={() => {
                            if (!checkRole(MapRoleComponent.MarketDepth) || !this.isConnected) return;
                            dataStorage.goldenLayout.addComponentToStack('MarketDepth');
                        }}>
                            <SvgIcon path={path.mdiChartGantt} />
                            <span className='size--3'>Market Depth</span>
                        </div>
                    </div>
                    <div className={s.button}>
                        {
                            this.isFutureSymbol() && dataStorage.env_config.roles.viewContractList
                                ? <div className={s.buttonItem + ' showTitle' + (!checkRole(MapRoleComponent.ContractList) || !this.isConnected ? ' disabled' : '')} onClick={() => {
                                    if (!checkRole(MapRoleComponent.ContractList) || !this.isConnected) return
                                    dataStorage.goldenLayout.addComponentToStack('ContractList', { openFromMenu: true })
                                }}>
                                    <SvgIcon path={path.contractList} />
                                    <span className='size--3'>Contract List</span>
                                </div>
                                : null
                        }
                    </div>
                    <div className={s.button}>
                        <div className={s.buttonItem + ' showTitle' + (!checkRole(MapRoleComponent.CourseOfSale) || !this.isConnected ? ' disabled' : '')} onClick={() => {
                            if (!checkRole(MapRoleComponent.CourseOfSale) || !this.isConnected) return
                            dataStorage.goldenLayout.addComponentToStack('CourseOfSale', { openFromMenu: true })
                        }}>
                            <SvgIcon path={path.cos} />
                            <span className='size--3'>Course of Sales</span>
                        </div>
                    </div>
                </section>
                <div className='container' style={{ flex: 1, overflow: 'auto' }}>
                    <div>
                        <section className={s.securityInfo + ' ' + 'text-capitalize'}>
                            <div className={s.title + ' size--4'}><Lang>lang_security_infomation</Lang></div>
                            <div className={s.rowWrap}>
                                <div className={s.row}>
                                    <div className={s.boxLeft}>
                                        <p className={`size--3`}><Lang>lang_bid</Lang> / <Lang>lang_bid_qty</Lang></p>
                                        <span className='bidPrice'>--</span><span className={s.slash}>/</span><span className={s.value}>{formatNumberVolume(this.priceObj.bid_size)}</span>
                                    </div>
                                    <div className={s.boxRight}>
                                        <p className={`size--3`}><Lang>lang_offer_qty</Lang> / <Lang>lang_offer</Lang></p>
                                        <span className={s.value}>{formatNumberVolume(this.priceObj.ask_size)}</span><span className={s.slash}>/</span><span className={`askPrice`}>--</span>
                                    </div>
                                </div>
                                <div className={s.row}>
                                    <div className={s.boxLeft}>
                                        <p className={`size--3`}><Lang>lang_open</Lang></p>
                                        <span className={s.value}>{formatNumberPrice(this.priceObj.open, true) || '-'}</span>
                                    </div>
                                    <div className={s.boxRight}>
                                        <p className={`size--3`}><Lang>lang_today_volume</Lang></p>
                                        <span className={s.value}>{formatNumberVolume(this.priceObj.volume) || '-'}</span>
                                    </div>
                                </div>
                                {
                                    !this.isFutureSymbol()
                                        ? <div className={s.row}>
                                            <div className={s.boxLeft}>
                                                <p className={`size--3`}><Lang>lang_prev_close</Lang></p>
                                                <span className={s.value}>{formatNumberPrice(this.priceObj.previous_close, true)}</span>
                                            </div>
                                            <div className={s.boxRight}>
                                                <p className={`size--3`}><Lang>lang_yesterday_volume</Lang></p>
                                                <span className={s.value}>{formatNumberVolume(this.priceObj.previous_day_volume)}</span>
                                            </div>
                                        </div>
                                        : <NoTag>
                                            <div className={s.row}>
                                                <div className={s.boxLeft}>
                                                    <p className={`size--3`}><Lang>lang_yesterday_settlement_price</Lang></p>
                                                    <span className={s.value}>{this.priceObj.yesterday_settlement}</span>
                                                </div>
                                                <div className={s.boxRight}>
                                                    <p className={`size--3`}><Lang>lang_yesterday_volume</Lang></p>
                                                    <span className={s.value}>{formatNumberVolume(this.priceObj.previous_day_volume)}</span>
                                                </div>
                                            </div>
                                            <div className={s.row}>
                                                <div className={s.boxLeft}>
                                                    <p className={`size--3`}><Lang>lang_settlement_price</Lang></p>
                                                    <span className={s.value}>{formatNumberPrice(this.priceObj.cash_settlement_price, true) || '-'}</span>
                                                </div>
                                                <div className={s.boxRight}>
                                                    <p className={`size--3`}><Lang>lang_average_volume</Lang></p>
                                                    <span className={s.value}>{formatNumberVolume(this.priceObj.volume)}</span>
                                                </div>
                                            </div>
                                        </NoTag>
                                }
                                {
                                    !this.isFutureSymbol()
                                        ? null
                                        : <NoTag>
                                            <div className={s.lineDotted}></div>
                                            <div className={s.row + ' ' + 'text-capitalize'}>
                                                <div className={s.boxLeft}>
                                                    <p className={`size--3`}><Lang>lang_master_symbol</Lang></p>
                                                    <span className={s.value}>{this.symbolObj.display_master_code || '-'}</span>
                                                </div>
                                                <div className={s.boxRight}>
                                                    <p className={`size--3`}><Lang>lang_master_symbol_name</Lang></p>
                                                    <span className={s.value}>{this.symbolObj.display_master_name || '-'}</span>
                                                </div>
                                            </div>
                                            <div className={s.row + ' ' + 'text-capitalize'}>
                                                <div className={s.boxLeft}>
                                                    <p className={`size--3`}><Lang>lang_contract_month</Lang></p>
                                                    <span className={s.value}>{this.symbolObj.contract_months || '-'}</span>
                                                </div>
                                                <div className={s.boxRight}>
                                                    <p className={`size--3`}><Lang>lang_contract_size_units</Lang></p>
                                                    <span className={s.value}>{formatNumberVolume(this.symbolObj.contract_size) + ' (Pounds)'}</span>
                                                </div>
                                            </div>
                                            <div className={s.row + ' ' + 'text-capitalize'}>
                                                <div className={s.boxLeft}>
                                                    <p className={`size--3`}><Lang>lang_tick_size</Lang></p>
                                                    <span className={s.value}>{this.priceObj.tick || '-'}</span>
                                                </div>
                                                <div className={s.boxRight}>
                                                    <p className={`size--3`}><Lang>lang_minimum_price_fluctuation</Lang></p>
                                                    <span className={s.value}>{this.symbolObj.min_price_movement || '-'}</span>
                                                </div>
                                            </div>
                                            <div className={s.row + ' ' + 'text-capitalize'}>
                                                <div className={s.boxLeft}>
                                                    <p className={`size--3`}><Lang>lang_settlement_date</Lang></p>
                                                    <span className={s.value}>{this.symbolObj.settlement_day ? moment(this.symbolObj.settlement_day).format('DD/MM/YYYY') : '-'}</span>
                                                </div>
                                                <div className={s.boxRight}>
                                                    <p className={`size--3`}><Lang>lang_expiration_date</Lang></p>
                                                    <span className={s.value}>{moment(this.symbolObj.expiry_date).format('DD/MM/YYYY') || '-'}</span>
                                                </div>
                                            </div>
                                            <div className={s.row + ' ' + 'text-capitalize'}>
                                                <div className={s.boxLeft}>
                                                    <p className={`size--3`}><Lang>lang_time_zone</Lang></p>
                                                    <span className={s.value}>{this.symbolObj.trading_hours || '-'}</span>
                                                </div>
                                                <div className={s.boxRight}>
                                                    <p className={`size--3 text-capitalize`}><Lang>lang_trading_hours</Lang></p>
                                                    <span className={s.value}>{this.symbolObj.trading_hours || '-'}</span>
                                                </div>
                                            </div>
                                        </NoTag>
                                }
                            </div>
                        </section>
                        {
                            this.symbolObj.list_contract && this.symbolObj.list_contract.length
                                ? <section className={s.lstContact}>
                                    <p className={`size--4 text-capitalize`}><Lang>lang_list_contact</Lang></p>
                                    <br></br>
                                    <div>
                                        {
                                            this.symbolObj.list_contract && this.symbolObj.list_contract.map((item, key) => {
                                                return <label key={key} className='tag bg-primary showTitle'>{(mappingMonth[item] || {}).shortLabel}</label>
                                            })
                                        }
                                    </div>
                                </section>
                                : null
                        }
                        <section className=''>
                            {this.renderChart()}
                        </section>
                    </div>
                </div>
            </div>
        )
    }
}

export default SecurityDetail;
