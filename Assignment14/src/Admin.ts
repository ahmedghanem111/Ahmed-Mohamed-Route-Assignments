import { User } from "./User";

export class Admin extends User {

  manageNotes() {
    console.log("Admin is managing notes...");
  }

}