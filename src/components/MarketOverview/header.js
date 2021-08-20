import React from 'react'
import ToggleLine from '../Inc/ToggleLine'
import MoreOption from '../Inc/MoreOption'
import DropDown from '../DropDown'
import dataStorage from '../../dataStorage'
import s from './overview.module.css'
import FilterBox from '../Inc/FilterBox'
import ListBox from './box'
import env from '../../constants/enviroments'
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event';

const CLASS_OPTIONS = {}
export default class MarketOverview extends React.Component {
    constructor(props) {
        super(props)
        this.mount = false
        const initState = props.loadState()
        this.filterText = initState.valueFilter || ''
        this.getOption()
        const classType = initState.classType || Object.values(CLASS_OPTIONS)[0].value
        const priceTable = this.getPriceTable(classType, initState.priceTable)
        this.isConnected = dataStorage.isConnected
        this.collapse = +initState.collapse
        this.state = {
            classType,
            priceTable
        }
    }

    getOption = () => {
        const config = dataStorage.web_config[dataStorage.web_config.common.project]
        if (config && (config.roles.showEquity || config.roles.showFuture)) {
            if (config.roles.showEquity) CLASS_OPTIONS.EQUITY = { value: 'equity', label: 'lang_equity' }
            if (config.roles.showFuture) CLASS_OPTIONS.FUTURE = { value: 'future', label: 'lang_futures' }
        } else {
            CLASS_OPTIONS.EQUITY = { value: 'equity', label: 'lang_equity' }
            CLASS_OPTIONS.FUTURE = { value: 'future', label: 'lang_futures' }
        }
    }

    componentDidMount() {
        this.mount = true
        addEventListener(EVENTNAME.connectionChanged, this.changeConnection)
        this.getDataWatchlist()
    }

    changeConnection = (isConnected) => {
        if (isConnected && this.isConnected !== isConnected) {
            this.isConnected = isConnected;
            this.getDataWatchlist();
            this.getDataOverview && this.getDataOverview()
        }
    }

    componentWillUnmount() {
        this.mount = false
        removeEventListener(EVENTNAME.connectionChanged, this.changeConnection)
    }

    collapseFunc = (collapse) => {
        this.props.saveState({ collapse: +collapse })
        this.collapse = +collapse
        this.dom && this.dom.classList.toggle('collapse')
    }

    onChangeClassType = (selectedValue) => {
        const priceTable = this.getPriceTable(selectedValue)
        this.props.saveState({ classType: selectedValue })
        this.mount && this.setState({ priceTable, classType: selectedValue })
        this.getDataWatchlist()
    }

    getDataWatchlist() {
        this.props.getDataWatchlist && this.props.getDataWatchlist(this.priceSelected, this.filterText)
    }

    getPriceTable(value = this.state.classType, initialValue) {
        const suffix = dataStorage.userInfo ? '' : '-delayed'
        const topGainerValue = 'top-price-gainer' + suffix
        const topLoserValue = 'top-price-loser' + suffix
        const topValue = 'top-price-market-value' + suffix
        let priceTable = []
        switch (value) {
            case 'equity':
                priceTable = [
                    { label: 'lang_indices', value: 'top-asx-20' },
                    { label: 'lang_top_gainers', value: topGainerValue, className: 'text-normal' },
                    { label: 'lang_top_losers', value: topLoserValue, className: 'text-normal' },
                    { label: 'lang_top_value', value: topValue, className: 'text-normal' },
                    { label: 'lang_ssx', value: 'ssx', className: 'text-normal' }
                ]
                break
            case 'future': priceTable = [
                { label: 'lang_mixAsset', value: 'mixed-futures', className: 'text-normal' },
                { label: 'lang_tradableBMDX', value: 'tradable-xkls', className: 'text-normal' },
                { label: 'lang_tradableCBOT', value: 'tradable-xcbt', className: 'text-normal' },
                { label: 'lang_tradableCOMEX', value: 'tradable-xcec', className: 'text-normal' },
                { label: 'lang_tradableICE_EU_IFLX', value: 'tradable-iflx', className: 'text-normal' },
                { label: 'lang_tradableICE_EU', value: 'tradable-ifeu', className: 'text-normal' },
                { label: 'lang_tradableICE_US', value: 'tradable-ifus', className: 'text-normal' },
                { label: 'lang_tradableLME', value: 'tradable-xlme', className: 'text-normal' },
                { label: 'lang_tradableNYMEX', value: 'tradable-xnym', className: 'text-normal' },
                { label: 'lang_tradableSGX', value: 'tradable-xsce', className: 'text-normal' },
                { label: 'lang_tradableTOCOM', value: 'tradable-xtkt', className: 'text-normal' }
            ]
                break
            default: return []
        }
        this.priceSelected = initialValue && (initialValue + '').includes('top-asx') ? priceTable[0].value : (initialValue || priceTable[0].value)
        return priceTable
    }

    onChangePriceTable = (selectedValue) => {
        this.priceSelected = selectedValue
        this.props.saveState({ priceTable: selectedValue })
        this.getDataWatchlist()
        this.forceUpdate()
    }

    renderDropdown() {
        return (
            <div className={s.row}>
                {this.renderClassType()}
                <div style={{ width: 8 }} />
                {this.renderPriceTable()}
            </div>
        )
    }

    renderLeft() {
        return (
            <div style={{ width: '100%' }}>
                {this.renderDropdown()}
                <div style={{ height: 8 }} />
                {this.renderIndices()}
                {this.renderQuickFilter()}
            </div>
        )
    }

    renderClassType() {
        return (
            <DropDown
                translate={true}
                style={{ minWidth: 120 }}
                options={Object.values(CLASS_OPTIONS)}
                value={this.state.classType}
                onChange={this.onChangeClassType}
            />
        )
    }

    renderPriceTable() {
        return (
            <DropDown
                translate={true}
                style={{ minWidth: 150 }}
                options={this.state.priceTable}
                value={this.priceSelected}
                onChange={this.onChangePriceTable}
            />
        )
    }

    onChangeTextFilter = (value) => {
        this.filterText = value
        this.props.onQuickFilter && this.props.onQuickFilter(value)
    }

    renderQuickFilter(isLeft) {
        return (
            <FilterBox
                className={isLeft ? s.quickFilterLeft : s.quickFilterBottom}
                value={this.filterText}
                onChange={this.onChangeTextFilter}
            />
        )
    }

    setIndices = (indices) => {
        this.priceSelected = indices
        this.props.saveState({ priceTable: indices })
        this.getDataWatchlist()
    }

    renderIndices() {
        if (!this.priceSelected.includes('top-asx')) return null
        return <ListBox setIndices={this.setIndices}
            register={fn => this.getDataOverview = fn}
            onResize={this.props.onResize}
            getDataOverview={this.props.getDataOverview} />
    }

    render() {
        return (
            <React.Fragment>
                <div className={`header-wrap isMoreOption flex ${this.collapse ? 'collapse' : ''}`} ref={ref => this.dom = ref}>
                    <div className='navbar more'>
                        {this.renderLeft()}
                        {this.renderQuickFilter(true)}
                    </div>
                    <MoreOption agSideButtons={this.props.createagSideButtons()} />
                </div>
                <ToggleLine collapse={this.collapse} collapseFunc={this.collapseFunc} />
            </React.Fragment>
        )
    }
}
