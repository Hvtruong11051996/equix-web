import React from 'react';
import Icon from '../Inc/Icon';
import { translate } from 'react-i18next';
import logger from '../../helper/log';
import Pin from '../Pin';
import dataStorage from '../../dataStorage'
import ForgotPIN from './ForgotPIN';
import ChangePassword from './ChangePassword';
import { postChangePin } from '../../helper/api';
import requireTimeSetting from '../../constants/require_time';
import settingTitle from '../../constants/setting_title';
import { registerUser, unregisterUser } from '../../streaming';
import { saveDataSetting, todo } from '../../helper/functionUtils';
import { changePinAction } from '../../helper/loginFunction';
import Lang from '../Inc/Lang'
import NoTag from '../Inc/NoTag/NoTag';
import moment from 'moment';
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon';
class SettingsRow extends React.Component {
    constructor(props) {
        super(props);
        this.isMount = false
        const orderNotifications = props.orderNotifications || {};
        const requireTime = props.requireTime !== null && props.requireTime !== undefined ? props.requireTime : requireTimeSetting.ON_CHANGE;
        const showCancelled = orderNotifications.showCancelled;
        const showExpired = orderNotifications.showExpired;
        const showFilled = orderNotifications.showFilled;
        const showOnMarket = orderNotifications.showOnMarket;
        const showPartialFill = orderNotifications.showPartialFill;
        const showRejected = orderNotifications.showRejected;
        const showAllNews = props.showAllNews;
        this.accessToken = null;
        this.state = {
            orderNotifications,
            requireTime,
            title: props.title || '',
            showCancelled,
            showExpired,
            showFilled,
            showOnMarket,
            showPartialFill,
            showRejected,
            showAllNews,
            showForgotPIN: props.showForgotPIN,
            timeZone: this.props.timeZone || dataStorage.timeZone
        }
        this.realTimeData = this.realTimeData.bind(this);
        this.saveNewSetting = this.saveNewSetting.bind(this)
    }

    componentDidMount() {
        this.isMount = true
        setTimeout(() => {
            this.refTimeZone && this.refTimeZone.scrollIntoView()
        }, 1000)
        const userId = dataStorage.userInfo && dataStorage.userInfo.user_id;
        registerUser(userId, this.realTimeData, 'user_setting');
    }

    realTimeData(setting) {
        if (setting['timezone']) return
        if (setting) {
            const obj = {};
            for (const key in setting) {
                switch (key) {
                    case 'showNotifications':
                        if (this.props.title !== 'Authentication') {
                            break;
                        } else {
                            dataStorage.isShowNotification = setting[key];
                            break;
                        }
                    case 'requireTime':
                        if (this.props.title !== 'Authentication') break;
                        obj[key] = setting[key];
                        dataStorage.requireTime = setting[key];
                        dataStorage.verifiedPin = setting[key] !== requireTimeSetting.ON_CHANGE;
                        localStorageNew && localStorageNew.setItem(`requireTime_${dataStorage.loginEmail}`, setting[key]);
                        break;
                    case 'showAllNews': case 'showCancelled': case 'showExpired': case 'showPartialFill':
                    case 'showFilled': case 'showOnMarket': case 'showRejected':
                        obj[key] = setting[key];
                        break;
                }
            }
            this.isMount && this.setState(obj);
        }
    }

    componentWillReceiveProps(nextProps) {
        try {
            const newState = {};
            switch (nextProps.title) {
                case settingTitle.NEWS:
                    newState['showAllNews'] = nextProps.showAllNews;
                    break;
                case settingTitle.ORDER:
                    const orderNotifications = nextProps.orderNotifications || {};
                    newState['showCancelled'] = orderNotifications.showCancelled;
                    newState['showExpired'] = orderNotifications.showExpired;
                    newState['showFilled'] = orderNotifications.showFilled;
                    newState['showOnMarket'] = orderNotifications.showOnMarket;
                    newState['showPartialFill'] = orderNotifications.showPartialFill;
                    newState['showRejected'] = orderNotifications.showRejected;
                    break;
                case settingTitle.SECURITY:
                    newState['requireTime'] = nextProps.requireTime !== null && nextProps.requireTime !== undefined ? nextProps.requireTime : requireTimeSetting.ON_CHANGE;
                    break;
                case settingTitle.AUTHENTICATION: break;
            }
            newState['currentHover'] = nextProps.currentHover;
            newState['showForgotPIN'] = nextProps.showForgotPIN;
            this.isMount && this.setState(newState);
        } catch (error) {
            logger.error('componentWillReceiveProps On Settings' + error)
        }
    }

