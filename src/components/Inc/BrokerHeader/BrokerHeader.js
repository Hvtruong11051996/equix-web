import React, { Component } from 'react'
import Slider from '../Slider/Slider'
import SearchBox from '../../SearchBox/SearchBox'
import SecurityDetailIcon from '../SecurityDetailIcon/SecurityDetailIcon'
import logger from '../../../helper/log';
import FilterBox from '../FilterBox';
import DropDown from '../../DropDown/DropDown';
import dataStorage from '../../../dataStorage';
import Icon from '../Icon/Icon'
import Lang from '../Lang'

class BrokerHeader extends Component {
    constructor(props) {
        super(props)
        this.state = {
            symbolObj: props.symbolObj || {},
            width: 0,
            brokerHeaderInstance: {}
        }
        this.padding = 16
        this.range = 50
        props.resize((w, _) => {
            this.setState({
                widgetWidth: w,
                leftContainerWidth: (this.leftBrokerHeaderNode && this.leftBrokerHeaderNode.clientWidth) || 0
            })
        })
    }

    dataReceivedFromSearchBox = symbolObj => {
        try {
            this.setState({ symbolObj })
            this.props.dataReceivedFromBrokerHeader && this.props.dataReceivedFromBrokerHeader(symbolObj)
        } catch (error) {
            logger.error(`Error while receiving data from search box: ${error}`)
        }
    }
    refreshData = () => {
        this.domBtnRefresh.children[0].classList.add('iconRefresh')
        this.props.refreshData()
        setTimeout(() => {
            this.domBtnRefresh.children[0].classList.remove('iconRefresh')
        }, 1000)
    }
    render() {
        const { symbolObj, widgetWidth, leftContainerWidth, brokerHeaderInstance } = this.state
        const { items, brokerForm, hiddenSearchBox, loading, dataReceivedFromFilterBox, showFilterBox, canDelete = 'allow', brokerDataReportOptions, defaultBrokerDataReport, handleChangeBrokerDataReports } = this.props
        try {
            return (
                <div className='brk-header-wrap' ref={dom => this.brokerHeaderNode = dom}>
                    <div className='brk-header-left' ref={dom => this.leftBrokerHeaderNode = dom}>
                        {!this.props.disableRefreshBtn && (dataStorage.enableStreamingUs || dataStorage.enableStreamingAu || dataStorage.enableStreamingFu) ? <div className='btnRefresh' onClick={this.refreshData} ref={dom => this.domBtnRefresh = dom}><Icon src={'navigation/refresh'} /></div> : ''}
                        {brokerForm === 'BrokerDataReports'
                            ? <div style={{ marginRight: 8 }}>
                                <DropDown
                                    translate={true}
                                    options={brokerDataReportOptions || []}
                                    value={defaultBrokerDataReport}
                                    onChange={handleChangeBrokerDataReports}
                                    name='brokerTabDropDown'
                                />
                            </div>
                            : null}
                        {hiddenSearchBox
                            ? null
                            : <SearchBox
                                onlyASX={true}
                                allowDelete={canDelete === 'allow'}
                                display_name={symbolObj.display_name}
                                obj={symbolObj}
                                loading={loading}
                                dataReceivedFromSearchBox={this.dataReceivedFromSearchBox}
                            />}
                        {showFilterBox
                            ? <FilterBox
                                // value={this.state.valueFilterBox}
                                onChange={dataReceivedFromFilterBox}
                            /> : null}
                        {
                            (symbolObj && Object.keys(symbolObj).length) && !hiddenSearchBox
                                ? (
                                    <div className='brk-security'>
                                        <div style={{ marginLeft: 16 }}>
                                            {symbolObj.company_name || symbolObj.company || symbolObj.security || symbolObj.security_name || ''}
                                        </div>
                                        <SecurityDetailIcon
                                            iconStyle={{ position: 'unset', top: 'unset', transform: 'unset', marginLeft: 8 }}
                                            symbolObj={symbolObj}
                                        />
                                    </div>
                                )
                                : null
                        }
                    </div>
                    <div className='brk-header-right' ref={dom => this.rightBrokerHeaderNode = dom}>
                        {items && items.length
                            ? <Slider
                                items={items}
                                widgetWidth={widgetWidth}
                                leftContainerWidth={leftContainerWidth}
                                brokerHeaderInstance={brokerHeaderInstance}
                            />
                            : null}
                    </div>
                </div>
            )
        } catch (error) {
            logger.log(`Error while rendering Broker Header Component: ${error}`)
            return null
        }
    }

    componentDidMount() {
        this.setState({
            widgetWidth: this.brokerHeaderNode.clientWidth + this.padding,
            leftContainerWidth: this.leftBrokerHeaderNode.clientWidth,
            brokerHeaderInstance: this.brokerHeaderNode
        })
    }

    componentWillReceiveProps(nextProps) {
        this.timeoutShareHistoryID && clearTimeout(this.timeoutShareHistoryID)
        this.timeoutShareHistoryID = setTimeout(() => {
            if (nextProps && nextProps.symbolObj) {
                this.setState({ symbolObj: nextProps.symbolObj }, () => {
                    this.setState({
                        widgetWidth: this.brokerHeaderNode.clientWidth + this.padding,
                        leftContainerWidth: this.leftBrokerHeaderNode.clientWidth
                    })
                })
            }
            if (nextProps && nextProps.brokerForm === 'BrokerShareHistory') {
                this.setState({
                    widgetWidth: this.brokerHeaderNode.clientWidth + this.padding,
                    leftContainerWidth: this.leftBrokerHeaderNode.clientWidth
                })
            }
        }, 100);
    }
}

export default BrokerHeader
