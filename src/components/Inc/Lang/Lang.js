import React from 'react';
import { translate, Trans } from 'react-i18next';
import logger from '../../../helper/log';
class Lang extends React.Component {
  constructor(props) {
    super(props);
    this.temp = '';
  }

  render() {
    try {
      if (!/(?=.*[a-zA-Z])/.test(this.props.children + '')) return this.props.children
      if (!this.props.children) return ''
      return <Trans>{(this.props.children + '')}</Trans>
    } catch (error) {
      logger.error('render On Lang' + error)
    }
  }
}

export default translate('translations')(Lang);
