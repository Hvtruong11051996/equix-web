import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { LicenseManager } from 'ag-grid-enterprise';
import Paginate from '../Paginate/Paginate';
import { formatNumberNew2, formatNumberWithText } from '../../../helper/functionUtils';
import Flag from '../Flag/Flag';
import moment from 'moment/moment';
import orderTypeShow from '../../../constants/order_type_show';
import exchangeShow from '../../../constants/exchange_enum_show';
import logger from '../../../helper/log';
import { translate } from 'react-i18next';
import uuidv4 from 'uuid/v4';
import dataStorage from '../../../dataStorage';
import HeaderComponent from './HeaderComponent';
import Lang from '../Lang';

LicenseManager.prototype.validateLicense = function () { };

class AgGrid extends React.Component {
    static defaultProps = {
        onFilterChanged: () => { }
    };

    constructor(props) {
        super(props);
        this._dicData = {};
        this._queue = [];
        this._dicFlash = {}
        this.dicPrice = {}
        this.dicFlash = {};

        this.filter1 = ['company_name', 'display_name', 'orderId', 'orderType', 'cnote_date', 'cnote_symbol', 'paritech_id', 'saxo_id', 'trading_status', 'account_id', 'user_login_id', 'commission_pattern', 'country', 'commission_type', 'charge_rate', 'default_min', 'from_range', 'start_date', 'account_status', 'state'];
        this.filter2 = ['filled_price', 'exchange', 'paritech_name', 'saxo_name', 'account_hin'];
        this.fnKey = this.props.fnKey || function () {
            return uuidv4();
        };
        this.options = this.props.options || {};
        const state = this.modifyColumns(props.columns, true);
        this.state = {
            isReady: props.isReady || true,
            columns: state.columns,
            rowHeight: state.rowHeight,
            detailRowHeight: this.props.detailRowHeight || 0
        };
        this.currentNodeExpand = null;
        this.refreshView = this.refreshView.bind(this);
        this.addOrUpdate = this.addOrUpdate.bind(this);
        this.updateField = this.updateField.bind(this);
        this.remove = this.remove.bind(this);
        this.setData = this.setData.bind(this);
        this.getData = this.getData.bind(this);
        this.setColumn = this.setColumn.bind(this);
        this.showLoading = this.showLoading.bind(this);
        this.expanded = false;
        if (this.props.fn) {
            this.props.fn({
                refreshView: this.refreshView,
                addOrUpdate: this.addOrUpdate,
                updateField: this.updateField,
                remove: this.remove,
                setData: this.setData,
                getData: this.getData,
                setColumn: this.setColumn,
                showLoading: this.showLoading,
                setQuickFilter: this.setQuickFilter.bind(this)
            })
        }
        if (this.props.loadingCallback) this.props.loadingCallback(this.showLoading)
    }
    setQuickFilter(str) {
        this.gridApi && this.gridApi.setQuickFilter(str);
    }
    renderNoData() {
        if (this.state.isReady) return '<div><Lang>lang_no_data</Lang></div>';
        return ' ';
    }

    renderLoading() {
        return '<div class=`text-capitalize`><Lang>lang_loading_progress</Lang></div>';
    }

