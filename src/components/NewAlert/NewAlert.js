import React from 'react';
import {
    postData,
    getUrlAlert,
    putData
} from '../../helper/request'
import {
    formatCompanyName,
    clone,
    checkRole,
    formatNumberPrice
} from '../../helper/functionUtils'
import NewInputDropDown from '../NewInputDropdown';
import NewDropdown from '../MultiDropdownSupportFilter/NewDropdown';
import dataStorage from '../../dataStorage';
import SearchBox from '../SearchBox';
import TablePrice from '../TablePriceAlert';
import logger from '../../helper/log';
import Lang from '../Inc/Lang/Lang';
import SecurityDetailIcon from '../Inc/SecurityDetailIcon/SecurityDetailIcon';
import Toggle from '../Inc/Toggle';
import Icon from '../Inc/Icon';
import Flag from '../Inc/Flag';
import DropDown from '../DropDown';
import NoTag from '../Inc/NoTag';
import { unregisterUser, registerUser } from '../../streaming';
import {
    optionsTrigger,
    optionsAlertType,
    optionsRepeat,
    optionsTargetNews,
    optionsTargetNewsFixTop,
    optionsTarget,
    optionsTargetFuture
} from './enum'
import EditEmailNotification from '../UserInfor/EditEmailNotification';
import showModal from '../Inc/Modal/Modal';
import MapRoleComponent from '../../constants/map_role_component';
import moment from 'moment';
import { addEventListener, EVENTNAME } from '../../helper/event'
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon';

const numberTargetNew = Object.keys(optionsTargetNewsFixTop).length + Object.keys(optionsTargetNews).length
const TIMEOUT_DEFAULT = 20000
export class NewAlert extends React.Component {
    constructor(props) {
        super(props);
        this.initState = props.loadState()
        this.disableArowIconDropdown = this.initState.isModifyAlert ? this.checkDisableArowIconDropdown(this.initState.data.alert_type) : false
        this.formatType = 'price'
        this.objSwith = this.initState.data ? this.setobjSwith() : { 'EMAIL': true, 'NOTIFICATION': true }
        this.user_id = dataStorage.userInfo.user_id
        this.oldObjModify = {}
        this.newObjModify = {}
        this.errClass = ''
        this.isMin = 0
        this.parent = this.props.glContainer.parent
        this.state = {
            isConnected: dataStorage.connected,
            symbol: '',
            idShowWarning: false,
            loadingConfirm: false,
            haveError: true,
            symbolObj: {},
            alert_type: this.initState.isModifyAlert ? this.setStateAlertType() : 'LAST_PRICE',
            alert_trigger: this.initState.isModifyAlert ? this.initState.data.alert_trigger : 'AT_OR_ABOVE',
            target_news: this.initState.isModifyAlert ? this.setStateTargetNews() : ['Everything'],
            target_value: this.initState.isModifyAlert ? this.setStateTarget('target_value') : 0,
            target: this.initState.isModifyAlert ? this.setStateTarget() : 'USER_INPUT',
            alert_repeat: (this.initState.isModifyAlert && this.initState.data.alert_repeat) || 'EVERYTIME',
            email_alert: dataStorage.userInfo.email_alert,
            checkSwith: true,
            data: {},
            isModify: this.initState.isModifyAlert ? 0 : 1,
            isClickConfirm: false,
            isCheckConnect: false
        };
        if (this.initState.isModifyAlert) this.props.confirmClose(() => true)
        this.props.receive({
            symbol: this.changeValue
        });
    }
    setobjSwith = () => {
        if (!this.initState.data.method) {
            return { 'EMAIL': true, 'NOTIFICATION': true }
        }
        const objSwith = { 'EMAIL': false, 'NOTIFICATION': false }
        Object.keys(objSwith).map(item => {
            if (this.initState.data.method.indexOf(item) > -1) objSwith[item] = true
            else delete objSwith[item]
        })
        return objSwith
    }

