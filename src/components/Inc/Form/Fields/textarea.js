import React from 'react';
class Textarea extends React.Component {
    constructor(props) {
        super(props);
        this.input = null;
        this.state = {
            value: props.value || ''
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
            console.error('handleKeyPress On Textarea field' + error)
        }
    }

    render() {
        if (!this.props.editable) {
            return (
                <div style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <div className={`box-overflow size--3`}>
                        <div style={{ paddingLeft: 0, paddingRight: 0 }} className={`text-overflow showTitle`}>{this.props.value || '--'}</div>
                    </div>
                </div >
            )
        }
        return <div>
            <textarea
                style={this.props.schema.alignLeft ? { textAlign: 'left' } : null}
                className={`size--3`}
                rows={3}
                autoComplete='off'
                ref={dom => {
                    this.input = dom;
                    this.props.setDom(dom)
                }}
                onChange={e => {
                    this.setState({ value: e.target.value });
                    this.props.onChange(e.target.value)
                }}
                maxLength={this.props.schema.rules && this.props.schema.rules.max ? this.props.schema.rules.max + 1 : 1000}
                onKeyPress={this.handleKeyPress.bind(this)}
                onFocus={() => this.props.onFocus()}
                onBlur={() => this.props.onBlur()}
                defaultValue={this.props.schema.value}
                name={this.props.name} />
        </div>
    }
}
export default Textarea;
