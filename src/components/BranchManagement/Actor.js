import React from 'react'
import Lang from '../Inc/Lang'
import s from './VettingRulesManagement.module.css'

export default class ErrorBanner extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            actor: null,
            group: null
        }
        this.props.fn && this.props.fn({
            setData: this.setData
        })
    }

    setData = (data) => {
        this.setState(data)
    }

    render() {
        return (
            <div className={s.actor}>
                <label className='firstLetterUpperCase'><Lang>lang_user</Lang>:&nbsp;</label>
                <span>{this.state.actor || ''}</span>&nbsp;<span className={s.tag}>{this.state.group && this.state.group.toUpperCase()}</span>
            </div>
        )
    }
}
