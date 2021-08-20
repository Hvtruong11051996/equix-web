import React from 'react';
import ReactDom from 'react-dom';
import Lang from '../Inc/Lang/Lang';
import Icon from '../Inc/Icon/Icon';
import config from '../../../public/config';

module.exports = function (obj) {
    let Component = obj.component;
    const props = {};
    const state = {};

    if (obj.props) Object.assign(props, obj.props);
    if (obj.state) Object.assign(state, obj.state);
    const getWidth = () => {
        return document.body.offsetWidth > outer.clientWidth ? outer.clientWidth : document.body.offsetWidth;
    }
    const getHeight = () => {
        return document.body.offsetHeight > outer.clientHeight ? outer.clientHeight : document.body.offsetHeight;
    }
    let outer = document.querySelector('.panelBuySell');
    if (!outer) {
        outer = document.createElement('div');
        outer.className = 'panelBuySell';
        outer.style.visibility = 'hidden';
        setTimeout(() => {
            let widthOffset = getWidth();
            let heightOffset = getHeight();
            let top = ((document.body.offsetHeight - heightOffset) / 3) > 56 ? ((document.body.offsetHeight - heightOffset) / 3) : 56;
            outer.style.top = top + 'px';
            outer.style.left = '0px';
            outer.style.visibility = null;
        }, 10);

        document.body.querySelector('.layout').appendChild(outer);
    }
    let dragDiv = outer.querySelector('.panelDrag');
    if (!dragDiv) {
        dragDiv = document.createElement('div');
        dragDiv.className = 'panelDrag';
    }

    let renderDragDiv = () => {
        return (
            <div className='showTitle'><img style={{ filter: 'contrast(0.3)' }} src='/common/drag.svg' /> <span className='text-uppercase' style={{ opacity: 0, zIndex: -1, position: 'absolute', width: 0 }}><Lang>lang_move</Lang> </span> </div>
        )
    }
    ReactDom.render(renderDragDiv(), dragDiv)
    outer.appendChild(dragDiv);
    let div = outer.querySelector('.panelBody');
    if (!div) {
        div = document.createElement('div');
        div.className = 'panelBody';
    }
    const close = () => {
        setTimeout(() => {
            ReactDom.render(null, div);
            div.classList.add('closing')
            if (outer.parentNode) outer.parentNode.removeChild(outer);
        }, 10);
    }
    ReactDom.render(null, div, () => {
        ReactDom.render(<Component close={close} {...props} />, div);
    });
    outer.appendChild(div);

    let dragElement = (element, dragDiv, isDrag) => {
        let pos1 = 0;
        let pos2 = 0;
        let pos3 = 0;
        let pos4 = 0;
        let elementDrag = (e) => {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            let top = 0;
            let left = 0;
            if (element.offsetTop - pos2 <= 56 + 24) top = 56 + 24;
            else if (element.offsetTop - pos2 > document.body.offsetHeight - 30) top = document.body.offsetHeight - 30;
            else top = element.offsetTop - pos2
            if (element.offsetTop - pos2 <= 56 + 24) top = 56 + 24;
            else if (element.offsetTop - pos2 > document.body.offsetHeight - 30) top = document.body.offsetHeight - 30;
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
            dragDiv.style.cursor = 'default'
        }

        let dragMouseDown = (e) => {
            document.body.classList.add('noSelect')
            e = e || window.event;
            // e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            dragDiv.style.cursor = 'grabbing'
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
        dragDiv.onmousedown = dragMouseDown;
    }
    dragElement(outer, dragDiv, true)
};
