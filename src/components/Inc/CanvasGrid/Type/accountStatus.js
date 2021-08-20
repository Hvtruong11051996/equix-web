import dataStorage from '../../../../dataStorage';
import {
    drawActiveIcon, drawCloseIcon, drawPendingIcon, drawSearch, drawProgressAlert,
    drawLockout, drawProgressPending, drawCreatingAccount
} from '../helper/draw';
import { getDropdownContentDom } from '../../../../helper/functionUtils';
import Icon from '../../Icon';
import Lang from '../../Lang';
import { truncateText, showTooltip, hideTooltip } from '../helper/func';
import { ACCOUNT_STATUS } from '../../../OpeningAccount/constant'

export function size(params) {
    try {
        let text = '--';
        if (params.colDef.options) {
            const lst = (params.colDef.options).filter(item => item.value === params.value)
            if (lst && lst[0]) {
                text = dataStorage.translate(lst[0].label).toUpperCase();
            }
        }
        params.gc.font = params.font || '13px Roboto, sans-serif';
        return Math.max(params.gc.measureText(text).width + (params.isEditMode ? 72 : 56), 60);
    } catch (error) {
        console.error('accountStatus - size error: ', error)
    }
}

const destroyDropdown = (floatContent) => {
    try {
        document.removeEventListener('mousemove', hoverEvent);
        if (floatContent) {
            ReactDOM.render(null, floatContent);
            floatContent.parentNode && floatContent.parentNode.removeChild(floatContent)
            floatContent = null;
        };
    } catch (error) {
        console.error('accountStatus - destroyDropdown error: ', error)
    }
}
const renderWithScroll = (params, floatContent) => {
    try {
        const upperCase = 'text-uppercase';
        return (
            <div className={`list`}>

                {
                    params.colDef.options
                        ? params.colDef.options.map((v, k) => {
                            return (
                                <React.Fragment>
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
                                        }{v.value === params.value ? <div><Icon style={{ transition: 'none' }} src='navigation/check' /></div> : null}
                                    </div>
                                </React.Fragment>
                            )
                        }) : null
                }
            </div>
        )
    } catch (error) {
        console.error('accountStatus - renderWithScroll error: ', error)
    }
}
const hoverEvent = (e, floatContent) => {
    try {
        const b = floatContent.b;
        if (!floatContent.contains(e.target) && (e.x < b.x || e.x > b.x2 || e.y < b.y || e.y > b.y2)) {
            destroyDropdown(floatContent);
        }
    } catch (error) {
        console.error('accountStatus - hoverEvent error: ', error)
    }
}

const getStyleByStatus = (status, style) => {
    try {
        switch ((status + '').toUpperCase()) {
            case ACCOUNT_STATUS.ACTIVE:
                return {
                    getIcon: drawActiveIcon,
                    bg: style.getPropertyValue('--semantic-success')
                }
            case ACCOUNT_STATUS.CLOSED:
            case ACCOUNT_STATUS.CREATED_FAILED:
                return {
                    getIcon: drawCloseIcon,
                    bg: style.getPropertyValue('--semantic-danger')
                }
            case ACCOUNT_STATUS.EKYC_PENDING:
            case ACCOUNT_STATUS.BANK_SUBMITTED:
                return {
                    getIcon: drawSearch,
                    bg: style.getPropertyValue('--semantic-warning')
                }
            case ACCOUNT_STATUS.EKYC_IN_PROGRESS:
                return {
                    getIcon: drawProgressAlert,
                    bg: style.getPropertyValue('--secondary-dark')
                }
            case ACCOUNT_STATUS.EKYC_LOCKED_OUT:
                return {
                    getIcon: drawLockout,
                    bg: style.getPropertyValue('--semantic-danger')
                }
            case ACCOUNT_STATUS.BANK_PENDING:
            case ACCOUNT_STATUS.MORRISON_PENDING:
                return {
                    getIcon: drawProgressPending,
                    bg: style.getPropertyValue('--secondary-dark')
                }
            case ACCOUNT_STATUS.CREATING:
                return {
                    getIcon: drawCreatingAccount,
                    bg: style.getPropertyValue('--secondary-dark')
                }
            default:
                return {
                    getIcon: drawProgressAlert,
                    bg: style.getPropertyValue('--secondary-dark')
                }
        }
    } catch (error) {
        console.error('accountStatus - getStyleByStatus error: ', error)
    }
}

