/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import ItemHeader from './ItemHeader';
import ItemRow from './ItemRow';
import Collapsible from 'react-collapsible';
import { checkPropsStateShouldUpdate } from '../../../helper/functionUtils';
import dataStorage from '../../../dataStorage';
import Lang from '../Lang'
import logger from '../../../helper/log';
import ExpandRightClick from '../../RightClickGolden/ExpandRightClick'
class WapperItem extends React.Component {
    constructor(props) {
        super(props)
        this.that = props.context;
        this.state = {
            objTotal: props.objTotal,
            dataRow: props.dataRow || [],
            resizeType: props.resizeType,
            columns: props.columns,
            expandState: null,
            idExpand: null
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.dataRow) {
            this.setState({
                dataRow: nextProps.dataRow,
                resizeType: nextProps.resizeType,
                columns: nextProps.columns,
                objTotal: nextProps.objTotal
            })
        }
    }
    colapseRow(idExpand) {
        this.props.clickCallBack(idExpand + 'row', false)
        this.setState({
            expandState: false,
            idExpand
        })
    }

    expandRow(idExpand) {
        this.props.clickCallBack(idExpand + 'row', true)
        this.setState({
            expandState: true,
            idExpand
        })
    }

    renderRow() {
        try {
            const ComponentExpand = this.props.ComponentExpand;
            const dataRow = this.state.dataRow || [];
            // ${index % 2 !== 0 ? 'even' : ''}
            const listRow = dataRow.map((item, index) => {
                if (!item) return null;
                return <div key={index + 'rowAllRoot'} className={`rowAllRoot size--2`}>
                    <div className={`rowRoot`}>  <ItemRow
                        left={this.props.left}
                        key={index} idRow={index} columns={this.state.columns}
                        objTotal={this.state.objTotal}
                        rowData={item}
                        resizeType={this.state.resizeType}
                        expandState={this.state.expandState}
                        idExpand={this.state.idExpand}
                    />

                    </div>
                </div>
            })
            return listRow;
        } catch (error) {
            logger.error('renderRow On WapperItem', error)
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
            logger.error('shouldComponentUpdate On WapperItem', error)
        }
    }
    handleContextMenu = (event) => {
        if (this.setEventValue) {
            this.setEventValue(event)
        }
    }
    componentWillUnmount() {
        if (this.props.left) {
            this.refRenderLeft.removeEventListener('contextmenu', this.handleContextMenu);
        } else {
            this.refRenderRight.removeEventListener('contextmenu', this.handleContextMenu);
        }
    }
    renderRightClick() {
        let layout = document.body.querySelector('.layout');
        let div = document.createElement('div');
        ReactDOM.render(<ExpandRightClick
            fn={fn => {
                this.setEventValue = fn.setEventValue
            }}
            newDataAuction={this.state.newDataAuction} symbolObj={this.state.symbolObj}
            nameWidget={this.props.left ? 'DepthLeft' : 'DepthRight'}
        />, div);
        layout.appendChild(div)
    }
    componentDidMount() {
        this.renderRightClick();
        if (this.props.left) {
            this.refRenderLeft.addEventListener('contextmenu', this.handleContextMenu);
        } else {
            this.refRenderRight.addEventListener('contextmenu', this.handleContextMenu);
        }
    }
    render() {
        return <div ref={ref => {
            this.refRender = ref
            this.props.left ? this.refRenderLeft = ref : this.refRenderRight = ref
        }} >
            {this.renderRow()}

        </div>
    }
}
class MyGrid extends React.Component {
    constructor(props) {
        super(props);
        this.options = this.props.options || {};
        this.state = {
            objTotal: props.objTotal || 1,
            rowData: this.props.rowData || {
                Bid: [],
                Ask: []
            },
            columns: this.props.columns || [],
            resise: props.resise || {},
            isNoData: false,
            currentExpand: ''
        };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.rowData && this.props.columns) {
            this.setState({
                rowData: nextProps.rowData,
                columns: nextProps.columns,
                resise: nextProps.resise,
                objTotal: nextProps.objTotal || 1
            });
        }
    }

    getOptionGrid(name) {
        return this.options[name];
    }

    renderHeader() {
        return <ItemHeader columns={this.state.columns} />
    }
    renderRow(left) {
        const data = left ? this.state.rowData.Bid : this.state.rowData.Ask
        return <WapperItem left={left} objTotal={this.state.objTotal} clickCallBack={this.getOptionGrid('onRowClicked')} columns={this.state.columns} dataRow={data} ComponentExpand={this.props.ComponentExpand}></WapperItem>
    }
    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (dataStorage.checkUpdate) {
                const check = checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
                return check;
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On MyGrid', error)
        }
    }
    render() {
        try {
            return (
                (this.state.rowData && this.state.rowData.Ask && !this.state.rowData.Ask.length && this.state.rowData.Bid && !this.state.rowData.Bid.length)
                    ? <div className='MyGridRoot' >
                        <div className='headerContent' >{this.renderHeader()}</div>
                        <div className='center'><Lang>lang_no_data</Lang></div>
                    </div>
                    : <div className='MyGridRoot'>
                        <div className='headerContent' >{this.renderHeader()}</div>
                        <div style={{ flex: 1, overflow: 'auto' }}>  <div className='rowContent'><div style={{ overflow: 'hidden' }}>
                            <div>{this.renderRow(true)}</div>
                            <div>{this.renderRow()}</div>
                        </div></div></div>
                    </div>

            )
        } catch (error) {
            logger.error('render On MyGrid', error)
        }
    }
}
export default MyGrid;
