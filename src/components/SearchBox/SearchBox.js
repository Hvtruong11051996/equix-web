import React from 'react';
import ListSuggest from './ListSuggest';
import { getData, makeMarketUrl } from '../../helper/request'
import { checkPropsStateShouldUpdate, isAUSymbol, getDropdownContentDom, checkRole } from '../../helper/functionUtils';
import uuidv4 from 'uuid/v4';
import Lang from '../Inc/Lang'
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import Flag from '../Inc/Flag';
import SymbolClass, { LANG_CLASS } from '../../constants/symbol_class';
import s from './SearchBox.module.css'
import Button from '../Elements/Button';

const WidthbyFont = {
    small: 520,
    medium: 545,
    large: 570
}
class SearchBox extends React.Component {
    constructor(props) {
        super(props);
        this.isFocus = false;
        this.originData = [];
        this.curentIndex = -1;
        this.lastDownTarget = null;
        this.callbackFn = {};
        this.searchBox = '';
        this.id = uuidv4();
        this.obj = props.obj;
        this.state = {
            typeSearch: SymbolClass.ALL_TYPES,
            trading_halt: props.trading_halt || false,
            dataSearch: [],
            loadingSearch: true,
            codeFlag: this.renderCodeFlag(props.obj, true)
        };
        this.widthWindow = window.innerWidth || 0
        props.resize && props.resize((w, h) => {
            let widthAfterResize = window.innerWidth || 0
            const div = document.getElementById('dropDownContent');
            if (this.floatContent && div && div.children && div.children[0]) {
                const node = this.dom;
                if (!node) return;
                this.setSearchSuggestPosition()
                this.loadDropdown()
            }
        });
        props.disableDropdown && props.disableDropdown(() => {
            this.disableDropdown()
        })
    }

    setSymbol = (symbolObj = {}) => {
        this.obj = symbolObj
        if (this.props.isNewVersion) {
            this.searchBox.value = this.obj.security_name || this.obj.company_name || this.obj.company || ''
        } else this.searchBox.value = (this.obj.display_name) || '';
        this.renderCodeFlag(this.obj)
    }

    componentWillReceiveProps(nextProps) {
        try {
            if (document.activeElement !== this.searchBox) {
                if (nextProps && nextProps.trading_halt !== this.state.trading_halt) {
                    this.setState({ trading_halt: nextProps.trading_halt })
                }
                if (nextProps.symbol === '') {
                    this.setState({
                        codeFlag: null
                    })
                    if (this.props.isNewVersion) {
                        this.searchBox.value = this.obj.security_name || this.obj.company_name || this.obj.company || ''
                    } else this.searchBox.value = (nextProps.obj && nextProps.obj.display_name) || '';
                    if (nextProps.obj) {
                        this.obj = nextProps.obj;
                        this.renderCodeFlag(nextProps.obj)
                    }
                } else {
                    if (nextProps.obj) {
                        this.obj = nextProps.obj;
                        if (this.props.isNewVersion) {
                            this.searchBox.value = this.obj.security_name || this.obj.company_name || this.obj.company || ''
                        } else this.searchBox.value = (nextProps.obj && nextProps.obj.display_name) || '';
                        this.renderCodeFlag(nextProps.obj)
                    }
                }
            }
        } catch (error) {
            logger.error('componentWillReceiveProps On SearchBox' + error)
        }
    }

