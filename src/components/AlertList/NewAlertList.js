import React from 'react';
import FilterBox from '../Inc/FilterBox/FilterBox';
import { getData, deleteData, makeSymbolUrl, getUrlAlert } from '../../helper/request';
import dataStorage from '../../dataStorage';
import Grid from '../Inc/CanvasGrid';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant'
import { registerUser, unregisterUser } from '../../streaming';
import { formatNumberVolume, formatNumberPrice, formatNumberValue, checkRole, formatCompanyName } from '../../helper/functionUtils';
import MapRoleComponent from '../../constants/map_role_component'
import logger from '../../helper/log';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event';
import ToggleLine from '../Inc/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import s from './AlertList.module.css'
import SvgIcon, { path } from '../Inc/SvgIcon'
import Button, { buttonType } from '../Elements/Button'
import Confirm from '../Inc/Confirm/Confirm';

const FIELD = {
    CODE: 'display_name',
    SECURITY: 'company_name',
    DESCRIPTION: 'alert_repeat',
    STATUS: 'status'
}

export class AlertList extends React.Component {
    constructor(props) {
        super(props);
        const initState = this.props.loadState();
        this.user_id = dataStorage.userInfo.user_id
        this.filterText = initState.valueFilter || '';
        this.collapse = +initState.collapse
        this.data = []
        this.isConnected = dataStorage.connected
        props.resize((w, h) => {
            this.fitAllColumns && this.fitAllColumns()
        })
        this.removeSymbolRow = this.removeSymbolRow.bind(this)
    }

    changeConnection = (isConnected) => {
        if (isConnected !== this.isConnected) {
            this.isConnected = isConnected
            isConnected && this.getDataAlertList()
        }
    }

    getColums = () => {
        let columns = [
            {
                header: 'lang_code',
                name: FIELD.CODE,
                type: TYPE.SYMBOL,
                formater: (params) => {
                    return params.data.display_name || params.data.symbol;
                }
            },
            {
                header: 'lang_security',
                name: FIELD.SECURITY,
                formater: (params) => {
                    return formatCompanyName(params.data)
                }
            },
            {
                header: 'lang_alert_description',
                name: FIELD.DESCRIPTION
            }
        ]
        if (checkRole(MapRoleComponent.REMOVE_BUTTON_ALERT)) {
            columns.push({
                header: 'lang_active',
                name: FIELD.STATUS,
                type: TYPE.SWITCH
            })
        }
        columns.push({
            header: 'lang_action',
            name: 'action',
            float: true,
            type: TYPE.ALERT_ACTIONS,
            removeCallback: this.removeSymbolRow
        })
        return columns
    }

    removeSymbolRow(data, id) {
        Confirm({
            checkWindowLoggedOut: true,
            header: 'lang_confirm_cancel_alert',
            message: 'lang_ask_confirm_delete_alert',
            callback: () => {
                this.createRequestDelete(data, id)
            },
            cancelCallback: () => { }
        })
    }

    createRequestDelete = (data, id) => {
        if (!this.isConnected) return
        const url = getUrlAlert('/' + data.alert_id)
        deleteData(url).then(res => {
            const switchBtn = document.getElementById(id);
            if (switchBtn) switchBtn.parentNode.removeChild(switchBtn);
            logger.log('delete success')
        }).catch(e => {
            logger.log('error: ', e)
        })
    }

    refreshData = () => {
        this.getDataAlertList()
    }

