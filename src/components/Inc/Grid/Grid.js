
import React from 'react';
import GridDouble from './GridDouble';
import GridSingle from './GridSingle';
import config from '../../../../public/config';
// export default config.agridType === 'single' ? GridSingle : GridDouble;
export default class SwitchAg extends React.Component {
    render() {
        // const agridType = localStorageNew.getItem('agridType', true);
        const agridType = config.agridType;
        return (agridType !== 'single' && !this.props.onlyOneRow) ? <GridDouble {...this.props} /> : <GridSingle {...this.props} />
    }
}
