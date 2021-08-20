import dataStorage from '../../../../dataStorage';
import { getDropdownContentDom } from '../../../../helper/functionUtils';
import Icon from '../../Icon/Icon';
import Lang from '../../Lang/Lang';
import { truncateText, showTooltip, hideTooltip } from '../helper/func';
import NoTag from '../../NoTag/NoTag'
import SvgIcon, { path } from '../../SvgIcon/SvgIcon'

let floatContent = null;

const languageOptions = [
    {
        label: 'lang_chinese',
        value: 'cn',
        icon: '/flag/cn.png'
    }, {
        label: 'lang_english',
        value: 'en',
        icon: '/flag/gb.png'
    }, {
        label: 'lang_vietnamese',
        value: 'vi',
        icon: '/flag/vn.png'
    }
]

const destroyDropdown = () => {
    document.removeEventListener('mousemove', hoverEvent);
    if (floatContent) {
        ReactDOM.render(null, floatContent);
        floatContent.parentNode && floatContent.parentNode.removeChild(floatContent)
        floatContent = null;
    };
}
const renderWithScroll = (params) => {
    let dataValue = (params.displayValue && params.displayValue.alert_language) || 'en'
    return (
        <div className={`list`}>
            {
                languageOptions.map((v, k) => {
                    return (
                        <NoTag>
                            {v.divider
                                ? <div className='divider'></div>
                                : null
                            }
                            <div
                                id={`itemDropDown_${params.root.id}_${k}`}
                                className={`${v.value === dataValue ? 'size--3 activeDropDown' : 'size--3'}`}
                                key={k}
                                onClick={() => {
                                    let datalanguage = { ...params.data[params.name] }
                                    datalanguage.alert_language = v.value
                                    params.setValue(datalanguage)
                                    params.grid.repaint();
                                    params.colDef.handleEditDetailCallBack(datalanguage)
                                    destroyDropdown(floatContent);
                                }}>
                                {
                                    <span className={`text-overflow flex align-items-center`}>
                                        {v.icon ? <img src={v.icon} className='margin-right8' style={{ width: 20 + 'px', height: 13 + 'px' }}></img> : null}
                                        <label className='text-overflow showTitle' htmlFor="">{v.labelFixed ? v.labelFixed : <Lang>{v.label}</Lang>}</label>
                                    </span>
                                }{v.value === dataValue ? <div><SvgIcon path={path.mdiCheck} fill='var(--ascend-default)' /></div> : null}
                            </div>
                        </NoTag>

                    )
                })
            }
        </div>
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

const dicFlags = {}

const countryMap = {
    cn: 'cn',
    en: 'gb',
    vi: 'vn'
}

const textMap = {
    cn: 'lang_china',
    vi: 'lang_vietnam',
    en: 'lang_english'
}

export default function (params) {
    const { gc, grid, config, value, style, isEditMode } = params;
    if (params.data && params.data._provider) return
    // let floatContent = params.floatContent
    const b = config.bounds
    const color = params.rowTextStyle;
    let backgroundColor = (typeof params.colDef.getBackgroundColorKey === 'function' && style.getPropertyValue(params.colDef.getBackgroundColorKey(params))) || style.getPropertyValue('--primary-light');
    let textColor = typeof params.colDef.getTextColorKey === 'function' && style.getPropertyValue(params.colDef.getTextColorKey(params));
    gc.font = params.font;
    let data = params.displayValue
    let lang = data.alert_language || 'en'
    let countryCode = countryMap[lang]
    let text = dataStorage.translate(textMap[lang]).toCapitalize()
    text = truncateText(params, text, b.width - 32)
    gc.beginPath();

    let x = b.x + 44
    if (isEditMode) {
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
    if (!dicFlags[countryCode]) {
        dicFlags[countryCode] = new Image();
        dicFlags[countryCode].src = 'flag/' + countryCode + '.png';
    }
    gc.drawImage(dicFlags[countryCode], b.x + 12, b.y + 11, 20, 14);
    gc.fillStyle = textColor || color;
    gc.textBaseline = 'middle'
    // gc.textAlign = 'right'
    const y = Math.round(b.height / 2) + b.y + 2;
    gc.fillText(text, x, y);
    gc.closePath();

    return {
        mouseMove: (e) => {
            const rect = grid.div.getBoundingClientRect();
            // let opt = (params.colDef.optionsShow || params.colDef.options || []).filter(x => x.value === params.displayValue);
            // // let displayTitle = (opt.length ? opt[0].label || opt[0].labelFixed : '').toUpperCase();
            // let displayTitle = dataStorage.translate(opt.length ? opt[0].label || opt[0].labelFixed : '');
            // showTooltip((displayTitle + '').toUpperCase(), rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
            if (!isEditMode) return;
            if (!floatContent && !params.dragging) {
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
                        floatContent.style.width = b.width - 15 + 'px'
                        element.style.opacity = null
                        element.style.position = null
                    } else {
                        floatContent.style.width = b.width - 15 + 'px';
                    }
                    floatContent.style.minWidth = '160px';
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
