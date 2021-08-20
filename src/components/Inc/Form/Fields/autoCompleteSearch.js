import React, { useEffect, useState, useRef } from 'react';
import { getDropdownContentDom } from '../../../../helper/functionUtils';
import Lang from '../../../Inc/Lang';
import uuidv4 from 'uuid/v4';
import { getData, getUrlAddressAutocomplete } from '../../../../helper/request'

const FAKE_DATA = [
    {
        'full_address': '105 ROLLINGHILLS DR, BRIGADOON WA 6069',
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
        'full_address': '105 ROLLINGHILLS DR, BRIGADOON WA 6069',
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

const AutoCompleteSearch = (props) => {
    const [value, setValue] = useState('')
    const oldValue = useRef('')
    const [editMode, setEditMode] = useState(!!props.editable)
    const that = useRef({})
    const dom = useRef();
    const clickItemSuggest = (data) => {
        setValue(data.full_address)
        oldValue.current = data.full_address
        // props.data[`${props.schema.prefix}street_number`] = data.streetNumber || '';
        // props.data[`${props.schema.prefix}unit_flat_number`] = data.flatUnitNumber || '';
        // props.data[`${props.schema.prefix}street_name`] = data.streetName || '';
        // props.data[`${props.schema.prefix}street_type`] = data.streetType || '';
        // props.data[`${props.schema.prefix}city_suburb`] = data.locality || '';
        // props.data[`${props.schema.prefix}state`] = data.state || '';
        // props.data[`${props.schema.prefix}postcode`] = data.postcode || '';
        props.data[`${props.schema.prefix}id`] = data.id;
        props.onChange && props.onChange(data.full_address)
        disableDropdown();
    }
    const onChangeInput = (stringSearch) => {
        setValue(stringSearch)
        that.current.timeoutId && clearTimeout(that.current.timeoutId)
        that.current.timeoutId = setTimeout(() => {
            if (stringSearch.length > 2) {
                renderSearchDropDown(stringSearch)
            } else if (stringSearch.length === 0) {
                clickItemSuggest({ full_address: '' })
                disableDropdown()
            }
        }, 200);
    }

    const disableDropdown = () => {
        if (that.current.floatContent) that.current.floatContent.style.display = 'none';
    }

    const handleClickOutside = target => {
        if (that.current.floatContent && (!that.current.floatContent.contains(target) || dom.current.contains(target))) {
            disableDropdown()
        }
    }

    const renderSuggest = (listSearch) => {
        if (!listSearch || listSearch.length === 0) {
            if (value && value.length > 1) {
                return <div className='emptyListSuggest text-capitalize'>
                    <Lang>lang_no_data</Lang>
                </div>
            } else {
                return null
            }
        }
        return listSearch.map((item) => {
            return <div className={'itemSuggest'} key={uuidv4()} onClick={() => {
                clickItemSuggest(item)
            }}>
                {item.full_address}
            </div>
        })
    }

    const renderSearchResultContent = (data) => {
        return (
            <div className={`searchSuggest size--3`} >
                {data ? renderSuggest(data) : <img src='common/Spinner-white.svg' style={{ display: 'block', margin: 'auto', padding: '8px' }} />}
            </div>
        )
    }
    const renderSearchDropDown = async (stringSearch) => {
        let data = [];
        if (!that.current.floatContent) {
            let div = getDropdownContentDom()
            that.current.floatContent = document.createElement('div');
            div.appendChild(that.current.floatContent);
        }
        let node = dom.current
        const rect = node.getBoundingClientRect();
        let url = getUrlAddressAutocomplete(stringSearch);
        if (that.current.floatContent) {
            that.current.floatContent.style.position = 'absolute';
            that.current.floatContent.style.display = 'block';
            that.current.floatContent.style.minWidth = rect.width + 'px';
            that.current.floatContent.style.bottom = null;
            that.current.floatContent.style.top = (rect.top + node.offsetHeight) + 'px';
            that.current.floatContent.style.left = rect.left + 'px';
            ReactDOM.render(renderSearchResultContent(), that.current.floatContent);
        }
        await getData(url).then((res) => {
            if (res.data && res.data.length) {
                console.log(res);
                if (res.data.length > 7) res.data.length = 7
                data = res.data
            }
        }).catch((err) => {
            console.log(err)
        })
        ReactDOM.render(renderSearchResultContent(data), that.current.floatContent);
        const top = rect.top + node.offsetHeight;
        const left = rect.left;
        const totalWidth = left + that.current.floatContent.offsetWidth;
        const spaceBottom = window.innerHeight - top
        if (rect.top > spaceBottom && spaceBottom < 100) {
            that.current.floatContent.style.bottom = (spaceBottom + node.offsetHeight) + 'px';
            that.current.floatContent.style.maxHeight = (rect.top > 336 ? 336 : rect.top) + 'px'
            that.current.floatContent.style.top = null;
        } else {
            that.current.floatContent.style.top = (rect.top + node.offsetHeight) + 'px';
            that.current.floatContent.style.bottom = null
            that.current.floatContent.style.maxHeight = (spaceBottom > 336 ? 336 : spaceBottom) + 'px'
        }
        if (totalWidth > window.innerWidth) {
            that.current.floatContent.style.left = (window.innerWidth - that.current.floatContent.offsetWidth) + 'px'
        } else {
            that.current.floatContent.style.left = rect.left + 'px';
        }
    }

    useEffect(() => {
        // if (props.value) {
        setValue(props.value || '')
        // }
    }, [props.value])
    useEffect(() => {
        if (props.editable !== editMode) {
            setEditMode(!!props.editable)
        }
    }, [props.editable])

    useEffect(() => {
        document.addEventListener('mousedown', (e) => {
            handleClickOutside(e.target)
        })
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [])
    if (props.schema && props.schema.disable) return <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{value} </div>
    if (!editMode) {
        return <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{value} </div>
    }

    const onFocus = () => {
        setValue('')
        props.onFocus()
    }
    const onBlur = () => {
        setValue(oldValue.current)
        props.onBlur()
    }
    return <input
        ref={d => {
            props.setDom(d)
            dom.current = d
        }}
        className='align-right'
        placeholder='Address'
        value={value}
        onChange={(event) => {
            onChangeInput(event.target.value)
        }}
        onFocus={() => onFocus()}
        onBlur={() => onBlur()}
    ></input>
}
export default AutoCompleteSearch;