    handleOnMouseEnter(e) {
        try {
            if (!e.target.classList.contains('mainRow') || e.target.classList.contains('active')) return;
            const elements = e.target.parentNode.parentNode.getElementsByClassName('mainRow');

            for (var i = 0; i < elements.length; i++) {
                if (elements[i] !== e.target) elements[i].classList.remove('active')
            }
            e.target.classList.add('active');
        } catch (error) {
            logger.error('handleOnMouseEnter On Settings' + error)
        }
    }

    saveNewSetting(key, value) {
        const newObj = {};
        const newState = {};
        newObj[key] = value;
        if (key === 'timezone') {
            newState['timeZone'] = value;
        } else {
            newState[key] = value;
        }
        this.isMount && this.setState(newState);
        saveDataSetting({ data: newObj }).then(() => {
            dataStorage[key] = value;
            if (key === 'timezone') {
                dataStorage.timeZone = value;
            }
            if (key === 'requireTime') {
                dataStorage.requireTime = value;
                dataStorage.verifiedPin = value !== requireTimeSetting.ON_CHANGE;
                localStorageNew && localStorageNew.setItem(`requireTime_${dataStorage.loginEmail}`, value);
            }
        })
    }

    renderNewsNotifications() {
        try {
            return (
                <div className='rightSettings'>
                    <div className='myRow lower' onClick={this.state.showAllNews ? this.saveNewSetting.bind(this, 'showAllNews', false) : () => { }}>
                        <div className='text-capitalize'><Lang>lang_show_only_price_sensitive_notifications</Lang></div>
                        <div>
                            {
                                !this.state.showAllNews
                                    ? <SvgIcon path={path.mdiCheckBoxOutline} />
                                    : <SvgIcon path={path.mdiCheckboxBlankOutline} />
                            }
                        </div>
                    </div>
                    <div className='line'></div>
                    <div className='myRow' onClick={!this.state.showAllNews ? this.saveNewSetting.bind(this, 'showAllNews', true) : () => { }}>
                        <div className='text-capitalize'><Lang>lang_show_all_related_news_notifications</Lang></div>
                        <div>
                            {
                                this.state.showAllNews
                                    ? <SvgIcon path={path.mdiCheckBoxOutline} />
                                    : <SvgIcon path={path.mdiCheckboxBlankOutline} />
                            }
                        </div>
                    </div>
                </div>
            )
        } catch (error) {
            logger.error('renderNewsNotifications On Settings' + error)
        }
    }

