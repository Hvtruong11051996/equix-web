export default class WebWorker {
  constructor(worker, name) {
    const code = worker.toString();
    const blob = new Blob(['(' + code + ')()']);
    return new Worker(URL.createObjectURL(blob), {
      name
    });
  }
}
