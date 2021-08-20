import ReactDOM from 'react-dom';
import React from 'react';
import Lang from '../Lang';
class HeaderComponent {
    init(agParams) {
        this.agParams = agParams;
        this.eGui = document.createElement('div');
        this.eGui.className = this.agParams.column.colDef.customTooltip ? 'ag-cell-label-container' : 'ag-cell-label-container showTitle';
        this.eGui.innerHTML = `
            <div class="customHeaderLabel">
                <div class="text"><div class="text1 size--2"></div><div class="text2"></div></div>
                <div class="icon customFilterLabel"><span class="ag-icon ag-icon-filter" /></div>
                <div class="icon customSortDownLabel"><span class="ag-icon ag-icon-desc" /></div>
                <div class="icon customSortUpLabel"><span class="ag-icon ag-icon-asc" /></div>
            </div>
            <div class="customHeaderMenuButton"><span class="ag-icon ag-icon-menu" /></div>`;
        // if (agParams.column.colId.startsWith('ag-Grid-AutoColumn')) {
        //   this.eGui.innerHTML = `
        //     <div class="customHeaderLabel">
        //         <div class="text"><div class="text1 size--2"></div><div class="text2"></div></div>
        //     </div>`;
        // }
        this.eSortDownButton = this.eGui.querySelector('.customSortDownLabel');
        this.eSortUpButton = this.eGui.querySelector('.customSortUpLabel');
        if (this.agParams.column.colDef.lst && this.agParams.column.colDef.lst.length) {
            ReactDOM.render(<Lang>{this.agParams.column.colDef.lst[0].headerName}</Lang>, this.eGui.querySelector('.customHeaderLabel .text1'));
            if (this.agParams.column.colDef.lst[1]) {
                ReactDOM.render(<Lang>{this.agParams.column.colDef.lst[1].headerName}</Lang>, this.eGui.querySelector('.customHeaderLabel .text2'));
            }
        } else {
            if (this.agParams.column.colDef.headerFixed) this.eGui.querySelector('.customHeaderLabel .text1').innerHTML = this.agParams.column.colDef.headerFixed
            else ReactDOM.render(<Lang>{this.agParams.column.colDef.headerName}</Lang>, this.eGui.querySelector('.customHeaderLabel .text1'));
            if (this.agParams.column.colDef.headerIsNumber) this.eGui.querySelector('.customHeaderLabel .text1').classList.add('headerIsNumber')
            if (this.agParams.column.colDef.customTooltip) this.eGui.querySelector('.customHeaderLabel .text1').title = this.agParams.column.colDef.customTooltip
        }
        this.eMenuButton = this.eGui.querySelector('.customHeaderMenuButton');
        this.eSortRemoveButton = this.eGui.querySelector('.customSortRemoveLabel');
        this.eHeaderLabel = this.eGui.querySelector('.customHeaderLabel');
        this.eFilterLabel = this.eGui.querySelector('.customFilterLabel');

        if (this.agParams.enableMenu) {
            this.onMenuClickListener = this.onMenuClick.bind(this);
            this.eMenuButton && this.eMenuButton.addEventListener('click', this.onMenuClickListener);
        } else {
            this.eMenuButton && this.eGui.contains(this.eMenuButton) && this.eGui.removeChild(this.eMenuButton);
        }

        if (this.agParams.enableSorting) {
            this.eHeaderLabel && this.eHeaderLabel.addEventListener('click', this.onSortRequested.bind(this));
            if (agParams.column.colDef.sortable !== false) {
                this.onSortChangedListener = this.onSortChanged.bind(this);
                this.agParams.column.addEventListener('sortChanged', this.onSortChangedListener);
            }
            this.onFilterChangedListener = this.onFilterChanged.bind(this);
            this.agParams.column.addEventListener('filterChanged', this.onFilterChangedListener);
            this.onSortChanged();
            this.onFilterChanged();
        } else {
            if (!agParams.column.colDef.sortable) {
                this.eSortDownButton && this.eSortDownButton.parentNode.removeChild(this.eSortDownButton);
                this.eSortUpButton && this.eSortUpButton.parentNode.removeChild(this.eSortUpButton);
            }
            // this.eSortRemoveButton.parentNode.removeChild(this.eSortRemoveButton);
        }
    };
    onFilterChanged() {
        if (this.agParams.column.isFilterActive()) {
            this.eFilterLabel && this.eFilterLabel.classList.add('active');
        } else {
            this.eFilterLabel && this.eFilterLabel.classList.remove('active');
        }
    }
    onSortChanged() {
        if (this.agParams.column.isSortAscending()) {
            this.eSortDownButton && this.eSortDownButton.classList.remove('active');
            this.eSortUpButton && this.eSortUpButton.classList.add('active');
        } else if (this.agParams.column.isSortDescending()) {
            this.eSortUpButton && this.eSortUpButton.classList.remove('active');
            this.eSortDownButton && this.eSortDownButton.classList.add('active');
        } else {
            this.eSortDownButton && this.eSortDownButton.classList.remove('active');
            this.eSortUpButton && this.eSortUpButton.classList.remove('active');
        }
    };

    getGui() {
        return this.eGui;
    };

    onMenuClick() {
        this.eMenuButton && this.agParams.showColumnMenu(this.eMenuButton);
    };

    onSortRequested(event) {
        if (this.agParams.column.colId.startsWith('ag-Grid-AutoColumn')) return;
        if (this.agParams.column.colDef.sortable !== false) {
            if (this.agParams.column.isSortAscending()) {
                this.agParams.setSort('desc', event.shiftKey);
            } else if (this.agParams.column.isSortDescending()) {
                this.agParams.setSort('', event.shiftKey);
            } else {
                this.agParams.setSort('asc', event.shiftKey);
            }
        }
    };

    destroy() {
        if (this.onMenuClickListener) {
            this.eMenuButton && this.eMenuButton.removeEventListener('click', this.onMenuClickListener)
        }
        this.eHeaderLabel && this.eHeaderLabel.removeEventListener('click', this.onSortRequestedListener);
        this.agParams.column.removeEventListener('sortChanged', this.onSortChangedListener);
        this.agParams.column.removeEventListener('filterChanged', this.onFilterChangedListener);
    };
}
export default HeaderComponent
