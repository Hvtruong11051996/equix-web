import dataStorage from '../../../../dataStorage';
import { truncateText, showTooltip, hideTooltip } from '../helper/func';
import { drawMenuIcon, drawFilter, drawSortAsc, drawSortDesc } from '../helper/draw';
import Menu from './MenuHeader';

export default (params) => {
    const { gc, config, style, hover, grid, menuActive, colDef, colState, isFirst } = params;
    const b = config.bounds
    const paddingHorizontal = 8
    const hMenu = 16;
    const wMenu = 16;

    // draw background
    gc.beginPath()
    gc.fillStyle = style.getPropertyValue('--primary-default')
    gc.fillRect(b.x, b.y, b.width, b.height)
    gc.closePath()

    // draw vertical line right
    gc.beginPath()
    gc.strokeStyle = style.getPropertyValue('--primary-dark')
    gc.lineWidth = 2;
    const startX = b.x + b.width - 1
    gc.moveTo(startX, b.y)
    gc.lineTo(startX, b.y + b.height)
    gc.stroke()
    gc.lineWidth = 1;
    gc.closePath()

    const headerColor = style.getPropertyValue('--secondary-dark') || '#c5cbce'
    // draw text
    gc.beginPath();
    gc.fillStyle = headerColor
    gc.textBaseline = 'middle'
    gc.font = params.root.fontHeader;
    let padding = paddingHorizontal * 2;
    if (hover || menuActive) padding += wMenu;
    if (params.colState.filter) padding += 16;
    if (colState.sort) padding += 16;
    const titleTran = colDef.headerFixed ? (colDef.headerFixed + '').toUpperCase() : dataStorage.translate(colDef.header).toUpperCase();

    const maxTextWidth = b.width - padding;
    const text = truncateText(params, titleTran, maxTextWidth);
    let paddingLeft = paddingHorizontal + gc.measureText(text).width;
    let x = b.x + paddingHorizontal;
    const y = b.y + Math.ceil(b.height / 2) + 0.5;
    gc.font = params.root.fontHeader;
    gc.fillText(text, x, y);
    gc.closePath();

    // draw filter
    if (params.colState.filter) {
        gc.beginPath();
        gc.fillStyle = headerColor
        drawFilter(params, b.x + paddingLeft, b.y + 10, 16, 12);
        gc.closePath();
        paddingLeft += 16;
    }

    if (colState.sort === 'desc') {
        drawSortDesc(params, b.x + paddingLeft, b.y + 10, 16, 12);
    } else if (colState.sort === 'asc') {
        drawSortAsc(params, b.x + paddingLeft, b.y + 10, 16, 12);
    }

    // draw menu icon
    const xMenu = b.x + b.width - paddingHorizontal - wMenu;
    const yMenu = (b.height - hMenu) / 2;
    if (hover || menuActive) {
        drawMenuIcon(params, xMenu, yMenu, wMenu, hMenu);
    }

    // trigger event
    return {
        click: (e) => {
            const p = e.detail.gridPoint;
            if (p.x >= xMenu && p.x <= xMenu + wMenu && p.y >= yMenu && p.y <= yMenu + hMenu) {
                let div = document.getElementById('grid-menu-header');
                if (!div) {
                    div = document.createElement('div');
                    div.id = 'grid-menu-header';
                    document.body.appendChild(div);
                    div.style.position = 'absolute';
                    div.style.minWidth = '266px';
                    div.style.display = 'block';
                    div.style.zIndex = 1000;
                }
                ReactDOM.render(<Menu event={e} grid={grid} params={params} />, div);
                if (window.innerWidth - e.detail.clientPoint.x > 266) {
                    div.style.left = e.detail.clientPoint.x + 'px';
                } else {
                    div.style.left = e.detail.clientPoint.x - 266 + 'px';
                }
                div.style.top = e.detail.clientPoint.y + 'px';
                return;
            }
            if (!params.colDef.suppressSort && (p.x <= b.x + b.width - 8 && p.x >= b.x + 8)) params.root.sortColumn(colDef);
        },
        mouseMove: e => {
            const p = e.detail.gridPoint;
            if (p.x >= xMenu && p.x <= xMenu + wMenu && p.y >= yMenu && p.y <= yMenu + hMenu) {
                grid.div.style.cursor = 'pointer';
            }
            // if (text.length !== titleTran.length) {
            const rect = grid.div.getBoundingClientRect();
            let headerTooltip = colDef.headerTooltip || titleTran;
            showTooltip(headerTooltip, rect.x + e.detail.gridPoint.x, rect.y + e.detail.gridPoint.y);
            // }
        },
        mouseLeave: e => {
            hideTooltip();
        }
    }
}
