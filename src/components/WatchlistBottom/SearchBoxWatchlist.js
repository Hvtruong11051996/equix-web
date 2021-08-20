import React, { useState } from 'react';
import dataStorage from '../../dataStorage'
import uuidv4 from 'uuid/v4'
import ListSuggest from '../SearchBox/ListSuggest';
import SymbolClass, { LANG_CLASS } from '../../constants/symbol_class';
import logger from '../../helper/log';
import Lang from '../Inc/Lang/Lang';
import {
    getData,
    makeMarketUrl
} from '../../helper/request';
import {
    getDropdownContentDom,
    checkRole
} from '../../helper/functionUtils';
import Scroll from '../Inc/Scroll/Scroll';
import MapRoleComponent from '../../constants/map_role_component';

const WidthbyFont = {
    small: 520,
    medium: 545,
    large: 570
}

class SearchBoxWatchlist extends React.Component {
    constructor(props) {
        super(props)
        this.curentIndex = -1
        this.id = uuidv4();
        this.state = {
            valueSearch: '',
            typeSearch: SymbolClass.ALL_TYPES
        }
        this.callbackFn = {};
        if (this.props.fn) {
            this.props.fn({
                disableDropdownSymbol: this.disableDropdownSymbol
            })
        }
    }

    componentDidMount = () => {
        this.isMount = true;
        document.addEventListener('mousedown', this.handlerClickOutside);
    };

    handlerClickOutside = (e) => {
        if ((this.myInput && !this.myInput.contains(e.target)) && (this.floatContent && !this.floatContent.contains(e.target)) && (e.target && e.target.className && ![`searchBoxSelector_${this.id}`, 'iconAddcode', 'searchBox', 'listSuggest', 'headerSearch'].includes(e.target.className.baseVal || e.target.className))) {
            this.disableDropdownSymbol()
        }
    }
    disableDropdownSymbol = () => {
        if (this.floatContent) {
            ReactDOM.render(null, this.floatContent);
            this.floatContent.parentNode && this.floatContent.parentNode.removeChild(this.floatContent);
            this.floatContent = null;
            this.setState({
                dataSearch: [],
                valueSearch: ''
            });
        }
    }

    componentWillUnmount() {
        this.isMount = false;
        document.removeEventListener('mousedown', this.handlerClickOutside);
    }