    setStateAlertType = () => {
        this.formatType = this.checkFormatType(this.initState.data.alert_type)
        if (this.initState.data.alert_type === 'CHANGE_POINT' || this.initState.data.alert_type === 'CHANGE_PERCENT') this.isMin = 1
        else this.isMin = 0
        return this.initState.data.alert_type
    }

    setStateTargetNews = () => {
        if (this.initState.data.alert_type === 'NEWS') return this.initState.data.target
        return ['Everything']
    }

    setStateTarget = (targetValue) => {
        const arrtarget = [
            'YESTERDAY_OPEN',
            'YESTERDAY_HIGH',
            'YESTERDAY_LOW',
            'YESTERDAY_CLOSE',
            'YESTERDAY_SETTLEMENT',
            'WEEK_52_HIGH',
            'WEEK_52_LOW',
            'TODAY_OPEN',
            'TODAY_HIGH',
            'TODAY_LOW'
        ]
        if (arrtarget.indexOf(this.initState.data.target) > -1) {
            return this.initState.data.target
        } else {
            if (targetValue) return this.initState.data.target
            else return 'USER_INPUT'
        }
    }
    changeValue = (symbolObj) => {
        try {
            if ((this.state.alert_type === undefined) && (this.state.alert_trigger === undefined)) {
                this.setState({
                    alert_type: 'LAST_PRICE',
                    alert_trigger: 'AT_OR_ABOVE'
                })
            }
            // if (symbolObj.symbol === this.state.symbolObj.symbol) return;
            this.dataReceivedFromSearchBox(symbolObj)
        } catch (error) {
            logger.error('changeValue On NewAlert', error)
        }
    }

    dataReceivedFromSearchBox = (symbolObj, isDelete) => {
        try {
            this.needToRefresh = true
            if (isDelete) {
                this.props.saveState({
                    isDelete: true
                });
                this.setState({
                    data: {},
                    symbolObj: {}
                })
            } else {
                this.setState({
                    symbolObj: symbolObj,
                    symbol: symbolObj.symbol
                })
                if (symbolObj && symbolObj.symbol) {
                    dataStorage.symbolsObjDic[symbolObj.symbol] = symbolObj
                    this.props.send({
                        symbol: symbolObj
                    })
                }
                this.props.saveState({
                    data: {
                        symbol: (symbolObj && symbolObj.symbol) || ''
                    }
                })
            }
        } catch (error) {
            logger.error('dataReceivedFromSearchBox On NewAlert ' + error)
        }
    }

    editEmailNoti() {
        showModal({
            component: EditEmailNotification,
            props: {
                paramId: dataStorage.userInfo.user_id,
                headerText: 'lang_change_email_notifications',
                middleText: 'lang_please_enter_your_new_email'
            }
        })
    }

    swithInput = (e, swithName) => {
        if (e.target.checked) this.objSwith[swithName] = e.target.checked
        else delete this.objSwith[swithName]
        if (Object.keys(this.objSwith).length) this.setState({ checkSwith: true })
        else this.setState({ checkSwith: false })
        this.setState({ isModify: this.checkModify() })
    }

    realTimeEmail = (data) => {
        if (data.email_alert !== this.state.email_alert) this.setState({ email_alert: data.email_alert })
    }

    realtimeData = (data, action) => {
        if (action === 'DELETE' && this.initState.isModifyAlert) {
            if (data.alert_id === this.initState.alert_id) this.parent.remove()
        }
    }

    componentWillUnmount() {
        try {
            const userId = dataStorage.userInfo && dataStorage.userInfo.user_id;
            unregisterUser(userId, this.realTimeEmail, 'user_detail');
            unregisterUser(this.user_id, this.realtimeData, 'ALERT');

            addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
        } catch (error) {
            logger.error('componentWillUnmount On NewAlert ' + error)
        }
    }

    onChangeInput = (value) => {
        this.setState({ target_value: value })
        this.newObjModify.target = value
        if (this.initState.isModifyAlert) this.setState({ isModify: this.checkModify() })
    }

