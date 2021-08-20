import React from 'react';
import Lang from '../../Lang';
import DropDown from '../../../DropDown';
import s from '../CanvasGrid.module.css';
import SvgIcon, { path } from '../../SvgIcon';

export default class MenuFilter extends React.Component {
  constructor(props) {
    super(props);
    this.filter1 = '';
    this.filter2 = '';
    this.condition1 = '';
    this.condition2 = '';
    this.type1 = 'contains';
    this.type2 = 'contains';
    this.state = {};
    if (props.params.colState.filter) {
      const filter = props.params.colState.filter;
      if (filter.operator) {
        this.state.or = filter.operator === 'or';
        this.filter1 = filter.condition1.filter || '';
        this.filter2 = filter.condition2.filter || '';
        this.type1 = filter.condition1.type || '';
        this.type2 = filter.condition2.type || '';
      } else {
        this.filter1 = filter.filter || '';
        this.type1 = filter.type || ''
      }
    }
    this.options = [
      {
        label: 'lang_contains',
        value: 'contains',
        className: 'firstLetterUpperCase'
      },
      {
        label: 'lang_not_contains',
        value: 'notContains',
        className: 'firstLetterUpperCase'
      },
      {
        label: 'lang_equals',
        value: 'equals',
        className: 'firstLetterUpperCase'
      },
      {
        label: 'lang_not_equal',
        value: 'notEqual',
        className: 'firstLetterUpperCase'
      },
      {
        label: 'lang_starts_with',
        value: 'startsWith',
        className: 'firstLetterUpperCase'
      },
      {
        label: 'lang_ends_with',
        value: 'endsWith',
        className: 'firstLetterUpperCase'
      }
    ];
    this.checkBoxOptions = this.props.params.colDef.optionsShow || this.props.params.colDef.options;
  }

  setFilter = () => {
    this.props.params.root.filterColumn(this.props.params.colState, this.generateFilter());
  }

  generateFilter = () => {
    if (!this.filter1) return null;
    const condtion = {
      filter: this.filter1,
      type: this.type1 || 'contains',
      columnType: this.props.params.colDef.columnType || 'text'
    };
    if (!this.filter2) return condtion;
    return {
      condition1: condtion,
      condition2: {
        filter: this.filter2,
        type: this.type2 || 'contains',
        columnType: this.props.params.colDef.columnType || 'text'
      },
      operator: this.state.or ? 'or' : 'and'
    }
  }

  input1Changed = (e) => {
    this.filter1 = e.target.value
    this.setFilter();
    this.forceUpdate();
    this.props.updateMenu && this.props.updateMenu()
  }

  input2Changed = (e) => {
    this.filter2 = e.target.value
    this.setFilter();
    this.forceUpdate();
    this.props.updateMenu && this.props.updateMenu()
  }

  radioClicked = (or) => {
    this.setState({ or }, this.setFilter);
  }

  type1Changed = (type) => {
    this.type1 = type;
    this.setFilter();
    this.forceUpdate();
  }

  type2Changed = (type) => {
    this.type2 = type;
    this.setFilter();
    this.forceUpdate();
  }

  renderDynamicfilter = () => {
    return (
      <div>
        <DropDown
          className={s.select}
          value={this.type1}
          translate={true}
          options={this.options}
          onChange={this.type1Changed}
          onlyClick={true}
        />
        <div className={s.filterInput}>
          <input type="text" defaultValue={this.filter1} placeholder="Filter..." onChange={this.input1Changed} />
        </div>
        {this.filter1 ? <div>
          <div className={s.radioContainer}>
            <div className={s.radio + ' ' + (this.state.or ? '' : s.checked)} onClick={() => this.radioClicked()}>{
              this.state.or
                ? <SvgIcon className={s.marked} path={path.mdiCheckboxBlankCircleOutline} />
                : <SvgIcon className={s.blank} path={path.mdiCheckboxMarkedCircleOutline} />
            }AND</div>
            <div className={s.radio + ' ' + (this.state.or ? s.checked : '')} onClick={() => this.radioClicked(true)}>{
              this.state.or
                ? <SvgIcon className={s.marked} path={path.mdiCheckboxMarkedCircleOutline} />
                : <SvgIcon className={s.blank} path={path.mdiCheckboxBlankCircleOutline} />
            }OR</div>
          </div>
          <DropDown
            className={s.select}
            value={this.type2}
            translate={true}
            options={this.options}
            onChange={this.type2Changed}
            onlyClick={true}
          />
          <div className={s.filterInput}>
            <input type="text" defaultValue={this.filter2} placeholder="Filter..." onChange={this.input2Changed} />
          </div>
        </div> : null}
      </div>
    )
  }

  isCheck = (v) => {
    if (!Array.isArray(this.filter1)) return true;
    return this.filter1.includes(v)
  }

  isCheckAll = () => {
    if (!Array.isArray(this.filter1)) return true;
    return false
  }

  onClick = (e, value) => {
    this.type1 = 'in';
    if (!Array.isArray(this.filter1)) {
      this.filter1 = this.checkBoxOptions.reduce((a, v) => {
        if (v.value !== value) {
          a.push(v.value)
        }
        return a;
      }, [])
    } else {
      let findIndex = this.filter1.findIndex(x => x === value)
      if (findIndex > -1) this.filter1.splice(findIndex, 1)
      else {
        this.filter1.push(value)
      }
      if (this.filter1.length === this.checkBoxOptions.length) this.filter1 = ''
    }
    this.forceUpdate();
    this.props.updateMenu && this.props.updateMenu()
    this.setFilter();
  }

  onClickAll = () => {
    this.type1 = 'in';
    if (this.filter1) this.filter1 = '';
    else {
      this.filter1 = []
    }
    this.forceUpdate();
    this.props.updateMenu && this.props.updateMenu()
    this.setFilter();
  }

  renderStaticFilter = () => {
    const options = this.props.params.colDef.optionsShow || this.props.params.colDef.options
    const isCheckAll = this.isCheckAll()
    return (
      <div className={`ag-filter ${this.props.className}`}>
        <div className="ag-cell-label-container" reactrootcontainer="">
          <div className={`lst-check-filter ${s.lstCheckFilter}`}>
            <div className={`check-filter-header check-filter-item showTitle ${isCheckAll ? 'checked' : (this.filter1.length ? 'checkItem' : '')}`} onClick={this.onClickAll}>All</div>
            {
              options.map(v => {
                const value = v.value
                const isCheck = this.isCheck(value)
                return (
                  <div className={`check-filter-item showTitle ${isCheck ? 'checked' : ''}`}
                    onClick={e => this.onClick(e, value)}
                    key={`check-filter-item_${v.labelFixed || v.label}`}
                    val={v.labelFixed || v.label}>
                    <span className="text-overflow"><Lang>{v.labelFixed || v.label}</Lang></span>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    )
  }

  render() {
    return this.checkBoxOptions && this.checkBoxOptions.length ? this.renderStaticFilter() : this.renderDynamicfilter()
  }
}
