import React from 'react';
import uuidv4 from 'uuid/v4';
import { formatNumberPrice, formatNumberVolume } from '../../../helper/functionUtils';
import {
    requirePin
} from '../../../helper/request';
import dataStorage from '../../../dataStorage';
import sideEnum from '../../../constants/enum';

class SlickGrid extends React.Component {
    constructor(props) {
        super(props);
        this.dicFlashState = {};

        this.id = 'id' + uuidv4();
        if (this.props.isWatchlist) {
            if (!document.getElementById('slickHook')) {
                const sheet = (function () {
                    const style = document.createElement('style');
                    style.id = 'slickHook';
                    style.appendChild(document.createTextNode(''));
                    document.head.appendChild(style);
                    return style.sheet;
                })();
                sheet.insertRule('@keyframes slickHook {from { opacity: 0.99; }to { opacity: 1; }}', 0);
            }
            const sheet2 = (() => {
                const style = document.createElement('style');
                style.id = this.id;
                style.appendChild(document.createTextNode(''));
                document.head.appendChild(style);
                return style.sheet;
            })();
            sheet2.insertRule('#' + this.id + ' .slick-row {animation-duration: 0.001s;animation-name: slickHook;}', 0);
            this.scrollLeft = 0;
            document.addEventListener('animationstart', this.initButton);
        }

        this.options = {
            rowHeight: 32,
            editable: true,
            enableAddRow: !true,
            enableColumnReorder: true,
            enableCellNavigation: true,
            // asyncEditorLoading: false,
            enableAsyncPostRender: true,
            autoEdit: false,
            // forceFitColumns: true,
            // showHeaderRow: true,
            headerRowHeight: 32,
            explicitInitialization: true
            // frozenColumn: 0
        };
        this.columns = this.props.columns;
        if (this.props.fn) {
            this.props.fn({
                // remove: this.remove.bind(this),
                refreshView: this.refreshView.bind(this),
                setData: this.setData.bind(this),
                addOrUpdate: this.addOrUpdate.bind(this),
                updateData: this.updateData.bind(this),
                deleteItems: this.deleteItems.bind(this),
                AddAndDeleteItems: this.AddAndDeleteItems.bind(this),
                addRows: this.addRows.bind(this)
            });
        }

        this.cellFormatter = (row, cell, value, cd, rowData) => {
            // return `<div class="number"><span>${formatNumberPrice(value)}</span></div>`;
            // const obj = this.dicFlash && this.dicFlash[rowData.symbol] && this.dicFlash[rowData.symbol][cd.field];
            // if (obj) {
            //     const val = obj.value;
            //     className = `number ${obj.direction || ''}`;
            //     // if (rowData.symbol === 'ANZ' && cd.field === 'trade_price') {
            //     //     console.log(`cellFormatter time: ${obj.time} - class: ${obj.flash} - this.dicFlash:`, this.dicFlash)
            //     // }

            //     if (!obj.time) {
            //         className += ' ' + obj.flash;
            //         obj.time = new Date().getTime();
            //         obj.valueFlash = val;
            //         this.dicFlash[rowData.symbol][cd.field] = obj;
            //     }
            // }
            const objPre = this.dicFlashState[rowData.symbol] && this.dicFlashState[rowData.symbol][cd.field];
            const newObj = {}
            // if (objPre) {
            //     newObj.direction = objPre.direction;
            //     if (objPre.val !== value) {
            //         if (objPre.val > value) {
            //             newObj.direction = 'priceDown'
            //         } else {
            //             newObj.direction = 'priceUp'
            //         }
            //         newObj.flash = 'flash';
            //         if (objPre.flash) {
            //             newObj.flash = newObj.flash === 'flash2' ? '' : 'flash'
            //         }
            //     } else {
            //         newObj.flash = '';
            //     }
            // }
            if (!this.dicFlashState[rowData.symbol]) {
                this.dicFlashState[rowData.symbol] = {};
            }
            newObj.val = value;
            this.dicFlashState[rowData.symbol][cd.field] = newObj;
            const className = `number ${newObj.direction} ${newObj.flash}`;
            return `<div class="${className}"><span>${formatNumberPrice(value)}</span></div>`;
        }
        this.cellFormatPrice = (row, cell, value, cd, rowData) => {
            return `<div class="number"><span>${formatNumberPrice(value)}</span></div>`;
        }
        this.cellFormatVol = (row, cell, value, cd, rowData) => {
            return `<div class="number"><span>${formatNumberVolume(value)}</span></div>`;
        }
        props.resize(() => {
            this.gridInstance && this.gridInstance.resizeCanvas()
        });
    }
    initButton = (event) => {
        if (event.animationName !== 'slickHook') return;
        if (!dataStorage.userInfo) return;
        let div = event.target.querySelector('.pinnedRight');
        let img = event.target.querySelector('.remove-symbol');
        if (!div && event.target.firstChild) {
            div = document.createElement('div');
            div.className = 'pinnedRight';
            const node = event.target.parentNode.parentNode;
            div.style.right = (node.scrollWidth - node.clientWidth + 10 - this.scrollLeft) + 'px';

            const buy = document.createElement('div');
            buy.className = 'slick-buy';
            buy.innerText = 'buy';
            div.appendChild(buy);
            buy.onclick = () => {
                const a = event.target.querySelector('[key]');
                if (!a) return;
                const b = this.dv.getItemById(a.getAttribute('key'));
                if (!b) return;
                requirePin(() => dataStorage.goldenLayout.addComponentToStack('Order', { stateOrder: 'NewOrder', data: { symbol: b.symbol, side: sideEnum.BUYSIDE } }))
            }

            const sell = document.createElement('div');
            sell.className = 'slick-sell';
            sell.innerText = 'sell';
            div.appendChild(sell);
            sell.onclick = () => {
                const a = event.target.querySelector('[key]');
                if (!a) return;
                const b = this.dv.getItemById(a.getAttribute('key'));
                if (!b) return;
                requirePin(() => dataStorage.goldenLayout.addComponentToStack('Order', { stateOrder: 'NewOrder', data: { symbol: b.symbol, side: sideEnum.SELLSIDE } }))
            }

            if (this.isPersonal) {
                img = document.createElement('img');
                img.className = 'remove-symbol';
                img.src = 'common/playlist-remove.svg';
                div.appendChild(img);
            }
            event.target.insertBefore(div, event.target.firstChild);
        }
    };
    refreshView(isPersonal) {
        this.isPersonal = isPersonal;
        this.gridInstance && this.gridInstance.render();
    }
    modifyColumns(columns) {
        return columns.map(col => {
            col.id = col.field;
            if (!col.formatter) {
                if ([
                    'trade_price',
                    'bid_price',
                    'ask_price'
                ].indexOf(col.field) > -1) {
                    col.formatter = this.cellFormatter
                } else if ([
                    'change_percent',
                    'change_point',
                    'open',
                    'previous_close',
                    'high',
                    'low',
                    'close'
                ].indexOf(col.field) > -1) {
                    col.formatter = this.cellFormatPrice
                } else if ([
                    'volume',
                    'trade_size',
                    'bid_size',
                    'ask_size'
                ].indexOf(col.field) > -1) {
                    col.formatter = this.cellFormatVol
                }
            }
            return col;
        });
    }
    setData(arr) {
        this.data = arr;
        this.buildGrid(arr)
    }
    addOrUpdate(data) {
        if (!data) return;
        const key = this.props.fnKey(data);
        const item = this.dv.getItemById(key);
        if (!item) return;
        this.dv.beginUpdate();
        this.dv.updateItem(key, Object.assign(item, data));
        this.dv.endUpdate();
    }
    updateData(listData) {
        if (!listData || listData.length <= 0) return;
        let hasChange = false;
        for (let index = 0; index < listData.length; index++) {
            const data = listData[index];
            const key = this.props.fnKey(data);
            const item = this.dv.getItemById(key);
            if (!item) return;
            this.dv.beginUpdate();
            this.dv.updateItem(key, Object.assign(item, data));
            hasChange = true;
        }
        hasChange && this.dv.endUpdate();
    }
    addRows(dataArr) {
        const hasUpdate = dataArr.length > 0;
        hasUpdate && this.dv.beginUpdate();
        for (let index = 0; index < dataArr.length; index++) {
            const element = dataArr[index];
            if (this.props.fnKey) {
                element.id = this.props.fnKey(element);
            }
            this.dv.insertItem(0, element);
        }
        hasUpdate && this.dv.endUpdate();
    }
    deleteItems(dataArr) {
        const hasUpdate = dataArr.length > 0;
        hasUpdate && this.dv.beginUpdate();
        for (let index = 0; index < dataArr.length; index++) {
            const id = dataArr[index];
            this.dv.deleteItem(id);
        }
        hasUpdate && this.dv.endUpdate();
    }

