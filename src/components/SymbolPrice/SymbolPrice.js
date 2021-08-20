import React from 'react';
import uuidv4 from 'uuid/v4';
import {
    formatNumberNew2,
    formatNumberPrice,
    formatNumberValue,
    formatlargeValue,
    checkPropsStateShouldUpdate,
    clone
} from '../../helper/functionUtils';
import { getData, makePriceLevel1UrlNew, makeSymbolUrl } from '../../helper/request';
import AutoSize from '../Inc/AutoSize';
import Lang from '../Inc/Lang';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import Icon from '../Inc/Icon';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'

class SymbolPrice extends React.Component {
    constructor(props) {
        super(props);
        this.isMount = true;
        this.id = uuidv4();
        // this.realtimePrice = this.realtimePrice.bind(this)
        this.changeValue = this.changeValue.bind(this);
        this.state = {
            isConnected: dataStorage.connected,
            trading_halt: false,
            data: {},
            symbolObj: {},
            symbol: props.symbol || '',
            lstData: [],
            disableBtn: true,
            nextSlider: true,
            backSlider: false,
            showName: true,
            display_name: '',
            disableCollapse: this.props.disableCollapse || false
        };
        this.refreshDataAfterLogin = this.refreshDataAfterLogin.bind(this);
        props.resize(() => {
            this.handleResize();
        });
        this.handleResize = this.handleResize.bind(this);
        this.convertDataRender = this.convertDataRender.bind(this);
        if (this.props.refresh) {
            this.props.refresh(this.refreshData.bind(this))
        }
    }

    refreshDataAfterLogin() {
        const obj = {};
        for (var key in this.state.data) {
            if (key !== 'trade_price' && key !== 'bid_price' && key !== 'ask_price') {
                obj[key] = '--';
            } else {
                obj[key] = this.state.data[key];
            }
        }
        const state = this.convertDataRender(obj, true);
        this.setState(state);
    }

    changeValue(symbolObj) {
        try {
            if (this.oldSymbol && (symbolObj.symbol !== this.oldSymbol)) {
                this.symbolChanged = true;
                this.oldSymbol = symbolObj.symbol;
            }
            this.isMount && this.setState({
                trading_halt: symbolObj && symbolObj.trading_halt,
                symbol: symbolObj.symbol || '',
                display_name: symbolObj.display_name || '',
                symbolObj: symbolObj,
                exchange: symbolObj.exchanges[0],
                disableBtn: false
            }, () => {
                this.getDataCompany()
            })
        } catch (error) {
            logger.error('changeValue On CompanyInfo' + error)
        }
    }

