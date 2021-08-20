import React from 'react';
import SvgIcon, { path } from '../../SvgIcon'
import s from '../Form.module.css'

class String extends React.Component {
    constructor(props) {
        super(props);
        this.input = null;
        this.state = {
            value: props.value || '',
            showPass: false
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

    render() {
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
        return <div style={{ position: 'relative' }}>
            <input
                autoComplete='new-password'
                spellCheck={false}
                ref={dom => {
                    this.input = dom;
                    this.props.setDom(dom)
                }}
                type={this.state.showPass ? 'text' : 'password'}
                onChange={e => {
                    this.setState({ value: e.target.value });
                    this.props.onChange(this.props.schema.lowerCase ? e.target.value.toLowerCase() : e.target.value)
                }}
                style={{ paddingRight: 24 }}
                maxLength={this.props.schema.rules && this.props.schema.rules.max ? this.props.schema.rules.max : 1000}
                onKeyPress={this.handleKeyPress.bind(this)}
                onFocus={() => this.props.onFocus()}
                onBlur={() => this.props.onBlur()}
                defaultValue={this.props.value}
                name={this.props.name} />
            <SvgIcon className={s.password} path={this.state.showPass ? path.mdiEyeOff : path.mdiEye} onClick={() => this.setState(prevState => ({ showPass: !prevState.showPass }))} />
        </div>
    }
}
export default String;
