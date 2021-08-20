import DropDown from '../../../DropDown';
import Lang from '../../Lang';
import { getData, getEmailTempUrl } from '../../../../helper/request';
import logger from '../../../../helper/log';
import React from 'react';
export default class EmailTemplate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listDropDown: []
        }
        this.getEmailTemplateList = this.getEmailTemplateList.bind(this);
        this.realtimeData = this.realtimeData.bind(this);
    }

    handleOnChangeAll(selected) {
        this.props.onChange(selected);
    }

    render() {
        try {
            let textDisplay;
            this.state.listDropDown && this.state.listDropDown.map(item => {
                if (item.value === this.props.value) textDisplay = item.label;
            })
            if (!this.props.editable) {
                return (
                    <div className='box-overflow'>
                        <div className='text-overflow showTitle' ><Lang>{textDisplay || '--'}</Lang></div>
                    </div>
                )
            }
            return (
                <div style={{ padding: 0 }} title={textDisplay || ''}>
                    <DropDown
                        translate={false}
                        ref={dom => this.props.setDom(dom)}
                        onChange={this.handleOnChangeAll.bind(this)}
                        options={this.state.listDropDown}
                        value={this.props.value}
                        textRight={true}
                        align='right'
                    />
                </div>
            )
        } catch (error) {
            logger.log('error render usergroup', error)
        }
    }
    getEmailTemplateList() {
        const url = getEmailTempUrl();
        if (url) {
            getData(url).then(resolve => {
                if (resolve && resolve.data) {
                    const listDropDown = resolve.data;
                    const staging = []
                    listDropDown.map(item => {
                        if (item.id && item.name) {
                            staging.push({ value: item.id, label: item.name })
                        }
                    })
                    this.setState({
                        listDropDown: staging
                    })
                }
            }).catch(e => logger.log('error get List user Group', e))
        }
    }
    realtimeData(data) {
        try {
        } catch (error) {
            logger.log('error realtime usergroup', error)
        }
    }
    componentDidMount() {
        this.getEmailTemplateList();
    }
}
