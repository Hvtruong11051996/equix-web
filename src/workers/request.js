export default () => {
    // importScripts('https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.0/axios.min.js')
    self.addEventListener('message', e => { // eslint-disable-line
        // eslint-disable-line no-restricted-globals
        // console.log('call worker request');
        if (!e) return;
        // console.log('call worker: ', e.data);
        const thenFn = (res) => {
            // console.log('call worker res: ', res);
            postMessage(res);
        }
        const catchFn = (res) => {
            // console.log('call worker res catch: ', res);
            postMessage(res);
        }
        // console.log('==========>axios', axios.get)
        const dataRecive = JSON.parse(e.data);
        const { method, url, data, token, headers } = dataRecive;
        // console.log('url: ', url)
        // console.log('token: ', token)
        // debugger; // eslint-disable-line
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.onerror = function (e) {
            catchFn({ error: 'network_error' })
        };
        // Now set response type
        let response = { response: xhr.response }
        xhr.addEventListener('load', () => {
            const type = xhr.getResponseHeader('Content-Type') || ''
            if (xhr.status === 200) {
                thenFn({ status: 200, data: xhr.response, type })
            }
            if (xhr.status >= 400) {
                catchFn({ status: xhr.status, error: response, type })
            }
        })
        xhr.send();
    });
};
