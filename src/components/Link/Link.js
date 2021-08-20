import React from 'react';
import PropTypes from 'prop-types';
import history from '../../history';
import logger from '../../helper/log';

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

class Link extends React.Component {
  static propTypes = {
    to: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func
  };

  static defaultProps = {
    onClick: null
  };

  handleClick = event => {
    try {
      if (this.props.onClick) {
        this.props.onClick(event);
      }

      if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
        return;
      }

      if (event.defaultPrevented === true) {
        return;
      }

      event.preventDefault();
      history.push(this.props.to);
    } catch (error) {
      logger.error('handleClick On Link' + error)
    }
  };

  render() {
    try {
      const { to, children, ...props } = this.props;
      return (
        <a href={to} {...props} onClick={this.handleClick}>
          {children}
        </a>
      );
    } catch (error) {
      logger.error('render On Link' + error)
    }
  }
}

export default Link;
