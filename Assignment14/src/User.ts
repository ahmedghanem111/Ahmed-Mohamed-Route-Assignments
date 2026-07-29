import { NoteBook } from "./Notebook";

export class User {
  public id: number;
  public name: string;
  public email: string;
  private password: string;
  protected phone: string;
  private _age: number;

  constructor(
    id: number,
    name: string,
    email: string,
    password: string,
    phone: string,
    age: number
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this._age = age;
  }

  set age(value: number) {
    if (value < 18 || value > 60) {
      throw new Error("Age must be between 18 and 60");
    }
    this._age = value;
  }

  get age() {
    return this._age;
  }

  displayInfo(): void {
    console.log(`
    Id: ${this.id}
    Name: ${this.name}
    Email: ${this.email}
    Phone: ${this.phone}
    Age: ${this.age}
    `);
    }
    public notebooks: NoteBook[] = [];

    addNotebook(notebook: NoteBook) {
        this.notebooks.push(notebook);
    }
}