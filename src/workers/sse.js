// importScripts('https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.0/axios.min.js')
export default () => {
    let src = location.origin;
    if (src === 'blob://') src = location.pathname.replace(/(^(?:\/\/|[^/]+)*).*$/, '$1');
    importScripts(src + '/lib/EventSource/EventSource.js');
    console.log('self: ', self);
    self.addEventListener('message', e => { // eslint-disable-line
        console.log('SSE ===> WORKER SSE REGISTER');
        // eslint-disable-line no-restricted-globals
        if (!e) return;
        console.log('SSE ===> e: ', e)
        const dataRecive = JSON.parse(e.data);
        const { method, url, data, token } = dataRecive;
        let sub = ''
        let newUrl = ''
        if (url.indexOf('portfolio') > -1) {
            if (url.indexOf('access_token') === -1) {
                if (url.indexOf('account_id') > -1) newUrl = url + `&access_token=${token}`
                else newUrl += url + `?access_token=${token}`
            }
            sub = new self.EventSource(newUrl, {
                withCredentials: false
            })
        } else {
            sub = new self.EventSourcePolyfill(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        }
        const onMessage = (e) => {
            const dataRealtimeTemp = JSON.parse(e.data);
            const keyConvert = {
                1: 'exchange',
                2: 'symbol',
                3: 'ask_price',
                4: 'ask_size',
                5: 'bid_price',
                6: 'bid_size',
                7: 'trade_price',
                8: 'trade_size',
                9: 'open',
                10: 'high',
                11: 'low',
                12: 'close',
                13: 'previous_close',
                14: 'change_point',
                15: 'change_percent',
                16: 'volume',
                17: 'value_traded',
                18: 'updated'
            };
            const dataRealtime = {};

            for (const key in dataRealtimeTemp) {
                const val = dataRealtimeTemp[key];
                const newKey = keyConvert[key];
                if (newKey) {
                    dataRealtime[newKey] = val;
                } else {
                    dataRealtime[key] = val;
                }
            }
            postMessage({ type: 'message', data: dataRealtime });
        }
        const onError = (e) => {
            console.log('SSE ===> WORKER SSE ERROR', e);
            // eslint-disable-next-line no-debugger
            // debugger;
            postMessage({ type: 'error', data: e.message || 'Error' });
        }
        sub.addEventListener('message', onMessage);
        sub.addEventListener('error', onError);
        sub.addEventListener('open', () => {
            console.log('SSE ===> WORKER SSE OPENED');
            postMessage({ type: 'open', data: url });
        });
    });
};
