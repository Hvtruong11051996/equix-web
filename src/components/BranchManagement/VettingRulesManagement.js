import React from 'react'
import dataStorage from '../../dataStorage';
import showModal from '../Inc/Modal/Modal';
import { registerBranch, unregisterBranch, unregisterUser, registerUser } from '../../streaming';
import Lang from '../Inc/Lang/Lang';
import ConfirmAccountGroupManagement from '../Inc/ConfirmAccountGroupManagement/ConfirmAccountGroupManagement';
import { putData, getData, getDataBranch, enumBranch, editBranch } from '../../helper/request';
import { clone, hideElement, checkRole, formatInitTime } from '../../helper/functionUtils';
import logger from '../../helper/log';
import Grid from '../Inc/CanvasGrid';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant'
import MapRoleComponent from '../../constants/map_role_component';
import ToggleLine from '../Inc/ToggleLine';
import MoreOption from '../Inc/MoreOption';
import Button, { buttonType } from '../Elements/Button/Button';
import ErrorBanner from '../Elements/ErrorBanner';
import LastUpdated from '../Elements/LastUpdated';
import FilterBox from '../Inc/FilterBox'
import Actor from './Actor';
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon';
import s from './VettingRulesManagement.module.css'
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event';
import ButtonGroup from './ButtonGroup.js'

const FIELD = {
    MARKET_TYPE: 'market_type',
    RULES: 'rule',
    CONDITIONAL_RULES: 'conditional_rule',
    VALIDATE: 'validate',
    ENUM: 'enum'
}

const DIC_MARKET_TYPE = {
    us: 'lang_us_market',
    au: 'lang_au_market',
    future: 'lang_future'
}

const EDIT_CELL = ['14000', '14001', '15001', '15000', '24000', '24001', '25001', '25000', '28000', '28001', '28002', '29000'];

export default class VettingRulesManagement extends React.Component {
    constructor(props) {
        super(props)
        const initState = props.loadState()
        this.editMode = false
        this.collapse = +initState.collapse
        this.filterText = initState.valueFilter || ''
        this.columns = [
            {
                header: 'lang_market_type',
                name: FIELD.MARKET_TYPE,
                formater: params => {
                    const market = params.data && params.data[FIELD.MARKET_TYPE]
                    return DIC_MARKET_TYPE[market] ? dataStorage.translate(DIC_MARKET_TYPE[market]).toUpperCase() : (market || '--')
                },
                hide: true,
                groupIndex: 0
            },
            {
                header: 'lang_rules',
                name: FIELD.RULES,
                groupIndex: 1
            },
            {
                header: 'lang_conditional_rule',
                name: FIELD.CONDITIONAL_RULES
            },
            {
                header: 'lang_validate',
                name: FIELD.VALIDATE
            }
        ]
        this.realTimeData = this.realTimeData.bind(this)
    }

    componentDidMount() {
        this.getDataVettingRules()
        const userId = dataStorage.userInfo && dataStorage.userInfo.user_id;
        if (!userId) return
        registerBranch(userId, this.realTimeData, 'BRANCH');
    }

    componentWillUnmount() {
        const userId = dataStorage.userInfo && dataStorage.userInfo.user_id;
        if (!userId) return
        unregisterBranch(userId, this.realTimeData, 'BRANCH');
    }

    realTimeData(data, action) {
        if (!data) return
        this.dicBranch.updated = data.updated
        this.dicBranch.actor = data.actor
        this.dicBranch.group_name = data.group_name
        this.setDataHeader()
        let index
        switch (action) {
            case 'UPDATE':
                index = this.dicBranch.branch.findIndex(e => e.branch_id === data.branch_id)
                Object.assign(this.dicBranch.branch[index], data)
                this.setDataAndColumn();
                break
            case 'DELETE':
                index = this.dicBranch.branch.findIndex(e => e.branch_id === data.branch_id)
                this.dicBranch.branch.splice(index, 1);
                this.setDataAndColumn();
                break
            case 'INSERT':
                this.dicBranch.branch.unshift(data);
                this.setDataAndColumn();
                break
        }
    }

    getDataVettingRules = () => {
        this.getVettingRulesEnum()
    }

    getVettingRulesEnum = () => {
        let urlEnum = enumBranch();
        this.props.loading(true)
        getData(urlEnum).then(response => {
            this.props.loading(false)
            if (response.data) {
                this.listEnum = response.data || [];
                this.getVettingRules();
            }
        }).catch(error => {
            this.props.loading(false)
            logger.log(error)
        })
    }

