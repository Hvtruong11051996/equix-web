import React from 'react';
import Grid from '../Inc/Grid/Grid';
import {
    checkRole,
    parseJSON,
    clone
} from '../../helper/functionUtils';
import { postData, getData } from '../../helper/request';
import { registerBranch, unregisterBranch } from '../../streaming';
import MapRoleComponent from '../../constants/map_role_component';
import DatePicker, { getStartTime, getEndTime, convertTimeToGMTString } from '../Inc/DatePicker/DatePicker';
import moment, { } from 'moment';
import ExampleCustomInput from '../Inc/ExampleCustomInput/ExampleCustomInput';
import DropDown from '../DropDown/DropDown';
import optionsDrop from '../../constants/options_drop_down';
import dataStorage from '../../dataStorage';
import s from './ProcessEod.module.css'
import showConfirm from '../Inc/Confirm';
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'
const PAGE_SIZE = 50;
const PAGINATION_DEFAULT = {
    current_page: 1,
    total_count: 0,
    total_pages: 0,
    page_size: PAGE_SIZE
}
class ProcessEod extends React.Component {
    constructor(props) {
        super(props);
        const initState = this.props.loadState();
        this.state = {
            minDate: initState.minDate || getStartTime(moment().subtract(6, 'days'), 'Asia/Ho_Chi_Minh').tz('GMT'),
            maxDate: initState.maxDate || getEndTime(moment(), 'Asia/Ho_Chi_Minh').tz('GMT'),
            minDateDd: initState.minDateDd || getStartTime(moment().subtract(6, 'days'), 'Asia/Ho_Chi_Minh'),
            maxDateDd: initState.maxDateDd || getEndTime(moment(), 'Asia/Ho_Chi_Minh'),
            defaultOption: 'Week',
            connected: true
        }
        this.page_id = 1;
        this.objPage = clone(PAGINATION_DEFAULT);
        this.date = this.getProcessTime();
        props.resize(() => {
            this.opt && this.opt.fitAll();
        });
        this.columns = [
            {
                headerName: 'lang_end_of_day_process_time',
                field: 'eod_time',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    let div = document.createElement('div');
                    div.className = 'showTitle';
                    div.innerText = moment(params.data[params.colDef.field]).tz('Asia/Ho_Chi_Minh').format('DD/MM/YY-HH:mm:ss')
                    return div;
                }

            },
            {
                headerName: 'lang_end_of_day_request',
                field: 'eod_status',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    let div = document.createElement('div');
                    let inner = document.createElement('span');
                    div.appendChild(inner)
                    inner.innerText = params.data[params.colDef.field];
                    inner.className = s.requestCell;
                    div.className = 'showTitle'
                    if (params.data[params.colDef.field] === 'SENT') inner.classList.add(s.sent)
                    else inner.classList.add(s.reject)
                    return div;
                }
            },
            {
                headerName: 'ACTOR',
                field: 'actor',
                sortable: false,
                cellRenderer: (params) => {
                    let div = document.createElement('div');
                    div.className = 'showTitle';
                    div.innerText = params.data[params.colDef.field];
                    return div;
                }
            },
            {
                headerName: 'NAME',
                field: 'name',
                enableRowGroup: false,
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    let div = document.createElement('div');
                    div.className = 'showTitle';
                    div.innerText = params.data[params.colDef.field];
                    return div;
                }
            },
            {
                headerName: 'DESCRIPTION',
                field: 'description',
                menuTabs: ['generalMenuTab', 'columnsMenuTab'],
                cellRenderer: (params) => {
                    let div = document.createElement('div');
                    div.className = 'showTitle';
                    div.innerText = params.data[params.colDef.field];
                    return div;
                }
            }
        ]
    }
    pageChanged(pageId) {
        if (this.page_id === pageId) return;
        this.page_id = pageId;
        this.getGridData();
    }
    getGridData() {
        let fromDate = convertTimeToGMTString(this.state.minDate);
        let toDate = convertTimeToGMTString(this.state.maxDate);
        let url = `${dataStorage.href}/business-log/inquery?page_id=${this.page_id}&page_size=50&filter=eod_process&from=${fromDate}&to=${toDate}`;
        this.props.loading(true);
        getData(url)
            .then((res) => {
                this.props.loading(false);
                let data = res.data
                if (typeof data === 'string') data = parseJSON(data)
                this.objPage.current_page = data.current_page ? data.current_page : 1;
                this.objPage.total_count = data.total_count;
                this.objPage.total_pages = data.total_pages;
                this.objPage.page_size = PAGE_SIZE;
                this.setPage(this.objPage);
                if (data.data && data.data.length) {
                    let dataGrid = data.data.map(item => parseJSON(item.action_details))
                    this.setData(dataGrid)
                } else {
                    this.setData([])
                }
            })
            .catch((e) => {
                this.objPage = clone(PAGINATION_DEFAULT)
                this.props.loading(false)
                this.setPage(this.objPage)
                this.setData([]);
                console.error(e)
            })
    }

    realTimeData = (e) => {
        if (e.action_details) {
            let time = moment(e.action_details.eod_time).tz('Asia/Ho_Chi_Minh');
            let timeBtwCheck = time.isBetween(this.state.minDateDd, this.state.maxDateDd)
            if (timeBtwCheck) {
                this.addOrUpdate([e.action_details])
                this.objPage.total_count++;
                this.objPage.total_pages = Math.ceil(this.objPage.total_count / this.objPage.page_size);
                this.setPage(this.objPage);
            }
        }
    }

    componentDidMount() {
        this.getGridData();
        addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
        if (dataStorage.userInfo) {
            registerBranch(dataStorage.userInfo.user_id, this.realTimeData, 'PROCESS_EOD');
        }
    }
    componentWillUnmount() {
        removeEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
        if (dataStorage.userInfo) {
            unregisterBranch(dataStorage.userInfo.user_id, this.realTimeData, 'PROCESS_EOD');
        }
    }
    connectionChanged = (connect) => {
        this.setState({
            connected: connect
        })
    }

    getProcessTime = () => {
        let date = moment().tz('Asia/Ho_Chi_Minh');
        let hour = date.hour();
        let minutes = date.minutes();
        if (hour > 6 || (hour === 6 && minutes >= 30)) {
            date = date.subtract(1, 'days')
        } else {
            date = date.subtract(2, 'days')
        }
        let day = date.isoWeekday();
        if (day === 6) date = date.subtract(1, 'days')
        else if (day === 7) date = date.subtract(2, 'days')
        return date.format('DD/MM/YYYY');
    }
    onSelectDropDown = (e) => {
        switch (e) {
            case 'Day':
                let minDate = getStartTime(moment(), 'Asia/Ho_Chi_Minh').tz('GMT');
                let maxDate = getEndTime(moment(), 'Asia/Ho_Chi_Minh').tz('GMT');
                let maxDateDd = getEndTime(moment(), 'Asia/Ho_Chi_Minh');
                let minDateDd = getStartTime(moment(), 'Asia/Ho_Chi_Minh');
                this.props.saveState({
                    defaultOption: 'Day',
                    minDate,
                    maxDate,
                    maxDateDd,
                    minDateDd
                })
                this.setState({
                    defaultOption: 'Day',
                    minDate,
                    maxDate,
                    minDateDd,
                    maxDateDd
                }, () => {
                    this.getGridData()
                })
                break;
            case 'Week':
                maxDate = getEndTime(moment(), 'Asia/Ho_Chi_Minh').tz('GMT');
                minDate = getStartTime(moment().subtract(6, 'days'), 'Asia/Ho_Chi_Minh').tz('GMT');
                maxDateDd = getEndTime(moment(), 'Asia/Ho_Chi_Minh');
                minDateDd = getStartTime(moment().subtract(6, 'days'), 'Asia/Ho_Chi_Minh');
                this.props.saveState({
                    defaultOption: 'Week',
                    maxDate,
                    minDate,
                    minDateDd,
                    maxDateDd
                })
                this.setState({
                    defaultOption: 'Week',
                    maxDate,
                    minDate,
                    minDateDd,
                    maxDateDd
                }, () => {
                    this.getGridData()
                })
                break;
            case 'Month':
                maxDate = getEndTime(moment(), 'Asia/Ho_Chi_Minh').tz('GMT');
                minDate = getStartTime(moment().subtract(29, 'days'), 'Asia/Ho_Chi_Minh').tz('GMT');
                maxDateDd = getEndTime(moment(), 'Asia/Ho_Chi_Minh');
                minDateDd = getStartTime(moment().subtract(29, 'days'), 'Asia/Ho_Chi_Minh')
                this.props.saveState({
                    defaultOption: 'Month',
                    maxDate,
                    minDate,
                    maxDateDd,
                    minDateDd
                })
                this.setState({
                    defaultOption: 'Month',
                    maxDate,
                    minDate,
                    minDateDd,
                    maxDateDd
                }, () => {
                    this.getGridData()
                })
                break;
            case 'Quarter':
                maxDate = getEndTime(moment(), 'Asia/Ho_Chi_Minh').tz('GMT');
                minDate = getStartTime(moment().subtract(89, 'days'), 'Asia/Ho_Chi_Minh').tz('GMT');
                maxDateDd = getEndTime(moment(), 'Asia/Ho_Chi_Minh');
                minDateDd = getStartTime(moment().subtract(89, 'days'), 'Asia/Ho_Chi_Minh');
                this.props.saveState({
                    defaultOption: 'Quarter',
                    maxDate,
                    minDate,
                    maxDateDd,
                    minDateDd
                })
                this.setState({
                    defaultOption: 'Quarter',
                    maxDate,
                    minDate,
                    maxDateDd,
                    minDateDd
                }, () => {
                    this.getGridData()
                })
                break;
            case 'Year':
                maxDate = getEndTime(moment(), 'Asia/Ho_Chi_Minh').tz('GMT');
                minDate = getStartTime(moment().subtract(364, 'days'), 'Asia/Ho_Chi_Minh').tz('GMT');
                maxDateDd = getEndTime(moment().tz('Asia/Ho_Chi_Minh'))
                minDateDd = getStartTime(moment().subtract(364, 'days'), 'Asia/Ho_Chi_Minh')
                this.props.saveState({
                    defaultOption: 'Year',
                    maxDate,
                    minDate,
                    maxDateDd,
                    minDateDd
                })
                this.setState({
                    defaultOption: 'Year',
                    maxDate,
                    minDate,
                    minDateDd,
                    maxDateDd
                }, () => {
                    this.getGridData()
                })
                break;
            case 'Custom':
                this.setState({
                    defaultOption: 'Custom'
                }, () => {
                    this.getGridData()
                })
                break;
            default:
                break;
        }
    }
    onClickProcess = () => {
        let mess = `Please confirm if you want to process EOD for date ${this.date}?`
        showConfirm({
            checkWindowLoggedOut: true,
            header: 'lang_confirm_eod_process',
            message: mess,
            notTranslate: true,
            checkConnect: true,
            isOrderPopup: true,
            callback: () => {
                let url = `${dataStorage.href}/eod-process-file`;
                postData(url)
            },
            cancelCallback: () => {
            },
            init: closeFn => this.closeConfirm = closeFn
        })
    }
    checkToday(date) {
        const now = moment().tz('Asia/Ho_Chi_Minh')
        const curYear = now.format('YYYY');
        const curMonth = now.format('MM');
        const curDay = now.format('DD');
        const day = date.format('YYYY');
        const month = date.format('MM');
        const year = date.format('DD');
        if (day === curDay && month === curMonth && year === curYear) return true;
        return false;
    }
    handleChangeMinDate(e) {
        let minDate = getStartTime(e, 'Asia/Ho_Chi_Minh').tz('GMT');
        let minDateDd = getStartTime(e, 'Asia/Ho_Chi_Minh');
        this.setState({
            minDate,
            minDateDd
        }, () => {
            this.getGridData();
        })
    }
    handleChangeMaxDate(e) {
        let maxDate = getEndTime(e, 'Asia/Ho_Chi_Minh').tz('GMT');
        let maxDateDd = getEndTime(e, 'Asia/Ho_Chi_Minh');
        this.setState({
            maxDate,
            maxDateDd
        }, () => {
            this.getGridData();
        })
    }
    render() {
        const check = this.checkToday(moment(this.state.maxDate));
        return (
            <div className={s.EodWidget}>
                {
                    checkRole(MapRoleComponent.PROCESS_EOD) ? <div className={s.Topinfo}>
                        <div className={s.gridTitle}>Process EOD</div>
                        <div className={s.dateAction}>
                            <div className={s.infoDate + ' size--3'}>{`Do you want to start process  EOD for ${this.date}?`}</div>
                            <div style={{ minWidth: '136px' }} className={`${this.state.connected ? '' : s.disableBtn}`}>
                                <div onClick={this.onClickProcess} className={s.btnProcess}>
                                    Start Process
                                </div>
                            </div>
                        </div>
                    </div>
                        : null
                }
                <span className={s.gridTitle}>List of EOD Time</span>
                <div>
                    <div className={`dropDownNormal ${s.selectTime}`}>
                        <DropDown
                            translate={true}
                            className={`DropDownTimeTab`}
                            options={optionsDrop.optionsDayNewReport}
                            value={this.state.defaultOption}
                            onChange={this.onSelectDropDown}
                        />
                    </div>
                    {
                        this.state.defaultOption === 'Custom'
                            ? <div className={s.rightReportHeader}>
                                <div className={`qe-news-datePicker`} style={{ paddingLeft: '8px' }}>
                                    <div className='datepicker size--2' >
                                        <div className="input-date-gr">
                                            <DatePicker
                                                customInput={<ExampleCustomInput type='from' />}
                                                selected={this.state.minDateDd}
                                                maxDate={check ? moment().tz('Asia/Ho_Chi_Minh') : this.state.maxDateDd}
                                                onChange={this.handleChangeMinDate.bind(this)}
                                                isMinDate={true}
                                                timeZone={'Asia/Ho_Chi_Minh'}
                                                isReport={true}
                                            />
                                        </div>
                                        <div className="input-date-gr">
                                            <DatePicker
                                                customInput={<ExampleCustomInput type='to' />}
                                                selected={this.state.maxDateDd}
                                                minDate={this.state.minDateDd}
                                                maxDate={moment().tz('Asia/Ho_Chi_Minh')}
                                                onChange={this.handleChangeMaxDate.bind(this)}
                                                timeZone={'Asia/Ho_Chi_Minh'}
                                                isReport={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div> : null
                    }
                </div>
                <div style={{ height: '100%' }}>
                    <Grid
                        {...this.props}
                        opt={(opt) => {
                            this.opt = opt;
                        }}
                        paginate={{
                            setPage: cb => {
                                this.setPage = cb
                            },
                            pageChanged: this.pageChanged.bind(this)
                        }}
                        fitAllNoData={true}
                        hidesSaveCsv={true}
                        fn={fn => {
                            this.addOrUpdate = fn.addOrUpdate;
                            this.remove = fn.remove;
                            this.setData = fn.setData;
                            this.getData = fn.getData;
                            this.setColumn = fn.setColumn;
                            this.refreshView = fn.refreshView;
                            this.getAllDisplayedColumns = fn.getAllDisplayedColumns
                        }}
                        columns={this.columns}
                    />
                </div>
            </div>
        );
    }
}

export default ProcessEod;
