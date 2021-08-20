import React from 'react';
import { translate } from 'react-i18next';
import EmbeddedWebsite from '../EmbeddedWebsite';
import { checkRoleWidget, hideElement } from '../../helper/functionUtils';
import uuidv4 from 'uuid/v4';
import Lang from '../../components/Inc/Lang';

class MorningStar extends React.Component {
  constructor(props) {
    super(props);
    this.id = uuidv4();
    props.glContainer.on('show', () => {
      hideElement(props, false, this.id)
    });
    props.glContainer.on('hide', () => {
      hideElement(props, true, this.id)
    });
    this.options = [
      {
        label: 'lang_performance',
        value: 'https://performance.morningstar.com/stock/performance-return.action'
      },
      {
        label: 'lang_key_ratios',
        value: 'https://financials.morningstar.com/ratios/r.html'
      },
      {
        label: 'lang_financials_data',
        value: 'https://financials.morningstar.com/income-statement/is.html'
      },
      {
        label: 'lang_valuations',
        value: 'https://financials.morningstar.com/valuation/price-ratio.html'
      }
    ];
  }
  render() {
    return <EmbeddedWebsite {...this.props} options={this.options} />
  }
}

export default translate('translations')(MorningStar);
