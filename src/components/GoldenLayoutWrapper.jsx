import React from 'react';
import GoldenLayout from 'golden-layout';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Header from './Header'
import Footer from './Footer'
import Icon from './Inc/Icon';
import Notification from './Notification';
import formState from '../constants/form_state';
import requireTime from '../constants/require_time';
import role from '../constants/role';
import uuidv4 from 'uuid/v4';
import {
    emitter,
    emitterRefresh,
    eventEmitter,
    emitterChangeAccount
} from '../constants/emitter_enum';
import { EventEmitter } from 'fbemitter';
import { func } from '../storage';
import dataStorage from '../dataStorage';
import colorLink from '../constants/color_link_key';
import warning from '../components/Inc/Warning';
import {
    checkNetworkConnection,
    handleNetwork,
    getDataLayout,
    todo,
    autoLoginWithoutVerifyPin,
    checkRoleWidget,
    checkShowAccountSearch,
    checkTheme,
    saveDataSetting,
    setFontSize,
    setTheme,
    setLanguage,
    logout,
    getSecretKey,
    clone,
    checkRole,
    getSymbolAccountWhenFirstOpenLayout,
    resetAccountOfLayout,
    setEnvConfig,
    resetSymbolOfLayout,
    enableOrder,
    createContextMenu,
    closeChartLayout,
    addEventHubListener,
    checkShowOpeningAccount,
    saveDataWhenChangeEnv,
    getIpPublish
} from '../helper/functionUtils';
import { registerUser } from '../streaming';
import { getData, getUrlAnAccount, makeSymbolUrl, requirePin, getAllAccountNewUrl, getCheckTokenUrl } from '../helper/request';
import config from '../../public/config';
import logger from '../helper/log';
import * as apiHelper from '../helper/api';
import layoutConfig from '../layoutConfig';
import Lang from './Inc/Lang';
import showModal from './Inc/Modal';
import showWindow from '../components/Window/window';
import showPanel from '../components/PanelBuySell/PanelBuySell'
import Pin from './Pin';
import Terms from './../../Terms/Terms';
import Settings from './Settings';
import WhatsNew from './WhatsNew';
import { translate } from 'react-i18next';
import CreateUser from './CreateUserDetail/UserDetail';
import CreateUserNew from './CreateUserDetail/CreateUser';
import Empty from './Empty';
import MarketOverview from './MarketOverview';
import WatchlistBottom from './WatchlistBottom/WatchlistBottom';
import PortfolioSummary from './PortfolioSummary/PortfolioSummary';
import ChartTV from './ChartTV/TVChartContainer';
import Truong from './TruongHoang';
import OrderList from './OrderList';
import MorningStar from './MorningStar';
import TipRank from './TipRank';
import UserManager from './UserManager';
import CourseOfSale from './CourseOfSale';
import MarketDepth from './MarketDepth';
import NewReport from './ReportsTab/NewReportTab';
import Report from './ReportsTab';
// import ContractNote from './ContractNote/ContractNote';
import ContractNote from './ContractNote/NewContractNote';
import RelatedNews from './News/NewNews';
import Order from './Order';
import QuickOrderPad from './QuickOrderPad';
import QuickCancelOrder from './QuickCancelOrder';
import Portfolio from './Portfolio';
import AllHoldings from './AllHoldings';
import AllOrders from './AllOrders';
import AccountInfo from './AccountInfo/AccountInfo';
import OrderPadV2 from './OrderPadV2/OrderPadV2';
import BuySellPanel from './BuySellPanel/BuySellPanel';
import AccountDetail from './AccountDetail/AccountDetail';
import AccountDetailNew from './AccountDetailNew/AccountDetail';
import UserAccount from './UserAccount/UserAccount';
import Activities from './Activities/Activities';
import AccountManager from './AccountManager/AccountManager'
import NewAccountManager from './AccountManager/NewAccountManager'
import UserGroupManagement from './UserGroupManagement';
import VettingRulesManagement from './BranchManagement/VettingRulesManagement';
import MarketDataManagement from './MarketDataManagement';
import MarketDataManagementNew from './MarketDataManagement/MarketDataManagementNew';
import SecurityDetail from './NewSecurityDetail/NewSecurityDetail'
import ContractList from '../components/ContractList'
import MapRoleComponent from '../constants/map_role_component'
import MapAddonComponent from '../constants/map_addon_component'
import UserInfor from './UserInfor/UserInfor'
import BrokerDataReports from './BrokerDataReports/BrokerDataReports'
import AlertList from './AlertList/NewAlertList'
import NewAlert from './NewAlert/NewAlert'
import DemoNewPicker from './DemoNewPicker/DemoNewPicker'
import userRoles from '../constants/user_roles';
import Confirm from '../components/Inc/Confirm';
import moment from 'moment-timezone';
import userTypeEnum from '../constants/user_type_enum';
import MarginControlManagement from '../components/MarginControlManagement/MarginControlManagement';
import MarginControlManagementHTML from '../components/MarginControlManagement/MarginControlManagementHTML';
import ProcessEod from '../components/ProcessEod/ProcessEod';
import MarginAccountSummary from '../components/MarginAccountSummary/MarginAccountSummary';
import Icons from '../components/Icons';
import Element from '../components/Elements';
import { setTimeout, setInterval, clearInterval, clearTimeout } from 'worker-timers';
import { dispatchEvent, EVENTNAME } from '../helper/event';
import LoadingScreen from '../components/LoadingScreen/LoadingScreen';
import ChooseDraft from '../components/OpeningAccount/PopUp/ChooseDraft'
import OpeningAccount from '../components/OpeningAccount/OpeningAccount'
import AddGovernmentID from '../components/OpeningAccount/Screens/AddGovernmentID'
import TradeConfirmations from '../components/AccountDetailNew/TradeConfirmations'
import DocumentUpload from '../components/AccountDetailNew/DocumentUpload'
import Important from '../components/OpeningAccount/PopUp/Important'
import BankAccountDetail from '../components/OpeningAccount/Screens/BankAccountDetail'
import CloseApplication from '../components/OpeningAccount/PopUp/CloseApplication'
import CreditHeader from '../components/OpeningAccount/PopUp/CreditHeader'
import Banner from '../components/Inc/Banner/Banner';
import Auth from './AuthV2';
import SupportTicket from '../components/SupportTicket/SupportTicket'
import DepositWithdraw from '../components/DepositWithdraw/DepositWithdraw'
import Button from '../components/Elements/Button/Button'
import { afterLogin } from '../helper/loginFunction';

const TIME_OUT_CHECK_CONNECT = 3000;
const TIME_OUT_CHECK_UPDATE = 100 * 1000;
const allLinkColor = [
    colorLink.link1,
    colorLink.link2,
    colorLink.link3,
    colorLink.link4,
    colorLink.link5,
    colorLink.unLink
]

const widgets = {
    CHART: 'Chart',
    RELATEDNEWS: 'RelatedNews'
}

