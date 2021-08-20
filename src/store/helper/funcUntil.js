import moment from 'moment';
import EnumLink from '../../constants/event_name_link';
import logger from '../../helper/log';
import _ from 'underscore';
moment.locale && moment.locale('en');

export function formatNumberNew2(input, decimal) {
    try {
        if (input === null || isNaN(input) || input === undefined) {
            return '--';
        }
        if (parseFloat(input) === 0 || input === '') {
            return '0';
        }
        if (decimal == null) {
            if (parseFloat(input) >= 2) {
                input = roundFloat(input, 2);
            } else {
                input = roundFloat(input, 3);
            }
        } else {
            input = roundFloat(input, decimal);
        }
        input = input
            .toString()
            .split('.');
        input[0] = input[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        return input.join('.');
    } catch (ex) {
        logger.error(ex);
    }
}
export function convertFormatToNumber(stringNumberInput) {
    if (isNullOrEmpty(stringNumberInput)) {
        return stringNumberInput;
    }

    let stringNumber = stringNumberInput;

    if (typeof stringNumberInput !== 'string') {
        stringNumber = stringNumberInput.toString();
    }

    stringNumber = stringNumber.replace('$', '');
    stringNumber = stringNumber.replace('%', '');
    // le.bui dung dai ka nao xoa ham nay cua e di nha :(
    try {
        if (isNullOrEmpty(stringNumber)) {
            return 0;
        }
        if (isNaN(stringNumber)) {
            if (typeof stringNumber !== 'string') {
                stringNumber = stringNumber.toString();
            }
            var stringNumberTemp = stringNumber.replace(/,/gi, '');
            if (isNaN(stringNumberTemp)) {
                stringNumberTemp = stringNumberTemp.replace(/\(/gi, ''); // truong hop nay khi string duoc format thanh dang () se la so am nen se cong them dau -
                stringNumberTemp = stringNumberTemp.replace(/\)/gi, '');
                stringNumberTemp = '-' + stringNumberTemp;
                return parseFloat(stringNumberTemp);
            }
            return parseFloat(stringNumberTemp);
        }
        return parseFloat(stringNumber);
    } catch (e) {
        logger.error(e);
    }
    return 0;
}
function isNullOrEmpty(data) {
    if (_.isNull(data)) {
        return true;
    }
    if (data === undefined) {
        return true;
    }
    let output = data;
    if (typeof output === 'string') { //
    } else {
        output = output.toString();
    }
    output = output.trim();

    return output.length <= 0;
}
export function roundFloat(numberFloat, lenght) {
    try {
        if (numberFloat == null || lenght == null) {
            return 0;
        }
        // let itenDivison = '1';
        // for (let i = 0; i < lenght; i++) {
        //     itenDivison += '0';
        // }
        // const division = Number(itenDivison);
        let numberString = numberFloat + '';
        let arrNumber = numberString.split('.');
        if (!arrNumber[1]) return numberFloat;
        for (let i = 0; i < lenght; i++) {
            if (arrNumber[1][0]) {
                arrNumber[0] += arrNumber[1][0];
                arrNumber[1] = arrNumber[1].substr(1);
            } else {
                arrNumber[0] += '0'
            }
        }
        numberString = arrNumber.join('.');
        arrNumber = Math.round(numberString).toString();
        arrNumber = arrNumber.replace(/^(-?)/, '$1' + '0'.repeat(lenght))
        let result = Number(arrNumber.substring(0, arrNumber.length - lenght) + '.' + arrNumber.substr(-lenght));
        return result
    } catch (e) {
        logger.error(e);
    }
    return 0;
}
export function formatNumberWithText(labelValue) {
    return Math.abs(Number(labelValue)) >= 1.0e+9 ? roundFloat(Number(labelValue) / 1.0e+9, 2) + 'B' : Math.abs(Number(labelValue)) >= 1.0e+6
        ? roundFloat(Number(labelValue) / 1.0e+6, 2) + 'M' : Math.abs(Number(labelValue)) >= 1.0e+3
            ? roundFloat(Number(labelValue) / 1.0e+3, 2) + 'K' : Number(labelValue);
}

export function renderClassColorLink(state) {
    switch (state) {
        case EnumLink.GreenLink:
            return 'greenColor';
        case EnumLink.BlueLink:
            return 'blueColor';
        case EnumLink.OrangeLink:
            return 'orangeColor';
        case EnumLink.VioletLink:
            return 'violetColor';
        case EnumLink.YellowLink:
            return 'yellowColor';
        case EnumLink.BlueSkyLink:
            return 'blueSkyColor';
        default:
            break;
    }
}