    handleOnChangeState = (value, field) => {
        this.errClass = '';
        const state = {};
        switch (field) {
            case 'alert_type':
                this.disableArowIconDropdown = this.checkDisableArowIconDropdown(value)
                this.formatType = this.checkFormatType(value)
                Object.assign(state, { alert_type: value, target_value: 0, target_news: ['Everything'] })
                this.newObjModify.alert_type = value
                if (this.state.target === 'USER_INPUT') this.newObjModify.target = 0
                else this.newObjModify.target = value
                if (value === 'CHANGE_POINT' || value === 'CHANGE_PERCENT') this.isMin = 1
                else this.isMin = 0
                if (value === 'NEWS') {
                    Object.assign(state, { alert_trigger: 'PriceSensitive' })
                    this.newObjModify.alert_trigger = 'PriceSensitive'
                } else {
                    Object.assign(state, { alert_trigger: 'AT_OR_ABOVE' })
                    this.newObjModify.alert_trigger = 'AT_OR_ABOVE'
                }
                break;
            case 'target':
                Object.assign(state, { target: value, target_value: 0 })
                if (value === 'USER_INPUT') this.newObjModify.target = Number(this.state.target_value)
                else this.newObjModify.target = value
                break;
            case 'alert_trigger':
                Object.assign(state, { alert_trigger: value })
                this.newObjModify.alert_trigger = value
                break;
            case 'target_news':
                Object.assign(state, { target_news: value })
                this.newObjModify.target = value.sort()
                break;
            case 'alert_repeat':
                Object.assign(state, { alert_repeat: value })
                this.newObjModify.alert_repeat = value
                break;
            default:
                break;
        }
        if (this.initState.isModifyAlert) state.isModify = this.checkModify();
        this.setState(state)
        this.closeDropdown1 && this.closeDropdown1()
        this.closeDropdown2 && this.closeDropdown2()
    }

    checkModify = () => {
        this.newObjModify.method = this.createMethod()
        if (this.newObjModify.target === 0) this.newObjModify.target = '0'
        if (JSON.stringify(this.oldObjModify) === JSON.stringify(this.newObjModify)) return 0
        else return 1
    }

    setOptionTrigger = () => {
        if (this.state.alert_type === 'NEWS') {
            return [
                {
                    label: 'lang_sensitive_only',
                    value: 'PriceSensitive'
                },
                {
                    label: 'lang_all_news',
                    value: 'AllNew'
                }
            ]
        } else {
            return optionsTrigger
        }
    }

    setOptionsTarget = (options) => {
        const op = []
        options.map(item => {
            const obj = {
                value: item.value,
                label: dataStorage.translate(item.label),
                className: item.className
            }
            if (item.value === 'Everything') obj.all = true
            op.push(obj)
        })
        return op
    }

    checkDisableArowIconDropdown = (value) => {
        this.setState({ target: 'USER_INPUT' })
        if ([
            'BID_PRICE',
            'OFFER_PRICE',
            'CHANGE_POINT',
            'CHANGE_PERCENT',
            'TODAY_VOLUME'
        ].indexOf(value) > -1) return true
        else return false
    }

    checkFormatType = (value) => {
        const objType = {
            'LAST_PRICE': 'price',
            'BID_PRICE': 'price',
            'OFFER_PRICE': 'price',
            'CHANGE_POINT': 'price',
            'CHANGE_PERCENT': 'value%',
            'TODAY_VOLUME': 'volumn'
        }
        return objType[value]
    }

    hiddenWarning = (isClearData) => {
        try {
            this.errClass = ''
            if (isClearData && !this.initState.isModifyAlert) this.clearData()
            setTimeout(() => {
                this.setState({ idShowWarning: false })
                if (isClearData && this.initState.isModifyAlert) this.props.glContainer.parent.remove()
            }, 4000)
        } catch (error) {
            logger.error('hiddenWarning On NewAlert ' + error)
        }
    }

    connectionChanged = (isConnected) => {
        if (!isConnected !== !this.state.isConnected) {
            this.setState({
                isConnected,
                checkConnection: true
            }, () => {
                if (isConnected && this.state.checkConnection && this.state.isClickConfirm) {
                    this.confirmAlert();
                    this.setState({ checkConnection: false, isClickConfirm: false })
                }
            })
        }
    }

