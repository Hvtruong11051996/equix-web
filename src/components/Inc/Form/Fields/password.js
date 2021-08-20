import React from 'react';
import Lang from './../../../Inc/Lang';
import Checkbox from 'material-ui/Checkbox';
import dataStorage from '../../../../dataStorage';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import logger from '../../../../helper/log';
import SvgIcon, { path } from '../../SvgIcon'
import s from '../Form.module.css'
import Button, { buttonType } from '../../../Elements/Button';

class Password extends React.Component {
    constructor(props) {
        super(props)
        this.input = null
        this.state = {
        }
    }

    componentWillReceiveProps(nextProps) {
        this.input && (this.input.value = nextProps.value)
    }

    autogenPass() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890'
        const charsUpper = 'ABCDEFGHIJKLMNOP';
        const number = '1234567890';
        let pass = '';
        pass += charsUpper.charAt(Math.floor(Math.random() * charsUpper.length))
        pass += number.charAt(Math.floor(Math.random() * number.length))
        for (let x = 0; x < 7; x++) {
            const i = Math.floor(Math.random() * chars.length);
            pass += chars.charAt(i);
        }
        this.input && (this.input.value = pass);
        this.props.onChange(pass)
    }

    handleKeyPress = (event) => {
        try {
            if (event.key === 'Enter') {
                this.props.onKeyPress && this.props.onKeyPress()
            }
        } catch (error) {
            logger.error('handleKeyPress On Password field' + error)
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
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'row' }}>
                <SvgIcon className={s.password} style={{ left: '8px', right: 'unset' }} path={this.state.showPass ? path.mdiEyeOff : path.mdiEye} onClick={() => this.setState(prevState => ({ showPass: !prevState.showPass }))} />
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
                    // style={{ paddingRight: 24 }}
                    maxLength={this.props.schema.rules && this.props.schema.rules.max ? this.props.schema.rules.max : 1000}
                    onKeyPress={this.handleKeyPress.bind(this)}
                    onFocus={() => this.props.onFocus()}
                    onBlur={() => this.props.onBlur()}
                    defaultValue={this.props.value}
                    name={this.props.name} />
                <Button type={buttonType.ascend} className='showTitle text-uppercase' onClick={() => this.autogenPass()} style={{ marginLeft: '8px' }}><Lang>{this.props.schema.btnText}</Lang></Button>
            </div>
            {this.props.schema.noBox ? null
                : <MuiThemeProvider>
                    <div className='qe-create-user-passwordCol' style={{ flexDirection: 'column', paddingTop: '4px' }}>
                        <div className='showTitle'>
                            <Checkbox
                                style={{ zIndex: 1 }}
                                inputStyle={{ width: 210 }}
                                id={'sendPasswordToEmail'}
                                iconStyle={{ width: 20, height: 20, marginRight: 32 }}
                                labelStyle={{ color: '#ffffff', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
                                uncheckedIcon={<img src={dataStorage.hrefImg + '/outline-check_box_outline_blank.svg'} />}
                                checkedIcon={<img src={dataStorage.hrefImg + '/checkbox-marked-outline.svg'} />}
                                label={dataStorage.translate('lang_send_password_to_email')}
                            />
                        </div>
                        <div className='showTitle'>
                            <Checkbox
                                disabled={true}
                                checked={true}
                                style={{ zIndex: 1, opacity: 0.54 }}
                                inputStyle={{ width: 250 }}
                                id={'requiredPasswordChange'}
                                iconStyle={{ width: 20, height: 20, marginRight: 32 }}
                                labelStyle={{ color: '#ffffff', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
                                uncheckedIcon={<img src={dataStorage.hrefImg + '/outline-check_box_outline_blank.svg'} />}
                                checkedIcon={<img src={dataStorage.hrefImg + '/checkbox-marked-outline.svg'} />}
                                label={dataStorage.translate('lang_require_password_change_on_next_sign_in')}
                            />
                        </div>
                    </div>
                </MuiThemeProvider>
            }
        </div>
    }
}
export default Password
