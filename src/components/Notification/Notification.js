import React from 'react';
import Noti from 'react-web-notification';
import NotificationSystem from 'react-notification-system';
import { translate } from 'react-i18next';
import logger from '../../helper/log';
import timeago from 'timeago.js';
import Lang from '../Inc/Lang';
import dataStorage from '../../dataStorage';
import { checkTimeAgo, formatNumberPrice } from '../../helper/functionUtils'
import {
    subcribe, unsubcribe
} from '../../helper/windowMonitor';

class Notification extends React.Component {
    constructor(props) {
        super(props);
        this.intervalId = null;
        this.hidden = false;
        this.dicInterval = {};
        this.state = {
            // isHidden: false,
            ignore: true,
            title: ''
        };
        this.listDelay = [];
        this.updateTimeStamp = this.updateTimeStamp.bind(this);
        this.reRunInterval = this.reRunInterval.bind(this);
        this.clearAllNoti = this.clearAllNoti.bind(this);
    }

    componentDidMount() {
        this._notificationSystem = this.refs.notificationSystem;
        if (typeof this.props.func === 'function') this.props.func(this.handleButtonClick);
    }

    handlePermissionGranted() {
        logger.log('Permission Granted');
        this.setState({
            ignore: false
        });
    }

    handlePermissionDenied() {
        logger.log('Permission Denied');
        this.setState({
            ignore: true
        });
    }

    handleNotSupported() {
        logger.log('Web Notification not Supported');
        this.setState({
            ignore: true
        });
    }

    handleNotificationOnClick(e) {
        const clickedNoti = e.target;
        if (clickedNoti.classList && clickedNoti.classList[1]) {
            const orderId = (clickedNoti.classList[1] + '');
            if (orderId && orderId.indexOf('orderId') !== -1) {
                dataStorage.goldenLayout.addComponentToStack('Order', {
                    needConfirm: false,
                    stateOrder: 'DetailOrder',
                    data: {
                        display_order_id: orderId.replace('orderId_', '')
                    }
                })
                const listNode = document.querySelectorAll(`.notiCustom.${orderId}`);
                const listClose = Array.from(listNode);
                listClose.length && listClose.map(node => {
                    const temp = node.parentNode.querySelector('.notification-dismiss');
                    temp.click();
                });
            }
        }
    }

    handleNotificationDesktopOnClick(e, tag) {
        console.log(e, tag, 'noti desktop clicked!')
        window.focus();
        const orderId = e && e.currentTarget && e.currentTarget.data;
        if (!orderId) return;
        setTimeout(() => {
            dataStorage.goldenLayout.addComponentToStack('Order', {
                needConfirm: false,
                stateOrder: 'DetailOrder',
                data: {
                    display_order_id: orderId
                }
            })
        }, 1000)
    }

    handleNotificationOnError(e, tag) {
        logger.log('Notification error tag:' + tag);
    }

    handleNotificationOnClose(e, tag) {
        logger.log('Notification closed tag:' + tag);
    }

    playAudio() {
        // const audio = new Audio('sound.mp3');
        // audio.play();
    }

    handleNotificationOnShow(e, tag) {
        this.playAudio();
        logger.log('Notification shown tag:' + tag);
    }

    updateTimeStamp(id) {
        this.dicInterval[id] && clearInterval(this.dicInterval[id]);
        delete this.dicInterval[id];
        var timeAgo = timeago().format(id, dataStorage.deviceLang);
        const divNoti = document.getElementById(`timeagoNoti_${id}`);
        if (divNoti) {
            divNoti.innerHTML = timeAgo
        }
        this.reRunInterval(id);
    }

    reRunInterval(id) {
        this.dicInterval[id] = setInterval(() => this.updateTimeStamp(id), checkTimeAgo(id));
    }