    renderOrderNotifications() {
        try {
            return (
                <div className='rightSettings'>
                    <div className='myRow lower' onClick={this.saveNewSetting.bind(this, 'showOnMarket', !this.state.showOnMarket)}>
                        <div className='text-capitalize'><Lang>lang_show_on_market_notifications</Lang></div>
                        <div>
                            {
                                this.state.showOnMarket
                                    ? <SvgIcon path={path.mdiCheckBoxOutline} />
                                    : <SvgIcon path={path.mdiCheckboxBlankOutline} />
                            }
                        </div>
                    </div>
                    <div className='line'></div>
                    <div className='myRow' onClick={this.saveNewSetting.bind(this, 'showFilled', !this.state.showFilled)}>
                        <div className='text-capitalize'><Lang>lang_show_filled_notifications</Lang></div>
                        <div>
                            {
                                this.state.showFilled
                                    ? <SvgIcon path={path.mdiCheckBoxOutline} />
                                    : <SvgIcon path={path.mdiCheckboxBlankOutline} />
                            }
                        </div>
                    </div>
                    <div className='line'></div>
                    <div className='myRow' onClick={this.saveNewSetting.bind(this, 'showPartialFill', !this.state.showPartialFill)}>
                        <div className='text-capitalize'><Lang>lang_show_partial_filled_notifications</Lang></div>
                        <div>
                            {
                                this.state.showPartialFill
                                    ? <SvgIcon path={path.mdiCheckBoxOutline} />
                                    : <SvgIcon path={path.mdiCheckboxBlankOutline} />
                            }
                        </div>
                    </div>
                    <div className='line'></div>
                    <div className='myRow' onClick={this.saveNewSetting.bind(this, 'showRejected', !this.state.showRejected)}>
                        <div className='text-capitalize'><Lang>lang_show_rejected_order_notifications</Lang></div>
                        <div>
                            {
                                this.state.showRejected
                                    ? <SvgIcon path={path.mdiCheckBoxOutline} />
                                    : <SvgIcon path={path.mdiCheckboxBlankOutline} />
                            }
                        </div>
                    </div>
                    <div className='line'></div>
                    <div className='myRow' onClick={this.saveNewSetting.bind(this, 'showCancelled', !this.state.showCancelled)}>
                        <div className='text-capitalize'><Lang>lang_show_cancelled_notifications</Lang></div>
                        <div>
                            {
                                this.state.showCancelled
                                    ? <SvgIcon path={path.mdiCheckBoxOutline} />
                                    : <SvgIcon path={path.mdiCheckboxBlankOutline} />
                            }
                        </div>
                    </div>
                    <div className='line'></div>
                    <div className='myRow' onClick={this.saveNewSetting.bind(this, 'showExpired', !this.state.showExpired)}>
                        <div className='text-capitalize'><Lang>lang_show_expired_notifications</Lang></div>
                        <div>
                            {
                                this.state.showExpired
                                    ? <SvgIcon path={path.mdiCheckBoxOutline} />
                                    : <SvgIcon path={path.mdiCheckboxBlankOutline} />
                            }
                        </div>
                    </div>
                </div>
            )
        } catch (error) {
            logger.error('renderOrderNotifications On Settings' + error)
        }
    }

    handleChangePIN() {
        try {
            this.isMount && this.setState({
                title: 'Change PIN Old PIN'
            })
        } catch (error) {
            logger.error('handleChangePIN On Settings' + error)
        }
    }

    handleForgotPIN() {
        try {
            this.isMount && this.setState({
                title: 'Forgot PIN'
            })
        } catch (error) {
            logger.error('handleForgotPIN On Settings' + error)
        }
    }

    handleChangePassword() {
        try {
            this.isMount && this.setState({
                title: 'Change Password'
            })
        } catch (error) {
            logger.error('handleChangePassword On Settings' + error)
        }
    }

    renderSecurity() {
        try {
            return (
                <div className='rightSettings security'>
                    <div className='myRow lower' onClick={this.handleChangePIN.bind(this)}>
                        <div><Lang>lang_change_pin</Lang></div>
                    </div>
                    <div className='line'></div>
                    <div className='myRow' onClick={this.handleForgotPIN.bind(this)}>
                        <div><Lang>lang_forgot_pin</Lang></div>
                    </div>
                    <div className='line'></div>
                    <div className='myRow' onClick={this.handleChangePassword.bind(this)}>
                        <div className='text-capitalize'><Lang>lang_change_password</Lang></div>
                    </div>
                </div>
            )
        } catch (error) {
            logger.error('renderAuthentication On Settings' + error)
        }
    }

    renderAuthentication() {
        try {
            return (
                <div className='rightSettings'>
                    <div className='myRow lower' onClick={this.state.requireTime !== requireTimeSetting.ON_CHANGE ? this.saveNewSetting.bind(this, 'requireTime', requireTimeSetting.ON_CHANGE) : () => { }}>
                        <div><Lang>lang_on_changing_infomation_and_orders</Lang></div>
                        <div>
                            {
                                this.state.requireTime === requireTimeSetting.ON_CHANGE
                                    ? <SvgIcon path={path.mdiCheckBoxOutline} />
                                    : <SvgIcon path={path.mdiCheckboxBlankOutline} />
                            }
                        </div>
                    </div>
                    <div className='line'></div>
                    <div className='myRow' onClick={this.state.requireTime !== requireTimeSetting.FIVE_MINUTES ? this.saveNewSetting.bind(this, 'requireTime', requireTimeSetting.FIVE_MINUTES) : () => { }}>
                        <div><Lang>lang_after_five_minutes_of_inactive</Lang></div>
                        <div>
                            {
                                this.state.requireTime === requireTimeSetting.FIVE_MINUTES
                                    ? <SvgIcon path={path.mdiCheckBoxOutline} />
                                    : <SvgIcon path={path.mdiCheckboxBlankOutline} />
                            }
                        </div>
                    </div>
                    <div className='line'></div>
                    <div className='myRow' onClick={this.state.requireTime !== requireTimeSetting.FIFTEEN_MINUTES ? this.saveNewSetting.bind(this, 'requireTime', requireTimeSetting.FIFTEEN_MINUTES) : () => { }}>
                        <div><Lang>lang_after_fifteen_minutes_of_inactive</Lang></div>
                        <div>
                            {
                                this.state.requireTime === requireTimeSetting.FIFTEEN_MINUTES
                                    ? <SvgIcon path={path.mdiCheckBoxOutline} />
                                    : <SvgIcon path={path.mdiCheckboxBlankOutline} />
                            }
                        </div>
                    </div>
                </div>
            )
        } catch (error) {
            logger.error('render Security On Settings' + error)
        }
    }

