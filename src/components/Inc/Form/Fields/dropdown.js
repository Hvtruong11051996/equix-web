import React from 'react';
import DropDown from '../../../DropDown';
import Lang from '../../Lang/Lang';
import Icon from '../../../Inc/Icon'

class SchemaDropDown extends React.Component {
    constructor(props) {
        super(props);
        let defaultValue = props.schema.multiSelect && !Array.isArray(props.value) ? [props.value === undefined ? null : props.value] : props.value
        if (props.value === null || props.value === undefined) defaultValue = props.schema.defaultValue || (props.schema && props.schema.options && props.schema.options[0] && props.schema.options[0].value)
        this.state = {
            value: defaultValue
        }
        this.props.setListDataEmpty && this.props.setListDataEmpty([undefined, null]);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.name === 'api_access') console.log('======> nextProps')
        let defaultValue = nextProps.schema.multiSelect && !Array.isArray(nextProps.value) ? [nextProps.value === undefined ? null : nextProps.value] : nextProps.value
        if (defaultValue === null || defaultValue === undefined) defaultValue = this.props.schema.defaultValue || (this.props.schema && this.props.schema.options && this.props.schema.options[0] && this.props.schema.options[0].value)
        this.setState({
            value: defaultValue
        })
    }

    handleOnChangeAll = (data) => {
        this.props.schema.callback && this.props.schema.callback(this.props.data)
        this.props.onChange(data);
        this.setState({
            value: data
        })
    }
    mouseMove = (e) => {
        if (this.dom) {
            if (this.dom.contains(e.target)) {
                if (this.active) return;
                this.active = true;
                this.props.onFocus();
            } else {
                if (!this.active) return;
                delete this.active;
                this.props.onBlur();
            }
        }
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.mouseMove);
        this.props.onBlur();
    }
    componentDidMount() {
        document.addEventListener('mousemove', this.mouseMove);
        if (this.props.value != this.state.value && !this.props.noSetDefault && !this.props.schema.noSetDefault) this.props.onChange(this.state.value); //eslint-disable-line
    }

    render() {
        const allowTranslate = this.props.schema.translate !== null && this.props.schema.translate !== undefined ? this.props.schema.translate : true
        let opt = this.props.schema && this.props.schema.options && this.props.schema.options.filter(e => Array.isArray(this.state.value) ? this.state.value.includes(e.value) : e.value === this.state.value)
        if (opt.length > 1) opt.label = opt.map(e => e.label).join(', ').trim()
        else opt = opt[0] || {}
        if (!opt) opt = {}
        if (!this.props.editable) {
            return (
                <div className='box-overflow'>
                    <div className={`${(opt && opt.className) || 'text-capitalize'} text-overflow showTitle`} style={this.props.schema.noEditBox ? { border: '1px solid var(--border)', paddingRight: '8px' } : null}>{allowTranslate ? <Lang>{(opt && opt.label) || '--'}</Lang> : ((opt && opt.label) || '--')}</div>
                </div>
            )
        } else {
            if (this.props.schema.disable) {
                if (this.props.schema.notEdit) {
                    return <div
                        ref={dom => {
                            this.dom = dom
                            this.props.setDom(dom)
                        }}
                        className={(opt && opt.className) || 'text-capitalize'}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            height: '24px',
                            boxSizing: 'border-box'
                        }}>{allowTranslate ? <Lang>{opt.label || '--'}</Lang> : (opt.label || '--')}</div>
                }
                return <div
                    ref={dom => {
                        this.dom = dom
                        this.props.setDom(dom)
                    }}
                    className={(opt && opt.className) || 'text-capitalize'}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        height: '24px',
                        border: '1px solid var(--border)',
                        // paddingRight: '8px',
                        cursor: 'not-allowed',
                        boxSizing: 'border-box'
                    }}>{allowTranslate ? <Lang>{opt.label || '--'}</Lang> : (opt.label || '--')} <Icon src='navigation/arrow-drop-down' /></div>
            }
            return <div
                style={{ padding: 0 }}
                ref={dom => {
                    this.dom = dom
                    this.props.setDom(dom)
                }}
            >
                <DropDown
                    multiSelect={!!this.props.schema.multiSelect}
                    translate={allowTranslate}
                    onChange={this.handleOnChangeAll}
                    options={this.props.schema.options || []}
                    value={this.state.value}
                    textRight={this.props.schema.textRight !== false}
                    align={this.props.schema.align}
                    upperCase={this.props.schema.upperCase}
                />
            </div>
        }
    }
}
export default SchemaDropDown;
