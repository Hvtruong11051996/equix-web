export default field => {
    return (function() {
        try {
            return require('./Fields/' + field.type + '.js').default
        } catch (ex) {
            return require('./Fields/label.js').default
        }
    })()
}
