import Color from './../../constants/color'

const checkbox = new Image()
checkbox.src = 'common/checkbox-marked-outline.svg'
const unCheckbox = new Image()
unCheckbox.src = 'common/outline-check_box_outline_blank.svg'
const check = new Image()
check.src = 'common/check.svg'
const filter = new Image()
filter.src = 'common/filter.svg'
const spin = new Image()
spin.src = 'common/Spinner-white.svg'
const order = new Image()
order.src = 'common/cart-plus.svg'
const close = new Image()
close.src = 'common/close.svg'
const flagAU = new Image()
flagAU.src = 'flag/au.png'
const flagUS = new Image()
flagUS.src = 'flag/us.png'
const detailOrder = new Image()
detailOrder.src = 'common/baseline-error-outline-24-px.svg'
const modifyOrder = new Image()
modifyOrder.src = 'common/contrast.svg'
const cancelOrder = new Image()
cancelOrder.src = 'common/cart-off.svg'

export default {
    ACTION: {
        EDIT: 'Edit',
        CANCEL: 'Cancel',
        SAVE: 'Save'
    },
    CELL: {
        HEADER: 'headerCell',
        BOX: 'boxCell',
        CHECKBOX: 'checkbox',
        DROPDOWN: 'dropdown',
        GROUP: 'groupCell',
        SIMPLE: 'SimpleCell'
    },
    FIELD: {
        USER_ID: 'user_id',
        MANAGEMENT: 'list_mapping',
        API_ACCESS: 'user_type',
        ACCESS_METHOD: 'access_method',
        STATUS: 'status',
        ROLE: 'role_group',
        USER_GROUP: 'user_group',
        EMAIL_TEMPLATE: 'email_template',
        LIVE_NEWS: 'live_news',
        MORNING_STAR: 'morningStar',
        TIP_RANK: 'tipRank',
        BROKER_DATA: 'brokerData',
        CONTINGENT_ORDER: 'contingentOrder',
        ACTION_LIST: 'action',
        ADDON: 'addon',
        ADVISOR_CODE: 'advisor_code',
        BRANCH_CODE: 'branch_code',
        CHANGE_PASSWORD: 'change_password',
        COMPLETE_SIGNUP: 'complete_signup',
        EMAIL_ALERT: 'email_alert',
        IS_CHANGED: 'isChanged',
        LAST_UPDATE: 'updated',
        GROUP_ID: 'group_id'
    },
    STATUS: {
        2: 'ACTIVE',
        0: 'INACTIVE',
        1: 'PENDING_EMAIL_VERIFICATION',
        5: 'SECURITY_BLOCKED',
        4: 'ADMIN_BLOCKED',
        3: 'CLOSED'
    },
    USER_TYPE: {
        operation: 'OPERATOR',
        advisor: 'ADVISOR',
        retail: 'RETAIL'
    },
    ACCESS_METHOD: {
        0: 'INTERNAL_ONLY',
        1: 'FIRST_INTERNAL_THEN_EXTERNAL'
    },
    BG: {
        'theme-dark': {
            odd: '#1c2030',
            even: '#171b29',
            header: '#758696',
            headerBorder: '#161a2a',
            color: '#c5cbce',
            colorHighLight: '#fff',
            colorTag: '#ffffff',
            highlight: '#1C2733',
            selection: 'rgb(43, 80, 97)',
            fixedLine: '#171b29',
            fixLineShadow: '#151515',
            'bg-green': 'rgba(0, 184, 0, 0.54)',
            'bg-orange': 'rgba(236, 135, 14, 0.54)',
            'bg-yellow': 'rgba(249, 244, 3, 0.54)',
            'bg-gray': 'rgba(197, 203, 206, 0.54)',
            'bg-red': 'rgba(223, 0, 0, 0.54)',
            'bg-lightblue': '#10a8b2',
            'bg-primary': '#359ee4',
            'bg-default': '#359ee4',
            priceDown: Color.PRICE_DOWN,
            priceUp: Color.PRICE_UP,
            icon: '#ffffff',
            iconHover: 'rgba(20, 122, 136, 0.86)',
            close: '#841117',
            closeHover: '#df0000',
            modify: 'rgba(51, 161, 224, 0.8)',
            modifyHover: '#359ee4',
            detail: 'rgba(20, 103, 117, 0.8)',
            detailHover: '#147a88',
            bgBid: '#1a363f',
            bgAsk: '#442132',
            tagRed: '#e43535',
            tagBlue: '#10a8b2',
            backgroundDropdown: '#262b3e'
        },
        'theme-light': {
            odd: '#F7F8FA',
            even: '#FFFFFF',
            colorTag: '#ffffff',
            header: '#848e98',
            headerBorder: '#ffffff',
            color: '#4a4a4a',
            colorHighLight: '#4a4a4a',
            highlight: '#EDF1F2',
            selection: '#E8F7FE',
            fixedLine: '#F7F8FA',
            fixLineShadow: '#dcdcdc',
            'bg-green': '#00B800',
            'bg-orange': '#EC870E',
            'bg-yellow': '#F8C51C',
            'bg-gray': '#e45252',
            'bg-red': '#DF0000',
            'bg-lightblue': '#10a8b2',
            'bg-primary': '#359ee4',
            'bg-default': '#359ee4',
            priceDown: Color.PRICE_DOWN,
            priceUp: Color.PRICE_UP,
            icon: '#4a4a4a',
            iconHover: 'rgba(38, 165, 154, .86)',
            close: '#DF0000',
            closeHover: 'rgba(223, 0, 0, .8)',
            modify: 'rgba(32, 150, 243, .8)',
            modifyHover: '#2096F3',
            detail: '#0579d4',
            detailHover: 'rgba(32, 150, 243, .8)',
            bgBid: '#d3edeb',
            bgAsk: '#fbdbdc',
            tagRed: '#e45252',
            tagBlue: '#00B800',
            backgroundDropdown: '#ffffff'
        }
    },
    IMG: {
        CHECKBOX: checkbox,
        UN_CHECKBOX: unCheckbox,
        CHECK: check,
        FILTER: filter,
        SPIN: spin,
        ORDER: order,
        CLOSE: close,
        FLAG: {
            'AU': flagAU,
            'US': flagUS
        },
        DETAIL_ORDER: detailOrder,
        MODIFY_ORDER: modifyOrder,
        CANCEL_ORDER: cancelOrder
    },
    USER_GROUP: {
        0: 'OTHERS',
        1: 'ADVISOR',
        2: 'ADMIN',
        3: 'SUPER ADMIN'
    },
    FORMAT: {
        DATE_TIME: 'datetime',
        DROPDOWN: 'dropdown',
        NULL: 'convertNull',
        BOX: 'boxCell',
        PERCENT: 'percent'
    },
    DROPDOWN_OPTIONS: {
        user_type: [
            {
                label: 'lang_operator',
                className: 'text-uppercase',
                value: 'operation'
            },
            {
                label: 'lang_advisor',
                className: 'text-uppercase',
                value: 'advisor'
            },
            {
                label: 'lang_retail',
                className: 'text-uppercase',
                value: 'retail'
            }
        ],
        user_group: [
            {
                label: 'lang_super_admin',
                className: 'text-uppercase',
                value: 3
            },
            {
                label: 'lang_admin',
                className: 'text-uppercase',
                value: 2
            },
            {
                label: 'lang_advisor',
                className: 'text-uppercase',
                value: 1
            },
            {
                label: 'lang_others',
                className: 'text-uppercase',
                value: 0
            }
        ],
        access_method: [
            {
                label: 'lang_internal_only',
                className: 'text-uppercase',
                value: 0
            },
            {
                label: 'lang_first_internal_then_external',
                className: 'text-uppercase',
                value: 1
            }
        ],
        status: [
            {
                label: 'lang_active',
                className: 'text-uppercase',
                value: 2
            },
            {
                label: 'lang_inactive',
                className: 'text-uppercase',
                value: 0
            },
            {
                label: 'lang_pending_email_verification',
                className: 'text-uppercase',
                value: 1
            },
            {
                label: 'lang_security_blocked',
                className: 'text-uppercase',
                value: 5
            },
            {
                label: 'lang_admin_blocked',
                className: 'text-uppercase',
                value: 4
            },
            {
                label: 'lang_closed',
                className: 'text-uppercase',
                value: 3
            }
        ]
    },
    SORT: {
        DESC: 'desc',
        ASC: 'asc',
        DEFAULT: ''
    },
    FONT_SIZE: {
        SMALL: 13,
        MEDIUM: 14,
        LARGE: 15,
        DEFAULT: 13
    },
    ADDONS: {
        tipRank: 'A0',
        morningStar: 'A1',
        brokerData: 'A2',
        contingentOrder: 'A3'
    },
    THEME: {
        LIGHT: 'theme-light',
        DARK: 'theme-dark'
    },
    RIGHT_CLICK_ACTION: {
        USER_DETAIL: 1,
        RESET_PASSWORD: 2,
        ACRIVITIES: 3,
        FORCE_TO_CHANGE_PASSWORD: 4,
        COPY: 5,
        COPY_WITH_HEADER: 6,
        EXPORT_CSV: 7
    },
    STATUS_VALUE: {
        NEW: 0,
        PARTIALLY_FILLED: 1,
        FILLED: 2,
        DONE_FOR_DAY: 3,
        CANCELLED: 4,
        REPLACED: 5,
        PENDING_CANCEL: 6,
        STOPPED: 7,
        REJECTED: 8,
        SUSPENDED: 9,
        PENDING_NEW: 10,
        CALCULATED: 11,
        EXPIRED: 12,
        ACCEPTED_FOR_BIDDING: 13,
        PENDING_REPLACE: 14,
        PLACE: 15,
        REPLACE: 16,
        CANCEL: 17,
        UNKNOWN: 18,
        DENY_TO_CANCEL: 22,
        DENY_TO_REPLACE: 23,
        PURGED: 24,
        APPROVE_TO_CANCEL: 25,
        APPROVE_TO_REPLACE: 26,
        TRIGGER: 27
    },
    ORDER_STATUS: {
        0: 'New',
        1: 'PartiallyFilled',
        2: 'FILLED',
        3: 'DONEFORDAY',
        4: 'CANCELLED',
        5: 'REPLACED',
        6: 'PendingCancel',
        7: 'STOPPED',
        8: 'REJECTED',
        9: 'SUSPENDED',
        10: 'PendingNew',
        11: 'Calculated',
        12: 'EXPIRED',
        13: 'Accepted_For_Bidding',
        14: 'PendingReplace',
        15: 'PLACE',
        16: 'REPLACE',
        17: 'CANCEL',
        18: 'UNKNOWN',
        22: 'lang_deny_to_cancel',
        23: 'lang_deny_to_replace',
        24: 'lang_purged',
        25: 'lang_approve_to_cancel',
        26: 'lang_approve_to_replace',
        27: 'trigger'
    }
}
