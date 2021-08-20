import React from 'react';
import Lang from '../Inc/Lang';
import ToggleLine from '../Inc/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import SearchBox from '../SearchBox';
import { emitter, eventEmitter } from '../../constants/emitter_enum';
import dataStorage from '../../dataStorage';
import {
    makeSymbolUrl,
    getData,
    requirePin
} from '../../helper/request';
import {
    formatNumberPrice,
    formatNumberVolume
} from '../../helper/functionUtils';
import { func } from '../../storage';
import logger from '../../helper/log';
import s from './MarketDepth.module.css';
import sideEnum from '../../constants/enum';
import MapRoleComponent from '../../constants/map_role_component';
import Grid from '../Inc/CanvasGrid';
import Price from '../FlashingPriceHeader'
import { addPriceListener, removePriceListener } from '../../helper/priceSource';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';

class MarketDepth extends React.Component {
    constructor(props) {
        super(props)
        const initState = this.props.loadState();
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.collapse = initState.collapse ? 1 : 0
        this.isConnected = dataStorage.connected;
        this.view = {}
        this.isFirst = true
        this.symbolObj = {};
        this.priceObj = {}
        this.state = {
            symbolObj: {},
            cumulative: initState.cumulative,
            horizontal: initState.horizontal
        }
        if (initState && initState.data) {
            this.state.symbolObj = initState.data.symbolObj || {}
        }
        props.receive({ symbol: this.symbolChanged });
        props.resize(() => {
            this.autoSize && this.autoSize();
        });
        this.cumulative = true;
        this.horizontal = true;

        this.columns = [
            {
                header: 'lang_button',
                name: 'quantity',
                type: TYPE.DEPTH_BG,
                float: true,
                under: true,
                getIndicator: this.getIndicator
            },
            {
                header: 'lang_bid_offer',
                name: 'price',
                suppressFilter: true,
                suppressSort: true,
                getTextColorKey: () => {
                    return '--color-highlight'
                },
                formater: (params) => {
                    return formatNumberPrice(params.data.price, true)
                }
            },
            {
                header: 'lang_quantity',
                name: 'quantity',
                align: 'center',
                suppressFilter: true,
                suppressSort: true,
                formater: (params) => {
                    return formatNumberVolume(params.data.quantity, true)
                }
            },
            {
                header: 'lang_count',
                name: 'number_of_trades',
                align: 'center',
                suppressSort: true,
                colorHighLight: true
            },
            {
                header: 'lang_buy_sell',
                name: 'buy',
                align: 'center',
                suppressFilter: true,
                suppressSort: true,
                hide: true
            },
            {
                header: 'lang_position',
                name: 'position',
                align: 'center',
                suppressFilter: true,
                suppressSort: true,
                hide: true
            },
            {
                header: 'lang_button',
                name: 'button',
                type: TYPE.QUICK_BUY_SELL,
                float: true,
                role: MapRoleComponent.NEW_ORDER
            }
        ]
        this.columnBid = [
            {
                header: 'lang_button',
                name: 'quantity',
                type: TYPE.DEPTH_BG,
                float: true,
                right: true,
                under: true,
                getIndicator: this.getIndicator
            },
            {
                header: 'lang_count',
                name: 'number_of_trades',
                align: 'center',
                suppressSort: true,
                colorHighLight: true
            },
            {
                header: 'lang_quantity',
                name: 'quantity',
                align: 'center',
                suppressFilter: true,
                suppressSort: true,
                formater: (params) => {
                    return formatNumberVolume(params.data.quantity, true)
                }
            },
            {
                header: 'lang_bid',
                name: 'price',
                align: 'center',
                suppressFilter: true,
                suppressSort: true,
                getTextColorKey: () => {
                    return '--color-highlight'
                },
                formater: (params) => {
                    return formatNumberPrice(params.data.price, true)
                }
            },
            {
                header: 'lang_button',
                name: 'button',
                type: TYPE.QUICK_BUY_SELL,
                float: true,
                role: MapRoleComponent.NEW_ORDER
            }
        ]
        this.columnAsk = [
            {
                header: 'lang_button',
                name: 'quantity',
                type: TYPE.DEPTH_BG,
                float: true,
                under: true,
                getIndicator: this.getIndicator
            },
            {
                header: 'lang_ask',
                name: 'price',
                align: 'center',
                suppressFilter: true,
                suppressSort: true,
                getTextColorKey: () => {
                    return '--color-highlight'
                },
                formater: (params) => {
                    return formatNumberPrice(params.data.price, true)
                }
            },
            {
                header: 'lang_quantity',
                name: 'quantity',
                align: 'center',
                suppressFilter: true,
                suppressSort: true,
                formater: (params) => {
                    return formatNumberVolume(params.data.quantity, true)
                }
            },
            {
                header: 'lang_count',
                name: 'number_of_trades',
                align: 'center',
                suppressSort: true,
                colorHighLight: true
            },
            {
                header: 'lang_button',
                name: 'button',
                type: TYPE.QUICK_BUY_SELL,
                float: true,
                right: true,
                role: MapRoleComponent.NEW_ORDER
            }
        ]
    }

