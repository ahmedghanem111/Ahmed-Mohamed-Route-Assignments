"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
class Storage {
    items = [];
    addItem(item) {
        this.items.push(item);
    }
    removeItem(index) {
        this.items.splice(index, 1);
    }
    getAllItems() {
        return this.items;
    }
}
exports.Storage = Storage;
