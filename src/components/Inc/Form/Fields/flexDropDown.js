import React from 'react';
import DropDown from '../../../DropDown';
import dataStorage from '../../../../dataStorage';
class FlexDropDown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.data.branch
        }
        this.renderBranchName = this.renderBranchName.bind(this);
        this.renderDropdown = this.renderDropdown.bind(this);
    }
    renderBranchName() {
        const ListBranch = dataStorage.dicBranch || [];
        if (ListBranch && ListBranch.length) {
            for (let i = 0; i < ListBranch.length; i++) {
                if (this.props.data.branch === ListBranch[i].branch_id) {
                    return this.name = ListBranch[i].branch_name;
                }
            }
        }
        return this.name = '--';
    }
    handleOnChangeAll(data) {
        this.props.onChange(data);
    }
    renderDropdown() {
        const ListBranch = dataStorage.dicBranch || [];
        const options = []
        if (ListBranch && ListBranch.length) {
            ListBranch.map(item => {
                options.push({ label: item.branch_name, value: item.branch_id })
            })
        }
        return <DropDown
            ref={dom => this.props.setDom(dom)}
            onChange={this.handleOnChangeAll.bind(this)}
            options={options}
            value={this.props.data.branch}
        />
    }
    render() {
        if (!this.props.editable || !this.props.data.account_id) {
            return (
                <div className={`showTitle`}>
                    <div className='box-overflow'>
                        <div className='text-overflow'>{this.renderBranchName()}</div>
                    </div>
                </div>
            )
        }
        return <div className={'qe-dropdown-none'}>
            {this.renderDropdown()}
        </div>
    }
}
export default FlexDropDown;