    searchSymbol(type, isFirst) {
        try {
            const stringSearch = this.state.valueSearch || '';
            type = type || this.state.typeSearch;
            this.collapseCb && this.collapseCb();
            this.isFocus = true;
            if (type === SymbolClass.FX) {
                this.setState({
                    loadingSearch: false,
                    dataSearch: [
                        {
                            'symbol': 'AUDCAD',
                            'class': 'forex',
                            'code': 'AUDCAD',
                            'display_name': 'AUD/CAD',
                            'company': 'Australia Dollar/Canada Dollar',
                            'status': 'active',
                            'exchanges': [
                                'FXCM'
                            ],
                            'country': 'AU',
                            'contract_unit': null,
                            'contract_months': null,
                            'listing_date': null,
                            'min_price_movement': null,
                            'last_trading_day': null,
                            'cash_settlement_price': null,
                            'trading_hours': null,
                            'settlement_day': null,
                            'position_limit': null,
                            'daily_price_limit': null,
                            'cftc_approved': null,
                            'updated': '2020-06-15T08:33:19.000Z',
                            'company_name': 'Australia Dollar/Canada Dollar',
                            'GICS_industry_group': null,
                            'list_trading_market': [
                                'ASX:ASX',
                                'N:CXA',
                                'CXA:CXACP',
                                'N:qCXA',
                                'N:BESTMKT',
                                'N:FIXED CO'
                            ],
                            'trading_halt': 0,
                            'currency': null,
                            'ISIN': 'AU000000ACP7',
                            'display_exchange': 'FXCM',
                            'last_halt': 0,
                            'last_haltlift': 0,
                            'type': 0,
                            'display_master_code': null,
                            'display_master_name': null,
                            'master_code': null,
                            'master_name': null,
                            'expiry_date': null,
                            'first_noti_day': null,
                            'security_name': null,
                            'origin_symbol': 'AUDCAD'
                        },
                        {
                            'symbol': 'AUDCHF',
                            'class': 'forex',
                            'code': 'AUDCHF',
                            'display_name': 'AUD/CHF',
                            'company': 'Australia Dollar/Switzerland Franc ',
                            'status': 'active',
                            'exchanges': [
                                'FXCM'
                            ],
                            'country': 'US',
                            'contract_unit': null,
                            'contract_months': null,
                            'listing_date': null,
                            'min_price_movement': null,
                            'last_trading_day': null,
                            'cash_settlement_price': null,
                            'trading_hours': null,
                            'settlement_day': null,
                            'position_limit': null,
                            'daily_price_limit': null,
                            'cftc_approved': null,
                            'updated': '2020-06-15T08:33:19.000Z',
                            'company_name': 'Australia Dollar/Switzerland Franc ',
                            'GICS_industry_group': null,
                            'list_trading_market': [
                                'ASX:ASX',
                                'N:CXA',
                                'CXA:CXACP',
                                'N:qCXA',
                                'N:BESTMKT',
                                'N:FIXED CO'
                            ],
                            'trading_halt': 0,
                            'currency': '',
                            'ISIN': 'AU000000AD88',
                            'display_exchange': 'FXCM',
                            'last_halt': 0,
                            'last_haltlift': 0,
                            'type': 0,
                            'display_master_code': null,
                            'display_master_name': null,
                            'master_code': null,
                            'master_name': null,
                            'expiry_date': null,
                            'first_noti_day': null,
                            'security_name': null,
                            'origin_symbol': 'AUDCHF.FXCM'
                        },
                        {
                            'symbol': 'AUDJPY',
                            'class': 'forex',
                            'code': 'AUDJPY',
                            'display_name': 'AUD/JPY',
                            'company': 'Australia Dollar/Japan Yen',
                            'status': 'active',
                            'exchanges': [
                                'FXCM'
                            ],
                            'country': '',
                            'contract_unit': null,
                            'contract_months': null,
                            'listing_date': null,
                            'min_price_movement': null,
                            'last_trading_day': null,
                            'cash_settlement_price': null,
                            'trading_hours': null,
                            'settlement_day': null,
                            'position_limit': null,
                            'daily_price_limit': null,
                            'cftc_approved': null,
                            'updated': '2020-06-15T08:33:19.000Z',
                            'company_name': 'Australia Dollar/Switzerland Franc ',
                            'GICS_industry_group': null,
                            'list_trading_market': [
                                'ASX:ASX',
                                'N:CXA',
                                'CXA:CXACP',
                                'N:qCXA',
                                'N:BESTMKT',
                                'N:FIXED CO'
                            ],
                            'trading_halt': 0,
                            'currency': '',
                            'ISIN': 'AU000000AD88',
                            'display_exchange': 'FXCM',
                            'last_halt': 0,
                            'last_haltlift': 0,
                            'type': 0,
                            'display_master_code': null,
                            'display_master_name': null,
                            'master_code': null,
                            'master_name': null,
                            'expiry_date': null,
                            'first_noti_day': null,
                            'security_name': null,
                            'origin_symbol': 'AUDJPY.FXCM'
                        },
                        {
                            'symbol': 'XAO',
                            'class': 'forex',
                            'code': 'XAO',
                            'display_name': 'XAO.ASX',
                            'company': 'Fake company',
                            'status': 'active',
                            'exchanges': [
                                'ASX'
                            ],
                            'country': 'AU',
                            'contract_unit': null,
                            'contract_months': null,
                            'listing_date': null,
                            'min_price_movement': null,
                            'last_trading_day': null,
                            'cash_settlement_price': null,
                            'trading_hours': null,
                            'settlement_day': null,
                            'position_limit': null,
                            'daily_price_limit': null,
                            'cftc_approved': null,
                            'updated': '2020-06-15T08:33:19.000Z',
                            'company_name': 'Fake company',
                            'GICS_industry_group': null,
                            'list_trading_market': [
                                'ASX:ASX',
                                'N:CXA',
                                'CXA:CXACP',
                                'N:qCXA',
                                'N:BESTMKT',
                                'N:FIXED CO'
                            ],
                            'trading_halt': 0,
                            'currency': 'XT',
                            'ISIN': 'AU0000054553',
                            'display_exchange': 'ASX',
                            'last_halt': 0,
                            'last_haltlift': 0,
                            'type': 0,
                            'display_master_code': null,
                            'display_master_name': null,
                            'master_code': null,
                            'master_name': null,
                            'expiry_date': null,
                            'first_noti_day': null,
                            'security_name': null,
                            'origin_symbol': 'XCD',
                            'available_region': null,
                            'coupon_rate': null,
                            'days_to_expiration': null,
                            'leaps': null,
                            'maturity_date': null,
                            'options_multiple_deliverables': null,
                            'options_premium_multiplier': null,
                            'root_option_symbol': null,
                            'sic': null,
                            'strike_price': null,
                            'naics': null,
                            'security_sub_type': null
                        },
                        {
                            'symbol': 'XFL',
                            'class': 'forex',
                            'code': 'XFL',
                            'display_name': 'XFL.ASX',
                            'company': 'Fake company',
                            'status': 'active',
                            'exchanges': [
                                'ASX'
                            ],
                            'country': 'AU',
                            'contract_unit': null,
                            'contract_months': null,
                            'listing_date': null,
                            'min_price_movement': null,
                            'last_trading_day': null,
                            'cash_settlement_price': null,
                            'trading_hours': null,
                            'settlement_day': null,
                            'position_limit': null,
                            'daily_price_limit': null,
                            'cftc_approved': null,
                            'updated': '2020-06-15T08:33:19.000Z',
                            'company_name': 'Fake company',
                            'GICS_industry_group': null,
                            'list_trading_market': [
                                'ASX:ASX',
                                'N:CXA',
                                'CXA:CXACP',
                                'N:qCXA',
                                'N:BESTMKT',
                                'N:FIXED CO'
                            ],
                            'trading_halt': 0,
                            'currency': 'XT',
                            'ISIN': 'AU0000054553',
                            'display_exchange': 'ASX',
                            'last_halt': 0,
                            'last_haltlift': 0,
                            'type': 0,
                            'display_master_code': null,
                            'display_master_name': null,
                            'master_code': null,
                            'master_name': null,
                            'expiry_date': null,
                            'first_noti_day': null,
                            'security_name': null,
                            'origin_symbol': 'XCD',
                            'available_region': null,
                            'coupon_rate': null,
                            'days_to_expiration': null,
                            'leaps': null,
                            'maturity_date': null,
                            'options_multiple_deliverables': null,
                            'options_premium_multiplier': null,
                            'root_option_symbol': null,
                            'sic': null,
                            'strike_price': null,
                            'naics': null,
                            'security_sub_type': null
                        },
                        {
                            'symbol': 'XTO',
                            'class': 'forex',
                            'code': 'XTO',
                            'display_name': 'XTO.ASX',
                            'company': 'Fake company',
                            'status': 'active',
                            'exchanges': [
                                'ASX'
                            ],
                            'country': 'AU',
                            'contract_unit': null,
                            'contract_months': null,
                            'listing_date': null,
                            'min_price_movement': null,
                            'last_trading_day': null,
                            'cash_settlement_price': null,
                            'trading_hours': null,
                            'settlement_day': null,
                            'position_limit': null,
                            'daily_price_limit': null,
                            'cftc_approved': null,
                            'updated': '2020-06-15T08:33:19.000Z',
                            'company_name': 'Fake company',
                            'GICS_industry_group': null,
                            'list_trading_market': [
                                'ASX:ASX',
                                'N:CXA',
                                'CXA:CXACP',
                                'N:qCXA',
                                'N:BESTMKT',
                                'N:FIXED CO'
                            ],
                            'trading_halt': 0,
                            'currency': 'XT',
                            'ISIN': 'AU0000054553',
                            'display_exchange': 'ASX',
                            'last_halt': 0,
                            'last_haltlift': 0,
                            'type': 0,
                            'display_master_code': null,
                            'display_master_name': null,
                            'master_code': null,
                            'master_name': null,
                            'expiry_date': null,
                            'first_noti_day': null,
                            'security_name': null,
                            'origin_symbol': 'XCD',
                            'available_region': null,
                            'coupon_rate': null,
                            'days_to_expiration': null,
                            'leaps': null,
                            'maturity_date': null,
                            'options_multiple_deliverables': null,
                            'options_premium_multiplier': null,
                            'root_option_symbol': null,
                            'sic': null,
                            'strike_price': null,
                            'naics': null,
                            'security_sub_type': null
                        }
                    ],
                    typeSearch: type
                }, () => {
                    this.loadDropdown()
                });
                return;
            }
            this.setState({
                loadingSearch: true,
                typeSearch: type
            }, () => {
                isFirst && this.loadDropdown()
                if (stringSearch.length > 0) {
                    let className = '';
                    switch (type) {
                        case SymbolClass.ALL_TYPES: className = 'equity,future,etf,mf,warrant,option,index,forex'; break;
                        default: className = type; break;
                    }
                    const url = makeMarketUrl(`symbol/company_name?class=${className}&status=active&symbol=${stringSearch}&top=30`);
                    getData(url).then((response) => {
                        if (this.searchBox && this.searchBox.value !== stringSearch) return;
                        if (response.data) {
                            const data = response.data
                            this.originData = data
                            this.setState({
                                loadingSearch: false,
                                dataSearch: data
                            }, () => {
                                this.loadDropdown()
                            })
                        }
                    });
                } else {
                    this.setState({
                        dataSearch: [],
                        loadingSearch: false
                    }, () => {
                        this.loadDropdown()
                    })
                }
            });
        } catch (error) {
            console.error('Add Code Error On Watch List' + error)
            logger.error('Add Code Error On Watch List' + error)
        }
    }

