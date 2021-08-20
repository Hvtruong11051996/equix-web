import React from 'react';
import Icon from '../Inc/Icon';
import Color from '../../constants/color'
class ItemSuggest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            item: props.item,
            exist: props.exist
        }
    }

    componentWillReceiveProps(nextProps) {
        try {
            if (nextProps.item) {
                this.setState({
                    item: nextProps.item,
                    exist: nextProps.exist
                })
            }
        } catch (error) {
            logger.error('componentWillReceiveProps On SearchBox' + error)
        }
    }

    handleOnClickSearch() {
        try {
            this.setState({ exist: true })
            this.props.clickItemSuggest(this.state.item)
        } catch (error) {
            logger.error('handleOnClickSearch On SearchBox' + error)
        }
    }

    render() {
        try {
            return (
                <div id={`itemSuggest_${this.props.id}_${this.props.keyItem}`} className={`itemSuggest searchAllAccounts ${this.props.isCode ? '' : 'showTitle'}`} key={this.props.keyItem} onClick={this.handleOnClickSearch.bind(this)}>
                    <div>
                        {`${this.state.item[this.props.displayField]}`}
                    </div>
                </div>
            )
        } catch (error) {
            logger.error('render On SearchBox' + error)
        }
    }
}

export default ItemSuggest
