import axios from 'axios';
import dataStorage from '../dataStorage';
import 'whatwg-fetch';

export function getApiFilter(service, pageId = 1, pageSize = 50) {
  return `${dataStorage.env_config.api.backendBase}/${dataStorage.env_config.api.version}/search/${service}?page_id=${pageId}&page_size=${pageSize}`;
}

export async function requestData(url) {
  return new Promise((resolve, reject) => {
    const path = url;
    const headers = {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Authorization: `Bearer ${dataStorage.accessToken}`
      }
    };
    axios.get(path, headers)
      .then(data => {
        let dataBody = null;
        if (data) {
          dataBody = data.data
        } else {
          dataBody = null;
        }
        resolve(dataBody)
      })
      .catch((errorMessage, statusCode) => {
        // error handling
        reject(errorMessage);
      })
  })
}
