import React from 'react';
import dataStorage from '../../dataStorage';
import logger from '../../helper/log';
import { translate } from 'react-i18next';
import { postData, getUrlCreateUser } from '../../helper/request';
import Lang from '../Inc/Lang';
import Button, { buttonType } from '../Elements/Button/Button';
import SvgIcon, { path } from '../Inc/SvgIcon/SvgIcon';
class ConfirmCreateUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadLogout: false
    }
  }

  Confirm() {
    try {
      const url = getUrlCreateUser();
      this.setState({
        loadLogout: true
      }, () => {
        this.props.loading(true)
        postData(url, this.props.data)
          .then(response => {
            this.props.loading(false)
            if (response.data) {
              this.setState({
                loadLogout: false
              })
              dataStorage.goldenLayout.addComponentToStack('Order', {
                data: this.props.data
              })
            }
          })
          .catch(error => {
            this.props.loading(false)
            logger.log(error)
            this.setState({
              loadLogout: false
            })
          })
      })
    } catch (error) {
      logger.error('logOut on ConfirmLogout' + error);
    }
  }

  render() {
    try {
      return (
        <div className='confirmLogoutRoot'>
          <div className='size--4 text-capitalize'><Lang>lang_create_user</Lang></div>
          <div className='size--3'><span><Lang>Do_you_want_to_create_new_user</Lang> ${this.props.data}</span></div>
          <div className='confirmBtnRoot btn-group'>
            <Button type={buttonType.danger} className='btn' onClick={() => this.props.close()} >
              <SvgIcon path={path.mdiClose} />
              <span className='text-uppercase'><Lang>lang_cancel</Lang></span>
            </Button>
            <Button type={buttonType.success} className='btn' onClick={() => this.Confirm()}>
              {this.state.loadLogout ? <img className='icon' src='common/Spinner-white.svg' /> : <SvgIcon path={path.mdiCheck} />}
              <span className='text-uppercase'><Lang>lang_ok</Lang></span>
            </Button>
          </div>
        </div>
      )
    } catch (error) {
      logger.error('render on ConfirmLogout' + error);
    }
  }
}

export default translate('translations')(ConfirmCreateUser);
