export default function (params) {
    const { gc, config, value, style } = params;
    if (params.data && params.data._provider) return
    const b = config.bounds
    // this.drawerCellBackground(gc, config)
    const data = this.convertData(config.field, config.dataRow)
    let bg = this.getBackgroundDropdown(config.field, config.dataRow[config.field]) || style.getPropertyValue('--primary-light')
    let text = (data && data.text) || data
    if (!text) {
        text = config.dataRow.isGroup ? EMPTY_VALUE : DEFAULT_VALUE
        const isSelected = this.isSelected(config)
        const isHover = this.isHover(config)
        bg = getRowBg(isSelected, isHover, config.dataRow.isOdd)
    }
    gc.beginPath();
    gc.font = params.font
    const width = gc.measureText(text).width + 24 + ((text + '').split(',').length * 8)
    b.width = width - 16
    cv.fillTextWithBg({
        gc,
        options: {
            b,
            text,
            bg,
            color: params.rowTextStyle
        }
    })
    gc.closePath();
}
