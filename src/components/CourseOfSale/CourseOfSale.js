import React from 'react';
import uuidv4 from 'uuid/v4';
import Grid from '../Inc/CanvasGrid';
import ToggleLine from '../Inc/ToggleLine';
import SearchBox from '../SearchBox';
import { checkPropsStateShouldUpdate, formatNumberPrice, formatNumberVolume } from '../../helper/functionUtils';
import { getData, makePriceLevel1UrlNew } from '../../helper/request';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import s from './CourseOfSale.module.css';
import Price from '../FlashingPriceHeader'
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';
import { addPriceListener, removePriceListener } from '../../helper/priceSource'
import MapRoleComponent from '../../constants/map_role_component'

class CourseOfSale extends React.Component {
  constructor(props) {
    super(props);
    const initState = this.props.loadState();
    this.id = uuidv4();
    this.priceObj = {}
    this.isFirst = true
    this.state = {
      symbolObj: {},
      collapse: initState.collapse
    }
    this.props.receive({
      symbol: this.symbolChanged
    });
  }

  column() {
    return [
      {
        header: 'lang_filled_time',
        name: 'time',
        suppressFilter: true,
        type: TYPE.DATE,
        dateFormat: 'HH:mm:ss'
      },
      {
        header: 'lang_quantity',
        name: 'quantity',
        align: 'center',
        suppressFilter: true,
        formater: (params) => {
          return formatNumberVolume(params.data.quantity, true)
        }
      },
      {
        header: 'lang_filled',
        name: 'price',
        align: 'center',
        suppressFilter: true,
        formater: (params) => {
          return formatNumberPrice(params.data.price, true)
        }
      },
      {
        header: 'lang_button',
        name: 'button',
        type: 'quickBuySell',
        role: MapRoleComponent.NEW_ORDER,
        float: true
      }
    ]
  }

  symbolChanged = (symbolObj) => {
    try {
      if (!symbolObj) return;
      removePriceListener(this.realtimePrice)
      this.priceObj = {}
      this.setData([])
      this.setState({ symbolObj }, () => {
        this.isFirst = true
        addPriceListener(this.state.symbolObj, this.realtimePrice)
      });
    } catch (error) {
      logger.error('changeValue On TimeAndSale' + error)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    try {
      if (dataStorage.checkUpdate) {
        return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
      }
      return true;
    } catch (error) {
      logger.error('shouldComponentUpdate On TimeAndSale', error)
    }
  }

  render() {
    try {
      return (
        <div className={s.container} ref={dom => this.dom = dom}>
          <div className={this.state.collapse ? s.collapse : ''}>
            <SearchBox
              dataReceivedFromSearchBox={(symObj) => {
                this.symbolChanged(symObj);
                this.props.send({ symbol: symObj });
              }}
              placeholder='lang_search_symbol'
              obj={this.state.symbolObj}
              isNewVersion={true}
              refDom={dom => this.searchSymbolDom = dom} />
            <section style={{ padding: '8px 0' }}>
              <p className='size--7 showTitle' style={{ marginBottom: '8px' }}>{this.state.symbolObj.display_name || '--'}</p>
              <Price size='size--' field='trade_price' priceObj={this.priceObj || {}} symbolObj={this.state.symbolObj} />
              <Price size='size--4' field='change_point' priceObj={this.priceObj || {}} />
              <Price size='size--4' field='change_percent' priceObj={this.priceObj || {}} />
            </section>
          </div>
          <ToggleLine collapse={this.state.collapse} collapseFunc={() => {
            this.props.saveState({
              collapse: !this.state.collapse
            })
            this.setState({ collapse: !this.state.collapse })
          }} />
          <div className='blankSpace'></div>
          <div className={s.grid}>
            <Grid
              {...this.props}
              showProvider={true}
              id={FORM.COURSE_OF_SALE}
              fn={fn => {
                this.setData = fn.setData
                this.getData = fn.getData
                this.autoSize = fn.autoSize
              }}
              columns={this.column()}
              fnKey={data => {
                return data.index
              }}
              sort={{
                index: 'asc'
              }}
              autoFit={true}
              onlySystem={true}
            />
          </div>
        </div>
      );
    } catch (error) {
      logger.error('render On TimeAndSale' + error)
    }
  }

  componentWillUnmount() {
    try {
      removePriceListener(this.realtimePrice)
      // unregisterAllOrders(this.realtimePrice, 'portfolio')
    } catch (error) {
      logger.error('componentWillUnmount On TimeAndSale' + error)
    }
  }

  realtimePrice = (obj) => {
    if (!obj) {
      this.priceObj = {}
      this.setData([])
      this.forceUpdate()
      return
    }
    if (obj.quote) {
      // if (!obj.quote.trade_price) obj.quote.trade_price = null
      Object.assign(this.priceObj, obj.quote)
    }
    if (this.isFirst) {
      this.isFirst = false
      if (!obj.trades) obj.trades = []
    }
    if (obj.trades) {
      if (Array.isArray(obj.trades)) {
        this.setData(obj.trades);
      } else {
        let dataArr = this.getData();
        dataArr.unshift(obj.trades);
        if (dataArr.length > 50) dataArr.length = 50
        dataArr = dataArr.map((x, i) => {
          x.index = i
          return x
        })
        this.setData(dataArr);
      }
    }
  }

  componentDidMount() {
    try {
      // registerAllOrders(this.realtimePrice, 'portfolio')
    } catch (error) {
      logger.error('componentDidMount On CourseOfSale' + error)
    }
  }
}

export default CourseOfSale;
