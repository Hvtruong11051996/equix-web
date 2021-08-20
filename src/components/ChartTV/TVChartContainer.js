import * as React from 'react'
import './index.css'
import Datafeed from './api/'
import config from '../../../public/config'
import dataStorage from '../../dataStorage'
import moment from 'moment'
import SearchBox from '../SearchBox/SearchBox'
import Icon from '../Inc/Icon/Icon'
import uuidv4 from 'uuid/v4'
import LayoutType from '../../constants/layout_type'
import {
    getChartDom,
    updateDataLayout,
    getDataLayout,
    deleteDataLayout,
    createNewLayout,
    genreNewName,
    closeChartLayout,
    getStorageUrl
} from '../../helper/functionUtils'
import Layout from './Layout'
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event'
import ChartStyle from './ChartStyle'

function getLanguageFromURL() {
    const regex = new RegExp('[\\?&]lang=([^&#]*)')
    const results = regex.exec(window.location.search)
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

export default class TVChartContainer extends React.PureComponent {
    static defaultProps = {
        libraryPath: `charting_library/v${config.chartVersion}/`,
        chartsStorageUrl: 'https://saveload.tradingview.com',
        chartsStorageApiVersion: '1.1',
        clientId: 'tradingview.com',
        userId: 'public_user_id'
    }

    constructor(props) {
        super(props)
        this.init()
        this.loadState()
        this.containerId = `tv_chart_container_${uuidv4()}`
        this.register()
    }

    getChartStyle = () => {
        const style = getComputedStyle(document.body);
        return {
            custom_css_url: './custom_tradingview_chart.css',
            toolbar_bg: style.getPropertyValue('--primary-dark').trim(),
            loading_screen: { backgroundColor: style.getPropertyValue('--primary-dark').trim(), foregroundColor: style.getPropertyValue('--primary-dark').trim() },
            overrides: {
                'paneProperties.background': style.getPropertyValue('--primary-dark').trim(),
                'paneProperties.vertGridProperties.color': style.getPropertyValue('--primary-light').trim(),
                'paneProperties.horzGridProperties.color': style.getPropertyValue('--primary-light').trim(),
                'mainSeriesProperties.candleStyle.drawBorder': false,
                'scalesProperties.lineColor': style.getPropertyValue('--primary-light').trim(),
                ...ChartStyle.getCandleStyle(style)
            },
            studies_overrides: {
                ...ChartStyle.getVolumnStyle(style)
            }
        }
    }

    updateTheme = () => {
        if (!this.chartDocument) return;
        const cssId = 'theme';
        const lastTheme = dataStorage.currentTheme;
        if (!this.chartDocument.getElementById(cssId)) {
            var head = this.chartDocument.getElementsByTagName('head')[0];
            var link = this.chartDocument.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = getStorageUrl(`${lastTheme}.css`)
            link.media = 'all';
            head.appendChild(link);
        }
    }

    init = () => {
        this.symbolObj = {}
        this.curChartLayoutVersion = dataStorage.curChartLayoutVersion
        this.chartLayoutStorage = null
    }

    loadState = () => {
        const initialState = this.props.loadState() || {}
        this.interval = initialState.interval || '5'
        this.usingChartLayout = initialState.usingChartLayout || dataStorage.usingChartLayout
    }

    register = () => {
        this.props.receive({
            symbol: this.receiveSymbol
        })
        this.removeChartLayoutDropdown = this.removeChartLayoutDropdown.bind(this)
        dataStorage.closeChartLayout[this.containerId] = this.removeChartLayoutDropdown
    }

    receiveSymbol = (symbol) => {
        try {
            if (!symbol || symbol.symbol === this.symbolObj.symbol) return
            if (!dataStorage.symbolsObjDic[symbol.symbol]) {
                dataStorage.symbolsObjDic[symbol.symbol] = symbol
            }
            this.props.loading(true)
            this.symbolObj = symbol
            this.searchBox && this.searchBox.setSymbol && this.searchBox.setSymbol(symbol)
            if (this.widget && this.widget.chart) {
                this.setSymbol()
            } else this.getChartLayout(() => this.initChart())
        } catch (error) {
            console.error('TVChart receiveSymbol: ', error)
        }
    }

    setSymbol = () => {
        this.widget.chart().setSymbol(this.symbolObj.symbol)
        this.widget._options.symbol = this.symbolObj.symbol
        if (this.widget._options.saved_data && this.widget._options.saved_data.charts && this.widget._options.saved_data.charts[0]) {
            this.widget._options.saved_data.charts[0].panes[0].sources[0].state.shortName = this.symbolObj.symbol
            this.widget._options.saved_data.charts[0].panes[0].sources[0].state.symbol = this.symbolObj.symbol
        }
        this.props.loading(false)
    }

    dataReceivedFromSearchBox = (symbol) => {
        try {
            if (!symbol || symbol.symbol === this.symbolObj.symbol) return
            this.symbolObj = symbol
            if (!dataStorage.symbolsObjDic[symbol.symbol]) {
                dataStorage.symbolsObjDic[symbol.symbol] = symbol
            }
            this.props.send({
                symbol
            })
            if (this.widget && this.widget.chart) {
                this.setSymbol()
            } else this.initChart()
        } catch (error) {
            console.error('TVChart dataReceiedFromSearchBox: ', error)
        }
    }

    renderSearchBox() {
        try {
            const searchContainer = this.chartDocument && this.chartDocument.querySelector('.symbol-edit-inputspacer')
            if (!searchContainer || (searchContainer.children[0] && searchContainer.children[0].classList.contains('nodeSearchBox'))) return
            ReactDOM.render(<SearchBox
                ref={ref => this.searchBox = ref}
                resize={this.props.resize}
                refChart={this.chart}
                loading={this.props.loading}
                trading_halt={this.symbolObj.trading_halt}
                getAllData={true}
                symbol={this.symbolObj.symbol}
                display_name={this.symbolObj.display_name}
                obj={this.symbolObj}
                dataReceivedFromSearchBox={this.dataReceivedFromSearchBox.bind(this)} />, searchContainer)
        } catch (error) {
            console.error('TVChart renderSearchBox: ', error)
        }
    }

    getDateYTD() {
        return moment().diff(moment([new Date().getFullYear(), 0, 1]), 'days')
    }

    getDateRange(numYear) {
        let now = new Date()
        let startYear = now.getFullYear() - numYear
        return moment().diff(moment([startYear, now.getMonth(), now.getDate()]), 'days')
    }

    reloadChart = () => {
        try {
            this.removeEventListener()
            const style = this.getChartStyle()
            const widgetOptions = Object.assign(this.widget._options, style)
            if (this.chartLayoutStorage && this.chartLayoutStorage.charts) {
                widgetOptions.saved_data = this.chartLayoutStorage
                const style = getComputedStyle(document.body);
                this.chartLayoutStorage.charts[0].chartProperties.paneProperties.background = style.getPropertyValue('--primary-dark').trim()
                this.chartLayoutStorage.charts[0].chartProperties.paneProperties.vertGridProperties.color = style.getPropertyValue('--primary-light').trim()
                this.chartLayoutStorage.charts[0].chartProperties.paneProperties.horzGridProperties.color = style.getPropertyValue('--primary-light').trim()
                this.chartLayoutStorage.charts[0].chartProperties.scalesProperties.lineColor = style.getPropertyValue('--primary-light').trim()
                this.chartLayoutStorage.charts[0].panes[0].sources[0].state.interval = this.widget.activeChart().resolution()
            }
            this.widget = new window.TradingView.widget(widgetOptions) // eslint-disable-line
            this.widget.onChartReady(() => {
                console.log('=====Chart has reloaded!')
                this.chartDocument = this.chart && this.chart.firstChild && this.chart.firstChild.contentDocument
                this.updateTheme();
                this.renderSearchBox()
                this.renderCustomButton()
                this.registerChartMethod()
                this.addChartEventListener()
                this.setTimeFrame()
                this.addEventListener()
            })
        } catch (error) {
            console.error('TVChart reloadChart: ', error)
        }
    }

    themeChanged = () => {
        this.reloadChart()
    }

    fontChanged = () => {
        // this.initChart()
    }

    refreshData = () => {
        this.reloadChart()
    }

    componentDidMount() {
        addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
    }

    getChartLayout = (cb) => {
        try {
            if (dataStorage && dataStorage.userInfo && dataStorage.userInfo.user_id) {
                const activeLayout = this.getActiveLayout()
                let data = {}
                getDataLayout(activeLayout)
                    .then(res => {
                        data = res.data
                        if (data && data.layout) {
                            const layout = JSON.parse(data.layout)
                            if (
                                layout.charts && layout.charts[0] && layout.charts[0].panes && layout.charts[0].panes[0] &&
                                layout.charts[0].panes[0].sources && layout.charts[0].panes[0].sources[0] &&
                                layout.charts[0].panes[0].sources[0].state
                            ) {
                                const style = getComputedStyle(document.body);
                                layout.charts[0].chartProperties.paneProperties.background = style.getPropertyValue('--primary-dark').trim()
                                layout.charts[0].chartProperties.paneProperties.vertGridProperties.color = style.getPropertyValue('--primary-light').trim()
                                layout.charts[0].chartProperties.paneProperties.horzGridProperties.color = style.getPropertyValue('--primary-light').trim()
                                layout.charts[0].chartProperties.scalesProperties.lineColor = style.getPropertyValue('--primary-light').trim()
                                layout.charts[0].panes[0].sources[0].state.symbol = this.symbolObj.symbol || ''
                                layout.charts[0].panes[0].sources[0].state.shortName = this.symbolObj.symbol || ''
                            }
                            this.chartLayoutStorage = layout && layout.charts ? layout : null
                            this.saveListUsingChartLayout(1)
                            cb && cb()
                        } else {
                            if (data.layout_id) dataStorage.listChartLayout[data.layout_id] = data
                            cb && cb()
                        }
                    })
                    .catch(error => {
                        console.error('TVChartContainer getChartLayout: ', error)
                        dataStorage.listChartLayout = {}
                        cb && cb()
                    })
            } else cb && cb()
        } catch (error) {
            console.error('TVChart getChartLayout: ', error)
        }
    }

    componentWillUnmount() {
        this.widget.remove()
        removeEventListener(EVENTNAME.clickToRefresh, this.refreshData)
        this.removeEventListener()
        this.removeChartLayoutDropdown()
        delete dataStorage.closeChartLayout[this.containerId]
    }

    addEventListener = () => {
        try {
            document.addEventListener('mousedown', this.handlerClickOutside);
            addEventListener(EVENTNAME.themeChanged, this.themeChanged)
            addEventListener(EVENTNAME.fontChanged, this.fontChanged)
            this.chartDocument.addEventListener('keypress', this.closeModalSearchBox)
        } catch (error) {
            console.error('TVChart addEventListener: ', error)
        }
    }

    resetSymbolType = (types = []) => {
        for (let i = 0, len = types.length; i < len; i++) {
            const dom = types[i]
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

    closeModalSearchBox = event => {
        try {
            if (this.modalSearchBox && this.modalSearchBox.contains(event.target)) return;
            this.queryID && clearTimeout(this.queryID)
            this.queryID = setTimeout(() => {
                this.modalSearchBox = this.chartDocument.getElementsByClassName('filter')[0]
                if (!this.modalSearchBox) return
                const types = Array.from(this.modalSearchBox.querySelectorAll('.type-filter'))
                this.resetSymbolType(types)
            }, 300)
        } catch (error) {
            console.error(`TVChart openModalSearchBox: ${error}`)
        }
    }

    removeEventListener() {
        try {
            document.removeEventListener('mousedown', this.handlerClickOutside)
            removeEventListener(EVENTNAME.themeChanged, this.themeChanged)
            removeEventListener(EVENTNAME.fontChanged, this.fontChanged)
            this.chartDocument && this.chartDocument.removeEventListener('keypress', this.closeModalSearchBox)
        } catch (error) {
            console.error('TVChart removeEventListener: ', error)
        }
    }

    handlerClickOutside = (event) => {
        try {
            const parent = document.getElementsByClassName('listContentLayoutDropdown')[0]
            if (parent && !parent.contains(event.target)) {
                this.removeChartLayoutDropdown()
            }
        } catch (error) {
            console.error('TVChartContainer outsideClickListener', error)
        }
    }

    removeChartLayoutDropdown() {
        if (this.layoutMenu) {
            this.layoutMenu.style.display = 'none'
            this.svg && this.svg.classList.remove('activeIcon')
        }
    }

    onReady() {
    }

    onResolve(sym) {
        if (sym.symbol !== this.symbolObj.symbol) {
            const comparePopup = this.chartDocument && this.chartDocument.getElementsByClassName('tv-compare-dialog')
            if (comparePopup && comparePopup.length) return
            this.props.send({
                symbol: sym
            })
            this.searchBox && this.searchBox.setSymbol && this.searchBox.setSymbol(sym)
        } else {
            this.timeout && clearTimeout(this.timeout)
            this.timeout = setTimeout(() => {
                this.chartDocument = this.chart && this.chart.firstChild && this.chart.firstChild.contentDocument
                this.updateTheme();
                if (this.widget && this.widget._ready) {
                    this.renderSearchBox()
                    this.renderCustomButton()
                }
            }, 300)
        }
    }

    initChart = (isReset = false) => {
        try {
            if (!this.symbolObj.symbol) return
            this.removeEventListener()
            const ytd = this.getDateYTD() + 'd'
            const all = this.getDateRange((new Date().getFullYear() - 2000 + 30)) + 'd'
            const OneY = this.getDateRange(1) + 'd'
            const ThreeY = this.getDateRange(3) + 'd'
            const FiveY = this.getDateRange(5) + 'd'
            const TenY = this.getDateRange(10) + 'd'
            let widgetOptions = {
                debug: false,
                type: 'black',
                symbol: this.symbolObj.symbol,
                datafeed: Datafeed(this.onReady.bind(this), this.onResolve.bind(this), this.containerId),
                interval: this.props.interval || this.interval || '5',
                container_id: this.containerId,
                library_path: this.props.libraryPath,
                symbol_search_request_delay: 1000,
                locale: getLanguageFromURL() || 'en',
                drawings_access: { type: 'black', tools: [{ name: 'Regression Trend' }] },
                // charts_storage_url: this.props.chartsStorageUrl,
                // charts_storage_api_version: this.props.chartsStorageApiVersion,
                enabled_features: ['chart_property_page_trading', 'keep_left_toolbar_visible_on_small_screens'],
                disabled_features: ['use_localstorage_for_settings', 'study_templates', 'dome_widget', 'header_screenshot', 'move_logo_to_main_pane', 'snapshot_trading_drawings', 'show_logo_on_all_charts'],
                client_id: this.props.clientId,
                hide_side_toolbar: true,
                allow_symbol_change: true,
                user_id: this.props.userId,
                fullscreen: false,
                autosize: true,
                data_status: 'delayed_streaming',
                has_empty_bars: true,
                time_frames: [
                    { text: '1d', resolution: '1', description: `1 ${dataStorage.translate('lang_day').toCapitalize()}`, title: `1 ${dataStorage.translate('lang_day_short')}` },
                    { text: '1w', resolution: '5', description: `1 ${dataStorage.translate('lang_week').toCapitalize()}`, title: `1 ${dataStorage.translate('lang_week_short')}` },
                    { text: '1m', resolution: '30', description: `1 ${dataStorage.translate('lang_month').toCapitalize()}`, title: `1 ${dataStorage.translate('lang_month_short')}` },
                    { text: '3m', resolution: '60', description: `3 ${dataStorage.translate('lang_months').toCapitalize()}`, title: `3 ${dataStorage.translate('lang_month_short')}` },
                    { text: '6m', resolution: '120', description: `6 ${dataStorage.translate('lang_months').toCapitalize()}`, title: `6 ${dataStorage.translate('lang_month_short')}` },
                    { text: ytd, resolution: 'D', description: `${dataStorage.translate('lang_year_to_day')}`, title: `${dataStorage.translate('lang_year_to_day')}` },
                    { text: OneY, resolution: '1D', description: `1 ${dataStorage.translate('lang_year').toCapitalize()}`, title: `1 ${dataStorage.translate('lang_year_short')}` },
                    { text: ThreeY, resolution: 'W', description: `3 ${dataStorage.translate('lang_years').toCapitalize()}`, title: `3 ${dataStorage.translate('lang_year_short')}` },
                    { text: FiveY, resolution: '1W', description: `5 ${dataStorage.translate('lang_years').toCapitalize()}`, title: `5 ${dataStorage.translate('lang_year_short')}` },
                    { text: TenY, resolution: 'M', description: `10 ${dataStorage.translate('lang_years').toCapitalize()}`, title: `10 ${dataStorage.translate('lang_year_short')}` },
                    { text: all, resolution: '1M', description: `${dataStorage.translate('lang_all').toCapitalize()}`, title: `${dataStorage.translate('lang_all')}` }
                ],
                timezone: 'Australia/Sydney',
                supports_search: true,
                supports_group_request: false,
                supports_marks: true,
                supports_timescale_marks: true,
                supports_time: true,
                footer_screenshot: false
            }
            if (this.chartLayoutStorage && !isReset) {
                widgetOptions.saved_data = this.chartLayoutStorage
            }
            widgetOptions = Object.assign(widgetOptions, this.getChartStyle())
            this.widget = new window.TradingView.widget(widgetOptions) // eslint-disable-line
            this.widget.onChartReady(() => {
                this.props.loading(false)
                console.log('=====Chart has loaded!')
                this.chartDocument = this.chart && this.chart.firstChild && this.chart.firstChild.contentDocument
                this.updateTheme();
                this.renderSearchBox()
                this.renderCustomButton()
                this.registerChartMethod()
                this.addChartEventListener()
                this.setTimeFrame()
                this.addEventListener()
            })
        } catch (error) {
            console.error('TVChart initChart: ', error)
        }
    }

    setTimeFrame = (interval) => {
        try {
            // const resolution = interval || this.widget.activeChart().resolution()
            // const country = this.symbolObj.country
            // const zone = 'Australia/Sydney' // country === 'US' ? 'America/New_York' : 'Australia/Sydney'
            // const curOffset = new Date().getTimezoneOffset() * 60 * 1000
            // const offset = moment.tz.zone(zone).utcOffset(+new Date()) * 60 * 1000
            // let startTime = +moment().subtract(1, 'days')
            // let endTime = +new Date()
            // switch (resolution) {
            //     case '1':
            //         startTime = +moment().subtract(1, 'days')
            //         break
            //     case '5':
            //         startTime = +moment().subtract(7, 'days')
            //         break
            //     case '30':
            //         startTime = +moment().subtract(1, 'months')
            //         break
            //     case '60':
            //         startTime = +moment().subtract(3, 'months')
            //         break
            //     case '120':
            //         startTime = +moment().subtract(6, 'months')
            //         break
            //     case 'D':
            //         startTime = +moment().startOf('year')
            //         break
            //     case '1D':
            //         startTime = +moment().subtract(1, 'years')
            //         break
            //     case 'W':
            //         startTime = +moment().subtract(3, 'years')
            //         break
            //     case '1W':
            //         startTime = +moment().subtract(5, 'years')
            //         break
            //     case 'M':
            //         startTime = +moment().subtract(10, 'years')
            //         break
            //     case '1M':
            //         startTime = +moment().subtract(30, 'years')
            //         break
            //     default:
            //         break
            // }
            // startTime = startTime + curOffset - offset
            // endTime = endTime + curOffset - offset
            // this.widget.chart().setVisibleRange({
            //     from: startTime / 1000,
            //     to: endTime / 1000
            // })
        } catch (error) {
            console.error('TVChartContainer setTimeFrame: ', error)
        }
    }

    addChartEventListener = () => {
        try {
            this.chartDocument.addEventListener('click', (e) => {
                this.closeModalSearchBox(e)
                if (e.target.classList.contains('testchartbutton')) return
                this.removeChartLayoutDropdown()
            })
        } catch (error) {
            console.error('TVChart addChartEventListener: ', error)
        }
    }

    renderCustomButton = () => {
        if (dataStorage && dataStorage.userInfo && dataStorage.userInfo.user_id) {
            this.renderSaveButton()
        }
    }

    renderSaveButton = () => {
        try {
            const oldButton = this.chartDocument && this.chartDocument.querySelector('.testchartbutton')
            if (oldButton || !this.widget) return
            const button = this.widget.createButton && typeof this.widget.createButton === 'function' && this.widget.createButton()[0]
            button.setAttribute('title', dataStorage.translate('lang_save_layout').toCapitalize())
            const onClick = e => {
                closeChartLayout()
                const svg = this.svg = e.target.children[0]
                if (svg.classList.contains('activeIcon')) {
                    svg.classList.remove('activeIcon')
                } else {
                    svg.classList.add('activeIcon')
                    this.calculatePositionForDropdownContent(button)
                }
            }
            button.addEventListener('click', e => onClick.call(this, e))
            button.className = 'button testchartbutton'
            ReactDOM.render(<Icon src='content/save'></Icon>, button)
        } catch (error) {
            console.error('TVChart renderSaveButton: ', error)
        }
    }

    getActiveLayout = () => {
        return this.usingChartLayout || dataStorage.usingChartLayout
    }

    deleteLayout = (id) => {
        try {
            const activeLayout = this.getActiveLayout()
            const lstChart = { ...dataStorage.listChartLayout } || {}
            if (!id || !lstChart[id] || dataStorage.deletingChartLayout) return
            deleteDataLayout(id).then(() => {
                delete dataStorage.listChartLayout[id]
                if (id === activeLayout) this.onChangeLayout('default_template')
                this.removeChartLayoutDropdown()
            }).catch(error => {
                console.error('TVChartContainer deleteLayout: ', error)
            })
        } catch (error) {
            console.error('TVChart deleteLayout: ', error)
        }
    }

    updateLayout = (id, layoutName = '') => {
        try {
            if (layoutName) this.editLayout(id, layoutName)
            else this.overrideLayout(id)
        } catch (error) {
            console.error('TVChart updateLayout: ', error)
        }
    }

    removeTemplateDeleted() {
        if (dataStorage.deletingChartLayout && dataStorage.listChartLayout[dataStorage.deletingChartLayout]) {
            delete dataStorage.listChartLayout[dataStorage.deletingChartLayout]
            dataStorage.deletingChartLayout = ''
        }
    }

    saveListUsingChartLayout(value, id) {
        if (!id) id = this.getActiveLayout()
        if (dataStorage.listUsingChartLayout[id]) {
            dataStorage.listUsingChartLayout[id] = dataStorage.listUsingChartLayout[id] + value
        } else {
            if (value === -1) {
                delete dataStorage.listUsingChartLayout[id]
            } else {
                dataStorage.listUsingChartLayout[id] = value
            }
        }
    }

    overrideCurrentLayout = (id) => {
        try {
            this.widget.save(savedObj => {
                const savedLayout = savedObj ? JSON.stringify(savedObj) : ''
                const lstChart = { ...dataStorage.listChartLayout } || {}
                const curChartLayout = lstChart[id]
                if (!curChartLayout) return
                const newestUpdated = curChartLayout.updated || +new Date() + ''
                const curUpdated = this.curChartLayoutVersion || '0'
                const curName = curChartLayout.layout_name
                if (newestUpdated === curUpdated) {
                    const curLayout = dataStorage.listChartLayout[id]
                    curLayout.layout = savedLayout
                    curLayout.updated = +new Date() + ''
                    this.curChartLayoutVersion = curLayout.updated
                    dataStorage.curChartLayoutVersion = this.curChartLayoutVersion
                    delete curLayout.key
                    delete curLayout.init_time
                    dataStorage.listChartLayout[id] = curLayout
                    updateDataLayout(id, curLayout).then(() => {
                        this.chartLayoutStorage = savedObj
                        dataStorage.chartSelfChange = true
                        this.removeChartLayoutDropdown()
                    }).catch(error => {
                        console.error('TVChartContainer overrideCurrentLayout: ', error)
                    })
                } else {
                    const lst = dataStorage.listLayout || {}
                    const newName = genreNewName(curName, lst)
                    const newId = uuidv4()
                    const newLayout = {
                        layout_id: newId,
                        layout_name: newName,
                        type: LayoutType.CHART_LAYOUT,
                        layout: savedLayout,
                        updated: +new Date() + ''
                    }
                    this.removeTemplateDeleted()
                    dataStorage.listChartLayout[newId] = newLayout
                    this.curChartLayoutVersion = newLayout.updated
                    dataStorage.curChartLayoutVersion = this.curChartLayoutVersion
                    this.setUsingChart(newId)
                    this.saveListUsingChartLayout(1)
                    createNewLayout(newLayout).then(() => {
                        dataStorage.chartSelfChange = true
                        this.removeChartLayoutDropdown()
                    }).catch(error => {
                        console.error('TVChartContainer overrideCurrentLayout: ', error)
                    })
                }
            })
        } catch (error) {
            console.error('TVChart overrideCurrentLayout: ', error)
        }
    }

    overrideAnotherLayout = (id) => {
        try {
            this.widget.save(savedObj => {
                const savedLayout = savedObj ? JSON.stringify(savedObj) : ''
                const lstChart = { ...dataStorage.listChartLayout } || {}
                const curChartLayout = lstChart[id]
                if (!curChartLayout) return
                const curId = curChartLayout.layout_id
                curChartLayout.layout = savedLayout
                curChartLayout.updated = +new Date() + ''
                delete curChartLayout.key
                delete curChartLayout.init_time
                dataStorage.listChartLayout[curId] = curChartLayout
                updateDataLayout(curId, curChartLayout).then(() => {
                    dataStorage.chartSelfChange = true
                    this.removeChartLayoutDropdown()
                }).catch(error => {
                    console.error('TVChartContsainer overrideAnotherLayout: ', error)
                })
            })
        } catch (error) {
            console.error('TVChart overrideAnotherLayout: ', error)
        }
    }

    overrideLayout = (id) => {
        try {
            if (!id) return
            const activeLayout = this.getActiveLayout()
            if (id === activeLayout) this.overrideCurrentLayout(id)
            else this.overrideAnotherLayout(id)
        } catch (error) {
            console.error('TVChart overrideLayout: ', error)
        }
    }

    editLayout = (id, name) => {
        try {
            const lstChart = { ...dataStorage.listChartLayout } || {}
            const curChartLayout = lstChart[id]
            if (!curChartLayout) return
            const activeLayout = this.getActiveLayout()
            curChartLayout['layout_name'] = name
            curChartLayout['updated'] = +new Date() + ''
            if (id === activeLayout) {
                this.curChartLayoutVersion = curChartLayout.updated
                dataStorage.curChartLayoutVersion = this.curChartLayoutVersion
            }
            delete curChartLayout.init_time
            delete curChartLayout.is_using_layout
            delete curChartLayout.key
            dataStorage.listChartLayout[id] = curChartLayout
            updateDataLayout(id, curChartLayout).then(() => {
                this.removeChartLayoutDropdown()
            }).catch(error => {
                console.error('TVChartContainer updateLayout: ', error)
            })
        } catch (error) {
            console.error('TVChart editLayout: ', error)
        }
    }

    createNewLayout = (layoutName = '') => {
        try {
            if (!layoutName) return
            this.widget.save(savedObj => {
                const savedLayout = savedObj ? JSON.stringify(savedObj) : ''
                const newId = uuidv4()
                const newLayout = {
                    layout_id: newId,
                    layout_name: layoutName,
                    type: LayoutType.CHART_LAYOUT,
                    layout: savedLayout,
                    updated: +new Date() + '',
                    is_using_chart_layout: newId
                }
                dataStorage.listChartLayout[newId] = newLayout
                this.curChartLayoutVersion = newLayout.updated
                dataStorage.curChartLayoutVersion = this.curChartLayoutVersion
                this.setUsingChart(newId)
                this.saveListUsingChartLayout(1)
                const lst = dataStorage.listLayout || {}
                const usingLayout = dataStorage.usingLayout || ''
                if (lst[usingLayout]) {
                    const curUserLayout = lst[usingLayout] || {}
                    curUserLayout['chart_layout'] = newId
                    delete curUserLayout.key
                    delete curUserLayout.init_time
                    updateDataLayout(curUserLayout.layout_id, curUserLayout).then(() => {
                        console.log('update user layout after create new chart template')
                    }).catch(() => {
                        console.error('TVChartContainer createNewLayout updateDataLayout: ', error)
                    })
                }
                createNewLayout(newLayout).then(() => {
                    this.removeTemplateDeleted()
                    this.removeChartLayoutDropdown()
                }).catch(error => {
                    console.error('TVChartContainer createNewLayout createNewLayout: ', error)
                })
            })
        } catch (error) {
            console.error('TVChart createLayout: ', error)
        }
    }

    setUsingChart = (id) => {
        dataStorage.usingChartLayout = id
        this.usingChartLayout = id
        this.props.saveState({
            usingChartLayout: id
        })
    }

    onChangeLayout = (id) => {
        try {
            this.setUsingChart(id)
            if (id === 'default_template') {
                this.removeChartLayoutDropdown()
                this.initChart(true)
            } else {
                const lst = dataStorage.listLayout || {}
                const usingLayout = dataStorage.usingLayout || ''
                const curLayout = lst[usingLayout]
                if (!curLayout) return
                curLayout['chart_layout'] = id
                const curChartLayout = dataStorage.listChartLayout[id] || {}
                this.curChartLayoutVersion = curChartLayout.updated || +new Date()
                dataStorage.curChartLayoutVersion = this.curChartLayoutVersion
                this.saveListUsingChartLayout(1, id)
                curLayout.is_using_layout = dataStorage.usingLayout || ''
                curLayout.is_using_chart_layout = id
                delete curLayout.key
                delete curLayout.init_time
                dataStorage.listLayout[usingLayout] = curLayout
                updateDataLayout(usingLayout, curLayout).then(() => {
                    this.removeTemplateDeleted()
                    dataStorage.chartSelfChange = true
                    this.removeChartLayoutDropdown()
                    this.loadLayout()
                })
            }
        } catch (error) {
            console.error('TVChart onChangeLayout: ', error)
        }
    }

    loadLayout = () => {
        try {
            const id = this.getActiveLayout()
            getDataLayout(id).then(res => {
                const layoutStr = res && res.data && res.data.layout
                const layout = layoutStr && JSON.parse(layoutStr)
                if (!layout) return
                const style = getComputedStyle(document.body);
                layout.charts[0].chartProperties.paneProperties.background = style.getPropertyValue('--primary-dark').trim()
                layout.charts[0].chartProperties.paneProperties.vertGridProperties.color = style.getPropertyValue('--primary-light').trim()
                layout.charts[0].chartProperties.paneProperties.horzGridProperties.color = style.getPropertyValue('--primary-light').trim()
                layout.charts[0].chartProperties.scalesProperties.lineColor = style.getPropertyValue('--primary-light').trim()
                layout.charts[0].panes[0].sources[0].state.symbol = this.symbolObj.symbol || ''
                const interval = layout.charts[0].panes[0].sources[0].state.interval
                this.widget.activeChart().setResolution(interval)
                this.widget.load(layout)
            })
        } catch (error) {
            console.error('TVChart loadLayout: ', error)
        }
    }

    calculatePositionForDropdownContent(dom) {
        try {
            const chartDom = this.props.glContainer._element[0].getElementsByClassName('TVChartContainer')
            const chartContainer = chartDom ? chartDom[0] : null
            const q = chartContainer ? chartContainer.getBoundingClientRect() : {}
            const topChart = q.top || 0
            const leftChart = q.left || 0
            const p = dom.getBoundingClientRect() || {}
            const left = p.left || 0
            const top = p.top || 0
            const bodyWidth = document.body.clientWidth
            const div = this.layoutMenu = document.createElement('div')
            div.style.position = 'absolute'
            div.style.right = `${bodyWidth - leftChart - left - dom.clientWidth - 1}px`
            div.style.left = null
            div.style.top = `${top + topChart + dom.clientHeight - 3}px`
            div.style.bottom = null
            div.style.visibility = 'visible'
            const lstChart = dataStorage.listChartLayout || {}
            let listChartLayout = Object.keys(lstChart).map(k => {
                lstChart[k].key = k
                if (!lstChart[k].updated) lstChart[k].updated = 0
                return lstChart[k]
            })
            listChartLayout = listChartLayout && listChartLayout.length && listChartLayout.sort((a, b) => b.updated - a.updated)
            ReactDOM.render(<Layout
                getActiveLayout={this.getActiveLayout}
                deleteLayout={this.deleteLayout}
                updateLayout={this.updateLayout}
                createNewLayout={this.createNewLayout}
                onChangeLayout={this.onChangeLayout}
                listData={listChartLayout} />, div)
            const popout = getChartDom()
            popout.appendChild(div)
        } catch (error) {
            console.error('TVChart calculatePositionForDropdown: ', error)
        }
    }

    registerChartMethod = () => {
        try {
            this.widget.activeChart().onSymbolChanged().subscribe(null, () => {
                console.log('=====The symbol is changed')
                this.props.loading(false)
            })
            this.widget.activeChart().onIntervalChanged().subscribe(null, (interval, timeframeObj) => {
                console.log('=====onIntervalChanged')
                this.setTimeFrame()
            })
            this.widget.activeChart().dataReady(() => {
                console.log('=====dataReady')
            })
            this.widget.activeChart().onDataLoaded().subscribe(null, () =>
                console.log('=====onDataLoaded'),
                true
            )
            // this.widget.activeChart().onVisibleRangeChanged().subscribe(null, ({ from, to }) => {
            //     console.log('=====onVisibleRangeChanged')
            // })
        } catch (error) {
            console.error('TVChart registerChartMethod: ', error)
        }
    }

    render() {
        return (
            <div
                ref={ref => this.chart = ref}
                id={this.containerId}
                className={'TVChartContainer'}
            />
        )
    }
}
