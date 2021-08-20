import React from 'react';
import SearchBox from '../SearchBox';
import NumberInput from '../Inc/NumberInput';
import s from './BuySellPanel.module.css';
import Lang from './../Inc/Lang';
import { getData, makeSymbolUrl, requirePin } from '../../helper/request';
import logger from '../../helper/log';
import { addPriceListener, removePriceListener } from '../../helper/priceSource';
import { formatNumberPrice, formatNumberVolume } from '../../helper/functionUtils';
import dataStorage from '../../dataStorage';
import Icon from '../Inc/Icon';
class BuySellPanel extends React.Component {
    constructor(props) {
        super(props)
        this.symbolObj = props.data.data || {}
        this.view = {
            volume: 0
        }
    }

    priceChanged = (priceObj) => {
        if (this.priceObj && priceObj.quote) {
            Object.assign(this.priceObj, priceObj.quote);
            this.updatePrice();
        }
    }

    symbolChanged = (symbolObj = {}, isEdit) => {
        try {
            if (isEdit) return;
            removePriceListener(this.priceChanged)
            this.symbolObj = symbolObj
            addPriceListener(this.symbolObj, this.priceChanged)
            this.handleInputPrice(0)
            this.forceUpdate();
        } catch (error) {
            logger.error('dataReceivedFromSearchBox On BuySellPanel ' + error)
        }
    }

    updatePrice = () => {
        if (!this.dom || !this.priceObj) return;
        const buyInfo = this.dom.querySelector('.' + s.buyInfo);
        if (buyInfo) {
            buyInfo.children[0].innerText = formatNumberPrice(this.priceObj.bid_price, true);
            buyInfo.children[1].innerText = '@ ' + formatNumberVolume(this.priceObj.bid_size, true);
        }
        const sellInfo = this.dom.querySelector('.' + s.sellInfo);
        if (sellInfo) {
            sellInfo.children[0].innerText = formatNumberPrice(this.priceObj.ask_price, true);
            sellInfo.children[1].innerText = '@ ' + formatNumberVolume(this.priceObj.ask_size, true);
        }
    }

    handleInputPrice = (value, isEdit) => {
        if (isEdit) return;
        this.view.volume = value
        this.forceUpdate()
    }

