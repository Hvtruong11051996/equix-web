import DropDown from '../../../DropDown';
import Lang from '../../Lang';
import { getData, getUserGroupUrl } from '../../../../helper/request';
import { registerAllOrders, unregisterAllOrders } from '../../../../streaming';
import logger from '../../../../helper/log'
import { emitter, eventEmitter } from '../../../../constants/emitter_enum';
import { func } from '../../../../storage'
import React from 'react';
import dataStorage from '../../../../dataStorage';
import userTypeEnum from '../../../../constants/user_type_enum';
import { capitalizer } from '../../../../helper/functionUtils'

export default class RoleGroup extends React.Component {
    constructor(props) {
        super(props);
        this.accountRefresh = func.getStore(emitter.STREAMING_ACCOUNT_DATA);
        this.state = {
            listDropDown: []
        }
        this.getListRoleGroup = this.getListRoleGroup.bind(this);
        this.realtimeData = this.realtimeData.bind(this);
    }
    handleOnChangeAll(selected) {
        this.props.onChange(selected);
    }

    render() {
        if (dataStorage.userInfo && dataStorage.userInfo.user_type === userTypeEnum.ADVISOR) {
            const label = capitalizer(dataStorage.userInfo.group_name || '--')
            return (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: '24px',
                    border: '1px solid var(--border)',
                    paddingRight: '8px',
                    cursor: 'not-allowed',
                    boxSizing: 'border-box'
                }}>{label}</div>)
        } else {
            try {
                let textDisplay;
                this.state.listDropDown && this.state.listDropDown.map(item => {
                    if (item.value === this.props.value) textDisplay = item.label;
                })
                if (!this.props.editable) {
                    return (
                        <div className='box-overflow'>
                            <div className='text-overflow showTitle' ><Lang>{textDisplay || '--'}</Lang></div>
                        </div>
                    )
                } else {
                    return (
                        <div
                            ref={dom => this.props.setDom(dom)}
                            style={{ padding: 0 }}
                        // title={textDisplay || ''}
                        >
                            <DropDown
                                // upperCase={true}
                                // translate={true}
                                onChange={this.handleOnChangeAll.bind(this)}
                                options={this.state.listDropDown}
                                value={this.props.value}
                                textRight={true}
                                align='right'
                            />
                        </div>
                    )
                }
            } catch (error) {
                logger.log('error render RoleGroup', error)
            }
        }
    }

    sortRoleGroup = (originalRoleGroup) => {
        let sortedRoleGroup = []
        let defaultRoleGroup = originalRoleGroup.slice(0, 11)
        const userCreatedRoleGroup = originalRoleGroup.slice(11)
        defaultRoleGroup.sort((a, b) => {
            const aIndex = a['group_id'].slice(2)
            const bIndex = b['group_id'].slice(2)
            return aIndex - bIndex
        })
        sortedRoleGroup = [...defaultRoleGroup, ...userCreatedRoleGroup]
        return sortedRoleGroup
    }

    getListRoleGroup() {
        const url = getUserGroupUrl();
        if (dataStorage.userInfo && dataStorage.userInfo.user_type !== userTypeEnum.ADVISOR) {
            if (url) {
                getData(url).then(resolve => {
                    if (resolve && resolve.data && resolve.data.data) {
                        const listDropDown = this.sortRoleGroup(resolve.data.data);
                        const staging = []
                        listDropDown.map(item => {
                            const label = capitalizer(item.group_name || '')
                            if (item.group_id && item.group_name && item.group_id !== 'DEFAULT') {
                                staging.push({ value: item.group_id, label: `${label}` })
                            }
                        })
                        if (this.props.schema.pleaseSelect) {
                            staging.unshift({ value: null, label: 'Please Select' })
                        }
                        this.setState({
                            listDropDown: staging
                        })
                    }
                }).catch(e => logger.log('error get List user Group', e))
            }
        }
    }
    realtimeData(data, notice, title) {
        try {
            if (!/^ROLEGROUP/.test(title)) return
            const roleGroupId = (data && data.data && data.data.role_group_id) || ''
            const roleGroupName = (data && data.data && data.data.role_group_name) || ''
            const curListValue = this.state.listDropDown || []
            if (/^ROLEGROUP#INSERT#/.test(title)) {
                const checkIndex = curListValue.findIndex(item => {
                    return item.value === roleGroupId;
                })
                const newRoleGroup = { label: roleGroupName, value: roleGroupId };
                (checkIndex === -1) && curListValue.unshift(newRoleGroup);
            }
            if (/^ROLEGROUP#REMOVE#/.test(title)) {
                const removeIndex = curListValue.findIndex(item => {
                    return item.value === roleGroupId;
                })
                curListValue.splice(removeIndex, 1);
            }
            this.setState({
                listDropDown: curListValue
            })
        } catch (error) {
            logger.log('error realtime RoleGroup', error)
        }
    }
    componentDidMount() {
        this.getListRoleGroup();
        this.emitRefreshID = this.accountRefresh && this.accountRefresh.addListener(eventEmitter.REFRESH_DATA_ACCOUNT, this.getListRoleGroup.bind(this));
        registerAllOrders(this.realtimeData, 'ROLEGROUP');
    }
    componentWillUnmount() {
        this.emitRefreshID && this.emitRefreshID.remove();
        unregisterAllOrders(this.realtimeData, 'ROLEGROUP');
    }
}
