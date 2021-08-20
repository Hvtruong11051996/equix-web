import scrollbarWidth from 'scrollbarwidth';

export default class Scroll {
  constructor(scroll) {
    if (!scroll || scroll.hasAttribute('scroll-content')) return;
    scroll.setAttribute('scroll-content', '');
    scroll.style.bottom = scroll.style.right = (0 - scrollbarWidth()) + 'px';
    const container = scroll.parentNode;
    container.setAttribute('scroll', '');
    let div;
    let bar1;
    scroll.childNodes.forEach(node => {
      if (node.classList && node.classList.contains('vertical')) {
        bar1 = node.firstChild
      }
    })
    if (!bar1) {
      div = document.createElement('div');
      div.className = 'vertical';
      div.style.display = 'none';
      bar1 = document.createElement('div');
      bar1.className = 'scrollBar';
      div.appendChild(bar1);
      container.appendChild(div);
    }
    bar1.style.height = (scroll.clientHeight / (scroll.scrollHeight / scroll.clientHeight)) + 'px';
    bar1.onmousedown = function(e) {
      // bar1.dragging = true;
      e = e || window.event;
      // get the mouse cursor position at startup:
      bar1.topPos = e.clientY - bar1.offsetTop;
      document.body.classList.add('noSelect');
      document.onmouseup = function() {
        /* stop moving when mouse button is released: */
        // bar1.dragging = false;
        document.onmouseup = null;
        document.onmousemove = null;
        document.body.classList.remove('noSelect');
      };
      // call a function whenever the cursor moves:
      document.onmousemove = function(e) {
        e = e || window.event;
        let top = e.clientY - bar1.topPos;

        if (top < 0) top = 0;
        else if (top > container.clientHeight - bar1.clientHeight) top = container.clientHeight - bar1.clientHeight;
        // bar1.style.top = top + "px";
        scroll.scrollTop = top * (scroll.scrollHeight - scroll.clientHeight) / (bar1.parentNode.clientHeight - bar1.clientHeight);
        // const elmnt = e.target.parentNode.parentNode;
        // elmnt.style.top = (elmnt.offsetTop - e.target.pos2) + "px";
        // elmnt.style.left = (elmnt.offsetLeft - e.target.pos1) + "px";
      };
    };
    let bar2;
    scroll.childNodes.forEach(node => {
      if (node.classList && node.classList.contains('horizontal')) {
        bar2 = node.firstChild
      }
    })
    if (!bar2) {
      div = document.createElement('div');
      div.className = 'horizontal';
      div.style.display = 'none';
      bar2 = document.createElement('div');
      bar2.className = 'scrollBar';
      div.appendChild(bar2);
      container.appendChild(div);
    }
    bar2.style.width = (scroll.clientWidth / (scroll.scrollWidth / scroll.clientWidth)) + 'px';
    bar2.onmousedown = function(e) {
      // bar1.dragging = true;
      e = e || window.event;
      // get the mouse cursor position at startup:
      bar2.leftPos = e.clientX - bar2.offsetLeft; //
      document.body.classList.add('noSelect');
      document.onmouseup = function() {
        /* stop moving when mouse button is released: */
        // bar1.dragging = false;
        document.onmouseup = null;
        document.onmousemove = null;
        document.body.classList.remove('noSelect');
      };
      // call a function whenever the cursor moves:
      document.onmousemove = function(e) {
        e = e || window.event;
        let left = e.clientX - bar2.leftPos;

        if (left < 0) left = 0;
        else if (left > container.clientWidth - bar2.clientWidth) left = container.clientWidth - bar2.clientWidth;
        scroll.scrollLeft = left * (scroll.scrollWidth - scroll.clientWidth) / (bar2.parentNode.clientWidth - bar2.clientWidth);
      };
    };

    scroll.onscroll = function() {
      if (scroll.onmousemove) scroll.onmousemove();
      bar1.style.transform = `translate(0,${(scroll.scrollTop * (bar1.parentNode.clientHeight - bar1.clientHeight) / (scroll.scrollHeight - scroll.clientHeight))}px)`;
      bar2.style.transform = `translate(${(scroll.scrollLeft * (bar2.parentNode.clientWidth - bar2.clientWidth) / (scroll.scrollWidth - scroll.clientWidth))}px,0)`;
    };
    bar1.parentNode.onmouseenter = bar2.parentNode.onmouseenter = function() {
      scroll.onmousemove = null;
      if (scroll.time) {
        clearTimeout(scroll.time);
      }
      container.setAttribute('active', '');
    };
    bar1.parentNode.onmouseleave = bar2.parentNode.onmouseleave = function() {
      scroll.onmousemove = scroll.timmeout;
      container.removeAttribute('active');
    };
    scroll.timmeout = function() {
      container.setAttribute('active', '');
      if (this.time) {
        clearTimeout(this.time);
      }
      this.time = setTimeout(function() {
        container.removeAttribute('active');
        this.time = null;
      }, 1000);
    };
    scroll.onmousemove = scroll.timmeout;
    scroll.monitor = () => {
      let size = 0;
      if (scroll.lastChild) {
        size = scroll.lastChild.offsetHeight + scroll.lastChild.offsetTop + 1;
        if (scroll.lastElementChild) size += parseInt(getComputedStyle(scroll.lastElementChild).marginBottom);
      }
      if (scroll.parentNode) {
        scroll.parentNode.style.height = size + 'px';
      }
      if (bar1.parentNode) {
        if (scroll.scrollHeight <= scroll.clientHeight) {
          bar1.parentNode.style.display = 'none';
        } else {
          bar1.parentNode.style.display = '';
          size = (scroll.clientHeight / (scroll.scrollHeight / scroll.clientHeight));
          bar1.style.height = (size < 32 ? 32 : size) + 'px';
          bar1.style.transform = `translate(0,${(scroll.scrollTop * (bar1.parentNode.clientHeight - bar1.clientHeight) / (scroll.scrollHeight - scroll.clientHeight))}px)`;
        }
      }
      if (bar2.parentNode) {
        if (scroll.scrollWidth === scroll.clientWidth) {
          bar2.parentNode.style.display = 'none';
        } else {
          bar2.parentNode.style.display = '';
          size = (scroll.clientWidth / (scroll.scrollWidth / scroll.clientWidth));
          bar2.style.width = (size < 32 ? 32 : size) + 'px';
          bar2.style.transform = `translate(${(scroll.scrollLeft * (bar2.parentNode.clientWidth - bar2.clientWidth) / (scroll.scrollWidth - scroll.clientWidth))}px,0)`;
        }
      }
    };
    scroll.addEventListener('animationstart', (event) => {
      if (event && event.animationName !== 'nodeVisible') return;
      const scrollContent = scroll.parentNode.querySelector('[scroll-content]')
      if (scrollContent && scroll.parentNode.classList.contains('ag-body-viewport-wrapper')) {
        const headerContainer = scroll.parentNode.parentNode.parentNode.querySelector('.ag-header-container')
        if (headerContainer) {
          headerContainer.style.left = '0px'
        }
      }
      scroll.monitor()
    }, false);
    container.ro = new MutationObserver(scroll.monitor);
    scroll.monitor();
    setTimeout(() => {
      scroll.monitor();
    }, 500)
    container.ro.observe(scroll, {
      attributes: true,
      childList: true,
      subtree: true
    });
  }
}
