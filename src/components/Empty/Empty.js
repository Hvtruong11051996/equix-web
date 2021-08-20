import React from 'react';
import dataStorage from '../../dataStorage';

class Empty extends React.Component {
    render() {
        return null;
    }

    componentDidMount() {
        setTimeout(() => {
            if (dataStorage.goldenLayout) {
                const lst = dataStorage.goldenLayout.goldenLayout.root.getItemsByType('component');
                if (lst.length) {
                    const lstMatch = lst.filter(item => item.config === this.props.glContainer._config);
                    if (lstMatch.length) {
                        lstMatch[0].parent.removeChild(lstMatch[0]);
                    }
                }
            }
        }, 500);
    }
}

export default Empty
