import React, { Component } from 'react';
import Datafeeds from './datafeeds';
import {
    checkPropsStateShouldUpdate,
    updateDataLayout,
    getDataLayout,
    deleteDataLayout,
    getAllLayout,
    createNewLayout,
    genreNewName,
    isAUSymbol,
    getChartDom,
    getSymbolAccountWhenFirstOpenLayout,
    resetSymbolOfLayout,
    hideElement
} from '../../helper/functionUtils';
import { getData } from '../../helper/request';
import uuidv4 from 'uuid/v4';
import { func } from '../../storage';
import { emitter, eventEmitter, emitterRefresh, eventEmitterRefresh } from '../../constants/emitter_enum';
import dataStorage from '../../dataStorage';
import logger from '../../helper/log';
import { translate } from 'react-i18next';
import { getTimeZoneString } from '../../helper/dateTime';
import { unregisRealtime } from '../../helper/streamingSubscriber';
import SearchBox from '../SearchBox/SearchBox';
import Icon from '../Inc/Icon/Icon';
import Lang from '../Inc/Lang/Lang';
import layoutConfig from '../../layoutConfig';
import LayoutType from '../../constants/layout_type';
import SymbolClass from '../../constants/symbol_class';
import moment from 'moment';
import config from '../../config';
import { registerUser, unregisterUser } from '../../streaming';
import Color from './../../constants/color'

const defaultConfig = {
    groupRequest: '',
    init: {
        'theme': 'Dark',
        'supports_search': true,
        'supports_group_request': false,
        'supports_marks': true,
        'supports_timescale_marks': true,
        'supports_time': true,
        'exchanges': [
            {
                'value': '',
                'name': 'All Exchanges',
                'desc': ''
            },
            {
                'value': 'ASX',
                'name': 'ASX',
                'desc': 'ASX'
            }
        ],
        'symbols_types': [
            {
                'name': 'ALL_TYPES',
                'value': SymbolClass.ALL_TYPES
            },
            {
                'name': 'EQUITY',
                'value': SymbolClass.EQUITY
            },
            {
                'name': 'ETF',
                'value': SymbolClass.ETF
            },
            {
                'name': 'MANAGED_FUNDS',
                'value': SymbolClass.MF
            },
            {
                'name': 'WARRANT',
                'value': SymbolClass.WARRANT
            },
            {
                'name': 'FUTURES',
                'value': SymbolClass.FUTURE
            }
        ],
        'supported_resolutions': ['1', '5', '30', '60', '120', 'D', 'W', 'M']
    }
}

const layoutAction = {
    SAVE: 'save',
    DELETE: 'delete',
    OVERRIDE: 'override',
    EDIT: 'edit',
    NONE: 'none'
}

const saveType = {
    SAVE_NEW: 'save_new',
    OVERRIDE: 'override',
    EDIT: 'edit',
    DELETE: 'delete'
}

const dateRange = {
    1: '1 Day',
    5: '1 Week',
    30: '1 Month',
    60: '3 Months',
    120: '6 Months',
    D: 'YTD',
    '1D': '1 Year',
    W: '3 Years',
    '1W': '5 Years',
    M: '10 Years',
    '1M': 'All'
}
class Chart extends Component {
    constructor(props) {
        super(props);
        this.defaultLayout = layoutConfig.chartDefaultLayout;
        this.defaultLayoutLight = layoutConfig.chartDefaultLayoutLight;
        this.symbolObj = {};
        this.layoutId = this.getChartLayoutID()
        this.curChartLayoutVersion = dataStorage.curChartLayoutVersion;
        this.isFirst = true;
        this.listExist = [];
        this.timeoutFlag = null;
        this.timeoutSave = null;
        this.isFirstClick = false;
        this.country = '';
        this.pause = false;
        this.isShowChartLayout = false;
        this.isFirst = true;
        this.inputValue = '';
        this.divChart = null;
        this.svg = null;
        this.subscription = func.getStore(emitterRefresh.CLICK_TO_REFRESH);
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.code = null;
        this.state = {
            action: layoutAction.NONE,
            isLoading: true,
            isHidden: this.props.glContainer.isHidden,
            isLogin: dataStorage.userInfo && dataStorage.userInfo.user_id
        };
        this.chartLayoutStorage = null;
        this.firstOpen = true;
        this.widget = null;
        this.interval = '5';
        this.dataResult = null;
        this.changeSymbolFn = null;
        this.timeoutId = null;
        this.timeoutId1 = null;
        this.isFirst = true;
        this.currentLanguage = null;
        this.isMount = true;
        this.currentEmail = dataStorage.loginEmail;
        this.changeValue = this.changeValue.bind(this);
        this.saveNewChartLayout = this.saveNewChartLayout.bind(this);
        this.renderSaveChartLayoutButton = this.renderSaveChartLayoutButton.bind(this);
        this.renderSearchBox = this.renderSearchBox.bind(this);
        this.renderAfterRealtime = this.renderAfterRealtime.bind(this);
        dataStorage.renderSaveChartLayoutButton = this.renderSaveChartLayoutButton.bind(this);
        dataStorage.renderAfterRealtime = this.renderAfterRealtime;
        this.setContentDropdown = this.setContentDropdown.bind(this);
        this.outsideClickListener = this.outsideClickListener.bind(this);
        this.turnoffChartLayoutOption = this.turnoffChartLayoutOption.bind(this);
        this.overRideCss = this.overRideCss.bind(this);
        this.onReLoadReady = this.onReLoadReady.bind(this);
        this.callBackOverRide = this.callBackOverRide.bind(this);
        dataStorage.removeSaveChartLayout = this.turnoffChartLayoutOption;
        this.props.receive({
            symbol: this.changeValue
        });
        this.id = uuidv4();
        props.refCompnent(this, '_Chart');
        props.glContainer.on('show', () => { });
        props.glContainer.on('hide', () => {
            this.turnoffChartLayoutOption();
        });
        props.resize((w, h) => {
            if (w === this.previousWidth && h === this.previousHeight) return;
            this.previousWidth = w
            this.previousHeight = h
            if (this.divChart && this.isShowChartLayout) {
                this.turnoffChartLayoutOption(false, true);
                this.calculatePositionForDropdownContent(this.divChart);
            }
            this.addDateRangeEvent();
        });
        this.overrideTimezoneChartTemplateDefault();
        dataStorage.turnOffChartDropDownCallback = this.turnoffChartLayoutOption.bind(this)
    }

