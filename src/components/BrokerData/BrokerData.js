import React from 'react';
import StockShareAnalysis from '../StockShareAnalysis';
import BrokerActivityAnalysis from '../BrokerActivityAnalysis';
export class BrokerData extends React.Component {
    constructor(props) {
        super(props);
        this.initState = props.loadState()
        this.state = {
            isStockShareAnalysis: this.initState.isStockShareAnalysis,
            symbolObj: {},
            objValue: {}
        };
    }

    componentWillMount() { }
    componentDidMount() {
        this.state.isStockShareAnalysis ? this.props.setTitle({ text: 'StockShareAnalysis' }) : this.props.setTitle({ text: 'BrokerActivityAnalysis' });
    }
    changeWidget = (obj, isStockShare) => {
        if (obj.symbolObj || isStockShare) {
            this.setState({ symbolObj: obj.symbolObj, isStockShareAnalysis: 1, objValue: obj.objValue })
            this.props.setTitle({ text: 'StockShareAnalysis' });
        } else {
            this.setState({ isStockShareAnalysis: 0, objValue: obj.objValue })
            this.props.setTitle({ text: 'BrokerActivityAnalysis' });
        }
    }
    render() {
        try {
            return (
                this.state.isStockShareAnalysis
                    ? <StockShareAnalysis
                        {...this.props}
                        changeWidget={this.changeWidget}
                        symbolObj={this.state.symbolObj} objValue={this.state.objValue}
                    />
                    : <BrokerActivityAnalysis
                        {...this.props}
                        changeWidget={this.changeWidget}
                        objValue={this.state.objValue}
                    />
            )
        } catch (error) {
            console.log('BrokerData ', error)
        }
    }
}

export default BrokerData;
