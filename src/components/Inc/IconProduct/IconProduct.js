import React from 'react';
import { renderClass } from '../../../helper/functionUtils';

const iconProductsMapping = {
  'equity': {
    label: 'equity',
    sign: 'eq'
  },
  'future': {
    label: 'futures',
    sign: 'fu'
  },
  'etf': {
    label: 'etf',
    sign: 'etf'
  },
  'mf': {
    label: 'managed funds',
    sign: 'mf'
  },
  'warrant': {
    label: 'warrant',
    sign: 'wa'
  },
  'option': {
    label: 'option',
    sign: 'op'
  }
}

const IconProduct = ({ iconClass }) => {
  return null
  // const { label, sign } = iconProductsMapping[iconClass] || {}
  // return <div className={`icon-product ${sign === 'etf' ? 'size-etf' : ''} ${sign}`} title={(label || '').toUpperCase()}>{sign}</div>
}

// class IconProduct extends React.Component {
//   ref = (dom) => {
//     const { symbolObj } = this.props
//     const symbolDisplayName = symbolObj.display_name || symbolObj.cnote_symbol || ''
//     const { label } = iconProductsMapping[symbolObj.class] || {}
//     if (dom) {
//       dom.parentNode && dom.parentNode.setAttribute('style', '')
//       dom.parentNode &&
//         dom.parentNode.parentNode &&
//         dom.parentNode.parentNode.parentNode &&
//         (dom.parentNode.parentNode.title = `${symbolDisplayName} (${label})`)
//     }
//   }

//   render() {
//     return <div style={{ display: 'none' }} ref={this.ref}></div>
//   }
// }

export default IconProduct
