import React from 'react';
import Icon from '../Inc/Icon';
import logger from '../../helper/log';
import Flag from '../Inc/Flag';
import ItemSuggest from './ItemSuggest';
import SymbolClass from '../../constants/symbol_class';

class ListSuggest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listSearch: props.listSearch,
            isChildren: props.isChildren,
            textSearch: props.textSearch,
            lstExisted: props.lstExisted

        }
    }

    componentWillReceiveProps(nextProps) {
        try {
            this.setState({
                listSearch: nextProps.listSearch,
                isChildren: nextProps.isChildren,
                lstExisted: nextProps.lstExisted,
                textSearch: nextProps.textSearch
            })
        } catch (error) {
            logger.error('componentWillReceiveProps On ListSuggest' + error)
        }
    }

    render() {
        try {
            const { listSearch, textSearch, isChildren, lstExisted } = this.state;
            return (
                listSearch.map((item, index) => {
                    const isParent = item.class === SymbolClass.FUTURE && !item.master_code && !item.has_child;
                    return <ItemSuggest
                        contingentOrder={this.props.contingentOrder}
                        checkNewOrder={this.props.checkNewOrder}
                        updateAll={this.props.updateAll}
                        count={this.props.count}
                        callback={this.props.callback}
                        collapseCb={this.props.collapseCb}
                        lstExisted={lstExisted}
                        isParent={isParent}
                        isAddcode={this.props.isAddcode}
                        setCollapseIndex={index => this.setState({ active: index })}
                        active={this.state.active}
                        textSearch={textSearch}
                        isChildren={isChildren}
                        index={index}
                        key={index}
                        keyItem={item.symbol}
                        id={this.props.id}
                        clickItemSuggest={this.props.clickItemSuggest}
                        item={item} />
                })
            );
        } catch (error) {
            logger.error('render On SearchBox' + error)
        }
    }
}

export default ListSuggest
