import React, { Component } from 'react'
import SvgIcon, { path } from '../Inc/SvgIcon';

class Icons extends Component {
    render() {
        return <div>
            <div style={{ overflow: 'auto', maxHeight: '100%', display: 'flex', flexWrap: 'wrap' }}>
                {Object.keys(path).map(key => {
                    return <div key={key} style={{ height: '64px', width: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', margin: '8px' }}>
                        <SvgIcon path={path[key]} />
                        <input value={key} onFocus={e => e.target.select()} style={{ width: '100%', boxSizing: 'border-box' }} />
                    </div>
                })}
            </div>
        </div>
    }
}

export default Icons
