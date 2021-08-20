import React from 'react';
import Icon from '../Icon'
import logger from '../../../helper/log';
import Lang from '../Lang';

class ToggleLine extends React.Component {
    constructor(props) {
        super(props);
        this.collapse = this.props.collapse
    }
    render() {
        try {
            return (
                <div className={`line ${this.collapse ? 'collapse' : 'expand'}`}>
                    <span className='iconToggle' onClick={() => {
                        this.collapse = !this.collapse
                        this.props.collapseFunc && this.props.collapseFunc(this.collapse)
                        this.forceUpdate()
                    }}>
                        <Icon src={`${this.collapse ? 'navigation/arrow-drop-down' : 'navigation/arrow-drop-up'}`}></Icon>
                    </span>
                </div>
            )
        } catch (error) {
            logger.error('ToggleLine: ' + error)
            return null;
        }
    }
}
export default ToggleLine;
