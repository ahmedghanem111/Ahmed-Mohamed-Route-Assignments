import { User } from "./User";
import { Admin } from "./Admin";
import { Note } from "./Note";
import { NoteBook } from "./Notebook";
import { Storage } from "./Storage";

const user = new User(
    1,
    "Ahmed",
    "ahmed@gmail.com",
    "123456",
    "01000000000",
    22
);

const admin = new Admin(
    2,
    "Admin",
    "admin@gmail.com",
    "admin123",
    "01111111111",
    35
);

const notebook = new NoteBook();
notebook.showNotes();

const note = new Note(
    1,
    "TypeScript",
    "This is my first TypeScript note.",
    user
);

notebook.addNote(note);
user.addNotebook(notebook);

admin.manageNotes();

console.log(note.preview());

user.displayInfo();

const storage = new Storage<string>();

storage.addItem("HTML");
storage.addItem("CSS");
storage.addItem("TypeScript");

console.log(storage.getAllItems());