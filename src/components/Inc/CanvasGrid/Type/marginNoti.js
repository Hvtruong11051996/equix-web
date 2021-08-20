import dataStorage from '../../../../dataStorage';
import { getDropdownContentDom } from '../../../../helper/functionUtils';
import Lang from '../../Lang/Lang';
import { truncateText, showTooltip, hideTooltip } from '../helper/func';
import NoTag from '../../NoTag/NoTag'
import SvgIcon, { path } from '../../SvgIcon/SvgIcon'
import { drawSmsIcon, drawEmailIcon, drawMdiBellIcon } from '../helper/draw';
import uuidv4 from 'uuid/v4';

let floatContent = null;

const destroyDropdown = () => {
    document.removeEventListener('mousemove', hoverEvent);
    if (floatContent) {
        ReactDOM.render(null, floatContent);
        floatContent.parentNode && floatContent.parentNode.removeChild(floatContent)
        floatContent = null;
    };
}

const notiOptions = [
    {
        label: 'SMS',
        value: 'SEND_SMS',
        icon: '/common/sms.svg'
    }, {
        label: 'Push Notification',
        value: 'PUSH_NOTIFICATION',
        icon: '/common/bell-outline-1.svg'
    }, {
        label: 'Email',
        value: 'SEND_EMAIL',
        icon: '/common/email.svg'
    }
]

const listDisable = ['PUSH_NOTIFICATION', 'SEND_EMAIL']
const renderWithScroll = (params) => {
    return (
        <div className={`list`}>
            {
                notiOptions.map((v, k) => {
                    const disableClass = listDisable.includes(v.value) ? 'disableSelect' : ''
                    return (
                        <div
                            id={`itemDropDown_${params.gridId}_${k}`}
                            className={`flex size--3 ${disableClass}`}
                            key={uuidv4()}
                            onClick={() => {
                                if (disableClass) return;
                                let dataNoti = { ...params.data[params.name] }
                                if (dataNoti.alert_methods.includes(v.value)) {
                                    dataNoti.alert_methods = dataNoti.alert_methods.filter(x => x !== v.value)
                                } else {
                                    dataNoti.alert_methods.push(v.value)
                                }
                                params.setValue(dataNoti)
                                params.grid.repaint();
                                params.colDef.handleEditDetailCallBack(dataNoti)
                                destroyDropdown(floatContent)
                            }}>
                            <span style={{ width: 16 + 'px', pointerEvents: 'none' }} className="flex">
                                {
                                    listDisable.indexOf(v.value) > -1
                                        ? <SvgIcon path={path.mdiCheck} fill='var(--ascend-default)' />
                                        : <NoTag>
                                            {
                                                params.displayValue.alert_methods.indexOf(v.value) > -1
                                                    ? <img style={{ width: 16 + 'px' }} src={'.' + dataStorage.hrefImg + '/checkbox-marked-outline.svg'} />
                                                    : <img style={{ width: 16 + 'px' }} src={'.' + dataStorage.hrefImg + '/outline-check_box_outline_blank.svg'} />
                                            }
                                        </NoTag>
                                }
                            </span>
                            <div className="flex " style={{ overflow: 'hidden' }}>
                                {v.icon ? <img style={{ maxWidth: 18 + 'px' }} src={v.icon} className="margin-left8 margin-right8" /> : null}
                                <span className={`${v.className || 'text-capitalize'} text-overflow showTitle`}>{v.label}</span>
                            </div>
                        </div>
                    )
                })
            }
        </div >
    )
}
const hoverEvent = (e) => {
    if (!floatContent) return;
    const b = floatContent.b;
    if (!floatContent.contains(e.target) && (e.x < b.x || e.x > b.x2 || e.y < b.y || e.y > b.y2)) {
        destroyDropdown();
    }
}
export function size(params) {
    return 150
}

const btnObj = {
    PUSH_NOTIFICATION: (params, position) => {
        drawMdiBellIcon(params, position.x, position.y, position.w, position.h)
    },
    SEND_EMAIL: (params, position) => {
        drawEmailIcon(params, position.x, position.y, position.w, position.h)
    },
    SEND_SMS: (params, position) => {
        drawSmsIcon(params, position.x, position.y + 4, position.w + 6, position.h + 2)
    }
}

