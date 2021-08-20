import React from 'react';
import Hypergrid from 'fin-hypergrid';
import CellRenderer from 'fin-hypergrid/src/cellRenderers/CellRenderer'
import s from './CanvasGrid.module.css';
import uuidv4 from 'uuid/v4';
import dataStorage from '../../../dataStorage';
import headerCell from './helper/headerCell';
import MenuSide from './helper/MenuSide';
import rowGroupCell from './helper/rowGroupCell';
import detailGroupCell from './helper/detailGroupCell';
import switchType from './_load/type';
import { calculateWidth } from './helper/func';
import moment from 'moment-timezone';
import Paginate from '../Paginate/Paginate';
import * as elastic from '../../../elastic_search/utilities';
import { filterObjtoArr, createContextMenu, isSubWindow, addVerUrl } from '../../../helper/functionUtils'
import { addEventListener, removeEventListener, EVENTNAME } from '../../../helper/event';
import { getCountryCode } from '../../Inc/Flag/Flag.js';
import { TYPE } from './Constant/gridConstant'

let renderProvider
let imageProvider

const ROW_HEIGHT = 32

export default class CanvasGrid extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.fn) {
      this.props.fn({
        doesRowPassFilter: this.doesRowPassFilter,
        setQuickFilter: this.setQuickFilter,
        setColumn: this.setColumn,
        getColumn: this.getColumn,
        setData: this.setData,
        getData: this.getData,
        addOrUpdate: this.addOrUpdate,
        remove: this.remove,
        addDetail: this.addDetail,
        setBottomRow: this.setBottomRow,
        setEditMode: this.setEditMode,
        saveData: this.saveData,
        resetData: this.resetData,
        resetFilter: this.resetFilter,
        autoSize: this.autoSizeColumn,
        exportCsv: this.exportCsv,
        showColumnMenu: (boundRef) => this.showSideMenu('column', boundRef),
        showFilterMenu: (boundRef) => this.showSideMenu('filter', boundRef),
        hasInvalid: this.hasInvalid,
        setCheckedRowData: this.setCheckedRowData,
        updateCheckedRow: this.updateCheckedRow,
        grid: this.grid,
        updateCanvasSize: this.updateCanvasSize,
        getDataColumn: this.getDataColumn
      });
    }
    this.id = 'grid' + uuidv4();
    addEventListener(EVENTNAME.themeChanged, this.themeChanged);
    addEventListener(EVENTNAME.fontChanged, this.repaint);
    this._dicParams = {};
    this.isFirst = true
    this.allowUpdate = true
    this._action = {};
    this._actionsHaveFrame = [];
    this._actionsHaveDrag = [];
    this._colDefs = [];
    this._dicColDef = {};
    this._colState = [];
    this._dicState = {};
    this._listData = [];
    this._dataColumn = {};
    this._dataColumnFull = {};
    this._dicData = {};
    this._detail = {};
    this.filter = {};
    this._sortCol = null;
    this._listGroupState = [];
    this._visibleCells = {};
    this._rowGroupExpand = {};
    this._rowDetailExpand = {};
    this.dicLabelClick = {}
    this.fnKey = (data, isDetail) => {
      return typeof props.fnKey === 'function' ? props.fnKey(data, isDetail) : this._listData.indexOf(data);
    };
    this._dicCells = {};
    this._dataTemp = {};
    const state = (props.loadState && props.loadState()) || {};
    if (state.colState) {
      const lstState = JSON.parse(state.colState);
      if (Array.isArray(lstState)) {
        lstState.forEach(col => {
          if (col.name && !this._dicState[col.name]) {
            this._colState.push(col);
            this._dicState[col.name] = col;
            if (col.sort) this._sortCol = col;
          }
        });
      }
    }
    this._quickFilter = state.valueFilter || '';
    this.mapColumns(this.props.columns);
    props.resize && props.resize((w, h) => {
      if (this.grid && this.grid.canvas) this.grid.canvas.resize()
      if (props.autoFit) this.autoSizeColumn();
    })
    this.initDragAnimation();
    this.dicFlags = {};
    this.state = { listData: [] };
  }

  initDragAnimation() {
    this.dragger = document.getElementById('dragRowSuport')
    if (!this.dragger) {
      this.dragger = document.createElement('canvas');
      this.dragger.style.position = 'fixed';
      this.dragger.setAttribute('width', '0px');
      this.dragger.setAttribute('height', `0px`);
      this.dragger.id = 'dragRowSuport';
      document.body.appendChild(this.dragger);
    }
    this.draggerCTX = this.dragger.getContext('2d');
  }
  setBottomRow = (data) => {
    this._bottomRow = data;
    this.setData()
  }
  setFont = () => {
    this.font = `${this.style.getPropertyValue('--size-4') || '14px'} Roboto, sans-serif`
    this.fontHeader = `${this.style.getPropertyValue('--size-3') || '12px'} Roboto, sans-serif`;
  }

  getProvider = () => {
    const cf = dataStorage.web_config[dataStorage.web_config.common.project]
    const logo = dataStorage.theme === 'theme-light' ? (cf ? cf.branding.providerLight : dataStorage.env_config.branding.providerLight) : (cf ? cf.branding.provider : dataStorage.env_config.branding.provider)
    return addVerUrl(logo)
  }

  themeChanged = () => {
    try {
      this.style = getComputedStyle(this.grid.canvas.canvas);
      imageProvider = new Image()
      imageProvider.src = this.getProvider()
      setTimeout(() => {
        this.repaint()
      }, 500)
    } catch (error) {
      console.error('themeChanged: ', error)
    }
  }
  repaint = () => {
    try {
      this.setFont()
      const odd = { color: this.style.getPropertyValue('--secondary-default'), backgroundColor: this.style.getPropertyValue('--primary-default'), font: this.font }
      const even = { color: this.style.getPropertyValue('--secondary-default'), backgroundColor: this.style.getPropertyValue('--primary-dark'), font: this.font }
      this.grid.addProperties({
        rowStripes: [
          even,
          odd
        ],
        hoverRowHighlight: { enabled: true, backgroundColor: this.style.getPropertyValue('--menu-background-hover') },
        backgroundSelectionColor: this.style.getPropertyValue('--ascend-dark'),
        foregroundSelectionFont: this.font,
        foregroundSelectionColor: this.style.getPropertyValue('--secondary-default'),
        fixedLinesHColor: this.style.getPropertyValue('--primary-dark'),
        fixedLinesVColor: this.style.getPropertyValue('--primary-dark'),
        fixLineShadow: this.style.getPropertyValue('--primary-dark')
      })
      this.grid.repaint()
    } catch (error) {
      console.error('repaint: ', error)
    }
  }
  updateCanvasSize = () => {
    this.grid.canvas.resize()
  }
  showSideMenu = (name, boundDom) => {
    if (this._sideMenu) {
      if (this._sideMenu.style.display === 'none') this._sideMenu.style.display = 'block';
      else this._sideMenu.style.display = 'none'
    } else {
      let div;
      const rect = boundDom.getBoundingClientRect()
      div = this._sideMenu = document.createElement('div');
      div.className = s.sideMenu;
      div.classList.add('isMoreOptionList')
      div.style.position = 'absolute';
      div.style.right = 0;
      div.style.top = rect.height + 'px';
      div.style.zIndex = 102;
      div.style.minWidth = '220px';
      div.style.minHeight = '40px';
      div.style.maxHeight = this.grid.div.getBoundingClientRect().height - 32 + 'px';
      div.style.display = 'block';
      div.style.height = 'auto';
      boundDom && boundDom.appendChild(div);
    }
    ReactDOM.render(<MenuSide root={this} name={name} />, this._sideMenu);
  }
  exportCsv = () => {
    if (this.props.getCsvFunction) {
      const lstCol = this._colState.filter(col => this._dicColDef[col.name] && !col.hide);
      let lstNameCol = lstCol.map(x => x.name)
      this.props.getCsvFunction({ columns: lstNameCol });
    } else {
      const lstCol = this._colState.filter(col => this._dicColDef[col.name] && !col.hide);
      const fileName = ((window.isSubWindow ? document.title : this.props.glContainer.tab.titleElement[0].textContent) || '').replace(/[.\s+]+/g, '_') + '_export_' + moment().tz(dataStorage.timeZone).format('HH_mm_ss') + '.csv';
      const lst = this._listData.map(data => {
        return lstCol.map(col => {
          return data[col.name];
        }).join(',');
      });
      lst.unshift(lstCol.map(col => dataStorage.translate(this._dicColDef[col.name].header)).join(','));
      const content = new Blob(['\ufeff', lst.join('\n')], {
        type: window.navigator.msSaveOrOpenBlob ? 'text/csv;charset=utf-8;' : 'octet/stream'
      });
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(content, fileName);
      } else {
        const element = document.createElement('a');
        const url = window.URL.createObjectURL(content);
        element.setAttribute('href', url);
        element.setAttribute('download', fileName);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.dispatchEvent(new MouseEvent('click', {
          bubbles: false,
          cancelable: true,
          view: window
        }));
        document.body.removeChild(element);
        window.setTimeout(function () {
          window.URL.revokeObjectURL(url);
        }, 0);
      }
    }
  }
  setQuickFilter = (text) => {
    this._quickFilter = text.toLowerCase();
    this.handleSortFilter(false)
  }
  saveState = () => {
    this.props.saveState && this.props.saveState({
      colState: JSON.stringify(this._colState),
      valueFilter: this._quickFilter
    });
  }
  autoSizeColumn = (name) => {
    const gc = this.grid.canvas.gc;
    const lst = name ? this.grid.behavior.columns.filter(col => col.name === name) : this.grid.behavior.columns;
    const lstData = [...(this.listDataGrouped || [])];
    if (this._bottomRow) lstData.push(this._bottomRow);
    const dicWidth = {};
    let total = 1;
    lst.forEach(schema => {
      gc.font = this.fontHeader;
      let fn = calculateWidth(schema.type);
      gc.font = this.font
      const colDef = this._dicColDef[schema.name];
      const p = { gc, root: this, font: this.font, style: this.style, grid: this.grid, name: schema.name, isEditMode: this.isEditMode, colState: this._dicState[schema.name], colDef: colDef };
      let max = colDef.cellOnHeader ? fn(p) : Math.ceil(gc.measureText((colDef.headerFixed || dataStorage.translate(colDef.header)).toUpperCase()).width + 16);
      if (this._dicState[schema.name].filter) max += 16;
      if (this._dicState[schema.name].sort) max += 16;
      lstData.forEach((d, i) => {
        const group = this._dicRowGroup && this._dicRowGroup[i];
        if (group) return;
        p.detail = !this._listData.includes(d);
        p.bottom = d === this._bottomRow;
        if (p.bottom) p.font = '700 ' + this.font;
        p.data = d;
        p.value = d[schema.name];
        if (typeof schema.valueGetter === 'function') p.value = schema.valueGetter(p);
        p.displayValue = this.toDisplayValue(p);
        if (typeof schema.fnType === 'function') fn = calculateWidth(schema.fnType(p));
        let width = fn(p);
        if (this.grid.behavior.columns[0].name === schema.name) {
          const level = p.detail ? this._groupLevel.length + 1 : this._groupLevel.length;
          if (level) {
            if (this.props.detailSource && !p.detail) width += 16;
            width += level * 16 + 12;
          }
        }
        if (max < width) max = width;
      });
      dicWidth[schema.index] = Math.min(max, colDef.maxWidth || 300, this.grid.canvas.width);
      total += dicWidth[schema.index];
    });
    if (!name && total < this.grid.canvas.width) lst.forEach(schema => this.grid.behavior.setColumnWidth(schema.index, dicWidth[schema.index] * this.grid.canvas.width / total));
    else lst.forEach(schema => this.grid.behavior.setColumnWidth(this.grid.behavior.columns.indexOf(schema), dicWidth[schema.index]));
    if (this.grid && this.grid.canvas) this.grid.canvas.resize()
  }
  hasInvalid = () => {
    // return true if nothing was changed
    let empty = true;
    Object.keys(this._dataTemp).forEach(key => {
      Object.keys(this._dataTemp[key]).forEach(name => {
        if (this._dicData[key][name] !== this._dataTemp[key][name]) empty = false;
      });
    });
    return empty;
  }
  setGroup = (colState) => {
    this._action = {};
    colState.groupIndex = ((this._colState.filter(col => col.hasOwnProperty('groupIndex')).pop() || {}).groupIndex || 0) + 1;
    this.updateColumns();
    this.setData(null, true);
    this.saveState();
    if (this.props.autoFit) this.autoSizeColumn();
  }
  clearGroup = (colState) => {
    if (colState) {
      delete colState.groupIndex;
      this._colState.filter(col => col.hasOwnProperty('groupIndex')).sort((a, b) => a.groupIndex - b.groupIndex).forEach((col, i) => col.groupIndex = i);
    } else this._colState.forEach(col => delete col.groupIndex);
    this.updateColumns();
    this.setData();
    this.saveState();
    if (this.props.autoFit) this.autoSizeColumn();
  }
  saveData = () => {
    // apply user data
    Object.keys(this._dataTemp).forEach(key => {
      this._dicData[key] && Object.assign(this._dicData[key], this._dataTemp[key]);
    });
    this._dataTemp = {};
  }
  resetData = () => {
    this._dataTemp = {};
    this._dataColumn = {}
  }
  filterColumn = (col, filter) => {
    if (filter) col.filter = filter;
    else delete col.filter;
    this.handleSortFilter()
  }

  handleSortFilter = (notResetPage = true) => {
    if (this.sortFilterTimeoutId) clearTimeout(this.sortFilterTimeoutId);
    this.sortFilterTimeoutId = setTimeout(() => {
      if (this.props.getFilterOnSearch) {
        let sortObj = {}
        let filterObj = []
        this._quickFilter && filterObj.push(elastic.search(this._quickFilter))
        this._colState.forEach(v => {
          if (v.sort) {
            sortObj[v.name] = v.sort
          }
          if (v.filter) {
            if (v.filter.type === 'in') {
              let lstAllow = []
              if (v.filter.filter.length) {
                v.filter.filter.map(val => {
                  lstAllow.push(elastic.equal(v.name, val))
                })
              } else {
                lstAllow.push(elastic.equal(v.name, 'empty for unchecked all'));
              }
              filterObj.push(elastic.or(lstAllow))
            } else {
              const lstTemp = []
              if (v.filter.operator) {
                if (v.filter.condition1.filter) {
                  lstTemp.push(elastic.convertFilter({
                    type: v.filter.condition1.type,
                    field: v.name,
                    value: v.filter.condition1.filter,
                    columnType: v.filter.columnType
                  }))
                }
                if (v.filter.condition2.filter) {
                  lstTemp.push(elastic.convertFilter({
                    type: v.filter.condition2.type,
                    field: v.name,
                    value: v.filter.condition2.filter,
                    columnType: v.filter.columnType
                  }))
                }
                if (v.filter.operator === 'and') filterObj.push(elastic.and(lstTemp))
                else filterObj.push(elastic.or(lstTemp))
              } else {
                lstTemp.push(elastic.convertFilter({
                  type: v.filter.type,
                  field: v.name,
                  value: v.filter.filter,
                  columnType: v.filter.columnType
                }))
                filterObj.push(lstTemp)
              }
            }
          }
        })
        let body = elastic.getBodyData(elastic.and(filterObj), elastic.sort(sortObj))
        this.props.getFilterOnSearch(body, notResetPage)
      } else {
        this.setData();
      }
    }, 300)
    this.saveState();
  }
  sortColumn = (col) => {
    const colState = this._dicState[col.name];
    if (this._sortCol !== colState) {
      this._colState.forEach(col => delete col.sort);
      this._sortCol = colState;
    }
    if (!colState.sort) colState.sort = 'asc';
    else if (colState.sort === 'asc') colState.sort = 'desc';
    else {
      delete colState.sort;
      delete this._sortCol;
    }
    this.handleSortFilter();
  }
  hideColumn = (col, hideState) => {
    if (hideState === false) {
      delete this._dicState[col.name].hide;
    } else {
      this._dicState[col.name].hide = true;
    }
    this.updateColumns();
    let checkHideColLength = filterObjtoArr(this._dicState, x => x.hide).length === this._colState.length;
    checkHideColLength && this.grid.allowEvents(false);
    this.saveState();
    if (this.props.autoFit) this.autoSizeColumn();
  }
  pinColumn = (col) => {
    if (this._dicState[col.name].pinned) delete this._dicState[col.name].pinned;
    else this._dicState[col.name].pinned = true;
    this.updateColumns();
    this.saveState();
  }
  getColumnsFromState = () => {
    return [...this._colState].sort((a, b) => a.pinned ? (b.pinned ? 0 : -1) : (b.pinned ? 1 : 0)).filter(col => !col.hide && this._dicColDef[col.name])
  }
  updateColumns = () => {
    let len = 0;
    const lst = [];
    const dicWidth = {};
    this.grid.behavior.getColumns().forEach((col, index) => dicWidth[col.name] = this.grid.behavior.getColumnWidth(index));
    this.getColumnsFromState().forEach(col => {
      if (this._dicColDef[col.name].type && [TYPE.FLASH, TYPE.FLASH_NO_BG].includes(this._dicColDef[col.name].type)) {
        this._dicColDef[col.name].minimumColumnWidth = this._dicColDef[col.name].minWidth || 100;
      } else this._dicColDef[col.name].minimumColumnWidth = this._dicColDef[col.name].minWidth || 32;
      lst.push(this._dicColDef[col.name]);
      if (col.pinned) len++;
    });
    lst.length || !this._colDefs.length ? this.grid.behavior.setSchema(lst) : this.grid.behavior.setSchema([this._colDefs[0]]) || setTimeout(() => this.grid.behavior.getSchema().forEach((v, i) => this.grid.behavior.hideColumns(false, i)), 10);
    this.grid.behavior.setFixedColumnCount(len);
    this.grid.behavior.getColumns().forEach((col, index) => dicWidth[col.name] && this.grid.behavior.setColumnWidth(index, dicWidth[col.name]));
  }

  setEditMode = (isEditMode) => {
    this.isEditMode = isEditMode;
    this.dicLabelClick = {};
    this.grid.repaint();
  }

  getDataColumn = () => {
    return this._dataColumn
  }

  setCheckedRowData = option => {
    Object.keys(option).forEach(key => {
      let elm = option[key];
      this._listData.forEach(x => {
        if (elm.includes(x.status)) {
          this.dicLabelClick[x.user_id] = x.user_id
        } else delete this.dicLabelClick[x.user_id]
      })
    })
    this.grid.repaint();
  }

  updateCheckedRow = option => {
    let that = this;
    let arrUser = Object.keys(this.dicLabelClick)
    Object.keys(option).forEach(field => {
      let elm = option[field];
      this._listData.forEach(x => {
        if (arrUser.includes(x.user_id)) {
          that.setValueByKey(x.user_id, elm, field)
        }
      })
    })
    this.grid.repaint();
  }

  setColumn = (colums = []) => {
    this.mapColumns(colums);
    this.updateColumns();
    this.saveState();
  }
  getColumn = (diff) => {
    if (diff) {
      const dicChanged = {};
      Object.keys(this._dataTemp).forEach(key => {
        Object.keys(this._dataTemp[key]).forEach(name => {
          if (this._dicData[key][name] !== this._dataTemp[key][name]) dicChanged[name] = true;
        });
      });
      return this._colDefs.filter(col => dicChanged[col.name]);
    }
    return this._colDefs;
  }
  resetColumn = () => {
    this._colState = [];
    this._dicState = {};
    this._dicDataGroup && Object.keys(this._dicDataGroup).forEach(key => this._rowGroupExpand[key] = true);
    this.mapColumns(this._colDefs);
    this.updateColumns();
    this.handleSortFilter();
    this.autoSizeColumn();
    this.saveState();
  }
  resetFilter = () => {
    this._colState.forEach(col => {
      delete col.sort;
      delete col.filter;
    })
    this.updateColumns();
    this.handleSortFilter();
    this.saveState();
    if (this.props.autoFit) this.autoSizeColumn();
  }
  doesFilterPass = (value, filter) => {
    const check = (value, condition) => {
      const val = (value + '').toLowerCase();
      if (condition.type === 'in') return Array.isArray(condition.filter) && condition.filter.filter(x => (x + '').toLowerCase() === val).length > 0;
      const fil = (condition.filter + '').toLowerCase();
      switch (condition.type) {
        case 'contains':
          return val.indexOf(fil) > -1;
        case 'notContains':
          return val.indexOf(fil) === -1;
        case 'equals':
          return val === fil;
        case 'notEqual':
          return val !== fil;
        case 'startsWith':
          return val.startsWith(fil);
        case 'endsWith':
          return val.endsWith(fil);
        default:
          return true;
      }
    }
    if (filter.operator) {
      if (filter.operator === 'or') return check(value, filter.condition1) || check(value, filter.condition2);
      return check(value, filter.condition1) && check(value, filter.condition2);
    } else {
      return check(value, filter);
    }
  }
  doesRowPassFilter = (data) => {
    let match = true;
    let matchQuickFilter = !this._quickFilter;
    this._colState.forEach(col => {
      let dataFilter = this.getValue({
        name,
        data: data,
        value: data[col.name]
      }, col.name);
      if (this._dicState[col.name] && this._dicState[col.name].filter) {
        if (!this.doesFilterPass(dataFilter, this._dicState[col.name].filter)) match = false;
      }
      if (!matchQuickFilter) {
        if ((dataFilter + '').toLowerCase().includes(this._quickFilter)) matchQuickFilter = true;
      }
    });
    return match && matchQuickFilter;
  }
  setData = (listData, collapseState) => {
    if (this.quickFilterTimeoutId) clearTimeout(this.quickFilterTimeoutId);
    delete this.quickFilterTimeoutId;
    if (listData) {
      this._detail = {}
      this._dicData = {}
      listData.forEach(data => {
        this._dicData[this.fnKey(data)] = data;
      })
      this._listData = listData;
      // this.listDataClient(this._listData);
      console.log(' listData :>> ', listData);
    }
    if (this.props.getFilterOnSearch) {
      this._dataAfterAction = this._listData
    } else {
      const getValue = (data, name) => {
        return this.getValue({
          name,
          data: data,
          value: data[name]
        }, name)
      }
      // filter
      const filterData = this._listData.filter(data => {
        return this.doesRowPassFilter(data)
      })
      // end filter
      // start sort data

      this._dataAfterAction = this._sortCol ? filterData.sort((rowA, rowB) => {
        const a = getValue(rowA, this._sortCol.name)
        const b = getValue(rowB, this._sortCol.name)
        if (typeof a === 'number') return this._sortCol.sort === 'asc' ? a - b : b - a
        return this._sortCol.sort === 'asc' ? (a + '').localeCompare(b) : (b + '').localeCompare(a)
      }) : filterData
      // end sort
    }
    // start group data
    this._groupLevel = this._colState.filter(col => col.hasOwnProperty('groupIndex')).sort((a, b) => a.groupIndex - b.groupIndex)
    const groupBy = function (lst, key) {
      return lst.reduce((rv, x) => {
        if (x[key] === undefined) x[key] = null;
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {})
    }
    const groupFn = (lst, i) => {
      if (!i) i = 0
      const level = this._groupLevel[i]
      if (level) {
        const obj = groupBy(lst, level.name)
        if (this._groupLevel[i + 1]) {
          Object.keys(obj).forEach(key => {
            obj[key] = groupFn(obj[key], i + 1)
          })
        }
        return obj
      }
      return lst
    }
    const dicGroupData = groupFn(this._dataAfterAction)
    this.listDataGrouped = []
    this._dicRowGroup = {}
    this._dicDataGroup = {}
    const mapGroup = (obj, level, preKey = '', collapse) => {
      // collapse inherit from parent
      if (!collapse && preKey) {
        // when parent was expaned, init collapse state for current level
        if (collapseState) collapse = this._rowGroupExpand[preKey] = false
        else if (this._rowGroupExpand[preKey] === undefined) this._rowGroupExpand[preKey] = true
        collapse = !this._rowGroupExpand[preKey]
      }
      if (!this._groupLevel[level] || Array.isArray(obj)) {
        // browse data list
        if (!collapse) {
          if (this.props.detailSource) {
            obj.forEach(data => {
              this.listDataGrouped.push(data)
              const key = this.fnKey(data)
              if (this._rowDetailExpand[key] && this._detail && Array.isArray(this._detail[key])) this.listDataGrouped.push(...this._detail[key])
            })
          } else this.listDataGrouped.push(...obj)
        }
        return obj
      } else {
        // browse group list
        const lst = []
        Object.keys(obj).forEach(key => {
          if (key === 'null' && this.props.clearNullGroup) {
            const groupKey = preKey + '_' + key
            this._dicDataGroup[groupKey] = mapGroup(obj[key], level + 1, groupKey, collapse)
            lst.push(...this._dicDataGroup[groupKey])
          } else {
            const groupKey = preKey + '_' + key
            if (!collapse) {
              this.listDataGrouped.push(groupKey)
              this._dicRowGroup[this.listDataGrouped.length - 1] = this._groupLevel[level]
            }
            this._dicDataGroup[groupKey] = mapGroup(obj[key], level + 1, groupKey, collapse)
            lst.push(...this._dicDataGroup[groupKey])
          }
        })
        return lst
      }
    }
    mapGroup(dicGroupData, 0)
    // end group data
    this._action = {}
    this._actionsHaveFrame = []
    if (this._bottomRow) this.listDataGrouped.push(this._bottomRow)
    if (this.props.showProvider) this.listDataGrouped.push({ _provider: true })
    this.grid.setData(this.listDataGrouped)
    if (this.props.showProvider && this.listDataGrouped.length === 1) this.grid.setInfo(dataStorage.translate('lang_no_data'))
    if (this.props.isMargin) this.setDataColumnFull(this.listDataGrouped)
    this.grid.allowEvents(true)
    if (this._listData.length && !this.fitted) {
      this.fitted = true
      this.autoSizeColumn()
    }
  }

  setDataColumnFull = (data) => {
    let fullBranch = Object.keys(this._dicState).reduce((a, c) => {
      if (c !== 'actions' && c !== 'groupColumn') a.push(c)
      return a
    }, [])
    data.forEach(x => {
      if (['SENDING_WARNING', 'CANCEL_ALL_ORDERS', 'CLOSE_ALL_POSITION', 'REDUCE_POSITION_ONLY'].includes(x.actionsEnum)) {
        fullBranch.forEach(v => {
          if (!this._dataColumnFull[v]) this._dataColumnFull[v] = {}
          this._dataColumnFull[v][x.groupColumn] = x[v]
        })
      }
    })
  }
  getData = (diff, listNamesCheckOrDiffCells) => {
    const listNames = Array.isArray(listNamesCheckOrDiffCells) ? listNamesCheckOrDiffCells : null;
    const diffCells = diff && listNamesCheckOrDiffCells === true;
    const lst = (diff ? this._listData.filter(data => {
      const key = this.fnKey(data);
      let changed = false;
      this._dataTemp[key] && Object.keys(this._dataTemp[key]).forEach(name => {
        if ((!listNames || !listNames.indexOf(name) > -1) && data[name] !== this._dataTemp[key][name]) changed = true;
      });
      return changed;
    }) : this._listData);
    if (diffCells) {
      return lst.reduce((obj, data) => {
        const key = this.fnKey(data);
        obj[key] = {};
        Object.keys(this._dataTemp[key]).forEach(name => data[name] !== this._dataTemp[key][name] && (obj[key][name] = this._dataTemp[key][name]));
        return obj;
      }, {});
    }
    return lst.map(data => {
      const objTmp = this._dataTemp[this.fnKey(data)];
      const obj = { ...data };
      if (objTmp) Object.assign(obj, objTmp);
      return obj;
    });
  }
  /**
      * Add detail
      * params : data and key
      * Data is new data
      * Key used to get add detail row in dic
      * Use fnKey function to get unique key for each form and use it to check we shold to update or insert data in dic
      * fnKey function is written in every widget
      */
  addDetail = (data, key) => {
    if (this._rowDetailExpand[key] && Array.isArray(this._detail[key])) {
      let keyRow = this.fnKey(data, true)
      let index = this._detail[key].findIndex(dataRow => this.fnKey(dataRow, true) === keyRow)
      if (index > -1) {
        this._detail[key][index] = data
      } else {
        this._detail[key].unshift(data);
      }
      this.setData();
    }
  }
  clearDetail = () => {
    this._detail = {}
  }
  addOrUpdate = (data, onlyUpdate) => {
    if (!this.grid) return
    let isHaveToSetData = false
    if (Array.isArray(data)) {
      data.forEach(v => {
        const key = this.fnKey(v);
        if (this._dicData[key]) {
          Object.assign(this._dicData[key], v);
        } else if (!onlyUpdate) {
          isHaveToSetData = true
          this._dicData[key] = v;
          this._listData.unshift(v);
        }
      })
    } else {
      const key = this.fnKey(data);
      if (this._dicData[key]) {
        Object.assign(this._dicData[key], data);
      } else if (!onlyUpdate) {
        isHaveToSetData = true
        this._dicData[key] = data;
        this._listData.unshift(data);
      }
    }
    if (this.props.performance) {
      if (this.isFirst) {
        this.isFirst = false
        this.fitted = false
        this.setData();
        return
      }
      if (isHaveToSetData) {
        this.fitted = false
        this.setData();
      }
    } else {
      this.fitted = false
      this.setData();
    }
  }
  remove = (data, cb) => {
    if (Array.isArray(data)) {
      data.forEach(val => {
        const key = this.fnKey(val);
        if (this._dicData[key]) {
          this._listData.splice(this._listData.indexOf(this._dicData[key]), 1);
          delete this._dicData[key];
          this.setData();
        }
      })
    } else {
      const key = this.fnKey(data);
      if (this._dicData[key]) {
        this._listData.splice(this._listData.indexOf(this._dicData[key]), 1);
        delete this._dicData[key];
        this.setData();
      }
    }
    cb && cb()
  }
  getValue = (params, name) => {
    if (!name || !this._dicColDef[name]) return null;
    if (typeof this._dicColDef[name].valueGetter === 'function') {
      const p = { ...params }
      p.colState = this._dicState[name]
      p.colDef = this._dicColDef[name]
      p.name = name
      p.value = p.data[name]
      return this._dicColDef[name].valueGetter(p)
    }
    return params.data[name];
  }
  setValue = (params, value, name) => {
    if (params.group) {
      this._dataTemp[params.keyParams] = value;
    } else {
      const key = this.fnKey(params.data);
      if (params.colDef.fnType && params.colDef.fnType(params) === 'marginBoolean') {
        let arrKey = key.split('|')
        let dataColumn = this._dataColumnFull[params.name]
        let dataCell = dataColumn[arrKey[0]]
        let check = 0;
        if (dataCell.includes(arrKey[1])) {
          dataCell.splice(dataCell.indexOf(arrKey[1]), 1)
        } else {
          dataCell.push(arrKey[1])
          check = 1
        }
        if (!this._dataColumn[params.name]) this._dataColumn[params.name] = {}
        this._dataColumn[params.name][arrKey[0]] = dataCell
        if (!this._dataTemp[key]) this._dataTemp[key] = {};
        this._dataTemp[key][name || params.name] = value;
        if (check) {
          Object.keys(dataColumn).forEach(x => {
            if (x !== arrKey[0]) {
              if (dataColumn[x].includes(arrKey[1])) {
                dataColumn[x].splice(dataColumn[x].indexOf(arrKey[1]), 1)
                this._dataColumn[params.name][x] = dataColumn[x]
                if (!this._dataTemp[`${x}|${arrKey[1]}`]) this._dataTemp[`${x}|${arrKey[1]}`] = {}
                this._dataTemp[`${x}|${arrKey[1]}`][params.name] = dataColumn[x]
              }
            }
          })
        }
      } else {
        ; if (!this._dataTemp[key]) this._dataTemp[key] = {};
        this._dataTemp[key][name || params.name] = value;
      }
    }
  }

  setValueByKey = (key, value, name) => {
    if (!this._dataTemp[key]) this._dataTemp[key] = {};
    this._dataTemp[key][name || params.name] = value;
  }

  toPosition = config => {
    return (config.gridCell.y === 0 ? 'header' : 'cell') + '_' + config.dataCell.x + '_' + config.dataCell.y;
  }
  toDisplayValue = (params) => {
    if (typeof params.colDef.formater === 'function') return params.colDef.formater(params)
    return (params.value === 0 || params.value ? params.value : '--')
  }
  setRowExpand = (groupKey, value) => {
    this._rowGroupExpand[groupKey] = value;
    this.setData();
  }
  setRowDetailExpand = (key, value) => {
    if (this.props.oneDetail) Object.keys(this._rowDetailExpand).forEach(key => this._rowDetailExpand[key] = false);
    this._rowDetailExpand[key] = value;
    this.setData();
  }
  setExpandAll = () => {
    this._dicDataGroup && Object.keys(this._dicDataGroup).forEach(key => this._rowGroupExpand[key] = true);
    this.setData();
  }
  setCollapseAll = () => {
    this._dicDataGroup && Object.keys(this._dicDataGroup).forEach(key => this._rowGroupExpand[key] = false);
    this.setData();
  }
  paintHub = (paint, gc, config, position) => {
    this._visibleCells[position] = true;
    const group = config.gridCell.y && this._dicRowGroup && this._dicRowGroup[config.dataCell.y];
    const isDetail = config.gridCell.y && !group && this.props.detailSource && !this._listData.includes(config.dataRow);
    const key = config.dataRow ? this.fnKey(config.dataRow, isDetail) : '';
    const name = config.columnNames[config.gridCell.x];
    const value = this._dataTemp[key] && this._dataTemp[key].hasOwnProperty(name) ? this._dataTemp[key][name] : config.value;
    const data = this._dataTemp[key] ? { ...config.dataRow, ...this._dataTemp[key] } : config.dataRow;
    const colDef = this._dicColDef[config.columnNames[config.gridCell.x]];
    let keyParams = key;
    if (group) keyParams = 'group:' + data;
    else if (isDetail) keyParams = 'detail:' + key;
    const params = (keyParams !== undefined && (this._dicParams[keyParams + '_' + name] || (this._dicParams[keyParams + '_' + name] = {}))) || {};
    if (isDetail) params.level = (this._groupLevel ? this._groupLevel.length : 0) + 1;
    else if (config.gridCell.y) params.level = group ? this._groupLevel.indexOf(group) : this._groupLevel.length;
    Object.assign(params, {
      keyParams: keyParams,
      key: key,
      root: this,
      group: !!group,
      isHeader: !config.gridCell.y,
      detail: isDetail,
      gridId: this.id,
      isEditMode: this.isEditMode,
      gc,
      config,
      colDef: colDef,
      colState: this._dicState[config.columnNames[config.gridCell.x]],
      name: name,
      value: value,
      data: data,
      dataOrigin: config.dataRow,
      grid: this.grid,
      font: this.font,
      style: this.style,
      hover: this._cellHovered === position,
      rowHover: this._rowHovered === config.dataCell.y,
      rowSelected: this.props.suppressSelectRow ? false : (this._rowClicked === config.dataCell.y),
      menuActive: this._menuPosition === position,
      position: position
    })
    if (params.hover) this._dataRowHover = data
    try {
      if (params.isHeader && colDef.cellOnHeader && this._dicCells[colDef.renderer]) {
        gc.fillStyle = this.style.getPropertyValue('--primary-default');
        gc.fillRect(config.bounds.x, config.bounds.y, config.bounds.width - 2, config.bounds.height);
        paint = this._dicCells[colDef.renderer]
      }
      let action = null;
      params.isFirst = this.grid.behavior.columns.length > 1 && this.grid.behavior.columns[0].name === name;
      params.isLast = this.grid.behavior.columns.length > 1 && this.grid.behavior.columns[this.grid.numColumns - 1].name === name;
      params.isFirstVisible = this.grid.renderer.visibleColumns[0].column.name === name;
      params.isLastVisible = this.grid.renderer.visibleColumns[this.grid.renderer.getVisibleColumnsCount()].column.name === name;
      params.rowTextStyle = this.style.getPropertyValue('--secondary-default');
      if (config.gridCell.y && this._bottomRow === config.dataRow) {
        gc.fillStyle = this.grid.properties.rowStripes[0].backgroundColor;
        gc.fillRect(config.bounds.x, config.bounds.y, config.bounds.width, config.bounds.height);
      } else {
        const rowWidth = Math.min(this.grid.canvas.width, this.grid.renderer.visibleColumns.reduce((total, col) => total + col.width, 0));
        if (config.gridCell.y) {
          params.rowStyle = config.backgroundColor;
          if (params.rowSelected || params.rowHover || group) {
            if (params.rowSelected) {
              params.rowStyle = this.style.getPropertyValue('--ascend-dark')
            } else if (params.rowHover) {
              params.rowTextStyle = this.style.getPropertyValue('--menu-text-hover');
              params.rowStyle = this.style.getPropertyValue('--menu-background-hover');
            } else params.rowStyle = this.style.getPropertyValue('--primary-light');
            if (params.isFirstVisible) {
              const bg = gc.fillStyle;
              gc.fillStyle = params.rowStyle;
              gc.fillRect(0, config.bounds.y, rowWidth, config.bounds.height);
              gc.fillStyle = bg;
            }
          }
          if (group) {
            const groupKey = typeof params.data === 'string' ? params.data : params.dataOrigin
            params.group = true;
            params.isEditMode = this.props.editGroup ? this.isEditMode : false;
            params.expand = this._rowGroupExpand[params.data];
            params.name = group.name;
            params.children = this._dicDataGroup[groupKey];
            params.data = this._dataTemp[params.keyParams] || params.children[0];
            params.value = params.data[params.name];
            params.setRowExpand = (value) => this.setRowExpand(groupKey, value);
            params.colDef = this._dicColDef[group.name];
            params.subPaint = this._dicCells[params.colDef.renderer];
            paint = rowGroupCell;
          } else {
            if (typeof params.colDef.fnType === 'function') {
              const type = params.colDef.fnType(params);
              if (type) paint = switchType({ type }).fn;
            }
            if (params.isFirst) {
              if (this.props.detailSource && this._listData.includes(config.dataRow)) {
                params.expand = this._rowDetailExpand[key];
                params.setRowDetailExpand = (value) => this.setRowDetailExpand(key, value);
                params.subPaint = paint;
                paint = detailGroupCell;
              } else if (params.level) {
                params.subPaint = paint;
                paint = subParams => {
                  const b = subParams.config.bounds;
                  const paddingLeft = subParams.level * 16 + 12;
                  const p = { ...subParams, colDef: { ...subParams.colDef, align: 'left' }, config: { ...config, bounds: { x: paddingLeft, y: b.y, width: b.width - paddingLeft, height: b.height } } };
                  return subParams.subPaint(p);
                }
              }
            }
          }
          const setValue = (value, name) => this.setValue(params, value, name);
          params.setValue = typeof params.colDef.setValue === 'function' ? (value, name) => params.colDef.setValue({ ...params, setValue }, value, name) : setValue;
          params.getValue = name => this.getValue(params, name);
          if (typeof params.colDef.valueGetter === 'function') params.value = params.colDef.valueGetter(params);
          params.displayValue = this.toDisplayValue(params);
          params.dicLabelClick = this.dicLabelClick;
        }
        gc.textAlign = 'left';
        params.floatContent = null;
        if (params.isFirstVisible && this._floatUnder && this._floatUnder.length && !params.group && params.data) {
          const p = Object.assign(this._dicParams['floatUnder:' + keyParams] || (this._dicParams['floatUnder:' + keyParams] = {}), params, { config: { ...config, bounds: { x: 0, y: config.bounds.y, width: rowWidth, height: config.bounds.height } } });
          this._floatUnder.forEach(col => {
            const paint = switchType(col);
            p.colDef = col;
            p.value = params.data[col.name];
            p.displayValue = this.toDisplayValue(p);
            p.gc.textAlign = 'left';
            paint.fn(p);
          });
        }
        action = paint(params);
        delete this._action[config.dataCell.y]
        if (params.isLastVisible && this._float && this._float.length && !params.group && params.data) {
          const p = Object.assign(this._dicParams['float:' + keyParams] || (this._dicParams['float:' + keyParams] = {}), params, { config: { ...config, bounds: { x: 0, y: config.bounds.y, width: rowWidth, height: config.bounds.height } } });
          this._float.forEach(col => {
            const paint = switchType(col);
            p.colDef = col;
            p.value = params.data[col.name];
            p.displayValue = this.toDisplayValue(p);
            p.gc.textAlign = 'left';
            this._action[config.dataCell.y + ''] = paint.fn(p);
          });
        }
      }
      if (this._bottomRow) {
        if (config.gridCell.y === this.grid.renderer.visibleRows.length - 1) {
          gc.fillStyle = this.style.getPropertyValue('--semantic-primary');
          gc.fillRect(config.bounds.x, this.grid.canvas.height - config.bounds.height - 10, config.bounds.width, 2);
          gc.fillStyle = this.grid.properties.rowStripes[0].backgroundColor;
          gc.fillRect(config.bounds.x, this.grid.canvas.height - config.bounds.height - 8, config.bounds.width, config.bounds.height);
          const p = { ...params, ...{ rowStyle: gc.fillStyle, config: { ...config, ...{ bounds: { ...config.bounds, ...{ y: this.grid.canvas.height - config.bounds.height - 8 } } } } } };
          delete p.detail;
          p.bottom = true;
          p.font = '700 ' + params.font;
          p.data = this._bottomRow;
          p.name = name;
          p.value = p.data[name];
          p.displayValue = this.toDisplayValue(p);
          p.gc.textAlign = 'left';
          (params.subPaint || paint)(p);
          return null;
        }
      }
      if (this.props.showProvider) {
        if (config.gridCell.x === this.grid.renderer.visibleColumns[this.grid.renderer.visibleColumns.length - 1].columnIndex && config.dataRow && config.dataRow._provider) {
          gc.fillStyle = this.style.getPropertyValue('--primary-dark')
          gc.fillRect(0, config.bounds.y, this.grid.canvas.width, 32)
          gc.font = '8px Roboto, sans-serif'
          const text = (dataStorage.translate('lang_quant_house_provided') + '').toUpperCase()
          const widthText = gc.measureText(text).width + 8;
          gc.fillStyle = this.style.getPropertyValue('--secondary-default')
          gc.textBaseline = 'bottom'
          let x
          const widthImage = imageProvider && imageProvider.src.includes('QE') ? 110 : 70
          const y = config.bounds.y
          if (this.props.providerHalfRight) {
            x = config.bounds.x
            gc.globalAlpha = 0.75
            imageProvider && gc.drawImage(imageProvider, 0, y + 16, widthImage, 16);
          } else if (this.props.providerHalfLeft) {
            x = config.bounds.x + config.bounds.width - widthText
            gc.fillText(text, x, y + 28);
          } else {
            x = this.grid.canvas.width / 2 - widthText - 20
            gc.fillText(text, x, y + 28);
            gc.globalAlpha = 0.75
            imageProvider && gc.drawImage(imageProvider, x + widthText, y + 16, widthImage, 16);
          }
          return null
        }
      }
      return action;
    } catch (error) {
      console.log(error);
    }
  }
  registerCell = (paint, rendererName) => {
    this._dicCells[rendererName] = paint;
    this.grid.cellRenderers.add(CellRenderer.extend(rendererName, {
      paint: (gc, config) => {
        const position = this.toPosition(config);
        const action = this.paintHub(params => {
          gc.save();
          gc.beginPath();
          gc.rect(params.config.bounds.x, params.config.bounds.y, params.config.bounds.width, params.config.bounds.height);
          gc.clip();
          gc.beginPath();
          const res = paint(params);
          gc.restore();
          return res;
        }, gc, config, position);
        if (action) {
          if (typeof action.frame === 'function' && config.gridCell.y) {
            const index = this._actionsHaveFrame.indexOf(this._action[position]);
            if (index > -1) this._actionsHaveFrame[index] = action;
            else this._actionsHaveFrame.push(action);
          }
          if (typeof action.drag === 'function' && config.gridCell.y) {
            const index = this._actionsHaveDrag.indexOf(this._action[position]);
            if (index > -1) this._actionsHaveDrag[index] = action;
            else this._actionsHaveDrag.push(action);
          }
          this._action[position] = action;
        } else this.cancelAction(position);
      }
    }))
  }
  mapColumns = (colums) => {
    this._colDefs = [];
    this._dicColDef = {}
    let preName = '';
    colums.forEach((col) => {
      if (!col) return;
      if (col.float) {
        if (col.under) {
          if (!this._floatUnder) this._floatUnder = [];
          if (!this._floatUnder.includes(col)) this._floatUnder.push(col);
        } else {
          if (!this._float) this._float = [];
          if (!this._float.includes(col)) this._float.push(col);
        }
        return;
      }
      this._dicColDef[col.name] = col;
      if (!this._dicState[col.name]) {
        this._dicState[col.name] = {
          name: col.name
        };
        if (col.hasOwnProperty('groupIndex')) this._dicState[col.name].groupIndex = col.groupIndex;
        if (col.hasOwnProperty('hide')) this._dicState[col.name].hide = col.hide;
        if (col.hasOwnProperty('filter')) this._dicState[col.name].filter = col.filter;
        const i = this._colState.indexOf(this._dicState[preName]);
        if (i > -1) this._colState.splice(i + 1, 0, this._dicState[col.name]);
        else this._colState.push(this._dicState[col.name]);
      }
      preName = col.name;
      const paint = switchType(col);
      col.renderer = `${this.id}_${paint.renderer}`;
      if (this.visible) this.registerCell(paint.fn, col.renderer);
      else {
        if (!this._queue) this._queue = {};
        this._queue[col.type || 'label'] = () => {
          this.registerCell(paint.fn, col.renderer);
        }
      }
      this._colDefs.push(col);
    });
  }
  addProperties = () => {
    try {
      const odd = { color: this.style.getPropertyValue('--secondary-default'), backgroundColor: this.style.getPropertyValue('--primary-default'), font: this.font };
      const even = { color: this.style.getPropertyValue('--secondary-default'), backgroundColor: this.style.getPropertyValue('--primary-dark'), font: this.font };
      const features = ['filters', 'cellselection', 'keypaging', 'rowselection', 'columnselection', 'columnsorting', 'cellclick', 'onhover', 'touchscrolling'];
      if (!this.props.suppressReszieColumn) features.push('columnresizing');
      features.push('columnmoving');
      this.grid.addProperties({
        showRowNumbers: false,
        noDataMessage: dataStorage.translate('lang_no_data'),
        defaultRowHeight: !this.props.rowHeight ? ROW_HEIGHT : this.props.rowHeight,
        fixedRowCount: this.props.rowFixed || 0,
        rowStripes: [
          even,
          odd
        ],
        cellPadding: 8,
        backgroundColor: 'transparent',
        backgroundColor2: 'transparent',
        columnAutosizing: true,
        autoSelectRows: true,
        maximumColumnWidth: 666,
        hoverCellHighlight: { enabled: true },
        hoverColumnHighlight: { enabled: true },
        hoverRowHighlight: { enabled: true, backgroundColor: this.style.getPropertyValue('--menu-background-hover') },
        backgroundSelectionColor: this.style.getPropertyValue('--ascend-dark'),
        foregroundSelectionColor: this.style.getPropertyValue('--secondary-default'),
        lineColor: 'transparent',
        selectionRegionOutlineColor: 'transparent',
        foregroundSelectionFont: this.font,
        fixedLinesHColor: this.style.getPropertyValue('--primary-dark'),
        fixedLinesVColor: this.style.getPropertyValue('--primary-dark'),
        fixLineShadow: this.style.getPropertyValue('--primary-dark'),
        halign: 'left',
        columnSelection: false,
        columnHeaderRenderer: `${this.id}_header`,
        renderFalsy: true,
        features: features
      })
    } catch (error) {
      console.error('addProperties: ', error)
    }
  }
  triggerAction = (event, position, action) => {
    try {
      if (!position) return;
      let next = true;
      event.preventDefault = () => next = false;
      this._action && this._action[position] && this._action[position][action] && this._action[position][action](event);
      if (next && position.startsWith('cell_')) {
        const row = position.split('_')[2];
        this._action && this._action[row] && this._action[row][action] && this._action[row][action](event);
        if (next && action === 'click' && typeof this.props.onRowClicked === 'function' && !this._dicRowGroup[row] && this.listDataGrouped) this.props.onRowClicked(this.listDataGrouped[row]);
      }
    } catch (error) {
      console.log('triggerAction_' + action, event, error);
    }
  }
  cancelAction = (position) => {
    const index = this._actionsHaveFrame.indexOf(this._action[position]);
    if (index > -1) this._actionsHaveFrame.splice(index, 1);
    delete this._action[position]
  }

  createCopyClipboard = () => {
    let input = document.getElementById('copy_clipboard');
    if (!input) {
      input = document.createElement('input');
      input.id = 'copy_clipboard';
      input.style.position = 'absolute'
      input.style.left = -999 + 'px'
      input.setAttribute('type', 'text')
      input.setAttribute('readOnly', true)
      document.body.appendChild(input)
    }
  }

  showContextMenu = (event) => {
    const { detail } = event
    const data = typeof event.detail.row === 'string' ? null : event.detail.row;
    let options = {
      id: this.props.id,
      data,
      mouse: detail.pagePoint || { x: detail.primitiveEvent.x, y: detail.primitiveEvent.y },
      fn: {
        showConfirm: this.props.showConfirm,
        onCopy: this.onCopy,
        onCopyWithHeader: this.onCopyWithHeader,
        onExport: this.exportCsv
      }
    }
    dataStorage.showContextMenu && dataStorage.showContextMenu(options)
  }

  onCopy = (data) => {
    try {
      if (!data) return
      const columnSchema = this.grid.behavior.getActiveColumns()
      const copyText = document.getElementById('copy_clipboard')
      let text = ''
      columnSchema.map(e => {
        const field = e.name
        //   text += `${e.convertData ? e.convertData({ name, data: row, value: row[name] }) : this.convertData(field, data)}  `
        text += `${data[field] || ' '} `
      })
      copyText.value = text
      copyText.select()
      copyText.setSelectionRange(0, 99999)
      document.execCommand('copy')
    } catch (error) {
      console.error('onCopy: ', error)
    }
  }

  onCopyWithHeader = (data) => {
    try {
      if (!data) return
      const columnSchema = this.grid.behavior.getActiveColumns()
      const copyText = document.getElementById('copy_clipboard')
      let text = ''
      columnSchema.map(e => {
        const field = e.name
        const header = dataStorage.translate(e.header)
        // text += `${(header + '').toUpperCase()}:  ${e.convertData ? e.convertData({ name, data: row, value: row[name] }) : this.convertData(field, data)}  ` + '\n'
        text += `${(header + '').toUpperCase()}:  ${data[field] || ' '}  ` + '\n'
      })
      copyText.value = text
      copyText.select()
      copyText.setSelectionRange(0, 99999)
      document.execCommand('copy')
    } catch (error) {
      console.error('onCopyWithHeader: ', error)
    }
  }

  closeSystemRightClickMenu = () => {
    if (this.systemRightClick) {
      ReactDOM.render(null, this.systemRightClick);
      this.systemRightClick.style.display = 'none';
    }
  }

  startDragging = () => {
    this.enableDrag = true;
  }

  createDragAnimation = (e, dataRow) => {
    let location = this.grid.div.getBoundingClientRect();
    if (this.dragger) {
      let style = this.dragger.style;
      if (style.display === 'inline') {
        let trans = `translate(0px,${e.detail.mouse.y - 10}px)`;
        style.transform = trans;
      } else {
        style.display = 'inline';
        this.dragger.setAttribute('width', `${location.width}px`);
        this.dragger.setAttribute('height', `32px`);
        style.width = `${location.width}px`;
        style.height = this.grid.properties.defaultRowHeight + 'px';
        style.top = location.top + 'px';
        style.left = `${location.left + 8}px`;
        style.opacity = '0.7';
        style.zIndex = '10';
        style.cursor = 'grab';
        let trans = `translate(0px,${e.detail.mouse.y - 10}px)`;
        style.transform = trans;
        style.boxShadow = '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)';

        let gc = this.draggerCTX;
        gc.getTextWidth = (string) => {
          string += '';
          for (var i = 0, sum = 0, len = string.length; i < len; ++i) {
            var c = string[i];
            sum += gc.measureText(c).width;
          }
          return sum;
        }
        gc.fillStyle = this.style.getPropertyValue('--primary-dark');
        gc.fillRect(0, 0, location.width, 32)
        gc.save();
        let tradingTextWidth = 0;
        if (dataRow.trading_halt) {
          gc.beginPath();
          gc.fillStyle = 'red';
          gc.fillText('!', 5, 0 + 20)
          tradingTextWidth = gc.getTextWidth('!') + 3;
          gc.closePath();
        }
        gc.fillStyle = this.style.getPropertyValue('--secondary-default');
        gc.fillText(dataRow.display_name, 5 + tradingTextWidth, 0 + 20);
        const countryCode = getCountryCode(dataRow);
        if (countryCode) {
          if (!this.dicFlags[countryCode]) {
            this.dicFlags[countryCode] = new Image();
            this.dicFlags[countryCode].src = 'flag/' + countryCode + '.png';
          }
          gc.drawImage(this.dicFlags[countryCode], 200, 11, 20, 10);
        }
        gc.beginPath();
        if (dataRow.intradayNews) gc.fillStyle = this.style.getPropertyValue('--secondary-dark');
        else gc.fillStyle = this.style.getPropertyValue('--sematic-primary');
        gc.font = '12px Roboto';
        gc.fillRect(228, 0 + 11, gc.getTextWidth('A') + 4, 12)
        gc.fillStyle = this.style.getPropertyValue('--primary-dark');
        gc.fillText('A', 230, 0 + 21)
        gc.closePath();
        gc.restore();
      }
    }
  }

  hiddenAnimation = () => {
    if (this.dragger) {
      this.dragger.style.display = 'none';
    }
  }

  changeRowPoisition = (startIndex, endIndex) => {
    this._listData.splice(endIndex, 0, this._listData.splice(startIndex, 1)[0]);
    this.setData();
  }

  addEventListener = () => {
    this.grid.addEventListener('fin-mouseup', (e) => {
      this._columnMouseUp = e.detail.gridCell.x
    });

    this.grid.addEventListener('fin-column-changed-event', () => {
      const originColumns = this.getColumnsFromState();
      if (this.grid.behavior.columns.length !== originColumns.length) return;
      let colToFit;
      this.grid.behavior.columns.forEach((col, index) => {
        if (colToFit && col.name === colToFit) this.autoSizeColumn(col);
        if (originColumns[index].name !== col.name) {
          if (index === 0 && !this.props.autoFit) {
            this.autoSizeColumn(col);
            colToFit = originColumns[0].name;
          }
          const index1 = this._colState.indexOf(originColumns[index]);
          const index2 = this._colState.indexOf(this._dicState[col.name]);
          if (index1 > -1 && index2 > -1) {
            const tmp1 = this._colState[index1];
            this._colState[index1] = this._colState[index2];
            this._colState[index2] = tmp1;
          }
          const nextIndex = originColumns.indexOf(this._dicState[col.name]);
          if (nextIndex > -1) {
            const tmp2 = originColumns[index];
            originColumns[index] = originColumns[nextIndex];
            originColumns[nextIndex] = tmp2;
          }
        }
      });
      this.saveState();
    });
    this.grid.addEventListener('fin-click', (e) => {
      this.isFinClick = true
      this.timerClick && clearTimeout(this.timerClick)
      if (e.detail.gridCell.y) this._rowClicked = e.detail.dataCell.y;
      this.timerClick = setTimeout(() => {
        this.triggerAction(e, this.toPosition(e.detail), 'click');
      }, this.props.onRowDbClick ? 50 : 0)
    });

    this.grid.addEventListener('fin-mouseup', (e) => {
      this.triggerAction(e, this.toPosition(e.detail), 'mouseUp');
    });
    this.grid.addEventListener('fin-mousedown', (e) => {
      this.triggerAction(e, this.toPosition(e.detail), 'mouseDown');
    });

    this.grid.addEventListener('fin-canvas-drag', (e) => {
      this._actionsHaveDrag.length && this._actionsHaveDrag.forEach(action => action.drag(e));
    });

    this.grid.addEventListener('fin-double-click', (e) => {
      const dataRow = e.detail.row || {}
      if (this.isFinClick) this.isFinClick = false
      this.timerClick && clearTimeout(this.timerClick)
      this.props.onRowDbClick && this.props.onRowDbClick(dataRow)
    })

    this.grid.addEventListener('fin-canvas-context-menu', (e) => {
      if (this.isFinRightClick) {
        this.isFinRightClick = false
        return
      }
      this.showContextMenu(e)
    })
    this.grid.addEventListener('fin-context-menu', (e) => {
      if (e.detail.gridCell.y) this._rowClicked = e.detail.dataCell.y;
      this.isFinRightClick = true
      this.showContextMenu(e)
    })

    this.grid.addEventListener('fin-scroll-y', () => {
      document.dispatchEvent(new Event('mousedown'));
      dataStorage.hideContextMenu && dataStorage.hideContextMenu()
    })
    this.grid.addEventListener('fin-scroll-x', () => {
      document.dispatchEvent(new Event('mousedown'));
      dataStorage.hideContextMenu && dataStorage.hideContextMenu()
    })

    this.grid.addEventListener('fin-mousemove', (e) => {
      const position = this.toPosition(e.detail);
      this.triggerAction(e, position, 'mouseMove');
      if (this._cellHovered !== position) {
        this.triggerAction(e, this._cellHovered, 'mouseLeave');
        this.triggerAction(e, position, 'mouseEnter');
        this._cellHovered = position;
        this.grid.repaint();
      }
      this._colHovered = e.detail.dataCell.x;
      if (e.detail.gridCell.y) this._rowHovered = e.detail.dataCell.y;
      else delete this._rowHovered
      this._mouseInCell = e.detail.gridPoint.x + '_' + e.detail.gridPoint.y;
    });
    this.grid.addEventListener('fin-grid-rendered', (e) => {
      if (this._lastVisibleCells) {
        Object.keys(this._lastVisibleCells).forEach(position => {
          if (!this._visibleCells[position]) {
            this.triggerAction(e, position, 'inVisible');
            this.cancelAction(position);
          }
        });
      }
      this._lastVisibleCells = this._visibleCells;
      this._visibleCells = {};
    });
    this.grid.addEventListener('fin-canvas-mouseout', (e) => {
      this.triggerAction(e, this._cellHovered, 'mouseLeave');
      delete this._cellHovered;
      delete this._colHovered;
      delete this._rowHovered;
    });
    this.grid.addEventListener('fin-canvas-mousemove', (e) => {
      if (this._mouseInCell) {
        if (this._mouseInCell !== e.detail.mouse.x + '_' + e.detail.mouse.y) {
          this.triggerAction(e, this._cellHovered, 'mouseLeave');
          delete this._cellHovered;
          delete this._colHovered;
          delete this._rowHovered;
          delete this._mouseInCell;
          this.grid.repaint();
        }
      }
    });
  }

  renderPagination = () => {
    try {
      if (!this.props.paginate) return null
      return (
        <Paginate ref={ref => this.paginate = ref} showSource={this.props.showSource} paginate={this.props.paginate} />
      )
    } catch (error) {
      console.log('renderPagination: ', error)
    }
  }

  componentDidMount = () => {
    this.grid = new Hypergrid(`#${this.id}`, {
      data: this._listData,
      schema: []
    });
    this.props.getRootGrid && this.props.getRootGrid(this.grid)
    this.style = getComputedStyle(this.grid.canvas.canvas);
    this.setFont();
    this.grid.canvas.gc.clipSave = this.grid.canvas.gc.clipRestore = () => { };
    this.updateColumns();
    this.props.getFilterOnSearch && this.handleSortFilter();
    this.visible = true;
    this.registerCell(headerCell, `${this.id}_header`);
    if (this._queue) {
      Object.keys(this._queue).map(type => {
        this._queue[type]();
      });
      delete this._queue;
    }
    this.addProperties();
    this.addEventListener();
    const frameFn = this.grid.canvas.tickPainter;
    this.grid.canvas.tickPainter = (now) => {
      this._actionsHaveFrame.length && this._actionsHaveFrame.forEach(action => action.frame(now));
      frameFn(now);
    }
    this.createCopyClipboard()
    createContextMenu()
    this.autoSizeColumn()
    this.props.onReady && this.props.onReady()
    imageProvider = new Image()
    imageProvider.src = this.getProvider()
    setTimeout(() => {
      // console.log(this.grid.canvas.canvas)
      // this.grid.canvas.canvas.height = this.grid.canvas.canvas.height + 32
      // this.grid.setRowHeight(0, 64)
    }, 5000)
  }

  componentWillUnmount = () => {
    removeEventListener(EVENTNAME.themeChanged, this.themeChanged);
    removeEventListener(EVENTNAME.fontChanged, this.repaint);
    this.grid.canvas.stopPainting();
  }
  render() {
    return <div ref={dom => this.dom = dom} className={s.container}>
      <div id={this.id} className={s.grid + ' ' + (this.props.paginate ? s.gridPaginate : '')}></div>
      {this.renderPagination()}
    </div>
  }
}
