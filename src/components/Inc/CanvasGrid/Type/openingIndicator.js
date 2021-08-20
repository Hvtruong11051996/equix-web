import { drawCheckCircle, drawCloseCircle, drawLoading } from '../helper/draw';

export function size(params) {
    return 40;
}

export default function (params) {
    const { gc, config, style, data } = params
    if (params.data && params.data._provider) return
    if (params.isHeader) return;
    const b = config.bounds
    const wIcon = 16
    const hIcon = 16
    if (!data.create_status) {
        gc.fillStyle = params.rowTextStyle;
        drawLoading(params, b.x + (b.width - wIcon) / 2 + 0.5, b.y + (b.height - hIcon) / 2 + 0.5, wIcon, hIcon);
    } else if (data.create_status === 'FAILED') {
        gc.fillStyle = style.getPropertyValue('--semantic-danger');
        drawCloseCircle(params, b.x + (b.width - wIcon) / 2 + 0.5, b.y + (b.height - hIcon) / 2 + 0.5, wIcon, hIcon);
    } else {
        gc.fillStyle = style.getPropertyValue('--semantic-success');
        drawCheckCircle(params, b.x + (b.width - wIcon) / 2 + 0.5, b.y + (b.height - hIcon) / 2 + 0.5, wIcon, hIcon);
    }
}
