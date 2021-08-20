import React from 'react';
import SvgIcon, { path } from '../SvgIcon';
import Lang from '../Lang';
import { emitter, eventEmitter } from '../../../constants/emitter_enum'
import { func } from '../../../storage';
import dataStorage from '../../../dataStorage';
import NoTag from '../NoTag/NoTag';
import { checkRole } from '../../../helper/functionUtils'
import Button, { buttonType } from '../../Elements/Button';

class ButtonGroup extends React.Component {
    constructor(props) {
        super(props);
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.state = {
            isConnected: dataStorage.connected
        }
    }

    changeConnection(isConnected) {
        if (!isConnected !== !this.state.isConnected) {
            this.setState({ isConnected })
        }
    }
    renderTwoBtn() {
        return <NoTag>
            {this.renderCreateBtn()}
            {this.renderRemoveBtn()}
        </NoTag>
    }

    render() {
        if (this.props.requireRole && !checkRole(this.props.requireRole)) return null
        return <div className={`btn-group size--3`}>
            {
                !this.props.isOnlyEdit
                    ? this.renderTwoBtn()
                    : null
            }
            {
                this.props.isEditable
                    ? <div className='editContainer' style={{ display: 'flex', paddingLeft: '8px' }}>
                        {this.renderSaveChangeBtn()}
                        {this.renderCancelBtn()}
                    </div>
                    : this.renderEditBtn()
            }
        </div>
    }

    renderCreateBtn = () => {
        if (this.props.editModeOnly) return null;
        const isDisabled = !this.state.isConnected || this.props.isEditable
        const classStr = `btn showTitle`
        const handleClick = () => {
            if (isDisabled) return;
            this.props.callBack && this.props.callBack('Create')
        }
        return (
            <Button type={buttonType.info} disabled={isDisabled} className={classStr} onClick={handleClick} >
                <SvgIcon path={path.mdiFolderPlus} />
                <span className='text-uppercase'><Lang>lang_create_new</Lang></span>
            </Button>
        )
    }

    renderRemoveBtn = () => {
        if (this.props.editModeOnly) return null;
        const isDisabled = !this.state.isConnected || this.props.isEditable
        const classStr = `btn showTitle`
        const handleClick = () => {
            if (isDisabled) return;
            this.props.callBack && this.props.callBack('Remove')
        }
        return (
            <Button type={buttonType.danger} disabled={isDisabled} className={classStr} onClick={handleClick}>
                <SvgIcon path={path.mdiDeleteForever} />
                <span className='text-uppercase'><Lang>lang_remove</Lang></span>
            </Button>
        )
    }

    renderSaveChangeBtn = () => {
        const isDisabled = !this.state.isConnected || this.props.loadingConfirm
        const classStr = `btn showTitle`
        const handleClick = () => {
            if (isDisabled) return;
            this.props.callBack && this.props.callBack('Save')
        }
        return (
            <Button type={buttonType.info} disabled={this.props.isDisable || isDisabled} className={classStr} onClick={handleClick}>
                {
                    this.props.loadingConfirm
                        ? <img src='common/Spinner-white.svg' />
                        : <SvgIcon path={path.mdiContentSave} />
                }
                <span className='text-uppercase'><Lang>lang_save_changes</Lang></span>
            </Button>
        )
    }

    renderCancelBtn = () => {
        const isDisabled = !this.state.isConnected || this.props.loadingConfirm
        const classStr = `btn showTitle`
        const handleClick = () => {
            if (isDisabled) return;
            this.props.callBack && this.props.callBack('Cancel')
        }
        return (
            <Button type={buttonType.danger} disabled={isDisabled} className={classStr} onClick={handleClick}>
                <SvgIcon path={path.mdiClose} />
                <span className='text-uppercase'><Lang>lang_cancel</Lang></span>
            </Button>
        )
    }

    renderEditBtn = () => {
        const isDisabled = !this.state.isConnected || this.props.isNoData
        const classStr = `btn showTitle`
        const handleClick = () => {
            if (!this.state.isConnected) return;
            this.props.callBack && this.props.callBack('Edit')
        }
        return (
            <Button className={classStr} disabled={isDisabled} onClick={handleClick}>
                <SvgIcon path={path.mdiPencil} />
                <span className='text-uppercase'><Lang>lang_edit</Lang></span>
            </Button>
        )
    }
    componentWillUnmount() {
        this.emitConnectionID && this.emitConnectionID.remove();
    }

    componentDidMount() {
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
    }
}

export default ButtonGroup
