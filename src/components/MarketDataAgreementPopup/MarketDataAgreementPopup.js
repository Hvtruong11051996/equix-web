import React from 'react';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import { translate } from 'react-i18next';
import Icon from '../Inc/Icon';
import Lang from '../Inc/Lang';
import uuidv4 from 'uuid/v4';
import { func } from '../../storage';
import { emitter, eventEmitter } from '../../constants/emitter_enum';
import { getUserDetailUrl, postData } from '../../helper/request';
import Checkbox from '../Elements/Checkbox/Checkbox';

const EXCHANGE = {
    ASX: 'asx',
    CHI_X: 'chi-x',
    CME: 'cme',
    HKEX: 'hkex',
    ICE_EU: 'ice_eu',
    ICE_SG: 'ice_sg',
    ICE_US: 'ice_us',
    ICE_EU_AGRICULTURE: 'ice_eu_agriculture',
    ICELIFFE: 'ice-liffe',
    LME: 'lme',
    SGX: 'sgx',
    SSX: 'ssx'
}
class MarketDataAgreementPopup extends React.Component {
    constructor(props) {
        super(props);
        const { i18n } = props;
        this.id = uuidv4();
        this.user_id = dataStorage.userInfo.user_id
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION)
        i18n.on('languageChanged', this.languageChanged.bind(this));
        this.state = {
            isConnected: dataStorage.connected
        }
    }

    languageChanged() {
        this.render()
    }

    changeConnection(isConnected) {
        if (isConnected !== this.state.isConnected) {
            this.setState({ isConnected })
        }
    }

    noAccess = () => {
        if (!this.state.isConnected) return
        const data = [{
            user_id: this.user_id,
            exchange: this.props.data.data.exchange,
            accept: false
        }]
        const url = getUserDetailUrl(`market-data/agreement`);
        postData(url, data).then(res => {
            console.log('post success')
        }).catch(e => {
            console.log('post error', e)
        })
        dataStorage.marketDataTypeCb[this.props.data.data.exchange] && dataStorage.marketDataTypeCb[this.props.data.data.exchange]()
        delete dataStorage.marketDataTypeCb[this.props.data.data.exchange]
    }

    accessButton() {
        try {
            if (this.inputValue && this.state.isConnected) {
                const data = [{
                    user_id: this.user_id,
                    exchange: this.props.data.data.exchange,
                    accept: true
                }]
                const url = getUserDetailUrl(`market-data/agreement`);
                postData(url, data).then(res => {
                    console.log('post success')
                    dataStorage.receiveOrderPad && dataStorage.receiveOrderPad()
                    const lst = dataStorage.goldenLayout.goldenLayout && dataStorage.goldenLayout.goldenLayout.root.getItemsByType('component');
                    if (lst && lst.length) {
                        for (let i = 0; i < lst.length; i++) {
                            const data = lst[i].element[0].react && lst[i].element[0].react.props.glContainer.getState()
                            if ((data && data.symbol && data.symbol.exchanges[0] === this.props.data.data.exchange) || (lst[i].element[0].react.props.glContainer._config.title === 'Watchlist')) {
                                lst[i].element[0].react && lst[i].element[0].react.broadcast && lst[i].element[0].react.broadcast(data, 'force')
                            }
                        }
                    }
                }).catch(e => {
                    console.log('post error', emitter)
                })
                dataStorage.marketDataTypeCb[this.props.data.data.exchange]()
                delete dataStorage.marketDataTypeCb[this.props.data.data.exchange]
            }
        } catch (error) {
            logger.error('accessButton On MarketDataAgreementPopup' + error)
        }
    }

    componentDidMount() {
        dataStorage.marketDataTypeCb[this.props.data.data.exchange] = this.props.close
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
        this.readFileTerms(this.props.data.data.display_exchange, this.dom)
    }

    componentWillUnmount() {
        this.emitConnectionID && this.emitConnectionID.remove();
    }
    readFileTerms(file, dom) {
        const type = file.toLowerCase()
        if ([EXCHANGE.ASX, EXCHANGE.CHI_X, EXCHANGE.CME, EXCHANGE.HKEX, EXCHANGE.ICE_EU, EXCHANGE.ICE_SG, EXCHANGE.ICE_US, EXCHANGE.ICE_EU_AGRICULTURE, EXCHANGE.LME, EXCHANGE.SGX, EXCHANGE.SSX].includes(type)) {
            const filePath = `https://equix-static-assets.web.app/market-data-agreement/${type}/MarketDataAgreement.md`
            fetch(filePath).then(response => {
                const reader = response.body.getReader();
                return new ReadableStream({
                    start(controller) {
                        function push() {
                            reader.read().then(({ done, value }) => {
                                if (done) {
                                    controller.close();
                                    return;
                                }
                                controller.enqueue(value);
                                push();
                            })
                        }
                        push();
                    }
                });
            }).then(stream => {
                return new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text();
            }).then(result => {
                dom.innerHTML = marked(result)
            });
        }
    }

    render() {
        try {
            return (
                <div className={`marketDataAgreement popUpLogout`}>
                    <div className='container'>
                        <div className={`heading`}>
                            <div>
                                <div className='text-overflow size--3 showTitle'>[{this.props.data.data.display_exchange}] {this.props.data.data.exchange_name} - <Lang>lang_market_data_subsription_agreement</Lang></div>
                            </div>
                            <div className='ic-close pointer' onClick={() => this.noAccess()}>
                                <Icon
                                    src={'navigation/close'}
                                    color='#ffffff'
                                    style={{ width: 20, height: 20, objectFit: 'contain', opacity: 0.7 }}
                                />
                            </div>
                        </div>
                        <div className={`content size--3`} style={{ overflow: 'auto' }}>
                            <div ref={ref => this.dom = ref} style={{ textAlign: 'justify' }}>
                                <p className=''>
                                    This Market Data Subscription Agreement is entered into by and between Trading Technologies International, Inc. (“Distributor”) and you (“you” or “Subscriber”). This Market Data Subscription Agreement permits you to access, receive and use certain Market Data (defined below) in accordance with the following terms and conditions of this Market Data Subscription Agreement (the “Agreement”). The Agreement governs your access to receive and use the Market Data, and constitutes a binding legal agreement by and between Distributor and Subscriber (each of Distributor and the Subscriber, a “Party” and collectively, the “Parties”). The Agreement may be accepted in electronic form (e.g., by an electronic or digital signature or other means of demonstrating assent) by clicking “I Agree” below and your acceptance will be deemed binding between the parties as of the date you clicked “I Agree” (the “Effective Date”). You agree that you will not contest the validity or enforceability of this Agreement because it was accepted in electronic form.
                                    Definitions “Device” means any unit of equipment, fixed or portable, that receives, accesses or displays Market Data in visible, audible or other comprehensible form.
                                    “Exchange” means a market or other similar organization, business or service where tradable instruments such as securities, commodities, foreign exchange, futures, or options contracts are bought and sold that provides Market Data to you through Distributor.
                                    “Force Majeure Event” means any flood, extraordinary weather conditions, earthquake or other act of God, fire, war, terrorism, insurrection, riot, labor dispute, accident, action of government, communications or power failures, or equipment or software malfunctions.
                                    “Person” means any natural person, proprietorship, corporation, partnership, limited liability company or other organization.
                                    “Market Data” means the market prices, volumes and other information as transmitted by the Exchange. By way of example and not limitation, information may include opening and closing range prices, high-low prices, settlement prices, current bid and ask prices, last sale prices, price limits, requests for quotations, estimated and actual contract volume data, other market activity information, contract specifications, fast or late messages, and information respecting exchange-for related product and against actual transactions.
                            </p>
                                <p className=''>Definitions</p>
                                <p className=''>
                                    “Device” means any unit of equipment, fixed or portable, that receives, accesses or displays Market Data in visible, audible or other comprehensible form.
                            </p>
                                <p className=''>
                                    “Exchange” means a market or other similar organization, business or service where tradable instruments such as securities, commodities, foreign exchange, futures, or options contracts are bought and sold that provides Market Data to you through Distributor.
                            </p>
                                <p className=''>
                                    “Force Majeure Event” means any flood, extraordinary weather conditions, earthquake or other act of God, fire, war, terrorism, insurrection, riot, labor dispute, accident, action of government, communications or power failures, or equipment or software malfunctions.
                            </p>
                                <p className=''>
                                    “Person” means any natural person, proprietorship, corporation, partnership, limited liability company or other organization.
                            </p>
                                <p className=''>
                                    “Market Data” means the market prices, volumes and other information as transmitted by the Exchange. By way of example and not limitation, information may include opening and closing range prices, high-low prices, settlement prices, current bid and ask prices, last sale prices, price limits, requests for quotations, estimated and actual contract volume data, other market activity information, contract specifications, fast or late messages, and information respecting exchange-for related product and against actual transactions.
                            </p>
                            </div>
                            <div className='acceptAgreement'>
                                <div className='pointer'>
                                    <Checkbox onChange={(checked) => {
                                        this.inputValue = checked
                                        this.forceUpdate()
                                    }} label='lang_agree_market_data_change' />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}><span className='size--3 text-underline '><Lang>lang_market_data_subsription_agreement</Lang></span></div>
                            </div>
                        </div>
                        <div className={`accessNowButton text-uppercase text-center size--3 pointer ${(this.inputValue && this.state.isConnected) ? '' : 'disabled'}`} onClick={() => this.accessButton()}><Lang>lang_get_access_now</Lang></div>
                    </div>
                </div>
            );
        } catch (error) {
            logger.error('render on MarketDataAgreementPopup' + error);
        }
    }
}

export default translate('translations')(MarketDataAgreementPopup)
