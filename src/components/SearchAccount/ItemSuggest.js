import React from 'react';
import Icon from '../Inc/Icon';
import Color from '../../constants/color'
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon';
class ItemSuggest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            item: props.item,
            exist: props.exist
        }
    }

    componentWillReceiveProps(nextProps) {
        try {
            if (nextProps.item) {
                this.setState({
                    item: nextProps.item,
                    exist: nextProps.exist
                })
            }
        } catch (error) {
            logger.error('componentWillReceiveProps On SearchBox' + error)
        }
    }

    handleOnClickSearch() {
        try {
            this.setState(prevState => ({ exist: !prevState.exist }))
            this.props.clickItemSuggest(this.state.item)
        } catch (error) {
            logger.error('handleOnClickSearch On SearchBox' + error)
        }
    }

    removeItem() {
        this.setState(prevState => ({ exist: !prevState.exist }))
        this.props.removeItem(this.state.item)
    }

    render() {
        try {
            let description = '';
            if (this.state.item.advisor_code) {
                description = `Description: Manage all Accounts belonged to Advisor Code ${this.state.item.advisor_code} of Branch Code ${this.state.item.branch_code} of Organisation Code ${this.state.item.organisation_code}`
            } else if (this.state.item.branch_code) {
                description = `Description: Manage all Advisor Codes & Accounts belonged to Branch Code ${this.state.item.branch_code} of Organisation Code ${this.state.item.organisation_code}`
            } else if (this.state.item.organisation_code) {
                description = `Description: Manage all Branch Codes, Advisor Codes & Accounts belonged to Organisation Code ${this.state.item.organisation_code}`
            }
            if (this.state.exist) {
                return (
                    <div onClick={() => this.removeItem()} id={`itemSuggest_${this.props.id}_${this.props.keyItem}`} className={`itemSuggest searchAllAccounts ${this.props.isCode ? '' : 'showTitle'}  ${this.props.className || ''}`} key={this.props.keyItem} title={description}>
                        <div className='qe-suggest-account-create-user'>
                            <SvgIcon path={path.mdiCheck} fill='var(--ascend-default)' />
                        </div>
                        <div>
                            {
                                this.props.isCode ? <div className='qe-form-row-left'>
                                    {
                                        this.state.item.organisation_code ? <div className='qe-form-account-box bg-green'>{this.state.item.organisation_code}</div> : null
                                    }
                                    {
                                        this.state.item.branch_code ? <div className='qe-form-account-box bg-orange'>{this.state.item.branch_code}</div> : null
                                    }
                                    {
                                        this.state.item.advisor_code ? <div className='qe-form-account-box bg-blue'>{this.state.item.advisor_code}</div> : null
                                    }
                                    {
                                        this.state.item.account_id ? <div className='qe-form-account-box bg-gray'>{`${this.state.item.account_name} (${this.state.item.account_id})`}</div> : null
                                    }
                                </div> : <div>
                                        {`${this.state.item.account_name ? this.state.item.account_name + ' ' : ''} (${this.state.item.account_id})`}
                                    </div>
                            }
                        </div>
                    </div>
                )
            }
            if (this.props.CreateAccount) {
                return (
                    <div id={`itemSuggest_${this.props.id}_${this.props.keyItem}`} className={`itemSuggest searchAllAccounts ${this.props.isCode ? '' : 'showTitle'}  ${this.props.className || ''}`} key={this.props.keyItem} onClick={this.handleOnClickSearch.bind(this)}
                        title={description}>
                        <div className='qe-suggest-account-create-user'>
                            <Icon src='content/add'></Icon>
                        </div>
                        {
                            this.props.isCode ? <div className='qe-form-row-left'>
                                {
                                    this.state.item.organisation_code ? <div className='qe-form-account-box bg-green'>{this.state.item.organisation_code}</div> : null
                                }
                                {
                                    this.state.item.branch_code ? <div className='qe-form-account-box bg-orange'>{this.state.item.branch_code}</div> : null
                                }
                                {
                                    this.state.item.advisor_code ? <div className='qe-form-account-box bg-blue'>{this.state.item.advisor_code}</div> : null
                                }
                                {
                                    this.state.item.account_id ? <div className='qe-form-account-box bg-gray'>{`${this.state.item.account_name} (${this.state.item.account_id})`}</div> : null
                                }
                            </div> : <div>
                                    {`${this.state.item.account_name} (${this.state.item.account_id})`}
                                </div>
                        }
                    </div>
                )
            }
            return (
                <div id={`itemSuggest_${this.props.id}_${this.props.keyItem}`} className={`itemSuggest searchAllAccounts ${this.props.isCode ? '' : 'showTitle'}`} key={this.props.keyItem} onClick={this.handleOnClickSearch.bind(this)}
                    title={description}>
                    <div>
                        {this.props.isCustomField ? <Icon src='content/add'></Icon> : <SvgIcon path={path.mdiAccount} />}
                    </div>
                    {
                        this.props.isCode ? <div className='qe-form-row-left'>
                            {
                                this.state.item.organisation_code ? <div className='qe-form-account-box bg-green'>{this.state.item.organisation_code}</div> : null
                            }
                            {
                                this.state.item.branch_code ? <div className='qe-form-account-box bg-orange'>{this.state.item.branch_code}</div> : null
                            }
                            {
                                this.state.item.advisor_code ? <div className='qe-form-account-box bg-blue'>{this.state.item.advisor_code}</div> : null
                            }
                            {
                                this.state.item.account_id ? <div className='qe-form-account-box bg-gray'>{`${this.state.item.account_name ? this.state.item.account_name + ' ' : ''} (${this.state.item.account_id})`}</div> : null
                            }
                        </div> : <div>
                                {`${this.state.item.account_name ? this.state.item.account_name + ' ' : ''}(${this.state.item.account_id || this.state.item.equix_id})`}
                            </div>
                    }
                </div>
            )
        } catch (error) {
            logger.error('render On SearchBox' + error)
        }
    }
}

export default ItemSuggest
