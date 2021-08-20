import React from 'react';
import logger from '../../../helper/log';

class CurrentTime extends React.Component {
  constructor(props) {
    super(props);
    this.state = { curTime: new Date().toTimeString().split(' ')[0] };
  }

  render() {
    try {
      return this.state.curTime;
    } catch (error) {
      logger.error('render On CurrentTime' + error)
    }
  }

  componentDidMount() {
    try {
      setInterval(() => {
        this.setState({
          curTime: new Date().toTimeString().split(' ')[0]
        })
      }, 1000)
    } catch (error) {
      logger.error('componentDidMount On CurrentTime' + error)
    }
  }
}

export default CurrentTime;
