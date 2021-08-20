class CellRenderer {
    init(agParams) {
        this.agParams = agParams
        this.renderCellCallBack = agParams.colDef.reactCellRenderer
        this.eGui = document.createElement('div');
        ReactDOM.render(this.renderCellCallBack(this.agParams), this.eGui)
    }
    getGui() {
        return this.eGui;
    }
    destroy() {
        ReactDOM.render(null, this.eGui)
    };
}

export default CellRenderer
