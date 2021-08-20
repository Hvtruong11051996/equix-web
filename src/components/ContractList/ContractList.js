/* eslint-disable no-self-compare */
import React from 'react';
import ToggleLine from '../Inc/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import SearchBox from '../SearchBox';
import dataStorage from '../../dataStorage';
import {
    getData,
    makeMarketUrl
} from '../../helper/request';
import logger from '../../helper/log';
import s from './ContractList.module.css';
import MapRoleComponent from '../../constants/map_role_component';
import Grid from '../Inc/CanvasGrid';
import Price from '../FlashingPriceHeader'
import moment from 'moment'
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';
import { addPriceListener, removePriceListener } from '../../helper/priceSource'
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'

const FIELD = {
    CODE: 'display_name',
    CONTRACT_STATUS: 'status',
    FIRST_NOTICE_DAY: 'first_noti_day',
    LAST_TRADING_DAY: 'last_trading_day',
    EXPIRY_DATE: 'expiry_date',
    SECURITY: 'security_name'
}

class ContractList extends React.Component {
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
        props.resize((w, h) => {
            this.autoSize && this.autoSize();
        });
    }

    column() {
        const bgEnum = {
            ACTIVE: '--semantic-success',
            INACTIVE: '--semantic-danger'
        }
        return [
            {
                header: 'lang_code',
                name: FIELD.CODE,
                suppressFilter: true
            },
            {
                header: 'lang_contract_status',
                align: 'center',
                name: FIELD.CONTRACT_STATUS,
                type: TYPE.LABEL_WIDTH_BG,
                fullWidth: true,
                suppressFilter: true,
                getBackgroundColorKey: (params) => {
                    return bgEnum[params.data[FIELD.CONTRACT_STATUS].toUpperCase()];
                },
                formater: (params) => {
                    return params.value && params.value.toUpperCase()
                }
            },
            {
                header: 'lang_first_notice_date',
                name: FIELD.FIRST_NOTICE_DAY,
                suppressFilter: true,
                formater: (params) => {
                    if (params.value === '--') return '--'
                    return (params.value) ? moment(params.value).format('DD/MM/YYYY') : '--'
                }
            },
            {
                header: 'lang_last_trading_date',
                name: FIELD.LAST_TRADING_DAY,
                align: 'center',
                suppressFilter: true,
                formater: (params) => {
                    if (params.value === '--') return '--'
                    return (params.value) ? moment(params.value).format('DD/MM/YYYY') : '--'
                }
            },
            {
                header: 'lang_expiry_date',
                name: FIELD.EXPIRY_DATE,
                align: 'center',
                suppressFilter: true,
                formater: (params) => {
                    if (params.value === '--') return '--'
                    return params.value ? (params.value + '').replace(/(\d{4})$/, '/$1') : '--'
                }
            },
            {
                header: 'lang_security',
                name: FIELD.SECURITY,
                suppressFilter: true
            },
            {
                header: 'lang_button',
                name: 'button',
                type: 'quickBuySell',
                float: true,
                role: MapRoleComponent.NEW_ORDER,
                isHidden: [FIELD.CONTRACT_STATUS, 'inactive'],
                selfData: true
            }
        ]
    }

    refreshData = async () => {
        try {
            this.props.loading(true)
            await this.getDataSnapshot()
            this.props.loading(false)
        } catch (error) {
            logger.error('refreshData On MarketDepth' + error)
        }
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
                value: 'ExportCSV',
                label: 'lang_export_csv',
                callback: () => this.exportCSV()
            },
            {
                value: 'Resize',
                label: 'lang_resize',
                callback: () => this.resize()
            },
            {
                value: 'Columns',
                label: 'lang_columns',
                callback: (bound, optionBound) => this.showColumnMenu(optionBound)
            }
        ]
    }

    realtimePrice = (obj) => {
        if (obj && obj.quote) {
            Object.assign(this.priceObj, obj.quote)
        }
    }

    symbolChanged = async (symbolObj) => {
        if (this.symbolObj.symbol !== symbolObj.symbol) {
            this.props.send({
                symbol: symbolObj
            })
        }
        removePriceListener(this.realtimePrice)
        this.symbolObj = symbolObj
        addPriceListener(this.symbolObj, this.realtimePrice)
        dataStorage.symbolObjDepth = symbolObj
        this.priceObj = {}
        this.setData([])
        this.forceUpdate()
        this.props.loading(true)
        await this.getDataSnapshot()
        this.props.loading(false)
    }

    isFutureSymbol = (symbolObj = this.symbolObj) => {
        try {
            if (!symbolObj.class || (symbolObj.class + '').toLowerCase() !== 'future' || !symbolObj.master_code) return false
            else return true
        } catch (error) {
            console.error('isFutureSymbol error: ', error)
            return false
        }
    }

    getDataSnapshot = async () => {
        try {
            if (!this.isFutureSymbol()) {
                this.props.loading(false)
                this.setData([])
                return
            }
            this.setData([]);
            const masterCodeUrl = makeMarketUrl(`symbol?master_code=${this.symbolObj.master_code}`)
            await getData(masterCodeUrl).then(response => {
                const listData = (response && response.data) || []
                this.listData = listData
                this.setData(this.listData);
            }).catch(error => {
                this.listData = []
                console.error(`getDataSnapshot getData error: ${error}`)
            })
        } catch (error) {
            console.error(`getDataSnapshot error: ${error}`)
            this.props.loading(false)
        }
    }

    changeConnection(isConnected) {
        if (!isConnected !== !this.isConnected) {
            this.isConnected = isConnected;
            this.forceUpdate()
        }
    }

    onRowClick = (data) => {
        if (!this.isConnected) return
        if (data[FIELD.CONTRACT_STATUS] === 'inactive') return
        if (this.symbolObj.symbol === data.symbol) return
        this.symbolChanged(data)
    }

    componentDidMount() {
        addEventListener(EVENTNAME.connectionChanged, this.changeConnection)
        addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
        // registerAllOrders(this.realtimePrice, 'portfolio')
    }

    componentWillUnmount() {
        try {
            removePriceListener(this.realtimePrice)
            removeEventListener(EVENTNAME.connectionChanged, this.changeConnection)
            removeEventListener(EVENTNAME.clickToRefresh, this.refreshData)
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
                <div className={`header-wrap flex ${this.collapse ? 'collapse' : ''}`} style={{ padding: '8px 0', alignItems: 'center' }}>
                    <div className='navbar' style={{ alignItems: 'center' }}>
                        {
                            !this.collapse
                                ? <section style={{ paddingLeft: '8px' }}>
                                    <p className='size--7 showTitle' style={{ marginBottom: '8px' }}>{(this.symbolObj && this.symbolObj.display_name) || '--'}</p>
                                    <Price size='size--4' field='trade_price' priceObj={this.priceObj || {}} symbolObj={this.symbolObj} />
                                    <Price size='size--4' field='change_point' priceObj={this.priceObj || {}} />
                                    <Price size='size--4' field='change_percent' priceObj={this.priceObj || {}} />
                                </section>
                                : null
                        }
                        <div className={s.statusBtn}>
                            {this.symbolObj[FIELD.CONTRACT_STATUS] && this.symbolObj[FIELD.CONTRACT_STATUS].toUpperCase()}
                        </div>
                    </div>
                </div>
                <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
                <div className='container' style={{ flex: 1 }}>
                    <Grid
                        widgetName='lang_contract_list'
                        {...this.props}
                        id={FORM.CONTRACT_LIST}
                        fn={fn => {
                            this.setData = fn.setData
                            this.getData = fn.getData
                            this.autoSize = fn.autoSize
                            this.exportCSV = fn.exportCsv
                            this.resize = fn.autoSize
                            this.showColumnMenu = fn.showColumnMenu
                        }}
                        columns={this.column()}
                        fnKey={data => {
                            return data.symbol
                        }}
                        sort={{
                            index: 'asc'
                        }}
                        autoFit={true}
                        onlySystem={true}
                        onRowClicked={this.onRowClick}
                    />
                </div>
            </div >
        )
    }
}

export default ContractList;
