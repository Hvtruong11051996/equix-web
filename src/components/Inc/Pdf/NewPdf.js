import React from 'react';
import Lang from '../Lang';
import dataStorage from '../../../dataStorage';
import logger from '../../../helper/log';
import { checkPropsStateShouldUpdate } from '../../../helper/functionUtils';
import { translate } from 'react-i18next';
class NewPdf extends React.Component {
    constructor(props) {
        super(props);
        this.back = this.back.bind(this)
        this.rootPdf = null;
        this.state = {
            data: props.data,
            loading: true
        };
        this.print = this.print.bind(this);
        this.download = this.download.bind(this);
        props.url && (dataStorage.printFunc[props.url] = this.print);
        props.url && (dataStorage.downloadFunc[props.url] = this.download);
    }

    componentWillReceiveProps(nextProps) {
        try {
            nextProps.url && (dataStorage.printFunc[nextProps.url] = this.print);
            nextProps.url && (dataStorage.downloadFunc[nextProps.url] = this.download);
            if (nextProps.data !== this.state.data) {
                this.setState({
                    data: nextProps.data
                })
            }
        } catch (error) {
            logger.error('componentWillReceiveProps On MyPdfViewer' + error)
        }
    }

    back(e) {
        try {
            const dom = e.target;
            const key = e.key || '';
            if (key && key === 'Escape') {
                if (typeof this.props.back === 'function') this.props.back();
            }
            if (!this.props.noBack) {
                if (dom.className === 'pdfViewer' || dom.id === 'closePDFFull') {
                    if (typeof this.props.back === 'function') this.props.back();
                }
            }
        } catch (error) {
            logger.error('back On MyPdfViewer' + error)
        }
    }

    print() {
        try {
            if (this.doc) {
                this.doc.contentDocument.querySelector('#print').click();
            }
        } catch (error) {
            logger.error('print On MyPdfViewer' + error)
        }
    }

    download() {
        try {
            if (this.doc) {
                this.doc.contentDocument.querySelector('#download').click();
            }
        } catch (error) {
            logger.error('download On MyPdfViewer' + error)
        }
    }

    zoomIn() {
        try {
            if (this.doc) {
                this.doc.contentDocument.querySelector('#zoomIn').click();
            }
        } catch (error) {
            logger.error('zoomIn On MyPdfViewer' + error)
        }
    }

    zoomOut() {
        try {
            if (this.doc) {
                this.doc.contentDocument.querySelector('#zoomOut').click();
            }
        } catch (error) {
            logger.error('zoomOut On MyPdfViewer' + error)
        }
    }

    setPageCount() {
        try {
            const that = this;
            this.wait = true;
            this.setState({ loading: true });
            (async () => {
                while (this.wait && (!this.doc || !this.doc.contentDocument.querySelector('#viewerContainer'))) {
                    await (new Promise(resolve => {
                        setTimeout(resolve, 100);
                    }));
                }
                if (this.doc) {
                    let queryScroll = this.doc.contentDocument.querySelector('#viewerContainer');
                    const input = that.doc.contentDocument.querySelector('#pageNumber');
                    queryScroll.onscroll = () => {
                        if (input) {
                            if (input.value !== input.oldValue) {
                                ReactDOM.render(<span className='text-capitalize'><Lang>lang_page</Lang> {input.value} / {input.getAttribute('max')}</span>, that.rootPdf.querySelector('.pageCount'))
                            }
                            input.oldValue = input.value;
                            this.setState({ loading: false });
                        }
                    };
                    queryScroll.onclick = this.back;
                    this.doc.contentDocument.addEventListener('textlayerrendered', (_event) => {
                        queryScroll.onscroll();
                    });
                }
            })();
        } catch (error) {
            logger.error('setPageCount On MyPdfViewer' + error)
        }
    }

    componentDidMount() {
        try {
            document.addEventListener('keydown', this.back)
        } catch (error) {
            logger.error('componentDidMount On MyPdfViewer' + error)
        }
    }

    componentWillUnmount() {
        try {
            this.wait = false;
            document.removeEventListener('keydown', this.back)
        } catch (error) {
            logger.error('componentWillUnmount On MyPdfViewer' + error)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        try {
            if (dataStorage.checkUpdate) {
                return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state)
            }
            return true;
        } catch (error) {
            logger.error('shouldComponentUpdate On MyPdfViewer', error)
        }
    }

    render() {
        try {
            return this.state.data
                ? (<div ref={root => this.rootPdf = root} className='pdfContent report' >
                    {
                        this.state.data.link
                            ? <iframe
                                ref={(doc) => this.doc = doc}
                                style={{ width: '100%', height: '100%' }}
                                src={'pdfjs/web/viewer.html?file=' + this.state.data.link}
                                frameBorder="0"
                            // sandbox="allow-pointer-lock allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation"
                            />
                            : <div className='text-capitalize' style={{ color: 'var(--secondary-default)' }}><Lang>lang_no_attachment</Lang></div>
                    }
                </div >) : null
        } catch (error) {
            logger.error('render On MyPdfViewer' + error)
        }
    }
}

export default translate('translations')(NewPdf);
