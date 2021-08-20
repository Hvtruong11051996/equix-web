import React from 'react'
import Lang from '../../Inc/Lang'
import s from './LastUpdated.module.css'
import moment from 'moment'

export default class ErrorBanner extends React.Component {
    constructor(props) {
        super(props)
        this.format = props.format || 'HH:mm:ss, DD/MM/YYYY'
        this.state = {
            updated: null
        }
        this.props.fn && this.props.fn({
            setUpdated: this.setUpdated
        })
    }

    setUpdated = (updated) => {
        this.setState({ updated })
    }

    render() {
        return (
            <div className={s.updated}>
                <label className='text-capitalize'><Lang>lang_last_updated</Lang>:&nbsp;</label>
                <span>{this.state.updated ? moment(this.state.updated).tz('Australia/Sydney').format(this.format) : ''}</span>
            </div>
        )
    }
}
