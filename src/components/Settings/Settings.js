import React from 'react';
import Icon from '../Inc/Icon'
import Lang from '../Inc/Lang'
import dataStorage from '../../dataStorage'
import SettingsRow from './SettingsRow';
import logger from '../../helper/log';
import { checkRole, getDataSetting, saveDataSetting, addVerUrl } from '../../helper/functionUtils';
import requireTimeSetting from '../../constants/require_time';
import PriceSourceEnum from '../../constants/price_source_enum';
import config from '../../../public/config';
import marketDataTypeEmums from '../../constants/market_data_type';
import MapRoleComponent from '../../constants/map_role_component.js'
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon';

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.isMount = false
        const setting = dataStorage.dataSetting || {};
        const isNewUser = !Object.keys(setting).length
        const showNotifications = isNewUser ? true : !!setting.showNotifications;
        const showAllNews = isNewUser ? false : !!setting.showAllNews;
        const orderNotifications = {
            showCancelled: isNewUser ? true : !!setting.showCancelled,
            showExpired: isNewUser ? true : !!setting.showExpired,
            showFilled: isNewUser ? true : !!setting.showFilled,
            showOnMarket: isNewUser ? true : !!setting.showOnMarket,
            showRejected: isNewUser ? true : !!setting.showRejected,
            showPartialFill: isNewUser ? false : !!setting.showPartialFill
        };
        const requireTime = setting.requireTime ? setting.requireTime : requireTimeSetting.ON_CHANGE;
        this.state = {
            setting,
            errorValue: '',
            showError: false,
            showForgotPIN: props.forgotPIN,
            showNotifications,
            showAllNews,
            orderNotifications,
            requireTime,
            timeZone: false
        }
    }

    componentWillUnmount() {
        this.isMount = false
    }

    componentDidMount() {
        this.isMount = true
        const defaultSetting = ['lang', 'timezone', 'hideTermsForm']
        if (dataStorage.dataSetting) {
            const setting = dataStorage.dataSetting || {};
            dataStorage.dataSetting = Object.assign(dataStorage.dataSetting, setting);
            const newSettingKeys = Object.keys(setting).filter(key => !defaultSetting.includes(key))
            const isNewUser = !Object.keys(newSettingKeys).length
            const showNotifications = isNewUser ? true : !!setting.showNotifications;
            const showAllNews = isNewUser ? false : !!setting.showAllNews;
            let checkQuickOrderPad = setting.checkQuickOrderPad;
            const orderNotifications = {
                showCancelled: isNewUser ? true : !!setting.showCancelled,
                showExpired: isNewUser ? true : !!setting.showExpired,
                showFilled: isNewUser ? true : !!setting.showFilled,
                showOnMarket: isNewUser ? true : !!setting.showOnMarket,
                showRejected: isNewUser ? true : !!setting.showRejected,
                showPartialFill: isNewUser ? false : !!setting.showPartialFill,
                timeZone: setting.timeZone
            }
            const requireTime = setting.requireTime !== null && setting.requireTime !== undefined ? setting.requireTime : requireTimeSetting.ON_CHANGE;
            const streamingPrice = setting.streamingPrice || false;
            dataStorage.isShowNotification = showNotifications;
            dataStorage.showAllNews = showAllNews;
            dataStorage.showCancelled = orderNotifications.showCancelled;
            dataStorage.showExpired = orderNotifications.showExpired;
            dataStorage.showFilled = orderNotifications.showFilled;
            dataStorage.showOnMarket = orderNotifications.showOnMarket;
            dataStorage.showRejected = orderNotifications.showRejected;
            dataStorage.showPartialFill = orderNotifications.showPartialFill;
            dataStorage.checkQuickOrderPad = checkQuickOrderPad;
            // dataStorage.timeZone = setting.timezone
            dataStorage.timeZone = 'Australia/Sydney'
            this.isMount && this.setState({
                streamingPrice,
                showNotifications,
                showAllNews,
                orderNotifications,
                requireTime,
                timeZone: dataStorage.timezone,
                checkQuickOrderPad
            });
        }
        getDataSetting().then(response => {
            if (response) {
                const setting = response.data || {};
                dataStorage.dataSetting = Object.assign(dataStorage.dataSetting, setting);
                const newSettingKeys = Object.keys(setting).filter(key => !defaultSetting.includes(key))
                const isNewUser = !Object.keys(newSettingKeys).length
                const showNotifications = isNewUser ? true : !!setting.showNotifications;
                const showAllNews = isNewUser ? false : !!setting.showAllNews;
                let checkQuickOrderPad = setting.checkQuickOrderPad;
                const orderNotifications = {
                    showCancelled: isNewUser ? true : !!setting.showCancelled,
                    showExpired: isNewUser ? true : !!setting.showExpired,
                    showFilled: isNewUser ? true : !!setting.showFilled,
                    showOnMarket: isNewUser ? true : !!setting.showOnMarket,
                    showRejected: isNewUser ? true : !!setting.showRejected,
                    showPartialFill: isNewUser ? false : !!setting.showPartialFill,
                    timeZone: setting.timeZone
                }
                const requireTime = setting.requireTime !== null && setting.requireTime !== undefined ? setting.requireTime : requireTimeSetting.ON_CHANGE;
                const streamingPrice = setting.streamingPrice || false;
                dataStorage.isShowNotification = showNotifications;
                dataStorage.showAllNews = showAllNews;
                dataStorage.showCancelled = orderNotifications.showCancelled;
                dataStorage.showExpired = orderNotifications.showExpired;
                dataStorage.showFilled = orderNotifications.showFilled;
                dataStorage.showOnMarket = orderNotifications.showOnMarket;
                dataStorage.showRejected = orderNotifications.showRejected;
                dataStorage.showPartialFill = orderNotifications.showPartialFill;
                dataStorage.checkQuickOrderPad = checkQuickOrderPad;
                // dataStorage.timeZone = setting.timezone
                dataStorage.timeZone = 'Australia/Sydney'
                this.isMount && this.setState({
                    streamingPrice,
                    showNotifications,
                    showAllNews,
                    orderNotifications,
                    requireTime,
                    timeZone: dataStorage.timezone,
                    checkQuickOrderPad
                });
            }
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.forgotPIN) {
            this.isMount && this.setState({
                showForgotPIN: nextProps.forgotPIN
            })
        }
    }

    hiddenWarning(isChangePassword) {
        try {
            setTimeout(() => this.isMount && this.setState({ showError: false }, () => {
            }), 2000)
        } catch (error) {
            logger.error('hiddenWarning On Settings' + error)
        }
    }

    renderError(isChangePassword) {
        this.isMount && this.setState({
            errorValue: isChangePassword ? 'changepasssuccess' : 'success',
            showError: true
        }, () => this.hiddenWarning(isChangePassword))
    }

    handleShowSettings() {
        try {
            this.props.close();
        } catch (error) {
            logger.error('handleShowSettings On Settings' + error)
        }
    }

    renderRightDefault() {
        const android = dataStorage.env_config.api.ggPlay
        const iphone = dataStorage.env_config.api.appStore
        const web = dataStorage.env_config.api.website
        const logo = dataStorage.theme === 'theme-dark' ? dataStorage.env_config.branding.logoDark : dataStorage.env_config.branding.logoLight
        return (
            <div className='rightSettings'>
                <div className='myRow title'>
                    <div className='loginLogoBroker' style={{ backgroundImage: `url(${addVerUrl(logo)})` }}></div>
                    <div><Lang>Version_2_7_12_build_2018</Lang>{new Date().getFullYear()}</div>
                </div>
                <div className='myRow'>
                    <div style={{ flex: '1', minWidth: '0' }}>
                        <div className='text-capitalize' style={{ width: '36%', display: 'flex', lineHeight: '32px' }}><Lang>lang_app_store</Lang></div>
                        <div className='small showTitle' style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '32px', marginLeft: '10px' }}><Lang>{dataStorage.env_config.api.appStore ? 'lang_download_on_app_store' : 'lang_available_soon'}</Lang></div>
                    </div>
                    {dataStorage.env_config.api.appStore
                        ? <a href={iphone} target='_blank' rel='noopener noreferrer'>
                            <div>
                                <Icon src={'action/launch'} style={{ 'height': '20px' }} />
                            </div>
                        </a>
                        : <a><Icon src={'action/launch'} style={{ 'height': '20px', 'opacity': '.5' }} /></a>}
                </div>
                <div className='line'></div>
                <div className='myRow'>
                    <div style={{ flex: '1', minWidth: '0' }}>
                        <div className='text-capitalize' style={{ width: '36%', display: 'flex', lineHeight: '32px' }}><Lang>lang_google_play</Lang></div>
                        <div className='small showTitle' style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '32px', marginLeft: '10px' }}><Lang>{dataStorage.env_config.api.ggPlay ? 'lang_android_app_on_google_play' : 'lang_available_soon'}</Lang></div>
                    </div>
                    {dataStorage.env_config.api.ggPlay
                        ? <a href={android} target='_blank' rel='noopener noreferrer'>
                            <div>
                                <Icon src={'action/launch'} style={{ 'height': '20px' }} />
                            </div>
                        </a>
                        : <a><Icon src={'action/launch'} style={{ 'height': '20px', 'opacity': '.5' }} /></a>}
                </div>
                <div className='line'></div>
                <div className='myRow'>
                    <div style={{ flex: '1', minWidth: '0' }}>
                        <div className='text-capitalize' style={{ width: '36%', display: 'flex', lineHeight: '32px' }}><Lang>lang_website</Lang></div>
                        <div className='small showTitle' style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '32px', marginLeft: '10px' }}>{web}</div>
                    </div>
                    {dataStorage.env_config.api.website
                        ? <a href={web} target='_blank' rel='noopener noreferrer'>
                            <div>
                                <Icon src={'action/launch'} style={{ 'height': '20px' }} />
                            </div>
                        </a>
                        : <a><Icon src={'action/launch'} style={{ 'height': '20px', 'opacity': '.5' }} /></a>}
                </div>
                <div className='myRow last'><Lang>lang_config_copyright</Lang> &#169; <Lang>lang_config_release_year</Lang> - {new Date().getFullYear()} </div>
            </div>
        )
    }

    handleOnMouseEnter(e) {
        if (!e.target.classList.contains('mainRow') || e.target.classList.contains('active')) return;
        const elements = e.target.parentNode.parentNode.getElementsByClassName('mainRow');

        for (let i = 0; i < elements.length; i++) {
            if (elements[i] !== e.target) elements[i].classList.remove('active')
        }
        e.target.classList.add('active');
    }

    handleShowNotifications(isShow) {
        try {
            if (this.state.showForgotPIN || isShow === this.state.showNotifications) return;
            const newObj = {};
            newObj[`showNotifications`] = !!(isShow);
            saveDataSetting({ data: newObj }).then(() => {
                dataStorage.isShowNotification = !!(isShow);
                this.isMount && this.setState({
                    showNotifications: !!(isShow)
                })
            })
        } catch (error) {
            logger.error('handleShowNotifications On Settings' + error)
        }
    }

    saveSetting(element, streaming = false) {
        if (element && element.parentNode) {
            element.parentNode.childNodes.forEach(node => {
                node.classList.remove('active')
            })
            element.classList.add('active')
        }
        saveDataSetting({
            data: {
                streamingPrice: streaming
            }
        })
    }

    handleDoneForgotPIN() {
        this.props.closePin && this.props.closePin()
        this.props.close && this.props.close();
    }
    rederPriceSource() {
        if (!dataStorage.userInfo) {
            return <Lang>lang_20_minutes_delayed</Lang>
        }
        const marketDataTypeObj = dataStorage.env_config.roles.useNewMarketData ? (dataStorage.marketDataType || {}) : {
            marketDataType: dataStorage.userInfo.market_data_type,
            marketDataAu: dataStorage.userInfo.market_data_au,
            marketDataFu: dataStorage.userInfo.market_data_fu,
            marketDataUs: dataStorage.userInfo.market_data_us
        }
        switch (Math.max(...Object.values(marketDataTypeObj))) {
            case marketDataTypeEmums.STREAMING: return <Lang>lang_streaming</Lang>
            case marketDataTypeEmums.DELAYED: return <Lang>lang_delayed</Lang>
            case marketDataTypeEmums.NOACCESS: return <Lang>lang_no_access</Lang>
            case marketDataTypeEmums.CLICK2REFRESH: return <Lang>lang_click_2_refresh</Lang>
        }
        return <Lang>lang_click_2_refresh</Lang>
    }
    handleCheckQuickOrderPad = () => {
        try {
            let newObj = {}
            newObj[`checkQuickOrderPad`] = !(this.state.checkQuickOrderPad);
            saveDataSetting({ data: newObj }).then(() => {
                this.isMount && this.setState({
                    checkQuickOrderPad: !(this.state.checkQuickOrderPad)
                })
            })
        } catch (error) {
            logger.error('handleCheckQuickOrderPad On Settings' + error)
        }
    }
    renderLeftSettings() {
        try {
            const showForgotPIN = this.state.showForgotPIN;
            const noneAction = showForgotPIN ? 'noneAction' : ''
            return <div>
                <div className={`myRow ${noneAction}`} onMouseOver={this.handleOnMouseEnter.bind(this)}>
                    <div className={`mainRow text-capitalize ${showForgotPIN ? 'disable' : ''}`}>
                        <div><Lang>lang_price_source</Lang></div>
                        <div className='small text-capitalize'>{this.rederPriceSource()}</div>
                    </div>
                </div>
                {
                    (checkRole(MapRoleComponent.QUICK_ORDER_PAD) && checkRole(MapRoleComponent.NORMAL_ORDER_PAD))
                        ? <div className={`myRow ${noneAction}`} style={{ margin: '22px 0px 22px 0px' }}>
                            <div className={`mainRow ${showForgotPIN ? 'disable' : ''}`}>
                                <div className='text-capitalize'><Lang>lang_quick_order_pad</Lang></div>
                                <div className='icon' onClick={this.handleCheckQuickOrderPad}>
                                    {
                                        this.state.checkQuickOrderPad
                                            ? <SvgIcon path={path.mdiCheckBoxOutline} />
                                            : <SvgIcon path={path.mdiCheckboxBlankOutline} />
                                    }
                                </div>
                            </div>
                        </div>
                        : null
                }
                <div className={`myRow ${noneAction}`} onMouseOver={this.handleOnMouseEnter.bind(this)}>
                    <div className={`mainRow text-capitalize ${showForgotPIN ? 'disable' : ''}`}>
                        <div><Lang>lang_show_notifications</Lang></div>
                        <div className='icon' onClick={this.handleShowNotifications.bind(this, !this.state.showNotifications)}>
                            {
                                this.state.showNotifications
                                    ? <SvgIcon path={path.mdiCheckBoxOutline} />
                                    : <SvgIcon path={path.mdiCheckboxBlankOutline} />
                            }
                        </div>
                    </div>
                </div>

                {this.state.showNotifications ? <div className='line'></div> : null}
                {
                    this.state.showNotifications ? <SettingsRow title='News Notifications'
                        showForgotPIN={this.state.showForgotPIN}
                        showAllNews={this.state.showAllNews} /> : null
                }
                {this.state.showNotifications ? <div className='line'></div> : null}
                {
                    this.state.showNotifications ? <SettingsRow title='Order Notifications'
                        showForgotPIN={this.state.showForgotPIN}
                        orderNotifications={this.state.orderNotifications} /> : null
                }
                <SettingsRow
                    title='Authentication'
                    showNotifications={this.handleShowNotifications.bind(this)}
                    requireTime={this.state.requireTime}
                    showForgotPIN={this.state.showForgotPIN}
                    closeSuccess={this.props.closeSuccess}
                />
                <div className='line'></div>
                <SettingsRow
                    title='Security'
                    renderError={this.renderError.bind(this)}
                    showForgotPIN={this.state.showForgotPIN}
                    doneForgotPIN={this.handleDoneForgotPIN.bind(this)}
                    closeSuccess={this.props.closeSuccess}
                />
            </div >
        } catch (error) {
            logger.error('renderLeftSettings On Settings' + error)
        }
    }

    render() {
        try {
            let notify = '';
            let className = '';
            if (this.state.showError) {
                switch (this.state.errorValue) {
                    case 'success': notify = 'lang_your_pin_has_been_changed_successfully'; className = 'success'; break;
                    case 'changepasssuccess': notify = 'lang_change_password_success'; className = 'success'; break;
                    default: notify = 'lang_you_must_set_a_pin_before_closing_settings'; break;
                }
            }
            return (
                <div className={'settings'}>
                    <div className='settingsContainer'>
                        <div className='settingsHeader text-capitalize size--4'>
                            <div><Lang>lang_settings</Lang></div>
                            <div className='closeSetting' onClick={this.handleShowSettings.bind(this)}>
                                <Icon
                                    src={'navigation/close'}
                                    color='var(--secondary-default)'
                                    style={{ width: 20, height: 20 }}
                                />
                            </div>
                        </div>
                        {
                            this.state.showError
                                ? <div className={`errorSetting ${className}`}>
                                    <Lang>{notify}</Lang>
                                </div>
                                : null
                        }
                        <div className={`settingsContent ${this.state.showNotifications ? '' : 'dontShowNotifications'}`}>
                            <div className='leftSettings'>{this.renderLeftSettings()}</div>
                            {
                                this.state.showForgotPIN ? null : this.renderRightDefault()
                            }
                        </div>
                    </div>
                </div>
            )
        } catch (error) {
            logger.error('render On Settings' + error)
        }
    }
}

export default Settings;
