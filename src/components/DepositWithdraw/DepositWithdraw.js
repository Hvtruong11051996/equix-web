import React, { Component } from 'react'
import dataStorage from '../../dataStorage'
import Lang from '../Inc/Lang/Lang'
import SvgIcon, { path } from '../Inc/SvgIcon'
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'
import s from './DepositWithdraw.module.css'
import ToggleLine from '../Inc/ToggleLine/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import FilterBox from '../Inc/FilterBox'
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';
import Form, { TYPE as FORM_TYPE } from '../Inc/Form';
import Grid from '../Inc/CanvasGrid';
import Button, { buttonType } from '../Elements/Button/Button';
import DropDown from '../DropDown/DropDown'

const options = [
    {
        label: 'AUD',
        value: 'AUD'
    },
    {
        label: 'USD',
        value: 'USD'
    },
    {
        label: 'VND',
        value: 'VND'
    }
]
export default class DepositWithdraw extends React.Component {
    constructor(props) {
        super(props)
        const initState = this.props.loadState();
        this.userName = dataStorage.userInfo.full_name
        this.userID = '123123'
        this.collapse = 0
        this.state = {
            isConnected: true
        }
        this.pageId = initState.pageId || 1;
        this.pageSize = initState.pageSize || 50;
        this.mode = 'deposit'
        this.currency = 'AUD'
        props.resize((w, h) => {
            this.handleResize(w, h)
        })
        this.columns = null
    }
    componentDidMount() {
        addEventListener(EVENTNAME.connectionChanged, this.changeConnection)
    }
    handleResize(w, h) {
        let resize = ''
        if (w < 800) resize = true
        else resize = false
        if (resize !== this.columns) {
            this.columns = resize
            this.forceUpdate()
        }
    }
    changeConnection = (isConnected) => {
        if (this.state.isConnected !== isConnected) {
            this.setState({ isConnected })
        }
    }
    collapseFunc = (collapse) => {
        this.collapse = collapse ? 1 : 0
        this.forceUpdate()
    }
    onChange() { }
    clearCreateData() {
        this.currency = 'AUD'
        this.amount = ''
        this.forceUpdate()
    }
    submit() { }
    handleOnChangeAll(type, e) {
        if (type === 'dropdown') {
            if (e !== this.currency) {
                this.currency = e
            }
        } else this.amount = e
        this.forceUpdate()
    }
    copy = (e) => {
        var tempInput = document.createElement('input');
        tempInput.value = e;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
    }

    changeMode = (mode) => {
        if (this.mode !== mode) {
            this.mode = mode
            this.forceUpdate()
        }
    }

