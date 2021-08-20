import dataStorage from '../../../dataStorage';
import { checkValidDateInput, stringFormatVar } from '../../../helper/functionUtils'
import { FIELD, CARD_COLOUR } from '../../OpeningAccount/constant'
import Validator from '../../Inc/Validation/validate'

const MUTIL_NUMBER_MEDICARE = [1, 3, 7, 9, 1, 3, 7, 9]
const MULTI_TFN = [1, 4, 3, 7, 5, 8, 6, 9, 10]

export default function (validation, rule, condition, rootData) {
    let value = validation.data[validation.name];
    const title = dataStorage.translate(validation.schema.title || validation.name).split(' ').map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(' ')
    const listEmpty = validation.listEmpty;
    let reg;
    switch (rule) {
        case 'required':
            if (typeof condition === 'function') {
                if (!condition(validation.data, rootData)) return '';
            }
            if (Array.isArray(value) && value.length === 1) value = value[0]
            if (typeof value === 'string') value = value.trim()
            return (listEmpty ? listEmpty.includes(value) : !value) ? stringFormatVar(dataStorage.translate('lang_form_error_require'), title) : '';
        case 'number':
            return (!value || /^[0-9]*$/.test(value)) ? '' : stringFormatVar(dataStorage.translate('lang_form_number'), title, condition);
        case 'min':
            reg = new RegExp('^[\\d\\D]{' + condition + ',}$');
            return !value || reg.test(value) ? '' : stringFormatVar(dataStorage.translate('lang_form_error_min'), title, condition);
        case 'max':
            let ruleValueMax = condition;
            if (typeof condition === 'function') ruleValueMax = condition(validation.data)
            if (!ruleValueMax) return ''
            reg = new RegExp('^[\\d\\D]{0,' + (ruleValueMax) + '}$');
            return !value || reg.test(value) ? '' : stringFormatVar(dataStorage.translate('lang_form_error_max'), title, ruleValueMax);
        case 'first_name_middle_name_lenght':
            let firstName = validation.data[FIELD.FIRST_NAME_ON_CARD] || ''
            let middleName = validation.data[FIELD.MIDDLE_NAME_ON_CARD] || ''
            let lengthValue = condition(validation.data)
            if (!lengthValue) return '';
            if ((firstName + middleName).length > lengthValue) return stringFormatVar(dataStorage.translate('lang_form_error_exceed'), lengthValue);
            return ''
        case 'between':
            let ruleValueBtw = condition + ''
            if (typeof condition === 'function') ruleValueBtw = condition(validation.data)
            if (!ruleValueBtw.length) return ''
            const n = ruleValueBtw.split(',');
            reg = new RegExp('^[\\d\\D]{' + (n[0] || 0) + ',' + (n[1] || '') + '}$');
            return !value || reg.test(value) ? '' : stringFormatVar(dataStorage.translate('lang_form_error_between'), title, n[0], n[1]);
        case 'email':
            if (value && Validator.EMAIL.regex.test(value)) {
                return '';
            }
            return value ? stringFormatVar(dataStorage.translate('lang_form_error_invalid'), title) : ''
        case 'phone':
            const list = value && value.split('|')
            if (!list || !list[1]) return ''
            if (list[1] && Validator.PHONE.regex.test(list[1])) return ''
            return stringFormatVar(dataStorage.translate('lang_form_error_phone'), title)
        case 'custom':
            if (typeof condition === 'function') return condition(value);
            return '';
        case 'tfn':
            if (isNaN(Number(value)) || !value) return ''
            if ((value + '').length === 9) {
                let identifierDigits = Array.from((value + ''), (v) => Number(v))
                let checkSum = identifierDigits.reduce((acc, cur, i) => {
                    let sumDigit = cur * MULTI_TFN[i]
                    return acc + sumDigit
                }, 0) % 11;
                if (checkSum !== 0) return stringFormatVar(dataStorage.translate('lang_form_error_invalid'), title)
                return ''
            } else {
                return stringFormatVar(dataStorage.translate('lang_form_error_invalid'), title)
            }

        case 'only_text_and_special_characters':
            return (!value || /^[A-Za-z\s'-]*$/.test(value)) ? '' : stringFormatVar(dataStorage.translate('lang_form_error_invalid'), title, condition);
        case 'special_characters':
            return (!value || /^[A-Za-z0-9\s'-]*$/.test(value)) ? '' : stringFormatVar(dataStorage.translate('lang_form_error_invalid'), title, condition);
        case 'date':
            if (value === '') return ''
            let format = 'DD/MM/YYYY'
            if (validation.data && validation.data[FIELD.CARD_COLOUR] === CARD_COLOUR.GREEN) {
                format = 'MM/YYYY'
            } else if (validation.data && (validation.data[FIELD.CARD_COLOUR] === CARD_COLOUR.BLUE || validation.data[FIELD.CARD_COLOUR] === CARD_COLOUR.YELLOW)) {
                format = 'DD/MM/YY'
            }
            const error = checkValidDateInput(value, format, validation.schema.limit, validation.schema.title, validation.schema.errorText)
            return error || ''
        case 'calling_code':
            if (value && /^([a-z]{2}\|)?[0-9+\s\-()]*$/.test(value)) return ''
            return value ? stringFormatVar(dataStorage.translate('lang_form_error_invalid'), title) : '';
        case 'calling_code_required':
            const phoneNumber = value && value.split('|') && value.split('|')[1]
            if (!phoneNumber) return stringFormatVar(dataStorage.translate('lang_form_error_require'), title)
            return ''
        case 'calling_code_btw':
            const arr = (condition + '').split(',');
            reg = new RegExp('^([a-z]{2}\\|)([\\d\\D]{' + (arr[0] || 0) + ',' + (arr[1] || '20') + '})?$');
            return !value || reg.test(value) ? '' : stringFormatVar(dataStorage.translate('lang_form_error_between'), title, arr[0], arr[1]);
        case 'password':
            return !value || (/[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value) && /.{8,}/.test(value)) ? '' : stringFormatVar(dataStorage.translate('lang_form_error_invalid'), title);
        case 'passport':
            if (validation.data.type !== 'PASSPORT') return ''
            return (!value || /^[a-z]{1,2}[0-9]{7}$/i.test(value)) ? '' : stringFormatVar(dataStorage.translate('lang_form_error_invalid'), title)
        case 'drive_license':
            if (validation.data.type !== 'DRIVER_LICENSE') return ''
            return (!value || /^[a-z0-9]{0,10}$/i.test(value)) ? '' : stringFormatVar(dataStorage.translate('lang_form_error_invalid'), title)
        case 'medicare':
            if (validation.data.type !== 'MEDICARE_CARD') return ''
            if (isNaN(Number(value))) return stringFormatVar(dataStorage.translate('lang_form_error_invalid'), title)
            if (typeof value === 'string' && value.length && value.length === 10) {
                if (/[^2-6]/.test(value[0])) return stringFormatVar(dataStorage.translate('lang_form_error_invalid'), title)
                let identifierDigits = Array.from(value, (v) => Number(v)).splice(0, 8)
                let checkSum = identifierDigits.reduce((acc, cur, i) => {
                    let sumDigit = cur * MUTIL_NUMBER_MEDICARE[i]
                    return acc + sumDigit
                }, 0) % 10;
                if (Number(value[8]) !== checkSum) return stringFormatVar(dataStorage.translate('lang_form_error_invalid'), title)
                return ''
            } else {
                return stringFormatVar(dataStorage.translate('lang_form_error_invalid'), title)
            }
        case 'maxSize':
            const maxSize = condition * 1024 * 1024
            if (validation.dom.parentNode.querySelector('input').files.length && validation.dom.parentNode.querySelector('input').files[0].size > maxSize) {
                reg = new RegExp('^[\\d\\D]{0,' + (maxSize) + '}$');
                return stringFormatVar(dataStorage.translate('lang_form_error_max_size'), title, condition);
            } else return ''
        case 'fileType':
            let accept = []
            if (condition === 'image') accept = ['jpeg', 'jpg', 'png', 'raw', 'gif', 'bmp', 'tif', 'tiff']
            if (condition === 'image photo') accept = ['jpeg', 'jpg', 'png']
            if (validation.dom.parentNode.querySelector('input').files.length) {
                const value = validation.dom.parentNode.querySelector('input').files[0].name.split('.')
                let pass = 0
                value.forEach(e => {
                    if (accept.includes(e.toLowerCase())) pass += 1
                });
                if (pass === 0) return stringFormatVar(dataStorage.translate('lang_form_error_file_type'), title, condition);
                // if (!accept.includes(value[1])) return stringFormatVar(dataStorage.translate('lang_form_error_file_type'), title, condition.toUpperCase());
            }
    }
}
