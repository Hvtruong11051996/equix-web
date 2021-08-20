/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import { checkPropsStateShouldUpdate } from '../../../helper/functionUtils';
import dataStorage from '../../../dataStorage';
import logger from '../../../helper/log';
import Lang from '../Lang'

class ItemHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: this.props.columns || []
            // resizeType: props.resizeType
        };
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.columns) {
            this.setState({
                columns: nextProps.columns
                // resizeType: nextProps.resizeType
            });
        }
    }

    componentDidMount() {

    }
    componentWillUnmount() {

    }
    getOptionGrid(name) {
        return this.options[name];
    }
    customStyle(item, index) {
        let style = {};

        if (item && item.width) {
            style.minWidth = item.width
        }
        if (item && item.widthByPercent) {
            style.width = item.widthByPercent
        }
        if (item && item.textAlign) {
            style.textAlign = item.textAlign
        }
        return style
    }

    initHeader() {
        try {
            const columnsDef = this.state.columns;
            const result = columnsDef.map((item, index) => {
                return (
                    <div key={index} className='headerCell' style={this.customStyle(item, index)} >
                        <div className='mainCellTxt size--2'><Lang>{item.headerName || '--'}</Lang></div>
                    </div>
                )
            })
            return result
        } catch (error) {
            logger.error('shouldComponentUpdate On ItemHeader', error)
        }
    }
    renderCellHeader() {

    }
    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (dataStorage.checkUpdate) {
                const check = checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
                return check;
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On ItemHeader', error)
        }
    }
    render() {
        return (
            <div className='itemRowHeader' ref={domFiv => this.domDiv = domFiv} >
                {this.initHeader()}
            </div>
        )
    }
}

export default ItemHeader;