    confirmAlert = () => {
        let url, method
        if (this.initState.isModifyAlert) {
            if (!checkRole(MapRoleComponent.MODIFY_ALERT)) return
        } else {
            if (!checkRole(MapRoleComponent.NEW_ALERT)) return
        }
        if (!this.state.symbolObj.symbol) {
            this.errClass = 'errNoneSymbol'
            this.setState({
                error: 'CodeMustBeSelectedFirst',
                haveError: true,
                idShowWarning: true
            }, () => this.hiddenWarning())
            return true;
        }
        if (!this.state.target_news.length && this.state.alert_type === 'NEWS') {
            this.errClass = 'errNoneTarget'
            this.setState({
                error: 'error_code_2103',
                haveError: true,
                idShowWarning: true
            }, () => this.hiddenWarning())
            return true;
        }
        this.timeoutRequest = setTimeout(() => {
            this.setState({
                error: 'lang_timeout_cannot_be_connected_server',
                idShowWarning: true,
                loadingConfirm: false,
                haveError: true,
                isDisplayBtn: !this.state.isDisplayBtn
            }, () => this.hiddenWarning())
        }, TIMEOUT_DEFAULT)
        this.setState({
            error: this.initState.isModifyAlert ? 'lang_modifying_alert' : 'lang_creating_new_alert',
            idShowWarning: true,
            loadingConfirm: true,
            haveError: false
        })
        const objDataSend = this.createObjDataSend()
        if (this.initState.isModifyAlert) {
            method = putData
            url = getUrlAlert('?user_id=' + this.user_id + '&alert_id=' + this.initState.data.alert_id)
        } else {
            method = postData
            url = getUrlAlert('/' + this.user_id)
        }
        method(url, { data: objDataSend }).then(() => {
            clearTimeout(this.timeoutRequest)
            this.setState({
                error: this.initState.isModifyAlert ? 'lang_modifying_alert_successfully' : `lang_create_new_alert_successfully`,
                idShowWarning: true,
                loadingConfirm: false,
                haveError: false
            }, () => this.hiddenWarning(true))
        }).catch(e => {
            clearTimeout(this.timeoutRequest)
            this.setState({
                error: `error_code_${e.response.errorCode}`,
                idShowWarning: true,
                loadingConfirm: false,
                haveError: true
            }, () => this.hiddenWarning())
        })
        this.state.isConnected && !this.state.checkConnection && this.setState({ isClickConfirm: false })
    }

    createObjDataSend = () => {
        const objDataSend = {}
        if (!this.initState.isModifyAlert) objDataSend.symbol = this.state.symbolObj.symbol
        objDataSend.alert_type = this.state.alert_type
        objDataSend.alert_trigger = this.state.alert_trigger
        if (this.state.alert_type === 'NEWS') {
            objDataSend.target = this.state.target_news
            objDataSend.alert_repeat = this.state.alert_repeat
        } else {
            objDataSend.target = this.state.target
            if (this.state.target === 'USER_INPUT') objDataSend.target_value = Number(this.state.target_value) || 0
        }
        objDataSend.status = this.initState.data ? this.initState.data.status : 1
        objDataSend.method = this.createMethod()
        return objDataSend
    }

    createMethod = () => {
        const arrayMethod = []
        Object.keys(this.objSwith).map(item => {
            arrayMethod.push(item)
        })
        return arrayMethod.sort()
    }

    clearData = () => {
        this.formatType = 'price'
        this.disableArowIconDropdown = false
        this.isMin = 0
        this.setState({
            symbolObj: {},
            symbol: '',
            alert_type: 'LAST_PRICE',
            alert_trigger: 'AT_OR_ABOVE',
            target_news: ['Everything'],
            target_value: 0,
            target: 'USER_INPUT',
            alert_repeat: 'EVERYTIME',
            data: {}
        })
    }