    AddAndDeleteItems(listAdd, listDelete) {
        const hasUpdate = listAdd.length > 0 || listDelete.length > 0;
        hasUpdate && this.dv.beginUpdate();

        for (let index1 = 0; index1 < listAdd.length; index1++) {
            const element = listAdd[index1];
            if (this.props.fnKey) {
                element.id = this.props.fnKey(element);
            }
            this.dv.insertItem(0, element);
        }

        for (let index = 0; index < listDelete.length; index++) {
            const id = listDelete[index];
            this.dv.deleteItem(id);
        }
        hasUpdate && this.dv.endUpdate();
    }

    componentDidMount() {
        this.buildGrid();
    }

    buildGrid(arr = []) {
        if (this.props.fnKey) {
            arr.forEach(item => {
                item.id = this.props.fnKey(item);
            })
        }
        this.dv = new Slick.Data.DataView();
        this.dv.setItems(arr);
        this.gridInstance = new Slick.Grid(this.grid, this.dv, this.modifyColumns(this.columns), this.options);
        if (this.props.isWatchlist) {
            this.gridInstance.onScroll.subscribe((e, a) => {
                this.scrollLeft = a.scrollLeft;
                const node = a.grid.getCanvasNode().parentNode;
                const right = node.scrollWidth - node.clientWidth;
                this.grid.querySelectorAll('.pinnedRight').forEach(dom => {
                    dom.style.right = (right + 10 - this.scrollLeft) + 'px';
                })
            });
        }
        if (this.isPersonal) {
            this.gridInstance.setSelectionModel(new Slick.RowSelectionModel());

            const moveRowsPlugin = new Slick.RowMoveManager({
                cancelEditOnDrag: true
            });

            moveRowsPlugin.onBeforeMoveRows.subscribe(function (e, data) {
                for (var i = 0; i < data.rows.length; i++) {
                    // no point in moving before or after itself
                    if (data.rows[i] === data.insertBefore || data.rows[i] === data.insertBefore - 1) {
                        e.stopPropagation();
                        return false;
                    }
                }
                return true;
            });

            moveRowsPlugin.onMoveRows.subscribe((e, args) => {
                let extractedRows = [];
                let left;
                let right;
                var rows = args.rows;
                var insertBefore = args.insertBefore;
                left = this.data.slice(0, insertBefore);
                right = this.data.slice(insertBefore, this.data.length);

                rows.sort(function (a, b) {
                    return a - b;
                });

                for (var i = 0; i < rows.length; i++) {
                    extractedRows.push(this.data[rows[i]]);
                }

                rows.reverse();

                for (let i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    if (row < insertBefore) {
                        left.splice(row, 1);
                    } else {
                        right.splice(row - insertBefore, 1);
                    }
                }

                this.data = left.concat(extractedRows.concat(right));

                var selectedRows = [];
                for (let i = 0; i < rows.length; i++) {
                    selectedRows.push(left.length + i);
                }

                this.gridInstance.resetActiveCell();
                this.gridInstance.setData(this.data);
                this.gridInstance.setSelectedRows(selectedRows);
                this.gridInstance.render();
            });

            this.gridInstance.registerPlugin(moveRowsPlugin);
        }
        this.gridInstance.onSort.subscribe((e, args) => {
            const sortcol = args.sortCol.field;
            const comparer = (a, b) => {
                const x = a[sortcol];
                const y = b[sortcol];
                return (x === y ? 0 : (x > y ? 1 : -1));
            }
            this.dv.sort(comparer, args.sortAsc);
        });
        this.dv.onRowCountChanged.subscribe(() => {
            this.gridInstance.updateRowCount();
            this.gridInstance.render();
        });

        this.dv.onRowsChanged.subscribe((e, { rows }) => {
            this.gridInstance.invalidateRows(rows);
            this.gridInstance.render();
        });

        this.gridInstance.init();
        if (this.props.autoResize) {
            this.gridInstance.autosizeColumns();
        }
    }

    componentWillUnmount() {
        document.removeEventListener('animationstart', this.initButton);
    }

    render() {
        return <div id={this.id} className='slickgrid-container' ref={grid => this.grid = grid} />
    }
}
export default SlickGrid;
