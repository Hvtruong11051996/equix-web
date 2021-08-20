import {
    search, and, or, equal, getBodyData, sort as sortFnc,
    gte, gt, lt, lte, script as scriptFnc,
    like, not,
    startsWith, endsWith
} from './utilities';

const MILISECOND_DAY = 86400000

const filterType = {
    CONTAINS: 'contains',
    NOT_CONTAINS: 'notContains',
    NOT_EQUAL: 'notEqual',
    EQUAL: 'equals',
    STARTS_WITH: 'startsWith',
    ENDS_WITH: 'endsWith',
    GREATER_THAN: 'greaterThan',
    LESS_THAN: 'lessThan',
    AND: 'AND',
    OR: 'OR'
}

const FIELD = {
    ORIGIN_ORDER_ID: 'origin_broker_order_id',
    ORDER_ID: 'broker_order_id',
    ORIGINATION: 'origination',
    DESTINATION: 'destination',
    ENTRY_TIME: 'init_time',
    STATUS: 'order_status',
    ADVISOR: 'advisor_code',
    ACCOUNT_ID: 'account_id',
    ACCOUNT_NAME: 'account_name',
    CODE: 'symbol',
    SIDE: 'is_buy',
    QUANTITY: 'volume',
    FILLED: 'filled_quantity',
    LIMIT_PRICE: 'limit_price',
    TRIGGER_PRICE: 'stop_price',
    FILLED_PRICE: 'avg_price',
    ORDER_TYPE: 'order_type',
    DURATION: 'duration',
    EST_TOTAL: 'total_convert',
    EST_FEES: 'estimated_fees',
    EXCHANGE: 'exchange',
    SECURITY: 'company_name',
    TAG: 'order_tag',
    UPDATED: 'updated'
}

const ORDER_TAG = {
    WORKING: 'open',
    STOPLOSS: 'stoploss',
    FILLED: 'filled',
    CANCELLED: 'cancelled'
}

export function getBodyDataOrders({ tags = [], text = '', filter = null, sort = null, startTime = null, endTime = null, script = null, orderId = null }) {
    const lstParams = []

    let lstTemp = []
    tags.map(e => {
        if (e) {
            if ([ORDER_TAG.FILLED, ORDER_TAG.CANCELLED].includes(e)) {
                if (startTime && endTime) lstTemp.push(and([equal(FIELD.TAG, e), gte(FIELD.UPDATED, startTime), lte(FIELD.UPDATED, endTime)]))
                else lstTemp.push(equal(FIELD.TAG, e))
            } else lstTemp.push(equal(FIELD.TAG, e))
        }
    })
    lstParams.push(or(lstTemp))

    if (text) lstParams.push(search(text))

    if (filter && typeof filter === 'object' && Object.keys(filter).length) {
        lstTemp = []
        Object.keys(filter).map(key => {
            const filterObj = filter[key]
            if (filterObj.ignore && filterObj.ignore.length) {
                const lstIgnore = []
                filterObj.ignore.map(val => {
                    lstIgnore.push(not(equal(key, val)))
                })
                lstParams.push(and(lstIgnore))
            }
            if (filterObj.allow && filterObj.allow.length) {
                const lstAllow = []
                filterObj.allow.map(val => {
                    lstAllow.push(equal(key, val))
                })
                lstParams.push(or(lstAllow))
            }
            if (filterObj.text1) {
                lstTemp.push(convertFilter({
                    type: filterObj.condition1,
                    field: key,
                    value: filterObj.text1
                }))
            }
            if (filterObj.text2) {
                lstTemp.push(convertFilter({
                    type: filterObj.condition3,
                    field: key,
                    value: filterObj.text2
                }))
            }
            if (filterObj.condition2 === filterType.AND) lstParams.push(and(lstTemp))
            else lstParams.push(or(lstTemp))
        })
    }

    if (orderId) lstParams.push(equal(FIELD.ORIGIN_ORDER_ID, orderId))

    if (script) lstParams.push(scriptFnc(script))

    return getBodyData(
        and(lstParams),
        sortFnc(sort)
    )
}

function convertFilter({ type, field, value }) {
    switch (type) {
        case filterType.CONTAINS:
            return like(field, value)
        case filterType.NOT_CONTAINS:
            return not(like(field, value))
        case filterType.NOT_EQUAL:
            return not(equal(field, value))
        case filterType.EQUAL:
            if (field === FIELD.ENTRY_TIME) {
                return and([gt(field, value), lt(field, value + MILISECOND_DAY - 1)])
            }
            return equal(field, value)
        case filterType.STARTS_WITH:
            return startsWith(field, value)
        case filterType.ENDS_WITH:
            return endsWith(field, value)
        case filterType.GREATER_THAN:
            return gt(field, value)
        case filterType.LESS_THAN:
            return lt(field, value)
        default:
            return like(field, value)
    }
}