    clickItemSuggest(symbolObj, focus) {
        try {
            if (focus) this.searchBox.focus();
            if (this.props.dicDataSymbol[symbolObj.symbol]) this.props.updateDataFireBase && this.props.updateDataFireBase('remove', symbolObj);
            else this.props.updateDataFireBase && this.props.updateDataFireBase('add', symbolObj);
        } catch (error) {
            logger.error('clickItemSuggest On Watch List' + error)
        }
    }

    setWrapperRef() {
        try {
            const node = this.myInput;
            if (node) {
                let div = getDropdownContentDom()
                this.floatContent = document.createElement('div');
                div.appendChild(this.floatContent);
                this.floatContent.style.position = 'absolute';
                this.floatContent.style.display = 'block';
                this.floatContent.style.minWidth = '220px'
                const rect = node.getBoundingClientRect();
                const top = rect.top + node.offsetHeight;
                const left = rect.left;
                const totalWidth = left + 555;
                const spaceBottom = window.innerHeight - top
                if (rect.top > spaceBottom && spaceBottom < 100) {
                    this.height = (rect.top > 336 ? 336 : rect.top - 33);
                    this.floatContent.style.bottom = (spaceBottom + node.offsetHeight) + 'px';
                    this.floatContent.style.height = this.height;
                    this.floatContent.style.maxHeight = this.height;
                    this.floatContent.style.top = null;
                } else {
                    this.height = (spaceBottom > 336 ? 336 : spaceBottom - 33);
                    this.floatContent.style.top = (rect.top + node.offsetHeight) + 'px';
                    this.floatContent.style.bottom = null
                    this.floatContent.style.maxHeight = this.height;
                    this.floatContent.style.maxHeight = this.height;
                }
                if (totalWidth > window.innerWidth) {
                    const fontSize = localStorageNew.getItem('lastFontSize', true) || 'medium';
                    const spaceLeft = left + this.myInput.offsetWidth - WidthbyFont[fontSize] + 2
                    if (spaceLeft < 0) this.floatContent.style.left = '0px'
                    else this.floatContent.style.left = spaceLeft - 2 + 'px'
                } else {
                    this.floatContent.style.left = rect.left + 'px';
                }
                ReactDOM.render(this.renderSearchResultContent(), this.floatContent);
            }
        } catch (error) {
            logger.error('setWrapperRef error SearchBox', error)
        }
    }

