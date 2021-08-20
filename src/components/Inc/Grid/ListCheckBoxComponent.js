import Lang from '../Lang'
class ListCheckBoxComponent {
    init(agParams) {
        this.agParams = agParams;
        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-cell-label-container';
        this.dicCheck = {}
        this.dicFilter = []
        ReactDOM.render(this.renderToDom(), this.eGui, () => {
            this.setModel(this.model)
        })
        this.triggerCheckbox()
    };
    renderToDom() {
        return (
            <div className="lst-check-filter">
                <div className={`check-filter-header check-filter-item showTitle checked`} onClick={() => this.isCkeckAll()}>All</div>
                {
                    this.agParams.colDef.filterVal.map(item => {
                        this.dicCheck[item.value] = true;
                        return <div
                            className={`check-filter-item showTitle ${this.dicCheck[item.value] ? 'checked' : ''}`}
                            val={item.value}
                            onClick={() => this.onChangeCheck(item.value)}
                        >
                            <span className='text-overflow'>{typeof item.label === 'string' ? <Lang>{item.label}</Lang> : item.label} </span>
                        </div>
                    })
                }
            </div>
        )
    }

    onChangeCheck = (value) => {
        this.dicCheck[value] = !this.dicCheck[value]
        const element = this.eGui.querySelector('[val="' + value + '"]')
        if (element) {
            if (this.dicCheck[value]) element.classList.add('checked')
            else element.classList.remove('checked')
        }
        this.agParams.filterChangedCallback();
    }

    isCkeckAll = () => {
        const isCheck = Object.keys(this.dicCheck).filter(key => this.dicCheck[key]).length === this.agParams.column.colDef.filterVal.length
        this.agParams.colDef.filterVal.map(item => {
            this.dicCheck[item.value] = !isCheck;
            const element = this.eGui.querySelector('[val="' + item.value + '"]')
            if (this.dicCheck[item.value]) element.classList.add('checked')
            else element.classList.remove('checked')
        })
        this.triggerCheckbox()
        this.agParams.filterChangedCallback();
    }

    triggerCheckbox = () => {
        if (this.eGui.querySelector('.check-filter-header')) {
            const lengthDicCheck = Object.keys(this.dicCheck).filter(key => this.dicCheck[key]).length
            const isCheck = lengthDicCheck === this.agParams.column.colDef.filterVal.length
            if (isCheck) {
                this.eGui.querySelector('.check-filter-header').className = 'check-filter-header check-filter-item showTitle checked'
            } else if (lengthDicCheck) {
                this.eGui.querySelector('.check-filter-header').className = 'check-filter-header check-filter-item showTitle checkItem'
            } else {
                this.eGui.querySelector('.check-filter-header').className = 'check-filter-header check-filter-item showTitle'
            }
        }
    }

    isFilterActive() {
        const lst = Object.keys(this.dicCheck)
        return lst.length !== lst.filter(key => {
            return this.dicCheck[key]
        }).length
    }

    doesFilterPass(params) {
        if (this.valueGetter) {
            const value = this.valueGetter(params.node).toString();
            return this.dicCheck[value];
        }
        const valueFilter = params.data[this.agParams.colDef.field]
        if (this.dicFilter && (this.dicFilter.indexOf(valueFilter) > -1 || this.dicFilter.indexOf(valueFilter + '') > -1)) {
            return true
        }
        return this.dicCheck[params.data[this.agParams.colDef.field]];
    }

    agInit = (params) => {
        this.params = params;
        this.valueGetter = params.valueGetter;
    }

    getModel = (value) => {
        this.dicFilter = []
        let filterAll = 1
        Object.keys(this.dicCheck).map(item => {
            if (this.dicCheck[item]) {
                if (item.includes('##')) {
                    const arrItem = item.match(/[^##]+/g)
                    arrItem.map(itemFilter => {
                        this.dicFilter.push(itemFilter)
                    })
                }
                this.dicFilter.push(item)
            } else filterAll = 0
        })
        if (!this.dicFilter.length) {
            if (this.agParams.colDef.filterType === 'text') this.dicFilter = ['fake logic filter']
            else this.dicFilter = [-1]
        }
        this.triggerCheckbox()
        return {
            value: this.dicFilter,
            operator: 'OR',
            filterType: this.agParams.colDef.filterType,
            checkAll: filterAll
        }
    };

    setModel = (model) => {
        this.model = model;
        const dic = {}
        let checkedAll = true
        if (model) {
            model.value.map(key => {
                dic[key] = true
            })
        }
        this.agParams.colDef.filterVal.map(item => {
            this.dicCheck[item.value] = model ? !!dic[item.value] : true;
        })
        this.eGui.querySelectorAll('.check-filter-item').forEach(item => {
            if (this.dicCheck[item.getAttribute('val')]) item.classList.add('checked')
            else {
                item.classList.remove('checked')
                checkedAll = false
            }
        })
        const checkHeader = this.eGui.querySelector('.check-filter-header')
        if (checkHeader) {
            if (checkedAll) checkHeader.classList.add('checked')
            else {
                checkHeader.classList.remove('checked')
            }
        }
    };

    componentMethod(message) {
        alert(`Alert from PartialMatchFilterComponent ${message}`);
    }

    destroy() {
        ReactDOM.render(null, this.eGui)
    }

    getGui() {
        return this.eGui;
    };
}
export default ListCheckBoxComponent
