import React from 'react';
class String extends React.Component {
    constructor(props) {
        super(props);
        this.input = null;
        this.state = {
            value: props.value || '',
            maxLength: 1000
        }
    }

    componentWillReceiveProps(nextProps) {
        this.input && (this.input.value = nextProps.value || '');
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

    getMaxLength = () => {
        let max = 1000
        if (this.props.schema.rules && this.props.schema.rules.between) {
            let strBtw = (this.props.schema.rules.between + '')
            if (typeof this.props.schema.rules.between === 'function') strBtw = this.props.schema.rules.between(this.props.data)
            const n = strBtw.split(',');
            max = n[1]
        } else if (this.props.schema.rules && this.props.schema.rules.max) {
            max = this.props.schema.rules.max
        }
        return max
    }

    render() {
        const maxLength = this.getMaxLength();
        if (this.props.schema.disable) {
            return (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: '24px',
                    border: '1px solid var(--border)',
                    paddingRight: '8px',
                    cursor: 'not-allowed',
                    boxSizing: 'border-box'
                }}>{this.props.value}</div>
            )
        }
        if (!this.props.editable) {
            return (
                <div style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <div className={`box-overflow`}>
                        <div style={{ paddingLeft: 0, paddingRight: 0 }} className={`showTitle text-overflow`}>{this.props.value || '--'}</div>
                    </div>
                </div >
            )
        }
        return <div>
            <input
                style={this.props.schema.alignLeft ? { textAlign: 'left' } : null}
                autoComplete='off'
                spellCheck={false}
                ref={dom => {
                    this.input = dom;
                    this.props.setDom(dom)
                }}
                type='text'
                onChange={e => {
                    this.setState({ value: e.target.value });
                    this.props.onChange(this.props.schema.lowerCase ? e.target.value.toLowerCase() : e.target.value)
                }}
                // maxLength={this.props.schema.rules && this.props.schema.rules.max ? this.props.schema.rules.max : 1000}
                maxLength={maxLength}
                onKeyPress={this.handleKeyPress.bind(this)}
                onFocus={() => this.props.onFocus()}
                onBlur={() => this.props.onBlur()}
                defaultValue={this.props.value}
                name={this.props.name} />
        </div>
    }
}
export default String;
