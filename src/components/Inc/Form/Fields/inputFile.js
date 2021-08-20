import React, { useEffect, useState, useRef } from 'react';
import SvgIcon, { path } from '../../SvgIcon'
import dataStorage from '../../../../dataStorage'
import s from '../Form.module.css'
import { FIELD } from '../../../OpeningAccount/constant'

const InputFile = (props) => {
    const [value, setValue] = useState(props.data[props.name + '' + FIELD.DOCUMENT_NAME] || '')
    const dom = useRef();
    const data = useRef(props.data[FIELD.DOCUMENT_TYPE]);

    let active = 0
    const mouseMove = (e) => {
        if (dom) {
            if (dom.current.previousSibling.contains(e.target)) {
                if (active === 0) {
                    active = 1;
                    props.onFocus();
                }
            } else {
                if (active === 1) {
                    active = 0
                    props.onBlur()
                }
            }
        }
    }
    useEffect(() => {
        document.addEventListener('mousemove', mouseMove);
        // if (props.value != value && !props.noSetDefault) props.onChange(value);
        if (props.schema && props.schema.follow === 'document_type' && data.current !== props.data[FIELD.DOCUMENT_TYPE]) {
            dom.current.value = ''
            setValue('')
            props.data[props.name + '' + FIELD.DOCUMENT_NAME] = ''
            data.current = props.data[FIELD.DOCUMENT_TYPE]
        }
        return () => {
            document.removeEventListener('mousemove', mouseMove);
            props.onBlur();
        }
    }, [props.data[FIELD.DOCUMENT_TYPE] || ''])

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const onChangeFile = async (e) => {
        if (e.target.files && e.target.files[0]) {
            let name = e.target.files[0].name
            setValue(name);
            let base64 = await toBase64(e.target.files[0])
            props.data[props.name + '' + FIELD.DOCUMENT_NAME] = name
            props.onChange(base64)
        }
    }

    return <div style={{ display: 'flex' }}>
        <div
            onClick={() => {
                dom.current.click()
            }}
            style={{
                flex: '1',
                padding: '0 8px',
                height: '24px',
                lineHeight: '22px',
                boxSizing: 'border-box',
                backgroundColor: 'var(--primary-light)',
                border: '1px solid var(--border)',
                // color: 'var(--secondary-dark)',
                textAlign: (props.schema.textAlign ? props.schema.textAlign : 'right'),
                maxWidth: 'calc(100% - 32px)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}
            className={props.schema.placeholderRight ? s.placeholderRight : s.editableDiv}
            placeholder={props.schema.placeholder || 'Select File...'}
            defaultValue={value}
            ref={dom => props.setDom(dom)}
            onFocus={() => props.onFocus()}
            onBlur={() => props.onBlur()}
        >{value}</div>
        <input
            autoComplete='off'
            ref={dom}
            type='file'
            accept={props.schema.listAccept || 'image/jpeg,image/png,application/pdf'}
            onChange={onChangeFile}
            name={props.name}
            style={{ display: 'none' }} />
        <SvgIcon onClick={() => {
            dom.current.click()
        }} path={path.mdiUpload} style={{ background: 'var(--primary-light)', marginLeft: '8px', border: '1px solid var(--border)', height: '24px', boxSizing: 'border-box' }} />
    </div >
}
export default InputFile;