    getDescription(data) {
        let str = ''
        if (data.alert_type === 'NEWS') {
            str += `${dataStorage.translate('lang_' + data.alert_trigger.toLowerCase()).toCapitalize()}, ${dataStorage.translate('lang_' + data.alert_repeat.toLowerCase()).toCapitalize()}`
        } else {
            let target
            if (data.alert_type === 'TODAY_VOLUME') {
                target = formatNumberVolume(data.target, true)
                str += `${dataStorage.translate(data.alert_type.toBackEndTransKey())} ${dataStorage.translate(data.alert_trigger.toBackEndTransKey())} ${target}`
            } else if (data.alert_type === 'CHANGE_PERCENT') {
                target = formatNumberValue(data.target, true) + ' %'
                str += `${dataStorage.translate(data.alert_type.toBackEndTransKey())} ${dataStorage.translate(data.alert_trigger.toBackEndTransKey())} ${target}`
            } else if (data.alert_type === 'CHANGE_POINT') {
                target = formatNumberValue(data.target, true)
                str += `${dataStorage.translate(data.alert_type.toBackEndTransKey())} ${dataStorage.translate(data.alert_trigger.toBackEndTransKey())} ${target}`
            } else if (typeof data.target === 'number') {
                target = formatNumberPrice(data.target, true)
                str += `${dataStorage.translate(data.alert_type.toBackEndTransKey())} ${dataStorage.translate(data.alert_trigger.toBackEndTransKey())} ${target}`
            } else {
                str += `${dataStorage.translate(data.alert_type.toBackEndTransKey())} ${dataStorage.translate(data.alert_trigger.toBackEndTransKey())} ${dataStorage.translate(data.target.toBackEndTransKey())}`
            }
        }
        return str;
    }

    getDataAlertList = () => {
        const url = getUrlAlert('?user_id=' + this.user_id)
        this.props.loading(true)
        getData(url)
            .then(async response => {
                this.props.loading(false)
                if (response.error) return
                const data = response.data || [];
                if (data.length > 0) {
                    const stringQuery = data.map(e => !dataStorage.symbolsObjDic[e.symbol] && encodeURIComponent(e.symbol)).filter(e => e).join(',')
                    stringQuery && await this.getSymbolInfo(stringQuery)
                    for (let i = 0; i < data.length; i++) {
                        const symbol = data[i].symbol
                        const symbolInfo = dataStorage.symbolsObjDic[symbol] || {}
                        data[i].company_name = symbolInfo.company_name || symbolInfo.security_name || ''
                        data[i].country = symbolInfo.country || ''
                        data[i][FIELD.DESCRIPTION] = this.getDescription(data[i])
                    }
                }
                this.setData(data)
            })
            .catch(error => {
                this.props.loading(false)
                this.setData([])
            })
    }

    getSymbolInfo = async (path) => {
        const urlMarketInfo = makeSymbolUrl(path);
        await getData(urlMarketInfo).then(res => {
            res = res.data;
            for (let index = 0; index < res.length; index++) {
                dataStorage.symbolsObjDic[res[index].symbol] = res[index]
            }
        }).catch(error => {
            logger.sendLog('error getCompanyName AlertList', error);
        })
    }

    realtimeData = async (data, action) => {
        if (data && data.alert_id) {
            if (action === 'DELETE') this.remove(data)
            else if (['UPDATE', 'INSERT'].includes(action)) {
                if (data.symbol) {
                    const symbolInfo = dataStorage.symbolsObjDic[data.symbol] || {}
                    data.company_name = symbolInfo.company_name || symbolInfo.security_name || ''
                    data.country = symbolInfo.country || ''
                }
                let dataGrid = this.getData();
                let dataUpdate = dataGrid.find(x => x.alert_id === data.alert_id) || {}
                if (!dataUpdate) {
                    dataUpdate = {}
                    const symbolInfo = dataStorage.symbolsObjDic[data.symbol] || {}
                    data.company_name = symbolInfo.company_name || symbolInfo.security_name || ''
                    data.country = symbolInfo.country || ''
                    data[FIELD.DESCRIPTION] = this.getDescription(data)
                }
                Object.assign(dataUpdate, data)
                dataUpdate[FIELD.DESCRIPTION] = this.getDescription(dataUpdate)
                this.addOrUpdate(dataUpdate)
            }
        }
    }

