import React from 'react';
import logger from '../../../helper/log';
import Lang from '../Lang';
import dataStorage from '../../../dataStorage';
import {
    getUpdateWatchlist,
    putData
} from '../../../helper/request';
import { registerUser, unregisterUser } from '../../../streaming';
import actionTypeEnum from '../../../constants/action_type_enum'
import { checkRole } from '../../../helper/functionUtils';
import MapRoleCommponent from '../../../constants/map_role_component';
import SvgIcon, { path } from '../SvgIcon';

class MoreOption extends React.Component {
    constructor(props) {
        super(props)
        this.mount = false
        this.show = false
    }
    renderAgSideButtons = () => {
        return this.props.agSideButtons.map((btn, index) => {
            const isDisable = btn && btn.check && btn.check(btn.label)
            if (!btn) return
            return <div className={`ag-side-button showTitle ${btn.class || ''} ${isDisable ? 'disable' : ''}`} key={index} onClick={event => {
                if (isDisable) return
                if (btn.callback && typeof btn.callback === 'function') {
                    if (btn.value === 'Favorites') {
                        if (!checkRole(MapRoleCommponent.WatchlistBottom)) return
                        this.actionWatchlist()
                        btn.callback()
                    } else if (btn.value === 'YourWatchList') {
                        if (!checkRole(MapRoleCommponent.WatchlistBottom)) return
                        this.showPandel()
                    } else if (btn.value === 'NewAlert') {
                        if (!checkRole(MapRoleCommponent.NewAlert)) return
                        btn.callback()
                    } else if (btn.value === 'NewOrder') {
                        if (!checkRole(MapRoleCommponent.NEW_ORDER)) return
                        btn.callback()
                    } else {
                        const closest = event.target.closest('.agSideButtons.ag-side-buttons')
                        btn.callback(closest)
                    }
                }
            }}>
                {this.switchButton(btn)}
            </div>
        })
    }

    actionWatchlist = (data) => {
        if (!this.props.symbolObj.symbol) return
        let dataFavourites
        if (!data) {
            const index = dataStorage.watchlist.findIndex(item => item.watchlist === 'user-watchlist')
            dataFavourites = dataStorage.watchlist[index]
        } else dataFavourites = data
        const isExistSymbol = this.isExistSymbol(dataFavourites, this.props.symbolObj)
        let obj = {
            user_id: dataStorage.userInfo.user_id,
            watchlist: dataFavourites.watchlist,
            watchlist_name: dataFavourites.watchlist_name,
            value: [{
                symbol: this.props.symbolObj.symbol,
                rank: new Date().getTime()
            }]
        }
        this.postDataSymBolWatchlist(obj, isExistSymbol ? 'remove' : 'add')
    }

    isExistSymbol(item) {
        let valueWatchlist = item.value || []
        if (valueWatchlist.length > 0) {
            for (let i = 0; i < valueWatchlist.length; i++) {
                if (valueWatchlist[i] && valueWatchlist[i].symbol === this.props.symbolObj.symbol) {
                    return true
                }
            }
        }
        return false
    }

    postDataSymBolWatchlist = (obj, action) => {
        putData(getUpdateWatchlist(obj.watchlist, obj.user_id, action), {
            data: obj
        }).then(() => {
            console.log('ADD ok')
        }).catch(error => {
        });
    }

    showPandel = () => {
        if (!this.props.symbolObj.symbol) return
        if (dataStorage.watchlist.length === 1) return
        if (!this.div) {
            this.div = document.createElement('div');
        }
        ReactDOM.render(this.renderPanel(), this.div);
        this.div.style.display = 'block';
        this.div.className = 'ag-tool-panel-wrapper';
        this.moreOption.querySelector('.ag-tool-panel').appendChild(this.div);
    }

    realtimeWatchlist = (data, action, title, updateAction) => {
        let watchlistRoot = dataStorage.watchlist
        if (action === actionTypeEnum.INSERT) {
            const index = watchlistRoot.findIndex(item => item.watchlist === data.watchlist)
            if (index < 0) watchlistRoot.push(data)
        } else if (action === actionTypeEnum.DELETE) {
            for (let i = 0; i < watchlistRoot.length; i++) {
                if (watchlistRoot[i].watchlist === data) {
                    watchlistRoot.splice(i, 1);
                    break;
                }
            }
        } else if (action === actionTypeEnum.UPDATE) {
            if (updateAction === 'add') {
                let filterWl = watchlistRoot.filter((item) => {
                    return item.watchlist === data.watchlist
                })
                if (filterWl[0].value) {
                    let indexCheck = filterWl[0].value.findIndex(x => x.symbol === data.value[0].symbol)
                    if (indexCheck === -1) filterWl[0].value.push(data.value[0])
                } else {
                    filterWl[0].value = []
                    filterWl[0].value.push(data.value[0])
                }
            } else if (updateAction === 'remove') {
                let indexFilterWl = watchlistRoot.findIndex((item) => {
                    return item.watchlist === data.watchlist
                })
                if (indexFilterWl > -1) {
                    let indexSymbol = (watchlistRoot[indexFilterWl].value || []).findIndex((item) => {
                        return item.symbol === data.value[0].symbol
                    })
                    if (indexSymbol >= 0) {
                        watchlistRoot[indexFilterWl].value.splice(indexSymbol, 1)
                    }
                }
            } else {
                let indexFilterWl = watchlistRoot.findIndex((item) => {
                    return item.watchlist === data.watchlist
                })
                Object.assign(watchlistRoot[indexFilterWl], data);
            }
        }
        dataStorage.watchlist = watchlistRoot
        if (this.div && this.div.style.display === 'block') this.showPandel()
        this.props.callback && this.props.callback()
        this.mount && this.forceUpdate()
    }

