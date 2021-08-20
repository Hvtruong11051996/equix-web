import React from 'react';
import FilterBox from '../Inc/FilterBox/FilterBox';
import { getData, postData, getMarginAccountSummaryUrl, getReportCsvFileUrl, createNewBranch, completeApi } from '../../helper/request';
import logger from '../../helper/log';
import dataStorage from '../../dataStorage';
import { hideElement, getCsvFile, formatNumberValue, formatNumberVolume } from '../../helper/functionUtils'
import uuidv4 from 'uuid/v4';
import Grid from '../Inc/CanvasGrid/CanvasGrid';
import ToggleLine from '../Inc/ToggleLine/ToggleLine';
import MoreOption from '../Inc/MoreOption/MoreOption';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';
import { regisRealtime, unregisRealtime } from '../../helper/streamingSubscriber';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event';

const PAGESIZE = 50;

export class MarginAccountSummary extends React.Component {
    constructor(props) {
        super(props);
        addEventListener(EVENTNAME.clickToRefresh, () => this.getDataSnapshot(true))
        this.columns = []
        const initState = this.props.loadState();
        this.state = {
            valueFilter: initState.valueFilter || ''
        }
        this.collapse = initState.collapse ? 1 : 0
        this.id = uuidv4();
        this.filterAndSearch = { 'query': { 'bool': { 'must': [] } } }
    }

    collapseFunc = (collapse) => {
        this.collapse = collapse ? 1 : 0
        this.props.saveState({
            collapse: this.collapse
        })
        this.forceUpdate()
    }