    actionNumber = (type) => {
        const first = Number((this.view.volume + '').substr(0, 1))
        const orther = (this.view.volume + '').substr(1)
        if (type === 'plus') {
            const num = (first + 1) + orther.split('').map(() => '0').join('')
            if (num.length < 16) this.view.volume = Number(num)
        } else {
            if (this.view.volume) {
                if (orther > 0) {
                    this.view.volume = Number(first + orther.split('').map(() => '0').join(''))
                } else {
                    if (first === 1 && orther.length) {
                        this.view.volume = Number(9 + orther.substr(1))
                    } else {
                        this.view.volume = Number((first - 1) + orther)
                    }
                }
            }
        }
        dataStorage.orderHandleInputVolume && dataStorage.orderHandleInputVolume(this.view.volume, 'volume');
        this.forceUpdate()
    }
    async getDefaultSymbolInfo() {
        if (!dataStorage.symbolsObjDic['ANZ'] || (dataStorage.symbolsObjDic['ANZ'] && Object.keys(dataStorage.symbolsObjDic['ANZ']).length === 0)) {
            const symbolStringUrl = makeSymbolUrl('ANZ');
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
    }
    getSymbolBuySellPanel = () => {
        return this.symbolObj;
    }
    async componentDidMount() {
        try {
            dataStorage.buySellPanelSymbolChanged = this.symbolChanged;
            dataStorage.buySellPamelHandleInputPrice = this.handleInputPrice;
            dataStorage.getSymbolBuySellPanel = this.getSymbolBuySellPanel;
            await this.getDefaultSymbolInfo();
            if (Object.keys(this.symbolObj).length === 0) {
                if (dataStorage.getSymbolOrderV2) this.symbolObj = (dataStorage.getSymbolOrderV2() || {})
                else this.symbolObj = dataStorage.symbolsObjDic['ANZ']
            }
            this.symbolChanged(this.symbolObj)
        } catch (error) {
            logger.error('componentDidMount On BuySellPanel ' + error)
        }
    }

    componentWillUnmount() {
        try {
            removePriceListener(this.priceChanged)
            delete dataStorage.buySellPanelSymbolChanged;
            delete dataStorage.buySellPamelHandleInputPrice;
            delete dataStorage.getSymbolBuySellPanel;
        } catch (error) {
            logger.error('componentWillUnmount On BuySellPanel ' + error)
        }
    }

    openWidget = (side) => {
        if (dataStorage.orderDirectionChanged) dataStorage.orderDirectionChanged(side)
        else {
            requirePin(() => {
                dataStorage.goldenLayout.addComponentToStack('Order', {
                    stateOrder: 'NewOrder',
                    data: {
                        symbol: this.symbolObj.symbol,
                        symbolObj: this.symbolObj,
                        side: side ? 'BUY' : 'SELL',
                        volume: this.view.volume
                    },
                    color: 5
                })
            })
        }
    }

    render() {
        return (
            <div className={'flex ' + s.boxRight} ref={dom => this.dom = dom}>
                <div className={s.searchBox}>
                    <SearchBox
                        checkNewOrder={true}
                        obj={this.symbolObj}
                        symbol={this.symbolObj.symbol}
                        display_name={this.symbolObj.display_name}
                        allowDelete={true}
                        dataReceivedFromSearchBox={symbolObj => {
                            this.symbolChanged(symbolObj);
                            dataStorage.orderSymbolChanged && dataStorage.orderSymbolChanged(symbolObj, true);
                        }}
                    />
                </div>
                <div className={s.orderButton}>
                    <div className={s.buy} onClick={() => this.openWidget(true)}>
                        <div className={s.textBuy + ' showTitle text-capitalize'}><Lang>lang_buy</Lang></div>
                        <div className={s.buyInfo}><div className='size--3 showTitle'>--</div><div className='size--1 showTitle'>@--</div></div>
                    </div>
                    <div className={s.sell} onClick={() => this.openWidget(false)}>
                        <div className={s.sellInfo}><div className='size--3 showTitle'>--</div><div className='size--1 showTitle'>@--</div></div>
                        <div className={s.textSell + ' showTitle text-capitalize'}><Lang>lang_sell</Lang></div>
                    </div>
                </div>
                <div className='input-group flex'>
                    <div className={`${s.inputNumberWrap} flex`}>
                        <label className={s.labelInput + ' flex'}>{formatNumberVolume(this.view.volume)}</label>
                        <NumberInput
                            className={s.inputNumber}
                            stateName='volume'
                            decimal={0}
                            value={this.view.volume}
                            onChange={(value) => {
                                this.handleInputPrice(value);
                                dataStorage.orderHandleInputVolume && dataStorage.orderHandleInputVolume(value, 'volume', true);
                            }}
                        />
                    </div>
                    <div className={s.caculate + ' flex text-capitalize'}>
                        <span className={`${s.plus} flex text-center showTitle ${this.view.volume === 999999999999999 ? 'panelDisableBtn' : ''} `} onClick={(e) => this.actionNumber('plus')}>
                            <Icon src={'content/add'} style={{ height: '16px', width: '16px' }} />
                            <span style={{ opacity: 0, zIndex: -1, position: 'absolute', width: 0 }}><Lang> lang_plus</Lang> </span>
                        </span>
                        <span className={`${s.minus} flex text-center showTitle ${this.view.volume === 0 ? 'panelDisableBtn' : ''}`} onClick={() => this.actionNumber('minus')}>
                            <Icon src={'content/remove'} style={{ height: '16px', width: '16px' }} />
                            <span style={{ opacity: 0, zIndex: -1, position: 'absolute', width: 0 }}><Lang> lang_minus</Lang> </span>
                        </span>
                    </div>
                </div>
            </div>
        )
    }
}
export default BuySellPanel
