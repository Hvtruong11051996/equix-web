import dataStorage from '../../../../dataStorage';
import { getDropdownContentDom } from '../../../../helper/functionUtils';
import Icon from '../../Icon/Icon';
import Lang from '../../Lang/Lang';
import { truncateText, showTooltip, hideTooltip } from '../helper/func';
import NoTag from '../../../Inc/NoTag'
import uuidv4 from 'uuid/v4'
const destroyDropdown = (floatContent) => {
    document.removeEventListener('mousemove', hoverEvent);
    if (floatContent) {
        ReactDOM.render(null, floatContent);
        floatContent.parentNode && floatContent.parentNode.removeChild(floatContent)
        floatContent = null;
    };
}
const renderWithScroll = (params, floatContent) => {
    return (
        <div className={`list`} key={uuidv4()}>
            {
                params.colDef.options
                    ? params.colDef.options.map((v, k) => {
                        let status = params.data.status
                        const disableClass = (status === 0 || status === 3 || status === 4 || status === 5) && v.value === 2 ? 'disableSelect' : ''
                        return (
                            <NoTag key={uuidv4()}>
                                {v.divider
                                    ? <div key={uuidv4()} className='divider'></div>
                                    : null
                                }
                                <div
                                    id={`itemDropDown_${params.root.id}_${k}`}
                                    className={`${v.value === params.value ? 'size--3 activeDropDown' : 'size--3'} ${disableClass}`}
                                    key={`${params.root.id}_${k}`}
                                    onClick={(e) => {
                                        params.grid.repaint();
                                        v.cb && v.cb(params.data, v.value)
                                        destroyDropdown(floatContent);
                                    }}>
                                    {
                                        <span className={`text-overflow flex align-items-center`}>
                                            {v.icon ? <img src={v.icon} className='margin-right8' style={{ width: 20 + 'px', height: 13 + 'px' }}></img> : null}
                                            <label className={`${v.className || 'text-capitalize'} text-overflow showTitle`} htmlFor=""><Lang>{v.label}</Lang></label>
                                        </span>
                                    }
                                    {v.value === params.value ? <div><Icon style={{ transition: 'none', fill: 'var(--ascend-default) !important' }} src='navigation/check' /></div> : null}
                                    {v.isForceChangePass ? params.data.change_password ? <img src='/common/checkbox-marked-outline.svg' style={{ height: 20 + 'px' }} /> : <img src='/common/outline-check_box_outline_blank.svg' style={{ height: 20 + 'px' }} /> : null}
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
    let text = 'Action';
    if (params.colDef.optionsShow || params.colDef.options) {
        const lst = (params.colDef.optionsShow || params.colDef.options).filter(item => item.value === params.value)
        if (lst && lst[0]) {
            text = dataStorage.translate(lst[0].label).toUpperCase();
        }
    }
    params.gc.font = params.font;
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
    let text = 'Action';

    gc.beginPath();

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
    gc.fillStyle = textColor || color;
    gc.textBaseline = 'middle'
    // gc.textAlign = 'right'
    const x = b.x + 16;
    const y = Math.round(b.height / 2) + b.y + 2;
    gc.fillText(text, x, y);
    gc.closePath();

    return {
        mouseMove: (e) => {
            const rect = grid.div.getBoundingClientRect();
            let opt = (params.colDef.optionsShow || params.colDef.options || []).filter(x => x.value === params.displayValue);
            let displayTitle = (opt.length ? opt[0].label : '').toUpperCase();
            showTooltip(displayTitle, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
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
            if (rect.top > spaceBottom && spaceBottom < 100) {
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
