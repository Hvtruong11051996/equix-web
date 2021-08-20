import React from 'react';
import ReactDOM from 'react-dom';
import { AgGridReact } from 'ag-grid-react';
import { LicenseManager } from 'ag-grid-enterprise';
import Paginate from '../Paginate/Paginate';
import { formatNumberWithText, formatNumberVolume, formatNumberPrice, formatNumberValue, formatExpireDate, clone } from '../../../helper/functionUtils';
import Flag, { getCountryCode } from '../Flag/Flag';
import Icon from '../Icon';
import moment from 'moment/moment';
import orderTypeShow from '../../../constants/order_type_show';
import exchangeShow from '../../../constants/exchange_enum_show';
import logger from '../../../helper/log';
import { translate } from 'react-i18next';
import uuidv4 from 'uuid/v4';
import dataStorage from '../../../dataStorage';
import HeaderComponent from './HeaderComponent';
import Lang from '../Lang';
import marginColumn from './MarginColumn'
import IconProduct from '../IconProduct/IconProduct'
import CellRenderer from './CellRenderer';
import { getTimeBusinessLog } from '../../../helper/dateTime';

LicenseManager.prototype.validateLicense = function () { };
class AgGrid extends React.Component {
    constructor(props) {
        super(props);
        this._dicData = {};
        this._queue = [];
        this._dicFlash = {};
        this.dicPrice = {};
        this.dicFlash = {};
        this.currentNodeExpand = null;
        this.fnKey = this.props.fnKey || function () {
            return uuidv4();
        };
        this.options = this.props.options || {};
        this.state = {
            isReady: props.isReady || true,
            columnDefs: this.modifyColumns(props.columns, true),
            detailRowHeight: this.props.detailRowHeight || 0
        };
        this.refreshView = this.refreshView.bind(this);
        this.addOrUpdate = this.addOrUpdate.bind(this);
        this.updateData = this.updateData.bind(this);
        this.updateField = this.updateField.bind(this);
        this.remove = this.remove.bind(this);
        this.setData = this.setData.bind(this);
        this.getData = this.getData.bind(this);
        this.setColumn = this.setColumn.bind(this);
        this.setPinnedBottomRowData = this.setPinnedBottomRowData.bind(this);
        this.getSort = this.getSort.bind(this)
        this.handleClickOutside = this.handleClickOutside.bind(this)
        this.expanded = false;
        this.pendingUpdate = { lstAdd: [], lstUpdate: [], lstRemove: [] };
        this.props.resize && this.props.resize((w, h) => {
            this.fixedWidthWidget = w
        })
        this.scrolling = false;
        if (this.props.fn) {
            this.props.fn({
                refreshView: this.refreshView,
                addOrUpdate: this.addOrUpdate,
                updateData: this.updateData,
                updateField: this.updateField,
                remove: this.remove,
                setData: this.setData,
                getData: this.getData,
                setColumn: this.setColumn,
                showLoading: this.showLoading,
                setPinnedBottomRowData: this.setPinnedBottomRowData,
                setSelected: this.setSelected.bind(this),
                setSelectedRowData: this.setSelectedRowData.bind(this),
                setQuickFilter: this.setQuickFilter.bind(this),
                fitAllColumns: this.fitAllColumns.bind(this),
                setFilter: this.setFilter.bind(this),
                getAllDisplayedColumns: this.getAllDisplayedColumns.bind(this),
                buildClass: this.buildClass.bind(this),
                doesRowPassFilter: this.doesRowPassFilter,
                exportCSV: this.onBtExport,
                resetFilter: this.filterCallback
            })
        }
    }
    doesRowPassFilter = (data) => {
        if (!this.gridApi) return true;
        try {
            return this.gridApi.filterManager.doesRowPassFilter({ data });
        } catch (e) {
            logger.error('filter error: ', e);
            return true;
        }
    }
    setQuickFilter(str) {
        this.gridApi && this.gridApi.setQuickFilter(str);
    }
    fitAllColumns(duration = 300) {
        this.fitAll && this.fitAll(duration);
    }
    modifyColumns(colDefs) {
        try {
            let that = this;
            this.dicCol = {};
            const columns = [];
            const lstColId = [];
            that.check = 0;
            if (colDefs) {
                for (let i = 0; i < colDefs.length; i++) {
                    const column = colDefs[i];
                    if (!column || !column.field) continue;
                    if (column.filter || !column.menuTabs || (column.menuTabs && column.menuTabs.indexOf('filterMenuTab') > -1)) {
                        that.check++;
                    }
                    if (column.filter === 'agDateColumnFilter') {
                        column.filterParams = {
                            comparator: function (filterLocalDateAtMidnight, cellValue) {
                                if (!cellValue) return -1;
                                const dateParts = cellValue.match(/^(\d{4})(\d{2})(\d{2})/);
                                if (!dateParts) return -1;
                                const cellDate = new Date(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3]));
                                if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                                    return 0;
                                }
                                if (cellDate < filterLocalDateAtMidnight) {
                                    return -1;
                                }
                                if (cellDate > filterLocalDateAtMidnight) {
                                    return 1;
                                }
                            },
                            browserDatePicker: true
                        };
                        column.valueGetter = params => {
                            if (params.node.group) return '';
                            return getTimeBusinessLog(params.data[column.field], 'YYYYMMDDHHmmss') || '--'
                        }
                        column.valueFormatter = params => {
                            if (params.node.group) return '';
                            return getTimeBusinessLog(params.data[column.field], 'YYYY-MM-DD HH:mm:ss') || '--'
                        }
                    }
                    columns.push(column);
                    if (column.enableRowGroup === undefined) column.enableRowGroup = true;
                    if (!column.minWidth) column.minWidth = 55
                    if (!column.maxWidth) {
                        column.maxWidth = 500
                    }
                    // column.localeText = GridTrans;
                    if (column.rowDrag) column.rowDrag = true;
                    this.dicCol[column.field] = column;
                    if (column.reactCellRenderer) {
                        column.cellRenderer = 'cellRenderer'
                    }
                    if (!column.cellRenderer) {
                        if (column.type === 'number') {
                            column.cellRenderer = (params) => {
                                if (!params.data[params.colDef.field] || params.data[params.colDef.field] === '--') return '--';
                                return formatNumberVolume(params.data[params.colDef.field], params.colDef.decimal, true);
                            }
                        } else if (column.field === 'change_point') {
                            column.cellRenderer = (params) => {
                                let num = formatNumberPrice(params.data[params.colDef.field], true);
                                if (params.data[params.colDef.field] > 0) num = '+' + num;
                                const div = document.createElement('div');
                                div.innerText = num;
                                return div;
                            }
                        } else if (column.field === 'volume') {
                            column.cellRenderer = (params) => {
                                if (!params.data[params.colDef.field]) return '--';
                                return formatNumberWithText(params.data[params.colDef.field], 1);
                            }
                        } else if (column.field === 'init_time') {
                            column.cellRenderer = (params) => {
                                const initTime = params.data.init_time;
                                return moment(initTime).format('DD MMM YY HH:mm:ss');
                            }
                        } else if (column.field === 'fees') {
                            column.cellRenderer = (params) => {
                                const data = params.data;
                                let totalFees = (data.estimated_brokerage || 0) + (data.estimated_tax || 0);
                                totalFees = totalFees === 0 ? '--' : totalFees;
                                return formatNumberValue(totalFees, true);
                            }
                        } else if (column.field === 'limitPrice') {
                            column.cellRenderer = (params) => {
                                let limitPrice = '';
                                if (!params.data.limitPrice) {
                                    limitPrice = '--'
                                }
                                if (orderTypeShow[params.data['orderType']] === orderTypeShow.MARKETTOLIMIT_ORDER) {
                                    limitPrice = '--'
                                } else {
                                    limitPrice = formatNumberPrice(params.data.limitPrice, true)
                                }
                                return limitPrice;
                            }
                        } else if (column.field === 'stopPrice') {
                            column.cellRenderer = (params) => {
                                let stopPrice = '';
                                if (!params.data.stopPrice) {
                                    stopPrice = '--'
                                }
                                if ((orderTypeShow[params.data['orderType']] === orderTypeShow.MARKETTOLIMIT_ORDER) || (orderTypeShow[params.data['orderType']] === exchangeShow.LIMIT_ORDER)) {
                                    stopPrice = '--'
                                } else {
                                    stopPrice = formatNumberPrice(params.data.stopPrice, true)
                                }
                                return stopPrice;
                            }
                        } else if (column.field === 'filled_quantity') {
                            column.cellRenderer = (params) => {
                                if (params.data[params.colDef.field] === 0 || params.data[params.colDef.field] === null) return 0;
                                return formatNumberVolume(params.data[params.colDef.field], params.colDef.decimal, true);
                            }
                        } else if (column.field === 'quantity') {
                            column.cellRenderer = (params) => {
                                if (params.data[params.colDef.field] === 0) return 0;
                                if (!params.data[params.colDef.field] || params.data[params.colDef.field] === '--') return '--';
                                return formatNumberValue(params.data[params.colDef.field], params.colDef.decimal, true);
                            }
                        } else if (column.field === 'orderType') {
                            column.cellRenderer = (params) => {
                                const div = document.createElement('div');
                                div.innerHTML = (orderTypeShow[params.data[params.colDef.field]] + '').toUpperCase();
                                div.title = orderTypeShow[params.data[params.colDef.field]] === 'MTL' ? 'Market To Limit' : orderTypeShow[params.data[params.colDef.field]];
                                return div;
                            }
                        } else if (column.field === 'display_master_code' || column.field === 'display_name' || (column.field === 'symbol' && this.props.keys === 'C_NOTE')) {
                            column.cellRenderer = (params) => {
                                const divRoot = document.createElement('div');
                                const divText = document.createElement('div');
                                const divFlag = document.createElement('div');
                                const divIconProduct = document.createElement('div')
                                const divWrap = document.createElement('div')
                                divWrap.classList.add('centerize-vertical')
                                divIconProduct.classList.add('calibrate-icon-product')
                                divIconProduct.style.marginRight = '4px'
                                ReactDOM.render(<IconProduct symbolObj={params.data} />, divIconProduct);
                                divFlag.classList.add('divFlag');
                                divRoot.classList.add('flex');
                                const exchange = params.data.exchange || (params.data.exchanges && params.data.exchanges[0]) || '--';
                                if (exchange && exchange !== '--') {
                                    ReactDOM.render(
                                        <Flag countryCode={params.data.country} symbolObj={params.data} />
                                        , divFlag);
                                }
                                divText.innerHTML = params.data.display_name || params.data.symbol || '--';
                                divText.classList.add('hiddenFlag');
                                const divHalt = document.createElement('div');
                                const divName = document.createElement('div');
                                divName.style.display = 'flex';
                                divHalt.innerHTML = '!'
                                divHalt.className = 'trading-halt-symbol'
                                if (params.data.trading_halt) {
                                    divName.appendChild(divHalt);
                                }
                                divName.appendChild(divText);
                                divWrap.appendChild(divIconProduct)
                                divWrap.appendChild(divFlag)
                                divRoot.appendChild(divName);
                                divRoot.appendChild(divWrap);
                                const title = `${params.data.display_name || params.data.cnote_symbol || params.data.symbol} (${(dataStorage.translate(params.data.class || '')).toUpperCase()})`;
                                divRoot.title = title
                                return divRoot;
                            }
                            // column.valueGetter = (params) => {
                            //     return params.data.symbol
                            // }
                        } else if (column.field === 'account_value') {
                            column.cellRenderer = (params) => {
                                if (params.data.account_value || parseFloat(params.data.account_value) === 0) {
                                    return '$ ' + params.data.account_value;
                                }
                                return '';
                            }
                        } else if (column.field === 'orderId') {
                            column.cellRenderer = (params) => {
                                if (params.data && params.data.orderId) {
                                    return params.data.orderId.length > 20 ? '--' : params.data.orderId;
                                }
                                return '--';
                            }
                        }
                        if (this.props.fnKey) {
                            if (column.field === 'bid_price' || column.field === 'ask_price' || column.field === 'trade_price' || column.field === 'market_price' || column.field === 'value_traded' || column.field === 'price' || column.field === 'trade_size') {
                                column.cellRenderer = (params) => {
                                    if (params.colDef.hideChild && params.node.level) return null;
                                    if (column.field === 'market_price' && params.data && ((params.data.side + '').toLocaleLowerCase() === 'close' || params.data.isClass)) return null;
                                    const value = (params.data && params.data[params.colDef.field]) || '--';
                                    const div = document.createElement('span');
                                    if (value !== '--') {
                                        div.innerText = (column.field === 'value_traded') ? formatNumberWithText(value, 2, true) : formatNumberPrice(value, true);
                                    } else {
                                        const key = params.data ? params.data.key : '';
                                        const obj = this.dicPrice[key] && this.dicPrice[key][params.colDef.field];
                                        div.innerText = (column.field === 'value_traded') ? formatNumberWithText((obj && obj.oldValue), 2, true) : formatNumberPrice((obj && obj.oldValue), true) || '--';
                                    }
                                    return div;
                                };
                                column.cellClassRules = {
                                    'priceUp': (params) => {
                                        if (params.data) {
                                            const key = params.data.key;
                                            const obj = this.dicPrice[key] && this.dicPrice[key][params.colDef.field];
                                            return obj && Object.keys(obj).length && obj.priceUp;
                                        }
                                        return false
                                    },
                                    'priceDown': (params) => {
                                        if (params.data) {
                                            const key = params.data.key;
                                            const obj = this.dicPrice[key] && this.dicPrice[key][params.colDef.field];
                                            return obj && Object.keys(obj).length && !obj.priceUp;
                                        }
                                        return false
                                    },
                                    'flash': (params) => {
                                        if (params.data) {
                                            const key = params.data.key;
                                            const obj = this.dicPrice[key] && this.dicPrice[key][params.colDef.field];
                                            return obj && obj.flash === 'flash2' && (new Date().getTime()) - obj.time < 300;
                                        }
                                        return false
                                    },
                                    'flash2': (params) => {
                                        if (params.data) {
                                            const key = params.data.key;
                                            const obj = this.dicPrice[key] && this.dicPrice[key][params.colDef.field];
                                            return obj && obj.flash === 'flash' && (new Date().getTime()) - obj.time < 300;
                                        }
                                        return false
                                    }
                                }
                            }
                        } else {
                            if (column.field === 'value_traded') {
                                column.cellRenderer = (params) => {
                                    if (!params.data[params.colDef.field]) return '--';
                                    return 'AUD ' + formatNumberWithText(params.data[params.colDef.field], 1);
                                }
                            }
                        }
                    }
                    if (column.rowDrag) {
                        if (!column.cellRendererFunction && column.cellRenderer) column.cellRendererFunction = column.cellRenderer;
                        // }
                    }
                    if (i === length - 1) {
                        column.cellClass = 'ag-last-cell'
                    }
                    if (i === 0) {
                        column.cellClass = 'ag-first-cell'
                    }
                    lstColId.push(column.field);
                }
                if (this.props.detailComponent && columns.length) {
                    if (typeof columns[0].cellRenderer === 'function') {
                        columns[0].cellRendererParams = {
                            innerRenderer: columns[0].cellRenderer
                        };
                    }
                    columns[0].cellRenderer = 'agGroupCellRenderer';
                }
                if (this.props.sort) {
                    for (let key in this.props.sort) {
                        if (lstColId.indexOf(key) === -1) {
                            if (this.props.sort[key].valueGetter && key !== 'updated') {
                                columns.push({
                                    field: key,
                                    hide: true,
                                    valueGetter: this.props.sort[key].valueGetter
                                })
                            }
                        }
                    }
                }
                return columns;
            }
        } catch (error) {
            logger.error('modifyColumns On AgGrid' + error)
        }
    }
    buildClass(obj, key) {
        for (let field in obj) {
            if (field === 'bid_price' || field === 'ask_price' || field === 'trade_price' || field === 'market_price' || field === 'value_traded' || field === 'price' || field === 'trade_size') {
                const value = obj[field];
                if (value !== '--' && value !== null) {
                    if (!this.dicPrice[key]) this.dicPrice[key] = {};
                    if (!this.dicPrice[key][field]) this.dicPrice[key][field] = {};
                    if (value !== this.dicPrice[key][field].oldValue) {
                        this.dicPrice[key][field].priceUp = this.dicPrice[key][field].oldValue === undefined || value > this.dicPrice[key][field].oldValue
                        this.dicPrice[key][field].oldValue = this.dicPrice[key][field].value;
                        this.dicPrice[key][field].value = value;
                        this.dicPrice[key][field].flash = this.dicPrice[key][field].flash === 'flash' ? 'flash2' : 'flash';
                        this.dicPrice[key][field].time = new Date().getTime();
                    }
                }
            }
        }
    }
    refreshView(field) {
        if (field) {
            setTimeout(() => {
                this.gridApi && this.gridApi.refreshCells({
                    columns: Array.isArray(field) ? field : [field],
                    force: true
                })
            }, 100);
        } else {
            setTimeout(() => {
                this.gridApi && this.gridApi.redrawRows();
            }, 100);
        }
    }
    addOrUpdate(lst, updateOnly) {
        try {
            let componentName = this.props.nameWidget || this.props.glContainer._config.component
            if (!Array.isArray(lst)) lst = [lst];
            const lstAdd = [];
            const lstUpdate = [];
            const lstRemove = [];
            lst.map(data => {
                const key = this.fnKey(data);
                data.key = key;
                this.buildClass(data, key);
                if (this._dicData[key]) {
                    Object.assign(this._dicData[key], data);
                    if (lstUpdate.indexOf(this._dicData[key]) === -1) lstUpdate.push(this._dicData[key]);
                } else {
                    if (updateOnly) return;
                    this._dicFlash[key] = new Date().getTime();
                    this._dicData[key] = data;
                    if (!this.gridApi) {
                        this.queue.unshift(data)
                    } else {
                        lstAdd.push(data);
                    }
                }
            });
            if (this.props.paginate) {
                if (componentName === 'AllOrders' || componentName === 'OrderList') {
                    let checkKey = {}
                    let dataShow = [...lstAdd, ...this.getData()]
                    let count = 0;
                    for (let index = 0; index < dataShow.length; index++) {
                        const item = dataShow[index];
                        if (!checkKey[item.origin_broker_order_id] && count < 50) {
                            checkKey[item.origin_broker_order_id] = true;
                            count++
                        } else {
                            if (!checkKey[item.origin_broker_order_id]) {
                                if (this._dicData[item.key]) {
                                    lstRemove.push(this._dicData[item.key]);
                                    delete this._dicData[item.key];
                                }
                            }
                        }
                    }
                } else {
                    let dataShow = this.getData();
                    if (lstAdd.length && dataShow.length >= 50) {
                        lstAdd.forEach(x => {
                            let dataRemove = dataShow.pop();
                            if (this._dicData[dataRemove.key]) {
                                lstRemove.push(this._dicData[dataRemove.key]);
                                delete this._dicData[dataRemove.key];
                            }
                        })
                    }
                }
            }
            let objData = {
                addIndex: 0,
                add: lstAdd.length ? lstAdd : undefined,
                update: lstUpdate.length ? lstUpdate : undefined,
                remove: lstRemove.length ? lstRemove : undefined
            }

            if (!this.scrolling) {
                this.gridApi && this.gridApi.updateRowData(objData);
            } else {
                this.pendingUpdate.lstAdd = [...lstAdd, ...this.pendingUpdate.lstAdd]
                this.pendingUpdate.lstUpdate = [...lstUpdate, ...this.pendingUpdate.lstUpdate]
                this.pendingUpdate.lstRemove = [...lstRemove, ...this.pendingUpdate.lstRemove]
            }
            return objData;
        } catch (error) {
            console.log('error at addOrUpdate GridSingle', error)
        }
    }
    remove(data) {
        const lstRemove = [];
        if (Array.isArray(data)) {
            for (let index = 0; index < data.length; index++) {
                const key = this.fnKey(data[index]);
                if (this._dicData[key]) {
                    lstRemove.push(this._dicData[key]);
                    delete this._dicData[key];
                }
            }
        } else {
            const key = this.fnKey(data);
            if (this._dicData[key]) {
                lstRemove.push(this._dicData[key]);
                delete this._dicData[key];
            }
        }

        this.gridApi && this.gridApi.updateRowData({
            remove: lstRemove
        });
        return lstRemove;
    }
    updateData(listData) {
        try {
            const listUpdate = [];
            for (let index = 0; index < listData.length; index++) {
                const data = listData[index];
                const key = this.fnKey(data);
                data.key = key;
                if (this._dicData[key]) {
                    Object.assign(this._dicData[key], data)
                    listUpdate.push(this._dicData[key])
                }
            }

            if (listUpdate.length) {
                this.gridApi && this.gridApi.updateRowData({
                    update: listUpdate
                });
            }
        } catch (error) {
            console.log('error at updateData GridSingle', error)
        }
    }

    updateField(callback) {
        if (this._dicData) {
            const lst = [];
            Object.keys(this._dicData).map(key => {
                if (callback(this._dicData[key])) lst.push(this._dicData[key]);
            });
            if (lst.length) {
                this.gridApi.updateRowData({
                    update: lst
                });
            }
        }
    }

    setData(lstData, override) {
        const obj = {};
        const dicData = {};
        const lstAdd = [];
        const lstUpdate = [];
        const dicUpdate = [];
        const lstRemove = Object.keys(this._dicData).map((key) => {
            dicData[key] = this._dicData[key];
            return dicData[key];
        });
        if (!override) {
            if (this._queue && this._queue.length) {
                this._queue = [];
            } else {
                if (lstRemove.length) {
                    obj.remove = lstRemove
                }
            }
            this._dicData = {};
        }
        lstData.map(data => {
            const key = this.fnKey(data);
            data.key = key;
            if (data.needToFlash) {
                delete data.needToFlash;
                this._dicFlash[key] = new Date().getTime();
            }
            this.buildClass(data, key);
            if (this._dicData[key]) {
                Object.assign(this._dicData[key], data);
                lstUpdate.push(this._dicData[key])
                dicUpdate[key] = true;
            } else {
                this._dicData[key] = data;
                if (this.gridApi) {
                    if (key !== '--') {
                        lstAdd.push(data)
                        if ((!dicData[key])) {
                            this._dicFlash[key] = new Date().getTime();
                        }
                    }
                } else {
                    this._queue.push(data)
                }
            }
        });
        if (lstAdd.length) {
            obj.addIndex = 0;
            obj.add = lstAdd;
        }
        if (lstUpdate.length) {
            obj.update = lstUpdate;
        }
        if (obj.add || obj.remove || obj.update) {
            this.gridApi && this.gridApi.updateRowData(obj);
        }
    }

    onViewportChanged(params) {
        if (!this.fitted && params && params.lastRow > -1) {
            this.fitted = true;
            this.fitAll && this.fitAll();
        }
    }

    setSelected(condition) {
        if (!condition) {
            this.gridApi.deselectAll()
        } else {
            if (typeof condition === 'object') {
                this.gridApi.forEachLeafNode(node => {
                    let isCheck = false
                    Object.keys(condition).map(field => {
                        if (Array.isArray(condition[field])) {
                            if (condition[field].indexOf(node.data[field]) > -1) isCheck = true
                        } else {
                            if (condition[field] === node.data[field]) isCheck = true
                        }
                    })
                    node.setSelected(isCheck);
                })
            } else {
                this.gridApi.selectAll()
            }
        }
    }

    setSelectedRowData(callback) {
        if (this.gridApi) {
            const lst = this.gridApi.getSelectedNodes();
            if (lst.length) {
                lst.map(node => {
                    callback(node.data);
                })
                this.gridApi.refreshCells({
                    rowNode: lst,
                    force: true
                })
            }
        }
    }

    getData() {
        let lst = [];
        if (this.props.rowModelType !== 'serverSide') {
            this.gridApi && this.gridApi.forEachLeafNode(params => {
                lst.push(params.data);
            })
        } else {
            this.gridApi && this.gridApi.serverSideRowModel.forEachNode(params => {
                lst.push(params.data);
            })
        }
        return lst;
    }

    setColumn(colDef, skip) {
        if (!colDef) return;
        let that = this;
        const colState = this.gridApi ? this.gridApi.columnController.columnApi.getColumnState() : colDef;
        const newColDef = this.modifyColumns(colDef, true);
        that.checkFilterButton(that.check);
        const dicCol = {};
        const dicColId = {};
        if (!this.gridApi) {
            this.colDefSession = colDef;
            this.skipColumn = skip;
            return;
        }
        this.gridApi.columnController.primaryColumns = null;
        this.colDefSession = null;
        this.gridApi.columnController.allDisplayedColumns.map(col => {
            dicCol[col.colDef.field] = col;
            dicColId[col.colId] = true;
        });
        newColDef.forEach(item => {
            if (dicCol[item.field]) {
                item.width = dicCol[item.field].actualWidth
            }
        })
        const oldFilter = this.gridApi.getFilterModel() || {};
        const oldSort = this.getSort() || []
        this.gridApi && this.gridApi.setColumnDefs(newColDef);
        this.gridApi.setFilterModel(oldFilter || {});
        this.gridApi.setSortModel(oldSort || []);
        if (colState.length === newColDef.length && !skip) this.gridApi.columnController.columnApi.setColumnState(colState);
        else {
            const lst = [];
            this.gridApi.columnController.allDisplayedColumns.map(col => {
                if (!dicColId[col.colId]) lst.push(col.colId);
            });
            if (lst.length) {
                this.fitAll && this.fitAll();
            } else {
            }
        }
        this.gridApi.gridPanel.eGui.parentNode.querySelectorAll('.ag-tool-panel-wrapper .ag-header-cell-text').forEach(dom => {
            const transText = dom.innerHTML + '';
            ReactDOM.render(<Lang>{transText}</Lang>, dom)
        });
        this.gridApi.gridPanel.eGui.parentNode.querySelectorAll('.ag-tool-panel-wrapper .ag-column-tool-panel-column-label').forEach(dom => {
            const transText = dom.innerHTML + '';
            ReactDOM.render(<Lang>{transText}</Lang>, dom)
        });
    }
    onScrollEvent = (start) => {
        this.scrolling = start;
        if (!this.scrolling) {
            // update Data

            if (this.pendingUpdate.lstAdd.length ||
                this.pendingUpdate.lstUpdate.length ||
                this.pendingUpdate.lstRemove.length) {
                const dicCheckUpdate = {};
                const listItemUpdate = [];
                const listUpdate = this.pendingUpdate.lstUpdate || [];
                for (let index = 0; index < listUpdate.length; index++) {
                    const iUpdate = listUpdate[index];
                    const key = this.fnKey(iUpdate);
                    if (dicCheckUpdate[iUpdate.key]) {
                        continue;
                    }
                    listItemUpdate.push(iUpdate)
                }
                const objData = {
                    addIndex: 0,
                    add: this.pendingUpdate.lstAdd.length ? this.pendingUpdate.lstAdd : undefined,
                    update: listItemUpdate.length ? listItemUpdate : undefined,
                    remove: this.pendingUpdate.lstRemove.length ? this.pendingUpdate.lstRemove : undefined
                }
                this.pendingUpdate = { lstAdd: [], lstUpdate: [], lstRemove: [] };
                this.gridApi && this.gridApi.updateRowData(objData);
            }
        }
    }

    onGridReady(params) {
        try {
            console.log('onGridReady')
            let that = this;
            this.gridApi = params.api;
            this.gridApi.onBtExport = this.onBtExport
            this.gridApi.getDataGroupById = this.props.getDataGroupById
            // params.api.gridPanel.setHorizontalScrollVisible = function() { };
            // params.api.gridPanel.getVScrollPosition = function() { };
            if (this.props.detailOverlay) {
                params.api.rowRenderer.refreshFullWidthRows = function () { };
            }
            if (this.colDefSession) {
                this.setColumn(this.colDefSession, this.skipColumn);
            }
            this.gridApi.hideCount = 0;
            // for ag-menu
            this.gridApi.gridOptionsWrapper.getVirtualItemHeight = function () {
                return 32;
            };
            // end
            try {
                if (this._queue.length) {
                    this.gridApi && this.gridApi.updateRowData({
                        add: this._queue
                    });
                    this._queue = [];
                }
            } catch (error) {
                console.log('----')
            }
            let opt = this.opt = params;
            this.opt.expandRow = {};
            this.opt.expandClass = [];
            this.opt.api.showClosePosition = false;
            this.gridElement = opt.gridElement = opt.api.gridPanel.eGui;
            this.gridElement.addEventListener('DOMNodeRemoved', e => {
                if (window._clearId) clearTimeout(window._clearId);
                if (!window._clearList) window._clearList = [];
                e.target.tagName && window._clearList.push(e.target);
                window._clearId = setTimeout(() => {
                    window._clearId = null;
                    window._clearList.map((target) => {
                        if (target.parentNode) return;
                        const lst = target.querySelectorAll('[reactRootContainer]')
                        lst.length && lst.forEach(item => ReactDOM.unmountComponentAtNode(item));
                    })
                    window._clearList = []
                }, 2000)
            });
            if (!this.props.fixHeightToolbar) {
                opt.gridElement.parentNode.parentNode.querySelector('.ag-column-drop.ag-unselectable.ag-column-drop-horizontal.ag-column-drop-row-group').parentNode.style.height = '34px';
            } else {
                opt.gridElement.parentNode.parentNode.querySelector('.ag-column-drop.ag-unselectable.ag-column-drop-horizontal.ag-column-drop-row-group').parentNode.style.height = this.props.fixHeightToolbar;
            }
            if (this.props.disableSideBar) {
                opt.gridElement.closest('.ag-root-wrapper').firstElementChild.style.height = '0px';
            }
            opt.totalWidth = function () {
                return opt.api.columnController.allDisplayedColumns.reduce((a, v) => a + v.actualWidth, 0)
            };
            // translation
            const list = opt.gridElement.parentNode.parentNode.querySelectorAll('.ag-column-drop-title, .ag-column-drop-empty-message')
            list.forEach(dom => {
                ReactDOM.render(<Lang>{dom.innerText}</Lang>, dom);
            });

            if (!this.props.noScroll && opt.gridElement) {
                let totalWidth = opt.totalWidth()
            }
            const listButton = opt.gridElement.parentNode.parentNode.querySelectorAll('.ag-side-button button > span')
            listButton.forEach(dom => {
                const newDom = <Lang>{dom.innerText}</Lang>;
                const targetDom = dom.parentElement.children[0].children[0];
                targetDom.classList.add('showTitle')
                targetDom.style.color = 'transparent';
                ReactDOM.render(newDom, targetDom);
            });
            if (this.props.sort) {
                this.gridApi && this.gridApi.setSortModel(this.getSort());
            }
            opt.availableWidth = function () {
                return opt.gridElement.clientWidth;
            };
            const notAbsolute = this.props.notAbsolute;
            opt.fitAll = function (duration = 300) {
                const scroll1 = opt.gridElement.querySelector('.ag-body-viewport');
                opt.api.gridPanel.scrollWidth = 0
                // opt.api.gridPanel.headerRootComp.pinnedRightContainer.scrollWidth = 0
                opt.api.gridPanel.headerRootComp.childContainers[2].scrollWidth = 0;
                let availableWidth = opt.availableWidth();
                // opt.gridElement.style.width = '10000px';
                // if (!notAbsolute) {
                //     opt.gridElement.style.position = 'absolute';
                // };
                setTimeout(() => {
                    opt.fitColumns();
                    opt.gridElement.style.width = '';
                    opt.gridElement.style.position = '';
                    if (opt.totalWidth() < availableWidth) {
                        scroll1.style.overflow = 'hidden !important';
                        opt.api.sizeColumnsToFit();
                        scroll1.style.overflow = '';
                    }
                    // opt.gridElement.querySelectorAll('.btnGroupBuySell').forEach(dom => {
                    //     dom.style.right = (dom.parentElement.clientWidth - (dom.parentElement.parentElement.clientWidth) + 118) + 'px';
                    // })
                }, duration);
            };
            this.fitAll = opt.fitAll;
            if (this.props.fitAllNoData) opt.fitAll();
            // const listFitLater = ['actionOrder', 'news_tags', 'news_symbol', 'news_title'];
            // const listFitAfterAll = ['news_time']
            this.fitColumns = opt.fitColumns = function () {
                const lst = opt.api.columnController.allDisplayedColumns;
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].colDef.fixWidth) continue;
                    opt.columnApi.autoSizeColumn(lst[i].colId)
                }
            };
            if (this.props.opt) this.props.opt(opt);
            const onReady = this.options.onGridReady;
            onReady && onReady(opt);
            opt.api.resetRowHeights();
            this.gridApi.closeToolPanel();
            this.renderResizeButton(opt);
            if (!this.props.noSupportFilter) {
                this.renderResetFilterButton(opt);
            }
            if (!this.props.hidesSaveCsv) this.renderDownloadCsvButton(opt);
            if (this.props.showHideBtn) {
                this.renderShowHideButton(opt)
            }
            const state = (this.props.loadState && this.props.loadState()) || {};
            if (state['colState' + (this.props.name || '')]) {
                // this.fitted = true;
                const newState = JSON.parse(state['colState' + (this.props.name || '')]);
                const currentState = this.gridApi.columnController.columnApi.getColumnState();
                const dic = {};
                const lst = [...newState, ...currentState];
                const lstState = [];
                lst.map(item => {
                    if (dic[item.colId]) return;
                    dic[item.colId] = item;
                    lstState.push(item);
                });
                opt.columnApi.setColumnState(lstState);
            }
            state['sortState' + (this.props.name || '')] && opt.api.setSortModel(JSON.parse(state['sortState' + (this.props.name || '')]));
            state['filterState' + (this.props.name || '')] && opt.api.setFilterModel(JSON.parse(state['filterState' + (this.props.name || '')]));
            // state.quickFilterText && opt.api.setQuickFilter(state.quickFilterText);
            // if (!this.fitted && Object.keys(this._dicData).length) {
            //     this.fitted = true;
            //     this.fitAll && this.fitAll();
            // }
            opt.gridElement.parentNode.querySelectorAll('.ag-tool-panel-wrapper').forEach(dom => {
                dom.style.display = 'block';
            });
            opt.gridElement.parentNode.querySelectorAll('.ag-tool-panel-wrapper .ag-header-cell-text').forEach(dom => {
                const transText = dom.innerHTML + '';
                ReactDOM.render(<Lang>{transText}</Lang>, dom)
            });
            opt.gridElement.parentNode.querySelectorAll('.ag-tool-panel-wrapper .ag-column-tool-panel-column-label').forEach(dom => {
                const transText = dom.innerHTML + '';
                ReactDOM.render(<Lang>{transText}</Lang>, dom)
            });
            if (that.check === 0) {
                let wapper = opt.gridElement.parentNode;
                let filterDiv = wapper.querySelector('.ag-side-button .ag-icon-filter');
                filterDiv && filterDiv.parentNode.parentNode.parentNode.classList.add('disable-ag-side-button');
            }
            if (this.props.disableAllButton) {
                const wapper = opt.gridElement.parentNode;
                const filterDiv = wapper.querySelectorAll('.ag-side-button, .ag-side-button-custom');
                for (const item of filterDiv) {
                    item.classList.add('disable-ag-side-button', 'showTitle')
                }
            }
            if (this.props.rowModelType === 'serverSide') {
                let dataSource = {
                    getRows: (params) => {
                        this.props.getRows(params)
                    },
                    destroy: (params) => {
                        this.props.destroyServerSide && this.props.destroyServerSide(params)
                    }
                };
                params.api.setServerSideDatasource(dataSource);
            }
        } catch (error) {
            logger.error('onGridReady On AgGrid ' + error)
        }
    }
    getSort() {
        if (this.props.sort) {
            const model = [];
            for (let key in this.props.sort) {
                if (typeof this.props.sort[key] === 'string') {
                    model.push({ colId: key, sort: this.props.sort[key] });
                } else {
                    model.push({ colId: key, sort: this.props.sort[key].sort });
                }
            }
            return model
        }
        return []
    }
    renderResizeButton(opt) {
        const div = document.createElement('div');
        div.className = 'ag-side-button-custom showTitle';
        div.onclick = () => {
            this.fitAll && this.fitAll();
        }
        ReactDOM.render(<div>
            <Icon className='ag-side-icon-custom' src='action/open-with' />
            <div className='hiddenTooltip text-capitalize'><Lang>lang_resize</Lang></div>
        </div>, div);
        opt.gridElement.parentNode.querySelectorAll('.ag-side-buttons').forEach(dom => {
            dom.appendChild(div)
        })
    }
    renderShowHideButton(opt) {
        const div = document.createElement('div');
        div.className = 'ag-side-button-custom showTitle';
        const renderIcon = (e) => {
            let tooltip = 'Show_Close_Position';
            if (!e) tooltip = 'Hide_Close_Position';
            ReactDOM.render(<div>
                <Icon className='ag-side-icon-custom' src='image/remove-red-eye' />
                <div className='hiddenTooltip'><Lang>{tooltip}</Lang></div>
            </div>, div);
        }
        div.onclick = (e) => {
            this.handleClickShowHideBtn && this.handleClickShowHideBtn(e);
            renderIcon(this.opt.api.showClosePosition)
        }
        renderIcon(this.opt.api.showClosePosition)
        opt.gridElement.parentNode.querySelectorAll('.ag-side-buttons').forEach(dom => {
            dom.appendChild(div)
        })
    }
    handleClickShowHideBtn(e) {
        if (this.opt.api.showClosePosition) {
            let div = e.target.closest('.ag-side-button-custom.showTitle').firstChild;
            div.className = ''
            this.opt.api.showClosePosition = false;
            this.props.handleClickShowHideBtn();
        } else {
            let div = e.target.closest('.ag-side-button-custom.showTitle').firstChild;
            div.className = 'hidePosition'
            this.opt.api.showClosePosition = true;
            this.props.handleClickShowHideBtn();
        }
    }
    checkFilterButton(check) {
        if (!this.gridElement) return;
        let wapper = this.gridElement.parentNode.parentNode;
        let filterDiv = wapper.querySelector('.ag-side-button .ag-icon-filter');
        let clearFilterDiv = wapper.querySelector('.clearFilter');
        if (check === 0) {
            if (clearFilterDiv) clearFilterDiv.className = 'ag-side-button-custom clearFilter showTitle disable-ag-side-button';
            filterDiv && filterDiv.parentNode.parentNode.parentNode.classList.add('disable-ag-side-button');
        } else {
            if (clearFilterDiv) clearFilterDiv.className = 'ag-side-button-custom clearFilter showTitle';
            filterDiv && filterDiv.parentNode.parentNode.parentNode.classList.remove('disable-ag-side-button');
        }
    }
    renderResetFilterButton(opt) {
        let that = this;
        const div = document.createElement('div');
        if (that.check === 0) {
            div.className = 'ag-side-button-custom clearFilter showTitle disable-ag-side-button';
        } else {
            div.className = 'ag-side-button-custom clearFilter showTitle';
        }
        div.onclick = () => {
            this.filterCallback && this.filterCallback(true);
        }
        ReactDOM.render(<div>
            <img className='ag-side-icon-custom clearFilter' src='common/filter-remove.svg' />
            <div className='hiddenTooltip text-capitalize'><Lang>lang_reset_filter</Lang></div>
        </div>, div);
        opt.gridElement.parentNode.querySelectorAll('.ag-side-buttons').forEach(dom => {
            dom.appendChild(div)
        })
    }
    renderDownloadCsvButton(opt) {
        const div = document.createElement('div');
        div.className = 'ag-side-button-custom download showTitle';
        div.onclick = () => {
            this.onBtExport()
        }
        ReactDOM.render(<div>
            <img className='ag-side-icon-custom' src='common/csv-download.svg' />
            <div className='hiddenTooltip'><Lang>lang_export_csv</Lang></div>
        </div>, div);
        opt.gridElement.parentNode.querySelectorAll('.ag-side-buttons').forEach(dom => {
            dom.appendChild(div)
        })
    }
    shouldComponentUpdate(a) {
        return false;
    }
    onRowGroupOpened(params) {
        try {
            let componentName = this.props.nameWidget || this.props.glContainer._config.component
            if (params.node.expanded) {
                if (params.node.data && params.node.data.group_code) {
                    this.opt.expandRow[params.node.data.group_code] = params.node.data;
                } else if (params.node.data && params.node.data.isClass) {
                    this.opt.expandClass.push(params.node.data.class)
                }
            } else {
                if (params.node.data && params.node.data.group_code) {
                    delete this.opt.expandRow[params.node.data.group_code]
                } else if (params.node.data && params.node.data.isClass) {
                    this.opt.expandClass = this.opt.expandClass.filter(x => x !== params.node.data.class)
                }
            }
            if (!this.props.multiExpand) {
                if (!this.props.openBranch && (this.currentNodeExpand && this.currentNodeExpand !== params.node && params.node.expanded)) {
                    this.currentNodeExpand.setExpanded(false)
                }
                if (params.node.expanded) {
                    this.currentNodeExpand = params.node
                }
            } else {
                if (componentName === 'Portfolio' || componentName === 'AllHoldings') {
                    if (this.currentNodeExpand && this.currentNodeExpand !== params.node && params.node.expanded) {
                        this.currentNodeExpand.setExpanded(false)
                    }
                    if (params.node.expanded && params.node.data.group_code) {
                        this.currentNodeExpand = params.node
                    }
                }
            }
            !this.props.openDontFit && this.fitAll && this.fitAll();
        } catch (error) {
            logger.error('onRowGroupOpened On AgGrid' + error)
        }
    }
    setPinnedBottomRowData(rows) {
        this.gridApi && this.gridApi.setPinnedBottomRowData(rows);
    }
    onRangeSelectionChanged(event) {
        if (!event.finished) return;
        const rangeSelections = this.gridApi.getCellRanges();
        const firstRange = rangeSelections && rangeSelections[0];
        if (firstRange && event.columnApi.columnController.allDisplayedColumns.length !== firstRange.columns.length) {
            event.api.clearRangeSelection();
            event.api.addCellRange({
                rowStartIndex: firstRange.startRow.rowIndex,
                rowEndIndex: firstRange.endRow.rowIndex,
                columnStart: event.columnApi.columnController.allDisplayedColumns[0].colId,
                columnEnd: event.columnApi.columnController.allDisplayedColumns[event.columnApi.columnController.allDisplayedColumns.length - 1].colId
            });
        }
    }
    rowDoubleClicked(e) {
        this.props.rowDoubleClicked(e)
    }

    displayedColumnsChanged(value) {
        if (!this.gridApi) return;
        const data = {};
        data['colState' + (this.props.name || '')] = JSON.stringify(this.gridApi.columnController.columnApi.getColumnState());
        this.props.saveState && this.props.saveState(data);
        this.props.displayedColumnsChanged && this.props.displayedColumnsChanged(value, data)
    }
    filterChanged() {
        if (!this.gridApi) return;
        const data = {};
        data['filterState' + (this.props.name || '')] = JSON.stringify(this.gridApi.getFilterModel());
        this.props.saveState && this.props.saveState(data);
        this.filterCallback();
    }
    setFilter(field, data) {
        if (!this.gridApi) return;
        const filter = this.gridApi.getFilterModel();
        filter[field] = { 'values': data, 'filterType': 'set' };
        this.gridApi.setFilterModel(filter);
    }

    onBtExport = () => {
        const arrCol = this.gridApi.columnController.getAllDisplayedColumns()
        const dataDody = []
        if (arrCol.length) {
            arrCol.forEach(function (element) {
                // if (element.colId === 'ag-Grid-AutoColumn-origin_broker_order_id') dataDody.push('origin_broker_order_id')
                if (element.colId.startsWith('ag-Grid-AutoColumn')) {
                    let str = element.colId
                    dataDody.push(str.replace('ag-Grid-AutoColumn-', ''))
                    return
                }
                if (element.colId === 'morningStar') dataDody.push('addonMorningStar')
                else if (element.colId === 'tipRank') dataDody.push('addonTipRank')
                // else if (element.colId === 'role_group') dataDody.push('role')
                else if (element.colId !== 'actionOrder' && element.colId !== 'action') dataDody.push(element.colId)
            });
        }
        if (this.props.getCsvFunction2) {
            this.props.getCsvFunction2(this.gridElement)
        } else if (this.props.getCsvFunction) {
            this.props.getCsvFunction({
                columns: dataDody
            })
        } else {
            let fileName
            if (window.isSubWindow) fileName = document.title || ''
            else fileName = this.props.glContainer.tab.titleElement[0].textContent || ''
            const params = {
                skipHeader: false,
                skipFooters: true,
                skipPinnedTop: true,
                skipPinnedBottom: true,
                allColumns: false,
                columnKeys: dataDody,
                suppressQuotes: true,
                fileName: fileName.replace(/\./g, '').replace(/ - /g, '_').replace(/ /g, '_') + '_export_' + moment().tz(dataStorage.timeZone).format('HH_mm_ss'),
                processHeaderCallback: (header) => {
                    return dataStorage.translate(header.column.colDef.headerName).toUpperCase()
                }
            }
            this.gridApi.exporting = true
            this.gridApi.exportDataAsCsv(params)
            delete this.gridApi.exporting;
        }
    }

    filterCallback = (isClearFilter) => {
        if (isClearFilter) {
            this.gridApi.setFilterModel({});
            this.gridApi.setSortModel([]);
        } else {
            if (this.props.getFilterOnSearch) {
                if (this.timeoutId) clearTimeout(this.timeoutId);
                this.timeoutId = setTimeout(() => {
                    const objFilter = this.gridApi.getFilterModel()
                    const str = JSON.stringify(objFilter);
                    this.props.getFilterOnSearch(objFilter, this.gridApi.getSortModel())
                }, 1000);
            }
        }
    }
    sortChanged() {
        if (!this.gridApi) return;
        const data = {};
        data['sortState' + (this.props.name || '')] = JSON.stringify(this.gridApi.getSortModel());
        this.props.saveState && this.props.saveState(data);
        this.filterCallback();
    }
    onGridSizeChanged(params) {
        if (params && params.api && params.api.lstResizeCb && params.api.gridCore && params.api.gridCore.eGui && params.api.gridCore.eGui.clientWidth) {
            params.api.lstResizeCb.map(cb => cb());
        }
    }
    getRowStyle(params) {
        if (params.node.rowIndex % 2 === 0) {
            const divRoot = document.createElement('div');
            return { background: 'red' }
        } else if (params.node.rowIndex % 2 !== 0) {
            return { background: 'yellow' }
        }
    }
    addEventForDetailOverlayRow(params) {
        params.node.addEventListener('mouseEnter', (e) => {
            let eGui = e.node.gridApi.gridCore.eGui
            eGui.querySelectorAll('.btnRoot').forEach(v => {
                v.style.display = 'none';
            })
            let dom = eGui.querySelector(`[row-id="${e.node.detailNode.id}"] .btnRoot`);
            if (dom) {
                dom.style.display = 'flex';
                this.btnAction = dom
            }
        })
        params.node.addEventListener('mouseLeave', function checkHover(e) {
            let eGui = e.node.gridApi.gridCore.eGui
            let dom = eGui.querySelector(`[row-id="${e.node.detailNode.id}"] .btnRoot`);
            if (dom) {
                let check = (dom.parentElement.querySelector(':hover') === dom)
                if (!check) {
                    dom.style.display = 'none';
                }
            }
        })
        if (params.api.personalActive) {
            params.node.addEventListener('rowIndexChanged', (e) => {
                let dom = e.node.gridApi.gridCore.eGui.querySelector(`.ag-center-cols-container [row-index="${e.node.rowIndex}"]`);
                if (dom) {
                    if (e.node.rowIndex % 4 === 0) {
                        dom.classList.remove('ag-row-odd')
                        dom.classList.add('ag-row-even')
                    } else {
                        dom.classList.remove('ag-row-even')
                        dom.classList.add('ag-row-odd')
                    }
                }
            })
        } else {
            params.node.removeEventListener('rowIndexChanged');
            params.node.setRowIndex = function () { }
        }
    }
    checkOpenWidget = () => {
        let bord = this.gridBord
        let wrapComponent = bord.parentNode.parentNode
        let react = wrapComponent.react
        return react.state
    }
    // getContextMenuItems(params) {
    //     let checkRightClick = document.getElementsByClassName('ag-menu-list').length || 0

    //     if (checkRightClick > 0) {
    //         return null
    //     }
    //     if (params && params.node) {
    //         params.api.clearRangeSelection();
    //         params.api.addCellRange({
    //             rowStartIndex: params.node.rowIndex,
    //             rowEndIndex: params.node.rowIndex,
    //             columnStart: params.columnApi.columnController.allDisplayedColumns[0].colId,
    //             columnEnd: params.columnApi.columnController.allDisplayedColumns[params.columnApi.columnController.allDisplayedColumns.length - 1].colId
    //         })
    //         let componentName = this.props.nameWidget || this.props.glContainer._config.component
    //         let stateOfWidget = null
    //         if (componentName === 'AllOrders') {
    //             stateOfWidget = this.checkOpenWidget()
    //         }
    //         if (componentName === 'SecurityInfo') return null
    //         if ((componentName === 'Portfolio' || componentName === 'AllHoldings') && !params.node.leafGroup) return;
    //         if (componentName === 'MarginControlManagement') return;
    //         return getContextMenuItems(params, componentName, stateOfWidget, this.getData(), !!this.opt.api.personalActive)
    //     }
    //     return null;
    // }
    onRowClicked(e) {
        if (this.props.onRowClicked) {
            this.props.onRowClicked(e)
        }
    }
    processCellForClipboard(value) {
        if (value && value.column && value.column.colDef && value.column.colDef.cellRenderer && typeof value.column.colDef.cellRenderer === 'function') {
            if (value.column.colDef.cellRenderer === 'agGroupCellRenderer') {
                return value.value
            }
            value.isClipBoard = true
            if (!value.data && value.node && value.node.data) {
                value.data = value.node.data
            }
            if (!value.colDef) {
                value.colDef = value.column.colDef
            }
            let target = value.column.colDef.cellRenderer(value)
            let valueText = '--'
            if (target && target.tagName && target.classList.contains('rootFlag')) {
                valueText = target.firstElementChild.innerText
            } else if (target && target.tagName && target.getElementsByClassName('newsRowTitle') && (((target.getElementsByClassName('symbolRelate').length > 0)) || (target.getElementsByClassName('headLine').length > 0))) {
                valueText = value.value
            } else if (target && target.tagName) {
                valueText = target.innerText
            } else {
                valueText = target
            }
            return valueText || '--'
        }
        return value.value
    }
    processHeaderForClipboard(params) {
        if (params.column && params.column.colDef && params.column.colDef.headerName) {
            let headerName = params.column.colDef.headerName
            return dataStorage.translate(headerName)
        }
        return ''
    }

    columnVisible = (e) => {
        this.fitAll && this.fitAll(0);
    }

    render() {
        const haveDetail = !!this.props.detailComponent;
        const detailCellRendererParams = this.props.detailOverlay ? { suppressRefresh: true } : {};
        const ruleClass = dataStorage.isIntervalRealtime ? undefined : {
            'flash': (params) => {
                if (!params.data) return false;
                const time = this._dicFlash[this.fnKey(params.data)];
                return time && new Date().getTime() - time < 300;
            },
            'errorRow': (params) => {
                if (params && params.data && params.data.checkRecord) {
                    if (params.data.checkRecord === 'not_enough_property' || params.data.checkRecord === 'confict_property') {
                        return true
                    }
                }
                return false;
            },
            'highLightError': (params) => {
                if (params && params.data && params.data.response) {
                    if (params.data.response === 'error') {
                        return true
                    }
                }
                return false;
            },
            'highLightSuccess': (params) => {
                if (params && params.data && params.data.response) {
                    if (params.data.response === 'success') {
                        return true
                    }
                }
                return false;
            },
            'warningRow': (params) => {
                if (params && params.data && params.data.checkRecord) {
                    if (params.data.checkRecord === 'wrong_property') {
                        return true
                    }
                }
                return false;
            },
            'ag-row-even': (params) => {
                return params.node.rowIndex % (this.props.detailOverlay ? 4 : 2) === 0
            },
            'ag-row-odd': (params) => {
                return params.node.rowIndex % (this.props.detailOverlay ? 4 : 2) !== 0
            },
            'portfolio-trans': (params) => {
                if (params.node && params.node.data && params.node.data.broker_order_id && this.props.lineRow) {
                    return true
                }
                return false;
            },
            'portfolio-position': (params) => {
                if (params.node && params.node.data && !params.node.data.broker_order_id && !params.node.data.isClass && this.props.lineRow) {
                    return true
                }
                return false;
            }
        }
        return (
            <div className={`grid-theme ag-theme-fresh size--3 ${this.props.hideButton ? 'hideButton' : ''} ${this.props.detailOverlay ? 'detailOverlay' : ''}`} ref={(ref) => this.gridBord = ref} style={this.props.style}>
                <AgGridReact
                    onColumnVisible={this.columnVisible}
                    processCellForClipboard={this.processCellForClipboard.bind(this)}
                    processHeaderForClipboard={this.processHeaderForClipboard.bind(this)}
                    allowContextMenuWithControlKey={true}
                    // getContextMenuItems={this.getContextMenuItems.bind(this)}
                    onRowDataUpdated={this.props.rowDataUpdated}
                    onViewportChanged={this.onViewportChanged.bind(this)}
                    onFilterChanged={this.filterChanged.bind(this)}
                    onSortChanged={this.sortChanged.bind(this)}
                    onDisplayedColumnsChanged={this.displayedColumnsChanged.bind(this)}
                    onColumnResized={this.displayedColumnsChanged.bind(this)}
                    onColumnRowGroupChanged={this.props.columnRowGroupChanged}
                    // suppressColumnVirtualisation = {true}
                    suppressPropertyNamesCheck={true}
                    columnDefs={this.state.columnDefs}
                    // getRowStyle = {this.getRowStyle.bind(this)}
                    onRowGroupOpened={this.onRowGroupOpened.bind(this)}
                    onGridReady={this.onGridReady.bind(this)}
                    rowHeight={32}
                    headerHeight={32}
                    components={{
                        agColumnHeader: HeaderComponent,
                        cellRenderer: CellRenderer
                    }}
                    onGridSizeChanged={this.onGridSizeChanged.bind(this)}
                    groupUseEntireRow={!this.props.disableGroupUseEntireRow}
                    autoGroupColumnDef={this.props.autoGroupColumnDef}
                    groupMultiAutoColumn={!this.props.isBroker}
                    getRowHeight={(params) => {
                        if (params.node.detail) return 1
                        if (this.props.detailOverlay) {
                            this.addEventForDetailOverlayRow(params)
                        }
                        return 32;
                    }}
                    // getRowNodeId={this.props.getRowNodeId}
                    renderCellCallBack={this.props.renderCellCallBack}
                    rowClassRules={ruleClass}
                    detailCellRendererParams={detailCellRendererParams}
                    currency={this.props.currency}
                    // rowDragManaged={!this.props.hideRowGroupPanel}
                    rowDragManaged={true}
                    animateRows={true}
                    // toolPanelSuppressPivots={true}
                    // toolPanelSuppressPivotMode={true}
                    masterDetail={haveDetail}
                    // groupDefaultExpanded={this.props.groupDefaultExpanded}
                    detailCellRenderer={'myDetailCellRenderer'}
                    frameworkComponents={haveDetail ? { myDetailCellRenderer: this.props.detailComponent } : null}
                    overlayNoRowsTemplate={this.renderNoData()}
                    overlayLoadingTemplate={this.renderLoading()}
                    context={this.getDataFromName('context')}
                    getMainMenuItems={this.props.getMainMenuItems}
                    // onCellClicked={this.getDataFromName('onCellClicked')}
                    // suppressMaxRenderedRowRestriction={this.props.componentName === 'WatchlistBottom'}
                    onRowDragEnter={this.getDataFromName('onRowDragEnter')}
                    onRowDragEnd={this.getDataFromName('onRowDragEnd')}
                    sideBar={!this.props.disableSideBar ? {
                        toolPanels: [
                            {
                                id: 'columns',
                                labelDefault: 'Columns',
                                labelKey: 'columns',
                                iconKey: 'columns',
                                toolPanel: 'agColumnsToolPanel',
                                toolPanelParams: {
                                    suppressRowGroups: true,
                                    suppressValues: true,
                                    suppressPivots: true,
                                    suppressPivotMode: true,
                                    suppressSideButtons: true,
                                    suppressColumnFilter: false,
                                    suppressColumnSelectAll: false,
                                    suppressColumnExpandAll: true
                                }
                            }, {
                                id: 'filters',
                                labelDefault: 'Filters',
                                labelKey: 'filters',
                                iconKey: 'filter',
                                toolPanel: 'agFiltersToolPanel'
                            }
                        ]
                    } : false}
                    openBranch={true}
                    suppressDragLeaveHidesColumns={true}
                    suppressMakeColumnVisibleAfterUnGroup={true}
                    onRowDoubleClicked={this.props.rowDoubleClicked ? this.rowDoubleClicked.bind(this) : null}
                    rowGroupPanelShow={'always'}
                    // onFirstDataRendered={this.onFirstDataRendered.bind(this)}
                    localeText={this.state.GridTrans}
                    groupRowInnerRenderer={this.props.groupRowInnerRenderer}
                    groupRowRendererParams={this.props.groupRowRendererParams}
                    groupDefaultExpanded={this.props.groupDefaultExpanded || (this.props.detailOverlay ? -1 : 0)}
                    fullWidthCellRenderer={this.props.fullWidthCellRenderer}
                    enableRangeSelection={true}
                    onRowClicked={this.onRowClicked.bind(this)}
                    rowData={[]}
                    pinnedBottomRowData={this.props.pinnedBottomRowData}
                    suppressRowClickSelection={true}
                    onRangeSelectionChanged={this.onRangeSelectionChanged.bind(this)}
                    rowSelection='multiple'
                    suppressColumnVirtualisation={this.props.needShowAllColumns}
                    rowBuffer={this.props.rowBuffer || 10}
                    // getFilterModel={this.getFilterModel}
                    // enableCellTextSelection={true}
                    suppressAnimationFrame={true}
                    rowModelType={this.props.rowModelType ? this.props.rowModelType : null}
                    columnTypes={{
                        dimension: {
                            enableRowGroup: true,
                            enablePivot: false
                        }
                    }}
                    serverSideSortingAlwaysResets={this.props.serverSideSortingAlwaysResets}
                    purgeClosedRowNodes={this.props.purgeClosedRowNodes}
                    defaultColDef={
                        {
                            cellClass: (params) => {
                                if (marginColumn.indexOf(params.colDef.field) > -1) {
                                    return ['headerIsNumber'];
                                }
                            },
                            resizable: true,
                            // filter: true,
                            sortable: true
                        }
                    }
                    suppressExcelExport={true}
                // suppressCsvExport={true}
                />
                <Paginate paginate={this.props.paginate} />
            </div>
        );
    }
    getAllDisplayedColumns = () => {
        const arrCol = this.gridApi.columnController.getAllDisplayedColumns()
        const dataDody = []
        if (arrCol.length) {
            arrCol.forEach(function (element) {
                if (element.colId === 'buyer_name') dataDody.push('buyer_id')
                else if (element.colId === 'seller_name') dataDody.push('seller_id')
                else if (element.colId !== 'key' && element.colId !== 'ag-Grid-AutoColumn') dataDody.push(element.colId)
            });
        }
        return dataDody
    }
    getDataFromName(name) {
        try {
            return this.options[name]
        } catch (error) {
            logger.error('getDataFromName On AgGrid' + error)
        }
    }
    renderNoData() {
        const { t } = this.props;
        if (this.state.isReady) return `<div>${dataStorage.translate('lang_no_data')}</div>`;
        return ' ';
    }
    renderLoading() {
        const { t } = this.props;
        return `<div class='text-capitalize'>${t('lang_loading_progress')}</div>`;
    }
    handleClickOutside(event) {
        try {
            if (this.gridBord) {
                const showing = this.gridBord.querySelector('.ag-tool-panel-wrapper:not(.ag-hidden)');
                if (showing && !this.gridBord.querySelector('.ag-side-bar').contains(event.target)) {
                    let btn = this.gridBord.querySelector('.ag-selected button')
                    btn.autofocus = true
                    btn.click();
                }
            }
            let elementBtnRoot = document.querySelectorAll('.btnRoot')
            if (elementBtnRoot.length > 0) {
                for (let i = 0; i < elementBtnRoot.length; i++) {
                    if (elementBtnRoot[i].style.display === 'flex') {
                        if (!elementBtnRoot[i].contains(event.target)) {
                            elementBtnRoot[i].style.display = 'none';
                        }
                    }
                }
            }
        } catch (error) {
            logger.error('handleClickOutside On DropDown' + error)
        }
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }
    componentDidMount() {
        try {
            document.addEventListener('mousedown', this.handleClickOutside);
        } catch (error) {
            logger.error('componentDidMount On AgGrid' + error);
        }
    }
}
export default translate('translations')(AgGrid);
