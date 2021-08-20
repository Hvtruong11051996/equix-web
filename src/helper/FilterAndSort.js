import { getStartTimeFilter, getEndTimeFilter } from './../components/Inc/DatePicker'

function checkToUpperCase(field, value, type) {
    if (type === 'number') return value
    const array = ['symbol']
    if (array.indexOf(field) > -1) return (value + '').toUpperCase()
    else return value
}

function renderarrDateEquals(obj, field, arrDate) {
    const lessThan = {}
    const greaterThan = {}
    const date = obj.dateFrom || obj.dateTo
    if (obj.filterType === 'date' && date) {
        lessThan[field] = { to: getEndTimeFilter(obj, date, arrDate) }
        greaterThan[field] = { from: getStartTimeFilter(obj, date, arrDate) }
    }

    return {
        'bool': {
            'must': [
                {
                    'range': lessThan
                },
                {
                    'range': greaterThan
                }
            ]
        }
    }
}

function subConvert(objItem, key, arrDate, filterVal) {
    const obj = {};
    if (filterVal) { // create obj listCheckBox
        obj[key] = {
            'value': filterVal
        }
        return {
            'term': obj
        };
    }
    switch (objItem.type) {
        case 'notEqual':
        case 'notContains':
            if (objItem.filterType === 'date') {
                const obj = renderarrDateEquals(objItem, key, arrDate)
                return {
                    'bool': {
                        'must_not': obj
                    }
                }
            } else {
                let type = 'equals';
                if (objItem.type === 'notContains') type = 'contains'
                return {
                    'bool': {
                        'must_not': [subConvert({ ...objItem, ...{ type: type } }, key)]
                    }
                }
            }
        case 'equals':
            if (objItem.filterType === 'date') {
                const obj = renderarrDateEquals(objItem, key, arrDate)
                return obj
            } else {
                obj[key] = {
                    'value': checkToUpperCase(key, objItem.filter, objItem.filterType)
                }
                return {
                    'term': obj
                };
            }
        case 'contains':
        case 'startsWith':
        case 'endsWith':
            let str;
            if (objItem.type === 'startsWith') str = checkToUpperCase(key, objItem.filter, objItem.filterType) + '*'
            else if (objItem.type === 'endsWith') str = '*' + checkToUpperCase(key, objItem.filter, objItem.filterType)
            else str = '*' + checkToUpperCase(key, objItem.filter, objItem.filterType) + '*'
            obj[key] = {
                'wildcard': str
            }
            return {
                'wildcard': obj
            }
        case 'lessThanOrEqual':
        case 'greaterThanOrEqual':
            if (objItem.type === 'lessThanOrEqual') obj[key] = { to: checkToUpperCase(key, objItem.filter, objItem.filterType) }
            else if (objItem.type === 'greaterThanOrEqual') obj[key] = { from: checkToUpperCase(key, objItem.filter, objItem.filterType) }
            if (Object.keys(obj).length) return { 'range': obj }
            else return
        case 'lessThan':
        case 'greaterThan':
            const range = {}
            const range2 = {}
            if (objItem.filterType === 'date') {
                if (objItem.type === 'lessThan') {
                    range[key] = { to: getEndTimeFilter(objItem, objItem.dateFrom, arrDate, true) }
                    range2[key] = { value: getEndTimeFilter(objItem, objItem.dateFrom, arrDate, true) }
                } else {
                    range[key] = { from: getStartTimeFilter(objItem, objItem.dateFrom, arrDate, true) }
                    range2[key] = { value: getStartTimeFilter(objItem, objItem.dateFrom, arrDate, true) }
                }
            } else {
                if (objItem.type === 'lessThan') {
                    range[key] = { to: checkToUpperCase(key, objItem.filter, objItem.filterType) }
                } else {
                    range[key] = { from: checkToUpperCase(key, objItem.filter, objItem.filterType) }
                }
                range2[key] = { value: checkToUpperCase(key, objItem.filter, objItem.filterType) }
            }
            return {
                'bool': {
                    'must': [
                        {
                            'range': range
                        },
                        {
                            'bool': {
                                'must_not': [
                                    {
                                        'term': range2
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        case 'inRange':
            const lessThan = {}
            const lessThan2 = {}
            const greaterThan = {}
            const greaterThan2 = {}
            if (objItem.filterType === 'date') {
                if (objItem.dateTo && objItem.dateFrom) {
                    lessThan[key] = { to: getEndTimeFilter(objItem, objItem.dateTo, arrDate, true) }
                    lessThan2[key] = { value: getEndTimeFilter(objItem, objItem.dateTo, arrDate, true) }

                    greaterThan[key] = { from: getStartTimeFilter(objItem, objItem.dateFrom, arrDate, true) }
                    greaterThan2[key] = { value: getStartTimeFilter(objItem, objItem.dateFrom, arrDate, true) }
                }
            } else {
                if (objItem.filter && objItem.filterTo) {
                    lessThan[key] = { to: checkToUpperCase(key, objItem.filterTo, objItem.filterType) }
                    greaterThan[key] = { from: checkToUpperCase(key, objItem.filter, objItem.filterType) }

                    lessThan2[key] = { value: checkToUpperCase(key, objItem.filterTo, objItem.filterType) }
                    greaterThan2[key] = { value: checkToUpperCase(key, objItem.filter, objItem.filterType) }
                }
            }
            return {
                'bool': {
                    'must': [
                        {
                            'range': lessThan
                        },
                        {
                            'range': greaterThan
                        },
                        {
                            'bool': {
                                'must_not': [
                                    {
                                        'term': lessThan2
                                    },
                                    {
                                        'term': greaterThan2
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
    }
}
export function convertObjFilter(filter, arrDate) {
    const query = filter.query
    const root = [];
    let queryDefault = {
        query: {
            bool: {
                must: root
            }
        }
    }
    if (filter.volumn2) {
        root.push(
            {
                'bool': {
                    'must_not': [{
                        'term': {
                            'volume': {
                                'value': 0
                            }
                        }
                    }]
                }
            }
        )
    }
    if (filter.filterAll) {
        root.push({
            query_string: {
                query: '*' + (filter.filterAll || '').replace(/[*]/g, '\\\\*') + '*'
            }
        })
    }
    if (filter.date && filter.date.to && filter.date.from) {
        const obj = {}
        obj[filter.date.field] = {
            from: filter.date.from,
            to: filter.date.to
        }
        root.push({
            range: obj
        })
    }
    if (filter.account_id) {
        const obj = {}
        obj['account_id.keyword'] = { value: filter.account_id }
        root.push({
            term: obj
        })
    }
    if (filter.symbol) {
        let list = filter.symbol.value;
        if (Array.isArray(list) && list.length) {
            const obj = [];
            root.push({
                'bool': {
                    'should': obj
                }
            })
            list.map(value => {
                // value = value.split('.')[0];
                const term = {}
                term[filter.symbol.field] = { 'value': checkToUpperCase(filter.symbol.field, value, 'text') }
                obj.push({ 'term': term });
            })
        } else {
            const objSymbol = {}
            objSymbol[filter.symbol.field] = { value: checkToUpperCase(filter.symbol.field, filter.symbol.value, 'text') }
            root.push({
                term: objSymbol
            })
        }
    }
    if (filter.sign) {
        root.push({
            wildcard: {
                sign: {
                    value: '*' + filter.sign + '*'
                }
            }
        })
    }
    if (query) {
        Object.keys(query).map(key => {
            const objItem = query[key]
            if (arrDate && arrDate.length) {
                if (arrDate.indexOf(key) > -1) objItem['filed_name'] = key
            }
            if (!objItem.checkAll) {
                let keyField = key
                if (key === 'display_name') keyField = 'symbol'
                if (objItem.operator) {
                    if (objItem.filed_name) {
                        objItem.condition1['filed_name'] = key
                        objItem.condition2['filed_name'] = key
                    }
                    if (objItem.operator === 'OR') {
                        if (objItem.condition1) {
                            if (objItem.condition2.type === 'inRange') {
                                if (objItem.condition2.filter && objItem.condition2.filterTo) {
                                    root.push({
                                        'bool': {
                                            'should': [
                                                subConvert(objItem.condition1, keyField, arrDate),
                                                subConvert(objItem.condition2, keyField, arrDate)
                                            ]
                                        }
                                    })
                                } else {
                                    root.push({
                                        'bool': {
                                            'should': [
                                                subConvert(objItem.condition1, keyField, arrDate)
                                            ]
                                        }
                                    })
                                }
                            } else {
                                root.push({
                                    'bool': {
                                        'should': [
                                            subConvert(objItem.condition1, keyField, arrDate),
                                            subConvert(objItem.condition2, keyField, arrDate)
                                        ]
                                    }
                                })
                            }
                        } else {
                            const obj = []
                            if (objItem.orderTagOrder) {
                                if (objItem.value.length) {
                                    objItem.value.map(value => {
                                        // open,stoploss,filled,cancelled
                                        if (value === 'filled' || value === 'cancelled') {
                                            const term = {}
                                            const termVal = {}
                                            termVal.value = value
                                            term[keyField] = termVal
                                            obj.push({
                                                bool: {
                                                    must: [
                                                        { 'term': term },
                                                        {
                                                            range: {
                                                                updated: {
                                                                    from: objItem.date.from,
                                                                    to: objItem.date.to
                                                                }
                                                            }
                                                        }
                                                    ]
                                                }
                                            })
                                        } else obj.push(subConvert(value, keyField, arrDate, value))
                                    })
                                } else {
                                    obj.push(subConvert('', key, 'fake logic filter'))
                                }
                                root.push({
                                    'bool': {
                                        'should': obj
                                    }
                                })
                            } else {
                                objItem.value.map(value => {
                                    if (!new RegExp(/##/).test(value)) {
                                        obj.push(subConvert(value, keyField, arrDate, value))
                                    }
                                })
                                root.push({
                                    'bool': {
                                        'should': obj
                                    }
                                })
                            }
                        }
                    }
                    if (objItem.operator === 'AND') {
                        if (objItem.condition2.type === 'inRange') {
                            if (objItem.condition2.filter && objItem.condition2.filterTo) {
                                root.push({
                                    'bool': {
                                        'must': [
                                            subConvert(objItem.condition1, keyField, arrDate),
                                            subConvert(objItem.condition2, keyField, arrDate)
                                        ]
                                    }
                                })
                            } else {
                                root.push({
                                    'bool': {
                                        'must': [
                                            subConvert(objItem.condition1, keyField, arrDate)
                                        ]
                                    }
                                })
                            }
                        } else {
                            root.push({
                                'bool': {
                                    'must': [
                                        subConvert(objItem.condition1, keyField, arrDate),
                                        subConvert(objItem.condition2, keyField, arrDate)
                                    ]
                                }
                            })
                        }
                    }
                } else {
                    if (objItem.filterType === 'date' && objItem.dateFrom) root.push(subConvert(objItem, keyField, arrDate))
                    else if (objItem.filterType === 'text' && objItem.filter.length) root.push(subConvert(objItem, keyField, arrDate))
                    else if (objItem.filterType === 'number' && objItem.filter > -1) root.push(subConvert(objItem, keyField, arrDate))
                    else root.push(subConvert(objItem, keyField, arrDate))
                }
            }
        });
    }
    if (filter.sort && filter.sort.length) {
        queryDefault.sort = []
        filter.sort.map(item => {
            const stag = {};
            if (item.colId === 'display_name') item.colId = 'symbol'
            stag[item.colId] = { 'order': item.sort }
            queryDefault.sort.push(stag);
        })
    }
    return queryDefault;
}

export function mapFiltertObj(filter, filterCurent) {
    if (filter && Object.keys(filter).length > 0) return filter;
    else if (filter && Object.keys(filter).length === 0) return {}
    else if (filterCurent && Object.keys(filterCurent).length) return filterCurent
    else return {}
}

export function mapSortObj(sortDefault, sort, sortCurent) {
    if (!sort) {
        if (sortCurent.length > 0) {
            sort = sortCurent
        } else {
            sort = sortDefault
        }
    } else if (sort && sort.length) {
        const indexPush = []
        for (let i = 0; i < sortDefault.length; i++) {
            let isPush = true
            sort.map(fieldItem => {
                if (fieldItem.colId === sortDefault[i].colId) isPush = false
            })
            if (isPush) indexPush.push(i)
        }
        if (indexPush.length) {
            indexPush.forEach(index => {
                sort.push(sortDefault[index])
            })
        }
    } else {
        if (sortDefault) {
            sort = sortDefault
        } else {
            sort = []
        }
    }
    return sort
}
