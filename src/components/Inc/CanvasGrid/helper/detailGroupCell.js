import { showTooltip, hideTooltip } from '../helper/func';
import { drawArrowDown, drawArrowRight } from '../helper/draw';
export default (params) => {
    const { gc, config, style, value, data, grid, name, setRowDetailExpand, expand, rowHover, subPaint } = params
    const b = config.bounds
    const paddingLeft = params.level * 16;
    const draw = () => {
        gc.beginPath();

        if (params.waiting) {
            gc.fillStyle = params.rowStyle;
            gc.fillRect(b.x, b.y, b.width, b.height);
        }
        if (rowHover) {
            gc.fillStyle = style.getPropertyValue('--ascend-default');
            gc.fillRect(paddingLeft + 4, b.y + 4, 24, 24)
        }
        gc.fillStyle = style.getPropertyValue('--secondary-default');
        if (params.waiting) drawArrowRight(params, paddingLeft + Math.round((params.time / 100) % 8), b.y + 4, 24, 24);
        else if (expand) drawArrowDown(params, paddingLeft + 4, b.y + 4, 24, 24);
        else drawArrowRight(params, paddingLeft + 4, b.y + 4, 24, 24);

        gc.closePath();

        gc.beginPath();
        gc.textAlign = 'left';
        const p = { ...params, colDef: { ...params.colDef, align: 'left' }, config: { ...config, bounds: { x: paddingLeft + 28, y: b.y, width: b.width - paddingLeft - 28, height: b.height } } }
        subPaint(p);
        gc.closePath();
    }
    draw();
    return {
        frame: (time) => {
            if (params.waiting) {
                params.time = time;
                draw();
            }
        },
        click: (e) => {
            if (params.waiting) return;
            const p = e.detail.gridPoint;
            if (p.x >= paddingLeft + 4 && p.x <= paddingLeft + 28 && p.y >= b.y + 4 && p.y <= b.y + 28) {
                e.preventDefault();
                setRowDetailExpand(!expand);
                if (!expand && !Array.isArray(params.root._detail[params.key])) {
                    params.waiting = true;
                    params.root.props.detailSource(data, (detailData) => {
                        params.waiting = false;
                        params.root._detail[params.key] = detailData;
                        params.root.setData();
                    });
                }
            }
        },
        mouseMove: e => {
            const p = e.detail.gridPoint;
            if (p.x >= paddingLeft + 4 && p.x <= paddingLeft + 28 && p.y >= b.y + 4 && p.y <= b.y + 28) {
                grid.div.style.cursor = 'pointer';
            }
            const rect = grid.div.getBoundingClientRect();
            showTooltip(params.displayValue, rect.x + e.detail.gridPoint.x + 10, rect.y + e.detail.gridPoint.y);
        },
        mouseLeave: e => {
            hideTooltip();
        }
    }
}
