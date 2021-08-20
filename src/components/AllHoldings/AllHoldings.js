import React from 'react';
import Portfolio from '../Portfolio';
import config from '../../../public/config';
import dataStorage from '../../dataStorage';
export class AllHoldings extends React.Component {
  render() {
    const Component = Portfolio;
    return <Component {...this.props} isAllHoldings={true} />
  }
}

export default AllHoldings;
