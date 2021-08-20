import { Component } from 'react';
import MenuColumn from './MenuColumn';
import MenuFilter from './MenuFilter';
import s from '../CanvasGrid.module.css';
import dataStorage from '../../../../dataStorage';
import NoTag from '../../NoTag/NoTag';
import SvgIcon, { path } from '../../SvgIcon';
import { isStreaming } from '../../../../helper/functionUtils'
import { TYPE } from '../Constant/gridConstant'
import Lang from '../../Lang'

export default class MenuHeader extends Component {
    constructor(props) {
        super(props);
        props.params.root._menuPosition = props.params.position;
    }
    pinColumn = () => {
        this.props.params.root.pinColumn(this.props.params.colState);
        document.dispatchEvent(new Event('mousedown'));
    }
    setGroup = () => {
        if (this.props.params.colState.hasOwnProperty('groupIndex')) this.props.params.root.clearGroup(this.props.params.colState);
        else this.props.params.root.setGroup(this.props.params.colState);
        document.dispatchEvent(new Event('mousedown'));
    }
    clearGroup = () => {
        this.props.params.root.clearGroup();
        document.dispatchEvent(new Event('mousedown'));
    }
    autoSizeColumn = (schema) => {
        this.props.params.root.autoSizeColumn(schema);
        document.dispatchEvent(new Event('mousedown'));
    }
    resetColumn = () => {
        this.props.params.root.resetColumn();
        document.dispatchEvent(new Event('mousedown'));
    }
    clickOutside = (e) => {
        if (!this.dom.contains(e.target)) {
            const dom = document.getElementById('dropDownContent');
            if (dom && dom.contains(e.target)) return;
            const div = document.getElementById('grid-menu-header');
            if (div) ReactDOM.render(null, div);
        }
    }
    tabClicked = (e) => {
        let index = -1;
        const dom = e.target.closest('.' + s.menuHeaderTab);
        dom.parentNode.childNodes.forEach((v, i) => {
            if (v === dom) {
                index = i;
                v.classList.add(s.selected)
            } else v.classList.remove(s.selected)
        })
        this.dom.querySelectorAll('.' + s.menuHeaderBody + ' > *').forEach((v, i) => {
            if (i === index) v.classList.add(s.selected);
            else v.classList.remove(s.selected);
        })
    }
    componentDidMount() {
        document.addEventListener('mousedown', this.clickOutside);
    }
    componentWillUnmount() {
        this.props.params.root._menuPosition = null;
        document.removeEventListener('mousedown', this.clickOutside);
    }
    render() {
        const colDef = this.props.params.root._dicColDef[this.props.params.name];
        const ignoreGroup = isStreaming() && colDef.type && [TYPE.FLASH_NO_BG, TYPE.FLASH].includes(colDef.type)
        let pinLang = this.props.params.colState.pinned ? 'lang_unpin_column' : 'lang_pin_column';
        let groupLang = this.props.params.colState.hasOwnProperty('groupIndex') ? 'lang_ungroup_by_column' : 'lang_group_by_column'
        const hasGroup = this.props.params.root._colState.filter(x => x.hasOwnProperty('groupIndex')).length;
        return (
            <div className={s.menuHeader} ref={dom => dom && (this.dom = dom)}>
                <div className={s.menuHeaderChild}>
                    <div className={s.menuHeaderTabContainer}>
                        <span className={s.menuHeaderTab + ' ' + s.selected} onClick={this.tabClicked}>
                            <SvgIcon path={path.mdiMenu} />
                        </span>
                        {
                            colDef.suppressFilter ? null
                                : <span className={s.menuHeaderTab} onClick={this.tabClicked} >
                                    <SvgIcon path={path.mdiFilter} />
                                </span>
                        }
                        <span className={s.menuHeaderTab} onClick={this.tabClicked}>
                            <SvgIcon path={path.mdiFormatColumns} />
                        </span>
                    </div>
                    <div ref={dom => this.tabMenuBody = dom} className={s.menuHeaderBody}>
                        <div className={s.menuList + ' ' + s.selected}>
                            <div onClick={() => {
                                this.pinColumn();
                            }}>
                                <span className={s.blankCell} unselectable='on'><SvgIcon path={path.mdiPin} /></span>
                                <span className='text-capitalize'><Lang>{pinLang}</Lang></span>
                            </div>
                            <div className={s.separator}></div>
                            <div onClick={() => {
                                this.autoSizeColumn(this.props.params.name);
                            }}>
                                <span className={s.blankCell} unselectable='on'></span>
                                <span className='text-capitalize'><Lang>lang_autosize_this_column</Lang></span>
                            </div>
                            <div onClick={() => {
                                this.autoSizeColumn();
                            }}>
                                <span className={s.blankCell} unselectable='on'></span>
                                <span className='text-capitalize'><Lang>lang_autosize_all_column</Lang></span>
                            </div>
                            <div className={s.separator}></div>
                            {!colDef.suppressGroup
                                ? <NoTag>
                                    {!ignoreGroup && this.props.params.root._colState.filter(x => !x.hasOwnProperty('groupIndex')).length
                                        ? <div onClick={() => {
                                            this.setGroup();
                                        }} >
                                            <span className={s.blankCell} unselectable='on'><SvgIcon path={path.mdiSourceBranch} /></span>
                                            <span><Lang>{groupLang}</Lang>&nbsp;{dataStorage.translate(colDef.header).toUpperCase()}</span>
                                        </div> : null
                                    }
                                    <div className={s.separator}></div>
                                    {
                                        !ignoreGroup && hasGroup ? <div onClick={() => {
                                            this.props.params.root.setExpandAll();
                                            document.dispatchEvent(new Event('mousedown'));
                                        }}>
                                            <span className={s.blankCell} unselectable='on'></span>
                                            <span className='text-capitalize'><Lang>lang_expand_all</Lang></span>
                                        </div>
                                            : null
                                    }
                                    {
                                        !ignoreGroup && hasGroup ? <div onClick={() => {
                                            this.props.params.root.setCollapseAll();
                                            document.dispatchEvent(new Event('mousedown'));
                                        }}>
                                            <span className={s.blankCell} unselectable='on'></span>
                                            <span className='text-capitalize'><Lang>lang_collapse_all</Lang></span>
                                        </div>
                                            : null
                                    }
                                </NoTag>
                                : null
                            }
                            <div onClick={() => {
                                this.resetColumn();
                            }}>
                                <span className={s.blankCell} unselectable='on'></span>
                                <span className='text-capitalize'><Lang>lang_reset_column</Lang></span>
                            </div>
                        </div>
                        {
                            colDef.suppressFilter ? null
                                : <MenuFilter params={this.props.params} onColumn={this.props.onColumn} grid={this.props.grid} />
                        }
                        <MenuColumn autoSizeColumn={this.autoSizeColumn} params={this.props.params} onColumn={this.props.onColumn} grid={this.props.grid} />
                    </div>
                </div>
            </div>

        )
    }
}
