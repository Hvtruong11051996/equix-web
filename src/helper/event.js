const cbs = {};
export const EVENTNAME = {
    themeChanged: 'themeChanged',
    fontChanged: 'fontChanged',
    connectionChanged: 'connectionChanged',
    clickToRefresh: 'clickToRefresh',
    refreshDataAccount: 'refreshDataAccount',
    chartLayoutChange: 'chartLayoutChange',
    marketDataTypeChanged: 'marketDataTypeChanged',
    loginChanged: 'loginChanged'
}
export const dispatchEvent = (eventName, data) => {
    if (cbs[eventName]) {
        cbs[eventName].forEach(cb => {
            setTimeout(() => cb(data), 0);
        })
    }
}
export const addEventListener = (eventName, cb) => {
    if (typeof cb === 'function') {
        if (!cbs[eventName]) cbs[eventName] = [cb];
        else if (!cbs[eventName].includes(cb)) cbs[eventName].push(cb);
    }
}
export const removeEventListener = (eventName, cb) => {
    if (cbs[eventName] && typeof cb === 'function') {
        const index = cbs[eventName].indexOf(cb);
        if (index > -1) {
            cbs[eventName].splice(index, 1);
        }
        if (!cbs[eventName].length) delete cbs[eventName];
    }
}