    getVettingRules = () => {
        let urlAllBranch = getDataBranch();
        this.props.loading(true)
        getData(urlAllBranch).then(response => {
            this.props.loading(false)
            if (response.data) {
                this.dicBranch = response.data.data
                this.setDataHeader()
                this.setDataAndColumn(true);
            }
        }).catch(error => {
            this.props.loading(false)
            logger.log(error)
        })
    }

    setDataHeader = () => {
        this.setUpdated && this.setUpdated(this.dicBranch.updated)
        this.setActor && this.setActor({
            actor: this.dicBranch.actor,
            group: this.dicBranch.group_name
        })
    }

    getJson(data) {
        try {
            const res = JSON.parse(data);
            if (!Array.isArray(res)) return [];
            return res;
        } catch (e) {
            return [];
        }
    }

    getCellTypeByData = (params) => {
        if (params.data && params.data.enum && EDIT_CELL.includes(params.data.enum)) {
            if (this.editMode && params.name === 'DEFAULT VETTING RULES') return TYPE.LABEL
            return TYPE.INPUT
        } else return TYPE.BOOLEAN
    }

    formatCellByData = (params) => {
        if (params.data && params.data.enum && EDIT_CELL.includes(params.data.enum)) {
            if (!this.editMode || params.name === 'DEFAULT VETTING RULES') {
                if (params.data[params.name] + '' === '-1') return dataStorage.translate('lang_no_limit').toUpperCase()
            }
        }
        return params.data[params.name]
    }

    setDataAndColumn = () => {
        const columns = [];
        const dicRuleBranch = {}
        for (let i = 0; i < this.dicBranch.branch.length; i++) {
            const item = this.dicBranch.branch[i];
            const column = {
                headerFixed: item.branch_name,
                name: item.branch_name,
                type: TYPE.BOOLEAN,
                inputAlign: 'right',
                tooltipInput: 'lang_min_0',
                min: 0,
                fnType: this.getCellTypeByData,
                formater: this.formatCellByData
            }
            if (['DEFAULT VETTING RULES', 'FUTURE MARKET CASH VETTING RULES'].includes(item.branch_name)) {
                Object.assign(column, { disable: true })
            }
            if (item.branch_name === 'DEFAULT VETTING RULES') {
                columns.unshift(column)
            } else columns.push(column);
            const listRule = this.getJson(item.list_rule);
            dicRuleBranch[item.branch_name] = {}
            Object.assign(dicRuleBranch[item.branch_name], listRule.reduce((acc, cur) => Object.assign(acc, cur), {}));
        }
        const finalColumns = [...this.columns, ...columns]
        this.setColumn(finalColumns);
        const lstData = this.listEnum.map(item => {
            const obj = { ...item };
            this.dicBranch.branch.map(branch => {
                let value = dicRuleBranch[branch.branch_name] && dicRuleBranch[branch.branch_name][item.enum]
                if (value === 'enable') value = true
                if (value === 'disable') value = false
                obj[branch.branch_name] = value
            })
            return obj;
        });
        this.setData(lstData);
    }

    renderUpdated() {
        return <LastUpdated fn={fn => this.setUpdated = fn.setUpdated} />
    }

    renderActor() {
        return <Actor fn={fn => this.setActor = fn.setData} />
    }

    onCreate = () => {
        let options = [{
            id: 'lang_default',
            name: 'DEFAULT'
        }];
        for (let i = 0; i < this.dicBranch.branch.length; i++) {
            const opt = {
                id: this.dicBranch.branch[i].branch_id,
                name: this.dicBranch.branch[i].branch_name
            }
            if (opt.name === 'DEFAULT VETTING RULES') options.unshift(opt)
            else options.push(opt)
        }
        showModal({
            component: ConfirmAccountGroupManagement,
            props: {
                type: 'Create',
                option: options,
                callBack: this.handleCallBackConfirm.bind(this)
            }
        })
    }

    handleCallBackConfirm(data) {
        this.showError && this.showError(data.errStatus, true)
    }

    onRemove = () => {
        let options = [];
        for (let i = 0; i < this.dicBranch.branch.length; i++) {
            const opt = {
                id: this.dicBranch.branch[i].branch_id,
                name: this.dicBranch.branch[i].branch_name
            }
            if (['DEFAULT VETTING RULES', 'FUTURE MARKET CASH VETTING RULES', 'AU & US MARKET CASH VETTING RULES'].includes(opt.branch_name)) continue
            else options.push(opt)
        }
        showModal({
            component: ConfirmAccountGroupManagement,
            props: {
                type: 'Remove',
                option: options,
                callBack: this.handleCallBackConfirm.bind(this)
            }
        })
    }

