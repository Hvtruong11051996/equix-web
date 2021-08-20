import React, { useEffect, useState, useRef } from 'react';
const NumberInput = (props) => {
    const [value, setValue] = useState(props.value || '')

    useEffect(() => {
        setValue(props.value || '')
    }, [props.value])

    const handleKeyPress = (event) => {
        try {
            if (event.key === 'Enter') {
                props.onKeyPress && props.onKeyPress()
            }
        } catch (error) {
            console.error('handleKeyPress On String field' + error)
        }
    }

    if (props.schema.disable) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '24px',
                border: '1px solid var(--border)',
                paddingRight: '8px',
                cursor: 'not-allowed',
                boxSizing: 'border-box'
            }}>{value}</div>
        )
    }
    if (!props.editable) {
        return (
            <div style={{ paddingLeft: 0, paddingRight: 0 }}>
                <div className={`box-overflow`}>
                    <div style={{ paddingLeft: 0, paddingRight: 0 }} className={`showTitle text-overflow`}>{value || '--'}</div>
                </div>
            </div >
        )
    }
    return <div>
        <input
            autoComplete='off'
            ref={dom => props.setDom(dom)}
            onChange={e => {
                if (isNaN(e.target.value)) {
                    props.onChange(e.target.value)
                } else {
                    props.onChange(Number(e.target.value))
                }
                setValue(e.target.value);
            }}
            maxLength={props.schema.rules && props.schema.rules.max ? props.schema.rules.max : 1000}
            defaultValue={value}
            onKeyPress={handleKeyPress}
            onFocus={() => props.onFocus()}
            onBlur={() => props.onBlur()}
            name={props.name} />
    </div>
}
export default NumberInput;
