import React from 'react';
import Icon from '../Inc/Icon';
import logger from '../../helper/log';
import Flag from '../Inc/Flag';
import Lang from '../Inc/Lang/Lang';
import ListSuggest from './ListSuggest';
import { getData, makeMarketUrl } from '../../helper/request';
import dataStorage from '../../dataStorage';
import Color from '../../constants/color'
import { LANG_CLASS } from '../../constants/symbol_class';

class ItemSuggest extends React.Component {
    constructor(props) {
        super(props);
        this.isFirst = true;
        this.checkCount = 0;
        this.state = {
            isShow: false,
            isFull: false,
            item: props.item,
            textSearch: props.textSearch,
            lstExisted: props.lstExisted,
            check: !!(props.lstExisted && props.lstExisted[props.item.symbol]),
            listSearch: []
        }
        this.getSymbolExpand = this.getSymbolExpand.bind(this);
        this.onExpand = this.onExpand.bind(this);
        this.onCollapse = this.onCollapse.bind(this);
        this.updateAllChild = this.updateAllChild.bind(this);
        this.props.callback && this.props.callback(this.onExpand, this.props.isAddcode ? this.props.index : this.props.keyItem)
        this.isChildShow = false;
    }

    componentWillReceiveProps(nextProps) {
        try {
            if (nextProps.item && nextProps.item.symbol && nextProps.item.symbol === this.state.item.symbol) return;
            this.setState({
                item: nextProps.item,
                lstExisted: nextProps.lstExisted,
                check: nextProps.isParent ? (this.state.listSearch.length ? this.checkCount === this.state.listSearch.length : false) : !!(nextProps.lstExisted && nextProps.lstExisted[nextProps.item.symbol]),
                textSearch: nextProps.textSearch
            })
        } catch (error) {
            logger.error('componentWillReceiveProps On SearchBox' + error)
        }
    }

    handleOnClickSearch() {
        try {
            if (this.props.isAddcode) {
                if (this.state.check) {
                    this.props.count && this.props.count(-1);
                    delete this.state.lstExisted[this.state.item.display_name];
                } else {
                    this.props.count && this.props.count(1);
                    this.state.lstExisted[this.state.item.symbol] = this.state.item;
                }
                this.setState({ check: !this.state.check, lstExisted: this.state.lstExisted });
            }
            if (this.props.clickItemSuggest) {
                this.props.clickItemSuggest(this.state.item)
            }
        } catch (error) {
            logger.error('handleOnClickSearch On SearchBox' + error)
        }
    }

    renderTag() {
        return (
            <div className={`symbolClassTag ${this.state.item.class}_background size--0`}>
                {(this.state.item.class + '').toUpperCase().slice(0, 2)}
            </div>
        );
    }

