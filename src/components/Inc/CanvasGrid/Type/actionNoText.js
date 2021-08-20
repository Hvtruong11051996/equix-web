import dataStorage from '../../../../dataStorage';
import { getOpeningAccountUrl, putData } from '../../../../helper/request';
import { getDropdownContentDom } from '../../../../helper/functionUtils';
import Icon from '../../Icon/Icon';
import Lang from '../../Lang/Lang';
import { truncateText, showTooltip, hideTooltip } from '../helper/func';
import NoTag from '../../../Inc/NoTag'
import uuidv4 from 'uuid/v4'
import SvgIcon, { path } from '../../../Inc/SvgIcon'
import s from '../CanvasGrid.module.css'

const destroyDropdown = (floatContent) => {
    document.removeEventListener('mousemove', hoverEvent);
    if (floatContent) {
        ReactDOM.render(null, floatContent);
        floatContent.parentNode && floatContent.parentNode.removeChild(floatContent)
        floatContent = null;
    };
}

const renderWithScroll = (params, floatContent) => {
    let options = []
    if (params.colDef.options) {
        if (typeof params.colDef.options === 'function') {
            options = params.colDef.options(params)
        } else options = params.colDef.options
    }
    return (
        <div className={`list`} key={uuidv4()}>
            {
                options
                    ? options.map((v, k) => {
                        return (
                            <NoTag key={uuidv4()}>
                                {v.divider
                                    ? <div key={uuidv4()} className='divider'></div>
                                    : null
                                }
                                <div
                                    id={`itemDropDown_${params.root.id}_${k}`}
                                    className={`${v.value === params.value ? 'size--3 activeDropDown' : 'size--3'}`}
                                    key={`${params.root.id}_${k}`}
                                    onClick={(e) => {
                                        // params.setValue(v.value);
                                        // params.grid.repaint();
                                        v.cb && v.cb(params.data, v.value)
                                        destroyDropdown(floatContent)
                                    }}>
                                    {
                                        <span className={`text-overflow flex align-items-center`}>
                                            {v.icon ? <SvgIcon className={s.iconMiniDrodpown} path={path[v.icon]} /> : null}
                                            <label className={`text-overflow showTitle ${v.className || 'text-capitalize'}`} htmlFor=""><Lang>{v.label}</Lang></label>
                                        </span>
                                    }
                                    {v.value === params.value ? <div><Icon style={{ transition: 'none' }} src='navigation/check' /></div> : null}
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
    return 40;
}

export default function (params) {
    const { gc, grid, config, value, style, isEditMode } = params;
    if (params.data && params.data._provider) return
    let floatContent = params.floatContent
    const b = config.bounds
    const color = style.getPropertyValue('--secondary-default');
    let backgroundColor = (typeof params.colDef.getBackgroundColorKey === 'function' && style.getPropertyValue(params.colDef.getBackgroundColorKey(params))) || style.getPropertyValue('--primary-light');
    gc.font = params.font;

    gc.beginPath();

    gc.lineWidth = 1;
    const xStart = b.x + b.width / 2 - 12
    const w = 24
    gc.fillStyle = backgroundColor
    gc.fillRect(xStart, b.y + 4 + 0.5, w, b.height - 9);
    gc.strokeStyle = style.getPropertyValue('--border');
    gc.strokeRect(xStart, b.y + 4 + 0.5, w, b.height - 9);
    gc.fillStyle = color;
    gc.moveTo(xStart + 8, b.y + 12 + 0.5);
    gc.lineTo(xStart + 16, b.y + 12 + 0.5);
    gc.lineTo(xStart + 12, b.y + 12 + 7 + 0.5);
    gc.fill();
    gc.closePath();

    return {
        mouseMove: (e) => {
            const rect = grid.div.getBoundingClientRect();
            let options = []
            if (params.colDef.options) {
                if (typeof params.colDef.options === 'function') {
                    options = params.colDef.options(params)
                } else options = params.colDef.options
            }
            let opt = options.filter(x => x.value === params.displayValue);
            let displayTitle = (opt.length ? opt[0].label : '').toUpperCase();
            showTooltip(displayTitle, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
            if (!floatContent) {
                let div = getDropdownContentDom();
                floatContent = document.createElement('div');
                div.appendChild(floatContent);
                ReactDOM.render(renderWithScroll(params, floatContent), floatContent, () => {
                    floatContent.style.position = 'absolute';
                    floatContent.style.display = 'block';
                    floatContent.style.boxShadow = 'var(--shadow)';
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
