import moment from 'moment-timezone';
import dataStorage from '../../../dataStorage';
const dateTimeDefault = () => {
    return moment(moment().tz(dataStorage.timeZone)).subtract(3, 'days');
}

export function handleChangeDatePicker(frequency, date, type, oldTime) {
    let dateTime = {};
    let tspDate = new Date(date).getTime()
    let oldRangeFrom = new Date(oldTime.fromDate).getTime()
    let oldRangeTo = new Date(oldTime.toDate).getTime()
    switch (type) {
        case 'from':
            if (frequency === 'Weekly') {
                if ((oldRangeFrom <= tspDate) && (tspDate <= oldRangeTo)) {
                    let monday = setInitMondayDate(date)
                    dateTime = {
                        fromDate: monday,
                        toDate: oldTime.toDate
                    }
                    return dateTime;
                } else {
                    return setDatePickerDefault(date, null, oldTime)
                }
            } else if (frequency === 'Monthly') {
                if ((oldRangeFrom <= tspDate) && (tspDate <= oldRangeTo)) {
                    let start = getStartMonth(date)
                    return dateTime = {
                        fromDate: start,
                        toDate: oldTime.toDate
                    }
                } else {
                    return setInitMonthlyFromDate(date, null, oldTime)
                }
            } else if (frequency === 'Daily') {
                if ((oldRangeFrom <= tspDate) && (tspDate <= oldRangeTo)) {
                    let start = date
                    return dateTime = {
                        fromDate: start,
                        toDate: oldTime.toDate
                    }
                } else {
                    return setInitDailyFromDate(date, null, oldTime)
                }
            } else if (frequency === 'Yearly') {
                if ((oldRangeFrom <= tspDate) && (tspDate <= oldRangeTo)) {
                    let start = getStartOfYearly(date)
                    let endDay = moment(oldTime.toDate).endOf('year');
                    let currentDay = moment(dateTimeDefault());
                    let tspEndDay = new Date(moment(endDay)).getTime();
                    let tspcurrentDay = new Date(moment(currentDay)).getTime()
                    if (tspEndDay > tspcurrentDay) endDay = currentDay;
                    return dateTime = {
                        fromDate: start,
                        toDate: endDay
                    }
                } else {
                    return setInitYearlyFrom(date, null, oldTime)
                }
            }
            break;
        case 'to':
            if (frequency === 'Weekly') {
                if ((oldRangeFrom <= tspDate) && (tspDate <= oldRangeTo)) {
                    let fridayOfWeek = setInitFridayDate(date).day;
                    let tspCurrentDay = new Date(moment(dateTimeDefault())).getTime();
                    let tspFridayOfWeek = new Date(moment(fridayOfWeek)).getTime();
                    if (tspFridayOfWeek > tspCurrentDay) fridayOfWeek = moment(dateTimeDefault())
                    return dateTime = {
                        fromDate: oldTime.fromDate,
                        toDate: fridayOfWeek
                    }
                } else {
                    return setInitWeeklyTo(date, oldTime)
                }
            } else if (frequency === 'Monthly') {
                if ((oldRangeFrom <= tspDate) && (tspDate <= oldRangeTo)) {
                    let endOfMonth = moment(date).endOf('month');
                    let tspCurrentDay = new Date(moment(dateTimeDefault())).getTime();
                    let tspEndOfMonth = new Date(moment(endOfMonth)).getTime();
                    if (tspEndOfMonth > tspCurrentDay) endOfMonth = moment(dateTimeDefault())
                    return dateTime = {
                        fromDate: oldTime.fromDate,
                        toDate: endOfMonth
                    }
                } else {
                    return setInitMonthlyToDate(date, oldTime)
                }
            } else if (frequency === 'Daily') {
                if ((oldRangeFrom <= tspDate) && (tspDate <= oldRangeTo)) {
                    let end = date
                    return dateTime = {
                        fromDate: oldTime.fromDate,
                        toDate: end
                    }
                } else {
                    return setInitDailyToDate(date, oldTime)
                }
            } else if (frequency === 'Yearly') {
                if ((oldRangeFrom <= tspDate) && (tspDate <= oldRangeTo)) {
                    let endOfYear = moment(date).endOf('year');
                    let tspCurrentDay = new Date(moment(dateTimeDefault())).getTime();
                    let tspEndOfYear = new Date(moment(endOfYear)).getTime();
                    if (tspEndOfYear > tspCurrentDay) endOfYear = moment(dateTimeDefault())
                    return dateTime = {
                        fromDate: oldTime.fromDate,
                        toDate: endOfYear
                    }
                } else {
                    return setInitYearlyToDate(date, oldTime)
                }
            }
            break;
    }
}