    nextHoverElement(unit, firstCome) {
        try {
            this.curentIndex = this.curentIndex + unit;
            if ((unit < 0 && this.curentIndex <= 0) || firstCome) {
                this.curentIndex = 0;
            }
            const nextElement = document.getElementById(`itemSuggest_${this.id}_${this.curentIndex}`);
            const currentlement = document.getElementById(`itemSuggest_${this.id}_${this.curentIndex - unit}`);
            if (nextElement) {
                nextElement.className = nextElement.className + ' itemSuggestSetHover';
                if (nextElement.offsetTop < nextElement.parentNode.scrollTop) {
                    nextElement.parentNode.scrollTop = nextElement.offsetTop
                }
                if (nextElement.offsetTop + nextElement.clientHeight > nextElement.parentNode.clientHeight + nextElement.parentNode.scrollTop) {
                    nextElement.parentNode.scrollTop = nextElement.offsetTop - nextElement.parentNode.clientHeight + nextElement.clientHeight
                }
            } else {
                if (this.curentIndex > 0 || this.curentIndex < 0) {
                    this.curentIndex = -1;
                    this.nextHoverElement(unit);
                }
            }
            if (currentlement) {
                currentlement.className = (currentlement.className + '').replace(/itemSuggestSetHover/g, '');
            }
        } catch (error) {
            console.error('nextHoverElement On SearchBox' + error)
            logger.error('nextHoverElement On SearchBox' + error)
        }
    }

