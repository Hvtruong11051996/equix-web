import Lang from '../Lang';
import Icon from '../Icon';
import React from 'react';
import ReactDom from 'react-dom';
import dataStorage from '../../../dataStorage';
import { func } from '../../../storage';
import { emitter, eventEmitter } from '../../../constants/emitter_enum';
import Button, { buttonType } from '../../Elements/Button/Button';
import SvgIcon, { path } from '../SvgIcon/SvgIcon';

module.exports = function (obj) {
    if (obj.checkWindowLoggedOut) {
        if (window.loggedOut && !obj.isOrderPopup) {
            obj.cancelCallback && obj.cancelCallback()
            return
        }
        window.loggedOut = true;
    }
    const header = obj.header
    const navbar = obj.navbar
    const title = obj.title
    const subTitle = obj.subTitle
    const confirmText = obj.confirmText
    const btnTextClass = obj.btnTextClass
    const type = obj.type || false
    const msg = obj.message;
    const isTranslate = obj.notTranslate;
    const classWidthAuto = obj.widthAuto ? ' width-auto' : ''
    let outer = document.getElementById('confirm');
    if (outer && obj.isOrderPopup) {
        const elmCancel = document.querySelector('#confirm .btn-cancel')
        if (elmCancel) elmCancel.click()
    }
    if (!outer) {
        outer = document.createElement('div');
        outer.id = 'confirm';
    }
    outer.className = 'popUpLogout myShow popup';
    if (obj.className) outer.className += ' ' + obj.className;
    outer.innerHTML = '';

    const div = document.createElement('div');
    div.className = 'size--3' + classWidthAuto;
    outer.appendChild(div);

    if (header) {
        const divHeader = document.createElement('div');
        divHeader.className = 'header-confirm size--4 text-capitalize'
        ReactDOM.render(<Lang>{header}</Lang>, divHeader)
        div.appendChild(divHeader);
    }

    if (navbar) {
        const divNavbar = document.createElement('div');
        divNavbar.className = 'navbar-confirm showTitle size--3'
        ReactDOM.render([
            <div key='navbarConfirmText'><Lang>{navbar}</Lang></div>,
            <div key='navbarConfirmIcon' style={{ width: 40 }} onClick={() => done(obj.closeCallBack)}>
                <Icon src={'content/clear'} />
            </div>
        ], divNavbar)
        div.appendChild(divNavbar);
    }

    if (title) {
        const divTitle = document.createElement('div')
        divTitle.className = 'title-confirm showTitle size--3'
        ReactDOM.render(<Lang>{title}</Lang>, divTitle);
        div.appendChild(divTitle);
    }

    if (subTitle) {
        const divSubTitle = document.createElement('div')
        divSubTitle.className = 'sub-title-confirm showTitle size--2';
        ReactDOM.render(<Lang>{subTitle}</Lang>, divSubTitle);
        div.appendChild(divSubTitle);
    }

    if (msg) {
        const divMsg = document.createElement('div');
        if (typeof msg === 'string') {
            divMsg.className = 'msg-confirm confirmBound showTitle';
            if (!isTranslate) {
                ReactDOM.render(<div><Lang>{msg}</Lang></div>, divMsg);
            } else {
                ReactDOM.render(<div>{msg}</div>, divMsg);
            }
            div.appendChild(divMsg);
        } else {
            ReactDOM.render(<div>{msg}</div>, divMsg);
            div.appendChild(divMsg);
        }
    }
    if (obj.showDontShowItAgain) {
        let isCheck = false
        const handleOnClickDoNotShow = function (e) {
            if (!document.querySelector('.msg-check-not-show-container img')) return
            const check = '.' + dataStorage.hrefImg + '/checkbox-marked-outline.svg'
            const uncheck = '.' + dataStorage.hrefImg + '/outline-check_box_outline_blank.svg'
            if (isCheck) {
                isCheck = false
                document.querySelector('.msg-check-not-show-container img').src = uncheck
                dataStorage.allowCloseAllWidgets = false
            } else {
                isCheck = true
                document.querySelector('.msg-check-not-show-container img').src = check
                dataStorage.allowCloseAllWidgets = true
            }
        }
        const divDontShowItAgain = document.createElement('div');
        divDontShowItAgain.className = 'msg-check-not-show'
        ReactDOM.render(<div className='msg-check-not-show-container' onClick={e => handleOnClickDoNotShow(e)}>
            <div className='checkBox'>
                <img src={`.${dataStorage.hrefImg}/outline-check_box_outline_blank.svg`} />
            </div>
            <div><Lang>lang_do_not_show_this_again</Lang></div>
        </div>, divDontShowItAgain)

        div.appendChild(divDontShowItAgain)
    }

    let isConnected = dataStorage.connected
    const changeConnection = function (connect) {
        if (!connect !== !isConnected) {
            const elm = document.querySelector('.confirmBtnRoot.btn-group .btn:not(.btn-dask)')
            if (connect) {
                elm && elm.classList.remove('disable')
            } else {
                elm && elm.classList.add('disable')
            }
            isConnected = connect
        }
    }
    let checkConnection = func.getStore(emitter.CHECK_CONNECTION)
    checkConnection && checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, changeConnection);

    const done = function (cb, cbAction) {
        document.removeEventListener('keyup', enter)
        window.loggedOut = false;
        if (!obj.checkConnect || cbAction === 'CANCEL') {
            cb && cb()
            document.body.querySelector('#confirm') && document.body.removeChild(outer);
        } else {
            if (isConnected) {
                cb && cb()
                document.body.querySelector('#confirm') && document.body.removeChild(outer);
            }
        }
    };
    if (obj.init) {
        obj.init(() => {
            done(null, 'CANCEL');
        });
    }
    const ok = document.createElement('div')

    ReactDom.render(
        <div className='confirmBtnRoot btn-group'>
            {obj.cancelCallback
                ? <Button type={buttonType.danger} className='btn' onClick={() => done(obj.cancelCallback, 'CANCEL')}>
                    <SvgIcon path={path.mdiClose} />
                    <span className='text-uppercase'>{type ? <Lang>lang_no</Lang> : <Lang>lang_cancel</Lang>}</span>
                </Button>
                : null
            }
            {obj.noCallback
                ? <Button type={buttonType.danger} className='btn' onClick={() => done(obj.noCallback, 'NO')}>
                    <SvgIcon path={path.mdiClose} />
                    <span className='text-uppercase'><Lang>lang_no</Lang></span>
                </Button>
                : null
            }
            <Button type={buttonType.success} className={`btn ${btnTextClass || ''}`} onClick={() => done(obj.callback, 'OK')}>
                {confirmText ? null : <SvgIcon path={path.mdiCheck} />}
                <span className='text-uppercase'>{type ? <Lang>{confirmText || 'lang_yes'}</Lang> : <Lang>{confirmText || 'lang_ok'}</Lang>}</span>
            </Button>
        </div>, ok
    );
    const group = document.createElement('div')
    group.className = 'button-group'
    group.appendChild(ok);
    div.appendChild(group);
    document.body.appendChild(outer);
    function enter(event) {
        if (event.keyCode === 13) {
            done(obj.callback);
        }
    }
    document.addEventListener('keyup', enter);
};