    getIndicator = () => {
        return this.indicator;
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
                label: 'lang_add_to_favorities',
                className: 'text-normal',
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
                            symbol: this.symbolObj.symbol
                        }
                    }
                ))
            },
            {
                value: 'marketHorizontal',
                label: 'lang_vertical_layout',
                state: this.state.horizontal,
                callback: () => {
                    this.setState({ horizontal: !this.state.horizontal }, () => {
                        this.props.saveState({
                            horizontal: this.horizontal
                        })
                        this.mapDataDepth();
                    })
                }
            },
            {
                value: 'marketCumulative',
                label: 'lang_cumulative',
                state: this.state.cumulative,
                callback: () => {
                    this.setState({ cumulative: !this.state.cumulative }, () => {
                        this.props.saveState({
                            cumulative: this.cumulative
                        })
                        this.mapDataDepth();
                    })
                }
            }
        ]
    }

    priceChanged = (obj) => {
        if (!obj) {
            this.priceObj = {}
            if (this.state.horizontal) {
                this.setData1([])
                this.setData2([])
            } else this.setData([])
            this.forceUpdate()
            return
        }
        if (obj.quote) {
            let check = 0
            if ((obj.quote.surplus_volume !== '--' || obj.quote.auction_volume !== '--' || obj.quote.indicative_price !== '--') && (this.priceObj.surplus_volume !== obj.quote.surplus_volume || this.priceObj.auction_volume !== obj.quote.auction_volume || this.priceObj.indicative_price !== obj.quote.indicative_price)) check = 1
            if (obj.quote.surplus_volume === '--') delete obj.quote.surplus_volume
            if (obj.quote.auction_volume === '--') delete obj.quote.auction_volume
            if (obj.quote.indicative_price === '--') delete obj.quote.indicative_price
            // if (!obj.quote.trade_price) obj.quote.trade_price = null
            Object.assign(this.priceObj, obj.quote)
            if (check) this.forceUpdate()
        }
        if (obj.hasOwnProperty('depth')) this.mapDataDepth(obj.depth)
    }

    mapDataDepth = (data) => {
        if (this.isFirst) {
            this.isFirst = false
            if (!data) {
                if (this.state.horizontal) {
                    this.setState({ horizontal: false }, () => {
                        this.setData([])
                    })
                } else this.setData([])
                return
            }
        }
        if (data) this.data = data
        if (!this.data) return;
        const arrAsk = []
        const arrBid = []
        let max, sum
        this.indicator = {
            bid: {},
            ask: {}
        }
        const sortFn = (a, b, desc) => {
            return desc ? b.price - a.price : a.price - b.price
        }
        if (this.state.cumulative) {
            max = 0
            Object.values(this.data.ask || {}).sort((a, b) => sortFn(a, b)).map(price => {
                max += price.quantity;
                arrAsk.push(price)
            })
            sum = 0
            arrAsk.forEach((price, i) => {
                sum += price.quantity
                this.indicator.ask[i] = sum === max ? 1 : sum / max;
            })
            max = 0
            Object.values(this.data.bid || {}).sort((a, b) => sortFn(a, b, this.state.horizontal)).map(price => {
                max += price.quantity;
                arrBid.push(price)
            })
            if (this.state.horizontal) {
                sum = 0
                arrBid.forEach((price, i) => {
                    sum += price.quantity
                    this.indicator.bid[i] = sum === max ? 1 : sum / max;
                })
            } else {
                sum = max
                arrBid.forEach((price, i) => {
                    this.indicator.bid[i + arrAsk.length] = sum === max ? 1 : sum / max;
                    sum -= price.quantity
                })
            }
        } else {
            max = 0;
            Object.values(this.data.bid || {}).sort((a, b) => sortFn(a, b, this.state.horizontal)).map(price => {
                arrBid.push(price)
                if (price.quantity > max) max = price.quantity
            });
            Object.values(this.data.ask || {}).sort((a, b) => sortFn(a, b)).map(price => {
                arrAsk.push(price)
                if (price.quantity > max) max = price.quantity
            });
            arrAsk.forEach((price, i) => {
                this.indicator.ask[i] = price.quantity === max ? 1 : price.quantity / max;
            })
            arrBid.forEach((price, i) => {
                this.indicator.bid[this.state.horizontal ? i : i + arrAsk.length] = price.quantity === max ? 1 : price.quantity / max;
            })
        }
        if (this.state.horizontal) {
            this.setData1(arrBid)
            this.setData2(arrAsk)
        } else this.setData(arrAsk.concat(arrBid))
    }

    symbolChanged = (symbolObj) => {
        if (symbolObj && symbolObj.symbol && !dataStorage.symbolsObjDic[symbolObj.symbol]) {
            const symbolStringUrl = makeSymbolUrl(encodeURIComponent(symbolObj.symbol));
            getData(symbolStringUrl)
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
            removePriceListener(this.priceChanged);
            this.isFirst = true
            addPriceListener(symbolObj, this.priceChanged);
        }
        this.priceObj = {}
        if (this.state.horizontal) {
            this.setData1([])
            this.setData2([])
        } else this.setData([])
        this.symbolObj = symbolObj
        dataStorage.symbolObjDepth = symbolObj
        this.forceUpdate()
    }

    changeConnection(isConnected) {
        if (!isConnected !== !this.isConnected) {
            this.isConnected = isConnected;
            this.forceUpdate()
        }
    }

    componentDidMount() {
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
        // registerAllOrders(this.realtimePrice, 'portfolio')
    }

    componentWillUnmount() {
        try {
            removePriceListener(this.priceChanged);
            this.emitConnectionID && this.emitConnectionID.remove();
            // unregisterAllOrders(this.realtimePrice, 'portfolio')
        } catch (error) {
            logger.error('componentWillUnmount On MarketDepth' + error)
        }
    }

    render() {
        return (
            <div className='qe-widget' ref={dom => this.dom = dom}>
                <div className={`header-wrap isMoreOption flex ${this.collapse ? 'collapse' : ''}`} style={{ padding: 0 }}>
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
                <div className={`header-wrap flex ${this.collapse ? 'collapse' : ''}`} style={{ padding: '8px 0' }}>
                    <div className='navbar'>
                        {
                            !this.collapse
                                ? <section>
                                    <p className='size--7 showTitle' style={{ marginBottom: '8px' }}>{(this.symbolObj && this.symbolObj.display_name) || '--'}</p>

                                    <Price size='size--4' field='trade_price' priceObj={this.priceObj || {}} symbolObj={this.symbolObj} />
                                    <Price size='size--4' field='change_point' priceObj={this.priceObj || {}} />
                                    <Price size='size--4' field='change_percent' priceObj={this.priceObj || {}} />
                                </section>
                                : null
                        }
                    </div>
                </div>
                {
                    this.priceObj.indicative_price || this.priceObj.auction_volume || this.priceObj.surplus_volume
                        ? <div className={`header-wrap flex ${this.collapse ? 'collapse' : ''}`} style={{ paddingBottom: 0 }}>
                            <div className='width100'>
                                <div className={s.lineSolid}></div>
                                <section className={s.futurePrice}>
                                    <div className={s.row}>
                                        <div className={s.boxLeft}>
                                            <p className={`size--3 showTitle text-capitalize`}><Lang>lang_indicative_price</Lang></p>
                                            <p className={`size--3 showTitle`}><span>{formatNumberPrice(this.priceObj.indicative_price, true)}</span></p>
                                        </div>
                                        <div className={s.boxRight}>
                                            <p className={`size--3 showTitle`}><Lang>lang_auction_volume_surplus_volume</Lang></p>
                                            <p className={`size--3 showTitle`}>
                                                <span>{formatNumberVolume(this.priceObj.auction_volume)}</span><span className={s.slash}>/</span>
                                                <span>{formatNumberVolume(this.priceObj.surplus_volume)}</span>
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                        : null
                }
                <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
                {this.state.horizontal
                    ? <div className='container' style={{ display: 'flex', flex: 1 }}>
                        <div style={{ flex: 1 }}>
                            <Grid
                                id={FORM.MARKET_DEPTH}
                                widgetName='MarketDepth'
                                {...this.props}
                                fn={fn => {
                                    this.setData1 = fn.setData
                                    this.getData1 = fn.getData
                                    this.autoSize1 = fn.autoSize
                                }}
                                columns={this.columnBid}
                                sort={{
                                    index: 'desc'
                                }}
                                autoFit={true}
                                suppressReszieColumn={true}
                                onlySystem={true}
                                suppressSelectRow={true}
                                showProvider={true}
                                providerHalfLeft={true}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Grid
                                showProvider={true}
                                providerHalfRight={true}
                                id={FORM.MARKET_DEPTH}
                                widgetName='MarketDepth'
                                {...this.props}
                                fn={fn => {
                                    this.setData2 = fn.setData
                                    this.getData2 = fn.getData
                                    this.autoSize2 = fn.autoSize
                                }}
                                columns={this.columnAsk}
                                sort={{
                                    index: 'asc'
                                }}
                                autoFit={true}
                                suppressReszieColumn={true}
                                onlySystem={true}
                                suppressSelectRow={true}
                            />
                        </div>
                    </div>
                    : <div className='container' style={{ flex: 1 }}>
                        <Grid
                            showProvider={true}
                            id={FORM.MARKET_DEPTH}
                            widgetName='MarketDepth'
                            {...this.props}
                            fn={fn => {
                                this.setData = fn.setData
                                this.getData = fn.getData
                                this.autoSize = fn.autoSize
                            }}
                            columns={this.columns}
                            sort={{
                                index: 'asc'
                            }}
                            autoFit={true}
                            suppressReszieColumn={true}
                            onlySystem={true}
                            suppressSelectRow={true}
                        />
                    </div>
                }
            </div >
        )
    }
}

export default MarketDepth;
