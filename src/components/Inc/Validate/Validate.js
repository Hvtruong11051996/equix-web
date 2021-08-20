export default function Validate(type, data, minLength, maxLength) {
    if (!type) return 'type is empty';
    if (!data) return 'data is empty';
    switch (type) {
        case 'phone':
            if (/^[0-9+\s\-()]*$/.test(data)) { // eslint-disable-line
                return true;
            } else {
                return false;
            }
        case 'email':
            if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(data)) {// eslint-disable-line
                return true;
            } else {
                return false;
            }
        case 'user_login_id':
            if (/^[A-Za-z0-9!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]*$/.test(data)) { // eslint-disable-line
                return true;
            } else {
                return false;
            }
        case 'full_name':
            return
        case 'length':
            const len = data.length;
            if (!minLength && !maxLength) {
                return 'min length or max length require'
            }
            if (minLength && !maxLength && len < minLength) {
                return false
            }
            if (!minLength && maxLength && len > maxLength) {
                return false
            }
            if ((minLength && maxLength) && (len < minLength || len > maxLength)) {
                return false
            }
            return true
        default:
            return 'unsupported'
    }
}
