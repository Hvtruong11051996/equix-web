export default function (params) {
    const { gc, config, style, colDef, data } = params
    if (params.data && params.data._provider) return
    const b = config.bounds
    const side = (data.side + '').toUpperCase() === 'BID' ? 'bid' : 'ask'
    const indicator = colDef.getIndicator()
    const percentWidth = b.width * indicator[side][params.root._listData.indexOf(params.dataOrigin)]
    gc.fillStyle = (data.side + '').toUpperCase() === 'BID' ? style.getPropertyValue('--buy-dark') : style.getPropertyValue('--sell-dark');
    const x = colDef.right ? b.width - percentWidth : b.x
    gc.fillRect(x, b.y, percentWidth, b.height);
    gc.closePath();
    return {}
}