    createObjNoti = (opt) => {
        let notiType = opt.isOrder ? 'orderId' : 'layoutId';
        if (opt.importantText === 'margin') {
            notiType = 'layoutId';
            opt.importantText = '';
        }

        return {
            level: 'info',
            position: 'bc',
            autoDismiss: 0,
            dismissible: 'button',
            children: (
                <div className={`notiCustom ${notiType}_${opt.orderId}`}>
                    <div className={`headNotification ${notiType}_${opt.orderId}`}>
                        <div className={`notiTitle size--4 ${notiType}_${opt.orderId}`}>{opt.title}</div>
                        <div className={`timeagoNoti size--3 ${notiType}_${opt.orderId}`} id={`timeagoNoti_${opt.id}`}>{timeago().format(opt.id, dataStorage.language)}</div>
                    </div>
                    <div className={`notiBody ${notiType}_${opt.orderId}`}>
                        {
                            opt.importantText && typeof opt.importantText === 'string' ? <div className='importantTextNoti'>{opt.importantText}</div> : null
                        }
                        {opt.body}
                    </div>
                </div>
            )
        };
    }

    handleButtonClick = (opt) => {
        if (this._notificationSystem && this.state.ignore) {
            if (!this.dicNoti) this.dicNoti = []
            this.dicNoti.push(this.createObjNoti(opt))
            if (this.timeOutNoti) return
            this.timeOutNoti = setTimeout(() => {
                this.timeOutNoti = null;
                if (!this.lastIndex) this.lastIndex = 0
                if (this.dicNoti.length - this.lastIndex > 10) {
                    this.clearAllNoti()
                    for (let index = this.dicNoti.length - 10; index <= this.dicNoti.length; index++) {
                        this.lastIndex = index
                        this._notificationSystem.addNotification(this.dicNoti[index])
                    }
                } else {
                    if (this.dicNoti.length !== 1) this.lastIndex += 1
                    for (let index = this.lastIndex; index <= this.dicNoti.length; index++) {
                        if (this.dicNoti[index]) {
                            this.lastIndex = index
                            this._notificationSystem.addNotification(this.dicNoti[index])
                            if (this._notificationSystem.state.notifications.length >= 10) {
                                let noti = this._notificationSystem.state.notifications.shift();
                                this._notificationSystem.removeNotification(noti.uid)
                            }
                        }
                    }
                }
                this.updateTimeStamp(opt.id);
                this.reRunInterval(opt.id);
                const divCloseAll = document.getElementsByClassName('closeAllNoti');
                if (divCloseAll && divCloseAll.length) {
                    const closeAll = divCloseAll[0].children[0];
                    ReactDOM.render(<span className='text-capitalize'><Lang>lang_close_all</Lang></span>, closeAll)
                    divCloseAll[0].onclick = () => this.clearAllNoti()
                }
            }, 500);
        }

        const now = Date.now();
        const title = opt.title || 'reactWebNotification' + now;

        const options = {
            body: (opt.importantText || '') + ' ' + opt.body || 'time',
            icon: opt.icon || (document.querySelector("link[rel*='icon']") || {}).href,
            data: opt.orderId || '',
            lang: 'en'
        }

        this.setState({
            title: title,
            options: options
        });
    }
    clearAllNoti() {
        this._notificationSystem && this._notificationSystem.clearNotifications()
    }

    render() {
        return (
            <div className='notiRoot' onClick={this.handleNotificationOnClick.bind(this)}>
                <Noti
                    askAgain={false}
                    ignore={this.state.ignore}
                    notSupported={this.handleNotSupported.bind(this)}
                    onPermissionGranted={this.handlePermissionGranted.bind(this)}
                    onPermissionDenied={this.handlePermissionDenied.bind(this)}
                    onShow={this.handleNotificationOnShow.bind(this)}
                    onClick={this.handleNotificationDesktopOnClick.bind(this)}
                    onClose={this.handleNotificationOnClose.bind(this)}
                    onError={this.handleNotificationOnError.bind(this)}
                    timeout={10000}
                    title={this.state.title}
                    options={this.state.options}
                />
                <div style={{ overflow: 'auto' }}>
                    <NotificationSystem ref='notificationSystem' allowHTML={true} />
                </div>
            </div>
        )
    }
}

export default translate('translations')(Notification);