export function getStartMonth(time) {
    return moment(time).startOf('month')
}

export function getEndMonth(time) {
    return moment(time).endOf('month')
}

export function getStartOfYearly(time) {
    return moment(time).startOf('year')
}

export function setInitMondayDate(fromDate) {
    let choiseDate = fromDate;
    const dayOfMonth = choiseDate.date()
    let dayOfWeek = choiseDate.weekday()
    if (dayOfWeek === 1) return fromDate;
    if (dayOfWeek === 0) dayOfWeek = 7;
    let monday = moment(fromDate).set('date', (dayOfMonth - dayOfWeek + 1));
    return monday
}

export function setInitFridayDate(toDate) {
    const choiseDate = toDate;
    const dayOfMonth = choiseDate.date();
    let dayOfWeek = choiseDate.weekday();
    let day = null;
    if (dayOfWeek === 5) {
        day = toDate;
        return {
            day: day,
            larger: false
        };
    } else {
        if (dayOfWeek === 0) dayOfWeek = 7;
        day = moment(toDate).set('date', (dayOfMonth - dayOfWeek + 5));
        let tspCurrentDay = new Date(moment(dateTimeDefault()));
        let tspdayOfWeek = new Date(day);
        if (tspdayOfWeek > tspCurrentDay) {
            day = moment(dateTimeDefault());
            return {
                day: day,
                larger: true
            };
        }
        return {
            day: day,
            larger: false
        };
    }
}

export function setInitDailyFromDate(toFromDefault, field, oldTime) {
    let dateTime = {};
    let fromDate = moment(toFromDefault);
    let toDate = moment(oldTime.toDate);
    let subStractToDate = moment(toDate).subtract(29, 'days');
    let tspFromDate = new Date(moment(fromDate)).getTime();
    let tspSubStractToDate = new Date(moment(subStractToDate)).getTime();
    if (field && field === 'Daily') {
        fromDate = moment(dateTimeDefault());
        toDate = moment(dateTimeDefault());
    } else {
        if (tspFromDate < tspSubStractToDate) toDate = moment(fromDate).add(29, 'days')
    }
    return dateTime = {
        fromDate: fromDate,
        toDate: toDate
    }
}

export function setInitDailyToDate(toDateDefault, oldTime) {
    let dateTime = {};
    let fromDate = moment(oldTime.fromDate);
    let tspCheckDailyToDate = new Date(moment(fromDate).add(29, 'days'));
    let toDate = moment(toDateDefault);
    let tspToDate = new Date(moment(toDate)).getTime();
    if (tspCheckDailyToDate < tspToDate) fromDate = moment(toDate).subtract(29, 'days')
    return dateTime = {
        fromDate: fromDate,
        toDate: toDate
    }
}

export function setDatePickerDefault(toDateDefault, field, oldTime) {
    let dateTime = {};
    let objSetFriday = setInitFridayDate(oldTime.toDate)
    let fromDate = null
    let toDate = objSetFriday.day
    let afterSubtract = moment(toDate).subtract(25, 'weeks');
    let tspCurrentToDay = new Date(moment(oldTime.toDate)).getTime();
    let firstDayOfWeek = setInitMondayDate(toDateDefault);
    let tspFromDayChoise = new Date(moment(firstDayOfWeek)).getTime();
    let tspAfterSubtract = new Date(moment(afterSubtract)).getTime()
    let tspSetFriday = new Date(moment(toDate)).getTime();
    if (field && field === 'Weekly') {
        fromDate = setInitMondayDate(dateTimeDefault())
        toDate = setInitFridayDate(dateTimeDefault()).day;
    } else if (tspFromDayChoise > tspAfterSubtract) {
        fromDate = firstDayOfWeek;
        if (tspSetFriday > tspCurrentToDay) toDate = moment(oldTime.toDate);
    } else if (objSetFriday.larger === false) {
        fromDate = firstDayOfWeek;
        toDate = setInitFridayDate(moment(fromDate).add(25, 'weeks')).day;
    } else if (objSetFriday.larger === true) {
        fromDate = firstDayOfWeek;
        toDate = setInitFridayDate(moment(fromDate).add(25, 'weeks')).day;
    }
    dateTime = {
        fromDate: fromDate,
        toDate: toDate
    }
    return dateTime;
}

