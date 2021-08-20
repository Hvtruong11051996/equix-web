// importScripts('https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.0/axios.min.js')
export default () => {
    self.addEventListener('message', e => { // eslint-disable-line
        // eslint-disable-line no-restricted-globals
        if (!e) return;
        console.log('e: ', e)
        const ws = new WebSocket('ws://10.0.4.56:40510');
        console.log(e)
        const onMessage = (res) => {
            postMessage({ data: res.data });
        }
        ws.onopen = function () {
            console.log('websocket is connected ...')
            ws.send('connected')
        }

        ws.onmessage = onMessage;
    });
};