    listenerKeyDown = (event) => {
        try {
            if (event.target && this.searchBox && event.target.id === this.searchBox.id) {
                if (event.keyCode === 13) {
                    const dataSearch = this.state.dataSearch;
                    if (this.curentIndex && this.curentIndex === -1) this.curentIndex = 0;
                    if (dataSearch && dataSearch.length) {
                        this.eventSortFirst = true
                        // this.tichOrUntick();
                        this.callbackFn && this.callbackFn[this.curentIndex] && this.callbackFn[this.curentIndex]();
                        // dataSearch[this.curentIndex] && this.clickItemSuggest(dataSearch[this.curentIndex], true)
                    }
                }
                if (event.keyCode === 40) {
                    // down
                    this.nextHoverElement(1);
                    event.preventDefault();
                }
                if (event.keyCode === 38) {
                    // up
                    this.nextHoverElement(-1);
                    event.preventDefault();
                }
            }
        } catch (error) {
            console.error('listenerKeyDown On SearchBox' + error)
            logger.error('listenerKeyDown On SearchBox' + error)
        }
    }
    loadDropdown() {
        const div = document.getElementById('dropDownContent');
        if (this.floatContent && div && div.children && div.children[0]) {
            ReactDOM.render(this.renderSearchResultContent(), this.floatContent);
        } else {
            this.setWrapperRef()
        }
    }
    showSuggest(outSide) {
        try {
            if (this.state.dataSearch.length > 0) {
                return 'size--3 '
            } else if (outSide || this.state.dataSearch.length <= 0) {
                return `size--3 ${this.searchBox && this.searchBox.value && this.searchBox.value.length > 1 && this.isFocus ? '' : 'disable'}`
            }
        } catch (error) {
            console.error('Render Suggest On Watch List', error)
            logger.error('Render Suggest On Watch List', error)
        }
    }
    renderSuggest() {
        try {
            const listSuggest = this.state.dataSearch;
            let dicWl = { ...this.props.dicDataSymbol }
            if (!listSuggest || listSuggest.length === 0) {
                if (this.searchBox && this.searchBox.value && this.searchBox.value.length > 1) {
                    return <div className='emptyListSuggest text-capitalize'>
                        <Lang>lang_no_data</Lang>
                    </div>
                } else {
                    return null
                }
            }
            return <ListSuggest
                callback={(fn, index) => this.callbackFn[index] = fn}
                collapseCb={(fn) => this.collapseCb = fn}
                id={this.id}
                isAddcode={true}
                listSearch={listSuggest}
                lstExisted={dicWl}
                textSearch={this.searchBox.value}
                clickItemSuggest={this.clickItemSuggest.bind(this)}
            />
        } catch (error) {
            console.error('Render Suggestion On Watch List', error)
            logger.error('Render Suggestion On Watch List', error)
        }
    }
    renderSearchResultContent() {
        return (
            <div ref={dom => this.refSuggestSymbol = dom} className={`searchSuggest ${this.showSuggest()} `}>
                <div className='searchSuggestHeader'>
                    <div className={`${this.state.typeSearch === SymbolClass.ALL_TYPES ? 'active' : ''} headerSearch`} onClick={() => this.searchSymbol(SymbolClass.ALL_TYPES)}><Lang>{LANG_CLASS.ALL_TYPES}</Lang></div>
                    <div className={`${this.state.typeSearch === SymbolClass.EQUITY ? 'active' : ''} headerSearch`} onClick={() => this.searchSymbol(SymbolClass.EQUITY)}><Lang>{LANG_CLASS.EQUITY}</Lang></div>
                    <div className={`${this.state.typeSearch === SymbolClass.ETF ? 'active' : ''} headerSearch`} onClick={() => this.searchSymbol(SymbolClass.ETF)}><Lang>{LANG_CLASS.ETF}</Lang></div>
                    <div className={`${this.state.typeSearch === SymbolClass.MF ? 'active' : ''} headerSearch`} onClick={() => this.searchSymbol(SymbolClass.MF)}><Lang>{LANG_CLASS.MANAGED_FUNDS}</Lang></div>
                    <div className={`${this.state.typeSearch === SymbolClass.WARRANT ? 'active' : ''} headerSearch`} onClick={() => this.searchSymbol(SymbolClass.WARRANT)}><Lang>{LANG_CLASS.WARRANT}</Lang></div>
                    <div className={`${this.state.typeSearch === SymbolClass.FUTURE ? 'active' : ''} headerSearch`} onClick={() => this.searchSymbol(SymbolClass.FUTURE)}><Lang>{LANG_CLASS.FUTURES}</Lang></div>
                    <div className={`${this.state.typeSearch === SymbolClass.OPTION ? 'active' : ''} headerSearch`} onClick={() => this.searchSymbol(SymbolClass.OPTION)}><Lang>{LANG_CLASS.OPTION}</Lang></div>
                    <div className={`${this.state.typeSearch === SymbolClass.FX ? 'active' : ''} headerSearch`} onClick={() => this.searchSymbol(SymbolClass.FX)}><Lang>{LANG_CLASS.FX}</Lang></div>
                </div>
                <div style={{ height: this.height + 'px !important', maxHeight: this.height, minHeight: this.height }}>
                    <div ref={dom => new Scroll(dom)}>{
                        this.state.loadingSearch ? <div className={dataStorage.theme === 'theme-dark' ? 'loaderGridDark' : 'loaderGrid'} /> : this.renderSuggest()}</div>
                </div>
            </div>
        );
    }
    onChangeSearch = (event) => {
        try {
            const time = 300;
            this.setTimeOutID && clearTimeout(this.setTimeOutID);
            this.setState({
                valueSearch: event.target.value
            }, () => {
                if ((this.state.valueSearch + '').length >= 2) {
                    this.setTimeOutID = setTimeout(() => {
                        this.searchSymbol(SymbolClass.ALL_TYPES, true)
                        this.curentIndex = -1
                    }, time)
                } else {
                    this.setState({
                        dataSearch: [],
                        loadingSearch: false
                    }, () => this.loadDropdown())
                }
            })
        } catch (error) {
            console.error('onChangeSearch On Watch List', error)
            logger.error('onChangeSearch On Watch List', error)
        }
    }

    handleOnBlur() {
        this.isFocus = false;
    }

    handleOnFocus() {
        this.isFocus = true;
    }

    render() {
        return (
            <div id='searchBox' ref={input => {
                this.myInput = input;
            }} className='searchBox text-uppercase'>
                {checkRole(MapRoleComponent.CREATE_REMOVE_ADD_WATCHLIST)
                    ? <input
                        id={`searchBoxSelector_${this.id}`}
                        className='size--3'
                        ref={dom => {
                            if (dom && dom !== this.searchBox) {
                                this.searchBox = dom;
                                dom.addEventListener('keydown', this.listenerKeyDown, false);
                            }
                        }}
                        onBlur={this.handleOnBlur.bind(this)}
                        onFocus={this.handleOnFocus.bind(this)}
                        placeholder={`${dataStorage.translate('lang_add')}...`}
                        value={this.state.valueSearch}
                        onChange={this.onChangeSearch.bind()} />
                    : null
                }
            </div>
        )
    }
}
export default SearchBoxWatchlist;
