import React from 'react';
import OrderList from '../OrderList';
export class AllOrders extends React.Component {
    render() {
        return <OrderList {...this.props} allOrders={true} />
    }
}

export default AllOrders;
