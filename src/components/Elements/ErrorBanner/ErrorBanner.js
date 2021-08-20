import React from 'react'
import s from './ErrorBanner.module.css'
import dataStorage from '../../../dataStorage'

export default class ErrorBanner extends React.Component {
    constructor(props) {
        super(props)
        this.props.fn && this.props.fn({
            showError: this.showError
        })
    }

    showError = (msg, isWarning) => {
        if (this.dom && msg) {
            const msgTran = dataStorage.translate(msg)
            this.dom.innerText = msgTran !== msg ? msgTran : msg;
            isWarning && this.dom.classList.add(s.warning)
            this.dom.classList.add(s.active)
            this.hideError()
        }
    }

    hideError = () => {
        this.timeout && clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
            this.dom.classList.remove(s.active)
        }, 4000)
    }

    render() {
        return (
            <div className={s.error} ref={ref => this.dom = ref}></div>
        )
    }
}
