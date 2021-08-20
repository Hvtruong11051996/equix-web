import { drawCheckboxIntermediate, drawCheckbox, drawCheckboxEmpty } from '../helper/draw';
export function size(params) {
    return 40;
}

export default function (params) {
    const { gc, config, grid, style, value, root, name, data } = params;
    if (params.data && params.data._provider) return
    gc.beginPath();
    const b = config.bounds;
    const height = 18;
    const width = 18;
    const xImg = b.x + 8 + 0.5;
    const yImg = b.y + Math.round((b.height - height) / 2) + 0.5;
    gc.fillStyle = params.rowTextStyle;
    if (params.isHeader) {
        const len = root._listData.filter(item => item[name]).length;
        if (len === 0) drawCheckboxEmpty(params, xImg, yImg, width, height);
        else if (len === root._listData.length) drawCheckbox(params, xImg, yImg, width, height);
        else drawCheckboxIntermediate(params, xImg, yImg, width, height)
    } else {
        value ? drawCheckbox(params, xImg, yImg, width, height) : drawCheckboxEmpty(params, xImg, yImg, width, height);
    }
    gc.closePath();
    return {
        click: e => {
            if (params.isHeader) {
                if (root._listData.filter(item => item[name]).length === root._listData.length) {
                    root._listData.forEach(item => delete item[name]);
                } else root._listData.forEach(item => item[name] = true);
                if (root.props.onRowClicked) root.props.onRowClicked();
            } else {
                if (data[name]) delete data[name];
                else data[name] = true;
            }
            grid.repaint();
        }
    }
}
