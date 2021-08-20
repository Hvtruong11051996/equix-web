import React from 'react'
import s from './Error.module.css'
import { capitalizeFirstLetter } from '../../../helper/functionUtils'

export default class Error extends React.Component {
    constructor(props) {
        super(props)
        this.props.fn({
            showError: this.showError
        })
    }

    showError = (msg) => {
        if (!msg) {
            this.dom.classList.remove(s.active)
            return
        }
        this.error.innerText = capitalizeFirstLetter(msg)
        this.dom.classList.add(s.active)
    }

    render() {
        return <div style={{ zIndex: '1' }} className={s.container} ref={dom => this.dom = dom}>
            <div className={s.errorContainer}><div className={s.error} ref={dom => this.error = dom}></div></div>
        </div>
    }
}
