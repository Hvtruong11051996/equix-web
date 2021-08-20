import React from 'react'
import BrokerActivityAnalysis from '../BrokerActivityAnalysis/BrokerActivityAnalysis'
import StockShareAnalysis from '../StockShareAnalysis/StockShareAnalysis'
import BrokerStockDetail from '../BrokerStockDetail/BrokerStockDetail'
import BrokerTradeAnalysis from '../BrokerTradeAnalysis/brokerTradeAnalysis'
import logger from '../../helper/log';
import optionsDrop from '../../constants/options_drop_down';
import { getSecurityTypeOptions, getTradeTypeOptions, getBrokerOptions } from '../../constants/broker_data'
import moment from 'moment-timezone';
import dataStorage from '../../dataStorage';
import { setInitMondayDate, setInitFridayDate } from '../Inc/BrokerDataFrequencyAndTime/FrequencyAndTimeBroker';
import Icon from '../Inc/Icon';
class BrokerDataReports extends React.Component {
    constructor(props) {
        super(props)
        this.initState = props.loadState()
        this.state = {
            nameBroker: this.initState.nameBroker || 1,
            symbolObj: {},
            objValue: {},
            brokers: [],
            securityTypes: [],
            tradeTypes: [],
            brokersTradeAnalysis: [],
            disableCollapseGridBAA: this.initState.disableCollapseGridBAA || false,
            disableCollapseGridSSA: this.initState.disableCollapseGridSSA || false
        }
        this.dateTimeDefault = moment(moment().tz(dataStorage.timeZone)).subtract(3, 'days');
        this.defaultBrokerID = '00';
        this.defaultSecurityType = 'Total';
        this.defaultExchange = 'ASX:TM';
        this.defaultView = 'BUY_SELL';
        this.defaultTradeType = 'Total';
        this.defaultFrequency = 'Weekly';
        this.defaultFromDate = setInitMondayDate(this.dateTimeDefault);
        this.defalutToDate = setInitFridayDate(this.dateTimeDefault).day;
        this.defaultBrokerDataReportOptions = {
            brokerID: (this.initState && this.initState.brokerID) || this.defaultBrokerID,
            securityType: (this.initState && this.initState.securityType) || this.defaultSecurityType,
            exchange: (this.initState && this.initState.exchange) || this.defaultExchange,
            view: (this.initState && this.initState.view) || this.defaultView,
            tradeType: (this.initState && this.initState.tradeType) || this.defaultTradeType,
            frequency: (this.initState && this.initState.frequency) || this.defaultFrequency,
            fromDate: (this.initState && this.initState.fromDate && moment(this.initState.fromDate)) || this.defaultFromDate,
            toDate: (this.initState && this.initState.toDate && moment(this.initState.toDate)) || this.defalutToDate,
            datePicker: (this.initState && this.initState.datePicker && moment(this.initState.datePicker)) || this.dateTimeDefault,
            symbolObj: (this.initState && this.initState.symbolObj) || {},
            nameBroker: (this.initState && this.initState.nameBroker) || 1,
            disableCollapse: (this.initState && this.initState.disableCollapse) || false
        }
        this.brokerTabState = Object.assign({}, this.defaultBrokerDataReportOptions, this.initState);
        this.getOptionsHeaderBroker = this.getOptionsHeaderBroker.bind(this);
        this.initRenderTabs = true;
        this.collapseChangeWidget = false
    }
    changeWidget = (obj, isStockShare) => {
        if (obj.symbolObj || isStockShare) {
            this.setState({
                symbolObj: obj.symbolObj,
                objValue: obj.objValue,
                nameBroker: 2
            }, () => this.collapseChangeWidget = true)
            this.props.saveState && this.props.saveState({
                nameBroker: 2
            })
        } else {
            this.setState({
                objValue: obj.objValue,
                nameBroker: 1
            }, () => this.collapseChangeWidget = true)
            this.props.saveState && this.props.saveState({
                nameBroker: 1
            })
        }
    }

    getSymbolObj = (obj) => {
        this.setState({ symbolObj: obj })
    }

    handleSaveLayout = (obj) => {
        Object.assign(this.brokerTabState, obj);
        this.props.saveState && this.props.saveState(this.brokerTabState);
    }

    handleChangeBrokerDataReports = (type) => {
        try {
            this.props.saveState && this.props.saveState({
                nameBroker: type
            })
            if (type === this.state.nameBroker) return;
            if (type === 1 || type === 4) {
                this.setState({
                    symbolObj: {},
                    nameBroker: type
                }, () => this.collapseChangeWidget = true)
            } else {
                this.setState({
                    nameBroker: type
                }, () => this.collapseChangeWidget = true)
            }
        } catch (error) {
            logger.error('handleChangeBrokerDataReports on BrokerDataReports' + error)
        }
    }

    expandCompanyInfo = (disableCollapseGrid) => {
        let state = {}
        if (this.state.nameBroker === 1) {
            Object.assign(state, { disableCollapseGridBAA: !disableCollapseGrid })
        } else if (this.state.nameBroker === 2) {
            Object.assign(state, { disableCollapseGridSSA: !disableCollapseGrid })
        }
        this.props.saveState && this.props.saveState(state)
        if (this.domCollapseGrid.classList.contains('collapse')) {
            this.setState(state, () => {
                this.resizeColumns();
                this.domCollapseGrid.parentNode.style.marginTop = '0px'
            })
        } else {
            this.setState(state, () => {
                this.domCollapseGrid.parentNode.style.marginTop = '20px'
            })
        }
    }

