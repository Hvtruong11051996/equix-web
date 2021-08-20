export default {
    PHONE: {
        regex: /^[0-9]{6,16}$/,
        error: 'lang_phone_invalid'
    },
    EMAIL: {
        regex: /^([a-z0-9]+[_+.-])*[a-z0-9]+@(([a-z0-9]+-)*([a-z0-9]+)\.)+[a-z]{2,}$/i,
        error: 'lang_email_invalid'
    }
}
