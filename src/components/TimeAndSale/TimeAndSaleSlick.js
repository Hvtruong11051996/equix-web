import React from 'react';
import { translate } from 'react-i18next';
import uuidv4 from 'uuid/v4';
import Grid from '../Inc/Grid';
import { func } from '../../storage';
import { emitter, eventEmitter, emitterRefresh, eventEmitterRefresh } from '../../constants/emitter_enum';
import { checkPropsStateShouldUpdate, formatNumberPrice, hideElement, clone, allowC2r, translateJustHourMinute } from '../../helper/functionUtils';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import Slick from '../Inc/Slick';

class TimeAndSale extends React.Component {
  constructor(props) {
    super(props);
    this.id = uuidv4();
    this.idSlick = 0;
    this.firstId = 1;
    this.state = {
      symbolObj: {}
    }
    props.glContainer.on('show', () => {
      hideElement(props, false, this.id);
      setTimeout(() => {
        this.setData(this.listData);
      }, 500);
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
    const { t } = props
    this.columns = [
      {
        name: t('Filled_Time'),
        field: 'timeFormat',
        width: 96
      },
      {
        name: t('Quantity'),
        minWidth: 96,
        field: 'quantity'
      },
      {
        name: t('Filled'),
        minWidth: 108,
        field: 'price'
      }
    ]
  }

  column() {
    return [
      {
        headerName: 'Filled_Time',
        field: 'time',
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
        width: 96,
        typeCustom: 'number'
      },
      {
        headerName: 'Filled',
        field: 'price',
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
      this.setState({ symbolObj })
      if (data) {
        this.changedValue(data)
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

  realtimePrice(obj) {
    const listAdd = [];
    if (!this.listData) this.listData = []
    if (Array.isArray(obj)) {
      for (let index = 0; index < obj.length; index++) {
        const element = obj[index];
        const time = new Date(element.time).toTimeString().split(' ')[0];
        element.timeFormat = time;
        this.listData.unshift(element);
        // listAdd.push(element);
      }
    } else {
      const time = new Date(obj.time).toTimeString().split(' ')[0];
      obj.timeFormat = time;
      this.listData.unshift(obj);
    }

    this.listData.splice(50, 10)
    this.listDataRender = this.listData.map((item, index) => {
      const data = clone(item)
      data.index = index;
      return data;
    })
    // if (!this.props.glContainer.isHidden) {
    //   const listDelete = []
    //   if (this.idSlick > 50) {
    //     for (let e = 0; e < listAdd.length; e++) {
    //       listDelete.push(this.firstId);
    //       this.firstId++;
    //     }
    //   }
    //   this.AddAndDeleteItems(listAdd, listDelete);
    // }
    if (!this.props.glContainer.isHidden) this.setData(this.listDataRender, true);
  }

  render() {
    try {
      return (
        <div className={'timeAndSaleContainer'}>
          <div className='courseOfSaleContent'>
            <Slick
              {...this.props}
              autoResize={true}
              fn={fn => {
                this.setData = fn.setData
                this.addOrUpdate = fn.addOrUpdate
                this.remove = fn.remove
                this.refreshView = fn.refreshView
                this.addRows = fn.addRows
                this.AddAndDeleteItems = fn.AddAndDeleteItems
              }}
              fnKey={data => this.idSlick++}
              columns={this.columns}
            />
          </div>
        </div>
      );
    } catch (error) {
      logger.error('render On TimeAndSale' + error)
    }
  }
}

export default translate('translations')(TimeAndSale)
