import React from 'react';
import ReactDOM from 'react-dom';
import uuidv4 from 'uuid/v4';
import Grid from '../Inc/Grid';
import { func } from '../../storage';
import { emitter, eventEmitter, emitterRefresh, eventEmitterRefresh } from '../../constants/emitter_enum';
import { checkPropsStateShouldUpdate, formatNumberPrice, hideElement, clone, allowC2r, translateJustHourMinute } from '../../helper/functionUtils';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
class TimeAndSale extends React.Component {
  constructor(props) {
    super(props);
    this.id = uuidv4();
    this.state = {
      symbolObj: {}
    }
    props.glContainer.on('show', () => {
      hideElement(props, false, this.id);
      if (this.listDataRender) this.setData(this.listDataRender, true);
    });
    props.glContainer.on('hide', () => {
      hideElement(props, true, this.id);
    });
    this.realtimePrice = this.realtimePrice.bind(this)
    this.changeValue = this.changeValue.bind(this);

    this.props.realtimeCb({
      trades: this.realtimePrice
    })
    this.props.receive({
      cos: this.changeValue

    });
    props.resize((w, h) => {
      if (this.opt) this.opt.fitAll();
    });
  }

  column() {
    return [
      {
        headerName: 'Filled_Time',
        field: 'time',
        menuTabs: ['generalMenuTab', 'columnsMenuTab'],
        width: 96,
        cellRenderer: (params) => {
          const div = document.createElement('div');
          const transWrap = translateJustHourMinute(params.value, null, dataStorage.timeZone, 'HH:mm:ss')
          ReactDOM.render(transWrap, div);
          return div;
        }
      },
      {
        headerName: 'Quantity',
        field: 'quantity',
        menuTabs: ['generalMenuTab', 'columnsMenuTab'],
        width: 96,
        typeCustom: 'number'
      },
      {
        headerName: 'Filled',
        field: 'price',
        menuTabs: ['generalMenuTab', 'columnsMenuTab'],
        width: 108,
        typeCustom: 'number',
        decimal: 3,
        cellRenderer: (params) => {
          return formatNumberPrice(params.data.price, true)
        }
      }
    ]
  }

  changedValue(data) {
    try {
      let listData = [];
      let listDataObj = {};
      if (data) {
        delete data.exchange;
        delete data.symbol;
        listDataObj = data.data || data;
        for (var key in listDataObj) {
          if (listDataObj.hasOwnProperty(key)) {
            const element = listDataObj[key];
            const time = new Date(element.time).toTimeString().split(' ')[0];
            element.timeFormat = time;
            listData.push(element)
          }
        }
        if (listData) {
          this.listData = listData.map((item, index) => {
            item.index = index
            return item;
          })
          this.setData(this.listData)
        }
      } else {
        this.setData([])
      }
    } catch (error) {
      logger.error('changedValue On TimeAndSale' + error)
    }
  }

  changeValue(symbolObj, data) {
    try {
      this.listDataRender = [];
      symbolObj && this.setState({ symbolObj })
      if (data) {
        this.changedValue(data)
      } else {
        this.setData([])
      }
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
        <div className={'timeAndSaleContainer'}>
          <div className='blankSpace'></div>
          <div className='courseOfSaleContent'>
            <Grid
              {...this.props}
              paginate={this.props.paginate ? {
                setPage: cb => {
                  this.setPageCos = cb
                }
              } : null}
              fn={fn => {
                this.addOrUpdate = fn.addOrUpdate
                this.setData = fn.setData
                this.getData = fn.getData
              }}
              loadingCallback={this.props.loadingCallback}
              opt={(opt) => this.opt = opt}
              columns={this.column()}
              noFlash={true}
              fnKey={data => {
                return data.index
              }}
              sort={{
                index: 'asc'
              }}
              hideRowGroupPanel={this.props.hideRowGroupPanel}
            />
          </div>
        </div>
      );
    } catch (error) {
      logger.error('render On TimeAndSale' + error)
    }
  }

  realtimePrice(obj) {
    if (!this.listData) this.listData = []
    let timeFormat;
    if (Array.isArray(obj)) {
      timeFormat = new Date(obj[0].time).toTimeString().split(' ')[0];
    } else {
      timeFormat = new Date(obj.time).toTimeString().split(' ')[0];
    }
    if (Array.isArray(obj)) {
      obj.map(item => {
        item.timeFormat = timeFormat
        this.listData.unshift(item);
      });
    } else {
      obj.timeFormat = timeFormat
      this.listData.unshift(obj);
    }
    this.listData.splice(50, 1000)
    this.listDataRender = this.listData.map((item, index) => {
      const data = clone(item)
      data.index = index;
      return data;
    })
    if (!this.props.glContainer.isHidden) this.setData(this.listDataRender, true);
  }

  componentDidMount() {
    try {
      const firstDiv = document.querySelector('.courseOfSaleContent .ag-root-wrapper.ag-layout-normal.ag-ltr :first-child')
      firstDiv && firstDiv.style && (firstDiv.style.display = 'none')
    } catch (error) {
      logger.error('componentDidMount On TimeAndSale' + error)
    }
  }
}

export default TimeAndSale;
