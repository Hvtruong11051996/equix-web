import React from 'react';
import SearchAccount from '../../../SearchAccount/SearchLocal';
import s from '../Form.module.css'
class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayValue: this.getDisplayValue(props)
        }
    }

    getDisplayValue(props) {
        if (!props.value || !props.schema.dataSource || props.schema.dataSource.length === 0) return ''
        const item = props.schema.dataSource.find(e => e[props.schema.fieldSearch] === props.value)
        if (item) return item[props.schema.displayField]
        else return ''
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            displayValue: this.getDisplayValue(nextProps)
        })
    }

    handleKeyPress = (event) => {
        try {
            if (event.key === 'Enter') {
                this.props.onKeyPress && this.props.onKeyPress()
            }
        } catch (error) {
            console.error('handleKeyPress On String field' + error)
        }
    }

    dataReceivedFromSearchAccount(item = {}) {
        const value = item[this.props.schema.fieldSearch] || ''
        this.props.onChange && this.props.onChange(value)
    }

    render() {
        return <div className={s.searchLocal}
            ref={dom => {
                this.props.setDom(dom)
            }}>
            <SearchAccount
                displayValue={this.state.displayValue}
                dataSource={this.props.schema.dataSource}
                fieldSearch={this.props.schema.fieldSearch}
                displayField={this.props.schema.displayField}
                placeHolder={this.props.schema.placeHolder}
                dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount.bind(this)}
            />
        </div>
    }
}
export default Search;
