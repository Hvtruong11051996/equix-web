import React from 'react';
import Lang from '../Inc/Lang';
import dataStorage from '../../dataStorage';
import logger from '../../helper/log';
import { checkPropsStateShouldUpdate, logout } from '../../helper/functionUtils';
import { translate } from 'react-i18next';
import Button, { buttonType } from '../Elements/Button/Button';
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon';
class ConfirmLogout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadLogout: false
    }
  }

  logOut() {
    try {
      this.setState({
        loadLogout: true
      })
      logout()
    } catch (error) {
      logger.error('logOut on ConfirmLogout' + error);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    try {
      if (dataStorage.checkUpdate) {
        return checkPropsStateShouldUpdate(nextProps, nextState, this.props, this.state);
      }
      return true;
    } catch (error) {
      logger.error('shouldComponentUpdate On ConfirmLogout', error)
    }
  }

  componentDidMount() {
    document.body.classList.add('showingLogout');
  }

  componentWillUnmount() {
    document.body.classList.remove('showingLogout');
  }

  render() {
    try {
      return (
        <div className='confirmLogoutRoot'>
          <div className='size--4 text-capitalize'><Lang>lang_sign_out</Lang></div>
          <div className='size--3 firstLetterUpperCase text-center'><Lang>lang_are_you_sign_out</Lang></div>
          <div className='confirmBtnRoot btn-group'>
            <Button type={buttonType.danger} className='btn text-uppercase' onClick={() => this.props.close()} >
              <SvgIcon path={path.mdiClose} />
              <span><Lang>lang_cancel</Lang></span>
            </Button>
            <Button type={buttonType.success} className='btn text-uppercase' onClick={() => this.logOut()}>
              {this.state.loadLogout ? <img className='icon' src='common/Spinner-white.svg' /> : <SvgIcon path={path.mdiCheck} />}
              <span><Lang>lang_ok</Lang></span>
            </Button>
          </div>
        </div>
      )
    } catch (error) {
      logger.error('render on ConfirmLogout' + error);
    }
  }
}

export default translate('translations')(ConfirmLogout);
