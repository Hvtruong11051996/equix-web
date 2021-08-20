import React, { Component } from 'react';
import logger from '../../helper/log';
export default class DetailCellRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            json: JSON.stringify(props.data)
        }
    }

    render() {
        try {
            return (
                <div>
                    <div>{this.state.json}</div>
                    <div>{this.state.json}</div>
                </div>
            );
        } catch (error) {
            logger.error('render On DetailCellRenderer' + error)
        }
    }
}
