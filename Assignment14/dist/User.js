"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    id;
    name;
    email;
    password;
    phone;
    _age;
    constructor(id, name, email, password, phone, age) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this._age = age;
    }
    set age(value) {
        if (value < 18 || value > 60) {
            throw new Error("Age must be between 18 and 60");
        }
        this._age = value;
    }
    get age() {
        return this._age;
    }
    displayInfo() {
        console.log(`
    Id: ${this.id}
    Name: ${this.name}
    Email: ${this.email}
    Phone: ${this.phone}
    Age: ${this.age}
    `);
    }
    notebooks = [];
    addNotebook(notebook) {
        this.notebooks.push(notebook);
    }
}
exports.User = User;
