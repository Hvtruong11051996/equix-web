import Lang from '../components/Inc/Lang/Lang'
import React from 'react';
import { getData, getUrlAllBrokerName, getUrlAllTradeType, getUrlAllSecurityType, getUrlAllIndex } from '../helper/request'
import logger from '../helper/log';
import dataStorage from '../dataStorage'

const capitalizeFirstLetter = (string, noTrans) => {
    const newStr = noTrans ? string.toLowerCase() : dataStorage.translate(string).toLowerCase();
    return newStr.split(' ').map(v => {
        return v.charAt(0).toUpperCase() + v.slice(1);
    }).join(' ');
}

const createOptions = (data = [], labelField, valueField) => {
    try {
        const result = data.map(obj => {
            let label = ''
            if (labelField === 'iress_type') {
                label = capitalizeFirstLetter(obj[labelField])
            } else if (labelField === 'broker_name' && obj[labelField] === 'ALL BROKERS') {
                label = 'All Brokers'
            } else {
                label = obj[labelField]
            }
            return {
                label,
                value: obj[valueField]
            }
        })
        return result
    } catch (error) {
        logger.log(`Error while creating list broker: ${error}`)
        return []
    }
}

const createIndexOptions = (data = [], valueField, labelField1, labelField2, labelField3) => {
    try {
        const result = data.map(obj => {
            return {
                label: obj[labelField1] || obj[labelField2] || obj[labelField3] || obj[valueField],
                value: obj[valueField]
            }
        })
        return result
    } catch (error) {
        logger.log(`Error while creating list index: ${error}`)
        return []
    }
}

const defaultValue = {
    securityType: {
        label: 'Total',
        value: 'Total'
    },
    tradeType: {
        label: 'Total Market',
        value: 'Total'
    },
    index: {
        label: <Lang>lang_all_indices</Lang>,
        value: 'Total'
    }
}

export const defaultHeaderDropdownOptions = {
    view: [
        {
            label: <Lang>lang_buy_per_sell</Lang>,
            value: 'BUY_SELL'
        },
        {
            label: <Lang>lang_buy</Lang>,
            value: 'BUY'
        },
        {
            label: <Lang>lang_sell</Lang>,
            value: 'SELL'
        }
    ],
    period: [
        {
            label: <Lang>lang_today</Lang>,
            value: 'TODAY'
        },
        {
            label: <Lang>lang_today_and_yesterday</Lang>,
            value: 'TODAY_YESTERDAY'
        },
        {
            label: <Lang>lang_anonymous_period</Lang>,
            value: 'ANONY_PERIOD'
        },
        {
            label: <Lang>lang_this_week</Lang>,
            value: 'THIS_WEEK'
        },
        {
            label: <Lang>lang_this_week_and_last</Lang>,
            value: 'THIS_WEEK_LAST'
        },
        {
            label: <Lang>lang_this_month</Lang>,
            value: 'THIS_MONTH'
        },
        {
            label: <Lang>lang_this_month_and_last</Lang>,
            value: 'THIS_MONTH_LAST'
        },
        {
            label: <Lang>lang_this_year</Lang>,
            value: 'THIS_YEAR'
        },
        {
            label: <Lang>lang_this_year_and_last</Lang>,
            value: 'THIS_YEAR_LAST'
        }
    ],
    frequency: [
        {
            label: <Lang>lang_daily</Lang>,
            value: 'Daily'
        },
        {
            label: <Lang>lang_weekly</Lang>,
            value: 'Weekly'
        },
        {
            label: <Lang>lang_monthly</Lang>,
            value: 'Monthly'
        },
        {
            label: <Lang>lang_yearly</Lang>,
            value: 'Yearly'
        }
    ],
    exchange: [
        {
            label: <Lang>lang_asx_trade_match</Lang>,
            value: 'ASX:TM' // Spelling error. PLease don't do this again bro ><
        }
    ]
}

export const getBrokerOptions = async () => {
    const url = getUrlAllBrokerName()
    const response = await getData(url)
    let responseUrl = [];
    let result = []
    if (response && response.data && response.data.data) {
        responseUrl = response.data.data
        result = createOptions(response.data.data, 'broker_name', 'broker_id')
    }
    if (result) {
        result.sort((item1, item2) => (item1.value > item2.value) ? 1 : -1)
        const itemAllBrokers = result.shift();
        result.sort((item1, item2) => (item1.label > item2.label) ? 1 : -1)
        result.unshift(itemAllBrokers);
    }
    return [result, responseUrl]
}

export const getTradeTypeOptions = async () => {
    const url = getUrlAllTradeType()
    const response = await getData(url)
    let result = []
    let dataAfterFilter = []
    if (response && response.data && response.data.data) {
        let listTrade = response.data.data
        let listDefault = ['CX', '_SPC', 'XT', 'OS', 'EC', 'EP', '_OT', '_IND', '_EXOPT', 'EC.EP', 'NX']
        for (let i = 0; i < listTrade.length; i++) {
            if (listDefault.indexOf(listTrade[i].condition_code) > -1) {
                dataAfterFilter.push(listTrade[i])
            }
        }
        result = createOptions(dataAfterFilter, 'trade_type', 'condition_code')
    }
    result.unshift(defaultValue.tradeType)
    return result
}

export const getSecurityTypeOptions = async () => {
    const url = getUrlAllSecurityType()
    const response = await getData(url)
    let result = []
    let listTrade = response.data.data || []
    let listDefault = ['ETF', 'WARRANT', 'MF', 'COMPANY_OPTION', 'EQUITY']
    let dataAfterFilter = []
    if (response && response.data && response.data.data) {
        for (let i = 0; i < listTrade.length; i++) {
            if (listDefault.indexOf(listTrade[i].iress_type) > -1) {
                dataAfterFilter.push(listTrade[i])
            }
        }
        result = createOptions(dataAfterFilter, 'iress_type', 'id')
        for (let i = 0; i < result.length; i++) {
            if (result[i].value === 'MF' || result[i].value === 'ETF') result[i].label = result[i].label.toUpperCase()
        }
    }
    result.unshift(defaultValue.securityType)
    return result
}

export const getIndexOptions = async () => {
    const url = getUrlAllIndex()
    const response = await getData(url)
    let result = []
    if (response && response.data) {
        result = createIndexOptions(response.data, 'symbol', 'company_name', 'company', 'security_name')
    }
    result.unshift(defaultValue.index)
    return result
}
