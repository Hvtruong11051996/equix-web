import React from 'react';
import logger from '../../../helper/log';
class Delay extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: false };
  }

  render() {
    try {
      if (!this.state.show) {
 setTimeout(() => {
          this.setState({ show: true });
        }, this.props.time || 10);
}
      if (this.state.show) return this.props.children;
      return null;
    } catch (error) {
      logger.error('render On Delay' + error)
    }
  }
}

export default Delay;
