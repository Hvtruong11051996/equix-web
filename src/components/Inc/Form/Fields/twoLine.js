import React from 'react';
class String extends React.Component {
    constructor(props) {
        super(props);
        this.input = null;
        this.state = {
            value: props.value || ''
        }
    }

    componentWillReceiveProps(nextProps) {
        this.input && (this.input.value = nextProps.value);
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

    render() {
        return (
            <div style={{ paddingLeft: 0, paddingRight: 0 }}>
                <div style={{ paddingTop: '5px', paddingBottom: '5px' }} className={`box-overflow`}>
                    <div style={{ paddingLeft: 0, paddingRight: 0, height: '27px', lineHeight: '27px' }} className={`showTitle text-overflow`}>{(this.props.value && this.props.value.line1) || '--'}</div>
                    <div style={{ paddingLeft: 0, paddingRight: 0, height: '27px', lineHeight: '27px' }} className={`showTitle text-overflow`}>{(this.props.value && this.props.value.line2) || '--'}</div>
                </div>
            </div >
        )
    }
}
export default String;
