import scrollbarWidth from 'scrollbarwidth';

export default class ScrollForGrid {
    constructor(scroll, totalWidth, onScrollEvent1) {
        if (!scroll || scroll.hasAttribute('scroll-content-grid')) return;
        const onScrollEvent = onScrollEvent1;
        scroll.setAttribute('scroll-content-grid', '');
        const container = scroll.parentNode;
        let horizontal = container.querySelector('.ag-body-horizontal-scroll-viewport');
        let center = scroll.querySelector('.ag-center-cols-viewport');
        let centerContainer = center.querySelector('.ag-center-cols-container')
        let total = centerContainer.clientWidth;
        scroll.style.left = '0';
        horizontal.style.display = 'none';
        this.timerId = null;
        scroll.style.width = center.style.height = center.style.width = `calc(100% + ${scrollbarWidth()}px)`;
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
            div.style.top = '32px';
            div.style.display = 'none';
            bar1 = document.createElement('div');
            bar1.className = 'scrollBar';
            div.appendChild(bar1);
            container.appendChild(div);
        }
        bar1.style.height = (scroll.clientHeight / (scroll.scrollHeight / scroll.clientHeight)) + 'px';
        bar1.onmousedown = function(e) {
            e = e || window.event;
            bar1.topPos = e.clientY - bar1.offsetTop;
            document.body.classList.add('noSelect');
            document.onmouseup = function() {
                document.onmouseup = null;
                document.onmousemove = null;
                document.body.classList.remove('noSelect');
            };
            document.onmousemove = function(e) {
                e = e || window.event;
                let top = e.clientY - bar1.topPos;
                if (top < 0) top = 0;
                else if (top > container.clientHeight - bar1.clientHeight) top = container.clientHeight - bar1.clientHeight;
                scroll.scrollTop = top * (scroll.scrollHeight - scroll.clientHeight) / (bar1.parentNode.clientHeight - bar1.clientHeight);
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
        bar2.style.width = (center.clientWidth / (total / center.clientWidth)) + 'px';
        bar2.onmousedown = function(e) {
            e = e || window.event;
            bar2.leftPos = e.clientX - bar2.offsetLeft; //
            document.body.classList.add('noSelect');
            document.onmouseup = function() {
                document.onmouseup = null;
                document.onmousemove = null;
                document.body.classList.remove('noSelect');
            };
            document.onmousemove = function(e) {
                e = e || window.event;
                let left = e.clientX - bar2.leftPos;
                total = center.querySelector('.ag-center-cols-container').clientWidth;
                if (left < 0) left = 0;
                else if (left > container.clientWidth - bar2.clientWidth) left = bar2.parentNode.clientWidth - bar2.clientWidth;
                center.scrollLeft = left * (total - center.clientWidth) / (bar2.parentNode.clientWidth - bar2.clientWidth);
            };
        };

        scroll.onscroll = function() {
            if (scroll.onmousemove) scroll.onmousemove();
            bar1.style.top = (scroll.scrollTop * (bar1.parentNode.clientHeight - bar1.clientHeight) / (scroll.scrollHeight - scroll.clientHeight)) + 'px';
        };
        center.onscroll = function() {
            scroll.timmeout();
            total = center.querySelector('.ag-center-cols-container').clientWidth;
            bar2.style.left = (center.scrollLeft * (bar2.parentNode.clientWidth - bar2.clientWidth) / (total - center.clientWidth)) + 'px';
        }
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
                size += scroll.lastChild.clientHeight;
                size += scroll.lastChild.offsetTop;
                if (scroll.lastElementChild && scroll.lastElementChild.style.marginBottom) size += parseInt(scroll.lastElementChild.style.marginBottom);
            }
            if (scroll.parentNode) {
                if (this.size !== size) {
                    this.size = size;
                    const valHeight = size + 'px';
                    if (valHeight !== this.valHeight) {
                        this.valHeight = valHeight;
                        scroll.parentNode.style.height = valHeight;
                    }
                }
            }
            if (bar1.parentNode) {
                if (scroll.scrollHeight === scroll.clientHeight) {
                    if (this.scrollHeight !== scroll.scrollHeight || this.clientHeight !== scroll.clientHeight) {
                        if (this.bar1Display !== 'none') {
                            this.bar1Display = 'none';
                            bar1.parentNode.style.display = 'none';
                        }
                    }
                } else {
                    if (this.scrollHeight !== scroll.scrollHeight || this.clientHeight !== scroll.clientHeight) {
                        if (this.bar1Display !== '') {
                            this.bar1Display = '';
                            bar1.parentNode.style.display = '';
                        }
                    }
                    size = (scroll.clientHeight / (scroll.scrollHeight / scroll.clientHeight));
                    const height = (size < 32 ? 32 : size) + 'px';
                    const top = (scroll.scrollTop * (bar1.parentNode.clientHeight - bar1.clientHeight) / (scroll.scrollHeight - scroll.clientHeight)) + 'px';
                    if (this.top !== top || this.height !== height) {
                        this.top = top;
                        this.height = height;
                        bar1.style.height = height
                        bar1.style.top = top
                        onScrollEvent && onScrollEvent(true);
                        this.timerId && clearTimeout(this.timerId);
                        setTimeout(() => {
                            onScrollEvent(false);
                        }, 300);
                    }
                }
                this.scrollHeight = scroll.scrollHeight;
                this.clientHeight = scroll.clientHeight;
            }

            if (bar2.parentNode) {
                total = centerContainer.clientWidth;
                if (total <= center.clientWidth) {
                    if (this.total !== total || this.clientWidth !== center.clientWidth) {
                        if (this.bar2Display !== 'none') {
                            this.bar2Display = 'none'
                            bar2.parentNode.style.display = 'none';
                        }
                    }
                } else {
                    if (this.total !== total || this.clientWidth !== center.clientWidth) {
                        if (this.bar2Display !== '') {
                            this.bar2Display = ''
                            bar2.parentNode.style.display = '';
                        }
                    }
                    size = (center.clientWidth / (total / center.clientWidth));
                    const width = (size < 32 ? 32 : size) + 'px';
                    const left = (center.scrollLeft * (bar2.parentNode.clientWidth - bar2.clientWidth) / (total - center.clientWidth)) + 'px';
                    if (this.width !== width || this.left !== left) {
                        this.width = width;
                        this.left = left;
                        bar2.style.width = width;
                        bar2.style.left = left;
                    }
                }
                this.total = total;
                this.clientWidth = center.clientWidth;
            }
        };

        scroll.addEventListener('animationstart', (event) => {
            if (event && event.animationName !== 'nodeVisible') return;
            if (scroll && scroll.parentNode.querySelector('.ag-header-viewport')) {
                const headerContainer = scroll.parentNode.querySelector('.ag-header-container')
                if (headerContainer) {
                    headerContainer.style.transform = 'translateX(0px)';
                }
            }
            let bottomContainer = scroll.parentNode.querySelector('.ag-floating-bottom-container');
            if (bottomContainer) {
                bottomContainer.style.transform = 'translateX(0px)';
            }
            scroll.monitor()
        }, false);
        container.ro = new MutationObserver(scroll.monitor);
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
