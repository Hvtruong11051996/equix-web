import React from 'react';
import SearchAccount from '../../../SearchAccount';
import Lang from '../../../Inc/Lang';
import dataStorage from '../../../../dataStorage'
import { func } from '../../../../storage';
import { emitter, eventEmitter } from '../../../../constants/emitter_enum';
import logger from '../../../../helper/log'
export default class ListAccount extends React.Component {
    constructor(props) {
        super(props);
        this.listAccount = [];
        this.state = {
            account_id: '',
            listAccount: [],
            isConnected: dataStorage.connected
        }
        this.isRetail = true;
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
    }
    componentWillReceiveProps(props) {
        // console.log('-----------', props);
    }
    dataReceivedFromSearchAccount(data, lastSearchString) {
        try {
            if (data) {
                this.lastAccountId = data.account_id;
                this.listAccount.push(data.account_id);
                this.props.onChange(this.listAccount.join(','));
                this.setState({
                    listAccount: this.listAccount,
                    account_id: ''
                })
            }
        } catch (error) {
            logger.log(error)
        }
    }
    removeAccount(index) {
        try {
            this.listAccount.splice(index, 1);
            this.props.onChange(this.listAccount.join(','));
            this.setState({
                listAccount: this.listAccount
            })
            this.forceUpdate();
        } catch (error) {
            logger.log(error)
        }
    }
    render() {
        try {
            return (
                <div className={`qe-accountList qe-col-2-3 ${this.props.schema.title}`} title={this.props.schema.title}>
                    <div className='qe-row'>
                        <div className='qe-label'><Lang>lang_account_id_uppercase</Lang></div>
                        <SearchAccount
                            className={this.listAccount.length >= 1 && this.isRetail ? 'qe-disabled-createUser' : null}
                            showInactiveAccount={true}
                            accountSumFlag={true}
                            dataReceivedFromSearchAccount={this.dataReceivedFromSearchAccount.bind(this)}
                            actionButton={'ADD...'}
                            required={'noNeed'}
                            objDicAccount={this.state.listAccount}
                            CreateAccount={true}
                            isRetail={this.isRetail}
                        />
                    </div>
                    {this.props.formData ? this.listAccount.map((accountId, index) => {
                        if (this.state.listAccount) {
                            return (
                                <div key={accountId} className='qe-row qe-extend-row'>
                                    <div className='qe-label showTitle'>
                                        {(this.state.listAccount || {}).account_name || '--'} ({accountId || ''})
                                    </div>
                                    <div className={`qe-value text-uppercase qe-removeButton ${!this.state.isConnected ? 'qe-listAcc-row-disabled' : ''} showTitle`} onClick={() => this.removeAccount(index)}>
                                        <Lang>lang_remove</Lang>
                                    </div>
                                </div>
                            )
                        }
                    }) : null}
                </div>
            )
        } catch (error) {
            logger.log('render error SearchAccount Create user', error)
        }
    }
    componentDidMount() {
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
    }
    componentWillUnmount() {
        this.emitConnectionID && this.emitConnectionID.remove();
    }
    changeConnection(isConnected) {
        this.setState({
            isConnected
        })
    }
}
