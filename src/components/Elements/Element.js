import React from 'react';

import Checkbox from './Checkbox';
import Radio from './Radio';
import Input from './Input';
import Button, { buttonType } from './Button';

export default class Address extends React.Component {
    render() {
        return <div>
            <div><Checkbox label='checkbox' /></div>
            <div><Checkbox label='checkbox disbled' disabled={true} /></div>
            <div><Radio label='radio1' name='radio' value='1' /><Radio label='radio1' name='radio' value='2' /></div>
            <div><Radio label='radio1 disabled' name='radio' value='1' disabled={true} /><Radio label='radio1 disabled' name='radio' value='2' disabled={true} /></div>
            <div><Input placeholder='input' /></div>
            <div><Button>button</Button><Button disabled={true}>disabled button</Button></div>
            <div><Button type={buttonType.info}>button info</Button><Button type={buttonType.info} disabled={true}>disabled button info</Button></div>
            <div><Button type={buttonType.success}>button success</Button><Button type={buttonType.success } disabled={true}>disabled button success</Button></div>
            <div><Button type={buttonType.danger}>button danger</Button><Button type={buttonType.danger } disabled={true}>disabled button danger</Button></div>
        </div>
    }
}
