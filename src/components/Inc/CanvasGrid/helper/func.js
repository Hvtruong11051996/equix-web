
export const calculateWidth = type => {
    return (function () {
        try {
            return require('../Type/' + type + '.js').size;
        } catch (ex) {
            return require('../Type/label.js').size
        }
    })()
}
export function truncateText(params, text = '', maxWidth) {
    const { gc } = params;
    let width = gc.measureText(text).width;
    const ellipsis = '…';
    const ellipsisWidth = gc.measureText(ellipsis).width;
    if (width <= maxWidth || width <= ellipsisWidth) {
        return text;
    } else {
        var len = text.length;
        while (width >= maxWidth - ellipsisWidth && len-- > 0) {
            text = text.substring(0, len);
            width = gc.measureText(text).width;
        }
        return text + ellipsis;
    }
}
export function pointInPath(point, objPoint) {
    return point.x >= objPoint.x && point.x <= objPoint.x + objPoint.w && point.y >= objPoint.y && point.y <= objPoint.y + objPoint.h
}
export function showTooltip(textTran, x, y, style) {
    if (!textTran) return;
    let div = document.getElementById('tooltip');
    if (!div) {
        div = document.createElement('div');
        div.id = 'tooltip';
        div.style.position = 'absolute';
        div.classList.add('size--2');
        document.body.appendChild(div);
    }
    div.innerHTML = textTran;
    if (style) Object.assign(div.style, style);
    const rect = div.getBoundingClientRect();
    const windowHeight = document.body.clientHeight;
    const windowWidth = document.body.clientWidth;
    if (x + 10 + rect.width >= windowWidth) {
        div.style.left = windowWidth - rect.width + 'px';
    } else {
        div.style.left = x + 10 + 'px';
    }
    if (y + 10 + rect.height >= windowHeight) {
        div.style.top = windowHeight - rect.height + 'px';
    } else {
        div.style.top = y + 10 + 'px';
    }
    div.style.opacity = 1;
}
export function hideTooltip(style) {
    const div = document.getElementById('tooltip');
    if (div) {
        div.style.opacity = 0;
        if (style) Object.assign(div.style, style);
    }
}
