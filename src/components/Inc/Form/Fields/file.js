import React from 'react';
import s from '../Form.module.css'

class File extends React.Component {
    render() {
        return <div className={s.file}>{this.props.value || ''}</div>
    }
}
export default File;
