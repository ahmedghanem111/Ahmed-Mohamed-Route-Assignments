"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = void 0;
class Note {
    id;
    title;
    content;
    user;
    constructor(id, title, content, user) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.user = user;
    }
    preview() {
        return this.content.substring(0, 20) + "...";
    }
}
exports.Note = Note;
