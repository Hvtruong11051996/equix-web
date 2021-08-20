import React from 'react';
import Icon from '../Icon'
import logger from '../../../helper/log';
import Lang from '../Lang';

class Toggle extends React.Component {
  tiltleClick = () => {
    if (this.dom) {
      if (this.dom.classList.contains('hide')) this.dom.classList.remove('hide')
      else this.dom.classList.add('hide')
    }
  }
  render() {
    try {
      return <div className={`${this.props.className || ''} toggle size--4 showTitle text-capitalize`} ref={dom => this.dom = dom} onClick={this.tiltleClick}>
        <span className='collapse'><Icon src='hardware/keyboard-arrow-down'></Icon></span>
        <span className='expand'><Icon src='hardware/keyboard-arrow-right'></Icon></span>
        <Lang>{this.props.nameToggle}</Lang>
      </div>
    } catch (error) {
      logger.error('Toggle: ' + error)
      return null;
    }
  }
}
export default Toggle;
