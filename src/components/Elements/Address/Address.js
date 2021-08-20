import React from 'react';
import SvgIcon, { path } from '../../Inc/SvgIcon';
import Lang from '../../Inc/Lang';
import s from './Address.module.css';
import uuidv4 from 'uuid/v4';
import { getDropdownContentDom } from '../../../helper/functionUtils';
import { getData, getUrlSearchAddress, getUrlAddressAutocomplete } from '../../../helper/request'

const FAKE_DATA = [
    {
        'fullAddress': '105 ROLLINGHILLS DR, BRIGADOON WA 6069',
        'country': null,
        'postcode': '6069',
        'street2': null,
        'street': 'ROLLINGHILLS DR',
        'streetNumber': '105',
        'postal': '',
        'postalType': '',
        'postalNumber': '',
        'buildingName': '',
        'subdwelling': '',
        'eid': '881AA9AE13AF403E0BB6451D53C61211A3E25DC972B0B2A6',
        'lotNumber': '',
        'flatUnitNumber': '2313232',
        'flatUnitType': '',
        'floorLevelNumber': '',
        'floorLevelType': '',
        'streetSuffix': '',
        'streetType': 'DR',
        'streetName': 'ROLLINGHILLS',
        'attributes': {
            'Barcode': '1301012200011110012201321313032121113',
            'DPID': '80143181',
            'Bsp': '052',
            'PAFPosition': 'SINGLE'
        },
        'id': '80143181',
        'exception': null,
        'state': 'WA',
        'locality': 'BRIGADOON'
    }, {
        'fullAddress': '105 ROLLINGHILLS DR, BRIGADOON WA 6069',
        'country': null,
        'postcode': '6069',
        'street2': null,
        'street': 'ROLLINGHILLS DR',
        'streetNumber': '105',
        'postal': '',
        'postalType': '',
        'postalNumber': '',
        'buildingName': '',
        'subdwelling': '',
        'eid': '881AA9AE13AF403E0BB6451D53C61211A3E25DC972B0B2A6',
        'lotNumber': '',
        'flatUnitNumber': '2313232',
        'flatUnitType': '',
        'floorLevelNumber': '',
        'floorLevelType': '',
        'streetSuffix': '',
        'streetType': 'DR',
        'streetName': 'ROLLINGHILLS',
        'attributes': {
            'Barcode': '1301012200011110012201321313032121113',
            'DPID': '80143181',
            'Bsp': '052',
            'PAFPosition': 'SINGLE'
        },
        'id': '80143181',
        'exception': null,
        'state': 'WA',
        'locality': 'BRIGADOON'
    }
]

export default class Address extends React.Component {
    constructor(props) {
        super(props);
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.state = {
            reveal: false
        }
    }

    clickItemSuggest = (data) => {
        this.props.onChange && this.props.onChange(data)
        this.input && (this.input.value = data.full_address || '')
        this.disableDropdown();
    }

