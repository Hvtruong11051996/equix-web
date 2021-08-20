import React, { useEffect, useState, useRef } from 'react';
import { getDropdownContentDom } from '../../../../helper/functionUtils';
import Lang from '../../../Inc/Lang';
import uuidv4 from 'uuid/v4';
import s from '../Form.module.css'

const AutoCompleteSearch = (props) => {
    const [value, setValue] = useState('')
    const oldValue = useRef('')
    const [editMode, setEditMode] = useState(!!props.editable)
    const that = useRef({})
    const dom = useRef();
    const clickItemSuggest = (data) => {
        that.current.click = true
        setValue(data.value)
        oldValue.current = data.value
        props.data[`${props.schema.prefix}id`] = data.value;
        props.onChange && props.onChange(data.value)
        disableDropdown();
    }

    const onChangeInput = (stringSearch) => {
        // oldValue.current = stringSearch
        setValue(stringSearch)
        that.current.timeoutId && clearTimeout(that.current.timeoutId)
        that.current.timeoutId = setTimeout(() => {
            if (stringSearch.length > 1) {
                renderSearchDropDown(stringSearch.toUpperCase())
            } else if (stringSearch.length === 0) {
                clickItemSuggest({ label: '' })
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

    const renderSuggest = (listSearch, stringSearch) => {
        if (!listSearch || listSearch.length === 0) {
            if (stringSearch && stringSearch.length > 1) {
                return <div className={`emptyListSuggest text-capitalize`} style={{ minHeight: '32px' }}>
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
                {item.label}
            </div>
        })
    }

    const renderSearchResultContent = (data, stringSearch) => {
        return (
            <div className={`searchSuggest size--3`} >
                {data ? renderSuggest(data, stringSearch) : <img src='common/Spinner-white.svg' style={{ display: 'block', margin: 'auto', padding: '8px' }} />}
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
        if (that.current.floatContent) {
            that.current.floatContent.style.position = 'absolute';
            that.current.floatContent.style.display = 'block';
            that.current.floatContent.style.minWidth = rect.width + 'px';
            that.current.floatContent.style.bottom = null;
            that.current.floatContent.style.top = (rect.top + node.offsetHeight) + 'px';
            that.current.floatContent.style.left = rect.left + 'px';
            ReactDOM.render(renderSearchResultContent(), that.current.floatContent);
        }
        const allData = props.schema.options
        for (let i = 1; i < allData.length; i++) {
            const e = allData[i];
            if (e.label.includes(stringSearch) || e.value.includes(stringSearch)) data.push(e)
        }
        ReactDOM.render(renderSearchResultContent(data, stringSearch), that.current.floatContent);
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
            that.current.floatContent.style.maxHeight = (spaceBottom > 336 ? 336 : spaceBottom - 8) + 'px'
        }
        if (totalWidth > window.innerWidth) {
            that.current.floatContent.style.left = (window.innerWidth - that.current.floatContent.offsetWidth) + 'px'
        } else {
            that.current.floatContent.style.left = rect.left + 'px';
        }
    }

    useEffect(() => {
        if (props.value) that.current.click = true
        setValue(props.value || '')
        oldValue.current = props.value
    }, [props.value])
    useEffect(() => {
        if (props.editable !== editMode) {
            setEditMode(!!props.editable)
        }
    }, [props.editable])

    const getValue = () => {
        if (props.schema.options && !that.current.isFocus && that.current.click) {
            const displayValue = props.schema.options.find(e => e.value === value)
            if (displayValue) {
                setValue(displayValue.label)
                oldValue.current = displayValue.label
            }
        }
        return value
    }

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
        that.current.isFocus = true
        setValue('')
        props.onFocus()
    }
    const onBlur = () => {
        that.current.isFocus = false
        that.current.click = false
        setValue(oldValue.current)
        props.onBlur()
    }

    return <input
        ref={d => {
            props.setDom(d)
            dom.current = d
        }}
        className='align-right input-filter'
        placeholder=''
        value={getValue()}
        onChange={(event) => {
            onChangeInput(event.target.value)
        }}
        onFocus={() => onFocus()}
        onBlur={() => onBlur()}
    ></input>
}
export default AutoCompleteSearch;