    onSave = (cb) => {
        let presentlistData = this.getData()
        let convertData = []
        let errorList = []
        const listPromise = []
        const dicBranch = clone(this.dicBranch);
        if (this.dicBranch) {
            convertData = dicBranch.branch.map(branch => {
                branch.list_rule = presentlistData.map(item => {
                    const obj = {};
                    if (EDIT_CELL.includes(item.enum)) {
                        if (!item[branch.branch_name]) obj[item.enum] = '-1'
                        else obj[item.enum] = item[branch.branch_name] || '-1';
                        obj[item.enum] = obj[item.enum] + ''
                    } else obj[item.enum] = item[branch.branch_name] ? 'enable' : 'disable';
                    return obj
                });
                return branch;
            })
        }
        for (let i = 0; i < convertData.length; i++) {
            if (convertData[i].branch_name === 'DEFAULT VETTING RULES') continue
            const dataPut = convertData[i];
            dataPut.list_rule_compare = JSON.stringify(dataPut.list_rule.reverse());
            dataPut.list_rule = JSON.stringify(dataPut.list_rule);
            let isChange = false
            this.dicBranch.branch.map(e => {
                if (e.branch_id === dataPut.branch_id) {
                    if (e.list_rule !== dataPut.list_rule_compare) isChange = true
                    delete dataPut.list_rule_compare
                }
            })
            isChange && listPromise.push(new Promise(resolve => {
                let url = editBranch(convertData[i].branch_id);
                delete dataPut.actor;
                this.props.loading(true)
                putData(url, { data: dataPut }).then(response => {
                    this.props.loading(false)
                    if (response.data && response.data.message) errorList.push(response.data.message)
                    resolve()
                }).catch(error => {
                    this.props.loading(false)
                    resolve()
                    logger.error(error)
                })
            }))
        }
        if (listPromise.length) {
            Promise.all(listPromise)
                .then(response => {
                    this.onCancel()
                    cb && cb()
                    if (errorList.length === 0) this.showError && this.showError('lang_save_account_group_successfully', true)
                    else this.showError && this.showError('lang_save_account_group_successfully')
                }).catch(error => {
                    logger.log(error)
                    this.showError && this.showError('lang_save_account_group_unsuccessfully')
                })
        } else this.showError && this.showError('lang_no_change_in_the_vetting_rules')
    }

    onCancel = () => {
        this.editMode = false
        this.resetData();
        this.setEditMode(false)
    }

    onEdit = () => {
        this.editMode = true
        this.setEditMode(true)
    }

    renderButtons() {
        const checkRoleNavBar = checkRole(MapRoleComponent.VETTING_RULES);
        if (!checkRoleNavBar) return null
        return <ButtonGroup
            onCreate={this.onCreate}
            onRemove={this.onRemove}
            onSave={this.onSave}
            onCancel={this.onCancel}
            onEdit={this.onEdit}
        />
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

    renderLeft = () => {
        return <div className={s.leftHeader}>
            {this.renderUpdated()}
            {this.renderActor()}
            {this.renderButtons()}
        </div>
    }

    onChangeTextFilter = (value) => {
        this.filterText = value
        this.setQuickFilter(value)
    }

    renderQuickFilter = () => {
        return (
            <FilterBox
                className={s.quickFilter}
                value={this.filterText}
                onChange={this.onChangeTextFilter}
            />
        )
    }

    renderHeader() {
        return (
            <React.Fragment>
                <div className={`header-wrap isMoreOption flex ${this.collapse ? 'collapse' : ''}`} style={{ alignItems: 'flex-end' }} ref={ref => this.dom = ref}>
                    <div className='navbar more' style={{ alignItems: 'flex-end' }}>
                        {this.renderLeft()}
                        {this.renderQuickFilter(true)}
                    </div>
                    <MoreOption agSideButtons={this.createagSideButtons()} />
                </div>
                <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
            </React.Fragment>
        )
    }

    collapseFunc = (collapse) => {
        this.props.saveState({ collapse: +collapse })
        this.collapse = +collapse
        this.dom && this.dom.classList.toggle('collapse')
    }

    getKey = (data) => {
        return `${data[FIELD.MARKET_TYPE]}_${data[FIELD.RULES]}}_${data[FIELD.ENUM]}}`
    }

    renderGrid = () => {
        return <Grid
            {...this.props}
            id={FORM.VETTING_RULES_MANAGEMENT}
            columns={this.columns}
            fnKey={this.getKey}
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
            autoFit={true}
        />
    }

    render() {
        return (
            <div className={`qe-widget`} style={{ display: 'flex' }}>
                <ErrorBanner fn={fn => this.showError = fn.showError} />
                {this.renderHeader()}
                {this.renderGrid()}
            </div>
        )
    }
}
