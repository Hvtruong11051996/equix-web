import React from 'react';
import logger from '../../../helper/log';
import { translate } from 'react-i18next';
import Lang from '../Lang';
import Button from '../../Elements/Button';

class FilterBox extends React.Component {
    constructor(props) {
        super(props)
        this.setValue = this.setValue.bind(this)
        this.props.registerFn && this.props.registerFn(this.setValue)
    }

    setValue(value) {
        this.dom.value = value
    }

    handleOnKeyPress = (event) => {
        if (event.key === 'Enter' && typeof this.props.onChange === 'function') {
            this.handleOnChange();
        }
    }

    handleOnChange = () => {
        try {
            if (this.props.disabled || !this.dom || typeof this.props.onChange !== 'function') return;
            if (this.props.skipDelay) {
                this.props.onChange(this.dom.value);
                return;
            }
            this.setTimeOutID && clearTimeout(this.setTimeOutID)
            this.setTimeOutID = setTimeout(() => {
                this.props.onChange(this.dom.value);
            }, 300)
        } catch (error) {
            logger.error('handleKeyPress On FilterBox' + error)
        }
    }

    render() {
        try {
            return (
                <div className={`${this.props.className} inputAddon size--3 ${this.props.isDisable ? 'disable opacityDisable' : ''}`}
                    style={this.props.style || {}}>
                    <input
                        ref={dom => this.dom = dom}
                        className='input-filter size--3'
                        type='text'
                        defaultValue={this.props.value || ''}
                        onChange={this.handleOnChange.bind(this)}
                        onKeyPress={this.handleOnKeyPress.bind(this)}
                        required
                        disabled={this.props.disabled}
                    />
                    <div className='placeHolder text-capitalize'><Lang>{this.props.placeholder || 'lang_quick_filter'}</Lang></div>
                    <Button className='button' mini={true} onClick={this.handleOnChange.bind(this)}><span className='text-capitalize'><Lang>lang_go</Lang></span></Button>
                </div>
            )
        } catch (error) {
            logger.error('render On FilterBox' + error)
        }
    }
}

export default (translate('translations')(FilterBox));
