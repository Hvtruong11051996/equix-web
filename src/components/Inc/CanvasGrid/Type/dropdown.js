import dataStorage from '../../../../dataStorage';
import { getDropdownContentDom } from '../../../../helper/functionUtils';
import Icon from '../../Icon';
import Lang from '../../Lang';
import { truncateText, showTooltip, hideTooltip } from '../helper/func';
import NoTag from '../../../Inc/NoTag'
import SvgIcon, { path } from '../../../Inc/SvgIcon'

const destroyDropdown = (floatContent) => {
    document.removeEventListener('mousemove', hoverEvent);
    if (floatContent) {
        ReactDOM.render(null, floatContent);
        floatContent.parentNode && floatContent.parentNode.removeChild(floatContent)
        floatContent = null;
    };
}
const renderWithScroll = (params, floatContent) => {
    const upperCase = 'text-uppercase';
    return (
        <div className={`list`}>

            {
                params.colDef.options
                    ? params.colDef.options.map((v, k) => {
                        return (
                            <NoTag>
                                {v.divider
                                    ? <div className='divider'></div>
                                    : null
                                }
                                <div
                                    id={`itemDropDown_${params.root.id}_${k}`}
                                    className={`${v.value === params.value ? 'size--3 activeDropDown' : 'size--3'}`}
                                    key={k}
                                    onClick={() => {
                                        params.setValue(v.value);
                                        params.grid.repaint();
                                        destroyDropdown(floatContent);
                                    }}>
                                    {
                                        <span className={`text-overflow flex align-items-center ${upperCase}`}>
                                            {v.icon ? <img src={v.icon} className='margin-right8' style={{ width: 20 + 'px', height: 13 + 'px' }}></img> : null}
                                            <label className='text-overflow showTitle' htmlFor="">{v.labelFixed ? v.labelFixed : <Lang>{v.label}</Lang>}</label>
                                        </span>
                                    }{v.value === params.value ? <div><SvgIcon path={path.mdiCheck} fill='var(--ascend-default)' /></div> : null}
                                </div>
                            </NoTag>

                        )
                    }) : null
            }
        </div>
    )
}
const hoverEvent = (e, floatContent) => {
    const b = floatContent.b;
    if (!floatContent.contains(e.target) && (e.x < b.x || e.x > b.x2 || e.y < b.y || e.y > b.y2)) {
        destroyDropdown(floatContent);
    }
}
export function size(params) {
    let text = '--';
    const translate = params.colDef.translate !== false
    if (params.colDef.optionsShow || params.colDef.options) {
        const lst = (params.colDef.optionsShow || params.colDef.options).filter(item => item.value === params.value)
        if (lst && lst[0]) {
            text = translate ? dataStorage.translate(lst[0].label).toUpperCase() : (lst[0].label).toUpperCase()
        }
    }
    params.gc.font = params.font || '13px Roboto, sans-serif';
    return Math.max(params.gc.measureText(text).width + 32, 60);
}

export default function (params) {
    const { gc, grid, config, value, style, isEditMode } = params;
    if (params.data && params.data._provider) return
    let floatContent = params.floatContent
    const b = config.bounds
    const color = params.rowTextStyle;
    let backgroundColor = (typeof params.colDef.getBackgroundColorKey === 'function' && style.getPropertyValue(params.colDef.getBackgroundColorKey(params))) || style.getPropertyValue('--primary-light');
    let textColor = typeof params.colDef.getTextColorKey === 'function' && style.getPropertyValue(params.colDef.getTextColorKey(params));
    gc.font = params.font;
    let text = '--';
    const translate = params.colDef.translate !== false
    if (params.colDef.optionsShow || params.colDef.options) {
        const lst = (params.colDef.optionsShow || params.colDef.options).filter(item => item.value === value)
        if (lst && lst[0]) {
            let textTrans = lst[0].labelFixed ? lst[0].labelFixed : (translate ? dataStorage.translate(lst[0].label) : lst[0].label)
            text = params.colDef.noUpperCase ? textTrans + '' : (textTrans + '').toUpperCase();
        }
    }
    gc.beginPath();
    let x = b.x + 8
    if (isEditMode) {
        x = b.x + 16
        text = truncateText(params, text, b.width - 32 - 8);
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
    } else {
        text = truncateText(params, text, b.width - 24);
        if (backgroundColor && !params.colDef.bgOnlyEdit) {
            x = b.x + 16
            let textWidth = gc.getTextWidth(text)
            let textHeight = gc.getTextHeight(text).height
            gc.fillStyle = backgroundColor;
            gc.fillRect(b.x + 8 + 0.5, Math.ceil(b.height / 2) + b.y + 0.5 - Math.ceil(textHeight / 2) - 3, textWidth + 16, textHeight + 5); // plus 0.5 to fix blurry
        }
    }
    gc.fillStyle = textColor || color;
    gc.textBaseline = 'middle'
    // gc.textAlign = 'right'
    const y = Math.round(b.height / 2) + b.y + 2;
    gc.fillText(text, x, y);
    gc.closePath();

    return {
        mouseMove: (e) => {
            const rect = grid.div.getBoundingClientRect();
            let displayValue = ''
            if (params.colDef && params.colDef.formater) displayValue = params.displayValue
            else {
                let opt = (params.colDef.optionsShow || params.colDef.options || []).filter(x => x.value === params.displayValue);
                displayValue = translate ? dataStorage.translate(opt.length ? opt[0].label || opt[0].labelFixed : '') : (opt.length ? opt[0].label || opt[0].labelFixed : '')
            }
            showTooltip((displayValue + '').toUpperCase(), rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
            if (!isEditMode) return;
            if (!floatContent) {
                let div = getDropdownContentDom();
                floatContent = document.createElement('div');
                div.appendChild(floatContent);
                ReactDOM.render(renderWithScroll(params, floatContent), floatContent, () => {
                    floatContent.style.position = 'absolute';
                    floatContent.style.display = 'block';
                    const element = floatContent.querySelector('.list')
                    if (element) {
                        element.style.opacity = 0
                        element.style.position = 'relative'
                        floatContent.style.width = element.offsetWidth + 'px'
                        element.style.opacity = null
                        element.style.position = null
                    } else {
                        floatContent.style.width = b.width - 15 + 'px';
                    }
                    floatContent.style.minWidth = '160px';
                    floatContent.style.boxShadow = 'var(--shadow)'
                });
                document.addEventListener('mousemove', e => hoverEvent(e, floatContent));
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
