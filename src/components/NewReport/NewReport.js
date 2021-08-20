import React from 'react';
import Pdf from '../Inc/Pdf/NewPdf';
import Lang from '../Inc/Lang'
import logger from '../../helper/log';
import { getPdf } from '../../helper/functionUtils'
import { addEventListener, EVENTNAME } from '../../helper/event'
export class FinancialTransaction extends React.Component {
    constructor(props) {
        super(props);
        this.needToRefresh = false;
        this.state = {
            isLoading: false,
            url: props.url,
            data: null
        }
    }

    componentDidMount() {
        addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
        addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
        this.getData();
    }

    refreshData = () => {
        this.getData()
    }

    componentWillUnmount() {
        addEventListener(EVENTNAME.clickToRefresh, this.refreshData)
        addEventListener(EVENTNAME.connectionChanged, this.connectionChanged)
    };

    componentWillReceiveProps(nextProps) {
        try {
            if (nextProps.url === this.state.url) return
            this.setState({
                url: nextProps.url
            }, () => this.getData())
        } catch (error) {
            logger.error('componentWillReceiveProps On Financial transactions' + error)
        }
    }

    connectionChanged = (isConnected) => {
        if (isConnected && this.needToRefresh) {
            this.needToRefresh = false
            this.refreshData()
        }
    }

    getData() {
        if (!this.state.url) return
        this.props.loading(true)
        this.setState({ isLoading: true })
        getPdf(this.state.url, pdfUrl => {
            this.props.loading(false);
            this.setState({
                data: {
                    link: pdfUrl
                }
            }, () => {
                setTimeout(() => {
                    this.setState({
                        isLoading: false
                    })
                }, 500)
            })
        })
    }

    goBack() {
        this.setState({ data: null })
    }

    render() {
        const { data, isLoading, url } = this.state;
        const spiner = <img className='icon' style={{ filter: 'brightness(0) invert(1)' }} src='common/Spinner-white.svg' />
        return (
            <div className='reportContentContainer text-capitalize'>
                {
                    data ? (isLoading ? spiner : <Pdf url={url} data={this.state.data} back={() => this.goBack()} noBack={true} />)
                        : (isLoading ? spiner : <Lang>lang_no_data</Lang>)
                }
            </div>
        );
    }
}

export default FinancialTransaction