    renderPanel = () => {
        return (
            dataStorage.watchlist.length > 0 && dataStorage.watchlist.map((item, index) => {
                if (item.watchlist !== 'user-watchlist') {
                    let isExistSymbol = this.isExistSymbol(item)
                    return <div key={index} className='contextLabel watchlist non-space-between pointer' onClick={() => this.actionWatchlist(item)}>
                        <SvgIcon path={isExistSymbol ? path.mdiCheckboxMarkedOutline : path.mdiCheckboxBlankOutline} className='icon flex' />
                        <div className='expand-content'>{item.watchlist_name}</div>
                    </div>
                }
            })
        )
    }

    switchButton = (btn) => {
        const { label } = btn
        switch (btn.value) {
            case 'Favorites':
                const index = dataStorage.watchlist.findIndex(item => item.watchlist === 'user-watchlist')
                const dataFavourites = dataStorage.watchlist[index].value || []
                const isFavourites = dataFavourites.findIndex(item => item && this.props.symbolObj && this.props.symbolObj.symbol === item.symbol)
                return <div className={!checkRole(MapRoleCommponent.WatchlistBottom) ? 'disabled' : ''}>
                    <SvgIcon path={path.mdiStar} fill={isFavourites > -1 ? 'var(--semantic-warning)' : 'var(--secondary-dark)'} />
                    <div className={`hiddenTooltip ${btn.className || 'text-capitalize'}`}><Lang>{label}</Lang></div>
                </div>;
            case 'YourWatchList':
                return <div className={`${dataStorage.watchlist.length === 1 || !checkRole(MapRoleCommponent.WatchlistBottom) ? 'disabled' : ''}`}>
                    <SvgIcon path={path.mdiPlusCircle} />
                    <div className={`hiddenTooltip  ${btn.className || 'text-capitalize'}`}><Lang>{label}</Lang></div>
                </div>;
            case 'NewAlert':
                return <div className={`${!checkRole(MapRoleCommponent.NewAlert) ? 'disabled' : ''}`}>
                    <SvgIcon path={path.mdiBellPlus} />
                    <div className={`hiddenTooltip ${btn.className || 'text-capitalize'}`}><Lang>{label}</Lang></div>
                </div>;
            case 'NewOrder':
                return <div className={`${!checkRole(MapRoleCommponent.NEW_ORDER) ? 'disabled' : ''}`}>
                    <SvgIcon path={path.mdiCartPlus} />
                    <div className={`hiddenTooltip ${btn.className || 'text-capitalize'}`}><Lang>{label}</Lang></div>
                </div>;
            case 'ExportCSV':
                return <div className='download'>
                    <SvgIcon path={path.csv} />
                    <div className={`hiddenTooltip ${btn.className || 'text-normal'}`}><Lang>{label}</Lang></div>
                </div>;
            case 'ResetFilter':
                return <div>
                    <SvgIcon path={path.mdiFilterRemove} />
                    <div className={`hiddenTooltip ${btn.className || 'text-capitalize'}`}><Lang>{label}</Lang></div>
                </div>;
            case 'Resize':
                return <div>
                    <SvgIcon path={path.mdiCursorMove} />
                    <div className={`hiddenTooltip ${btn.className || 'text-capitalize'}`}><Lang>{label}</Lang></div>
                </div>;
            case 'Columns':
                return <div>
                    <SvgIcon path={path.mdiViewColumn} />
                    <div className={`hiddenTooltip ${btn.className || 'text-capitalize'}`}><Lang>{label}</Lang></div>
                </div>;
            case 'Filters':
                return <div>
                    <SvgIcon path={path.mdiFilter} />
                    <div className={`hiddenTooltip ${btn.className || 'text-capitalize'}`}><Lang>{label}</Lang></div>
                </div>;
            case 'ExportExcel':
                return <div>
                    <SvgIcon path={path.xlsx} />
                    <div className={`hiddenTooltip ${btn.className || 'text-capitalize'}`}><Lang>{label}</Lang></div>
                </div>;
            case 'Print':
                return <div>
                    <SvgIcon path={path.mdiPrinter} />
                    <div className={`hiddenTooltip ${btn.className || 'text-capitalize'}`}><Lang>{label}</Lang></div>
                </div>;
            case 'Download':
                return <div>
                    <SvgIcon path={path.mdiDownload} />
                    <div className={`hiddenTooltip ${btn.className || 'text-capitalize'}`}><Lang>{label}</Lang></div>
                </div>;
            case 'marketHorizontal':
                return (
                    <div>
                        <SvgIcon path={path.marketHorizontal} style={{ width: '16px' }} fill={btn.state ? 'var(--color-highlight)' : 'var(--secondary-default)'} />
                        <div className={`hiddenTooltip ${btn.className || 'text-capitalize'}`}><Lang>{label}</Lang></div>
                    </div>
                );
            case 'marketCumulative':
                return (
                    <div>
                        <SvgIcon path={path.marketCumulative} style={{ width: '16px' }} fill={btn.state ? 'var(--color-highlight)' : 'var(--secondary-default)'} />
                        <div className={`hiddenTooltip ${btn.className || 'text-capitalize'}`}><Lang>{label}</Lang></div>
                    </div>
                );
            default:
                return null
        }
    }

