import React, { Component } from 'react';
import Lang from '../Inc/Lang';

export class CustomTitleField extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        const { title, required } = this.props;
        return (
            <div className='ABCDEF'>
                <label><Lang>{title}</Lang>{`${required ? '*' : ''}`}</label>
            </div>
        );
    }
}

export default CustomTitleField;
