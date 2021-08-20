import WebWorker from '../workerSetup';
import uuidv4 from 'uuid/v4';
// const dicWorkers = {};
let worker = null;
export default class WebWorkers {
    constructor(workerFile, name) {
        this.id = uuidv4();
        // this.worker = worker;
        // if (!worker) {
        //     worker = new WebWorker(workerFile);
        //     this.worker = worker;
        // }
        this.executeTask = this.executeTask.bind(this);
        this.worker = new WebWorker(workerFile, name);
        // dicWorkers[this.id] = this.worker;
    }

    executeTask(data, callback, terminate = true) {
        this.worker && this.worker.addEventListener('message', event => {
            // console.log('event.data.length: ', event.data)
            callback(event.data)
            // eslint-disable-next-line no-unused-expressions
            terminate ? this.terminate() : null;
        });
        this.worker && this.worker.postMessage(JSON.stringify(data));
    }
    terminate() {
        this.worker && this.worker.terminate();
    }
}