    nextHoverElement(unit) {
        try {
            let current = document.querySelector(`.itemSuggest_${this.id}.itemSuggestSetHover`);
            let next, previous;
            if (!current) {
                document.getElementById(`itemSuggest_${this.id}_0`).classList.add('itemSuggestSetHover');
            } else {
                if (unit > 0) {
                    if (!current.classList.contains('childShow')) {
                        next = current.parentNode.nextElementSibling ? current.parentNode.nextElementSibling.querySelector(`.itemSuggest_${this.id}`) : null;
                        if (!next) {
                            if (current.parentNode.parentNode.itemData && current.parentNode.parentNode.nextElementSibling) next = current.parentNode.parentNode.nextElementSibling.querySelector(`.itemSuggest_${this.id}`);
                            else return;
                        }
                        next.classList.add('itemSuggestSetHover');
                        current.classList.remove('itemSuggestSetHover');
                    } else {
                        let next = current.nextElementSibling && current.nextElementSibling.querySelector(`.itemSuggest_${this.id}`);
                        next.classList.add('itemSuggestSetHover');
                        current.classList.remove('itemSuggestSetHover');
                    }
                } else {
                    if (!current.classList.contains('childShow')) {
                        if (current.parentNode.classList.contains('isChild')) {
                            previous = current.parentNode.previousElementSibling ? current.parentNode.previousElementSibling.classList.contains('childShow') ? current.parentNode.previousElementSibling : current.parentNode.previousElementSibling.querySelector(`.itemSuggest_${this.id}`) : null;
                        } else {
                            if (current.parentElement.previousElementSibling) {
                                previous = current.parentNode.previousElementSibling.querySelector(`.itemSuggest_${this.id}`).classList.contains('childShow') ? current.parentNode.previousElementSibling.lastElementChild.querySelector(`.itemSuggest_${this.id}`) : current.parentNode.previousElementSibling.querySelector(`.itemSuggest_${this.id}`);
                            }
                        }
                        if (!previous) {
                            if (current.parentNode.parentNode.itemData && current.parentNode.parentNode.previousElementSibling) previous = current.parentNode.parentNode.previousElementSibling.querySelector(`.itemSuggest_${ths.id}`);
                            else return;
                        }
                        previous.classList.add('itemSuggestSetHover');
                        current.classList.remove('itemSuggestSetHover');
                    } else {
                        let previous = current.parentNode.previousElementSibling && current.parentNode.previousElementSibling.querySelector(`.itemSuggest_${this.id}`);
                        if (previous) {
                            previous.classList.add('itemSuggestSetHover');
                            current.classList.remove('itemSuggestSetHover');
                        }
                    }
                }
            }
            if (next || previous) {
                let clientHeight = this.dropDownBox.clientHeight;
                if (next) {
                    let height = next.offsetTop;
                    if (height > clientHeight) {
                        this.dropDownBox.scrollTop = height - clientHeight + 32;
                    }
                } else {
                    let height = previous.offsetTop;
                    if (height < this.dropDownBox.scrollTop) {
                        this.dropDownBox.scrollTop = height;
                    }
                }
            }
        } catch (error) {
            logger.error('nextHoverElement On SearchBox' + error)
        }
    }

    componentWillUnmount() {
        try {
            const dropDownContent = document.getElementById('dropDownContent')
            dropDownContent && this.floatContent && dropDownContent.contains(this.floatContent) && dropDownContent.removeChild(this.floatContent);
            document.removeEventListener('mousedown', this.listenerMouseDown.bind(this), false);
            this.searchBox.removeEventListener('keydown', this.listenerKeyDown.bind(this), false);
        } catch (error) {
            logger.error('componentWillUnmount On SearchBox' + error)
        }
    }

    listenerMouseDown(event) {
        try {
            this.lastDownTarget = event.target;
            if (this.lastDownTarget && this.lastDownTarget.id === `searchBoxSelector_${this.id}`) {
                this.curentIndex = -1;
            }
        } catch (error) {
            logger.error('listenerMouseDown On SearchBox' + error)
        }
    }

    listenerKeyDown(event) {
        try {
            this.lastDownTarget = event.target;
            if (this.lastDownTarget && this.searchBox && this.lastDownTarget.id === this.searchBox.id) {
                if (event.keyCode === 40) {
                    this.nextHoverElement(1);
                    // down
                }
                if (event.keyCode === 38) {
                    // up
                    this.nextHoverElement(-1);
                }
            }
        } catch (error) {
            logger.error('listenerKeyDown On SearchBox' + error)
        }
    }

    handleOnFocus() {
        this.isFocus = true;
        if (this.props.isNewVersion) {
            this.searchBox.classList.add('focus')
            this.searchBox.value = ''
        }
    }

    handleOnBlur() {
        setTimeout(() => {
            if (this.floatContent) return
            if (this.props.isNewVersion) {
                this.searchBox.value = this.obj.security_name || this.obj.company_name || this.obj.company || ''
                this.searchBox.classList.remove('focus')
            }
            this.isFocus = false;
            if (!this.searchBox.value && !this.props.allowDelete) {
                if (this.obj) {
                    if (this.obj.display_name) {
                        if (!this.searchBox.value) {
                            if (this.props.isNewVersion) {
                                this.searchBox.value = this.obj.security_name || this.obj.company_name || this.obj.company || ''
                            } else this.searchBox.value = this.obj.display_name
                        }
                        this.renderCodeFlag(this.obj)
                    } else {
                        this.searchBox.value = null;
                        this.renderCodeFlag(null)
                    }
                }
            }
            this.props.onBlur && this.props.onBlur();
        }, 100);
    }