    renderTop() {
        return (
            <div className={s.borderBottom} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div className={s.tittle + ' ' + s.mode + ' ' + 'text-capitalize'} onClick={() => this.changeMode('deposit')}><Lang>lang_deposit</Lang></div>
                    <div className={s.tittle + ' ' + s.mode + ' ' + 'text-capitalize'} onClick={() => this.changeMode('withdraw')}><Lang>lang_withdraw</Lang></div>
                </div>
                <div className={s.onMode} style={this.mode === 'deposit' ? { width: '55px' } : { width: '68px', left: '109px' }}></div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <SvgIcon path={path.mdiHelpCircle} />
                    <div className={s.tittle} style={{ paddingLeft: '8px' }}>Need help?</div>
                </div>
            </div>
        )
    }
    renderNote() {
        return (
            <div className={s.note}>
                <div className={s.tittle + ' ' + 'text-capitalize'}><Lang>lang_notes</Lang>:</div>
                <div className={s.tittle} style={{ paddingTop: '8px' }}><Lang>lang_deposit_withdraw_notes</Lang></div>
            </div>
        )
    }
    renderDataBox1() {
        return (
            <div style={{ width: this.columns === false ? 'calc(50% - 8px)' : '', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <div className={s.cell}>
                        <div className={s.name}><Lang>lang_currency</Lang></div>
                        <DropDown
                            style={{ flex: '1' }}
                            translate={true}
                            options={options || []}
                            skipnull={true}
                            value={this.currency}
                            onChange={(e) => this.handleOnChangeAll('dropdown', e)}
                        />
                    </div>
                    <div className={s.cell}>
                        <div className={s.name + ' ' + 'text-capitalize'}><Lang>{this.mode === 'deposit' ? 'lang_deposit' : 'lang_withdraw'}</Lang> <Lang>lang_mount</Lang></div>
                        <div style={{ flex: '1' }}>
                            <div style={{ display: 'flex' }}>
                                <input
                                    style={{ flex: '1' }}
                                    autoComplete='off'
                                    className={`size--3` + ' ' + s.input}
                                    placeholder={'...'}
                                    value={this.amount}
                                    onChange={(e) => this.handleOnChangeAll('input', e.target.value)}
                                />
                                <div className={s.currency}>{this.currency}</div>
                            </div>
                        </div>
                    </div>
                    <div className={s.cell}>
                        <div className={s.name + ' ' + 'firstLetterUpperCase'}><Lang>lang_bank_account_name</Lang></div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div>STAX Trade Pty Ltd</div>
                            <SvgIcon path={path.mdiContentCopy} ref={ref => this.refBtn = ref} onClick={(e) => this.copy('STAX Trade Pty Ltd')} style={{ paddingLeft: '8px', cursor: 'pointer' }} />
                        </div>
                    </div>
                    <div className={s.cell}>
                        <div className={s.name + ' ' + 'firstLetterUpperCase'}><Lang>lang_bank_account_number</Lang></div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div>123456</div>
                            <SvgIcon path={path.mdiContentCopy} ref={ref => this.refBtn = ref} onClick={() => this.copy('123456')} style={{ paddingLeft: '8px', cursor: 'pointer' }} />
                        </div>
                    </div>
                    <div className={s.cell}>
                        <div className={s.name} style={{ textTransform: 'uppercase' }}><Lang>lang_bsb</Lang></div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div>11111</div>
                            <SvgIcon path={path.mdiContentCopy} ref={ref => this.refBtn = ref} onClick={() => this.copy('11111')} style={{ paddingLeft: '8px', cursor: 'pointer' }} />
                        </div>
                    </div>
                </div>
                {this.columns === true ? <div className={s.borderBottom}></div> : this.renderButton()}
            </div>
        )
    }
    renderDataBox2() {
        return (
            <div style={this.columns === false ? { width: 'calc(50% - 8px)' } : null}>
                <div className={s.cell}>
                    <div className={s.name + ' ' + 'text-capitalize'}><Lang>{this.mode === 'deposit' ? 'lang_deposit' : 'lang_withdraw'}</Lang> <Lang>lang_summary</Lang></div>
                </div>
                <div className={s.cell}>
                    <div className={s.name}><Lang>lang_bank_account_name</Lang></div>
                    <div>
                        <div>121212 AUD</div>
                    </div>
                </div>
                <div className={s.cell}>
                    <div className={s.name + ' ' + 'firstLetterUpperCase'}><Lang>lang_total_balance</Lang></div>
                    <div>
                        <div>123456 AUD</div>
                    </div>
                </div>
                <div className={s.borderBottom}></div>
                <div className={s.cell}>
                    <div className={s.name + ' ' + 'firstLetterUpperCase'}><Lang>lang_update_balance</Lang></div>
                    <div>
                        <div>666,666 AUD</div>
                    </div>
                </div>
                {this.columns === true ? this.renderButton() : null}
            </div>
        )
    }
    renderData() {
        return (
            <div style={{ height: 'calc(100% - 160px)', flex: '1', overflow: 'auto', paddingTop: '8px' }} className={this.columns === false ? s.row : null}>
                {this.renderDataBox1()}
                {this.columns === false ? <div style={{ borderRight: '1px solid var(--border)', margin: '0px 16px 0 8px' }}></div> : null}
                {this.renderDataBox2()}
            </div>
        )
    }
    renderButton() {
        return <div className='footer text-capitalize' ref={ref => this.refBtn = ref} style={{ background: 'var(--primary-default)', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '0 8px' }}>
            <Button type={buttonType.ascend} className={s.footerBtn} disabled={!this.state.isConnected} onClick={() => this.submit()}><Lang>lang_submit</Lang></Button>
            <Button type={buttonType.danger} className={s.footerBtn} disabled={!this.state.isConnected} style={{ marginLeft: '8px' }} onClick={() => this.clearCreateData()}><Lang>lang_clear_data</Lang></Button>
        </div>
    }
    renderMain() {
        return (
            <div style={{ height: '60%', paddingBottom: '8px' }} className={this.collapse === 1 ? s.collapse : ''}>
                <div className={s.mainData}>
                    {this.renderTop()}
                    {this.renderNote()}
                    {this.renderData()}
                </div>
            </div>
        )
    }

    pageChanged = pageId => {
        this.pageId = pageId;
        this.props.saveState({
            pageId: pageId
        })
    }
    setGridPaginate = () => {
        return {
            setPage: cb => {
                this.setPage = cb
            },
            pageChanged: this.pageChanged
        }
    }
    setGridFnKey = (data) => {
        return data.account_id
    }
    getColums = () => {
        return [
            {
                header: 'lang_transaction_id',
                name: 'transaction_id',
                type: TYPE.LABEL
            },
            {
                header: 'lang_actor',
                name: 'actor',
                type: TYPE.LABEL
            },
            {
                header: 'lang_deposit_date',
                name: 'deposit_date',
                type: TYPE.DATE,
                dateFormat: 'DD MMM YYYY hh:mm:ss'
            },
            {
                header: 'lang_status',
                name: 'status',
                type: TYPE.LABEL
            }
        ]
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
                callback: (boundOption) => this.showColumnMenu(boundOption)
            },
            {
                value: 'Filters',
                label: 'lang_filters',
                callback: (boundOption) => this.showFilterMenu(boundOption)
            }
        ]
    }
    onChangeTextFilter = (value) => {
        this.filterText = value
        this.setQuickFilter(value)
    }
    renderFilter() {
        return (
            <div className={s.headerGrid}>
                <div className={s.title}>{this.mode}</div>
                <div className={s.subHeaderGrid}>
                    <FilterBox
                        className={s.quickFilter}
                        value={this.filterText}
                        onChange={this.onChangeTextFilter}
                    />
                    <MoreOption agSideButtons={this.createagSideButtons()} />
                </div>
            </div>
        )
    }
    renderGrid() {
        return (
            <div style={{ height: 'calc(40% - 96px' }}>
                {this.renderFilter()}
                <Grid
                    fn={fn => {
                        this.getData = fn.getData
                        this.setData = fn.setData
                        this.addOrUpdate = fn.addOrUpdate
                        this.setColumn = fn.setColumn
                        this.getColumn = fn.getColumn
                        this.setEditMode = fn.setEditMode
                        this.resetData = fn.resetData
                        this.hasInvalid = fn.hasInvalid
                        this.exportCsv = fn.exportCsv
                        this.resetFilter = fn.resetFilter
                        this.autoSize = fn.autoSize
                        this.resetFilter = fn.resetFilter
                        this.setQuickFilter = fn.setQuickFilter
                        this.showColumnMenu = fn.showColumnMenu
                        this.showFilterMenu = fn.showFilterMenu
                        this.saveData = fn.saveData
                    }}
                    columns={this.getColums()}
                    paginate={this.setGridPaginate()}
                    fnKey={this.setGridFnKey}
                    autoFit={true}
                />
            </div>
        )
    }

    render() {
        return (
            <div>
                <div style={{ fontSize: 'var(--size-4)', color: 'var(--secondary-default)', height: '32px' }}>{this.userName} ({this.userID})</div>
                {this.renderMain()}
                <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
                {this.renderGrid()}
            </div>
        )
    }
}
