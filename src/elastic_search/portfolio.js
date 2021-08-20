import {
    search, and, or, equal, getBodyData, sort as sortFnc,
    gte, lte, script as scriptFnc,
    like, not,
    startsWith, endsWith
} from './utilities';

const filterType = {
    CONTAINS: 'contains',
    NOT_CONTAINS: 'notContains',
    NOT_EQUAL: 'notEqual',
    EQUAL: 'equals',
    STARTS_WITH: 'startsWith',
    ENDS_WITH: 'endsWith',
    AND: 'AND',
    OR: 'OR'
}

export function getBodyDataPortfolio({ text = '', filter = null, sort = null }) {
    const lstParams = []

    if (text) {
        lstParams.push(search(text))
    }

    if (filter && typeof filter === 'object' && Object.keys(filter).length) {
        const lstTemp = []
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
            return equal(field, value)
        case filterType.STARTS_WITH:
            return startsWith(field, value)
        case filterType.ENDS_WITH:
            return endsWith(field, value)
        default:
            return like(field, value)
    }
}
