export default {
    getCandleStyle: (style) => ({
        'mainSeriesProperties.candleStyle.upColor': style.getPropertyValue('--buy-light').trim(),
        'mainSeriesProperties.candleStyle.downColor': style.getPropertyValue('--sell-light').trim(),
        'mainSeriesProperties.candleStyle.borderUpColor': style.getPropertyValue('--buy-light').trim(),
        'mainSeriesProperties.candleStyle.borderDownColor': style.getPropertyValue('--sell-light').trim(),
        'mainSeriesProperties.candleStyle.wickUpColor': style.getPropertyValue('--buy-light').trim(),
        'mainSeriesProperties.candleStyle.wickDownColor': style.getPropertyValue('--sell-light').trim()
    }),
    getVolumnStyle: (style) => ({
        'volume.volume.color.0': style.getPropertyValue('--sell-dark').trim(),
        'volume.volume.color.1': style.getPropertyValue('--buy-dark').trim(),
        'volume.volume.transparency': 100
    })
}
