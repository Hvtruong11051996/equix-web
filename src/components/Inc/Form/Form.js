import React from 'react';
import Lang from '../Lang';
import switchFiled from './field';
import checkRule from './rules';
import logger from '../../../helper/log';
import s from './Form.module.css';
import SvgIcon, { path } from '../SvgIcon/SvgIcon';
import dataStorage from '../../../dataStorage'
import { translateByEnvVariable } from '../../../helper/functionUtils'

export const TYPE = {
    STRING: 'string',
    NUMBER: 'number',
    DROPDOWN: 'dropdown',
    BOOLEAN: 'boolean',
    DATE_PICKER: 'datetime',
    CALLING_CODE: 'callingCode',
    GROUP: 'group',
    OBJECT: 'object',
    ARRAY: 'array',
    AUTOCOMPLETE: 'autoCompleteSearch',
    SEARCHLOCAL: 'searchLocal',
    TAG_RADIUS: 'tagRadius',
    BTN_NO_CLICK: 'btnNoClick',
    INPUT_FILE: 'inputFile',
    LABEL_EMPTY: 'labelEmpty',
    LABEL: 'label',
    FILE: 'file',
    TERM: 'term',
    SEARCH: 'search',
    DIVIDE: 'divide',
    NEWPASSWORD: 'newPassword',
    PASSWORD: 'password',
    ROLEGROUP: 'roleGroup',
    TEXTAREA: 'textarea',
    ACCOUNT: 'account',
    MANAGE: 'manage',
    NEWMANAGE: 'newManage',
    EMAILTEMP: 'emailTemp'
}

class Form extends React.Component {
    constructor(props) {
        super(props);
        this.editable = props.editable;
        this.validation = {};
        this.schema = props.schema || {};
        this.isFirst = true;
        this.data = props.data || {};
        if (props.fn) {
            props.fn({
                setEditMode: this.setEditMode,
                resetData: this.resetData,
                clearData: this.clearData,
                setData: this.setData,
                getData: this.getData,
                setSchema: this.setSchema,
                getSchema: this.getSchema,
                reRender: this.reRender,
                setFilter: this.setFilter,
                getDefaultData: this.getDefaultData,
                onChangeOriginData: this.onChangeOriginData
            });
        }
        this.listAll = [];
    }
    setFilter = (text) => {
        this.filterText = text;
        this.forceUpdate();
    }
    shouldComponentUpdate() {
        return false;
    }
    componentDidMount() {
        this.dispatchOnChange();
    }
    getSchema = () => {
        return this.schema
    }

