import React from 'react'
import NoTag from '../Inc/NoTag'
import Icon from '../Inc/Icon'
import showModal from '../Inc/Modal'
import {
    requirePin
} from '../../helper/request'
import {
    postDataSymBolWatchlist,
    actionOpenChart,
    openSecurityDetail,
    openMorningstar,
    openTiprank,
    createNewAlert,
    addComponent
} from '../../components/Inc/Grid/ActionRightClick'
import ConfirmLogout from '../ConfirmLogout'
import dataStorage from '../../dataStorage'
import sideEnum from '../../constants/enum'
import Scroll from '../Inc/Scroll'
import orderType from '../../constants/order_type'
import Auth from '../AuthV2'
import Lang from '../Inc/Lang'
import { checkRole, setLanguage, setFontSize, setTheme, saveDataSetting, enableOrder } from '../../helper/functionUtils'
import Flag from '../Inc/Flag/Flag'

class ExpandRightClick extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            widgetExist: ['Watchlist'],
            widgetName: '',
            visible: false,
            value: ''
        }
        this.dictDataWidget = {}
        if (this.props.fn) {
            this.props.fn({
                setEventValue: this.setEventValue.bind(this)
            })
        }
        this.handlerClickOutside = this.handlerClickOutside.bind(this)
    }
    setEventValue(e) {
        if (!e) {
        } else {
            if (this.props.nameWidget === 'DepthLeft' || this.props.nameWidget === 'DepthRight') {
                this.checkOpenWidget(e)
            }
            this.resizeContextMenu(e)
        }
    }
    contentTarget = (e) => {
        let targetValue = this.props.nameWidget === 'DepthLeft' ? e.target.closest('.rowAllRoot').querySelector('.priceUp') : e.target.closest('.rowAllRoot').querySelector('.priceDown')
        let value = targetValue.innerText || ''
        return value
    }
    checkOpenWidget = (event) => {
        let target = event.target
        let i = 0
        while (i < 20) {
            target = target.parentNode
            if (target.classList.contains('wrapComponent')) {
                this.dictDataWidget = target.react.props.glContainer.getState()
                break
            }
            i++
        }
    }

    resizeContextMenu = (event) => {
        event.preventDefault()
        this.setState({
            visible: true,
            value: this.props.nameWidget !== 'Golden' ? this.contentTarget(event) : ''
        }, () => {
            if (this.props.nameWidget !== 'Golden') {
                dataStorage.openRightClickDepth = true
                let clickX = event.clientX
                let clickY = event.clientY
                let screenW = window.innerWidth
                let screenH = window.innerHeight
                let rootW = this.root.offsetWidth
                let rootH = this.root.offsetHeight
                let right = (screenW - clickX) > rootW
                let left = !right
                let top = (screenH - clickY) > rootH
                let bottom = !top
                if (right) {
                    this.root.style.left = `${clickX + 5}px`
                }
                if (left) {
                    this.root.style.left = `${clickX - rootW - 5}px`
                }
                if (top) {
                    this.root.style.top = `${clickY + 5}px`
                }
                if (bottom) {
                    this.root.style.top = `${clickY - rootH - 5}px`
                }
                this.root.style.position = 'fixed'
            } else {
                let clickX = event.clientX
                let clickY = event.clientY
                let screenW = window.innerWidth
                let screenH = window.innerHeight
                let rootW = this.root.offsetWidth
                let rootH = this.root.offsetHeight
                let right = (screenW - clickX) > rootW
                let left = !right
                let top = (screenH - clickY) > rootH
                let bottom = !top
                if (right) {
                    this.root.style.left = `${clickX + 5}px`
                }
                if (left) {
                    this.root.style.left = `${clickX - rootW - 5}px`
                }
                if (top) {
                    this.root.style.top = `${clickY + 5}px`
                }
                if (bottom) {
                    this.root.style.top = `${clickY - rootH - 5 - 30}px`
                }
                this.root.style.position = 'fixed'
                if (this.root.getElementsByClassName('submenu') && this.root.getElementsByClassName('submenu').length > 0) {
                    if ((screenW - clickX - 532) < 0) {
                        let arrSubmenu = this.root.getElementsByClassName('submenu')
                        for (let i = 0; i < arrSubmenu.length; i++) {
                            arrSubmenu[i].style.left = 'unset'
                            arrSubmenu[i].style.right = '100%'
                        }
                    }
                }
            }
        })
    }
    action = (key) => {
        let inforSymbol = dataStorage.symbolObjDepth
        inforSymbol.isRightClick = true
        if (key === 'Login') {
            showModal({
                component: Auth
            })
        }
        if (key === 'showHidePanel') {
            let newObj = {}
            newObj[`showPanelBuySell`] = !(dataStorage.dataSetting.showPanelBuySell)
            dataStorage.dataSetting.showPanelBuySell = !dataStorage.dataSetting.showPanelBuySell
            saveDataSetting({ data: newObj })
        }
        if (key === 'en' || key === 'cn' || key === 'vi') {
            setLanguage(key, this.props.i18n)
        }
        if (key === 'small' || key === 'medium' || key === 'large') {
            setFontSize(key)
            dataStorage.mainMenuCallBack()
        }
        if (key === 'theme-dark' || key === 'theme-light') {
            setTheme(key)
            dataStorage.mainMenuCallBack()
        }
        if (key === 'Buy') {
            requirePin(() => addComponent('Order', {
                stateOrder: 'NewOrder',
                data: {
                    symbol: inforSymbol.symbol,
                    symbolObj: inforSymbol,
                    side: sideEnum.BUYSIDE
                },
                orderTypeSelection: 'Limit',
                limitPrice: this.state.value,
                color: 5
            }))
        }
        if (key === 'Sell') {
            requirePin(() => addComponent('Order', {
                stateOrder: 'NewOrder',
                data: {
                    symbol: inforSymbol.symbol,
                    symbolObj: inforSymbol,
                    side: sideEnum.SELLSIDE
                },
                orderTypeSelection: 'Limit',
                limitPrice: this.state.value,
                color: 5
            }))
        }
        if (key === 'SellContingent') {
            requirePin(() => addComponent('Order', {
                stateOrder: 'NewOrder',
                contingentOrder: true,
                data: {
                    symbol: inforSymbol.symbol,
                    symbolObj: inforSymbol,
                    side: sideEnum.SELLSIDE
                },
                orderTypeSelection: 'Limit',
                limitPrice: this.state.value,
                color: 5
            }))
        }
        if (key === 'chart') {
            actionOpenChart(inforSymbol)
        }
        if (key === 'SecurityDetail') {
            openSecurityDetail(inforSymbol)
        }
        if (key === 'Morningstar') {
            let dic = {}
            dic[inforSymbol.symbol] = inforSymbol
            openMorningstar(inforSymbol)
        }
        if (key === 'Tiprank') {
            openTiprank(inforSymbol)
        }
        if (key === 'CreateNewAlert') {
            inforSymbol.isRightClick = true
            createNewAlert(inforSymbol)
        }
        if (key === 'Logout') {
            showModal({
                component: ConfirmLogout
            })
        }
        if (key === 'Settings') {
            requirePin(() => addComponent('Settings'))
        }
        this.setState({ visible: false }, () => {
            this.root = null
            dataStorage.openRightClickDepth = false
        })
    }
    actionWatchlist = (item, key, isExistSymbol) => {
        let symbolDepth = dataStorage.symbolObjDepth
        let obj = {
            user_id: dataStorage.userInfo.user_id,
            watchlist: item.watchlist,
            watchlist_name: item.watchlist_name,
            value: [{
                symbol: symbolDepth.symbol,
                rank: new Date().getTime()
            }]
        }
        this.setState({ visible: false }, () => {
            this.root = null
            dataStorage.openRightClickDepth = false
            postDataSymBolWatchlist(obj, isExistSymbol ? 'remove' : 'add')
        })
    }
    isExistSymbol(item) {
        let symbolDepth = dataStorage.symbolObjDepth
        let valueWatchlist = item.value || []
        if (valueWatchlist.length > 0) {
            for (let i = 0; i < valueWatchlist.length; i++) {
                if (valueWatchlist[i].symbol === symbolDepth.symbol) {
                    return true
                }
            }
        }
        return false
    }
    renderDepth = (widget) => {
        const loggedIn = dataStorage.userInfo
        const allowContingent = dataStorage.symbolObjDepth && (dataStorage.symbolObjDepth.class === 'equity' || dataStorage.symbolObjDepth.class === 'future')
        return (<div ref={ref => {
            this.root = ref
        }} className='contextMenu' style={{ height: '208px !important' }}>
            <div className='option flagRightClick bold'>
                <div className='context_text'>{this.dictDataWidget.symbol.display_name ? this.dictDataWidget.symbol.display_name : this.dictDataWidget.symbol.symbol}</div>
                {Flag({ countryCode: null, symbolObj: (this.dictDataWidget.symbol || 'ASX') }) || ''}
            </div>
            {
                checkRole(MapRoleComponent.NEW_ORDER) && enableOrder(dataStorage.accountInfo)
                    ? (widget === 'DepthLeft')
                        ? <div className='option bold_bottom' onClick={() => this.action('Buy')}><Lang>Buy Limit Order at</Lang> {this.state.value}</div>
                        : <div className='option' onClick={() => this.action('Sell')}><Lang>Sell Limit Order at</Lang> {this.state.value}</div>
                    : null
            }
            {
                checkRole(MapRoleComponent.CONTINGENT_ORDER_PAD) && widget !== 'DepthLeft' && enableOrder(dataStorage.accountInfo) && dataStorage.userInfo.addon.includes('A3')
                    ? <div className={'option bold_bottom' + (allowContingent ? '' : 'disabled')} onClick={() => allowContingent && this.action('SellContingent')}><Lang>Sell with Contingent Order at</Lang> {this.state.value}</div> : null
            }
            {
                loggedIn
                    ? checkRole(MapRoleComponent.ChartTV)
                        ? <div className='option' onClick={() => this.action('chart')}><Lang>Chart</Lang></div>
                        : null
                    : null
            }
            {
                checkRole(MapRoleComponent.SecurityDetail)
                    ? <div className='option' onClick={() => this.action('SecurityDetail')}><Lang>lang_security_detail</Lang></div>
                    : null
            }
            {
                dataStorage.userInfo && dataStorage.userInfo.addon && dataStorage.userInfo.addon.includes('A1')
                    ? <div className='option text-capitalize' onClick={() => this.action('Morningstar')}><Lang>lang_morning_star</Lang></div>
                    : null
            }
            {
                dataStorage.userInfo && dataStorage.userInfo.addon && dataStorage.userInfo.addon.includes('A0')
                    ? <div className='option' onClick={() => this.action('Tiprank')}><Lang>lang_tip_rank</Lang></div>
                    : null
            }
            {
                checkRole(MapRoleComponent.NewAlert)
                    ? <div className='option text-capitalize' onClick={() => this.action('CreateNewAlert')}><Lang>Create New Alert</Lang></div>
                    : null
            }
            {
                checkRole(MapRoleComponent.WatchlistBottom)
                    ? <div className='option'>
                        <div className='expand'>
                            <div><Lang>Add to Watchlist</Lang></div>
                            <div className='iconExpand'><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill='#ffffff'><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" /></svg></div>
                        </div>
                        <div className={(dataStorage.watchlist.length && dataStorage.watchlist.length > 6) ? 'submenu qm-scroll1' : 'submenu'}>
                            {
                                dataStorage.watchlist.length > 0 && dataStorage.watchlist.map((item, index) => {
                                    let isExistSymbol = this.isExistSymbol(item)
                                    return <div key={index} className='contextLabel watchlist non-space-between' onClick={() => this.actionWatchlist(item, index, isExistSymbol)}>
                                        {
                                            isExistSymbol === true
                                                ? <div className='icon active'><Icon src="navigation/check" /></div>
                                                : <div className='icon'><Icon src="content/add" /></div>
                                        }
                                        <div className='expand-content'>{item.watchlist_name}</div>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                    : null
            }
        </div >)
    }
    renderFromSwitch = (widget) => {
        switch (widget) {
            case 'DepthLeft':
                return this.renderDepth('DepthLeft')
            case 'DepthRight':
                return this.renderDepth('DepthRight')
            case 'Golden':
                return <div ref={ref => this.root = ref} className='contextMenu golden'>
                    <div className='option'>
                        <div className='expand'>
                            <div><Lang>lang_text_size</Lang></div>
                            <div className='iconExpand goldenEx'><svg xmlns="http://www.w3.org/2000/svg" fill='#7d7d7d' fill='#ffffff' width="17" height="17" viewBox="0 0 24 24" ><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" /></svg></div>
                        </div>
                        <div className='submenu'>
                            <div className={`contextLabel watchlist ${dataStorage.currentFontSize === 'small' ? 'row_active' : ''}`} onClick={() => this.action('small')}>
                                <div className='expand-content'><Lang>Small_Font</Lang></div>
                                {
                                    dataStorage.currentFontSize === 'small'
                                        ? <div className='icon active'><Icon src="navigation/check" /></div>
                                        : ''
                                }
                            </div>
                            <div className={`contextLabel watchlist ${dataStorage.currentFontSize === 'medium' ? 'row_active' : ''}`} onClick={() => this.action('medium')}>
                                <div className='expand-content'><Lang>Medium_Font</Lang></div>
                                {
                                    dataStorage.currentFontSize === 'medium'
                                        ? <div className='icon active'><Icon src="navigation/check" /></div>
                                        : ''
                                }
                            </div>
                            <div className={`contextLabel watchlist ${dataStorage.currentFontSize === 'large' ? 'row_active' : ''}`} onClick={() => this.action('large')}>
                                <div className='expand-content'><Lang>Large_Font</Lang></div>
                                {
                                    dataStorage.currentFontSize === 'large'
                                        ? <div className='icon active'><Icon src="navigation/check" /></div>
                                        : ''
                                }
                            </div>
                        </div>
                    </div>
                    <div className='option'>
                        <div className='expand'>
                            <div><Lang>lang_theme_colour</Lang></div>
                            <div className='iconExpand goldenEx'><svg xmlns="http://www.w3.org/2000/svg" fill='#ffffff' width="17" height="17" viewBox="0 0 24 24" ><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" /></svg></div>
                        </div>
                        <div className='submenu'>
                            <div className={`contextLabel watchlist ${dataStorage.currentTheme === 'theme-dark' ? 'row_active' : ''}`} onClick={() => this.action('theme-dark')}>
                                <div className='expand-content'><Lang>DarkTheme</Lang></div>
                                {
                                    dataStorage.currentTheme === 'theme-dark'
                                        ? <div className='icon active'><Icon src="navigation/check" /></div>
                                        : ''
                                }
                            </div>
                            <div className={`contextLabel watchlist ${dataStorage.currentTheme === 'theme-light' ? 'row_active' : ''}`} onClick={() => this.action('theme-light')}>
                                <div className='expand-content'><Lang>LightTheme</Lang></div>
                                {
                                    dataStorage.currentTheme === 'theme-light'
                                        ? <div className='icon active'><Icon src="navigation/check" /></div>
                                        : ''
                                }
                            </div>
                        </div>
                    </div>
                    <div className='option'>
                        <div className='expand'>
                            <div><Lang>language</Lang></div>
                            <div className='iconExpand goldenEx'><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill='#ffffff' viewBox="0 0 24 24"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" /></svg></div>
                        </div>
                        <div className='submenu'>
                            <div className={`contextLabel watchlist ${dataStorage.currentLang === 'en' ? 'row_active' : ''}`} onClick={() => this.action('en')}>
                                <div className='expand-content'>English</div>
                                {
                                    dataStorage.currentLang === 'en'
                                        ? <div className='icon active'><Icon src="navigation/check" /></div>
                                        : ''
                                }
                            </div>
                            <div className={`contextLabel watchlist ${dataStorage.currentLang === 'cn' ? 'row_active' : ''}`} onClick={() => this.action('cn')}>
                                <div className='expand-content'>中文</div>
                                {
                                    dataStorage.currentLang === 'cn'
                                        ? <div className='icon active'><Icon src="navigation/check" /></div>
                                        : ''
                                }
                            </div>
                            <div className={`contextLabel watchlist ${dataStorage.currentLang === 'vi' ? 'row_active' : ''}`} onClick={() => this.action('vi')}>
                                <div className='expand-content'>Tiếng Việt</div>
                                {
                                    dataStorage.currentLang === 'vi'
                                        ? <div className='icon active'><Icon src="navigation/check" /></div>
                                        : ''
                                }
                            </div>
                        </div>
                    </div>
                    {
                        (dataStorage.dataSetting && dataStorage.dataSetting.checkQuickOrderPad) && (dataStorage.userInfo.user_type === 'operation' || (dataStorage.lstAccountDropdown && dataStorage.lstAccountDropdown.length))
                            ? <div><div className='option text-capitalize' onClick={() => this.action('showHidePanel')}><Lang>{dataStorage.dataSetting.showPanelBuySell ? 'lang_hide_panel_buy_sell' : 'lang_show_panel_buy_sell'}</Lang></div></div>
                            : null
                    }
                    {
                        dataStorage.userInfo && dataStorage.userInfo.user_id && checkRole(MapRoleComponent.SETTING)
                            ? <div className='option' onClick={() => this.action('Settings')}><Lang>Settings</Lang></div>
                            : null
                    }
                    {
                        dataStorage.userInfo && dataStorage.userInfo.user_id
                            ? <div className='option' onClick={() => this.action('Logout')}><Lang>Sign_Out</Lang></div>
                            : <div className='option' onClick={() => this.action('Login')}><Lang>Sign_In</Lang></div>
                    }
                </div>
        }
    }
    handlerClickOutside = (event) => {
        if (this.props.nameWidget !== 'Golden') {
            if (this.root && this.root.classList && this.root.classList.contains('contextMenu') && !this.root.contains(event.target)) {
                this.setState({ visible: false }, () => {
                    this.root = null
                    dataStorage.openRightClickDepth = false
                })
            }
        } else {
            if (this.root && this.root.classList && !this.root.contains(event.target)) {
                this.setState({ visible: false }, () => {
                    this.root = null
                })
            }
        }
    }
    render() {
        const { visible } = this.state
        return (visible || null) && this.renderFromSwitch(this.props.nameWidget)
    }
    componentDidMount() {
        document.addEventListener('mousedown', this.handlerClickOutside)
    }
}
export default ExpandRightClick