if (dataStorage.checkUpdate) {
    const { whyDidYouUpdate } = require('why-did-you-update')
    whyDidYouUpdate(React)
}
let dicComponent = null;
class GoldenLayoutWrapper extends React.Component {
    constructor(props) {
        super(props);
        const queryObj = new URLSearchParams(window.location.search);
        const accessToken = queryObj.get('accessToken')
        this.isStayLogin = accessToken ? false : (localStorageNew && localStorageNew.getItem('isStayLogin', true) === 'true');
        dataStorage.isStayLogin = this.isStayLogin;
        // eslint-disable-next-line no-extend-native
        String.prototype.toCapitalize = function () {
            return this.split(' ').map(x => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join(' ')
        }
        // eslint-disable-next-line no-extend-native
        String.prototype.toBackEndTransKey = function () {
            return `lang_backend_${this.toLowerCase()}`
        }
        // getIpPublish((ip) => {
        //     dataStorage.ipPublic = ip
        // })
        this.setEnvDefault()
        dicComponent = {
            Empty: Empty,
            Icons: Icons,
            Element: Element,
            CourseOfSale: CourseOfSale,
            UserAccount: UserAccount,
            WatchlistBottom: WatchlistBottom,
            UserManager: UserManager,
            RelatedNews: RelatedNews,
            ChartTV: ChartTV,
            Truong: Truong,
            ProcessEod: ProcessEod,
            MarginControlManagement: MarginControlManagement,
            MarginControlManagementHTML: MarginControlManagementHTML,
            OrderList: OrderList,
            PortfolioSummary: PortfolioSummary,
            AccountSummary: PortfolioSummary,
            Portfolio: Portfolio,
            Streaming: Portfolio,
            AllHoldings: AllHoldings,
            MarketDepth: MarketDepth,
            Report: Report,
            NewReport: NewReport,
            ContractNote: ContractNote,
            AllOrders: AllOrders,
            QuickOrderPad: QuickOrderPad,
            QuickCancelOrder: QuickCancelOrder,
            AccountInfo: AccountInfo,
            BuySellPanel: BuySellPanel,
            AccountDetail: AccountDetail,
            AccountDetailNew: AccountDetailNew,
            Order: Order,
            Activities: Activities,
            CreateUser: CreateUser,
            CreateUserNew: CreateUserNew,
            SupportTicket: SupportTicket,
            DepositWithdraw: DepositWithdraw,
            UserGroupManagement: UserGroupManagement,
            AccountManager: AccountManager,
            NewAccountManager: NewAccountManager,
            VettingRulesManagement: VettingRulesManagement,
            MarketDataManagement: MarketDataManagement,
            UserInfor: UserInfor,
            BrokerDataReports: BrokerDataReports,
            AlertList: AlertList,
            NewAlert: NewAlert,
            MarginAccountSummary: MarginAccountSummary,
            SecurityDetail: SecurityDetail,
            ContractList: ContractList,
            DemoNewPicker: DemoNewPicker,
            MarketOverview: MarketOverview,
            TipRank: TipRank,
            MorningStar: MorningStar
        };
        const userLang = navigator.language || navigator.userLanguage || '';
        dataStorage.deviceLang = userLang;
        window.__data = dataStorage
        dicComponent.Indexes = MarketOverview
        const curLang = localStorageNew.getItem('lastLang', true);
        if (!curLang || !dataStorage.userInfo) {
            if (!curLang) {
                if (userLang) {
                    let lang = userLang.slice(0, 2);
                    if (lang && ['zh', 'ZH'].includes(lang)) {
                        lang = 'cn';
                    }
                    dataStorage.lang = lang || 'en';
                }
            } else {
                dataStorage.lang = curLang;
            }
        }
        dataStorage.goldenLayout = this;
        if (/[?&]gl-window=/.test(window.location.href)) {
            window.isSubWindow = true;
            window.popoutId = uuidv4()
        } else {
            window.isSubWindow = false;
        }
        this.isReady = false;
        this.isDrag = 0;
        this.isFirst = true;
        this.isCreated = false;
        this.readyToSaveLayout = false;
        this.timeoutRenderChart = null;
        this.stateChangedTimeoutId = null;
        dataStorage.i18n = this.props.i18n;
        dataStorage.goldenLayout.dic = {};
        dataStorage.goldenLayout.id = 0;
        dataStorage.beforeLogin = true

        this.initGoldenLayout = this.initGoldenLayout.bind(this);
        this.addComponentToStack = this.addComponentToStack.bind(this);
        this.goldenLayout = null;
        this.percentHeightTop = 40;
        this.percentWidth = 20;
        this.dicTimeoutId = {};
        this.state = {
            checkUpdate: false
        }
        this.emitter = new EventEmitter();
        func.setStore(emitter.MAIN_FORM, this.emitter);
        func.setStore(emitter.CHECK_CONNECTION, this.emitter);
        func.setStore(emitter.CHECK_CONNECTION_STREAM, this.emitter);
        func.setStore(emitter.STREAMING_ACCOUNT_DATA, this.emitter);
        func.setStore(emitterRefresh.CLICK_TO_REFRESH, this.emitter);
        func.setStore(emitterChangeAccount.CHANGE_ACCOUNT, this.emitter);
        func.setStore(emitter.CHECK_ORDER_STATUS, this.emitter);
        dataStorage.showNotification = this.showNotification.bind(this);
        dataStorage.handleChangeSetting = this.handleChangeSetting.bind(this);
        this.getDefaultAppSetting()
        this.handleDirectLink();
        if (!dataStorage.timeZone) dataStorage.timeZone = 'Australia/Sydney'; // moment.tz.guess();
    }
    handleChangeSetting(setting) {
        console.log('test', setting)
    }

    setEnvDefault() {
        let env
        const queryObj = new URLSearchParams(window.location.search);
        const modeUrl = queryObj.get('mode')
        if (modeUrl) {
            dataStorage.mode = modeUrl
            const isDemo = modeUrl === 'demo'
            const envObj = isDemo ? dataStorage.web_config.demo : dataStorage.web_config[ataStorage.web_config.common.project]
            env = envObj.env
        } else {
            env = this.isStayLogin ? localStorageNew.getItem('current_env', true) : 'guest'
        }
        if (!env) this.isStayLogin = false
        dataStorage.currentEnv = env;
        this.env = env && env !== 'undefined' && env !== 'null' ? env : 'guest';
        setEnvConfig(this.env)
    }

    getDefaultAppSetting = () => {
        const settings = [
            { label: 'lastTheme', key: 'currentTheme', defaultValue: 'theme-dark' },
            { label: 'lastFontSize', key: 'currentFontSize', defaultValue: 'medium' },
            { label: 'lastLang', key: 'currentLang', defaultValue: 'en' }
        ];
        settings.map(({ label, key, defaultValue }) => {
            let value = localStorageNew.getItem(label, true)
            if (!value || value === 'null') {
                value = defaultValue;
            }
            dataStorage[key] = value;
        })
    }

    handleDirectLink() {
        const queryObj = new URLSearchParams(window.location.search);
        const type = queryObj.get('type');
        const username = queryObj.get('user');
        const language = queryObj.get('lang');
        const env = queryObj.get('env');
        const digitsCode = queryObj.get('code')
        const path = window.location.pathname
        const email = queryObj.get('email');
        if (path.includes('sign-up') || path.includes('signup')) {
            window.history.replaceState('', '', window.location.origin)
            this.isStayLogin = false;
            showModal({
                component: Auth,
                props: {
                    goTo: 'signup',
                    params: {
                        email
                    }
                }
            })
            return
        }
        if (path.includes('sign-in') || path.includes('signin') || path.includes('log-in') || path.includes('login')) {
            window.history.replaceState('', '', window.location.origin)
            this.isStayLogin = false;
            showModal({
                component: Auth,
                props: {
                    goTo: 'login',
                    params: {
                        username: email
                    }
                }
            })
            return
        }
        if (language) {
            localStorageNew.setItem('lastLang', language, true);
            dataStorage.currentLang = language;
            dataStorage.lang = language;
            this.props.i18n && this.props.i18n.changeLanguage(language)
        }
        if (type) {
            window.history.replaceState('', '', window.location.origin)
            if (!type) return;
            this.type = type
            const dicType = {
                1: 'sign_up',
                2: 'forgot_password'
            };
            showModal({
                component: Auth,
                props: {
                    goTo: 'confirmEmail',
                    params: {
                        type: dicType[type],
                        email: username,
                        code: digitsCode,
                        env: env
                    }
                }
            })
        }
    }

    componentDidMount() {
        // <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        const tag = document.createElement('script')
        tag.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
        document.head.appendChild(tag)
        createContextMenu()
        // ReactDOM.render2 = ReactDOM.render;
        // ReactDOM.render = function (a, b, c) {
        //     b.setAttribute('reactRootContainer', '');
        //     ReactDOM.render2(a, b, c);
        // }
        window.addEventListener('beforeunload', function () {
            // const lst = document.querySelectorAll('[reactRootContainer]')
            // lst.length && lst.forEach(item => ReactDOM.unmountComponentAtNode(item));
            if (dataStorage.userInfo) {
                const req = new XMLHttpRequest();
                req.open('POST', `${dataStorage.env_config.api.backendBase}/auth/logout`, false); // false
                req.setRequestHeader('Authorization', 'Bearer ' + dataStorage.accessToken)
                req.send();
            }
        });
        const { t } = this.props;
        checkTheme();
        const sheet = (function () {
            const style = document.createElement('style');
            style.appendChild(document.createTextNode(''));
            document.head.appendChild(style);
            return style.sheet;
        })();
        sheet.insertRule('@keyframes hasTitle {from { opacity: 0.99; }to { opacity: 1; }}', 0);
        sheet.insertRule('[title], .showTitle{animation-duration: 0.001s;animation-name: hasTitle;}', 0)
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault()
            const isAggrid = event.target.closest('.ag-root-wrapper')
            const className = event.target.className
            if (isAggrid && className !== 'ag-center-cols-viewport') return
            dataStorage.showContextMenu && dataStorage.showContextMenu({
                mouse: { x: event.pageX, y: event.pageY }
            })
        })