export default function (params) {
    const { gc, grid, config, value, style, isEditMode } = params;
    if (params.data && params.data._provider) return
    // let floatContent = params.floatContent
    const b = config.bounds
    const color = params.rowTextStyle;
    let backgroundColor = (typeof params.colDef.getBackgroundColorKey === 'function' && style.getPropertyValue(params.colDef.getBackgroundColorKey(params))) || style.getPropertyValue('--primary-light');
    gc.fillStyle = color;
    let btnPosition = {}
    let data = params.displayValue;
    gc.font = params.font;
    gc.beginPath();
    let x = b.x + 8
    if (isEditMode) {
        x = b.x + 16
        // text = truncateText(params, text, b.width - 32 - 8);
        if (backgroundColor) {
            gc.beginPath();
            gc.fillStyle = backgroundColor;
            gc.fillRect(b.x + 8 + 0.5, b.y + 4 + 0.5, b.width - 16, b.height - 8); // plus 0.5 to fix blurry
            gc.closePath();
        }
        gc.lineWidth = 1;
        gc.strokeStyle = style.getPropertyValue('--border') || '#3d3f48';
        gc.strokeRect(b.x + 8 + 0.5, b.y + 4 + 0.5, b.width - 16, b.height - 8); // plus 0.5 to fix blurry
        gc.fillStyle = color;
        gc.moveTo(b.x + b.width - 16 - 8 + 0.5, b.y + 12 + 0.5);
        gc.lineTo(b.x + b.width - 16 + 0.5, b.y + 12 + 0.5);
        gc.lineTo(b.x + b.width - 16 - 4 + 0.5, b.y + 12 + 8 + 0.5);
        gc.fill();
    }
    let listMethod = data.alert_methods || listDisable
    if (listMethod && Array.isArray(listMethod)) {
        listMethod.forEach((v, i) => {
            let x = b.x + 12 + (26 * i);
            let y = b.y + 7;
            let w = 18;
            let h = 18;
            btnPosition[v] = { x, y, w, h }
            btnObj[v](params, { x, y, w, h });
        })
    }
    return {
        mouseMove: (e) => {
            const rect = grid.div.getBoundingClientRect();
            let opt = (params.colDef.optionsShow || params.colDef.options || []).filter(x => x.value === params.displayValue);
            // let displayTitle = (opt.length ? opt[0].label || opt[0].labelFixed : '').toUpperCase();
            let displayTitle = dataStorage.translate(opt.length ? opt[0].label || opt[0].labelFixed : '');
            showTooltip((displayTitle + '').toUpperCase(), rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
            if (!isEditMode) return;
            if (!floatContent) {
                let div = getDropdownContentDom();
                floatContent = document.createElement('div');
                div.appendChild(floatContent);
                ReactDOM.render(renderWithScroll(params), floatContent, () => {
                    floatContent.style.position = 'absolute';
                    floatContent.style.display = 'block';
                    const element = floatContent.querySelector('.list')
                    if (element) {
                        element.style.opacity = 0
                        element.style.position = 'relative'
                        floatContent.style.width = b.width - 16 + 'px';
                        element.style.opacity = null
                        element.style.position = null
                    } else {
                        floatContent.style.width = b.width - 16 + 'px';
                    }
                    floatContent.style.minWidth = '180px';
                    floatContent.style.boxShadow = 'var(--shadow)'
                });
                floatContent.b = {
                    x: rect.left + b.x + 8,
                    y: rect.top + b.y,
                    x2: rect.left + b.x + b.width - 8,
                    y2: rect.top + b.y + b.height
                };
                document.addEventListener('mousemove', e => hoverEvent(e));
            }
            floatContent.b = {
                x: rect.left + b.x + 8,
                y: rect.top + b.y,
                x2: rect.left + b.x + b.width - 8,
                y2: rect.top + b.y + b.height
            };
            const top = rect.top + b.y + b.height;
            const spaceBottom = window.innerHeight - top
            if (top > spaceBottom && spaceBottom < 100) {
                floatContent.style.bottom = (spaceBottom + b.height) + 'px';
                floatContent.style.maxHeight = (rect.top > 336 ? 336 : rect.top) + 'px'
                floatContent.style.top = null;
            } else {
                floatContent.style.top = top + 'px';
                floatContent.style.bottom = null
                floatContent.style.maxHeight = (spaceBottom > 336 ? 336 : spaceBottom) + 'px'
            }

            const left = rect.left + b.x + 8;
            const totalWidth = left + floatContent.offsetWidth;
            if (totalWidth > window.innerWidth) {
                floatContent.style.left = (window.innerWidth - floatContent.offsetWidth) + 'px'
            } else {
                floatContent.style.left = left + 'px';
            }
        },
        mouseLeave: e => {
            hideTooltip();
        }
    }
}
