import React from 'react';
import ReactDom from 'react-dom';
import Lang from '../Inc/Lang';
import Icon from '../Inc/Icon';
import OrderPadV2 from '../OrderPadV2';
import config from '../../../public/config';
import dataStorage from '../../dataStorage';

module.exports = function (obj) {
    let Component = obj.component;
    const props = {};
    const state = {};
    let maximun = false;
    let minimize = false;
    if (obj.props) Object.assign(props, obj.props);
    if (obj.state) Object.assign(state, obj.state);
    let isCancelOrder = state.stateOrder === 'DetailOrder';
    if (!dataStorage.env_config.roles.contingentOrder && !state.contingentOrder) {
        if (!isCancelOrder) Component = OrderPadV2;
        obj.custom = true;
        state.custom = true;
    }
    const id = state.contingentOrder ? 'contingentOrderWindow' : 'quickOrderWindow';
    const invertId = !state.contingentOrder ? 'contingentOrderWindow' : 'quickOrderWindow';
    let outer = document.getElementById(id);
    const reOrder = () => {
        const invertItem = document.getElementById(invertId);
        if (invertItem) {
            invertItem.style.zIndex = '1000';
            outer.style.zIndex = '1001';
        }
    }
    const getWidth = () => {
        return document.body.offsetWidth > outer.clientWidth ? outer.clientWidth : document.body.offsetWidth;
    }
    const getHeight = () => {
        return document.body.offsetHeight > outer.clientHeight ? outer.clientHeight : document.body.offsetHeight;
    }
    if (!outer) {
        outer = document.createElement('div');
        outer.id = id;
        outer.className = 'windowForm';
        if (obj.custom) outer.className += ' custom';
        const current = document.querySelector('.windowForm');
        if (current) {
            if (current.offsetTop < document.body.offsetHeight - 102) outer.style.top = (current.offsetTop + 46) + 'px';
            if (current.offsetLeft < document.body.offsetWidth - 200) outer.style.left = (current.offsetLeft + 46) + 'px';
        } else {
            outer.style.visibility = 'hidden';
            setTimeout(() => {
                let widthOffset = getWidth();
                let heightOffset = getHeight();
                let top = ((document.body.offsetHeight - heightOffset) / 2) > 56 ? ((document.body.offsetHeight - heightOffset) / 2) : 56;
                let left = (document.body.offsetWidth - widthOffset) / 2;
                outer.style.top = top + 'px';
                outer.style.left = left + 'px';
                outer.style.visibility = null;
            }, 10);
        }
        outer.addEventListener('mousedown', reOrder)
        document.body.querySelector('.layout').appendChild(outer);
    }
    let headerDiv = outer.querySelector('.dragHeader');
    if (!headerDiv) {
        headerDiv = document.createElement('div');
        headerDiv.className = 'dragHeader';
    }
    reOrder();
    if (outer.classList.contains('closeForm')) outer.classList.remove('closeForm')
    if (outer.classList.contains('minimizeWindow')) outer.classList.remove('minimizeWindow')
    if (outer.classList.contains('maximunWindow')) outer.classList.remove('maximunWindow')
    let headerName
    switch (state.stateOrder) {
        case 'NewOrder':
            outer.classList.remove('cancelOrder')
            headerName = state.contingentOrder ? 'lang_place_contingent_order' : 'lang_quick_order'
            break;
        case 'ModifyOrder':
            outer.classList.remove('cancelOrder')
            headerName = state.contingentOrder ? 'lang_modify_contingent_order' : 'lang_modify_order'
            break;
        case 'DetailOrder':
            outer.classList.add('cancelOrder')
            headerName = state.contingentOrder ? 'lang_cancel_contingent_order' : 'lang_cancel_order'
            break;
        default:
            break;
    }

    let close = () => {
        setTimeout(() => {
            ReactDom.render(null, div);
            ReactDom.render(null, headerDiv);
            let widthOffset = getWidth();
            let heightOffset = getHeight();
            outer.classList.add('closeForm');
            outer.classList.remove('maximunWindow');
            outer.classList.remove('minimizeWindow');
            outer.classList.remove('cancelOrder');
            outer.style.top = (((document.body.offsetHeight - heightOffset) / 2) > 56 ? ((document.body.offsetHeight - heightOffset) / 2) : 56) + 'px';
            outer.style.left = ((document.body.offsetWidth - widthOffset) / 2) + 'px';
            maximun = false;
            minimize = false;
            if (outer.parentNode) outer.parentNode.removeChild(outer);
        }, 10);
    }
    let maxinmunWindow = () => {
        if (maximun) {
            maximun = false;
            outer.classList.remove('maximunWindow');
            if (state.stateOrder === 'DetailOrder') outer.classList.add('cancelOrder')
            dragElement(outer, headerDiv, true)
        } else {
            outer.classList.remove('minimizeWindow');
            outer.classList.remove('cancelOrder');
            outer.classList.add('maximunWindow');
            dragElement(outer, headerDiv, false)
            minimize = false;
            maximun = true;
        }
    }
    let minimizeWindow = () => {
        if (minimize) {
            minimize = false;
            outer.classList.remove('minimizeWindow');
            if (state.stateOrder === 'DetailOrder') outer.classList.add('cancelOrder')
            dragElement(outer, headerDiv, true)
        } else {
            outer.classList.remove('maximunWindow');
            outer.classList.remove('cancelOrder');
            outer.classList.add('minimizeWindow');
            dragElement(outer, headerDiv, false)
            maximun = false;
            minimize = true;
        }
    }
    let checkMinimize = (e) => {
        if (outer.classList.contains('minimizeWindow') && !e.target.closest('.minimizeDiv')) minimizeWindow()
    }
    let renderHeader = () => {
        return (
            <div onClick={(e) => {
                checkMinimize(e);
            }}>
                <div className='headerTitleOrderPad size--3 text-capitalize'><Lang>{headerName}</Lang></div>
                <div>
                    <div className='minimizeDiv' onClick={() => {
                        minimizeWindow()
                    }}><Icon style={{ marginTop: '10px' }} key='remove' src={'content/remove'} /></div>
                    <div onClick={() => {
                        maxinmunWindow()
                    }}><Icon style={{ marginTop: '10px' }} key='crop' src={'av/web-asset'} /> </div>
                    <div onClick={() => {
                        close()
                    }}><Icon style={{ width: '20px', height: '20px', marginTop: '10px' }} src={'content/clear'} /></div>
                </div>
            </div>
        )
    }

    let div = outer.querySelector('.windowBodyForm');
    if (!div) {
        div = document.createElement('div');
        div.className = 'windowBodyForm';
    }

    let dragElement = (element, headerDiv, isDrag) => {
        let pos1 = 0;
        let pos2 = 0;
        let pos3 = 0;
        let pos4 = 0;
        if (isDrag) {
            let elementDrag = (e) => {
                e = e || window.event;
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                let top = 0;
                let left = 0;
                if (element.offsetTop - pos2 <= 56) top = 56;
                else if (element.offsetTop - pos2 > document.body.offsetHeight - 40) top = document.body.offsetHeight - 40;
                else top = element.offsetTop - pos2

                if (element.offsetLeft - pos1 <= 0) left = 0;
                else if (element.offsetLeft - pos1 > document.body.offsetWidth - getWidth()) left = document.body.offsetWidth - getWidth();
                else left = element.offsetLeft - pos1
                element.style.top = top + 'px';
                element.style.left = left + 'px';
            }

            let closeDragElement = () => {
                document.body.classList.remove('noSelect')
                document.onmouseup = null;
                document.onmousemove = null;
                headerDiv.style.cursor = 'default'
            }

            let dragMouseDown = (e) => {
                if (e.target.tagName.toUpperCase() === 'INPUT') return;
                document.body.classList.add('noSelect')
                e = e || window.event;
                // e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                headerDiv.style.cursor = 'grabbing'
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            }
            headerDiv.onmousedown = dragMouseDown;
        } else {
            headerDiv.onmousedown = null;
        }
    }
    const setHeader = (dom) => {
        let header = outer.querySelector('.dragHeader');
        if (header) header.parentNode.removeChild(header);
        dragElement(outer, dom, true)
    }
    const creatDom = (className) => {
        const div = document.createElement('div');
        div.className = className;
        outer.appendChild(div);
        return div;
    }
    const setResizeCallback = (fn) => {
        if (typeof fn === 'function') {
            const barLeft = outer.querySelector('.windowBar') || creatDom('windowBar');
            const barRight = outer.querySelector('.windowBar.right') || creatDom('windowBar right');
            barLeft.onmousedown = barRight.onmousedown = (e) => {
                let x = e.x;
                document.body.classList.add('resizing');
                const isRight = e.target.classList.contains('right');
                const updateX = (delta) => {
                    if (!isRight) {
                        outer.style.left = (parseInt(outer.style.left) - delta) + 'px';
                        x -= delta
                    } else x += delta
                }
                document.onmousemove = (e) => {
                    fn(isRight ? e.x - x : x - e.x, updateX);
                }
                document.onmouseup = () => {
                    document.body.classList.remove('resizing');
                    document.onmousemove = null;
                    document.onmouseup = null;
                }
            }
        }
    }
    if (outer.querySelector('#' + id + ' .windowBodyForm') && outer.querySelector('.dragHeader')) {
        if (!obj.custom) {
            ReactDom.render(null, headerDiv, () => {
                ReactDom.render(renderHeader(), headerDiv);
            });
        }
        ReactDom.render(null, div, () => {
            ReactDom.render(<Component state={state} {...props} setHeader={setHeader} close={close} setResizeCallback={setResizeCallback} />, div);
        });
        dragElement(outer, headerDiv, true);
    } else {
        if (!obj.custom) {
            ReactDom.render(renderHeader(), headerDiv);
            outer.appendChild(headerDiv);
        }
        outer.appendChild(div);
        ReactDom.render(null, div, () => {
            ReactDom.render(<Component state={state} {...props} setHeader={setHeader} close={close} setResizeCallback={setResizeCallback} />, div);
        });
        dragElement(outer, headerDiv, true)
    }
};