    renderChangePINOldPIN() {
        return (
            <div className='rightSettings'>
                <Pin
                    title={'Change PIN Old PIN'}
                    cancel={() => {
                        this.isMount && this.setState({
                            title: 'Security'
                        })
                    }}
                    done={(pin, cb, refreshToken) => {
                        pin && todo(pin);
                        postChangePin(refreshToken, pin).then(res => {
                            if (res && res.data) {
                                const tokenKey = `${dataStorage.loginEmail}_refresh_token`;
                                localStorageNew && localStorageNew.setItem(tokenKey, res.data.refreshToken);
                                dataStorage.accessToken = res.data.accessToken;
                                logger.log('CHECK TOKEN ===> SETTING loginAction showModal postPin SET NEW TOKEN: ', dataStorage);
                            }
                            cb && cb();
                            this.isMount && this.setState({
                                title: 'Security'
                            }, () => this.props.renderError())
                        }).catch(e => {
                            logger.error('change pin error');
                        });
                    }} />
            </div>
        )
    }

    renderForgotPINNewPIN() {
        return (
            <div className='rightSettings'>
                <Pin
                    title={'Forgot PIN New PIN'}
                    cancel={(item) => {
                        if (item === 'Forgot PIN') {
                            this.isMount && this.setState({
                                title: 'Forgot PIN'
                            })
                        } else {
                            this.isMount && this.setState({
                                title: 'Security'
                            })
                        }
                    }}
                    done={(pin, cb) => {
                        pin && todo(pin);
                        this.isMount && this.setState({
                            title: 'Security',
                            showForgotPIN: false
                        }, () => {
                            this.props.doneForgotPIN && this.props.doneForgotPIN();
                            changePinAction(this.accessToken, pin, () => {
                                if (this.props.closeSuccess) {
                                    dataStorage.goldenLayout.initGoldenLayout(null, this.props.closeSuccess);
                                } else {
                                    dataStorage.goldenLayout.initGoldenLayout();
                                }
                            });
                        })
                    }} />
            </div>
        )
    }

    renderForgotPIN() {
        return (
            <ForgotPIN
                showForgotPIN={this.state.showForgotPIN}
                changeTitle={(value, token) => {
                    this.accessToken = token;
                    this.isMount && this.setState({
                        title: value
                    });
                }} />
        )
    }

    renderChangePassword() {
        return (
            <ChangePassword changeTitle={isSuccess => {
                this.isMount && this.setState({
                    title: 'Security'
                });
                isSuccess && this.props.renderError && this.props.renderError(true)
            }} />
        )
    }

    renderTitle(title) {
        switch (title) {
            case 'News Notifications':
                return <Lang>lang_news_notifications</Lang>
            case 'Order Notifications':
                return <Lang>lang_order_notifications</Lang>
            case 'Authentication':
                return <Lang>lang_authentication</Lang>
            case 'Time_zone':
                return <Lang>lang_time_zone</Lang>
            case 'Security':
                return <Lang>lang_security</Lang>
            default:
                return <Lang>lang_security</Lang>
        }
    }

    changeGridType(check) {
        if (check) {
            localStorageNew.setItem('agridType', 'single');
            this.isMount && this.setState({
                agridType: 'single'
            })
        } else {
            localStorageNew.setItem('agridType', 'doulble');
            this.isMount && this.setState({
                agridType: 'doulble'
            })
        }
    }

