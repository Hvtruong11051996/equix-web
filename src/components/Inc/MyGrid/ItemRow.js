/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Icon from '../Icon';
import { formatNumberPrice, checkPropsStateShouldUpdate } from '../../../helper/functionUtils';
import dataStorage from '../../../dataStorage';
import logger from '../../../helper/log';

class ItemRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: this.props.columns || [],
            rowData: this.props.rowData,
            expand: this.props.expand || false,
            objTotal: props.objTotal,
            renderItem: null,
            expandState: props.expandState,
            idExpand: props.idExpand,
            isExpand: false,
            idRow: props.idRow
        };
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.columns) {
            this.setState({
                columns: nextProps.columns,
                rowData: nextProps.rowData,
                expand: nextProps.expand,
                expandState: nextProps.expandState,
                resizeType: nextProps.resizeType,
                idExpand: nextProps.idExpand,
                objTotal: nextProps.objTotal,
                idRow: nextProps.idRow
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
    customStyle(item, index, valueFormat) {
        try {
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
            if (!valueFormat) style.visibility = 'hidden'
            return style
        } catch (error) {
            logger.error('customStyle On ItemRow', error)
        }
    }
    renderLayout(item) {
        if (item.field !== 'price') return ''
        if (this.props.left) {
            return 'priceUp'
        } else {
            return 'priceDown'
        }
    }
    initRow() {
        try {
            const columnsDef = this.state.columns;
            const dataRow = this.state.rowData;
            let i = this.props.left ? 0 : 3;
            const end = this.props.left ? 3 : 6;
            const result = []
            for (; i < end; i++) {
                const item = columnsDef[i]
                const fillNumber = item.field === 'price'
                const valueFormat = formatNumberPrice(dataRow[item.field], fillNumber) || '--'
                result.push(
                    <div key={i} className={`showTitle rowCell ${this.renderLayout(item)}`} style={this.customStyle(item, i, dataRow[item.field])}>
                        <div className='mainCellTxt size--3'>{item.field ? valueFormat : null}</div>
                    </div>
                )
            }
            return result;
        } catch (error) {
            logger.error('initRow On ItemRow', error)
        }
    }

    fillChart(item, type) {
        try {
            const objTotal = this.state.objTotal;
            const totalVol = objTotal.totalVol || 0;
            if (item.quantity && item.quantity !== '--') {
                const perCentAsk = (item.quantity / totalVol) * 100;
                return { width: perCentAsk + '%' }
            }
            return { display: 'none' }
        } catch (error) {
            logger.error('fillChart On ItemRow', error)
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (dataStorage.checkUpdate) {
                const check = checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
                return check;
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On ItemRow', error)
        }
    }
    render() {
        const dataRow = this.state.rowData;
        const objTotal = this.state.objTotal;
        return (
            <div className='itemRowMyGrid' ref={domFiv => this.domDiv = domFiv} >
                {this.initRow()}
                {objTotal && this.props.left ? <div className='chartColorLeft'><div className='studiesLeft' style={this.fillChart(dataRow, 'chart')}></div></div> : null}
                {objTotal && !this.props.left ? <div className='chartColorRight'><div className='studiesRight' style={this.fillChart(dataRow, 'chart')}></div></div> : null}
            </div>
        )
    }
}

export default ItemRow;
