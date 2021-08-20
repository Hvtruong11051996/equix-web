module.exports = function (cb) {
    let outer = document.getElementById('prompt');
    if (!outer) {
        outer = document.createElement('div');
        outer.id = 'prompt';
    }
    outer.className = 'popUpLogout myShow popup';
    outer.innerHTML = '';

    const div = document.createElement('div');
    div.className = 'size--3'
    outer.appendChild(div);
    const input = document.createElement('input');
    div.appendChild(input);
    const save = document.createElement('div');
    save.innerText = 'Save';
    save.className = 'size--3'
    save.onclick = function () {
      document.removeEventListener('keyup', enter);
      cb(input.value);
      document.body.removeChild(outer);
    };
    const cancel = document.createElement('div');
    cancel.innerText = 'Cancel';
    cancel.onclick = function () {
        document.body.removeChild(outer);
    };
    const group = document.createElement('div');
    group.className = 'button-group';
    group.appendChild(save);
    group.appendChild(cancel);
    div.appendChild(group);
    document.body.appendChild(outer);
    function enter(event) {
      if (event.keyCode === 13) {
        save.click();
      }
    }
    input.focus();
    document.addEventListener('keyup', enter);
};
