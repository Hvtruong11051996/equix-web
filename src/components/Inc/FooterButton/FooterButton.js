import React from 'react';
import { emitter, eventEmitter } from '../../../constants/emitter_enum';
import { func } from '../../../storage';
import dataStorage from '../../../dataStorage';
// import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon'
import MapRoleComponent from '../../../constants/map_role_component';
import { checkRole } from '../../../helper/functionUtils'
import Lang from '../../Inc/Lang';
class FooterButton extends React.Component {
    constructor(props) {
        super(props);
        this.checkConnection = func.getStore(emitter.CHECK_CONNECTION);
        this.state = {
            actions: props.actions,
            isConnected: dataStorage.connected
        }
    }

    componentDidMount() {
        this.emitConnectionID = this.checkConnection && this.checkConnection.addListener(eventEmitter.CHANGE_CONNECTION, this.changeConnection.bind(this));
    }

    changeConnection(isConnected) {
        if (!isConnected !== !this.state.isConnected) {
            this.setState({ isConnected })
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps && nextProps.actions) {
            this.setState({
                actions: nextProps.actions
            })
        }
    }

    checkDisableButton(e) {
        if (e.text === 'lang_reset_password') {
            if (!checkRole(MapRoleComponent.RESET_PASSWORD_USER_DETAIL)) return 'disableReset'
        }
        if (e.text === 'lang_edit') {
            if (!checkRole(MapRoleComponent.EDIT_USER_DETAIL)) return 'disableEdit'
        }
        if (e.text === 'create_new_user') {
            if (!checkRole(MapRoleComponent.CREATE_NEW_USER)) return 'disableCreate'
        }
        return ''
    }

    render() {
        const { actions, isConnected } = this.state;
        return (<div className='footer'>
            <div className='line'></div>
            <div className={`btnWrapper ${isConnected ? '' : 'disableBtn'}`}>
                {
                    actions && actions.length && actions.map((e, i) => {
                        return (
                            <div key={`FooterButton_${i}`} className={`actionBtn showTitle ${e.className || ''} ${this.checkDisableButton(e)}`}
                                style={{ marginLeft: i !== 0 ? 16 : 0 }}
                                onClick={() => {
                                    if (e.className && e.className.includes('disableBtn')) return;
                                    if (e.text === 'lang_reset_password') {
                                        if (!checkRole(MapRoleComponent.RESET_PASSWORD_USER_DETAIL)) return
                                    }
                                    if (e.text === 'lang_edit') {
                                        if (!checkRole(MapRoleComponent.EDIT_USER_DETAIL)) return
                                    }
                                    if (e.text === 'create_new_user') {
                                        if (!checkRole(MapRoleComponent.CREATE_NEW_USER)) return
                                    }
                                    isConnected && e.onClick && e.onClick();
                                }}>
                                {e.srcIcon ? <img className='icon' style={{ filter: 'brightness(0) invert(1)', height: '20px' }} src={e.srcIcon} /> : null}
                                {e.srcIcon === 'common/Spinner-white.svg' ? <img className='icon-response' src='common/Spinner-white.svg' style={{ height: '20px' }} /> : null}
                                <span className='size--4 text-uppercase'><Lang>{e.text || ''}</Lang></span>
                            </div>
                        );
                    })
                }
            </div>
        </div>);
    }
}

export default FooterButton
