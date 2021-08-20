import React from 'react';
import IFrame from '../Inc/IFrame';
import Icon from '../Inc/Icon';
import Lang from '../Inc/Lang';
import logger from '../../helper/log';
import SearchBox from '../SearchBox';
import DropDown from '../DropDown';
import { getData } from '../../helper/request';
import {
  formatNumberValue,
  formatNumberPrice,
  clone,
  getSymbolAccountWhenFirstOpenLayout,
  resetSymbolOfLayout,
  getLogo
} from '../../helper/functionUtils';
import Flag from '../Inc/Flag';
import { translate } from 'react-i18next';
import dataStorage from '../../dataStorage';
import uuidv4 from 'uuid/v4';
import SecurityDetailIcon from '../Inc/SecurityDetailIcon/SecurityDetailIcon'
import NoTag from '../Inc/NoTag/NoTag';
import { addPriceListener, removePriceListener } from '../../helper/priceSource'
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'

const URL_SUPPORT_SYMBOL = 'https://api.tipranks.com/api/stocks/tickers/?X-APIKey=TR_OpenMarkets&X-APIToken=aa3215b3-aef3-5d2a-a345-8173aea3fa32';

class EmbeddedWebsite extends React.Component {
  constructor(props) {
    super(props);
    const initState = this.props.loadState();
    this.id = uuidv4();
    this.state = {
      src: '',
      trading_halt: false,
      symbol: '',
      display_name: '',
      symbolObj: {},
      exchange: '',
      random: 0
    };
    this.value = '--';
    this.options = this.props.options;
    if (this.props.tiprank && this.options && this.options[0]) {
      this.tipRankType = this.options[0].label;
      this.disbleButton = false
    }
    this.dropDownValue = initState.dropDownValue || (this.options[0] && this.options[0].value);
    props.resize((w, h) => {
      this.showNameCompany(w)
    });
    this.keepColor = false;
    this.getListSupportSymbol();
    props.receive({
      symbol: this.symbolChanged.bind(this)
    });
  }

  getListSupportSymbol(cb) {
    getData(URL_SUPPORT_SYMBOL)
      .then(res => {
        if (res && res.data && res.data.tickers) {
          dataStorage.listSupportedTipRank = res.data.tickers.toString();
        }
        cb && cb();
      })
      .catch(error => {
        cb && cb();
        logger.log('get list support symbol tipranks error' + error);
      })
  }

