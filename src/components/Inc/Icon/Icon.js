import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import logger from '../../../helper/log';
import dataStorage from '../../../dataStorage';
import { checkPropsStateShouldUpdate } from '../../../helper/functionUtils';
class Icon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      className: props.className || '',
      color: props.color || 'var(--secondary-default)',
      hoverColor: props.hoverColor || 'var(--hover-default)',
      src: props.src || 'action/help',
      style: this.props.style || {},
      id: props.id || ''
    };
    if (typeof props.setColor === 'function') {
      props.setColor(this.setColor.bind(this));
    }
    this.state.style.height = this.state.style.height || '20px';
    this.state.style.width = this.state.style.width || '20px';
  }

  setColor(color) {
    try {
      this.setState({ color: color });
    } catch (error) {
      logger.error('setColor On Icon' + error)
    }
  }

  checkChange(a, b) {
    try {
      return a && a !== b;
    } catch (error) {
      logger.error('checkChange On Icon' + error)
    }
  }

  componentWillReceiveProps(nextProps) {
    try {
      if (this.checkChange(nextProps.className, this.state.className)) {
        this.setState({ className: nextProps.className });
      }
      if (this.checkChange(nextProps.src, this.state.src)) {
        this.setState({ src: nextProps.src })
      }
      if (this.checkChange(nextProps.color, this.state.color)) {
        this.setState({ color: nextProps.color })
      }
      if (this.checkChange(nextProps.hoverColor, this.state.hoverColor)) {
        this.setState({ hoverColor: nextProps.hoverColor })
      }
      if (this.checkChange(nextProps.style, this.state.style)) {
        this.setState({ style: nextProps.style })
      }
    } catch (error) {
      logger.error('componentWillReceiveProps On Icon' + error)
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    try {
      if (dataStorage.checkUpdate) {
        return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
      }
      return true;
    } catch (error) {
      logger.error('shouldComponentUpdate On Icon', error)
    }
  }
  render() {
    try {
      const Icon = require('material-ui/svg-icons/' + this.state.src).default;
      return <MuiThemeProvider><Icon
        onClick={this.props.onClick || null}
        className={this.state.className}
        id={this.state.id}
        color={this.state.color}
        hoverColor={this.state.hoverColor}
        style={this.state.style} /></MuiThemeProvider>
    } catch (error) {
      logger.error('render On Icon' + error)
    }
  }
}

export default Icon;