export function setInitWeeklyTo(time, oldTime) {
    let dateTime = {};
    let weekStartDate = setInitMondayDate(moment(oldTime.fromDate));
    let maxWeekToDate = moment(weekStartDate).add(25, 'week')
    let weekToDate = setInitFridayDate(moment(time)).day;
    let tspMaxWeekToDate = new Date(moment(maxWeekToDate)).getTime();
    let tspCurrentDay = new Date(moment(dateTimeDefault())).getTime();
    let tspWeekDate = new Date(moment(weekToDate)).getTime();
    if (tspWeekDate > tspCurrentDay) weekToDate = moment(dateTimeDefault());
    let tspCheckWeekToDate = new Date(moment(weekToDate)).getTime();
    if (tspMaxWeekToDate < tspCheckWeekToDate) weekStartDate = setInitMondayDate(moment(weekToDate).subtract(25, 'week'))
    return dateTime = {
        fromDate: weekStartDate,
        toDate: weekToDate
    }
}

export function setInitMonthlyFromDate(fromDate, field, oldTime) {
    let dateTime = {};
    let getTo = null
    let toDate = oldTime.toDate;
    let minSubStractToDate = moment(toDate).subtract(11, 'month');
    let fromDateStart = getStartMonth(fromDate);
    let tspMinSubStractToDate = new Date(minSubStractToDate).getTime()
    let tspFromDateStart = new Date(fromDateStart).getTime();
    if (field && field === 'Monthly') {
        fromDate = moment(dateTimeDefault()).set('date', 1);
        getTo = moment(dateTimeDefault())
    } else if (tspFromDateStart < tspMinSubStractToDate) {
        getTo = getEndMonth(moment(fromDateStart).add(11, 'month'))
    } else {
        getTo = toDate;
    }
    dateTime = {
        fromDate: fromDateStart,
        toDate: getTo
    }
    return dateTime;
}

export function setInitMonthlyToDate(time, oldTime) {
    let dateTime = {};
    let monthStartDate = moment(oldTime.fromDate).startOf('month');
    let maxMonthToDate = moment(monthStartDate).add(11, 'month')
    let monthToDate = moment(time).endOf('month');
    let tspMaxMonthToDate = new Date(moment(maxMonthToDate)).getTime();
    let tspCurrentDay = new Date(moment(dateTimeDefault())).getTime();
    let tspMonthDate = new Date(moment(monthToDate)).getTime();
    if (tspMonthDate > tspCurrentDay) monthToDate = moment(dateTimeDefault());
    let tspCheckMonthToDate = new Date(moment(monthToDate)).getTime();
    if (tspMaxMonthToDate < tspCheckMonthToDate) monthStartDate = moment(monthToDate).subtract(11, 'month').startOf('month')
    dateTime = {
        fromDate: monthStartDate,
        toDate: monthToDate
    }
    return dateTime;
}

export function setInitYearlyFrom(time, field, oldTime) {
    let dateTime = {};
    let yearStart = moment(time).startOf('year');
    let yearTo = oldTime.toDate;
    let minYearFrom = moment(yearTo).subtract(11, 'year');
    let tspMinYearFrom = new Date(moment(minYearFrom)).getTime();
    let tspYearFromChoise = new Date(moment(yearStart)).getTime();
    if (field && field === 'Yearly') {
        yearStart = moment(dateTimeDefault()).startOf('year');
        yearTo = moment(dateTimeDefault());
    } else if (tspYearFromChoise < tspMinYearFrom) {
        yearTo = moment(yearStart).add(11, 'year').endOf('year');
        let checkYearToDay = new Date(moment(yearTo)).getTime();
        let checkCurrentDay = new Date(moment(dateTimeDefault())).getTime;
        if (checkYearToDay > checkCurrentDay) yearTo = moment(dateTimeDefault());
    }
    dateTime = {
        fromDate: yearStart,
        toDate: yearTo
    }
    return dateTime;
}

