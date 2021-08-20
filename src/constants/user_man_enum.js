import Lang from '../components/Inc/Lang';

export const USER_STATUS = {
    ACTIVE: 2,
    INACTIVE: 0,
    PENDING_EMAIL_VERIFICATION: 1,
    CLOSED: 3,
    ADMIN_BLOCKED: 4,
    SECURITY_BLOCKED: 5
};

export const optionsStatus = [
    { value: USER_STATUS.ACTIVE, label: 'lang_active', className: 'text-capitalize' },
    { value: USER_STATUS.INACTIVE, label: 'lang_inactive', className: 'text-capitalize' },
    { value: USER_STATUS.PENDING_EMAIL_VERIFICATION, label: 'lang_pending_email_verification', className: 'text-capitalize' },
    { value: USER_STATUS.SECURITIES_BLOCKED, label: 'lang_security_blocked', className: 'text-capitalize' },
    { value: USER_STATUS.ADMIN_BLOCKED, label: 'lang_admin_blocked', className: 'text-capitalize' },
    { value: USER_STATUS.CLOSED, label: 'lang_closed', className: 'text-capitalize' }
]

export const optionsAccessMethod = [
    {
        label: 'lang_internal_only',
        value: 0
    }
]

export const optionsListCheck = [
    {
        label: 'lang_inactive',
        value: 0
    },
    {
        label: 'lang_pending_email_verification',
        value: 1
    },
    {
        label: 'lang_active',
        value: 2
    },
    {
        label: 'lang_admin_blocked',
        value: 4
    },
    {
        label: 'lang_security_blocked',
        value: 5
    },
    {
        label: 'lang_closed',
        value: 3
    }
]

export const optionsAipAccess = [
    {
        label: 'lang_operator',
        value: 'operation'
    },
    {
        label: 'lang_advisor',
        value: 'advisor'
    },
    {
        label: 'lang_retail',
        value: 'retail'
    }
]

export const UserGroupEnum = [
    { value: 3, label: 'lang_super_admin', className: 'text-capitalize' },
    { value: 1, label: 'lang_advisor', className: 'text-capitalize' },
    { value: 2, label: 'lang_admin', className: 'text-capitalize' },
    { value: 0, label: 'lang_others', className: 'text-capitalize' }
]

export const STATE_CODE = {
    UPLOAD: 'UPLOAD',
    PREVIEW: 'PREVIEW',
    PROCESSING: 'PROCESSING',
    FINISH: 'FINISH',
    IMPORTING: 'IMPORTING'
}

export const dicSort = {
    error: 0,
    success: 1,
    processing: 2
}
