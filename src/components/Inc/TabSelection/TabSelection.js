import React from 'react';
import dataStorage from '../../../dataStorage';
import logger from '../../../helper/log';
import { checkPropsStateShouldUpdate } from '../../../helper/functionUtils';
import { translate } from 'react-i18next';

class TabSeletion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            options: this.props.options,
            value: this.props.value
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            options: nextProps.options,
            value: nextProps.value
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (dataStorage.checkUpdate) {
                return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state)
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On TabSeletion', error)
        }
    }

    returnClassName(item) {
        if (this.state.value) {
            const value = this.state.value;
            if (value === item.value) {
                return 'tabChildSelection activeTab'
            } else {
                return 'tabChildSelection nonactiveTab'
            }
        } else {
            const value = this.state.options[0].value;
            if (value === item.value) {
                return 'tabChildSelection activeTab'
            } else {
                return 'tabChildSelection nonactiveTab'
            }
        }
    }

    mapOption() {
        try {
            const lstOpt = this.state.options || ['null'];
            const optRender = lstOpt.map((item, index) => {
                return (<div className={this.returnClassName(item)} onClick={() => this.props.onChange(item.value)} key={item.value + '' + item.index}>
                    {item.label}
                </div>)
            })
            return optRender
        } catch (error) {
            logger.error('mapOption On TabSeletion', error)
        }
    }

    render() {
        try {
            return <div className='tabSelectionRoot size--1'>
                {this.mapOption()}
            </div>
        } catch (error) {
            logger.error('render On TabSeletion' + error)
        }
    }
}

export default translate('translations')(TabSeletion);