    addDateRangeEvent = () => {
        const chartDocument = this.refChart && this.refChart.firstChild && this.refChart.firstChild.contentDocument;
        this.dateRange = chartDocument && chartDocument.querySelector('.chart-controls-bar-buttons.date-range-wrapper')
        if (this.dateRange) {
            this.dateRange.addEventListener('click', () => {
                this.timer && clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    const dateRangePopup = chartDocument && chartDocument.querySelector('.charts-popup-list.date-range-popupmenu')
                    if (dateRangePopup) {
                        const rangeDate = [...dateRangePopup.children];
                        for (let index = 0; index < rangeDate.length; index++) {
                            const node = rangeDate[index];
                            if (node.innerText === dateRange[this.interval]) {
                                node.classList.add('active');
                            } else {
                                if (node.className.includes('active')) {
                                    node.className = 'item';
                                }
                            }
                        }
                    }
                }, 50)
            })
        }
    }

    renderAfterRealtime() {
        this.isShowChartLayout && this.turnoffChartLayoutOption(true);
    }

    saveChartData(option) {
        if (!option) {
            option = this.widget._options;
        }
        let checkDiffSymbol = false
        let nowSymbol = (this.forceSetID() &&
            this.widget &&
            this.widget._options &&
            this.widget._options.datafeed &&
            this.widget._options.datafeed.symbolCurrent &&
            this.widget._options.datafeed.symbolCurrent.base_name &&
            this.widget._options.datafeed.symbolCurrent.base_name.length &&
            this.widget._options.datafeed.symbolCurrent.base_name[0]) || ''
        if (this.oldSymbol) {
            if (this.oldSymbol !== nowSymbol) {
                this.oldSymbol = nowSymbol
                checkDiffSymbol = true
            }
        } else {
            this.oldSymbol = nowSymbol
        }
        if (this.code && option) {
            let state = null;
            if (option.saved_data &&
                option.saved_data.charts &&
                option.saved_data.charts.length &&
                option.saved_data.charts[0].panes &&
                option.saved_data.charts[0].panes.length &&
                option.saved_data.charts[0].panes[0].sources &&
                option.saved_data.charts[0].panes[0].sources &&
                option.saved_data.charts[0].panes[0].sources.length &&
                option.saved_data.charts[0].panes[0].sources[0].state) {
                state = option.saved_data.charts[0].panes[0].sources[0].state
            }
            if (state) {
                state.symbol = this.codeOnSearchBox || this.code;
                if (checkDiffSymbol) state.period = '1d'
                state.shortName = this.codeOnSearchBox || this.code;
                state.interval = this.interval || '5';
                if (checkDiffSymbol) state.interval = '5'
            }
        }
    }

    getChartLayoutID = () => {
        return (this.props.glContainer &&
            this.props.glContainer._config &&
            this.props.glContainer._config.componentState &&
            this.props.glContainer._config.componentState.chartID) || dataStorage.usingChartLayout
    }

    saveCurrentTemplateOptions = widget => {
        try {
            if (!dataStorage.currentTemplateOptions) dataStorage.currentTemplateOptions = {}
            if (!widget) return;
            widget.save(templateObj => {
                dataStorage.currentTemplateOptions[this.id] = templateObj || {};
            })
        } catch (error) {
            logger.log(`Error while saving current template options: ${error}`)
        }
    }

    replaceSymbolInTemplateOptions = symbol => {
        try {
            if (!dataStorage.currentTemplateOptions) return;
            if (!dataStorage.currentTemplateOptions[this.id]) return;
            const options = { ...dataStorage.currentTemplateOptions[this.id] }
            const sources = options && options.charts &&
                Array.isArray(options.charts) &&
                options.charts[0] &&
                options.charts[0].panes &&
                Array.isArray(options.charts[0].panes) &&
                options.charts[0].panes[0] &&
                options.charts[0].panes[0].sources
            sources.map(src => {
                src.state && src.state.symbol && (src.state.symbol = symbol)
                src.state && src.state.shortName && (src.state.shortName = symbol)
            })
            return options
        } catch (error) {
            logger.log(`Error while replacing symbol in template options: ${error}`)
            return null
        }
    }

    showChart() {
        try {
            if (!this.code) return;
            if (!this.widget || !this.widget.chart || this.currentEmail !== dataStorage.loginEmail) {
                this.currentEmail = dataStorage.loginEmail;
                this.getDataChart(this.getChartLayoutID());
            } else {
                if (this.widget) {
                    const chartOBj = this.widget.chart(); // a
                    this.saveChartData();
                    if (chartOBj) {
                        chartOBj.setSymbol(this.code, () => { });
                    }
                }
            }
        } catch (error) {
            logger.error(' error this.widget set symbol: ', error);
            this.getDataChart(this.getChartLayoutID());
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (nextState.isHidden) return false;
            if (dataStorage.checkUpdate) {
                return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state)
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On Chart', error)
        }
    }
    updateSymbolObjDataFeeds(symbolObj) {
        try {
            this.forceSetID() && this.widget && this.widget._options && this.widget._options.datafeed && this.widget._options.datafeed.updateSymbolObjDataFeeds && this.widget._options.datafeed.updateSymbolObjDataFeeds(symbolObj);
        } catch (error) {
            logger.error('refreshData on Chart: ', error);
        }
    }

    changeValue(symbol, force) {
        try {
            // if (force === 'force') {
            //     this.changeValue({})
            // }
            if (!this.isMount) return;
            // console.log('===', symbol)
            if (this.symbolObj.symbol !== symbol.symbol) {
                this.props.send({
                    symbol: symbol
                });
            }
            this.props.loading(true);
            this.props.saveState({
                symbolObj: symbol
            })
            this.symbolObj = symbol;
            this.updateSymbolObjDataFeeds(symbol);
            this.renderSearchBox();
            dataStorage.lastSymbolOnChart = symbol;
            localStorageNew.setItem('Symbol_Chart_By_Orther_Widget', symbol.symbol)
            if (this.code === symbol.symbol || this.code === symbol.display_name) { // incoming data from another tab
                if (this.forceSetID() && this.widget && this.widget._ready && this.widget.chart()) {
                    this.widget.chart();
                    this.props.loading(false);
                }
            } else {
                this.code = symbol.symbol || (dataStorage.lastSymbolOnChart && dataStorage.lastSymbolOnChart.symbol)
                this.display_name = symbol.display_name || (dataStorage.lastSymbolOnChart && dataStorage.lastSymbolOnChart.display_name)
                this.setState({
                    isLoading: false
                }, () => this.showChart())
            }
            if (!this.widget) {
                setTimeout(() => this.props.loading(false), 2000)
            }
        } catch (error) {
            logger.error(' changeValue on Chart: ', error);
        }
    }

    getDataChart(chartLayoutID) {
        try {
            this.getChartLayoutStorage(() => {
                this.convertDataChart({})
            }, chartLayoutID)
        } catch (error) {
            logger.error('getDataChart on Chart: ', error);
        }
    }
    convertDataChart() {
        try {
            const dataResult = defaultConfig;
            this.initChart(dataResult)
        } catch (error) {
            logger.error('convertDataChart on Chart: ', error);
        }
    }

    pushLoading(loading) {
        if (!loading) {
            this.timeoutFlag && clearTimeout(this.timeoutFlag);
            this.timeoutFlag = setTimeout(() => {
                this.renderSearchBox();
            }, 500)
            this.timeoutSave && clearTimeout(this.timeoutSave);
            if (dataStorage && dataStorage.userInfo && dataStorage.userInfo.user_id) {
                this.timeoutSave = setTimeout(() => {
                    this.renderSaveChartLayoutButton();
                }, 800)
            }
        }
        this.props.loading(loading);
    }

    getDateYTD() {
        return moment().diff(moment([new Date().getFullYear(), 0, 1]), 'days')
    }
    getDateRange(numYear) {
        let now = new Date();
        let startYear = now.getFullYear() - numYear
        return moment().diff(moment([startYear, now.getMonth(), now.getDate()]), 'days')
    }
    initChart(dataFeed) {
        try {
            const lang = this.currentLanguage || dataStorage.lang || 'en';
            this.currentLanguage = lang;
            let data = null;
            if (!dataFeed.isOverSystem) {
                data = new Datafeeds.UDFCompatibleDatafeed('https://demo_feed.tradingview.com', '', dataFeed, `${dataStorage.env_config.api.backendBase}`, this.callbackSearch.bind(this), this.onSymbolChanged.bind(this), this.state.isLogin, this.pushLoading.bind(this), this.refChart, this.symbolObj);
            }
            const ytd = this.getDateYTD() + 'd';
            const all = this.getDateRange((new Date().getFullYear() - 2000 + 30)) + 'd'
            const OneY = this.getDateRange(1) + 'd'
            const ThreeY = this.getDateRange(3) + 'd'
            const FiveY = this.getDateRange(5) + 'd'
            const TenY = this.getDateRange(10) + 'd'

            this.option = {
                symbol: this.code,
                fullscreen: true,
                type: 'black',
                ticker: '$SPX500',
                datafeed: data,
                library_path: `charting_library/v${config.chartVersion}/`,
                locale: lang,
                autosize: true,
                drawings_access: { type: 'black', tools: [{ name: 'Regression Trend' }] },
                enabled_features: ['chart_property_page_trading', 'keep_left_toolbar_visible_on_small_screens'],
                debug: false,
                allow_symbol_change: true,
                hide_side_toolbar: true,
                charts_storage_api_version: config.chartVersion,
                client_id: 'abc.com',
                footer_screenshot: false,
                disabled_features: ['use_localstorage_for_settings', 'study_templates', 'dome_widget', 'header_screenshot', 'move_logo_to_main_pane', 'snapshot_trading_drawings', 'show_logo_on_all_charts'],
                user_id: 'public_user_id',
                time_frames: [
                    { text: '1d', resolution: '1', description: `1 ${dataStorage.translate('Day')}`, title: `1 ${dataStorage.translate('lang_day_short')}` },
                    { text: '1w', resolution: '5', description: `1 ${dataStorage.translate('Week')}`, title: `1 ${dataStorage.translate('lang_week_short')}` },
                    { text: '1m', resolution: '30', description: `1 ${dataStorage.translate('Month')}`, title: `1 ${dataStorage.translate('lang_month_short')}` },
                    { text: '3m', resolution: '60', description: `3 ${dataStorage.translate('Months')}`, title: `3 ${dataStorage.translate('lang_month_short')}` },
                    { text: '6m', resolution: '120', description: `6 ${dataStorage.translate('Months')}`, title: `6 ${dataStorage.translate('lang_month_short')}` },
                    { text: ytd, resolution: 'D', description: `${dataStorage.translate('lang_year_to_day')}`, title: `${dataStorage.translate('lang_year_to_day')}` },
                    { text: OneY, resolution: '1D', description: `1 ${dataStorage.translate('Year')}`, title: `1 ${dataStorage.translate('lang_year_short')}` },
                    { text: ThreeY, resolution: 'W', description: `3 ${dataStorage.translate('Years')}`, title: `3 ${dataStorage.translate('lang_year_short')}` },
                    { text: FiveY, resolution: '1W', description: `5 ${dataStorage.translate('Years')}`, title: `5 ${dataStorage.translate('lang_year_short')}` },
                    { text: TenY, resolution: 'M', description: `10 ${dataStorage.translate('Years')}`, title: `10 ${dataStorage.translate('lang_year_short')}` },
                    { text: all, resolution: '1M', description: `${dataStorage.translate('All')}`, title: `${dataStorage.translate('All')}` }
                ],
                supportedResolutions: ['1', '15', '30', '60', 'D', 'W', 'M'],
                data_status: 'delayed_streaming',
                has_empty_bars: true,
                interval: '1'
            };
            if (this.chartLayoutStorage && this.chartLayoutStorage.charts) {
                this.option.saved_data = this.chartLayoutStorage;
                this.saveChartData(this.option)
            } else {
                this.option.interval = '1';
                this.option.timezone = getTimeZoneString();
            }
            this.UDFCompatibleDatafeed = data
            this.reloadChart(dataStorage.theme || 'theme-dark');
        } catch (error) {
            logger.error('initChart on Chart: ', error);
        }
    }
    setLangForChart(lng) {
        this.initChart(defaultConfig)
    }
    onLanguageChanged(lng) {
        try {
            if (this.currentLanguage && this.currentLanguage === lng) return;
            this.currentLanguage = lng;
            if (this.forceSetID() && this.widget && this.widget.chart) {
                this.setLangForChart(lng);
            }
        } catch (error) {
            logger.error('onLanguageChanged on Chart: ', error);
        }
    }

    callbackSearch(cb, count1, exchange1, resolution, rangeTime) {
        try {
            this.interval = resolution;
            const count = count1;
            const exchange = exchange1;
            this.exchange = exchange1
            if (cb) {
                this.changeSymbolFn = cb;
            }
            this.timeoutRangeVsStatus && clearTimeout(this.timeoutRangeVsStatus);
            this.timeoutRangeVsStatus = setTimeout(() => {
                if (count) {
                } else {
                    this.setStatusMarket();
                    this.props.loading(false);
                }
            }, 1000);
            if (count === 0) this.setViewRange(resolution, exchange)
        } catch (error) {
            logger.error('callbackSearch on Chart: ', error);
        }
    }
    setViewRange = (resolution, exchange) => {
        try {
            const ytd = this.getDateYTD()
            const all = this.getDateRange((new Date().getFullYear() - 2000 + 30))
            const OneY = this.getDateRange(1)
            const ThreeY = this.getDateRange(3)
            const FiveY = this.getDateRange(5)
            const TenY = this.getDateRange(10)
            const nowTime = new Date();
            const offset = nowTime.getTimezoneOffset();
            const startOfDay = nowTime.setHours(0, 0, 0);
            const nowTimeStamp = new Date().getTime();
            const offsetTimeToZero = startOfDay - offset * 60 * 1000;
            const oneDay = 24 * 60 * 60 * 1000;
            let startSession = isAUSymbol(exchange) ? offsetTimeToZero : offsetTimeToZero + (13 * 60 + 30) * 60 * 1000;
            let endSession = isAUSymbol(exchange) ? offsetTimeToZero + (6 * 60 + 13) * 60 * 1000 : offsetTimeToZero + (20 * 60) * 60 * 1000;
            let startTime;
            let endTime;
            if (startSession > nowTimeStamp) {
                endTime = endSession - oneDay;
            } else if (nowTimeStamp > startSession && nowTimeStamp < endSession) {
                endTime = nowTimeStamp
            } else if (nowTimeStamp > endSession) {
                endTime = endSession
            }
            switch (resolution) {
                case '1':
                    startTime = endTime - oneDay;
                    break;
                case '5':
                    startTime = endTime - 6 * oneDay;
                    break;
                case '30':
                    startTime = endTime - 29 * oneDay;
                    break;
                case '60':
                    startTime = endTime - 89 * oneDay;
                    break;
                case '120':
                    startTime = endTime - 179 * oneDay;
                    break;
                case 'D':
                    startTime = endTime - ytd * oneDay;
                    break;
                case '1D':
                    startTime = endTime - OneY * oneDay;
                    break;
                case 'W':
                    startTime = endTime - ThreeY * oneDay;
                    break;
                case '1W':
                    startTime = endTime - FiveY * oneDay;
                    break;
                case 'M':
                    startTime = endTime - TenY * oneDay;
                    break;
                case '1M':
                    startTime = endTime - all * oneDay;
                    break;
                default:
                    startTime = endTime - oneDay;
                    break;
            }
            this.forceSetID() && this.widget && this.widget.chart && this.widget.chart().setVisibleRange({
                from: startTime / 1000,
                to: endTime / 1000
            });
        } catch (error) {
            logger.sendLog('error setViewRange', error);
            console.log('error set visibility range', error)
        }
    }
    onSymbolChanged(symbolObj) {
        try {
            let checkEqual = (this.lastSymbol === symbolObj.originSymbol);
            if (this.firstOpen) {
                checkEqual = false;
                this.firstOpen = false;
            }
            if (checkEqual) return
            this.lastSymbol = symbolObj.originSymbol;
            const symbol = encodeURIComponent(symbolObj.originSymbol || '')
            this.code = symbol;
            this.display_name = symbolObj.display_name || (dataStorage.lastSymbolOnChart && dataStorage.lastSymbolOnChart.display_name)
            let symbolSplit = symbol.split('.') || []
            const url = dataStorage.env_config.api.backendBase + '/market-info/symbol/' + symbolSplit[0];
            if (this.refChart && this.refChart.firstChild.contentDocument) {
                const contentDocument = this.refChart.firstChild.contentDocument;
                const searchBarInput = contentDocument.querySelector('.symbol-edit-inputspacer input');
                this.codeOnSearchBox = (searchBarInput.value || '').split('.')[0]
            }
            this.props.loading(true)
            getData(url)
                .then(response => {
                    this.props.loading(false)
                    if (response.data && response.data.length) {
                        for (let i = 0; i < response.data.length; i++) {
                            if (response.data[i].display_name.indexOf(symbolObj.display_name || '') === 0) {
                                if (this.refChart) {
                                    logger.log('symbol match == ', response.data[i]);
                                    const country = response.data[i].country + '';
                                    this.country = country;
                                    this.trading_halt = response.data[i].trading_halt || 0
                                }
                                this.refreshData('refresh')
                                this.saveChartData();
                                return
                            }
                        }
                    }
                })
                .catch(error => {
                    this.props.loading(false)
                    logger.log(error)
                })
        } catch (error) {
            logger.error('onSymbolChanged on Chart: ', error);
        }
    }

    handleClickOutside(event) {
        dataStorage.handleClickOutside && dataStorage.handleClickOutside(event)
    }

    changeConnection(isConnected) {
        isConnected && this.refreshData('refresh')
    }

    overrideTimezoneChartTemplateDefault() {
        if (this.defaultLayout && this.defaultLayout.charts && this.defaultLayout.charts[0]) {
            this.defaultLayout.charts[0]['timezone'] = getTimeZoneString();
        }
        if (this.defaultLayoutLight && this.defaultLayoutLight.charts && this.defaultLayoutLight.charts[0]) {
            this.defaultLayoutLight.charts[0]['timezone'] = getTimeZoneString();
        }
    }
    componentDidMount() {
        try {
            const { i18n } = this.props
            i18n.on('languageChanged', this.onLanguageChanged.bind(this))
            this.emitID = this.subscription && this.subscription.addListener(eventEmitterRefresh.CLICK_TO_REFRESH_STATE, this.refreshData.bind(this));
            this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
            this.saveChartLayoutByUserLayout();
            this.addClickListener();
            const fontSize = localStorageNew.getItem('lastFontSize', true) || 'medium'
            if (!dataStorage.fontSize) {
                dataStorage.fontSize = fontSize
            } else if (dataStorage.fontSize !== fontSize) {
                localStorageNew.setItem('lastFontSize', dataStorage.fontSize, true)
                dataStorage.currentFontSize = fontSize
            }
            if (!dataStorage.callBackReloadTheme[this.id]) {
                dataStorage.callBackReloadTheme[this.id] = this.callBackOverRide.bind(this);
            };

            const isLogin = !!dataStorage.userInfo;
            if (isLogin) {
                if (dataStorage.userInfo) {
                    const userId = dataStorage.userInfo.user_id;
                    unregisterUser(userId, this.realtimeLayout, 'layout')
                    registerUser(userId, this.realtimeLayout, 'layout');
                }
            }
        } catch (error) {
            logger.error('componentDidMount on Chart: ', error);
        }
    }

    openModalSearchBox = event => {
        try {
            if (this.modalSearchBox && this.modalSearchBox.contains(event.target)) return;
            if (this.objectTreeBox && this.objectTreeBox.contains(event.target)) return;
            this.queryID && clearTimeout(this.queryID)
            this.queryID = setTimeout(() => {
                const contentDocument = this.refChart.firstChild && this.refChart.firstChild.contentDocument;
                this.modalSearchBox = contentDocument.querySelector('._tv-dialog._tv-dialog-nonmodal.ui-draggable')
                if (this.modalSearchBox) {
                    const options = Array.from(this.modalSearchBox.querySelectorAll('.type-filter'))
                    for (let i = 0, len = options.length; i < len; i++) {
                        const dom = options[i]
                        if (i === 0) {
                            if (!dom.classList.contains('active')) {
                                dom.classList.add('active')
                                dom.click && dom.click()
                            } else {
                                return;
                            }
                        } else {
                            if (dom.classList.contains('active')) {
                                dom.classList.remove('active')
                                return;
                            }
                        }
                    }
                }
                this.objectTreeBox = contentDocument.querySelector('.tv-objects-tree-item__title')
                if (this.objectTreeBox) {
                    const [_, interval] = (this.objectTreeBox.innerText || '').split(',')
                    this.objectTreeBox.innerText = `${this.display_name}, ${interval}`
                }
            }, 300);
        } catch (error) {
            logger.log(`Error while openning modal search box in chart: ${error}`)
        }
    }

    clickInsideModal = () => {
        this.isModalOpenned = true
    }

    appendLastActionTime = () => {
        this.addProperties({
            chartID: this.getChartLayoutID(),
            actionType: saveType.OVERRIDE,
            chartSaveLayoutCallback: this.saveNewChartLayout,
            lastAction: +new Date()
        })
    }

    addClickListener() {
        document.addEventListener('click', this.outsideClickListener)
    }

    saveChartLayoutByUserLayout() {
        const lst = dataStorage.listLayout || {};
        const lstChart = dataStorage.listChartLayout;
        const usingLayout = dataStorage.usingLayout || '';
        if (lst[usingLayout]) {
            const curLayout = lst[usingLayout] || {};
            if (!curLayout['chart_layout'] && this.layoutId && lstChart[this.layoutId]) {
                curLayout['chart_layout'] = this.layoutId;
                dataStorage.listLayout[usingLayout] = curLayout;
                curLayout.init_time && delete curLayout.init_time
                curLayout.is_using_layout && delete curLayout.is_using_layout
                curLayout.key && delete curLayout.key
                curLayout.is_default && delete curLayout.is_default;
                updateDataLayout(usingLayout, curLayout)
                    .then(() => {
                        logger.log('save chart layout by user layout success');
                    }).catch(error => {
                        logger.error(error, 'save chart layout bu user layout failured');
                    });
            } else {
                const chartLayout = curLayout.chart_layout;
                if (!lstChart[chartLayout]) {
                    let lstChartArr = Object.keys(lstChart).map(l => lstChart[l]);
                    let newestLayout = {}
                    if (lstChartArr && lstChartArr.length > 1) {
                        const lstChartArrSorted = lstChartArr.sort((a, b) => b.updated - a.updated);
                        newestLayout = lstChartArrSorted[0] || {};
                    } else {
                        newestLayout = lstChartArr[0] || {};
                    }
                    this.layoutId = newestLayout.layout_id;
                } else {
                    this.layoutId = chartLayout;
                }
            }
        }
    }

    getChartLayoutStorage(cb, chartLayoutID) {
        if (!this.state.isLogin) {
            cb && cb();
            return;
        }
        const usingChartLayout = chartLayoutID || this.layoutId;
        let data = {};
        getDataLayout(usingChartLayout)
            .then(res => {
                data = res.data;
                if (data && data.layout) {
                    console.log()
                    const layout = JSON.parse(data.layout)
                    if (layout && layout.charts &&
                        layout.charts.length &&
                        layout.charts[0] &&
                        layout.charts[0].panes &&
                        layout.charts[0].panes.length &&
                        layout.charts[0].panes[0] &&
                        layout.charts[0].panes[0].sources &&
                        layout.charts[0].panes[0].sources.length &&
                        layout.charts[0].panes[0].sources[0] &&
                        layout.charts[0].panes[0].sources[0].state) {
                        this.interval = layout.charts[0].panes[0].sources[0].state.interval || '5';
                        if (data.layout_name === 'User Template' || data.layout_name === 'User Layout') {
                            try {
                                layout.charts[0].panes[0].sources[0].state.candleStyle.upColor = Color.PRICE_UP;
                                layout.charts[0].panes[0].sources[0].state.candleStyle.downColor = Color.PRICE_DOWN;
                                layout.charts[0].panes[0].sources[0].state.candleStyle.wickUpColor = Color.PRICE_UP;
                                layout.charts[0].panes[0].sources[0].state.candleStyle.wickDownColor = Color.PRICE_DOWN;
                                layout.charts[0].panes[0].sources[0].state.candleStyle.borderUpColor = Color.PRICE_UP;
                                layout.charts[0].panes[0].sources[0].state.candleStyle.borderDownColor = Color.PRICE_DOWN;
                            } catch (error) {
                                logger.sendLog('error at chart override color,will get default color')
                            }
                        }
                    }
                    this.chartLayoutStorage = layout && layout.charts ? layout : null;
                    this.layoutId = usingChartLayout;
                    this.saveListUsingChartLayout(1);
                    cb && cb();
                } else {
                    getAllLayout().then((response) => {
                        const lstData = response.data || [];
                        const lstChart = {};
                        for (const key in lstData) {
                            const element = lstData[key];
                            if (element && element.type === LayoutType.CHART_LAYOUT) {
                                data = element.layout_id;
                                lstChart[key] = element;
                            }
                        }
                        if (Object.keys(lstChart).length) {
                            dataStorage.listChartLayout = lstChart;
                            this.layoutId = Object.keys(lstChart)[0];
                            this.getDataChart();
                        } else {
                            dataStorage.listChartLayout = [];
                            cb && cb()
                            this.onChangeChartLayout('default');
                        }
                    })
                }
                logger.log('get layout data success');
            })
            .catch(error => {
                logger.log('get layout data failure', error);
            })
    }

    saveListUsingChartLayout(value, id = this.layoutId) {
        if (dataStorage.listUsingChartLayout[id]) {
            dataStorage.listUsingChartLayout[id] = dataStorage.listUsingChartLayout[id] + value;
        } else {
            if (value === -1) {
                delete dataStorage.listUsingChartLayout[id];
            } else {
                dataStorage.listUsingChartLayout[id] = value;
            }
        }
    }

    componentWillUnmount() {
        try {
            this.saveListUsingChartLayout(-1);
            if (this.UDFCompatibleDatafeed && this.UDFCompatibleDatafeed.realtimePrice) {
                unregisRealtime({
                    callback: this.UDFCompatibleDatafeed.realtimePrice
                });
            }
            if (dataStorage.callBackReloadTheme[this.id]) {
                delete dataStorage.callBackReloadTheme[this.id];
            }
            this.isMount = false;
            this.removeClickListener();
            this.emitID && this.emitID.remove();
            this.emitConnectionID && this.emitConnectionID.remove();
            this.chartID && this.chartID.remove();
            const { i18n } = this.props;
            i18n.off('languageChanged', this.onLanguageChanged.bind(this));
            this.modalSearchClickID && this.modalSearchClickID.remove()
            this.modalSearchPressID && this.modalSearchPressID.remove()
            this.modalClickID && this.modalClickID.remove()
            this.modalPressID && this.modalPressID.remove()
            this.turnoffChartLayoutOption();
            // const dom = getChartDom()
            // dom.style.display = 'none'
        } catch (error) {
            logger.error('componentWillUnmount on Chart: ', error);
        }
    }

    refreshData(eventName) {
        try {
            if (eventName !== 'refresh') return;
            if (!this.isMount) return;
            this.forceSetID() && this.widget && this.widget._options && this.widget._options.datafeed && this.widget._options.datafeed.updateDataC2r && this.widget._options.datafeed.updateDataC2r();
        } catch (error) {
            logger.error('refreshData on Chart: ', error);
        }
    }
    overRideCss(theme) {
        if ((this.chartLayoutStorage && this.chartLayoutStorage.charts)) {
            if (theme === 'LightTheme' || theme === 'theme-light') {
                this.option.custom_css_url = './custom_tradingview_chart_theme_light.css' + (`?ver=${window.ver}`);
                this.option.toolbar_bg = '#fff';
                this.option.loading_screen = { backgroundColor: '#fff', foregroundColor: '#fff' };
                this.option.overrides = {
                    'paneProperties.background': '#fff',
                    'paneProperties.vertGridProperties.color': '#EBEDF0',
                    'paneProperties.horzGridProperties.color': '#EBEDF0',
                    'paneProperties.scalesLines.color': '#EBEDF0',
                    'symbolWatermarkProperties.transparency': 90,
                    'scalesProperties.textColor': '#AAA',
                    'mainSeriesProperties.style': 1,
                    'mainSeriesProperties.candleStyle.upColor': Color.PRICE_UP,
                    'mainSeriesProperties.candleStyle.downColor': Color.PRICE_DOWN,
                    'mainSeriesProperties.candleStyle.borderUpColor': Color.PRICE_UP,
                    'mainSeriesProperties.candleStyle.borderDownColor': Color.PRICE_DOWN,
                    'mainSeriesProperties.candleStyle.wickUpColor': Color.PRICE_UP,
                    'mainSeriesProperties.candleStyle.wickDownColor': Color.PRICE_DOWN,
                    'mainSeriesProperties.candleStyle.drawBorder': false
                };
                this.option.studies_overrides = {
                    'volume.volume.color.0': '#165c83',
                    'volume.volume.color.1': '#165c83',
                    'volume.volume.transparency': 20
                };
                this.chartLayoutStorage.charts[0].chartProperties.paneProperties.background = '#fff';
                this.chartLayoutStorage.charts[0].chartProperties.paneProperties.vertGridProperties.color = '#EBEDF0';
                this.chartLayoutStorage.charts[0].chartProperties.paneProperties.horzGridProperties.color = '#EBEDF0';
                this.chartLayoutStorage.charts[0].chartProperties.scalesProperties.lineColor = '#EBEDF0'
            } else {
                this.option.custom_css_url = './custom_tradingview_chart.css' + (`?ver=${window.ver}`);
                this.option.toolbar_bg = '#131722';
                this.option.loading_screen = { backgroundColor: '#171B28', foregroundColor: '#171B28' };
                this.option.overrides = {
                    'mainSeriesProperties.candleStyle.upColor': Color.PRICE_UP,
                    'mainSeriesProperties.candleStyle.downColor': Color.PRICE_DOWN,
                    'mainSeriesProperties.candleStyle.wickUpColor': Color.PRICE_UP,
                    'mainSeriesProperties.candleStyle.wickDownColor': Color.PRICE_DOWN,
                    'mainSeriesProperties.candleStyle.borderUpColor': Color.PRICE_UP,
                    'mainSeriesProperties.candleStyle.borderDownColor': Color.PRICE_DOWN,
                    'mainSeriesProperties.candleStyle.drawBorder': false
                };
                this.option.studies_overrides = {
                    'volume.volume.color.0': '#165c83',
                    'volume.volume.color.1': '#165c83',
                    'volume.volume.transparency': 20
                };
                this.chartLayoutStorage.charts[0].chartProperties.paneProperties.background = '#171B28';
                this.chartLayoutStorage.charts[0].chartProperties.paneProperties.vertGridProperties.color = '#282d3d';
                this.chartLayoutStorage.charts[0].chartProperties.paneProperties.horzGridProperties.color = '#282d3d';
                this.chartLayoutStorage.charts[0].chartProperties.scalesProperties.lineColor = '#282d3d';
            }
        } else {
            if (theme === 'LightTheme' || theme === 'theme-light') {
                this.option.custom_css_url = './custom_tradingview_chart_theme_light.css' + (`?ver=${window.ver}`);
                this.option.toolbar_bg = '#fff';
                this.option.loading_screen = { backgroundColor: '#fff', foregroundColor: '#fff' };
                this.option.overrides = {
                    'paneProperties.background': '#fff',
                    'paneProperties.vertGridProperties.color': '#EBEDF0',
                    'paneProperties.horzGridProperties.color': '#EBEDF0',
                    'paneProperties.scalesLines.color': '#EBEDF0',
                    'symbolWatermarkProperties.transparency': 90,
                    'scalesProperties.textColor': '#AAA',
                    'mainSeriesProperties.style': 1,
                    'mainSeriesProperties.candleStyle.borderUpColor': Color.PRICE_UP,
                    'mainSeriesProperties.candleStyle.borderDownColor': Color.PRICE_DOWN,
                    'mainSeriesProperties.candleStyle.upColor': Color.PRICE_UP,
                    'mainSeriesProperties.candleStyle.downColor': Color.PRICE_DOWN,
                    'mainSeriesProperties.candleStyle.wickUpColor': Color.PRICE_UP,
                    'mainSeriesProperties.candleStyle.wickDownColor': Color.PRICE_DOWN,
                    'scalesProperties.lineColor': '#EBEDF0'
                };
                this.option.studies_overrides = {
                    'volume.volume.color.0': '#165c83',
                    'volume.volume.color.1': '#165c83'
                };
            } else {
                this.option.custom_css_url = './custom_tradingview_chart.css' + (`?ver=${window.ver}`);
                delete this.option.toolbar_bg;
                delete this.option.loading_screen;
                this.option.toolbar_bg = '#131722';
                this.option.loading_screen = { backgroundColor: '#171B28', foregroundColor: '#171B28' };
                this.option.overrides = {
                    'paneProperties.background': '#131722',
                    'paneProperties.vertGridProperties.color': '#282d3d',
                    'paneProperties.horzGridProperties.color': '#282d3d',
                    'symbolWatermarkProperties.transparency': 90,
                    'scalesProperties.textColor': '#AAA',
                    'mainSeriesProperties.style': 1,
                    'mainSeriesProperties.candleStyle.borderUpColor': Color.PRICE_UP,
                    'mainSeriesProperties.candleStyle.borderDownColor': Color.PRICE_DOWN,
                    'mainSeriesProperties.candleStyle.upColor': Color.PRICE_UP,
                    'mainSeriesProperties.candleStyle.downColor': Color.PRICE_DOWN,
                    'mainSeriesProperties.candleStyle.wickUpColor': Color.PRICE_UP,
                    'mainSeriesProperties.candleStyle.wickDownColor': Color.PRICE_DOWN,
                    'mainSeriesProperties.candleStyle.drawBorder': false,
                    'scalesProperties.lineColor': '#282d3d'
                };
                this.option.studies_overrides = {
                    'volume.volume.color.0': '#165c83',
                    'volume.volume.color.1': '#165c83',
                    'volume.volume.transparency': 20
                };
            }
        }
        this.option.container_id = this.id
        if (this.refChart) {
            this.changeTheme = true;
            this.widget = new TradingView.widget(this.option); // eslint-disable-line
            this.addIFrameEvent(this.widget)
        }
    }

    addIFrameEvent = () => {
        const iframe = this.refChart && this.refChart.firstChild
        if (!iframe) return
        iframe.onload = event => {
            if (this.currentTemplateOption) {
                // this.widget.load(this.currentTemplateOption) //tam thoi chan de tim cach giai quyet bug 6513
                setTimeout(() => {
                    this.setStatusMarket();
                }, 1000);
            }
            const iframeBody = event && event.target && event.target.contentDocument && event.target.contentDocument.querySelector('body')
            if (!iframeBody) return
            iframeBody.onunload = () => {
                this.widget.save(templateObj => {
                    if (this.changeTheme) {
                        let chartlayout = templateObj.charts[0].chartProperties;
                        if (this.chartLayoutStorage) {
                            chartlayout.paneProperties.background = this.chartLayoutStorage.charts[0].chartProperties.paneProperties.background;
                            chartlayout.paneProperties.vertGridProperties.color = this.chartLayoutStorage.charts[0].chartProperties.paneProperties.vertGridProperties.color;
                            chartlayout.paneProperties.horzGridProperties = this.chartLayoutStorage.charts[0].chartProperties.paneProperties.horzGridProperties.color;
                            chartlayout.scalesProperties.lineColor = this.chartLayoutStorage.charts[0].chartProperties.scalesProperties.lineColor;
                            this.currentTemplateOption = templateObj;
                            this.changeTheme = false;
                        }
                    } else {
                        this.currentTemplateOption = templateObj
                    }
                })
            }
        }
    }

    callBackOverRide(theme) {
        try {
            this.overRideCss(theme);
            let contentDocument;
            if (this.refChart && this.refChart.firstChild.contentDocument) {
                contentDocument = this.refChart.firstChild.contentDocument;
                const searchBarInput = contentDocument.querySelector('.symbol-edit-inputspacer input');
                searchBarInput && searchBarInput.addEventListener('blur', () => {
                    this.searchBoxOnBlurID && clearTimeout(this.searchBoxOnBlurID)
                    this.searchBoxOnBlurID = setTimeout(() => {
                        searchBarInput.value = this.display_name;
                    }, 200);
                })
            }
            if (dataStorage.userInfo && dataStorage.userInfo.user_id) {
                this.renderSaveChartLayoutButton()
            }
            if (this.code) {
                this.renderSearchBox()
            }
            try {
                this.forceSetID() && this.widget && this.widget.chart() && this.widget.chart().onIntervalChanged() && this.widget.chart().onIntervalChanged().subscribe(null, (interval, obj) => {
                    this.interval = interval;
                    this.saveChartData();
                });
                this.forceSetID() && this.widget && this.widget.chart() && this.widget.chart().onDataLoaded() && this.widget.chart().onDataLoaded().subscribe(null, (interval, obj) => {
                    if (contentDocument) {
                        const spanStatusMarket = contentDocument.querySelector('.tv-market-status__label.tv-market-status__label--for-chart')
                        this.props.loading(false);
                        if (spanStatusMarket.innerText === 'Market Open') {
                            spanStatusMarket.innerHTML = 'Market Open'
                        }
                    }
                })
            } catch (error) {
            }
        } catch (error) {
        }
    }

    forceSetID = () => {
        const chartDOM = document.getElementById(this.id)
        if (chartDOM && this.widget) {
            this.widget._id = chartDOM.firstChild.id
        }
        return true
    }

    onReLoadReady() {
        this.forceSetID() && this.widget && this.widget.onChartReady && this.widget.onChartReady(() => {
            try {
                let contentDocument;
                if (this.refChart && this.refChart.firstChild.contentDocument) {
                    contentDocument = this.refChart.firstChild.contentDocument;
                    const searchBarInput = contentDocument.querySelector('.symbol-edit-inputspacer input');
                    searchBarInput && searchBarInput.addEventListener('blur', () => {
                        this.searchBoxOnBlurID && clearTimeout(this.searchBoxOnBlurID)
                        this.searchBoxOnBlurID = setTimeout(() => {
                            if (!this.isSelectedOption) {
                                searchBarInput.value = this.display_name;
                            }
                            this.isSelectedOption = false
                        }, 200);
                    })
                    this.chartID = contentDocument && contentDocument.addEventListener('click', this.appendLastActionTime)
                    this.modalSearchClickID = contentDocument && contentDocument.addEventListener('click', this.openModalSearchBox)
                    this.modalSearchPressID = contentDocument && contentDocument.addEventListener('keypress', this.openModalSearchBox)
                    this.addProperties({
                        chartID: this.getChartLayoutID(),
                        actionType: saveType.OVERRIDE,
                        chartSaveLayoutCallback: this.saveNewChartLayout,
                        lastAction: +new Date()
                    })
                    const iframeBody = contentDocument.querySelector('body')
                    iframeBody.classList.remove('small', 'medium', 'large')
                    iframeBody.classList.add(dataStorage.fontSize || 'medium')
                }
                if (this.code) {
                    this.renderSearchBox();
                }
                if (dataStorage.userInfo && dataStorage.userInfo.user_id) {
                    this.renderSaveChartLayoutButton()
                }

                this.forceSetID() && this.widget && this.widget.chart() && this.widget.chart().onIntervalChanged() && this.widget.chart().onIntervalChanged().subscribe(null, (interval, obj) => {
                    this.interval = interval;
                    this.saveChartData();
                });

                this.forceSetID() && this.widget && this.widget.chart() && this.widget.chart().onDataLoaded() && this.widget.chart().onDataLoaded().subscribe(null, (interval, obj) => {
                    if (contentDocument) {
                        this.props.loading(false);
                        if (this.isFirst) {
                            this.isFirst = false;
                            this.addDateRangeEvent();
                        }
                        this.setStatusMarket()
                    }
                })
            } catch (error) {
                logger.log('error onChartReady', error)
            }
        });
    }
    setStatusMarket = () => {
        try {
            let contentDocument;
            if (this.refChart && this.refChart.firstChild.contentDocument) {
                contentDocument = this.refChart.firstChild.contentDocument;
            }
            if (!contentDocument) return;
            const spanStatusMarket = contentDocument.querySelector('.tv-market-status__label.tv-market-status__label--for-chart');
            const dotForChart = contentDocument.querySelector('.tv-market-status__dot.tv-market-status__dot--for-chart')
            // let nowTime = new Date();
            if (dataStorage.isHolidayAU[this.exchange] || dataStorage.isHolidayUS[dataStorage.isHolidayUS]) {
                if (spanStatusMarket) spanStatusMarket.innerHTML = 'Market Close';
                if (dotForChart) dotForChart.style.backgroundColor = 'var(--secondary-default)'
            } else {
                const nowTimeStamp = new Date().getTime();
                let check = isAUSymbol(this.exchange) ? (moment().tz('Australia/Sydney').day() === 6 || moment().tz('Australia/Sydney').day() === 0) : (moment().tz('America/New_York').day() === 6 || moment().tz('America/New_York').day() === 0)
                let statSession = isAUSymbol(this.exchange) ? moment().tz('Australia/Sydney').set({ hour: 10, minute: 0, second: 0, millisecond: 0 }).toDate().getTime() : moment().tz('America/New_York').set({ hour: 9, minute: 30, second: 0, millisecond: 0 }).toDate().getTime();
                let endSession = isAUSymbol(this.exchange) ? moment().tz('Australia/Sydney').set({ hour: 16, minute: 30, second: 0, millisecond: 0 }).toDate().getTime() : moment().tz('America/New_York').set({ hour: 16, minute: 0, second: 0, millisecond: 0 }).toDate().getTime();
                if (statSession < nowTimeStamp && nowTimeStamp < endSession && !check) {
                    if (spanStatusMarket) spanStatusMarket.innerHTML = 'Market Open';
                    if (dotForChart) dotForChart.style.backgroundColor = '#359ee4'
                } else {
                    if (spanStatusMarket) spanStatusMarket.innerHTML = 'Market Close';
                    if (dotForChart) dotForChart.style.backgroundColor = 'var(--secondary-default)'
                }
            }
        } catch (error) {
            logger.sendLog('error setStatusMarket', error)
        }
    }
    reloadChart(theme) {
        try {
            if (!this.option || !this.refChart) return;
            if (dataStorage.lastTheme) theme = dataStorage.lastTheme
            if (!theme) theme = localStorageNew.getItem('lastTheme', theme, true) || 'theme-dark';
            this.overRideCss(theme);
            this.onReLoadReady();
        } catch (error) {
            logger.error('reloadChart on Chart: ', error);
        }
    }

    turnoffChartLayoutOption(isReload, isResize, cb) {
        if (this.isShowChartLayout) {
            this.pause = false;
            this.isFirstClick = false;
            if (!isReload) {
                if (this.svg && this.svg.classList.contains('activeIcon')) {
                    this.svg.classList.remove('activeIcon');
                }
            }
            this.isShowChartLayout = false;
            dataStorage.removeSaveChartLayout = null;
            const dom = getChartDom()
            dom.innerHTML = ''
            !isResize && this.setState({ action: layoutAction.NONE }, () => {
                isReload && this.setContentDropdown();
            });
            cb && cb();
        }
    }

    registerClickOutside() {
        if (this.refChart) {
            const contentDocument = this.refChart.firstChild && this.refChart.firstChild.contentDocument;
            contentDocument && contentDocument.addEventListener('click', (e) => {
                if (e.target.classList.contains('testchartbutton')) {
                    this.press = true;
                }
                document.body.click()
            })
        }
    }

    renderSearchBox() {
        const chartDocument = this.refChart && this.refChart.firstChild && this.refChart.firstChild.contentDocument;
        if (!chartDocument) return;
        const searchContainer = chartDocument.querySelector('.symbol-edit-inputspacer');
        if (!searchContainer) return;
        ReactDOM.render(<SearchBox
            disableDropdown={fn => this.disableDropdown = fn}
            resize={this.props.resize}
            refChart={this.refChart}
            loading={this.props.loading}
            trading_halt={this.symbolObj.trading_halt}
            getAllData={true}
            symbol={this.symbolObj.symbol}
            display_name={this.symbolObj.display_name}
            obj={this.symbolObj}
            isSelectedOption={selectedOption => this.isSelectedOption = selectedOption}
            dataReceivedFromSearchBox={this.dataReceivedFromSearchBox.bind(this)} />, searchContainer);
    }

    renderSaveChartLayoutButton() {
        try {
            if (!dataStorage.userInfo) return;
            this.registerClickOutside();
            this.pause = false;
            const div = document.createElement('div')
            div.classList.add('group', 'space-single', this.id)
            ReactDOM.render(
                <div className='button testchartbutton' ref={(ref) => this.refSave = ref}>
                    <Icon src='content/save'></Icon>
                </div >
                , div);
            this.divChart = div;
            const chartDocument = this.refChart && this.refChart.firstChild && this.refChart.firstChild.contentDocument;
            const buttons = chartDocument && chartDocument.querySelector('.header-chart-panel-content .left')
            if (buttons && buttons.lastChild) {
                const lastButton = buttons && buttons.lastChild
                if (!Array.from(lastButton.classList).includes(this.id)) {
                    buttons && buttons.appendChild(div)
                    div.addEventListener('click', () => {
                        const svg = div.children && div.children[0] && div.children[0].getElementsByTagName('svg') && div.children[0].getElementsByTagName('svg')[0]
                        this.svg = svg;
                        const dropdown = getChartDom()
                        if (this.isShowChartLayout && dropdown) {
                            if (svg && svg.classList.contains('activeIcon')) {
                                svg.classList.remove('activeIcon');
                            }
                            this.turnoffChartLayoutOption();
                        } else {
                            if (svg && !svg.classList.contains('activeIcon')) {
                                svg.classList.add('activeIcon');
                            }
                            this.calculatePositionForDropdownContent(div)
                        }
                    })
                }
            }
        } catch (error) {
            console.log('error renderSaveChartLayoutButton: ', error)
        }
    }

    calculatePositionForDropdownContent(dom) {
        const chartDom = this.props.glContainer._element[0].getElementsByClassName('chartTV');
        const chartContainer = chartDom ? chartDom[0] : null;
        const q = chartContainer ? chartContainer.getBoundingClientRect() : {};
        const topChart = q.top || 0;
        const leftChart = q.left || 0;
        const p = dom.getBoundingClientRect() || {};
        const left = p.left || 0;
        const top = p.top || 0;
        const bodyWidth = document.body.clientWidth;
        const contentDiv = getChartDom()
        contentDiv.style.right = `${bodyWidth - leftChart - left - dom.clientWidth - 1}px`
        contentDiv.style.left = null;
        contentDiv.style.top = `${top + topChart + dom.clientHeight - 3}px`;
        contentDiv.style.bottom = null;
        contentDiv.style.visibility = 'visible';
        // contentDiv.style.display = 'block'
        contentDiv.innerHTML = ''
        // contentDiv.addEventListener('mouseover', () => {
        //     this.hoverOnDropdown = true;
        // })
        this.setContentDropdown(contentDiv);
        this.hideOnClickOutside(contentDiv)
    }

    addProperties = ({ chartID, actionType, lastAction, chartSaveLayoutCallback }) => {
        const stateObj = {}
        chartID && (stateObj.chartID = chartID)
        actionType && (stateObj.actionType = actionType)
        lastAction && (stateObj.lastAction = lastAction)
        chartSaveLayoutCallback && (stateObj.chartSaveLayoutCallback = chartSaveLayoutCallback)
        this.props.saveState && this.props.saveState(stateObj)
    }

    onChangeChartLayout(id) {
        try {
            this.addProperties({
                chartID: id,
                actionType: saveType.OVERRIDE,
                chartSaveLayoutCallback: this.saveNewChartLayout,
                lastAction: +new Date()
            })
            this.props.saveState({
                usingChartLayout: id
            })
            if (this.refSave && id !== 'default') {
                this.refSave.title = dataStorage.listChartLayout[id] && dataStorage.listChartLayout[id].layout_name
            }
            if (id === 'default') {
                this.pause = false;
                const theme = localStorageNew.getItem('lastTheme', true) || localStorageNew.getItem('lastTheme') || 'theme-dark';
                this.layoutId = 'default_template';
                this.turnoffChartLayoutOption();
                if (this.forceSetID() && this.widget) {
                    const layout = theme === 'theme-dark' ? this.defaultLayout : this.defaultLayoutLight
                    layout.charts[0].panes[0].sources[0].state.symbol = this.code || 'ANZ';
                    layout.charts[0].panes[0].sources[0].state.shortName = this.code || 'ANZ';
                    this.widget.load(layout);
                }
            } else {
                if (this.pause) {
                    return;
                }
                const lst = dataStorage.listLayout;
                const usingLayout = dataStorage.usingLayout || '';
                const curLayout = lst[usingLayout];
                if (!curLayout) return;
                curLayout['chart_layout'] = id;
                const curChartLayout = dataStorage.listChartLayout[id] || {};
                this.curChartLayoutVersion = curChartLayout.updated || +new Date();
                dataStorage.curChartLayoutVersion = this.curChartLayoutVersion;
                dataStorage.isChangeChartLayout = true;
                this.saveListUsingChartLayout(-1);
                this.layoutId = id;
                dataStorage.usingChartLayout = id;
                this.saveListUsingChartLayout(1, id);
                curLayout.is_using_layout = dataStorage.usingLayout || '';
                curLayout.is_using_chart_layout = id;
                curLayout.key && delete curLayout.key
                curLayout.init_time && delete curLayout.init_time
                dataStorage.listLayout[usingLayout] = curLayout;
                updateDataLayout(usingLayout, curLayout).then(() => {
                    this.removeTemplateDeleted();
                    dataStorage.chartSelfChange = true;
                    this.turnoffChartLayoutOption();
                    this.pause = false;
                    this.loadChartLayout();
                })
            }
        } catch (error) {
            logger.error('handleOnChangeLayout On Header' + error)
        }
    }

    loadChartLayout() {
        const layoutId = this.getChartLayoutID() || this.layoutId;
        const theme = localStorageNew.getItem('lastTheme', true) || 'theme-dark'
        const isLightTheme = theme === 'theme-light' || theme === 'LightTheme'
        getDataLayout(layoutId).then(res => {
            const layoutStr = res && res.data && res.data.layout;
            const layout = layoutStr && JSON.parse(layoutStr);
            if (this.forceSetID() && this.widget && this.widget.chart() && layout) {
                if (
                    layout.charts && layout.charts[0] && layout.charts[0].panes && layout.charts[0].panes[0] &&
                    layout.charts[0].panes[0].sources && layout.charts[0].panes[0].sources[0] &&
                    layout.charts[0].panes[0].sources[0].state && layout.charts[0].panes[0].sources[0].state.interval
                ) {
                    layout.charts[0].chartProperties.paneProperties.background = isLightTheme ? '#fff' : '#171B28'
                    layout.charts[0].chartProperties.paneProperties.vertGridProperties.color = isLightTheme ? '#EBEDF0' : '#282d3d'
                    layout.charts[0].chartProperties.paneProperties.horzGridProperties.color = isLightTheme ? '#EBEDF0' : '#282d3d'
                    layout.charts[0].chartProperties.scalesProperties.lineColor = isLightTheme ? '#EBEDF0' : '#282d3d'
                    this.interval = layout.charts[0].panes[0].sources[0].state.interval;
                    layout.charts[0].panes[0].sources[0].state.symbol = this.symbolObj.symbol || this.code || 'ANZ';
                }
                this.isFirst = true;
                if (res && res.data && (res.data.layout_name === 'User Layout' || res.data.layout_name === 'User Template')) {
                    try {
                        layout.charts[0].panes[0].sources[0].state.candleStyle.upColor = Color.PRICE_UP;
                        layout.charts[0].panes[0].sources[0].state.candleStyle.downColor = Color.PRICE_DOWN;
                        layout.charts[0].panes[0].sources[0].state.candleStyle.wickUpColor = Color.PRICE_UP;
                        layout.charts[0].panes[0].sources[0].state.candleStyle.wickDownColor = Color.PRICE_DOWN;
                        layout.charts[0].panes[0].sources[0].state.candleStyle.borderUpColor = Color.PRICE_UP;
                        layout.charts[0].panes[0].sources[0].state.candleStyle.borderDownColor = Color.PRICE_DOWN;
                        layout.charts[0].panes[0].sources[0].state.symbol = this.symbolObj.symbol || this.code || 'ANZ';
                    } catch (error) {
                        logger.sendLog('error at chart override color,will get default color')
                    }
                }
                this.forceSetID() && this.widget && this.widget.load(layout);
            }
            logger.log('get data layout after init goldenlayout success')
        }).catch(() => {
            logger.log('get data layout after init goldenlayout failure')
        })
    }

    getKeyEnter(event, isSaveNew, id) {
        const keyCode = event.which || event.keyCode;
        if (keyCode === 13) {
            if (isSaveNew) {
                this.saveNewChartLayout(this.inputValue, saveType.SAVE_NEW)
            } else {
                this.saveNewChartLayout(id, saveType.EDIT)
            }
        }
    }

    saveTemplate() {
        this.setState({ action: layoutAction.SAVE }, () => {
            let dom = getChartDom()
            dom.innerHTML = '';
            this.setContentDropdown();
        })
    }

    confirmOverride(index) {
        this.setState({ action: layoutAction.OVERRIDE }, () => {
            const dom = getChartDom()
            dom.innerHTML = '';
            this.setContentDropdown(null, index);
        })
    }

    confirmDelete(index) {
        this.setState({ action: layoutAction.DELETE }, () => {
            const dom = getChartDom()
            dom.innerHTML = '';
            this.setContentDropdown(null, index);
        })
    }

    realtimeLayout = (data, action) => {
        if (action === 'DELETE' && this.layoutId === data) {
            this.layoutId = 'default_template'
            this.onChangeChartLayout('default');
        }
    }

    confirmEdit(index) {
        this.setState({ action: layoutAction.EDIT }, () => {
            const dom = getChartDom()
            dom.innerHTML = '';
            this.setContentDropdown(null, index)
        })
    }

    outsideClickListener(event) {
        try {
            if (this.press) {
                this.press = false;
                return;
            }
            const parent = getChartDom();
            if ((parent && !parent.contains(event.target)) && (event.target && event.target.className && !event.target.className.includes('chartMark'))) {
                this.turnoffChartLayoutOption();
            }
        } catch (error) {
            logger.sendLog('error outsideClickListener', error)
        }
    }

    hideOnClickOutside(element) {
        this.element = element
    }

    removeClickListener() {
        document.removeEventListener('click', this.outsideClickListener)
    }

    setContentDropdown(listContent, indexSpecial) {
        dataStorage.removeSaveChartLayout = this.turnoffChartLayoutOption;
        let dom = null;
        if (listContent) {
            dom = listContent;
        } else {
            dom = getChartDom()
        }
        if (dom) {
            this.listExist = ['Default Template', 'Save Template'];
            const lstChart = dataStorage.listChartLayout || {};
            let listChartLayout = Object.keys(lstChart).map(k => {
                lstChart[k].key = k;
                const name = lstChart[k].layout_name;
                this.listExist.push(name);
                if (!lstChart[k].updated) {
                    lstChart[k].updated = 0;
                }
                return lstChart[k];
            });
            listChartLayout = listChartLayout && listChartLayout.length && listChartLayout.sort((a, b) => b.updated - a.updated)
            const usingChartLayout = this.layoutId || 'default_template';
            const defaultApply = document.createElement('div');
            const isSave = !!(this.state.action === layoutAction.SAVE)
            const isOverride = !!(this.state.action === layoutAction.OVERRIDE)
            const isEdit = !!(this.state.action === layoutAction.EDIT)
            const isDelete = !!(this.state.action === layoutAction.DELETE)
            ReactDOM.render(<div className={`leftItemChartLayout ${usingChartLayout === 'default_template' ? 'activeDropDownChart' : ''} chartMark`}>
                <div className='leftItemChildren text-capitalize showTitle chartMark'>
                    <Icon src='action/view-quilt' className='chartMark'></Icon>
                    <Lang>lang_default_template</Lang>
                </div>
                {
                    usingChartLayout === 'default_template' ? <Icon className='chartMark' src='navigation/check'></Icon> : null
                }
            </div>, defaultApply);
            defaultApply.className = 'itemChartLayout size--3 chartMark';
            defaultApply.addEventListener('click', () => this.onChangeChartLayout('default'));
            let len = listChartLayout.length;
            const divContent = document.createElement('div');
            for (let i = 0; i < len; i++) {
                const key = listChartLayout[i].key;
                const name = listChartLayout[i].layout_name
                const isUsing = !!(key === usingChartLayout)
                const div = document.createElement('div');
                div.className = `itemChartLayout size--3 ${i === 0 ? 'firstItemChartLayout' : ''} ${i === len - 1 ? 'lastItemChartLayout' : ''} ${isUsing ? 'usingChartLayout' : ''} ${i === indexSpecial ? 'editingChartLayout' : ''} chartMark`;
                if (i === indexSpecial && isOverride) {
                    ReactDOM.render(<div className={`${isUsing ? 'activeDropDownChart leftItemChartLayout' : 'leftItemChartLayout'} chartMark`}>
                        <div className='leftItemChildren showTitle chartMark'>
                            <Icon className='chartMark' src='social/person'></Icon>
                            <Lang>lang_ask_overwrite</Lang>
                        </div>
                        <div className='rightItemChildren editChartLayoutName chartMark'>
                            <div className='yes chartMark text-uppercase' onClick={() => this.saveNewChartLayout(key, saveType.OVERRIDE)}><Lang>lang_yes</Lang></div>
                            <div className='no text-uppercase chartMark' onClick={() => {
                                setTimeout(() => {
                                    this.setState({ action: layoutAction.NONE }, () => {
                                        this.turnoffChartLayoutOption(true)
                                    })
                                }, 300)
                            }}><Lang>lang_no</Lang></div>
                        </div>
                    </div>, div)
                }
                if (i === indexSpecial && isEdit) {
                    ReactDOM.render(<div className='leftItemChartLayout empty chartMark'>
                        <div className='leftItemChildren showTitle leftItemChildrenInput chartMark'>
                            <Icon className='chartMark' src='social/person'></Icon>
                            <input className='chartLayoutInput size--3 chartMark' required type="text"
                                ref={ref => setTimeout(() => {
                                    ref && ref.focus();
                                    ref && ref.setSelectionRange(999, 999)
                                }, 200)}
                                defaultValue={name || ''}
                                onKeyPress={e => {
                                    if (this.inputValue && !this.listExist.includes(this.inputValue)) {
                                        this.getKeyEnter(e, false, key)
                                    }
                                }}
                                onChange={e => {
                                    this.inputValue = e.target.value.trim();
                                    const parent = e.target.parentElement && e.target.parentElement.parentElement
                                    if (!this.inputValue || this.listExist.includes(this.inputValue)) {
                                        parent.className = 'leftItemChartLayout empty'
                                    } else if (parent.className.includes('empty')) {
                                        parent.className = 'leftItemChartLayout';
                                    }
                                }} />
                        </div>
                        <div className='rightItemChildren editChartLayoutName chartMark'>
                            <div className='yes text-uppercase chartMark' onClick={() => {
                                this.pause = true;
                                this.saveNewChartLayout(key, saveType.EDIT)
                            }}><Lang>lang_yes</Lang></div>
                            <div className='no text-uppercase chartMark' onClick={() => {
                                this.pause = true;
                                setTimeout(() => {
                                    this.setState({ action: layoutAction.NONE }, () => {
                                        this.turnoffChartLayoutOption(true)
                                    })
                                }, 300)
                            }}><Lang>lang_no</Lang></div>

                        </div>
                    </div>, div)
                }
                if (i === indexSpecial && isDelete) {
                    ReactDOM.render(<div className='leftItemChartLayout chartMark'>
                        <div className='leftItemChildren text-capitalize showTitle chartMark'>
                            <Icon className='chartMark' src='social/person'></Icon>
                            <Lang>lang_ask_delete_template</Lang>
                        </div>
                        <div className='rightItemChildren text-uppercase editChartLayoutName chartMark'>
                            <div className='yes chartMark' onClick={() => {
                                this.pause = true;
                                this.saveNewChartLayout(key, saveType.DELETE)
                            }}><Lang>lang_yes</Lang></div>
                            <div className='no text-uppercase chartMark' onClick={() => {
                                this.pause = true
                                setTimeout(() => {
                                    this.setState({ action: layoutAction.NONE }, () => {
                                        this.turnoffChartLayoutOption(true)
                                    })
                                }, 300)
                            }}><Lang>lang_no</Lang></div>

                        </div>
                    </div>, div)
                }
                if (i !== indexSpecial) {
                    ReactDOM.render(<div className={`${isUsing ? 'activeDropDownChart leftItemChartLayout' : 'leftItemChartLayout'} chartMark`}>
                        <div className='leftItemChildren showTitle chartMark' onDoubleClick={() => {
                            this.pause = true;
                            this.confirmEdit(i)
                        }}>
                            <Icon className='chartMark' src='social/person'></Icon>
                            {name}
                        </div>
                        <div className='rightItemChildren chartMark'>
                            {
                                isUsing ? <Icon className='chartMark' src='navigation/check'></Icon> : null
                            }
                            {
                                isSave ? null : <div className='chartLayoutOption chartMark'>
                                    <div className='deleteChartLayout chartMark' title={dataStorage.translate('lang_overwrite').toCapitalize()} onClick={() => {
                                        this.pause = true;
                                        this.confirmOverride(i)
                                    }}>
                                        <svg className='chartMark' style={{ 'marginBottom': '1px', fill: 'var(--secondary-default)' }} width="16" height="16" viewBox="0 0 24 24">
                                            <path d="M14,12H19.5L14,6.5V12M8,5H15L21,11V21A2,2 0 0,1 19,23H8C6.89,23 6,22.1 6,21V18H11V20L15,17L11,14V16H6V7A2,2 0 0,1 8,5M13.5,3H4V16H6V18H4A2,2 0 0,1 2,16V3A2,2 0 0,1 4,1H11.5L13.5,3Z" />
                                        </svg>
                                    </div>
                                    <div title={dataStorage.translate('lang_delete').toCapitalize()} className='chartMark'>
                                        <Icon src='navigation/close' className='deleteChartLayout chartMark' onClick={() => {
                                            this.pause = true;
                                            this.confirmDelete(i)
                                        }}></Icon>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>, div);
                }
                div.addEventListener('dblclick', () => isSave ? null : setTimeout(() => {
                    this.pause = true;
                    this.confirmEdit(i);
                }, 0));
                div.addEventListener('click', () => isSave || isEdit || isOverride || isDelete ? null : setTimeout(() => {
                    this.onChangeChartLayout(key);
                }, 200));
                divContent.appendChild(div)
            }
            const saveLayout = document.createElement('div');
            ReactDOM.render(isSave ? <div className='leftItemChildren saveItemChartLayout showTitle chartMark'>
                <Icon className='chartMark' src='content/save'></Icon>
                <input className='chartLayoutInput size--3 empty chartMark' required
                    ref={ref => setTimeout(() => {
                        ref && ref.focus();
                        ref && ref.setSelectionRange(999, 999)
                    }, 200)}
                    onChange={e => {
                        this.inputValue = e.target.value.trim();
                        if (!this.inputValue || this.listExist.includes(this.inputValue)) {
                            e.target.className = 'chartLayoutInput size--3 empty';
                            this.checkValueSaveLayout = false;
                        } else if (e.target.className.includes('empty')) {
                            e.target.className = 'chartLayoutInput size--3';
                            this.checkValueSaveLayout = true
                        }
                    }}
                    onKeyPress={e => {
                        if (this.inputValue && !this.listExist.includes(this.inputValue)) {
                            this.getKeyEnter(e, true)
                        }
                    }}
                    type="text" placeholder='New template label...' />
                <div className='chartLayoutSaveButton text-capitalize chartMark' onClick={() => this.saveNewChartLayout(this.inputValue, saveType.SAVE_NEW)}><Lang>lang_save</Lang></div>
            </div>
                : <div className='leftItemChartLayout saveItemChartLayout chartMark'>
                    <div className='leftItemChildren text-capitalize showTitle chartMark'>
                        <Icon className='chartMark' src='content/save'></Icon>
                        <Lang>lang_save_template</Lang>
                    </div>
                </div>, saveLayout);
            saveLayout.className = 'itemChartLayout size--3 chartMark';
            saveLayout.addEventListener('click', () => isSave ? null : this.saveTemplate());
            dom.appendChild(defaultApply);
            const divContentScroll = document.createElement('div');
            divContentScroll.className = 'chartLayoutContent chartMark'
            divContentScroll.appendChild(divContent);
            dom.appendChild(divContentScroll);
            dom.appendChild(saveLayout);
            this.isShowChartLayout = true;
        }
    }

    componentWillReceiveProps(nextProps) {
        try {
            if (nextProps.theme) {
                this.reloadChart(nextProps.theme);
            }
        } catch (error) {
            logger.error('componentWillReceiveProps on Chart: ', error);
        }
    }

    removeTemplateDeleted() {
        if (dataStorage.deletingChartLayout && dataStorage.listChartLayout[dataStorage.deletingChartLayout]) {
            delete dataStorage.listChartLayout[dataStorage.deletingChartLayout];
            dataStorage.deletingChartLayout = '';
        }
    }

    saveNewChartLayout(id, type) {
        if (!dataStorage.userInfo || !dataStorage.userInfo.user_id) return;
        const inputValue = this.inputValue;
        if (type === saveType.SAVE_NEW) this.inputValue = '';
        const lstChart = { ...dataStorage.listChartLayout } || {};
        let lst = dataStorage.listLayout || {};
        const usingLayout = dataStorage.usingLayout || '';
        this.forceSetID() && this.widget && this.widget.save && this.widget.save(savedObj => {
            const savedLayout = savedObj ? JSON.stringify(savedObj) : '';
            let newLayout = {};
            const curChartLayout = lstChart[id] || {};
            switch (type) {
                case saveType.DELETE:
                    if (!id || !lstChart[id] || dataStorage.deletingChartLayout) return;
                    deleteDataLayout(id).then(() => {
                        delete dataStorage.listChartLayout[id];
                        if (id === this.layoutId) {
                            this.layoutId = 'default_template'
                            this.onChangeChartLayout('default');
                        }
                        this.isShowChartLayout && this.turnoffChartLayoutOption(true);
                        logger.log('delete chart layout success');
                        // this.resetDropdownSave()
                    }).catch(() => {
                        logger.log('delete chart layout failure')
                    })
                    return;
                case saveType.EDIT:
                    if (!inputValue || !id || !lstChart[id]) return;
                    curChartLayout['layout_name'] = inputValue
                    curChartLayout['updated'] = +new Date() + ''
                    dataStorage.listChartLayout[id] = curChartLayout;
                    if (id === this.layoutId) {
                        this.curChartLayoutVersion = curChartLayout.updated;
                        dataStorage.curChartLayoutVersion = this.curChartLayoutVersion;
                    }
                    curChartLayout.init_time && delete curChartLayout.init_time
                    curChartLayout.is_using_layout && delete curChartLayout.is_using_layout
                    curChartLayout.key && delete curChartLayout.key
                    updateDataLayout(id, curChartLayout).then(() => {
                        this.isShowChartLayout && this.turnoffChartLayoutOption(true);
                        logger.log('update name chart layout success');
                        // this.resetDropdownSave()
                    }).catch(() => {
                        logger.log('update name chart layout failure');
                    })
                    return;
                case saveType.SAVE_NEW:
                    if (!id || lstChart[id] || !this.checkValueSaveLayout) return;
                    const newId = uuidv4();
                    newLayout = {
                        layout_id: newId,
                        layout_name: inputValue,
                        type: LayoutType.CHART_LAYOUT,
                        layout: savedLayout,
                        updated: +new Date() + '',
                        is_using_chart_layout: newId
                    }
                    this.props.saveState({
                        chartID: newId
                    })
                    dataStorage.listChartLayout[newId] = newLayout;
                    this.curChartLayoutVersion = newLayout.updated;
                    dataStorage.curChartLayoutVersion = this.curChartLayoutVersion;
                    this.saveListUsingChartLayout(-1);
                    this.layoutId = newId;
                    dataStorage.usingChartLayout = newId;
                    this.saveListUsingChartLayout(1);
                    if (lst[usingLayout]) {
                        const curUserLayout = lst[usingLayout] || {};
                        curUserLayout['chart_layout'] = newId;
                        curUserLayout.key && delete curUserLayout.key
                        curUserLayout.init_time && delete curUserLayout.init_time
                        updateDataLayout(curUserLayout.layout_id, curUserLayout).then(() => {
                            logger.log('update user layout after create new chart template');
                        }).catch(() => {
                            logger.log('update user layout after create new chart template failure');
                        })
                    }
                    createNewLayout(newLayout).then(() => {
                        this.removeTemplateDeleted()
                        this.isShowChartLayout && this.turnoffChartLayoutOption(true);
                        logger.log('create new chart layout success');
                    }).catch(() => {
                        logger.log('create new chart layout failure');
                    })
                    return;
                case saveType.OVERRIDE:
                    if (id === this.layoutId) {
                        let newestUpdated = (curChartLayout && curChartLayout.updated) || (+new Date() + '');
                        if (!curChartLayout) newestUpdated = +new Date() + '';
                        const curUpdated = this.curChartLayoutVersion || '0';
                        const curName = (curChartLayout && curChartLayout.layout_name);
                        if (newestUpdated === curUpdated) {
                            const curLayout = dataStorage.listChartLayout[id];
                            curLayout.layout = savedLayout;
                            curLayout.updated = +new Date() + '';
                            this.curChartLayoutVersion = curLayout.updated;
                            dataStorage.curChartLayoutVersion = this.curChartLayoutVersion;
                            curLayout.key && delete curLayout.key
                            curLayout.init_time && delete curLayout.init_time
                            dataStorage.listChartLayout[id] = curLayout;
                            updateDataLayout(id, curLayout).then(() => {
                                this.pause = false;
                                dataStorage.chartSelfChange = true;
                                this.isShowChartLayout && this.turnoffChartLayoutOption(true);
                                // this.resetDropdownSave()
                                logger.log('override current chart layout success');
                            }).catch(() => {
                                logger.log('override current chart layout failure');
                            })
                        } else {
                            const newName = genreNewName(curName, lst);
                            const newId = uuidv4();
                            newLayout = {
                                layout_id: newId,
                                layout_name: newName,
                                type: LayoutType.CHART_LAYOUT,
                                layout: savedLayout,
                                updated: +new Date() + ''
                            }
                            this.props.saveState({
                                usingChartLayout: newId
                            })
                            this.removeTemplateDeleted();
                            dataStorage.listChartLayout[newId] = newLayout;
                            this.curChartLayoutVersion = newLayout.updated;
                            dataStorage.curChartLayoutVersion = this.curChartLayoutVersion;
                            this.saveListUsingChartLayout(-1);
                            this.layoutId = newId;
                            dataStorage.usingChartLayout = newId;
                            this.saveListUsingChartLayout(1);
                            dataStorage.isChangeChartLayout = true;
                            createNewLayout(newLayout).then(() => {
                                this.pause = false;
                                dataStorage.chartSelfChange = true;
                                this.isShowChartLayout && this.turnoffChartLayoutOption(true);
                                // this.resetDropdownSave()
                                logger.log('override create new chart layout success');
                            }).catch(() => {
                                logger.log('override create new chart layout failure');
                            })
                        }
                    } else {
                        const curLayout = lstChart[id];
                        const curId = curLayout.layout_id;
                        curLayout.layout = savedLayout;
                        curLayout.updated = +new Date() + '';
                        this.curChartLayoutVersion = curLayout.updated;
                        dataStorage.curChartLayoutVersion = this.curChartLayoutVersion;
                        this.saveListUsingChartLayout(-1);
                        this.layoutId = curId;
                        dataStorage.usingChartLayout = curId;
                        this.saveListUsingChartLayout(1);
                        curLayout.key && delete curLayout.key
                        curLayout.init_time && delete curLayout.init_time
                        dataStorage.listChartLayout[curId] = curLayout;
                        updateDataLayout(curId, curLayout).then(() => {
                            this.pause = false;
                            dataStorage.chartSelfChange = true;
                            this.isShowChartLayout && this.turnoffChartLayoutOption(true);
                            // this.resetDropdownSave()
                            logger.log('override difference chart layout success');
                        }).catch(() => {
                            logger.log('override difference chart layout failure');
                        })
                    }
            }
        })
    }
    isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }
    dataReceivedFromSearchBox(symbolObj, isDelete) {
        try {
            const checkObj = this.isEmpty(symbolObj);
            if (!checkObj) {
                this.saveCurrentTemplateOptions(this.widget)
                this.changeValue(symbolObj);
            }
        } catch (error) {
            logger.error('dataReceivedFromSearchBox On News', error)
        }
    }
    render() {
        try {
            if (!this.code && !this.state.isLoading) {
                this.props.loading(false);
            }
            return (
                <article className='chartTV' ref={refChart => this.refChart = refChart} id={this.id}>
                    {!this.code ? <div className='chartSearchBoxWhenWatchListNull'>
                        <SearchBox
                            disableDropdown={fn => this.disableDropdown = fn}
                            resize={this.props.resize}
                            loading={this.props.loading}
                            allowDelete={true}
                            trading_halt={this.state.trading_halt}
                            getAllData={true}
                            symbol={this.state.symbol}
                            display_name={this.state.display_name}
                            obj={this.state.symbolObj}
                            isSelectedOption={selectedOption => this.isSelectedOption = selectedOption}
                            dataReceivedFromSearchBox={this.dataReceivedFromSearchBox.bind(this)} />
                    </div> : null}
                </article>
            )
        } catch (error) {
            logger.error('render on Chart: ', error);
        }
    }
}

export default translate('translations')(Chart)