    renderRowContent(title) {
        switch (title) {
            case 'News Notifications':
                return this.renderNewsNotifications();
            case 'Order Notifications':
                return this.renderOrderNotifications();
            case 'Security':
                if (this.state.showForgotPIN) {
                    return this.renderForgotPIN()
                }
                return this.renderSecurity();
            case 'Authentication':
                return this.renderAuthentication();
            case 'Change PIN New PIN':
                return this.renderChangePINNewPIN()
            case 'Change PIN Old PIN':
                return this.renderChangePINOldPIN();
            case 'Forgot PIN':
                return this.renderForgotPIN();
            case 'Change Password':
                return this.renderChangePassword();
            case 'Forgot PIN New PIN':
                return this.renderForgotPINNewPIN();
            default:
                return this.renderRightDefault();
        }
    }

    componentWillUnmount() {
        this.isMount = false
        const userId = dataStorage.userInfo && dataStorage.userInfo.user_id;
        unregisterUser(userId, this.realTimeData, 'user_setting');
    }
    renderRightDefault() {
        return (
            <div className='rightSettings'>
                <div className='myRow title'>
                    <div>
                        <img src='common/favicon.ico' width='48px' height='48px' />
                    </div>
                    <div><Lang>Version_2_7_12_build_2018</Lang>{new Date().getFullYear()}</div>
                </div>
                <div className='myRow'>
                    <div>
                        <div className='text-capitalize'><Lang>lang_app_store</Lang></div>
                        <div className='small'><Lang>lang_download_on_app_store</Lang></div>
                    </div>
                    <a href='https://itunes.apple.com/au/app/id1267749753?mt=8' target='_blank' rel='noopener noreferrer'>

                        <div>
                            <Icon src={'action/launch'} style={{ 'height': '20px' }} />
                        </div>
                    </a>
                </div>
                <div className='line'></div>
                <div className='myRow'>
                    <div>
                        <div><Lang>lang_google_play</Lang></div>
                        <div className='small'><Lang>lang_android_app_on_google_play</Lang></div>
                    </div>
                    <a href='https://play.google.com/store/apps/details?id=com.quantedge.equix3' target='_blank' rel='noopener noreferrer'>
                        <div>
                            <Icon src={'action/launch'} style={{ 'height': '20px' }} />
                        </div>
                    </a>
                </div>
                <div className='line'></div>
                <div className='myRow'>
                    <div>
                        <div className='text-capitalize'><Lang>lang_website</Lang></div>
                        <div className='small'>https://equixapp.com</div>
                    </div>
                    <a href='https://equixapp.com' target='_blank' rel='noopener noreferrer'>
                        <div>
                            <Icon src={'action/launch'} style={{ 'height': '20px' }} />
                        </div>
                    </a>
                </div>
                <div className='myRow last'><Lang>lang_config_release_year</Lang> - {new Date().getFullYear()} &#169; <Lang>lang_config_copyright</Lang></div>
            </div>
        )
    }

    render() {
        const showForgotPIN = this.state.showForgotPIN;
        const noneAction = showForgotPIN ? 'noneAction' : '';
        let flag = this.state.title.replace(/ /g, '').toLowerCase();
        const originFlag = flag;
        if (flag.includes('pin') || flag === 'changepassword') flag = 'security';
        return (
            <div className={`myRow ${noneAction} ${flag} ${originFlag}`} onMouseOver={this.handleOnMouseEnter.bind(this)}>
                <div className={`mainRow  ${flag === 'security' ? 'active' : ''}`}>
                    <div className='text-capitalize'>{this.renderTitle(this.state.title)}</div>
                    <div className='icon'>
                        <Icon src={'hardware/keyboard-arrow-right'} color={((flag === 'security') && showForgotPIN) ? 'var(--hover-default)' : null} />
                    </div>
                </div>

                <div className={`rowRightContent`} style={{ borderBottom: '25px solid var(--semantic-primary)' }}
                    style={showForgotPIN ? { pointerEvents: 'auto' } : {}}>
                    {this.renderRowContent(this.state.title)}
                </div>
            </div >
        )
    }
}

export default translate('translations')(SettingsRow)