    render() {
        let roleClass
        if (this.initState.isModifyAlert) {
            if (!checkRole(MapRoleComponent.MODIFY_ALERT)) roleClass = 'disable'
        } else {
            if (!checkRole(MapRoleComponent.NEW_ALERT)) roleClass = 'disable'
        }
        try {
            const companyName = formatCompanyName(this.state.symbolObj)
            const displayName = (this.state.symbolObj && this.state.symbolObj.display_name) || ''
            const classSymbol = (this.state.symbolObj && this.state.symbolObj.class) || ''
            return (
                <div className={`newOrderContainer new-alert size--4`}>
                    <div style={{ height: '100%' }}>
                        <div className={`newOrderRoot ${this.errClass}`}>
                            <div className='body'>
                                <div id='Scroll_Root_NewOrder'>
                                    <div className={`errorOrder size--3 ${this.state.idShowWarning ? '' : 'myHidden'}  ${this.state.haveError ? '' : 'yellow'}`}><Lang>{this.state.error}</Lang></div>
                                    <div className='newOrderWigetContainer'>
                                        <div className='newOrderBody size--3'>
                                            <div>
                                                <Toggle className='title' nameToggle='lang_security_infomation' />
                                                <div className='container'>
                                                    <div>
                                                        <div className='rowOrderPad changeColorHover'>
                                                            <div className={`showTitle text-capitalize`}>{<Lang>lang_code</Lang>}</div>
                                                            <div className={`newOrder-code-security`}>
                                                                {
                                                                    this.initState.isModifyAlert
                                                                        ? <NoTag>{displayName}<span style={{ marginRight: '8px' }}></span><Flag symbolObj={this.state.symbolObj} /></NoTag>
                                                                        : <SearchBox
                                                                            allowDelete={true}
                                                                            resize={this.props.resize}
                                                                            loading={this.props.loading}
                                                                            obj={this.state.symbolObj}
                                                                            symbol={this.state.symbol}
                                                                            display_name={displayName}
                                                                            dataReceivedFromSearchBox={this.dataReceivedFromSearchBox.bind(this)}
                                                                        />
                                                                }
                                                            </div>
                                                        </div>
                                                        {
                                                            displayName
                                                                ? <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_security</Lang>}</div>
                                                                    <div className='showTitle size--3 changeColorHover flexVerticalCenter'>
                                                                        <div>{companyName.toUpperCase()}</div>
                                                                        <SecurityDetailIcon
                                                                            {...this.props}
                                                                            symbolObj={this.state.symbolObj}
                                                                            iconStyle={{ position: 'unset', top: 'unset', transform: 'unset', marginLeft: 8 }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                : null
                                                        }
                                                        {
                                                            classSymbol === 'warrant' || classSymbol === 'option'
                                                                ? <NoTag>
                                                                    <div className="rowOrderPad changeColorHover">
                                                                        <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_underlying_asset</Lang>}</div>
                                                                        <div className='showTitle size--3 changeColorHover symbolflag'>{this.state.symbolObj.display_name.toUpperCase()} <Flag symbolObj={this.state.symbolObj} /></div>
                                                                    </div>
                                                                    <div className="rowOrderPad changeColorHover">
                                                                        <div className='showTitle leftRowOrderPad'>P/C</div>
                                                                        <div className='showTitle size--3 changeColorHover'>--</div>
                                                                    </div>
                                                                    <div className="rowOrderPad changeColorHover">
                                                                        <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_strike_price</Lang>}</div>
                                                                        <div className='showTitle size--3 changeColorHover'>{this.state.data.trade_price ? formatNumberPrice(this.state.data.trade_price, true) : '--'}</div>
                                                                    </div>
                                                                </NoTag>
                                                                : null
                                                        }
                                                        {
                                                            classSymbol === 'future'
                                                                ? <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_settlement_price</Lang>}</div>
                                                                    <div className='showTitle size--3 changeColorHover'>--</div>
                                                                </div>
                                                                : null
                                                        }
                                                        {
                                                            classSymbol === 'future' || classSymbol === 'warrant' || classSymbol === 'option'
                                                                ? <div className="rowOrderPad changeColorHover">
                                                                    <div className='showTitle leftRowOrderPad'>{<Lang>lang_expiry_date</Lang>}</div>
                                                                    <div className='showTitle size--3 changeColorHover'>{this.state.symbolObj.expiry_date ? moment(this.state.symbolObj.expiry_date).format('MMM YYYY') : '--'}</div>
                                                                </div>
                                                                : null
                                                        }
                                                    </div>
                                                    <div>
                                                        <TablePrice symbolObj={this.state.symbolObj} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <Toggle className='title' nameToggle='lang_alert_information' />
                                                <div className='container'>
                                                    <div>
                                                        <div className='rowOrderPad changeColorHover'>
                                                            <div className='showTitle text-capitalize'>{<Lang>lang_alert_type</Lang>}</div>
                                                            <div style={{ minWidth: 160 }}>
                                                                <DropDown
                                                                    translate={true}
                                                                    options={optionsAlertType}
                                                                    value={this.state.alert_type || 'LAST_PRICE'}
                                                                    onChange={e => this.handleOnChangeState(e, 'alert_type')}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className='rowOrderPad changeColorHover'>
                                                            <div className='showTitle text-capitalize'>{<Lang>lang_trigger</Lang>}</div>
                                                            <div style={{ minWidth: 160 }}>
                                                                <DropDown
                                                                    translate={true}
                                                                    options={this.setOptionTrigger()}
                                                                    value={this.state.alert_trigger || 'AT_OR_ABOVE'}
                                                                    onChange={e => this.handleOnChangeState(e, 'alert_trigger')}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {
                                                            this.state.alert_type === 'NEWS'
                                                                ? <NoTag>
                                                                    <div className='rowOrderPad fixWidthDropdown changeColorHover'>
                                                                        <div className='showTitle text-capitalize'> <Lang>lang_target_news</Lang>&nbsp;
                                                                            ({
                                                                                this.state.target_news.indexOf('Everything') > -1
                                                                                    ? numberTargetNew + 1
                                                                                    : this.state.target_news.length
                                                                            })
                                                                        </div>
                                                                        <div className={this.errClass}>
                                                                            <NewDropdown
                                                                                options={this.setOptionsTarget(optionsTargetNews)}
                                                                                optionsFixTop={this.setOptionsTarget(optionsTargetNewsFixTop)}
                                                                                value={this.state.target_news}
                                                                                onChange={e => this.handleOnChangeState(e, 'target_news')}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className='rowOrderPad changeColorHover'>
                                                                        <div className='showTitle text-capitalize'>{<Lang>lang_repeat</Lang>}</div>
                                                                        <div>
                                                                            <DropDown
                                                                                translate={true}
                                                                                options={optionsRepeat}
                                                                                value={this.state.alert_repeat}
                                                                                onChange={e => this.handleOnChangeState(e, 'alert_repeat')}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </NoTag>
                                                                : <div className='rowOrderPad changeColorHover'>
                                                                    <div className='showTitle text-capitalize'> <Lang>lang_target_value</Lang></div>
                                                                    <div>
                                                                        <NewInputDropDown
                                                                            skipnull={true}
                                                                            translate={true}
                                                                            className="DropDownOrderType"
                                                                            scroll={true}
                                                                            stateName='target'
                                                                            options={classSymbol === 'future' ? optionsTargetFuture : optionsTarget}
                                                                            disableArowIconDropdown={this.disableArowIconDropdown}
                                                                            formatType={this.formatType}
                                                                            value={this.state.target}
                                                                            valueInput={this.state.target_value}
                                                                            isMin={this.isMin}
                                                                            onChange={this.handleOnChangeState.bind(this)}
                                                                            onChangeInput={this.onChangeInput.bind(this)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <Toggle className='title' nameToggle='lang_delivery_method' />
                                                <div className='container'>
                                                    <div>
                                                        <div className="rowOrderPad changeColorHover">
                                                            <div className='leftRowOrderPad email-lable'>
                                                                <span className='showTitle text-capitalize'>{<Lang>lang_email</Lang>}: </span>
                                                                <label className='showTitle'>{this.state.email_alert}</label>
                                                                <span className="editEmail" title='Edit' onClick={() => this.editEmailNoti()}>
                                                                    <SvgIcon path={path.mdiPencil} />
                                                                </span>
                                                            </div>
                                                            <div className='showTitle'>
                                                                <label className="switch">
                                                                    {
                                                                        this.objSwith && this.objSwith.EMAIL
                                                                            ? <NoTag><input defaultChecked onClick={(e) => this.swithInput(e, 'EMAIL')} type="checkbox" /> <span className="slider"></span></NoTag>
                                                                            : <NoTag><input onClick={(e) => this.swithInput(e, 'EMAIL')} type="checkbox" /> <span className="slider"></span></NoTag>
                                                                    }
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="rowOrderPad changeColorHover">
                                                            <div className='showTitle leftRowOrderPad text-capitalize'>{<Lang>lang_push_notification</Lang>}</div>
                                                            <div className='showTitle'>
                                                                <label className="switch">
                                                                    {
                                                                        this.objSwith && this.objSwith.NOTIFICATION
                                                                            ? <NoTag><input defaultChecked onClick={(e) => this.swithInput(e, 'NOTIFICATION')} type="checkbox" /> <span className="slider"></span></NoTag>
                                                                            : <NoTag><input onClick={(e) => this.swithInput(e, 'NOTIFICATION')} type="checkbox" /> <span className="slider"></span></NoTag>
                                                                    }
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='footer'>
                                <div className='line'></div>
                                <div>
                                    <div className={`bigButtonOrder ${(!this.state.checkSwith || !this.state.isConnected || !this.state.isModify) ? 'disable' : ''} ${roleClass}`} onClick={() => {
                                        this.setState({ isClickConfirm: true }, () => {
                                            if (!this.state.checkSwith || !this.state.isConnected || this.state.loadingConfirm) return;
                                            this.confirmAlert();
                                        })
                                    }} >
                                        <div>
                                            <span className='size--4 text-uppercase'>{this.state.loadingConfirm ? <img src='common/Spinner-white.svg' /> : null} {<Lang>lang_confirm</Lang>}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            )
        } catch (error) {
            logger.error('render On NewAlert ' + error)
        }
    }

    createOldObj = () => {
        let data = clone(this.initState.data)
        if (this.initState.data.symbolObj) {
            data = this.initState.data.symbolObj
        }
        this.oldObjModify.alert_type = data.alert_type
        this.oldObjModify.alert_trigger = data.alert_trigger
        if (data.alert_type === 'NEWS') {
            this.oldObjModify.target = data.target.sort()
            this.oldObjModify.alert_repeat = data.alert_repeat
        } else {
            this.oldObjModify.target = data.target + ''
        }
        this.oldObjModify.method = data.method.sort()
    }

    createNewObj = () => {
        this.newObjModify.alert_type = this.state.alert_type
        this.newObjModify.alert_trigger = this.state.alert_trigger
        if (this.state.alert_type === 'NEWS') {
            this.newObjModify.target = this.state.target_news.sort()
            this.newObjModify.alert_repeat = this.state.alert_repeat
        } else {
            if (this.state.target === 'USER_INPUT') this.newObjModify.target = this.state.target_value || 0
            else this.newObjModify.target = this.state.target
        }
        this.newObjModify.method = this.createMethod()
    }

    componentDidMount() {
        try {
            const userId = dataStorage.userInfo && dataStorage.userInfo.user_id;
            registerUser(userId, this.realTimeEmail, 'user_detail');
            registerUser(this.user_id, this.realtimeData, 'ALERT');
            addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
            if (this.initState.isModifyAlert) {
                this.dataReceivedFromSearchBox(this.initState.symbolObj)
                this.createOldObj()
                this.createNewObj()
            }
        } catch (error) {
            logger.error('componentDidMount On NewAlert ' + error)
        }
    }
}

export default NewAlert