    createagSideButtons = () => {
        return [
            {
                value: 'ExportCSV',
                label: 'lang_export_csv',
                callback: () => this.exportCsv()
            },
            {
                value: 'ResetFilter',
                label: 'lang_reset_filter',
                callback: () => this.resetFilter()
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

    getAllBranchAndSetColumn = () => {
        const url = createNewBranch();
        this.props.loading(true)
        this.dicBranch = {}
        this.dicBranchOpitions = []
        getData(url)
            .then(response => {
                this.props.loading(false)
                if (response.data && response.data.data && response.data.data.branch) {
                    let branchlist = response.data.data.branch
                    branchlist.forEach(branch => {
                        this.dicBranch[branch.branch_id] = branch.branch_name
                        this.dicBranchOpitions.push({ label: branch.branch_name, value: branch.branch_id })
                    })
                    this.setColumn(this.getColumns())
                }
            }).catch(error => {
                this.props.loading(false)
                this.setColumn(this.getColumns())
                logger.log('error getAllBranchAndSetColumn', error)
            })
    }

    getFilterOnSearch = async (body, notResetPage) => {
        if (!this.dicBranch) await this.getAllBranchAndSetColumn()
        if (!notResetPage) this.pageId = 1
        if (body) {
            this.filterAndSearch = body
        }
        this.getDataSnapshot();
    }

    getDataSnapshot = (refresh) => {
        if (refresh) {
            const listData = this.getData().map(obj => {
                for (var key in obj) {
                    obj[key] = '--';
                }
                return obj;
            });
            this.setData(listData)
        }
        let url = getMarginAccountSummaryUrl(this.pageId, PAGESIZE)
        const that = this
        this.props.loading(true)
        postData(url, this.filterAndSearch)
            .then(response => {
                this.props.loading(false)
                if (response.data) {
                    let data = response.data
                    this.setData(data.data || []);
                    this.pageObj = {
                        total_count: data.total_count || 0,
                        total_pages: data.total_pages || 1,
                        current_page: data.current_page || 1,
                        page_size: PAGESIZE
                    }
                    this.setPage && this.setPage(this.pageObj);
                }
            })
            .catch(error => {
                this.props.loading(false)
                this.setData([]);
                this.pageObj = {
                    total_count: 0,
                    total_pages: 1,
                    current_page: 1,
                    page_size: PAGESIZE
                }
                this.setPage && this.setPage(this.pageObj);
                logger.error(error)
            })
    }
    renderHeader() {
        return (
            <div className={`header-wrap flex ${this.collapse ? 'collapse' : ''}`}>
                <div className='navbar' style={{ justifyContent: 'flex-end' }}>
                    <div style={{ flex: 1 }} className='box-filter'>
                        <FilterBox
                            value={this.state.valueFilter}
                            onChange={(data) => this.setQuickFilter(data)}
                        />
                    </div>
                </div>
                <MoreOption agSideButtons={this.createagSideButtons()} />
            </div>
        )
    }
    realtimeData = (data) => {
        if (data.data) {
            let title = data.data.title
            if (title.includes('accountsummary#UPDATE#')) {
                let dataRealtime = JSON.parse(data.data.object_changed);
                this.addOrUpdate(dataRealtime, true)
            } else if (title.includes('accountsummary#INSERT#')) {
                let dataRealtime = JSON.parse(data.data.object_changed);
                this.addOrUpdate(dataRealtime)
            }
        }
    }

    getColumns = () => {
        let columns = this.columns = [
            {
                header: 'lang_advisor_code',
                name: 'advisor_code'
            },
            {
                header: 'lang_advisor_name',
                name: 'advisor_name'

            },
            {
                header: 'lang_account_id',
                name: 'account_id',
                align: 'right'
            },
            {
                header: 'lang_account_name',
                name: 'account_name'
            },
            {
                header: 'lang_cash_balance',
                name: 'cash_balance',
                formater: (params) => {
                    if (params.value === 0 || params.value) {
                        return formatNumberVolume(params.value, true)
                    }
                    return '--'
                },
                align: 'right',
                columnType: 'number'
            },
            {
                header: 'lang_realized_profit_loss',
                name: 'realized_pl',
                getTextColorKey: (params) => {
                    return params.value > 0 ? '--buy-light' : params.value < 0 ? '--sell-light' : '--secondary-default'
                },
                formater: (params) => {
                    if (params.value === 0 || params.value) {
                        return formatNumberVolume(params.value, true)
                    }
                    return '--'
                },
                columnType: 'number',
                align: 'right'
            },
            {
                header: 'lang_unrealised_profit_loss',
                name: 'total_profit_amount',
                getTextColorKey: (params) => {
                    return params.value > 0 ? '--buy-light' : params.value < 0 ? '--sell-light' : '--secondary-default'
                },
                formater: (params) => {
                    if (params.value === 0 || params.value) {
                        return formatNumberVolume(params.value, true)
                    }
                    return '--'
                },
                columnType: 'number',
                align: 'right'
            },
            {
                header: 'lang_m_m_reserved',
                name: 'maintenance_margin_reserved_convert',
                headerTooltip: 'Maintenance Margin Reserved',
                formater: (params) => {
                    if (params.value === 0 || params.value) {
                        return formatNumberVolume(params.value, true)
                    }
                    return '--'
                },
                columnType: 'number',
                align: 'right'
            },
            {
                header: 'lang_i_m_available',
                name: 'initial_margin_available',
                headerTooltip: 'Initial Margin Available',
                formater: (params) => {
                    if (params.value === 0 || params.value) {
                        return formatNumberVolume(params.value, true)
                    }
                    return '--'
                },
                columnType: 'number',
                align: 'right'
            },
            {
                header: 'lang_account_value',
                name: 'account_value',
                formater: (params) => {
                    if (params.value === 0 || params.value) {
                        return formatNumberVolume(params.value, true)
                    }
                    return '--'
                },
                columnType: 'number',
                align: 'right'
            },
            {
                header: 'lang_cash',
                name: 'available_balance',
                formater: (params) => {
                    if (params.value === 0 || params.value) {
                        return formatNumberVolume(params.value, true)
                    }
                    return '--'
                },
                columnType: 'number',
                align: 'right'
            },
            {
                header: 'lang_margin_ratio',
                name: 'margin_ratio',
                getTextColorKey: (params) => {
                    return params.value > 0 ? '--buy-light' : params.value < 0 ? '--sell-light' : '--secondary-default'
                },
                formater: (params) => {
                    if (params.value === 0 || params.value) {
                        let data = formatNumberValue(params.value, true)
                        return data + '%'
                    }
                    return '--'
                },
                columnType: 'number',
                align: 'right'
            },
            {
                header: 'lang_vetting_rule_group',
                name: 'account_group',
                options: this.dicBranchOpitions,
                formater: (params) => {
                    let text = this.dicBranch[params.data[params.colDef.name]] || '--'
                    return text
                }
            }
        ]
        return columns
    }

    onRowClicked = data => {
        if (data) {
            this.props.send({
                account: data
            })
        }
    }

    setGridPaginate = () => {
        return {
            setPage: cb => {
                this.setPage = cb
            },
            pageChanged: this.changePageAction
        }
    }
    changePageAction = num => {
        this.pageId = num;
        this.getFilterOnSearch(null, true);
    }

    getCsvFunction = (obj) => {
        if (this.csvWoking) return;
        this.csvWoking = true
        getCsvFile({
            url: getReportCsvFileUrl('margin-summary'),
            body_req: this.filterAndSearch,
            columnHeader: obj.columns,
            lang: dataStorage.lang,
            glContainer: this.props.glContainer
        }, () => {
            this.csvWoking = false;
        });
    }

    setGridFnKey = data => {
        if (!data) {
            logger.log(data);
        }
        return `${data.account_id}`;
    }

    componentDidMount() {
        regisRealtime({
            url: completeApi('/portfolio/operation'),
            callback: this.realtimeData
        });
    }

    componentWillUnmount() {
        try {
            removeEventListener(EVENTNAME.clickToRefresh, this.getDataSnapshot)
            unregisRealtime({
                callback: this.realtimeData
            });
        } catch (error) {
            logger.error('componentWillUnmount On UserMan' + error)
        }
    }

    render() {
        return <div className={`qe-widget root isMoreOption`}>
            {this.renderHeader()}
            <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
            <div style={{ flex: 1, overflow: 'hidden' }} className={`content`}>
                <Grid
                    {...this.props}
                    id={FORM.MARGIN_ACCOUNT_SUMMARY}
                    fn={fn => {
                        this.addOrUpdate = fn.addOrUpdate
                        this.setData = fn.setData
                        this.setColumn = fn.setColumn
                        this.getData = fn.getData
                        this.exportCsv = fn.exportCsv
                        this.autoSize = fn.autoSize
                        this.resetFilter = fn.resetFilter
                        this.setQuickFilter = fn.setQuickFilter
                        this.showColumnMenu = fn.showColumnMenu
                        this.showFilterMenu = fn.showFilterMenu
                    }}
                    getCsvFunction={this.getCsvFunction}
                    getFilterOnSearch={this.getFilterOnSearch}
                    fnKey={this.setGridFnKey}
                    paginate={this.setGridPaginate()}
                    columns={this.getColumns()}
                    onRowClicked={this.onRowClicked}
                    onlySystem={true}
                    autoFit={true}
                />
            </div>
        </div >
    }
}

export default MarginAccountSummary
