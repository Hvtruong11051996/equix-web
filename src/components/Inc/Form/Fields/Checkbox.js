import React from 'react';
class Checkbox extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.active = this.props.value
    }
    onChange() {
        this.active = !this.active;
        this.forceUpdate();
    }
    render() {
        return (
            <div
                onClick={() => this.onChange()}
            >
                {
                    this.active
                        ? 'Checked'
                        : 'UnChecked'
                }
            </div>
        );
    }
}
export default Checkbox;
