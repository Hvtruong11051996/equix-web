import React from 'react';
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
import Grid from '../Inc/Grid/Grid';
import DropDown from '../DropDown/DropDown';
import Icon from '../Inc/Icon/Icon';
import NoTag from '../Inc/NoTag/NoTag';
import PopupEditor from '../Inc/PopupEditor';
import enumColor from '../../constants/enumColor';
import Button, { buttonType } from '../Elements/Button/Button';
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon';

export class MarginControlManagementHTML extends React.Component {
    constructor(props) {
        super(props);
        this.dicMarginType = {};
        this.dicLanguage = {};
        this.dicAlertMethods = {};
        this.dicEditMarginRule = {};
        this.dicAlertChange = {};
        this.dicMarginRule = {};
        this.dicEditDataMargin = {}
        this.dicEditMarginLevel = {}
        this.dicRemoveLevel = []
        this.userType = ((dataStorage.userInfo && dataStorage.userInfo.group_name) || '')
        this.dataPin = []
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.state = {
            connected: true,
            activeEdit: false
        }
        this.isFirst = true
        this.addMarginSuccess = this.addMarginSuccess.bind(this);
        this.editDesAction = this.editDesAction.bind(this);
        this.realTimeData = this.realTimeData.bind(this);
        this.realTimeLevel = this.realTimeLevel.bind(this)
        this.groupRowRendererParams = {
            suppressDoubleClickExpand: true
        }
        this.haveRealtime = false;
        props.resize((w, h) => {
            this.fitAllColumns && this.fitAllColumns(0);
        })
    }
    renderHeader() {
        let data = {
            init_time: this.state.updated
        }
        return (
            <div className={`header-wrap`}>
                <div className={`errorOrder size--3 ${this.state.haveErrorOrder ? '' : 'yellow'} ${this.state.isShowWarning ? '' : 'myHidden'}`} ><Lang>{this.state.errorOrder}</Lang></div>
                <div className='navbar'>
                    {
                        checkRole(MapRoleComponent.CREATE_REMOVE_EDIT_MARGIN_CONTROL_LEVEL)
                            ? <div className='btn-group size--3'>
                                <div style={{ display: 'flex' }}>
                                    {
                                        this.state.activeEdit
                                            ? <NoTag>
                                                <Button type={buttonType.info} className='showTitle' disabled={!this.state.connected} onClick={() => {
                                                    if (!this.state.connected) return
                                                    this.saveAfterEditGroupMargin();
                                                }}>
                                                    <SvgIcon path={path.mdiContentSave} />
                                                </Button>
                                                <label className="hidden text-capitalize"><Lang>lang_edit</Lang></label>
                                                <Button type={buttonType.danger} className='showTitle' onClick={() => {
                                                    this.cancelAfterEditGroupMargin();
                                                }}>
                                                    <SvgIcon path={path.mdiClose} />
                                                </Button>
                                                <label className="hidden text-capitalize"><Lang>lang_cancel</Lang></label>
                                            </NoTag>
                                            : <NoTag><Button className='showTitle' disabled={!this.state.connected} onClick={() => {
                                                if (!this.state.connected) return
                                                this.editGroupMargin();
                                            }}>
                                                <SvgIcon path={path.mdiPencil} />
                                            </Button>
                                                <label className="hidden text-capitalize"><Lang>lang_edit</Lang></label>
                                                <Button type={buttonType.info} className='showTitle' disabled={!this.state.connected} onClick={() => {
                                                    this.addNewMargin();
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
                    <div className='labelInfor'>
                        <span className='firstLetterUpperCase'><Lang>lang_last_updated</Lang> {this.state.updated ? formatInitTime(data, dataStorage.timeZone) : ''}&nbsp;</span><Lang>lang_by_user</Lang> {`${this.state.actor || (dataStorage.userInfo && dataStorage.userInfo.user_login_id) || ''} `}
                    </div>
                </div>
            </div>
        )
    }
    addMarginSuccess(e) {
        let data = e.data
        this.setState({
            haveErrorOrder: false,
            actor: data.actor,
            updated: data.updated,
            isShowWarning: true,
            errorOrder: 'lang_create_new_margin_successfully'
        }, () => {
            this.getDataMarginControlManagement(false);
            this.hiddenWarning();
        })
    }

    addNewMargin() {
        if (!this.state.connected) return
        showModal({
            component: PopupEditor,
            props: {
                type: 'inputNumber',
                placeholder: '...',
                headerText: 'lang_create_new_margin',
                middleText: 'lang_please_enter_percentage_of_new_margin',
                // onChange: this.addNewMarginAction,
                onSuccess: this.addMarginSuccess,
                actionName: 'addNewMarginAction'
            }
        })
    }
    hiddenWarning() {
        setTimeout(() => {
            this.setState({ isShowWarning: false })
        }, 4000)
    }

    checkUnchange() {
        let isChange = false;
        let that = this;
        if (this.dicRemoveLevel.length) {
            isChange = true
        }
        if (Object.keys(this.dicEditMarginLevel).length) {
            Object.keys(this.dicEditMarginLevel).forEach(x => {
                let data = this.dicEditMarginLevel[x]
                let dataCheck = that.dicMarginType[data.data.margin_level];
                if (((data.data.description || '') !== (dataCheck.description || '')) || (data.data.margin_type !== dataCheck.margin_type)) isChange = true;
            })
        }
        if (Object.keys(this.dicEditMarginRule).length) {
            Object.keys(this.dicEditMarginRule).forEach(x => {
                let data = this.dicEditMarginRule[x]
                let dataCheck = that.dicMarginRule[x];
                if (data.margin_rules.sort().join('') !== dataCheck.sort().join('')) isChange = true;
            })
        }
        if (Object.keys(this.dicAlertChange).length) {
            Object.keys(this.dicAlertChange).forEach(x => {
                let data = this.dicAlertChange[x];
                let dataAlertMethodsCheck = that.dicAlertMethods[x];
                let dataAlertLanguageCheck = that.dicLanguage[x];
                if ((data.alert && data.alert.sort().join('') !== dataAlertMethodsCheck.sort().join('')) || (data.language !== dataAlertLanguageCheck)) isChange = true;
            })
        }
        return isChange;
    }

    saveAfterEditGroupMargin() {
        let checkUnChange = this.checkUnchange();
        if (checkUnChange) {
            let putArr = []
            this.dicMarginType = this.dicEditDataMargin;
            if (this.dicRemoveLevel.length) {
                for (let index = 0; index < this.dicRemoveLevel.length; index++) {
                    const element = this.dicRemoveLevel[index];
                    let removeUrl = getEditLevelUrl(`${element}`)
                    putArr.push(deleteData(removeUrl));
                }
            }

            if (Object.keys(this.dicEditMarginLevel).length) {
                Object.keys(this.dicEditMarginLevel).forEach(item => {
                    let url = item;
                    let dataBody = this.dicEditMarginLevel[item];
                    putArr.push(putData(url, dataBody))
                })
            }
            if (Object.keys(this.dicEditMarginRule).length) {
                Object.keys(this.dicEditMarginRule).forEach(item => {
                    let data = this.dicEditMarginRule[item]
                    let editLevelUrl = getEditRuleLevelUrl(`${data.branch_id}/${data.margin_level}`)
                    let dataBody = {
                        data: {
                            margin_level: data.margin_level,
                            margin_value: data.margin_value,
                            branch_id: data.branch_id,
                            margin_rules: data.margin_rules
                        }
                    }
                    putArr.push(putData(editLevelUrl, dataBody))
                })
            }
            if (Object.keys(this.dicAlertChange).length) {
                Object.keys(this.dicAlertChange).forEach(item => {
                    let data = this.dicAlertChange[item]
                    let editMarginDetailUrl = getEditMarginDetailUrl(`${item}`);
                    let dataBody = {
                        data: {
                            branch_id: item,
                            alert_methods: data.alert || this.dicAlertMethods[item],
                            alert_language: data.language || this.dicLanguage[item]
                        }
                    }
                    putArr.push(putData(editMarginDetailUrl, dataBody))
                })
            }
            this.setState({
                errorOrder: 'lang_updating_margin_control',
                isShowWarning: true,
                haveErrorOrder: false
            }, () => {
                setTimeout(() => {
                    Promise.all(putArr).then((res) => {
                        this.dicRemoveLevel = [];
                        this.dicEditMarginLevel = {};
                        this.dicEditMarginRule = {};
                        Object.keys(this.dicAlertChange).forEach(x => {
                            this.dicAlertMethods[x] = clone(this.dicAlertChange[x].alert)
                            this.dicLanguage[x] = clone(this.dicAlertChange[x].language)
                        })
                        this.dicAlertChange = {}

                        // this.refreshView();
                        // this.getDataMarginControlManagement(false);
                        this.setState({
                            actor: res[0].data.actor,
                            updated: res[0].data.updated,
                            haveErrorOrder: false,
                            isShowWarning: true,
                            activeEdit: false,
                            errorOrder: 'lang_update_margin_successfully'
                        }, () => {
                            let setCol = clone(this.haveRealtime)
                            this.getDataMarginControlManagement(setCol)
                            this.haveRealtime = false;
                            // this.refreshView();
                            this.hiddenWarning()
                        })
                    }).catch((e) => {
                        let error = (e.response && e.response.errorCode) || (e.response && e.response.message) || 'error_code_1700'
                        this.setState({
                            isShowWarning: true,
                            haveErrorOrder: true,
                            errorOrder: mapError(error)
                        }, () => {
                            this.hiddenWarning();
                        })
                    })
                }, 500);
            })
        } else {
            this.setState({
                haveErrorOrder: false,
                isShowWarning: true,
                errorOrder: 'lang_no_change_in_the_margin_control'
            }, () => {
                this.hiddenWarning();
            })
        }
    }

    editGroupMargin() {
        this.setState({
            activeEdit: true
        }, () => {
            this.dicEditDataMargin = clone(this.dicMarginType);
            this.dataOld = clone(this.data)
            this.refreshView()
        })
    }
    cancelAfterEditGroupMargin() {
        this.edit = false;
        this.dicEditMarginRule = {};
        this.dicAlertChange = {};
        this.dicEditMarginLevel = {};
        this.dicRemoveLevel = [];
        this.setState({
            activeEdit: false
        }, () => {
            this.data = clone(this.dataOld)
            // this.setData([]);
            // this.setData(this.dataOld)
            // this.refreshView()
            let setCol = clone(this.haveRealtime)
            this.getDataMarginControlManagement(setCol);
            this.haveRealtime = false;
        })
    }

    getMainMenuItems = (params) => {
        let keyIgnore = ['expandAll', 'resetColumns', 'rowUnGroup'];
        params.defaultItems = params.defaultItems.filter(x => !keyIgnore.includes(x))
        return params.defaultItems
    }

    render() {
        return <div className={`branch-man-wrap qe-widget marginControl ${this.state.connected ? '' : 'disabled-btn'}`}>
            {this.renderHeader()}
            <div className={`content alwaysShow marginControlGrid`} style={{ flex: 1 }}>
                <Grid
                    {...this.props}
                    opt={(opt) => {
                        this.opt = opt
                    }}
                    columns={this.columns}
                    fn={fn => {
                        this.getData = fn.getData
                        this.setData = fn.setData
                        this.setColumn = fn.setColumn
                        this.refreshView = fn.refreshView
                        this.setFilter = fn.setQuickFilter
                        this.updateField = fn.updateField
                        this.remove = fn.remove
                        this.fitAllColumns = fn.fitAllColumns
                    }}
                    fnKey={data => {
                        return data.actions + '|' + data.groupColumn + '|' + data.actionsEnum
                    }}
                    // suppressSingleClickExpand={true}
                    groupDefaultExpanded={-1}
                    multiExpand={true}
                    fixHeightToolbar={0}
                    disableDoulbeClick={true}
                    getMainMenuItems={this.getMainMenuItems}
                    // openBranch={true}
                    animateRows={true}
                    // enableRangeSelection={true}
                    // enableFilter={true}
                    // groupSelectsChildren={true}
                    groupUseEntireRow={true}
                    // suppressRowClickSelection={true}
                    // setExpanded={true}
                    needShowAllColumns={true}
                    openDontFit={true}
                    disableSideBar={true}
                    autoGroupColumnDef={{
                        field: 'actions'
                    }}
                    groupRowInnerRenderer={this.groupRowRenderer}
                    groupRowRendererParams={this.groupRowRendererParams}
                />
            </div>
        </div >
    }
    groupRowRenderer = (params) => {
        let div = document.createElement('div')
        let dataShow = (this.state.activeEdit ? this.dicEditDataMargin[params.node.key] : this.dicMarginType[params.node.key]) || {};
        if (Object.keys(dataShow).length) {
            div.className = 'margin-control-row-group';
            div.classList.add('size--4');
            let textDiv = document.createElement('div');
            let contentTextDiv = document.createElement('div');
            contentTextDiv.className = 'showTitle ';
            textDiv.appendChild(contentTextDiv);
            textDiv.className = 'margin-text-div';
            contentTextDiv.style.color = enumColor[dataShow.margin_type] + '';
            contentTextDiv.style.display = 'inline-block';
            contentTextDiv.innerText = `${formatNumberValue(dataShow.margin_level, true)}% MARGIN ${dataShow.description ? `(${dataShow.description})` : ''}`
            div.appendChild(textDiv)
            if (this.state.activeEdit) {
                let marginActionDiv = document.createElement('div')
                marginActionDiv.className = 'margin-action-btn';
                let drawImg = document.createElement('img');
                drawImg.src = '/common/palette.svg';
                drawImg.classList.add('btn', 'pointer', 'drawImgBtn')
                drawImg.title = 'Edit Colour'
                drawImg.onclick = () => {
                    if (!this.state.connected) return
                    this.params = dataShow;
                    this.editMarginType();
                }
                let editImg = document.createElement('img');
                editImg.src = '/common/pen.svg';
                editImg.classList.add('btn', 'pointer', 'editImgBtn')
                editImg.title = 'Edit Description'
                editImg.onclick = () => {
                    if (!this.state.connected) return
                    this.editDes(dataShow)
                    this.params = dataShow;
                }
                let removeImg = document.createElement('img');
                removeImg.src = '/common/playlist-remove.svg';
                removeImg.classList.add('btn', 'btn-close', 'pointer', 'removeImgBtn')
                removeImg.title = 'Remove'
                removeImg.onclick = () => {
                    if (!this.state.connected) return
                    this.removeMarginLevel(dataShow.margin_level)
                    this.params = dataShow;
                }
                marginActionDiv.appendChild(drawImg);
                marginActionDiv.appendChild(editImg);
                marginActionDiv.appendChild(removeImg);
                div.appendChild(marginActionDiv)
            }
        }
        return div
    }
    editMarginType() {
        if (!this.state.connected) return
        let data = this.params;
        showModal({
            component: PopupEditor,
            props: {
                type: 'chooseColor',
                headerTextFixed: `Colour for  ${data.margin_level}% Margin`,
                label: 'lang_margin_colour',
                options: [
                    { label: enumColor[0], value: 0 },
                    { label: enumColor[1], value: 1 },
                    { label: enumColor[2], value: 2 },
                    { label: enumColor[3], value: 3 },
                    { label: enumColor[4], value: 4 },
                    { label: enumColor[5], value: 5 },
                    { label: enumColor[6], value: 6 },
                    { label: enumColor[7], value: 7 },
                    { label: enumColor[8], value: 8 },
                    { label: enumColor[9], value: 9 },
                    { label: enumColor[10], value: 10 },
                    { label: enumColor[11], value: 11 },
                    { label: enumColor[12], value: 12 },
                    { label: enumColor[13], value: 13 },
                    { label: enumColor[14], value: 14 }
                ],
                fixWidth: true,
                value: data.margin_type,
                valueOld: data.margin_type,
                data,
                onChange: this.editMarginTypeAction.bind(this),
                actionName: 'editMarginType'
            }
        })
    }
    editMarginTypeAction(data) {
        const editUrl = getEditLevelUrl(`${this.params.margin_level}`);
        const dataBody = {
            data: {
                margin_level: this.params.margin_level,
                description: this.params.description,
                margin_type: data
            }
        }
        // this.dicEditMarginLevel[editUrl] = dataBody;
        if (this.dicEditMarginLevel[editUrl]) {
            this.dicEditMarginLevel[editUrl].data.margin_type = data
        } else {
            this.dicEditMarginLevel[editUrl] = dataBody;
        }
        if (this.dicEditDataMargin[this.params.margin_level]) this.dicEditDataMargin[this.params.margin_level].margin_type = data;
        this.refreshView();
    }
    editDesAction = (data) => {
        let editUrl = getEditLevelUrl(`${this.params.margin_level}`);
        let dataBody = {
            data: {
                margin_level: this.params.margin_level,
                description: data,
                margin_type: this.params.margin_type
            }
        }
        if (this.dicEditMarginLevel[editUrl]) {
            this.dicEditMarginLevel[editUrl].data.description = data
        } else {
            this.dicEditMarginLevel[editUrl] = dataBody;
        }
        this.dicEditDataMargin[this.params.margin_level].description = data;
        this.refreshView();
    }

    removeMarginLevel(data) {
        this.dicRemoveLevel.push(data)
        this.remove(this.getData().filter(x => x.groupColumn === data))
    }
    editDes(data) {
        if (!this.state.connected) return
        showModal({
            component: PopupEditor,
            props: {
                type: 'inputText',
                placeholder: '...',
                headerText: `Description for ${data.margin_level}% Margin`,
                // onSuccess: this.editSuccess,
                data,
                actionName: 'editDesAction',
                onChange: this.editDesAction
            }
        })
    }

    createColumnHeader(margin) {
        let data = margin.data;
        let headerData = data.filter((value, index, arr) => index === arr.findIndex((t) => (
            t.branch_id === value.branch_id
        )))
        let column = [];
        column.push({
            headerName: 'lang_actions_list',
            field: 'actions',
            // menuTabs: [],
            minWidth: 120,
            enableRowGroup: false,
            // suppressMovable: true,
            sortable: false,
            cellRenderer: params => {
                const div = document.createElement('div')
                div.classList.add('showTitle')
                div.classList.add('margin-actions-div')
                let data = params.data[params.colDef.field];
                div.innerText = data;
                if (['Close All Position/Holdings', 'Cancel All Open Orders', 'Send Warning', 'Reduce Position Only'].indexOf(data) > -1) div.classList.add('margin-child', 'size--3')
                else div.classList.add('size--4')
                return div;
            }
        }, {
            headerName: 'lang_actions_list',
            field: 'groupColumn',
            minWidth: 120,
            rowGroup: true,
            suppressMovable: true,
            hide: true,
            sortable: false
        });
        for (let index = 0; index < headerData.length; index++) {
            const elm = headerData[index];
            column.push({
                headerName: elm.branch_name,
                field: elm.branch_id,
                sortable: false,
                // suppressMovable: true,
                enableRowGroup: false,
                minWidth: 120,
                cellRenderer: params => {
                    const div = document.createElement('div')
                    div.classList.add('showTitle')
                    let data = params.data[params.colDef.field];
                    if (data) {
                        if (params.data.actions === 'Notifications') {
                            div.classList.remove('showTitle')
                            if (this.state.activeEdit) {
                                ReactDOM.render(<DropDown
                                    className="MultilDropDown"
                                    options={[
                                        {
                                            label: 'lang_sms',
                                            value: 'SEND_SMS',
                                            icon: '/common/sms.svg',
                                            rank: 3
                                        }, {
                                            label: 'lang_push_notification',
                                            value: 'PUSH_NOTIFICATION',
                                            icon: '/common/bell-outline-1.svg',
                                            rank: 2
                                        }, {
                                            label: 'lang_email',
                                            value: 'SEND_EMAIL',
                                            icon: '/common/email.svg',
                                            rank: 1
                                        }
                                    ]}
                                    listDisable={['PUSH_NOTIFICATION', 'SEND_EMAIL']}
                                    multi={true}
                                    hideKey={true}
                                    translate={true}
                                    value={(this.dicAlertChange[params.colDef.field] && this.dicAlertChange[params.colDef.field].alert) || this.dicAlertMethods[params.colDef.field] || data.alert_methods}
                                    onChange={(e) => this.handleOnChangeNotiDropDown(e, params)}
                                />, div)
                            } else {
                                let alertData = this.dicAlertMethods[params.colDef.field] || data.alert_methods;
                                let imgDiv = document.createElement('div');
                                imgDiv.className = 'margin-img';
                                if (Array.isArray(alertData) && alertData.length > 0) {
                                    alertData.forEach(v => {
                                        if (v === 'SEND_EMAIL') imgDiv.innerHTML += `<div class='showTitle'><img src='/common/email.svg' style='height: 17px' /> <div style='opacity:0;position:absolute'>Send Email</div></div>`;
                                        if (v === 'PUSH_NOTIFICATION') imgDiv.innerHTML += `<div class='showTitle'><img src='/common/bell-outline-1.svg' style='height: 17px' /><div style='opacity:0;position:absolute'>Push Notification</div></div>`
                                        if (v === 'SEND_SMS') imgDiv.innerHTML += `<div class='showTitle'><img src='/common/sms.svg' style='height: 17px' /><div style='opacity:0;position:absolute'>Send SMS</div></div>`;
                                    })
                                }
                                div.appendChild(imgDiv)
                            }
                        } else if (params.data.actions === 'Language') {
                            div.classList.remove('showTitle');
                            if (this.state.activeEdit) {
                                ReactDOM.render(<DropDown
                                    translate={true}
                                    className="DropDownOrder"
                                    options={[
                                        {
                                            label: 'lang_chinese',
                                            value: 'cn',
                                            icon: '/flag/cn.png'
                                        }, {
                                            label: 'lang_english',
                                            value: 'en',
                                            icon: '/flag/gb.png'
                                        }, {
                                            label: 'lang_vietnamese',
                                            value: 'vi',
                                            icon: '/flag/vn.png'
                                        }
                                    ]}
                                    value={(this.dicAlertChange[params.colDef.field] && this.dicAlertChange[params.colDef.field].language) || this.dicLanguage[params.colDef.field] || data.alert_language}
                                    onChange={(e, v) => this.handleOnChangeLanguageDropDown(e, params)}
                                />, div)
                            } else {
                                let languageData = clone(this.dicLanguage[params.colDef.field]) || data.alert_language;
                                div.style.display = 'flex';
                                let languageDiv = document.createElement('div');
                                languageDiv.className = 'margin-flag margin-right8';
                                let textDiv = document.createElement('div');
                                textDiv.className = 'margin-flag-text showTitle';
                                div.appendChild(languageDiv);
                                div.appendChild(textDiv);
                                if (languageData === 'en') {
                                    languageDiv.innerHTML = `<img src='flag/gb.png' style='height: 13px;width:20px;position:relative;top:2px' />`;
                                    textDiv.innerText = 'English';
                                } else if (languageData === 'vi') {
                                    languageDiv.innerHTML = `<img src='flag/vn.png' style='height: 13px;width:20px;position:relative;top:2px' />`;
                                    textDiv.innerText = 'Vietnamese'
                                } else {
                                    languageDiv.innerHTML = `<img src='flag/cn.png' style='height: 13px;width:20px;position:relative;top:2px' />`;
                                    textDiv.innerText = 'Chinese';
                                }
                            }
                        } else if (params.data.actions === 'Risk Management' || params.data.actions === 'Pre-Trade Vetting') {
                            div.innerText = '';
                        } else {
                            div.classList.add('margin-checkbox');
                            const check = this.state.activeEdit ? `<img src='/common/checkbox-marked-outline.svg' style='height: 20px' />` : `<img src='common/check.svg' style='height: 20px' />`
                            const uncheck = this.state.activeEdit ? `<img src='/common/outline-check_box_outline_blank.svg' style='height: 20px' />` : '';
                            if (params.data.actionsEnum && data.margin_rules.indexOf(params.data.actionsEnum) > -1) {
                                div.innerHTML = check;
                                div.classList.add('margin-checked')
                            } else {
                                div.innerHTML = uncheck;
                                div.classList.add('margin-unchecked')
                            }
                            if (this.state.activeEdit) {
                                div.onclick = (e) => {
                                    if (e.target.closest('.margin-checked')) {
                                        e.target.closest('.margin-checked').classList.remove('margin-checked');
                                        e.target.closest('.showTitle').classList.add('margin-unchecked');
                                        // e.target.closest('.showTitle').innerHTML = uncheck;
                                        this.opt.api.forEachLeafNode(item => {
                                            if (item.data.actionsEnum === params.data.actionsEnum && item.data.groupColumn === params.data.groupColumn) {
                                                item.data[params.colDef.field].margin_rules.splice(item.data[params.colDef.field].margin_rules.indexOf(params.data.actionsEnum), 1)
                                            }
                                            setTimeout(() => {
                                                this.opt.api && this.opt.api.refreshCells({
                                                    columns: [params.colDef.field],
                                                    force: false
                                                })
                                            }, 100);
                                        })
                                        this.dicEditMarginRule[params.colDef.field + '/' + params.data.groupColumn] = clone(params.data[params.colDef.field]);
                                    } else {
                                        e.target.closest('.margin-unchecked').classList.remove('margin-unchecked')
                                        e.target.closest('.showTitle').classList.add('margin-checked')
                                        // e.target.closest('.showTitle').innerHTML = check;
                                        this.opt.api.forEachLeafNode(item => {
                                            if (item.data.actionsEnum === params.data.actionsEnum && item.data.groupColumn === params.data.groupColumn) {
                                                item.data[params.colDef.field].margin_rules.push(params.data.actionsEnum)
                                            } else if (item.data.actionsEnum === params.data.actionsEnum && item.data.groupColumn !== params.data.groupColumn) {
                                                if (item.data[params.colDef.field].margin_rules.indexOf(params.data.actionsEnum) > -1) {
                                                    item.data[params.colDef.field].margin_rules.splice(item.data[params.colDef.field].margin_rules.indexOf(params.data.actionsEnum), 1)
                                                    this.dicEditMarginRule[params.colDef.field + '/' + item.data.groupColumn] = clone(item.data[params.colDef.field]);
                                                }
                                            }
                                            setTimeout(() => {
                                                this.opt.api && this.opt.api.refreshCells({
                                                    columns: [params.colDef.field],
                                                    force: false
                                                })
                                            }, 100);
                                        })
                                        this.dicEditMarginRule[params.colDef.field + '/' + params.data.groupColumn] = clone(params.data[params.colDef.field]);
                                    }
                                }
                            }
                        }
                    }

                    return div
                },
                valueGetter: params => {
                    return params.data.actionsEnum && params.data[params.colDef.field] && params.data[params.colDef.field].margin_rules && params.data[params.colDef.field].margin_rules.indexOf(params.data.actionsEnum) > -1
                }
            })
        }
        return column;
    }

    handleOnChangeNotiDropDown = (e, data) => {
        if (this.dicAlertChange[data.colDef.field]) {
            this.dicAlertChange[data.colDef.field].alert = e;
        } else {
            this.dicAlertChange[data.colDef.field] = {}
            this.dicAlertChange[data.colDef.field].alert = e;
            this.dicAlertChange[data.colDef.field].language = this.dicLanguage[data.colDef.field];
        }
    }
    handleOnChangeLanguageDropDown = (e, data) => {
        if (this.dicAlertChange[data.colDef.field]) {
            this.dicAlertChange[data.colDef.field].language = e;
        } else {
            this.dicAlertChange[data.colDef.field] = {}
            this.dicAlertChange[data.colDef.field].language = e;
            this.dicAlertChange[data.colDef.field].alert = this.dicAlertMethods[data.colDef.field];
        }
    }

    createDataTemplate(level, margin) {
        let data = [];
        let levelData = level.data.sort((a, b) => a.margin_level - b.margin_level);
        let marginData = margin.data;

        for (let index = 0; index < levelData.length; index++) {
            const elm = levelData[index];
            let dataMap = {};
            this.dicMarginType[elm.margin_level] = elm;
            marginData.forEach(item => {
                this.dicMarginRule[item.branch_id + '/' + item.margin_level] = clone(item.margin_rules);
                if (item.margin_level === elm.margin_level) dataMap[item.branch_id] = item
            });
            let dataRow = [
                Object.assign({ actions: 'Reduce Position Only', groupColumn: elm.margin_level, actionsEnum: 'REDUCE_POSITION_ONLY' }, dataMap),
                Object.assign({ actions: 'Pre-Trade Vetting', groupColumn: elm.margin_level }, dataMap),
                Object.assign({ actions: 'Close All Position/Holdings', groupColumn: elm.margin_level, actionsEnum: 'CLOSE_ALL_POSITION' }, dataMap),
                Object.assign({ actions: 'Cancel All Open Orders', groupColumn: elm.margin_level, actionsEnum: 'CANCEL_ALL_ORDERS' }, dataMap),
                Object.assign({ actions: 'Send Warning', groupColumn: elm.margin_level, actionsEnum: 'SENDING_WARNING' }, dataMap),
                Object.assign({ actions: 'Risk Management', groupColumn: elm.margin_level }, dataMap)
            ]
            data.push.apply(data, dataRow);
        }
        return data;
    }

    async getDataMarginControlManagement(setColumn = true) {
        let marginUrl = getMarginDetailUrl()
        let levelUrl = getMarginLevelUrl()
        let branchInfoUrl = getBranchInfoUrl()
        const [margin = {}, level = {}, branchInfo = {}] = await Promise.all([
            getData(marginUrl),
            getData(levelUrl),
            getData(branchInfoUrl)
        ])
        if (branchInfo.data && branchInfo.data.length > 0) {
            this.dataPin = this.createDataPin(branchInfo.data)
            this.column = this.createColumnHeader(branchInfo)
        } else {
            this.dataPin = [];
            this.column = []
        }
        this.data = [];
        if (setColumn || !this.column.length) {
            this.setColumn([])
            this.setColumn(this.column)
        }
        if (Object.keys(margin).length && margin.data.length && Object.keys(level).length && level.data.length) {
            this.data = this.createDataTemplate(level, margin);
        }
        this.opt && this.opt.api && this.opt.api.setPinnedTopRowData([]);
        this.opt && this.opt.api && this.opt.api.setPinnedTopRowData(this.dataPin);
        if (this.isFirst) {
            if (this.column.length > 0) {
                let dataClone = [...clone(branchInfo.data), ...clone(level.data), ...clone(margin.data)]
                let updated = 0;
                let actor = '';
                dataClone.forEach(elm => {
                    if (updated < elm.updated) {
                        updated = elm.updated;
                        actor = elm.actor
                    }
                });
                this.setState({
                    updated,
                    actor
                })
            }
            this.isFirst = false;
        }
        this.setData([])
        this.setData(this.data);
    }

    createDataPin(data) {
        let dataPin = [];
        let dataDefaultRow = {}
        for (let index = 0; index < data.length; index++) {
            const item = data[index];
            this.dicLanguage[item.branch_id] = item.alert_language;
            this.dicAlertMethods[item.branch_id] = item.alert_methods;
            dataDefaultRow[item.branch_id] = item;
        }
        dataPin.push(
            Object.assign({ actions: 'Notifications' }, dataDefaultRow),
            Object.assign({ actions: 'Language' }, dataDefaultRow)
        )
        return dataPin;
    }
    realTimeData(data, actionNotify, title) {
        if (!this.state.activeEdit) {
            this.setState({
                actor: data.actor,
                updated: data.updated
            }, () => {
                switch (title) {
                    case 'BRANCH#INSERT':
                        // let branchInfoUrl = `${dataStorage.href}/margin/margin-detail/inquery`;
                        // getData(branchInfoUrl).then((res) => {
                        //     this.column = this.createColumnHeader(res)
                        //     this.setColumn(this.column)
                        // })
                        this.getDataMarginControlManagement(true)
                        break;
                    case 'BRANCH#DELETE':
                        // this.column = this.column.filter(x => x.field !== data.branch_id);
                        // this.setColumn([])
                        // this.setColumn(this.column);
                        this.getDataMarginControlManagement(true)
                        break;
                    default:
                        break;
                }
            })
        } else {
            this.haveRealtime = true;
        }
    }
    realTimeLevel(data, actionNotify, title) {
        if (!this.state.activeEdit) {
            this.setState({
                actor: data.actor,
                updated: data.updated
            }, () => {
                switch (title) {
                    case 'MARGIN_GROUP#UPDATE':
                        this.dicAlertMethods[data.branch_id] = data.alert_methods;
                        this.dicLanguage[data.branch_id] = data.alert_language;
                        this.refreshView();
                        break;
                    case 'MARGIN_LEVEL#CREATE':
                        this.getDataMarginControlManagement(false);
                        break;
                    case 'MARGIN_LEVEL#UPDATE':
                        this.dicMarginType[data.margin_level] = data;
                        this.refreshView();
                        break;
                    case 'MARGIN_LEVEL#DELETE':
                        this.remove(this.getData().filter(x => x.groupColumn === data.margin_level));
                        this.data = this.getData();
                        this.refreshView();
                        break;
                    case 'MARGIN_DETAIL#UPDATE':
                        let dataGrid = this.getData().filter(x => x.groupColumn === data.margin_level)
                        if (dataGrid.length) {
                            dataGrid.forEach(x => {
                                x[data.branch_id] = data
                            })
                        }
                        this.refreshView();
                        break;
                    default:
                        break;
                }
            })
        }
    }

    componentDidMount() {
        // const userId = (dataStorage.userInfo && dataStorage.userInfo.user_id) || 0;
        // const initState = this.props.loadState();
        // if (initState.valueFilter) {
        //     setTimeout(() => {
        //         this.setFilter(initState.valueFilter)
        //     }, 1000)
        // }
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
        // this.emitRefreshID = this.accountRefresh && this.accountRefresh.addListener(eventEmitter.REFRESH_DATA_ACCOUNT, this.getAllUserGroupManagement.bind(this));
        if (dataStorage.userInfo) {
            registerBranch(dataStorage.userInfo.user_id, this.realTimeData, 'BRANCH');
            registerBranch(dataStorage.userInfo.user_id, this.realTimeLevel, 'MARGIN_LEVEL');
            registerBranch(dataStorage.userInfo.user_id, this.realTimeLevel, 'MARGIN_DETAIL');
            registerBranch(dataStorage.userInfo.user_id, this.realTimeLevel, 'MARGIN_GROUP');
        }
        this.getDataMarginControlManagement();
        this.refreshView && this.refreshView();
    }
    componentWillUnmount() {
        this.emitConnectionID && this.emitConnectionID.remove();
        if (dataStorage.userInfo) {
            unregisterBranch(dataStorage.userInfo.user_id, this.realTimeData, 'BRANCH');
            unregisterBranch(dataStorage.userInfo.user_id, this.realTimeLevel, 'MARGIN_LEVEL');
            unregisterBranch(dataStorage.userInfo.user_id, this.realTimeLevel, 'MARGIN_DETAIL');
            unregisterBranch(dataStorage.userInfo.user_id, this.realTimeLevel, 'MARGIN_GROUP');
        }
    }
    changeConnection(connect) {
        this.setState({
            connected: connect
        })
    }
}

export default MarginControlManagementHTML
