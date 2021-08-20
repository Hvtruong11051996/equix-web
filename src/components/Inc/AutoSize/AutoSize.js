import React from 'react';
import logger from '../../../helper/log';
import dataStorage from '../../../dataStorage';
import { checkPropsStateShouldUpdate } from '../../../helper/functionUtils';
class AutoSize extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  resize(e) {
    try {
      if (!e) return;
      if (!e.style.fontSize && !this.props.className) e.style.fontSize = '10px';
      while (e.scrollWidth > e.offsetWidth) {
        e.style.fontSize = `${Number(e.style.fontSize.slice(0, -2)) - 1}px`;
      }
    } catch (error) {
      logger.error('resize On AutoSize' + error)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    try {
      if (dataStorage.checkUpdate) {
        const check = checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
        return check;
      }
      return true;
    } catch (error) {
      logger.error('shouldComponentUpdate On AutoSize', error)
    }
  }

  render() {
    try {
      return (
        <span ref={this.resize.bind(this)} className={this.props.className}>
          {this.props.children}
        </span>
      );
    } catch (error) {
      logger.error('render On AutoSize' + error)
    }
  }
}

export default AutoSize;