    handleOnInput(e) {
        if (e.target.value === '') {
            this.setState({
                trading_halt: false,
                codeFlag: null,
                dataSearch: []
            }, () => {
                this.props.allowDelete && this.props.dataReceivedFromSearchBox({}, true);
                this.searchBox.value = '';
            })
        }
        this.setTimeOutID && clearTimeout(this.setTimeOutID)
        this.searchBox.value = e.target.value;
        (this.searchBox.value + '').trim().length >= 2 ? this.setTimeOutID = setTimeout(() => {
            this.searchSymbol(SymbolClass.ALL_TYPES, true)
        }, 300) : this.setState({ dataSearch: [] })
    }

    search() {
        try {
            const dataSearch = this.state.dataSearch
            let current = document.querySelector(`.itemSuggest_${this.id}.itemSuggestSetHover`);
            this.disableDropdown();
            if (current) {
                if (!current.classList.contains('parentItem')) {
                    let data = current.parentNode;
                    this.props.dataReceivedFromSearchBox(data.itemData)
                    if (this.props.isNewVersion) {
                        this.obj = data.itemData
                        this.searchBox.value = data.itemData.security_name || data.itemData.company_name || data.itemData.company || ''
                    } else this.searchBox.value = data.itemData.display_name || ''
                    this.renderCodeFlag(data.itemData)
                    this.searchBox.blur()
                    this.setState({
                        dataSearch: [],
                        trading_halt: !!data.itemData.trading_halt
                    })
                }
            } else {
                this.setTimeOutID && clearTimeout(this.setTimeOutID);
                (this.searchBox.value + '').trim().length >= 2 ? this.setTimeOutID = setTimeout(() => {
                    const stringSearch = (this.searchBox.value + '').trim().toUpperCase();
                    let className = 'equity,future,etf,mf,warrant,option,forex';
                    const url = makeMarketUrl(`symbol/company_name?class=${this.props.onlyFuture ? 'future' : className}&status=active&symbol=${encodeURIComponent(stringSearch)}&top=30`);
                    this.props && this.props.loading(true)
                    getData(url)
                        .then(response => {
                            this.props && this.props.loading && this.props.loading(false)
                            if (response && response.data && response.data.length) {
                                if (response.data[0].class === 'future' && !response.data[0].master_code) return;
                                let checkConflict = 0;
                                for (let i = 0; i < response.data.length; i++) {
                                    if (response.data[i].display_name.indexOf(stringSearch) > -1) {
                                        checkConflict++;
                                        this.props.dataReceivedFromSearchBox(response.data[i])
                                        this.renderCodeFlag(response.data[i])
                                        if (this.props.isNewVersion) {
                                            this.searchBox.value = response.data[i].security_name || response.data[i].company_name || response.data[i].company || ''
                                        } else this.searchBox.value = response.data[i].display_name || ''
                                        let tradingHalt = false
                                        if (response.data[i].trading_halt === 1) {
                                            tradingHalt = true
                                        }
                                        this.setState({
                                            dataSearch: [],
                                            trading_halt: tradingHalt
                                        })
                                        return
                                    }
                                }
                                if (checkConflict === 0) {
                                    this.props.dataReceivedFromSearchBox(response.data[0])
                                    this.renderCodeFlag(response.data[0])
                                    if (this.props.isNewVersion) {
                                        this.searchBox.value = response.data[0].security_name || response.data[0].company_name || response.data[0].company || ''
                                    } else this.searchBox.value = response.data[0].display_name || ''
                                    let tradingHalt = false
                                    if (response.data[0].trading_halt === 1) {
                                        tradingHalt = true
                                    }
                                    this.setState({
                                        dataSearch: [],
                                        trading_halt: tradingHalt
                                    })
                                }
                            } else {
                                this.outside = true;
                                this.handlerClickOutside();
                            }
                        })
                        .catch(error => {
                            this.props && this.props.loading && this.props.loading(false)
                        })
                }, 300) : this.setState({ dataSearch: [] }, () => {
                    this.props.allowDelete && this.props.dataReceivedFromSearchBox({}, true);
                    this.searchBox.value = '';
                })
            }
        } catch (error) {
            logger.error('search On SearchBox' + error)
        }
    }

