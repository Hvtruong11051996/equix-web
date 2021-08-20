import React from 'react';
import exchangeTradingMarketEnum from '../../../constants/exchange_trading_market_enum'

const Flag = ({ countryCode, symbolObj = {}, inlineStyle }, isString) => {
  let flag;
  if (!countryCode) {
    flag = getCountryCode(symbolObj)
  } else {
    flag = countryCode.slice(0, 2).toLocaleLowerCase();
  }
  if (isString === 'true') {
    return (
      flag ? '<img src="/flag/' + flag + '.png" class="flagImage" >' : null
    )
  }
  return (
    <div className='flag' style={inlineStyle || {}}>
      {flag ? <img src={`/flag/${flag}.png`} className='flagImage' /> : null}
    </div>
  )
};

export function getCountryCode(symbolObj) {
  if (symbolObj.country) {
    return symbolObj.country.slice(0, 2).toLocaleLowerCase();
  }
  const exchange = symbolObj.exchanges && symbolObj.exchanges.length ? symbolObj.exchanges[0] : symbolObj.exchange;
  return exchangeTradingMarketEnum[exchange] ? exchangeTradingMarketEnum[exchange].flag : ''
}

export default Flag;
