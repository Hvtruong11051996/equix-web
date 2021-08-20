import React from 'react';

class Header extends React.Component {
    render() {
        return <div className='qe-header-row'>{this.props.value || '--'}</div>
    }
}
export default Header;