    isParentItem = () => {
        try {
            const currentHoverItem = document.querySelector('.itemSuggestSetHover')
            if (
                currentHoverItem &&
                currentHoverItem.classList &&
                currentHoverItem.classList.length &&
                Array.from(currentHoverItem.classList).includes('parentItem')
            ) return true
            return false
        } catch (error) {
            return false
        }
    }

    handleKeyPress = (event) => {
        try {
            if (event.key === 'Enter') {
                if (!this.isParentItem()) {
                    this.isFocus = false;
                    this.search();
                } else {
                    let current = document.querySelector(`.itemSuggest_${this.id}.itemSuggestSetHover`);
                    let data = current.parentNode.itemData;
                    this.callbackFn && this.callbackFn[data.symbol] && this.callbackFn[data.symbol]();
                }
            }
        } catch (error) {
            logger.error('handleKeyPress On SearchBox' + error)
        }
    }

    handleClickGo = () => {
        try {
            if (!this.props.placing) this.search();
        } catch (error) {
            logger.error('handleClickGo On SearchBox' + error)
        }
    }

    showSuggest() {
        try {
            if (this.state.dataSearch.length > 0) {
                return 'size--3 '
            } else {
                return `size--3 ${this.searchBox && this.searchBox.value && this.searchBox.value.length > 1 && this.isFocus ? '' : 'disable'}`
            }
        } catch (error) {
            logger.error('showSuggest On SearchBox' + error)
        }
    }

