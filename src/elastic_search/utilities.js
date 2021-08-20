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
/**
 * Get query object to search the whole database for documents that contains keyword
 * @param keyword
 * @returns {{query: {query_string: {query: string}}}}
 */
export function search(keyword) {
  return {
    query_string: {
      query: `*${keyword}*`
    }
  };
}

/*
 * @param QUERY
 * @param SORT
 * @returns {{query: *, sort: *}}
 */
export function getBodyData(QUERY, SORT) {
  let { sort } = SORT;
  return sort
    ? {
      query: QUERY,
      sort
    }
    : {
      query: QUERY
    }
}

/**
 * Return the sort object for sort field in query.
 * @example
 * sort({
 *     'updated': 'desc',
 *     'symbol': 'asc'
 * })
 * @param params
 * @returns {{sort: Array}}
 */
export function sort(params) {
  if (!params) {
    return {
      sort: null
    }
  }
  let orders = [];
  const keys = Object.keys(params);
  for (let i = 0; i < keys.length; i++) {
    orders.push({
      [keys[i]]: {
        order: params[keys[i]]
      }
    })
  }
  return {
    sort: orders
  }
}

/**
 * Get AND expression
 * @example
 * and(
 * 		equal('symbol', 'ANZ'),
 * 		like('order_tag', 'open')
 * )
 * @param params
 * @returns {{bool: {must: *[]}}}
 */
export function and(params) {
  return {
    bool: {
      must: params
    }
  }
}

/**
 * Get OR expression
 * @example
 * or(
 * 		equal('symbol', 'ANZ'),
 * 		like('order_tag', 'open')
 * )
 * @param params
 * @returns {{bool: {should: *[]}}}
 */
export function or(params) {
  return {
    bool: {
      should: params
    }
  }
}

/**
 * Get NOT expression
 * @example
 * not(
 * 		equal('symbol', 'ANZ'),
 * 		like('order_tag', 'open')
 * )
 * @param params
 * @returns {{bool: {must_not: *[]}}}
 */
export function not(params) {
  return {
    bool: {
      must_not: params
    }
  }
}

/**
 * Get equal constraint
 * @param field
 * @param value
 * @returns {{term: {}}}
 */
export function equal(field, value) {
  return {
    term: {
      [field]: {
        value: value
      }
    }
  }
}

/**
 * Get like constraint
 * @param field
 * @param value
 * @returns {{wildcard: {}}}
 */
export function like(field, value) {
  return {
    wildcard: {
      [field]: {
        wildcard: `*${value}*`
      }
    }
  }
}

/**
 * Get greater-than-or-equal constraint
 * @param field
 * @param value
 * @returns {{range: {}}}
 */
export function gte(field, value) {
  return {
    range: {
      [field]: {
        gte: value
      }
    }
  }
}

/**
 * Get greater-than constraint
 * @param field
 * @param value
 * @returns {{range: {}}}
 */
export function gt(field, value) {
  return {
    range: {
      [field]: {
        gt: value
      }
    }
  }
}

/**
 * Get less-than-or-equal constraint
 * @param field
 * @param value
 * @returns {{range: {}}}
 */
export function lte(field, value) {
  return {
    range: {
      [field]: {
        lte: value
      }
    }
  }
}

/**
 * Get less-than constraint
 * @param field
 * @param value
 * @returns {{range: {}}}
 */
export function lt(field, value) {
  return {
    range: {
      [field]: {
        lt: value
      }
    }
  }
}

/**
 * Get document whose field starts with value
 * @param field
 * @param value
 * @returns {{wildcard: {}}}
 */
export function startsWith(field, value) {
  return {
    wildcard: {
      [field]: {
        wildcard: `${value}*`
      }
    }
  }
}

/**
 * Get document whose field ends with value
 * @param field
 * @param value
 * @returns {{wildcard: {}}}
 */
export function endsWith(field, value) {
  return {
    wildcard: {
      [field]: {
        wildcard: `*${value}`
      }
    }
  }
}

/**
 * Search by script
 * @param field
 * @param value
 * @returns {{wildcard: {}}}
 */
export function script(script) {
  return {
    script: {
      script
    }
  }
}

export function convertFilter({ type, field, value, columnType = 'text' }) {
  if (columnType === 'text') {
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
  } else if (columnType === 'number') {
    switch (type) {
      case filterType.CONTAINS:
        return equal(field, value)
      case filterType.NOT_CONTAINS:
        return not(equal(field, value))
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
}
