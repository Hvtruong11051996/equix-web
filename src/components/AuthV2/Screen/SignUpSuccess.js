import React from 'react'
import s from './SignUpSuccess.module.css'
import Lang from '../../Inc/Lang'
import SvgIcon, { path } from '../../Inc/SvgIcon'

export default class SignUpSuccess extends React.Component {
    renderHeader() {
        return <div className={s.header}>
            <div className={s.title + ' ' + 'showTitle firstLetterUpperCase'}><Lang>lang_sign_up</Lang></div>
            <div className={s.icon} onClick={() => this.props.close()}><SvgIcon path={path.mdiClose} /></div>
        </div>
    }

    renderTitle() {
        return <div className={s.mainTitle}><Lang>lang_activate_your_account</Lang></div>
    }

    renderSubTitle() {
        return <div className={s.subTitle}><Lang>lang_notify_when_signup_success</Lang></div>
    }

    renderButton() {
        return <div className={s.button + ' ' + 'text-uppercase'} onClick={() => this.props.close()}><Lang>lang_ok</Lang></div>
    }

    render() {
        return <div className={s.container}>
            {this.renderHeader()}
            <div className={s.content}>
                {this.renderTitle()}
                {this.renderSubTitle()}
                {this.renderButton()}
            </div>
        </div>
    }
}
