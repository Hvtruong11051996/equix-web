let eventKey;

function init() {
  if (eventKey) return;
  const keys = {
    hidden: 'visibilitychange',
    webkitHidden: 'webkitvisibilitychange',
    mozHidden: 'mozvisibilitychange',
    msHidden: 'msvisibilitychange'
  };

  for (const key in keys) {
    if (key in document) {
      eventKey = keys[key];
      break;
    }
  }
}

export function subcribe(fnCb) {
  document.addEventListener(eventKey, fnCb);
}
export function unsubcribe(fnCb) {
  document.removeEventListener(eventKey, fnCb);
}

init();
