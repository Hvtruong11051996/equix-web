import { showTooltip, hideTooltip } from '../helper/func';
import { drawArrowDown, drawArrowRight } from '../helper/draw';
let sub = {}
export default (params) => {
    const { gc, config, style, value, data, grid, name, setRowExpand, expand, rowHover, subPaint, isLastVisible } = params
    if (isLastVisible) {
        const b = config.bounds

        gc.beginPath();
        const paddingLeft = params.level * 16;
        if (rowHover) {
            gc.fillStyle = style.getPropertyValue('--ascend-default');
            gc.fillRect(paddingLeft + 4, b.y + 4, 24, 24)
        }
        gc.fillStyle = style.getPropertyValue('--secondary-default');
        if (expand) {
            drawArrowDown(params, paddingLeft + 4, b.y + 4, 24, 24);
        } else {
            drawArrowRight(params, paddingLeft + 4, b.y + 4, 24, 24);
        }
        gc.fill();
        gc.closePath();

        gc.beginPath();
        let totalWidth = params.grid.renderer.visibleColumns.reduce((a, c) => a += c.width, 0);
        let canvasWidth = totalWidth > params.grid.div.clientWidth ? params.grid.div.clientWidth - paddingLeft - 28 - 4 : totalWidth - paddingLeft - 28 - 4
        const p = { ...params, colDef: { ...params.colDef, align: 'left' }, config: { ...config, bounds: { x: paddingLeft + 28, y: b.y, width: canvasWidth, height: b.height } } }
        delete p.isLast;
        sub = subPaint(p);
        gc.closePath();
    }
    return {
        click: (e) => {
            if (sub.editGroup) {
                let check = sub.click(e, params);
                if (!check) {
                    setRowExpand(!expand);
                }
            } else {
                setRowExpand(!expand);
            }
        },
        mouseEnter: () => {
        },
        mouseMove: e => {
            if (sub.isMargin) {
                let text = `${params.displayValue}% MARGIN ${params.data.description ? `(${params.data.description})` : ''}`
                grid.div.style.cursor = 'pointer';
                const rect = grid.div.getBoundingClientRect();
                showTooltip(text, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
            } else {
                grid.div.style.cursor = 'pointer';
                const rect = grid.div.getBoundingClientRect();
                showTooltip(params.displayValue, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
            }
        },
        mouseLeave: e => {
            hideTooltip();
        }
    }
}
