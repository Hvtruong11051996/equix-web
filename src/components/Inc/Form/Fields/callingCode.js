import React, { useEffect, useReducer } from 'react';
import DropDown from '../../../DropDown/DropDown';
import callList from '../../../../constants/calling_code'
import s from '../Form.module.css'

const reducer = (state, action) => {
    switch (action.type) {
        case 'setData':
            let arrData = action.data.split('|')
            let phoneCode = '+' + ((callList.find(x => x.value === arrData[0].toLowerCase())) || { phoneCode: 61 }).phoneCode
            return {
                ...state,
                Ddvalue: arrData[0] && arrData[1] ? arrData[0] : 'au',
                phoneCode: phoneCode,
                inputValue: arrData[1]
            }
        case 'updateDd':
            return {
                ...state,
                Ddvalue: action.data,
                phoneCode: '+' + (callList.filter(x => x.value === action.data)[0]).phoneCode
            }
        case 'updateInput':
            return {
                ...state,
                inputValue: action.data
            }
        case 'updateDisable':
            return {
                ...state,
                disable: action.data
            }
        default:
            return {
                ...state,
                ...action.data
            }
    }
}

const CallingCode = (props) => {
    const [state, dispatch] = useReducer(reducer, { Ddvalue: 'au', phoneCode: '+61', inputValue: '', disable: !!props.schema.disable, isEditMode: !!props.editable })
    useEffect(() => {
        if (props.value) {
            dispatch({ type: 'setData', data: props.value })
        }
    }, [props.value])
    // useEffect(() => {
    //     props.onChange && props.onChange(`${state.Ddvalue}|${state.inputValue}`)
    // }, [])

    useEffect(() => {
        if (props.schema.disable !== state.disable) {
            dispatch({ type: 'updateDisable', data: !!props.schema.disable })
        }
    }, [props.schema.disable])
    useEffect(() => {
        if (props.editable !== state.isEditMode) {
            dispatch({ type: 'test', data: { isEditMode: props.editable } })
        }
    }, [props.editable])

    const onChangeDd = (data) => {
        dispatch({ type: 'updateDd', data })
        if (state.inputValue !== '') props.onChange && props.onChange(`${data}|${state.inputValue}`)
        else props.onChange && props.onChange('')
    }
    const onChangeInput = data => {
        dispatch({ type: 'updateInput', data })
        if (data !== '') props.onChange && props.onChange(`${state.Ddvalue}|${data}`)
        else props.onChange && props.onChange('')
    }

    if (state.disable) {
        if (props.schema.disableNoBorder) return <div style={{ display: 'flex', justifyContent: 'flex-end' }}><div>{state.phoneCode}</div> <div>{state.inputValue}</div> </div>
        return <div style={{ display: 'flex', justifyContent: 'flex-end', border: '1px solid var(--border)' }}><div>{state.phoneCode}</div> <div>{state.inputValue}</div> </div>
    } else if (state.isEditMode) {
        return (
            <div style={{ paddingLeft: 0, paddingRight: 0 }} className='box-overflow'>
                <div className='content size--3'>
                    <div style={{ display: 'flex' }}>
                        <div className='callingDropdown'>
                            <DropDown
                                options={callList}
                                hideKey={true}
                                value={state.Ddvalue || 'au'}
                                onChange={onChangeDd}
                                position='left'
                            />
                        </div>
                        <div className={s.phoneCode}>
                            {state.phoneCode}
                        </div>
                        <input
                            className='align-right'
                            placeholder={props.schema.placeholder || 'Phone'}
                            ref={dom => {
                                props.setDom(dom)
                            }}
                            maxLength={16}
                            onBlur={() => props.onBlur()}
                            onFocus={() => props.onFocus()}
                            value={state.inputValue}
                            onChange={(event) => {
                                onChangeInput(event.target.value)
                            }}
                            style={{ borderLeft: '0px' }}
                        ></input>
                    </div>
                </div>
            </div>
        )
    } else {
        return <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{state.phoneCode} {state.inputValue} </div>
    }
}
export default CallingCode;
