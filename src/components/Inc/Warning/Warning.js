import Lang from '../Lang';
import Icon from '../Icon';
import React from 'react';
import ReactDom from 'react-dom';
module.exports = function (obj) {
    if (window.loggedOut) return;
    document.querySelectorAll('#confirm').forEach((dom) => {
        dom.parentNode.removeChild(dom);
    });
    const msg = obj.message;
    const cb = obj.callback;
    const isWarning = obj.isWarning;
    const isClickOk = obj.isClickOk;
    const isCheckIndex = obj.isCheckIndex;
    let outer = document.getElementById('confirm');
    if (!outer) {
        outer = document.createElement('div');
        outer.id = 'confirm';
    }
    outer.className = 'popUpLogout myShow popup';
    if (obj.className) outer.className += ' ' + obj.className;
    outer.innerHTML = '';

    const div = document.createElement('div');
    div.className = 'size--3 confirmBound .warning';
    const msgContainer = document.createElement('div');
    div.appendChild(msgContainer);
    if (isWarning) {
        document.body.classList.add('showWarningPopup');
        outer.style.zIndex = '9999'
        let divContent;
        divContent = msg.map((value, index) => {
            const isPhone = msg[index].isPhone;
            const isEmail = msg[index].isEmail;
            return <div key={index} className='showTitle size--3 confirmContent'>
                <span>
                    <Lang>{msg[index].value}</Lang>
                </span>
                <span className={'portfolioBold' + (obj.underline ? ' underline' : '')}>
                    <Lang>{msg[index].valHighLight || ''}</Lang>
                </span>
                <span>
                    <Lang>{msg[index].valSerial || ''}</Lang>
                </span>
                <span>
                    {
                        isEmail ? <a href={`tel:${isEmail}`} className="color-primary">{isEmail || ''}</a>
                            : <a href={`tel:${isPhone}`} className="color-primary">{isPhone || ''}</a>
                    }
                </span>
                <span>
                    <Lang>{msg[index].valEnd || ''}</Lang>
                </span>
            </div>
        });
        ReactDOM.render(divContent, msgContainer)
    } else {
        ReactDOM.render(<div><Lang>{msg}</Lang></div>, msgContainer)
    }
    outer.appendChild(div);
    const ok = document.createElement('div');
    ReactDom.render(
        <div className='confirmBtnRoot'>
            <div className='btn size--4 confirmBtnConfirm'>
                <span className='icon cancelConfirm'><Icon src='navigation/check' color='#ffffff' /></span>
                <span className='text-uppercase'><Lang>lang_ok</Lang></span>
            </div>
        </div>, ok
    );
    ok.onclick = function () {
        document.removeEventListener('keyup', enter);
        if (cb) cb();
        document.body.removeChild(outer);
        document.body.classList.remove('showWarningPopup')
    };
    const group = document.createElement('div');
    group.className = 'button-group';
    group.appendChild(ok);
    div.appendChild(group);
    document.body.appendChild(outer);
    function enter(event) {
        if (event.keyCode === 13) {
            ok.click();
        }
    }
    document.addEventListener('keyup', enter);
};
