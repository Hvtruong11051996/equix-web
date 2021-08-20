import React from 'react';
import ReactDom from 'react-dom';
import s from './Modal.module.css'

module.exports = function (obj) {
  const Component = obj.component;
  let outer = document.getElementById('modal');
  if (!outer) {
    outer = document.createElement('div');
    outer.id = 'modal';
    document.body.appendChild(outer);
  }

  const close = () => {
    setTimeout(() => {
      ReactDom.render(null, div);
      div.classList.add('closing')
      outer.contains(div) && outer.removeChild(div)
    }, 10);
  }
  const props = {}
  if (obj.props) Object.assign(props, obj.props);
  const div = document.createElement('div');
  div.className = obj.className || ''
  ReactDom.render(<Component close={close} data={obj} {...props} />, div);
  outer.className = s.modal
  outer.appendChild(div);
};
