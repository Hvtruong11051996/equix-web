import moment from 'moment';
import logger from '../helper/log'
import dataStorage from '../dataStorage';
export function formatTimeStampToDate(timeStamp) {
    return moment(timeStamp).format('Do MMM YYYY');
}
export function addMonthsToTime(time, months) {
    return moment(time).add(months, 'M').startOf('day').toDate();
}
export function addDaysToTime(time, days) {
    return moment(time).add(days, 'd').startOf('day').toDate();
}
export function getDateOnly(time) {
    return moment(time).startOf('day').toDate();
}
export function getUtcTimeString(time, format = 'DD/MM/YY-HH:mm') {
    return moment.utc(time).format(format)
}
export function getBusinessTimeString(time, format = 'DD/MM/YY-HH:mm') {
    return moment(time).tz(dataStorage.timeZone).format(format)
}
export function getTimeBusinessLog(time, format = 'DD MMM YYYY HH:mm:ss') {
    return moment(time).tz(dataStorage.timeZone).format(format)
}
export function getTimeStampFromDate(time, format = 'DD/MM/YYYY') {
    return moment(time, format).format('X')
}
export function convertToDateWithFormat(datetimeString, format) {
    try {
        return moment(datetimeString, format || 'DD/MM/YYYY-HH:mm').toDate();
    } catch (e) {
        logger.error(e);
    }
    return null;
}
export function convertToDateWithFormatUtc(datetimeString, format) {
    try {
        return moment.utc(datetimeString, format || 'DD/MM/YYYY-HH:mm').toDate();
        // return moment(moment.utc('1.1.2014').format());
        // return moment(datetimeString, format || 'DD/MM/YYYY').local().toDate();
        // return moment(datetimeString, format || 'DD/MM/YYYY').toDate();
    } catch (e) {
        logger.error(e);
    }
    return null;
}

export function getDateStringWithFormat(input, format) {
    if (input == null) return input;
    return moment(input).format(format);
}
export function getTimeZoneString() {
    const TimeZone = moment().format('Z')
    return 'Australia/Sydney'
    // switch (TimeZone) {
    //     // + 0
    //     case '+00:00':
    //         return 'Europe/London';
    //     // +1
    //     case '+01:00':
    //         return 'Europe/Paris';
    //     case '+02:00':
    //         return 'Africa/Johannesburg';
    //     case '+03:00':
    //         return 'Europe/Istanbul';
    //     case '+03:30':
    //         return 'Asia/Tehran';
    //     case '+04:00':
    //         return 'Asia/Dubai';
    //     case '+05:00':
    //         return 'Asia/Ashkhabad';
    //     case '+05:30':
    //         return 'Asia/Kolkata';
    //     case '+05:45':
    //         return 'Asia/Kathmandu';
    //     case '+06:00':
    //         return 'Asia/Almaty';
    //     case '+07:00':
    //         return 'Asia/Bangkok';
    //     case '+08:00 ':
    //         return 'Asia/Shanghai';
    //     case '+09:00':
    //         return 'Asia/Seoul';
    //     case '+09:30':
    //         return 'Australia/Adelaide';
    //     case '+10:00':
    //         return 'Australia/Sydney';
    //     case '+12:45':
    //         return 'Pacific/Chatham';
    //     case '-03:00':
    //         return 'America/Argentina/Buenos_Aires';
    //     case '-04:00':
    //         return 'America/Caracas';
    //     case '-05:00':
    //         return 'America/New_York';
    //     case '-06:00':
    //         return 'America/El_Salvador';
    //     case '-07:00':
    //         return 'America/Phoenix';
    //     case '-08:00':
    //         return 'America/Los_Angeles';
    //     default:
    //         return 'Australia/Sydney';
    // }
}

export function getStandardFormatTime(time) {
    return moment(time).utcOffset('+1100').format('YYYYMMDD h m');
}
export function convertZeroHourLocalToTimeStamp(time, isToDate) {
    const oneDayms = 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000;
    const today = moment().format('YYYYMMDD')
    const date = moment(time).format('YYYYMMDD')
    if (isToDate && today === date) return time;
    if (isToDate && today !== date) return parseInt(moment(date).format('x')) + oneDayms;
    return moment(date).format('x');
}
export function converTimeServerToTimeStamp(time) {
    return moment(time).toDate().getTime()
}
export function converTimeFilterContractNote(time, format = 'DD/MM/YY-HH:mm:ss.sss') {
    return moment(time, format).toDate().getTime()
}
