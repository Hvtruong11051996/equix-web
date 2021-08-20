import React from 'react';
import Lang from '../../Lang/Lang';
import s from '../CanvasGrid.module.css';
import MenuFilter from './MenuFilter';
import MenuColumn from './MenuColumn';
import SvgIcon, { path } from '../../SvgIcon'

export default class MenuSide extends React.Component {
  constructor(props) {
    super(props);
    this.activeCol = {}
  }
  clickOutside = (e) => {
    if (!this.dom.contains(e.target)) {
      const dom = document.getElementById('dropDownContent');
      if (dom && dom.contains(e.target)) return;
      if (this.props.root._sideMenu) {
        ReactDOM.render(null, this.props.root._sideMenu);
        this.props.root._sideMenu.parentNode.removeChild(this.props.root._sideMenu);
        delete this.props.root._sideMenu;
      }
    }
  }
  componentDidMount() {
    document.addEventListener('mousedown', this.clickOutside);
  }
  componentWillUnmount() {
    document.removeEventListener('mousedown', this.clickOutside);
  }
  updateMenu = () => {
    this.forceUpdate()
  }
  render() {
    const r = this.props.root;
    return <div ref={dom => dom && (this.dom = dom)}>
      {
        this.props.name === 'column' ? <MenuColumn params={{ root: r }} grid={r.grid} />
          : <div>
            {r._colState.filter(col => r._dicColDef[col.name] && !r._dicColDef[col.name].suppressFilter).map(col => {
              if (col.filter) this.activeCol[col.name] = true;
              return <div key={col.name} >
                <div
                  onClick={(e) => {
                    if (e.target.classList.contains(s.active)) {
                      e.target.classList.remove(s.active)
                      delete this.activeCol[col.name]
                    } else {
                      e.target.classList.add(s.active)
                      this.activeCol[col.name] = true;
                    }
                  }}
                  className={s.filterTitle + ((col.filter || this.activeCol[col.name]) ? ' ' + s.active : '')}>
                  <img src='common/baseline-arrow_right-24px.svg' height='24' />
                  <Lang>{r._dicColDef[col.name].header}</Lang>
                  {
                    col.filter ? <SvgIcon path={path.mdiFilter} className={s.filterMenuIcon} />
                      : null
                  }
                </div>
                <MenuFilter updateMenu={this.updateMenu} params={{ root: r, colState: col, colDef: r._dicColDef[col.name] }} grid={r.grid} />
              </div>
            })}
          </div>
      }
    </div>
  }
}