    setSchema = (schema) => {
        this.schema = schema;
        this.forceUpdate();
    }
    validateField(validation, hideError) {
        if (validation.schema.rules && !validation.schema.hide && !validation.hide) {
            const lstMsg = [];
            Object.keys(validation.schema.rules).forEach(key => {
                const msg = checkRule(validation, key, validation.schema.rules[key], this.data);
                if (msg) lstMsg.push(msg);
            });
            if (validation.dom) {
                if (hideError) {
                    if (lstMsg.length) return true;
                } else {
                    validation.msg = lstMsg;
                    if (validation.msg.length) {
                        validation.dom.classList.add(s.invalid);
                        return true;
                    }
                    validation.dom.classList.remove(s.invalid);
                }
            }
        }
        return false;
    }
    dispatchOnChange = (validation) => {
        if (this.props.onChange) {
            this.forceUpdate();
            setTimeout(() => {
                const errCount = this.listAll.filter(validation => {
                    return this.validateField(validation, true);
                }).length;
                this.props.onChange(this.data, errCount, validation);
            }, 0);
        }
    }
    onChange(value, validation) {
        if (validation.timeoutId) clearTimeout(validation.timeoutId);
        validation.timeoutId = setTimeout(() => {
            if (!validation.hasOwnProperty('backup')) validation.backup = validation.data[validation.name];
            validation.data[validation.name] = value;
            this.validateField(validation);
            this.showError(validation, true);
            delete validation.timeoutId;
            // if (validation.schema.forceUpdate || (validation.parent.updateBy && validation.parent.updateBy[validation.name])) this.forceUpdate();
            this.dispatchOnChange(validation);
        }, 100);
    }
    showError(validation, show) {
        if (validation && validation.schema && validation.schema.showError === false) return
        let div = document.querySelector('#form-error');
        if (!div) {
            div = document.createElement('div')
            div.id = 'form-error';
            div.className = s.error;
            div.style.display = 'none';
            document.body.appendChild(div);
        }
        const data = validation.msg && validation.msg.length && validation.msg[0];
        if (show && data && validation.dom) {
            div.style.display = null;
            div.style.zIndex = 10004;
            div.style.position = 'absolute';
            const rect = validation.dom.getBoundingClientRect();
            div.style.top = rect.top + 'px';

            const rightDistant = document.body.scrollWidth - rect.left - validation.dom.clientWidth - 8;

            if (rightDistant < div.clientWidth) {
                div.style.left = null;
                div.style.right = (document.body.scrollWidth - rect.left) + 'px';
            } else {
                div.style.left = (rect.left + validation.dom.clientWidth) + 'px';
                div.style.right = null;
            }
            div.innerHTML = data;
        } else {
            div.style.display = 'none';
        }
    }
    getDefaultData = () => {
        return this.data;
    }
    getData = (diff, diffObj) => {
        if (this.hasInvalid()) return null
        if (diff) return this.getDiffData(this.data, this.validation, diffObj);
        return this.data;
    }
    getDiffData(data, validation, diffObj) {
        if (!data) return null;
        if (Array.isArray(data)) {
            const lst = [];
            data.forEach((item, index) => {
                const res = this.getDiffData(item, validation[index], diffObj)
                if (res) lst.push(res);
            });
            return lst.length ? lst : null;
        }
        const obj = {};
        const objKey = {};
        for (let name in data) {
            if (!validation[name]) continue;
            if (validation[name].hasOwnProperty('backup') && validation[name].backup !== data[name]) {
                if (!diffObj) return data;
                obj[name] = data[name];
            } else {
                if (validation[name].schema && validation[name].schema.key) objKey[name] = data[name];
            }
        }
        return Object.keys(obj).length ? { ...obj, ...objKey } : null;
    }
    reRender = () => {
        this.forceUpdate();
        logger.log('----Update Form----');
    }
    setData = (data) => {
        this.data = data;
        this.listAll = [];
        this.forceUpdate();
        if (!this.props.noDispatch) this.dispatchOnChange();
    }
    clearData = () => {
        this.validation = {};
        this.forceUpdate();
    }
    onChangeOriginData = () => {
        Object.keys(this.validation).map(key => {
            delete this.validation[key].backup
        })
    }
    resetData = (cols) => {
        if (cols && !Array.isArray(cols)) cols = [cols];
        this.listAll.map(validation => {
            if (validation.hasOwnProperty('backup') && (!cols || cols.indexOf(validation.name) > -1)) {
                validation.data[validation.name] = validation.backup;
                delete validation.backup;
            }
        });
        this.forceUpdate()
    }
    hasInvalid() {
        const lst = this.listAll.filter(validation => {
            return this.validateField(validation);
        });
        if (lst.length && lst[0].dom) {
            lst[0].dom.scrollIntoView && lst[0].dom.scrollIntoView(false);
            lst[0].dom.focus();
        }
        return lst.length;
    }
    setEditMode = (editable) => {
        if (!this.editable !== !editable) {
            this.editable = editable;
            this.forceUpdate();
        }
    }
    getSlideTitle = (schema, arr, index) => {
        if (typeof schema.displayField === 'function') return schema.displayField(arr[index], index);
        return arr[index][schema.displayField] || '--';
    }
    slideAction = (e, validation, schema, arr, num) => {
        let index = (validation.slideIndex || 0) + num;
        if (index < 0) validation.slideIndex = 0;
        else if (index >= arr.length) validation.slideIndex = arr.length - 1;
        if (validation.slideIndex === index) return;
        validation.slideIndex = index;
        const sildeDom = e.target.closest('.' + s.slide);
        if (sildeDom) {
            const contentDom = sildeDom.querySelector('.' + s.slideContent + '>div');
            if (contentDom) contentDom.style.transform = 'translateX(-' + index + '00%)';
            const titleDom = sildeDom.querySelector('.' + s.groupTitle + ' .' + s.groupSpan + ' +span');
            if (titleDom) titleDom.innerText = this.getSlideTitle(schema, arr, index);
            const span = sildeDom.querySelector('.' + s.slideAction + '>span');
            if (span) span.innerText = `${(index || 0) + 1}/${arr.length}`;
        }
    }
    renderItem(validation, data, value, schema, name) {
        if (!schema || schema.hide) {
            return null
        }
        if (schema.follow) {
            if (!validation.parent.updateBy) validation.parent.updateBy = {}
            if (Array.isArray(schema.follow)) schema.follow.forEach(field => validation.parent.updateBy[field] = true)
        }
        if (schema.condition) {
            if (!validation.parent.updateBy) validation.parent.updateBy = {}
            const keys = Object.keys(schema.condition)
            const matchedKeys = keys.filter(key => {
                validation.parent.updateBy[key] = true;
                if (Array.isArray(schema.condition[key])) return schema.condition[key].includes(data[key])
                else if (Array.isArray(data[key])) return data[key].includes(schema.condition[key])
                return schema.condition[key] === data[key]
            })
            validation.hide = keys.length !== matchedKeys.length
            if (validation.hide) return null;
        }
        if (schema.type === 'array') {
            if (!schema.items) return null;
            let arr;
            if (!data) {
                if (!Array.isArray(this.data)) this.data = [{}];
                arr = this.data;
            } else {
                if (!Array.isArray(data[name])) data[name] = [{}];
                arr = data[name];
            }

            if (arr && arr.length) {
                const res = arr.map((item, index) => {
                    if (!validation[index]) validation[index] = { parent: validation };
                    return <div key={index} className={s.item}>{this.renderItem(validation[index], arr, item, schema.items, index)}</div>
                });
                if (schema.slide) {
                    if (validation.slideIndex >= arr.length || !validation.slideIndex) validation.slideIndex = 0
                    return <div className={s.slide} key={name + '_' + validation.slideIndex}>
                        <div
                            className={s.groupTitle}
                            onClick={(e) => {
                                if (this.props.toggleGroup) {
                                    e.target.closest(`.${s.groupTitle}`).classList.toggle(s.hide)
                                }
                            }}
                        >
                            {
                                this.props.toggleGroup
                                    ? <span className={s.groupSpan}><SvgIcon className={s.right} path={path.mdiChevronRight} /><SvgIcon className={s.down} path={path.mdiChevronDown} /></span>
                                    : null
                            }
                            <span>{this.getSlideTitle(schema, arr, validation.slideIndex)}</span>
                            <div className={s.slideAction}>
                                <SvgIcon className={s.prev} path={path.mdiChevronLeft} onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (validation.slideIndex > 0) {
                                        this.slideAction(e, validation, schema, arr, -1)
                                        this.props.callbackSlide && this.props.callbackSlide(validation.slideIndex)
                                    }
                                }} />
                                <span>{`${(validation.slideIndex || 0) + 1}/${arr.length}`}</span>
                                <SvgIcon className={s.next} path={path.mdiChevronRight} onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (validation.slideIndex < arr.length - 1) {
                                        this.slideAction(e, validation, schema, arr, 1)
                                        this.props.callbackSlide && this.props.callbackSlide(validation.slideIndex)
                                    }
                                }} />
                            </div>
                        </div>
                        <div className={s.slideContent}>
                            <div style={{ transform: `translateX(${validation.slideIndex === 0 ? '0px' : `-${validation.slideIndex}00%`})` }}>
                                <div className={s.slideContainer} style={{ width: res.length + '00%' }}>{res}</div>
                            </div>
                        </div>
                    </div>
                }
                return res;
            }
            return null;
        }
        if (schema.type === 'object') {
            if (!schema.properties) return null;
            if (!value) {
                data[name] = {};
                value = data[name]
            }
            let group = [];
            let groupName = '';
            const lst = [];
            const keys = Object.keys(schema.properties);
            const closeGroup = () => lst.push(<div className={`${s.group} ${(schema.properties[groupName] && schema.properties[groupName].fullWidth ? s.fullWidth : '')}`} key={'group:' + groupName}>{group}</div>)
            for (let i = 0; i < keys.length; i++) {
                const name = keys[i];
                if (!schema.properties[name]) continue;
                if (!validation[name]) validation[name] = { parent: validation };
                const com = this.renderItem(validation[name], value, value[name], schema.properties[name], name);
                if (schema.properties[name].type === 'group' || (schema.properties[name].type === 'array' && schema.properties[name].slide)) {
                    closeGroup()
                    groupName = name;
                    group = [];
                    lst.push(com)
                } else {
                    if (group) group.push(com)
                    else lst.push(com)
                }
            }
            closeGroup()
            return lst;
        }
        if (!data) return null;
        validation.schema = schema;
        validation.name = name;
        validation.data = data;
        validation.msg = [];
        const onChange = (v) => {
            this.onChange(v, validation);
        };
        const onFocus = () => {
            if (validation.msg && validation.msg.length) this.showError(validation, true);
        };
        const onBlur = () => {
            this.validateField(validation);
            this.showError(validation, false);
        }
        const ref = (dom) => {
            if (dom && validation.dom !== dom) {
                validation.dom && validation.dom.classList && validation.dom.classList.remove(s.invalid)
                validation.dom = dom;
            }
        };
        if (this.listAll.indexOf(validation) === -1) this.listAll.push(validation);
        const CustomField = switchFiled(schema);
        if (schema.type === 'group') {
            return <div
                key={name}
                className={s.groupTitle + ' ' + (schema.titleClass || 'text-capitalize')}
                onClick={(e) => {
                    if (this.props.toggleGroup && !schema.notCollapse) {
                        e.target.closest(`.${s.groupTitle}`).classList.toggle(s.hide)
                    }
                }}
            >
                {
                    this.props.toggleGroup && !schema.notCollapse
                        ? <span className={s.groupSpan}><SvgIcon className={s.right} path={path.mdiChevronRight} /><SvgIcon className={s.down} path={path.mdiChevronDown} /></span>
                        : null
                }
                {(schema.translate !== false ? <Lang>{schema.title}</Lang> : schema.title) || '--'}
                {schema.subTitle ? <div className={s.subTitle}><Lang>{schema.subTitle}</Lang></div> : ''}
                {typeof schema.open === 'function' && this.editable ? <div className={s.open} onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    schema.open(data)
                }}><SvgIcon style={{ width: '20px' }} path={path.mdiOpenInNew} /></div> : ''}
            </div>
        }
        let isRequire = false;
        if (schema.rules) {
            if (typeof schema.rules.required === 'function') isRequire = schema.rules.required(data, this.data);
            else isRequire = schema.rules.required || schema.rules.calling_code_required;
        }
        if ([TYPE.TERM, TYPE.DIVIDE].includes(schema.type)) {
            return <CustomField
                {...this.props}
                setListDataEmpty={listEmpty => Array.isArray(listEmpty) ? validation.listEmpty = listEmpty : delete validation.listEmpty}
                onKeyPress={this.props.onKeyPress}
                editable={this.editable}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                data={data}
                value={value}
                schema={schema}
                name={name}
                setDom={ref} />
        }
        schema.isRequire = isRequire
        const helpText = schema.replaceHelpText ? translateByEnvVariable(schema.help, schema.replaceHelpKey, schema.replaceHelpText) : dataStorage.translate(schema.help)
        return (
            <div className={s.cell + ' ' + (schema.direction === 'vertical' ? s.cellVertical : '')} key={name}>
                <div className={'showTitle' + ' ' + (schema.type === TYPE.LABEL_EMPTY ? s.underline : '') + ' ' + (schema.titleClass || 'text-capitalize')}>
                    <div>{schema.titleFixed || <Lang>{schema.title}</Lang>}{isRequire && (schema.titleFixed || schema.title) ? <span className={s.required}>*</span> : ''}</div>
                    {schema.help ? <div className={s.help} title={helpText}><SvgIcon path={path.mdiHelpCircle} /></div> : ''}
                </div>
                <div>
                    <CustomField
                        {...this.props}
                        setListDataEmpty={listEmpty => Array.isArray(listEmpty) ? validation.listEmpty = listEmpty : delete validation.listEmpty}
                        onKeyPress={this.props.onKeyPress}
                        editable={this.editable}
                        onChange={onChange}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        data={data}
                        value={value}
                        schema={schema}
                        name={name}
                        setDom={ref} />
                    {schema.note
                        ? <div className={s.note}><span className='text-capitalize'><Lang>lang_note</Lang>: </span>{typeof schema.note === 'function' ? <Lang>{schema.note(value)}</Lang> : <Lang>{schema.note}</Lang>}  </div>
                        : null}
                </div>
            </div>
        )
    }
    render() {
        return <div className={s.form + (this.props.stripe ? ' ' + s.stripe : '') + (this.props.marginForm ? ' ' + s.marginForm : '')} style={this.schema.noPaddingtop ? { marginTop: 'unset' } : {}}>
            {this.renderItem(this.validation, null, this.data, this.schema)}</div>
    }
}
export default Form;
