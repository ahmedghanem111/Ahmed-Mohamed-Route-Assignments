"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteBook = void 0;
class NoteBook {
    notes = [];
    addNote(note) {
        this.notes.push(note);
    }
    removeNote(id) {
        this.notes = this.notes.filter(note => note.id !== id);
    }
    showNotes() {
        console.log(this.notes);
    }
}
exports.NoteBook = NoteBook;
