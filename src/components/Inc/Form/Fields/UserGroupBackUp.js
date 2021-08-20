import DropDown from '../../../DropDown';
import Lang from '../../Lang';
import { getData, getUserGroupUrl } from '../../../../helper/request';
import { registerAllOrders, unregisterAllOrders } from '../../../../streaming';
import logger from '../../../../helper/log'
import { emitter, eventEmitter } from '../../../../constants/emitter_enum';
export default class UserGroup extends React.Component {
    constructor(props) {
        super(props);
        this.accountRefresh = func.getStore(emitter.STREAMING_ACCOUNT_DATA);
        this.state = {
            listDropDown: [],
            value: null
        }
        this.getListUserGroup = this.getListUserGroup.bind(this);
        this.realtimeData = this.realtimeData.bind(this);
    }
    handleOnChangeAll(selected) {
        this.props.onChange(selected);
        this.setState({
            value: selected
        })
    }
    componentWillReceiveProps(props) {
        this.setState({
            value: props.value || 'UG0'
        })
    }

    render() {
        try {
            let textDisplay;
            this.state.listDropDown && this.state.listDropDown.map(item => {
                if (item.value === this.state.value) textDisplay = item.label;
            })
            if (!this.props.editable) {
                return (
                    <div className='box-overflow'>
                        <div className='text-overflow showTitle'><Lang>{textDisplay || '--'}</Lang></div>
                    </div>
                )
            }
            return (
                <div style={{ padding: 0 }} title={textDisplay || ''}>
                    <DropDown
                        ref={dom => this.props.setDom(dom)}
                        onChange={this.handleOnChangeAll.bind(this)}
                        options={this.state.listDropDown}
                        value={this.state.value ? this.state.value : null}
                    />
                </div>
            )
        } catch (error) {
            logger.log('error render usergroup', error)
        }
    }
    getListUserGroup() {
        const url = getUserGroupUrl();
        if (url) {
            getData(url).then(resolve => {
                if (resolve && resolve.data && resolve.data.data) {
                    const listDropDown = resolve.data.data;
                    const staging = []
                    listDropDown.map(item => {
                        if (item.group_id && item.group_name) {
                            staging.push({ value: item.group_id, label: item.group_name })
                        }
                    })
                    this.setState({
                        listDropDown: staging,
                        value: staging[0].value
                    })
                }
            }).catch(e => logger.log('error get List user Group', e))
        }
    }
    realtimeData(data) {
        try {
            const action = (title && title.split('#')[1] + '').toLowerCase();
            const roleGroupId = (data && data.data && data.data.role_group_id) || ''
            const roleGroupName = (data && data.data && data.data.role_group_name) || ''
            const curListValue = this.state.listDropDown || []
            switch (action) {
                case 'insert':
                    const checkIndex = curListValue.findIndex(item => {
                        return item.value === roleGroupId;
                    })
                    const newUserGroup = { label: roleGroupName, value: roleGroupId };
                    (checkIndex === -1) && curListValue.unshift(newUserGroup);
                    break;
                case 'remove':
                    const removeIndex = curListValue.findIndex(item => {
                        return item.value === roleGroupId;
                    })
                    curListValue.splice(removeIndex, 1);
                    break;
            }
            this.setState({
                listDropDown: curListValue
            })
        } catch (error) {
            logger.log('error realtime usergroup', error)
        }
    }
    componentDidMount() {
        this.getListUserGroup();
        this.emitRefreshID = this.accountRefresh && this.accountRefresh.addListener(eventEmitter.REFRESH_DATA_ACCOUNT, this.getListUserGroup.bind(this));
        registerAllOrders(this.realtimeData, 'ROLEGROUP');
    }
    componentWillUnmount() {
        this.emitRefreshID && this.emitRefreshID.remove();
        unregisterAllOrders(this.realtimeData, 'ROLEGROUP');
    }
}
