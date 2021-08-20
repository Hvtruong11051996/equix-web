import React, { useReducer, useRef, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import showModal from '../Inc/Modal';
import Lang from '../Inc/Lang';
import { getData, putData, deleteData, getMarginDetailUrl, getMarginLevelUrl, getBranchInfoUrl, getEditLevelUrl, getEditRuleLevelUrl, getEditMarginDetailUrl } from '../../helper/request';
import dataStorage from '../../dataStorage';
import { checkRole, mapError, formatInitTime, clone, formatNumberValue } from '../../helper/functionUtils'
import { emitter, eventEmitter } from '../../constants/emitter_enum';
import { registerBranch, unregisterBranch } from '../../streaming';
import { func } from '../../storage';
import MapRoleComponent from '../../constants/map_role_component';
import Grid from '../Inc/CanvasGrid';
import DropDown from '../DropDown/DropDown';
import NoTag from '../Inc/NoTag/NoTag';
import PopupEditor from '../Inc/PopupEditor';
import enumColor from '../../constants/enumColor';
import Button, { buttonType } from '../Elements/Button/Button';
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon';
import { TYPE, FORM } from '../Inc/CanvasGrid/Constant/gridConstant';
import MoreOption from '../Inc/MoreOption/MoreOption';
import ToggleLine from '../Inc/ToggleLine/ToggleLine';
import ErrorBanner from '../Elements/ErrorBanner';
import moment from 'moment';

const reducer = (state, action) => {
    switch (action.type) {
        default:
            return {
                ...state,
                ...action
            }
    }
}

const MarginControlManagement = (props) => {
    const that = useRef({})
    useMemo(() => {
        that.current.columns = []
        that.current.editMargin = {}
        that.current.editDetail = {}
        that.current.removeLevel = []
        that.current.needGetData = false
    }, []);
    const [state, dispatch] = useReducer(reducer, { activeEdit: false, connected: true, actor: '', updated: '', collapse: (props.loadState() || {}).collapse })

    useEffect(() => {
        if (that.current.needGetData) {
            that.current.needGetData = false
            getDataMarginControlManagement()
        }
        that.current.editMargin = {}
        that.current.editDetail = {}
        that.current.removeLevel = []
    }, [state.activeEdit])

    const data = useMemo(() => {
        let dataGrid = []
        if (that.current.getData) dataGrid = clone(that.current.getData())
        return dataGrid
    }, [state.activeEdit])

    useEffect(() => {
        getDataMarginControlManagement()
        regiterRealtimeAll()
        return () => {
            if (dataStorage.userInfo) {
                unregisterBranch(dataStorage.userInfo.user_id, realTimeData, 'BRANCH');
                unregisterBranch(dataStorage.userInfo.user_id, realTimeData, 'MARGIN_LEVEL');
                unregisterBranch(dataStorage.userInfo.user_id, realTimeData, 'MARGIN_DETAIL');
                unregisterBranch(dataStorage.userInfo.user_id, realTimeData, 'MARGIN_GROUP');
            }
        }
    }, [])

    const regiterRealtimeAll = () => {
        if (dataStorage.userInfo) {
            registerBranch(dataStorage.userInfo.user_id, realTimeData, 'BRANCH');
            registerBranch(dataStorage.userInfo.user_id, realTimeData, 'MARGIN_LEVEL');
            registerBranch(dataStorage.userInfo.user_id, realTimeData, 'MARGIN_DETAIL');
            registerBranch(dataStorage.userInfo.user_id, realTimeData, 'MARGIN_GROUP');
        }
    }

    const realTimeData = (data, actionNotify, title) => {
        if (state.activeEdit) {
            that.current.needGetData = true
        } else {
            dispatch({
                actor: data.actor,
                updated: data.updated
            })
            switch (title) {
                case 'BRANCH#INSERT':
                    // let branchInfoUrl = getBranchInfoUrl();
                    // getData(branchInfoUrl).then((res) => {
                    //     let column = createColumnHeader(res)
                    //     that.current.setColumn(column)
                    // })
                    // break;
                    getDataMarginControlManagement();
                    break;
                case 'BRANCH#DELETE':
                    let column = that.current.getColumn().filter(x => x.name !== data.branch_id);
                    that.current.setColumn(column);
                    break;
                case 'MARGIN_GROUP#UPDATE':
                    let dataGrid = that.current.getData();
                    dataGrid.forEach(x => {
                        if (x.actions === 'Notifications' || x.actions === 'Language') {
                            if (!x[data.branch_id]) return;
                            x[data.branch_id].alert_language = data.alert_language
                            x[data.branch_id].alert_methods = data.alert_methods
                        }
                    })
                    that.current.setData(dataGrid)
                    break;
                case 'MARGIN_LEVEL#CREATE':
                    getDataMarginControlManagement();
                    break;
                case 'MARGIN_LEVEL#UPDATE':
                    dataGrid = that.current.getData();
                    dataGrid.forEach(x => {
                        if (x.groupColumn === data.margin_level) {
                            x.description = data.description
                            x.marginType = data.margin_type
                        }
                    })
                    that.current.setData(dataGrid)
                    break;
                case 'MARGIN_LEVEL#DELETE':
                    dataGrid = that.current.getData().filter(x => x.groupColumn !== data.margin_level)
                    that.current.setData(dataGrid)
                    break;
                case 'MARGIN_DETAIL#UPDATE':
                    dataGrid = that.current.getData();
                    dataGrid.forEach(x => {
                        if (x.groupColumn === data.margin_level) {
                            if (x[data.branch_id]) x[data.branch_id] = data.margin_rules
                        }
                    })
                    that.current.setData(dataGrid)
                    break;
                default:
                    break;
            }
        }
    }

    const createDataTemplate = (level, margin) => {
        let data = [];
        let levelData = level.data.sort((a, b) => b.margin_level - a.margin_level);
        let marginData = margin.data;
        // const mapObj = (keys, obj) => {
        //     let a = {}
        //     Object.keys(obj).forEach(x => {
        //         a[x] = obj[x][keys]
        //     })
        //     return a
        // }
        for (let index = 0; index < levelData.length; index++) {
            const elm = levelData[index];
            let dataMap = {};
            marginData.forEach(item => {
                if (item.margin_level === elm.margin_level) {
                    dataMap[item.branch_id] = item.margin_rules
                }
            });
            let dataRow = [
                Object.assign({ actions: 'Risk Management', groupColumn: elm.margin_level, description: elm.description, marginType: elm.margin_type }),
                Object.assign({ actions: 'Send Warning', groupColumn: elm.margin_level, actionsEnum: 'SENDING_WARNING', description: elm.description, marginType: elm.margin_type }, dataMap),
                Object.assign({ actions: 'Cancel All Open Orders', groupColumn: elm.margin_level, actionsEnum: 'CANCEL_ALL_ORDERS', description: elm.description, marginType: elm.margin_type }, dataMap),
                Object.assign({ actions: 'Close All Position/Holdings', groupColumn: elm.margin_level, actionsEnum: 'CLOSE_ALL_POSITION', description: elm.description, marginType: elm.margin_type }, dataMap),
                Object.assign({ actions: 'Pre-Trade Vetting', groupColumn: elm.margin_level, description: elm.description, marginType: elm.margin_type }),
                Object.assign({ actions: 'Reduce Position Only', groupColumn: elm.margin_level, actionsEnum: 'REDUCE_POSITION_ONLY', description: elm.description, marginType: elm.margin_type }, dataMap)
            ]
            data.push.apply(data, dataRow);
        }
        return data;
    }

    const getCellTypeByData = (params) => {
        if (params.data.actions === 'Risk Management' || params.data.actions === 'Pre-Trade Vetting') return TYPE.EMPTY
        else if (params.data.actions === 'Notifications') return TYPE.MARGIN_NOTI
        else if (params.data.actions === 'Language') return TYPE.MARGIN_LANGUAGE
        else return TYPE.MARGIN_BOOLEAN
    }

    const removeGroup = (level) => {
        let dataToFilter = that.current.getData()
        that.current.setData(dataToFilter.filter(x => x.groupColumn !== level))
        that.current.removeLevel.push(level)
    }

    const editMarginLevel = (editUrl, dataBody) => {
        that.current.editMargin[editUrl] = dataBody
    }

    const handleEditDetail = (data) => {
        let editMarginDetailUrl = getEditMarginDetailUrl(`${data.branch_id}`);
        let dataBody = {
            data: {
                branch_id: data.branch_id,
                alert_methods: data.alert_methods,
                alert_language: data.alert_language
            }
        }
        that.current.editDetail[editMarginDetailUrl] = dataBody
    }

    const createColumnHeader = (rawdata) => {
        let data = rawdata.data;
        let headerData = data.filter((value, index, arr) => index === arr.findIndex((t) => (
            t.branch_id === value.branch_id
        )))
        let column = [];
        column.push({
            header: 'lang_actions_list',
            name: 'actions',
            type: TYPE.MARGIN_ACTION,
            suppressSort: true,
            suppressFilter: true,
            suppressGroup: true
        }, {
            header: 'level',
            name: 'groupColumn',
            groupIndex: 0,
            hide: true,
            type: TYPE.MARGIN_GROUP,
            removeCallback: removeGroup,
            editMarginLevelCallback: editMarginLevel,
            suppressSort: true,
            suppressFilter: true,
            suppressGroup: true
        });
        for (let index = 0; index < headerData.length; index++) {
            const elm = headerData[index];
            column.push({
                headerFixed: elm.branch_name,
                name: elm.branch_id,
                fnType: getCellTypeByData,
                minWidth: 180,
                handleEditDetailCallBack: handleEditDetail,
                isMarginCheckBox: true,
                suppressSort: true,
                suppressFilter: true,
                suppressGroup: true
            })
        }
        return column;
    }
    const createDataPin = (data) => {
        let dataPin = [];
        let dataDefaultRow = {}
        for (let index = 0; index < data.length; index++) {
            const item = data[index];
            dataDefaultRow[item.branch_id] = item;
        }
        dataPin.push(
            Object.assign({ actions: 'Notifications', actionsEnum: 'Notifications' }, dataDefaultRow),
            Object.assign({ actions: 'Language', actionsEnum: 'Language' }, dataDefaultRow)
        )
        return dataPin;
    }

    const getDataMarginControlManagement = async (setColumn = true) => {
        let marginUrl = getMarginDetailUrl()
        let levelUrl = getMarginLevelUrl()
        let branchInfoUrl = getBranchInfoUrl()
        const [margin = {}, level = {}, branchInfo = {}] = await Promise.all([
            getData(marginUrl),
            getData(levelUrl),
            getData(branchInfoUrl)
        ])
        let column = []
        let dataPin = []
        if (branchInfo.data && branchInfo.data.length > 0) {
            dataPin = createDataPin(branchInfo.data)
            column = createColumnHeader(branchInfo)
        } else {
            column = []
        }
        that.current.setColumn(column)
        let data = [];
        if (Object.keys(margin).length && margin.data.length && Object.keys(level).length && level.data.length) {
            data = createDataTemplate(level, margin);
        }
        if (column.length > 0) {
            let dataClone = [...clone(branchInfo.data), ...clone(level.data), ...clone(margin.data)]
            let updated = 0;
            let actor = '';
            dataClone.forEach(elm => {
                if (updated < elm.updated) {
                    updated = elm.updated;
                    actor = elm.actor
                }
            });
            dispatch({
                updated,
                actor
            })
        }
        let fullData = [...dataPin, ...data]
        that.current.setData(fullData);
    }

    const addMarginSuccess = (e) => {
        getDataMarginControlManagement()
    }

    const addNewMargin = () => {
        // if (!this.state.connected) return
        showModal({
            component: PopupEditor,
            props: {
                type: 'inputNumber',
                placeholder: '...',
                headerText: 'lang_create_new_margin',
                middleText: 'lang_please_enter_percentage_of_new_margin',
                // onChange: this.addNewMarginAction,
                onSuccess: addMarginSuccess,
                actionName: 'addNewMarginAction'
            }
        })
    }

    const handleClickSaveBtn = () => {
        let dataChange = that.current.getData(true)
        if (dataChange.length || Object.keys(that.current.editMargin).length || that.current.removeLevel.length) {
            let dataColumn = that.current.getDataColumn()
            let putArr = []
            if (Object.keys(that.current.editMargin)) {
                Object.keys(that.current.editMargin).forEach(item => {
                    let url = item;
                    let dataBody = that.current.editMargin[item];
                    putArr.push(putData(url, dataBody))
                })
            }
            if (Object.keys(that.current.editDetail)) {
                Object.keys(that.current.editDetail).forEach(item => {
                    let url = item;
                    let dataBody = that.current.editDetail[item];
                    putArr.push(putData(url, dataBody))
                })
            }
            if (that.current.removeLevel.length) {
                for (let index = 0; index < that.current.removeLevel.length; index++) {
                    const element = that.current.removeLevel[index];
                    let removeUrl = getEditLevelUrl(`${element}`)
                    putArr.push(deleteData(removeUrl));
                }
            }
            if (Object.keys(dataColumn).length) {
                Object.keys(dataColumn).forEach(x => {
                    let levelData = dataColumn[x]
                    Object.keys(levelData).forEach(v => {
                        let editLevelUrl = getEditRuleLevelUrl(`${x}/${v}`)
                        let dataBody = {
                            data: {
                                margin_level: v,
                                margin_value: Number(v),
                                branch_id: x,
                                margin_rules: levelData[v]
                            }
                        }
                        putArr.push(putData(editLevelUrl, dataBody))
                    })
                })
            }

            Promise.all(putArr).then((res) => {
                that.current.editDetail = {}
                that.current.editMargin = {}
                that.current.removeLevel = []
                dispatch({
                    actor: res[0].data.actor,
                    updated: res[0].data.updated,
                    activeEdit: false
                })
                that.current.setEditMode(false)
                that.current.showError('lang_update_margin_successfully', true)
                that.current.resetData()
                getDataMarginControlManagement()
            }).catch((e) => {
                // let error = (e.response && e.response.errorCode) || (e.response && e.response.message) || 'error_code_1700'
                // this.setState({
                //     isShowWarning: true,
                //     haveErrorOrder: true,
                //     errorOrder: mapError(error)
                // }, () => {
                //     this.hiddenWarning();
                // })
            })
        } else {
            that.current.showError('lang_no_change_in_the_margin_control', true)
            // dispatch({ activeEdit: false })
            // that.current.resetData()
            // that.current.setEditMode(false)
        }
    }

    const renderHeader = () => {
        return (
            <div className={`header-wrap ${state.collapse ? 'collapse' : ''}`}>
                <div className='navbar'>
                    {
                        checkRole(MapRoleComponent.CREATE_REMOVE_EDIT_MARGIN_CONTROL_LEVEL)
                            ? <div className='btn-group size--3'>
                                <div style={{ display: 'flex' }}>
                                    {
                                        state.activeEdit
                                            ? <NoTag>
                                                <Button type={buttonType.info} className='showTitle' onClick={() => {
                                                    handleClickSaveBtn();
                                                }}>
                                                    <SvgIcon path={path.mdiContentSave} />
                                                </Button>
                                                <label className="hidden text-capitalize"><Lang>lang_edit</Lang></label>
                                                <Button type={buttonType.danger} className='showTitle' onClick={() => {
                                                    that.current.resetData()
                                                    that.current.setData(data)
                                                    that.current.setEditMode(false)
                                                    dispatch({ activeEdit: false })
                                                }}>
                                                    <SvgIcon path={path.mdiClose} />
                                                </Button>
                                                <label className="hidden text-capitalize"><Lang>lang_cancel</Lang></label>
                                            </NoTag>
                                            : <NoTag><Button className='showTitle' onClick={() => {
                                                dispatch({ activeEdit: true })
                                                that.current.setEditMode(true)
                                            }}>
                                                <SvgIcon path={path.mdiPencil} />
                                            </Button>
                                                <label className="hidden text-capitalize"><Lang>lang_edit</Lang></label>
                                                <Button type={buttonType.info} className='showTitle' onClick={() => {
                                                    addNewMargin();
                                                }}>
                                                    <SvgIcon path={path.mdiFolderPlus} />
                                                </Button>
                                                <label className="hidden text-capitalize"><Lang>lang_add_new_margin_level</Lang></label>
                                            </NoTag>
                                    }
                                </div>
                            </div>
                            : <div></div>
                    }
                    <div style={{ display: 'flex' }}>
                        <div className='labelInfor'>
                            <span className='firstLetterUpperCase'><Lang>lang_last_updated</Lang> {state.updated ? moment(state.updated).format('DD MMM YYYY HH:mm:ss') : ''}&nbsp;</span><Lang>lang_by_user</Lang> {`${state.actor || (dataStorage.userInfo && dataStorage.userInfo.user_login_id) || ''} `}
                        </div>
                        <MoreOption agSideButtons={createagSideButtons()} />
                    </div>
                </div>
            </div>
        )
    }
    const createagSideButtons = () => {
        return [
            {
                value: 'ExportCSV',
                label: 'lang_export_csv',
                callback: () => that.current.exportCsv()
            },
            // {
            //     value: 'ResetFilter',
            //     label: 'lang_reset_filter',
            //     callback: () => that.current.resetFilter()
            // },
            {
                value: 'Resize',
                label: 'lang_resize',
                callback: () => that.current.autoSize()
            },
            {
                value: 'Columns',
                label: 'lang_columns',
                callback: () => that.current.showColumnMenu()
            }
            // {
            //     value: 'Filters',
            //     label: 'lang_filters',
            //     callback: () => that.current.showFilterMenu()
            // }
        ]
    }

    const collapseFunc = (collapse) => {
        props.saveState({
            collapse
        })
        dispatch({ collapse })
    }

    return (
        <div className={`branch-man-wrap qe-widget marginControl ${state.connected ? '' : 'disabled-btn'}`}>
            <ErrorBanner fn={fn => that.current.showError = fn.showError} />
            {renderHeader()}
            <ToggleLine collapse={state.collapse} collapseFunc={collapseFunc} />
            <div className={`content marginControlGrid`} style={{ flex: 1 }}>
                <Grid
                    {...props}
                    columns={that.current.columns}
                    fn={fn => {
                        that.current.getDataColumn = fn.getDataColumn
                        that.current.getData = fn.getData
                        that.current.setData = fn.setData
                        that.current.setColumn = fn.setColumn
                        that.current.getColumn = fn.getColumn
                        that.current.setEditMode = fn.setEditMode
                        that.current.resetData = fn.resetData
                        that.current.exportCsv = fn.exportCsv
                        that.current.resetFilter = fn.resetFilter
                        that.current.autoSize = fn.autoSize
                        that.current.showColumnMenu = fn.showColumnMenu
                        that.current.showFilterMenu = fn.showFilterMenu
                    }}
                    fnKey={(data) => {
                        return data.groupColumn + '|' + data.actionsEnum
                    }}
                    rowFixed={2}
                    clearNullGroup={true}
                    autoFit={true}
                    editGroup={true}
                    isMargin={true}
                // suppressReszieColumn={true}
                />
            </div>
        </div >
    )
}

export default MarginControlManagement