    renderTabs = (Grid) => {
        let disableCollapseGrid = this.state.disableCollapseGridBAA;
        let heightGrid = '175px'
        if (this.state.nameBroker === 2) {
            disableCollapseGrid = this.state.disableCollapseGridSSA;
            heightGrid = '230px'
        }
        if (disableCollapseGrid) {
            if (this.domCollapseGrid && (this.initRenderTabs || this.collapseChangeWidget)) {
                this.domCollapseGrid.parentNode.style.marginTop = '20px';
                this.initRenderTabs = false;
                this.collapseChangeWidget = false;
            }
        }
        return (
            <div className={`securityInfo custome ${disableCollapseGrid ? 'collapse' : ''}`} ref={dom => this.domCollapseGrid = dom}>
                <div className='securityCompany'>
                    <div className='sliderInfo' style={{ height: heightGrid }}>
                        {Grid}
                    </div>
                </div>
                <div className='tabs-view'>
                    <div className='tabCenterButton' onClick={() => this.expandCompanyInfo(disableCollapseGrid)}>
                        <Icon className={`iconTabCenter ${this.state.disableCollapse ? '' : 'iconTabCenterDisable'}`} src={'av/play-arrow'} />
                    </div>
                </div>
            </div>
        )
    }

    renderDisplayBroker = (name) => {
        const { brokers, securityTypes, tradeTypes, brokersTradeAnalysis, disableCollapseGridSSA, disableCollapseGridBAA } = this.state
        if ((!brokers || !brokers.length) || (!securityTypes || !securityTypes.length) || (!tradeTypes || !tradeTypes.length) || (!brokersTradeAnalysis || !brokersTradeAnalysis.length)) return null;
        try {
            switch (name) {
                case 1: return <BrokerActivityAnalysis
                    {...this.props}
                    brokerTabState={this.brokerTabState}
                    changeWidget={this.changeWidget}
                    symbolObj={this.state.symbolObj}
                    objValue={this.state.objValue}
                    getSymbolObj={this.getSymbolObj}
                    brokers={brokers}
                    securityTypes={securityTypes}
                    tradeTypes={tradeTypes}
                    brokerForm={'BrokerDataReports'}
                    brokerDataReportOptions={optionsDrop.optionsBrokerDataReports}
                    defaultBrokerDataReport={this.state.nameBroker}
                    handleChangeBrokerDataReports={this.handleChangeBrokerDataReports}
                    handleSaveLayout={this.handleSaveLayout}
                    disableCollapseGridBAA={disableCollapseGridBAA}
                    renderTabs={this.renderTabs}
                    func={func => this.resizeColumns = func.resizeColumns}
                />
                case 2: return <StockShareAnalysis
                    {...this.props}
                    brokerTabState={this.brokerTabState}
                    changeWidget={this.changeWidget}
                    symbolObj={this.state.symbolObj}
                    objValue={this.state.objValue}
                    getSymbolObj={this.getSymbolObj}
                    brokers={brokers}
                    securityTypes={securityTypes}
                    tradeTypes={tradeTypes}
                    brokerForm={'BrokerDataReports'}
                    brokerDataReportOptions={optionsDrop.optionsBrokerDataReports}
                    defaultBrokerDataReport={this.state.nameBroker}
                    handleChangeBrokerDataReports={this.handleChangeBrokerDataReports}
                    handleSaveLayout={this.handleSaveLayout}
                    disableCollapseGridSSA={disableCollapseGridSSA}
                    renderTabs={this.renderTabs}
                    func={func => this.resizeColumns = func.resizeColumns}
                />
                case 3: return <BrokerStockDetail
                    {...this.props}
                    brokerTabState={this.brokerTabState}
                    symbolObj={this.state.symbolObj}
                    getSymbolObj={this.getSymbolObj}
                    brokers={brokers}
                    securityTypes={securityTypes}
                    tradeTypes={tradeTypes}
                    brokerForm={'BrokerDataReports'}
                    brokerDataReportOptions={optionsDrop.optionsBrokerDataReports}
                    defaultBrokerDataReport={this.state.nameBroker}
                    handleChangeBrokerDataReports={this.handleChangeBrokerDataReports}
                    handleSaveLayout={this.handleSaveLayout}
                />
                case 4: return <BrokerTradeAnalysis
                    {...this.props}
                    brokerTabState={this.brokerTabState}
                    brokers={brokersTradeAnalysis}
                    brokerForm={'BrokerDataReports'}
                    brokerDataReportOptions={optionsDrop.optionsBrokerDataReports}
                    defaultBrokerDataReport={this.state.nameBroker}
                    handleChangeBrokerDataReports={this.handleChangeBrokerDataReports}
                    handleSaveLayout={this.handleSaveLayout}
                />
                default: break;
            }
        } catch (error) {
            logger.error('renderDisplayBroker' + error)
        }
    }
    async getOptionsHeaderBroker() {
        const [brokers, securityTypes, tradeTypes] = await Promise.all([getBrokerOptions(), getSecurityTypeOptions(), getTradeTypeOptions()])
        this.setState({
            brokers: brokers[0],
            securityTypes,
            tradeTypes,
            brokersTradeAnalysis: brokers[1]
        })
    }
    componentDidMount() {
        this.getOptionsHeaderBroker();
        this.refreshView && this.refreshView()
    }
    render() {
        return (
            <div id='BrokerDataReports'>
                {this.renderDisplayBroker(this.state.nameBroker)}
            </div>
        )
    }
}
export default BrokerDataReports
