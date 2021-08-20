import React from 'react'
import dataStorage from '../../dataStorage';
import Lang from '../Inc/Lang/Lang';
import s from './VettingRulesManagement.module.css'
import { addEventListener, removeEventListener, EVENTNAME } from '../../helper/event';
import Button, { buttonType } from '../Elements/Button/Button';
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon';

export default class ButtonGroup extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            editMode: false,
            connected: dataStorage.connected
        }
    }

    componentDidMount() {
        addEventListener(EVENTNAME.connectionChanged, this.changeConnection)
    }

    changeConnection = (isConnected) => {
        if (isConnected && this.state.connected !== isConnected) {
            this.setState({ connected: isConnected })
        }
    }

    componentWillUnmount() {
        removeEventListener(EVENTNAME.connectionChanged, this.changeConnection)
    }

    onEdit = () => {
        if (!this.state.connected) return;
        this.setState({ editMode: true })
        this.props.onEdit && this.props.onEdit();
    }

    onCancel = () => {
        if (!this.state.connected) return;
        this.setState({ editMode: false })
        this.props.onCancel && this.props.onCancel();
    }

    onSave = () => {
        if (!this.state.connected) return;
        this.props.onSave && this.props.onSave(() => {
            this.setState({ editMode: false })
        });
    }

    onCreate = () => {
        if (!this.state.connected) return;
        this.props.onCreate && this.props.onCreate();
    }

    onRemove = () => {
        if (!this.state.connected) return;
        this.props.onRemove && this.props.onRemove();
    }

    render() {
        return (
            <div className={'btn-group' + ' ' + s.buttonGroup}>
                <div style={{ display: 'flex' }}>
                    <Button type={buttonType.info} disabled={!this.state.connected || this.state.editMode} className={'showTitle'} onClick={this.onCreate}>
                        <SvgIcon path={path.mdiFolderPlus} />
                        <span className='text-uppercase'><Lang>lang_create_new</Lang></span>
                    </Button>
                    <Button type={buttonType.danger} disabled={!this.state.connected || this.state.editMode} className={'showTitle'} onClick={this.onRemove}>
                        <SvgIcon path={path.mdiDeleteForever} />
                        <span className='text-uppercase'><Lang>lang_remove</Lang></span>
                    </Button>
                    {
                        this.state.editMode
                            ? <React.Fragment>
                                <Button type={buttonType.info} disabled={!this.state.connected} className={'showTitle'} onClick={this.onSave}>
                                    <SvgIcon path={path.mdiContentSave} />
                                    <span className='text-uppercase' ref={(ref) => this.btnSave = ref}><Lang>lang_save_changes</Lang></span>
                                </Button>
                                <Button type={buttonType.danger} disabled={!this.state.connected} className={'showTitle'} onClick={this.onCancel}>
                                    <SvgIcon path={path.mdiClose} />
                                    <span className='text-uppercase'><Lang>lang_cancel</Lang></span>
                                </Button>
                            </React.Fragment>
                            : <Button disabled={!this.state.connected} className={'showTitle text-uppercase'} onClick={this.onEdit}>
                                <SvgIcon path={path.mdiPencil} />
                                <span className='showTitle'><Lang>lang_edit</Lang></span>
                            </Button>
                    }
                </div>
            </div>
        )
    }
}
