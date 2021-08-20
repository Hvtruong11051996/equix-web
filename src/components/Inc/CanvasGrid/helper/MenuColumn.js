import React from 'react';
import Lang from '../../Lang';
import dataStorage from '../../../../dataStorage';
import s from '../CanvasGrid.module.css';
import SvgIcon, { path } from '../../SvgIcon';

export default class ColumnMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      textFilter: ''
    }
  }

  handleFilter = ({ target: { value } }) => {
    this.timeoutId && clearTimeout(this.timeoutId)
    this.timeoutId = setTimeout(() => {
      this.setState({ textFilter: value ? value.toLowerCase() : '' })
    }, 800)
  }

  render() {
    let dataColumn = this.props.params.root._colState.reduce((lst, col) => {
      if (this.props.params.root._dicColDef[col.name]) {
        lst.push(col);
      }
      return lst;
    }, []).filter(e => {
      let colDef = this.props.params.root._dicColDef[e.name]
      const name = colDef.headerFixed || dataStorage.translate(colDef.header)
      return (name + '').toLowerCase().includes(this.state.textFilter)
    })
    return (
      <div>
        <div className={s.menuList}>
          <div className={s.filterInput}>
            <SvgIcon path={path.mdiMagnify} style={{ height: '24px' }} />
            <input type="text" placeholder="Filter..." onChange={this.handleFilter} />
          </div>
          {
            dataColumn.map((col, i) => {
              const colDef = this.props.params.root._dicColDef[col.name];
              return <label key={col.name} onClick={e => {
                if (!col.hide && this.props.params.root._colState.filter(col => !col.hide).length <= 1) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}>
                <div className={s.checkbox} >
                  <input type="checkbox" defaultChecked={!col.hide} style={{ display: 'none' }} onChange={e => {
                    if (e.target.checked) {
                      this.props.params.root.hideColumn(col, false);
                    } else {
                      this.props.params.root.hideColumn(col, true);
                    }
                    this.props.params && this.props.params.root && this.props.params.root.autoSizeColumn();
                  }} />
                  <SvgIcon className={s.marked} path={path.mdiCheckboxMarkedOutline} />
                  <SvgIcon className={s.blank} path={path.mdiCheckboxBlankOutline} />
                </div>
                <span style={{ textTransform: 'uppercase' }}>{colDef.headerFixed || <Lang>{colDef.header}</Lang>}</span>
              </label>
            })
          }
        </div>
      </div>
    )
  }
}
