import { string } from 'prop-types'

export const SEND = {
    NONE: 0,
    REQUEST: 1,
    SUCCESS: 2,
    ERROR: 3,
    LOADING: 4
}

export const APIACCESSENUM = {
    0: 'retail',
    1: 'advisor',
    2: 'operation'
}
export const APIACCESS = {
    RETAIL: 0,
    ADVISOR: 1,
    OPERATOR: 2
}
export const USERSTATUS = {
    ACTIVE: 2,
    INACTIVE: 0,
    PENDING_EMAIL_VERIFICATION: 1,
    SECURITIES_BLOCKED: 5,
    ADMIN_BLOCKED: 4,
    CLOSED: 3
}

export const USERTYPE = {
    OPERATOR: 'operation',
    RETAIL: 'retail',
    ADVISOR: 'advisor'
}

export const EDITSTATE = {
    CREATE: 0,
    VIEW: 1,
    EDIT: 2
}

export const TIME = {
    TIME_SHOW_ERROR: 2000,
    TIME_SHOW_INFO: 2000,
    TIME_OUT_REQUEST: 500
}

export const NOTIFYENUM = {
    CREATE_USER_REQUEST: 'lang_creating_user',
    CREATE_USER_SUCCESS: 'lang_creating_user_success',
    UPDATE_USER_REQUEST: 'lang_updating_user_information',
    UPDATE_USER_SUCCESS: 'lang_update_userinfo_success',
    SEND_RESET_PASSWORD: 'lang_sending_reset_pass',
    SEND_RESET_PASSWORD_SUCCESS: 'lang_sending_reset_pass_success'
}
export const STATUS = {
    ACTIVE: 2,
    INACTIVE: 0,
    PENDING_EMAIL_VERIFICATION: 1,
    SECURITIES_BLOCKED: 5,
    ADMIN_BLOCKED: 4,
    CLOSED: 3
}

let options = {
    ACCESS_METHOD: [
        {
            label: 'lang_equix_internal',
            value: 0
        }
    ],
    API_ACCESS: [
        {
            label: 'lang_retail',
            value: 0
        },
        {
            label: 'lang_advisor',
            value: 1
        },
        {
            label: 'lang_operator',
            value: 2
        }
    ],
    USER_GROUP: [
        {
            label: 'lang_super_admin',
            className: 'text-capitalize',
            value: 3
        },
        {
            label: 'lang_admin',
            className: 'text-capitalize',
            value: 2
        },
        {
            label: 'lang_advisor',
            className: 'text-capitalize',
            value: 1
        },
        {
            label: 'lang_others',
            className: 'text-capitalize',
            value: 0
        }
    ]
}

export const OPTIONS = Object.keys(options).reduce((acc, cur) => {
    const value = options[cur]
    acc[cur] = value
    return acc
}, {})

export const compareObjects = (o, p) => {
    const keysO = Object.keys(o).sort()
    const keysP = Object.keys(p).sort()
    if (keysO.length !== keysP.length) return false
    if (keysO.join('') !== keysP.join('')) return false
    for (let i = 0; i < keysO.length; i++) {
        if (o[keysO[i]] === null) o[keysO[i]] = ''
        if (p[keysO[i]] === null) p[keysO[i]] = ''
        if (o[keysO[i]] instanceof Array) {
            if (!(p[keysO[i]] instanceof Array)) return false;
            // if (compareObjects(o[keysO[i]], p[keysO[i]] === false) return false
            if (p[keysO[i]].sort().join('') !== o[keysO[i]].sort().join('')) return false
        } else if (o[keysO[i]] instanceof Object) {
            if (!(p[keysO[i]] instanceof Object)) return false
            if (o[keysO[i]] === o) { // self reference?
                if (p[keysO[i]] !== p) return false
            } else if (compareObjects(o[keysO[i]], p[keysO[i]]) === false) return false;
        } else if (o[keysO[i]] !== p[keysO[i]]) return false
    }
    return true;
}
