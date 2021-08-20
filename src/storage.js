export const storage = {
    emitter: {}
}

export const func = {
    setStore: (name, emitter) => {
        storage.emitter[name] = emitter;
    },
    getStore: (name) => {
        return storage.emitter[name];
    },
    emitter: (name, eventName, data) => {
        const emit = func.getStore(name);
        emit && emit.emit(eventName, data);
    }
}
