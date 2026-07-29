import { Note } from "./Note";

export class NoteBook {

  private notes: Note[] = [];

  addNote(note: Note): void {
    this.notes.push(note);
  }

  removeNote(id: number): void {
    this.notes = this.notes.filter(note => note.id !== id);
  }

  showNotes(): void {
    console.log(this.notes);
  }

}