    modifyColumns(columns, init, isReady = true) {
        try {
            this.dicCol = {};
            if (columns) {
                for (let i = 0; i < columns.length; i++) {
                    const column = columns[i];
                    if (!column.field) continue;
                    this.dicCol[column.field] = column;
                    if (this.gridApi) this.gridApi.dicCol = this.dicCol;
                    if (!column.cellRenderer) {
                        if (column.type === 'number') {
                            column.cellRenderer = (params) => {
                                if (!params.data[params.colDef.field] || params.data[params.colDef.field] === '--') return '--';
                                return formatNumberNew2(params.data[params.colDef.field], params.colDef.decimal, true);
                            }
                        } else if (column.field === 'change_point') {
                            column.cellRenderer = (params) => {
                                let num = formatNumberNew2(params.data[params.colDef.field], 3, true);
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
                                return formatNumberNew2(totalFees, 2, true);
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
                                    limitPrice = formatNumberNew2(params.data.limitPrice, 3, true)
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
                                    stopPrice = formatNumberNew2(params.data.stopPrice, 3, true)
                                }
                                return stopPrice;
                            }
                        } else if (column.field === 'filled_quantity') {
                            column.cellRenderer = (params) => {
                                if (params.data[params.colDef.field] === 0 || params.data[params.colDef.field] === null) return 0;
                                // if (!params.data[params.colDef.field] || params.data[params.colDef.field] === '--') return '--';
                                return formatNumberNew2(params.data[params.colDef.field], params.colDef.decimal, true);
                            }
                        } else if (column.field === 'quantity') {
                            column.cellRenderer = (params) => {
                                if (params.data[params.colDef.field] === 0) return 0;
                                if (!params.data[params.colDef.field] || params.data[params.colDef.field] === '--') return '--';
                                return formatNumberNew2(params.data[params.colDef.field], params.colDef.decimal, true);
                            }
                        } else if (column.field === 'orderType') {
                            column.cellRenderer = (params) => {
                                const div = document.createElement('div');
                                div.innerHTML = (orderTypeShow[params.data[params.colDef.field]] + '').toUpperCase();
                                div.title = orderTypeShow[params.data[params.colDef.field]] === 'MTL' ? 'Market To Limit' : orderTypeShow[params.data[params.colDef.field]];
                                return div;
                            }
                        } else if (column.field === 'display_name' || column.field === 'cnote_symbol') {
                            column.cellRenderer = (params) => {
                                const divRoot = document.createElement('div');
                                const divText = document.createElement('div');
                                const divFlag = document.createElement('div');
                                divFlag.classList.add('divFlag');
                                divRoot.classList.add('flex');
                                const exchange = params.data.exchange || (params.data.exchanges && params.data.exchanges[0]) || '--';
                                if (exchange && exchange !== '--') {
                                    ReactDOM.render(
                                        <Flag symbolObj={params.data} />
                                        , divFlag);
                                }
                                divText.innerHTML = params.data.display_name || params.data.symbol;
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
                                divRoot.appendChild(divName);
                                divRoot.appendChild(divFlag);
                                return divRoot;
                            }
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
                            const that = this;

                            if (column.field === 'trade_price' || column.field === 'market_price' || column.field === 'value_traded' || column.field === 'price' || column.field === 'trade_size') {
                                column.cellRenderer = (params) => {
                                    const clName = params.colDef.field + '_className';
                                    const value = params.data[params.colDef.field];
                                    const div = document.createElement('div');
                                    const span = document.createElement('span');
                                    div.appendChild(span);
                                    const key = that.fnKey(params.data);
                                    if (!that.dicPrice[key]) that.dicPrice[key] = {};

                                    if (value !== '--') {
                                        div.className = that.dicPrice[key][clName] || 'priceUp';
                                        if (that.dicPrice[key][clName]) that.dicPrice[key][clName] = that.dicPrice[key][clName].replace(' flash', '');
                                        if (column.field === 'value_traded') span.innerText = 'AUD ' + formatNumberWithText(value, 1);
                                        else if (column.field === 'trade_size') span.innerText = value;
                                        else if (column.field === 'trade_price') span.innerText = !value && value !== 0 ? '--' : formatNumberNew2(value, 3, true);
                                        else span.innerText = formatNumberNew2(value, 3, true);
                                    } else {
                                        const oldPrice = params.node['_' + params.colDef.field] || 0;
                                        div.className = '';
                                        if (column.field === 'value_traded') span.innerText = 'AUD ' + formatNumberWithText(oldPrice, 1);
                                        else span.innerText = formatNumberNew2(oldPrice, 3, true);
                                    }
                                    return div;
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
                }
                return this.map(columns, init, isReady);
            }
        } catch (error) {
            logger.error('modifyColumns On AgGrid' + error)
        }
    }

    map(srcColumns, init, isReady) {
        try {
            let columns = [];
            let rowHeight = this.props.rowHeight || (this.props.level ? 48 : 32);

            const lstColId = [];
            if (this.props.level) {
                for (let i = 0; i < srcColumns.length; i++) {
                    if (i % 2 === 0) {
                        const column = {};
                        lstColId.push(srcColumns[i].field);
                        column.headerName = srcColumns[i].headerName || '';
                        column.field = srcColumns[i].field || '';
                        if (!i) {
                            column.lockPosition = true;
                            column.lockVisible = true;
                        }
                        column.menuTabs = ['filterMenuTab', /* 'generalMenuTab', */'columnsMenuTab'];
                        // column.suppressMenu = true;
                        if (this.filter2.indexOf(column.field) > -1) column.filter = 'agTextColumnFilter';
                        else if (this.filter1.indexOf(column.field) === -1) column.suppressFilter = true;
                        if (srcColumns[i].rowDrag) column.rowDrag = true;
                        if (srcColumns[i].remove) column.remove = srcColumns[i].remove;
                        column.enableRowGroup = true;
                        if (this.props.autoHeight) column.autoHeight = true;
                        if (!column.minWidth && this.props.level) column.minWidth = column.width = this.props.level[columns.length];
                        column.cellRenderer = params => {
                            if (params.node.group) {
                                return params.node.key + '(' + params.node.allChildrenCount + ')';
                            }
                            const lst = params.colDef.lst;
                            const wrap = document.createElement('div');

                            if (column.rowDrag) {
                                const img = document.createElement('img');
                                img.className = 'remove-symbol skip';
                                img.src = 'common/playlist-remove.svg';
                                if (params.colDef.remove) {
                                    img.onclick = function () {
                                        params.colDef.remove([params.data]);
                                        params.node.removed = true;
                                    };
                                }
                                params.eGridCell.parentNode.appendChild(img);
                            }

                            const div = document.createElement('div');
                            div.className = 'double-cell';
                            lst && lst.map((col, index) => {
                                let res;
                                if (params.colDef.lstCellRenderer[index] && typeof params.colDef.lstCellRenderer[index] === 'function') {
                                    const func = params.colDef.lstCellRenderer[index];
                                    const old = params.colDef;
                                    params.colDef = col;
                                    res = func(params);
                                    params.colDef = old;
                                } else res = params.data[col.field];
                                if (res && res.style) {
                                    div.appendChild(res);
                                    if (!res.title) res.title = res.innerText;
                                    if (res.innerText === 'MTL') {
                                        res.title = 'Market To Limit'
                                    }
                                } else {
                                    const tmp = document.createElement('div');
                                    tmp.innerHTML = res === undefined ? '' : res;
                                    tmp.title = res;
                                    div.appendChild(tmp);
                                }
                            });
                            wrap.appendChild(div);
                            return wrap;
                        };
                        column.valueGetter = params => {
                            if (params.node.group) return '';
                            const lst = [];
                            params.colDef.lst && params.colDef.lst.map((col) => {
                                if (col.field === 'actionOrder' || col.field === 'side') {
                                    lst.push(new Date().getTime());
                                } else {
                                    if (params.data[col.field]) lst.push(params.data[col.field]);
                                }
                            });
                            return lst.join(' | ');
                        };
                        column.lst = [srcColumns[i]];
                        column.lstCellRenderer = [srcColumns[i].cellRenderer];
                        columns.push(column);
                    } else {
                        const ref = columns[Math.floor(i / 2)];
                        ref.lst.push(srcColumns[i]);
                        ref.lstCellRenderer.push(srcColumns[i].cellRenderer);
                        if (srcColumns[i].headerName) ref.headerName += ' | ' + srcColumns[i].headerName;
                    }
                }
            } else {
                columns = srcColumns.map(cl => {
                    const column = Object.assign({}, cl);
                    column.menuTabs = ['filterMenuTab', 'columnsMenuTab'];
                    lstColId.push(column.field);
                    column.headerName = cl.headerName || '';
                    return column;
                });
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
                        if (this.props.sort[key].valueGetter) {
                            columns.push({
                                field: key,
                                hide: true,
                                valueGetter: this.props.sort[key].valueGetter
                            })
                        } else {
                            columns.push({
                                field: key,
                                hide: true,
                                sort: this.props.sort[key]
                            })
                        }
                    }
                }
            }

            if (init) {
                return {
                    columns: columns,
                    rowHeight: rowHeight
                }
            }
            this.setState({
                rowData: this.rowData,
                columns: columns,
                rowHeight: rowHeight,
                isReady
            }, () => {
                if (this.gridApi) this.gridApi.resetRowHeights();
                const that = this;
                setTimeout(() => {
                    that.onGridSizeChanged();
                }, 0);
            });
        } catch (error) {
            logger.error('map On AgGrid' + error)
        }
    }

    getDataFromName(name) {
        try {
            return this.options[name]
        } catch (error) {
            logger.error('getDataFromName On AgGrid' + error)
        }
    }

    componentDidMount() {
        try {
            this.gridApi && this.gridApi.sizeColumnsToFit();
        } catch (error) {
            logger.error('componentDidMount On AgGrid' + error)
        }
    }

    componentWillUnmount() {
        if (this.props.loadingCallback) this.props.loadingCallback(this.showLoading, true);
    }

    shouldComponentUpdate() {
        return false;
    }

    onRowClicked(params) {
        if (this.props.suppressExpand) return;
        if (params.node.detail && !params.node.data.checkRecord === 'confirm') return;
        if (!params.node.group) {
            let dom = params.event.target;
            while (dom) {
                if (dom.classList.contains('skip')) return;
                if (dom.classList.contains('ag-cell')) break;
                dom = dom.parentNode;
            }
        }
        params.node.setExpanded(!params.node.expanded);
    }

    onRowGroupOpened(params) {
        try {
            if (!this.props.openBranch && (this.currentNodeExpand && this.currentNodeExpand !== params.node && params.node.expanded)) {
                this.currentNodeExpand.setExpanded(false)
            }

            if (params.node.expanded) {
                this.currentNodeExpand = params.node
            }
        } catch (error) {
            logger.error('onRowClicked On AgGrid' + error)
        }
    }

    onGridSizeChanged(params, nextProps) {
        try {
            const props = nextProps || this.props;
            if (props.full) return;
            if (params) this.params = params;
            if (!this.params) return;
            // fix detail-rows
            setTimeout(() => {
                const scroll = this.params.api.gridPanel.eGui.querySelector('[scroll-content]');
                if (scroll) {
                    scroll.style.width = (scroll.clientWidth - 1) + 'px';
                    scroll.scrollLeft += 1;
                    scroll.style.width = null;
                }
            }, 0);
            // get the current grids width
            const timeout = Math.random() * 1000;
            // setTimeout(() => {
            const gridWidth = this.params.api.gridPanel.eGui.offsetWidth;
            // const gridWidth = this.params.api.gridPanel.eGui.offsetWidth;
            // keep track of which columns to hide/show
            const columnsToShow = [];
            const columnsToHide = [];
            // iterate over all columns (visible or not) and work out
            // now many columns can fit (based on their minWidth)
            let totalColsWidth = 0;
            const allColumns = this.params.columnApi.getAllColumns();
            const allFields = allColumns.map(col => {
                return col.colId;
            });

            if (props.columnsToHide) {
                props.columnsToHide.map(field => {
                    if (allFields.indexOf(field > -1)) {
                        columnsToHide.push(field);
                    }
                });
            }
            if (props.columnsToShow) {
                props.columnsToShow.map(field => {
                    const index = allFields.indexOf(field)
                    if (index > -1 && columnsToHide.indexOf(field) === -1) {
                        totalColsWidth += allColumns[index].minWidth;
                        columnsToShow.push(field);
                    }
                });
            }
            this.params.api.hideCount = 0;
            for (let i = 0; i < allColumns.length; i++) {
                let column = allColumns[i];
                if (column.colDef.hide) continue;
                if (columnsToHide.indexOf(column.colId) > -1) continue;
                if (columnsToShow.indexOf(column.colId) > -1) continue;
                totalColsWidth += column.getMinWidth();
                if (totalColsWidth > gridWidth) {
                    this.params.api.hideCount++;
                    if (column.visible) columnsToHide.push(column.colId);
                } else {
                    this.params.api.lastField = column.colId;
                    if (!column.visible) columnsToShow.push(column.colId);
                }
            }
            // show/hide columns based on current grid width
            if (columnsToShow && columnsToShow.length) {
                this.params.columnApi.setColumnsVisible(columnsToShow, true);
            }
            if (columnsToHide && columnsToHide.length) {
                this.params.columnApi.setColumnsVisible(columnsToHide, false);
            }
            if (this.currentNodeExpand && this.currentNodeExpand.expanded && this.currentNodeExpand.detailNode) {
                this.gridApi.redrawRows({
                    rowNodes: [this.currentNodeExpand.detailNode]
                })
            }
            // }
            const newParam = this.params;
            // setTimeout(() => {
            // newParam.api.redrawRows();
            // fill out any available space to ensure there are no gaps
            newParam.api.gridPanel.scrollWidth = 0;
            if (this.props.level) {
                newParam.api.sizeColumnsToFit();
            }
            // }, 0);
            if (this.props.autoHeight) this.params.api.resetRowHeights();
            // }, timeout);
        } catch (error) {
            logger.error('onGridSizeChanged On AgGrid' + error)
        }
    }

    buildClass(obj, key) {
        for (let field in obj) {
            if (field === 'trade_price' || field === 'market_price' || field === 'value_traded' || field === 'price' || field === 'trade_size') {
                const clName = field + '_className';
                const value = obj[field];
                if (!this.dicPrice[key]) this.dicPrice[key] = {};
                const oldPrice = this.dicPrice[key][field];
                if (value !== '--') {
                    let check = true;
                    if (check && (oldPrice === undefined || oldPrice !== value)) {
                        this.dicPrice[key][field] = value;
                        if ((value > oldPrice) || (oldPrice === undefined)) {
                            if (this.dicPrice[key][clName] === 'priceUp flash') this.dicPrice[key][clName] = 'priceUp flash2';
                            else this.dicPrice[key][clName] = 'priceUp flash';
                        } else if (value < oldPrice) {
                            if (this.dicPrice[key][clName] === 'priceDown flash') this.dicPrice[key][clName] = 'priceDown flash2';
                            this.dicPrice[key][clName] = 'priceDown flash'
                        }
                        if (this.dicPrice[key].timeoutId) clearTimeout(this.dicPrice[key].timeoutId);
                        this.dicPrice[key].timeoutId = setTimeout(() => {
                            this.dicPrice[key][clName] = (this.dicPrice[key][clName] + '').replace(' flash', '');
                        }, 300);
                    } else {
                        this.dicPrice[key][field] = value;
                    }
                }
            }
        }
    }
    refreshView(field) {
        if (field) {
            this.gridApi && this.gridApi.refreshCells({
                columns: Array.isArray(field) ? field : [field]
            })
        } else this.gridApi && this.gridApi.redrawRows();
    }
    addOrUpdate(data, updateOnly) {
        const key = this.fnKey(data);
        data.key = key;
        this.buildClass(data, key);
        if (this._dicData[key]) {
            Object.assign(this._dicData[key], data)
            this.gridApi && this.gridApi.updateRowData({
                update: [this._dicData[key]]
            });
        } else {
            if (updateOnly) return;
            this._dicFlash[key] = true;
            setTimeout(() => {
                delete this._dicFlash[key]
            }, 300)
            this._dicData[key] = data;
            if (!this.gridApi) {
                this.queue.unshift(data)
            } else {
                this.gridApi && this.gridApi.updateRowData({
                    addIndex: 0,
                    add: [data]
                });
            }
        }
    }
    updateField(callback) {
        if (this._dicData) {
            const lst = [];
            Object.keys(this._dicData).map(key => {
                if (callBack(this._dicData[key])) lst.push(this._dicData[key]);
            });
            if (lst.length) {
                this.gridApi.updateRowData({
                    update: lst
                });
            }
        }
    }

    remove(data) {
        const key = this.fnKey(data);
        if (this._dicData[key]) {
            this.gridApi && this.gridApi.updateRowData({
                remove: [this._dicData[key]]
            });
            delete this._dicData[key];
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
            if (lstRemove.length) {
                obj.remove = lstRemove
            }
            this._dicData = {};
        }
        lstData.map(data => {
            const key = this.fnKey(data);
            data.key = key;
            if (data.needToFlash) {
                delete data.needToFlash;
                this._dicFlash[key] = true;
                setTimeout(() => {
                    delete this._dicFlash[key]
                }, 300)
            }
            this.buildClass(data, key);
            if (this._dicData[key]) {
                Object.assign(this._dicData[key], data);
                lstUpdate.push(this._dicData[key])
                dicUpdate[key] = true;
            } else {
                this._dicData[key] = data;
                if (this.gridApi) {
                    lstAdd.push(data)
                    if ((!dicData[key])) {
                        this._dicFlash[key] = true;
                        setTimeout(() => {
                            delete this._dicFlash[key]
                        }, 300)
                    }
                } else {
                    this._queue.push(data)
                }
            }
        });
        if (override) {
            const lst = [];
            lstRemove.map(item => {
                if (!dicUpdate[item.key]) {
                    delete this._dicData[item.key]
                    lst.push(item)
                }
            });
            if (lst.length) obj.remove = lst;
        }
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

    getData() {
        const lst = [];
        this.gridApi && this.gridApi.forEachLeafNode(params => {
            lst.push(params.data);
        })
        return lst;
    }

    setColumn(colDef) {
        const newColDef = this.modifyColumns(colDef, true).columns
        this.gridApi && this.gridApi.setColumnDefs(newColDef)
        this.onGridSizeChanged()
    }
    showLoading(show) {
        if (!dataStorage.connected) return
        this.isLoading = show;
        if (this.gridApi) {
            if (show) {
                if (!this.getData().length) this.gridApi.showLoadingOverlay();
            } else {
                if (this.getData().length) this.gridApi.hideOverlay();
                else this.gridApi.showNoRowsOverlay()
            }
        }
    }
    onGridReady(params) {
        try {
            this.gridApi = params.api;
            // for ag-menu
            this.gridApi.gridOptionsWrapper.getVirtualItemHeight = function () {
                return 32;
            };
            // end
            if (this.isLoading) this.gridApi.showLoadingOverlay()
            if (this._queue.length) {
                this.gridApi && this.gridApi.updateRowData({
                    add: this._queue
                });
                this._queue = [];
            }
            if (!this.gridApi.dicCol) this.gridApi.dicCol = this.dicCol;
            let opt = params;
            opt.gridElement = opt.api.gridPanel.eGui;

            if (this.props.sort) {
                const model = [];
                for (let key in this.props.sort) {
                    if (typeof this.props.sort[key] === 'string') {
                        model.push({ colId: key, sort: this.props.sort[key] });
                    } else {
                        model.push({ colId: key, sort: this.props.sort[key].sort });
                    }
                }
                this.gridApi && this.gridApi.setSortModel(model);
            }

            opt.availableWidth = function () {
                return opt.gridElement.clientWidth;
            };
            opt.fitAll = function (skip) {
                const scroll1 = opt.gridElement.querySelector('.ag-body-viewport');
                let availableWidth = opt.availableWidth();
                if (!skip && opt.totalWidth() < availableWidth) {
                    scroll1.style.overflow = 'hidden !important';
                    opt.api.sizeColumnsToFit();
                    scroll1.style.overflow = '';
                    return;
                }
                availableWidth = opt.availableWidth();
                opt.gridElement.style.width = '10000px';
                opt.fitColumns();
                opt.gridElement.style.width = '';
                if (opt.totalWidth() < availableWidth) {
                    scroll1.style.overflow = 'hidden !important';
                    opt.api.sizeColumnsToFit();
                    scroll1.style.overflow = '';
                }
            };
            this.fitAll = opt.fitAll;
            opt.fitColumns = function () {
                const lst = opt.api.columnController.allDisplayedColumns;
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].colDef.fixWidth) continue;
                    opt.columnApi.autoSizeColumn(lst[i].colId);
                }
            };
            opt.totalWidth = function () {
                let totalWidth = 0;
                for (let k = 0; k < opt.api.columnController.allDisplayedColumns.length; k++) {
                    totalWidth += opt.api.columnController.allDisplayedColumns[k].actualWidth;
                }
                return totalWidth;
            };

            if (this.props.opt) this.props.opt(opt);
            const onReady = this.options.onGridReady;
            onReady && onReady(opt);
            opt.api.resetRowHeights();
        } catch (error) {
            logger.error('onGridReady On AgGrid ' + error)
        }
    }
    onRowDataUpdated(params) {
        const lstDetail = [];
        params.api.rowModel.rowsToDisplay.map(row => {
            if (row.detail) lstDetail.push(row)
        });
        if (lstDetail.length) {
            lstDetail.map(row => {
                if (row.callBack) row.callBack()
            })
        }
    }
    onColumnResized(event) {
        if (event.finished) {
            this.gridApi.resetRowHeights();
        }
    }
    render() {
        try {
            const that = this;
            return (
                <div className={`grid-theme ag-theme-dark size--3 ${this.props.level ? 'double' : ''} ${this.props.autoHeight ? 'autoHeight' : ''}`}>
                    <Paginate paginate={this.props.paginate} />
                    <AgGridReact
                        id="myGrid"
                        className={'grid-theme'}
                        masterDetail={!(this.props.groupDefaultExpanded)}
                        components={{
                            agColumnHeader: HeaderComponent
                        }}
                        suppressPropertyNamesCheck={true}
                        detailCellRenderer={'myDetailCellRenderer'}
                        frameworkComponents={this.props.detailComponent ? { myDetailCellRenderer: this.props.detailComponent } : null}
                        // groupHeaders={true}
                        headerHeight={this.props.headerHeight !== undefined ? this.props.headerHeight : 32}
                        rowHeight={this.state.rowHeight}
                        getRowHeight={this.props.autoHeight ? null : (params) => {
                            if (params.node.detail) {
                                return this.state.detailRowHeight;
                            }
                            if (params.data && params.data.height) return params.data.height;
                            return this.state.rowHeight
                        }}
                        onRowDataUpdated={this.onRowDataUpdated.bind(this)}
                        enableColResize
                        rowDragManaged={true}
                        enableSorting
                        animateRows
                        enableFilter={true}
                        rowSelection={'multiple'}
                        context={this.getDataFromName('context')}
                        onCellClicked={this.getDataFromName('onCellClicked')}
                        onRowClicked={this.props.detailComponent ? this.onRowClicked.bind(this) : this.props.onRowClicked}
                        onRowDragEnter={this.getDataFromName('onRowDragEnter')}
                        onRowDragEnd={this.getDataFromName('onRowDragEnd')}
                        overlayNoRowsTemplate={this.renderNoData()}
                        overlayLoadingTemplate={this.renderLoading()}
                        columnDefs={this.state.columns}
                        rowData={[]}
                        onGridReady={this.onGridReady.bind(this)}
                        onGridSizeChanged={this.onGridSizeChanged.bind(this)}
                        onFilterChanged={this.props.onFilterChanged}
                        suppressCopyRowsToClipboard={true}
                        groupUseEntireRow={this.props.groupUseEntireRow}
                        onColumnResized={this.onColumnResized.bind(this)}
                        onRowGroupOpened={this.onRowGroupOpened.bind(this)}
                        groupRowInnerRenderer={this.props.groupRowInnerRenderer}
                        groupDefaultExpanded={this.props.groupDefaultExpanded}
                        fullWidthCellRenderer={this.props.fullWidthCellRenderer}
                        // onCellClicked={true}
                        rowSelected={() => this.cellClicked}
                        rowClassRules={{
                            'flash': function (params) {
                                if (!that._dicFlash[that.fnKey(params.data)]) return false;
                                return that._dicFlash[that.fnKey(params.data)];
                            },
                            'errorRow': function (params) {
                                if (params && params.data && params.data.checkRecord) {
                                    if (params.data.checkRecord === 'not_enough_property' || params.data.checkRecord === 'confict_property') {
                                        return true
                                    }
                                }
                                return false;
                            },
                            'warningRow': function (params) {
                                if (params && params.data && params.data.checkRecord) {
                                    if (params.data.checkRecord === 'wrong_property') {
                                        return true
                                    }
                                }
                                return false;
                            }
                        }}
                    />
                </div>
            )
        } catch (error) {
            logger.error('onGridReady On AgGrid' + error)
        }
    }
}

export default translate('translations')(AgGrid);