export function setInitYearlyToDate(time, oldTime) {
    let dateTime = {};
    let yearStartDate = moment(oldTime.fromDate).startOf('year');
    let maxYearToDate = moment(yearStartDate).add(11, 'year')
    let yearToDate = moment(time).endOf('year');
    let tspMaxYearToDate = new Date(moment(maxYearToDate)).getTime();
    let tspCurrentDay = new Date(moment(dateTimeDefault())).getTime();
    let tspYearToDate = new Date(moment(yearToDate)).getTime();
    if (tspYearToDate > tspCurrentDay) yearToDate = moment(dateTimeDefault());
    let tspCheckYearToDate = new Date(moment(yearToDate)).getTime();
    if (tspMaxYearToDate < tspCheckYearToDate) yearStartDate = moment(yearToDate).subtract(11, 'year').startOf('year')
    dateTime = {
        fromDate: yearStartDate,
        toDate: yearToDate
    }
    return dateTime
}

export function setInitYearlyDate(time, oldTime) {
    let dateTime = {};
    let yearStart = moment(time).startOf('year');
    let yearTo = oldTime.toDate;
    let minYearFrom = moment(yearTo).subtract(11, 'year');
    let tspMinYearFrom = new Date(moment(minYearFrom)).getTime();
    let tspYearFromChoise = new Date(moment(yearStart)).getTime();
    if (field && field === 'Yearly') {
        yearStart = moment(dateTimeDefault()).startOf('year');
        yearTo = moment(dateTimeDefault());
    } else if (tspYearFromChoise < tspMinYearFrom) {
        yearTo = moment(yearStart).add(11, 'year').startOf('year');
        let checkYearToDay = new Date(moment(yearTo)).getTime();
        let checkCurrentDay = new Date(moment(dateTimeDefault())).getTime();
        if (checkYearToDay > checkCurrentDay) yearTo = moment(dateTimeDefault());
    }
    dateTime = {
        fromDate: yearStart,
        toDate: yearTo
    }
    return dateTime;
}

export function getLastYearDate(time) {
    return moment(time).endOf('year')
}

export function getFirstMondayForMonth(monthMoment) {
    var first = monthMoment.startOf('month').startOf('days');
    switch (first.day()) {
        case 2:
            return first.subtract(1, 'days');
        default:
            return first.subtract(first.day() + 2, 'days');
    }
}

export function getLastFridayForMonth(monthMoment) {
    var lastDay = monthMoment.endOf('month').startOf('day');
    switch (lastDay.day()) {
        case 6:
            return lastDay.subtract(1, 'days');
        default:
            return lastDay.subtract(lastDay.day() + 2, 'days');
    }
}

export function checkTspFromWithFrequency(checkDate, date) {
    let tspCheckDate = new Date(checkDate).getTime()
    let tspDate = new Date(date).getTime()
    if (tspCheckDate < tspDate) return checkDate;
    return date;
}

export function checkTspToWithFrequency(checkDate, date) {
    let tspCheckDate = new Date(checkDate).getTime()
    let tspDate = new Date(date).getTime()
    if (tspCheckDate < tspDate) return date;
    return checkDate;
}

export function getDatePickerFrom(fromDateDefault) {
    let dateTime = {};
    let objSetMonday = setInitMondayDate(fromDateDefault)
    let fromDate = null
    let toDate = objSetMonday.day
    let afterSubtract = moment(toDate).add(25, 'weeks')
    fromDate = setInitFridayDate(afterSubtract);
    dateTime = {
        toDate: toDate,
        fromDate: fromDate
    }
    return dateTime
}

export function changeDateWithFrequence(field = 'Weekly', oldTime) {
    let dateTime = {};
    switch (field) {
        case 'Weekly': dateTime = setDatePickerDefault(dateTimeDefault(), field, oldTime)
            break;
        case 'Daily': dateTime = setInitDailyFromDate(dateTimeDefault(), field, oldTime)
            break;
        case 'Monthly': dateTime = setInitMonthlyFromDate(dateTimeDefault(), field, oldTime)
            break;
        case 'Yearly': dateTime = setInitYearlyFrom(dateTimeDefault(), field, oldTime)
            break;
    }
    return dateTime;
}