export default function (params) {
    try {
        const { gc, config, style, isEditMode, grid, colDef, displayValue, value } = params
        if (params.data && params.data._provider) return
        let floatContent = params.floatContent
        const data = config.dataRow[config.field]
        const b = config.bounds
        const styleStatus = getStyleByStatus(value, style)
        const isAtive = ['active', 'kyc verified', 'pending cma'].includes(data)
        let text = '--';
        if (params.colDef.options) {
            const lst = (params.colDef.options).filter(item => (item.value + '').toUpperCase() === (value + '').toUpperCase())
            if (lst && lst[0]) {
                let textTrans = lst[0].labelFixed ? lst[0].labelFixed : dataStorage.translate(lst[0].label)
                text = params.colDef.noUpperCase ? textTrans + '' : (textTrans + '').toUpperCase();
            }
        }
        text = truncateText(params, text, b.width - 32 - 16);
        gc.save()
        gc.textBaseline = 'middle'
        const yText = Math.ceil(b.height / 2) + b.y + 0.5;
        if (isEditMode) {
            gc.font = params.font
            gc.lineWidth = 1;
            gc.strokeStyle = style.getPropertyValue('--border') || '#3d3f48';
            gc.fillStyle = style.getPropertyValue('--primary-light') || '#262b3e'
            isAtive && gc.fillRect(b.x + 8 + 0.5, b.y + 4 + 0.5, b.width - 16, b.height - 8);
            gc.strokeRect(b.x + 8 + 0.5, b.y + 4 + 0.5, b.width - 16, b.height - 8);
            gc.fillStyle = params.rowTextStyle;
            if (isAtive) {
                gc.moveTo(b.x + b.width - 16 - 8 + 0.5, b.y + 12 + 0.5);
                gc.lineTo(b.x + b.width - 16 + 0.5, b.y + 12 + 0.5);
                gc.lineTo(b.x + b.width - 16 - 4 + 0.5, b.y + 12 + 7 + 0.5);
                gc.fill();
            }
            gc.fillText(text, b.x + 16 + 0.5, yText);
        } else {
            const wIcon = 16
            const hIcon = 16
            gc.font = params.font
            const wText = gc.measureText(text).width
            const padding = 8
            const wContent = wIcon + padding + wText
            gc.fillStyle = styleStatus.bg
            gc.fillRect(b.x + 8 + 0.5, b.y + 4, b.width - 16, b.height - 8)
            gc.fillStyle = style.getPropertyValue('--color-white')
            const xIcon = b.x + 8 + (b.width - wContent - 16) / 2 + 0.5
            styleStatus.getIcon(params, xIcon, b.y + (b.height - hIcon) / 2 - 0.5, wIcon, hIcon);
            gc.fillText(text, xIcon + wIcon + padding, yText)
        }
        gc.restore()

        return {
            mouseMove: e => {
                const rect = grid.div.getBoundingClientRect();
                let opt = (params.colDef.options || []).filter(x => x.value === params.displayValue);
                let displayTitle = (opt.length ? opt[0].label || opt[0].labelFixed : '') ? dataStorage.translate(opt.length ? opt[0].label || opt[0].labelFixed : '').toUpperCase() : ''
                showTooltip(displayTitle, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
                if (!isEditMode || !isAtive) return;
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
    } catch (error) {
        console.error('accountStatus - default function error: ', error)
    }
}