  showNameCompany(width) {
    try {
      if (width < 640) {
        if (!this.dom.classList.contains('breakLineCompany')) {
          this.dom.classList.add('breakLineCompany');
        }
      } else {
        if (this.dom.classList.contains('breakLineCompany')) {
          this.dom.classList.remove('breakLineCompany');
        }
      }
    } catch (error) {
      logger.error('resizeButton On CompanyInfo' + error)
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
        if (!data.trade_price) {
          this.domPrice.children[0].classList.remove('priceDown');
          this.domPrice.children[0].classList.remove('priceUp');
        } else {
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
      this.domPrice.children[2].style.paddingLeft = '4px'
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

  symbolChanged = (symbolObj) => {
    try {
      let symbol = '';
      const cb = () => {
        const { newSymbolObj } = getSymbolAccountWhenFirstOpenLayout()
        if (Object.keys(newSymbolObj).length) {
          symbolObj = newSymbolObj
          resetSymbolOfLayout()
          this.props.send({
            symbol: symbolObj,
            force: true
          });
        }
        removePriceListener(this.realtimePrice)
        this.symbolObj = symbolObj;
        addPriceListener(this.symbolObj, this.realtimePrice)
        if (this.props.tiprank) {
          if (!symbolObj || !symbolObj.symbol) return
        }
        symbol = symbolObj.symbol ? symbolObj.symbol.includes('.') ? symbolObj.symbol.split('.')[0] : symbolObj.symbol : '';
        this.props.saveState({
          symbolObj: symbolObj
        })
        let src = this.buildSrc(symbolObj) || '';
        this.setState({
          trading_halt: symbolObj.trading_halt || false,
          symbol,
          display_name: symbolObj.display_name || '',
          symbolObj: symbolObj,
          exchange: symbolObj.exchange || (symbolObj.exchanges && symbolObj.exchanges[0]) || '',
          src: src
        })
      }
      if (this.props.tiprank && !dataStorage.listSupportedTipRank) {
        this.getListSupportSymbol(cb)
      } else {
        cb();
      }
    } catch (error) {
      logger.error('changeValue On News', error)
    }
  }

  dropDownChanged(value) {
    this.dropDownValue = value;
    this.props.saveState({
      dropDownValue: value
    })
    if (this.props.tiprank) {
      if (value && (value + '').includes('coverage')) {
        this.tipRankType = this.options[0] && this.options[0].label;
      } else if (value && (value + '').includes('analysis')) {
        this.tipRankType = this.options[1] && this.options[1].label;
      }
    }
    if (this.symbolObj) {
      this.setState({
        src: this.buildSrc(this.symbolObj)
      })
    }
  }

  buildSrc(symbolObj) {
    if (!symbolObj || !symbolObj.symbol) return '';
    if (symbolObj.class === 'future') return 'future'
    let symbol, exchange;
    const m = symbolObj.symbol.match(/(.*)\.([^.]+)/)
    if (m) {
      if (this.props.tiprank) {
        if (dataStorage.listSupportedTipRank.includes(m[1])) {
          return this.dropDownValue + m[1].replace(/\//g, '.');
        }
        this.disbleButton = true;
        return '';
      } else {
        symbol = m[1];
        exchange = m[2];
      }
    } else {
      symbol = symbolObj.symbol;
      exchange = 'XASX';
    }
    return this.dropDownValue + '?ops=clear&t=' + exchange + ':' + symbol.replace(/\//g, '.');
  }

  goToLink() {
    const symbolObj = this.symbolObj;
    if (!symbolObj || !symbolObj.symbol) return;
    let symbol, exchange;
    const m = symbolObj.symbol.match(/(.*)\.([^.]+)/)
    if (m) {
      symbol = m[1];
      exchange = m[2];
    } else {
      symbol = symbolObj.symbol;
      exchange = 'XASX';
    }
    let url = ''
    if (this.props.tiprank) {
      url = this.dropDownValue + symbol.replace(/\//g, '.')
    } else {
      url = this.dropDownValue + '?t=' + exchange + ':' + symbol.replace(/\//g, '.')
    }
    window.open(url, '_blank');
  }

  refreshData() {
    try {
      if (this.state.src && this.iframe && (!this.props.tiprank || !this.state.exchange.includes('ASX'))) this.iframe.children[0].src = this.state.src
    } catch (error) {
      logger.error('refreshData On EmbeddedWebsite' + error)
    }
  }

  dataReceivedFromSearchBox(symbolObj) {
    try {
      if (this.dictSymbolObj) {
        this.changeSymbol = (this.dictSymbolObj !== symbolObj.symbol);
      }
      let symbol = '';
      this.symbolObj = symbolObj;
      if (this.props.tiprank) {
        if (!symbolObj || !symbolObj.symbol) return;
        symbol = symbolObj.symbol ? symbolObj.symbol.includes('.') ? symbolObj.symbol.split('.')[0] : symbolObj.symbol : '';
      }
      removePriceListener(this.realtimePrice)
      this.symbolObj = symbolObj;
      addPriceListener(this.symbolObj, this.realtimePrice)
      symbolObj && (this.dictSymbolObj = symbolObj.symbol);
      this.setState({
        trading_halt: (symbolObj && symbolObj.trading_halt) || false,
        symbol: symbolObj.symbol,
        display_name: symbolObj.display_name,
        symbolObj: symbolObj,
        exchange: symbolObj.exchange || (symbolObj.exchanges && symbolObj.exchanges[0]),
        src: this.buildSrc(symbolObj)
      });
      if (symbolObj && symbolObj.symbol) {
        this.props.send({
          symbol: symbolObj,
          force: true
        });
      }
    } catch (error) {
      logger.error('dataReceivedFromSearchBox On CompanyInfo' + error)
    }
  }

  realtimePrice = (obj) => {
    if (obj && obj.quote) {
      const data = obj.quote;
      if (data.trade_price || data.change_point || data.change_percent) {
        logger.log('streaming data', data)
        this.setDomPrice(data)
      }
    }
  }
  renderIframeOfTipRank(src) {
    try {
      if (!src) {
        return <div className='sd_nodata text-capitalize'><Lang>lang_no_data</Lang></div>
      }
      if (!this.props.tiprank) return (src !== 'future') ? <IFrame src={this.state.src} /> : <div className='sd_nodata text-capitalize'><Lang>lang_no_data</Lang></div>
      else {
        return (
          ((src !== 'future') && !this.state.exchange.includes('ASX'))
            ? <IFrame src={src} />
            : <div className='centerTipScreen'>
              <div className='tipRankNoDataContainer size--3'>
                <div><span className='text-capitalize'><Lang>lang_no</Lang> {this.tipRankType}</span></div>
                <div><div className='forSymbol'><span><Lang>lang_for</Lang> {this.state.display_name}</span></div><Flag symbolObj={this.state.symbolObj} /> <div className='nameOfExchange'>{`(${this.state.symbolObj.company_name || this.state.symbolObj.company || this.state.symbolObj.security_name || ''})`}</div></div>
              </div>
              <div className='logoOpenmarketEquixTipRanks'>
                <img src={getLogo()} height="29px" />
                <div style={{ width: '32px', height: '16px' }}></div>
                <img src='common/tipranks@3x.png' width="137px" height="55px" />
              </div>
            </div>
        );
      }
    } catch (error) {
      return <div className='sd_nodata text-capitalize'><Lang>lang_no_data</Lang></div>
    }
  }
  click2Refresh() {
    try {
      // this.setState({ random: this.state.random + 1 });
      this.refreshData()
      this.domBtnRefresh.children[0].classList.add('iconRefresh')
      setTimeout(() => {
        this.domBtnRefresh.children[0].classList.remove('iconRefresh')
      }, 1000)
    } catch (error) {
      logger.error('click2Refresh On Header1 ', error)
    }
  }
  render() {
    return <div id='parentIframe' className='external' ref={dom => this.dom = dom}>
      <div className='toolbar'>
        <div className='left'>
          <div>
            <div className='btnRefreshAndSearch'>
              {(dataStorage.enableStreamingUs || dataStorage.enableStreamingAu || dataStorage.enableStreamingFu) ? <NoTag><div onClick={this.click2Refresh.bind(this)} ref={dom => this.domBtnRefresh = dom} className='btnRefresh showTitle next'><Icon src={'navigation/refresh'} /></div><div className='text-capitalize' style={{ display: 'none' }}><Lang>lang_refresh</Lang></div></NoTag> : ''}
              <SearchBox
                resize={this.props.resize}
                loading={this.props.loading}
                trading_halt={this.state.trading_halt}
                getAllData={true}
                symbol={this.state.symbol}
                display_name={this.state.display_name}
                obj={this.state.symbolObj}
                dataReceivedFromSearchBox={this.dataReceivedFromSearchBox.bind(this)}
              />
            </div>
            <DropDown
              translate={true}
              options={this.options}
              value={this.dropDownValue}
              onChange={this.dropDownChanged.bind(this)} />
          </div>
          <div>
            <div className='text showTitle flexVerticalCenter'>
              <div className='text-overflow'>{this.state.symbolObj ? (this.state.symbolObj.company_name || this.state.symbolObj.company || this.state.symbolObj.security_name || '').toUpperCase() : ''}</div>
              <SecurityDetailIcon {...this.props} symbolObj={this.state.symbolObj} />
            </div>
            <div ref={dom => this.domPrice = dom} className='price right size--3'>
              <span className='size--4'>{!this.props.tiprank ? this.value : '--'}</span>
              <span>--</span>
              <span className='small'>(--%)</span>
              <div onClick={this.goToLink.bind(this)} className='goToLink'><Icon src={'action/open-in-new'} /></div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1 }} ref={dom => this.iframe = dom} >
        {
          this.renderIframeOfTipRank(this.state.src)
        }
      </div>
    </div>
  }

  componentWillUnmount() {
    removePriceListener(this.realtimePrice)
    removeEventListener(EVENTNAME.themeChanged, this.themeChanged)
    removeEventListener(EVENTNAME.clickToRefresh, this.refreshData)
  }
  themeChanged() {
    this.forceUpdate();
  }
  componentDidMount() {
    try {
      if (this.dom) {
        this.showNameCompany(this.dom.clientWidth)
      }
      addEventListener(EVENTNAME.themeChanged, this.themeChanged)
      addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
    } catch (error) {
      logger.error('componentDidMount On EmbeddedWebsite' + error)
    }
  }
}

export default translate('translations')(EmbeddedWebsite);
