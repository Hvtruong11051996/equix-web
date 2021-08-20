// CheckboxWithLabel.js

import React from 'react';
import logger from '../helper/log'

export default class CheckboxWithLabel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isChecked: false };

        // bind manually because React class components don't auto-bind
        // http://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html#autobinding
        this.onChange = this.onChange.bind(this);
    }
    handleClick() {
        logger.log('AAHHH');
        return this.state.isChecked;
    }
    onChange() {
        this.setState({ isChecked: !this.state.isChecked });
    }
    /* istanbul ignore next */
    render() {
        return (
            <div>
                <input
                    type="checkbox"
                    checked={this.state.isChecked}
                    onChange={this.onChange}
                />
                {this.state.isChecked ? this.props.labelOn : this.props.labelOff}
            </div>
        );
    }
}
