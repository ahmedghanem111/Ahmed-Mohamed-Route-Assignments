"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const User_1 = require("./User");
class Admin extends User_1.User {
    manageNotes() {
        console.log("Admin is managing notes...");
    }
}
exports.Admin = Admin;
