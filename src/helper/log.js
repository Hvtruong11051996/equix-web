import { exception } from 'react-ga';
import { sendLogToServer } from './functionUtils'
const info = (...arg) => {
    console.info(...arg);
}
const error = (...arg) => {
    console.error(...arg);
}
const warn = (...arg) => {
    sendLogToServer(...arg);
    console.warn(...arg);
}
const log = (...arg) => {
    console.log(...arg);
    sendLogToServer(...arg);
}

const sendLog = (...arg) => {
    sendLogToServer(...arg);
}
const sendLogError = (...arg) => {
    sendLogToServer(...arg, 'error');
}

export default {
    info,
    error,
    warn,
    log,
    sendLogError,
    sendLog
}