    renderClass() {
        return (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }} onClick={() => {
                if (!this.props.isParent) return;
                this.onExpand()
            }}>
                <div className='classSymbol size--1'>{(LANG_CLASS[this.state.item.class] ? dataStorage.translate(LANG_CLASS[this.state.item.class]) : '').toUpperCase()}</div>
                {this.renderTag()}
            </div>
        );
    }

    onCollapse() {
        if (this.state.isShow) {
            this.isChildShow = false
            this.setState({ isShow: false })
        }
    }

    onExpand() {
        if (this.props.contingentOrder && this.props.item && this.props.item.class !== 'equity' && this.props.item.class !== 'future') return;
        if (this.props.isParent) {
            this.isChildShow = true;
            this.showAllSymbol()
        } else {
            this.handleOnClickSearch()
        }
    }

    showAllSymbol() {
        if (this.isFirst) {
            this.isFirst = false;
            this.getSymbolExpand()
        } else {
            if (this.state.isShow) this.isChildShow = false;
            else this.isChildShow = true;
            this.setState({ isShow: !this.state.isShow })
        }
    }

    getSymbolExpand(cb) {
        if (!this.state.item || !this.state.item.symbol) return;
        const lstExisted = this.state.lstExisted || [];
        const that = this;
        const lst = [`master_code=${this.state.item.symbol}`, 'status=active'];
        if (!this.state.textSearch.includes('.') || !this.state.item.display_name.includes(this.state.textSearch.toUpperCase())) {
            lst.push(`filter=${this.state.textSearch}`);
        }
        const url = makeMarketUrl(`symbol?${lst.join('&')}`);
        this.props.isParent && !this.props.isChildren && this.props.setCollapseIndex && this.props.setCollapseIndex(this.props.keyItem)
        getData(url).then(response => {
            const data = (response && response.data) || [];
            that.checkCount = 0;
            for (let i = 0; i < data.length; i++) {
                if (data[i] && data[i].display_name && lstExisted[data[i].symbol]) {
                    that.checkCount++;
                }
                if (cb) {
                    lstExisted[data[i].symbol] = data[i];
                }
            }
            cb && (that.checkCount = data.length);
            this.setState({
                listSearch: data,
                check: cb ? !this.state.check : !!(that.checkCount === data.length),
                lstExisted,
                isShow: true
            }, () => {
                this.props.collapseCb && this.props.collapseCb(this.onCollapse)
                cb && cb();
            })
        }).catch(error => {
            logger.error('getSymbolExpand On itemSuggest' + error)
        })
    }

    renderTextMatch(text) {
        const textSearch = (this.state.textSearch + '').toUpperCase();
        if (!text || !this.state.textSearch) return '';
        const lstSplit = text.split(textSearch);
        if (lstSplit.length === 1) return text;
        const res = [];
        for (let i = 0; i < lstSplit.length; i++) {
            if (lstSplit[i]) res.push(lstSplit[i]);
            if (i < lstSplit.length - 1) res.push(<span key={`text_match_${i}`} title={text} className='matchTextSearch'>{textSearch}</span>)
        }
        return res;
    }

    count(num) {
        this.checkCount += num;
        if (this.checkCount === this.state.listSearch.length) {
            this.setState({ check: true })
        } else {
            this.setState({ check: false })
        }
    }

    updateAllChild = (action) => {
        const { check, listSearch } = this.state;
        if (listSearch && listSearch.length) {
            const listObj = [];
            for (let i = 0; i < listSearch.length; i++) {
                listObj.push({
                    symbol: listSearch[i].symbol,
                    rank: +new Date()
                })
            }
            this.props.updateAll && this.props.updateAll(listObj, 'add')
        }
    }

    removeAll = () => {
        const { check, listSearch, lstExisted } = this.state;
        this.checkCount = 0;
        if (listSearch && listSearch.length) {
            const listObj = [];
            for (let i = 0; i < listSearch.length; i++) {
                listObj.push({
                    symbol: listSearch[i].symbol,
                    rank: 0
                })
                delete lstExisted[listSearch[i].symbol];
            }
            this.setState({
                lstExisted,
                check: false,
                show: true
            }, () => {
                this.props.updateAll && this.props.updateAll(listObj, 'remove')
            })
        }
    }
    checkDisableContigent() {
        if (this.props.checkNewOrder) {
            if (!this.props.contingentOrder) {
                if (dataStorage.env_config.roles.disableExchange && this.props.item && this.props.item.exchanges && this.props.item.exchanges[0] === dataStorage.env_config.roles.disableExchange.includes(this.props.item.exchanges[0])) {
                    return true
                }
                if (dataStorage.env_config.roles.disableSymbolClass && dataStorage.env_config.roles.disableSymbolClass.includes(this.props.item.class)) {
                    return true
                }
                return false
            };
            if (this.props.item && this.props.item.exchanges && this.props.item.exchanges[0] === 'NSX') {
                return true
            } else if (this.props.item.class !== 'equity' && this.props.item.class !== 'future') {
                return true
            }
            return false;
        }
    }

    render() {
        try {
            const { item, isShow, textSearch, listSearch, check, lstExisted } = this.state;
            const { isParent, isChildren, isAddcode } = this.props;
            const disableContingent = this.checkDisableContigent()
            return (
                <div id={`listSuggest`} className={`${isChildren ? 'isChild' : ''}`} ref={dom => dom && (dom.itemData = this.props.item)} style={{ paddingLeft: isChildren ? 8 : 0 }
                }>
                    <div id={`itemSuggest_${this.props.id}_${this.props.index}`} className={`itemSuggest itemSuggest_${this.props.id} ${isParent ? 'parentItem' : ''} ${this.isChildShow ? 'childShow' : ''} ${disableContingent ? 'disabled' : ''}`} key={this.props.id} onClick={() => {
                        if (isParent) return;
                        if (disableContingent) return;
                        this.onExpand()
                    }}>
                        <div className='expandSuggest' style={{ width: isAddcode ? (isChildren ? 34 : 38) : 20, height: 24, display: 'flex', flexDirection: 'row', justifyContent: isChildren ? 'flex-end' : 'flex-start', paddingRight: isChildren ? 4 : 0 }} >
                            {
                                isAddcode ? (!isParent ? <Icon onClick={() => {
                                    if (isParent) {
                                        if (check) {
                                            this.removeAll();
                                        } else {
                                            this.getSymbolExpand(this.updateAllChild)
                                        }
                                    }
                                }} className='iconAddcode' style={{ width: 16, height: isAddcode ? 22 : 20 }} src={check ? 'navigation/check' : 'content/add'} color={check ? 'var(--buy-light)' : 'var(--secondary-default)'} /> : <div style={{ width: 16 }}></div>) : null
                            }
                            {
                                isParent ? <Icon className='iconAddcode' onClick={() => this.onExpand()} src={`hardware/keyboard-arrow-${isShow ? 'down' : 'right'}`} style={{ marginTop: 1, height: isAddcode ? 22 : 20, width: 18 }} /> : null
                            }
                        </div>
                        <div className='itemSuggestSymbol showTitle html' onClick={() => {
                            if (!isParent) return;
                            this.onExpand()
                        }}>
                            {
                                item.trading_halt ? <div className='trading-halt-symbol'>!</div> : null
                            }
                            {this.renderTextMatch(item.display_name)}
                            {disableContingent ? <i className='hiddenText'><br /><Lang>{this.props.contingentOrder ? 'lang_contingent_order_not_support1' : 'lang_new_order_not_support'}</Lang> <br /> <Lang>lang_contingent_order_not_support2</Lang></i> : null}
                        </div>
                        <div className='divFlag' style={{ marginLeft: isChildren ? -3 : 2 }} onClick={() => {
                            if (!isParent) return;
                            this.onExpand()
                        }}><Flag symbolObj={item} countryCode={item.country} /></div>
                        <div className='itemSuggestCompanyName showTitle html' onClick={() => {
                            if (!isParent) return;
                            this.onExpand()
                        }}>{this.renderTextMatch((item.company_name || item.company || item.security_name || '').toUpperCase())}{disableContingent ? <i className='hiddenText'><br /><Lang>{this.props.contingentOrder ? 'lang_contingent_order_not_support1' : 'lang_new_order_not_support'}</Lang> <br /> <Lang>lang_contingent_order_not_support2</Lang></i> : null}</div>
                        {item && item.class ? this.renderClass() : null}
                    </div>
                    {
                        isShow ? <ListSuggest
                            count={this.count.bind(this)}
                            isAddcode={isAddcode}
                            isChildren={true}
                            id={this.props.id}
                            lstExisted={lstExisted}
                            textSearch={textSearch}
                            listSearch={listSearch}
                            clickItemSuggest={this.props.clickItemSuggest}
                        /> : null
                    }
                </div >
            )
        } catch (error) {
            logger.error('render On SearchBox' + error)
        }
    }
}

export default ItemSuggest