    showOption = () => {
        this.show = true
        document.onmousemove = this.isDisplayOption
        document.addEventListener('mousedown', this.clickOutSide);
        this.mount && this.forceUpdate()
    }

    isDisplayOption = (e) => {
        if (!e.target) return
        this.timeOut && clearTimeout(this.timeOut)
        this.timeOut = setTimeout(() => {
            if (e.target.closest && !e.target.closest('.DropDownOrder') && !e.target.closest('.input-date-gr') && !e.target.closest('.list') && !e.target.closest('.iconMoreOption') &&
                !e.target.closest('.react-datepicker') && !e.target.closest('.collapseOption') && !e.target.closest('.ag-tool-panel-wrapper') && !e.target.closest('.ag-tool-panel') && !this.fixShow) {
                this.show = false
                document.onmousemove = null
                this.fixShow = false
                this.div && (this.div.style.display = 'none')
                this.mount && this.forceUpdate()
            }
        }, 300);
    }

    clickOutSide = (e) => {
        if (!e.target) return
        if (e.target.closest && (e.target.closest('.DropDownOrder') || e.target.closest('.menuSideCanvas') || e.target.closest('.input-date-gr') || e.target.closest('.list') || e.target.closest('.iconMoreOption') ||
            e.target.closest('.react-datepicker') || e.target.closest('.collapseOption') || e.target.closest('.ag-tool-panel-wrapper') || e.target.closest('.isMoreOptionList') || e.target.closest('.ag-tool-panel'))) {
            document.onmousemove = null
            this.fixShow = true
        } else {
            this.show = false
            this.fixShow = false
            this.div && (this.div.style.display = 'none')
            document.removeEventListener('mousedown', this.clickOutSide);
            this.mount && this.forceUpdate()
        }
    }

    componentDidMount() {
        this.mount = true
        dataStorage.userInfo && dataStorage.userInfo.user_id && registerUser(dataStorage.userInfo.user_id, this.realtimeWatchlist, 'user_watchlist')
    }

    componentWillUnmount() {
        this.mount = false
        document.removeEventListener('mousedown', this.clickOutSide);
        dataStorage.userInfo && dataStorage.userInfo.user_id && unregisterUser(dataStorage.userInfo.user_id, this.realtimeWatchlist, 'user_watchlist')
    }

    render() {
        try {
            return (
                <div className={`moreOption`} ref={dom => this.moreOption = dom} >
                    <span className='iconMoreOption pointer' onMouseEnter={() => this.showOption()}>
                        <SvgIcon path={path.mdiDotsVertical} />
                    </span>
                    <div className={`collapseOption ${this.show ? '' : 'hidden'}`} style={{ width: this.props.lstItems ? '258px' : 'auto', position: 'absolute' }}>
                        {
                            this.props.lstItems
                                ? <div className='optionContainer'>
                                    {
                                        this.props.lstItems.map((item, index) => {
                                            if (item.component) {
                                                return <div className={`rowItem ${item.class || ''}`} key={index}>{item.component}</div>
                                            }
                                        })
                                    }
                                </div>
                                : null
                        }
                        <div className='agSideButtons ag-side-buttons flex'>
                            {this.renderAgSideButtons()}
                            <div className='ag-tool-panel'></div>
                        </div>
                    </div>
                </div >
            )
        } catch (error) {
            logger.error('MoreOption: ' + error)
            return null;
        }
    }
}
export default MoreOption;
