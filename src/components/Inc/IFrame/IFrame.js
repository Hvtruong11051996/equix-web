import React from 'react';
import logger from '../../../helper/log';

class IFrame extends React.Component {
  // refFn(dom) {
  //   if (dom) {
  //     setTimeout(() => {
  //       logger.log(dom.contentDocument);
  //     }, 1000);
  //   }
  // }
  onLoad = (e) => {
    console.log(e)
  }
  render() {
    return <iframe ref={dom => this.refFn = dom} src={this.props.src} onLoad={this.onLoad} />
  }
}

export default IFrame