    componentWillReceiveProps(nextProps) {
        try {
            if (nextProps.symbolObj === this.state.symbolObj) return;
            this.dataReceivedFromSearchBox(nextProps.symbolObj)
        } catch (error) {
            logger.error('componentWillReceiveProps On DropDown' + error)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (nextState.isHidden) return false;
            if (dataStorage.checkUpdate) {
                const check = checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
                return check;
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On CompanyInfo', error)
        }
    }

    handleSlider(e, action) {
        try {
            if (this.scrolling) return;
            let elements = document.querySelectorAll('#theMostInformation')
            let currentElement
            let i;
            for (i = 0; i < elements.length; i++) {
                if (elements[i].contains(e.target)) {
                    currentElement = elements[i].querySelector('.contentTheMost')
                }
            }
            let colWidth = 38
            let number = Math.floor(currentElement.offsetWidth / colWidth)
            let max = currentElement.scrollWidth - currentElement.clientWidth
            currentElement.temp = colWidth * number / 50;
            i = 0;
            if (action === 'next') {
                (async () => {
                    this.scrolling = true;
                    while (i < 50) {
                        await (new Promise(resolve => {
                            setTimeout(() => {
                                currentElement.scrollLeft += currentElement.temp;
                                i += 1;
                                resolve();
                            }, 1);
                            if (currentElement.scrollLeft === 0) {
                                this.isMount && this.setState({
                                    backSlider: false
                                })
                            } else {
                                this.isMount && this.setState({
                                    backSlider: true
                                })
                            }
                            if (Math.floor(currentElement.scrollLeft) === max || max === -1 || Math.floor(currentElement.scrollLeft) === max + 1) {
                                this.isMount && this.setState({
                                    nextSlider: false
                                })
                            } else {
                                this.isMount && this.setState({
                                    nextSlider: true
                                })
                            }
                        }))
                    }
                    this.scrolling = false;
                })()
            }
            if (action === 'back') {
                (async () => {
                    this.scrolling = true;
                    while (i < 50) {
                        await (new Promise(resolve => {
                            setTimeout(() => {
                                currentElement.scrollLeft -= currentElement.temp;
                                i += 1;
                                resolve();
                            }, 5);
                            if (currentElement.scrollLeft === 0) {
                                this.isMount && this.setState({
                                    backSlider: false
                                })
                            } else {
                                this.isMount && this.setState({
                                    backSlider: true
                                })
                            }
                            if (Math.floor(currentElement.scrollLeft) === max || max === -1 || Math.floor(currentElement.scrollLeft) === max + 1) {
                                this.isMount && this.setState({
                                    nextSlider: false
                                })
                            } else {
                                this.isMount && this.setState({
                                    nextSlider: true
                                })
                            }
                        }))
                    }
                    this.scrolling = false;
                })()
            }
        } catch (error) {
            logger.error('handleSlider On CompanyInfo' + error)
        }
    }

    realtimePrice = (obj) => {
        if (obj && obj.quote) {
            if (!this.state.symbol) return;
            const listData = clone(this.state.data);
            if (obj.depth) {
                const ask = obj.depth.ask[0].number_of_trades
                const bid = obj.depth.bid[0].number_of_trades
                Object.assign(listData, obj.quote, ask, bid);
            } else {
                Object.assign(listData, obj.quote);
            }
            this.setState({
                data: listData
            }, () => this.setData(listData))
        }
    }

    async getDataCompany() {
        try {
            const code = encodeURIComponent(this.state.symbol);
            const obj = {};
            const exchange = this.state.exchange;
            let disableBtn = false;
            if (this.isMount) disableBtn = false;
            if (!code) {
                this.setState({ disableBtn });
                return;
            }
            for (var key in this.state.data) {
                if (key !== 'trade_price' && key !== 'bid_price' && key !== 'ask_price') {
                    obj[key] = '--';
                } else {
                    obj[key] = this.state.data[key];
                }
            }
            const state = this.convertDataRender(obj, true);
            state.disableBtn = disableBtn;
            this.setState(state);
            if (this.symbolChanged) {
                this.dicOld = {
                    trade_price: 'reset',
                    bid_price: 'reset',
                    ask_price: 'reset'
                };
            }
            if (code) {
                const symbolStringUrl = makeSymbolUrl(code);
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
            let urlObj = makePriceLevel1UrlNew(code, exchange);
            const url = urlObj.normal || urlObj.delayed
            if (!url) {
                this.setData({});
                return;
            }
            this.props.loading(true)
            await getData(url)
                .then(response => {
                    this.props.loading(false)
                    const data = (response.data && response.data[0]) || {};
                    if (Object.keys(data).length > 0 && data.depth) {
                        data.quote.ask = Object.keys(data.depth.ask).length ? data.depth.ask[0].number_of_trades : null
                        data.quote.bid = Object.keys(data.depth.bid).length ? data.depth.bid[0].number_of_trades : null
                        this.setData(data.quote)
                    }
                })
                .catch((error) => {
                    this.props.loading(false)
                    logger.error('getDataCompany On CompanyInfo' + error)
                    this.setData([])
                    this.needToRefresh = true
                });
        } catch (error) {
            logger.error('getDataCompany On CompanyInfo' + error)
            this.setData([])
        }
    }

    setData(data) {
        this.data = data;
        if (!this.dicOld || this.symbolChanged) this.dicOld = {};
        const state = this.convertDataRender(data, true);
        this.symbolChanged = false;
        const resize = this.handleResize(true);
        this.setState(Object.assign({}, state, resize));
    }

    refreshData = () => {
        try {
            this.getDataCompany()
        } catch (error) {
            logger.error('refreshData On SymbolPrice' + error)
        }
    }

    priceClass(data, key) {
        if (!data || !Object.keys(data).length) return;
        if (data[key] === '--') {
            this.dicOld[key + '_class'] = 'normalText';
        } else {
            let old = this.dicOld[key];
            this.dicOld[key] = data[key];
            if (data[key] > old) {
                if (this.dicOld[key + '_class'] === 'priceUp flash') this.dicOld[key + '_class'] = 'priceUp flash2';
                else this.dicOld[key + '_class'] = 'priceUp flash';
            } else if (data[key] < old) {
                if (this.dicOld[key + '_class'] === 'priceDown flash') this.dicOld[key + '_class'] = 'priceDown flash2';
                else this.dicOld[key + '_class'] = 'priceDown flash';
            }
            if (this.dicOld[key + '_timeoutId']) clearTimeout(this.dicOld[key + '_timeoutId'])
            this.dicOld[key + '_timeoutId'] = setTimeout(() => {
                if (this.dicOld[key + '_class']) {
                    this.dicOld[key + '_class'] = this.dicOld[key + '_class'].replace(' flash2', '')
                    this.dicOld[key + '_class'] = this.dicOld[key + '_class'].replace(' flash', '')
                }
            }, 300)
        }
        this.oldSymbol = data.symbol;
        let classResult = this.dicOld[key + '_class'] || 'priceUp'
        if (data === {}) {
            classResult = 'normalText'
        }
        if (key === 'ask_price') classResult += ' textRight'
        return classResult;
    }

    checkPriceNullOrZero(price) {
        if (price === null || price === undefined) {
            return '--'
        }
        return price;
    }

    convertDataRender(data = {}, res) {
        try {
            let lstRender = [
                {
                    label: 'lang_last_trade',
                    value: data.trade_price || '--',
                    class: this.priceClass(data, 'trade_price'),
                    format: true,
                    fill: true,
                    decimal: 4
                },
                {
                    label: 'lang_last_qty',
                    value: this.checkPriceNullOrZero(data.trade_size),
                    class: 'normalText',
                    format: true,
                    fill: true
                },
                {
                    label: 'lang_bid',
                    value: data.bid_price || '--',
                    class: this.priceClass(data, 'bid_price'),
                    format: true,
                    fill: true,
                    decimal: 4
                },
                {
                    label: 'lang_offer',
                    value: data.ask_price || '--',
                    class: this.priceClass(data, 'ask_price'),
                    format: true,
                    fill: true,
                    decimal: 4
                },
                {
                    label: 'lang_bid_qty',
                    value: data.bid_size || '--',
                    class: 'normalText',
                    format: true,
                    fill: true
                },
                {
                    label: 'lang_offer_qty',
                    value: data.ask_size || '--',
                    class: 'normalText',
                    format: true
                },
                {
                    label: 'lang_#bid',
                    value: data.bid || '--',
                    class: 'normalText',
                    format: true,
                    decimal: 4,
                    fill: true
                },
                {
                    label: 'lang_#offer',
                    value: data.ask || '--',
                    class: 'normalText',
                    format: true,
                    decimal: 4,
                    fill: true
                },
                {
                    label: 'lang_net_change',
                    value: data.change_point,
                    class: (!data.change_point || (data.change_point === '--')) ? 'normalText' : (data.change_point === 0 ? 'normalText' : (data.change_point > 0 ? 'priceUp' : 'priceDown')),
                    format: true,
                    fill: true,
                    decimal: 4
                },
                {
                    id: '% Change',
                    label: 'lang_change_(%)',
                    value: data.change_percent,
                    class: (!data.change_percent || (data.change_percent === '--')) ? 'normalText' : (data.change_percent === 0 ? 'normalText' : (data.change_percent > 0 ? 'priceUp' : 'priceDown')),
                    format: true,
                    fill: true,
                    decimal: 2
                },
                {
                    label: 'lang_volume',
                    value: data.volume || '--',
                    class: 'normalText',
                    format: true,
                    fill: true,
                    large_value: true
                },
                {
                    label: 'lang_value',
                    value: data.value_traded || '--',
                    class: 'normalText',
                    format: true,
                    fill: true,
                    large_value: true
                },
                {
                    label: 'lang_open',
                    value: data.open,
                    class: 'normalText',
                    format: true,
                    fill: true,
                    decimal: 4
                },
                {
                    label: 'lang_prev_close',
                    value: data.previous_close || '--',
                    class: 'normalText',
                    format: true,
                    fill: true,
                    decimal: 4
                },
                {
                    label: 'lang_high',
                    value: data.high,
                    class: 'normalText',
                    format: true,
                    fill: true,
                    decimal: 4
                },
                {
                    label: 'lang_low',
                    value: data.low,
                    class: 'normalText',
                    format: true,
                    fill: true,
                    decimal: 4
                },
                {
                    label: 'lang_close',
                    value: data.close ? data.close : '--',
                    class: 'normalText',
                    format: true,
                    fill: true,
                    decimal: 4
                },
                {
                    label: 'lang_exchange',
                    value: this.state.symbolObj.display_exchange || data.exchange,
                    class: 'normalText'
                }
            ];
            if (res) {
                return {
                    lstData: lstRender,
                    data: data
                };
            }
            this.setState({
                lstData: lstRender,
                data: data
            });
        } catch (error) {
            logger.error('convertDataRender On CompanyInfo' + error)
        }
    }

    openNewOrder() {
        var newItemConfig = {
            'type': 'component',
            'component': 'NewOrder',
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': 'NewOrder',
            'componentState': { symbol: dataStorage.defaultSymbol || {} }
        };
        let stack = this.props.glContainer.parent.parent.parent.getItemsByType('stack')
        if (!stack.length) {
            this.props.glContainer.parent.parent.parent.addChild(newItemConfig);
        } else {
            let maxH = 0;
            let maxW = 0;
            let stackParent = null;
            for (let i = 0; i < stack.length; i++) {
                const dom = stack[i].element[0];
                if (dom.clientWidth > maxW) {
                    maxW = dom.clientWidth;
                    maxH = dom.clientHeight;
                    stackParent = stack[i];
                } else if (dom.clientWidth === maxW) {
                    if (dom.clientHeight > maxH) {
                        stackParent = stack[i];
                    }
                }
            }
            stackParent.addChild(newItemConfig)
        }
    }

    renderContent(v2) {
        if ((v2.value === null || v2.value === undefined) && v2.label === 'LAST QTY') {
            return '--'
        }
        if (v2.value === 0 && ['Size', 'Volume', 'Close'].indexOf(v2.label) > -1) {
            return '--'
        }
        if (v2.format) {
            if (v2.large_value) {
                return formatlargeValue(v2.value, 2)
            } else {
                return formatNumberNew2(v2.value, v2.decimal, v2.fill)
            }
        } else {
            return v2.value || '--'
        }
    }

    dataReceivedFromSearchBox(symbolObj) {
        try {
            if (!symbolObj.symbol) {
                this.setState({ symbol: '', symbolObj: {} }, () => this.convertDataRender({}))
                return;
            }
            this.setState({
                trading_halt: symbolObj && symbolObj.trading_halt,
                symbol: symbolObj.symbol,
                display_name: symbolObj.display_name,
                symbolObj: symbolObj,
                exchange: symbolObj.exchanges[0]
            })
            if (symbolObj && symbolObj.symbol) {
                this.props.send({
                    symbol: symbolObj,
                    force: true,
                    forceSelfUpdate: !!dataStorage.userInfo
                });
                this.changeValue(symbolObj)
            }
        } catch (error) {
            logger.error('dataReceivedFromSearchBox On CompanyInfo' + error)
        }
    }

    handleResize(res) {
        try {
            const obj = {};
            let currentElement = document.querySelector('#theMostInformation .contentTheMost')
            if (!currentElement) return;
            let max = currentElement.scrollWidth - currentElement.clientWidth
            obj.backSlider = currentElement.scrollLeft !== 0;
            obj.nextSlider = !(Math.floor(currentElement.scrollLeft) === max || max === -1 || Math.floor(currentElement.scrollLeft) === max + 1);
            if (res) return obj;
            this.setState(obj)
        } catch (error) {
            logger.error('handleResize On CompanyInfo' + error)
        }
    }
    setDomPrice(data, symbolChanged) {
        if (this.domPrice) {
            this.value = formatNumberPrice(data.trade_price, true);
            this.domPrice.children[0].innerText = formatNumberPrice(data.trade_price, true);
            if (symbolChanged) {
                this.oldValue = 0;
            }
            let oldValue = this.oldValue;
            if (oldValue !== data.trade_price) {
                if (oldValue === undefined || data.trade_price > oldValue) {
                    this.domPrice.children[0].classList.remove('priceDown');
                    this.domPrice.children[0].classList.add('priceUp');
                } else if (data.trade_price < oldValue) {
                    this.domPrice.children[0].classList.remove('priceUp');
                    this.domPrice.children[0].classList.add('priceDown');
                }
                if (this.domPrice.children[0].classList.contains('flash')) {
                    this.domPrice.children[0].classList.remove('flash');
                    this.domPrice.children[0].classList.add('flash2');
                } else {
                    this.domPrice.children[0].classList.remove('flash2');
                    this.domPrice.children[0].classList.add('flash');
                }
                this.domPrice.children[0].title = data.trade_price;
            }
            this.domPrice.children[0].oldValue = data.trade_price;
            this.oldValue = data.trade_price;
            this.domPrice.children[1].innerText = formatNumberPrice(data.change_point, true);
            if (data.change_point > 0) {
                this.domPrice.children[1].className = 'priceUp';
                if (this.props.tiprank) {
                    this.domPrice.children[1].setAttribute('title', data.change_point);
                } else {
                    this.domPrice.children[1].setAttribute('title', formatNumberPrice(data.change_point, true));
                }
            } else if (data.change_point < 0) {
                this.domPrice.children[1].className = 'priceDown';
                if (this.props.tiprank) {
                    this.domPrice.children[1].setAttribute('title', data.change_point);
                } else {
                    this.domPrice.children[1].setAttribute('title', formatNumberPrice(data.change_point, true));
                }
            } else {
                this.domPrice.children[1].className = '';
            }
            this.domPrice.children[2].innerText = '(' + formatNumberValue(data.change_percent, true) + '%)';
            if (data.change_percent > 0) {
                this.domPrice.children[2].className = 'priceUp';
                if (this.props.tiprank) {
                    this.domPrice.children[2].setAttribute('title', data.change_percent);
                } else {
                    this.domPrice.children[2].setAttribute('title', formatNumberValue(data.change_percent, true) + '%');
                }
            } else if (data.change_percent < 0) {
                this.domPrice.children[2].className = 'priceDown';
                if (this.props.tiprank) {
                    this.domPrice.children[2].setAttribute('title', data.change_percent);
                } else {
                    this.domPrice.children[2].setAttribute('title', formatNumberValue(data.change_percent, true) + '%');
                }
            } else {
                this.domPrice.children[2].className = '';
            }
        }
    }

    expandCompanyInfo() {
        let state = { disableCollapse: !this.state.disableCollapse }
        this.props.saveState && this.props.saveState(state)
        if (this.dom.classList.contains('collapse')) {
            this.dom.classList.remove('collapse');
            this.setState(state)
        } else {
            this.dom.classList.add('collapse');
            this.setState(state)
        }
    }

    renderTabs() {
        return (
            <div className='tabs-view'>
                <div className='tabCenterButton' onClick={() => this.expandCompanyInfo()}>
                    <Icon className={`iconTabCenter ${this.state.disableCollapse ? 'iconTabCenterDisable' : ''}`} src={'av/play-arrow'} />
                </div>
            </div>
        )
    }

    render() {
        try {
            const listData = this.state.lstData;
            return (
                <div className={`securityInfo custome ${this.state.disableCollapse ? 'collapse' : ''}`} ref={dom => this.dom = dom}>
                    <div className='securityCompany'>
                        <div id='theMostInformation' className={'containerTheMost'}>
                            <div id='sliderInfo' className={'sliderInfo'}>
                                <div
                                    className={`backSlider ${this.state.backSlider ? '' : 'end'}`}
                                    onClick={(e) => {
                                        this.handleSlider(e, 'back');
                                    }}
                                />
                                <div className='overlay-left'></div>
                                <div className='contentTheMost'>
                                    {listData.map((v2, k2) => {
                                        return (
                                            <div key={k2} className='itemTheMost'>
                                                <div className='labelitemTM size--3 showTitle'>
                                                    <AutoSize className='size--2 text-capitalize'><Lang>{v2.label}</Lang></AutoSize></div>
                                                <div className='price'>
                                                    <span
                                                        title={`${v2.label !== 'Exchange' ? formatNumberValue(v2.value) : v2.value}`}
                                                        className={` size--4 ${v2.class}`}>
                                                        {this.renderContent(v2)}
                                                        {(v2.id === '% Change' && v2.value !== '--' && v2.value) || (v2.value === 0 && v2.label !== 'lang_net_change' && v2.label !== 'lang_last_qty') ? '%' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className='overlay-right'></div>
                                <div
                                    className={`nextSlider ${this.state.nextSlider ? '' : 'end'}`}
                                    onClick={(e) => {
                                        this.handleSlider(e, 'next');
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    {this.renderTabs()}
                </div>
            );
        } catch (error) {
            logger.error('render On CompanyInfo' + error)
        }
    }

    componentWillUnmount() {
        try {
            this.isMount = false;
            removeEventListener(EVENTNAME.clickToRefresh, this.refreshData)
            removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
            // unregisRealtime({
            //     callback: this.realtimePrice
            // });
        } catch (error) {
            logger.error('componentWillUnmount On CompanyInfo' + error)
        }
    }

    connectionChanged = isConnected => {
        if (isConnected && this.needToRefresh) {
            this.needToRefresh = false;
            this.refreshData()
        }
        if (isConnected !== this.state.isConnected) {
            this.setState({ isConnected })
        }
    }

    componentDidMount() {
        try {
            this.convertDataRender({});
            this.handleResize();
            addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
            addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
        } catch (error) {
            logger.error('componentDidMount On CompanyInfo' + error)
        }
    }
}

export default SymbolPrice
