import React from 'react';
import { translate } from 'react-i18next';
import EmbeddedWebsite from '../EmbeddedWebsite';
import uuidv4 from 'uuid/v4';
import { checkRoleWidget, hideElement } from '../../helper/functionUtils';
import Lang from '../../components/Inc/Lang';
class TipRank extends React.Component {
  constructor(props) {
    super(props);
    this.id = uuidv4();
    this.options = [
      {
        label: 'lang_analysis_coverage',
        value: 'https://widgets.tipranks.com/content/openmarkets/coverage/?ticker='
      },
      {
        label: 'lang_news_sentiment',
        value: 'https://widgets.tipranks.com/content/openmarkets/analysis/?ticker='
      }
    ];
    props.glContainer.on('show', () => {
      hideElement(props, false, this.id);
    });
    props.glContainer.on('hide', () => {
      hideElement(props, true, this.id);
    });
  }
  render() {
    return <EmbeddedWebsite {...this.props} tiprank={true} options={this.options} />
  }
}

export default translate('translations')(TipRank);