        document.addEventListener('animationstart', (event) => {
            if (event.animationName !== 'hasTitle') return;
            const target = event.target;
            if (target.classList.contains('gridCanvas')) return;
            let targetCL = target.classList;

            if (targetCL.contains('ag-row-drag')) {
                target.title = t('lang_move')
            }
            if (targetCL.contains('ag-icon-columns')) {
                target.title = 'lang_columns'
            }
            if (targetCL.contains('ag-icon-filter')) {
                target.title = 'Filter'
            }
            if (targetCL.contains('remove-symbol')) {
                target.title = t('Remove')
            }
            if (targetCL.contains('ag-icon-expanded')) {
                target.title = 'Expand'
            }
            if (targetCL.contains('lm_popout')) {
                target.title = 'Open in new window'
            }
            if (targetCL.contains('lm_maximise')) {
                if (target.parentNode.parentNode.parentNode.classList.contains('lm_maximised')) {
                    target.title = 'Minimise'
                } else {
                    target.title = 'Maximise'
                }
            }
            if (targetCL.contains('lm_close')) {
                target.title = 'Close'
            }
            if (targetCL.contains('lm_popin')) {
                target.title = 'Pop in'
            }
            target.addEventListener('mouseover', function (event) {
                let title = '';
                let useHTML = false;
                if (target.title) {
                    target.titleH = target.title;
                    target.title = '';
                }
                if (targetCL.contains('showTitle')) {
                    if (targetCL.contains('next')) {
                        title = target.nextElementSibling.innerHTML;
                        useHTML = true;
                    } else if (targetCL.contains('html')) {
                        title = target.innerHTML
                        useHTML = true;
                    } else if (target.tagName !== 'INPUT') title = target.innerText;
                    else title = '';
                } else {
                    title = target.titleH;
                }
                if (title) {
                    let div = document.getElementById('tooltip');
                    if (!div) {
                        div = document.createElement('div');
                        div.id = 'tooltip';
                        document.body.appendChild(div);
                    }
                    div.style.position = 'absolute';
                    div.style.opacity = '1';
                    div.style.top = (event.clientY + 10) + 'px';
                    div.style.left = (event.clientX + 10) + 'px';
                    if (target && target.classList && target.classList.contains('lm_tab')) {
                        div.innerText = target.querySelector('.lm_title').innerText;
                    } else {
                        if (useHTML) div.innerHTML = title;
                        else div.innerText = title;
                    }
                    div.classList.add('size--2');
                    event.stopPropagation();
                }
            });
            target.addEventListener('mouseout', function (event) {
                const div = document.getElementById('tooltip');
                if (div) div.style.opacity = '0';
            });
            target.addEventListener('mousemove', function (event) {
                const div = document.getElementById('tooltip');
                if (div && div.style.opacity !== '0') {
                    if (div.clientWidth + event.clientX + 20 > document.body.scrollWidth) {
                        div.style.left = (event.clientX - div.clientWidth - 10) <= 0 ? 0 : (event.clientX - div.clientWidth - 10) + 'px';
                    } else {
                        div.style.left = (event.clientX + 20) + 'px';
                    }

                    if (div.clientHeight + event.clientY + 20 > document.body.scrollHeight) {
                        div.style.top = (event.clientY - div.clientHeight - 10) + 'px';
                    } else {
                        div.style.top = (event.clientY + 20) + 'px';
                    }
                }
            });
            target.addEventListener('click', function (event) {
                const div = document.getElementById('tooltip');
                if (div) div.style.opacity = '0';
            });
        });
        const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        if (height) {
            const newHeight = height - 64 - 24;
            this.percentHeightTop = (202 * 100 / newHeight);
        }
        if (width) {
            this.percentWidth = (320 * 100 / width) + 1;
        }
        this.autoLogin();
        setInterval(() => {
            if (!dataStorage.connected) {
                checkNetworkConnection(isConnected => {
                    handleNetwork(isConnected)
                })
            }
        }, TIME_OUT_CHECK_CONNECT)
    }

    autoLogin() {
        const loginEmail = localStorageNew.getItem('loginEmail', true);
        if (this.isStayLogin && loginEmail) dataStorage.loginEmail = loginEmail
        let refreshToken = loginEmail && localStorageNew.getItem(`${loginEmail}_refresh_token`);
        if (!refreshToken || (refreshToken && refreshToken.length < 10)) refreshToken = '';
        if (window.isSubWindow) {
            this.initGoldenLayout()
            return
        }
        logger.sendLog(`${this.env} - this.isStayLogin: ${this.isStayLogin} - loginEmail: ${loginEmail} - refreshToken: ${refreshToken}`);
        if (this.isStayLogin && loginEmail && refreshToken && !this.type) {
            dataStorage.subPath = dataStorage.isDemo ? 'demo/' : '';
            const time = localStorageNew ? localStorageNew.getItem(`requireTime_${loginEmail}`) : requireTime.ON_CHANGE;
            const timeRequireSetting = time !== null && time !== undefined ? parseInt(time) : requireTime.ON_CHANGE;
            dataStorage.requireTime = timeRequireSetting;
            dataStorage.verifiedPin = timeRequireSetting !== requireTime.ON_CHANGE;
            logger.sendLog(`dataStorage.requireTime: ${dataStorage.requireTime} - dataStorage.subPath: ${dataStorage.subPath}`);
            if (!dataStorage.requireTime) {
                autoLoginWithoutVerifyPin(refreshToken)
            } else {
                showModal({
                    component: Pin,
                    props: {
                        title: 'firstLogin',
                        canClose: !dataStorage.requireTime,
                        success: (pin) => {
                            pin && todo(pin);
                            this.initGoldenLayout()
                        }
                    }
                });
                func.emitter(emitter.MAIN_FORM, eventEmitter.CHANGE_MAIN_STATE, formState.VERIFY_PIN)
            }
        } else {
            localStorageNew.setItem('current_env', '', true)
            apiHelper.loginRandomPin().then(async res => {
                let refreshToken = null;
                let pin = null;
                if (localStorageNew) {
                    const tokenKey = `${dataStorage.loginEmail}_refresh_token`;
                    const pinKey = `${dataStorage.loginEmail}_pin_refresh_token`;
                    refreshToken = localStorageNew.getItem(tokenKey);
                    pin = localStorageNew.getItem(pinKey);
                }
                apiHelper.postDecode(pin, refreshToken).then(res => {
                    if (res && res.data) {
                        // apiHelper.autoRefreshToken(res.data.token);
                    }
                    registerUser('guest');
                }).catch(error => {
                    if (error.response && error.response.errorCode === 2089) {
                        localStorageNew.removeItem('isStayLogin', true);
                        warning({
                            message: 'lang_pin_expired',
                            callback: () => {
                                this.props.handlePopUpLogout && this.props.handlePopUpLogout(false)
                                window.location.reload();
                            }
                        });
                    }
                    logger.error(error)
                });
                const symbol = dataStorage.web_config[dataStorage.web_config.common.project].symbol || 'ANZ';
                const url = makeSymbolUrl(encodeURIComponent(symbol));
                await getData(url).then(resolve => {
                    if (resolve && resolve.data) {
                        dataStorage.symbolDefault = resolve.data[0]
                    }
                }).catch(e => {
                    logger.sendLog('error at getDefaultSymbol', e)
                })
                this.initGoldenLayout();
            }).catch(err => {
                logger.error('Login Guest Account Error: ', err);
            })
        }
    }
    wrapComponent(Component, store, arg) {
        const self = this;
        class Wrapped extends React.Component {
            constructor(props) {
                super(props);
                if (dataStorage.userInfo && dataStorage.userInfo.user_id) {
                    setTimeout(() => {
                        const componentName = this.props.glContainer._config.component
                        if (this.props.glContainer._config.title === 'New_Order' || this.props.glContainer._config.component === 'Order') {
                            let dataState = {}
                            if (!enableOrder(dataStorage.accountInfo)) {
                                checkRoleWidget(this, 'doNotShow');
                                return;
                            }
                            if (this.props.glContainer._config.componentState.stateOrder === 'NewOrder') {
                                dataState.stateOrder = 'NewOrder'
                            } else if (this.props.glContainer._config.componentState.stateOrder === 'ModifyOrder' || this.props.glContainer._config.componentState.stateOrder === 'DetailOrder') {
                                dataState = this.props.glContainer._config.componentState
                            }
                            if (checkRole(MapRoleComponent.QUICK_ORDER_PAD)) {
                                if ((checkRole(MapRoleComponent.QUICK_ORDER_PAD) && !checkRole(MapRoleComponent.NORMAL_ORDER_PAD)) || (checkRole(MapRoleComponent.QUICK_ORDER_PAD) && checkRole(MapRoleComponent.NORMAL_ORDER_PAD) && dataStorage.dataSetting.checkQuickOrderPad)) {
                                    let show = true;
                                    if (dataStorage.userInfo && dataStorage.userInfo.user_type === userTypeEnum.RETAIL && dataStorage.listMapping && Array.isArray(dataStorage.listMapping) && dataStorage.listMapping.length < 2) {
                                        if ((Array.isArray(role) && role.includes(MapRoleComponent.UserAccount)) ||
                                            MapRoleComponent.AllOrders ||
                                            role === MapRoleComponent.AllHoldings) {
                                            show = false
                                        }
                                    }
                                    if (dataState.stateOrder === 'DetailOrder') {
                                        if (this.props.glContainer._config.componentState.needConfirm) {
                                            if (show) {
                                                requirePin(
                                                    () => showWindow({
                                                        component: QuickCancelOrder,
                                                        props: {
                                                        },
                                                        state: dataState
                                                    })
                                                );
                                            }
                                            checkRoleWidget(this, 'doNotShow');
                                            return;
                                        }
                                    } else {
                                        if (show) {
                                            requirePin(
                                                () => showWindow({
                                                    component: QuickOrderPad,
                                                    props: {
                                                    },
                                                    state: dataState
                                                })
                                            );
                                        }
                                        checkRoleWidget(this, 'doNotShow');
                                        return;
                                    }
                                }
                                if (this.props.glContainer._config.componentState.stateOrder !== 'DetailOrder') checkRoleWidget(this, [MapRoleComponent.NEW_ORDER, MapRoleComponent.NEW_ORDER_BUTTON_ORDER_DETAIL, MapRoleComponent.NEW_ORDER_BUTTON_PORTFOLIO, MapRoleComponent.NEW_ORDER_BUTTON_HOLDINGS])
                            }
                        }
                        if (this.props.glContainer._config.title === 'New_Order' ||
                            (this.props.glContainer._config.component === 'Order' && this.props.glContainer._config.componentState.initTitle === 'New_Order')) {
                            checkRoleWidget(this, [MapRoleComponent.NEW_ORDER, MapRoleComponent.NEW_ORDER_BUTTON_ORDER_DETAIL, MapRoleComponent.NEW_ORDER_BUTTON_PORTFOLIO, MapRoleComponent.NEW_ORDER_BUTTON_HOLDINGS])
                        } else {
                            checkRoleWidget(this, MapRoleComponent[componentName], MapAddonComponent[componentName])
                        }
                    }, 100)
                }
                if (props.glContainer._config.componentState.account) {
                    const color = this.getColor()
                    if (self.timeoutSetAccount) clearTimeout(self.timeoutSetAccount)
                    let index = -1
                    self.timeoutSetAccount = setTimeout(() => {
                        if (color !== 5) {
                            dataStorage.lastColorChangeAccount = color
                            if (dataStorage.lstAccountDropdown) {
                                index = dataStorage.lstAccountDropdown.findIndex(item => item.account_id === props.glContainer._config.componentState.account)
                            } else {
                                index = 1
                            }
                            index > 0 && dataStorage.setFooterAccount && dataStorage.setFooterAccount(props.glContainer._config.componentState.account);
                        }
                    }, 100)
                }
                this.isShowing = false;
                this.listCb = [];
                props.glContainer.react = this;
                this.showContent = this.showContent.bind(this);
                if (window.isSubWindow) {
                    const popinButton = document.createElement('div')
                    popinButton.className = 'popinButton showTitle'
                    popinButton.innerText = dataStorage.translate('lang_popin')
                    popinButton.style.color = 'transparent'
                    document.body.appendChild(popinButton)
                    popinButton.onclick = function () {
                        if (popinButton.firstclick) return;
                        popinButton.firstclick = true;
                        document.querySelector('.lm_popin').click();
                    }
                    const state = this.props.glContainer.getState()
                    const t = dataStorage.translate
                    let text = document.title
                    if (text === 'UserGroupManagement') text = 'UserGroupMan'
                    if (state && state.initTitle) {
                        text = state.initTitle;
                    }
                    if (state && state.initOrderId) {
                        document.title = t(text) + ' #' + (state.initOrderId + '').substr(-6)
                    } else if (state && state.initName) {
                        document.title = t(state.initName) + ' - ' + t(text)
                    } else {
                        document.title = t(text)
                    }

                    self.props.i18n.on('languageChanged', () => {
                        if (state && state.initOrderId) {
                            document.title = t(text) + ' #' + (state.initOrderId + '').substr(-6)
                        } else if (state && state.initName) {
                            document.title = t(state.initName) + ' - ' + t(text)
                        } else {
                            document.title = t(text)
                        }
                    })
                }
            }

            showContent() {
                if (!this.isShowing) {
                    this.isShowing = true;
                    this.forceUpdate();
                }
            }

            getColor() {
                return (this.props.glContainer.getState() || { color: 0 }).color || 0;
            }

            send(data) {
                if (data.symbol) {
                    if (!dataStorage.symbolsObjDic[data.symbol]) dataStorage.symbolsObjDic[data.symbol] = data
                    dataStorage.global_symbol = data.symbol;
                    if (dataStorage.userInfo) {
                        dataStorage.defaultSymbol = clone(data.symbol);
                        const obj = this.props.glContainer.getState() || {};
                        obj.symbol = data.symbol;
                        this.props.glContainer.setState(obj);
                    }
                    const color = this.getColor()
                    if (color !== 5) {
                        dataStorage.receiveOrderPad && dataStorage.receiveOrderPad(data, color)
                    }
                    dataStorage.lastSymbol = data.symbol
                }
                if (data.account) {
                    let loadState = this.loadState()
                    if (data.account.equix_id && loadState.account && data.account.equix_id === loadState.account.equix_id) return
                    if (!data.account.equix_id && loadState.account && data.account.account_id === loadState.account.account_id) return
                    if (dataStorage.userInfo) {
                        dataStorage.defaultAccount = data.account;
                        const obj = this.props.glContainer.getState() || {};
                        obj.account = data.account;
                        this.props.glContainer.setState(obj);
                        const color = this.getColor()
                        if (color !== 5) {
                            dataStorage.lastColorChangeAccount = color
                            dataStorage.setFooterAccount && dataStorage.setFooterAccount(data.account);
                            dataStorage.receiveOrderPad && dataStorage.receiveOrderPad(data, color)
                        }
                    }
                    dataStorage.lastAccount = data.account
                }

                const color = this.getColor();
                const gl = dataStorage.goldenLayoutMain || dataStorage.goldenLayout;
                for (var key in gl.dic) {
                    const itemSelect = gl.dic[key]
                    setTimeout(() => {
                        if (!itemSelect) {
                            //
                        } else {
                            itemSelect(data, this.id, color);
                        }
                    }, 0)
                }
            }

            saveState(data) {
                const obj = this.props.glContainer.getState() || {};
                Object.keys(data).map(key => {
                    if (data[key] && data[key]._d) obj[key] = data[key].toString();
                    else obj[key] = data[key];
                });
                this.props.glContainer.setState(obj);
            }

            loadState() {
                const data = this.props.glContainer.getState() || {};
                const obj = {};
                Object.keys(data).map(key => {
                    if (typeof data[key] === 'string' && /GMT[+-]\d+$/.test(data[key])) obj[key] = moment.tz(moment(data[key]), dataStorage.timeZone)
                    else if (data[key] && data[key].hasOwnProperty('_d')) obj[key] = moment().tz(dataStorage.timeZone);
                    else obj[key] = data[key];
                });
                return obj
            }

            receive(cb) {
                const that = this;
                if (cb.price) {
                    const obj = this.props.glContainer.getState() || {};
                    obj.price = true
                    this.props.glContainer.setState(obj);
                }
                that.cb = (data) => {
                    data.isClear && cb.price && cb.price()
                    if (data.account && cb.account) {
                        dataStorage.defaultAccount = data.account;
                        const color = this.getColor()
                        if (color !== 5) {
                            dataStorage.lastColorChangeAccount = color
                            dataStorage.setFooterAccount && dataStorage.setFooterAccount(data.account);
                        }
                        cb.account(data.account);
                        if (data.keyWidget !== 'doNotSave' && dataStorage.userInfo) {
                            const obj = this.props.glContainer.getState() || {};
                            obj.account = data.account;
                            this.props.glContainer.setState(obj);
                        }
                    }
                    if (data.symbol && cb.symbol) {
                        if (data.symbol.symbol) {
                            dataStorage.defaultSymbol = data.symbol;
                            cb.symbol(data.symbol, data.keyWidget || 'force');
                            if (data.keyWidget !== 'doNotSave' && dataStorage.userInfo) {
                                const obj = this.props.glContainer.getState() || {};
                                obj.symbol = data.symbol;
                                this.props.glContainer.setState(obj);
                            }
                        }
                    }
                };
                if (window.localStorage) {
                    let obj = this.props.glContainer.getState();
                    const isNewOrderComponent = this.props.glContainer._config.component === 'Order' && this.props.glContainer._config.componentState.initTitle === 'New_Order';
                    // const isContracNote = this.props.glContainer._config.component === 'ContractNote';
                    const isContracNote = ['ContractNote'].includes(this.props.glContainer._config.component);
                    const isNews = this.props.glContainer._config.component === 'RelatedNews';
                    if (that.dataTemp) {
                        if (!obj) obj = {};
                        Object.assign(obj, that.dataTemp);
                        delete that.dataTemp;
                    }
                    if (obj && obj.data && obj.data.symbolObj && Object.keys(obj.data.symbolObj).length && !isNews) {
                        setTimeout(() => {
                            that.cb({ symbol: obj.data.symbolObj }, 'doNotSave');
                        }, 0);
                    } else if (obj && obj.symbol && Object.keys(obj.symbol).length && !isNews) {
                        setTimeout(() => {
                            that.cb({ symbol: obj.symbol }, 'doNotSave');
                        }, 0);
                    } else {
                        if ((obj.stateOrder !== 'NewOrder' && !isNews && !isContracNote) &&
                            this.props.glContainer._config.component !== 'NewAlert') {
                            setTimeout(() => {
                                that.cb({
                                    symbol: dataStorage.symbolDefault
                                }, 'doNotSave');
                            }, 0);
                        }
                    }
                    if (obj && obj.accountObj && Object.keys(obj.accountObj).length) {
                        dataStorage.defaultAccount = obj.accountObj
                        const accountId = obj.accountObj.account_id
                        const url = getUrlAnAccount(accountId);
                        getData(url).then(response => {
                            if (response.data && response.data.length && response.data[0].account_id) {
                                if (obj.accountObj.filter && (obj.accountObj.filter.option.length > 1)) {
                                    response.data[0].filter = obj.accountObj.filter
                                }
                                that.cb({ account: response.data[0] }, 'doNotSave');
                            } else if (response.data.length === 0) {
                                // response.data[0].account_id = accountId
                                that.cb({
                                    account: {
                                        account_id: accountId
                                    }
                                }, 'doNotSave');
                            } else {
                                that.cb({ account: dataStorage.accountInfo }, 'doNotSave');
                            }
                        }).catch(error => {
                            that.cb({ account: dataStorage.accountInfo }, 'doNotSave');
                        })
                    } else if (obj && obj.account && Object.keys(obj.account).length && checkShowAccountSearch()) {
                        const accountId = obj.account.account_id
                        if (accountId) {
                            const url = getUrlAnAccount(accountId);
                            getData(url).then(response => {
                                if (response.data && response.data.length && response.data[0].account_id) {
                                    that.cb({ account: response.data[0] }, 'doNotSave');
                                } else {
                                    that.cb({ account: dataStorage.accountInfo }, 'doNotSave');
                                }
                            }).catch(error => {
                                that.cb({ account: dataStorage.accountInfo }, 'doNotSave');
                            })
                        }
                    } else {
                        const widget = that.props && that.props.glContainer && that.props.glContainer._config.component;
                        const listUnlinkAccount = ['AllOrders'];
                        if (!listUnlinkAccount.includes(widget) && !isNewOrderComponent) {
                            setTimeout(() => {
                                that.cb({ account: dataStorage.accountInfo }, 'doNotSave');
                            }, 0);
                        }
                    }
                }
            }

            broadcast(data, id, color) {
                if (id === 'force') {
                    if (typeof this.cb === 'function') this.cb(data);
                } else {
                    const currentColor = this.getColor();
                    if (((data && data.forceSelfUpdate && id === this.id) || (id !== this.id && currentColor !== allLinkColor.length - 1)) && color === currentColor) {
                        if (typeof this.cb === 'function') this.cb(data);
                        else this.dataTemp = data;
                    }
                }
            }

            resizeRegister(cb) {
                if (!this.resize) this.resize = [];
                this.resize.push(cb);
            }

            componentWillMount() {
                if (window.isSubWindow) {
                    dataStorage.wrapComponent = this;
                } else {
                    this.id = dataStorage.goldenLayout.id++;
                    dataStorage.goldenLayout.dic[this.id] = this.broadcast.bind(this);
                }
            }

            componentWillUnmount() {
                const gl = dataStorage.goldenLayoutMain || dataStorage.goldenLayout;
                delete gl.dic[this.id];
            }

            ref(dom) {
                if (dom) {
                    dom.react = this;
                    dom.parentNode && dom.parentNode.parentNode && (dom.parentNode.parentNode.react = this);
                    let com = this.props.glContainer;
                    const resize = (firstTime) => {
                        // return;
                        const timeout = Math.random() * 1000;
                        setTimeout(() => {
                            if (!firstTime) {
                                this.isReady = true;
                            }
                            const y = com._element[0];
                            const lmItem = com._element[0].parentNode;
                            if (lmItem) {
                                lmItem.style.overflowX = lmItem.clientWidth < 300 ? 'auto' : 'hidden';
                                lmItem.style.overflowY = lmItem.clientHeight < 164 ? 'auto' : 'hidden';
                            }
                            if (y) {
                                const oldClass = y.className;
                                y.className = 'lm_item_container';
                                if (lmItem && lmItem.clientWidth >= 1500) {
                                    y.classList.add('w1500');
                                }
                                if (lmItem && lmItem.clientWidth >= 1280) {
                                    y.classList.add('w1280');
                                }
                                if (lmItem && lmItem.clientWidth >= 960) {
                                    y.classList.add('w960');
                                }
                                if (lmItem && lmItem.clientWidth >= 800) {
                                    y.classList.add('w800');
                                }
                                if (lmItem && lmItem.clientWidth >= 640) {
                                    y.classList.add('w640');
                                }
                                if (lmItem && lmItem.clientWidth >= 320) {
                                    y.classList.add('w320');
                                }
                                if (y.className !== oldClass) {
                                    y.querySelectorAll('[scroll-content]').forEach(item => {
                                        if (item.classList.contains('changed')) {
                                            item.classList.remove('changed')
                                        } else {
                                            item.classList.add('changed')
                                        }
                                    })
                                    y.querySelectorAll('[scroll-content-grid]').forEach(item => {
                                        if (item.classList.contains('changed')) {
                                            item.classList.remove('changed')
                                        } else {
                                            item.classList.add('changed')
                                        }
                                    })
                                }
                            }
                            if (com.isHidden) return;
                            const x = com._element[0].querySelector('.wrapComponent');
                            if (!x) return;
                            const isHidden = com._element[0].hidden;
                            if (isHidden) {
                                return;
                            }
                            if (x) {
                                if (x.react && x.react.resize) {
                                    const timeoutOldId = self.dicTimeoutId[x.react.id];
                                    if (timeoutOldId) {
                                        clearTimeout(timeoutOldId);
                                    }
                                    const timeoutId = setTimeout(() => {
                                        let aTime = 0;
                                        x.react.resize.forEach(cb => {
                                            try {
                                                aTime += 100;
                                                setTimeout(() => {
                                                    cb(x.clientWidth, x.clientHeight, firstTime)
                                                }, 0);
                                            } catch (e) {
                                                logger.error(e);
                                            }
                                        });
                                    }, 0);
                                    if (timeoutId) {
                                        self.dicTimeoutId[x.react.id] = timeoutId;
                                    }
                                }
                            }
                        }, timeout || 0);
                    };
                    com.on('resize', resize);
                    // if (!com.container.isHidden) {}
                    setTimeout(() => resize(true), 0);
                }
            }
            setTitle(obj = { text: '', orderId: '', name: '' }) {
                if (obj.text && this.props.glContainer) {
                    if (this.props.glContainer.tab) {
                        const tab = this.props.glContainer.tab.element[0];
                        const title = tab.querySelector('.lm_title')
                        if (obj.orderId) {
                            title.parentNode.classList.add('lock');
                            ReactDOM.render(<span className='text-capitalize'><Lang>{obj.text}</Lang> #{(obj.orderId + '').substr(-6)}</span>, title);
                        } else if (obj.name) {
                            ReactDOM.render(<React.Fragment><spa>{obj.name} </spa><span className='text-capitalize'>- <Lang>{obj.text}</Lang></span></React.Fragment>, title);
                        } else {
                            ReactDOM.render(<span className='text-capitalize'><Lang>{obj.text}</Lang></span>, title);
                        }
                    } else {
                        const t = dataStorage.translate
                        if (obj.orderId) {
                            document.title = t(obj.text) + ' #' + (obj.orderId + '').substr(-6)
                        } else if (obj.name) {
                            document.title = t(obj.name) + ' - ' + t(obj.text)
                        } else {
                            document.title = t(obj.text)
                        }
                    }
                }
                this.saveState({
                    initTitle: obj.text,
                    initOrderId: obj.orderId,
                    initName: obj.name
                })
            }
            loadingCallback(cb, remove) {
                if (remove) {
                    this.listCb.splice(this.listCb.indexOf(cb), 1)
                } else {
                    this.listCb.push(cb);
                }
            }
            setLoading(show) {
                try {
                    this.listCb.map(fn => fn(show))
                } catch (e) {
                    logger.log('setLoading: ', e)
                }
                this.loading = show;
                if (this.props.glContainer && this.props.glContainer.tab) {
                    const tab = this.props.glContainer.tab.element[0];
                    if (show) {
                        tab.classList.add('loading')
                        tab.classList.add(dataStorage.theme)
                    } else {
                        tab.classList.remove('loading')
                        tab.classList.remove(dataStorage.theme)
                    }
                }
            }

            stateChangedRegister(cb, turnOff) {
                if (!this.handleStateChange) this.handleStateChange = [];
                if (!turnOff) {
                    this.handleStateChange.push(cb);
                } else {
                    this.handleStateChange.splice(this.handleStateChange.indexOf(cb), 1);
                }
            }
            notice(data) {
                if (this.props.glContainer && this.props.glContainer.tab) {
                    const notice = document.createElement('div');
                    const tab = this.props.glContainer.tab.element[0];
                    const oldNotice = this.props.glContainer.tab.element[0].querySelector('.headNoticeNews');
                    const title = tab.querySelector('.lm_title');
                    notice.classList.add('headNoticeNews');
                    notice.classList.add('size--2');
                    if (oldNotice && !data) {
                        tab.removeChild(oldNotice);
                        return;
                    }
                    if (oldNotice && data) {
                        if (data > 999) {
                            oldNotice.innerText = '999+';
                        } else {
                            oldNotice.innerText = data;
                        }
                        return;
                    }
                    data > 999 ? notice.innerText = '999+' : notice.innerText = data;
                    if (data) {
                        data > 999 ? dataStorage.numberNoticeNews = '999+' : dataStorage.numberNoticeNews = data;
                    }
                    let parent
                    if (title) parent = title.parentNode;
                    if (title && parent && data) parent.appendChild(notice);
                }
            }
            render() {
                try {
                    if (!this.isShowing) {
                        console.log('========> render loading')
                        return <div className='busyBoxFull text-capitalize'><Lang>lang_loading_progress</Lang></div>;
                    } else {
                        return (
                            <Provider store={store}>
                                <div className={'wrapComponent'} ref={this.ref.bind(this)}>
                                    <div className='loading-overlay' />
                                    <Component {...this.props}
                                        stateChanged={this.stateChangedRegister.bind(this)}
                                        saveState={this.saveState.bind(this)}
                                        loadState={this.loadState.bind(this)}
                                        refCompnent={(com, name) => self[name] = com}
                                        color={this.getColor()}
                                        options={arg}
                                        loading={this.setLoading.bind(this)}
                                        loadingCallback={this.loadingCallback.bind(this)}
                                        resize={this.resizeRegister.bind(this)}
                                        send={this.send.bind(this)}
                                        receive={this.receive.bind(this)}
                                        setTitle={this.setTitle.bind(this)}
                                        notice={this.notice.bind(this)}
                                        confirmClose={fn => this.needConfirmClose = fn}
                                    />
                                </div>
                            </Provider>
                        );
                    }
                } catch (e) {
                    logger.error(e)
                    return null
                }
            }
        }

        return Wrapped;
    }

    registerComponent(item) {
        if (!this.goldenLayout.existed) this.goldenLayout.existed = {};
        if (this.goldenLayout.existed[item.component]) return;
        this.goldenLayout.existed[item.component] = true;

        this.goldenLayout.registerComponent(item.component,
            this.wrapComponent(dicComponent[item.component] || Empty, this.context.store)
        );
    }
    initLayoutConfig(lst = []) {
        Array.isArray(lst) && lst.map(item => {
            if (item.content) {
                this.initLayoutConfig(item.content);
            }
            if (item.type === 'component') {
                this.registerComponent(item);
            }
        });
    }

    handleLinkAutoLogin = () => {
        const queryObj = new URLSearchParams(window.location.search);
        const accessToken = queryObj.get('accessToken')
        const isDemo = queryObj.get('mode') === 'demo'
        let env = isDemo ? dataStorage.web_config.demo : dataStorage.web_config[dataStorage.web_config.common.project]
        if (env && env.roles && env.roles.autoLogin) {
            if (accessToken) {
                this.isStayLogin = false;
                window.history.replaceState('', '', window.location.origin)
                getSecretKey(env)
                const url = getCheckTokenUrl(accessToken, env)
                getData(url).then(res => {
                    if (res.data.refresh_token) {
                        let data = res.data
                        dataStorage.loginEmail = data.login_id;
                        const tokenKey = `${data.login_id}_refresh_token`;
                        localStorageNew && localStorageNew.setItem(tokenKey, data.refresh_token);
                        localStorageNew.setItem('session_id', data.session_id);
                        setEnvConfig(env.env)
                        showModal({
                            component: Pin,
                            props: {
                                title: 'firstLogin',
                                canClose: false,
                                closeSuccess: this.props.close,
                                env: env,
                                success: (pin) => {
                                    pin && todo(pin);
                                    this.isStay && localStorageNew.setItem('isStayLogin', this.isStay, true)
                                    dataStorage.isStayLogin = this.isStay;
                                    dataStorage.verifiedPin = true;
                                    dataStorage.goldenLayout.initGoldenLayout(null, this.props.close);
                                    this.setState({ waiting: false });
                                }
                            }
                        });
                    } else if (res.data.errorCode === 'NOT_SET_PIN_YET') {
                        dataStorage.loginEmail = res.data.user_login_id;
                        console.log('===========>email ', dataStorage.loginEmail)
                        showModal({
                            component: Pin,
                            props: {
                                title: 'firstLogin',
                                canClose: false,
                                done: (pin) => {
                                    pin && todo(pin);
                                    apiHelper.postPin(accessToken, pin, env).then(response => {
                                        env.api.backendBase = 'https://' + response.data.baseUrl
                                        setEnvConfig(env.env)
                                        logger.sendLog(`POST PIN email: ${dataStorage.loginEmail} PIN: ${pin}`)
                                        if (response.data) {
                                            const data = response.data;
                                            const accessToken = data.accessToken;
                                            dataStorage.accessToken = accessToken;
                                            logger.log('CHECK TOKEN ===> Login loginAction showModal postPin SET NEW TOKEN: ', dataStorage);
                                            const tokenKey = `${dataStorage.loginEmail}_refresh_token`;
                                            localStorageNew && localStorageNew.setItem(tokenKey, response.data.refreshToken);
                                            afterLogin(() => {
                                                saveDataWhenChangeEnv();
                                                dataStorage.isGuest = false;
                                                dataStorage.goldenLayout.initGoldenLayout();
                                                this.setState({ waiting: false });
                                            }, () => {
                                                this.disableClose = false
                                            });
                                            apiHelper.postDecode(response.data.pin, response.data.refreshToken, env).then(res => {
                                                if (res.data) {
                                                    const dataResfresh = res.data;
                                                    apiHelper.autoRefreshToken(dataResfresh.token);
                                                }
                                            }).catch(error => {
                                                if (error.response && error.response.errorCode === 2089) {
                                                    localStorageNew.removeItem('isStayLogin', true);
                                                    showWarning({
                                                        message: 'lang_pin_expired',
                                                        callback: () => {
                                                            window.location.reload();
                                                        }
                                                    });
                                                }
                                                this.disableClose = false
                                                logger.error(error)
                                            })
                                        }
                                    }).catch(error => {
                                        this.disableClose = false
                                        logger.error(error)
                                        let errorCode = error.response && error.response.errorCode;
                                        errorCode = Array.isArray(errorCode) ? errorCode[0] : errorCode;
                                        if (+errorCode === 2089) {
                                            this.props.close && this.props.close();
                                            Confirm({
                                                checkWindowLoggedOut: true,
                                                message: 'lang_pin_request_expired',
                                                callback: () => {
                                                    window.location.reload();
                                                }
                                            })
                                        }
                                    })
                                }
                            }
                        });
                    }
                }).catch(err => {
                    console.log('=========> error', err)
                })
            }
        }
    }

    async initGoldenLayout(dataLayout, cb) {
        document.body.classList.add('init')
        const that = this
        if (dataStorage.env_config.roles.openingAccount) {
            dicComponent.AccountManager = NewAccountManager
        }
        if (dataStorage.env_config.roles.useNewMarketData) dicComponent.MarketDataManagement = MarketDataManagementNew
        this.isReady = false;
        this.isFirst = true;
        setTimeout(() => {
            this.readyToSaveLayout = true
        }, 2000);
        this.readyToSaveLayout = false;
        let layout;
        if (!dataLayout) {
            if (dataStorage.userInfo) {
                const layoutId = dataStorage.usingLayout;
                await getDataLayout(layoutId).then(res => {
                    const layoutStr = res && res.data && res.data.layout;
                    // dataStorage.linkColor = convertColorCode(res && res.data && res.data.linkColor && Number(res.data.linkColor)) || null;
                    layout = layoutStr && JSON.parse(layoutStr);
                    logger.log('get data layout after init goldenlayout success')
                }).catch(() => {
                    logger.log('get data layout after init goldenlayout failure')
                })
            }
            if (!layout) layout = layoutConfig.getLayout(this.percentHeightTop, this.percentWidth)
        } else {
            layout = dataLayout;
        }
        const configDefault = {
            dimensions: {
                headerHeight: 32,
                borderWidth: 8,
                minItemHeight: 192,
                minItemWidth: 330
            },
            content: layout
        };

        if (this.goldenLayout) this.goldenLayout.destroy();
        this.goldenLayout = new GoldenLayout(configDefault, this.layout);
        this.initLayoutConfig([configDefault]);
        this.handleLinkAutoLogin()
        cb && cb();
        /// Callback for every created stack
        this.goldenLayout.on('initialised', event => {
            addEventHubListener()
            setTimeout(() => {
                this.loadingScreen && (this.loadingScreen.style.display = 'none');
                document.body.classList.remove('init')
            }, 200)
        })
        this.goldenLayout.on('itemDestroyed', event => {
            if (event.config.type === 'component') {
                const tt = document.getElementById('tooltip');
                if (tt) tt.style.opacity = '0';
            }
        });
        this.goldenLayout.on('stackCreated', (stack) => {
            const handleCloseStack = (event) => {
                if (dataStorage.allowCloseAllWidgets || (stack.contentItems && stack.contentItems.length < 2)) {
                    stack.remove();
                    return
                }
                Confirm({
                    header: 'lang_confirm',
                    message: 'lang_close_all_widgets',
                    callback: () => {
                        if (dataStorage.allowCloseAllWidgets) {
                            saveDataSetting({ data: { allowCloseAllWidgets: true } })
                                .then(response => {
                                    logger.log(response)
                                })
                                .catch(error => {
                                    logger.log(error)
                                })
                        }
                        stack.remove();
                    },
                    checkWindowLoggedOut: false,
                    showDontShowItAgain: true,
                    cancelCallback: () => {
                        dataStorage.allowCloseAllWidgets = false
                    }
                })
            }

            // Custom button
            stack.layoutManager.lastItem = stack;
            var e = stack.header.controlsContainer[0];
            const x = e.querySelector('.lm_tabdropdown')
            ReactDOM.render(<Icon src={'av/play-arrow'} />, x);
            ReactDOM.render(<Icon style={{ width: '19px', height: '18px' }} src={'action/open-in-new'} />, e.querySelector('.lm_popout'));
            ReactDOM.render([<Icon key='crop' src={'av/web-asset'} />, <Icon key='remove' src={'content/remove'} />], e.querySelector('.lm_maximise'));
            ReactDOM.render(<Icon style={{ width: '20px', height: '20px' }} src={'content/clear'} />, e.querySelector('.lm_close'));
            x.addEventListener('mouseover', event => {
                x.click()
            })
            x.addEventListener('mouseout', event => {
                if (x.contains(event.target)) {
                    x.parentElement.parentElement.querySelector('.lm_tabdropdown_list').style.display = 'none'
                }
            })
            if (!dataStorage.allowCloseAllWidgets && dataStorage.userInfo) {
                stack.header.controlsContainer.find('.lm_close').off('click').on('click', handleCloseStack)
            }

            // Update the color initially and whenever the tab changes
            stack.on('activeContentItemChanged', (contentItem) => {
                dataStorage.hideContextMenu && dataStorage.hideContextMenu()
                const state = contentItem.container.getState();
                if (state.popout) {
                    delete state.popout;
                    contentItem.container.setState(state)
                    const popout = contentItem.tab && contentItem.tab.header && contentItem.tab.header.element && contentItem.tab.header.element[0] && contentItem.tab.header.element[0].querySelector('.lm_popout')
                    if (popout) popout.click()
                }
                setTimeout(() => {
                    const react = contentItem.container.react;
                    console.log('===========> showcontent Timeout')
                    react && react.showContent && react.showContent();
                }, 500);
                const div = document.getElementById('dropDownContent');
                if (div && div.children && div.children[0]) {
                    div.innerHTML = '';
                }
                const x = contentItem.element[0];
                if (x && x.react && x.react.resize) {
                    x.react.resize.forEach(cb => {
                        try {
                            cb(x.clientWidth, x.clientHeight)
                        } catch (e) {
                            logger.error(e)
                        }
                    })
                }
                document.dispatchEvent(new Event('mousedown'));
                const tt = document.getElementById('tooltip');
                if (tt) tt.style.opacity = '0';
            })
        });

        this.goldenLayout.on('tabCreated', (tabContainer) => {
            const focusWidget = tabContainer => {
                const activeItem = tabContainer.contentItem;
                const stack = tabContainer.header.parent;
                stack.setActiveContentItem(activeItem);
            }

            const handleCloseWidget = (event) => {
                if (tabContainer.contentItem.container.react && tabContainer.contentItem.container.react.needConfirmClose && tabContainer.contentItem.container.react.needConfirmClose()) {
                    Confirm({
                        header: 'lang_confirm',
                        checkWindowLoggedOut: true,
                        message: 'lang_ask_close_widget_edit_mode',
                        callback: () => {
                            tabContainer.contentItem.remove();
                        },
                        cancelCallback: () => { }
                    })
                } else {
                    tabContainer.contentItem.remove();
                }
            }
            tabContainer.closeElement.off('click').on('click', handleCloseWidget);
            // tabContainer.element.off('mousedown').on('mousedown', function (event) {
            //     if (event.which === 2) {
            //         event.preventDefault();
            //         handleCloseWidget();
            //     }
            // })
            tabContainer.element.on('mousedown', function (event) {
                const divError = document.getElementById('form-error');
                const input = document.getElementById('hiddenInput');
                if (input) input.focus();
                if (divError) {
                    divError.style.display = 'none';
                }
            })
            const react = ((tabContainer && tabContainer.contentItem.element[0]) || {}).react || {}

            ReactDOM.render(<Icon src={'navigation/close'} />, tabContainer.closeElement[0]);

            const tab = tabContainer.element[0];

            if (react.loading) tab.classList.add('loading');

            const updateTitle = (el) => {
                let title = el.querySelector('.lm_title');
                if (!title) return;
                let text = title.innerText;
                if (text === 'UserGroupManagement') text = 'UserGroupMan'
                if (dataStorage.isDragChart === true && text === widgets.CHART) {
                    dataStorage.isDragChart = false;
                    this.timeoutRenderChart && clearTimeout(this.timeoutRenderChart);
                    this.timeoutRenderChart = setTimeout(() => {
                        !this.isFirst && dataStorage.renderSaveChartLayoutButton && dataStorage.renderSaveChartLayoutButton()
                        this.isFirst = false;
                    }, 1000);
                }
                if (dataStorage.numberNoticeNews && text === widgets.RELATEDNEWS) {
                    const notice = document.createElement('div');
                    const data = dataStorage.numberNoticeNews;
                    notice.classList.add('headNoticeNews');
                    notice.classList.add('size--2');
                    notice.innerText = data;
                    let parent
                    if (title) parent = title.parentNode;
                    if (title && parent && data && dataStorage.connected) parent.appendChild(notice);
                }
                const state = tabContainer.contentItem.container.getState();
                if (text === widgets.CHART) {
                    dataStorage.isDragChart = true;
                }
                if (state && state.initTitle) {
                    text = state.initTitle;
                }
                if (state && state.initOrderId) {
                    title.parentNode.classList.add('lock');
                    ReactDOM.render(<span className='text-capitalize'><Lang>{text}</Lang> #{(state.initOrderId + '').substr(-6)}</span>, title);
                } else if (state && state.initName) {
                    ReactDOM.render(<span className='text-capitalize'>{state.initName} - <Lang>{text}</Lang></span>, title);
                } else {
                    ReactDOM.render(<span className='text-capitalize'><Lang>{text}</Lang></span>, title);
                }
            }
            updateTitle(tab);

            tabContainer._dragListener.on('drag', (e) => {
                dataStorage.hideContextMenu && dataStorage.hideContextMenu()
                let div = document.getElementById('dropDownContent');
                if (div && div.innerHTML) {
                    div.innerHTML = '';
                }
                const item = document.querySelector('.lm_dragProxy');
                if (item && !item.modified) {
                    item.modified = true;
                    this.isDrag = 1;
                    this.isReady = true;
                    this.stateChangedTimeoutId && clearTimeout(this.stateChangedTimeoutId);
                    updateTitle(item);
                }
            });
            let loading = document.createElement('img');
            loading.src = dataStorage.hrefImg + '/Spinner-white.svg';
            loading.className = 'loading-white';
            tab.insertBefore(loading, tab.firstChild);
            loading = document.createElement('img');
            loading.src = dataStorage.hrefImg + '/Spinner-black.svg';
            loading.className = 'loading-black';
            tab.insertBefore(loading, tab.firstChild);

            const link = document.createElement('div');
            link.className = 'link';

            let imgSrc = dataStorage.hrefImg + '/link-variant.svg';
            let imgSrcOff = dataStorage.hrefImg + '/link-variant-off.svg';
            const com = tabContainer.contentItem;
            const lstUnlink = [
                'UserGroupManagement',
                'Activities',
                'UserManager',
                'CreateUser',
                'MarketDataManagement',
                'MarketDataManagementNew',
                'VettingRulesManagement',
                'DepositWithdraw',
                'BrokerStockDetail',
                'StockShareAnalysis',
                'BrokerActivityAnalysis',
                'BrokerTradeAnalysis',
                'BrokerData',
                'BrokerDataReports',
                'MarginControlManagement',
                'ProcessEod',
                'AlertList'
            ];
            if (tabContainer.contentItem.config.componentState && tabContainer.contentItem.config.componentState.isModifyAlert) {
                lstUnlink.push('NewAlert')
            }
            const lstUnlinkAccount = [
                'AccountInfo',
                'Report',
                'NewReport'
            ]
            if (!dataStorage.listMapping || !dataStorage.listMapping.length) {
                lstUnlinkAccount.push('OrderList')
                lstUnlinkAccount.push('Portfolio')
            }

            const convertColorCode = (color) => {
                let len = allLinkColor.length;
                let position;
                for (let i = 0; i <= len; i++) {
                    if (color === allLinkColor[i]) position = i;
                }
                if (position || position === 0) return position;
                return 0;
            }
            let colorIndex = 0;
            if (com && com.config && com.config.componentState && com.config.componentState.color !== undefined) colorIndex = com.config.componentState.color;
            else if (dataStorage.lastColorOfLayout && dataStorage.lastColorOfLayout[dataStorage.usingLayout]) colorIndex = dataStorage.lastColorOfLayout[dataStorage.usingLayout];
            else colorIndex = dataStorage.linkColor;
            let colorDefault = allLinkColor[colorIndex] || allLinkColor[0];
            const setColor = function (color, userSelect) {
                const container = com.container;
                const colorIndex = convertColorCode(color);
                !dataStorage.lastColorOfLayout && (dataStorage.lastColorOfLayout = {})
                if (userSelect) {
                    dataStorage.linkColor = colorIndex || 0;
                    dataStorage.lastColorOfLayout[dataStorage.usingLayout] = colorIndex;
                }
                if (color === allLinkColor[allLinkColor.length - 1]) {
                    if (link.firstChild) {
                        link.firstChild.src = imgSrcOff;
                    } else {
                        link.innerHTML = '<img src="' + imgSrcOff + '" />';
                    }
                } else {
                    if (link.firstChild) {
                        link.firstChild.src = imgSrc;
                    } else {
                        link.innerHTML = '<img src="' + imgSrc + '" />';
                    }
                }
                link.className = link.className.replace(/\s?\bqe-color\d+\b/g, '');
                link.classList.add('qe-color' + colorIndex);
                const objState = container.getState() || {};
                Object.assign(objState, { color: allLinkColor.indexOf(color) })
                container.setState(objState);
                if (colorIndex !== 5) {
                    dataStorage.lastColorLink = colorIndex;
                }
            };

            if (lstUnlink.indexOf(tabContainer.contentItem.config.component) > -1 || (!checkShowAccountSearch() && lstUnlinkAccount.indexOf(tabContainer.contentItem.config.component) > -1)) {
                colorDefault = allLinkColor[allLinkColor.length - 1]
                setColor(colorDefault);
                tab.insertBefore(link, tab.firstChild);
                return;
            }
            setColor(colorDefault);
            tab.insertBefore(link, tab.firstChild);

            const colorDropdown = document.createElement('div');
            colorDropdown.className = 'chooseColor';
            let item;
            allLinkColor.forEach((c, i) => {
                item = document.createElement('div');
                item.setAttribute('key', c);
                if (c === colorDefault) item.className = 'active';
                item.className = link.className.replace(/\s?\bqe-color\d+\b/g, '');
                item.classList.add('qe-color' + convertColorCode(c));
                item.onclick = function (e) {
                    let color;
                    let e1 = e.target;
                    while (!e1 || !(color = e1.getAttribute('key'))) {
                        e1 = e1.parentNode;
                    }
                    setColor(color, true);
                    for (var i = 0; i < e1.parentNode.children.length; i++) {
                        var e2 = e1.parentNode.children[i];
                        if (e2 === e1) {
                            if (!/\bactive\b/.test(e2.className)) e2.className += ' active';
                        } else {
                            e2.className = e2.className.replace(/\s*\bactive\b/, '');
                        }
                    }
                };
                colorDropdown.appendChild(item);
                if (i === allLinkColor.length - 1) {
                    item.innerHTML = '<img src="' + imgSrcOff + '" />';
                } else {
                    item.innerHTML = '<img src="' + imgSrc + '" />';
                }
            });
            link.appendChild(
                colorDropdown
            );
        });

        this.goldenLayout.on('componentCreated', com => {
        });

        this.goldenLayout.on('itemDestroyed', (event) => {
            dataStorage.hideContextMenu && dataStorage.hideContextMenu()
            if (dataStorage.isChangeLayout) return;
            // closeChartLayout()
            this.isReady = true;
        });
        this.goldenLayout.on('itemCreated', (event) => {
            if (event && event.config && event.config.title === 'Chart') {
                this.isFirst = true;
            }
            this.isCreated = true;
            if (dataStorage.isChangeLayout) return;
            this.isReady = true;
        });
        this.goldenLayout.on('rowCreated', (event) => {
            if (dataStorage.isChangeLayout) return;
            this.isReady = true;
        });
        this.goldenLayout.on('columnCreated', (event) => {
            if (dataStorage.isChangeLayout) return;
            this.isReady = true;
        });
        this.goldenLayout.on('selectionChanged', (event) => {
            if (dataStorage.isChangeLayout) return;
            this.isReady = true;
        });
        this.goldenLayout.on('windowOpened', (event) => {
            if (!window.isSubWindow) {
                that.goldenLayout.eventHub.emit('initial', {
                    dataStorage: dataStorage,
                    userRoles: userRoles
                })
            }
            setTimeout(() => {
                event.getGlInstance().root.contentItems[0].container.react.showContent();
            }, 500);
            if (dataStorage.isChangeLayout) return;
            this.isReady = true;
        });
        this.goldenLayout.on('windowClosed', (event) => {
            if (dataStorage.isChangeLayout) return;
            this.isReady = true;
        });

        if (window.isSubWindow) {
            // registerComponent for popout Window
            if (this.goldenLayout.config.content[0].type === 'component') {
                this.goldenLayout.eventHub.on('initial', (data) => {
                    Object.keys(data.dataStorage).map(key => {
                        if (key === 'callBackReloadTheme' || key === 'headerCallBack' || key === 'translate' || key === 'timeoutPIN' || key === 'session') return
                        if (key === 'goldenLayout') dataStorage[key + 'Main'] = data.dataStorage[key]
                        else dataStorage[key] = data.dataStorage[key]
                    })
                    Object.assign(userRoles, data.userRoles)
                    dataStorage.wrapComponent.id = dataStorage.goldenLayoutMain.id++;
                    dataStorage.goldenLayoutMain.dic[dataStorage.wrapComponent.id] = dataStorage.wrapComponent.broadcast.bind(dataStorage.wrapComponent);
                    setTheme(dataStorage.currentTheme, true)
                });
                setTimeout(() => {
                    this.registerComponent(this.goldenLayout.config.content[0])
                }, 0)
                getSecretKey();
            }
        }

        this.goldenLayout.on('stateChanged', (event) => {
            if (!event) return
            const dom = event.origin.element[0];
            if (dom && dom.react && dom.react.handleStateChange) {
                dom.react.handleStateChange.map(fn => {
                    if (typeof fn === 'function') fn()
                });
            }
            if (!this.readyToSaveLayout || dataStorage.isChangeLayout || !this.isReady) {
                dataStorage.isChangeLayout && (dataStorage.isChangeLayout = false)
                this.isCreated && (this.isCreated = false)
                return;
            }
            if (dataStorage.userInfo && dataStorage.userInfo.user_id) {
                if (this.stateChangedTimeoutId) {
                    clearTimeout(this.stateChangedTimeoutId);
                }
                this.stateChangedTimeoutId = setTimeout(() => {
                    let isCheck = event && event.origin && event.origin.config && event.origin.config.type &&
                        (event.origin.config.type === 'row' || event.origin.config.type === 'column' || event.origin.config.type === 'stack' || event.origin.config.type === 'component');
                    if (this.isCreated) {
                        isCheck = true;
                        this.isCreated = false;
                    }
                    if ((isCheck || this.isDrag === 2) && this.isDrag !== 1) {
                        this.isDrag = 0;
                    } else {
                        if (this.isDrag === 1) {
                            this.isDrag = 2;
                        }
                    }
                }, 500);
            }
        });
        setTimeout(() => {
            this.goldenLayout.init();
        }, 0)
        window.addEventListener('resize', () => {
            this.goldenLayout.updateSize();
        });
    }

    addComponentToStack(index, state = {}) {
        if (dataStorage.goldenLayoutMain) {
            state.popout = true;
            dataStorage.goldenLayoutMain.addComponentToStack(index, state);
            return;
        }
        if (index === 'OpeningAccount') {
            showModal({
                component: ChooseDraft,
                className: 'allowNested'
            });
            return
        }
        if (index === 'SupportTicket') {
            showModal({
                component: SupportTicket,
                className: 'allowNested'
            });
            return
        }
        if (index === 'CreateUserNew') {
            showModal({
                component: CreateUserNew,
                className: 'allowNested'
            });
            return
        }
        if (index === 'TradeConfirmations') {
            showModal({
                component: TradeConfirmations
            });
            return
        }
        if (index === 'DocumentUpload') {
            showModal({
                component: DocumentUpload
            });
            return
        }
        if (index === 'AddGovernmentID') {
            showModal({
                component: AddGovernmentID
            });
            return
        }
        if (index === 'Important') {
            showModal({
                component: Important
            });
            return
        }
        if (index === 'BankAccountDetail') {
            showModal({
                component: BankAccountDetail,
                props: state
            });
            return
        }
        if (index === 'CreditHeader') {
            showModal({
                component: CreditHeader
            });
            return
        }
        if (index === 'CloseApplication') {
            showModal({
                component: CloseApplication
            });
            return
        }
        if (index === 'Terms') {
            showModal({
                component: Terms,
                props: {
                    name: 'TermsAndConditions',
                    noAccBtn: true
                }
            });
            return;
        }

        if (index === 'OrderPadV2') {
            showWindow({
                component: OrderPadV2,
                props: {

                },
                state,
                custom: true
            });
            return;
        }

        if (index === 'BuySellPanel') {
            showPanel({
                component: BuySellPanel,
                props: {

                },
                state,
                custom: true
            });
            return;
        }

        if (index === 'Order' && (state.stateOrder === 'NewOrder' || state.stateOrder === 'ModifyOrder')) {
            let showQuickOrder = (checkRole(MapRoleComponent.QUICK_ORDER_PAD) && !checkRole(MapRoleComponent.NORMAL_ORDER_PAD)) ||
                (checkRole(MapRoleComponent.QUICK_ORDER_PAD) && checkRole(MapRoleComponent.NORMAL_ORDER_PAD) && dataStorage.dataSetting.checkQuickOrderPad) ||
                (state.contingentOrder && checkRole(MapRoleComponent.CONTINGENT_ORDER_PAD));
            if (showQuickOrder) {
                showWindow({
                    component: QuickOrderPad,
                    props: {},
                    state
                });
                return;
            }
        }

        if (index === 'Order' && state.stateOrder === 'DetailOrder' && state.needConfirm) {
            let showQuickOrder = (checkRole(MapRoleComponent.QUICK_ORDER_PAD) && !checkRole(MapRoleComponent.NORMAL_ORDER_PAD)) ||
                (checkRole(MapRoleComponent.QUICK_ORDER_PAD) && checkRole(MapRoleComponent.NORMAL_ORDER_PAD) && dataStorage.dataSetting.checkQuickOrderPad) ||
                (state.contingentOrder && checkRole(MapRoleComponent.CONTINGENT_ORDER_PAD));
            if (showQuickOrder) {
                showWindow({
                    component: QuickCancelOrder,
                    props: {},
                    state
                });
                return;
            }
        }
        let title = '';
        switch (index) {
            case 'Settings':
                showModal({
                    component: Settings
                });
                return;
            case 'MarginAccountSummary':
                title = 'lang_margin_account_summary'
                break;
            case 'RelatedNews':
                title = 'lang_market_news'
                break;
            case 'Activities':
                title = 'lang_activities'
                break;
            case 'NewOrder':
                title = 'lang_new_order'
                break;
            case 'AlertList':
                title = 'lang_alerts'
                break;
            case 'UserGroupManagement':
                title = 'lang_roles_man'
                break;
            case 'PortfolioSummary':
                title = 'lang_portfolio_summary'
                break;
            case 'MarginControlManagementHTML':
                title = 'lang_margin_control_management'
                break;
            case 'WhatsNew':
                showModal({
                    component: WhatsNew
                });
                return;
            case 'WatchlistBottom':
                title = 'lang_watchlist'
                break;
            case 'UserManager':
                title = 'lang_user_manager'
                break;
            case 'VettingRulesManagement':
                title = 'lang_vetting_rules_man'
                break;
            case 'DepositWithdraw': title = 'DepositWithdraw'
                break;
            case 'UserAccount':
                title = dataStorage.userInfo && dataStorage.userInfo.user_type !== role.OPERATION ? 'lang_client_management' : 'lang_user_vs_client_man'
                break;
            case 'ContractNote':
                title = 'lang_contract_notes'
                break;
            case 'MarketOverview':
                title = 'lang_market_overview'
                break;
            case 'CourseOfSale':
                title = 'lang_course_of_sales';
                break;
            case 'AccountSummary':
                title = 'lang_portfolio_summary'
                break;
            case 'Report':
                title = 'lang_insights'
                break;
            case 'MarginControlManagement':
                title = 'lang_margin_control_management'
                break;
            case 'NewReport':
                title = 'lang_reports'
                break;
            case 'OrderList':
                title = 'lang_orders'
                break;
            case 'ChartTV':
                title = 'lang_chart'
                break;
            case 'MarketDepth':
                title = 'lang_market_depth'
                break;
            case 'Portfolio':
                title = 'lang_portfolio_holding'
                break;
            case 'AllHoldings':
                title = 'lang_all_holdings'
                break;
            case 'AllOrders':
                title = 'lang_all_orders'
                break;
            case 'AccountInfo':
            case 'AccountDetail':
            case 'AccountDetailNew':
                title = 'lang_account_details'
                break;
            case 'CreateUser':
                title = 'lang_create_user'
                break;
            case 'AccountManager':
            case 'NewAccountManager':
                title = 'lang_account_man'
                break;
            case 'MarketDataManagement':
            case 'MarketDataManagementNew':
                title = 'lang_market_data_man'
                break;
            case 'MorningStar':
                title = 'lang_morning_star'
                break;
            case 'TipRank':
                title = 'lang_tip_rank'
                break;
            case 'UserInfor':
                title = 'lang_user_infor'
                break;
            case 'BrokerDataReports':
                title = 'lang_broker_data_reports'
                break;
            case 'SecurityDetail':
                title = 'lang_security_detail'
                break;
            case 'ContractList':
                title = 'lang_contract_list'
                break
            case 'NewAlert':
                title = state.isModifyAlert ? 'lang_modify_alert' : 'lang_new_alert'
                break;
            default:
                title = index
                break;
        }
        dataStorage.clickedMenu = true;
        const clr = (dataStorage.lastColorOfLayout && dataStorage.lastColorOfLayout[dataStorage.usingLayout]) || dataStorage.linkColor || 0
        if (['Order', 'UserManager'].includes(index)) {
            state.color = allLinkColor.length - 1;
        } else if (['PortfolioSummary', 'OrderList', 'Portfolio', 'Report', 'UserAccount', 'AccountInfo', 'ContractNote', 'NewReport'].indexOf(index) > -1) {
            if (!state.account) {
                const { newSymbolObj } = getSymbolAccountWhenFirstOpenLayout()
                if (Object.keys(newSymbolObj).length) {
                    state.account = newSymbolObj
                    resetSymbolOfLayout()
                }
                state.account = dataStorage.defaultAccount || {}
            }
            if (!state.color) {
                state.color = clr
            }
        } else {
            state.symbol = dataStorage.defaultSymbol || {}
            if (index === 'RelatedNews') {
                state.symbol = {};
            } else {
                if (index !== 'SecurityDetail' && !state.color) {
                    state.color = clr
                }
            }
        }
        const stateOrder = state.stateOrder;
        let titleOfOrder = '';
        if (stateOrder === 'NewOrder') {
            titleOfOrder = 'lang_new_order'
        } else if (stateOrder === 'DetailOrder') {
            titleOfOrder = 'lang_detail_order_with_order_id'
        } else if (stateOrder === 'ModifyOrder') {
            titleOfOrder = 'lang_modify_order_with_order_id'
        }
        const newItemConfig = {
            'type': 'component',
            'component': index,
            'componentName': 'lm-react-component',
            'isClosable': true,
            'reorderEnabled': true,
            'title': titleOfOrder || title,
            'componentState': state
        };
        this.registerComponent(newItemConfig);
        let stack = this.goldenLayout.root.getItemsByType('stack');
        if (!stack.length) {
            this.goldenLayout.root.addChild(newItemConfig);
        } else {
            let i;
            if (index === 'Order' && state.stateOrder !== 'NewOrder') {
                let orderId = '';
                if (state.data) {
                    if (state.data.orderId) orderId = state.data.orderId;
                    if (state.data.data) orderId = state.data.data.broker_order_id;
                    if (state.data.broker_order_id) orderId = state.data.broker_order_id;
                    if (state.data.dataAccount) orderId = state.data.dataAccount.broker_order_id;
                    if (state.data.key) orderId = state.data.key;
                    if (state.data.display_order_id) orderId = state.data.display_order_id;
                }
                if (orderId) {
                    const lst = this.goldenLayout.root.getItemsByType('component')
                    for (i = 0; i < lst.length; i++) {
                        const componentState = lst[i].container.getState();
                        if (componentState && orderId === componentState.initOrderId) {
                            const obj = lst[i].container.getState() || {};
                            Object.assign(obj, state);
                            lst[i].container.setState(obj);
                            lst[i].parent.header.parent.setActiveContentItem(lst[i])
                            return;
                        }
                    }
                }
            }
            if (index === 'CreateUser' || index === 'CreateUserNew') {
                let userId = '';
                if (state.user_id) {
                    userId = state.user_id;
                    const lst = this.goldenLayout.root.getItemsByType('component')
                    for (i = 0; i < lst.length; i++) {
                        const componentState = lst[i].container.getState();
                        if (componentState && userId === componentState.user_id && lst[i].config.component === index) {
                            const obj = lst[i].container.getState() || {};
                            Object.assign(obj, state);
                            lst[i].container.setState(obj);
                            lst[i].parent.header.parent.setActiveContentItem(lst[i])
                            return;
                        }
                    }
                }
            }

            if (index === 'NewAlert') {
                let alertId = '';
                if (state.alert_id) {
                    alertId = state.alert_id;
                    const lst = this.goldenLayout.root.getItemsByType('component')
                    for (i = 0; i < lst.length; i++) {
                        const componentState = lst[i].container.getState();
                        if (componentState && alertId === componentState.alert_id && lst[i].config.component === index) {
                            const obj = lst[i].container.getState() || {};
                            Object.assign(obj, state);
                            lst[i].container.setState(obj);
                            lst[i].parent.header.parent.setActiveContentItem(lst[i])
                            return;
                        }
                    }
                }
            }

            if (index === 'Activities') {
                let userId = '';
                if (state.user_id) {
                    userId = state.user_id;
                    const lst = this.goldenLayout.root.getItemsByType('component')
                    for (i = 0; i < lst.length; i++) {
                        const componentState = lst[i].container.getState();
                        if (componentState && userId === componentState.initActivities && lst[i].config.component === index) {
                            const obj = lst[i].container.getState() || {};
                            Object.assign(obj, state);
                            lst[i].container.setState(obj);
                            lst[i].parent.header.parent.setActiveContentItem(lst[i])
                            return;
                        }
                    }
                }
            }

            if (index === 'SecurityDetail') {
                let symbol = '';
                if (state.symbol && state.symbol.symbol) {
                    symbol = state.symbol.symbol
                    const lst = this.goldenLayout.root.getItemsByType('component')
                    for (i = 0; i < lst.length; i++) {
                        const componentState = lst[i].container.getState();
                        if (componentState && componentState.symbol && symbol === componentState.symbol.symbol && state.color === componentState.color && lst[i].config.component === index) {
                            const obj = lst[i].container.getState() || {};
                            Object.assign(obj, state);
                            lst[i].container.setState(obj);
                            lst[i].parent.header.parent.setActiveContentItem(lst[i])
                            return;
                        }
                    }
                }
            }
            // try {
            //     if (state.data && state.data.symbolObj && state.data.symbolObj.isRightClick) {
            //         const lst = this.goldenLayout.root.getItemsByType('component')
            //         for (i = 0; i < lst.length; i++) {
            //             let openWidget = lst[i].config.component || ''
            //             let componentState = lst[i].container.getState();
            //             let a = ((openWidget === index) || (componentState.stateOrder === state.stateOrder))
            //             let b = state.data && componentState.data && (state.data.symbolObj.symbol === ((componentState.data.symbolObj && componentState.data.symbolObj.symbol) || componentState.data.symbol))
            //             if (a && b && (state.color === componentState.color)) {
            //                 let obj = lst[i].container.getState() || {};
            //                 Object.assign(obj, state);
            //                 lst[i].container.setState(obj);
            //                 lst[i].parent.header.parent.setActiveContentItem(lst[i])
            //                 return;
            //             }
            //         }
            //     }
            // } catch (ex) {
            //     console.log(ex)
            // }
            let maxH = 0;
            let maxW = 0;
            let stackParent = null;
            for (i = 0; i < stack.length; i++) {
                const dom = stack[i].element[0];
                if (dom.clientWidth > maxW) {
                    maxW = dom.clientWidth;
                    maxH = dom.clientHeight;
                    stackParent = stack[i];
                } else if (dom.clientWidth === maxW) {
                    if (dom.clientHeight > maxH) {
                        stackParent = stack[i];
                    }
                }
            }
            stackParent.addChild(newItemConfig)
        }
    }

    shouldComponentUpdate() {
        return false;
    }

    showNotification(title, body, id, orderId, importantText, isOrder = false) {
        this.showNoti({
            title,
            body,
            id,
            orderId,
            // test: true,
            importantText,
            isOrder
        })
    }
    renderNoAccount() {
        const openOP = () => {
            this.addComponentToStack('OpeningAccount')
        }
        return <div className={`alertNoAccount`} ref={dom => this.alertNoAccount = dom} style={dataStorage.env_config.roles.bannerStax ? { display: 'none' } : {}}>
            <Lang>lang_open_live_account_title</Lang>
            <Button onClick={() => openOP()} style={{ height: '32px', marginLeft: '8px' }}><span className='text-capitalize'><Lang>lang_open_account</Lang></span></Button>
        </div>
    }

    renderSwitchBtn() {
        const openLink = () => {
            window.open('https://www.quant-edge.com/', '_blank')
        }
        return <div style={{ color: 'var(--secondary-light)' }} className={`alertNoAccount`} ref={dom => this.switchLiveBtn = dom} style={dataStorage.env_config.roles.bannerStax ? { display: 'none' } : {}}>
            <Lang>lang_open_live_account_title</Lang>
            <Button onClick={() => openLink()} style={{ height: '32px', marginLeft: '8px' }}><span className='text-capitalize'><Lang>lang_open_live_account</Lang></span></Button>
        </div>
    }

    render() {
        return <MuiThemeProvider>
            <div>
                <Notification func={(fn) => this.showNoti = fn}></Notification>
                <div className='layout'>
                    <Header />
                    <div className={`alertConnection size--3 text-capitalize`} ref={dom => this.alertConnection = dom}><Lang>lang_connecting</Lang>...</div>
                    {!dataStorage.env_config.roles.bannerStax && dataStorage.userInfo ? this.renderNoAccount() : null}
                    {!dataStorage.env_config.roles.bannerStax && dataStorage.userInfo ? this.renderSwitchBtn() : null}
                    <div className={`bannerAccountOpening show`} ref={dom => this.banner = dom}><Banner /></div>
                    <div className={`alertDelayed text-capitalize`} ref={dom => this.alertSession = dom}><Lang>lang_another_session_login</Lang></div>
                    <div className={`alertDelayed timeHoliday`} ref={dom => this.onlyExchange = dom}></div>
                    <div className='goldenLayout' ref={dom => this.layout = dom} />
                    {dataStorage.env_config.roles.showFooter ? <Footer /> : null}
                </div>
                <LoadingScreen setRef={ref => this.loadingScreen = ref} />
                <input style={{ opacity: 0, width: 1, height: 1 }} id='hiddenInput' />
            </div>
        </MuiThemeProvider>
    }
}

GoldenLayoutWrapper.contextTypes = {
    store: PropTypes.object.isRequired
};

export default translate('translations')(GoldenLayoutWrapper)