    componentDidMount() {
        document.addEventListener('click', e => {
            this.disableDropdown();
        })
        window.addEventListener('resize', this.onResize.bind(this))
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize.bind(this))
    }

    onResize() {
        if (this.floatContent) {
            const diffW = window.innerWidth - this.width
            const diffH = window.innerHeight - this.height
            const rect = this.floatContent.getBoundingClientRect()
            this.floatContent.style.left = rect.left + diffW / 2 + 'px'
            this.floatContent.style.top = rect.top + diffH / 2 + 'px'
            this.width = window.innerWidth
            this.height = window.innerHeight
        }
    }

    disableDropdown = () => {
        if (this.floatContent) this.floatContent.style.display = 'none';
    }

    renderSuggest = (listSearch) => {
        if (!listSearch || listSearch.length === 0) {
            if (this.input.value && this.input.value.length > 1) {
                return <div className='emptyListSuggest text-capitalize'>
                    <Lang>lang_no_data</Lang>
                </div>
            } else {
                return null
            }
        }
        return listSearch.map((item) => {
            return <div className={'itemSuggest'} key={uuidv4()} onClick={() => {
                this.clickItemSuggest(item)
            }}>
                {item.full_address}
            </div>
        })
    }

    renderSearchResultContent = (data) => {
        return (
            <div style={{
                position: 'fixed',
                minWidth: '520px',
                maxWidth: '100vw',
                overflow: 'auto',
                zIndex: '2500',
                textAlign: 'left'
            }} className={`searchSuggest size--3`} >
                {this.renderSuggest(data)}
            </div>
        )
    }

    async renderSearchResult(stringSearch) {
        let data = [];
        let url = getUrlAddressAutocomplete(stringSearch, this.props.envConfig);
        console.time('YOLO search address')
        console.time('YOLO render address')
        await getData(url).then((res) => {
            if (res.data && res.data.length) {
                if (res.data.length > 7) res.data.length = 7
                data = res.data
            }
        }).catch((err) => {
            console.log(err)
        })
        console.timeEnd('YOLO search address')
        if (this.floatContent) {
            let node = this.dom
            ReactDOM.render(this.renderSearchResultContent(data), this.floatContent);
            const rect = node.getBoundingClientRect();
            this.floatContent.style.position = 'absolute';
            this.floatContent.style.display = 'block';
            this.floatContent.style.minWidth = rect.innerWidth
            const top = rect.top + node.offsetHeight;
            const left = rect.left;
            const totalWidth = left + this.floatContent.offsetWidth;
            const spaceBottom = window.innerHeight - top
            if (rect.top > spaceBottom && spaceBottom < 100) {
                this.floatContent.style.bottom = (spaceBottom + node.offsetHeight) + 'px';
                this.floatContent.style.maxHeight = (rect.top > 336 ? 336 : rect.top) + 'px'
                this.floatContent.style.top = null;
            } else {
                this.floatContent.style.top = (rect.top + node.offsetHeight) + 'px';
                this.floatContent.style.bottom = null
                this.floatContent.style.maxHeight = (spaceBottom > 336 ? 336 : spaceBottom) + 'px'
            }
            if (totalWidth > window.innerWidth) {
                this.floatContent.style.left = (window.innerWidth - this.floatContent.offsetWidth) + 'px'
            } else {
                this.floatContent.style.left = rect.left + 'px';
            }
        } else {
            let node = this.dom
            let div = getDropdownContentDom()
            this.floatContent = document.createElement('div');
            div.appendChild(this.floatContent);
            ReactDOM.render(this.renderSearchResultContent(data), this.floatContent);
            const rect = node.getBoundingClientRect();
            this.floatContent.style.position = 'absolute';
            this.floatContent.style.display = 'block';
            this.floatContent.style.minWidth = rect.innerWidth
            const top = rect.top + node.offsetHeight;
            const left = rect.left;
            const totalWidth = left + this.floatContent.offsetWidth;
            const spaceBottom = window.innerHeight - top
            if (rect.top > spaceBottom && spaceBottom < 100) {
                this.floatContent.style.bottom = (spaceBottom + node.offsetHeight) + 'px';
                this.floatContent.style.maxHeight = (rect.top > 336 ? 336 : rect.top) + 'px'
                this.floatContent.style.top = null;
            } else {
                this.floatContent.style.top = (rect.top + node.offsetHeight) + 'px';
                this.floatContent.style.bottom = null
                this.floatContent.style.maxHeight = (spaceBottom > 336 ? 336 : spaceBottom) + 'px'
            }
            if (totalWidth > window.innerWidth) {
                this.floatContent.style.left = (window.innerWidth - this.floatContent.offsetWidth) + 'px'
            } else {
                this.floatContent.style.left = rect.left + 'px';
            }
        }
        console.timeEnd('YOLO render address')
    }

    onChange = (e) => {
        const stringSearch = e.target.value
        this.timeoutId && clearTimeout(this.timeoutId)
        this.timeoutId = setTimeout(() => {
            if (stringSearch.length > 2) {
                this.renderSearchResult(stringSearch)
            } else if (stringSearch.length === 0) {
                this.clickItemSuggest({})
                this.disableDropdown()
            }
        }, 333);
    }

    onFocus = () => {
        this.oldValue = this.input.value
        this.input && (this.input.value = '')
    }

    onBlur = () => {
        this.input && (this.input.value = this.oldValue)
    }

    render() {
        const inputProps = { ...this.props };
        delete inputProps.style;
        delete inputProps.className;
        delete inputProps.placeholder;
        delete inputProps.onChange;
        return <div className={s.input + (this.props.className ? ' ' + this.props.className : '')} style={this.props.style} ref={dom => this.dom = dom}>
            <input ref={ref => this.input = ref} {...inputProps} onFocus={this.onFocus} onBlur={this.onBlur} onChange={this.onChange} required />
            <div className={s.border1}></div>
            <div className={s.border2}></div>
            <div className={s.placeholder + ' ' + 'text-capitalize'}>{this.props.placeholder}{this.props.required ? ' *' : ''}</div>
        </div>
    }
}
