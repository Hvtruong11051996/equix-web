import React from 'react';
import Icon from '../Icon';
import Lang from '../Lang';
import dataStorage from '../../../dataStorage';
import logger from '../../../helper/log';
import env from '../../../constants/enviroments'
import { makeNewsUrl } from '../../../helper/request'
class Pdf extends React.Component {
    constructor(props) {
        super(props);
        this.back = this.back.bind(this);
        this.state = { link: '' }
        this.setLoading = this.setLoading.bind(this)
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
    setLoading(isLoading) {
        const loading = document.querySelector('#qePdf .loadingNews');
        const noData = document.querySelector('#qePdf .qe-pdf-no-attachment');
        if (isLoading) {
            loading && (loading.style.display = 'flex')
            noData && (noData.style.display = 'none')
        } else {
            const isNodata = !this.state.link || !this.props.data || (!this.props.data.page_count && !this.props.pageCount)
            loading && (loading.style.display = 'none')
            isNodata && noData && (noData.style.display = 'flex')
        }
    }
    setPageFirtTime() {
        ReactDOM.render(<span className='text-capitalize'><Lang>lang_page</Lang> {1} / {(this.props.data && this.props.data.page_count) || 0}</span>, document.querySelector('#qePdf .pageCount'));
    }
    setOnScroll = () => {
        try {
            if (this.doc) {
                let queryScroll = this.doc.contentDocument.querySelector('#viewerContainer');
                const input = this.doc.contentDocument.querySelector('#pageNumber');
                if (queryScroll && input) {
                    queryScroll.onscroll = () => {
                        if (input) {
                            if (input.value !== input.oldValue) {
                                ReactDOM.render(<span className='text-capitalize'><Lang>lang_page</Lang> {input.value} / {input.getAttribute('max')}</span>, document.querySelector('#qePdf .pageCount'))
                            }
                            input.oldValue = input.value;
                        }
                    };
                    queryScroll.onclick = this.back;
                }
                this.doc.contentDocument.addEventListener('textlayerrendered', (_event) => {
                    queryScroll.onscroll();
                });
            }
        } catch (error) {
            logger.error('setPageCount On MyPdfViewer' + error)
        }
    }
    setUrlIframe = (link, viewer) => {
        const qeIframe = viewer.querySelector('iframe');
        if (qeIframe) {
            qeIframe.onunload = () => this.setLoading(true)
            if (!link) {
                qeIframe.src = '';
                this.showHideViewer(false);
                this.setLoading(false)
            } else {
                if (this.blobLink) {
                    if (qeIframe.src === 'pdfjs/web/viewer.html?file=' + link) {
                        this.showHideViewer(true);
                        this.setLoading(false);
                    } else {
                        qeIframe.src = 'pdfjs/web/viewer.html?file=' + link;
                        this.setPageFirtTime();
                        this.showHideViewer(true);
                        qeIframe.onload = () => {
                            this.setLoading(false);
                            this.setOnScroll();
                        }
                    }
                }
            }
        }
        if (this.props.data && !this.props.data.page_count && !this.props.pageCount) {
            this.showHideViewer(true)
            this.setLoading(false)
        }
    }
    showHideViewer = (bol) => {
        let div = document.getElementById('preview');
        if (!div) {
            div = document.createElement('div');
            div.id = 'preview';
            document.body.appendChild(div);
        }
        const viewer = document.getElementById('qePdf');
        if (viewer) {
            viewer.style.display = bol ? '' : 'none';
        }
    }
    setAction(viewer) {
        if (viewer) {
            if (!this.props.data) {
                const qeIframe = viewer.querySelector('iframe');
                if (qeIframe) qeIframe.src = '';
                this.wait = false;
                document.removeEventListener('keydown', this.back);
                this.showHideViewer(false);
                return null;
            }
            (viewer.querySelector('#closePDFFull') || {}).onclick = this.props.back.bind(this);
            (viewer.querySelector('#qe-pdf-print') || {}).onclick = this.print.bind(this);
            (viewer.querySelector('#qe-pdf-downLoad') || {}).onclick = this.download.bind(this);
            (viewer.querySelector('#qe-pdf-zoomOut') || {}).onclick = this.zoomOut.bind(this);
            (viewer.querySelector('#qe-pdf-zoomIn') || {}).onclick = this.zoomIn.bind(this);
            this.setUrlIframe(this.state.link, viewer);
            return null;
        }
    }

    isNews = (data) => {
        return data.news_id
    }

    revokeLink = () => {
        if (this.state.link) {
            URL.revokeObjectURL(this.state.link)
            this.blobLink = ''
        }
    }

    componentWillReceiveProps = (props) => {
        if (props.data) {
            if (props.data.link) {
                this.setLoading(true)
                if (props.data.link !== this.currentLink) {
                    this.currentLink = props.data.link
                    this.revokeLink()
                    let url = props.data.link
                    if (this.isNews(props.data)) url = makeNewsUrl(`stream/${props.data.link}`)
                    const req = new XMLHttpRequest()
                    req.open('GET', url)
                    req.responseType = 'blob'
                    const isGoogleStorageLink = (props.data.link + '').includes('https://storage.googleapis.com')
                    isGoogleStorageLink || req.setRequestHeader('Authorization', 'Bearer ' + dataStorage.accessToken)
                    req.onreadystatechange = () => {
                        if (req.readyState === 4 && req.status === 200) {
                            var fileURL = URL.createObjectURL(req.response);
                            this.blobLink = fileURL
                            this.setState({ link: fileURL })
                        }
                    };
                    req.send();
                }
            } else {
                this.revokeLink()
                this.setState({ link: '' })
            }
        }
    }
    render() {
        try {
            let div = document.getElementById('preview');
            if (!div) {
                div = document.createElement('div');
                div.id = 'preview';
                document.body.appendChild(div);
            }
            const viewer = document.getElementById('qePdf');
            this.setAction(viewer);
            this.props.data && ReactDOM.render(
                <div id='qePdf' ref={root => {
                    this.setAction(root)
                }} style={this.props.style || { position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 2000 }}>
                    <div className='pdfHeader'>
                        <div id='closePDFFull' className='icon'>
                            <Icon src={'navigation/arrow-back'} />
                        </div>
                        <div className='text size--4'>{this.props.data.title || this.props.data.link || this.props.title}</div>
                        {
                            this.state.link && (this.props.data.page_count || this.props.pageCount) ? [
                                <div key='printIcon' id='qe-pdf-print' className='icon'><Icon src={'action/print'} /></div>,
                                <div key='downloadIcon' id='qe-pdf-downLoad' className='icon'><Icon src={'file/file-download'} /></div>
                            ] : ''
                        }
                    </div>
                    <div className='loadingNews'><Spinner /></div>
                    < div className='pdfContent' >
                        {
                            this.state.link && (this.props.data.page_count || this.props.pageCount)
                                ? <iframe
                                    id='qe-pdf-iFrame'
                                    ref={(doc) => this.doc = doc}
                                    style={{ width: '100%', height: '100%' }}
                                    src={'pdfjs/web/viewer.html?file=' + this.state.link}
                                    frameBorder="0"
                                    onLoad={() => {
                                        this.setOnScroll()
                                        this.setLoading(false)
                                    }
                                    }
                                />
                                : <div className='qe-pdf-no-attachment'>
                                    <Lang>lang_no_data</Lang>
                                </div>
                        }
                    </div >
                    {
                        this.state.link
                            ? <div className='pdfToolbar'>
                                <div>
                                    <div className='pageCount size--4'></div>
                                    <div>
                                        <div id='qe-pdf-zoomOut'><Icon src={'content/remove'} /></div>
                                        <div><Icon src={'action/search'} /></div>
                                        <div id='qe-pdf-zoomIn'><Icon src={'content/add'} /></div>
                                    </div>
                                </div>
                            </div>
                            : null
                    }
                </div >,
                div
            )
            return null;
        } catch (error) {
            logger.error('render On MyPdfViewer' + error);
            return null;
        }
    }
    componentDidMount() {
        try {
            document.addEventListener('keydown', this.back);
            this.setOnScroll()
            this.setLoading(true);
        } catch (error) {
            logger.error('componentDidMount On MyPdfViewer' + error)
        }
    }

    componentWillUnmount() {
        try {
            this.wait = false;
            document.removeEventListener('keydown', this.back);
            this.revokeLink()
        } catch (error) {
            logger.error('componentWillUnmount On MyPdfViewer' + error)
        }
    }
}

export default Pdf;

const Spinner = () => {
    return <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
}