    searchSymbol(type, isFirst) {
        try {
            this.props && this.props.isSelectedOption && this.props.isSelectedOption(true)
            const stringSearch = ((this.searchBox && this.searchBox.value) || '').trim();
            type = type || this.state.typeSearch;
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
                trading_halt: false
            }, () => {
                isFirst && this.loadDropdown();
                let className = '';
                switch (type) {
                    case SymbolClass.ALL_TYPES: className = 'equity,future,etf,mf,warrant,option,forex'; break;
                    default: className = type; break;
                }
                const onlyASX = this.props.onlyASX ? '&exchange=ASX' : ''
                const url = makeMarketUrl(`symbol/company_name?class=${this.props.onlyFuture ? 'future' : className}&status=active&symbol=${encodeURIComponent(stringSearch)}&top=30${onlyASX}`);
                this.props && this.props.loading && this.props.loading(true)
                getData(url)
                    .then((response) => {
                        this.props && this.props.loading && this.props.loading(false)
                        if (this.searchBox && (this.searchBox.value + '').trim() !== stringSearch) return
                        if (response.data) {
                            const data = response.data
                            this.originData = data;
                            this.setState({
                                loadingSearch: false,
                                dataSearch: data,
                                typeSearch: type
                            }, () => {
                                this.loadDropdown()
                            })
                        }
                    })
                    .catch(error => {
                        this.props && this.props.loading && this.props.loading(false)
                        this.setState({ loadingSearch: false }, () => {
                            this.loadDropdown()
                        })
                    })
            })
        } catch (error) {
            logger.error('searchSymbol On SearchBox' + error)
        }
    }

    clickItemSuggest(item) {
        try {
            this.isFocus = false;
            if (this.props.isNewVersion) this.obj = item
            else this.searchBox.value = item.display_name;
            this.renderCodeFlag(item)
            this.setState({
                dataSearch: []
            })
            this.disableDropdown();
            this.props.dataReceivedFromSearchBox(item)
        } catch (error) {
            logger.error('clickItemSuggest On SearchBox' + error)
        }
    }

    renderSuggest() {
        try {
            let listSearch = this.state.dataSearch
            if (!listSearch || listSearch.length === 0) {
                if (this.searchBox && this.searchBox.value && this.searchBox.value.length > 1) {
                    return <div className='emptyListSuggest text-capitalize'>
                        <Lang>lang_no_data</Lang>
                    </div>
                } else {
                    return null
                }
            }
            return <ListSuggest
                checkNewOrder={this.props.checkNewOrder}
                contingentOrder={this.props.contingentOrder}
                id={this.id}
                listSearch={listSearch}
                callback={(fn, index) => this.callbackFn[index] = fn}
                textSearch={this.searchBox.value}
                clickItemSuggest={this.clickItemSuggest.bind(this)}
            />
        } catch (error) {
            logger.error('renderSuggest On SearchBox' + error)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (dataStorage.checkUpdate) {
                return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state)
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On SearchBox', error)
        }
    }

    renderCodeFlag(obj, res) {
        if (this.props.isNewVersion) return
        let codeFlag = '';
        if (obj && obj.country) {
            codeFlag = obj.country
        } else if (obj && obj.exchanges && obj.exchanges[0]) {
            const exchange = obj.exchanges[0]
            if (exchange && exchange !== '--') {
                if (!isAUSymbol(exchange)) {
                    codeFlag = 'USA'
                } else {
                    codeFlag = 'AUS'
                }
            }
        }
        if (res) return codeFlag
        this.setState({
            codeFlag
        });
    }

    loadDropdown() {
        const div = document.getElementById('dropDownContent');
        if (this.floatContent && div && div.children && div.children[0]) {
            ReactDOM.render(this.renderSearchResultContent(), this.floatContent);
        } else {
            this.setWrapperRef()
        }
    }

    disableDropdown() {
        if (this.floatContent) {
            ReactDOM.render(null, this.floatContent);
            this.floatContent.parentNode && this.floatContent.parentNode.removeChild(this.floatContent);
            this.floatContent = null;
            if (this.props.isNewVersion) {
                this.searchBox.value = this.obj.security_name || this.obj.company_name || this.obj.company || ''
                this.searchBox.classList.remove('focus')
            }
        }
    }

    renderSearchResultContent() {
        return (
            <div className={`searchSuggest ${this.showSuggest()} `}>
                <div className='searchSuggestHeader text-uppercase'>
                    <div className={this.state.typeSearch === SymbolClass.ALL_TYPES ? 'active' : ''} onClick={() => this.searchSymbol(SymbolClass.ALL_TYPES)}><Lang>{LANG_CLASS.ALL_TYPES}</Lang></div>
                    <div className={this.state.typeSearch === SymbolClass.EQUITY ? 'active' : ''} onClick={() => this.searchSymbol(SymbolClass.EQUITY)}><Lang>{LANG_CLASS.EQUITY}</Lang></div>
                    <div className={this.state.typeSearch === SymbolClass.ETF ? 'active' : ''} onClick={() => this.searchSymbol(SymbolClass.ETF)}><Lang>{LANG_CLASS.ETF}</Lang></div>
                    <div className={this.state.typeSearch === SymbolClass.MF ? 'active' : ''} onClick={() => this.searchSymbol(SymbolClass.MF)}><Lang>{LANG_CLASS.MANAGED_FUNDS}</Lang></div>
                    <div className={this.state.typeSearch === SymbolClass.WARRANT ? 'active' : ''} onClick={() => this.searchSymbol(SymbolClass.WARRANT)}><Lang>{LANG_CLASS.WARRANT}</Lang></div>
                    <div className={this.state.typeSearch === SymbolClass.FUTURE ? 'active' : ''} onClick={() => this.searchSymbol(SymbolClass.FUTURE)}><Lang>{LANG_CLASS.FUTURES}</Lang></div>
                    <div className={this.state.typeSearch === SymbolClass.OPTION ? 'active' : ''} onClick={() => this.searchSymbol(SymbolClass.OPTION)}><Lang>{LANG_CLASS.OPTION}</Lang></div>
                    <div className={this.state.typeSearch === SymbolClass.FX ? 'active' : ''} onClick={() => this.searchSymbol(SymbolClass.FX)}><Lang>{LANG_CLASS.FX}</Lang></div>
                </div>
                <div style={{ height: this.height + 'px !important', maxHeight: this.height, minHeight: this.height, overflow: 'auto' }}>
                    <div ref={dom => {
                        this.dropDownBox = dom;
                    }}>
                        {this.state.loadingSearch ? <div className={dataStorage.theme === 'theme-dark' ? 'loaderGridDark' : 'loaderGrid'}></div> : this.renderSuggest()}
                    </div>
                </div>
            </div>
        );
    }
    setSearchSuggestPosition() {
        const node = this.dom;
        if (node && node.offsetParent) {
            const rect = node.getBoundingClientRect();
            let top = rect.top + node.offsetHeight;
            let left = rect.left;
            if (this.props.refChart) {
                const chart = this.props.refChart.getBoundingClientRect();
                top += chart.top;
                left += chart.left;
            }
            const totalWidth = left + 555;
            const spaceBottom = window.innerHeight - top;
            if (rect.top > spaceBottom && spaceBottom < 100) {
                this.height = (rect.top > 336 ? 336 : rect.top - 33);
                this.floatContent.style.bottom = (spaceBottom + node.offsetHeight) + 'px';
                this.floatContent.style.maxHeight = this.height;
                this.floatContent.style.height = this.height;
                this.floatContent.style.top = null;
            } else {
                this.height = (spaceBottom > 336 ? 336 : spaceBottom - 33);
                this.floatContent.style.top = top + 'px';
                this.floatContent.style.bottom = null
                this.floatContent.style.maxHeight = this.height;
                this.floatContent.style.height = this.height;
            }
            if (totalWidth > window.innerWidth) {
                const fontSize = localStorageNew.getItem('lastFontSize', true) || 'medium';
                const spaceLeft = left + node.offsetWidth - WidthbyFont[fontSize] + 2
                if (spaceLeft < 0) this.floatContent.style.left = '0px'
                else this.floatContent.style.left = spaceLeft + 'px'
            } else {
                this.floatContent.style.left = left + 'px';
            }
        }
    }
    setWrapperRef() {
        try {
            let div = getDropdownContentDom()
            this.floatContent = document.createElement('div');
            div.appendChild(this.floatContent);
            this.floatContent.style.position = 'absolute';
            this.floatContent.style.display = 'block';
            this.floatContent.style.minWidth = '220px'
            this.setSearchSuggestPosition()
            ReactDOM.render(this.renderSearchResultContent(), this.floatContent);
        } catch (error) {
            logger.error('setWrapperRef error SearchBox', error)
        }
    }

    render() {
        try {
            return (
                <div className={'nodeSearchBox'} ref={dom => this.dom = dom}>
                    <div
                        style={{ filter: this.placing ? 'brightness(70%)' : 'brightness(100%)' }}
                        className={'inputAddon size--3'}
                    >
                        {this.state.trading_halt ? <div className={`haltSearchbox ${s.colorSell} size--3`}>{'! '}</div> : null}
                        <input
                            className={`${this.state.trading_halt ? 'inputHalt ' : ''}${this.props.isNewVersion ? 'newVersion ' : ''}size--3`}
                            ref={dom => {
                                if (dom) {
                                    this.searchBox = dom;
                                    if (this.props.refDom) this.props.refDom(dom);
                                }
                            }}
                            id={`searchBoxSelector_${this.id}`}
                            disabled={!!this.props.placing}
                            type='text'
                            defaultValue={this.props.obj && this.props.obj.display_name}
                            onInput={this.handleOnInput.bind(this)}
                            onKeyPress={this.handleKeyPress}
                            onBlur={this.handleOnBlur.bind(this)}
                            onFocus={this.handleOnFocus.bind(this)}
                            required
                        />
                        <div className={`placeHolder text-capitalize`}><Lang>{this.props.placeholder || 'lang_search_code'}</Lang></div>
                        <div className={`flagIcon ${this.state.codeFlag ? '' : 'hidden'} `}>{this.state.codeFlag ? <Flag countryCode={this.state.codeFlag} /> : null}</div>
                        <Button mini={true} className='button text-capitalize' onClick={this.handleClickGo}><Lang>lang_go</Lang></Button>
                    </div>
                </div>
            )
        } catch (error) {
            logger.error('render On SearchBox' + error)
        }
    }

    handlerClickOutside(e) {
        if (this.outside || ((this.dom && !this.dom.contains(e.target)) && (this.floatContent && !this.floatContent.contains(e.target)) && (e.target && e.target.className && !['listSuggest', 'nodeSearchBox', 'iconAddcode'].includes(e.target.className.baseVal || e.target.className)))) {
            this.disableDropdown()
            this.outside = false;
            if (!this.props.allowDelete) {
                if (this.obj) {
                    if (this.props.isNewVersion) {
                        this.searchBox.value = this.obj.security_name || this.obj.company_name || this.obj.company || ''
                    } else {
                        if (this.obj.display_name) {
                            this.searchBox.value = this.obj.display_name;
                            this.renderCodeFlag(this.obj)
                        } else {
                            this.searchBox.value = null;
                            this.renderCodeFlag(null)
                        }
                    }
                }
            }
        }
    }

    componentDidMount() {
        try {
            this.lastDownTarget = null;
            document.addEventListener('mousedown', this.listenerMouseDown.bind(this), false);
            document.addEventListener('click', e => this.handlerClickOutside(e));
            this.searchBox.addEventListener('keydown', this.listenerKeyDown.bind(this), false);
        } catch (error) {
            logger.error('componentDidMount On SearchBox' + error)
        }
    }
}

export default SearchBox;
