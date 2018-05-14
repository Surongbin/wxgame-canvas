export default class DataStore {
    constructor () {
        this.map = new Map();
    }
    put (key, value) {
        if (typeof value === 'function') {
            value = new value();
        }
        this.map.set(key, value);
        return this;
    }
    get (key) {
        return this.map.get(key);
    }
    destroy () {
        for (let value of this.map.values()) {
            value = null;
        }
    }
    static getInstance () {
        if (!DataStore.instance) {
            DataStore.instance = new DataStore();
        }
        return DataStore.instance;
    }
}
