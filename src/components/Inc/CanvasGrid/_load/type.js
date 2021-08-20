export default col => {
    return (function() {
        try {
            return {
                fn: require('../Type/' + col.type + '.js').default,
                renderer: col.type
            }
        } catch (ex) {
            return {
                fn: require('../Type/label.js').default,
                renderer: 'label'
            }
        }
    })()
}