    componentDidMount() {
        addEventListener(EVENTNAME.clickToRefresh, this.refreshData);
        addEventListener(EVENTNAME.connectionChanged, this.changeConnection);
        registerUser(this.user_id, this.realtimeData, 'ALERT');
        this.getDataAlertList()
    }

    componentWillUnmount() {
        try {
            removeEventListener(EVENTNAME.clickToRefresh, this.refreshData);
            removeEventListener(EVENTNAME.connectionChanged, this.changeConnection);
            unregisterUser(this.user_id, this.realtimeData, 'ALERT');
        } catch (error) {
            logger.error('componentWillUnmount On AlertList' + error)
        }
    }

    createagSideButtons = () => {
        return [
            {
                value: 'ExportCSV',
                label: 'lang_export_csv',
                callback: () => this.exportCSV()
            },
            {
                value: 'ResetFilter',
                label: 'lang_reset_filter',
                callback: () => this.resetFilter(true)
            },
            {
                value: 'Resize',
                label: 'lang_resize',
                callback: () => this.autoSize()
            },
            {
                value: 'Columns',
                label: 'lang_columns',
                callback: (boundRef) => this.showColumnMenu(boundRef)
            },
            {
                value: 'Filters',
                label: 'lang_filters',
                callback: (boundRef) => this.showFilterMenu(boundRef)
            }
        ]
    }

    onRowClicked(data) {
        const symbolObj = data.symbol && dataStorage.symbolsObjDic[data.symbol]
        dataStorage.goldenLayout.addComponentToStack('NewAlert', { alert_id: data.alert_id, data, isModifyAlert: true, symbolObj })
    }

    collapseFunc = (collapse) => {
        this.props.saveState({ collapse: +collapse })
        this.dom && this.dom.classList.toggle(s.collapse)
    }

    onAddAlert = () => {
        if (!checkRole(MapRoleComponent.NewAlert)) return
        dataStorage.goldenLayout.addComponentToStack('NewAlert', {
            data: {
                symbolObj: {
                    isRightClick: false
                }
            },
            color: 5
        })
    }

    renderLeft = () => {
        return <Button className={s.btn} type={buttonType.info} onClick={() => this.onAddAlert()}>
            <SvgIcon path={path.mdiBellPlus} className={s.icon} />
            {/* <div className={s.textBtn + ' ' + 'showTitle'}><Lang>lang_add_alert</Lang></div> */}
        </Button>
    }

    renderQuickFilter() {
        return (
            <FilterBox
                className={s.quickFilter}
                onChange={(e) => {
                    this.setQuickFilter(e)
                }} value={this.filterText} />
        )
    }

    renderHeader = () => {
        return (
            <React.Fragment>
                <div className={`header-wrap isMoreOption flex ${this.collapse ? 'collapse' : ''}`}>
                    <div className='navbar more'>
                        {this.renderLeft()}
                        {this.renderQuickFilter()}
                    </div>
                    <MoreOption agSideButtons={this.createagSideButtons()} />
                </div>
                <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
            </React.Fragment>
        )
    }

    renderContent() {
        return <Grid
            {...this.props}
            id={FORM.ALERTS}
            autoFit={true}
            fn={fn => {
                this.addDetail = fn.addDetail
                this.addOrUpdate = fn.addOrUpdate
                this.setData = fn.setData
                this.setBottomRow = fn.setBottomRow
                this.getData = fn.getData
                this.remove = fn.remove
                this.setColumn = fn.setColumn
                this.autoSize = fn.autoSize
                this.exportCSV = fn.exportCsv
                this.resetFilter = fn.resetFilter
                this.setQuickFilter = fn.setQuickFilter
                this.showColumnMenu = fn.showColumnMenu
                this.showFilterMenu = fn.showFilterMenu
            }}
            onRowClicked={this.onRowClicked.bind(this)}
            fnKey={data => data.alert_id}
            columns={this.getColums()}
        />
    }

    render() {
        return (
            <div className='qe-widget'>
                {this.renderHeader()}
                {this.renderContent()}
            </div>
        )
    }
}

export default AlertList;
