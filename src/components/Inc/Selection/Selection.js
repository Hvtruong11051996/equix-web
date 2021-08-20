import React from 'react';
import s from './Selection.module.css'
import Icon from '../Icon';

class Selection extends React.Component {
    constructor(props) {
        super(props);
        this.dicDom = {}
        this.value = this.props.value || (this.props.option && this.props.option[0].value)
    }
    prevBtn = () => {
        const index = this.props.option && this.props.option.findIndex(item => item.value === this.value)
        if (index < 1) return
        this.value = this.props.option[index - 1].value
        const dom = this.dicDom[this.value]
        dom.parentNode.style.marginLeft = -dom.offsetLeft + 'px';
        // dom.parentNode.parentNode.style.width = dom.clientWidth + 'px'
        this.props.onChange(this.value)
    };
    fillWidth = () => {
        if (this.defaultDom && this.defaultDom.parentNode) this.defaultDom.style.width = this.defaultDom.parentNode.parentNode.clientWidth + 'px';
        if (!this.props.option) return;
        this.props.option.length && this.props.option.map(item => {
            if (this.dicDom[item.value] && this.dicDom[item.value].parentNode) this.dicDom[item.value].style.width = this.dicDom[item.value].parentNode.parentNode.clientWidth + 'px';
        })
    }
    nextBtn = () => {
        const index = this.props.option && this.props.option.findIndex(item => item.value === this.value)
        if (index >= this.props.option.length - 1) return
        this.value = this.props.option[index + 1].value
        const dom = this.dicDom[this.value]
        dom.parentNode.style.marginLeft = -dom.offsetLeft + 'px';
        // dom.parentNode.parentNode.style.width = dom.clientWidth + 'px'
        this.props.onChange(this.value)
    }
    renderValue = () => {
        return (<div className={s.middle}>
            <div className={s.list}>
                {this.props.option && this.props.option.length ? this.props.option.map((item, index) => {
                    return <div key={index} ref={dom => this.dicDom[item.value] = dom}>{item.label}</div>
                }) : <div ref={dom => this.defaultDom = dom}> - - </div>}
            </div>
        </div >)
    }
    render() {
        const isDisableBtnPre = !this.props.option || !this.props.option.length || this.props.option.findIndex(item => item.value === this.value) < 1
        const isDisableBtnNext = !this.props.option || !this.props.option.length || this.props.option.findIndex(item => item.value === this.value) > this.props.option.length - 2
        return <div className={s.selection}>
            <div className={s.left + (isDisableBtnPre ? ' ' + s.disabled : '')} onClick={() => this.prevBtn()}><Icon src='image/navigate-before' /></div>
            {this.renderValue()}
            <div className={s.right + (isDisableBtnNext ? ' ' + s.disabled : '')} onClick={() => this.nextBtn()}><Icon src='image/navigate-next' /></div>
        </div>
    }
    componentWillReceiveProps(nextProps) {
        if (this.value !== nextProps.value) this.value = nextProps.value;
        if (this.value === undefined) this.value = nextProps.option && nextProps.option[0].value
        setTimeout(() => {
            this.fillWidth();
            const dom = this.dicDom[this.value] || this.defaultDom
            if (dom && dom.parentNode && dom.parentNode.parentNode) {
                dom.parentNode.style.marginLeft = -dom.offsetLeft + 'px';
                // dom.parentNode.parentNode.style.width = dom.clientWidth + 'px'
            }
        }, 10);
    }
    componentDidMount() {
        this.fillWidth();
        const dom = this.dicDom[this.value] || this.defaultDom
        if (dom && dom.parentNode && dom.parentNode.parentNode) {
            dom.parentNode.style.marginLeft = -dom.offsetLeft + 'px';
            // dom.parentNode.parentNode.style.width = dom.clientWidth + 'px'
        }
    }
}
export default Selection;
