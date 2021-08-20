import React from 'react';
class NoTag extends React.Component {
  render() {
    try {
      return this.props.children;
    } catch (error) {
      logger.error('NoTag: ' + error)
    }
  }
}
export default NoTag;
